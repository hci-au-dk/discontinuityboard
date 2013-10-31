import datetime, os, requests
from app import app, db, models, login_manager
from flask import render_template, flash, redirect, request, url_for, send_from_directory, make_response, json
from sqlalchemy.exc import IntegrityError
from werkzeug import secure_filename
from util.perspective_transformation import transform_perspective
from PIL import Image
from StringIO import StringIO
from forms import RegisterPiForm, LoginForm
from flask.ext.login import login_user, current_user, logout_user
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
    user = None
    if current_user.is_authenticated():
        user = current_user
    
    return render_template('discontinuityboard.html',
                           title = 'Discontinuity Board',
                           rform = rform,
                           lform = lform,
                           user = user)

@app.route('/register-pi/', methods=['POST'])
def register():
    form = RegisterPiForm(request.form)
    if request.method == 'POST' and form.validate():
        # Everything is great
        ip_address = form.ip_address.data
        human_name = form.human_name.data
        password = form.password.data

        # save the pi in the database
        pi = models.Pi(ip=ip_address, human_name=human_name, password=password)
        db.session.add(pi)
        try:
            db.session.commit()
        except:
            IntegrityError
            db.session.rollback()
        return login_help(form)

    return redirect(url_for('index'))


@app.route('/login/', methods=['POST'])
def login():
    form = LoginForm()
    return login_help(form)

def login_help(form):
    if form.validate_on_submit():
        user = form.get_user()
        #try:
        form.validate_login()
        print "logging in"
        login_user(user, remember=True)
        #except:
        #    ValidationError
        #    redirect(url_for('index'))
        return redirect(request.args.get("next") or url_for('index'))
    return redirect(url_for('index'))



@app.route('/logout/')
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/upload/', methods=['POST'])
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
    photo = models.Photo(path=savename, raw=raw, time_submitted=datetime.datetime.now())
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
def get_all_photos():
    if request.method == 'POST':
        return make_response(400)

    photos = models.Photo.query.all()
    data = []
    for photo in photos:
        name = app.config['FILENAME_BASE'] + os.path.basename(photo.path)
        data.append({'path': name, 'id': photo.id})

    returnobj = {}
    returnobj["photos"] = data

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'

    return response

@app.route('/get-photo/', methods = ['GET'])
def get_photo():
    if request.method == 'POST':
        return make_response(400)

    id = request.args.get('id')
    photo = models.Photo.query.filter(models.Photo.id==id).first()

    # See if the photo does not exist
    if photo is None:
        return make_response(404)

    name = app.config['FILENAME_BASE'] + os.path.basename(photo.path)
    
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
def delete_photo():
    if request.method == 'POST':
        return make_response(400)

    id = request.args.get('id')
    photo = models.Photo.query.filter(models.Photo.id==id).first()
    db.session.delete(photo)
    db.session.commit()

    returnobj = {}
    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response



@app.route('/take-photo/', methods = ['GET'])
def take_photo():
    if request.method == 'POST':
        return make_response(400)

    # We need to make a request to the raspberry pi
    raw = True
    pilocation = app.config['PI_BASE'] + 'rawimage'
    if request.args.get('configured') == 'true':
        pilocation = app.config['PI_BASE'] + 'snapshot'
        raw = False

    r = requests.get(pilocation)

    img = Image.open(StringIO(r.content))

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
def get_configured():
    if request.method == 'POST':
        return make_response(400)

    pilocation = app.config['PI_BASE'] + 'configuration'
    r = requests.get(pilocation)
    

    returnobj = {}
    returnobj['configs'] = r.json()
    
    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

    
@app.route('/set-transform-coords/', methods = ['POST'])
def transform_coords():
    if request.method == 'GET':
        return make_response(400)

    piobj = {}
    for i in range(1, 5):
        strX = 'coordinates[x' + str(i) + ']'
        strY = 'coordinates[y' + str(i) + ']'
        piobj['x' + str(i - 1)] = request.form[strX]
        piobj['y' + str(i - 1)] = request.form[strY]

    pilocation = app.config['PI_BASE'] + 'configuration'

    headers = {'Content-type': 'application/json'}

    r = requests.post(pilocation, data=json.dumps(piobj), headers=headers)

    returnobj = {}
    # then go and get the next picture
    if r.text == 'Configuration saved':
        returnobj['saved'] = True
    else:
        returnobj['saved'] = False

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

@app.route('/delete-configs/', methods = ['GET'])
def delete_configs():
    pilocation = app.config['PI_BASE'] + 'configuration'   
    
    r = requests.delete(pilocation)
    print "DELETE"
    print r.text

    returnobj = {}
    returnobj['saved'] = True

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

    name = app.config['FILENAME_BASE'] + os.path.basename(selection.path)

    returnobj = {}
    returnobj['path'] = name
    returnobj['id'] = selection.id
    returnobj['width'] = cropped.size[0]
    returnobj['height'] = cropped.size[1]

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response


### Authentication services ###

@login_manager.user_loader
def load_user(userid):
    # Should return None if the user doesn't exist
    return models.Pi.query.get(int(userid))
    
