(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MigrationComponents = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":1,"ieee754":6,"isarray":4}],4:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],5:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],6:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],7:[function(require,module,exports){
(function (Buffer){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _superagent = require("superagent");

var _superagent2 = _interopRequireDefault(_superagent);

var _querystring = require("querystring");

var _querystring2 = _interopRequireDefault(_querystring);

/**
* @module ApiClient
* @version 2.0.0
*/

/**
* Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
* application to use this class directly - the *Api and model classes provide the public API for the service. The
* contents of this file should be regarded as internal but are documented for completeness.
* @alias module:ApiClient
* @class
*/

var ApiClient = (function () {
    function ApiClient() {
        _classCallCheck(this, ApiClient);

        /**
         * The base URL against which to resolve every API call's (relative) path.
         * @type {String}
         * @default http://localhost/api/v2
         */
        this.basePath = 'http://localhost/api/v2'.replace(/\/+$/, '');

        /**
         * The authentication methods to be included for all API calls.
         * @type {Array.<String>}
         */
        this.authentications = {
            'basicAuth': { type: 'basic' }
        };

        /**
         * The default HTTP headers to be included for all API calls.
         * @type {Array.<String>}
         * @default {}
         */
        this.defaultHeaders = {};

        /**
         * The default HTTP timeout for all API calls.
         * @type {Number}
         * @default 60000
         */
        this.timeout = 60000;

        /**
         * If set to false an additional timestamp parameter is added to all API GET calls to
         * prevent browser caching
         * @type {Boolean}
         * @default true
         */
        this.cache = true;

        /**
         * If set to true, the client will save the cookies from each server
         * response, and return them in the next request.
         * @default false
         */
        this.enableCookies = false;

        /*
         * Used to save and return cookies in a node.js (non-browser) setting,
         * if this.enableCookies is set to true.
         */
        if (typeof window === 'undefined') {
            this.agent = new _superagent2["default"].agent();
        }
    }

    /**
    * The default API client implementation.
    * @type {module:ApiClient}
    */

    /**
    * Returns a string representation for an actual parameter.
    * @param param The actual parameter.
    * @returns {String} The string representation of <code>param</code>.
    */

    _createClass(ApiClient, [{
        key: "paramToString",
        value: function paramToString(param) {
            if (param == undefined || param == null) {
                return '';
            }
            if (param instanceof Date) {
                return param.toJSON();
            }

            return param.toString();
        }

        /**
        * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
        * NOTE: query parameters are not handled here.
        * @param {String} path The path to append to the base URL.
        * @param {Object} pathParams The parameter values to append.
        * @returns {String} The encoded path with parameter values substituted.
        */
    }, {
        key: "buildUrl",
        value: function buildUrl(path, pathParams) {
            var _this = this;

            if (!path.match(/^\//)) {
                path = '/' + path;
            }

            var url = this.basePath + path;
            url = url.replace(/\{([\w-]+)\}/g, function (fullMatch, key) {
                var value;
                if (pathParams.hasOwnProperty(key)) {
                    value = _this.paramToString(pathParams[key]);
                } else {
                    value = fullMatch;
                }

                return encodeURIComponent(value);
            });

            return url;
        }

        /**
        * Checks whether the given content type represents JSON.<br>
        * JSON content type examples:<br>
        * <ul>
        * <li>application/json</li>
        * <li>application/json; charset=UTF8</li>
        * <li>APPLICATION/JSON</li>
        * </ul>
        * @param {String} contentType The MIME content type to check.
        * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
        */
    }, {
        key: "isJsonMime",
        value: function isJsonMime(contentType) {
            return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
        }

        /**
        * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
        * @param {Array.<String>} contentTypes
        * @returns {String} The chosen content type, preferring JSON.
        */
    }, {
        key: "jsonPreferredMime",
        value: function jsonPreferredMime(contentTypes) {
            for (var i = 0; i < contentTypes.length; i++) {
                if (this.isJsonMime(contentTypes[i])) {
                    return contentTypes[i];
                }
            }

            return contentTypes[0];
        }

        /**
        * Checks whether the given parameter value represents file-like content.
        * @param param The parameter to check.
        * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
        */
    }, {
        key: "isFileParam",
        value: function isFileParam(param) {
            // fs.ReadStream in Node.js and Electron (but not in runtime like browserify)
            if (typeof require === 'function') {
                var fs = undefined;
                try {
                    fs = require('fs');
                } catch (err) {}
                if (fs && fs.ReadStream && param instanceof fs.ReadStream) {
                    return true;
                }
            }

            // Buffer in Node.js
            if (typeof Buffer === 'function' && param instanceof Buffer) {
                return true;
            }

            // Blob in browser
            if (typeof Blob === 'function' && param instanceof Blob) {
                return true;
            }

            // File in browser (it seems File object is also instance of Blob, but keep this for safe)
            if (typeof File === 'function' && param instanceof File) {
                return true;
            }

            return false;
        }

        /**
        * Normalizes parameter values:
        * <ul>
        * <li>remove nils</li>
        * <li>keep files and arrays</li>
        * <li>format to string with `paramToString` for other cases</li>
        * </ul>
        * @param {Object.<String, Object>} params The parameters as object properties.
        * @returns {Object.<String, Object>} normalized parameters.
        */
    }, {
        key: "normalizeParams",
        value: function normalizeParams(params) {
            var newParams = {};
            for (var key in params) {
                if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
                    var value = params[key];
                    if (this.isFileParam(value) || Array.isArray(value)) {
                        newParams[key] = value;
                    } else {
                        newParams[key] = this.paramToString(value);
                    }
                }
            }

            return newParams;
        }

        /**
        * Enumeration of collection format separator strategies.
        * @enum {String}
        * @readonly
        */
    }, {
        key: "buildCollectionParam",

        /**
        * Builds a string representation of an array-type actual parameter, according to the given collection format.
        * @param {Array} param An array parameter.
        * @param {module:ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
        * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
        * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
        */
        value: function buildCollectionParam(param, collectionFormat) {
            if (param == null) {
                return null;
            }
            switch (collectionFormat) {
                case 'csv':
                    return param.map(this.paramToString).join(',');
                case 'ssv':
                    return param.map(this.paramToString).join(' ');
                case 'tsv':
                    return param.map(this.paramToString).join('\t');
                case 'pipes':
                    return param.map(this.paramToString).join('|');
                case 'multi':
                    //return the array directly as SuperAgent will handle it as expected
                    return param.map(this.paramToString);
                default:
                    throw new Error('Unknown collection format: ' + collectionFormat);
            }
        }

        /**
        * Applies authentication headers to the request.
        * @param {Object} request The request object created by a <code>superagent()</code> call.
        * @param {Array.<String>} authNames An array of authentication method names.
        */
    }, {
        key: "applyAuthToRequest",
        value: function applyAuthToRequest(request, authNames) {
            var _this2 = this;

            authNames.forEach(function (authName) {
                var auth = _this2.authentications[authName];
                switch (auth.type) {
                    case 'basic':
                        if (auth.username || auth.password) {
                            request.auth(auth.username || '', auth.password || '');
                        }

                        break;
                    case 'apiKey':
                        if (auth.apiKey) {
                            var data = {};
                            if (auth.apiKeyPrefix) {
                                data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
                            } else {
                                data[auth.name] = auth.apiKey;
                            }

                            if (auth['in'] === 'header') {
                                request.set(data);
                            } else {
                                request.query(data);
                            }
                        }

                        break;
                    case 'oauth2':
                        if (auth.accessToken) {
                            request.set({ 'Authorization': 'Bearer ' + auth.accessToken });
                        }

                        break;
                    default:
                        throw new Error('Unknown authentication type: ' + auth.type);
                }
            });
        }

        /**
        * Deserializes an HTTP response body into a value of the specified type.
        * @param {Object} response A SuperAgent response object.
        * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
        * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
        * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
        * all properties on <code>data<code> will be converted to this type.
        * @returns A value of the specified type.
        */
    }, {
        key: "deserialize",
        value: function deserialize(response, returnType) {
            if (response == null || returnType == null || response.status == 204) {
                return null;
            }

            // Rely on SuperAgent for parsing response body.
            // See http://visionmedia.github.io/superagent/#parsing-response-bodies
            var data = response.body;
            if (data == null || typeof data === 'object' && typeof data.length === 'undefined' && !Object.keys(data).length) {
                // SuperAgent does not always produce a body; use the unparsed response as a fallback
                data = response.text;
            }

            return ApiClient.convertToType(data, returnType);
        }

        /**
        * Invokes the REST service using the supplied settings and parameters.
        * @param {String} path The base URL to invoke.
        * @param {String} httpMethod The HTTP method to use.
        * @param {Object.<String, String>} pathParams A map of path parameters and their values.
        * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
        * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
        * @param {Object.<String, Object>} formParams A map of form parameters and their values.
        * @param {Object} bodyParam The value to pass as the request body.
        * @param {Array.<String>} authNames An array of authentication type names.
        * @param {Array.<String>} contentTypes An array of request MIME types.
        * @param {Array.<String>} accepts An array of acceptable response MIME types.
        * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
        * constructor for a complex type.
        * @returns {Promise} A {@link https://www.promisejs.org/|Promise} object.
        */
    }, {
        key: "callApi",
        value: function callApi(path, httpMethod, pathParams, queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts, returnType) {
            var _this3 = this;

            var url = this.buildUrl(path, pathParams);
            var request = (0, _superagent2["default"])(httpMethod, url);

            // apply authentications
            this.applyAuthToRequest(request, authNames);

            // set query parameters
            if (httpMethod.toUpperCase() === 'GET' && this.cache === false) {
                queryParams['_'] = new Date().getTime();
            }

            request.query(this.normalizeParams(queryParams));

            // set header parameters
            request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));

            // set request timeout
            request.timeout(this.timeout);

            var contentType = this.jsonPreferredMime(contentTypes);
            if (contentType) {
                // Issue with superagent and multipart/form-data (https://github.com/visionmedia/superagent/issues/746)
                if (contentType != 'multipart/form-data') {
                    request.type(contentType);
                }
            } else if (!request.header['Content-Type']) {
                request.type('application/json');
            }

            if (contentType === 'application/x-www-form-urlencoded') {
                request.send(_querystring2["default"].stringify(this.normalizeParams(formParams)));
            } else if (contentType == 'multipart/form-data') {
                var _formParams = this.normalizeParams(formParams);
                for (var key in _formParams) {
                    if (_formParams.hasOwnProperty(key)) {
                        if (this.isFileParam(_formParams[key])) {
                            // file field
                            request.attach(key, _formParams[key]);
                        } else {
                            request.field(key, _formParams[key]);
                        }
                    }
                }
            } else if (bodyParam) {
                request.send(bodyParam);
            }

            var accept = this.jsonPreferredMime(accepts);
            if (accept) {
                request.accept(accept);
            }

            if (returnType === 'Blob') {
                request.responseType('blob');
            } else if (returnType === 'String') {
                request.responseType('string');
            }

            // Attach previously saved cookies, if enabled
            if (this.enableCookies) {
                if (typeof window === 'undefined') {
                    this.agent.attachCookies(request);
                } else {
                    request.withCredentials();
                }
            }

            return new Promise(function (resolve, reject) {
                request.end(function (error, response) {
                    if (error) {
                        reject(error);
                    } else {
                        try {
                            var data = _this3.deserialize(response, returnType);
                            if (_this3.enableCookies && typeof window === 'undefined') {
                                _this3.agent.saveCookies(response);
                            }

                            resolve({ data: data, response: response });
                        } catch (err) {
                            reject(err);
                        }
                    }
                });
            });
        }

        /**
        * Parses an ISO-8601 string representation of a date value.
        * @param {String} str The date value as a string.
        * @returns {Date} The parsed date object.
        */
    }], [{
        key: "parseDate",
        value: function parseDate(str) {
            return new Date(str.replace(/T/i, ' '));
        }

        /**
        * Converts a value to the specified type.
        * @param {(String|Object)} data The data to convert, as a string or object.
        * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
        * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
        * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
        * all properties on <code>data<code> will be converted to this type.
        * @returns An instance of the specified type or null or undefined if data is null or undefined.
        */
    }, {
        key: "convertToType",
        value: function convertToType(data, type) {
            if (data === null || data === undefined) return data;

            switch (type) {
                case 'Boolean':
                    return Boolean(data);
                case 'Integer':
                    return parseInt(data, 10);
                case 'Number':
                    return parseFloat(data);
                case 'String':
                    return String(data);
                case 'Date':
                    return ApiClient.parseDate(String(data));
                case 'Blob':
                    return data;
                default:
                    if (type === Object) {
                        // generic object, return directly
                        return data;
                    } else if (typeof type === 'function') {
                        // for model type like: User
                        return type.constructFromObject(data);
                    } else if (Array.isArray(type)) {
                        // for array type like: ['String']
                        var itemType = type[0];

                        return data.map(function (item) {
                            return ApiClient.convertToType(item, itemType);
                        });
                    } else if (typeof type === 'object') {
                        // for plain object type like: {'String': 'Integer'}
                        var keyType, valueType;
                        for (var k in type) {
                            if (type.hasOwnProperty(k)) {
                                keyType = k;
                                valueType = type[k];
                                break;
                            }
                        }

                        var result = {};
                        for (var k in data) {
                            if (data.hasOwnProperty(k)) {
                                var key = ApiClient.convertToType(k, keyType);
                                var value = ApiClient.convertToType(data[k], valueType);
                                result[key] = value;
                            }
                        }

                        return result;
                    } else {
                        // for unknown type, return the data directly
                        return data;
                    }
            }
        }

        /**
        * Constructs a new map or array model from REST data.
        * @param data {Object|Array} The REST data.
        * @param obj {Object|Array} The target object or array.
        */
    }, {
        key: "constructFromObject",
        value: function constructFromObject(data, obj, itemType) {
            if (Array.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    if (data.hasOwnProperty(i)) obj[i] = ApiClient.convertToType(data[i], itemType);
                }
            } else {
                for (var k in data) {
                    if (data.hasOwnProperty(k)) obj[k] = ApiClient.convertToType(data[k], itemType);
                }
            }
        }
    }, {
        key: "CollectionFormatEnum",
        value: {
            /**
             * Comma-separated values. Value: <code>csv</code>
             * @const
             */
            CSV: ',',

            /**
             * Space-separated values. Value: <code>ssv</code>
             * @const
             */
            SSV: ' ',

            /**
             * Tab-separated values. Value: <code>tsv</code>
             * @const
             */
            TSV: '\t',

            /**
             * Pipe(|)-separated values. Value: <code>pipes</code>
             * @const
             */
            PIPES: '|',

            /**
             * Native array. Value: <code>multi</code>
             * @const
             */
            MULTI: 'multi'
        },
        enumerable: true
    }]);

    return ApiClient;
})();

exports["default"] = ApiClient;
ApiClient.instance = new ApiClient();
module.exports = exports["default"];

}).call(this,require("buffer").Buffer)
},{"buffer":3,"fs":2,"querystring":35,"superagent":36}],8:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require("../ApiClient");

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _modelInputStream = require('../model/InputStream');

var _modelInputStream2 = _interopRequireDefault(_modelInputStream);

var _modelNodeList = require('../model/NodeList');

var _modelNodeList2 = _interopRequireDefault(_modelNodeList);

var _modelPydioResponse = require('../model/PydioResponse');

var _modelPydioResponse2 = _interopRequireDefault(_modelPydioResponse);

/**
* File service.
* @module api/FileApi
* @version 2.0.0
*/

