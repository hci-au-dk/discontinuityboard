import os, tempfile
from app import app
from flask import render_template, flash, redirect, request, url_for, send_from_directory
from werkzeug import secure_filename

UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


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
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            filename = 'http://127.0.0.1:5000/uploads/' + filename

    return index(filename)

@app.route('/uploads/<filename>')
def send_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/transform/', methods = ['GET', 'POST'])
def transform_file():
    if request.method == 'POST':
        file = request.files['file']
        coordinates = request.form['coordinates']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            filename = 'http://127.0.0.1:5000/uploads/' + filename
