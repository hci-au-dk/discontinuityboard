
###from flask.ext.uploads import UploadSet, IMAGES
from app import db, models
from flask.ext.wtf import Form
from werkzeug import secure_filename
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms.validators import Required, ValidationError
from wtforms import TextField, PasswordField, HiddenField

#images = UploadSet('images', IMAGES)

#class PhotoUploadForm(Form):
#    photo = FileField('Your Photo')

class RegisterPiForm(Form):
    ip_address = TextField('ip_address', validators = [Required()])
    human_name = TextField('human_name', validators = [Required()])
    password = PasswordField('password', validators = [Required()])

    # white board aspect information
    wbwidth = TextField('wbwidth', validators = [Required()])
    wbheight = TextField('wbheight', validators = [Required()])

    def get_user(self):
        return models.Pi.query.filter(models.Pi.human_name==self.human_name.data).first()

class LoginForm(Form):
    human_name = TextField('human_name', validators = [Required()])
    password = PasswordField('password', validators = [Required()])
    
    def validate_login(self):
        user = self.get_user()
        return user is not None and user.password == self.password.data

    def get_user(self):
        return models.Pi.query.filter(models.Pi.human_name==self.human_name.data).first()

class ConfigurePiForm(Form):
    x0 = TextField('x0', validators = [Required()])
    x1 = TextField('x1', validators = [Required()])
    x2 = TextField('x2', validators = [Required()])
    x3 = TextField('x3', validators = [Required()])
    y0 = TextField('y0', validators = [Required()])
    y1 = TextField('y1', validators = [Required()])
    y2 = TextField('y2', validators = [Required()])
    y3 = TextField('y3', validators = [Required()])
    cwidth = HiddenField('cwidth', validators = [Required()])
    cheight = HiddenField('cheight', validators = [Required()])
