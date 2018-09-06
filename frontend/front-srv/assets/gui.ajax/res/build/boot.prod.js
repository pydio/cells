(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioBootstrap = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * docReady v1.0.4
 * Cross browser DOMContentLoaded event emitter
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true*/
/*global define: false, require: false, module: false */

( function( window ) {

'use strict';

var document = window.document;
// collection of functions to be triggered on ready
var queue = [];

function docReady( fn ) {
  // throw out non-functions
  if ( typeof fn !== 'function' ) {
    return;
  }

  if ( docReady.isReady ) {
    // ready now, hit it
    fn();
  } else {
    // queue function when ready
    queue.push( fn );
  }
}

docReady.isReady = false;

// triggered on various doc ready events
function onReady( event ) {
  // bail if already triggered or IE8 document is not ready just yet
  var isIE8NotReady = event.type === 'readystatechange' && document.readyState !== 'complete';
  if ( docReady.isReady || isIE8NotReady ) {
    return;
  }

  trigger();
}

function trigger() {
  docReady.isReady = true;
  // process queue
  for ( var i=0, len = queue.length; i < len; i++ ) {
    var fn = queue[i];
    fn();
  }
}

function defineDocReady( eventie ) {
  // trigger ready if page is ready
  if ( document.readyState === 'complete' ) {
    trigger();
  } else {
    // listen for events
    eventie.bind( document, 'DOMContentLoaded', onReady );
    eventie.bind( document, 'readystatechange', onReady );
    eventie.bind( window, 'load', onReady );
  }

  return docReady;
}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [ 'eventie/eventie' ], defineDocReady );
} else if ( typeof exports === 'object' ) {
  module.exports = defineDocReady( require('eventie') );
} else {
  // browser global
  window.docReady = defineDocReady( window.eventie );
}

})( window );

},{"eventie":2}],2:[function(require,module,exports){
/*!
 * eventie v1.0.6
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( window );

},{}],3:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status === undefined ? 200 : options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],4:[function(require,module,exports){
(function (global){
(function(){'use strict';var k=this;
function aa(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}function l(a){return"string"==typeof a}function ba(a,b,c){return a.call.apply(a.bind,arguments)}function ca(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}
function da(a,b,c){da=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ba:ca;return da.apply(null,arguments)}function ea(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}}
function m(a){var b=n;function c(){}c.prototype=b.prototype;a.G=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.F=function(a,c,f){for(var g=Array(arguments.length-2),h=2;h<arguments.length;h++)g[h-2]=arguments[h];return b.prototype[c].apply(a,g)}};/*

 The MIT License

 Copyright (c) 2007 Cybozu Labs, Inc.
 Copyright (c) 2012 Google Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/
var fa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function q(a,b){return-1!=a.indexOf(b)}function ga(a,b){return a<b?-1:a>b?1:0};var ha=Array.prototype.indexOf?function(a,b,c){return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(l(a))return l(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},r=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=l(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},ia=Array.prototype.filter?function(a,b,c){return Array.prototype.filter.call(a,
b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g=l(a)?a.split(""):a,h=0;h<d;h++)if(h in g){var p=g[h];b.call(c,p,h,a)&&(e[f++]=p)}return e},t=Array.prototype.reduce?function(a,b,c,d){d&&(b=da(b,d));return Array.prototype.reduce.call(a,b,c)}:function(a,b,c,d){var e=c;r(a,function(c,g){e=b.call(d,e,c,g,a)});return e},ja=Array.prototype.some?function(a,b,c){return Array.prototype.some.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=l(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;
return!1};function ka(a,b){var c;a:{c=a.length;for(var d=l(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){c=e;break a}c=-1}return 0>c?null:l(a)?a.charAt(c):a[c]}function la(a){return Array.prototype.concat.apply(Array.prototype,arguments)}function ma(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)};var u;a:{var na=k.navigator;if(na){var oa=na.userAgent;if(oa){u=oa;break a}}u=""};var pa=q(u,"Opera")||q(u,"OPR"),v=q(u,"Trident")||q(u,"MSIE"),qa=q(u,"Edge"),ra=q(u,"Gecko")&&!(q(u.toLowerCase(),"webkit")&&!q(u,"Edge"))&&!(q(u,"Trident")||q(u,"MSIE"))&&!q(u,"Edge"),sa=q(u.toLowerCase(),"webkit")&&!q(u,"Edge");function ta(){var a=k.document;return a?a.documentMode:void 0}var ua;
a:{var va="",wa=function(){var a=u;if(ra)return/rv\:([^\);]+)(\)|;)/.exec(a);if(qa)return/Edge\/([\d\.]+)/.exec(a);if(v)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(sa)return/WebKit\/(\S+)/.exec(a);if(pa)return/(?:Version)[ \/]?(\S+)/.exec(a)}();wa&&(va=wa?wa[1]:"");if(v){var xa=ta();if(null!=xa&&xa>parseFloat(va)){ua=String(xa);break a}}ua=va}var ya={};
function za(a){if(!ya[a]){for(var b=0,c=fa(String(ua)).split("."),d=fa(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"",p=/(\d*)(\D*)/g,y=/(\d*)(\D*)/g;do{var D=p.exec(g)||["","",""],X=y.exec(h)||["","",""];if(0==D[0].length&&0==X[0].length)break;b=ga(0==D[1].length?0:parseInt(D[1],10),0==X[1].length?0:parseInt(X[1],10))||ga(0==D[2].length,0==X[2].length)||ga(D[2],X[2])}while(0==b)}ya[a]=0<=b}}
var Aa=k.document,Ba=Aa&&v?ta()||("CSS1Compat"==Aa.compatMode?parseInt(ua,10):5):void 0;var w=v&&!(9<=Number(Ba)),Ca=v&&!(8<=Number(Ba));function x(a,b,c,d){this.a=a;this.nodeName=c;this.nodeValue=d;this.nodeType=2;this.parentNode=this.ownerElement=b}function Da(a,b){var c=Ca&&"href"==b.nodeName?a.getAttribute(b.nodeName,2):b.nodeValue;return new x(b,a,b.nodeName,c)};function z(a){var b=null,c=a.nodeType;1==c&&(b=a.textContent,b=void 0==b||null==b?a.innerText:b,b=void 0==b||null==b?"":b);if("string"!=typeof b)if(w&&"title"==a.nodeName.toLowerCase()&&1==c)b=a.text;else if(9==c||1==c){a=9==c?a.documentElement:a.firstChild;for(var c=0,d=[],b="";a;){do 1!=a.nodeType&&(b+=a.nodeValue),w&&"title"==a.nodeName.toLowerCase()&&(b+=a.text),d[c++]=a;while(a=a.firstChild);for(;c&&!(a=d[--c].nextSibling););}}else b=a.nodeValue;return""+b}
function A(a,b,c){if(null===b)return!0;try{if(!a.getAttribute)return!1}catch(d){return!1}Ca&&"class"==b&&(b="className");return null==c?!!a.getAttribute(b):a.getAttribute(b,2)==c}function B(a,b,c,d,e){return(w?Ea:Fa).call(null,a,b,l(c)?c:null,l(d)?d:null,e||new C)}
function Ea(a,b,c,d,e){if(a instanceof E||8==a.b||c&&null===a.b){var f=b.all;if(!f)return e;a=Ga(a);if("*"!=a&&(f=b.getElementsByTagName(a),!f))return e;if(c){for(var g=[],h=0;b=f[h++];)A(b,c,d)&&g.push(b);f=g}for(h=0;b=f[h++];)"*"==a&&"!"==b.tagName||F(e,b);return e}Ha(a,b,c,d,e);return e}
function Fa(a,b,c,d,e){b.getElementsByName&&d&&"name"==c&&!v?(b=b.getElementsByName(d),r(b,function(b){a.a(b)&&F(e,b)})):b.getElementsByClassName&&d&&"class"==c?(b=b.getElementsByClassName(d),r(b,function(b){b.className==d&&a.a(b)&&F(e,b)})):a instanceof G?Ha(a,b,c,d,e):b.getElementsByTagName&&(b=b.getElementsByTagName(a.f()),r(b,function(a){A(a,c,d)&&F(e,a)}));return e}
function Ia(a,b,c,d,e){var f;if((a instanceof E||8==a.b||c&&null===a.b)&&(f=b.childNodes)){var g=Ga(a);if("*"!=g&&(f=ia(f,function(a){return a.tagName&&a.tagName.toLowerCase()==g}),!f))return e;c&&(f=ia(f,function(a){return A(a,c,d)}));r(f,function(a){"*"==g&&("!"==a.tagName||"*"==g&&1!=a.nodeType)||F(e,a)});return e}return Ja(a,b,c,d,e)}function Ja(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)A(b,c,d)&&a.a(b)&&F(e,b);return e}
function Ha(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)A(b,c,d)&&a.a(b)&&F(e,b),Ha(a,b,c,d,e)}function Ga(a){if(a instanceof G){if(8==a.b)return"!";if(null===a.b)return"*"}return a.f()};!ra&&!v||v&&9<=Number(Ba)||ra&&za("1.9.1");v&&za("9");function Ka(a,b){if(!a||!b)return!1;if(a.contains&&1==b.nodeType)return a==b||a.contains(b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||!!(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b.parentNode;return b==a}
function La(a,b){if(a==b)return 0;if(a.compareDocumentPosition)return a.compareDocumentPosition(b)&2?1:-1;if(v&&!(9<=Number(Ba))){if(9==a.nodeType)return-1;if(9==b.nodeType)return 1}if("sourceIndex"in a||a.parentNode&&"sourceIndex"in a.parentNode){var c=1==a.nodeType,d=1==b.nodeType;if(c&&d)return a.sourceIndex-b.sourceIndex;var e=a.parentNode,f=b.parentNode;return e==f?Ma(a,b):!c&&Ka(e,b)?-1*Na(a,b):!d&&Ka(f,a)?Na(b,a):(c?a.sourceIndex:e.sourceIndex)-(d?b.sourceIndex:f.sourceIndex)}d=9==a.nodeType?
a:a.ownerDocument||a.document;c=d.createRange();c.selectNode(a);c.collapse(!0);d=d.createRange();d.selectNode(b);d.collapse(!0);return c.compareBoundaryPoints(k.Range.START_TO_END,d)}function Na(a,b){var c=a.parentNode;if(c==b)return-1;for(var d=b;d.parentNode!=c;)d=d.parentNode;return Ma(d,a)}function Ma(a,b){for(var c=b;c=c.previousSibling;)if(c==a)return-1;return 1};function C(){this.b=this.a=null;this.l=0}function Oa(a){this.node=a;this.a=this.b=null}function Pa(a,b){if(!a.a)return b;if(!b.a)return a;for(var c=a.a,d=b.a,e=null,f=null,g=0;c&&d;){var f=c.node,h=d.node;f==h||f instanceof x&&h instanceof x&&f.a==h.a?(f=c,c=c.a,d=d.a):0<La(c.node,d.node)?(f=d,d=d.a):(f=c,c=c.a);(f.b=e)?e.a=f:a.a=f;e=f;g++}for(f=c||d;f;)f.b=e,e=e.a=f,g++,f=f.a;a.b=e;a.l=g;return a}function Qa(a,b){var c=new Oa(b);c.a=a.a;a.b?a.a.b=c:a.a=a.b=c;a.a=c;a.l++}
function F(a,b){var c=new Oa(b);c.b=a.b;a.a?a.b.a=c:a.a=a.b=c;a.b=c;a.l++}function Ra(a){return(a=a.a)?a.node:null}function Sa(a){return(a=Ra(a))?z(a):""}function H(a,b){return new Ta(a,!!b)}function Ta(a,b){this.f=a;this.b=(this.c=b)?a.b:a.a;this.a=null}function I(a){var b=a.b;if(null==b)return null;var c=a.a=b;a.b=a.c?b.b:b.a;return c.node};function n(a){this.i=a;this.b=this.g=!1;this.f=null}function J(a){return"\n  "+a.toString().split("\n").join("\n  ")}function Ua(a,b){a.g=b}function Va(a,b){a.b=b}function K(a,b){var c=a.a(b);return c instanceof C?+Sa(c):+c}function L(a,b){var c=a.a(b);return c instanceof C?Sa(c):""+c}function M(a,b){var c=a.a(b);return c instanceof C?!!c.l:!!c};function N(a,b,c){n.call(this,a.i);this.c=a;this.h=b;this.o=c;this.g=b.g||c.g;this.b=b.b||c.b;this.c==Wa&&(c.b||c.g||4==c.i||0==c.i||!b.f?b.b||b.g||4==b.i||0==b.i||!c.f||(this.f={name:c.f.name,s:b}):this.f={name:b.f.name,s:c})}m(N);
function O(a,b,c,d,e){b=b.a(d);c=c.a(d);var f;if(b instanceof C&&c instanceof C){b=H(b);for(d=I(b);d;d=I(b))for(e=H(c),f=I(e);f;f=I(e))if(a(z(d),z(f)))return!0;return!1}if(b instanceof C||c instanceof C){b instanceof C?(e=b,d=c):(e=c,d=b);f=H(e);for(var g=typeof d,h=I(f);h;h=I(f)){switch(g){case "number":h=+z(h);break;case "boolean":h=!!z(h);break;case "string":h=z(h);break;default:throw Error("Illegal primitive type for comparison.");}if(e==b&&a(h,d)||e==c&&a(d,h))return!0}return!1}return e?"boolean"==
typeof b||"boolean"==typeof c?a(!!b,!!c):"number"==typeof b||"number"==typeof c?a(+b,+c):a(b,c):a(+b,+c)}N.prototype.a=function(a){return this.c.m(this.h,this.o,a)};N.prototype.toString=function(){var a="Binary Expression: "+this.c,a=a+J(this.h);return a+=J(this.o)};function Xa(a,b,c,d){this.a=a;this.w=b;this.i=c;this.m=d}Xa.prototype.toString=function(){return this.a};var Ya={};
function P(a,b,c,d){if(Ya.hasOwnProperty(a))throw Error("Binary operator already created: "+a);a=new Xa(a,b,c,d);return Ya[a.toString()]=a}P("div",6,1,function(a,b,c){return K(a,c)/K(b,c)});P("mod",6,1,function(a,b,c){return K(a,c)%K(b,c)});P("*",6,1,function(a,b,c){return K(a,c)*K(b,c)});P("+",5,1,function(a,b,c){return K(a,c)+K(b,c)});P("-",5,1,function(a,b,c){return K(a,c)-K(b,c)});P("<",4,2,function(a,b,c){return O(function(a,b){return a<b},a,b,c)});
P(">",4,2,function(a,b,c){return O(function(a,b){return a>b},a,b,c)});P("<=",4,2,function(a,b,c){return O(function(a,b){return a<=b},a,b,c)});P(">=",4,2,function(a,b,c){return O(function(a,b){return a>=b},a,b,c)});var Wa=P("=",3,2,function(a,b,c){return O(function(a,b){return a==b},a,b,c,!0)});P("!=",3,2,function(a,b,c){return O(function(a,b){return a!=b},a,b,c,!0)});P("and",2,2,function(a,b,c){return M(a,c)&&M(b,c)});P("or",1,2,function(a,b,c){return M(a,c)||M(b,c)});function Q(a,b,c){this.a=a;this.b=b||1;this.f=c||1};function Za(a,b){if(b.a.length&&4!=a.i)throw Error("Primary expression must evaluate to nodeset if filter has predicate(s).");n.call(this,a.i);this.c=a;this.h=b;this.g=a.g;this.b=a.b}m(Za);Za.prototype.a=function(a){a=this.c.a(a);return $a(this.h,a)};Za.prototype.toString=function(){var a;a="Filter:"+J(this.c);return a+=J(this.h)};function ab(a,b){if(b.length<a.A)throw Error("Function "+a.j+" expects at least"+a.A+" arguments, "+b.length+" given");if(null!==a.v&&b.length>a.v)throw Error("Function "+a.j+" expects at most "+a.v+" arguments, "+b.length+" given");a.B&&r(b,function(b,d){if(4!=b.i)throw Error("Argument "+d+" to function "+a.j+" is not of type Nodeset: "+b);});n.call(this,a.i);this.h=a;this.c=b;Ua(this,a.g||ja(b,function(a){return a.g}));Va(this,a.D&&!b.length||a.C&&!!b.length||ja(b,function(a){return a.b}))}m(ab);
ab.prototype.a=function(a){return this.h.m.apply(null,la(a,this.c))};ab.prototype.toString=function(){var a="Function: "+this.h;if(this.c.length)var b=t(this.c,function(a,b){return a+J(b)},"Arguments:"),a=a+J(b);return a};function bb(a,b,c,d,e,f,g,h,p){this.j=a;this.i=b;this.g=c;this.D=d;this.C=e;this.m=f;this.A=g;this.v=void 0!==h?h:g;this.B=!!p}bb.prototype.toString=function(){return this.j};var cb={};
function R(a,b,c,d,e,f,g,h){if(cb.hasOwnProperty(a))throw Error("Function already created: "+a+".");cb[a]=new bb(a,b,c,d,!1,e,f,g,h)}R("boolean",2,!1,!1,function(a,b){return M(b,a)},1);R("ceiling",1,!1,!1,function(a,b){return Math.ceil(K(b,a))},1);R("concat",3,!1,!1,function(a,b){return t(ma(arguments,1),function(b,d){return b+L(d,a)},"")},2,null);R("contains",2,!1,!1,function(a,b,c){return q(L(b,a),L(c,a))},2);R("count",1,!1,!1,function(a,b){return b.a(a).l},1,1,!0);
R("false",2,!1,!1,function(){return!1},0);R("floor",1,!1,!1,function(a,b){return Math.floor(K(b,a))},1);R("id",4,!1,!1,function(a,b){function c(a){if(w){var b=e.all[a];if(b){if(b.nodeType&&a==b.id)return b;if(b.length)return ka(b,function(b){return a==b.id})}return null}return e.getElementById(a)}var d=a.a,e=9==d.nodeType?d:d.ownerDocument,d=L(b,a).split(/\s+/),f=[];r(d,function(a){a=c(a);!a||0<=ha(f,a)||f.push(a)});f.sort(La);var g=new C;r(f,function(a){F(g,a)});return g},1);
R("lang",2,!1,!1,function(){return!1},1);R("last",1,!0,!1,function(a){if(1!=arguments.length)throw Error("Function last expects ()");return a.f},0);R("local-name",3,!1,!0,function(a,b){var c=b?Ra(b.a(a)):a.a;return c?c.localName||c.nodeName.toLowerCase():""},0,1,!0);R("name",3,!1,!0,function(a,b){var c=b?Ra(b.a(a)):a.a;return c?c.nodeName.toLowerCase():""},0,1,!0);R("namespace-uri",3,!0,!1,function(){return""},0,1,!0);
R("normalize-space",3,!1,!0,function(a,b){return(b?L(b,a):z(a.a)).replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"")},0,1);R("not",2,!1,!1,function(a,b){return!M(b,a)},1);R("number",1,!1,!0,function(a,b){return b?K(b,a):+z(a.a)},0,1);R("position",1,!0,!1,function(a){return a.b},0);R("round",1,!1,!1,function(a,b){return Math.round(K(b,a))},1);R("starts-with",2,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);return 0==b.lastIndexOf(a,0)},2);R("string",3,!1,!0,function(a,b){return b?L(b,a):z(a.a)},0,1);
R("string-length",1,!1,!0,function(a,b){return(b?L(b,a):z(a.a)).length},0,1);R("substring",3,!1,!1,function(a,b,c,d){c=K(c,a);if(isNaN(c)||Infinity==c||-Infinity==c)return"";d=d?K(d,a):Infinity;if(isNaN(d)||-Infinity===d)return"";c=Math.round(c)-1;var e=Math.max(c,0);a=L(b,a);return Infinity==d?a.substring(e):a.substring(e,c+Math.round(d))},2,3);R("substring-after",3,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);c=b.indexOf(a);return-1==c?"":b.substring(c+a.length)},2);
R("substring-before",3,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);a=b.indexOf(a);return-1==a?"":b.substring(0,a)},2);R("sum",1,!1,!1,function(a,b){for(var c=H(b.a(a)),d=0,e=I(c);e;e=I(c))d+=+z(e);return d},1,1,!0);R("translate",3,!1,!1,function(a,b,c,d){b=L(b,a);c=L(c,a);var e=L(d,a);a={};for(d=0;d<c.length;d++){var f=c.charAt(d);f in a||(a[f]=e.charAt(d))}c="";for(d=0;d<b.length;d++)f=b.charAt(d),c+=f in a?a[f]:f;return c},3);R("true",2,!1,!1,function(){return!0},0);function G(a,b){this.h=a;this.c=void 0!==b?b:null;this.b=null;switch(a){case "comment":this.b=8;break;case "text":this.b=3;break;case "processing-instruction":this.b=7;break;case "node":break;default:throw Error("Unexpected argument");}}function db(a){return"comment"==a||"text"==a||"processing-instruction"==a||"node"==a}G.prototype.a=function(a){return null===this.b||this.b==a.nodeType};G.prototype.f=function(){return this.h};
G.prototype.toString=function(){var a="Kind Test: "+this.h;null===this.c||(a+=J(this.c));return a};function eb(a){this.b=a;this.a=0}function fb(a){a=a.match(gb);for(var b=0;b<a.length;b++)hb.test(a[b])&&a.splice(b,1);return new eb(a)}var gb=/\$?(?:(?![0-9-\.])(?:\*|[\w-\.]+):)?(?![0-9-\.])(?:\*|[\w-\.]+)|\/\/|\.\.|::|\d+(?:\.\d*)?|\.\d+|"[^"]*"|'[^']*'|[!<>]=|\s+|./g,hb=/^\s/;function S(a,b){return a.b[a.a+(b||0)]}function T(a){return a.b[a.a++]}function ib(a){return a.b.length<=a.a};function jb(a){n.call(this,3);this.c=a.substring(1,a.length-1)}m(jb);jb.prototype.a=function(){return this.c};jb.prototype.toString=function(){return"Literal: "+this.c};function E(a,b){this.j=a.toLowerCase();var c;c="*"==this.j?"*":"http://www.w3.org/1999/xhtml";this.c=b?b.toLowerCase():c}E.prototype.a=function(a){var b=a.nodeType;if(1!=b&&2!=b)return!1;b=void 0!==a.localName?a.localName:a.nodeName;return"*"!=this.j&&this.j!=b.toLowerCase()?!1:"*"==this.c?!0:this.c==(a.namespaceURI?a.namespaceURI.toLowerCase():"http://www.w3.org/1999/xhtml")};E.prototype.f=function(){return this.j};
E.prototype.toString=function(){return"Name Test: "+("http://www.w3.org/1999/xhtml"==this.c?"":this.c+":")+this.j};function kb(a,b){n.call(this,a.i);this.h=a;this.c=b;this.g=a.g;this.b=a.b;if(1==this.c.length){var c=this.c[0];c.u||c.c!=lb||(c=c.o,"*"!=c.f()&&(this.f={name:c.f(),s:null}))}}m(kb);function mb(){n.call(this,4)}m(mb);mb.prototype.a=function(a){var b=new C;a=a.a;9==a.nodeType?F(b,a):F(b,a.ownerDocument);return b};mb.prototype.toString=function(){return"Root Helper Expression"};function nb(){n.call(this,4)}m(nb);nb.prototype.a=function(a){var b=new C;F(b,a.a);return b};nb.prototype.toString=function(){return"Context Helper Expression"};
function ob(a){return"/"==a||"//"==a}kb.prototype.a=function(a){var b=this.h.a(a);if(!(b instanceof C))throw Error("Filter expression must evaluate to nodeset.");a=this.c;for(var c=0,d=a.length;c<d&&b.l;c++){var e=a[c],f=H(b,e.c.a),g;if(e.g||e.c!=pb)if(e.g||e.c!=qb)for(g=I(f),b=e.a(new Q(g));null!=(g=I(f));)g=e.a(new Q(g)),b=Pa(b,g);else g=I(f),b=e.a(new Q(g));else{for(g=I(f);(b=I(f))&&(!g.contains||g.contains(b))&&b.compareDocumentPosition(g)&8;g=b);b=e.a(new Q(g))}}return b};
kb.prototype.toString=function(){var a;a="Path Expression:"+J(this.h);if(this.c.length){var b=t(this.c,function(a,b){return a+J(b)},"Steps:");a+=J(b)}return a};function rb(a){n.call(this,4);this.c=a;Ua(this,ja(this.c,function(a){return a.g}));Va(this,ja(this.c,function(a){return a.b}))}m(rb);rb.prototype.a=function(a){var b=new C;r(this.c,function(c){c=c.a(a);if(!(c instanceof C))throw Error("Path expression must evaluate to NodeSet.");b=Pa(b,c)});return b};rb.prototype.toString=function(){return t(this.c,function(a,b){return a+J(b)},"Union Expression:")};function sb(a,b){this.a=a;this.b=!!b}
function $a(a,b,c){for(c=c||0;c<a.a.length;c++)for(var d=a.a[c],e=H(b),f=b.l,g,h=0;g=I(e);h++){var p=a.b?f-h:h+1;g=d.a(new Q(g,p,f));if("number"==typeof g)p=p==g;else if("string"==typeof g||"boolean"==typeof g)p=!!g;else if(g instanceof C)p=0<g.l;else throw Error("Predicate.evaluate returned an unexpected type.");if(!p){p=e;g=p.f;var y=p.a;if(!y)throw Error("Next must be called at least once before remove.");var D=y.b,y=y.a;D?D.a=y:g.a=y;y?y.b=D:g.b=D;g.l--;p.a=null}}return b}
sb.prototype.toString=function(){return t(this.a,function(a,b){return a+J(b)},"Predicates:")};function U(a,b,c,d){n.call(this,4);this.c=a;this.o=b;this.h=c||new sb([]);this.u=!!d;b=this.h;b=0<b.a.length?b.a[0].f:null;a.b&&b&&(a=b.name,a=w?a.toLowerCase():a,this.f={name:a,s:b.s});a:{a=this.h;for(b=0;b<a.a.length;b++)if(c=a.a[b],c.g||1==c.i||0==c.i){a=!0;break a}a=!1}this.g=a}m(U);
U.prototype.a=function(a){var b=a.a,c=null,c=this.f,d=null,e=null,f=0;c&&(d=c.name,e=c.s?L(c.s,a):null,f=1);if(this.u)if(this.g||this.c!=tb)if(a=H((new U(ub,new G("node"))).a(a)),b=I(a))for(c=this.m(b,d,e,f);null!=(b=I(a));)c=Pa(c,this.m(b,d,e,f));else c=new C;else c=B(this.o,b,d,e),c=$a(this.h,c,f);else c=this.m(a.a,d,e,f);return c};U.prototype.m=function(a,b,c,d){a=this.c.f(this.o,a,b,c);return a=$a(this.h,a,d)};
U.prototype.toString=function(){var a;a="Step:"+J("Operator: "+(this.u?"//":"/"));this.c.j&&(a+=J("Axis: "+this.c));a+=J(this.o);if(this.h.a.length){var b=t(this.h.a,function(a,b){return a+J(b)},"Predicates:");a+=J(b)}return a};function vb(a,b,c,d){this.j=a;this.f=b;this.a=c;this.b=d}vb.prototype.toString=function(){return this.j};var wb={};function V(a,b,c,d){if(wb.hasOwnProperty(a))throw Error("Axis already created: "+a);b=new vb(a,b,c,!!d);return wb[a]=b}
V("ancestor",function(a,b){for(var c=new C,d=b;d=d.parentNode;)a.a(d)&&Qa(c,d);return c},!0);V("ancestor-or-self",function(a,b){var c=new C,d=b;do a.a(d)&&Qa(c,d);while(d=d.parentNode);return c},!0);
var lb=V("attribute",function(a,b){var c=new C,d=a.f();if("style"==d&&w&&b.style)return F(c,new x(b.style,b,"style",b.style.cssText)),c;var e=b.attributes;if(e)if(a instanceof G&&null===a.b||"*"==d)for(var d=0,f;f=e[d];d++)w?f.nodeValue&&F(c,Da(b,f)):F(c,f);else(f=e.getNamedItem(d))&&(w?f.nodeValue&&F(c,Da(b,f)):F(c,f));return c},!1),tb=V("child",function(a,b,c,d,e){return(w?Ia:Ja).call(null,a,b,l(c)?c:null,l(d)?d:null,e||new C)},!1,!0);V("descendant",B,!1,!0);
var ub=V("descendant-or-self",function(a,b,c,d){var e=new C;A(b,c,d)&&a.a(b)&&F(e,b);return B(a,b,c,d,e)},!1,!0),pb=V("following",function(a,b,c,d){var e=new C;do for(var f=b;f=f.nextSibling;)A(f,c,d)&&a.a(f)&&F(e,f),e=B(a,f,c,d,e);while(b=b.parentNode);return e},!1,!0);V("following-sibling",function(a,b){for(var c=new C,d=b;d=d.nextSibling;)a.a(d)&&F(c,d);return c},!1);V("namespace",function(){return new C},!1);
var xb=V("parent",function(a,b){var c=new C;if(9==b.nodeType)return c;if(2==b.nodeType)return F(c,b.ownerElement),c;var d=b.parentNode;a.a(d)&&F(c,d);return c},!1),qb=V("preceding",function(a,b,c,d){var e=new C,f=[];do f.unshift(b);while(b=b.parentNode);for(var g=1,h=f.length;g<h;g++){var p=[];for(b=f[g];b=b.previousSibling;)p.unshift(b);for(var y=0,D=p.length;y<D;y++)b=p[y],A(b,c,d)&&a.a(b)&&F(e,b),e=B(a,b,c,d,e)}return e},!0,!0);
V("preceding-sibling",function(a,b){for(var c=new C,d=b;d=d.previousSibling;)a.a(d)&&Qa(c,d);return c},!0);var yb=V("self",function(a,b){var c=new C;a.a(b)&&F(c,b);return c},!1);function zb(a){n.call(this,1);this.c=a;this.g=a.g;this.b=a.b}m(zb);zb.prototype.a=function(a){return-K(this.c,a)};zb.prototype.toString=function(){return"Unary Expression: -"+J(this.c)};function Ab(a){n.call(this,1);this.c=a}m(Ab);Ab.prototype.a=function(){return this.c};Ab.prototype.toString=function(){return"Number: "+this.c};function Bb(a,b){this.a=a;this.b=b}function Cb(a){for(var b,c=[];;){W(a,"Missing right hand side of binary expression.");b=Db(a);var d=T(a.a);if(!d)break;var e=(d=Ya[d]||null)&&d.w;if(!e){a.a.a--;break}for(;c.length&&e<=c[c.length-1].w;)b=new N(c.pop(),c.pop(),b);c.push(b,d)}for(;c.length;)b=new N(c.pop(),c.pop(),b);return b}function W(a,b){if(ib(a.a))throw Error(b);}function Eb(a,b){var c=T(a.a);if(c!=b)throw Error("Bad token, expected: "+b+" got: "+c);}
function Fb(a){a=T(a.a);if(")"!=a)throw Error("Bad token: "+a);}function Gb(a){a=T(a.a);if(2>a.length)throw Error("Unclosed literal string");return new jb(a)}
function Hb(a){var b,c=[],d;if(ob(S(a.a))){b=T(a.a);d=S(a.a);if("/"==b&&(ib(a.a)||"."!=d&&".."!=d&&"@"!=d&&"*"!=d&&!/(?![0-9])[\w]/.test(d)))return new mb;d=new mb;W(a,"Missing next location step.");b=Ib(a,b);c.push(b)}else{a:{b=S(a.a);d=b.charAt(0);switch(d){case "$":throw Error("Variable reference not allowed in HTML XPath");case "(":T(a.a);b=Cb(a);W(a,'unclosed "("');Eb(a,")");break;case '"':case "'":b=Gb(a);break;default:if(isNaN(+b))if(!db(b)&&/(?![0-9])[\w]/.test(d)&&"("==S(a.a,1)){b=T(a.a);
b=cb[b]||null;T(a.a);for(d=[];")"!=S(a.a);){W(a,"Missing function argument list.");d.push(Cb(a));if(","!=S(a.a))break;T(a.a)}W(a,"Unclosed function argument list.");Fb(a);b=new ab(b,d)}else{b=null;break a}else b=new Ab(+T(a.a))}"["==S(a.a)&&(d=new sb(Jb(a)),b=new Za(b,d))}if(b)if(ob(S(a.a)))d=b;else return b;else b=Ib(a,"/"),d=new nb,c.push(b)}for(;ob(S(a.a));)b=T(a.a),W(a,"Missing next location step."),b=Ib(a,b),c.push(b);return new kb(d,c)}
function Ib(a,b){var c,d,e;if("/"!=b&&"//"!=b)throw Error('Step op should be "/" or "//"');if("."==S(a.a))return d=new U(yb,new G("node")),T(a.a),d;if(".."==S(a.a))return d=new U(xb,new G("node")),T(a.a),d;var f;if("@"==S(a.a))f=lb,T(a.a),W(a,"Missing attribute name");else if("::"==S(a.a,1)){if(!/(?![0-9])[\w]/.test(S(a.a).charAt(0)))throw Error("Bad token: "+T(a.a));c=T(a.a);f=wb[c]||null;if(!f)throw Error("No axis with name: "+c);T(a.a);W(a,"Missing node name")}else f=tb;c=S(a.a);if(/(?![0-9])[\w\*]/.test(c.charAt(0)))if("("==
S(a.a,1)){if(!db(c))throw Error("Invalid node type: "+c);c=T(a.a);if(!db(c))throw Error("Invalid type name: "+c);Eb(a,"(");W(a,"Bad nodetype");e=S(a.a).charAt(0);var g=null;if('"'==e||"'"==e)g=Gb(a);W(a,"Bad nodetype");Fb(a);c=new G(c,g)}else if(c=T(a.a),e=c.indexOf(":"),-1==e)c=new E(c);else{var g=c.substring(0,e),h;if("*"==g)h="*";else if(h=a.b(g),!h)throw Error("Namespace prefix not declared: "+g);c=c.substr(e+1);c=new E(c,h)}else throw Error("Bad token: "+T(a.a));e=new sb(Jb(a),f.a);return d||
new U(f,c,e,"//"==b)}function Jb(a){for(var b=[];"["==S(a.a);){T(a.a);W(a,"Missing predicate expression.");var c=Cb(a);b.push(c);W(a,"Unclosed predicate expression.");Eb(a,"]")}return b}function Db(a){if("-"==S(a.a))return T(a.a),new zb(Db(a));var b=Hb(a);if("|"!=S(a.a))a=b;else{for(b=[b];"|"==T(a.a);)W(a,"Missing next union location path."),b.push(Hb(a));a.a.a--;a=new rb(b)}return a};function Kb(a){switch(a.nodeType){case 1:return ea(Lb,a);case 9:return Kb(a.documentElement);case 11:case 10:case 6:case 12:return Mb;default:return a.parentNode?Kb(a.parentNode):Mb}}function Mb(){return null}function Lb(a,b){if(a.prefix==b)return a.namespaceURI||"http://www.w3.org/1999/xhtml";var c=a.getAttributeNode("xmlns:"+b);return c&&c.specified?c.value||null:a.parentNode&&9!=a.parentNode.nodeType?Lb(a.parentNode,b):null};function Nb(a,b){if(!a.length)throw Error("Empty XPath expression.");var c=fb(a);if(ib(c))throw Error("Invalid XPath expression.");b?"function"==aa(b)||(b=da(b.lookupNamespaceURI,b)):b=function(){return null};var d=Cb(new Bb(c,b));if(!ib(c))throw Error("Bad token: "+T(c));this.evaluate=function(a,b){var c=d.a(new Q(a));return new Y(c,b)}}
function Y(a,b){if(0==b)if(a instanceof C)b=4;else if("string"==typeof a)b=2;else if("number"==typeof a)b=1;else if("boolean"==typeof a)b=3;else throw Error("Unexpected evaluation result.");if(2!=b&&1!=b&&3!=b&&!(a instanceof C))throw Error("value could not be converted to the specified type");this.resultType=b;var c;switch(b){case 2:this.stringValue=a instanceof C?Sa(a):""+a;break;case 1:this.numberValue=a instanceof C?+Sa(a):+a;break;case 3:this.booleanValue=a instanceof C?0<a.l:!!a;break;case 4:case 5:case 6:case 7:var d=
H(a);c=[];for(var e=I(d);e;e=I(d))c.push(e instanceof x?e.a:e);this.snapshotLength=a.l;this.invalidIteratorState=!1;break;case 8:case 9:d=Ra(a);this.singleNodeValue=d instanceof x?d.a:d;break;default:throw Error("Unknown XPathResult type.");}var f=0;this.iterateNext=function(){if(4!=b&&5!=b)throw Error("iterateNext called with wrong result type");return f>=c.length?null:c[f++]};this.snapshotItem=function(a){if(6!=b&&7!=b)throw Error("snapshotItem called with wrong result type");return a>=c.length||
0>a?null:c[a]}}Y.ANY_TYPE=0;Y.NUMBER_TYPE=1;Y.STRING_TYPE=2;Y.BOOLEAN_TYPE=3;Y.UNORDERED_NODE_ITERATOR_TYPE=4;Y.ORDERED_NODE_ITERATOR_TYPE=5;Y.UNORDERED_NODE_SNAPSHOT_TYPE=6;Y.ORDERED_NODE_SNAPSHOT_TYPE=7;Y.ANY_UNORDERED_NODE_TYPE=8;Y.FIRST_ORDERED_NODE_TYPE=9;function Ob(a){this.lookupNamespaceURI=Kb(a)}
function Pb(a,b){var c=a||k,d=c.Document&&c.Document.prototype||c.document;if(!d.evaluate||b)c.XPathResult=Y,d.evaluate=function(a,b,c,d){return(new Nb(a,c)).evaluate(b,d)},d.createExpression=function(a,b){return new Nb(a,b)},d.createNSResolver=function(a){return new Ob(a)}}var Qb=["wgxpath","install"],Z=k;Qb[0]in Z||!Z.execScript||Z.execScript("var "+Qb[0]);for(var Rb;Qb.length&&(Rb=Qb.shift());)Qb.length||void 0===Pb?Z[Rb]?Z=Z[Rb]:Z=Z[Rb]={}:Z[Rb]=Pb;module.exports.install=Pb;module.exports.XPathResultType={ANY_TYPE:0,NUMBER_TYPE:1,STRING_TYPE:2,BOOLEAN_TYPE:3,UNORDERED_NODE_ITERATOR_TYPE:4,ORDERED_NODE_ITERATOR_TYPE:5,UNORDERED_NODE_SNAPSHOT_TYPE:6,ORDERED_NODE_SNAPSHOT_TYPE:7,ANY_UNORDERED_NODE_TYPE:8,FIRST_ORDERED_NODE_TYPE:9};}).call(global)

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var docReady = require('doc-ready');
var Connexion = require('./http/Connexion');
/**
 * Main BootLoader.
 */

var PydioBootstrap = (function () {

    /**
     * Constructor
     * @param startParameters Object The options
     */

    function PydioBootstrap(startParameters) {
        var _this = this;

        _classCallCheck(this, PydioBootstrap);

        this.parameters = new Map();
        for (var i in startParameters) {
            if (startParameters.hasOwnProperty(i)) {
                this.parameters.set(i, startParameters[i]);
            }
        }
        this.detectBaseParameters();

        if (this.parameters.get("ALERT")) {
            window.setTimeout(function () {
                window.alert(_this.parameters.get("ALERT"));
            }, 0);
        }

        docReady((function () {

            var startedFromOpener = false;
            try {
                if (window.opener && window.opener.pydioBootstrap && this.parameters.get('serverAccessPath') === window.opener.pydioBootstrap.parameters.get('serverAccessPath')) {
                    this.parameters = window.opener.pydioBootstrap.parameters;
                    // Handle queryString case, as it's not passed via get_boot_conf
                    var qParams = document.location.href.toQueryParams();
                    if (qParams['external_selector_type']) {
                        this.parameters.set('SELECTOR_DATA', { type: qParams['external_selector_type'], data: qParams });
                    } else {
                        if (this.parameters.get('SELECTOR_DATA')) {
                            this.parameters.unset('SELECTOR_DATA');
                        }
                    }
                    this.refreshContextVariablesAndInit(new Connexion());
                    startedFromOpener = true;
                }
            } catch (e) {
                if (window.console && console.log) console.log(e);
            }
            if (!startedFromOpener) {
                this.loadBootConfig();
            }
        }).bind(this));

        window.Connexion = Connexion;
        window.pydioBootstrap = this;
    }

    /**
     * Real loading action
     */

    PydioBootstrap.prototype.loadBootConfig = function loadBootConfig() {
        if (this.parameters.get('PRELOADED_BOOT_CONF')) {
            var preloaded = this.parameters.get('PRELOADED_BOOT_CONF');
            for (var k in preloaded) {
                if (preloaded.hasOwnProperty(k)) {
                    this.parameters.set(k, preloaded[k]);
                }
            }
            this.refreshContextVariablesAndInit(new Connexion());
            return;
        }

        var url = this.parameters.get('BOOTER_URL') + (this.parameters.get("debugMode") ? '&debug=true' : '');
        if (this.parameters.get('SERVER_PREFIX_URI')) {
            url += '&server_prefix_uri=' + this.parameters.get('SERVER_PREFIX_URI').replace(/\.\.\//g, "_UP_/");
        }
        var connexion = new Connexion(url);
        connexion.onComplete = (function (transport) {
            if (transport.responseXML && transport.responseXML.documentElement && transport.responseXML.documentElement.nodeName == "tree") {
                var alert = XMLUtils.XPathSelectSingleNode(transport.responseXML.documentElement, "message");
                window.alert('Exception caught by application : ' + alert.firstChild.nodeValue);
                return;
            }
            var phpError;
            var data = undefined;
            if (transport.responseJSON) {
                data = transport.responseJSON;
            }
            if (! typeof data === "object") {
                phpError = 'Exception uncaught by application : ' + transport.responseText;
            }
            if (phpError) {
                document.write(phpError);
                if (phpError.indexOf('<b>Notice</b>') > -1 || phpError.indexOf('<b>Strict Standards</b>') > -1) {
                    window.alert('Php errors detected, it seems that Notice or Strict are detected, you may consider changing the PHP Error Reporting level!');
                }
                return;
            }
            for (var key in data) {
                if (data.hasOwnProperty(key)) this.parameters.set(key, data[key]);
            }

            this.refreshContextVariablesAndInit(connexion);
        }).bind(this);
        connexion.sendAsync();
    };

    PydioBootstrap.prototype.refreshContextVariablesAndInit = function refreshContextVariablesAndInit(connexion) {

        Connexion.updateServerAccess(this.parameters);

        var cssRes = this.parameters.get("cssResources");
        if (cssRes) {
            cssRes.map(this.loadCSSResource.bind(this));
        }

        if (this.parameters.get('ajxpResourcesFolder')) {
            connexion._libUrl = this.parameters.get('ajxpResourcesFolder') + "/build";
            window.ajxpResourcesFolder = this.parameters.get('ajxpResourcesFolder') + "/themes/" + this.parameters.get("theme");
        }

        if (this.parameters.get('additional_js_resource')) {
            connexion.loadLibrary(this.parameters.get('additional_js_resource?v=' + this.parameters.get("ajxpVersion")), null, true);
        }

        //this.insertLoaderProgress();
        window.MessageHash = this.parameters.get("i18nMessages");
        if (!Object.keys(MessageHash).length) {
            alert('Ooups, this should not happen, your message file is empty!');
        }
        for (var key in MessageHash) {
            MessageHash[key] = MessageHash[key].replace("\\n", "\n");
        }
        window.zipEnabled = this.parameters.get("zipEnabled");
        window.multipleFilesDownloadEnabled = this.parameters.get("multipleFilesDownloadEnabled");

        var masterClassLoaded = (function () {

            var pydio = new Pydio(this.parameters);
            window.pydio = pydio;

            pydio.observe("actions_loaded", (function () {
                if (!this.parameters.get("SELECTOR_DATA") && pydio.getController().actions.get("ext_select")) {
                    if (pydio.getController().actions._object) {
                        pydio.getController().actions.unset("ext_select");
                    } else {
                        pydio.getController().actions['delete']("ext_select");
                    }
                    pydio.getController().fireContextChange();
                    pydio.getController().fireSelectionChange();
                } else if (this.parameters.get("SELECTOR_DATA")) {
                    pydio.getController().defaultActions.set("file", "ext_select");
                }
            }).bind(this));

            pydio.observe("loaded", (function (e) {
                if (this.parameters.get("SELECTOR_DATA")) {
                    pydio.getController().defaultActions.set("file", "ext_select");
                    pydio.getController().selectorData = this.parameters.get("SELECTOR_DATA");
                }
            }).bind(this));

            if (this.parameters.get("currentLanguage")) {
                pydio.currentLanguage = this.parameters.get("currentLanguage");
            }

            pydio.init();
        }).bind(this);

        if (this.parameters.get("debugMode")) {
            masterClassLoaded();
        } else {
            connexion.loadLibrary("pydio.min.js?v=" + this.parameters.get("ajxpVersion"), masterClassLoaded, true);
        }

        /*
        let div = document.createElement('div');
        div.setAttribute('style', 'position:absolute; bottom: 0; right: 0; z-index: 2000; color:rgba(0,0,0,0.6); font-size: 12px; padding: 0 10px;');
        div.innerHTML = 'Pydio Community Edition - Copyright Abstrium 2017 - Learn more on <a href="https://pydio.com" target="_blank">pydio.com</a>';
        document.body.appendChild(div);
        */
    };

    /**
     * Detect the base path of the javascripts based on the script tags
     */

    PydioBootstrap.prototype.detectBaseParameters = function detectBaseParameters() {

        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var scriptTag = scripts[i];
            if (scriptTag.src.match("/build/pydio.boot.min.js") || scriptTag.src.match("/build/boot.prod.js")) {
                if (scriptTag.src.match("/build/pydio.boot.min.js")) {
                    this.parameters.set("debugMode", false);
                } else {
                    this.parameters.set("debugMode", true);
                }
                var src = scriptTag.src.replace('/build/boot.prod.js', '').replace('/build/pydio.boot.min.js', '');
                if (src.indexOf("?") != -1) src = src.split("?")[0];
                this.parameters.set("ajxpResourcesFolder", src);
            }
        }
        if (this.parameters.get("ajxpResourcesFolder")) {
            window.ajxpResourcesFolder = this.parameters.get("ajxpResourcesFolder");
        } else {
            alert("Cannot find resource folder");
        }
        var booterUrl = this.parameters.get("BOOTER_URL");
        if (booterUrl.indexOf("?") > -1) {
            booterUrl = booterUrl.substring(0, booterUrl.indexOf("?"));
        }
        this.parameters.set('ajxpServerAccessPath', booterUrl);
        this.parameters.set('serverAccessPath', booterUrl);
        window.ajxpServerAccessPath = booterUrl;
    };

    /**
     * Loads a CSS file
     * @param fileName String
     */

    PydioBootstrap.prototype.loadCSSResource = function loadCSSResource(fileName) {
        var head = document.getElementsByTagName('head')[0];
        var cssNode = document.createElement('link');
        cssNode.type = 'text/css';
        cssNode.rel = 'stylesheet';
        cssNode.href = this.parameters.get("ajxpResourcesFolder") + '/' + fileName;
        cssNode.media = 'screen';
        head.appendChild(cssNode);
    };

    /**
     * Try to load something under data/cache/
     * @param onError Function
     */

    PydioBootstrap.testDataFolderAccess = function testDataFolderAccess(onError) {
        var c = new Connexion('data/cache/index.html');
        c.setMethod('get');
        c.onComplete = function (response) {
            if (200 === response.status) {
                onError();
            }
        };
        c.sendAsync();
    };

    return PydioBootstrap;
})();

exports['default'] = PydioBootstrap;
module.exports = exports['default'];

},{"./http/Connexion":6,"doc-ready":1}],6:[function(require,module,exports){
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilXMLUtils = require('../util/XMLUtils');

var _utilXMLUtils2 = _interopRequireDefault(_utilXMLUtils);

/**
 * Pydio encapsulation of XHR / Fetch
 */
require('whatwg-fetch');

var Connexion = (function () {

    /**
     * Constructor
     * @param baseUrl String The base url for services
     */

    function Connexion(baseUrl) {
        _classCallCheck(this, Connexion);

        this._pydio = window.pydio;
        this._baseUrl = baseUrl || window.ajxpServerAccessPath;
        this._libUrl = window.ajxpResourcesFolder + '/build';
        this._parameters = new Map();
        this._method = 'post';
        this.discrete = false;
    }

    Connexion.updateServerAccess = function updateServerAccess(parameters) {

        if (parameters.get('SECURE_TOKEN')) {
            Connexion.SECURE_TOKEN = parameters.get('SECURE_TOKEN');
        }
        var serverAccessPath = parameters.get('ajxpServerAccess').split('?').shift();
        if (parameters.get('SERVER_PREFIX_URI')) {
            parameters.set('ajxpResourcesFolder', parameters.get('SERVER_PREFIX_URI') + parameters.get('ajxpResourcesFolder'));
            serverAccessPath = parameters.get('SERVER_PREFIX_URI') + serverAccessPath + '?' + (Connexion.SECURE_TOKEN ? 'secure_token=' + Connexion.SECURE_TOKEN : '');
        } else {
            serverAccessPath = serverAccessPath + '?' + (Connexion.SECURE_TOKEN ? 'secure_token=' + Connexion.SECURE_TOKEN : '');
        }
        if (parameters.get('SERVER_PERMANENT_PARAMS')) {
            var permParams = parameters.get('SERVER_PERMANENT_PARAMS');
            var permStrings = [];
            for (var permanent in permParams) {
                if (permParams.hasOwnProperty(permanent)) {
                    permStrings.push(permanent + '=' + permParams[permanent]);
                }
            }
            permStrings = permStrings.join('&');
            if (permStrings) {
                serverAccessPath += '&' + permStrings;
            }
        }

        parameters.set('ajxpServerAccess', serverAccessPath);
        // BACKWARD COMPAT
        window.ajxpServerAccessPath = serverAccessPath;
        if (window.pydioBootstrap && window.pydioBootstrap.parameters) {
            pydioBootstrap.parameters.set("ajxpServerAccess", serverAccessPath);
            pydioBootstrap.parameters.set("SECURE_TOKEN", Connexion.SECURE_TOKEN);
        }
    };

    Connexion.log = function log(action, syncStatus) {
        if (!Connexion.PydioLogs) {
            Connexion.PydioLogs = [];
        }
        Connexion.PydioLogs.push({ action: action, sync: syncStatus });
    };

    /**
     * Add a parameter to the query
     * @param paramName String
     * @param paramValue String
     */

    Connexion.prototype.addParameter = function addParameter(paramName, paramValue) {
        if (this._parameters.get(paramName) && paramName.endsWith('[]')) {
            var existing = this._parameters.get(paramName);
            if (!existing instanceof Array) {
                existing = [existing];
            }
            existing.push(paramValue);
            this._parameters.set(paramName, existing);
        } else {
            this._parameters.set(paramName, paramValue);
        }
    };

    /**
     * Sets the whole parameter as a bunch
     * @param hParameters Map
     */

    Connexion.prototype.setParameters = function setParameters(hParameters) {
        if (hParameters instanceof Map) {
            this._parameters = hParameters;
        } else {
            if (hParameters._object) {
                console.error('Passed a legacy Hash object to Connexion.setParameters');
                hParameters = hParameters._object;
            }
            for (var key in hParameters) {
                if (hParameters.hasOwnProperty(key)) {
                    this._parameters.set(key, hParameters[key]);
                }
            }
        }
    };

    /**
     * Set the query method (get post)
     * @param method String
     */

    Connexion.prototype.setMethod = function setMethod(method) {
        this._method = method;
    };

    /**
     * Add the secure token parameter
     */

    Connexion.prototype.addSecureToken = function addSecureToken() {

        if (Connexion.SECURE_TOKEN && this._baseUrl.indexOf('secure_token') == -1 && !this._parameters.get('secure_token')) {

            this.addParameter('secure_token', Connexion.SECURE_TOKEN);
        } else if (this._baseUrl.indexOf('secure_token=') !== -1) {

            // Remove from baseUrl and set inside params
            var parts = this._baseUrl.split('secure_token=');
            var toks = parts[1].split('&');
            var token = toks.shift();
            var rest = toks.join('&');
            this._baseUrl = parts[0] + (rest ? '&' + rest : '');
            this._parameters.set('secure_token', token);
        }
    };

    Connexion.prototype.addServerPermanentParams = function addServerPermanentParams() {
        if (!this._pydio || !this._pydio.Parameters.has('SERVER_PERMANENT_PARAMS')) {
            return;
        }
        var permParams = this._pydio.Parameters.get('SERVER_PERMANENT_PARAMS');
        for (var permanent in permParams) {
            if (permParams.hasOwnProperty(permanent)) {
                this.addParameter(permanent, permParams[permanent]);
            }
        }
    };

    /**
     * Show a small loader
     */

    Connexion.prototype.showLoader = function showLoader() {
        if (this.discrete || !this._pydio) return;
        this._pydio.notify("connection-start");
    };

    /**
     * Hide a small loader
     */

    Connexion.prototype.hideLoader = function hideLoader() {
        if (this.discrete || !this._pydio) return;
        this._pydio.notify("connection-end");
    };

    Connexion.prototype._send = function _send() {
        var _this = this;

        var aSync = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

        this.addSecureToken();
        this.addServerPermanentParams();
        this.showLoader();
        var oThis = this;
        var options = {
            method: this._method,
            credentials: 'same-origin'
        };
        var url = this._baseUrl;
        if (!aSync) {
            options.synchronous = true;
        }
        var bodyParts = [];
        this._parameters.forEach(function (value, key) {
            if (value instanceof Array) {
                value.map(function (oneV) {
                    bodyParts.push(key + '=' + encodeURIComponent(oneV));
                });
            } else {
                bodyParts.push(key + '=' + encodeURIComponent(value));
            }
        });
        var queryString = bodyParts.join('&');
        if (this._method === 'post') {
            options.headers = { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" };
            options.body = queryString;
        } else {
            url += (url.indexOf('?') > -1 ? '&' : '?') + queryString;
        }
        window.fetch(url, options).then(function (response) {

            var h = response.headers.get('Content-type');
            if (h.indexOf('/json') !== -1) {
                response.json().then(function (json) {
                    oThis.applyComplete({ responseJSON: json }, response);
                });
            } else if (h.indexOf('/xml') !== -1) {
                response.text().then(function (text) {
                    oThis.applyComplete({ responseXML: _utilXMLUtils2['default'].parseXml(text) }, response);
                });
            } else {
                response.text().then(function (text) {
                    oThis.applyComplete({ responseText: text }, response);
                });
            }
            return response;
        })['catch'](function (error) {
            if (_this._pydio) {
                _this._pydio.displayMessage('ERROR', 'Network error ' + error.message);
            }
        });
    };

    /**
     * Send Asynchronously
     */

    Connexion.prototype.sendAsync = function sendAsync() {
        this._send(true);
    };

    /**
     * Send synchronously
     */

    Connexion.prototype.sendSync = function sendSync() {
        this._send(false);
    };

    /**
     * Apply the complete callback, try to grab maximum of errors
     * @param parsedBody Transpot
     */

    Connexion.prototype.applyComplete = function applyComplete(parsedBody, response) {
        this.hideLoader();
        var pydio = this._pydio;
        var message = undefined,
            tokenMessage = undefined;
        var tok1 = "Ooops, it seems that your security token has expired! Please %s by hitting refresh or F5 in your browser!";
        var tok2 = "reload the page";
        if (window.MessageHash && window.MessageHash[437]) {
            tok1 = window.MessageHash[437];
            tok2 = window.MessageHash[438];
        }
        tokenMessage = tok1.replace("%s", "<a href='javascript:document.location.reload()' style='text-decoration: underline;'>" + tok2 + "</a>");

        var ctype = response.headers.get('Content-type');
        if (parsedBody.responseXML && parsedBody.responseXML.documentElement && parsedBody.responseXML.documentElement.nodeName == "parsererror") {

            message = "Parsing error : \n" + parsedBody.responseXML.documentElement.firstChild.textContent;
        } else if (parsedBody.responseXML && parsedBody.responseXML.parseError && parsedBody.responseXML.parseError.errorCode != 0) {

            message = "Parsing Error : \n" + parsedBody.responseXML.parseError.reason;
        } else if (ctype.indexOf("text/xml") > -1 && parsedBody.responseXML == null) {

            message = "Expected XML but got empty response!";
        } else if (ctype.indexOf("text/xml") == -1 && ctype.indexOf("application/json") == -1 && parsedBody.responseText.indexOf("<b>Fatal error</b>") > -1) {

            message = parsedBody.responseText.replace("<br />", "");
        } else if (response.status == 500) {

            message = "Internal Server Error: you should check your web server logs to find what's going wrong!";
        }
        if (message) {

            if (message.startsWith("You are not allowed to access this resource.")) {
                message = tokenMessage;
            }
            if (pydio) {
                pydio.displayMessage("ERROR", message);
            } else {
                alert(message);
            }
        }
        if (parsedBody.responseXML && parsedBody.responseXML.documentElement) {

            var authNode = _utilXMLUtils2['default'].XPathSelectSingleNode(parsedBody.responseXML.documentElement, "require_auth");
            if (authNode && pydio) {
                var root = pydio.getContextHolder().getRootNode();
                if (root) {
                    pydio.getContextHolder().setContextNode(root);
                    root.clear();
                }
                pydio.getController().fireAction('logout');
                pydio.getController().fireAction('login');
            }

            var messageNode = _utilXMLUtils2['default'].XPathSelectSingleNode(parsedBody.responseXML.documentElement, "message");
            if (messageNode) {
                var messageType = messageNode.getAttribute("type").toUpperCase();
                var messageContent = _utilXMLUtils2['default'].getDomNodeText(messageNode);
                if (messageContent.startsWith("You are not allowed to access this resource.")) {
                    messageContent = tokenMessage;
                }
                if (pydio) {
                    pydio.displayMessage(messageType, messageContent);
                } else {
                    if (messageType == "ERROR") {
                        alert(messageType + ":" + messageContent);
                    }
                }
                if (messageType == "SUCCESS") messageNode.parentNode.removeChild(messageNode);
            }
        }
        if (this.onComplete) {

            parsedBody.status = response.status;
            parsedBody.responseObject = response;
            this.onComplete(parsedBody);
        }
        if (pydio) {
            pydio.fire("server_answer", this);
        }
    };

    Connexion.prototype.uploadFile = function uploadFile(file, fileParameterName, uploadUrl, onComplete, onError, onProgress, xhrSettings) {

        if (xhrSettings === undefined) xhrSettings = {};

        if (!onComplete) onComplete = function () {};
        if (!onError) onError = function () {};
        if (!onProgress) onProgress = function () {};
        var xhr = this.initializeXHRForUpload(uploadUrl, onComplete, onError, onProgress, xhrSettings);
        if (xhrSettings && xhrSettings.method === 'PUT') {
            xhr.send(file);
            return xhr;
        }
        if (window.FormData) {
            this.sendFileUsingFormData(xhr, file, fileParameterName);
        } else if (window.FileReader) {
            var fileReader = new FileReader();
            fileReader.onload = (function (e) {
                this.xhrSendAsBinary(xhr, file.name, e.target.result, fileParameterName);
            }).bind(this);
            fileReader.readAsBinaryString(file);
        } else if (file.getAsBinary) {
            this.xhrSendAsBinary(xhr, file.name, file.getAsBinary(), fileParameterName);
        }
        return xhr;
    };

    Connexion.prototype.initializeXHRForUpload = function initializeXHRForUpload(url, onComplete, onError, onProgress, xhrSettings) {

        if (xhrSettings === undefined) xhrSettings = {};

        var xhr = new XMLHttpRequest();
        var upload = xhr.upload;
        if (xhrSettings.withCredentials) {
            xhr.withCredentials = true;
        }
        upload.addEventListener("progress", function (e) {
            if (!e.lengthComputable) return;
            onProgress(e);
        }, false);
        xhr.onreadystatechange = (function () {
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    onComplete(xhr);
                } else {
                    onError(xhr);
                }
            }
        }).bind(this);
        upload.onerror = function () {
            onError(xhr);
        };
        var method = 'POST';
        if (xhrSettings.method) {
            method = xhrSettings.method;
        }
        xhr.open(method, url, true);
        if (xhrSettings.customHeaders) {
            Object.keys(xhrSettings.customHeaders).forEach(function (k) {
                xhr.setRequestHeader(k, xhrSettings.customHeaders[k]);
            });
        }

        return xhr;
    };

    Connexion.prototype.sendFileUsingFormData = function sendFileUsingFormData(xhr, file, fileParameterName) {
        var formData = new FormData();
        formData.append(fileParameterName, file);
        xhr.send(formData);
    };

    Connexion.prototype.xhrSendAsBinary = function xhrSendAsBinary(xhr, fileName, fileData, fileParameterName) {
        var boundary = '----MultiPartFormBoundary' + new Date().getTime();
        xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary=" + boundary);

        var body = "--" + boundary + "\r\n";
        body += "Content-Disposition: form-data; name='" + fileParameterName + "'; filename='" + unescape(encodeURIComponent(fileName)) + "'\r\n";
        body += "Content-Type: application/octet-stream\r\n\r\n";
        body += fileData + "\r\n";
        body += "--" + boundary + "--\r\n";

        xhr.sendAsBinary(body);
    };

    /**
     * Load a javascript library
     * @param fileName String
     * @param onLoadedCode Function Callback
        * @param aSync Boolean load library asynchroneously
     */

    Connexion.prototype.loadLibrary = function loadLibrary(fileName, onLoadedCode, aSync) {
        var _this2 = this;

        if (window.pydioBootstrap && window.pydioBootstrap.parameters.get("ajxpVersion") && fileName.indexOf("?") == -1) {
            fileName += "?v=" + window.pydioBootstrap.parameters.get("ajxpVersion");
        }
        var url = this._libUrl ? this._libUrl + '/' + fileName : fileName;
        var pydio = this._pydio;

        var scriptLoaded = function scriptLoaded(script) {
            try {
                if (window.execScript) {
                    window.execScript(script);
                } else {
                    window.my_code = script;
                    var head = document.getElementsByTagName('head')[0];
                    var script_tag = document.createElement('script');
                    script_tag.type = 'text/javascript';
                    script_tag.innerHTML = 'eval(window.my_code)';
                    head.appendChild(script_tag);
                    delete window.my_code;
                    head.removeChild(script_tag);
                }
                if (onLoadedCode != null) onLoadedCode();
            } catch (e) {
                alert('error loading ' + fileName + ':' + e.message);
                if (console) console.error(e);
            }
            if (pydio) pydio.fire("server_answer");
        };

        if (aSync) {
            window.fetch(url, {
                method: 'GET',
                credentials: 'same-origin'
            }).then(function (response) {
                return response.text();
            }).then(function (script) {
                scriptLoaded(script);
            });
        } else {
            (function () {
                // SHOULD BE REMOVED!!
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = (function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status === 200) {
                            scriptLoaded(xhr.responseText);
                        } else {
                            alert('error loading ' + fileName + ': Status code was ' + xhr.status);
                        }
                    }
                }).bind(_this2);
                xhr.open("GET", url, false);
                xhr.send();
            })();
        }
    };

    return Connexion;
})();

