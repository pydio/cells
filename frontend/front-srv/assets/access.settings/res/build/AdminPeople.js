(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

  return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
}

var _default = bytesToUuid;
exports.default = _default;
module.exports = exports.default;
},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "v1", {
  enumerable: true,
  get: function () {
    return _v.default;
  }
});
Object.defineProperty(exports, "v3", {
  enumerable: true,
  get: function () {
    return _v2.default;
  }
});
Object.defineProperty(exports, "v4", {
  enumerable: true,
  get: function () {
    return _v3.default;
  }
});
Object.defineProperty(exports, "v5", {
  enumerable: true,
  get: function () {
    return _v4.default;
  }
});

var _v = _interopRequireDefault(require("./v1.js"));

var _v2 = _interopRequireDefault(require("./v3.js"));

var _v3 = _interopRequireDefault(require("./v4.js"));

var _v4 = _interopRequireDefault(require("./v5.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./v1.js":6,"./v3.js":7,"./v4.js":9,"./v5.js":10}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes == 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Array(msg.length);

    for (var i = 0; i < msg.length; i++) bytes[i] = msg.charCodeAt(i);
  }

  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */


function md5ToHexEncodedArray(input) {
  var i;
  var x;
  var output = [];
  var length32 = input.length * 32;
  var hexTab = '0123456789abcdef';
  var hex;

  for (i = 0; i < length32; i += 8) {
    x = input[i >> 5] >>> i % 32 & 0xff;
    hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }

  return output;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */


function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;
  var i;
  var olda;
  var oldb;
  var oldc;
  var oldd;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;

  for (i = 0; i < x.length; i += 16) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */


function bytesToWords(input) {
  var i;
  var output = [];
  output[(input.length >> 2) - 1] = undefined;

  for (i = 0; i < output.length; i += 1) {
    output[i] = 0;
  }

  var length8 = input.length * 8;

  for (i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }

  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */


function safeAdd(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */


function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */


function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

var _default = md5;
exports.default = _default;
module.exports = exports.default;
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rng;
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);
var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

function rng() {
  if (!getRandomValues) {
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  }

  return getRandomValues(rnds8);
}

module.exports = exports.default;
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;

    case 1:
      return x ^ y ^ z;

    case 2:
      return x & y ^ x & z ^ y & z;

    case 3:
      return x ^ y ^ z;
  }
}

function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}

function sha1(bytes) {
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  if (typeof bytes == 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Array(msg.length);

    for (var i = 0; i < msg.length; i++) bytes[i] = msg.charCodeAt(i);
  }

  bytes.push(0x80);
  var l = bytes.length / 4 + 2;
  var N = Math.ceil(l / 16);
  var M = new Array(N);

  for (var i = 0; i < N; i++) {
    M[i] = new Array(16);

    for (var j = 0; j < 16; j++) {
      M[i][j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }
  }

  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

  for (var i = 0; i < N; i++) {
    var W = new Array(80);

    for (var t = 0; t < 16; t++) W[t] = M[i][t];

    for (var t = 16; t < 80; t++) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }

    var a = H[0];
    var b = H[1];
    var c = H[2];
    var d = H[3];
    var e = H[4];

    for (var t = 0; t < 80; t++) {
      var s = Math.floor(t / 20);
      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }

  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}

var _default = sha1;
exports.default = _default;
module.exports = exports.default;
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
var _nodeId;

var _clockseq; // Previous uuid creation time


var _lastMSecs = 0;
var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];
  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    var seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : (0, _bytesToUuid.default)(b);
}

var _default = v1;
exports.default = _default;
module.exports = exports.default;
},{"./bytesToUuid.js":1,"./rng.js":4}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _md = _interopRequireDefault(require("./md5.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports.default = _default;
module.exports = exports.default;
},{"./md5.js":3,"./v35.js":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.URL = exports.DNS = void 0;

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function uuidToBytes(uuid) {
  // Note: We assume we're being passed a valid uuid string
  var bytes = [];
  uuid.replace(/[a-fA-F0-9]{2}/g, function (hex) {
    bytes.push(parseInt(hex, 16));
  });
  return bytes;
}

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  var bytes = new Array(str.length);

  for (var i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  var generateUUID = function (value, namespace, buf, offset) {
    var off = buf && offset || 0;
    if (typeof value == 'string') value = stringToBytes(value);
    if (typeof namespace == 'string') namespace = uuidToBytes(namespace);
    if (!Array.isArray(value)) throw TypeError('value must be an array of bytes');
    if (!Array.isArray(namespace) || namespace.length !== 16) throw TypeError('namespace must be uuid string or an Array of 16 byte values'); // Per 4.3

    var bytes = hashfunc(namespace.concat(value));
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      for (var idx = 0; idx < 16; ++idx) {
        buf[off + idx] = bytes[idx];
      }
    }

    return buf || (0, _bytesToUuid.default)(bytes);
  }; // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name;
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}
},{"./bytesToUuid.js":1}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rng = _interopRequireDefault(require("./rng.js"));

var _bytesToUuid = _interopRequireDefault(require("./bytesToUuid.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof options == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }

  options = options || {};

  var rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || (0, _bytesToUuid.default)(rnds);
}

var _default = v4;
exports.default = _default;
module.exports = exports.default;
},{"./bytesToUuid.js":1,"./rng.js":4}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("./v35.js"));

var _sha = _interopRequireDefault(require("./sha1.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports.default = _default;
module.exports = exports.default;
},{"./sha1.js":5,"./v35.js":8}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'deleteAction',
        value: function deleteAction(manager, args) {

            var userSelection = undefined;
            if (args && args.length) {
                userSelection = args[0];
            } else {
                userSelection = pydio.getUserSelection();
            }

            var firstNode = userSelection.getUniqueNode();
            var meta = firstNode.getMetadata();
            var deleteMessageId = undefined;

            switch (meta.get('ajxp_mime')) {
                case 'user_editable':
                    deleteMessageId = 'settings.34';
                    break;
                case 'group':
                    deleteMessageId = 'settings.126';
                    break;
                default:
                    break;
            }

            var reload = function reload() {};
            if (firstNode.getParent()) {
                (function () {
                    var parent = firstNode.getParent();
                    reload = function () {
                        parent.reload(null, true);
                    };
                })();
            }
            var callback = function callback() {
                var selection = userSelection.getSelectedNodes();
                var next = function next() {
                    if (!selection.length) {
                        return;
                    }
                    var n = selection.shift();
                    _pydioHttpApi2['default'].getRestClient().getIdmApi().deleteIdmUser(n.getMetadata().get('IdmUser')).then(function () {
                        reload();
                        next();
                    })['catch'](function (e) {
                        Pydio.getInstance().UI.displayMessage('ERROR', e.message);
                        next();
                    });
                };
                next();
            };

            pydio.UI.openConfirmDialog({
                message: MessageHash[deleteMessageId],
                validCallback: callback
            });
        }
    }, {
        key: 'applyDND',
        value: function applyDND(manager, dndActionParameter) {

            if (dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_CAN_DROP) {

                AdminComponents.DNDActionsManager.canDropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());
            } else if (dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_END_DRAG) {

                AdminComponents.DNDActionsManager.dropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());
            }
        }
    }]);

    return Callbacks;
})();

exports['default'] = Callbacks;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api"}],12:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _editorEditor = require('../editor/Editor');

var _editorEditor2 = _interopRequireDefault(_editorEditor);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _materialUiStyles = require('material-ui/styles');

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _UsersSearchBox = require('./UsersSearchBox');

var _UsersSearchBox2 = _interopRequireDefault(_UsersSearchBox);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _Callbacks = require('./Callbacks');

var _Callbacks2 = _interopRequireDefault(_Callbacks);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilFunc = require('pydio/util/func');

var _pydioUtilFunc2 = _interopRequireDefault(_pydioUtilFunc);

var _editorUtilClassLoader = require("../editor/util/ClassLoader");

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var JobsStore = _Pydio$requireLib.JobsStore;

var Dashboard = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        accessByName: _react2['default'].PropTypes.func.isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
        var _props = this.props;
        var currentNode = _props.currentNode;
        var dataModel = _props.dataModel;

        return {
            searchResultData: false,
            currentNode: currentNode,
            dataModel: dataModel,
            showAnon: false
        };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        var jStore = JobsStore.getInstance();
        this._jStoreObserver = function (jobId) {
            if (jobId && jobId.indexOf('delete-group-') === 0) {
                jStore.getJobs().then(function (jobs) {
                    try {
                        if (jobs.get(jobId).Tasks[0].Status === 'Finished') {
                            _this.reloadList();
                        }
                    } catch (e) {}
                });
            }
        };
        jStore.observe("tasks_updated", this._jStoreObserver);
    },

    componentWillUnmounnt: function componentWillUnmounnt() {
        JobsStore.getInstance().stopObserving("tasks_updated", this._jStoreObserver);
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        if (!this.state.searchResultData && newProps.currentNode && newProps.currentNode.getPath().indexOf('/idm/users') === 0) {
            this.setState({
                currentNode: newProps.currentNode,
                dataModel: newProps.dataModel
            });
        }
    },

    reloadList: function reloadList() {
        if (this.refs["mainlist"]) {
            this.refs["mainlist"].reload();
        }
    },

    renderListUserAvatar: function renderListUserAvatar(node) {
        var idmUser = node.getMetadata().get('IdmUser');
        var pydio = this.props.pydio;

        if (idmUser.Attributes && idmUser.Attributes['avatar']) {
            var imgSrc = pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/binaries/USER/' + idmUser.Login + '?' + idmUser.Attributes['avatar'] + '&dim=33';
            return _react2['default'].createElement('div', { style: {
                    width: 33,
                    height: 33,
                    backgroundImage: "url(" + imgSrc + ")",
                    backgroundSize: 'cover',
                    borderRadius: '50%',
                    backgroundPosition: 'center',
                    margin: 16
                } });
        }
        var style = {
            backgroundColor: '#9e9e9e',
            color: 'white',
            borderRadius: '50%',
            margin: 16,
            width: 33,
            height: 33,
            fontSize: 18,
            padding: 6,
            textAlign: 'center'
        };
        var iconClass = node.isLeaf() ? "mdi mdi-account" : "mdi mdi-folder";
        return _react2['default'].createElement(_materialUi.FontIcon, { className: iconClass, style: style });
    },

    renderListEntryFirstLine: function renderListEntryFirstLine(node) {
        var idmUser = node.getMetadata().get('IdmUser');
        var profile = idmUser.Attributes ? idmUser.Attributes['profile'] : '';
        var icons = [];
        var iconStyle = { display: 'inline-block', marginLeft: 5, fontSize: 14 };

        if (profile === 'shared') {
            icons.push(_react2['default'].createElement('span', { className: "mdi mdi-share-variant", style: _extends({}, iconStyle, { color: '#009688' }), title: this.context.getMessage('user.13') }));
        } else if (profile === "admin") {
            icons.push(_react2['default'].createElement('span', { className: "mdi mdi-security", style: _extends({}, iconStyle, { color: '#03a9f4' }) }));
        }
        if (idmUser.Attributes && idmUser.Attributes['locks'] && idmUser.Attributes['locks'].indexOf('logout') > -1) {
            icons.push(_react2['default'].createElement('span', { className: "mdi mdi-lock", style: _extends({}, iconStyle, { color: '#E53934' }) }));
        }

        return _react2['default'].createElement(
            'span',
            null,
            node.getLabel(),
            ' ',
            icons
        );
    },

    renderListEntrySecondLine: function renderListEntrySecondLine(node) {
        var idmUser = node.getMetadata().get('IdmUser');
        if (node.isLeaf()) {
            if (node.getPath() === '/idm/users') {
                // This is the Root Group
                return this.context.getMessage('user.8');
            }
            var strings = [];
            strings.push(idmUser.Login);
            var attributes = idmUser.Attributes || {};
            if (attributes['profile']) {
                strings.push("Profile " + attributes['profile']);
            }
            if (attributes['last_connection_readable']) {
                strings.push(this.context.getMessage('user.9') + ' ' + attributes['last_connection_readable']);
            }
            var roles = idmUser.Roles;
            if (roles && roles.length) {
                strings.push(this.context.getMessage('user.11').replace("%i", roles.length));
            }
            return strings.join(" - ");
        } else {
            return this.context.getMessage('user.12') + ': ' + node.getPath().replace('/idm/users', '');
        }
    },

    renderListEntrySelector: function renderListEntrySelector(node) {
        if (node.getPath() === '/idm/users') {
            return false;
        }
        return node.isLeaf();
    },

    displaySearchResults: function displaySearchResults(searchTerm, searchDataModel) {
        this.setState({
            searchResultTerm: searchTerm,
            searchResultData: {
                term: searchTerm,
                toggleState: this.hideSearchResults
            },
            currentNode: searchDataModel.getContextNode(),
            dataModel: searchDataModel
        });
    },

    hideSearchResults: function hideSearchResults() {
        this.setState({
            searchResultData: false,
            currentNode: this.props.currentNode,
            dataModel: this.props.dataModel
        });
    },

    createUserAction: function createUserAction() {
        pydio.UI.openComponentInModal('AdminPeople', 'Forms.CreateUserForm', { dataModel: this.props.dataModel, openRoleEditor: this.openRoleEditor.bind(this) });
    },

    createGroupAction: function createGroupAction() {
        pydio.UI.openComponentInModal('AdminPeople', 'Forms.CreateRoleOrGroupForm', { type: 'group', openRoleEditor: this.openRoleEditor.bind(this) });
    },

    openUsersImporter: function openUsersImporter() {
        pydio.UI.openComponentInModal('EnterprisePeople', 'UsersImportDialog', { dataModel: this.props.dataModel });
    },

    openRoleEditor: function openRoleEditor(node) {
        var _this2 = this;

        var initialSection = arguments.length <= 1 || arguments[1] === undefined ? 'activity' : arguments[1];
        var _props2 = this.props;
        var pydio = _props2.pydio;
        var rolesEditorClass = _props2.rolesEditorClass;
        var rolesEditorProps = _props2.rolesEditorProps;

        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        var editorProps = _extends({
            ref: "editor",
            node: node,
            pydio: pydio,
            initialEditSection: initialSection,
            onRequestTabClose: this.closeRoleEditor,
            afterSave: function afterSave() {
                _this2.reloadList();
            }
        }, rolesEditorProps);

        (0, _editorUtilClassLoader.loadEditorClass)(rolesEditorClass, _editorEditor2['default']).then(function (component) {
            _this2.props.openRightPane({
                COMPONENT: component,
                PROPS: editorProps
            });
        });
    },

    closeRoleEditor: function closeRoleEditor() {
        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
    },

    deleteAction: function deleteAction(node) {
        var dm = new _pydioModelDataModel2['default']();
        dm.setSelectedNodes([node]);
        _Callbacks2['default'].deleteAction(null, [dm]);
    },

    renderNodeActions: function renderNodeActions(node) {
        var _this3 = this;

        var mime = node.getAjxpMime();
        if (node.getMetadata().has('IdmUser') && !node.getMetadata().get("IdmUser").PoliciesContextEditable) {
            return _react2['default'].createElement('div', null);
        }
        var iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        var disabledStyle = {
            color: 'rgba(0,0,0,0.15)',
            fontSize: 20
        };
        var actions = [];
        if (mime === 'user_editable' || mime === 'group') {
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { key: 'edit', iconClassName: 'mdi mdi-pencil', onTouchTap: function () {
                    _this3.openRoleEditor(node);
                }, onClick: function (e) {
                    e.stopPropagation();
                }, iconStyle: iconStyle }));
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { key: 'delete', iconClassName: 'mdi mdi-delete', onTouchTap: function () {
                    _this3.deleteAction(node);
                }, onClick: function (e) {
                    e.stopPropagation();
                }, iconStyle: iconStyle }));
        } else if (mime === 'user') {
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { key: 'edit', iconClassName: 'mdi mdi-pencil', onTouchTap: function () {
                    _this3.openRoleEditor(node);
                }, onClick: function (e) {
                    e.stopPropagation();
                }, iconStyle: iconStyle }));
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { key: 'delete', iconClassName: 'mdi mdi-delete', disabled: true, iconStyle: disabledStyle, onClick: function (e) {
                    e.stopPropagation();
                } }));
        }
        return _react2['default'].createElement(
            'div',
            null,
            actions
        );
    },

    /**
     * Filter nodes
     * @param node
     * @return {boolean}
     */
    filterNodes: function filterNodes(node) {
        if (!node.getMetadata().has("IdmUser")) {
            return true;
        }
        var _state = this.state;
        var showAnon = _state.showAnon;
        var displaySearchResult = _state.displaySearchResult;

        if (displaySearchResult || showAnon) {
            return true;
        }
        var attributes = node.getMetadata().get("IdmUser").Attributes || {};
        return attributes['profile'] !== 'anon';
    },

    applyFilter: function applyFilter(profile) {
        var _this4 = this;

        if (profile === 'toggle-anon') {
            this.setState({ showAnon: !this.state.showAnon });
            return;
        }
        var currentNode = this.props.currentNode;

        currentNode.getMetadata().set('userProfileFilter', profile);
        currentNode.getMetadata()['delete']('paginationData');
        this.setState({ currentNode: currentNode }, function () {
            _this4.reloadList();
        });
    },

    render: function render() {
        var _this5 = this;

        var _props3 = this.props;
        var accessByName = _props3.accessByName;
        var muiTheme = _props3.muiTheme;
        var rootNode = _props3.rootNode;
        var pydio = _props3.pydio;

        var styles = AdminComponents.AdminStyles(muiTheme.palette);

        var _state2 = this.state;
        var searchResultData = _state2.searchResultData;
        var currentNode = _state2.currentNode;
        var dataModel = _state2.dataModel;
        var showAnon = _state2.showAnon;

        /*
        const fontIconStyle = {
            style : {
                backgroundColor: muiTheme.palette.accent2Color,
                borderRadius: '50%',
                width: 36,
                height: 36,
                padding: 8,
                marginRight: 10
            },
            iconStyle : {
                color: 'white',
                fontSize: 20
            }
        };
        let importButton = <IconButton {...fontIconStyle} iconClassName="mdi mdi-file-excel" primary={false} tooltipPosition={"bottom-left"} tooltip={this.context.getMessage('171', 'settings')} onTouchTap={this.openUsersImporter}/>;
        if(!ResourcesManager.moduleIsAvailable('EnterprisePeople')){
            let disabled = {style:{...fontIconStyle.style}, iconStyle:{...fontIconStyle.iconStyle}};
            disabled.style.backgroundColor = 'rgba(0,0,0,0.23)';
            importButton = <IconButton {...disabled} iconClassName="mdi mdi-file-excel" primary={false} tooltipPosition={"bottom-left"} tooltip={this.context.getMessage('171', 'settings')} disabled={true}/>;
        }
        */

        var searchBox = _react2['default'].createElement(_UsersSearchBox2['default'], {
            displayResults: this.displaySearchResults,
            displayResultsState: searchResultData,
            hideResults: this.hideSearchResults,
            limit: 50,
            textLabel: this.context.getMessage('user.7'),
            className: "media-small-hide"
        });

        var headerButtons = [];
        var renderActionsFunc = function renderActionsFunc() {
            return [];
        };
        var openEditor = null;
        var multipleActions = [];
        if (accessByName('Create')) {
            renderActionsFunc = this.renderNodeActions.bind(this);
            multipleActions = [pydio.Controller.getActionByName('delete')];
            openEditor = this.openRoleEditor.bind(this);
            headerButtons = [_react2['default'].createElement(_materialUi.FlatButton, _extends({ primary: true, label: this.context.getMessage("user.1"), onTouchTap: this.createUserAction }, styles.props.header.flatButton)), _react2['default'].createElement(_materialUi.FlatButton, _extends({ primary: true, label: this.context.getMessage("user.2"), onTouchTap: this.createGroupAction }, styles.props.header.flatButton))];
        }

        var profileFilter = '';
        if (currentNode.getMetadata().has('userProfileFilter')) {
            profileFilter = currentNode.getMetadata().get('userProfileFilter');
        }

        var iconColor = profileFilter === '' ? 'rgba(0,0,0,0.4)' : muiTheme.palette.accent1Color;
        var filterIcon = _react2['default'].createElement(
            _materialUi.IconMenu,
            {
                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { style: { marginRight: -16, marginLeft: 8 }, iconStyle: { color: iconColor }, iconClassName: "mdi mdi-filter-variant", tooltip: this.context.getMessage('user.filter.tooltip'), tooltipPosition: "bottom-left" }),
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                targetOrigin: { horizontal: 'right', vertical: 'top' },
                value: profileFilter,
                onChange: function (e, val) {
                    _this5.applyFilter(val);
                },
                desktop: true
            },
            _react2['default'].createElement(_materialUi.MenuItem, { value: "", primaryText: this.context.getMessage('user.filter.all') }),
            _react2['default'].createElement(_materialUi.MenuItem, { value: "!shared", primaryText: this.context.getMessage('user.filter.internal') }),
            _react2['default'].createElement(_materialUi.MenuItem, { value: "shared", primaryText: this.context.getMessage('user.filter.shared') }),
            _react2['default'].createElement(_materialUi.MenuItem, { value: "admin", primaryText: this.context.getMessage('user.filter.admins') }),
            _react2['default'].createElement(_materialUi.Divider, null),
            _react2['default'].createElement(_materialUi.MenuItem, { value: "toggle-anon", primaryText: this.context.getMessage('user.filter.anon'), secondaryText: showAnon ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null })
        );

        var _AdminComponents$AdminStyles = AdminComponents.AdminStyles();

        var body = _AdminComponents$AdminStyles.body;

        var blockProps = body.block.props;
        var blockStyle = body.block.container;
        var groupHeaderStyle = _extends({
            height: 48,
            lineHeight: '48px',
            fontSize: 12,
            fontWeight: 500
        }, body.block.header, {
            borderBottom: '1px solid ' + body.tableMaster.row.borderBottomColor,
            padding: '0 20px'
        });
        var groupPanelStyle = {
            width: 226,
            borderRight: '1px solid' + body.tableMaster.row.borderBottomColor,
            overflowY: 'auto',
            flex: 'none'
        };
        if (searchResultData !== false) {
            groupPanelStyle = _extends({}, groupPanelStyle, { opacity: 0.6 });
        }

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout people-dashboard" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('2', 'settings'),
                icon: 'mdi mdi-account-multiple',
                actions: headerButtons,
                centerContent: searchBox
            }),
            _react2['default'].createElement(
                _materialUi.Paper,
                _extends({}, blockProps, { style: blockStyle, className: "horizontal-layout layout-fill" }),
                _react2['default'].createElement(
                    'div',
                    { className: 'hide-on-vertical-layout vertical-layout tab-vertical-layout', style: groupPanelStyle },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        _react2['default'].createElement(
                            'div',
                            { style: groupHeaderStyle },
                            this.context.getMessage("user.3")
                        ),
                        _react2['default'].createElement(PydioComponents.DNDTreeView, {
                            showRoot: true,
                            rootLabel: this.context.getMessage("user.5"),
                            node: rootNode,
                            dataModel: this.props.dataModel,
                            className: 'users-groups-tree',
                            paddingOffset: 10
                        })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { zDepth: 0, className: 'layout-fill vertical-layout people-list' },
                    _react2['default'].createElement(PydioComponents.SimpleList, {
                        ref: 'mainlist',
                        pydio: pydio,
                        node: currentNode,
                        dataModel: dataModel,
                        clearSelectionOnReload: false,
                        openEditor: openEditor,
                        entryRenderIcon: this.renderListUserAvatar.bind(this),
                        entryRenderFirstLine: this.renderListEntryFirstLine.bind(this),
                        entryRenderSecondLine: this.renderListEntrySecondLine.bind(this),
                        entryEnableSelector: this.renderListEntrySelector.bind(this),
                        entryRenderActions: renderActionsFunc,
                        searchResultData: searchResultData,
                        elementHeight: PydioComponents.SimpleList.HEIGHT_TWO_LINES,
                        hideToolbar: false,
                        toolbarStyle: {
                            backgroundColor: body.block.header.backgroundColor,
                            height: 48,
                            borderBottom: groupHeaderStyle.borderBottom
                        },
                        multipleActions: multipleActions,
                        additionalActions: filterIcon,
                        filterNodes: this.filterNodes.bind(this)
                    })
                )
            )
        );
    }

});

