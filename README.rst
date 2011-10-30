collective.pdfjs - Plone integration for Mozilla's JavaScript PDF reader
========================================================================
Rigel Di Scala <zedr@zedr.com>

Introduction
------------

This product adds pdf.js support for Plone.

When installed, it will provide an additional view for the File content-type.

If the view detects a PDF file, it will attempt to render it inline using
pdf.js. If the user browser doesn't have JavaScript enabled, it will embed
any available PDF reader plugin (Acrobat's, Google Chrome native, etc).

To know more about the integrated PDF renderer/viewer, see:

.. _PDF.js Repository: https://github.com/andreasgal/pdf.js
