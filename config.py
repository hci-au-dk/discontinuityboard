import os, tempfile
from flask.ext.assets import Bundle

LOG_FILENAME = 'python.log'

### STATIC FILES TO LOAD WITH ASSETS

CSS_ALL = Bundle('css/imgareaselect-default.css', 'css/discontinuityboard.css')
JS_ALL = Bundle('js/jquery-2.0.2.min.js', 'js/jquery-ui-1.10.3.js','js/tinymce/tinymce.min.js', 'js/tinymce/jquery.tinymce.min.js', 'js/jquery.imgareaselect.pack.js' ,'js/pixastic.custom.js', 'js/messenger.js', 'js/modals.js', 'js/photoview.js')
JS_VIEW_ALL = Bundle('js/view/modals.js', 'js/view/tools.js', 'js/view/notes.js', 'js/view/processphoto.js')
JS_PI_ALL = Bundle('js/pi/browser.js', 'js/pi/configtools.js', 'js/pi/modals.js', 'js/pi/initialize.js')

### FORM SETTINGS

CSRF_ENABLED = True
SECRET_KEY = 'kjiouW#(*$QN-1klaj)%&N93jaset%32u3k-o324[qlp4by'

### FOLDER SETTINGS

UPLOAD_FOLDER = 'tmp/'
ALLOWED_EXTENSIONS = set(['pdf', 'png', 'jpg', 'jpeg', 'gif'])

### DATABASE SETTINGS

basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')
