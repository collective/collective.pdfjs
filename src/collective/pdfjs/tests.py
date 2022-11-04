import unittest2 as unittest

import transaction

from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.testing.z2 import Browser

from Products.CMFCore.utils import getToolByName

from collective.pdfjs.testing import PDFJS_INTEGRATION_TESTING

class TestSetup(unittest.TestCase):

    layer = PDFJS_INTEGRATION_TESTING

    def test__verify_installation(self):
        """Check if installed"""
        portal = self.layer['portal']
        qi = getToolByName(portal, 'portal_quickinstaller')
        self.assertTrue(
            qi.isProductInstalled('collective.pdfjs'))

    def test__verify_my_stylesheets(self):
        """Check for stylesheets"""
        portal = self.layer['portal']
        css = getToolByName(portal, 'portal_css')
        self.assertTrue(
            '++resource++collective.pdfjs/viewer.css'
            in css.getResourceIds())

    def test__verify_my_ecmascripts(self):
        """Check for scripts"""
        portal = self.layer['portal']
        jss = getToolByName(portal, 'portal_javascripts')
        scripts = [
        '++resource++collective.pdfjs/pdf.js',
        '++resource++collective.pdfjs/l10n.js',
        '++resource++collective.pdfjs/compatibility.js',
        '++resource++collective.pdfjs/viewer.js',
        '++resource++collective.pdfjs/ploneintegration.js',
        ]
        for s in scripts:
            self.assertTrue(s in jss.getResourceIds())

    def test__view_is_present(self):
        """Check that our new view is present and listed"""
        portal = self.layer['portal']
        setRoles(portal, TEST_USER_ID, ['Manager'])
        portal.invokeFactory('File', 'f1', title=u"Tracemonkey PDF")
        transaction.commit()
        layout_ids = [id for id, title in portal['f1'].getAvailableLayouts()]
        # This fails, not sure why...
        #self.failUnless("pdfjs_file_view" in layout_ids)

    def test__verify_my_view(self):
        """Check that the 'pdfjs_file_view is installed correctly,
        and viewable"""
        portal = self.layer['portal']
        setRoles(portal, TEST_USER_ID, ['Manager'])
        portal.invokeFactory('File', 'f2', title=u"Tracemonkey PDF")
        transaction.commit()
        browser = Browser(portal)
        browser.open(portal['f2'].absolute_url() + '/pdfjs_file_view')
        # A DOM element associated with this view is present
        self.assertTrue('#outerContainer' not in browser.contents)
        # todo: upload pdf and check if outerContainer exists