var FileApi = (function () {

  /**
  * Constructs a new FileApi. 
  * @alias module:api/FileApi
  * @class
  * @param {module:ApiClient} apiClient Optional API client implementation to use,
  * default to {@link module:ApiClient#instance} if unspecified.
  */

  function FileApi(apiClient) {
    _classCallCheck(this, FileApi);

    this.apiClient = apiClient || _ApiClient2['default'].instance;
  }

  /**
   * Create new resources or move/copy existing resources: + Create a new folder (pass a path **with a trailing slash**), or a new empty file (no trailing slash). + Copy a resource to a new destination: pass destination as {path}, and origin via copy_from parameter. + Rename / Move a resource : basically a copy operation followed by a delete of original 
   * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
   * @param {Object} opts Optional parameters
   * @param {String} opts.copySource If it&#39;s a move or a copy, indicated the path of the original node. Path must contain the original workspace Id, as it can be used for cross repository copy as well.
   * @param {Boolean} opts.deleteSource If it&#39;s a move/rename, will remove original after copy operation
   * @param {Boolean} opts.override Ignore existing resource and override it (default to false)
   * @param {Boolean} opts.recursive For directories, create parents if necessary (default to false)
   * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
   */

  _createClass(FileApi, [{
    key: 'createNodeWithHttpInfo',
    value: function createNodeWithHttpInfo(path, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling createNode");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {
        'copy_source': opts['copySource'],
        'delete_source': opts['deleteSource'],
        'override': opts['override'],
        'recursive': opts['recursive']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/fs/{path}', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Create new resources or move/copy existing resources: + Create a new folder (pass a path **with a trailing slash**), or a new empty file (no trailing slash). + Copy a resource to a new destination: pass destination as {path}, and origin via copy_from parameter. + Rename / Move a resource : basically a copy operation followed by a delete of original 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {Object} opts Optional parameters
     * @param {String} opts.copySource If it&#39;s a move or a copy, indicated the path of the original node. Path must contain the original workspace Id, as it can be used for cross repository copy as well.
     * @param {Boolean} opts.deleteSource If it&#39;s a move/rename, will remove original after copy operation
     * @param {Boolean} opts.override Ignore existing resource and override it (default to false)
     * @param {Boolean} opts.recursive For directories, create parents if necessary (default to false)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'createNode',
    value: function createNode(path, opts) {
      return this.createNodeWithHttpInfo(path, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Delete existing resource 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'deleteNodeWithHttpInfo',
    value: function deleteNodeWithHttpInfo(path) {
      var postBody = null;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling deleteNode");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/fs/{path}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Delete existing resource 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'deleteNode',
    value: function deleteNode(path) {
      return this.deleteNodeWithHttpInfo(path).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Get resource content. Depending on the attachment parameter, will try to either trigger a download, or send binary stream with appropriate headers. Depending on the active plugins, may be able to serve: + Plain text + MP3/Wav Stream + MP4 Stream + On-the-fly generated images + On-the-fly generated thumbnails for images or pdf 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {Object} opts Optional parameters
     * @param {Boolean} opts.attachment if set, send back a force-download, otherwise use Accept header to try to find the best response Content-Type.
     * @param {String} opts.additionalParameters some plugin can take more parameters to send various contents derived from main resource. For example, for images, you can pass get_thumb &amp; dimension 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link File} and HTTP response
     */
  }, {
    key: 'downloadWithHttpInfo',
    value: function downloadWithHttpInfo(path, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling download");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {
        'attachment': opts['attachment'],
        'additional_parameters': opts['additionalParameters']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/octet-stream'];
      var returnType = File;

      return this.apiClient.callApi('/io/{path}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Get resource content. Depending on the attachment parameter, will try to either trigger a download, or send binary stream with appropriate headers. Depending on the active plugins, may be able to serve: + Plain text + MP3/Wav Stream + MP4 Stream + On-the-fly generated images + On-the-fly generated thumbnails for images or pdf 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {Object} opts Optional parameters
     * @param {Boolean} opts.attachment if set, send back a force-download, otherwise use Accept header to try to find the best response Content-Type.
     * @param {String} opts.additionalParameters some plugin can take more parameters to send various contents derived from main resource. For example, for images, you can pass get_thumb &amp; dimension 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link File}
     */
  }, {
    key: 'download',
    value: function download(path, opts) {
      return this.downloadWithHttpInfo(path, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Get information about a node and its metadata. By default, it will return  Pydio \&quot;primary\&quot; metadata (stat, internal informations). Extended metadata can be added by some plugins.   For collections (folders), pass the **children** parameter to list its content.   To access the actual content of the nodes, see the I/O API. 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {module:model/String} meta Level of precision for expected metadata
     * @param {Object} opts Optional parameters
     * @param {module:model/String} opts.children Load children if node is a collection
     * @param {Boolean} opts.recursive If requiring children, load grandchildren recursively
     * @param {Number} opts.maxDepth If requiring children recursively, stop at the given depth. If -1, no limit. (default to -1)
     * @param {Number} opts.maxNodes If requiring children recursively, stop at the given depth. If -1, no limit. (default to -1)
     * @param {Boolean} opts.remoteOrder Apply server-side sorting (default to false)
     * @param {String} opts.orderColumn Order column to use for server-side sorting
     * @param {String} opts.orderDirection Order direction to use for server-side sorting (asc or desc)
     * @param {Boolean} opts.pagePosition For a single file, try to detect the page position in the parent node listing. (default to false)
     * @param {Boolean} opts.xIndexationRequired Invalidate current index and trigger a background indexation
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/NodeList} and HTTP response
     */
  }, {
    key: 'getNodeInfosWithHttpInfo',
    value: function getNodeInfosWithHttpInfo(path, meta, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling getNodeInfos");
      }

      // verify the required parameter 'meta' is set
      if (meta === undefined || meta === null) {
        throw new Error("Missing the required parameter 'meta' when calling getNodeInfos");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {
        'meta': meta,
        'children': opts['children']
      };
      var headerParams = {
        'X-Indexation-Required': opts['xIndexationRequired']
      };
      var formParams = {
        'recursive': opts['recursive'],
        'max_depth': opts['maxDepth'],
        'max_nodes': opts['maxNodes'],
        'remote_order': opts['remoteOrder'],
        'order_column': opts['orderColumn'],
        'order_direction': opts['orderDirection'],
        'page_position': opts['pagePosition']
      };

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelNodeList2['default'];

      return this.apiClient.callApi('/fs/{path}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Get information about a node and its metadata. By default, it will return  Pydio \&quot;primary\&quot; metadata (stat, internal informations). Extended metadata can be added by some plugins.   For collections (folders), pass the **children** parameter to list its content.   To access the actual content of the nodes, see the I/O API. 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {module:model/String} meta Level of precision for expected metadata
     * @param {Object} opts Optional parameters
     * @param {module:model/String} opts.children Load children if node is a collection
     * @param {Boolean} opts.recursive If requiring children, load grandchildren recursively
     * @param {Number} opts.maxDepth If requiring children recursively, stop at the given depth. If -1, no limit. (default to -1)
     * @param {Number} opts.maxNodes If requiring children recursively, stop at the given depth. If -1, no limit. (default to -1)
     * @param {Boolean} opts.remoteOrder Apply server-side sorting (default to false)
     * @param {String} opts.orderColumn Order column to use for server-side sorting
     * @param {String} opts.orderDirection Order direction to use for server-side sorting (asc or desc)
     * @param {Boolean} opts.pagePosition For a single file, try to detect the page position in the parent node listing. (default to false)
     * @param {Boolean} opts.xIndexationRequired Invalidate current index and trigger a background indexation
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/NodeList}
     */
  }, {
    key: 'getNodeInfos',
    value: function getNodeInfos(path, meta, opts) {
      return this.getNodeInfosWithHttpInfo(path, meta, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Update existing resources metadata (see I/O for content modification). Basic metadata is provided by core plugins, but they can be extended by other plugins. For example : &#x60;{\&quot;core\&quot;: {\&quot;chmod\&quot;: 777}}, {\&quot;user_meta\&quot;:[{\&quot;metaName\&quot;:\&quot;metaValue\&quot;}]}&#x60; &#x60;{\&quot;bookmarks\&quot;:{\&quot;bookmarked\&quot;: true}, \&quot;locks\&quot;:{\&quot;locked\&quot;:true}, \&quot;meta.watch\&quot;:{\&quot;watch\&quot;:true}}&#x60; etc... 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {String} metadata Json-serialized metadata to update
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'updateNodeWithHttpInfo',
    value: function updateNodeWithHttpInfo(path, metadata) {
      var postBody = null;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling updateNode");
      }

      // verify the required parameter 'metadata' is set
      if (metadata === undefined || metadata === null) {
        throw new Error("Missing the required parameter 'metadata' when calling updateNode");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {
        'metadata': metadata
      };

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/fs/{path}', 'PATCH', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Update existing resources metadata (see I/O for content modification). Basic metadata is provided by core plugins, but they can be extended by other plugins. For example : &#x60;{\&quot;core\&quot;: {\&quot;chmod\&quot;: 777}}, {\&quot;user_meta\&quot;:[{\&quot;metaName\&quot;:\&quot;metaValue\&quot;}]}&#x60; &#x60;{\&quot;bookmarks\&quot;:{\&quot;bookmarked\&quot;: true}, \&quot;locks\&quot;:{\&quot;locked\&quot;:true}, \&quot;meta.watch\&quot;:{\&quot;watch\&quot;:true}}&#x60; etc... 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {String} metadata Json-serialized metadata to update
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'updateNode',
    value: function updateNode(path, metadata) {
      return this.updateNodeWithHttpInfo(path, metadata).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Create or update resource by posting to Input Stream 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {module:model/InputStream} raw binary data
     * @param {Object} opts Optional parameters
     * @param {Boolean} opts.xRenameIfExists Automatically increment filename if it already exists
     * @param {String} opts.xAppendTo Append uploaded data at the end of existing file
     * @param {Boolean} opts.xPartialUpload If the current put is a part of a file. If set, the X-Partial-Target-Bytesize header is required.
     * @param {Number} opts.xPartialTargetBytesize In case of partial upload, the size of the full file as expected at the end of upload.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'uploadStreamWithHttpInfo',
    value: function uploadStreamWithHttpInfo(path, raw, opts) {
      opts = opts || {};
      var postBody = raw;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling uploadStream");
      }

      // verify the required parameter 'raw' is set
      if (raw === undefined || raw === null) {
        throw new Error("Missing the required parameter 'raw' when calling uploadStream");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {};
      var headerParams = {
        'X-Rename-If-Exists': opts['xRenameIfExists'],
        'X-Append-To': opts['xAppendTo'],
        'X-Partial-Upload': opts['xPartialUpload'],
        'X-Partial-Target-Bytesize': opts['xPartialTargetBytesize']
      };
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = [];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/io/{path}', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Create or update resource by posting to Input Stream 
     * @param {String} path Workspace id or alias + full path to the node, e.g. \&quot;/my-files/path/to/node\&quot;
     * @param {module:model/InputStream} raw binary data
     * @param {Object} opts Optional parameters
     * @param {Boolean} opts.xRenameIfExists Automatically increment filename if it already exists
     * @param {String} opts.xAppendTo Append uploaded data at the end of existing file
     * @param {Boolean} opts.xPartialUpload If the current put is a part of a file. If set, the X-Partial-Target-Bytesize header is required.
     * @param {Number} opts.xPartialTargetBytesize In case of partial upload, the size of the full file as expected at the end of upload.
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'uploadStream',
    value: function uploadStream(path, raw, opts) {
      return this.uploadStreamWithHttpInfo(path, raw, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }
  }]);

  return FileApi;
})();

exports['default'] = FileApi;
module.exports = exports['default'];

},{"../ApiClient":7,"../model/InputStream":21,"../model/NodeList":24,"../model/PydioResponse":29}],9:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require("../ApiClient");

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _modelAdminWorkspace = require('../model/AdminWorkspace');

var _modelAdminWorkspace2 = _interopRequireDefault(_modelAdminWorkspace);

var _modelMetaSourceParameters = require('../model/MetaSourceParameters');

var _modelMetaSourceParameters2 = _interopRequireDefault(_modelMetaSourceParameters);

var _modelNodeList = require('../model/NodeList');

var _modelNodeList2 = _interopRequireDefault(_modelNodeList);

var _modelPeoplePatch = require('../model/PeoplePatch');

var _modelPeoplePatch2 = _interopRequireDefault(_modelPeoplePatch);

var _modelPydioResponse = require('../model/PydioResponse');

var _modelPydioResponse2 = _interopRequireDefault(_modelPydioResponse);

var _modelRole = require('../model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

/**
* Provisioning service.
* @module api/ProvisioningApi
* @version 2.0.0
*/

var ProvisioningApi = (function () {

  /**
  * Constructs a new ProvisioningApi. 
  * @alias module:api/ProvisioningApi
  * @class
  * @param {module:ApiClient} apiClient Optional API client implementation to use,
  * default to {@link module:ApiClient#instance} if unspecified.
  */

  function ProvisioningApi(apiClient) {
    _classCallCheck(this, ProvisioningApi);

    this.apiClient = apiClient || _ApiClient2['default'].instance;
  }

  /**
   * Add a metasource 
   * @param {String} workspaceId id or alias of this workspace
   * @param {String} metaId plugin id for new meta
   * @param {module:model/MetaSourceParameters} parameters Meta source parameters
   * @param {Object} opts Optional parameters
   * @param {String} opts.format Format produced in output (defaults to xml)
   * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
   */

  _createClass(ProvisioningApi, [{
    key: 'adminAddWorkspaceFeatureWithHttpInfo',
    value: function adminAddWorkspaceFeatureWithHttpInfo(workspaceId, metaId, parameters, opts) {
      opts = opts || {};
      var postBody = parameters;

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling adminAddWorkspaceFeature");
      }

      // verify the required parameter 'metaId' is set
      if (metaId === undefined || metaId === null) {
        throw new Error("Missing the required parameter 'metaId' when calling adminAddWorkspaceFeature");
      }

      // verify the required parameter 'parameters' is set
      if (parameters === undefined || parameters === null) {
        throw new Error("Missing the required parameter 'parameters' when calling adminAddWorkspaceFeature");
      }

      var pathParams = {
        'workspaceId': workspaceId,
        'metaId': metaId
      };
      var queryParams = {
        'format': opts['format']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/admin/workspaces/{workspaceId}/features/{metaId}', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Add a metasource 
     * @param {String} workspaceId id or alias of this workspace
     * @param {String} metaId plugin id for new meta
     * @param {module:model/MetaSourceParameters} parameters Meta source parameters
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'adminAddWorkspaceFeature',
    value: function adminAddWorkspaceFeature(workspaceId, metaId, parameters, opts) {
      return this.adminAddWorkspaceFeatureWithHttpInfo(workspaceId, metaId, parameters, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Create a workspace from scratch by posting JSON data 
     * @param {module:model/AdminWorkspace} payload Repository details
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/AdminWorkspace} and HTTP response
     */
  }, {
    key: 'adminCreateWorkspaceWithHttpInfo',
    value: function adminCreateWorkspaceWithHttpInfo(payload) {
      var postBody = payload;

      // verify the required parameter 'payload' is set
      if (payload === undefined || payload === null) {
        throw new Error("Missing the required parameter 'payload' when calling adminCreateWorkspace");
      }

      var pathParams = {};
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelAdminWorkspace2['default'];

      return this.apiClient.callApi('/admin/workspaces', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Create a workspace from scratch by posting JSON data 
     * @param {module:model/AdminWorkspace} payload Repository details
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/AdminWorkspace}
     */
  }, {
    key: 'adminCreateWorkspace',
    value: function adminCreateWorkspace(payload) {
      return this.adminCreateWorkspaceWithHttpInfo(payload).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Load detail of a workspace 
     * @param {String} workspaceId Id or Alias / Load detail of this workspace
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'adminDeleteWorkspaceWithHttpInfo',
    value: function adminDeleteWorkspaceWithHttpInfo(workspaceId) {
      var postBody = null;

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling adminDeleteWorkspace");
      }

      var pathParams = {
        'workspaceId': workspaceId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/admin/workspaces/{workspaceId}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Load detail of a workspace 
     * @param {String} workspaceId Id or Alias / Load detail of this workspace
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'adminDeleteWorkspace',
    value: function adminDeleteWorkspace(workspaceId) {
      return this.adminDeleteWorkspaceWithHttpInfo(workspaceId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * NOT IMPLEMENTED YET - Edit details of a workspace 
     * @param {String} workspaceId Id or Alias / Update details for this workspace
     * @param {module:model/AdminWorkspace} payload Repository details
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/AdminWorkspace} and HTTP response
     */
  }, {
    key: 'adminEditWorkspaceWithHttpInfo',
    value: function adminEditWorkspaceWithHttpInfo(workspaceId, payload) {
      var postBody = payload;

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling adminEditWorkspace");
      }

      // verify the required parameter 'payload' is set
      if (payload === undefined || payload === null) {
        throw new Error("Missing the required parameter 'payload' when calling adminEditWorkspace");
      }

      var pathParams = {
        'workspaceId': workspaceId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelAdminWorkspace2['default'];

      return this.apiClient.callApi('/admin/workspaces/{workspaceId}', 'PATCH', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * NOT IMPLEMENTED YET - Edit details of a workspace 
     * @param {String} workspaceId Id or Alias / Update details for this workspace
     * @param {module:model/AdminWorkspace} payload Repository details
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/AdminWorkspace}
     */
  }, {
    key: 'adminEditWorkspace',
    value: function adminEditWorkspace(workspaceId, payload) {
      return this.adminEditWorkspaceWithHttpInfo(workspaceId, payload).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Edit a metasource 
     * @param {String} workspaceId id or alias of this workspace
     * @param {String} metaId plugin id for meta
     * @param {module:model/MetaSourceParameters} parameters Meta source parameters
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'adminEditWorkspaceFeatureWithHttpInfo',
    value: function adminEditWorkspaceFeatureWithHttpInfo(workspaceId, metaId, parameters) {
      var postBody = parameters;

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling adminEditWorkspaceFeature");
      }

      // verify the required parameter 'metaId' is set
      if (metaId === undefined || metaId === null) {
        throw new Error("Missing the required parameter 'metaId' when calling adminEditWorkspaceFeature");
      }

      // verify the required parameter 'parameters' is set
      if (parameters === undefined || parameters === null) {
        throw new Error("Missing the required parameter 'parameters' when calling adminEditWorkspaceFeature");
      }

      var pathParams = {
        'workspaceId': workspaceId,
        'metaId': metaId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/admin/workspaces/{workspaceId}/features/{metaId}', 'PATCH', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Edit a metasource 
     * @param {String} workspaceId id or alias of this workspace
     * @param {String} metaId plugin id for meta
     * @param {module:model/MetaSourceParameters} parameters Meta source parameters
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'adminEditWorkspaceFeature',
    value: function adminEditWorkspaceFeature(workspaceId, metaId, parameters) {
      return this.adminEditWorkspaceFeatureWithHttpInfo(workspaceId, metaId, parameters).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Load detail of a workspace 
     * @param {String} workspaceId Id or Alias / Load detail of this workspace
     * @param {Object} opts Optional parameters
     * @param {Boolean} opts.loadFillValues Load additional data to build a form for editing this role
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/AdminWorkspace} and HTTP response
     */
  }, {
    key: 'adminGetWorkspaceWithHttpInfo',
    value: function adminGetWorkspaceWithHttpInfo(workspaceId, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling adminGetWorkspace");
      }

      var pathParams = {
        'workspaceId': workspaceId
      };
      var queryParams = {
        'load_fill_values': opts['loadFillValues'],
        'format': opts['format']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelAdminWorkspace2['default'];

      return this.apiClient.callApi('/admin/workspaces/{workspaceId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Load detail of a workspace 
     * @param {String} workspaceId Id or Alias / Load detail of this workspace
     * @param {Object} opts Optional parameters
     * @param {Boolean} opts.loadFillValues Load additional data to build a form for editing this role
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/AdminWorkspace}
     */
  }, {
    key: 'adminGetWorkspace',
    value: function adminGetWorkspace(workspaceId, opts) {
      return this.adminGetWorkspaceWithHttpInfo(workspaceId, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * List Workspaces 
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/NodeList} and HTTP response
     */
  }, {
    key: 'adminListWorkspacesWithHttpInfo',
    value: function adminListWorkspacesWithHttpInfo(opts) {
      opts = opts || {};
      var postBody = null;

      var pathParams = {};
      var queryParams = {
        'format': opts['format']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelNodeList2['default'];

      return this.apiClient.callApi('/admin/workspaces', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * List Workspaces 
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/NodeList}
     */
  }, {
    key: 'adminListWorkspaces',
    value: function adminListWorkspaces(opts) {
      return this.adminListWorkspacesWithHttpInfo(opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Edit a metasource 
     * @param {String} workspaceId id or alias of this workspace
     * @param {String} metaId plugin id for meta
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'adminRemoveWorkspaceFeatureWithHttpInfo',
    value: function adminRemoveWorkspaceFeatureWithHttpInfo(workspaceId, metaId) {
      var postBody = null;

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling adminRemoveWorkspaceFeature");
      }

      // verify the required parameter 'metaId' is set
      if (metaId === undefined || metaId === null) {
        throw new Error("Missing the required parameter 'metaId' when calling adminRemoveWorkspaceFeature");
      }

      var pathParams = {
        'workspaceId': workspaceId,
        'metaId': metaId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/admin/workspaces/{workspaceId}/features/{metaId}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Edit a metasource 
     * @param {String} workspaceId id or alias of this workspace
     * @param {String} metaId plugin id for meta
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'adminRemoveWorkspaceFeature',
    value: function adminRemoveWorkspaceFeature(workspaceId, metaId) {
      return this.adminRemoveWorkspaceFeatureWithHttpInfo(workspaceId, metaId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Update a workspace by posting JSON data 
     * @param {module:model/AdminWorkspace} payload Repository details
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/AdminWorkspace} and HTTP response
     */
  }, {
    key: 'adminUpdateWorkspaceWithHttpInfo',
    value: function adminUpdateWorkspaceWithHttpInfo(payload) {
      var postBody = payload;

      // verify the required parameter 'payload' is set
      if (payload === undefined || payload === null) {
        throw new Error("Missing the required parameter 'payload' when calling adminUpdateWorkspace");
      }

      var pathParams = {};
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelAdminWorkspace2['default'];

      return this.apiClient.callApi('/admin/workspaces', 'PATCH', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Update a workspace by posting JSON data 
     * @param {module:model/AdminWorkspace} payload Repository details
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/AdminWorkspace}
     */
  }, {
    key: 'adminUpdateWorkspace',
    value: function adminUpdateWorkspace(payload) {
      return this.adminUpdateWorkspaceWithHttpInfo(payload).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Create a new user or a new group with this path. To create a user,  make sure to pass a userPass parameter. Otherwise it will create a  group. 
     * @param {String} path User or group identifier, including full group path
     * @param {module:model/String} resourceType Wether it&#39;s a user or a group
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @param {String} opts.groupLabel Label of the new group if we are creating a group
     * @param {String} opts.userPass Password of the new user if we are creating a user
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'createPeopleWithHttpInfo',
    value: function createPeopleWithHttpInfo(path, resourceType, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling createPeople");
      }

      // verify the required parameter 'resourceType' is set
      if (resourceType === undefined || resourceType === null) {
        throw new Error("Missing the required parameter 'resourceType' when calling createPeople");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {
        'format': opts['format']
      };
      var headerParams = {};
      var formParams = {
        'resourceType': resourceType,
        'groupLabel': opts['groupLabel'],
        'userPass': opts['userPass']
      };

      var authNames = ['basicAuth'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/admin/people/{path}', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Create a new user or a new group with this path. To create a user,  make sure to pass a userPass parameter. Otherwise it will create a  group. 
     * @param {String} path User or group identifier, including full group path
     * @param {module:model/String} resourceType Wether it&#39;s a user or a group
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @param {String} opts.groupLabel Label of the new group if we are creating a group
     * @param {String} opts.userPass Password of the new user if we are creating a user
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'createPeople',
    value: function createPeople(path, resourceType, opts) {
      return this.createPeopleWithHttpInfo(path, resourceType, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Create a new role with this ID 
     * @param {String} roleId Id of the role to load
     * @param {module:model/Role} role JSON description of the new role
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/Role} and HTTP response
     */
  }, {
    key: 'createRoleWithHttpInfo',
    value: function createRoleWithHttpInfo(roleId, role) {
      var postBody = role;

      // verify the required parameter 'roleId' is set
      if (roleId === undefined || roleId === null) {
        throw new Error("Missing the required parameter 'roleId' when calling createRole");
      }

      // verify the required parameter 'role' is set
      if (role === undefined || role === null) {
        throw new Error("Missing the required parameter 'role' when calling createRole");
      }

      var pathParams = {
        'roleId': roleId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = _modelRole2['default'];

      return this.apiClient.callApi('/admin/roles/{roleId}', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Create a new role with this ID 
     * @param {String} roleId Id of the role to load
     * @param {module:model/Role} role JSON description of the new role
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/Role}
     */
  }, {
    key: 'createRole',
    value: function createRole(roleId, role) {
      return this.createRoleWithHttpInfo(roleId, role).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Delete Role by Id 
     * @param {String} path User or group identifier, including full group path
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'deletePeopleWithHttpInfo',
    value: function deletePeopleWithHttpInfo(path, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling deletePeople");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {
        'format': opts['format']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/admin/people/{path}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Delete Role by Id 
     * @param {String} path User or group identifier, including full group path
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'deletePeople',
    value: function deletePeople(path, opts) {
      return this.deletePeopleWithHttpInfo(path, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Delete Role by Id 
     * @param {String} roleId Id of the role to delete
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'deleteRoleWithHttpInfo',
    value: function deleteRoleWithHttpInfo(roleId) {
      var postBody = null;

      // verify the required parameter 'roleId' is set
      if (roleId === undefined || roleId === null) {
        throw new Error("Missing the required parameter 'roleId' when calling deleteRole");
      }

      var pathParams = {
        'roleId': roleId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/admin/roles/{roleId}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Delete Role by Id 
     * @param {String} roleId Id of the role to delete
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'deleteRole',
    value: function deleteRole(roleId) {
      return this.deleteRoleWithHttpInfo(roleId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * List roles 
     * @param {String} path User or group identifier, including full group path (optional)
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @param {Boolean} opts.list list children of the current resource (default to true)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/NodeList} and HTTP response
     */
  }, {
    key: 'getPeopleWithHttpInfo',
    value: function getPeopleWithHttpInfo(path, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling getPeople");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {
        'format': opts['format'],
        'list': opts['list']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelNodeList2['default'];

      return this.apiClient.callApi('/admin/people/{path}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * List roles 
     * @param {String} path User or group identifier, including full group path (optional)
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @param {Boolean} opts.list list children of the current resource (default to true)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/NodeList}
     */
  }, {
    key: 'getPeople',
    value: function getPeople(path, opts) {
      return this.getPeopleWithHttpInfo(path, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Get Role by Id 
     * @param {String} roleId Id of the role to load
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @param {Boolean} opts.loadFillValues Load additional data to build a form for editing this role
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/Role} and HTTP response
     */
  }, {
    key: 'getRoleWithHttpInfo',
    value: function getRoleWithHttpInfo(roleId, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'roleId' is set
      if (roleId === undefined || roleId === null) {
        throw new Error("Missing the required parameter 'roleId' when calling getRole");
      }

      var pathParams = {
        'roleId': roleId
      };
      var queryParams = {
        'format': opts['format'],
        'load_fill_values': opts['loadFillValues']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = _modelRole2['default'];

      return this.apiClient.callApi('/admin/roles/{roleId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Get Role by Id 
     * @param {String} roleId Id of the role to load
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @param {Boolean} opts.loadFillValues Load additional data to build a form for editing this role
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/Role}
     */
  }, {
    key: 'getRole',
    value: function getRole(roleId, opts) {
      return this.getRoleWithHttpInfo(roleId, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * List roles 
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/NodeList} and HTTP response
     */
  }, {
    key: 'getRolesWithHttpInfo',
    value: function getRolesWithHttpInfo(opts) {
      opts = opts || {};
      var postBody = null;

      var pathParams = {};
      var queryParams = {
        'format': opts['format']
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json', 'application/xml'];
      var returnType = _modelNodeList2['default'];

      return this.apiClient.callApi('/admin/roles', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * List roles 
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/NodeList}
     */
  }, {
    key: 'getRoles',
    value: function getRoles(opts) {
      return this.getRolesWithHttpInfo(opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Update user or group specific data with this path. Use resourceType parameter to discriminate, and send a parameterName/parameterValue couple to be patched.  Authorized parameterName values are described below, along with the parameterValue corresponding specification:  - For groups   - groupLabel : relabel an existing group - For users   - userPass: change user password   - userProfile: update user profile   - userLock: set/remove a lock on a user. Value must be a lockname:lockvalue string where lockvalue is \&quot;true\&quot; or \&quot;fale\&quot;.   - userRoles: Bunch update roles, eventually reorder them, as a JSON encoded array.   - userAddRole: add a role to the user   - userRemoveRole: remove a role currently applied to the user.   - userPreferences: a JSON associative array of key/values to update.  To edit user/group permissions or parameters, use the role api instead,  using the object specific role_id (AJXP_GRP_/groupPath or AJXP_USR_/userId). 
     * @param {String} path User or group identifier, including full group path
     * @param {module:model/String} resourceType Wether it&#39;s a user or a group
     * @param {module:model/PeoplePatch} patchTuple parameterName / parameterValue association
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PydioResponse} and HTTP response
     */
  }, {
    key: 'patchPeopleWithHttpInfo',
    value: function patchPeopleWithHttpInfo(path, resourceType, patchTuple, opts) {
      opts = opts || {};
      var postBody = patchTuple;

      // verify the required parameter 'path' is set
      if (path === undefined || path === null) {
        throw new Error("Missing the required parameter 'path' when calling patchPeople");
      }

      // verify the required parameter 'resourceType' is set
      if (resourceType === undefined || resourceType === null) {
        throw new Error("Missing the required parameter 'resourceType' when calling patchPeople");
      }

      // verify the required parameter 'patchTuple' is set
      if (patchTuple === undefined || patchTuple === null) {
        throw new Error("Missing the required parameter 'patchTuple' when calling patchPeople");
      }

      var pathParams = {
        'path': path
      };
      var queryParams = {
        'format': opts['format'],
        'resourceType': resourceType
      };
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = _modelPydioResponse2['default'];

      return this.apiClient.callApi('/admin/people/{path}', 'PATCH', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Update user or group specific data with this path. Use resourceType parameter to discriminate, and send a parameterName/parameterValue couple to be patched.  Authorized parameterName values are described below, along with the parameterValue corresponding specification:  - For groups   - groupLabel : relabel an existing group - For users   - userPass: change user password   - userProfile: update user profile   - userLock: set/remove a lock on a user. Value must be a lockname:lockvalue string where lockvalue is \&quot;true\&quot; or \&quot;fale\&quot;.   - userRoles: Bunch update roles, eventually reorder them, as a JSON encoded array.   - userAddRole: add a role to the user   - userRemoveRole: remove a role currently applied to the user.   - userPreferences: a JSON associative array of key/values to update.  To edit user/group permissions or parameters, use the role api instead,  using the object specific role_id (AJXP_GRP_/groupPath or AJXP_USR_/userId). 
     * @param {String} path User or group identifier, including full group path
     * @param {module:model/String} resourceType Wether it&#39;s a user or a group
     * @param {module:model/PeoplePatch} patchTuple parameterName / parameterValue association
     * @param {Object} opts Optional parameters
     * @param {String} opts.format Format produced in output (defaults to xml)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PydioResponse}
     */
  }, {
    key: 'patchPeople',
    value: function patchPeople(path, resourceType, patchTuple, opts) {
      return this.patchPeopleWithHttpInfo(path, resourceType, patchTuple, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Update the role 
     * @param {String} roleId Id of the role to load
     * @param {module:model/Role} role JSON description of the new role
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/Role} and HTTP response
     */
  }, {
    key: 'updateRoleWithHttpInfo',
    value: function updateRoleWithHttpInfo(roleId, role) {
      var postBody = role;

      // verify the required parameter 'roleId' is set
      if (roleId === undefined || roleId === null) {
        throw new Error("Missing the required parameter 'roleId' when calling updateRole");
      }

      // verify the required parameter 'role' is set
      if (role === undefined || role === null) {
        throw new Error("Missing the required parameter 'role' when calling updateRole");
      }

      var pathParams = {
        'roleId': roleId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = _modelRole2['default'];

      return this.apiClient.callApi('/admin/roles/{roleId}', 'PATCH', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Update the role 
     * @param {String} roleId Id of the role to load
     * @param {module:model/Role} role JSON description of the new role
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/Role}
     */
  }, {
    key: 'updateRole',
    value: function updateRole(roleId, role) {
      return this.updateRoleWithHttpInfo(roleId, role).then(function (response_and_data) {
        return response_and_data.data;
      });
    }
  }]);

  return ProvisioningApi;
})();

exports['default'] = ProvisioningApi;
module.exports = exports['default'];

},{"../ApiClient":7,"../model/AdminWorkspace":14,"../model/MetaSourceParameters":22,"../model/NodeList":24,"../model/PeoplePatch":28,"../model/PydioResponse":29,"../model/Role":30}],10:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require("../ApiClient");

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _modelTask = require('../model/Task');

var _modelTask2 = _interopRequireDefault(_modelTask);

/**
* Task service.
* @module api/TaskApi
* @version 2.0.0
*/

var TaskApi = (function () {

  /**
  * Constructs a new TaskApi. 
  * @alias module:api/TaskApi
  * @class
  * @param {module:ApiClient} apiClient Optional API client implementation to use,
  * default to {@link module:ApiClient#instance} if unspecified.
  */

  function TaskApi(apiClient) {
    _classCallCheck(this, TaskApi);

    this.apiClient = apiClient || _ApiClient2['default'].instance;
  }

  /**
   * Create a task on the server. This will generally trigger a server-side background \&quot;Task\&quot;, which ID will be returned in the PydioResponse[&#39;tasks&#39;] array 
   * @param {String} taskId Task to launch on the server
   * @param {Object} opts Optional parameters
   * @param {module:model/Task} opts.requestBody JSON Task object
   * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/Task} and HTTP response
   */

  _createClass(TaskApi, [{
    key: 'createTaskWithHttpInfo',
    value: function createTaskWithHttpInfo(taskId, opts) {
      opts = opts || {};
      var postBody = opts['requestBody'];

      // verify the required parameter 'taskId' is set
      if (taskId === undefined || taskId === null) {
        throw new Error("Missing the required parameter 'taskId' when calling createTask");
      }

      var pathParams = {
        'taskId': taskId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = ['application/json'];
      var accepts = [];
      var returnType = _modelTask2['default'];

      return this.apiClient.callApi('/tasks/{taskId}', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Create a task on the server. This will generally trigger a server-side background \&quot;Task\&quot;, which ID will be returned in the PydioResponse[&#39;tasks&#39;] array 
     * @param {String} taskId Task to launch on the server
     * @param {Object} opts Optional parameters
     * @param {module:model/Task} opts.requestBody JSON Task object
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/Task}
     */
  }, {
    key: 'createTask',
    value: function createTask(taskId, opts) {
      return this.createTaskWithHttpInfo(taskId, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Update a task on the server. 
     * @param {String} taskId Task to delete on the server
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/Task} and HTTP response
     */
  }, {
    key: 'deleteTaskWithHttpInfo',
    value: function deleteTaskWithHttpInfo(taskId) {
      var postBody = null;

      // verify the required parameter 'taskId' is set
      if (taskId === undefined || taskId === null) {
        throw new Error("Missing the required parameter 'taskId' when calling deleteTask");
      }

      var pathParams = {
        'taskId': taskId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = [];
      var returnType = _modelTask2['default'];

      return this.apiClient.callApi('/tasks/{taskId}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Update a task on the server. 
     * @param {String} taskId Task to delete on the server
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/Task}
     */
  }, {
    key: 'deleteTask',
    value: function deleteTask(taskId) {
      return this.deleteTaskWithHttpInfo(taskId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Get information about a currently running task Id 
     * @param {String} taskId Task to monitor on the server
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/Task} and HTTP response
     */
  }, {
    key: 'getTaskInfoWithHttpInfo',
    value: function getTaskInfoWithHttpInfo(taskId) {
      var postBody = null;

      // verify the required parameter 'taskId' is set
      if (taskId === undefined || taskId === null) {
        throw new Error("Missing the required parameter 'taskId' when calling getTaskInfo");
      }

      var pathParams = {
        'taskId': taskId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = [];
      var returnType = _modelTask2['default'];

      return this.apiClient.callApi('/tasks/{taskId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Get information about a currently running task Id 
     * @param {String} taskId Task to monitor on the server
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/Task}
     */
  }, {
    key: 'getTaskInfo',
    value: function getTaskInfo(taskId) {
      return this.getTaskInfoWithHttpInfo(taskId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * List tasks currently running on the server (and visible to the current user). 
     * @param {String} workspaceId Id or Alias of the workspace
     * @param {Object} opts Optional parameters
     * @param {String} opts.filter additional filters for task listing (JSON serialized)
     * @param {Array.<String>} opts.path One or more node pathes
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link Array.<module:model/Task>} and HTTP response
     */
  }, {
    key: 'listTasksWithHttpInfo',
    value: function listTasksWithHttpInfo(workspaceId, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling listTasks");
      }

      var pathParams = {};
      var queryParams = {};
      var headerParams = {};
      var formParams = {
        'filter': opts['filter'],
        'workspaceId': workspaceId,
        'path': this.apiClient.buildCollectionParam(opts['path'], 'multi')
      };

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = [];
      var returnType = [_modelTask2['default']];

      return this.apiClient.callApi('/tasks', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * List tasks currently running on the server (and visible to the current user). 
     * @param {String} workspaceId Id or Alias of the workspace
     * @param {Object} opts Optional parameters
     * @param {String} opts.filter additional filters for task listing (JSON serialized)
     * @param {Array.<String>} opts.path One or more node pathes
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link Array.<module:model/Task>}
     */
  }, {
    key: 'listTasks',
    value: function listTasks(workspaceId, opts) {
      return this.listTasksWithHttpInfo(workspaceId, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Update a task on the server. 
     * @param {String} taskId Task to update on the server
     * @param {Object} opts Optional parameters
     * @param {module:model/Task} opts.requestBody JSON Diff describing the patches to apply on the task object
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/Task} and HTTP response
     */
  }, {
    key: 'updateTaskWithHttpInfo',
    value: function updateTaskWithHttpInfo(taskId, opts) {
      opts = opts || {};
      var postBody = opts['requestBody'];

      // verify the required parameter 'taskId' is set
      if (taskId === undefined || taskId === null) {
        throw new Error("Missing the required parameter 'taskId' when calling updateTask");
      }

      var pathParams = {
        'taskId': taskId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = ['application/json'];
      var accepts = [];
      var returnType = _modelTask2['default'];

      return this.apiClient.callApi('/tasks/{taskId}', 'PATCH', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Update a task on the server. 
     * @param {String} taskId Task to update on the server
     * @param {Object} opts Optional parameters
     * @param {module:model/Task} opts.requestBody JSON Diff describing the patches to apply on the task object
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/Task}
     */
  }, {
    key: 'updateTask',
    value: function updateTask(taskId, opts) {
      return this.updateTaskWithHttpInfo(taskId, opts).then(function (response_and_data) {
        return response_and_data.data;
      });
    }
  }]);

  return TaskApi;
})();

exports['default'] = TaskApi;
module.exports = exports['default'];

},{"../ApiClient":7,"../model/Task":31}],11:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require("../ApiClient");

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* UserAccount service.
* @module api/UserAccountApi
* @version 2.0.0
*/

var UserAccountApi = (function () {

  /**
  * Constructs a new UserAccountApi. 
  * @alias module:api/UserAccountApi
  * @class
  * @param {module:ApiClient} apiClient Optional API client implementation to use,
  * default to {@link module:ApiClient#instance} if unspecified.
  */

  function UserAccountApi(apiClient) {
    _classCallCheck(this, UserAccountApi);

    this.apiClient = apiClient || _ApiClient2['default'].instance;
  }

  /**
   * List accessible workspace for currently logged user. Alias for /state/?xPath&#x3D;user/repositories 
   * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link Object} and HTTP response
   */

  _createClass(UserAccountApi, [{
    key: 'userInfoWithHttpInfo',
    value: function userInfoWithHttpInfo() {
      var postBody = null;

      var pathParams = {};
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Object;

      return this.apiClient.callApi('/user', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * List accessible workspace for currently logged user. Alias for /state/?xPath&#x3D;user/repositories 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link Object}
     */
  }, {
    key: 'userInfo',
    value: function userInfo() {
      return this.userInfoWithHttpInfo().then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * List accessible workspace for currently logged user. Alias for /state/?xPath&#x3D;user/preferences 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link Object} and HTTP response
     */
  }, {
    key: 'userPreferencesWithHttpInfo',
    value: function userPreferencesWithHttpInfo() {
      var postBody = null;

      var pathParams = {};
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Object;

      return this.apiClient.callApi('/user/preferences', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * List accessible workspace for currently logged user. Alias for /state/?xPath&#x3D;user/preferences 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link Object}
     */
  }, {
    key: 'userPreferences',
    value: function userPreferences() {
      return this.userPreferencesWithHttpInfo().then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * List accessible workspace for currently logged user. Alias for /state/?xPath&#x3D;user/repositories 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link Object} and HTTP response
     */
  }, {
    key: 'userWorkspacesWithHttpInfo',
    value: function userWorkspacesWithHttpInfo() {
      var postBody = null;

      var pathParams = {};
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Object;

      return this.apiClient.callApi('/user/workspaces', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * List accessible workspace for currently logged user. Alias for /state/?xPath&#x3D;user/repositories 
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link Object}
     */
  }, {
    key: 'userWorkspaces',
    value: function userWorkspaces() {
      return this.userWorkspacesWithHttpInfo().then(function (response_and_data) {
        return response_and_data.data;
      });
    }
  }]);

  return UserAccountApi;
})();

exports['default'] = UserAccountApi;
module.exports = exports['default'];

},{"../ApiClient":7}],12:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require("../ApiClient");

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _modelInlineResponse2002 = require('../model/InlineResponse2002');

var _modelInlineResponse20022 = _interopRequireDefault(_modelInlineResponse2002);

var _modelInlineResponse2003 = require('../model/InlineResponse2003');

var _modelInlineResponse20032 = _interopRequireDefault(_modelInlineResponse2003);

/**
* Workspace service.
* @module api/WorkspaceApi
* @version 2.0.0
*/

var WorkspaceApi = (function () {

  /**
  * Constructs a new WorkspaceApi. 
  * @alias module:api/WorkspaceApi
  * @class
  * @param {module:ApiClient} apiClient Optional API client implementation to use,
  * default to {@link module:ApiClient#instance} if unspecified.
  */

  function WorkspaceApi(apiClient) {
    _classCallCheck(this, WorkspaceApi);

    this.apiClient = apiClient || _ApiClient2['default'].instance;
  }

  /**
   * Sends back all changes since a given sequence ID.    This plugin requires **meta.syncable** active on the workspace. 
   * @param {Number} sequenceId File to upload
   * @param {String} workspaceId Id or Alias of the workspace
   * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link Array.<module:model/InlineResponse2003>} and HTTP response
   */

  _createClass(WorkspaceApi, [{
    key: 'changesWithHttpInfo',
    value: function changesWithHttpInfo(sequenceId, workspaceId) {
      var postBody = null;

      // verify the required parameter 'sequenceId' is set
      if (sequenceId === undefined || sequenceId === null) {
        throw new Error("Missing the required parameter 'sequenceId' when calling changes");
      }

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling changes");
      }

      var pathParams = {
        'sequenceId': sequenceId,
        'workspaceId': workspaceId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = [_modelInlineResponse20032['default']];

      return this.apiClient.callApi('/workspaces/{workspaceId}/changes/{sequenceId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Sends back all changes since a given sequence ID.    This plugin requires **meta.syncable** active on the workspace. 
     * @param {Number} sequenceId File to upload
     * @param {String} workspaceId Id or Alias of the workspace
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link Array.<module:model/InlineResponse2003>}
     */
  }, {
    key: 'changes',
    value: function changes(sequenceId, workspaceId) {
      return this.changesWithHttpInfo(sequenceId, workspaceId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }

    /**
     * Get information about the given workspace. Info can be gathered via various plugins. Pass the expected metadata type via the X-Pydio-Ws-Info header. Currently supported values are quota|info|changes 
     * @param {module:model/String} xPydioWSInfo 
     * @param {String} workspaceId Id or Alias of the workspace
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/InlineResponse2002} and HTTP response
     */
  }, {
    key: 'getWorkspaceInfoWithHttpInfo',
    value: function getWorkspaceInfoWithHttpInfo(xPydioWSInfo, workspaceId) {
      var postBody = null;

      // verify the required parameter 'xPydioWSInfo' is set
      if (xPydioWSInfo === undefined || xPydioWSInfo === null) {
        throw new Error("Missing the required parameter 'xPydioWSInfo' when calling getWorkspaceInfo");
      }

      // verify the required parameter 'workspaceId' is set
      if (workspaceId === undefined || workspaceId === null) {
        throw new Error("Missing the required parameter 'workspaceId' when calling getWorkspaceInfo");
      }

      var pathParams = {
        'workspaceId': workspaceId
      };
      var queryParams = {};
      var headerParams = {
        'X-Pydio-WS-Info': xPydioWSInfo
      };
      var formParams = {};

      var authNames = ['basicAuth'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = _modelInlineResponse20022['default'];

      return this.apiClient.callApi('/workspaces/{workspaceId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }

    /**
     * Get information about the given workspace. Info can be gathered via various plugins. Pass the expected metadata type via the X-Pydio-Ws-Info header. Currently supported values are quota|info|changes 
     * @param {module:model/String} xPydioWSInfo 
     * @param {String} workspaceId Id or Alias of the workspace
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/InlineResponse2002}
     */
  }, {
    key: 'getWorkspaceInfo',
    value: function getWorkspaceInfo(xPydioWSInfo, workspaceId) {
      return this.getWorkspaceInfoWithHttpInfo(xPydioWSInfo, workspaceId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }
  }]);

  return WorkspaceApi;
})();

exports['default'] = WorkspaceApi;
module.exports = exports['default'];

},{"../ApiClient":7,"../model/InlineResponse2002":19,"../model/InlineResponse2003":20}],13:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ApiClient = require('./ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _modelAdminWorkspace = require('./model/AdminWorkspace');

var _modelAdminWorkspace2 = _interopRequireDefault(_modelAdminWorkspace);

var _modelAdminWorkspaceInfo = require('./model/AdminWorkspaceInfo');

var _modelAdminWorkspaceInfo2 = _interopRequireDefault(_modelAdminWorkspaceInfo);

var _modelBgAction = require('./model/BgAction');

var _modelBgAction2 = _interopRequireDefault(_modelBgAction);

var _modelInlineResponse200 = require('./model/InlineResponse200');

var _modelInlineResponse2002 = _interopRequireDefault(_modelInlineResponse200);

var _modelInlineResponse2001 = require('./model/InlineResponse2001');

var _modelInlineResponse20012 = _interopRequireDefault(_modelInlineResponse2001);

var _modelInlineResponse20022 = require('./model/InlineResponse2002');

var _modelInlineResponse20023 = _interopRequireDefault(_modelInlineResponse20022);

var _modelInlineResponse2003 = require('./model/InlineResponse2003');

var _modelInlineResponse20032 = _interopRequireDefault(_modelInlineResponse2003);

var _modelInputStream = require('./model/InputStream');

var _modelInputStream2 = _interopRequireDefault(_modelInputStream);

var _modelMetaSourceParameters = require('./model/MetaSourceParameters');

var _modelMetaSourceParameters2 = _interopRequireDefault(_modelMetaSourceParameters);

var _modelNode = require('./model/Node');

var _modelNode2 = _interopRequireDefault(_modelNode);

var _modelNodeList = require('./model/NodeList');

var _modelNodeList2 = _interopRequireDefault(_modelNodeList);

var _modelNodeListData = require('./model/NodeListData');

var _modelNodeListData2 = _interopRequireDefault(_modelNodeListData);

var _modelNodesDiff = require('./model/NodesDiff');

var _modelNodesDiff2 = _interopRequireDefault(_modelNodesDiff);

var _modelPaginationData = require('./model/PaginationData');

var _modelPaginationData2 = _interopRequireDefault(_modelPaginationData);

var _modelPeoplePatch = require('./model/PeoplePatch');

var _modelPeoplePatch2 = _interopRequireDefault(_modelPeoplePatch);

var _modelPydioResponse = require('./model/PydioResponse');

var _modelPydioResponse2 = _interopRequireDefault(_modelPydioResponse);

var _modelRole = require('./model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _modelTask = require('./model/Task');

var _modelTask2 = _interopRequireDefault(_modelTask);

var _modelTaskSchedule = require('./model/TaskSchedule');

var _modelTaskSchedule2 = _interopRequireDefault(_modelTaskSchedule);

var _apiFileApi = require('./api/FileApi');

var _apiFileApi2 = _interopRequireDefault(_apiFileApi);

var _apiProvisioningApi = require('./api/ProvisioningApi');

var _apiProvisioningApi2 = _interopRequireDefault(_apiProvisioningApi);

var _apiTaskApi = require('./api/TaskApi');

var _apiTaskApi2 = _interopRequireDefault(_apiTaskApi);

var _apiUserAccountApi = require('./api/UserAccountApi');

var _apiUserAccountApi2 = _interopRequireDefault(_apiUserAccountApi);

var _apiWorkspaceApi = require('./api/WorkspaceApi');

var _apiWorkspaceApi2 = _interopRequireDefault(_apiWorkspaceApi);

/**
* Access_to_a_Pydio_Server__Second_version_of_the_API_.<br>
* The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
* <p>
* An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
* <pre>
* var PydioApiV2 = require('index'); // See note below*.
* var xxxSvc = new PydioApiV2.XxxApi(); // Allocate the API class we're going to use.
* var yyyModel = new PydioApiV2.Yyy(); // Construct a model instance.
* yyyModel.someProperty = 'someValue';
* ...
* var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
* ...
* </pre>
* <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
* and put the application logic within the callback function.</em>
* </p>
* <p>
* A non-AMD browser application (discouraged) might do something like this:
* <pre>
* var xxxSvc = new PydioApiV2.XxxApi(); // Allocate the API class we're going to use.
* var yyy = new PydioApiV2.Yyy(); // Construct a model instance.
* yyyModel.someProperty = 'someValue';
* ...
* var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
* ...
* </pre>
* </p>
* @module index
* @version 2.0.0
*/
exports.
/**
 * The ApiClient constructor.
 * @property {module:ApiClient}
 */
ApiClient = _ApiClient2['default'];
exports.

/**
 * The AdminWorkspace model constructor.
 * @property {module:model/AdminWorkspace}
 */
AdminWorkspace = _modelAdminWorkspace2['default'];
exports.

/**
 * The AdminWorkspaceInfo model constructor.
 * @property {module:model/AdminWorkspaceInfo}
 */
AdminWorkspaceInfo = _modelAdminWorkspaceInfo2['default'];
exports.

/**
 * The BgAction model constructor.
 * @property {module:model/BgAction}
 */
BgAction = _modelBgAction2['default'];
exports.

/**
 * The InlineResponse200 model constructor.
 * @property {module:model/InlineResponse200}
 */
InlineResponse200 = _modelInlineResponse2002['default'];
exports.

/**
 * The InlineResponse2001 model constructor.
 * @property {module:model/InlineResponse2001}
 */
InlineResponse2001 = _modelInlineResponse20012['default'];
exports.

/**
 * The InlineResponse2002 model constructor.
 * @property {module:model/InlineResponse2002}
 */
InlineResponse2002 = _modelInlineResponse20023['default'];
exports.

/**
 * The InlineResponse2003 model constructor.
 * @property {module:model/InlineResponse2003}
 */
InlineResponse2003 = _modelInlineResponse20032['default'];
exports.

/**
 * The InputStream model constructor.
 * @property {module:model/InputStream}
 */
InputStream = _modelInputStream2['default'];
exports.

/**
 * The MetaSourceParameters model constructor.
 * @property {module:model/MetaSourceParameters}
 */
MetaSourceParameters = _modelMetaSourceParameters2['default'];
exports.

/**
 * The Node model constructor.
 * @property {module:model/Node}
 */
Node = _modelNode2['default'];
exports.

/**
 * The NodeList model constructor.
 * @property {module:model/NodeList}
 */
NodeList = _modelNodeList2['default'];
exports.

/**
 * The NodeListData model constructor.
 * @property {module:model/NodeListData}
 */
NodeListData = _modelNodeListData2['default'];
exports.

/**
 * The NodesDiff model constructor.
 * @property {module:model/NodesDiff}
 */
NodesDiff = _modelNodesDiff2['default'];
exports.

/**
 * The PaginationData model constructor.
 * @property {module:model/PaginationData}
 */
PaginationData = _modelPaginationData2['default'];
exports.

/**
 * The PeoplePatch model constructor.
 * @property {module:model/PeoplePatch}
 */
PeoplePatch = _modelPeoplePatch2['default'];
exports.

/**
 * The PydioResponse model constructor.
 * @property {module:model/PydioResponse}
 */
PydioResponse = _modelPydioResponse2['default'];
exports.

/**
 * The Role model constructor.
 * @property {module:model/Role}
 */
Role = _modelRole2['default'];
exports.

/**
 * The Task model constructor.
 * @property {module:model/Task}
 */
Task = _modelTask2['default'];
exports.

/**
 * The TaskSchedule model constructor.
 * @property {module:model/TaskSchedule}
 */
TaskSchedule = _modelTaskSchedule2['default'];
exports.

/**
* The FileApi service constructor.
* @property {module:api/FileApi}
*/
FileApi = _apiFileApi2['default'];
exports.

/**
* The ProvisioningApi service constructor.
* @property {module:api/ProvisioningApi}
*/
ProvisioningApi = _apiProvisioningApi2['default'];
exports.

/**
* The TaskApi service constructor.
* @property {module:api/TaskApi}
*/
TaskApi = _apiTaskApi2['default'];
exports.

/**
* The UserAccountApi service constructor.
* @property {module:api/UserAccountApi}
*/
UserAccountApi = _apiUserAccountApi2['default'];
exports.

/**
* The WorkspaceApi service constructor.
* @property {module:api/WorkspaceApi}
*/
WorkspaceApi = _apiWorkspaceApi2['default'];

},{"./ApiClient":7,"./api/FileApi":8,"./api/ProvisioningApi":9,"./api/TaskApi":10,"./api/UserAccountApi":11,"./api/WorkspaceApi":12,"./model/AdminWorkspace":14,"./model/AdminWorkspaceInfo":15,"./model/BgAction":16,"./model/InlineResponse200":17,"./model/InlineResponse2001":18,"./model/InlineResponse2002":19,"./model/InlineResponse2003":20,"./model/InputStream":21,"./model/MetaSourceParameters":22,"./model/Node":23,"./model/NodeList":24,"./model/NodeListData":25,"./model/NodesDiff":26,"./model/PaginationData":27,"./model/PeoplePatch":28,"./model/PydioResponse":29,"./model/Role":30,"./model/Task":31,"./model/TaskSchedule":32}],14:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _AdminWorkspaceInfo = require('./AdminWorkspaceInfo');

var _AdminWorkspaceInfo2 = _interopRequireDefault(_AdminWorkspaceInfo);

/**
* The AdminWorkspace model module.
* @module model/AdminWorkspace
* @version 2.0.0
*/

var AdminWorkspace = (function () {
    /**
    * Constructs a new <code>AdminWorkspace</code>.
    * Parameters of a workspace, as seen by administrator
    * @alias module:model/AdminWorkspace
    * @class
    * @param display {String} Label for this workspace
    * @param accessType {String} plugin name to be used as driver to access the storage. Resulting plugin id is \"access.accessType\".
    */

    function AdminWorkspace(display, accessType) {
        _classCallCheck(this, AdminWorkspace);

        this.id = undefined;
        this.slug = undefined;
        this.display = undefined;
        this.displayStringId = undefined;
        this.accessType = undefined;
        this.writeable = undefined;
        this.isTemplate = undefined;
        this.groupPath = undefined;
        this.parameters = undefined;
        this.features = undefined;
        this.mask = undefined;
        this.info = undefined;

        this['display'] = display;this['accessType'] = accessType;
    }

    /**
    * Constructs a <code>AdminWorkspace</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/AdminWorkspace} obj Optional instance to populate.
    * @return {module:model/AdminWorkspace} The populated <code>AdminWorkspace</code> instance.
    */

    _createClass(AdminWorkspace, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new AdminWorkspace();

                if (data.hasOwnProperty('id')) {
                    obj['id'] = _ApiClient2['default'].convertToType(data['id'], 'String');
                }
                if (data.hasOwnProperty('slug')) {
                    obj['slug'] = _ApiClient2['default'].convertToType(data['slug'], 'String');
                }
                if (data.hasOwnProperty('display')) {
                    obj['display'] = _ApiClient2['default'].convertToType(data['display'], 'String');
                }
                if (data.hasOwnProperty('displayStringId')) {
                    obj['displayStringId'] = _ApiClient2['default'].convertToType(data['displayStringId'], 'String');
                }
                if (data.hasOwnProperty('accessType')) {
                    obj['accessType'] = _ApiClient2['default'].convertToType(data['accessType'], 'String');
                }
                if (data.hasOwnProperty('writeable')) {
                    obj['writeable'] = _ApiClient2['default'].convertToType(data['writeable'], 'Boolean');
                }
                if (data.hasOwnProperty('isTemplate')) {
                    obj['isTemplate'] = _ApiClient2['default'].convertToType(data['isTemplate'], 'Boolean');
                }
                if (data.hasOwnProperty('groupPath')) {
                    obj['groupPath'] = _ApiClient2['default'].convertToType(data['groupPath'], 'String');
                }
                if (data.hasOwnProperty('parameters')) {
                    obj['parameters'] = _ApiClient2['default'].convertToType(data['parameters'], Object);
                }
                if (data.hasOwnProperty('features')) {
                    obj['features'] = _ApiClient2['default'].convertToType(data['features'], Object);
                }
                if (data.hasOwnProperty('mask')) {
                    obj['mask'] = _ApiClient2['default'].convertToType(data['mask'], Object);
                }
                if (data.hasOwnProperty('info')) {
                    obj['info'] = _AdminWorkspaceInfo2['default'].constructFromObject(data['info']);
                }
            }
            return obj;
        }

        /**
        * Id of this workspace
        * @member {String} id
        */
    }]);

    return AdminWorkspace;
})();

exports['default'] = AdminWorkspace;
module.exports = exports['default'];

/**
* human readable identifier, computed from display
* @member {String} slug
*/

/**
* Label for this workspace
* @member {String} display
*/

/**
* an i18n identifier to adapt the label to the user language
* @member {String} displayStringId
*/

/**
* plugin name to be used as driver to access the storage. Resulting plugin id is \"access.accessType\".
* @member {String} accessType
*/

/**
* wether this workspace/template is writeable or not (not writeable if defined in bootstrap php configs).
* @member {Boolean} writeable
*/

/**
* wether this is a template or a concrete workspace.
* @member {Boolean} isTemplate
*/

/**
* If this repository has a groupPath
* @member {String} groupPath
*/

/**
* a key/value object containing all driver parameters.
* @member {Object} parameters
*/

/**
* The additional features parameters.
* @member {Object} features
*/

/**
* permission mask applied on workspace files and folders
* @member {Object} mask
*/

/**
* @member {module:model/AdminWorkspaceInfo} info
*/

},{"../ApiClient":7,"./AdminWorkspaceInfo":15}],15:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The AdminWorkspaceInfo model module.
* @module model/AdminWorkspaceInfo
* @version 2.0.0
*/

var AdminWorkspaceInfo = (function () {
    /**
    * Constructs a new <code>AdminWorkspaceInfo</code>.
    * additional informations provided by the server
    * @alias module:model/AdminWorkspaceInfo
    * @class
    */

    function AdminWorkspaceInfo() {
        _classCallCheck(this, AdminWorkspaceInfo);

        this.user = undefined;
        this.shares = undefined;
    }

    /**
    * Constructs a <code>AdminWorkspaceInfo</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/AdminWorkspaceInfo} obj Optional instance to populate.
    * @return {module:model/AdminWorkspaceInfo} The populated <code>AdminWorkspaceInfo</code> instance.
    */

    _createClass(AdminWorkspaceInfo, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new AdminWorkspaceInfo();

                if (data.hasOwnProperty('user')) {
                    obj['user'] = _ApiClient2['default'].convertToType(data['user'], 'Number');
                }
                if (data.hasOwnProperty('shares')) {
                    obj['shares'] = _ApiClient2['default'].convertToType(data['shares'], 'Number');
                }
            }
            return obj;
        }

        /**
        * computed number of users accessing this workspace
        * @member {Number} user
        */
    }]);

    return AdminWorkspaceInfo;
})();

exports['default'] = AdminWorkspaceInfo;
module.exports = exports['default'];

/**
* number of children shared from this workspace
* @member {Number} shares
*/

},{"../ApiClient":7}],16:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The BgAction model module.
* @module model/BgAction
* @version 2.0.0
*/

var BgAction = (function () {
    /**
    * Constructs a new <code>BgAction</code>.
    * triggers a background action on the client side
    * @alias module:model/BgAction
    * @class
    */

    function BgAction() {
        _classCallCheck(this, BgAction);

        this.actionName = undefined;
        this.delay = undefined;
    }

    /**
    * Constructs a <code>BgAction</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/BgAction} obj Optional instance to populate.
    * @return {module:model/BgAction} The populated <code>BgAction</code> instance.
    */

    _createClass(BgAction, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new BgAction();

                if (data.hasOwnProperty('actionName')) {
                    obj['actionName'] = _ApiClient2['default'].convertToType(data['actionName'], 'String');
                }
                if (data.hasOwnProperty('delay')) {
                    obj['delay'] = _ApiClient2['default'].convertToType(data['delay'], 'Number');
                }
            }
            return obj;
        }

        /**
        * @member {String} actionName
        */
    }]);

    return BgAction;
})();

exports['default'] = BgAction;
module.exports = exports['default'];

/**
* @member {Number} delay
*/

},{"../ApiClient":7}],17:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The InlineResponse200 model module.
* @module model/InlineResponse200
* @version 2.0.0
*/

var InlineResponse200 = (function () {
    /**
    * Constructs a new <code>InlineResponse200</code>.
    * @alias module:model/InlineResponse200
    * @class
    */

    function InlineResponse200() {
        _classCallCheck(this, InlineResponse200);

        this.USAGE = undefined;
        this.TOTAL = undefined;
    }

    /**
    * Constructs a <code>InlineResponse200</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/InlineResponse200} obj Optional instance to populate.
    * @return {module:model/InlineResponse200} The populated <code>InlineResponse200</code> instance.
    */

    _createClass(InlineResponse200, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new InlineResponse200();

                if (data.hasOwnProperty('USAGE')) {
                    obj['USAGE'] = _ApiClient2['default'].convertToType(data['USAGE'], 'Number');
                }
                if (data.hasOwnProperty('TOTAL')) {
                    obj['TOTAL'] = _ApiClient2['default'].convertToType(data['TOTAL'], 'Number');
                }
            }
            return obj;
        }

        /**
        * @member {Number} USAGE
        */
    }]);

    return InlineResponse200;
})();

exports['default'] = InlineResponse200;
module.exports = exports['default'];

/**
* @member {Number} TOTAL
*/

},{"../ApiClient":7}],18:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _Node = require('./Node');

var _Node2 = _interopRequireDefault(_Node);

/**
* The InlineResponse2001 model module.
* @module model/InlineResponse2001
* @version 2.0.0
*/

var InlineResponse2001 = (function () {
    /**
    * Constructs a new <code>InlineResponse2001</code>.
    * @alias module:model/InlineResponse2001
    * @class
    */

    function InlineResponse2001() {
        _classCallCheck(this, InlineResponse2001);

        this.seq_id = undefined;
        this.node = undefined;
    }

    /**
    * Constructs a <code>InlineResponse2001</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/InlineResponse2001} obj Optional instance to populate.
    * @return {module:model/InlineResponse2001} The populated <code>InlineResponse2001</code> instance.
    */

    _createClass(InlineResponse2001, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new InlineResponse2001();

                if (data.hasOwnProperty('seq_id')) {
                    obj['seq_id'] = _ApiClient2['default'].convertToType(data['seq_id'], 'Number');
                }
                if (data.hasOwnProperty('node')) {
                    obj['node'] = _Node2['default'].constructFromObject(data['node']);
                }
            }
            return obj;
        }

        /**
        * @member {Number} seq_id
        */
    }]);

    return InlineResponse2001;
})();

exports['default'] = InlineResponse2001;
module.exports = exports['default'];

/**
* @member {module:model/Node} node
*/

},{"../ApiClient":7,"./Node":23}],19:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The InlineResponse2002 model module.
* @module model/InlineResponse2002
* @version 2.0.0
*/

var InlineResponse2002 = (function () {
    /**
    * Constructs a new <code>InlineResponse2002</code>.
    * @alias module:model/InlineResponse2002
    * @class
    */

    function InlineResponse2002() {
        _classCallCheck(this, InlineResponse2002);

        this.USAGE = undefined;
        this.TOTAL = undefined;
    }

    /**
    * Constructs a <code>InlineResponse2002</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/InlineResponse2002} obj Optional instance to populate.
    * @return {module:model/InlineResponse2002} The populated <code>InlineResponse2002</code> instance.
    */

    _createClass(InlineResponse2002, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new InlineResponse2002();

                if (data.hasOwnProperty('USAGE')) {
                    obj['USAGE'] = _ApiClient2['default'].convertToType(data['USAGE'], 'Number');
                }
                if (data.hasOwnProperty('TOTAL')) {
                    obj['TOTAL'] = _ApiClient2['default'].convertToType(data['TOTAL'], 'Number');
                }
            }
            return obj;
        }

        /**
        * @member {Number} USAGE
        */
    }]);

    return InlineResponse2002;
})();

exports['default'] = InlineResponse2002;
module.exports = exports['default'];

/**
* @member {Number} TOTAL
*/

},{"../ApiClient":7}],20:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _Node = require('./Node');

var _Node2 = _interopRequireDefault(_Node);

/**
* The InlineResponse2003 model module.
* @module model/InlineResponse2003
* @version 2.0.0
*/

var InlineResponse2003 = (function () {
    /**
    * Constructs a new <code>InlineResponse2003</code>.
    * @alias module:model/InlineResponse2003
    * @class
    */

    function InlineResponse2003() {
        _classCallCheck(this, InlineResponse2003);

        this.seq_id = undefined;
        this.node = undefined;
    }

    /**
    * Constructs a <code>InlineResponse2003</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/InlineResponse2003} obj Optional instance to populate.
    * @return {module:model/InlineResponse2003} The populated <code>InlineResponse2003</code> instance.
    */

    _createClass(InlineResponse2003, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new InlineResponse2003();

                if (data.hasOwnProperty('seq_id')) {
                    obj['seq_id'] = _ApiClient2['default'].convertToType(data['seq_id'], 'Number');
                }
                if (data.hasOwnProperty('node')) {
                    obj['node'] = _Node2['default'].constructFromObject(data['node']);
                }
            }
            return obj;
        }

        /**
        * @member {Number} seq_id
        */
    }]);

    return InlineResponse2003;
})();

exports['default'] = InlineResponse2003;
module.exports = exports['default'];

/**
* @member {module:model/Node} node
*/

},{"../ApiClient":7,"./Node":23}],21:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The InputStream model module.
* @module model/InputStream
* @version 2.0.0
*/

var InputStream = (function () {
    /**
    * Constructs a new <code>InputStream</code>.
    * Simple binary stream
    * @alias module:model/InputStream
    * @class
    */

    function InputStream() {
        _classCallCheck(this, InputStream);
    }

    /**
    * Constructs a <code>InputStream</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/InputStream} obj Optional instance to populate.
    * @return {module:model/InputStream} The populated <code>InputStream</code> instance.
    */

    _createClass(InputStream, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new InputStream();
            }
            return obj;
        }
    }]);

    return InputStream;
})();

exports['default'] = InputStream;
module.exports = exports['default'];

},{"../ApiClient":7}],22:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The MetaSourceParameters model module.
* @module model/MetaSourceParameters
* @version 2.0.0
*/

var MetaSourceParameters = (function () {
    /**
    * Constructs a new <code>MetaSourceParameters</code>.
    * A set of parameters for meta sources
    * @alias module:model/MetaSourceParameters
    * @class
    */

    function MetaSourceParameters() {
        _classCallCheck(this, MetaSourceParameters);
    }

    /**
    * Constructs a <code>MetaSourceParameters</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/MetaSourceParameters} obj Optional instance to populate.
    * @return {module:model/MetaSourceParameters} The populated <code>MetaSourceParameters</code> instance.
    */

    _createClass(MetaSourceParameters, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new MetaSourceParameters();
            }
            return obj;
        }
    }]);

    return MetaSourceParameters;
})();

exports['default'] = MetaSourceParameters;
module.exports = exports['default'];

},{"../ApiClient":7}],23:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _NodeList = require('./NodeList');

var _NodeList2 = _interopRequireDefault(_NodeList);

/**
* The Node model module.
* @module model/Node
* @version 2.0.0
*/

var Node = (function () {
    /**
    * Constructs a new <code>Node</code>.
    * A file or folder represented as a generic resource, including metadata and children. Properties before children are part of the \&quot;standard\&quot; metadat set, properties after are returned by the \&quot;extended\&quot; metadata set.
    * @alias module:model/Node
    * @class
    */

    function Node() {
        _classCallCheck(this, Node);

        this.path = undefined;
        this.type = undefined;
        this.is_leaf = undefined;
        this.label = undefined;
        this.ajxp_modiftime = undefined;
        this.bytesize = undefined;
        this.stat = undefined;
        this.ajxp_relativetime = undefined;
        this.ajxp_description = undefined;
        this.icon = undefined;
        this.filesize = undefined;
        this.mimestring_id = undefined;
        this.ajxp_readonly = undefined;
        this.file_perms = undefined;
        this.repo_has_recycle = undefined;
        this.children = undefined;
    }

    /**
    * Constructs a <code>Node</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/Node} obj Optional instance to populate.
    * @return {module:model/Node} The populated <code>Node</code> instance.
    */

    _createClass(Node, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new Node();

                if (data.hasOwnProperty('path')) {
                    obj['path'] = _ApiClient2['default'].convertToType(data['path'], 'String');
                }
                if (data.hasOwnProperty('type')) {
                    obj['type'] = _ApiClient2['default'].convertToType(data['type'], 'String');
                }
                if (data.hasOwnProperty('is_leaf')) {
                    obj['is_leaf'] = _ApiClient2['default'].convertToType(data['is_leaf'], 'Boolean');
                }
                if (data.hasOwnProperty('label')) {
                    obj['label'] = _ApiClient2['default'].convertToType(data['label'], 'String');
                }
                if (data.hasOwnProperty('ajxp_modiftime')) {
                    obj['ajxp_modiftime'] = _ApiClient2['default'].convertToType(data['ajxp_modiftime'], 'Number');
                }
                if (data.hasOwnProperty('bytesize')) {
                    obj['bytesize'] = _ApiClient2['default'].convertToType(data['bytesize'], 'Number');
                }
                if (data.hasOwnProperty('stat')) {
                    obj['stat'] = _ApiClient2['default'].convertToType(data['stat'], Object);
                }
                if (data.hasOwnProperty('ajxp_relativetime')) {
                    obj['ajxp_relativetime'] = _ApiClient2['default'].convertToType(data['ajxp_relativetime'], 'String');
                }
                if (data.hasOwnProperty('ajxp_description')) {
                    obj['ajxp_description'] = _ApiClient2['default'].convertToType(data['ajxp_description'], 'String');
                }
                if (data.hasOwnProperty('icon')) {
                    obj['icon'] = _ApiClient2['default'].convertToType(data['icon'], 'String');
                }
                if (data.hasOwnProperty('filesize')) {
                    obj['filesize'] = _ApiClient2['default'].convertToType(data['filesize'], 'String');
                }
                if (data.hasOwnProperty('mimestring_id')) {
                    obj['mimestring_id'] = _ApiClient2['default'].convertToType(data['mimestring_id'], 'String');
                }
                if (data.hasOwnProperty('ajxp_readonly')) {
                    obj['ajxp_readonly'] = _ApiClient2['default'].convertToType(data['ajxp_readonly'], 'Boolean');
                }
                if (data.hasOwnProperty('file_perms')) {
                    obj['file_perms'] = _ApiClient2['default'].convertToType(data['file_perms'], 'String');
                }
                if (data.hasOwnProperty('repo_has_recycle')) {
                    obj['repo_has_recycle'] = _ApiClient2['default'].convertToType(data['repo_has_recycle'], 'Boolean');
                }
                if (data.hasOwnProperty('children')) {
                    obj['children'] = _NodeList2['default'].constructFromObject(data['children']);
                }
            }
            return obj;
        }

        /**
        * @member {String} path
        */
    }, {
        key: 'TypeEnum',

        /**
        * Allowed values for the <code>type</code> property.
        * @enum {String}
        * @readonly
        */
        value: {

            /**
             * value: "collection"
             * @const
             */
            "collection": "collection",

            /**
             * value: "leaf"
             * @const
             */
            "leaf": "leaf"
        },
        enumerable: true
    }]);

    return Node;
})();

exports['default'] = Node;
module.exports = exports['default'];

/**
* @member {module:model/Node.TypeEnum} type
*/

/**
* @member {Boolean} is_leaf
*/

/**
* @member {String} label
*/

/**
* @member {Number} ajxp_modiftime
*/

/**
* @member {Number} bytesize
*/

/**
* @member {Object} stat
*/

/**
* @member {String} ajxp_relativetime
*/

/**
* @member {String} ajxp_description
*/

/**
* @member {String} icon
*/

/**
* @member {String} filesize
*/

/**
* @member {String} mimestring_id
*/

/**
* @member {Boolean} ajxp_readonly
*/

/**
* @member {String} file_perms
*/

/**
* @member {Boolean} repo_has_recycle
*/

/**
* @member {module:model/NodeList} children
*/

},{"../ApiClient":7,"./NodeList":24}],24:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _NodeListData = require('./NodeListData');

var _NodeListData2 = _interopRequireDefault(_NodeListData);

var _PaginationData = require('./PaginationData');

var _PaginationData2 = _interopRequireDefault(_PaginationData);

/**
* The NodeList model module.
* @module model/NodeList
* @version 2.0.0
*/

var NodeList = (function () {
    /**
    * Constructs a new <code>NodeList</code>.
    * List of Node objects
    * @alias module:model/NodeList
    * @class
    */

    function NodeList() {
        _classCallCheck(this, NodeList);

        this.pagination = undefined;
        this.data = undefined;
    }

    /**
    * Constructs a <code>NodeList</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/NodeList} obj Optional instance to populate.
    * @return {module:model/NodeList} The populated <code>NodeList</code> instance.
    */

    _createClass(NodeList, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new NodeList();

                if (data.hasOwnProperty('pagination')) {
                    obj['pagination'] = _PaginationData2['default'].constructFromObject(data['pagination']);
                }
                if (data.hasOwnProperty('data')) {
                    obj['data'] = _NodeListData2['default'].constructFromObject(data['data']);
                }
            }
            return obj;
        }

        /**
        * @member {module:model/PaginationData} pagination
        */
    }]);

    return NodeList;
})();

exports['default'] = NodeList;
module.exports = exports['default'];

/**
* @member {module:model/NodeListData} data
*/

},{"../ApiClient":7,"./NodeListData":25,"./PaginationData":27}],25:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _Node = require('./Node');

var _Node2 = _interopRequireDefault(_Node);

/**
* The NodeListData model module.
* @module model/NodeListData
* @version 2.0.0
*/

var NodeListData = (function () {
    /**
    * Constructs a new <code>NodeListData</code>.
    * @alias module:model/NodeListData
    * @class
    */

    function NodeListData() {
        _classCallCheck(this, NodeListData);

        this.node = undefined;
        this.children = undefined;
    }

    /**
    * Constructs a <code>NodeListData</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/NodeListData} obj Optional instance to populate.
    * @return {module:model/NodeListData} The populated <code>NodeListData</code> instance.
    */

    _createClass(NodeListData, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new NodeListData();

                if (data.hasOwnProperty('node')) {
                    obj['node'] = _Node2['default'].constructFromObject(data['node']);
                }
                if (data.hasOwnProperty('children')) {
                    obj['children'] = _ApiClient2['default'].convertToType(data['children'], { 'String': _Node2['default'] });
                }
            }
            return obj;
        }

        /**
        * @member {module:model/Node} node
        */
    }]);

    return NodeListData;
})();

exports['default'] = NodeListData;
module.exports = exports['default'];

/**
* @member {Object.<String, module:model/Node>} children
*/

},{"../ApiClient":7,"./Node":23}],26:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _Node = require('./Node');

var _Node2 = _interopRequireDefault(_Node);

/**
* The NodesDiff model module.
* @module model/NodesDiff
* @version 2.0.0
*/

var NodesDiff = (function () {
    /**
    * Constructs a new <code>NodesDiff</code>.
    * Description of node removed / added / updated in the backend
    * @alias module:model/NodesDiff
    * @class
    */

    function NodesDiff() {
        _classCallCheck(this, NodesDiff);

        this.add = undefined;
        this.update = undefined;
        this.remove = undefined;
    }

    /**
    * Constructs a <code>NodesDiff</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/NodesDiff} obj Optional instance to populate.
    * @return {module:model/NodesDiff} The populated <code>NodesDiff</code> instance.
    */

    _createClass(NodesDiff, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new NodesDiff();

                if (data.hasOwnProperty('add')) {
                    obj['add'] = _ApiClient2['default'].convertToType(data['add'], [_Node2['default']]);
                }
                if (data.hasOwnProperty('update')) {
                    obj['update'] = _ApiClient2['default'].convertToType(data['update'], [_Node2['default']]);
                }
                if (data.hasOwnProperty('remove')) {
                    obj['remove'] = _ApiClient2['default'].convertToType(data['remove'], ['String']);
                }
            }
            return obj;
        }

        /**
        * @member {Array.<module:model/Node>} add
        */
    }]);

    return NodesDiff;
})();

