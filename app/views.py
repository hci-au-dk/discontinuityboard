import datetime, os, string, random, requests
from app import app, db, models, login_manager
from flask import render_template, flash, redirect, request, url_for, \
send_from_directory, make_response, json
from sqlalchemy.exc import IntegrityError
from werkzeug import secure_filename
from util.perspective_transformation import transform_perspective
from PIL import Image
from StringIO import StringIO
from forms import RegisterPiForm, EditPiForm, ConfigurePiForm, LoginPiForm, PhotoViewForm
from flask.ext.login import login_user, current_user, logout_user, login_required
from wtforms.validators import ValidationError

from flask_weasyprint import HTML, render_pdf
from markupsafe import Markup
import socket

if os.name != "nt":
    import fcntl
    import struct


##############################################################
# Routers - View                                             #
##############################################################

@app.route('/')
def entry():
    pvform = PhotoViewForm()
    return render_template('entrypoint.html',
                           title = 'Discontinuity Board',
                           pvform = pvform)


@app.route('/<code>', methods=['GET'])
@app.route('/view/', methods=['GET', 'POST'])
def view(code=None):
    print "VIEW"
    print code
    photo = None
    if (request.method == 'GET' and code is not None) or request.method == 'POST':
        form = PhotoViewForm()
        if request.method == 'GET':
            form.code.data = code
        else:
            form = PhotoViewForm(request.form)

        user = form.get_user()
        if form.validate_login():
            photo = user

    if photo is None:
        return redirect(url_for('entry'))

    # prepare the forms
    pvform = PhotoViewForm()    
    return render_template('discontinuityboard.html',
                           title = 'View | Discontinuity Board',
                           pvform = pvform,
                           user = photo)
    


##############################################################
# Routers - Pi                                               #
##############################################################

@app.route('/pi')
def pi():
    rform = RegisterPiForm()
    cform = ConfigurePiForm()
    lform = LoginPiForm()
    eform = EditPiForm()

    user = None
    if current_user.is_authenticated():
        user = current_user

    return render_template('pi.html',
                           title = 'Pi | Discontinuity Board',
                           rform = rform,
                           cform = cform,
                           lform = lform,
                           eform = eform,
                           user = user)

@app.route('/pi/configure-modal')
def pi_configure():
    return pi()

##############################################################
# Routers - Misc.                                            #
##############################################################

@app.route('/uploads/<filename>')
def send_file(filename):
    basepath = app.root_path + '/' + app.config['UPLOAD_FOLDER']
    return send_from_directory(basepath, filename)

##############################################################
# AJAX Services - Pi                                         #
##############################################################

@app.route('/pi/login/', methods=['POST'])
def pi_login():
    # logout any existing user
    logout_user()
    form = LoginPiForm(request.form)
    if form.validate_on_submit():
        user = form.get_user()
        if form.validate_login():
            login_user(user)
        return redirect(request.args.get("next") or url_for('pi'))
    return redirect(url_for('pi'))

@app.route('/register-pi/', methods=['POST'])
def register_pi():
    form = RegisterPiForm(request.form)
    if request.method == 'POST' and form.validate():
        # Everything is great
        ip = form.ip_address.data
        name = form.human_name.data
        password = form.password.data
        wbw = form.wbwidth.data
        wbh = form.wbheight.data
        wbratio = str(float(wbw) / float(wbh))
        if (models.Pi.query.filter(models.Pi.human_name==form.human_name.data).count() == 0 and
            models.Pi.query.filter(models.Pi.ip==form.ip_address.data).count() == 0):

            # save the pi in the database
            pi = models.Pi(ip=ip, human_name=name, password=password, wbratio=wbratio)
            db.session.add(pi)
            try:
                db.session.commit()
                user = form.get_user()
                login_user(user, remember = True)

                # register this server and name with the pi
                pilocation = 'http://' + ip + '/' + 'register-server'
                payload = {'id': current_user.id}
                r = requests.get(pilocation, params=payload)
            
            except:
                IntegrityError
                db.session.rollback()

        else:
            # TODO: Make a sensible reaction to trying to register a name twice
            print "DUPLICATE USERNAME"
        return redirect(request.args.get("next") or url_for('pi_configure'))

    return redirect(url_for('pi_configure'))