exports['default'] = Dashboard = (0, _materialUiStyles.muiThemeable)()(Dashboard);
exports['default'] = Dashboard;
module.exports = exports['default'];

},{"../editor/Editor":22,"../editor/util/ClassLoader":54,"./Callbacks":11,"./UsersSearchBox":15,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","pydio/util/func":"pydio/util/func","react":"react"}],13:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUiStyles = require('material-ui/styles');

var _uuid = require('uuid');

var _policiesPolicy = require('../policies/Policy');

var _policiesPolicy2 = _interopRequireDefault(_policiesPolicy);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var ResourceGroups = ["acl", "rest", "oidc"];

var PoliciesBoard = _react2['default'].createClass({
    displayName: 'PoliciesBoard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired,
        readonly: _react2['default'].PropTypes.bool
    },

    componentWillMount: function componentWillMount() {
        this.listPolicies();
    },

    getInitialState: function getInitialState() {
        return { policies: {}, popoverOpen: false, anchorEl: null };
    },

    groupByResourcesGroups: function groupByResourcesGroups(policies) {
        var result = [];
        ResourceGroups.map(function (k) {

            var groupPolicies = policies.PolicyGroups.filter(function (pol) {
                var g = pol.ResourceGroup || 'rest';
                return g === k;
            });
            if (groupPolicies.length) {
                groupPolicies.sort(function (a, b) {
                    return a.Name.toLowerCase() < b.Name.toLowerCase() ? -1 : a.Name.toLowerCase() === b.Name.toLowerCase() ? 0 : 1;
                });
                result[k] = groupPolicies;
            }
        });

        return result;
    },

    listPolicies: function listPolicies() {
        var _this = this;

        this.setState({ loading: true });
        var api = new _pydioHttpRestApi.PolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
        _pydio2['default'].startLoading();
        api.listPolicies(new _pydioHttpRestApi.IdmListPolicyGroupsRequest()).then(function (data) {
            _pydio2['default'].endLoading();
            var grouped = _this.groupByResourcesGroups(data);
            _this.setState({ policies: grouped, loading: false });
        })['catch'](function (reason) {
            _pydio2['default'].endLoading();
            _this.setState({ error: reason, loading: false });
        });
    },

    /**
     *
     * @param policy IdmPolicyGroup
     * @param revertOnly
     */
    savePolicy: function savePolicy(policy, revertOnly) {
        "use strict";

        var _this2 = this;

        if (revertOnly) {
            this.listPolicies();
            return;
        }
        _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
            var api = new sdk.EnterprisePolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.putPolicy(policy).then(function () {
                _this2.listPolicies();
            })['catch'](function (reason) {
                _this2.setState({ error: reason });
            });
        });
    },

    deletePolicy: function deletePolicy(policy) {
        var _this3 = this;

        var pydio = this.props.pydio;

        pydio.UI.openConfirmDialog({
            message: pydio.MessageHash['ajxp_admin.policies.policy.delete.confirm'],
            destructive: [policy.Name],
            validCallback: function validCallback() {
                _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                    var api = new sdk.EnterprisePolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
                    api.deletePolicy(policy.Uuid).then(function () {
                        _this3.listPolicies();
                    })['catch'](function (reason) {
                        _this3.setState({ error: reason });
                    });
                });
            }
        });
    },

    createPolicy: function createPolicy(event) {
        var _refs = this.refs;
        var newPolicyName = _refs.newPolicyName;
        var newPolicyDescription = _refs.newPolicyDescription;
        var newPolicyType = this.state.newPolicyType;

        var newId = (0, _uuid.v4)();

        var policy = {
            Uuid: newId,
            Name: newPolicyName.getValue(),
            Description: newPolicyDescription.getValue(),
            ResourceGroup: newPolicyType,
            Policies: []
        };

        var policies = _extends({}, this.state.policies);
        if (!policies[newPolicyType]) {
            policies[newPolicyType] = [];
        }
        policies[newPolicyType].push(policy);
        this.setState({
            policies: policies,
            popoverOpen: false,
            newPolicyId: newId
        });
    },

    openPopover: function openPopover(event) {
        "use strict";
        // This prevents ghost click.

        var _this4 = this;

        event.preventDefault();
        this.setState({
            newPolicyType: 'acl',
            popoverOpen: true,
            anchorEl: event.currentTarget
        }, function () {
            setTimeout(function () {
                _this4.refs.newPolicyName.focus();
            }, 200);
        });
    },

    handleRequestClose: function handleRequestClose() {
        this.setState({ popoverOpen: false });
    },

    handleChangePolicyType: function handleChangePolicyType(event, index, value) {
        this.setState({ newPolicyType: value });
    },

    render: function render() {
        var _this5 = this;

        var _props = this.props;
        var muiTheme = _props.muiTheme;
        var currentNode = _props.currentNode;
        var pydio = _props.pydio;
        var accessByName = _props.accessByName;
        var readonly = this.props.readonly;

        readonly = readonly || !accessByName('Create');
        var _state = this.state;
        var policies = _state.policies;
        var selectedPolicy = _state.selectedPolicy;
        var newPolicyId = _state.newPolicyId;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.policies.' + id] || id;
        };
        var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        var columns = [{ name: 'Name', label: m('policy.name'), style: { fontSize: 15 }, sorter: { type: 'string', 'default': true } }, { name: 'Rules', label: m('policy.rules'), style: { width: 80, textAlign: 'center' }, headerStyle: { width: 80, textAlign: 'center' }, renderCell: function renderCell(row) {
                return row.Policies.length;
            }, sorter: { type: 'number' } }, { name: 'Description', label: m('policy.description'), sorter: { type: 'string' } }];

        var actions = [];
        if (readonly) {
            actions.push({
                iconClassName: 'mdi mdi-eye',
                tooltip: m('policy.display'),
                onTouchTap: function onTouchTap(policy) {
                    return _this5.setState({ selectedPolicy: selectedPolicy === policy.Uuid ? null : policy.Uuid });
                }
            });
        } else {
            actions.push({
                iconClassName: 'mdi mdi-pencil',
                tooltip: m('policy.edit'),
                onTouchTap: function onTouchTap(policy) {
                    return _this5.setState({ selectedPolicy: selectedPolicy === policy.Uuid ? null : policy.Uuid });
                }
            });
            actions.push({
                iconClassName: 'mdi mdi-delete',
                tooltip: m('policy.delete'),
                onTouchTap: function onTouchTap(policy) {
                    _this5.deletePolicy(policy);
                }
            });
        }

        var tables = Object.keys(policies).map(function (k) {
            if (readonly && k === 'acl') {
                return null;
            }
            var data = policies[k];
            var dd = data.map(function (policy) {
                if (policy.Uuid === selectedPolicy) {
                    return _extends({}, policy, { expandedRow: _react2['default'].createElement(_policiesPolicy2['default'], _extends({}, _this5.props, {
                            readonly: readonly,
                            key: policy.Name,
                            policy: policy,
                            savePolicy: _this5.savePolicy.bind(_this5),
                            deletePolicy: _this5.deletePolicy.bind(_this5),
                            newPolicyWithRule: newPolicyId === policy.Uuid ? policy.Name : null
                        })) });
                } else {
                    return policy;
                }
            });
            var title = m('type.' + k + '.title');
            var legend = m('type.' + k + '.legend');
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(AdminComponents.SubHeader, { title: title, legend: legend }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    _extends({}, adminStyles.body.block.props, { style: adminStyles.body.block.container }),
                    _react2['default'].createElement(MaterialTable, {
                        data: dd,
                        columns: columns,
                        actions: actions,
                        deselectOnClickAway: true,
                        showCheckboxes: false,
                        masterStyles: adminStyles.body.tableMaster
                    })
                )
            );
        });

        var action = _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(_materialUi.FlatButton, _extends({}, adminStyles.props.header.flatButton, {
                primary: true,
                onTouchTap: this.openPopover.bind(this),
                label: m('policy.new')
            })),
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    open: this.state.popoverOpen,
                    anchorEl: this.state.anchorEl,
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    onRequestClose: this.handleRequestClose.bind(this)
                },
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 12px' } },
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('policy.name'), ref: 'newPolicyName' }),
                        _react2['default'].createElement('br', null),
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('policy.description'), ref: 'newPolicyDescription' }),
                        _react2['default'].createElement('br', null),
                        _react2['default'].createElement(
                            _materialUi.SelectField,
                            {
                                floatingLabelText: m('policy.type'),
                                ref: 'newPolicyType',
                                value: this.state.newPolicyType || 'rest',
                                onChange: this.handleChangePolicyType.bind(this)
                            },
                            ResourceGroups.map(function (k) {
                                return _react2['default'].createElement(_materialUi.MenuItem, { value: k, primaryText: m('type.' + k + '.title') });
                            })
                        )
                    ),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'right', padding: '6px 12px' } },
                        _react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onTouchTap: this.handleRequestClose.bind(this) }),
                        _react2['default'].createElement(_materialUi.FlatButton, { label: m('policy.create'), onTouchTap: this.createPolicy.bind(this) })
                    )
                )
            )
        );

        return _react2['default'].createElement(
            'div',
            { className: 'vertical-layout', style: { height: '100%' } },
            _react2['default'].createElement(AdminComponents.Header, {
                title: currentNode.getLabel(),
                icon: currentNode.getMetadata().get('icon_class'),
                actions: readonly ? null : action,
                reloadAction: this.listPolicies.bind(this),
                loading: this.state.loading
            }),
            _react2['default'].createElement(
                'div',
                { className: 'layout-fill' },
                tables
            )
        );
    }

});

exports['default'] = PoliciesBoard = (0, _materialUiStyles.muiThemeable)()(PoliciesBoard);
exports['default'] = PoliciesBoard;
module.exports = exports['default'];

},{"../policies/Policy":59,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","react":"react","uuid":2}],14:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _editorEditor = require('../editor/Editor');

var _editorEditor2 = _interopRequireDefault(_editorEditor);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _editorUtilClassLoader = require("../editor/util/ClassLoader");

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var RolesDashboard = _react2['default'].createClass({
    displayName: 'RolesDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return {
            roles: [],
            loading: false,
            showTechnical: false
        };
    },

    load: function load() {
        var _this = this;

        var showTechnical = this.state.showTechnical;

        this.setState({ loading: true });
        _pydio2['default'].startLoading();
        _pydioHttpApi2['default'].getRestClient().getIdmApi().listRoles(showTechnical, 0, 1000).then(function (roles) {
            _pydio2['default'].endLoading();
            _this.setState({ roles: roles, loading: false });
        })['catch'](function (e) {
            _pydio2['default'].endLoading();
            _this.setState({ loading: false });
        });
    },

    componentDidMount: function componentDidMount() {
        this.load();
    },

    openTableRows: function openTableRows(rows) {
        if (rows.length && rows[0].role.PoliciesContextEditable) {
            this.openRoleEditor(rows[0].role);
        }
    },

    openRoleEditor: function openRoleEditor(idmRole) {
        var _this2 = this;

        var initialSection = arguments.length <= 1 || arguments[1] === undefined ? 'activity' : arguments[1];
        var _props = this.props;
        var pydio = _props.pydio;
        var rolesEditorClass = _props.rolesEditorClass;
        var rolesEditorProps = _props.rolesEditorProps;

        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        (0, _editorUtilClassLoader.loadEditorClass)(rolesEditorClass, _editorEditor2['default']).then(function (component) {
            _this2.props.openRightPane({
                COMPONENT: component,
                PROPS: _extends({
                    ref: "editor",
                    idmRole: idmRole,
                    pydio: pydio,
                    initialEditSection: initialSection,
                    onRequestTabClose: _this2.closeRoleEditor
                }, rolesEditorProps)
            });
        });
        return true;
    },

    closeRoleEditor: function closeRoleEditor() {
        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
        return true;
    },

    deleteAction: function deleteAction(roleId) {
        var _this3 = this;

        var pydio = this.props.pydio;

        pydio.UI.openConfirmDialog({
            message: pydio.MessageHash['settings.126'],
            destructive: [roleId],
            validCallback: function validCallback() {
                _pydioHttpApi2['default'].getRestClient().getIdmApi().deleteRole(roleId).then(function () {
                    _this3.load();
                });
            }
        });
    },

    createRoleAction: function createRoleAction() {
        var _this4 = this;

        pydio.UI.openComponentInModal('AdminPeople', 'Forms.CreateRoleOrGroupForm', {
            type: 'role',
            roleNode: this.state.currentNode,
            openRoleEditor: this.openRoleEditor.bind(this),
            reload: function reload() {
                _this4.load();
            }
        });
    },

    computeTableData: function computeTableData(searchRoleString) {
        var roles = this.state.roles;

        var data = [];
        roles.map(function (role) {
            var label = role.Label;
            if (searchRoleString && label.toLowerCase().indexOf(searchRoleString.toLowerCase()) === -1) {
                return;
            }
            data.push({
                role: role,
                roleId: role.Uuid,
                roleLabel: label,
                isDefault: role.AutoApplies.join(', ') || '-',
                lastUpdated: role.LastUpdated
            });
        });
        return data;
    },

    render: function render() {
        var _this5 = this;

        var _props2 = this.props;
        var muiTheme = _props2.muiTheme;
        var accessByName = _props2.accessByName;

        var styles = AdminComponents.AdminStyles(muiTheme.palette);
        var _state = this.state;
        var searchRoleString = _state.searchRoleString;
        var showTechnical = _state.showTechnical;

        var hasEditRight = accessByName('Create');

        // Header Buttons & edit functions
        var selectRows = null;
        var buttons = [];
        if (hasEditRight) {
            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({}, styles.props.header.flatButton, { primary: true, label: this.context.getMessage("user.6"), onClick: this.createRoleAction.bind(this) })));
            selectRows = this.openTableRows.bind(this);
        }
        buttons.push(_react2['default'].createElement(
            _materialUi.IconMenu,
            {
                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-filter-variant" }, styles.props.header.iconButton)),
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                targetOrigin: { horizontal: 'right', vertical: 'top' },
                onChange: function () {
                    _this5.setState({ showTechnical: !showTechnical }, function () {
                        _this5.load();
                    });
                }
            },
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.context.getMessage('dashboard.technical.show', 'role_editor'), value: "show", rightIcon: showTechnical ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null }),
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.context.getMessage('dashboard.technical.hide', 'role_editor'), value: "hide", rightIcon: !showTechnical ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null })
        ));

        var searchBox = _react2['default'].createElement(
            'div',
            { style: { display: 'flex' } },
            _react2['default'].createElement('div', { style: { flex: 1 } }),
            _react2['default'].createElement(
                'div',
                { style: { width: 190 } },
                _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: this.context.getMessage('47', 'role_editor') + '...', value: searchRoleString || '', onChange: function (e, v) {
                        return _this5.setState({ searchRoleString: v });
                    } })
            )
        );
        var iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        var columns = [{ name: 'roleLabel', label: this.context.getMessage('32', 'role_editor'), style: { width: '35%', fontSize: 15 }, headerStyle: { width: '35%' }, sorter: { type: 'string', 'default': true } }, { name: 'lastUpdated', useMoment: true, label: this.context.getMessage('last_update', 'role_editor'), hideSmall: true, sorter: { type: 'number' } }, { name: 'isDefault', label: this.context.getMessage('114', 'settings'), style: { width: '20%' }, headerStyle: { width: '20%' }, hideSmall: true, sorter: { type: 'string' } }];

        var tableActions = [];
        if (hasEditRight) {
            tableActions.push({
                iconClassName: "mdi mdi-pencil",
                tooltip: 'Edit',
                onTouchTap: function onTouchTap(row) {
                    _this5.openRoleEditor(row.role);
                },
                disable: function disable(row) {
                    return !row.role.PoliciesContextEditable;
                }
            });
            tableActions.push({
                iconClassName: "mdi mdi-delete",
                tooltip: 'Delete',
                onTouchTap: function onTouchTap(row) {
                    _this5.deleteAction(row.role.Uuid);
                },
                disable: function disable(row) {
                    return !row.role.PoliciesContextEditable;
                }
            });
        }
        var data = this.computeTableData(searchRoleString);

        var _AdminComponents$AdminStyles = AdminComponents.AdminStyles();

        var body = _AdminComponents$AdminStyles.body;
        var tableMaster = body.tableMaster;

        var blockProps = body.block.props;
        var blockStyle = body.block.container;

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('69', 'settings'),
                icon: 'mdi mdi-account-multiple',
                actions: buttons,
                centerContent: searchBox,
                reloadAction: function () {
                    _this5.load();
                },
                loading: this.state.loading
            }),
            _react2['default'].createElement(
                'div',
                { className: "layout-fill" },
                _react2['default'].createElement(AdminComponents.SubHeader, { legend: this.context.getMessage("dashboard.description", "role_editor") }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    _extends({}, blockProps, { style: blockStyle }),
                    _react2['default'].createElement(MaterialTable, {
                        data: data,
                        columns: columns,
                        actions: tableActions,
                        onSelectRows: selectRows,
                        deselectOnClickAway: true,
                        showCheckboxes: false,
                        masterStyles: tableMaster,
                        paginate: [10, 25, 50, 100]
                    })
                )
            )
        );
    }

});

