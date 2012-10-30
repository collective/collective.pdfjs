collective.pdfjs - Plone integration for Mozilla's JavaScript PDF reader
========================================================================



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

Using zc.buildout add ``collective.pdfjs`` to the list of eggs to install::

    [instance]
    recipe = plone.recipe.zope2instance
    ...
    eggs =
        ...
        collective.pdfjs

Re-run buildout, e.g. with::

    $ ./bin/buildout

Restart your plone instance and install this addon.

Usage
-----

If the view detects a PDF file, it will attempt to render it inline using
pdf.js. If the user browser doesn't have JavaScript enabled, it will embed
any available PDF reader plugin (Acrobat's, Google Chrome native, etc) instead.


Additional information
----------------------

Currently, the whole document is downloaded and each page rendered
incrementally inside the canvas. This means that big files on slow connections
will take a while before displaying; you might want to switch to the standard
view in this case.

Source Code and Contributions
=============================

If you want to help with the development (improvement, update, bug-fixing, ...)
of ``collective.pdfjs`` this is a great idea!

The code is located in the
`github collective <https://github.com/collective/collective.pdfjs>`_.

You can clone it or `get access to the github-collective
<http://collective.github.com/>`_ and work directly on the project.

Contributors
------------

- Rigel Di Scala <zedr@zedr.com> <http://github.com/zedr>

- Marcel

- Jens Klein

- Benjamin Stefaner
