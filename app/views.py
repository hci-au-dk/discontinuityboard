from app import app, db, models, login_manager

import datetime, os, string, random, requests
from datetime import timedelta
from flask import render_template, flash, redirect, request, url_for, \
send_from_directory, make_response, json, get_flashed_messages
from flask.ext.login import login_user, current_user, logout_user, login_required
from flask_weasyprint import HTML, render_pdf
from forms import RegisterPiForm, EditPiForm, ConfigurePiForm, LoginPiForm, PhotoViewForm
from PIL import Image
from markupsafe import Markup
from StringIO import StringIO
from sqlalchemy.exc import IntegrityError
from util.perspective_transformation import transform_perspective

from werkzeug import secure_filename
from wtforms.validators import ValidationError


TIMESPAN_DAYS = 2
CODE_LENGTH = 6  # should correspond with the javascript access triggers

@app.before_request
def pre_request_logging():
    #Logging statement
    app.logger.info('\t'.join([
                datetime.datetime.today().ctime(),
                request.remote_addr,
                request.method,
                request.url,
                request.data,
                ', '.join([': '.join(x) for x in request.headers])])
                    )

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
    photo = None
    form = None
    if (request.method == 'GET' and code is not None) or request.method == 'POST':
        form = PhotoViewForm()
        if request.method == 'GET':
            form.code.data = code
        else:
            form = PhotoViewForm(request.form)

        user = form.get_user()
        if form.validate_login():
            photo = user

    if photo is None and form is not None:
        flash('Incorrect entry code.', category='entry')
        return redirect(url_for('entry'))

    # If you got this far, you are viewing your photo!
    form = PhotoViewForm()
    return render_template('discontinuityboard.html',
                           title = 'View | Discontinuity Board',
                           pvform = form,
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
    form = LoginPiForm(request.form)
    if form.validate_on_submit():
        user = form.get_user()
        if form.validate_login():
            logout_user()
            login_user(user)
        return redirect(request.args.get("next") or url_for('pi'))
    else:
        flash_errors(form, '-login')
        location = url_for('pi') + "#login-modal"
        return redirect(location)

@app.route('/register-pi/', methods=['POST'])
def register_pi():
    form = RegisterPiForm(request.form)
    location = url_for('pi') + '#register-modal'
    if request.method == 'POST' and form.validate():
        # Everything is great
        ip = form.ip_address.data
        name = form.human_name.data
        password = form.password.data
        wbw = form.wbwidth.data
        wbh = form.wbheight.data
        wbratio = str(float(wbw) / float(wbh))

        name_unique = models.Pi.query.filter(models.Pi.human_name==form.human_name.data).count() == 0
        ip_unique = models.Pi.query.filter(models.Pi.ip==form.ip_address.data).count() == 0
        if name_unique and ip_unique:
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
                return redirect(request.args.get("next") or url_for('pi_configure'))
            except:
                IntegrityError
                requests.exceptions.Timeout
                db.session.rollback()
                flash("Error communicating with IP address: %s" % (ip), category="error-register")
                    
        else:
            s = ''
            if not name_unique:
                flash("This name is already in use.", category='error-register')
            if not ip_unique:
                flash("This ip address is already in use.", category='error-register')
    else:
        flash_errors(form, '-register')
    return redirect(location)

@app.route('/send-location-to-pi/', methods=['GET'])
def send_location():
    # register this server and name with the pi
    pilocation = 'http://' + current_user.ip + '/' + 'register-server'
    payload = {'id': current_user.id}
    try:
        r = requests.get(pilocation, params=payload, timeout=10)
        flash("Success. Pi IP verified.", category="general")
    except:
        requests.exceptions.Timeout
        flash("Timout occurred. Perhaps the Pi IP is incorrect.", "general")
    return redirect(url_for('pi'))


@app.route('/pi-restart/', methods=['POST'])
def pi_restart():
    pi_id = int(request.form['id'])
    ip = request.remote_addr
    pi = models.Pi.query.filter(models.Pi.id==pi_id).first()
    if pi:
        pi.ip = ip
    try:
        db.session.commit()
    except:
        IntegrityError
        db.session.rollback()
    return 'Success', 200

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
        else:
            flash("Password is incorrect.", category="error-edit")
            return redirect(url_for('pi') + "#edit-pi-modal")
        try:
            db.session.commit()
        except:
            IntegrityError
            db.session.rollback()
            flash("Error with changes. IP address and name must be unique.", category="error-edit")
            return redirect(url_for('pi') + "#edit-pi-modal")
    else:
        flash_errors(form, '-edit')
        return redirect(url_for('pi') + "#edit-pi-modal")
    return redirect(url_for('pi'))

@app.route('/pi/logout/')
@login_required
def pi_logout():
    logout_user()
    return redirect(url_for('pi'))

@app.route('/pi/delete-pi/')
@login_required
def pi_delete():

    # delete config file on the pi
    pilocation = get_pi_base() + 'register-server'

    # even if a timeout occurs we still want to do the delete
    try:
        r = requests.delete(pilocation, timeout=10)
    except:
        requests.exceptions.Timeout
        # ignore this

    pi = models.Pi.query.filter(models.Pi.id==current_user.id).first()
    for photo in pi.photos:
        delete_photo_and_selections(photo)

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
    photos = models.Photo.query.filter(models.Photo.pi_id==current_user.id).filter(models.Photo.deleted==False)
    data = []
    for photo in photos:
        if not photo.raw:
            name = '/uploads/' + os.path.basename(photo.path)
            img = Image.open(photo.path)
            data.append({'path': name, 'id': photo.id, 'code': photo.code,
                         'width': img.size[0], 'height': img.size[1],
                         'time': get_expiry_date(photo.time_submitted),
                         'saved': photo.notes is not None})

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
    photo = get_photo_from_id(id)

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

    try:
        r = requests.get(pilocation, timeout=30)
    except:
        requests.exceptions.Timeout
        flash('Timeout occurred. Make sure IP address is correct and server is running.', category='general')
        return 'Failed', 500

    img = Image.open(StringIO(r.content))
    if request.args.get('configured') == 'true':
        # flip and correct for aspect ratio of the whiteboard
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

        # then set rotation
        if form.rotate.data:
            piobj['rotation'] = '180'
        else:
            piobj['rotation'] = '0'

        #then delete all unconfigured photos from this pi
        pi = models.Pi.query.filter(models.Pi.id==current_user.id).first()
        for photo in pi.photos:
            if photo.raw:
                db.session.delete(photo)

        db.session.commit()

        pilocation = get_pi_base() + 'configuration'
        headers = {'Content-type': 'application/json'}

        r = requests.post(pilocation, data=json.dumps(piobj), headers=headers)

        returnobj = {}
        if r.status_code == 200:
            returnobj['saved'] = True
        else:
            returnobj['saved'] = False

    else:
        flash_errors(form, '-configure')
        return redirect(url_for('pi') + "#configure-modal")

    flash("Success configuring pi.", category="general")
    return redirect(url_for('pi'))


@app.route('/pi-upload/', methods=['POST'])
def pi_upload():
    filename = None
    returnobj = {}
    if request.method == 'POST':
        file = request.files['file']
        pi_id = request.form['id']
        if file and allowed_file(file.filename):
            pi = models.Pi.query.filter(models.Pi.id==pi_id).first()

            img = Image.open(file)
            # flip and correct for aspect ratio of the whiteboard
            ow = img.size[0]
            h = img.size[1]
            w = ow
            wbratio = pi.wbratio
            if ( (ow / h) != wbratio):
                # get a new width and height that does
                # always keep the height the same
                w = int(float(wbratio) * h)

            img = img.resize((w, h))

            filename = secure_filename(file.filename)
            photoid = save_photo(img, filename, False, pi_id, request.form['code'])
            photo = get_photo_from_id(photoid)

            returnobj['timesubmitted'] = photo.time_submitted 
            returnobj['time'] = get_expiry_date(photo.time_submitted)
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
    photo = get_photo_from_id(id)

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
        returnobj['time'] = get_expiry_date(photo.time_submitted)

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
    parent = get_photo_from_id(photoid)
    
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

    if len(content) > 0:
        photo = get_photo_from_id(id)
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

    photo = get_photo_from_id(id)
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

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


def get_photo_from_id(id):
    return models.Photo.query.filter(models.Photo.id==id).filter(models.Photo.deleted==False).first()

# Clears photos that don't have notes and have
# been around for more than TIMESPAN_DAYS
def clear_old_photos():
    now = datetime.datetime.now()
    for photo in models.Photo.query.all():
        delta = now - photo.time_submitted
        if (delta.days >= TIMESPAN_DAYS and photo.notes is None):
            delete_photo_and_selections(photo)

# "Deletes" a photo and all selections associated with it
def delete_photo_and_selections(photo):
    #path = photo.path
    #for child in photo.children:
        #os.remove(child.path)
        #db.session.delete(child)

    #db.session.delete(photo)
    photo.deleted = True
    db.session.commit()
    #os.remove(path)

# Gets the human-readable date that the photo will expire
def get_expiry_date(time_submitted):
    left = time_submitted + timedelta(days=TIMESPAN_DAYS)
    return left.strftime("%b %d, %Y %H:%M:%S")

# Returns a unique access code of length CODE_LENGTH
def get_new_access_code(chars=string.ascii_uppercase):
    code = generate_code(CODE_LENGTH, chars)
    while models.Photo.query.filter(models.Photo.code==code).first() is not None:
        code = generate_code(CODE_LENGTH, chars)
    return code

def generate_code(size, chars):
    return ''.join(random.choice(chars) for x in range(size))

# Given an id, returns the base filename of the photo
def get_photo_filename(id):
    photo = get_photo_from_id(id)
    db.session.close()
    filename = os.path.basename(photo.path)
    return filename

# Given an id, returns the path to where the photo is stored
def get_photo_path(id):
    photo = get_photo_from_id(id)
    db.session.close()
    return photo.path

# Get the base address of the pi that you are connected to
def get_pi_base():
    if current_user:
        return 'http://' + current_user.ip + '/'
    return None

# Register errors associated with a form to a certain category
# in the format "error[category]"
def flash_errors(form, category):
    for field, errors in form.errors.items():
        for error in errors:
            flash(u"Error in the %s field - %s" % (
                getattr(form, field).label.text,
                error), category='error' + category)

# Save a photo in the database and in the file system
def save_photo(file, filename, raw, pi_id=None, code=None):
    savename = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], filename)
    file.save(savename)

    # generate an access code
    if code is None:
        code = get_new_access_code()
    
    # Now, we want to insert it into our database
    if pi_id is None:
        pi_id = current_user.id
    photo = models.Photo(path=savename, raw=raw, time_submitted=datetime.datetime.now(), pi_id=pi_id, code=code, deleted=False)
    db.session.add(photo)
    try:
        db.session.commit()

    except:
        IntegrityError
        db.session.rollback()
    
    photo = models.Photo.query.filter(models.Photo.path==savename).first()
    db.session.close()
    return photo.id

# Save a selection in the database and in the file system
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
