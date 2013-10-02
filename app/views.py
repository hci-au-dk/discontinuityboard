from app import app
from flask import render_template, flash, redirect
from forms import PhotoUploadForm
from werkzeug import secure_filename

@app.route("/")
@app.route("/index")
def index():
    print "hi"
    return render_template("index.html",  # if you change the title, change the test!
                           title = "Discontinuity Board")  

@app.route('/upload', methods = ('GET', 'POST'))
def upload():
    form = PhotoUploadForm()
    if form.validate_on_submit():
#        filename = secure_filename(form.photo.data.filename)
        flash('Uploaded file: ' + form.photo.data)
        return redirect('/index')

    return render_template('upload.html',
                           form = form)