@app.route('/send-location-to-pi/', methods=['GET'])
def send_location():
    # register this server and name with the pi
    pilocation = 'http://' + current_user.ip + '/' + 'register-server'
    payload = {'id': current_user.id}
    r = requests.get(pilocation, params=payload)
    return redirect(url_for('pi'))


@app.route('/edit-pi/', methods=['POST'])
def edit_pi():
    form = EditPiForm(request.form)
    s = ''
    error = ''
    if request.method == 'POST' and form.validate():
        new_ip = form.ip_address.data
        new_name = form.human_name.data
        new_password = form.password.data
        new_width = form.wbwidth.data
        new_height = form.wbheight.data
        pi = form.get_user()
        if pi is not None:
            if len(new_ip) > 0:
                pi.ip = new_ip
            if len(new_name) > 0:
                pi.human_name = new_name
            if len(new_password) > 0:
                pi.password = new_password
            if len(new_width) and len(new_height) is not None:
                wbratio = str(float(new_width) / float(new_height))
                pi.wbratio = wbratio
        try:
            db.session.commit()
        except:
            IntegrityError
            db.session.rollback()
    # get the pi
        flash('Named changed!')
    return redirect(url_for('pi'))

@app.route('/pi/logout/')
@login_required
def pi_logout():
    logout_user()
    return redirect(url_for('pi'))

@app.route('/pi/delete-pi/')
@login_required
def pi_delete():
    pi = models.Pi.query.filter(models.Pi.id==current_user.id).first()
    for photo in pi.photos:
        delete_photo_and_selections(photo)

    # delete config file on the pi
    pilocation = get_pi_base() + 'register-server'
    r = requests.delete(pilocation)

    db.session.delete(pi)
    db.session.commit()
    return redirect(url_for('pi'))

@app.route('/upload/', methods=['POST'])
@login_required
def upload_file():
    filename = None
    returnobj = {}
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            photoid = save_photo(file, filename, False)
            returnobj['id'] = photoid

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/get-all-photos/', methods = ['GET'])
@login_required
def get_all_photos():
    if request.method == 'POST':
        return make_response(400)

    clear_old_photos()
    photos = models.Photo.query.filter(models.Photo.pi_id==current_user.id)
    data = []
    for photo in photos:
        if not photo.raw:
            name = '/uploads/' + os.path.basename(photo.path)
            img = Image.open(photo.path)
            data.append({'path': name, 'id': photo.id, 'code': photo.code,
                         'width': img.size[0], 'height': img.size[1],
                         'time': get_time_left(photo.time_submitted)})

    returnobj = {}
    returnobj["photos"] = data

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'

    return response

@app.route('/delete-photo/', methods = ['GET'])
@login_required
def delete_photo():
    if request.method == 'POST':
        return make_response(400)

    id = request.args.get('id')
    photo = models.Photo.query.filter(models.Photo.id==id).first()

    delete_photo_and_selections(photo)

    returnobj = {}
    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/take-photo/', methods = ['GET'])
@login_required
def take_photo():
    if request.method == 'POST':
        return make_response(400)

    # We need to make a request to the raspberry pi
    raw = True
    pilocation = get_pi_base() + 'rawimage'
    if request.args.get('configured') == 'true':
        pilocation = get_pi_base() + 'snapshot'
        raw = False

    r = requests.get(pilocation)

    img = Image.open(StringIO(r.content))
    if request.args.get('configured') == 'true':
        # flip and correct for aspect ratio of the whiteboard
        img = img.rotate(180)
        ow = img.size[0]
        h = img.size[1]
        w = ow
        if ( (ow / h) != current_user.wbratio):
            # get a new width and height that does
            # always keep the height the same
            w = int(float(current_user.wbratio) * h)

        img = img.resize((w, h))


    # Generate a filename based on timestamp
    now = datetime.datetime.now()
    filename = '%i%i%i_%i%i%i' % (now.year,
                                  now.month,
                                  now.day,
                                  now.hour,
                                  now.minute,
                                  now.second)
    filename = filename + ".jpg"

    photoid = save_photo(img, filename, raw)

    returnobj = {}
    returnobj['id'] = photoid

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/configure/', methods=['POST'])
@login_required
def configure():
    form = ConfigurePiForm()
    if form.validate_on_submit():
        # The coordinates given in the configuration do not map
        # 1 to 1 because the image is natively flipped differently!
        piobj = {}
        w = float(form.cwidth.data)
        h = float(form.cheight.data)
        
        piobj['x0'] = (form.x0.data)
        piobj['y0'] = (form.y0.data)

        piobj['x1'] = (form.x1.data)
        piobj['y1'] = (form.y1.data)

        piobj['x2'] = (form.x2.data)
        piobj['y2'] = (form.y2.data)

        piobj['x3'] = (form.x3.data)
        piobj['y3'] = (form.y3.data)

        pilocation = get_pi_base() + 'configuration'
        headers = {'Content-type': 'application/json'}

        r = requests.post(pilocation, data=json.dumps(piobj), headers=headers)

        returnobj = {}
        if r.status_code == 200:
            returnobj['saved'] = True
        else:
            returnobj['saved'] = False

        #then delete all unconfigured photos from this pi
        pi = models.Pi.query.filter(models.Pi.id==current_user.id).first()
        for photo in pi.photos:
            if photo.raw:
                db.session.delete(photo)
        db.session.commit()

    return redirect(url_for('pi'))


