from flask import Flask
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)
app.config.from_object('config')

assets = Environment(app)
css_all = Bundle('base.css')
js_all = Bundle('jquery-2.0.2.min.js', 'jquery-ui-1.10.3.js', 'tools.js')
assets.register('css_all', css_all)
assets.register('js_all', js_all)

from app import views