exports['default'] = RolesDashboard = muiThemeable()(RolesDashboard);
exports['default'] = RolesDashboard;
module.exports = exports['default'];

},{"../editor/Editor":22,"../editor/util/ClassLoader":54,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react"}],15:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Search input building a set of query parameters and calling
 * the callbacks to display / hide results
 */

var UsersSearchBox = (function (_React$Component) {
    _inherits(UsersSearchBox, _React$Component);

    function UsersSearchBox(props) {
        _classCallCheck(this, UsersSearchBox);

        _get(Object.getPrototypeOf(UsersSearchBox.prototype), 'constructor', this).call(this, props);
        var dm = new _pydioModelDataModel2['default']();
        dm.setRootNode(new _pydioModelNode2['default']());
        this.state = {
            dataModel: dm,
            displayResult: props.displayResultsState,
            crtValue: ''
        };
        this.searchDebounced = (0, _lodashDebounce2['default'])(this.triggerSearch, 350);
    }

    _createClass(UsersSearchBox, [{
        key: 'displayResultsState',
        value: function displayResultsState() {
            this.setState({
                displayResult: true
            });
        }
    }, {
        key: 'hideResultsState',
        value: function hideResultsState() {
            this.setState({
                displayResult: false
            });
            this.props.hideResults();
        }
    }, {
        key: 'triggerSearch',
        value: function triggerSearch() {
            var _this = this;

            var value = this.state.crtValue;
            if (!value) {
                this.hideResultsState();
                try {
                    this.refs.query.refs.input.blur();
                } catch (e) {}
                return;
            }
            var dm = this.state.dataModel;
            var limit = this.props.limit || 100;
            dm.getRootNode().setChildren([]);
            var p1 = _pydioHttpApi2['default'].getRestClient().getIdmApi().listGroups('/', value, true, 0, limit);
            var p2 = _pydioHttpApi2['default'].getRestClient().getIdmApi().listUsers('/', value, true, 0, limit);
            Promise.all([p1, p2]).then(function (result) {
                var groups = result[0];
                var users = result[1];
                groups.Groups.map(function (group) {
                    var label = group.Attributes && group.Attributes['displayName'] ? group.Attributes['displayName'] : group.GroupLabel;
                    var gNode = new _pydioModelNode2['default']('/idm/users' + _pydioUtilLang2['default'].trimRight(group.GroupPath, '/') + '/' + group.GroupLabel, false, label);
                    gNode.getMetadata().set('IdmUser', group);
                    gNode.getMetadata().set('ajxp_mime', 'group');
                    dm.getRootNode().addChild(gNode);
                });
                users.Users.map(function (user) {
                    var label = user.Attributes && user.Attributes['displayName'] ? user.Attributes['displayName'] : user.Login;
                    var uNode = new _pydioModelNode2['default']('/idm/users' + user.Login, true, label);
                    uNode.getMetadata().set('IdmUser', user);
                    uNode.getMetadata().set('ajxp_mime', 'user_editable');
                    dm.getRootNode().addChild(uNode);
                });
                dm.getRootNode().setLoaded(true);
                _this.displayResultsState();
                _this.props.displayResults(value, dm);
            });
        }
    }, {
        key: 'keyDown',
        value: function keyDown(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.triggerSearch();
            } else {
                this.searchDebounced();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var crtValue = this.state.crtValue;

            return _react2['default'].createElement(
                'div',
                { className: this.props.className ? this.props.className : '', style: _extends({ display: 'flex', alignItems: 'center' }, this.props.style) },
                _react2['default'].createElement('div', { style: { flex: 1 } }),
                _react2['default'].createElement(
                    'div',
                    { style: { maxWidth: 190 } },
                    _react2['default'].createElement(
                        'form',
                        { autoComplete: "off" },
                        _react2['default'].createElement(ModernTextField, {
                            ref: "query",
                            onKeyDown: this.keyDown.bind(this),
                            hintText: this.props.textLabel,
                            fullWidth: true,
                            value: crtValue,
                            onChange: function (e, v) {
                                _this2.setState({ crtValue: v });
                            }
                        })
                    )
                )
            );
        }
    }]);

    return UsersSearchBox;
})(_react2['default'].Component);

UsersSearchBox.PropTypes = {
    textLabel: _react2['default'].PropTypes.string,
    displayResults: _react2['default'].PropTypes.func,
    hideResults: _react2['default'].PropTypes.func,
    displayResultsState: _react2['default'].PropTypes.bool,
    limit: _react2['default'].PropTypes.number,
    style: _react2['default'].PropTypes.object
};

exports['default'] = UsersSearchBox;
module.exports = exports['default'];

},{"lodash.debounce":"lodash.debounce","material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","pydio/util/lang":"pydio/util/lang","react":"react"}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _WorkspaceAcl = require('./WorkspaceAcl');

var _WorkspaceAcl2 = _interopRequireDefault(_WorkspaceAcl);

var PagesAcls = (function (_React$Component) {
    _inherits(PagesAcls, _React$Component);

    function PagesAcls(props) {
        _classCallCheck(this, PagesAcls);

        _get(Object.getPrototypeOf(PagesAcls.prototype), 'constructor', this).call(this, props);
        var m = function m(id) {
            return props.pydio.MessageHash['pydio_role.' + id] || id;
        };

        var workspaces = [];
        var homepageWorkspace = new _pydioHttpRestApi.IdmWorkspace();
        homepageWorkspace.UUID = "homepage";
        homepageWorkspace.Label = m('workspace.statics.home.title');
        homepageWorkspace.Description = m('workspace.statics.home.description');
        homepageWorkspace.Slug = "homepage";
        homepageWorkspace.RootNodes = { "homepage-ROOT": _pydioHttpRestApi.TreeNode.constructFromObject({ Uuid: "homepage-ROOT" }) };
        workspaces.push(homepageWorkspace);
        if (props.showSettings) {
            var settingsWorkspace = new _pydioHttpRestApi.IdmWorkspace();
            settingsWorkspace.UUID = "settings";
            settingsWorkspace.Label = m('workspace.statics.settings.title');
            settingsWorkspace.Description = m('workspace.statics.settings.description');
            settingsWorkspace.Slug = "settings";
            settingsWorkspace.RootNodes = { "settings-ROOT": _pydioHttpRestApi.TreeNode.constructFromObject({ Uuid: "settings-ROOT" }) };
            workspaces.push(settingsWorkspace);
        }
        workspaces.sort(_pydioUtilLang2['default'].arraySorter('Label', false, true));
        this.state = { workspaces: workspaces };
    }

    _createClass(PagesAcls, [{
        key: 'render',
        value: function render() {
            var role = this.props.role;
            var workspaces = this.state.workspaces;

            if (!role) {
                return _react2['default'].createElement('div', null);
            }
            return _react2['default'].createElement(
                'div',
                { className: "material-list" },
                workspaces.map(function (ws) {
                    return _react2['default'].createElement(_WorkspaceAcl2['default'], { workspace: ws, role: role });
                })
            );
        }
    }]);

    return PagesAcls;
})(_react2['default'].Component);

exports['default'] = PagesAcls;
module.exports = exports['default'];

},{"./WorkspaceAcl":19,"pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],17:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require("../util/MessagesMixin");

var RightsSelector = (function (_React$Component) {
    _inherits(RightsSelector, _React$Component);

    /*
    propTypes:{
        acl:React.PropTypes.string,
        disabled:React.PropTypes.bool,
        hideDeny:React.PropTypes.bool,
        hideLabels:React.PropTypes.bool,
        onChange:React.PropTypes.func
    }
    */

    function RightsSelector(props) {
        _classCallCheck(this, RightsSelector);

        _get(Object.getPrototypeOf(RightsSelector.prototype), 'constructor', this).call(this, props);
        this.state = { acl: props.acl };
    }

    _createClass(RightsSelector, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            this.setState({ acl: newProps.acl });
        }
    }, {
        key: 'getAcl',
        value: function getAcl() {
            return this.state.acl;
        }
    }, {
        key: 'updateAcl',
        value: function updateAcl() {

            if (this.props.disabled) {
                return;
            }

            var d = this.refs.deny.isChecked();
            var r = !d && this.refs.read.isChecked();
            var w = !d && this.refs.write.isChecked();
            var acl = undefined;
            var parts = [];
            if (d) {
                parts.push('deny');
            } else {
                if (r) {
                    parts.push('read');
                }
                if (w) {
                    parts.push('write');
                }
            }
            acl = parts.join(",");
            if (this.props.onChange) {
                this.props.onChange(acl, this.props.acl);
            }
            this.setState({ acl: acl });
        }
    }, {
        key: 'handleChangePolicy',
        value: function handleChangePolicy(event, value) {
            var acl = 'policy:' + value;
            if (this.props.onChange) {
                this.props.onChange(acl, this.props.acl);
            } else {
                this.setState({ acl: acl });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var hideDeny = _props.hideDeny;
            var hideLabels = _props.hideLabels;
            var disabled = _props.disabled;
            var getMessage = _props.getMessage;

            var acl = this.state.acl || '';

            if (acl.startsWith('policy:')) {
                return _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', width: 132, height: 40 } },
                    'Custom policy'
                );
            }

            var checkboxStyle = { width: 44 };

            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', width: 132, height: 40 } },
                _react2['default'].createElement(_materialUi.Checkbox, { ref: 'read',
                    label: hideLabels ? "" : getMessage('react.5a', 'ajxp_admin'),
                    value: 'read',
                    onCheck: this.updateAcl.bind(this),
                    disabled: disabled || acl.indexOf('deny') > -1,
                    checked: acl.indexOf('deny') === -1 && acl.indexOf('read') !== -1,
                    style: checkboxStyle
                }),
                _react2['default'].createElement(_materialUi.Checkbox, {
                    ref: 'write',
                    label: hideLabels ? "" : getMessage('react.5b', 'ajxp_admin'),
                    value: 'write',
                    onCheck: this.updateAcl.bind(this),
                    disabled: disabled || acl.indexOf('deny') > -1,
                    checked: acl.indexOf('deny') === -1 && acl.indexOf('write') !== -1,
                    style: checkboxStyle }),
                !hideDeny && _react2['default'].createElement(_materialUi.Checkbox, {
                    ref: 'deny',
                    label: hideLabels ? "" : getMessage('react.5', 'ajxp_admin'),
                    value: '-',
                    disabled: disabled,
                    onCheck: this.updateAcl.bind(this),
                    checked: acl.indexOf('deny') !== -1,
                    style: checkboxStyle
                })
            );
        }
    }]);

    return RightsSelector;
})(_react2['default'].Component);

exports['default'] = (0, _utilMessagesMixin.withRoleMessages)(RightsSelector);
module.exports = exports['default'];

},{"../util/MessagesMixin":55,"material-ui":"material-ui","react":"react"}],18:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilMessagesMixin = require('../util/MessagesMixin');

