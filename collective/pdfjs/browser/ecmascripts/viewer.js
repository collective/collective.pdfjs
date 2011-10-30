//
// See README for overview
//

'use strict';

var context = document.location.href.split('/');
context.splice(context.length - 1, 1, 'download');
var pdf_location = context.join('/'); 

PDFJS.getPdf(pdf_location, function getPdfHelloWorld(data) {
  //
  // Instantiate PDFDoc with PDF data
  //
  var pdf = new PDFJS.PDFDoc(data);
  var page = pdf.getPage(1);
  var scale = 1.5;

  //
  // Prepare canvas using PDF page dimensions
  //
  var canvas = document.getElementById('the-canvas');
  var context = canvas.getContext('2d');
  canvas.height = page.height * scale;
  canvas.width = page.width * scale;

  //
  // Render PDF page into canvas context
  //
  page.startRendering(context);
});
