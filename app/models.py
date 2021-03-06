from app import db

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key = True)  # Unique identifier
    path = db.Column(db.String(200))  # where the photo is stored
    raw = db.Column(db.Boolean) # whether or not the photo comes from pi/rawimage
    time_submitted = db.Column(db.DateTime)  # time the photo was submitted
    children = db.relationship('Selection', backref='photo')
    pi_id = db.Column(db.Integer, db.ForeignKey('pi.id'))
    parent = db.relationship('Pi', primaryjoin='Pi.id==Photo.pi_id')
    code = db.Column(db.String(20), unique = True) # string that provides the access point
    notes = db.Column(db.Text())  # variably sized text field for saving the notes
    deleted = db.Column(db.Boolean)
    
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)

    # Tells python how to print the photo object
    def __repr__(self):
        return 'Photo: %i, path: %r, raw:%r, time_submitted:%r, pi:%i, code:%r, notes:%r' % \
            (self.id, self.path, self.raw, self.time_submitted, self.pi_id, self.code, self.notes)

class Selection(db.Model):
    id = db.Column(db.Integer, primary_key = True)  # Unique identifier
    path = db.Column(db.String(200), unique = True)  # where stored
    parent_id = db.Column(db.Integer, db.ForeignKey('photo.id'))  # photo the selection came from
    parent = db.relationship('Photo', primaryjoin='Photo.id==Selection.parent_id')
    comments = db.Column(db.String(1000))

    def __repr__(self):
        return 'Selection: %i, path: %r, parent: %i, comments:%r' % (self.id, self.path, self.parent_id, self.comments)
    
class Pi(db.Model):
    id = db.Column(db.Integer, primary_key = True)  # Unique Identifier
    ip = db.Column(db.String(45), unique = True)
    human_name = db.Column(db.String(30), unique = True)  # a memorable name for the user's sake
    password = db.Column(db.String(30))
    wbratio = db.Column(db.String(10))  # width / height
    photos = db.relationship('Photo', backref='pi')

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)

    def __repr__(self):
        return 'Pi: %i, ipaddress: %r, name: %r, pass:%r, ratio:%r' % (self.id, self.ip, self.human_name, self.password, self.wbratio)
