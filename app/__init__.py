from flask import Flask
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)
app.config.from_object('config')

assets = Environment(app)

assets.register('css_all', app.config['CSS_ALL'])
assets.register('js_all', app.config['JS_ALL'])

from app import views
