/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var context = document.location.href.split('/');
context.splice(context.length - 1, 1, 'download');
var kDefaultURL = context.join('/'); 
var kDefaultScale = 0.5;
var kDefaultScaleDelta = 1.1;
var kCacheSize = 20;
var kCssUnits = 96.0 / 72.0;
var kScrollbarPadding = 40;
var kMinScale = 0.25;
var kMaxScale = 4.0;


var Cache = function cacheCache(size) {
  var data = [];
  this.push = function cachePush(view) {
    var i = data.indexOf(view);
    if (i >= 0)
      data.splice(i);
    data.push(view);
    if (data.length > size)
      data.shift().update();
  };
};

var cache = new Cache(kCacheSize);
var currentPageNumber = 1;

var PDFView = {
  pages: [],
  thumbnails: [],
  currentScale: kDefaultScale,
  initialBookmark: document.location.hash.substring(1),

  setScale: function pdfViewSetScale(val, resetAutoSettings) {
    var pages = this.pages;
    for (var i = 0; i < pages.length; i++)
      pages[i].update(val * kCssUnits);

    if (this.currentScale != val)
      this.pages[this.page - 1].scrollIntoView();
    this.currentScale = val;

    var event = document.createEvent('UIEvents');
    event.initUIEvent('scalechange', false, false, window, 0);
    event.scale = val;
    event.resetAutoSettings = resetAutoSettings;
    window.dispatchEvent(event);
  },

  parseScale: function pdfViewParseScale(value, resetAutoSettings) {
    if ('custom' == value)
      return;

    var scale = parseFloat(value);
    if (scale) {
      this.setScale(scale, true);
      return;
    }

    var currentPage = this.pages[this.page - 1];
    var pageWidthScale = (window.innerWidth - kScrollbarPadding) /
                          currentPage.width / kCssUnits;
    var pageHeightScale = (window.innerHeight - kScrollbarPadding) /
                           currentPage.height / kCssUnits;
    if ('page-width' == value)
      this.setScale(pageWidthScale, resetAutoSettings);
    if ('page-height' == value)
      this.setScale(pageHeightScale, resetAutoSettings);
    if ('page-fit' == value) {
      this.setScale(
        Math.min(pageWidthScale, pageHeightScale), resetAutoSettings);
    }
  },

  zoomIn: function pdfViewZoomIn() {
    var newScale = Math.min(kMaxScale, this.currentScale * kDefaultScaleDelta);
    this.setScale(newScale, true);
  },

  zoomOut: function pdfViewZoomOut() {
    var newScale = Math.max(kMinScale, this.currentScale / kDefaultScaleDelta);
    this.setScale(newScale, true);
  },

  set page(val) {
    var pages = this.pages;
    var input = document.getElementById('pageNumber');
    if (!(0 < val && val <= pages.length)) {
      var event = document.createEvent('UIEvents');
      event.initUIEvent('pagechange', false, false, window, 0);
      event.pageNumber = this.page;
      window.dispatchEvent(event);
      return;
    }

    currentPageNumber = val;
    var event = document.createEvent('UIEvents');
    event.initUIEvent('pagechange', false, false, window, 0);
    event.pageNumber = val;
    window.dispatchEvent(event);

    // checking if the this.page was called from the updateViewarea function:
    // avoiding the creation of two "set page" method (internal and public)
    if (updateViewarea.inProgress)
      return;

    // Avoid scrolling the first page during loading
    if (this.loading && val == 1)
      return;

    pages[val - 1].scrollIntoView();
  },

  get page() {
    return currentPageNumber;
  },

  open: function pdfViewOpen(url, scale) {
    document.title = this.url = url;

    var self = this;
    PDFJS.getPdf(
      {
        url: url,
        progress: function getPdfProgress(evt) {
          if (evt.lengthComputable)
            self.progress(evt.loaded / evt.total);
        },
        error: self.error
      },
      function getPdfLoad(data) {
        self.loading = true;
        self.load(data, scale);
        self.loading = false;
      });
  },

  download: function pdfViewDownload() {
    window.open(this.url + '?pdfjs.action=download', '_parent');
  },

  navigateTo: function pdfViewNavigateTo(dest) {
    if (typeof dest === 'string')
      dest = this.destinations[dest];
    if (!(dest instanceof Array))
      return; // invalid destination
    // dest array looks like that: <page-ref> </XYZ|FitXXX> <args..>
    var destRef = dest[0];
    var pageNumber = destRef instanceof Object ?
      this.pagesRefMap[destRef.num + ' ' + destRef.gen + ' R'] : (destRef + 1);
    if (pageNumber) {
      this.page = pageNumber;
      var currentPage = this.pages[pageNumber - 1];
      currentPage.scrollIntoView(dest);
    }
  },

  getDestinationHash: function pdfViewGetDestinationHash(dest) {
    if (typeof dest === 'string')
      return '#' + escape(dest);
    if (dest instanceof Array) {
      var destRef = dest[0]; // see navigateTo method for dest format
      var pageNumber = destRef instanceof Object ?
        this.pagesRefMap[destRef.num + ' ' + destRef.gen + ' R'] :
        (destRef + 1);
      if (pageNumber) {
        var pdfOpenParams = '#page=' + pageNumber;
        if (isName(dest[1], 'XYZ')) {
          var scale = (dest[4] || this.currentScale);
          pdfOpenParams += '&zoom=' + (scale * 100);
          if (dest[2] || dest[3]) {
            pdfOpenParams += ',' + (dest[2] || 0) + ',' + (dest[3] || 0);
          }
        }
        return pdfOpenParams;
      }
    }
    return '';
  },

  error: function pdfViewError() {
    var loadingIndicator = document.getElementById('loading');
    loadingIndicator.innerHTML = 'Error';
  },

  progress: function pdfViewProgress(level) {
    var percent = Math.round(level * 100);
    var loadingIndicator = document.getElementById('loading');
    loadingIndicator.innerHTML = 'Loading... ' + percent + '%';
  },

  load: function pdfViewLoad(data, scale) {
    var loadingIndicator = document.getElementById('loading');
    loadingIndicator.setAttribute('hidden', 'true');

    var sidebar = document.getElementById('sidebarView');
    sidebar.parentNode.scrollTop = 0;

    while (sidebar.hasChildNodes())
      sidebar.removeChild(sidebar.lastChild);

    if ('_loadingInterval' in sidebar)
      clearInterval(sidebar._loadingInterval);

    var container = document.getElementById('viewer');
    while (container.hasChildNodes())
      container.removeChild(container.lastChild);

    var pdf = new PDFJS.PDFDoc(data);
    var pagesCount = pdf.numPages;
    document.getElementById('numPages').innerHTML = pagesCount;
    document.getElementById('pageNumber').max = pagesCount;

    var pages = this.pages = [];
    var pagesRefMap = {};
    var thumbnails = this.thumbnails = [];
    for (var i = 1; i <= pagesCount; i++) {
      var page = pdf.getPage(i);
      pages.push(new PageView(container, page, i, page.width, page.height,
                              page.stats, this.navigateTo.bind(this)));
      thumbnails.push(new ThumbnailView(sidebar, page, i,
                                        page.width / page.height));
      var pageRef = page.ref;
      pagesRefMap[pageRef.num + ' ' + pageRef.gen + ' R'] = i;
    }

    this.setScale(scale || kDefaultScale, true);

    this.pagesRefMap = pagesRefMap;
    this.destinations = pdf.catalog.destinations;
    if (pdf.catalog.documentOutline) {
      this.outline = new DocumentOutlineView(pdf.catalog.documentOutline);
      var outlineSwitchButton = document.getElementById('outlineSwitch');
      outlineSwitchButton.removeAttribute('disabled');
      this.switchSidebarView('outline');
    }

    if (this.initialBookmark) {
      this.setHash(this.initialBookmark);
      this.initialBookmark = null;
    }
    else
      this.page = 1;
  },

  setHash: function pdfViewSetHash(hash) {
    if (!hash)
      return;

    if (hash.indexOf('=') >= 0) {
      // parsing query string
      var paramsPairs = hash.split('&');
      var params = {};
      for (var i = 0; i < paramsPairs.length; ++i) {
        var paramPair = paramsPairs[i].split('=');
        params[paramPair[0]] = paramPair[1];
      }
      // borrowing syntax from "Parameters for Opening PDF Files"
      if ('nameddest' in params) {
        PDFView.navigateTo(params.nameddest);
        return;
      }
      if ('page' in params) {
        var pageNumber = (params.page | 0) || 1;
        this.page = pageNumber;
        if ('zoom' in params) {
          var zoomArgs = params.zoom.split(','); // scale,left,top
          // building destination array
          var dest = [null, new Name('XYZ'), (zoomArgs[1] | 0),
            (zoomArgs[2] | 0), (zoomArgs[0] | 0) / 100];
          var currentPage = this.pages[pageNumber - 1];
          currentPage.scrollIntoView(dest);
        } else
          this.page = params.page; // simple page
        return;
      }
    } else if (/^\d+$/.test(hash)) // page number
      this.page = hash;
    else // named destination
      PDFView.navigateTo(unescape(hash));
  },

  switchSidebarView: function pdfViewSwitchSidebarView(view) {
    var thumbsScrollView = document.getElementById('sidebarScrollView');
    var outlineScrollView = document.getElementById('outlineScrollView');
    var thumbsSwitchButton = document.getElementById('thumbsSwitch');
    var outlineSwitchButton = document.getElementById('outlineSwitch');
    switch (view) {
      case 'thumbs':
        thumbsScrollView.removeAttribute('hidden');
        outlineScrollView.setAttribute('hidden', 'true');
        thumbsSwitchButton.setAttribute('data-selected', true);
        outlineSwitchButton.removeAttribute('data-selected');
        break;
      case 'outline':
        thumbsScrollView.setAttribute('hidden', 'true');
        outlineScrollView.removeAttribute('hidden');
        thumbsSwitchButton.removeAttribute('data-selected');
        outlineSwitchButton.setAttribute('data-selected', true);
        break;
    }
  },

  getVisiblePages: function pdfViewGetVisiblePages() {
    var pages = this.pages;
    var kBottomMargin = 10;
    var visiblePages = [];

    var currentHeight = kBottomMargin;
    var windowTop = window.pageYOffset;
    for (var i = 1; i <= pages.length; ++i) {
      var page = pages[i - 1];
      var pageHeight = page.height * page.scale + kBottomMargin;
      if (currentHeight + pageHeight > windowTop)
        break;

      currentHeight += pageHeight;
    }

    var windowBottom = window.pageYOffset + window.innerHeight;
    for (; i <= pages.length && currentHeight < windowBottom; ++i) {
      var singlePage = pages[i - 1];
      visiblePages.push({ id: singlePage.id, y: currentHeight,
                          view: singlePage });
      currentHeight += singlePage.height * singlePage.scale + kBottomMargin;
    }
    return visiblePages;
  }
};

