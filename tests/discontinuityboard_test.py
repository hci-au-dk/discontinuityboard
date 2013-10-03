from flask.ext.testing import TestCase
from app import app
from flask import Flask

class DiscontinuityBoardTest(TestCase):
    
    def create_app(self):
        app.config['TESTING'] = True
        return app

    def test_front_page_get_success(self):
        response = self.client.get('/')
        self.assert_200(response)

    def test_front_page_title(self):
        response = self.client.get('/')
        self.assertContext('title', 'Discontinuity Board')

    def test_front_page_maintemplate(self):
        response = self.client.get('/')
        self.assertTemplateUsed('index.html')

    # This test needs to be worked on
    def test_photo_upload_success(self):
        photo = open('tests/test_data/wb.jpg', 'rb')
        payload = {'name': 'file', 'attachment' : photo}
        response = self.client.post('/', payload)
        pass
#        print response
#        self.assertEquals(True, False)
