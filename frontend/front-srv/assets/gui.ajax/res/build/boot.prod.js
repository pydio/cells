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
        var _this2 = this;

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
        connexion.onComplete = function (transport) {
            var data = undefined;
            if (transport.responseJSON) {
                data = transport.responseJSON;
            }
            if (typeof data === "object") {
                Object.keys(data).forEach(function (key) {
                    _this2.parameters.set(key, data[key]);
                });
            }
            _this2.refreshContextVariablesAndInit(connexion);
        };
        connexion.send();
    };

    PydioBootstrap.prototype.refreshContextVariablesAndInit = function refreshContextVariablesAndInit(connexion) {

        //Connexion.updateServerAccess(this.parameters);

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
        Object.keys(MessageHash).forEach(function (key) {
            MessageHash[key] = MessageHash[key].replace("\\n", "\n");
        });
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
                if (src.indexOf("?") !== -1) {
                    src = src.split("?")[0];
                }
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

    return PydioBootstrap;
})();

exports['default'] = PydioBootstrap;
module.exports = exports['default'];

},{"./http/Connexion":6,"doc-ready":1}],6:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

    Connexion.log = function log(action, syncStatus) {
        if (!Connexion.PydioLogs) {
            Connexion.PydioLogs = [];
        }
        Connexion.PydioLogs.push({ action: action, sync: syncStatus });
    };

    /**
     * Set the query method (get post)
     * @param method String
     */

    Connexion.prototype.setMethod = function setMethod(method) {
        this._method = method;
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

    Connexion.prototype.send = function send() {
        var _this = this;

        this.showLoader();
        var oThis = this;
        var options = {
            method: this._method,
            credentials: 'same-origin'
        };
        var url = this._baseUrl;
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

    Connexion.prototype.uploadFile = function uploadFile(file, fileParameterName, uploadUrl) {
        var onComplete = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];
        var onError = arguments.length <= 4 || arguments[4] === undefined ? function () {} : arguments[4];

        var _this2 = this;

        var onProgress = arguments.length <= 5 || arguments[5] === undefined ? function () {} : arguments[5];
        var xhrSettings = arguments.length <= 6 || arguments[6] === undefined ? {} : arguments[6];

        var xhr = this.initializeXHRForUpload(uploadUrl, onComplete, onError, onProgress, xhrSettings);
        if (xhrSettings && xhrSettings.method === 'PUT') {
            xhr.send(file);
            return xhr;
        }
        if (window.FormData) {
            this.sendFileUsingFormData(xhr, file, fileParameterName);
        } else if (window.FileReader) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                _this2.xhrSendAsBinary(xhr, file.name, e.target.result, fileParameterName);
            };
            fileReader.readAsBinaryString(file);
        } else if (file.getAsBinary) {
            this.xhrSendAsBinary(xhr, file.name, file.getAsBinary(), fileParameterName);
        }
        return xhr;
    };

    Connexion.prototype.initializeXHRForUpload = function initializeXHRForUpload(url, onComplete, onError, onProgress) {
        var xhrSettings = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

        var xhr = new XMLHttpRequest();
        var upload = xhr.upload;
        if (xhrSettings.withCredentials) {
            xhr.withCredentials = true;
        }
        upload.addEventListener("progress", function (e) {
            if (!e.lengthComputable) {
                return;
            }
            onProgress(e);
        }, false);
        xhr.onreadystatechange = (function () {
            if (xhr.readyState === 4) {
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
        var _this3 = this;

        if (window.pydioBootstrap && window.pydioBootstrap.parameters.get("ajxpVersion") && fileName.indexOf("?") === -1) {
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
                }).bind(_this3);
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZG9jLXJlYWR5L2RvYy1yZWFkeS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGllL2V2ZW50aWUuanMiLCJub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwibm9kZV9tb2R1bGVzL3dpY2tlZC1nb29kLXhwYXRoL2Rpc3Qvd2d4cGF0aC5pbnN0YWxsLW5vZGUuanMiLCJyZXMvYnVpbGQvY29yZS9QeWRpb0Jvb3RzdHJhcC5qcyIsInJlcy9idWlsZC9jb3JlL2h0dHAvQ29ubmV4aW9uLmpzIiwicmVzL2J1aWxkL2NvcmUvdXRpbC9YTUxVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDallBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIGRvY1JlYWR5IHYxLjAuNFxuICogQ3Jvc3MgYnJvd3NlciBET01Db250ZW50TG9hZGVkIGV2ZW50IGVtaXR0ZXJcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlKi9cbi8qZ2xvYmFsIGRlZmluZTogZmFsc2UsIHJlcXVpcmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdyApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XG4vLyBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0byBiZSB0cmlnZ2VyZWQgb24gcmVhZHlcbnZhciBxdWV1ZSA9IFtdO1xuXG5mdW5jdGlvbiBkb2NSZWFkeSggZm4gKSB7XG4gIC8vIHRocm93IG91dCBub24tZnVuY3Rpb25zXG4gIGlmICggdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICggZG9jUmVhZHkuaXNSZWFkeSApIHtcbiAgICAvLyByZWFkeSBub3csIGhpdCBpdFxuICAgIGZuKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gcXVldWUgZnVuY3Rpb24gd2hlbiByZWFkeVxuICAgIHF1ZXVlLnB1c2goIGZuICk7XG4gIH1cbn1cblxuZG9jUmVhZHkuaXNSZWFkeSA9IGZhbHNlO1xuXG4vLyB0cmlnZ2VyZWQgb24gdmFyaW91cyBkb2MgcmVhZHkgZXZlbnRzXG5mdW5jdGlvbiBvblJlYWR5KCBldmVudCApIHtcbiAgLy8gYmFpbCBpZiBhbHJlYWR5IHRyaWdnZXJlZCBvciBJRTggZG9jdW1lbnQgaXMgbm90IHJlYWR5IGp1c3QgeWV0XG4gIHZhciBpc0lFOE5vdFJlYWR5ID0gZXZlbnQudHlwZSA9PT0gJ3JlYWR5c3RhdGVjaGFuZ2UnICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZSc7XG4gIGlmICggZG9jUmVhZHkuaXNSZWFkeSB8fCBpc0lFOE5vdFJlYWR5ICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyaWdnZXIoKTtcbn1cblxuZnVuY3Rpb24gdHJpZ2dlcigpIHtcbiAgZG9jUmVhZHkuaXNSZWFkeSA9IHRydWU7XG4gIC8vIHByb2Nlc3MgcXVldWVcbiAgZm9yICggdmFyIGk9MCwgbGVuID0gcXVldWUubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgdmFyIGZuID0gcXVldWVbaV07XG4gICAgZm4oKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZpbmVEb2NSZWFkeSggZXZlbnRpZSApIHtcbiAgLy8gdHJpZ2dlciByZWFkeSBpZiBwYWdlIGlzIHJlYWR5XG4gIGlmICggZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyApIHtcbiAgICB0cmlnZ2VyKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gbGlzdGVuIGZvciBldmVudHNcbiAgICBldmVudGllLmJpbmQoIGRvY3VtZW50LCAnRE9NQ29udGVudExvYWRlZCcsIG9uUmVhZHkgKTtcbiAgICBldmVudGllLmJpbmQoIGRvY3VtZW50LCAncmVhZHlzdGF0ZWNoYW5nZScsIG9uUmVhZHkgKTtcbiAgICBldmVudGllLmJpbmQoIHdpbmRvdywgJ2xvYWQnLCBvblJlYWR5ICk7XG4gIH1cblxuICByZXR1cm4gZG9jUmVhZHk7XG59XG5cbi8vIHRyYW5zcG9ydFxuaWYgKCB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gIC8vIEFNRFxuICBkZWZpbmUoIFsgJ2V2ZW50aWUvZXZlbnRpZScgXSwgZGVmaW5lRG9jUmVhZHkgKTtcbn0gZWxzZSBpZiAoIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyApIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbmVEb2NSZWFkeSggcmVxdWlyZSgnZXZlbnRpZScpICk7XG59IGVsc2Uge1xuICAvLyBicm93c2VyIGdsb2JhbFxuICB3aW5kb3cuZG9jUmVhZHkgPSBkZWZpbmVEb2NSZWFkeSggd2luZG93LmV2ZW50aWUgKTtcbn1cblxufSkoIHdpbmRvdyApO1xuIiwiLyohXG4gKiBldmVudGllIHYxLjAuNlxuICogZXZlbnQgYmluZGluZyBoZWxwZXJcbiAqICAgZXZlbnRpZS5iaW5kKCBlbGVtLCAnY2xpY2snLCBteUZuIClcbiAqICAgZXZlbnRpZS51bmJpbmQoIGVsZW0sICdjbGljaycsIG15Rm4gKVxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdyApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxudmFyIGJpbmQgPSBmdW5jdGlvbigpIHt9O1xuXG5mdW5jdGlvbiBnZXRJRUV2ZW50KCBvYmogKSB7XG4gIHZhciBldmVudCA9IHdpbmRvdy5ldmVudDtcbiAgLy8gYWRkIGV2ZW50LnRhcmdldFxuICBldmVudC50YXJnZXQgPSBldmVudC50YXJnZXQgfHwgZXZlbnQuc3JjRWxlbWVudCB8fCBvYmo7XG4gIHJldHVybiBldmVudDtcbn1cblxuaWYgKCBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIgKSB7XG4gIGJpbmQgPSBmdW5jdGlvbiggb2JqLCB0eXBlLCBmbiApIHtcbiAgICBvYmouYWRkRXZlbnRMaXN0ZW5lciggdHlwZSwgZm4sIGZhbHNlICk7XG4gIH07XG59IGVsc2UgaWYgKCBkb2NFbGVtLmF0dGFjaEV2ZW50ICkge1xuICBiaW5kID0gZnVuY3Rpb24oIG9iaiwgdHlwZSwgZm4gKSB7XG4gICAgb2JqWyB0eXBlICsgZm4gXSA9IGZuLmhhbmRsZUV2ZW50ID9cbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZXZlbnQgPSBnZXRJRUV2ZW50KCBvYmogKTtcbiAgICAgICAgZm4uaGFuZGxlRXZlbnQuY2FsbCggZm4sIGV2ZW50ICk7XG4gICAgICB9IDpcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZXZlbnQgPSBnZXRJRUV2ZW50KCBvYmogKTtcbiAgICAgICAgZm4uY2FsbCggb2JqLCBldmVudCApO1xuICAgICAgfTtcbiAgICBvYmouYXR0YWNoRXZlbnQoIFwib25cIiArIHR5cGUsIG9ialsgdHlwZSArIGZuIF0gKTtcbiAgfTtcbn1cblxudmFyIHVuYmluZCA9IGZ1bmN0aW9uKCkge307XG5cbmlmICggZG9jRWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICkge1xuICB1bmJpbmQgPSBmdW5jdGlvbiggb2JqLCB0eXBlLCBmbiApIHtcbiAgICBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHlwZSwgZm4sIGZhbHNlICk7XG4gIH07XG59IGVsc2UgaWYgKCBkb2NFbGVtLmRldGFjaEV2ZW50ICkge1xuICB1bmJpbmQgPSBmdW5jdGlvbiggb2JqLCB0eXBlLCBmbiApIHtcbiAgICBvYmouZGV0YWNoRXZlbnQoIFwib25cIiArIHR5cGUsIG9ialsgdHlwZSArIGZuIF0gKTtcbiAgICB0cnkge1xuICAgICAgZGVsZXRlIG9ialsgdHlwZSArIGZuIF07XG4gICAgfSBjYXRjaCAoIGVyciApIHtcbiAgICAgIC8vIGNhbid0IGRlbGV0ZSB3aW5kb3cgb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgIG9ialsgdHlwZSArIGZuIF0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9O1xufVxuXG52YXIgZXZlbnRpZSA9IHtcbiAgYmluZDogYmluZCxcbiAgdW5iaW5kOiB1bmJpbmRcbn07XG5cbi8vIC0tLS0tIG1vZHVsZSBkZWZpbml0aW9uIC0tLS0tIC8vXG5cbmlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAvLyBBTURcbiAgZGVmaW5lKCBldmVudGllICk7XG59IGVsc2UgaWYgKCB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XG4gIC8vIENvbW1vbkpTXG4gIG1vZHVsZS5leHBvcnRzID0gZXZlbnRpZTtcbn0gZWxzZSB7XG4gIC8vIGJyb3dzZXIgZ2xvYmFsXG4gIHdpbmRvdy5ldmVudGllID0gZXZlbnRpZTtcbn1cblxufSkoIHdpbmRvdyApO1xuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlcikge1xuICAgIHZhciB2aWV3Q2xhc3NlcyA9IFtcbiAgICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDY0QXJyYXldJ1xuICAgIF1cblxuICAgIHZhciBpc0RhdGFWaWV3ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgICB9XG5cbiAgICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPSBBcnJheUJ1ZmZlci5pc1ZpZXcgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICB0aGlzLmFwcGVuZChoZWFkZXJbMF0sIGhlYWRlclsxXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUrJywnK3ZhbHVlIDogdmFsdWVcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IHRoaXMubWFwW25hbWVdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gICAgfVxuICAgIHJldHVybiBjaGFycy5qb2luKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyQ2xvbmUoYnVmKSB7XG4gICAgaWYgKGJ1Zi5zbGljZSkge1xuICAgICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKVxuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkuYnVmZmVyKVxuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywgeyBib2R5OiB0aGlzLl9ib2R5SW5pdCB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKVxuICAgIC8vIFJlcGxhY2UgaW5zdGFuY2VzIG9mIFxcclxcbiBhbmQgXFxuIGZvbGxvd2VkIGJ5IGF0IGxlYXN0IG9uZSBzcGFjZSBvciBob3Jpem9udGFsIHRhYiB3aXRoIGEgc3BhY2VcbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzIzMCNzZWN0aW9uLTMuMlxuICAgIHZhciBwcmVQcm9jZXNzZWRIZWFkZXJzID0gcmF3SGVhZGVycy5yZXBsYWNlKC9cXHI/XFxuW1xcdCBdKy9nLCAnICcpXG4gICAgcHJlUHJvY2Vzc2VkSGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKClcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFydHMuam9pbignOicpLnRyaW0oKVxuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRlcnNcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1cyA9PT0gdW5kZWZpbmVkID8gMjAwIDogb3B0aW9ucy5zdGF0dXNcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gJ3N0YXR1c1RleHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1c1RleHQgOiAnT0snXG4gICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpXG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ29taXQnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBmYWxzZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCIoZnVuY3Rpb24oKXsndXNlIHN0cmljdCc7dmFyIGs9dGhpcztcbmZ1bmN0aW9uIGFhKGEpe3ZhciBiPXR5cGVvZiBhO2lmKFwib2JqZWN0XCI9PWIpaWYoYSl7aWYoYSBpbnN0YW5jZW9mIEFycmF5KXJldHVyblwiYXJyYXlcIjtpZihhIGluc3RhbmNlb2YgT2JqZWN0KXJldHVybiBiO3ZhciBjPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKTtpZihcIltvYmplY3QgV2luZG93XVwiPT1jKXJldHVyblwib2JqZWN0XCI7aWYoXCJbb2JqZWN0IEFycmF5XVwiPT1jfHxcIm51bWJlclwiPT10eXBlb2YgYS5sZW5ndGgmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLnNwbGljZSYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEucHJvcGVydHlJc0VudW1lcmFibGUmJiFhLnByb3BlcnR5SXNFbnVtZXJhYmxlKFwic3BsaWNlXCIpKXJldHVyblwiYXJyYXlcIjtpZihcIltvYmplY3QgRnVuY3Rpb25dXCI9PWN8fFwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLmNhbGwmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLnByb3BlcnR5SXNFbnVtZXJhYmxlJiYhYS5wcm9wZXJ0eUlzRW51bWVyYWJsZShcImNhbGxcIikpcmV0dXJuXCJmdW5jdGlvblwifWVsc2UgcmV0dXJuXCJudWxsXCI7ZWxzZSBpZihcImZ1bmN0aW9uXCI9PVxuYiYmXCJ1bmRlZmluZWRcIj09dHlwZW9mIGEuY2FsbClyZXR1cm5cIm9iamVjdFwiO3JldHVybiBifWZ1bmN0aW9uIGwoYSl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGF9ZnVuY3Rpb24gYmEoYSxiLGMpe3JldHVybiBhLmNhbGwuYXBwbHkoYS5iaW5kLGFyZ3VtZW50cyl9ZnVuY3Rpb24gY2EoYSxiLGMpe2lmKCFhKXRocm93IEVycm9yKCk7aWYoMjxhcmd1bWVudHMubGVuZ3RoKXt2YXIgZD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMik7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjLGQpO3JldHVybiBhLmFwcGx5KGIsYyl9fXJldHVybiBmdW5jdGlvbigpe3JldHVybiBhLmFwcGx5KGIsYXJndW1lbnRzKX19XG5mdW5jdGlvbiBkYShhLGIsYyl7ZGE9RnVuY3Rpb24ucHJvdG90eXBlLmJpbmQmJi0xIT1GdW5jdGlvbi5wcm90b3R5cGUuYmluZC50b1N0cmluZygpLmluZGV4T2YoXCJuYXRpdmUgY29kZVwiKT9iYTpjYTtyZXR1cm4gZGEuYXBwbHkobnVsbCxhcmd1bWVudHMpfWZ1bmN0aW9uIGVhKGEsYil7dmFyIGM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpO3JldHVybiBmdW5jdGlvbigpe3ZhciBiPWMuc2xpY2UoKTtiLnB1c2guYXBwbHkoYixhcmd1bWVudHMpO3JldHVybiBhLmFwcGx5KHRoaXMsYil9fVxuZnVuY3Rpb24gbShhKXt2YXIgYj1uO2Z1bmN0aW9uIGMoKXt9Yy5wcm90b3R5cGU9Yi5wcm90b3R5cGU7YS5HPWIucHJvdG90eXBlO2EucHJvdG90eXBlPW5ldyBjO2EucHJvdG90eXBlLmNvbnN0cnVjdG9yPWE7YS5GPWZ1bmN0aW9uKGEsYyxmKXtmb3IodmFyIGc9QXJyYXkoYXJndW1lbnRzLmxlbmd0aC0yKSxoPTI7aDxhcmd1bWVudHMubGVuZ3RoO2grKylnW2gtMl09YXJndW1lbnRzW2hdO3JldHVybiBiLnByb3RvdHlwZVtjXS5hcHBseShhLGcpfX07LypcblxuIFRoZSBNSVQgTGljZW5zZVxuXG4gQ29weXJpZ2h0IChjKSAyMDA3IEN5Ym96dSBMYWJzLCBJbmMuXG4gQ29weXJpZ2h0IChjKSAyMDEyIEdvb2dsZSBJbmMuXG5cbiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG9cbiBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vclxuIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG4gRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HU1xuIElOIFRIRSBTT0ZUV0FSRS5cbiovXG52YXIgZmE9U3RyaW5nLnByb3RvdHlwZS50cmltP2Z1bmN0aW9uKGEpe3JldHVybiBhLnRyaW0oKX06ZnVuY3Rpb24oYSl7cmV0dXJuIGEucmVwbGFjZSgvXltcXHNcXHhhMF0rfFtcXHNcXHhhMF0rJC9nLFwiXCIpfTtmdW5jdGlvbiBxKGEsYil7cmV0dXJuLTEhPWEuaW5kZXhPZihiKX1mdW5jdGlvbiBnYShhLGIpe3JldHVybiBhPGI/LTE6YT5iPzE6MH07dmFyIGhhPUFycmF5LnByb3RvdHlwZS5pbmRleE9mP2Z1bmN0aW9uKGEsYixjKXtyZXR1cm4gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChhLGIsYyl9OmZ1bmN0aW9uKGEsYixjKXtjPW51bGw9PWM/MDowPmM/TWF0aC5tYXgoMCxhLmxlbmd0aCtjKTpjO2lmKGwoYSkpcmV0dXJuIGwoYikmJjE9PWIubGVuZ3RoP2EuaW5kZXhPZihiLGMpOi0xO2Zvcig7YzxhLmxlbmd0aDtjKyspaWYoYyBpbiBhJiZhW2NdPT09YilyZXR1cm4gYztyZXR1cm4tMX0scj1BcnJheS5wcm90b3R5cGUuZm9yRWFjaD9mdW5jdGlvbihhLGIsYyl7QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChhLGIsYyl9OmZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9YS5sZW5ndGgsZT1sKGEpP2Euc3BsaXQoXCJcIik6YSxmPTA7ZjxkO2YrKylmIGluIGUmJmIuY2FsbChjLGVbZl0sZixhKX0saWE9QXJyYXkucHJvdG90eXBlLmZpbHRlcj9mdW5jdGlvbihhLGIsYyl7cmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChhLFxuYixjKX06ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZD1hLmxlbmd0aCxlPVtdLGY9MCxnPWwoYSk/YS5zcGxpdChcIlwiKTphLGg9MDtoPGQ7aCsrKWlmKGggaW4gZyl7dmFyIHA9Z1toXTtiLmNhbGwoYyxwLGgsYSkmJihlW2YrK109cCl9cmV0dXJuIGV9LHQ9QXJyYXkucHJvdG90eXBlLnJlZHVjZT9mdW5jdGlvbihhLGIsYyxkKXtkJiYoYj1kYShiLGQpKTtyZXR1cm4gQXJyYXkucHJvdG90eXBlLnJlZHVjZS5jYWxsKGEsYixjKX06ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9YztyKGEsZnVuY3Rpb24oYyxnKXtlPWIuY2FsbChkLGUsYyxnLGEpfSk7cmV0dXJuIGV9LGphPUFycmF5LnByb3RvdHlwZS5zb21lP2Z1bmN0aW9uKGEsYixjKXtyZXR1cm4gQXJyYXkucHJvdG90eXBlLnNvbWUuY2FsbChhLGIsYyl9OmZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9YS5sZW5ndGgsZT1sKGEpP2Euc3BsaXQoXCJcIik6YSxmPTA7ZjxkO2YrKylpZihmIGluIGUmJmIuY2FsbChjLGVbZl0sZixhKSlyZXR1cm4hMDtcbnJldHVybiExfTtmdW5jdGlvbiBrYShhLGIpe3ZhciBjO2E6e2M9YS5sZW5ndGg7Zm9yKHZhciBkPWwoYSk/YS5zcGxpdChcIlwiKTphLGU9MDtlPGM7ZSsrKWlmKGUgaW4gZCYmYi5jYWxsKHZvaWQgMCxkW2VdLGUsYSkpe2M9ZTticmVhayBhfWM9LTF9cmV0dXJuIDA+Yz9udWxsOmwoYSk/YS5jaGFyQXQoYyk6YVtjXX1mdW5jdGlvbiBsYShhKXtyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShBcnJheS5wcm90b3R5cGUsYXJndW1lbnRzKX1mdW5jdGlvbiBtYShhLGIsYyl7cmV0dXJuIDI+PWFyZ3VtZW50cy5sZW5ndGg/QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSxiKTpBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhLGIsYyl9O3ZhciB1O2E6e3ZhciBuYT1rLm5hdmlnYXRvcjtpZihuYSl7dmFyIG9hPW5hLnVzZXJBZ2VudDtpZihvYSl7dT1vYTticmVhayBhfX11PVwiXCJ9O3ZhciBwYT1xKHUsXCJPcGVyYVwiKXx8cSh1LFwiT1BSXCIpLHY9cSh1LFwiVHJpZGVudFwiKXx8cSh1LFwiTVNJRVwiKSxxYT1xKHUsXCJFZGdlXCIpLHJhPXEodSxcIkdlY2tvXCIpJiYhKHEodS50b0xvd2VyQ2FzZSgpLFwid2Via2l0XCIpJiYhcSh1LFwiRWRnZVwiKSkmJiEocSh1LFwiVHJpZGVudFwiKXx8cSh1LFwiTVNJRVwiKSkmJiFxKHUsXCJFZGdlXCIpLHNhPXEodS50b0xvd2VyQ2FzZSgpLFwid2Via2l0XCIpJiYhcSh1LFwiRWRnZVwiKTtmdW5jdGlvbiB0YSgpe3ZhciBhPWsuZG9jdW1lbnQ7cmV0dXJuIGE/YS5kb2N1bWVudE1vZGU6dm9pZCAwfXZhciB1YTtcbmE6e3ZhciB2YT1cIlwiLHdhPWZ1bmN0aW9uKCl7dmFyIGE9dTtpZihyYSlyZXR1cm4vcnZcXDooW15cXCk7XSspKFxcKXw7KS8uZXhlYyhhKTtpZihxYSlyZXR1cm4vRWRnZVxcLyhbXFxkXFwuXSspLy5leGVjKGEpO2lmKHYpcmV0dXJuL1xcYig/Ok1TSUV8cnYpWzogXShbXlxcKTtdKykoXFwpfDspLy5leGVjKGEpO2lmKHNhKXJldHVybi9XZWJLaXRcXC8oXFxTKykvLmV4ZWMoYSk7aWYocGEpcmV0dXJuLyg/OlZlcnNpb24pWyBcXC9dPyhcXFMrKS8uZXhlYyhhKX0oKTt3YSYmKHZhPXdhP3dhWzFdOlwiXCIpO2lmKHYpe3ZhciB4YT10YSgpO2lmKG51bGwhPXhhJiZ4YT5wYXJzZUZsb2F0KHZhKSl7dWE9U3RyaW5nKHhhKTticmVhayBhfX11YT12YX12YXIgeWE9e307XG5mdW5jdGlvbiB6YShhKXtpZigheWFbYV0pe2Zvcih2YXIgYj0wLGM9ZmEoU3RyaW5nKHVhKSkuc3BsaXQoXCIuXCIpLGQ9ZmEoU3RyaW5nKGEpKS5zcGxpdChcIi5cIiksZT1NYXRoLm1heChjLmxlbmd0aCxkLmxlbmd0aCksZj0wOzA9PWImJmY8ZTtmKyspe3ZhciBnPWNbZl18fFwiXCIsaD1kW2ZdfHxcIlwiLHA9LyhcXGQqKShcXEQqKS9nLHk9LyhcXGQqKShcXEQqKS9nO2Rve3ZhciBEPXAuZXhlYyhnKXx8W1wiXCIsXCJcIixcIlwiXSxYPXkuZXhlYyhoKXx8W1wiXCIsXCJcIixcIlwiXTtpZigwPT1EWzBdLmxlbmd0aCYmMD09WFswXS5sZW5ndGgpYnJlYWs7Yj1nYSgwPT1EWzFdLmxlbmd0aD8wOnBhcnNlSW50KERbMV0sMTApLDA9PVhbMV0ubGVuZ3RoPzA6cGFyc2VJbnQoWFsxXSwxMCkpfHxnYSgwPT1EWzJdLmxlbmd0aCwwPT1YWzJdLmxlbmd0aCl8fGdhKERbMl0sWFsyXSl9d2hpbGUoMD09Yil9eWFbYV09MDw9Yn19XG52YXIgQWE9ay5kb2N1bWVudCxCYT1BYSYmdj90YSgpfHwoXCJDU1MxQ29tcGF0XCI9PUFhLmNvbXBhdE1vZGU/cGFyc2VJbnQodWEsMTApOjUpOnZvaWQgMDt2YXIgdz12JiYhKDk8PU51bWJlcihCYSkpLENhPXYmJiEoODw9TnVtYmVyKEJhKSk7ZnVuY3Rpb24geChhLGIsYyxkKXt0aGlzLmE9YTt0aGlzLm5vZGVOYW1lPWM7dGhpcy5ub2RlVmFsdWU9ZDt0aGlzLm5vZGVUeXBlPTI7dGhpcy5wYXJlbnROb2RlPXRoaXMub3duZXJFbGVtZW50PWJ9ZnVuY3Rpb24gRGEoYSxiKXt2YXIgYz1DYSYmXCJocmVmXCI9PWIubm9kZU5hbWU/YS5nZXRBdHRyaWJ1dGUoYi5ub2RlTmFtZSwyKTpiLm5vZGVWYWx1ZTtyZXR1cm4gbmV3IHgoYixhLGIubm9kZU5hbWUsYyl9O2Z1bmN0aW9uIHooYSl7dmFyIGI9bnVsbCxjPWEubm9kZVR5cGU7MT09YyYmKGI9YS50ZXh0Q29udGVudCxiPXZvaWQgMD09Ynx8bnVsbD09Yj9hLmlubmVyVGV4dDpiLGI9dm9pZCAwPT1ifHxudWxsPT1iP1wiXCI6Yik7aWYoXCJzdHJpbmdcIiE9dHlwZW9mIGIpaWYodyYmXCJ0aXRsZVwiPT1hLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkmJjE9PWMpYj1hLnRleHQ7ZWxzZSBpZig5PT1jfHwxPT1jKXthPTk9PWM/YS5kb2N1bWVudEVsZW1lbnQ6YS5maXJzdENoaWxkO2Zvcih2YXIgYz0wLGQ9W10sYj1cIlwiO2E7KXtkbyAxIT1hLm5vZGVUeXBlJiYoYis9YS5ub2RlVmFsdWUpLHcmJlwidGl0bGVcIj09YS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpJiYoYis9YS50ZXh0KSxkW2MrK109YTt3aGlsZShhPWEuZmlyc3RDaGlsZCk7Zm9yKDtjJiYhKGE9ZFstLWNdLm5leHRTaWJsaW5nKTspO319ZWxzZSBiPWEubm9kZVZhbHVlO3JldHVyblwiXCIrYn1cbmZ1bmN0aW9uIEEoYSxiLGMpe2lmKG51bGw9PT1iKXJldHVybiEwO3RyeXtpZighYS5nZXRBdHRyaWJ1dGUpcmV0dXJuITF9Y2F0Y2goZCl7cmV0dXJuITF9Q2EmJlwiY2xhc3NcIj09YiYmKGI9XCJjbGFzc05hbWVcIik7cmV0dXJuIG51bGw9PWM/ISFhLmdldEF0dHJpYnV0ZShiKTphLmdldEF0dHJpYnV0ZShiLDIpPT1jfWZ1bmN0aW9uIEIoYSxiLGMsZCxlKXtyZXR1cm4odz9FYTpGYSkuY2FsbChudWxsLGEsYixsKGMpP2M6bnVsbCxsKGQpP2Q6bnVsbCxlfHxuZXcgQyl9XG5mdW5jdGlvbiBFYShhLGIsYyxkLGUpe2lmKGEgaW5zdGFuY2VvZiBFfHw4PT1hLmJ8fGMmJm51bGw9PT1hLmIpe3ZhciBmPWIuYWxsO2lmKCFmKXJldHVybiBlO2E9R2EoYSk7aWYoXCIqXCIhPWEmJihmPWIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoYSksIWYpKXJldHVybiBlO2lmKGMpe2Zvcih2YXIgZz1bXSxoPTA7Yj1mW2grK107KUEoYixjLGQpJiZnLnB1c2goYik7Zj1nfWZvcihoPTA7Yj1mW2grK107KVwiKlwiPT1hJiZcIiFcIj09Yi50YWdOYW1lfHxGKGUsYik7cmV0dXJuIGV9SGEoYSxiLGMsZCxlKTtyZXR1cm4gZX1cbmZ1bmN0aW9uIEZhKGEsYixjLGQsZSl7Yi5nZXRFbGVtZW50c0J5TmFtZSYmZCYmXCJuYW1lXCI9PWMmJiF2PyhiPWIuZ2V0RWxlbWVudHNCeU5hbWUoZCkscihiLGZ1bmN0aW9uKGIpe2EuYShiKSYmRihlLGIpfSkpOmIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSYmZCYmXCJjbGFzc1wiPT1jPyhiPWIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShkKSxyKGIsZnVuY3Rpb24oYil7Yi5jbGFzc05hbWU9PWQmJmEuYShiKSYmRihlLGIpfSkpOmEgaW5zdGFuY2VvZiBHP0hhKGEsYixjLGQsZSk6Yi5nZXRFbGVtZW50c0J5VGFnTmFtZSYmKGI9Yi5nZXRFbGVtZW50c0J5VGFnTmFtZShhLmYoKSkscihiLGZ1bmN0aW9uKGEpe0EoYSxjLGQpJiZGKGUsYSl9KSk7cmV0dXJuIGV9XG5mdW5jdGlvbiBJYShhLGIsYyxkLGUpe3ZhciBmO2lmKChhIGluc3RhbmNlb2YgRXx8OD09YS5ifHxjJiZudWxsPT09YS5iKSYmKGY9Yi5jaGlsZE5vZGVzKSl7dmFyIGc9R2EoYSk7aWYoXCIqXCIhPWcmJihmPWlhKGYsZnVuY3Rpb24oYSl7cmV0dXJuIGEudGFnTmFtZSYmYS50YWdOYW1lLnRvTG93ZXJDYXNlKCk9PWd9KSwhZikpcmV0dXJuIGU7YyYmKGY9aWEoZixmdW5jdGlvbihhKXtyZXR1cm4gQShhLGMsZCl9KSk7cihmLGZ1bmN0aW9uKGEpe1wiKlwiPT1nJiYoXCIhXCI9PWEudGFnTmFtZXx8XCIqXCI9PWcmJjEhPWEubm9kZVR5cGUpfHxGKGUsYSl9KTtyZXR1cm4gZX1yZXR1cm4gSmEoYSxiLGMsZCxlKX1mdW5jdGlvbiBKYShhLGIsYyxkLGUpe2ZvcihiPWIuZmlyc3RDaGlsZDtiO2I9Yi5uZXh0U2libGluZylBKGIsYyxkKSYmYS5hKGIpJiZGKGUsYik7cmV0dXJuIGV9XG5mdW5jdGlvbiBIYShhLGIsYyxkLGUpe2ZvcihiPWIuZmlyc3RDaGlsZDtiO2I9Yi5uZXh0U2libGluZylBKGIsYyxkKSYmYS5hKGIpJiZGKGUsYiksSGEoYSxiLGMsZCxlKX1mdW5jdGlvbiBHYShhKXtpZihhIGluc3RhbmNlb2YgRyl7aWYoOD09YS5iKXJldHVyblwiIVwiO2lmKG51bGw9PT1hLmIpcmV0dXJuXCIqXCJ9cmV0dXJuIGEuZigpfTshcmEmJiF2fHx2JiY5PD1OdW1iZXIoQmEpfHxyYSYmemEoXCIxLjkuMVwiKTt2JiZ6YShcIjlcIik7ZnVuY3Rpb24gS2EoYSxiKXtpZighYXx8IWIpcmV0dXJuITE7aWYoYS5jb250YWlucyYmMT09Yi5ub2RlVHlwZSlyZXR1cm4gYT09Ynx8YS5jb250YWlucyhiKTtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbilyZXR1cm4gYT09Ynx8ISEoYS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihiKSYxNik7Zm9yKDtiJiZhIT1iOyliPWIucGFyZW50Tm9kZTtyZXR1cm4gYj09YX1cbmZ1bmN0aW9uIExhKGEsYil7aWYoYT09YilyZXR1cm4gMDtpZihhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKXJldHVybiBhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGIpJjI/MTotMTtpZih2JiYhKDk8PU51bWJlcihCYSkpKXtpZig5PT1hLm5vZGVUeXBlKXJldHVybi0xO2lmKDk9PWIubm9kZVR5cGUpcmV0dXJuIDF9aWYoXCJzb3VyY2VJbmRleFwiaW4gYXx8YS5wYXJlbnROb2RlJiZcInNvdXJjZUluZGV4XCJpbiBhLnBhcmVudE5vZGUpe3ZhciBjPTE9PWEubm9kZVR5cGUsZD0xPT1iLm5vZGVUeXBlO2lmKGMmJmQpcmV0dXJuIGEuc291cmNlSW5kZXgtYi5zb3VyY2VJbmRleDt2YXIgZT1hLnBhcmVudE5vZGUsZj1iLnBhcmVudE5vZGU7cmV0dXJuIGU9PWY/TWEoYSxiKTohYyYmS2EoZSxiKT8tMSpOYShhLGIpOiFkJiZLYShmLGEpP05hKGIsYSk6KGM/YS5zb3VyY2VJbmRleDplLnNvdXJjZUluZGV4KS0oZD9iLnNvdXJjZUluZGV4OmYuc291cmNlSW5kZXgpfWQ9OT09YS5ub2RlVHlwZT9cbmE6YS5vd25lckRvY3VtZW50fHxhLmRvY3VtZW50O2M9ZC5jcmVhdGVSYW5nZSgpO2Muc2VsZWN0Tm9kZShhKTtjLmNvbGxhcHNlKCEwKTtkPWQuY3JlYXRlUmFuZ2UoKTtkLnNlbGVjdE5vZGUoYik7ZC5jb2xsYXBzZSghMCk7cmV0dXJuIGMuY29tcGFyZUJvdW5kYXJ5UG9pbnRzKGsuUmFuZ2UuU1RBUlRfVE9fRU5ELGQpfWZ1bmN0aW9uIE5hKGEsYil7dmFyIGM9YS5wYXJlbnROb2RlO2lmKGM9PWIpcmV0dXJuLTE7Zm9yKHZhciBkPWI7ZC5wYXJlbnROb2RlIT1jOylkPWQucGFyZW50Tm9kZTtyZXR1cm4gTWEoZCxhKX1mdW5jdGlvbiBNYShhLGIpe2Zvcih2YXIgYz1iO2M9Yy5wcmV2aW91c1NpYmxpbmc7KWlmKGM9PWEpcmV0dXJuLTE7cmV0dXJuIDF9O2Z1bmN0aW9uIEMoKXt0aGlzLmI9dGhpcy5hPW51bGw7dGhpcy5sPTB9ZnVuY3Rpb24gT2EoYSl7dGhpcy5ub2RlPWE7dGhpcy5hPXRoaXMuYj1udWxsfWZ1bmN0aW9uIFBhKGEsYil7aWYoIWEuYSlyZXR1cm4gYjtpZighYi5hKXJldHVybiBhO2Zvcih2YXIgYz1hLmEsZD1iLmEsZT1udWxsLGY9bnVsbCxnPTA7YyYmZDspe3ZhciBmPWMubm9kZSxoPWQubm9kZTtmPT1ofHxmIGluc3RhbmNlb2YgeCYmaCBpbnN0YW5jZW9mIHgmJmYuYT09aC5hPyhmPWMsYz1jLmEsZD1kLmEpOjA8TGEoYy5ub2RlLGQubm9kZSk/KGY9ZCxkPWQuYSk6KGY9YyxjPWMuYSk7KGYuYj1lKT9lLmE9ZjphLmE9ZjtlPWY7ZysrfWZvcihmPWN8fGQ7ZjspZi5iPWUsZT1lLmE9ZixnKyssZj1mLmE7YS5iPWU7YS5sPWc7cmV0dXJuIGF9ZnVuY3Rpb24gUWEoYSxiKXt2YXIgYz1uZXcgT2EoYik7Yy5hPWEuYTthLmI/YS5hLmI9YzphLmE9YS5iPWM7YS5hPWM7YS5sKyt9XG5mdW5jdGlvbiBGKGEsYil7dmFyIGM9bmV3IE9hKGIpO2MuYj1hLmI7YS5hP2EuYi5hPWM6YS5hPWEuYj1jO2EuYj1jO2EubCsrfWZ1bmN0aW9uIFJhKGEpe3JldHVybihhPWEuYSk/YS5ub2RlOm51bGx9ZnVuY3Rpb24gU2EoYSl7cmV0dXJuKGE9UmEoYSkpP3ooYSk6XCJcIn1mdW5jdGlvbiBIKGEsYil7cmV0dXJuIG5ldyBUYShhLCEhYil9ZnVuY3Rpb24gVGEoYSxiKXt0aGlzLmY9YTt0aGlzLmI9KHRoaXMuYz1iKT9hLmI6YS5hO3RoaXMuYT1udWxsfWZ1bmN0aW9uIEkoYSl7dmFyIGI9YS5iO2lmKG51bGw9PWIpcmV0dXJuIG51bGw7dmFyIGM9YS5hPWI7YS5iPWEuYz9iLmI6Yi5hO3JldHVybiBjLm5vZGV9O2Z1bmN0aW9uIG4oYSl7dGhpcy5pPWE7dGhpcy5iPXRoaXMuZz0hMTt0aGlzLmY9bnVsbH1mdW5jdGlvbiBKKGEpe3JldHVyblwiXFxuICBcIithLnRvU3RyaW5nKCkuc3BsaXQoXCJcXG5cIikuam9pbihcIlxcbiAgXCIpfWZ1bmN0aW9uIFVhKGEsYil7YS5nPWJ9ZnVuY3Rpb24gVmEoYSxiKXthLmI9Yn1mdW5jdGlvbiBLKGEsYil7dmFyIGM9YS5hKGIpO3JldHVybiBjIGluc3RhbmNlb2YgQz8rU2EoYyk6K2N9ZnVuY3Rpb24gTChhLGIpe3ZhciBjPWEuYShiKTtyZXR1cm4gYyBpbnN0YW5jZW9mIEM/U2EoYyk6XCJcIitjfWZ1bmN0aW9uIE0oYSxiKXt2YXIgYz1hLmEoYik7cmV0dXJuIGMgaW5zdGFuY2VvZiBDPyEhYy5sOiEhY307ZnVuY3Rpb24gTihhLGIsYyl7bi5jYWxsKHRoaXMsYS5pKTt0aGlzLmM9YTt0aGlzLmg9Yjt0aGlzLm89Yzt0aGlzLmc9Yi5nfHxjLmc7dGhpcy5iPWIuYnx8Yy5iO3RoaXMuYz09V2EmJihjLmJ8fGMuZ3x8ND09Yy5pfHwwPT1jLml8fCFiLmY/Yi5ifHxiLmd8fDQ9PWIuaXx8MD09Yi5pfHwhYy5mfHwodGhpcy5mPXtuYW1lOmMuZi5uYW1lLHM6Yn0pOnRoaXMuZj17bmFtZTpiLmYubmFtZSxzOmN9KX1tKE4pO1xuZnVuY3Rpb24gTyhhLGIsYyxkLGUpe2I9Yi5hKGQpO2M9Yy5hKGQpO3ZhciBmO2lmKGIgaW5zdGFuY2VvZiBDJiZjIGluc3RhbmNlb2YgQyl7Yj1IKGIpO2ZvcihkPUkoYik7ZDtkPUkoYikpZm9yKGU9SChjKSxmPUkoZSk7ZjtmPUkoZSkpaWYoYSh6KGQpLHooZikpKXJldHVybiEwO3JldHVybiExfWlmKGIgaW5zdGFuY2VvZiBDfHxjIGluc3RhbmNlb2YgQyl7YiBpbnN0YW5jZW9mIEM/KGU9YixkPWMpOihlPWMsZD1iKTtmPUgoZSk7Zm9yKHZhciBnPXR5cGVvZiBkLGg9SShmKTtoO2g9SShmKSl7c3dpdGNoKGcpe2Nhc2UgXCJudW1iZXJcIjpoPSt6KGgpO2JyZWFrO2Nhc2UgXCJib29sZWFuXCI6aD0hIXooaCk7YnJlYWs7Y2FzZSBcInN0cmluZ1wiOmg9eihoKTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiSWxsZWdhbCBwcmltaXRpdmUgdHlwZSBmb3IgY29tcGFyaXNvbi5cIik7fWlmKGU9PWImJmEoaCxkKXx8ZT09YyYmYShkLGgpKXJldHVybiEwfXJldHVybiExfXJldHVybiBlP1wiYm9vbGVhblwiPT1cbnR5cGVvZiBifHxcImJvb2xlYW5cIj09dHlwZW9mIGM/YSghIWIsISFjKTpcIm51bWJlclwiPT10eXBlb2YgYnx8XCJudW1iZXJcIj09dHlwZW9mIGM/YSgrYiwrYyk6YShiLGMpOmEoK2IsK2MpfU4ucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuYy5tKHRoaXMuaCx0aGlzLm8sYSl9O04ucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7dmFyIGE9XCJCaW5hcnkgRXhwcmVzc2lvbjogXCIrdGhpcy5jLGE9YStKKHRoaXMuaCk7cmV0dXJuIGErPUoodGhpcy5vKX07ZnVuY3Rpb24gWGEoYSxiLGMsZCl7dGhpcy5hPWE7dGhpcy53PWI7dGhpcy5pPWM7dGhpcy5tPWR9WGEucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYX07dmFyIFlhPXt9O1xuZnVuY3Rpb24gUChhLGIsYyxkKXtpZihZYS5oYXNPd25Qcm9wZXJ0eShhKSl0aHJvdyBFcnJvcihcIkJpbmFyeSBvcGVyYXRvciBhbHJlYWR5IGNyZWF0ZWQ6IFwiK2EpO2E9bmV3IFhhKGEsYixjLGQpO3JldHVybiBZYVthLnRvU3RyaW5nKCldPWF9UChcImRpdlwiLDYsMSxmdW5jdGlvbihhLGIsYyl7cmV0dXJuIEsoYSxjKS9LKGIsYyl9KTtQKFwibW9kXCIsNiwxLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gSyhhLGMpJUsoYixjKX0pO1AoXCIqXCIsNiwxLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gSyhhLGMpKksoYixjKX0pO1AoXCIrXCIsNSwxLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gSyhhLGMpK0soYixjKX0pO1AoXCItXCIsNSwxLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gSyhhLGMpLUsoYixjKX0pO1AoXCI8XCIsNCwyLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTyhmdW5jdGlvbihhLGIpe3JldHVybiBhPGJ9LGEsYixjKX0pO1xuUChcIj5cIiw0LDIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBPKGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE+Yn0sYSxiLGMpfSk7UChcIjw9XCIsNCwyLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTyhmdW5jdGlvbihhLGIpe3JldHVybiBhPD1ifSxhLGIsYyl9KTtQKFwiPj1cIiw0LDIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBPKGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE+PWJ9LGEsYixjKX0pO3ZhciBXYT1QKFwiPVwiLDMsMixmdW5jdGlvbihhLGIsYyl7cmV0dXJuIE8oZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09Yn0sYSxiLGMsITApfSk7UChcIiE9XCIsMywyLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTyhmdW5jdGlvbihhLGIpe3JldHVybiBhIT1ifSxhLGIsYywhMCl9KTtQKFwiYW5kXCIsMiwyLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTShhLGMpJiZNKGIsYyl9KTtQKFwib3JcIiwxLDIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBNKGEsYyl8fE0oYixjKX0pO2Z1bmN0aW9uIFEoYSxiLGMpe3RoaXMuYT1hO3RoaXMuYj1ifHwxO3RoaXMuZj1jfHwxfTtmdW5jdGlvbiBaYShhLGIpe2lmKGIuYS5sZW5ndGgmJjQhPWEuaSl0aHJvdyBFcnJvcihcIlByaW1hcnkgZXhwcmVzc2lvbiBtdXN0IGV2YWx1YXRlIHRvIG5vZGVzZXQgaWYgZmlsdGVyIGhhcyBwcmVkaWNhdGUocykuXCIpO24uY2FsbCh0aGlzLGEuaSk7dGhpcy5jPWE7dGhpcy5oPWI7dGhpcy5nPWEuZzt0aGlzLmI9YS5ifW0oWmEpO1phLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe2E9dGhpcy5jLmEoYSk7cmV0dXJuICRhKHRoaXMuaCxhKX07WmEucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7dmFyIGE7YT1cIkZpbHRlcjpcIitKKHRoaXMuYyk7cmV0dXJuIGErPUoodGhpcy5oKX07ZnVuY3Rpb24gYWIoYSxiKXtpZihiLmxlbmd0aDxhLkEpdGhyb3cgRXJyb3IoXCJGdW5jdGlvbiBcIithLmorXCIgZXhwZWN0cyBhdCBsZWFzdFwiK2EuQStcIiBhcmd1bWVudHMsIFwiK2IubGVuZ3RoK1wiIGdpdmVuXCIpO2lmKG51bGwhPT1hLnYmJmIubGVuZ3RoPmEudil0aHJvdyBFcnJvcihcIkZ1bmN0aW9uIFwiK2EuaitcIiBleHBlY3RzIGF0IG1vc3QgXCIrYS52K1wiIGFyZ3VtZW50cywgXCIrYi5sZW5ndGgrXCIgZ2l2ZW5cIik7YS5CJiZyKGIsZnVuY3Rpb24oYixkKXtpZig0IT1iLmkpdGhyb3cgRXJyb3IoXCJBcmd1bWVudCBcIitkK1wiIHRvIGZ1bmN0aW9uIFwiK2EuaitcIiBpcyBub3Qgb2YgdHlwZSBOb2Rlc2V0OiBcIitiKTt9KTtuLmNhbGwodGhpcyxhLmkpO3RoaXMuaD1hO3RoaXMuYz1iO1VhKHRoaXMsYS5nfHxqYShiLGZ1bmN0aW9uKGEpe3JldHVybiBhLmd9KSk7VmEodGhpcyxhLkQmJiFiLmxlbmd0aHx8YS5DJiYhIWIubGVuZ3RofHxqYShiLGZ1bmN0aW9uKGEpe3JldHVybiBhLmJ9KSl9bShhYik7XG5hYi5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5oLm0uYXBwbHkobnVsbCxsYShhLHRoaXMuYykpfTthYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXt2YXIgYT1cIkZ1bmN0aW9uOiBcIit0aGlzLmg7aWYodGhpcy5jLmxlbmd0aCl2YXIgYj10KHRoaXMuYyxmdW5jdGlvbihhLGIpe3JldHVybiBhK0ooYil9LFwiQXJndW1lbnRzOlwiKSxhPWErSihiKTtyZXR1cm4gYX07ZnVuY3Rpb24gYmIoYSxiLGMsZCxlLGYsZyxoLHApe3RoaXMuaj1hO3RoaXMuaT1iO3RoaXMuZz1jO3RoaXMuRD1kO3RoaXMuQz1lO3RoaXMubT1mO3RoaXMuQT1nO3RoaXMudj12b2lkIDAhPT1oP2g6Zzt0aGlzLkI9ISFwfWJiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmp9O3ZhciBjYj17fTtcbmZ1bmN0aW9uIFIoYSxiLGMsZCxlLGYsZyxoKXtpZihjYi5oYXNPd25Qcm9wZXJ0eShhKSl0aHJvdyBFcnJvcihcIkZ1bmN0aW9uIGFscmVhZHkgY3JlYXRlZDogXCIrYStcIi5cIik7Y2JbYV09bmV3IGJiKGEsYixjLGQsITEsZSxmLGcsaCl9UihcImJvb2xlYW5cIiwyLCExLCExLGZ1bmN0aW9uKGEsYil7cmV0dXJuIE0oYixhKX0sMSk7UihcImNlaWxpbmdcIiwxLCExLCExLGZ1bmN0aW9uKGEsYil7cmV0dXJuIE1hdGguY2VpbChLKGIsYSkpfSwxKTtSKFwiY29uY2F0XCIsMywhMSwhMSxmdW5jdGlvbihhLGIpe3JldHVybiB0KG1hKGFyZ3VtZW50cywxKSxmdW5jdGlvbihiLGQpe3JldHVybiBiK0woZCxhKX0sXCJcIil9LDIsbnVsbCk7UihcImNvbnRhaW5zXCIsMiwhMSwhMSxmdW5jdGlvbihhLGIsYyl7cmV0dXJuIHEoTChiLGEpLEwoYyxhKSl9LDIpO1IoXCJjb3VudFwiLDEsITEsITEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi5hKGEpLmx9LDEsMSwhMCk7XG5SKFwiZmFsc2VcIiwyLCExLCExLGZ1bmN0aW9uKCl7cmV0dXJuITF9LDApO1IoXCJmbG9vclwiLDEsITEsITEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gTWF0aC5mbG9vcihLKGIsYSkpfSwxKTtSKFwiaWRcIiw0LCExLCExLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtpZih3KXt2YXIgYj1lLmFsbFthXTtpZihiKXtpZihiLm5vZGVUeXBlJiZhPT1iLmlkKXJldHVybiBiO2lmKGIubGVuZ3RoKXJldHVybiBrYShiLGZ1bmN0aW9uKGIpe3JldHVybiBhPT1iLmlkfSl9cmV0dXJuIG51bGx9cmV0dXJuIGUuZ2V0RWxlbWVudEJ5SWQoYSl9dmFyIGQ9YS5hLGU9OT09ZC5ub2RlVHlwZT9kOmQub3duZXJEb2N1bWVudCxkPUwoYixhKS5zcGxpdCgvXFxzKy8pLGY9W107cihkLGZ1bmN0aW9uKGEpe2E9YyhhKTshYXx8MDw9aGEoZixhKXx8Zi5wdXNoKGEpfSk7Zi5zb3J0KExhKTt2YXIgZz1uZXcgQztyKGYsZnVuY3Rpb24oYSl7RihnLGEpfSk7cmV0dXJuIGd9LDEpO1xuUihcImxhbmdcIiwyLCExLCExLGZ1bmN0aW9uKCl7cmV0dXJuITF9LDEpO1IoXCJsYXN0XCIsMSwhMCwhMSxmdW5jdGlvbihhKXtpZigxIT1hcmd1bWVudHMubGVuZ3RoKXRocm93IEVycm9yKFwiRnVuY3Rpb24gbGFzdCBleHBlY3RzICgpXCIpO3JldHVybiBhLmZ9LDApO1IoXCJsb2NhbC1uYW1lXCIsMywhMSwhMCxmdW5jdGlvbihhLGIpe3ZhciBjPWI/UmEoYi5hKGEpKTphLmE7cmV0dXJuIGM/Yy5sb2NhbE5hbWV8fGMubm9kZU5hbWUudG9Mb3dlckNhc2UoKTpcIlwifSwwLDEsITApO1IoXCJuYW1lXCIsMywhMSwhMCxmdW5jdGlvbihhLGIpe3ZhciBjPWI/UmEoYi5hKGEpKTphLmE7cmV0dXJuIGM/Yy5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpOlwiXCJ9LDAsMSwhMCk7UihcIm5hbWVzcGFjZS11cmlcIiwzLCEwLCExLGZ1bmN0aW9uKCl7cmV0dXJuXCJcIn0sMCwxLCEwKTtcblIoXCJub3JtYWxpemUtc3BhY2VcIiwzLCExLCEwLGZ1bmN0aW9uKGEsYil7cmV0dXJuKGI/TChiLGEpOnooYS5hKSkucmVwbGFjZSgvW1xcc1xceGEwXSsvZyxcIiBcIikucmVwbGFjZSgvXlxccyt8XFxzKyQvZyxcIlwiKX0sMCwxKTtSKFwibm90XCIsMiwhMSwhMSxmdW5jdGlvbihhLGIpe3JldHVybiFNKGIsYSl9LDEpO1IoXCJudW1iZXJcIiwxLCExLCEwLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGI/SyhiLGEpOit6KGEuYSl9LDAsMSk7UihcInBvc2l0aW9uXCIsMSwhMCwhMSxmdW5jdGlvbihhKXtyZXR1cm4gYS5ifSwwKTtSKFwicm91bmRcIiwxLCExLCExLGZ1bmN0aW9uKGEsYil7cmV0dXJuIE1hdGgucm91bmQoSyhiLGEpKX0sMSk7UihcInN0YXJ0cy13aXRoXCIsMiwhMSwhMSxmdW5jdGlvbihhLGIsYyl7Yj1MKGIsYSk7YT1MKGMsYSk7cmV0dXJuIDA9PWIubGFzdEluZGV4T2YoYSwwKX0sMik7UihcInN0cmluZ1wiLDMsITEsITAsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYj9MKGIsYSk6eihhLmEpfSwwLDEpO1xuUihcInN0cmluZy1sZW5ndGhcIiwxLCExLCEwLGZ1bmN0aW9uKGEsYil7cmV0dXJuKGI/TChiLGEpOnooYS5hKSkubGVuZ3RofSwwLDEpO1IoXCJzdWJzdHJpbmdcIiwzLCExLCExLGZ1bmN0aW9uKGEsYixjLGQpe2M9SyhjLGEpO2lmKGlzTmFOKGMpfHxJbmZpbml0eT09Y3x8LUluZmluaXR5PT1jKXJldHVyblwiXCI7ZD1kP0soZCxhKTpJbmZpbml0eTtpZihpc05hTihkKXx8LUluZmluaXR5PT09ZClyZXR1cm5cIlwiO2M9TWF0aC5yb3VuZChjKS0xO3ZhciBlPU1hdGgubWF4KGMsMCk7YT1MKGIsYSk7cmV0dXJuIEluZmluaXR5PT1kP2Euc3Vic3RyaW5nKGUpOmEuc3Vic3RyaW5nKGUsYytNYXRoLnJvdW5kKGQpKX0sMiwzKTtSKFwic3Vic3RyaW5nLWFmdGVyXCIsMywhMSwhMSxmdW5jdGlvbihhLGIsYyl7Yj1MKGIsYSk7YT1MKGMsYSk7Yz1iLmluZGV4T2YoYSk7cmV0dXJuLTE9PWM/XCJcIjpiLnN1YnN0cmluZyhjK2EubGVuZ3RoKX0sMik7XG5SKFwic3Vic3RyaW5nLWJlZm9yZVwiLDMsITEsITEsZnVuY3Rpb24oYSxiLGMpe2I9TChiLGEpO2E9TChjLGEpO2E9Yi5pbmRleE9mKGEpO3JldHVybi0xPT1hP1wiXCI6Yi5zdWJzdHJpbmcoMCxhKX0sMik7UihcInN1bVwiLDEsITEsITEsZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9SChiLmEoYSkpLGQ9MCxlPUkoYyk7ZTtlPUkoYykpZCs9K3ooZSk7cmV0dXJuIGR9LDEsMSwhMCk7UihcInRyYW5zbGF0ZVwiLDMsITEsITEsZnVuY3Rpb24oYSxiLGMsZCl7Yj1MKGIsYSk7Yz1MKGMsYSk7dmFyIGU9TChkLGEpO2E9e307Zm9yKGQ9MDtkPGMubGVuZ3RoO2QrKyl7dmFyIGY9Yy5jaGFyQXQoZCk7ZiBpbiBhfHwoYVtmXT1lLmNoYXJBdChkKSl9Yz1cIlwiO2ZvcihkPTA7ZDxiLmxlbmd0aDtkKyspZj1iLmNoYXJBdChkKSxjKz1mIGluIGE/YVtmXTpmO3JldHVybiBjfSwzKTtSKFwidHJ1ZVwiLDIsITEsITEsZnVuY3Rpb24oKXtyZXR1cm4hMH0sMCk7ZnVuY3Rpb24gRyhhLGIpe3RoaXMuaD1hO3RoaXMuYz12b2lkIDAhPT1iP2I6bnVsbDt0aGlzLmI9bnVsbDtzd2l0Y2goYSl7Y2FzZSBcImNvbW1lbnRcIjp0aGlzLmI9ODticmVhaztjYXNlIFwidGV4dFwiOnRoaXMuYj0zO2JyZWFrO2Nhc2UgXCJwcm9jZXNzaW5nLWluc3RydWN0aW9uXCI6dGhpcy5iPTc7YnJlYWs7Y2FzZSBcIm5vZGVcIjpicmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiVW5leHBlY3RlZCBhcmd1bWVudFwiKTt9fWZ1bmN0aW9uIGRiKGEpe3JldHVyblwiY29tbWVudFwiPT1hfHxcInRleHRcIj09YXx8XCJwcm9jZXNzaW5nLWluc3RydWN0aW9uXCI9PWF8fFwibm9kZVwiPT1hfUcucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGw9PT10aGlzLmJ8fHRoaXMuYj09YS5ub2RlVHlwZX07Ry5wcm90b3R5cGUuZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmh9O1xuRy5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXt2YXIgYT1cIktpbmQgVGVzdDogXCIrdGhpcy5oO251bGw9PT10aGlzLmN8fChhKz1KKHRoaXMuYykpO3JldHVybiBhfTtmdW5jdGlvbiBlYihhKXt0aGlzLmI9YTt0aGlzLmE9MH1mdW5jdGlvbiBmYihhKXthPWEubWF0Y2goZ2IpO2Zvcih2YXIgYj0wO2I8YS5sZW5ndGg7YisrKWhiLnRlc3QoYVtiXSkmJmEuc3BsaWNlKGIsMSk7cmV0dXJuIG5ldyBlYihhKX12YXIgZ2I9L1xcJD8oPzooPyFbMC05LVxcLl0pKD86XFwqfFtcXHctXFwuXSspOik/KD8hWzAtOS1cXC5dKSg/OlxcKnxbXFx3LVxcLl0rKXxcXC9cXC98XFwuXFwufDo6fFxcZCsoPzpcXC5cXGQqKT98XFwuXFxkK3xcIlteXCJdKlwifCdbXiddKid8WyE8Pl09fFxccyt8Li9nLGhiPS9eXFxzLztmdW5jdGlvbiBTKGEsYil7cmV0dXJuIGEuYlthLmErKGJ8fDApXX1mdW5jdGlvbiBUKGEpe3JldHVybiBhLmJbYS5hKytdfWZ1bmN0aW9uIGliKGEpe3JldHVybiBhLmIubGVuZ3RoPD1hLmF9O2Z1bmN0aW9uIGpiKGEpe24uY2FsbCh0aGlzLDMpO3RoaXMuYz1hLnN1YnN0cmluZygxLGEubGVuZ3RoLTEpfW0oamIpO2piLnByb3RvdHlwZS5hPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY307amIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJMaXRlcmFsOiBcIit0aGlzLmN9O2Z1bmN0aW9uIEUoYSxiKXt0aGlzLmo9YS50b0xvd2VyQ2FzZSgpO3ZhciBjO2M9XCIqXCI9PXRoaXMuaj9cIipcIjpcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIjt0aGlzLmM9Yj9iLnRvTG93ZXJDYXNlKCk6Y31FLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3ZhciBiPWEubm9kZVR5cGU7aWYoMSE9YiYmMiE9YilyZXR1cm4hMTtiPXZvaWQgMCE9PWEubG9jYWxOYW1lP2EubG9jYWxOYW1lOmEubm9kZU5hbWU7cmV0dXJuXCIqXCIhPXRoaXMuaiYmdGhpcy5qIT1iLnRvTG93ZXJDYXNlKCk/ITE6XCIqXCI9PXRoaXMuYz8hMDp0aGlzLmM9PShhLm5hbWVzcGFjZVVSST9hLm5hbWVzcGFjZVVSSS50b0xvd2VyQ2FzZSgpOlwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiKX07RS5wcm90b3R5cGUuZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmp9O1xuRS5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIk5hbWUgVGVzdDogXCIrKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiPT10aGlzLmM/XCJcIjp0aGlzLmMrXCI6XCIpK3RoaXMuan07ZnVuY3Rpb24ga2IoYSxiKXtuLmNhbGwodGhpcyxhLmkpO3RoaXMuaD1hO3RoaXMuYz1iO3RoaXMuZz1hLmc7dGhpcy5iPWEuYjtpZigxPT10aGlzLmMubGVuZ3RoKXt2YXIgYz10aGlzLmNbMF07Yy51fHxjLmMhPWxifHwoYz1jLm8sXCIqXCIhPWMuZigpJiYodGhpcy5mPXtuYW1lOmMuZigpLHM6bnVsbH0pKX19bShrYik7ZnVuY3Rpb24gbWIoKXtuLmNhbGwodGhpcyw0KX1tKG1iKTttYi5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXt2YXIgYj1uZXcgQzthPWEuYTs5PT1hLm5vZGVUeXBlP0YoYixhKTpGKGIsYS5vd25lckRvY3VtZW50KTtyZXR1cm4gYn07bWIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJSb290IEhlbHBlciBFeHByZXNzaW9uXCJ9O2Z1bmN0aW9uIG5iKCl7bi5jYWxsKHRoaXMsNCl9bShuYik7bmIucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7dmFyIGI9bmV3IEM7RihiLGEuYSk7cmV0dXJuIGJ9O25iLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVyblwiQ29udGV4dCBIZWxwZXIgRXhwcmVzc2lvblwifTtcbmZ1bmN0aW9uIG9iKGEpe3JldHVyblwiL1wiPT1hfHxcIi8vXCI9PWF9a2IucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5oLmEoYSk7aWYoIShiIGluc3RhbmNlb2YgQykpdGhyb3cgRXJyb3IoXCJGaWx0ZXIgZXhwcmVzc2lvbiBtdXN0IGV2YWx1YXRlIHRvIG5vZGVzZXQuXCIpO2E9dGhpcy5jO2Zvcih2YXIgYz0wLGQ9YS5sZW5ndGg7YzxkJiZiLmw7YysrKXt2YXIgZT1hW2NdLGY9SChiLGUuYy5hKSxnO2lmKGUuZ3x8ZS5jIT1wYilpZihlLmd8fGUuYyE9cWIpZm9yKGc9SShmKSxiPWUuYShuZXcgUShnKSk7bnVsbCE9KGc9SShmKSk7KWc9ZS5hKG5ldyBRKGcpKSxiPVBhKGIsZyk7ZWxzZSBnPUkoZiksYj1lLmEobmV3IFEoZykpO2Vsc2V7Zm9yKGc9SShmKTsoYj1JKGYpKSYmKCFnLmNvbnRhaW5zfHxnLmNvbnRhaW5zKGIpKSYmYi5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihnKSY4O2c9Yik7Yj1lLmEobmV3IFEoZykpfX1yZXR1cm4gYn07XG5rYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXt2YXIgYTthPVwiUGF0aCBFeHByZXNzaW9uOlwiK0oodGhpcy5oKTtpZih0aGlzLmMubGVuZ3RoKXt2YXIgYj10KHRoaXMuYyxmdW5jdGlvbihhLGIpe3JldHVybiBhK0ooYil9LFwiU3RlcHM6XCIpO2ErPUooYil9cmV0dXJuIGF9O2Z1bmN0aW9uIHJiKGEpe24uY2FsbCh0aGlzLDQpO3RoaXMuYz1hO1VhKHRoaXMsamEodGhpcy5jLGZ1bmN0aW9uKGEpe3JldHVybiBhLmd9KSk7VmEodGhpcyxqYSh0aGlzLmMsZnVuY3Rpb24oYSl7cmV0dXJuIGEuYn0pKX1tKHJiKTtyYi5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXt2YXIgYj1uZXcgQztyKHRoaXMuYyxmdW5jdGlvbihjKXtjPWMuYShhKTtpZighKGMgaW5zdGFuY2VvZiBDKSl0aHJvdyBFcnJvcihcIlBhdGggZXhwcmVzc2lvbiBtdXN0IGV2YWx1YXRlIHRvIE5vZGVTZXQuXCIpO2I9UGEoYixjKX0pO3JldHVybiBifTtyYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm4gdCh0aGlzLmMsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYStKKGIpfSxcIlVuaW9uIEV4cHJlc3Npb246XCIpfTtmdW5jdGlvbiBzYihhLGIpe3RoaXMuYT1hO3RoaXMuYj0hIWJ9XG5mdW5jdGlvbiAkYShhLGIsYyl7Zm9yKGM9Y3x8MDtjPGEuYS5sZW5ndGg7YysrKWZvcih2YXIgZD1hLmFbY10sZT1IKGIpLGY9Yi5sLGcsaD0wO2c9SShlKTtoKyspe3ZhciBwPWEuYj9mLWg6aCsxO2c9ZC5hKG5ldyBRKGcscCxmKSk7aWYoXCJudW1iZXJcIj09dHlwZW9mIGcpcD1wPT1nO2Vsc2UgaWYoXCJzdHJpbmdcIj09dHlwZW9mIGd8fFwiYm9vbGVhblwiPT10eXBlb2YgZylwPSEhZztlbHNlIGlmKGcgaW5zdGFuY2VvZiBDKXA9MDxnLmw7ZWxzZSB0aHJvdyBFcnJvcihcIlByZWRpY2F0ZS5ldmFsdWF0ZSByZXR1cm5lZCBhbiB1bmV4cGVjdGVkIHR5cGUuXCIpO2lmKCFwKXtwPWU7Zz1wLmY7dmFyIHk9cC5hO2lmKCF5KXRocm93IEVycm9yKFwiTmV4dCBtdXN0IGJlIGNhbGxlZCBhdCBsZWFzdCBvbmNlIGJlZm9yZSByZW1vdmUuXCIpO3ZhciBEPXkuYix5PXkuYTtEP0QuYT15OmcuYT15O3k/eS5iPUQ6Zy5iPUQ7Zy5sLS07cC5hPW51bGx9fXJldHVybiBifVxuc2IucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHQodGhpcy5hLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGErSihiKX0sXCJQcmVkaWNhdGVzOlwiKX07ZnVuY3Rpb24gVShhLGIsYyxkKXtuLmNhbGwodGhpcyw0KTt0aGlzLmM9YTt0aGlzLm89Yjt0aGlzLmg9Y3x8bmV3IHNiKFtdKTt0aGlzLnU9ISFkO2I9dGhpcy5oO2I9MDxiLmEubGVuZ3RoP2IuYVswXS5mOm51bGw7YS5iJiZiJiYoYT1iLm5hbWUsYT13P2EudG9Mb3dlckNhc2UoKTphLHRoaXMuZj17bmFtZTphLHM6Yi5zfSk7YTp7YT10aGlzLmg7Zm9yKGI9MDtiPGEuYS5sZW5ndGg7YisrKWlmKGM9YS5hW2JdLGMuZ3x8MT09Yy5pfHwwPT1jLmkpe2E9ITA7YnJlYWsgYX1hPSExfXRoaXMuZz1hfW0oVSk7XG5VLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3ZhciBiPWEuYSxjPW51bGwsYz10aGlzLmYsZD1udWxsLGU9bnVsbCxmPTA7YyYmKGQ9Yy5uYW1lLGU9Yy5zP0woYy5zLGEpOm51bGwsZj0xKTtpZih0aGlzLnUpaWYodGhpcy5nfHx0aGlzLmMhPXRiKWlmKGE9SCgobmV3IFUodWIsbmV3IEcoXCJub2RlXCIpKSkuYShhKSksYj1JKGEpKWZvcihjPXRoaXMubShiLGQsZSxmKTtudWxsIT0oYj1JKGEpKTspYz1QYShjLHRoaXMubShiLGQsZSxmKSk7ZWxzZSBjPW5ldyBDO2Vsc2UgYz1CKHRoaXMubyxiLGQsZSksYz0kYSh0aGlzLmgsYyxmKTtlbHNlIGM9dGhpcy5tKGEuYSxkLGUsZik7cmV0dXJuIGN9O1UucHJvdG90eXBlLm09ZnVuY3Rpb24oYSxiLGMsZCl7YT10aGlzLmMuZih0aGlzLm8sYSxiLGMpO3JldHVybiBhPSRhKHRoaXMuaCxhLGQpfTtcblUucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7dmFyIGE7YT1cIlN0ZXA6XCIrSihcIk9wZXJhdG9yOiBcIisodGhpcy51P1wiLy9cIjpcIi9cIikpO3RoaXMuYy5qJiYoYSs9SihcIkF4aXM6IFwiK3RoaXMuYykpO2ErPUoodGhpcy5vKTtpZih0aGlzLmguYS5sZW5ndGgpe3ZhciBiPXQodGhpcy5oLmEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYStKKGIpfSxcIlByZWRpY2F0ZXM6XCIpO2ErPUooYil9cmV0dXJuIGF9O2Z1bmN0aW9uIHZiKGEsYixjLGQpe3RoaXMuaj1hO3RoaXMuZj1iO3RoaXMuYT1jO3RoaXMuYj1kfXZiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmp9O3ZhciB3Yj17fTtmdW5jdGlvbiBWKGEsYixjLGQpe2lmKHdiLmhhc093blByb3BlcnR5KGEpKXRocm93IEVycm9yKFwiQXhpcyBhbHJlYWR5IGNyZWF0ZWQ6IFwiK2EpO2I9bmV3IHZiKGEsYixjLCEhZCk7cmV0dXJuIHdiW2FdPWJ9XG5WKFwiYW5jZXN0b3JcIixmdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1uZXcgQyxkPWI7ZD1kLnBhcmVudE5vZGU7KWEuYShkKSYmUWEoYyxkKTtyZXR1cm4gY30sITApO1YoXCJhbmNlc3Rvci1vci1zZWxmXCIsZnVuY3Rpb24oYSxiKXt2YXIgYz1uZXcgQyxkPWI7ZG8gYS5hKGQpJiZRYShjLGQpO3doaWxlKGQ9ZC5wYXJlbnROb2RlKTtyZXR1cm4gY30sITApO1xudmFyIGxiPVYoXCJhdHRyaWJ1dGVcIixmdW5jdGlvbihhLGIpe3ZhciBjPW5ldyBDLGQ9YS5mKCk7aWYoXCJzdHlsZVwiPT1kJiZ3JiZiLnN0eWxlKXJldHVybiBGKGMsbmV3IHgoYi5zdHlsZSxiLFwic3R5bGVcIixiLnN0eWxlLmNzc1RleHQpKSxjO3ZhciBlPWIuYXR0cmlidXRlcztpZihlKWlmKGEgaW5zdGFuY2VvZiBHJiZudWxsPT09YS5ifHxcIipcIj09ZClmb3IodmFyIGQ9MCxmO2Y9ZVtkXTtkKyspdz9mLm5vZGVWYWx1ZSYmRihjLERhKGIsZikpOkYoYyxmKTtlbHNlKGY9ZS5nZXROYW1lZEl0ZW0oZCkpJiYodz9mLm5vZGVWYWx1ZSYmRihjLERhKGIsZikpOkYoYyxmKSk7cmV0dXJuIGN9LCExKSx0Yj1WKFwiY2hpbGRcIixmdW5jdGlvbihhLGIsYyxkLGUpe3JldHVybih3P0lhOkphKS5jYWxsKG51bGwsYSxiLGwoYyk/YzpudWxsLGwoZCk/ZDpudWxsLGV8fG5ldyBDKX0sITEsITApO1YoXCJkZXNjZW5kYW50XCIsQiwhMSwhMCk7XG52YXIgdWI9VihcImRlc2NlbmRhbnQtb3Itc2VsZlwiLGZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPW5ldyBDO0EoYixjLGQpJiZhLmEoYikmJkYoZSxiKTtyZXR1cm4gQihhLGIsYyxkLGUpfSwhMSwhMCkscGI9VihcImZvbGxvd2luZ1wiLGZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPW5ldyBDO2RvIGZvcih2YXIgZj1iO2Y9Zi5uZXh0U2libGluZzspQShmLGMsZCkmJmEuYShmKSYmRihlLGYpLGU9QihhLGYsYyxkLGUpO3doaWxlKGI9Yi5wYXJlbnROb2RlKTtyZXR1cm4gZX0sITEsITApO1YoXCJmb2xsb3dpbmctc2libGluZ1wiLGZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPW5ldyBDLGQ9YjtkPWQubmV4dFNpYmxpbmc7KWEuYShkKSYmRihjLGQpO3JldHVybiBjfSwhMSk7VihcIm5hbWVzcGFjZVwiLGZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBDfSwhMSk7XG52YXIgeGI9VihcInBhcmVudFwiLGZ1bmN0aW9uKGEsYil7dmFyIGM9bmV3IEM7aWYoOT09Yi5ub2RlVHlwZSlyZXR1cm4gYztpZigyPT1iLm5vZGVUeXBlKXJldHVybiBGKGMsYi5vd25lckVsZW1lbnQpLGM7dmFyIGQ9Yi5wYXJlbnROb2RlO2EuYShkKSYmRihjLGQpO3JldHVybiBjfSwhMSkscWI9VihcInByZWNlZGluZ1wiLGZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPW5ldyBDLGY9W107ZG8gZi51bnNoaWZ0KGIpO3doaWxlKGI9Yi5wYXJlbnROb2RlKTtmb3IodmFyIGc9MSxoPWYubGVuZ3RoO2c8aDtnKyspe3ZhciBwPVtdO2ZvcihiPWZbZ107Yj1iLnByZXZpb3VzU2libGluZzspcC51bnNoaWZ0KGIpO2Zvcih2YXIgeT0wLEQ9cC5sZW5ndGg7eTxEO3krKyliPXBbeV0sQShiLGMsZCkmJmEuYShiKSYmRihlLGIpLGU9QihhLGIsYyxkLGUpfXJldHVybiBlfSwhMCwhMCk7XG5WKFwicHJlY2VkaW5nLXNpYmxpbmdcIixmdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1uZXcgQyxkPWI7ZD1kLnByZXZpb3VzU2libGluZzspYS5hKGQpJiZRYShjLGQpO3JldHVybiBjfSwhMCk7dmFyIHliPVYoXCJzZWxmXCIsZnVuY3Rpb24oYSxiKXt2YXIgYz1uZXcgQzthLmEoYikmJkYoYyxiKTtyZXR1cm4gY30sITEpO2Z1bmN0aW9uIHpiKGEpe24uY2FsbCh0aGlzLDEpO3RoaXMuYz1hO3RoaXMuZz1hLmc7dGhpcy5iPWEuYn1tKHpiKTt6Yi5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXtyZXR1cm4tSyh0aGlzLmMsYSl9O3piLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVyblwiVW5hcnkgRXhwcmVzc2lvbjogLVwiK0oodGhpcy5jKX07ZnVuY3Rpb24gQWIoYSl7bi5jYWxsKHRoaXMsMSk7dGhpcy5jPWF9bShBYik7QWIucHJvdG90eXBlLmE9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jfTtBYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIk51bWJlcjogXCIrdGhpcy5jfTtmdW5jdGlvbiBCYihhLGIpe3RoaXMuYT1hO3RoaXMuYj1ifWZ1bmN0aW9uIENiKGEpe2Zvcih2YXIgYixjPVtdOzspe1coYSxcIk1pc3NpbmcgcmlnaHQgaGFuZCBzaWRlIG9mIGJpbmFyeSBleHByZXNzaW9uLlwiKTtiPURiKGEpO3ZhciBkPVQoYS5hKTtpZighZClicmVhazt2YXIgZT0oZD1ZYVtkXXx8bnVsbCkmJmQudztpZighZSl7YS5hLmEtLTticmVha31mb3IoO2MubGVuZ3RoJiZlPD1jW2MubGVuZ3RoLTFdLnc7KWI9bmV3IE4oYy5wb3AoKSxjLnBvcCgpLGIpO2MucHVzaChiLGQpfWZvcig7Yy5sZW5ndGg7KWI9bmV3IE4oYy5wb3AoKSxjLnBvcCgpLGIpO3JldHVybiBifWZ1bmN0aW9uIFcoYSxiKXtpZihpYihhLmEpKXRocm93IEVycm9yKGIpO31mdW5jdGlvbiBFYihhLGIpe3ZhciBjPVQoYS5hKTtpZihjIT1iKXRocm93IEVycm9yKFwiQmFkIHRva2VuLCBleHBlY3RlZDogXCIrYitcIiBnb3Q6IFwiK2MpO31cbmZ1bmN0aW9uIEZiKGEpe2E9VChhLmEpO2lmKFwiKVwiIT1hKXRocm93IEVycm9yKFwiQmFkIHRva2VuOiBcIithKTt9ZnVuY3Rpb24gR2IoYSl7YT1UKGEuYSk7aWYoMj5hLmxlbmd0aCl0aHJvdyBFcnJvcihcIlVuY2xvc2VkIGxpdGVyYWwgc3RyaW5nXCIpO3JldHVybiBuZXcgamIoYSl9XG5mdW5jdGlvbiBIYihhKXt2YXIgYixjPVtdLGQ7aWYob2IoUyhhLmEpKSl7Yj1UKGEuYSk7ZD1TKGEuYSk7aWYoXCIvXCI9PWImJihpYihhLmEpfHxcIi5cIiE9ZCYmXCIuLlwiIT1kJiZcIkBcIiE9ZCYmXCIqXCIhPWQmJiEvKD8hWzAtOV0pW1xcd10vLnRlc3QoZCkpKXJldHVybiBuZXcgbWI7ZD1uZXcgbWI7VyhhLFwiTWlzc2luZyBuZXh0IGxvY2F0aW9uIHN0ZXAuXCIpO2I9SWIoYSxiKTtjLnB1c2goYil9ZWxzZXthOntiPVMoYS5hKTtkPWIuY2hhckF0KDApO3N3aXRjaChkKXtjYXNlIFwiJFwiOnRocm93IEVycm9yKFwiVmFyaWFibGUgcmVmZXJlbmNlIG5vdCBhbGxvd2VkIGluIEhUTUwgWFBhdGhcIik7Y2FzZSBcIihcIjpUKGEuYSk7Yj1DYihhKTtXKGEsJ3VuY2xvc2VkIFwiKFwiJyk7RWIoYSxcIilcIik7YnJlYWs7Y2FzZSAnXCInOmNhc2UgXCInXCI6Yj1HYihhKTticmVhaztkZWZhdWx0OmlmKGlzTmFOKCtiKSlpZighZGIoYikmJi8oPyFbMC05XSlbXFx3XS8udGVzdChkKSYmXCIoXCI9PVMoYS5hLDEpKXtiPVQoYS5hKTtcbmI9Y2JbYl18fG51bGw7VChhLmEpO2ZvcihkPVtdO1wiKVwiIT1TKGEuYSk7KXtXKGEsXCJNaXNzaW5nIGZ1bmN0aW9uIGFyZ3VtZW50IGxpc3QuXCIpO2QucHVzaChDYihhKSk7aWYoXCIsXCIhPVMoYS5hKSlicmVhaztUKGEuYSl9VyhhLFwiVW5jbG9zZWQgZnVuY3Rpb24gYXJndW1lbnQgbGlzdC5cIik7RmIoYSk7Yj1uZXcgYWIoYixkKX1lbHNle2I9bnVsbDticmVhayBhfWVsc2UgYj1uZXcgQWIoK1QoYS5hKSl9XCJbXCI9PVMoYS5hKSYmKGQ9bmV3IHNiKEpiKGEpKSxiPW5ldyBaYShiLGQpKX1pZihiKWlmKG9iKFMoYS5hKSkpZD1iO2Vsc2UgcmV0dXJuIGI7ZWxzZSBiPUliKGEsXCIvXCIpLGQ9bmV3IG5iLGMucHVzaChiKX1mb3IoO29iKFMoYS5hKSk7KWI9VChhLmEpLFcoYSxcIk1pc3NpbmcgbmV4dCBsb2NhdGlvbiBzdGVwLlwiKSxiPUliKGEsYiksYy5wdXNoKGIpO3JldHVybiBuZXcga2IoZCxjKX1cbmZ1bmN0aW9uIEliKGEsYil7dmFyIGMsZCxlO2lmKFwiL1wiIT1iJiZcIi8vXCIhPWIpdGhyb3cgRXJyb3IoJ1N0ZXAgb3Agc2hvdWxkIGJlIFwiL1wiIG9yIFwiLy9cIicpO2lmKFwiLlwiPT1TKGEuYSkpcmV0dXJuIGQ9bmV3IFUoeWIsbmV3IEcoXCJub2RlXCIpKSxUKGEuYSksZDtpZihcIi4uXCI9PVMoYS5hKSlyZXR1cm4gZD1uZXcgVSh4YixuZXcgRyhcIm5vZGVcIikpLFQoYS5hKSxkO3ZhciBmO2lmKFwiQFwiPT1TKGEuYSkpZj1sYixUKGEuYSksVyhhLFwiTWlzc2luZyBhdHRyaWJ1dGUgbmFtZVwiKTtlbHNlIGlmKFwiOjpcIj09UyhhLmEsMSkpe2lmKCEvKD8hWzAtOV0pW1xcd10vLnRlc3QoUyhhLmEpLmNoYXJBdCgwKSkpdGhyb3cgRXJyb3IoXCJCYWQgdG9rZW46IFwiK1QoYS5hKSk7Yz1UKGEuYSk7Zj13YltjXXx8bnVsbDtpZighZil0aHJvdyBFcnJvcihcIk5vIGF4aXMgd2l0aCBuYW1lOiBcIitjKTtUKGEuYSk7VyhhLFwiTWlzc2luZyBub2RlIG5hbWVcIil9ZWxzZSBmPXRiO2M9UyhhLmEpO2lmKC8oPyFbMC05XSlbXFx3XFwqXS8udGVzdChjLmNoYXJBdCgwKSkpaWYoXCIoXCI9PVxuUyhhLmEsMSkpe2lmKCFkYihjKSl0aHJvdyBFcnJvcihcIkludmFsaWQgbm9kZSB0eXBlOiBcIitjKTtjPVQoYS5hKTtpZighZGIoYykpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIHR5cGUgbmFtZTogXCIrYyk7RWIoYSxcIihcIik7VyhhLFwiQmFkIG5vZGV0eXBlXCIpO2U9UyhhLmEpLmNoYXJBdCgwKTt2YXIgZz1udWxsO2lmKCdcIic9PWV8fFwiJ1wiPT1lKWc9R2IoYSk7VyhhLFwiQmFkIG5vZGV0eXBlXCIpO0ZiKGEpO2M9bmV3IEcoYyxnKX1lbHNlIGlmKGM9VChhLmEpLGU9Yy5pbmRleE9mKFwiOlwiKSwtMT09ZSljPW5ldyBFKGMpO2Vsc2V7dmFyIGc9Yy5zdWJzdHJpbmcoMCxlKSxoO2lmKFwiKlwiPT1nKWg9XCIqXCI7ZWxzZSBpZihoPWEuYihnKSwhaCl0aHJvdyBFcnJvcihcIk5hbWVzcGFjZSBwcmVmaXggbm90IGRlY2xhcmVkOiBcIitnKTtjPWMuc3Vic3RyKGUrMSk7Yz1uZXcgRShjLGgpfWVsc2UgdGhyb3cgRXJyb3IoXCJCYWQgdG9rZW46IFwiK1QoYS5hKSk7ZT1uZXcgc2IoSmIoYSksZi5hKTtyZXR1cm4gZHx8XG5uZXcgVShmLGMsZSxcIi8vXCI9PWIpfWZ1bmN0aW9uIEpiKGEpe2Zvcih2YXIgYj1bXTtcIltcIj09UyhhLmEpOyl7VChhLmEpO1coYSxcIk1pc3NpbmcgcHJlZGljYXRlIGV4cHJlc3Npb24uXCIpO3ZhciBjPUNiKGEpO2IucHVzaChjKTtXKGEsXCJVbmNsb3NlZCBwcmVkaWNhdGUgZXhwcmVzc2lvbi5cIik7RWIoYSxcIl1cIil9cmV0dXJuIGJ9ZnVuY3Rpb24gRGIoYSl7aWYoXCItXCI9PVMoYS5hKSlyZXR1cm4gVChhLmEpLG5ldyB6YihEYihhKSk7dmFyIGI9SGIoYSk7aWYoXCJ8XCIhPVMoYS5hKSlhPWI7ZWxzZXtmb3IoYj1bYl07XCJ8XCI9PVQoYS5hKTspVyhhLFwiTWlzc2luZyBuZXh0IHVuaW9uIGxvY2F0aW9uIHBhdGguXCIpLGIucHVzaChIYihhKSk7YS5hLmEtLTthPW5ldyByYihiKX1yZXR1cm4gYX07ZnVuY3Rpb24gS2IoYSl7c3dpdGNoKGEubm9kZVR5cGUpe2Nhc2UgMTpyZXR1cm4gZWEoTGIsYSk7Y2FzZSA5OnJldHVybiBLYihhLmRvY3VtZW50RWxlbWVudCk7Y2FzZSAxMTpjYXNlIDEwOmNhc2UgNjpjYXNlIDEyOnJldHVybiBNYjtkZWZhdWx0OnJldHVybiBhLnBhcmVudE5vZGU/S2IoYS5wYXJlbnROb2RlKTpNYn19ZnVuY3Rpb24gTWIoKXtyZXR1cm4gbnVsbH1mdW5jdGlvbiBMYihhLGIpe2lmKGEucHJlZml4PT1iKXJldHVybiBhLm5hbWVzcGFjZVVSSXx8XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7dmFyIGM9YS5nZXRBdHRyaWJ1dGVOb2RlKFwieG1sbnM6XCIrYik7cmV0dXJuIGMmJmMuc3BlY2lmaWVkP2MudmFsdWV8fG51bGw6YS5wYXJlbnROb2RlJiY5IT1hLnBhcmVudE5vZGUubm9kZVR5cGU/TGIoYS5wYXJlbnROb2RlLGIpOm51bGx9O2Z1bmN0aW9uIE5iKGEsYil7aWYoIWEubGVuZ3RoKXRocm93IEVycm9yKFwiRW1wdHkgWFBhdGggZXhwcmVzc2lvbi5cIik7dmFyIGM9ZmIoYSk7aWYoaWIoYykpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIFhQYXRoIGV4cHJlc3Npb24uXCIpO2I/XCJmdW5jdGlvblwiPT1hYShiKXx8KGI9ZGEoYi5sb29rdXBOYW1lc3BhY2VVUkksYikpOmI9ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbH07dmFyIGQ9Q2IobmV3IEJiKGMsYikpO2lmKCFpYihjKSl0aHJvdyBFcnJvcihcIkJhZCB0b2tlbjogXCIrVChjKSk7dGhpcy5ldmFsdWF0ZT1mdW5jdGlvbihhLGIpe3ZhciBjPWQuYShuZXcgUShhKSk7cmV0dXJuIG5ldyBZKGMsYil9fVxuZnVuY3Rpb24gWShhLGIpe2lmKDA9PWIpaWYoYSBpbnN0YW5jZW9mIEMpYj00O2Vsc2UgaWYoXCJzdHJpbmdcIj09dHlwZW9mIGEpYj0yO2Vsc2UgaWYoXCJudW1iZXJcIj09dHlwZW9mIGEpYj0xO2Vsc2UgaWYoXCJib29sZWFuXCI9PXR5cGVvZiBhKWI9MztlbHNlIHRocm93IEVycm9yKFwiVW5leHBlY3RlZCBldmFsdWF0aW9uIHJlc3VsdC5cIik7aWYoMiE9YiYmMSE9YiYmMyE9YiYmIShhIGluc3RhbmNlb2YgQykpdGhyb3cgRXJyb3IoXCJ2YWx1ZSBjb3VsZCBub3QgYmUgY29udmVydGVkIHRvIHRoZSBzcGVjaWZpZWQgdHlwZVwiKTt0aGlzLnJlc3VsdFR5cGU9Yjt2YXIgYztzd2l0Y2goYil7Y2FzZSAyOnRoaXMuc3RyaW5nVmFsdWU9YSBpbnN0YW5jZW9mIEM/U2EoYSk6XCJcIithO2JyZWFrO2Nhc2UgMTp0aGlzLm51bWJlclZhbHVlPWEgaW5zdGFuY2VvZiBDPytTYShhKTorYTticmVhaztjYXNlIDM6dGhpcy5ib29sZWFuVmFsdWU9YSBpbnN0YW5jZW9mIEM/MDxhLmw6ISFhO2JyZWFrO2Nhc2UgNDpjYXNlIDU6Y2FzZSA2OmNhc2UgNzp2YXIgZD1cbkgoYSk7Yz1bXTtmb3IodmFyIGU9SShkKTtlO2U9SShkKSljLnB1c2goZSBpbnN0YW5jZW9mIHg/ZS5hOmUpO3RoaXMuc25hcHNob3RMZW5ndGg9YS5sO3RoaXMuaW52YWxpZEl0ZXJhdG9yU3RhdGU9ITE7YnJlYWs7Y2FzZSA4OmNhc2UgOTpkPVJhKGEpO3RoaXMuc2luZ2xlTm9kZVZhbHVlPWQgaW5zdGFuY2VvZiB4P2QuYTpkO2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJVbmtub3duIFhQYXRoUmVzdWx0IHR5cGUuXCIpO312YXIgZj0wO3RoaXMuaXRlcmF0ZU5leHQ9ZnVuY3Rpb24oKXtpZig0IT1iJiY1IT1iKXRocm93IEVycm9yKFwiaXRlcmF0ZU5leHQgY2FsbGVkIHdpdGggd3JvbmcgcmVzdWx0IHR5cGVcIik7cmV0dXJuIGY+PWMubGVuZ3RoP251bGw6Y1tmKytdfTt0aGlzLnNuYXBzaG90SXRlbT1mdW5jdGlvbihhKXtpZig2IT1iJiY3IT1iKXRocm93IEVycm9yKFwic25hcHNob3RJdGVtIGNhbGxlZCB3aXRoIHdyb25nIHJlc3VsdCB0eXBlXCIpO3JldHVybiBhPj1jLmxlbmd0aHx8XG4wPmE/bnVsbDpjW2FdfX1ZLkFOWV9UWVBFPTA7WS5OVU1CRVJfVFlQRT0xO1kuU1RSSU5HX1RZUEU9MjtZLkJPT0xFQU5fVFlQRT0zO1kuVU5PUkRFUkVEX05PREVfSVRFUkFUT1JfVFlQRT00O1kuT1JERVJFRF9OT0RFX0lURVJBVE9SX1RZUEU9NTtZLlVOT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEU9NjtZLk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFPTc7WS5BTllfVU5PUkRFUkVEX05PREVfVFlQRT04O1kuRklSU1RfT1JERVJFRF9OT0RFX1RZUEU9OTtmdW5jdGlvbiBPYihhKXt0aGlzLmxvb2t1cE5hbWVzcGFjZVVSST1LYihhKX1cbmZ1bmN0aW9uIFBiKGEsYil7dmFyIGM9YXx8ayxkPWMuRG9jdW1lbnQmJmMuRG9jdW1lbnQucHJvdG90eXBlfHxjLmRvY3VtZW50O2lmKCFkLmV2YWx1YXRlfHxiKWMuWFBhdGhSZXN1bHQ9WSxkLmV2YWx1YXRlPWZ1bmN0aW9uKGEsYixjLGQpe3JldHVybihuZXcgTmIoYSxjKSkuZXZhbHVhdGUoYixkKX0sZC5jcmVhdGVFeHByZXNzaW9uPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG5ldyBOYihhLGIpfSxkLmNyZWF0ZU5TUmVzb2x2ZXI9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBPYihhKX19dmFyIFFiPVtcIndneHBhdGhcIixcImluc3RhbGxcIl0sWj1rO1FiWzBdaW4gWnx8IVouZXhlY1NjcmlwdHx8Wi5leGVjU2NyaXB0KFwidmFyIFwiK1FiWzBdKTtmb3IodmFyIFJiO1FiLmxlbmd0aCYmKFJiPVFiLnNoaWZ0KCkpOylRYi5sZW5ndGh8fHZvaWQgMD09PVBiP1pbUmJdP1o9WltSYl06Wj1aW1JiXT17fTpaW1JiXT1QYjttb2R1bGUuZXhwb3J0cy5pbnN0YWxsPVBiO21vZHVsZS5leHBvcnRzLlhQYXRoUmVzdWx0VHlwZT17QU5ZX1RZUEU6MCxOVU1CRVJfVFlQRToxLFNUUklOR19UWVBFOjIsQk9PTEVBTl9UWVBFOjMsVU5PUkRFUkVEX05PREVfSVRFUkFUT1JfVFlQRTo0LE9SREVSRURfTk9ERV9JVEVSQVRPUl9UWVBFOjUsVU5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRTo2LE9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFOjcsQU5ZX1VOT1JERVJFRF9OT0RFX1RZUEU6OCxGSVJTVF9PUkRFUkVEX05PREVfVFlQRTo5fTt9KS5jYWxsKGdsb2JhbClcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIGRvY1JlYWR5ID0gcmVxdWlyZSgnZG9jLXJlYWR5Jyk7XG52YXIgQ29ubmV4aW9uID0gcmVxdWlyZSgnLi9odHRwL0Nvbm5leGlvbicpO1xuLyoqXG4gKiBNYWluIEJvb3RMb2FkZXIuXG4gKi9cblxudmFyIFB5ZGlvQm9vdHN0cmFwID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHN0YXJ0UGFyYW1ldGVycyBPYmplY3QgVGhlIG9wdGlvbnNcbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIFB5ZGlvQm9vdHN0cmFwKHN0YXJ0UGFyYW1ldGVycykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQeWRpb0Jvb3RzdHJhcCk7XG5cbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKHZhciBpIGluIHN0YXJ0UGFyYW1ldGVycykge1xuICAgICAgICAgICAgaWYgKHN0YXJ0UGFyYW1ldGVycy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycy5zZXQoaSwgc3RhcnRQYXJhbWV0ZXJzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRldGVjdEJhc2VQYXJhbWV0ZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoXCJBTEVSVFwiKSkge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5hbGVydChfdGhpcy5wYXJhbWV0ZXJzLmdldChcIkFMRVJUXCIpKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jUmVhZHkoKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIHN0YXJ0ZWRGcm9tT3BlbmVyID0gZmFsc2U7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cub3BlbmVyICYmIHdpbmRvdy5vcGVuZXIucHlkaW9Cb290c3RyYXAgJiYgdGhpcy5wYXJhbWV0ZXJzLmdldCgnc2VydmVyQWNjZXNzUGF0aCcpID09PSB3aW5kb3cub3BlbmVyLnB5ZGlvQm9vdHN0cmFwLnBhcmFtZXRlcnMuZ2V0KCdzZXJ2ZXJBY2Nlc3NQYXRoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzID0gd2luZG93Lm9wZW5lci5weWRpb0Jvb3RzdHJhcC5wYXJhbWV0ZXJzO1xuICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgcXVlcnlTdHJpbmcgY2FzZSwgYXMgaXQncyBub3QgcGFzc2VkIHZpYSBnZXRfYm9vdF9jb25mXG4gICAgICAgICAgICAgICAgICAgIHZhciBxUGFyYW1zID0gZG9jdW1lbnQubG9jYXRpb24uaHJlZi50b1F1ZXJ5UGFyYW1zKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxUGFyYW1zWydleHRlcm5hbF9zZWxlY3Rvcl90eXBlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycy5zZXQoJ1NFTEVDVE9SX0RBVEEnLCB7IHR5cGU6IHFQYXJhbXNbJ2V4dGVybmFsX3NlbGVjdG9yX3R5cGUnXSwgZGF0YTogcVBhcmFtcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KCdTRUxFQ1RPUl9EQVRBJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMudW5zZXQoJ1NFTEVDVE9SX0RBVEEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hDb250ZXh0VmFyaWFibGVzQW5kSW5pdChuZXcgQ29ubmV4aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICBzdGFydGVkRnJvbU9wZW5lciA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmxvZykgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXN0YXJ0ZWRGcm9tT3BlbmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkQm9vdENvbmZpZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB3aW5kb3cuQ29ubmV4aW9uID0gQ29ubmV4aW9uO1xuICAgICAgICB3aW5kb3cucHlkaW9Cb290c3RyYXAgPSB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWwgbG9hZGluZyBhY3Rpb25cbiAgICAgKi9cblxuICAgIFB5ZGlvQm9vdHN0cmFwLnByb3RvdHlwZS5sb2FkQm9vdENvbmZpZyA9IGZ1bmN0aW9uIGxvYWRCb290Q29uZmlnKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldCgnUFJFTE9BREVEX0JPT1RfQ09ORicpKSB7XG4gICAgICAgICAgICB2YXIgcHJlbG9hZGVkID0gdGhpcy5wYXJhbWV0ZXJzLmdldCgnUFJFTE9BREVEX0JPT1RfQ09ORicpO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBwcmVsb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJlbG9hZGVkLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycy5zZXQoaywgcHJlbG9hZGVkW2tdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hDb250ZXh0VmFyaWFibGVzQW5kSW5pdChuZXcgQ29ubmV4aW9uKCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVybCA9IHRoaXMucGFyYW1ldGVycy5nZXQoJ0JPT1RFUl9VUkwnKSArICh0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiZGVidWdNb2RlXCIpID8gJyZkZWJ1Zz10cnVlJyA6ICcnKTtcbiAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoJ1NFUlZFUl9QUkVGSVhfVVJJJykpIHtcbiAgICAgICAgICAgIHVybCArPSAnJnNlcnZlcl9wcmVmaXhfdXJpPScgKyB0aGlzLnBhcmFtZXRlcnMuZ2V0KCdTRVJWRVJfUFJFRklYX1VSSScpLnJlcGxhY2UoL1xcLlxcLlxcLy9nLCBcIl9VUF8vXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb25uZXhpb24gPSBuZXcgQ29ubmV4aW9uKHVybCk7XG4gICAgICAgIGNvbm5leGlvbi5vbkNvbXBsZXRlID0gZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodHJhbnNwb3J0LnJlc3BvbnNlSlNPTikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSB0cmFuc3BvcnQucmVzcG9uc2VKU09OO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5wYXJhbWV0ZXJzLnNldChrZXksIGRhdGFba2V5XSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpczIucmVmcmVzaENvbnRleHRWYXJpYWJsZXNBbmRJbml0KGNvbm5leGlvbik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbm5leGlvbi5zZW5kKCk7XG4gICAgfTtcblxuICAgIFB5ZGlvQm9vdHN0cmFwLnByb3RvdHlwZS5yZWZyZXNoQ29udGV4dFZhcmlhYmxlc0FuZEluaXQgPSBmdW5jdGlvbiByZWZyZXNoQ29udGV4dFZhcmlhYmxlc0FuZEluaXQoY29ubmV4aW9uKSB7XG5cbiAgICAgICAgLy9Db25uZXhpb24udXBkYXRlU2VydmVyQWNjZXNzKHRoaXMucGFyYW1ldGVycyk7XG5cbiAgICAgICAgdmFyIGNzc1JlcyA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJjc3NSZXNvdXJjZXNcIik7XG4gICAgICAgIGlmIChjc3NSZXMpIHtcbiAgICAgICAgICAgIGNzc1Jlcy5tYXAodGhpcy5sb2FkQ1NTUmVzb3VyY2UuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldCgnYWp4cFJlc291cmNlc0ZvbGRlcicpKSB7XG4gICAgICAgICAgICBjb25uZXhpb24uX2xpYlVybCA9IHRoaXMucGFyYW1ldGVycy5nZXQoJ2FqeHBSZXNvdXJjZXNGb2xkZXInKSArIFwiL2J1aWxkXCI7XG4gICAgICAgICAgICB3aW5kb3cuYWp4cFJlc291cmNlc0ZvbGRlciA9IHRoaXMucGFyYW1ldGVycy5nZXQoJ2FqeHBSZXNvdXJjZXNGb2xkZXInKSArIFwiL3RoZW1lcy9cIiArIHRoaXMucGFyYW1ldGVycy5nZXQoXCJ0aGVtZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KCdhZGRpdGlvbmFsX2pzX3Jlc291cmNlJykpIHtcbiAgICAgICAgICAgIGNvbm5leGlvbi5sb2FkTGlicmFyeSh0aGlzLnBhcmFtZXRlcnMuZ2V0KCdhZGRpdGlvbmFsX2pzX3Jlc291cmNlP3Y9JyArIHRoaXMucGFyYW1ldGVycy5nZXQoXCJhanhwVmVyc2lvblwiKSksIG51bGwsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy90aGlzLmluc2VydExvYWRlclByb2dyZXNzKCk7XG4gICAgICAgIHdpbmRvdy5NZXNzYWdlSGFzaCA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJpMThuTWVzc2FnZXNcIik7XG4gICAgICAgIGlmICghT2JqZWN0LmtleXMoTWVzc2FnZUhhc2gpLmxlbmd0aCkge1xuICAgICAgICAgICAgYWxlcnQoJ09vdXBzLCB0aGlzIHNob3VsZCBub3QgaGFwcGVuLCB5b3VyIG1lc3NhZ2UgZmlsZSBpcyBlbXB0eSEnKTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3Qua2V5cyhNZXNzYWdlSGFzaCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBNZXNzYWdlSGFzaFtrZXldID0gTWVzc2FnZUhhc2hba2V5XS5yZXBsYWNlKFwiXFxcXG5cIiwgXCJcXG5cIik7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuemlwRW5hYmxlZCA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJ6aXBFbmFibGVkXCIpO1xuICAgICAgICB3aW5kb3cubXVsdGlwbGVGaWxlc0Rvd25sb2FkRW5hYmxlZCA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJtdWx0aXBsZUZpbGVzRG93bmxvYWRFbmFibGVkXCIpO1xuXG4gICAgICAgIHZhciBtYXN0ZXJDbGFzc0xvYWRlZCA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IG5ldyBQeWRpbyh0aGlzLnBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgd2luZG93LnB5ZGlvID0gcHlkaW87XG5cbiAgICAgICAgICAgIHB5ZGlvLm9ic2VydmUoXCJhY3Rpb25zX2xvYWRlZFwiLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wYXJhbWV0ZXJzLmdldChcIlNFTEVDVE9SX0RBVEFcIikgJiYgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmFjdGlvbnMuZ2V0KFwiZXh0X3NlbGVjdFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHlkaW8uZ2V0Q29udHJvbGxlcigpLmFjdGlvbnMuX29iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmFjdGlvbnMudW5zZXQoXCJleHRfc2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmFjdGlvbnNbJ2RlbGV0ZSddKFwiZXh0X3NlbGVjdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuZmlyZUNvbnRleHRDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmZpcmVTZWxlY3Rpb25DaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoXCJTRUxFQ1RPUl9EQVRBXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5kZWZhdWx0QWN0aW9ucy5zZXQoXCJmaWxlXCIsIFwiZXh0X3NlbGVjdFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgcHlkaW8ub2JzZXJ2ZShcImxvYWRlZFwiLCAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldChcIlNFTEVDVE9SX0RBVEFcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmRlZmF1bHRBY3Rpb25zLnNldChcImZpbGVcIiwgXCJleHRfc2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuc2VsZWN0b3JEYXRhID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcIlNFTEVDVE9SX0RBVEFcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiY3VycmVudExhbmd1YWdlXCIpKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8uY3VycmVudExhbmd1YWdlID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcImN1cnJlbnRMYW5ndWFnZVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHlkaW8uaW5pdCgpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiZGVidWdNb2RlXCIpKSB7XG4gICAgICAgICAgICBtYXN0ZXJDbGFzc0xvYWRlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29ubmV4aW9uLmxvYWRMaWJyYXJ5KFwicHlkaW8ubWluLmpzP3Y9XCIgKyB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFZlcnNpb25cIiksIG1hc3RlckNsYXNzTG9hZGVkLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgdGhlIGJhc2UgcGF0aCBvZiB0aGUgamF2YXNjcmlwdHMgYmFzZWQgb24gdGhlIHNjcmlwdCB0YWdzXG4gICAgICovXG5cbiAgICBQeWRpb0Jvb3RzdHJhcC5wcm90b3R5cGUuZGV0ZWN0QmFzZVBhcmFtZXRlcnMgPSBmdW5jdGlvbiBkZXRlY3RCYXNlUGFyYW1ldGVycygpIHtcblxuICAgICAgICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc2NyaXB0VGFnID0gc2NyaXB0c1tpXTtcbiAgICAgICAgICAgIGlmIChzY3JpcHRUYWcuc3JjLm1hdGNoKFwiL2J1aWxkL3B5ZGlvLmJvb3QubWluLmpzXCIpIHx8IHNjcmlwdFRhZy5zcmMubWF0Y2goXCIvYnVpbGQvYm9vdC5wcm9kLmpzXCIpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNjcmlwdFRhZy5zcmMubWF0Y2goXCIvYnVpbGQvcHlkaW8uYm9vdC5taW4uanNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldChcImRlYnVnTW9kZVwiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldChcImRlYnVnTW9kZVwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHNyYyA9IHNjcmlwdFRhZy5zcmMucmVwbGFjZSgnL2J1aWxkL2Jvb3QucHJvZC5qcycsICcnKS5yZXBsYWNlKCcvYnVpbGQvcHlkaW8uYm9vdC5taW4uanMnLCAnJyk7XG4gICAgICAgICAgICAgICAgaWYgKHNyYy5pbmRleE9mKFwiP1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjLnNwbGl0KFwiP1wiKVswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldChcImFqeHBSZXNvdXJjZXNGb2xkZXJcIiwgc3JjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldChcImFqeHBSZXNvdXJjZXNGb2xkZXJcIikpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hanhwUmVzb3VyY2VzRm9sZGVyID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcImFqeHBSZXNvdXJjZXNGb2xkZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbGVydChcIkNhbm5vdCBmaW5kIHJlc291cmNlIGZvbGRlclwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9vdGVyVXJsID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcIkJPT1RFUl9VUkxcIik7XG4gICAgICAgIGlmIChib290ZXJVcmwuaW5kZXhPZihcIj9cIikgPiAtMSkge1xuICAgICAgICAgICAgYm9vdGVyVXJsID0gYm9vdGVyVXJsLnN1YnN0cmluZygwLCBib290ZXJVcmwuaW5kZXhPZihcIj9cIikpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGFyYW1ldGVycy5zZXQoJ2FqeHBTZXJ2ZXJBY2Nlc3NQYXRoJywgYm9vdGVyVXJsKTtcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldCgnc2VydmVyQWNjZXNzUGF0aCcsIGJvb3RlclVybCk7XG4gICAgICAgIHdpbmRvdy5hanhwU2VydmVyQWNjZXNzUGF0aCA9IGJvb3RlclVybDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgYSBDU1MgZmlsZVxuICAgICAqIEBwYXJhbSBmaWxlTmFtZSBTdHJpbmdcbiAgICAgKi9cblxuICAgIFB5ZGlvQm9vdHN0cmFwLnByb3RvdHlwZS5sb2FkQ1NTUmVzb3VyY2UgPSBmdW5jdGlvbiBsb2FkQ1NTUmVzb3VyY2UoZmlsZU5hbWUpIHtcbiAgICAgICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICB2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgICAgY3NzTm9kZS50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgY3NzTm9kZS5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgICAgIGNzc05vZGUuaHJlZiA9IHRoaXMucGFyYW1ldGVycy5nZXQoXCJhanhwUmVzb3VyY2VzRm9sZGVyXCIpICsgJy8nICsgZmlsZU5hbWU7XG4gICAgICAgIGNzc05vZGUubWVkaWEgPSAnc2NyZWVuJztcbiAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChjc3NOb2RlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFB5ZGlvQm9vdHN0cmFwO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHlkaW9Cb290c3RyYXA7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE4IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3V0aWxYTUxVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWwvWE1MVXRpbHMnKTtcblxudmFyIF91dGlsWE1MVXRpbHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXRpbFhNTFV0aWxzKTtcblxuLyoqXG4gKiBQeWRpbyBlbmNhcHN1bGF0aW9uIG9mIFhIUiAvIEZldGNoXG4gKi9cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xuXG52YXIgQ29ubmV4aW9uID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGJhc2VVcmwgU3RyaW5nIFRoZSBiYXNlIHVybCBmb3Igc2VydmljZXNcbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIENvbm5leGlvbihiYXNlVXJsKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb25uZXhpb24pO1xuXG4gICAgICAgIHRoaXMuX3B5ZGlvID0gd2luZG93LnB5ZGlvO1xuICAgICAgICB0aGlzLl9iYXNlVXJsID0gYmFzZVVybCB8fCB3aW5kb3cuYWp4cFNlcnZlckFjY2Vzc1BhdGg7XG4gICAgICAgIHRoaXMuX2xpYlVybCA9IHdpbmRvdy5hanhwUmVzb3VyY2VzRm9sZGVyICsgJy9idWlsZCc7XG4gICAgICAgIHRoaXMuX3BhcmFtZXRlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX21ldGhvZCA9ICdwb3N0JztcbiAgICAgICAgdGhpcy5kaXNjcmV0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIENvbm5leGlvbi5sb2cgPSBmdW5jdGlvbiBsb2coYWN0aW9uLCBzeW5jU3RhdHVzKSB7XG4gICAgICAgIGlmICghQ29ubmV4aW9uLlB5ZGlvTG9ncykge1xuICAgICAgICAgICAgQ29ubmV4aW9uLlB5ZGlvTG9ncyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIENvbm5leGlvbi5QeWRpb0xvZ3MucHVzaCh7IGFjdGlvbjogYWN0aW9uLCBzeW5jOiBzeW5jU3RhdHVzIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHF1ZXJ5IG1ldGhvZCAoZ2V0IHBvc3QpXG4gICAgICogQHBhcmFtIG1ldGhvZCBTdHJpbmdcbiAgICAgKi9cblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2V0TWV0aG9kID0gZnVuY3Rpb24gc2V0TWV0aG9kKG1ldGhvZCkge1xuICAgICAgICB0aGlzLl9tZXRob2QgPSBtZXRob2Q7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNob3cgYSBzbWFsbCBsb2FkZXJcbiAgICAgKi9cblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2hvd0xvYWRlciA9IGZ1bmN0aW9uIHNob3dMb2FkZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2NyZXRlIHx8ICF0aGlzLl9weWRpbykgcmV0dXJuO1xuICAgICAgICB0aGlzLl9weWRpby5ub3RpZnkoXCJjb25uZWN0aW9uLXN0YXJ0XCIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBIaWRlIGEgc21hbGwgbG9hZGVyXG4gICAgICovXG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLmhpZGVMb2FkZXIgPSBmdW5jdGlvbiBoaWRlTG9hZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5kaXNjcmV0ZSB8fCAhdGhpcy5fcHlkaW8pIHJldHVybjtcbiAgICAgICAgdGhpcy5fcHlkaW8ubm90aWZ5KFwiY29ubmVjdGlvbi1lbmRcIik7XG4gICAgfTtcblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIHNlbmQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zaG93TG9hZGVyKCk7XG4gICAgICAgIHZhciBvVGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgbWV0aG9kOiB0aGlzLl9tZXRob2QsXG4gICAgICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJ1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdXJsID0gdGhpcy5fYmFzZVVybDtcbiAgICAgICAgdmFyIGJvZHlQYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdmFsdWUubWFwKGZ1bmN0aW9uIChvbmVWKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvZHlQYXJ0cy5wdXNoKGtleSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvbmVWKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJvZHlQYXJ0cy5wdXNoKGtleSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gYm9keVBhcnRzLmpvaW4oJyYnKTtcbiAgICAgICAgaWYgKHRoaXMuX21ldGhvZCA9PT0gJ3Bvc3QnKSB7XG4gICAgICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSB7IFwiQ29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04XCIgfTtcbiAgICAgICAgICAgIG9wdGlvbnMuYm9keSA9IHF1ZXJ5U3RyaW5nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID4gLTEgPyAnJicgOiAnPycpICsgcXVlcnlTdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICAgICAgdmFyIGggPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC10eXBlJyk7XG4gICAgICAgICAgICBpZiAoaC5pbmRleE9mKCcvanNvbicpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24oKS50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIG9UaGlzLmFwcGx5Q29tcGxldGUoeyByZXNwb25zZUpTT046IGpzb24gfSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoLmluZGV4T2YoJy94bWwnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBvVGhpcy5hcHBseUNvbXBsZXRlKHsgcmVzcG9uc2VYTUw6IF91dGlsWE1MVXRpbHMyWydkZWZhdWx0J10ucGFyc2VYbWwodGV4dCkgfSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBvVGhpcy5hcHBseUNvbXBsZXRlKHsgcmVzcG9uc2VUZXh0OiB0ZXh0IH0sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMuX3B5ZGlvKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3B5ZGlvLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsICdOZXR3b3JrIGVycm9yICcgKyBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFwcGx5IHRoZSBjb21wbGV0ZSBjYWxsYmFjaywgdHJ5IHRvIGdyYWIgbWF4aW11bSBvZiBlcnJvcnNcbiAgICAgKiBAcGFyYW0gcGFyc2VkQm9keSBUcmFuc3BvdFxuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5hcHBseUNvbXBsZXRlID0gZnVuY3Rpb24gYXBwbHlDb21wbGV0ZShwYXJzZWRCb2R5LCByZXNwb25zZSkge1xuICAgICAgICB0aGlzLmhpZGVMb2FkZXIoKTtcbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5fcHlkaW87XG4gICAgICAgIHZhciBtZXNzYWdlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgdG9rZW5NZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgdG9rMSA9IFwiT29vcHMsIGl0IHNlZW1zIHRoYXQgeW91ciBzZWN1cml0eSB0b2tlbiBoYXMgZXhwaXJlZCEgUGxlYXNlICVzIGJ5IGhpdHRpbmcgcmVmcmVzaCBvciBGNSBpbiB5b3VyIGJyb3dzZXIhXCI7XG4gICAgICAgIHZhciB0b2syID0gXCJyZWxvYWQgdGhlIHBhZ2VcIjtcbiAgICAgICAgaWYgKHdpbmRvdy5NZXNzYWdlSGFzaCAmJiB3aW5kb3cuTWVzc2FnZUhhc2hbNDM3XSkge1xuICAgICAgICAgICAgdG9rMSA9IHdpbmRvdy5NZXNzYWdlSGFzaFs0MzddO1xuICAgICAgICAgICAgdG9rMiA9IHdpbmRvdy5NZXNzYWdlSGFzaFs0MzhdO1xuICAgICAgICB9XG4gICAgICAgIHRva2VuTWVzc2FnZSA9IHRvazEucmVwbGFjZShcIiVzXCIsIFwiPGEgaHJlZj0namF2YXNjcmlwdDpkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKScgc3R5bGU9J3RleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyc+XCIgKyB0b2syICsgXCI8L2E+XCIpO1xuXG4gICAgICAgIHZhciBjdHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LXR5cGUnKTtcbiAgICAgICAgaWYgKHBhcnNlZEJvZHkucmVzcG9uc2VYTUwgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQubm9kZU5hbWUgPT0gXCJwYXJzZXJlcnJvclwiKSB7XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlBhcnNpbmcgZXJyb3IgOiBcXG5cIiArIHBhcnNlZEJvZHkucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50LmZpcnN0Q2hpbGQudGV4dENvbnRlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAocGFyc2VkQm9keS5yZXNwb25zZVhNTCAmJiBwYXJzZWRCb2R5LnJlc3BvbnNlWE1MLnBhcnNlRXJyb3IgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5wYXJzZUVycm9yLmVycm9yQ29kZSAhPSAwKSB7XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlBhcnNpbmcgRXJyb3IgOiBcXG5cIiArIHBhcnNlZEJvZHkucmVzcG9uc2VYTUwucGFyc2VFcnJvci5yZWFzb247XG4gICAgICAgIH0gZWxzZSBpZiAoY3R5cGUuaW5kZXhPZihcInRleHQveG1sXCIpID4gLTEgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTCA9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkV4cGVjdGVkIFhNTCBidXQgZ290IGVtcHR5IHJlc3BvbnNlIVwiO1xuICAgICAgICB9IGVsc2UgaWYgKGN0eXBlLmluZGV4T2YoXCJ0ZXh0L3htbFwiKSA9PSAtMSAmJiBjdHlwZS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSA9PSAtMSAmJiBwYXJzZWRCb2R5LnJlc3BvbnNlVGV4dC5pbmRleE9mKFwiPGI+RmF0YWwgZXJyb3I8L2I+XCIpID4gLTEpIHtcblxuICAgICAgICAgICAgbWVzc2FnZSA9IHBhcnNlZEJvZHkucmVzcG9uc2VUZXh0LnJlcGxhY2UoXCI8YnIgLz5cIiwgXCJcIik7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzID09IDUwMCkge1xuXG4gICAgICAgICAgICBtZXNzYWdlID0gXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3I6IHlvdSBzaG91bGQgY2hlY2sgeW91ciB3ZWIgc2VydmVyIGxvZ3MgdG8gZmluZCB3aGF0J3MgZ29pbmcgd3JvbmchXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2Uuc3RhcnRzV2l0aChcIllvdSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRoaXMgcmVzb3VyY2UuXCIpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHRva2VuTWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChweWRpbykge1xuICAgICAgICAgICAgICAgIHB5ZGlvLmRpc3BsYXlNZXNzYWdlKFwiRVJST1JcIiwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsZXJ0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJzZWRCb2R5LnJlc3BvbnNlWE1MICYmIHBhcnNlZEJvZHkucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBhdXRoTm9kZSA9IF91dGlsWE1MVXRpbHMyWydkZWZhdWx0J10uWFBhdGhTZWxlY3RTaW5nbGVOb2RlKHBhcnNlZEJvZHkucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50LCBcInJlcXVpcmVfYXV0aFwiKTtcbiAgICAgICAgICAgIGlmIChhdXRoTm9kZSAmJiBweWRpbykge1xuICAgICAgICAgICAgICAgIHZhciByb290ID0gcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLmdldFJvb3ROb2RlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLnNldENvbnRleHROb2RlKHJvb3QpO1xuICAgICAgICAgICAgICAgICAgICByb290LmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKCdsb2dvdXQnKTtcbiAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbignbG9naW4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VOb2RlID0gX3V0aWxYTUxVdGlsczJbJ2RlZmF1bHQnXS5YUGF0aFNlbGVjdFNpbmdsZU5vZGUocGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQsIFwibWVzc2FnZVwiKTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlTm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlVHlwZSA9IG1lc3NhZ2VOb2RlLmdldEF0dHJpYnV0ZShcInR5cGVcIikudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZUNvbnRlbnQgPSBfdXRpbFhNTFV0aWxzMlsnZGVmYXVsdCddLmdldERvbU5vZGVUZXh0KG1lc3NhZ2VOb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZUNvbnRlbnQuc3RhcnRzV2l0aChcIllvdSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRoaXMgcmVzb3VyY2UuXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VDb250ZW50ID0gdG9rZW5NZXNzYWdlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHlkaW8pIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZGlzcGxheU1lc3NhZ2UobWVzc2FnZVR5cGUsIG1lc3NhZ2VDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT0gXCJFUlJPUlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChtZXNzYWdlVHlwZSArIFwiOlwiICsgbWVzc2FnZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PSBcIlNVQ0NFU1NcIikgbWVzc2FnZU5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtZXNzYWdlTm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub25Db21wbGV0ZSkge1xuXG4gICAgICAgICAgICBwYXJzZWRCb2R5LnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgICAgICAgICAgIHBhcnNlZEJvZHkucmVzcG9uc2VPYmplY3QgPSByZXNwb25zZTtcbiAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZShwYXJzZWRCb2R5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHlkaW8pIHtcbiAgICAgICAgICAgIHB5ZGlvLmZpcmUoXCJzZXJ2ZXJfYW5zd2VyXCIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUudXBsb2FkRmlsZSA9IGZ1bmN0aW9uIHVwbG9hZEZpbGUoZmlsZSwgZmlsZVBhcmFtZXRlck5hbWUsIHVwbG9hZFVybCkge1xuICAgICAgICB2YXIgb25Db21wbGV0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uICgpIHt9IDogYXJndW1lbnRzWzNdO1xuICAgICAgICB2YXIgb25FcnJvciA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNCB8fCBhcmd1bWVudHNbNF0gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uICgpIHt9IDogYXJndW1lbnRzWzRdO1xuXG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHZhciBvblByb2dyZXNzID0gYXJndW1lbnRzLmxlbmd0aCA8PSA1IHx8IGFyZ3VtZW50c1s1XSA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKCkge30gOiBhcmd1bWVudHNbNV07XG4gICAgICAgIHZhciB4aHJTZXR0aW5ncyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNiB8fCBhcmd1bWVudHNbNl0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzZdO1xuXG4gICAgICAgIHZhciB4aHIgPSB0aGlzLmluaXRpYWxpemVYSFJGb3JVcGxvYWQodXBsb2FkVXJsLCBvbkNvbXBsZXRlLCBvbkVycm9yLCBvblByb2dyZXNzLCB4aHJTZXR0aW5ncyk7XG4gICAgICAgIGlmICh4aHJTZXR0aW5ncyAmJiB4aHJTZXR0aW5ncy5tZXRob2QgPT09ICdQVVQnKSB7XG4gICAgICAgICAgICB4aHIuc2VuZChmaWxlKTtcbiAgICAgICAgICAgIHJldHVybiB4aHI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdpbmRvdy5Gb3JtRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5zZW5kRmlsZVVzaW5nRm9ybURhdGEoeGhyLCBmaWxlLCBmaWxlUGFyYW1ldGVyTmFtZSk7XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LkZpbGVSZWFkZXIpIHtcbiAgICAgICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIueGhyU2VuZEFzQmluYXJ5KHhociwgZmlsZS5uYW1lLCBlLnRhcmdldC5yZXN1bHQsIGZpbGVQYXJhbWV0ZXJOYW1lKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWxlLmdldEFzQmluYXJ5KSB7XG4gICAgICAgICAgICB0aGlzLnhoclNlbmRBc0JpbmFyeSh4aHIsIGZpbGUubmFtZSwgZmlsZS5nZXRBc0JpbmFyeSgpLCBmaWxlUGFyYW1ldGVyTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHhocjtcbiAgICB9O1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5pbml0aWFsaXplWEhSRm9yVXBsb2FkID0gZnVuY3Rpb24gaW5pdGlhbGl6ZVhIUkZvclVwbG9hZCh1cmwsIG9uQ29tcGxldGUsIG9uRXJyb3IsIG9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgdmFyIHhoclNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA8PSA0IHx8IGFyZ3VtZW50c1s0XSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbNF07XG5cbiAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICB2YXIgdXBsb2FkID0geGhyLnVwbG9hZDtcbiAgICAgICAgaWYgKHhoclNldHRpbmdzLndpdGhDcmVkZW50aWFscykge1xuICAgICAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXCJwcm9ncmVzc1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKCFlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvblByb2dyZXNzKGUpO1xuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKHhocik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih4aHIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdXBsb2FkLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBvbkVycm9yKHhocik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBtZXRob2QgPSAnUE9TVCc7XG4gICAgICAgIGlmICh4aHJTZXR0aW5ncy5tZXRob2QpIHtcbiAgICAgICAgICAgIG1ldGhvZCA9IHhoclNldHRpbmdzLm1ldGhvZDtcbiAgICAgICAgfVxuICAgICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG4gICAgICAgIGlmICh4aHJTZXR0aW5ncy5jdXN0b21IZWFkZXJzKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh4aHJTZXR0aW5ncy5jdXN0b21IZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaywgeGhyU2V0dGluZ3MuY3VzdG9tSGVhZGVyc1trXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB4aHI7XG4gICAgfTtcblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2VuZEZpbGVVc2luZ0Zvcm1EYXRhID0gZnVuY3Rpb24gc2VuZEZpbGVVc2luZ0Zvcm1EYXRhKHhociwgZmlsZSwgZmlsZVBhcmFtZXRlck5hbWUpIHtcbiAgICAgICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChmaWxlUGFyYW1ldGVyTmFtZSwgZmlsZSk7XG4gICAgICAgIHhoci5zZW5kKGZvcm1EYXRhKTtcbiAgICB9O1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS54aHJTZW5kQXNCaW5hcnkgPSBmdW5jdGlvbiB4aHJTZW5kQXNCaW5hcnkoeGhyLCBmaWxlTmFtZSwgZmlsZURhdGEsIGZpbGVQYXJhbWV0ZXJOYW1lKSB7XG4gICAgICAgIHZhciBib3VuZGFyeSA9ICctLS0tTXVsdGlQYXJ0Rm9ybUJvdW5kYXJ5JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcIm11bHRpcGFydC9mb3JtLWRhdGEsIGJvdW5kYXJ5PVwiICsgYm91bmRhcnkpO1xuXG4gICAgICAgIHZhciBib2R5ID0gXCItLVwiICsgYm91bmRhcnkgKyBcIlxcclxcblwiO1xuICAgICAgICBib2R5ICs9IFwiQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSdcIiArIGZpbGVQYXJhbWV0ZXJOYW1lICsgXCInOyBmaWxlbmFtZT0nXCIgKyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoZmlsZU5hbWUpKSArIFwiJ1xcclxcblwiO1xuICAgICAgICBib2R5ICs9IFwiQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cXHJcXG5cXHJcXG5cIjtcbiAgICAgICAgYm9keSArPSBmaWxlRGF0YSArIFwiXFxyXFxuXCI7XG4gICAgICAgIGJvZHkgKz0gXCItLVwiICsgYm91bmRhcnkgKyBcIi0tXFxyXFxuXCI7XG5cbiAgICAgICAgeGhyLnNlbmRBc0JpbmFyeShib2R5KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZCBhIGphdmFzY3JpcHQgbGlicmFyeVxuICAgICAqIEBwYXJhbSBmaWxlTmFtZSBTdHJpbmdcbiAgICAgKiBAcGFyYW0gb25Mb2FkZWRDb2RlIEZ1bmN0aW9uIENhbGxiYWNrXG4gICAgICAgICogQHBhcmFtIGFTeW5jIEJvb2xlYW4gbG9hZCBsaWJyYXJ5IGFzeW5jaHJvbmVvdXNseVxuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5sb2FkTGlicmFyeSA9IGZ1bmN0aW9uIGxvYWRMaWJyYXJ5KGZpbGVOYW1lLCBvbkxvYWRlZENvZGUsIGFTeW5jKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIGlmICh3aW5kb3cucHlkaW9Cb290c3RyYXAgJiYgd2luZG93LnB5ZGlvQm9vdHN0cmFwLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFZlcnNpb25cIikgJiYgZmlsZU5hbWUuaW5kZXhPZihcIj9cIikgPT09IC0xKSB7XG4gICAgICAgICAgICBmaWxlTmFtZSArPSBcIj92PVwiICsgd2luZG93LnB5ZGlvQm9vdHN0cmFwLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFZlcnNpb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHVybCA9IHRoaXMuX2xpYlVybCA/IHRoaXMuX2xpYlVybCArICcvJyArIGZpbGVOYW1lIDogZmlsZU5hbWU7XG4gICAgICAgIHZhciBweWRpbyA9IHRoaXMuX3B5ZGlvO1xuXG4gICAgICAgIHZhciBzY3JpcHRMb2FkZWQgPSBmdW5jdGlvbiBzY3JpcHRMb2FkZWQoc2NyaXB0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZXhlY1NjcmlwdCkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZXhlY1NjcmlwdChzY3JpcHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teV9jb2RlID0gc2NyaXB0O1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3JpcHRfdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdF90YWcudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHRfdGFnLmlubmVySFRNTCA9ICdldmFsKHdpbmRvdy5teV9jb2RlKSc7XG4gICAgICAgICAgICAgICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0X3RhZyk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3cubXlfY29kZTtcbiAgICAgICAgICAgICAgICAgICAgaGVhZC5yZW1vdmVDaGlsZChzY3JpcHRfdGFnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9uTG9hZGVkQ29kZSAhPSBudWxsKSBvbkxvYWRlZENvZGUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnZXJyb3IgbG9hZGluZyAnICsgZmlsZU5hbWUgKyAnOicgKyBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGlmIChjb25zb2xlKSBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHB5ZGlvKSBweWRpby5maXJlKFwic2VydmVyX2Fuc3dlclwiKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYVN5bmMpIHtcbiAgICAgICAgICAgIHdpbmRvdy5mZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICAgICAgICAgICAgICBzY3JpcHRMb2FkZWQoc2NyaXB0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBTSE9VTEQgQkUgUkVNT1ZFRCEhXG4gICAgICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdExvYWRlZCh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ2Vycm9yIGxvYWRpbmcgJyArIGZpbGVOYW1lICsgJzogU3RhdHVzIGNvZGUgd2FzICcgKyB4aHIuc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMzKTtcbiAgICAgICAgICAgICAgICB4aHIub3BlbihcIkdFVFwiLCB1cmwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gQ29ubmV4aW9uO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29ubmV4aW9uO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20vPi5cbiAqXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF93aWNrZWRHb29kWHBhdGggPSByZXF1aXJlKCd3aWNrZWQtZ29vZC14cGF0aCcpO1xuXG52YXIgX3dpY2tlZEdvb2RYcGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93aWNrZWRHb29kWHBhdGgpO1xuXG5fd2lja2VkR29vZFhwYXRoMlsnZGVmYXVsdCddLmluc3RhbGwoKTtcbi8qKlxuICogVXRpbGl0YXJ5IGNsYXNzIGZvciBtYW5pcHVsYXRpbmcgWE1MXG4gKi9cblxudmFyIFhNTFV0aWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBYTUxVdGlscygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFhNTFV0aWxzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3RzIHRoZSBmaXJzdCBYbWxOb2RlIHRoYXQgbWF0Y2hlcyB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IHtFbGVtZW50IHwgRG9jdW1lbnR9IHJvb3QgZWxlbWVudCBmb3IgdGhlIHNlYXJjaFxuICAgICAqIEBwYXJhbSBxdWVyeSB7U3RyaW5nfSBYUGF0aCBxdWVyeVxuICAgICAqIEByZXR1cm4ge0VsZW1lbnR9IGZpcnN0IG1hdGNoaW5nIGVsZW1lbnRcbiAgICAgKiBAc2lnbmF0dXJlIGZ1bmN0aW9uKGVsZW1lbnQsIHF1ZXJ5KVxuICAgICAqL1xuXG4gICAgWE1MVXRpbHMuWFBhdGhTZWxlY3RTaW5nbGVOb2RlID0gZnVuY3Rpb24gWFBhdGhTZWxlY3RTaW5nbGVOb2RlKGVsZW1lbnQsIHF1ZXJ5KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFsnc2VsZWN0U2luZ2xlTm9kZSddICYmIHR5cGVvZiBlbGVtZW50LnNlbGVjdFNpbmdsZU5vZGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHZhciByZXMgPSBlbGVtZW50LnNlbGVjdFNpbmdsZU5vZGUocXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXMpIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgICAgaWYgKCFYTUxVdGlscy5fX3hwZSAmJiB3aW5kb3cuWFBhdGhFdmFsdWF0b3IpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgWE1MVXRpbHMuX194cGUgPSBuZXcgWFBhdGhFdmFsdWF0b3IoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIVhNTFV0aWxzLl9feHBlKSB7XG4gICAgICAgICAgICBxdWVyeSA9IGRvY3VtZW50LmNyZWF0ZUV4cHJlc3Npb24ocXVlcnksIG51bGwpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHF1ZXJ5LmV2YWx1YXRlKGVsZW1lbnQsIDcsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5zbmFwc2hvdExlbmd0aCA/IHJlc3VsdC5zbmFwc2hvdEl0ZW0oMCkgOiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHhwZSA9IFhNTFV0aWxzLl9feHBlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4geHBlLmV2YWx1YXRlKHF1ZXJ5LCBlbGVtZW50LCB4cGUuY3JlYXRlTlNSZXNvbHZlcihlbGVtZW50KSwgWFBhdGhSZXN1bHQuRklSU1RfT1JERVJFRF9OT0RFX1RZUEUsIG51bGwpLnNpbmdsZU5vZGVWYWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RTaW5nbGVOb2RlOiBxdWVyeTogXCIgKyBxdWVyeSArIFwiLCBlbGVtZW50OiBcIiArIGVsZW1lbnQgKyBcIiwgZXJyb3I6IFwiICsgZXJyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3RzIGEgbGlzdCBvZiBub2RlcyBtYXRjaGluZyB0aGUgWFBhdGggZXhwcmVzc2lvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IHtFbGVtZW50IHwgRG9jdW1lbnR9IHJvb3QgZWxlbWVudCBmb3IgdGhlIHNlYXJjaFxuICAgICAqIEBwYXJhbSBxdWVyeSB7U3RyaW5nfSBYUGF0aCBxdWVyeVxuICAgICAqIEByZXR1cm4ge0VsZW1lbnRbXX0gTGlzdCBvZiBtYXRjaGluZyBlbGVtZW50c1xuICAgICAqIEBzaWduYXR1cmUgZnVuY3Rpb24oZWxlbWVudCwgcXVlcnkpXG4gICAgICovXG5cbiAgICBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzID0gZnVuY3Rpb24gWFBhdGhTZWxlY3ROb2RlcyhlbGVtZW50LCBxdWVyeSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnNlbGVjdE5vZGVzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5vd25lckRvY3VtZW50ICYmIGVsZW1lbnQub3duZXJEb2N1bWVudC5zZXRQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vd25lckRvY3VtZW50LnNldFByb3BlcnR5KFwiU2VsZWN0aW9uTGFuZ3VhZ2VcIiwgXCJYUGF0aFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50LnNldFByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldFByb3BlcnR5KFwiU2VsZWN0aW9uTGFuZ3VhZ2VcIiwgXCJYUGF0aFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IEFycmF5LmZyb20oZWxlbWVudC5zZWxlY3ROb2RlcyhxdWVyeSkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXMpIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgICAgdmFyIHhwZSA9IFhNTFV0aWxzLl9feHBlO1xuXG4gICAgICAgIGlmICgheHBlICYmIHdpbmRvdy5YUGF0aEV2YWx1YXRvcikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBYTUxVdGlscy5fX3hwZSA9IHhwZSA9IG5ldyBYUGF0aEV2YWx1YXRvcigpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0LFxuICAgICAgICAgICAgbm9kZXMgPSBbXSxcbiAgICAgICAgICAgIGk7XG4gICAgICAgIGlmICghWE1MVXRpbHMuX194cGUpIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gZG9jdW1lbnQuY3JlYXRlRXhwcmVzc2lvbihxdWVyeSwgbnVsbCk7XG4gICAgICAgICAgICByZXN1bHQgPSBxdWVyeS5ldmFsdWF0ZShlbGVtZW50LCA3LCBudWxsKTtcbiAgICAgICAgICAgIG5vZGVzID0gW107XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzdWx0LnNuYXBzaG90TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoRWxlbWVudC5leHRlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0gPSBFbGVtZW50LmV4dGVuZChyZXN1bHQuc25hcHNob3RJdGVtKGkpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXSA9IHJlc3VsdC5zbmFwc2hvdEl0ZW0oaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHhwZS5ldmFsdWF0ZShxdWVyeSwgZWxlbWVudCwgeHBlLmNyZWF0ZU5TUmVzb2x2ZXIoZWxlbWVudCksIFhQYXRoUmVzdWx0Lk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFLCBudWxsKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3ROb2RlczogcXVlcnk6IFwiICsgcXVlcnkgKyBcIiwgZWxlbWVudDogXCIgKyBlbGVtZW50ICsgXCIsIGVycm9yOiBcIiArIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzdWx0LnNuYXBzaG90TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5vZGVzW2ldID0gcmVzdWx0LnNuYXBzaG90SXRlbShpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2VsZWN0cyB0aGUgZmlyc3QgWG1sTm9kZSB0aGF0IG1hdGNoZXMgdGhlIFhQYXRoIGV4cHJlc3Npb24gYW5kIHJldHVybnMgdGhlIHRleHQgY29udGVudCBvZiB0aGUgZWxlbWVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQge0VsZW1lbnR8RG9jdW1lbnR9IHJvb3QgZWxlbWVudCBmb3IgdGhlIHNlYXJjaFxuICAgICAqIEBwYXJhbSBxdWVyeSB7U3RyaW5nfSAgWFBhdGggcXVlcnlcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IHRoZSBqb2luZWQgdGV4dCBjb250ZW50IG9mIHRoZSBmb3VuZCBlbGVtZW50IG9yIG51bGwgaWYgbm90IGFwcHJvcHJpYXRlLlxuICAgICAqIEBzaWduYXR1cmUgZnVuY3Rpb24oZWxlbWVudCwgcXVlcnkpXG4gICAgICovXG5cbiAgICBYTUxVdGlscy5YUGF0aEdldFNpbmdsZU5vZGVUZXh0ID0gZnVuY3Rpb24gWFBhdGhHZXRTaW5nbGVOb2RlVGV4dChlbGVtZW50LCBxdWVyeSkge1xuICAgICAgICB2YXIgbm9kZSA9IFhNTFV0aWxzLlhQYXRoU2VsZWN0U2luZ2xlTm9kZShlbGVtZW50LCBxdWVyeSk7XG4gICAgICAgIHJldHVybiBYTUxVdGlscy5nZXREb21Ob2RlVGV4dChub2RlKTtcbiAgICB9O1xuXG4gICAgWE1MVXRpbHMuZ2V0RG9tTm9kZVRleHQgPSBmdW5jdGlvbiBnZXREb21Ob2RlVGV4dChub2RlKSB7XG4gICAgICAgIHZhciBpbmNsdWRlQ0RhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgLy8gTk9ERV9FTEVNRU5UXG4gICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgIGEgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMgPSBub2RlLmNoaWxkTm9kZXMsXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IG5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYVtpXSA9IFhNTFV0aWxzLmdldERvbU5vZGVUZXh0KG5vZGVzW2ldLCBpbmNsdWRlQ0RhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBhLmpvaW4oXCJcIik7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAvLyBOT0RFX0FUVFJJQlVURVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgLy8gTk9ERV9URVhUXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZVZhbHVlO1xuXG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgLy8gQ0RBVEFcbiAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZUNEYXRhKSByZXR1cm4gbm9kZS5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHhtbFN0clxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuXG4gICAgWE1MVXRpbHMucGFyc2VYbWwgPSBmdW5jdGlvbiBwYXJzZVhtbCh4bWxTdHIpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5ET01QYXJzZXIgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyB3aW5kb3cuRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHhtbFN0ciwgXCJ0ZXh0L3htbFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5BY3RpdmVYT2JqZWN0ICE9IFwidW5kZWZpbmVkXCIgJiYgbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KFwiTVNYTUwyLkRPTURvY3VtZW50LjYuMFwiKSkge1xuICAgICAgICAgICAgdmFyIHhtbERvYyA9IG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdChcIk1TWE1MMi5ET01Eb2N1bWVudC42LjBcIik7XG4gICAgICAgICAgICB4bWxEb2MudmFsaWRhdGVPblBhcnNlID0gZmFsc2U7XG4gICAgICAgICAgICB4bWxEb2MuYXN5bmMgPSBmYWxzZTtcbiAgICAgICAgICAgIHhtbERvYy5sb2FkWE1MKHhtbFN0cik7XG4gICAgICAgICAgICB4bWxEb2Muc2V0UHJvcGVydHkoJ1NlbGVjdGlvbkxhbmd1YWdlJywgJ1hQYXRoJyk7XG4gICAgICAgICAgICByZXR1cm4geG1sRG9jO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHBhcnNlIFhNTCBzdHJpbmcnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFhNTFV0aWxzO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gWE1MVXRpbHM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiJdfQ==
