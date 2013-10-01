from app import app
from flask import render_template

@app.route("/")
@app.route("/index")
def index():
    print "hi"
    return render_template("index.html",  # if you change the title, change the test!
                           title = "Discontinuity Board")  
