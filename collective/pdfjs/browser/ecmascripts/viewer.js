/* Simple Viewer for pdf.js */

'use strict';

var PdfView = function (url) {
    document.title = this.url = url;
    var self = this;
    this.scale = 1.0;
    this.canvas = document.getElementById('the-canvas');
    this.context = this.canvas.getContext('2d');
    this.pagenum = 1;

    PDFJS.getPdf(url, function getPdfData(data) {
        self.doc = new PDFJS.PDFDoc(data);
    });

    this.renderPage = function (num) {
        var page = self.doc.getPage(num);
        self.canvas.height = page.height * self.scale;
        self.canvas.width = page.width * self.scale;
        page.startRendering(self.context);
    };

    this.renderNextPage = function () {
        self.renderPage(++this.pagenum);
    }

    this.renderPrevPage = function () {
        self.renderPage(--this.pagenum);
    }

}


/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