exports['default'] = NodesDiff;
module.exports = exports['default'];

/**
* Nodes may have an additional attribute original_path
* @member {Array.<module:model/Node>} update
*/

/**
* @member {Array.<String>} remove
*/

},{"../ApiClient":7,"./Node":23}],27:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The PaginationData model module.
* @module model/PaginationData
* @version 2.0.0
*/

var PaginationData = (function () {
    /**
    * Constructs a new <code>PaginationData</code>.
    * Additional metadata attached to a NodeList for pagination. Could be sent through headers instead.
    * @alias module:model/PaginationData
    * @class
    */

    function PaginationData() {
        _classCallCheck(this, PaginationData);

        this.count = undefined;
        this.current = undefined;
        this.total = undefined;
        this.dirs = undefined;
        this.remoteSort = undefined;
    }

    /**
    * Constructs a <code>PaginationData</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/PaginationData} obj Optional instance to populate.
    * @return {module:model/PaginationData} The populated <code>PaginationData</code> instance.
    */

    _createClass(PaginationData, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new PaginationData();

                if (data.hasOwnProperty('count')) {
                    obj['count'] = _ApiClient2['default'].convertToType(data['count'], 'Number');
                }
                if (data.hasOwnProperty('current')) {
                    obj['current'] = _ApiClient2['default'].convertToType(data['current'], 'Number');
                }
                if (data.hasOwnProperty('total')) {
                    obj['total'] = _ApiClient2['default'].convertToType(data['total'], 'Number');
                }
                if (data.hasOwnProperty('dirs')) {
                    obj['dirs'] = _ApiClient2['default'].convertToType(data['dirs'], 'Number');
                }
                if (data.hasOwnProperty('remoteSort')) {
                    obj['remoteSort'] = _ApiClient2['default'].convertToType(data['remoteSort'], Object);
                }
            }
            return obj;
        }

        /**
        * total number of children
        * @member {Number} count
        */
    }]);

    return PaginationData;
})();