@app.route('/pi-upload/', methods=['POST'])
def pi_upload():
    filename = None
    returnobj = {}
    if request.method == 'POST':
        file = request.files['file']
        pi_id = request.form['id']
        if file and allowed_file(file.filename):
           
            img = Image.open(file)
            # flip and correct for aspect ratio of the whiteboard
            img = img.rotate(180)
            ow = img.size[0]
            h = img.size[1]
            w = ow
            wbratio = models.Pi.query.filter(models.Pi.id==pi_id).first().wbratio
            if ( (ow / h) != wbratio):
                # get a new width and height that does
                # always keep the height the same
                w = int(float(wbratio) * h)

            img = img.resize((w, h))

            filename = secure_filename(file.filename)
            photoid = save_photo(img, filename, False, pi_id, request.form['code'])
            photo = models.Photo.query.filter(models.Photo.id==photoid).first()

            returnobj['timesubmitted'] = photo.time_submitted 
            returnobj['time'] = get_time_left(photo.time_submitted)
            returnobj['code'] = photo.code 
        else:
            return 'Ill-formated request', 400
    else:
        return 'Bad request', 400

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/generate-access-code/', methods=['GET'])
def generate_access_code():
    returnobj = {}
    if request.method == 'GET':
        code = get_new_access_code()
        returnobj['code'] = code 

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response


##############################################################
# AJAX Services - View                                       #
##############################################################

@app.route('/get-photo/', methods = ['GET'])
def get_photo():
    if request.method == 'POST':
        return make_response(400)

    clear_old_photos()
    id = request.args.get('id')
    photo = models.Photo.query.filter(models.Photo.id==id).first()

    # See if the photo does not exist
    returnobj = {}
    if photo is None:
        returnobj['path'] = None
    else:
        name = '/uploads/' + os.path.basename(photo.path)
        img = Image.open(photo.path)
    
        returnobj['path'] = name
        returnobj['id'] = photo.id
        returnobj['width'] = img.size[0]
        returnobj['height'] = img.size[1]
        returnobj['raw'] = photo.raw
        returnobj['notes'] = photo.notes
        returnobj['time'] = get_time_left(photo.time_submitted)

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/make-cut/', methods = ['GET'])
def make_cut():
    # Load the image into a PIL Image first
    photoid = request.args.get('id')
    photo = Image.open(get_photo_path(photoid))

    cropped = photo.copy()
    x1 = int(request.args.get('x1'))
    y1 = int(request.args.get('y1'))
    x2 = int(request.args.get('x2'))
    y2 = int(request.args.get('y2'))
    cropped = cropped.crop((x1, y1,
                            x2, y2))
    # Get the parent
    parent = models.Photo.query.filter(models.Photo.id==photoid).first()
    
    filename = str(x1) + str(y1) + str(x2) + str(y2) + '_' + get_photo_filename(photoid)

    success = save_selection(cropped, filename, parent)

    selection = models.Selection.query.filter(models.Selection.id==success).first()

    name = '/uploads/' + os.path.basename(selection.path)

    returnobj = {}
    returnobj['path'] = name
    returnobj['id'] = selection.id
    returnobj['width'] = cropped.size[0]
    returnobj['height'] = cropped.size[1]

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/save-notes/', methods = ['POST'])
def save_notes():
    returnobj = {}
    if request.method == 'GET':
        return 'Bad request', 400

    id = request.form['id']
    content = request.form['content']

    photo = models.Photo.query.filter(models.Photo.id==id).first()
    photo.notes = content
    db.session.commit()

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/export-notes/', methods = ['GET'])
def export_notes():
    if request.method == 'POST':
        return 'Bad request', 400

    id = request.args.get('id')

    photo = models.Photo.query.filter(models.Photo.id==id).first()
    tmp = render_template('notes.html', notes=Markup(photo.notes))

    response = render_pdf(HTML(string=tmp), download_filename='notes.pdf')

    return response


