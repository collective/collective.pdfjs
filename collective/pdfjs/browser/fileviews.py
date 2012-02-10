from zope.publisher.browser import BrowserView

class PdfJsFileView(BrowserView):
    """Display the pdf inline using pdf.js"""

    def jsinit(self):
		"""Spit out some JavaScript to initialize the PDF viewer"""
		return """var pdf = new PdfView("%s");
			pdf.init();""" % self.context.id