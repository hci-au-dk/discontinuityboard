import os
from app import app
from flask import render_template, flash, redirect, request, url_for, send_from_directory
from werkzeug import secure_filename
from util.perspective_transformation import transform_perspective
from PIL import Image

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
@app.route('/index')
def index(filename = None):
    return render_template('index.html',
                           title = 'Discontinuity Board',
                           filename = filename)


@app.route('/upload/', methods=['GET', 'POST'])
def upload_file():
    filename = None
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            savename = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], filename)
            file.save(savename)
            filename = app.config['FILENAME_BASE'] + filename

    return index(filename)

@app.route('/uploads/<filename>')
def send_file(filename):
    print 'uploading: %s' % (filename)
    basepath = app.root_path + '/' + app.config['UPLOAD_FOLDER']
    return send_from_directory(basepath, filename)

@app.route('/transform/', methods = ['GET', 'POST'])
def transform_file():
    if request.method == 'POST':
        coordinates = request.form['coord1']
        print coordinates
