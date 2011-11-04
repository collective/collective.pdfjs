import unittest2 as unittest

from collective.pdfjs.testing import OPTILUX_POLICY_INTEGRATION_TESTING

class TestSetup(unittest.TestCase):

    layer = PDFJS_INTEGRATION_TESTING

    def test_portal_title(self):
        portal = self.layer['portal']
        self.assertEqual(
                "Site",
                 portal.getProperty('title')
            )

    def test_portal_description(self):
        portal = self.layer['portal']
        self.assertEqual(
                "",
                portal.getProperty('description')
            )
