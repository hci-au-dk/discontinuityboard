import datetime, os, requests
from app import app, db, models
from flask import render_template, flash, redirect, request, url_for, send_from_directory, make_response, json
from sqlalchemy.exc import IntegrityError
from werkzeug import secure_filename
from util.perspective_transformation import transform_perspective
from PIL import Image
from StringIO import StringIO

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
@app.route('/index')
def index(filename = None, photoid = None):


    if filename:
        filename = app.config['FILENAME_BASE'] + filename

    return render_template('index.html',
                           title = 'Discontinuity Board',
                           filename = filename)


@app.route('/upload/', methods=['GET', 'POST'])
def upload_file():
    filename = None
    photoid = None
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            photoid = save_photo(file, filename)

    return index(filename)

@app.route('/uploads/<filename>')
def send_file(filename):
    basepath = app.root_path + '/' + app.config['UPLOAD_FOLDER']
    return send_from_directory(basepath, filename)


def save_photo(file, filename):
    savename = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], filename)
    file.save(savename)
    
    # Now, we want to insert it into our database
    photo = models.Photo(path=savename)
    db.session.add(photo)
    try:
        db.session.commit()

    except:
        IntegrityError
        db.session.rollback()
    
    photo = models.Photo.query.filter(models.Photo.path==savename).first()
    db.session.close()
    return photo.id

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
        return make_response(400);

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
        return make_response(400);

    id = request.args.get('id')
    photo = models.Photo.query.filter(models.Photo.id==id).first()

    name = app.config['FILENAME_BASE'] + os.path.basename(photo.path)
    
    img = Image.open(photo.path)

    returnobj = {}
    returnobj['path'] = name
    returnobj['id'] = photo.id
    returnobj['width'] = img.size[0]
    returnobj['height'] = img.size[1]

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response


@app.route('/take-photo/', methods = ['GET'])
def take_photo():
    if request.method == 'POST':
        return make_response(400);

    # We need to make a request to the raspberry pi
    pilocation = app.config['PI_BASE'] + 'rawimage'
    if request.args.get('configured') == 'true':
        pilocation = app.config['PI_BASE'] + 'snapshot'

    print "location"
    print pilocation

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

    photoid = save_photo(img, filename)

    returnobj = {}
    returnobj['id'] = photoid

    response = make_response(json.dumps(returnobj), 200)
    response.headers['Content-type'] = 'application/json'
    return response

    
@app.route('/set-transform-coords/', methods = ['POST'])
def transform_file():
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