##############################################################
# Authentication Services                                    #
##############################################################

@login_manager.user_loader
def load_user(userid):
    # Should return None if the user doesn't exist
    return models.Pi.query.get(int(userid))

##############################################################
# Helper Functions                                           #
##############################################################

def clear_old_photos(timespan_days=2):
    now = datetime.datetime.now()
    for photo in models.Photo.query.all():
        delta = now - photo.time_submitted
        if (delta.days >= timespan_days and photo.notes is None):
            delete_photo_and_selections(photo)

def delete_photo_and_selections(photo):
    path = photo.path
    for child in photo.children:
        os.remove(child.path)
        db.session.delete(child)

    db.session.delete(photo)
    db.session.commit()
    os.remove(path)

def get_time_left(time_submitted, timespan_days=2):
    now = datetime.datetime.now()
    delta = now - time_submitted
    # convert timespan_days to seconds
    seconds_allowed = timespan_days * 24 * 60 * 60
    seconds_left = seconds_allowed - delta.total_seconds()
    # return the number of days left
    days_left = seconds_left / 60 / 60 / 24
    return round(days_left, 6)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']

    
def save_photo(file, filename, raw, pi_id=None, code=None):
    savename = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], filename)
    file.save(savename)

    # generate an access code
    if code is None:
        code = get_new_access_code()
    
    # Now, we want to insert it into our database
    if pi_id is None:
        pi_id = current_user.id
    photo = models.Photo(path=savename, raw=raw, time_submitted=datetime.datetime.now(), pi_id=pi_id, code=code)
    db.session.add(photo)
    try:
        db.session.commit()

    except:
        IntegrityError
        db.session.rollback()
    
    photo = models.Photo.query.filter(models.Photo.path==savename).first()
    db.session.close()
    return photo.id

def save_selection(image, filename, parent, comments=None):
    savename = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], filename)
    image.save(savename)
    
    # Now, we want to insert it into our database
    selection = models.Selection(path=savename, parent=parent)
    if comments:
        selection.comments = comments

    db.session.add(selection)
    try:
        db.session.commit()

    except:
        IntegrityError
        db.session.rollback()
    
    selection = models.Selection.query.filter(models.Selection.path==savename).first()
    db.session.close()
    return selection.id

def get_photo_path(id):
    photo = models.Photo.query.filter(models.Photo.id==id).first()
    db.session.close()
    return photo.path

def get_photo_filename(id):
    photo = models.Photo.query.filter(models.Photo.id==id).first()
    db.session.close()
    filename = os.path.basename(photo.path)
    return filename

def get_pi_base():
    if current_user:
        return 'http://' + current_user.ip + '/'
    return None

# Returns a unique access code
def get_new_access_code(size=6, chars=string.ascii_uppercase):
    code = generate_code(size, chars)
    while models.Photo.query.filter(models.Photo.code==code).first() is not None:
        code = generate_code(size, chars)
    return code

def generate_code(size, chars):
    return ''.join(random.choice(chars) for x in range(size))




def get_interface_ip(ifname):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    return socket.inet_ntoa(fcntl.ioctl(s.fileno(), 0x8915, struct.pack('256s',
                                                                        ifname[:15]))[20:24])

def get_lan_ip():
    ip = socket.gethostbyname(socket.gethostname())
    if ip.startswith("127.") and os.name != "nt":
        interfaces = [
            "eth0",
            "eth1",
            "eth2",
            "wlan0",
            "wlan1",
            "wifi0",
            "ath0",
            "ath1",
            "ppp0",
            ]
        for ifname in interfaces:
            try:
                ip = get_interface_ip(ifname)
                break
            except IOError:
                pass
    return ip
