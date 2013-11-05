import datetime, os, requests
from app import app, db, models, login_manager
from flask import render_template, flash, redirect, request, url_for, send_from_directory, make_response, json
from sqlalchemy.exc import IntegrityError
from werkzeug import secure_filename
from util.perspective_transformation import transform_perspective
from PIL import Image
from StringIO import StringIO
from forms import RegisterPiForm, LoginForm, ConfigurePiForm
from flask.ext.login import login_user, current_user, logout_user, login_required
from wtforms.validators import ValidationError

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
@app.route('/index')
def index():
    # prepare the forms
    rform = RegisterPiForm()
    lform = LoginForm()
    cform = ConfigurePiForm()

    user = None
    if current_user.is_authenticated():
        user = current_user
    
    return render_template('discontinuityboard.html',
                           title = 'Discontinuity Board',
                           rform = rform,
                           lform = lform,
                           cform = cform,
                           user = user)

@app.route('/register-pi/', methods=['POST'])
def register():
    form = RegisterPiForm(request.form)
    if request.method == 'POST' and form.validate():
        # Everything is great
        ip = form.ip_address.data
        name = form.human_name.data
        password = form.password.data
        wbw = form.wbwidth.data
        wbh = form.wbheight.data
        wbratio = str(float(wbw) / float(wbh))

        # save the pi in the database
        pi = models.Pi(ip=ip, human_name=name, password=password, wbratio=wbratio)
        if models.Pi.query.filter(models.Pi.human_name==form.human_name.data).count() == 0:
            db.session.add(pi)
            try:
                db.session.commit()
                user = form.get_user()
                login_user(user, remember = True)
            except:
                IntegrityError
                db.session.rollback()
        else:
            # TODO: Make a sensible reaction to trying to register a name twice
            print "DUPLICATE USERNAME"
        return redirect(request.args.get("next") or url_for('index'))

    return redirect(url_for('index'))


@app.route('/login/', methods=['POST'])
def login():
    form = LoginForm(request.form)
    if form.validate_on_submit():
        user = form.get_user()
        if form.validate_login():
            login_user(user, remember=True)
        return redirect(request.args.get("next") or url_for('index'))
    return redirect(url_for('index'))


@app.route('/logout/')
def logout():
    logout_user()
    return redirect(url_for('index'))


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

@app.route('/uploads/<filename>')
def send_file(filename):
    basepath = app.root_path + '/' + app.config['UPLOAD_FOLDER']
    return send_from_directory(basepath, filename)


def save_photo(file, filename, raw):
    savename = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], filename)
    file.save(savename)
    
    # Now, we want to insert it into our database
    photo = models.Photo(path=savename, raw=raw, time_submitted=datetime.datetime.now(), pi_id=current_user.id)
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

@app.route('/get-all-photos/', methods = ['GET'])
@login_required
def get_all_photos():
    if request.method == 'POST':
        return make_response(400)

    photos = models.Photo.query.filter(models.Photo.pi_id==current_user.id)
    data = []
    for photo in photos:
        if not photo.raw:
            name = app.config['HOST_BASE'] + 'uploads/' + os.path.basename(photo.path)
            data.append({'path': name, 'id': photo.id})

    returnobj = {}
    returnobj["photos"] = data

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'

    return response

@app.route('/get-photo/', methods = ['GET'])
@login_required
def get_photo():
    if request.method == 'POST':
        return make_response(400)

    id = request.args.get('id')
    photo = models.Photo.query.filter(models.Photo.id==id).first()

    # See if the photo does not exist
    if photo is None:
        return make_response(404)

    name = app.config['HOST_BASE'] + 'uploads/' + os.path.basename(photo.path)
    
    img = Image.open(photo.path)

    returnobj = {}
    returnobj['path'] = name
    returnobj['id'] = photo.id
    returnobj['width'] = img.size[0]
    returnobj['height'] = img.size[1]
    returnobj['raw'] = photo.raw

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
    path = photo.path
    db.session.delete(photo)
    db.session.commit()

    os.remove(path)

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

@app.route('/get-configured/', methods = ['GET'])
@login_required
def get_configured():
    if request.method == 'POST':
        return make_response(400)

    pilocation = get_pi_base() + 'configuration'
    r = requests.get(pilocation)

    returnobj = {}
    returnobj['configs'] = r.json()
    
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
        if r.text == 'Configuration saved':
            returnobj['saved'] = True
        else:
            returnobj['saved'] = False

        #then delete all unconfigured photos from this pi
        pi = models.Pi.query.filter(models.Pi.id==current_user.id).first()
        for photo in pi.photos:
            if photo.raw:
                db.session.delete(photo)
        db.session.commit()

    return redirect(url_for('index'))

@app.route('/delete-configs/', methods = ['GET'])
@login_required
def delete_configs():
    pilocation = get_pi_base() + 'configuration'   
    
    r = requests.delete(pilocation)
    print "DELETE"
    print r.text

    returnobj = {}
    returnobj['saved'] = True

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/make-cut/', methods = ['GET'])
@login_required
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

    name = app.config['HOST_BASE'] + 'uploads/' + os.path.basename(selection.path)

    returnobj = {}
    returnobj['path'] = name
    returnobj['id'] = selection.id
    returnobj['width'] = cropped.size[0]
    returnobj['height'] = cropped.size[1]

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

def get_pi_base():
    if current_user:
        return 'http://' + current_user.ip + '/'
    return None


### Authentication services ###

@login_manager.user_loader
def load_user(userid):
    # Should return None if the user doesn't exist
    return models.Pi.query.get(int(userid))
    
