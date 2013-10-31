from flask import Flask
from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager

app = Flask(__name__)
app.config.from_object('config')

assets = Environment(app)

assets.register('css_all', app.config['CSS_ALL'])
assets.register('js_all', app.config['JS_ALL'])

db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)

from app import views, models
