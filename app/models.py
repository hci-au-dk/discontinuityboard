from app import db

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key = True)  # Unique identifier
    path = db.Column(db.String(200), unique = True)  # where the photo is stored
    raw = db.Column(db.Boolean) # whether or not the photo comes from pi/rawimage
    time_submitted = db.Column(db.DateTime)  # time the photo was submitted

    # Tells python how to print the photo object
    def __repr__(self):
        return 'Photo: %i, path: %r, raw:%r, time_submitted:%r' % (self.id, self.path, self.raw, self.time_submitted)


class Pi(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), unique = True)  # A unique, human-readable name
    address = db.Column(db.String(200))  # The pi's ip address

    # Tells python how to print the photo object
    def __repr__(self):
        return 'Pi: %i, name: %r, address:%r' % (self.id, self.name, self.address)

    
