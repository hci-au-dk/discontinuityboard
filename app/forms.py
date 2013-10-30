
###from flask.ext.uploads import UploadSet, IMAGES
from flask.ext.wtf import Form
from werkzeug import secure_filename
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms.validators import Required
from wtforms import TextField

#images = UploadSet('images', IMAGES)

#class PhotoUploadForm(Form):
#    photo = FileField('Your Photo')

class RegisterPiForm(Form):
    ip_address = TextField('ip_address', validators = [Required()])
    human_name = TextField('human_name', validators = [Required()])