var RightsSummary = (function (_React$Component) {
    _inherits(RightsSummary, _React$Component);

    function RightsSummary() {
        _classCallCheck(this, RightsSummary);

        _get(Object.getPrototypeOf(RightsSummary.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(RightsSummary, [{
        key: 'render',
        value: function render() {
            var getMessage = this.props.getMessage;

            var acl = undefined;
            switch (this.props.acl) {
                case 'read,write':
                    acl = getMessage('8');
                    break;
                case 'read':
                    acl = getMessage('9');
                    break;
                case 'write':
                    acl = getMessage('10');
                    break;
                case 'PYDIO_VALUE_CLEAR':
                    acl = getMessage('11');
                    break;
                default:
                    acl = getMessage('12');
            }
            return _react2['default'].createElement(
                'span',
                { className: 'summary-rights summary' },
                acl
            );
        }
    }]);

    return RightsSummary;
})(_react2['default'].Component);

exports['default'] = (0, _utilMessagesMixin.withRoleMessages)(RightsSummary);
module.exports = exports['default'];

},{"../util/MessagesMixin":55,"react":"react"}],19:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilMessagesMixin = require('../util/MessagesMixin');

var _RightsSelector = require('./RightsSelector');

var _RightsSelector2 = _interopRequireDefault(_RightsSelector);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var WorkspaceAcl = (function (_React$Component) {
    _inherits(WorkspaceAcl, _React$Component);

    function WorkspaceAcl() {
        _classCallCheck(this, WorkspaceAcl);

        _get(Object.getPrototypeOf(WorkspaceAcl.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(WorkspaceAcl, [{
        key: 'onAclChange',
        value: function onAclChange(newValue, oldValue) {
            var _props = this.props;
            var role = _props.role;
            var workspace = _props.workspace;

            role.updateAcl(workspace, null, newValue);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var workspace = _props2.workspace;
            var role = _props2.role;
            var getPydioRoleMessage = _props2.getPydioRoleMessage;

            if (!workspace.RootNodes || !Object.keys(workspace.RootNodes).length) {
                // This is not normal, a workspace should always have a root node!
                return _react2['default'].createElement(PydioComponents.ListEntry, {
                    className: "workspace-acl-entry",
                    firstLine: _react2['default'].createElement(
                        'span',
                        { style: { textDecoration: 'line-through', color: '#ef9a9a' } },
                        workspace.Label + ' (' + getPydioRoleMessage('workspace.roots.invalid') + ')'
                    )
                });
            }

            var _role$getAclString = role.getAclString(workspace);

            var aclString = _role$getAclString.aclString;
            var inherited = _role$getAclString.inherited;

            var action = _react2['default'].createElement(_RightsSelector2['default'], {
                acl: aclString,
                onChange: this.onAclChange.bind(this),
                hideLabels: true
            });

            var label = workspace.Label + (inherited ? ' (' + getPydioRoleMessage('38') + ')' : '');

            return _react2['default'].createElement(PydioComponents.ListEntry, {
                className: (inherited ? "workspace-acl-entry-inherited " : "") + "workspace-acl-entry",
                firstLine: label,
                actions: action
            });
        }
    }]);

    return WorkspaceAcl;
})(_react2['default'].Component);

exports['default'] = (0, _utilMessagesMixin.withRoleMessages)(WorkspaceAcl);
module.exports = exports['default'];

},{"../util/MessagesMixin":55,"./RightsSelector":17,"material-ui":"material-ui","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],20:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _WorkspaceAcl = require('./WorkspaceAcl');

var _WorkspaceAcl2 = _interopRequireDefault(_WorkspaceAcl);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;

var WorkspacesAcls = (function (_React$Component) {
    _inherits(WorkspacesAcls, _React$Component);

    function WorkspacesAcls(props) {
        var _this = this;

        _classCallCheck(this, WorkspacesAcls);

        _get(Object.getPrototypeOf(WorkspacesAcls.prototype), 'constructor', this).call(this, props);
        this.state = { loading: true, workspaces: [] };
        var api = new _pydioHttpRestApi.WorkspaceServiceApi(_pydioHttpApi2['default'].getRestClient());
        var request = new _pydioHttpRestApi.RestSearchWorkspaceRequest();
        request.Queries = [_pydioHttpRestApi.IdmWorkspaceSingleQuery.constructFromObject({
            scope: 'ADMIN'
        })];
        api.searchWorkspaces(request).then(function (collection) {
            var workspaces = collection.Workspaces || [];
            workspaces.sort(_pydioUtilLang2['default'].arraySorter('Label', false, true));
            _this.setState({ workspaces: workspaces, loading: false });
        })['catch'](function (e) {
            _this.setState({ loading: false });
        });
    }

    _createClass(WorkspacesAcls, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var role = _props.role;
            var advancedAcl = _props.advancedAcl;
            var _state = this.state;
            var workspaces = _state.workspaces;
            var loading = _state.loading;

            if (!role) {
                return _react2['default'].createElement('div', null);
            }
            var columns = [{
                name: 'acl',
                label: '',
                style: { paddingLeft: 0, paddingRight: 0 },
                renderCell: function renderCell(ws) {
                    return _react2['default'].createElement(_WorkspaceAcl2['default'], {
                        workspace: ws,
                        role: role,
                        advancedAcl: advancedAcl
                    });
                }
            }];

            return _react2['default'].createElement(
                'div',
                { className: "material-list" },
                _react2['default'].createElement(MaterialTable, {
                    data: workspaces,
                    columns: columns,
                    hideHeaders: true,
                    paginate: [10, 25, 50, 100],
                    defaultPageSize: 25,
                    showCheckboxes: false,
                    emptyStateString: loading ? _pydio2['default'].getInstance().MessageHash['ajxp_admin.home.6'] : ''
                })
            );
        }
    }]);

    return WorkspacesAcls;
})(_react2['default'].Component);

exports['default'] = WorkspacesAcls;
module.exports = exports['default'];

},{"./WorkspaceAcl":19,"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _PagesAcls = require('./PagesAcls');

var _PagesAcls2 = _interopRequireDefault(_PagesAcls);

var _RightsSelector = require('./RightsSelector');

var _RightsSelector2 = _interopRequireDefault(_RightsSelector);

var _RightsSummary = require('./RightsSummary');

var _RightsSummary2 = _interopRequireDefault(_RightsSummary);

var _WorkspaceAcl = require('./WorkspaceAcl');

var _WorkspaceAcl2 = _interopRequireDefault(_WorkspaceAcl);

var _WorkspacesAcls = require('./WorkspacesAcls');

var _WorkspacesAcls2 = _interopRequireDefault(_WorkspacesAcls);

var ACL = { PagesAcls: _PagesAcls2['default'], RightsSelector: _RightsSelector2['default'], RightsSummary: _RightsSummary2['default'], WorkspacesAcls: _WorkspacesAcls2['default'], WorkspaceAcl: _WorkspaceAcl2['default'] };

exports['default'] = ACL;
module.exports = exports['default'];

},{"./PagesAcls":16,"./RightsSelector":17,"./RightsSummary":18,"./WorkspaceAcl":19,"./WorkspacesAcls":20}],22:[function(require,module,exports){
(function (global){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelRole = require('./model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _modelUser = require('./model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _aclWorkspacesAcls = require('./acl/WorkspacesAcls');

var _aclWorkspacesAcls2 = _interopRequireDefault(_aclWorkspacesAcls);

var _aclPagesAcls = require('./acl/PagesAcls');

var _aclPagesAcls2 = _interopRequireDefault(_aclPagesAcls);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilPath = require("pydio/util/path");

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _materialUi = require("material-ui");

var _infoRoleInfo = require('./info/RoleInfo');

var _infoRoleInfo2 = _interopRequireDefault(_infoRoleInfo);

var _infoUserInfo = require('./info/UserInfo');

var _infoUserInfo2 = _interopRequireDefault(_infoUserInfo);

var _infoGroupInfo = require('./info/GroupInfo');

var _infoGroupInfo2 = _interopRequireDefault(_infoGroupInfo);

var _paramsParametersPanel = require('./params/ParametersPanel');

var _paramsParametersPanel2 = _interopRequireDefault(_paramsParametersPanel);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib.PaperEditorLayout;
var PaperEditorNavEntry = _Pydio$requireLib.PaperEditorNavEntry;
var PaperEditorNavHeader = _Pydio$requireLib.PaperEditorNavHeader;

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props, context) {
        var _this = this;

        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).call(this, props, context);
        if (props.node) {
            this.state = this.nodeToState(props.node);
        } else if (props.idmRole) {
            this.state = {
                idmRole: props.idmRole,
                roleType: "role",
                currentPane: 'info'
            };
            this.loadRoleData(true);
        }
        var loader = AdminComponents.PluginsLoader.getInstance(this.props.pydio);
        loader.loadPlugins().then(function (plugins) {
            _this.setState({ pluginsRegistry: plugins });
        });
    }

    _createClass(Editor, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            var _this2 = this;

            var _props = this.props;
            var node = _props.node;
            var idmRole = _props.idmRole;

            if (newProps.node !== node || newProps.idmRole !== idmRole) {
                if (newProps.node) {
                    this.setState(this.nodeToState(newProps.node));
                } else if (newProps.idmRole) {
                    this.setState({
                        idmRole: newProps.idmRole,
                        roleType: "role",
                        currentPane: 'info'
                    }, function () {
                        _this2.loadRoleData(true);
                    });
                }
            }
        }
    }, {
        key: 'nodeToState',
        value: function nodeToState(node) {
            var _this3 = this;

            var mime = node.getAjxpMime();
            var scope = mime === "group" ? "group" : "user";
            var observableUser = undefined;

            var idmUser = node.getMetadata().get("IdmUser");
            observableUser = new _modelUser2['default'](idmUser);
            observableUser.observe('update', function () {
                _this3.forceUpdate();
            });
            observableUser.load();

            return {
                observableUser: observableUser,
                roleLabel: _pydioUtilPath2['default'].getBasename(node.getPath()),
                roleType: scope,
                dirty: false,
                currentPane: 'info',
                localModalContent: {}
            };
        }
    }, {
        key: 'loadRoleData',
        value: function loadRoleData(showLoader) {
            var _this4 = this;

            if (showLoader) {
                this.setState({ loadingMessage: this.getMessage('home.6', 'ajxp_admin') });
            }
            var idmRole = this.state.idmRole;

            var role = new _modelRole2['default'](idmRole);
            role.load().then(function () {
                _this4.setState({ loadingMessage: null, observableRole: role });
                role.observe('update', function () {
                    _this4.forceUpdate();
                });
            });
        }
    }, {
        key: 'getChildContext',
        value: function getChildContext() {
            var messages = this.context.pydio.MessageHash;
            return {
                messages: messages,
                getMessage: function getMessage(messageId) {
                    var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];
                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                },
                getPydioRoleMessage: function getPydioRoleMessage(messageId) {
                    return messages['role_editor.' + messageId] || messageId;
                },
                getRootMessage: function getRootMessage(messageId) {
                    return messages[messageId] || messageId;
                }
            };
        }
    }, {
        key: 'getMessage',
        value: function getMessage(messageId) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];

            return this.getChildContext().getMessage(messageId, namespace);
        }
    }, {
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            return this.getChildContext().getMessage(messageId, 'role_editor');
        }
    }, {
        key: 'getRootMessage',
        value: function getRootMessage(messageId) {
            return this.getChildContext().getMessage(messageId, '');
        }
    }, {
        key: 'setSelectedPane',
        value: function setSelectedPane(key) {
            this.setState({ currentPane: key });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this5 = this;

            this.loadRoleData(true);
            if (this.props.registerCloseCallback) {
                this.props.registerCloseCallback(function () {
                    if (_this5.state && _this5.state.dirty && !global.confirm(_this5.getPydioRoleMessage('19'))) {
                        return false;
                    }
                });
            }
        }
    }, {
        key: 'showModal',
        value: function showModal(modal) {
            this.setState({ modal: modal });
        }
    }, {
        key: 'hideModal',
        value: function hideModal() {
            this.setState({ modal: null });
        }
    }, {
        key: 'logAction',
        value: function logAction(message) {
            this.setState({ snackbar: message, snackOpen: true });
        }
    }, {
        key: 'hideSnackBar',
        value: function hideSnackBar() {
            this.setState({ snackOpen: false });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _props2 = this.props;
            var advancedAcl = _props2.advancedAcl;
            var pydio = _props2.pydio;
            var _state = this.state;
            var observableRole = _state.observableRole;
            var observableUser = _state.observableUser;
            var pluginsRegistry = _state.pluginsRegistry;
            var currentPane = _state.currentPane;
            var modal = _state.modal;

            var title = '',
                infoTitle = '';
            var infoMenuTitle = this.getMessage('24'); // user information
            var otherForm = undefined;
            var pagesShowSettings = false;

            if (this.state.roleType === 'user') {

                var idmUser = observableUser.getIdmUser();
                title = idmUser.Attributes && idmUser.Attributes['displayName'] ? idmUser.Attributes['displayName'] : idmUser.Login;
                pagesShowSettings = idmUser.Attributes['profile'] === 'admin';
                otherForm = _react2['default'].createElement(_infoUserInfo2['default'], { user: observableUser, pydio: pydio, pluginsRegistry: pluginsRegistry });
            } else if (this.state.roleType === 'group') {

                infoTitle = this.getMessage('26'); // group information
                infoMenuTitle = this.getMessage('27');
                title = observableUser.getIdmUser().GroupLabel;
                if (observableUser.getIdmUser().Attributes && observableUser.getIdmUser().Attributes['displayName']) {
                    title = observableUser.getIdmUser().Attributes['displayName'];
                }
                otherForm = _react2['default'].createElement(_infoGroupInfo2['default'], { group: observableUser, pydio: pydio, pluginsRegistry: pluginsRegistry });
            } else if (this.state.roleType === 'role') {

                title = observableRole ? observableRole.getIdmRole().Label : '...';
                infoTitle = this.getMessage('28'); // role information
                infoMenuTitle = this.getMessage('29');
                pagesShowSettings = true;
                otherForm = _react2['default'].createElement(_infoRoleInfo2['default'], { role: observableRole, pydio: pydio, pluginsRegistry: pluginsRegistry });
            }

            var saveDisabled = true;
            var save = function save() {},
                revert = function revert() {};
            if (observableUser) {
                saveDisabled = !observableUser.isDirty();
                save = function () {
                    observableUser.save().then(_this6.props.afterSave);
                };
                revert = function () {
                    observableUser.revert();
                };
            } else if (observableRole) {
                saveDisabled = !observableRole.isDirty();
                save = function () {
                    observableRole.save(_this6.props.afterSave);
                };
                revert = function () {
                    observableRole.revert();
                };
            }

            var rightButtons = [PaperEditorLayout.actionButton(this.getMessage('plugins.6', 'ajxp_admin'), "mdi mdi-undo", revert, saveDisabled), PaperEditorLayout.actionButton(this.getRootMessage('53'), "mdi mdi-content-save", save, saveDisabled)];

            var leftNav = [_react2['default'].createElement(PaperEditorNavHeader, { key: '1', label: this.getMessage('ws.28', 'ajxp_admin') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'info', keyName: 'info', onClick: this.setSelectedPane.bind(this), label: infoMenuTitle, selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavHeader, { key: '2', label: this.getMessage('34') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'workspaces', keyName: 'workspaces', onClick: this.setSelectedPane.bind(this), label: this.getMessage('35'), selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'pages', keyName: 'pages', onClick: this.setSelectedPane.bind(this), label: this.getMessage('36'), selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavHeader, { key: '3', label: this.getMessage('37') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'params', keyName: 'params', onClick: this.setSelectedPane.bind(this), label: this.getMessage('38'), selectedKey: currentPane })];

            var panes = [];
            var classFor = function classFor(key) {
                return currentPane === key ? 'layout-fill' : '';
            };
            var styleFor = function styleFor(key) {
                return currentPane === key ? { overflow: 'auto' } : { height: 0, overflow: 'hidden' };
            };
            panes.push(_react2['default'].createElement(
                'div',
                { key: 'info', className: 'avatar-provider ' + classFor('info'), style: styleFor('info') },
                infoTitle && !this.state.loadingMessage ? _react2['default'].createElement(
                    'h3',
                    { className: 'paper-right-title' },
                    infoTitle
                ) : null,
                otherForm
            ));

            if (currentPane === 'workspaces') {
                panes.push(_react2['default'].createElement(
                    'div',
                    { key: 'workspaces', className: classFor('workspaces'), style: styleFor('workspaces') },
                    _react2['default'].createElement(
                        'h3',
                        { className: 'paper-right-title' },
                        this.getRootMessage('250'),
                        _react2['default'].createElement(
                            'div',
                            { className: 'section-legend' },
                            this.getMessage('43')
                        ),
                        _react2['default'].createElement(
                            'div',
                            { className: 'read-write-header' },
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-read' },
                                this.getMessage('react.5a', 'ajxp_admin')
                            ),
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-write' },
                                this.getMessage('react.5b', 'ajxp_admin')
                            ),
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-deny' },
                                this.getMessage('react.5', 'ajxp_admin')
                            )
                        ),
                        _react2['default'].createElement('br', null)
                    ),
                    _react2['default'].createElement(_aclWorkspacesAcls2['default'], {
                        key: 'workspaces-list',
                        role: observableUser ? observableUser.getRole() : observableRole,
                        roleType: this.state.roleType,
                        advancedAcl: advancedAcl,
                        showModal: this.showModal.bind(this),
                        hideModal: this.hideModal.bind(this)
                    })
                ));
            } else if (currentPane === 'pages') {
                panes.push(_react2['default'].createElement(
                    'div',
                    { key: 'pages', className: classFor('pages'), style: styleFor('pages') },
                    _react2['default'].createElement(
                        'h3',
                        { className: 'paper-right-title' },
                        this.getMessage('44'),
                        _react2['default'].createElement(
                            'div',
                            { className: 'section-legend' },
                            this.getMessage('45')
                        ),
                        _react2['default'].createElement(
                            'div',
                            { className: 'read-write-header' },
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-read' },
                                this.getMessage('react.5a', 'ajxp_admin')
                            ),
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-write' },
                                this.getMessage('react.5b', 'ajxp_admin')
                            ),
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-deny' },
                                this.getMessage('react.5', 'ajxp_admin')
                            )
                        ),
                        _react2['default'].createElement('br', null)
                    ),
                    _react2['default'].createElement(_aclPagesAcls2['default'], {
                        key: 'pages-list',
                        role: observableUser ? observableUser.getRole() : observableRole,
                        roleType: this.state.roleType,
                        advancedAcl: advancedAcl,
                        showModal: this.showModal.bind(this),
                        hideModal: this.hideModal.bind(this),
                        showSettings: pagesShowSettings,
                        pydio: pydio
                    })
                ));
            } else if (currentPane === 'params') {
                panes.push(_react2['default'].createElement(
                    'div',
                    { key: 'params', className: classFor('params'), style: styleFor('params') },
                    _react2['default'].createElement(_paramsParametersPanel2['default'], {
                        pydio: pydio,
                        role: observableUser ? observableUser.getRole() : observableRole,
                        roleType: this.state.roleType
                    })
                ));
            }

            var loadingMessage = null;
            if (this.state.loadingMessage) {
                loadingMessage = _react2['default'].createElement(
                    'div',
                    { className: 'loader-container layout-fill vertical-layout' },
                    _react2['default'].createElement(
                        'div',
                        { className: 'loader-message', style: { margin: 'auto', color: 'rgba(0,0,0,0.33)', fontWeight: '500', fontSize: 16 } },
                        this.state.loadingMessage
                    )
                );
            }
            return _react2['default'].createElement(
                PaperEditorLayout,
                {
                    title: title,
                    titleActionBar: rightButtons,
                    closeAction: function () {
                        _this6.props.onRequestTabClose();
                    },
                    contentFill: true,
                    leftNav: leftNav,
                    className: "edit-object-" + this.state.roleType
                },
                _react2['default'].createElement(_materialUi.Snackbar, {
                    message: this.state.snackbar || "",
                    open: this.state.snackOpen,
                    autoHideDuration: 4000,
                    ref: 'snack',
                    action: 'Dismiss',
                    onRequestClose: this.hideSnackBar.bind(this)
                }),
                modal,
                loadingMessage,
                panes
            );
        }
    }]);

    return Editor;
})(_react2['default'].Component);

Editor.contextTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default'])
};

Editor.childContextTypes = {
    messages: _react2['default'].PropTypes.object,
    getMessage: _react2['default'].PropTypes.func,
    getPydioRoleMessage: _react2['default'].PropTypes.func,
    getRootMessage: _react2['default'].PropTypes.func
};

Editor.propTypes = {
    node: _react2['default'].PropTypes.instanceOf(AjxpNode),
    closeEditor: _react2['default'].PropTypes.func,
    registerCloseCallback: _react2['default'].PropTypes.func
};

exports['default'] = Editor;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./acl/PagesAcls":42,"./acl/WorkspacesAcls":45,"./info/GroupInfo":46,"./info/RoleInfo":47,"./info/UserInfo":48,"./model/Role":49,"./model/User":50,"./params/ParametersPanel":52,"material-ui":"material-ui","pydio":"pydio","pydio/util/path":"pydio/util/path","react":"react"}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var GroupInfo = (function (_React$Component) {
    _inherits(GroupInfo, _React$Component);

    function GroupInfo(props) {
        var _this = this;

        _classCallCheck(this, GroupInfo);

        _get(Object.getPrototypeOf(GroupInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,"group")]|//param[contains(@scope,"group")]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(GroupInfo, [{
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var group = this.props.group;
            var parameters = this.state.parameters;

            var params = parameters.filter(function (p) {
                return p.name === paramName;
            });
            var idmUser = group.getIdmUser();
            var role = group.getRole();
            if (paramName === 'displayName' || paramName === 'email' || paramName === 'profile') {
                idmUser.Attributes[paramName] = newValue;
            } else if (params.length && params[0].aclKey) {
                role.setParameter(params[0].aclKey, newValue);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var group = _props.group;
            var pydio = _props.pydio;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            // Load group-scope parameters
            var values = {},
                locks = '';
            if (group) {
                (function () {
                    // Compute values
                    var idmUser = group.getIdmUser();
                    var role = group.getRole();
                    var label = idmUser.GroupLabel;
                    if (idmUser.Attributes && idmUser.Attributes['displayName']) {
                        label = idmUser.Attributes['displayName'];
                    }
                    values = {
                        groupPath: LangUtils.trimRight(idmUser.GroupPath, '/') + '/' + idmUser.GroupLabel,
                        displayName: label
                    };
                    parameters.map(function (p) {
                        if (p.aclKey && role.getParameterValue(p.aclKey)) {
                            values[p.name] = role.getParameterValue(p.aclKey);
                        }
                    });
                })();
            }
            var params = [{ "name": "groupPath", label: this.getPydioRoleMessage('34'), "type": "string", readonly: true }, { "name": "displayName", label: this.getPydioRoleMessage('35'), "type": "string" }].concat(_toConsumableArray(parameters));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(FormPanel, {
                    parameters: params,
                    onParameterChange: this.onParameterChange.bind(this),
                    values: values,
                    depth: -2
                })
            );
        }
    }]);

    return GroupInfo;
})(_react2['default'].Component);

GroupInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    group: _react2['default'].PropTypes.instanceOf(_modelUser2['default'])
};

exports['default'] = GroupInfo;
module.exports = exports['default'];

},{"../model/User":50,"pydio":"pydio","react":"react"}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelRole = require('../model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var RoleInfo = (function (_React$Component) {
    _inherits(RoleInfo, _React$Component);

    function RoleInfo(props) {
        var _this = this;

        _classCallCheck(this, RoleInfo);

        _get(Object.getPrototypeOf(RoleInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,\'role\')]|//param[contains(@scope,\'role\')]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(RoleInfo, [{
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var role = this.props.role;

            var idmRole = role.getIdmRole();
            if (paramName === "applies") {
                idmRole.AutoApplies = newValue.split(',');
            } else if (paramName === "roleLabel") {
                idmRole.Label = newValue;
            } else if (paramName === "roleForceOverride") {
                idmRole.ForceOverride = newValue;
            } else {
                var param = this.getParameterByName(paramName);
                if (param.aclKey) {
                    role.setParameter(param.aclKey, newValue);
                }
            }
        }
    }, {
        key: 'getParameterByName',
        value: function getParameterByName(paramName) {
            var parameters = this.state.parameters;

            return parameters.filter(function (p) {
                return p.name === paramName;
            })[0];
        }
    }, {
        key: 'render',
        value: function render() {
            var role = this.props.role;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            // Load role parameters
            var params = [{ "name": "roleId", label: this.getPydioRoleMessage('31'), "type": "string", readonly: true, description: this.getPydioRoleMessage('role.id.description') }, { "name": "roleLabel", label: this.getPydioRoleMessage('32'), "type": "string", description: this.getPydioRoleMessage('role.label.description') }, { "name": "applies", label: this.getPydioRoleMessage('33'), "type": "select", multiple: true, choices: 'admin|Administrators,standard|Standard,shared|Shared Users,anon|Anonymous', description: this.getPydioRoleMessage('role.autoapply.description') }, { "name": "roleForceOverride", label: "Always Override", "type": "boolean", description: this.getPydioRoleMessage('role.override.description') }].concat(_toConsumableArray(parameters));

            var values = { applies: [] };
            if (role) {
                var idmRole = role.getIdmRole();
                var applies = idmRole.AutoApplies || [];
                values = {
                    roleId: idmRole.Uuid,
                    applies: applies.filter(function (v) {
                        return !!v;
                    }), // filter empty values
                    roleLabel: idmRole.Label,
                    roleForceOverride: idmRole.ForceOverride || false
                };
                parameters.map(function (p) {
                    if (p.aclKey && role.getParameterValue(p.aclKey)) {
                        values[p.name] = role.getParameterValue(p.aclKey);
                    }
                });
            }
            //console.log(values);

            return _react2['default'].createElement(FormPanel, {
                parameters: params,
                onParameterChange: this.onParameterChange.bind(this),
                values: values,
                depth: -2
            });
        }
    }]);

    return RoleInfo;
})(_react2['default'].Component);

RoleInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    role: _react2['default'].PropTypes.instanceOf(_modelRole2['default'])
};

exports['default'] = RoleInfo;
module.exports = exports['default'];

},{"../model/Role":49,"pydio":"pydio","react":"react"}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _materialUi = require('material-ui');

var _userUserRolesPicker = require('../user/UserRolesPicker');