var PageView = function pageView(container, content, id, pageWidth, pageHeight,
                                 stats, navigateTo) {
  this.id = id;
  this.content = content;

  var view = this.content.view;
  this.x = view.x;
  this.y = view.y;
  this.width = view.width;
  this.height = view.height;

  var anchor = document.createElement('a');
  anchor.name = '' + this.id;

  var div = document.createElement('div');
  div.id = 'pageContainer' + this.id;
  div.className = 'page';

  container.appendChild(anchor);
  container.appendChild(div);

  this.update = function pageViewUpdate(scale) {
    this.scale = scale || this.scale;
    div.style.width = (this.width * this.scale) + 'px';
    div.style.height = (this.height * this.scale) + 'px';

    while (div.hasChildNodes())
      div.removeChild(div.lastChild);
    div.removeAttribute('data-loaded');
  };

  function setupLinks(content, scale) {
    function bindLink(link, dest) {
      link.href = PDFView.getDestinationHash(dest);
      link.onclick = function pageViewSetupLinksOnclick() {
        if (dest)
          PDFView.navigateTo(dest);
        return false;
      };
    }

    var links = content.getLinks();
    for (var i = 0; i < links.length; i++) {
      var link = document.createElement('a');
      link.style.left = (Math.floor(links[i].x - view.x) * scale) + 'px';
      link.style.top = (Math.floor(links[i].y - view.y) * scale) + 'px';
      link.style.width = Math.ceil(links[i].width * scale) + 'px';
      link.style.height = Math.ceil(links[i].height * scale) + 'px';
      link.href = links[i].url || '';
      if (!links[i].url)
        bindLink(link, ('dest' in links[i]) ? links[i].dest : null);
      div.appendChild(link);
    }
  }

  this.getPagePoint = function pageViewGetPagePoint(x, y) {
    var scale = PDFView.currentScale;
    return this.content.rotatePoint(x / scale, y / scale);
  };

  this.scrollIntoView = function pageViewScrollIntoView(dest) {
      if (!dest) {
        div.scrollIntoView(true);
        return;
      }

      var x = 0, y = 0;
      var width = 0, height = 0, widthScale, heightScale;
      var scale = 0;
      switch (dest[1].name) {
        case 'XYZ':
          x = dest[2];
          y = dest[3];
          scale = dest[4];
          break;
        case 'Fit':
        case 'FitB':
          scale = 'page-fit';
          break;
        case 'FitH':
        case 'FitBH':
          y = dest[2];
          scale = 'page-width';
          break;
        case 'FitV':
        case 'FitBV':
          x = dest[2];
          scale = 'page-height';
          break;
        case 'FitR':
          x = dest[2];
          y = dest[3];
          width = dest[4] - x;
          height = dest[5] - y;
          widthScale = (window.innerWidth - kScrollbarPadding) /
            width / kCssUnits;
          heightScale = (window.innerHeight - kScrollbarPadding) /
            height / kCssUnits;
          scale = Math.min(widthScale, heightScale);
          break;
        default:
          return;
      }

      var boundingRect = [
        this.content.rotatePoint(x, y),
        this.content.rotatePoint(x + width, y + height)
      ];

      if (scale && scale !== PDFView.currentScale)
        PDFView.setScale(scale, true);

      setTimeout(function pageViewScrollIntoViewRelayout() {
        // letting page to re-layout before scrolling
        var scale = PDFView.currentScale;
        var x = Math.min(boundingRect[0].x, boundingRect[1].x);
        var y = Math.min(boundingRect[0].y, boundingRect[1].y);
        var width = Math.abs(boundingRect[0].x - boundingRect[1].x);
        var height = Math.abs(boundingRect[0].y - boundingRect[1].y);

        // using temporary div to scroll it into view
        var tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = Math.floor(x * scale) + 'px';
        tempDiv.style.top = Math.floor(y * scale) + 'px';
        tempDiv.style.width = Math.ceil(width * scale) + 'px';
        tempDiv.style.height = Math.ceil(height * scale) + 'px';
        div.appendChild(tempDiv);
        tempDiv.scrollIntoView(true);
        div.removeChild(tempDiv);
      }, 0);
  };

  this.draw = function pageviewDraw() {
    if (div.hasChildNodes()) {
      this.updateStats();
      return false;
    }

    var canvas = document.createElement('canvas');
    canvas.id = 'page' + this.id;
    canvas.mozOpaque = true;
    div.appendChild(canvas);

    var scale = this.scale;
    canvas.width = pageWidth * scale;
    canvas.height = pageHeight * scale;

    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.translate(-this.x * scale, -this.y * scale);

    stats.begin = Date.now();
    this.content.startRendering(ctx, this.updateStats);

    setupLinks(this.content, this.scale);
    div.setAttribute('data-loaded', true);

    return true;
  };

  this.updateStats = function pageViewUpdateStats() {
	// -- collective.pdfjs
	//	  No need to display stats
    //var t1 = stats.compile, t2 = stats.fonts, t3 = stats.render;
    //var str = 'Time to compile/fonts/render: ' +
    //          (t1 - stats.begin) + '/' + (t2 - t1) + '/' + (t3 - t2) + ' ms';
    //document.getElementById('info').innerHTML = str;
  };
};

