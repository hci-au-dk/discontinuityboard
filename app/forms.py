from app import db, models
from flask.ext.wtf import Form
from werkzeug import secure_filename
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms.validators import Required, ValidationError, Length
from wtforms import TextField, PasswordField, HiddenField, BooleanField


class RegisterPiForm(Form):
    ip_address = TextField('ip_address', validators = [Required()])
    human_name = TextField('human_name', validators = [Required()])
    password = PasswordField('password', validators = [Required()])

    # white board aspect information
    wbwidth = TextField('wbwidth', validators = [Required()])
    wbheight = TextField('wbheight', validators = [Required()])

    def get_user(self):
        return models.Pi.query.filter(models.Pi.human_name==self.human_name.data).first()

class EditPiForm(Form):
    old_ip = HiddenField('old_ip', validators = [Required()])
    ip_address = TextField('ip_address')
    human_name = TextField('human_name')
    password = PasswordField('password')
    old_password = PasswordField('old_password', validators = [Required()])

    # white board aspect information
    wbwidth = TextField('wbwidth')
    wbheight = TextField('wbheight')

    def get_user(self):
        pi = models.Pi.query.filter(models.Pi.ip==self.old_ip.data).first()
        if pi.password == self.old_password.data:
            return pi
        return None

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
    rotate = BooleanField('rotate')

class PhotoViewForm(Form):
    code = TextField('code', validators = [Required()])

    def validate_login(self):
        user = self.get_user()
        return user is not None

    def get_user(self):
        # ignore case
        code = self.code.data.upper()
        return models.Photo.query.filter(models.Photo.code==code).filter(models.Photo.deleted==False).first()

class LoginPiForm(Form):
    human_name = TextField('human_name', validators = [Required(), Length(min=2, message='Too short')])
    password = PasswordField('password', validators = [Required()])
    
    def validate_login(self):
        user = self.get_user()
        return user is not None and user.password == self.password.data

    def get_user(self):
        return models.Pi.query.filter(models.Pi.human_name==self.human_name.data).first()