var _userUserRolesPicker2 = _interopRequireDefault(_userUserRolesPicker);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var UserInfo = (function (_React$Component) {
    _inherits(UserInfo, _React$Component);

    function UserInfo(props) {
        var _this = this;

        _classCallCheck(this, UserInfo);

        _get(Object.getPrototypeOf(UserInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,"user")]|//param[contains(@scope,"user")]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(UserInfo, [{
        key: 'getBinaryContext',
        value: function getBinaryContext() {
            var user = this.props.user;

            return "user_id=" + user.getIdmUser().Login + (user.getIdmUser().Attributes && user.getIdmUser().Attributes['avatar'] ? '?' + user.getIdmUser().Attributes['avatar'] : '');
        }
    }, {
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var user = this.props.user;
            var parameters = this.state.parameters;

            var params = parameters.filter(function (p) {
                return p.name === paramName;
            });
            var idmUser = user.getIdmUser();
            var role = user.getRole();
            // do something
            if (paramName === 'displayName' || paramName === 'email' || paramName === 'profile' || paramName === 'avatar') {
                idmUser.Attributes[paramName] = newValue;
            } else if (params.length && params[0].aclKey) {
                role.setParameter(params[0].aclKey, newValue);
            }
        }
    }, {
        key: 'buttonCallback',
        value: function buttonCallback(action) {
            var user = this.props.user;

            if (action === "update_user_pwd") {
                this.props.pydio.UI.openComponentInModal('AdminPeople', 'Editor.User.UserPasswordDialog', { user: user });
            } else {
                (function () {
                    var idmUser = user.getIdmUser();
                    var lockName = action === 'user_set_lock-lock' ? 'logout' : 'pass_change';
                    var currentLocks = [];
                    if (idmUser.Attributes['locks']) {
                        var test = JSON.parse(idmUser.Attributes['locks']);
                        if (test && typeof test === "object") {
                            currentLocks = test;
                        }
                    }
                    if (currentLocks.indexOf(lockName) > -1) {
                        currentLocks = currentLocks.filter(function (l) {
                            return l !== lockName;
                        });
                        if (action === 'user_set_lock-lock') {
                            // Reset also the failedConnections attempts
                            delete idmUser.Attributes["failedConnections"];
                        }
                    } else {
                        currentLocks.push(lockName);
                    }
                    idmUser.Attributes['locks'] = JSON.stringify(currentLocks);
                    user.save();
                })();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var user = _props.user;
            var pydio = _props.pydio;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            var values = { profiles: [] };
            var locks = [];
            var rolesPicker = undefined;

            if (user) {
                (function () {
                    // Compute values
                    var idmUser = user.getIdmUser();
                    var role = user.getRole();
                    if (idmUser.Attributes['locks']) {
                        locks = JSON.parse(idmUser.Attributes['locks']) || [];
                        if (typeof locks === 'object' && locks.length === undefined) {
                            (function () {
                                // Backward compat issue
                                var arrL = [];
                                Object.keys(locks).forEach(function (k) {
                                    if (locks[k] === true) {
                                        arrL.push(k);
                                    }
                                });
                                locks = arrL;
                            })();
                        }
                    }
                    rolesPicker = _react2['default'].createElement(_userUserRolesPicker2['default'], {
                        profile: idmUser.Attributes ? idmUser.Attributes['profile'] : '',
                        roles: idmUser.Roles,
                        addRole: function (r) {
                            return user.addRole(r);
                        },
                        removeRole: function (r) {
                            return user.removeRole(r);
                        },
                        switchRoles: function (r1, r2) {
                            return user.switchRoles(r1, r2);
                        }
                    });

                    var attributes = idmUser.Attributes || {};
                    values = _extends({}, values, {
                        avatar: attributes['avatar'],
                        displayName: attributes['displayName'],
                        email: attributes['email'],
                        profile: attributes['profile'],
                        login: idmUser.Login
                    });
                    parameters.map(function (p) {
                        if (p.aclKey && role.getParameterValue(p.aclKey)) {
                            values[p.name] = role.getParameterValue(p.aclKey);
                        }
                    });
                })();
            }
            var params = [{ name: "login", label: this.getPydioRoleMessage('21'), description: pydio.MessageHash['pydio_role.31'], "type": "string", readonly: true }, { name: "profile", label: this.getPydioRoleMessage('22'), description: pydio.MessageHash['pydio_role.32'], "type": "select", choices: 'admin|Administrator,standard|Standard,shared|Shared' }].concat(_toConsumableArray(parameters));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h3',
                    { className: "paper-right-title", style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        pydio.MessageHash['pydio_role.24'],
                        _react2['default'].createElement(
                            'div',
                            { className: "section-legend" },
                            pydio.MessageHash['pydio_role.54']
                        )
                    ),
                    _react2['default'].createElement(
                        _materialUi.IconMenu,
                        {
                            iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical" }),
                            anchorOrigin: { horizontal: 'right', vertical: 'top' },
                            targetOrigin: { horizontal: 'right', vertical: 'top' },
                            tooltip: "Actions"
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage('25'), onTouchTap: function () {
                                return _this2.buttonCallback('update_user_pwd');
                            } }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage(locks.indexOf('logout') > -1 ? '27' : '26'), onTouchTap: function () {
                                return _this2.buttonCallback('user_set_lock-lock');
                            } }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage(locks.indexOf('pass_change') > -1 ? '28b' : '28'), onTouchTap: function () {
                                return _this2.buttonCallback('user_set_lock-pass_change');
                            } })
                    )
                ),
                _react2['default'].createElement(FormPanel, {
                    parameters: params,
                    onParameterChange: this.onParameterChange.bind(this),
                    values: values,
                    depth: -2,
                    binary_context: this.getBinaryContext()
                }),
                rolesPicker
            );
        }
    }]);

    return UserInfo;
})(_react2['default'].Component);

UserInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    user: _react2['default'].PropTypes.instanceOf(_modelUser2['default'])
};

exports['default'] = UserInfo;
module.exports = exports['default'];

},{"../model/User":50,"../user/UserRolesPicker":53,"material-ui":"material-ui","pydio":"pydio","react":"react"}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GroupInfo = require('./GroupInfo');

var _GroupInfo2 = _interopRequireDefault(_GroupInfo);

var _RoleInfo = require('./RoleInfo');

var _RoleInfo2 = _interopRequireDefault(_RoleInfo);

var _UserInfo = require('./UserInfo');

var _UserInfo2 = _interopRequireDefault(_UserInfo);

var Info = { GroupInfo: _GroupInfo2['default'], RoleInfo: _RoleInfo2['default'], UserInfo: _UserInfo2['default'] };

exports['default'] = Info;
module.exports = exports['default'];

},{"./GroupInfo":23,"./RoleInfo":24,"./UserInfo":25}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _uuid = require('uuid');

var Role = (function (_Observable) {
    _inherits(Role, _Observable);

    /**
     *
     * @param idmRole {IdmRole}
     * @param parentRoles {IdmRole[]}
     */

    function Role(idmRole) {
        var parentRoles = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        _classCallCheck(this, Role);

        _get(Object.getPrototypeOf(Role.prototype), 'constructor', this).call(this);
        this.acls = [];
        this.dirty = false;
        this.parentRoles = parentRoles;
        this.parentAcls = {};

        if (idmRole) {
            this.idmRole = idmRole;
        } else {
            this.idmRole = new _pydioHttpRestApi.IdmRole();
            this.idmRole.Uuid = (0, _uuid.v4)();
        }
        this.makeSnapshot();
    }

    _createClass(Role, [{
        key: 'load',
        value: function load() {
            return this.loadAcls();
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.dirty;
        }

        /**
         * @return {IdmRole}
         */
    }, {
        key: 'getIdmRole',
        value: function getIdmRole() {
            return this.buildProxy(this.idmRole);
        }
    }, {
        key: 'makeSnapshot',
        value: function makeSnapshot() {
            var _this = this;

            this.snapshot = _pydioHttpRestApi.IdmRole.constructFromObject(JSON.parse(JSON.stringify(this.idmRole)));
            this.aclSnapshot = [];
            this.acls.forEach(function (acl) {
                _this.aclSnapshot.push(_pydioHttpRestApi.IdmACL.constructFromObject(JSON.parse(JSON.stringify(acl))));
            });
        }
    }, {
        key: 'updateParentRoles',
        value: function updateParentRoles(roles) {
            var _this2 = this;

            this.parentRoles = roles;
            this.loadAcls(true).then(function () {
                _this2.notify("update");
            });
        }

        /**
         * In Action, replace policy / pName to policy:pName
         * @param acls [IdmACL]
         * @return [IdmACL]
         */
    }, {
        key: 'loadAcls',

        /**
         * @return {Promise<any>}
         */
        value: function loadAcls() {
            var _q$RoleIDs,
                _this3 = this;

            var parentsOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var api = new _pydioHttpRestApi.ACLServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestSearchACLRequest();
            request.Queries = [];
            var q = new _pydioHttpRestApi.IdmACLSingleQuery();
            q.RoleIDs = [];
            if (!parentsOnly) {
                q.RoleIDs = [this.idmRole.Uuid];
            }
            (_q$RoleIDs = q.RoleIDs).push.apply(_q$RoleIDs, _toConsumableArray(this.parentRoles.map(function (pRole) {
                return pRole.Uuid;
            })));
            request.Queries.push(q);
            return api.searchAcls(request).then(function (collection) {
                var acls = Role.FormatPolicyAclFromStore(collection.ACLs || []);
                if (_this3.parentRoles.length) {
                    if (!parentsOnly) {
                        _this3.acls = acls.filter(function (acl) {
                            return acl.RoleID === _this3.idmRole.Uuid;
                        });
                    }
                    _this3.parentRoles.forEach(function (r) {
                        _this3.parentAcls[r.Uuid] = acls.filter(function (acl) {
                            return acl.RoleID === r.Uuid;
                        });
                    });
                } else {
                    _this3.acls = acls;
                }
                if (!parentsOnly) {
                    _this3.makeSnapshot();
                }
            });
        }

        /**
         * Revert to previous snapshot
         */
    }, {
        key: 'revert',
        value: function revert() {
            this.idmRole = this.snapshot;
            this.acls = this.aclSnapshot;
            this.dirty = false;
            this.makeSnapshot();
            this.notify('update');
        }

        /**
         *
         * @return {Promise<any>}
         */
    }, {
        key: 'save',
        value: function save() {
            var _this4 = this;

            var rApi = new _pydioHttpRestApi.RoleServiceApi(_pydioHttpApi2['default'].getRestClient());
            var aclApi = new _pydioHttpRestApi.ACLServiceApi(_pydioHttpApi2['default'].getRestClient());
            return rApi.setRole(this.idmRole.Uuid, this.idmRole).then(function (newRole) {
                _this4.idmRole = newRole;
                // Remove previous acls
                var request = new _pydioHttpRestApi.RestSearchACLRequest();
                request.Queries = [];
                var q = new _pydioHttpRestApi.IdmACLSingleQuery();
                q.RoleIDs = [_this4.idmRole.Uuid];
                request.Queries.push(q);
                return aclApi.searchAcls(request).then(function (collection) {
                    var ps = [];
                    if (collection.ACLs) {
                        collection.ACLs.forEach(function (existing) {
                            ps.push(aclApi.deleteAcl(existing));
                        });
                    }
                    return Promise.all(ps).then(function (res) {
                        var p2 = [];
                        Role.FormatPolicyAclToStore(_this4.acls).forEach(function (acl) {
                            p2.push(aclApi.putAcl(acl));
                        });
                        return Promise.all(p2).then(function (results) {
                            var newAcls = [];
                            results.forEach(function (res) {
                                newAcls.push(res);
                            });
                            _this4.acls = Role.FormatPolicyAclFromStore(newAcls);
                            _this4.makeSnapshot();
                            _this4.dirty = false;
                            _this4.notify("update");
                        });
                    });
                });
            });
        }

        /**
         * Set a parameter value
         * @param aclKey
         * @param paramValue
         * @param scope
         */
    }, {
        key: 'setParameter',
        value: function setParameter(aclKey, paramValue) {
            var _this5 = this;

            var scope = arguments.length <= 2 || arguments[2] === undefined ? 'PYDIO_REPO_SCOPE_ALL' : arguments[2];

            var vals = this.acls.filter(function (acl) {
                return acl.Action.Name === aclKey && acl.WorkspaceID === scope;
            });
            if (vals.length) {
                (function () {
                    var foundAcl = vals[0];
                    // Check if we are switching back to an inherited value
                    var parentValue = undefined;
                    _this5.parentRoles.forEach(function (role) {
                        parentValue = _this5.getAclValue(_this5.parentAcls[role.Uuid], aclKey, scope, parentValue);
                    });
                    if (parentValue !== undefined && parentValue === paramValue) {
                        _this5.acls = _this5.acls.filter(function (acl) {
                            return acl !== foundAcl;
                        }); // Remove ACL
                    } else {
                            foundAcl.Action.Value = JSON.stringify(paramValue);
                        }
                })();
            } else {
                var acl = new _pydioHttpRestApi.IdmACL();
                acl.RoleID = this.idmRole.Uuid;
                acl.WorkspaceID = scope;
                acl.Action = new _pydioHttpRestApi.IdmACLAction();
                acl.Action.Name = aclKey;
                acl.Action.Value = JSON.stringify(paramValue);
                this.acls.push(acl);
            }
            this.dirty = true;
            this.notify('update');
        }

        /**
         *
         * @param acl {IdmACL}
         */
    }, {
        key: 'deleteParameter',
        value: function deleteParameter(acl) {
            this.acls = this.acls.filter(function (a) {
                return a !== acl;
            });
            this.dirty = true;
            this.notify('update');
        }

        /**
         * Get a parameter value
         * @param aclKey
         * @param scope
         * @return {*}
         */
    }, {
        key: 'getParameterValue',
        value: function getParameterValue(aclKey) {
            var _this6 = this;

            var scope = arguments.length <= 1 || arguments[1] === undefined ? 'PYDIO_REPO_SCOPE_ALL' : arguments[1];

            var value = undefined;
            this.parentRoles.forEach(function (role) {
                value = _this6.getAclValue(_this6.parentAcls[role.Uuid], aclKey, scope, value);
            });
            return this.getAclValue(this.acls, aclKey, scope, value);
        }

        /**
         *
         * @return {IdmACL[]}
         */
    }, {
        key: 'listParametersAndActions',
        value: function listParametersAndActions() {
            var _this7 = this;

            var filterParam = function filterParam(a) {
                return a.Action.Name && (a.Action.Name.indexOf("parameter:") === 0 || a.Action.Name.indexOf("action:") === 0);
            };

            var acls = this.acls || [];
            acls = acls.filter(filterParam);
            this.parentRoles.forEach(function (role) {
                var inherited = _this7.parentAcls[role.Uuid] || [];
                inherited = inherited.filter(filterParam).filter(function (a) {
                    return !acls.filter(function (f) {
                        return f.Action.Name === a.Action.Name;
                    }).length; // add only if not already set in main role
                }).map(function (a) {
                    var copy = _pydioHttpRestApi.IdmACL.constructFromObject(JSON.parse(JSON.stringify(a)));
                    copy.INHERITED = true;
                    return copy;
                });
                acls = [].concat(_toConsumableArray(acls), _toConsumableArray(inherited));
            });

            return acls;
        }
    }, {
        key: 'getAclValue',
        value: function getAclValue(aclArray, aclKey, scope, previousValue) {
            if (!aclArray) {
                return previousValue;
            }
            var vals = aclArray.filter(function (acl) {
                return acl.Action.Name === aclKey && acl.WorkspaceID === scope;
            });
            try {
                return JSON.parse(vals[0].Action.Value);
            } catch (e) {
                return previousValue;
            }
        }

        /**
         * @param workspace {IdmWorkspace}
         * @param nodeUuid string
         */
    }, {
        key: 'getAclString',
        value: function getAclString(workspace, nodeUuid) {
            var _this8 = this;

            var inherited = false;
            var wsId = undefined,
                nodeId = undefined;
            if (workspace) {
                var rootNodes = workspace.RootNodes;
                var firstRoot = rootNodes[Object.keys(rootNodes).shift()];
                wsId = workspace.UUID;
                nodeId = firstRoot.Uuid;
            } else {
                nodeId = nodeUuid;
            }

            var rights = undefined;
            var parentRights = undefined;
            this.parentRoles.forEach(function (role) {
                var parentRight = _this8._aclStringForAcls(_this8.parentAcls[role.Uuid], wsId, nodeId);
                if (parentRight !== undefined) {
                    parentRights = parentRight;
                }
            });
            var roleRigts = this._aclStringForAcls(this.acls, wsId, nodeId);
            if (roleRigts !== undefined) {
                rights = roleRigts;
            } else if (parentRights !== undefined) {
                rights = parentRights;
                inherited = true;
            } else {
                return { aclString: "", 'false': false };
            }

            var aclString = Object.keys(rights).filter(function (r) {
                return rights[r];
            }).join(',');
            return { aclString: aclString, inherited: inherited };
        }
    }, {
        key: '_aclStringForAcls',
        value: function _aclStringForAcls(acls, wsId, nodeId) {
            var rights = { read: false, write: false, deny: false };

            var policyValue = acls.filter(function (acl) {
                return acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0 && (!wsId || acl.WorkspaceID === wsId) && acl.NodeID === nodeId && acl.Action.Value === "1";
            });

            if (policyValue.length) {
                rights[policyValue[0].Action.Name] = true;
                return rights;
            }

            Object.keys(rights).forEach(function (rightName) {
                var values = acls.filter(function (acl) {
                    return acl.Action.Name === rightName && (!wsId || acl.WorkspaceID === wsId) && acl.NodeID === nodeId && acl.Action.Value === "1";
                });
                if (values.length) {
                    rights[rightName] |= true;
                }
            });
            if (!rights.read && !rights.write && !rights.deny) {
                return undefined;
            } else {
                return rights;
            }
        }

        /**
         *
         * @param workspace {IdmWorkspace}
         * @param nodeUuid string
         * @param value string
         * @param nodeWs {IdmWorkspace}
         */
    }, {
        key: 'updateAcl',
        value: function updateAcl(workspace, nodeUuid, value) {
            var _this9 = this;

            var nodeWs = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

            var nodeIds = [];
            var isRoot = false;
            if (nodeUuid) {
                nodeIds = [nodeUuid];
                isRoot = nodeWs && Object.keys(nodeWs.RootNodes).indexOf(nodeUuid) > -1;
            } else {
                nodeIds = Object.keys(workspace.RootNodes);
            }
            if (workspace) {
                // Remove current global acls
                this.acls = this.acls.filter(function (acl) {
                    return !((acl.Action.Name === 'read' || acl.Action.Name === 'write' || acl.Action.Name === 'deny' || acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0) && acl.WorkspaceID === workspace.UUID && nodeIds.indexOf(acl.NodeID) > -1 && acl.Action.Value === "1");
                });
            } else {
                // Remove node acls
                this.acls = this.acls.filter(function (acl) {
                    return !((acl.Action.Name === 'read' || acl.Action.Name === 'write' || acl.Action.Name === 'deny' || acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0) && acl.NodeID === nodeUuid && acl.Action.Value === "1");
                });
            }
            if (value !== '') {
                value.split(',').forEach(function (r) {
                    nodeIds.forEach(function (n) {
                        var acl = new _pydioHttpRestApi.IdmACL();
                        acl.NodeID = n;
                        if (workspace) {
                            acl.WorkspaceID = workspace.UUID;
                        } else if (isRoot) {
                            acl.WorkspaceID = nodeWs.UUID;
                        }
                        acl.RoleID = _this9.idmRole.Uuid;
                        acl.Action = _pydioHttpRestApi.IdmACLAction.constructFromObject({ Name: r, Value: "1" });
                        _this9.acls.push(acl);
                    });
                });
            }
            this.dirty = true;
            this.notify('update');
        }

        /**
         * @param object {IdmRole}
         * @return {IdmRole}
         */
    }, {
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this10 = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    target[p] = value;
                    _this10.dirty = true;
                    _this10.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (out instanceof Array) {
                        return out;
                    } else if (out instanceof Object) {
                        return _this10.buildProxy(out);
                    } else {
                        return out;
                    }
                }
            });
        }
    }], [{
        key: 'FormatPolicyAclFromStore',
        value: function FormatPolicyAclFromStore(acls) {
            return acls.map(function (acl) {
                if (acl.Action && acl.Action.Name === 'policy') {
                    acl.Action.Name = 'policy:' + acl.Action.Value;
                    acl.Action.Value = '1';
                }
                return acl;
            });
        }

        /**
         * In Action, replace policy:pName to policy/pName
         * @param acls [IdmACL]
         * @return [IdmACL]
         */
    }, {
        key: 'FormatPolicyAclToStore',
        value: function FormatPolicyAclToStore(acls) {
            return acls.map(function (acl) {
                if (acl.Action && acl.Action.Name.indexOf('policy:') === 0) {
                    var copy = _pydioHttpRestApi.IdmACL.constructFromObject(JSON.parse(JSON.stringify(acl)));
                    copy.Action.Name = 'policy';
                    copy.Action.Value = acl.Action.Name.split(':')[1];
                    return copy;
                } else {
                    return acl;
                }
            });
        }
    }]);

    return Role;
})(_pydioLangObservable2['default']);

exports['default'] = Role;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","uuid":2}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _uuid = require('uuid');

var _Role = require('./Role');

var _Role2 = _interopRequireDefault(_Role);