exports['default'] = PaginationData;
module.exports = exports['default'];

/**
* current page
* @member {Number} current
*/

/**
* total number of pages
* @member {Number} total
*/

/**
* total number of \"collection\" childrens
* @member {Number} dirs
*/

/**
* additional attributes describing current server-side sorting
* @member {Object} remoteSort
*/

},{"../ApiClient":7}],28:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The PeoplePatch model module.
* @module model/PeoplePatch
* @version 2.0.0
*/

var PeoplePatch = (function () {
    /**
    * Constructs a new <code>PeoplePatch</code>.
    * a key / value tuple describing which parameter to patch
    * @alias module:model/PeoplePatch
    * @class
    */

    function PeoplePatch() {
        _classCallCheck(this, PeoplePatch);

        this.resourceType = undefined;
        this.parameterName = undefined;
        this.parameterValue = undefined;
    }

    /**
    * Constructs a <code>PeoplePatch</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/PeoplePatch} obj Optional instance to populate.
    * @return {module:model/PeoplePatch} The populated <code>PeoplePatch</code> instance.
    */

    _createClass(PeoplePatch, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new PeoplePatch();

                if (data.hasOwnProperty('resourceType')) {
                    obj['resourceType'] = _ApiClient2['default'].convertToType(data['resourceType'], 'String');
                }
                if (data.hasOwnProperty('parameterName')) {
                    obj['parameterName'] = _ApiClient2['default'].convertToType(data['parameterName'], 'String');
                }
                if (data.hasOwnProperty('parameterValue')) {
                    obj['parameterValue'] = _ApiClient2['default'].convertToType(data['parameterValue'], 'String');
                }
            }
            return obj;
        }

        /**
        * @member {module:model/PeoplePatch.ResourceTypeEnum} resourceType
        */
    }, {
        key: 'ResourceTypeEnum',

        /**
        * Allowed values for the <code>resourceType</code> property.
        * @enum {String}
        * @readonly
        */
        value: {

            /**
             * value: "user"
             * @const
             */
            "user": "user",

            /**
             * value: "group"
             * @const
             */
            "group": "group"
        },

        /**
        * Allowed values for the <code>parameterName</code> property.
        * @enum {String}
        * @readonly
        */
        enumerable: true
    }, {
        key: 'ParameterNameEnum',
        value: {

            /**
             * value: "groupLabel"
             * @const
             */
            "groupLabel": "groupLabel",

            /**
             * value: "userPass"
             * @const
             */
            "userPass": "userPass",

            /**
             * value: "userProfile"
             * @const
             */
            "userProfile": "userProfile",

            /**
             * value: "userLock"
             * @const
             */
            "userLock": "userLock",

            /**
             * value: "userRoles"
             * @const
             */
            "userRoles": "userRoles",

            /**
             * value: "userAddRole"
             * @const
             */
            "userAddRole": "userAddRole",

            /**
             * value: "userRemoveRole"
             * @const
             */
            "userRemoveRole": "userRemoveRole",

            /**
             * value: "userPreferences"
             * @const
             */
            "userPreferences": "userPreferences"
        },
        enumerable: true
    }]);

    return PeoplePatch;
})();

exports['default'] = PeoplePatch;
module.exports = exports['default'];

/**
* @member {module:model/PeoplePatch.ParameterNameEnum} parameterName
*/

/**
* @member {String} parameterValue
*/

},{"../ApiClient":7}],29:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _BgAction = require('./BgAction');

var _BgAction2 = _interopRequireDefault(_BgAction);

var _NodesDiff = require('./NodesDiff');

var _NodesDiff2 = _interopRequireDefault(_NodesDiff);

var _Task = require('./Task');

var _Task2 = _interopRequireDefault(_Task);

/**
* The PydioResponse model module.
* @module model/PydioResponse
* @version 2.0.0
*/

var PydioResponse = (function () {
    /**
    * Constructs a new <code>PydioResponse</code>.
    * Generic container for messages after successful operations or errors
    * @alias module:model/PydioResponse
    * @class
    */

    function PydioResponse() {
        _classCallCheck(this, PydioResponse);

        this.message = undefined;
        this.level = undefined;
        this.errorCode = undefined;
        this.nodesDiff = undefined;
        this.bgAction = undefined;
        this.tasks = undefined;
    }

    /**
    * Constructs a <code>PydioResponse</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/PydioResponse} obj Optional instance to populate.
    * @return {module:model/PydioResponse} The populated <code>PydioResponse</code> instance.
    */

    _createClass(PydioResponse, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new PydioResponse();

                if (data.hasOwnProperty('message')) {
                    obj['message'] = _ApiClient2['default'].convertToType(data['message'], 'String');
                }
                if (data.hasOwnProperty('level')) {
                    obj['level'] = _ApiClient2['default'].convertToType(data['level'], 'String');
                }
                if (data.hasOwnProperty('errorCode')) {
                    obj['errorCode'] = _ApiClient2['default'].convertToType(data['errorCode'], 'Number');
                }
                if (data.hasOwnProperty('nodesDiff')) {
                    obj['nodesDiff'] = _NodesDiff2['default'].constructFromObject(data['nodesDiff']);
                }
                if (data.hasOwnProperty('bgAction')) {
                    obj['bgAction'] = _BgAction2['default'].constructFromObject(data['bgAction']);
                }
                if (data.hasOwnProperty('tasks')) {
                    obj['tasks'] = _ApiClient2['default'].convertToType(data['tasks'], [_Task2['default']]);
                }
            }
            return obj;
        }

        /**
        * @member {String} message
        */
    }]);

    return PydioResponse;
})();

exports['default'] = PydioResponse;
module.exports = exports['default'];

/**
* @member {String} level
*/

/**
* @member {Number} errorCode
*/

/**
* @member {module:model/NodesDiff} nodesDiff
*/

/**
* @member {module:model/BgAction} bgAction
*/

/**
* @member {Array.<module:model/Task>} tasks
*/

},{"../ApiClient":7,"./BgAction":16,"./NodesDiff":26,"./Task":31}],30:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The Role model module.
* @module model/Role
* @version 2.0.0
*/

var Role = (function () {
    /**
    * Constructs a new <code>Role</code>.
    * Representation of a Role, central container of permissions, actions and parameters.
    * @alias module:model/Role
    * @class
    */

    function Role() {
        _classCallCheck(this, Role);

        this.ACL = undefined;
        this.MASKS = undefined;
        this.PARAMETERS = undefined;
        this.ACTIONS = undefined;
        this.APPLIES = undefined;
    }

    /**
    * Constructs a <code>Role</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/Role} obj Optional instance to populate.
    * @return {module:model/Role} The populated <code>Role</code> instance.
    */

    _createClass(Role, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new Role();

                if (data.hasOwnProperty('ACL')) {
                    obj['ACL'] = _ApiClient2['default'].convertToType(data['ACL'], Object);
                }
                if (data.hasOwnProperty('MASKS')) {
                    obj['MASKS'] = _ApiClient2['default'].convertToType(data['MASKS'], Object);
                }
                if (data.hasOwnProperty('PARAMETERS')) {
                    obj['PARAMETERS'] = _ApiClient2['default'].convertToType(data['PARAMETERS'], Object);
                }
                if (data.hasOwnProperty('ACTIONS')) {
                    obj['ACTIONS'] = _ApiClient2['default'].convertToType(data['ACTIONS'], Object);
                }
                if (data.hasOwnProperty('APPLIES')) {
                    obj['APPLIES'] = _ApiClient2['default'].convertToType(data['APPLIES'], Object);
                }
            }
            return obj;
        }

        /**
        * Key/value associating workspace IDs and rights strings (r/w)
        * @member {Object} ACL
        */
    }]);

    return Role;
})();

exports['default'] = Role;
module.exports = exports['default'];

/**
* Folders permissions masks
* @member {Object} MASKS
*/

/**
* Refined values of plugins parameters
* @member {Object} PARAMETERS
*/

/**
* Enabled/disabled actions of plugins
* @member {Object} ACTIONS
*/

/**
* Set of profiles on which this role automatically applies
* @member {Object} APPLIES
*/

},{"../ApiClient":7}],31:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _TaskSchedule = require('./TaskSchedule');

var _TaskSchedule2 = _interopRequireDefault(_TaskSchedule);

/**
* The Task model module.
* @module model/Task
* @version 2.0.0
*/

var Task = (function () {
    /**
    * Constructs a new <code>Task</code>.
    * Background operation started on the server. It&#39;s the client mission to check it on a regular basis.
    * @alias module:model/Task
    * @class
    */

    function Task() {
        _classCallCheck(this, Task);

        this.id = undefined;
        this.status = undefined;
        this.label = undefined;
        this.description = undefined;
        this.userId = undefined;
        this.wsId = undefined;
        this.actionName = undefined;
        this.schedule = undefined;
        this.parameters = undefined;
    }

    /**
    * Constructs a <code>Task</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/Task} obj Optional instance to populate.
    * @return {module:model/Task} The populated <code>Task</code> instance.
    */

    _createClass(Task, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new Task();

                if (data.hasOwnProperty('id')) {
                    obj['id'] = _ApiClient2['default'].convertToType(data['id'], 'String');
                }
                if (data.hasOwnProperty('status')) {
                    obj['status'] = _ApiClient2['default'].convertToType(data['status'], 'Number');
                }
                if (data.hasOwnProperty('label')) {
                    obj['label'] = _ApiClient2['default'].convertToType(data['label'], 'String');
                }
                if (data.hasOwnProperty('description')) {
                    obj['description'] = _ApiClient2['default'].convertToType(data['description'], 'String');
                }
                if (data.hasOwnProperty('userId')) {
                    obj['userId'] = _ApiClient2['default'].convertToType(data['userId'], 'String');
                }
                if (data.hasOwnProperty('wsId')) {
                    obj['wsId'] = _ApiClient2['default'].convertToType(data['wsId'], 'String');
                }
                if (data.hasOwnProperty('actionName')) {
                    obj['actionName'] = _ApiClient2['default'].convertToType(data['actionName'], 'String');
                }
                if (data.hasOwnProperty('schedule')) {
                    obj['schedule'] = _TaskSchedule2['default'].constructFromObject(data['schedule']);
                }
                if (data.hasOwnProperty('parameters')) {
                    obj['parameters'] = _ApiClient2['default'].convertToType(data['parameters'], Object);
                }
            }
            return obj;
        }

        /**
        * @member {String} id
        */
    }]);

    return Task;
})();

exports['default'] = Task;
module.exports = exports['default'];

/**
* @member {Number} status
*/

/**
* @member {String} label
*/

/**
* @member {String} description
*/

/**
* @member {String} userId
*/

/**
* @member {String} wsId
*/

/**
* @member {String} actionName
*/

/**
* @member {module:model/TaskSchedule} schedule
*/

/**
* @member {Object} parameters
*/

},{"../ApiClient":7,"./TaskSchedule":32}],32:[function(require,module,exports){
/**
 * Pydio API V2
 * Access to a Pydio Server. Second version of the API.
 *
 * OpenAPI spec version: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ApiClient = require('../ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

/**
* The TaskSchedule model module.
* @module model/TaskSchedule
* @version 2.0.0
*/

var TaskSchedule = (function () {
    /**
    * Constructs a new <code>TaskSchedule</code>.
    * @alias module:model/TaskSchedule
    * @class
    */

    function TaskSchedule() {
        _classCallCheck(this, TaskSchedule);

        this.scheduleType = undefined;
        this.scheduleValue = undefined;
    }

    /**
    * Constructs a <code>TaskSchedule</code> from a plain JavaScript object, optionally creating a new instance.
    * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
    * @param {Object} data The plain JavaScript object bearing properties of interest.
    * @param {module:model/TaskSchedule} obj Optional instance to populate.
    * @return {module:model/TaskSchedule} The populated <code>TaskSchedule</code> instance.
    */

    _createClass(TaskSchedule, null, [{
        key: 'constructFromObject',
        value: function constructFromObject(data, obj) {
            if (data) {
                obj = obj || new TaskSchedule();

                if (data.hasOwnProperty('scheduleType')) {
                    obj['scheduleType'] = _ApiClient2['default'].convertToType(data['scheduleType'], 'String');
                }
                if (data.hasOwnProperty('scheduleValue')) {
                    obj['scheduleValue'] = _ApiClient2['default'].convertToType(data['scheduleValue'], 'String');
                }
            }
            return obj;
        }

        /**
        * @member {String} scheduleType
        */
    }]);

    return TaskSchedule;
})();

exports['default'] = TaskSchedule;
module.exports = exports['default'];

/**
* @member {String} scheduleValue
*/

},{"../ApiClient":7}],33:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],34:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],35:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":33,"./encode":34}],36:[function(require,module,exports){
/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  console.warn("Using browser-only version of superagent in non-browser environment");
  root = this;
}

var Emitter = require('component-emitter');
var RequestBase = require('./request-base');
var isObject = require('./is-object');
var isFunction = require('./is-function');
var ResponseBase = require('./response-base');
var shouldRetry = require('./should-retry');

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `request`.
 */

var request = exports = module.exports = function(method, url) {
  // callback
  if ('function' == typeof url) {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

exports.Request = Request;

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  throw Error("Browser-only verison of superagent could not find XHR");
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pushEncodedKeyValuePair(pairs, key, obj[key]);
  }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (val != null) {
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (isObject(val)) {
      for(var subkey in val) {
        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
      }
    } else {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(val));
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');
    if (pos == -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] =
        decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req) {
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status;
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
      status = 204;
  }
  this._setStatusProperties(status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this._setHeaderProperties(this.header);

  if (null === this.text && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method != 'HEAD'
      ? this._parseBody(this.text ? this.text : this.xhr.response)
      : null;
  }
}

ResponseBase(Response.prototype);

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function(str){
  var parse = request.parse[this.type];
  if(this.req._parser) {
    return this.req._parser(this, str);
  }
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
        // issue #876: return the http status code if the response parsing fails
        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);

    var new_err;
    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
        new_err.original = err;
        new_err.response = res;
        new_err.status = res.status;
      }
    } catch(e) {
      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
    }

    // #1000 don't catch errors from the callback to avoid double calling it
    if (new_err) {
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}

/**
 * Mixin `Emitter` and `RequestBase`.
 */

Emitter(Request.prototype);
RequestBase(Request.prototype);

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (typeof pass === 'object' && pass !== null) { // pass is optional and can substitute for options
    options = pass;
  }
  if (!options) {
    options = {
      type: 'function' === typeof btoa ? 'basic' : 'auto',
    }
  }

  switch (options.type) {
    case 'basic':
      this.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
      
    case 'bearer': // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', 'Bearer ' + user);
    break;  
  }
  return this;
};

/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, options){
  if (file) {
    if (this._data) {
      throw Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  // console.log(this._retries, this._maxRetries)
  if (this._maxRetries && this._retries++ < this._maxRetries && shouldRetry(err, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    if (this._maxRetries) err.retries = this._retries - 1;
    this.emit('error', err);
  }

  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

// This only warns, because the request is still likely to work
Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
  console.warn("This is not supported in browser version of superagent");
  return this;
};

// This throws, because it can't send/receive data as expected
Request.prototype.pipe = Request.prototype.write = function(){
  throw Error("Streaming is not supported in browser version of superagent");
};

/**
 * Compose querystring to append to req.url
 *
 * @api private
 */

Request.prototype._appendQueryString = function(){
  var query = this._query.join('&');
  if (query) {
    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
  }

  if (this._sort) {
    var index = this.url.indexOf('?');
    if (index >= 0) {
      var queryArr = this.url.substring(index + 1).split('&');
      if (isFunction(this._sort)) {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }
      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
    }
  }
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
Request.prototype._isHost = function _isHost(obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
}

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  if (this._endCalled) {
    console.warn("Warning: .end() was called twice. This is not supported in superagent");
  }
  this._endCalled = true;

  // store callback
  this._callback = fn || noop;

  // querystring
  this._appendQueryString();

  return this._end();
};

Request.prototype._end = function() {
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var data = this._formData || this._data;

  this._setTimeouts();

  // state change
  xhr.onreadystatechange = function(){
    var readyState = xhr.readyState;
    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }
    if (4 != readyState) {
      return;
    }

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = direction;
    self.emit('progress', e);
  }
  if (this.hasListeners('progress')) {
    try {
      xhr.onprogress = handleProgress.bind(null, 'download');
      if (xhr.upload) {
        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
      }
    } catch(e) {
      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  // initiate request
  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) {
      serialize = request.serialize['application/json'];
    }
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;

    if (this.header.hasOwnProperty(field))
      xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function(url, data, fn){
  var req = request('OPTIONS', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, data, fn){
  var req = request('DELETE', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-function":37,"./is-object":38,"./request-base":39,"./response-base":40,"./should-retry":41,"component-emitter":5}],37:[function(require,module,exports){
/**
 * Check if `fn` is a function.
 *
 * @param {Function} fn
 * @return {Boolean}
 * @api private
 */
var isObject = require('./is-object');

function isFunction(fn) {
  var tag = isObject(fn) ? Object.prototype.toString.call(fn) : '';
  return tag === '[object Function]';
}

module.exports = isFunction;

},{"./is-object":38}],38:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null !== obj && 'object' === typeof obj;
}

module.exports = isObject;

},{}],39:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Expose `RequestBase`.
 */

module.exports = RequestBase;

/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in RequestBase.prototype) {
    obj[key] = RequestBase.prototype[key];
  }
  return obj;
}

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.clearTimeout = function _clearTimeout(){
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  return this;
};

/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.serialize = function serialize(fn){
  this._serializer = fn;
  return this;
};

/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, read, deadline}
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.timeout = function timeout(options){
  if (!options || 'object' !== typeof options) {
    this._timeout = options;
    this._responseTimeout = 0;
    return this;
  }

  for(var option in options) {
    switch(option) {
      case 'deadline':
        this._timeout = options.deadline;
        break;
      case 'response':
        this._responseTimeout = options.response;
        break;
      default:
        console.warn("Unknown timeout option", option);
    }
  }
  return this;
};

/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.retry = function retry(count){
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  return this;
};

/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */

RequestBase.prototype._retry = function() {
  this.clearTimeout();

  // node
  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;

  return this._end();
};

/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */

RequestBase.prototype.then = function then(resolve, reject) {
  if (!this._fullfilledPromise) {
    var self = this;
    if (this._endCalled) {
      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
    }
    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
      self.end(function(err, res){
        if (err) innerReject(err); else innerResolve(res);
      });
    });
  }
  return this._fullfilledPromise.then(resolve, reject);
}

RequestBase.prototype.catch = function(cb) {
  return this.then(undefined, cb);
};

/**
 * Allow for extension
 */

RequestBase.prototype.use = function use(fn) {
  fn(this);
  return this;
}