var ThumbnailView = function thumbnailView(container, page, id, pageRatio) {
  var anchor = document.createElement('a');
  anchor.href = '#' + id;
  anchor.onclick = function stopNivigation() {
    PDFView.page = id;
    return false;
  };

  var div = document.createElement('div');
  div.id = 'thumbnailContainer' + id;
  div.className = 'thumbnail';

  anchor.appendChild(div);
  container.appendChild(anchor);

  this.draw = function thumbnailViewDraw() {
    if (div.hasChildNodes())
      return;

    var canvas = document.createElement('canvas');
    canvas.id = 'thumbnail' + id;
    canvas.mozOpaque = true;

    var maxThumbSize = 134;
    canvas.width = pageRatio >= 1 ? maxThumbSize :
      maxThumbSize * pageRatio;
    canvas.height = pageRatio <= 1 ? maxThumbSize :
      maxThumbSize / pageRatio;

    div.setAttribute('data-loaded', true);
    div.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    var view = page.view;
    var scaleX = (canvas.width / page.width);
    var scaleY = (canvas.height / page.height);
    ctx.translate(-view.x * scaleX, -view.y * scaleY);
    div.style.width = (view.width * scaleX) + 'px';
    div.style.height = (view.height * scaleY) + 'px';
    div.style.lineHeight = (view.height * scaleY) + 'px';

    page.startRendering(ctx, function thumbnailViewDrawStartRendering() {});
  };
};