var User = (function (_Observable) {
    _inherits(User, _Observable);

    /**
     *
     * @param idmUser {IdmUser}
     */

    function User(idmUser) {
        var _this = this;

        _classCallCheck(this, User);

        _get(Object.getPrototypeOf(User.prototype), 'constructor', this).call(this);
        this.acls = [];
        var parentRoles = [];
        if (idmUser) {
            this.idmUser = idmUser;
            if (this.idmUser.Roles) {
                this.idmRole = this.idmUser.Roles.filter(function (r) {
                    return r.Uuid === _this.idmUser.Uuid;
                })[0];
                if (!this.idmUser.IsGroup) {
                    parentRoles = this.idmUser.Roles.filter(function (r) {
                        return r.Uuid !== _this.idmUser.Uuid;
                    });
                }
            }
            if (!this.idmUser.Attributes) {
                this.idmUser.Attributes = {};
            }
        } else {
            this.idmUser = new _pydioHttpRestApi.IdmUser();
            this.idmUser.Uuid = (0, _uuid.v4)();
            this.idmRole = _pydioHttpRestApi.IdmRole.constructFromObject({ Uuid: this.idmUser.Uuid });
            this.idmUser.Roles = [this.idmRole];
            this.idmUser.Attributes = {};
        }
        this.role = new _Role2['default'](this.idmRole, parentRoles);
        this.role.observe('update', function () {
            _this.dirty |= _this.role.isDirty();
            _this.notify('update');
        });
        this.makeSnapshot();
    }

    _createClass(User, [{
        key: 'load',
        value: function load() {
            var _this2 = this;

            this.role.load().then(function () {
                _this2.notify('update');
            });
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.dirty;
        }
    }, {
        key: 'save',
        value: function save() {
            var _this3 = this;

            return PydioApi.getRestClient().getIdmApi().updateIdmUser(this.idmUser).then(function (newUser) {
                _this3.idmUser = newUser;
                if (_this3.role.isDirty()) {
                    return _this3.role.save().then(function () {
                        _this3.makeSnapshot();
                        _this3.dirty = false;
                        _this3.notify('update');
                    });
                } else {
                    _this3.makeSnapshot();
                    _this3.dirty = false;
                    _this3.notify('update');
                    return Promise.resolve(_this3);
                }
            });
        }
    }, {
        key: 'revert',
        value: function revert() {
            this.idmUser = this.snapshot;
            this.makeSnapshot();
            this.dirty = false;
            this.notify('update');
            this.role.revert();
        }
    }, {
        key: 'makeSnapshot',
        value: function makeSnapshot() {
            this.snapshot = _pydioHttpRestApi.IdmUser.constructFromObject(JSON.parse(JSON.stringify(this.idmUser)));
        }

        /**
         * @return {Role}
         */
    }, {
        key: 'getRole',
        value: function getRole() {
            return this.role;
        }
    }, {
        key: 'addRole',
        value: function addRole(role) {
            var _this4 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this4.idmUser.Uuid;
            });
            parentRoles = [].concat(_toConsumableArray(parentRoles.filter(function (r) {
                return r.Uuid !== role.Uuid;
            })), [role]);
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }
    }, {
        key: 'removeRole',
        value: function removeRole(role) {
            var _this5 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this5.idmUser.Uuid && r.Uuid !== role.Uuid;
            });
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }
    }, {
        key: 'switchRoles',
        value: function switchRoles(roleId1, roleId2) {
            var _this6 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this6.idmUser.Uuid;
            });
            var pos1 = undefined,
                pos2 = undefined,
                b = undefined;
            for (var i = 0; i < parentRoles.length; i++) {
                if (parentRoles[i].Uuid === roleId1) {
                    pos1 = i;
                    b = parentRoles[i];
                } else if (parentRoles[i].Uuid === roleId2) {
                    pos2 = i;
                }
            }
            parentRoles[pos1] = parentRoles[pos2];
            parentRoles[pos2] = b;
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }

        /**
         *
         * @return {IdmUser}
         */
    }, {
        key: 'getIdmUser',
        value: function getIdmUser() {
            return this.buildProxy(this.idmUser);
        }

        /**
         * @param object {IdmUser}
         * @return {IdmUser}
         */
    }, {
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this7 = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    target[p] = value;
                    _this7.dirty = true;
                    _this7.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (out instanceof Array) {
                        return out;
                    } else if (out instanceof Object) {
                        return _this7.buildProxy(out);
                    } else {
                        return out;
                    }
                }
            });
        }
    }]);

    return User;
})(_pydioLangObservable2['default']);

exports['default'] = User;
module.exports = exports['default'];

},{"./Role":27,"pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","uuid":2}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Role = require('./Role');

var _Role2 = _interopRequireDefault(_Role);

var _User = require('./User');

var _User2 = _interopRequireDefault(_User);

var Model = { Role: _Role2['default'], User: _User2['default'] };

exports['default'] = Model;
module.exports = exports['default'];

},{"./Role":27,"./User":28}],30:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _ParametersPicker = require('./ParametersPicker');

var _ParametersPicker2 = _interopRequireDefault(_ParametersPicker);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2["default"].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;

var ThemedTitle = (function (_React$Component) {
    _inherits(ThemedTitle, _React$Component);

    function ThemedTitle() {
        _classCallCheck(this, ThemedTitle);

        _get(Object.getPrototypeOf(ThemedTitle.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(ThemedTitle, [{
        key: "render",
        value: function render() {
            var _props = this.props;
            var getMessage = _props.getMessage;
            var muiTheme = _props.muiTheme;

            var bgColor = muiTheme.palette.primary1Color;
            return _react2["default"].createElement(
                "div",
                { style: { backgroundColor: bgColor, color: 'white', padding: '0 24px 24px' } },
                _react2["default"].createElement(
                    "h3",
                    { style: { color: 'white' } },
                    getMessage('14')
                ),
                _react2["default"].createElement(
                    "div",
                    { className: "legend" },
                    getMessage('15')
                )
            );
        }
    }]);

    return ThemedTitle;
})(_react2["default"].Component);

ThemedTitle = (0, _materialUiStyles.muiThemeable)()(ThemedTitle);

var ParameterCreate = _react2["default"].createClass({
    displayName: "ParameterCreate",

    mixins: [ActionDialogMixin, CancelButtonProviderMixin],

    propTypes: {
        workspaceScope: _react2["default"].PropTypes.string,
        showModal: _react2["default"].PropTypes.func,
        hideModal: _react2["default"].PropTypes.func,
        pluginsFilter: _react2["default"].PropTypes.func,
        roleType: _react2["default"].PropTypes.oneOf(['user', 'group', 'role']),
        createParameter: _react2["default"].PropTypes.func
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogPadding: 0,
            dialogTitle: '',
            dialogSize: 'md'
        };
    },

    getInitialState: function getInitialState() {
        return {
            step: 1,
            workspaceScope: this.props.workspaceScope,
            pluginName: null,
            paramName: null,
            actions: {},
            parameters: {}
        };
    },

    setSelection: function setSelection(plugin, type, param, attributes) {
        this.setState({ pluginName: plugin, type: type, paramName: param, attributes: attributes }, this.createParameter);
    },

    createParameter: function createParameter() {
        this.props.createParameter(this.state.type, this.state.pluginName, this.state.paramName, this.state.attributes);
        this.props.onDismiss();
    },

    render: function render() {

        var getMessage = function getMessage(id) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];
            return pydio.MessageHash[namespace + (namespace ? '.' : '') + id] || id;
        };
        var _props2 = this.props;
        var pydio = _props2.pydio;
        var actions = _props2.actions;
        var parameters = _props2.parameters;

        return _react2["default"].createElement(
            "div",
            { className: "picker-list" },
            _react2["default"].createElement(ThemedTitle, { getMessage: getMessage }),
            _react2["default"].createElement(_ParametersPicker2["default"], {
                pydio: pydio,
                allActions: actions,
                allParameters: parameters,
                onSelection: this.setSelection,
                getMessage: getMessage
            })
        );
    }

});

exports["default"] = ParameterCreate;
module.exports = exports["default"];

},{"./ParametersPicker":33,"material-ui/styles":"material-ui/styles","pydio":"pydio","react":"react"}],31:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilMessagesMixin = require('../util/MessagesMixin');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _modelRole = require('../model/Role');

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioForm = _pydio2['default'].requireLib("form");

var ParameterEntry = (function (_React$Component) {
    _inherits(ParameterEntry, _React$Component);

    function ParameterEntry(props) {
        _classCallCheck(this, ParameterEntry);

        _get(Object.getPrototypeOf(ParameterEntry.prototype), 'constructor', this).call(this, props);
        this.state = { editMode: false };
    }

    _createClass(ParameterEntry, [{
        key: 'onChangeParameter',
        value: function onChangeParameter(newValue, oldValue) {
            var additionalFormData = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            if (newValue === oldValue) {
                return;
            }
            var _props = this.props;
            var role = _props.role;
            var acl = _props.acl;

            var aclKey = acl.Action.Name;
            role.setParameter(aclKey, newValue, acl.WorkspaceID);
        }
    }, {
        key: 'deleteParameter',
        value: function deleteParameter() {
            var _props2 = this.props;
            var role = _props2.role;
            var acl = _props2.acl;

            role.deleteParameter(acl);
        }
    }, {
        key: 'overrideParameter',
        value: function overrideParameter() {
            var _props3 = this.props;
            var role = _props3.role;
            var acl = _props3.acl;

            var aclKey = acl.Action.Name;

            var _aclKey$split = aclKey.split(":");

            var _aclKey$split2 = _slicedToArray(_aclKey$split, 3);

            var type = _aclKey$split2[0];
            var pluginId = _aclKey$split2[1];
            var name = _aclKey$split2[2];

            var value = "";
            if (type === "action") {
                value = false;
            }
            role.setParameter(aclKey, value, acl.WorkspaceID);
        }
    }, {
        key: 'onInputEditMode',
        value: function onInputEditMode(editMode) {
            this.setState({ editMode: editMode });
        }
    }, {
        key: 'toggleEditMode',
        value: function toggleEditMode() {
            if (this.refs.formElement) {
                this.refs.formElement.toggleEditMode();
            }
        }
    }, {
        key: 'toggleActionStatus',
        value: function toggleActionStatus(event, status) {
            var _props4 = this.props;
            var role = _props4.role;
            var acl = _props4.acl;

            role.setParameter(acl.Action.Name, status, acl.WorkspaceID);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props5 = this.props;
            var acl = _props5.acl;
            var actions = _props5.actions;
            var parameters = _props5.parameters;
            var pydio = _props5.pydio;
            var getMessage = _props5.getMessage;
            var getPydioRoleMessage = _props5.getPydioRoleMessage;

            var _acl$Action$Name$split = acl.Action.Name.split(":");

            var _acl$Action$Name$split2 = _slicedToArray(_acl$Action$Name$split, 3);

            var type = _acl$Action$Name$split2[0];
            var pluginId = _acl$Action$Name$split2[1];
            var name = _acl$Action$Name$split2[2];

            var value = undefined;
            if (name === 'DEFAULT_START_REPOSITORY') {
                value = acl.Action.Value;
            } else {
                value = JSON.parse(acl.Action.Value);
            }
            var inherited = acl.INHERITED;
            var label = name;
            var paramData = undefined;
            if (type === 'parameter' && parameters[pluginId]) {
                var filters = parameters[pluginId].filter(function (p) {
                    return p.parameter === name;
                });
                if (filters.length) {
                    paramData = filters[0];
                }
            } else if (type === 'action' && actions[pluginId]) {
                var filters = actions[pluginId].filter(function (p) {
                    return p.action === name;
                });
                if (filters.length) {
                    paramData = filters[0];
                }
            }
            var element = undefined;
            if (type === 'parameter') {
                var attributes = { type: 'string', label: label, name: name };
                if (paramData) {
                    attributes = PydioForm.Manager.parameterNodeToHash(paramData.xmlNode);
                }
                if (attributes['scope'] === 'user') {
                    return null;
                }
                label = attributes.label;
                element = PydioForm.createFormElement({
                    ref: "formElement",
                    attributes: attributes,
                    name: name,
                    value: value,
                    onChange: this.onChangeParameter.bind(this),
                    disabled: inherited,
                    onChangeEditMode: this.onInputEditMode.bind(this),
                    displayContext: 'grid'
                });
            } else {
                if (paramData) {
                    label = _pydioUtilXml2['default'].XPathGetSingleNodeText(paramData.xmlNode, "gui/@text") || label;
                    if (pydio.MessageHash[label]) {
                        label = pydio.MessageHash[label];
                    }
                }
                element = _react2['default'].createElement(
                    'div',
                    { className: 'role-action-toggle' },
                    _react2['default'].createElement(_materialUi.Toggle, {
                        name: this.props.name,
                        onToggle: this.toggleActionStatus.bind(this),
                        toggled: !!value,
                        label: getMessage(value ? '2' : '3'),
                        labelPosition: "right"
                    })
                );
            }

            var actionButtons = undefined;
            var buttonStyle = { style: { opacity: 0.2 }, hoveredStyle: { opacity: 1 } };
            if (type === 'parameter') {
                if (this.state.editMode) {
                    actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                        iconClassName: 'mdi mdi-content-save',
                        tooltip: getMessage('6'),
                        onClick: this.toggleEditMode.bind(this)
                    }, buttonStyle));
                } else {
                    actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                        iconClassName: 'mdi mdi-close',
                        tooltip: getMessage('4'),
                        onClick: this.deleteParameter.bind(this)
                    }, buttonStyle));
                    if (inherited) {
                        actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                            iconClassName: 'mdi mdi-content-copy',
                            tooltip: getMessage('5'),
                            onClick: this.overrideParameter.bind(this)
                        }, buttonStyle));
                    }
                }
            } else if (!inherited) {
                actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                    iconClassName: 'mdi mdi-close',
                    tooltip: getMessage('4'),
                    onClick: this.deleteParameter.bind(this)
                }, buttonStyle));
            } else {
                actionButtons = _react2['default'].createElement('div', { style: { width: 48, height: 48 } });
            }
            return _react2['default'].createElement(
                'tr',
                { className: (inherited ? 'inherited' : '') + (this.state.editMode ? ' edit-mode' : ''), style: _extends({}, this.props.style) },
                _react2['default'].createElement(
                    'td',
                    { style: { width: '40%', fontWeight: 500 } },
                    inherited ? '[' + getPydioRoleMessage('38') + ']' : '',
                    ' ',
                    label
                ),
                _react2['default'].createElement(
                    'td',
                    { style: { wordBreak: 'break-all' } },
                    element
                ),
                _react2['default'].createElement(
                    'td',
                    { style: { width: 50 } },
                    actionButtons
                )
            );
        }
    }]);

    return ParameterEntry;
})(_react2['default'].Component);

exports['default'] = (0, _utilMessagesMixin.withRoleMessages)(ParameterEntry);
module.exports = exports['default'];

},{"../model/Role":49,"../util/MessagesMixin":55,"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/xml":"pydio/util/xml","react":"react"}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ParameterEntry = require('./ParameterEntry');

var _ParameterEntry2 = _interopRequireDefault(_ParameterEntry);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var ParametersPanel = (function (_React$Component) {
    _inherits(ParametersPanel, _React$Component);

    function ParametersPanel(props) {
        var _this = this;

        _classCallCheck(this, ParametersPanel);

        _get(Object.getPrototypeOf(ParametersPanel.prototype), 'constructor', this).call(this, props);
        this.state = { actions: {}, parameters: {}, workspaces: {} };
        var api = new _pydioHttpRestApi.WorkspaceServiceApi(PydioApi.getRestClient());
        var request = new _pydioHttpRestApi.RestSearchWorkspaceRequest();
        request.Queries = [_pydioHttpRestApi.IdmWorkspaceSingleQuery.constructFromObject({
            scope: 'ADMIN'
        })];
        api.searchWorkspaces(request).then(function (collection) {
            var wss = collection.Workspaces || [];
            var workspaces = {};
            wss.forEach(function (ws) {
                workspaces[ws.UUID] = ws;
            });
            _this.setState({ workspaces: workspaces });
        });
    }

    _createClass(ParametersPanel, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var loader = AdminComponents.PluginsLoader.getInstance(this.props.pydio);
            loader.allPluginsActionsAndParameters().then(function (plugins) {
                _this2.setState({ actions: plugins.ACTIONS, parameters: plugins.PARAMETERS });
            });
        }
    }, {
        key: 'onCreateParameter',
        value: function onCreateParameter(scope, type, pluginName, paramName, attributes) {
            var role = this.props.role;

            var aclKey = type + ':' + pluginName + ':' + paramName;
            var value = undefined;
            //console.log(scope, type, pluginName, paramName, attributes);
            if (type === 'action') {
                value = false;
            } else if (attributes && attributes.xmlNode) {
                var xmlNode = attributes.xmlNode;
                value = xmlNode.getAttribute('default') ? xmlNode.getAttribute('default') : "";
                if (xmlNode.getAttribute('type') === 'boolean') {
                    value = value === "true";
                } else if (xmlNode.getAttribute('type') === 'integer') {
                    value = parseInt(value);
                }
            }
            role.setParameter(aclKey, value, scope);
        }
    }, {
        key: 'addParameter',
        value: function addParameter(scope) {
            var _this3 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var roleType = _props.roleType;
            var _state = this.state;
            var actions = _state.actions;
            var parameters = _state.parameters;

            pydio.UI.openComponentInModal('AdminPeople', 'Editor.Params.ParameterCreate', {
                pydio: pydio,
                actions: actions,
                parameters: parameters,
                workspaceScope: scope,
                createParameter: function createParameter(type, pluginName, paramName, attributes) {
                    _this3.onCreateParameter(scope, type, pluginName, paramName, attributes);
                },
                roleType: roleType
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props2 = this.props;
            var role = _props2.role;
            var pydio = _props2.pydio;

            if (!role) {
                return null;
            }
            var workspaces = this.state.workspaces;

            var m = function m(id) {
                return pydio.MessageHash['pydio_role.' + id] || id;
            };

            var params = role.listParametersAndActions();
            var scopes = {
                PYDIO_REPO_SCOPE_ALL: {},
                PYDIO_REPO_SCOPE_SHARED: {}
            };

            params.forEach(function (a) {
                if (!scopes[a.WorkspaceID]) {
                    scopes[a.WorkspaceID] = {};
                }

                var _a$Action$Name$split = a.Action.Name.split(':');

                var _a$Action$Name$split2 = _slicedToArray(_a$Action$Name$split, 3);

                var type = _a$Action$Name$split2[0];
                var pluginId = _a$Action$Name$split2[1];
                var paramName = _a$Action$Name$split2[2];

                scopes[a.WorkspaceID][paramName] = a;
            });
            var wsItems = [_react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.selector.title'), value: 1 }), _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.all'), onTouchTap: function () {
                    _this4.addParameter('PYDIO_REPO_SCOPE_ALL');
                } }), _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.shared'), onTouchTap: function () {
                    _this4.addParameter('PYDIO_REPO_SCOPE_SHARED');
                } }), _react2['default'].createElement(_materialUi.Divider, null)].concat(Object.keys(workspaces).map(function (ws) {
                return _react2['default'].createElement(_materialUi.MenuItem, { primaryText: workspaces[ws].Label, onTouchTap: function () {
                        _this4.addParameter(ws);
                    } });
            }));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h3',
                    { className: 'paper-right-title', style: { display: 'flex' } },
                    _react2['default'].createElement(
                        'span',
                        { style: { flex: 1, paddingRight: 20 } },
                        m('46'),
                        _react2['default'].createElement(
                            'div',
                            { className: "section-legend" },
                            m('47')
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 160 } },
                        _react2['default'].createElement(
                            _materialUi.SelectField,
                            { fullWidth: true, value: 1 },
                            wsItems
                        )
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    Object.keys(scopes).map(function (s) {
                        var scopeLabel = undefined;
                        var odd = false;
                        if (s === 'PYDIO_REPO_SCOPE_ALL') {
                            scopeLabel = m('parameters.scope.all');
                        } else if (s === 'PYDIO_REPO_SCOPE_SHARED') {
                            scopeLabel = m('parameters.scope.shared');
                        } else if (workspaces[s]) {
                            scopeLabel = m('parameters.scope.workspace').replace('%s', workspaces[s].Label);
                        } else {
                            scopeLabel = m('parameters.scope.workspace').replace('%s', s);
                        }
                        var entries = undefined;
                        if (Object.keys(scopes[s]).length) {
                            entries = Object.keys(scopes[s]).map(function (param) {
                                var style = { backgroundColor: odd ? '#FAFAFA' : 'white' };
                                odd = !odd;
                                return _react2['default'].createElement(_ParameterEntry2['default'], _extends({ pydio: pydio, acl: scopes[s][param], role: role }, _this4.state, { style: style }));
                            });
                        } else {
                            entries = _react2['default'].createElement(
                                'tr',
                                null,
                                _react2['default'].createElement(
                                    'td',
                                    { colSpan: 3, style: { padding: '14px 0' } },
                                    m('parameters.empty')
                                )
                            );
                        }
                        return _react2['default'].createElement(
                            'table',
                            { style: { width: '100%', marginBottom: 20 } },
                            _react2['default'].createElement(
                                'tr',
                                { style: { borderBottom: '1px solid #e0e0e0' } },
                                _react2['default'].createElement(
                                    'td',
                                    { colSpan: 2, style: { fontSize: 15, paddingTop: 10 } },
                                    scopeLabel
                                ),
                                _react2['default'].createElement(
                                    'td',
                                    { style: { width: 50 } },
                                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", onTouchTap: function () {
                                            _this4.addParameter(s);
                                        }, tooltip: m('parameters.custom.add') })
                                )
                            ),
                            entries
                        );
                    })
                )
            );
        }
    }]);

    return ParametersPanel;
})(_react2['default'].Component);

