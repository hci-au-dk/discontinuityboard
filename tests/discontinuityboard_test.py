import unittest
from ..discontinuityboard import *

class DiscontinuityBoardTest(unittest.TestCase):
    """Testing the discontinuitytest module"""
    
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def test_frontpage_load(self):
        rv = self.app.get('/')
        assert 'Hello, world' in rv.data