var DocumentOutlineView = function documentOutlineView(outline) {
  var outlineView = document.getElementById('outlineView');

  function bindItemLink(domObj, item) {
    domObj.href = PDFView.getDestinationHash(item.dest);
    domObj.onclick = function documentOutlineViewOnclick(e) {
      PDFView.navigateTo(item.dest);
      return false;
    };
  }

  var queue = [{parent: outlineView, items: outline}];
  while (queue.length > 0) {
    var levelData = queue.shift();
    var i, n = levelData.items.length;
    for (i = 0; i < n; i++) {
      var item = levelData.items[i];
      var div = document.createElement('div');
      div.className = 'outlineItem';
      var a = document.createElement('a');
      bindItemLink(a, item);
      a.textContent = item.title;
      div.appendChild(a);

      if (item.items.length > 0) {
        var itemsDiv = document.createElement('div');
        itemsDiv.className = 'outlineItems';
        div.appendChild(itemsDiv);
        queue.push({parent: itemsDiv, items: item.items});
      }

      levelData.parent.appendChild(div);
    }
  }
};

window.addEventListener('load', function webViewerLoad(evt) {
  var params = document.location.search.substring(1).split('&');
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split('=');
    params[unescape(param[0])] = unescape(param[1]);
  }

  var scale = ('scale' in params) ? params.scale : kDefaultScale;
  PDFView.open(params.file || kDefaultURL, parseFloat(scale));

  // -- collective.pdfjs
  // 	The File selector is disabled
  //if (!window.File || !window.FileReader || !window.FileList || !window.Blob)
  //  document.getElementById('fileInput').setAttribute('hidden', 'true');
  //else
  //  document.getElementById('fileInput').value = null;
}, true);

