import unittest2 as unittest
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.testing.z2 import Browser


from Products.CMFCore.utils import getToolByName

from collective.pdfjs.testing import PDFJS_INTEGRATION_TESTING

class TestSetup(unittest.TestCase):

    layer = PDFJS_INTEGRATION_TESTING

    def test__verify_installation(self):
        portal = self.layer['portal']
        qi = getToolByName(portal, 'portal_quickinstaller')
        self.assertTrue(
            qi.isProductInstalled('collective.pdfjs'))

    def test__verify_my_stylesheets(self):
        portal = self.layer['portal']
        css = getToolByName(portal, 'portal_css')
        self.assertTrue(
            '++resource++collective.pdfjs.stylesheets/pdfjs.css'
            in css.getResourceIds())

    def test__verify_my_ecmascripts(self):
        portal = self.layer['portal']
        jss = getToolByName(portal, 'portal_javascripts')
        scripts = [
        '++resource++collective.pdfjs.ecmascripts/pdf.js',
        '++resource++collective.pdfjs.ecmascripts/pdf.min.js'
        ]
        for s in scripts:
            self.assertTrue(s in jss.getResourceIds())

    def test__verify_my_view(self):
        # Needs finishing...
        portal = self.layer['portal']
        request = self.layer['request']
        setRoles(portal, TEST_USER_ID, ['Manager'])
        portal.invokeFactory('File', 'test_pdf', title=u"Tracemonkey PDF")
        test_pdf = portal['test_pdf']