exports['default'] = Connexion;
module.exports = exports['default'];

},{"../util/XMLUtils":7,"whatwg-fetch":3}],7:[function(require,module,exports){
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com/>.
 *
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _wickedGoodXpath = require('wicked-good-xpath');

var _wickedGoodXpath2 = _interopRequireDefault(_wickedGoodXpath);

_wickedGoodXpath2['default'].install();
/**
 * Utilitary class for manipulating XML
 */

var XMLUtils = (function () {
    function XMLUtils() {
        _classCallCheck(this, XMLUtils);
    }

    /**
     * Selects the first XmlNode that matches the XPath expression.
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @return {Element} first matching element
     * @signature function(element, query)
     */

    XMLUtils.XPathSelectSingleNode = function XPathSelectSingleNode(element, query) {
        try {
            if (element['selectSingleNode'] && typeof element.selectSingleNode === "function") {
                var res = element.selectSingleNode(query);
                if (res) return res;
            }
        } catch (e) {}

        if (!XMLUtils.__xpe && window.XPathEvaluator) {
            try {
                XMLUtils.__xpe = new XPathEvaluator();
            } catch (e) {}
        }

        if (!XMLUtils.__xpe) {
            query = document.createExpression(query, null);
            var result = query.evaluate(element, 7, null);
            return result.snapshotLength ? result.snapshotItem(0) : null;
        }

        var xpe = XMLUtils.__xpe;

        try {
            return xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch (err) {
            throw new Error("selectSingleNode: query: " + query + ", element: " + element + ", error: " + err);
        }
    };

    /**
     * Selects a list of nodes matching the XPath expression.
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @return {Element[]} List of matching elements
     * @signature function(element, query)
     */

    XMLUtils.XPathSelectNodes = function XPathSelectNodes(element, query) {
        try {
            if (typeof element.selectNodes === "function") {
                try {
                    if (element.ownerDocument && element.ownerDocument.setProperty) {
                        element.ownerDocument.setProperty("SelectionLanguage", "XPath");
                    } else if (element.setProperty) {
                        element.setProperty("SelectionLanguage", "XPath");
                    }
                } catch (e) {}
                var res = Array.from(element.selectNodes(query));
                if (res) return res;
            }
        } catch (e) {}

        var xpe = XMLUtils.__xpe;

        if (!xpe && window.XPathEvaluator) {
            try {
                XMLUtils.__xpe = xpe = new XPathEvaluator();
            } catch (e) {}
        }
        var result,
            nodes = [],
            i;
        if (!XMLUtils.__xpe) {
            query = document.createExpression(query, null);
            result = query.evaluate(element, 7, null);
            nodes = [];
            for (i = 0; i < result.snapshotLength; i++) {
                if (Element.extend) {
                    nodes[i] = Element.extend(result.snapshotItem(i));
                } else {
                    nodes[i] = result.snapshotItem(i);
                }
            }
            return nodes;
        }

        try {
            result = xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        } catch (err) {
            throw new Error("selectNodes: query: " + query + ", element: " + element + ", error: " + err);
        }

        for (i = 0; i < result.snapshotLength; i++) {
            nodes[i] = result.snapshotItem(i);
        }

        return nodes;
    };

    /**
     * Selects the first XmlNode that matches the XPath expression and returns the text content of the element
     *
     * @param element {Element|Document} root element for the search
     * @param query {String}  XPath query
     * @return {String} the joined text content of the found element or null if not appropriate.
     * @signature function(element, query)
     */

    XMLUtils.XPathGetSingleNodeText = function XPathGetSingleNodeText(element, query) {
        var node = XMLUtils.XPathSelectSingleNode(element, query);
        return XMLUtils.getDomNodeText(node);
    };

    XMLUtils.getDomNodeText = function getDomNodeText(node) {
        var includeCData = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (!node || !node.nodeType) {
            return null;
        }

        switch (node.nodeType) {
            case 1:
                // NODE_ELEMENT
                var i,
                    a = [],
                    nodes = node.childNodes,
                    length = nodes.length;
                for (i = 0; i < length; i++) {
                    a[i] = XMLUtils.getDomNodeText(nodes[i], includeCData);
                }

                return a.join("");

            case 2:
                // NODE_ATTRIBUTE
                return node.value;

            case 3:
                // NODE_TEXT
                return node.nodeValue;

            case 4:
                // CDATA
                if (includeCData) return node.nodeValue;
                break;
        }

        return null;
    };

    /**
     * @param xmlStr
     * @returns {*}
     */

    XMLUtils.parseXml = function parseXml(xmlStr) {

        if (typeof window.DOMParser != "undefined") {
            return new window.DOMParser().parseFromString(xmlStr, "text/xml");
        }
        if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("MSXML2.DOMDocument.6.0")) {
            var xmlDoc = new window.ActiveXObject("MSXML2.DOMDocument.6.0");
            xmlDoc.validateOnParse = false;
            xmlDoc.async = false;
            xmlDoc.loadXML(xmlStr);
            xmlDoc.setProperty('SelectionLanguage', 'XPath');
            return xmlDoc;
        }
        throw new Error('Cannot parse XML string');
    };

    return XMLUtils;
})();

exports['default'] = XMLUtils;
module.exports = exports['default'];

},{"wicked-good-xpath":4}]},{},[5])(5)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZG9jLXJlYWR5L2RvYy1yZWFkeS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGllL2V2ZW50aWUuanMiLCJub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwibm9kZV9tb2R1bGVzL3dpY2tlZC1nb29kLXhwYXRoL2Rpc3Qvd2d4cGF0aC5pbnN0YWxsLW5vZGUuanMiLCJyZXMvYnVpbGQvY29yZS9QeWRpb0Jvb3RzdHJhcC5qcyIsInJlcy9idWlsZC9jb3JlL2h0dHAvQ29ubmV4aW9uLmpzIiwicmVzL2J1aWxkL2NvcmUvdXRpbC9YTUxVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBkb2NSZWFkeSB2MS4wLjRcbiAqIENyb3NzIGJyb3dzZXIgRE9NQ29udGVudExvYWRlZCBldmVudCBlbWl0dGVyXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSovXG4vKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCByZXF1aXJlOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3cgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50O1xuLy8gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdG8gYmUgdHJpZ2dlcmVkIG9uIHJlYWR5XG52YXIgcXVldWUgPSBbXTtcblxuZnVuY3Rpb24gZG9jUmVhZHkoIGZuICkge1xuICAvLyB0aHJvdyBvdXQgbm9uLWZ1bmN0aW9uc1xuICBpZiAoIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIGRvY1JlYWR5LmlzUmVhZHkgKSB7XG4gICAgLy8gcmVhZHkgbm93LCBoaXQgaXRcbiAgICBmbigpO1xuICB9IGVsc2Uge1xuICAgIC8vIHF1ZXVlIGZ1bmN0aW9uIHdoZW4gcmVhZHlcbiAgICBxdWV1ZS5wdXNoKCBmbiApO1xuICB9XG59XG5cbmRvY1JlYWR5LmlzUmVhZHkgPSBmYWxzZTtcblxuLy8gdHJpZ2dlcmVkIG9uIHZhcmlvdXMgZG9jIHJlYWR5IGV2ZW50c1xuZnVuY3Rpb24gb25SZWFkeSggZXZlbnQgKSB7XG4gIC8vIGJhaWwgaWYgYWxyZWFkeSB0cmlnZ2VyZWQgb3IgSUU4IGRvY3VtZW50IGlzIG5vdCByZWFkeSBqdXN0IHlldFxuICB2YXIgaXNJRThOb3RSZWFkeSA9IGV2ZW50LnR5cGUgPT09ICdyZWFkeXN0YXRlY2hhbmdlJyAmJiBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnO1xuICBpZiAoIGRvY1JlYWR5LmlzUmVhZHkgfHwgaXNJRThOb3RSZWFkeSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cmlnZ2VyKCk7XG59XG5cbmZ1bmN0aW9uIHRyaWdnZXIoKSB7XG4gIGRvY1JlYWR5LmlzUmVhZHkgPSB0cnVlO1xuICAvLyBwcm9jZXNzIHF1ZXVlXG4gIGZvciAoIHZhciBpPTAsIGxlbiA9IHF1ZXVlLmxlbmd0aDsgaSA8IGxlbjsgaSsrICkge1xuICAgIHZhciBmbiA9IHF1ZXVlW2ldO1xuICAgIGZuKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lRG9jUmVhZHkoIGV2ZW50aWUgKSB7XG4gIC8vIHRyaWdnZXIgcmVhZHkgaWYgcGFnZSBpcyByZWFkeVxuICBpZiAoIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgKSB7XG4gICAgdHJpZ2dlcigpO1xuICB9IGVsc2Uge1xuICAgIC8vIGxpc3RlbiBmb3IgZXZlbnRzXG4gICAgZXZlbnRpZS5iaW5kKCBkb2N1bWVudCwgJ0RPTUNvbnRlbnRMb2FkZWQnLCBvblJlYWR5ICk7XG4gICAgZXZlbnRpZS5iaW5kKCBkb2N1bWVudCwgJ3JlYWR5c3RhdGVjaGFuZ2UnLCBvblJlYWR5ICk7XG4gICAgZXZlbnRpZS5iaW5kKCB3aW5kb3csICdsb2FkJywgb25SZWFkeSApO1xuICB9XG5cbiAgcmV0dXJuIGRvY1JlYWR5O1xufVxuXG4vLyB0cmFuc3BvcnRcbmlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAvLyBBTURcbiAgZGVmaW5lKCBbICdldmVudGllL2V2ZW50aWUnIF0sIGRlZmluZURvY1JlYWR5ICk7XG59IGVsc2UgaWYgKCB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZGVmaW5lRG9jUmVhZHkoIHJlcXVpcmUoJ2V2ZW50aWUnKSApO1xufSBlbHNlIHtcbiAgLy8gYnJvd3NlciBnbG9iYWxcbiAgd2luZG93LmRvY1JlYWR5ID0gZGVmaW5lRG9jUmVhZHkoIHdpbmRvdy5ldmVudGllICk7XG59XG5cbn0pKCB3aW5kb3cgKTtcbiIsIi8qIVxuICogZXZlbnRpZSB2MS4wLjZcbiAqIGV2ZW50IGJpbmRpbmcgaGVscGVyXG4gKiAgIGV2ZW50aWUuYmluZCggZWxlbSwgJ2NsaWNrJywgbXlGbiApXG4gKiAgIGV2ZW50aWUudW5iaW5kKCBlbGVtLCAnY2xpY2snLCBteUZuIClcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3cgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbnZhciBiaW5kID0gZnVuY3Rpb24oKSB7fTtcblxuZnVuY3Rpb24gZ2V0SUVFdmVudCggb2JqICkge1xuICB2YXIgZXZlbnQgPSB3aW5kb3cuZXZlbnQ7XG4gIC8vIGFkZCBldmVudC50YXJnZXRcbiAgZXZlbnQudGFyZ2V0ID0gZXZlbnQudGFyZ2V0IHx8IGV2ZW50LnNyY0VsZW1lbnQgfHwgb2JqO1xuICByZXR1cm4gZXZlbnQ7XG59XG5cbmlmICggZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyICkge1xuICBiaW5kID0gZnVuY3Rpb24oIG9iaiwgdHlwZSwgZm4gKSB7XG4gICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIoIHR5cGUsIGZuLCBmYWxzZSApO1xuICB9O1xufSBlbHNlIGlmICggZG9jRWxlbS5hdHRhY2hFdmVudCApIHtcbiAgYmluZCA9IGZ1bmN0aW9uKCBvYmosIHR5cGUsIGZuICkge1xuICAgIG9ialsgdHlwZSArIGZuIF0gPSBmbi5oYW5kbGVFdmVudCA/XG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gZ2V0SUVFdmVudCggb2JqICk7XG4gICAgICAgIGZuLmhhbmRsZUV2ZW50LmNhbGwoIGZuLCBldmVudCApO1xuICAgICAgfSA6XG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gZ2V0SUVFdmVudCggb2JqICk7XG4gICAgICAgIGZuLmNhbGwoIG9iaiwgZXZlbnQgKTtcbiAgICAgIH07XG4gICAgb2JqLmF0dGFjaEV2ZW50KCBcIm9uXCIgKyB0eXBlLCBvYmpbIHR5cGUgKyBmbiBdICk7XG4gIH07XG59XG5cbnZhciB1bmJpbmQgPSBmdW5jdGlvbigpIHt9O1xuXG5pZiAoIGRvY0VsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciApIHtcbiAgdW5iaW5kID0gZnVuY3Rpb24oIG9iaiwgdHlwZSwgZm4gKSB7XG4gICAgb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUsIGZuLCBmYWxzZSApO1xuICB9O1xufSBlbHNlIGlmICggZG9jRWxlbS5kZXRhY2hFdmVudCApIHtcbiAgdW5iaW5kID0gZnVuY3Rpb24oIG9iaiwgdHlwZSwgZm4gKSB7XG4gICAgb2JqLmRldGFjaEV2ZW50KCBcIm9uXCIgKyB0eXBlLCBvYmpbIHR5cGUgKyBmbiBdICk7XG4gICAgdHJ5IHtcbiAgICAgIGRlbGV0ZSBvYmpbIHR5cGUgKyBmbiBdO1xuICAgIH0gY2F0Y2ggKCBlcnIgKSB7XG4gICAgICAvLyBjYW4ndCBkZWxldGUgd2luZG93IG9iamVjdCBwcm9wZXJ0aWVzXG4gICAgICBvYmpbIHR5cGUgKyBmbiBdID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfTtcbn1cblxudmFyIGV2ZW50aWUgPSB7XG4gIGJpbmQ6IGJpbmQsXG4gIHVuYmluZDogdW5iaW5kXG59O1xuXG4vLyAtLS0tLSBtb2R1bGUgZGVmaW5pdGlvbiAtLS0tLSAvL1xuXG5pZiAoIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgLy8gQU1EXG4gIGRlZmluZSggZXZlbnRpZSApO1xufSBlbHNlIGlmICggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICkge1xuICAvLyBDb21tb25KU1xuICBtb2R1bGUuZXhwb3J0cyA9IGV2ZW50aWU7XG59IGVsc2Uge1xuICAvLyBicm93c2VyIGdsb2JhbFxuICB3aW5kb3cuZXZlbnRpZSA9IGV2ZW50aWU7XG59XG5cbn0pKCB3aW5kb3cgKTtcbiIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdmlld0NsYXNzZXMgPSBbXG4gICAgICAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQ2NEFycmF5XSdcbiAgICBdXG5cbiAgICB2YXIgaXNEYXRhVmlldyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiBEYXRhVmlldy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihvYmopXG4gICAgfVxuXG4gICAgdmFyIGlzQXJyYXlCdWZmZXJWaWV3ID0gQXJyYXlCdWZmZXIuaXNWaWV3IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB2aWV3Q2xhc3Nlcy5pbmRleE9mKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSA+IC0xXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaGVhZGVycykpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQoaGVhZGVyWzBdLCBoZWFkZXJbMV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMubWFwW25hbWVdXG4gICAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlKycsJyt2YWx1ZSA6IHZhbHVlXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXMubWFwW25hbWVdLCBuYW1lLCB0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRBcnJheUJ1ZmZlckFzVGV4dChidWYpIHtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXJzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3W2ldKVxuICAgIH1cbiAgICByZXR1cm4gY2hhcnMuam9pbignJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICAgIGlmIChidWYuc2xpY2UpIHtcbiAgICAgIHJldHVybiBidWYuc2xpY2UoMClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYuYnl0ZUxlbmd0aClcbiAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZikpXG4gICAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcilcbiAgICAgICAgLy8gSUUgMTAtMTEgY2FuJ3QgaGFuZGxlIGEgRGF0YVZpZXcgYm9keS5cbiAgICAgICAgdGhpcy5fYm9keUluaXQgPSBuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKSlcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3VtZWQodGhpcykgfHwgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlYWRBcnJheUJ1ZmZlckFzVGV4dCh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcblxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkgJiYgaW5wdXQuX2JvZHlJbml0ICE9IG51bGwpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBTdHJpbmcoaW5wdXQpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMsIHsgYm9keTogdGhpcy5fYm9keUluaXQgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgICB2YXIgaGVhZGVycyA9IG5ldyBIZWFkZXJzKClcbiAgICAvLyBSZXBsYWNlIGluc3RhbmNlcyBvZiBcXHJcXG4gYW5kIFxcbiBmb2xsb3dlZCBieSBhdCBsZWFzdCBvbmUgc3BhY2Ugb3IgaG9yaXpvbnRhbCB0YWIgd2l0aCBhIHNwYWNlXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcyMzAjc2VjdGlvbi0zLjJcbiAgICB2YXIgcHJlUHJvY2Vzc2VkSGVhZGVycyA9IHJhd0hlYWRlcnMucmVwbGFjZSgvXFxyP1xcbltcXHQgXSsvZywgJyAnKVxuICAgIHByZVByb2Nlc3NlZEhlYWRlcnMuc3BsaXQoL1xccj9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXMgPT09IHVuZGVmaW5lZCA/IDIwMCA6IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdvbWl0Jykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCl7J3VzZSBzdHJpY3QnO3ZhciBrPXRoaXM7XG5mdW5jdGlvbiBhYShhKXt2YXIgYj10eXBlb2YgYTtpZihcIm9iamVjdFwiPT1iKWlmKGEpe2lmKGEgaW5zdGFuY2VvZiBBcnJheSlyZXR1cm5cImFycmF5XCI7aWYoYSBpbnN0YW5jZW9mIE9iamVjdClyZXR1cm4gYjt2YXIgYz1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSk7aWYoXCJbb2JqZWN0IFdpbmRvd11cIj09YylyZXR1cm5cIm9iamVjdFwiO2lmKFwiW29iamVjdCBBcnJheV1cIj09Y3x8XCJudW1iZXJcIj09dHlwZW9mIGEubGVuZ3RoJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5zcGxpY2UmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLnByb3BlcnR5SXNFbnVtZXJhYmxlJiYhYS5wcm9wZXJ0eUlzRW51bWVyYWJsZShcInNwbGljZVwiKSlyZXR1cm5cImFycmF5XCI7aWYoXCJbb2JqZWN0IEZ1bmN0aW9uXVwiPT1jfHxcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5jYWxsJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5wcm9wZXJ0eUlzRW51bWVyYWJsZSYmIWEucHJvcGVydHlJc0VudW1lcmFibGUoXCJjYWxsXCIpKXJldHVyblwiZnVuY3Rpb25cIn1lbHNlIHJldHVyblwibnVsbFwiO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT1cbmImJlwidW5kZWZpbmVkXCI9PXR5cGVvZiBhLmNhbGwpcmV0dXJuXCJvYmplY3RcIjtyZXR1cm4gYn1mdW5jdGlvbiBsKGEpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBhfWZ1bmN0aW9uIGJhKGEsYixjKXtyZXR1cm4gYS5jYWxsLmFwcGx5KGEuYmluZCxhcmd1bWVudHMpfWZ1bmN0aW9uIGNhKGEsYixjKXtpZighYSl0aHJvdyBFcnJvcigpO2lmKDI8YXJndW1lbnRzLmxlbmd0aCl7dmFyIGQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDIpO3JldHVybiBmdW5jdGlvbigpe3ZhciBjPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7QXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoYyxkKTtyZXR1cm4gYS5hcHBseShiLGMpfX1yZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gYS5hcHBseShiLGFyZ3VtZW50cyl9fVxuZnVuY3Rpb24gZGEoYSxiLGMpe2RhPUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kJiYtMSE9RnVuY3Rpb24ucHJvdG90eXBlLmJpbmQudG9TdHJpbmcoKS5pbmRleE9mKFwibmF0aXZlIGNvZGVcIik/YmE6Y2E7cmV0dXJuIGRhLmFwcGx5KG51bGwsYXJndW1lbnRzKX1mdW5jdGlvbiBlYShhLGIpe3ZhciBjPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYj1jLnNsaWNlKCk7Yi5wdXNoLmFwcGx5KGIsYXJndW1lbnRzKTtyZXR1cm4gYS5hcHBseSh0aGlzLGIpfX1cbmZ1bmN0aW9uIG0oYSl7dmFyIGI9bjtmdW5jdGlvbiBjKCl7fWMucHJvdG90eXBlPWIucHJvdG90eXBlO2EuRz1iLnByb3RvdHlwZTthLnByb3RvdHlwZT1uZXcgYzthLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1hO2EuRj1mdW5jdGlvbihhLGMsZil7Zm9yKHZhciBnPUFycmF5KGFyZ3VtZW50cy5sZW5ndGgtMiksaD0yO2g8YXJndW1lbnRzLmxlbmd0aDtoKyspZ1toLTJdPWFyZ3VtZW50c1toXTtyZXR1cm4gYi5wcm90b3R5cGVbY10uYXBwbHkoYSxnKX19Oy8qXG5cbiBUaGUgTUlUIExpY2Vuc2VcblxuIENvcHlyaWdodCAoYykgMjAwNyBDeWJvenUgTGFicywgSW5jLlxuIENvcHlyaWdodCAoYykgMjAxMiBHb29nbGUgSW5jLlxuXG4gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvXG4gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGVcbiByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3JcbiBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1NcbiBJTiBUSEUgU09GVFdBUkUuXG4qL1xudmFyIGZhPVN0cmluZy5wcm90b3R5cGUudHJpbT9mdW5jdGlvbihhKXtyZXR1cm4gYS50cmltKCl9OmZ1bmN0aW9uKGEpe3JldHVybiBhLnJlcGxhY2UoL15bXFxzXFx4YTBdK3xbXFxzXFx4YTBdKyQvZyxcIlwiKX07ZnVuY3Rpb24gcShhLGIpe3JldHVybi0xIT1hLmluZGV4T2YoYil9ZnVuY3Rpb24gZ2EoYSxiKXtyZXR1cm4gYTxiPy0xOmE+Yj8xOjB9O3ZhciBoYT1BcnJheS5wcm90b3R5cGUuaW5kZXhPZj9mdW5jdGlvbihhLGIsYyl7cmV0dXJuIEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYSxiLGMpfTpmdW5jdGlvbihhLGIsYyl7Yz1udWxsPT1jPzA6MD5jP01hdGgubWF4KDAsYS5sZW5ndGgrYyk6YztpZihsKGEpKXJldHVybiBsKGIpJiYxPT1iLmxlbmd0aD9hLmluZGV4T2YoYixjKTotMTtmb3IoO2M8YS5sZW5ndGg7YysrKWlmKGMgaW4gYSYmYVtjXT09PWIpcmV0dXJuIGM7cmV0dXJuLTF9LHI9QXJyYXkucHJvdG90eXBlLmZvckVhY2g/ZnVuY3Rpb24oYSxiLGMpe0FycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoYSxiLGMpfTpmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPWEubGVuZ3RoLGU9bChhKT9hLnNwbGl0KFwiXCIpOmEsZj0wO2Y8ZDtmKyspZiBpbiBlJiZiLmNhbGwoYyxlW2ZdLGYsYSl9LGlhPUFycmF5LnByb3RvdHlwZS5maWx0ZXI/ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwoYSxcbmIsYyl9OmZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9YS5sZW5ndGgsZT1bXSxmPTAsZz1sKGEpP2Euc3BsaXQoXCJcIik6YSxoPTA7aDxkO2grKylpZihoIGluIGcpe3ZhciBwPWdbaF07Yi5jYWxsKGMscCxoLGEpJiYoZVtmKytdPXApfXJldHVybiBlfSx0PUFycmF5LnByb3RvdHlwZS5yZWR1Y2U/ZnVuY3Rpb24oYSxiLGMsZCl7ZCYmKGI9ZGEoYixkKSk7cmV0dXJuIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UuY2FsbChhLGIsYyl9OmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPWM7cihhLGZ1bmN0aW9uKGMsZyl7ZT1iLmNhbGwoZCxlLGMsZyxhKX0pO3JldHVybiBlfSxqYT1BcnJheS5wcm90b3R5cGUuc29tZT9mdW5jdGlvbihhLGIsYyl7cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zb21lLmNhbGwoYSxiLGMpfTpmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPWEubGVuZ3RoLGU9bChhKT9hLnNwbGl0KFwiXCIpOmEsZj0wO2Y8ZDtmKyspaWYoZiBpbiBlJiZiLmNhbGwoYyxlW2ZdLGYsYSkpcmV0dXJuITA7XG5yZXR1cm4hMX07ZnVuY3Rpb24ga2EoYSxiKXt2YXIgYzthOntjPWEubGVuZ3RoO2Zvcih2YXIgZD1sKGEpP2Euc3BsaXQoXCJcIik6YSxlPTA7ZTxjO2UrKylpZihlIGluIGQmJmIuY2FsbCh2b2lkIDAsZFtlXSxlLGEpKXtjPWU7YnJlYWsgYX1jPS0xfXJldHVybiAwPmM/bnVsbDpsKGEpP2EuY2hhckF0KGMpOmFbY119ZnVuY3Rpb24gbGEoYSl7cmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoQXJyYXkucHJvdG90eXBlLGFyZ3VtZW50cyl9ZnVuY3Rpb24gbWEoYSxiLGMpe3JldHVybiAyPj1hcmd1bWVudHMubGVuZ3RoP0FycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGEsYik6QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSxiLGMpfTt2YXIgdTthOnt2YXIgbmE9ay5uYXZpZ2F0b3I7aWYobmEpe3ZhciBvYT1uYS51c2VyQWdlbnQ7aWYob2Epe3U9b2E7YnJlYWsgYX19dT1cIlwifTt2YXIgcGE9cSh1LFwiT3BlcmFcIil8fHEodSxcIk9QUlwiKSx2PXEodSxcIlRyaWRlbnRcIil8fHEodSxcIk1TSUVcIikscWE9cSh1LFwiRWRnZVwiKSxyYT1xKHUsXCJHZWNrb1wiKSYmIShxKHUudG9Mb3dlckNhc2UoKSxcIndlYmtpdFwiKSYmIXEodSxcIkVkZ2VcIikpJiYhKHEodSxcIlRyaWRlbnRcIil8fHEodSxcIk1TSUVcIikpJiYhcSh1LFwiRWRnZVwiKSxzYT1xKHUudG9Mb3dlckNhc2UoKSxcIndlYmtpdFwiKSYmIXEodSxcIkVkZ2VcIik7ZnVuY3Rpb24gdGEoKXt2YXIgYT1rLmRvY3VtZW50O3JldHVybiBhP2EuZG9jdW1lbnRNb2RlOnZvaWQgMH12YXIgdWE7XG5hOnt2YXIgdmE9XCJcIix3YT1mdW5jdGlvbigpe3ZhciBhPXU7aWYocmEpcmV0dXJuL3J2XFw6KFteXFwpO10rKShcXCl8OykvLmV4ZWMoYSk7aWYocWEpcmV0dXJuL0VkZ2VcXC8oW1xcZFxcLl0rKS8uZXhlYyhhKTtpZih2KXJldHVybi9cXGIoPzpNU0lFfHJ2KVs6IF0oW15cXCk7XSspKFxcKXw7KS8uZXhlYyhhKTtpZihzYSlyZXR1cm4vV2ViS2l0XFwvKFxcUyspLy5leGVjKGEpO2lmKHBhKXJldHVybi8oPzpWZXJzaW9uKVsgXFwvXT8oXFxTKykvLmV4ZWMoYSl9KCk7d2EmJih2YT13YT93YVsxXTpcIlwiKTtpZih2KXt2YXIgeGE9dGEoKTtpZihudWxsIT14YSYmeGE+cGFyc2VGbG9hdCh2YSkpe3VhPVN0cmluZyh4YSk7YnJlYWsgYX19dWE9dmF9dmFyIHlhPXt9O1xuZnVuY3Rpb24gemEoYSl7aWYoIXlhW2FdKXtmb3IodmFyIGI9MCxjPWZhKFN0cmluZyh1YSkpLnNwbGl0KFwiLlwiKSxkPWZhKFN0cmluZyhhKSkuc3BsaXQoXCIuXCIpLGU9TWF0aC5tYXgoYy5sZW5ndGgsZC5sZW5ndGgpLGY9MDswPT1iJiZmPGU7ZisrKXt2YXIgZz1jW2ZdfHxcIlwiLGg9ZFtmXXx8XCJcIixwPS8oXFxkKikoXFxEKikvZyx5PS8oXFxkKikoXFxEKikvZztkb3t2YXIgRD1wLmV4ZWMoZyl8fFtcIlwiLFwiXCIsXCJcIl0sWD15LmV4ZWMoaCl8fFtcIlwiLFwiXCIsXCJcIl07aWYoMD09RFswXS5sZW5ndGgmJjA9PVhbMF0ubGVuZ3RoKWJyZWFrO2I9Z2EoMD09RFsxXS5sZW5ndGg/MDpwYXJzZUludChEWzFdLDEwKSwwPT1YWzFdLmxlbmd0aD8wOnBhcnNlSW50KFhbMV0sMTApKXx8Z2EoMD09RFsyXS5sZW5ndGgsMD09WFsyXS5sZW5ndGgpfHxnYShEWzJdLFhbMl0pfXdoaWxlKDA9PWIpfXlhW2FdPTA8PWJ9fVxudmFyIEFhPWsuZG9jdW1lbnQsQmE9QWEmJnY/dGEoKXx8KFwiQ1NTMUNvbXBhdFwiPT1BYS5jb21wYXRNb2RlP3BhcnNlSW50KHVhLDEwKTo1KTp2b2lkIDA7dmFyIHc9diYmISg5PD1OdW1iZXIoQmEpKSxDYT12JiYhKDg8PU51bWJlcihCYSkpO2Z1bmN0aW9uIHgoYSxiLGMsZCl7dGhpcy5hPWE7dGhpcy5ub2RlTmFtZT1jO3RoaXMubm9kZVZhbHVlPWQ7dGhpcy5ub2RlVHlwZT0yO3RoaXMucGFyZW50Tm9kZT10aGlzLm93bmVyRWxlbWVudD1ifWZ1bmN0aW9uIERhKGEsYil7dmFyIGM9Q2EmJlwiaHJlZlwiPT1iLm5vZGVOYW1lP2EuZ2V0QXR0cmlidXRlKGIubm9kZU5hbWUsMik6Yi5ub2RlVmFsdWU7cmV0dXJuIG5ldyB4KGIsYSxiLm5vZGVOYW1lLGMpfTtmdW5jdGlvbiB6KGEpe3ZhciBiPW51bGwsYz1hLm5vZGVUeXBlOzE9PWMmJihiPWEudGV4dENvbnRlbnQsYj12b2lkIDA9PWJ8fG51bGw9PWI/YS5pbm5lclRleHQ6YixiPXZvaWQgMD09Ynx8bnVsbD09Yj9cIlwiOmIpO2lmKFwic3RyaW5nXCIhPXR5cGVvZiBiKWlmKHcmJlwidGl0bGVcIj09YS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpJiYxPT1jKWI9YS50ZXh0O2Vsc2UgaWYoOT09Y3x8MT09Yyl7YT05PT1jP2EuZG9jdW1lbnRFbGVtZW50OmEuZmlyc3RDaGlsZDtmb3IodmFyIGM9MCxkPVtdLGI9XCJcIjthOyl7ZG8gMSE9YS5ub2RlVHlwZSYmKGIrPWEubm9kZVZhbHVlKSx3JiZcInRpdGxlXCI9PWEubm9kZU5hbWUudG9Mb3dlckNhc2UoKSYmKGIrPWEudGV4dCksZFtjKytdPWE7d2hpbGUoYT1hLmZpcnN0Q2hpbGQpO2Zvcig7YyYmIShhPWRbLS1jXS5uZXh0U2libGluZyk7KTt9fWVsc2UgYj1hLm5vZGVWYWx1ZTtyZXR1cm5cIlwiK2J9XG5mdW5jdGlvbiBBKGEsYixjKXtpZihudWxsPT09YilyZXR1cm4hMDt0cnl7aWYoIWEuZ2V0QXR0cmlidXRlKXJldHVybiExfWNhdGNoKGQpe3JldHVybiExfUNhJiZcImNsYXNzXCI9PWImJihiPVwiY2xhc3NOYW1lXCIpO3JldHVybiBudWxsPT1jPyEhYS5nZXRBdHRyaWJ1dGUoYik6YS5nZXRBdHRyaWJ1dGUoYiwyKT09Y31mdW5jdGlvbiBCKGEsYixjLGQsZSl7cmV0dXJuKHc/RWE6RmEpLmNhbGwobnVsbCxhLGIsbChjKT9jOm51bGwsbChkKT9kOm51bGwsZXx8bmV3IEMpfVxuZnVuY3Rpb24gRWEoYSxiLGMsZCxlKXtpZihhIGluc3RhbmNlb2YgRXx8OD09YS5ifHxjJiZudWxsPT09YS5iKXt2YXIgZj1iLmFsbDtpZighZilyZXR1cm4gZTthPUdhKGEpO2lmKFwiKlwiIT1hJiYoZj1iLmdldEVsZW1lbnRzQnlUYWdOYW1lKGEpLCFmKSlyZXR1cm4gZTtpZihjKXtmb3IodmFyIGc9W10saD0wO2I9ZltoKytdOylBKGIsYyxkKSYmZy5wdXNoKGIpO2Y9Z31mb3IoaD0wO2I9ZltoKytdOylcIipcIj09YSYmXCIhXCI9PWIudGFnTmFtZXx8RihlLGIpO3JldHVybiBlfUhhKGEsYixjLGQsZSk7cmV0dXJuIGV9XG5mdW5jdGlvbiBGYShhLGIsYyxkLGUpe2IuZ2V0RWxlbWVudHNCeU5hbWUmJmQmJlwibmFtZVwiPT1jJiYhdj8oYj1iLmdldEVsZW1lbnRzQnlOYW1lKGQpLHIoYixmdW5jdGlvbihiKXthLmEoYikmJkYoZSxiKX0pKTpiLmdldEVsZW1lbnRzQnlDbGFzc05hbWUmJmQmJlwiY2xhc3NcIj09Yz8oYj1iLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoZCkscihiLGZ1bmN0aW9uKGIpe2IuY2xhc3NOYW1lPT1kJiZhLmEoYikmJkYoZSxiKX0pKTphIGluc3RhbmNlb2YgRz9IYShhLGIsYyxkLGUpOmIuZ2V0RWxlbWVudHNCeVRhZ05hbWUmJihiPWIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoYS5mKCkpLHIoYixmdW5jdGlvbihhKXtBKGEsYyxkKSYmRihlLGEpfSkpO3JldHVybiBlfVxuZnVuY3Rpb24gSWEoYSxiLGMsZCxlKXt2YXIgZjtpZigoYSBpbnN0YW5jZW9mIEV8fDg9PWEuYnx8YyYmbnVsbD09PWEuYikmJihmPWIuY2hpbGROb2Rlcykpe3ZhciBnPUdhKGEpO2lmKFwiKlwiIT1nJiYoZj1pYShmLGZ1bmN0aW9uKGEpe3JldHVybiBhLnRhZ05hbWUmJmEudGFnTmFtZS50b0xvd2VyQ2FzZSgpPT1nfSksIWYpKXJldHVybiBlO2MmJihmPWlhKGYsZnVuY3Rpb24oYSl7cmV0dXJuIEEoYSxjLGQpfSkpO3IoZixmdW5jdGlvbihhKXtcIipcIj09ZyYmKFwiIVwiPT1hLnRhZ05hbWV8fFwiKlwiPT1nJiYxIT1hLm5vZGVUeXBlKXx8RihlLGEpfSk7cmV0dXJuIGV9cmV0dXJuIEphKGEsYixjLGQsZSl9ZnVuY3Rpb24gSmEoYSxiLGMsZCxlKXtmb3IoYj1iLmZpcnN0Q2hpbGQ7YjtiPWIubmV4dFNpYmxpbmcpQShiLGMsZCkmJmEuYShiKSYmRihlLGIpO3JldHVybiBlfVxuZnVuY3Rpb24gSGEoYSxiLGMsZCxlKXtmb3IoYj1iLmZpcnN0Q2hpbGQ7YjtiPWIubmV4dFNpYmxpbmcpQShiLGMsZCkmJmEuYShiKSYmRihlLGIpLEhhKGEsYixjLGQsZSl9ZnVuY3Rpb24gR2EoYSl7aWYoYSBpbnN0YW5jZW9mIEcpe2lmKDg9PWEuYilyZXR1cm5cIiFcIjtpZihudWxsPT09YS5iKXJldHVyblwiKlwifXJldHVybiBhLmYoKX07IXJhJiYhdnx8diYmOTw9TnVtYmVyKEJhKXx8cmEmJnphKFwiMS45LjFcIik7diYmemEoXCI5XCIpO2Z1bmN0aW9uIEthKGEsYil7aWYoIWF8fCFiKXJldHVybiExO2lmKGEuY29udGFpbnMmJjE9PWIubm9kZVR5cGUpcmV0dXJuIGE9PWJ8fGEuY29udGFpbnMoYik7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuY29tcGFyZURvY3VtZW50UG9zaXRpb24pcmV0dXJuIGE9PWJ8fCEhKGEuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYikmMTYpO2Zvcig7YiYmYSE9YjspYj1iLnBhcmVudE5vZGU7cmV0dXJuIGI9PWF9XG5mdW5jdGlvbiBMYShhLGIpe2lmKGE9PWIpcmV0dXJuIDA7aWYoYS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbilyZXR1cm4gYS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihiKSYyPzE6LTE7aWYodiYmISg5PD1OdW1iZXIoQmEpKSl7aWYoOT09YS5ub2RlVHlwZSlyZXR1cm4tMTtpZig5PT1iLm5vZGVUeXBlKXJldHVybiAxfWlmKFwic291cmNlSW5kZXhcImluIGF8fGEucGFyZW50Tm9kZSYmXCJzb3VyY2VJbmRleFwiaW4gYS5wYXJlbnROb2RlKXt2YXIgYz0xPT1hLm5vZGVUeXBlLGQ9MT09Yi5ub2RlVHlwZTtpZihjJiZkKXJldHVybiBhLnNvdXJjZUluZGV4LWIuc291cmNlSW5kZXg7dmFyIGU9YS5wYXJlbnROb2RlLGY9Yi5wYXJlbnROb2RlO3JldHVybiBlPT1mP01hKGEsYik6IWMmJkthKGUsYik/LTEqTmEoYSxiKTohZCYmS2EoZixhKT9OYShiLGEpOihjP2Euc291cmNlSW5kZXg6ZS5zb3VyY2VJbmRleCktKGQ/Yi5zb3VyY2VJbmRleDpmLnNvdXJjZUluZGV4KX1kPTk9PWEubm9kZVR5cGU/XG5hOmEub3duZXJEb2N1bWVudHx8YS5kb2N1bWVudDtjPWQuY3JlYXRlUmFuZ2UoKTtjLnNlbGVjdE5vZGUoYSk7Yy5jb2xsYXBzZSghMCk7ZD1kLmNyZWF0ZVJhbmdlKCk7ZC5zZWxlY3ROb2RlKGIpO2QuY29sbGFwc2UoITApO3JldHVybiBjLmNvbXBhcmVCb3VuZGFyeVBvaW50cyhrLlJhbmdlLlNUQVJUX1RPX0VORCxkKX1mdW5jdGlvbiBOYShhLGIpe3ZhciBjPWEucGFyZW50Tm9kZTtpZihjPT1iKXJldHVybi0xO2Zvcih2YXIgZD1iO2QucGFyZW50Tm9kZSE9YzspZD1kLnBhcmVudE5vZGU7cmV0dXJuIE1hKGQsYSl9ZnVuY3Rpb24gTWEoYSxiKXtmb3IodmFyIGM9YjtjPWMucHJldmlvdXNTaWJsaW5nOylpZihjPT1hKXJldHVybi0xO3JldHVybiAxfTtmdW5jdGlvbiBDKCl7dGhpcy5iPXRoaXMuYT1udWxsO3RoaXMubD0wfWZ1bmN0aW9uIE9hKGEpe3RoaXMubm9kZT1hO3RoaXMuYT10aGlzLmI9bnVsbH1mdW5jdGlvbiBQYShhLGIpe2lmKCFhLmEpcmV0dXJuIGI7aWYoIWIuYSlyZXR1cm4gYTtmb3IodmFyIGM9YS5hLGQ9Yi5hLGU9bnVsbCxmPW51bGwsZz0wO2MmJmQ7KXt2YXIgZj1jLm5vZGUsaD1kLm5vZGU7Zj09aHx8ZiBpbnN0YW5jZW9mIHgmJmggaW5zdGFuY2VvZiB4JiZmLmE9PWguYT8oZj1jLGM9Yy5hLGQ9ZC5hKTowPExhKGMubm9kZSxkLm5vZGUpPyhmPWQsZD1kLmEpOihmPWMsYz1jLmEpOyhmLmI9ZSk/ZS5hPWY6YS5hPWY7ZT1mO2crK31mb3IoZj1jfHxkO2Y7KWYuYj1lLGU9ZS5hPWYsZysrLGY9Zi5hO2EuYj1lO2EubD1nO3JldHVybiBhfWZ1bmN0aW9uIFFhKGEsYil7dmFyIGM9bmV3IE9hKGIpO2MuYT1hLmE7YS5iP2EuYS5iPWM6YS5hPWEuYj1jO2EuYT1jO2EubCsrfVxuZnVuY3Rpb24gRihhLGIpe3ZhciBjPW5ldyBPYShiKTtjLmI9YS5iO2EuYT9hLmIuYT1jOmEuYT1hLmI9YzthLmI9YzthLmwrK31mdW5jdGlvbiBSYShhKXtyZXR1cm4oYT1hLmEpP2Eubm9kZTpudWxsfWZ1bmN0aW9uIFNhKGEpe3JldHVybihhPVJhKGEpKT96KGEpOlwiXCJ9ZnVuY3Rpb24gSChhLGIpe3JldHVybiBuZXcgVGEoYSwhIWIpfWZ1bmN0aW9uIFRhKGEsYil7dGhpcy5mPWE7dGhpcy5iPSh0aGlzLmM9Yik/YS5iOmEuYTt0aGlzLmE9bnVsbH1mdW5jdGlvbiBJKGEpe3ZhciBiPWEuYjtpZihudWxsPT1iKXJldHVybiBudWxsO3ZhciBjPWEuYT1iO2EuYj1hLmM/Yi5iOmIuYTtyZXR1cm4gYy5ub2RlfTtmdW5jdGlvbiBuKGEpe3RoaXMuaT1hO3RoaXMuYj10aGlzLmc9ITE7dGhpcy5mPW51bGx9ZnVuY3Rpb24gSihhKXtyZXR1cm5cIlxcbiAgXCIrYS50b1N0cmluZygpLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG4gIFwiKX1mdW5jdGlvbiBVYShhLGIpe2EuZz1ifWZ1bmN0aW9uIFZhKGEsYil7YS5iPWJ9ZnVuY3Rpb24gSyhhLGIpe3ZhciBjPWEuYShiKTtyZXR1cm4gYyBpbnN0YW5jZW9mIEM/K1NhKGMpOitjfWZ1bmN0aW9uIEwoYSxiKXt2YXIgYz1hLmEoYik7cmV0dXJuIGMgaW5zdGFuY2VvZiBDP1NhKGMpOlwiXCIrY31mdW5jdGlvbiBNKGEsYil7dmFyIGM9YS5hKGIpO3JldHVybiBjIGluc3RhbmNlb2YgQz8hIWMubDohIWN9O2Z1bmN0aW9uIE4oYSxiLGMpe24uY2FsbCh0aGlzLGEuaSk7dGhpcy5jPWE7dGhpcy5oPWI7dGhpcy5vPWM7dGhpcy5nPWIuZ3x8Yy5nO3RoaXMuYj1iLmJ8fGMuYjt0aGlzLmM9PVdhJiYoYy5ifHxjLmd8fDQ9PWMuaXx8MD09Yy5pfHwhYi5mP2IuYnx8Yi5nfHw0PT1iLml8fDA9PWIuaXx8IWMuZnx8KHRoaXMuZj17bmFtZTpjLmYubmFtZSxzOmJ9KTp0aGlzLmY9e25hbWU6Yi5mLm5hbWUsczpjfSl9bShOKTtcbmZ1bmN0aW9uIE8oYSxiLGMsZCxlKXtiPWIuYShkKTtjPWMuYShkKTt2YXIgZjtpZihiIGluc3RhbmNlb2YgQyYmYyBpbnN0YW5jZW9mIEMpe2I9SChiKTtmb3IoZD1JKGIpO2Q7ZD1JKGIpKWZvcihlPUgoYyksZj1JKGUpO2Y7Zj1JKGUpKWlmKGEoeihkKSx6KGYpKSlyZXR1cm4hMDtyZXR1cm4hMX1pZihiIGluc3RhbmNlb2YgQ3x8YyBpbnN0YW5jZW9mIEMpe2IgaW5zdGFuY2VvZiBDPyhlPWIsZD1jKTooZT1jLGQ9Yik7Zj1IKGUpO2Zvcih2YXIgZz10eXBlb2YgZCxoPUkoZik7aDtoPUkoZikpe3N3aXRjaChnKXtjYXNlIFwibnVtYmVyXCI6aD0reihoKTticmVhaztjYXNlIFwiYm9vbGVhblwiOmg9ISF6KGgpO2JyZWFrO2Nhc2UgXCJzdHJpbmdcIjpoPXooaCk7YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcIklsbGVnYWwgcHJpbWl0aXZlIHR5cGUgZm9yIGNvbXBhcmlzb24uXCIpO31pZihlPT1iJiZhKGgsZCl8fGU9PWMmJmEoZCxoKSlyZXR1cm4hMH1yZXR1cm4hMX1yZXR1cm4gZT9cImJvb2xlYW5cIj09XG50eXBlb2YgYnx8XCJib29sZWFuXCI9PXR5cGVvZiBjP2EoISFiLCEhYyk6XCJudW1iZXJcIj09dHlwZW9mIGJ8fFwibnVtYmVyXCI9PXR5cGVvZiBjP2EoK2IsK2MpOmEoYixjKTphKCtiLCtjKX1OLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmMubSh0aGlzLmgsdGhpcy5vLGEpfTtOLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3ZhciBhPVwiQmluYXJ5IEV4cHJlc3Npb246IFwiK3RoaXMuYyxhPWErSih0aGlzLmgpO3JldHVybiBhKz1KKHRoaXMubyl9O2Z1bmN0aW9uIFhhKGEsYixjLGQpe3RoaXMuYT1hO3RoaXMudz1iO3RoaXMuaT1jO3RoaXMubT1kfVhhLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmF9O3ZhciBZYT17fTtcbmZ1bmN0aW9uIFAoYSxiLGMsZCl7aWYoWWEuaGFzT3duUHJvcGVydHkoYSkpdGhyb3cgRXJyb3IoXCJCaW5hcnkgb3BlcmF0b3IgYWxyZWFkeSBjcmVhdGVkOiBcIithKTthPW5ldyBYYShhLGIsYyxkKTtyZXR1cm4gWWFbYS50b1N0cmluZygpXT1hfVAoXCJkaXZcIiw2LDEsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBLKGEsYykvSyhiLGMpfSk7UChcIm1vZFwiLDYsMSxmdW5jdGlvbihhLGIsYyl7cmV0dXJuIEsoYSxjKSVLKGIsYyl9KTtQKFwiKlwiLDYsMSxmdW5jdGlvbihhLGIsYyl7cmV0dXJuIEsoYSxjKSpLKGIsYyl9KTtQKFwiK1wiLDUsMSxmdW5jdGlvbihhLGIsYyl7cmV0dXJuIEsoYSxjKStLKGIsYyl9KTtQKFwiLVwiLDUsMSxmdW5jdGlvbihhLGIsYyl7cmV0dXJuIEsoYSxjKS1LKGIsYyl9KTtQKFwiPFwiLDQsMixmdW5jdGlvbihhLGIsYyl7cmV0dXJuIE8oZnVuY3Rpb24oYSxiKXtyZXR1cm4gYTxifSxhLGIsYyl9KTtcblAoXCI+XCIsNCwyLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTyhmdW5jdGlvbihhLGIpe3JldHVybiBhPmJ9LGEsYixjKX0pO1AoXCI8PVwiLDQsMixmdW5jdGlvbihhLGIsYyl7cmV0dXJuIE8oZnVuY3Rpb24oYSxiKXtyZXR1cm4gYTw9Yn0sYSxiLGMpfSk7UChcIj49XCIsNCwyLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTyhmdW5jdGlvbihhLGIpe3JldHVybiBhPj1ifSxhLGIsYyl9KTt2YXIgV2E9UChcIj1cIiwzLDIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBPKGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9PWJ9LGEsYixjLCEwKX0pO1AoXCIhPVwiLDMsMixmdW5jdGlvbihhLGIsYyl7cmV0dXJuIE8oZnVuY3Rpb24oYSxiKXtyZXR1cm4gYSE9Yn0sYSxiLGMsITApfSk7UChcImFuZFwiLDIsMixmdW5jdGlvbihhLGIsYyl7cmV0dXJuIE0oYSxjKSYmTShiLGMpfSk7UChcIm9yXCIsMSwyLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTShhLGMpfHxNKGIsYyl9KTtmdW5jdGlvbiBRKGEsYixjKXt0aGlzLmE9YTt0aGlzLmI9Ynx8MTt0aGlzLmY9Y3x8MX07ZnVuY3Rpb24gWmEoYSxiKXtpZihiLmEubGVuZ3RoJiY0IT1hLmkpdGhyb3cgRXJyb3IoXCJQcmltYXJ5IGV4cHJlc3Npb24gbXVzdCBldmFsdWF0ZSB0byBub2Rlc2V0IGlmIGZpbHRlciBoYXMgcHJlZGljYXRlKHMpLlwiKTtuLmNhbGwodGhpcyxhLmkpO3RoaXMuYz1hO3RoaXMuaD1iO3RoaXMuZz1hLmc7dGhpcy5iPWEuYn1tKFphKTtaYS5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXthPXRoaXMuYy5hKGEpO3JldHVybiAkYSh0aGlzLmgsYSl9O1phLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3ZhciBhO2E9XCJGaWx0ZXI6XCIrSih0aGlzLmMpO3JldHVybiBhKz1KKHRoaXMuaCl9O2Z1bmN0aW9uIGFiKGEsYil7aWYoYi5sZW5ndGg8YS5BKXRocm93IEVycm9yKFwiRnVuY3Rpb24gXCIrYS5qK1wiIGV4cGVjdHMgYXQgbGVhc3RcIithLkErXCIgYXJndW1lbnRzLCBcIitiLmxlbmd0aCtcIiBnaXZlblwiKTtpZihudWxsIT09YS52JiZiLmxlbmd0aD5hLnYpdGhyb3cgRXJyb3IoXCJGdW5jdGlvbiBcIithLmorXCIgZXhwZWN0cyBhdCBtb3N0IFwiK2EuditcIiBhcmd1bWVudHMsIFwiK2IubGVuZ3RoK1wiIGdpdmVuXCIpO2EuQiYmcihiLGZ1bmN0aW9uKGIsZCl7aWYoNCE9Yi5pKXRocm93IEVycm9yKFwiQXJndW1lbnQgXCIrZCtcIiB0byBmdW5jdGlvbiBcIithLmorXCIgaXMgbm90IG9mIHR5cGUgTm9kZXNldDogXCIrYik7fSk7bi5jYWxsKHRoaXMsYS5pKTt0aGlzLmg9YTt0aGlzLmM9YjtVYSh0aGlzLGEuZ3x8amEoYixmdW5jdGlvbihhKXtyZXR1cm4gYS5nfSkpO1ZhKHRoaXMsYS5EJiYhYi5sZW5ndGh8fGEuQyYmISFiLmxlbmd0aHx8amEoYixmdW5jdGlvbihhKXtyZXR1cm4gYS5ifSkpfW0oYWIpO1xuYWIucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuaC5tLmFwcGx5KG51bGwsbGEoYSx0aGlzLmMpKX07YWIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7dmFyIGE9XCJGdW5jdGlvbjogXCIrdGhpcy5oO2lmKHRoaXMuYy5sZW5ndGgpdmFyIGI9dCh0aGlzLmMsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYStKKGIpfSxcIkFyZ3VtZW50czpcIiksYT1hK0ooYik7cmV0dXJuIGF9O2Z1bmN0aW9uIGJiKGEsYixjLGQsZSxmLGcsaCxwKXt0aGlzLmo9YTt0aGlzLmk9Yjt0aGlzLmc9Yzt0aGlzLkQ9ZDt0aGlzLkM9ZTt0aGlzLm09Zjt0aGlzLkE9Zzt0aGlzLnY9dm9pZCAwIT09aD9oOmc7dGhpcy5CPSEhcH1iYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5qfTt2YXIgY2I9e307XG5mdW5jdGlvbiBSKGEsYixjLGQsZSxmLGcsaCl7aWYoY2IuaGFzT3duUHJvcGVydHkoYSkpdGhyb3cgRXJyb3IoXCJGdW5jdGlvbiBhbHJlYWR5IGNyZWF0ZWQ6IFwiK2ErXCIuXCIpO2NiW2FdPW5ldyBiYihhLGIsYyxkLCExLGUsZixnLGgpfVIoXCJib29sZWFuXCIsMiwhMSwhMSxmdW5jdGlvbihhLGIpe3JldHVybiBNKGIsYSl9LDEpO1IoXCJjZWlsaW5nXCIsMSwhMSwhMSxmdW5jdGlvbihhLGIpe3JldHVybiBNYXRoLmNlaWwoSyhiLGEpKX0sMSk7UihcImNvbmNhdFwiLDMsITEsITEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gdChtYShhcmd1bWVudHMsMSksZnVuY3Rpb24oYixkKXtyZXR1cm4gYitMKGQsYSl9LFwiXCIpfSwyLG51bGwpO1IoXCJjb250YWluc1wiLDIsITEsITEsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBxKEwoYixhKSxMKGMsYSkpfSwyKTtSKFwiY291bnRcIiwxLCExLCExLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIuYShhKS5sfSwxLDEsITApO1xuUihcImZhbHNlXCIsMiwhMSwhMSxmdW5jdGlvbigpe3JldHVybiExfSwwKTtSKFwiZmxvb3JcIiwxLCExLCExLGZ1bmN0aW9uKGEsYil7cmV0dXJuIE1hdGguZmxvb3IoSyhiLGEpKX0sMSk7UihcImlkXCIsNCwhMSwhMSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7aWYodyl7dmFyIGI9ZS5hbGxbYV07aWYoYil7aWYoYi5ub2RlVHlwZSYmYT09Yi5pZClyZXR1cm4gYjtpZihiLmxlbmd0aClyZXR1cm4ga2EoYixmdW5jdGlvbihiKXtyZXR1cm4gYT09Yi5pZH0pfXJldHVybiBudWxsfXJldHVybiBlLmdldEVsZW1lbnRCeUlkKGEpfXZhciBkPWEuYSxlPTk9PWQubm9kZVR5cGU/ZDpkLm93bmVyRG9jdW1lbnQsZD1MKGIsYSkuc3BsaXQoL1xccysvKSxmPVtdO3IoZCxmdW5jdGlvbihhKXthPWMoYSk7IWF8fDA8PWhhKGYsYSl8fGYucHVzaChhKX0pO2Yuc29ydChMYSk7dmFyIGc9bmV3IEM7cihmLGZ1bmN0aW9uKGEpe0YoZyxhKX0pO3JldHVybiBnfSwxKTtcblIoXCJsYW5nXCIsMiwhMSwhMSxmdW5jdGlvbigpe3JldHVybiExfSwxKTtSKFwibGFzdFwiLDEsITAsITEsZnVuY3Rpb24oYSl7aWYoMSE9YXJndW1lbnRzLmxlbmd0aCl0aHJvdyBFcnJvcihcIkZ1bmN0aW9uIGxhc3QgZXhwZWN0cyAoKVwiKTtyZXR1cm4gYS5mfSwwKTtSKFwibG9jYWwtbmFtZVwiLDMsITEsITAsZnVuY3Rpb24oYSxiKXt2YXIgYz1iP1JhKGIuYShhKSk6YS5hO3JldHVybiBjP2MubG9jYWxOYW1lfHxjLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk6XCJcIn0sMCwxLCEwKTtSKFwibmFtZVwiLDMsITEsITAsZnVuY3Rpb24oYSxiKXt2YXIgYz1iP1JhKGIuYShhKSk6YS5hO3JldHVybiBjP2Mubm9kZU5hbWUudG9Mb3dlckNhc2UoKTpcIlwifSwwLDEsITApO1IoXCJuYW1lc3BhY2UtdXJpXCIsMywhMCwhMSxmdW5jdGlvbigpe3JldHVyblwiXCJ9LDAsMSwhMCk7XG5SKFwibm9ybWFsaXplLXNwYWNlXCIsMywhMSwhMCxmdW5jdGlvbihhLGIpe3JldHVybihiP0woYixhKTp6KGEuYSkpLnJlcGxhY2UoL1tcXHNcXHhhMF0rL2csXCIgXCIpLnJlcGxhY2UoL15cXHMrfFxccyskL2csXCJcIil9LDAsMSk7UihcIm5vdFwiLDIsITEsITEsZnVuY3Rpb24oYSxiKXtyZXR1cm4hTShiLGEpfSwxKTtSKFwibnVtYmVyXCIsMSwhMSwhMCxmdW5jdGlvbihhLGIpe3JldHVybiBiP0soYixhKToreihhLmEpfSwwLDEpO1IoXCJwb3NpdGlvblwiLDEsITAsITEsZnVuY3Rpb24oYSl7cmV0dXJuIGEuYn0sMCk7UihcInJvdW5kXCIsMSwhMSwhMSxmdW5jdGlvbihhLGIpe3JldHVybiBNYXRoLnJvdW5kKEsoYixhKSl9LDEpO1IoXCJzdGFydHMtd2l0aFwiLDIsITEsITEsZnVuY3Rpb24oYSxiLGMpe2I9TChiLGEpO2E9TChjLGEpO3JldHVybiAwPT1iLmxhc3RJbmRleE9mKGEsMCl9LDIpO1IoXCJzdHJpbmdcIiwzLCExLCEwLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGI/TChiLGEpOnooYS5hKX0sMCwxKTtcblIoXCJzdHJpbmctbGVuZ3RoXCIsMSwhMSwhMCxmdW5jdGlvbihhLGIpe3JldHVybihiP0woYixhKTp6KGEuYSkpLmxlbmd0aH0sMCwxKTtSKFwic3Vic3RyaW5nXCIsMywhMSwhMSxmdW5jdGlvbihhLGIsYyxkKXtjPUsoYyxhKTtpZihpc05hTihjKXx8SW5maW5pdHk9PWN8fC1JbmZpbml0eT09YylyZXR1cm5cIlwiO2Q9ZD9LKGQsYSk6SW5maW5pdHk7aWYoaXNOYU4oZCl8fC1JbmZpbml0eT09PWQpcmV0dXJuXCJcIjtjPU1hdGgucm91bmQoYyktMTt2YXIgZT1NYXRoLm1heChjLDApO2E9TChiLGEpO3JldHVybiBJbmZpbml0eT09ZD9hLnN1YnN0cmluZyhlKTphLnN1YnN0cmluZyhlLGMrTWF0aC5yb3VuZChkKSl9LDIsMyk7UihcInN1YnN0cmluZy1hZnRlclwiLDMsITEsITEsZnVuY3Rpb24oYSxiLGMpe2I9TChiLGEpO2E9TChjLGEpO2M9Yi5pbmRleE9mKGEpO3JldHVybi0xPT1jP1wiXCI6Yi5zdWJzdHJpbmcoYythLmxlbmd0aCl9LDIpO1xuUihcInN1YnN0cmluZy1iZWZvcmVcIiwzLCExLCExLGZ1bmN0aW9uKGEsYixjKXtiPUwoYixhKTthPUwoYyxhKTthPWIuaW5kZXhPZihhKTtyZXR1cm4tMT09YT9cIlwiOmIuc3Vic3RyaW5nKDAsYSl9LDIpO1IoXCJzdW1cIiwxLCExLCExLGZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPUgoYi5hKGEpKSxkPTAsZT1JKGMpO2U7ZT1JKGMpKWQrPSt6KGUpO3JldHVybiBkfSwxLDEsITApO1IoXCJ0cmFuc2xhdGVcIiwzLCExLCExLGZ1bmN0aW9uKGEsYixjLGQpe2I9TChiLGEpO2M9TChjLGEpO3ZhciBlPUwoZCxhKTthPXt9O2ZvcihkPTA7ZDxjLmxlbmd0aDtkKyspe3ZhciBmPWMuY2hhckF0KGQpO2YgaW4gYXx8KGFbZl09ZS5jaGFyQXQoZCkpfWM9XCJcIjtmb3IoZD0wO2Q8Yi5sZW5ndGg7ZCsrKWY9Yi5jaGFyQXQoZCksYys9ZiBpbiBhP2FbZl06ZjtyZXR1cm4gY30sMyk7UihcInRydWVcIiwyLCExLCExLGZ1bmN0aW9uKCl7cmV0dXJuITB9LDApO2Z1bmN0aW9uIEcoYSxiKXt0aGlzLmg9YTt0aGlzLmM9dm9pZCAwIT09Yj9iOm51bGw7dGhpcy5iPW51bGw7c3dpdGNoKGEpe2Nhc2UgXCJjb21tZW50XCI6dGhpcy5iPTg7YnJlYWs7Y2FzZSBcInRleHRcIjp0aGlzLmI9MzticmVhaztjYXNlIFwicHJvY2Vzc2luZy1pbnN0cnVjdGlvblwiOnRoaXMuYj03O2JyZWFrO2Nhc2UgXCJub2RlXCI6YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcIlVuZXhwZWN0ZWQgYXJndW1lbnRcIik7fX1mdW5jdGlvbiBkYihhKXtyZXR1cm5cImNvbW1lbnRcIj09YXx8XCJ0ZXh0XCI9PWF8fFwicHJvY2Vzc2luZy1pbnN0cnVjdGlvblwiPT1hfHxcIm5vZGVcIj09YX1HLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3JldHVybiBudWxsPT09dGhpcy5ifHx0aGlzLmI9PWEubm9kZVR5cGV9O0cucHJvdG90eXBlLmY9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ofTtcbkcucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7dmFyIGE9XCJLaW5kIFRlc3Q6IFwiK3RoaXMuaDtudWxsPT09dGhpcy5jfHwoYSs9Sih0aGlzLmMpKTtyZXR1cm4gYX07ZnVuY3Rpb24gZWIoYSl7dGhpcy5iPWE7dGhpcy5hPTB9ZnVuY3Rpb24gZmIoYSl7YT1hLm1hdGNoKGdiKTtmb3IodmFyIGI9MDtiPGEubGVuZ3RoO2IrKyloYi50ZXN0KGFbYl0pJiZhLnNwbGljZShiLDEpO3JldHVybiBuZXcgZWIoYSl9dmFyIGdiPS9cXCQ/KD86KD8hWzAtOS1cXC5dKSg/OlxcKnxbXFx3LVxcLl0rKTopPyg/IVswLTktXFwuXSkoPzpcXCp8W1xcdy1cXC5dKyl8XFwvXFwvfFxcLlxcLnw6OnxcXGQrKD86XFwuXFxkKik/fFxcLlxcZCt8XCJbXlwiXSpcInwnW14nXSonfFshPD5dPXxcXHMrfC4vZyxoYj0vXlxccy87ZnVuY3Rpb24gUyhhLGIpe3JldHVybiBhLmJbYS5hKyhifHwwKV19ZnVuY3Rpb24gVChhKXtyZXR1cm4gYS5iW2EuYSsrXX1mdW5jdGlvbiBpYihhKXtyZXR1cm4gYS5iLmxlbmd0aDw9YS5hfTtmdW5jdGlvbiBqYihhKXtuLmNhbGwodGhpcywzKTt0aGlzLmM9YS5zdWJzdHJpbmcoMSxhLmxlbmd0aC0xKX1tKGpiKTtqYi5wcm90b3R5cGUuYT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmN9O2piLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVyblwiTGl0ZXJhbDogXCIrdGhpcy5jfTtmdW5jdGlvbiBFKGEsYil7dGhpcy5qPWEudG9Mb3dlckNhc2UoKTt2YXIgYztjPVwiKlwiPT10aGlzLmo/XCIqXCI6XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7dGhpcy5jPWI/Yi50b0xvd2VyQ2FzZSgpOmN9RS5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXt2YXIgYj1hLm5vZGVUeXBlO2lmKDEhPWImJjIhPWIpcmV0dXJuITE7Yj12b2lkIDAhPT1hLmxvY2FsTmFtZT9hLmxvY2FsTmFtZTphLm5vZGVOYW1lO3JldHVyblwiKlwiIT10aGlzLmomJnRoaXMuaiE9Yi50b0xvd2VyQ2FzZSgpPyExOlwiKlwiPT10aGlzLmM/ITA6dGhpcy5jPT0oYS5uYW1lc3BhY2VVUkk/YS5uYW1lc3BhY2VVUkkudG9Mb3dlckNhc2UoKTpcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIil9O0UucHJvdG90eXBlLmY9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5qfTtcbkUucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJOYW1lIFRlc3Q6IFwiKyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIj09dGhpcy5jP1wiXCI6dGhpcy5jK1wiOlwiKSt0aGlzLmp9O2Z1bmN0aW9uIGtiKGEsYil7bi5jYWxsKHRoaXMsYS5pKTt0aGlzLmg9YTt0aGlzLmM9Yjt0aGlzLmc9YS5nO3RoaXMuYj1hLmI7aWYoMT09dGhpcy5jLmxlbmd0aCl7dmFyIGM9dGhpcy5jWzBdO2MudXx8Yy5jIT1sYnx8KGM9Yy5vLFwiKlwiIT1jLmYoKSYmKHRoaXMuZj17bmFtZTpjLmYoKSxzOm51bGx9KSl9fW0oa2IpO2Z1bmN0aW9uIG1iKCl7bi5jYWxsKHRoaXMsNCl9bShtYik7bWIucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7dmFyIGI9bmV3IEM7YT1hLmE7OT09YS5ub2RlVHlwZT9GKGIsYSk6RihiLGEub3duZXJEb2N1bWVudCk7cmV0dXJuIGJ9O21iLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVyblwiUm9vdCBIZWxwZXIgRXhwcmVzc2lvblwifTtmdW5jdGlvbiBuYigpe24uY2FsbCh0aGlzLDQpfW0obmIpO25iLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3ZhciBiPW5ldyBDO0YoYixhLmEpO3JldHVybiBifTtuYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIkNvbnRleHQgSGVscGVyIEV4cHJlc3Npb25cIn07XG5mdW5jdGlvbiBvYihhKXtyZXR1cm5cIi9cIj09YXx8XCIvL1wiPT1hfWtiLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuaC5hKGEpO2lmKCEoYiBpbnN0YW5jZW9mIEMpKXRocm93IEVycm9yKFwiRmlsdGVyIGV4cHJlc3Npb24gbXVzdCBldmFsdWF0ZSB0byBub2Rlc2V0LlwiKTthPXRoaXMuYztmb3IodmFyIGM9MCxkPWEubGVuZ3RoO2M8ZCYmYi5sO2MrKyl7dmFyIGU9YVtjXSxmPUgoYixlLmMuYSksZztpZihlLmd8fGUuYyE9cGIpaWYoZS5nfHxlLmMhPXFiKWZvcihnPUkoZiksYj1lLmEobmV3IFEoZykpO251bGwhPShnPUkoZikpOylnPWUuYShuZXcgUShnKSksYj1QYShiLGcpO2Vsc2UgZz1JKGYpLGI9ZS5hKG5ldyBRKGcpKTtlbHNle2ZvcihnPUkoZik7KGI9SShmKSkmJighZy5jb250YWluc3x8Zy5jb250YWlucyhiKSkmJmIuY29tcGFyZURvY3VtZW50UG9zaXRpb24oZykmODtnPWIpO2I9ZS5hKG5ldyBRKGcpKX19cmV0dXJuIGJ9O1xua2IucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7dmFyIGE7YT1cIlBhdGggRXhwcmVzc2lvbjpcIitKKHRoaXMuaCk7aWYodGhpcy5jLmxlbmd0aCl7dmFyIGI9dCh0aGlzLmMsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYStKKGIpfSxcIlN0ZXBzOlwiKTthKz1KKGIpfXJldHVybiBhfTtmdW5jdGlvbiByYihhKXtuLmNhbGwodGhpcyw0KTt0aGlzLmM9YTtVYSh0aGlzLGphKHRoaXMuYyxmdW5jdGlvbihhKXtyZXR1cm4gYS5nfSkpO1ZhKHRoaXMsamEodGhpcy5jLGZ1bmN0aW9uKGEpe3JldHVybiBhLmJ9KSl9bShyYik7cmIucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7dmFyIGI9bmV3IEM7cih0aGlzLmMsZnVuY3Rpb24oYyl7Yz1jLmEoYSk7aWYoIShjIGluc3RhbmNlb2YgQykpdGhyb3cgRXJyb3IoXCJQYXRoIGV4cHJlc3Npb24gbXVzdCBldmFsdWF0ZSB0byBOb2RlU2V0LlwiKTtiPVBhKGIsYyl9KTtyZXR1cm4gYn07cmIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHQodGhpcy5jLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGErSihiKX0sXCJVbmlvbiBFeHByZXNzaW9uOlwiKX07ZnVuY3Rpb24gc2IoYSxiKXt0aGlzLmE9YTt0aGlzLmI9ISFifVxuZnVuY3Rpb24gJGEoYSxiLGMpe2ZvcihjPWN8fDA7YzxhLmEubGVuZ3RoO2MrKylmb3IodmFyIGQ9YS5hW2NdLGU9SChiKSxmPWIubCxnLGg9MDtnPUkoZSk7aCsrKXt2YXIgcD1hLmI/Zi1oOmgrMTtnPWQuYShuZXcgUShnLHAsZikpO2lmKFwibnVtYmVyXCI9PXR5cGVvZiBnKXA9cD09ZztlbHNlIGlmKFwic3RyaW5nXCI9PXR5cGVvZiBnfHxcImJvb2xlYW5cIj09dHlwZW9mIGcpcD0hIWc7ZWxzZSBpZihnIGluc3RhbmNlb2YgQylwPTA8Zy5sO2Vsc2UgdGhyb3cgRXJyb3IoXCJQcmVkaWNhdGUuZXZhbHVhdGUgcmV0dXJuZWQgYW4gdW5leHBlY3RlZCB0eXBlLlwiKTtpZighcCl7cD1lO2c9cC5mO3ZhciB5PXAuYTtpZigheSl0aHJvdyBFcnJvcihcIk5leHQgbXVzdCBiZSBjYWxsZWQgYXQgbGVhc3Qgb25jZSBiZWZvcmUgcmVtb3ZlLlwiKTt2YXIgRD15LmIseT15LmE7RD9ELmE9eTpnLmE9eTt5P3kuYj1EOmcuYj1EO2cubC0tO3AuYT1udWxsfX1yZXR1cm4gYn1cbnNiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0KHRoaXMuYSxmdW5jdGlvbihhLGIpe3JldHVybiBhK0ooYil9LFwiUHJlZGljYXRlczpcIil9O2Z1bmN0aW9uIFUoYSxiLGMsZCl7bi5jYWxsKHRoaXMsNCk7dGhpcy5jPWE7dGhpcy5vPWI7dGhpcy5oPWN8fG5ldyBzYihbXSk7dGhpcy51PSEhZDtiPXRoaXMuaDtiPTA8Yi5hLmxlbmd0aD9iLmFbMF0uZjpudWxsO2EuYiYmYiYmKGE9Yi5uYW1lLGE9dz9hLnRvTG93ZXJDYXNlKCk6YSx0aGlzLmY9e25hbWU6YSxzOmIuc30pO2E6e2E9dGhpcy5oO2ZvcihiPTA7YjxhLmEubGVuZ3RoO2IrKylpZihjPWEuYVtiXSxjLmd8fDE9PWMuaXx8MD09Yy5pKXthPSEwO2JyZWFrIGF9YT0hMX10aGlzLmc9YX1tKFUpO1xuVS5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXt2YXIgYj1hLmEsYz1udWxsLGM9dGhpcy5mLGQ9bnVsbCxlPW51bGwsZj0wO2MmJihkPWMubmFtZSxlPWMucz9MKGMucyxhKTpudWxsLGY9MSk7aWYodGhpcy51KWlmKHRoaXMuZ3x8dGhpcy5jIT10YilpZihhPUgoKG5ldyBVKHViLG5ldyBHKFwibm9kZVwiKSkpLmEoYSkpLGI9SShhKSlmb3IoYz10aGlzLm0oYixkLGUsZik7bnVsbCE9KGI9SShhKSk7KWM9UGEoYyx0aGlzLm0oYixkLGUsZikpO2Vsc2UgYz1uZXcgQztlbHNlIGM9Qih0aGlzLm8sYixkLGUpLGM9JGEodGhpcy5oLGMsZik7ZWxzZSBjPXRoaXMubShhLmEsZCxlLGYpO3JldHVybiBjfTtVLnByb3RvdHlwZS5tPWZ1bmN0aW9uKGEsYixjLGQpe2E9dGhpcy5jLmYodGhpcy5vLGEsYixjKTtyZXR1cm4gYT0kYSh0aGlzLmgsYSxkKX07XG5VLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3ZhciBhO2E9XCJTdGVwOlwiK0ooXCJPcGVyYXRvcjogXCIrKHRoaXMudT9cIi8vXCI6XCIvXCIpKTt0aGlzLmMuaiYmKGErPUooXCJBeGlzOiBcIit0aGlzLmMpKTthKz1KKHRoaXMubyk7aWYodGhpcy5oLmEubGVuZ3RoKXt2YXIgYj10KHRoaXMuaC5hLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGErSihiKX0sXCJQcmVkaWNhdGVzOlwiKTthKz1KKGIpfXJldHVybiBhfTtmdW5jdGlvbiB2YihhLGIsYyxkKXt0aGlzLmo9YTt0aGlzLmY9Yjt0aGlzLmE9Yzt0aGlzLmI9ZH12Yi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5qfTt2YXIgd2I9e307ZnVuY3Rpb24gVihhLGIsYyxkKXtpZih3Yi5oYXNPd25Qcm9wZXJ0eShhKSl0aHJvdyBFcnJvcihcIkF4aXMgYWxyZWFkeSBjcmVhdGVkOiBcIithKTtiPW5ldyB2YihhLGIsYywhIWQpO3JldHVybiB3YlthXT1ifVxuVihcImFuY2VzdG9yXCIsZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9bmV3IEMsZD1iO2Q9ZC5wYXJlbnROb2RlOylhLmEoZCkmJlFhKGMsZCk7cmV0dXJuIGN9LCEwKTtWKFwiYW5jZXN0b3Itb3Itc2VsZlwiLGZ1bmN0aW9uKGEsYil7dmFyIGM9bmV3IEMsZD1iO2RvIGEuYShkKSYmUWEoYyxkKTt3aGlsZShkPWQucGFyZW50Tm9kZSk7cmV0dXJuIGN9LCEwKTtcbnZhciBsYj1WKFwiYXR0cmlidXRlXCIsZnVuY3Rpb24oYSxiKXt2YXIgYz1uZXcgQyxkPWEuZigpO2lmKFwic3R5bGVcIj09ZCYmdyYmYi5zdHlsZSlyZXR1cm4gRihjLG5ldyB4KGIuc3R5bGUsYixcInN0eWxlXCIsYi5zdHlsZS5jc3NUZXh0KSksYzt2YXIgZT1iLmF0dHJpYnV0ZXM7aWYoZSlpZihhIGluc3RhbmNlb2YgRyYmbnVsbD09PWEuYnx8XCIqXCI9PWQpZm9yKHZhciBkPTAsZjtmPWVbZF07ZCsrKXc/Zi5ub2RlVmFsdWUmJkYoYyxEYShiLGYpKTpGKGMsZik7ZWxzZShmPWUuZ2V0TmFtZWRJdGVtKGQpKSYmKHc/Zi5ub2RlVmFsdWUmJkYoYyxEYShiLGYpKTpGKGMsZikpO3JldHVybiBjfSwhMSksdGI9VihcImNoaWxkXCIsZnVuY3Rpb24oYSxiLGMsZCxlKXtyZXR1cm4odz9JYTpKYSkuY2FsbChudWxsLGEsYixsKGMpP2M6bnVsbCxsKGQpP2Q6bnVsbCxlfHxuZXcgQyl9LCExLCEwKTtWKFwiZGVzY2VuZGFudFwiLEIsITEsITApO1xudmFyIHViPVYoXCJkZXNjZW5kYW50LW9yLXNlbGZcIixmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1uZXcgQztBKGIsYyxkKSYmYS5hKGIpJiZGKGUsYik7cmV0dXJuIEIoYSxiLGMsZCxlKX0sITEsITApLHBiPVYoXCJmb2xsb3dpbmdcIixmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1uZXcgQztkbyBmb3IodmFyIGY9YjtmPWYubmV4dFNpYmxpbmc7KUEoZixjLGQpJiZhLmEoZikmJkYoZSxmKSxlPUIoYSxmLGMsZCxlKTt3aGlsZShiPWIucGFyZW50Tm9kZSk7cmV0dXJuIGV9LCExLCEwKTtWKFwiZm9sbG93aW5nLXNpYmxpbmdcIixmdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1uZXcgQyxkPWI7ZD1kLm5leHRTaWJsaW5nOylhLmEoZCkmJkYoYyxkKTtyZXR1cm4gY30sITEpO1YoXCJuYW1lc3BhY2VcIixmdW5jdGlvbigpe3JldHVybiBuZXcgQ30sITEpO1xudmFyIHhiPVYoXCJwYXJlbnRcIixmdW5jdGlvbihhLGIpe3ZhciBjPW5ldyBDO2lmKDk9PWIubm9kZVR5cGUpcmV0dXJuIGM7aWYoMj09Yi5ub2RlVHlwZSlyZXR1cm4gRihjLGIub3duZXJFbGVtZW50KSxjO3ZhciBkPWIucGFyZW50Tm9kZTthLmEoZCkmJkYoYyxkKTtyZXR1cm4gY30sITEpLHFiPVYoXCJwcmVjZWRpbmdcIixmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1uZXcgQyxmPVtdO2RvIGYudW5zaGlmdChiKTt3aGlsZShiPWIucGFyZW50Tm9kZSk7Zm9yKHZhciBnPTEsaD1mLmxlbmd0aDtnPGg7ZysrKXt2YXIgcD1bXTtmb3IoYj1mW2ddO2I9Yi5wcmV2aW91c1NpYmxpbmc7KXAudW5zaGlmdChiKTtmb3IodmFyIHk9MCxEPXAubGVuZ3RoO3k8RDt5KyspYj1wW3ldLEEoYixjLGQpJiZhLmEoYikmJkYoZSxiKSxlPUIoYSxiLGMsZCxlKX1yZXR1cm4gZX0sITAsITApO1xuVihcInByZWNlZGluZy1zaWJsaW5nXCIsZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9bmV3IEMsZD1iO2Q9ZC5wcmV2aW91c1NpYmxpbmc7KWEuYShkKSYmUWEoYyxkKTtyZXR1cm4gY30sITApO3ZhciB5Yj1WKFwic2VsZlwiLGZ1bmN0aW9uKGEsYil7dmFyIGM9bmV3IEM7YS5hKGIpJiZGKGMsYik7cmV0dXJuIGN9LCExKTtmdW5jdGlvbiB6YihhKXtuLmNhbGwodGhpcywxKTt0aGlzLmM9YTt0aGlzLmc9YS5nO3RoaXMuYj1hLmJ9bSh6Yik7emIucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7cmV0dXJuLUsodGhpcy5jLGEpfTt6Yi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIlVuYXJ5IEV4cHJlc3Npb246IC1cIitKKHRoaXMuYyl9O2Z1bmN0aW9uIEFiKGEpe24uY2FsbCh0aGlzLDEpO3RoaXMuYz1hfW0oQWIpO0FiLnByb3RvdHlwZS5hPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY307QWIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJOdW1iZXI6IFwiK3RoaXMuY307ZnVuY3Rpb24gQmIoYSxiKXt0aGlzLmE9YTt0aGlzLmI9Yn1mdW5jdGlvbiBDYihhKXtmb3IodmFyIGIsYz1bXTs7KXtXKGEsXCJNaXNzaW5nIHJpZ2h0IGhhbmQgc2lkZSBvZiBiaW5hcnkgZXhwcmVzc2lvbi5cIik7Yj1EYihhKTt2YXIgZD1UKGEuYSk7aWYoIWQpYnJlYWs7dmFyIGU9KGQ9WWFbZF18fG51bGwpJiZkLnc7aWYoIWUpe2EuYS5hLS07YnJlYWt9Zm9yKDtjLmxlbmd0aCYmZTw9Y1tjLmxlbmd0aC0xXS53OyliPW5ldyBOKGMucG9wKCksYy5wb3AoKSxiKTtjLnB1c2goYixkKX1mb3IoO2MubGVuZ3RoOyliPW5ldyBOKGMucG9wKCksYy5wb3AoKSxiKTtyZXR1cm4gYn1mdW5jdGlvbiBXKGEsYil7aWYoaWIoYS5hKSl0aHJvdyBFcnJvcihiKTt9ZnVuY3Rpb24gRWIoYSxiKXt2YXIgYz1UKGEuYSk7aWYoYyE9Yil0aHJvdyBFcnJvcihcIkJhZCB0b2tlbiwgZXhwZWN0ZWQ6IFwiK2IrXCIgZ290OiBcIitjKTt9XG5mdW5jdGlvbiBGYihhKXthPVQoYS5hKTtpZihcIilcIiE9YSl0aHJvdyBFcnJvcihcIkJhZCB0b2tlbjogXCIrYSk7fWZ1bmN0aW9uIEdiKGEpe2E9VChhLmEpO2lmKDI+YS5sZW5ndGgpdGhyb3cgRXJyb3IoXCJVbmNsb3NlZCBsaXRlcmFsIHN0cmluZ1wiKTtyZXR1cm4gbmV3IGpiKGEpfVxuZnVuY3Rpb24gSGIoYSl7dmFyIGIsYz1bXSxkO2lmKG9iKFMoYS5hKSkpe2I9VChhLmEpO2Q9UyhhLmEpO2lmKFwiL1wiPT1iJiYoaWIoYS5hKXx8XCIuXCIhPWQmJlwiLi5cIiE9ZCYmXCJAXCIhPWQmJlwiKlwiIT1kJiYhLyg/IVswLTldKVtcXHddLy50ZXN0KGQpKSlyZXR1cm4gbmV3IG1iO2Q9bmV3IG1iO1coYSxcIk1pc3NpbmcgbmV4dCBsb2NhdGlvbiBzdGVwLlwiKTtiPUliKGEsYik7Yy5wdXNoKGIpfWVsc2V7YTp7Yj1TKGEuYSk7ZD1iLmNoYXJBdCgwKTtzd2l0Y2goZCl7Y2FzZSBcIiRcIjp0aHJvdyBFcnJvcihcIlZhcmlhYmxlIHJlZmVyZW5jZSBub3QgYWxsb3dlZCBpbiBIVE1MIFhQYXRoXCIpO2Nhc2UgXCIoXCI6VChhLmEpO2I9Q2IoYSk7VyhhLCd1bmNsb3NlZCBcIihcIicpO0ViKGEsXCIpXCIpO2JyZWFrO2Nhc2UgJ1wiJzpjYXNlIFwiJ1wiOmI9R2IoYSk7YnJlYWs7ZGVmYXVsdDppZihpc05hTigrYikpaWYoIWRiKGIpJiYvKD8hWzAtOV0pW1xcd10vLnRlc3QoZCkmJlwiKFwiPT1TKGEuYSwxKSl7Yj1UKGEuYSk7XG5iPWNiW2JdfHxudWxsO1QoYS5hKTtmb3IoZD1bXTtcIilcIiE9UyhhLmEpOyl7VyhhLFwiTWlzc2luZyBmdW5jdGlvbiBhcmd1bWVudCBsaXN0LlwiKTtkLnB1c2goQ2IoYSkpO2lmKFwiLFwiIT1TKGEuYSkpYnJlYWs7VChhLmEpfVcoYSxcIlVuY2xvc2VkIGZ1bmN0aW9uIGFyZ3VtZW50IGxpc3QuXCIpO0ZiKGEpO2I9bmV3IGFiKGIsZCl9ZWxzZXtiPW51bGw7YnJlYWsgYX1lbHNlIGI9bmV3IEFiKCtUKGEuYSkpfVwiW1wiPT1TKGEuYSkmJihkPW5ldyBzYihKYihhKSksYj1uZXcgWmEoYixkKSl9aWYoYilpZihvYihTKGEuYSkpKWQ9YjtlbHNlIHJldHVybiBiO2Vsc2UgYj1JYihhLFwiL1wiKSxkPW5ldyBuYixjLnB1c2goYil9Zm9yKDtvYihTKGEuYSkpOyliPVQoYS5hKSxXKGEsXCJNaXNzaW5nIG5leHQgbG9jYXRpb24gc3RlcC5cIiksYj1JYihhLGIpLGMucHVzaChiKTtyZXR1cm4gbmV3IGtiKGQsYyl9XG5mdW5jdGlvbiBJYihhLGIpe3ZhciBjLGQsZTtpZihcIi9cIiE9YiYmXCIvL1wiIT1iKXRocm93IEVycm9yKCdTdGVwIG9wIHNob3VsZCBiZSBcIi9cIiBvciBcIi8vXCInKTtpZihcIi5cIj09UyhhLmEpKXJldHVybiBkPW5ldyBVKHliLG5ldyBHKFwibm9kZVwiKSksVChhLmEpLGQ7aWYoXCIuLlwiPT1TKGEuYSkpcmV0dXJuIGQ9bmV3IFUoeGIsbmV3IEcoXCJub2RlXCIpKSxUKGEuYSksZDt2YXIgZjtpZihcIkBcIj09UyhhLmEpKWY9bGIsVChhLmEpLFcoYSxcIk1pc3NpbmcgYXR0cmlidXRlIG5hbWVcIik7ZWxzZSBpZihcIjo6XCI9PVMoYS5hLDEpKXtpZighLyg/IVswLTldKVtcXHddLy50ZXN0KFMoYS5hKS5jaGFyQXQoMCkpKXRocm93IEVycm9yKFwiQmFkIHRva2VuOiBcIitUKGEuYSkpO2M9VChhLmEpO2Y9d2JbY118fG51bGw7aWYoIWYpdGhyb3cgRXJyb3IoXCJObyBheGlzIHdpdGggbmFtZTogXCIrYyk7VChhLmEpO1coYSxcIk1pc3Npbmcgbm9kZSBuYW1lXCIpfWVsc2UgZj10YjtjPVMoYS5hKTtpZigvKD8hWzAtOV0pW1xcd1xcKl0vLnRlc3QoYy5jaGFyQXQoMCkpKWlmKFwiKFwiPT1cblMoYS5hLDEpKXtpZighZGIoYykpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIG5vZGUgdHlwZTogXCIrYyk7Yz1UKGEuYSk7aWYoIWRiKGMpKXRocm93IEVycm9yKFwiSW52YWxpZCB0eXBlIG5hbWU6IFwiK2MpO0ViKGEsXCIoXCIpO1coYSxcIkJhZCBub2RldHlwZVwiKTtlPVMoYS5hKS5jaGFyQXQoMCk7dmFyIGc9bnVsbDtpZignXCInPT1lfHxcIidcIj09ZSlnPUdiKGEpO1coYSxcIkJhZCBub2RldHlwZVwiKTtGYihhKTtjPW5ldyBHKGMsZyl9ZWxzZSBpZihjPVQoYS5hKSxlPWMuaW5kZXhPZihcIjpcIiksLTE9PWUpYz1uZXcgRShjKTtlbHNle3ZhciBnPWMuc3Vic3RyaW5nKDAsZSksaDtpZihcIipcIj09ZyloPVwiKlwiO2Vsc2UgaWYoaD1hLmIoZyksIWgpdGhyb3cgRXJyb3IoXCJOYW1lc3BhY2UgcHJlZml4IG5vdCBkZWNsYXJlZDogXCIrZyk7Yz1jLnN1YnN0cihlKzEpO2M9bmV3IEUoYyxoKX1lbHNlIHRocm93IEVycm9yKFwiQmFkIHRva2VuOiBcIitUKGEuYSkpO2U9bmV3IHNiKEpiKGEpLGYuYSk7cmV0dXJuIGR8fFxubmV3IFUoZixjLGUsXCIvL1wiPT1iKX1mdW5jdGlvbiBKYihhKXtmb3IodmFyIGI9W107XCJbXCI9PVMoYS5hKTspe1QoYS5hKTtXKGEsXCJNaXNzaW5nIHByZWRpY2F0ZSBleHByZXNzaW9uLlwiKTt2YXIgYz1DYihhKTtiLnB1c2goYyk7VyhhLFwiVW5jbG9zZWQgcHJlZGljYXRlIGV4cHJlc3Npb24uXCIpO0ViKGEsXCJdXCIpfXJldHVybiBifWZ1bmN0aW9uIERiKGEpe2lmKFwiLVwiPT1TKGEuYSkpcmV0dXJuIFQoYS5hKSxuZXcgemIoRGIoYSkpO3ZhciBiPUhiKGEpO2lmKFwifFwiIT1TKGEuYSkpYT1iO2Vsc2V7Zm9yKGI9W2JdO1wifFwiPT1UKGEuYSk7KVcoYSxcIk1pc3NpbmcgbmV4dCB1bmlvbiBsb2NhdGlvbiBwYXRoLlwiKSxiLnB1c2goSGIoYSkpO2EuYS5hLS07YT1uZXcgcmIoYil9cmV0dXJuIGF9O2Z1bmN0aW9uIEtiKGEpe3N3aXRjaChhLm5vZGVUeXBlKXtjYXNlIDE6cmV0dXJuIGVhKExiLGEpO2Nhc2UgOTpyZXR1cm4gS2IoYS5kb2N1bWVudEVsZW1lbnQpO2Nhc2UgMTE6Y2FzZSAxMDpjYXNlIDY6Y2FzZSAxMjpyZXR1cm4gTWI7ZGVmYXVsdDpyZXR1cm4gYS5wYXJlbnROb2RlP0tiKGEucGFyZW50Tm9kZSk6TWJ9fWZ1bmN0aW9uIE1iKCl7cmV0dXJuIG51bGx9ZnVuY3Rpb24gTGIoYSxiKXtpZihhLnByZWZpeD09YilyZXR1cm4gYS5uYW1lc3BhY2VVUkl8fFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiO3ZhciBjPWEuZ2V0QXR0cmlidXRlTm9kZShcInhtbG5zOlwiK2IpO3JldHVybiBjJiZjLnNwZWNpZmllZD9jLnZhbHVlfHxudWxsOmEucGFyZW50Tm9kZSYmOSE9YS5wYXJlbnROb2RlLm5vZGVUeXBlP0xiKGEucGFyZW50Tm9kZSxiKTpudWxsfTtmdW5jdGlvbiBOYihhLGIpe2lmKCFhLmxlbmd0aCl0aHJvdyBFcnJvcihcIkVtcHR5IFhQYXRoIGV4cHJlc3Npb24uXCIpO3ZhciBjPWZiKGEpO2lmKGliKGMpKXRocm93IEVycm9yKFwiSW52YWxpZCBYUGF0aCBleHByZXNzaW9uLlwiKTtiP1wiZnVuY3Rpb25cIj09YWEoYil8fChiPWRhKGIubG9va3VwTmFtZXNwYWNlVVJJLGIpKTpiPWZ1bmN0aW9uKCl7cmV0dXJuIG51bGx9O3ZhciBkPUNiKG5ldyBCYihjLGIpKTtpZighaWIoYykpdGhyb3cgRXJyb3IoXCJCYWQgdG9rZW46IFwiK1QoYykpO3RoaXMuZXZhbHVhdGU9ZnVuY3Rpb24oYSxiKXt2YXIgYz1kLmEobmV3IFEoYSkpO3JldHVybiBuZXcgWShjLGIpfX1cbmZ1bmN0aW9uIFkoYSxiKXtpZigwPT1iKWlmKGEgaW5zdGFuY2VvZiBDKWI9NDtlbHNlIGlmKFwic3RyaW5nXCI9PXR5cGVvZiBhKWI9MjtlbHNlIGlmKFwibnVtYmVyXCI9PXR5cGVvZiBhKWI9MTtlbHNlIGlmKFwiYm9vbGVhblwiPT10eXBlb2YgYSliPTM7ZWxzZSB0aHJvdyBFcnJvcihcIlVuZXhwZWN0ZWQgZXZhbHVhdGlvbiByZXN1bHQuXCIpO2lmKDIhPWImJjEhPWImJjMhPWImJiEoYSBpbnN0YW5jZW9mIEMpKXRocm93IEVycm9yKFwidmFsdWUgY291bGQgbm90IGJlIGNvbnZlcnRlZCB0byB0aGUgc3BlY2lmaWVkIHR5cGVcIik7dGhpcy5yZXN1bHRUeXBlPWI7dmFyIGM7c3dpdGNoKGIpe2Nhc2UgMjp0aGlzLnN0cmluZ1ZhbHVlPWEgaW5zdGFuY2VvZiBDP1NhKGEpOlwiXCIrYTticmVhaztjYXNlIDE6dGhpcy5udW1iZXJWYWx1ZT1hIGluc3RhbmNlb2YgQz8rU2EoYSk6K2E7YnJlYWs7Y2FzZSAzOnRoaXMuYm9vbGVhblZhbHVlPWEgaW5zdGFuY2VvZiBDPzA8YS5sOiEhYTticmVhaztjYXNlIDQ6Y2FzZSA1OmNhc2UgNjpjYXNlIDc6dmFyIGQ9XG5IKGEpO2M9W107Zm9yKHZhciBlPUkoZCk7ZTtlPUkoZCkpYy5wdXNoKGUgaW5zdGFuY2VvZiB4P2UuYTplKTt0aGlzLnNuYXBzaG90TGVuZ3RoPWEubDt0aGlzLmludmFsaWRJdGVyYXRvclN0YXRlPSExO2JyZWFrO2Nhc2UgODpjYXNlIDk6ZD1SYShhKTt0aGlzLnNpbmdsZU5vZGVWYWx1ZT1kIGluc3RhbmNlb2YgeD9kLmE6ZDticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiVW5rbm93biBYUGF0aFJlc3VsdCB0eXBlLlwiKTt9dmFyIGY9MDt0aGlzLml0ZXJhdGVOZXh0PWZ1bmN0aW9uKCl7aWYoNCE9YiYmNSE9Yil0aHJvdyBFcnJvcihcIml0ZXJhdGVOZXh0IGNhbGxlZCB3aXRoIHdyb25nIHJlc3VsdCB0eXBlXCIpO3JldHVybiBmPj1jLmxlbmd0aD9udWxsOmNbZisrXX07dGhpcy5zbmFwc2hvdEl0ZW09ZnVuY3Rpb24oYSl7aWYoNiE9YiYmNyE9Yil0aHJvdyBFcnJvcihcInNuYXBzaG90SXRlbSBjYWxsZWQgd2l0aCB3cm9uZyByZXN1bHQgdHlwZVwiKTtyZXR1cm4gYT49Yy5sZW5ndGh8fFxuMD5hP251bGw6Y1thXX19WS5BTllfVFlQRT0wO1kuTlVNQkVSX1RZUEU9MTtZLlNUUklOR19UWVBFPTI7WS5CT09MRUFOX1RZUEU9MztZLlVOT1JERVJFRF9OT0RFX0lURVJBVE9SX1RZUEU9NDtZLk9SREVSRURfTk9ERV9JVEVSQVRPUl9UWVBFPTU7WS5VTk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFPTY7WS5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRT03O1kuQU5ZX1VOT1JERVJFRF9OT0RFX1RZUEU9ODtZLkZJUlNUX09SREVSRURfTk9ERV9UWVBFPTk7ZnVuY3Rpb24gT2IoYSl7dGhpcy5sb29rdXBOYW1lc3BhY2VVUkk9S2IoYSl9XG5mdW5jdGlvbiBQYihhLGIpe3ZhciBjPWF8fGssZD1jLkRvY3VtZW50JiZjLkRvY3VtZW50LnByb3RvdHlwZXx8Yy5kb2N1bWVudDtpZighZC5ldmFsdWF0ZXx8YiljLlhQYXRoUmVzdWx0PVksZC5ldmFsdWF0ZT1mdW5jdGlvbihhLGIsYyxkKXtyZXR1cm4obmV3IE5iKGEsYykpLmV2YWx1YXRlKGIsZCl9LGQuY3JlYXRlRXhwcmVzc2lvbj1mdW5jdGlvbihhLGIpe3JldHVybiBuZXcgTmIoYSxiKX0sZC5jcmVhdGVOU1Jlc29sdmVyPWZ1bmN0aW9uKGEpe3JldHVybiBuZXcgT2IoYSl9fXZhciBRYj1bXCJ3Z3hwYXRoXCIsXCJpbnN0YWxsXCJdLFo9aztRYlswXWluIFp8fCFaLmV4ZWNTY3JpcHR8fFouZXhlY1NjcmlwdChcInZhciBcIitRYlswXSk7Zm9yKHZhciBSYjtRYi5sZW5ndGgmJihSYj1RYi5zaGlmdCgpKTspUWIubGVuZ3RofHx2b2lkIDA9PT1QYj9aW1JiXT9aPVpbUmJdOlo9WltSYl09e306WltSYl09UGI7bW9kdWxlLmV4cG9ydHMuaW5zdGFsbD1QYjttb2R1bGUuZXhwb3J0cy5YUGF0aFJlc3VsdFR5cGU9e0FOWV9UWVBFOjAsTlVNQkVSX1RZUEU6MSxTVFJJTkdfVFlQRToyLEJPT0xFQU5fVFlQRTozLFVOT1JERVJFRF9OT0RFX0lURVJBVE9SX1RZUEU6NCxPUkRFUkVEX05PREVfSVRFUkFUT1JfVFlQRTo1LFVOT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEU6NixPUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRTo3LEFOWV9VTk9SREVSRURfTk9ERV9UWVBFOjgsRklSU1RfT1JERVJFRF9OT0RFX1RZUEU6OX07fSkuY2FsbChnbG9iYWwpXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBkb2NSZWFkeSA9IHJlcXVpcmUoJ2RvYy1yZWFkeScpO1xudmFyIENvbm5leGlvbiA9IHJlcXVpcmUoJy4vaHR0cC9Db25uZXhpb24nKTtcbi8qKlxuICogTWFpbiBCb290TG9hZGVyLlxuICovXG5cbnZhciBQeWRpb0Jvb3RzdHJhcCA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBzdGFydFBhcmFtZXRlcnMgT2JqZWN0IFRoZSBvcHRpb25zXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiBQeWRpb0Jvb3RzdHJhcChzdGFydFBhcmFtZXRlcnMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUHlkaW9Cb290c3RyYXApO1xuXG4gICAgICAgIHRoaXMucGFyYW1ldGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBzdGFydFBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgIGlmIChzdGFydFBhcmFtZXRlcnMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuc2V0KGksIHN0YXJ0UGFyYW1ldGVyc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kZXRlY3RCYXNlUGFyYW1ldGVycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiQUxFUlRcIikpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoX3RoaXMucGFyYW1ldGVycy5nZXQoXCJBTEVSVFwiKSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY1JlYWR5KChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBzdGFydGVkRnJvbU9wZW5lciA9IGZhbHNlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93Lm9wZW5lciAmJiB3aW5kb3cub3BlbmVyLnB5ZGlvQm9vdHN0cmFwICYmIHRoaXMucGFyYW1ldGVycy5nZXQoJ3NlcnZlckFjY2Vzc1BhdGgnKSA9PT0gd2luZG93Lm9wZW5lci5weWRpb0Jvb3RzdHJhcC5wYXJhbWV0ZXJzLmdldCgnc2VydmVyQWNjZXNzUGF0aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycyA9IHdpbmRvdy5vcGVuZXIucHlkaW9Cb290c3RyYXAucGFyYW1ldGVycztcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHF1ZXJ5U3RyaW5nIGNhc2UsIGFzIGl0J3Mgbm90IHBhc3NlZCB2aWEgZ2V0X2Jvb3RfY29uZlxuICAgICAgICAgICAgICAgICAgICB2YXIgcVBhcmFtcyA9IGRvY3VtZW50LmxvY2F0aW9uLmhyZWYudG9RdWVyeVBhcmFtcygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocVBhcmFtc1snZXh0ZXJuYWxfc2VsZWN0b3JfdHlwZSddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuc2V0KCdTRUxFQ1RPUl9EQVRBJywgeyB0eXBlOiBxUGFyYW1zWydleHRlcm5hbF9zZWxlY3Rvcl90eXBlJ10sIGRhdGE6IHFQYXJhbXMgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldCgnU0VMRUNUT1JfREFUQScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnVuc2V0KCdTRUxFQ1RPUl9EQVRBJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ29udGV4dFZhcmlhYmxlc0FuZEluaXQobmV3IENvbm5leGlvbigpKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRlZEZyb21PcGVuZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5sb2cpIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzdGFydGVkRnJvbU9wZW5lcikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEJvb3RDb25maWcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgd2luZG93LkNvbm5leGlvbiA9IENvbm5leGlvbjtcbiAgICAgICAgd2luZG93LnB5ZGlvQm9vdHN0cmFwID0gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFsIGxvYWRpbmcgYWN0aW9uXG4gICAgICovXG5cbiAgICBQeWRpb0Jvb3RzdHJhcC5wcm90b3R5cGUubG9hZEJvb3RDb25maWcgPSBmdW5jdGlvbiBsb2FkQm9vdENvbmZpZygpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoJ1BSRUxPQURFRF9CT09UX0NPTkYnKSkge1xuICAgICAgICAgICAgdmFyIHByZWxvYWRlZCA9IHRoaXMucGFyYW1ldGVycy5nZXQoJ1BSRUxPQURFRF9CT09UX0NPTkYnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gcHJlbG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByZWxvYWRlZC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuc2V0KGssIHByZWxvYWRlZFtrXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ29udGV4dFZhcmlhYmxlc0FuZEluaXQobmV3IENvbm5leGlvbigpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cmwgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KCdCT09URVJfVVJMJykgKyAodGhpcy5wYXJhbWV0ZXJzLmdldChcImRlYnVnTW9kZVwiKSA/ICcmZGVidWc9dHJ1ZScgOiAnJyk7XG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KCdTRVJWRVJfUFJFRklYX1VSSScpKSB7XG4gICAgICAgICAgICB1cmwgKz0gJyZzZXJ2ZXJfcHJlZml4X3VyaT0nICsgdGhpcy5wYXJhbWV0ZXJzLmdldCgnU0VSVkVSX1BSRUZJWF9VUkknKS5yZXBsYWNlKC9cXC5cXC5cXC8vZywgXCJfVVBfL1wiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29ubmV4aW9uID0gbmV3IENvbm5leGlvbih1cmwpO1xuICAgICAgICBjb25uZXhpb24ub25Db21wbGV0ZSA9IChmdW5jdGlvbiAodHJhbnNwb3J0KSB7XG4gICAgICAgICAgICBpZiAodHJhbnNwb3J0LnJlc3BvbnNlWE1MICYmIHRyYW5zcG9ydC5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQgJiYgdHJhbnNwb3J0LnJlc3BvbnNlWE1MLmRvY3VtZW50RWxlbWVudC5ub2RlTmFtZSA9PSBcInRyZWVcIikge1xuICAgICAgICAgICAgICAgIHZhciBhbGVydCA9IFhNTFV0aWxzLlhQYXRoU2VsZWN0U2luZ2xlTm9kZSh0cmFuc3BvcnQucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50LCBcIm1lc3NhZ2VcIik7XG4gICAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdFeGNlcHRpb24gY2F1Z2h0IGJ5IGFwcGxpY2F0aW9uIDogJyArIGFsZXJ0LmZpcnN0Q2hpbGQubm9kZVZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcGhwRXJyb3I7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0cmFuc3BvcnQucmVzcG9uc2VKU09OKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHRyYW5zcG9ydC5yZXNwb25zZUpTT047XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoISB0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHBocEVycm9yID0gJ0V4Y2VwdGlvbiB1bmNhdWdodCBieSBhcHBsaWNhdGlvbiA6ICcgKyB0cmFuc3BvcnQucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBocEVycm9yKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQud3JpdGUocGhwRXJyb3IpO1xuICAgICAgICAgICAgICAgIGlmIChwaHBFcnJvci5pbmRleE9mKCc8Yj5Ob3RpY2U8L2I+JykgPiAtMSB8fCBwaHBFcnJvci5pbmRleE9mKCc8Yj5TdHJpY3QgU3RhbmRhcmRzPC9iPicpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQaHAgZXJyb3JzIGRldGVjdGVkLCBpdCBzZWVtcyB0aGF0IE5vdGljZSBvciBTdHJpY3QgYXJlIGRldGVjdGVkLCB5b3UgbWF5IGNvbnNpZGVyIGNoYW5naW5nIHRoZSBQSFAgRXJyb3IgUmVwb3J0aW5nIGxldmVsIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGtleSkpIHRoaXMucGFyYW1ldGVycy5zZXQoa2V5LCBkYXRhW2tleV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hDb250ZXh0VmFyaWFibGVzQW5kSW5pdChjb25uZXhpb24pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICBjb25uZXhpb24uc2VuZEFzeW5jKCk7XG4gICAgfTtcblxuICAgIFB5ZGlvQm9vdHN0cmFwLnByb3RvdHlwZS5yZWZyZXNoQ29udGV4dFZhcmlhYmxlc0FuZEluaXQgPSBmdW5jdGlvbiByZWZyZXNoQ29udGV4dFZhcmlhYmxlc0FuZEluaXQoY29ubmV4aW9uKSB7XG5cbiAgICAgICAgQ29ubmV4aW9uLnVwZGF0ZVNlcnZlckFjY2Vzcyh0aGlzLnBhcmFtZXRlcnMpO1xuXG4gICAgICAgIHZhciBjc3NSZXMgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiY3NzUmVzb3VyY2VzXCIpO1xuICAgICAgICBpZiAoY3NzUmVzKSB7XG4gICAgICAgICAgICBjc3NSZXMubWFwKHRoaXMubG9hZENTU1Jlc291cmNlLmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoJ2FqeHBSZXNvdXJjZXNGb2xkZXInKSkge1xuICAgICAgICAgICAgY29ubmV4aW9uLl9saWJVcmwgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KCdhanhwUmVzb3VyY2VzRm9sZGVyJykgKyBcIi9idWlsZFwiO1xuICAgICAgICAgICAgd2luZG93LmFqeHBSZXNvdXJjZXNGb2xkZXIgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KCdhanhwUmVzb3VyY2VzRm9sZGVyJykgKyBcIi90aGVtZXMvXCIgKyB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwidGhlbWVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldCgnYWRkaXRpb25hbF9qc19yZXNvdXJjZScpKSB7XG4gICAgICAgICAgICBjb25uZXhpb24ubG9hZExpYnJhcnkodGhpcy5wYXJhbWV0ZXJzLmdldCgnYWRkaXRpb25hbF9qc19yZXNvdXJjZT92PScgKyB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFZlcnNpb25cIikpLCBudWxsLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdGhpcy5pbnNlcnRMb2FkZXJQcm9ncmVzcygpO1xuICAgICAgICB3aW5kb3cuTWVzc2FnZUhhc2ggPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiaTE4bk1lc3NhZ2VzXCIpO1xuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKE1lc3NhZ2VIYXNoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFsZXJ0KCdPb3VwcywgdGhpcyBzaG91bGQgbm90IGhhcHBlbiwgeW91ciBtZXNzYWdlIGZpbGUgaXMgZW1wdHkhJyk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIga2V5IGluIE1lc3NhZ2VIYXNoKSB7XG4gICAgICAgICAgICBNZXNzYWdlSGFzaFtrZXldID0gTWVzc2FnZUhhc2hba2V5XS5yZXBsYWNlKFwiXFxcXG5cIiwgXCJcXG5cIik7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LnppcEVuYWJsZWQgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiemlwRW5hYmxlZFwiKTtcbiAgICAgICAgd2luZG93Lm11bHRpcGxlRmlsZXNEb3dubG9hZEVuYWJsZWQgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwibXVsdGlwbGVGaWxlc0Rvd25sb2FkRW5hYmxlZFwiKTtcblxuICAgICAgICB2YXIgbWFzdGVyQ2xhc3NMb2FkZWQgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBuZXcgUHlkaW8odGhpcy5wYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIHdpbmRvdy5weWRpbyA9IHB5ZGlvO1xuXG4gICAgICAgICAgICBweWRpby5vYnNlcnZlKFwiYWN0aW9uc19sb2FkZWRcIiwgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGFyYW1ldGVycy5nZXQoXCJTRUxFQ1RPUl9EQVRBXCIpICYmIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5hY3Rpb25zLmdldChcImV4dF9zZWxlY3RcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHB5ZGlvLmdldENvbnRyb2xsZXIoKS5hY3Rpb25zLl9vYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5hY3Rpb25zLnVuc2V0KFwiZXh0X3NlbGVjdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5hY3Rpb25zWydkZWxldGUnXShcImV4dF9zZWxlY3RcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmZpcmVDb250ZXh0Q2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5maXJlU2VsZWN0aW9uQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiU0VMRUNUT1JfREFUQVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuZGVmYXVsdEFjdGlvbnMuc2V0KFwiZmlsZVwiLCBcImV4dF9zZWxlY3RcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHB5ZGlvLm9ic2VydmUoXCJsb2FkZWRcIiwgKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoXCJTRUxFQ1RPUl9EQVRBXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5kZWZhdWx0QWN0aW9ucy5zZXQoXCJmaWxlXCIsIFwiZXh0X3NlbGVjdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLnNlbGVjdG9yRGF0YSA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJTRUxFQ1RPUl9EQVRBXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldChcImN1cnJlbnRMYW5ndWFnZVwiKSkge1xuICAgICAgICAgICAgICAgIHB5ZGlvLmN1cnJlbnRMYW5ndWFnZSA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJjdXJyZW50TGFuZ3VhZ2VcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHB5ZGlvLmluaXQoKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldChcImRlYnVnTW9kZVwiKSkge1xuICAgICAgICAgICAgbWFzdGVyQ2xhc3NMb2FkZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbm5leGlvbi5sb2FkTGlicmFyeShcInB5ZGlvLm1pbi5qcz92PVwiICsgdGhpcy5wYXJhbWV0ZXJzLmdldChcImFqeHBWZXJzaW9uXCIpLCBtYXN0ZXJDbGFzc0xvYWRlZCwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ3Bvc2l0aW9uOmFic29sdXRlOyBib3R0b206IDA7IHJpZ2h0OiAwOyB6LWluZGV4OiAyMDAwOyBjb2xvcjpyZ2JhKDAsMCwwLDAuNik7IGZvbnQtc2l6ZTogMTJweDsgcGFkZGluZzogMCAxMHB4OycpO1xuICAgICAgICBkaXYuaW5uZXJIVE1MID0gJ1B5ZGlvIENvbW11bml0eSBFZGl0aW9uIC0gQ29weXJpZ2h0IEFic3RyaXVtIDIwMTcgLSBMZWFybiBtb3JlIG9uIDxhIGhyZWY9XCJodHRwczovL3B5ZGlvLmNvbVwiIHRhcmdldD1cIl9ibGFua1wiPnB5ZGlvLmNvbTwvYT4nO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgICovXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCB0aGUgYmFzZSBwYXRoIG9mIHRoZSBqYXZhc2NyaXB0cyBiYXNlZCBvbiB0aGUgc2NyaXB0IHRhZ3NcbiAgICAgKi9cblxuICAgIFB5ZGlvQm9vdHN0cmFwLnByb3RvdHlwZS5kZXRlY3RCYXNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uIGRldGVjdEJhc2VQYXJhbWV0ZXJzKCkge1xuXG4gICAgICAgIHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNjcmlwdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzY3JpcHRUYWcgPSBzY3JpcHRzW2ldO1xuICAgICAgICAgICAgaWYgKHNjcmlwdFRhZy5zcmMubWF0Y2goXCIvYnVpbGQvcHlkaW8uYm9vdC5taW4uanNcIikgfHwgc2NyaXB0VGFnLnNyYy5tYXRjaChcIi9idWlsZC9ib290LnByb2QuanNcIikpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NyaXB0VGFnLnNyYy5tYXRjaChcIi9idWlsZC9weWRpby5ib290Lm1pbi5qc1wiKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuc2V0KFwiZGVidWdNb2RlXCIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuc2V0KFwiZGVidWdNb2RlXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgc3JjID0gc2NyaXB0VGFnLnNyYy5yZXBsYWNlKCcvYnVpbGQvYm9vdC5wcm9kLmpzJywgJycpLnJlcGxhY2UoJy9idWlsZC9weWRpby5ib290Lm1pbi5qcycsICcnKTtcbiAgICAgICAgICAgICAgICBpZiAoc3JjLmluZGV4T2YoXCI/XCIpICE9IC0xKSBzcmMgPSBzcmMuc3BsaXQoXCI/XCIpWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycy5zZXQoXCJhanhwUmVzb3VyY2VzRm9sZGVyXCIsIHNyYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoXCJhanhwUmVzb3VyY2VzRm9sZGVyXCIpKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWp4cFJlc291cmNlc0ZvbGRlciA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJhanhwUmVzb3VyY2VzRm9sZGVyXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoXCJDYW5ub3QgZmluZCByZXNvdXJjZSBmb2xkZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvb3RlclVybCA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJCT09URVJfVVJMXCIpO1xuICAgICAgICBpZiAoYm9vdGVyVXJsLmluZGV4T2YoXCI/XCIpID4gLTEpIHtcbiAgICAgICAgICAgIGJvb3RlclVybCA9IGJvb3RlclVybC5zdWJzdHJpbmcoMCwgYm9vdGVyVXJsLmluZGV4T2YoXCI/XCIpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhcmFtZXRlcnMuc2V0KCdhanhwU2VydmVyQWNjZXNzUGF0aCcsIGJvb3RlclVybCk7XG4gICAgICAgIHRoaXMucGFyYW1ldGVycy5zZXQoJ3NlcnZlckFjY2Vzc1BhdGgnLCBib290ZXJVcmwpO1xuICAgICAgICB3aW5kb3cuYWp4cFNlcnZlckFjY2Vzc1BhdGggPSBib290ZXJVcmw7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExvYWRzIGEgQ1NTIGZpbGVcbiAgICAgKiBAcGFyYW0gZmlsZU5hbWUgU3RyaW5nXG4gICAgICovXG5cbiAgICBQeWRpb0Jvb3RzdHJhcC5wcm90b3R5cGUubG9hZENTU1Jlc291cmNlID0gZnVuY3Rpb24gbG9hZENTU1Jlc291cmNlKGZpbGVOYW1lKSB7XG4gICAgICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgdmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICAgIGNzc05vZGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgICAgIGNzc05vZGUucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgICAgICBjc3NOb2RlLmhyZWYgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFJlc291cmNlc0ZvbGRlclwiKSArICcvJyArIGZpbGVOYW1lO1xuICAgICAgICBjc3NOb2RlLm1lZGlhID0gJ3NjcmVlbic7XG4gICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRyeSB0byBsb2FkIHNvbWV0aGluZyB1bmRlciBkYXRhL2NhY2hlL1xuICAgICAqIEBwYXJhbSBvbkVycm9yIEZ1bmN0aW9uXG4gICAgICovXG5cbiAgICBQeWRpb0Jvb3RzdHJhcC50ZXN0RGF0YUZvbGRlckFjY2VzcyA9IGZ1bmN0aW9uIHRlc3REYXRhRm9sZGVyQWNjZXNzKG9uRXJyb3IpIHtcbiAgICAgICAgdmFyIGMgPSBuZXcgQ29ubmV4aW9uKCdkYXRhL2NhY2hlL2luZGV4Lmh0bWwnKTtcbiAgICAgICAgYy5zZXRNZXRob2QoJ2dldCcpO1xuICAgICAgICBjLm9uQ29tcGxldGUgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmICgyMDAgPT09IHJlc3BvbnNlLnN0YXR1cykge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgYy5zZW5kQXN5bmMoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFB5ZGlvQm9vdHN0cmFwO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHlkaW9Cb290c3RyYXA7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3V0aWxYTUxVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWwvWE1MVXRpbHMnKTtcblxudmFyIF91dGlsWE1MVXRpbHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXRpbFhNTFV0aWxzKTtcblxuLyoqXG4gKiBQeWRpbyBlbmNhcHN1bGF0aW9uIG9mIFhIUiAvIEZldGNoXG4gKi9cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xuXG52YXIgQ29ubmV4aW9uID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGJhc2VVcmwgU3RyaW5nIFRoZSBiYXNlIHVybCBmb3Igc2VydmljZXNcbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIENvbm5leGlvbihiYXNlVXJsKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb25uZXhpb24pO1xuXG4gICAgICAgIHRoaXMuX3B5ZGlvID0gd2luZG93LnB5ZGlvO1xuICAgICAgICB0aGlzLl9iYXNlVXJsID0gYmFzZVVybCB8fCB3aW5kb3cuYWp4cFNlcnZlckFjY2Vzc1BhdGg7XG4gICAgICAgIHRoaXMuX2xpYlVybCA9IHdpbmRvdy5hanhwUmVzb3VyY2VzRm9sZGVyICsgJy9idWlsZCc7XG4gICAgICAgIHRoaXMuX3BhcmFtZXRlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX21ldGhvZCA9ICdwb3N0JztcbiAgICAgICAgdGhpcy5kaXNjcmV0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIENvbm5leGlvbi51cGRhdGVTZXJ2ZXJBY2Nlc3MgPSBmdW5jdGlvbiB1cGRhdGVTZXJ2ZXJBY2Nlc3MocGFyYW1ldGVycykge1xuXG4gICAgICAgIGlmIChwYXJhbWV0ZXJzLmdldCgnU0VDVVJFX1RPS0VOJykpIHtcbiAgICAgICAgICAgIENvbm5leGlvbi5TRUNVUkVfVE9LRU4gPSBwYXJhbWV0ZXJzLmdldCgnU0VDVVJFX1RPS0VOJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlcnZlckFjY2Vzc1BhdGggPSBwYXJhbWV0ZXJzLmdldCgnYWp4cFNlcnZlckFjY2VzcycpLnNwbGl0KCc/Jykuc2hpZnQoKTtcbiAgICAgICAgaWYgKHBhcmFtZXRlcnMuZ2V0KCdTRVJWRVJfUFJFRklYX1VSSScpKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnNldCgnYWp4cFJlc291cmNlc0ZvbGRlcicsIHBhcmFtZXRlcnMuZ2V0KCdTRVJWRVJfUFJFRklYX1VSSScpICsgcGFyYW1ldGVycy5nZXQoJ2FqeHBSZXNvdXJjZXNGb2xkZXInKSk7XG4gICAgICAgICAgICBzZXJ2ZXJBY2Nlc3NQYXRoID0gcGFyYW1ldGVycy5nZXQoJ1NFUlZFUl9QUkVGSVhfVVJJJykgKyBzZXJ2ZXJBY2Nlc3NQYXRoICsgJz8nICsgKENvbm5leGlvbi5TRUNVUkVfVE9LRU4gPyAnc2VjdXJlX3Rva2VuPScgKyBDb25uZXhpb24uU0VDVVJFX1RPS0VOIDogJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VydmVyQWNjZXNzUGF0aCA9IHNlcnZlckFjY2Vzc1BhdGggKyAnPycgKyAoQ29ubmV4aW9uLlNFQ1VSRV9UT0tFTiA/ICdzZWN1cmVfdG9rZW49JyArIENvbm5leGlvbi5TRUNVUkVfVE9LRU4gOiAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmFtZXRlcnMuZ2V0KCdTRVJWRVJfUEVSTUFORU5UX1BBUkFNUycpKSB7XG4gICAgICAgICAgICB2YXIgcGVybVBhcmFtcyA9IHBhcmFtZXRlcnMuZ2V0KCdTRVJWRVJfUEVSTUFORU5UX1BBUkFNUycpO1xuICAgICAgICAgICAgdmFyIHBlcm1TdHJpbmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBwZXJtYW5lbnQgaW4gcGVybVBhcmFtcykge1xuICAgICAgICAgICAgICAgIGlmIChwZXJtUGFyYW1zLmhhc093blByb3BlcnR5KHBlcm1hbmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGVybVN0cmluZ3MucHVzaChwZXJtYW5lbnQgKyAnPScgKyBwZXJtUGFyYW1zW3Blcm1hbmVudF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlcm1TdHJpbmdzID0gcGVybVN0cmluZ3Muam9pbignJicpO1xuICAgICAgICAgICAgaWYgKHBlcm1TdHJpbmdzKSB7XG4gICAgICAgICAgICAgICAgc2VydmVyQWNjZXNzUGF0aCArPSAnJicgKyBwZXJtU3RyaW5ncztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmFtZXRlcnMuc2V0KCdhanhwU2VydmVyQWNjZXNzJywgc2VydmVyQWNjZXNzUGF0aCk7XG4gICAgICAgIC8vIEJBQ0tXQVJEIENPTVBBVFxuICAgICAgICB3aW5kb3cuYWp4cFNlcnZlckFjY2Vzc1BhdGggPSBzZXJ2ZXJBY2Nlc3NQYXRoO1xuICAgICAgICBpZiAod2luZG93LnB5ZGlvQm9vdHN0cmFwICYmIHdpbmRvdy5weWRpb0Jvb3RzdHJhcC5wYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICBweWRpb0Jvb3RzdHJhcC5wYXJhbWV0ZXJzLnNldChcImFqeHBTZXJ2ZXJBY2Nlc3NcIiwgc2VydmVyQWNjZXNzUGF0aCk7XG4gICAgICAgICAgICBweWRpb0Jvb3RzdHJhcC5wYXJhbWV0ZXJzLnNldChcIlNFQ1VSRV9UT0tFTlwiLCBDb25uZXhpb24uU0VDVVJFX1RPS0VOKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb25uZXhpb24ubG9nID0gZnVuY3Rpb24gbG9nKGFjdGlvbiwgc3luY1N0YXR1cykge1xuICAgICAgICBpZiAoIUNvbm5leGlvbi5QeWRpb0xvZ3MpIHtcbiAgICAgICAgICAgIENvbm5leGlvbi5QeWRpb0xvZ3MgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBDb25uZXhpb24uUHlkaW9Mb2dzLnB1c2goeyBhY3Rpb246IGFjdGlvbiwgc3luYzogc3luY1N0YXR1cyB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIGEgcGFyYW1ldGVyIHRvIHRoZSBxdWVyeVxuICAgICAqIEBwYXJhbSBwYXJhbU5hbWUgU3RyaW5nXG4gICAgICogQHBhcmFtIHBhcmFtVmFsdWUgU3RyaW5nXG4gICAgICovXG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLmFkZFBhcmFtZXRlciA9IGZ1bmN0aW9uIGFkZFBhcmFtZXRlcihwYXJhbU5hbWUsIHBhcmFtVmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BhcmFtZXRlcnMuZ2V0KHBhcmFtTmFtZSkgJiYgcGFyYW1OYW1lLmVuZHNXaXRoKCdbXScpKSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RpbmcgPSB0aGlzLl9wYXJhbWV0ZXJzLmdldChwYXJhbU5hbWUpO1xuICAgICAgICAgICAgaWYgKCFleGlzdGluZyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgZXhpc3RpbmcgPSBbZXhpc3RpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhpc3RpbmcucHVzaChwYXJhbVZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuX3BhcmFtZXRlcnMuc2V0KHBhcmFtTmFtZSwgZXhpc3RpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcGFyYW1ldGVycy5zZXQocGFyYW1OYW1lLCBwYXJhbVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB3aG9sZSBwYXJhbWV0ZXIgYXMgYSBidW5jaFxuICAgICAqIEBwYXJhbSBoUGFyYW1ldGVycyBNYXBcbiAgICAgKi9cblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2V0UGFyYW1ldGVycyA9IGZ1bmN0aW9uIHNldFBhcmFtZXRlcnMoaFBhcmFtZXRlcnMpIHtcbiAgICAgICAgaWYgKGhQYXJhbWV0ZXJzIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzID0gaFBhcmFtZXRlcnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaFBhcmFtZXRlcnMuX29iamVjdCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Bhc3NlZCBhIGxlZ2FjeSBIYXNoIG9iamVjdCB0byBDb25uZXhpb24uc2V0UGFyYW1ldGVycycpO1xuICAgICAgICAgICAgICAgIGhQYXJhbWV0ZXJzID0gaFBhcmFtZXRlcnMuX29iamVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBoUGFyYW1ldGVycykge1xuICAgICAgICAgICAgICAgIGlmIChoUGFyYW1ldGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtZXRlcnMuc2V0KGtleSwgaFBhcmFtZXRlcnNba2V5XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgcXVlcnkgbWV0aG9kIChnZXQgcG9zdClcbiAgICAgKiBAcGFyYW0gbWV0aG9kIFN0cmluZ1xuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5zZXRNZXRob2QgPSBmdW5jdGlvbiBzZXRNZXRob2QobWV0aG9kKSB7XG4gICAgICAgIHRoaXMuX21ldGhvZCA9IG1ldGhvZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIHRoZSBzZWN1cmUgdG9rZW4gcGFyYW1ldGVyXG4gICAgICovXG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLmFkZFNlY3VyZVRva2VuID0gZnVuY3Rpb24gYWRkU2VjdXJlVG9rZW4oKSB7XG5cbiAgICAgICAgaWYgKENvbm5leGlvbi5TRUNVUkVfVE9LRU4gJiYgdGhpcy5fYmFzZVVybC5pbmRleE9mKCdzZWN1cmVfdG9rZW4nKSA9PSAtMSAmJiAhdGhpcy5fcGFyYW1ldGVycy5nZXQoJ3NlY3VyZV90b2tlbicpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkUGFyYW1ldGVyKCdzZWN1cmVfdG9rZW4nLCBDb25uZXhpb24uU0VDVVJFX1RPS0VOKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYXNlVXJsLmluZGV4T2YoJ3NlY3VyZV90b2tlbj0nKSAhPT0gLTEpIHtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGZyb20gYmFzZVVybCBhbmQgc2V0IGluc2lkZSBwYXJhbXNcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IHRoaXMuX2Jhc2VVcmwuc3BsaXQoJ3NlY3VyZV90b2tlbj0nKTtcbiAgICAgICAgICAgIHZhciB0b2tzID0gcGFydHNbMV0uc3BsaXQoJyYnKTtcbiAgICAgICAgICAgIHZhciB0b2tlbiA9IHRva3Muc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciByZXN0ID0gdG9rcy5qb2luKCcmJyk7XG4gICAgICAgICAgICB0aGlzLl9iYXNlVXJsID0gcGFydHNbMF0gKyAocmVzdCA/ICcmJyArIHJlc3QgOiAnJyk7XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzLnNldCgnc2VjdXJlX3Rva2VuJywgdG9rZW4pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuYWRkU2VydmVyUGVybWFuZW50UGFyYW1zID0gZnVuY3Rpb24gYWRkU2VydmVyUGVybWFuZW50UGFyYW1zKCkge1xuICAgICAgICBpZiAoIXRoaXMuX3B5ZGlvIHx8ICF0aGlzLl9weWRpby5QYXJhbWV0ZXJzLmhhcygnU0VSVkVSX1BFUk1BTkVOVF9QQVJBTVMnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwZXJtUGFyYW1zID0gdGhpcy5fcHlkaW8uUGFyYW1ldGVycy5nZXQoJ1NFUlZFUl9QRVJNQU5FTlRfUEFSQU1TJyk7XG4gICAgICAgIGZvciAodmFyIHBlcm1hbmVudCBpbiBwZXJtUGFyYW1zKSB7XG4gICAgICAgICAgICBpZiAocGVybVBhcmFtcy5oYXNPd25Qcm9wZXJ0eShwZXJtYW5lbnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRQYXJhbWV0ZXIocGVybWFuZW50LCBwZXJtUGFyYW1zW3Blcm1hbmVudF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNob3cgYSBzbWFsbCBsb2FkZXJcbiAgICAgKi9cblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2hvd0xvYWRlciA9IGZ1bmN0aW9uIHNob3dMb2FkZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2NyZXRlIHx8ICF0aGlzLl9weWRpbykgcmV0dXJuO1xuICAgICAgICB0aGlzLl9weWRpby5ub3RpZnkoXCJjb25uZWN0aW9uLXN0YXJ0XCIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGEgc21hbGwgbG9hZGVyXG4gICAgICovXG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLmhpZGVMb2FkZXIgPSBmdW5jdGlvbiBoaWRlTG9hZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5kaXNjcmV0ZSB8fCAhdGhpcy5fcHlkaW8pIHJldHVybjtcbiAgICAgICAgdGhpcy5fcHlkaW8ubm90aWZ5KFwiY29ubmVjdGlvbi1lbmRcIik7XG4gICAgfTtcblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbiBfc2VuZCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgYVN5bmMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICAgIHRoaXMuYWRkU2VjdXJlVG9rZW4oKTtcbiAgICAgICAgdGhpcy5hZGRTZXJ2ZXJQZXJtYW5lbnRQYXJhbXMoKTtcbiAgICAgICAgdGhpcy5zaG93TG9hZGVyKCk7XG4gICAgICAgIHZhciBvVGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiB0aGlzLl9tZXRob2QsXG4gICAgICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJ1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdXJsID0gdGhpcy5fYmFzZVVybDtcbiAgICAgICAgaWYgKCFhU3luYykge1xuICAgICAgICAgICAgb3B0aW9ucy5zeW5jaHJvbm91cyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHlQYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdmFsdWUubWFwKGZ1bmN0aW9uIChvbmVWKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvZHlQYXJ0cy5wdXNoKGtleSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvbmVWKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJvZHlQYXJ0cy5wdXNoKGtleSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gYm9keVBhcnRzLmpvaW4oJyYnKTtcbiAgICAgICAgaWYgKHRoaXMuX21ldGhvZCA9PT0gJ3Bvc3QnKSB7XG4gICAgICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSB7IFwiQ29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04XCIgfTtcbiAgICAgICAgICAgIG9wdGlvbnMuYm9keSA9IHF1ZXJ5U3RyaW5nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID4gLTEgPyAnJicgOiAnPycpICsgcXVlcnlTdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICAgICAgdmFyIGggPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC10eXBlJyk7XG4gICAgICAgICAgICBpZiAoaC5pbmRleE9mKCcvanNvbicpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24oKS50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIG9UaGlzLmFwcGx5Q29tcGxldGUoeyByZXNwb25zZUpTT046IGpzb24gfSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoLmluZGV4T2YoJy94bWwnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBvVGhpcy5hcHBseUNvbXBsZXRlKHsgcmVzcG9uc2VYTUw6IF91dGlsWE1MVXRpbHMyWydkZWZhdWx0J10ucGFyc2VYbWwodGV4dCkgfSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBvVGhpcy5hcHBseUNvbXBsZXRlKHsgcmVzcG9uc2VUZXh0OiB0ZXh0IH0sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMuX3B5ZGlvKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3B5ZGlvLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsICdOZXR3b3JrIGVycm9yICcgKyBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNlbmQgQXN5bmNocm9ub3VzbHlcbiAgICAgKi9cblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2VuZEFzeW5jID0gZnVuY3Rpb24gc2VuZEFzeW5jKCkge1xuICAgICAgICB0aGlzLl9zZW5kKHRydWUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIHN5bmNocm9ub3VzbHlcbiAgICAgKi9cblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2VuZFN5bmMgPSBmdW5jdGlvbiBzZW5kU3luYygpIHtcbiAgICAgICAgdGhpcy5fc2VuZChmYWxzZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFwcGx5IHRoZSBjb21wbGV0ZSBjYWxsYmFjaywgdHJ5IHRvIGdyYWIgbWF4aW11bSBvZiBlcnJvcnNcbiAgICAgKiBAcGFyYW0gcGFyc2VkQm9keSBUcmFuc3BvdFxuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5hcHBseUNvbXBsZXRlID0gZnVuY3Rpb24gYXBwbHlDb21wbGV0ZShwYXJzZWRCb2R5LCByZXNwb25zZSkge1xuICAgICAgICB0aGlzLmhpZGVMb2FkZXIoKTtcbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5fcHlkaW87XG4gICAgICAgIHZhciBtZXNzYWdlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgdG9rZW5NZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgdG9rMSA9IFwiT29vcHMsIGl0IHNlZW1zIHRoYXQgeW91ciBzZWN1cml0eSB0b2tlbiBoYXMgZXhwaXJlZCEgUGxlYXNlICVzIGJ5IGhpdHRpbmcgcmVmcmVzaCBvciBGNSBpbiB5b3VyIGJyb3dzZXIhXCI7XG4gICAgICAgIHZhciB0b2syID0gXCJyZWxvYWQgdGhlIHBhZ2VcIjtcbiAgICAgICAgaWYgKHdpbmRvdy5NZXNzYWdlSGFzaCAmJiB3aW5kb3cuTWVzc2FnZUhhc2hbNDM3XSkge1xuICAgICAgICAgICAgdG9rMSA9IHdpbmRvdy5NZXNzYWdlSGFzaFs0MzddO1xuICAgICAgICAgICAgdG9rMiA9IHdpbmRvdy5NZXNzYWdlSGFzaFs0MzhdO1xuICAgICAgICB9XG4gICAgICAgIHRva2VuTWVzc2FnZSA9IHRvazEucmVwbGFjZShcIiVzXCIsIFwiPGEgaHJlZj0namF2YXNjcmlwdDpkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKScgc3R5bGU9J3RleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyc+XCIgKyB0b2syICsgXCI8L2E+XCIpO1xuXG4gICAgICAgIHZhciBjdHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LXR5cGUnKTtcbiAgICAgICAgaWYgKHBhcnNlZEJvZHkucmVzcG9uc2VYTUwgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQubm9kZU5hbWUgPT0gXCJwYXJzZXJlcnJvclwiKSB7XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlBhcnNpbmcgZXJyb3IgOiBcXG5cIiArIHBhcnNlZEJvZHkucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50LmZpcnN0Q2hpbGQudGV4dENvbnRlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAocGFyc2VkQm9keS5yZXNwb25zZVhNTCAmJiBwYXJzZWRCb2R5LnJlc3BvbnNlWE1MLnBhcnNlRXJyb3IgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5wYXJzZUVycm9yLmVycm9yQ29kZSAhPSAwKSB7XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlBhcnNpbmcgRXJyb3IgOiBcXG5cIiArIHBhcnNlZEJvZHkucmVzcG9uc2VYTUwucGFyc2VFcnJvci5yZWFzb247XG4gICAgICAgIH0gZWxzZSBpZiAoY3R5cGUuaW5kZXhPZihcInRleHQveG1sXCIpID4gLTEgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTCA9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkV4cGVjdGVkIFhNTCBidXQgZ290IGVtcHR5IHJlc3BvbnNlIVwiO1xuICAgICAgICB9IGVsc2UgaWYgKGN0eXBlLmluZGV4T2YoXCJ0ZXh0L3htbFwiKSA9PSAtMSAmJiBjdHlwZS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSA9PSAtMSAmJiBwYXJzZWRCb2R5LnJlc3BvbnNlVGV4dC5pbmRleE9mKFwiPGI+RmF0YWwgZXJyb3I8L2I+XCIpID4gLTEpIHtcblxuICAgICAgICAgICAgbWVzc2FnZSA9IHBhcnNlZEJvZHkucmVzcG9uc2VUZXh0LnJlcGxhY2UoXCI8YnIgLz5cIiwgXCJcIik7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzID09IDUwMCkge1xuXG4gICAgICAgICAgICBtZXNzYWdlID0gXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3I6IHlvdSBzaG91bGQgY2hlY2sgeW91ciB3ZWIgc2VydmVyIGxvZ3MgdG8gZmluZCB3aGF0J3MgZ29pbmcgd3JvbmchXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2Uuc3RhcnRzV2l0aChcIllvdSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRoaXMgcmVzb3VyY2UuXCIpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHRva2VuTWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChweWRpbykge1xuICAgICAgICAgICAgICAgIHB5ZGlvLmRpc3BsYXlNZXNzYWdlKFwiRVJST1JcIiwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsZXJ0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJzZWRCb2R5LnJlc3BvbnNlWE1MICYmIHBhcnNlZEJvZHkucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBhdXRoTm9kZSA9IF91dGlsWE1MVXRpbHMyWydkZWZhdWx0J10uWFBhdGhTZWxlY3RTaW5nbGVOb2RlKHBhcnNlZEJvZHkucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50LCBcInJlcXVpcmVfYXV0aFwiKTtcbiAgICAgICAgICAgIGlmIChhdXRoTm9kZSAmJiBweWRpbykge1xuICAgICAgICAgICAgICAgIHZhciByb290ID0gcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLmdldFJvb3ROb2RlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLnNldENvbnRleHROb2RlKHJvb3QpO1xuICAgICAgICAgICAgICAgICAgICByb290LmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKCdsb2dvdXQnKTtcbiAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbignbG9naW4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VOb2RlID0gX3V0aWxYTUxVdGlsczJbJ2RlZmF1bHQnXS5YUGF0aFNlbGVjdFNpbmdsZU5vZGUocGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQsIFwibWVzc2FnZVwiKTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlTm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlVHlwZSA9IG1lc3NhZ2VOb2RlLmdldEF0dHJpYnV0ZShcInR5cGVcIikudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZUNvbnRlbnQgPSBfdXRpbFhNTFV0aWxzMlsnZGVmYXVsdCddLmdldERvbU5vZGVUZXh0KG1lc3NhZ2VOb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZUNvbnRlbnQuc3RhcnRzV2l0aChcIllvdSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRoaXMgcmVzb3VyY2UuXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb250ZW50ID0gdG9rZW5NZXNzYWdlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHlkaW8pIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZGlzcGxheU1lc3NhZ2UobWVzc2FnZVR5cGUsIG1lc3NhZ2VDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT0gXCJFUlJPUlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChtZXNzYWdlVHlwZSArIFwiOlwiICsgbWVzc2FnZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PSBcIlNVQ0NFU1NcIikgbWVzc2FnZU5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtZXNzYWdlTm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub25Db21wbGV0ZSkge1xuXG4gICAgICAgICAgICBwYXJzZWRCb2R5LnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgICAgICAgICAgIHBhcnNlZEJvZHkucmVzcG9uc2VPYmplY3QgPSByZXNwb25zZTtcbiAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZShwYXJzZWRCb2R5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHlkaW8pIHtcbiAgICAgICAgICAgIHB5ZGlvLmZpcmUoXCJzZXJ2ZXJfYW5zd2VyXCIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUudXBsb2FkRmlsZSA9IGZ1bmN0aW9uIHVwbG9hZEZpbGUoZmlsZSwgZmlsZVBhcmFtZXRlck5hbWUsIHVwbG9hZFVybCwgb25Db21wbGV0ZSwgb25FcnJvciwgb25Qcm9ncmVzcywgeGhyU2V0dGluZ3MpIHtcblxuICAgICAgICBpZiAoeGhyU2V0dGluZ3MgPT09IHVuZGVmaW5lZCkgeGhyU2V0dGluZ3MgPSB7fTtcblxuICAgICAgICBpZiAoIW9uQ29tcGxldGUpIG9uQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgaWYgKCFvbkVycm9yKSBvbkVycm9yID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIGlmICghb25Qcm9ncmVzcykgb25Qcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB2YXIgeGhyID0gdGhpcy5pbml0aWFsaXplWEhSRm9yVXBsb2FkKHVwbG9hZFVybCwgb25Db21wbGV0ZSwgb25FcnJvciwgb25Qcm9ncmVzcywgeGhyU2V0dGluZ3MpO1xuICAgICAgICBpZiAoeGhyU2V0dGluZ3MgJiYgeGhyU2V0dGluZ3MubWV0aG9kID09PSAnUFVUJykge1xuICAgICAgICAgICAgeGhyLnNlbmQoZmlsZSk7XG4gICAgICAgICAgICByZXR1cm4geGhyO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3aW5kb3cuRm9ybURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZEZpbGVVc2luZ0Zvcm1EYXRhKHhociwgZmlsZSwgZmlsZVBhcmFtZXRlck5hbWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5GaWxlUmVhZGVyKSB7XG4gICAgICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMueGhyU2VuZEFzQmluYXJ5KHhociwgZmlsZS5uYW1lLCBlLnRhcmdldC5yZXN1bHQsIGZpbGVQYXJhbWV0ZXJOYW1lKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWxlLmdldEFzQmluYXJ5KSB7XG4gICAgICAgICAgICB0aGlzLnhoclNlbmRBc0JpbmFyeSh4aHIsIGZpbGUubmFtZSwgZmlsZS5nZXRBc0JpbmFyeSgpLCBmaWxlUGFyYW1ldGVyTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHhocjtcbiAgICB9O1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5pbml0aWFsaXplWEhSRm9yVXBsb2FkID0gZnVuY3Rpb24gaW5pdGlhbGl6ZVhIUkZvclVwbG9hZCh1cmwsIG9uQ29tcGxldGUsIG9uRXJyb3IsIG9uUHJvZ3Jlc3MsIHhoclNldHRpbmdzKSB7XG5cbiAgICAgICAgaWYgKHhoclNldHRpbmdzID09PSB1bmRlZmluZWQpIHhoclNldHRpbmdzID0ge307XG5cbiAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICB2YXIgdXBsb2FkID0geGhyLnVwbG9hZDtcbiAgICAgICAgaWYgKHhoclNldHRpbmdzLndpdGhDcmVkZW50aWFscykge1xuICAgICAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXCJwcm9ncmVzc1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKCFlLmxlbmd0aENvbXB1dGFibGUpIHJldHVybjtcbiAgICAgICAgICAgIG9uUHJvZ3Jlc3MoZSk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSh4aHIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoeGhyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgIHVwbG9hZC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgb25FcnJvcih4aHIpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbWV0aG9kID0gJ1BPU1QnO1xuICAgICAgICBpZiAoeGhyU2V0dGluZ3MubWV0aG9kKSB7XG4gICAgICAgICAgICBtZXRob2QgPSB4aHJTZXR0aW5ncy5tZXRob2Q7XG4gICAgICAgIH1cbiAgICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuICAgICAgICBpZiAoeGhyU2V0dGluZ3MuY3VzdG9tSGVhZGVycykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoeGhyU2V0dGluZ3MuY3VzdG9tSGVhZGVycykuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGssIHhoclNldHRpbmdzLmN1c3RvbUhlYWRlcnNba10pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geGhyO1xuICAgIH07XG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLnNlbmRGaWxlVXNpbmdGb3JtRGF0YSA9IGZ1bmN0aW9uIHNlbmRGaWxlVXNpbmdGb3JtRGF0YSh4aHIsIGZpbGUsIGZpbGVQYXJhbWV0ZXJOYW1lKSB7XG4gICAgICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoZmlsZVBhcmFtZXRlck5hbWUsIGZpbGUpO1xuICAgICAgICB4aHIuc2VuZChmb3JtRGF0YSk7XG4gICAgfTtcblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUueGhyU2VuZEFzQmluYXJ5ID0gZnVuY3Rpb24geGhyU2VuZEFzQmluYXJ5KHhociwgZmlsZU5hbWUsIGZpbGVEYXRhLCBmaWxlUGFyYW1ldGVyTmFtZSkge1xuICAgICAgICB2YXIgYm91bmRhcnkgPSAnLS0tLU11bHRpUGFydEZvcm1Cb3VuZGFyeScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJtdWx0aXBhcnQvZm9ybS1kYXRhLCBib3VuZGFyeT1cIiArIGJvdW5kYXJ5KTtcblxuICAgICAgICB2YXIgYm9keSA9IFwiLS1cIiArIGJvdW5kYXJ5ICsgXCJcXHJcXG5cIjtcbiAgICAgICAgYm9keSArPSBcIkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0nXCIgKyBmaWxlUGFyYW1ldGVyTmFtZSArIFwiJzsgZmlsZW5hbWU9J1wiICsgdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGZpbGVOYW1lKSkgKyBcIidcXHJcXG5cIjtcbiAgICAgICAgYm9keSArPSBcIkNvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXFxyXFxuXFxyXFxuXCI7XG4gICAgICAgIGJvZHkgKz0gZmlsZURhdGEgKyBcIlxcclxcblwiO1xuICAgICAgICBib2R5ICs9IFwiLS1cIiArIGJvdW5kYXJ5ICsgXCItLVxcclxcblwiO1xuXG4gICAgICAgIHhoci5zZW5kQXNCaW5hcnkoYm9keSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExvYWQgYSBqYXZhc2NyaXB0IGxpYnJhcnlcbiAgICAgKiBAcGFyYW0gZmlsZU5hbWUgU3RyaW5nXG4gICAgICogQHBhcmFtIG9uTG9hZGVkQ29kZSBGdW5jdGlvbiBDYWxsYmFja1xuICAgICAgICAqIEBwYXJhbSBhU3luYyBCb29sZWFuIGxvYWQgbGlicmFyeSBhc3luY2hyb25lb3VzbHlcbiAgICAgKi9cblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUubG9hZExpYnJhcnkgPSBmdW5jdGlvbiBsb2FkTGlicmFyeShmaWxlTmFtZSwgb25Mb2FkZWRDb2RlLCBhU3luYykge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICBpZiAod2luZG93LnB5ZGlvQm9vdHN0cmFwICYmIHdpbmRvdy5weWRpb0Jvb3RzdHJhcC5wYXJhbWV0ZXJzLmdldChcImFqeHBWZXJzaW9uXCIpICYmIGZpbGVOYW1lLmluZGV4T2YoXCI/XCIpID09IC0xKSB7XG4gICAgICAgICAgICBmaWxlTmFtZSArPSBcIj92PVwiICsgd2luZG93LnB5ZGlvQm9vdHN0cmFwLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFZlcnNpb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHVybCA9IHRoaXMuX2xpYlVybCA/IHRoaXMuX2xpYlVybCArICcvJyArIGZpbGVOYW1lIDogZmlsZU5hbWU7XG4gICAgICAgIHZhciBweWRpbyA9IHRoaXMuX3B5ZGlvO1xuXG4gICAgICAgIHZhciBzY3JpcHRMb2FkZWQgPSBmdW5jdGlvbiBzY3JpcHRMb2FkZWQoc2NyaXB0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZXhlY1NjcmlwdCkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZXhlY1NjcmlwdChzY3JpcHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teV9jb2RlID0gc2NyaXB0O1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3JpcHRfdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdF90YWcudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHRfdGFnLmlubmVySFRNTCA9ICdldmFsKHdpbmRvdy5teV9jb2RlKSc7XG4gICAgICAgICAgICAgICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0X3RhZyk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cubXlfY29kZTtcbiAgICAgICAgICAgICAgICAgICAgaGVhZC5yZW1vdmVDaGlsZChzY3JpcHRfdGFnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9uTG9hZGVkQ29kZSAhPSBudWxsKSBvbkxvYWRlZENvZGUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnZXJyb3IgbG9hZGluZyAnICsgZmlsZU5hbWUgKyAnOicgKyBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGlmIChjb25zb2xlKSBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHB5ZGlvKSBweWRpby5maXJlKFwic2VydmVyX2Fuc3dlclwiKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYVN5bmMpIHtcbiAgICAgICAgICAgIHdpbmRvdy5mZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgICAgICAgICAgICBzY3JpcHRMb2FkZWQoc2NyaXB0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBTSE9VTEQgQkUgUkVNT1ZFRCEhXG4gICAgICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdExvYWRlZCh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ2Vycm9yIGxvYWRpbmcgJyArIGZpbGVOYW1lICsgJzogU3RhdHVzIGNvZGUgd2FzICcgKyB4aHIuc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMyKTtcbiAgICAgICAgICAgICAgICB4aHIub3BlbihcIkdFVFwiLCB1cmwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gQ29ubmV4aW9uO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29ubmV4aW9uO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20vPi5cbiAqXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF93aWNrZWRHb29kWHBhdGggPSByZXF1aXJlKCd3aWNrZWQtZ29vZC14cGF0aCcpO1xuXG52YXIgX3dpY2tlZEdvb2RYcGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93aWNrZWRHb29kWHBhdGgpO1xuXG5fd2lja2VkR29vZFhwYXRoMlsnZGVmYXVsdCddLmluc3RhbGwoKTtcbi8qKlxuICogVXRpbGl0YXJ5IGNsYXNzIGZvciBtYW5pcHVsYXRpbmcgWE1MXG4gKi9cblxudmFyIFhNTFV0aWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBYTUxVdGlscygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFhNTFV0aWxzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3RzIHRoZSBmaXJzdCBYbWxOb2RlIHRoYXQgbWF0Y2hlcyB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IHtFbGVtZW50IHwgRG9jdW1lbnR9IHJvb3QgZWxlbWVudCBmb3IgdGhlIHNlYXJjaFxuICAgICAqIEBwYXJhbSBxdWVyeSB7U3RyaW5nfSBYUGF0aCBxdWVyeVxuICAgICAqIEByZXR1cm4ge0VsZW1lbnR9IGZpcnN0IG1hdGNoaW5nIGVsZW1lbnRcbiAgICAgKiBAc2lnbmF0dXJlIGZ1bmN0aW9uKGVsZW1lbnQsIHF1ZXJ5KVxuICAgICAqL1xuXG4gICAgWE1MVXRpbHMuWFBhdGhTZWxlY3RTaW5nbGVOb2RlID0gZnVuY3Rpb24gWFBhdGhTZWxlY3RTaW5nbGVOb2RlKGVsZW1lbnQsIHF1ZXJ5KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFsnc2VsZWN0U2luZ2xlTm9kZSddICYmIHR5cGVvZiBlbGVtZW50LnNlbGVjdFNpbmdsZU5vZGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHZhciByZXMgPSBlbGVtZW50LnNlbGVjdFNpbmdsZU5vZGUocXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXMpIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgICAgaWYgKCFYTUxVdGlscy5fX3hwZSAmJiB3aW5kb3cuWFBhdGhFdmFsdWF0b3IpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgWE1MVXRpbHMuX194cGUgPSBuZXcgWFBhdGhFdmFsdWF0b3IoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIVhNTFV0aWxzLl9feHBlKSB7XG4gICAgICAgICAgICBxdWVyeSA9IGRvY3VtZW50LmNyZWF0ZUV4cHJlc3Npb24ocXVlcnksIG51bGwpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHF1ZXJ5LmV2YWx1YXRlKGVsZW1lbnQsIDcsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5zbmFwc2hvdExlbmd0aCA/IHJlc3VsdC5zbmFwc2hvdEl0ZW0oMCkgOiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHhwZSA9IFhNTFV0aWxzLl9feHBlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4geHBlLmV2YWx1YXRlKHF1ZXJ5LCBlbGVtZW50LCB4cGUuY3JlYXRlTlNSZXNvbHZlcihlbGVtZW50KSwgWFBhdGhSZXN1bHQuRklSU1RfT1JERVJFRF9OT0RFX1RZUEUsIG51bGwpLnNpbmdsZU5vZGVWYWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RTaW5nbGVOb2RlOiBxdWVyeTogXCIgKyBxdWVyeSArIFwiLCBlbGVtZW50OiBcIiArIGVsZW1lbnQgKyBcIiwgZXJyb3I6IFwiICsgZXJyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3RzIGEgbGlzdCBvZiBub2RlcyBtYXRjaGluZyB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IHtFbGVtZW50IHwgRG9jdW1lbnR9IHJvb3QgZWxlbWVudCBmb3IgdGhlIHNlYXJjaFxuICAgICAqIEBwYXJhbSBxdWVyeSB7U3RyaW5nfSBYUGF0aCBxdWVyeVxuICAgICAqIEByZXR1cm4ge0VsZW1lbnRbXX0gTGlzdCBvZiBtYXRjaGluZyBlbGVtZW50c1xuICAgICAqIEBzaWduYXR1cmUgZnVuY3Rpb24oZWxlbWVudCwgcXVlcnkpXG4gICAgICovXG5cbiAgICBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzID0gZnVuY3Rpb24gWFBhdGhTZWxlY3ROb2RlcyhlbGVtZW50LCBxdWVyeSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnNlbGVjdE5vZGVzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5vd25lckRvY3VtZW50ICYmIGVsZW1lbnQub3duZXJEb2N1bWVudC5zZXRQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vd25lckRvY3VtZW50LnNldFByb3BlcnR5KFwiU2VsZWN0aW9uTGFuZ3VhZ2VcIiwgXCJYUGF0aFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50LnNldFByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldFByb3BlcnR5KFwiU2VsZWN0aW9uTGFuZ3VhZ2VcIiwgXCJYUGF0aFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IEFycmF5LmZyb20oZWxlbWVudC5zZWxlY3ROb2RlcyhxdWVyeSkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXMpIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgICAgdmFyIHhwZSA9IFhNTFV0aWxzLl9feHBlO1xuXG4gICAgICAgIGlmICgheHBlICYmIHdpbmRvdy5YUGF0aEV2YWx1YXRvcikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBYTUxVdGlscy5fX3hwZSA9IHhwZSA9IG5ldyBYUGF0aEV2YWx1YXRvcigpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0LFxuICAgICAgICAgICAgbm9kZXMgPSBbXSxcbiAgICAgICAgICAgIGk7XG4gICAgICAgIGlmICghWE1MVXRpbHMuX194cGUpIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gZG9jdW1lbnQuY3JlYXRlRXhwcmVzc2lvbihxdWVyeSwgbnVsbCk7XG4gICAgICAgICAgICByZXN1bHQgPSBxdWVyeS5ldmFsdWF0ZShlbGVtZW50LCA3LCBudWxsKTtcbiAgICAgICAgICAgIG5vZGVzID0gW107XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzdWx0LnNuYXBzaG90TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoRWxlbWVudC5leHRlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0gPSBFbGVtZW50LmV4dGVuZChyZXN1bHQuc25hcHNob3RJdGVtKGkpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXSA9IHJlc3VsdC5zbmFwc2hvdEl0ZW0oaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHhwZS5ldmFsdWF0ZShxdWVyeSwgZWxlbWVudCwgeHBlLmNyZWF0ZU5TUmVzb2x2ZXIoZWxlbWVudCksIFhQYXRoUmVzdWx0Lk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFLCBudWxsKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3ROb2RlczogcXVlcnk6IFwiICsgcXVlcnkgKyBcIiwgZWxlbWVudDogXCIgKyBlbGVtZW50ICsgXCIsIGVycm9yOiBcIiArIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzdWx0LnNuYXBzaG90TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5vZGVzW2ldID0gcmVzdWx0LnNuYXBzaG90SXRlbShpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2VsZWN0cyB0aGUgZmlyc3QgWG1sTm9kZSB0aGF0IG1hdGNoZXMgdGhlIFhQYXRoIGV4cHJlc3Npb24gYW5kIHJldHVybnMgdGhlIHRleHQgY29udGVudCBvZiB0aGUgZWxlbWVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQge0VsZW1lbnR8RG9jdW1lbnR9IHJvb3QgZWxlbWVudCBmb3IgdGhlIHNlYXJjaFxuICAgICAqIEBwYXJhbSBxdWVyeSB7U3RyaW5nfSAgWFBhdGggcXVlcnlcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSBqb2luZWQgdGV4dCBjb250ZW50IG9mIHRoZSBmb3VuZCBlbGVtZW50IG9yIG51bGwgaWYgbm90IGFwcHJvcHJpYXRlLlxuICAgICAqIEBzaWduYXR1cmUgZnVuY3Rpb24oZWxlbWVudCwgcXVlcnkpXG4gICAgICovXG5cbiAgICBYTUxVdGlscy5YUGF0aEdldFNpbmdsZU5vZGVUZXh0ID0gZnVuY3Rpb24gWFBhdGhHZXRTaW5nbGVOb2RlVGV4dChlbGVtZW50LCBxdWVyeSkge1xuICAgICAgICB2YXIgbm9kZSA9IFhNTFV0aWxzLlhQYXRoU2VsZWN0U2luZ2xlTm9kZShlbGVtZW50LCBxdWVyeSk7XG4gICAgICAgIHJldHVybiBYTUxVdGlscy5nZXREb21Ob2RlVGV4dChub2RlKTtcbiAgICB9O1xuXG4gICAgWE1MVXRpbHMuZ2V0RG9tTm9kZVRleHQgPSBmdW5jdGlvbiBnZXREb21Ob2RlVGV4dChub2RlKSB7XG4gICAgICAgIHZhciBpbmNsdWRlQ0RhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgLy8gTk9ERV9FTEVNRU5UXG4gICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgIGEgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMgPSBub2RlLmNoaWxkTm9kZXMsXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IG5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYVtpXSA9IFhNTFV0aWxzLmdldERvbU5vZGVUZXh0KG5vZGVzW2ldLCBpbmNsdWRlQ0RhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBhLmpvaW4oXCJcIik7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAvLyBOT0RFX0FUVFJJQlVURVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgLy8gTk9ERV9URVhUXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZVZhbHVlO1xuXG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgLy8gQ0RBVEFcbiAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZUNEYXRhKSByZXR1cm4gbm9kZS5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHhtbFN0clxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuXG4gICAgWE1MVXRpbHMucGFyc2VYbWwgPSBmdW5jdGlvbiBwYXJzZVhtbCh4bWxTdHIpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5ET01QYXJzZXIgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB3aW5kb3cuRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHhtbFN0ciwgXCJ0ZXh0L3htbFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICE9IFwidW5kZWZpbmVkXCIgJiYgbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KFwiTVNYTUwyLkRPTURvY3VtZW50LjYuMFwiKSkge1xuICAgICAgICAgICAgdmFyIHhtbERvYyA9IG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdChcIk1TWE1MMi5ET01Eb2N1bWVudC42LjBcIik7XG4gICAgICAgICAgICB4bWxEb2MudmFsaWRhdGVPblBhcnNlID0gZmFsc2U7XG4gICAgICAgICAgICB4bWxEb2MuYXN5bmMgPSBmYWxzZTtcbiAgICAgICAgICAgIHhtbERvYy5sb2FkWE1MKHhtbFN0cik7XG4gICAgICAgICAgICB4bWxEb2Muc2V0UHJvcGVydHkoJ1NlbGVjdGlvbkxhbmd1YWdlJywgJ1hQYXRoJyk7XG4gICAgICAgICAgICByZXR1cm4geG1sRG9jO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHBhcnNlIFhNTCBzdHJpbmcnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFhNTFV0aWxzO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gWE1MVXRpbHM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiJdfQ==