window.addEventListener('unload', function webViewerUnload(evt) {
  window.scrollTo(0, 0);
}, true);

function updateViewarea() {
  var visiblePages = PDFView.getVisiblePages();
  for (var i = 0; i < visiblePages.length; i++) {
    var page = visiblePages[i];
    if (PDFView.pages[page.id - 1].draw())
      cache.push(page.view);
  }

  if (!visiblePages.length)
    return;

  updateViewarea.inProgress = true; // used in "set page"
  var currentId = PDFView.page;
  var firstPage = visiblePages[0];
  PDFView.page = firstPage.id;
  updateViewarea.inProgress = false;

  var kViewerTopMargin = 52;
  var pageNumber = firstPage.id;
  var pdfOpenParams = '#page=' + pageNumber;
  pdfOpenParams += '&zoom=' + Math.round(PDFView.currentScale * 100);
  var currentPage = PDFView.pages[pageNumber - 1];
  var topLeft = currentPage.getPagePoint(window.pageXOffset,
    window.pageYOffset - firstPage.y - kViewerTopMargin);
  pdfOpenParams += ',' + Math.round(topLeft.x) + ',' + Math.round(topLeft.y);
  document.getElementById('viewBookmark').href = pdfOpenParams;
}

window.addEventListener('scroll', function webViewerScroll(evt) {
  updateViewarea();
}, true);

