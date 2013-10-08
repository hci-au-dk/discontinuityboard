from app import db

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key = True)  # Unique identifier
    path = db.Column(db.String(200), unique = True)  # where the photo is stored

    # Tells python how to print the photo object
    def __repr__(self):
        return 'Photo: %i, path %r' % (self.id, self.path)
