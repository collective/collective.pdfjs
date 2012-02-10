/*
 * A simple viewer for Pdf.js
 *
 * Creator: zedr
 */

"use strict";

var PdfView = function (url) {
  this.canvas = document.getElementById('the-canvas');
  this.context = this.canvas.getContext('2d');
  this.cbuttons = {
    pnum: document.getElementById('pdf-page-number'),
    ptot: document.getElementById('pdf-page-total')
  }

  var self = this;

  // The page number - start on zero
  var pnum = 0;

  // The page zoom factor (scale)
  var pscale = 1.0;

  // Load the document
  PDFJS.getPdf(url, function getPdfData(data) {
    self.doc = new PDFJS.PDFDoc(data);
    return self.init();
  });

  // Render the page
  this.renderPage = function renderPage() {
    // If the document has not loaded, fail silently...
    if (self.doc === undefined) {
      return false;
    }
    var page = self.doc.getPage(pnum);

    self.canvas.height = page.height * pscale;
    self.canvas.width = page.width * pscale;

    if (this.cbuttons.pnum !== undefined) {
      this.cbuttons.pnum.innerHTML = pnum;
    }
    page.startRendering(self.context);
  }

  // Define or read page properties (auto-rendering afterwards)
  this.page= {
    // The page number
    get number()   { return pnum },
    set number(val)  {
      if (typeof val === "number" && val > 0) {
        pnum = Math.ceil(val);
        self.renderPage()
      }
    },
    // The page scale
    get scale() { return pscale },
    set scale(val) {
      if (typeof val === "number" && val > 0.25 && val <= pdf.page.lastpage) {
        pscale = val;
        self.renderPage()
      }
    },

    // The number of pages
    get lastpage() { return self.doc.numPages }
  };

  this.init = function init() {
    self.page.number = 1;
  }

}

/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