window.addEventListener('resize', function webViewerResize(evt) {
  if (document.getElementById('pageWidthOption').selected ||
      document.getElementById('pageFitOption').selected)
      PDFView.parseScale(document.getElementById('scaleSelect').value);
  updateViewarea();
});

window.addEventListener('hashchange', function webViewerHashchange(evt) {
  PDFView.setHash(document.location.hash.substring(1));
});

window.addEventListener('change', function webViewerChange(evt) {
  var files = evt.target.files;
  if (!files || files.length == 0)
    return;

  // Read the local file into a Uint8Array.
  var fileReader = new FileReader();
  fileReader.onload = function webViewerChangeFileReaderOnload(evt) {
    var data = evt.target.result;
    var buffer = new ArrayBuffer(data.length);
    var uint8Array = new Uint8Array(buffer);

    for (var i = 0; i < data.length; i++)
      uint8Array[i] = data.charCodeAt(i);
    PDFView.load(uint8Array);
  };

  // Read as a binary string since "readAsArrayBuffer" is not yet
  // implemented in Firefox.
  var file = files[0];
  fileReader.readAsBinaryString(file);

  document.title = file.name;

  // URL does not reflect proper document location - hiding some icons.
  document.getElementById('viewBookmark').setAttribute('hidden', 'true');
  document.getElementById('download').setAttribute('hidden', 'true');
}, true);

window.addEventListener('transitionend', function webViewerTransitionend(evt) {
  var pageIndex = 0;
  var pagesCount = PDFView.pages.length;

  var container = document.getElementById('sidebarView');
  container._interval = window.setInterval(function interval() {
    if (pageIndex >= pagesCount) {
      window.clearInterval(container._interval);
      return;
    }

    PDFView.thumbnails[pageIndex++].draw();
  }, 500);
}, true);

window.addEventListener('scalechange', function scalechange(evt) {
  var customScaleOption = document.getElementById('customScaleOption');
  customScaleOption.selected = false;

  if (!evt.resetAutoSettings &&
       (document.getElementById('pageWidthOption').selected ||
        document.getElementById('pageFitOption').selected)) {
      updateViewarea();
      return;
  }

  var options = document.getElementById('scaleSelect').options;
  var predefinedValueFound = false;
  var value = '' + evt.scale;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (option.value != value) {
      option.selected = false;
      continue;
    }
    option.selected = true;
    predefinedValueFound = true;
  }

  if (!predefinedValueFound) {
    customScaleOption.textContent = Math.round(evt.scale * 10000) / 100 + '%';
    customScaleOption.selected = true;
  }

  updateViewarea();
}, true);

window.addEventListener('pagechange', function pagechange(evt) {
  var page = evt.pageNumber;
  if (document.getElementById('pageNumber').value != page)
    document.getElementById('pageNumber').value = page;
  document.getElementById('previous').disabled = (page <= 1);
  document.getElementById('next').disabled = (page >= PDFView.pages.length);
}, true);

window.addEventListener('keydown', function keydown(evt) {
  var curElement = document.activeElement;
  var controlsElement = document.getElementById('controls');
  while (curElement) {
    if (curElement === controlsElement)
      return; // ignoring if the 'controls' element is focused
    curElement = curElement.parentNode;
  }
  switch (evt.keyCode) {
    case 61: // FF/Mac '='
    case 107: // FF '+' and '='
    case 187: // Chrome '+'
      PDFView.zoomIn();
      break;
    case 109: // FF '-'
    case 189: // Chrome '-'
      PDFView.zoomOut();
      break;
    case 48: // '0'
      PDFView.setScale(kDefaultScale, true);
      break;
  }
});