RequestBase.prototype.ok = function(cb) {
  if ('function' !== typeof cb) throw Error("Callback required");
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function(res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

RequestBase.prototype.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

RequestBase.prototype.getHeader = RequestBase.prototype.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
RequestBase.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
RequestBase.prototype.field = function(name, val) {

  // name should be either a string or an object.
  if (null === name ||  undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      this.field(key, name[key]);
    }
    return this;
  }

  if (Array.isArray(val)) {
    for (var i in val) {
      this.field(name, val[i]);
    }
    return this;
  }

  // val should be defined now
  if (null === val || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }
  if ('boolean' === typeof val) {
    val = '' + val;
  }
  this._getFormData().append(name, val);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */
RequestBase.prototype.abort = function(){
  if (this._aborted) {
    return this;
  }
  this._aborted = true;
  this.xhr && this.xhr.abort(); // browser
  this.req && this.req.abort(); // node
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

RequestBase.prototype.withCredentials = function(on){
  // This is browser-only functionality. Node side is no-op.
  if(on==undefined) on = true;
  this._withCredentials = on;
  return this;
};

/**
 * Set the max redirects to `n`. Does noting in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

RequestBase.prototype.toJSON = function(){
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};


/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.send = function(data){
  var isObj = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObj && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw Error("Can't merge these send calls");
  }

  // merge
  if (isObj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObj || this._isHost(data)) {
    return this;
  }

  // default to json
  if (!type) this.type('json');
  return this;
};


/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.sortQuery = function(sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

RequestBase.prototype._timeoutError = function(reason, timeout, errno){
  if (this._aborted) {
    return;
  }
  var err = new Error(reason + timeout + 'ms exceeded');
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  err.errno = errno;
  this.timedout = true;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function() {
  var self = this;

  // deadline
  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  }
  // response timeout
  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function(){
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
}

},{"./is-object":38}],40:[function(require,module,exports){

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Expose `ResponseBase`.
 */

module.exports = ResponseBase;

/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    obj[key] = ResponseBase.prototype[key];
  }
  return obj;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

ResponseBase.prototype.get = function(field){
    return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

ResponseBase.prototype._setHeaderProperties = function(header){
    // TODO: moar!
    // TODO: make this a util

    // content-type
    var ct = header['content-type'] || '';
    this.type = utils.type(ct);

    // params
    var params = utils.params(ct);
    for (var key in params) this[key] = params[key];

    this.links = {};

    // links
    try {
        if (header.link) {
            this.links = utils.parseLinks(header.link);
        }
    } catch (err) {
        // ignore
    }
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

ResponseBase.prototype._setStatusProperties = function(status){
    var type = status / 100 | 0;

    // status / class
    this.status = this.statusCode = status;
    this.statusType = type;

    // basics
    this.info = 1 == type;
    this.ok = 2 == type;
    this.redirect = 3 == type;
    this.clientError = 4 == type;
    this.serverError = 5 == type;
    this.error = (4 == type || 5 == type)
        ? this.toError()
        : false;

    // sugar
    this.accepted = 202 == status;
    this.noContent = 204 == status;
    this.badRequest = 400 == status;
    this.unauthorized = 401 == status;
    this.notAcceptable = 406 == status;
    this.forbidden = 403 == status;
    this.notFound = 404 == status;
};

},{"./utils":42}],41:[function(require,module,exports){
var ERROR_CODES = [
  'ECONNRESET',
  'ETIMEDOUT',
  'EADDRINFO',
  'ESOCKETTIMEDOUT'
];

/**
 * Determine if a request should be retried.
 * (Borrowed from segmentio/superagent-retry)
 *
 * @param {Error} err
 * @param {Response} [res]
 * @returns {Boolean}
 */
module.exports = function shouldRetry(err, res) {
  if (err && err.code && ~ERROR_CODES.indexOf(err.code)) return true;
  if (res && res.status && res.status >= 500) return true;
  // Superagent timeout
  if (err && 'timeout' in err && err.code == 'ECONNABORTED') return true;
  if (err && 'crossDomain' in err) return true;
  return false;
};

},{}],42:[function(require,module,exports){

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.type = function(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.params = function(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */);
    var key = parts.shift();
    var val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.parseLinks = function(str){
  return str.split(/ *, */).reduce(function(obj, str){
    var parts = str.split(/ *; */);
    var url = parts[0].slice(1, -1);
    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
    obj[rel] = url;
    return obj;
  }, {});
};

/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */

exports.cleanHeader = function(header, shouldStripCookie){
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header['host'];
  if (shouldStripCookie) {
    delete header['cookie'];
  }
  return header;
};
},{}],43:[function(require,module,exports){
(function() {
  function getBytes() {
    try {
      // Modern Browser
      return Array.from(
        (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(16))
      );
    } catch (error) {
      // Legacy Browser, fallback to Math.random
      var ret = [];
      while (ret.length < 16) ret.push((Math.random() * 256) & 0xff);
      return ret;
    }
  }

  function m(v) {
    v = v.toString(16);
    if (v.length < 2) v = "0" + v;
    return v;
  }

  function genUUID() {
    var rnd = getBytes();
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd
      .map(m)
      .join("")
      .match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    return rnd.join("-");
  }

  var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  function isUUID(uuid) {
    return uuidPattern.test(uuid);
  }

  genUUID.valid = isUUID;

  // global
  if (window) {
    window.uuid4 = genUUID;
  }

  // Node-style CJS
  if (typeof module !== "undefined" && module.exports) {
    module.exports = genUUID;
  }

  // AMD - legacy
  if (typeof define === "function" && define.amd) {
    define([], function() {
      return genUUID;
    });
  }
})();

},{}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _stepsStepEmptyConfig = require('./steps/StepEmptyConfig');

var _stepsStepEmptyConfig2 = _interopRequireDefault(_stepsStepEmptyConfig);

var _stepsStepConnection = require('./steps/StepConnection');

var _stepsStepConnection2 = _interopRequireDefault(_stepsStepConnection);

var _stepsStepCategories = require('./steps/StepCategories');

var _stepsStepCategories2 = _interopRequireDefault(_stepsStepCategories);

var _stepsStepMetadata = require('./steps/StepMetadata');

var _stepsStepMetadata2 = _interopRequireDefault(_stepsStepMetadata);

var _stepsStepShares = require('./steps/StepShares');

var _stepsStepShares2 = _interopRequireDefault(_stepsStepShares);

var _stepsStepWorkspaces = require('./steps/StepWorkspaces');

var _stepsStepWorkspaces2 = _interopRequireDefault(_stepsStepWorkspaces);

var _stepsStepPrerequisites = require('./steps/StepPrerequisites');

var _stepsStepPrerequisites2 = _interopRequireDefault(_stepsStepPrerequisites);

var _stepsStepDisclaimer = require('./steps/StepDisclaimer');

var _stepsStepDisclaimer2 = _interopRequireDefault(_stepsStepDisclaimer);

var _TaskActivity = require('./TaskActivity');

var _TaskActivity2 = _interopRequireDefault(_TaskActivity);

var _actionsActions = require('./actions/actions');

var Actions = _interopRequireWildcard(_actionsActions);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib2.ModernSelectField;

var styles = {
    stepLegend: { color: '#757575', padding: '6px 0' }
};

var Dashboard = (function (_React$Component) {
    _inherits(Dashboard, _React$Component);

    function Dashboard(props) {
        _classCallCheck(this, Dashboard);

        _get(Object.getPrototypeOf(Dashboard.prototype), 'constructor', this).call(this, props);

        var features = {
            configs: { label: this.T('feature.configs'), value: false, action: Actions.getConfigsAction },
            users: { label: this.T('feature.users'), value: false, action: Actions.getUsersAction },
            workspaces: { label: this.T('feature.workspaces'), value: false, action: Actions.getWorkspacesAction, summary: Actions.getWorkspacesSummary },
            acls: { label: this.T('feature.acls'), value: false, action: Actions.getAclsAction, depends: 'workspaces' },
            metadata: { label: this.T('feature.meta'), value: false, action: Actions.getMetadataAction, summary: Actions.getMedataSummary, depends: 'workspaces' },
            shares: { label: this.T('feature.shares'), value: false, action: Actions.getSharesAction, summary: Actions.getSharesSummary, depends: 'workspaces' }
        };
        if (!props.advanced) {
            delete features.configs;
        }

        this.state = {
            activeStep: 0,
            url: "",
            user: "importer",
            pwd: "",
            cellAdmin: props.pydio.user.id,
            skipVerify: false,
            features: features,
            workspaces: [],
            workspaceMapping: {},
            localStatus: [],
            previousTasks: [],
            showLogs: null
        };
    }

    _createClass(Dashboard, [{
        key: 'T',
        value: function T(id) {
            return this.props.pydio.MessageHash['migration.dash.' + id] || this.props.pydio.MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'loadPreviousTasks',
        value: function loadPreviousTasks() {
            var _this = this;

            JobsStore.getInstance().getAdminJobs(null, null, "pydio8-data-import", 20).then(function (response) {
                if (response.Jobs && response.Jobs.length) {
                    var tasks = response.Jobs[0].Tasks || [];
                    tasks.sort(_pydioUtilLang2['default'].arraySorter('StartTime'));
                    tasks.reverse();
                    _this.setState({ previousTasks: tasks });
                }
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var pydio = this.props.pydio;

            this._observer = function (jsonObject) {
                var Job = jsonObject.Job;
                var TaskUpdated = jsonObject.TaskUpdated;

                var job = _pydioHttpRestApi.JobsJob.constructFromObject(Job);
                if (job.ID === 'pydio8-data-import') {
                    var task = _pydioHttpRestApi.JobsTask.constructFromObject(TaskUpdated);
                    _this2.setState({ job: job, task: task });
                }
            };
            pydio.observe("task_message", this._observer);
            this.loadPreviousTasks();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this._observer) {
                var pydio = this.props.pydio;

                pydio.stopObserving("task_message", this._observer);
                this._observer = null;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var openRightPane = _props.openRightPane;
            var closeRightPane = _props.closeRightPane;
            var advanced = _props.advanced;
            var currentNode = _props.currentNode;
            var _state = this.state;
            var activeStep = _state.activeStep;
            var url = _state.url;
            var skipVerify = _state.skipVerify;
            var user = _state.user;
            var pwd = _state.pwd;
            var features = _state.features;
            var task = _state.task;
            var showLogs = _state.showLogs;
            var localStatus = _state.localStatus;
            var previousTasks = _state.previousTasks;

            var remainingState = _objectWithoutProperties(_state, ['activeStep', 'url', 'skipVerify', 'user', 'pwd', 'features', 'task', 'showLogs', 'localStatus', 'previousTasks']);

            var adminStyles = AdminComponents.AdminStyles();

            var previousJobsSelector = _react2['default'].createElement(
                ModernSelectField,
                { fullWidth: true, value: showLogs, onChange: function (e, i, v) {
                        _this3.setState({ showLogs: v });
                    } },
                _react2['default'].createElement(_materialUi.MenuItem, { value: null, primaryText: this.T('job.new') }),
                previousTasks.length > 0 && _react2['default'].createElement(_materialUi.Divider, null),
                previousTasks.map(function (t) {
                    var label = undefined;
                    if (t.EndTime) {
                        label = t.Status + ' ' + moment(new Date(t.EndTime * 1000)).fromNow();
                    } else {
                        label = t.Status + ' ' + moment(new Date(t.StartTime * 1000)).fromNow();
                    }
                    return _react2['default'].createElement(_materialUi.MenuItem, { label: label, primaryText: label, value: t });
                })
            );

            var content = undefined;
            if (showLogs) {
                content = _react2['default'].createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    _react2['default'].createElement(_TaskActivity2['default'], { pydio: pydio, task: showLogs, styles: adminStyles })
                );
            } else {
                (function () {

                    var commonProps = {
                        pydio: pydio,
                        onBack: function onBack() {
                            return _this3.setState({ activeStep: activeStep - 1 });
                        },
                        onComplete: function onComplete() {
                            return _this3.setState({ activeStep: activeStep + 1 });
                        },
                        onChange: function onChange(params) {
                            return _this3.setState(params);
                        },
                        url: url,
                        skipVerify: skipVerify,
                        user: user,
                        pwd: pwd,
                        styles: styles,
                        hasRunning: task && task.Status === 'Running'
                    };

                    content = _react2['default'].createElement(
                        _materialUi.Paper,
                        _extends({}, adminStyles.body.block.props, { style: _extends({}, adminStyles.body.block.container, { paddingBottom: 16 }) }),
                        _react2['default'].createElement(
                            _materialUi.Stepper,
                            { style: { display: 'flex' }, orientation: 'vertical', activeStep: activeStep },
                            _react2['default'].createElement(_stepsStepDisclaimer2['default'], _extends({}, commonProps, { onBack: null, advanced: advanced })),
                            _react2['default'].createElement(_stepsStepPrerequisites2['default'], _extends({}, commonProps, { onBack: null, advanced: advanced })),
                            _react2['default'].createElement(_stepsStepConnection2['default'], _extends({}, commonProps, { url: url, skipVerify: skipVerify, user: user, pwd: pwd })),
                            _react2['default'].createElement(_stepsStepCategories2['default'], _extends({}, commonProps, { features: features,
                                onChange: function (newFeatures) {
                                    return _this3.setState({ features: _extends({}, features, newFeatures) });
                                }
                            })),
                            Object.keys(features).filter(function (k) {
                                return k === "configs" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepEmptyConfig2['default'], _extends({}, commonProps, {
                                    title: _this3.T('feature.configs'),
                                    legend: _this3.T('feature.configs.legend'),
                                    style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' }
                                }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "users" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepEmptyConfig2['default'], _extends({}, commonProps, {
                                    title: _this3.T('feature.users'),
                                    legend: _this3.T('feature.users.legend'),
                                    style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' }
                                }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "workspaces" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepWorkspaces2['default'], _extends({}, commonProps, {
                                    style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' },
                                    openRightPane: openRightPane,
                                    closeRightPane: closeRightPane
                                }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "acls" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepEmptyConfig2['default'], _extends({}, commonProps, {
                                    title: _this3.T('feature.acls'),
                                    legend: _this3.T('feature.acls.legend'),
                                    style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' }
                                }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "metadata" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepMetadata2['default'], _extends({}, commonProps, { style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' } }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "shares" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepShares2['default'], _extends({}, commonProps, { style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' } }));
                            }),
                            _react2['default'].createElement(_stepsStepCategories2['default'], _extends({}, commonProps, { features: features, summary: true, summaryState: _this3.state
                            }, remainingState, {
                                onComplete: function () {
                                    _this3.setState({ localStatus: [] }, function () {
                                        Actions.startJob(_this3.state, function (localUpdate) {
                                            _this3.setState({ localStatus: [].concat(_toConsumableArray(localStatus), [localUpdate]) });
                                        });
                                        setTimeout(function () {
                                            _this3.loadPreviousTasks();
                                        }, 1000);
                                    });
                                }
                            }))
                        )
                    );
                })();
            }

            return _react2['default'].createElement(
                'div',
                { className: 'main-layout-nav-to-stack workspaces-board' },
                _react2['default'].createElement(
                    'div',
                    { className: 'vertical-layout', style: { width: '100%' } },
                    _react2['default'].createElement(AdminComponents.Header, {
                        title: this.T('title'),
                        icon: currentNode.getMetadata().get('icon_class'),
                        actions: [previousJobsSelector]
                    }),
                    _react2['default'].createElement(
                        'div',
                        { className: 'layout-fill' },
                        (task || localStatus.length > 0) && _react2['default'].createElement(
                            _materialUi.Paper,
                            adminStyles.body.block.props,
                            _react2['default'].createElement(
                                'div',
                                { style: adminStyles.body.block.headerFull },
                                this.T('importing')
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { padding: 16 } },
                                localStatus.length > 0 && _react2['default'].createElement(
                                    'div',
                                    null,
                                    localStatus.map(function (x) {
                                        return _react2['default'].createElement(
                                            'div',
                                            null,
                                            x
                                        );
                                    })
                                ),
                                task && _react2['default'].createElement(
                                    'div',
                                    null,
                                    _react2['default'].createElement(
                                        'h6',
                                        null,
                                        task.StatusMessage
                                    ),
                                    task.Status !== "Finished" && _react2['default'].createElement(_materialUi.LinearProgress, { mode: 'determinate', min: 0, max: 100, value: (task.Progress || 0) * 100, style: { width: '100%' } })
                                )
                            )
                        ),
                        content
                    )
                )
            );
        }
    }]);

    return Dashboard;
})(_react2['default'].Component);

exports['default'] = Dashboard;
module.exports = exports['default'];

},{"./TaskActivity":45,"./actions/actions":46,"./steps/StepCategories":49,"./steps/StepConnection":50,"./steps/StepDisclaimer":51,"./steps/StepEmptyConfig":52,"./steps/StepMetadata":53,"./steps/StepPrerequisites":54,"./steps/StepShares":55,"./steps/StepWorkspaces":56,"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],45:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2["default"].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var _Pydio$requireLib2 = _pydio2["default"].requireLib('boot');

var moment = _Pydio$requireLib2.moment;

var TaskActivity = (function (_React$Component) {
    _inherits(TaskActivity, _React$Component);

    function TaskActivity(props) {
        _classCallCheck(this, TaskActivity);

        _get(Object.getPrototypeOf(TaskActivity.prototype), "constructor", this).call(this, props);
        this.state = { activity: [], loading: false };
    }

    _createClass(TaskActivity, [{
        key: "T",
        value: function T(id) {
            return this.props.pydio.MessageHash['migration.' + id] || id;
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.loadActivity(this.props);
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (!this.props.task) {
                this.loadActivity(nextProps);
            }
            if (nextProps.task && this.props.task && nextProps.task.ID !== this.props.task.ID) {
                this.loadActivity(nextProps);
            }
        }
    }, {
        key: "loadActivity",
        value: function loadActivity(props) {
            var _this = this;

            var task = props.task;

            if (!task) {
                return;
            }
            var operationId = task.JobID + '-' + task.ID.substr(0, 8);
            return _pydioHttpResourcesManager2["default"].loadClass('EnterpriseSDK').then(function (sdk) {

                var request = new _pydioHttpRestApi.LogListLogRequest();
                request.Query = "+OperationUuid:\"" + operationId + "\"";
                request.Page = 0;
                request.Size = 100;
                request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject('JSON');
                var api = new sdk.EnterpriseLogServiceApi(_pydioHttpApi2["default"].getRestClient());
                _this.setState({ loading: true });
                api.audit(request).then(function (response) {
                    _this.setState({ activity: response.Logs || [], loading: false });
                })["catch"](function () {
                    _this.setState({ activity: [], loading: false });
                });
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var task = _props.task;
            var styles = _props.styles;
            var activity = this.state.activity;

            var columns = [{ name: 'Ts', label: pydio.MessageHash['settings.17'], style: { width: '25%' }, headerStyle: { width: '25%' }, renderCell: function renderCell(row) {
                    return moment(row.Ts * 1000).fromNow();
                } }, { name: 'Msg', label: pydio.MessageHash['ajxp_admin.logs.message'] }];
            return _react2["default"].createElement(
                "div",
                { className: "vertical-layout", style: { height: '100%' } },
                _react2["default"].createElement(
                    "div",
                    { style: _extends({}, styles.body.block.headerFull) },
                    this.T('logs.legend').replace("%s", task.ID)
                ),
                _react2["default"].createElement(
                    "div",
                    { className: "layout-fill vertical-layout" },
                    _react2["default"].createElement(MaterialTable, {
                        columns: columns,
                        data: activity,
                        showCheckboxes: false,
                        emptyStateString: this.T('logs.empty')
                    })
                )
            );
        }
    }]);

    return TaskActivity;
})(_react2["default"].Component);

exports["default"] = TaskActivity;
module.exports = exports["default"];

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.startJob = startJob;
exports.getConfigsAction = getConfigsAction;
exports.getUsersAction = getUsersAction;
exports.getAclsAction = getAclsAction;
exports.getWorkspacesAction = getWorkspacesAction;
exports.getWorkspacesSummary = getWorkspacesSummary;
exports.getSharesAction = getSharesAction;
exports.getSharesSummary = getSharesSummary;
exports.getMetadataAction = getMetadataAction;
exports.getMedataSummary = getMedataSummary;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _uuid4 = require("uuid4");

var _uuid42 = _interopRequireDefault(_uuid4);

var _pydioHttpRestApi = require('pydio/http/rest-api');

function T(id) {
    var m = _pydio2["default"].getInstance().MessageHash;
    return m['migration.action.' + id] || m['migration.' + id] || m[id] || id;
}

function startJob(state, onLocalUpdate) {
    var features = state.features;
    var cellAdmin = state.cellAdmin;

    var allActions = [];
    var sessionUuid = (0, _uuid42["default"])();
    Object.keys(features).forEach(function (k) {
        var feature = features[k];
        if (feature.value && typeof feature.action === "function") {
            feature.action(state, onLocalUpdate).map(function (a) {
                a.params = _extends({}, a.params, { cellAdmin: cellAdmin, sessionUuid: sessionUuid });
                allActions.push(a);
            });
        }
    });
    if (allActions.length) {
        _pydioHttpApi2["default"].getRestClient().userJob("import-p8", allActions).then(function (res) {
            console.log(res);
        })["catch"](function (err) {
            var msg = err.Detail || err.message || err;
            _pydio2["default"].getInstance().UI.displayMessage('ERROR', msg);
        });
    }
}

function getConfigsAction(state, onLocalUpdate) {
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;

    return [{
        name: "actions.etl.configs",
        params: {
            left: "pydio8",
            right: "cells-local",
            url: url,
            user: user,
            password: pwd,
            skipVerify: skipVerify ? "true" : "false"
        }
    }];
}

function getUsersAction(state, onLocalUpdate) {
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;
    var cellAdmin = state.cellAdmin;

    return [{
        name: "actions.etl.users",
        params: {
            left: "pydio8",
            right: "cells-local",
            splitUsersRoles: "true",
            cellAdmin: cellAdmin,
            url: url,
            user: user,
            password: pwd,
            skipVerify: skipVerify ? "true" : "false"
        }
    }];
}

function getAclsAction(state, onLocalUpdate) {
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;
    var cellAdmin = state.cellAdmin;
    var workspaceMapping = state.workspaceMapping;

    return [{
        name: "actions.etl.p8-workspaces",
        params: {
            type: "pydio8",
            url: url,
            user: user,
            password: pwd,
            skipVerify: skipVerify ? "true" : "false",
            mapping: JSON.stringify(workspaceMapping),
            cellAdmin: cellAdmin
        }
    }];
}

function getWorkspacesAction(state, onLocalUpdate) {
    var workspaceCreate = state.workspaceCreate;
    var localStatus = state.localStatus;

    Object.keys(workspaceCreate).forEach(function (k) {
        workspaceCreate[k].save().then(function () {
            onLocalUpdate(T('createws.success').replace('%s', workspaceCreate[k].getModel().Label));
        })["catch"](function (e) {
            onLocalUpdate(T('createws.fail').replace('%1', workspaceCreate[k].getModel().Label).replace('%2', e.message));
        });
    });
    return [];
}

function getWorkspacesSummary(state) {
    var workspaceMapping = state.workspaceMapping;
    var _state$workspaceCreate = state.workspaceCreate;
    var workspaceCreate = _state$workspaceCreate === undefined ? {} : _state$workspaceCreate;

    return React.createElement(
        "div",
        null,
        T('createws.summary'),
        Object.keys(workspaceMapping).length > 0 && React.createElement(
            "table",
            { style: { width: 400, marginTop: 6 } },
            React.createElement(
                "tr",
                null,
                React.createElement(
                    "td",
                    { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                    T('createws.head.pydio')
                ),
                React.createElement(
                    "td",
                    { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                    T('createws.head.cells')
                ),
                React.createElement(
                    "td",
                    { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                    T('createws.head.status')
                )
            ),
            Object.keys(workspaceMapping).map(function (k) {
                return React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "td",
                        { style: { padding: '2px 4px' } },
                        k
                    ),
                    React.createElement(
                        "td",
                        { style: { padding: '2px 4px' } },
                        workspaceMapping[k]
                    ),
                    React.createElement(
                        "td",
                        { style: { padding: '2px 4px' } },
                        workspaceCreate[k] ? T('createws.notexists') : T('createws.exists')
                    )
                );
            })
        )
    );
}

function getSharesAction(state, onLocalUpdate) {
    var cellAdmin = state.cellAdmin;
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;
    var workspaceMapping = state.workspaceMapping;
    var sharesFeatures = state.sharesFeatures;

    return [{
        name: "actions.etl.shares",
        params: _extends({
            left: "pydio8",
            right: "cells-local",
            mapping: JSON.stringify(workspaceMapping),
            url: url,
            user: user,
            cellAdmin: cellAdmin,
            skipVerify: skipVerify ? "true" : "false",
            password: pwd
        }, sharesFeatures)
    }];
}

function getSharesSummary(state) {
    var sharesFeatures = state.sharesFeatures;

    return React.createElement(
        "div",
        null,
        sharesFeatures && sharesFeatures.shareType && React.createElement(
            "div",
            null,
            sharesFeatures.shareType === 'LINK' ? T('share.linksonly') : T('share.cellsonly'),
            "."
        ),
        (!sharesFeatures || !sharesFeatures.shareType) && React.createElement(
            "div",
            null,
            T('share.all')
        ),
        sharesFeatures && sharesFeatures.ownerId && React.createElement(
            "div",
            null,
            T('share.user').replace('%s', sharesFeatures.ownerId)
        )
    );
}

function getMetadataAction(state, onLocalUpdate) {
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;
    var workspaceMapping = state.workspaceMapping;
    var metadataFeatures = state.metadataFeatures;
    var metadataMapping = state.metadataMapping;
    var metadataCreate = state.metadataCreate;

    var global = metadataFeatures.indexOf('watches') > -1 || metadataFeatures.indexOf('bookmarks') > -1;
    var files = metadataFeatures.indexOf('filesMeta') > -1;
    var filesAction = undefined,
        globalAction = undefined;
    var actions = [];
    if (global) {
        globalAction = {
            name: "actions.etl.p8-global-meta",
            params: {
                url: url, user: user, password: pwd,
                skipVerify: skipVerify ? "true" : "false",
                mapping: JSON.stringify(workspaceMapping)
            }
        };
        actions.push(globalAction);
    }
    if (files) {
        filesAction = {
            name: "actions.etl.p8-legacy-meta",
            params: {
                metaMapping: JSON.stringify(metadataMapping)
            }
        };
        actions.push(filesAction);
    }
    if (metadataCreate.length) {
        var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2["default"].getRestClient());
        var request = new _pydioHttpRestApi.IdmUpdateUserMetaNamespaceRequest();
        request.Operation = _pydioHttpRestApi.UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('PUT');
        request.Namespaces = metadataCreate;
        api.updateUserMetaNamespace(request).then(function (res) {
            onLocalUpdate(T('meta.success'));
        })["catch"](function (e) {
            onLocalUpdate(T('meta.fail').replace('%s', e.message));
        });
    }

    return actions;
}

function getMedataSummary(state) {
    var metadataFeatures = state.metadataFeatures;
    var metadataMapping = state.metadataMapping;

    return React.createElement(
        "div",
        null,
        metadataFeatures && React.createElement(
            "div",
            null,
            T('meta.summary'),
            " ",
            metadataFeatures.join(', ')
        ),
        metadataMapping && React.createElement(
            "div",
            null,
            T('meta.files'),
            React.createElement(
                "table",
                { style: { width: 400, marginTop: 6 } },
                React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "td",
                        { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                        T('createws.head.pydio')
                    ),
                    React.createElement(
                        "td",
                        { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                        T('createws.head.cells')
                    )
                ),
                Object.keys(metadataMapping).map(function (k) {
                    return React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "td",
                            { style: { padding: '2px 4px' } },
                            k
                        ),
                        React.createElement(
                            "td",
                            { style: { padding: '2px 4px' } },
                            metadataMapping[k]
                        )
                    );
                })
            )
        )
    );
}

},{"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","uuid4":43}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Dashboard = require('./Dashboard');

var _Dashboard2 = _interopRequireDefault(_Dashboard);

exports.Dashboard = _Dashboard2['default'];

},{"./Dashboard":44}],48:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var StepActions = (function (_React$Component) {
    _inherits(StepActions, _React$Component);

    function StepActions(props) {
        _classCallCheck(this, StepActions);

        _get(Object.getPrototypeOf(StepActions.prototype), "constructor", this).call(this, props);
        this.state = {
            show: false
        };
    }

    _createClass(StepActions, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this = this;

            setTimeout(function () {
                return _this.show();
            }, 451);
        }
    }, {
        key: "show",
        value: function show() {
            this.setState({ show: true });
        }
    }, {
        key: "render",
        value: function render() {
            var show = this.state.show;

            if (!show) {
                return _react2["default"].createElement("div", null);
            }

            return _react2["default"].createElement(
                "div",
                { style: { padding: "20px 2px 2px" } },
                this.props.children
            );
        }
    }]);

    return StepActions;
})(_react2["default"].Component);

exports["default"] = StepActions;
module.exports = exports["default"];

},{"react":"react"}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var StepCategories = (function (_React$Component) {
    _inherits(StepCategories, _React$Component);

    function StepCategories(props) {
        _classCallCheck(this, StepCategories);

        _get(Object.getPrototypeOf(StepCategories.prototype), 'constructor', this).call(this, props);
        this.state = {
            valid: false
        };
    }

    _createClass(StepCategories, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.categories.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var features = nextProps.features;

            this.setState({
                valid: Object.keys(features).reduce(function (valid, key) {
                    return valid || features[key].value;
                }, false)
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var features = _props.features;
            var onBack = _props.onBack;
            var onChange = _props.onChange;
            var onComplete = _props.onComplete;
            var summary = _props.summary;
            var styles = _props.styles;
            var summaryState = _props.summaryState;
            var hasRunning = _props.hasRunning;

            var remainingProps = _objectWithoutProperties(_props, ['features', 'onBack', 'onChange', 'onComplete', 'summary', 'styles', 'summaryState', 'hasRunning']);

            var valid = this.state.valid;

            var title = undefined,
                legend = undefined,
                boxes = undefined;
            if (summary) {
                title = this.T("summary");
                legend = this.T("summary.legend");
                boxes = [];
                Object.keys(features).forEach(function (k) {
                    var feature = features[k];
                    if (feature.value) {
                        boxes.push(_react2['default'].createElement(
                            'div',
                            { style: { padding: '6px 0' } },
                            _react2['default'].createElement(_materialUi.Checkbox, { label: feature.label, checked: true, labelStyle: { fontWeight: 500, fontSize: 15 } }),
                            feature.summary && _react2['default'].createElement(
                                'div',
                                { style: { marginLeft: 40, marginTop: 10 } },
                                feature.summary(summaryState)
                            ),
                            !feature.summary && _react2['default'].createElement(
                                'div',
                                { style: { marginLeft: 40, marginTop: 10 } },
                                _this.T('summary.empty')
                            )
                        ));
                    }
                });
            } else {
                title = this.T("choose");
                legend = this.T("choose.legend");
                boxes = Object.keys(features).map(function (k) {
                    var feature = features[k];

                    var featureProps = _objectWithoutProperties(feature, []);

                    return _react2['default'].createElement(
                        'div',
                        { style: { padding: feature.depends ? '6px 20px' : '6px 0' } },
                        _react2['default'].createElement(_materialUi.Checkbox, { label: feature.label, disabled: feature.depends && !features[feature.depends].value, checked: feature.value, onCheck: function (e, v) {
                                var changes = _defineProperty({}, k, _extends({}, featureProps, { value: v }));
                                if (!v) {
                                    // Disable depending features
                                    Object.keys(features).forEach(function (sub) {
                                        var subFeature = features[sub];
                                        if (subFeature.depends && subFeature.depends === k) {
                                            changes[sub] = _extends({}, subFeature, { value: false });
                                        }
                                    });
                                }
                                onChange(changes);
                            } })
                    );
                });
            }

            return _react2['default'].createElement(
                _materialUi.Step,
                remainingProps,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    title
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        legend
                    ),
                    _react2['default'].createElement(
                        'div',
                        null,
                        boxes
                    ),
                    _react2['default'].createElement(
                        _StepActions2['default'],
                        null,
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onBack();
                            },
                            label: this.T('back')
                        }),
                        '  ',
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            primary: true,
                            disabled: !valid || hasRunning,
                            onClick: function () {
                                return onComplete();
                            },
                            label: summary ? this.T('summary.launch') : this.T('next')
                        })
                    )
                )
            );
        }
    }]);

    return StepCategories;
})(_react2['default'].Component);