exports['default'] = ParametersPanel;
module.exports = exports['default'];

},{"./ParameterEntry":31,"material-ui":"material-ui","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],33:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require("pydio/util/lang");

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _materialUi = require('material-ui');

var ParametersPicker = (function (_React$Component) {
    _inherits(ParametersPicker, _React$Component);

    function ParametersPicker(props) {
        _classCallCheck(this, ParametersPicker);

        _get(Object.getPrototypeOf(ParametersPicker.prototype), "constructor", this).call(this, _extends({ actionsPrefix: '[a] ', parametersPrefix: '' }, props));
        this.state = { filter: null };
        if (this.props.initialSelection) {
            this.state = _extends({ filter: this.props.initialSelection.paramName }, this.props.initialSelection);
        }
    }

    _createClass(ParametersPicker, [{
        key: "filter",
        value: function filter(event) {
            this.setState({ filter: event.target.value.toLowerCase() });
        }
    }, {
        key: "select",
        value: function select(plugin, type, param, attributes) {
            this.props.onSelection(plugin, type, param, attributes);
            this.setState({ pluginName: plugin, type: type, paramName: param });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this = this;

            setTimeout(function () {
                _this.refs.input.focus();
            }, 150);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var allParameters = _props.allParameters;
            var allActions = _props.allActions;

            var term = this.state.filter;
            var selection = this.state.paramName;
            var selectedPlugin = this.state.pluginName;
            var selectionType = this.state.type;

            var filter = function filter(name) {
                if (!term) {
                    return true;
                }
                return name.toLowerCase().indexOf(term) !== -1;
            };

            var highlight = function highlight(name) {
                if (!term) {
                    return name;
                }
                var pos = name.toLowerCase().indexOf(term);
                var start = name.substr(0, pos);
                var middle = name.substr(pos, term.length);
                var end = name.substr(pos + term.length);
                return _react2["default"].createElement(
                    "span",
                    null,
                    start,
                    _react2["default"].createElement(
                        "span",
                        { className: "highlight" },
                        middle
                    ),
                    end
                );
            };

            var entries = [];
            var merge = {};
            Object.keys(allParameters).forEach(function (pName) {
                var _merge$pName$params;

                if (!merge[pName]) {
                    merge[pName] = { name: pName, label: pName, actions: [], params: [] };
                }
                (_merge$pName$params = merge[pName].params).push.apply(_merge$pName$params, _toConsumableArray(allParameters[pName]));
            });
            Object.keys(allActions).forEach(function (pName) {
                var _merge$pName$actions;

                if (!merge[pName]) {
                    merge[pName] = { name: pName, label: pName, actions: [], params: [] };
                }
                (_merge$pName$actions = merge[pName].actions).push.apply(_merge$pName$actions, _toConsumableArray(allActions[pName]));
            });

            var allData = _pydioUtilLang2["default"].objectValues(merge);

            allData.map(function (plugin) {
                var params = [];
                var pluginMatch = false;
                var pluginLabel = plugin.label || plugin.name;
                if (filter(pluginLabel) || filter(plugin.name)) {
                    pluginMatch = true;
                    if (filter(pluginLabel)) {
                        pluginLabel = highlight(pluginLabel);
                    } else if (filter(plugin.name)) {
                        pluginLabel = _react2["default"].createElement(
                            "span",
                            null,
                            pluginLabel,
                            " (",
                            highlight(plugin.name),
                            ")"
                        );
                    }
                }

                plugin.params.concat(plugin.actions).map(function (param) {
                    var name = param.action || param.parameter;
                    var label = param.label || name;
                    var prefix = '';
                    if (param.action) {
                        label = _pydioUtilXml2["default"].XPathGetSingleNodeText(param.xmlNode, "gui/@text") || label;
                        prefix = _this2.props.actionsPrefix;
                    } else {
                        label = param.xmlNode.getAttribute("label") || label;
                        if (_this2.props.parametersPrefix) {
                            prefix = _this2.props.parametersPrefix;
                        }
                    }
                    if (pydio.MessageHash[label]) {
                        label = pydio.MessageHash[label];
                    }
                    var filterLabel = filter(label);
                    var filterName = filter(name);
                    if (filterLabel || filterName || pluginMatch) {
                        var click = function click() {
                            return _this2.select(plugin.name, param.action ? 'action' : 'parameter', name, param);
                        };
                        var selected = (selectedPlugin === '*' || selectedPlugin === plugin.name) && param[selectionType] && selection === name;
                        var highlighted = label;
                        if (filterLabel) {
                            highlighted = highlight(label);
                        } else if (filterName) {
                            highlighted = _react2["default"].createElement(
                                "span",
                                null,
                                label,
                                " (",
                                highlight(name),
                                ") "
                            );
                        }
                        params.push(_react2["default"].createElement(
                            "li",
                            {
                                onClick: click,
                                className: (selected ? "selected " : "") + "parameters-param",
                                key: plugin.name + '-' + (param.action ? 'action' : 'parameter') + '-' + name },
                            prefix,
                            " ",
                            highlighted
                        ));
                    }
                });

                if (params.length) {
                    entries.push(_react2["default"].createElement(
                        "li",
                        { className: "parameters-plugin", key: plugin.name },
                        pluginLabel,
                        _react2["default"].createElement(
                            "ul",
                            null,
                            params
                        )
                    ));
                }
            });

            return _react2["default"].createElement(
                "div",
                null,
                _react2["default"].createElement(
                    "div",
                    { style: { padding: '0 24px', borderBottom: '1px solid #e0e0e0' } },
                    _react2["default"].createElement(_materialUi.TextField, { ref: "input", floatingLabelText: this.props.getMessage('13'), onChange: this.filter.bind(this), fullWidth: true, underlineShow: false })
                ),
                _react2["default"].createElement(
                    "div",
                    { className: "parameters-tree-scroller" },
                    _react2["default"].createElement(
                        "ul",
                        { className: "parameters-tree" },
                        entries
                    )
                )
            );
        }
    }]);

    return ParametersPicker;
})(_react2["default"].Component);

exports["default"] = ParametersPicker;
module.exports = exports["default"];

},{"material-ui":"material-ui","pydio/util/lang":"pydio/util/lang","pydio/util/xml":"pydio/util/xml","react":"react"}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ParameterEntry = require('./ParameterEntry');

var _ParameterEntry2 = _interopRequireDefault(_ParameterEntry);

var _ParameterCreate = require('./ParameterCreate');

var _ParameterCreate2 = _interopRequireDefault(_ParameterCreate);

var _ParametersPanel = require('./ParametersPanel');

var _ParametersPanel2 = _interopRequireDefault(_ParametersPanel);

var _ParametersPicker = require('./ParametersPicker');

var _ParametersPicker2 = _interopRequireDefault(_ParametersPicker);

var Params = { ParametersPicker: _ParametersPicker2['default'], ParameterCreate: _ParameterCreate2['default'], ParametersPanel: _ParametersPanel2['default'], ParameterEntry: _ParameterEntry2['default'] };

exports['default'] = Params;
module.exports = exports['default'];

},{"./ParameterCreate":30,"./ParameterEntry":31,"./ParametersPanel":32,"./ParametersPicker":33}],35:[function(require,module,exports){
(function (global){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _pydioUtilPass = require("pydio/util/pass");

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _Pydio$requireLib = _pydio2["default"].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;

var _Pydio$requireLib2 = _pydio2["default"].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;
exports["default"] = _react2["default"].createClass({
    displayName: "UserPasswordDialog",

    mixins: [AdminComponents.MessagesConsumerMixin, ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin],

    propTypes: {
        pydio: _react2["default"].PropTypes.instanceOf(_pydio2["default"]),
        user: _react2["default"].PropTypes.instanceOf(_modelUser2["default"])
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: pydio.MessageHash['role_editor.25'],
            dialogSize: 'sm'
        };
    },

    getInitialState: function getInitialState() {
        var pwdState = _pydioUtilPass2["default"].getState();
        return _extends({}, pwdState);
    },

    onChange: function onChange(event, value) {
        var passValue = this.refs.pass.getValue();
        var confirmValue = this.refs.confirm.getValue();
        var newState = _pydioUtilPass2["default"].getState(passValue, confirmValue, this.state);
        this.setState(newState);
    },

    submit: function submit() {
        var _this = this;

        if (!this.state.valid) {
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText);
            return;
        }

        var value = this.refs.pass.getValue();
        var user = this.props.user;

        user.getIdmUser().Password = value;
        user.save().then(function () {
            _this.dismiss();
        });
    },

    render: function render() {

        // This is passed via state, context is not working,
        // so we have to get the messages from the global.
        var getMessage = function getMessage(id) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
            return global.pydio.MessageHash[namespace + (namespace ? '.' : '') + id] || id;
        };
        return _react2["default"].createElement(
            "div",
            { style: { width: '100%' } },
            _react2["default"].createElement(ModernTextField, {
                ref: "pass",
                type: "password",
                fullWidth: true,
                onChange: this.onChange,
                floatingLabelText: getMessage('523'),
                errorText: this.state.passErrorText,
                hintText: this.state.passHintText
            }),
            _react2["default"].createElement(ModernTextField, {
                ref: "confirm",
                type: "password",
                fullWidth: true,
                onChange: this.onChange,
                floatingLabelText: getMessage('199'),
                errorText: this.state.confirmErrorText
            })
        );
    }

});
module.exports = exports["default"];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../model/User":50,"pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],36:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require('../util/MessagesMixin');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

exports['default'] = _react2['default'].createClass({
    displayName: 'UserRolesPicker',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        profile: _react2['default'].PropTypes.string,
        roles: _react2['default'].PropTypes.array,
        addRole: _react2['default'].PropTypes.func,
        removeRole: _react2['default'].PropTypes.func,
        switchRoles: _react2['default'].PropTypes.func
    },

    getInitialState: function getInitialState() {
        return {
            availableRoles: []
        };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        _pydioHttpApi2['default'].getRestClient().getIdmApi().listRoles().then(function (roles) {
            _this.setState({ availableRoles: roles });
        });
    },

    onChange: function onChange(e, selectedIndex, value) {
        if (value === -1) {
            return;
        }
        this.props.addRole(value);
    },

    remove: function remove(value) {
        var availableRoles = this.state.availableRoles;

        var role = availableRoles.filter(function (r) {
            return r.Uuid === value;
        })[0];
        this.props.removeRole(role);
    },

    orderUpdated: function orderUpdated(oldId, newId, currentValues) {
        this.props.switchRoles(oldId, newId);
    },

    render: function render() {

        var groups = [],
            manual = [],
            users = [];
        var ctx = this.context;
        var _props = this.props;
        var roles = _props.roles;
        var loadingMessage = _props.loadingMessage;
        var profile = _props.profile;
        var availableRoles = this.state.availableRoles;

        roles.map((function (r) {
            if (r.GroupRole) {
                if (r.Uuid === 'ROOT_GROUP') {
                    groups.push('/ ' + ctx.getMessage('user.25', 'ajxp_admin'));
                } else {
                    groups.push(ctx.getMessage('user.26', 'ajxp_admin').replace('%s', r.Label || r.Uuid));
                }
            } else if (r.UserRole) {
                users.push(ctx.getMessage('user.27', 'ajxp_admin'));
            } else {
                if (r.AutoApplies && r.AutoApplies.indexOf(profile) !== -1) {
                    groups.push(r.Label + ' [auto]');
                } else {
                    manual.push({ payload: r.Uuid, text: r.Label });
                }
            }
        }).bind(this));

        var addableRoles = [_react2['default'].createElement(_materialUi.MenuItem, { value: -1, primaryText: ctx.getMessage('20') })].concat(_toConsumableArray(availableRoles.filter(function (r) {
            return roles.indexOf(r) === -1;
        }).map(function (r) {
            return _react2['default'].createElement(_materialUi.MenuItem, { value: r, primaryText: r.Label || r.Uuid });
        })));

        var fixedRoleStyle = {
            padding: 10,
            fontSize: 14,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            margin: '8px 0'
        };

        return _react2['default'].createElement(
            'div',
            { className: 'user-roles-picker', style: { padding: 0, margin: '-30px 20px 40px', backgroundColor: '#f5f5f5', borderRadius: 3 } },
            _react2['default'].createElement(
                'div',
                { style: { paddingLeft: 10, marginBottom: -6, display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, color: '#a1a1a1', fontSize: 16 } },
                    ctx.getMessage('roles.picker.title'),
                    ' ',
                    loadingMessage ? ' (' + ctx.getMessage('21') + ')' : ''
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'roles-picker-menu', style: { marginBottom: -12 } },
                    _react2['default'].createElement(
                        _materialUi.DropDownMenu,
                        { underlineStyle: { display: 'none' }, onChange: this.onChange, value: -1 },
                        addableRoles
                    )
                )
            ),
            _react2['default'].createElement(
                'div',
                { className: 'roles-list', style: { margin: '0 8px', paddingBottom: 1 } },
                groups.map(function (g) {
                    return _react2['default'].createElement(
                        'div',
                        { key: "group-" + g, style: fixedRoleStyle },
                        g
                    );
                }),
                _react2['default'].createElement(PydioComponents.SortableList, {
                    key: 'sortable',
                    values: manual,
                    removable: true,
                    onRemove: this.remove,
                    onOrderUpdated: this.orderUpdated,
                    itemClassName: 'role-item role-item-sortable'
                }),
                users.map(function (u) {
                    return _react2['default'].createElement(
                        'div',
                        { key: "user-" + u, style: fixedRoleStyle },
                        u
                    );
                })
            )
        );
    }

});
module.exports = exports['default'];

},{"../util/MessagesMixin":55,"material-ui":"material-ui","pydio/http/api":"pydio/http/api","react":"react"}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _UserPasswordDialog = require('./UserPasswordDialog');

var _UserPasswordDialog2 = _interopRequireDefault(_UserPasswordDialog);

var _UserRolesPicker = require('./UserRolesPicker');

var _UserRolesPicker2 = _interopRequireDefault(_UserRolesPicker);

var User = { UserPasswordDialog: _UserPasswordDialog2['default'], UserRolesPicker: _UserRolesPicker2['default'] };

exports['default'] = User;
module.exports = exports['default'];

},{"./UserPasswordDialog":35,"./UserRolesPicker":36}],38:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydioUtilFunc = require('pydio/util/func');

var _pydioUtilFunc2 = _interopRequireDefault(_pydioUtilFunc);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

function loadEditorClass(className, defaultComponent) {
    if (className === undefined) className = '';

    if (!className) {
        return Promise.resolve(defaultComponent);
    }
    var parts = className.split(".");
    var ns = parts.shift();
    var rest = parts.join('.');
    return _pydioHttpResourcesManager2['default'].loadClass(ns).then(function (c) {
        var comp = _pydioUtilFunc2['default'].getFunctionByName(rest, c);
        if (!comp) {
            console.error('Cannot find editor component, using default instead', className);
            return defaultComponent;
        }
        return comp;
    })['catch'](function (e) {
        console.error('Cannot find editor component, using default instead', className);
        return defaultComponent;
    });
}

exports.loadEditorClass = loadEditorClass;

},{"pydio/http/resources-manager":"pydio/http/resources-manager","pydio/util/func":"pydio/util/func"}],39:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  CACHE: null
};
module.exports = exports["default"];

},{}],40:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var RoleMessagesConsumerMixin = {
    contextTypes: {
        messages: _react2['default'].PropTypes.object,
        getMessage: _react2['default'].PropTypes.func,
        getPydioRoleMessage: _react2['default'].PropTypes.func,
        getRootMessage: _react2['default'].PropTypes.func
    }
};

var RoleMessagesProviderMixin = {

    childContextTypes: {
        messages: _react2['default'].PropTypes.object,
        getMessage: _react2['default'].PropTypes.func,
        getPydioRoleMessage: _react2['default'].PropTypes.func,
        getRootMessage: _react2['default'].PropTypes.func
    },

    getChildContext: function getChildContext() {
        var messages = this.context.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function getMessage(messageId) {
                var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];

                return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
            },
            getPydioRoleMessage: function getPydioRoleMessage(messageId) {
                return messages['role_editor.' + messageId] || messageId;
            },
            getRootMessage: function getRootMessage(messageId) {
                return messages[messageId] || messageId;
            }
        };
    }

};

function withRoleMessages(PydioComponent) {

    return (function (_Component) {
        _inherits(WithRoleMessages, _Component);

        function WithRoleMessages() {
            _classCallCheck(this, WithRoleMessages);

            _get(Object.getPrototypeOf(WithRoleMessages.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(WithRoleMessages, [{
            key: 'render',
            value: function render() {
                var pydio = this.props.pydio;

                if (!pydio) {
                    pydio = _pydio2['default'].getInstance();
                }
                var messages = pydio.MessageHash;
                var getMessage = function getMessage(messageId) {
                    var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];

                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                };
                var getPydioRoleMessage = function getPydioRoleMessage(messageId) {
                    return messages['role_editor.' + messageId] || messageId;
                };
                var getAdminMessage = function getAdminMessage(messageId) {
                    return messages['ajxp_admin.' + messageId] || messageId;
                };
                var getRootMessage = function getRootMessage(messageId) {
                    return messages[messageId] || messageId;
                };

                return _react2['default'].createElement(PydioComponent, _extends({}, this.props, {
                    getMessage: getMessage,
                    getPydioRoleMessage: getPydioRoleMessage,
                    getRootMessage: getRootMessage,
                    getAdminMessage: getAdminMessage
                }));
            }
        }]);

        return WithRoleMessages;
    })(_react.Component);
}

exports.RoleMessagesConsumerMixin = RoleMessagesConsumerMixin;
exports.RoleMessagesProviderMixin = RoleMessagesProviderMixin;
exports.withRoleMessages = withRoleMessages;

},{"pydio":"pydio","react":"react"}],41:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _EditorCache = require('./EditorCache');

var _EditorCache2 = _interopRequireDefault(_EditorCache);

var _MessagesMixin = require('./MessagesMixin');

var _ClassLoader = require("./ClassLoader");

var Util = { EditorCache: _EditorCache2['default'], RoleMessagesConsumerMixin: _MessagesMixin.RoleMessagesConsumerMixin, withRoleMessages: _MessagesMixin.withRoleMessages, loadEditorClass: _ClassLoader.loadEditorClass };

