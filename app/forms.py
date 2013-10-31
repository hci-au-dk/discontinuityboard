
###from flask.ext.uploads import UploadSet, IMAGES
from app import db, models
from flask.ext.wtf import Form
from werkzeug import secure_filename
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms.validators import Required, ValidationError
from wtforms import TextField

#images = UploadSet('images', IMAGES)

#class PhotoUploadForm(Form):
#    photo = FileField('Your Photo')

class RegisterPiForm(Form):
    ip_address = TextField('ip_address', validators = [Required()])
    human_name = TextField('human_name', validators = [Required()])
    password = TextField('password', validators = [Required()])

    def validate_login(self):
        if models.Pi.query.filter(models.Pi.human_name==self.human_name.data).count() != 1:
            raise ValidationError('Duplicate username')

    def get_user(self):
        return models.Pi.query.filter(models.Pi.human_name==self.human_name.data).first()

class LoginForm(Form):
    human_name = TextField('human_name', validators = [Required()])
    password = TextField('password', validators = [Required()])
    
    def validate_login(self):
        user = self.get_user()

        if user is None:
            raise ValidationError('Invalid user')

        if user.password != self.password.data:
            raise ValidationError('Invalid password')

    def get_user(self):
        return models.Pi.query.filter(models.Pi.human_name==self.human_name.data).first()