exports['default'] = StepCategories;
module.exports = exports['default'];

},{"./StepActions":48,"material-ui":"material-ui","pydio":"pydio","react":"react"}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var StepConnection = (function (_React$Component) {
    _inherits(StepConnection, _React$Component);

    function StepConnection(props) {
        _classCallCheck(this, StepConnection);

        _get(Object.getPrototypeOf(StepConnection.prototype), 'constructor', this).call(this, props);
        this.state = {};
    }

    _createClass(StepConnection, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.connection.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'testUrl',
        value: function testUrl(method, url, user, pwd) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) {
                        return;
                    }
                    if (xhr.status !== 200) {
                        reject(new Error(_this.T('fail').replace('%s', url)));
                        return;
                    }
                    resolve();
                };
                xhr.send();
            });
        }
    }, {
        key: 'handleNext',
        value: function handleNext() {
            var _this2 = this;

            var _props = this.props;
            var url = _props.url;
            var user = _props.user;
            var pwd = _props.pwd;
            var pydio = _props.pydio;
            var onComplete = _props.onComplete;

            if (!url || !user || !pwd) {
                this.setState({ error: this.T('missing') });
                return;
            }

            this.testUrl('GET', _pydioUtilLang2['default'].trimRight(url, '/') + '/api/v2/admin/workspaces', user, pwd).then(function () {

                pydio.UI.displayMessage("SUCCESS", _this2.T('success'));
                _this2.setState({ error: null });
                onComplete();
            })['catch'](function (e) {

                _this2.setState({ error: e.message });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props;
            var url = _props2.url;
            var user = _props2.user;
            var pwd = _props2.pwd;
            var skipVerify = _props2.skipVerify;
            var onChange = _props2.onChange;
            var styles = _props2.styles;
            var onBack = _props2.onBack;

            var remainingProps = _objectWithoutProperties(_props2, ['url', 'user', 'pwd', 'skipVerify', 'onChange', 'styles', 'onBack']);

            var error = this.state.error;

            return _react2['default'].createElement(
                _materialUi.Step,
                remainingProps,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    this.T('step.connection')
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        this.T('legend')
                    ),
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 1, style: { padding: 16, paddingTop: 24, margin: 3, width: 480 } },
                        _react2['default'].createElement(ModernTextField, { errorText: error, floatingLabelText: this.T('field.url'), hintText: "https://yourcompany.com/pydio", value: url, onChange: function (e, v) {
                                onChange({ url: v });
                            }, fullWidth: true, style: { marginTop: -10 } }),
                        _react2['default'].createElement(_materialUi.Checkbox, { label: this.T('field.skipssl'), checked: skipVerify, onCheck: function (e, v) {
                                onChange({ skipVerify: v });
                            } }),
                        _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', width: '100%' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { marginRight: 10, flex: 1 } },
                                _react2['default'].createElement(ModernTextField, { floatingLabelText: this.T('field.login'), value: user, onChange: function (e, v) {
                                        onChange({ user: v });
                                    }, fullWidth: true, inputStyle: { backgroundColor: '#fafafa' } })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { marginLeft: 10, flex: 1 } },
                                _react2['default'].createElement(ModernTextField, { floatingLabelText: this.T('field.pwd'), value: pwd, onChange: function (e, v) {
                                        onChange({ pwd: v });
                                    }, fullWidth: true, type: "password" })
                            )
                        )
                    ),
                    _react2['default'].createElement(
                        _StepActions2['default'],
                        null,
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onBack();
                            },
                            label: this.T('back')
                        }),
                        '  ',
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            primary: true,
                            onClick: function () {
                                return _this3.handleNext();
                            },
                            disabled: !url || !user || !pwd,
                            label: this.T('button.connect')
                        })
                    )
                )
            );
        }
    }]);

    return StepConnection;
})(_react2['default'].Component);

exports['default'] = StepConnection;
module.exports = exports['default'];

},{"./StepActions":48,"material-ui":"material-ui","pydio":"pydio","pydio/util/lang":"pydio/util/lang","react":"react"}],51:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _StepEmptyConfig = require('./StepEmptyConfig');

var _StepEmptyConfig2 = _interopRequireDefault(_StepEmptyConfig);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var StepDisclaimer = (function (_React$Component) {
    _inherits(StepDisclaimer, _React$Component);

    function StepDisclaimer() {
        _classCallCheck(this, StepDisclaimer);

        _get(Object.getPrototypeOf(StepDisclaimer.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(StepDisclaimer, [{
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var advanced = this.props.advanced;

            var content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'p',
                    { style: { border: '2px solid #C62828', color: '#C62828', borderRadius: 4, padding: 12, fontWeight: 500, marginBottom: 8 } },
                    this.T('step.disclaimer'),
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement('br', null),
                    this.T('step.disclaimer.' + (advanced ? "ed" : "home"))
                )
            );

            var otherButtons = [];
            if (advanced) {
                otherButtons.push(_react2['default'].createElement(_materialUi.RaisedButton, { label: this.T('step.disclaimer.support'), onTouchTap: function () {
                        window.open('https://pydio.com/en/user/login');
                    } }));
            } else {
                otherButtons.push(_react2['default'].createElement(_materialUi.RaisedButton, { label: this.T('step.disclaimer.quote'), onTouchTap: function () {
                        window.open('https://pydio.com/en/pricing/contact');
                    } }));
            }

            return _react2['default'].createElement(_StepEmptyConfig2['default'], _extends({}, this.props, { title: this.T('step.disclaimer.title'), legend: content, nextLabel: this.T('step.disclaimer.start'), otherButtons: otherButtons }));
        }
    }]);

    return StepDisclaimer;
})(_react2['default'].Component);

exports['default'] = StepDisclaimer;
module.exports = exports['default'];

},{"./StepEmptyConfig":52,"material-ui":"material-ui","pydio":"pydio","react":"react"}],52:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var StepEmptyConfig = (function (_React$Component) {
    _inherits(StepEmptyConfig, _React$Component);

    function StepEmptyConfig(props) {
        _classCallCheck(this, StepEmptyConfig);

        _get(Object.getPrototypeOf(StepEmptyConfig.prototype), 'constructor', this).call(this, props);
    }

    _createClass(StepEmptyConfig, [{
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var onBack = _props.onBack;
            var onComplete = _props.onComplete;
            var nextLabel = _props.nextLabel;
            var legend = _props.legend;
            var styles = _props.styles;
            var otherButtons = _props.otherButtons;
            var _props2 = this.props;
            var title = _props2.title;

            var remainingProps = _objectWithoutProperties(_props2, ['title']);

            return _react2['default'].createElement(
                _materialUi.Step,
                remainingProps,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    title
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        legend
                    ),
                    _react2['default'].createElement(
                        _StepActions2['default'],
                        null,
                        otherButtons,
                        onBack && _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onBack();
                            },
                            label: this.T('back')
                        }),
                        '  ',
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            primary: true,
                            onClick: function () {
                                return onComplete();
                            },
                            label: nextLabel || this.T('next')
                        })
                    )
                )
            );
        }
    }]);

    return StepEmptyConfig;
})(_react2['default'].Component);

exports['default'] = StepEmptyConfig;
module.exports = exports['default'];

},{"./StepActions":48,"material-ui":"material-ui","pydio":"pydio","react":"react"}],53:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var _workspacesLoader = require("../workspaces/Loader");

var _workspacesLoader2 = _interopRequireDefault(_workspacesLoader);

var _workspacesMetadataMapper = require("../workspaces/MetadataMapper");

var _workspacesMetadataMapper2 = _interopRequireDefault(_workspacesMetadataMapper);

var StepMetadata = (function (_React$Component) {
    _inherits(StepMetadata, _React$Component);

    function StepMetadata(props) {
        _classCallCheck(this, StepMetadata);

        _get(Object.getPrototypeOf(StepMetadata.prototype), 'constructor', this).call(this, props);

        this.state = {
            features: {
                "watches": { label: this.T('feature.watches'), checked: true },
                "bookmarks": { label: this.T('feature.bookmark'), checked: true },
                "filesMeta": { label: this.T('feature.files'), checked: true }
            }
        };
    }

    _createClass(StepMetadata, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.meta.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            var loader = new _workspacesLoader2['default']();
            var _props = this.props;
            var url = _props.url;
            var user = _props.user;
            var pwd = _props.pwd;

            loader.loadWorkspaces(url, user, pwd)['catch'](function (err) {
                _this.setState({ err: err });
            }).then(function (workspaces) {
                _this.setState({ workspaces: workspaces }, function () {
                    _this.exportFeatures();
                });
            });
        }
    }, {
        key: 'exportFeatures',
        value: function exportFeatures() {
            var features = this.state.features;
            var onChange = this.props.onChange;

            var c = [];
            Object.keys(features).forEach(function (k) {
                if (features[k].checked) {
                    c.push(k);
                }
            });
            onChange({ metadataFeatures: c });
        }
    }, {
        key: 'toggle',
        value: function toggle(featureName, checked) {
            var _this2 = this;

            var features = this.state.features;

            features[featureName].checked = checked;
            this.setState({ features: features }, function () {
                _this2.exportFeatures();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props;
            var pydio = _props2.pydio;
            var onBack = _props2.onBack;
            var onChange = _props2.onChange;
            var onComplete = _props2.onComplete;
            var styles = _props2.styles;
            var _state = this.state;
            var workspaces = _state.workspaces;
            var err = _state.err;
            var features = _state.features;

            return _react2['default'].createElement(
                _materialUi.Step,
                this.props,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    this.T('title')
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        this.T('legend')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '10px 0' } },
                        Object.keys(features).map(function (k) {
                            var f = features[k];
                            return _react2['default'].createElement(_materialUi.Checkbox, { style: { padding: '6px 0' }, label: f.label, checked: f.checked, onCheck: function (e, v) {
                                    _this3.toggle(k, v);
                                } });
                        })
                    ),
                    workspaces && features['filesMeta'].checked && _react2['default'].createElement(_workspacesMetadataMapper2['default'], {
                        pydio: pydio,
                        workspaces: workspaces,
                        onMapped: function (data) {
                            var mapping = data.mapping;
                            var create = data.create;

                            onChange({ metadataMapping: mapping, metadataCreate: create });
                        }
                    }),
                    err && _react2['default'].createElement(
                        'div',
                        null,
                        err.message
                    ),
                    _react2['default'].createElement(
                        _StepActions2['default'],
                        null,
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onBack();
                            },
                            label: this.T('back')
                        }),
                        '  ',
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onComplete();
                            },
                            label: this.T('next'),
                            primary: true
                        })
                    )
                )
            );
        }
    }]);

    return StepMetadata;
})(_react2['default'].Component);

exports['default'] = StepMetadata;
module.exports = exports['default'];

},{"../workspaces/Loader":58,"../workspaces/MetadataMapper":60,"./StepActions":48,"material-ui":"material-ui","pydio":"pydio","react":"react"}],54:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _StepEmptyConfig = require('./StepEmptyConfig');

var _StepEmptyConfig2 = _interopRequireDefault(_StepEmptyConfig);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var StepPrerequisites = (function (_React$Component) {
    _inherits(StepPrerequisites, _React$Component);

    function StepPrerequisites() {
        _classCallCheck(this, StepPrerequisites);

        _get(Object.getPrototypeOf(StepPrerequisites.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(StepPrerequisites, [{
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var advanced = this.props.advanced;

            var content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'p',
                    null,
                    this.T('step.prereq.welcome'),
                    _react2['default'].createElement('br', null),
                    this.T('step.prereq.check')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { border: '2px solid rgb(96, 125, 138)', borderRadius: 8, padding: '8px 16px', flex: 1, marginRight: 8 } },
                        _react2['default'].createElement(
                            'h4',
                            { style: { color: '#607D8B', paddingTop: 0 } },
                            this.T('step.prereq.step1')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.check.adminpydio')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.check.install'),
                            ' : ',
                            _react2['default'].createElement(
                                'a',
                                { href: "https://download.pydio.com/pub/plugins/archives/action.migration.tar.gz", target: "_blank" },
                                _react2['default'].createElement(_materialUi.FontIcon, { style: { fontSize: 'inherit' }, className: "mdi mdi-open-in-new" })
                            )
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { border: '2px solid rgb(96, 125, 138)', borderRadius: 8, padding: '8px 16px', flex: 1 } },
                        _react2['default'].createElement(
                            'h4',
                            { style: { color: '#607D8B', paddingTop: 0 } },
                            this.T('step.prereq.step2')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.check.admincell')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.check.copy')
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { border: '2px solid rgb(96, 125, 138)', borderRadius: 8, padding: '8px 16px', flex: 1, marginLeft: 8 } },
                        _react2['default'].createElement(
                            'h4',
                            { style: { color: '#607D8B', paddingTop: 0 } },
                            this.T('step.prereq.step3')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.ds.create')
                        ),
                        advanced && _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.ds.tpl.ed')
                        ),
                        !advanced && _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-alert", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.ds.tpl.home')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check", style: { fontSize: 'inherit' } }),
                            ' ',
                            this.T('step.prereq.ds.done')
                        )
                    )
                )
            );

            return _react2['default'].createElement(_StepEmptyConfig2['default'], _extends({}, this.props, { title: this.T('step.prereq.title'), legend: content, nextLabel: this.T('step.prereq.start') }));
        }
    }]);

    return StepPrerequisites;
})(_react2['default'].Component);

exports['default'] = StepPrerequisites;
module.exports = exports['default'];

},{"./StepEmptyConfig":52,"material-ui":"material-ui","pydio":"pydio","react":"react"}],55:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _StepActions = require('./StepActions');

var _StepActions2 = _interopRequireDefault(_StepActions);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var StepShares = (function (_React$Component) {
    _inherits(StepShares, _React$Component);

    function StepShares(props) {
        _classCallCheck(this, StepShares);

        _get(Object.getPrototypeOf(StepShares.prototype), 'constructor', this).call(this, props);

        this.state = {
            features: {
                "links": { label: this.T('feature.links'), checked: true },
                "cells": { label: this.T('feature.cells'), checked: true }
            },
            ownerId: ''
        };
    }

    _createClass(StepShares, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.shares.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'exportFeatures',
        value: function exportFeatures() {
            var _state = this.state;
            var features = _state.features;
            var ownerId = _state.ownerId;
            var onChange = this.props.onChange;

            var state = {};
            if (!features.links.checked || !features.cells.checked) {
                state.shareType = features.links.checked ? 'LINK' : 'CELL';
            }
            if (ownerId) {
                state.ownerId = ownerId;
            }
            onChange({ sharesFeatures: state });
        }
    }, {
        key: 'toggle',
        value: function toggle(featureName, checked) {
            var _this = this;

            var features = this.state.features;

            features[featureName].checked = checked;
            if (!features.links.checked && !features.cells.checked) {
                alert(this.T('alert'));
                return;
            }
            this.setState({ features: features }, function () {
                _this.exportFeatures();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var onBack = _props.onBack;
            var onComplete = _props.onComplete;
            var styles = _props.styles;
            var _state2 = this.state;
            var features = _state2.features;
            var ownerId = _state2.ownerId;

            return _react2['default'].createElement(
                _materialUi.Step,
                this.props,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    this.T('title')
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        this.T('legend')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        this.T('legend.warning')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { marginTop: 10 } },
                        this.T('restrict.type')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '10px 0' } },
                        Object.keys(features).map(function (k) {
                            var f = features[k];
                            return _react2['default'].createElement(_materialUi.Checkbox, { style: { padding: '6px 0' }, label: f.label, checked: f.checked, onCheck: function (e, v) {
                                    _this2.toggle(k, v);
                                } });
                        })
                    ),
                    _react2['default'].createElement(
                        'div',
                        null,
                        this.T('restrict.user')
                    ),
                    _react2['default'].createElement(ModernTextField, { hintText: this.T('restrict.user.login'), value: ownerId, onChange: function (e, v) {
                            _this2.setState({ ownerId: v }, function () {
                                _this2.exportFeatures();
                            });
                        } }),
                    _react2['default'].createElement(
                        _StepActions2['default'],
                        null,
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onBack();
                            },
                            label: this.T('back')
                        }),
                        '  ',
                        _react2['default'].createElement(_materialUi.RaisedButton, {
                            onClick: function () {
                                return onComplete();
                            },
                            label: this.T('next'),
                            disabled: !features.links.checked && !features.cells.checked,
                            primary: true
                        })
                    )
                )
            );
        }
    }]);

    return StepShares;
})(_react2['default'].Component);

exports['default'] = StepShares;
module.exports = exports['default'];

},{"./StepActions":48,"material-ui":"material-ui","pydio":"pydio","react":"react"}],56:[function(require,module,exports){
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

var _workspacesLoader = require("../workspaces/Loader");

var _workspacesLoader2 = _interopRequireDefault(_workspacesLoader);

var _workspacesMapper = require("../workspaces/Mapper");

var _workspacesMapper2 = _interopRequireDefault(_workspacesMapper);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var StepWorkspaces = (function (_React$Component) {
    _inherits(StepWorkspaces, _React$Component);

    function StepWorkspaces(props) {
        _classCallCheck(this, StepWorkspaces);

        _get(Object.getPrototypeOf(StepWorkspaces.prototype), 'constructor', this).call(this, props);
        this._loader = new _workspacesLoader2['default']();

        this.state = {
            loaded: false,
            workspaces: [],
            cellsWorkspaces: []
        };
    }

    _createClass(StepWorkspaces, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.ws.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            var _props = this.props;
            var url = _props.url;
            var user = _props.user;
            var pwd = _props.pwd;

            AdminWorkspaces.Workspace.listWorkspaces().then(function (wsResponse) {
                _this.setState({ cellsWorkspaces: wsResponse.Workspaces || [] });
            }).then(function () {
                _this._loader.loadWorkspaces(url, user, pwd)['catch'](function (err) {
                    _this.setState({ err: err, loaded: true });
                }).then(function (workspaces) {
                    _this.setState({ workspaces: workspaces, loaded: true });
                });
            });
        }
    }, {
        key: 'startListeningToJob',
        value: function startListeningToJob() {
            var _this2 = this;

            this._loader = new _workspacesLoader2['default']();
            this._loader.observe('progress', function (memo) {
                _this2.setState({ workspacesProgress: memo });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var onChange = _props2.onChange;
            var onComplete = _props2.onComplete;
            var onBack = _props2.onBack;
            var openRightPane = _props2.openRightPane;
            var closeRightPane = _props2.closeRightPane;
            var pydio = _props2.pydio;
            var styles = _props2.styles;
            var _state = this.state;
            var workspaces = _state.workspaces;
            var cellsWorkspaces = _state.cellsWorkspaces;
            var loaded = _state.loaded;

            if (!loaded) {
                return _react2['default'].createElement(
                    _materialUi.Step,
                    this.props,
                    _react2['default'].createElement(
                        _materialUi.StepLabel,
                        null,
                        this.T('title'),
                        ' ',
                        this.T('loading')
                    ),
                    _react2['default'].createElement(
                        _materialUi.StepContent,
                        null,
                        _react2['default'].createElement(
                            'div',
                            { style: { textAlign: 'center', padding: 40 } },
                            _react2['default'].createElement(_materialUi.CircularProgress, { mode: "indeterminate" })
                        )
                    )
                );
            }

            return _react2['default'].createElement(
                _materialUi.Step,
                this.props,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    this.T('title')
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        this.T('legend'),
                        _react2['default'].createElement(
                            'ul',
                            null,
                            _react2['default'].createElement(
                                'li',
                                null,
                                this.T('step1')
                            ),
                            _react2['default'].createElement(
                                'li',
                                null,
                                this.T('step2')
                            ),
                            _react2['default'].createElement(
                                'li',
                                null,
                                this.T('step3')
                            ),
                            _react2['default'].createElement(
                                'li',
                                null,
                                this.T('step4')
                            )
                        )
                    ),
                    _react2['default'].createElement(_workspacesMapper2['default'], {
                        cellsWorkspaces: cellsWorkspaces,
                        workspaces: workspaces.filter(function (ws) {
                            return (ws.accessType === 'fs' || ws.accessType === 's3') && !ws.isTemplate;
                        }),
                        onBack: function () {
                            return onBack();
                        },
                        pydio: pydio,
                        openRightPane: openRightPane,
                        closeRightPane: closeRightPane,
                        onMapped: function (data) {
                            var mapping = data.mapping;
                            var create = data.create;
                            var existing = data.existing;

                            onChange({ workspaceMapping: mapping, workspaceCreate: create, workspaceExisting: existing });
                            onComplete();
                        }
                    })
                )
            );
        }
    }]);

    return StepWorkspaces;
})(_react2['default'].Component);

exports['default'] = StepWorkspaces;
module.exports = exports['default'];

},{"../workspaces/Loader":58,"../workspaces/Mapper":59,"material-ui":"material-ui","pydio":"pydio","react":"react"}],57:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Connect = (function (_React$Component) {
    _inherits(Connect, _React$Component);

    function Connect(props) {
        _classCallCheck(this, Connect);

        _get(Object.getPrototypeOf(Connect.prototype), 'constructor', this).call(this, props);
    }

    _createClass(Connect, [{
        key: 'getLeftGridY',
        value: function getLeftGridY() {
            var _props = this.props;
            var dotsRadius = _props.dotsRadius;
            var subheaderHeight = _props.subheaderHeight;
            var leftGridHeight = _props.leftGridHeight;
            var leftGridOffset = _props.leftGridOffset;

            return leftGridHeight / 2 + dotsRadius + subheaderHeight + leftGridOffset;
        }
    }, {
        key: 'getRightGridY',
        value: function getRightGridY() {
            var _props2 = this.props;
            var dotsRadius = _props2.dotsRadius;
            var subheaderHeight = _props2.subheaderHeight;
            var rightGridHeight = _props2.rightGridHeight;
            var rightGridOffset = _props2.rightGridOffset;

            return rightGridHeight / 2 + dotsRadius + subheaderHeight + rightGridOffset;
        }

        /**
         *
         * @param ctx {CanvasRenderingContext2D}
         * @param offsetX int
         * @param offsetY int
         * @param gridHeight int
         * @param dotsNumber int
         */
    }, {
        key: 'drawGrid',
        value: function drawGrid(ctx, offsetX, offsetY, gridHeight, dotsNumber) {
            var dotsRadius = this.props.dotsRadius;

            ctx.strokeStyle = 'rgba(204, 204, 204, 0.6)';
            ctx.beginPath();
            for (var i = 0; i < dotsNumber; i++) {
                var centerX = offsetX;
                var centerY = offsetY + i * gridHeight;
                ctx.moveTo(centerX + dotsRadius, centerY);
                ctx.arc(centerX, centerY, dotsRadius, 0, Math.PI * 2, true);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
            }
            ctx.stroke();
        }

        /**
         *
         * @param ctx {CanvasRenderingContext2D}
         * @param leftDotIndex int
         * @param rightDotIndex int
         * @param color
         */
    }, {
        key: 'linkDots',
        value: function linkDots(ctx, leftDotIndex, rightDotIndex) {
            var color = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];
            var _props3 = this.props;
            var leftGridX = _props3.leftGridX;
            var rightGridX = _props3.rightGridX;
            var dotsRadius = _props3.dotsRadius;
            var leftGridHeight = _props3.leftGridHeight;
            var rightGridHeight = _props3.rightGridHeight;

            var leftGridY = this.getLeftGridY();
            var rightGridY = this.getRightGridY();

            ctx.strokeStyle = color || '#9e9e9e';
            ctx.beginPath();
            var leftDotCenterX = leftGridX + dotsRadius;
            var leftDotCenterY = leftGridY + leftDotIndex * leftGridHeight;

            var rightDotCenterX = rightGridX - dotsRadius;
            var rightDotCenterY = rightGridY + rightDotIndex * rightGridHeight;
            ctx.moveTo(leftDotCenterX, leftDotCenterY);
            var cpointDiff = (rightDotCenterX - leftDotCenterX) * 3 / 5;
            ctx.bezierCurveTo(leftDotCenterX + cpointDiff, leftDotCenterY, rightDotCenterX - cpointDiff, rightDotCenterY, rightDotCenterX, rightDotCenterY);
            ctx.stroke();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.buildCanvas(this.props);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.buildCanvas(nextProps);
        }
    }, {
        key: 'buildCanvas',
        value: function buildCanvas(props) {
            var canvas = this.canvas;
            if (!canvas.getContext) {
                return null;
            }

            var leftGridX = props.leftGridX;
            var rightGridX = props.rightGridX;
            var leftGridHeight = props.leftGridHeight;
            var rightGridHeight = props.rightGridHeight;

            var leftGridY = this.getLeftGridY();
            var rightGridY = this.getRightGridY();

            var leftNumber = props.leftNumber;
            var rightNumber = props.rightNumber;
            var links = props.links;

            var ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#757575';

            this.drawGrid(ctx, leftGridX, leftGridY, leftGridHeight, leftNumber);
            this.drawGrid(ctx, rightGridX, rightGridY, rightGridHeight, rightNumber);

            for (var i = 0; i < links.length; i++) {
                this.linkDots(ctx, links[i].left, links[i].right, links[i].color);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props4 = this.props;
            var dotsRadius = _props4.dotsRadius;
            var rightGridX = _props4.rightGridX;
            var leftGridHeight = _props4.leftGridHeight;
            var rightGridHeight = _props4.rightGridHeight;
            var subheaderHeight = _props4.subheaderHeight;
            var leftGridOffset = _props4.leftGridOffset;
            var rightGridOffset = _props4.rightGridOffset;
            var _props5 = this.props;
            var leftNumber = _props5.leftNumber;
            var rightNumber = _props5.rightNumber;
            var style = _props5.style;

            var width = rightGridX + dotsRadius + 2;
            var height = Math.max(leftNumber * leftGridHeight + leftGridOffset, rightNumber * rightGridHeight + rightGridOffset) + subheaderHeight;

            return _react2['default'].createElement('canvas', { style: _extends({}, style, { background: "transparent", width: width, height: height }), ref: function (canvas) {
                    return _this.canvas = canvas;
                }, height: height, width: width });
        }
    }]);

    return Connect;
})(_react2['default'].Component);

Connect.defaultProps = {
    dotsRadius: 4,
    subheaderHeight: 40,
    leftGridX: 10,
    leftGridHeight: 72,
    leftGridOffset: 0,
    rightGridX: 140,
    rightGridHeight: 72,
    rightGridOffset: 0
};