exports['default'] = Util;
module.exports = exports['default'];

},{"./ClassLoader":38,"./EditorCache":39,"./MessagesMixin":40}],42:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"./WorkspaceAcl":44,"dup":16,"pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],43:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"../util/MessagesMixin":55,"dup":17,"material-ui":"material-ui","react":"react"}],44:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"../util/MessagesMixin":55,"./RightsSelector":43,"dup":19,"material-ui":"material-ui","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],45:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"./WorkspaceAcl":44,"dup":20,"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],46:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"../model/User":50,"dup":23,"pydio":"pydio","react":"react"}],47:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"../model/Role":49,"dup":24,"pydio":"pydio","react":"react"}],48:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"../model/User":50,"../user/UserRolesPicker":53,"dup":25,"material-ui":"material-ui","pydio":"pydio","react":"react"}],49:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27,"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","uuid":2}],50:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"./Role":49,"dup":28,"pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","uuid":2}],51:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"../model/Role":49,"../util/MessagesMixin":55,"dup":31,"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/xml":"pydio/util/xml","react":"react"}],52:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"./ParameterEntry":51,"dup":32,"material-ui":"material-ui","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],53:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"../util/MessagesMixin":55,"dup":36,"material-ui":"material-ui","pydio/http/api":"pydio/http/api","react":"react"}],54:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"dup":38,"pydio/http/resources-manager":"pydio/http/resources-manager","pydio/util/func":"pydio/util/func"}],55:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"dup":40,"pydio":"pydio","react":"react"}],56:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var CreateRoleOrGroupForm = _react2['default'].createClass({
    displayName: 'CreateRoleOrGroupForm',

    mixins: [AdminComponents.MessagesConsumerMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    propTypes: {
        type: _react2['default'].PropTypes.oneOf(['group', 'user', 'role']),
        roleNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']),
        openRoleEditor: _react2['default'].PropTypes.func
    },

    getTitle: function getTitle() {
        if (this.props.type === 'group') {
            return this.context.getMessage('ajxp_admin.user.15');
        } else {
            return this.context.getMessage('ajxp_admin.user.14');
        }
    },

    getPadding: function getPadding() {
        return true;
    },

    getSize: function getSize() {
        return 'sm';
    },

    dismiss: function dismiss() {
        return this.props.onDismiss();
    },

    getInitialState: function getInitialState() {
        return {
            groupId: '',
            groupIdError: this.context.getMessage('ajxp_admin.user.16.empty'),
            groupLabel: '',
            groupLabelError: this.context.getMessage('ajxp_admin.user.17.empty'),
            roleId: '',
            roleIdError: this.context.getMessage('ajxp_admin.user.18.empty')
        };
    },

    submit: function submit() {
        var _this = this;

        var _props = this.props;
        var type = _props.type;
        var pydio = _props.pydio;
        var reload = _props.reload;

        var currentNode = undefined;
        var _state = this.state;
        var groupId = _state.groupId;
        var groupIdError = _state.groupIdError;
        var groupLabel = _state.groupLabel;
        var groupLabelError = _state.groupLabelError;
        var roleId = _state.roleId;
        var roleIdError = _state.roleIdError;

        if (type === "group") {
            if (groupIdError || groupLabelError) {
                return;
            }
            if (pydio.getContextHolder().getSelectedNodes().length) {
                currentNode = pydio.getContextHolder().getSelectedNodes()[0];
            } else {
                currentNode = pydio.getContextNode();
            }
            var currentPath = currentNode.getPath().replace('/idm/users', '');
            _pydioHttpApi2['default'].getRestClient().getIdmApi().createGroup(currentPath || '/', groupId, groupLabel).then(function () {
                _this.dismiss();
                currentNode.reload();
            });
        } else if (type === "role") {
            if (roleIdError) {
                return;
            }
            currentNode = this.props.roleNode;
            _pydioHttpApi2['default'].getRestClient().getIdmApi().createRole(roleId).then(function () {
                _this.dismiss();
                if (reload) {
                    reload();
                }
            });
        }
    },

    update: function update(state) {
        if (state.groupId !== undefined) {
            var re = new RegExp(/^[0-9A-Z\-_.:\+]+$/i);
            if (!re.test(state.groupId)) {
                state.groupIdError = this.context.getMessage('ajxp_admin.user.16.format');
            } else if (state.groupId === '') {
                state.groupIdError = this.context.getMessage('ajxp_admin.user.16.empty');
            } else {
                state.groupIdError = '';
            }
        } else if (state.groupLabel !== undefined) {
            if (state.groupLabel === '') {
                state.groupLabelError = this.context.getMessage('ajxp_admin.user.17.empty');
            } else {
                state.groupLabelError = '';
            }
        } else if (state.roleId !== undefined) {
            if (state.roleId === '') {
                state.roleIdError = this.context.getMessage('ajxp_admin.user.18.empty');
            } else {
                state.roleIdError = '';
            }
        }
        this.setState(state);
    },

    render: function render() {
        var _this2 = this;

        var _state2 = this.state;
        var groupId = _state2.groupId;
        var groupIdError = _state2.groupIdError;
        var groupLabel = _state2.groupLabel;
        var groupLabelError = _state2.groupLabelError;
        var roleId = _state2.roleId;
        var roleIdError = _state2.roleIdError;

        if (this.props.type === 'group') {
            return _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(ModernTextField, {
                    value: groupId,
                    errorText: groupIdError,
                    onChange: function (e, v) {
                        _this2.update({ groupId: v });
                    },
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.16')
                }),
                _react2['default'].createElement(ModernTextField, {
                    value: groupLabel,
                    errorText: groupLabelError,
                    onChange: function (e, v) {
                        _this2.update({ groupLabel: v });
                    },
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.17')
                })
            );
        } else {
            return _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(ModernTextField, {
                    value: roleId,
                    errorText: roleIdError,
                    onChange: function (e, v) {
                        _this2.update({ roleId: v });
                    },
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.18')
                })
            );
        }
    }

});

exports['default'] = CreateRoleOrGroupForm;
module.exports = exports['default'];

},{"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/model/node":"pydio/model/node","react":"react"}],57:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var CreateUserForm = _react2['default'].createClass({
    displayName: 'CreateUserForm',

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(PydioDataModel),
        openRoleEditor: _react2['default'].PropTypes.func
    },

    mixins: [AdminComponents.MessagesConsumerMixin, PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogSize: 'sm',
            dialogTitleId: 'ajxp_admin.user.19'
        };
    },

    getInitialState: function getInitialState() {
        var passState = _pydioUtilPass2['default'].getState();
        return _extends({
            step: 1
        }, passState);
    },

    checkPassword: function checkPassword() {
        var value1 = this.refs.pass.getValue();
        var value2 = this.refs.passconf.getValue();
        this.setState(_pydioUtilPass2['default'].getState(value1, value2, this.state));
    },

    // Check valid login
    checkLogin: function checkLogin(e, v) {
        var err = _pydioUtilPass2['default'].isValidLogin(v);
        this.setState({ loginErrorText: err });
    },

    submit: function submit() {
        var _this = this;

        if (!this.state.valid || this.state.loginErrorText) {
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText || this.state.loginErrorText);
            return;
        }

        var ctxNode = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        var currentPath = ctxNode.getPath();
        if (currentPath.startsWith("/idm/users")) {
            currentPath = currentPath.substr("/idm/users".length);
        }
        var login = this.refs.user_id.getValue();
        var pwd = this.refs.pass.getValue();

        _pydioHttpApi2['default'].getRestClient().getIdmApi().createUser(currentPath, login, pwd).then(function (idmUser) {
            _this.dismiss();
            ctxNode.reload();
            var node = new _pydioModelNode2['default'](currentPath + "/" + login, true);
            node.getMetadata().set("ajxp_mime", "user");
            node.getMetadata().set("IdmUser", idmUser);
            _this.props.openRoleEditor(node);
        });
    },

    render: function render() {
        var ctx = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        var currentPath = ctx.getPath();
        var path = undefined;
        if (currentPath.startsWith("/idm/users")) {
            path = currentPath.substr("/idm/users".length);
            if (path) {
                path = _react2['default'].createElement(
                    'div',
                    null,
                    this.context.getMessage('ajxp_admin.user.20').replace('%s', path)
                );
            }
        }
        return _react2['default'].createElement(
            'div',
            { style: { width: '100%' } },
            path,
            _react2['default'].createElement(
                'form',
                { autoComplete: "off" },
                _react2['default'].createElement(
                    'div',
                    { style: { width: '100%' } },
                    _react2['default'].createElement(ModernTextField, {
                        ref: 'user_id',
                        onChange: this.checkLogin,
                        fullWidth: true,
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.21'),
                        errorText: this.state.loginErrorText,
                        autoComplete: "nope"
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(ModernTextField, {
                        ref: 'pass',
                        type: 'password',
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.22'),
                        onChange: this.checkPassword,
                        fullWidth: true,
                        errorText: this.state.passErrorText || this.state.passHintText,
                        autoComplete: "new-password"
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(ModernTextField, {
                        ref: 'passconf',
                        type: 'password',
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.23'),
                        onChange: this.checkPassword,
                        fullWidth: true,
                        errorText: this.state.confirmErrorText,
                        autoComplete: "confirm-password"
                    })
                )
            )
        );
    }
});

exports['default'] = CreateUserForm;
module.exports = exports['default'];

},{"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/model/node":"pydio/model/node","pydio/util/pass":"pydio/util/pass","react":"react"}],58:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardDashboard = require('./board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

var _boardRolesDashboard = require('./board/RolesDashboard');

var _boardRolesDashboard2 = _interopRequireDefault(_boardRolesDashboard);

var _boardPoliciesBoard = require('./board/PoliciesBoard');

var _boardPoliciesBoard2 = _interopRequireDefault(_boardPoliciesBoard);

var _boardCallbacks = require('./board/Callbacks');

var _boardCallbacks2 = _interopRequireDefault(_boardCallbacks);

var _formsCreateUserForm = require('./forms/CreateUserForm');

var _formsCreateUserForm2 = _interopRequireDefault(_formsCreateUserForm);

var _formsCreateRoleOrGroupForm = require('./forms/CreateRoleOrGroupForm');

var _formsCreateRoleOrGroupForm2 = _interopRequireDefault(_formsCreateRoleOrGroupForm);

var _editorACL = require('./editor/ACL');

var _editorACL2 = _interopRequireDefault(_editorACL);

var _editorInfo = require('./editor/Info');

var _editorInfo2 = _interopRequireDefault(_editorInfo);

var _editorModel = require('./editor/Model');

var _editorModel2 = _interopRequireDefault(_editorModel);

var _editorParams = require('./editor/Params');

var _editorParams2 = _interopRequireDefault(_editorParams);

var _editorUser = require('./editor/User');

var _editorUser2 = _interopRequireDefault(_editorUser);

var _editorUtil = require('./editor/Util');

var _editorUtil2 = _interopRequireDefault(_editorUtil);

window.AdminPeople = {
    Callbacks: _boardCallbacks2['default'],

    Dashboard: _boardDashboard2['default'],
    RolesDashboard: _boardRolesDashboard2['default'],
    PoliciesBoard: _boardPoliciesBoard2['default'],

    Editor: {
        Model: _editorModel2['default'], Info: _editorInfo2['default'], ACL: _editorACL2['default'], Params: _editorParams2['default'], User: _editorUser2['default'], Util: _editorUtil2['default']
    },
    Forms: {
        CreateUserForm: _formsCreateUserForm2['default'], CreateRoleOrGroupForm: _formsCreateRoleOrGroupForm2['default']
    }

};

},{"./board/Callbacks":11,"./board/Dashboard":12,"./board/PoliciesBoard":13,"./board/RolesDashboard":14,"./editor/ACL":21,"./editor/Info":26,"./editor/Model":29,"./editor/Params":34,"./editor/User":37,"./editor/Util":41,"./forms/CreateRoleOrGroupForm":56,"./forms/CreateUserForm":57}],59:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Rule = require('./Rule');

var _Rule2 = _interopRequireDefault(_Rule);

var _materialUi = require('material-ui');

var _uuid = require('uuid');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var Policy = (function (_React$Component) {
    _inherits(Policy, _React$Component);

    function Policy(props) {
        _classCallCheck(this, Policy);

        _get(Object.getPrototypeOf(Policy.prototype), 'constructor', this).call(this, props);
        this.state = { policy: props.policy };
    }

    _createClass(Policy, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
            this.setState({ policy: next.policy });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.newPolicyWithRule) {
                this.onAddRule(null, this.props.newPolicyWithRule);
            }
        }
    }, {
        key: 'onNameChange',
        value: function onNameChange(value) {
            var policy = _extends({}, this.state.policy);
            policy.Name = value;
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onDescriptionChange',
        value: function onDescriptionChange(value) {
            var policy = _extends({}, this.state.policy);
            policy.Description = value;
            this.props.savePolicy(policy);
        }
    }, {
        key: 'saveLabels',
        value: function saveLabels() {
            var _state = this.state;
            var pName = _state.pName;
            var pDesc = _state.pDesc;
            var policy = _state.policy;

            if (pName) {
                policy.Name = pName;
            }
            if (pDesc) {
                policy.Description = pDesc;
            }
            this.setState({ pName: null, pDesc: null });
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onRuleChange',
        value: function onRuleChange(rule) {

            var policy = _extends({}, this.state.policy);

            if (policy.Policies) {
                policy.Policies = policy.Policies.filter(function (p) {
                    return p.id !== rule.id;
                });
                policy.Policies.push(rule);
            } else {
                policy.Policies = [rule];
            }
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onRemoveRule',
        value: function onRemoveRule(rule) {
            var dontSave = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var policy = _extends({}, this.state.policy);
            policy.Policies = policy.Policies.filter(function (p) {
                return p.id !== rule.id;
            });
            this.props.savePolicy(policy, dontSave);
        }
    }, {
        key: 'onAddRule',
        value: function onAddRule(event) {
            var _this = this;

            var ruleLabel = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

            var label = ruleLabel;
            var policy = _extends({}, this.state.policy);
            if (!policy.Policies) {
                policy.Policies = [];
            }
            var newId = (0, _uuid.v4)();
            var subjects = [],
                resources = [],
                actions = [];
            if (policy.ResourceGroup === "acl") {
                subjects = ["policy:" + policy.Uuid];
                resources = ["acl"];
            } else if (policy.ResourceGroup === "oidc") {
                resources = ["oidc"];
            }
            policy.Policies.push({
                id: newId,
                description: label,
                actions: actions,
                subjects: subjects,
                resources: resources,
                effect: "deny"
            });
            this.setState({ policy: policy, openRule: newId }, function () {
                _this.setState({ openRule: null });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var readonly = _props.readonly;
            var pydio = _props.pydio;
            var _state2 = this.state;
            var policy = _state2.policy;
            var openRule = _state2.openRule;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.policies.' + id] || id;
            };

            var rules = policy.Policies.map(function (rule, i) {
                return _react2['default'].createElement(_Rule2['default'], _extends({}, _this2.props, {
                    key: rule.description,
                    rule: rule,
                    isLast: i === policy.Policies.length - 1,
                    create: openRule === rule.id,
                    onRuleChange: _this2.onRuleChange.bind(_this2),
                    onRemoveRule: _this2.onRemoveRule.bind(_this2)
                }));
            });

            var icButtonsProps = {
                iconStyle: { fontSize: 18, color: 'rgba(0,0,0,.33)' },
                style: { padding: 8, width: 36, height: 36 },
                tooltipPosition: "top-right"
            };

            var rulesTitle = _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 14, fontWeight: 500 } },
                    'Rules'
                ),
                !readonly && _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-plus", tooltip: m('rule.create'), onTouchTap: this.onAddRule.bind(this) }, icButtonsProps, { tooltipPosition: "bottom-right" }))
            );

            var labelsBlock = undefined;
            if (!readonly) {
                (function () {
                    var _state3 = _this2.state;
                    var showLabels = _state3.showLabels;
                    var pName = _state3.pName;
                    var pDesc = _state3.pDesc;

                    var labelsModified = pName && pName !== policy.Name || pDesc && pDesc !== policy.Description;
                    labelsBlock = _react2['default'].createElement(
                        'div',
                        { style: { marginTop: 10, paddingTop: 10 } },
                        _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { fontSize: 14, fontWeight: 500 } },
                                'Edit Labels'
                            ),
                            _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-chevron-" + (showLabels ? 'down' : 'right'), tooltip: m('policy.editLabels'), onTouchTap: function () {
                                    return _this2.setState({ showLabels: !showLabels });
                                } }, icButtonsProps))
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { display: showLabels ? 'flex' : 'none' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { marginRight: 6, flex: 1 } },
                                _react2['default'].createElement(ModernTextField, { value: pName || policy.Name, fullWidth: true, onChange: function (e, v) {
                                        _this2.setState({ pName: v });
                                    } })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { marginLeft: 6, flex: 1 } },
                                _react2['default'].createElement(ModernTextField, { value: pDesc || policy.Description, fullWidth: true, onChange: function (e, v) {
                                        _this2.setState({ pDesc: v });
                                    } })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { width: 80 } },
                                _react2['default'].createElement(_materialUi.IconButton, {
                                    disabled: !labelsModified,
                                    iconClassName: "mdi mdi-content-save",
                                    tooltip: m('policy.saveLabels'),
                                    tooltipPosition: "top-center",
                                    onTouchTap: function () {
                                        _this2.saveLabels();
                                    },
                                    iconStyle: { fontSize: 20, color: 'rgba(0,0,0,' + (labelsModified ? '.43' : '.10') + ')' },
                                    style: { padding: 14 }
                                })
                            )
                        )
                    );
                })();
            }

            return _react2['default'].createElement(
                'div',
                { style: { padding: '12px 24px', backgroundColor: '#f5f5f5' } },
                rulesTitle,
                rules,
                labelsBlock
            );
        }
    }]);

    return Policy;
})(_react2['default'].Component);

exports['default'] = Policy;
module.exports = exports['default'];

},{"./Rule":60,"material-ui":"material-ui","pydio":"pydio","react":"react","uuid":2}],60:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydioUtilFunc = require('pydio/util/func');

var _pydioUtilFunc2 = _interopRequireDefault(_pydioUtilFunc);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _editorUtilClassLoader = require("../editor/util/ClassLoader");

var Rule = (function (_React$Component) {
    _inherits(Rule, _React$Component);

    function Rule() {
        _classCallCheck(this, Rule);

        _get(Object.getPrototypeOf(Rule.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Rule, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.create) {
                this.openEditor();
            }
        }
    }, {
        key: 'openEditor',
        value: function openEditor() {
            var _this = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var policy = _props.policy;
            var rule = _props.rule;
            var openRightPane = _props.openRightPane;
            var rulesEditorClass = _props.rulesEditorClass;

            if (this.refs.editor && this.refs.editor.isDirty()) {
                if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                    return false;
                }
            }
            if (!rulesEditorClass) {
                return false;
            }
            (0, _editorUtilClassLoader.loadEditorClass)(rulesEditorClass, null).then(function (component) {
                openRightPane({
                    COMPONENT: component,
                    PROPS: {
                        ref: "editor",
                        policy: policy,
                        rule: rule,
                        pydio: pydio,
                        saveRule: _this.props.onRuleChange,
                        create: _this.props.create,
                        onRequestTabClose: _this.closeEditor.bind(_this)
                    }
                });
            });
            return true;
        }
    }, {
        key: 'closeEditor',
        value: function closeEditor(editor) {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var closeRightPane = _props2.closeRightPane;

            if (editor && editor.isDirty()) {
                if (editor.isCreate()) {
                    this.props.onRemoveRule(this.props.rule, true);
                    closeRightPane();
                    return true;
                }
                if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                    return false;
                }
            }
            closeRightPane();
            return true;
        }
    }, {
        key: 'removeRule',
        value: function removeRule() {
            var _props3 = this.props;
            var pydio = _props3.pydio;
            var onRemoveRule = _props3.onRemoveRule;
            var rule = _props3.rule;

            pydio.UI.openConfirmDialog({
                message: pydio.MessageHash['ajxp_admin.policies.rule.delete.confirm'],
                destructive: [rule.description],
                validCallback: function validCallback() {
                    onRemoveRule(rule);
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props4 = this.props;
            var rule = _props4.rule;
            var readonly = _props4.readonly;
            var isLast = _props4.isLast;

            var iconColor = rule.effect === 'allow' ? '#33691e' : '#d32f2f';
            var buttons = [];
            if (!readonly) {
                buttons = [_react2['default'].createElement('span', { className: 'mdi mdi-pencil', style: { fontSize: 16, color: 'rgba(0,0,0,.33)', cursor: 'pointer', marginLeft: 12 }, onTouchTap: this.openEditor.bind(this) }), _react2['default'].createElement('span', { className: 'mdi mdi-delete', style: { fontSize: 16, color: 'rgba(0,0,0,.33)', cursor: 'pointer', marginLeft: 12 }, onTouchTap: this.removeRule.bind(this) })];
            }
            var label = _react2['default'].createElement(
                'div',
                null,
                rule.description,
                buttons
            );

            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', padding: '6px 0 5px', borderBottom: isLast ? null : '1px solid white' } },
                _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-traffic-light', color: iconColor, style: { fontSize: 16, marginRight: 10 } }),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    rule.description,
                    buttons
                )
            );
        }
    }]);

    return Rule;
})(_react2['default'].Component);

exports['default'] = Rule;
module.exports = exports['default'];

},{"../editor/util/ClassLoader":54,"material-ui":"material-ui","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/util/func":"pydio/util/func","react":"react"}]},{},[58]);
