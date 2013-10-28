from app import db

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key = True)  # Unique identifier
    path = db.Column(db.String(200), unique = True)  # where the photo is stored
    raw = db.Column(db.Boolean) # whether or not the photo comes from pi/rawimage
    time_submitted = db.Column(db.DateTime)  # time the photo was submitted
    children = db.relationship('Selection', backref='parent')

    # Tells python how to print the photo object
    def __repr__(self):
        return 'Photo: %i, path: %r, raw:%r, time_submitted:%r' % (self.id, self.path, self.raw, self.time_submitted)

class Selection(db.Model):
    id = db.Column(db.Integer, primary_key = True)  # Unique identifier
    path = db.Column(db.String(200), unique = True)  # where stored
    parent_id = db.Column(db.Integer, db.ForeignKey('photo.id'))  # photo the selection came from
    comments = db.Column(db.String(1000))

    def __repr__(self):
        return 'Selection: %i, path: %r, parent:%r, comments:%r' % (self.id, self.path, self.parent_id, self.comments)
    
