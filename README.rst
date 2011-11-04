collective.pdfjs - Plone integration for Mozilla's JavaScript PDF reader
========================================================================
Rigel Di Scala <zedr@zedr.com>


Introduction
------------
This product adds pdf.js support for Plone.

Pdf.js is a JavaScript library for rendering PDF documents in the canvas,
without using external plugins; only JavaScript is needed.

.. _PDF.js Repository: https://github.com/mozilla/pdf.js
.. _collective.pdfjs Repository: https://github.com/collective/collective.pdfjs

This product will make the JavaScript library available as a resource, and
add a new view for the File content type.

Please note that pdf.js is still under heavy development; as such:

    - a modern browser is required;
    - not all PDFs may be rendered correctly, or at all;


Installation
------------

Use Buildout. Take a look at docs/INSTALL.txt


Usage
-----
If the view detects a PDF file, it will attempt to render it inline using
pdf.js. If the user browser doesn't have JavaScript enabled, it will embed
any available PDF reader plugin (Acrobat's, Google Chrome native, etc) instead.


Additional information
----------------------
Currently, the whole document is downloaded and each oage rendered
incrementally inside the canvas. This means that big files on slow connections
will take a while before displaying; you might want to switch to the standard
view in this case.

Contact
-------
Rigel Di Scala <zedr@zedr.com>
http://github.com/zedr