exports['default'] = Connect;
module.exports = exports['default'];

},{"react":"react"}],58:[function(require,module,exports){
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

var _pydioSdkJs = require('pydio-sdk-js');

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Loader = (function (_Observable) {
    _inherits(Loader, _Observable);

    function Loader() {
        _classCallCheck(this, Loader);

        _get(Object.getPrototypeOf(Loader.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Loader, [{
        key: 'loadWorkspaces',

        /**
         * Load workspaces from Pydio 8 instance.
         * This instance must have CORS enabled ! See github.com/pydio/pydio-core branch #test-cors
         * @return {Promise<any>}
         */
        value: function loadWorkspaces(url, user, pwd) {
            var _this = this;

            var api = new _pydioSdkJs.ProvisioningApi();
            api.apiClient.basePath = _pydioUtilLang2['default'].trimRight(url, '/') + "/api/v2";
            api.apiClient.authentications = {
                "basicAuth": { type: 'basic', username: user, password: pwd }
            };
            this.notify('progress', { max: 10, value: 0 });
            return api.adminListWorkspaces().then(function (res) {
                if (!res || !res.data || !res.data.children) {
                    _this.notify('progress', { max: 10, value: 10 });
                    return [];
                }
                var nodes = res.data.children;
                var wsProms = [];
                var pg = 1;
                var keys = Object.keys(nodes).map(function (k) {
                    return k === '/' ? "0" : k;
                });
                var max = keys.length + 1;
                _this.notify('progress', { max: max, value: pg });
                keys.forEach(function (k) {
                    wsProms.push(api.adminGetWorkspace(k + '', { format: 'json' }).then(function (res) {
                        pg++;
                        _this.notify('progress', { max: max, value: pg });
                        return res && res.id ? res : null;
                    })['catch'](function (e) {
                        pg++;
                        _this.notify('progress', { max: max, value: pg });
                    }));
                });
                return Promise.all(wsProms).then(function (multiRes) {
                    return multiRes.filter(function (v) {
                        return v !== null;
                    });
                });
            });
        }

        /**
         *
         * @return {Request|PromiseLike<T>|Promise<T>}
         */
    }, {
        key: 'loadTemplatePaths',
        value: function loadTemplatePaths() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.listVirtualNodes().then(function (collection) {
                return collection.Children || [];
            });
        }

        /**
         *
         * @return {Promise<ObjectDataSource>}
         */
    }, {
        key: 'loadDataSources',
        value: function loadDataSources() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.listDataSources().then(function (res) {
                return res.DataSources || [];
            });
        }

        /**
         *
         * @return {Promise<ObjectDataSource>}
         */
    }, {
        key: 'loadCellsWorkspaces',
        value: function loadCellsWorkspaces() {
            var api = new _pydioHttpRestApi.WorkspaceServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestSearchWorkspaceRequest();
            var single = new _pydioHttpRestApi.IdmWorkspaceSingleQuery();
            single.scope = _pydioHttpRestApi.IdmWorkspaceScope.constructFromObject('ADMIN');
            request.Queries = [single];
            return api.searchWorkspaces(request).then(function (res) {
                return res.Workspaces || [];
            });
        }

        /**
         * Gather meta.user info from workspaces
         * @param workspaces [AdminWorkspace]
         */
    }], [{
        key: 'parseUserMetaDefinitions',
        value: function parseUserMetaDefinitions(workspaces) {
            var metas = [];
            var factorized = [];
            var links = [];
            workspaces.forEach(function (ws) {
                if (!ws.features || !ws.features["meta.user"]) {
                    return;
                }
                var meta = ws.features["meta.user"];
                var i = 0;
                var suffix = "";
                var base = "meta_fields";
                while (meta[base + suffix]) {
                    var type = meta["meta_types" + suffix] || "string";
                    if (meta["meta_labels" + suffix] && type !== 'creator' && type !== 'updater') {
                        (function () {
                            var name = meta[base + suffix];
                            var label = meta["meta_labels" + suffix];
                            var additional = meta["meta_additional" + suffix];
                            var newMeta = { name: name, label: label, type: type, additional: additional, ws: ws };
                            metas.push(newMeta);
                            var left = metas.length - 1;
                            var right = undefined;
                            var otherWs = factorized.filter(function (m) {
                                return m.type === newMeta.type && m.ws !== newMeta.ws && (newMeta.type !== 'choice' || newMeta.additional === m.additional);
                            });
                            if (!otherWs.length) {
                                var facMeta = _extends({}, newMeta, { namespace: 'usermeta-' + _pydioUtilLang2['default'].computeStringSlug(newMeta.name) });
                                factorized.push(facMeta);
                                right = factorized.length - 1;
                            } else {
                                right = factorized.indexOf(otherWs[0]);
                            }
                            links.push({ left: left, right: right });
                        })();
                    }
                    i++;
                    suffix = "_" + i;
                }
            });
            return { metas: metas, factorized: factorized, links: links };
        }
    }]);

    return Loader;
})(_pydioLangObservable2['default']);

exports['default'] = Loader;
module.exports = exports['default'];

},{"pydio-sdk-js":13,"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","pydio/util/lang":"pydio/util/lang"}],59:[function(require,module,exports){
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

var _Ws2Datasources = require('./Ws2Datasources');

var _Ws2Datasources2 = _interopRequireDefault(_Ws2Datasources);

var _materialUi = require('material-ui');

var _Loader = require("./Loader");

var _Loader2 = _interopRequireDefault(_Loader);

var _Ws2TemplatePaths = require("./Ws2TemplatePaths");

var _Ws2TemplatePaths2 = _interopRequireDefault(_Ws2TemplatePaths);

var _Ws2RootNodes = require("./Ws2RootNodes");

var _Ws2RootNodes2 = _interopRequireDefault(_Ws2RootNodes);

var _Pydio8Workspaces = require("./Pydio8Workspaces");

var _Pydio8Workspaces2 = _interopRequireDefault(_Pydio8Workspaces);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _PathTree = require('./PathTree');

var _PathTree2 = _interopRequireDefault(_PathTree);

var _Connect = require('./Connect');

var _Connect2 = _interopRequireDefault(_Connect);

var styles = {
    button: {
        margin: "0 10px 0"
    },
    addButton: {
        animation: "joyride-beacon-outer 1.2s infinite ease-in-out",
        color: "rgba(255, 215, 0, 1)",
        boxShadow: "1px",
        marginTop: -3
    },
    connect: {
        marginLeft: -9,
        marginRight: -5,
        zIndex: 2,
        marginTop: 30
    }
};

var WorkspaceMapper = (function (_React$Component) {
    _inherits(WorkspaceMapper, _React$Component);

    function WorkspaceMapper(props) {
        _classCallCheck(this, WorkspaceMapper);

        _get(Object.getPrototypeOf(WorkspaceMapper.prototype), 'constructor', this).call(this, props);
        var workspaces = props.workspaces;
        var cellsWorkspaces = props.cellsWorkspaces;

        // remove ones already mapped
        var filtered = workspaces.filter(function (workspace) {
            return cellsWorkspaces.filter(function (cW) {
                return cW.UUID === workspace.id;
            }).length === 0;
        });
        var mappedWorkspaces = workspaces.filter(function (workspace) {
            return cellsWorkspaces.filter(function (cW) {
                return cW.UUID === workspace.id;
            }).length > 0;
        });
        var correspondingWorkspaces = cellsWorkspaces.filter(function (ws) {
            return workspaces.filter(function (w) {
                return w.id === ws.UUID;
            }).length > 0;
        });
        this.state = {
            cellsWorkspaces: [].concat(_toConsumableArray(correspondingWorkspaces)),
            workspaces: filtered,
            mappedWorkspaces: mappedWorkspaces,
            showDatasources: true,
            showTemplatePaths: true,
            datasources: [],
            templatePaths: [],
            offset: 0,
            limit: 10
        };
        this.loader = new _Loader2['default']();
    }

    _createClass(WorkspaceMapper, [{
        key: 'T',
        value: function T(id) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['migration.step.mapper.' + id] || pydio.MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadDatasources();
            this.loadTemplatePaths();
        }
    }, {
        key: 'loadDatasources',
        value: function loadDatasources() {
            var _this = this;

            this.loader.loadDataSources().then(function (datasources) {
                _this.setState({ datasources: datasources });
            });
        }
    }, {
        key: 'loadTemplatePaths',
        value: function loadTemplatePaths() {
            var _this2 = this;

            this.loader.loadTemplatePaths().then(function (templatePaths) {
                _this2.setState({ templatePaths: [null].concat(_toConsumableArray(templatePaths)) });
            });
        }
    }, {
        key: 'toggleRemap',
        value: function toggleRemap(check, cellsWorkspace) {
            var _state = this.state;
            var workspaces = _state.workspaces;
            var mappedWorkspaces = _state.mappedWorkspaces;

            var propsWorkspaces = this.props.workspaces;

            var newWs = undefined,
                newMapped = undefined;
            var workspace = propsWorkspaces.filter(function (ws) {
                return ws.id === cellsWorkspace.UUID;
            })[0];
            if (check) {
                newWs = workspaces.filter(function (ws) {
                    return ws.id !== cellsWorkspace.UUID;
                });
                newMapped = [].concat(_toConsumableArray(mappedWorkspaces), [workspace]);
            } else {
                newWs = [].concat(_toConsumableArray(workspaces), [workspace]);
                newMapped = mappedWorkspaces.filter(function (ws) {
                    return ws.id !== cellsWorkspace.UUID;
                });
            }
            this.setState({ workspaces: newWs, mappedWorkspaces: newMapped });
        }
    }, {
        key: 'getLinks',
        value: function getLinks(arr1, arr2, comp, color) {
            return arr1.reduce(function (res1, v1, idx1) {
                return [].concat(_toConsumableArray(res1), _toConsumableArray(arr2.reduce(function (res2, v2, idx2) {
                    var entry = comp(v1, v2);
                    if (!entry) {
                        return res2;
                    }

                    return [].concat(_toConsumableArray(res2), [{
                        left: idx1,
                        right: idx2,
                        color: color(entry)
                    }]);
                }, [])));
            }, []);
        }
    }, {
        key: 'handleSelectWorkspace',
        value: function handleSelectWorkspace(ws) {
            this.setState({
                selected: ws
            });
        }
    }, {
        key: 'handleSelectDatasource',
        value: function handleSelectDatasource(ds) {
            var selected = this.state.selected;

            var mapping = this.mapping;

            var newMapping = mapping.map(function (map) {
                if (map.workspace === selected) {
                    delete map.datasource;
                    delete map.templatePath;

                    return _extends({}, map, {
                        datasource: ds
                    });
                }

                return map;
            });

            this.setState({
                mapping: newMapping
            });
        }
    }, {
        key: 'handleSelectTemplatePath',
        value: function handleSelectTemplatePath(tp) {
            var _state2 = this.state;
            var datasources = _state2.datasources;
            var selected = _state2.selected;

            var mapping = this.mapping;

            // Retrieve datasource
            var datasourceName = getDatasource(removeComments(tp.MetaStore.resolution));

            var ds = datasources.filter(function (ds) {
                return ds.Name === datasourceName;
            })[0];

            var newMapping = mapping.map(function (map) {
                if (map.workspace === selected) {
                    delete map.datasource;
                    delete map.templatePath;

                    return _extends({}, map, {
                        datasource: ds,
                        templatePath: tp
                    });
                }

                return map;
            });

            this.setState({
                mapping: newMapping,
                selected: null
            });
        }
    }, {
        key: 'handleSelectRootNode',
        value: function handleSelectRootNode(ws, node) {
            var mapping = this.mapping;

            var newMapping = mapping.map(function (map) {
                if (map.workspace === ws) {
                    return _extends({}, map, {
                        rootNode: node,
                        valid: true
                    });
                }
                return map;
            });

            this.setState({
                mapping: newMapping
            });
        }
    }, {
        key: 'handleInvalidRootNode',
        value: function handleInvalidRootNode(ws) {
            var mapping = this.mapping;

            var newMapping = mapping.map(function (map) {
                if (map.workspace === ws) {
                    return _extends({}, map, {
                        valid: false
                    });
                }
                return map;
            });

            this.setState({
                mapping: newMapping
            });
        }
    }, {
        key: 'handleShowPath',
        value: function handleShowPath(ws) {
            this.setState({
                highlight: ws
            });
        }
    }, {
        key: 'handleHidePath',
        value: function handleHidePath() {
            var state = this.state;
            delete state.highlight;
            this.setState(state);
        }
    }, {
        key: 'handleShowDatasources',
        value: function handleShowDatasources() {
            this.setState({
                showDatasources: true
            });
        }
    }, {
        key: 'handleHideDatasources',
        value: function handleHideDatasources() {
            this.setState({
                showDatasources: false
            });
        }
    }, {
        key: 'handleShowTemplatePaths',
        value: function handleShowTemplatePaths() {
            this.setState({
                showTemplatePaths: true
            });
        }
    }, {
        key: 'handleHideTemplatePaths',
        value: function handleHideTemplatePaths() {
            this.setState({
                showTemplatePaths: false
            });
        }
    }, {
        key: 'handleCreateDatasource',
        value: function handleCreateDatasource() {
            var _this3 = this;

            var selected = this.state.selected;
            var _props = this.props;
            var pydio = _props.pydio;
            var openRightPane = _props.openRightPane;
            var closeRightPane = _props.closeRightPane;
            var display = selected.display;
            var accessType = selected.accessType;
            var parameters = selected.parameters;

            var presetDataSource = undefined;

            if (accessType === 's3') {
                presetDataSource = new _pydioHttpRestApi.ObjectDataSource();
                presetDataSource.Name = _pydioUtilLang2['default'].computeStringSlug(display).replace(/-/g, "");
                presetDataSource.StorageType = 'S3';
                presetDataSource.ApiKey = parameters['API_KEY'];
                presetDataSource.ApiSecret = parameters['SECRET_KEY'];
                presetDataSource.ObjectsBucket = parameters['CONTAINER'];
                presetDataSource.StorageConfiguration = {};
                if (parameters['STORAGE_URL']) {
                    presetDataSource.StorageConfiguration = { customEndpoint: parameters['STORAGE_URL'] };
                }
                if (parameters['PATH']) {
                    presetDataSource.ObjectsBaseFolder = parameters['PATH'];
                }
            } else if (accessType === 'fs') {
                presetDataSource = new _pydioHttpRestApi.ObjectDataSource();

                var path = parameters['PATH'] || "";

                if (selected) {
                    path = this.mapping.filter(function (_ref) {
                        var workspace = _ref.workspace;
                        return workspace === selected;
                    })[0].datasourcePath;
                }

                presetDataSource.Name = _pydioUtilLang2['default'].computeStringSlug(path.substr(1)).replace(/-/g, "");
                presetDataSource.StorageConfiguration = {};
                presetDataSource.StorageConfiguration.folder = path;
            }
            openRightPane({
                COMPONENT: AdminWorkspaces.DataSourceEditor,
                PROPS: {
                    ref: "editor",
                    pydio: pydio,
                    create: true,
                    dataSource: presetDataSource,
                    storageTypes: [],
                    closeEditor: function closeEditor() {
                        closeRightPane();
                    },
                    reloadList: function reloadList() {
                        _this3.loadDatasources();
                    }
                }
            });
        }
    }, {
        key: 'handleCreateTemplatePath',
        value: function handleCreateTemplatePath() {
            var _this4 = this;

            var containerEl = ReactDOM.findDOMNode(this.container);
            var el = ReactDOM.findDOMNode(this.templatePaths);

            var containerPosition = containerEl.getBoundingClientRect();
            var position = el.getBoundingClientRect();

            var selected = this.state.selected;

            var selection = this.mapping.filter(function (_ref2) {
                var workspace = _ref2.workspace;
                return selected === workspace;
            })[0];

            var _AdminWorkspaces = AdminWorkspaces;
            var TemplatePathEditor = _AdminWorkspaces.TemplatePathEditor;
            var TemplatePath = _AdminWorkspaces.TemplatePath;

            var newTpl = new TemplatePath();

            var path = " + \"" + selection.rootNodePath + "\";";
            // Special case for AJXP_USER
            path = path.replace(/AJXP_USER/g, "\" + User.Name + \"");
            // Stripping value at the end
            path = path.replace(/ \+ "";$/, ";");

            newTpl.setName(selected.slug);
            newTpl.setValue("Path = DataSources." + selection.datasource.Name + path);

            this.setState({
                dialogComponent: _react2['default'].createElement(TemplatePathEditor, {
                    dataSources: this.state.datasources,
                    node: newTpl,
                    oneLiner: true,
                    onSave: function () {
                        _this4.loadTemplatePaths();
                        _this4.setState({ dialogComponent: null });
                    },
                    onClose: function () {
                        return _this4.setState({ dialogComponent: null });
                    } }),
                dialogStyle: {
                    position: 'absolute',
                    zIndex: 2,
                    background: 'white',
                    top: position.y - containerPosition.y + position.height,
                    left: position.x + containerEl.scrollLeft - containerPosition.x,
                    width: position.w,
                    height: 48
                }
            });
        }
    }, {
        key: 'handleNext',
        value: function handleNext() {
            var onMapped = this.props.onMapped;
            var mappedWorkspaces = this.state.mappedWorkspaces;

            var mapping = this.mapping;
            var ret = { mapping: {}, create: {}, existing: {} };

            mappedWorkspaces.forEach(function (ws) {
                ret.mapping[ws.id] = ws.id;
                ret.existing[ws.id] = ws;
            });

            mapping.filter(function (_ref3) {
                var rootNode = _ref3.rootNode;
                return rootNode;
            }).map(function (_ref4) {
                var workspace = _ref4.workspace;
                var rootNode = _ref4.rootNode;

                var ws = new AdminWorkspaces.Workspace();
                var model = ws.getModel();
                // Map old properties to new object
                model.UUID = workspace.id;
                model.Label = workspace.display;
                model.Description = workspace.display;
                model.Slug = workspace.slug;
                model.Attributes['DEFAULT_RIGHTS'] = '';
                if (workspace.parameters['DEFAULT_RIGHTS']) {
                    //this should be handled via roles ACLs instead
                    //model.Attributes['DEFAULT_RIGHTS'] = workspace.parameters['DEFAULT_RIGHTS'];
                }
                if (workspace.features && workspace.features['meta.syncable'] && workspace.features['meta.syncable']['REPO_SYNCABLE'] === 'true') {
                    model.Attributes['ALLOW_SYNC'] = "true";
                }

                model.RootNodes = {}; // Nodes must be indexed by Uuid, not Path
                Object.keys(rootNode).forEach(function (rootKey) {
                    var root = rootNode[rootKey];
                    model.RootNodes[root.Uuid] = root;
                });

                // ws.save();

                ret.mapping[workspace.id] = model.UUID;
                ret.create[workspace.id] = ws;
            });

            onMapped(ret);
        }
    }, {
        key: 'isInvalid',
        value: function isInvalid(ws) {
            return this.mapping.filter(function (_ref5) {
                var workspace = _ref5.workspace;
                var valid = _ref5.valid;
                return workspace === ws && valid === false;
            }).length > 0;
        }
    }, {
        key: 'isValid',
        value: function isValid(ws) {
            return this.mapping.filter(function (_ref6) {
                var workspace = _ref6.workspace;
                var valid = _ref6.valid;
                return workspace === ws && valid === true;
            }).length > 0;
        }
    }, {
        key: 'isDatasourceSelectable',
        value: function isDatasourceSelectable(ds) {
            var selected = this.state.selected;

            return selected && selected.accessType === (typeof ds.StorageType === 'string' && ds.StorageType.toLowerCase() || "fs");
        }
    }, {
        key: 'isDatasourceHighlighted',
        value: function isDatasourceHighlighted(ds) {
            var highlight = this.state.highlight;

            return this.mapping.filter(function (_ref7) {
                var workspace = _ref7.workspace;
                var datasource = _ref7.datasource;
                return highlight === workspace && datasource === ds;
            }).length > 0;
        }
    }, {
        key: 'isTemplatePathSelectable',
        value: function isTemplatePathSelectable(tp) {
            var selected = this.state.selected;

            return selected && tp;
        }
    }, {
        key: 'isTemplatePathHighlighted',
        value: function isTemplatePathHighlighted(tp) {
            var highlight = this.state.highlight;

            return this.mapping.filter(function (_ref8) {
                var workspace = _ref8.workspace;
                var datasource = _ref8.datasource;
                var templatePath = _ref8.templatePath;
                return highlight === workspace && datasource && datasource.Name && templatePath === tp;
            }).length > 0;
        }
    }, {
        key: 'paginator',
        value: function paginator() {
            var _this5 = this;

            var _state3 = this.state;
            var workspaces = _state3.workspaces;
            var offset = _state3.offset;
            var limit = _state3.limit;

            if (workspaces.length <= limit) {
                return null;
            }
            var next = undefined,
                prev = undefined;
            if (workspaces.length - offset > limit) {
                next = offset + limit;
            }
            if (offset > 0) {
                prev = offset - limit;
            }
            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'center', position: 'absolute', top: -13, left: 0, right: 0 } },
                _react2['default'].createElement(_materialUi.FlatButton, { primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-chevron-left" }), label: this.T('next10') + limit, disabled: prev === undefined, onTouchTap: function () {
                        _this5.setState({ offset: prev });
                    } }),
                _react2['default'].createElement(_materialUi.FlatButton, { primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-chevron-right" }), label: this.T('prev10') + limit, labelPosition: "before", disabled: next === undefined, onTouchTap: function () {
                        _this5.setState({ offset: next });
                    } })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _props2 = this.props;
            var loading = _props2.loading;
            var error = _props2.error;
            var progress = _props2.progress;
            var onBack = _props2.onBack;
            var _state4 = this.state;
            var selected = _state4.selected;
            var workspaces = _state4.workspaces;
            var datasources = _state4.datasources;
            var templatePaths = _state4.templatePaths;
            var dialogComponent = _state4.dialogComponent;
            var dialogStyle = _state4.dialogStyle;
            var mappedWorkspaces = _state4.mappedWorkspaces;
            var cellsWorkspaces = _state4.cellsWorkspaces;
            var offset = _state4.offset;
            var limit = _state4.limit;
            var _state5 = this.state;
            var showDatasources = _state5.showDatasources;
            var showTemplatePaths = _state5.showTemplatePaths;

            var mapping = this.mapping;

            var paths = mapping.map(function (_ref9) {
                var workspace = _ref9.workspace;
                var datasource = _ref9.datasource;
                var templatePath = _ref9.templatePath;
                var rootNodePath = _ref9.rootNodePath;

                if (templatePath) {
                    return templatePath.Path;
                }

                if (datasource && datasource.Name) {
                    return datasource.Name + rootNodePath;
                }
            });

            var count = Math.min(workspaces.length - offset, limit);

            return _react2['default'].createElement(
                'div',
                { ref: function (el) {
                        return _this6.container = el;
                    }, style: { position: 'relative', overflowX: 'scroll' } },
                cellsWorkspaces.length > 0 && _react2['default'].createElement(
                    'div',
                    { style: { padding: 16 } },
                    this.T('already'),
                    ' :',
                    cellsWorkspaces.map(function (ws) {
                        var label = ws.Label + " (" + ws.UUID + ")";
                        var mapped = mappedWorkspaces.filter(function (w) {
                            return ws.UUID === w.id;
                        }).length;
                        return _react2['default'].createElement(_materialUi.Checkbox, { label: label, checked: mapped, onCheck: function (e, v) {
                                _this6.toggleRemap(v, ws);
                            } });
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 16 } },
                    !loading && _react2['default'].createElement(
                        'div',
                        null,
                        this.T('wsnumber').replace('%s', workspaces.length)
                    ),
                    loading && _react2['default'].createElement(
                        'div',
                        null,
                        this.T('loading'),
                        progress && _react2['default'].createElement(_materialUi.LinearProgress, { mode: "determinate", max: progress.max, value: progress.value })
                    ),
                    error && _react2['default'].createElement(
                        'div',
                        { style: { color: 'red' } },
                        this.T('loading.error').replace('%s', error)
                    )
                ),
                dialogComponent && _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: dialogStyle },
                    dialogComponent
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: "flex", marginLeft: 16, padding: 16, backgroundColor: '#fafafa', overflowX: 'scroll' }, onMouseLeave: function () {
                            return _this6.handleHidePath();
                        } },
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        _materialUi.Card,
                        null,
                        _react2['default'].createElement(_materialUi.CardHeader, {
                            title: this.T('p8.title'),
                            openIcon: _react2['default'].createElement(
                                _materialUi.IconMenu,
                                { iconButtonElement: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-dots-vertical" }) },
                                _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.T('p8.ds.show'), onTouchTap: function () {
                                        return _this6.handleShowDatasources();
                                    } }),
                                _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.T('p8.tpl.show'), onTouchTap: function () {
                                        return _this6.handleShowTemplatePaths();
                                    } })
                            ),
                            closeIcon: _react2['default'].createElement(
                                _materialUi.IconMenu,
                                { iconButtonElement: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-dots-vertical" }) },
                                _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.T('p8.ds.show'), onTouchTap: function () {
                                        return _this6.handleShowDatasources();
                                    } }),
                                _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.T('p8.tpl.show'), onTouchTap: function () {
                                        return _this6.handleShowTemplatePaths();
                                    } })
                            ),
                            showExpandableButton: true
                        }),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            { style: { position: 'relative', minWidth: 400 } },
                            _react2['default'].createElement(_Pydio8Workspaces2['default'], {
                                workspaces: workspaces.slice(offset, offset + count),
                                selected: selected,
                                isValid: function (ws) {
                                    return _this6.isValid(ws);
                                },
                                isInvalid: function (ws) {
                                    return _this6.isInvalid(ws);
                                },
                                onHover: function (ws) {
                                    return _this6.handleShowPath(ws);
                                },
                                onSelect: function (ws) {
                                    return _this6.handleSelectWorkspace(ws);
                                }
                            }),
                            this.paginator()
                        )
                    ),
                    showDatasources && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: count, rightNumber: datasources.length, links: this.linkWorkspacesToDatasources }),
                    showDatasources && _react2['default'].createElement(
                        _materialUi.Card,
                        null,
                        _react2['default'].createElement(_materialUi.CardHeader, {
                            title: this.T('cells.title'),
                            closeIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-eye-off", onTouchTap: function () {
                                    return _this6.handleHideDatasources();
                                } }),
                            showExpandableButton: true
                        }),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            null,
                            _react2['default'].createElement(_Ws2Datasources2['default'], {
                                datasources: datasources,
                                selectable: function (ds) {
                                    return _this6.isDatasourceSelectable(ds);
                                },
                                highlighted: function (ds) {
                                    return _this6.isDatasourceHighlighted(ds);
                                },
                                onSelect: function (ds) {
                                    return _this6.handleSelectDatasource(ds);
                                }
                            })
                        ),
                        _react2['default'].createElement(
                            _materialUi.CardActions,
                            null,
                            selected && _react2['default'].createElement(_materialUi.RaisedButton, {
                                label: this.T('createds'),
                                style: styles.button,
                                icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-plus-circle-outline", style: styles.addButton }),
                                onTouchTap: function () {
                                    return _this6.handleCreateDatasource();
                                }
                            })
                        )
                    ),
                    showTemplatePaths && (showDatasources && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: datasources.length, rightNumber: templatePaths.length, links: this.linkDatasourcesToTemplatePaths }) || _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: count, rightNumber: templatePaths.length, links: this.linkWorkspacesToTemplatePaths })),
                    showTemplatePaths && _react2['default'].createElement(
                        _materialUi.Card,
                        { style: { position: "relative" } },
                        _react2['default'].createElement(_materialUi.CardHeader, {
                            title: this.T('tpath.title'),
                            closeIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-eye-off", onTouchTap: function () {
                                    return _this6.handleHideTemplatePaths();
                                } }),
                            showExpandableButton: true
                        }),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            null,
                            _react2['default'].createElement(_Ws2TemplatePaths2['default'], {
                                style: { flex: 1 },
                                templatePaths: templatePaths,
                                selectable: function (tp) {
                                    return _this6.isTemplatePathSelectable(tp);
                                },
                                highlighted: function (tp) {
                                    return _this6.isTemplatePathHighlighted(tp);
                                },
                                onSelect: function (tp) {
                                    return _this6.handleSelectTemplatePath(tp);
                                }
                            })
                        ),
                        _react2['default'].createElement(
                            _materialUi.CardActions,
                            null,
                            selected && _react2['default'].createElement(_materialUi.RaisedButton, {
                                label: this.T('tpath.create'),
                                ref: function (el) {
                                    return _this6.templatePaths = el;
                                },
                                style: styles.button,
                                icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-plus-circle-outline", style: styles.addButton }),
                                onTouchTap: function () {
                                    return _this6.handleCreateTemplatePath();
                                }
                            })
                        )
                    ),
                    showTemplatePaths && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: templatePaths.length, rightNumber: count, links: this.linkTemplatePathsToWorkspaces }),
                    !showTemplatePaths && showDatasources && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: datasources.length, rightNumber: count, links: this.linkDatasourcesToWorkspaces }),
                    !showTemplatePaths && !showDatasources && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: count, rightNumber: count, links: this.linkWorkspacesToWorkspaces }),
                    _react2['default'].createElement(
                        _materialUi.Card,
                        { style: { marginRight: 16 } },
                        _react2['default'].createElement(_materialUi.CardHeader, {
                            title: this.T('nodes.title')
                        }),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            null,
                            _react2['default'].createElement(_Ws2RootNodes2['default'], {
                                pydio: _pydio2['default'].getInstance(),
                                style: { flex: 1 },
                                workspaces: workspaces.slice(offset, offset + count),
                                paths: paths.slice(offset, offset + count),
                                onSelect: function (ws, node) {
                                    return _this6.handleSelectRootNode(ws, node);
                                },
                                onError: function (ws) {
                                    return _this6.handleInvalidRootNode(ws);
                                }
                            })
                        )
                    ),
                    _react2['default'].createElement('div', { style: { minWidth: 8 } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: "20px 16px 2px" } },
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: this.T('back'), onClick: function () {
                            return onBack();
                        } }),
                    '  ',
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: this.T('next'), primary: true, onTouchTap: function () {
                            _this6.handleNext();
                        } })
                )
            );
        }
    }, {
        key: 'mapping',
        get: function get() {
            var _state6 = this.state;
            var mapping = _state6.mapping;
            var datasources = _state6.datasources;
            var templatePaths = _state6.templatePaths;
            var workspaces = _state6.workspaces;

            if (mapping) {
                return mapping;
            }

            var tree = new _PathTree2['default'](workspaces.map(function (workspace) {
                return _Pydio8Workspaces2['default'].extractPath(workspace);
            }), '/');

            // First we start the mapping by loading the workspaces
            var initialMapping = workspaces.map(function (workspace) {
                return { workspace: workspace };
            });

            // First we map the datasources
            initialMapping = initialMapping.map(function (map, idx) {
                var root = tree.getNewRoots(function (root) {
                    return root.ws === idx;
                })[0];

                var parentDs = root.parentDs;

                // let datasourcePath;

                // // Check if we have a perfect match for a datasource
                // const cellsDataPath = // TODO need to get this path from the loaded datasources
                // let datasource = datasources.filter((ds) => trimURL(template.replace(/AJXP_DATA_PATH/g, cellsDataPath)) === trimURL(Ws2Datasources.extractPath(ds)))[0]

                // if (!datasource) {
                //     // Check if we have a parent match for a datasource
                //     datasource = datasources.filter((ds) => trimURL(parentDs.replace(/AJXP_DATA_PATH/g, cellsDataPath)) === trimURL(Ws2Datasources.extractPath(ds)))[0]
                //     datasourcePath = parentDs
                // } else {
                //     datasourcePath = template
                // }

                return _extends({}, map, {
                    datasourcePath: parentDs,
                    datasource: {}
                });
            });

            // Then we map the potential template paths
            initialMapping = initialMapping.map(function (map, idx) {
                var datasource = map.datasource;

                var root = tree.getNewRoots(function (root) {
                    return root.template && root.ws === idx;
                })[0];

                var parentDs = root.parentDs;
                var template = root.template;

                var value = "Path = DataSources." + datasource.Name + " + \"" + template.substring(parentDs.length) + "\";";
                // Special case for AJXP_USER
                value = value.replace(/AJXP_USER/g, "\" + User.Name + \"");
                // Stripping value at the end
                value = value.replace(/ \+ "";$/, ";");

                // Trying to find if an existing template already is there
                var templatePath = templatePaths.filter(function (tp) {
                    return tp && removeComments(tp.MetaStore.resolution) === value;
                })[0];

                return _extends({}, map, {
                    templatePath: templatePath || null,
                    rootNodePath: template.substring(parentDs.length)
                });
            });

            return initialMapping;
        }
    }, {
        key: 'linkWorkspacesToDatasources',
        get: function get() {
            var _state7 = this.state;
            var datasources = _state7.datasources;
            var highlight = _state7.highlight;
            var selected = _state7.selected;
            var workspaces = _state7.workspaces;
            var offset = _state7.offset;
            var limit = _state7.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(wss, datasources, function (ws, ds) {
                return mapping.filter(function (_ref10) {
                    var workspace = _ref10.workspace;
                    var datasource = _ref10.datasource;
                    return workspace == ws && datasource == ds;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkWorkspacesToTemplatePaths',
        get: function get() {
            var _state8 = this.state;
            var templatePaths = _state8.templatePaths;
            var highlight = _state8.highlight;
            var selected = _state8.selected;
            var workspaces = _state8.workspaces;
            var offset = _state8.offset;
            var limit = _state8.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(wss, templatePaths, function (ws, tp) {
                return mapping.filter(function (_ref11) {
                    var workspace = _ref11.workspace;
                    var templatePath = _ref11.templatePath;
                    var datasource = _ref11.datasource;
                    return workspace == ws && templatePath == tp && datasource && datasource.Name;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkDatasourcesToTemplatePaths',
        get: function get() {
            var _state9 = this.state;
            var datasources = _state9.datasources;
            var templatePaths = _state9.templatePaths;
            var highlight = _state9.highlight;
            var selected = _state9.selected;

            var mapping = this.mapping;

            return this.getLinks(datasources, templatePaths, function (ds, tp) {
                return mapping.filter(function (_ref12) {
                    var datasource = _ref12.datasource;
                    return datasource == ds;
                }).filter(function (_ref13) {
                    var templatePath = _ref13.templatePath;
                    return templatePath == tp;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkDatasourcesToWorkspaces',
        get: function get() {
            var _state10 = this.state;
            var datasources = _state10.datasources;
            var highlight = _state10.highlight;
            var selected = _state10.selected;
            var workspaces = _state10.workspaces;
            var offset = _state10.offset;
            var limit = _state10.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(datasources, wss, function (ds, ws) {
                return mapping.filter(function (_ref14) {
                    var workspace = _ref14.workspace;
                    var datasource = _ref14.datasource;
                    return workspace == ws && datasource == ds;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkTemplatePathsToWorkspaces',
        get: function get() {
            var _state11 = this.state;
            var templatePaths = _state11.templatePaths;
            var highlight = _state11.highlight;
            var selected = _state11.selected;
            var workspaces = _state11.workspaces;
            var offset = _state11.offset;
            var limit = _state11.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(templatePaths, wss, function (tp, ws) {
                return mapping.filter(function (_ref15) {
                    var templatePath = _ref15.templatePath;
                    return templatePath == tp;
                }).filter(function (_ref16) {
                    var workspace = _ref16.workspace;
                    return workspace == ws;
                }).filter(function (_ref17) {
                    var datasource = _ref17.datasource;
                    return datasource.Name;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkWorkspacesToWorkspaces',
        get: function get() {
            var _state12 = this.state;
            var datasources = _state12.datasources;
            var highlight = _state12.highlight;
            var selected = _state12.selected;
            var workspaces = _state12.workspaces;
            var offset = _state12.offset;
            var limit = _state12.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(wss, wss, function (ws1, ws2) {
                return mapping.filter(function (_ref18) {
                    var workspace = _ref18.workspace;
                    return workspace == ws1 && workspace == ws2;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }]);

    return WorkspaceMapper;
})(_react2['default'].Component);

exports['default'] = WorkspaceMapper;

var removeComments = function removeComments(str) {
    return str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "").replace(/(\r\n|\n|\r)/gm, "");
};

var getDatasource = function getDatasource(str) {
    return str.replace(/^Path = DataSources\.([^ ]*) \+ .*$/, "$1");
};

var trimURL = function trimURL(str) {
    return str.replace(/^\//, "").replace(/\/$/, "");
};
module.exports = exports['default'];

},{"./Connect":57,"./Loader":58,"./PathTree":61,"./Pydio8Workspaces":62,"./Ws2Datasources":63,"./Ws2RootNodes":64,"./Ws2TemplatePaths":65,"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],60:[function(require,module,exports){
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

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _Loader = require('./Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _Connect = require('./Connect');

var _Connect2 = _interopRequireDefault(_Connect);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var MetadataMapper = (function (_React$Component) {
    _inherits(MetadataMapper, _React$Component);

    function MetadataMapper(props) {
        _classCallCheck(this, MetadataMapper);

        _get(Object.getPrototypeOf(MetadataMapper.prototype), 'constructor', this).call(this, props);
        this.state = {};
    }

    _createClass(MetadataMapper, [{
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'renderFontIcon',
        value: function renderFontIcon(meta) {
            var icon = undefined;
            switch (meta.type) {
                case "string":
                case "text":
                case "longtext":
                    icon = "pencil";
                    break;
                case "stars_rate":
                    icon = "star";
                    break;
                case "css_label":
                    icon = "label-outline";
                    break;
                case "choice":
                    icon = "format-list-bulleted";
                    break;
                case "tags":
                    icon = "cloud-outline";
                    break;
                default:
                    icon = "file";
                    break;
            }
            return _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-" + icon });
        }
    }, {
        key: 'exportMapping',
        value: function exportMapping() {
            var _state = this.state;
            var metas = _state.metas;
            var factorized = _state.factorized;
            var links = _state.links;

            if (!metas || !metas.length) {
                return;
            }
            var data = {
                mapping: {},
                create: this.buildNamespaces()
            };
            metas.forEach(function (m, i) {
                var rightIndex = links.filter(function (l) {
                    return l.left === i;
                })[0].right;
                data.mapping[m.name] = factorized[rightIndex].namespace;
            });
            this.props.onMapped(data);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            if (this.props.workspaces && this.props.workspaces.length) {
                var _Loader$parseUserMetaDefinitions = _Loader2['default'].parseUserMetaDefinitions(this.props.workspaces.filter(function (ws) {
                    return !ws.isTemplate;
                }));

                var metas = _Loader$parseUserMetaDefinitions.metas;
                var factorized = _Loader$parseUserMetaDefinitions.factorized;
                var links = _Loader$parseUserMetaDefinitions.links;

                this.setState({ metas: metas, factorized: factorized, links: links }, function () {
                    _this.exportMapping();
                });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            if (nextProps.workspaces && nextProps.workspaces.length && (nextProps.workspaces !== this.props.workspaces || !this.props.workspaces || !this.props.workspaces.length)) {
                var _Loader$parseUserMetaDefinitions2 = _Loader2['default'].parseUserMetaDefinitions(nextProps.workspaces.filter(function (ws) {
                    return !ws.isTemplate;
                }));

                var metas = _Loader$parseUserMetaDefinitions2.metas;
                var factorized = _Loader$parseUserMetaDefinitions2.factorized;
                var links = _Loader$parseUserMetaDefinitions2.links;

                this.setState({ metas: metas, factorized: factorized, links: links }, function () {
                    _this2.exportMapping();
                });
            }
        }
    }, {
        key: 'toggle',
        value: function toggle(index) {
            var factorized = this.state.factorized;

            factorized[index].edit = !factorized[index].edit;
            this.setState({ factorized: factorized });
        }
    }, {
        key: 'updateLabel',
        value: function updateLabel(index, value) {
            var _this3 = this;

            var factorized = this.state.factorized;

            factorized[index].label = value;
            factorized[index].namespace = 'usermeta-' + _pydioUtilLang2['default'].computeStringSlug(value);
            this.setState({ factorized: factorized }, function () {
                _this3.exportMapping();
            });
        }
    }, {
        key: 'buildNamespaces',
        value: function buildNamespaces() {
            var factorized = this.state.factorized;

            return factorized.map(function (meta, i) {
                var ns = new _pydioHttpRestApi.IdmUserMetaNamespace();
                ns.Namespace = meta.namespace;
                ns.Label = meta.label;
                var json = { type: meta.type };
                if (meta.type === 'choice') {
                    json['data'] = meta.additional;
                }
                ns.JsonDefinition = JSON.stringify(json);
                ns.Order = i;
                ns.Indexable = true;
                ns.Policies = [_pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({ Action: 'READ', Subject: '*', Effect: 'allow' }), _pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({ Action: 'WRITE', Subject: '*', Effect: 'allow' })];
                return ns;
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _state2 = this.state;
            var metas = _state2.metas;
            var factorized = _state2.factorized;
            var links = _state2.links;

            if (!metas) {
                return null;
            }
            var linkColor = '#2196f3';
            return _react2['default'].createElement(
                'div',
                { style: { margin: 16, display: 'flex' } },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { width: 350 } },
                    _react2['default'].createElement(
                        _materialUi.List,
                        null,
                        _react2['default'].createElement(
                            _materialUi.Subheader,
                            null,
                            this.T('step.meta.from')
                        ),
                        metas.map(function (m) {
                            return _react2['default'].createElement(_materialUi.ListItem, {
                                primaryText: m.label,
                                secondaryText: _this4.T('step.meta.map.ws').replace('%s', m.ws.display),
                                leftIcon: _this4.renderFontIcon(m),
                                disabled: true
                            });
                        })
                    )
                ),
                _react2['default'].createElement(_Connect2['default'], {
                    leftNumber: metas.length,
                    rightNumber: factorized.length,
                    leftGridHeight: 72,
                    rightGridHeight: 72,
                    links: links.map(function (m) {
                        return _extends({}, m, { color: linkColor });
                    }),
                    style: { marginLeft: -9, marginRight: -5 }
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { width: 350 } },
                    _react2['default'].createElement(
                        _materialUi.List,
                        null,
                        _react2['default'].createElement(
                            _materialUi.Subheader,
                            null,
                            this.T('step.meta.to')
                        ),
                        factorized.map(function (m, i) {
                            if (!m.edit) {
                                return _react2['default'].createElement(_materialUi.ListItem, {
                                    primaryText: m.label,
                                    secondaryText: m.namespace + (m.additional ? _this4.T('step.meta.map.values').replace('%s', m.additional) : ''),
                                    leftIcon: _this4.renderFontIcon(m),
                                    onTouchTap: function () {
                                        _this4.toggle(i);
                                    }
                                });
                            } else {
                                return _react2['default'].createElement(_materialUi.ListItem, {
                                    style: { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                                    primaryText: _react2['default'].createElement(ModernTextField, { style: { height: 40 }, value: m.label, onChange: function (e, v) {
                                            _this4.updateLabel(i, v);
                                        } }),
                                    leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { margin: '24px 12px', cursor: 'pointer' }, className: "mdi mdi-check", onTouchTap: function () {
                                            _this4.toggle(i);
                                        } }),
                                    disabled: true
                                });
                            }
                        })
                    )
                )
            );
        }
    }]);

    return MetadataMapper;
})(_react2['default'].Component);

exports['default'] = MetadataMapper;
module.exports = exports['default'];

},{"./Connect":57,"./Loader":58,"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],61:[function(require,module,exports){
/**
 * Tool to arrange a list of path into a tree, and then find the common roots
 * that could be used as datasources
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PathTree = (function () {
    function PathTree(paths) {
        var _this = this;

        var separator = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

        _classCallCheck(this, PathTree);

        this.SEPARATOR = separator;

        // Make sure all paths start with a '/'
        this.paths = paths.map(function (p) {
            return p[0] === _this.SEPARATOR ? p : _this.SEPARATOR + p;
        });

        this.tree = this.arrangeIntoTree(this.paths);
        this.newRoots = [];
        this.links = [];

        this.flattenTree(this.tree, this.newRoots, this.links);

        var flattened = this.flatten(this.tree);
    }

    _createClass(PathTree, [{
        key: "flatten",
        value: function flatten(arr) {
            var _this2 = this;

            if (Array.isArray(arr)) {
                return arr.reduce(function (done, curr) {
                    return curr && done.concat(_this2.flatten(curr), _this2.flatten(curr.children));
                }, []);
            } else {
                return arr;
            }
        }
    }, {
        key: "getNewRoots",
        value: function getNewRoots(f) {
            if (typeof f === "function") {
                return this.newRoots.filter(f);
            }
            return;
        }
    }, {
        key: "getLinks",
        value: function getLinks(f) {
            var _this3 = this;

            var rootIdx = 0;
            var links = this.newRoots.filter(f).reduce(function (acc, root) {
                var index = _this3.paths.map(function (path, idx) {
                    if (path.startsWith(root.ds) || path.startsWith(root.ds, 1)) {
                        acc = [].concat(_toConsumableArray(acc), [{
                            left: idx,
                            right: rootIdx,
                            color: "#e0e0e0",
                            type: "ds"
                        }]);
                    }
                });

                rootIdx++;

                return acc;
            }, []);

            return links;
        }

        /**
         * Create Tree structure from list of Paths
         * @param paths
         * @return {Array}
         */
    }, {
        key: "arrangeIntoTree",
        value: function arrangeIntoTree(paths) {
            var _this4 = this;

            var tree = [];

            paths.forEach(function (path, wsIndex) {

                var pathParts = path.split(_this4.SEPARATOR);
                pathParts.shift();

                var currentLevel = tree; // initialize currentLevel to root

                pathParts.forEach(function (part, partIndex) {

                    var isLastPart = partIndex === pathParts.length - 1;

                    // check to see if the path already exists.
                    var existing = currentLevel.filter(function (branch) {
                        return branch.name === part;
                    });

                    if (existing.length) {
                        var existingPath = existing[0];
                        // The path to this item was already in the tree, so don't add it again.
                        // Set the current level to this path's children
                        currentLevel = existingPath.children;
                        if (isLastPart) {
                            existingPath.workspaces.push(wsIndex);
                        }
                    } else {
                        var newPart = {
                            name: part,
                            children: [],
                            workspaces: []
                        };
                        if (isLastPart) {
                            newPart.workspaces.push(wsIndex);
                        }
                        currentLevel.push(newPart);
                        currentLevel = newPart.children;
                    }
                });
            });

            return tree;
        }

        /**
         * Recursively crawl tree into a list of common roots containing some informations.
         * The output roots are objects that can be either
         *      {ds:"path of the datasource"}
         *      {template:"full path of the template (e.g. AJXP_DATA_PATH/personal/AJXP_USER)", parentDs:"on which datasource it should be created"}
         * The output links are simple objects used by the canvas for linking dots.
         *      {left: "index in leftList", right: "index in rightList", color:"html color", weak: boolean}
         * The "weak" property is used whenever a workspace is associated to a template Path, it also shows that it would be associated to a datasource as well.
         *
         * @param branches
         * @param newRoots
         * @param links
         * @param parentPath
         * @param hasParentRoot
         */
    }, {
        key: "flattenTree",
        value: function flattenTree(branches, newRoots, links) {
            var _this5 = this;

            var parentPath = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];
            var hasParentRoot = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];

            branches.forEach(function (branch) {
                var children = branch.children;
                var name = branch.name;
                var workspaces = branch.workspaces;

                var parent = [].concat(_toConsumableArray(parentPath), [name]);

                var branchHasRoot = hasParentRoot;
                var pathName = parent.join(_this5.SEPARATOR);

                if (!(pathName.indexOf('AJXP_') === 0)) {
                    pathName = _this5.SEPARATOR + pathName;
                }

                if (children.length > 1 || hasParentRoot === -1 && children.length === 0) {
                    branchHasRoot = newRoots.length;
                    if (pathName.indexOf('AJXP_USER') > -1) {
                        // There will be a template path on that one - use parent dir as datasource instead
                        var parents = [].concat(_toConsumableArray(parent));
                        parents.pop();
                        newRoots.push({ ds: parents.join('/') });
                    } else {
                        newRoots.push({ ds: pathName });
                    }
                }

                if (workspaces.length && branchHasRoot > -1) {
                    workspaces.forEach(function (wsIndex) {
                        if (pathName.indexOf('AJXP_USER') > -1) {
                            var tPathIndex = newRoots.length;
                            newRoots.push({ template: pathName, parentDs: newRoots[branchHasRoot].ds, ws: wsIndex });
                            links.push({ left: wsIndex, right: branchHasRoot, color: "#e0e0e0", type: "ds", weak: true }); // Link to datasource
                            links.push({ left: wsIndex, right: tPathIndex, color: "#1565c0", type: "tp" }); // Link to template
                        } else {
                                links.push({ left: wsIndex, right: branchHasRoot, color: "#78909c", type: "ds" });
                                newRoots.push({ template: pathName, parentDs: newRoots[branchHasRoot].ds, ws: wsIndex });
                            }
                    });
                }

                if (children.length) {
                    _this5.flattenTree(children, newRoots, links, parent, branchHasRoot);
                }
            });
        }
    }]);

    return PathTree;
})();

exports["default"] = PathTree;
module.exports = exports["default"];

},{}],62:[function(require,module,exports){
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

var _pydioUtilHasher = require('pydio/util/hasher');

var _pydioUtilHasher2 = _interopRequireDefault(_pydioUtilHasher);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var styles = {
    selected: {
        backgroundColor: "#eeeeee"
    },
    valid: {
        backgroundColor: "rgba(0, 171, 102, 0.1)"
    },
    invalid: {
        backgroundColor: "#ffebee"
    }
};

var Pydio8Workspaces = (function (_React$Component) {
    _inherits(Pydio8Workspaces, _React$Component);

    function Pydio8Workspaces() {
        _classCallCheck(this, Pydio8Workspaces);

        _get(Object.getPrototypeOf(Pydio8Workspaces.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Pydio8Workspaces, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var workspaces = _props.workspaces;
            var isInvalid = _props.isInvalid;
            var isValid = _props.isValid;
            var selected = _props.selected;
            var onSelect = _props.onSelect;
            var onHover = _props.onHover;

            return _react2['default'].createElement(
                _materialUi.List,
                { style: { flex: 1, display: "flex", flexDirection: "column" } },
                workspaces.map(function (workspace, idx) {
                    return _react2['default'].createElement(Workspace, {
                        style: { flex: 1 },
                        workspace: workspace,
                        valid: isValid(workspace),
                        invalid: isInvalid(workspace),
                        selected: selected === workspace,
                        onSelect: function (ws) {
                            return onSelect(ws);
                        }, onHover: function (ws) {
                            return onHover(ws);
                        }
                    });
                })
            );
        }
    }], [{
        key: 'toString',
        value: function toString(_ref) {
            var type = _ref.accessType;
            var _ref$parameters = _ref.parameters;
            var parameters = _ref$parameters === undefined ? {} : _ref$parameters;

            switch (type) {
                case "s3":
                    return parameters['STORAGE_URL'] ? "S3-compatible storage URL" : "Amazon S3";

                    break;
                default:
                    return parameters['PATH'];
            }
        }
    }, {
        key: 'extractPath',
        value: function extractPath(_ref2) {
            var type = _ref2.accessType;
            var _ref2$parameters = _ref2.parameters;
            var parameters = _ref2$parameters === undefined ? {} : _ref2$parameters;

            if (type === "fs") {
                return parameters['PATH'];
            } else {
                var parts = [];

                parts.push(parameters['STORAGE_URL'] ? 'custom:' + _pydioUtilHasher2['default'].base64_encode(parameters['STORAGE_URL']) : 's3');
                parts.push(parameters['API_KEY'], parameters['SECRET_KEY']);
                parts.push(parameters['CONTAINER']);

                if (parameters['PATH']) {
                    var paths = _pydioUtilLang2['default'].trim(parameters['PATH'], '/').split('/');
                    parts.push.apply(parts, _toConsumableArray(paths));
                }

                return parts.join('/');
            }
        }
    }]);

    return Pydio8Workspaces;
})(_react2['default'].Component);

var Workspace = (function (_React$Component2) {
    _inherits(Workspace, _React$Component2);

    function Workspace() {
        _classCallCheck(this, Workspace);

        _get(Object.getPrototypeOf(Workspace.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Workspace, [{
        key: 'handleSelect',
        value: function handleSelect(ws) {
            var _props2 = this.props;
            var workspace = _props2.workspace;
            var selected = _props2.selected;
            var onSelect = _props2.onSelect;

            if (!selected) {
                onSelect(workspace);
            } else {
                onSelect(null);
            }
        }
    }, {
        key: 'handleHover',
        value: function handleHover() {
            var _props3 = this.props;
            var workspace = _props3.workspace;
            var selected = _props3.selected;
            var onHover = _props3.onHover;

            if (selected) {
                return;
            }

            onHover(workspace);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props4 = this.props;
            var workspace = _props4.workspace;
            var valid = _props4.valid;
            var invalid = _props4.invalid;
            var selected = _props4.selected;

            var style = this.props.style;

            if (selected) {
                style = _extends({}, style, styles.selected);
            }

            if (valid) {
                style = _extends({}, style, styles.valid);
            } else if (invalid) {
                style = _extends({}, style, styles.invalid);
            }

            return _react2['default'].createElement(_materialUi.ListItem, {
                leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-database" }),
                primaryText: workspace.display,
                secondaryText: Pydio8Workspaces.toString(workspace),
                style: style,
                onMouseOver: function () {
                    return _this.handleHover();
                },
                onTouchTap: function () {
                    return _this.handleSelect();
                }
            });
        }
    }]);

    return Workspace;
})(_react2['default'].Component);

exports['default'] = Pydio8Workspaces;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio/util/hasher":"pydio/util/hasher","pydio/util/lang":"pydio/util/lang","react":"react"}],63:[function(require,module,exports){
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

var _pydioUtilHasher = require('pydio/util/hasher');

var _pydioUtilHasher2 = _interopRequireDefault(_pydioUtilHasher);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var styles = {
    highlighted: {
        backgroundColor: "rgba(204, 204, 204, 0.2)"
    },
    selectable: {
        backgroundColor: "rgba(255, 215, 0, 0.2)"
    }
};

var Ws2Datasources = (function (_React$Component) {
    _inherits(Ws2Datasources, _React$Component);

    function Ws2Datasources(props) {
        _classCallCheck(this, Ws2Datasources);

        _get(Object.getPrototypeOf(Ws2Datasources.prototype), 'constructor', this).call(this, props);

        this.state = {
            startedServices: []
        };
    }

    _createClass(Ws2Datasources, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            this.statusPoller = setInterval(function () {
                AdminWorkspaces.DataSource.loadStatuses().then(function (data) {
                    _this.setState({ startedServices: data.Services });
                });
            }, 2500);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearInterval(this.statusPoller);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var header = _props.header;
            var headerIcons = _props.headerIcons;
            var highlighted = _props.highlighted;
            var selectable = _props.selectable;
            var datasources = _props.datasources;
            var onCreate = _props.onCreate;
            var onSelect = _props.onSelect;
            var startedServices = this.state.startedServices;

            return _react2['default'].createElement(
                _materialUi.List,
                null,
                _react2['default'].createElement(
                    _materialUi.Subheader,
                    null,
                    header,
                    ' ',
                    headerIcons
                ),
                datasources.map(function (datasource, idx) {

                    var path = "";

                    // Check if selected datasource is properly running

                    var sync = startedServices.reduce(function (acc, service) {
                        return acc || service.Name === 'pydio.grpc.data.sync.' + datasource.Name;
                    }, false);
                    var index = startedServices.reduce(function (acc, service) {
                        return acc || service.Name === 'pydio.grpc.data.index.' + datasource.Name;
                    }, false);
                    var objects = startedServices.reduce(function (acc, service) {
                        return acc || service.Name === 'pydio.grpc.data.objects.' + datasource.ObjectsServiceName;
                    }, false);

                    return _react2['default'].createElement(Datasource, {
                        path: path,
                        selectable: selectable(datasource),
                        highlighted: highlighted(datasource),
                        datasource: datasource,
                        running: sync && index && objects,
                        onSelect: function (ds) {
                            return onSelect(ds);
                        }
                    });
                })
            );
        }
    }], [{
        key: 'toString',
        value: function toString(datasource) {
            var StorageType = datasource.StorageType;
            var _datasource$StorageConfiguration = datasource.StorageConfiguration;
            var StorageConfiguration = _datasource$StorageConfiguration === undefined ? {} : _datasource$StorageConfiguration;

            switch (StorageType) {
                case "S3":
                    var customEndpoint = StorageConfiguration.customEndpoint;

                    return customEndpoint ? "S3-compatible storage URL" : "Amazon S3";

                    break;
                default:
                    return StorageConfiguration.folder;
            }
        }
    }, {
        key: 'extractPath',
        value: function extractPath(datasource) {
            var StorageType = datasource.StorageType;
            var _datasource$StorageConfiguration2 = datasource.StorageConfiguration;
            var StorageConfiguration = _datasource$StorageConfiguration2 === undefined ? {} : _datasource$StorageConfiguration2;

            switch (StorageType) {
                case "S3":
                    var ApiKey = datasource.ApiKey,
                        ApiSecret = datasource.ApiSecret,
                        ObjectsBucket = datasource.ObjectsBucket,
                        ObjectsBaseFolder = datasource.ObjectsBaseFolder;
                    var customEndpoint = StorageConfiguration.customEndpoint;

                    var parts = [];
                    parts.push(customEndpoint ? 'custom:' + _pydioUtilHasher2['default'].base64_encode(customEndpoint) : 's3');
                    parts.push(ApiKey, ApiSecret);

                    parts.push(ObjectsBucket);

                    if (ObjectsBaseFolder) {
                        var paths = _pydioUtilLang2['default'].trim(ObjectsBaseFolder, '/').split('/');
                        parts.push.apply(parts, _toConsumableArray(paths));
                    }

                    return parts.join('/');

                    break;
                default:
                    return StorageConfiguration.folder;
            }
        }
    }]);

    return Ws2Datasources;
})(_react2['default'].Component);

var Datasource = (function (_React$Component2) {
    _inherits(Datasource, _React$Component2);

    function Datasource() {
        _classCallCheck(this, Datasource);

        _get(Object.getPrototypeOf(Datasource.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Datasource, [{
        key: 'handleSelect',
        value: function handleSelect() {
            var _props2 = this.props;
            var datasource = _props2.datasource;
            var onSelect = _props2.onSelect;

            onSelect(datasource);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props3 = this.props;
            var datasource = _props3.datasource;
            var selectable = _props3.selectable;
            var highlighted = _props3.highlighted;
            var running = _props3.running;
            var _datasource$StorageType = datasource.StorageType;
            var StorageType = _datasource$StorageType === undefined ? "" : _datasource$StorageType;

            var menuIcon = { lineHeight: '24px' };
            var icon = !running ? 'sync' : StorageType === 's3' ? 'cloud-circle' : 'folder';

            var style = this.props.style;

            if (highlighted) {
                style = _extends({}, style, styles.highlighted);
            }
            if (selectable) {
                style = _extends({}, style, styles.selectable);
            }

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.ListItem, {
                    leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: menuIcon, className: "mdi mdi-" + icon }),
                    primaryText: datasource.Name,
                    secondaryText: Ws2Datasources.toString(datasource),
                    style: style,
                    disabled: !selectable,
                    onTouchTap: function () {
                        return _this2.handleSelect();
                    }
                })
            );
        }
    }]);

    return Datasource;
})(_react2['default'].Component);

exports['default'] = Ws2Datasources;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio/util/hasher":"pydio/util/hasher","pydio/util/lang":"pydio/util/lang","react":"react"}],64:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Ws2RootNodes = (function (_React$Component) {
    _inherits(Ws2RootNodes, _React$Component);

    function Ws2RootNodes() {
        _classCallCheck(this, Ws2RootNodes);

        _get(Object.getPrototypeOf(Ws2RootNodes.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Ws2RootNodes, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.component = AdminWorkspaces.WsAutoComplete;
        }
    }, {
        key: 'T',
        value: function T(id) {
            return Pydio.getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var style = _props.style;
            var workspaces = _props.workspaces;
            var paths = _props.paths;
            var onSelect = _props.onSelect;
            var onError = _props.onError;

            if (!this.component) {
                return null;
            }

            var Tag = this.component;

            return _react2['default'].createElement(
                _materialUi.List,
                { style: _extends({}, style, { minWidth: 400 }) },
                paths.map(function (path, idx) {
                    return _react2['default'].createElement(
                        _materialUi.ListItem,
                        { innerDivStyle: { height: "72px", padding: "0 16px", display: "flex" }, disabled: true },
                        path && _react2['default'].createElement(Tag, {
                            pydio: pydio,
                            key: path,
                            style: { backgroundColor: "#ffffff", width: 400, margin: 0, padding: 0 },
                            value: path,
                            validateOnLoad: true,
                            onChange: function (key, node) {
                                return onSelect(workspaces[idx], _defineProperty({}, key, node));
                            },
                            onError: function () {
                                return onError(workspaces[idx]);
                            }
                        }) || _react2['default'].createElement(
                            'span',
                            { style: { display: "flex", fontStyle: "italic", height: "72px", alignItems: "center" } },
                            _this.T('step.mapper.invalid')
                        )
                    );
                })
            );
        }
    }]);

    return Ws2RootNodes;
})(_react2['default'].Component);

exports['default'] = Ws2RootNodes;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}],65:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var removeComments = function removeComments(str) {
    return str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "").replace(/(\r\n|\n|\r)/gm, "");
};

var styles = {
    highlighted: {
        backgroundColor: "rgba(204, 204, 204, 0.2)"
    },
    selectable: {
        backgroundColor: "rgba(255, 215, 0, 0.2)"
    }
};

var Ws2TemplatePaths = (function (_React$Component) {
    _inherits(Ws2TemplatePaths, _React$Component);

    function Ws2TemplatePaths() {
        _classCallCheck(this, Ws2TemplatePaths);

        _get(Object.getPrototypeOf(Ws2TemplatePaths.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Ws2TemplatePaths, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var title = _props.title;
            var selectable = _props.selectable;
            var highlighted = _props.highlighted;
            var templatePaths = _props.templatePaths;
            var onCreate = _props.onCreate;
            var onSelect = _props.onSelect;

            return _react2['default'].createElement(
                _materialUi.List,
                { style: { flex: 1 } },
                templatePaths.map(function (templatePath, idx) {
                    return _react2['default'].createElement(TemplatePath, {
                        selectable: selectable(templatePath),
                        highlighted: highlighted(templatePath),
                        templatePath: templatePath,
                        onSelect: function (tp) {
                            return onSelect(tp);
                        }
                    });
                })
            );
        }
    }]);

    return Ws2TemplatePaths;
})(_react2['default'].Component);

var TemplatePath = (function (_React$Component2) {
    _inherits(TemplatePath, _React$Component2);

    function TemplatePath() {
        _classCallCheck(this, TemplatePath);

        _get(Object.getPrototypeOf(TemplatePath.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TemplatePath, [{
        key: 'handleSelect',
        value: function handleSelect() {
            var _props2 = this.props;
            var templatePath = _props2.templatePath;
            var onSelect = _props2.onSelect;

            onSelect(templatePath);
        }
    }, {
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props3 = this.props;
            var selectable = _props3.selectable;
            var highlighted = _props3.highlighted;
            var templatePath = _props3.templatePath;

            var style = this.props.style;

            if (highlighted) {
                style = _extends({}, style, styles.highlighted);
            }

            if (!templatePath) {
                return _react2['default'].createElement(_materialUi.ListItem, { style: style, leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-folder-outline" }), primaryText: this.T('step.mapper.notplpath.primary'), secondaryText: this.T('step.mapper.notplpath.secondary') });
            }

            if (selectable) {
                style = _extends({}, style, styles.selectable);
            }

            return _react2['default'].createElement(_materialUi.ListItem, {
                style: style,
                leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-file-tree" }),
                primaryText: templatePath.Path,
                secondaryText: removeComments(templatePath.MetaStore.resolution),
                disabled: !selectable,
                onTouchTap: function () {
                    return _this.handleSelect();
                }
            });
        }
    }]);

    return TemplatePath;
})(_react2['default'].Component);

exports['default'] = Ws2TemplatePaths;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}]},{},[47])(47)
});
