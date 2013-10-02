from flask.ext.wtf import Form
from werkzeug import secure_filename
from flask_wtf.file import FileField
from wtforms import TextField
from wtforms.validators import Required

class PhotoUploadForm(Form):
    photo = FileField('Your Photo', validators = [Required()])
