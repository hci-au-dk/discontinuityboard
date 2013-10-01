import unittest
from app import app

class DiscontinuityBoardTest(unittest.TestCase):
    """Testing the discontinuitytest module"""
    
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()
        print app

    def test_frontpage_load(self):
        rv = self.app.get('/')
        assert 'Discontinuity Board' in rv.data
