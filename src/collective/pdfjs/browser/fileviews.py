from plone.dexterity.browser.view import DefaultView
from plone.app.contenttypes.interfaces import IFile


class PdfJsFileView(DefaultView):
  """Display the pdf inline using pdf.js
  """
