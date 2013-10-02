from flask.ext.uploads import UploadSet, IMAGES
from flask.ext.wtf import Form
from werkzeug import secure_filename
from flask_wtf.file import FileField, FileAllowed, FileRequired

images = UploadSet('images', IMAGES)

class PhotoUploadForm(Form):
    photo = FileField('Your Photo')
