from  plone.app.testing import PloneSandboxLayer
from  plone.app.testing import applyProfile
from  plone.app.testing import PLONE_FIXTURE
from  plone.app.testing import IntegrationTesting

from plone.testing import z2

from zope.configuration import xmlconfig

class PdfJs(PloneSandboxLayer):

    defaultBases = (PLONE_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        # Load ZCML
        import collective.pdfjs
        self.loadZCML(package=collective.pdfjs)
        z2.installProduct(app, 'collective.pdfjs')

    def setUpPloneSite(self, portal):
        applyProfile(portal, 'collective.pdfjs:default')

    def tearDownZope(self, app):
        z2.uninstallProduct(app, 'collective.pdfjs')


PDFJS_FIXTURE = PdfJs()
PDFJS_INTEGRATION_TESTING = IntegrationTesting(
    bases=(PDFJS_FIXTURE,),
    name="PdfJs:Integration",
)
