import os, tempfile
from flask.ext.assets import Bundle

### STATIC FILES TO LOAD WITH ASSETS

CSS_ALL = Bundle('base.css')
JS_ALL = Bundle('jquery-2.0.2.min.js', 'jquery-ui-1.10.3.js', 'tools.js')

### FORM SETTINGS

CSRF_ENABLED = True
SECRET_KEY = 'kjiouW#(*$QN-1klaj)%&N93jaset%32u3k-o324[qlp4by'

### FOLDER SETTINGS

UPLOAD_FOLDER = 'tmp/'
ALLOWED_EXTENSIONS = set(['pdf', 'png', 'jpg', 'jpeg', 'gif'])
FILENAME_BASE = 'http://127.0.0.1:5000/uploads/'

### DATABASE SETTINGS

basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')
