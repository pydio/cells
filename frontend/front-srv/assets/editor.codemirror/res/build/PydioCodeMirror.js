(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioCodeMirror = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// This is CodeMirror (http://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.CodeMirror = factory());
}(this, (function () { 'use strict';

// Kludges for bugs and behavior differences that can't be feature
// detected are enabled based on userAgent etc sniffing.
var userAgent = navigator.userAgent;
var platform = navigator.platform;

var gecko = /gecko\/\d/i.test(userAgent);
var ie_upto10 = /MSIE \d/.test(userAgent);
var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
var edge = /Edge\/(\d+)/.exec(userAgent);
var ie = ie_upto10 || ie_11up || edge;
var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : +(edge || ie_11up)[1]);
var webkit = !edge && /WebKit\//.test(userAgent);
var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
var chrome = !edge && /Chrome\//.test(userAgent);
var presto = /Opera\//.test(userAgent);
var safari = /Apple Computer/.test(navigator.vendor);
var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
var phantom = /PhantomJS/.test(userAgent);

var ios = !edge && /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent);
var android = /Android/.test(userAgent);
// This is woefully incomplete. Suggestions for alternative methods welcome.
var mobile = ios || android || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
var mac = ios || /Mac/.test(platform);
var chromeOS = /\bCrOS\b/.test(userAgent);
var windows = /win/i.test(platform);

var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);
if (presto_version) { presto_version = Number(presto_version[1]); }
if (presto_version && presto_version >= 15) { presto = false; webkit = true; }
// Some browsers use the wrong event properties to signal cmd/ctrl on OS X
var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
var captureRightClick = gecko || (ie && ie_version >= 9);

function classTest(cls) { return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*") }

var rmClass = function(node, cls) {
  var current = node.className;
  var match = classTest(cls).exec(current);
  if (match) {
    var after = current.slice(match.index + match[0].length);
    node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
  }
};

function removeChildren(e) {
  for (var count = e.childNodes.length; count > 0; --count)
    { e.removeChild(e.firstChild); }
  return e
}

function removeChildrenAndAdd(parent, e) {
  return removeChildren(parent).appendChild(e)
}

function elt(tag, content, className, style) {
  var e = document.createElement(tag);
  if (className) { e.className = className; }
  if (style) { e.style.cssText = style; }
  if (typeof content == "string") { e.appendChild(document.createTextNode(content)); }
  else if (content) { for (var i = 0; i < content.length; ++i) { e.appendChild(content[i]); } }
  return e
}
// wrapper for elt, which removes the elt from the accessibility tree
function eltP(tag, content, className, style) {
  var e = elt(tag, content, className, style);
  e.setAttribute("role", "presentation");
  return e
}

var range;
if (document.createRange) { range = function(node, start, end, endNode) {
  var r = document.createRange();
  r.setEnd(endNode || node, end);
  r.setStart(node, start);
  return r
}; }
else { range = function(node, start, end) {
  var r = document.body.createTextRange();
  try { r.moveToElementText(node.parentNode); }
  catch(e) { return r }
  r.collapse(true);
  r.moveEnd("character", end);
  r.moveStart("character", start);
  return r
}; }

function contains(parent, child) {
  if (child.nodeType == 3) // Android browser always returns false when child is a textnode
    { child = child.parentNode; }
  if (parent.contains)
    { return parent.contains(child) }
  do {
    if (child.nodeType == 11) { child = child.host; }
    if (child == parent) { return true }
  } while (child = child.parentNode)
}

function activeElt() {
  // IE and Edge may throw an "Unspecified Error" when accessing document.activeElement.
  // IE < 10 will throw when accessed while the page is loading or in an iframe.
  // IE > 9 and Edge will throw when accessed in an iframe if document.body is unavailable.
  var activeElement;
  try {
    activeElement = document.activeElement;
  } catch(e) {
    activeElement = document.body || null;
  }
  while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement)
    { activeElement = activeElement.shadowRoot.activeElement; }
  return activeElement
}

function addClass(node, cls) {
  var current = node.className;
  if (!classTest(cls).test(current)) { node.className += (current ? " " : "") + cls; }
}
function joinClasses(a, b) {
  var as = a.split(" ");
  for (var i = 0; i < as.length; i++)
    { if (as[i] && !classTest(as[i]).test(b)) { b += " " + as[i]; } }
  return b
}

var selectInput = function(node) { node.select(); };
if (ios) // Mobile Safari apparently has a bug where select() is broken.
  { selectInput = function(node) { node.selectionStart = 0; node.selectionEnd = node.value.length; }; }
else if (ie) // Suppress mysterious IE10 errors
  { selectInput = function(node) { try { node.select(); } catch(_e) {} }; }

function bind(f) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function(){return f.apply(null, args)}
}

function copyObj(obj, target, overwrite) {
  if (!target) { target = {}; }
  for (var prop in obj)
    { if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
      { target[prop] = obj[prop]; } }
  return target
}

// Counts the column offset in a string, taking tabs into account.
// Used mostly to find indentation.
function countColumn(string, end, tabSize, startIndex, startValue) {
  if (end == null) {
    end = string.search(/[^\s\u00a0]/);
    if (end == -1) { end = string.length; }
  }
  for (var i = startIndex || 0, n = startValue || 0;;) {
    var nextTab = string.indexOf("\t", i);
    if (nextTab < 0 || nextTab >= end)
      { return n + (end - i) }
    n += nextTab - i;
    n += tabSize - (n % tabSize);
    i = nextTab + 1;
  }
}

var Delayed = function() {this.id = null;};
Delayed.prototype.set = function (ms, f) {
  clearTimeout(this.id);
  this.id = setTimeout(f, ms);
};

function indexOf(array, elt) {
  for (var i = 0; i < array.length; ++i)
    { if (array[i] == elt) { return i } }
  return -1
}

// Number of pixels added to scroller and sizer to hide scrollbar
var scrollerGap = 30;

// Returned or thrown by various protocols to signal 'I'm not
// handling this'.
var Pass = {toString: function(){return "CodeMirror.Pass"}};

// Reused option objects for setSelection & friends
var sel_dontScroll = {scroll: false};
var sel_mouse = {origin: "*mouse"};
var sel_move = {origin: "+move"};

// The inverse of countColumn -- find the offset that corresponds to
// a particular column.
function findColumn(string, goal, tabSize) {
  for (var pos = 0, col = 0;;) {
    var nextTab = string.indexOf("\t", pos);
    if (nextTab == -1) { nextTab = string.length; }
    var skipped = nextTab - pos;
    if (nextTab == string.length || col + skipped >= goal)
      { return pos + Math.min(skipped, goal - col) }
    col += nextTab - pos;
    col += tabSize - (col % tabSize);
    pos = nextTab + 1;
    if (col >= goal) { return pos }
  }
}

var spaceStrs = [""];
function spaceStr(n) {
  while (spaceStrs.length <= n)
    { spaceStrs.push(lst(spaceStrs) + " "); }
  return spaceStrs[n]
}

function lst(arr) { return arr[arr.length-1] }

function map(array, f) {
  var out = [];
  for (var i = 0; i < array.length; i++) { out[i] = f(array[i], i); }
  return out
}

function insertSorted(array, value, score) {
  var pos = 0, priority = score(value);
  while (pos < array.length && score(array[pos]) <= priority) { pos++; }
  array.splice(pos, 0, value);
}

function nothing() {}

function createObj(base, props) {
  var inst;
  if (Object.create) {
    inst = Object.create(base);
  } else {
    nothing.prototype = base;
    inst = new nothing();
  }
  if (props) { copyObj(props, inst); }
  return inst
}

var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
function isWordCharBasic(ch) {
  return /\w/.test(ch) || ch > "\x80" &&
    (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch))
}
function isWordChar(ch, helper) {
  if (!helper) { return isWordCharBasic(ch) }
  if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) { return true }
  return helper.test(ch)
}

function isEmpty(obj) {
  for (var n in obj) { if (obj.hasOwnProperty(n) && obj[n]) { return false } }
  return true
}

// Extending unicode characters. A series of a non-extending char +
// any number of extending chars is treated as a single unit as far
// as editing and measuring is concerned. This is not fully correct,
// since some scripts/fonts/browsers also treat other configurations
// of code points as a group.
var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
function isExtendingChar(ch) { return ch.charCodeAt(0) >= 768 && extendingChars.test(ch) }

// Returns a number from the range [`0`; `str.length`] unless `pos` is outside that range.
function skipExtendingChars(str, pos, dir) {
  while ((dir < 0 ? pos > 0 : pos < str.length) && isExtendingChar(str.charAt(pos))) { pos += dir; }
  return pos
}

// Returns the value from the range [`from`; `to`] that satisfies
// `pred` and is closest to `from`. Assumes that at least `to` satisfies `pred`.
function findFirst(pred, from, to) {
  for (;;) {
    if (Math.abs(from - to) <= 1) { return pred(from) ? from : to }
    var mid = Math.floor((from + to) / 2);
    if (pred(mid)) { to = mid; }
    else { from = mid; }
  }
}

// The display handles the DOM integration, both for input reading
// and content drawing. It holds references to DOM nodes and
// display-related state.

function Display(place, doc, input) {
  var d = this;
  this.input = input;

  // Covers bottom-right square when both scrollbars are present.
  d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
  d.scrollbarFiller.setAttribute("cm-not-content", "true");
  // Covers bottom of gutter when coverGutterNextToScrollbar is on
  // and h scrollbar is present.
  d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
  d.gutterFiller.setAttribute("cm-not-content", "true");
  // Will contain the actual code, positioned to cover the viewport.
  d.lineDiv = eltP("div", null, "CodeMirror-code");
  // Elements are added to these to represent selection and cursors.
  d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
  d.cursorDiv = elt("div", null, "CodeMirror-cursors");
  // A visibility: hidden element used to find the size of things.
  d.measure = elt("div", null, "CodeMirror-measure");
  // When lines outside of the viewport are measured, they are drawn in this.
  d.lineMeasure = elt("div", null, "CodeMirror-measure");
  // Wraps everything that needs to exist inside the vertically-padded coordinate system
  d.lineSpace = eltP("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv],
                    null, "position: relative; outline: none");
  var lines = eltP("div", [d.lineSpace], "CodeMirror-lines");
  // Moved around its parent to cover visible view.
  d.mover = elt("div", [lines], null, "position: relative");
  // Set to the height of the document, allowing scrolling.
  d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
  d.sizerWidth = null;
  // Behavior of elts with overflow: auto and padding is
  // inconsistent across browsers. This is used to ensure the
  // scrollable area is big enough.
  d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
  // Will contain the gutters, if any.
  d.gutters = elt("div", null, "CodeMirror-gutters");
  d.lineGutter = null;
  // Actual scrollable element.
  d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
  d.scroller.setAttribute("tabIndex", "-1");
  // The element in which the editor lives.
  d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

  // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
  if (ie && ie_version < 8) { d.gutters.style.zIndex = -1; d.scroller.style.paddingRight = 0; }
  if (!webkit && !(gecko && mobile)) { d.scroller.draggable = true; }

  if (place) {
    if (place.appendChild) { place.appendChild(d.wrapper); }
    else { place(d.wrapper); }
  }

  // Current rendered range (may be bigger than the view window).
  d.viewFrom = d.viewTo = doc.first;
  d.reportedViewFrom = d.reportedViewTo = doc.first;
  // Information about the rendered lines.
  d.view = [];
  d.renderedView = null;
  // Holds info about a single rendered line when it was rendered
  // for measurement, while not in view.
  d.externalMeasured = null;
  // Empty space (in pixels) above the view
  d.viewOffset = 0;
  d.lastWrapHeight = d.lastWrapWidth = 0;
  d.updateLineNumbers = null;

  d.nativeBarWidth = d.barHeight = d.barWidth = 0;
  d.scrollbarsClipped = false;

  // Used to only resize the line number gutter when necessary (when
  // the amount of lines crosses a boundary that makes its width change)
  d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
  // Set to true when a non-horizontal-scrolling line widget is
  // added. As an optimization, line widget aligning is skipped when
  // this is false.
  d.alignWidgets = false;

  d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;

  // Tracks the maximum line length so that the horizontal scrollbar
  // can be kept static when scrolling.
  d.maxLine = null;
  d.maxLineLength = 0;
  d.maxLineChanged = false;

  // Used for measuring wheel scrolling granularity
  d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;

  // True when shift is held down.
  d.shift = false;

  // Used to track whether anything happened since the context menu
  // was opened.
  d.selForContextMenu = null;

  d.activeTouch = null;

  input.init(d);
}

// Find the line object corresponding to the given line number.
function getLine(doc, n) {
  n -= doc.first;
  if (n < 0 || n >= doc.size) { throw new Error("There is no line " + (n + doc.first) + " in the document.") }
  var chunk = doc;
  while (!chunk.lines) {
    for (var i = 0;; ++i) {
      var child = chunk.children[i], sz = child.chunkSize();
      if (n < sz) { chunk = child; break }
      n -= sz;
    }
  }
  return chunk.lines[n]
}

// Get the part of a document between two positions, as an array of
// strings.
function getBetween(doc, start, end) {
  var out = [], n = start.line;
  doc.iter(start.line, end.line + 1, function (line) {
    var text = line.text;
    if (n == end.line) { text = text.slice(0, end.ch); }
    if (n == start.line) { text = text.slice(start.ch); }
    out.push(text);
    ++n;
  });
  return out
}
// Get the lines between from and to, as array of strings.
function getLines(doc, from, to) {
  var out = [];
  doc.iter(from, to, function (line) { out.push(line.text); }); // iter aborts when callback returns truthy value
  return out
}

// Update the height of a line, propagating the height change
// upwards to parent nodes.
function updateLineHeight(line, height) {
  var diff = height - line.height;
  if (diff) { for (var n = line; n; n = n.parent) { n.height += diff; } }
}

// Given a line object, find its line number by walking up through
// its parent links.
function lineNo(line) {
  if (line.parent == null) { return null }
  var cur = line.parent, no = indexOf(cur.lines, line);
  for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
    for (var i = 0;; ++i) {
      if (chunk.children[i] == cur) { break }
      no += chunk.children[i].chunkSize();
    }
  }
  return no + cur.first
}

// Find the line at the given vertical position, using the height
// information in the document tree.
function lineAtHeight(chunk, h) {
  var n = chunk.first;
  outer: do {
    for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
      var child = chunk.children[i$1], ch = child.height;
      if (h < ch) { chunk = child; continue outer }
      h -= ch;
      n += child.chunkSize();
    }
    return n
  } while (!chunk.lines)
  var i = 0;
  for (; i < chunk.lines.length; ++i) {
    var line = chunk.lines[i], lh = line.height;
    if (h < lh) { break }
    h -= lh;
  }
  return n + i
}

function isLine(doc, l) {return l >= doc.first && l < doc.first + doc.size}

function lineNumberFor(options, i) {
  return String(options.lineNumberFormatter(i + options.firstLineNumber))
}

// A Pos instance represents a position within the text.
function Pos(line, ch, sticky) {
  if ( sticky === void 0 ) sticky = null;

  if (!(this instanceof Pos)) { return new Pos(line, ch, sticky) }
  this.line = line;
  this.ch = ch;
  this.sticky = sticky;
}

// Compare two positions, return 0 if they are the same, a negative
// number when a is less, and a positive number otherwise.
function cmp(a, b) { return a.line - b.line || a.ch - b.ch }

function equalCursorPos(a, b) { return a.sticky == b.sticky && cmp(a, b) == 0 }

function copyPos(x) {return Pos(x.line, x.ch)}
function maxPos(a, b) { return cmp(a, b) < 0 ? b : a }
function minPos(a, b) { return cmp(a, b) < 0 ? a : b }

// Most of the external API clips given positions to make sure they
// actually exist within the document.
function clipLine(doc, n) {return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1))}
function clipPos(doc, pos) {
  if (pos.line < doc.first) { return Pos(doc.first, 0) }
  var last = doc.first + doc.size - 1;
  if (pos.line > last) { return Pos(last, getLine(doc, last).text.length) }
  return clipToLen(pos, getLine(doc, pos.line).text.length)
}
function clipToLen(pos, linelen) {
  var ch = pos.ch;
  if (ch == null || ch > linelen) { return Pos(pos.line, linelen) }
  else if (ch < 0) { return Pos(pos.line, 0) }
  else { return pos }
}
function clipPosArray(doc, array) {
  var out = [];
  for (var i = 0; i < array.length; i++) { out[i] = clipPos(doc, array[i]); }
  return out
}

// Optimize some code when these features are not used.
var sawReadOnlySpans = false;
var sawCollapsedSpans = false;

function seeReadOnlySpans() {
  sawReadOnlySpans = true;
}

function seeCollapsedSpans() {
  sawCollapsedSpans = true;
}

// TEXTMARKER SPANS

function MarkedSpan(marker, from, to) {
  this.marker = marker;
  this.from = from; this.to = to;
}

// Search an array of spans for a span matching the given marker.
function getMarkedSpanFor(spans, marker) {
  if (spans) { for (var i = 0; i < spans.length; ++i) {
    var span = spans[i];
    if (span.marker == marker) { return span }
  } }
}
// Remove a span from an array, returning undefined if no spans are
// left (we don't store arrays for lines without spans).
function removeMarkedSpan(spans, span) {
  var r;
  for (var i = 0; i < spans.length; ++i)
    { if (spans[i] != span) { (r || (r = [])).push(spans[i]); } }
  return r
}
// Add a span to a line.
function addMarkedSpan(line, span) {
  line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
  span.marker.attachLine(line);
}

// Used for the algorithm that adjusts markers for a change in the
// document. These functions cut an array of spans at a given
// character position, returning an array of remaining chunks (or
// undefined if nothing remains).
function markedSpansBefore(old, startCh, isInsert) {
  var nw;
  if (old) { for (var i = 0; i < old.length; ++i) {
    var span = old[i], marker = span.marker;
    var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
    if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
      var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);(nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
    }
  } }
  return nw
}
function markedSpansAfter(old, endCh, isInsert) {
  var nw;
  if (old) { for (var i = 0; i < old.length; ++i) {
    var span = old[i], marker = span.marker;
    var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
    if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
      var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);(nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh,
                                            span.to == null ? null : span.to - endCh));
    }
  } }
  return nw
}

// Given a change object, compute the new set of marker spans that
// cover the line in which the change took place. Removes spans
// entirely within the change, reconnects spans belonging to the
// same marker that appear on both sides of the change, and cuts off
// spans partially within the change. Returns an array of span
// arrays with one element for each line in (after) the change.
function stretchSpansOverChange(doc, change) {
  if (change.full) { return null }
  var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
  var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
  if (!oldFirst && !oldLast) { return null }

  var startCh = change.from.ch, endCh = change.to.ch, isInsert = cmp(change.from, change.to) == 0;
  // Get the spans that 'stick out' on both sides
  var first = markedSpansBefore(oldFirst, startCh, isInsert);
  var last = markedSpansAfter(oldLast, endCh, isInsert);

  // Next, merge those two ends
  var sameLine = change.text.length == 1, offset = lst(change.text).length + (sameLine ? startCh : 0);
  if (first) {
    // Fix up .to properties of first
    for (var i = 0; i < first.length; ++i) {
      var span = first[i];
      if (span.to == null) {
        var found = getMarkedSpanFor(last, span.marker);
        if (!found) { span.to = startCh; }
        else if (sameLine) { span.to = found.to == null ? null : found.to + offset; }
      }
    }
  }
  if (last) {
    // Fix up .from in last (or move them into first in case of sameLine)
    for (var i$1 = 0; i$1 < last.length; ++i$1) {
      var span$1 = last[i$1];
      if (span$1.to != null) { span$1.to += offset; }
      if (span$1.from == null) {
        var found$1 = getMarkedSpanFor(first, span$1.marker);
        if (!found$1) {
          span$1.from = offset;
          if (sameLine) { (first || (first = [])).push(span$1); }
        }
      } else {
        span$1.from += offset;
        if (sameLine) { (first || (first = [])).push(span$1); }
      }
    }
  }
  // Make sure we didn't create any zero-length spans
  if (first) { first = clearEmptySpans(first); }
  if (last && last != first) { last = clearEmptySpans(last); }

  var newMarkers = [first];
  if (!sameLine) {
    // Fill gap with whole-line-spans
    var gap = change.text.length - 2, gapMarkers;
    if (gap > 0 && first)
      { for (var i$2 = 0; i$2 < first.length; ++i$2)
        { if (first[i$2].to == null)
          { (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker, null, null)); } } }
    for (var i$3 = 0; i$3 < gap; ++i$3)
      { newMarkers.push(gapMarkers); }
    newMarkers.push(last);
  }
  return newMarkers
}

// Remove spans that are empty and don't have a clearWhenEmpty
// option of false.
function clearEmptySpans(spans) {
  for (var i = 0; i < spans.length; ++i) {
    var span = spans[i];
    if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
      { spans.splice(i--, 1); }
  }
  if (!spans.length) { return null }
  return spans
}

// Used to 'clip' out readOnly ranges when making a change.
function removeReadOnlyRanges(doc, from, to) {
  var markers = null;
  doc.iter(from.line, to.line + 1, function (line) {
    if (line.markedSpans) { for (var i = 0; i < line.markedSpans.length; ++i) {
      var mark = line.markedSpans[i].marker;
      if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
        { (markers || (markers = [])).push(mark); }
    } }
  });
  if (!markers) { return null }
  var parts = [{from: from, to: to}];
  for (var i = 0; i < markers.length; ++i) {
    var mk = markers[i], m = mk.find(0);
    for (var j = 0; j < parts.length; ++j) {
      var p = parts[j];
      if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) { continue }
      var newParts = [j, 1], dfrom = cmp(p.from, m.from), dto = cmp(p.to, m.to);
      if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
        { newParts.push({from: p.from, to: m.from}); }
      if (dto > 0 || !mk.inclusiveRight && !dto)
        { newParts.push({from: m.to, to: p.to}); }
      parts.splice.apply(parts, newParts);
      j += newParts.length - 3;
    }
  }
  return parts
}

// Connect or disconnect spans from a line.
function detachMarkedSpans(line) {
  var spans = line.markedSpans;
  if (!spans) { return }
  for (var i = 0; i < spans.length; ++i)
    { spans[i].marker.detachLine(line); }
  line.markedSpans = null;
}
function attachMarkedSpans(line, spans) {
  if (!spans) { return }
  for (var i = 0; i < spans.length; ++i)
    { spans[i].marker.attachLine(line); }
  line.markedSpans = spans;
}

// Helpers used when computing which overlapping collapsed span
// counts as the larger one.
function extraLeft(marker) { return marker.inclusiveLeft ? -1 : 0 }
function extraRight(marker) { return marker.inclusiveRight ? 1 : 0 }

// Returns a number indicating which of two overlapping collapsed
// spans is larger (and thus includes the other). Falls back to
// comparing ids when the spans cover exactly the same range.
function compareCollapsedMarkers(a, b) {
  var lenDiff = a.lines.length - b.lines.length;
  if (lenDiff != 0) { return lenDiff }
  var aPos = a.find(), bPos = b.find();
  var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
  if (fromCmp) { return -fromCmp }
  var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
  if (toCmp) { return toCmp }
  return b.id - a.id
}

// Find out whether a line ends or starts in a collapsed span. If
// so, return the marker for that span.
function collapsedSpanAtSide(line, start) {
  var sps = sawCollapsedSpans && line.markedSpans, found;
  if (sps) { for (var sp = (void 0), i = 0; i < sps.length; ++i) {
    sp = sps[i];
    if (sp.marker.collapsed && (start ? sp.from : sp.to) == null &&
        (!found || compareCollapsedMarkers(found, sp.marker) < 0))
      { found = sp.marker; }
  } }
  return found
}
function collapsedSpanAtStart(line) { return collapsedSpanAtSide(line, true) }
function collapsedSpanAtEnd(line) { return collapsedSpanAtSide(line, false) }

// Test whether there exists a collapsed span that partially
// overlaps (covers the start or end, but not both) of a new span.
// Such overlap is not allowed.
function conflictingCollapsedRange(doc, lineNo$$1, from, to, marker) {
  var line = getLine(doc, lineNo$$1);
  var sps = sawCollapsedSpans && line.markedSpans;
  if (sps) { for (var i = 0; i < sps.length; ++i) {
    var sp = sps[i];
    if (!sp.marker.collapsed) { continue }
    var found = sp.marker.find(0);
    var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
    var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
    if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) { continue }
    if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) ||
        fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0))
      { return true }
  } }
}

// A visual line is a line as drawn on the screen. Folding, for
// example, can cause multiple logical lines to appear on the same
// visual line. This finds the start of the visual line that the
// given line is part of (usually that is the line itself).
function visualLine(line) {
  var merged;
  while (merged = collapsedSpanAtStart(line))
    { line = merged.find(-1, true).line; }
  return line
}

function visualLineEnd(line) {
  var merged;
  while (merged = collapsedSpanAtEnd(line))
    { line = merged.find(1, true).line; }
  return line
}

// Returns an array of logical lines that continue the visual line
// started by the argument, or undefined if there are no such lines.
function visualLineContinued(line) {
  var merged, lines;
  while (merged = collapsedSpanAtEnd(line)) {
    line = merged.find(1, true).line
    ;(lines || (lines = [])).push(line);
  }
  return lines
}

// Get the line number of the start of the visual line that the
// given line number is part of.
function visualLineNo(doc, lineN) {
  var line = getLine(doc, lineN), vis = visualLine(line);
  if (line == vis) { return lineN }
  return lineNo(vis)
}

// Get the line number of the start of the next visual line after
// the given line.
function visualLineEndNo(doc, lineN) {
  if (lineN > doc.lastLine()) { return lineN }
  var line = getLine(doc, lineN), merged;
  if (!lineIsHidden(doc, line)) { return lineN }
  while (merged = collapsedSpanAtEnd(line))
    { line = merged.find(1, true).line; }
  return lineNo(line) + 1
}

// Compute whether a line is hidden. Lines count as hidden when they
// are part of a visual line that starts with another line, or when
// they are entirely covered by collapsed, non-widget span.
function lineIsHidden(doc, line) {
  var sps = sawCollapsedSpans && line.markedSpans;
  if (sps) { for (var sp = (void 0), i = 0; i < sps.length; ++i) {
    sp = sps[i];
    if (!sp.marker.collapsed) { continue }
    if (sp.from == null) { return true }
    if (sp.marker.widgetNode) { continue }
    if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
      { return true }
  } }
}
function lineIsHiddenInner(doc, line, span) {
  if (span.to == null) {
    var end = span.marker.find(1, true);
    return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker))
  }
  if (span.marker.inclusiveRight && span.to == line.text.length)
    { return true }
  for (var sp = (void 0), i = 0; i < line.markedSpans.length; ++i) {
    sp = line.markedSpans[i];
    if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to &&
        (sp.to == null || sp.to != span.from) &&
        (sp.marker.inclusiveLeft || span.marker.inclusiveRight) &&
        lineIsHiddenInner(doc, line, sp)) { return true }
  }
}

// Find the height above the given line.
function heightAtLine(lineObj) {
  lineObj = visualLine(lineObj);

  var h = 0, chunk = lineObj.parent;
  for (var i = 0; i < chunk.lines.length; ++i) {
    var line = chunk.lines[i];
    if (line == lineObj) { break }
    else { h += line.height; }
  }
  for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
    for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
      var cur = p.children[i$1];
      if (cur == chunk) { break }
      else { h += cur.height; }
    }
  }
  return h
}

// Compute the character length of a line, taking into account
// collapsed ranges (see markText) that might hide parts, and join
// other lines onto it.
function lineLength(line) {
  if (line.height == 0) { return 0 }
  var len = line.text.length, merged, cur = line;
  while (merged = collapsedSpanAtStart(cur)) {
    var found = merged.find(0, true);
    cur = found.from.line;
    len += found.from.ch - found.to.ch;
  }
  cur = line;
  while (merged = collapsedSpanAtEnd(cur)) {
    var found$1 = merged.find(0, true);
    len -= cur.text.length - found$1.from.ch;
    cur = found$1.to.line;
    len += cur.text.length - found$1.to.ch;
  }
  return len
}

// Find the longest line in the document.
function findMaxLine(cm) {
  var d = cm.display, doc = cm.doc;
  d.maxLine = getLine(doc, doc.first);
  d.maxLineLength = lineLength(d.maxLine);
  d.maxLineChanged = true;
  doc.iter(function (line) {
    var len = lineLength(line);
    if (len > d.maxLineLength) {
      d.maxLineLength = len;
      d.maxLine = line;
    }
  });
}

// BIDI HELPERS

function iterateBidiSections(order, from, to, f) {
  if (!order) { return f(from, to, "ltr") }
  var found = false;
  for (var i = 0; i < order.length; ++i) {
    var part = order[i];
    if (part.from < to && part.to > from || from == to && part.to == from) {
      f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr");
      found = true;
    }
  }
  if (!found) { f(from, to, "ltr"); }
}

var bidiOther = null;
function getBidiPartAt(order, ch, sticky) {
  var found;
  bidiOther = null;
  for (var i = 0; i < order.length; ++i) {
    var cur = order[i];
    if (cur.from < ch && cur.to > ch) { return i }
    if (cur.to == ch) {
      if (cur.from != cur.to && sticky == "before") { found = i; }
      else { bidiOther = i; }
    }
    if (cur.from == ch) {
      if (cur.from != cur.to && sticky != "before") { found = i; }
      else { bidiOther = i; }
    }
  }
  return found != null ? found : bidiOther
}

// Bidirectional ordering algorithm
// See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
// that this (partially) implements.

// One-char codes used for character types:
// L (L):   Left-to-Right
// R (R):   Right-to-Left
// r (AL):  Right-to-Left Arabic
// 1 (EN):  European Number
// + (ES):  European Number Separator
// % (ET):  European Number Terminator
// n (AN):  Arabic Number
// , (CS):  Common Number Separator
// m (NSM): Non-Spacing Mark
// b (BN):  Boundary Neutral
// s (B):   Paragraph Separator
// t (S):   Segment Separator
// w (WS):  Whitespace
// N (ON):  Other Neutrals

// Returns null if characters are ordered as they appear
// (left-to-right), or an array of sections ({from, to, level}
// objects) in the order in which they occur visually.
var bidiOrdering = (function() {
  // Character types for codepoints 0 to 0xff
  var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
  // Character types for codepoints 0x600 to 0x6f9
  var arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";
  function charType(code) {
    if (code <= 0xf7) { return lowTypes.charAt(code) }
    else if (0x590 <= code && code <= 0x5f4) { return "R" }
    else if (0x600 <= code && code <= 0x6f9) { return arabicTypes.charAt(code - 0x600) }
    else if (0x6ee <= code && code <= 0x8ac) { return "r" }
    else if (0x2000 <= code && code <= 0x200b) { return "w" }
    else if (code == 0x200c) { return "b" }
    else { return "L" }
  }

  var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
  var isNeutral = /[stwN]/, isStrong = /[LRr]/, countsAsLeft = /[Lb1n]/, countsAsNum = /[1n]/;

  function BidiSpan(level, from, to) {
    this.level = level;
    this.from = from; this.to = to;
  }

  return function(str, direction) {
    var outerType = direction == "ltr" ? "L" : "R";

    if (str.length == 0 || direction == "ltr" && !bidiRE.test(str)) { return false }
    var len = str.length, types = [];
    for (var i = 0; i < len; ++i)
      { types.push(charType(str.charCodeAt(i))); }

    // W1. Examine each non-spacing mark (NSM) in the level run, and
    // change the type of the NSM to the type of the previous
    // character. If the NSM is at the start of the level run, it will
    // get the type of sor.
    for (var i$1 = 0, prev = outerType; i$1 < len; ++i$1) {
      var type = types[i$1];
      if (type == "m") { types[i$1] = prev; }
      else { prev = type; }
    }

    // W2. Search backwards from each instance of a European number
    // until the first strong type (R, L, AL, or sor) is found. If an
    // AL is found, change the type of the European number to Arabic
    // number.
    // W3. Change all ALs to R.
    for (var i$2 = 0, cur = outerType; i$2 < len; ++i$2) {
      var type$1 = types[i$2];
      if (type$1 == "1" && cur == "r") { types[i$2] = "n"; }
      else if (isStrong.test(type$1)) { cur = type$1; if (type$1 == "r") { types[i$2] = "R"; } }
    }

    // W4. A single European separator between two European numbers
    // changes to a European number. A single common separator between
    // two numbers of the same type changes to that type.
    for (var i$3 = 1, prev$1 = types[0]; i$3 < len - 1; ++i$3) {
      var type$2 = types[i$3];
      if (type$2 == "+" && prev$1 == "1" && types[i$3+1] == "1") { types[i$3] = "1"; }
      else if (type$2 == "," && prev$1 == types[i$3+1] &&
               (prev$1 == "1" || prev$1 == "n")) { types[i$3] = prev$1; }
      prev$1 = type$2;
    }

    // W5. A sequence of European terminators adjacent to European
    // numbers changes to all European numbers.
    // W6. Otherwise, separators and terminators change to Other
    // Neutral.
    for (var i$4 = 0; i$4 < len; ++i$4) {
      var type$3 = types[i$4];
      if (type$3 == ",") { types[i$4] = "N"; }
      else if (type$3 == "%") {
        var end = (void 0);
        for (end = i$4 + 1; end < len && types[end] == "%"; ++end) {}
        var replace = (i$4 && types[i$4-1] == "!") || (end < len && types[end] == "1") ? "1" : "N";
        for (var j = i$4; j < end; ++j) { types[j] = replace; }
        i$4 = end - 1;
      }
    }

    // W7. Search backwards from each instance of a European number
    // until the first strong type (R, L, or sor) is found. If an L is
    // found, then change the type of the European number to L.
    for (var i$5 = 0, cur$1 = outerType; i$5 < len; ++i$5) {
      var type$4 = types[i$5];
      if (cur$1 == "L" && type$4 == "1") { types[i$5] = "L"; }
      else if (isStrong.test(type$4)) { cur$1 = type$4; }
    }

    // N1. A sequence of neutrals takes the direction of the
    // surrounding strong text if the text on both sides has the same
    // direction. European and Arabic numbers act as if they were R in
    // terms of their influence on neutrals. Start-of-level-run (sor)
    // and end-of-level-run (eor) are used at level run boundaries.
    // N2. Any remaining neutrals take the embedding direction.
    for (var i$6 = 0; i$6 < len; ++i$6) {
      if (isNeutral.test(types[i$6])) {
        var end$1 = (void 0);
        for (end$1 = i$6 + 1; end$1 < len && isNeutral.test(types[end$1]); ++end$1) {}
        var before = (i$6 ? types[i$6-1] : outerType) == "L";
        var after = (end$1 < len ? types[end$1] : outerType) == "L";
        var replace$1 = before == after ? (before ? "L" : "R") : outerType;
        for (var j$1 = i$6; j$1 < end$1; ++j$1) { types[j$1] = replace$1; }
        i$6 = end$1 - 1;
      }
    }

    // Here we depart from the documented algorithm, in order to avoid
    // building up an actual levels array. Since there are only three
    // levels (0, 1, 2) in an implementation that doesn't take
    // explicit embedding into account, we can build up the order on
    // the fly, without following the level-based algorithm.
    var order = [], m;
    for (var i$7 = 0; i$7 < len;) {
      if (countsAsLeft.test(types[i$7])) {
        var start = i$7;
        for (++i$7; i$7 < len && countsAsLeft.test(types[i$7]); ++i$7) {}
        order.push(new BidiSpan(0, start, i$7));
      } else {
        var pos = i$7, at = order.length;
        for (++i$7; i$7 < len && types[i$7] != "L"; ++i$7) {}
        for (var j$2 = pos; j$2 < i$7;) {
          if (countsAsNum.test(types[j$2])) {
            if (pos < j$2) { order.splice(at, 0, new BidiSpan(1, pos, j$2)); }
            var nstart = j$2;
            for (++j$2; j$2 < i$7 && countsAsNum.test(types[j$2]); ++j$2) {}
            order.splice(at, 0, new BidiSpan(2, nstart, j$2));
            pos = j$2;
          } else { ++j$2; }
        }
        if (pos < i$7) { order.splice(at, 0, new BidiSpan(1, pos, i$7)); }
      }
    }
    if (order[0].level == 1 && (m = str.match(/^\s+/))) {
      order[0].from = m[0].length;
      order.unshift(new BidiSpan(0, 0, m[0].length));
    }
    if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
      lst(order).to -= m[0].length;
      order.push(new BidiSpan(0, len - m[0].length, len));
    }

    return direction == "rtl" ? order.reverse() : order
  }
})();

// Get the bidi ordering for the given line (and cache it). Returns
// false for lines that are fully left-to-right, and an array of
// BidiSpan objects otherwise.
function getOrder(line, direction) {
  var order = line.order;
  if (order == null) { order = line.order = bidiOrdering(line.text, direction); }
  return order
}

function moveCharLogically(line, ch, dir) {
  var target = skipExtendingChars(line.text, ch + dir, dir);
  return target < 0 || target > line.text.length ? null : target
}

function moveLogically(line, start, dir) {
  var ch = moveCharLogically(line, start.ch, dir);
  return ch == null ? null : new Pos(start.line, ch, dir < 0 ? "after" : "before")
}

function endOfLine(visually, cm, lineObj, lineNo, dir) {
  if (visually) {
    var order = getOrder(lineObj, cm.doc.direction);
    if (order) {
      var part = dir < 0 ? lst(order) : order[0];
      var moveInStorageOrder = (dir < 0) == (part.level == 1);
      var sticky = moveInStorageOrder ? "after" : "before";
      var ch;
      // With a wrapped rtl chunk (possibly spanning multiple bidi parts),
      // it could be that the last bidi part is not on the last visual line,
      // since visual lines contain content order-consecutive chunks.
      // Thus, in rtl, we are looking for the first (content-order) character
      // in the rtl chunk that is on the last line (that is, the same line
      // as the last (content-order) character).
      if (part.level > 0) {
        var prep = prepareMeasureForLine(cm, lineObj);
        ch = dir < 0 ? lineObj.text.length - 1 : 0;
        var targetTop = measureCharPrepared(cm, prep, ch).top;
        ch = findFirst(function (ch) { return measureCharPrepared(cm, prep, ch).top == targetTop; }, (dir < 0) == (part.level == 1) ? part.from : part.to - 1, ch);
        if (sticky == "before") { ch = moveCharLogically(lineObj, ch, 1); }
      } else { ch = dir < 0 ? part.to : part.from; }
      return new Pos(lineNo, ch, sticky)
    }
  }
  return new Pos(lineNo, dir < 0 ? lineObj.text.length : 0, dir < 0 ? "before" : "after")
}

function moveVisually(cm, line, start, dir) {
  var bidi = getOrder(line, cm.doc.direction);
  if (!bidi) { return moveLogically(line, start, dir) }
  if (start.ch >= line.text.length) {
    start.ch = line.text.length;
    start.sticky = "before";
  } else if (start.ch <= 0) {
    start.ch = 0;
    start.sticky = "after";
  }
  var partPos = getBidiPartAt(bidi, start.ch, start.sticky), part = bidi[partPos];
  if (cm.doc.direction == "ltr" && part.level % 2 == 0 && (dir > 0 ? part.to > start.ch : part.from < start.ch)) {
    // Case 1: We move within an ltr part in an ltr editor. Even with wrapped lines,
    // nothing interesting happens.
    return moveLogically(line, start, dir)
  }

  var mv = function (pos, dir) { return moveCharLogically(line, pos instanceof Pos ? pos.ch : pos, dir); };
  var prep;
  var getWrappedLineExtent = function (ch) {
    if (!cm.options.lineWrapping) { return {begin: 0, end: line.text.length} }
    prep = prep || prepareMeasureForLine(cm, line);
    return wrappedLineExtentChar(cm, line, prep, ch)
  };
  var wrappedLineExtent = getWrappedLineExtent(start.sticky == "before" ? mv(start, -1) : start.ch);

  if (cm.doc.direction == "rtl" || part.level == 1) {
    var moveInStorageOrder = (part.level == 1) == (dir < 0);
    var ch = mv(start, moveInStorageOrder ? 1 : -1);
    if (ch != null && (!moveInStorageOrder ? ch >= part.from && ch >= wrappedLineExtent.begin : ch <= part.to && ch <= wrappedLineExtent.end)) {
      // Case 2: We move within an rtl part or in an rtl editor on the same visual line
      var sticky = moveInStorageOrder ? "before" : "after";
      return new Pos(start.line, ch, sticky)
    }
  }

  // Case 3: Could not move within this bidi part in this visual line, so leave
  // the current bidi part

  var searchInVisualLine = function (partPos, dir, wrappedLineExtent) {
    var getRes = function (ch, moveInStorageOrder) { return moveInStorageOrder
      ? new Pos(start.line, mv(ch, 1), "before")
      : new Pos(start.line, ch, "after"); };

    for (; partPos >= 0 && partPos < bidi.length; partPos += dir) {
      var part = bidi[partPos];
      var moveInStorageOrder = (dir > 0) == (part.level != 1);
      var ch = moveInStorageOrder ? wrappedLineExtent.begin : mv(wrappedLineExtent.end, -1);
      if (part.from <= ch && ch < part.to) { return getRes(ch, moveInStorageOrder) }
      ch = moveInStorageOrder ? part.from : mv(part.to, -1);
      if (wrappedLineExtent.begin <= ch && ch < wrappedLineExtent.end) { return getRes(ch, moveInStorageOrder) }
    }
  };

  // Case 3a: Look for other bidi parts on the same visual line
  var res = searchInVisualLine(partPos + dir, dir, wrappedLineExtent);
  if (res) { return res }

  // Case 3b: Look for other bidi parts on the next visual line
  var nextCh = dir > 0 ? wrappedLineExtent.end : mv(wrappedLineExtent.begin, -1);
  if (nextCh != null && !(dir > 0 && nextCh == line.text.length)) {
    res = searchInVisualLine(dir > 0 ? 0 : bidi.length - 1, dir, getWrappedLineExtent(nextCh));
    if (res) { return res }
  }

  // Case 4: Nowhere to move
  return null
}

// EVENT HANDLING

// Lightweight event framework. on/off also work on DOM nodes,
// registering native DOM handlers.

var noHandlers = [];

var on = function(emitter, type, f) {
  if (emitter.addEventListener) {
    emitter.addEventListener(type, f, false);
  } else if (emitter.attachEvent) {
    emitter.attachEvent("on" + type, f);
  } else {
    var map$$1 = emitter._handlers || (emitter._handlers = {});
    map$$1[type] = (map$$1[type] || noHandlers).concat(f);
  }
};

function getHandlers(emitter, type) {
  return emitter._handlers && emitter._handlers[type] || noHandlers
}

function off(emitter, type, f) {
  if (emitter.removeEventListener) {
    emitter.removeEventListener(type, f, false);
  } else if (emitter.detachEvent) {
    emitter.detachEvent("on" + type, f);
  } else {
    var map$$1 = emitter._handlers, arr = map$$1 && map$$1[type];
    if (arr) {
      var index = indexOf(arr, f);
      if (index > -1)
        { map$$1[type] = arr.slice(0, index).concat(arr.slice(index + 1)); }
    }
  }
}

function signal(emitter, type /*, values...*/) {
  var handlers = getHandlers(emitter, type);
  if (!handlers.length) { return }
  var args = Array.prototype.slice.call(arguments, 2);
  for (var i = 0; i < handlers.length; ++i) { handlers[i].apply(null, args); }
}

// The DOM events that CodeMirror handles can be overridden by
// registering a (non-DOM) handler on the editor for the event name,
// and preventDefault-ing the event in that handler.
function signalDOMEvent(cm, e, override) {
  if (typeof e == "string")
    { e = {type: e, preventDefault: function() { this.defaultPrevented = true; }}; }
  signal(cm, override || e.type, cm, e);
  return e_defaultPrevented(e) || e.codemirrorIgnore
}

function signalCursorActivity(cm) {
  var arr = cm._handlers && cm._handlers.cursorActivity;
  if (!arr) { return }
  var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
  for (var i = 0; i < arr.length; ++i) { if (indexOf(set, arr[i]) == -1)
    { set.push(arr[i]); } }
}

function hasHandler(emitter, type) {
  return getHandlers(emitter, type).length > 0
}

// Add on and off methods to a constructor's prototype, to make
// registering events on such objects more convenient.
function eventMixin(ctor) {
  ctor.prototype.on = function(type, f) {on(this, type, f);};
  ctor.prototype.off = function(type, f) {off(this, type, f);};
}

// Due to the fact that we still support jurassic IE versions, some
// compatibility wrappers are needed.

function e_preventDefault(e) {
  if (e.preventDefault) { e.preventDefault(); }
  else { e.returnValue = false; }
}
function e_stopPropagation(e) {
  if (e.stopPropagation) { e.stopPropagation(); }
  else { e.cancelBubble = true; }
}
function e_defaultPrevented(e) {
  return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false
}
function e_stop(e) {e_preventDefault(e); e_stopPropagation(e);}

function e_target(e) {return e.target || e.srcElement}
function e_button(e) {
  var b = e.which;
  if (b == null) {
    if (e.button & 1) { b = 1; }
    else if (e.button & 2) { b = 3; }
    else if (e.button & 4) { b = 2; }
  }
  if (mac && e.ctrlKey && b == 1) { b = 3; }
  return b
}

// Detect drag-and-drop
var dragAndDrop = function() {
  // There is *some* kind of drag-and-drop support in IE6-8, but I
  // couldn't get it to work yet.
  if (ie && ie_version < 9) { return false }
  var div = elt('div');
  return "draggable" in div || "dragDrop" in div
}();

var zwspSupported;
function zeroWidthElement(measure) {
  if (zwspSupported == null) {
    var test = elt("span", "\u200b");
    removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
    if (measure.firstChild.offsetHeight != 0)
      { zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8); }
  }
  var node = zwspSupported ? elt("span", "\u200b") :
    elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
  node.setAttribute("cm-text", "");
  return node
}

// Feature-detect IE's crummy client rect reporting for bidi text
var badBidiRects;
function hasBadBidiRects(measure) {
  if (badBidiRects != null) { return badBidiRects }
  var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
  var r0 = range(txt, 0, 1).getBoundingClientRect();
  var r1 = range(txt, 1, 2).getBoundingClientRect();
  removeChildren(measure);
  if (!r0 || r0.left == r0.right) { return false } // Safari returns null in some cases (#2780)
  return badBidiRects = (r1.right - r0.right < 3)
}

// See if "".split is the broken IE version, if so, provide an
// alternative way to split lines.
var splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? function (string) {
  var pos = 0, result = [], l = string.length;
  while (pos <= l) {
    var nl = string.indexOf("\n", pos);
    if (nl == -1) { nl = string.length; }
    var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
    var rt = line.indexOf("\r");
    if (rt != -1) {
      result.push(line.slice(0, rt));
      pos += rt + 1;
    } else {
      result.push(line);
      pos = nl + 1;
    }
  }
  return result
} : function (string) { return string.split(/\r\n?|\n/); };

var hasSelection = window.getSelection ? function (te) {
  try { return te.selectionStart != te.selectionEnd }
  catch(e) { return false }
} : function (te) {
  var range$$1;
  try {range$$1 = te.ownerDocument.selection.createRange();}
  catch(e) {}
  if (!range$$1 || range$$1.parentElement() != te) { return false }
  return range$$1.compareEndPoints("StartToEnd", range$$1) != 0
};

var hasCopyEvent = (function () {
  var e = elt("div");
  if ("oncopy" in e) { return true }
  e.setAttribute("oncopy", "return;");
  return typeof e.oncopy == "function"
})();

var badZoomedRects = null;
function hasBadZoomedRects(measure) {
  if (badZoomedRects != null) { return badZoomedRects }
  var node = removeChildrenAndAdd(measure, elt("span", "x"));
  var normal = node.getBoundingClientRect();
  var fromRange = range(node, 0, 1).getBoundingClientRect();
  return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1
}

// Known modes, by name and by MIME
var modes = {};
var mimeModes = {};

// Extra arguments are stored as the mode's dependencies, which is
// used by (legacy) mechanisms like loadmode.js to automatically
// load a mode. (Preferred mechanism is the require/define calls.)
function defineMode(name, mode) {
  if (arguments.length > 2)
    { mode.dependencies = Array.prototype.slice.call(arguments, 2); }
  modes[name] = mode;
}

function defineMIME(mime, spec) {
  mimeModes[mime] = spec;
}

// Given a MIME type, a {name, ...options} config object, or a name
// string, return a mode config object.
function resolveMode(spec) {
  if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
    spec = mimeModes[spec];
  } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
    var found = mimeModes[spec.name];
    if (typeof found == "string") { found = {name: found}; }
    spec = createObj(found, spec);
    spec.name = found.name;
  } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
    return resolveMode("application/xml")
  } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) {
    return resolveMode("application/json")
  }
  if (typeof spec == "string") { return {name: spec} }
  else { return spec || {name: "null"} }
}

// Given a mode spec (anything that resolveMode accepts), find and
// initialize an actual mode object.
function getMode(options, spec) {
  spec = resolveMode(spec);
  var mfactory = modes[spec.name];
  if (!mfactory) { return getMode(options, "text/plain") }
  var modeObj = mfactory(options, spec);
  if (modeExtensions.hasOwnProperty(spec.name)) {
    var exts = modeExtensions[spec.name];
    for (var prop in exts) {
      if (!exts.hasOwnProperty(prop)) { continue }
      if (modeObj.hasOwnProperty(prop)) { modeObj["_" + prop] = modeObj[prop]; }
      modeObj[prop] = exts[prop];
    }
  }
  modeObj.name = spec.name;
  if (spec.helperType) { modeObj.helperType = spec.helperType; }
  if (spec.modeProps) { for (var prop$1 in spec.modeProps)
    { modeObj[prop$1] = spec.modeProps[prop$1]; } }

  return modeObj
}

// This can be used to attach properties to mode objects from
// outside the actual mode definition.
var modeExtensions = {};
function extendMode(mode, properties) {
  var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {});
  copyObj(properties, exts);
}

function copyState(mode, state) {
  if (state === true) { return state }
  if (mode.copyState) { return mode.copyState(state) }
  var nstate = {};
  for (var n in state) {
    var val = state[n];
    if (val instanceof Array) { val = val.concat([]); }
    nstate[n] = val;
  }
  return nstate
}

// Given a mode and a state (for that mode), find the inner mode and
// state at the position that the state refers to.
function innerMode(mode, state) {
  var info;
  while (mode.innerMode) {
    info = mode.innerMode(state);
    if (!info || info.mode == mode) { break }
    state = info.state;
    mode = info.mode;
  }
  return info || {mode: mode, state: state}
}

function startState(mode, a1, a2) {
  return mode.startState ? mode.startState(a1, a2) : true
}

// STRING STREAM

// Fed to the mode parsers, provides helper functions to make
// parsers more succinct.

var StringStream = function(string, tabSize) {
  this.pos = this.start = 0;
  this.string = string;
  this.tabSize = tabSize || 8;
  this.lastColumnPos = this.lastColumnValue = 0;
  this.lineStart = 0;
};

StringStream.prototype.eol = function () {return this.pos >= this.string.length};
StringStream.prototype.sol = function () {return this.pos == this.lineStart};
StringStream.prototype.peek = function () {return this.string.charAt(this.pos) || undefined};
StringStream.prototype.next = function () {
  if (this.pos < this.string.length)
    { return this.string.charAt(this.pos++) }
};
StringStream.prototype.eat = function (match) {
  var ch = this.string.charAt(this.pos);
  var ok;
  if (typeof match == "string") { ok = ch == match; }
  else { ok = ch && (match.test ? match.test(ch) : match(ch)); }
  if (ok) {++this.pos; return ch}
};
StringStream.prototype.eatWhile = function (match) {
  var start = this.pos;
  while (this.eat(match)){}
  return this.pos > start
};
StringStream.prototype.eatSpace = function () {
    var this$1 = this;

  var start = this.pos;
  while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) { ++this$1.pos; }
  return this.pos > start
};
StringStream.prototype.skipToEnd = function () {this.pos = this.string.length;};
StringStream.prototype.skipTo = function (ch) {
  var found = this.string.indexOf(ch, this.pos);
  if (found > -1) {this.pos = found; return true}
};
StringStream.prototype.backUp = function (n) {this.pos -= n;};
StringStream.prototype.column = function () {
  if (this.lastColumnPos < this.start) {
    this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
    this.lastColumnPos = this.start;
  }
  return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
};
StringStream.prototype.indentation = function () {
  return countColumn(this.string, null, this.tabSize) -
    (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
};
StringStream.prototype.match = function (pattern, consume, caseInsensitive) {
  if (typeof pattern == "string") {
    var cased = function (str) { return caseInsensitive ? str.toLowerCase() : str; };
    var substr = this.string.substr(this.pos, pattern.length);
    if (cased(substr) == cased(pattern)) {
      if (consume !== false) { this.pos += pattern.length; }
      return true
    }
  } else {
    var match = this.string.slice(this.pos).match(pattern);
    if (match && match.index > 0) { return null }
    if (match && consume !== false) { this.pos += match[0].length; }
    return match
  }
};
StringStream.prototype.current = function (){return this.string.slice(this.start, this.pos)};
StringStream.prototype.hideFirstChars = function (n, inner) {
  this.lineStart += n;
  try { return inner() }
  finally { this.lineStart -= n; }
};

// Compute a style array (an array starting with a mode generation
// -- for invalidation -- followed by pairs of end positions and
// style strings), which is used to highlight the tokens on the
// line.
function highlightLine(cm, line, state, forceToEnd) {
  // A styles array always starts with a number identifying the
  // mode/overlays that it is based on (for easy invalidation).
  var st = [cm.state.modeGen], lineClasses = {};
  // Compute the base array of styles
  runMode(cm, line.text, cm.doc.mode, state, function (end, style) { return st.push(end, style); },
    lineClasses, forceToEnd);

  // Run overlays, adjust style array.
  var loop = function ( o ) {
    var overlay = cm.state.overlays[o], i = 1, at = 0;
    runMode(cm, line.text, overlay.mode, true, function (end, style) {
      var start = i;
      // Ensure there's a token end at the current position, and that i points at it
      while (at < end) {
        var i_end = st[i];
        if (i_end > end)
          { st.splice(i, 1, end, st[i+1], i_end); }
        i += 2;
        at = Math.min(end, i_end);
      }
      if (!style) { return }
      if (overlay.opaque) {
        st.splice(start, i - start, end, "overlay " + style);
        i = start + 2;
      } else {
        for (; start < i; start += 2) {
          var cur = st[start+1];
          st[start+1] = (cur ? cur + " " : "") + "overlay " + style;
        }
      }
    }, lineClasses);
  };

  for (var o = 0; o < cm.state.overlays.length; ++o) loop( o );

  return {styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null}
}

function getLineStyles(cm, line, updateFrontier) {
  if (!line.styles || line.styles[0] != cm.state.modeGen) {
    var state = getStateBefore(cm, lineNo(line));
    var result = highlightLine(cm, line, line.text.length > cm.options.maxHighlightLength ? copyState(cm.doc.mode, state) : state);
    line.stateAfter = state;
    line.styles = result.styles;
    if (result.classes) { line.styleClasses = result.classes; }
    else if (line.styleClasses) { line.styleClasses = null; }
    if (updateFrontier === cm.doc.frontier) { cm.doc.frontier++; }
  }
  return line.styles
}

function getStateBefore(cm, n, precise) {
  var doc = cm.doc, display = cm.display;
  if (!doc.mode.startState) { return true }
  var pos = findStartLine(cm, n, precise), state = pos > doc.first && getLine(doc, pos-1).stateAfter;
  if (!state) { state = startState(doc.mode); }
  else { state = copyState(doc.mode, state); }
  doc.iter(pos, n, function (line) {
    processLine(cm, line.text, state);
    var save = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo;
    line.stateAfter = save ? copyState(doc.mode, state) : null;
    ++pos;
  });
  if (precise) { doc.frontier = pos; }
  return state
}

// Lightweight form of highlight -- proceed over this line and
// update state, but don't save a style array. Used for lines that
// aren't currently visible.
function processLine(cm, text, state, startAt) {
  var mode = cm.doc.mode;
  var stream = new StringStream(text, cm.options.tabSize);
  stream.start = stream.pos = startAt || 0;
  if (text == "") { callBlankLine(mode, state); }
  while (!stream.eol()) {
    readToken(mode, stream, state);
    stream.start = stream.pos;
  }
}

function callBlankLine(mode, state) {
  if (mode.blankLine) { return mode.blankLine(state) }
  if (!mode.innerMode) { return }
  var inner = innerMode(mode, state);
  if (inner.mode.blankLine) { return inner.mode.blankLine(inner.state) }
}

function readToken(mode, stream, state, inner) {
  for (var i = 0; i < 10; i++) {
    if (inner) { inner[0] = innerMode(mode, state).mode; }
    var style = mode.token(stream, state);
    if (stream.pos > stream.start) { return style }
  }
  throw new Error("Mode " + mode.name + " failed to advance stream.")
}

// Utility for getTokenAt and getLineTokens
function takeToken(cm, pos, precise, asArray) {
  var getObj = function (copy) { return ({
    start: stream.start, end: stream.pos,
    string: stream.current(),
    type: style || null,
    state: copy ? copyState(doc.mode, state) : state
  }); };

  var doc = cm.doc, mode = doc.mode, style;
  pos = clipPos(doc, pos);
  var line = getLine(doc, pos.line), state = getStateBefore(cm, pos.line, precise);
  var stream = new StringStream(line.text, cm.options.tabSize), tokens;
  if (asArray) { tokens = []; }
  while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
    stream.start = stream.pos;
    style = readToken(mode, stream, state);
    if (asArray) { tokens.push(getObj(true)); }
  }
  return asArray ? tokens : getObj()
}

function extractLineClasses(type, output) {
  if (type) { for (;;) {
    var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
    if (!lineClass) { break }
    type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
    var prop = lineClass[1] ? "bgClass" : "textClass";
    if (output[prop] == null)
      { output[prop] = lineClass[2]; }
    else if (!(new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)")).test(output[prop]))
      { output[prop] += " " + lineClass[2]; }
  } }
  return type
}

// Run the given mode's parser over a line, calling f for each token.
function runMode(cm, text, mode, state, f, lineClasses, forceToEnd) {
  var flattenSpans = mode.flattenSpans;
  if (flattenSpans == null) { flattenSpans = cm.options.flattenSpans; }
  var curStart = 0, curStyle = null;
  var stream = new StringStream(text, cm.options.tabSize), style;
  var inner = cm.options.addModeClass && [null];
  if (text == "") { extractLineClasses(callBlankLine(mode, state), lineClasses); }
  while (!stream.eol()) {
    if (stream.pos > cm.options.maxHighlightLength) {
      flattenSpans = false;
      if (forceToEnd) { processLine(cm, text, state, stream.pos); }
      stream.pos = text.length;
      style = null;
    } else {
      style = extractLineClasses(readToken(mode, stream, state, inner), lineClasses);
    }
    if (inner) {
      var mName = inner[0].name;
      if (mName) { style = "m-" + (style ? mName + " " + style : mName); }
    }
    if (!flattenSpans || curStyle != style) {
      while (curStart < stream.start) {
        curStart = Math.min(stream.start, curStart + 5000);
        f(curStart, curStyle);
      }
      curStyle = style;
    }
    stream.start = stream.pos;
  }
  while (curStart < stream.pos) {
    // Webkit seems to refuse to render text nodes longer than 57444
    // characters, and returns inaccurate measurements in nodes
    // starting around 5000 chars.
    var pos = Math.min(stream.pos, curStart + 5000);
    f(pos, curStyle);
    curStart = pos;
  }
}

// Finds the line to start with when starting a parse. Tries to
// find a line with a stateAfter, so that it can start with a
// valid state. If that fails, it returns the line with the
// smallest indentation, which tends to need the least context to
// parse correctly.
function findStartLine(cm, n, precise) {
  var minindent, minline, doc = cm.doc;
  var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);
  for (var search = n; search > lim; --search) {
    if (search <= doc.first) { return doc.first }
    var line = getLine(doc, search - 1);
    if (line.stateAfter && (!precise || search <= doc.frontier)) { return search }
    var indented = countColumn(line.text, null, cm.options.tabSize);
    if (minline == null || minindent > indented) {
      minline = search - 1;
      minindent = indented;
    }
  }
  return minline
}

// LINE DATA STRUCTURE

// Line objects. These hold state related to a line, including
// highlighting info (the styles array).
var Line = function(text, markedSpans, estimateHeight) {
  this.text = text;
  attachMarkedSpans(this, markedSpans);
  this.height = estimateHeight ? estimateHeight(this) : 1;
};

Line.prototype.lineNo = function () { return lineNo(this) };
eventMixin(Line);

// Change the content (text, markers) of a line. Automatically
// invalidates cached information and tries to re-estimate the
// line's height.
function updateLine(line, text, markedSpans, estimateHeight) {
  line.text = text;
  if (line.stateAfter) { line.stateAfter = null; }
  if (line.styles) { line.styles = null; }
  if (line.order != null) { line.order = null; }
  detachMarkedSpans(line);
  attachMarkedSpans(line, markedSpans);
  var estHeight = estimateHeight ? estimateHeight(line) : 1;
  if (estHeight != line.height) { updateLineHeight(line, estHeight); }
}

// Detach a line from the document tree and its markers.
function cleanUpLine(line) {
  line.parent = null;
  detachMarkedSpans(line);
}

// Convert a style as returned by a mode (either null, or a string
// containing one or more styles) to a CSS style. This is cached,
// and also looks for line-wide styles.
var styleToClassCache = {};
var styleToClassCacheWithMode = {};
function interpretTokenStyle(style, options) {
  if (!style || /^\s*$/.test(style)) { return null }
  var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
  return cache[style] ||
    (cache[style] = style.replace(/\S+/g, "cm-$&"))
}

// Render the DOM representation of the text of a line. Also builds
// up a 'line map', which points at the DOM nodes that represent
// specific stretches of text, and is used by the measuring code.
// The returned object contains the DOM node, this map, and
// information about line-wide styles that were set by the mode.
function buildLineContent(cm, lineView) {
  // The padding-right forces the element to have a 'border', which
  // is needed on Webkit to be able to get line-level bounding
  // rectangles for it (in measureChar).
  var content = eltP("span", null, null, webkit ? "padding-right: .1px" : null);
  var builder = {pre: eltP("pre", [content], "CodeMirror-line"), content: content,
                 col: 0, pos: 0, cm: cm,
                 trailingSpace: false,
                 splitSpaces: (ie || webkit) && cm.getOption("lineWrapping")};
  lineView.measure = {};

  // Iterate over the logical lines that make up this visual line.
  for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
    var line = i ? lineView.rest[i - 1] : lineView.line, order = (void 0);
    builder.pos = 0;
    builder.addToken = buildToken;
    // Optionally wire in some hacks into the token-rendering
    // algorithm, to deal with browser quirks.
    if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line, cm.doc.direction)))
      { builder.addToken = buildTokenBadBidi(builder.addToken, order); }
    builder.map = [];
    var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
    insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));
    if (line.styleClasses) {
      if (line.styleClasses.bgClass)
        { builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || ""); }
      if (line.styleClasses.textClass)
        { builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || ""); }
    }

    // Ensure at least a single node is present, for measuring.
    if (builder.map.length == 0)
      { builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure))); }

    // Store the map and a cache object for the current logical line
    if (i == 0) {
      lineView.measure.map = builder.map;
      lineView.measure.cache = {};
    } else {
      (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map)
      ;(lineView.measure.caches || (lineView.measure.caches = [])).push({});
    }
  }

  // See issue #2901
  if (webkit) {
    var last = builder.content.lastChild;
    if (/\bcm-tab\b/.test(last.className) || (last.querySelector && last.querySelector(".cm-tab")))
      { builder.content.className = "cm-tab-wrap-hack"; }
  }

  signal(cm, "renderLine", cm, lineView.line, builder.pre);
  if (builder.pre.className)
    { builder.textClass = joinClasses(builder.pre.className, builder.textClass || ""); }

  return builder
}

function defaultSpecialCharPlaceholder(ch) {
  var token = elt("span", "\u2022", "cm-invalidchar");
  token.title = "\\u" + ch.charCodeAt(0).toString(16);
  token.setAttribute("aria-label", token.title);
  return token
}

// Build up the DOM representation for a single token, and add it to
// the line map. Takes care to render special characters separately.
function buildToken(builder, text, style, startStyle, endStyle, title, css) {
  if (!text) { return }
  var displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text;
  var special = builder.cm.state.specialChars, mustWrap = false;
  var content;
  if (!special.test(text)) {
    builder.col += text.length;
    content = document.createTextNode(displayText);
    builder.map.push(builder.pos, builder.pos + text.length, content);
    if (ie && ie_version < 9) { mustWrap = true; }
    builder.pos += text.length;
  } else {
    content = document.createDocumentFragment();
    var pos = 0;
    while (true) {
      special.lastIndex = pos;
      var m = special.exec(text);
      var skipped = m ? m.index - pos : text.length - pos;
      if (skipped) {
        var txt = document.createTextNode(displayText.slice(pos, pos + skipped));
        if (ie && ie_version < 9) { content.appendChild(elt("span", [txt])); }
        else { content.appendChild(txt); }
        builder.map.push(builder.pos, builder.pos + skipped, txt);
        builder.col += skipped;
        builder.pos += skipped;
      }
      if (!m) { break }
      pos += skipped + 1;
      var txt$1 = (void 0);
      if (m[0] == "\t") {
        var tabSize = builder.cm.options.tabSize, tabWidth = tabSize - builder.col % tabSize;
        txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
        txt$1.setAttribute("role", "presentation");
        txt$1.setAttribute("cm-text", "\t");
        builder.col += tabWidth;
      } else if (m[0] == "\r" || m[0] == "\n") {
        txt$1 = content.appendChild(elt("span", m[0] == "\r" ? "\u240d" : "\u2424", "cm-invalidchar"));
        txt$1.setAttribute("cm-text", m[0]);
        builder.col += 1;
      } else {
        txt$1 = builder.cm.options.specialCharPlaceholder(m[0]);
        txt$1.setAttribute("cm-text", m[0]);
        if (ie && ie_version < 9) { content.appendChild(elt("span", [txt$1])); }
        else { content.appendChild(txt$1); }
        builder.col += 1;
      }
      builder.map.push(builder.pos, builder.pos + 1, txt$1);
      builder.pos++;
    }
  }
  builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32;
  if (style || startStyle || endStyle || mustWrap || css) {
    var fullStyle = style || "";
    if (startStyle) { fullStyle += startStyle; }
    if (endStyle) { fullStyle += endStyle; }
    var token = elt("span", [content], fullStyle, css);
    if (title) { token.title = title; }
    return builder.content.appendChild(token)
  }
  builder.content.appendChild(content);
}

function splitSpaces(text, trailingBefore) {
  if (text.length > 1 && !/  /.test(text)) { return text }
  var spaceBefore = trailingBefore, result = "";
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
    if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32))
      { ch = "\u00a0"; }
    result += ch;
    spaceBefore = ch == " ";
  }
  return result
}

// Work around nonsense dimensions being reported for stretches of
// right-to-left text.
function buildTokenBadBidi(inner, order) {
  return function (builder, text, style, startStyle, endStyle, title, css) {
    style = style ? style + " cm-force-border" : "cm-force-border";
    var start = builder.pos, end = start + text.length;
    for (;;) {
      // Find the part that overlaps with the start of this text
      var part = (void 0);
      for (var i = 0; i < order.length; i++) {
        part = order[i];
        if (part.to > start && part.from <= start) { break }
      }
      if (part.to >= end) { return inner(builder, text, style, startStyle, endStyle, title, css) }
      inner(builder, text.slice(0, part.to - start), style, startStyle, null, title, css);
      startStyle = null;
      text = text.slice(part.to - start);
      start = part.to;
    }
  }
}

function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
  var widget = !ignoreWidget && marker.widgetNode;
  if (widget) { builder.map.push(builder.pos, builder.pos + size, widget); }
  if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
    if (!widget)
      { widget = builder.content.appendChild(document.createElement("span")); }
    widget.setAttribute("cm-marker", marker.id);
  }
  if (widget) {
    builder.cm.display.input.setUneditable(widget);
    builder.content.appendChild(widget);
  }
  builder.pos += size;
  builder.trailingSpace = false;
}

// Outputs a number of spans to make up a line, taking highlighting
// and marked text into account.
function insertLineContent(line, builder, styles) {
  var spans = line.markedSpans, allText = line.text, at = 0;
  if (!spans) {
    for (var i$1 = 1; i$1 < styles.length; i$1+=2)
      { builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1+1], builder.cm.options)); }
    return
  }

  var len = allText.length, pos = 0, i = 1, text = "", style, css;
  var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, title, collapsed;
  for (;;) {
    if (nextChange == pos) { // Update current marker set
      spanStyle = spanEndStyle = spanStartStyle = title = css = "";
      collapsed = null; nextChange = Infinity;
      var foundBookmarks = [], endStyles = (void 0);
      for (var j = 0; j < spans.length; ++j) {
        var sp = spans[j], m = sp.marker;
        if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
          foundBookmarks.push(m);
        } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
          if (sp.to != null && sp.to != pos && nextChange > sp.to) {
            nextChange = sp.to;
            spanEndStyle = "";
          }
          if (m.className) { spanStyle += " " + m.className; }
          if (m.css) { css = (css ? css + ";" : "") + m.css; }
          if (m.startStyle && sp.from == pos) { spanStartStyle += " " + m.startStyle; }
          if (m.endStyle && sp.to == nextChange) { (endStyles || (endStyles = [])).push(m.endStyle, sp.to); }
          if (m.title && !title) { title = m.title; }
          if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
            { collapsed = sp; }
        } else if (sp.from > pos && nextChange > sp.from) {
          nextChange = sp.from;
        }
      }
      if (endStyles) { for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2)
        { if (endStyles[j$1 + 1] == nextChange) { spanEndStyle += " " + endStyles[j$1]; } } }

      if (!collapsed || collapsed.from == pos) { for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2)
        { buildCollapsedSpan(builder, 0, foundBookmarks[j$2]); } }
      if (collapsed && (collapsed.from || 0) == pos) {
        buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos,
                           collapsed.marker, collapsed.from == null);
        if (collapsed.to == null) { return }
        if (collapsed.to == pos) { collapsed = false; }
      }
    }
    if (pos >= len) { break }

    var upto = Math.min(len, nextChange);
    while (true) {
      if (text) {
        var end = pos + text.length;
        if (!collapsed) {
          var tokenText = end > upto ? text.slice(0, upto - pos) : text;
          builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle,
                           spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title, css);
        }
        if (end >= upto) {text = text.slice(upto - pos); pos = upto; break}
        pos = end;
        spanStartStyle = "";
      }
      text = allText.slice(at, at = styles[i++]);
      style = interpretTokenStyle(styles[i++], builder.cm.options);
    }
  }
}


// These objects are used to represent the visible (currently drawn)
// part of the document. A LineView may correspond to multiple
// logical lines, if those are connected by collapsed ranges.
function LineView(doc, line, lineN) {
  // The starting line
  this.line = line;
  // Continuing lines, if any
  this.rest = visualLineContinued(line);
  // Number of logical lines in this visual line
  this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
  this.node = this.text = null;
  this.hidden = lineIsHidden(doc, line);
}

// Create a range of LineView objects for the given lines.
function buildViewArray(cm, from, to) {
  var array = [], nextPos;
  for (var pos = from; pos < to; pos = nextPos) {
    var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
    nextPos = pos + view.size;
    array.push(view);
  }
  return array
}

var operationGroup = null;

function pushOperation(op) {
  if (operationGroup) {
    operationGroup.ops.push(op);
  } else {
    op.ownsGroup = operationGroup = {
      ops: [op],
      delayedCallbacks: []
    };
  }
}

function fireCallbacksForOps(group) {
  // Calls delayed callbacks and cursorActivity handlers until no
  // new ones appear
  var callbacks = group.delayedCallbacks, i = 0;
  do {
    for (; i < callbacks.length; i++)
      { callbacks[i].call(null); }
    for (var j = 0; j < group.ops.length; j++) {
      var op = group.ops[j];
      if (op.cursorActivityHandlers)
        { while (op.cursorActivityCalled < op.cursorActivityHandlers.length)
          { op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm); } }
    }
  } while (i < callbacks.length)
}

function finishOperation(op, endCb) {
  var group = op.ownsGroup;
  if (!group) { return }

  try { fireCallbacksForOps(group); }
  finally {
    operationGroup = null;
    endCb(group);
  }
}

var orphanDelayedCallbacks = null;

// Often, we want to signal events at a point where we are in the
// middle of some work, but don't want the handler to start calling
// other methods on the editor, which might be in an inconsistent
// state or simply not expect any other events to happen.
// signalLater looks whether there are any handlers, and schedules
// them to be executed when the last operation ends, or, if no
// operation is active, when a timeout fires.
function signalLater(emitter, type /*, values...*/) {
  var arr = getHandlers(emitter, type);
  if (!arr.length) { return }
  var args = Array.prototype.slice.call(arguments, 2), list;
  if (operationGroup) {
    list = operationGroup.delayedCallbacks;
  } else if (orphanDelayedCallbacks) {
    list = orphanDelayedCallbacks;
  } else {
    list = orphanDelayedCallbacks = [];
    setTimeout(fireOrphanDelayed, 0);
  }
  var loop = function ( i ) {
    list.push(function () { return arr[i].apply(null, args); });
  };

  for (var i = 0; i < arr.length; ++i)
    loop( i );
}

function fireOrphanDelayed() {
  var delayed = orphanDelayedCallbacks;
  orphanDelayedCallbacks = null;
  for (var i = 0; i < delayed.length; ++i) { delayed[i](); }
}

// When an aspect of a line changes, a string is added to
// lineView.changes. This updates the relevant part of the line's
// DOM structure.
function updateLineForChanges(cm, lineView, lineN, dims) {
  for (var j = 0; j < lineView.changes.length; j++) {
    var type = lineView.changes[j];
    if (type == "text") { updateLineText(cm, lineView); }
    else if (type == "gutter") { updateLineGutter(cm, lineView, lineN, dims); }
    else if (type == "class") { updateLineClasses(cm, lineView); }
    else if (type == "widget") { updateLineWidgets(cm, lineView, dims); }
  }
  lineView.changes = null;
}

// Lines with gutter elements, widgets or a background class need to
// be wrapped, and have the extra elements added to the wrapper div
function ensureLineWrapped(lineView) {
  if (lineView.node == lineView.text) {
    lineView.node = elt("div", null, null, "position: relative");
    if (lineView.text.parentNode)
      { lineView.text.parentNode.replaceChild(lineView.node, lineView.text); }
    lineView.node.appendChild(lineView.text);
    if (ie && ie_version < 8) { lineView.node.style.zIndex = 2; }
  }
  return lineView.node
}

function updateLineBackground(cm, lineView) {
  var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
  if (cls) { cls += " CodeMirror-linebackground"; }
  if (lineView.background) {
    if (cls) { lineView.background.className = cls; }
    else { lineView.background.parentNode.removeChild(lineView.background); lineView.background = null; }
  } else if (cls) {
    var wrap = ensureLineWrapped(lineView);
    lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
    cm.display.input.setUneditable(lineView.background);
  }
}

// Wrapper around buildLineContent which will reuse the structure
// in display.externalMeasured when possible.
function getLineContent(cm, lineView) {
  var ext = cm.display.externalMeasured;
  if (ext && ext.line == lineView.line) {
    cm.display.externalMeasured = null;
    lineView.measure = ext.measure;
    return ext.built
  }
  return buildLineContent(cm, lineView)
}

// Redraw the line's text. Interacts with the background and text
// classes because the mode may output tokens that influence these
// classes.
function updateLineText(cm, lineView) {
  var cls = lineView.text.className;
  var built = getLineContent(cm, lineView);
  if (lineView.text == lineView.node) { lineView.node = built.pre; }
  lineView.text.parentNode.replaceChild(built.pre, lineView.text);
  lineView.text = built.pre;
  if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
    lineView.bgClass = built.bgClass;
    lineView.textClass = built.textClass;
    updateLineClasses(cm, lineView);
  } else if (cls) {
    lineView.text.className = cls;
  }
}

function updateLineClasses(cm, lineView) {
  updateLineBackground(cm, lineView);
  if (lineView.line.wrapClass)
    { ensureLineWrapped(lineView).className = lineView.line.wrapClass; }
  else if (lineView.node != lineView.text)
    { lineView.node.className = ""; }
  var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
  lineView.text.className = textClass || "";
}

function updateLineGutter(cm, lineView, lineN, dims) {
  if (lineView.gutter) {
    lineView.node.removeChild(lineView.gutter);
    lineView.gutter = null;
  }
  if (lineView.gutterBackground) {
    lineView.node.removeChild(lineView.gutterBackground);
    lineView.gutterBackground = null;
  }
  if (lineView.line.gutterClass) {
    var wrap = ensureLineWrapped(lineView);
    lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass,
                                    ("left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + (dims.gutterTotalWidth) + "px"));
    cm.display.input.setUneditable(lineView.gutterBackground);
    wrap.insertBefore(lineView.gutterBackground, lineView.text);
  }
  var markers = lineView.line.gutterMarkers;
  if (cm.options.lineNumbers || markers) {
    var wrap$1 = ensureLineWrapped(lineView);
    var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", ("left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px"));
    cm.display.input.setUneditable(gutterWrap);
    wrap$1.insertBefore(gutterWrap, lineView.text);
    if (lineView.line.gutterClass)
      { gutterWrap.className += " " + lineView.line.gutterClass; }
    if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
      { lineView.lineNumber = gutterWrap.appendChild(
        elt("div", lineNumberFor(cm.options, lineN),
            "CodeMirror-linenumber CodeMirror-gutter-elt",
            ("left: " + (dims.gutterLeft["CodeMirror-linenumbers"]) + "px; width: " + (cm.display.lineNumInnerWidth) + "px"))); }
    if (markers) { for (var k = 0; k < cm.options.gutters.length; ++k) {
      var id = cm.options.gutters[k], found = markers.hasOwnProperty(id) && markers[id];
      if (found)
        { gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt",
                                   ("left: " + (dims.gutterLeft[id]) + "px; width: " + (dims.gutterWidth[id]) + "px"))); }
    } }
  }
}

function updateLineWidgets(cm, lineView, dims) {
  if (lineView.alignable) { lineView.alignable = null; }
  for (var node = lineView.node.firstChild, next = (void 0); node; node = next) {
    next = node.nextSibling;
    if (node.className == "CodeMirror-linewidget")
      { lineView.node.removeChild(node); }
  }
  insertLineWidgets(cm, lineView, dims);
}

// Build a line's DOM representation from scratch
function buildLineElement(cm, lineView, lineN, dims) {
  var built = getLineContent(cm, lineView);
  lineView.text = lineView.node = built.pre;
  if (built.bgClass) { lineView.bgClass = built.bgClass; }
  if (built.textClass) { lineView.textClass = built.textClass; }

  updateLineClasses(cm, lineView);
  updateLineGutter(cm, lineView, lineN, dims);
  insertLineWidgets(cm, lineView, dims);
  return lineView.node
}

// A lineView may contain multiple logical lines (when merged by
// collapsed spans). The widgets for all of them need to be drawn.
function insertLineWidgets(cm, lineView, dims) {
  insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);
  if (lineView.rest) { for (var i = 0; i < lineView.rest.length; i++)
    { insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false); } }
}

function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
  if (!line.widgets) { return }
  var wrap = ensureLineWrapped(lineView);
  for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
    var widget = ws[i], node = elt("div", [widget.node], "CodeMirror-linewidget");
    if (!widget.handleMouseEvents) { node.setAttribute("cm-ignore-events", "true"); }
    positionLineWidget(widget, node, lineView, dims);
    cm.display.input.setUneditable(node);
    if (allowAbove && widget.above)
      { wrap.insertBefore(node, lineView.gutter || lineView.text); }
    else
      { wrap.appendChild(node); }
    signalLater(widget, "redraw");
  }
}

function positionLineWidget(widget, node, lineView, dims) {
  if (widget.noHScroll) {
    (lineView.alignable || (lineView.alignable = [])).push(node);
    var width = dims.wrapperWidth;
    node.style.left = dims.fixedPos + "px";
    if (!widget.coverGutter) {
      width -= dims.gutterTotalWidth;
      node.style.paddingLeft = dims.gutterTotalWidth + "px";
    }
    node.style.width = width + "px";
  }
  if (widget.coverGutter) {
    node.style.zIndex = 5;
    node.style.position = "relative";
    if (!widget.noHScroll) { node.style.marginLeft = -dims.gutterTotalWidth + "px"; }
  }
}

function widgetHeight(widget) {
  if (widget.height != null) { return widget.height }
  var cm = widget.doc.cm;
  if (!cm) { return 0 }
  if (!contains(document.body, widget.node)) {
    var parentStyle = "position: relative;";
    if (widget.coverGutter)
      { parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;"; }
    if (widget.noHScroll)
      { parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;"; }
    removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
  }
  return widget.height = widget.node.parentNode.offsetHeight
}

// Return true when the given mouse event happened in a widget
function eventInWidget(display, e) {
  for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
    if (!n || (n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true") ||
        (n.parentNode == display.sizer && n != display.mover))
      { return true }
  }
}

// POSITION MEASUREMENT

function paddingTop(display) {return display.lineSpace.offsetTop}
function paddingVert(display) {return display.mover.offsetHeight - display.lineSpace.offsetHeight}
function paddingH(display) {
  if (display.cachedPaddingH) { return display.cachedPaddingH }
  var e = removeChildrenAndAdd(display.measure, elt("pre", "x"));
  var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
  var data = {left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight)};
  if (!isNaN(data.left) && !isNaN(data.right)) { display.cachedPaddingH = data; }
  return data
}

function scrollGap(cm) { return scrollerGap - cm.display.nativeBarWidth }
function displayWidth(cm) {
  return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth
}
function displayHeight(cm) {
  return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight
}

// Ensure the lineView.wrapping.heights array is populated. This is
// an array of bottom offsets for the lines that make up a drawn
// line. When lineWrapping is on, there might be more than one
// height.
function ensureLineHeights(cm, lineView, rect) {
  var wrapping = cm.options.lineWrapping;
  var curWidth = wrapping && displayWidth(cm);
  if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
    var heights = lineView.measure.heights = [];
    if (wrapping) {
      lineView.measure.width = curWidth;
      var rects = lineView.text.firstChild.getClientRects();
      for (var i = 0; i < rects.length - 1; i++) {
        var cur = rects[i], next = rects[i + 1];
        if (Math.abs(cur.bottom - next.bottom) > 2)
          { heights.push((cur.bottom + next.top) / 2 - rect.top); }
      }
    }
    heights.push(rect.bottom - rect.top);
  }
}

// Find a line map (mapping character offsets to text nodes) and a
// measurement cache for the given line number. (A line view might
// contain multiple lines when collapsed ranges are present.)
function mapFromLineView(lineView, line, lineN) {
  if (lineView.line == line)
    { return {map: lineView.measure.map, cache: lineView.measure.cache} }
  for (var i = 0; i < lineView.rest.length; i++)
    { if (lineView.rest[i] == line)
      { return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i]} } }
  for (var i$1 = 0; i$1 < lineView.rest.length; i$1++)
    { if (lineNo(lineView.rest[i$1]) > lineN)
      { return {map: lineView.measure.maps[i$1], cache: lineView.measure.caches[i$1], before: true} } }
}

// Render a line into the hidden node display.externalMeasured. Used
// when measurement is needed for a line that's not in the viewport.
function updateExternalMeasurement(cm, line) {
  line = visualLine(line);
  var lineN = lineNo(line);
  var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
  view.lineN = lineN;
  var built = view.built = buildLineContent(cm, view);
  view.text = built.pre;
  removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
  return view
}

// Get a {top, bottom, left, right} box (in line-local coordinates)
// for a given character.
function measureChar(cm, line, ch, bias) {
  return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias)
}

// Find a line view that corresponds to the given line number.
function findViewForLine(cm, lineN) {
  if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
    { return cm.display.view[findViewIndex(cm, lineN)] }
  var ext = cm.display.externalMeasured;
  if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
    { return ext }
}

// Measurement can be split in two steps, the set-up work that
// applies to the whole line, and the measurement of the actual
// character. Functions like coordsChar, that need to do a lot of
// measurements in a row, can thus ensure that the set-up work is
// only done once.
function prepareMeasureForLine(cm, line) {
  var lineN = lineNo(line);
  var view = findViewForLine(cm, lineN);
  if (view && !view.text) {
    view = null;
  } else if (view && view.changes) {
    updateLineForChanges(cm, view, lineN, getDimensions(cm));
    cm.curOp.forceUpdate = true;
  }
  if (!view)
    { view = updateExternalMeasurement(cm, line); }

  var info = mapFromLineView(view, line, lineN);
  return {
    line: line, view: view, rect: null,
    map: info.map, cache: info.cache, before: info.before,
    hasHeights: false
  }
}

// Given a prepared measurement object, measures the position of an
// actual character (or fetches it from the cache).
function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
  if (prepared.before) { ch = -1; }
  var key = ch + (bias || ""), found;
  if (prepared.cache.hasOwnProperty(key)) {
    found = prepared.cache[key];
  } else {
    if (!prepared.rect)
      { prepared.rect = prepared.view.text.getBoundingClientRect(); }
    if (!prepared.hasHeights) {
      ensureLineHeights(cm, prepared.view, prepared.rect);
      prepared.hasHeights = true;
    }
    found = measureCharInner(cm, prepared, ch, bias);
    if (!found.bogus) { prepared.cache[key] = found; }
  }
  return {left: found.left, right: found.right,
          top: varHeight ? found.rtop : found.top,
          bottom: varHeight ? found.rbottom : found.bottom}
}

var nullRect = {left: 0, right: 0, top: 0, bottom: 0};

function nodeAndOffsetInLineMap(map$$1, ch, bias) {
  var node, start, end, collapse, mStart, mEnd;
  // First, search the line map for the text node corresponding to,
  // or closest to, the target character.
  for (var i = 0; i < map$$1.length; i += 3) {
    mStart = map$$1[i];
    mEnd = map$$1[i + 1];
    if (ch < mStart) {
      start = 0; end = 1;
      collapse = "left";
    } else if (ch < mEnd) {
      start = ch - mStart;
      end = start + 1;
    } else if (i == map$$1.length - 3 || ch == mEnd && map$$1[i + 3] > ch) {
      end = mEnd - mStart;
      start = end - 1;
      if (ch >= mEnd) { collapse = "right"; }
    }
    if (start != null) {
      node = map$$1[i + 2];
      if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
        { collapse = bias; }
      if (bias == "left" && start == 0)
        { while (i && map$$1[i - 2] == map$$1[i - 3] && map$$1[i - 1].insertLeft) {
          node = map$$1[(i -= 3) + 2];
          collapse = "left";
        } }
      if (bias == "right" && start == mEnd - mStart)
        { while (i < map$$1.length - 3 && map$$1[i + 3] == map$$1[i + 4] && !map$$1[i + 5].insertLeft) {
          node = map$$1[(i += 3) + 2];
          collapse = "right";
        } }
      break
    }
  }
  return {node: node, start: start, end: end, collapse: collapse, coverStart: mStart, coverEnd: mEnd}
}

function getUsefulRect(rects, bias) {
  var rect = nullRect;
  if (bias == "left") { for (var i = 0; i < rects.length; i++) {
    if ((rect = rects[i]).left != rect.right) { break }
  } } else { for (var i$1 = rects.length - 1; i$1 >= 0; i$1--) {
    if ((rect = rects[i$1]).left != rect.right) { break }
  } }
  return rect
}

function measureCharInner(cm, prepared, ch, bias) {
  var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
  var node = place.node, start = place.start, end = place.end, collapse = place.collapse;

  var rect;
  if (node.nodeType == 3) { // If it is a text node, use a range to retrieve the coordinates.
    for (var i$1 = 0; i$1 < 4; i$1++) { // Retry a maximum of 4 times when nonsense rectangles are returned
      while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) { --start; }
      while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) { ++end; }
      if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart)
        { rect = node.parentNode.getBoundingClientRect(); }
      else
        { rect = getUsefulRect(range(node, start, end).getClientRects(), bias); }
      if (rect.left || rect.right || start == 0) { break }
      end = start;
      start = start - 1;
      collapse = "right";
    }
    if (ie && ie_version < 11) { rect = maybeUpdateRectForZooming(cm.display.measure, rect); }
  } else { // If it is a widget, simply get the box for the whole widget.
    if (start > 0) { collapse = bias = "right"; }
    var rects;
    if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
      { rect = rects[bias == "right" ? rects.length - 1 : 0]; }
    else
      { rect = node.getBoundingClientRect(); }
  }
  if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
    var rSpan = node.parentNode.getClientRects()[0];
    if (rSpan)
      { rect = {left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom}; }
    else
      { rect = nullRect; }
  }

  var rtop = rect.top - prepared.rect.top, rbot = rect.bottom - prepared.rect.top;
  var mid = (rtop + rbot) / 2;
  var heights = prepared.view.measure.heights;
  var i = 0;
  for (; i < heights.length - 1; i++)
    { if (mid < heights[i]) { break } }
  var top = i ? heights[i - 1] : 0, bot = heights[i];
  var result = {left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
                right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
                top: top, bottom: bot};
  if (!rect.left && !rect.right) { result.bogus = true; }
  if (!cm.options.singleCursorHeightPerLine) { result.rtop = rtop; result.rbottom = rbot; }

  return result
}

// Work around problem with bounding client rects on ranges being
// returned incorrectly when zoomed on IE10 and below.
function maybeUpdateRectForZooming(measure, rect) {
  if (!window.screen || screen.logicalXDPI == null ||
      screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure))
    { return rect }
  var scaleX = screen.logicalXDPI / screen.deviceXDPI;
  var scaleY = screen.logicalYDPI / screen.deviceYDPI;
  return {left: rect.left * scaleX, right: rect.right * scaleX,
          top: rect.top * scaleY, bottom: rect.bottom * scaleY}
}

function clearLineMeasurementCacheFor(lineView) {
  if (lineView.measure) {
    lineView.measure.cache = {};
    lineView.measure.heights = null;
    if (lineView.rest) { for (var i = 0; i < lineView.rest.length; i++)
      { lineView.measure.caches[i] = {}; } }
  }
}

function clearLineMeasurementCache(cm) {
  cm.display.externalMeasure = null;
  removeChildren(cm.display.lineMeasure);
  for (var i = 0; i < cm.display.view.length; i++)
    { clearLineMeasurementCacheFor(cm.display.view[i]); }
}

function clearCaches(cm) {
  clearLineMeasurementCache(cm);
  cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
  if (!cm.options.lineWrapping) { cm.display.maxLineChanged = true; }
  cm.display.lineNumChars = null;
}

function pageScrollX() {
  // Work around https://bugs.chromium.org/p/chromium/issues/detail?id=489206
  // which causes page_Offset and bounding client rects to use
  // different reference viewports and invalidate our calculations.
  if (chrome && android) { return -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft)) }
  return window.pageXOffset || (document.documentElement || document.body).scrollLeft
}
function pageScrollY() {
  if (chrome && android) { return -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop)) }
  return window.pageYOffset || (document.documentElement || document.body).scrollTop
}

// Converts a {top, bottom, left, right} box from line-local
// coordinates into another coordinate system. Context may be one of
// "line", "div" (display.lineDiv), "local"./null (editor), "window",
// or "page".
function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
  if (!includeWidgets && lineObj.widgets) { for (var i = 0; i < lineObj.widgets.length; ++i) { if (lineObj.widgets[i].above) {
    var size = widgetHeight(lineObj.widgets[i]);
    rect.top += size; rect.bottom += size;
  } } }
  if (context == "line") { return rect }
  if (!context) { context = "local"; }
  var yOff = heightAtLine(lineObj);
  if (context == "local") { yOff += paddingTop(cm.display); }
  else { yOff -= cm.display.viewOffset; }
  if (context == "page" || context == "window") {
    var lOff = cm.display.lineSpace.getBoundingClientRect();
    yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
    var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
    rect.left += xOff; rect.right += xOff;
  }
  rect.top += yOff; rect.bottom += yOff;
  return rect
}

// Coverts a box from "div" coords to another coordinate system.
// Context may be "window", "page", "div", or "local"./null.
function fromCoordSystem(cm, coords, context) {
  if (context == "div") { return coords }
  var left = coords.left, top = coords.top;
  // First move into "page" coordinate system
  if (context == "page") {
    left -= pageScrollX();
    top -= pageScrollY();
  } else if (context == "local" || !context) {
    var localBox = cm.display.sizer.getBoundingClientRect();
    left += localBox.left;
    top += localBox.top;
  }

  var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
  return {left: left - lineSpaceBox.left, top: top - lineSpaceBox.top}
}

function charCoords(cm, pos, context, lineObj, bias) {
  if (!lineObj) { lineObj = getLine(cm.doc, pos.line); }
  return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context)
}

// Returns a box for a given cursor position, which may have an
// 'other' property containing the position of the secondary cursor
// on a bidi boundary.
// A cursor Pos(line, char, "before") is on the same visual line as `char - 1`
// and after `char - 1` in writing order of `char - 1`
// A cursor Pos(line, char, "after") is on the same visual line as `char`
// and before `char` in writing order of `char`
// Examples (upper-case letters are RTL, lower-case are LTR):
//     Pos(0, 1, ...)
//     before   after
// ab     a|b     a|b
// aB     a|B     aB|
// Ab     |Ab     A|b
// AB     B|A     B|A
// Every position after the last character on a line is considered to stick
// to the last character on the line.
function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
  lineObj = lineObj || getLine(cm.doc, pos.line);
  if (!preparedMeasure) { preparedMeasure = prepareMeasureForLine(cm, lineObj); }
  function get(ch, right) {
    var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
    if (right) { m.left = m.right; } else { m.right = m.left; }
    return intoCoordSystem(cm, lineObj, m, context)
  }
  var order = getOrder(lineObj, cm.doc.direction), ch = pos.ch, sticky = pos.sticky;
  if (ch >= lineObj.text.length) {
    ch = lineObj.text.length;
    sticky = "before";
  } else if (ch <= 0) {
    ch = 0;
    sticky = "after";
  }
  if (!order) { return get(sticky == "before" ? ch - 1 : ch, sticky == "before") }

  function getBidi(ch, partPos, invert) {
    var part = order[partPos], right = (part.level % 2) != 0;
    return get(invert ? ch - 1 : ch, right != invert)
  }
  var partPos = getBidiPartAt(order, ch, sticky);
  var other = bidiOther;
  var val = getBidi(ch, partPos, sticky == "before");
  if (other != null) { val.other = getBidi(ch, other, sticky != "before"); }
  return val
}

// Used to cheaply estimate the coordinates for a position. Used for
// intermediate scroll updates.
function estimateCoords(cm, pos) {
  var left = 0;
  pos = clipPos(cm.doc, pos);
  if (!cm.options.lineWrapping) { left = charWidth(cm.display) * pos.ch; }
  var lineObj = getLine(cm.doc, pos.line);
  var top = heightAtLine(lineObj) + paddingTop(cm.display);
  return {left: left, right: left, top: top, bottom: top + lineObj.height}
}

// Positions returned by coordsChar contain some extra information.
// xRel is the relative x position of the input coordinates compared
// to the found position (so xRel > 0 means the coordinates are to
// the right of the character position, for example). When outside
// is true, that means the coordinates lie outside the line's
// vertical range.
function PosWithInfo(line, ch, sticky, outside, xRel) {
  var pos = Pos(line, ch, sticky);
  pos.xRel = xRel;
  if (outside) { pos.outside = true; }
  return pos
}

// Compute the character position closest to the given coordinates.
// Input must be lineSpace-local ("div" coordinate system).
function coordsChar(cm, x, y) {
  var doc = cm.doc;
  y += cm.display.viewOffset;
  if (y < 0) { return PosWithInfo(doc.first, 0, null, true, -1) }
  var lineN = lineAtHeight(doc, y), last = doc.first + doc.size - 1;
  if (lineN > last)
    { return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, null, true, 1) }
  if (x < 0) { x = 0; }

  var lineObj = getLine(doc, lineN);
  for (;;) {
    var found = coordsCharInner(cm, lineObj, lineN, x, y);
    var merged = collapsedSpanAtEnd(lineObj);
    var mergedPos = merged && merged.find(0, true);
    if (merged && (found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0))
      { lineN = lineNo(lineObj = mergedPos.to.line); }
    else
      { return found }
  }
}

function wrappedLineExtent(cm, lineObj, preparedMeasure, y) {
  var measure = function (ch) { return intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, ch), "line"); };
  var end = lineObj.text.length;
  var begin = findFirst(function (ch) { return measure(ch - 1).bottom <= y; }, end, 0);
  end = findFirst(function (ch) { return measure(ch).top > y; }, begin, end);
  return {begin: begin, end: end}
}

function wrappedLineExtentChar(cm, lineObj, preparedMeasure, target) {
  var targetTop = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, target), "line").top;
  return wrappedLineExtent(cm, lineObj, preparedMeasure, targetTop)
}

function coordsCharInner(cm, lineObj, lineNo$$1, x, y) {
  y -= heightAtLine(lineObj);
  var begin = 0, end = lineObj.text.length;
  var preparedMeasure = prepareMeasureForLine(cm, lineObj);
  var pos;
  var order = getOrder(lineObj, cm.doc.direction);
  if (order) {
    if (cm.options.lineWrapping) {
      var assign;
      ((assign = wrappedLineExtent(cm, lineObj, preparedMeasure, y), begin = assign.begin, end = assign.end, assign));
    }
    pos = new Pos(lineNo$$1, begin);
    var beginLeft = cursorCoords(cm, pos, "line", lineObj, preparedMeasure).left;
    var dir = beginLeft < x ? 1 : -1;
    var prevDiff, diff = beginLeft - x, prevPos;
    do {
      prevDiff = diff;
      prevPos = pos;
      pos = moveVisually(cm, lineObj, pos, dir);
      if (pos == null || pos.ch < begin || end <= (pos.sticky == "before" ? pos.ch - 1 : pos.ch)) {
        pos = prevPos;
        break
      }
      diff = cursorCoords(cm, pos, "line", lineObj, preparedMeasure).left - x;
    } while ((dir < 0) != (diff < 0) && (Math.abs(diff) <= Math.abs(prevDiff)))
    if (Math.abs(diff) > Math.abs(prevDiff)) {
      if ((diff < 0) == (prevDiff < 0)) { throw new Error("Broke out of infinite loop in coordsCharInner") }
      pos = prevPos;
    }
  } else {
    var ch = findFirst(function (ch) {
      var box = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, ch), "line");
      if (box.top > y) {
        // For the cursor stickiness
        end = Math.min(ch, end);
        return true
      }
      else if (box.bottom <= y) { return false }
      else if (box.left > x) { return true }
      else if (box.right < x) { return false }
      else { return (x - box.left < box.right - x) }
    }, begin, end);
    ch = skipExtendingChars(lineObj.text, ch, 1);
    pos = new Pos(lineNo$$1, ch, ch == end ? "before" : "after");
  }
  var coords = cursorCoords(cm, pos, "line", lineObj, preparedMeasure);
  if (y < coords.top || coords.bottom < y) { pos.outside = true; }
  pos.xRel = x < coords.left ? -1 : (x > coords.right ? 1 : 0);
  return pos
}

var measureText;
// Compute the default text height.
function textHeight(display) {
  if (display.cachedTextHeight != null) { return display.cachedTextHeight }
  if (measureText == null) {
    measureText = elt("pre");
    // Measure a bunch of lines, for browsers that compute
    // fractional heights.
    for (var i = 0; i < 49; ++i) {
      measureText.appendChild(document.createTextNode("x"));
      measureText.appendChild(elt("br"));
    }
    measureText.appendChild(document.createTextNode("x"));
  }
  removeChildrenAndAdd(display.measure, measureText);
  var height = measureText.offsetHeight / 50;
  if (height > 3) { display.cachedTextHeight = height; }
  removeChildren(display.measure);
  return height || 1
}

// Compute the default character width.
function charWidth(display) {
  if (display.cachedCharWidth != null) { return display.cachedCharWidth }
  var anchor = elt("span", "xxxxxxxxxx");
  var pre = elt("pre", [anchor]);
  removeChildrenAndAdd(display.measure, pre);
  var rect = anchor.getBoundingClientRect(), width = (rect.right - rect.left) / 10;
  if (width > 2) { display.cachedCharWidth = width; }
  return width || 10
}

// Do a bulk-read of the DOM positions and sizes needed to draw the
// view, so that we don't interleave reading and writing to the DOM.
function getDimensions(cm) {
  var d = cm.display, left = {}, width = {};
  var gutterLeft = d.gutters.clientLeft;
  for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
    left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft;
    width[cm.options.gutters[i]] = n.clientWidth;
  }
  return {fixedPos: compensateForHScroll(d),
          gutterTotalWidth: d.gutters.offsetWidth,
          gutterLeft: left,
          gutterWidth: width,
          wrapperWidth: d.wrapper.clientWidth}
}

// Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
// but using getBoundingClientRect to get a sub-pixel-accurate
// result.
function compensateForHScroll(display) {
  return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left
}

// Returns a function that estimates the height of a line, to use as
// first approximation until the line becomes visible (and is thus
// properly measurable).
function estimateHeight(cm) {
  var th = textHeight(cm.display), wrapping = cm.options.lineWrapping;
  var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
  return function (line) {
    if (lineIsHidden(cm.doc, line)) { return 0 }

    var widgetsHeight = 0;
    if (line.widgets) { for (var i = 0; i < line.widgets.length; i++) {
      if (line.widgets[i].height) { widgetsHeight += line.widgets[i].height; }
    } }

    if (wrapping)
      { return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th }
    else
      { return widgetsHeight + th }
  }
}

function estimateLineHeights(cm) {
  var doc = cm.doc, est = estimateHeight(cm);
  doc.iter(function (line) {
    var estHeight = est(line);
    if (estHeight != line.height) { updateLineHeight(line, estHeight); }
  });
}

// Given a mouse event, find the corresponding position. If liberal
// is false, it checks whether a gutter or scrollbar was clicked,
// and returns null if it was. forRect is used by rectangular
// selections, and tries to estimate a character position even for
// coordinates beyond the right of the text.
function posFromMouse(cm, e, liberal, forRect) {
  var display = cm.display;
  if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") { return null }

  var x, y, space = display.lineSpace.getBoundingClientRect();
  // Fails unpredictably on IE[67] when mouse is dragged around quickly.
  try { x = e.clientX - space.left; y = e.clientY - space.top; }
  catch (e) { return null }
  var coords = coordsChar(cm, x, y), line;
  if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
    var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
    coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
  }
  return coords
}

// Find the view element corresponding to a given line. Return null
// when the line isn't visible.
function findViewIndex(cm, n) {
  if (n >= cm.display.viewTo) { return null }
  n -= cm.display.viewFrom;
  if (n < 0) { return null }
  var view = cm.display.view;
  for (var i = 0; i < view.length; i++) {
    n -= view[i].size;
    if (n < 0) { return i }
  }
}

function updateSelection(cm) {
  cm.display.input.showSelection(cm.display.input.prepareSelection());
}

function prepareSelection(cm, primary) {
  var doc = cm.doc, result = {};
  var curFragment = result.cursors = document.createDocumentFragment();
  var selFragment = result.selection = document.createDocumentFragment();

  for (var i = 0; i < doc.sel.ranges.length; i++) {
    if (primary === false && i == doc.sel.primIndex) { continue }
    var range$$1 = doc.sel.ranges[i];
    if (range$$1.from().line >= cm.display.viewTo || range$$1.to().line < cm.display.viewFrom) { continue }
    var collapsed = range$$1.empty();
    if (collapsed || cm.options.showCursorWhenSelecting)
      { drawSelectionCursor(cm, range$$1.head, curFragment); }
    if (!collapsed)
      { drawSelectionRange(cm, range$$1, selFragment); }
  }
  return result
}

// Draws a cursor for the given range
function drawSelectionCursor(cm, head, output) {
  var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);

  var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
  cursor.style.left = pos.left + "px";
  cursor.style.top = pos.top + "px";
  cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

  if (pos.other) {
    // Secondary cursor, shown when on a 'jump' in bi-directional text
    var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
    otherCursor.style.display = "";
    otherCursor.style.left = pos.other.left + "px";
    otherCursor.style.top = pos.other.top + "px";
    otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
  }
}

// Draws the given range as a highlighted selection
function drawSelectionRange(cm, range$$1, output) {
  var display = cm.display, doc = cm.doc;
  var fragment = document.createDocumentFragment();
  var padding = paddingH(cm.display), leftSide = padding.left;
  var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;

  function add(left, top, width, bottom) {
    if (top < 0) { top = 0; }
    top = Math.round(top);
    bottom = Math.round(bottom);
    fragment.appendChild(elt("div", null, "CodeMirror-selected", ("position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (width == null ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px")));
  }

  function drawForLine(line, fromArg, toArg) {
    var lineObj = getLine(doc, line);
    var lineLen = lineObj.text.length;
    var start, end;
    function coords(ch, bias) {
      return charCoords(cm, Pos(line, ch), "div", lineObj, bias)
    }

    iterateBidiSections(getOrder(lineObj, doc.direction), fromArg || 0, toArg == null ? lineLen : toArg, function (from, to, dir) {
      var leftPos = coords(from, "left"), rightPos, left, right;
      if (from == to) {
        rightPos = leftPos;
        left = right = leftPos.left;
      } else {
        rightPos = coords(to - 1, "right");
        if (dir == "rtl") { var tmp = leftPos; leftPos = rightPos; rightPos = tmp; }
        left = leftPos.left;
        right = rightPos.right;
      }
      if (fromArg == null && from == 0) { left = leftSide; }
      if (rightPos.top - leftPos.top > 3) { // Different lines, draw top part
        add(left, leftPos.top, null, leftPos.bottom);
        left = leftSide;
        if (leftPos.bottom < rightPos.top) { add(left, leftPos.bottom, null, rightPos.top); }
      }
      if (toArg == null && to == lineLen) { right = rightSide; }
      if (!start || leftPos.top < start.top || leftPos.top == start.top && leftPos.left < start.left)
        { start = leftPos; }
      if (!end || rightPos.bottom > end.bottom || rightPos.bottom == end.bottom && rightPos.right > end.right)
        { end = rightPos; }
      if (left < leftSide + 1) { left = leftSide; }
      add(left, rightPos.top, right - left, rightPos.bottom);
    });
    return {start: start, end: end}
  }

  var sFrom = range$$1.from(), sTo = range$$1.to();
  if (sFrom.line == sTo.line) {
    drawForLine(sFrom.line, sFrom.ch, sTo.ch);
  } else {
    var fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line);
    var singleVLine = visualLine(fromLine) == visualLine(toLine);
    var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
    var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
    if (singleVLine) {
      if (leftEnd.top < rightStart.top - 2) {
        add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
        add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
      } else {
        add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
      }
    }
    if (leftEnd.bottom < rightStart.top)
      { add(leftSide, leftEnd.bottom, null, rightStart.top); }
  }

  output.appendChild(fragment);
}

// Cursor-blinking
function restartBlink(cm) {
  if (!cm.state.focused) { return }
  var display = cm.display;
  clearInterval(display.blinker);
  var on = true;
  display.cursorDiv.style.visibility = "";
  if (cm.options.cursorBlinkRate > 0)
    { display.blinker = setInterval(function () { return display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden"; },
      cm.options.cursorBlinkRate); }
  else if (cm.options.cursorBlinkRate < 0)
    { display.cursorDiv.style.visibility = "hidden"; }
}

function ensureFocus(cm) {
  if (!cm.state.focused) { cm.display.input.focus(); onFocus(cm); }
}

function delayBlurEvent(cm) {
  cm.state.delayingBlurEvent = true;
  setTimeout(function () { if (cm.state.delayingBlurEvent) {
    cm.state.delayingBlurEvent = false;
    onBlur(cm);
  } }, 100);
}

function onFocus(cm, e) {
  if (cm.state.delayingBlurEvent) { cm.state.delayingBlurEvent = false; }

  if (cm.options.readOnly == "nocursor") { return }
  if (!cm.state.focused) {
    signal(cm, "focus", cm, e);
    cm.state.focused = true;
    addClass(cm.display.wrapper, "CodeMirror-focused");
    // This test prevents this from firing when a context
    // menu is closed (since the input reset would kill the
    // select-all detection hack)
    if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
      cm.display.input.reset();
      if (webkit) { setTimeout(function () { return cm.display.input.reset(true); }, 20); } // Issue #1730
    }
    cm.display.input.receivedFocus();
  }
  restartBlink(cm);
}
function onBlur(cm, e) {
  if (cm.state.delayingBlurEvent) { return }

  if (cm.state.focused) {
    signal(cm, "blur", cm, e);
    cm.state.focused = false;
    rmClass(cm.display.wrapper, "CodeMirror-focused");
  }
  clearInterval(cm.display.blinker);
  setTimeout(function () { if (!cm.state.focused) { cm.display.shift = false; } }, 150);
}

// Read the actual heights of the rendered lines, and update their
// stored heights to match.
function updateHeightsInViewport(cm) {
  var display = cm.display;
  var prevBottom = display.lineDiv.offsetTop;
  for (var i = 0; i < display.view.length; i++) {
    var cur = display.view[i], height = (void 0);
    if (cur.hidden) { continue }
    if (ie && ie_version < 8) {
      var bot = cur.node.offsetTop + cur.node.offsetHeight;
      height = bot - prevBottom;
      prevBottom = bot;
    } else {
      var box = cur.node.getBoundingClientRect();
      height = box.bottom - box.top;
    }
    var diff = cur.line.height - height;
    if (height < 2) { height = textHeight(display); }
    if (diff > .001 || diff < -.001) {
      updateLineHeight(cur.line, height);
      updateWidgetHeight(cur.line);
      if (cur.rest) { for (var j = 0; j < cur.rest.length; j++)
        { updateWidgetHeight(cur.rest[j]); } }
    }
  }
}

// Read and store the height of line widgets associated with the
// given line.
function updateWidgetHeight(line) {
  if (line.widgets) { for (var i = 0; i < line.widgets.length; ++i)
    { line.widgets[i].height = line.widgets[i].node.parentNode.offsetHeight; } }
}

// Compute the lines that are visible in a given viewport (defaults
// the the current scroll position). viewport may contain top,
// height, and ensure (see op.scrollToPos) properties.
function visibleLines(display, doc, viewport) {
  var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
  top = Math.floor(top - paddingTop(display));
  var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

  var from = lineAtHeight(doc, top), to = lineAtHeight(doc, bottom);
  // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
  // forces those lines into the viewport (if possible).
  if (viewport && viewport.ensure) {
    var ensureFrom = viewport.ensure.from.line, ensureTo = viewport.ensure.to.line;
    if (ensureFrom < from) {
      from = ensureFrom;
      to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
    } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
      from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
      to = ensureTo;
    }
  }
  return {from: from, to: Math.max(to, from + 1)}
}

// Re-align line numbers and gutter marks to compensate for
// horizontal scrolling.
function alignHorizontally(cm) {
  var display = cm.display, view = display.view;
  if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) { return }
  var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
  var gutterW = display.gutters.offsetWidth, left = comp + "px";
  for (var i = 0; i < view.length; i++) { if (!view[i].hidden) {
    if (cm.options.fixedGutter) {
      if (view[i].gutter)
        { view[i].gutter.style.left = left; }
      if (view[i].gutterBackground)
        { view[i].gutterBackground.style.left = left; }
    }
    var align = view[i].alignable;
    if (align) { for (var j = 0; j < align.length; j++)
      { align[j].style.left = left; } }
  } }
  if (cm.options.fixedGutter)
    { display.gutters.style.left = (comp + gutterW) + "px"; }
}

// Used to ensure that the line number gutter is still the right
// size for the current document size. Returns true when an update
// is needed.
function maybeUpdateLineNumberWidth(cm) {
  if (!cm.options.lineNumbers) { return false }
  var doc = cm.doc, last = lineNumberFor(cm.options, doc.first + doc.size - 1), display = cm.display;
  if (last.length != display.lineNumChars) {
    var test = display.measure.appendChild(elt("div", [elt("div", last)],
                                               "CodeMirror-linenumber CodeMirror-gutter-elt"));
    var innerW = test.firstChild.offsetWidth, padding = test.offsetWidth - innerW;
    display.lineGutter.style.width = "";
    display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
    display.lineNumWidth = display.lineNumInnerWidth + padding;
    display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
    display.lineGutter.style.width = display.lineNumWidth + "px";
    updateGutterSpace(cm);
    return true
  }
  return false
}

// SCROLLING THINGS INTO VIEW

// If an editor sits on the top or bottom of the window, partially
// scrolled out of view, this ensures that the cursor is visible.
function maybeScrollWindow(cm, rect) {
  if (signalDOMEvent(cm, "scrollCursorIntoView")) { return }

  var display = cm.display, box = display.sizer.getBoundingClientRect(), doScroll = null;
  if (rect.top + box.top < 0) { doScroll = true; }
  else if (rect.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) { doScroll = false; }
  if (doScroll != null && !phantom) {
    var scrollNode = elt("div", "\u200b", null, ("position: absolute;\n                         top: " + (rect.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (rect.bottom - rect.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + (rect.left) + "px; width: " + (Math.max(2, rect.right - rect.left)) + "px;"));
    cm.display.lineSpace.appendChild(scrollNode);
    scrollNode.scrollIntoView(doScroll);
    cm.display.lineSpace.removeChild(scrollNode);
  }
}

// Scroll a given position into view (immediately), verifying that
// it actually became visible (as line heights are accurately
// measured, the position of something may 'drift' during drawing).
function scrollPosIntoView(cm, pos, end, margin) {
  if (margin == null) { margin = 0; }
  var rect;
  for (var limit = 0; limit < 5; limit++) {
    var changed = false;
    var coords = cursorCoords(cm, pos);
    var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
    rect = {left: Math.min(coords.left, endCoords.left),
            top: Math.min(coords.top, endCoords.top) - margin,
            right: Math.max(coords.left, endCoords.left),
            bottom: Math.max(coords.bottom, endCoords.bottom) + margin};
    var scrollPos = calculateScrollPos(cm, rect);
    var startTop = cm.doc.scrollTop, startLeft = cm.doc.scrollLeft;
    if (scrollPos.scrollTop != null) {
      updateScrollTop(cm, scrollPos.scrollTop);
      if (Math.abs(cm.doc.scrollTop - startTop) > 1) { changed = true; }
    }
    if (scrollPos.scrollLeft != null) {
      setScrollLeft(cm, scrollPos.scrollLeft);
      if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) { changed = true; }
    }
    if (!changed) { break }
  }
  return rect
}

// Scroll a given set of coordinates into view (immediately).
function scrollIntoView(cm, rect) {
  var scrollPos = calculateScrollPos(cm, rect);
  if (scrollPos.scrollTop != null) { updateScrollTop(cm, scrollPos.scrollTop); }
  if (scrollPos.scrollLeft != null) { setScrollLeft(cm, scrollPos.scrollLeft); }
}

// Calculate a new scroll position needed to scroll the given
// rectangle into view. Returns an object with scrollTop and
// scrollLeft properties. When these are undefined, the
// vertical/horizontal position does not need to be adjusted.
function calculateScrollPos(cm, rect) {
  var display = cm.display, snapMargin = textHeight(cm.display);
  if (rect.top < 0) { rect.top = 0; }
  var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
  var screen = displayHeight(cm), result = {};
  if (rect.bottom - rect.top > screen) { rect.bottom = rect.top + screen; }
  var docBottom = cm.doc.height + paddingVert(display);
  var atTop = rect.top < snapMargin, atBottom = rect.bottom > docBottom - snapMargin;
  if (rect.top < screentop) {
    result.scrollTop = atTop ? 0 : rect.top;
  } else if (rect.bottom > screentop + screen) {
    var newTop = Math.min(rect.top, (atBottom ? docBottom : rect.bottom) - screen);
    if (newTop != screentop) { result.scrollTop = newTop; }
  }

  var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
  var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
  var tooWide = rect.right - rect.left > screenw;
  if (tooWide) { rect.right = rect.left + screenw; }
  if (rect.left < 10)
    { result.scrollLeft = 0; }
  else if (rect.left < screenleft)
    { result.scrollLeft = Math.max(0, rect.left - (tooWide ? 0 : 10)); }
  else if (rect.right > screenw + screenleft - 3)
    { result.scrollLeft = rect.right + (tooWide ? 0 : 10) - screenw; }
  return result
}

// Store a relative adjustment to the scroll position in the current
// operation (to be applied when the operation finishes).
function addToScrollTop(cm, top) {
  if (top == null) { return }
  resolveScrollToPos(cm);
  cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
}

// Make sure that at the end of the operation the current cursor is
// shown.
function ensureCursorVisible(cm) {
  resolveScrollToPos(cm);
  var cur = cm.getCursor(), from = cur, to = cur;
  if (!cm.options.lineWrapping) {
    from = cur.ch ? Pos(cur.line, cur.ch - 1) : cur;
    to = Pos(cur.line, cur.ch + 1);
  }
  cm.curOp.scrollToPos = {from: from, to: to, margin: cm.options.cursorScrollMargin};
}

function scrollToCoords(cm, x, y) {
  if (x != null || y != null) { resolveScrollToPos(cm); }
  if (x != null) { cm.curOp.scrollLeft = x; }
  if (y != null) { cm.curOp.scrollTop = y; }
}

function scrollToRange(cm, range$$1) {
  resolveScrollToPos(cm);
  cm.curOp.scrollToPos = range$$1;
}

// When an operation has its scrollToPos property set, and another
// scroll action is applied before the end of the operation, this
// 'simulates' scrolling that position into view in a cheap way, so
// that the effect of intermediate scroll commands is not ignored.
function resolveScrollToPos(cm) {
  var range$$1 = cm.curOp.scrollToPos;
  if (range$$1) {
    cm.curOp.scrollToPos = null;
    var from = estimateCoords(cm, range$$1.from), to = estimateCoords(cm, range$$1.to);
    scrollToCoordsRange(cm, from, to, range$$1.margin);
  }
}

function scrollToCoordsRange(cm, from, to, margin) {
  var sPos = calculateScrollPos(cm, {
    left: Math.min(from.left, to.left),
    top: Math.min(from.top, to.top) - margin,
    right: Math.max(from.right, to.right),
    bottom: Math.max(from.bottom, to.bottom) + margin
  });
  scrollToCoords(cm, sPos.scrollLeft, sPos.scrollTop);
}

// Sync the scrollable area and scrollbars, ensure the viewport
// covers the visible area.
function updateScrollTop(cm, val) {
  if (Math.abs(cm.doc.scrollTop - val) < 2) { return }
  if (!gecko) { updateDisplaySimple(cm, {top: val}); }
  setScrollTop(cm, val, true);
  if (gecko) { updateDisplaySimple(cm); }
  startWorker(cm, 100);
}

function setScrollTop(cm, val, forceScroll) {
  val = Math.min(cm.display.scroller.scrollHeight - cm.display.scroller.clientHeight, val);
  if (cm.display.scroller.scrollTop == val && !forceScroll) { return }
  cm.doc.scrollTop = val;
  cm.display.scrollbars.setScrollTop(val);
  if (cm.display.scroller.scrollTop != val) { cm.display.scroller.scrollTop = val; }
}

// Sync scroller and scrollbar, ensure the gutter elements are
// aligned.
function setScrollLeft(cm, val, isScroller, forceScroll) {
  val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);
  if ((isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) && !forceScroll) { return }
  cm.doc.scrollLeft = val;
  alignHorizontally(cm);
  if (cm.display.scroller.scrollLeft != val) { cm.display.scroller.scrollLeft = val; }
  cm.display.scrollbars.setScrollLeft(val);
}

// SCROLLBARS

// Prepare DOM reads needed to update the scrollbars. Done in one
// shot to minimize update/measure roundtrips.
function measureForScrollbars(cm) {
  var d = cm.display, gutterW = d.gutters.offsetWidth;
  var docH = Math.round(cm.doc.height + paddingVert(cm.display));
  return {
    clientHeight: d.scroller.clientHeight,
    viewHeight: d.wrapper.clientHeight,
    scrollWidth: d.scroller.scrollWidth, clientWidth: d.scroller.clientWidth,
    viewWidth: d.wrapper.clientWidth,
    barLeft: cm.options.fixedGutter ? gutterW : 0,
    docHeight: docH,
    scrollHeight: docH + scrollGap(cm) + d.barHeight,
    nativeBarWidth: d.nativeBarWidth,
    gutterWidth: gutterW
  }
}

var NativeScrollbars = function(place, scroll, cm) {
  this.cm = cm;
  var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
  var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
  place(vert); place(horiz);

  on(vert, "scroll", function () {
    if (vert.clientHeight) { scroll(vert.scrollTop, "vertical"); }
  });
  on(horiz, "scroll", function () {
    if (horiz.clientWidth) { scroll(horiz.scrollLeft, "horizontal"); }
  });

  this.checkedZeroWidth = false;
  // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
  if (ie && ie_version < 8) { this.horiz.style.minHeight = this.vert.style.minWidth = "18px"; }
};

NativeScrollbars.prototype.update = function (measure) {
  var needsH = measure.scrollWidth > measure.clientWidth + 1;
  var needsV = measure.scrollHeight > measure.clientHeight + 1;
  var sWidth = measure.nativeBarWidth;

  if (needsV) {
    this.vert.style.display = "block";
    this.vert.style.bottom = needsH ? sWidth + "px" : "0";
    var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
    // A bug in IE8 can cause this value to be negative, so guard it.
    this.vert.firstChild.style.height =
      Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
  } else {
    this.vert.style.display = "";
    this.vert.firstChild.style.height = "0";
  }

  if (needsH) {
    this.horiz.style.display = "block";
    this.horiz.style.right = needsV ? sWidth + "px" : "0";
    this.horiz.style.left = measure.barLeft + "px";
    var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
    this.horiz.firstChild.style.width =
      Math.max(0, measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
  } else {
    this.horiz.style.display = "";
    this.horiz.firstChild.style.width = "0";
  }

  if (!this.checkedZeroWidth && measure.clientHeight > 0) {
    if (sWidth == 0) { this.zeroWidthHack(); }
    this.checkedZeroWidth = true;
  }

  return {right: needsV ? sWidth : 0, bottom: needsH ? sWidth : 0}
};

NativeScrollbars.prototype.setScrollLeft = function (pos) {
  if (this.horiz.scrollLeft != pos) { this.horiz.scrollLeft = pos; }
  if (this.disableHoriz) { this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz"); }
};

NativeScrollbars.prototype.setScrollTop = function (pos) {
  if (this.vert.scrollTop != pos) { this.vert.scrollTop = pos; }
  if (this.disableVert) { this.enableZeroWidthBar(this.vert, this.disableVert, "vert"); }
};

NativeScrollbars.prototype.zeroWidthHack = function () {
  var w = mac && !mac_geMountainLion ? "12px" : "18px";
  this.horiz.style.height = this.vert.style.width = w;
  this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none";
  this.disableHoriz = new Delayed;
  this.disableVert = new Delayed;
};

NativeScrollbars.prototype.enableZeroWidthBar = function (bar, delay, type) {
  bar.style.pointerEvents = "auto";
  function maybeDisable() {
    // To find out whether the scrollbar is still visible, we
    // check whether the element under the pixel in the bottom
    // right corner of the scrollbar box is the scrollbar box
    // itself (when the bar is still visible) or its filler child
    // (when the bar is hidden). If it is still visible, we keep
    // it enabled, if it's hidden, we disable pointer events.
    var box = bar.getBoundingClientRect();
    var elt$$1 = type == "vert" ? document.elementFromPoint(box.right - 1, (box.top + box.bottom) / 2)
        : document.elementFromPoint((box.right + box.left) / 2, box.bottom - 1);
    if (elt$$1 != bar) { bar.style.pointerEvents = "none"; }
    else { delay.set(1000, maybeDisable); }
  }
  delay.set(1000, maybeDisable);
};

NativeScrollbars.prototype.clear = function () {
  var parent = this.horiz.parentNode;
  parent.removeChild(this.horiz);
  parent.removeChild(this.vert);
};

var NullScrollbars = function () {};

NullScrollbars.prototype.update = function () { return {bottom: 0, right: 0} };
NullScrollbars.prototype.setScrollLeft = function () {};
NullScrollbars.prototype.setScrollTop = function () {};
NullScrollbars.prototype.clear = function () {};

function updateScrollbars(cm, measure) {
  if (!measure) { measure = measureForScrollbars(cm); }
  var startWidth = cm.display.barWidth, startHeight = cm.display.barHeight;
  updateScrollbarsInner(cm, measure);
  for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
    if (startWidth != cm.display.barWidth && cm.options.lineWrapping)
      { updateHeightsInViewport(cm); }
    updateScrollbarsInner(cm, measureForScrollbars(cm));
    startWidth = cm.display.barWidth; startHeight = cm.display.barHeight;
  }
}

// Re-synchronize the fake scrollbars with the actual size of the
// content.
function updateScrollbarsInner(cm, measure) {
  var d = cm.display;
  var sizes = d.scrollbars.update(measure);

  d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
  d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";
  d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent";

  if (sizes.right && sizes.bottom) {
    d.scrollbarFiller.style.display = "block";
    d.scrollbarFiller.style.height = sizes.bottom + "px";
    d.scrollbarFiller.style.width = sizes.right + "px";
  } else { d.scrollbarFiller.style.display = ""; }
  if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
    d.gutterFiller.style.display = "block";
    d.gutterFiller.style.height = sizes.bottom + "px";
    d.gutterFiller.style.width = measure.gutterWidth + "px";
  } else { d.gutterFiller.style.display = ""; }
}

var scrollbarModel = {"native": NativeScrollbars, "null": NullScrollbars};

function initScrollbars(cm) {
  if (cm.display.scrollbars) {
    cm.display.scrollbars.clear();
    if (cm.display.scrollbars.addClass)
      { rmClass(cm.display.wrapper, cm.display.scrollbars.addClass); }
  }

  cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function (node) {
    cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
    // Prevent clicks in the scrollbars from killing focus
    on(node, "mousedown", function () {
      if (cm.state.focused) { setTimeout(function () { return cm.display.input.focus(); }, 0); }
    });
    node.setAttribute("cm-not-content", "true");
  }, function (pos, axis) {
    if (axis == "horizontal") { setScrollLeft(cm, pos); }
    else { updateScrollTop(cm, pos); }
  }, cm);
  if (cm.display.scrollbars.addClass)
    { addClass(cm.display.wrapper, cm.display.scrollbars.addClass); }
}

// Operations are used to wrap a series of changes to the editor
// state in such a way that each change won't have to update the
// cursor and display (which would be awkward, slow, and
// error-prone). Instead, display updates are batched and then all
// combined and executed at once.

var nextOpId = 0;
// Start a new operation.
function startOperation(cm) {
  cm.curOp = {
    cm: cm,
    viewChanged: false,      // Flag that indicates that lines might need to be redrawn
    startHeight: cm.doc.height, // Used to detect need to update scrollbar
    forceUpdate: false,      // Used to force a redraw
    updateInput: null,       // Whether to reset the input textarea
    typing: false,           // Whether this reset should be careful to leave existing text (for compositing)
    changeObjs: null,        // Accumulated changes, for firing change events
    cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
    cursorActivityCalled: 0, // Tracks which cursorActivity handlers have been called already
    selectionChanged: false, // Whether the selection needs to be redrawn
    updateMaxLine: false,    // Set when the widest line needs to be determined anew
    scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
    scrollToPos: null,       // Used to scroll to a specific position
    focus: false,
    id: ++nextOpId           // Unique ID
  };
  pushOperation(cm.curOp);
}

// Finish an operation, updating the display and signalling delayed events
function endOperation(cm) {
  var op = cm.curOp;
  finishOperation(op, function (group) {
    for (var i = 0; i < group.ops.length; i++)
      { group.ops[i].cm.curOp = null; }
    endOperations(group);
  });
}

// The DOM updates done when an operation finishes are batched so
// that the minimum number of relayouts are required.
function endOperations(group) {
  var ops = group.ops;
  for (var i = 0; i < ops.length; i++) // Read DOM
    { endOperation_R1(ops[i]); }
  for (var i$1 = 0; i$1 < ops.length; i$1++) // Write DOM (maybe)
    { endOperation_W1(ops[i$1]); }
  for (var i$2 = 0; i$2 < ops.length; i$2++) // Read DOM
    { endOperation_R2(ops[i$2]); }
  for (var i$3 = 0; i$3 < ops.length; i$3++) // Write DOM (maybe)
    { endOperation_W2(ops[i$3]); }
  for (var i$4 = 0; i$4 < ops.length; i$4++) // Read DOM
    { endOperation_finish(ops[i$4]); }
}

function endOperation_R1(op) {
  var cm = op.cm, display = cm.display;
  maybeClipScrollbars(cm);
  if (op.updateMaxLine) { findMaxLine(cm); }

  op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null ||
    op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom ||
                       op.scrollToPos.to.line >= display.viewTo) ||
    display.maxLineChanged && cm.options.lineWrapping;
  op.update = op.mustUpdate &&
    new DisplayUpdate(cm, op.mustUpdate && {top: op.scrollTop, ensure: op.scrollToPos}, op.forceUpdate);
}

function endOperation_W1(op) {
  op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
}

function endOperation_R2(op) {
  var cm = op.cm, display = cm.display;
  if (op.updatedDisplay) { updateHeightsInViewport(cm); }

  op.barMeasure = measureForScrollbars(cm);

  // If the max line changed since it was last measured, measure it,
  // and ensure the document's width matches it.
  // updateDisplay_W2 will use these properties to do the actual resizing
  if (display.maxLineChanged && !cm.options.lineWrapping) {
    op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
    cm.display.sizerWidth = op.adjustWidthTo;
    op.barMeasure.scrollWidth =
      Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
    op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
  }

  if (op.updatedDisplay || op.selectionChanged)
    { op.preparedSelection = display.input.prepareSelection(op.focus); }
}

function endOperation_W2(op) {
  var cm = op.cm;

  if (op.adjustWidthTo != null) {
    cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
    if (op.maxScrollLeft < cm.doc.scrollLeft)
      { setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true); }
    cm.display.maxLineChanged = false;
  }

  var takeFocus = op.focus && op.focus == activeElt() && (!document.hasFocus || document.hasFocus());
  if (op.preparedSelection)
    { cm.display.input.showSelection(op.preparedSelection, takeFocus); }
  if (op.updatedDisplay || op.startHeight != cm.doc.height)
    { updateScrollbars(cm, op.barMeasure); }
  if (op.updatedDisplay)
    { setDocumentHeight(cm, op.barMeasure); }

  if (op.selectionChanged) { restartBlink(cm); }

  if (cm.state.focused && op.updateInput)
    { cm.display.input.reset(op.typing); }
  if (takeFocus) { ensureFocus(op.cm); }
}

function endOperation_finish(op) {
  var cm = op.cm, display = cm.display, doc = cm.doc;

  if (op.updatedDisplay) { postUpdateDisplay(cm, op.update); }

  // Abort mouse wheel delta measurement, when scrolling explicitly
  if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
    { display.wheelStartX = display.wheelStartY = null; }

  // Propagate the scroll position to the actual DOM scroller
  if (op.scrollTop != null) { setScrollTop(cm, op.scrollTop, op.forceScroll); }

  if (op.scrollLeft != null) { setScrollLeft(cm, op.scrollLeft, true, true); }
  // If we need to scroll a specific position into view, do so.
  if (op.scrollToPos) {
    var rect = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from),
                                 clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
    maybeScrollWindow(cm, rect);
  }

  // Fire events for markers that are hidden/unidden by editing or
  // undoing
  var hidden = op.maybeHiddenMarkers, unhidden = op.maybeUnhiddenMarkers;
  if (hidden) { for (var i = 0; i < hidden.length; ++i)
    { if (!hidden[i].lines.length) { signal(hidden[i], "hide"); } } }
  if (unhidden) { for (var i$1 = 0; i$1 < unhidden.length; ++i$1)
    { if (unhidden[i$1].lines.length) { signal(unhidden[i$1], "unhide"); } } }

  if (display.wrapper.offsetHeight)
    { doc.scrollTop = cm.display.scroller.scrollTop; }

  // Fire change events, and delayed event handlers
  if (op.changeObjs)
    { signal(cm, "changes", cm, op.changeObjs); }
  if (op.update)
    { op.update.finish(); }
}

// Run the given function in an operation
function runInOp(cm, f) {
  if (cm.curOp) { return f() }
  startOperation(cm);
  try { return f() }
  finally { endOperation(cm); }
}
// Wraps a function in an operation. Returns the wrapped function.
function operation(cm, f) {
  return function() {
    if (cm.curOp) { return f.apply(cm, arguments) }
    startOperation(cm);
    try { return f.apply(cm, arguments) }
    finally { endOperation(cm); }
  }
}
// Used to add methods to editor and doc instances, wrapping them in
// operations.
function methodOp(f) {
  return function() {
    if (this.curOp) { return f.apply(this, arguments) }
    startOperation(this);
    try { return f.apply(this, arguments) }
    finally { endOperation(this); }
  }
}
function docMethodOp(f) {
  return function() {
    var cm = this.cm;
    if (!cm || cm.curOp) { return f.apply(this, arguments) }
    startOperation(cm);
    try { return f.apply(this, arguments) }
    finally { endOperation(cm); }
  }
}

// Updates the display.view data structure for a given change to the
// document. From and to are in pre-change coordinates. Lendiff is
// the amount of lines added or subtracted by the change. This is
// used for changes that span multiple lines, or change the way
// lines are divided into visual lines. regLineChange (below)
// registers single-line changes.
function regChange(cm, from, to, lendiff) {
  if (from == null) { from = cm.doc.first; }
  if (to == null) { to = cm.doc.first + cm.doc.size; }
  if (!lendiff) { lendiff = 0; }

  var display = cm.display;
  if (lendiff && to < display.viewTo &&
      (display.updateLineNumbers == null || display.updateLineNumbers > from))
    { display.updateLineNumbers = from; }

  cm.curOp.viewChanged = true;

  if (from >= display.viewTo) { // Change after
    if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
      { resetView(cm); }
  } else if (to <= display.viewFrom) { // Change before
    if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
      resetView(cm);
    } else {
      display.viewFrom += lendiff;
      display.viewTo += lendiff;
    }
  } else if (from <= display.viewFrom && to >= display.viewTo) { // Full overlap
    resetView(cm);
  } else if (from <= display.viewFrom) { // Top overlap
    var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
    if (cut) {
      display.view = display.view.slice(cut.index);
      display.viewFrom = cut.lineN;
      display.viewTo += lendiff;
    } else {
      resetView(cm);
    }
  } else if (to >= display.viewTo) { // Bottom overlap
    var cut$1 = viewCuttingPoint(cm, from, from, -1);
    if (cut$1) {
      display.view = display.view.slice(0, cut$1.index);
      display.viewTo = cut$1.lineN;
    } else {
      resetView(cm);
    }
  } else { // Gap in the middle
    var cutTop = viewCuttingPoint(cm, from, from, -1);
    var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
    if (cutTop && cutBot) {
      display.view = display.view.slice(0, cutTop.index)
        .concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN))
        .concat(display.view.slice(cutBot.index));
      display.viewTo += lendiff;
    } else {
      resetView(cm);
    }
  }

  var ext = display.externalMeasured;
  if (ext) {
    if (to < ext.lineN)
      { ext.lineN += lendiff; }
    else if (from < ext.lineN + ext.size)
      { display.externalMeasured = null; }
  }
}

// Register a change to a single line. Type must be one of "text",
// "gutter", "class", "widget"
function regLineChange(cm, line, type) {
  cm.curOp.viewChanged = true;
  var display = cm.display, ext = cm.display.externalMeasured;
  if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
    { display.externalMeasured = null; }

  if (line < display.viewFrom || line >= display.viewTo) { return }
  var lineView = display.view[findViewIndex(cm, line)];
  if (lineView.node == null) { return }
  var arr = lineView.changes || (lineView.changes = []);
  if (indexOf(arr, type) == -1) { arr.push(type); }
}

// Clear the view.
function resetView(cm) {
  cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
  cm.display.view = [];
  cm.display.viewOffset = 0;
}

function viewCuttingPoint(cm, oldN, newN, dir) {
  var index = findViewIndex(cm, oldN), diff, view = cm.display.view;
  if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
    { return {index: index, lineN: newN} }
  var n = cm.display.viewFrom;
  for (var i = 0; i < index; i++)
    { n += view[i].size; }
  if (n != oldN) {
    if (dir > 0) {
      if (index == view.length - 1) { return null }
      diff = (n + view[index].size) - oldN;
      index++;
    } else {
      diff = n - oldN;
    }
    oldN += diff; newN += diff;
  }
  while (visualLineNo(cm.doc, newN) != newN) {
    if (index == (dir < 0 ? 0 : view.length - 1)) { return null }
    newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
    index += dir;
  }
  return {index: index, lineN: newN}
}

// Force the view to cover a given range, adding empty view element
// or clipping off existing ones as needed.
function adjustView(cm, from, to) {
  var display = cm.display, view = display.view;
  if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
    display.view = buildViewArray(cm, from, to);
    display.viewFrom = from;
  } else {
    if (display.viewFrom > from)
      { display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view); }
    else if (display.viewFrom < from)
      { display.view = display.view.slice(findViewIndex(cm, from)); }
    display.viewFrom = from;
    if (display.viewTo < to)
      { display.view = display.view.concat(buildViewArray(cm, display.viewTo, to)); }
    else if (display.viewTo > to)
      { display.view = display.view.slice(0, findViewIndex(cm, to)); }
  }
  display.viewTo = to;
}

// Count the number of lines in the view whose DOM representation is
// out of date (or nonexistent).
function countDirtyView(cm) {
  var view = cm.display.view, dirty = 0;
  for (var i = 0; i < view.length; i++) {
    var lineView = view[i];
    if (!lineView.hidden && (!lineView.node || lineView.changes)) { ++dirty; }
  }
  return dirty
}

// HIGHLIGHT WORKER

function startWorker(cm, time) {
  if (cm.doc.mode.startState && cm.doc.frontier < cm.display.viewTo)
    { cm.state.highlight.set(time, bind(highlightWorker, cm)); }
}

function highlightWorker(cm) {
  var doc = cm.doc;
  if (doc.frontier < doc.first) { doc.frontier = doc.first; }
  if (doc.frontier >= cm.display.viewTo) { return }
  var end = +new Date + cm.options.workTime;
  var state = copyState(doc.mode, getStateBefore(cm, doc.frontier));
  var changedLines = [];

  doc.iter(doc.frontier, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function (line) {
    if (doc.frontier >= cm.display.viewFrom) { // Visible
      var oldStyles = line.styles, tooLong = line.text.length > cm.options.maxHighlightLength;
      var highlighted = highlightLine(cm, line, tooLong ? copyState(doc.mode, state) : state, true);
      line.styles = highlighted.styles;
      var oldCls = line.styleClasses, newCls = highlighted.classes;
      if (newCls) { line.styleClasses = newCls; }
      else if (oldCls) { line.styleClasses = null; }
      var ischange = !oldStyles || oldStyles.length != line.styles.length ||
        oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);
      for (var i = 0; !ischange && i < oldStyles.length; ++i) { ischange = oldStyles[i] != line.styles[i]; }
      if (ischange) { changedLines.push(doc.frontier); }
      line.stateAfter = tooLong ? state : copyState(doc.mode, state);
    } else {
      if (line.text.length <= cm.options.maxHighlightLength)
        { processLine(cm, line.text, state); }
      line.stateAfter = doc.frontier % 5 == 0 ? copyState(doc.mode, state) : null;
    }
    ++doc.frontier;
    if (+new Date > end) {
      startWorker(cm, cm.options.workDelay);
      return true
    }
  });
  if (changedLines.length) { runInOp(cm, function () {
    for (var i = 0; i < changedLines.length; i++)
      { regLineChange(cm, changedLines[i], "text"); }
  }); }
}

// DISPLAY DRAWING

var DisplayUpdate = function(cm, viewport, force) {
  var display = cm.display;

  this.viewport = viewport;
  // Store some values that we'll need later (but don't want to force a relayout for)
  this.visible = visibleLines(display, cm.doc, viewport);
  this.editorIsHidden = !display.wrapper.offsetWidth;
  this.wrapperHeight = display.wrapper.clientHeight;
  this.wrapperWidth = display.wrapper.clientWidth;
  this.oldDisplayWidth = displayWidth(cm);
  this.force = force;
  this.dims = getDimensions(cm);
  this.events = [];
};

DisplayUpdate.prototype.signal = function (emitter, type) {
  if (hasHandler(emitter, type))
    { this.events.push(arguments); }
};
DisplayUpdate.prototype.finish = function () {
    var this$1 = this;

  for (var i = 0; i < this.events.length; i++)
    { signal.apply(null, this$1.events[i]); }
};

function maybeClipScrollbars(cm) {
  var display = cm.display;
  if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
    display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
    display.heightForcer.style.height = scrollGap(cm) + "px";
    display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
    display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
    display.scrollbarsClipped = true;
  }
}

function selectionSnapshot(cm) {
  if (cm.hasFocus()) { return null }
  var active = activeElt();
  if (!active || !contains(cm.display.lineDiv, active)) { return null }
  var result = {activeElt: active};
  if (window.getSelection) {
    var sel = window.getSelection();
    if (sel.anchorNode && sel.extend && contains(cm.display.lineDiv, sel.anchorNode)) {
      result.anchorNode = sel.anchorNode;
      result.anchorOffset = sel.anchorOffset;
      result.focusNode = sel.focusNode;
      result.focusOffset = sel.focusOffset;
    }
  }
  return result
}

function restoreSelection(snapshot) {
  if (!snapshot || !snapshot.activeElt || snapshot.activeElt == activeElt()) { return }
  snapshot.activeElt.focus();
  if (snapshot.anchorNode && contains(document.body, snapshot.anchorNode) && contains(document.body, snapshot.focusNode)) {
    var sel = window.getSelection(), range$$1 = document.createRange();
    range$$1.setEnd(snapshot.anchorNode, snapshot.anchorOffset);
    range$$1.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range$$1);
    sel.extend(snapshot.focusNode, snapshot.focusOffset);
  }
}

// Does the actual updating of the line display. Bails out
// (returning false) when there is nothing to be done and forced is
// false.
function updateDisplayIfNeeded(cm, update) {
  var display = cm.display, doc = cm.doc;

  if (update.editorIsHidden) {
    resetView(cm);
    return false
  }

  // Bail out if the visible area is already rendered and nothing changed.
  if (!update.force &&
      update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo &&
      (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) &&
      display.renderedView == display.view && countDirtyView(cm) == 0)
    { return false }

  if (maybeUpdateLineNumberWidth(cm)) {
    resetView(cm);
    update.dims = getDimensions(cm);
  }

  // Compute a suitable new viewport (from & to)
  var end = doc.first + doc.size;
  var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
  var to = Math.min(end, update.visible.to + cm.options.viewportMargin);
  if (display.viewFrom < from && from - display.viewFrom < 20) { from = Math.max(doc.first, display.viewFrom); }
  if (display.viewTo > to && display.viewTo - to < 20) { to = Math.min(end, display.viewTo); }
  if (sawCollapsedSpans) {
    from = visualLineNo(cm.doc, from);
    to = visualLineEndNo(cm.doc, to);
  }

  var different = from != display.viewFrom || to != display.viewTo ||
    display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
  adjustView(cm, from, to);

  display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
  // Position the mover div to align with the current scroll position
  cm.display.mover.style.top = display.viewOffset + "px";

  var toUpdate = countDirtyView(cm);
  if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view &&
      (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo))
    { return false }

  // For big changes, we hide the enclosing element during the
  // update, since that speeds up the operations on most browsers.
  var selSnapshot = selectionSnapshot(cm);
  if (toUpdate > 4) { display.lineDiv.style.display = "none"; }
  patchDisplay(cm, display.updateLineNumbers, update.dims);
  if (toUpdate > 4) { display.lineDiv.style.display = ""; }
  display.renderedView = display.view;
  // There might have been a widget with a focused element that got
  // hidden or updated, if so re-focus it.
  restoreSelection(selSnapshot);

  // Prevent selection and cursors from interfering with the scroll
  // width and height.
  removeChildren(display.cursorDiv);
  removeChildren(display.selectionDiv);
  display.gutters.style.height = display.sizer.style.minHeight = 0;

  if (different) {
    display.lastWrapHeight = update.wrapperHeight;
    display.lastWrapWidth = update.wrapperWidth;
    startWorker(cm, 400);
  }

  display.updateLineNumbers = null;

  return true
}

function postUpdateDisplay(cm, update) {
  var viewport = update.viewport;

  for (var first = true;; first = false) {
    if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
      // Clip forced viewport to actual scrollable area.
      if (viewport && viewport.top != null)
        { viewport = {top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)}; }
      // Updated line heights might result in the drawn area not
      // actually covering the viewport. Keep looping until it does.
      update.visible = visibleLines(cm.display, cm.doc, viewport);
      if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo)
        { break }
    }
    if (!updateDisplayIfNeeded(cm, update)) { break }
    updateHeightsInViewport(cm);
    var barMeasure = measureForScrollbars(cm);
    updateSelection(cm);
    updateScrollbars(cm, barMeasure);
    setDocumentHeight(cm, barMeasure);
  }

  update.signal(cm, "update", cm);
  if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
    update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
    cm.display.reportedViewFrom = cm.display.viewFrom; cm.display.reportedViewTo = cm.display.viewTo;
  }
}

function updateDisplaySimple(cm, viewport) {
  var update = new DisplayUpdate(cm, viewport);
  if (updateDisplayIfNeeded(cm, update)) {
    updateHeightsInViewport(cm);
    postUpdateDisplay(cm, update);
    var barMeasure = measureForScrollbars(cm);
    updateSelection(cm);
    updateScrollbars(cm, barMeasure);
    setDocumentHeight(cm, barMeasure);
    update.finish();
  }
}

// Sync the actual display DOM structure with display.view, removing
// nodes for lines that are no longer in view, and creating the ones
// that are not there yet, and updating the ones that are out of
// date.
function patchDisplay(cm, updateNumbersFrom, dims) {
  var display = cm.display, lineNumbers = cm.options.lineNumbers;
  var container = display.lineDiv, cur = container.firstChild;

  function rm(node) {
    var next = node.nextSibling;
    // Works around a throw-scroll bug in OS X Webkit
    if (webkit && mac && cm.display.currentWheelTarget == node)
      { node.style.display = "none"; }
    else
      { node.parentNode.removeChild(node); }
    return next
  }

  var view = display.view, lineN = display.viewFrom;
  // Loop over the elements in the view, syncing cur (the DOM nodes
  // in display.lineDiv) with the view as we go.
  for (var i = 0; i < view.length; i++) {
    var lineView = view[i];
    if (lineView.hidden) {
    } else if (!lineView.node || lineView.node.parentNode != container) { // Not drawn yet
      var node = buildLineElement(cm, lineView, lineN, dims);
      container.insertBefore(node, cur);
    } else { // Already drawn
      while (cur != lineView.node) { cur = rm(cur); }
      var updateNumber = lineNumbers && updateNumbersFrom != null &&
        updateNumbersFrom <= lineN && lineView.lineNumber;
      if (lineView.changes) {
        if (indexOf(lineView.changes, "gutter") > -1) { updateNumber = false; }
        updateLineForChanges(cm, lineView, lineN, dims);
      }
      if (updateNumber) {
        removeChildren(lineView.lineNumber);
        lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
      }
      cur = lineView.node.nextSibling;
    }
    lineN += lineView.size;
  }
  while (cur) { cur = rm(cur); }
}

function updateGutterSpace(cm) {
  var width = cm.display.gutters.offsetWidth;
  cm.display.sizer.style.marginLeft = width + "px";
}

function setDocumentHeight(cm, measure) {
  cm.display.sizer.style.minHeight = measure.docHeight + "px";
  cm.display.heightForcer.style.top = measure.docHeight + "px";
  cm.display.gutters.style.height = (measure.docHeight + cm.display.barHeight + scrollGap(cm)) + "px";
}

// Rebuild the gutter elements, ensure the margin to the left of the
// code matches their width.
function updateGutters(cm) {
  var gutters = cm.display.gutters, specs = cm.options.gutters;
  removeChildren(gutters);
  var i = 0;
  for (; i < specs.length; ++i) {
    var gutterClass = specs[i];
    var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));
    if (gutterClass == "CodeMirror-linenumbers") {
      cm.display.lineGutter = gElt;
      gElt.style.width = (cm.display.lineNumWidth || 1) + "px";
    }
  }
  gutters.style.display = i ? "" : "none";
  updateGutterSpace(cm);
}

// Make sure the gutters options contains the element
// "CodeMirror-linenumbers" when the lineNumbers option is true.
function setGuttersForLineNumbers(options) {
  var found = indexOf(options.gutters, "CodeMirror-linenumbers");
  if (found == -1 && options.lineNumbers) {
    options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]);
  } else if (found > -1 && !options.lineNumbers) {
    options.gutters = options.gutters.slice(0);
    options.gutters.splice(found, 1);
  }
}

// Since the delta values reported on mouse wheel events are
// unstandardized between browsers and even browser versions, and
// generally horribly unpredictable, this code starts by measuring
// the scroll effect that the first few mouse wheel events have,
// and, from that, detects the way it can convert deltas to pixel
// offsets afterwards.
//
// The reason we want to know the amount a wheel event will scroll
// is that it gives us a chance to update the display before the
// actual scrolling happens, reducing flickering.

var wheelSamples = 0;
var wheelPixelsPerUnit = null;
// Fill in a browser-detected starting value on browsers where we
// know one. These don't have to be accurate -- the result of them
// being wrong would just be a slight flicker on the first wheel
// scroll (if it is large enough).
if (ie) { wheelPixelsPerUnit = -.53; }
else if (gecko) { wheelPixelsPerUnit = 15; }
else if (chrome) { wheelPixelsPerUnit = -.7; }
else if (safari) { wheelPixelsPerUnit = -1/3; }

function wheelEventDelta(e) {
  var dx = e.wheelDeltaX, dy = e.wheelDeltaY;
  if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) { dx = e.detail; }
  if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) { dy = e.detail; }
  else if (dy == null) { dy = e.wheelDelta; }
  return {x: dx, y: dy}
}
function wheelEventPixels(e) {
  var delta = wheelEventDelta(e);
  delta.x *= wheelPixelsPerUnit;
  delta.y *= wheelPixelsPerUnit;
  return delta
}

function onScrollWheel(cm, e) {
  var delta = wheelEventDelta(e), dx = delta.x, dy = delta.y;

  var display = cm.display, scroll = display.scroller;
  // Quit if there's nothing to scroll here
  var canScrollX = scroll.scrollWidth > scroll.clientWidth;
  var canScrollY = scroll.scrollHeight > scroll.clientHeight;
  if (!(dx && canScrollX || dy && canScrollY)) { return }

  // Webkit browsers on OS X abort momentum scrolls when the target
  // of the scroll event is removed from the scrollable element.
  // This hack (see related code in patchDisplay) makes sure the
  // element is kept around.
  if (dy && mac && webkit) {
    outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
      for (var i = 0; i < view.length; i++) {
        if (view[i].node == cur) {
          cm.display.currentWheelTarget = cur;
          break outer
        }
      }
    }
  }

  // On some browsers, horizontal scrolling will cause redraws to
  // happen before the gutter has been realigned, causing it to
  // wriggle around in a most unseemly way. When we have an
  // estimated pixels/delta value, we just handle horizontal
  // scrolling entirely here. It'll be slightly off from native, but
  // better than glitching out.
  if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
    if (dy && canScrollY)
      { updateScrollTop(cm, Math.max(0, scroll.scrollTop + dy * wheelPixelsPerUnit)); }
    setScrollLeft(cm, Math.max(0, scroll.scrollLeft + dx * wheelPixelsPerUnit));
    // Only prevent default scrolling if vertical scrolling is
    // actually possible. Otherwise, it causes vertical scroll
    // jitter on OSX trackpads when deltaX is small and deltaY
    // is large (issue #3579)
    if (!dy || (dy && canScrollY))
      { e_preventDefault(e); }
    display.wheelStartX = null; // Abort measurement, if in progress
    return
  }

  // 'Project' the visible viewport to cover the area that is being
  // scrolled into view (if we know enough to estimate it).
  if (dy && wheelPixelsPerUnit != null) {
    var pixels = dy * wheelPixelsPerUnit;
    var top = cm.doc.scrollTop, bot = top + display.wrapper.clientHeight;
    if (pixels < 0) { top = Math.max(0, top + pixels - 50); }
    else { bot = Math.min(cm.doc.height, bot + pixels + 50); }
    updateDisplaySimple(cm, {top: top, bottom: bot});
  }

  if (wheelSamples < 20) {
    if (display.wheelStartX == null) {
      display.wheelStartX = scroll.scrollLeft; display.wheelStartY = scroll.scrollTop;
      display.wheelDX = dx; display.wheelDY = dy;
      setTimeout(function () {
        if (display.wheelStartX == null) { return }
        var movedX = scroll.scrollLeft - display.wheelStartX;
        var movedY = scroll.scrollTop - display.wheelStartY;
        var sample = (movedY && display.wheelDY && movedY / display.wheelDY) ||
          (movedX && display.wheelDX && movedX / display.wheelDX);
        display.wheelStartX = display.wheelStartY = null;
        if (!sample) { return }
        wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
        ++wheelSamples;
      }, 200);
    } else {
      display.wheelDX += dx; display.wheelDY += dy;
    }
  }
}

// Selection objects are immutable. A new one is created every time
// the selection changes. A selection is one or more non-overlapping
// (and non-touching) ranges, sorted, and an integer that indicates
// which one is the primary selection (the one that's scrolled into
// view, that getCursor returns, etc).
var Selection = function(ranges, primIndex) {
  this.ranges = ranges;
  this.primIndex = primIndex;
};

Selection.prototype.primary = function () { return this.ranges[this.primIndex] };

Selection.prototype.equals = function (other) {
    var this$1 = this;

  if (other == this) { return true }
  if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) { return false }
  for (var i = 0; i < this.ranges.length; i++) {
    var here = this$1.ranges[i], there = other.ranges[i];
    if (!equalCursorPos(here.anchor, there.anchor) || !equalCursorPos(here.head, there.head)) { return false }
  }
  return true
};

Selection.prototype.deepCopy = function () {
    var this$1 = this;

  var out = [];
  for (var i = 0; i < this.ranges.length; i++)
    { out[i] = new Range(copyPos(this$1.ranges[i].anchor), copyPos(this$1.ranges[i].head)); }
  return new Selection(out, this.primIndex)
};

Selection.prototype.somethingSelected = function () {
    var this$1 = this;

  for (var i = 0; i < this.ranges.length; i++)
    { if (!this$1.ranges[i].empty()) { return true } }
  return false
};

Selection.prototype.contains = function (pos, end) {
    var this$1 = this;

  if (!end) { end = pos; }
  for (var i = 0; i < this.ranges.length; i++) {
    var range = this$1.ranges[i];
    if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
      { return i }
  }
  return -1
};

var Range = function(anchor, head) {
  this.anchor = anchor; this.head = head;
};

Range.prototype.from = function () { return minPos(this.anchor, this.head) };
Range.prototype.to = function () { return maxPos(this.anchor, this.head) };
Range.prototype.empty = function () { return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch };

// Take an unsorted, potentially overlapping set of ranges, and
// build a selection out of it. 'Consumes' ranges array (modifying
// it).
function normalizeSelection(ranges, primIndex) {
  var prim = ranges[primIndex];
  ranges.sort(function (a, b) { return cmp(a.from(), b.from()); });
  primIndex = indexOf(ranges, prim);
  for (var i = 1; i < ranges.length; i++) {
    var cur = ranges[i], prev = ranges[i - 1];
    if (cmp(prev.to(), cur.from()) >= 0) {
      var from = minPos(prev.from(), cur.from()), to = maxPos(prev.to(), cur.to());
      var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
      if (i <= primIndex) { --primIndex; }
      ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
    }
  }
  return new Selection(ranges, primIndex)
}

function simpleSelection(anchor, head) {
  return new Selection([new Range(anchor, head || anchor)], 0)
}

// Compute the position of the end of a change (its 'to' property
// refers to the pre-change end).
function changeEnd(change) {
  if (!change.text) { return change.to }
  return Pos(change.from.line + change.text.length - 1,
             lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0))
}

// Adjust a position to refer to the post-change position of the
// same text, or the end of the change if the change covers it.
function adjustForChange(pos, change) {
  if (cmp(pos, change.from) < 0) { return pos }
  if (cmp(pos, change.to) <= 0) { return changeEnd(change) }

  var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1, ch = pos.ch;
  if (pos.line == change.to.line) { ch += changeEnd(change).ch - change.to.ch; }
  return Pos(line, ch)
}

function computeSelAfterChange(doc, change) {
  var out = [];
  for (var i = 0; i < doc.sel.ranges.length; i++) {
    var range = doc.sel.ranges[i];
    out.push(new Range(adjustForChange(range.anchor, change),
                       adjustForChange(range.head, change)));
  }
  return normalizeSelection(out, doc.sel.primIndex)
}

function offsetPos(pos, old, nw) {
  if (pos.line == old.line)
    { return Pos(nw.line, pos.ch - old.ch + nw.ch) }
  else
    { return Pos(nw.line + (pos.line - old.line), pos.ch) }
}

// Used by replaceSelections to allow moving the selection to the
// start or around the replaced test. Hint may be "start" or "around".
function computeReplacedSel(doc, changes, hint) {
  var out = [];
  var oldPrev = Pos(doc.first, 0), newPrev = oldPrev;
  for (var i = 0; i < changes.length; i++) {
    var change = changes[i];
    var from = offsetPos(change.from, oldPrev, newPrev);
    var to = offsetPos(changeEnd(change), oldPrev, newPrev);
    oldPrev = change.to;
    newPrev = to;
    if (hint == "around") {
      var range = doc.sel.ranges[i], inv = cmp(range.head, range.anchor) < 0;
      out[i] = new Range(inv ? to : from, inv ? from : to);
    } else {
      out[i] = new Range(from, from);
    }
  }
  return new Selection(out, doc.sel.primIndex)
}

// Used to get the editor into a consistent state again when options change.

function loadMode(cm) {
  cm.doc.mode = getMode(cm.options, cm.doc.modeOption);
  resetModeState(cm);
}

function resetModeState(cm) {
  cm.doc.iter(function (line) {
    if (line.stateAfter) { line.stateAfter = null; }
    if (line.styles) { line.styles = null; }
  });
  cm.doc.frontier = cm.doc.first;
  startWorker(cm, 100);
  cm.state.modeGen++;
  if (cm.curOp) { regChange(cm); }
}

// DOCUMENT DATA STRUCTURE

// By default, updates that start and end at the beginning of a line
// are treated specially, in order to make the association of line
// widgets and marker elements with the text behave more intuitive.
function isWholeLineUpdate(doc, change) {
  return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" &&
    (!doc.cm || doc.cm.options.wholeLineUpdateBefore)
}

// Perform a change on the document data structure.
function updateDoc(doc, change, markedSpans, estimateHeight$$1) {
  function spansFor(n) {return markedSpans ? markedSpans[n] : null}
  function update(line, text, spans) {
    updateLine(line, text, spans, estimateHeight$$1);
    signalLater(line, "change", line, change);
  }
  function linesFor(start, end) {
    var result = [];
    for (var i = start; i < end; ++i)
      { result.push(new Line(text[i], spansFor(i), estimateHeight$$1)); }
    return result
  }

  var from = change.from, to = change.to, text = change.text;
  var firstLine = getLine(doc, from.line), lastLine = getLine(doc, to.line);
  var lastText = lst(text), lastSpans = spansFor(text.length - 1), nlines = to.line - from.line;

  // Adjust the line structure
  if (change.full) {
    doc.insert(0, linesFor(0, text.length));
    doc.remove(text.length, doc.size - text.length);
  } else if (isWholeLineUpdate(doc, change)) {
    // This is a whole-line replace. Treated specially to make
    // sure line objects move the way they are supposed to.
    var added = linesFor(0, text.length - 1);
    update(lastLine, lastLine.text, lastSpans);
    if (nlines) { doc.remove(from.line, nlines); }
    if (added.length) { doc.insert(from.line, added); }
  } else if (firstLine == lastLine) {
    if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
    } else {
      var added$1 = linesFor(1, text.length - 1);
      added$1.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight$$1));
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      doc.insert(from.line + 1, added$1);
    }
  } else if (text.length == 1) {
    update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
    doc.remove(from.line + 1, nlines);
  } else {
    update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
    update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
    var added$2 = linesFor(1, text.length - 1);
    if (nlines > 1) { doc.remove(from.line + 1, nlines - 1); }
    doc.insert(from.line + 1, added$2);
  }

  signalLater(doc, "change", doc, change);
}

// Call f for all linked documents.
function linkedDocs(doc, f, sharedHistOnly) {
  function propagate(doc, skip, sharedHist) {
    if (doc.linked) { for (var i = 0; i < doc.linked.length; ++i) {
      var rel = doc.linked[i];
      if (rel.doc == skip) { continue }
      var shared = sharedHist && rel.sharedHist;
      if (sharedHistOnly && !shared) { continue }
      f(rel.doc, shared);
      propagate(rel.doc, doc, shared);
    } }
  }
  propagate(doc, null, true);
}

// Attach a document to an editor.
function attachDoc(cm, doc) {
  if (doc.cm) { throw new Error("This document is already in use.") }
  cm.doc = doc;
  doc.cm = cm;
  estimateLineHeights(cm);
  loadMode(cm);
  setDirectionClass(cm);
  if (!cm.options.lineWrapping) { findMaxLine(cm); }
  cm.options.mode = doc.modeOption;
  regChange(cm);
}

function setDirectionClass(cm) {
  (cm.doc.direction == "rtl" ? addClass : rmClass)(cm.display.lineDiv, "CodeMirror-rtl");
}

function directionChanged(cm) {
  runInOp(cm, function () {
    setDirectionClass(cm);
    regChange(cm);
  });
}

function History(startGen) {
  // Arrays of change events and selections. Doing something adds an
  // event to done and clears undo. Undoing moves events from done
  // to undone, redoing moves them in the other direction.
  this.done = []; this.undone = [];
  this.undoDepth = Infinity;
  // Used to track when changes can be merged into a single undo
  // event
  this.lastModTime = this.lastSelTime = 0;
  this.lastOp = this.lastSelOp = null;
  this.lastOrigin = this.lastSelOrigin = null;
  // Used by the isClean() method
  this.generation = this.maxGeneration = startGen || 1;
}

// Create a history change event from an updateDoc-style change
// object.
function historyChangeFromChange(doc, change) {
  var histChange = {from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to)};
  attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
  linkedDocs(doc, function (doc) { return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1); }, true);
  return histChange
}

// Pop all selection events off the end of a history array. Stop at
// a change event.
function clearSelectionEvents(array) {
  while (array.length) {
    var last = lst(array);
    if (last.ranges) { array.pop(); }
    else { break }
  }
}

// Find the top change event in the history. Pop off selection
// events that are in the way.
function lastChangeEvent(hist, force) {
  if (force) {
    clearSelectionEvents(hist.done);
    return lst(hist.done)
  } else if (hist.done.length && !lst(hist.done).ranges) {
    return lst(hist.done)
  } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
    hist.done.pop();
    return lst(hist.done)
  }
}

// Register a change in the history. Merges changes that are within
// a single operation, or are close together with an origin that
// allows merging (starting with "+") into a single event.
function addChangeToHistory(doc, change, selAfter, opId) {
  var hist = doc.history;
  hist.undone.length = 0;
  var time = +new Date, cur;
  var last;

  if ((hist.lastOp == opId ||
       hist.lastOrigin == change.origin && change.origin &&
       ((change.origin.charAt(0) == "+" && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay) ||
        change.origin.charAt(0) == "*")) &&
      (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
    // Merge this change into the last event
    last = lst(cur.changes);
    if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
      // Optimized case for simple insertion -- don't want to add
      // new changesets for every character typed
      last.to = changeEnd(change);
    } else {
      // Add new sub-event
      cur.changes.push(historyChangeFromChange(doc, change));
    }
  } else {
    // Can not be merged, start a new event.
    var before = lst(hist.done);
    if (!before || !before.ranges)
      { pushSelectionToHistory(doc.sel, hist.done); }
    cur = {changes: [historyChangeFromChange(doc, change)],
           generation: hist.generation};
    hist.done.push(cur);
    while (hist.done.length > hist.undoDepth) {
      hist.done.shift();
      if (!hist.done[0].ranges) { hist.done.shift(); }
    }
  }
  hist.done.push(selAfter);
  hist.generation = ++hist.maxGeneration;
  hist.lastModTime = hist.lastSelTime = time;
  hist.lastOp = hist.lastSelOp = opId;
  hist.lastOrigin = hist.lastSelOrigin = change.origin;

  if (!last) { signal(doc, "historyAdded"); }
}

function selectionEventCanBeMerged(doc, origin, prev, sel) {
  var ch = origin.charAt(0);
  return ch == "*" ||
    ch == "+" &&
    prev.ranges.length == sel.ranges.length &&
    prev.somethingSelected() == sel.somethingSelected() &&
    new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500)
}

// Called whenever the selection changes, sets the new selection as
// the pending selection in the history, and pushes the old pending
// selection into the 'done' array when it was significantly
// different (in number of selected ranges, emptiness, or time).
function addSelectionToHistory(doc, sel, opId, options) {
  var hist = doc.history, origin = options && options.origin;

  // A new event is started when the previous origin does not match
  // the current, or the origins don't allow matching. Origins
  // starting with * are always merged, those starting with + are
  // merged when similar and close together in time.
  if (opId == hist.lastSelOp ||
      (origin && hist.lastSelOrigin == origin &&
       (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin ||
        selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))))
    { hist.done[hist.done.length - 1] = sel; }
  else
    { pushSelectionToHistory(sel, hist.done); }

  hist.lastSelTime = +new Date;
  hist.lastSelOrigin = origin;
  hist.lastSelOp = opId;
  if (options && options.clearRedo !== false)
    { clearSelectionEvents(hist.undone); }
}

function pushSelectionToHistory(sel, dest) {
  var top = lst(dest);
  if (!(top && top.ranges && top.equals(sel)))
    { dest.push(sel); }
}

// Used to store marked span information in the history.
function attachLocalSpans(doc, change, from, to) {
  var existing = change["spans_" + doc.id], n = 0;
  doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function (line) {
    if (line.markedSpans)
      { (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans; }
    ++n;
  });
}

// When un/re-doing restores text containing marked spans, those
// that have been explicitly cleared should not be restored.
function removeClearedSpans(spans) {
  if (!spans) { return null }
  var out;
  for (var i = 0; i < spans.length; ++i) {
    if (spans[i].marker.explicitlyCleared) { if (!out) { out = spans.slice(0, i); } }
    else if (out) { out.push(spans[i]); }
  }
  return !out ? spans : out.length ? out : null
}

// Retrieve and filter the old marked spans stored in a change event.
function getOldSpans(doc, change) {
  var found = change["spans_" + doc.id];
  if (!found) { return null }
  var nw = [];
  for (var i = 0; i < change.text.length; ++i)
    { nw.push(removeClearedSpans(found[i])); }
  return nw
}

// Used for un/re-doing changes from the history. Combines the
// result of computing the existing spans with the set of spans that
// existed in the history (so that deleting around a span and then
// undoing brings back the span).
function mergeOldSpans(doc, change) {
  var old = getOldSpans(doc, change);
  var stretched = stretchSpansOverChange(doc, change);
  if (!old) { return stretched }
  if (!stretched) { return old }

  for (var i = 0; i < old.length; ++i) {
    var oldCur = old[i], stretchCur = stretched[i];
    if (oldCur && stretchCur) {
      spans: for (var j = 0; j < stretchCur.length; ++j) {
        var span = stretchCur[j];
        for (var k = 0; k < oldCur.length; ++k)
          { if (oldCur[k].marker == span.marker) { continue spans } }
        oldCur.push(span);
      }
    } else if (stretchCur) {
      old[i] = stretchCur;
    }
  }
  return old
}

// Used both to provide a JSON-safe object in .getHistory, and, when
// detaching a document, to split the history in two
function copyHistoryArray(events, newGroup, instantiateSel) {
  var copy = [];
  for (var i = 0; i < events.length; ++i) {
    var event = events[i];
    if (event.ranges) {
      copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
      continue
    }
    var changes = event.changes, newChanges = [];
    copy.push({changes: newChanges});
    for (var j = 0; j < changes.length; ++j) {
      var change = changes[j], m = (void 0);
      newChanges.push({from: change.from, to: change.to, text: change.text});
      if (newGroup) { for (var prop in change) { if (m = prop.match(/^spans_(\d+)$/)) {
        if (indexOf(newGroup, Number(m[1])) > -1) {
          lst(newChanges)[prop] = change[prop];
          delete change[prop];
        }
      } } }
    }
  }
  return copy
}

// The 'scroll' parameter given to many of these indicated whether
// the new cursor position should be scrolled into view after
// modifying the selection.

// If shift is held or the extend flag is set, extends a range to
// include a given position (and optionally a second position).
// Otherwise, simply returns the range between the given positions.
// Used for cursor motion and such.
function extendRange(doc, range, head, other) {
  if (doc.cm && doc.cm.display.shift || doc.extend) {
    var anchor = range.anchor;
    if (other) {
      var posBefore = cmp(head, anchor) < 0;
      if (posBefore != (cmp(other, anchor) < 0)) {
        anchor = head;
        head = other;
      } else if (posBefore != (cmp(head, other) < 0)) {
        head = other;
      }
    }
    return new Range(anchor, head)
  } else {
    return new Range(other || head, head)
  }
}

// Extend the primary selection range, discard the rest.
function extendSelection(doc, head, other, options) {
  setSelection(doc, new Selection([extendRange(doc, doc.sel.primary(), head, other)], 0), options);
}

// Extend all selections (pos is an array of selections with length
// equal the number of selections)
function extendSelections(doc, heads, options) {
  var out = [];
  for (var i = 0; i < doc.sel.ranges.length; i++)
    { out[i] = extendRange(doc, doc.sel.ranges[i], heads[i], null); }
  var newSel = normalizeSelection(out, doc.sel.primIndex);
  setSelection(doc, newSel, options);
}

// Updates a single range in the selection.
function replaceOneSelection(doc, i, range, options) {
  var ranges = doc.sel.ranges.slice(0);
  ranges[i] = range;
  setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options);
}

// Reset the selection to a single range.
function setSimpleSelection(doc, anchor, head, options) {
  setSelection(doc, simpleSelection(anchor, head), options);
}

// Give beforeSelectionChange handlers a change to influence a
// selection update.
function filterSelectionChange(doc, sel, options) {
  var obj = {
    ranges: sel.ranges,
    update: function(ranges) {
      var this$1 = this;

      this.ranges = [];
      for (var i = 0; i < ranges.length; i++)
        { this$1.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),
                                   clipPos(doc, ranges[i].head)); }
    },
    origin: options && options.origin
  };
  signal(doc, "beforeSelectionChange", doc, obj);
  if (doc.cm) { signal(doc.cm, "beforeSelectionChange", doc.cm, obj); }
  if (obj.ranges != sel.ranges) { return normalizeSelection(obj.ranges, obj.ranges.length - 1) }
  else { return sel }
}

function setSelectionReplaceHistory(doc, sel, options) {
  var done = doc.history.done, last = lst(done);
  if (last && last.ranges) {
    done[done.length - 1] = sel;
    setSelectionNoUndo(doc, sel, options);
  } else {
    setSelection(doc, sel, options);
  }
}

// Set a new selection.
function setSelection(doc, sel, options) {
  setSelectionNoUndo(doc, sel, options);
  addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
}

function setSelectionNoUndo(doc, sel, options) {
  if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
    { sel = filterSelectionChange(doc, sel, options); }

  var bias = options && options.bias ||
    (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
  setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

  if (!(options && options.scroll === false) && doc.cm)
    { ensureCursorVisible(doc.cm); }
}

function setSelectionInner(doc, sel) {
  if (sel.equals(doc.sel)) { return }

  doc.sel = sel;

  if (doc.cm) {
    doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = true;
    signalCursorActivity(doc.cm);
  }
  signalLater(doc, "cursorActivity", doc);
}

// Verify that the selection does not partially select any atomic
// marked ranges.
function reCheckSelection(doc) {
  setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false));
}

// Return a selection that does not partially select any atomic
// ranges.
function skipAtomicInSelection(doc, sel, bias, mayClear) {
  var out;
  for (var i = 0; i < sel.ranges.length; i++) {
    var range = sel.ranges[i];
    var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
    var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear);
    var newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear);
    if (out || newAnchor != range.anchor || newHead != range.head) {
      if (!out) { out = sel.ranges.slice(0, i); }
      out[i] = new Range(newAnchor, newHead);
    }
  }
  return out ? normalizeSelection(out, sel.primIndex) : sel
}

function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
  var line = getLine(doc, pos.line);
  if (line.markedSpans) { for (var i = 0; i < line.markedSpans.length; ++i) {
    var sp = line.markedSpans[i], m = sp.marker;
    if ((sp.from == null || (m.inclusiveLeft ? sp.from <= pos.ch : sp.from < pos.ch)) &&
        (sp.to == null || (m.inclusiveRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
      if (mayClear) {
        signal(m, "beforeCursorEnter");
        if (m.explicitlyCleared) {
          if (!line.markedSpans) { break }
          else {--i; continue}
        }
      }
      if (!m.atomic) { continue }

      if (oldPos) {
        var near = m.find(dir < 0 ? 1 : -1), diff = (void 0);
        if (dir < 0 ? m.inclusiveRight : m.inclusiveLeft)
          { near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null); }
        if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0))
          { return skipAtomicInner(doc, near, pos, dir, mayClear) }
      }

      var far = m.find(dir < 0 ? -1 : 1);
      if (dir < 0 ? m.inclusiveLeft : m.inclusiveRight)
        { far = movePos(doc, far, dir, far.line == pos.line ? line : null); }
      return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null
    }
  } }
  return pos
}

// Ensure a given position is not inside an atomic range.
function skipAtomic(doc, pos, oldPos, bias, mayClear) {
  var dir = bias || 1;
  var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) ||
      (!mayClear && skipAtomicInner(doc, pos, oldPos, dir, true)) ||
      skipAtomicInner(doc, pos, oldPos, -dir, mayClear) ||
      (!mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true));
  if (!found) {
    doc.cantEdit = true;
    return Pos(doc.first, 0)
  }
  return found
}

function movePos(doc, pos, dir, line) {
  if (dir < 0 && pos.ch == 0) {
    if (pos.line > doc.first) { return clipPos(doc, Pos(pos.line - 1)) }
    else { return null }
  } else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length) {
    if (pos.line < doc.first + doc.size - 1) { return Pos(pos.line + 1, 0) }
    else { return null }
  } else {
    return new Pos(pos.line, pos.ch + dir)
  }
}

function selectAll(cm) {
  cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);
}

// UPDATING

// Allow "beforeChange" event handlers to influence a change
function filterChange(doc, change, update) {
  var obj = {
    canceled: false,
    from: change.from,
    to: change.to,
    text: change.text,
    origin: change.origin,
    cancel: function () { return obj.canceled = true; }
  };
  if (update) { obj.update = function (from, to, text, origin) {
    if (from) { obj.from = clipPos(doc, from); }
    if (to) { obj.to = clipPos(doc, to); }
    if (text) { obj.text = text; }
    if (origin !== undefined) { obj.origin = origin; }
  }; }
  signal(doc, "beforeChange", doc, obj);
  if (doc.cm) { signal(doc.cm, "beforeChange", doc.cm, obj); }

  if (obj.canceled) { return null }
  return {from: obj.from, to: obj.to, text: obj.text, origin: obj.origin}
}

// Apply a change to a document, and add it to the document's
// history, and propagating it to all linked documents.
function makeChange(doc, change, ignoreReadOnly) {
  if (doc.cm) {
    if (!doc.cm.curOp) { return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly) }
    if (doc.cm.state.suppressEdits) { return }
  }

  if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
    change = filterChange(doc, change, true);
    if (!change) { return }
  }

  // Possibly split or suppress the update based on the presence
  // of read-only spans in its range.
  var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
  if (split) {
    for (var i = split.length - 1; i >= 0; --i)
      { makeChangeInner(doc, {from: split[i].from, to: split[i].to, text: i ? [""] : change.text}); }
  } else {
    makeChangeInner(doc, change);
  }
}

function makeChangeInner(doc, change) {
  if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) { return }
  var selAfter = computeSelAfterChange(doc, change);
  addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);

  makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
  var rebased = [];

  linkedDocs(doc, function (doc, sharedHist) {
    if (!sharedHist && indexOf(rebased, doc.history) == -1) {
      rebaseHist(doc.history, change);
      rebased.push(doc.history);
    }
    makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
  });
}

// Revert a change stored in a document's history.
function makeChangeFromHistory(doc, type, allowSelectionOnly) {
  if (doc.cm && doc.cm.state.suppressEdits && !allowSelectionOnly) { return }

  var hist = doc.history, event, selAfter = doc.sel;
  var source = type == "undo" ? hist.done : hist.undone, dest = type == "undo" ? hist.undone : hist.done;

  // Verify that there is a useable event (so that ctrl-z won't
  // needlessly clear selection events)
  var i = 0;
  for (; i < source.length; i++) {
    event = source[i];
    if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
      { break }
  }
  if (i == source.length) { return }
  hist.lastOrigin = hist.lastSelOrigin = null;

  for (;;) {
    event = source.pop();
    if (event.ranges) {
      pushSelectionToHistory(event, dest);
      if (allowSelectionOnly && !event.equals(doc.sel)) {
        setSelection(doc, event, {clearRedo: false});
        return
      }
      selAfter = event;
    }
    else { break }
  }

  // Build up a reverse change object to add to the opposite history
  // stack (redo when undoing, and vice versa).
  var antiChanges = [];
  pushSelectionToHistory(selAfter, dest);
  dest.push({changes: antiChanges, generation: hist.generation});
  hist.generation = event.generation || ++hist.maxGeneration;

  var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

  var loop = function ( i ) {
    var change = event.changes[i];
    change.origin = type;
    if (filter && !filterChange(doc, change, false)) {
      source.length = 0;
      return {}
    }

    antiChanges.push(historyChangeFromChange(doc, change));

    var after = i ? computeSelAfterChange(doc, change) : lst(source);
    makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
    if (!i && doc.cm) { doc.cm.scrollIntoView({from: change.from, to: changeEnd(change)}); }
    var rebased = [];

    // Propagate to the linked documents
    linkedDocs(doc, function (doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }
      makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
    });
  };

  for (var i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
    var returned = loop( i$1 );

    if ( returned ) return returned.v;
  }
}

// Sub-views need their line numbers shifted when text is added
// above or below them in the parent document.
function shiftDoc(doc, distance) {
  if (distance == 0) { return }
  doc.first += distance;
  doc.sel = new Selection(map(doc.sel.ranges, function (range) { return new Range(
    Pos(range.anchor.line + distance, range.anchor.ch),
    Pos(range.head.line + distance, range.head.ch)
  ); }), doc.sel.primIndex);
  if (doc.cm) {
    regChange(doc.cm, doc.first, doc.first - distance, distance);
    for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
      { regLineChange(doc.cm, l, "gutter"); }
  }
}

// More lower-level change function, handling only a single document
// (not linked ones).
function makeChangeSingleDoc(doc, change, selAfter, spans) {
  if (doc.cm && !doc.cm.curOp)
    { return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans) }

  if (change.to.line < doc.first) {
    shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
    return
  }
  if (change.from.line > doc.lastLine()) { return }

  // Clip the change to the size of this doc
  if (change.from.line < doc.first) {
    var shift = change.text.length - 1 - (doc.first - change.from.line);
    shiftDoc(doc, shift);
    change = {from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
              text: [lst(change.text)], origin: change.origin};
  }
  var last = doc.lastLine();
  if (change.to.line > last) {
    change = {from: change.from, to: Pos(last, getLine(doc, last).text.length),
              text: [change.text[0]], origin: change.origin};
  }

  change.removed = getBetween(doc, change.from, change.to);

  if (!selAfter) { selAfter = computeSelAfterChange(doc, change); }
  if (doc.cm) { makeChangeSingleDocInEditor(doc.cm, change, spans); }
  else { updateDoc(doc, change, spans); }
  setSelectionNoUndo(doc, selAfter, sel_dontScroll);
}

// Handle the interaction of a change to a document with the editor
// that this document is part of.
function makeChangeSingleDocInEditor(cm, change, spans) {
  var doc = cm.doc, display = cm.display, from = change.from, to = change.to;

  var recomputeMaxLength = false, checkWidthStart = from.line;
  if (!cm.options.lineWrapping) {
    checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
    doc.iter(checkWidthStart, to.line + 1, function (line) {
      if (line == display.maxLine) {
        recomputeMaxLength = true;
        return true
      }
    });
  }

  if (doc.sel.contains(change.from, change.to) > -1)
    { signalCursorActivity(cm); }

  updateDoc(doc, change, spans, estimateHeight(cm));

  if (!cm.options.lineWrapping) {
    doc.iter(checkWidthStart, from.line + change.text.length, function (line) {
      var len = lineLength(line);
      if (len > display.maxLineLength) {
        display.maxLine = line;
        display.maxLineLength = len;
        display.maxLineChanged = true;
        recomputeMaxLength = false;
      }
    });
    if (recomputeMaxLength) { cm.curOp.updateMaxLine = true; }
  }

  // Adjust frontier, schedule worker
  doc.frontier = Math.min(doc.frontier, from.line);
  startWorker(cm, 400);

  var lendiff = change.text.length - (to.line - from.line) - 1;
  // Remember that these lines changed, for updating the display
  if (change.full)
    { regChange(cm); }
  else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
    { regLineChange(cm, from.line, "text"); }
  else
    { regChange(cm, from.line, to.line + 1, lendiff); }

  var changesHandler = hasHandler(cm, "changes"), changeHandler = hasHandler(cm, "change");
  if (changeHandler || changesHandler) {
    var obj = {
      from: from, to: to,
      text: change.text,
      removed: change.removed,
      origin: change.origin
    };
    if (changeHandler) { signalLater(cm, "change", cm, obj); }
    if (changesHandler) { (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj); }
  }
  cm.display.selForContextMenu = null;
}

function replaceRange(doc, code, from, to, origin) {
  if (!to) { to = from; }
  if (cmp(to, from) < 0) { var tmp = to; to = from; from = tmp; }
  if (typeof code == "string") { code = doc.splitLines(code); }
  makeChange(doc, {from: from, to: to, text: code, origin: origin});
}

// Rebasing/resetting history to deal with externally-sourced changes

function rebaseHistSelSingle(pos, from, to, diff) {
  if (to < pos.line) {
    pos.line += diff;
  } else if (from < pos.line) {
    pos.line = from;
    pos.ch = 0;
  }
}

// Tries to rebase an array of history events given a change in the
// document. If the change touches the same lines as the event, the
// event, and everything 'behind' it, is discarded. If the change is
// before the event, the event's positions are updated. Uses a
// copy-on-write scheme for the positions, to avoid having to
// reallocate them all on every rebase, but also avoid problems with
// shared position objects being unsafely updated.
function rebaseHistArray(array, from, to, diff) {
  for (var i = 0; i < array.length; ++i) {
    var sub = array[i], ok = true;
    if (sub.ranges) {
      if (!sub.copied) { sub = array[i] = sub.deepCopy(); sub.copied = true; }
      for (var j = 0; j < sub.ranges.length; j++) {
        rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
        rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
      }
      continue
    }
    for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
      var cur = sub.changes[j$1];
      if (to < cur.from.line) {
        cur.from = Pos(cur.from.line + diff, cur.from.ch);
        cur.to = Pos(cur.to.line + diff, cur.to.ch);
      } else if (from <= cur.to.line) {
        ok = false;
        break
      }
    }
    if (!ok) {
      array.splice(0, i + 1);
      i = 0;
    }
  }
}

function rebaseHist(hist, change) {
  var from = change.from.line, to = change.to.line, diff = change.text.length - (to - from) - 1;
  rebaseHistArray(hist.done, from, to, diff);
  rebaseHistArray(hist.undone, from, to, diff);
}

// Utility for applying a change to a line by handle or number,
// returning the number and optionally registering the line as
// changed.
function changeLine(doc, handle, changeType, op) {
  var no = handle, line = handle;
  if (typeof handle == "number") { line = getLine(doc, clipLine(doc, handle)); }
  else { no = lineNo(handle); }
  if (no == null) { return null }
  if (op(line, no) && doc.cm) { regLineChange(doc.cm, no, changeType); }
  return line
}

// The document is represented as a BTree consisting of leaves, with
// chunk of lines in them, and branches, with up to ten leaves or
// other branch nodes below them. The top node is always a branch
// node, and is the document object itself (meaning it has
// additional methods and properties).
//
// All nodes have parent links. The tree is used both to go from
// line numbers to line objects, and to go from objects to numbers.
// It also indexes by height, and is used to convert between height
// and line object, and to find the total height of the document.
//
// See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html

var LeafChunk = function(lines) {
  var this$1 = this;

  this.lines = lines;
  this.parent = null;
  var height = 0;
  for (var i = 0; i < lines.length; ++i) {
    lines[i].parent = this$1;
    height += lines[i].height;
  }
  this.height = height;
};

LeafChunk.prototype.chunkSize = function () { return this.lines.length };

// Remove the n lines at offset 'at'.
LeafChunk.prototype.removeInner = function (at, n) {
    var this$1 = this;

  for (var i = at, e = at + n; i < e; ++i) {
    var line = this$1.lines[i];
    this$1.height -= line.height;
    cleanUpLine(line);
    signalLater(line, "delete");
  }
  this.lines.splice(at, n);
};

// Helper used to collapse a small branch into a single leaf.
LeafChunk.prototype.collapse = function (lines) {
  lines.push.apply(lines, this.lines);
};

// Insert the given array of lines at offset 'at', count them as
// having the given height.
LeafChunk.prototype.insertInner = function (at, lines, height) {
    var this$1 = this;

  this.height += height;
  this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
  for (var i = 0; i < lines.length; ++i) { lines[i].parent = this$1; }
};

// Used to iterate over a part of the tree.
LeafChunk.prototype.iterN = function (at, n, op) {
    var this$1 = this;

  for (var e = at + n; at < e; ++at)
    { if (op(this$1.lines[at])) { return true } }
};

var BranchChunk = function(children) {
  var this$1 = this;

  this.children = children;
  var size = 0, height = 0;
  for (var i = 0; i < children.length; ++i) {
    var ch = children[i];
    size += ch.chunkSize(); height += ch.height;
    ch.parent = this$1;
  }
  this.size = size;
  this.height = height;
  this.parent = null;
};

BranchChunk.prototype.chunkSize = function () { return this.size };

BranchChunk.prototype.removeInner = function (at, n) {
    var this$1 = this;

  this.size -= n;
  for (var i = 0; i < this.children.length; ++i) {
    var child = this$1.children[i], sz = child.chunkSize();
    if (at < sz) {
      var rm = Math.min(n, sz - at), oldHeight = child.height;
      child.removeInner(at, rm);
      this$1.height -= oldHeight - child.height;
      if (sz == rm) { this$1.children.splice(i--, 1); child.parent = null; }
      if ((n -= rm) == 0) { break }
      at = 0;
    } else { at -= sz; }
  }
  // If the result is smaller than 25 lines, ensure that it is a
  // single leaf node.
  if (this.size - n < 25 &&
      (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
    var lines = [];
    this.collapse(lines);
    this.children = [new LeafChunk(lines)];
    this.children[0].parent = this;
  }
};

BranchChunk.prototype.collapse = function (lines) {
    var this$1 = this;

  for (var i = 0; i < this.children.length; ++i) { this$1.children[i].collapse(lines); }
};

BranchChunk.prototype.insertInner = function (at, lines, height) {
    var this$1 = this;

  this.size += lines.length;
  this.height += height;
  for (var i = 0; i < this.children.length; ++i) {
    var child = this$1.children[i], sz = child.chunkSize();
    if (at <= sz) {
      child.insertInner(at, lines, height);
      if (child.lines && child.lines.length > 50) {
        // To avoid memory thrashing when child.lines is huge (e.g. first view of a large file), it's never spliced.
        // Instead, small slices are taken. They're taken in order because sequential memory accesses are fastest.
        var remaining = child.lines.length % 25 + 25;
        for (var pos = remaining; pos < child.lines.length;) {
          var leaf = new LeafChunk(child.lines.slice(pos, pos += 25));
          child.height -= leaf.height;
          this$1.children.splice(++i, 0, leaf);
          leaf.parent = this$1;
        }
        child.lines = child.lines.slice(0, remaining);
        this$1.maybeSpill();
      }
      break
    }
    at -= sz;
  }
};

// When a node has grown, check whether it should be split.
BranchChunk.prototype.maybeSpill = function () {
  if (this.children.length <= 10) { return }
  var me = this;
  do {
    var spilled = me.children.splice(me.children.length - 5, 5);
    var sibling = new BranchChunk(spilled);
    if (!me.parent) { // Become the parent node
      var copy = new BranchChunk(me.children);
      copy.parent = me;
      me.children = [copy, sibling];
      me = copy;
   } else {
      me.size -= sibling.size;
      me.height -= sibling.height;
      var myIndex = indexOf(me.parent.children, me);
      me.parent.children.splice(myIndex + 1, 0, sibling);
    }
    sibling.parent = me.parent;
  } while (me.children.length > 10)
  me.parent.maybeSpill();
};

BranchChunk.prototype.iterN = function (at, n, op) {
    var this$1 = this;

  for (var i = 0; i < this.children.length; ++i) {
    var child = this$1.children[i], sz = child.chunkSize();
    if (at < sz) {
      var used = Math.min(n, sz - at);
      if (child.iterN(at, used, op)) { return true }
      if ((n -= used) == 0) { break }
      at = 0;
    } else { at -= sz; }
  }
};

// Line widgets are block elements displayed above or below a line.

var LineWidget = function(doc, node, options) {
  var this$1 = this;

  if (options) { for (var opt in options) { if (options.hasOwnProperty(opt))
    { this$1[opt] = options[opt]; } } }
  this.doc = doc;
  this.node = node;
};

LineWidget.prototype.clear = function () {
    var this$1 = this;

  var cm = this.doc.cm, ws = this.line.widgets, line = this.line, no = lineNo(line);
  if (no == null || !ws) { return }
  for (var i = 0; i < ws.length; ++i) { if (ws[i] == this$1) { ws.splice(i--, 1); } }
  if (!ws.length) { line.widgets = null; }
  var height = widgetHeight(this);
  updateLineHeight(line, Math.max(0, line.height - height));
  if (cm) {
    runInOp(cm, function () {
      adjustScrollWhenAboveVisible(cm, line, -height);
      regLineChange(cm, no, "widget");
    });
    signalLater(cm, "lineWidgetCleared", cm, this, no);
  }
};

LineWidget.prototype.changed = function () {
    var this$1 = this;

  var oldH = this.height, cm = this.doc.cm, line = this.line;
  this.height = null;
  var diff = widgetHeight(this) - oldH;
  if (!diff) { return }
  updateLineHeight(line, line.height + diff);
  if (cm) {
    runInOp(cm, function () {
      cm.curOp.forceUpdate = true;
      adjustScrollWhenAboveVisible(cm, line, diff);
      signalLater(cm, "lineWidgetChanged", cm, this$1, lineNo(line));
    });
  }
};
eventMixin(LineWidget);

function adjustScrollWhenAboveVisible(cm, line, diff) {
  if (heightAtLine(line) < ((cm.curOp && cm.curOp.scrollTop) || cm.doc.scrollTop))
    { addToScrollTop(cm, diff); }
}

function addLineWidget(doc, handle, node, options) {
  var widget = new LineWidget(doc, node, options);
  var cm = doc.cm;
  if (cm && widget.noHScroll) { cm.display.alignWidgets = true; }
  changeLine(doc, handle, "widget", function (line) {
    var widgets = line.widgets || (line.widgets = []);
    if (widget.insertAt == null) { widgets.push(widget); }
    else { widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget); }
    widget.line = line;
    if (cm && !lineIsHidden(doc, line)) {
      var aboveVisible = heightAtLine(line) < doc.scrollTop;
      updateLineHeight(line, line.height + widgetHeight(widget));
      if (aboveVisible) { addToScrollTop(cm, widget.height); }
      cm.curOp.forceUpdate = true;
    }
    return true
  });
  signalLater(cm, "lineWidgetAdded", cm, widget, typeof handle == "number" ? handle : lineNo(handle));
  return widget
}

// TEXTMARKERS

// Created with markText and setBookmark methods. A TextMarker is a
// handle that can be used to clear or find a marked position in the
// document. Line objects hold arrays (markedSpans) containing
// {from, to, marker} object pointing to such marker objects, and
// indicating that such a marker is present on that line. Multiple
// lines may point to the same marker when it spans across lines.
// The spans will have null for their from/to properties when the
// marker continues beyond the start/end of the line. Markers have
// links back to the lines they currently touch.

// Collapsed markers have unique ids, in order to be able to order
// them, which is needed for uniquely determining an outer marker
// when they overlap (they may nest, but not partially overlap).
var nextMarkerId = 0;

var TextMarker = function(doc, type) {
  this.lines = [];
  this.type = type;
  this.doc = doc;
  this.id = ++nextMarkerId;
};

// Clear the marker.
TextMarker.prototype.clear = function () {
    var this$1 = this;

  if (this.explicitlyCleared) { return }
  var cm = this.doc.cm, withOp = cm && !cm.curOp;
  if (withOp) { startOperation(cm); }
  if (hasHandler(this, "clear")) {
    var found = this.find();
    if (found) { signalLater(this, "clear", found.from, found.to); }
  }
  var min = null, max = null;
  for (var i = 0; i < this.lines.length; ++i) {
    var line = this$1.lines[i];
    var span = getMarkedSpanFor(line.markedSpans, this$1);
    if (cm && !this$1.collapsed) { regLineChange(cm, lineNo(line), "text"); }
    else if (cm) {
      if (span.to != null) { max = lineNo(line); }
      if (span.from != null) { min = lineNo(line); }
    }
    line.markedSpans = removeMarkedSpan(line.markedSpans, span);
    if (span.from == null && this$1.collapsed && !lineIsHidden(this$1.doc, line) && cm)
      { updateLineHeight(line, textHeight(cm.display)); }
  }
  if (cm && this.collapsed && !cm.options.lineWrapping) { for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
    var visual = visualLine(this$1.lines[i$1]), len = lineLength(visual);
    if (len > cm.display.maxLineLength) {
      cm.display.maxLine = visual;
      cm.display.maxLineLength = len;
      cm.display.maxLineChanged = true;
    }
  } }

  if (min != null && cm && this.collapsed) { regChange(cm, min, max + 1); }
  this.lines.length = 0;
  this.explicitlyCleared = true;
  if (this.atomic && this.doc.cantEdit) {
    this.doc.cantEdit = false;
    if (cm) { reCheckSelection(cm.doc); }
  }
  if (cm) { signalLater(cm, "markerCleared", cm, this, min, max); }
  if (withOp) { endOperation(cm); }
  if (this.parent) { this.parent.clear(); }
};

// Find the position of the marker in the document. Returns a {from,
// to} object by default. Side can be passed to get a specific side
// -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
// Pos objects returned contain a line object, rather than a line
// number (used to prevent looking up the same line twice).
TextMarker.prototype.find = function (side, lineObj) {
    var this$1 = this;

  if (side == null && this.type == "bookmark") { side = 1; }
  var from, to;
  for (var i = 0; i < this.lines.length; ++i) {
    var line = this$1.lines[i];
    var span = getMarkedSpanFor(line.markedSpans, this$1);
    if (span.from != null) {
      from = Pos(lineObj ? line : lineNo(line), span.from);
      if (side == -1) { return from }
    }
    if (span.to != null) {
      to = Pos(lineObj ? line : lineNo(line), span.to);
      if (side == 1) { return to }
    }
  }
  return from && {from: from, to: to}
};

// Signals that the marker's widget changed, and surrounding layout
// should be recomputed.
TextMarker.prototype.changed = function () {
    var this$1 = this;

  var pos = this.find(-1, true), widget = this, cm = this.doc.cm;
  if (!pos || !cm) { return }
  runInOp(cm, function () {
    var line = pos.line, lineN = lineNo(pos.line);
    var view = findViewForLine(cm, lineN);
    if (view) {
      clearLineMeasurementCacheFor(view);
      cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
    }
    cm.curOp.updateMaxLine = true;
    if (!lineIsHidden(widget.doc, line) && widget.height != null) {
      var oldHeight = widget.height;
      widget.height = null;
      var dHeight = widgetHeight(widget) - oldHeight;
      if (dHeight)
        { updateLineHeight(line, line.height + dHeight); }
    }
    signalLater(cm, "markerChanged", cm, this$1);
  });
};

TextMarker.prototype.attachLine = function (line) {
  if (!this.lines.length && this.doc.cm) {
    var op = this.doc.cm.curOp;
    if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
      { (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this); }
  }
  this.lines.push(line);
};

TextMarker.prototype.detachLine = function (line) {
  this.lines.splice(indexOf(this.lines, line), 1);
  if (!this.lines.length && this.doc.cm) {
    var op = this.doc.cm.curOp;(op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
  }
};
eventMixin(TextMarker);

// Create a marker, wire it up to the right lines, and
function markText(doc, from, to, options, type) {
  // Shared markers (across linked documents) are handled separately
  // (markTextShared will call out to this again, once per
  // document).
  if (options && options.shared) { return markTextShared(doc, from, to, options, type) }
  // Ensure we are in an operation.
  if (doc.cm && !doc.cm.curOp) { return operation(doc.cm, markText)(doc, from, to, options, type) }

  var marker = new TextMarker(doc, type), diff = cmp(from, to);
  if (options) { copyObj(options, marker, false); }
  // Don't connect empty markers unless clearWhenEmpty is false
  if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
    { return marker }
  if (marker.replacedWith) {
    // Showing up as a widget implies collapsed (widget replaces text)
    marker.collapsed = true;
    marker.widgetNode = eltP("span", [marker.replacedWith], "CodeMirror-widget");
    if (!options.handleMouseEvents) { marker.widgetNode.setAttribute("cm-ignore-events", "true"); }
    if (options.insertLeft) { marker.widgetNode.insertLeft = true; }
  }
  if (marker.collapsed) {
    if (conflictingCollapsedRange(doc, from.line, from, to, marker) ||
        from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
      { throw new Error("Inserting collapsed marker partially overlapping an existing one") }
    seeCollapsedSpans();
  }

  if (marker.addToHistory)
    { addChangeToHistory(doc, {from: from, to: to, origin: "markText"}, doc.sel, NaN); }

  var curLine = from.line, cm = doc.cm, updateMaxLine;
  doc.iter(curLine, to.line + 1, function (line) {
    if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
      { updateMaxLine = true; }
    if (marker.collapsed && curLine != from.line) { updateLineHeight(line, 0); }
    addMarkedSpan(line, new MarkedSpan(marker,
                                       curLine == from.line ? from.ch : null,
                                       curLine == to.line ? to.ch : null));
    ++curLine;
  });
  // lineIsHidden depends on the presence of the spans, so needs a second pass
  if (marker.collapsed) { doc.iter(from.line, to.line + 1, function (line) {
    if (lineIsHidden(doc, line)) { updateLineHeight(line, 0); }
  }); }

  if (marker.clearOnEnter) { on(marker, "beforeCursorEnter", function () { return marker.clear(); }); }

  if (marker.readOnly) {
    seeReadOnlySpans();
    if (doc.history.done.length || doc.history.undone.length)
      { doc.clearHistory(); }
  }
  if (marker.collapsed) {
    marker.id = ++nextMarkerId;
    marker.atomic = true;
  }
  if (cm) {
    // Sync editor state
    if (updateMaxLine) { cm.curOp.updateMaxLine = true; }
    if (marker.collapsed)
      { regChange(cm, from.line, to.line + 1); }
    else if (marker.className || marker.title || marker.startStyle || marker.endStyle || marker.css)
      { for (var i = from.line; i <= to.line; i++) { regLineChange(cm, i, "text"); } }
    if (marker.atomic) { reCheckSelection(cm.doc); }
    signalLater(cm, "markerAdded", cm, marker);
  }
  return marker
}

// SHARED TEXTMARKERS

// A shared marker spans multiple linked documents. It is
// implemented as a meta-marker-object controlling multiple normal
// markers.
var SharedTextMarker = function(markers, primary) {
  var this$1 = this;

  this.markers = markers;
  this.primary = primary;
  for (var i = 0; i < markers.length; ++i)
    { markers[i].parent = this$1; }
};

SharedTextMarker.prototype.clear = function () {
    var this$1 = this;

  if (this.explicitlyCleared) { return }
  this.explicitlyCleared = true;
  for (var i = 0; i < this.markers.length; ++i)
    { this$1.markers[i].clear(); }
  signalLater(this, "clear");
};

SharedTextMarker.prototype.find = function (side, lineObj) {
  return this.primary.find(side, lineObj)
};
eventMixin(SharedTextMarker);

function markTextShared(doc, from, to, options, type) {
  options = copyObj(options);
  options.shared = false;
  var markers = [markText(doc, from, to, options, type)], primary = markers[0];
  var widget = options.widgetNode;
  linkedDocs(doc, function (doc) {
    if (widget) { options.widgetNode = widget.cloneNode(true); }
    markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
    for (var i = 0; i < doc.linked.length; ++i)
      { if (doc.linked[i].isParent) { return } }
    primary = lst(markers);
  });
  return new SharedTextMarker(markers, primary)
}

function findSharedMarkers(doc) {
  return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function (m) { return m.parent; })
}

function copySharedMarkers(doc, markers) {
  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i], pos = marker.find();
    var mFrom = doc.clipPos(pos.from), mTo = doc.clipPos(pos.to);
    if (cmp(mFrom, mTo)) {
      var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
      marker.markers.push(subMark);
      subMark.parent = marker;
    }
  }
}

function detachSharedMarkers(markers) {
  var loop = function ( i ) {
    var marker = markers[i], linked = [marker.primary.doc];
    linkedDocs(marker.primary.doc, function (d) { return linked.push(d); });
    for (var j = 0; j < marker.markers.length; j++) {
      var subMarker = marker.markers[j];
      if (indexOf(linked, subMarker.doc) == -1) {
        subMarker.parent = null;
        marker.markers.splice(j--, 1);
      }
    }
  };

  for (var i = 0; i < markers.length; i++) loop( i );
}

var nextDocId = 0;
var Doc = function(text, mode, firstLine, lineSep, direction) {
  if (!(this instanceof Doc)) { return new Doc(text, mode, firstLine, lineSep, direction) }
  if (firstLine == null) { firstLine = 0; }

  BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
  this.first = firstLine;
  this.scrollTop = this.scrollLeft = 0;
  this.cantEdit = false;
  this.cleanGeneration = 1;
  this.frontier = firstLine;
  var start = Pos(firstLine, 0);
  this.sel = simpleSelection(start);
  this.history = new History(null);
  this.id = ++nextDocId;
  this.modeOption = mode;
  this.lineSep = lineSep;
  this.direction = (direction == "rtl") ? "rtl" : "ltr";
  this.extend = false;

  if (typeof text == "string") { text = this.splitLines(text); }
  updateDoc(this, {from: start, to: start, text: text});
  setSelection(this, simpleSelection(start), sel_dontScroll);
};

Doc.prototype = createObj(BranchChunk.prototype, {
  constructor: Doc,
  // Iterate over the document. Supports two forms -- with only one
  // argument, it calls that for each line in the document. With
  // three, it iterates over the range given by the first two (with
  // the second being non-inclusive).
  iter: function(from, to, op) {
    if (op) { this.iterN(from - this.first, to - from, op); }
    else { this.iterN(this.first, this.first + this.size, from); }
  },

  // Non-public interface for adding and removing lines.
  insert: function(at, lines) {
    var height = 0;
    for (var i = 0; i < lines.length; ++i) { height += lines[i].height; }
    this.insertInner(at - this.first, lines, height);
  },
  remove: function(at, n) { this.removeInner(at - this.first, n); },

  // From here, the methods are part of the public interface. Most
  // are also available from CodeMirror (editor) instances.

  getValue: function(lineSep) {
    var lines = getLines(this, this.first, this.first + this.size);
    if (lineSep === false) { return lines }
    return lines.join(lineSep || this.lineSeparator())
  },
  setValue: docMethodOp(function(code) {
    var top = Pos(this.first, 0), last = this.first + this.size - 1;
    makeChange(this, {from: top, to: Pos(last, getLine(this, last).text.length),
                      text: this.splitLines(code), origin: "setValue", full: true}, true);
    if (this.cm) { scrollToCoords(this.cm, 0, 0); }
    setSelection(this, simpleSelection(top), sel_dontScroll);
  }),
  replaceRange: function(code, from, to, origin) {
    from = clipPos(this, from);
    to = to ? clipPos(this, to) : from;
    replaceRange(this, code, from, to, origin);
  },
  getRange: function(from, to, lineSep) {
    var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
    if (lineSep === false) { return lines }
    return lines.join(lineSep || this.lineSeparator())
  },

  getLine: function(line) {var l = this.getLineHandle(line); return l && l.text},

  getLineHandle: function(line) {if (isLine(this, line)) { return getLine(this, line) }},
  getLineNumber: function(line) {return lineNo(line)},

  getLineHandleVisualStart: function(line) {
    if (typeof line == "number") { line = getLine(this, line); }
    return visualLine(line)
  },

  lineCount: function() {return this.size},
  firstLine: function() {return this.first},
  lastLine: function() {return this.first + this.size - 1},

  clipPos: function(pos) {return clipPos(this, pos)},

  getCursor: function(start) {
    var range$$1 = this.sel.primary(), pos;
    if (start == null || start == "head") { pos = range$$1.head; }
    else if (start == "anchor") { pos = range$$1.anchor; }
    else if (start == "end" || start == "to" || start === false) { pos = range$$1.to(); }
    else { pos = range$$1.from(); }
    return pos
  },
  listSelections: function() { return this.sel.ranges },
  somethingSelected: function() {return this.sel.somethingSelected()},

  setCursor: docMethodOp(function(line, ch, options) {
    setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
  }),
  setSelection: docMethodOp(function(anchor, head, options) {
    setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options);
  }),
  extendSelection: docMethodOp(function(head, other, options) {
    extendSelection(this, clipPos(this, head), other && clipPos(this, other), options);
  }),
  extendSelections: docMethodOp(function(heads, options) {
    extendSelections(this, clipPosArray(this, heads), options);
  }),
  extendSelectionsBy: docMethodOp(function(f, options) {
    var heads = map(this.sel.ranges, f);
    extendSelections(this, clipPosArray(this, heads), options);
  }),
  setSelections: docMethodOp(function(ranges, primary, options) {
    var this$1 = this;

    if (!ranges.length) { return }
    var out = [];
    for (var i = 0; i < ranges.length; i++)
      { out[i] = new Range(clipPos(this$1, ranges[i].anchor),
                         clipPos(this$1, ranges[i].head)); }
    if (primary == null) { primary = Math.min(ranges.length - 1, this.sel.primIndex); }
    setSelection(this, normalizeSelection(out, primary), options);
  }),
  addSelection: docMethodOp(function(anchor, head, options) {
    var ranges = this.sel.ranges.slice(0);
    ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
    setSelection(this, normalizeSelection(ranges, ranges.length - 1), options);
  }),

  getSelection: function(lineSep) {
    var this$1 = this;

    var ranges = this.sel.ranges, lines;
    for (var i = 0; i < ranges.length; i++) {
      var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
      lines = lines ? lines.concat(sel) : sel;
    }
    if (lineSep === false) { return lines }
    else { return lines.join(lineSep || this.lineSeparator()) }
  },
  getSelections: function(lineSep) {
    var this$1 = this;

    var parts = [], ranges = this.sel.ranges;
    for (var i = 0; i < ranges.length; i++) {
      var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
      if (lineSep !== false) { sel = sel.join(lineSep || this$1.lineSeparator()); }
      parts[i] = sel;
    }
    return parts
  },
  replaceSelection: function(code, collapse, origin) {
    var dup = [];
    for (var i = 0; i < this.sel.ranges.length; i++)
      { dup[i] = code; }
    this.replaceSelections(dup, collapse, origin || "+input");
  },
  replaceSelections: docMethodOp(function(code, collapse, origin) {
    var this$1 = this;

    var changes = [], sel = this.sel;
    for (var i = 0; i < sel.ranges.length; i++) {
      var range$$1 = sel.ranges[i];
      changes[i] = {from: range$$1.from(), to: range$$1.to(), text: this$1.splitLines(code[i]), origin: origin};
    }
    var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
    for (var i$1 = changes.length - 1; i$1 >= 0; i$1--)
      { makeChange(this$1, changes[i$1]); }
    if (newSel) { setSelectionReplaceHistory(this, newSel); }
    else if (this.cm) { ensureCursorVisible(this.cm); }
  }),
  undo: docMethodOp(function() {makeChangeFromHistory(this, "undo");}),
  redo: docMethodOp(function() {makeChangeFromHistory(this, "redo");}),
  undoSelection: docMethodOp(function() {makeChangeFromHistory(this, "undo", true);}),
  redoSelection: docMethodOp(function() {makeChangeFromHistory(this, "redo", true);}),

  setExtending: function(val) {this.extend = val;},
  getExtending: function() {return this.extend},

  historySize: function() {
    var hist = this.history, done = 0, undone = 0;
    for (var i = 0; i < hist.done.length; i++) { if (!hist.done[i].ranges) { ++done; } }
    for (var i$1 = 0; i$1 < hist.undone.length; i$1++) { if (!hist.undone[i$1].ranges) { ++undone; } }
    return {undo: done, redo: undone}
  },
  clearHistory: function() {this.history = new History(this.history.maxGeneration);},

  markClean: function() {
    this.cleanGeneration = this.changeGeneration(true);
  },
  changeGeneration: function(forceSplit) {
    if (forceSplit)
      { this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null; }
    return this.history.generation
  },
  isClean: function (gen) {
    return this.history.generation == (gen || this.cleanGeneration)
  },

  getHistory: function() {
    return {done: copyHistoryArray(this.history.done),
            undone: copyHistoryArray(this.history.undone)}
  },
  setHistory: function(histData) {
    var hist = this.history = new History(this.history.maxGeneration);
    hist.done = copyHistoryArray(histData.done.slice(0), null, true);
    hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
  },

  setGutterMarker: docMethodOp(function(line, gutterID, value) {
    return changeLine(this, line, "gutter", function (line) {
      var markers = line.gutterMarkers || (line.gutterMarkers = {});
      markers[gutterID] = value;
      if (!value && isEmpty(markers)) { line.gutterMarkers = null; }
      return true
    })
  }),

  clearGutter: docMethodOp(function(gutterID) {
    var this$1 = this;

    this.iter(function (line) {
      if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
        changeLine(this$1, line, "gutter", function () {
          line.gutterMarkers[gutterID] = null;
          if (isEmpty(line.gutterMarkers)) { line.gutterMarkers = null; }
          return true
        });
      }
    });
  }),

  lineInfo: function(line) {
    var n;
    if (typeof line == "number") {
      if (!isLine(this, line)) { return null }
      n = line;
      line = getLine(this, line);
      if (!line) { return null }
    } else {
      n = lineNo(line);
      if (n == null) { return null }
    }
    return {line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
            textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
            widgets: line.widgets}
  },

  addLineClass: docMethodOp(function(handle, where, cls) {
    return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
      var prop = where == "text" ? "textClass"
               : where == "background" ? "bgClass"
               : where == "gutter" ? "gutterClass" : "wrapClass";
      if (!line[prop]) { line[prop] = cls; }
      else if (classTest(cls).test(line[prop])) { return false }
      else { line[prop] += " " + cls; }
      return true
    })
  }),
  removeLineClass: docMethodOp(function(handle, where, cls) {
    return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
      var prop = where == "text" ? "textClass"
               : where == "background" ? "bgClass"
               : where == "gutter" ? "gutterClass" : "wrapClass";
      var cur = line[prop];
      if (!cur) { return false }
      else if (cls == null) { line[prop] = null; }
      else {
        var found = cur.match(classTest(cls));
        if (!found) { return false }
        var end = found.index + found[0].length;
        line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
      }
      return true
    })
  }),

  addLineWidget: docMethodOp(function(handle, node, options) {
    return addLineWidget(this, handle, node, options)
  }),
  removeLineWidget: function(widget) { widget.clear(); },

  markText: function(from, to, options) {
    return markText(this, clipPos(this, from), clipPos(this, to), options, options && options.type || "range")
  },
  setBookmark: function(pos, options) {
    var realOpts = {replacedWith: options && (options.nodeType == null ? options.widget : options),
                    insertLeft: options && options.insertLeft,
                    clearWhenEmpty: false, shared: options && options.shared,
                    handleMouseEvents: options && options.handleMouseEvents};
    pos = clipPos(this, pos);
    return markText(this, pos, pos, realOpts, "bookmark")
  },
  findMarksAt: function(pos) {
    pos = clipPos(this, pos);
    var markers = [], spans = getLine(this, pos.line).markedSpans;
    if (spans) { for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if ((span.from == null || span.from <= pos.ch) &&
          (span.to == null || span.to >= pos.ch))
        { markers.push(span.marker.parent || span.marker); }
    } }
    return markers
  },
  findMarks: function(from, to, filter) {
    from = clipPos(this, from); to = clipPos(this, to);
    var found = [], lineNo$$1 = from.line;
    this.iter(from.line, to.line + 1, function (line) {
      var spans = line.markedSpans;
      if (spans) { for (var i = 0; i < spans.length; i++) {
        var span = spans[i];
        if (!(span.to != null && lineNo$$1 == from.line && from.ch >= span.to ||
              span.from == null && lineNo$$1 != from.line ||
              span.from != null && lineNo$$1 == to.line && span.from >= to.ch) &&
            (!filter || filter(span.marker)))
          { found.push(span.marker.parent || span.marker); }
      } }
      ++lineNo$$1;
    });
    return found
  },
  getAllMarks: function() {
    var markers = [];
    this.iter(function (line) {
      var sps = line.markedSpans;
      if (sps) { for (var i = 0; i < sps.length; ++i)
        { if (sps[i].from != null) { markers.push(sps[i].marker); } } }
    });
    return markers
  },

  posFromIndex: function(off) {
    var ch, lineNo$$1 = this.first, sepSize = this.lineSeparator().length;
    this.iter(function (line) {
      var sz = line.text.length + sepSize;
      if (sz > off) { ch = off; return true }
      off -= sz;
      ++lineNo$$1;
    });
    return clipPos(this, Pos(lineNo$$1, ch))
  },
  indexFromPos: function (coords) {
    coords = clipPos(this, coords);
    var index = coords.ch;
    if (coords.line < this.first || coords.ch < 0) { return 0 }
    var sepSize = this.lineSeparator().length;
    this.iter(this.first, coords.line, function (line) { // iter aborts when callback returns a truthy value
      index += line.text.length + sepSize;
    });
    return index
  },

  copy: function(copyHistory) {
    var doc = new Doc(getLines(this, this.first, this.first + this.size),
                      this.modeOption, this.first, this.lineSep, this.direction);
    doc.scrollTop = this.scrollTop; doc.scrollLeft = this.scrollLeft;
    doc.sel = this.sel;
    doc.extend = false;
    if (copyHistory) {
      doc.history.undoDepth = this.history.undoDepth;
      doc.setHistory(this.getHistory());
    }
    return doc
  },

  linkedDoc: function(options) {
    if (!options) { options = {}; }
    var from = this.first, to = this.first + this.size;
    if (options.from != null && options.from > from) { from = options.from; }
    if (options.to != null && options.to < to) { to = options.to; }
    var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep, this.direction);
    if (options.sharedHist) { copy.history = this.history
    ; }(this.linked || (this.linked = [])).push({doc: copy, sharedHist: options.sharedHist});
    copy.linked = [{doc: this, isParent: true, sharedHist: options.sharedHist}];
    copySharedMarkers(copy, findSharedMarkers(this));
    return copy
  },
  unlinkDoc: function(other) {
    var this$1 = this;

    if (other instanceof CodeMirror$1) { other = other.doc; }
    if (this.linked) { for (var i = 0; i < this.linked.length; ++i) {
      var link = this$1.linked[i];
      if (link.doc != other) { continue }
      this$1.linked.splice(i, 1);
      other.unlinkDoc(this$1);
      detachSharedMarkers(findSharedMarkers(this$1));
      break
    } }
    // If the histories were shared, split them again
    if (other.history == this.history) {
      var splitIds = [other.id];
      linkedDocs(other, function (doc) { return splitIds.push(doc.id); }, true);
      other.history = new History(null);
      other.history.done = copyHistoryArray(this.history.done, splitIds);
      other.history.undone = copyHistoryArray(this.history.undone, splitIds);
    }
  },
  iterLinkedDocs: function(f) {linkedDocs(this, f);},

  getMode: function() {return this.mode},
  getEditor: function() {return this.cm},

  splitLines: function(str) {
    if (this.lineSep) { return str.split(this.lineSep) }
    return splitLinesAuto(str)
  },
  lineSeparator: function() { return this.lineSep || "\n" },

  setDirection: docMethodOp(function (dir) {
    if (dir != "rtl") { dir = "ltr"; }
    if (dir == this.direction) { return }
    this.direction = dir;
    this.iter(function (line) { return line.order = null; });
    if (this.cm) { directionChanged(this.cm); }
  })
});

// Public alias.
Doc.prototype.eachLine = Doc.prototype.iter;

// Kludge to work around strange IE behavior where it'll sometimes
// re-fire a series of drag-related events right after the drop (#1551)
var lastDrop = 0;

function onDrop(e) {
  var cm = this;
  clearDragCursor(cm);
  if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
    { return }
  e_preventDefault(e);
  if (ie) { lastDrop = +new Date; }
  var pos = posFromMouse(cm, e, true), files = e.dataTransfer.files;
  if (!pos || cm.isReadOnly()) { return }
  // Might be a file drop, in which case we simply extract the text
  // and insert it.
  if (files && files.length && window.FileReader && window.File) {
    var n = files.length, text = Array(n), read = 0;
    var loadFile = function (file, i) {
      if (cm.options.allowDropFileTypes &&
          indexOf(cm.options.allowDropFileTypes, file.type) == -1)
        { return }

      var reader = new FileReader;
      reader.onload = operation(cm, function () {
        var content = reader.result;
        if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) { content = ""; }
        text[i] = content;
        if (++read == n) {
          pos = clipPos(cm.doc, pos);
          var change = {from: pos, to: pos,
                        text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
                        origin: "paste"};
          makeChange(cm.doc, change);
          setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
        }
      });
      reader.readAsText(file);
    };
    for (var i = 0; i < n; ++i) { loadFile(files[i], i); }
  } else { // Normal drop
    // Don't do a replace if the drop happened inside of the selected text.
    if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
      cm.state.draggingText(e);
      // Ensure the editor is re-focused
      setTimeout(function () { return cm.display.input.focus(); }, 20);
      return
    }
    try {
      var text$1 = e.dataTransfer.getData("Text");
      if (text$1) {
        var selected;
        if (cm.state.draggingText && !cm.state.draggingText.copy)
          { selected = cm.listSelections(); }
        setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
        if (selected) { for (var i$1 = 0; i$1 < selected.length; ++i$1)
          { replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag"); } }
        cm.replaceSelection(text$1, "around", "paste");
        cm.display.input.focus();
      }
    }
    catch(e){}
  }
}

function onDragStart(cm, e) {
  if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) { e_stop(e); return }
  if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) { return }

  e.dataTransfer.setData("Text", cm.getSelection());
  e.dataTransfer.effectAllowed = "copyMove";

  // Use dummy image instead of default browsers image.
  // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
  if (e.dataTransfer.setDragImage && !safari) {
    var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
    img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    if (presto) {
      img.width = img.height = 1;
      cm.display.wrapper.appendChild(img);
      // Force a relayout, or Opera won't use our image for some obscure reason
      img._top = img.offsetTop;
    }
    e.dataTransfer.setDragImage(img, 0, 0);
    if (presto) { img.parentNode.removeChild(img); }
  }
}

function onDragOver(cm, e) {
  var pos = posFromMouse(cm, e);
  if (!pos) { return }
  var frag = document.createDocumentFragment();
  drawSelectionCursor(cm, pos, frag);
  if (!cm.display.dragCursor) {
    cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
    cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
  }
  removeChildrenAndAdd(cm.display.dragCursor, frag);
}

function clearDragCursor(cm) {
  if (cm.display.dragCursor) {
    cm.display.lineSpace.removeChild(cm.display.dragCursor);
    cm.display.dragCursor = null;
  }
}

// These must be handled carefully, because naively registering a
// handler for each editor will cause the editors to never be
// garbage collected.

function forEachCodeMirror(f) {
  if (!document.body.getElementsByClassName) { return }
  var byClass = document.body.getElementsByClassName("CodeMirror");
  for (var i = 0; i < byClass.length; i++) {
    var cm = byClass[i].CodeMirror;
    if (cm) { f(cm); }
  }
}

var globalsRegistered = false;
function ensureGlobalHandlers() {
  if (globalsRegistered) { return }
  registerGlobalHandlers();
  globalsRegistered = true;
}
function registerGlobalHandlers() {
  // When the window resizes, we need to refresh active editors.
  var resizeTimer;
  on(window, "resize", function () {
    if (resizeTimer == null) { resizeTimer = setTimeout(function () {
      resizeTimer = null;
      forEachCodeMirror(onResize);
    }, 100); }
  });
  // When the window loses focus, we want to show the editor as blurred
  on(window, "blur", function () { return forEachCodeMirror(onBlur); });
}
// Called when the window resizes
function onResize(cm) {
  var d = cm.display;
  if (d.lastWrapHeight == d.wrapper.clientHeight && d.lastWrapWidth == d.wrapper.clientWidth)
    { return }
  // Might be a text scaling operation, clear size caches.
  d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
  d.scrollbarsClipped = false;
  cm.setSize();
}

var keyNames = {
  3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
  19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
  36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
  46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod",
  106: "*", 107: "=", 109: "-", 110: ".", 111: "/", 127: "Delete",
  173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
  221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
  63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"
};

// Number keys
for (var i = 0; i < 10; i++) { keyNames[i + 48] = keyNames[i + 96] = String(i); }
// Alphabetic keys
for (var i$1 = 65; i$1 <= 90; i$1++) { keyNames[i$1] = String.fromCharCode(i$1); }
// Function keys
for (var i$2 = 1; i$2 <= 12; i$2++) { keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2; }

var keyMap = {};

keyMap.basic = {
  "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
  "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
  "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
  "Tab": "defaultTab", "Shift-Tab": "indentAuto",
  "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
  "Esc": "singleSelection"
};
// Note that the save and find-related commands aren't defined by
// default. User code or addons can define them. Unknown commands
// are simply ignored.
keyMap.pcDefault = {
  "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
  "Ctrl-Home": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Up": "goLineUp", "Ctrl-Down": "goLineDown",
  "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
  "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
  "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
  "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
  "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
  fallthrough: "basic"
};
// Very basic readline/emacs-style bindings, which are standard on Mac.
keyMap.emacsy = {
  "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
  "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
  "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
  "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars",
  "Ctrl-O": "openLine"
};
keyMap.macDefault = {
  "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
  "Cmd-Home": "goDocStart", "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
  "Alt-Right": "goGroupRight", "Cmd-Left": "goLineLeft", "Cmd-Right": "goLineRight", "Alt-Backspace": "delGroupBefore",
  "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
  "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
  "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delWrappedLineLeft", "Cmd-Delete": "delWrappedLineRight",
  "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection", "Ctrl-Up": "goDocStart", "Ctrl-Down": "goDocEnd",
  fallthrough: ["basic", "emacsy"]
};
keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

// KEYMAP DISPATCH

function normalizeKeyName(name) {
  var parts = name.split(/-(?!$)/);
  name = parts[parts.length - 1];
  var alt, ctrl, shift, cmd;
  for (var i = 0; i < parts.length - 1; i++) {
    var mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) { cmd = true; }
    else if (/^a(lt)?$/i.test(mod)) { alt = true; }
    else if (/^(c|ctrl|control)$/i.test(mod)) { ctrl = true; }
    else if (/^s(hift)?$/i.test(mod)) { shift = true; }
    else { throw new Error("Unrecognized modifier name: " + mod) }
  }
  if (alt) { name = "Alt-" + name; }
  if (ctrl) { name = "Ctrl-" + name; }
  if (cmd) { name = "Cmd-" + name; }
  if (shift) { name = "Shift-" + name; }
  return name
}

// This is a kludge to keep keymaps mostly working as raw objects
// (backwards compatibility) while at the same time support features
// like normalization and multi-stroke key bindings. It compiles a
// new normalized keymap, and then updates the old object to reflect
// this.
function normalizeKeyMap(keymap) {
  var copy = {};
  for (var keyname in keymap) { if (keymap.hasOwnProperty(keyname)) {
    var value = keymap[keyname];
    if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) { continue }
    if (value == "...") { delete keymap[keyname]; continue }

    var keys = map(keyname.split(" "), normalizeKeyName);
    for (var i = 0; i < keys.length; i++) {
      var val = (void 0), name = (void 0);
      if (i == keys.length - 1) {
        name = keys.join(" ");
        val = value;
      } else {
        name = keys.slice(0, i + 1).join(" ");
        val = "...";
      }
      var prev = copy[name];
      if (!prev) { copy[name] = val; }
      else if (prev != val) { throw new Error("Inconsistent bindings for " + name) }
    }
    delete keymap[keyname];
  } }
  for (var prop in copy) { keymap[prop] = copy[prop]; }
  return keymap
}

function lookupKey(key, map$$1, handle, context) {
  map$$1 = getKeyMap(map$$1);
  var found = map$$1.call ? map$$1.call(key, context) : map$$1[key];
  if (found === false) { return "nothing" }
  if (found === "...") { return "multi" }
  if (found != null && handle(found)) { return "handled" }

  if (map$$1.fallthrough) {
    if (Object.prototype.toString.call(map$$1.fallthrough) != "[object Array]")
      { return lookupKey(key, map$$1.fallthrough, handle, context) }
    for (var i = 0; i < map$$1.fallthrough.length; i++) {
      var result = lookupKey(key, map$$1.fallthrough[i], handle, context);
      if (result) { return result }
    }
  }
}

// Modifier key presses don't count as 'real' key presses for the
// purpose of keymap fallthrough.
function isModifierKey(value) {
  var name = typeof value == "string" ? value : keyNames[value.keyCode];
  return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod"
}

// Look up the name of a key as indicated by an event object.
function keyName(event, noShift) {
  if (presto && event.keyCode == 34 && event["char"]) { return false }
  var base = keyNames[event.keyCode], name = base;
  if (name == null || event.altGraphKey) { return false }
  if (event.altKey && base != "Alt") { name = "Alt-" + name; }
  if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") { name = "Ctrl-" + name; }
  if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") { name = "Cmd-" + name; }
  if (!noShift && event.shiftKey && base != "Shift") { name = "Shift-" + name; }
  return name
}

function getKeyMap(val) {
  return typeof val == "string" ? keyMap[val] : val
}

// Helper for deleting text near the selection(s), used to implement
// backspace, delete, and similar functionality.
function deleteNearSelection(cm, compute) {
  var ranges = cm.doc.sel.ranges, kill = [];
  // Build up a set of ranges to kill first, merging overlapping
  // ranges.
  for (var i = 0; i < ranges.length; i++) {
    var toKill = compute(ranges[i]);
    while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
      var replaced = kill.pop();
      if (cmp(replaced.from, toKill.from) < 0) {
        toKill.from = replaced.from;
        break
      }
    }
    kill.push(toKill);
  }
  // Next, remove those actual ranges.
  runInOp(cm, function () {
    for (var i = kill.length - 1; i >= 0; i--)
      { replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete"); }
    ensureCursorVisible(cm);
  });
}

// Commands are parameter-less actions that can be performed on an
// editor, mostly used for keybindings.
var commands = {
  selectAll: selectAll,
  singleSelection: function (cm) { return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll); },
  killLine: function (cm) { return deleteNearSelection(cm, function (range) {
    if (range.empty()) {
      var len = getLine(cm.doc, range.head.line).text.length;
      if (range.head.ch == len && range.head.line < cm.lastLine())
        { return {from: range.head, to: Pos(range.head.line + 1, 0)} }
      else
        { return {from: range.head, to: Pos(range.head.line, len)} }
    } else {
      return {from: range.from(), to: range.to()}
    }
  }); },
  deleteLine: function (cm) { return deleteNearSelection(cm, function (range) { return ({
    from: Pos(range.from().line, 0),
    to: clipPos(cm.doc, Pos(range.to().line + 1, 0))
  }); }); },
  delLineLeft: function (cm) { return deleteNearSelection(cm, function (range) { return ({
    from: Pos(range.from().line, 0), to: range.from()
  }); }); },
  delWrappedLineLeft: function (cm) { return deleteNearSelection(cm, function (range) {
    var top = cm.charCoords(range.head, "div").top + 5;
    var leftPos = cm.coordsChar({left: 0, top: top}, "div");
    return {from: leftPos, to: range.from()}
  }); },
  delWrappedLineRight: function (cm) { return deleteNearSelection(cm, function (range) {
    var top = cm.charCoords(range.head, "div").top + 5;
    var rightPos = cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
    return {from: range.from(), to: rightPos }
  }); },
  undo: function (cm) { return cm.undo(); },
  redo: function (cm) { return cm.redo(); },
  undoSelection: function (cm) { return cm.undoSelection(); },
  redoSelection: function (cm) { return cm.redoSelection(); },
  goDocStart: function (cm) { return cm.extendSelection(Pos(cm.firstLine(), 0)); },
  goDocEnd: function (cm) { return cm.extendSelection(Pos(cm.lastLine())); },
  goLineStart: function (cm) { return cm.extendSelectionsBy(function (range) { return lineStart(cm, range.head.line); },
    {origin: "+move", bias: 1}
  ); },
  goLineStartSmart: function (cm) { return cm.extendSelectionsBy(function (range) { return lineStartSmart(cm, range.head); },
    {origin: "+move", bias: 1}
  ); },
  goLineEnd: function (cm) { return cm.extendSelectionsBy(function (range) { return lineEnd(cm, range.head.line); },
    {origin: "+move", bias: -1}
  ); },
  goLineRight: function (cm) { return cm.extendSelectionsBy(function (range) {
    var top = cm.charCoords(range.head, "div").top + 5;
    return cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div")
  }, sel_move); },
  goLineLeft: function (cm) { return cm.extendSelectionsBy(function (range) {
    var top = cm.charCoords(range.head, "div").top + 5;
    return cm.coordsChar({left: 0, top: top}, "div")
  }, sel_move); },
  goLineLeftSmart: function (cm) { return cm.extendSelectionsBy(function (range) {
    var top = cm.charCoords(range.head, "div").top + 5;
    var pos = cm.coordsChar({left: 0, top: top}, "div");
    if (pos.ch < cm.getLine(pos.line).search(/\S/)) { return lineStartSmart(cm, range.head) }
    return pos
  }, sel_move); },
  goLineUp: function (cm) { return cm.moveV(-1, "line"); },
  goLineDown: function (cm) { return cm.moveV(1, "line"); },
  goPageUp: function (cm) { return cm.moveV(-1, "page"); },
  goPageDown: function (cm) { return cm.moveV(1, "page"); },
  goCharLeft: function (cm) { return cm.moveH(-1, "char"); },
  goCharRight: function (cm) { return cm.moveH(1, "char"); },
  goColumnLeft: function (cm) { return cm.moveH(-1, "column"); },
  goColumnRight: function (cm) { return cm.moveH(1, "column"); },
  goWordLeft: function (cm) { return cm.moveH(-1, "word"); },
  goGroupRight: function (cm) { return cm.moveH(1, "group"); },
  goGroupLeft: function (cm) { return cm.moveH(-1, "group"); },
  goWordRight: function (cm) { return cm.moveH(1, "word"); },
  delCharBefore: function (cm) { return cm.deleteH(-1, "char"); },
  delCharAfter: function (cm) { return cm.deleteH(1, "char"); },
  delWordBefore: function (cm) { return cm.deleteH(-1, "word"); },
  delWordAfter: function (cm) { return cm.deleteH(1, "word"); },
  delGroupBefore: function (cm) { return cm.deleteH(-1, "group"); },
  delGroupAfter: function (cm) { return cm.deleteH(1, "group"); },
  indentAuto: function (cm) { return cm.indentSelection("smart"); },
  indentMore: function (cm) { return cm.indentSelection("add"); },
  indentLess: function (cm) { return cm.indentSelection("subtract"); },
  insertTab: function (cm) { return cm.replaceSelection("\t"); },
  insertSoftTab: function (cm) {
    var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize;
    for (var i = 0; i < ranges.length; i++) {
      var pos = ranges[i].from();
      var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
      spaces.push(spaceStr(tabSize - col % tabSize));
    }
    cm.replaceSelections(spaces);
  },
  defaultTab: function (cm) {
    if (cm.somethingSelected()) { cm.indentSelection("add"); }
    else { cm.execCommand("insertTab"); }
  },
  // Swap the two chars left and right of each selection's head.
  // Move cursor behind the two swapped characters afterwards.
  //
  // Doesn't consider line feeds a character.
  // Doesn't scan more than one line above to find a character.
  // Doesn't do anything on an empty line.
  // Doesn't do anything with non-empty selections.
  transposeChars: function (cm) { return runInOp(cm, function () {
    var ranges = cm.listSelections(), newSel = [];
    for (var i = 0; i < ranges.length; i++) {
      if (!ranges[i].empty()) { continue }
      var cur = ranges[i].head, line = getLine(cm.doc, cur.line).text;
      if (line) {
        if (cur.ch == line.length) { cur = new Pos(cur.line, cur.ch - 1); }
        if (cur.ch > 0) {
          cur = new Pos(cur.line, cur.ch + 1);
          cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2),
                          Pos(cur.line, cur.ch - 2), cur, "+transpose");
        } else if (cur.line > cm.doc.first) {
          var prev = getLine(cm.doc, cur.line - 1).text;
          if (prev) {
            cur = new Pos(cur.line, 1);
            cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() +
                            prev.charAt(prev.length - 1),
                            Pos(cur.line - 1, prev.length - 1), cur, "+transpose");
          }
        }
      }
      newSel.push(new Range(cur, cur));
    }
    cm.setSelections(newSel);
  }); },
  newlineAndIndent: function (cm) { return runInOp(cm, function () {
    var sels = cm.listSelections();
    for (var i = sels.length - 1; i >= 0; i--)
      { cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input"); }
    sels = cm.listSelections();
    for (var i$1 = 0; i$1 < sels.length; i$1++)
      { cm.indentLine(sels[i$1].from().line, null, true); }
    ensureCursorVisible(cm);
  }); },
  openLine: function (cm) { return cm.replaceSelection("\n", "start"); },
  toggleOverwrite: function (cm) { return cm.toggleOverwrite(); }
};


function lineStart(cm, lineN) {
  var line = getLine(cm.doc, lineN);
  var visual = visualLine(line);
  if (visual != line) { lineN = lineNo(visual); }
  return endOfLine(true, cm, visual, lineN, 1)
}
function lineEnd(cm, lineN) {
  var line = getLine(cm.doc, lineN);
  var visual = visualLineEnd(line);
  if (visual != line) { lineN = lineNo(visual); }
  return endOfLine(true, cm, line, lineN, -1)
}
function lineStartSmart(cm, pos) {
  var start = lineStart(cm, pos.line);
  var line = getLine(cm.doc, start.line);
  var order = getOrder(line, cm.doc.direction);
  if (!order || order[0].level == 0) {
    var firstNonWS = Math.max(0, line.text.search(/\S/));
    var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
    return Pos(start.line, inWS ? 0 : firstNonWS, start.sticky)
  }
  return start
}

// Run a handler that was bound to a key.
function doHandleBinding(cm, bound, dropShift) {
  if (typeof bound == "string") {
    bound = commands[bound];
    if (!bound) { return false }
  }
  // Ensure previous input has been read, so that the handler sees a
  // consistent view of the document
  cm.display.input.ensurePolled();
  var prevShift = cm.display.shift, done = false;
  try {
    if (cm.isReadOnly()) { cm.state.suppressEdits = true; }
    if (dropShift) { cm.display.shift = false; }
    done = bound(cm) != Pass;
  } finally {
    cm.display.shift = prevShift;
    cm.state.suppressEdits = false;
  }
  return done
}

function lookupKeyForEditor(cm, name, handle) {
  for (var i = 0; i < cm.state.keyMaps.length; i++) {
    var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
    if (result) { return result }
  }
  return (cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm))
    || lookupKey(name, cm.options.keyMap, handle, cm)
}

var stopSeq = new Delayed;
function dispatchKey(cm, name, e, handle) {
  var seq = cm.state.keySeq;
  if (seq) {
    if (isModifierKey(name)) { return "handled" }
    stopSeq.set(50, function () {
      if (cm.state.keySeq == seq) {
        cm.state.keySeq = null;
        cm.display.input.reset();
      }
    });
    name = seq + " " + name;
  }
  var result = lookupKeyForEditor(cm, name, handle);

  if (result == "multi")
    { cm.state.keySeq = name; }
  if (result == "handled")
    { signalLater(cm, "keyHandled", cm, name, e); }

  if (result == "handled" || result == "multi") {
    e_preventDefault(e);
    restartBlink(cm);
  }

  if (seq && !result && /\'$/.test(name)) {
    e_preventDefault(e);
    return true
  }
  return !!result
}

// Handle a key from the keydown event.
function handleKeyBinding(cm, e) {
  var name = keyName(e, true);
  if (!name) { return false }

  if (e.shiftKey && !cm.state.keySeq) {
    // First try to resolve full name (including 'Shift-'). Failing
    // that, see if there is a cursor-motion command (starting with
    // 'go') bound to the keyname without 'Shift-'.
    return dispatchKey(cm, "Shift-" + name, e, function (b) { return doHandleBinding(cm, b, true); })
        || dispatchKey(cm, name, e, function (b) {
             if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
               { return doHandleBinding(cm, b) }
           })
  } else {
    return dispatchKey(cm, name, e, function (b) { return doHandleBinding(cm, b); })
  }
}

// Handle a key from the keypress event
function handleCharBinding(cm, e, ch) {
  return dispatchKey(cm, "'" + ch + "'", e, function (b) { return doHandleBinding(cm, b, true); })
}

var lastStoppedKey = null;
function onKeyDown(e) {
  var cm = this;
  cm.curOp.focus = activeElt();
  if (signalDOMEvent(cm, e)) { return }
  // IE does strange things with escape.
  if (ie && ie_version < 11 && e.keyCode == 27) { e.returnValue = false; }
  var code = e.keyCode;
  cm.display.shift = code == 16 || e.shiftKey;
  var handled = handleKeyBinding(cm, e);
  if (presto) {
    lastStoppedKey = handled ? code : null;
    // Opera has no cut event... we try to at least catch the key combo
    if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
      { cm.replaceSelection("", null, "cut"); }
  }

  // Turn mouse into crosshair when Alt is held on Mac.
  if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
    { showCrossHair(cm); }
}

function showCrossHair(cm) {
  var lineDiv = cm.display.lineDiv;
  addClass(lineDiv, "CodeMirror-crosshair");

  function up(e) {
    if (e.keyCode == 18 || !e.altKey) {
      rmClass(lineDiv, "CodeMirror-crosshair");
      off(document, "keyup", up);
      off(document, "mouseover", up);
    }
  }
  on(document, "keyup", up);
  on(document, "mouseover", up);
}

function onKeyUp(e) {
  if (e.keyCode == 16) { this.doc.sel.shift = false; }
  signalDOMEvent(this, e);
}

function onKeyPress(e) {
  var cm = this;
  if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) { return }
  var keyCode = e.keyCode, charCode = e.charCode;
  if (presto && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return}
  if ((presto && (!e.which || e.which < 10)) && handleKeyBinding(cm, e)) { return }
  var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
  // Some browsers fire keypress events for backspace
  if (ch == "\x08") { return }
  if (handleCharBinding(cm, e, ch)) { return }
  cm.display.input.onKeyPress(e);
}

// A mouse down can be a single click, double click, triple click,
// start of selection drag, start of text drag, new cursor
// (ctrl-click), rectangle drag (alt-drag), or xwin
// middle-click-paste. Or it might be a click on something we should
// not interfere with, such as a scrollbar or widget.
function onMouseDown(e) {
  var cm = this, display = cm.display;
  if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch()) { return }
  display.input.ensurePolled();
  display.shift = e.shiftKey;

  if (eventInWidget(display, e)) {
    if (!webkit) {
      // Briefly turn off draggability, to allow widgets to do
      // normal dragging things.
      display.scroller.draggable = false;
      setTimeout(function () { return display.scroller.draggable = true; }, 100);
    }
    return
  }
  if (clickInGutter(cm, e)) { return }
  var start = posFromMouse(cm, e);
  window.focus();

  switch (e_button(e)) {
  case 1:
    // #3261: make sure, that we're not starting a second selection
    if (cm.state.selectingText)
      { cm.state.selectingText(e); }
    else if (start)
      { leftButtonDown(cm, e, start); }
    else if (e_target(e) == display.scroller)
      { e_preventDefault(e); }
    break
  case 2:
    if (webkit) { cm.state.lastMiddleDown = +new Date; }
    if (start) { extendSelection(cm.doc, start); }
    setTimeout(function () { return display.input.focus(); }, 20);
    e_preventDefault(e);
    break
  case 3:
    if (captureRightClick) { onContextMenu(cm, e); }
    else { delayBlurEvent(cm); }
    break
  }
}

var lastClick;
var lastDoubleClick;
function leftButtonDown(cm, e, start) {
  if (ie) { setTimeout(bind(ensureFocus, cm), 0); }
  else { cm.curOp.focus = activeElt(); }

  var now = +new Date, type;
  if (lastDoubleClick && lastDoubleClick.time > now - 400 && cmp(lastDoubleClick.pos, start) == 0) {
    type = "triple";
  } else if (lastClick && lastClick.time > now - 400 && cmp(lastClick.pos, start) == 0) {
    type = "double";
    lastDoubleClick = {time: now, pos: start};
  } else {
    type = "single";
    lastClick = {time: now, pos: start};
  }

  var sel = cm.doc.sel, modifier = mac ? e.metaKey : e.ctrlKey, contained;
  if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() &&
      type == "single" && (contained = sel.contains(start)) > -1 &&
      (cmp((contained = sel.ranges[contained]).from(), start) < 0 || start.xRel > 0) &&
      (cmp(contained.to(), start) > 0 || start.xRel < 0))
    { leftButtonStartDrag(cm, e, start, modifier); }
  else
    { leftButtonSelect(cm, e, start, type, modifier); }
}

// Start a text drag. When it ends, see if any dragging actually
// happen, and treat as a click if it didn't.
function leftButtonStartDrag(cm, e, start, modifier) {
  var display = cm.display, moved = false;
  var dragEnd = operation(cm, function (e) {
    if (webkit) { display.scroller.draggable = false; }
    cm.state.draggingText = false;
    off(document, "mouseup", dragEnd);
    off(document, "mousemove", mouseMove);
    off(display.scroller, "dragstart", dragStart);
    off(display.scroller, "drop", dragEnd);
    if (!moved) {
      e_preventDefault(e);
      if (!modifier)
        { extendSelection(cm.doc, start); }
      // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)
      if (webkit || ie && ie_version == 9)
        { setTimeout(function () {document.body.focus(); display.input.focus();}, 20); }
      else
        { display.input.focus(); }
    }
  });
  var mouseMove = function(e2) {
    moved = moved || Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) >= 10;
  };
  var dragStart = function () { return moved = true; };
  // Let the drag handler handle this.
  if (webkit) { display.scroller.draggable = true; }
  cm.state.draggingText = dragEnd;
  dragEnd.copy = mac ? e.altKey : e.ctrlKey;
  // IE's approach to draggable
  if (display.scroller.dragDrop) { display.scroller.dragDrop(); }
  on(document, "mouseup", dragEnd);
  on(document, "mousemove", mouseMove);
  on(display.scroller, "dragstart", dragStart);
  on(display.scroller, "drop", dragEnd);

  delayBlurEvent(cm);
  setTimeout(function () { return display.input.focus(); }, 20);
}

// Normal selection, as opposed to text dragging.
function leftButtonSelect(cm, e, start, type, addNew) {
  var display = cm.display, doc = cm.doc;
  e_preventDefault(e);

  var ourRange, ourIndex, startSel = doc.sel, ranges = startSel.ranges;
  if (addNew && !e.shiftKey) {
    ourIndex = doc.sel.contains(start);
    if (ourIndex > -1)
      { ourRange = ranges[ourIndex]; }
    else
      { ourRange = new Range(start, start); }
  } else {
    ourRange = doc.sel.primary();
    ourIndex = doc.sel.primIndex;
  }

  if (chromeOS ? e.shiftKey && e.metaKey : e.altKey) {
    type = "rect";
    if (!addNew) { ourRange = new Range(start, start); }
    start = posFromMouse(cm, e, true, true);
    ourIndex = -1;
  } else if (type == "double") {
    var word = cm.findWordAt(start);
    if (cm.display.shift || doc.extend)
      { ourRange = extendRange(doc, ourRange, word.anchor, word.head); }
    else
      { ourRange = word; }
  } else if (type == "triple") {
    var line = new Range(Pos(start.line, 0), clipPos(doc, Pos(start.line + 1, 0)));
    if (cm.display.shift || doc.extend)
      { ourRange = extendRange(doc, ourRange, line.anchor, line.head); }
    else
      { ourRange = line; }
  } else {
    ourRange = extendRange(doc, ourRange, start);
  }

  if (!addNew) {
    ourIndex = 0;
    setSelection(doc, new Selection([ourRange], 0), sel_mouse);
    startSel = doc.sel;
  } else if (ourIndex == -1) {
    ourIndex = ranges.length;
    setSelection(doc, normalizeSelection(ranges.concat([ourRange]), ourIndex),
                 {scroll: false, origin: "*mouse"});
  } else if (ranges.length > 1 && ranges[ourIndex].empty() && type == "single" && !e.shiftKey) {
    setSelection(doc, normalizeSelection(ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0),
                 {scroll: false, origin: "*mouse"});
    startSel = doc.sel;
  } else {
    replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
  }

  var lastPos = start;
  function extendTo(pos) {
    if (cmp(lastPos, pos) == 0) { return }
    lastPos = pos;

    if (type == "rect") {
      var ranges = [], tabSize = cm.options.tabSize;
      var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
      var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
      var left = Math.min(startCol, posCol), right = Math.max(startCol, posCol);
      for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line));
           line <= end; line++) {
        var text = getLine(doc, line).text, leftPos = findColumn(text, left, tabSize);
        if (left == right)
          { ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos))); }
        else if (text.length > leftPos)
          { ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize)))); }
      }
      if (!ranges.length) { ranges.push(new Range(start, start)); }
      setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex),
                   {origin: "*mouse", scroll: false});
      cm.scrollIntoView(pos);
    } else {
      var oldRange = ourRange;
      var anchor = oldRange.anchor, head = pos;
      if (type != "single") {
        var range$$1;
        if (type == "double")
          { range$$1 = cm.findWordAt(pos); }
        else
          { range$$1 = new Range(Pos(pos.line, 0), clipPos(doc, Pos(pos.line + 1, 0))); }
        if (cmp(range$$1.anchor, anchor) > 0) {
          head = range$$1.head;
          anchor = minPos(oldRange.from(), range$$1.anchor);
        } else {
          head = range$$1.anchor;
          anchor = maxPos(oldRange.to(), range$$1.head);
        }
      }
      var ranges$1 = startSel.ranges.slice(0);
      ranges$1[ourIndex] = new Range(clipPos(doc, anchor), head);
      setSelection(doc, normalizeSelection(ranges$1, ourIndex), sel_mouse);
    }
  }

  var editorSize = display.wrapper.getBoundingClientRect();
  // Used to ensure timeout re-tries don't fire when another extend
  // happened in the meantime (clearTimeout isn't reliable -- at
  // least on Chrome, the timeouts still happen even when cleared,
  // if the clear happens after their scheduled firing time).
  var counter = 0;

  function extend(e) {
    var curCount = ++counter;
    var cur = posFromMouse(cm, e, true, type == "rect");
    if (!cur) { return }
    if (cmp(cur, lastPos) != 0) {
      cm.curOp.focus = activeElt();
      extendTo(cur);
      var visible = visibleLines(display, doc);
      if (cur.line >= visible.to || cur.line < visible.from)
        { setTimeout(operation(cm, function () {if (counter == curCount) { extend(e); }}), 150); }
    } else {
      var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
      if (outside) { setTimeout(operation(cm, function () {
        if (counter != curCount) { return }
        display.scroller.scrollTop += outside;
        extend(e);
      }), 50); }
    }
  }

  function done(e) {
    cm.state.selectingText = false;
    counter = Infinity;
    e_preventDefault(e);
    display.input.focus();
    off(document, "mousemove", move);
    off(document, "mouseup", up);
    doc.history.lastSelOrigin = null;
  }

  var move = operation(cm, function (e) {
    if (!e_button(e)) { done(e); }
    else { extend(e); }
  });
  var up = operation(cm, done);
  cm.state.selectingText = up;
  on(document, "mousemove", move);
  on(document, "mouseup", up);
}


// Determines whether an event happened in the gutter, and fires the
// handlers for the corresponding event.
function gutterEvent(cm, e, type, prevent) {
  var mX, mY;
  try { mX = e.clientX; mY = e.clientY; }
  catch(e) { return false }
  if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) { return false }
  if (prevent) { e_preventDefault(e); }

  var display = cm.display;
  var lineBox = display.lineDiv.getBoundingClientRect();

  if (mY > lineBox.bottom || !hasHandler(cm, type)) { return e_defaultPrevented(e) }
  mY -= lineBox.top - display.viewOffset;

  for (var i = 0; i < cm.options.gutters.length; ++i) {
    var g = display.gutters.childNodes[i];
    if (g && g.getBoundingClientRect().right >= mX) {
      var line = lineAtHeight(cm.doc, mY);
      var gutter = cm.options.gutters[i];
      signal(cm, type, cm, line, gutter, e);
      return e_defaultPrevented(e)
    }
  }
}

function clickInGutter(cm, e) {
  return gutterEvent(cm, e, "gutterClick", true)
}

// CONTEXT MENU HANDLING

// To make the context menu work, we need to briefly unhide the
// textarea (making it as unobtrusive as possible) to let the
// right-click take effect on it.
function onContextMenu(cm, e) {
  if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) { return }
  if (signalDOMEvent(cm, e, "contextmenu")) { return }
  cm.display.input.onContextMenu(e);
}

function contextMenuInGutter(cm, e) {
  if (!hasHandler(cm, "gutterContextMenu")) { return false }
  return gutterEvent(cm, e, "gutterContextMenu", false)
}

function themeChanged(cm) {
  cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
    cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
  clearCaches(cm);
}

var Init = {toString: function(){return "CodeMirror.Init"}};

var defaults = {};
var optionHandlers = {};

function defineOptions(CodeMirror) {
  var optionHandlers = CodeMirror.optionHandlers;

  function option(name, deflt, handle, notOnInit) {
    CodeMirror.defaults[name] = deflt;
    if (handle) { optionHandlers[name] =
      notOnInit ? function (cm, val, old) {if (old != Init) { handle(cm, val, old); }} : handle; }
  }

  CodeMirror.defineOption = option;

  // Passed to option handlers when there is no old value.
  CodeMirror.Init = Init;

  // These two are, on init, called from the constructor because they
  // have to be initialized before the editor can start at all.
  option("value", "", function (cm, val) { return cm.setValue(val); }, true);
  option("mode", null, function (cm, val) {
    cm.doc.modeOption = val;
    loadMode(cm);
  }, true);

  option("indentUnit", 2, loadMode, true);
  option("indentWithTabs", false);
  option("smartIndent", true);
  option("tabSize", 4, function (cm) {
    resetModeState(cm);
    clearCaches(cm);
    regChange(cm);
  }, true);
  option("lineSeparator", null, function (cm, val) {
    cm.doc.lineSep = val;
    if (!val) { return }
    var newBreaks = [], lineNo = cm.doc.first;
    cm.doc.iter(function (line) {
      for (var pos = 0;;) {
        var found = line.text.indexOf(val, pos);
        if (found == -1) { break }
        pos = found + val.length;
        newBreaks.push(Pos(lineNo, found));
      }
      lineNo++;
    });
    for (var i = newBreaks.length - 1; i >= 0; i--)
      { replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length)); }
  });
  option("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function (cm, val, old) {
    cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");
    if (old != Init) { cm.refresh(); }
  });
  option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function (cm) { return cm.refresh(); }, true);
  option("electricChars", true);
  option("inputStyle", mobile ? "contenteditable" : "textarea", function () {
    throw new Error("inputStyle can not (yet) be changed in a running editor") // FIXME
  }, true);
  option("spellcheck", false, function (cm, val) { return cm.getInputField().spellcheck = val; }, true);
  option("rtlMoveVisually", !windows);
  option("wholeLineUpdateBefore", true);

  option("theme", "default", function (cm) {
    themeChanged(cm);
    guttersChanged(cm);
  }, true);
  option("keyMap", "default", function (cm, val, old) {
    var next = getKeyMap(val);
    var prev = old != Init && getKeyMap(old);
    if (prev && prev.detach) { prev.detach(cm, next); }
    if (next.attach) { next.attach(cm, prev || null); }
  });
  option("extraKeys", null);

  option("lineWrapping", false, wrappingChanged, true);
  option("gutters", [], function (cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("fixedGutter", true, function (cm, val) {
    cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
    cm.refresh();
  }, true);
  option("coverGutterNextToScrollbar", false, function (cm) { return updateScrollbars(cm); }, true);
  option("scrollbarStyle", "native", function (cm) {
    initScrollbars(cm);
    updateScrollbars(cm);
    cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
    cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
  }, true);
  option("lineNumbers", false, function (cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("firstLineNumber", 1, guttersChanged, true);
  option("lineNumberFormatter", function (integer) { return integer; }, guttersChanged, true);
  option("showCursorWhenSelecting", false, updateSelection, true);

  option("resetSelectionOnContextMenu", true);
  option("lineWiseCopyCut", true);

  option("readOnly", false, function (cm, val) {
    if (val == "nocursor") {
      onBlur(cm);
      cm.display.input.blur();
      cm.display.disabled = true;
    } else {
      cm.display.disabled = false;
    }
    cm.display.input.readOnlyChanged(val);
  });
  option("disableInput", false, function (cm, val) {if (!val) { cm.display.input.reset(); }}, true);
  option("dragDrop", true, dragDropChanged);
  option("allowDropFileTypes", null);

  option("cursorBlinkRate", 530);
  option("cursorScrollMargin", 0);
  option("cursorHeight", 1, updateSelection, true);
  option("singleCursorHeightPerLine", true, updateSelection, true);
  option("workTime", 100);
  option("workDelay", 100);
  option("flattenSpans", true, resetModeState, true);
  option("addModeClass", false, resetModeState, true);
  option("pollInterval", 100);
  option("undoDepth", 200, function (cm, val) { return cm.doc.history.undoDepth = val; });
  option("historyEventDelay", 1250);
  option("viewportMargin", 10, function (cm) { return cm.refresh(); }, true);
  option("maxHighlightLength", 10000, resetModeState, true);
  option("moveInputWithCursor", true, function (cm, val) {
    if (!val) { cm.display.input.resetPosition(); }
  });

  option("tabindex", null, function (cm, val) { return cm.display.input.getField().tabIndex = val || ""; });
  option("autofocus", null);
  option("direction", "ltr", function (cm, val) { return cm.doc.setDirection(val); }, true);
}

function guttersChanged(cm) {
  updateGutters(cm);
  regChange(cm);
  alignHorizontally(cm);
}

function dragDropChanged(cm, value, old) {
  var wasOn = old && old != Init;
  if (!value != !wasOn) {
    var funcs = cm.display.dragFunctions;
    var toggle = value ? on : off;
    toggle(cm.display.scroller, "dragstart", funcs.start);
    toggle(cm.display.scroller, "dragenter", funcs.enter);
    toggle(cm.display.scroller, "dragover", funcs.over);
    toggle(cm.display.scroller, "dragleave", funcs.leave);
    toggle(cm.display.scroller, "drop", funcs.drop);
  }
}

function wrappingChanged(cm) {
  if (cm.options.lineWrapping) {
    addClass(cm.display.wrapper, "CodeMirror-wrap");
    cm.display.sizer.style.minWidth = "";
    cm.display.sizerWidth = null;
  } else {
    rmClass(cm.display.wrapper, "CodeMirror-wrap");
    findMaxLine(cm);
  }
  estimateLineHeights(cm);
  regChange(cm);
  clearCaches(cm);
  setTimeout(function () { return updateScrollbars(cm); }, 100);
}

// A CodeMirror instance represents an editor. This is the object
// that user code is usually dealing with.

function CodeMirror$1(place, options) {
  var this$1 = this;

  if (!(this instanceof CodeMirror$1)) { return new CodeMirror$1(place, options) }

  this.options = options = options ? copyObj(options) : {};
  // Determine effective options based on given values and defaults.
  copyObj(defaults, options, false);
  setGuttersForLineNumbers(options);

  var doc = options.value;
  if (typeof doc == "string") { doc = new Doc(doc, options.mode, null, options.lineSeparator, options.direction); }
  this.doc = doc;

  var input = new CodeMirror$1.inputStyles[options.inputStyle](this);
  var display = this.display = new Display(place, doc, input);
  display.wrapper.CodeMirror = this;
  updateGutters(this);
  themeChanged(this);
  if (options.lineWrapping)
    { this.display.wrapper.className += " CodeMirror-wrap"; }
  initScrollbars(this);

  this.state = {
    keyMaps: [],  // stores maps added by addKeyMap
    overlays: [], // highlighting overlays, as added by addOverlay
    modeGen: 0,   // bumped when mode/overlay changes, used to invalidate highlighting info
    overwrite: false,
    delayingBlurEvent: false,
    focused: false,
    suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
    pasteIncoming: false, cutIncoming: false, // help recognize paste/cut edits in input.poll
    selectingText: false,
    draggingText: false,
    highlight: new Delayed(), // stores highlight worker timeout
    keySeq: null,  // Unfinished key sequence
    specialChars: null
  };

  if (options.autofocus && !mobile) { display.input.focus(); }

  // Override magic textarea content restore that IE sometimes does
  // on our hidden textarea on reload
  if (ie && ie_version < 11) { setTimeout(function () { return this$1.display.input.reset(true); }, 20); }

  registerEventHandlers(this);
  ensureGlobalHandlers();

  startOperation(this);
  this.curOp.forceUpdate = true;
  attachDoc(this, doc);

  if ((options.autofocus && !mobile) || this.hasFocus())
    { setTimeout(bind(onFocus, this), 20); }
  else
    { onBlur(this); }

  for (var opt in optionHandlers) { if (optionHandlers.hasOwnProperty(opt))
    { optionHandlers[opt](this$1, options[opt], Init); } }
  maybeUpdateLineNumberWidth(this);
  if (options.finishInit) { options.finishInit(this); }
  for (var i = 0; i < initHooks.length; ++i) { initHooks[i](this$1); }
  endOperation(this);
  // Suppress optimizelegibility in Webkit, since it breaks text
  // measuring on line wrapping boundaries.
  if (webkit && options.lineWrapping &&
      getComputedStyle(display.lineDiv).textRendering == "optimizelegibility")
    { display.lineDiv.style.textRendering = "auto"; }
}

// The default configuration options.
CodeMirror$1.defaults = defaults;
// Functions to run when options are changed.
CodeMirror$1.optionHandlers = optionHandlers;

// Attach the necessary event handlers when initializing the editor
function registerEventHandlers(cm) {
  var d = cm.display;
  on(d.scroller, "mousedown", operation(cm, onMouseDown));
  // Older IE's will not fire a second mousedown for a double click
  if (ie && ie_version < 11)
    { on(d.scroller, "dblclick", operation(cm, function (e) {
      if (signalDOMEvent(cm, e)) { return }
      var pos = posFromMouse(cm, e);
      if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) { return }
      e_preventDefault(e);
      var word = cm.findWordAt(pos);
      extendSelection(cm.doc, word.anchor, word.head);
    })); }
  else
    { on(d.scroller, "dblclick", function (e) { return signalDOMEvent(cm, e) || e_preventDefault(e); }); }
  // Some browsers fire contextmenu *after* opening the menu, at
  // which point we can't mess with it anymore. Context menu is
  // handled in onMouseDown for these browsers.
  if (!captureRightClick) { on(d.scroller, "contextmenu", function (e) { return onContextMenu(cm, e); }); }

  // Used to suppress mouse event handling when a touch happens
  var touchFinished, prevTouch = {end: 0};
  function finishTouch() {
    if (d.activeTouch) {
      touchFinished = setTimeout(function () { return d.activeTouch = null; }, 1000);
      prevTouch = d.activeTouch;
      prevTouch.end = +new Date;
    }
  }
  function isMouseLikeTouchEvent(e) {
    if (e.touches.length != 1) { return false }
    var touch = e.touches[0];
    return touch.radiusX <= 1 && touch.radiusY <= 1
  }
  function farAway(touch, other) {
    if (other.left == null) { return true }
    var dx = other.left - touch.left, dy = other.top - touch.top;
    return dx * dx + dy * dy > 20 * 20
  }
  on(d.scroller, "touchstart", function (e) {
    if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e)) {
      d.input.ensurePolled();
      clearTimeout(touchFinished);
      var now = +new Date;
      d.activeTouch = {start: now, moved: false,
                       prev: now - prevTouch.end <= 300 ? prevTouch : null};
      if (e.touches.length == 1) {
        d.activeTouch.left = e.touches[0].pageX;
        d.activeTouch.top = e.touches[0].pageY;
      }
    }
  });
  on(d.scroller, "touchmove", function () {
    if (d.activeTouch) { d.activeTouch.moved = true; }
  });
  on(d.scroller, "touchend", function (e) {
    var touch = d.activeTouch;
    if (touch && !eventInWidget(d, e) && touch.left != null &&
        !touch.moved && new Date - touch.start < 300) {
      var pos = cm.coordsChar(d.activeTouch, "page"), range;
      if (!touch.prev || farAway(touch, touch.prev)) // Single tap
        { range = new Range(pos, pos); }
      else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
        { range = cm.findWordAt(pos); }
      else // Triple tap
        { range = new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0))); }
      cm.setSelection(range.anchor, range.head);
      cm.focus();
      e_preventDefault(e);
    }
    finishTouch();
  });
  on(d.scroller, "touchcancel", finishTouch);

  // Sync scrolling between fake scrollbars and real scrollable
  // area, ensure viewport is updated when scrolling.
  on(d.scroller, "scroll", function () {
    if (d.scroller.clientHeight) {
      updateScrollTop(cm, d.scroller.scrollTop);
      setScrollLeft(cm, d.scroller.scrollLeft, true);
      signal(cm, "scroll", cm);
    }
  });

  // Listen to wheel events in order to try and update the viewport on time.
  on(d.scroller, "mousewheel", function (e) { return onScrollWheel(cm, e); });
  on(d.scroller, "DOMMouseScroll", function (e) { return onScrollWheel(cm, e); });

  // Prevent wrapper from ever scrolling
  on(d.wrapper, "scroll", function () { return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0; });

  d.dragFunctions = {
    enter: function (e) {if (!signalDOMEvent(cm, e)) { e_stop(e); }},
    over: function (e) {if (!signalDOMEvent(cm, e)) { onDragOver(cm, e); e_stop(e); }},
    start: function (e) { return onDragStart(cm, e); },
    drop: operation(cm, onDrop),
    leave: function (e) {if (!signalDOMEvent(cm, e)) { clearDragCursor(cm); }}
  };

  var inp = d.input.getField();
  on(inp, "keyup", function (e) { return onKeyUp.call(cm, e); });
  on(inp, "keydown", operation(cm, onKeyDown));
  on(inp, "keypress", operation(cm, onKeyPress));
  on(inp, "focus", function (e) { return onFocus(cm, e); });
  on(inp, "blur", function (e) { return onBlur(cm, e); });
}

var initHooks = [];
CodeMirror$1.defineInitHook = function (f) { return initHooks.push(f); };

// Indent the given line. The how parameter can be "smart",
// "add"/null, "subtract", or "prev". When aggressive is false
// (typically set to true for forced single-line indents), empty
// lines are not indented, and places where the mode returns Pass
// are left alone.
function indentLine(cm, n, how, aggressive) {
  var doc = cm.doc, state;
  if (how == null) { how = "add"; }
  if (how == "smart") {
    // Fall back to "prev" when the mode doesn't have an indentation
    // method.
    if (!doc.mode.indent) { how = "prev"; }
    else { state = getStateBefore(cm, n); }
  }

  var tabSize = cm.options.tabSize;
  var line = getLine(doc, n), curSpace = countColumn(line.text, null, tabSize);
  if (line.stateAfter) { line.stateAfter = null; }
  var curSpaceString = line.text.match(/^\s*/)[0], indentation;
  if (!aggressive && !/\S/.test(line.text)) {
    indentation = 0;
    how = "not";
  } else if (how == "smart") {
    indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
    if (indentation == Pass || indentation > 150) {
      if (!aggressive) { return }
      how = "prev";
    }
  }
  if (how == "prev") {
    if (n > doc.first) { indentation = countColumn(getLine(doc, n-1).text, null, tabSize); }
    else { indentation = 0; }
  } else if (how == "add") {
    indentation = curSpace + cm.options.indentUnit;
  } else if (how == "subtract") {
    indentation = curSpace - cm.options.indentUnit;
  } else if (typeof how == "number") {
    indentation = curSpace + how;
  }
  indentation = Math.max(0, indentation);

  var indentString = "", pos = 0;
  if (cm.options.indentWithTabs)
    { for (var i = Math.floor(indentation / tabSize); i; --i) {pos += tabSize; indentString += "\t";} }
  if (pos < indentation) { indentString += spaceStr(indentation - pos); }

  if (indentString != curSpaceString) {
    replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
    line.stateAfter = null;
    return true
  } else {
    // Ensure that, if the cursor was in the whitespace at the start
    // of the line, it is moved to the end of that space.
    for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
      var range = doc.sel.ranges[i$1];
      if (range.head.line == n && range.head.ch < curSpaceString.length) {
        var pos$1 = Pos(n, curSpaceString.length);
        replaceOneSelection(doc, i$1, new Range(pos$1, pos$1));
        break
      }
    }
  }
}

// This will be set to a {lineWise: bool, text: [string]} object, so
// that, when pasting, we know what kind of selections the copied
// text was made out of.
var lastCopied = null;

function setLastCopied(newLastCopied) {
  lastCopied = newLastCopied;
}

function applyTextInput(cm, inserted, deleted, sel, origin) {
  var doc = cm.doc;
  cm.display.shift = false;
  if (!sel) { sel = doc.sel; }

  var paste = cm.state.pasteIncoming || origin == "paste";
  var textLines = splitLinesAuto(inserted), multiPaste = null;
  // When pasing N lines into N selections, insert one line per selection
  if (paste && sel.ranges.length > 1) {
    if (lastCopied && lastCopied.text.join("\n") == inserted) {
      if (sel.ranges.length % lastCopied.text.length == 0) {
        multiPaste = [];
        for (var i = 0; i < lastCopied.text.length; i++)
          { multiPaste.push(doc.splitLines(lastCopied.text[i])); }
      }
    } else if (textLines.length == sel.ranges.length) {
      multiPaste = map(textLines, function (l) { return [l]; });
    }
  }

  var updateInput;
  // Normal behavior is to insert the new text into every selection
  for (var i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
    var range$$1 = sel.ranges[i$1];
    var from = range$$1.from(), to = range$$1.to();
    if (range$$1.empty()) {
      if (deleted && deleted > 0) // Handle deletion
        { from = Pos(from.line, from.ch - deleted); }
      else if (cm.state.overwrite && !paste) // Handle overwrite
        { to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length)); }
      else if (lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == inserted)
        { from = to = Pos(from.line, 0); }
    }
    updateInput = cm.curOp.updateInput;
    var changeEvent = {from: from, to: to, text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
                       origin: origin || (paste ? "paste" : cm.state.cutIncoming ? "cut" : "+input")};
    makeChange(cm.doc, changeEvent);
    signalLater(cm, "inputRead", cm, changeEvent);
  }
  if (inserted && !paste)
    { triggerElectric(cm, inserted); }

  ensureCursorVisible(cm);
  cm.curOp.updateInput = updateInput;
  cm.curOp.typing = true;
  cm.state.pasteIncoming = cm.state.cutIncoming = false;
}

function handlePaste(e, cm) {
  var pasted = e.clipboardData && e.clipboardData.getData("Text");
  if (pasted) {
    e.preventDefault();
    if (!cm.isReadOnly() && !cm.options.disableInput)
      { runInOp(cm, function () { return applyTextInput(cm, pasted, 0, null, "paste"); }); }
    return true
  }
}

function triggerElectric(cm, inserted) {
  // When an 'electric' character is inserted, immediately trigger a reindent
  if (!cm.options.electricChars || !cm.options.smartIndent) { return }
  var sel = cm.doc.sel;

  for (var i = sel.ranges.length - 1; i >= 0; i--) {
    var range$$1 = sel.ranges[i];
    if (range$$1.head.ch > 100 || (i && sel.ranges[i - 1].head.line == range$$1.head.line)) { continue }
    var mode = cm.getModeAt(range$$1.head);
    var indented = false;
    if (mode.electricChars) {
      for (var j = 0; j < mode.electricChars.length; j++)
        { if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
          indented = indentLine(cm, range$$1.head.line, "smart");
          break
        } }
    } else if (mode.electricInput) {
      if (mode.electricInput.test(getLine(cm.doc, range$$1.head.line).text.slice(0, range$$1.head.ch)))
        { indented = indentLine(cm, range$$1.head.line, "smart"); }
    }
    if (indented) { signalLater(cm, "electricInput", cm, range$$1.head.line); }
  }
}

function copyableRanges(cm) {
  var text = [], ranges = [];
  for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
    var line = cm.doc.sel.ranges[i].head.line;
    var lineRange = {anchor: Pos(line, 0), head: Pos(line + 1, 0)};
    ranges.push(lineRange);
    text.push(cm.getRange(lineRange.anchor, lineRange.head));
  }
  return {text: text, ranges: ranges}
}

function disableBrowserMagic(field, spellcheck) {
  field.setAttribute("autocorrect", "off");
  field.setAttribute("autocapitalize", "off");
  field.setAttribute("spellcheck", !!spellcheck);
}

function hiddenTextarea() {
  var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none");
  var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
  // The textarea is kept positioned near the cursor to prevent the
  // fact that it'll be scrolled into view on input from scrolling
  // our fake cursor out of view. On webkit, when wrap=off, paste is
  // very slow. So make the area wide instead.
  if (webkit) { te.style.width = "1000px"; }
  else { te.setAttribute("wrap", "off"); }
  // If border: 0; -- iOS fails to open keyboard (issue #1287)
  if (ios) { te.style.border = "1px solid black"; }
  disableBrowserMagic(te);
  return div
}

// The publicly visible API. Note that methodOp(f) means
// 'wrap f in an operation, performed on its `this` parameter'.

// This is not the complete set of editor methods. Most of the
// methods defined on the Doc type are also injected into
// CodeMirror.prototype, for backwards compatibility and
// convenience.

var addEditorMethods = function(CodeMirror) {
  var optionHandlers = CodeMirror.optionHandlers;

  var helpers = CodeMirror.helpers = {};

  CodeMirror.prototype = {
    constructor: CodeMirror,
    focus: function(){window.focus(); this.display.input.focus();},

    setOption: function(option, value) {
      var options = this.options, old = options[option];
      if (options[option] == value && option != "mode") { return }
      options[option] = value;
      if (optionHandlers.hasOwnProperty(option))
        { operation(this, optionHandlers[option])(this, value, old); }
      signal(this, "optionChange", this, option);
    },

    getOption: function(option) {return this.options[option]},
    getDoc: function() {return this.doc},

    addKeyMap: function(map$$1, bottom) {
      this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map$$1));
    },
    removeKeyMap: function(map$$1) {
      var maps = this.state.keyMaps;
      for (var i = 0; i < maps.length; ++i)
        { if (maps[i] == map$$1 || maps[i].name == map$$1) {
          maps.splice(i, 1);
          return true
        } }
    },

    addOverlay: methodOp(function(spec, options) {
      var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
      if (mode.startState) { throw new Error("Overlays may not be stateful.") }
      insertSorted(this.state.overlays,
                   {mode: mode, modeSpec: spec, opaque: options && options.opaque,
                    priority: (options && options.priority) || 0},
                   function (overlay) { return overlay.priority; });
      this.state.modeGen++;
      regChange(this);
    }),
    removeOverlay: methodOp(function(spec) {
      var this$1 = this;

      var overlays = this.state.overlays;
      for (var i = 0; i < overlays.length; ++i) {
        var cur = overlays[i].modeSpec;
        if (cur == spec || typeof spec == "string" && cur.name == spec) {
          overlays.splice(i, 1);
          this$1.state.modeGen++;
          regChange(this$1);
          return
        }
      }
    }),

    indentLine: methodOp(function(n, dir, aggressive) {
      if (typeof dir != "string" && typeof dir != "number") {
        if (dir == null) { dir = this.options.smartIndent ? "smart" : "prev"; }
        else { dir = dir ? "add" : "subtract"; }
      }
      if (isLine(this.doc, n)) { indentLine(this, n, dir, aggressive); }
    }),
    indentSelection: methodOp(function(how) {
      var this$1 = this;

      var ranges = this.doc.sel.ranges, end = -1;
      for (var i = 0; i < ranges.length; i++) {
        var range$$1 = ranges[i];
        if (!range$$1.empty()) {
          var from = range$$1.from(), to = range$$1.to();
          var start = Math.max(end, from.line);
          end = Math.min(this$1.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
          for (var j = start; j < end; ++j)
            { indentLine(this$1, j, how); }
          var newRanges = this$1.doc.sel.ranges;
          if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0)
            { replaceOneSelection(this$1.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll); }
        } else if (range$$1.head.line > end) {
          indentLine(this$1, range$$1.head.line, how, true);
          end = range$$1.head.line;
          if (i == this$1.doc.sel.primIndex) { ensureCursorVisible(this$1); }
        }
      }
    }),

    // Fetch the parser token for a given character. Useful for hacks
    // that want to inspect the mode state (say, for completion).
    getTokenAt: function(pos, precise) {
      return takeToken(this, pos, precise)
    },

    getLineTokens: function(line, precise) {
      return takeToken(this, Pos(line), precise, true)
    },

    getTokenTypeAt: function(pos) {
      pos = clipPos(this.doc, pos);
      var styles = getLineStyles(this, getLine(this.doc, pos.line));
      var before = 0, after = (styles.length - 1) / 2, ch = pos.ch;
      var type;
      if (ch == 0) { type = styles[2]; }
      else { for (;;) {
        var mid = (before + after) >> 1;
        if ((mid ? styles[mid * 2 - 1] : 0) >= ch) { after = mid; }
        else if (styles[mid * 2 + 1] < ch) { before = mid + 1; }
        else { type = styles[mid * 2 + 2]; break }
      } }
      var cut = type ? type.indexOf("overlay ") : -1;
      return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1)
    },

    getModeAt: function(pos) {
      var mode = this.doc.mode;
      if (!mode.innerMode) { return mode }
      return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode
    },

    getHelper: function(pos, type) {
      return this.getHelpers(pos, type)[0]
    },

    getHelpers: function(pos, type) {
      var this$1 = this;

      var found = [];
      if (!helpers.hasOwnProperty(type)) { return found }
      var help = helpers[type], mode = this.getModeAt(pos);
      if (typeof mode[type] == "string") {
        if (help[mode[type]]) { found.push(help[mode[type]]); }
      } else if (mode[type]) {
        for (var i = 0; i < mode[type].length; i++) {
          var val = help[mode[type][i]];
          if (val) { found.push(val); }
        }
      } else if (mode.helperType && help[mode.helperType]) {
        found.push(help[mode.helperType]);
      } else if (help[mode.name]) {
        found.push(help[mode.name]);
      }
      for (var i$1 = 0; i$1 < help._global.length; i$1++) {
        var cur = help._global[i$1];
        if (cur.pred(mode, this$1) && indexOf(found, cur.val) == -1)
          { found.push(cur.val); }
      }
      return found
    },

    getStateAfter: function(line, precise) {
      var doc = this.doc;
      line = clipLine(doc, line == null ? doc.first + doc.size - 1: line);
      return getStateBefore(this, line + 1, precise)
    },

    cursorCoords: function(start, mode) {
      var pos, range$$1 = this.doc.sel.primary();
      if (start == null) { pos = range$$1.head; }
      else if (typeof start == "object") { pos = clipPos(this.doc, start); }
      else { pos = start ? range$$1.from() : range$$1.to(); }
      return cursorCoords(this, pos, mode || "page")
    },

    charCoords: function(pos, mode) {
      return charCoords(this, clipPos(this.doc, pos), mode || "page")
    },

    coordsChar: function(coords, mode) {
      coords = fromCoordSystem(this, coords, mode || "page");
      return coordsChar(this, coords.left, coords.top)
    },

    lineAtHeight: function(height, mode) {
      height = fromCoordSystem(this, {top: height, left: 0}, mode || "page").top;
      return lineAtHeight(this.doc, height + this.display.viewOffset)
    },
    heightAtLine: function(line, mode, includeWidgets) {
      var end = false, lineObj;
      if (typeof line == "number") {
        var last = this.doc.first + this.doc.size - 1;
        if (line < this.doc.first) { line = this.doc.first; }
        else if (line > last) { line = last; end = true; }
        lineObj = getLine(this.doc, line);
      } else {
        lineObj = line;
      }
      return intoCoordSystem(this, lineObj, {top: 0, left: 0}, mode || "page", includeWidgets || end).top +
        (end ? this.doc.height - heightAtLine(lineObj) : 0)
    },

    defaultTextHeight: function() { return textHeight(this.display) },
    defaultCharWidth: function() { return charWidth(this.display) },

    getViewport: function() { return {from: this.display.viewFrom, to: this.display.viewTo}},

    addWidget: function(pos, node, scroll, vert, horiz) {
      var display = this.display;
      pos = cursorCoords(this, clipPos(this.doc, pos));
      var top = pos.bottom, left = pos.left;
      node.style.position = "absolute";
      node.setAttribute("cm-ignore-events", "true");
      this.display.input.setUneditable(node);
      display.sizer.appendChild(node);
      if (vert == "over") {
        top = pos.top;
      } else if (vert == "above" || vert == "near") {
        var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
        hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
        // Default to positioning above (if specified and possible); otherwise default to positioning below
        if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
          { top = pos.top - node.offsetHeight; }
        else if (pos.bottom + node.offsetHeight <= vspace)
          { top = pos.bottom; }
        if (left + node.offsetWidth > hspace)
          { left = hspace - node.offsetWidth; }
      }
      node.style.top = top + "px";
      node.style.left = node.style.right = "";
      if (horiz == "right") {
        left = display.sizer.clientWidth - node.offsetWidth;
        node.style.right = "0px";
      } else {
        if (horiz == "left") { left = 0; }
        else if (horiz == "middle") { left = (display.sizer.clientWidth - node.offsetWidth) / 2; }
        node.style.left = left + "px";
      }
      if (scroll)
        { scrollIntoView(this, {left: left, top: top, right: left + node.offsetWidth, bottom: top + node.offsetHeight}); }
    },

    triggerOnKeyDown: methodOp(onKeyDown),
    triggerOnKeyPress: methodOp(onKeyPress),
    triggerOnKeyUp: onKeyUp,

    execCommand: function(cmd) {
      if (commands.hasOwnProperty(cmd))
        { return commands[cmd].call(null, this) }
    },

    triggerElectric: methodOp(function(text) { triggerElectric(this, text); }),

    findPosH: function(from, amount, unit, visually) {
      var this$1 = this;

      var dir = 1;
      if (amount < 0) { dir = -1; amount = -amount; }
      var cur = clipPos(this.doc, from);
      for (var i = 0; i < amount; ++i) {
        cur = findPosH(this$1.doc, cur, dir, unit, visually);
        if (cur.hitSide) { break }
      }
      return cur
    },

    moveH: methodOp(function(dir, unit) {
      var this$1 = this;

      this.extendSelectionsBy(function (range$$1) {
        if (this$1.display.shift || this$1.doc.extend || range$$1.empty())
          { return findPosH(this$1.doc, range$$1.head, dir, unit, this$1.options.rtlMoveVisually) }
        else
          { return dir < 0 ? range$$1.from() : range$$1.to() }
      }, sel_move);
    }),

    deleteH: methodOp(function(dir, unit) {
      var sel = this.doc.sel, doc = this.doc;
      if (sel.somethingSelected())
        { doc.replaceSelection("", null, "+delete"); }
      else
        { deleteNearSelection(this, function (range$$1) {
          var other = findPosH(doc, range$$1.head, dir, unit, false);
          return dir < 0 ? {from: other, to: range$$1.head} : {from: range$$1.head, to: other}
        }); }
    }),

    findPosV: function(from, amount, unit, goalColumn) {
      var this$1 = this;

      var dir = 1, x = goalColumn;
      if (amount < 0) { dir = -1; amount = -amount; }
      var cur = clipPos(this.doc, from);
      for (var i = 0; i < amount; ++i) {
        var coords = cursorCoords(this$1, cur, "div");
        if (x == null) { x = coords.left; }
        else { coords.left = x; }
        cur = findPosV(this$1, coords, dir, unit);
        if (cur.hitSide) { break }
      }
      return cur
    },

    moveV: methodOp(function(dir, unit) {
      var this$1 = this;

      var doc = this.doc, goals = [];
      var collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
      doc.extendSelectionsBy(function (range$$1) {
        if (collapse)
          { return dir < 0 ? range$$1.from() : range$$1.to() }
        var headPos = cursorCoords(this$1, range$$1.head, "div");
        if (range$$1.goalColumn != null) { headPos.left = range$$1.goalColumn; }
        goals.push(headPos.left);
        var pos = findPosV(this$1, headPos, dir, unit);
        if (unit == "page" && range$$1 == doc.sel.primary())
          { addToScrollTop(this$1, charCoords(this$1, pos, "div").top - headPos.top); }
        return pos
      }, sel_move);
      if (goals.length) { for (var i = 0; i < doc.sel.ranges.length; i++)
        { doc.sel.ranges[i].goalColumn = goals[i]; } }
    }),

    // Find the word at the given position (as returned by coordsChar).
    findWordAt: function(pos) {
      var doc = this.doc, line = getLine(doc, pos.line).text;
      var start = pos.ch, end = pos.ch;
      if (line) {
        var helper = this.getHelper(pos, "wordChars");
        if ((pos.sticky == "before" || end == line.length) && start) { --start; } else { ++end; }
        var startChar = line.charAt(start);
        var check = isWordChar(startChar, helper)
          ? function (ch) { return isWordChar(ch, helper); }
          : /\s/.test(startChar) ? function (ch) { return /\s/.test(ch); }
          : function (ch) { return (!/\s/.test(ch) && !isWordChar(ch)); };
        while (start > 0 && check(line.charAt(start - 1))) { --start; }
        while (end < line.length && check(line.charAt(end))) { ++end; }
      }
      return new Range(Pos(pos.line, start), Pos(pos.line, end))
    },

    toggleOverwrite: function(value) {
      if (value != null && value == this.state.overwrite) { return }
      if (this.state.overwrite = !this.state.overwrite)
        { addClass(this.display.cursorDiv, "CodeMirror-overwrite"); }
      else
        { rmClass(this.display.cursorDiv, "CodeMirror-overwrite"); }

      signal(this, "overwriteToggle", this, this.state.overwrite);
    },
    hasFocus: function() { return this.display.input.getField() == activeElt() },
    isReadOnly: function() { return !!(this.options.readOnly || this.doc.cantEdit) },

    scrollTo: methodOp(function (x, y) { scrollToCoords(this, x, y); }),
    getScrollInfo: function() {
      var scroller = this.display.scroller;
      return {left: scroller.scrollLeft, top: scroller.scrollTop,
              height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
              width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
              clientHeight: displayHeight(this), clientWidth: displayWidth(this)}
    },

    scrollIntoView: methodOp(function(range$$1, margin) {
      if (range$$1 == null) {
        range$$1 = {from: this.doc.sel.primary().head, to: null};
        if (margin == null) { margin = this.options.cursorScrollMargin; }
      } else if (typeof range$$1 == "number") {
        range$$1 = {from: Pos(range$$1, 0), to: null};
      } else if (range$$1.from == null) {
        range$$1 = {from: range$$1, to: null};
      }
      if (!range$$1.to) { range$$1.to = range$$1.from; }
      range$$1.margin = margin || 0;

      if (range$$1.from.line != null) {
        scrollToRange(this, range$$1);
      } else {
        scrollToCoordsRange(this, range$$1.from, range$$1.to, range$$1.margin);
      }
    }),

    setSize: methodOp(function(width, height) {
      var this$1 = this;

      var interpret = function (val) { return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val; };
      if (width != null) { this.display.wrapper.style.width = interpret(width); }
      if (height != null) { this.display.wrapper.style.height = interpret(height); }
      if (this.options.lineWrapping) { clearLineMeasurementCache(this); }
      var lineNo$$1 = this.display.viewFrom;
      this.doc.iter(lineNo$$1, this.display.viewTo, function (line) {
        if (line.widgets) { for (var i = 0; i < line.widgets.length; i++)
          { if (line.widgets[i].noHScroll) { regLineChange(this$1, lineNo$$1, "widget"); break } } }
        ++lineNo$$1;
      });
      this.curOp.forceUpdate = true;
      signal(this, "refresh", this);
    }),

    operation: function(f){return runInOp(this, f)},

    refresh: methodOp(function() {
      var oldHeight = this.display.cachedTextHeight;
      regChange(this);
      this.curOp.forceUpdate = true;
      clearCaches(this);
      scrollToCoords(this, this.doc.scrollLeft, this.doc.scrollTop);
      updateGutterSpace(this);
      if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5)
        { estimateLineHeights(this); }
      signal(this, "refresh", this);
    }),

    swapDoc: methodOp(function(doc) {
      var old = this.doc;
      old.cm = null;
      attachDoc(this, doc);
      clearCaches(this);
      this.display.input.reset();
      scrollToCoords(this, doc.scrollLeft, doc.scrollTop);
      this.curOp.forceScroll = true;
      signalLater(this, "swapDoc", this, old);
      return old
    }),

    getInputField: function(){return this.display.input.getField()},
    getWrapperElement: function(){return this.display.wrapper},
    getScrollerElement: function(){return this.display.scroller},
    getGutterElement: function(){return this.display.gutters}
  };
  eventMixin(CodeMirror);

  CodeMirror.registerHelper = function(type, name, value) {
    if (!helpers.hasOwnProperty(type)) { helpers[type] = CodeMirror[type] = {_global: []}; }
    helpers[type][name] = value;
  };
  CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
    CodeMirror.registerHelper(type, name, value);
    helpers[type]._global.push({pred: predicate, val: value});
  };
};

// Used for horizontal relative motion. Dir is -1 or 1 (left or
// right), unit can be "char", "column" (like char, but doesn't
// cross line boundaries), "word" (across next word), or "group" (to
// the start of next group of word or non-word-non-whitespace
// chars). The visually param controls whether, in right-to-left
// text, direction 1 means to move towards the next index in the
// string, or towards the character to the right of the current
// position. The resulting position will have a hitSide=true
// property if it reached the end of the document.
function findPosH(doc, pos, dir, unit, visually) {
  var oldPos = pos;
  var origDir = dir;
  var lineObj = getLine(doc, pos.line);
  function findNextLine() {
    var l = pos.line + dir;
    if (l < doc.first || l >= doc.first + doc.size) { return false }
    pos = new Pos(l, pos.ch, pos.sticky);
    return lineObj = getLine(doc, l)
  }
  function moveOnce(boundToLine) {
    var next;
    if (visually) {
      next = moveVisually(doc.cm, lineObj, pos, dir);
    } else {
      next = moveLogically(lineObj, pos, dir);
    }
    if (next == null) {
      if (!boundToLine && findNextLine())
        { pos = endOfLine(visually, doc.cm, lineObj, pos.line, dir); }
      else
        { return false }
    } else {
      pos = next;
    }
    return true
  }

  if (unit == "char") {
    moveOnce();
  } else if (unit == "column") {
    moveOnce(true);
  } else if (unit == "word" || unit == "group") {
    var sawType = null, group = unit == "group";
    var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
    for (var first = true;; first = false) {
      if (dir < 0 && !moveOnce(!first)) { break }
      var cur = lineObj.text.charAt(pos.ch) || "\n";
      var type = isWordChar(cur, helper) ? "w"
        : group && cur == "\n" ? "n"
        : !group || /\s/.test(cur) ? null
        : "p";
      if (group && !first && !type) { type = "s"; }
      if (sawType && sawType != type) {
        if (dir < 0) {dir = 1; moveOnce(); pos.sticky = "after";}
        break
      }

      if (type) { sawType = type; }
      if (dir > 0 && !moveOnce(!first)) { break }
    }
  }
  var result = skipAtomic(doc, pos, oldPos, origDir, true);
  if (equalCursorPos(oldPos, result)) { result.hitSide = true; }
  return result
}

// For relative vertical movement. Dir may be -1 or 1. Unit can be
// "page" or "line". The resulting position will have a hitSide=true
// property if it reached the end of the document.
function findPosV(cm, pos, dir, unit) {
  var doc = cm.doc, x = pos.left, y;
  if (unit == "page") {
    var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
    var moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3);
    y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount;

  } else if (unit == "line") {
    y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
  }
  var target;
  for (;;) {
    target = coordsChar(cm, x, y);
    if (!target.outside) { break }
    if (dir < 0 ? y <= 0 : y >= doc.height) { target.hitSide = true; break }
    y += dir * 5;
  }
  return target
}

// CONTENTEDITABLE INPUT STYLE

var ContentEditableInput = function(cm) {
  this.cm = cm;
  this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
  this.polling = new Delayed();
  this.composing = null;
  this.gracePeriod = false;
  this.readDOMTimeout = null;
};

ContentEditableInput.prototype.init = function (display) {
    var this$1 = this;

  var input = this, cm = input.cm;
  var div = input.div = display.lineDiv;
  disableBrowserMagic(div, cm.options.spellcheck);

  on(div, "paste", function (e) {
    if (signalDOMEvent(cm, e) || handlePaste(e, cm)) { return }
    // IE doesn't fire input events, so we schedule a read for the pasted content in this way
    if (ie_version <= 11) { setTimeout(operation(cm, function () { return this$1.updateFromDOM(); }), 20); }
  });

  on(div, "compositionstart", function (e) {
    this$1.composing = {data: e.data, done: false};
  });
  on(div, "compositionupdate", function (e) {
    if (!this$1.composing) { this$1.composing = {data: e.data, done: false}; }
  });
  on(div, "compositionend", function (e) {
    if (this$1.composing) {
      if (e.data != this$1.composing.data) { this$1.readFromDOMSoon(); }
      this$1.composing.done = true;
    }
  });

  on(div, "touchstart", function () { return input.forceCompositionEnd(); });

  on(div, "input", function () {
    if (!this$1.composing) { this$1.readFromDOMSoon(); }
  });

  function onCopyCut(e) {
    if (signalDOMEvent(cm, e)) { return }
    if (cm.somethingSelected()) {
      setLastCopied({lineWise: false, text: cm.getSelections()});
      if (e.type == "cut") { cm.replaceSelection("", null, "cut"); }
    } else if (!cm.options.lineWiseCopyCut) {
      return
    } else {
      var ranges = copyableRanges(cm);
      setLastCopied({lineWise: true, text: ranges.text});
      if (e.type == "cut") {
        cm.operation(function () {
          cm.setSelections(ranges.ranges, 0, sel_dontScroll);
          cm.replaceSelection("", null, "cut");
        });
      }
    }
    if (e.clipboardData) {
      e.clipboardData.clearData();
      var content = lastCopied.text.join("\n");
      // iOS exposes the clipboard API, but seems to discard content inserted into it
      e.clipboardData.setData("Text", content);
      if (e.clipboardData.getData("Text") == content) {
        e.preventDefault();
        return
      }
    }
    // Old-fashioned briefly-focus-a-textarea hack
    var kludge = hiddenTextarea(), te = kludge.firstChild;
    cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
    te.value = lastCopied.text.join("\n");
    var hadFocus = document.activeElement;
    selectInput(te);
    setTimeout(function () {
      cm.display.lineSpace.removeChild(kludge);
      hadFocus.focus();
      if (hadFocus == div) { input.showPrimarySelection(); }
    }, 50);
  }
  on(div, "copy", onCopyCut);
  on(div, "cut", onCopyCut);
};

ContentEditableInput.prototype.prepareSelection = function () {
  var result = prepareSelection(this.cm, false);
  result.focus = this.cm.state.focused;
  return result
};

ContentEditableInput.prototype.showSelection = function (info, takeFocus) {
  if (!info || !this.cm.display.view.length) { return }
  if (info.focus || takeFocus) { this.showPrimarySelection(); }
  this.showMultipleSelections(info);
};

ContentEditableInput.prototype.showPrimarySelection = function () {
  var sel = window.getSelection(), cm = this.cm, prim = cm.doc.sel.primary();
  var from = prim.from(), to = prim.to();

  if (cm.display.viewTo == cm.display.viewFrom || from.line >= cm.display.viewTo || to.line < cm.display.viewFrom) {
    sel.removeAllRanges();
    return
  }

  var curAnchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
  var curFocus = domToPos(cm, sel.focusNode, sel.focusOffset);
  if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad &&
      cmp(minPos(curAnchor, curFocus), from) == 0 &&
      cmp(maxPos(curAnchor, curFocus), to) == 0)
    { return }

  var view = cm.display.view;
  var start = (from.line >= cm.display.viewFrom && posToDOM(cm, from)) ||
      {node: view[0].measure.map[2], offset: 0};
  var end = to.line < cm.display.viewTo && posToDOM(cm, to);
  if (!end) {
    var measure = view[view.length - 1].measure;
    var map$$1 = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
    end = {node: map$$1[map$$1.length - 1], offset: map$$1[map$$1.length - 2] - map$$1[map$$1.length - 3]};
  }

  if (!start || !end) {
    sel.removeAllRanges();
    return
  }

  var old = sel.rangeCount && sel.getRangeAt(0), rng;
  try { rng = range(start.node, start.offset, end.offset, end.node); }
  catch(e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible
  if (rng) {
    if (!gecko && cm.state.focused) {
      sel.collapse(start.node, start.offset);
      if (!rng.collapsed) {
        sel.removeAllRanges();
        sel.addRange(rng);
      }
    } else {
      sel.removeAllRanges();
      sel.addRange(rng);
    }
    if (old && sel.anchorNode == null) { sel.addRange(old); }
    else if (gecko) { this.startGracePeriod(); }
  }
  this.rememberSelection();
};

ContentEditableInput.prototype.startGracePeriod = function () {
    var this$1 = this;

  clearTimeout(this.gracePeriod);
  this.gracePeriod = setTimeout(function () {
    this$1.gracePeriod = false;
    if (this$1.selectionChanged())
      { this$1.cm.operation(function () { return this$1.cm.curOp.selectionChanged = true; }); }
  }, 20);
};

ContentEditableInput.prototype.showMultipleSelections = function (info) {
  removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
  removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
};

ContentEditableInput.prototype.rememberSelection = function () {
  var sel = window.getSelection();
  this.lastAnchorNode = sel.anchorNode; this.lastAnchorOffset = sel.anchorOffset;
  this.lastFocusNode = sel.focusNode; this.lastFocusOffset = sel.focusOffset;
};

ContentEditableInput.prototype.selectionInEditor = function () {
  var sel = window.getSelection();
  if (!sel.rangeCount) { return false }
  var node = sel.getRangeAt(0).commonAncestorContainer;
  return contains(this.div, node)
};

ContentEditableInput.prototype.focus = function () {
  if (this.cm.options.readOnly != "nocursor") {
    if (!this.selectionInEditor())
      { this.showSelection(this.prepareSelection(), true); }
    this.div.focus();
  }
};
ContentEditableInput.prototype.blur = function () { this.div.blur(); };
ContentEditableInput.prototype.getField = function () { return this.div };

ContentEditableInput.prototype.supportsTouch = function () { return true };

ContentEditableInput.prototype.receivedFocus = function () {
  var input = this;
  if (this.selectionInEditor())
    { this.pollSelection(); }
  else
    { runInOp(this.cm, function () { return input.cm.curOp.selectionChanged = true; }); }

  function poll() {
    if (input.cm.state.focused) {
      input.pollSelection();
      input.polling.set(input.cm.options.pollInterval, poll);
    }
  }
  this.polling.set(this.cm.options.pollInterval, poll);
};

ContentEditableInput.prototype.selectionChanged = function () {
  var sel = window.getSelection();
  return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset ||
    sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset
};

ContentEditableInput.prototype.pollSelection = function () {
  if (this.readDOMTimeout != null || this.gracePeriod || !this.selectionChanged()) { return }
  var sel = window.getSelection(), cm = this.cm;
  // On Android Chrome (version 56, at least), backspacing into an
  // uneditable block element will put the cursor in that element,
  // and then, because it's not editable, hide the virtual keyboard.
  // Because Android doesn't allow us to actually detect backspace
  // presses in a sane way, this code checks for when that happens
  // and simulates a backspace press in this case.
  if (android && chrome && this.cm.options.gutters.length && isInGutter(sel.anchorNode)) {
    this.cm.triggerOnKeyDown({type: "keydown", keyCode: 8, preventDefault: Math.abs});
    this.blur();
    this.focus();
    return
  }
  if (this.composing) { return }
  this.rememberSelection();
  var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
  var head = domToPos(cm, sel.focusNode, sel.focusOffset);
  if (anchor && head) { runInOp(cm, function () {
    setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);
    if (anchor.bad || head.bad) { cm.curOp.selectionChanged = true; }
  }); }
};

ContentEditableInput.prototype.pollContent = function () {
  if (this.readDOMTimeout != null) {
    clearTimeout(this.readDOMTimeout);
    this.readDOMTimeout = null;
  }

  var cm = this.cm, display = cm.display, sel = cm.doc.sel.primary();
  var from = sel.from(), to = sel.to();
  if (from.ch == 0 && from.line > cm.firstLine())
    { from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length); }
  if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine())
    { to = Pos(to.line + 1, 0); }
  if (from.line < display.viewFrom || to.line > display.viewTo - 1) { return false }

  var fromIndex, fromLine, fromNode;
  if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
    fromLine = lineNo(display.view[0].line);
    fromNode = display.view[0].node;
  } else {
    fromLine = lineNo(display.view[fromIndex].line);
    fromNode = display.view[fromIndex - 1].node.nextSibling;
  }
  var toIndex = findViewIndex(cm, to.line);
  var toLine, toNode;
  if (toIndex == display.view.length - 1) {
    toLine = display.viewTo - 1;
    toNode = display.lineDiv.lastChild;
  } else {
    toLine = lineNo(display.view[toIndex + 1].line) - 1;
    toNode = display.view[toIndex + 1].node.previousSibling;
  }

  if (!fromNode) { return false }
  var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
  var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));
  while (newText.length > 1 && oldText.length > 1) {
    if (lst(newText) == lst(oldText)) { newText.pop(); oldText.pop(); toLine--; }
    else if (newText[0] == oldText[0]) { newText.shift(); oldText.shift(); fromLine++; }
    else { break }
  }

  var cutFront = 0, cutEnd = 0;
  var newTop = newText[0], oldTop = oldText[0], maxCutFront = Math.min(newTop.length, oldTop.length);
  while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront))
    { ++cutFront; }
  var newBot = lst(newText), oldBot = lst(oldText);
  var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0),
                           oldBot.length - (oldText.length == 1 ? cutFront : 0));
  while (cutEnd < maxCutEnd &&
         newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1))
    { ++cutEnd; }
  // Try to move start of change to start of selection if ambiguous
  if (newText.length == 1 && oldText.length == 1 && fromLine == from.line) {
    while (cutFront && cutFront > from.ch &&
           newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
      cutFront--;
      cutEnd++;
    }
  }

  newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "");
  newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");

  var chFrom = Pos(fromLine, cutFront);
  var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);
  if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
    replaceRange(cm.doc, newText, chFrom, chTo, "+input");
    return true
  }
};

ContentEditableInput.prototype.ensurePolled = function () {
  this.forceCompositionEnd();
};
ContentEditableInput.prototype.reset = function () {
  this.forceCompositionEnd();
};
ContentEditableInput.prototype.forceCompositionEnd = function () {
  if (!this.composing) { return }
  clearTimeout(this.readDOMTimeout);
  this.composing = null;
  this.updateFromDOM();
  this.div.blur();
  this.div.focus();
};
ContentEditableInput.prototype.readFromDOMSoon = function () {
    var this$1 = this;

  if (this.readDOMTimeout != null) { return }
  this.readDOMTimeout = setTimeout(function () {
    this$1.readDOMTimeout = null;
    if (this$1.composing) {
      if (this$1.composing.done) { this$1.composing = null; }
      else { return }
    }
    this$1.updateFromDOM();
  }, 80);
};

ContentEditableInput.prototype.updateFromDOM = function () {
    var this$1 = this;

  if (this.cm.isReadOnly() || !this.pollContent())
    { runInOp(this.cm, function () { return regChange(this$1.cm); }); }
};

ContentEditableInput.prototype.setUneditable = function (node) {
  node.contentEditable = "false";
};

ContentEditableInput.prototype.onKeyPress = function (e) {
  if (e.charCode == 0) { return }
  e.preventDefault();
  if (!this.cm.isReadOnly())
    { operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0); }
};

ContentEditableInput.prototype.readOnlyChanged = function (val) {
  this.div.contentEditable = String(val != "nocursor");
};

ContentEditableInput.prototype.onContextMenu = function () {};
ContentEditableInput.prototype.resetPosition = function () {};

ContentEditableInput.prototype.needsContentAttribute = true;

function posToDOM(cm, pos) {
  var view = findViewForLine(cm, pos.line);
  if (!view || view.hidden) { return null }
  var line = getLine(cm.doc, pos.line);
  var info = mapFromLineView(view, line, pos.line);

  var order = getOrder(line, cm.doc.direction), side = "left";
  if (order) {
    var partPos = getBidiPartAt(order, pos.ch);
    side = partPos % 2 ? "right" : "left";
  }
  var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
  result.offset = result.collapse == "right" ? result.end : result.start;
  return result
}

function isInGutter(node) {
  for (var scan = node; scan; scan = scan.parentNode)
    { if (/CodeMirror-gutter-wrapper/.test(scan.className)) { return true } }
  return false
}

function badPos(pos, bad) { if (bad) { pos.bad = true; } return pos }

function domTextBetween(cm, from, to, fromLine, toLine) {
  var text = "", closing = false, lineSep = cm.doc.lineSeparator();
  function recognizeMarker(id) { return function (marker) { return marker.id == id; } }
  function close() {
    if (closing) {
      text += lineSep;
      closing = false;
    }
  }
  function addText(str) {
    if (str) {
      close();
      text += str;
    }
  }
  function walk(node) {
    if (node.nodeType == 1) {
      var cmText = node.getAttribute("cm-text");
      if (cmText != null) {
        addText(cmText || node.textContent.replace(/\u200b/g, ""));
        return
      }
      var markerID = node.getAttribute("cm-marker"), range$$1;
      if (markerID) {
        var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
        if (found.length && (range$$1 = found[0].find()))
          { addText(getBetween(cm.doc, range$$1.from, range$$1.to).join(lineSep)); }
        return
      }
      if (node.getAttribute("contenteditable") == "false") { return }
      var isBlock = /^(pre|div|p)$/i.test(node.nodeName);
      if (isBlock) { close(); }
      for (var i = 0; i < node.childNodes.length; i++)
        { walk(node.childNodes[i]); }
      if (isBlock) { closing = true; }
    } else if (node.nodeType == 3) {
      addText(node.nodeValue);
    }
  }
  for (;;) {
    walk(from);
    if (from == to) { break }
    from = from.nextSibling;
  }
  return text
}

function domToPos(cm, node, offset) {
  var lineNode;
  if (node == cm.display.lineDiv) {
    lineNode = cm.display.lineDiv.childNodes[offset];
    if (!lineNode) { return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true) }
    node = null; offset = 0;
  } else {
    for (lineNode = node;; lineNode = lineNode.parentNode) {
      if (!lineNode || lineNode == cm.display.lineDiv) { return null }
      if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) { break }
    }
  }
  for (var i = 0; i < cm.display.view.length; i++) {
    var lineView = cm.display.view[i];
    if (lineView.node == lineNode)
      { return locateNodeInLineView(lineView, node, offset) }
  }
}

function locateNodeInLineView(lineView, node, offset) {
  var wrapper = lineView.text.firstChild, bad = false;
  if (!node || !contains(wrapper, node)) { return badPos(Pos(lineNo(lineView.line), 0), true) }
  if (node == wrapper) {
    bad = true;
    node = wrapper.childNodes[offset];
    offset = 0;
    if (!node) {
      var line = lineView.rest ? lst(lineView.rest) : lineView.line;
      return badPos(Pos(lineNo(line), line.text.length), bad)
    }
  }

  var textNode = node.nodeType == 3 ? node : null, topNode = node;
  if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
    textNode = node.firstChild;
    if (offset) { offset = textNode.nodeValue.length; }
  }
  while (topNode.parentNode != wrapper) { topNode = topNode.parentNode; }
  var measure = lineView.measure, maps = measure.maps;

  function find(textNode, topNode, offset) {
    for (var i = -1; i < (maps ? maps.length : 0); i++) {
      var map$$1 = i < 0 ? measure.map : maps[i];
      for (var j = 0; j < map$$1.length; j += 3) {
        var curNode = map$$1[j + 2];
        if (curNode == textNode || curNode == topNode) {
          var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
          var ch = map$$1[j] + offset;
          if (offset < 0 || curNode != textNode) { ch = map$$1[j + (offset ? 1 : 0)]; }
          return Pos(line, ch)
        }
      }
    }
  }
  var found = find(textNode, topNode, offset);
  if (found) { return badPos(found, bad) }

  // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems
  for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
    found = find(after, after.firstChild, 0);
    if (found)
      { return badPos(Pos(found.line, found.ch - dist), bad) }
    else
      { dist += after.textContent.length; }
  }
  for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
    found = find(before, before.firstChild, -1);
    if (found)
      { return badPos(Pos(found.line, found.ch + dist$1), bad) }
    else
      { dist$1 += before.textContent.length; }
  }
}

// TEXTAREA INPUT STYLE

var TextareaInput = function(cm) {
  this.cm = cm;
  // See input.poll and input.reset
  this.prevInput = "";

  // Flag that indicates whether we expect input to appear real soon
  // now (after some event like 'keypress' or 'input') and are
  // polling intensively.
  this.pollingFast = false;
  // Self-resetting timeout for the poller
  this.polling = new Delayed();
  // Tracks when input.reset has punted to just putting a short
  // string into the textarea instead of the full selection.
  this.inaccurateSelection = false;
  // Used to work around IE issue with selection being forgotten when focus moves away from textarea
  this.hasSelection = false;
  this.composing = null;
};

TextareaInput.prototype.init = function (display) {
    var this$1 = this;

  var input = this, cm = this.cm;

  // Wraps and hides input textarea
  var div = this.wrapper = hiddenTextarea();
  // The semihidden textarea that is focused when the editor is
  // focused, and receives input.
  var te = this.textarea = div.firstChild;
  display.wrapper.insertBefore(div, display.wrapper.firstChild);

  // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)
  if (ios) { te.style.width = "0px"; }

  on(te, "input", function () {
    if (ie && ie_version >= 9 && this$1.hasSelection) { this$1.hasSelection = null; }
    input.poll();
  });

  on(te, "paste", function (e) {
    if (signalDOMEvent(cm, e) || handlePaste(e, cm)) { return }

    cm.state.pasteIncoming = true;
    input.fastPoll();
  });

  function prepareCopyCut(e) {
    if (signalDOMEvent(cm, e)) { return }
    if (cm.somethingSelected()) {
      setLastCopied({lineWise: false, text: cm.getSelections()});
      if (input.inaccurateSelection) {
        input.prevInput = "";
        input.inaccurateSelection = false;
        te.value = lastCopied.text.join("\n");
        selectInput(te);
      }
    } else if (!cm.options.lineWiseCopyCut) {
      return
    } else {
      var ranges = copyableRanges(cm);
      setLastCopied({lineWise: true, text: ranges.text});
      if (e.type == "cut") {
        cm.setSelections(ranges.ranges, null, sel_dontScroll);
      } else {
        input.prevInput = "";
        te.value = ranges.text.join("\n");
        selectInput(te);
      }
    }
    if (e.type == "cut") { cm.state.cutIncoming = true; }
  }
  on(te, "cut", prepareCopyCut);
  on(te, "copy", prepareCopyCut);

  on(display.scroller, "paste", function (e) {
    if (eventInWidget(display, e) || signalDOMEvent(cm, e)) { return }
    cm.state.pasteIncoming = true;
    input.focus();
  });

  // Prevent normal selection in the editor (we handle our own)
  on(display.lineSpace, "selectstart", function (e) {
    if (!eventInWidget(display, e)) { e_preventDefault(e); }
  });

  on(te, "compositionstart", function () {
    var start = cm.getCursor("from");
    if (input.composing) { input.composing.range.clear(); }
    input.composing = {
      start: start,
      range: cm.markText(start, cm.getCursor("to"), {className: "CodeMirror-composing"})
    };
  });
  on(te, "compositionend", function () {
    if (input.composing) {
      input.poll();
      input.composing.range.clear();
      input.composing = null;
    }
  });
};

TextareaInput.prototype.prepareSelection = function () {
  // Redraw the selection and/or cursor
  var cm = this.cm, display = cm.display, doc = cm.doc;
  var result = prepareSelection(cm);

  // Move the hidden textarea near the cursor to prevent scrolling artifacts
  if (cm.options.moveInputWithCursor) {
    var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
    var wrapOff = display.wrapper.getBoundingClientRect(), lineOff = display.lineDiv.getBoundingClientRect();
    result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10,
                                        headPos.top + lineOff.top - wrapOff.top));
    result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10,
                                         headPos.left + lineOff.left - wrapOff.left));
  }

  return result
};

TextareaInput.prototype.showSelection = function (drawn) {
  var cm = this.cm, display = cm.display;
  removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
  removeChildrenAndAdd(display.selectionDiv, drawn.selection);
  if (drawn.teTop != null) {
    this.wrapper.style.top = drawn.teTop + "px";
    this.wrapper.style.left = drawn.teLeft + "px";
  }
};

// Reset the input to correspond to the selection (or to be empty,
// when not typing and nothing is selected)
TextareaInput.prototype.reset = function (typing) {
  if (this.contextMenuPending || this.composing) { return }
  var minimal, selected, cm = this.cm, doc = cm.doc;
  if (cm.somethingSelected()) {
    this.prevInput = "";
    var range$$1 = doc.sel.primary();
    minimal = hasCopyEvent &&
      (range$$1.to().line - range$$1.from().line > 100 || (selected = cm.getSelection()).length > 1000);
    var content = minimal ? "-" : selected || cm.getSelection();
    this.textarea.value = content;
    if (cm.state.focused) { selectInput(this.textarea); }
    if (ie && ie_version >= 9) { this.hasSelection = content; }
  } else if (!typing) {
    this.prevInput = this.textarea.value = "";
    if (ie && ie_version >= 9) { this.hasSelection = null; }
  }
  this.inaccurateSelection = minimal;
};

TextareaInput.prototype.getField = function () { return this.textarea };

TextareaInput.prototype.supportsTouch = function () { return false };

TextareaInput.prototype.focus = function () {
  if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
    try { this.textarea.focus(); }
    catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM
  }
};

TextareaInput.prototype.blur = function () { this.textarea.blur(); };

TextareaInput.prototype.resetPosition = function () {
  this.wrapper.style.top = this.wrapper.style.left = 0;
};

TextareaInput.prototype.receivedFocus = function () { this.slowPoll(); };

// Poll for input changes, using the normal rate of polling. This
// runs as long as the editor is focused.
TextareaInput.prototype.slowPoll = function () {
    var this$1 = this;

  if (this.pollingFast) { return }
  this.polling.set(this.cm.options.pollInterval, function () {
    this$1.poll();
    if (this$1.cm.state.focused) { this$1.slowPoll(); }
  });
};

// When an event has just come in that is likely to add or change
// something in the input textarea, we poll faster, to ensure that
// the change appears on the screen quickly.
TextareaInput.prototype.fastPoll = function () {
  var missed = false, input = this;
  input.pollingFast = true;
  function p() {
    var changed = input.poll();
    if (!changed && !missed) {missed = true; input.polling.set(60, p);}
    else {input.pollingFast = false; input.slowPoll();}
  }
  input.polling.set(20, p);
};

// Read input from the textarea, and update the document to match.
// When something is selected, it is present in the textarea, and
// selected (unless it is huge, in which case a placeholder is
// used). When nothing is selected, the cursor sits after previously
// seen text (can be empty), which is stored in prevInput (we must
// not reset the textarea when typing, because that breaks IME).
TextareaInput.prototype.poll = function () {
    var this$1 = this;

  var cm = this.cm, input = this.textarea, prevInput = this.prevInput;
  // Since this is called a *lot*, try to bail out as cheaply as
  // possible when it is clear that nothing happened. hasSelection
  // will be the case when there is a lot of text in the textarea,
  // in which case reading its value would be expensive.
  if (this.contextMenuPending || !cm.state.focused ||
      (hasSelection(input) && !prevInput && !this.composing) ||
      cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq)
    { return false }

  var text = input.value;
  // If nothing changed, bail.
  if (text == prevInput && !cm.somethingSelected()) { return false }
  // Work around nonsensical selection resetting in IE9/10, and
  // inexplicable appearance of private area unicode characters on
  // some key combos in Mac (#2689).
  if (ie && ie_version >= 9 && this.hasSelection === text ||
      mac && /[\uf700-\uf7ff]/.test(text)) {
    cm.display.input.reset();
    return false
  }

  if (cm.doc.sel == cm.display.selForContextMenu) {
    var first = text.charCodeAt(0);
    if (first == 0x200b && !prevInput) { prevInput = "\u200b"; }
    if (first == 0x21da) { this.reset(); return this.cm.execCommand("undo") }
  }
  // Find the part of the input that is actually new
  var same = 0, l = Math.min(prevInput.length, text.length);
  while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) { ++same; }

  runInOp(cm, function () {
    applyTextInput(cm, text.slice(same), prevInput.length - same,
                   null, this$1.composing ? "*compose" : null);

    // Don't leave long text in the textarea, since it makes further polling slow
    if (text.length > 1000 || text.indexOf("\n") > -1) { input.value = this$1.prevInput = ""; }
    else { this$1.prevInput = text; }

    if (this$1.composing) {
      this$1.composing.range.clear();
      this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"),
                                         {className: "CodeMirror-composing"});
    }
  });
  return true
};

TextareaInput.prototype.ensurePolled = function () {
  if (this.pollingFast && this.poll()) { this.pollingFast = false; }
};

TextareaInput.prototype.onKeyPress = function () {
  if (ie && ie_version >= 9) { this.hasSelection = null; }
  this.fastPoll();
};

TextareaInput.prototype.onContextMenu = function (e) {
  var input = this, cm = input.cm, display = cm.display, te = input.textarea;
  var pos = posFromMouse(cm, e), scrollPos = display.scroller.scrollTop;
  if (!pos || presto) { return } // Opera is difficult.

  // Reset the current text selection only if the click is done outside of the selection
  // and 'resetSelectionOnContextMenu' option is true.
  var reset = cm.options.resetSelectionOnContextMenu;
  if (reset && cm.doc.sel.contains(pos) == -1)
    { operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll); }

  var oldCSS = te.style.cssText, oldWrapperCSS = input.wrapper.style.cssText;
  input.wrapper.style.cssText = "position: absolute";
  var wrapperBox = input.wrapper.getBoundingClientRect();
  te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
  var oldScrollY;
  if (webkit) { oldScrollY = window.scrollY; } // Work around Chrome issue (#2712)
  display.input.focus();
  if (webkit) { window.scrollTo(null, oldScrollY); }
  display.input.reset();
  // Adds "Select all" to context menu in FF
  if (!cm.somethingSelected()) { te.value = input.prevInput = " "; }
  input.contextMenuPending = true;
  display.selForContextMenu = cm.doc.sel;
  clearTimeout(display.detectingSelectAll);

  // Select-all will be greyed out if there's nothing to select, so
  // this adds a zero-width space so that we can later check whether
  // it got selected.
  function prepareSelectAllHack() {
    if (te.selectionStart != null) {
      var selected = cm.somethingSelected();
      var extval = "\u200b" + (selected ? te.value : "");
      te.value = "\u21da"; // Used to catch context-menu undo
      te.value = extval;
      input.prevInput = selected ? "" : "\u200b";
      te.selectionStart = 1; te.selectionEnd = extval.length;
      // Re-set this, in case some other handler touched the
      // selection in the meantime.
      display.selForContextMenu = cm.doc.sel;
    }
  }
  function rehide() {
    input.contextMenuPending = false;
    input.wrapper.style.cssText = oldWrapperCSS;
    te.style.cssText = oldCSS;
    if (ie && ie_version < 9) { display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos); }

    // Try to detect the user choosing select-all
    if (te.selectionStart != null) {
      if (!ie || (ie && ie_version < 9)) { prepareSelectAllHack(); }
      var i = 0, poll = function () {
        if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 &&
            te.selectionEnd > 0 && input.prevInput == "\u200b") {
          operation(cm, selectAll)(cm);
        } else if (i++ < 10) {
          display.detectingSelectAll = setTimeout(poll, 500);
        } else {
          display.selForContextMenu = null;
          display.input.reset();
        }
      };
      display.detectingSelectAll = setTimeout(poll, 200);
    }
  }

  if (ie && ie_version >= 9) { prepareSelectAllHack(); }
  if (captureRightClick) {
    e_stop(e);
    var mouseup = function () {
      off(window, "mouseup", mouseup);
      setTimeout(rehide, 20);
    };
    on(window, "mouseup", mouseup);
  } else {
    setTimeout(rehide, 50);
  }
};

TextareaInput.prototype.readOnlyChanged = function (val) {
  if (!val) { this.reset(); }
};

TextareaInput.prototype.setUneditable = function () {};

TextareaInput.prototype.needsContentAttribute = false;

function fromTextArea(textarea, options) {
  options = options ? copyObj(options) : {};
  options.value = textarea.value;
  if (!options.tabindex && textarea.tabIndex)
    { options.tabindex = textarea.tabIndex; }
  if (!options.placeholder && textarea.placeholder)
    { options.placeholder = textarea.placeholder; }
  // Set autofocus to true if this textarea is focused, or if it has
  // autofocus and no other element is focused.
  if (options.autofocus == null) {
    var hasFocus = activeElt();
    options.autofocus = hasFocus == textarea ||
      textarea.getAttribute("autofocus") != null && hasFocus == document.body;
  }

  function save() {textarea.value = cm.getValue();}

  var realSubmit;
  if (textarea.form) {
    on(textarea.form, "submit", save);
    // Deplorable hack to make the submit method do the right thing.
    if (!options.leaveSubmitMethodAlone) {
      var form = textarea.form;
      realSubmit = form.submit;
      try {
        var wrappedSubmit = form.submit = function () {
          save();
          form.submit = realSubmit;
          form.submit();
          form.submit = wrappedSubmit;
        };
      } catch(e) {}
    }
  }

  options.finishInit = function (cm) {
    cm.save = save;
    cm.getTextArea = function () { return textarea; };
    cm.toTextArea = function () {
      cm.toTextArea = isNaN; // Prevent this from being ran twice
      save();
      textarea.parentNode.removeChild(cm.getWrapperElement());
      textarea.style.display = "";
      if (textarea.form) {
        off(textarea.form, "submit", save);
        if (typeof textarea.form.submit == "function")
          { textarea.form.submit = realSubmit; }
      }
    };
  };

  textarea.style.display = "none";
  var cm = CodeMirror$1(function (node) { return textarea.parentNode.insertBefore(node, textarea.nextSibling); },
    options);
  return cm
}

function addLegacyProps(CodeMirror) {
  CodeMirror.off = off;
  CodeMirror.on = on;
  CodeMirror.wheelEventPixels = wheelEventPixels;
  CodeMirror.Doc = Doc;
  CodeMirror.splitLines = splitLinesAuto;
  CodeMirror.countColumn = countColumn;
  CodeMirror.findColumn = findColumn;
  CodeMirror.isWordChar = isWordCharBasic;
  CodeMirror.Pass = Pass;
  CodeMirror.signal = signal;
  CodeMirror.Line = Line;
  CodeMirror.changeEnd = changeEnd;
  CodeMirror.scrollbarModel = scrollbarModel;
  CodeMirror.Pos = Pos;
  CodeMirror.cmpPos = cmp;
  CodeMirror.modes = modes;
  CodeMirror.mimeModes = mimeModes;
  CodeMirror.resolveMode = resolveMode;
  CodeMirror.getMode = getMode;
  CodeMirror.modeExtensions = modeExtensions;
  CodeMirror.extendMode = extendMode;
  CodeMirror.copyState = copyState;
  CodeMirror.startState = startState;
  CodeMirror.innerMode = innerMode;
  CodeMirror.commands = commands;
  CodeMirror.keyMap = keyMap;
  CodeMirror.keyName = keyName;
  CodeMirror.isModifierKey = isModifierKey;
  CodeMirror.lookupKey = lookupKey;
  CodeMirror.normalizeKeyMap = normalizeKeyMap;
  CodeMirror.StringStream = StringStream;
  CodeMirror.SharedTextMarker = SharedTextMarker;
  CodeMirror.TextMarker = TextMarker;
  CodeMirror.LineWidget = LineWidget;
  CodeMirror.e_preventDefault = e_preventDefault;
  CodeMirror.e_stopPropagation = e_stopPropagation;
  CodeMirror.e_stop = e_stop;
  CodeMirror.addClass = addClass;
  CodeMirror.contains = contains;
  CodeMirror.rmClass = rmClass;
  CodeMirror.keyNames = keyNames;
}

// EDITOR CONSTRUCTOR

defineOptions(CodeMirror$1);

addEditorMethods(CodeMirror$1);

// Set up methods on CodeMirror's prototype to redirect to the editor's document.
var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");
for (var prop in Doc.prototype) { if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
  { CodeMirror$1.prototype[prop] = (function(method) {
    return function() {return method.apply(this.doc, arguments)}
  })(Doc.prototype[prop]); } }

eventMixin(Doc);

// INPUT HANDLING

CodeMirror$1.inputStyles = {"textarea": TextareaInput, "contenteditable": ContentEditableInput};

// MODE DEFINITION AND QUERYING

// Extra arguments are stored as the mode's dependencies, which is
// used by (legacy) mechanisms like loadmode.js to automatically
// load a mode. (Preferred mechanism is the require/define calls.)
CodeMirror$1.defineMode = function(name/*, mode, …*/) {
  if (!CodeMirror$1.defaults.mode && name != "null") { CodeMirror$1.defaults.mode = name; }
  defineMode.apply(this, arguments);
};

CodeMirror$1.defineMIME = defineMIME;

// Minimal default mode.
CodeMirror$1.defineMode("null", function () { return ({token: function (stream) { return stream.skipToEnd(); }}); });
CodeMirror$1.defineMIME("text/plain", "null");

// EXTENSIONS

CodeMirror$1.defineExtension = function (name, func) {
  CodeMirror$1.prototype[name] = func;
};
CodeMirror$1.defineDocExtension = function (name, func) {
  Doc.prototype[name] = func;
};

CodeMirror$1.fromTextArea = fromTextArea;

addLegacyProps(CodeMirror$1);

CodeMirror$1.version = "5.26.0";

return CodeMirror$1;

})));

},{}],2:[function(require,module,exports){
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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

function normalizeLineEndings(str) {
	if (!str) return str;
	return str.replace(/\r\n|\r/g, '\n');
}

var CodeMirror = (function (_React$Component) {
	_inherits(CodeMirror, _React$Component);

	function CodeMirror(props) {
		_classCallCheck(this, CodeMirror);

		_get(Object.getPrototypeOf(CodeMirror.prototype), 'constructor', this).call(this, props);

		this.state = {
			isFocused: false
		};
	}

	_createClass(CodeMirror, [{
		key: 'getCodeMirrorInstance',
		value: function getCodeMirrorInstance() {
			return this.props.codeMirrorInstance || require('codemirror');
		}
	}, {
		key: 'componentWillMount',
		value: function componentWillMount() {
			this.componentWillReceiveProps = (0, _lodashDebounce2['default'])(this.componentWillReceiveProps, 0);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var textareaNode = ReactDOM.findDOMNode(this.refs.textarea);

			var codeMirrorInstance = this.getCodeMirrorInstance();

			var info = codeMirrorInstance.findModeByExtension(this.props.name.split('.').pop()) || {};
			var _info$mode = info.mode;
			var mode = _info$mode === undefined ? "" : _info$mode;
			var spec = info.spec;

			this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode);

			this.codeMirror.setOption('mode', mode);
			this.codeMirror.setOption('readOnly', this.props.options.readOnly);
			this.codeMirror.setOption('lineNumbers', this.props.options.lineNumbers);
			this.codeMirror.setOption('lineWrapping', this.props.options.lineWrapping);

			codeMirrorInstance.autoLoadMode(this.codeMirror, mode);

			this.codeMirror.on('change', this.codemirrorValueChanged.bind(this));
			this.codeMirror.on('focus', this.focusChanged.bind(this, true));
			this.codeMirror.on('blur', this.focusChanged.bind(this, false));
			this.codeMirror.on('scroll', this.scrollChanged.bind(this));
			this.codeMirror.on('cursorActivity', this.cursorActivity.bind(this));

			this.codeMirror.setValue(this.props.defaultValue || this.props.value || '');

			this.props.onLoad(this.codeMirror);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			// is there a lighter-weight way to remove the cm instance?
			if (this.codeMirror) {
				this.codeMirror.toTextArea();
			}
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			if (this.codeMirror && nextProps.value !== undefined && normalizeLineEndings(this.codeMirror.getValue()) !== normalizeLineEndings(nextProps.value)) {
				if (this.props.preserveScrollPosition) {
					var prevScrollPosition = this.codeMirror.getScrollInfo();
					this.codeMirror.setValue(nextProps.value);
					this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
				} else {
					this.codeMirror.setValue(nextProps.value);
				}
			}

			if (typeof nextProps.options === 'object') {
				for (var optionName in nextProps.options) {
					if (nextProps.options.hasOwnProperty(optionName)) {
						var optionVal = nextProps.options[optionName];
						this.codeMirror.setOption(optionName, optionVal);
					}
				}
			}
		}
	}, {
		key: 'focusChanged',
		value: function focusChanged(focused) {
			this.setState({
				isFocused: focused
			});
			this.props.onFocusChange && this.props.onFocusChange(focused);
		}
	}, {
		key: 'scrollChanged',
		value: function scrollChanged(cm) {
			this.props.onScroll && this.props.onScroll(cm.getScrollInfo());
		}
	}, {
		key: 'codemirrorValueChanged',
		value: function codemirrorValueChanged(doc, change) {
			if (this.props.onChange && change.origin !== 'setValue') {
				this.props.onChange(doc.getValue(), change);
			}
		}
	}, {
		key: 'cursorActivity',
		value: function cursorActivity(cm) {
			this.props.onCursorChange && this.props.onCursorChange({
				from: cm.getCursor("from"),
				to: cm.getCursor("to")
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var editorClassName = (0, _classnames2['default'])('ReactCodeMirror', this.state.isFocused ? 'ReactCodeMirror--focused' : null, this.props.className);

			return React.createElement(
				'div',
				{ className: editorClassName, style: { width: "100%", height: "100%", zIndex: 0 } },
				React.createElement('textarea', { ref: 'textarea', defaultValue: this.props.value, autoComplete: 'off' })
			);
		}
	}]);

	return CodeMirror;
})(React.Component);

CodeMirror.propTypes = {
	mode: React.PropTypes.string,
	lineWrapping: React.PropTypes.bool,
	lineNumbers: React.PropTypes.bool,
	readOnly: React.PropTypes.bool,
	className: React.PropTypes.any,
	codeMirrorInstance: React.PropTypes.func,
	defaultValue: React.PropTypes.string,
	onChange: React.PropTypes.func,
	onFocusChange: React.PropTypes.func,
	onScroll: React.PropTypes.func,
	options: React.PropTypes.object,
	path: React.PropTypes.string,
	value: React.PropTypes.string,
	preserveScrollPosition: React.PropTypes.bool
};

CodeMirror.defaultProps = {
	mode: '',
	lineWrapping: false,
	lineNumbers: false,
	readOnly: true,
	preserveScrollPosition: false
};

exports['default'] = CodeMirror;
module.exports = exports['default'];

},{"classnames":"classnames","codemirror":1,"lodash.debounce":"lodash.debounce"}],3:[function(require,module,exports){
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

var _systemjs = require('systemjs');

var _systemjs2 = _interopRequireDefault(_systemjs);

var _redux = require('redux');

var _CodeMirror = require('./CodeMirror');

var _CodeMirror2 = _interopRequireDefault(_CodeMirror);

var define = window.define;
var require = window.require;

_systemjs2['default'].config({
    baseURL: 'plugins/editor.codemirror/res/build',
    packages: {
        'codemirror': {},
        '.': {}
    }
});

var CodeMirrorLoader = (function (_React$Component) {
    _inherits(CodeMirrorLoader, _React$Component);

    function CodeMirrorLoader(props) {
        var _this = this;

        _classCallCheck(this, CodeMirrorLoader);

        _get(Object.getPrototypeOf(CodeMirrorLoader.prototype), 'constructor', this).call(this, props);

        var pydio = props.pydio;
        var node = props.node;
        var url = props.url;
        var onLoad = props.onLoad;

        var loaded = new Promise(function (resolve, reject) {

            window.define = _systemjs2['default'].amdDefine;
            window.require = window.requirejs = _systemjs2['default'].amdRequire;

            _systemjs2['default']['import']('codemirror/lib/codemirror').then(function (m) {
                var CodeMirror = m;
                _systemjs2['default']['import']('codemirror/addon/search/search');
                _systemjs2['default']['import']('codemirror/addon/mode/loadmode').then(function () {
                    _systemjs2['default']['import']('codemirror/mode/meta').then(function () {
                        CodeMirror.modeURL = 'codemirror/mode/%N/%N.js';
                        resolve(CodeMirror);
                    });
                });
            });
        });

        this.state = {
            url: url,
            loaded: loaded
        };

        this.onLoad = function (codemirror) {
            _this.props.onLoad(codemirror);

            window.define = define;
            window.require = window.requirejs = require;
        };
    }

    // Handling loading

    _createClass(CodeMirrorLoader, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.state.loaded.then(function (CodeMirror) {
                _this2.setState({ codemirrorInstance: CodeMirror });
            });
        }
    }, {
        key: 'render',
        value: function render() {

            // If Code Mirror library is not loaded, do not go further
            if (!this.state.codemirrorInstance) return null;

            return React.createElement(_CodeMirror2['default'], {
                name: this.state.url,
                value: this.props.content,
                codeMirrorInstance: this.state.codemirrorInstance,
                options: this.props.options,

                onLoad: this.onLoad,
                onChange: this.props.onChange,
                onCursorChange: this.props.onCursorChange
            });
        }
    }]);

    return CodeMirrorLoader;
})(React.Component);

CodeMirrorLoader.propTypes = {
    url: React.PropTypes.string.isRequired,

    onChange: React.PropTypes.func.isRequired,
    onCursorChange: React.PropTypes.func.isRequired
};

exports['default'] = CodeMirrorLoader;
module.exports = exports['default'];

},{"./CodeMirror":2,"redux":"redux","systemjs":"systemjs"}],4:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _utils = require('./utils');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

// Actions definitions
var onSave = function onSave(_ref) {
    var pydio = _ref.pydio;
    var url = _ref.url;
    var content = _ref.content;
    var dispatch = _ref.dispatch;
    var id = _ref.id;

    return pydio.ApiClient.postPlainTextContent(url, content, function (success) {
        if (!success) {
            dispatch(EditorActions.tabModify({ id: id, error: "There was an error while saving" }));
        }
    });
};

exports.onSave = onSave;
var onUndo = function onUndo(_ref2) {
    var codemirror = _ref2.codemirror;
    return codemirror.undo();
};
exports.onUndo = onUndo;
var onRedo = function onRedo(_ref3) {
    var codemirror = _ref3.codemirror;
    return codemirror.redo();
};
exports.onRedo = onRedo;
var onToggleLineNumbers = function onToggleLineNumbers(_ref4) {
    var dispatch = _ref4.dispatch;
    var id = _ref4.id;
    var lineNumbers = _ref4.lineNumbers;
    return dispatch(EditorActions.tabModify({ id: id, lineNumbers: !lineNumbers }));
};
exports.onToggleLineNumbers = onToggleLineNumbers;
var onToggleLineWrapping = function onToggleLineWrapping(_ref5) {
    var dispatch = _ref5.dispatch;
    var id = _ref5.id;
    var lineWrapping = _ref5.lineWrapping;
    return dispatch(EditorActions.tabModify({ id: id, lineWrapping: !lineWrapping }));
};

exports.onToggleLineWrapping = onToggleLineWrapping;
var onSearch = function onSearch(_ref6) {
    var codemirror = _ref6.codemirror;
    var cursor = _ref6.cursor;
    return function (value) {
        var query = (0, _utils.parseQuery)(value);

        var cur = codemirror.getSearchCursor(query, cursor.to);

        if (!cur.find()) {
            cur = codemirror.getSearchCursor(query, 0);
            if (!cur.find()) return;
        }

        codemirror.setSelection(cur.from(), cur.to());
        codemirror.scrollIntoView({ from: cur.from(), to: cur.to() }, 20);
    };
};

exports.onSearch = onSearch;
var onJumpTo = function onJumpTo(_ref7) {
    var codemirror = _ref7.codemirror;
    return function (value) {
        var line = parseInt(value);
        var cur = codemirror.getCursor();

        codemirror.focus();
        codemirror.setCursor(line - 1, cur.ch);
        codemirror.scrollIntoView({ line: line - 1, ch: cur.ch }, 20);
    };
};
exports.onJumpTo = onJumpTo;

},{"./utils":8,"pydio":"pydio"}],5:[function(require,module,exports){
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
var _PydioHOCs = PydioHOCs;
var ContentControls = _PydioHOCs.ContentControls;
var ContentSearchControls = _PydioHOCs.ContentSearchControls;
exports.ContentControls = ContentControls;
exports.ContentSearchControls = ContentSearchControls;

},{}],6:[function(require,module,exports){
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

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _CodeMirrorLoader = require('./CodeMirrorLoader');

var _CodeMirrorLoader2 = _interopRequireDefault(_CodeMirrorLoader);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props) {
        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).call(this, props);

        var _props = this.props;
        var node = _props.node;
        var tab = _props.tab;
        var dispatch = _props.dispatch;
        var id = tab.id;

        if (!id) dispatch(EditorActions.tabCreate({ id: node.getLabel(), node: node }));
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var node = _props2.node;
            var tab = _props2.tab;
            var dispatch = _props2.dispatch;
            var id = tab.id;

            pydio.ApiClient.request({
                get_action: 'get_content',
                file: node.getPath()
            }, function (_ref) {
                var responseText = _ref.responseText;
                return dispatch(EditorActions.tabModify({ id: id || node.getLabel(), lineNumbers: true, content: responseText }));
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props;
            var node = _props3.node;
            var tab = _props3.tab;
            var error = _props3.error;
            var dispatch = _props3.dispatch;

            if (!tab) return null;

            var id = tab.id;
            var codemirror = tab.codemirror;
            var content = tab.content;
            var lineWrapping = tab.lineWrapping;
            var lineNumbers = tab.lineNumbers;

            return _react2['default'].createElement(_CodeMirrorLoader2['default'], _extends({}, this.props, {
                url: node.getPath(),
                content: content,
                options: { lineNumbers: lineNumbers, lineWrapping: lineWrapping },
                error: error,

                onLoad: function (codemirror) {
                    return dispatch(EditorActions.tabModify({ id: id, codemirror: codemirror }));
                },
                onChange: function (content) {
                    return dispatch(EditorActions.tabModify({ id: id, content: content }));
                },
                onCursorChange: function (cursor) {
                    return dispatch(EditorActions.tabModify({ id: id, cursor: cursor }));
                }
            }));
        }
    }]);

    return Editor;
})(_react2['default'].Component);

var mapStateToProps = function mapStateToProps(state, props) {
    var tabs = state.tabs;

    var tab = tabs.filter(function (_ref2) {
        var editorData = _ref2.editorData;
        var node = _ref2.node;
        return (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath();
    })[0] || {};

    return _extends({
        id: tab.id,
        tab: tab
    }, props);
};

exports.mapStateToProps = mapStateToProps;
exports['default'] = (0, _reactRedux.connect)(mapStateToProps)(Editor);

},{"./CodeMirrorLoader":3,"pydio":"pydio","react":"react","react-redux":"react-redux","redux":"redux"}],7:[function(require,module,exports){
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _editor = require('./editor');

var _editor2 = _interopRequireDefault(_editor);

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

var _controls = require('./controls');

var Controls = _interopRequireWildcard(_controls);

var _CodeMirrorLoader = require('./CodeMirrorLoader');

var _CodeMirrorLoader2 = _interopRequireDefault(_CodeMirrorLoader);

exports.Editor = _editor2['default'];
exports.Actions = Actions;
exports.Controls = Controls;
exports.Loader = _CodeMirrorLoader2['default'];

},{"./CodeMirrorLoader":3,"./actions":4,"./controls":5,"./editor":6}],8:[function(require,module,exports){
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
var parseString = function parseString(str) {
    return str.replace(/\\(.)/g, function (_, ch) {
        return ch === "n" ? "\n" : ch === "r" ? "\r" : ch;
    });
};

exports.parseString = parseString;
var parseQuery = function parseQuery(query) {

    var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
    if (isRE) {
        try {
            query = new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i");
        } catch (e) {} // Not a regular expression after all, do a string search
    } else {
            query = parseString(query);
        }
    if (typeof query == "string" ? query == "" : query.test("")) query = /x^/;

    return query;
};
exports.parseQuery = parseQuery;

},{}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29kZW1pcnJvci9saWIvY29kZW1pcnJvci5qcyIsInJlcy9idWlsZC9QeWRpb0NvZGVNaXJyb3IvQ29kZU1pcnJvci5qcyIsInJlcy9idWlsZC9QeWRpb0NvZGVNaXJyb3IvQ29kZU1pcnJvckxvYWRlci5qcyIsInJlcy9idWlsZC9QeWRpb0NvZGVNaXJyb3IvYWN0aW9ucy5qcyIsInJlcy9idWlsZC9QeWRpb0NvZGVNaXJyb3IvY29udHJvbHMuanMiLCJyZXMvYnVpbGQvUHlkaW9Db2RlTWlycm9yL2VkaXRvci5qcyIsInJlcy9idWlsZC9QeWRpb0NvZGVNaXJyb3IvaW5kZXguanMiLCJyZXMvYnVpbGQvUHlkaW9Db2RlTWlycm9yL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbnBTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbi8vIFRoaXMgaXMgQ29kZU1pcnJvciAoaHR0cDovL2NvZGVtaXJyb3IubmV0KSwgYSBjb2RlIGVkaXRvclxuLy8gaW1wbGVtZW50ZWQgaW4gSmF2YVNjcmlwdCBvbiB0b3Agb2YgdGhlIGJyb3dzZXIncyBET00uXG4vL1xuLy8gWW91IGNhbiBmaW5kIHNvbWUgdGVjaG5pY2FsIGJhY2tncm91bmQgZm9yIHNvbWUgb2YgdGhlIGNvZGUgYmVsb3dcbi8vIGF0IGh0dHA6Ly9tYXJpam5oYXZlcmJla2UubmwvYmxvZy8jY20taW50ZXJuYWxzIC5cblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuXHQoZ2xvYmFsLkNvZGVNaXJyb3IgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbi8vIEtsdWRnZXMgZm9yIGJ1Z3MgYW5kIGJlaGF2aW9yIGRpZmZlcmVuY2VzIHRoYXQgY2FuJ3QgYmUgZmVhdHVyZVxuLy8gZGV0ZWN0ZWQgYXJlIGVuYWJsZWQgYmFzZWQgb24gdXNlckFnZW50IGV0YyBzbmlmZmluZy5cbnZhciB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xudmFyIHBsYXRmb3JtID0gbmF2aWdhdG9yLnBsYXRmb3JtO1xuXG52YXIgZ2Vja28gPSAvZ2Vja29cXC9cXGQvaS50ZXN0KHVzZXJBZ2VudCk7XG52YXIgaWVfdXB0bzEwID0gL01TSUUgXFxkLy50ZXN0KHVzZXJBZ2VudCk7XG52YXIgaWVfMTF1cCA9IC9UcmlkZW50XFwvKD86WzctOV18XFxkezIsfSlcXC4uKnJ2OihcXGQrKS8uZXhlYyh1c2VyQWdlbnQpO1xudmFyIGVkZ2UgPSAvRWRnZVxcLyhcXGQrKS8uZXhlYyh1c2VyQWdlbnQpO1xudmFyIGllID0gaWVfdXB0bzEwIHx8IGllXzExdXAgfHwgZWRnZTtcbnZhciBpZV92ZXJzaW9uID0gaWUgJiYgKGllX3VwdG8xMCA/IGRvY3VtZW50LmRvY3VtZW50TW9kZSB8fCA2IDogKyhlZGdlIHx8IGllXzExdXApWzFdKTtcbnZhciB3ZWJraXQgPSAhZWRnZSAmJiAvV2ViS2l0XFwvLy50ZXN0KHVzZXJBZ2VudCk7XG52YXIgcXR3ZWJraXQgPSB3ZWJraXQgJiYgL1F0XFwvXFxkK1xcLlxcZCsvLnRlc3QodXNlckFnZW50KTtcbnZhciBjaHJvbWUgPSAhZWRnZSAmJiAvQ2hyb21lXFwvLy50ZXN0KHVzZXJBZ2VudCk7XG52YXIgcHJlc3RvID0gL09wZXJhXFwvLy50ZXN0KHVzZXJBZ2VudCk7XG52YXIgc2FmYXJpID0gL0FwcGxlIENvbXB1dGVyLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpO1xudmFyIG1hY19nZU1vdW50YWluTGlvbiA9IC9NYWMgT1MgWCAxXFxkXFxEKFs4LTldfFxcZFxcZClcXEQvLnRlc3QodXNlckFnZW50KTtcbnZhciBwaGFudG9tID0gL1BoYW50b21KUy8udGVzdCh1c2VyQWdlbnQpO1xuXG52YXIgaW9zID0gIWVkZ2UgJiYgL0FwcGxlV2ViS2l0Ly50ZXN0KHVzZXJBZ2VudCkgJiYgL01vYmlsZVxcL1xcdysvLnRlc3QodXNlckFnZW50KTtcbnZhciBhbmRyb2lkID0gL0FuZHJvaWQvLnRlc3QodXNlckFnZW50KTtcbi8vIFRoaXMgaXMgd29lZnVsbHkgaW5jb21wbGV0ZS4gU3VnZ2VzdGlvbnMgZm9yIGFsdGVybmF0aXZlIG1ldGhvZHMgd2VsY29tZS5cbnZhciBtb2JpbGUgPSBpb3MgfHwgYW5kcm9pZCB8fCAvd2ViT1N8QmxhY2tCZXJyeXxPcGVyYSBNaW5pfE9wZXJhIE1vYml8SUVNb2JpbGUvaS50ZXN0KHVzZXJBZ2VudCk7XG52YXIgbWFjID0gaW9zIHx8IC9NYWMvLnRlc3QocGxhdGZvcm0pO1xudmFyIGNocm9tZU9TID0gL1xcYkNyT1NcXGIvLnRlc3QodXNlckFnZW50KTtcbnZhciB3aW5kb3dzID0gL3dpbi9pLnRlc3QocGxhdGZvcm0pO1xuXG52YXIgcHJlc3RvX3ZlcnNpb24gPSBwcmVzdG8gJiYgdXNlckFnZW50Lm1hdGNoKC9WZXJzaW9uXFwvKFxcZCpcXC5cXGQqKS8pO1xuaWYgKHByZXN0b192ZXJzaW9uKSB7IHByZXN0b192ZXJzaW9uID0gTnVtYmVyKHByZXN0b192ZXJzaW9uWzFdKTsgfVxuaWYgKHByZXN0b192ZXJzaW9uICYmIHByZXN0b192ZXJzaW9uID49IDE1KSB7IHByZXN0byA9IGZhbHNlOyB3ZWJraXQgPSB0cnVlOyB9XG4vLyBTb21lIGJyb3dzZXJzIHVzZSB0aGUgd3JvbmcgZXZlbnQgcHJvcGVydGllcyB0byBzaWduYWwgY21kL2N0cmwgb24gT1MgWFxudmFyIGZsaXBDdHJsQ21kID0gbWFjICYmIChxdHdlYmtpdCB8fCBwcmVzdG8gJiYgKHByZXN0b192ZXJzaW9uID09IG51bGwgfHwgcHJlc3RvX3ZlcnNpb24gPCAxMi4xMSkpO1xudmFyIGNhcHR1cmVSaWdodENsaWNrID0gZ2Vja28gfHwgKGllICYmIGllX3ZlcnNpb24gPj0gOSk7XG5cbmZ1bmN0aW9uIGNsYXNzVGVzdChjbHMpIHsgcmV0dXJuIG5ldyBSZWdFeHAoXCIoXnxcXFxccylcIiArIGNscyArIFwiKD86JHxcXFxccylcXFxccypcIikgfVxuXG52YXIgcm1DbGFzcyA9IGZ1bmN0aW9uKG5vZGUsIGNscykge1xuICB2YXIgY3VycmVudCA9IG5vZGUuY2xhc3NOYW1lO1xuICB2YXIgbWF0Y2ggPSBjbGFzc1Rlc3QoY2xzKS5leGVjKGN1cnJlbnQpO1xuICBpZiAobWF0Y2gpIHtcbiAgICB2YXIgYWZ0ZXIgPSBjdXJyZW50LnNsaWNlKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICBub2RlLmNsYXNzTmFtZSA9IGN1cnJlbnQuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgKGFmdGVyID8gbWF0Y2hbMV0gKyBhZnRlciA6IFwiXCIpO1xuICB9XG59O1xuXG5mdW5jdGlvbiByZW1vdmVDaGlsZHJlbihlKSB7XG4gIGZvciAodmFyIGNvdW50ID0gZS5jaGlsZE5vZGVzLmxlbmd0aDsgY291bnQgPiAwOyAtLWNvdW50KVxuICAgIHsgZS5yZW1vdmVDaGlsZChlLmZpcnN0Q2hpbGQpOyB9XG4gIHJldHVybiBlXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuQW5kQWRkKHBhcmVudCwgZSkge1xuICByZXR1cm4gcmVtb3ZlQ2hpbGRyZW4ocGFyZW50KS5hcHBlbmRDaGlsZChlKVxufVxuXG5mdW5jdGlvbiBlbHQodGFnLCBjb250ZW50LCBjbGFzc05hbWUsIHN0eWxlKSB7XG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICBpZiAoY2xhc3NOYW1lKSB7IGUuY2xhc3NOYW1lID0gY2xhc3NOYW1lOyB9XG4gIGlmIChzdHlsZSkgeyBlLnN0eWxlLmNzc1RleHQgPSBzdHlsZTsgfVxuICBpZiAodHlwZW9mIGNvbnRlbnQgPT0gXCJzdHJpbmdcIikgeyBlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNvbnRlbnQpKTsgfVxuICBlbHNlIGlmIChjb250ZW50KSB7IGZvciAodmFyIGkgPSAwOyBpIDwgY29udGVudC5sZW5ndGg7ICsraSkgeyBlLmFwcGVuZENoaWxkKGNvbnRlbnRbaV0pOyB9IH1cbiAgcmV0dXJuIGVcbn1cbi8vIHdyYXBwZXIgZm9yIGVsdCwgd2hpY2ggcmVtb3ZlcyB0aGUgZWx0IGZyb20gdGhlIGFjY2Vzc2liaWxpdHkgdHJlZVxuZnVuY3Rpb24gZWx0UCh0YWcsIGNvbnRlbnQsIGNsYXNzTmFtZSwgc3R5bGUpIHtcbiAgdmFyIGUgPSBlbHQodGFnLCBjb250ZW50LCBjbGFzc05hbWUsIHN0eWxlKTtcbiAgZS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwicHJlc2VudGF0aW9uXCIpO1xuICByZXR1cm4gZVxufVxuXG52YXIgcmFuZ2U7XG5pZiAoZG9jdW1lbnQuY3JlYXRlUmFuZ2UpIHsgcmFuZ2UgPSBmdW5jdGlvbihub2RlLCBzdGFydCwgZW5kLCBlbmROb2RlKSB7XG4gIHZhciByID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgci5zZXRFbmQoZW5kTm9kZSB8fCBub2RlLCBlbmQpO1xuICByLnNldFN0YXJ0KG5vZGUsIHN0YXJ0KTtcbiAgcmV0dXJuIHJcbn07IH1cbmVsc2UgeyByYW5nZSA9IGZ1bmN0aW9uKG5vZGUsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHIgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICB0cnkgeyByLm1vdmVUb0VsZW1lbnRUZXh0KG5vZGUucGFyZW50Tm9kZSk7IH1cbiAgY2F0Y2goZSkgeyByZXR1cm4gciB9XG4gIHIuY29sbGFwc2UodHJ1ZSk7XG4gIHIubW92ZUVuZChcImNoYXJhY3RlclwiLCBlbmQpO1xuICByLm1vdmVTdGFydChcImNoYXJhY3RlclwiLCBzdGFydCk7XG4gIHJldHVybiByXG59OyB9XG5cbmZ1bmN0aW9uIGNvbnRhaW5zKHBhcmVudCwgY2hpbGQpIHtcbiAgaWYgKGNoaWxkLm5vZGVUeXBlID09IDMpIC8vIEFuZHJvaWQgYnJvd3NlciBhbHdheXMgcmV0dXJucyBmYWxzZSB3aGVuIGNoaWxkIGlzIGEgdGV4dG5vZGVcbiAgICB7IGNoaWxkID0gY2hpbGQucGFyZW50Tm9kZTsgfVxuICBpZiAocGFyZW50LmNvbnRhaW5zKVxuICAgIHsgcmV0dXJuIHBhcmVudC5jb250YWlucyhjaGlsZCkgfVxuICBkbyB7XG4gICAgaWYgKGNoaWxkLm5vZGVUeXBlID09IDExKSB7IGNoaWxkID0gY2hpbGQuaG9zdDsgfVxuICAgIGlmIChjaGlsZCA9PSBwYXJlbnQpIHsgcmV0dXJuIHRydWUgfVxuICB9IHdoaWxlIChjaGlsZCA9IGNoaWxkLnBhcmVudE5vZGUpXG59XG5cbmZ1bmN0aW9uIGFjdGl2ZUVsdCgpIHtcbiAgLy8gSUUgYW5kIEVkZ2UgbWF5IHRocm93IGFuIFwiVW5zcGVjaWZpZWQgRXJyb3JcIiB3aGVuIGFjY2Vzc2luZyBkb2N1bWVudC5hY3RpdmVFbGVtZW50LlxuICAvLyBJRSA8IDEwIHdpbGwgdGhyb3cgd2hlbiBhY2Nlc3NlZCB3aGlsZSB0aGUgcGFnZSBpcyBsb2FkaW5nIG9yIGluIGFuIGlmcmFtZS5cbiAgLy8gSUUgPiA5IGFuZCBFZGdlIHdpbGwgdGhyb3cgd2hlbiBhY2Nlc3NlZCBpbiBhbiBpZnJhbWUgaWYgZG9jdW1lbnQuYm9keSBpcyB1bmF2YWlsYWJsZS5cbiAgdmFyIGFjdGl2ZUVsZW1lbnQ7XG4gIHRyeSB7XG4gICAgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIH0gY2F0Y2goZSkge1xuICAgIGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5ib2R5IHx8IG51bGw7XG4gIH1cbiAgd2hpbGUgKGFjdGl2ZUVsZW1lbnQgJiYgYWN0aXZlRWxlbWVudC5zaGFkb3dSb290ICYmIGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdC5hY3RpdmVFbGVtZW50KVxuICAgIHsgYWN0aXZlRWxlbWVudCA9IGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdC5hY3RpdmVFbGVtZW50OyB9XG4gIHJldHVybiBhY3RpdmVFbGVtZW50XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzKG5vZGUsIGNscykge1xuICB2YXIgY3VycmVudCA9IG5vZGUuY2xhc3NOYW1lO1xuICBpZiAoIWNsYXNzVGVzdChjbHMpLnRlc3QoY3VycmVudCkpIHsgbm9kZS5jbGFzc05hbWUgKz0gKGN1cnJlbnQgPyBcIiBcIiA6IFwiXCIpICsgY2xzOyB9XG59XG5mdW5jdGlvbiBqb2luQ2xhc3NlcyhhLCBiKSB7XG4gIHZhciBhcyA9IGEuc3BsaXQoXCIgXCIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFzLmxlbmd0aDsgaSsrKVxuICAgIHsgaWYgKGFzW2ldICYmICFjbGFzc1Rlc3QoYXNbaV0pLnRlc3QoYikpIHsgYiArPSBcIiBcIiArIGFzW2ldOyB9IH1cbiAgcmV0dXJuIGJcbn1cblxudmFyIHNlbGVjdElucHV0ID0gZnVuY3Rpb24obm9kZSkgeyBub2RlLnNlbGVjdCgpOyB9O1xuaWYgKGlvcykgLy8gTW9iaWxlIFNhZmFyaSBhcHBhcmVudGx5IGhhcyBhIGJ1ZyB3aGVyZSBzZWxlY3QoKSBpcyBicm9rZW4uXG4gIHsgc2VsZWN0SW5wdXQgPSBmdW5jdGlvbihub2RlKSB7IG5vZGUuc2VsZWN0aW9uU3RhcnQgPSAwOyBub2RlLnNlbGVjdGlvbkVuZCA9IG5vZGUudmFsdWUubGVuZ3RoOyB9OyB9XG5lbHNlIGlmIChpZSkgLy8gU3VwcHJlc3MgbXlzdGVyaW91cyBJRTEwIGVycm9yc1xuICB7IHNlbGVjdElucHV0ID0gZnVuY3Rpb24obm9kZSkgeyB0cnkgeyBub2RlLnNlbGVjdCgpOyB9IGNhdGNoKF9lKSB7fSB9OyB9XG5cbmZ1bmN0aW9uIGJpbmQoZikge1xuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gIHJldHVybiBmdW5jdGlvbigpe3JldHVybiBmLmFwcGx5KG51bGwsIGFyZ3MpfVxufVxuXG5mdW5jdGlvbiBjb3B5T2JqKG9iaiwgdGFyZ2V0LCBvdmVyd3JpdGUpIHtcbiAgaWYgKCF0YXJnZXQpIHsgdGFyZ2V0ID0ge307IH1cbiAgZm9yICh2YXIgcHJvcCBpbiBvYmopXG4gICAgeyBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3ApICYmIChvdmVyd3JpdGUgIT09IGZhbHNlIHx8ICF0YXJnZXQuaGFzT3duUHJvcGVydHkocHJvcCkpKVxuICAgICAgeyB0YXJnZXRbcHJvcF0gPSBvYmpbcHJvcF07IH0gfVxuICByZXR1cm4gdGFyZ2V0XG59XG5cbi8vIENvdW50cyB0aGUgY29sdW1uIG9mZnNldCBpbiBhIHN0cmluZywgdGFraW5nIHRhYnMgaW50byBhY2NvdW50LlxuLy8gVXNlZCBtb3N0bHkgdG8gZmluZCBpbmRlbnRhdGlvbi5cbmZ1bmN0aW9uIGNvdW50Q29sdW1uKHN0cmluZywgZW5kLCB0YWJTaXplLCBzdGFydEluZGV4LCBzdGFydFZhbHVlKSB7XG4gIGlmIChlbmQgPT0gbnVsbCkge1xuICAgIGVuZCA9IHN0cmluZy5zZWFyY2goL1teXFxzXFx1MDBhMF0vKTtcbiAgICBpZiAoZW5kID09IC0xKSB7IGVuZCA9IHN0cmluZy5sZW5ndGg7IH1cbiAgfVxuICBmb3IgKHZhciBpID0gc3RhcnRJbmRleCB8fCAwLCBuID0gc3RhcnRWYWx1ZSB8fCAwOzspIHtcbiAgICB2YXIgbmV4dFRhYiA9IHN0cmluZy5pbmRleE9mKFwiXFx0XCIsIGkpO1xuICAgIGlmIChuZXh0VGFiIDwgMCB8fCBuZXh0VGFiID49IGVuZClcbiAgICAgIHsgcmV0dXJuIG4gKyAoZW5kIC0gaSkgfVxuICAgIG4gKz0gbmV4dFRhYiAtIGk7XG4gICAgbiArPSB0YWJTaXplIC0gKG4gJSB0YWJTaXplKTtcbiAgICBpID0gbmV4dFRhYiArIDE7XG4gIH1cbn1cblxudmFyIERlbGF5ZWQgPSBmdW5jdGlvbigpIHt0aGlzLmlkID0gbnVsbDt9O1xuRGVsYXllZC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG1zLCBmKSB7XG4gIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgdGhpcy5pZCA9IHNldFRpbWVvdXQoZiwgbXMpO1xufTtcblxuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgZWx0KSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyArK2kpXG4gICAgeyBpZiAoYXJyYXlbaV0gPT0gZWx0KSB7IHJldHVybiBpIH0gfVxuICByZXR1cm4gLTFcbn1cblxuLy8gTnVtYmVyIG9mIHBpeGVscyBhZGRlZCB0byBzY3JvbGxlciBhbmQgc2l6ZXIgdG8gaGlkZSBzY3JvbGxiYXJcbnZhciBzY3JvbGxlckdhcCA9IDMwO1xuXG4vLyBSZXR1cm5lZCBvciB0aHJvd24gYnkgdmFyaW91cyBwcm90b2NvbHMgdG8gc2lnbmFsICdJJ20gbm90XG4vLyBoYW5kbGluZyB0aGlzJy5cbnZhciBQYXNzID0ge3RvU3RyaW5nOiBmdW5jdGlvbigpe3JldHVybiBcIkNvZGVNaXJyb3IuUGFzc1wifX07XG5cbi8vIFJldXNlZCBvcHRpb24gb2JqZWN0cyBmb3Igc2V0U2VsZWN0aW9uICYgZnJpZW5kc1xudmFyIHNlbF9kb250U2Nyb2xsID0ge3Njcm9sbDogZmFsc2V9O1xudmFyIHNlbF9tb3VzZSA9IHtvcmlnaW46IFwiKm1vdXNlXCJ9O1xudmFyIHNlbF9tb3ZlID0ge29yaWdpbjogXCIrbW92ZVwifTtcblxuLy8gVGhlIGludmVyc2Ugb2YgY291bnRDb2x1bW4gLS0gZmluZCB0aGUgb2Zmc2V0IHRoYXQgY29ycmVzcG9uZHMgdG9cbi8vIGEgcGFydGljdWxhciBjb2x1bW4uXG5mdW5jdGlvbiBmaW5kQ29sdW1uKHN0cmluZywgZ29hbCwgdGFiU2l6ZSkge1xuICBmb3IgKHZhciBwb3MgPSAwLCBjb2wgPSAwOzspIHtcbiAgICB2YXIgbmV4dFRhYiA9IHN0cmluZy5pbmRleE9mKFwiXFx0XCIsIHBvcyk7XG4gICAgaWYgKG5leHRUYWIgPT0gLTEpIHsgbmV4dFRhYiA9IHN0cmluZy5sZW5ndGg7IH1cbiAgICB2YXIgc2tpcHBlZCA9IG5leHRUYWIgLSBwb3M7XG4gICAgaWYgKG5leHRUYWIgPT0gc3RyaW5nLmxlbmd0aCB8fCBjb2wgKyBza2lwcGVkID49IGdvYWwpXG4gICAgICB7IHJldHVybiBwb3MgKyBNYXRoLm1pbihza2lwcGVkLCBnb2FsIC0gY29sKSB9XG4gICAgY29sICs9IG5leHRUYWIgLSBwb3M7XG4gICAgY29sICs9IHRhYlNpemUgLSAoY29sICUgdGFiU2l6ZSk7XG4gICAgcG9zID0gbmV4dFRhYiArIDE7XG4gICAgaWYgKGNvbCA+PSBnb2FsKSB7IHJldHVybiBwb3MgfVxuICB9XG59XG5cbnZhciBzcGFjZVN0cnMgPSBbXCJcIl07XG5mdW5jdGlvbiBzcGFjZVN0cihuKSB7XG4gIHdoaWxlIChzcGFjZVN0cnMubGVuZ3RoIDw9IG4pXG4gICAgeyBzcGFjZVN0cnMucHVzaChsc3Qoc3BhY2VTdHJzKSArIFwiIFwiKTsgfVxuICByZXR1cm4gc3BhY2VTdHJzW25dXG59XG5cbmZ1bmN0aW9uIGxzdChhcnIpIHsgcmV0dXJuIGFyclthcnIubGVuZ3RoLTFdIH1cblxuZnVuY3Rpb24gbWFwKGFycmF5LCBmKSB7XG4gIHZhciBvdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykgeyBvdXRbaV0gPSBmKGFycmF5W2ldLCBpKTsgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIGluc2VydFNvcnRlZChhcnJheSwgdmFsdWUsIHNjb3JlKSB7XG4gIHZhciBwb3MgPSAwLCBwcmlvcml0eSA9IHNjb3JlKHZhbHVlKTtcbiAgd2hpbGUgKHBvcyA8IGFycmF5Lmxlbmd0aCAmJiBzY29yZShhcnJheVtwb3NdKSA8PSBwcmlvcml0eSkgeyBwb3MrKzsgfVxuICBhcnJheS5zcGxpY2UocG9zLCAwLCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIG5vdGhpbmcoKSB7fVxuXG5mdW5jdGlvbiBjcmVhdGVPYmooYmFzZSwgcHJvcHMpIHtcbiAgdmFyIGluc3Q7XG4gIGlmIChPYmplY3QuY3JlYXRlKSB7XG4gICAgaW5zdCA9IE9iamVjdC5jcmVhdGUoYmFzZSk7XG4gIH0gZWxzZSB7XG4gICAgbm90aGluZy5wcm90b3R5cGUgPSBiYXNlO1xuICAgIGluc3QgPSBuZXcgbm90aGluZygpO1xuICB9XG4gIGlmIChwcm9wcykgeyBjb3B5T2JqKHByb3BzLCBpbnN0KTsgfVxuICByZXR1cm4gaW5zdFxufVxuXG52YXIgbm9uQVNDSUlTaW5nbGVDYXNlV29yZENoYXIgPSAvW1xcdTAwZGZcXHUwNTg3XFx1MDU5MC1cXHUwNWY0XFx1MDYwMC1cXHUwNmZmXFx1MzA0MC1cXHUzMDlmXFx1MzBhMC1cXHUzMGZmXFx1MzQwMC1cXHU0ZGI1XFx1NGUwMC1cXHU5ZmNjXFx1YWMwMC1cXHVkN2FmXS87XG5mdW5jdGlvbiBpc1dvcmRDaGFyQmFzaWMoY2gpIHtcbiAgcmV0dXJuIC9cXHcvLnRlc3QoY2gpIHx8IGNoID4gXCJcXHg4MFwiICYmXG4gICAgKGNoLnRvVXBwZXJDYXNlKCkgIT0gY2gudG9Mb3dlckNhc2UoKSB8fCBub25BU0NJSVNpbmdsZUNhc2VXb3JkQ2hhci50ZXN0KGNoKSlcbn1cbmZ1bmN0aW9uIGlzV29yZENoYXIoY2gsIGhlbHBlcikge1xuICBpZiAoIWhlbHBlcikgeyByZXR1cm4gaXNXb3JkQ2hhckJhc2ljKGNoKSB9XG4gIGlmIChoZWxwZXIuc291cmNlLmluZGV4T2YoXCJcXFxcd1wiKSA+IC0xICYmIGlzV29yZENoYXJCYXNpYyhjaCkpIHsgcmV0dXJuIHRydWUgfVxuICByZXR1cm4gaGVscGVyLnRlc3QoY2gpXG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkob2JqKSB7XG4gIGZvciAodmFyIG4gaW4gb2JqKSB7IGlmIChvYmouaGFzT3duUHJvcGVydHkobikgJiYgb2JqW25dKSB7IHJldHVybiBmYWxzZSB9IH1cbiAgcmV0dXJuIHRydWVcbn1cblxuLy8gRXh0ZW5kaW5nIHVuaWNvZGUgY2hhcmFjdGVycy4gQSBzZXJpZXMgb2YgYSBub24tZXh0ZW5kaW5nIGNoYXIgK1xuLy8gYW55IG51bWJlciBvZiBleHRlbmRpbmcgY2hhcnMgaXMgdHJlYXRlZCBhcyBhIHNpbmdsZSB1bml0IGFzIGZhclxuLy8gYXMgZWRpdGluZyBhbmQgbWVhc3VyaW5nIGlzIGNvbmNlcm5lZC4gVGhpcyBpcyBub3QgZnVsbHkgY29ycmVjdCxcbi8vIHNpbmNlIHNvbWUgc2NyaXB0cy9mb250cy9icm93c2VycyBhbHNvIHRyZWF0IG90aGVyIGNvbmZpZ3VyYXRpb25zXG4vLyBvZiBjb2RlIHBvaW50cyBhcyBhIGdyb3VwLlxudmFyIGV4dGVuZGluZ0NoYXJzID0gL1tcXHUwMzAwLVxcdTAzNmZcXHUwNDgzLVxcdTA0ODlcXHUwNTkxLVxcdTA1YmRcXHUwNWJmXFx1MDVjMVxcdTA1YzJcXHUwNWM0XFx1MDVjNVxcdTA1YzdcXHUwNjEwLVxcdTA2MWFcXHUwNjRiLVxcdTA2NWVcXHUwNjcwXFx1MDZkNi1cXHUwNmRjXFx1MDZkZS1cXHUwNmU0XFx1MDZlN1xcdTA2ZThcXHUwNmVhLVxcdTA2ZWRcXHUwNzExXFx1MDczMC1cXHUwNzRhXFx1MDdhNi1cXHUwN2IwXFx1MDdlYi1cXHUwN2YzXFx1MDgxNi1cXHUwODE5XFx1MDgxYi1cXHUwODIzXFx1MDgyNS1cXHUwODI3XFx1MDgyOS1cXHUwODJkXFx1MDkwMC1cXHUwOTAyXFx1MDkzY1xcdTA5NDEtXFx1MDk0OFxcdTA5NGRcXHUwOTUxLVxcdTA5NTVcXHUwOTYyXFx1MDk2M1xcdTA5ODFcXHUwOWJjXFx1MDliZVxcdTA5YzEtXFx1MDljNFxcdTA5Y2RcXHUwOWQ3XFx1MDllMlxcdTA5ZTNcXHUwYTAxXFx1MGEwMlxcdTBhM2NcXHUwYTQxXFx1MGE0MlxcdTBhNDdcXHUwYTQ4XFx1MGE0Yi1cXHUwYTRkXFx1MGE1MVxcdTBhNzBcXHUwYTcxXFx1MGE3NVxcdTBhODFcXHUwYTgyXFx1MGFiY1xcdTBhYzEtXFx1MGFjNVxcdTBhYzdcXHUwYWM4XFx1MGFjZFxcdTBhZTJcXHUwYWUzXFx1MGIwMVxcdTBiM2NcXHUwYjNlXFx1MGIzZlxcdTBiNDEtXFx1MGI0NFxcdTBiNGRcXHUwYjU2XFx1MGI1N1xcdTBiNjJcXHUwYjYzXFx1MGI4MlxcdTBiYmVcXHUwYmMwXFx1MGJjZFxcdTBiZDdcXHUwYzNlLVxcdTBjNDBcXHUwYzQ2LVxcdTBjNDhcXHUwYzRhLVxcdTBjNGRcXHUwYzU1XFx1MGM1NlxcdTBjNjJcXHUwYzYzXFx1MGNiY1xcdTBjYmZcXHUwY2MyXFx1MGNjNlxcdTBjY2NcXHUwY2NkXFx1MGNkNVxcdTBjZDZcXHUwY2UyXFx1MGNlM1xcdTBkM2VcXHUwZDQxLVxcdTBkNDRcXHUwZDRkXFx1MGQ1N1xcdTBkNjJcXHUwZDYzXFx1MGRjYVxcdTBkY2ZcXHUwZGQyLVxcdTBkZDRcXHUwZGQ2XFx1MGRkZlxcdTBlMzFcXHUwZTM0LVxcdTBlM2FcXHUwZTQ3LVxcdTBlNGVcXHUwZWIxXFx1MGViNC1cXHUwZWI5XFx1MGViYlxcdTBlYmNcXHUwZWM4LVxcdTBlY2RcXHUwZjE4XFx1MGYxOVxcdTBmMzVcXHUwZjM3XFx1MGYzOVxcdTBmNzEtXFx1MGY3ZVxcdTBmODAtXFx1MGY4NFxcdTBmODZcXHUwZjg3XFx1MGY5MC1cXHUwZjk3XFx1MGY5OS1cXHUwZmJjXFx1MGZjNlxcdTEwMmQtXFx1MTAzMFxcdTEwMzItXFx1MTAzN1xcdTEwMzlcXHUxMDNhXFx1MTAzZFxcdTEwM2VcXHUxMDU4XFx1MTA1OVxcdTEwNWUtXFx1MTA2MFxcdTEwNzEtXFx1MTA3NFxcdTEwODJcXHUxMDg1XFx1MTA4NlxcdTEwOGRcXHUxMDlkXFx1MTM1ZlxcdTE3MTItXFx1MTcxNFxcdTE3MzItXFx1MTczNFxcdTE3NTJcXHUxNzUzXFx1MTc3MlxcdTE3NzNcXHUxN2I3LVxcdTE3YmRcXHUxN2M2XFx1MTdjOS1cXHUxN2QzXFx1MTdkZFxcdTE4MGItXFx1MTgwZFxcdTE4YTlcXHUxOTIwLVxcdTE5MjJcXHUxOTI3XFx1MTkyOFxcdTE5MzJcXHUxOTM5LVxcdTE5M2JcXHUxYTE3XFx1MWExOFxcdTFhNTZcXHUxYTU4LVxcdTFhNWVcXHUxYTYwXFx1MWE2MlxcdTFhNjUtXFx1MWE2Y1xcdTFhNzMtXFx1MWE3Y1xcdTFhN2ZcXHUxYjAwLVxcdTFiMDNcXHUxYjM0XFx1MWIzNi1cXHUxYjNhXFx1MWIzY1xcdTFiNDJcXHUxYjZiLVxcdTFiNzNcXHUxYjgwXFx1MWI4MVxcdTFiYTItXFx1MWJhNVxcdTFiYThcXHUxYmE5XFx1MWMyYy1cXHUxYzMzXFx1MWMzNlxcdTFjMzdcXHUxY2QwLVxcdTFjZDJcXHUxY2Q0LVxcdTFjZTBcXHUxY2UyLVxcdTFjZThcXHUxY2VkXFx1MWRjMC1cXHUxZGU2XFx1MWRmZC1cXHUxZGZmXFx1MjAwY1xcdTIwMGRcXHUyMGQwLVxcdTIwZjBcXHUyY2VmLVxcdTJjZjFcXHUyZGUwLVxcdTJkZmZcXHUzMDJhLVxcdTMwMmZcXHUzMDk5XFx1MzA5YVxcdWE2NmYtXFx1YTY3MlxcdWE2N2NcXHVhNjdkXFx1YTZmMFxcdWE2ZjFcXHVhODAyXFx1YTgwNlxcdWE4MGJcXHVhODI1XFx1YTgyNlxcdWE4YzRcXHVhOGUwLVxcdWE4ZjFcXHVhOTI2LVxcdWE5MmRcXHVhOTQ3LVxcdWE5NTFcXHVhOTgwLVxcdWE5ODJcXHVhOWIzXFx1YTliNi1cXHVhOWI5XFx1YTliY1xcdWFhMjktXFx1YWEyZVxcdWFhMzFcXHVhYTMyXFx1YWEzNVxcdWFhMzZcXHVhYTQzXFx1YWE0Y1xcdWFhYjBcXHVhYWIyLVxcdWFhYjRcXHVhYWI3XFx1YWFiOFxcdWFhYmVcXHVhYWJmXFx1YWFjMVxcdWFiZTVcXHVhYmU4XFx1YWJlZFxcdWRjMDAtXFx1ZGZmZlxcdWZiMWVcXHVmZTAwLVxcdWZlMGZcXHVmZTIwLVxcdWZlMjZcXHVmZjllXFx1ZmY5Zl0vO1xuZnVuY3Rpb24gaXNFeHRlbmRpbmdDaGFyKGNoKSB7IHJldHVybiBjaC5jaGFyQ29kZUF0KDApID49IDc2OCAmJiBleHRlbmRpbmdDaGFycy50ZXN0KGNoKSB9XG5cbi8vIFJldHVybnMgYSBudW1iZXIgZnJvbSB0aGUgcmFuZ2UgW2AwYDsgYHN0ci5sZW5ndGhgXSB1bmxlc3MgYHBvc2AgaXMgb3V0c2lkZSB0aGF0IHJhbmdlLlxuZnVuY3Rpb24gc2tpcEV4dGVuZGluZ0NoYXJzKHN0ciwgcG9zLCBkaXIpIHtcbiAgd2hpbGUgKChkaXIgPCAwID8gcG9zID4gMCA6IHBvcyA8IHN0ci5sZW5ndGgpICYmIGlzRXh0ZW5kaW5nQ2hhcihzdHIuY2hhckF0KHBvcykpKSB7IHBvcyArPSBkaXI7IH1cbiAgcmV0dXJuIHBvc1xufVxuXG4vLyBSZXR1cm5zIHRoZSB2YWx1ZSBmcm9tIHRoZSByYW5nZSBbYGZyb21gOyBgdG9gXSB0aGF0IHNhdGlzZmllc1xuLy8gYHByZWRgIGFuZCBpcyBjbG9zZXN0IHRvIGBmcm9tYC4gQXNzdW1lcyB0aGF0IGF0IGxlYXN0IGB0b2Agc2F0aXNmaWVzIGBwcmVkYC5cbmZ1bmN0aW9uIGZpbmRGaXJzdChwcmVkLCBmcm9tLCB0bykge1xuICBmb3IgKDs7KSB7XG4gICAgaWYgKE1hdGguYWJzKGZyb20gLSB0bykgPD0gMSkgeyByZXR1cm4gcHJlZChmcm9tKSA/IGZyb20gOiB0byB9XG4gICAgdmFyIG1pZCA9IE1hdGguZmxvb3IoKGZyb20gKyB0bykgLyAyKTtcbiAgICBpZiAocHJlZChtaWQpKSB7IHRvID0gbWlkOyB9XG4gICAgZWxzZSB7IGZyb20gPSBtaWQ7IH1cbiAgfVxufVxuXG4vLyBUaGUgZGlzcGxheSBoYW5kbGVzIHRoZSBET00gaW50ZWdyYXRpb24sIGJvdGggZm9yIGlucHV0IHJlYWRpbmdcbi8vIGFuZCBjb250ZW50IGRyYXdpbmcuIEl0IGhvbGRzIHJlZmVyZW5jZXMgdG8gRE9NIG5vZGVzIGFuZFxuLy8gZGlzcGxheS1yZWxhdGVkIHN0YXRlLlxuXG5mdW5jdGlvbiBEaXNwbGF5KHBsYWNlLCBkb2MsIGlucHV0KSB7XG4gIHZhciBkID0gdGhpcztcbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xuXG4gIC8vIENvdmVycyBib3R0b20tcmlnaHQgc3F1YXJlIHdoZW4gYm90aCBzY3JvbGxiYXJzIGFyZSBwcmVzZW50LlxuICBkLnNjcm9sbGJhckZpbGxlciA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3Itc2Nyb2xsYmFyLWZpbGxlclwiKTtcbiAgZC5zY3JvbGxiYXJGaWxsZXIuc2V0QXR0cmlidXRlKFwiY20tbm90LWNvbnRlbnRcIiwgXCJ0cnVlXCIpO1xuICAvLyBDb3ZlcnMgYm90dG9tIG9mIGd1dHRlciB3aGVuIGNvdmVyR3V0dGVyTmV4dFRvU2Nyb2xsYmFyIGlzIG9uXG4gIC8vIGFuZCBoIHNjcm9sbGJhciBpcyBwcmVzZW50LlxuICBkLmd1dHRlckZpbGxlciA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItZ3V0dGVyLWZpbGxlclwiKTtcbiAgZC5ndXR0ZXJGaWxsZXIuc2V0QXR0cmlidXRlKFwiY20tbm90LWNvbnRlbnRcIiwgXCJ0cnVlXCIpO1xuICAvLyBXaWxsIGNvbnRhaW4gdGhlIGFjdHVhbCBjb2RlLCBwb3NpdGlvbmVkIHRvIGNvdmVyIHRoZSB2aWV3cG9ydC5cbiAgZC5saW5lRGl2ID0gZWx0UChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItY29kZVwiKTtcbiAgLy8gRWxlbWVudHMgYXJlIGFkZGVkIHRvIHRoZXNlIHRvIHJlcHJlc2VudCBzZWxlY3Rpb24gYW5kIGN1cnNvcnMuXG4gIGQuc2VsZWN0aW9uRGl2ID0gZWx0KFwiZGl2XCIsIG51bGwsIG51bGwsIFwicG9zaXRpb246IHJlbGF0aXZlOyB6LWluZGV4OiAxXCIpO1xuICBkLmN1cnNvckRpdiA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItY3Vyc29yc1wiKTtcbiAgLy8gQSB2aXNpYmlsaXR5OiBoaWRkZW4gZWxlbWVudCB1c2VkIHRvIGZpbmQgdGhlIHNpemUgb2YgdGhpbmdzLlxuICBkLm1lYXN1cmUgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLW1lYXN1cmVcIik7XG4gIC8vIFdoZW4gbGluZXMgb3V0c2lkZSBvZiB0aGUgdmlld3BvcnQgYXJlIG1lYXN1cmVkLCB0aGV5IGFyZSBkcmF3biBpbiB0aGlzLlxuICBkLmxpbmVNZWFzdXJlID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1tZWFzdXJlXCIpO1xuICAvLyBXcmFwcyBldmVyeXRoaW5nIHRoYXQgbmVlZHMgdG8gZXhpc3QgaW5zaWRlIHRoZSB2ZXJ0aWNhbGx5LXBhZGRlZCBjb29yZGluYXRlIHN5c3RlbVxuICBkLmxpbmVTcGFjZSA9IGVsdFAoXCJkaXZcIiwgW2QubWVhc3VyZSwgZC5saW5lTWVhc3VyZSwgZC5zZWxlY3Rpb25EaXYsIGQuY3Vyc29yRGl2LCBkLmxpbmVEaXZdLFxuICAgICAgICAgICAgICAgICAgICBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZTsgb3V0bGluZTogbm9uZVwiKTtcbiAgdmFyIGxpbmVzID0gZWx0UChcImRpdlwiLCBbZC5saW5lU3BhY2VdLCBcIkNvZGVNaXJyb3ItbGluZXNcIik7XG4gIC8vIE1vdmVkIGFyb3VuZCBpdHMgcGFyZW50IHRvIGNvdmVyIHZpc2libGUgdmlldy5cbiAgZC5tb3ZlciA9IGVsdChcImRpdlwiLCBbbGluZXNdLCBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZVwiKTtcbiAgLy8gU2V0IHRvIHRoZSBoZWlnaHQgb2YgdGhlIGRvY3VtZW50LCBhbGxvd2luZyBzY3JvbGxpbmcuXG4gIGQuc2l6ZXIgPSBlbHQoXCJkaXZcIiwgW2QubW92ZXJdLCBcIkNvZGVNaXJyb3Itc2l6ZXJcIik7XG4gIGQuc2l6ZXJXaWR0aCA9IG51bGw7XG4gIC8vIEJlaGF2aW9yIG9mIGVsdHMgd2l0aCBvdmVyZmxvdzogYXV0byBhbmQgcGFkZGluZyBpc1xuICAvLyBpbmNvbnNpc3RlbnQgYWNyb3NzIGJyb3dzZXJzLiBUaGlzIGlzIHVzZWQgdG8gZW5zdXJlIHRoZVxuICAvLyBzY3JvbGxhYmxlIGFyZWEgaXMgYmlnIGVub3VnaC5cbiAgZC5oZWlnaHRGb3JjZXIgPSBlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJwb3NpdGlvbjogYWJzb2x1dGU7IGhlaWdodDogXCIgKyBzY3JvbGxlckdhcCArIFwicHg7IHdpZHRoOiAxcHg7XCIpO1xuICAvLyBXaWxsIGNvbnRhaW4gdGhlIGd1dHRlcnMsIGlmIGFueS5cbiAgZC5ndXR0ZXJzID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1ndXR0ZXJzXCIpO1xuICBkLmxpbmVHdXR0ZXIgPSBudWxsO1xuICAvLyBBY3R1YWwgc2Nyb2xsYWJsZSBlbGVtZW50LlxuICBkLnNjcm9sbGVyID0gZWx0KFwiZGl2XCIsIFtkLnNpemVyLCBkLmhlaWdodEZvcmNlciwgZC5ndXR0ZXJzXSwgXCJDb2RlTWlycm9yLXNjcm9sbFwiKTtcbiAgZC5zY3JvbGxlci5zZXRBdHRyaWJ1dGUoXCJ0YWJJbmRleFwiLCBcIi0xXCIpO1xuICAvLyBUaGUgZWxlbWVudCBpbiB3aGljaCB0aGUgZWRpdG9yIGxpdmVzLlxuICBkLndyYXBwZXIgPSBlbHQoXCJkaXZcIiwgW2Quc2Nyb2xsYmFyRmlsbGVyLCBkLmd1dHRlckZpbGxlciwgZC5zY3JvbGxlcl0sIFwiQ29kZU1pcnJvclwiKTtcblxuICAvLyBXb3JrIGFyb3VuZCBJRTcgei1pbmRleCBidWcgKG5vdCBwZXJmZWN0LCBoZW5jZSBJRTcgbm90IHJlYWxseSBiZWluZyBzdXBwb3J0ZWQpXG4gIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgOCkgeyBkLmd1dHRlcnMuc3R5bGUuekluZGV4ID0gLTE7IGQuc2Nyb2xsZXIuc3R5bGUucGFkZGluZ1JpZ2h0ID0gMDsgfVxuICBpZiAoIXdlYmtpdCAmJiAhKGdlY2tvICYmIG1vYmlsZSkpIHsgZC5zY3JvbGxlci5kcmFnZ2FibGUgPSB0cnVlOyB9XG5cbiAgaWYgKHBsYWNlKSB7XG4gICAgaWYgKHBsYWNlLmFwcGVuZENoaWxkKSB7IHBsYWNlLmFwcGVuZENoaWxkKGQud3JhcHBlcik7IH1cbiAgICBlbHNlIHsgcGxhY2UoZC53cmFwcGVyKTsgfVxuICB9XG5cbiAgLy8gQ3VycmVudCByZW5kZXJlZCByYW5nZSAobWF5IGJlIGJpZ2dlciB0aGFuIHRoZSB2aWV3IHdpbmRvdykuXG4gIGQudmlld0Zyb20gPSBkLnZpZXdUbyA9IGRvYy5maXJzdDtcbiAgZC5yZXBvcnRlZFZpZXdGcm9tID0gZC5yZXBvcnRlZFZpZXdUbyA9IGRvYy5maXJzdDtcbiAgLy8gSW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlbmRlcmVkIGxpbmVzLlxuICBkLnZpZXcgPSBbXTtcbiAgZC5yZW5kZXJlZFZpZXcgPSBudWxsO1xuICAvLyBIb2xkcyBpbmZvIGFib3V0IGEgc2luZ2xlIHJlbmRlcmVkIGxpbmUgd2hlbiBpdCB3YXMgcmVuZGVyZWRcbiAgLy8gZm9yIG1lYXN1cmVtZW50LCB3aGlsZSBub3QgaW4gdmlldy5cbiAgZC5leHRlcm5hbE1lYXN1cmVkID0gbnVsbDtcbiAgLy8gRW1wdHkgc3BhY2UgKGluIHBpeGVscykgYWJvdmUgdGhlIHZpZXdcbiAgZC52aWV3T2Zmc2V0ID0gMDtcbiAgZC5sYXN0V3JhcEhlaWdodCA9IGQubGFzdFdyYXBXaWR0aCA9IDA7XG4gIGQudXBkYXRlTGluZU51bWJlcnMgPSBudWxsO1xuXG4gIGQubmF0aXZlQmFyV2lkdGggPSBkLmJhckhlaWdodCA9IGQuYmFyV2lkdGggPSAwO1xuICBkLnNjcm9sbGJhcnNDbGlwcGVkID0gZmFsc2U7XG5cbiAgLy8gVXNlZCB0byBvbmx5IHJlc2l6ZSB0aGUgbGluZSBudW1iZXIgZ3V0dGVyIHdoZW4gbmVjZXNzYXJ5ICh3aGVuXG4gIC8vIHRoZSBhbW91bnQgb2YgbGluZXMgY3Jvc3NlcyBhIGJvdW5kYXJ5IHRoYXQgbWFrZXMgaXRzIHdpZHRoIGNoYW5nZSlcbiAgZC5saW5lTnVtV2lkdGggPSBkLmxpbmVOdW1Jbm5lcldpZHRoID0gZC5saW5lTnVtQ2hhcnMgPSBudWxsO1xuICAvLyBTZXQgdG8gdHJ1ZSB3aGVuIGEgbm9uLWhvcml6b250YWwtc2Nyb2xsaW5nIGxpbmUgd2lkZ2V0IGlzXG4gIC8vIGFkZGVkLiBBcyBhbiBvcHRpbWl6YXRpb24sIGxpbmUgd2lkZ2V0IGFsaWduaW5nIGlzIHNraXBwZWQgd2hlblxuICAvLyB0aGlzIGlzIGZhbHNlLlxuICBkLmFsaWduV2lkZ2V0cyA9IGZhbHNlO1xuXG4gIGQuY2FjaGVkQ2hhcldpZHRoID0gZC5jYWNoZWRUZXh0SGVpZ2h0ID0gZC5jYWNoZWRQYWRkaW5nSCA9IG51bGw7XG5cbiAgLy8gVHJhY2tzIHRoZSBtYXhpbXVtIGxpbmUgbGVuZ3RoIHNvIHRoYXQgdGhlIGhvcml6b250YWwgc2Nyb2xsYmFyXG4gIC8vIGNhbiBiZSBrZXB0IHN0YXRpYyB3aGVuIHNjcm9sbGluZy5cbiAgZC5tYXhMaW5lID0gbnVsbDtcbiAgZC5tYXhMaW5lTGVuZ3RoID0gMDtcbiAgZC5tYXhMaW5lQ2hhbmdlZCA9IGZhbHNlO1xuXG4gIC8vIFVzZWQgZm9yIG1lYXN1cmluZyB3aGVlbCBzY3JvbGxpbmcgZ3JhbnVsYXJpdHlcbiAgZC53aGVlbERYID0gZC53aGVlbERZID0gZC53aGVlbFN0YXJ0WCA9IGQud2hlZWxTdGFydFkgPSBudWxsO1xuXG4gIC8vIFRydWUgd2hlbiBzaGlmdCBpcyBoZWxkIGRvd24uXG4gIGQuc2hpZnQgPSBmYWxzZTtcblxuICAvLyBVc2VkIHRvIHRyYWNrIHdoZXRoZXIgYW55dGhpbmcgaGFwcGVuZWQgc2luY2UgdGhlIGNvbnRleHQgbWVudVxuICAvLyB3YXMgb3BlbmVkLlxuICBkLnNlbEZvckNvbnRleHRNZW51ID0gbnVsbDtcblxuICBkLmFjdGl2ZVRvdWNoID0gbnVsbDtcblxuICBpbnB1dC5pbml0KGQpO1xufVxuXG4vLyBGaW5kIHRoZSBsaW5lIG9iamVjdCBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBsaW5lIG51bWJlci5cbmZ1bmN0aW9uIGdldExpbmUoZG9jLCBuKSB7XG4gIG4gLT0gZG9jLmZpcnN0O1xuICBpZiAobiA8IDAgfHwgbiA+PSBkb2Muc2l6ZSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyBsaW5lIFwiICsgKG4gKyBkb2MuZmlyc3QpICsgXCIgaW4gdGhlIGRvY3VtZW50LlwiKSB9XG4gIHZhciBjaHVuayA9IGRvYztcbiAgd2hpbGUgKCFjaHVuay5saW5lcykge1xuICAgIGZvciAodmFyIGkgPSAwOzsgKytpKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjaHVuay5jaGlsZHJlbltpXSwgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcbiAgICAgIGlmIChuIDwgc3opIHsgY2h1bmsgPSBjaGlsZDsgYnJlYWsgfVxuICAgICAgbiAtPSBzejtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNodW5rLmxpbmVzW25dXG59XG5cbi8vIEdldCB0aGUgcGFydCBvZiBhIGRvY3VtZW50IGJldHdlZW4gdHdvIHBvc2l0aW9ucywgYXMgYW4gYXJyYXkgb2Zcbi8vIHN0cmluZ3MuXG5mdW5jdGlvbiBnZXRCZXR3ZWVuKGRvYywgc3RhcnQsIGVuZCkge1xuICB2YXIgb3V0ID0gW10sIG4gPSBzdGFydC5saW5lO1xuICBkb2MuaXRlcihzdGFydC5saW5lLCBlbmQubGluZSArIDEsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgdmFyIHRleHQgPSBsaW5lLnRleHQ7XG4gICAgaWYgKG4gPT0gZW5kLmxpbmUpIHsgdGV4dCA9IHRleHQuc2xpY2UoMCwgZW5kLmNoKTsgfVxuICAgIGlmIChuID09IHN0YXJ0LmxpbmUpIHsgdGV4dCA9IHRleHQuc2xpY2Uoc3RhcnQuY2gpOyB9XG4gICAgb3V0LnB1c2godGV4dCk7XG4gICAgKytuO1xuICB9KTtcbiAgcmV0dXJuIG91dFxufVxuLy8gR2V0IHRoZSBsaW5lcyBiZXR3ZWVuIGZyb20gYW5kIHRvLCBhcyBhcnJheSBvZiBzdHJpbmdzLlxuZnVuY3Rpb24gZ2V0TGluZXMoZG9jLCBmcm9tLCB0bykge1xuICB2YXIgb3V0ID0gW107XG4gIGRvYy5pdGVyKGZyb20sIHRvLCBmdW5jdGlvbiAobGluZSkgeyBvdXQucHVzaChsaW5lLnRleHQpOyB9KTsgLy8gaXRlciBhYm9ydHMgd2hlbiBjYWxsYmFjayByZXR1cm5zIHRydXRoeSB2YWx1ZVxuICByZXR1cm4gb3V0XG59XG5cbi8vIFVwZGF0ZSB0aGUgaGVpZ2h0IG9mIGEgbGluZSwgcHJvcGFnYXRpbmcgdGhlIGhlaWdodCBjaGFuZ2Vcbi8vIHVwd2FyZHMgdG8gcGFyZW50IG5vZGVzLlxuZnVuY3Rpb24gdXBkYXRlTGluZUhlaWdodChsaW5lLCBoZWlnaHQpIHtcbiAgdmFyIGRpZmYgPSBoZWlnaHQgLSBsaW5lLmhlaWdodDtcbiAgaWYgKGRpZmYpIHsgZm9yICh2YXIgbiA9IGxpbmU7IG47IG4gPSBuLnBhcmVudCkgeyBuLmhlaWdodCArPSBkaWZmOyB9IH1cbn1cblxuLy8gR2l2ZW4gYSBsaW5lIG9iamVjdCwgZmluZCBpdHMgbGluZSBudW1iZXIgYnkgd2Fsa2luZyB1cCB0aHJvdWdoXG4vLyBpdHMgcGFyZW50IGxpbmtzLlxuZnVuY3Rpb24gbGluZU5vKGxpbmUpIHtcbiAgaWYgKGxpbmUucGFyZW50ID09IG51bGwpIHsgcmV0dXJuIG51bGwgfVxuICB2YXIgY3VyID0gbGluZS5wYXJlbnQsIG5vID0gaW5kZXhPZihjdXIubGluZXMsIGxpbmUpO1xuICBmb3IgKHZhciBjaHVuayA9IGN1ci5wYXJlbnQ7IGNodW5rOyBjdXIgPSBjaHVuaywgY2h1bmsgPSBjaHVuay5wYXJlbnQpIHtcbiAgICBmb3IgKHZhciBpID0gMDs7ICsraSkge1xuICAgICAgaWYgKGNodW5rLmNoaWxkcmVuW2ldID09IGN1cikgeyBicmVhayB9XG4gICAgICBubyArPSBjaHVuay5jaGlsZHJlbltpXS5jaHVua1NpemUoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5vICsgY3VyLmZpcnN0XG59XG5cbi8vIEZpbmQgdGhlIGxpbmUgYXQgdGhlIGdpdmVuIHZlcnRpY2FsIHBvc2l0aW9uLCB1c2luZyB0aGUgaGVpZ2h0XG4vLyBpbmZvcm1hdGlvbiBpbiB0aGUgZG9jdW1lbnQgdHJlZS5cbmZ1bmN0aW9uIGxpbmVBdEhlaWdodChjaHVuaywgaCkge1xuICB2YXIgbiA9IGNodW5rLmZpcnN0O1xuICBvdXRlcjogZG8ge1xuICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGNodW5rLmNoaWxkcmVuLmxlbmd0aDsgKytpJDEpIHtcbiAgICAgIHZhciBjaGlsZCA9IGNodW5rLmNoaWxkcmVuW2kkMV0sIGNoID0gY2hpbGQuaGVpZ2h0O1xuICAgICAgaWYgKGggPCBjaCkgeyBjaHVuayA9IGNoaWxkOyBjb250aW51ZSBvdXRlciB9XG4gICAgICBoIC09IGNoO1xuICAgICAgbiArPSBjaGlsZC5jaHVua1NpemUoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5cbiAgfSB3aGlsZSAoIWNodW5rLmxpbmVzKVxuICB2YXIgaSA9IDA7XG4gIGZvciAoOyBpIDwgY2h1bmsubGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgbGluZSA9IGNodW5rLmxpbmVzW2ldLCBsaCA9IGxpbmUuaGVpZ2h0O1xuICAgIGlmIChoIDwgbGgpIHsgYnJlYWsgfVxuICAgIGggLT0gbGg7XG4gIH1cbiAgcmV0dXJuIG4gKyBpXG59XG5cbmZ1bmN0aW9uIGlzTGluZShkb2MsIGwpIHtyZXR1cm4gbCA+PSBkb2MuZmlyc3QgJiYgbCA8IGRvYy5maXJzdCArIGRvYy5zaXplfVxuXG5mdW5jdGlvbiBsaW5lTnVtYmVyRm9yKG9wdGlvbnMsIGkpIHtcbiAgcmV0dXJuIFN0cmluZyhvcHRpb25zLmxpbmVOdW1iZXJGb3JtYXR0ZXIoaSArIG9wdGlvbnMuZmlyc3RMaW5lTnVtYmVyKSlcbn1cblxuLy8gQSBQb3MgaW5zdGFuY2UgcmVwcmVzZW50cyBhIHBvc2l0aW9uIHdpdGhpbiB0aGUgdGV4dC5cbmZ1bmN0aW9uIFBvcyhsaW5lLCBjaCwgc3RpY2t5KSB7XG4gIGlmICggc3RpY2t5ID09PSB2b2lkIDAgKSBzdGlja3kgPSBudWxsO1xuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQb3MpKSB7IHJldHVybiBuZXcgUG9zKGxpbmUsIGNoLCBzdGlja3kpIH1cbiAgdGhpcy5saW5lID0gbGluZTtcbiAgdGhpcy5jaCA9IGNoO1xuICB0aGlzLnN0aWNreSA9IHN0aWNreTtcbn1cblxuLy8gQ29tcGFyZSB0d28gcG9zaXRpb25zLCByZXR1cm4gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgYSBuZWdhdGl2ZVxuLy8gbnVtYmVyIHdoZW4gYSBpcyBsZXNzLCBhbmQgYSBwb3NpdGl2ZSBudW1iZXIgb3RoZXJ3aXNlLlxuZnVuY3Rpb24gY21wKGEsIGIpIHsgcmV0dXJuIGEubGluZSAtIGIubGluZSB8fCBhLmNoIC0gYi5jaCB9XG5cbmZ1bmN0aW9uIGVxdWFsQ3Vyc29yUG9zKGEsIGIpIHsgcmV0dXJuIGEuc3RpY2t5ID09IGIuc3RpY2t5ICYmIGNtcChhLCBiKSA9PSAwIH1cblxuZnVuY3Rpb24gY29weVBvcyh4KSB7cmV0dXJuIFBvcyh4LmxpbmUsIHguY2gpfVxuZnVuY3Rpb24gbWF4UG9zKGEsIGIpIHsgcmV0dXJuIGNtcChhLCBiKSA8IDAgPyBiIDogYSB9XG5mdW5jdGlvbiBtaW5Qb3MoYSwgYikgeyByZXR1cm4gY21wKGEsIGIpIDwgMCA/IGEgOiBiIH1cblxuLy8gTW9zdCBvZiB0aGUgZXh0ZXJuYWwgQVBJIGNsaXBzIGdpdmVuIHBvc2l0aW9ucyB0byBtYWtlIHN1cmUgdGhleVxuLy8gYWN0dWFsbHkgZXhpc3Qgd2l0aGluIHRoZSBkb2N1bWVudC5cbmZ1bmN0aW9uIGNsaXBMaW5lKGRvYywgbikge3JldHVybiBNYXRoLm1heChkb2MuZmlyc3QsIE1hdGgubWluKG4sIGRvYy5maXJzdCArIGRvYy5zaXplIC0gMSkpfVxuZnVuY3Rpb24gY2xpcFBvcyhkb2MsIHBvcykge1xuICBpZiAocG9zLmxpbmUgPCBkb2MuZmlyc3QpIHsgcmV0dXJuIFBvcyhkb2MuZmlyc3QsIDApIH1cbiAgdmFyIGxhc3QgPSBkb2MuZmlyc3QgKyBkb2Muc2l6ZSAtIDE7XG4gIGlmIChwb3MubGluZSA+IGxhc3QpIHsgcmV0dXJuIFBvcyhsYXN0LCBnZXRMaW5lKGRvYywgbGFzdCkudGV4dC5sZW5ndGgpIH1cbiAgcmV0dXJuIGNsaXBUb0xlbihwb3MsIGdldExpbmUoZG9jLCBwb3MubGluZSkudGV4dC5sZW5ndGgpXG59XG5mdW5jdGlvbiBjbGlwVG9MZW4ocG9zLCBsaW5lbGVuKSB7XG4gIHZhciBjaCA9IHBvcy5jaDtcbiAgaWYgKGNoID09IG51bGwgfHwgY2ggPiBsaW5lbGVuKSB7IHJldHVybiBQb3MocG9zLmxpbmUsIGxpbmVsZW4pIH1cbiAgZWxzZSBpZiAoY2ggPCAwKSB7IHJldHVybiBQb3MocG9zLmxpbmUsIDApIH1cbiAgZWxzZSB7IHJldHVybiBwb3MgfVxufVxuZnVuY3Rpb24gY2xpcFBvc0FycmF5KGRvYywgYXJyYXkpIHtcbiAgdmFyIG91dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7IG91dFtpXSA9IGNsaXBQb3MoZG9jLCBhcnJheVtpXSk7IH1cbiAgcmV0dXJuIG91dFxufVxuXG4vLyBPcHRpbWl6ZSBzb21lIGNvZGUgd2hlbiB0aGVzZSBmZWF0dXJlcyBhcmUgbm90IHVzZWQuXG52YXIgc2F3UmVhZE9ubHlTcGFucyA9IGZhbHNlO1xudmFyIHNhd0NvbGxhcHNlZFNwYW5zID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHNlZVJlYWRPbmx5U3BhbnMoKSB7XG4gIHNhd1JlYWRPbmx5U3BhbnMgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBzZWVDb2xsYXBzZWRTcGFucygpIHtcbiAgc2F3Q29sbGFwc2VkU3BhbnMgPSB0cnVlO1xufVxuXG4vLyBURVhUTUFSS0VSIFNQQU5TXG5cbmZ1bmN0aW9uIE1hcmtlZFNwYW4obWFya2VyLCBmcm9tLCB0bykge1xuICB0aGlzLm1hcmtlciA9IG1hcmtlcjtcbiAgdGhpcy5mcm9tID0gZnJvbTsgdGhpcy50byA9IHRvO1xufVxuXG4vLyBTZWFyY2ggYW4gYXJyYXkgb2Ygc3BhbnMgZm9yIGEgc3BhbiBtYXRjaGluZyB0aGUgZ2l2ZW4gbWFya2VyLlxuZnVuY3Rpb24gZ2V0TWFya2VkU3BhbkZvcihzcGFucywgbWFya2VyKSB7XG4gIGlmIChzcGFucykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICBpZiAoc3Bhbi5tYXJrZXIgPT0gbWFya2VyKSB7IHJldHVybiBzcGFuIH1cbiAgfSB9XG59XG4vLyBSZW1vdmUgYSBzcGFuIGZyb20gYW4gYXJyYXksIHJldHVybmluZyB1bmRlZmluZWQgaWYgbm8gc3BhbnMgYXJlXG4vLyBsZWZ0ICh3ZSBkb24ndCBzdG9yZSBhcnJheXMgZm9yIGxpbmVzIHdpdGhvdXQgc3BhbnMpLlxuZnVuY3Rpb24gcmVtb3ZlTWFya2VkU3BhbihzcGFucywgc3Bhbikge1xuICB2YXIgcjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSlcbiAgICB7IGlmIChzcGFuc1tpXSAhPSBzcGFuKSB7IChyIHx8IChyID0gW10pKS5wdXNoKHNwYW5zW2ldKTsgfSB9XG4gIHJldHVybiByXG59XG4vLyBBZGQgYSBzcGFuIHRvIGEgbGluZS5cbmZ1bmN0aW9uIGFkZE1hcmtlZFNwYW4obGluZSwgc3Bhbikge1xuICBsaW5lLm1hcmtlZFNwYW5zID0gbGluZS5tYXJrZWRTcGFucyA/IGxpbmUubWFya2VkU3BhbnMuY29uY2F0KFtzcGFuXSkgOiBbc3Bhbl07XG4gIHNwYW4ubWFya2VyLmF0dGFjaExpbmUobGluZSk7XG59XG5cbi8vIFVzZWQgZm9yIHRoZSBhbGdvcml0aG0gdGhhdCBhZGp1c3RzIG1hcmtlcnMgZm9yIGEgY2hhbmdlIGluIHRoZVxuLy8gZG9jdW1lbnQuIFRoZXNlIGZ1bmN0aW9ucyBjdXQgYW4gYXJyYXkgb2Ygc3BhbnMgYXQgYSBnaXZlblxuLy8gY2hhcmFjdGVyIHBvc2l0aW9uLCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgcmVtYWluaW5nIGNodW5rcyAob3Jcbi8vIHVuZGVmaW5lZCBpZiBub3RoaW5nIHJlbWFpbnMpLlxuZnVuY3Rpb24gbWFya2VkU3BhbnNCZWZvcmUob2xkLCBzdGFydENoLCBpc0luc2VydCkge1xuICB2YXIgbnc7XG4gIGlmIChvbGQpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgc3BhbiA9IG9sZFtpXSwgbWFya2VyID0gc3Bhbi5tYXJrZXI7XG4gICAgdmFyIHN0YXJ0c0JlZm9yZSA9IHNwYW4uZnJvbSA9PSBudWxsIHx8IChtYXJrZXIuaW5jbHVzaXZlTGVmdCA/IHNwYW4uZnJvbSA8PSBzdGFydENoIDogc3Bhbi5mcm9tIDwgc3RhcnRDaCk7XG4gICAgaWYgKHN0YXJ0c0JlZm9yZSB8fCBzcGFuLmZyb20gPT0gc3RhcnRDaCAmJiBtYXJrZXIudHlwZSA9PSBcImJvb2ttYXJrXCIgJiYgKCFpc0luc2VydCB8fCAhc3Bhbi5tYXJrZXIuaW5zZXJ0TGVmdCkpIHtcbiAgICAgIHZhciBlbmRzQWZ0ZXIgPSBzcGFuLnRvID09IG51bGwgfHwgKG1hcmtlci5pbmNsdXNpdmVSaWdodCA/IHNwYW4udG8gPj0gc3RhcnRDaCA6IHNwYW4udG8gPiBzdGFydENoKTsobncgfHwgKG53ID0gW10pKS5wdXNoKG5ldyBNYXJrZWRTcGFuKG1hcmtlciwgc3Bhbi5mcm9tLCBlbmRzQWZ0ZXIgPyBudWxsIDogc3Bhbi50bykpO1xuICAgIH1cbiAgfSB9XG4gIHJldHVybiBud1xufVxuZnVuY3Rpb24gbWFya2VkU3BhbnNBZnRlcihvbGQsIGVuZENoLCBpc0luc2VydCkge1xuICB2YXIgbnc7XG4gIGlmIChvbGQpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgc3BhbiA9IG9sZFtpXSwgbWFya2VyID0gc3Bhbi5tYXJrZXI7XG4gICAgdmFyIGVuZHNBZnRlciA9IHNwYW4udG8gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZVJpZ2h0ID8gc3Bhbi50byA+PSBlbmRDaCA6IHNwYW4udG8gPiBlbmRDaCk7XG4gICAgaWYgKGVuZHNBZnRlciB8fCBzcGFuLmZyb20gPT0gZW5kQ2ggJiYgbWFya2VyLnR5cGUgPT0gXCJib29rbWFya1wiICYmICghaXNJbnNlcnQgfHwgc3Bhbi5tYXJrZXIuaW5zZXJ0TGVmdCkpIHtcbiAgICAgIHZhciBzdGFydHNCZWZvcmUgPSBzcGFuLmZyb20gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZUxlZnQgPyBzcGFuLmZyb20gPD0gZW5kQ2ggOiBzcGFuLmZyb20gPCBlbmRDaCk7KG53IHx8IChudyA9IFtdKSkucHVzaChuZXcgTWFya2VkU3BhbihtYXJrZXIsIHN0YXJ0c0JlZm9yZSA/IG51bGwgOiBzcGFuLmZyb20gLSBlbmRDaCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bhbi50byA9PSBudWxsID8gbnVsbCA6IHNwYW4udG8gLSBlbmRDaCkpO1xuICAgIH1cbiAgfSB9XG4gIHJldHVybiBud1xufVxuXG4vLyBHaXZlbiBhIGNoYW5nZSBvYmplY3QsIGNvbXB1dGUgdGhlIG5ldyBzZXQgb2YgbWFya2VyIHNwYW5zIHRoYXRcbi8vIGNvdmVyIHRoZSBsaW5lIGluIHdoaWNoIHRoZSBjaGFuZ2UgdG9vayBwbGFjZS4gUmVtb3ZlcyBzcGFuc1xuLy8gZW50aXJlbHkgd2l0aGluIHRoZSBjaGFuZ2UsIHJlY29ubmVjdHMgc3BhbnMgYmVsb25naW5nIHRvIHRoZVxuLy8gc2FtZSBtYXJrZXIgdGhhdCBhcHBlYXIgb24gYm90aCBzaWRlcyBvZiB0aGUgY2hhbmdlLCBhbmQgY3V0cyBvZmZcbi8vIHNwYW5zIHBhcnRpYWxseSB3aXRoaW4gdGhlIGNoYW5nZS4gUmV0dXJucyBhbiBhcnJheSBvZiBzcGFuXG4vLyBhcnJheXMgd2l0aCBvbmUgZWxlbWVudCBmb3IgZWFjaCBsaW5lIGluIChhZnRlcikgdGhlIGNoYW5nZS5cbmZ1bmN0aW9uIHN0cmV0Y2hTcGFuc092ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpIHtcbiAgaWYgKGNoYW5nZS5mdWxsKSB7IHJldHVybiBudWxsIH1cbiAgdmFyIG9sZEZpcnN0ID0gaXNMaW5lKGRvYywgY2hhbmdlLmZyb20ubGluZSkgJiYgZ2V0TGluZShkb2MsIGNoYW5nZS5mcm9tLmxpbmUpLm1hcmtlZFNwYW5zO1xuICB2YXIgb2xkTGFzdCA9IGlzTGluZShkb2MsIGNoYW5nZS50by5saW5lKSAmJiBnZXRMaW5lKGRvYywgY2hhbmdlLnRvLmxpbmUpLm1hcmtlZFNwYW5zO1xuICBpZiAoIW9sZEZpcnN0ICYmICFvbGRMYXN0KSB7IHJldHVybiBudWxsIH1cblxuICB2YXIgc3RhcnRDaCA9IGNoYW5nZS5mcm9tLmNoLCBlbmRDaCA9IGNoYW5nZS50by5jaCwgaXNJbnNlcnQgPSBjbXAoY2hhbmdlLmZyb20sIGNoYW5nZS50bykgPT0gMDtcbiAgLy8gR2V0IHRoZSBzcGFucyB0aGF0ICdzdGljayBvdXQnIG9uIGJvdGggc2lkZXNcbiAgdmFyIGZpcnN0ID0gbWFya2VkU3BhbnNCZWZvcmUob2xkRmlyc3QsIHN0YXJ0Q2gsIGlzSW5zZXJ0KTtcbiAgdmFyIGxhc3QgPSBtYXJrZWRTcGFuc0FmdGVyKG9sZExhc3QsIGVuZENoLCBpc0luc2VydCk7XG5cbiAgLy8gTmV4dCwgbWVyZ2UgdGhvc2UgdHdvIGVuZHNcbiAgdmFyIHNhbWVMaW5lID0gY2hhbmdlLnRleHQubGVuZ3RoID09IDEsIG9mZnNldCA9IGxzdChjaGFuZ2UudGV4dCkubGVuZ3RoICsgKHNhbWVMaW5lID8gc3RhcnRDaCA6IDApO1xuICBpZiAoZmlyc3QpIHtcbiAgICAvLyBGaXggdXAgLnRvIHByb3BlcnRpZXMgb2YgZmlyc3RcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpcnN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgc3BhbiA9IGZpcnN0W2ldO1xuICAgICAgaWYgKHNwYW4udG8gPT0gbnVsbCkge1xuICAgICAgICB2YXIgZm91bmQgPSBnZXRNYXJrZWRTcGFuRm9yKGxhc3QsIHNwYW4ubWFya2VyKTtcbiAgICAgICAgaWYgKCFmb3VuZCkgeyBzcGFuLnRvID0gc3RhcnRDaDsgfVxuICAgICAgICBlbHNlIGlmIChzYW1lTGluZSkgeyBzcGFuLnRvID0gZm91bmQudG8gPT0gbnVsbCA/IG51bGwgOiBmb3VuZC50byArIG9mZnNldDsgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAobGFzdCkge1xuICAgIC8vIEZpeCB1cCAuZnJvbSBpbiBsYXN0IChvciBtb3ZlIHRoZW0gaW50byBmaXJzdCBpbiBjYXNlIG9mIHNhbWVMaW5lKVxuICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGxhc3QubGVuZ3RoOyArK2kkMSkge1xuICAgICAgdmFyIHNwYW4kMSA9IGxhc3RbaSQxXTtcbiAgICAgIGlmIChzcGFuJDEudG8gIT0gbnVsbCkgeyBzcGFuJDEudG8gKz0gb2Zmc2V0OyB9XG4gICAgICBpZiAoc3BhbiQxLmZyb20gPT0gbnVsbCkge1xuICAgICAgICB2YXIgZm91bmQkMSA9IGdldE1hcmtlZFNwYW5Gb3IoZmlyc3QsIHNwYW4kMS5tYXJrZXIpO1xuICAgICAgICBpZiAoIWZvdW5kJDEpIHtcbiAgICAgICAgICBzcGFuJDEuZnJvbSA9IG9mZnNldDtcbiAgICAgICAgICBpZiAoc2FtZUxpbmUpIHsgKGZpcnN0IHx8IChmaXJzdCA9IFtdKSkucHVzaChzcGFuJDEpOyB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYW4kMS5mcm9tICs9IG9mZnNldDtcbiAgICAgICAgaWYgKHNhbWVMaW5lKSB7IChmaXJzdCB8fCAoZmlyc3QgPSBbXSkpLnB1c2goc3BhbiQxKTsgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBNYWtlIHN1cmUgd2UgZGlkbid0IGNyZWF0ZSBhbnkgemVyby1sZW5ndGggc3BhbnNcbiAgaWYgKGZpcnN0KSB7IGZpcnN0ID0gY2xlYXJFbXB0eVNwYW5zKGZpcnN0KTsgfVxuICBpZiAobGFzdCAmJiBsYXN0ICE9IGZpcnN0KSB7IGxhc3QgPSBjbGVhckVtcHR5U3BhbnMobGFzdCk7IH1cblxuICB2YXIgbmV3TWFya2VycyA9IFtmaXJzdF07XG4gIGlmICghc2FtZUxpbmUpIHtcbiAgICAvLyBGaWxsIGdhcCB3aXRoIHdob2xlLWxpbmUtc3BhbnNcbiAgICB2YXIgZ2FwID0gY2hhbmdlLnRleHQubGVuZ3RoIC0gMiwgZ2FwTWFya2VycztcbiAgICBpZiAoZ2FwID4gMCAmJiBmaXJzdClcbiAgICAgIHsgZm9yICh2YXIgaSQyID0gMDsgaSQyIDwgZmlyc3QubGVuZ3RoOyArK2kkMilcbiAgICAgICAgeyBpZiAoZmlyc3RbaSQyXS50byA9PSBudWxsKVxuICAgICAgICAgIHsgKGdhcE1hcmtlcnMgfHwgKGdhcE1hcmtlcnMgPSBbXSkpLnB1c2gobmV3IE1hcmtlZFNwYW4oZmlyc3RbaSQyXS5tYXJrZXIsIG51bGwsIG51bGwpKTsgfSB9IH1cbiAgICBmb3IgKHZhciBpJDMgPSAwOyBpJDMgPCBnYXA7ICsraSQzKVxuICAgICAgeyBuZXdNYXJrZXJzLnB1c2goZ2FwTWFya2Vycyk7IH1cbiAgICBuZXdNYXJrZXJzLnB1c2gobGFzdCk7XG4gIH1cbiAgcmV0dXJuIG5ld01hcmtlcnNcbn1cblxuLy8gUmVtb3ZlIHNwYW5zIHRoYXQgYXJlIGVtcHR5IGFuZCBkb24ndCBoYXZlIGEgY2xlYXJXaGVuRW1wdHlcbi8vIG9wdGlvbiBvZiBmYWxzZS5cbmZ1bmN0aW9uIGNsZWFyRW1wdHlTcGFucyhzcGFucykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICBpZiAoc3Bhbi5mcm9tICE9IG51bGwgJiYgc3Bhbi5mcm9tID09IHNwYW4udG8gJiYgc3Bhbi5tYXJrZXIuY2xlYXJXaGVuRW1wdHkgIT09IGZhbHNlKVxuICAgICAgeyBzcGFucy5zcGxpY2UoaS0tLCAxKTsgfVxuICB9XG4gIGlmICghc3BhbnMubGVuZ3RoKSB7IHJldHVybiBudWxsIH1cbiAgcmV0dXJuIHNwYW5zXG59XG5cbi8vIFVzZWQgdG8gJ2NsaXAnIG91dCByZWFkT25seSByYW5nZXMgd2hlbiBtYWtpbmcgYSBjaGFuZ2UuXG5mdW5jdGlvbiByZW1vdmVSZWFkT25seVJhbmdlcyhkb2MsIGZyb20sIHRvKSB7XG4gIHZhciBtYXJrZXJzID0gbnVsbDtcbiAgZG9jLml0ZXIoZnJvbS5saW5lLCB0by5saW5lICsgMSwgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICBpZiAobGluZS5tYXJrZWRTcGFucykgeyBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUubWFya2VkU3BhbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBtYXJrID0gbGluZS5tYXJrZWRTcGFuc1tpXS5tYXJrZXI7XG4gICAgICBpZiAobWFyay5yZWFkT25seSAmJiAoIW1hcmtlcnMgfHwgaW5kZXhPZihtYXJrZXJzLCBtYXJrKSA9PSAtMSkpXG4gICAgICAgIHsgKG1hcmtlcnMgfHwgKG1hcmtlcnMgPSBbXSkpLnB1c2gobWFyayk7IH1cbiAgICB9IH1cbiAgfSk7XG4gIGlmICghbWFya2VycykgeyByZXR1cm4gbnVsbCB9XG4gIHZhciBwYXJ0cyA9IFt7ZnJvbTogZnJvbSwgdG86IHRvfV07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7ICsraSkge1xuICAgIHZhciBtayA9IG1hcmtlcnNbaV0sIG0gPSBtay5maW5kKDApO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyArK2opIHtcbiAgICAgIHZhciBwID0gcGFydHNbal07XG4gICAgICBpZiAoY21wKHAudG8sIG0uZnJvbSkgPCAwIHx8IGNtcChwLmZyb20sIG0udG8pID4gMCkgeyBjb250aW51ZSB9XG4gICAgICB2YXIgbmV3UGFydHMgPSBbaiwgMV0sIGRmcm9tID0gY21wKHAuZnJvbSwgbS5mcm9tKSwgZHRvID0gY21wKHAudG8sIG0udG8pO1xuICAgICAgaWYgKGRmcm9tIDwgMCB8fCAhbWsuaW5jbHVzaXZlTGVmdCAmJiAhZGZyb20pXG4gICAgICAgIHsgbmV3UGFydHMucHVzaCh7ZnJvbTogcC5mcm9tLCB0bzogbS5mcm9tfSk7IH1cbiAgICAgIGlmIChkdG8gPiAwIHx8ICFtay5pbmNsdXNpdmVSaWdodCAmJiAhZHRvKVxuICAgICAgICB7IG5ld1BhcnRzLnB1c2goe2Zyb206IG0udG8sIHRvOiBwLnRvfSk7IH1cbiAgICAgIHBhcnRzLnNwbGljZS5hcHBseShwYXJ0cywgbmV3UGFydHMpO1xuICAgICAgaiArPSBuZXdQYXJ0cy5sZW5ndGggLSAzO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFydHNcbn1cblxuLy8gQ29ubmVjdCBvciBkaXNjb25uZWN0IHNwYW5zIGZyb20gYSBsaW5lLlxuZnVuY3Rpb24gZGV0YWNoTWFya2VkU3BhbnMobGluZSkge1xuICB2YXIgc3BhbnMgPSBsaW5lLm1hcmtlZFNwYW5zO1xuICBpZiAoIXNwYW5zKSB7IHJldHVybiB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhbnMubGVuZ3RoOyArK2kpXG4gICAgeyBzcGFuc1tpXS5tYXJrZXIuZGV0YWNoTGluZShsaW5lKTsgfVxuICBsaW5lLm1hcmtlZFNwYW5zID0gbnVsbDtcbn1cbmZ1bmN0aW9uIGF0dGFjaE1hcmtlZFNwYW5zKGxpbmUsIHNwYW5zKSB7XG4gIGlmICghc3BhbnMpIHsgcmV0dXJuIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSlcbiAgICB7IHNwYW5zW2ldLm1hcmtlci5hdHRhY2hMaW5lKGxpbmUpOyB9XG4gIGxpbmUubWFya2VkU3BhbnMgPSBzcGFucztcbn1cblxuLy8gSGVscGVycyB1c2VkIHdoZW4gY29tcHV0aW5nIHdoaWNoIG92ZXJsYXBwaW5nIGNvbGxhcHNlZCBzcGFuXG4vLyBjb3VudHMgYXMgdGhlIGxhcmdlciBvbmUuXG5mdW5jdGlvbiBleHRyYUxlZnQobWFya2VyKSB7IHJldHVybiBtYXJrZXIuaW5jbHVzaXZlTGVmdCA/IC0xIDogMCB9XG5mdW5jdGlvbiBleHRyYVJpZ2h0KG1hcmtlcikgeyByZXR1cm4gbWFya2VyLmluY2x1c2l2ZVJpZ2h0ID8gMSA6IDAgfVxuXG4vLyBSZXR1cm5zIGEgbnVtYmVyIGluZGljYXRpbmcgd2hpY2ggb2YgdHdvIG92ZXJsYXBwaW5nIGNvbGxhcHNlZFxuLy8gc3BhbnMgaXMgbGFyZ2VyIChhbmQgdGh1cyBpbmNsdWRlcyB0aGUgb3RoZXIpLiBGYWxscyBiYWNrIHRvXG4vLyBjb21wYXJpbmcgaWRzIHdoZW4gdGhlIHNwYW5zIGNvdmVyIGV4YWN0bHkgdGhlIHNhbWUgcmFuZ2UuXG5mdW5jdGlvbiBjb21wYXJlQ29sbGFwc2VkTWFya2VycyhhLCBiKSB7XG4gIHZhciBsZW5EaWZmID0gYS5saW5lcy5sZW5ndGggLSBiLmxpbmVzLmxlbmd0aDtcbiAgaWYgKGxlbkRpZmYgIT0gMCkgeyByZXR1cm4gbGVuRGlmZiB9XG4gIHZhciBhUG9zID0gYS5maW5kKCksIGJQb3MgPSBiLmZpbmQoKTtcbiAgdmFyIGZyb21DbXAgPSBjbXAoYVBvcy5mcm9tLCBiUG9zLmZyb20pIHx8IGV4dHJhTGVmdChhKSAtIGV4dHJhTGVmdChiKTtcbiAgaWYgKGZyb21DbXApIHsgcmV0dXJuIC1mcm9tQ21wIH1cbiAgdmFyIHRvQ21wID0gY21wKGFQb3MudG8sIGJQb3MudG8pIHx8IGV4dHJhUmlnaHQoYSkgLSBleHRyYVJpZ2h0KGIpO1xuICBpZiAodG9DbXApIHsgcmV0dXJuIHRvQ21wIH1cbiAgcmV0dXJuIGIuaWQgLSBhLmlkXG59XG5cbi8vIEZpbmQgb3V0IHdoZXRoZXIgYSBsaW5lIGVuZHMgb3Igc3RhcnRzIGluIGEgY29sbGFwc2VkIHNwYW4uIElmXG4vLyBzbywgcmV0dXJuIHRoZSBtYXJrZXIgZm9yIHRoYXQgc3Bhbi5cbmZ1bmN0aW9uIGNvbGxhcHNlZFNwYW5BdFNpZGUobGluZSwgc3RhcnQpIHtcbiAgdmFyIHNwcyA9IHNhd0NvbGxhcHNlZFNwYW5zICYmIGxpbmUubWFya2VkU3BhbnMsIGZvdW5kO1xuICBpZiAoc3BzKSB7IGZvciAodmFyIHNwID0gKHZvaWQgMCksIGkgPSAwOyBpIDwgc3BzLmxlbmd0aDsgKytpKSB7XG4gICAgc3AgPSBzcHNbaV07XG4gICAgaWYgKHNwLm1hcmtlci5jb2xsYXBzZWQgJiYgKHN0YXJ0ID8gc3AuZnJvbSA6IHNwLnRvKSA9PSBudWxsICYmXG4gICAgICAgICghZm91bmQgfHwgY29tcGFyZUNvbGxhcHNlZE1hcmtlcnMoZm91bmQsIHNwLm1hcmtlcikgPCAwKSlcbiAgICAgIHsgZm91bmQgPSBzcC5tYXJrZXI7IH1cbiAgfSB9XG4gIHJldHVybiBmb3VuZFxufVxuZnVuY3Rpb24gY29sbGFwc2VkU3BhbkF0U3RhcnQobGluZSkgeyByZXR1cm4gY29sbGFwc2VkU3BhbkF0U2lkZShsaW5lLCB0cnVlKSB9XG5mdW5jdGlvbiBjb2xsYXBzZWRTcGFuQXRFbmQobGluZSkgeyByZXR1cm4gY29sbGFwc2VkU3BhbkF0U2lkZShsaW5lLCBmYWxzZSkgfVxuXG4vLyBUZXN0IHdoZXRoZXIgdGhlcmUgZXhpc3RzIGEgY29sbGFwc2VkIHNwYW4gdGhhdCBwYXJ0aWFsbHlcbi8vIG92ZXJsYXBzIChjb3ZlcnMgdGhlIHN0YXJ0IG9yIGVuZCwgYnV0IG5vdCBib3RoKSBvZiBhIG5ldyBzcGFuLlxuLy8gU3VjaCBvdmVybGFwIGlzIG5vdCBhbGxvd2VkLlxuZnVuY3Rpb24gY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIGxpbmVObyQkMSwgZnJvbSwgdG8sIG1hcmtlcikge1xuICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBsaW5lTm8kJDEpO1xuICB2YXIgc3BzID0gc2F3Q29sbGFwc2VkU3BhbnMgJiYgbGluZS5tYXJrZWRTcGFucztcbiAgaWYgKHNwcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHNwcy5sZW5ndGg7ICsraSkge1xuICAgIHZhciBzcCA9IHNwc1tpXTtcbiAgICBpZiAoIXNwLm1hcmtlci5jb2xsYXBzZWQpIHsgY29udGludWUgfVxuICAgIHZhciBmb3VuZCA9IHNwLm1hcmtlci5maW5kKDApO1xuICAgIHZhciBmcm9tQ21wID0gY21wKGZvdW5kLmZyb20sIGZyb20pIHx8IGV4dHJhTGVmdChzcC5tYXJrZXIpIC0gZXh0cmFMZWZ0KG1hcmtlcik7XG4gICAgdmFyIHRvQ21wID0gY21wKGZvdW5kLnRvLCB0bykgfHwgZXh0cmFSaWdodChzcC5tYXJrZXIpIC0gZXh0cmFSaWdodChtYXJrZXIpO1xuICAgIGlmIChmcm9tQ21wID49IDAgJiYgdG9DbXAgPD0gMCB8fCBmcm9tQ21wIDw9IDAgJiYgdG9DbXAgPj0gMCkgeyBjb250aW51ZSB9XG4gICAgaWYgKGZyb21DbXAgPD0gMCAmJiAoc3AubWFya2VyLmluY2x1c2l2ZVJpZ2h0ICYmIG1hcmtlci5pbmNsdXNpdmVMZWZ0ID8gY21wKGZvdW5kLnRvLCBmcm9tKSA+PSAwIDogY21wKGZvdW5kLnRvLCBmcm9tKSA+IDApIHx8XG4gICAgICAgIGZyb21DbXAgPj0gMCAmJiAoc3AubWFya2VyLmluY2x1c2l2ZVJpZ2h0ICYmIG1hcmtlci5pbmNsdXNpdmVMZWZ0ID8gY21wKGZvdW5kLmZyb20sIHRvKSA8PSAwIDogY21wKGZvdW5kLmZyb20sIHRvKSA8IDApKVxuICAgICAgeyByZXR1cm4gdHJ1ZSB9XG4gIH0gfVxufVxuXG4vLyBBIHZpc3VhbCBsaW5lIGlzIGEgbGluZSBhcyBkcmF3biBvbiB0aGUgc2NyZWVuLiBGb2xkaW5nLCBmb3Jcbi8vIGV4YW1wbGUsIGNhbiBjYXVzZSBtdWx0aXBsZSBsb2dpY2FsIGxpbmVzIHRvIGFwcGVhciBvbiB0aGUgc2FtZVxuLy8gdmlzdWFsIGxpbmUuIFRoaXMgZmluZHMgdGhlIHN0YXJ0IG9mIHRoZSB2aXN1YWwgbGluZSB0aGF0IHRoZVxuLy8gZ2l2ZW4gbGluZSBpcyBwYXJ0IG9mICh1c3VhbGx5IHRoYXQgaXMgdGhlIGxpbmUgaXRzZWxmKS5cbmZ1bmN0aW9uIHZpc3VhbExpbmUobGluZSkge1xuICB2YXIgbWVyZ2VkO1xuICB3aGlsZSAobWVyZ2VkID0gY29sbGFwc2VkU3BhbkF0U3RhcnQobGluZSkpXG4gICAgeyBsaW5lID0gbWVyZ2VkLmZpbmQoLTEsIHRydWUpLmxpbmU7IH1cbiAgcmV0dXJuIGxpbmVcbn1cblxuZnVuY3Rpb24gdmlzdWFsTGluZUVuZChsaW5lKSB7XG4gIHZhciBtZXJnZWQ7XG4gIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRFbmQobGluZSkpXG4gICAgeyBsaW5lID0gbWVyZ2VkLmZpbmQoMSwgdHJ1ZSkubGluZTsgfVxuICByZXR1cm4gbGluZVxufVxuXG4vLyBSZXR1cm5zIGFuIGFycmF5IG9mIGxvZ2ljYWwgbGluZXMgdGhhdCBjb250aW51ZSB0aGUgdmlzdWFsIGxpbmVcbi8vIHN0YXJ0ZWQgYnkgdGhlIGFyZ3VtZW50LCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIHN1Y2ggbGluZXMuXG5mdW5jdGlvbiB2aXN1YWxMaW5lQ29udGludWVkKGxpbmUpIHtcbiAgdmFyIG1lcmdlZCwgbGluZXM7XG4gIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRFbmQobGluZSkpIHtcbiAgICBsaW5lID0gbWVyZ2VkLmZpbmQoMSwgdHJ1ZSkubGluZVxuICAgIDsobGluZXMgfHwgKGxpbmVzID0gW10pKS5wdXNoKGxpbmUpO1xuICB9XG4gIHJldHVybiBsaW5lc1xufVxuXG4vLyBHZXQgdGhlIGxpbmUgbnVtYmVyIG9mIHRoZSBzdGFydCBvZiB0aGUgdmlzdWFsIGxpbmUgdGhhdCB0aGVcbi8vIGdpdmVuIGxpbmUgbnVtYmVyIGlzIHBhcnQgb2YuXG5mdW5jdGlvbiB2aXN1YWxMaW5lTm8oZG9jLCBsaW5lTikge1xuICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBsaW5lTiksIHZpcyA9IHZpc3VhbExpbmUobGluZSk7XG4gIGlmIChsaW5lID09IHZpcykgeyByZXR1cm4gbGluZU4gfVxuICByZXR1cm4gbGluZU5vKHZpcylcbn1cblxuLy8gR2V0IHRoZSBsaW5lIG51bWJlciBvZiB0aGUgc3RhcnQgb2YgdGhlIG5leHQgdmlzdWFsIGxpbmUgYWZ0ZXJcbi8vIHRoZSBnaXZlbiBsaW5lLlxuZnVuY3Rpb24gdmlzdWFsTGluZUVuZE5vKGRvYywgbGluZU4pIHtcbiAgaWYgKGxpbmVOID4gZG9jLmxhc3RMaW5lKCkpIHsgcmV0dXJuIGxpbmVOIH1cbiAgdmFyIGxpbmUgPSBnZXRMaW5lKGRvYywgbGluZU4pLCBtZXJnZWQ7XG4gIGlmICghbGluZUlzSGlkZGVuKGRvYywgbGluZSkpIHsgcmV0dXJuIGxpbmVOIH1cbiAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lKSlcbiAgICB7IGxpbmUgPSBtZXJnZWQuZmluZCgxLCB0cnVlKS5saW5lOyB9XG4gIHJldHVybiBsaW5lTm8obGluZSkgKyAxXG59XG5cbi8vIENvbXB1dGUgd2hldGhlciBhIGxpbmUgaXMgaGlkZGVuLiBMaW5lcyBjb3VudCBhcyBoaWRkZW4gd2hlbiB0aGV5XG4vLyBhcmUgcGFydCBvZiBhIHZpc3VhbCBsaW5lIHRoYXQgc3RhcnRzIHdpdGggYW5vdGhlciBsaW5lLCBvciB3aGVuXG4vLyB0aGV5IGFyZSBlbnRpcmVseSBjb3ZlcmVkIGJ5IGNvbGxhcHNlZCwgbm9uLXdpZGdldCBzcGFuLlxuZnVuY3Rpb24gbGluZUlzSGlkZGVuKGRvYywgbGluZSkge1xuICB2YXIgc3BzID0gc2F3Q29sbGFwc2VkU3BhbnMgJiYgbGluZS5tYXJrZWRTcGFucztcbiAgaWYgKHNwcykgeyBmb3IgKHZhciBzcCA9ICh2b2lkIDApLCBpID0gMDsgaSA8IHNwcy5sZW5ndGg7ICsraSkge1xuICAgIHNwID0gc3BzW2ldO1xuICAgIGlmICghc3AubWFya2VyLmNvbGxhcHNlZCkgeyBjb250aW51ZSB9XG4gICAgaWYgKHNwLmZyb20gPT0gbnVsbCkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgaWYgKHNwLm1hcmtlci53aWRnZXROb2RlKSB7IGNvbnRpbnVlIH1cbiAgICBpZiAoc3AuZnJvbSA9PSAwICYmIHNwLm1hcmtlci5pbmNsdXNpdmVMZWZ0ICYmIGxpbmVJc0hpZGRlbklubmVyKGRvYywgbGluZSwgc3ApKVxuICAgICAgeyByZXR1cm4gdHJ1ZSB9XG4gIH0gfVxufVxuZnVuY3Rpb24gbGluZUlzSGlkZGVuSW5uZXIoZG9jLCBsaW5lLCBzcGFuKSB7XG4gIGlmIChzcGFuLnRvID09IG51bGwpIHtcbiAgICB2YXIgZW5kID0gc3Bhbi5tYXJrZXIuZmluZCgxLCB0cnVlKTtcbiAgICByZXR1cm4gbGluZUlzSGlkZGVuSW5uZXIoZG9jLCBlbmQubGluZSwgZ2V0TWFya2VkU3BhbkZvcihlbmQubGluZS5tYXJrZWRTcGFucywgc3Bhbi5tYXJrZXIpKVxuICB9XG4gIGlmIChzcGFuLm1hcmtlci5pbmNsdXNpdmVSaWdodCAmJiBzcGFuLnRvID09IGxpbmUudGV4dC5sZW5ndGgpXG4gICAgeyByZXR1cm4gdHJ1ZSB9XG4gIGZvciAodmFyIHNwID0gKHZvaWQgMCksIGkgPSAwOyBpIDwgbGluZS5tYXJrZWRTcGFucy5sZW5ndGg7ICsraSkge1xuICAgIHNwID0gbGluZS5tYXJrZWRTcGFuc1tpXTtcbiAgICBpZiAoc3AubWFya2VyLmNvbGxhcHNlZCAmJiAhc3AubWFya2VyLndpZGdldE5vZGUgJiYgc3AuZnJvbSA9PSBzcGFuLnRvICYmXG4gICAgICAgIChzcC50byA9PSBudWxsIHx8IHNwLnRvICE9IHNwYW4uZnJvbSkgJiZcbiAgICAgICAgKHNwLm1hcmtlci5pbmNsdXNpdmVMZWZ0IHx8IHNwYW4ubWFya2VyLmluY2x1c2l2ZVJpZ2h0KSAmJlxuICAgICAgICBsaW5lSXNIaWRkZW5Jbm5lcihkb2MsIGxpbmUsIHNwKSkgeyByZXR1cm4gdHJ1ZSB9XG4gIH1cbn1cblxuLy8gRmluZCB0aGUgaGVpZ2h0IGFib3ZlIHRoZSBnaXZlbiBsaW5lLlxuZnVuY3Rpb24gaGVpZ2h0QXRMaW5lKGxpbmVPYmopIHtcbiAgbGluZU9iaiA9IHZpc3VhbExpbmUobGluZU9iaik7XG5cbiAgdmFyIGggPSAwLCBjaHVuayA9IGxpbmVPYmoucGFyZW50O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rLmxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGxpbmUgPSBjaHVuay5saW5lc1tpXTtcbiAgICBpZiAobGluZSA9PSBsaW5lT2JqKSB7IGJyZWFrIH1cbiAgICBlbHNlIHsgaCArPSBsaW5lLmhlaWdodDsgfVxuICB9XG4gIGZvciAodmFyIHAgPSBjaHVuay5wYXJlbnQ7IHA7IGNodW5rID0gcCwgcCA9IGNodW5rLnBhcmVudCkge1xuICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHAuY2hpbGRyZW4ubGVuZ3RoOyArK2kkMSkge1xuICAgICAgdmFyIGN1ciA9IHAuY2hpbGRyZW5baSQxXTtcbiAgICAgIGlmIChjdXIgPT0gY2h1bmspIHsgYnJlYWsgfVxuICAgICAgZWxzZSB7IGggKz0gY3VyLmhlaWdodDsgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gaFxufVxuXG4vLyBDb21wdXRlIHRoZSBjaGFyYWN0ZXIgbGVuZ3RoIG9mIGEgbGluZSwgdGFraW5nIGludG8gYWNjb3VudFxuLy8gY29sbGFwc2VkIHJhbmdlcyAoc2VlIG1hcmtUZXh0KSB0aGF0IG1pZ2h0IGhpZGUgcGFydHMsIGFuZCBqb2luXG4vLyBvdGhlciBsaW5lcyBvbnRvIGl0LlxuZnVuY3Rpb24gbGluZUxlbmd0aChsaW5lKSB7XG4gIGlmIChsaW5lLmhlaWdodCA9PSAwKSB7IHJldHVybiAwIH1cbiAgdmFyIGxlbiA9IGxpbmUudGV4dC5sZW5ndGgsIG1lcmdlZCwgY3VyID0gbGluZTtcbiAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdFN0YXJ0KGN1cikpIHtcbiAgICB2YXIgZm91bmQgPSBtZXJnZWQuZmluZCgwLCB0cnVlKTtcbiAgICBjdXIgPSBmb3VuZC5mcm9tLmxpbmU7XG4gICAgbGVuICs9IGZvdW5kLmZyb20uY2ggLSBmb3VuZC50by5jaDtcbiAgfVxuICBjdXIgPSBsaW5lO1xuICB3aGlsZSAobWVyZ2VkID0gY29sbGFwc2VkU3BhbkF0RW5kKGN1cikpIHtcbiAgICB2YXIgZm91bmQkMSA9IG1lcmdlZC5maW5kKDAsIHRydWUpO1xuICAgIGxlbiAtPSBjdXIudGV4dC5sZW5ndGggLSBmb3VuZCQxLmZyb20uY2g7XG4gICAgY3VyID0gZm91bmQkMS50by5saW5lO1xuICAgIGxlbiArPSBjdXIudGV4dC5sZW5ndGggLSBmb3VuZCQxLnRvLmNoO1xuICB9XG4gIHJldHVybiBsZW5cbn1cblxuLy8gRmluZCB0aGUgbG9uZ2VzdCBsaW5lIGluIHRoZSBkb2N1bWVudC5cbmZ1bmN0aW9uIGZpbmRNYXhMaW5lKGNtKSB7XG4gIHZhciBkID0gY20uZGlzcGxheSwgZG9jID0gY20uZG9jO1xuICBkLm1heExpbmUgPSBnZXRMaW5lKGRvYywgZG9jLmZpcnN0KTtcbiAgZC5tYXhMaW5lTGVuZ3RoID0gbGluZUxlbmd0aChkLm1heExpbmUpO1xuICBkLm1heExpbmVDaGFuZ2VkID0gdHJ1ZTtcbiAgZG9jLml0ZXIoZnVuY3Rpb24gKGxpbmUpIHtcbiAgICB2YXIgbGVuID0gbGluZUxlbmd0aChsaW5lKTtcbiAgICBpZiAobGVuID4gZC5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICBkLm1heExpbmVMZW5ndGggPSBsZW47XG4gICAgICBkLm1heExpbmUgPSBsaW5lO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEJJREkgSEVMUEVSU1xuXG5mdW5jdGlvbiBpdGVyYXRlQmlkaVNlY3Rpb25zKG9yZGVyLCBmcm9tLCB0bywgZikge1xuICBpZiAoIW9yZGVyKSB7IHJldHVybiBmKGZyb20sIHRvLCBcImx0clwiKSB9XG4gIHZhciBmb3VuZCA9IGZhbHNlO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG9yZGVyLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcnQgPSBvcmRlcltpXTtcbiAgICBpZiAocGFydC5mcm9tIDwgdG8gJiYgcGFydC50byA+IGZyb20gfHwgZnJvbSA9PSB0byAmJiBwYXJ0LnRvID09IGZyb20pIHtcbiAgICAgIGYoTWF0aC5tYXgocGFydC5mcm9tLCBmcm9tKSwgTWF0aC5taW4ocGFydC50bywgdG8pLCBwYXJ0LmxldmVsID09IDEgPyBcInJ0bFwiIDogXCJsdHJcIik7XG4gICAgICBmb3VuZCA9IHRydWU7XG4gICAgfVxuICB9XG4gIGlmICghZm91bmQpIHsgZihmcm9tLCB0bywgXCJsdHJcIik7IH1cbn1cblxudmFyIGJpZGlPdGhlciA9IG51bGw7XG5mdW5jdGlvbiBnZXRCaWRpUGFydEF0KG9yZGVyLCBjaCwgc3RpY2t5KSB7XG4gIHZhciBmb3VuZDtcbiAgYmlkaU90aGVyID0gbnVsbDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcmRlci5sZW5ndGg7ICsraSkge1xuICAgIHZhciBjdXIgPSBvcmRlcltpXTtcbiAgICBpZiAoY3VyLmZyb20gPCBjaCAmJiBjdXIudG8gPiBjaCkgeyByZXR1cm4gaSB9XG4gICAgaWYgKGN1ci50byA9PSBjaCkge1xuICAgICAgaWYgKGN1ci5mcm9tICE9IGN1ci50byAmJiBzdGlja3kgPT0gXCJiZWZvcmVcIikgeyBmb3VuZCA9IGk7IH1cbiAgICAgIGVsc2UgeyBiaWRpT3RoZXIgPSBpOyB9XG4gICAgfVxuICAgIGlmIChjdXIuZnJvbSA9PSBjaCkge1xuICAgICAgaWYgKGN1ci5mcm9tICE9IGN1ci50byAmJiBzdGlja3kgIT0gXCJiZWZvcmVcIikgeyBmb3VuZCA9IGk7IH1cbiAgICAgIGVsc2UgeyBiaWRpT3RoZXIgPSBpOyB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmb3VuZCAhPSBudWxsID8gZm91bmQgOiBiaWRpT3RoZXJcbn1cblxuLy8gQmlkaXJlY3Rpb25hbCBvcmRlcmluZyBhbGdvcml0aG1cbi8vIFNlZSBodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjkvdHI5LTEzLmh0bWwgZm9yIHRoZSBhbGdvcml0aG1cbi8vIHRoYXQgdGhpcyAocGFydGlhbGx5KSBpbXBsZW1lbnRzLlxuXG4vLyBPbmUtY2hhciBjb2RlcyB1c2VkIGZvciBjaGFyYWN0ZXIgdHlwZXM6XG4vLyBMIChMKTogICBMZWZ0LXRvLVJpZ2h0XG4vLyBSIChSKTogICBSaWdodC10by1MZWZ0XG4vLyByIChBTCk6ICBSaWdodC10by1MZWZ0IEFyYWJpY1xuLy8gMSAoRU4pOiAgRXVyb3BlYW4gTnVtYmVyXG4vLyArIChFUyk6ICBFdXJvcGVhbiBOdW1iZXIgU2VwYXJhdG9yXG4vLyAlIChFVCk6ICBFdXJvcGVhbiBOdW1iZXIgVGVybWluYXRvclxuLy8gbiAoQU4pOiAgQXJhYmljIE51bWJlclxuLy8gLCAoQ1MpOiAgQ29tbW9uIE51bWJlciBTZXBhcmF0b3Jcbi8vIG0gKE5TTSk6IE5vbi1TcGFjaW5nIE1hcmtcbi8vIGIgKEJOKTogIEJvdW5kYXJ5IE5ldXRyYWxcbi8vIHMgKEIpOiAgIFBhcmFncmFwaCBTZXBhcmF0b3Jcbi8vIHQgKFMpOiAgIFNlZ21lbnQgU2VwYXJhdG9yXG4vLyB3IChXUyk6ICBXaGl0ZXNwYWNlXG4vLyBOIChPTik6ICBPdGhlciBOZXV0cmFsc1xuXG4vLyBSZXR1cm5zIG51bGwgaWYgY2hhcmFjdGVycyBhcmUgb3JkZXJlZCBhcyB0aGV5IGFwcGVhclxuLy8gKGxlZnQtdG8tcmlnaHQpLCBvciBhbiBhcnJheSBvZiBzZWN0aW9ucyAoe2Zyb20sIHRvLCBsZXZlbH1cbi8vIG9iamVjdHMpIGluIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IG9jY3VyIHZpc3VhbGx5LlxudmFyIGJpZGlPcmRlcmluZyA9IChmdW5jdGlvbigpIHtcbiAgLy8gQ2hhcmFjdGVyIHR5cGVzIGZvciBjb2RlcG9pbnRzIDAgdG8gMHhmZlxuICB2YXIgbG93VHlwZXMgPSBcImJiYmJiYmJiYnRzdHdzYmJiYmJiYmJiYmJiYmJzc3N0d05OJSUlTk5OTk5OLE4sTjExMTExMTExMTFOTk5OTk5OTExMTExMTExMTExMTExMTExMTExMTExMTExOTk5OTk5MTExMTExMTExMTExMTExMTExMTExMTExMTE5OTk5iYmJiYmJzYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmIsTiUlJSVOTk5OTE5OTk5OJSUxMU5MTk5OMUxOTk5OTkxMTExMTExMTExMTExMTExMTExMTExMTkxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExOXCI7XG4gIC8vIENoYXJhY3RlciB0eXBlcyBmb3IgY29kZXBvaW50cyAweDYwMCB0byAweDZmOVxuICB2YXIgYXJhYmljVHlwZXMgPSBcIm5ubm5ubk5OciUlcixyTk5tbW1tbW1tbW1tbXJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycm1tbW1tbW1tbW1tbW1tbW1tbW1tbW5ubm5ubm5ubm4lbm5ycnJtcnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJtbW1tbW1tbk5tbW1tbW1ycm1tTm1tbW1ycjExMTExMTExMTFcIjtcbiAgZnVuY3Rpb24gY2hhclR5cGUoY29kZSkge1xuICAgIGlmIChjb2RlIDw9IDB4ZjcpIHsgcmV0dXJuIGxvd1R5cGVzLmNoYXJBdChjb2RlKSB9XG4gICAgZWxzZSBpZiAoMHg1OTAgPD0gY29kZSAmJiBjb2RlIDw9IDB4NWY0KSB7IHJldHVybiBcIlJcIiB9XG4gICAgZWxzZSBpZiAoMHg2MDAgPD0gY29kZSAmJiBjb2RlIDw9IDB4NmY5KSB7IHJldHVybiBhcmFiaWNUeXBlcy5jaGFyQXQoY29kZSAtIDB4NjAwKSB9XG4gICAgZWxzZSBpZiAoMHg2ZWUgPD0gY29kZSAmJiBjb2RlIDw9IDB4OGFjKSB7IHJldHVybiBcInJcIiB9XG4gICAgZWxzZSBpZiAoMHgyMDAwIDw9IGNvZGUgJiYgY29kZSA8PSAweDIwMGIpIHsgcmV0dXJuIFwid1wiIH1cbiAgICBlbHNlIGlmIChjb2RlID09IDB4MjAwYykgeyByZXR1cm4gXCJiXCIgfVxuICAgIGVsc2UgeyByZXR1cm4gXCJMXCIgfVxuICB9XG5cbiAgdmFyIGJpZGlSRSA9IC9bXFx1MDU5MC1cXHUwNWY0XFx1MDYwMC1cXHUwNmZmXFx1MDcwMC1cXHUwOGFjXS87XG4gIHZhciBpc05ldXRyYWwgPSAvW3N0d05dLywgaXNTdHJvbmcgPSAvW0xScl0vLCBjb3VudHNBc0xlZnQgPSAvW0xiMW5dLywgY291bnRzQXNOdW0gPSAvWzFuXS87XG5cbiAgZnVuY3Rpb24gQmlkaVNwYW4obGV2ZWwsIGZyb20sIHRvKSB7XG4gICAgdGhpcy5sZXZlbCA9IGxldmVsO1xuICAgIHRoaXMuZnJvbSA9IGZyb207IHRoaXMudG8gPSB0bztcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihzdHIsIGRpcmVjdGlvbikge1xuICAgIHZhciBvdXRlclR5cGUgPSBkaXJlY3Rpb24gPT0gXCJsdHJcIiA/IFwiTFwiIDogXCJSXCI7XG5cbiAgICBpZiAoc3RyLmxlbmd0aCA9PSAwIHx8IGRpcmVjdGlvbiA9PSBcImx0clwiICYmICFiaWRpUkUudGVzdChzdHIpKSB7IHJldHVybiBmYWxzZSB9XG4gICAgdmFyIGxlbiA9IHN0ci5sZW5ndGgsIHR5cGVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIHsgdHlwZXMucHVzaChjaGFyVHlwZShzdHIuY2hhckNvZGVBdChpKSkpOyB9XG5cbiAgICAvLyBXMS4gRXhhbWluZSBlYWNoIG5vbi1zcGFjaW5nIG1hcmsgKE5TTSkgaW4gdGhlIGxldmVsIHJ1biwgYW5kXG4gICAgLy8gY2hhbmdlIHRoZSB0eXBlIG9mIHRoZSBOU00gdG8gdGhlIHR5cGUgb2YgdGhlIHByZXZpb3VzXG4gICAgLy8gY2hhcmFjdGVyLiBJZiB0aGUgTlNNIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgbGV2ZWwgcnVuLCBpdCB3aWxsXG4gICAgLy8gZ2V0IHRoZSB0eXBlIG9mIHNvci5cbiAgICBmb3IgKHZhciBpJDEgPSAwLCBwcmV2ID0gb3V0ZXJUeXBlOyBpJDEgPCBsZW47ICsraSQxKSB7XG4gICAgICB2YXIgdHlwZSA9IHR5cGVzW2kkMV07XG4gICAgICBpZiAodHlwZSA9PSBcIm1cIikgeyB0eXBlc1tpJDFdID0gcHJldjsgfVxuICAgICAgZWxzZSB7IHByZXYgPSB0eXBlOyB9XG4gICAgfVxuXG4gICAgLy8gVzIuIFNlYXJjaCBiYWNrd2FyZHMgZnJvbSBlYWNoIGluc3RhbmNlIG9mIGEgRXVyb3BlYW4gbnVtYmVyXG4gICAgLy8gdW50aWwgdGhlIGZpcnN0IHN0cm9uZyB0eXBlIChSLCBMLCBBTCwgb3Igc29yKSBpcyBmb3VuZC4gSWYgYW5cbiAgICAvLyBBTCBpcyBmb3VuZCwgY2hhbmdlIHRoZSB0eXBlIG9mIHRoZSBFdXJvcGVhbiBudW1iZXIgdG8gQXJhYmljXG4gICAgLy8gbnVtYmVyLlxuICAgIC8vIFczLiBDaGFuZ2UgYWxsIEFMcyB0byBSLlxuICAgIGZvciAodmFyIGkkMiA9IDAsIGN1ciA9IG91dGVyVHlwZTsgaSQyIDwgbGVuOyArK2kkMikge1xuICAgICAgdmFyIHR5cGUkMSA9IHR5cGVzW2kkMl07XG4gICAgICBpZiAodHlwZSQxID09IFwiMVwiICYmIGN1ciA9PSBcInJcIikgeyB0eXBlc1tpJDJdID0gXCJuXCI7IH1cbiAgICAgIGVsc2UgaWYgKGlzU3Ryb25nLnRlc3QodHlwZSQxKSkgeyBjdXIgPSB0eXBlJDE7IGlmICh0eXBlJDEgPT0gXCJyXCIpIHsgdHlwZXNbaSQyXSA9IFwiUlwiOyB9IH1cbiAgICB9XG5cbiAgICAvLyBXNC4gQSBzaW5nbGUgRXVyb3BlYW4gc2VwYXJhdG9yIGJldHdlZW4gdHdvIEV1cm9wZWFuIG51bWJlcnNcbiAgICAvLyBjaGFuZ2VzIHRvIGEgRXVyb3BlYW4gbnVtYmVyLiBBIHNpbmdsZSBjb21tb24gc2VwYXJhdG9yIGJldHdlZW5cbiAgICAvLyB0d28gbnVtYmVycyBvZiB0aGUgc2FtZSB0eXBlIGNoYW5nZXMgdG8gdGhhdCB0eXBlLlxuICAgIGZvciAodmFyIGkkMyA9IDEsIHByZXYkMSA9IHR5cGVzWzBdOyBpJDMgPCBsZW4gLSAxOyArK2kkMykge1xuICAgICAgdmFyIHR5cGUkMiA9IHR5cGVzW2kkM107XG4gICAgICBpZiAodHlwZSQyID09IFwiK1wiICYmIHByZXYkMSA9PSBcIjFcIiAmJiB0eXBlc1tpJDMrMV0gPT0gXCIxXCIpIHsgdHlwZXNbaSQzXSA9IFwiMVwiOyB9XG4gICAgICBlbHNlIGlmICh0eXBlJDIgPT0gXCIsXCIgJiYgcHJldiQxID09IHR5cGVzW2kkMysxXSAmJlxuICAgICAgICAgICAgICAgKHByZXYkMSA9PSBcIjFcIiB8fCBwcmV2JDEgPT0gXCJuXCIpKSB7IHR5cGVzW2kkM10gPSBwcmV2JDE7IH1cbiAgICAgIHByZXYkMSA9IHR5cGUkMjtcbiAgICB9XG5cbiAgICAvLyBXNS4gQSBzZXF1ZW5jZSBvZiBFdXJvcGVhbiB0ZXJtaW5hdG9ycyBhZGphY2VudCB0byBFdXJvcGVhblxuICAgIC8vIG51bWJlcnMgY2hhbmdlcyB0byBhbGwgRXVyb3BlYW4gbnVtYmVycy5cbiAgICAvLyBXNi4gT3RoZXJ3aXNlLCBzZXBhcmF0b3JzIGFuZCB0ZXJtaW5hdG9ycyBjaGFuZ2UgdG8gT3RoZXJcbiAgICAvLyBOZXV0cmFsLlxuICAgIGZvciAodmFyIGkkNCA9IDA7IGkkNCA8IGxlbjsgKytpJDQpIHtcbiAgICAgIHZhciB0eXBlJDMgPSB0eXBlc1tpJDRdO1xuICAgICAgaWYgKHR5cGUkMyA9PSBcIixcIikgeyB0eXBlc1tpJDRdID0gXCJOXCI7IH1cbiAgICAgIGVsc2UgaWYgKHR5cGUkMyA9PSBcIiVcIikge1xuICAgICAgICB2YXIgZW5kID0gKHZvaWQgMCk7XG4gICAgICAgIGZvciAoZW5kID0gaSQ0ICsgMTsgZW5kIDwgbGVuICYmIHR5cGVzW2VuZF0gPT0gXCIlXCI7ICsrZW5kKSB7fVxuICAgICAgICB2YXIgcmVwbGFjZSA9IChpJDQgJiYgdHlwZXNbaSQ0LTFdID09IFwiIVwiKSB8fCAoZW5kIDwgbGVuICYmIHR5cGVzW2VuZF0gPT0gXCIxXCIpID8gXCIxXCIgOiBcIk5cIjtcbiAgICAgICAgZm9yICh2YXIgaiA9IGkkNDsgaiA8IGVuZDsgKytqKSB7IHR5cGVzW2pdID0gcmVwbGFjZTsgfVxuICAgICAgICBpJDQgPSBlbmQgLSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFc3LiBTZWFyY2ggYmFja3dhcmRzIGZyb20gZWFjaCBpbnN0YW5jZSBvZiBhIEV1cm9wZWFuIG51bWJlclxuICAgIC8vIHVudGlsIHRoZSBmaXJzdCBzdHJvbmcgdHlwZSAoUiwgTCwgb3Igc29yKSBpcyBmb3VuZC4gSWYgYW4gTCBpc1xuICAgIC8vIGZvdW5kLCB0aGVuIGNoYW5nZSB0aGUgdHlwZSBvZiB0aGUgRXVyb3BlYW4gbnVtYmVyIHRvIEwuXG4gICAgZm9yICh2YXIgaSQ1ID0gMCwgY3VyJDEgPSBvdXRlclR5cGU7IGkkNSA8IGxlbjsgKytpJDUpIHtcbiAgICAgIHZhciB0eXBlJDQgPSB0eXBlc1tpJDVdO1xuICAgICAgaWYgKGN1ciQxID09IFwiTFwiICYmIHR5cGUkNCA9PSBcIjFcIikgeyB0eXBlc1tpJDVdID0gXCJMXCI7IH1cbiAgICAgIGVsc2UgaWYgKGlzU3Ryb25nLnRlc3QodHlwZSQ0KSkgeyBjdXIkMSA9IHR5cGUkNDsgfVxuICAgIH1cblxuICAgIC8vIE4xLiBBIHNlcXVlbmNlIG9mIG5ldXRyYWxzIHRha2VzIHRoZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgLy8gc3Vycm91bmRpbmcgc3Ryb25nIHRleHQgaWYgdGhlIHRleHQgb24gYm90aCBzaWRlcyBoYXMgdGhlIHNhbWVcbiAgICAvLyBkaXJlY3Rpb24uIEV1cm9wZWFuIGFuZCBBcmFiaWMgbnVtYmVycyBhY3QgYXMgaWYgdGhleSB3ZXJlIFIgaW5cbiAgICAvLyB0ZXJtcyBvZiB0aGVpciBpbmZsdWVuY2Ugb24gbmV1dHJhbHMuIFN0YXJ0LW9mLWxldmVsLXJ1biAoc29yKVxuICAgIC8vIGFuZCBlbmQtb2YtbGV2ZWwtcnVuIChlb3IpIGFyZSB1c2VkIGF0IGxldmVsIHJ1biBib3VuZGFyaWVzLlxuICAgIC8vIE4yLiBBbnkgcmVtYWluaW5nIG5ldXRyYWxzIHRha2UgdGhlIGVtYmVkZGluZyBkaXJlY3Rpb24uXG4gICAgZm9yICh2YXIgaSQ2ID0gMDsgaSQ2IDwgbGVuOyArK2kkNikge1xuICAgICAgaWYgKGlzTmV1dHJhbC50ZXN0KHR5cGVzW2kkNl0pKSB7XG4gICAgICAgIHZhciBlbmQkMSA9ICh2b2lkIDApO1xuICAgICAgICBmb3IgKGVuZCQxID0gaSQ2ICsgMTsgZW5kJDEgPCBsZW4gJiYgaXNOZXV0cmFsLnRlc3QodHlwZXNbZW5kJDFdKTsgKytlbmQkMSkge31cbiAgICAgICAgdmFyIGJlZm9yZSA9IChpJDYgPyB0eXBlc1tpJDYtMV0gOiBvdXRlclR5cGUpID09IFwiTFwiO1xuICAgICAgICB2YXIgYWZ0ZXIgPSAoZW5kJDEgPCBsZW4gPyB0eXBlc1tlbmQkMV0gOiBvdXRlclR5cGUpID09IFwiTFwiO1xuICAgICAgICB2YXIgcmVwbGFjZSQxID0gYmVmb3JlID09IGFmdGVyID8gKGJlZm9yZSA/IFwiTFwiIDogXCJSXCIpIDogb3V0ZXJUeXBlO1xuICAgICAgICBmb3IgKHZhciBqJDEgPSBpJDY7IGokMSA8IGVuZCQxOyArK2okMSkgeyB0eXBlc1tqJDFdID0gcmVwbGFjZSQxOyB9XG4gICAgICAgIGkkNiA9IGVuZCQxIC0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIZXJlIHdlIGRlcGFydCBmcm9tIHRoZSBkb2N1bWVudGVkIGFsZ29yaXRobSwgaW4gb3JkZXIgdG8gYXZvaWRcbiAgICAvLyBidWlsZGluZyB1cCBhbiBhY3R1YWwgbGV2ZWxzIGFycmF5LiBTaW5jZSB0aGVyZSBhcmUgb25seSB0aHJlZVxuICAgIC8vIGxldmVscyAoMCwgMSwgMikgaW4gYW4gaW1wbGVtZW50YXRpb24gdGhhdCBkb2Vzbid0IHRha2VcbiAgICAvLyBleHBsaWNpdCBlbWJlZGRpbmcgaW50byBhY2NvdW50LCB3ZSBjYW4gYnVpbGQgdXAgdGhlIG9yZGVyIG9uXG4gICAgLy8gdGhlIGZseSwgd2l0aG91dCBmb2xsb3dpbmcgdGhlIGxldmVsLWJhc2VkIGFsZ29yaXRobS5cbiAgICB2YXIgb3JkZXIgPSBbXSwgbTtcbiAgICBmb3IgKHZhciBpJDcgPSAwOyBpJDcgPCBsZW47KSB7XG4gICAgICBpZiAoY291bnRzQXNMZWZ0LnRlc3QodHlwZXNbaSQ3XSkpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gaSQ3O1xuICAgICAgICBmb3IgKCsraSQ3OyBpJDcgPCBsZW4gJiYgY291bnRzQXNMZWZ0LnRlc3QodHlwZXNbaSQ3XSk7ICsraSQ3KSB7fVxuICAgICAgICBvcmRlci5wdXNoKG5ldyBCaWRpU3BhbigwLCBzdGFydCwgaSQ3KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcG9zID0gaSQ3LCBhdCA9IG9yZGVyLmxlbmd0aDtcbiAgICAgICAgZm9yICgrK2kkNzsgaSQ3IDwgbGVuICYmIHR5cGVzW2kkN10gIT0gXCJMXCI7ICsraSQ3KSB7fVxuICAgICAgICBmb3IgKHZhciBqJDIgPSBwb3M7IGokMiA8IGkkNzspIHtcbiAgICAgICAgICBpZiAoY291bnRzQXNOdW0udGVzdCh0eXBlc1tqJDJdKSkge1xuICAgICAgICAgICAgaWYgKHBvcyA8IGokMikgeyBvcmRlci5zcGxpY2UoYXQsIDAsIG5ldyBCaWRpU3BhbigxLCBwb3MsIGokMikpOyB9XG4gICAgICAgICAgICB2YXIgbnN0YXJ0ID0gaiQyO1xuICAgICAgICAgICAgZm9yICgrK2okMjsgaiQyIDwgaSQ3ICYmIGNvdW50c0FzTnVtLnRlc3QodHlwZXNbaiQyXSk7ICsraiQyKSB7fVxuICAgICAgICAgICAgb3JkZXIuc3BsaWNlKGF0LCAwLCBuZXcgQmlkaVNwYW4oMiwgbnN0YXJ0LCBqJDIpKTtcbiAgICAgICAgICAgIHBvcyA9IGokMjtcbiAgICAgICAgICB9IGVsc2UgeyArK2okMjsgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwb3MgPCBpJDcpIHsgb3JkZXIuc3BsaWNlKGF0LCAwLCBuZXcgQmlkaVNwYW4oMSwgcG9zLCBpJDcpKTsgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3JkZXJbMF0ubGV2ZWwgPT0gMSAmJiAobSA9IHN0ci5tYXRjaCgvXlxccysvKSkpIHtcbiAgICAgIG9yZGVyWzBdLmZyb20gPSBtWzBdLmxlbmd0aDtcbiAgICAgIG9yZGVyLnVuc2hpZnQobmV3IEJpZGlTcGFuKDAsIDAsIG1bMF0ubGVuZ3RoKSk7XG4gICAgfVxuICAgIGlmIChsc3Qob3JkZXIpLmxldmVsID09IDEgJiYgKG0gPSBzdHIubWF0Y2goL1xccyskLykpKSB7XG4gICAgICBsc3Qob3JkZXIpLnRvIC09IG1bMF0ubGVuZ3RoO1xuICAgICAgb3JkZXIucHVzaChuZXcgQmlkaVNwYW4oMCwgbGVuIC0gbVswXS5sZW5ndGgsIGxlbikpO1xuICAgIH1cblxuICAgIHJldHVybiBkaXJlY3Rpb24gPT0gXCJydGxcIiA/IG9yZGVyLnJldmVyc2UoKSA6IG9yZGVyXG4gIH1cbn0pKCk7XG5cbi8vIEdldCB0aGUgYmlkaSBvcmRlcmluZyBmb3IgdGhlIGdpdmVuIGxpbmUgKGFuZCBjYWNoZSBpdCkuIFJldHVybnNcbi8vIGZhbHNlIGZvciBsaW5lcyB0aGF0IGFyZSBmdWxseSBsZWZ0LXRvLXJpZ2h0LCBhbmQgYW4gYXJyYXkgb2Zcbi8vIEJpZGlTcGFuIG9iamVjdHMgb3RoZXJ3aXNlLlxuZnVuY3Rpb24gZ2V0T3JkZXIobGluZSwgZGlyZWN0aW9uKSB7XG4gIHZhciBvcmRlciA9IGxpbmUub3JkZXI7XG4gIGlmIChvcmRlciA9PSBudWxsKSB7IG9yZGVyID0gbGluZS5vcmRlciA9IGJpZGlPcmRlcmluZyhsaW5lLnRleHQsIGRpcmVjdGlvbik7IH1cbiAgcmV0dXJuIG9yZGVyXG59XG5cbmZ1bmN0aW9uIG1vdmVDaGFyTG9naWNhbGx5KGxpbmUsIGNoLCBkaXIpIHtcbiAgdmFyIHRhcmdldCA9IHNraXBFeHRlbmRpbmdDaGFycyhsaW5lLnRleHQsIGNoICsgZGlyLCBkaXIpO1xuICByZXR1cm4gdGFyZ2V0IDwgMCB8fCB0YXJnZXQgPiBsaW5lLnRleHQubGVuZ3RoID8gbnVsbCA6IHRhcmdldFxufVxuXG5mdW5jdGlvbiBtb3ZlTG9naWNhbGx5KGxpbmUsIHN0YXJ0LCBkaXIpIHtcbiAgdmFyIGNoID0gbW92ZUNoYXJMb2dpY2FsbHkobGluZSwgc3RhcnQuY2gsIGRpcik7XG4gIHJldHVybiBjaCA9PSBudWxsID8gbnVsbCA6IG5ldyBQb3Moc3RhcnQubGluZSwgY2gsIGRpciA8IDAgPyBcImFmdGVyXCIgOiBcImJlZm9yZVwiKVxufVxuXG5mdW5jdGlvbiBlbmRPZkxpbmUodmlzdWFsbHksIGNtLCBsaW5lT2JqLCBsaW5lTm8sIGRpcikge1xuICBpZiAodmlzdWFsbHkpIHtcbiAgICB2YXIgb3JkZXIgPSBnZXRPcmRlcihsaW5lT2JqLCBjbS5kb2MuZGlyZWN0aW9uKTtcbiAgICBpZiAob3JkZXIpIHtcbiAgICAgIHZhciBwYXJ0ID0gZGlyIDwgMCA/IGxzdChvcmRlcikgOiBvcmRlclswXTtcbiAgICAgIHZhciBtb3ZlSW5TdG9yYWdlT3JkZXIgPSAoZGlyIDwgMCkgPT0gKHBhcnQubGV2ZWwgPT0gMSk7XG4gICAgICB2YXIgc3RpY2t5ID0gbW92ZUluU3RvcmFnZU9yZGVyID8gXCJhZnRlclwiIDogXCJiZWZvcmVcIjtcbiAgICAgIHZhciBjaDtcbiAgICAgIC8vIFdpdGggYSB3cmFwcGVkIHJ0bCBjaHVuayAocG9zc2libHkgc3Bhbm5pbmcgbXVsdGlwbGUgYmlkaSBwYXJ0cyksXG4gICAgICAvLyBpdCBjb3VsZCBiZSB0aGF0IHRoZSBsYXN0IGJpZGkgcGFydCBpcyBub3Qgb24gdGhlIGxhc3QgdmlzdWFsIGxpbmUsXG4gICAgICAvLyBzaW5jZSB2aXN1YWwgbGluZXMgY29udGFpbiBjb250ZW50IG9yZGVyLWNvbnNlY3V0aXZlIGNodW5rcy5cbiAgICAgIC8vIFRodXMsIGluIHJ0bCwgd2UgYXJlIGxvb2tpbmcgZm9yIHRoZSBmaXJzdCAoY29udGVudC1vcmRlcikgY2hhcmFjdGVyXG4gICAgICAvLyBpbiB0aGUgcnRsIGNodW5rIHRoYXQgaXMgb24gdGhlIGxhc3QgbGluZSAodGhhdCBpcywgdGhlIHNhbWUgbGluZVxuICAgICAgLy8gYXMgdGhlIGxhc3QgKGNvbnRlbnQtb3JkZXIpIGNoYXJhY3RlcikuXG4gICAgICBpZiAocGFydC5sZXZlbCA+IDApIHtcbiAgICAgICAgdmFyIHByZXAgPSBwcmVwYXJlTWVhc3VyZUZvckxpbmUoY20sIGxpbmVPYmopO1xuICAgICAgICBjaCA9IGRpciA8IDAgPyBsaW5lT2JqLnRleHQubGVuZ3RoIC0gMSA6IDA7XG4gICAgICAgIHZhciB0YXJnZXRUb3AgPSBtZWFzdXJlQ2hhclByZXBhcmVkKGNtLCBwcmVwLCBjaCkudG9wO1xuICAgICAgICBjaCA9IGZpbmRGaXJzdChmdW5jdGlvbiAoY2gpIHsgcmV0dXJuIG1lYXN1cmVDaGFyUHJlcGFyZWQoY20sIHByZXAsIGNoKS50b3AgPT0gdGFyZ2V0VG9wOyB9LCAoZGlyIDwgMCkgPT0gKHBhcnQubGV2ZWwgPT0gMSkgPyBwYXJ0LmZyb20gOiBwYXJ0LnRvIC0gMSwgY2gpO1xuICAgICAgICBpZiAoc3RpY2t5ID09IFwiYmVmb3JlXCIpIHsgY2ggPSBtb3ZlQ2hhckxvZ2ljYWxseShsaW5lT2JqLCBjaCwgMSk7IH1cbiAgICAgIH0gZWxzZSB7IGNoID0gZGlyIDwgMCA/IHBhcnQudG8gOiBwYXJ0LmZyb207IH1cbiAgICAgIHJldHVybiBuZXcgUG9zKGxpbmVObywgY2gsIHN0aWNreSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ldyBQb3MobGluZU5vLCBkaXIgPCAwID8gbGluZU9iai50ZXh0Lmxlbmd0aCA6IDAsIGRpciA8IDAgPyBcImJlZm9yZVwiIDogXCJhZnRlclwiKVxufVxuXG5mdW5jdGlvbiBtb3ZlVmlzdWFsbHkoY20sIGxpbmUsIHN0YXJ0LCBkaXIpIHtcbiAgdmFyIGJpZGkgPSBnZXRPcmRlcihsaW5lLCBjbS5kb2MuZGlyZWN0aW9uKTtcbiAgaWYgKCFiaWRpKSB7IHJldHVybiBtb3ZlTG9naWNhbGx5KGxpbmUsIHN0YXJ0LCBkaXIpIH1cbiAgaWYgKHN0YXJ0LmNoID49IGxpbmUudGV4dC5sZW5ndGgpIHtcbiAgICBzdGFydC5jaCA9IGxpbmUudGV4dC5sZW5ndGg7XG4gICAgc3RhcnQuc3RpY2t5ID0gXCJiZWZvcmVcIjtcbiAgfSBlbHNlIGlmIChzdGFydC5jaCA8PSAwKSB7XG4gICAgc3RhcnQuY2ggPSAwO1xuICAgIHN0YXJ0LnN0aWNreSA9IFwiYWZ0ZXJcIjtcbiAgfVxuICB2YXIgcGFydFBvcyA9IGdldEJpZGlQYXJ0QXQoYmlkaSwgc3RhcnQuY2gsIHN0YXJ0LnN0aWNreSksIHBhcnQgPSBiaWRpW3BhcnRQb3NdO1xuICBpZiAoY20uZG9jLmRpcmVjdGlvbiA9PSBcImx0clwiICYmIHBhcnQubGV2ZWwgJSAyID09IDAgJiYgKGRpciA+IDAgPyBwYXJ0LnRvID4gc3RhcnQuY2ggOiBwYXJ0LmZyb20gPCBzdGFydC5jaCkpIHtcbiAgICAvLyBDYXNlIDE6IFdlIG1vdmUgd2l0aGluIGFuIGx0ciBwYXJ0IGluIGFuIGx0ciBlZGl0b3IuIEV2ZW4gd2l0aCB3cmFwcGVkIGxpbmVzLFxuICAgIC8vIG5vdGhpbmcgaW50ZXJlc3RpbmcgaGFwcGVucy5cbiAgICByZXR1cm4gbW92ZUxvZ2ljYWxseShsaW5lLCBzdGFydCwgZGlyKVxuICB9XG5cbiAgdmFyIG12ID0gZnVuY3Rpb24gKHBvcywgZGlyKSB7IHJldHVybiBtb3ZlQ2hhckxvZ2ljYWxseShsaW5lLCBwb3MgaW5zdGFuY2VvZiBQb3MgPyBwb3MuY2ggOiBwb3MsIGRpcik7IH07XG4gIHZhciBwcmVwO1xuICB2YXIgZ2V0V3JhcHBlZExpbmVFeHRlbnQgPSBmdW5jdGlvbiAoY2gpIHtcbiAgICBpZiAoIWNtLm9wdGlvbnMubGluZVdyYXBwaW5nKSB7IHJldHVybiB7YmVnaW46IDAsIGVuZDogbGluZS50ZXh0Lmxlbmd0aH0gfVxuICAgIHByZXAgPSBwcmVwIHx8IHByZXBhcmVNZWFzdXJlRm9yTGluZShjbSwgbGluZSk7XG4gICAgcmV0dXJuIHdyYXBwZWRMaW5lRXh0ZW50Q2hhcihjbSwgbGluZSwgcHJlcCwgY2gpXG4gIH07XG4gIHZhciB3cmFwcGVkTGluZUV4dGVudCA9IGdldFdyYXBwZWRMaW5lRXh0ZW50KHN0YXJ0LnN0aWNreSA9PSBcImJlZm9yZVwiID8gbXYoc3RhcnQsIC0xKSA6IHN0YXJ0LmNoKTtcblxuICBpZiAoY20uZG9jLmRpcmVjdGlvbiA9PSBcInJ0bFwiIHx8IHBhcnQubGV2ZWwgPT0gMSkge1xuICAgIHZhciBtb3ZlSW5TdG9yYWdlT3JkZXIgPSAocGFydC5sZXZlbCA9PSAxKSA9PSAoZGlyIDwgMCk7XG4gICAgdmFyIGNoID0gbXYoc3RhcnQsIG1vdmVJblN0b3JhZ2VPcmRlciA/IDEgOiAtMSk7XG4gICAgaWYgKGNoICE9IG51bGwgJiYgKCFtb3ZlSW5TdG9yYWdlT3JkZXIgPyBjaCA+PSBwYXJ0LmZyb20gJiYgY2ggPj0gd3JhcHBlZExpbmVFeHRlbnQuYmVnaW4gOiBjaCA8PSBwYXJ0LnRvICYmIGNoIDw9IHdyYXBwZWRMaW5lRXh0ZW50LmVuZCkpIHtcbiAgICAgIC8vIENhc2UgMjogV2UgbW92ZSB3aXRoaW4gYW4gcnRsIHBhcnQgb3IgaW4gYW4gcnRsIGVkaXRvciBvbiB0aGUgc2FtZSB2aXN1YWwgbGluZVxuICAgICAgdmFyIHN0aWNreSA9IG1vdmVJblN0b3JhZ2VPcmRlciA/IFwiYmVmb3JlXCIgOiBcImFmdGVyXCI7XG4gICAgICByZXR1cm4gbmV3IFBvcyhzdGFydC5saW5lLCBjaCwgc3RpY2t5KVxuICAgIH1cbiAgfVxuXG4gIC8vIENhc2UgMzogQ291bGQgbm90IG1vdmUgd2l0aGluIHRoaXMgYmlkaSBwYXJ0IGluIHRoaXMgdmlzdWFsIGxpbmUsIHNvIGxlYXZlXG4gIC8vIHRoZSBjdXJyZW50IGJpZGkgcGFydFxuXG4gIHZhciBzZWFyY2hJblZpc3VhbExpbmUgPSBmdW5jdGlvbiAocGFydFBvcywgZGlyLCB3cmFwcGVkTGluZUV4dGVudCkge1xuICAgIHZhciBnZXRSZXMgPSBmdW5jdGlvbiAoY2gsIG1vdmVJblN0b3JhZ2VPcmRlcikgeyByZXR1cm4gbW92ZUluU3RvcmFnZU9yZGVyXG4gICAgICA/IG5ldyBQb3Moc3RhcnQubGluZSwgbXYoY2gsIDEpLCBcImJlZm9yZVwiKVxuICAgICAgOiBuZXcgUG9zKHN0YXJ0LmxpbmUsIGNoLCBcImFmdGVyXCIpOyB9O1xuXG4gICAgZm9yICg7IHBhcnRQb3MgPj0gMCAmJiBwYXJ0UG9zIDwgYmlkaS5sZW5ndGg7IHBhcnRQb3MgKz0gZGlyKSB7XG4gICAgICB2YXIgcGFydCA9IGJpZGlbcGFydFBvc107XG4gICAgICB2YXIgbW92ZUluU3RvcmFnZU9yZGVyID0gKGRpciA+IDApID09IChwYXJ0LmxldmVsICE9IDEpO1xuICAgICAgdmFyIGNoID0gbW92ZUluU3RvcmFnZU9yZGVyID8gd3JhcHBlZExpbmVFeHRlbnQuYmVnaW4gOiBtdih3cmFwcGVkTGluZUV4dGVudC5lbmQsIC0xKTtcbiAgICAgIGlmIChwYXJ0LmZyb20gPD0gY2ggJiYgY2ggPCBwYXJ0LnRvKSB7IHJldHVybiBnZXRSZXMoY2gsIG1vdmVJblN0b3JhZ2VPcmRlcikgfVxuICAgICAgY2ggPSBtb3ZlSW5TdG9yYWdlT3JkZXIgPyBwYXJ0LmZyb20gOiBtdihwYXJ0LnRvLCAtMSk7XG4gICAgICBpZiAod3JhcHBlZExpbmVFeHRlbnQuYmVnaW4gPD0gY2ggJiYgY2ggPCB3cmFwcGVkTGluZUV4dGVudC5lbmQpIHsgcmV0dXJuIGdldFJlcyhjaCwgbW92ZUluU3RvcmFnZU9yZGVyKSB9XG4gICAgfVxuICB9O1xuXG4gIC8vIENhc2UgM2E6IExvb2sgZm9yIG90aGVyIGJpZGkgcGFydHMgb24gdGhlIHNhbWUgdmlzdWFsIGxpbmVcbiAgdmFyIHJlcyA9IHNlYXJjaEluVmlzdWFsTGluZShwYXJ0UG9zICsgZGlyLCBkaXIsIHdyYXBwZWRMaW5lRXh0ZW50KTtcbiAgaWYgKHJlcykgeyByZXR1cm4gcmVzIH1cblxuICAvLyBDYXNlIDNiOiBMb29rIGZvciBvdGhlciBiaWRpIHBhcnRzIG9uIHRoZSBuZXh0IHZpc3VhbCBsaW5lXG4gIHZhciBuZXh0Q2ggPSBkaXIgPiAwID8gd3JhcHBlZExpbmVFeHRlbnQuZW5kIDogbXYod3JhcHBlZExpbmVFeHRlbnQuYmVnaW4sIC0xKTtcbiAgaWYgKG5leHRDaCAhPSBudWxsICYmICEoZGlyID4gMCAmJiBuZXh0Q2ggPT0gbGluZS50ZXh0Lmxlbmd0aCkpIHtcbiAgICByZXMgPSBzZWFyY2hJblZpc3VhbExpbmUoZGlyID4gMCA/IDAgOiBiaWRpLmxlbmd0aCAtIDEsIGRpciwgZ2V0V3JhcHBlZExpbmVFeHRlbnQobmV4dENoKSk7XG4gICAgaWYgKHJlcykgeyByZXR1cm4gcmVzIH1cbiAgfVxuXG4gIC8vIENhc2UgNDogTm93aGVyZSB0byBtb3ZlXG4gIHJldHVybiBudWxsXG59XG5cbi8vIEVWRU5UIEhBTkRMSU5HXG5cbi8vIExpZ2h0d2VpZ2h0IGV2ZW50IGZyYW1ld29yay4gb24vb2ZmIGFsc28gd29yayBvbiBET00gbm9kZXMsXG4vLyByZWdpc3RlcmluZyBuYXRpdmUgRE9NIGhhbmRsZXJzLlxuXG52YXIgbm9IYW5kbGVycyA9IFtdO1xuXG52YXIgb24gPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlLCBmKSB7XG4gIGlmIChlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZiwgZmFsc2UpO1xuICB9IGVsc2UgaWYgKGVtaXR0ZXIuYXR0YWNoRXZlbnQpIHtcbiAgICBlbWl0dGVyLmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGYpO1xuICB9IGVsc2Uge1xuICAgIHZhciBtYXAkJDEgPSBlbWl0dGVyLl9oYW5kbGVycyB8fCAoZW1pdHRlci5faGFuZGxlcnMgPSB7fSk7XG4gICAgbWFwJCQxW3R5cGVdID0gKG1hcCQkMVt0eXBlXSB8fCBub0hhbmRsZXJzKS5jb25jYXQoZik7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldEhhbmRsZXJzKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIuX2hhbmRsZXJzICYmIGVtaXR0ZXIuX2hhbmRsZXJzW3R5cGVdIHx8IG5vSGFuZGxlcnNcbn1cblxuZnVuY3Rpb24gb2ZmKGVtaXR0ZXIsIHR5cGUsIGYpIHtcbiAgaWYgKGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgIGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmLCBmYWxzZSk7XG4gIH0gZWxzZSBpZiAoZW1pdHRlci5kZXRhY2hFdmVudCkge1xuICAgIGVtaXR0ZXIuZGV0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgZik7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1hcCQkMSA9IGVtaXR0ZXIuX2hhbmRsZXJzLCBhcnIgPSBtYXAkJDEgJiYgbWFwJCQxW3R5cGVdO1xuICAgIGlmIChhcnIpIHtcbiAgICAgIHZhciBpbmRleCA9IGluZGV4T2YoYXJyLCBmKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKVxuICAgICAgICB7IG1hcCQkMVt0eXBlXSA9IGFyci5zbGljZSgwLCBpbmRleCkuY29uY2F0KGFyci5zbGljZShpbmRleCArIDEpKTsgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaWduYWwoZW1pdHRlciwgdHlwZSAvKiwgdmFsdWVzLi4uKi8pIHtcbiAgdmFyIGhhbmRsZXJzID0gZ2V0SGFuZGxlcnMoZW1pdHRlciwgdHlwZSk7XG4gIGlmICghaGFuZGxlcnMubGVuZ3RoKSB7IHJldHVybiB9XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7ICsraSkgeyBoYW5kbGVyc1tpXS5hcHBseShudWxsLCBhcmdzKTsgfVxufVxuXG4vLyBUaGUgRE9NIGV2ZW50cyB0aGF0IENvZGVNaXJyb3IgaGFuZGxlcyBjYW4gYmUgb3ZlcnJpZGRlbiBieVxuLy8gcmVnaXN0ZXJpbmcgYSAobm9uLURPTSkgaGFuZGxlciBvbiB0aGUgZWRpdG9yIGZvciB0aGUgZXZlbnQgbmFtZSxcbi8vIGFuZCBwcmV2ZW50RGVmYXVsdC1pbmcgdGhlIGV2ZW50IGluIHRoYXQgaGFuZGxlci5cbmZ1bmN0aW9uIHNpZ25hbERPTUV2ZW50KGNtLCBlLCBvdmVycmlkZSkge1xuICBpZiAodHlwZW9mIGUgPT0gXCJzdHJpbmdcIilcbiAgICB7IGUgPSB7dHlwZTogZSwgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkgeyB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlOyB9fTsgfVxuICBzaWduYWwoY20sIG92ZXJyaWRlIHx8IGUudHlwZSwgY20sIGUpO1xuICByZXR1cm4gZV9kZWZhdWx0UHJldmVudGVkKGUpIHx8IGUuY29kZW1pcnJvcklnbm9yZVxufVxuXG5mdW5jdGlvbiBzaWduYWxDdXJzb3JBY3Rpdml0eShjbSkge1xuICB2YXIgYXJyID0gY20uX2hhbmRsZXJzICYmIGNtLl9oYW5kbGVycy5jdXJzb3JBY3Rpdml0eTtcbiAgaWYgKCFhcnIpIHsgcmV0dXJuIH1cbiAgdmFyIHNldCA9IGNtLmN1ck9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnMgfHwgKGNtLmN1ck9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnMgPSBbXSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7IGlmIChpbmRleE9mKHNldCwgYXJyW2ldKSA9PSAtMSlcbiAgICB7IHNldC5wdXNoKGFycltpXSk7IH0gfVxufVxuXG5mdW5jdGlvbiBoYXNIYW5kbGVyKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGdldEhhbmRsZXJzKGVtaXR0ZXIsIHR5cGUpLmxlbmd0aCA+IDBcbn1cblxuLy8gQWRkIG9uIGFuZCBvZmYgbWV0aG9kcyB0byBhIGNvbnN0cnVjdG9yJ3MgcHJvdG90eXBlLCB0byBtYWtlXG4vLyByZWdpc3RlcmluZyBldmVudHMgb24gc3VjaCBvYmplY3RzIG1vcmUgY29udmVuaWVudC5cbmZ1bmN0aW9uIGV2ZW50TWl4aW4oY3Rvcikge1xuICBjdG9yLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGYpIHtvbih0aGlzLCB0eXBlLCBmKTt9O1xuICBjdG9yLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbih0eXBlLCBmKSB7b2ZmKHRoaXMsIHR5cGUsIGYpO307XG59XG5cbi8vIER1ZSB0byB0aGUgZmFjdCB0aGF0IHdlIHN0aWxsIHN1cHBvcnQganVyYXNzaWMgSUUgdmVyc2lvbnMsIHNvbWVcbi8vIGNvbXBhdGliaWxpdHkgd3JhcHBlcnMgYXJlIG5lZWRlZC5cblxuZnVuY3Rpb24gZV9wcmV2ZW50RGVmYXVsdChlKSB7XG4gIGlmIChlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICBlbHNlIHsgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9XG59XG5mdW5jdGlvbiBlX3N0b3BQcm9wYWdhdGlvbihlKSB7XG4gIGlmIChlLnN0b3BQcm9wYWdhdGlvbikgeyBlLnN0b3BQcm9wYWdhdGlvbigpOyB9XG4gIGVsc2UgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH1cbn1cbmZ1bmN0aW9uIGVfZGVmYXVsdFByZXZlbnRlZChlKSB7XG4gIHJldHVybiBlLmRlZmF1bHRQcmV2ZW50ZWQgIT0gbnVsbCA/IGUuZGVmYXVsdFByZXZlbnRlZCA6IGUucmV0dXJuVmFsdWUgPT0gZmFsc2Vcbn1cbmZ1bmN0aW9uIGVfc3RvcChlKSB7ZV9wcmV2ZW50RGVmYXVsdChlKTsgZV9zdG9wUHJvcGFnYXRpb24oZSk7fVxuXG5mdW5jdGlvbiBlX3RhcmdldChlKSB7cmV0dXJuIGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudH1cbmZ1bmN0aW9uIGVfYnV0dG9uKGUpIHtcbiAgdmFyIGIgPSBlLndoaWNoO1xuICBpZiAoYiA9PSBudWxsKSB7XG4gICAgaWYgKGUuYnV0dG9uICYgMSkgeyBiID0gMTsgfVxuICAgIGVsc2UgaWYgKGUuYnV0dG9uICYgMikgeyBiID0gMzsgfVxuICAgIGVsc2UgaWYgKGUuYnV0dG9uICYgNCkgeyBiID0gMjsgfVxuICB9XG4gIGlmIChtYWMgJiYgZS5jdHJsS2V5ICYmIGIgPT0gMSkgeyBiID0gMzsgfVxuICByZXR1cm4gYlxufVxuXG4vLyBEZXRlY3QgZHJhZy1hbmQtZHJvcFxudmFyIGRyYWdBbmREcm9wID0gZnVuY3Rpb24oKSB7XG4gIC8vIFRoZXJlIGlzICpzb21lKiBraW5kIG9mIGRyYWctYW5kLWRyb3Agc3VwcG9ydCBpbiBJRTYtOCwgYnV0IElcbiAgLy8gY291bGRuJ3QgZ2V0IGl0IHRvIHdvcmsgeWV0LlxuICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgdmFyIGRpdiA9IGVsdCgnZGl2Jyk7XG4gIHJldHVybiBcImRyYWdnYWJsZVwiIGluIGRpdiB8fCBcImRyYWdEcm9wXCIgaW4gZGl2XG59KCk7XG5cbnZhciB6d3NwU3VwcG9ydGVkO1xuZnVuY3Rpb24gemVyb1dpZHRoRWxlbWVudChtZWFzdXJlKSB7XG4gIGlmICh6d3NwU3VwcG9ydGVkID09IG51bGwpIHtcbiAgICB2YXIgdGVzdCA9IGVsdChcInNwYW5cIiwgXCJcXHUyMDBiXCIpO1xuICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKG1lYXN1cmUsIGVsdChcInNwYW5cIiwgW3Rlc3QsIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwieFwiKV0pKTtcbiAgICBpZiAobWVhc3VyZS5maXJzdENoaWxkLm9mZnNldEhlaWdodCAhPSAwKVxuICAgICAgeyB6d3NwU3VwcG9ydGVkID0gdGVzdC5vZmZzZXRXaWR0aCA8PSAxICYmIHRlc3Qub2Zmc2V0SGVpZ2h0ID4gMiAmJiAhKGllICYmIGllX3ZlcnNpb24gPCA4KTsgfVxuICB9XG4gIHZhciBub2RlID0gendzcFN1cHBvcnRlZCA/IGVsdChcInNwYW5cIiwgXCJcXHUyMDBiXCIpIDpcbiAgICBlbHQoXCJzcGFuXCIsIFwiXFx1MDBhMFwiLCBudWxsLCBcImRpc3BsYXk6IGlubGluZS1ibG9jazsgd2lkdGg6IDFweDsgbWFyZ2luLXJpZ2h0OiAtMXB4XCIpO1xuICBub2RlLnNldEF0dHJpYnV0ZShcImNtLXRleHRcIiwgXCJcIik7XG4gIHJldHVybiBub2RlXG59XG5cbi8vIEZlYXR1cmUtZGV0ZWN0IElFJ3MgY3J1bW15IGNsaWVudCByZWN0IHJlcG9ydGluZyBmb3IgYmlkaSB0ZXh0XG52YXIgYmFkQmlkaVJlY3RzO1xuZnVuY3Rpb24gaGFzQmFkQmlkaVJlY3RzKG1lYXN1cmUpIHtcbiAgaWYgKGJhZEJpZGlSZWN0cyAhPSBudWxsKSB7IHJldHVybiBiYWRCaWRpUmVjdHMgfVxuICB2YXIgdHh0ID0gcmVtb3ZlQ2hpbGRyZW5BbmRBZGQobWVhc3VyZSwgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJBXFx1MDYyZUFcIikpO1xuICB2YXIgcjAgPSByYW5nZSh0eHQsIDAsIDEpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgcjEgPSByYW5nZSh0eHQsIDEsIDIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZW1vdmVDaGlsZHJlbihtZWFzdXJlKTtcbiAgaWYgKCFyMCB8fCByMC5sZWZ0ID09IHIwLnJpZ2h0KSB7IHJldHVybiBmYWxzZSB9IC8vIFNhZmFyaSByZXR1cm5zIG51bGwgaW4gc29tZSBjYXNlcyAoIzI3ODApXG4gIHJldHVybiBiYWRCaWRpUmVjdHMgPSAocjEucmlnaHQgLSByMC5yaWdodCA8IDMpXG59XG5cbi8vIFNlZSBpZiBcIlwiLnNwbGl0IGlzIHRoZSBicm9rZW4gSUUgdmVyc2lvbiwgaWYgc28sIHByb3ZpZGUgYW5cbi8vIGFsdGVybmF0aXZlIHdheSB0byBzcGxpdCBsaW5lcy5cbnZhciBzcGxpdExpbmVzQXV0byA9IFwiXFxuXFxuYlwiLnNwbGl0KC9cXG4vKS5sZW5ndGggIT0gMyA/IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgdmFyIHBvcyA9IDAsIHJlc3VsdCA9IFtdLCBsID0gc3RyaW5nLmxlbmd0aDtcbiAgd2hpbGUgKHBvcyA8PSBsKSB7XG4gICAgdmFyIG5sID0gc3RyaW5nLmluZGV4T2YoXCJcXG5cIiwgcG9zKTtcbiAgICBpZiAobmwgPT0gLTEpIHsgbmwgPSBzdHJpbmcubGVuZ3RoOyB9XG4gICAgdmFyIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zLCBzdHJpbmcuY2hhckF0KG5sIC0gMSkgPT0gXCJcXHJcIiA/IG5sIC0gMSA6IG5sKTtcbiAgICB2YXIgcnQgPSBsaW5lLmluZGV4T2YoXCJcXHJcIik7XG4gICAgaWYgKHJ0ICE9IC0xKSB7XG4gICAgICByZXN1bHQucHVzaChsaW5lLnNsaWNlKDAsIHJ0KSk7XG4gICAgICBwb3MgKz0gcnQgKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucHVzaChsaW5lKTtcbiAgICAgIHBvcyA9IG5sICsgMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufSA6IGZ1bmN0aW9uIChzdHJpbmcpIHsgcmV0dXJuIHN0cmluZy5zcGxpdCgvXFxyXFxuP3xcXG4vKTsgfTtcblxudmFyIGhhc1NlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24gPyBmdW5jdGlvbiAodGUpIHtcbiAgdHJ5IHsgcmV0dXJuIHRlLnNlbGVjdGlvblN0YXJ0ICE9IHRlLnNlbGVjdGlvbkVuZCB9XG4gIGNhdGNoKGUpIHsgcmV0dXJuIGZhbHNlIH1cbn0gOiBmdW5jdGlvbiAodGUpIHtcbiAgdmFyIHJhbmdlJCQxO1xuICB0cnkge3JhbmdlJCQxID0gdGUub3duZXJEb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTt9XG4gIGNhdGNoKGUpIHt9XG4gIGlmICghcmFuZ2UkJDEgfHwgcmFuZ2UkJDEucGFyZW50RWxlbWVudCgpICE9IHRlKSB7IHJldHVybiBmYWxzZSB9XG4gIHJldHVybiByYW5nZSQkMS5jb21wYXJlRW5kUG9pbnRzKFwiU3RhcnRUb0VuZFwiLCByYW5nZSQkMSkgIT0gMFxufTtcblxudmFyIGhhc0NvcHlFdmVudCA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBlID0gZWx0KFwiZGl2XCIpO1xuICBpZiAoXCJvbmNvcHlcIiBpbiBlKSB7IHJldHVybiB0cnVlIH1cbiAgZS5zZXRBdHRyaWJ1dGUoXCJvbmNvcHlcIiwgXCJyZXR1cm47XCIpO1xuICByZXR1cm4gdHlwZW9mIGUub25jb3B5ID09IFwiZnVuY3Rpb25cIlxufSkoKTtcblxudmFyIGJhZFpvb21lZFJlY3RzID0gbnVsbDtcbmZ1bmN0aW9uIGhhc0JhZFpvb21lZFJlY3RzKG1lYXN1cmUpIHtcbiAgaWYgKGJhZFpvb21lZFJlY3RzICE9IG51bGwpIHsgcmV0dXJuIGJhZFpvb21lZFJlY3RzIH1cbiAgdmFyIG5vZGUgPSByZW1vdmVDaGlsZHJlbkFuZEFkZChtZWFzdXJlLCBlbHQoXCJzcGFuXCIsIFwieFwiKSk7XG4gIHZhciBub3JtYWwgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgZnJvbVJhbmdlID0gcmFuZ2Uobm9kZSwgMCwgMSkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiBiYWRab29tZWRSZWN0cyA9IE1hdGguYWJzKG5vcm1hbC5sZWZ0IC0gZnJvbVJhbmdlLmxlZnQpID4gMVxufVxuXG4vLyBLbm93biBtb2RlcywgYnkgbmFtZSBhbmQgYnkgTUlNRVxudmFyIG1vZGVzID0ge307XG52YXIgbWltZU1vZGVzID0ge307XG5cbi8vIEV4dHJhIGFyZ3VtZW50cyBhcmUgc3RvcmVkIGFzIHRoZSBtb2RlJ3MgZGVwZW5kZW5jaWVzLCB3aGljaCBpc1xuLy8gdXNlZCBieSAobGVnYWN5KSBtZWNoYW5pc21zIGxpa2UgbG9hZG1vZGUuanMgdG8gYXV0b21hdGljYWxseVxuLy8gbG9hZCBhIG1vZGUuIChQcmVmZXJyZWQgbWVjaGFuaXNtIGlzIHRoZSByZXF1aXJlL2RlZmluZSBjYWxscy4pXG5mdW5jdGlvbiBkZWZpbmVNb2RlKG5hbWUsIG1vZGUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKVxuICAgIHsgbW9kZS5kZXBlbmRlbmNpZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpOyB9XG4gIG1vZGVzW25hbWVdID0gbW9kZTtcbn1cblxuZnVuY3Rpb24gZGVmaW5lTUlNRShtaW1lLCBzcGVjKSB7XG4gIG1pbWVNb2Rlc1ttaW1lXSA9IHNwZWM7XG59XG5cbi8vIEdpdmVuIGEgTUlNRSB0eXBlLCBhIHtuYW1lLCAuLi5vcHRpb25zfSBjb25maWcgb2JqZWN0LCBvciBhIG5hbWVcbi8vIHN0cmluZywgcmV0dXJuIGEgbW9kZSBjb25maWcgb2JqZWN0LlxuZnVuY3Rpb24gcmVzb2x2ZU1vZGUoc3BlYykge1xuICBpZiAodHlwZW9mIHNwZWMgPT0gXCJzdHJpbmdcIiAmJiBtaW1lTW9kZXMuaGFzT3duUHJvcGVydHkoc3BlYykpIHtcbiAgICBzcGVjID0gbWltZU1vZGVzW3NwZWNdO1xuICB9IGVsc2UgaWYgKHNwZWMgJiYgdHlwZW9mIHNwZWMubmFtZSA9PSBcInN0cmluZ1wiICYmIG1pbWVNb2Rlcy5oYXNPd25Qcm9wZXJ0eShzcGVjLm5hbWUpKSB7XG4gICAgdmFyIGZvdW5kID0gbWltZU1vZGVzW3NwZWMubmFtZV07XG4gICAgaWYgKHR5cGVvZiBmb3VuZCA9PSBcInN0cmluZ1wiKSB7IGZvdW5kID0ge25hbWU6IGZvdW5kfTsgfVxuICAgIHNwZWMgPSBjcmVhdGVPYmooZm91bmQsIHNwZWMpO1xuICAgIHNwZWMubmFtZSA9IGZvdW5kLm5hbWU7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNwZWMgPT0gXCJzdHJpbmdcIiAmJiAvXltcXHdcXC1dK1xcL1tcXHdcXC1dK1xcK3htbCQvLnRlc3Qoc3BlYykpIHtcbiAgICByZXR1cm4gcmVzb2x2ZU1vZGUoXCJhcHBsaWNhdGlvbi94bWxcIilcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc3BlYyA9PSBcInN0cmluZ1wiICYmIC9eW1xcd1xcLV0rXFwvW1xcd1xcLV0rXFwranNvbiQvLnRlc3Qoc3BlYykpIHtcbiAgICByZXR1cm4gcmVzb2x2ZU1vZGUoXCJhcHBsaWNhdGlvbi9qc29uXCIpXG4gIH1cbiAgaWYgKHR5cGVvZiBzcGVjID09IFwic3RyaW5nXCIpIHsgcmV0dXJuIHtuYW1lOiBzcGVjfSB9XG4gIGVsc2UgeyByZXR1cm4gc3BlYyB8fCB7bmFtZTogXCJudWxsXCJ9IH1cbn1cblxuLy8gR2l2ZW4gYSBtb2RlIHNwZWMgKGFueXRoaW5nIHRoYXQgcmVzb2x2ZU1vZGUgYWNjZXB0cyksIGZpbmQgYW5kXG4vLyBpbml0aWFsaXplIGFuIGFjdHVhbCBtb2RlIG9iamVjdC5cbmZ1bmN0aW9uIGdldE1vZGUob3B0aW9ucywgc3BlYykge1xuICBzcGVjID0gcmVzb2x2ZU1vZGUoc3BlYyk7XG4gIHZhciBtZmFjdG9yeSA9IG1vZGVzW3NwZWMubmFtZV07XG4gIGlmICghbWZhY3RvcnkpIHsgcmV0dXJuIGdldE1vZGUob3B0aW9ucywgXCJ0ZXh0L3BsYWluXCIpIH1cbiAgdmFyIG1vZGVPYmogPSBtZmFjdG9yeShvcHRpb25zLCBzcGVjKTtcbiAgaWYgKG1vZGVFeHRlbnNpb25zLmhhc093blByb3BlcnR5KHNwZWMubmFtZSkpIHtcbiAgICB2YXIgZXh0cyA9IG1vZGVFeHRlbnNpb25zW3NwZWMubmFtZV07XG4gICAgZm9yICh2YXIgcHJvcCBpbiBleHRzKSB7XG4gICAgICBpZiAoIWV4dHMuaGFzT3duUHJvcGVydHkocHJvcCkpIHsgY29udGludWUgfVxuICAgICAgaWYgKG1vZGVPYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHsgbW9kZU9ialtcIl9cIiArIHByb3BdID0gbW9kZU9ialtwcm9wXTsgfVxuICAgICAgbW9kZU9ialtwcm9wXSA9IGV4dHNbcHJvcF07XG4gICAgfVxuICB9XG4gIG1vZGVPYmoubmFtZSA9IHNwZWMubmFtZTtcbiAgaWYgKHNwZWMuaGVscGVyVHlwZSkgeyBtb2RlT2JqLmhlbHBlclR5cGUgPSBzcGVjLmhlbHBlclR5cGU7IH1cbiAgaWYgKHNwZWMubW9kZVByb3BzKSB7IGZvciAodmFyIHByb3AkMSBpbiBzcGVjLm1vZGVQcm9wcylcbiAgICB7IG1vZGVPYmpbcHJvcCQxXSA9IHNwZWMubW9kZVByb3BzW3Byb3AkMV07IH0gfVxuXG4gIHJldHVybiBtb2RlT2JqXG59XG5cbi8vIFRoaXMgY2FuIGJlIHVzZWQgdG8gYXR0YWNoIHByb3BlcnRpZXMgdG8gbW9kZSBvYmplY3RzIGZyb21cbi8vIG91dHNpZGUgdGhlIGFjdHVhbCBtb2RlIGRlZmluaXRpb24uXG52YXIgbW9kZUV4dGVuc2lvbnMgPSB7fTtcbmZ1bmN0aW9uIGV4dGVuZE1vZGUobW9kZSwgcHJvcGVydGllcykge1xuICB2YXIgZXh0cyA9IG1vZGVFeHRlbnNpb25zLmhhc093blByb3BlcnR5KG1vZGUpID8gbW9kZUV4dGVuc2lvbnNbbW9kZV0gOiAobW9kZUV4dGVuc2lvbnNbbW9kZV0gPSB7fSk7XG4gIGNvcHlPYmoocHJvcGVydGllcywgZXh0cyk7XG59XG5cbmZ1bmN0aW9uIGNvcHlTdGF0ZShtb2RlLCBzdGF0ZSkge1xuICBpZiAoc3RhdGUgPT09IHRydWUpIHsgcmV0dXJuIHN0YXRlIH1cbiAgaWYgKG1vZGUuY29weVN0YXRlKSB7IHJldHVybiBtb2RlLmNvcHlTdGF0ZShzdGF0ZSkgfVxuICB2YXIgbnN0YXRlID0ge307XG4gIGZvciAodmFyIG4gaW4gc3RhdGUpIHtcbiAgICB2YXIgdmFsID0gc3RhdGVbbl07XG4gICAgaWYgKHZhbCBpbnN0YW5jZW9mIEFycmF5KSB7IHZhbCA9IHZhbC5jb25jYXQoW10pOyB9XG4gICAgbnN0YXRlW25dID0gdmFsO1xuICB9XG4gIHJldHVybiBuc3RhdGVcbn1cblxuLy8gR2l2ZW4gYSBtb2RlIGFuZCBhIHN0YXRlIChmb3IgdGhhdCBtb2RlKSwgZmluZCB0aGUgaW5uZXIgbW9kZSBhbmRcbi8vIHN0YXRlIGF0IHRoZSBwb3NpdGlvbiB0aGF0IHRoZSBzdGF0ZSByZWZlcnMgdG8uXG5mdW5jdGlvbiBpbm5lck1vZGUobW9kZSwgc3RhdGUpIHtcbiAgdmFyIGluZm87XG4gIHdoaWxlIChtb2RlLmlubmVyTW9kZSkge1xuICAgIGluZm8gPSBtb2RlLmlubmVyTW9kZShzdGF0ZSk7XG4gICAgaWYgKCFpbmZvIHx8IGluZm8ubW9kZSA9PSBtb2RlKSB7IGJyZWFrIH1cbiAgICBzdGF0ZSA9IGluZm8uc3RhdGU7XG4gICAgbW9kZSA9IGluZm8ubW9kZTtcbiAgfVxuICByZXR1cm4gaW5mbyB8fCB7bW9kZTogbW9kZSwgc3RhdGU6IHN0YXRlfVxufVxuXG5mdW5jdGlvbiBzdGFydFN0YXRlKG1vZGUsIGExLCBhMikge1xuICByZXR1cm4gbW9kZS5zdGFydFN0YXRlID8gbW9kZS5zdGFydFN0YXRlKGExLCBhMikgOiB0cnVlXG59XG5cbi8vIFNUUklORyBTVFJFQU1cblxuLy8gRmVkIHRvIHRoZSBtb2RlIHBhcnNlcnMsIHByb3ZpZGVzIGhlbHBlciBmdW5jdGlvbnMgdG8gbWFrZVxuLy8gcGFyc2VycyBtb3JlIHN1Y2NpbmN0LlxuXG52YXIgU3RyaW5nU3RyZWFtID0gZnVuY3Rpb24oc3RyaW5nLCB0YWJTaXplKSB7XG4gIHRoaXMucG9zID0gdGhpcy5zdGFydCA9IDA7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuICB0aGlzLnRhYlNpemUgPSB0YWJTaXplIHx8IDg7XG4gIHRoaXMubGFzdENvbHVtblBvcyA9IHRoaXMubGFzdENvbHVtblZhbHVlID0gMDtcbiAgdGhpcy5saW5lU3RhcnQgPSAwO1xufTtcblxuU3RyaW5nU3RyZWFtLnByb3RvdHlwZS5lb2wgPSBmdW5jdGlvbiAoKSB7cmV0dXJuIHRoaXMucG9zID49IHRoaXMuc3RyaW5nLmxlbmd0aH07XG5TdHJpbmdTdHJlYW0ucHJvdG90eXBlLnNvbCA9IGZ1bmN0aW9uICgpIHtyZXR1cm4gdGhpcy5wb3MgPT0gdGhpcy5saW5lU3RhcnR9O1xuU3RyaW5nU3RyZWFtLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24gKCkge3JldHVybiB0aGlzLnN0cmluZy5jaGFyQXQodGhpcy5wb3MpIHx8IHVuZGVmaW5lZH07XG5TdHJpbmdTdHJlYW0ucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnBvcyA8IHRoaXMuc3RyaW5nLmxlbmd0aClcbiAgICB7IHJldHVybiB0aGlzLnN0cmluZy5jaGFyQXQodGhpcy5wb3MrKykgfVxufTtcblN0cmluZ1N0cmVhbS5wcm90b3R5cGUuZWF0ID0gZnVuY3Rpb24gKG1hdGNoKSB7XG4gIHZhciBjaCA9IHRoaXMuc3RyaW5nLmNoYXJBdCh0aGlzLnBvcyk7XG4gIHZhciBvaztcbiAgaWYgKHR5cGVvZiBtYXRjaCA9PSBcInN0cmluZ1wiKSB7IG9rID0gY2ggPT0gbWF0Y2g7IH1cbiAgZWxzZSB7IG9rID0gY2ggJiYgKG1hdGNoLnRlc3QgPyBtYXRjaC50ZXN0KGNoKSA6IG1hdGNoKGNoKSk7IH1cbiAgaWYgKG9rKSB7Kyt0aGlzLnBvczsgcmV0dXJuIGNofVxufTtcblN0cmluZ1N0cmVhbS5wcm90b3R5cGUuZWF0V2hpbGUgPSBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgdmFyIHN0YXJ0ID0gdGhpcy5wb3M7XG4gIHdoaWxlICh0aGlzLmVhdChtYXRjaCkpe31cbiAgcmV0dXJuIHRoaXMucG9zID4gc3RhcnRcbn07XG5TdHJpbmdTdHJlYW0ucHJvdG90eXBlLmVhdFNwYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciBzdGFydCA9IHRoaXMucG9zO1xuICB3aGlsZSAoL1tcXHNcXHUwMGEwXS8udGVzdCh0aGlzLnN0cmluZy5jaGFyQXQodGhpcy5wb3MpKSkgeyArK3RoaXMkMS5wb3M7IH1cbiAgcmV0dXJuIHRoaXMucG9zID4gc3RhcnRcbn07XG5TdHJpbmdTdHJlYW0ucHJvdG90eXBlLnNraXBUb0VuZCA9IGZ1bmN0aW9uICgpIHt0aGlzLnBvcyA9IHRoaXMuc3RyaW5nLmxlbmd0aDt9O1xuU3RyaW5nU3RyZWFtLnByb3RvdHlwZS5za2lwVG8gPSBmdW5jdGlvbiAoY2gpIHtcbiAgdmFyIGZvdW5kID0gdGhpcy5zdHJpbmcuaW5kZXhPZihjaCwgdGhpcy5wb3MpO1xuICBpZiAoZm91bmQgPiAtMSkge3RoaXMucG9zID0gZm91bmQ7IHJldHVybiB0cnVlfVxufTtcblN0cmluZ1N0cmVhbS5wcm90b3R5cGUuYmFja1VwID0gZnVuY3Rpb24gKG4pIHt0aGlzLnBvcyAtPSBuO307XG5TdHJpbmdTdHJlYW0ucHJvdG90eXBlLmNvbHVtbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMubGFzdENvbHVtblBvcyA8IHRoaXMuc3RhcnQpIHtcbiAgICB0aGlzLmxhc3RDb2x1bW5WYWx1ZSA9IGNvdW50Q29sdW1uKHRoaXMuc3RyaW5nLCB0aGlzLnN0YXJ0LCB0aGlzLnRhYlNpemUsIHRoaXMubGFzdENvbHVtblBvcywgdGhpcy5sYXN0Q29sdW1uVmFsdWUpO1xuICAgIHRoaXMubGFzdENvbHVtblBvcyA9IHRoaXMuc3RhcnQ7XG4gIH1cbiAgcmV0dXJuIHRoaXMubGFzdENvbHVtblZhbHVlIC0gKHRoaXMubGluZVN0YXJ0ID8gY291bnRDb2x1bW4odGhpcy5zdHJpbmcsIHRoaXMubGluZVN0YXJ0LCB0aGlzLnRhYlNpemUpIDogMClcbn07XG5TdHJpbmdTdHJlYW0ucHJvdG90eXBlLmluZGVudGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gY291bnRDb2x1bW4odGhpcy5zdHJpbmcsIG51bGwsIHRoaXMudGFiU2l6ZSkgLVxuICAgICh0aGlzLmxpbmVTdGFydCA/IGNvdW50Q29sdW1uKHRoaXMuc3RyaW5nLCB0aGlzLmxpbmVTdGFydCwgdGhpcy50YWJTaXplKSA6IDApXG59O1xuU3RyaW5nU3RyZWFtLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBjb25zdW1lLCBjYXNlSW5zZW5zaXRpdmUpIHtcbiAgaWYgKHR5cGVvZiBwYXR0ZXJuID09IFwic3RyaW5nXCIpIHtcbiAgICB2YXIgY2FzZWQgPSBmdW5jdGlvbiAoc3RyKSB7IHJldHVybiBjYXNlSW5zZW5zaXRpdmUgPyBzdHIudG9Mb3dlckNhc2UoKSA6IHN0cjsgfTtcbiAgICB2YXIgc3Vic3RyID0gdGhpcy5zdHJpbmcuc3Vic3RyKHRoaXMucG9zLCBwYXR0ZXJuLmxlbmd0aCk7XG4gICAgaWYgKGNhc2VkKHN1YnN0cikgPT0gY2FzZWQocGF0dGVybikpIHtcbiAgICAgIGlmIChjb25zdW1lICE9PSBmYWxzZSkgeyB0aGlzLnBvcyArPSBwYXR0ZXJuLmxlbmd0aDsgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1hdGNoID0gdGhpcy5zdHJpbmcuc2xpY2UodGhpcy5wb3MpLm1hdGNoKHBhdHRlcm4pO1xuICAgIGlmIChtYXRjaCAmJiBtYXRjaC5pbmRleCA+IDApIHsgcmV0dXJuIG51bGwgfVxuICAgIGlmIChtYXRjaCAmJiBjb25zdW1lICE9PSBmYWxzZSkgeyB0aGlzLnBvcyArPSBtYXRjaFswXS5sZW5ndGg7IH1cbiAgICByZXR1cm4gbWF0Y2hcbiAgfVxufTtcblN0cmluZ1N0cmVhbS5wcm90b3R5cGUuY3VycmVudCA9IGZ1bmN0aW9uICgpe3JldHVybiB0aGlzLnN0cmluZy5zbGljZSh0aGlzLnN0YXJ0LCB0aGlzLnBvcyl9O1xuU3RyaW5nU3RyZWFtLnByb3RvdHlwZS5oaWRlRmlyc3RDaGFycyA9IGZ1bmN0aW9uIChuLCBpbm5lcikge1xuICB0aGlzLmxpbmVTdGFydCArPSBuO1xuICB0cnkgeyByZXR1cm4gaW5uZXIoKSB9XG4gIGZpbmFsbHkgeyB0aGlzLmxpbmVTdGFydCAtPSBuOyB9XG59O1xuXG4vLyBDb21wdXRlIGEgc3R5bGUgYXJyYXkgKGFuIGFycmF5IHN0YXJ0aW5nIHdpdGggYSBtb2RlIGdlbmVyYXRpb25cbi8vIC0tIGZvciBpbnZhbGlkYXRpb24gLS0gZm9sbG93ZWQgYnkgcGFpcnMgb2YgZW5kIHBvc2l0aW9ucyBhbmRcbi8vIHN0eWxlIHN0cmluZ3MpLCB3aGljaCBpcyB1c2VkIHRvIGhpZ2hsaWdodCB0aGUgdG9rZW5zIG9uIHRoZVxuLy8gbGluZS5cbmZ1bmN0aW9uIGhpZ2hsaWdodExpbmUoY20sIGxpbmUsIHN0YXRlLCBmb3JjZVRvRW5kKSB7XG4gIC8vIEEgc3R5bGVzIGFycmF5IGFsd2F5cyBzdGFydHMgd2l0aCBhIG51bWJlciBpZGVudGlmeWluZyB0aGVcbiAgLy8gbW9kZS9vdmVybGF5cyB0aGF0IGl0IGlzIGJhc2VkIG9uIChmb3IgZWFzeSBpbnZhbGlkYXRpb24pLlxuICB2YXIgc3QgPSBbY20uc3RhdGUubW9kZUdlbl0sIGxpbmVDbGFzc2VzID0ge307XG4gIC8vIENvbXB1dGUgdGhlIGJhc2UgYXJyYXkgb2Ygc3R5bGVzXG4gIHJ1bk1vZGUoY20sIGxpbmUudGV4dCwgY20uZG9jLm1vZGUsIHN0YXRlLCBmdW5jdGlvbiAoZW5kLCBzdHlsZSkgeyByZXR1cm4gc3QucHVzaChlbmQsIHN0eWxlKTsgfSxcbiAgICBsaW5lQ2xhc3NlcywgZm9yY2VUb0VuZCk7XG5cbiAgLy8gUnVuIG92ZXJsYXlzLCBhZGp1c3Qgc3R5bGUgYXJyYXkuXG4gIHZhciBsb29wID0gZnVuY3Rpb24gKCBvICkge1xuICAgIHZhciBvdmVybGF5ID0gY20uc3RhdGUub3ZlcmxheXNbb10sIGkgPSAxLCBhdCA9IDA7XG4gICAgcnVuTW9kZShjbSwgbGluZS50ZXh0LCBvdmVybGF5Lm1vZGUsIHRydWUsIGZ1bmN0aW9uIChlbmQsIHN0eWxlKSB7XG4gICAgICB2YXIgc3RhcnQgPSBpO1xuICAgICAgLy8gRW5zdXJlIHRoZXJlJ3MgYSB0b2tlbiBlbmQgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb24sIGFuZCB0aGF0IGkgcG9pbnRzIGF0IGl0XG4gICAgICB3aGlsZSAoYXQgPCBlbmQpIHtcbiAgICAgICAgdmFyIGlfZW5kID0gc3RbaV07XG4gICAgICAgIGlmIChpX2VuZCA+IGVuZClcbiAgICAgICAgICB7IHN0LnNwbGljZShpLCAxLCBlbmQsIHN0W2krMV0sIGlfZW5kKTsgfVxuICAgICAgICBpICs9IDI7XG4gICAgICAgIGF0ID0gTWF0aC5taW4oZW5kLCBpX2VuZCk7XG4gICAgICB9XG4gICAgICBpZiAoIXN0eWxlKSB7IHJldHVybiB9XG4gICAgICBpZiAob3ZlcmxheS5vcGFxdWUpIHtcbiAgICAgICAgc3Quc3BsaWNlKHN0YXJ0LCBpIC0gc3RhcnQsIGVuZCwgXCJvdmVybGF5IFwiICsgc3R5bGUpO1xuICAgICAgICBpID0gc3RhcnQgKyAyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICg7IHN0YXJ0IDwgaTsgc3RhcnQgKz0gMikge1xuICAgICAgICAgIHZhciBjdXIgPSBzdFtzdGFydCsxXTtcbiAgICAgICAgICBzdFtzdGFydCsxXSA9IChjdXIgPyBjdXIgKyBcIiBcIiA6IFwiXCIpICsgXCJvdmVybGF5IFwiICsgc3R5bGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBsaW5lQ2xhc3Nlcyk7XG4gIH07XG5cbiAgZm9yICh2YXIgbyA9IDA7IG8gPCBjbS5zdGF0ZS5vdmVybGF5cy5sZW5ndGg7ICsrbykgbG9vcCggbyApO1xuXG4gIHJldHVybiB7c3R5bGVzOiBzdCwgY2xhc3NlczogbGluZUNsYXNzZXMuYmdDbGFzcyB8fCBsaW5lQ2xhc3Nlcy50ZXh0Q2xhc3MgPyBsaW5lQ2xhc3NlcyA6IG51bGx9XG59XG5cbmZ1bmN0aW9uIGdldExpbmVTdHlsZXMoY20sIGxpbmUsIHVwZGF0ZUZyb250aWVyKSB7XG4gIGlmICghbGluZS5zdHlsZXMgfHwgbGluZS5zdHlsZXNbMF0gIT0gY20uc3RhdGUubW9kZUdlbikge1xuICAgIHZhciBzdGF0ZSA9IGdldFN0YXRlQmVmb3JlKGNtLCBsaW5lTm8obGluZSkpO1xuICAgIHZhciByZXN1bHQgPSBoaWdobGlnaHRMaW5lKGNtLCBsaW5lLCBsaW5lLnRleHQubGVuZ3RoID4gY20ub3B0aW9ucy5tYXhIaWdobGlnaHRMZW5ndGggPyBjb3B5U3RhdGUoY20uZG9jLm1vZGUsIHN0YXRlKSA6IHN0YXRlKTtcbiAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBzdGF0ZTtcbiAgICBsaW5lLnN0eWxlcyA9IHJlc3VsdC5zdHlsZXM7XG4gICAgaWYgKHJlc3VsdC5jbGFzc2VzKSB7IGxpbmUuc3R5bGVDbGFzc2VzID0gcmVzdWx0LmNsYXNzZXM7IH1cbiAgICBlbHNlIGlmIChsaW5lLnN0eWxlQ2xhc3NlcykgeyBsaW5lLnN0eWxlQ2xhc3NlcyA9IG51bGw7IH1cbiAgICBpZiAodXBkYXRlRnJvbnRpZXIgPT09IGNtLmRvYy5mcm9udGllcikgeyBjbS5kb2MuZnJvbnRpZXIrKzsgfVxuICB9XG4gIHJldHVybiBsaW5lLnN0eWxlc1xufVxuXG5mdW5jdGlvbiBnZXRTdGF0ZUJlZm9yZShjbSwgbiwgcHJlY2lzZSkge1xuICB2YXIgZG9jID0gY20uZG9jLCBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgaWYgKCFkb2MubW9kZS5zdGFydFN0YXRlKSB7IHJldHVybiB0cnVlIH1cbiAgdmFyIHBvcyA9IGZpbmRTdGFydExpbmUoY20sIG4sIHByZWNpc2UpLCBzdGF0ZSA9IHBvcyA+IGRvYy5maXJzdCAmJiBnZXRMaW5lKGRvYywgcG9zLTEpLnN0YXRlQWZ0ZXI7XG4gIGlmICghc3RhdGUpIHsgc3RhdGUgPSBzdGFydFN0YXRlKGRvYy5tb2RlKTsgfVxuICBlbHNlIHsgc3RhdGUgPSBjb3B5U3RhdGUoZG9jLm1vZGUsIHN0YXRlKTsgfVxuICBkb2MuaXRlcihwb3MsIG4sIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgcHJvY2Vzc0xpbmUoY20sIGxpbmUudGV4dCwgc3RhdGUpO1xuICAgIHZhciBzYXZlID0gcG9zID09IG4gLSAxIHx8IHBvcyAlIDUgPT0gMCB8fCBwb3MgPj0gZGlzcGxheS52aWV3RnJvbSAmJiBwb3MgPCBkaXNwbGF5LnZpZXdUbztcbiAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBzYXZlID8gY29weVN0YXRlKGRvYy5tb2RlLCBzdGF0ZSkgOiBudWxsO1xuICAgICsrcG9zO1xuICB9KTtcbiAgaWYgKHByZWNpc2UpIHsgZG9jLmZyb250aWVyID0gcG9zOyB9XG4gIHJldHVybiBzdGF0ZVxufVxuXG4vLyBMaWdodHdlaWdodCBmb3JtIG9mIGhpZ2hsaWdodCAtLSBwcm9jZWVkIG92ZXIgdGhpcyBsaW5lIGFuZFxuLy8gdXBkYXRlIHN0YXRlLCBidXQgZG9uJ3Qgc2F2ZSBhIHN0eWxlIGFycmF5LiBVc2VkIGZvciBsaW5lcyB0aGF0XG4vLyBhcmVuJ3QgY3VycmVudGx5IHZpc2libGUuXG5mdW5jdGlvbiBwcm9jZXNzTGluZShjbSwgdGV4dCwgc3RhdGUsIHN0YXJ0QXQpIHtcbiAgdmFyIG1vZGUgPSBjbS5kb2MubW9kZTtcbiAgdmFyIHN0cmVhbSA9IG5ldyBTdHJpbmdTdHJlYW0odGV4dCwgY20ub3B0aW9ucy50YWJTaXplKTtcbiAgc3RyZWFtLnN0YXJ0ID0gc3RyZWFtLnBvcyA9IHN0YXJ0QXQgfHwgMDtcbiAgaWYgKHRleHQgPT0gXCJcIikgeyBjYWxsQmxhbmtMaW5lKG1vZGUsIHN0YXRlKTsgfVxuICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgIHJlYWRUb2tlbihtb2RlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICBzdHJlYW0uc3RhcnQgPSBzdHJlYW0ucG9zO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGxCbGFua0xpbmUobW9kZSwgc3RhdGUpIHtcbiAgaWYgKG1vZGUuYmxhbmtMaW5lKSB7IHJldHVybiBtb2RlLmJsYW5rTGluZShzdGF0ZSkgfVxuICBpZiAoIW1vZGUuaW5uZXJNb2RlKSB7IHJldHVybiB9XG4gIHZhciBpbm5lciA9IGlubmVyTW9kZShtb2RlLCBzdGF0ZSk7XG4gIGlmIChpbm5lci5tb2RlLmJsYW5rTGluZSkgeyByZXR1cm4gaW5uZXIubW9kZS5ibGFua0xpbmUoaW5uZXIuc3RhdGUpIH1cbn1cblxuZnVuY3Rpb24gcmVhZFRva2VuKG1vZGUsIHN0cmVhbSwgc3RhdGUsIGlubmVyKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgIGlmIChpbm5lcikgeyBpbm5lclswXSA9IGlubmVyTW9kZShtb2RlLCBzdGF0ZSkubW9kZTsgfVxuICAgIHZhciBzdHlsZSA9IG1vZGUudG9rZW4oc3RyZWFtLCBzdGF0ZSk7XG4gICAgaWYgKHN0cmVhbS5wb3MgPiBzdHJlYW0uc3RhcnQpIHsgcmV0dXJuIHN0eWxlIH1cbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoXCJNb2RlIFwiICsgbW9kZS5uYW1lICsgXCIgZmFpbGVkIHRvIGFkdmFuY2Ugc3RyZWFtLlwiKVxufVxuXG4vLyBVdGlsaXR5IGZvciBnZXRUb2tlbkF0IGFuZCBnZXRMaW5lVG9rZW5zXG5mdW5jdGlvbiB0YWtlVG9rZW4oY20sIHBvcywgcHJlY2lzZSwgYXNBcnJheSkge1xuICB2YXIgZ2V0T2JqID0gZnVuY3Rpb24gKGNvcHkpIHsgcmV0dXJuICh7XG4gICAgc3RhcnQ6IHN0cmVhbS5zdGFydCwgZW5kOiBzdHJlYW0ucG9zLFxuICAgIHN0cmluZzogc3RyZWFtLmN1cnJlbnQoKSxcbiAgICB0eXBlOiBzdHlsZSB8fCBudWxsLFxuICAgIHN0YXRlOiBjb3B5ID8gY29weVN0YXRlKGRvYy5tb2RlLCBzdGF0ZSkgOiBzdGF0ZVxuICB9KTsgfTtcblxuICB2YXIgZG9jID0gY20uZG9jLCBtb2RlID0gZG9jLm1vZGUsIHN0eWxlO1xuICBwb3MgPSBjbGlwUG9zKGRvYywgcG9zKTtcbiAgdmFyIGxpbmUgPSBnZXRMaW5lKGRvYywgcG9zLmxpbmUpLCBzdGF0ZSA9IGdldFN0YXRlQmVmb3JlKGNtLCBwb3MubGluZSwgcHJlY2lzZSk7XG4gIHZhciBzdHJlYW0gPSBuZXcgU3RyaW5nU3RyZWFtKGxpbmUudGV4dCwgY20ub3B0aW9ucy50YWJTaXplKSwgdG9rZW5zO1xuICBpZiAoYXNBcnJheSkgeyB0b2tlbnMgPSBbXTsgfVxuICB3aGlsZSAoKGFzQXJyYXkgfHwgc3RyZWFtLnBvcyA8IHBvcy5jaCkgJiYgIXN0cmVhbS5lb2woKSkge1xuICAgIHN0cmVhbS5zdGFydCA9IHN0cmVhbS5wb3M7XG4gICAgc3R5bGUgPSByZWFkVG9rZW4obW9kZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgaWYgKGFzQXJyYXkpIHsgdG9rZW5zLnB1c2goZ2V0T2JqKHRydWUpKTsgfVxuICB9XG4gIHJldHVybiBhc0FycmF5ID8gdG9rZW5zIDogZ2V0T2JqKClcbn1cblxuZnVuY3Rpb24gZXh0cmFjdExpbmVDbGFzc2VzKHR5cGUsIG91dHB1dCkge1xuICBpZiAodHlwZSkgeyBmb3IgKDs7KSB7XG4gICAgdmFyIGxpbmVDbGFzcyA9IHR5cGUubWF0Y2goLyg/Ol58XFxzKylsaW5lLShiYWNrZ3JvdW5kLSk/KFxcUyspLyk7XG4gICAgaWYgKCFsaW5lQ2xhc3MpIHsgYnJlYWsgfVxuICAgIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGxpbmVDbGFzcy5pbmRleCkgKyB0eXBlLnNsaWNlKGxpbmVDbGFzcy5pbmRleCArIGxpbmVDbGFzc1swXS5sZW5ndGgpO1xuICAgIHZhciBwcm9wID0gbGluZUNsYXNzWzFdID8gXCJiZ0NsYXNzXCIgOiBcInRleHRDbGFzc1wiO1xuICAgIGlmIChvdXRwdXRbcHJvcF0gPT0gbnVsbClcbiAgICAgIHsgb3V0cHV0W3Byb3BdID0gbGluZUNsYXNzWzJdOyB9XG4gICAgZWxzZSBpZiAoIShuZXcgUmVnRXhwKFwiKD86XnxcXHMpXCIgKyBsaW5lQ2xhc3NbMl0gKyBcIig/OiR8XFxzKVwiKSkudGVzdChvdXRwdXRbcHJvcF0pKVxuICAgICAgeyBvdXRwdXRbcHJvcF0gKz0gXCIgXCIgKyBsaW5lQ2xhc3NbMl07IH1cbiAgfSB9XG4gIHJldHVybiB0eXBlXG59XG5cbi8vIFJ1biB0aGUgZ2l2ZW4gbW9kZSdzIHBhcnNlciBvdmVyIGEgbGluZSwgY2FsbGluZyBmIGZvciBlYWNoIHRva2VuLlxuZnVuY3Rpb24gcnVuTW9kZShjbSwgdGV4dCwgbW9kZSwgc3RhdGUsIGYsIGxpbmVDbGFzc2VzLCBmb3JjZVRvRW5kKSB7XG4gIHZhciBmbGF0dGVuU3BhbnMgPSBtb2RlLmZsYXR0ZW5TcGFucztcbiAgaWYgKGZsYXR0ZW5TcGFucyA9PSBudWxsKSB7IGZsYXR0ZW5TcGFucyA9IGNtLm9wdGlvbnMuZmxhdHRlblNwYW5zOyB9XG4gIHZhciBjdXJTdGFydCA9IDAsIGN1clN0eWxlID0gbnVsbDtcbiAgdmFyIHN0cmVhbSA9IG5ldyBTdHJpbmdTdHJlYW0odGV4dCwgY20ub3B0aW9ucy50YWJTaXplKSwgc3R5bGU7XG4gIHZhciBpbm5lciA9IGNtLm9wdGlvbnMuYWRkTW9kZUNsYXNzICYmIFtudWxsXTtcbiAgaWYgKHRleHQgPT0gXCJcIikgeyBleHRyYWN0TGluZUNsYXNzZXMoY2FsbEJsYW5rTGluZShtb2RlLCBzdGF0ZSksIGxpbmVDbGFzc2VzKTsgfVxuICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgIGlmIChzdHJlYW0ucG9zID4gY20ub3B0aW9ucy5tYXhIaWdobGlnaHRMZW5ndGgpIHtcbiAgICAgIGZsYXR0ZW5TcGFucyA9IGZhbHNlO1xuICAgICAgaWYgKGZvcmNlVG9FbmQpIHsgcHJvY2Vzc0xpbmUoY20sIHRleHQsIHN0YXRlLCBzdHJlYW0ucG9zKTsgfVxuICAgICAgc3RyZWFtLnBvcyA9IHRleHQubGVuZ3RoO1xuICAgICAgc3R5bGUgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZSA9IGV4dHJhY3RMaW5lQ2xhc3NlcyhyZWFkVG9rZW4obW9kZSwgc3RyZWFtLCBzdGF0ZSwgaW5uZXIpLCBsaW5lQ2xhc3Nlcyk7XG4gICAgfVxuICAgIGlmIChpbm5lcikge1xuICAgICAgdmFyIG1OYW1lID0gaW5uZXJbMF0ubmFtZTtcbiAgICAgIGlmIChtTmFtZSkgeyBzdHlsZSA9IFwibS1cIiArIChzdHlsZSA/IG1OYW1lICsgXCIgXCIgKyBzdHlsZSA6IG1OYW1lKTsgfVxuICAgIH1cbiAgICBpZiAoIWZsYXR0ZW5TcGFucyB8fCBjdXJTdHlsZSAhPSBzdHlsZSkge1xuICAgICAgd2hpbGUgKGN1clN0YXJ0IDwgc3RyZWFtLnN0YXJ0KSB7XG4gICAgICAgIGN1clN0YXJ0ID0gTWF0aC5taW4oc3RyZWFtLnN0YXJ0LCBjdXJTdGFydCArIDUwMDApO1xuICAgICAgICBmKGN1clN0YXJ0LCBjdXJTdHlsZSk7XG4gICAgICB9XG4gICAgICBjdXJTdHlsZSA9IHN0eWxlO1xuICAgIH1cbiAgICBzdHJlYW0uc3RhcnQgPSBzdHJlYW0ucG9zO1xuICB9XG4gIHdoaWxlIChjdXJTdGFydCA8IHN0cmVhbS5wb3MpIHtcbiAgICAvLyBXZWJraXQgc2VlbXMgdG8gcmVmdXNlIHRvIHJlbmRlciB0ZXh0IG5vZGVzIGxvbmdlciB0aGFuIDU3NDQ0XG4gICAgLy8gY2hhcmFjdGVycywgYW5kIHJldHVybnMgaW5hY2N1cmF0ZSBtZWFzdXJlbWVudHMgaW4gbm9kZXNcbiAgICAvLyBzdGFydGluZyBhcm91bmQgNTAwMCBjaGFycy5cbiAgICB2YXIgcG9zID0gTWF0aC5taW4oc3RyZWFtLnBvcywgY3VyU3RhcnQgKyA1MDAwKTtcbiAgICBmKHBvcywgY3VyU3R5bGUpO1xuICAgIGN1clN0YXJ0ID0gcG9zO1xuICB9XG59XG5cbi8vIEZpbmRzIHRoZSBsaW5lIHRvIHN0YXJ0IHdpdGggd2hlbiBzdGFydGluZyBhIHBhcnNlLiBUcmllcyB0b1xuLy8gZmluZCBhIGxpbmUgd2l0aCBhIHN0YXRlQWZ0ZXIsIHNvIHRoYXQgaXQgY2FuIHN0YXJ0IHdpdGggYVxuLy8gdmFsaWQgc3RhdGUuIElmIHRoYXQgZmFpbHMsIGl0IHJldHVybnMgdGhlIGxpbmUgd2l0aCB0aGVcbi8vIHNtYWxsZXN0IGluZGVudGF0aW9uLCB3aGljaCB0ZW5kcyB0byBuZWVkIHRoZSBsZWFzdCBjb250ZXh0IHRvXG4vLyBwYXJzZSBjb3JyZWN0bHkuXG5mdW5jdGlvbiBmaW5kU3RhcnRMaW5lKGNtLCBuLCBwcmVjaXNlKSB7XG4gIHZhciBtaW5pbmRlbnQsIG1pbmxpbmUsIGRvYyA9IGNtLmRvYztcbiAgdmFyIGxpbSA9IHByZWNpc2UgPyAtMSA6IG4gLSAoY20uZG9jLm1vZGUuaW5uZXJNb2RlID8gMTAwMCA6IDEwMCk7XG4gIGZvciAodmFyIHNlYXJjaCA9IG47IHNlYXJjaCA+IGxpbTsgLS1zZWFyY2gpIHtcbiAgICBpZiAoc2VhcmNoIDw9IGRvYy5maXJzdCkgeyByZXR1cm4gZG9jLmZpcnN0IH1cbiAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBzZWFyY2ggLSAxKTtcbiAgICBpZiAobGluZS5zdGF0ZUFmdGVyICYmICghcHJlY2lzZSB8fCBzZWFyY2ggPD0gZG9jLmZyb250aWVyKSkgeyByZXR1cm4gc2VhcmNoIH1cbiAgICB2YXIgaW5kZW50ZWQgPSBjb3VudENvbHVtbihsaW5lLnRleHQsIG51bGwsIGNtLm9wdGlvbnMudGFiU2l6ZSk7XG4gICAgaWYgKG1pbmxpbmUgPT0gbnVsbCB8fCBtaW5pbmRlbnQgPiBpbmRlbnRlZCkge1xuICAgICAgbWlubGluZSA9IHNlYXJjaCAtIDE7XG4gICAgICBtaW5pbmRlbnQgPSBpbmRlbnRlZDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1pbmxpbmVcbn1cblxuLy8gTElORSBEQVRBIFNUUlVDVFVSRVxuXG4vLyBMaW5lIG9iamVjdHMuIFRoZXNlIGhvbGQgc3RhdGUgcmVsYXRlZCB0byBhIGxpbmUsIGluY2x1ZGluZ1xuLy8gaGlnaGxpZ2h0aW5nIGluZm8gKHRoZSBzdHlsZXMgYXJyYXkpLlxudmFyIExpbmUgPSBmdW5jdGlvbih0ZXh0LCBtYXJrZWRTcGFucywgZXN0aW1hdGVIZWlnaHQpIHtcbiAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgYXR0YWNoTWFya2VkU3BhbnModGhpcywgbWFya2VkU3BhbnMpO1xuICB0aGlzLmhlaWdodCA9IGVzdGltYXRlSGVpZ2h0ID8gZXN0aW1hdGVIZWlnaHQodGhpcykgOiAxO1xufTtcblxuTGluZS5wcm90b3R5cGUubGluZU5vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbGluZU5vKHRoaXMpIH07XG5ldmVudE1peGluKExpbmUpO1xuXG4vLyBDaGFuZ2UgdGhlIGNvbnRlbnQgKHRleHQsIG1hcmtlcnMpIG9mIGEgbGluZS4gQXV0b21hdGljYWxseVxuLy8gaW52YWxpZGF0ZXMgY2FjaGVkIGluZm9ybWF0aW9uIGFuZCB0cmllcyB0byByZS1lc3RpbWF0ZSB0aGVcbi8vIGxpbmUncyBoZWlnaHQuXG5mdW5jdGlvbiB1cGRhdGVMaW5lKGxpbmUsIHRleHQsIG1hcmtlZFNwYW5zLCBlc3RpbWF0ZUhlaWdodCkge1xuICBsaW5lLnRleHQgPSB0ZXh0O1xuICBpZiAobGluZS5zdGF0ZUFmdGVyKSB7IGxpbmUuc3RhdGVBZnRlciA9IG51bGw7IH1cbiAgaWYgKGxpbmUuc3R5bGVzKSB7IGxpbmUuc3R5bGVzID0gbnVsbDsgfVxuICBpZiAobGluZS5vcmRlciAhPSBudWxsKSB7IGxpbmUub3JkZXIgPSBudWxsOyB9XG4gIGRldGFjaE1hcmtlZFNwYW5zKGxpbmUpO1xuICBhdHRhY2hNYXJrZWRTcGFucyhsaW5lLCBtYXJrZWRTcGFucyk7XG4gIHZhciBlc3RIZWlnaHQgPSBlc3RpbWF0ZUhlaWdodCA/IGVzdGltYXRlSGVpZ2h0KGxpbmUpIDogMTtcbiAgaWYgKGVzdEhlaWdodCAhPSBsaW5lLmhlaWdodCkgeyB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIGVzdEhlaWdodCk7IH1cbn1cblxuLy8gRGV0YWNoIGEgbGluZSBmcm9tIHRoZSBkb2N1bWVudCB0cmVlIGFuZCBpdHMgbWFya2Vycy5cbmZ1bmN0aW9uIGNsZWFuVXBMaW5lKGxpbmUpIHtcbiAgbGluZS5wYXJlbnQgPSBudWxsO1xuICBkZXRhY2hNYXJrZWRTcGFucyhsaW5lKTtcbn1cblxuLy8gQ29udmVydCBhIHN0eWxlIGFzIHJldHVybmVkIGJ5IGEgbW9kZSAoZWl0aGVyIG51bGwsIG9yIGEgc3RyaW5nXG4vLyBjb250YWluaW5nIG9uZSBvciBtb3JlIHN0eWxlcykgdG8gYSBDU1Mgc3R5bGUuIFRoaXMgaXMgY2FjaGVkLFxuLy8gYW5kIGFsc28gbG9va3MgZm9yIGxpbmUtd2lkZSBzdHlsZXMuXG52YXIgc3R5bGVUb0NsYXNzQ2FjaGUgPSB7fTtcbnZhciBzdHlsZVRvQ2xhc3NDYWNoZVdpdGhNb2RlID0ge307XG5mdW5jdGlvbiBpbnRlcnByZXRUb2tlblN0eWxlKHN0eWxlLCBvcHRpb25zKSB7XG4gIGlmICghc3R5bGUgfHwgL15cXHMqJC8udGVzdChzdHlsZSkpIHsgcmV0dXJuIG51bGwgfVxuICB2YXIgY2FjaGUgPSBvcHRpb25zLmFkZE1vZGVDbGFzcyA/IHN0eWxlVG9DbGFzc0NhY2hlV2l0aE1vZGUgOiBzdHlsZVRvQ2xhc3NDYWNoZTtcbiAgcmV0dXJuIGNhY2hlW3N0eWxlXSB8fFxuICAgIChjYWNoZVtzdHlsZV0gPSBzdHlsZS5yZXBsYWNlKC9cXFMrL2csIFwiY20tJCZcIikpXG59XG5cbi8vIFJlbmRlciB0aGUgRE9NIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0ZXh0IG9mIGEgbGluZS4gQWxzbyBidWlsZHNcbi8vIHVwIGEgJ2xpbmUgbWFwJywgd2hpY2ggcG9pbnRzIGF0IHRoZSBET00gbm9kZXMgdGhhdCByZXByZXNlbnRcbi8vIHNwZWNpZmljIHN0cmV0Y2hlcyBvZiB0ZXh0LCBhbmQgaXMgdXNlZCBieSB0aGUgbWVhc3VyaW5nIGNvZGUuXG4vLyBUaGUgcmV0dXJuZWQgb2JqZWN0IGNvbnRhaW5zIHRoZSBET00gbm9kZSwgdGhpcyBtYXAsIGFuZFxuLy8gaW5mb3JtYXRpb24gYWJvdXQgbGluZS13aWRlIHN0eWxlcyB0aGF0IHdlcmUgc2V0IGJ5IHRoZSBtb2RlLlxuZnVuY3Rpb24gYnVpbGRMaW5lQ29udGVudChjbSwgbGluZVZpZXcpIHtcbiAgLy8gVGhlIHBhZGRpbmctcmlnaHQgZm9yY2VzIHRoZSBlbGVtZW50IHRvIGhhdmUgYSAnYm9yZGVyJywgd2hpY2hcbiAgLy8gaXMgbmVlZGVkIG9uIFdlYmtpdCB0byBiZSBhYmxlIHRvIGdldCBsaW5lLWxldmVsIGJvdW5kaW5nXG4gIC8vIHJlY3RhbmdsZXMgZm9yIGl0IChpbiBtZWFzdXJlQ2hhcikuXG4gIHZhciBjb250ZW50ID0gZWx0UChcInNwYW5cIiwgbnVsbCwgbnVsbCwgd2Via2l0ID8gXCJwYWRkaW5nLXJpZ2h0OiAuMXB4XCIgOiBudWxsKTtcbiAgdmFyIGJ1aWxkZXIgPSB7cHJlOiBlbHRQKFwicHJlXCIsIFtjb250ZW50XSwgXCJDb2RlTWlycm9yLWxpbmVcIiksIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgIGNvbDogMCwgcG9zOiAwLCBjbTogY20sXG4gICAgICAgICAgICAgICAgIHRyYWlsaW5nU3BhY2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgICBzcGxpdFNwYWNlczogKGllIHx8IHdlYmtpdCkgJiYgY20uZ2V0T3B0aW9uKFwibGluZVdyYXBwaW5nXCIpfTtcbiAgbGluZVZpZXcubWVhc3VyZSA9IHt9O1xuXG4gIC8vIEl0ZXJhdGUgb3ZlciB0aGUgbG9naWNhbCBsaW5lcyB0aGF0IG1ha2UgdXAgdGhpcyB2aXN1YWwgbGluZS5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gKGxpbmVWaWV3LnJlc3QgPyBsaW5lVmlldy5yZXN0Lmxlbmd0aCA6IDApOyBpKyspIHtcbiAgICB2YXIgbGluZSA9IGkgPyBsaW5lVmlldy5yZXN0W2kgLSAxXSA6IGxpbmVWaWV3LmxpbmUsIG9yZGVyID0gKHZvaWQgMCk7XG4gICAgYnVpbGRlci5wb3MgPSAwO1xuICAgIGJ1aWxkZXIuYWRkVG9rZW4gPSBidWlsZFRva2VuO1xuICAgIC8vIE9wdGlvbmFsbHkgd2lyZSBpbiBzb21lIGhhY2tzIGludG8gdGhlIHRva2VuLXJlbmRlcmluZ1xuICAgIC8vIGFsZ29yaXRobSwgdG8gZGVhbCB3aXRoIGJyb3dzZXIgcXVpcmtzLlxuICAgIGlmIChoYXNCYWRCaWRpUmVjdHMoY20uZGlzcGxheS5tZWFzdXJlKSAmJiAob3JkZXIgPSBnZXRPcmRlcihsaW5lLCBjbS5kb2MuZGlyZWN0aW9uKSkpXG4gICAgICB7IGJ1aWxkZXIuYWRkVG9rZW4gPSBidWlsZFRva2VuQmFkQmlkaShidWlsZGVyLmFkZFRva2VuLCBvcmRlcik7IH1cbiAgICBidWlsZGVyLm1hcCA9IFtdO1xuICAgIHZhciBhbGxvd0Zyb250aWVyVXBkYXRlID0gbGluZVZpZXcgIT0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkICYmIGxpbmVObyhsaW5lKTtcbiAgICBpbnNlcnRMaW5lQ29udGVudChsaW5lLCBidWlsZGVyLCBnZXRMaW5lU3R5bGVzKGNtLCBsaW5lLCBhbGxvd0Zyb250aWVyVXBkYXRlKSk7XG4gICAgaWYgKGxpbmUuc3R5bGVDbGFzc2VzKSB7XG4gICAgICBpZiAobGluZS5zdHlsZUNsYXNzZXMuYmdDbGFzcylcbiAgICAgICAgeyBidWlsZGVyLmJnQ2xhc3MgPSBqb2luQ2xhc3NlcyhsaW5lLnN0eWxlQ2xhc3Nlcy5iZ0NsYXNzLCBidWlsZGVyLmJnQ2xhc3MgfHwgXCJcIik7IH1cbiAgICAgIGlmIChsaW5lLnN0eWxlQ2xhc3Nlcy50ZXh0Q2xhc3MpXG4gICAgICAgIHsgYnVpbGRlci50ZXh0Q2xhc3MgPSBqb2luQ2xhc3NlcyhsaW5lLnN0eWxlQ2xhc3Nlcy50ZXh0Q2xhc3MsIGJ1aWxkZXIudGV4dENsYXNzIHx8IFwiXCIpOyB9XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIGF0IGxlYXN0IGEgc2luZ2xlIG5vZGUgaXMgcHJlc2VudCwgZm9yIG1lYXN1cmluZy5cbiAgICBpZiAoYnVpbGRlci5tYXAubGVuZ3RoID09IDApXG4gICAgICB7IGJ1aWxkZXIubWFwLnB1c2goMCwgMCwgYnVpbGRlci5jb250ZW50LmFwcGVuZENoaWxkKHplcm9XaWR0aEVsZW1lbnQoY20uZGlzcGxheS5tZWFzdXJlKSkpOyB9XG5cbiAgICAvLyBTdG9yZSB0aGUgbWFwIGFuZCBhIGNhY2hlIG9iamVjdCBmb3IgdGhlIGN1cnJlbnQgbG9naWNhbCBsaW5lXG4gICAgaWYgKGkgPT0gMCkge1xuICAgICAgbGluZVZpZXcubWVhc3VyZS5tYXAgPSBidWlsZGVyLm1hcDtcbiAgICAgIGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGUgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgKGxpbmVWaWV3Lm1lYXN1cmUubWFwcyB8fCAobGluZVZpZXcubWVhc3VyZS5tYXBzID0gW10pKS5wdXNoKGJ1aWxkZXIubWFwKVxuICAgICAgOyhsaW5lVmlldy5tZWFzdXJlLmNhY2hlcyB8fCAobGluZVZpZXcubWVhc3VyZS5jYWNoZXMgPSBbXSkpLnB1c2goe30pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNlZSBpc3N1ZSAjMjkwMVxuICBpZiAod2Via2l0KSB7XG4gICAgdmFyIGxhc3QgPSBidWlsZGVyLmNvbnRlbnQubGFzdENoaWxkO1xuICAgIGlmICgvXFxiY20tdGFiXFxiLy50ZXN0KGxhc3QuY2xhc3NOYW1lKSB8fCAobGFzdC5xdWVyeVNlbGVjdG9yICYmIGxhc3QucXVlcnlTZWxlY3RvcihcIi5jbS10YWJcIikpKVxuICAgICAgeyBidWlsZGVyLmNvbnRlbnQuY2xhc3NOYW1lID0gXCJjbS10YWItd3JhcC1oYWNrXCI7IH1cbiAgfVxuXG4gIHNpZ25hbChjbSwgXCJyZW5kZXJMaW5lXCIsIGNtLCBsaW5lVmlldy5saW5lLCBidWlsZGVyLnByZSk7XG4gIGlmIChidWlsZGVyLnByZS5jbGFzc05hbWUpXG4gICAgeyBidWlsZGVyLnRleHRDbGFzcyA9IGpvaW5DbGFzc2VzKGJ1aWxkZXIucHJlLmNsYXNzTmFtZSwgYnVpbGRlci50ZXh0Q2xhc3MgfHwgXCJcIik7IH1cblxuICByZXR1cm4gYnVpbGRlclxufVxuXG5mdW5jdGlvbiBkZWZhdWx0U3BlY2lhbENoYXJQbGFjZWhvbGRlcihjaCkge1xuICB2YXIgdG9rZW4gPSBlbHQoXCJzcGFuXCIsIFwiXFx1MjAyMlwiLCBcImNtLWludmFsaWRjaGFyXCIpO1xuICB0b2tlbi50aXRsZSA9IFwiXFxcXHVcIiArIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpO1xuICB0b2tlbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIHRva2VuLnRpdGxlKTtcbiAgcmV0dXJuIHRva2VuXG59XG5cbi8vIEJ1aWxkIHVwIHRoZSBET00gcmVwcmVzZW50YXRpb24gZm9yIGEgc2luZ2xlIHRva2VuLCBhbmQgYWRkIGl0IHRvXG4vLyB0aGUgbGluZSBtYXAuIFRha2VzIGNhcmUgdG8gcmVuZGVyIHNwZWNpYWwgY2hhcmFjdGVycyBzZXBhcmF0ZWx5LlxuZnVuY3Rpb24gYnVpbGRUb2tlbihidWlsZGVyLCB0ZXh0LCBzdHlsZSwgc3RhcnRTdHlsZSwgZW5kU3R5bGUsIHRpdGxlLCBjc3MpIHtcbiAgaWYgKCF0ZXh0KSB7IHJldHVybiB9XG4gIHZhciBkaXNwbGF5VGV4dCA9IGJ1aWxkZXIuc3BsaXRTcGFjZXMgPyBzcGxpdFNwYWNlcyh0ZXh0LCBidWlsZGVyLnRyYWlsaW5nU3BhY2UpIDogdGV4dDtcbiAgdmFyIHNwZWNpYWwgPSBidWlsZGVyLmNtLnN0YXRlLnNwZWNpYWxDaGFycywgbXVzdFdyYXAgPSBmYWxzZTtcbiAgdmFyIGNvbnRlbnQ7XG4gIGlmICghc3BlY2lhbC50ZXN0KHRleHQpKSB7XG4gICAgYnVpbGRlci5jb2wgKz0gdGV4dC5sZW5ndGg7XG4gICAgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpc3BsYXlUZXh0KTtcbiAgICBidWlsZGVyLm1hcC5wdXNoKGJ1aWxkZXIucG9zLCBidWlsZGVyLnBvcyArIHRleHQubGVuZ3RoLCBjb250ZW50KTtcbiAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDkpIHsgbXVzdFdyYXAgPSB0cnVlOyB9XG4gICAgYnVpbGRlci5wb3MgKz0gdGV4dC5sZW5ndGg7XG4gIH0gZWxzZSB7XG4gICAgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB2YXIgcG9zID0gMDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgc3BlY2lhbC5sYXN0SW5kZXggPSBwb3M7XG4gICAgICB2YXIgbSA9IHNwZWNpYWwuZXhlYyh0ZXh0KTtcbiAgICAgIHZhciBza2lwcGVkID0gbSA/IG0uaW5kZXggLSBwb3MgOiB0ZXh0Lmxlbmd0aCAtIHBvcztcbiAgICAgIGlmIChza2lwcGVkKSB7XG4gICAgICAgIHZhciB0eHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaXNwbGF5VGV4dC5zbGljZShwb3MsIHBvcyArIHNraXBwZWQpKTtcbiAgICAgICAgaWYgKGllICYmIGllX3ZlcnNpb24gPCA5KSB7IGNvbnRlbnQuYXBwZW5kQ2hpbGQoZWx0KFwic3BhblwiLCBbdHh0XSkpOyB9XG4gICAgICAgIGVsc2UgeyBjb250ZW50LmFwcGVuZENoaWxkKHR4dCk7IH1cbiAgICAgICAgYnVpbGRlci5tYXAucHVzaChidWlsZGVyLnBvcywgYnVpbGRlci5wb3MgKyBza2lwcGVkLCB0eHQpO1xuICAgICAgICBidWlsZGVyLmNvbCArPSBza2lwcGVkO1xuICAgICAgICBidWlsZGVyLnBvcyArPSBza2lwcGVkO1xuICAgICAgfVxuICAgICAgaWYgKCFtKSB7IGJyZWFrIH1cbiAgICAgIHBvcyArPSBza2lwcGVkICsgMTtcbiAgICAgIHZhciB0eHQkMSA9ICh2b2lkIDApO1xuICAgICAgaWYgKG1bMF0gPT0gXCJcXHRcIikge1xuICAgICAgICB2YXIgdGFiU2l6ZSA9IGJ1aWxkZXIuY20ub3B0aW9ucy50YWJTaXplLCB0YWJXaWR0aCA9IHRhYlNpemUgLSBidWlsZGVyLmNvbCAlIHRhYlNpemU7XG4gICAgICAgIHR4dCQxID0gY29udGVudC5hcHBlbmRDaGlsZChlbHQoXCJzcGFuXCIsIHNwYWNlU3RyKHRhYldpZHRoKSwgXCJjbS10YWJcIikpO1xuICAgICAgICB0eHQkMS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwicHJlc2VudGF0aW9uXCIpO1xuICAgICAgICB0eHQkMS5zZXRBdHRyaWJ1dGUoXCJjbS10ZXh0XCIsIFwiXFx0XCIpO1xuICAgICAgICBidWlsZGVyLmNvbCArPSB0YWJXaWR0aDtcbiAgICAgIH0gZWxzZSBpZiAobVswXSA9PSBcIlxcclwiIHx8IG1bMF0gPT0gXCJcXG5cIikge1xuICAgICAgICB0eHQkMSA9IGNvbnRlbnQuYXBwZW5kQ2hpbGQoZWx0KFwic3BhblwiLCBtWzBdID09IFwiXFxyXCIgPyBcIlxcdTI0MGRcIiA6IFwiXFx1MjQyNFwiLCBcImNtLWludmFsaWRjaGFyXCIpKTtcbiAgICAgICAgdHh0JDEuc2V0QXR0cmlidXRlKFwiY20tdGV4dFwiLCBtWzBdKTtcbiAgICAgICAgYnVpbGRlci5jb2wgKz0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR4dCQxID0gYnVpbGRlci5jbS5vcHRpb25zLnNwZWNpYWxDaGFyUGxhY2Vob2xkZXIobVswXSk7XG4gICAgICAgIHR4dCQxLnNldEF0dHJpYnV0ZShcImNtLXRleHRcIiwgbVswXSk7XG4gICAgICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgOSkgeyBjb250ZW50LmFwcGVuZENoaWxkKGVsdChcInNwYW5cIiwgW3R4dCQxXSkpOyB9XG4gICAgICAgIGVsc2UgeyBjb250ZW50LmFwcGVuZENoaWxkKHR4dCQxKTsgfVxuICAgICAgICBidWlsZGVyLmNvbCArPSAxO1xuICAgICAgfVxuICAgICAgYnVpbGRlci5tYXAucHVzaChidWlsZGVyLnBvcywgYnVpbGRlci5wb3MgKyAxLCB0eHQkMSk7XG4gICAgICBidWlsZGVyLnBvcysrO1xuICAgIH1cbiAgfVxuICBidWlsZGVyLnRyYWlsaW5nU3BhY2UgPSBkaXNwbGF5VGV4dC5jaGFyQ29kZUF0KHRleHQubGVuZ3RoIC0gMSkgPT0gMzI7XG4gIGlmIChzdHlsZSB8fCBzdGFydFN0eWxlIHx8IGVuZFN0eWxlIHx8IG11c3RXcmFwIHx8IGNzcykge1xuICAgIHZhciBmdWxsU3R5bGUgPSBzdHlsZSB8fCBcIlwiO1xuICAgIGlmIChzdGFydFN0eWxlKSB7IGZ1bGxTdHlsZSArPSBzdGFydFN0eWxlOyB9XG4gICAgaWYgKGVuZFN0eWxlKSB7IGZ1bGxTdHlsZSArPSBlbmRTdHlsZTsgfVxuICAgIHZhciB0b2tlbiA9IGVsdChcInNwYW5cIiwgW2NvbnRlbnRdLCBmdWxsU3R5bGUsIGNzcyk7XG4gICAgaWYgKHRpdGxlKSB7IHRva2VuLnRpdGxlID0gdGl0bGU7IH1cbiAgICByZXR1cm4gYnVpbGRlci5jb250ZW50LmFwcGVuZENoaWxkKHRva2VuKVxuICB9XG4gIGJ1aWxkZXIuY29udGVudC5hcHBlbmRDaGlsZChjb250ZW50KTtcbn1cblxuZnVuY3Rpb24gc3BsaXRTcGFjZXModGV4dCwgdHJhaWxpbmdCZWZvcmUpIHtcbiAgaWYgKHRleHQubGVuZ3RoID4gMSAmJiAhLyAgLy50ZXN0KHRleHQpKSB7IHJldHVybiB0ZXh0IH1cbiAgdmFyIHNwYWNlQmVmb3JlID0gdHJhaWxpbmdCZWZvcmUsIHJlc3VsdCA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBjaCA9IHRleHQuY2hhckF0KGkpO1xuICAgIGlmIChjaCA9PSBcIiBcIiAmJiBzcGFjZUJlZm9yZSAmJiAoaSA9PSB0ZXh0Lmxlbmd0aCAtIDEgfHwgdGV4dC5jaGFyQ29kZUF0KGkgKyAxKSA9PSAzMikpXG4gICAgICB7IGNoID0gXCJcXHUwMGEwXCI7IH1cbiAgICByZXN1bHQgKz0gY2g7XG4gICAgc3BhY2VCZWZvcmUgPSBjaCA9PSBcIiBcIjtcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIFdvcmsgYXJvdW5kIG5vbnNlbnNlIGRpbWVuc2lvbnMgYmVpbmcgcmVwb3J0ZWQgZm9yIHN0cmV0Y2hlcyBvZlxuLy8gcmlnaHQtdG8tbGVmdCB0ZXh0LlxuZnVuY3Rpb24gYnVpbGRUb2tlbkJhZEJpZGkoaW5uZXIsIG9yZGVyKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoYnVpbGRlciwgdGV4dCwgc3R5bGUsIHN0YXJ0U3R5bGUsIGVuZFN0eWxlLCB0aXRsZSwgY3NzKSB7XG4gICAgc3R5bGUgPSBzdHlsZSA/IHN0eWxlICsgXCIgY20tZm9yY2UtYm9yZGVyXCIgOiBcImNtLWZvcmNlLWJvcmRlclwiO1xuICAgIHZhciBzdGFydCA9IGJ1aWxkZXIucG9zLCBlbmQgPSBzdGFydCArIHRleHQubGVuZ3RoO1xuICAgIGZvciAoOzspIHtcbiAgICAgIC8vIEZpbmQgdGhlIHBhcnQgdGhhdCBvdmVybGFwcyB3aXRoIHRoZSBzdGFydCBvZiB0aGlzIHRleHRcbiAgICAgIHZhciBwYXJ0ID0gKHZvaWQgMCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9yZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcnQgPSBvcmRlcltpXTtcbiAgICAgICAgaWYgKHBhcnQudG8gPiBzdGFydCAmJiBwYXJ0LmZyb20gPD0gc3RhcnQpIHsgYnJlYWsgfVxuICAgICAgfVxuICAgICAgaWYgKHBhcnQudG8gPj0gZW5kKSB7IHJldHVybiBpbm5lcihidWlsZGVyLCB0ZXh0LCBzdHlsZSwgc3RhcnRTdHlsZSwgZW5kU3R5bGUsIHRpdGxlLCBjc3MpIH1cbiAgICAgIGlubmVyKGJ1aWxkZXIsIHRleHQuc2xpY2UoMCwgcGFydC50byAtIHN0YXJ0KSwgc3R5bGUsIHN0YXJ0U3R5bGUsIG51bGwsIHRpdGxlLCBjc3MpO1xuICAgICAgc3RhcnRTdHlsZSA9IG51bGw7XG4gICAgICB0ZXh0ID0gdGV4dC5zbGljZShwYXJ0LnRvIC0gc3RhcnQpO1xuICAgICAgc3RhcnQgPSBwYXJ0LnRvO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZENvbGxhcHNlZFNwYW4oYnVpbGRlciwgc2l6ZSwgbWFya2VyLCBpZ25vcmVXaWRnZXQpIHtcbiAgdmFyIHdpZGdldCA9ICFpZ25vcmVXaWRnZXQgJiYgbWFya2VyLndpZGdldE5vZGU7XG4gIGlmICh3aWRnZXQpIHsgYnVpbGRlci5tYXAucHVzaChidWlsZGVyLnBvcywgYnVpbGRlci5wb3MgKyBzaXplLCB3aWRnZXQpOyB9XG4gIGlmICghaWdub3JlV2lkZ2V0ICYmIGJ1aWxkZXIuY20uZGlzcGxheS5pbnB1dC5uZWVkc0NvbnRlbnRBdHRyaWJ1dGUpIHtcbiAgICBpZiAoIXdpZGdldClcbiAgICAgIHsgd2lkZ2V0ID0gYnVpbGRlci5jb250ZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpKTsgfVxuICAgIHdpZGdldC5zZXRBdHRyaWJ1dGUoXCJjbS1tYXJrZXJcIiwgbWFya2VyLmlkKTtcbiAgfVxuICBpZiAod2lkZ2V0KSB7XG4gICAgYnVpbGRlci5jbS5kaXNwbGF5LmlucHV0LnNldFVuZWRpdGFibGUod2lkZ2V0KTtcbiAgICBidWlsZGVyLmNvbnRlbnQuYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbiAgfVxuICBidWlsZGVyLnBvcyArPSBzaXplO1xuICBidWlsZGVyLnRyYWlsaW5nU3BhY2UgPSBmYWxzZTtcbn1cblxuLy8gT3V0cHV0cyBhIG51bWJlciBvZiBzcGFucyB0byBtYWtlIHVwIGEgbGluZSwgdGFraW5nIGhpZ2hsaWdodGluZ1xuLy8gYW5kIG1hcmtlZCB0ZXh0IGludG8gYWNjb3VudC5cbmZ1bmN0aW9uIGluc2VydExpbmVDb250ZW50KGxpbmUsIGJ1aWxkZXIsIHN0eWxlcykge1xuICB2YXIgc3BhbnMgPSBsaW5lLm1hcmtlZFNwYW5zLCBhbGxUZXh0ID0gbGluZS50ZXh0LCBhdCA9IDA7XG4gIGlmICghc3BhbnMpIHtcbiAgICBmb3IgKHZhciBpJDEgPSAxOyBpJDEgPCBzdHlsZXMubGVuZ3RoOyBpJDErPTIpXG4gICAgICB7IGJ1aWxkZXIuYWRkVG9rZW4oYnVpbGRlciwgYWxsVGV4dC5zbGljZShhdCwgYXQgPSBzdHlsZXNbaSQxXSksIGludGVycHJldFRva2VuU3R5bGUoc3R5bGVzW2kkMSsxXSwgYnVpbGRlci5jbS5vcHRpb25zKSk7IH1cbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBsZW4gPSBhbGxUZXh0Lmxlbmd0aCwgcG9zID0gMCwgaSA9IDEsIHRleHQgPSBcIlwiLCBzdHlsZSwgY3NzO1xuICB2YXIgbmV4dENoYW5nZSA9IDAsIHNwYW5TdHlsZSwgc3BhbkVuZFN0eWxlLCBzcGFuU3RhcnRTdHlsZSwgdGl0bGUsIGNvbGxhcHNlZDtcbiAgZm9yICg7Oykge1xuICAgIGlmIChuZXh0Q2hhbmdlID09IHBvcykgeyAvLyBVcGRhdGUgY3VycmVudCBtYXJrZXIgc2V0XG4gICAgICBzcGFuU3R5bGUgPSBzcGFuRW5kU3R5bGUgPSBzcGFuU3RhcnRTdHlsZSA9IHRpdGxlID0gY3NzID0gXCJcIjtcbiAgICAgIGNvbGxhcHNlZCA9IG51bGw7IG5leHRDaGFuZ2UgPSBJbmZpbml0eTtcbiAgICAgIHZhciBmb3VuZEJvb2ttYXJrcyA9IFtdLCBlbmRTdHlsZXMgPSAodm9pZCAwKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3BhbnMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgdmFyIHNwID0gc3BhbnNbal0sIG0gPSBzcC5tYXJrZXI7XG4gICAgICAgIGlmIChtLnR5cGUgPT0gXCJib29rbWFya1wiICYmIHNwLmZyb20gPT0gcG9zICYmIG0ud2lkZ2V0Tm9kZSkge1xuICAgICAgICAgIGZvdW5kQm9va21hcmtzLnB1c2gobSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3AuZnJvbSA8PSBwb3MgJiYgKHNwLnRvID09IG51bGwgfHwgc3AudG8gPiBwb3MgfHwgbS5jb2xsYXBzZWQgJiYgc3AudG8gPT0gcG9zICYmIHNwLmZyb20gPT0gcG9zKSkge1xuICAgICAgICAgIGlmIChzcC50byAhPSBudWxsICYmIHNwLnRvICE9IHBvcyAmJiBuZXh0Q2hhbmdlID4gc3AudG8pIHtcbiAgICAgICAgICAgIG5leHRDaGFuZ2UgPSBzcC50bztcbiAgICAgICAgICAgIHNwYW5FbmRTdHlsZSA9IFwiXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtLmNsYXNzTmFtZSkgeyBzcGFuU3R5bGUgKz0gXCIgXCIgKyBtLmNsYXNzTmFtZTsgfVxuICAgICAgICAgIGlmIChtLmNzcykgeyBjc3MgPSAoY3NzID8gY3NzICsgXCI7XCIgOiBcIlwiKSArIG0uY3NzOyB9XG4gICAgICAgICAgaWYgKG0uc3RhcnRTdHlsZSAmJiBzcC5mcm9tID09IHBvcykgeyBzcGFuU3RhcnRTdHlsZSArPSBcIiBcIiArIG0uc3RhcnRTdHlsZTsgfVxuICAgICAgICAgIGlmIChtLmVuZFN0eWxlICYmIHNwLnRvID09IG5leHRDaGFuZ2UpIHsgKGVuZFN0eWxlcyB8fCAoZW5kU3R5bGVzID0gW10pKS5wdXNoKG0uZW5kU3R5bGUsIHNwLnRvKTsgfVxuICAgICAgICAgIGlmIChtLnRpdGxlICYmICF0aXRsZSkgeyB0aXRsZSA9IG0udGl0bGU7IH1cbiAgICAgICAgICBpZiAobS5jb2xsYXBzZWQgJiYgKCFjb2xsYXBzZWQgfHwgY29tcGFyZUNvbGxhcHNlZE1hcmtlcnMoY29sbGFwc2VkLm1hcmtlciwgbSkgPCAwKSlcbiAgICAgICAgICAgIHsgY29sbGFwc2VkID0gc3A7IH1cbiAgICAgICAgfSBlbHNlIGlmIChzcC5mcm9tID4gcG9zICYmIG5leHRDaGFuZ2UgPiBzcC5mcm9tKSB7XG4gICAgICAgICAgbmV4dENoYW5nZSA9IHNwLmZyb207XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChlbmRTdHlsZXMpIHsgZm9yICh2YXIgaiQxID0gMDsgaiQxIDwgZW5kU3R5bGVzLmxlbmd0aDsgaiQxICs9IDIpXG4gICAgICAgIHsgaWYgKGVuZFN0eWxlc1tqJDEgKyAxXSA9PSBuZXh0Q2hhbmdlKSB7IHNwYW5FbmRTdHlsZSArPSBcIiBcIiArIGVuZFN0eWxlc1tqJDFdOyB9IH0gfVxuXG4gICAgICBpZiAoIWNvbGxhcHNlZCB8fCBjb2xsYXBzZWQuZnJvbSA9PSBwb3MpIHsgZm9yICh2YXIgaiQyID0gMDsgaiQyIDwgZm91bmRCb29rbWFya3MubGVuZ3RoOyArK2okMilcbiAgICAgICAgeyBidWlsZENvbGxhcHNlZFNwYW4oYnVpbGRlciwgMCwgZm91bmRCb29rbWFya3NbaiQyXSk7IH0gfVxuICAgICAgaWYgKGNvbGxhcHNlZCAmJiAoY29sbGFwc2VkLmZyb20gfHwgMCkgPT0gcG9zKSB7XG4gICAgICAgIGJ1aWxkQ29sbGFwc2VkU3BhbihidWlsZGVyLCAoY29sbGFwc2VkLnRvID09IG51bGwgPyBsZW4gKyAxIDogY29sbGFwc2VkLnRvKSAtIHBvcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZC5tYXJrZXIsIGNvbGxhcHNlZC5mcm9tID09IG51bGwpO1xuICAgICAgICBpZiAoY29sbGFwc2VkLnRvID09IG51bGwpIHsgcmV0dXJuIH1cbiAgICAgICAgaWYgKGNvbGxhcHNlZC50byA9PSBwb3MpIHsgY29sbGFwc2VkID0gZmFsc2U7IH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBvcyA+PSBsZW4pIHsgYnJlYWsgfVxuXG4gICAgdmFyIHVwdG8gPSBNYXRoLm1pbihsZW4sIG5leHRDaGFuZ2UpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGV4dCkge1xuICAgICAgICB2YXIgZW5kID0gcG9zICsgdGV4dC5sZW5ndGg7XG4gICAgICAgIGlmICghY29sbGFwc2VkKSB7XG4gICAgICAgICAgdmFyIHRva2VuVGV4dCA9IGVuZCA+IHVwdG8gPyB0ZXh0LnNsaWNlKDAsIHVwdG8gLSBwb3MpIDogdGV4dDtcbiAgICAgICAgICBidWlsZGVyLmFkZFRva2VuKGJ1aWxkZXIsIHRva2VuVGV4dCwgc3R5bGUgPyBzdHlsZSArIHNwYW5TdHlsZSA6IHNwYW5TdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwYW5TdGFydFN0eWxlLCBwb3MgKyB0b2tlblRleHQubGVuZ3RoID09IG5leHRDaGFuZ2UgPyBzcGFuRW5kU3R5bGUgOiBcIlwiLCB0aXRsZSwgY3NzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID49IHVwdG8pIHt0ZXh0ID0gdGV4dC5zbGljZSh1cHRvIC0gcG9zKTsgcG9zID0gdXB0bzsgYnJlYWt9XG4gICAgICAgIHBvcyA9IGVuZDtcbiAgICAgICAgc3BhblN0YXJ0U3R5bGUgPSBcIlwiO1xuICAgICAgfVxuICAgICAgdGV4dCA9IGFsbFRleHQuc2xpY2UoYXQsIGF0ID0gc3R5bGVzW2krK10pO1xuICAgICAgc3R5bGUgPSBpbnRlcnByZXRUb2tlblN0eWxlKHN0eWxlc1tpKytdLCBidWlsZGVyLmNtLm9wdGlvbnMpO1xuICAgIH1cbiAgfVxufVxuXG5cbi8vIFRoZXNlIG9iamVjdHMgYXJlIHVzZWQgdG8gcmVwcmVzZW50IHRoZSB2aXNpYmxlIChjdXJyZW50bHkgZHJhd24pXG4vLyBwYXJ0IG9mIHRoZSBkb2N1bWVudC4gQSBMaW5lVmlldyBtYXkgY29ycmVzcG9uZCB0byBtdWx0aXBsZVxuLy8gbG9naWNhbCBsaW5lcywgaWYgdGhvc2UgYXJlIGNvbm5lY3RlZCBieSBjb2xsYXBzZWQgcmFuZ2VzLlxuZnVuY3Rpb24gTGluZVZpZXcoZG9jLCBsaW5lLCBsaW5lTikge1xuICAvLyBUaGUgc3RhcnRpbmcgbGluZVxuICB0aGlzLmxpbmUgPSBsaW5lO1xuICAvLyBDb250aW51aW5nIGxpbmVzLCBpZiBhbnlcbiAgdGhpcy5yZXN0ID0gdmlzdWFsTGluZUNvbnRpbnVlZChsaW5lKTtcbiAgLy8gTnVtYmVyIG9mIGxvZ2ljYWwgbGluZXMgaW4gdGhpcyB2aXN1YWwgbGluZVxuICB0aGlzLnNpemUgPSB0aGlzLnJlc3QgPyBsaW5lTm8obHN0KHRoaXMucmVzdCkpIC0gbGluZU4gKyAxIDogMTtcbiAgdGhpcy5ub2RlID0gdGhpcy50ZXh0ID0gbnVsbDtcbiAgdGhpcy5oaWRkZW4gPSBsaW5lSXNIaWRkZW4oZG9jLCBsaW5lKTtcbn1cblxuLy8gQ3JlYXRlIGEgcmFuZ2Ugb2YgTGluZVZpZXcgb2JqZWN0cyBmb3IgdGhlIGdpdmVuIGxpbmVzLlxuZnVuY3Rpb24gYnVpbGRWaWV3QXJyYXkoY20sIGZyb20sIHRvKSB7XG4gIHZhciBhcnJheSA9IFtdLCBuZXh0UG9zO1xuICBmb3IgKHZhciBwb3MgPSBmcm9tOyBwb3MgPCB0bzsgcG9zID0gbmV4dFBvcykge1xuICAgIHZhciB2aWV3ID0gbmV3IExpbmVWaWV3KGNtLmRvYywgZ2V0TGluZShjbS5kb2MsIHBvcyksIHBvcyk7XG4gICAgbmV4dFBvcyA9IHBvcyArIHZpZXcuc2l6ZTtcbiAgICBhcnJheS5wdXNoKHZpZXcpO1xuICB9XG4gIHJldHVybiBhcnJheVxufVxuXG52YXIgb3BlcmF0aW9uR3JvdXAgPSBudWxsO1xuXG5mdW5jdGlvbiBwdXNoT3BlcmF0aW9uKG9wKSB7XG4gIGlmIChvcGVyYXRpb25Hcm91cCkge1xuICAgIG9wZXJhdGlvbkdyb3VwLm9wcy5wdXNoKG9wKTtcbiAgfSBlbHNlIHtcbiAgICBvcC5vd25zR3JvdXAgPSBvcGVyYXRpb25Hcm91cCA9IHtcbiAgICAgIG9wczogW29wXSxcbiAgICAgIGRlbGF5ZWRDYWxsYmFja3M6IFtdXG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaXJlQ2FsbGJhY2tzRm9yT3BzKGdyb3VwKSB7XG4gIC8vIENhbGxzIGRlbGF5ZWQgY2FsbGJhY2tzIGFuZCBjdXJzb3JBY3Rpdml0eSBoYW5kbGVycyB1bnRpbCBub1xuICAvLyBuZXcgb25lcyBhcHBlYXJcbiAgdmFyIGNhbGxiYWNrcyA9IGdyb3VwLmRlbGF5ZWRDYWxsYmFja3MsIGkgPSAwO1xuICBkbyB7XG4gICAgZm9yICg7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspXG4gICAgICB7IGNhbGxiYWNrc1tpXS5jYWxsKG51bGwpOyB9XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBncm91cC5vcHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBvcCA9IGdyb3VwLm9wc1tqXTtcbiAgICAgIGlmIChvcC5jdXJzb3JBY3Rpdml0eUhhbmRsZXJzKVxuICAgICAgICB7IHdoaWxlIChvcC5jdXJzb3JBY3Rpdml0eUNhbGxlZCA8IG9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnMubGVuZ3RoKVxuICAgICAgICAgIHsgb3AuY3Vyc29yQWN0aXZpdHlIYW5kbGVyc1tvcC5jdXJzb3JBY3Rpdml0eUNhbGxlZCsrXS5jYWxsKG51bGwsIG9wLmNtKTsgfSB9XG4gICAgfVxuICB9IHdoaWxlIChpIDwgY2FsbGJhY2tzLmxlbmd0aClcbn1cblxuZnVuY3Rpb24gZmluaXNoT3BlcmF0aW9uKG9wLCBlbmRDYikge1xuICB2YXIgZ3JvdXAgPSBvcC5vd25zR3JvdXA7XG4gIGlmICghZ3JvdXApIHsgcmV0dXJuIH1cblxuICB0cnkgeyBmaXJlQ2FsbGJhY2tzRm9yT3BzKGdyb3VwKTsgfVxuICBmaW5hbGx5IHtcbiAgICBvcGVyYXRpb25Hcm91cCA9IG51bGw7XG4gICAgZW5kQ2IoZ3JvdXApO1xuICB9XG59XG5cbnZhciBvcnBoYW5EZWxheWVkQ2FsbGJhY2tzID0gbnVsbDtcblxuLy8gT2Z0ZW4sIHdlIHdhbnQgdG8gc2lnbmFsIGV2ZW50cyBhdCBhIHBvaW50IHdoZXJlIHdlIGFyZSBpbiB0aGVcbi8vIG1pZGRsZSBvZiBzb21lIHdvcmssIGJ1dCBkb24ndCB3YW50IHRoZSBoYW5kbGVyIHRvIHN0YXJ0IGNhbGxpbmdcbi8vIG90aGVyIG1ldGhvZHMgb24gdGhlIGVkaXRvciwgd2hpY2ggbWlnaHQgYmUgaW4gYW4gaW5jb25zaXN0ZW50XG4vLyBzdGF0ZSBvciBzaW1wbHkgbm90IGV4cGVjdCBhbnkgb3RoZXIgZXZlbnRzIHRvIGhhcHBlbi5cbi8vIHNpZ25hbExhdGVyIGxvb2tzIHdoZXRoZXIgdGhlcmUgYXJlIGFueSBoYW5kbGVycywgYW5kIHNjaGVkdWxlc1xuLy8gdGhlbSB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBsYXN0IG9wZXJhdGlvbiBlbmRzLCBvciwgaWYgbm9cbi8vIG9wZXJhdGlvbiBpcyBhY3RpdmUsIHdoZW4gYSB0aW1lb3V0IGZpcmVzLlxuZnVuY3Rpb24gc2lnbmFsTGF0ZXIoZW1pdHRlciwgdHlwZSAvKiwgdmFsdWVzLi4uKi8pIHtcbiAgdmFyIGFyciA9IGdldEhhbmRsZXJzKGVtaXR0ZXIsIHR5cGUpO1xuICBpZiAoIWFyci5sZW5ndGgpIHsgcmV0dXJuIH1cbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpLCBsaXN0O1xuICBpZiAob3BlcmF0aW9uR3JvdXApIHtcbiAgICBsaXN0ID0gb3BlcmF0aW9uR3JvdXAuZGVsYXllZENhbGxiYWNrcztcbiAgfSBlbHNlIGlmIChvcnBoYW5EZWxheWVkQ2FsbGJhY2tzKSB7XG4gICAgbGlzdCA9IG9ycGhhbkRlbGF5ZWRDYWxsYmFja3M7XG4gIH0gZWxzZSB7XG4gICAgbGlzdCA9IG9ycGhhbkRlbGF5ZWRDYWxsYmFja3MgPSBbXTtcbiAgICBzZXRUaW1lb3V0KGZpcmVPcnBoYW5EZWxheWVkLCAwKTtcbiAgfVxuICB2YXIgbG9vcCA9IGZ1bmN0aW9uICggaSApIHtcbiAgICBsaXN0LnB1c2goZnVuY3Rpb24gKCkgeyByZXR1cm4gYXJyW2ldLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgfTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSlcbiAgICBsb29wKCBpICk7XG59XG5cbmZ1bmN0aW9uIGZpcmVPcnBoYW5EZWxheWVkKCkge1xuICB2YXIgZGVsYXllZCA9IG9ycGhhbkRlbGF5ZWRDYWxsYmFja3M7XG4gIG9ycGhhbkRlbGF5ZWRDYWxsYmFja3MgPSBudWxsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRlbGF5ZWQubGVuZ3RoOyArK2kpIHsgZGVsYXllZFtpXSgpOyB9XG59XG5cbi8vIFdoZW4gYW4gYXNwZWN0IG9mIGEgbGluZSBjaGFuZ2VzLCBhIHN0cmluZyBpcyBhZGRlZCB0b1xuLy8gbGluZVZpZXcuY2hhbmdlcy4gVGhpcyB1cGRhdGVzIHRoZSByZWxldmFudCBwYXJ0IG9mIHRoZSBsaW5lJ3Ncbi8vIERPTSBzdHJ1Y3R1cmUuXG5mdW5jdGlvbiB1cGRhdGVMaW5lRm9yQ2hhbmdlcyhjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKSB7XG4gIGZvciAodmFyIGogPSAwOyBqIDwgbGluZVZpZXcuY2hhbmdlcy5sZW5ndGg7IGorKykge1xuICAgIHZhciB0eXBlID0gbGluZVZpZXcuY2hhbmdlc1tqXTtcbiAgICBpZiAodHlwZSA9PSBcInRleHRcIikgeyB1cGRhdGVMaW5lVGV4dChjbSwgbGluZVZpZXcpOyB9XG4gICAgZWxzZSBpZiAodHlwZSA9PSBcImd1dHRlclwiKSB7IHVwZGF0ZUxpbmVHdXR0ZXIoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcyk7IH1cbiAgICBlbHNlIGlmICh0eXBlID09IFwiY2xhc3NcIikgeyB1cGRhdGVMaW5lQ2xhc3NlcyhjbSwgbGluZVZpZXcpOyB9XG4gICAgZWxzZSBpZiAodHlwZSA9PSBcIndpZGdldFwiKSB7IHVwZGF0ZUxpbmVXaWRnZXRzKGNtLCBsaW5lVmlldywgZGltcyk7IH1cbiAgfVxuICBsaW5lVmlldy5jaGFuZ2VzID0gbnVsbDtcbn1cblxuLy8gTGluZXMgd2l0aCBndXR0ZXIgZWxlbWVudHMsIHdpZGdldHMgb3IgYSBiYWNrZ3JvdW5kIGNsYXNzIG5lZWQgdG9cbi8vIGJlIHdyYXBwZWQsIGFuZCBoYXZlIHRoZSBleHRyYSBlbGVtZW50cyBhZGRlZCB0byB0aGUgd3JhcHBlciBkaXZcbmZ1bmN0aW9uIGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KSB7XG4gIGlmIChsaW5lVmlldy5ub2RlID09IGxpbmVWaWV3LnRleHQpIHtcbiAgICBsaW5lVmlldy5ub2RlID0gZWx0KFwiZGl2XCIsIG51bGwsIG51bGwsIFwicG9zaXRpb246IHJlbGF0aXZlXCIpO1xuICAgIGlmIChsaW5lVmlldy50ZXh0LnBhcmVudE5vZGUpXG4gICAgICB7IGxpbmVWaWV3LnRleHQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobGluZVZpZXcubm9kZSwgbGluZVZpZXcudGV4dCk7IH1cbiAgICBsaW5lVmlldy5ub2RlLmFwcGVuZENoaWxkKGxpbmVWaWV3LnRleHQpO1xuICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgOCkgeyBsaW5lVmlldy5ub2RlLnN0eWxlLnpJbmRleCA9IDI7IH1cbiAgfVxuICByZXR1cm4gbGluZVZpZXcubm9kZVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5lQmFja2dyb3VuZChjbSwgbGluZVZpZXcpIHtcbiAgdmFyIGNscyA9IGxpbmVWaWV3LmJnQ2xhc3MgPyBsaW5lVmlldy5iZ0NsYXNzICsgXCIgXCIgKyAobGluZVZpZXcubGluZS5iZ0NsYXNzIHx8IFwiXCIpIDogbGluZVZpZXcubGluZS5iZ0NsYXNzO1xuICBpZiAoY2xzKSB7IGNscyArPSBcIiBDb2RlTWlycm9yLWxpbmViYWNrZ3JvdW5kXCI7IH1cbiAgaWYgKGxpbmVWaWV3LmJhY2tncm91bmQpIHtcbiAgICBpZiAoY2xzKSB7IGxpbmVWaWV3LmJhY2tncm91bmQuY2xhc3NOYW1lID0gY2xzOyB9XG4gICAgZWxzZSB7IGxpbmVWaWV3LmJhY2tncm91bmQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChsaW5lVmlldy5iYWNrZ3JvdW5kKTsgbGluZVZpZXcuYmFja2dyb3VuZCA9IG51bGw7IH1cbiAgfSBlbHNlIGlmIChjbHMpIHtcbiAgICB2YXIgd3JhcCA9IGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KTtcbiAgICBsaW5lVmlldy5iYWNrZ3JvdW5kID0gd3JhcC5pbnNlcnRCZWZvcmUoZWx0KFwiZGl2XCIsIG51bGwsIGNscyksIHdyYXAuZmlyc3RDaGlsZCk7XG4gICAgY20uZGlzcGxheS5pbnB1dC5zZXRVbmVkaXRhYmxlKGxpbmVWaWV3LmJhY2tncm91bmQpO1xuICB9XG59XG5cbi8vIFdyYXBwZXIgYXJvdW5kIGJ1aWxkTGluZUNvbnRlbnQgd2hpY2ggd2lsbCByZXVzZSB0aGUgc3RydWN0dXJlXG4vLyBpbiBkaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQgd2hlbiBwb3NzaWJsZS5cbmZ1bmN0aW9uIGdldExpbmVDb250ZW50KGNtLCBsaW5lVmlldykge1xuICB2YXIgZXh0ID0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkO1xuICBpZiAoZXh0ICYmIGV4dC5saW5lID09IGxpbmVWaWV3LmxpbmUpIHtcbiAgICBjbS5kaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQgPSBudWxsO1xuICAgIGxpbmVWaWV3Lm1lYXN1cmUgPSBleHQubWVhc3VyZTtcbiAgICByZXR1cm4gZXh0LmJ1aWx0XG4gIH1cbiAgcmV0dXJuIGJ1aWxkTGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KVxufVxuXG4vLyBSZWRyYXcgdGhlIGxpbmUncyB0ZXh0LiBJbnRlcmFjdHMgd2l0aCB0aGUgYmFja2dyb3VuZCBhbmQgdGV4dFxuLy8gY2xhc3NlcyBiZWNhdXNlIHRoZSBtb2RlIG1heSBvdXRwdXQgdG9rZW5zIHRoYXQgaW5mbHVlbmNlIHRoZXNlXG4vLyBjbGFzc2VzLlxuZnVuY3Rpb24gdXBkYXRlTGluZVRleHQoY20sIGxpbmVWaWV3KSB7XG4gIHZhciBjbHMgPSBsaW5lVmlldy50ZXh0LmNsYXNzTmFtZTtcbiAgdmFyIGJ1aWx0ID0gZ2V0TGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KTtcbiAgaWYgKGxpbmVWaWV3LnRleHQgPT0gbGluZVZpZXcubm9kZSkgeyBsaW5lVmlldy5ub2RlID0gYnVpbHQucHJlOyB9XG4gIGxpbmVWaWV3LnRleHQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoYnVpbHQucHJlLCBsaW5lVmlldy50ZXh0KTtcbiAgbGluZVZpZXcudGV4dCA9IGJ1aWx0LnByZTtcbiAgaWYgKGJ1aWx0LmJnQ2xhc3MgIT0gbGluZVZpZXcuYmdDbGFzcyB8fCBidWlsdC50ZXh0Q2xhc3MgIT0gbGluZVZpZXcudGV4dENsYXNzKSB7XG4gICAgbGluZVZpZXcuYmdDbGFzcyA9IGJ1aWx0LmJnQ2xhc3M7XG4gICAgbGluZVZpZXcudGV4dENsYXNzID0gYnVpbHQudGV4dENsYXNzO1xuICAgIHVwZGF0ZUxpbmVDbGFzc2VzKGNtLCBsaW5lVmlldyk7XG4gIH0gZWxzZSBpZiAoY2xzKSB7XG4gICAgbGluZVZpZXcudGV4dC5jbGFzc05hbWUgPSBjbHM7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTGluZUNsYXNzZXMoY20sIGxpbmVWaWV3KSB7XG4gIHVwZGF0ZUxpbmVCYWNrZ3JvdW5kKGNtLCBsaW5lVmlldyk7XG4gIGlmIChsaW5lVmlldy5saW5lLndyYXBDbGFzcylcbiAgICB7IGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KS5jbGFzc05hbWUgPSBsaW5lVmlldy5saW5lLndyYXBDbGFzczsgfVxuICBlbHNlIGlmIChsaW5lVmlldy5ub2RlICE9IGxpbmVWaWV3LnRleHQpXG4gICAgeyBsaW5lVmlldy5ub2RlLmNsYXNzTmFtZSA9IFwiXCI7IH1cbiAgdmFyIHRleHRDbGFzcyA9IGxpbmVWaWV3LnRleHRDbGFzcyA/IGxpbmVWaWV3LnRleHRDbGFzcyArIFwiIFwiICsgKGxpbmVWaWV3LmxpbmUudGV4dENsYXNzIHx8IFwiXCIpIDogbGluZVZpZXcubGluZS50ZXh0Q2xhc3M7XG4gIGxpbmVWaWV3LnRleHQuY2xhc3NOYW1lID0gdGV4dENsYXNzIHx8IFwiXCI7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpbmVHdXR0ZXIoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcykge1xuICBpZiAobGluZVZpZXcuZ3V0dGVyKSB7XG4gICAgbGluZVZpZXcubm9kZS5yZW1vdmVDaGlsZChsaW5lVmlldy5ndXR0ZXIpO1xuICAgIGxpbmVWaWV3Lmd1dHRlciA9IG51bGw7XG4gIH1cbiAgaWYgKGxpbmVWaWV3Lmd1dHRlckJhY2tncm91bmQpIHtcbiAgICBsaW5lVmlldy5ub2RlLnJlbW92ZUNoaWxkKGxpbmVWaWV3Lmd1dHRlckJhY2tncm91bmQpO1xuICAgIGxpbmVWaWV3Lmd1dHRlckJhY2tncm91bmQgPSBudWxsO1xuICB9XG4gIGlmIChsaW5lVmlldy5saW5lLmd1dHRlckNsYXNzKSB7XG4gICAgdmFyIHdyYXAgPSBlbnN1cmVMaW5lV3JhcHBlZChsaW5lVmlldyk7XG4gICAgbGluZVZpZXcuZ3V0dGVyQmFja2dyb3VuZCA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItZ3V0dGVyLWJhY2tncm91bmQgXCIgKyBsaW5lVmlldy5saW5lLmd1dHRlckNsYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFwibGVmdDogXCIgKyAoY20ub3B0aW9ucy5maXhlZEd1dHRlciA/IGRpbXMuZml4ZWRQb3MgOiAtZGltcy5ndXR0ZXJUb3RhbFdpZHRoKSArIFwicHg7IHdpZHRoOiBcIiArIChkaW1zLmd1dHRlclRvdGFsV2lkdGgpICsgXCJweFwiKSk7XG4gICAgY20uZGlzcGxheS5pbnB1dC5zZXRVbmVkaXRhYmxlKGxpbmVWaWV3Lmd1dHRlckJhY2tncm91bmQpO1xuICAgIHdyYXAuaW5zZXJ0QmVmb3JlKGxpbmVWaWV3Lmd1dHRlckJhY2tncm91bmQsIGxpbmVWaWV3LnRleHQpO1xuICB9XG4gIHZhciBtYXJrZXJzID0gbGluZVZpZXcubGluZS5ndXR0ZXJNYXJrZXJzO1xuICBpZiAoY20ub3B0aW9ucy5saW5lTnVtYmVycyB8fCBtYXJrZXJzKSB7XG4gICAgdmFyIHdyYXAkMSA9IGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KTtcbiAgICB2YXIgZ3V0dGVyV3JhcCA9IGxpbmVWaWV3Lmd1dHRlciA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItZ3V0dGVyLXdyYXBwZXJcIiwgKFwibGVmdDogXCIgKyAoY20ub3B0aW9ucy5maXhlZEd1dHRlciA/IGRpbXMuZml4ZWRQb3MgOiAtZGltcy5ndXR0ZXJUb3RhbFdpZHRoKSArIFwicHhcIikpO1xuICAgIGNtLmRpc3BsYXkuaW5wdXQuc2V0VW5lZGl0YWJsZShndXR0ZXJXcmFwKTtcbiAgICB3cmFwJDEuaW5zZXJ0QmVmb3JlKGd1dHRlcldyYXAsIGxpbmVWaWV3LnRleHQpO1xuICAgIGlmIChsaW5lVmlldy5saW5lLmd1dHRlckNsYXNzKVxuICAgICAgeyBndXR0ZXJXcmFwLmNsYXNzTmFtZSArPSBcIiBcIiArIGxpbmVWaWV3LmxpbmUuZ3V0dGVyQ2xhc3M7IH1cbiAgICBpZiAoY20ub3B0aW9ucy5saW5lTnVtYmVycyAmJiAoIW1hcmtlcnMgfHwgIW1hcmtlcnNbXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCJdKSlcbiAgICAgIHsgbGluZVZpZXcubGluZU51bWJlciA9IGd1dHRlcldyYXAuYXBwZW5kQ2hpbGQoXG4gICAgICAgIGVsdChcImRpdlwiLCBsaW5lTnVtYmVyRm9yKGNtLm9wdGlvbnMsIGxpbmVOKSxcbiAgICAgICAgICAgIFwiQ29kZU1pcnJvci1saW5lbnVtYmVyIENvZGVNaXJyb3ItZ3V0dGVyLWVsdFwiLFxuICAgICAgICAgICAgKFwibGVmdDogXCIgKyAoZGltcy5ndXR0ZXJMZWZ0W1wiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiXSkgKyBcInB4OyB3aWR0aDogXCIgKyAoY20uZGlzcGxheS5saW5lTnVtSW5uZXJXaWR0aCkgKyBcInB4XCIpKSk7IH1cbiAgICBpZiAobWFya2VycykgeyBmb3IgKHZhciBrID0gMDsgayA8IGNtLm9wdGlvbnMuZ3V0dGVycy5sZW5ndGg7ICsraykge1xuICAgICAgdmFyIGlkID0gY20ub3B0aW9ucy5ndXR0ZXJzW2tdLCBmb3VuZCA9IG1hcmtlcnMuaGFzT3duUHJvcGVydHkoaWQpICYmIG1hcmtlcnNbaWRdO1xuICAgICAgaWYgKGZvdW5kKVxuICAgICAgICB7IGd1dHRlcldyYXAuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIFtmb3VuZF0sIFwiQ29kZU1pcnJvci1ndXR0ZXItZWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChcImxlZnQ6IFwiICsgKGRpbXMuZ3V0dGVyTGVmdFtpZF0pICsgXCJweDsgd2lkdGg6IFwiICsgKGRpbXMuZ3V0dGVyV2lkdGhbaWRdKSArIFwicHhcIikpKTsgfVxuICAgIH0gfVxuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpbmVXaWRnZXRzKGNtLCBsaW5lVmlldywgZGltcykge1xuICBpZiAobGluZVZpZXcuYWxpZ25hYmxlKSB7IGxpbmVWaWV3LmFsaWduYWJsZSA9IG51bGw7IH1cbiAgZm9yICh2YXIgbm9kZSA9IGxpbmVWaWV3Lm5vZGUuZmlyc3RDaGlsZCwgbmV4dCA9ICh2b2lkIDApOyBub2RlOyBub2RlID0gbmV4dCkge1xuICAgIG5leHQgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgIGlmIChub2RlLmNsYXNzTmFtZSA9PSBcIkNvZGVNaXJyb3ItbGluZXdpZGdldFwiKVxuICAgICAgeyBsaW5lVmlldy5ub2RlLnJlbW92ZUNoaWxkKG5vZGUpOyB9XG4gIH1cbiAgaW5zZXJ0TGluZVdpZGdldHMoY20sIGxpbmVWaWV3LCBkaW1zKTtcbn1cblxuLy8gQnVpbGQgYSBsaW5lJ3MgRE9NIHJlcHJlc2VudGF0aW9uIGZyb20gc2NyYXRjaFxuZnVuY3Rpb24gYnVpbGRMaW5lRWxlbWVudChjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKSB7XG4gIHZhciBidWlsdCA9IGdldExpbmVDb250ZW50KGNtLCBsaW5lVmlldyk7XG4gIGxpbmVWaWV3LnRleHQgPSBsaW5lVmlldy5ub2RlID0gYnVpbHQucHJlO1xuICBpZiAoYnVpbHQuYmdDbGFzcykgeyBsaW5lVmlldy5iZ0NsYXNzID0gYnVpbHQuYmdDbGFzczsgfVxuICBpZiAoYnVpbHQudGV4dENsYXNzKSB7IGxpbmVWaWV3LnRleHRDbGFzcyA9IGJ1aWx0LnRleHRDbGFzczsgfVxuXG4gIHVwZGF0ZUxpbmVDbGFzc2VzKGNtLCBsaW5lVmlldyk7XG4gIHVwZGF0ZUxpbmVHdXR0ZXIoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcyk7XG4gIGluc2VydExpbmVXaWRnZXRzKGNtLCBsaW5lVmlldywgZGltcyk7XG4gIHJldHVybiBsaW5lVmlldy5ub2RlXG59XG5cbi8vIEEgbGluZVZpZXcgbWF5IGNvbnRhaW4gbXVsdGlwbGUgbG9naWNhbCBsaW5lcyAod2hlbiBtZXJnZWQgYnlcbi8vIGNvbGxhcHNlZCBzcGFucykuIFRoZSB3aWRnZXRzIGZvciBhbGwgb2YgdGhlbSBuZWVkIHRvIGJlIGRyYXduLlxuZnVuY3Rpb24gaW5zZXJ0TGluZVdpZGdldHMoY20sIGxpbmVWaWV3LCBkaW1zKSB7XG4gIGluc2VydExpbmVXaWRnZXRzRm9yKGNtLCBsaW5lVmlldy5saW5lLCBsaW5lVmlldywgZGltcywgdHJ1ZSk7XG4gIGlmIChsaW5lVmlldy5yZXN0KSB7IGZvciAodmFyIGkgPSAwOyBpIDwgbGluZVZpZXcucmVzdC5sZW5ndGg7IGkrKylcbiAgICB7IGluc2VydExpbmVXaWRnZXRzRm9yKGNtLCBsaW5lVmlldy5yZXN0W2ldLCBsaW5lVmlldywgZGltcywgZmFsc2UpOyB9IH1cbn1cblxuZnVuY3Rpb24gaW5zZXJ0TGluZVdpZGdldHNGb3IoY20sIGxpbmUsIGxpbmVWaWV3LCBkaW1zLCBhbGxvd0Fib3ZlKSB7XG4gIGlmICghbGluZS53aWRnZXRzKSB7IHJldHVybiB9XG4gIHZhciB3cmFwID0gZW5zdXJlTGluZVdyYXBwZWQobGluZVZpZXcpO1xuICBmb3IgKHZhciBpID0gMCwgd3MgPSBsaW5lLndpZGdldHM7IGkgPCB3cy5sZW5ndGg7ICsraSkge1xuICAgIHZhciB3aWRnZXQgPSB3c1tpXSwgbm9kZSA9IGVsdChcImRpdlwiLCBbd2lkZ2V0Lm5vZGVdLCBcIkNvZGVNaXJyb3ItbGluZXdpZGdldFwiKTtcbiAgICBpZiAoIXdpZGdldC5oYW5kbGVNb3VzZUV2ZW50cykgeyBub2RlLnNldEF0dHJpYnV0ZShcImNtLWlnbm9yZS1ldmVudHNcIiwgXCJ0cnVlXCIpOyB9XG4gICAgcG9zaXRpb25MaW5lV2lkZ2V0KHdpZGdldCwgbm9kZSwgbGluZVZpZXcsIGRpbXMpO1xuICAgIGNtLmRpc3BsYXkuaW5wdXQuc2V0VW5lZGl0YWJsZShub2RlKTtcbiAgICBpZiAoYWxsb3dBYm92ZSAmJiB3aWRnZXQuYWJvdmUpXG4gICAgICB7IHdyYXAuaW5zZXJ0QmVmb3JlKG5vZGUsIGxpbmVWaWV3Lmd1dHRlciB8fCBsaW5lVmlldy50ZXh0KTsgfVxuICAgIGVsc2VcbiAgICAgIHsgd3JhcC5hcHBlbmRDaGlsZChub2RlKTsgfVxuICAgIHNpZ25hbExhdGVyKHdpZGdldCwgXCJyZWRyYXdcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9zaXRpb25MaW5lV2lkZ2V0KHdpZGdldCwgbm9kZSwgbGluZVZpZXcsIGRpbXMpIHtcbiAgaWYgKHdpZGdldC5ub0hTY3JvbGwpIHtcbiAgICAobGluZVZpZXcuYWxpZ25hYmxlIHx8IChsaW5lVmlldy5hbGlnbmFibGUgPSBbXSkpLnB1c2gobm9kZSk7XG4gICAgdmFyIHdpZHRoID0gZGltcy53cmFwcGVyV2lkdGg7XG4gICAgbm9kZS5zdHlsZS5sZWZ0ID0gZGltcy5maXhlZFBvcyArIFwicHhcIjtcbiAgICBpZiAoIXdpZGdldC5jb3Zlckd1dHRlcikge1xuICAgICAgd2lkdGggLT0gZGltcy5ndXR0ZXJUb3RhbFdpZHRoO1xuICAgICAgbm9kZS5zdHlsZS5wYWRkaW5nTGVmdCA9IGRpbXMuZ3V0dGVyVG90YWxXaWR0aCArIFwicHhcIjtcbiAgICB9XG4gICAgbm9kZS5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICB9XG4gIGlmICh3aWRnZXQuY292ZXJHdXR0ZXIpIHtcbiAgICBub2RlLnN0eWxlLnpJbmRleCA9IDU7XG4gICAgbm9kZS5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcbiAgICBpZiAoIXdpZGdldC5ub0hTY3JvbGwpIHsgbm9kZS5zdHlsZS5tYXJnaW5MZWZ0ID0gLWRpbXMuZ3V0dGVyVG90YWxXaWR0aCArIFwicHhcIjsgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHdpZGdldEhlaWdodCh3aWRnZXQpIHtcbiAgaWYgKHdpZGdldC5oZWlnaHQgIT0gbnVsbCkgeyByZXR1cm4gd2lkZ2V0LmhlaWdodCB9XG4gIHZhciBjbSA9IHdpZGdldC5kb2MuY207XG4gIGlmICghY20pIHsgcmV0dXJuIDAgfVxuICBpZiAoIWNvbnRhaW5zKGRvY3VtZW50LmJvZHksIHdpZGdldC5ub2RlKSkge1xuICAgIHZhciBwYXJlbnRTdHlsZSA9IFwicG9zaXRpb246IHJlbGF0aXZlO1wiO1xuICAgIGlmICh3aWRnZXQuY292ZXJHdXR0ZXIpXG4gICAgICB7IHBhcmVudFN0eWxlICs9IFwibWFyZ2luLWxlZnQ6IC1cIiArIGNtLmRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aCArIFwicHg7XCI7IH1cbiAgICBpZiAod2lkZ2V0Lm5vSFNjcm9sbClcbiAgICAgIHsgcGFyZW50U3R5bGUgKz0gXCJ3aWR0aDogXCIgKyBjbS5kaXNwbGF5LndyYXBwZXIuY2xpZW50V2lkdGggKyBcInB4O1wiOyB9XG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoY20uZGlzcGxheS5tZWFzdXJlLCBlbHQoXCJkaXZcIiwgW3dpZGdldC5ub2RlXSwgbnVsbCwgcGFyZW50U3R5bGUpKTtcbiAgfVxuICByZXR1cm4gd2lkZ2V0LmhlaWdodCA9IHdpZGdldC5ub2RlLnBhcmVudE5vZGUub2Zmc2V0SGVpZ2h0XG59XG5cbi8vIFJldHVybiB0cnVlIHdoZW4gdGhlIGdpdmVuIG1vdXNlIGV2ZW50IGhhcHBlbmVkIGluIGEgd2lkZ2V0XG5mdW5jdGlvbiBldmVudEluV2lkZ2V0KGRpc3BsYXksIGUpIHtcbiAgZm9yICh2YXIgbiA9IGVfdGFyZ2V0KGUpOyBuICE9IGRpc3BsYXkud3JhcHBlcjsgbiA9IG4ucGFyZW50Tm9kZSkge1xuICAgIGlmICghbiB8fCAobi5ub2RlVHlwZSA9PSAxICYmIG4uZ2V0QXR0cmlidXRlKFwiY20taWdub3JlLWV2ZW50c1wiKSA9PSBcInRydWVcIikgfHxcbiAgICAgICAgKG4ucGFyZW50Tm9kZSA9PSBkaXNwbGF5LnNpemVyICYmIG4gIT0gZGlzcGxheS5tb3ZlcikpXG4gICAgICB7IHJldHVybiB0cnVlIH1cbiAgfVxufVxuXG4vLyBQT1NJVElPTiBNRUFTVVJFTUVOVFxuXG5mdW5jdGlvbiBwYWRkaW5nVG9wKGRpc3BsYXkpIHtyZXR1cm4gZGlzcGxheS5saW5lU3BhY2Uub2Zmc2V0VG9wfVxuZnVuY3Rpb24gcGFkZGluZ1ZlcnQoZGlzcGxheSkge3JldHVybiBkaXNwbGF5Lm1vdmVyLm9mZnNldEhlaWdodCAtIGRpc3BsYXkubGluZVNwYWNlLm9mZnNldEhlaWdodH1cbmZ1bmN0aW9uIHBhZGRpbmdIKGRpc3BsYXkpIHtcbiAgaWYgKGRpc3BsYXkuY2FjaGVkUGFkZGluZ0gpIHsgcmV0dXJuIGRpc3BsYXkuY2FjaGVkUGFkZGluZ0ggfVxuICB2YXIgZSA9IHJlbW92ZUNoaWxkcmVuQW5kQWRkKGRpc3BsYXkubWVhc3VyZSwgZWx0KFwicHJlXCIsIFwieFwiKSk7XG4gIHZhciBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlID8gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZSkgOiBlLmN1cnJlbnRTdHlsZTtcbiAgdmFyIGRhdGEgPSB7bGVmdDogcGFyc2VJbnQoc3R5bGUucGFkZGluZ0xlZnQpLCByaWdodDogcGFyc2VJbnQoc3R5bGUucGFkZGluZ1JpZ2h0KX07XG4gIGlmICghaXNOYU4oZGF0YS5sZWZ0KSAmJiAhaXNOYU4oZGF0YS5yaWdodCkpIHsgZGlzcGxheS5jYWNoZWRQYWRkaW5nSCA9IGRhdGE7IH1cbiAgcmV0dXJuIGRhdGFcbn1cblxuZnVuY3Rpb24gc2Nyb2xsR2FwKGNtKSB7IHJldHVybiBzY3JvbGxlckdhcCAtIGNtLmRpc3BsYXkubmF0aXZlQmFyV2lkdGggfVxuZnVuY3Rpb24gZGlzcGxheVdpZHRoKGNtKSB7XG4gIHJldHVybiBjbS5kaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoIC0gc2Nyb2xsR2FwKGNtKSAtIGNtLmRpc3BsYXkuYmFyV2lkdGhcbn1cbmZ1bmN0aW9uIGRpc3BsYXlIZWlnaHQoY20pIHtcbiAgcmV0dXJuIGNtLmRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC0gc2Nyb2xsR2FwKGNtKSAtIGNtLmRpc3BsYXkuYmFySGVpZ2h0XG59XG5cbi8vIEVuc3VyZSB0aGUgbGluZVZpZXcud3JhcHBpbmcuaGVpZ2h0cyBhcnJheSBpcyBwb3B1bGF0ZWQuIFRoaXMgaXNcbi8vIGFuIGFycmF5IG9mIGJvdHRvbSBvZmZzZXRzIGZvciB0aGUgbGluZXMgdGhhdCBtYWtlIHVwIGEgZHJhd25cbi8vIGxpbmUuIFdoZW4gbGluZVdyYXBwaW5nIGlzIG9uLCB0aGVyZSBtaWdodCBiZSBtb3JlIHRoYW4gb25lXG4vLyBoZWlnaHQuXG5mdW5jdGlvbiBlbnN1cmVMaW5lSGVpZ2h0cyhjbSwgbGluZVZpZXcsIHJlY3QpIHtcbiAgdmFyIHdyYXBwaW5nID0gY20ub3B0aW9ucy5saW5lV3JhcHBpbmc7XG4gIHZhciBjdXJXaWR0aCA9IHdyYXBwaW5nICYmIGRpc3BsYXlXaWR0aChjbSk7XG4gIGlmICghbGluZVZpZXcubWVhc3VyZS5oZWlnaHRzIHx8IHdyYXBwaW5nICYmIGxpbmVWaWV3Lm1lYXN1cmUud2lkdGggIT0gY3VyV2lkdGgpIHtcbiAgICB2YXIgaGVpZ2h0cyA9IGxpbmVWaWV3Lm1lYXN1cmUuaGVpZ2h0cyA9IFtdO1xuICAgIGlmICh3cmFwcGluZykge1xuICAgICAgbGluZVZpZXcubWVhc3VyZS53aWR0aCA9IGN1cldpZHRoO1xuICAgICAgdmFyIHJlY3RzID0gbGluZVZpZXcudGV4dC5maXJzdENoaWxkLmdldENsaWVudFJlY3RzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY3RzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2YXIgY3VyID0gcmVjdHNbaV0sIG5leHQgPSByZWN0c1tpICsgMV07XG4gICAgICAgIGlmIChNYXRoLmFicyhjdXIuYm90dG9tIC0gbmV4dC5ib3R0b20pID4gMilcbiAgICAgICAgICB7IGhlaWdodHMucHVzaCgoY3VyLmJvdHRvbSArIG5leHQudG9wKSAvIDIgLSByZWN0LnRvcCk7IH1cbiAgICAgIH1cbiAgICB9XG4gICAgaGVpZ2h0cy5wdXNoKHJlY3QuYm90dG9tIC0gcmVjdC50b3ApO1xuICB9XG59XG5cbi8vIEZpbmQgYSBsaW5lIG1hcCAobWFwcGluZyBjaGFyYWN0ZXIgb2Zmc2V0cyB0byB0ZXh0IG5vZGVzKSBhbmQgYVxuLy8gbWVhc3VyZW1lbnQgY2FjaGUgZm9yIHRoZSBnaXZlbiBsaW5lIG51bWJlci4gKEEgbGluZSB2aWV3IG1pZ2h0XG4vLyBjb250YWluIG11bHRpcGxlIGxpbmVzIHdoZW4gY29sbGFwc2VkIHJhbmdlcyBhcmUgcHJlc2VudC4pXG5mdW5jdGlvbiBtYXBGcm9tTGluZVZpZXcobGluZVZpZXcsIGxpbmUsIGxpbmVOKSB7XG4gIGlmIChsaW5lVmlldy5saW5lID09IGxpbmUpXG4gICAgeyByZXR1cm4ge21hcDogbGluZVZpZXcubWVhc3VyZS5tYXAsIGNhY2hlOiBsaW5lVmlldy5tZWFzdXJlLmNhY2hlfSB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZVZpZXcucmVzdC5sZW5ndGg7IGkrKylcbiAgICB7IGlmIChsaW5lVmlldy5yZXN0W2ldID09IGxpbmUpXG4gICAgICB7IHJldHVybiB7bWFwOiBsaW5lVmlldy5tZWFzdXJlLm1hcHNbaV0sIGNhY2hlOiBsaW5lVmlldy5tZWFzdXJlLmNhY2hlc1tpXX0gfSB9XG4gIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGxpbmVWaWV3LnJlc3QubGVuZ3RoOyBpJDErKylcbiAgICB7IGlmIChsaW5lTm8obGluZVZpZXcucmVzdFtpJDFdKSA+IGxpbmVOKVxuICAgICAgeyByZXR1cm4ge21hcDogbGluZVZpZXcubWVhc3VyZS5tYXBzW2kkMV0sIGNhY2hlOiBsaW5lVmlldy5tZWFzdXJlLmNhY2hlc1tpJDFdLCBiZWZvcmU6IHRydWV9IH0gfVxufVxuXG4vLyBSZW5kZXIgYSBsaW5lIGludG8gdGhlIGhpZGRlbiBub2RlIGRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZC4gVXNlZFxuLy8gd2hlbiBtZWFzdXJlbWVudCBpcyBuZWVkZWQgZm9yIGEgbGluZSB0aGF0J3Mgbm90IGluIHRoZSB2aWV3cG9ydC5cbmZ1bmN0aW9uIHVwZGF0ZUV4dGVybmFsTWVhc3VyZW1lbnQoY20sIGxpbmUpIHtcbiAgbGluZSA9IHZpc3VhbExpbmUobGluZSk7XG4gIHZhciBsaW5lTiA9IGxpbmVObyhsaW5lKTtcbiAgdmFyIHZpZXcgPSBjbS5kaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQgPSBuZXcgTGluZVZpZXcoY20uZG9jLCBsaW5lLCBsaW5lTik7XG4gIHZpZXcubGluZU4gPSBsaW5lTjtcbiAgdmFyIGJ1aWx0ID0gdmlldy5idWlsdCA9IGJ1aWxkTGluZUNvbnRlbnQoY20sIHZpZXcpO1xuICB2aWV3LnRleHQgPSBidWlsdC5wcmU7XG4gIHJlbW92ZUNoaWxkcmVuQW5kQWRkKGNtLmRpc3BsYXkubGluZU1lYXN1cmUsIGJ1aWx0LnByZSk7XG4gIHJldHVybiB2aWV3XG59XG5cbi8vIEdldCBhIHt0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHR9IGJveCAoaW4gbGluZS1sb2NhbCBjb29yZGluYXRlcylcbi8vIGZvciBhIGdpdmVuIGNoYXJhY3Rlci5cbmZ1bmN0aW9uIG1lYXN1cmVDaGFyKGNtLCBsaW5lLCBjaCwgYmlhcykge1xuICByZXR1cm4gbWVhc3VyZUNoYXJQcmVwYXJlZChjbSwgcHJlcGFyZU1lYXN1cmVGb3JMaW5lKGNtLCBsaW5lKSwgY2gsIGJpYXMpXG59XG5cbi8vIEZpbmQgYSBsaW5lIHZpZXcgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgZ2l2ZW4gbGluZSBudW1iZXIuXG5mdW5jdGlvbiBmaW5kVmlld0ZvckxpbmUoY20sIGxpbmVOKSB7XG4gIGlmIChsaW5lTiA+PSBjbS5kaXNwbGF5LnZpZXdGcm9tICYmIGxpbmVOIDwgY20uZGlzcGxheS52aWV3VG8pXG4gICAgeyByZXR1cm4gY20uZGlzcGxheS52aWV3W2ZpbmRWaWV3SW5kZXgoY20sIGxpbmVOKV0gfVxuICB2YXIgZXh0ID0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkO1xuICBpZiAoZXh0ICYmIGxpbmVOID49IGV4dC5saW5lTiAmJiBsaW5lTiA8IGV4dC5saW5lTiArIGV4dC5zaXplKVxuICAgIHsgcmV0dXJuIGV4dCB9XG59XG5cbi8vIE1lYXN1cmVtZW50IGNhbiBiZSBzcGxpdCBpbiB0d28gc3RlcHMsIHRoZSBzZXQtdXAgd29yayB0aGF0XG4vLyBhcHBsaWVzIHRvIHRoZSB3aG9sZSBsaW5lLCBhbmQgdGhlIG1lYXN1cmVtZW50IG9mIHRoZSBhY3R1YWxcbi8vIGNoYXJhY3Rlci4gRnVuY3Rpb25zIGxpa2UgY29vcmRzQ2hhciwgdGhhdCBuZWVkIHRvIGRvIGEgbG90IG9mXG4vLyBtZWFzdXJlbWVudHMgaW4gYSByb3csIGNhbiB0aHVzIGVuc3VyZSB0aGF0IHRoZSBzZXQtdXAgd29yayBpc1xuLy8gb25seSBkb25lIG9uY2UuXG5mdW5jdGlvbiBwcmVwYXJlTWVhc3VyZUZvckxpbmUoY20sIGxpbmUpIHtcbiAgdmFyIGxpbmVOID0gbGluZU5vKGxpbmUpO1xuICB2YXIgdmlldyA9IGZpbmRWaWV3Rm9yTGluZShjbSwgbGluZU4pO1xuICBpZiAodmlldyAmJiAhdmlldy50ZXh0KSB7XG4gICAgdmlldyA9IG51bGw7XG4gIH0gZWxzZSBpZiAodmlldyAmJiB2aWV3LmNoYW5nZXMpIHtcbiAgICB1cGRhdGVMaW5lRm9yQ2hhbmdlcyhjbSwgdmlldywgbGluZU4sIGdldERpbWVuc2lvbnMoY20pKTtcbiAgICBjbS5jdXJPcC5mb3JjZVVwZGF0ZSA9IHRydWU7XG4gIH1cbiAgaWYgKCF2aWV3KVxuICAgIHsgdmlldyA9IHVwZGF0ZUV4dGVybmFsTWVhc3VyZW1lbnQoY20sIGxpbmUpOyB9XG5cbiAgdmFyIGluZm8gPSBtYXBGcm9tTGluZVZpZXcodmlldywgbGluZSwgbGluZU4pO1xuICByZXR1cm4ge1xuICAgIGxpbmU6IGxpbmUsIHZpZXc6IHZpZXcsIHJlY3Q6IG51bGwsXG4gICAgbWFwOiBpbmZvLm1hcCwgY2FjaGU6IGluZm8uY2FjaGUsIGJlZm9yZTogaW5mby5iZWZvcmUsXG4gICAgaGFzSGVpZ2h0czogZmFsc2VcbiAgfVxufVxuXG4vLyBHaXZlbiBhIHByZXBhcmVkIG1lYXN1cmVtZW50IG9iamVjdCwgbWVhc3VyZXMgdGhlIHBvc2l0aW9uIG9mIGFuXG4vLyBhY3R1YWwgY2hhcmFjdGVyIChvciBmZXRjaGVzIGl0IGZyb20gdGhlIGNhY2hlKS5cbmZ1bmN0aW9uIG1lYXN1cmVDaGFyUHJlcGFyZWQoY20sIHByZXBhcmVkLCBjaCwgYmlhcywgdmFySGVpZ2h0KSB7XG4gIGlmIChwcmVwYXJlZC5iZWZvcmUpIHsgY2ggPSAtMTsgfVxuICB2YXIga2V5ID0gY2ggKyAoYmlhcyB8fCBcIlwiKSwgZm91bmQ7XG4gIGlmIChwcmVwYXJlZC5jYWNoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgZm91bmQgPSBwcmVwYXJlZC5jYWNoZVtrZXldO1xuICB9IGVsc2Uge1xuICAgIGlmICghcHJlcGFyZWQucmVjdClcbiAgICAgIHsgcHJlcGFyZWQucmVjdCA9IHByZXBhcmVkLnZpZXcudGV4dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTsgfVxuICAgIGlmICghcHJlcGFyZWQuaGFzSGVpZ2h0cykge1xuICAgICAgZW5zdXJlTGluZUhlaWdodHMoY20sIHByZXBhcmVkLnZpZXcsIHByZXBhcmVkLnJlY3QpO1xuICAgICAgcHJlcGFyZWQuaGFzSGVpZ2h0cyA9IHRydWU7XG4gICAgfVxuICAgIGZvdW5kID0gbWVhc3VyZUNoYXJJbm5lcihjbSwgcHJlcGFyZWQsIGNoLCBiaWFzKTtcbiAgICBpZiAoIWZvdW5kLmJvZ3VzKSB7IHByZXBhcmVkLmNhY2hlW2tleV0gPSBmb3VuZDsgfVxuICB9XG4gIHJldHVybiB7bGVmdDogZm91bmQubGVmdCwgcmlnaHQ6IGZvdW5kLnJpZ2h0LFxuICAgICAgICAgIHRvcDogdmFySGVpZ2h0ID8gZm91bmQucnRvcCA6IGZvdW5kLnRvcCxcbiAgICAgICAgICBib3R0b206IHZhckhlaWdodCA/IGZvdW5kLnJib3R0b20gOiBmb3VuZC5ib3R0b219XG59XG5cbnZhciBudWxsUmVjdCA9IHtsZWZ0OiAwLCByaWdodDogMCwgdG9wOiAwLCBib3R0b206IDB9O1xuXG5mdW5jdGlvbiBub2RlQW5kT2Zmc2V0SW5MaW5lTWFwKG1hcCQkMSwgY2gsIGJpYXMpIHtcbiAgdmFyIG5vZGUsIHN0YXJ0LCBlbmQsIGNvbGxhcHNlLCBtU3RhcnQsIG1FbmQ7XG4gIC8vIEZpcnN0LCBzZWFyY2ggdGhlIGxpbmUgbWFwIGZvciB0aGUgdGV4dCBub2RlIGNvcnJlc3BvbmRpbmcgdG8sXG4gIC8vIG9yIGNsb3Nlc3QgdG8sIHRoZSB0YXJnZXQgY2hhcmFjdGVyLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcCQkMS5sZW5ndGg7IGkgKz0gMykge1xuICAgIG1TdGFydCA9IG1hcCQkMVtpXTtcbiAgICBtRW5kID0gbWFwJCQxW2kgKyAxXTtcbiAgICBpZiAoY2ggPCBtU3RhcnQpIHtcbiAgICAgIHN0YXJ0ID0gMDsgZW5kID0gMTtcbiAgICAgIGNvbGxhcHNlID0gXCJsZWZ0XCI7XG4gICAgfSBlbHNlIGlmIChjaCA8IG1FbmQpIHtcbiAgICAgIHN0YXJ0ID0gY2ggLSBtU3RhcnQ7XG4gICAgICBlbmQgPSBzdGFydCArIDE7XG4gICAgfSBlbHNlIGlmIChpID09IG1hcCQkMS5sZW5ndGggLSAzIHx8IGNoID09IG1FbmQgJiYgbWFwJCQxW2kgKyAzXSA+IGNoKSB7XG4gICAgICBlbmQgPSBtRW5kIC0gbVN0YXJ0O1xuICAgICAgc3RhcnQgPSBlbmQgLSAxO1xuICAgICAgaWYgKGNoID49IG1FbmQpIHsgY29sbGFwc2UgPSBcInJpZ2h0XCI7IH1cbiAgICB9XG4gICAgaWYgKHN0YXJ0ICE9IG51bGwpIHtcbiAgICAgIG5vZGUgPSBtYXAkJDFbaSArIDJdO1xuICAgICAgaWYgKG1TdGFydCA9PSBtRW5kICYmIGJpYXMgPT0gKG5vZGUuaW5zZXJ0TGVmdCA/IFwibGVmdFwiIDogXCJyaWdodFwiKSlcbiAgICAgICAgeyBjb2xsYXBzZSA9IGJpYXM7IH1cbiAgICAgIGlmIChiaWFzID09IFwibGVmdFwiICYmIHN0YXJ0ID09IDApXG4gICAgICAgIHsgd2hpbGUgKGkgJiYgbWFwJCQxW2kgLSAyXSA9PSBtYXAkJDFbaSAtIDNdICYmIG1hcCQkMVtpIC0gMV0uaW5zZXJ0TGVmdCkge1xuICAgICAgICAgIG5vZGUgPSBtYXAkJDFbKGkgLT0gMykgKyAyXTtcbiAgICAgICAgICBjb2xsYXBzZSA9IFwibGVmdFwiO1xuICAgICAgICB9IH1cbiAgICAgIGlmIChiaWFzID09IFwicmlnaHRcIiAmJiBzdGFydCA9PSBtRW5kIC0gbVN0YXJ0KVxuICAgICAgICB7IHdoaWxlIChpIDwgbWFwJCQxLmxlbmd0aCAtIDMgJiYgbWFwJCQxW2kgKyAzXSA9PSBtYXAkJDFbaSArIDRdICYmICFtYXAkJDFbaSArIDVdLmluc2VydExlZnQpIHtcbiAgICAgICAgICBub2RlID0gbWFwJCQxWyhpICs9IDMpICsgMl07XG4gICAgICAgICAgY29sbGFwc2UgPSBcInJpZ2h0XCI7XG4gICAgICAgIH0gfVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtub2RlOiBub2RlLCBzdGFydDogc3RhcnQsIGVuZDogZW5kLCBjb2xsYXBzZTogY29sbGFwc2UsIGNvdmVyU3RhcnQ6IG1TdGFydCwgY292ZXJFbmQ6IG1FbmR9XG59XG5cbmZ1bmN0aW9uIGdldFVzZWZ1bFJlY3QocmVjdHMsIGJpYXMpIHtcbiAgdmFyIHJlY3QgPSBudWxsUmVjdDtcbiAgaWYgKGJpYXMgPT0gXCJsZWZ0XCIpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCByZWN0cy5sZW5ndGg7IGkrKykge1xuICAgIGlmICgocmVjdCA9IHJlY3RzW2ldKS5sZWZ0ICE9IHJlY3QucmlnaHQpIHsgYnJlYWsgfVxuICB9IH0gZWxzZSB7IGZvciAodmFyIGkkMSA9IHJlY3RzLmxlbmd0aCAtIDE7IGkkMSA+PSAwOyBpJDEtLSkge1xuICAgIGlmICgocmVjdCA9IHJlY3RzW2kkMV0pLmxlZnQgIT0gcmVjdC5yaWdodCkgeyBicmVhayB9XG4gIH0gfVxuICByZXR1cm4gcmVjdFxufVxuXG5mdW5jdGlvbiBtZWFzdXJlQ2hhcklubmVyKGNtLCBwcmVwYXJlZCwgY2gsIGJpYXMpIHtcbiAgdmFyIHBsYWNlID0gbm9kZUFuZE9mZnNldEluTGluZU1hcChwcmVwYXJlZC5tYXAsIGNoLCBiaWFzKTtcbiAgdmFyIG5vZGUgPSBwbGFjZS5ub2RlLCBzdGFydCA9IHBsYWNlLnN0YXJ0LCBlbmQgPSBwbGFjZS5lbmQsIGNvbGxhcHNlID0gcGxhY2UuY29sbGFwc2U7XG5cbiAgdmFyIHJlY3Q7XG4gIGlmIChub2RlLm5vZGVUeXBlID09IDMpIHsgLy8gSWYgaXQgaXMgYSB0ZXh0IG5vZGUsIHVzZSBhIHJhbmdlIHRvIHJldHJpZXZlIHRoZSBjb29yZGluYXRlcy5cbiAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCA0OyBpJDErKykgeyAvLyBSZXRyeSBhIG1heGltdW0gb2YgNCB0aW1lcyB3aGVuIG5vbnNlbnNlIHJlY3RhbmdsZXMgYXJlIHJldHVybmVkXG4gICAgICB3aGlsZSAoc3RhcnQgJiYgaXNFeHRlbmRpbmdDaGFyKHByZXBhcmVkLmxpbmUudGV4dC5jaGFyQXQocGxhY2UuY292ZXJTdGFydCArIHN0YXJ0KSkpIHsgLS1zdGFydDsgfVxuICAgICAgd2hpbGUgKHBsYWNlLmNvdmVyU3RhcnQgKyBlbmQgPCBwbGFjZS5jb3ZlckVuZCAmJiBpc0V4dGVuZGluZ0NoYXIocHJlcGFyZWQubGluZS50ZXh0LmNoYXJBdChwbGFjZS5jb3ZlclN0YXJ0ICsgZW5kKSkpIHsgKytlbmQ7IH1cbiAgICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgOSAmJiBzdGFydCA9PSAwICYmIGVuZCA9PSBwbGFjZS5jb3ZlckVuZCAtIHBsYWNlLmNvdmVyU3RhcnQpXG4gICAgICAgIHsgcmVjdCA9IG5vZGUucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTsgfVxuICAgICAgZWxzZVxuICAgICAgICB7IHJlY3QgPSBnZXRVc2VmdWxSZWN0KHJhbmdlKG5vZGUsIHN0YXJ0LCBlbmQpLmdldENsaWVudFJlY3RzKCksIGJpYXMpOyB9XG4gICAgICBpZiAocmVjdC5sZWZ0IHx8IHJlY3QucmlnaHQgfHwgc3RhcnQgPT0gMCkgeyBicmVhayB9XG4gICAgICBlbmQgPSBzdGFydDtcbiAgICAgIHN0YXJ0ID0gc3RhcnQgLSAxO1xuICAgICAgY29sbGFwc2UgPSBcInJpZ2h0XCI7XG4gICAgfVxuICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgMTEpIHsgcmVjdCA9IG1heWJlVXBkYXRlUmVjdEZvclpvb21pbmcoY20uZGlzcGxheS5tZWFzdXJlLCByZWN0KTsgfVxuICB9IGVsc2UgeyAvLyBJZiBpdCBpcyBhIHdpZGdldCwgc2ltcGx5IGdldCB0aGUgYm94IGZvciB0aGUgd2hvbGUgd2lkZ2V0LlxuICAgIGlmIChzdGFydCA+IDApIHsgY29sbGFwc2UgPSBiaWFzID0gXCJyaWdodFwiOyB9XG4gICAgdmFyIHJlY3RzO1xuICAgIGlmIChjbS5vcHRpb25zLmxpbmVXcmFwcGluZyAmJiAocmVjdHMgPSBub2RlLmdldENsaWVudFJlY3RzKCkpLmxlbmd0aCA+IDEpXG4gICAgICB7IHJlY3QgPSByZWN0c1tiaWFzID09IFwicmlnaHRcIiA/IHJlY3RzLmxlbmd0aCAtIDEgOiAwXTsgfVxuICAgIGVsc2VcbiAgICAgIHsgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7IH1cbiAgfVxuICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDkgJiYgIXN0YXJ0ICYmICghcmVjdCB8fCAhcmVjdC5sZWZ0ICYmICFyZWN0LnJpZ2h0KSkge1xuICAgIHZhciByU3BhbiA9IG5vZGUucGFyZW50Tm9kZS5nZXRDbGllbnRSZWN0cygpWzBdO1xuICAgIGlmIChyU3BhbilcbiAgICAgIHsgcmVjdCA9IHtsZWZ0OiByU3Bhbi5sZWZ0LCByaWdodDogclNwYW4ubGVmdCArIGNoYXJXaWR0aChjbS5kaXNwbGF5KSwgdG9wOiByU3Bhbi50b3AsIGJvdHRvbTogclNwYW4uYm90dG9tfTsgfVxuICAgIGVsc2VcbiAgICAgIHsgcmVjdCA9IG51bGxSZWN0OyB9XG4gIH1cblxuICB2YXIgcnRvcCA9IHJlY3QudG9wIC0gcHJlcGFyZWQucmVjdC50b3AsIHJib3QgPSByZWN0LmJvdHRvbSAtIHByZXBhcmVkLnJlY3QudG9wO1xuICB2YXIgbWlkID0gKHJ0b3AgKyByYm90KSAvIDI7XG4gIHZhciBoZWlnaHRzID0gcHJlcGFyZWQudmlldy5tZWFzdXJlLmhlaWdodHM7XG4gIHZhciBpID0gMDtcbiAgZm9yICg7IGkgPCBoZWlnaHRzLmxlbmd0aCAtIDE7IGkrKylcbiAgICB7IGlmIChtaWQgPCBoZWlnaHRzW2ldKSB7IGJyZWFrIH0gfVxuICB2YXIgdG9wID0gaSA/IGhlaWdodHNbaSAtIDFdIDogMCwgYm90ID0gaGVpZ2h0c1tpXTtcbiAgdmFyIHJlc3VsdCA9IHtsZWZ0OiAoY29sbGFwc2UgPT0gXCJyaWdodFwiID8gcmVjdC5yaWdodCA6IHJlY3QubGVmdCkgLSBwcmVwYXJlZC5yZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IChjb2xsYXBzZSA9PSBcImxlZnRcIiA/IHJlY3QubGVmdCA6IHJlY3QucmlnaHQpIC0gcHJlcGFyZWQucmVjdC5sZWZ0LFxuICAgICAgICAgICAgICAgIHRvcDogdG9wLCBib3R0b206IGJvdH07XG4gIGlmICghcmVjdC5sZWZ0ICYmICFyZWN0LnJpZ2h0KSB7IHJlc3VsdC5ib2d1cyA9IHRydWU7IH1cbiAgaWYgKCFjbS5vcHRpb25zLnNpbmdsZUN1cnNvckhlaWdodFBlckxpbmUpIHsgcmVzdWx0LnJ0b3AgPSBydG9wOyByZXN1bHQucmJvdHRvbSA9IHJib3Q7IH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIFdvcmsgYXJvdW5kIHByb2JsZW0gd2l0aCBib3VuZGluZyBjbGllbnQgcmVjdHMgb24gcmFuZ2VzIGJlaW5nXG4vLyByZXR1cm5lZCBpbmNvcnJlY3RseSB3aGVuIHpvb21lZCBvbiBJRTEwIGFuZCBiZWxvdy5cbmZ1bmN0aW9uIG1heWJlVXBkYXRlUmVjdEZvclpvb21pbmcobWVhc3VyZSwgcmVjdCkge1xuICBpZiAoIXdpbmRvdy5zY3JlZW4gfHwgc2NyZWVuLmxvZ2ljYWxYRFBJID09IG51bGwgfHxcbiAgICAgIHNjcmVlbi5sb2dpY2FsWERQSSA9PSBzY3JlZW4uZGV2aWNlWERQSSB8fCAhaGFzQmFkWm9vbWVkUmVjdHMobWVhc3VyZSkpXG4gICAgeyByZXR1cm4gcmVjdCB9XG4gIHZhciBzY2FsZVggPSBzY3JlZW4ubG9naWNhbFhEUEkgLyBzY3JlZW4uZGV2aWNlWERQSTtcbiAgdmFyIHNjYWxlWSA9IHNjcmVlbi5sb2dpY2FsWURQSSAvIHNjcmVlbi5kZXZpY2VZRFBJO1xuICByZXR1cm4ge2xlZnQ6IHJlY3QubGVmdCAqIHNjYWxlWCwgcmlnaHQ6IHJlY3QucmlnaHQgKiBzY2FsZVgsXG4gICAgICAgICAgdG9wOiByZWN0LnRvcCAqIHNjYWxlWSwgYm90dG9tOiByZWN0LmJvdHRvbSAqIHNjYWxlWX1cbn1cblxuZnVuY3Rpb24gY2xlYXJMaW5lTWVhc3VyZW1lbnRDYWNoZUZvcihsaW5lVmlldykge1xuICBpZiAobGluZVZpZXcubWVhc3VyZSkge1xuICAgIGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGUgPSB7fTtcbiAgICBsaW5lVmlldy5tZWFzdXJlLmhlaWdodHMgPSBudWxsO1xuICAgIGlmIChsaW5lVmlldy5yZXN0KSB7IGZvciAodmFyIGkgPSAwOyBpIDwgbGluZVZpZXcucmVzdC5sZW5ndGg7IGkrKylcbiAgICAgIHsgbGluZVZpZXcubWVhc3VyZS5jYWNoZXNbaV0gPSB7fTsgfSB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJMaW5lTWVhc3VyZW1lbnRDYWNoZShjbSkge1xuICBjbS5kaXNwbGF5LmV4dGVybmFsTWVhc3VyZSA9IG51bGw7XG4gIHJlbW92ZUNoaWxkcmVuKGNtLmRpc3BsYXkubGluZU1lYXN1cmUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNtLmRpc3BsYXkudmlldy5sZW5ndGg7IGkrKylcbiAgICB7IGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGVGb3IoY20uZGlzcGxheS52aWV3W2ldKTsgfVxufVxuXG5mdW5jdGlvbiBjbGVhckNhY2hlcyhjbSkge1xuICBjbGVhckxpbmVNZWFzdXJlbWVudENhY2hlKGNtKTtcbiAgY20uZGlzcGxheS5jYWNoZWRDaGFyV2lkdGggPSBjbS5kaXNwbGF5LmNhY2hlZFRleHRIZWlnaHQgPSBjbS5kaXNwbGF5LmNhY2hlZFBhZGRpbmdIID0gbnVsbDtcbiAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykgeyBjbS5kaXNwbGF5Lm1heExpbmVDaGFuZ2VkID0gdHJ1ZTsgfVxuICBjbS5kaXNwbGF5LmxpbmVOdW1DaGFycyA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIHBhZ2VTY3JvbGxYKCkge1xuICAvLyBXb3JrIGFyb3VuZCBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD00ODkyMDZcbiAgLy8gd2hpY2ggY2F1c2VzIHBhZ2VfT2Zmc2V0IGFuZCBib3VuZGluZyBjbGllbnQgcmVjdHMgdG8gdXNlXG4gIC8vIGRpZmZlcmVudCByZWZlcmVuY2Ugdmlld3BvcnRzIGFuZCBpbnZhbGlkYXRlIG91ciBjYWxjdWxhdGlvbnMuXG4gIGlmIChjaHJvbWUgJiYgYW5kcm9pZCkgeyByZXR1cm4gLShkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgLSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLm1hcmdpbkxlZnQpKSB9XG4gIHJldHVybiB3aW5kb3cucGFnZVhPZmZzZXQgfHwgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5KS5zY3JvbGxMZWZ0XG59XG5mdW5jdGlvbiBwYWdlU2Nyb2xsWSgpIHtcbiAgaWYgKGNocm9tZSAmJiBhbmRyb2lkKSB7IHJldHVybiAtKGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5tYXJnaW5Ub3ApKSB9XG4gIHJldHVybiB3aW5kb3cucGFnZVlPZmZzZXQgfHwgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5KS5zY3JvbGxUb3Bcbn1cblxuLy8gQ29udmVydHMgYSB7dG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0fSBib3ggZnJvbSBsaW5lLWxvY2FsXG4vLyBjb29yZGluYXRlcyBpbnRvIGFub3RoZXIgY29vcmRpbmF0ZSBzeXN0ZW0uIENvbnRleHQgbWF5IGJlIG9uZSBvZlxuLy8gXCJsaW5lXCIsIFwiZGl2XCIgKGRpc3BsYXkubGluZURpdiksIFwibG9jYWxcIi4vbnVsbCAoZWRpdG9yKSwgXCJ3aW5kb3dcIixcbi8vIG9yIFwicGFnZVwiLlxuZnVuY3Rpb24gaW50b0Nvb3JkU3lzdGVtKGNtLCBsaW5lT2JqLCByZWN0LCBjb250ZXh0LCBpbmNsdWRlV2lkZ2V0cykge1xuICBpZiAoIWluY2x1ZGVXaWRnZXRzICYmIGxpbmVPYmoud2lkZ2V0cykgeyBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVPYmoud2lkZ2V0cy5sZW5ndGg7ICsraSkgeyBpZiAobGluZU9iai53aWRnZXRzW2ldLmFib3ZlKSB7XG4gICAgdmFyIHNpemUgPSB3aWRnZXRIZWlnaHQobGluZU9iai53aWRnZXRzW2ldKTtcbiAgICByZWN0LnRvcCArPSBzaXplOyByZWN0LmJvdHRvbSArPSBzaXplO1xuICB9IH0gfVxuICBpZiAoY29udGV4dCA9PSBcImxpbmVcIikgeyByZXR1cm4gcmVjdCB9XG4gIGlmICghY29udGV4dCkgeyBjb250ZXh0ID0gXCJsb2NhbFwiOyB9XG4gIHZhciB5T2ZmID0gaGVpZ2h0QXRMaW5lKGxpbmVPYmopO1xuICBpZiAoY29udGV4dCA9PSBcImxvY2FsXCIpIHsgeU9mZiArPSBwYWRkaW5nVG9wKGNtLmRpc3BsYXkpOyB9XG4gIGVsc2UgeyB5T2ZmIC09IGNtLmRpc3BsYXkudmlld09mZnNldDsgfVxuICBpZiAoY29udGV4dCA9PSBcInBhZ2VcIiB8fCBjb250ZXh0ID09IFwid2luZG93XCIpIHtcbiAgICB2YXIgbE9mZiA9IGNtLmRpc3BsYXkubGluZVNwYWNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHlPZmYgKz0gbE9mZi50b3AgKyAoY29udGV4dCA9PSBcIndpbmRvd1wiID8gMCA6IHBhZ2VTY3JvbGxZKCkpO1xuICAgIHZhciB4T2ZmID0gbE9mZi5sZWZ0ICsgKGNvbnRleHQgPT0gXCJ3aW5kb3dcIiA/IDAgOiBwYWdlU2Nyb2xsWCgpKTtcbiAgICByZWN0LmxlZnQgKz0geE9mZjsgcmVjdC5yaWdodCArPSB4T2ZmO1xuICB9XG4gIHJlY3QudG9wICs9IHlPZmY7IHJlY3QuYm90dG9tICs9IHlPZmY7XG4gIHJldHVybiByZWN0XG59XG5cbi8vIENvdmVydHMgYSBib3ggZnJvbSBcImRpdlwiIGNvb3JkcyB0byBhbm90aGVyIGNvb3JkaW5hdGUgc3lzdGVtLlxuLy8gQ29udGV4dCBtYXkgYmUgXCJ3aW5kb3dcIiwgXCJwYWdlXCIsIFwiZGl2XCIsIG9yIFwibG9jYWxcIi4vbnVsbC5cbmZ1bmN0aW9uIGZyb21Db29yZFN5c3RlbShjbSwgY29vcmRzLCBjb250ZXh0KSB7XG4gIGlmIChjb250ZXh0ID09IFwiZGl2XCIpIHsgcmV0dXJuIGNvb3JkcyB9XG4gIHZhciBsZWZ0ID0gY29vcmRzLmxlZnQsIHRvcCA9IGNvb3Jkcy50b3A7XG4gIC8vIEZpcnN0IG1vdmUgaW50byBcInBhZ2VcIiBjb29yZGluYXRlIHN5c3RlbVxuICBpZiAoY29udGV4dCA9PSBcInBhZ2VcIikge1xuICAgIGxlZnQgLT0gcGFnZVNjcm9sbFgoKTtcbiAgICB0b3AgLT0gcGFnZVNjcm9sbFkoKTtcbiAgfSBlbHNlIGlmIChjb250ZXh0ID09IFwibG9jYWxcIiB8fCAhY29udGV4dCkge1xuICAgIHZhciBsb2NhbEJveCA9IGNtLmRpc3BsYXkuc2l6ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbGVmdCArPSBsb2NhbEJveC5sZWZ0O1xuICAgIHRvcCArPSBsb2NhbEJveC50b3A7XG4gIH1cblxuICB2YXIgbGluZVNwYWNlQm94ID0gY20uZGlzcGxheS5saW5lU3BhY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7bGVmdDogbGVmdCAtIGxpbmVTcGFjZUJveC5sZWZ0LCB0b3A6IHRvcCAtIGxpbmVTcGFjZUJveC50b3B9XG59XG5cbmZ1bmN0aW9uIGNoYXJDb29yZHMoY20sIHBvcywgY29udGV4dCwgbGluZU9iaiwgYmlhcykge1xuICBpZiAoIWxpbmVPYmopIHsgbGluZU9iaiA9IGdldExpbmUoY20uZG9jLCBwb3MubGluZSk7IH1cbiAgcmV0dXJuIGludG9Db29yZFN5c3RlbShjbSwgbGluZU9iaiwgbWVhc3VyZUNoYXIoY20sIGxpbmVPYmosIHBvcy5jaCwgYmlhcyksIGNvbnRleHQpXG59XG5cbi8vIFJldHVybnMgYSBib3ggZm9yIGEgZ2l2ZW4gY3Vyc29yIHBvc2l0aW9uLCB3aGljaCBtYXkgaGF2ZSBhblxuLy8gJ290aGVyJyBwcm9wZXJ0eSBjb250YWluaW5nIHRoZSBwb3NpdGlvbiBvZiB0aGUgc2Vjb25kYXJ5IGN1cnNvclxuLy8gb24gYSBiaWRpIGJvdW5kYXJ5LlxuLy8gQSBjdXJzb3IgUG9zKGxpbmUsIGNoYXIsIFwiYmVmb3JlXCIpIGlzIG9uIHRoZSBzYW1lIHZpc3VhbCBsaW5lIGFzIGBjaGFyIC0gMWBcbi8vIGFuZCBhZnRlciBgY2hhciAtIDFgIGluIHdyaXRpbmcgb3JkZXIgb2YgYGNoYXIgLSAxYFxuLy8gQSBjdXJzb3IgUG9zKGxpbmUsIGNoYXIsIFwiYWZ0ZXJcIikgaXMgb24gdGhlIHNhbWUgdmlzdWFsIGxpbmUgYXMgYGNoYXJgXG4vLyBhbmQgYmVmb3JlIGBjaGFyYCBpbiB3cml0aW5nIG9yZGVyIG9mIGBjaGFyYFxuLy8gRXhhbXBsZXMgKHVwcGVyLWNhc2UgbGV0dGVycyBhcmUgUlRMLCBsb3dlci1jYXNlIGFyZSBMVFIpOlxuLy8gICAgIFBvcygwLCAxLCAuLi4pXG4vLyAgICAgYmVmb3JlICAgYWZ0ZXJcbi8vIGFiICAgICBhfGIgICAgIGF8YlxuLy8gYUIgICAgIGF8QiAgICAgYUJ8XG4vLyBBYiAgICAgfEFiICAgICBBfGJcbi8vIEFCICAgICBCfEEgICAgIEJ8QVxuLy8gRXZlcnkgcG9zaXRpb24gYWZ0ZXIgdGhlIGxhc3QgY2hhcmFjdGVyIG9uIGEgbGluZSBpcyBjb25zaWRlcmVkIHRvIHN0aWNrXG4vLyB0byB0aGUgbGFzdCBjaGFyYWN0ZXIgb24gdGhlIGxpbmUuXG5mdW5jdGlvbiBjdXJzb3JDb29yZHMoY20sIHBvcywgY29udGV4dCwgbGluZU9iaiwgcHJlcGFyZWRNZWFzdXJlLCB2YXJIZWlnaHQpIHtcbiAgbGluZU9iaiA9IGxpbmVPYmogfHwgZ2V0TGluZShjbS5kb2MsIHBvcy5saW5lKTtcbiAgaWYgKCFwcmVwYXJlZE1lYXN1cmUpIHsgcHJlcGFyZWRNZWFzdXJlID0gcHJlcGFyZU1lYXN1cmVGb3JMaW5lKGNtLCBsaW5lT2JqKTsgfVxuICBmdW5jdGlvbiBnZXQoY2gsIHJpZ2h0KSB7XG4gICAgdmFyIG0gPSBtZWFzdXJlQ2hhclByZXBhcmVkKGNtLCBwcmVwYXJlZE1lYXN1cmUsIGNoLCByaWdodCA/IFwicmlnaHRcIiA6IFwibGVmdFwiLCB2YXJIZWlnaHQpO1xuICAgIGlmIChyaWdodCkgeyBtLmxlZnQgPSBtLnJpZ2h0OyB9IGVsc2UgeyBtLnJpZ2h0ID0gbS5sZWZ0OyB9XG4gICAgcmV0dXJuIGludG9Db29yZFN5c3RlbShjbSwgbGluZU9iaiwgbSwgY29udGV4dClcbiAgfVxuICB2YXIgb3JkZXIgPSBnZXRPcmRlcihsaW5lT2JqLCBjbS5kb2MuZGlyZWN0aW9uKSwgY2ggPSBwb3MuY2gsIHN0aWNreSA9IHBvcy5zdGlja3k7XG4gIGlmIChjaCA+PSBsaW5lT2JqLnRleHQubGVuZ3RoKSB7XG4gICAgY2ggPSBsaW5lT2JqLnRleHQubGVuZ3RoO1xuICAgIHN0aWNreSA9IFwiYmVmb3JlXCI7XG4gIH0gZWxzZSBpZiAoY2ggPD0gMCkge1xuICAgIGNoID0gMDtcbiAgICBzdGlja3kgPSBcImFmdGVyXCI7XG4gIH1cbiAgaWYgKCFvcmRlcikgeyByZXR1cm4gZ2V0KHN0aWNreSA9PSBcImJlZm9yZVwiID8gY2ggLSAxIDogY2gsIHN0aWNreSA9PSBcImJlZm9yZVwiKSB9XG5cbiAgZnVuY3Rpb24gZ2V0QmlkaShjaCwgcGFydFBvcywgaW52ZXJ0KSB7XG4gICAgdmFyIHBhcnQgPSBvcmRlcltwYXJ0UG9zXSwgcmlnaHQgPSAocGFydC5sZXZlbCAlIDIpICE9IDA7XG4gICAgcmV0dXJuIGdldChpbnZlcnQgPyBjaCAtIDEgOiBjaCwgcmlnaHQgIT0gaW52ZXJ0KVxuICB9XG4gIHZhciBwYXJ0UG9zID0gZ2V0QmlkaVBhcnRBdChvcmRlciwgY2gsIHN0aWNreSk7XG4gIHZhciBvdGhlciA9IGJpZGlPdGhlcjtcbiAgdmFyIHZhbCA9IGdldEJpZGkoY2gsIHBhcnRQb3MsIHN0aWNreSA9PSBcImJlZm9yZVwiKTtcbiAgaWYgKG90aGVyICE9IG51bGwpIHsgdmFsLm90aGVyID0gZ2V0QmlkaShjaCwgb3RoZXIsIHN0aWNreSAhPSBcImJlZm9yZVwiKTsgfVxuICByZXR1cm4gdmFsXG59XG5cbi8vIFVzZWQgdG8gY2hlYXBseSBlc3RpbWF0ZSB0aGUgY29vcmRpbmF0ZXMgZm9yIGEgcG9zaXRpb24uIFVzZWQgZm9yXG4vLyBpbnRlcm1lZGlhdGUgc2Nyb2xsIHVwZGF0ZXMuXG5mdW5jdGlvbiBlc3RpbWF0ZUNvb3JkcyhjbSwgcG9zKSB7XG4gIHZhciBsZWZ0ID0gMDtcbiAgcG9zID0gY2xpcFBvcyhjbS5kb2MsIHBvcyk7XG4gIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHsgbGVmdCA9IGNoYXJXaWR0aChjbS5kaXNwbGF5KSAqIHBvcy5jaDsgfVxuICB2YXIgbGluZU9iaiA9IGdldExpbmUoY20uZG9jLCBwb3MubGluZSk7XG4gIHZhciB0b3AgPSBoZWlnaHRBdExpbmUobGluZU9iaikgKyBwYWRkaW5nVG9wKGNtLmRpc3BsYXkpO1xuICByZXR1cm4ge2xlZnQ6IGxlZnQsIHJpZ2h0OiBsZWZ0LCB0b3A6IHRvcCwgYm90dG9tOiB0b3AgKyBsaW5lT2JqLmhlaWdodH1cbn1cblxuLy8gUG9zaXRpb25zIHJldHVybmVkIGJ5IGNvb3Jkc0NoYXIgY29udGFpbiBzb21lIGV4dHJhIGluZm9ybWF0aW9uLlxuLy8geFJlbCBpcyB0aGUgcmVsYXRpdmUgeCBwb3NpdGlvbiBvZiB0aGUgaW5wdXQgY29vcmRpbmF0ZXMgY29tcGFyZWRcbi8vIHRvIHRoZSBmb3VuZCBwb3NpdGlvbiAoc28geFJlbCA+IDAgbWVhbnMgdGhlIGNvb3JkaW5hdGVzIGFyZSB0b1xuLy8gdGhlIHJpZ2h0IG9mIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24sIGZvciBleGFtcGxlKS4gV2hlbiBvdXRzaWRlXG4vLyBpcyB0cnVlLCB0aGF0IG1lYW5zIHRoZSBjb29yZGluYXRlcyBsaWUgb3V0c2lkZSB0aGUgbGluZSdzXG4vLyB2ZXJ0aWNhbCByYW5nZS5cbmZ1bmN0aW9uIFBvc1dpdGhJbmZvKGxpbmUsIGNoLCBzdGlja3ksIG91dHNpZGUsIHhSZWwpIHtcbiAgdmFyIHBvcyA9IFBvcyhsaW5lLCBjaCwgc3RpY2t5KTtcbiAgcG9zLnhSZWwgPSB4UmVsO1xuICBpZiAob3V0c2lkZSkgeyBwb3Mub3V0c2lkZSA9IHRydWU7IH1cbiAgcmV0dXJuIHBvc1xufVxuXG4vLyBDb21wdXRlIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gY2xvc2VzdCB0byB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMuXG4vLyBJbnB1dCBtdXN0IGJlIGxpbmVTcGFjZS1sb2NhbCAoXCJkaXZcIiBjb29yZGluYXRlIHN5c3RlbSkuXG5mdW5jdGlvbiBjb29yZHNDaGFyKGNtLCB4LCB5KSB7XG4gIHZhciBkb2MgPSBjbS5kb2M7XG4gIHkgKz0gY20uZGlzcGxheS52aWV3T2Zmc2V0O1xuICBpZiAoeSA8IDApIHsgcmV0dXJuIFBvc1dpdGhJbmZvKGRvYy5maXJzdCwgMCwgbnVsbCwgdHJ1ZSwgLTEpIH1cbiAgdmFyIGxpbmVOID0gbGluZUF0SGVpZ2h0KGRvYywgeSksIGxhc3QgPSBkb2MuZmlyc3QgKyBkb2Muc2l6ZSAtIDE7XG4gIGlmIChsaW5lTiA+IGxhc3QpXG4gICAgeyByZXR1cm4gUG9zV2l0aEluZm8oZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxLCBnZXRMaW5lKGRvYywgbGFzdCkudGV4dC5sZW5ndGgsIG51bGwsIHRydWUsIDEpIH1cbiAgaWYgKHggPCAwKSB7IHggPSAwOyB9XG5cbiAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKGRvYywgbGluZU4pO1xuICBmb3IgKDs7KSB7XG4gICAgdmFyIGZvdW5kID0gY29vcmRzQ2hhcklubmVyKGNtLCBsaW5lT2JqLCBsaW5lTiwgeCwgeSk7XG4gICAgdmFyIG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lT2JqKTtcbiAgICB2YXIgbWVyZ2VkUG9zID0gbWVyZ2VkICYmIG1lcmdlZC5maW5kKDAsIHRydWUpO1xuICAgIGlmIChtZXJnZWQgJiYgKGZvdW5kLmNoID4gbWVyZ2VkUG9zLmZyb20uY2ggfHwgZm91bmQuY2ggPT0gbWVyZ2VkUG9zLmZyb20uY2ggJiYgZm91bmQueFJlbCA+IDApKVxuICAgICAgeyBsaW5lTiA9IGxpbmVObyhsaW5lT2JqID0gbWVyZ2VkUG9zLnRvLmxpbmUpOyB9XG4gICAgZWxzZVxuICAgICAgeyByZXR1cm4gZm91bmQgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBwZWRMaW5lRXh0ZW50KGNtLCBsaW5lT2JqLCBwcmVwYXJlZE1lYXN1cmUsIHkpIHtcbiAgdmFyIG1lYXN1cmUgPSBmdW5jdGlvbiAoY2gpIHsgcmV0dXJuIGludG9Db29yZFN5c3RlbShjbSwgbGluZU9iaiwgbWVhc3VyZUNoYXJQcmVwYXJlZChjbSwgcHJlcGFyZWRNZWFzdXJlLCBjaCksIFwibGluZVwiKTsgfTtcbiAgdmFyIGVuZCA9IGxpbmVPYmoudGV4dC5sZW5ndGg7XG4gIHZhciBiZWdpbiA9IGZpbmRGaXJzdChmdW5jdGlvbiAoY2gpIHsgcmV0dXJuIG1lYXN1cmUoY2ggLSAxKS5ib3R0b20gPD0geTsgfSwgZW5kLCAwKTtcbiAgZW5kID0gZmluZEZpcnN0KGZ1bmN0aW9uIChjaCkgeyByZXR1cm4gbWVhc3VyZShjaCkudG9wID4geTsgfSwgYmVnaW4sIGVuZCk7XG4gIHJldHVybiB7YmVnaW46IGJlZ2luLCBlbmQ6IGVuZH1cbn1cblxuZnVuY3Rpb24gd3JhcHBlZExpbmVFeHRlbnRDaGFyKGNtLCBsaW5lT2JqLCBwcmVwYXJlZE1lYXN1cmUsIHRhcmdldCkge1xuICB2YXIgdGFyZ2V0VG9wID0gaW50b0Nvb3JkU3lzdGVtKGNtLCBsaW5lT2JqLCBtZWFzdXJlQ2hhclByZXBhcmVkKGNtLCBwcmVwYXJlZE1lYXN1cmUsIHRhcmdldCksIFwibGluZVwiKS50b3A7XG4gIHJldHVybiB3cmFwcGVkTGluZUV4dGVudChjbSwgbGluZU9iaiwgcHJlcGFyZWRNZWFzdXJlLCB0YXJnZXRUb3ApXG59XG5cbmZ1bmN0aW9uIGNvb3Jkc0NoYXJJbm5lcihjbSwgbGluZU9iaiwgbGluZU5vJCQxLCB4LCB5KSB7XG4gIHkgLT0gaGVpZ2h0QXRMaW5lKGxpbmVPYmopO1xuICB2YXIgYmVnaW4gPSAwLCBlbmQgPSBsaW5lT2JqLnRleHQubGVuZ3RoO1xuICB2YXIgcHJlcGFyZWRNZWFzdXJlID0gcHJlcGFyZU1lYXN1cmVGb3JMaW5lKGNtLCBsaW5lT2JqKTtcbiAgdmFyIHBvcztcbiAgdmFyIG9yZGVyID0gZ2V0T3JkZXIobGluZU9iaiwgY20uZG9jLmRpcmVjdGlvbik7XG4gIGlmIChvcmRlcikge1xuICAgIGlmIChjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgdmFyIGFzc2lnbjtcbiAgICAgICgoYXNzaWduID0gd3JhcHBlZExpbmVFeHRlbnQoY20sIGxpbmVPYmosIHByZXBhcmVkTWVhc3VyZSwgeSksIGJlZ2luID0gYXNzaWduLmJlZ2luLCBlbmQgPSBhc3NpZ24uZW5kLCBhc3NpZ24pKTtcbiAgICB9XG4gICAgcG9zID0gbmV3IFBvcyhsaW5lTm8kJDEsIGJlZ2luKTtcbiAgICB2YXIgYmVnaW5MZWZ0ID0gY3Vyc29yQ29vcmRzKGNtLCBwb3MsIFwibGluZVwiLCBsaW5lT2JqLCBwcmVwYXJlZE1lYXN1cmUpLmxlZnQ7XG4gICAgdmFyIGRpciA9IGJlZ2luTGVmdCA8IHggPyAxIDogLTE7XG4gICAgdmFyIHByZXZEaWZmLCBkaWZmID0gYmVnaW5MZWZ0IC0geCwgcHJldlBvcztcbiAgICBkbyB7XG4gICAgICBwcmV2RGlmZiA9IGRpZmY7XG4gICAgICBwcmV2UG9zID0gcG9zO1xuICAgICAgcG9zID0gbW92ZVZpc3VhbGx5KGNtLCBsaW5lT2JqLCBwb3MsIGRpcik7XG4gICAgICBpZiAocG9zID09IG51bGwgfHwgcG9zLmNoIDwgYmVnaW4gfHwgZW5kIDw9IChwb3Muc3RpY2t5ID09IFwiYmVmb3JlXCIgPyBwb3MuY2ggLSAxIDogcG9zLmNoKSkge1xuICAgICAgICBwb3MgPSBwcmV2UG9zO1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgZGlmZiA9IGN1cnNvckNvb3JkcyhjbSwgcG9zLCBcImxpbmVcIiwgbGluZU9iaiwgcHJlcGFyZWRNZWFzdXJlKS5sZWZ0IC0geDtcbiAgICB9IHdoaWxlICgoZGlyIDwgMCkgIT0gKGRpZmYgPCAwKSAmJiAoTWF0aC5hYnMoZGlmZikgPD0gTWF0aC5hYnMocHJldkRpZmYpKSlcbiAgICBpZiAoTWF0aC5hYnMoZGlmZikgPiBNYXRoLmFicyhwcmV2RGlmZikpIHtcbiAgICAgIGlmICgoZGlmZiA8IDApID09IChwcmV2RGlmZiA8IDApKSB7IHRocm93IG5ldyBFcnJvcihcIkJyb2tlIG91dCBvZiBpbmZpbml0ZSBsb29wIGluIGNvb3Jkc0NoYXJJbm5lclwiKSB9XG4gICAgICBwb3MgPSBwcmV2UG9zO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgY2ggPSBmaW5kRmlyc3QoZnVuY3Rpb24gKGNoKSB7XG4gICAgICB2YXIgYm94ID0gaW50b0Nvb3JkU3lzdGVtKGNtLCBsaW5lT2JqLCBtZWFzdXJlQ2hhclByZXBhcmVkKGNtLCBwcmVwYXJlZE1lYXN1cmUsIGNoKSwgXCJsaW5lXCIpO1xuICAgICAgaWYgKGJveC50b3AgPiB5KSB7XG4gICAgICAgIC8vIEZvciB0aGUgY3Vyc29yIHN0aWNraW5lc3NcbiAgICAgICAgZW5kID0gTWF0aC5taW4oY2gsIGVuZCk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChib3guYm90dG9tIDw9IHkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgIGVsc2UgaWYgKGJveC5sZWZ0ID4geCkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgICBlbHNlIGlmIChib3gucmlnaHQgPCB4KSB7IHJldHVybiBmYWxzZSB9XG4gICAgICBlbHNlIHsgcmV0dXJuICh4IC0gYm94LmxlZnQgPCBib3gucmlnaHQgLSB4KSB9XG4gICAgfSwgYmVnaW4sIGVuZCk7XG4gICAgY2ggPSBza2lwRXh0ZW5kaW5nQ2hhcnMobGluZU9iai50ZXh0LCBjaCwgMSk7XG4gICAgcG9zID0gbmV3IFBvcyhsaW5lTm8kJDEsIGNoLCBjaCA9PSBlbmQgPyBcImJlZm9yZVwiIDogXCJhZnRlclwiKTtcbiAgfVxuICB2YXIgY29vcmRzID0gY3Vyc29yQ29vcmRzKGNtLCBwb3MsIFwibGluZVwiLCBsaW5lT2JqLCBwcmVwYXJlZE1lYXN1cmUpO1xuICBpZiAoeSA8IGNvb3Jkcy50b3AgfHwgY29vcmRzLmJvdHRvbSA8IHkpIHsgcG9zLm91dHNpZGUgPSB0cnVlOyB9XG4gIHBvcy54UmVsID0geCA8IGNvb3Jkcy5sZWZ0ID8gLTEgOiAoeCA+IGNvb3Jkcy5yaWdodCA/IDEgOiAwKTtcbiAgcmV0dXJuIHBvc1xufVxuXG52YXIgbWVhc3VyZVRleHQ7XG4vLyBDb21wdXRlIHRoZSBkZWZhdWx0IHRleHQgaGVpZ2h0LlxuZnVuY3Rpb24gdGV4dEhlaWdodChkaXNwbGF5KSB7XG4gIGlmIChkaXNwbGF5LmNhY2hlZFRleHRIZWlnaHQgIT0gbnVsbCkgeyByZXR1cm4gZGlzcGxheS5jYWNoZWRUZXh0SGVpZ2h0IH1cbiAgaWYgKG1lYXN1cmVUZXh0ID09IG51bGwpIHtcbiAgICBtZWFzdXJlVGV4dCA9IGVsdChcInByZVwiKTtcbiAgICAvLyBNZWFzdXJlIGEgYnVuY2ggb2YgbGluZXMsIGZvciBicm93c2VycyB0aGF0IGNvbXB1dGVcbiAgICAvLyBmcmFjdGlvbmFsIGhlaWdodHMuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OTsgKytpKSB7XG4gICAgICBtZWFzdXJlVGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcInhcIikpO1xuICAgICAgbWVhc3VyZVRleHQuYXBwZW5kQ2hpbGQoZWx0KFwiYnJcIikpO1xuICAgIH1cbiAgICBtZWFzdXJlVGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcInhcIikpO1xuICB9XG4gIHJlbW92ZUNoaWxkcmVuQW5kQWRkKGRpc3BsYXkubWVhc3VyZSwgbWVhc3VyZVRleHQpO1xuICB2YXIgaGVpZ2h0ID0gbWVhc3VyZVRleHQub2Zmc2V0SGVpZ2h0IC8gNTA7XG4gIGlmIChoZWlnaHQgPiAzKSB7IGRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodCA9IGhlaWdodDsgfVxuICByZW1vdmVDaGlsZHJlbihkaXNwbGF5Lm1lYXN1cmUpO1xuICByZXR1cm4gaGVpZ2h0IHx8IDFcbn1cblxuLy8gQ29tcHV0ZSB0aGUgZGVmYXVsdCBjaGFyYWN0ZXIgd2lkdGguXG5mdW5jdGlvbiBjaGFyV2lkdGgoZGlzcGxheSkge1xuICBpZiAoZGlzcGxheS5jYWNoZWRDaGFyV2lkdGggIT0gbnVsbCkgeyByZXR1cm4gZGlzcGxheS5jYWNoZWRDaGFyV2lkdGggfVxuICB2YXIgYW5jaG9yID0gZWx0KFwic3BhblwiLCBcInh4eHh4eHh4eHhcIik7XG4gIHZhciBwcmUgPSBlbHQoXCJwcmVcIiwgW2FuY2hvcl0pO1xuICByZW1vdmVDaGlsZHJlbkFuZEFkZChkaXNwbGF5Lm1lYXN1cmUsIHByZSk7XG4gIHZhciByZWN0ID0gYW5jaG9yLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB3aWR0aCA9IChyZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0KSAvIDEwO1xuICBpZiAod2lkdGggPiAyKSB7IGRpc3BsYXkuY2FjaGVkQ2hhcldpZHRoID0gd2lkdGg7IH1cbiAgcmV0dXJuIHdpZHRoIHx8IDEwXG59XG5cbi8vIERvIGEgYnVsay1yZWFkIG9mIHRoZSBET00gcG9zaXRpb25zIGFuZCBzaXplcyBuZWVkZWQgdG8gZHJhdyB0aGVcbi8vIHZpZXcsIHNvIHRoYXQgd2UgZG9uJ3QgaW50ZXJsZWF2ZSByZWFkaW5nIGFuZCB3cml0aW5nIHRvIHRoZSBET00uXG5mdW5jdGlvbiBnZXREaW1lbnNpb25zKGNtKSB7XG4gIHZhciBkID0gY20uZGlzcGxheSwgbGVmdCA9IHt9LCB3aWR0aCA9IHt9O1xuICB2YXIgZ3V0dGVyTGVmdCA9IGQuZ3V0dGVycy5jbGllbnRMZWZ0O1xuICBmb3IgKHZhciBuID0gZC5ndXR0ZXJzLmZpcnN0Q2hpbGQsIGkgPSAwOyBuOyBuID0gbi5uZXh0U2libGluZywgKytpKSB7XG4gICAgbGVmdFtjbS5vcHRpb25zLmd1dHRlcnNbaV1dID0gbi5vZmZzZXRMZWZ0ICsgbi5jbGllbnRMZWZ0ICsgZ3V0dGVyTGVmdDtcbiAgICB3aWR0aFtjbS5vcHRpb25zLmd1dHRlcnNbaV1dID0gbi5jbGllbnRXaWR0aDtcbiAgfVxuICByZXR1cm4ge2ZpeGVkUG9zOiBjb21wZW5zYXRlRm9ySFNjcm9sbChkKSxcbiAgICAgICAgICBndXR0ZXJUb3RhbFdpZHRoOiBkLmd1dHRlcnMub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgZ3V0dGVyTGVmdDogbGVmdCxcbiAgICAgICAgICBndXR0ZXJXaWR0aDogd2lkdGgsXG4gICAgICAgICAgd3JhcHBlcldpZHRoOiBkLndyYXBwZXIuY2xpZW50V2lkdGh9XG59XG5cbi8vIENvbXB1dGVzIGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCArIGRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aCxcbi8vIGJ1dCB1c2luZyBnZXRCb3VuZGluZ0NsaWVudFJlY3QgdG8gZ2V0IGEgc3ViLXBpeGVsLWFjY3VyYXRlXG4vLyByZXN1bHQuXG5mdW5jdGlvbiBjb21wZW5zYXRlRm9ySFNjcm9sbChkaXNwbGF5KSB7XG4gIHJldHVybiBkaXNwbGF5LnNjcm9sbGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgLSBkaXNwbGF5LnNpemVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnRcbn1cblxuLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgZXN0aW1hdGVzIHRoZSBoZWlnaHQgb2YgYSBsaW5lLCB0byB1c2UgYXNcbi8vIGZpcnN0IGFwcHJveGltYXRpb24gdW50aWwgdGhlIGxpbmUgYmVjb21lcyB2aXNpYmxlIChhbmQgaXMgdGh1c1xuLy8gcHJvcGVybHkgbWVhc3VyYWJsZSkuXG5mdW5jdGlvbiBlc3RpbWF0ZUhlaWdodChjbSkge1xuICB2YXIgdGggPSB0ZXh0SGVpZ2h0KGNtLmRpc3BsYXkpLCB3cmFwcGluZyA9IGNtLm9wdGlvbnMubGluZVdyYXBwaW5nO1xuICB2YXIgcGVyTGluZSA9IHdyYXBwaW5nICYmIE1hdGgubWF4KDUsIGNtLmRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGggLyBjaGFyV2lkdGgoY20uZGlzcGxheSkgLSAzKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgaWYgKGxpbmVJc0hpZGRlbihjbS5kb2MsIGxpbmUpKSB7IHJldHVybiAwIH1cblxuICAgIHZhciB3aWRnZXRzSGVpZ2h0ID0gMDtcbiAgICBpZiAobGluZS53aWRnZXRzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGluZS53aWRnZXRzW2ldLmhlaWdodCkgeyB3aWRnZXRzSGVpZ2h0ICs9IGxpbmUud2lkZ2V0c1tpXS5oZWlnaHQ7IH1cbiAgICB9IH1cblxuICAgIGlmICh3cmFwcGluZylcbiAgICAgIHsgcmV0dXJuIHdpZGdldHNIZWlnaHQgKyAoTWF0aC5jZWlsKGxpbmUudGV4dC5sZW5ndGggLyBwZXJMaW5lKSB8fCAxKSAqIHRoIH1cbiAgICBlbHNlXG4gICAgICB7IHJldHVybiB3aWRnZXRzSGVpZ2h0ICsgdGggfVxuICB9XG59XG5cbmZ1bmN0aW9uIGVzdGltYXRlTGluZUhlaWdodHMoY20pIHtcbiAgdmFyIGRvYyA9IGNtLmRvYywgZXN0ID0gZXN0aW1hdGVIZWlnaHQoY20pO1xuICBkb2MuaXRlcihmdW5jdGlvbiAobGluZSkge1xuICAgIHZhciBlc3RIZWlnaHQgPSBlc3QobGluZSk7XG4gICAgaWYgKGVzdEhlaWdodCAhPSBsaW5lLmhlaWdodCkgeyB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIGVzdEhlaWdodCk7IH1cbiAgfSk7XG59XG5cbi8vIEdpdmVuIGEgbW91c2UgZXZlbnQsIGZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgcG9zaXRpb24uIElmIGxpYmVyYWxcbi8vIGlzIGZhbHNlLCBpdCBjaGVja3Mgd2hldGhlciBhIGd1dHRlciBvciBzY3JvbGxiYXIgd2FzIGNsaWNrZWQsXG4vLyBhbmQgcmV0dXJucyBudWxsIGlmIGl0IHdhcy4gZm9yUmVjdCBpcyB1c2VkIGJ5IHJlY3Rhbmd1bGFyXG4vLyBzZWxlY3Rpb25zLCBhbmQgdHJpZXMgdG8gZXN0aW1hdGUgYSBjaGFyYWN0ZXIgcG9zaXRpb24gZXZlbiBmb3Jcbi8vIGNvb3JkaW5hdGVzIGJleW9uZCB0aGUgcmlnaHQgb2YgdGhlIHRleHQuXG5mdW5jdGlvbiBwb3NGcm9tTW91c2UoY20sIGUsIGxpYmVyYWwsIGZvclJlY3QpIHtcbiAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICBpZiAoIWxpYmVyYWwgJiYgZV90YXJnZXQoZSkuZ2V0QXR0cmlidXRlKFwiY20tbm90LWNvbnRlbnRcIikgPT0gXCJ0cnVlXCIpIHsgcmV0dXJuIG51bGwgfVxuXG4gIHZhciB4LCB5LCBzcGFjZSA9IGRpc3BsYXkubGluZVNwYWNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAvLyBGYWlscyB1bnByZWRpY3RhYmx5IG9uIElFWzY3XSB3aGVuIG1vdXNlIGlzIGRyYWdnZWQgYXJvdW5kIHF1aWNrbHkuXG4gIHRyeSB7IHggPSBlLmNsaWVudFggLSBzcGFjZS5sZWZ0OyB5ID0gZS5jbGllbnRZIC0gc3BhY2UudG9wOyB9XG4gIGNhdGNoIChlKSB7IHJldHVybiBudWxsIH1cbiAgdmFyIGNvb3JkcyA9IGNvb3Jkc0NoYXIoY20sIHgsIHkpLCBsaW5lO1xuICBpZiAoZm9yUmVjdCAmJiBjb29yZHMueFJlbCA9PSAxICYmIChsaW5lID0gZ2V0TGluZShjbS5kb2MsIGNvb3Jkcy5saW5lKS50ZXh0KS5sZW5ndGggPT0gY29vcmRzLmNoKSB7XG4gICAgdmFyIGNvbERpZmYgPSBjb3VudENvbHVtbihsaW5lLCBsaW5lLmxlbmd0aCwgY20ub3B0aW9ucy50YWJTaXplKSAtIGxpbmUubGVuZ3RoO1xuICAgIGNvb3JkcyA9IFBvcyhjb29yZHMubGluZSwgTWF0aC5tYXgoMCwgTWF0aC5yb3VuZCgoeCAtIHBhZGRpbmdIKGNtLmRpc3BsYXkpLmxlZnQpIC8gY2hhcldpZHRoKGNtLmRpc3BsYXkpKSAtIGNvbERpZmYpKTtcbiAgfVxuICByZXR1cm4gY29vcmRzXG59XG5cbi8vIEZpbmQgdGhlIHZpZXcgZWxlbWVudCBjb3JyZXNwb25kaW5nIHRvIGEgZ2l2ZW4gbGluZS4gUmV0dXJuIG51bGxcbi8vIHdoZW4gdGhlIGxpbmUgaXNuJ3QgdmlzaWJsZS5cbmZ1bmN0aW9uIGZpbmRWaWV3SW5kZXgoY20sIG4pIHtcbiAgaWYgKG4gPj0gY20uZGlzcGxheS52aWV3VG8pIHsgcmV0dXJuIG51bGwgfVxuICBuIC09IGNtLmRpc3BsYXkudmlld0Zyb207XG4gIGlmIChuIDwgMCkgeyByZXR1cm4gbnVsbCB9XG4gIHZhciB2aWV3ID0gY20uZGlzcGxheS52aWV3O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICBuIC09IHZpZXdbaV0uc2l6ZTtcbiAgICBpZiAobiA8IDApIHsgcmV0dXJuIGkgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNlbGVjdGlvbihjbSkge1xuICBjbS5kaXNwbGF5LmlucHV0LnNob3dTZWxlY3Rpb24oY20uZGlzcGxheS5pbnB1dC5wcmVwYXJlU2VsZWN0aW9uKCkpO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlU2VsZWN0aW9uKGNtLCBwcmltYXJ5KSB7XG4gIHZhciBkb2MgPSBjbS5kb2MsIHJlc3VsdCA9IHt9O1xuICB2YXIgY3VyRnJhZ21lbnQgPSByZXN1bHQuY3Vyc29ycyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIHNlbEZyYWdtZW50ID0gcmVzdWx0LnNlbGVjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGRvYy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHByaW1hcnkgPT09IGZhbHNlICYmIGkgPT0gZG9jLnNlbC5wcmltSW5kZXgpIHsgY29udGludWUgfVxuICAgIHZhciByYW5nZSQkMSA9IGRvYy5zZWwucmFuZ2VzW2ldO1xuICAgIGlmIChyYW5nZSQkMS5mcm9tKCkubGluZSA+PSBjbS5kaXNwbGF5LnZpZXdUbyB8fCByYW5nZSQkMS50bygpLmxpbmUgPCBjbS5kaXNwbGF5LnZpZXdGcm9tKSB7IGNvbnRpbnVlIH1cbiAgICB2YXIgY29sbGFwc2VkID0gcmFuZ2UkJDEuZW1wdHkoKTtcbiAgICBpZiAoY29sbGFwc2VkIHx8IGNtLm9wdGlvbnMuc2hvd0N1cnNvcldoZW5TZWxlY3RpbmcpXG4gICAgICB7IGRyYXdTZWxlY3Rpb25DdXJzb3IoY20sIHJhbmdlJCQxLmhlYWQsIGN1ckZyYWdtZW50KTsgfVxuICAgIGlmICghY29sbGFwc2VkKVxuICAgICAgeyBkcmF3U2VsZWN0aW9uUmFuZ2UoY20sIHJhbmdlJCQxLCBzZWxGcmFnbWVudCk7IH1cbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIERyYXdzIGEgY3Vyc29yIGZvciB0aGUgZ2l2ZW4gcmFuZ2VcbmZ1bmN0aW9uIGRyYXdTZWxlY3Rpb25DdXJzb3IoY20sIGhlYWQsIG91dHB1dCkge1xuICB2YXIgcG9zID0gY3Vyc29yQ29vcmRzKGNtLCBoZWFkLCBcImRpdlwiLCBudWxsLCBudWxsLCAhY20ub3B0aW9ucy5zaW5nbGVDdXJzb3JIZWlnaHRQZXJMaW5lKTtcblxuICB2YXIgY3Vyc29yID0gb3V0cHV0LmFwcGVuZENoaWxkKGVsdChcImRpdlwiLCBcIlxcdTAwYTBcIiwgXCJDb2RlTWlycm9yLWN1cnNvclwiKSk7XG4gIGN1cnNvci5zdHlsZS5sZWZ0ID0gcG9zLmxlZnQgKyBcInB4XCI7XG4gIGN1cnNvci5zdHlsZS50b3AgPSBwb3MudG9wICsgXCJweFwiO1xuICBjdXJzb3Iuc3R5bGUuaGVpZ2h0ID0gTWF0aC5tYXgoMCwgcG9zLmJvdHRvbSAtIHBvcy50b3ApICogY20ub3B0aW9ucy5jdXJzb3JIZWlnaHQgKyBcInB4XCI7XG5cbiAgaWYgKHBvcy5vdGhlcikge1xuICAgIC8vIFNlY29uZGFyeSBjdXJzb3IsIHNob3duIHdoZW4gb24gYSAnanVtcCcgaW4gYmktZGlyZWN0aW9uYWwgdGV4dFxuICAgIHZhciBvdGhlckN1cnNvciA9IG91dHB1dC5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgXCJcXHUwMGEwXCIsIFwiQ29kZU1pcnJvci1jdXJzb3IgQ29kZU1pcnJvci1zZWNvbmRhcnljdXJzb3JcIikpO1xuICAgIG90aGVyQ3Vyc29yLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIG90aGVyQ3Vyc29yLnN0eWxlLmxlZnQgPSBwb3Mub3RoZXIubGVmdCArIFwicHhcIjtcbiAgICBvdGhlckN1cnNvci5zdHlsZS50b3AgPSBwb3Mub3RoZXIudG9wICsgXCJweFwiO1xuICAgIG90aGVyQ3Vyc29yLnN0eWxlLmhlaWdodCA9IChwb3Mub3RoZXIuYm90dG9tIC0gcG9zLm90aGVyLnRvcCkgKiAuODUgKyBcInB4XCI7XG4gIH1cbn1cblxuLy8gRHJhd3MgdGhlIGdpdmVuIHJhbmdlIGFzIGEgaGlnaGxpZ2h0ZWQgc2VsZWN0aW9uXG5mdW5jdGlvbiBkcmF3U2VsZWN0aW9uUmFuZ2UoY20sIHJhbmdlJCQxLCBvdXRwdXQpIHtcbiAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBkb2MgPSBjbS5kb2M7XG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIHBhZGRpbmcgPSBwYWRkaW5nSChjbS5kaXNwbGF5KSwgbGVmdFNpZGUgPSBwYWRkaW5nLmxlZnQ7XG4gIHZhciByaWdodFNpZGUgPSBNYXRoLm1heChkaXNwbGF5LnNpemVyV2lkdGgsIGRpc3BsYXlXaWR0aChjbSkgLSBkaXNwbGF5LnNpemVyLm9mZnNldExlZnQpIC0gcGFkZGluZy5yaWdodDtcblxuICBmdW5jdGlvbiBhZGQobGVmdCwgdG9wLCB3aWR0aCwgYm90dG9tKSB7XG4gICAgaWYgKHRvcCA8IDApIHsgdG9wID0gMDsgfVxuICAgIHRvcCA9IE1hdGgucm91bmQodG9wKTtcbiAgICBib3R0b20gPSBNYXRoLnJvdW5kKGJvdHRvbSk7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1zZWxlY3RlZFwiLCAoXCJwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IFwiICsgbGVmdCArIFwicHg7XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6IFwiICsgdG9wICsgXCJweDsgd2lkdGg6IFwiICsgKHdpZHRoID09IG51bGwgPyByaWdodFNpZGUgLSBsZWZ0IDogd2lkdGgpICsgXCJweDtcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogXCIgKyAoYm90dG9tIC0gdG9wKSArIFwicHhcIikpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdGb3JMaW5lKGxpbmUsIGZyb21BcmcsIHRvQXJnKSB7XG4gICAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKGRvYywgbGluZSk7XG4gICAgdmFyIGxpbmVMZW4gPSBsaW5lT2JqLnRleHQubGVuZ3RoO1xuICAgIHZhciBzdGFydCwgZW5kO1xuICAgIGZ1bmN0aW9uIGNvb3JkcyhjaCwgYmlhcykge1xuICAgICAgcmV0dXJuIGNoYXJDb29yZHMoY20sIFBvcyhsaW5lLCBjaCksIFwiZGl2XCIsIGxpbmVPYmosIGJpYXMpXG4gICAgfVxuXG4gICAgaXRlcmF0ZUJpZGlTZWN0aW9ucyhnZXRPcmRlcihsaW5lT2JqLCBkb2MuZGlyZWN0aW9uKSwgZnJvbUFyZyB8fCAwLCB0b0FyZyA9PSBudWxsID8gbGluZUxlbiA6IHRvQXJnLCBmdW5jdGlvbiAoZnJvbSwgdG8sIGRpcikge1xuICAgICAgdmFyIGxlZnRQb3MgPSBjb29yZHMoZnJvbSwgXCJsZWZ0XCIpLCByaWdodFBvcywgbGVmdCwgcmlnaHQ7XG4gICAgICBpZiAoZnJvbSA9PSB0bykge1xuICAgICAgICByaWdodFBvcyA9IGxlZnRQb3M7XG4gICAgICAgIGxlZnQgPSByaWdodCA9IGxlZnRQb3MubGVmdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0UG9zID0gY29vcmRzKHRvIC0gMSwgXCJyaWdodFwiKTtcbiAgICAgICAgaWYgKGRpciA9PSBcInJ0bFwiKSB7IHZhciB0bXAgPSBsZWZ0UG9zOyBsZWZ0UG9zID0gcmlnaHRQb3M7IHJpZ2h0UG9zID0gdG1wOyB9XG4gICAgICAgIGxlZnQgPSBsZWZ0UG9zLmxlZnQ7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHRQb3MucmlnaHQ7XG4gICAgICB9XG4gICAgICBpZiAoZnJvbUFyZyA9PSBudWxsICYmIGZyb20gPT0gMCkgeyBsZWZ0ID0gbGVmdFNpZGU7IH1cbiAgICAgIGlmIChyaWdodFBvcy50b3AgLSBsZWZ0UG9zLnRvcCA+IDMpIHsgLy8gRGlmZmVyZW50IGxpbmVzLCBkcmF3IHRvcCBwYXJ0XG4gICAgICAgIGFkZChsZWZ0LCBsZWZ0UG9zLnRvcCwgbnVsbCwgbGVmdFBvcy5ib3R0b20pO1xuICAgICAgICBsZWZ0ID0gbGVmdFNpZGU7XG4gICAgICAgIGlmIChsZWZ0UG9zLmJvdHRvbSA8IHJpZ2h0UG9zLnRvcCkgeyBhZGQobGVmdCwgbGVmdFBvcy5ib3R0b20sIG51bGwsIHJpZ2h0UG9zLnRvcCk7IH1cbiAgICAgIH1cbiAgICAgIGlmICh0b0FyZyA9PSBudWxsICYmIHRvID09IGxpbmVMZW4pIHsgcmlnaHQgPSByaWdodFNpZGU7IH1cbiAgICAgIGlmICghc3RhcnQgfHwgbGVmdFBvcy50b3AgPCBzdGFydC50b3AgfHwgbGVmdFBvcy50b3AgPT0gc3RhcnQudG9wICYmIGxlZnRQb3MubGVmdCA8IHN0YXJ0LmxlZnQpXG4gICAgICAgIHsgc3RhcnQgPSBsZWZ0UG9zOyB9XG4gICAgICBpZiAoIWVuZCB8fCByaWdodFBvcy5ib3R0b20gPiBlbmQuYm90dG9tIHx8IHJpZ2h0UG9zLmJvdHRvbSA9PSBlbmQuYm90dG9tICYmIHJpZ2h0UG9zLnJpZ2h0ID4gZW5kLnJpZ2h0KVxuICAgICAgICB7IGVuZCA9IHJpZ2h0UG9zOyB9XG4gICAgICBpZiAobGVmdCA8IGxlZnRTaWRlICsgMSkgeyBsZWZ0ID0gbGVmdFNpZGU7IH1cbiAgICAgIGFkZChsZWZ0LCByaWdodFBvcy50b3AsIHJpZ2h0IC0gbGVmdCwgcmlnaHRQb3MuYm90dG9tKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge3N0YXJ0OiBzdGFydCwgZW5kOiBlbmR9XG4gIH1cblxuICB2YXIgc0Zyb20gPSByYW5nZSQkMS5mcm9tKCksIHNUbyA9IHJhbmdlJCQxLnRvKCk7XG4gIGlmIChzRnJvbS5saW5lID09IHNUby5saW5lKSB7XG4gICAgZHJhd0ZvckxpbmUoc0Zyb20ubGluZSwgc0Zyb20uY2gsIHNUby5jaCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGZyb21MaW5lID0gZ2V0TGluZShkb2MsIHNGcm9tLmxpbmUpLCB0b0xpbmUgPSBnZXRMaW5lKGRvYywgc1RvLmxpbmUpO1xuICAgIHZhciBzaW5nbGVWTGluZSA9IHZpc3VhbExpbmUoZnJvbUxpbmUpID09IHZpc3VhbExpbmUodG9MaW5lKTtcbiAgICB2YXIgbGVmdEVuZCA9IGRyYXdGb3JMaW5lKHNGcm9tLmxpbmUsIHNGcm9tLmNoLCBzaW5nbGVWTGluZSA/IGZyb21MaW5lLnRleHQubGVuZ3RoICsgMSA6IG51bGwpLmVuZDtcbiAgICB2YXIgcmlnaHRTdGFydCA9IGRyYXdGb3JMaW5lKHNUby5saW5lLCBzaW5nbGVWTGluZSA/IDAgOiBudWxsLCBzVG8uY2gpLnN0YXJ0O1xuICAgIGlmIChzaW5nbGVWTGluZSkge1xuICAgICAgaWYgKGxlZnRFbmQudG9wIDwgcmlnaHRTdGFydC50b3AgLSAyKSB7XG4gICAgICAgIGFkZChsZWZ0RW5kLnJpZ2h0LCBsZWZ0RW5kLnRvcCwgbnVsbCwgbGVmdEVuZC5ib3R0b20pO1xuICAgICAgICBhZGQobGVmdFNpZGUsIHJpZ2h0U3RhcnQudG9wLCByaWdodFN0YXJ0LmxlZnQsIHJpZ2h0U3RhcnQuYm90dG9tKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZChsZWZ0RW5kLnJpZ2h0LCBsZWZ0RW5kLnRvcCwgcmlnaHRTdGFydC5sZWZ0IC0gbGVmdEVuZC5yaWdodCwgbGVmdEVuZC5ib3R0b20pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobGVmdEVuZC5ib3R0b20gPCByaWdodFN0YXJ0LnRvcClcbiAgICAgIHsgYWRkKGxlZnRTaWRlLCBsZWZ0RW5kLmJvdHRvbSwgbnVsbCwgcmlnaHRTdGFydC50b3ApOyB9XG4gIH1cblxuICBvdXRwdXQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xufVxuXG4vLyBDdXJzb3ItYmxpbmtpbmdcbmZ1bmN0aW9uIHJlc3RhcnRCbGluayhjbSkge1xuICBpZiAoIWNtLnN0YXRlLmZvY3VzZWQpIHsgcmV0dXJuIH1cbiAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICBjbGVhckludGVydmFsKGRpc3BsYXkuYmxpbmtlcik7XG4gIHZhciBvbiA9IHRydWU7XG4gIGRpc3BsYXkuY3Vyc29yRGl2LnN0eWxlLnZpc2liaWxpdHkgPSBcIlwiO1xuICBpZiAoY20ub3B0aW9ucy5jdXJzb3JCbGlua1JhdGUgPiAwKVxuICAgIHsgZGlzcGxheS5ibGlua2VyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkgeyByZXR1cm4gZGlzcGxheS5jdXJzb3JEaXYuc3R5bGUudmlzaWJpbGl0eSA9IChvbiA9ICFvbikgPyBcIlwiIDogXCJoaWRkZW5cIjsgfSxcbiAgICAgIGNtLm9wdGlvbnMuY3Vyc29yQmxpbmtSYXRlKTsgfVxuICBlbHNlIGlmIChjbS5vcHRpb25zLmN1cnNvckJsaW5rUmF0ZSA8IDApXG4gICAgeyBkaXNwbGF5LmN1cnNvckRpdi5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjsgfVxufVxuXG5mdW5jdGlvbiBlbnN1cmVGb2N1cyhjbSkge1xuICBpZiAoIWNtLnN0YXRlLmZvY3VzZWQpIHsgY20uZGlzcGxheS5pbnB1dC5mb2N1cygpOyBvbkZvY3VzKGNtKTsgfVxufVxuXG5mdW5jdGlvbiBkZWxheUJsdXJFdmVudChjbSkge1xuICBjbS5zdGF0ZS5kZWxheWluZ0JsdXJFdmVudCA9IHRydWU7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBpZiAoY20uc3RhdGUuZGVsYXlpbmdCbHVyRXZlbnQpIHtcbiAgICBjbS5zdGF0ZS5kZWxheWluZ0JsdXJFdmVudCA9IGZhbHNlO1xuICAgIG9uQmx1cihjbSk7XG4gIH0gfSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gb25Gb2N1cyhjbSwgZSkge1xuICBpZiAoY20uc3RhdGUuZGVsYXlpbmdCbHVyRXZlbnQpIHsgY20uc3RhdGUuZGVsYXlpbmdCbHVyRXZlbnQgPSBmYWxzZTsgfVxuXG4gIGlmIChjbS5vcHRpb25zLnJlYWRPbmx5ID09IFwibm9jdXJzb3JcIikgeyByZXR1cm4gfVxuICBpZiAoIWNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICBzaWduYWwoY20sIFwiZm9jdXNcIiwgY20sIGUpO1xuICAgIGNtLnN0YXRlLmZvY3VzZWQgPSB0cnVlO1xuICAgIGFkZENsYXNzKGNtLmRpc3BsYXkud3JhcHBlciwgXCJDb2RlTWlycm9yLWZvY3VzZWRcIik7XG4gICAgLy8gVGhpcyB0ZXN0IHByZXZlbnRzIHRoaXMgZnJvbSBmaXJpbmcgd2hlbiBhIGNvbnRleHRcbiAgICAvLyBtZW51IGlzIGNsb3NlZCAoc2luY2UgdGhlIGlucHV0IHJlc2V0IHdvdWxkIGtpbGwgdGhlXG4gICAgLy8gc2VsZWN0LWFsbCBkZXRlY3Rpb24gaGFjaylcbiAgICBpZiAoIWNtLmN1ck9wICYmIGNtLmRpc3BsYXkuc2VsRm9yQ29udGV4dE1lbnUgIT0gY20uZG9jLnNlbCkge1xuICAgICAgY20uZGlzcGxheS5pbnB1dC5yZXNldCgpO1xuICAgICAgaWYgKHdlYmtpdCkgeyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNtLmRpc3BsYXkuaW5wdXQucmVzZXQodHJ1ZSk7IH0sIDIwKTsgfSAvLyBJc3N1ZSAjMTczMFxuICAgIH1cbiAgICBjbS5kaXNwbGF5LmlucHV0LnJlY2VpdmVkRm9jdXMoKTtcbiAgfVxuICByZXN0YXJ0QmxpbmsoY20pO1xufVxuZnVuY3Rpb24gb25CbHVyKGNtLCBlKSB7XG4gIGlmIChjbS5zdGF0ZS5kZWxheWluZ0JsdXJFdmVudCkgeyByZXR1cm4gfVxuXG4gIGlmIChjbS5zdGF0ZS5mb2N1c2VkKSB7XG4gICAgc2lnbmFsKGNtLCBcImJsdXJcIiwgY20sIGUpO1xuICAgIGNtLnN0YXRlLmZvY3VzZWQgPSBmYWxzZTtcbiAgICBybUNsYXNzKGNtLmRpc3BsYXkud3JhcHBlciwgXCJDb2RlTWlycm9yLWZvY3VzZWRcIik7XG4gIH1cbiAgY2xlYXJJbnRlcnZhbChjbS5kaXNwbGF5LmJsaW5rZXIpO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgaWYgKCFjbS5zdGF0ZS5mb2N1c2VkKSB7IGNtLmRpc3BsYXkuc2hpZnQgPSBmYWxzZTsgfSB9LCAxNTApO1xufVxuXG4vLyBSZWFkIHRoZSBhY3R1YWwgaGVpZ2h0cyBvZiB0aGUgcmVuZGVyZWQgbGluZXMsIGFuZCB1cGRhdGUgdGhlaXJcbi8vIHN0b3JlZCBoZWlnaHRzIHRvIG1hdGNoLlxuZnVuY3Rpb24gdXBkYXRlSGVpZ2h0c0luVmlld3BvcnQoY20pIHtcbiAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICB2YXIgcHJldkJvdHRvbSA9IGRpc3BsYXkubGluZURpdi5vZmZzZXRUb3A7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGlzcGxheS52aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGN1ciA9IGRpc3BsYXkudmlld1tpXSwgaGVpZ2h0ID0gKHZvaWQgMCk7XG4gICAgaWYgKGN1ci5oaWRkZW4pIHsgY29udGludWUgfVxuICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgOCkge1xuICAgICAgdmFyIGJvdCA9IGN1ci5ub2RlLm9mZnNldFRvcCArIGN1ci5ub2RlLm9mZnNldEhlaWdodDtcbiAgICAgIGhlaWdodCA9IGJvdCAtIHByZXZCb3R0b207XG4gICAgICBwcmV2Qm90dG9tID0gYm90O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYm94ID0gY3VyLm5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBoZWlnaHQgPSBib3guYm90dG9tIC0gYm94LnRvcDtcbiAgICB9XG4gICAgdmFyIGRpZmYgPSBjdXIubGluZS5oZWlnaHQgLSBoZWlnaHQ7XG4gICAgaWYgKGhlaWdodCA8IDIpIHsgaGVpZ2h0ID0gdGV4dEhlaWdodChkaXNwbGF5KTsgfVxuICAgIGlmIChkaWZmID4gLjAwMSB8fCBkaWZmIDwgLS4wMDEpIHtcbiAgICAgIHVwZGF0ZUxpbmVIZWlnaHQoY3VyLmxpbmUsIGhlaWdodCk7XG4gICAgICB1cGRhdGVXaWRnZXRIZWlnaHQoY3VyLmxpbmUpO1xuICAgICAgaWYgKGN1ci5yZXN0KSB7IGZvciAodmFyIGogPSAwOyBqIDwgY3VyLnJlc3QubGVuZ3RoOyBqKyspXG4gICAgICAgIHsgdXBkYXRlV2lkZ2V0SGVpZ2h0KGN1ci5yZXN0W2pdKTsgfSB9XG4gICAgfVxuICB9XG59XG5cbi8vIFJlYWQgYW5kIHN0b3JlIHRoZSBoZWlnaHQgb2YgbGluZSB3aWRnZXRzIGFzc29jaWF0ZWQgd2l0aCB0aGVcbi8vIGdpdmVuIGxpbmUuXG5mdW5jdGlvbiB1cGRhdGVXaWRnZXRIZWlnaHQobGluZSkge1xuICBpZiAobGluZS53aWRnZXRzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS53aWRnZXRzLmxlbmd0aDsgKytpKVxuICAgIHsgbGluZS53aWRnZXRzW2ldLmhlaWdodCA9IGxpbmUud2lkZ2V0c1tpXS5ub2RlLnBhcmVudE5vZGUub2Zmc2V0SGVpZ2h0OyB9IH1cbn1cblxuLy8gQ29tcHV0ZSB0aGUgbGluZXMgdGhhdCBhcmUgdmlzaWJsZSBpbiBhIGdpdmVuIHZpZXdwb3J0IChkZWZhdWx0c1xuLy8gdGhlIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbikuIHZpZXdwb3J0IG1heSBjb250YWluIHRvcCxcbi8vIGhlaWdodCwgYW5kIGVuc3VyZSAoc2VlIG9wLnNjcm9sbFRvUG9zKSBwcm9wZXJ0aWVzLlxuZnVuY3Rpb24gdmlzaWJsZUxpbmVzKGRpc3BsYXksIGRvYywgdmlld3BvcnQpIHtcbiAgdmFyIHRvcCA9IHZpZXdwb3J0ICYmIHZpZXdwb3J0LnRvcCAhPSBudWxsID8gTWF0aC5tYXgoMCwgdmlld3BvcnQudG9wKSA6IGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wO1xuICB0b3AgPSBNYXRoLmZsb29yKHRvcCAtIHBhZGRpbmdUb3AoZGlzcGxheSkpO1xuICB2YXIgYm90dG9tID0gdmlld3BvcnQgJiYgdmlld3BvcnQuYm90dG9tICE9IG51bGwgPyB2aWV3cG9ydC5ib3R0b20gOiB0b3AgKyBkaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0O1xuXG4gIHZhciBmcm9tID0gbGluZUF0SGVpZ2h0KGRvYywgdG9wKSwgdG8gPSBsaW5lQXRIZWlnaHQoZG9jLCBib3R0b20pO1xuICAvLyBFbnN1cmUgaXMgYSB7ZnJvbToge2xpbmUsIGNofSwgdG86IHtsaW5lLCBjaH19IG9iamVjdCwgYW5kXG4gIC8vIGZvcmNlcyB0aG9zZSBsaW5lcyBpbnRvIHRoZSB2aWV3cG9ydCAoaWYgcG9zc2libGUpLlxuICBpZiAodmlld3BvcnQgJiYgdmlld3BvcnQuZW5zdXJlKSB7XG4gICAgdmFyIGVuc3VyZUZyb20gPSB2aWV3cG9ydC5lbnN1cmUuZnJvbS5saW5lLCBlbnN1cmVUbyA9IHZpZXdwb3J0LmVuc3VyZS50by5saW5lO1xuICAgIGlmIChlbnN1cmVGcm9tIDwgZnJvbSkge1xuICAgICAgZnJvbSA9IGVuc3VyZUZyb207XG4gICAgICB0byA9IGxpbmVBdEhlaWdodChkb2MsIGhlaWdodEF0TGluZShnZXRMaW5lKGRvYywgZW5zdXJlRnJvbSkpICsgZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodCk7XG4gICAgfSBlbHNlIGlmIChNYXRoLm1pbihlbnN1cmVUbywgZG9jLmxhc3RMaW5lKCkpID49IHRvKSB7XG4gICAgICBmcm9tID0gbGluZUF0SGVpZ2h0KGRvYywgaGVpZ2h0QXRMaW5lKGdldExpbmUoZG9jLCBlbnN1cmVUbykpIC0gZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodCk7XG4gICAgICB0byA9IGVuc3VyZVRvO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge2Zyb206IGZyb20sIHRvOiBNYXRoLm1heCh0bywgZnJvbSArIDEpfVxufVxuXG4vLyBSZS1hbGlnbiBsaW5lIG51bWJlcnMgYW5kIGd1dHRlciBtYXJrcyB0byBjb21wZW5zYXRlIGZvclxuLy8gaG9yaXpvbnRhbCBzY3JvbGxpbmcuXG5mdW5jdGlvbiBhbGlnbkhvcml6b250YWxseShjbSkge1xuICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIHZpZXcgPSBkaXNwbGF5LnZpZXc7XG4gIGlmICghZGlzcGxheS5hbGlnbldpZGdldHMgJiYgKCFkaXNwbGF5Lmd1dHRlcnMuZmlyc3RDaGlsZCB8fCAhY20ub3B0aW9ucy5maXhlZEd1dHRlcikpIHsgcmV0dXJuIH1cbiAgdmFyIGNvbXAgPSBjb21wZW5zYXRlRm9ySFNjcm9sbChkaXNwbGF5KSAtIGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCArIGNtLmRvYy5zY3JvbGxMZWZ0O1xuICB2YXIgZ3V0dGVyVyA9IGRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aCwgbGVmdCA9IGNvbXAgKyBcInB4XCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykgeyBpZiAoIXZpZXdbaV0uaGlkZGVuKSB7XG4gICAgaWYgKGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIpIHtcbiAgICAgIGlmICh2aWV3W2ldLmd1dHRlcilcbiAgICAgICAgeyB2aWV3W2ldLmd1dHRlci5zdHlsZS5sZWZ0ID0gbGVmdDsgfVxuICAgICAgaWYgKHZpZXdbaV0uZ3V0dGVyQmFja2dyb3VuZClcbiAgICAgICAgeyB2aWV3W2ldLmd1dHRlckJhY2tncm91bmQuc3R5bGUubGVmdCA9IGxlZnQ7IH1cbiAgICB9XG4gICAgdmFyIGFsaWduID0gdmlld1tpXS5hbGlnbmFibGU7XG4gICAgaWYgKGFsaWduKSB7IGZvciAodmFyIGogPSAwOyBqIDwgYWxpZ24ubGVuZ3RoOyBqKyspXG4gICAgICB7IGFsaWduW2pdLnN0eWxlLmxlZnQgPSBsZWZ0OyB9IH1cbiAgfSB9XG4gIGlmIChjbS5vcHRpb25zLmZpeGVkR3V0dGVyKVxuICAgIHsgZGlzcGxheS5ndXR0ZXJzLnN0eWxlLmxlZnQgPSAoY29tcCArIGd1dHRlclcpICsgXCJweFwiOyB9XG59XG5cbi8vIFVzZWQgdG8gZW5zdXJlIHRoYXQgdGhlIGxpbmUgbnVtYmVyIGd1dHRlciBpcyBzdGlsbCB0aGUgcmlnaHRcbi8vIHNpemUgZm9yIHRoZSBjdXJyZW50IGRvY3VtZW50IHNpemUuIFJldHVybnMgdHJ1ZSB3aGVuIGFuIHVwZGF0ZVxuLy8gaXMgbmVlZGVkLlxuZnVuY3Rpb24gbWF5YmVVcGRhdGVMaW5lTnVtYmVyV2lkdGgoY20pIHtcbiAgaWYgKCFjbS5vcHRpb25zLmxpbmVOdW1iZXJzKSB7IHJldHVybiBmYWxzZSB9XG4gIHZhciBkb2MgPSBjbS5kb2MsIGxhc3QgPSBsaW5lTnVtYmVyRm9yKGNtLm9wdGlvbnMsIGRvYy5maXJzdCArIGRvYy5zaXplIC0gMSksIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICBpZiAobGFzdC5sZW5ndGggIT0gZGlzcGxheS5saW5lTnVtQ2hhcnMpIHtcbiAgICB2YXIgdGVzdCA9IGRpc3BsYXkubWVhc3VyZS5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgW2VsdChcImRpdlwiLCBsYXN0KV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29kZU1pcnJvci1saW5lbnVtYmVyIENvZGVNaXJyb3ItZ3V0dGVyLWVsdFwiKSk7XG4gICAgdmFyIGlubmVyVyA9IHRlc3QuZmlyc3RDaGlsZC5vZmZzZXRXaWR0aCwgcGFkZGluZyA9IHRlc3Qub2Zmc2V0V2lkdGggLSBpbm5lclc7XG4gICAgZGlzcGxheS5saW5lR3V0dGVyLnN0eWxlLndpZHRoID0gXCJcIjtcbiAgICBkaXNwbGF5LmxpbmVOdW1Jbm5lcldpZHRoID0gTWF0aC5tYXgoaW5uZXJXLCBkaXNwbGF5LmxpbmVHdXR0ZXIub2Zmc2V0V2lkdGggLSBwYWRkaW5nKSArIDE7XG4gICAgZGlzcGxheS5saW5lTnVtV2lkdGggPSBkaXNwbGF5LmxpbmVOdW1Jbm5lcldpZHRoICsgcGFkZGluZztcbiAgICBkaXNwbGF5LmxpbmVOdW1DaGFycyA9IGRpc3BsYXkubGluZU51bUlubmVyV2lkdGggPyBsYXN0Lmxlbmd0aCA6IC0xO1xuICAgIGRpc3BsYXkubGluZUd1dHRlci5zdHlsZS53aWR0aCA9IGRpc3BsYXkubGluZU51bVdpZHRoICsgXCJweFwiO1xuICAgIHVwZGF0ZUd1dHRlclNwYWNlKGNtKTtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vLyBTQ1JPTExJTkcgVEhJTkdTIElOVE8gVklFV1xuXG4vLyBJZiBhbiBlZGl0b3Igc2l0cyBvbiB0aGUgdG9wIG9yIGJvdHRvbSBvZiB0aGUgd2luZG93LCBwYXJ0aWFsbHlcbi8vIHNjcm9sbGVkIG91dCBvZiB2aWV3LCB0aGlzIGVuc3VyZXMgdGhhdCB0aGUgY3Vyc29yIGlzIHZpc2libGUuXG5mdW5jdGlvbiBtYXliZVNjcm9sbFdpbmRvdyhjbSwgcmVjdCkge1xuICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIFwic2Nyb2xsQ3Vyc29ySW50b1ZpZXdcIikpIHsgcmV0dXJuIH1cblxuICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGJveCA9IGRpc3BsYXkuc2l6ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIGRvU2Nyb2xsID0gbnVsbDtcbiAgaWYgKHJlY3QudG9wICsgYm94LnRvcCA8IDApIHsgZG9TY3JvbGwgPSB0cnVlOyB9XG4gIGVsc2UgaWYgKHJlY3QuYm90dG9tICsgYm94LnRvcCA+ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkpIHsgZG9TY3JvbGwgPSBmYWxzZTsgfVxuICBpZiAoZG9TY3JvbGwgIT0gbnVsbCAmJiAhcGhhbnRvbSkge1xuICAgIHZhciBzY3JvbGxOb2RlID0gZWx0KFwiZGl2XCIsIFwiXFx1MjAwYlwiLCBudWxsLCAoXCJwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogXCIgKyAocmVjdC50b3AgLSBkaXNwbGF5LnZpZXdPZmZzZXQgLSBwYWRkaW5nVG9wKGNtLmRpc3BsYXkpKSArIFwicHg7XFxuICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogXCIgKyAocmVjdC5ib3R0b20gLSByZWN0LnRvcCArIHNjcm9sbEdhcChjbSkgKyBkaXNwbGF5LmJhckhlaWdodCkgKyBcInB4O1xcbiAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBcIiArIChyZWN0LmxlZnQpICsgXCJweDsgd2lkdGg6IFwiICsgKE1hdGgubWF4KDIsIHJlY3QucmlnaHQgLSByZWN0LmxlZnQpKSArIFwicHg7XCIpKTtcbiAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5hcHBlbmRDaGlsZChzY3JvbGxOb2RlKTtcbiAgICBzY3JvbGxOb2RlLnNjcm9sbEludG9WaWV3KGRvU2Nyb2xsKTtcbiAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5yZW1vdmVDaGlsZChzY3JvbGxOb2RlKTtcbiAgfVxufVxuXG4vLyBTY3JvbGwgYSBnaXZlbiBwb3NpdGlvbiBpbnRvIHZpZXcgKGltbWVkaWF0ZWx5KSwgdmVyaWZ5aW5nIHRoYXRcbi8vIGl0IGFjdHVhbGx5IGJlY2FtZSB2aXNpYmxlIChhcyBsaW5lIGhlaWdodHMgYXJlIGFjY3VyYXRlbHlcbi8vIG1lYXN1cmVkLCB0aGUgcG9zaXRpb24gb2Ygc29tZXRoaW5nIG1heSAnZHJpZnQnIGR1cmluZyBkcmF3aW5nKS5cbmZ1bmN0aW9uIHNjcm9sbFBvc0ludG9WaWV3KGNtLCBwb3MsIGVuZCwgbWFyZ2luKSB7XG4gIGlmIChtYXJnaW4gPT0gbnVsbCkgeyBtYXJnaW4gPSAwOyB9XG4gIHZhciByZWN0O1xuICBmb3IgKHZhciBsaW1pdCA9IDA7IGxpbWl0IDwgNTsgbGltaXQrKykge1xuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgdmFyIGNvb3JkcyA9IGN1cnNvckNvb3JkcyhjbSwgcG9zKTtcbiAgICB2YXIgZW5kQ29vcmRzID0gIWVuZCB8fCBlbmQgPT0gcG9zID8gY29vcmRzIDogY3Vyc29yQ29vcmRzKGNtLCBlbmQpO1xuICAgIHJlY3QgPSB7bGVmdDogTWF0aC5taW4oY29vcmRzLmxlZnQsIGVuZENvb3Jkcy5sZWZ0KSxcbiAgICAgICAgICAgIHRvcDogTWF0aC5taW4oY29vcmRzLnRvcCwgZW5kQ29vcmRzLnRvcCkgLSBtYXJnaW4sXG4gICAgICAgICAgICByaWdodDogTWF0aC5tYXgoY29vcmRzLmxlZnQsIGVuZENvb3Jkcy5sZWZ0KSxcbiAgICAgICAgICAgIGJvdHRvbTogTWF0aC5tYXgoY29vcmRzLmJvdHRvbSwgZW5kQ29vcmRzLmJvdHRvbSkgKyBtYXJnaW59O1xuICAgIHZhciBzY3JvbGxQb3MgPSBjYWxjdWxhdGVTY3JvbGxQb3MoY20sIHJlY3QpO1xuICAgIHZhciBzdGFydFRvcCA9IGNtLmRvYy5zY3JvbGxUb3AsIHN0YXJ0TGVmdCA9IGNtLmRvYy5zY3JvbGxMZWZ0O1xuICAgIGlmIChzY3JvbGxQb3Muc2Nyb2xsVG9wICE9IG51bGwpIHtcbiAgICAgIHVwZGF0ZVNjcm9sbFRvcChjbSwgc2Nyb2xsUG9zLnNjcm9sbFRvcCk7XG4gICAgICBpZiAoTWF0aC5hYnMoY20uZG9jLnNjcm9sbFRvcCAtIHN0YXJ0VG9wKSA+IDEpIHsgY2hhbmdlZCA9IHRydWU7IH1cbiAgICB9XG4gICAgaWYgKHNjcm9sbFBvcy5zY3JvbGxMZWZ0ICE9IG51bGwpIHtcbiAgICAgIHNldFNjcm9sbExlZnQoY20sIHNjcm9sbFBvcy5zY3JvbGxMZWZ0KTtcbiAgICAgIGlmIChNYXRoLmFicyhjbS5kb2Muc2Nyb2xsTGVmdCAtIHN0YXJ0TGVmdCkgPiAxKSB7IGNoYW5nZWQgPSB0cnVlOyB9XG4gICAgfVxuICAgIGlmICghY2hhbmdlZCkgeyBicmVhayB9XG4gIH1cbiAgcmV0dXJuIHJlY3Rcbn1cblxuLy8gU2Nyb2xsIGEgZ2l2ZW4gc2V0IG9mIGNvb3JkaW5hdGVzIGludG8gdmlldyAoaW1tZWRpYXRlbHkpLlxuZnVuY3Rpb24gc2Nyb2xsSW50b1ZpZXcoY20sIHJlY3QpIHtcbiAgdmFyIHNjcm9sbFBvcyA9IGNhbGN1bGF0ZVNjcm9sbFBvcyhjbSwgcmVjdCk7XG4gIGlmIChzY3JvbGxQb3Muc2Nyb2xsVG9wICE9IG51bGwpIHsgdXBkYXRlU2Nyb2xsVG9wKGNtLCBzY3JvbGxQb3Muc2Nyb2xsVG9wKTsgfVxuICBpZiAoc2Nyb2xsUG9zLnNjcm9sbExlZnQgIT0gbnVsbCkgeyBzZXRTY3JvbGxMZWZ0KGNtLCBzY3JvbGxQb3Muc2Nyb2xsTGVmdCk7IH1cbn1cblxuLy8gQ2FsY3VsYXRlIGEgbmV3IHNjcm9sbCBwb3NpdGlvbiBuZWVkZWQgdG8gc2Nyb2xsIHRoZSBnaXZlblxuLy8gcmVjdGFuZ2xlIGludG8gdmlldy4gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBzY3JvbGxUb3AgYW5kXG4vLyBzY3JvbGxMZWZ0IHByb3BlcnRpZXMuIFdoZW4gdGhlc2UgYXJlIHVuZGVmaW5lZCwgdGhlXG4vLyB2ZXJ0aWNhbC9ob3Jpem9udGFsIHBvc2l0aW9uIGRvZXMgbm90IG5lZWQgdG8gYmUgYWRqdXN0ZWQuXG5mdW5jdGlvbiBjYWxjdWxhdGVTY3JvbGxQb3MoY20sIHJlY3QpIHtcbiAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBzbmFwTWFyZ2luID0gdGV4dEhlaWdodChjbS5kaXNwbGF5KTtcbiAgaWYgKHJlY3QudG9wIDwgMCkgeyByZWN0LnRvcCA9IDA7IH1cbiAgdmFyIHNjcmVlbnRvcCA9IGNtLmN1ck9wICYmIGNtLmN1ck9wLnNjcm9sbFRvcCAhPSBudWxsID8gY20uY3VyT3Auc2Nyb2xsVG9wIDogZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3A7XG4gIHZhciBzY3JlZW4gPSBkaXNwbGF5SGVpZ2h0KGNtKSwgcmVzdWx0ID0ge307XG4gIGlmIChyZWN0LmJvdHRvbSAtIHJlY3QudG9wID4gc2NyZWVuKSB7IHJlY3QuYm90dG9tID0gcmVjdC50b3AgKyBzY3JlZW47IH1cbiAgdmFyIGRvY0JvdHRvbSA9IGNtLmRvYy5oZWlnaHQgKyBwYWRkaW5nVmVydChkaXNwbGF5KTtcbiAgdmFyIGF0VG9wID0gcmVjdC50b3AgPCBzbmFwTWFyZ2luLCBhdEJvdHRvbSA9IHJlY3QuYm90dG9tID4gZG9jQm90dG9tIC0gc25hcE1hcmdpbjtcbiAgaWYgKHJlY3QudG9wIDwgc2NyZWVudG9wKSB7XG4gICAgcmVzdWx0LnNjcm9sbFRvcCA9IGF0VG9wID8gMCA6IHJlY3QudG9wO1xuICB9IGVsc2UgaWYgKHJlY3QuYm90dG9tID4gc2NyZWVudG9wICsgc2NyZWVuKSB7XG4gICAgdmFyIG5ld1RvcCA9IE1hdGgubWluKHJlY3QudG9wLCAoYXRCb3R0b20gPyBkb2NCb3R0b20gOiByZWN0LmJvdHRvbSkgLSBzY3JlZW4pO1xuICAgIGlmIChuZXdUb3AgIT0gc2NyZWVudG9wKSB7IHJlc3VsdC5zY3JvbGxUb3AgPSBuZXdUb3A7IH1cbiAgfVxuXG4gIHZhciBzY3JlZW5sZWZ0ID0gY20uY3VyT3AgJiYgY20uY3VyT3Auc2Nyb2xsTGVmdCAhPSBudWxsID8gY20uY3VyT3Auc2Nyb2xsTGVmdCA6IGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdDtcbiAgdmFyIHNjcmVlbncgPSBkaXNwbGF5V2lkdGgoY20pIC0gKGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIgPyBkaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGggOiAwKTtcbiAgdmFyIHRvb1dpZGUgPSByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0ID4gc2NyZWVudztcbiAgaWYgKHRvb1dpZGUpIHsgcmVjdC5yaWdodCA9IHJlY3QubGVmdCArIHNjcmVlbnc7IH1cbiAgaWYgKHJlY3QubGVmdCA8IDEwKVxuICAgIHsgcmVzdWx0LnNjcm9sbExlZnQgPSAwOyB9XG4gIGVsc2UgaWYgKHJlY3QubGVmdCA8IHNjcmVlbmxlZnQpXG4gICAgeyByZXN1bHQuc2Nyb2xsTGVmdCA9IE1hdGgubWF4KDAsIHJlY3QubGVmdCAtICh0b29XaWRlID8gMCA6IDEwKSk7IH1cbiAgZWxzZSBpZiAocmVjdC5yaWdodCA+IHNjcmVlbncgKyBzY3JlZW5sZWZ0IC0gMylcbiAgICB7IHJlc3VsdC5zY3JvbGxMZWZ0ID0gcmVjdC5yaWdodCArICh0b29XaWRlID8gMCA6IDEwKSAtIHNjcmVlbnc7IH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBTdG9yZSBhIHJlbGF0aXZlIGFkanVzdG1lbnQgdG8gdGhlIHNjcm9sbCBwb3NpdGlvbiBpbiB0aGUgY3VycmVudFxuLy8gb3BlcmF0aW9uICh0byBiZSBhcHBsaWVkIHdoZW4gdGhlIG9wZXJhdGlvbiBmaW5pc2hlcykuXG5mdW5jdGlvbiBhZGRUb1Njcm9sbFRvcChjbSwgdG9wKSB7XG4gIGlmICh0b3AgPT0gbnVsbCkgeyByZXR1cm4gfVxuICByZXNvbHZlU2Nyb2xsVG9Qb3MoY20pO1xuICBjbS5jdXJPcC5zY3JvbGxUb3AgPSAoY20uY3VyT3Auc2Nyb2xsVG9wID09IG51bGwgPyBjbS5kb2Muc2Nyb2xsVG9wIDogY20uY3VyT3Auc2Nyb2xsVG9wKSArIHRvcDtcbn1cblxuLy8gTWFrZSBzdXJlIHRoYXQgYXQgdGhlIGVuZCBvZiB0aGUgb3BlcmF0aW9uIHRoZSBjdXJyZW50IGN1cnNvciBpc1xuLy8gc2hvd24uXG5mdW5jdGlvbiBlbnN1cmVDdXJzb3JWaXNpYmxlKGNtKSB7XG4gIHJlc29sdmVTY3JvbGxUb1BvcyhjbSk7XG4gIHZhciBjdXIgPSBjbS5nZXRDdXJzb3IoKSwgZnJvbSA9IGN1ciwgdG8gPSBjdXI7XG4gIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICBmcm9tID0gY3VyLmNoID8gUG9zKGN1ci5saW5lLCBjdXIuY2ggLSAxKSA6IGN1cjtcbiAgICB0byA9IFBvcyhjdXIubGluZSwgY3VyLmNoICsgMSk7XG4gIH1cbiAgY20uY3VyT3Auc2Nyb2xsVG9Qb3MgPSB7ZnJvbTogZnJvbSwgdG86IHRvLCBtYXJnaW46IGNtLm9wdGlvbnMuY3Vyc29yU2Nyb2xsTWFyZ2lufTtcbn1cblxuZnVuY3Rpb24gc2Nyb2xsVG9Db29yZHMoY20sIHgsIHkpIHtcbiAgaWYgKHggIT0gbnVsbCB8fCB5ICE9IG51bGwpIHsgcmVzb2x2ZVNjcm9sbFRvUG9zKGNtKTsgfVxuICBpZiAoeCAhPSBudWxsKSB7IGNtLmN1ck9wLnNjcm9sbExlZnQgPSB4OyB9XG4gIGlmICh5ICE9IG51bGwpIHsgY20uY3VyT3Auc2Nyb2xsVG9wID0geTsgfVxufVxuXG5mdW5jdGlvbiBzY3JvbGxUb1JhbmdlKGNtLCByYW5nZSQkMSkge1xuICByZXNvbHZlU2Nyb2xsVG9Qb3MoY20pO1xuICBjbS5jdXJPcC5zY3JvbGxUb1BvcyA9IHJhbmdlJCQxO1xufVxuXG4vLyBXaGVuIGFuIG9wZXJhdGlvbiBoYXMgaXRzIHNjcm9sbFRvUG9zIHByb3BlcnR5IHNldCwgYW5kIGFub3RoZXJcbi8vIHNjcm9sbCBhY3Rpb24gaXMgYXBwbGllZCBiZWZvcmUgdGhlIGVuZCBvZiB0aGUgb3BlcmF0aW9uLCB0aGlzXG4vLyAnc2ltdWxhdGVzJyBzY3JvbGxpbmcgdGhhdCBwb3NpdGlvbiBpbnRvIHZpZXcgaW4gYSBjaGVhcCB3YXksIHNvXG4vLyB0aGF0IHRoZSBlZmZlY3Qgb2YgaW50ZXJtZWRpYXRlIHNjcm9sbCBjb21tYW5kcyBpcyBub3QgaWdub3JlZC5cbmZ1bmN0aW9uIHJlc29sdmVTY3JvbGxUb1BvcyhjbSkge1xuICB2YXIgcmFuZ2UkJDEgPSBjbS5jdXJPcC5zY3JvbGxUb1BvcztcbiAgaWYgKHJhbmdlJCQxKSB7XG4gICAgY20uY3VyT3Auc2Nyb2xsVG9Qb3MgPSBudWxsO1xuICAgIHZhciBmcm9tID0gZXN0aW1hdGVDb29yZHMoY20sIHJhbmdlJCQxLmZyb20pLCB0byA9IGVzdGltYXRlQ29vcmRzKGNtLCByYW5nZSQkMS50byk7XG4gICAgc2Nyb2xsVG9Db29yZHNSYW5nZShjbSwgZnJvbSwgdG8sIHJhbmdlJCQxLm1hcmdpbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2Nyb2xsVG9Db29yZHNSYW5nZShjbSwgZnJvbSwgdG8sIG1hcmdpbikge1xuICB2YXIgc1BvcyA9IGNhbGN1bGF0ZVNjcm9sbFBvcyhjbSwge1xuICAgIGxlZnQ6IE1hdGgubWluKGZyb20ubGVmdCwgdG8ubGVmdCksXG4gICAgdG9wOiBNYXRoLm1pbihmcm9tLnRvcCwgdG8udG9wKSAtIG1hcmdpbixcbiAgICByaWdodDogTWF0aC5tYXgoZnJvbS5yaWdodCwgdG8ucmlnaHQpLFxuICAgIGJvdHRvbTogTWF0aC5tYXgoZnJvbS5ib3R0b20sIHRvLmJvdHRvbSkgKyBtYXJnaW5cbiAgfSk7XG4gIHNjcm9sbFRvQ29vcmRzKGNtLCBzUG9zLnNjcm9sbExlZnQsIHNQb3Muc2Nyb2xsVG9wKTtcbn1cblxuLy8gU3luYyB0aGUgc2Nyb2xsYWJsZSBhcmVhIGFuZCBzY3JvbGxiYXJzLCBlbnN1cmUgdGhlIHZpZXdwb3J0XG4vLyBjb3ZlcnMgdGhlIHZpc2libGUgYXJlYS5cbmZ1bmN0aW9uIHVwZGF0ZVNjcm9sbFRvcChjbSwgdmFsKSB7XG4gIGlmIChNYXRoLmFicyhjbS5kb2Muc2Nyb2xsVG9wIC0gdmFsKSA8IDIpIHsgcmV0dXJuIH1cbiAgaWYgKCFnZWNrbykgeyB1cGRhdGVEaXNwbGF5U2ltcGxlKGNtLCB7dG9wOiB2YWx9KTsgfVxuICBzZXRTY3JvbGxUb3AoY20sIHZhbCwgdHJ1ZSk7XG4gIGlmIChnZWNrbykgeyB1cGRhdGVEaXNwbGF5U2ltcGxlKGNtKTsgfVxuICBzdGFydFdvcmtlcihjbSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gc2V0U2Nyb2xsVG9wKGNtLCB2YWwsIGZvcmNlU2Nyb2xsKSB7XG4gIHZhbCA9IE1hdGgubWluKGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsSGVpZ2h0IC0gY20uZGlzcGxheS5zY3JvbGxlci5jbGllbnRIZWlnaHQsIHZhbCk7XG4gIGlmIChjbS5kaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCA9PSB2YWwgJiYgIWZvcmNlU2Nyb2xsKSB7IHJldHVybiB9XG4gIGNtLmRvYy5zY3JvbGxUb3AgPSB2YWw7XG4gIGNtLmRpc3BsYXkuc2Nyb2xsYmFycy5zZXRTY3JvbGxUb3AodmFsKTtcbiAgaWYgKGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wICE9IHZhbCkgeyBjbS5kaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCA9IHZhbDsgfVxufVxuXG4vLyBTeW5jIHNjcm9sbGVyIGFuZCBzY3JvbGxiYXIsIGVuc3VyZSB0aGUgZ3V0dGVyIGVsZW1lbnRzIGFyZVxuLy8gYWxpZ25lZC5cbmZ1bmN0aW9uIHNldFNjcm9sbExlZnQoY20sIHZhbCwgaXNTY3JvbGxlciwgZm9yY2VTY3JvbGwpIHtcbiAgdmFsID0gTWF0aC5taW4odmFsLCBjbS5kaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFdpZHRoIC0gY20uZGlzcGxheS5zY3JvbGxlci5jbGllbnRXaWR0aCk7XG4gIGlmICgoaXNTY3JvbGxlciA/IHZhbCA9PSBjbS5kb2Muc2Nyb2xsTGVmdCA6IE1hdGguYWJzKGNtLmRvYy5zY3JvbGxMZWZ0IC0gdmFsKSA8IDIpICYmICFmb3JjZVNjcm9sbCkgeyByZXR1cm4gfVxuICBjbS5kb2Muc2Nyb2xsTGVmdCA9IHZhbDtcbiAgYWxpZ25Ib3Jpem9udGFsbHkoY20pO1xuICBpZiAoY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ICE9IHZhbCkgeyBjbS5kaXNwbGF5LnNjcm9sbGVyLnNjcm9sbExlZnQgPSB2YWw7IH1cbiAgY20uZGlzcGxheS5zY3JvbGxiYXJzLnNldFNjcm9sbExlZnQodmFsKTtcbn1cblxuLy8gU0NST0xMQkFSU1xuXG4vLyBQcmVwYXJlIERPTSByZWFkcyBuZWVkZWQgdG8gdXBkYXRlIHRoZSBzY3JvbGxiYXJzLiBEb25lIGluIG9uZVxuLy8gc2hvdCB0byBtaW5pbWl6ZSB1cGRhdGUvbWVhc3VyZSByb3VuZHRyaXBzLlxuZnVuY3Rpb24gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pIHtcbiAgdmFyIGQgPSBjbS5kaXNwbGF5LCBndXR0ZXJXID0gZC5ndXR0ZXJzLm9mZnNldFdpZHRoO1xuICB2YXIgZG9jSCA9IE1hdGgucm91bmQoY20uZG9jLmhlaWdodCArIHBhZGRpbmdWZXJ0KGNtLmRpc3BsYXkpKTtcbiAgcmV0dXJuIHtcbiAgICBjbGllbnRIZWlnaHQ6IGQuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0LFxuICAgIHZpZXdIZWlnaHQ6IGQud3JhcHBlci5jbGllbnRIZWlnaHQsXG4gICAgc2Nyb2xsV2lkdGg6IGQuc2Nyb2xsZXIuc2Nyb2xsV2lkdGgsIGNsaWVudFdpZHRoOiBkLnNjcm9sbGVyLmNsaWVudFdpZHRoLFxuICAgIHZpZXdXaWR0aDogZC53cmFwcGVyLmNsaWVudFdpZHRoLFxuICAgIGJhckxlZnQ6IGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIgPyBndXR0ZXJXIDogMCxcbiAgICBkb2NIZWlnaHQ6IGRvY0gsXG4gICAgc2Nyb2xsSGVpZ2h0OiBkb2NIICsgc2Nyb2xsR2FwKGNtKSArIGQuYmFySGVpZ2h0LFxuICAgIG5hdGl2ZUJhcldpZHRoOiBkLm5hdGl2ZUJhcldpZHRoLFxuICAgIGd1dHRlcldpZHRoOiBndXR0ZXJXXG4gIH1cbn1cblxudmFyIE5hdGl2ZVNjcm9sbGJhcnMgPSBmdW5jdGlvbihwbGFjZSwgc2Nyb2xsLCBjbSkge1xuICB0aGlzLmNtID0gY207XG4gIHZhciB2ZXJ0ID0gdGhpcy52ZXJ0ID0gZWx0KFwiZGl2XCIsIFtlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJtaW4td2lkdGg6IDFweFwiKV0sIFwiQ29kZU1pcnJvci12c2Nyb2xsYmFyXCIpO1xuICB2YXIgaG9yaXogPSB0aGlzLmhvcml6ID0gZWx0KFwiZGl2XCIsIFtlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJoZWlnaHQ6IDEwMCU7IG1pbi1oZWlnaHQ6IDFweFwiKV0sIFwiQ29kZU1pcnJvci1oc2Nyb2xsYmFyXCIpO1xuICBwbGFjZSh2ZXJ0KTsgcGxhY2UoaG9yaXopO1xuXG4gIG9uKHZlcnQsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodmVydC5jbGllbnRIZWlnaHQpIHsgc2Nyb2xsKHZlcnQuc2Nyb2xsVG9wLCBcInZlcnRpY2FsXCIpOyB9XG4gIH0pO1xuICBvbihob3JpeiwgXCJzY3JvbGxcIiwgZnVuY3Rpb24gKCkge1xuICAgIGlmIChob3Jpei5jbGllbnRXaWR0aCkgeyBzY3JvbGwoaG9yaXouc2Nyb2xsTGVmdCwgXCJob3Jpem9udGFsXCIpOyB9XG4gIH0pO1xuXG4gIHRoaXMuY2hlY2tlZFplcm9XaWR0aCA9IGZhbHNlO1xuICAvLyBOZWVkIHRvIHNldCBhIG1pbmltdW0gd2lkdGggdG8gc2VlIHRoZSBzY3JvbGxiYXIgb24gSUU3IChidXQgbXVzdCBub3Qgc2V0IGl0IG9uIElFOCkuXG4gIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgOCkgeyB0aGlzLmhvcml6LnN0eWxlLm1pbkhlaWdodCA9IHRoaXMudmVydC5zdHlsZS5taW5XaWR0aCA9IFwiMThweFwiOyB9XG59O1xuXG5OYXRpdmVTY3JvbGxiYXJzLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAobWVhc3VyZSkge1xuICB2YXIgbmVlZHNIID0gbWVhc3VyZS5zY3JvbGxXaWR0aCA+IG1lYXN1cmUuY2xpZW50V2lkdGggKyAxO1xuICB2YXIgbmVlZHNWID0gbWVhc3VyZS5zY3JvbGxIZWlnaHQgPiBtZWFzdXJlLmNsaWVudEhlaWdodCArIDE7XG4gIHZhciBzV2lkdGggPSBtZWFzdXJlLm5hdGl2ZUJhcldpZHRoO1xuXG4gIGlmIChuZWVkc1YpIHtcbiAgICB0aGlzLnZlcnQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB0aGlzLnZlcnQuc3R5bGUuYm90dG9tID0gbmVlZHNIID8gc1dpZHRoICsgXCJweFwiIDogXCIwXCI7XG4gICAgdmFyIHRvdGFsSGVpZ2h0ID0gbWVhc3VyZS52aWV3SGVpZ2h0IC0gKG5lZWRzSCA/IHNXaWR0aCA6IDApO1xuICAgIC8vIEEgYnVnIGluIElFOCBjYW4gY2F1c2UgdGhpcyB2YWx1ZSB0byBiZSBuZWdhdGl2ZSwgc28gZ3VhcmQgaXQuXG4gICAgdGhpcy52ZXJ0LmZpcnN0Q2hpbGQuc3R5bGUuaGVpZ2h0ID1cbiAgICAgIE1hdGgubWF4KDAsIG1lYXN1cmUuc2Nyb2xsSGVpZ2h0IC0gbWVhc3VyZS5jbGllbnRIZWlnaHQgKyB0b3RhbEhlaWdodCkgKyBcInB4XCI7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy52ZXJ0LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIHRoaXMudmVydC5maXJzdENoaWxkLnN0eWxlLmhlaWdodCA9IFwiMFwiO1xuICB9XG5cbiAgaWYgKG5lZWRzSCkge1xuICAgIHRoaXMuaG9yaXouc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB0aGlzLmhvcml6LnN0eWxlLnJpZ2h0ID0gbmVlZHNWID8gc1dpZHRoICsgXCJweFwiIDogXCIwXCI7XG4gICAgdGhpcy5ob3Jpei5zdHlsZS5sZWZ0ID0gbWVhc3VyZS5iYXJMZWZ0ICsgXCJweFwiO1xuICAgIHZhciB0b3RhbFdpZHRoID0gbWVhc3VyZS52aWV3V2lkdGggLSBtZWFzdXJlLmJhckxlZnQgLSAobmVlZHNWID8gc1dpZHRoIDogMCk7XG4gICAgdGhpcy5ob3Jpei5maXJzdENoaWxkLnN0eWxlLndpZHRoID1cbiAgICAgIE1hdGgubWF4KDAsIG1lYXN1cmUuc2Nyb2xsV2lkdGggLSBtZWFzdXJlLmNsaWVudFdpZHRoICsgdG90YWxXaWR0aCkgKyBcInB4XCI7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5ob3Jpei5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICB0aGlzLmhvcml6LmZpcnN0Q2hpbGQuc3R5bGUud2lkdGggPSBcIjBcIjtcbiAgfVxuXG4gIGlmICghdGhpcy5jaGVja2VkWmVyb1dpZHRoICYmIG1lYXN1cmUuY2xpZW50SGVpZ2h0ID4gMCkge1xuICAgIGlmIChzV2lkdGggPT0gMCkgeyB0aGlzLnplcm9XaWR0aEhhY2soKTsgfVxuICAgIHRoaXMuY2hlY2tlZFplcm9XaWR0aCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4ge3JpZ2h0OiBuZWVkc1YgPyBzV2lkdGggOiAwLCBib3R0b206IG5lZWRzSCA/IHNXaWR0aCA6IDB9XG59O1xuXG5OYXRpdmVTY3JvbGxiYXJzLnByb3RvdHlwZS5zZXRTY3JvbGxMZWZ0ID0gZnVuY3Rpb24gKHBvcykge1xuICBpZiAodGhpcy5ob3Jpei5zY3JvbGxMZWZ0ICE9IHBvcykgeyB0aGlzLmhvcml6LnNjcm9sbExlZnQgPSBwb3M7IH1cbiAgaWYgKHRoaXMuZGlzYWJsZUhvcml6KSB7IHRoaXMuZW5hYmxlWmVyb1dpZHRoQmFyKHRoaXMuaG9yaXosIHRoaXMuZGlzYWJsZUhvcml6LCBcImhvcml6XCIpOyB9XG59O1xuXG5OYXRpdmVTY3JvbGxiYXJzLnByb3RvdHlwZS5zZXRTY3JvbGxUb3AgPSBmdW5jdGlvbiAocG9zKSB7XG4gIGlmICh0aGlzLnZlcnQuc2Nyb2xsVG9wICE9IHBvcykgeyB0aGlzLnZlcnQuc2Nyb2xsVG9wID0gcG9zOyB9XG4gIGlmICh0aGlzLmRpc2FibGVWZXJ0KSB7IHRoaXMuZW5hYmxlWmVyb1dpZHRoQmFyKHRoaXMudmVydCwgdGhpcy5kaXNhYmxlVmVydCwgXCJ2ZXJ0XCIpOyB9XG59O1xuXG5OYXRpdmVTY3JvbGxiYXJzLnByb3RvdHlwZS56ZXJvV2lkdGhIYWNrID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdyA9IG1hYyAmJiAhbWFjX2dlTW91bnRhaW5MaW9uID8gXCIxMnB4XCIgOiBcIjE4cHhcIjtcbiAgdGhpcy5ob3Jpei5zdHlsZS5oZWlnaHQgPSB0aGlzLnZlcnQuc3R5bGUud2lkdGggPSB3O1xuICB0aGlzLmhvcml6LnN0eWxlLnBvaW50ZXJFdmVudHMgPSB0aGlzLnZlcnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICB0aGlzLmRpc2FibGVIb3JpeiA9IG5ldyBEZWxheWVkO1xuICB0aGlzLmRpc2FibGVWZXJ0ID0gbmV3IERlbGF5ZWQ7XG59O1xuXG5OYXRpdmVTY3JvbGxiYXJzLnByb3RvdHlwZS5lbmFibGVaZXJvV2lkdGhCYXIgPSBmdW5jdGlvbiAoYmFyLCBkZWxheSwgdHlwZSkge1xuICBiYXIuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwiYXV0b1wiO1xuICBmdW5jdGlvbiBtYXliZURpc2FibGUoKSB7XG4gICAgLy8gVG8gZmluZCBvdXQgd2hldGhlciB0aGUgc2Nyb2xsYmFyIGlzIHN0aWxsIHZpc2libGUsIHdlXG4gICAgLy8gY2hlY2sgd2hldGhlciB0aGUgZWxlbWVudCB1bmRlciB0aGUgcGl4ZWwgaW4gdGhlIGJvdHRvbVxuICAgIC8vIHJpZ2h0IGNvcm5lciBvZiB0aGUgc2Nyb2xsYmFyIGJveCBpcyB0aGUgc2Nyb2xsYmFyIGJveFxuICAgIC8vIGl0c2VsZiAod2hlbiB0aGUgYmFyIGlzIHN0aWxsIHZpc2libGUpIG9yIGl0cyBmaWxsZXIgY2hpbGRcbiAgICAvLyAod2hlbiB0aGUgYmFyIGlzIGhpZGRlbikuIElmIGl0IGlzIHN0aWxsIHZpc2libGUsIHdlIGtlZXBcbiAgICAvLyBpdCBlbmFibGVkLCBpZiBpdCdzIGhpZGRlbiwgd2UgZGlzYWJsZSBwb2ludGVyIGV2ZW50cy5cbiAgICB2YXIgYm94ID0gYmFyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHZhciBlbHQkJDEgPSB0eXBlID09IFwidmVydFwiID8gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChib3gucmlnaHQgLSAxLCAoYm94LnRvcCArIGJveC5ib3R0b20pIC8gMilcbiAgICAgICAgOiBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KChib3gucmlnaHQgKyBib3gubGVmdCkgLyAyLCBib3guYm90dG9tIC0gMSk7XG4gICAgaWYgKGVsdCQkMSAhPSBiYXIpIHsgYmFyLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcIm5vbmVcIjsgfVxuICAgIGVsc2UgeyBkZWxheS5zZXQoMTAwMCwgbWF5YmVEaXNhYmxlKTsgfVxuICB9XG4gIGRlbGF5LnNldCgxMDAwLCBtYXliZURpc2FibGUpO1xufTtcblxuTmF0aXZlU2Nyb2xsYmFycy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzLmhvcml6LnBhcmVudE5vZGU7XG4gIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzLmhvcml6KTtcbiAgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMudmVydCk7XG59O1xuXG52YXIgTnVsbFNjcm9sbGJhcnMgPSBmdW5jdGlvbiAoKSB7fTtcblxuTnVsbFNjcm9sbGJhcnMucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHtib3R0b206IDAsIHJpZ2h0OiAwfSB9O1xuTnVsbFNjcm9sbGJhcnMucHJvdG90eXBlLnNldFNjcm9sbExlZnQgPSBmdW5jdGlvbiAoKSB7fTtcbk51bGxTY3JvbGxiYXJzLnByb3RvdHlwZS5zZXRTY3JvbGxUb3AgPSBmdW5jdGlvbiAoKSB7fTtcbk51bGxTY3JvbGxiYXJzLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHt9O1xuXG5mdW5jdGlvbiB1cGRhdGVTY3JvbGxiYXJzKGNtLCBtZWFzdXJlKSB7XG4gIGlmICghbWVhc3VyZSkgeyBtZWFzdXJlID0gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pOyB9XG4gIHZhciBzdGFydFdpZHRoID0gY20uZGlzcGxheS5iYXJXaWR0aCwgc3RhcnRIZWlnaHQgPSBjbS5kaXNwbGF5LmJhckhlaWdodDtcbiAgdXBkYXRlU2Nyb2xsYmFyc0lubmVyKGNtLCBtZWFzdXJlKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCA0ICYmIHN0YXJ0V2lkdGggIT0gY20uZGlzcGxheS5iYXJXaWR0aCB8fCBzdGFydEhlaWdodCAhPSBjbS5kaXNwbGF5LmJhckhlaWdodDsgaSsrKSB7XG4gICAgaWYgKHN0YXJ0V2lkdGggIT0gY20uZGlzcGxheS5iYXJXaWR0aCAmJiBjbS5vcHRpb25zLmxpbmVXcmFwcGluZylcbiAgICAgIHsgdXBkYXRlSGVpZ2h0c0luVmlld3BvcnQoY20pOyB9XG4gICAgdXBkYXRlU2Nyb2xsYmFyc0lubmVyKGNtLCBtZWFzdXJlRm9yU2Nyb2xsYmFycyhjbSkpO1xuICAgIHN0YXJ0V2lkdGggPSBjbS5kaXNwbGF5LmJhcldpZHRoOyBzdGFydEhlaWdodCA9IGNtLmRpc3BsYXkuYmFySGVpZ2h0O1xuICB9XG59XG5cbi8vIFJlLXN5bmNocm9uaXplIHRoZSBmYWtlIHNjcm9sbGJhcnMgd2l0aCB0aGUgYWN0dWFsIHNpemUgb2YgdGhlXG4vLyBjb250ZW50LlxuZnVuY3Rpb24gdXBkYXRlU2Nyb2xsYmFyc0lubmVyKGNtLCBtZWFzdXJlKSB7XG4gIHZhciBkID0gY20uZGlzcGxheTtcbiAgdmFyIHNpemVzID0gZC5zY3JvbGxiYXJzLnVwZGF0ZShtZWFzdXJlKTtcblxuICBkLnNpemVyLnN0eWxlLnBhZGRpbmdSaWdodCA9IChkLmJhcldpZHRoID0gc2l6ZXMucmlnaHQpICsgXCJweFwiO1xuICBkLnNpemVyLnN0eWxlLnBhZGRpbmdCb3R0b20gPSAoZC5iYXJIZWlnaHQgPSBzaXplcy5ib3R0b20pICsgXCJweFwiO1xuICBkLmhlaWdodEZvcmNlci5zdHlsZS5ib3JkZXJCb3R0b20gPSBzaXplcy5ib3R0b20gKyBcInB4IHNvbGlkIHRyYW5zcGFyZW50XCI7XG5cbiAgaWYgKHNpemVzLnJpZ2h0ICYmIHNpemVzLmJvdHRvbSkge1xuICAgIGQuc2Nyb2xsYmFyRmlsbGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgZC5zY3JvbGxiYXJGaWxsZXIuc3R5bGUuaGVpZ2h0ID0gc2l6ZXMuYm90dG9tICsgXCJweFwiO1xuICAgIGQuc2Nyb2xsYmFyRmlsbGVyLnN0eWxlLndpZHRoID0gc2l6ZXMucmlnaHQgKyBcInB4XCI7XG4gIH0gZWxzZSB7IGQuc2Nyb2xsYmFyRmlsbGVyLnN0eWxlLmRpc3BsYXkgPSBcIlwiOyB9XG4gIGlmIChzaXplcy5ib3R0b20gJiYgY20ub3B0aW9ucy5jb3Zlckd1dHRlck5leHRUb1Njcm9sbGJhciAmJiBjbS5vcHRpb25zLmZpeGVkR3V0dGVyKSB7XG4gICAgZC5ndXR0ZXJGaWxsZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBkLmd1dHRlckZpbGxlci5zdHlsZS5oZWlnaHQgPSBzaXplcy5ib3R0b20gKyBcInB4XCI7XG4gICAgZC5ndXR0ZXJGaWxsZXIuc3R5bGUud2lkdGggPSBtZWFzdXJlLmd1dHRlcldpZHRoICsgXCJweFwiO1xuICB9IGVsc2UgeyBkLmd1dHRlckZpbGxlci5zdHlsZS5kaXNwbGF5ID0gXCJcIjsgfVxufVxuXG52YXIgc2Nyb2xsYmFyTW9kZWwgPSB7XCJuYXRpdmVcIjogTmF0aXZlU2Nyb2xsYmFycywgXCJudWxsXCI6IE51bGxTY3JvbGxiYXJzfTtcblxuZnVuY3Rpb24gaW5pdFNjcm9sbGJhcnMoY20pIHtcbiAgaWYgKGNtLmRpc3BsYXkuc2Nyb2xsYmFycykge1xuICAgIGNtLmRpc3BsYXkuc2Nyb2xsYmFycy5jbGVhcigpO1xuICAgIGlmIChjbS5kaXNwbGF5LnNjcm9sbGJhcnMuYWRkQ2xhc3MpXG4gICAgICB7IHJtQ2xhc3MoY20uZGlzcGxheS53cmFwcGVyLCBjbS5kaXNwbGF5LnNjcm9sbGJhcnMuYWRkQ2xhc3MpOyB9XG4gIH1cblxuICBjbS5kaXNwbGF5LnNjcm9sbGJhcnMgPSBuZXcgc2Nyb2xsYmFyTW9kZWxbY20ub3B0aW9ucy5zY3JvbGxiYXJTdHlsZV0oZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBjbS5kaXNwbGF5LndyYXBwZXIuaW5zZXJ0QmVmb3JlKG5vZGUsIGNtLmRpc3BsYXkuc2Nyb2xsYmFyRmlsbGVyKTtcbiAgICAvLyBQcmV2ZW50IGNsaWNrcyBpbiB0aGUgc2Nyb2xsYmFycyBmcm9tIGtpbGxpbmcgZm9jdXNcbiAgICBvbihub2RlLCBcIm1vdXNlZG93blwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoY20uc3RhdGUuZm9jdXNlZCkgeyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNtLmRpc3BsYXkuaW5wdXQuZm9jdXMoKTsgfSwgMCk7IH1cbiAgICB9KTtcbiAgICBub2RlLnNldEF0dHJpYnV0ZShcImNtLW5vdC1jb250ZW50XCIsIFwidHJ1ZVwiKTtcbiAgfSwgZnVuY3Rpb24gKHBvcywgYXhpcykge1xuICAgIGlmIChheGlzID09IFwiaG9yaXpvbnRhbFwiKSB7IHNldFNjcm9sbExlZnQoY20sIHBvcyk7IH1cbiAgICBlbHNlIHsgdXBkYXRlU2Nyb2xsVG9wKGNtLCBwb3MpOyB9XG4gIH0sIGNtKTtcbiAgaWYgKGNtLmRpc3BsYXkuc2Nyb2xsYmFycy5hZGRDbGFzcylcbiAgICB7IGFkZENsYXNzKGNtLmRpc3BsYXkud3JhcHBlciwgY20uZGlzcGxheS5zY3JvbGxiYXJzLmFkZENsYXNzKTsgfVxufVxuXG4vLyBPcGVyYXRpb25zIGFyZSB1c2VkIHRvIHdyYXAgYSBzZXJpZXMgb2YgY2hhbmdlcyB0byB0aGUgZWRpdG9yXG4vLyBzdGF0ZSBpbiBzdWNoIGEgd2F5IHRoYXQgZWFjaCBjaGFuZ2Ugd29uJ3QgaGF2ZSB0byB1cGRhdGUgdGhlXG4vLyBjdXJzb3IgYW5kIGRpc3BsYXkgKHdoaWNoIHdvdWxkIGJlIGF3a3dhcmQsIHNsb3csIGFuZFxuLy8gZXJyb3ItcHJvbmUpLiBJbnN0ZWFkLCBkaXNwbGF5IHVwZGF0ZXMgYXJlIGJhdGNoZWQgYW5kIHRoZW4gYWxsXG4vLyBjb21iaW5lZCBhbmQgZXhlY3V0ZWQgYXQgb25jZS5cblxudmFyIG5leHRPcElkID0gMDtcbi8vIFN0YXJ0IGEgbmV3IG9wZXJhdGlvbi5cbmZ1bmN0aW9uIHN0YXJ0T3BlcmF0aW9uKGNtKSB7XG4gIGNtLmN1ck9wID0ge1xuICAgIGNtOiBjbSxcbiAgICB2aWV3Q2hhbmdlZDogZmFsc2UsICAgICAgLy8gRmxhZyB0aGF0IGluZGljYXRlcyB0aGF0IGxpbmVzIG1pZ2h0IG5lZWQgdG8gYmUgcmVkcmF3blxuICAgIHN0YXJ0SGVpZ2h0OiBjbS5kb2MuaGVpZ2h0LCAvLyBVc2VkIHRvIGRldGVjdCBuZWVkIHRvIHVwZGF0ZSBzY3JvbGxiYXJcbiAgICBmb3JjZVVwZGF0ZTogZmFsc2UsICAgICAgLy8gVXNlZCB0byBmb3JjZSBhIHJlZHJhd1xuICAgIHVwZGF0ZUlucHV0OiBudWxsLCAgICAgICAvLyBXaGV0aGVyIHRvIHJlc2V0IHRoZSBpbnB1dCB0ZXh0YXJlYVxuICAgIHR5cGluZzogZmFsc2UsICAgICAgICAgICAvLyBXaGV0aGVyIHRoaXMgcmVzZXQgc2hvdWxkIGJlIGNhcmVmdWwgdG8gbGVhdmUgZXhpc3RpbmcgdGV4dCAoZm9yIGNvbXBvc2l0aW5nKVxuICAgIGNoYW5nZU9ianM6IG51bGwsICAgICAgICAvLyBBY2N1bXVsYXRlZCBjaGFuZ2VzLCBmb3IgZmlyaW5nIGNoYW5nZSBldmVudHNcbiAgICBjdXJzb3JBY3Rpdml0eUhhbmRsZXJzOiBudWxsLCAvLyBTZXQgb2YgaGFuZGxlcnMgdG8gZmlyZSBjdXJzb3JBY3Rpdml0eSBvblxuICAgIGN1cnNvckFjdGl2aXR5Q2FsbGVkOiAwLCAvLyBUcmFja3Mgd2hpY2ggY3Vyc29yQWN0aXZpdHkgaGFuZGxlcnMgaGF2ZSBiZWVuIGNhbGxlZCBhbHJlYWR5XG4gICAgc2VsZWN0aW9uQ2hhbmdlZDogZmFsc2UsIC8vIFdoZXRoZXIgdGhlIHNlbGVjdGlvbiBuZWVkcyB0byBiZSByZWRyYXduXG4gICAgdXBkYXRlTWF4TGluZTogZmFsc2UsICAgIC8vIFNldCB3aGVuIHRoZSB3aWRlc3QgbGluZSBuZWVkcyB0byBiZSBkZXRlcm1pbmVkIGFuZXdcbiAgICBzY3JvbGxMZWZ0OiBudWxsLCBzY3JvbGxUb3A6IG51bGwsIC8vIEludGVybWVkaWF0ZSBzY3JvbGwgcG9zaXRpb24sIG5vdCBwdXNoZWQgdG8gRE9NIHlldFxuICAgIHNjcm9sbFRvUG9zOiBudWxsLCAgICAgICAvLyBVc2VkIHRvIHNjcm9sbCB0byBhIHNwZWNpZmljIHBvc2l0aW9uXG4gICAgZm9jdXM6IGZhbHNlLFxuICAgIGlkOiArK25leHRPcElkICAgICAgICAgICAvLyBVbmlxdWUgSURcbiAgfTtcbiAgcHVzaE9wZXJhdGlvbihjbS5jdXJPcCk7XG59XG5cbi8vIEZpbmlzaCBhbiBvcGVyYXRpb24sIHVwZGF0aW5nIHRoZSBkaXNwbGF5IGFuZCBzaWduYWxsaW5nIGRlbGF5ZWQgZXZlbnRzXG5mdW5jdGlvbiBlbmRPcGVyYXRpb24oY20pIHtcbiAgdmFyIG9wID0gY20uY3VyT3A7XG4gIGZpbmlzaE9wZXJhdGlvbihvcCwgZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cC5vcHMubGVuZ3RoOyBpKyspXG4gICAgICB7IGdyb3VwLm9wc1tpXS5jbS5jdXJPcCA9IG51bGw7IH1cbiAgICBlbmRPcGVyYXRpb25zKGdyb3VwKTtcbiAgfSk7XG59XG5cbi8vIFRoZSBET00gdXBkYXRlcyBkb25lIHdoZW4gYW4gb3BlcmF0aW9uIGZpbmlzaGVzIGFyZSBiYXRjaGVkIHNvXG4vLyB0aGF0IHRoZSBtaW5pbXVtIG51bWJlciBvZiByZWxheW91dHMgYXJlIHJlcXVpcmVkLlxuZnVuY3Rpb24gZW5kT3BlcmF0aW9ucyhncm91cCkge1xuICB2YXIgb3BzID0gZ3JvdXAub3BzO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykgLy8gUmVhZCBET01cbiAgICB7IGVuZE9wZXJhdGlvbl9SMShvcHNbaV0pOyB9XG4gIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IG9wcy5sZW5ndGg7IGkkMSsrKSAvLyBXcml0ZSBET00gKG1heWJlKVxuICAgIHsgZW5kT3BlcmF0aW9uX1cxKG9wc1tpJDFdKTsgfVxuICBmb3IgKHZhciBpJDIgPSAwOyBpJDIgPCBvcHMubGVuZ3RoOyBpJDIrKykgLy8gUmVhZCBET01cbiAgICB7IGVuZE9wZXJhdGlvbl9SMihvcHNbaSQyXSk7IH1cbiAgZm9yICh2YXIgaSQzID0gMDsgaSQzIDwgb3BzLmxlbmd0aDsgaSQzKyspIC8vIFdyaXRlIERPTSAobWF5YmUpXG4gICAgeyBlbmRPcGVyYXRpb25fVzIob3BzW2kkM10pOyB9XG4gIGZvciAodmFyIGkkNCA9IDA7IGkkNCA8IG9wcy5sZW5ndGg7IGkkNCsrKSAvLyBSZWFkIERPTVxuICAgIHsgZW5kT3BlcmF0aW9uX2ZpbmlzaChvcHNbaSQ0XSk7IH1cbn1cblxuZnVuY3Rpb24gZW5kT3BlcmF0aW9uX1IxKG9wKSB7XG4gIHZhciBjbSA9IG9wLmNtLCBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgbWF5YmVDbGlwU2Nyb2xsYmFycyhjbSk7XG4gIGlmIChvcC51cGRhdGVNYXhMaW5lKSB7IGZpbmRNYXhMaW5lKGNtKTsgfVxuXG4gIG9wLm11c3RVcGRhdGUgPSBvcC52aWV3Q2hhbmdlZCB8fCBvcC5mb3JjZVVwZGF0ZSB8fCBvcC5zY3JvbGxUb3AgIT0gbnVsbCB8fFxuICAgIG9wLnNjcm9sbFRvUG9zICYmIChvcC5zY3JvbGxUb1Bvcy5mcm9tLmxpbmUgPCBkaXNwbGF5LnZpZXdGcm9tIHx8XG4gICAgICAgICAgICAgICAgICAgICAgIG9wLnNjcm9sbFRvUG9zLnRvLmxpbmUgPj0gZGlzcGxheS52aWV3VG8pIHx8XG4gICAgZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCAmJiBjbS5vcHRpb25zLmxpbmVXcmFwcGluZztcbiAgb3AudXBkYXRlID0gb3AubXVzdFVwZGF0ZSAmJlxuICAgIG5ldyBEaXNwbGF5VXBkYXRlKGNtLCBvcC5tdXN0VXBkYXRlICYmIHt0b3A6IG9wLnNjcm9sbFRvcCwgZW5zdXJlOiBvcC5zY3JvbGxUb1Bvc30sIG9wLmZvcmNlVXBkYXRlKTtcbn1cblxuZnVuY3Rpb24gZW5kT3BlcmF0aW9uX1cxKG9wKSB7XG4gIG9wLnVwZGF0ZWREaXNwbGF5ID0gb3AubXVzdFVwZGF0ZSAmJiB1cGRhdGVEaXNwbGF5SWZOZWVkZWQob3AuY20sIG9wLnVwZGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGVuZE9wZXJhdGlvbl9SMihvcCkge1xuICB2YXIgY20gPSBvcC5jbSwgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gIGlmIChvcC51cGRhdGVkRGlzcGxheSkgeyB1cGRhdGVIZWlnaHRzSW5WaWV3cG9ydChjbSk7IH1cblxuICBvcC5iYXJNZWFzdXJlID0gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pO1xuXG4gIC8vIElmIHRoZSBtYXggbGluZSBjaGFuZ2VkIHNpbmNlIGl0IHdhcyBsYXN0IG1lYXN1cmVkLCBtZWFzdXJlIGl0LFxuICAvLyBhbmQgZW5zdXJlIHRoZSBkb2N1bWVudCdzIHdpZHRoIG1hdGNoZXMgaXQuXG4gIC8vIHVwZGF0ZURpc3BsYXlfVzIgd2lsbCB1c2UgdGhlc2UgcHJvcGVydGllcyB0byBkbyB0aGUgYWN0dWFsIHJlc2l6aW5nXG4gIGlmIChkaXNwbGF5Lm1heExpbmVDaGFuZ2VkICYmICFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgIG9wLmFkanVzdFdpZHRoVG8gPSBtZWFzdXJlQ2hhcihjbSwgZGlzcGxheS5tYXhMaW5lLCBkaXNwbGF5Lm1heExpbmUudGV4dC5sZW5ndGgpLmxlZnQgKyAzO1xuICAgIGNtLmRpc3BsYXkuc2l6ZXJXaWR0aCA9IG9wLmFkanVzdFdpZHRoVG87XG4gICAgb3AuYmFyTWVhc3VyZS5zY3JvbGxXaWR0aCA9XG4gICAgICBNYXRoLm1heChkaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoLCBkaXNwbGF5LnNpemVyLm9mZnNldExlZnQgKyBvcC5hZGp1c3RXaWR0aFRvICsgc2Nyb2xsR2FwKGNtKSArIGNtLmRpc3BsYXkuYmFyV2lkdGgpO1xuICAgIG9wLm1heFNjcm9sbExlZnQgPSBNYXRoLm1heCgwLCBkaXNwbGF5LnNpemVyLm9mZnNldExlZnQgKyBvcC5hZGp1c3RXaWR0aFRvIC0gZGlzcGxheVdpZHRoKGNtKSk7XG4gIH1cblxuICBpZiAob3AudXBkYXRlZERpc3BsYXkgfHwgb3Auc2VsZWN0aW9uQ2hhbmdlZClcbiAgICB7IG9wLnByZXBhcmVkU2VsZWN0aW9uID0gZGlzcGxheS5pbnB1dC5wcmVwYXJlU2VsZWN0aW9uKG9wLmZvY3VzKTsgfVxufVxuXG5mdW5jdGlvbiBlbmRPcGVyYXRpb25fVzIob3ApIHtcbiAgdmFyIGNtID0gb3AuY207XG5cbiAgaWYgKG9wLmFkanVzdFdpZHRoVG8gIT0gbnVsbCkge1xuICAgIGNtLmRpc3BsYXkuc2l6ZXIuc3R5bGUubWluV2lkdGggPSBvcC5hZGp1c3RXaWR0aFRvICsgXCJweFwiO1xuICAgIGlmIChvcC5tYXhTY3JvbGxMZWZ0IDwgY20uZG9jLnNjcm9sbExlZnQpXG4gICAgICB7IHNldFNjcm9sbExlZnQoY20sIE1hdGgubWluKGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCwgb3AubWF4U2Nyb2xsTGVmdCksIHRydWUpOyB9XG4gICAgY20uZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCA9IGZhbHNlO1xuICB9XG5cbiAgdmFyIHRha2VGb2N1cyA9IG9wLmZvY3VzICYmIG9wLmZvY3VzID09IGFjdGl2ZUVsdCgpICYmICghZG9jdW1lbnQuaGFzRm9jdXMgfHwgZG9jdW1lbnQuaGFzRm9jdXMoKSk7XG4gIGlmIChvcC5wcmVwYXJlZFNlbGVjdGlvbilcbiAgICB7IGNtLmRpc3BsYXkuaW5wdXQuc2hvd1NlbGVjdGlvbihvcC5wcmVwYXJlZFNlbGVjdGlvbiwgdGFrZUZvY3VzKTsgfVxuICBpZiAob3AudXBkYXRlZERpc3BsYXkgfHwgb3Auc3RhcnRIZWlnaHQgIT0gY20uZG9jLmhlaWdodClcbiAgICB7IHVwZGF0ZVNjcm9sbGJhcnMoY20sIG9wLmJhck1lYXN1cmUpOyB9XG4gIGlmIChvcC51cGRhdGVkRGlzcGxheSlcbiAgICB7IHNldERvY3VtZW50SGVpZ2h0KGNtLCBvcC5iYXJNZWFzdXJlKTsgfVxuXG4gIGlmIChvcC5zZWxlY3Rpb25DaGFuZ2VkKSB7IHJlc3RhcnRCbGluayhjbSk7IH1cblxuICBpZiAoY20uc3RhdGUuZm9jdXNlZCAmJiBvcC51cGRhdGVJbnB1dClcbiAgICB7IGNtLmRpc3BsYXkuaW5wdXQucmVzZXQob3AudHlwaW5nKTsgfVxuICBpZiAodGFrZUZvY3VzKSB7IGVuc3VyZUZvY3VzKG9wLmNtKTsgfVxufVxuXG5mdW5jdGlvbiBlbmRPcGVyYXRpb25fZmluaXNoKG9wKSB7XG4gIHZhciBjbSA9IG9wLmNtLCBkaXNwbGF5ID0gY20uZGlzcGxheSwgZG9jID0gY20uZG9jO1xuXG4gIGlmIChvcC51cGRhdGVkRGlzcGxheSkgeyBwb3N0VXBkYXRlRGlzcGxheShjbSwgb3AudXBkYXRlKTsgfVxuXG4gIC8vIEFib3J0IG1vdXNlIHdoZWVsIGRlbHRhIG1lYXN1cmVtZW50LCB3aGVuIHNjcm9sbGluZyBleHBsaWNpdGx5XG4gIGlmIChkaXNwbGF5LndoZWVsU3RhcnRYICE9IG51bGwgJiYgKG9wLnNjcm9sbFRvcCAhPSBudWxsIHx8IG9wLnNjcm9sbExlZnQgIT0gbnVsbCB8fCBvcC5zY3JvbGxUb1BvcykpXG4gICAgeyBkaXNwbGF5LndoZWVsU3RhcnRYID0gZGlzcGxheS53aGVlbFN0YXJ0WSA9IG51bGw7IH1cblxuICAvLyBQcm9wYWdhdGUgdGhlIHNjcm9sbCBwb3NpdGlvbiB0byB0aGUgYWN0dWFsIERPTSBzY3JvbGxlclxuICBpZiAob3Auc2Nyb2xsVG9wICE9IG51bGwpIHsgc2V0U2Nyb2xsVG9wKGNtLCBvcC5zY3JvbGxUb3AsIG9wLmZvcmNlU2Nyb2xsKTsgfVxuXG4gIGlmIChvcC5zY3JvbGxMZWZ0ICE9IG51bGwpIHsgc2V0U2Nyb2xsTGVmdChjbSwgb3Auc2Nyb2xsTGVmdCwgdHJ1ZSwgdHJ1ZSk7IH1cbiAgLy8gSWYgd2UgbmVlZCB0byBzY3JvbGwgYSBzcGVjaWZpYyBwb3NpdGlvbiBpbnRvIHZpZXcsIGRvIHNvLlxuICBpZiAob3Auc2Nyb2xsVG9Qb3MpIHtcbiAgICB2YXIgcmVjdCA9IHNjcm9sbFBvc0ludG9WaWV3KGNtLCBjbGlwUG9zKGRvYywgb3Auc2Nyb2xsVG9Qb3MuZnJvbSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGlwUG9zKGRvYywgb3Auc2Nyb2xsVG9Qb3MudG8pLCBvcC5zY3JvbGxUb1Bvcy5tYXJnaW4pO1xuICAgIG1heWJlU2Nyb2xsV2luZG93KGNtLCByZWN0KTtcbiAgfVxuXG4gIC8vIEZpcmUgZXZlbnRzIGZvciBtYXJrZXJzIHRoYXQgYXJlIGhpZGRlbi91bmlkZGVuIGJ5IGVkaXRpbmcgb3JcbiAgLy8gdW5kb2luZ1xuICB2YXIgaGlkZGVuID0gb3AubWF5YmVIaWRkZW5NYXJrZXJzLCB1bmhpZGRlbiA9IG9wLm1heWJlVW5oaWRkZW5NYXJrZXJzO1xuICBpZiAoaGlkZGVuKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgaGlkZGVuLmxlbmd0aDsgKytpKVxuICAgIHsgaWYgKCFoaWRkZW5baV0ubGluZXMubGVuZ3RoKSB7IHNpZ25hbChoaWRkZW5baV0sIFwiaGlkZVwiKTsgfSB9IH1cbiAgaWYgKHVuaGlkZGVuKSB7IGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHVuaGlkZGVuLmxlbmd0aDsgKytpJDEpXG4gICAgeyBpZiAodW5oaWRkZW5baSQxXS5saW5lcy5sZW5ndGgpIHsgc2lnbmFsKHVuaGlkZGVuW2kkMV0sIFwidW5oaWRlXCIpOyB9IH0gfVxuXG4gIGlmIChkaXNwbGF5LndyYXBwZXIub2Zmc2V0SGVpZ2h0KVxuICAgIHsgZG9jLnNjcm9sbFRvcCA9IGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wOyB9XG5cbiAgLy8gRmlyZSBjaGFuZ2UgZXZlbnRzLCBhbmQgZGVsYXllZCBldmVudCBoYW5kbGVyc1xuICBpZiAob3AuY2hhbmdlT2JqcylcbiAgICB7IHNpZ25hbChjbSwgXCJjaGFuZ2VzXCIsIGNtLCBvcC5jaGFuZ2VPYmpzKTsgfVxuICBpZiAob3AudXBkYXRlKVxuICAgIHsgb3AudXBkYXRlLmZpbmlzaCgpOyB9XG59XG5cbi8vIFJ1biB0aGUgZ2l2ZW4gZnVuY3Rpb24gaW4gYW4gb3BlcmF0aW9uXG5mdW5jdGlvbiBydW5Jbk9wKGNtLCBmKSB7XG4gIGlmIChjbS5jdXJPcCkgeyByZXR1cm4gZigpIH1cbiAgc3RhcnRPcGVyYXRpb24oY20pO1xuICB0cnkgeyByZXR1cm4gZigpIH1cbiAgZmluYWxseSB7IGVuZE9wZXJhdGlvbihjbSk7IH1cbn1cbi8vIFdyYXBzIGEgZnVuY3Rpb24gaW4gYW4gb3BlcmF0aW9uLiBSZXR1cm5zIHRoZSB3cmFwcGVkIGZ1bmN0aW9uLlxuZnVuY3Rpb24gb3BlcmF0aW9uKGNtLCBmKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZiAoY20uY3VyT3ApIHsgcmV0dXJuIGYuYXBwbHkoY20sIGFyZ3VtZW50cykgfVxuICAgIHN0YXJ0T3BlcmF0aW9uKGNtKTtcbiAgICB0cnkgeyByZXR1cm4gZi5hcHBseShjbSwgYXJndW1lbnRzKSB9XG4gICAgZmluYWxseSB7IGVuZE9wZXJhdGlvbihjbSk7IH1cbiAgfVxufVxuLy8gVXNlZCB0byBhZGQgbWV0aG9kcyB0byBlZGl0b3IgYW5kIGRvYyBpbnN0YW5jZXMsIHdyYXBwaW5nIHRoZW0gaW5cbi8vIG9wZXJhdGlvbnMuXG5mdW5jdGlvbiBtZXRob2RPcChmKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jdXJPcCkgeyByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cbiAgICBzdGFydE9wZXJhdGlvbih0aGlzKTtcbiAgICB0cnkgeyByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cbiAgICBmaW5hbGx5IHsgZW5kT3BlcmF0aW9uKHRoaXMpOyB9XG4gIH1cbn1cbmZ1bmN0aW9uIGRvY01ldGhvZE9wKGYpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbSA9IHRoaXMuY207XG4gICAgaWYgKCFjbSB8fCBjbS5jdXJPcCkgeyByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIH1cbiAgICBzdGFydE9wZXJhdGlvbihjbSk7XG4gICAgdHJ5IHsgcmV0dXJuIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKSB9XG4gICAgZmluYWxseSB7IGVuZE9wZXJhdGlvbihjbSk7IH1cbiAgfVxufVxuXG4vLyBVcGRhdGVzIHRoZSBkaXNwbGF5LnZpZXcgZGF0YSBzdHJ1Y3R1cmUgZm9yIGEgZ2l2ZW4gY2hhbmdlIHRvIHRoZVxuLy8gZG9jdW1lbnQuIEZyb20gYW5kIHRvIGFyZSBpbiBwcmUtY2hhbmdlIGNvb3JkaW5hdGVzLiBMZW5kaWZmIGlzXG4vLyB0aGUgYW1vdW50IG9mIGxpbmVzIGFkZGVkIG9yIHN1YnRyYWN0ZWQgYnkgdGhlIGNoYW5nZS4gVGhpcyBpc1xuLy8gdXNlZCBmb3IgY2hhbmdlcyB0aGF0IHNwYW4gbXVsdGlwbGUgbGluZXMsIG9yIGNoYW5nZSB0aGUgd2F5XG4vLyBsaW5lcyBhcmUgZGl2aWRlZCBpbnRvIHZpc3VhbCBsaW5lcy4gcmVnTGluZUNoYW5nZSAoYmVsb3cpXG4vLyByZWdpc3RlcnMgc2luZ2xlLWxpbmUgY2hhbmdlcy5cbmZ1bmN0aW9uIHJlZ0NoYW5nZShjbSwgZnJvbSwgdG8sIGxlbmRpZmYpIHtcbiAgaWYgKGZyb20gPT0gbnVsbCkgeyBmcm9tID0gY20uZG9jLmZpcnN0OyB9XG4gIGlmICh0byA9PSBudWxsKSB7IHRvID0gY20uZG9jLmZpcnN0ICsgY20uZG9jLnNpemU7IH1cbiAgaWYgKCFsZW5kaWZmKSB7IGxlbmRpZmYgPSAwOyB9XG5cbiAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICBpZiAobGVuZGlmZiAmJiB0byA8IGRpc3BsYXkudmlld1RvICYmXG4gICAgICAoZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA9PSBudWxsIHx8IGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPiBmcm9tKSlcbiAgICB7IGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPSBmcm9tOyB9XG5cbiAgY20uY3VyT3Audmlld0NoYW5nZWQgPSB0cnVlO1xuXG4gIGlmIChmcm9tID49IGRpc3BsYXkudmlld1RvKSB7IC8vIENoYW5nZSBhZnRlclxuICAgIGlmIChzYXdDb2xsYXBzZWRTcGFucyAmJiB2aXN1YWxMaW5lTm8oY20uZG9jLCBmcm9tKSA8IGRpc3BsYXkudmlld1RvKVxuICAgICAgeyByZXNldFZpZXcoY20pOyB9XG4gIH0gZWxzZSBpZiAodG8gPD0gZGlzcGxheS52aWV3RnJvbSkgeyAvLyBDaGFuZ2UgYmVmb3JlXG4gICAgaWYgKHNhd0NvbGxhcHNlZFNwYW5zICYmIHZpc3VhbExpbmVFbmRObyhjbS5kb2MsIHRvICsgbGVuZGlmZikgPiBkaXNwbGF5LnZpZXdGcm9tKSB7XG4gICAgICByZXNldFZpZXcoY20pO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXNwbGF5LnZpZXdGcm9tICs9IGxlbmRpZmY7XG4gICAgICBkaXNwbGF5LnZpZXdUbyArPSBsZW5kaWZmO1xuICAgIH1cbiAgfSBlbHNlIGlmIChmcm9tIDw9IGRpc3BsYXkudmlld0Zyb20gJiYgdG8gPj0gZGlzcGxheS52aWV3VG8pIHsgLy8gRnVsbCBvdmVybGFwXG4gICAgcmVzZXRWaWV3KGNtKTtcbiAgfSBlbHNlIGlmIChmcm9tIDw9IGRpc3BsYXkudmlld0Zyb20pIHsgLy8gVG9wIG92ZXJsYXBcbiAgICB2YXIgY3V0ID0gdmlld0N1dHRpbmdQb2ludChjbSwgdG8sIHRvICsgbGVuZGlmZiwgMSk7XG4gICAgaWYgKGN1dCkge1xuICAgICAgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LnNsaWNlKGN1dC5pbmRleCk7XG4gICAgICBkaXNwbGF5LnZpZXdGcm9tID0gY3V0LmxpbmVOO1xuICAgICAgZGlzcGxheS52aWV3VG8gKz0gbGVuZGlmZjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodG8gPj0gZGlzcGxheS52aWV3VG8pIHsgLy8gQm90dG9tIG92ZXJsYXBcbiAgICB2YXIgY3V0JDEgPSB2aWV3Q3V0dGluZ1BvaW50KGNtLCBmcm9tLCBmcm9tLCAtMSk7XG4gICAgaWYgKGN1dCQxKSB7XG4gICAgICBkaXNwbGF5LnZpZXcgPSBkaXNwbGF5LnZpZXcuc2xpY2UoMCwgY3V0JDEuaW5kZXgpO1xuICAgICAgZGlzcGxheS52aWV3VG8gPSBjdXQkMS5saW5lTjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICB9XG4gIH0gZWxzZSB7IC8vIEdhcCBpbiB0aGUgbWlkZGxlXG4gICAgdmFyIGN1dFRvcCA9IHZpZXdDdXR0aW5nUG9pbnQoY20sIGZyb20sIGZyb20sIC0xKTtcbiAgICB2YXIgY3V0Qm90ID0gdmlld0N1dHRpbmdQb2ludChjbSwgdG8sIHRvICsgbGVuZGlmZiwgMSk7XG4gICAgaWYgKGN1dFRvcCAmJiBjdXRCb3QpIHtcbiAgICAgIGRpc3BsYXkudmlldyA9IGRpc3BsYXkudmlldy5zbGljZSgwLCBjdXRUb3AuaW5kZXgpXG4gICAgICAgIC5jb25jYXQoYnVpbGRWaWV3QXJyYXkoY20sIGN1dFRvcC5saW5lTiwgY3V0Qm90LmxpbmVOKSlcbiAgICAgICAgLmNvbmNhdChkaXNwbGF5LnZpZXcuc2xpY2UoY3V0Qm90LmluZGV4KSk7XG4gICAgICBkaXNwbGF5LnZpZXdUbyArPSBsZW5kaWZmO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNldFZpZXcoY20pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBleHQgPSBkaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQ7XG4gIGlmIChleHQpIHtcbiAgICBpZiAodG8gPCBleHQubGluZU4pXG4gICAgICB7IGV4dC5saW5lTiArPSBsZW5kaWZmOyB9XG4gICAgZWxzZSBpZiAoZnJvbSA8IGV4dC5saW5lTiArIGV4dC5zaXplKVxuICAgICAgeyBkaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQgPSBudWxsOyB9XG4gIH1cbn1cblxuLy8gUmVnaXN0ZXIgYSBjaGFuZ2UgdG8gYSBzaW5nbGUgbGluZS4gVHlwZSBtdXN0IGJlIG9uZSBvZiBcInRleHRcIixcbi8vIFwiZ3V0dGVyXCIsIFwiY2xhc3NcIiwgXCJ3aWRnZXRcIlxuZnVuY3Rpb24gcmVnTGluZUNoYW5nZShjbSwgbGluZSwgdHlwZSkge1xuICBjbS5jdXJPcC52aWV3Q2hhbmdlZCA9IHRydWU7XG4gIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSwgZXh0ID0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkO1xuICBpZiAoZXh0ICYmIGxpbmUgPj0gZXh0LmxpbmVOICYmIGxpbmUgPCBleHQubGluZU4gKyBleHQuc2l6ZSlcbiAgICB7IGRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZCA9IG51bGw7IH1cblxuICBpZiAobGluZSA8IGRpc3BsYXkudmlld0Zyb20gfHwgbGluZSA+PSBkaXNwbGF5LnZpZXdUbykgeyByZXR1cm4gfVxuICB2YXIgbGluZVZpZXcgPSBkaXNwbGF5LnZpZXdbZmluZFZpZXdJbmRleChjbSwgbGluZSldO1xuICBpZiAobGluZVZpZXcubm9kZSA9PSBudWxsKSB7IHJldHVybiB9XG4gIHZhciBhcnIgPSBsaW5lVmlldy5jaGFuZ2VzIHx8IChsaW5lVmlldy5jaGFuZ2VzID0gW10pO1xuICBpZiAoaW5kZXhPZihhcnIsIHR5cGUpID09IC0xKSB7IGFyci5wdXNoKHR5cGUpOyB9XG59XG5cbi8vIENsZWFyIHRoZSB2aWV3LlxuZnVuY3Rpb24gcmVzZXRWaWV3KGNtKSB7XG4gIGNtLmRpc3BsYXkudmlld0Zyb20gPSBjbS5kaXNwbGF5LnZpZXdUbyA9IGNtLmRvYy5maXJzdDtcbiAgY20uZGlzcGxheS52aWV3ID0gW107XG4gIGNtLmRpc3BsYXkudmlld09mZnNldCA9IDA7XG59XG5cbmZ1bmN0aW9uIHZpZXdDdXR0aW5nUG9pbnQoY20sIG9sZE4sIG5ld04sIGRpcikge1xuICB2YXIgaW5kZXggPSBmaW5kVmlld0luZGV4KGNtLCBvbGROKSwgZGlmZiwgdmlldyA9IGNtLmRpc3BsYXkudmlldztcbiAgaWYgKCFzYXdDb2xsYXBzZWRTcGFucyB8fCBuZXdOID09IGNtLmRvYy5maXJzdCArIGNtLmRvYy5zaXplKVxuICAgIHsgcmV0dXJuIHtpbmRleDogaW5kZXgsIGxpbmVOOiBuZXdOfSB9XG4gIHZhciBuID0gY20uZGlzcGxheS52aWV3RnJvbTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKVxuICAgIHsgbiArPSB2aWV3W2ldLnNpemU7IH1cbiAgaWYgKG4gIT0gb2xkTikge1xuICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICBpZiAoaW5kZXggPT0gdmlldy5sZW5ndGggLSAxKSB7IHJldHVybiBudWxsIH1cbiAgICAgIGRpZmYgPSAobiArIHZpZXdbaW5kZXhdLnNpemUpIC0gb2xkTjtcbiAgICAgIGluZGV4Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpZmYgPSBuIC0gb2xkTjtcbiAgICB9XG4gICAgb2xkTiArPSBkaWZmOyBuZXdOICs9IGRpZmY7XG4gIH1cbiAgd2hpbGUgKHZpc3VhbExpbmVObyhjbS5kb2MsIG5ld04pICE9IG5ld04pIHtcbiAgICBpZiAoaW5kZXggPT0gKGRpciA8IDAgPyAwIDogdmlldy5sZW5ndGggLSAxKSkgeyByZXR1cm4gbnVsbCB9XG4gICAgbmV3TiArPSBkaXIgKiB2aWV3W2luZGV4IC0gKGRpciA8IDAgPyAxIDogMCldLnNpemU7XG4gICAgaW5kZXggKz0gZGlyO1xuICB9XG4gIHJldHVybiB7aW5kZXg6IGluZGV4LCBsaW5lTjogbmV3Tn1cbn1cblxuLy8gRm9yY2UgdGhlIHZpZXcgdG8gY292ZXIgYSBnaXZlbiByYW5nZSwgYWRkaW5nIGVtcHR5IHZpZXcgZWxlbWVudFxuLy8gb3IgY2xpcHBpbmcgb2ZmIGV4aXN0aW5nIG9uZXMgYXMgbmVlZGVkLlxuZnVuY3Rpb24gYWRqdXN0VmlldyhjbSwgZnJvbSwgdG8pIHtcbiAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCB2aWV3ID0gZGlzcGxheS52aWV3O1xuICBpZiAodmlldy5sZW5ndGggPT0gMCB8fCBmcm9tID49IGRpc3BsYXkudmlld1RvIHx8IHRvIDw9IGRpc3BsYXkudmlld0Zyb20pIHtcbiAgICBkaXNwbGF5LnZpZXcgPSBidWlsZFZpZXdBcnJheShjbSwgZnJvbSwgdG8pO1xuICAgIGRpc3BsYXkudmlld0Zyb20gPSBmcm9tO1xuICB9IGVsc2Uge1xuICAgIGlmIChkaXNwbGF5LnZpZXdGcm9tID4gZnJvbSlcbiAgICAgIHsgZGlzcGxheS52aWV3ID0gYnVpbGRWaWV3QXJyYXkoY20sIGZyb20sIGRpc3BsYXkudmlld0Zyb20pLmNvbmNhdChkaXNwbGF5LnZpZXcpOyB9XG4gICAgZWxzZSBpZiAoZGlzcGxheS52aWV3RnJvbSA8IGZyb20pXG4gICAgICB7IGRpc3BsYXkudmlldyA9IGRpc3BsYXkudmlldy5zbGljZShmaW5kVmlld0luZGV4KGNtLCBmcm9tKSk7IH1cbiAgICBkaXNwbGF5LnZpZXdGcm9tID0gZnJvbTtcbiAgICBpZiAoZGlzcGxheS52aWV3VG8gPCB0bylcbiAgICAgIHsgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LmNvbmNhdChidWlsZFZpZXdBcnJheShjbSwgZGlzcGxheS52aWV3VG8sIHRvKSk7IH1cbiAgICBlbHNlIGlmIChkaXNwbGF5LnZpZXdUbyA+IHRvKVxuICAgICAgeyBkaXNwbGF5LnZpZXcgPSBkaXNwbGF5LnZpZXcuc2xpY2UoMCwgZmluZFZpZXdJbmRleChjbSwgdG8pKTsgfVxuICB9XG4gIGRpc3BsYXkudmlld1RvID0gdG87XG59XG5cbi8vIENvdW50IHRoZSBudW1iZXIgb2YgbGluZXMgaW4gdGhlIHZpZXcgd2hvc2UgRE9NIHJlcHJlc2VudGF0aW9uIGlzXG4vLyBvdXQgb2YgZGF0ZSAob3Igbm9uZXhpc3RlbnQpLlxuZnVuY3Rpb24gY291bnREaXJ0eVZpZXcoY20pIHtcbiAgdmFyIHZpZXcgPSBjbS5kaXNwbGF5LnZpZXcsIGRpcnR5ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxpbmVWaWV3ID0gdmlld1tpXTtcbiAgICBpZiAoIWxpbmVWaWV3LmhpZGRlbiAmJiAoIWxpbmVWaWV3Lm5vZGUgfHwgbGluZVZpZXcuY2hhbmdlcykpIHsgKytkaXJ0eTsgfVxuICB9XG4gIHJldHVybiBkaXJ0eVxufVxuXG4vLyBISUdITElHSFQgV09SS0VSXG5cbmZ1bmN0aW9uIHN0YXJ0V29ya2VyKGNtLCB0aW1lKSB7XG4gIGlmIChjbS5kb2MubW9kZS5zdGFydFN0YXRlICYmIGNtLmRvYy5mcm9udGllciA8IGNtLmRpc3BsYXkudmlld1RvKVxuICAgIHsgY20uc3RhdGUuaGlnaGxpZ2h0LnNldCh0aW1lLCBiaW5kKGhpZ2hsaWdodFdvcmtlciwgY20pKTsgfVxufVxuXG5mdW5jdGlvbiBoaWdobGlnaHRXb3JrZXIoY20pIHtcbiAgdmFyIGRvYyA9IGNtLmRvYztcbiAgaWYgKGRvYy5mcm9udGllciA8IGRvYy5maXJzdCkgeyBkb2MuZnJvbnRpZXIgPSBkb2MuZmlyc3Q7IH1cbiAgaWYgKGRvYy5mcm9udGllciA+PSBjbS5kaXNwbGF5LnZpZXdUbykgeyByZXR1cm4gfVxuICB2YXIgZW5kID0gK25ldyBEYXRlICsgY20ub3B0aW9ucy53b3JrVGltZTtcbiAgdmFyIHN0YXRlID0gY29weVN0YXRlKGRvYy5tb2RlLCBnZXRTdGF0ZUJlZm9yZShjbSwgZG9jLmZyb250aWVyKSk7XG4gIHZhciBjaGFuZ2VkTGluZXMgPSBbXTtcblxuICBkb2MuaXRlcihkb2MuZnJvbnRpZXIsIE1hdGgubWluKGRvYy5maXJzdCArIGRvYy5zaXplLCBjbS5kaXNwbGF5LnZpZXdUbyArIDUwMCksIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgaWYgKGRvYy5mcm9udGllciA+PSBjbS5kaXNwbGF5LnZpZXdGcm9tKSB7IC8vIFZpc2libGVcbiAgICAgIHZhciBvbGRTdHlsZXMgPSBsaW5lLnN0eWxlcywgdG9vTG9uZyA9IGxpbmUudGV4dC5sZW5ndGggPiBjbS5vcHRpb25zLm1heEhpZ2hsaWdodExlbmd0aDtcbiAgICAgIHZhciBoaWdobGlnaHRlZCA9IGhpZ2hsaWdodExpbmUoY20sIGxpbmUsIHRvb0xvbmcgPyBjb3B5U3RhdGUoZG9jLm1vZGUsIHN0YXRlKSA6IHN0YXRlLCB0cnVlKTtcbiAgICAgIGxpbmUuc3R5bGVzID0gaGlnaGxpZ2h0ZWQuc3R5bGVzO1xuICAgICAgdmFyIG9sZENscyA9IGxpbmUuc3R5bGVDbGFzc2VzLCBuZXdDbHMgPSBoaWdobGlnaHRlZC5jbGFzc2VzO1xuICAgICAgaWYgKG5ld0NscykgeyBsaW5lLnN0eWxlQ2xhc3NlcyA9IG5ld0NsczsgfVxuICAgICAgZWxzZSBpZiAob2xkQ2xzKSB7IGxpbmUuc3R5bGVDbGFzc2VzID0gbnVsbDsgfVxuICAgICAgdmFyIGlzY2hhbmdlID0gIW9sZFN0eWxlcyB8fCBvbGRTdHlsZXMubGVuZ3RoICE9IGxpbmUuc3R5bGVzLmxlbmd0aCB8fFxuICAgICAgICBvbGRDbHMgIT0gbmV3Q2xzICYmICghb2xkQ2xzIHx8ICFuZXdDbHMgfHwgb2xkQ2xzLmJnQ2xhc3MgIT0gbmV3Q2xzLmJnQ2xhc3MgfHwgb2xkQ2xzLnRleHRDbGFzcyAhPSBuZXdDbHMudGV4dENsYXNzKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyAhaXNjaGFuZ2UgJiYgaSA8IG9sZFN0eWxlcy5sZW5ndGg7ICsraSkgeyBpc2NoYW5nZSA9IG9sZFN0eWxlc1tpXSAhPSBsaW5lLnN0eWxlc1tpXTsgfVxuICAgICAgaWYgKGlzY2hhbmdlKSB7IGNoYW5nZWRMaW5lcy5wdXNoKGRvYy5mcm9udGllcik7IH1cbiAgICAgIGxpbmUuc3RhdGVBZnRlciA9IHRvb0xvbmcgPyBzdGF0ZSA6IGNvcHlTdGF0ZShkb2MubW9kZSwgc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobGluZS50ZXh0Lmxlbmd0aCA8PSBjbS5vcHRpb25zLm1heEhpZ2hsaWdodExlbmd0aClcbiAgICAgICAgeyBwcm9jZXNzTGluZShjbSwgbGluZS50ZXh0LCBzdGF0ZSk7IH1cbiAgICAgIGxpbmUuc3RhdGVBZnRlciA9IGRvYy5mcm9udGllciAlIDUgPT0gMCA/IGNvcHlTdGF0ZShkb2MubW9kZSwgc3RhdGUpIDogbnVsbDtcbiAgICB9XG4gICAgKytkb2MuZnJvbnRpZXI7XG4gICAgaWYgKCtuZXcgRGF0ZSA+IGVuZCkge1xuICAgICAgc3RhcnRXb3JrZXIoY20sIGNtLm9wdGlvbnMud29ya0RlbGF5KTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKGNoYW5nZWRMaW5lcy5sZW5ndGgpIHsgcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhbmdlZExpbmVzLmxlbmd0aDsgaSsrKVxuICAgICAgeyByZWdMaW5lQ2hhbmdlKGNtLCBjaGFuZ2VkTGluZXNbaV0sIFwidGV4dFwiKTsgfVxuICB9KTsgfVxufVxuXG4vLyBESVNQTEFZIERSQVdJTkdcblxudmFyIERpc3BsYXlVcGRhdGUgPSBmdW5jdGlvbihjbSwgdmlld3BvcnQsIGZvcmNlKSB7XG4gIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcblxuICB0aGlzLnZpZXdwb3J0ID0gdmlld3BvcnQ7XG4gIC8vIFN0b3JlIHNvbWUgdmFsdWVzIHRoYXQgd2UnbGwgbmVlZCBsYXRlciAoYnV0IGRvbid0IHdhbnQgdG8gZm9yY2UgYSByZWxheW91dCBmb3IpXG4gIHRoaXMudmlzaWJsZSA9IHZpc2libGVMaW5lcyhkaXNwbGF5LCBjbS5kb2MsIHZpZXdwb3J0KTtcbiAgdGhpcy5lZGl0b3JJc0hpZGRlbiA9ICFkaXNwbGF5LndyYXBwZXIub2Zmc2V0V2lkdGg7XG4gIHRoaXMud3JhcHBlckhlaWdodCA9IGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQ7XG4gIHRoaXMud3JhcHBlcldpZHRoID0gZGlzcGxheS53cmFwcGVyLmNsaWVudFdpZHRoO1xuICB0aGlzLm9sZERpc3BsYXlXaWR0aCA9IGRpc3BsYXlXaWR0aChjbSk7XG4gIHRoaXMuZm9yY2UgPSBmb3JjZTtcbiAgdGhpcy5kaW1zID0gZ2V0RGltZW5zaW9ucyhjbSk7XG4gIHRoaXMuZXZlbnRzID0gW107XG59O1xuXG5EaXNwbGF5VXBkYXRlLnByb3RvdHlwZS5zaWduYWwgPSBmdW5jdGlvbiAoZW1pdHRlciwgdHlwZSkge1xuICBpZiAoaGFzSGFuZGxlcihlbWl0dGVyLCB0eXBlKSlcbiAgICB7IHRoaXMuZXZlbnRzLnB1c2goYXJndW1lbnRzKTsgfVxufTtcbkRpc3BsYXlVcGRhdGUucHJvdG90eXBlLmZpbmlzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZXZlbnRzLmxlbmd0aDsgaSsrKVxuICAgIHsgc2lnbmFsLmFwcGx5KG51bGwsIHRoaXMkMS5ldmVudHNbaV0pOyB9XG59O1xuXG5mdW5jdGlvbiBtYXliZUNsaXBTY3JvbGxiYXJzKGNtKSB7XG4gIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgaWYgKCFkaXNwbGF5LnNjcm9sbGJhcnNDbGlwcGVkICYmIGRpc3BsYXkuc2Nyb2xsZXIub2Zmc2V0V2lkdGgpIHtcbiAgICBkaXNwbGF5Lm5hdGl2ZUJhcldpZHRoID0gZGlzcGxheS5zY3JvbGxlci5vZmZzZXRXaWR0aCAtIGRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGg7XG4gICAgZGlzcGxheS5oZWlnaHRGb3JjZXIuc3R5bGUuaGVpZ2h0ID0gc2Nyb2xsR2FwKGNtKSArIFwicHhcIjtcbiAgICBkaXNwbGF5LnNpemVyLnN0eWxlLm1hcmdpbkJvdHRvbSA9IC1kaXNwbGF5Lm5hdGl2ZUJhcldpZHRoICsgXCJweFwiO1xuICAgIGRpc3BsYXkuc2l6ZXIuc3R5bGUuYm9yZGVyUmlnaHRXaWR0aCA9IHNjcm9sbEdhcChjbSkgKyBcInB4XCI7XG4gICAgZGlzcGxheS5zY3JvbGxiYXJzQ2xpcHBlZCA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uU25hcHNob3QoY20pIHtcbiAgaWYgKGNtLmhhc0ZvY3VzKCkpIHsgcmV0dXJuIG51bGwgfVxuICB2YXIgYWN0aXZlID0gYWN0aXZlRWx0KCk7XG4gIGlmICghYWN0aXZlIHx8ICFjb250YWlucyhjbS5kaXNwbGF5LmxpbmVEaXYsIGFjdGl2ZSkpIHsgcmV0dXJuIG51bGwgfVxuICB2YXIgcmVzdWx0ID0ge2FjdGl2ZUVsdDogYWN0aXZlfTtcbiAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIGlmIChzZWwuYW5jaG9yTm9kZSAmJiBzZWwuZXh0ZW5kICYmIGNvbnRhaW5zKGNtLmRpc3BsYXkubGluZURpdiwgc2VsLmFuY2hvck5vZGUpKSB7XG4gICAgICByZXN1bHQuYW5jaG9yTm9kZSA9IHNlbC5hbmNob3JOb2RlO1xuICAgICAgcmVzdWx0LmFuY2hvck9mZnNldCA9IHNlbC5hbmNob3JPZmZzZXQ7XG4gICAgICByZXN1bHQuZm9jdXNOb2RlID0gc2VsLmZvY3VzTm9kZTtcbiAgICAgIHJlc3VsdC5mb2N1c09mZnNldCA9IHNlbC5mb2N1c09mZnNldDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiByZXN0b3JlU2VsZWN0aW9uKHNuYXBzaG90KSB7XG4gIGlmICghc25hcHNob3QgfHwgIXNuYXBzaG90LmFjdGl2ZUVsdCB8fCBzbmFwc2hvdC5hY3RpdmVFbHQgPT0gYWN0aXZlRWx0KCkpIHsgcmV0dXJuIH1cbiAgc25hcHNob3QuYWN0aXZlRWx0LmZvY3VzKCk7XG4gIGlmIChzbmFwc2hvdC5hbmNob3JOb2RlICYmIGNvbnRhaW5zKGRvY3VtZW50LmJvZHksIHNuYXBzaG90LmFuY2hvck5vZGUpICYmIGNvbnRhaW5zKGRvY3VtZW50LmJvZHksIHNuYXBzaG90LmZvY3VzTm9kZSkpIHtcbiAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpLCByYW5nZSQkMSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgcmFuZ2UkJDEuc2V0RW5kKHNuYXBzaG90LmFuY2hvck5vZGUsIHNuYXBzaG90LmFuY2hvck9mZnNldCk7XG4gICAgcmFuZ2UkJDEuY29sbGFwc2UoZmFsc2UpO1xuICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICBzZWwuYWRkUmFuZ2UocmFuZ2UkJDEpO1xuICAgIHNlbC5leHRlbmQoc25hcHNob3QuZm9jdXNOb2RlLCBzbmFwc2hvdC5mb2N1c09mZnNldCk7XG4gIH1cbn1cblxuLy8gRG9lcyB0aGUgYWN0dWFsIHVwZGF0aW5nIG9mIHRoZSBsaW5lIGRpc3BsYXkuIEJhaWxzIG91dFxuLy8gKHJldHVybmluZyBmYWxzZSkgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGJlIGRvbmUgYW5kIGZvcmNlZCBpc1xuLy8gZmFsc2UuXG5mdW5jdGlvbiB1cGRhdGVEaXNwbGF5SWZOZWVkZWQoY20sIHVwZGF0ZSkge1xuICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGRvYyA9IGNtLmRvYztcblxuICBpZiAodXBkYXRlLmVkaXRvcklzSGlkZGVuKSB7XG4gICAgcmVzZXRWaWV3KGNtKTtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIEJhaWwgb3V0IGlmIHRoZSB2aXNpYmxlIGFyZWEgaXMgYWxyZWFkeSByZW5kZXJlZCBhbmQgbm90aGluZyBjaGFuZ2VkLlxuICBpZiAoIXVwZGF0ZS5mb3JjZSAmJlxuICAgICAgdXBkYXRlLnZpc2libGUuZnJvbSA+PSBkaXNwbGF5LnZpZXdGcm9tICYmIHVwZGF0ZS52aXNpYmxlLnRvIDw9IGRpc3BsYXkudmlld1RvICYmXG4gICAgICAoZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA9PSBudWxsIHx8IGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPj0gZGlzcGxheS52aWV3VG8pICYmXG4gICAgICBkaXNwbGF5LnJlbmRlcmVkVmlldyA9PSBkaXNwbGF5LnZpZXcgJiYgY291bnREaXJ0eVZpZXcoY20pID09IDApXG4gICAgeyByZXR1cm4gZmFsc2UgfVxuXG4gIGlmIChtYXliZVVwZGF0ZUxpbmVOdW1iZXJXaWR0aChjbSkpIHtcbiAgICByZXNldFZpZXcoY20pO1xuICAgIHVwZGF0ZS5kaW1zID0gZ2V0RGltZW5zaW9ucyhjbSk7XG4gIH1cblxuICAvLyBDb21wdXRlIGEgc3VpdGFibGUgbmV3IHZpZXdwb3J0IChmcm9tICYgdG8pXG4gIHZhciBlbmQgPSBkb2MuZmlyc3QgKyBkb2Muc2l6ZTtcbiAgdmFyIGZyb20gPSBNYXRoLm1heCh1cGRhdGUudmlzaWJsZS5mcm9tIC0gY20ub3B0aW9ucy52aWV3cG9ydE1hcmdpbiwgZG9jLmZpcnN0KTtcbiAgdmFyIHRvID0gTWF0aC5taW4oZW5kLCB1cGRhdGUudmlzaWJsZS50byArIGNtLm9wdGlvbnMudmlld3BvcnRNYXJnaW4pO1xuICBpZiAoZGlzcGxheS52aWV3RnJvbSA8IGZyb20gJiYgZnJvbSAtIGRpc3BsYXkudmlld0Zyb20gPCAyMCkgeyBmcm9tID0gTWF0aC5tYXgoZG9jLmZpcnN0LCBkaXNwbGF5LnZpZXdGcm9tKTsgfVxuICBpZiAoZGlzcGxheS52aWV3VG8gPiB0byAmJiBkaXNwbGF5LnZpZXdUbyAtIHRvIDwgMjApIHsgdG8gPSBNYXRoLm1pbihlbmQsIGRpc3BsYXkudmlld1RvKTsgfVxuICBpZiAoc2F3Q29sbGFwc2VkU3BhbnMpIHtcbiAgICBmcm9tID0gdmlzdWFsTGluZU5vKGNtLmRvYywgZnJvbSk7XG4gICAgdG8gPSB2aXN1YWxMaW5lRW5kTm8oY20uZG9jLCB0byk7XG4gIH1cblxuICB2YXIgZGlmZmVyZW50ID0gZnJvbSAhPSBkaXNwbGF5LnZpZXdGcm9tIHx8IHRvICE9IGRpc3BsYXkudmlld1RvIHx8XG4gICAgZGlzcGxheS5sYXN0V3JhcEhlaWdodCAhPSB1cGRhdGUud3JhcHBlckhlaWdodCB8fCBkaXNwbGF5Lmxhc3RXcmFwV2lkdGggIT0gdXBkYXRlLndyYXBwZXJXaWR0aDtcbiAgYWRqdXN0VmlldyhjbSwgZnJvbSwgdG8pO1xuXG4gIGRpc3BsYXkudmlld09mZnNldCA9IGhlaWdodEF0TGluZShnZXRMaW5lKGNtLmRvYywgZGlzcGxheS52aWV3RnJvbSkpO1xuICAvLyBQb3NpdGlvbiB0aGUgbW92ZXIgZGl2IHRvIGFsaWduIHdpdGggdGhlIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uXG4gIGNtLmRpc3BsYXkubW92ZXIuc3R5bGUudG9wID0gZGlzcGxheS52aWV3T2Zmc2V0ICsgXCJweFwiO1xuXG4gIHZhciB0b1VwZGF0ZSA9IGNvdW50RGlydHlWaWV3KGNtKTtcbiAgaWYgKCFkaWZmZXJlbnQgJiYgdG9VcGRhdGUgPT0gMCAmJiAhdXBkYXRlLmZvcmNlICYmIGRpc3BsYXkucmVuZGVyZWRWaWV3ID09IGRpc3BsYXkudmlldyAmJlxuICAgICAgKGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPT0gbnVsbCB8fCBkaXNwbGF5LnVwZGF0ZUxpbmVOdW1iZXJzID49IGRpc3BsYXkudmlld1RvKSlcbiAgICB7IHJldHVybiBmYWxzZSB9XG5cbiAgLy8gRm9yIGJpZyBjaGFuZ2VzLCB3ZSBoaWRlIHRoZSBlbmNsb3NpbmcgZWxlbWVudCBkdXJpbmcgdGhlXG4gIC8vIHVwZGF0ZSwgc2luY2UgdGhhdCBzcGVlZHMgdXAgdGhlIG9wZXJhdGlvbnMgb24gbW9zdCBicm93c2Vycy5cbiAgdmFyIHNlbFNuYXBzaG90ID0gc2VsZWN0aW9uU25hcHNob3QoY20pO1xuICBpZiAodG9VcGRhdGUgPiA0KSB7IGRpc3BsYXkubGluZURpdi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7IH1cbiAgcGF0Y2hEaXNwbGF5KGNtLCBkaXNwbGF5LnVwZGF0ZUxpbmVOdW1iZXJzLCB1cGRhdGUuZGltcyk7XG4gIGlmICh0b1VwZGF0ZSA+IDQpIHsgZGlzcGxheS5saW5lRGl2LnN0eWxlLmRpc3BsYXkgPSBcIlwiOyB9XG4gIGRpc3BsYXkucmVuZGVyZWRWaWV3ID0gZGlzcGxheS52aWV3O1xuICAvLyBUaGVyZSBtaWdodCBoYXZlIGJlZW4gYSB3aWRnZXQgd2l0aCBhIGZvY3VzZWQgZWxlbWVudCB0aGF0IGdvdFxuICAvLyBoaWRkZW4gb3IgdXBkYXRlZCwgaWYgc28gcmUtZm9jdXMgaXQuXG4gIHJlc3RvcmVTZWxlY3Rpb24oc2VsU25hcHNob3QpO1xuXG4gIC8vIFByZXZlbnQgc2VsZWN0aW9uIGFuZCBjdXJzb3JzIGZyb20gaW50ZXJmZXJpbmcgd2l0aCB0aGUgc2Nyb2xsXG4gIC8vIHdpZHRoIGFuZCBoZWlnaHQuXG4gIHJlbW92ZUNoaWxkcmVuKGRpc3BsYXkuY3Vyc29yRGl2KTtcbiAgcmVtb3ZlQ2hpbGRyZW4oZGlzcGxheS5zZWxlY3Rpb25EaXYpO1xuICBkaXNwbGF5Lmd1dHRlcnMuc3R5bGUuaGVpZ2h0ID0gZGlzcGxheS5zaXplci5zdHlsZS5taW5IZWlnaHQgPSAwO1xuXG4gIGlmIChkaWZmZXJlbnQpIHtcbiAgICBkaXNwbGF5Lmxhc3RXcmFwSGVpZ2h0ID0gdXBkYXRlLndyYXBwZXJIZWlnaHQ7XG4gICAgZGlzcGxheS5sYXN0V3JhcFdpZHRoID0gdXBkYXRlLndyYXBwZXJXaWR0aDtcbiAgICBzdGFydFdvcmtlcihjbSwgNDAwKTtcbiAgfVxuXG4gIGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPSBudWxsO1xuXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIHBvc3RVcGRhdGVEaXNwbGF5KGNtLCB1cGRhdGUpIHtcbiAgdmFyIHZpZXdwb3J0ID0gdXBkYXRlLnZpZXdwb3J0O1xuXG4gIGZvciAodmFyIGZpcnN0ID0gdHJ1ZTs7IGZpcnN0ID0gZmFsc2UpIHtcbiAgICBpZiAoIWZpcnN0IHx8ICFjbS5vcHRpb25zLmxpbmVXcmFwcGluZyB8fCB1cGRhdGUub2xkRGlzcGxheVdpZHRoID09IGRpc3BsYXlXaWR0aChjbSkpIHtcbiAgICAgIC8vIENsaXAgZm9yY2VkIHZpZXdwb3J0IHRvIGFjdHVhbCBzY3JvbGxhYmxlIGFyZWEuXG4gICAgICBpZiAodmlld3BvcnQgJiYgdmlld3BvcnQudG9wICE9IG51bGwpXG4gICAgICAgIHsgdmlld3BvcnQgPSB7dG9wOiBNYXRoLm1pbihjbS5kb2MuaGVpZ2h0ICsgcGFkZGluZ1ZlcnQoY20uZGlzcGxheSkgLSBkaXNwbGF5SGVpZ2h0KGNtKSwgdmlld3BvcnQudG9wKX07IH1cbiAgICAgIC8vIFVwZGF0ZWQgbGluZSBoZWlnaHRzIG1pZ2h0IHJlc3VsdCBpbiB0aGUgZHJhd24gYXJlYSBub3RcbiAgICAgIC8vIGFjdHVhbGx5IGNvdmVyaW5nIHRoZSB2aWV3cG9ydC4gS2VlcCBsb29waW5nIHVudGlsIGl0IGRvZXMuXG4gICAgICB1cGRhdGUudmlzaWJsZSA9IHZpc2libGVMaW5lcyhjbS5kaXNwbGF5LCBjbS5kb2MsIHZpZXdwb3J0KTtcbiAgICAgIGlmICh1cGRhdGUudmlzaWJsZS5mcm9tID49IGNtLmRpc3BsYXkudmlld0Zyb20gJiYgdXBkYXRlLnZpc2libGUudG8gPD0gY20uZGlzcGxheS52aWV3VG8pXG4gICAgICAgIHsgYnJlYWsgfVxuICAgIH1cbiAgICBpZiAoIXVwZGF0ZURpc3BsYXlJZk5lZWRlZChjbSwgdXBkYXRlKSkgeyBicmVhayB9XG4gICAgdXBkYXRlSGVpZ2h0c0luVmlld3BvcnQoY20pO1xuICAgIHZhciBiYXJNZWFzdXJlID0gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pO1xuICAgIHVwZGF0ZVNlbGVjdGlvbihjbSk7XG4gICAgdXBkYXRlU2Nyb2xsYmFycyhjbSwgYmFyTWVhc3VyZSk7XG4gICAgc2V0RG9jdW1lbnRIZWlnaHQoY20sIGJhck1lYXN1cmUpO1xuICB9XG5cbiAgdXBkYXRlLnNpZ25hbChjbSwgXCJ1cGRhdGVcIiwgY20pO1xuICBpZiAoY20uZGlzcGxheS52aWV3RnJvbSAhPSBjbS5kaXNwbGF5LnJlcG9ydGVkVmlld0Zyb20gfHwgY20uZGlzcGxheS52aWV3VG8gIT0gY20uZGlzcGxheS5yZXBvcnRlZFZpZXdUbykge1xuICAgIHVwZGF0ZS5zaWduYWwoY20sIFwidmlld3BvcnRDaGFuZ2VcIiwgY20sIGNtLmRpc3BsYXkudmlld0Zyb20sIGNtLmRpc3BsYXkudmlld1RvKTtcbiAgICBjbS5kaXNwbGF5LnJlcG9ydGVkVmlld0Zyb20gPSBjbS5kaXNwbGF5LnZpZXdGcm9tOyBjbS5kaXNwbGF5LnJlcG9ydGVkVmlld1RvID0gY20uZGlzcGxheS52aWV3VG87XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlRGlzcGxheVNpbXBsZShjbSwgdmlld3BvcnQpIHtcbiAgdmFyIHVwZGF0ZSA9IG5ldyBEaXNwbGF5VXBkYXRlKGNtLCB2aWV3cG9ydCk7XG4gIGlmICh1cGRhdGVEaXNwbGF5SWZOZWVkZWQoY20sIHVwZGF0ZSkpIHtcbiAgICB1cGRhdGVIZWlnaHRzSW5WaWV3cG9ydChjbSk7XG4gICAgcG9zdFVwZGF0ZURpc3BsYXkoY20sIHVwZGF0ZSk7XG4gICAgdmFyIGJhck1lYXN1cmUgPSBtZWFzdXJlRm9yU2Nyb2xsYmFycyhjbSk7XG4gICAgdXBkYXRlU2VsZWN0aW9uKGNtKTtcbiAgICB1cGRhdGVTY3JvbGxiYXJzKGNtLCBiYXJNZWFzdXJlKTtcbiAgICBzZXREb2N1bWVudEhlaWdodChjbSwgYmFyTWVhc3VyZSk7XG4gICAgdXBkYXRlLmZpbmlzaCgpO1xuICB9XG59XG5cbi8vIFN5bmMgdGhlIGFjdHVhbCBkaXNwbGF5IERPTSBzdHJ1Y3R1cmUgd2l0aCBkaXNwbGF5LnZpZXcsIHJlbW92aW5nXG4vLyBub2RlcyBmb3IgbGluZXMgdGhhdCBhcmUgbm8gbG9uZ2VyIGluIHZpZXcsIGFuZCBjcmVhdGluZyB0aGUgb25lc1xuLy8gdGhhdCBhcmUgbm90IHRoZXJlIHlldCwgYW5kIHVwZGF0aW5nIHRoZSBvbmVzIHRoYXQgYXJlIG91dCBvZlxuLy8gZGF0ZS5cbmZ1bmN0aW9uIHBhdGNoRGlzcGxheShjbSwgdXBkYXRlTnVtYmVyc0Zyb20sIGRpbXMpIHtcbiAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBsaW5lTnVtYmVycyA9IGNtLm9wdGlvbnMubGluZU51bWJlcnM7XG4gIHZhciBjb250YWluZXIgPSBkaXNwbGF5LmxpbmVEaXYsIGN1ciA9IGNvbnRhaW5lci5maXJzdENoaWxkO1xuXG4gIGZ1bmN0aW9uIHJtKG5vZGUpIHtcbiAgICB2YXIgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgLy8gV29ya3MgYXJvdW5kIGEgdGhyb3ctc2Nyb2xsIGJ1ZyBpbiBPUyBYIFdlYmtpdFxuICAgIGlmICh3ZWJraXQgJiYgbWFjICYmIGNtLmRpc3BsYXkuY3VycmVudFdoZWVsVGFyZ2V0ID09IG5vZGUpXG4gICAgICB7IG5vZGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiOyB9XG4gICAgZWxzZVxuICAgICAgeyBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7IH1cbiAgICByZXR1cm4gbmV4dFxuICB9XG5cbiAgdmFyIHZpZXcgPSBkaXNwbGF5LnZpZXcsIGxpbmVOID0gZGlzcGxheS52aWV3RnJvbTtcbiAgLy8gTG9vcCBvdmVyIHRoZSBlbGVtZW50cyBpbiB0aGUgdmlldywgc3luY2luZyBjdXIgKHRoZSBET00gbm9kZXNcbiAgLy8gaW4gZGlzcGxheS5saW5lRGl2KSB3aXRoIHRoZSB2aWV3IGFzIHdlIGdvLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbGluZVZpZXcgPSB2aWV3W2ldO1xuICAgIGlmIChsaW5lVmlldy5oaWRkZW4pIHtcbiAgICB9IGVsc2UgaWYgKCFsaW5lVmlldy5ub2RlIHx8IGxpbmVWaWV3Lm5vZGUucGFyZW50Tm9kZSAhPSBjb250YWluZXIpIHsgLy8gTm90IGRyYXduIHlldFxuICAgICAgdmFyIG5vZGUgPSBidWlsZExpbmVFbGVtZW50KGNtLCBsaW5lVmlldywgbGluZU4sIGRpbXMpO1xuICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShub2RlLCBjdXIpO1xuICAgIH0gZWxzZSB7IC8vIEFscmVhZHkgZHJhd25cbiAgICAgIHdoaWxlIChjdXIgIT0gbGluZVZpZXcubm9kZSkgeyBjdXIgPSBybShjdXIpOyB9XG4gICAgICB2YXIgdXBkYXRlTnVtYmVyID0gbGluZU51bWJlcnMgJiYgdXBkYXRlTnVtYmVyc0Zyb20gIT0gbnVsbCAmJlxuICAgICAgICB1cGRhdGVOdW1iZXJzRnJvbSA8PSBsaW5lTiAmJiBsaW5lVmlldy5saW5lTnVtYmVyO1xuICAgICAgaWYgKGxpbmVWaWV3LmNoYW5nZXMpIHtcbiAgICAgICAgaWYgKGluZGV4T2YobGluZVZpZXcuY2hhbmdlcywgXCJndXR0ZXJcIikgPiAtMSkgeyB1cGRhdGVOdW1iZXIgPSBmYWxzZTsgfVxuICAgICAgICB1cGRhdGVMaW5lRm9yQ2hhbmdlcyhjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKTtcbiAgICAgIH1cbiAgICAgIGlmICh1cGRhdGVOdW1iZXIpIHtcbiAgICAgICAgcmVtb3ZlQ2hpbGRyZW4obGluZVZpZXcubGluZU51bWJlcik7XG4gICAgICAgIGxpbmVWaWV3LmxpbmVOdW1iZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobGluZU51bWJlckZvcihjbS5vcHRpb25zLCBsaW5lTikpKTtcbiAgICAgIH1cbiAgICAgIGN1ciA9IGxpbmVWaWV3Lm5vZGUubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIGxpbmVOICs9IGxpbmVWaWV3LnNpemU7XG4gIH1cbiAgd2hpbGUgKGN1cikgeyBjdXIgPSBybShjdXIpOyB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUd1dHRlclNwYWNlKGNtKSB7XG4gIHZhciB3aWR0aCA9IGNtLmRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aDtcbiAgY20uZGlzcGxheS5zaXplci5zdHlsZS5tYXJnaW5MZWZ0ID0gd2lkdGggKyBcInB4XCI7XG59XG5cbmZ1bmN0aW9uIHNldERvY3VtZW50SGVpZ2h0KGNtLCBtZWFzdXJlKSB7XG4gIGNtLmRpc3BsYXkuc2l6ZXIuc3R5bGUubWluSGVpZ2h0ID0gbWVhc3VyZS5kb2NIZWlnaHQgKyBcInB4XCI7XG4gIGNtLmRpc3BsYXkuaGVpZ2h0Rm9yY2VyLnN0eWxlLnRvcCA9IG1lYXN1cmUuZG9jSGVpZ2h0ICsgXCJweFwiO1xuICBjbS5kaXNwbGF5Lmd1dHRlcnMuc3R5bGUuaGVpZ2h0ID0gKG1lYXN1cmUuZG9jSGVpZ2h0ICsgY20uZGlzcGxheS5iYXJIZWlnaHQgKyBzY3JvbGxHYXAoY20pKSArIFwicHhcIjtcbn1cblxuLy8gUmVidWlsZCB0aGUgZ3V0dGVyIGVsZW1lbnRzLCBlbnN1cmUgdGhlIG1hcmdpbiB0byB0aGUgbGVmdCBvZiB0aGVcbi8vIGNvZGUgbWF0Y2hlcyB0aGVpciB3aWR0aC5cbmZ1bmN0aW9uIHVwZGF0ZUd1dHRlcnMoY20pIHtcbiAgdmFyIGd1dHRlcnMgPSBjbS5kaXNwbGF5Lmd1dHRlcnMsIHNwZWNzID0gY20ub3B0aW9ucy5ndXR0ZXJzO1xuICByZW1vdmVDaGlsZHJlbihndXR0ZXJzKTtcbiAgdmFyIGkgPSAwO1xuICBmb3IgKDsgaSA8IHNwZWNzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGd1dHRlckNsYXNzID0gc3BlY3NbaV07XG4gICAgdmFyIGdFbHQgPSBndXR0ZXJzLmFwcGVuZENoaWxkKGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItZ3V0dGVyIFwiICsgZ3V0dGVyQ2xhc3MpKTtcbiAgICBpZiAoZ3V0dGVyQ2xhc3MgPT0gXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCIpIHtcbiAgICAgIGNtLmRpc3BsYXkubGluZUd1dHRlciA9IGdFbHQ7XG4gICAgICBnRWx0LnN0eWxlLndpZHRoID0gKGNtLmRpc3BsYXkubGluZU51bVdpZHRoIHx8IDEpICsgXCJweFwiO1xuICAgIH1cbiAgfVxuICBndXR0ZXJzLnN0eWxlLmRpc3BsYXkgPSBpID8gXCJcIiA6IFwibm9uZVwiO1xuICB1cGRhdGVHdXR0ZXJTcGFjZShjbSk7XG59XG5cbi8vIE1ha2Ugc3VyZSB0aGUgZ3V0dGVycyBvcHRpb25zIGNvbnRhaW5zIHRoZSBlbGVtZW50XG4vLyBcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIiB3aGVuIHRoZSBsaW5lTnVtYmVycyBvcHRpb24gaXMgdHJ1ZS5cbmZ1bmN0aW9uIHNldEd1dHRlcnNGb3JMaW5lTnVtYmVycyhvcHRpb25zKSB7XG4gIHZhciBmb3VuZCA9IGluZGV4T2Yob3B0aW9ucy5ndXR0ZXJzLCBcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIik7XG4gIGlmIChmb3VuZCA9PSAtMSAmJiBvcHRpb25zLmxpbmVOdW1iZXJzKSB7XG4gICAgb3B0aW9ucy5ndXR0ZXJzID0gb3B0aW9ucy5ndXR0ZXJzLmNvbmNhdChbXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCJdKTtcbiAgfSBlbHNlIGlmIChmb3VuZCA+IC0xICYmICFvcHRpb25zLmxpbmVOdW1iZXJzKSB7XG4gICAgb3B0aW9ucy5ndXR0ZXJzID0gb3B0aW9ucy5ndXR0ZXJzLnNsaWNlKDApO1xuICAgIG9wdGlvbnMuZ3V0dGVycy5zcGxpY2UoZm91bmQsIDEpO1xuICB9XG59XG5cbi8vIFNpbmNlIHRoZSBkZWx0YSB2YWx1ZXMgcmVwb3J0ZWQgb24gbW91c2Ugd2hlZWwgZXZlbnRzIGFyZVxuLy8gdW5zdGFuZGFyZGl6ZWQgYmV0d2VlbiBicm93c2VycyBhbmQgZXZlbiBicm93c2VyIHZlcnNpb25zLCBhbmRcbi8vIGdlbmVyYWxseSBob3JyaWJseSB1bnByZWRpY3RhYmxlLCB0aGlzIGNvZGUgc3RhcnRzIGJ5IG1lYXN1cmluZ1xuLy8gdGhlIHNjcm9sbCBlZmZlY3QgdGhhdCB0aGUgZmlyc3QgZmV3IG1vdXNlIHdoZWVsIGV2ZW50cyBoYXZlLFxuLy8gYW5kLCBmcm9tIHRoYXQsIGRldGVjdHMgdGhlIHdheSBpdCBjYW4gY29udmVydCBkZWx0YXMgdG8gcGl4ZWxcbi8vIG9mZnNldHMgYWZ0ZXJ3YXJkcy5cbi8vXG4vLyBUaGUgcmVhc29uIHdlIHdhbnQgdG8ga25vdyB0aGUgYW1vdW50IGEgd2hlZWwgZXZlbnQgd2lsbCBzY3JvbGxcbi8vIGlzIHRoYXQgaXQgZ2l2ZXMgdXMgYSBjaGFuY2UgdG8gdXBkYXRlIHRoZSBkaXNwbGF5IGJlZm9yZSB0aGVcbi8vIGFjdHVhbCBzY3JvbGxpbmcgaGFwcGVucywgcmVkdWNpbmcgZmxpY2tlcmluZy5cblxudmFyIHdoZWVsU2FtcGxlcyA9IDA7XG52YXIgd2hlZWxQaXhlbHNQZXJVbml0ID0gbnVsbDtcbi8vIEZpbGwgaW4gYSBicm93c2VyLWRldGVjdGVkIHN0YXJ0aW5nIHZhbHVlIG9uIGJyb3dzZXJzIHdoZXJlIHdlXG4vLyBrbm93IG9uZS4gVGhlc2UgZG9uJ3QgaGF2ZSB0byBiZSBhY2N1cmF0ZSAtLSB0aGUgcmVzdWx0IG9mIHRoZW1cbi8vIGJlaW5nIHdyb25nIHdvdWxkIGp1c3QgYmUgYSBzbGlnaHQgZmxpY2tlciBvbiB0aGUgZmlyc3Qgd2hlZWxcbi8vIHNjcm9sbCAoaWYgaXQgaXMgbGFyZ2UgZW5vdWdoKS5cbmlmIChpZSkgeyB3aGVlbFBpeGVsc1BlclVuaXQgPSAtLjUzOyB9XG5lbHNlIGlmIChnZWNrbykgeyB3aGVlbFBpeGVsc1BlclVuaXQgPSAxNTsgfVxuZWxzZSBpZiAoY2hyb21lKSB7IHdoZWVsUGl4ZWxzUGVyVW5pdCA9IC0uNzsgfVxuZWxzZSBpZiAoc2FmYXJpKSB7IHdoZWVsUGl4ZWxzUGVyVW5pdCA9IC0xLzM7IH1cblxuZnVuY3Rpb24gd2hlZWxFdmVudERlbHRhKGUpIHtcbiAgdmFyIGR4ID0gZS53aGVlbERlbHRhWCwgZHkgPSBlLndoZWVsRGVsdGFZO1xuICBpZiAoZHggPT0gbnVsbCAmJiBlLmRldGFpbCAmJiBlLmF4aXMgPT0gZS5IT1JJWk9OVEFMX0FYSVMpIHsgZHggPSBlLmRldGFpbDsgfVxuICBpZiAoZHkgPT0gbnVsbCAmJiBlLmRldGFpbCAmJiBlLmF4aXMgPT0gZS5WRVJUSUNBTF9BWElTKSB7IGR5ID0gZS5kZXRhaWw7IH1cbiAgZWxzZSBpZiAoZHkgPT0gbnVsbCkgeyBkeSA9IGUud2hlZWxEZWx0YTsgfVxuICByZXR1cm4ge3g6IGR4LCB5OiBkeX1cbn1cbmZ1bmN0aW9uIHdoZWVsRXZlbnRQaXhlbHMoZSkge1xuICB2YXIgZGVsdGEgPSB3aGVlbEV2ZW50RGVsdGEoZSk7XG4gIGRlbHRhLnggKj0gd2hlZWxQaXhlbHNQZXJVbml0O1xuICBkZWx0YS55ICo9IHdoZWVsUGl4ZWxzUGVyVW5pdDtcbiAgcmV0dXJuIGRlbHRhXG59XG5cbmZ1bmN0aW9uIG9uU2Nyb2xsV2hlZWwoY20sIGUpIHtcbiAgdmFyIGRlbHRhID0gd2hlZWxFdmVudERlbHRhKGUpLCBkeCA9IGRlbHRhLngsIGR5ID0gZGVsdGEueTtcblxuICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIHNjcm9sbCA9IGRpc3BsYXkuc2Nyb2xsZXI7XG4gIC8vIFF1aXQgaWYgdGhlcmUncyBub3RoaW5nIHRvIHNjcm9sbCBoZXJlXG4gIHZhciBjYW5TY3JvbGxYID0gc2Nyb2xsLnNjcm9sbFdpZHRoID4gc2Nyb2xsLmNsaWVudFdpZHRoO1xuICB2YXIgY2FuU2Nyb2xsWSA9IHNjcm9sbC5zY3JvbGxIZWlnaHQgPiBzY3JvbGwuY2xpZW50SGVpZ2h0O1xuICBpZiAoIShkeCAmJiBjYW5TY3JvbGxYIHx8IGR5ICYmIGNhblNjcm9sbFkpKSB7IHJldHVybiB9XG5cbiAgLy8gV2Via2l0IGJyb3dzZXJzIG9uIE9TIFggYWJvcnQgbW9tZW50dW0gc2Nyb2xscyB3aGVuIHRoZSB0YXJnZXRcbiAgLy8gb2YgdGhlIHNjcm9sbCBldmVudCBpcyByZW1vdmVkIGZyb20gdGhlIHNjcm9sbGFibGUgZWxlbWVudC5cbiAgLy8gVGhpcyBoYWNrIChzZWUgcmVsYXRlZCBjb2RlIGluIHBhdGNoRGlzcGxheSkgbWFrZXMgc3VyZSB0aGVcbiAgLy8gZWxlbWVudCBpcyBrZXB0IGFyb3VuZC5cbiAgaWYgKGR5ICYmIG1hYyAmJiB3ZWJraXQpIHtcbiAgICBvdXRlcjogZm9yICh2YXIgY3VyID0gZS50YXJnZXQsIHZpZXcgPSBkaXNwbGF5LnZpZXc7IGN1ciAhPSBzY3JvbGw7IGN1ciA9IGN1ci5wYXJlbnROb2RlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHZpZXdbaV0ubm9kZSA9PSBjdXIpIHtcbiAgICAgICAgICBjbS5kaXNwbGF5LmN1cnJlbnRXaGVlbFRhcmdldCA9IGN1cjtcbiAgICAgICAgICBicmVhayBvdXRlclxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gT24gc29tZSBicm93c2VycywgaG9yaXpvbnRhbCBzY3JvbGxpbmcgd2lsbCBjYXVzZSByZWRyYXdzIHRvXG4gIC8vIGhhcHBlbiBiZWZvcmUgdGhlIGd1dHRlciBoYXMgYmVlbiByZWFsaWduZWQsIGNhdXNpbmcgaXQgdG9cbiAgLy8gd3JpZ2dsZSBhcm91bmQgaW4gYSBtb3N0IHVuc2VlbWx5IHdheS4gV2hlbiB3ZSBoYXZlIGFuXG4gIC8vIGVzdGltYXRlZCBwaXhlbHMvZGVsdGEgdmFsdWUsIHdlIGp1c3QgaGFuZGxlIGhvcml6b250YWxcbiAgLy8gc2Nyb2xsaW5nIGVudGlyZWx5IGhlcmUuIEl0J2xsIGJlIHNsaWdodGx5IG9mZiBmcm9tIG5hdGl2ZSwgYnV0XG4gIC8vIGJldHRlciB0aGFuIGdsaXRjaGluZyBvdXQuXG4gIGlmIChkeCAmJiAhZ2Vja28gJiYgIXByZXN0byAmJiB3aGVlbFBpeGVsc1BlclVuaXQgIT0gbnVsbCkge1xuICAgIGlmIChkeSAmJiBjYW5TY3JvbGxZKVxuICAgICAgeyB1cGRhdGVTY3JvbGxUb3AoY20sIE1hdGgubWF4KDAsIHNjcm9sbC5zY3JvbGxUb3AgKyBkeSAqIHdoZWVsUGl4ZWxzUGVyVW5pdCkpOyB9XG4gICAgc2V0U2Nyb2xsTGVmdChjbSwgTWF0aC5tYXgoMCwgc2Nyb2xsLnNjcm9sbExlZnQgKyBkeCAqIHdoZWVsUGl4ZWxzUGVyVW5pdCkpO1xuICAgIC8vIE9ubHkgcHJldmVudCBkZWZhdWx0IHNjcm9sbGluZyBpZiB2ZXJ0aWNhbCBzY3JvbGxpbmcgaXNcbiAgICAvLyBhY3R1YWxseSBwb3NzaWJsZS4gT3RoZXJ3aXNlLCBpdCBjYXVzZXMgdmVydGljYWwgc2Nyb2xsXG4gICAgLy8gaml0dGVyIG9uIE9TWCB0cmFja3BhZHMgd2hlbiBkZWx0YVggaXMgc21hbGwgYW5kIGRlbHRhWVxuICAgIC8vIGlzIGxhcmdlIChpc3N1ZSAjMzU3OSlcbiAgICBpZiAoIWR5IHx8IChkeSAmJiBjYW5TY3JvbGxZKSlcbiAgICAgIHsgZV9wcmV2ZW50RGVmYXVsdChlKTsgfVxuICAgIGRpc3BsYXkud2hlZWxTdGFydFggPSBudWxsOyAvLyBBYm9ydCBtZWFzdXJlbWVudCwgaWYgaW4gcHJvZ3Jlc3NcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vICdQcm9qZWN0JyB0aGUgdmlzaWJsZSB2aWV3cG9ydCB0byBjb3ZlciB0aGUgYXJlYSB0aGF0IGlzIGJlaW5nXG4gIC8vIHNjcm9sbGVkIGludG8gdmlldyAoaWYgd2Uga25vdyBlbm91Z2ggdG8gZXN0aW1hdGUgaXQpLlxuICBpZiAoZHkgJiYgd2hlZWxQaXhlbHNQZXJVbml0ICE9IG51bGwpIHtcbiAgICB2YXIgcGl4ZWxzID0gZHkgKiB3aGVlbFBpeGVsc1BlclVuaXQ7XG4gICAgdmFyIHRvcCA9IGNtLmRvYy5zY3JvbGxUb3AsIGJvdCA9IHRvcCArIGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQ7XG4gICAgaWYgKHBpeGVscyA8IDApIHsgdG9wID0gTWF0aC5tYXgoMCwgdG9wICsgcGl4ZWxzIC0gNTApOyB9XG4gICAgZWxzZSB7IGJvdCA9IE1hdGgubWluKGNtLmRvYy5oZWlnaHQsIGJvdCArIHBpeGVscyArIDUwKTsgfVxuICAgIHVwZGF0ZURpc3BsYXlTaW1wbGUoY20sIHt0b3A6IHRvcCwgYm90dG9tOiBib3R9KTtcbiAgfVxuXG4gIGlmICh3aGVlbFNhbXBsZXMgPCAyMCkge1xuICAgIGlmIChkaXNwbGF5LndoZWVsU3RhcnRYID09IG51bGwpIHtcbiAgICAgIGRpc3BsYXkud2hlZWxTdGFydFggPSBzY3JvbGwuc2Nyb2xsTGVmdDsgZGlzcGxheS53aGVlbFN0YXJ0WSA9IHNjcm9sbC5zY3JvbGxUb3A7XG4gICAgICBkaXNwbGF5LndoZWVsRFggPSBkeDsgZGlzcGxheS53aGVlbERZID0gZHk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRpc3BsYXkud2hlZWxTdGFydFggPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgICAgICB2YXIgbW92ZWRYID0gc2Nyb2xsLnNjcm9sbExlZnQgLSBkaXNwbGF5LndoZWVsU3RhcnRYO1xuICAgICAgICB2YXIgbW92ZWRZID0gc2Nyb2xsLnNjcm9sbFRvcCAtIGRpc3BsYXkud2hlZWxTdGFydFk7XG4gICAgICAgIHZhciBzYW1wbGUgPSAobW92ZWRZICYmIGRpc3BsYXkud2hlZWxEWSAmJiBtb3ZlZFkgLyBkaXNwbGF5LndoZWVsRFkpIHx8XG4gICAgICAgICAgKG1vdmVkWCAmJiBkaXNwbGF5LndoZWVsRFggJiYgbW92ZWRYIC8gZGlzcGxheS53aGVlbERYKTtcbiAgICAgICAgZGlzcGxheS53aGVlbFN0YXJ0WCA9IGRpc3BsYXkud2hlZWxTdGFydFkgPSBudWxsO1xuICAgICAgICBpZiAoIXNhbXBsZSkgeyByZXR1cm4gfVxuICAgICAgICB3aGVlbFBpeGVsc1BlclVuaXQgPSAod2hlZWxQaXhlbHNQZXJVbml0ICogd2hlZWxTYW1wbGVzICsgc2FtcGxlKSAvICh3aGVlbFNhbXBsZXMgKyAxKTtcbiAgICAgICAgKyt3aGVlbFNhbXBsZXM7XG4gICAgICB9LCAyMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXNwbGF5LndoZWVsRFggKz0gZHg7IGRpc3BsYXkud2hlZWxEWSArPSBkeTtcbiAgICB9XG4gIH1cbn1cblxuLy8gU2VsZWN0aW9uIG9iamVjdHMgYXJlIGltbXV0YWJsZS4gQSBuZXcgb25lIGlzIGNyZWF0ZWQgZXZlcnkgdGltZVxuLy8gdGhlIHNlbGVjdGlvbiBjaGFuZ2VzLiBBIHNlbGVjdGlvbiBpcyBvbmUgb3IgbW9yZSBub24tb3ZlcmxhcHBpbmdcbi8vIChhbmQgbm9uLXRvdWNoaW5nKSByYW5nZXMsIHNvcnRlZCwgYW5kIGFuIGludGVnZXIgdGhhdCBpbmRpY2F0ZXNcbi8vIHdoaWNoIG9uZSBpcyB0aGUgcHJpbWFyeSBzZWxlY3Rpb24gKHRoZSBvbmUgdGhhdCdzIHNjcm9sbGVkIGludG9cbi8vIHZpZXcsIHRoYXQgZ2V0Q3Vyc29yIHJldHVybnMsIGV0YykuXG52YXIgU2VsZWN0aW9uID0gZnVuY3Rpb24ocmFuZ2VzLCBwcmltSW5kZXgpIHtcbiAgdGhpcy5yYW5nZXMgPSByYW5nZXM7XG4gIHRoaXMucHJpbUluZGV4ID0gcHJpbUluZGV4O1xufTtcblxuU2VsZWN0aW9uLnByb3RvdHlwZS5wcmltYXJ5ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5yYW5nZXNbdGhpcy5wcmltSW5kZXhdIH07XG5cblNlbGVjdGlvbi5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgaWYgKG90aGVyID09IHRoaXMpIHsgcmV0dXJuIHRydWUgfVxuICBpZiAob3RoZXIucHJpbUluZGV4ICE9IHRoaXMucHJpbUluZGV4IHx8IG90aGVyLnJhbmdlcy5sZW5ndGggIT0gdGhpcy5yYW5nZXMubGVuZ3RoKSB7IHJldHVybiBmYWxzZSB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaGVyZSA9IHRoaXMkMS5yYW5nZXNbaV0sIHRoZXJlID0gb3RoZXIucmFuZ2VzW2ldO1xuICAgIGlmICghZXF1YWxDdXJzb3JQb3MoaGVyZS5hbmNob3IsIHRoZXJlLmFuY2hvcikgfHwgIWVxdWFsQ3Vyc29yUG9zKGhlcmUuaGVhZCwgdGhlcmUuaGVhZCkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgfVxuICByZXR1cm4gdHJ1ZVxufTtcblxuU2VsZWN0aW9uLnByb3RvdHlwZS5kZWVwQ29weSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB2YXIgb3V0ID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgeyBvdXRbaV0gPSBuZXcgUmFuZ2UoY29weVBvcyh0aGlzJDEucmFuZ2VzW2ldLmFuY2hvciksIGNvcHlQb3ModGhpcyQxLnJhbmdlc1tpXS5oZWFkKSk7IH1cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24ob3V0LCB0aGlzLnByaW1JbmRleClcbn07XG5cblNlbGVjdGlvbi5wcm90b3R5cGUuc29tZXRoaW5nU2VsZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGkrKylcbiAgICB7IGlmICghdGhpcyQxLnJhbmdlc1tpXS5lbXB0eSgpKSB7IHJldHVybiB0cnVlIH0gfVxuICByZXR1cm4gZmFsc2Vcbn07XG5cblNlbGVjdGlvbi5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAocG9zLCBlbmQpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAoIWVuZCkgeyBlbmQgPSBwb3M7IH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciByYW5nZSA9IHRoaXMkMS5yYW5nZXNbaV07XG4gICAgaWYgKGNtcChlbmQsIHJhbmdlLmZyb20oKSkgPj0gMCAmJiBjbXAocG9zLCByYW5nZS50bygpKSA8PSAwKVxuICAgICAgeyByZXR1cm4gaSB9XG4gIH1cbiAgcmV0dXJuIC0xXG59O1xuXG52YXIgUmFuZ2UgPSBmdW5jdGlvbihhbmNob3IsIGhlYWQpIHtcbiAgdGhpcy5hbmNob3IgPSBhbmNob3I7IHRoaXMuaGVhZCA9IGhlYWQ7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUuZnJvbSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1pblBvcyh0aGlzLmFuY2hvciwgdGhpcy5oZWFkKSB9O1xuUmFuZ2UucHJvdG90eXBlLnRvID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF4UG9zKHRoaXMuYW5jaG9yLCB0aGlzLmhlYWQpIH07XG5SYW5nZS5wcm90b3R5cGUuZW1wdHkgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmhlYWQubGluZSA9PSB0aGlzLmFuY2hvci5saW5lICYmIHRoaXMuaGVhZC5jaCA9PSB0aGlzLmFuY2hvci5jaCB9O1xuXG4vLyBUYWtlIGFuIHVuc29ydGVkLCBwb3RlbnRpYWxseSBvdmVybGFwcGluZyBzZXQgb2YgcmFuZ2VzLCBhbmRcbi8vIGJ1aWxkIGEgc2VsZWN0aW9uIG91dCBvZiBpdC4gJ0NvbnN1bWVzJyByYW5nZXMgYXJyYXkgKG1vZGlmeWluZ1xuLy8gaXQpLlxuZnVuY3Rpb24gbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcywgcHJpbUluZGV4KSB7XG4gIHZhciBwcmltID0gcmFuZ2VzW3ByaW1JbmRleF07XG4gIHJhbmdlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBjbXAoYS5mcm9tKCksIGIuZnJvbSgpKTsgfSk7XG4gIHByaW1JbmRleCA9IGluZGV4T2YocmFuZ2VzLCBwcmltKTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY3VyID0gcmFuZ2VzW2ldLCBwcmV2ID0gcmFuZ2VzW2kgLSAxXTtcbiAgICBpZiAoY21wKHByZXYudG8oKSwgY3VyLmZyb20oKSkgPj0gMCkge1xuICAgICAgdmFyIGZyb20gPSBtaW5Qb3MocHJldi5mcm9tKCksIGN1ci5mcm9tKCkpLCB0byA9IG1heFBvcyhwcmV2LnRvKCksIGN1ci50bygpKTtcbiAgICAgIHZhciBpbnYgPSBwcmV2LmVtcHR5KCkgPyBjdXIuZnJvbSgpID09IGN1ci5oZWFkIDogcHJldi5mcm9tKCkgPT0gcHJldi5oZWFkO1xuICAgICAgaWYgKGkgPD0gcHJpbUluZGV4KSB7IC0tcHJpbUluZGV4OyB9XG4gICAgICByYW5nZXMuc3BsaWNlKC0taSwgMiwgbmV3IFJhbmdlKGludiA/IHRvIDogZnJvbSwgaW52ID8gZnJvbSA6IHRvKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHJhbmdlcywgcHJpbUluZGV4KVxufVxuXG5mdW5jdGlvbiBzaW1wbGVTZWxlY3Rpb24oYW5jaG9yLCBoZWFkKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKFtuZXcgUmFuZ2UoYW5jaG9yLCBoZWFkIHx8IGFuY2hvcildLCAwKVxufVxuXG4vLyBDb21wdXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgZW5kIG9mIGEgY2hhbmdlIChpdHMgJ3RvJyBwcm9wZXJ0eVxuLy8gcmVmZXJzIHRvIHRoZSBwcmUtY2hhbmdlIGVuZCkuXG5mdW5jdGlvbiBjaGFuZ2VFbmQoY2hhbmdlKSB7XG4gIGlmICghY2hhbmdlLnRleHQpIHsgcmV0dXJuIGNoYW5nZS50byB9XG4gIHJldHVybiBQb3MoY2hhbmdlLmZyb20ubGluZSArIGNoYW5nZS50ZXh0Lmxlbmd0aCAtIDEsXG4gICAgICAgICAgICAgbHN0KGNoYW5nZS50ZXh0KS5sZW5ndGggKyAoY2hhbmdlLnRleHQubGVuZ3RoID09IDEgPyBjaGFuZ2UuZnJvbS5jaCA6IDApKVxufVxuXG4vLyBBZGp1c3QgYSBwb3NpdGlvbiB0byByZWZlciB0byB0aGUgcG9zdC1jaGFuZ2UgcG9zaXRpb24gb2YgdGhlXG4vLyBzYW1lIHRleHQsIG9yIHRoZSBlbmQgb2YgdGhlIGNoYW5nZSBpZiB0aGUgY2hhbmdlIGNvdmVycyBpdC5cbmZ1bmN0aW9uIGFkanVzdEZvckNoYW5nZShwb3MsIGNoYW5nZSkge1xuICBpZiAoY21wKHBvcywgY2hhbmdlLmZyb20pIDwgMCkgeyByZXR1cm4gcG9zIH1cbiAgaWYgKGNtcChwb3MsIGNoYW5nZS50bykgPD0gMCkgeyByZXR1cm4gY2hhbmdlRW5kKGNoYW5nZSkgfVxuXG4gIHZhciBsaW5lID0gcG9zLmxpbmUgKyBjaGFuZ2UudGV4dC5sZW5ndGggLSAoY2hhbmdlLnRvLmxpbmUgLSBjaGFuZ2UuZnJvbS5saW5lKSAtIDEsIGNoID0gcG9zLmNoO1xuICBpZiAocG9zLmxpbmUgPT0gY2hhbmdlLnRvLmxpbmUpIHsgY2ggKz0gY2hhbmdlRW5kKGNoYW5nZSkuY2ggLSBjaGFuZ2UudG8uY2g7IH1cbiAgcmV0dXJuIFBvcyhsaW5lLCBjaClcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNlbEFmdGVyQ2hhbmdlKGRvYywgY2hhbmdlKSB7XG4gIHZhciBvdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb2Muc2VsLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciByYW5nZSA9IGRvYy5zZWwucmFuZ2VzW2ldO1xuICAgIG91dC5wdXNoKG5ldyBSYW5nZShhZGp1c3RGb3JDaGFuZ2UocmFuZ2UuYW5jaG9yLCBjaGFuZ2UpLFxuICAgICAgICAgICAgICAgICAgICAgICBhZGp1c3RGb3JDaGFuZ2UocmFuZ2UuaGVhZCwgY2hhbmdlKSkpO1xuICB9XG4gIHJldHVybiBub3JtYWxpemVTZWxlY3Rpb24ob3V0LCBkb2Muc2VsLnByaW1JbmRleClcbn1cblxuZnVuY3Rpb24gb2Zmc2V0UG9zKHBvcywgb2xkLCBudykge1xuICBpZiAocG9zLmxpbmUgPT0gb2xkLmxpbmUpXG4gICAgeyByZXR1cm4gUG9zKG53LmxpbmUsIHBvcy5jaCAtIG9sZC5jaCArIG53LmNoKSB9XG4gIGVsc2VcbiAgICB7IHJldHVybiBQb3MobncubGluZSArIChwb3MubGluZSAtIG9sZC5saW5lKSwgcG9zLmNoKSB9XG59XG5cbi8vIFVzZWQgYnkgcmVwbGFjZVNlbGVjdGlvbnMgdG8gYWxsb3cgbW92aW5nIHRoZSBzZWxlY3Rpb24gdG8gdGhlXG4vLyBzdGFydCBvciBhcm91bmQgdGhlIHJlcGxhY2VkIHRlc3QuIEhpbnQgbWF5IGJlIFwic3RhcnRcIiBvciBcImFyb3VuZFwiLlxuZnVuY3Rpb24gY29tcHV0ZVJlcGxhY2VkU2VsKGRvYywgY2hhbmdlcywgaGludCkge1xuICB2YXIgb3V0ID0gW107XG4gIHZhciBvbGRQcmV2ID0gUG9zKGRvYy5maXJzdCwgMCksIG5ld1ByZXYgPSBvbGRQcmV2O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY2hhbmdlID0gY2hhbmdlc1tpXTtcbiAgICB2YXIgZnJvbSA9IG9mZnNldFBvcyhjaGFuZ2UuZnJvbSwgb2xkUHJldiwgbmV3UHJldik7XG4gICAgdmFyIHRvID0gb2Zmc2V0UG9zKGNoYW5nZUVuZChjaGFuZ2UpLCBvbGRQcmV2LCBuZXdQcmV2KTtcbiAgICBvbGRQcmV2ID0gY2hhbmdlLnRvO1xuICAgIG5ld1ByZXYgPSB0bztcbiAgICBpZiAoaGludCA9PSBcImFyb3VuZFwiKSB7XG4gICAgICB2YXIgcmFuZ2UgPSBkb2Muc2VsLnJhbmdlc1tpXSwgaW52ID0gY21wKHJhbmdlLmhlYWQsIHJhbmdlLmFuY2hvcikgPCAwO1xuICAgICAgb3V0W2ldID0gbmV3IFJhbmdlKGludiA/IHRvIDogZnJvbSwgaW52ID8gZnJvbSA6IHRvKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0W2ldID0gbmV3IFJhbmdlKGZyb20sIGZyb20pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihvdXQsIGRvYy5zZWwucHJpbUluZGV4KVxufVxuXG4vLyBVc2VkIHRvIGdldCB0aGUgZWRpdG9yIGludG8gYSBjb25zaXN0ZW50IHN0YXRlIGFnYWluIHdoZW4gb3B0aW9ucyBjaGFuZ2UuXG5cbmZ1bmN0aW9uIGxvYWRNb2RlKGNtKSB7XG4gIGNtLmRvYy5tb2RlID0gZ2V0TW9kZShjbS5vcHRpb25zLCBjbS5kb2MubW9kZU9wdGlvbik7XG4gIHJlc2V0TW9kZVN0YXRlKGNtKTtcbn1cblxuZnVuY3Rpb24gcmVzZXRNb2RlU3RhdGUoY20pIHtcbiAgY20uZG9jLml0ZXIoZnVuY3Rpb24gKGxpbmUpIHtcbiAgICBpZiAobGluZS5zdGF0ZUFmdGVyKSB7IGxpbmUuc3RhdGVBZnRlciA9IG51bGw7IH1cbiAgICBpZiAobGluZS5zdHlsZXMpIHsgbGluZS5zdHlsZXMgPSBudWxsOyB9XG4gIH0pO1xuICBjbS5kb2MuZnJvbnRpZXIgPSBjbS5kb2MuZmlyc3Q7XG4gIHN0YXJ0V29ya2VyKGNtLCAxMDApO1xuICBjbS5zdGF0ZS5tb2RlR2VuKys7XG4gIGlmIChjbS5jdXJPcCkgeyByZWdDaGFuZ2UoY20pOyB9XG59XG5cbi8vIERPQ1VNRU5UIERBVEEgU1RSVUNUVVJFXG5cbi8vIEJ5IGRlZmF1bHQsIHVwZGF0ZXMgdGhhdCBzdGFydCBhbmQgZW5kIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lXG4vLyBhcmUgdHJlYXRlZCBzcGVjaWFsbHksIGluIG9yZGVyIHRvIG1ha2UgdGhlIGFzc29jaWF0aW9uIG9mIGxpbmVcbi8vIHdpZGdldHMgYW5kIG1hcmtlciBlbGVtZW50cyB3aXRoIHRoZSB0ZXh0IGJlaGF2ZSBtb3JlIGludHVpdGl2ZS5cbmZ1bmN0aW9uIGlzV2hvbGVMaW5lVXBkYXRlKGRvYywgY2hhbmdlKSB7XG4gIHJldHVybiBjaGFuZ2UuZnJvbS5jaCA9PSAwICYmIGNoYW5nZS50by5jaCA9PSAwICYmIGxzdChjaGFuZ2UudGV4dCkgPT0gXCJcIiAmJlxuICAgICghZG9jLmNtIHx8IGRvYy5jbS5vcHRpb25zLndob2xlTGluZVVwZGF0ZUJlZm9yZSlcbn1cblxuLy8gUGVyZm9ybSBhIGNoYW5nZSBvbiB0aGUgZG9jdW1lbnQgZGF0YSBzdHJ1Y3R1cmUuXG5mdW5jdGlvbiB1cGRhdGVEb2MoZG9jLCBjaGFuZ2UsIG1hcmtlZFNwYW5zLCBlc3RpbWF0ZUhlaWdodCQkMSkge1xuICBmdW5jdGlvbiBzcGFuc0ZvcihuKSB7cmV0dXJuIG1hcmtlZFNwYW5zID8gbWFya2VkU3BhbnNbbl0gOiBudWxsfVxuICBmdW5jdGlvbiB1cGRhdGUobGluZSwgdGV4dCwgc3BhbnMpIHtcbiAgICB1cGRhdGVMaW5lKGxpbmUsIHRleHQsIHNwYW5zLCBlc3RpbWF0ZUhlaWdodCQkMSk7XG4gICAgc2lnbmFsTGF0ZXIobGluZSwgXCJjaGFuZ2VcIiwgbGluZSwgY2hhbmdlKTtcbiAgfVxuICBmdW5jdGlvbiBsaW5lc0ZvcihzdGFydCwgZW5kKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKVxuICAgICAgeyByZXN1bHQucHVzaChuZXcgTGluZSh0ZXh0W2ldLCBzcGFuc0ZvcihpKSwgZXN0aW1hdGVIZWlnaHQkJDEpKTsgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHZhciBmcm9tID0gY2hhbmdlLmZyb20sIHRvID0gY2hhbmdlLnRvLCB0ZXh0ID0gY2hhbmdlLnRleHQ7XG4gIHZhciBmaXJzdExpbmUgPSBnZXRMaW5lKGRvYywgZnJvbS5saW5lKSwgbGFzdExpbmUgPSBnZXRMaW5lKGRvYywgdG8ubGluZSk7XG4gIHZhciBsYXN0VGV4dCA9IGxzdCh0ZXh0KSwgbGFzdFNwYW5zID0gc3BhbnNGb3IodGV4dC5sZW5ndGggLSAxKSwgbmxpbmVzID0gdG8ubGluZSAtIGZyb20ubGluZTtcblxuICAvLyBBZGp1c3QgdGhlIGxpbmUgc3RydWN0dXJlXG4gIGlmIChjaGFuZ2UuZnVsbCkge1xuICAgIGRvYy5pbnNlcnQoMCwgbGluZXNGb3IoMCwgdGV4dC5sZW5ndGgpKTtcbiAgICBkb2MucmVtb3ZlKHRleHQubGVuZ3RoLCBkb2Muc2l6ZSAtIHRleHQubGVuZ3RoKTtcbiAgfSBlbHNlIGlmIChpc1dob2xlTGluZVVwZGF0ZShkb2MsIGNoYW5nZSkpIHtcbiAgICAvLyBUaGlzIGlzIGEgd2hvbGUtbGluZSByZXBsYWNlLiBUcmVhdGVkIHNwZWNpYWxseSB0byBtYWtlXG4gICAgLy8gc3VyZSBsaW5lIG9iamVjdHMgbW92ZSB0aGUgd2F5IHRoZXkgYXJlIHN1cHBvc2VkIHRvLlxuICAgIHZhciBhZGRlZCA9IGxpbmVzRm9yKDAsIHRleHQubGVuZ3RoIC0gMSk7XG4gICAgdXBkYXRlKGxhc3RMaW5lLCBsYXN0TGluZS50ZXh0LCBsYXN0U3BhbnMpO1xuICAgIGlmIChubGluZXMpIHsgZG9jLnJlbW92ZShmcm9tLmxpbmUsIG5saW5lcyk7IH1cbiAgICBpZiAoYWRkZWQubGVuZ3RoKSB7IGRvYy5pbnNlcnQoZnJvbS5saW5lLCBhZGRlZCk7IH1cbiAgfSBlbHNlIGlmIChmaXJzdExpbmUgPT0gbGFzdExpbmUpIHtcbiAgICBpZiAodGV4dC5sZW5ndGggPT0gMSkge1xuICAgICAgdXBkYXRlKGZpcnN0TGluZSwgZmlyc3RMaW5lLnRleHQuc2xpY2UoMCwgZnJvbS5jaCkgKyBsYXN0VGV4dCArIGZpcnN0TGluZS50ZXh0LnNsaWNlKHRvLmNoKSwgbGFzdFNwYW5zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFkZGVkJDEgPSBsaW5lc0ZvcigxLCB0ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgYWRkZWQkMS5wdXNoKG5ldyBMaW5lKGxhc3RUZXh0ICsgZmlyc3RMaW5lLnRleHQuc2xpY2UodG8uY2gpLCBsYXN0U3BhbnMsIGVzdGltYXRlSGVpZ2h0JCQxKSk7XG4gICAgICB1cGRhdGUoZmlyc3RMaW5lLCBmaXJzdExpbmUudGV4dC5zbGljZSgwLCBmcm9tLmNoKSArIHRleHRbMF0sIHNwYW5zRm9yKDApKTtcbiAgICAgIGRvYy5pbnNlcnQoZnJvbS5saW5lICsgMSwgYWRkZWQkMSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHRleHQubGVuZ3RoID09IDEpIHtcbiAgICB1cGRhdGUoZmlyc3RMaW5lLCBmaXJzdExpbmUudGV4dC5zbGljZSgwLCBmcm9tLmNoKSArIHRleHRbMF0gKyBsYXN0TGluZS50ZXh0LnNsaWNlKHRvLmNoKSwgc3BhbnNGb3IoMCkpO1xuICAgIGRvYy5yZW1vdmUoZnJvbS5saW5lICsgMSwgbmxpbmVzKTtcbiAgfSBlbHNlIHtcbiAgICB1cGRhdGUoZmlyc3RMaW5lLCBmaXJzdExpbmUudGV4dC5zbGljZSgwLCBmcm9tLmNoKSArIHRleHRbMF0sIHNwYW5zRm9yKDApKTtcbiAgICB1cGRhdGUobGFzdExpbmUsIGxhc3RUZXh0ICsgbGFzdExpbmUudGV4dC5zbGljZSh0by5jaCksIGxhc3RTcGFucyk7XG4gICAgdmFyIGFkZGVkJDIgPSBsaW5lc0ZvcigxLCB0ZXh0Lmxlbmd0aCAtIDEpO1xuICAgIGlmIChubGluZXMgPiAxKSB7IGRvYy5yZW1vdmUoZnJvbS5saW5lICsgMSwgbmxpbmVzIC0gMSk7IH1cbiAgICBkb2MuaW5zZXJ0KGZyb20ubGluZSArIDEsIGFkZGVkJDIpO1xuICB9XG5cbiAgc2lnbmFsTGF0ZXIoZG9jLCBcImNoYW5nZVwiLCBkb2MsIGNoYW5nZSk7XG59XG5cbi8vIENhbGwgZiBmb3IgYWxsIGxpbmtlZCBkb2N1bWVudHMuXG5mdW5jdGlvbiBsaW5rZWREb2NzKGRvYywgZiwgc2hhcmVkSGlzdE9ubHkpIHtcbiAgZnVuY3Rpb24gcHJvcGFnYXRlKGRvYywgc2tpcCwgc2hhcmVkSGlzdCkge1xuICAgIGlmIChkb2MubGlua2VkKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLmxpbmtlZC5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHJlbCA9IGRvYy5saW5rZWRbaV07XG4gICAgICBpZiAocmVsLmRvYyA9PSBza2lwKSB7IGNvbnRpbnVlIH1cbiAgICAgIHZhciBzaGFyZWQgPSBzaGFyZWRIaXN0ICYmIHJlbC5zaGFyZWRIaXN0O1xuICAgICAgaWYgKHNoYXJlZEhpc3RPbmx5ICYmICFzaGFyZWQpIHsgY29udGludWUgfVxuICAgICAgZihyZWwuZG9jLCBzaGFyZWQpO1xuICAgICAgcHJvcGFnYXRlKHJlbC5kb2MsIGRvYywgc2hhcmVkKTtcbiAgICB9IH1cbiAgfVxuICBwcm9wYWdhdGUoZG9jLCBudWxsLCB0cnVlKTtcbn1cblxuLy8gQXR0YWNoIGEgZG9jdW1lbnQgdG8gYW4gZWRpdG9yLlxuZnVuY3Rpb24gYXR0YWNoRG9jKGNtLCBkb2MpIHtcbiAgaWYgKGRvYy5jbSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGRvY3VtZW50IGlzIGFscmVhZHkgaW4gdXNlLlwiKSB9XG4gIGNtLmRvYyA9IGRvYztcbiAgZG9jLmNtID0gY207XG4gIGVzdGltYXRlTGluZUhlaWdodHMoY20pO1xuICBsb2FkTW9kZShjbSk7XG4gIHNldERpcmVjdGlvbkNsYXNzKGNtKTtcbiAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykgeyBmaW5kTWF4TGluZShjbSk7IH1cbiAgY20ub3B0aW9ucy5tb2RlID0gZG9jLm1vZGVPcHRpb247XG4gIHJlZ0NoYW5nZShjbSk7XG59XG5cbmZ1bmN0aW9uIHNldERpcmVjdGlvbkNsYXNzKGNtKSB7XG4gIChjbS5kb2MuZGlyZWN0aW9uID09IFwicnRsXCIgPyBhZGRDbGFzcyA6IHJtQ2xhc3MpKGNtLmRpc3BsYXkubGluZURpdiwgXCJDb2RlTWlycm9yLXJ0bFwiKTtcbn1cblxuZnVuY3Rpb24gZGlyZWN0aW9uQ2hhbmdlZChjbSkge1xuICBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgc2V0RGlyZWN0aW9uQ2xhc3MoY20pO1xuICAgIHJlZ0NoYW5nZShjbSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBIaXN0b3J5KHN0YXJ0R2VuKSB7XG4gIC8vIEFycmF5cyBvZiBjaGFuZ2UgZXZlbnRzIGFuZCBzZWxlY3Rpb25zLiBEb2luZyBzb21ldGhpbmcgYWRkcyBhblxuICAvLyBldmVudCB0byBkb25lIGFuZCBjbGVhcnMgdW5kby4gVW5kb2luZyBtb3ZlcyBldmVudHMgZnJvbSBkb25lXG4gIC8vIHRvIHVuZG9uZSwgcmVkb2luZyBtb3ZlcyB0aGVtIGluIHRoZSBvdGhlciBkaXJlY3Rpb24uXG4gIHRoaXMuZG9uZSA9IFtdOyB0aGlzLnVuZG9uZSA9IFtdO1xuICB0aGlzLnVuZG9EZXB0aCA9IEluZmluaXR5O1xuICAvLyBVc2VkIHRvIHRyYWNrIHdoZW4gY2hhbmdlcyBjYW4gYmUgbWVyZ2VkIGludG8gYSBzaW5nbGUgdW5kb1xuICAvLyBldmVudFxuICB0aGlzLmxhc3RNb2RUaW1lID0gdGhpcy5sYXN0U2VsVGltZSA9IDA7XG4gIHRoaXMubGFzdE9wID0gdGhpcy5sYXN0U2VsT3AgPSBudWxsO1xuICB0aGlzLmxhc3RPcmlnaW4gPSB0aGlzLmxhc3RTZWxPcmlnaW4gPSBudWxsO1xuICAvLyBVc2VkIGJ5IHRoZSBpc0NsZWFuKCkgbWV0aG9kXG4gIHRoaXMuZ2VuZXJhdGlvbiA9IHRoaXMubWF4R2VuZXJhdGlvbiA9IHN0YXJ0R2VuIHx8IDE7XG59XG5cbi8vIENyZWF0ZSBhIGhpc3RvcnkgY2hhbmdlIGV2ZW50IGZyb20gYW4gdXBkYXRlRG9jLXN0eWxlIGNoYW5nZVxuLy8gb2JqZWN0LlxuZnVuY3Rpb24gaGlzdG9yeUNoYW5nZUZyb21DaGFuZ2UoZG9jLCBjaGFuZ2UpIHtcbiAgdmFyIGhpc3RDaGFuZ2UgPSB7ZnJvbTogY29weVBvcyhjaGFuZ2UuZnJvbSksIHRvOiBjaGFuZ2VFbmQoY2hhbmdlKSwgdGV4dDogZ2V0QmV0d2Vlbihkb2MsIGNoYW5nZS5mcm9tLCBjaGFuZ2UudG8pfTtcbiAgYXR0YWNoTG9jYWxTcGFucyhkb2MsIGhpc3RDaGFuZ2UsIGNoYW5nZS5mcm9tLmxpbmUsIGNoYW5nZS50by5saW5lICsgMSk7XG4gIGxpbmtlZERvY3MoZG9jLCBmdW5jdGlvbiAoZG9jKSB7IHJldHVybiBhdHRhY2hMb2NhbFNwYW5zKGRvYywgaGlzdENoYW5nZSwgY2hhbmdlLmZyb20ubGluZSwgY2hhbmdlLnRvLmxpbmUgKyAxKTsgfSwgdHJ1ZSk7XG4gIHJldHVybiBoaXN0Q2hhbmdlXG59XG5cbi8vIFBvcCBhbGwgc2VsZWN0aW9uIGV2ZW50cyBvZmYgdGhlIGVuZCBvZiBhIGhpc3RvcnkgYXJyYXkuIFN0b3AgYXRcbi8vIGEgY2hhbmdlIGV2ZW50LlxuZnVuY3Rpb24gY2xlYXJTZWxlY3Rpb25FdmVudHMoYXJyYXkpIHtcbiAgd2hpbGUgKGFycmF5Lmxlbmd0aCkge1xuICAgIHZhciBsYXN0ID0gbHN0KGFycmF5KTtcbiAgICBpZiAobGFzdC5yYW5nZXMpIHsgYXJyYXkucG9wKCk7IH1cbiAgICBlbHNlIHsgYnJlYWsgfVxuICB9XG59XG5cbi8vIEZpbmQgdGhlIHRvcCBjaGFuZ2UgZXZlbnQgaW4gdGhlIGhpc3RvcnkuIFBvcCBvZmYgc2VsZWN0aW9uXG4vLyBldmVudHMgdGhhdCBhcmUgaW4gdGhlIHdheS5cbmZ1bmN0aW9uIGxhc3RDaGFuZ2VFdmVudChoaXN0LCBmb3JjZSkge1xuICBpZiAoZm9yY2UpIHtcbiAgICBjbGVhclNlbGVjdGlvbkV2ZW50cyhoaXN0LmRvbmUpO1xuICAgIHJldHVybiBsc3QoaGlzdC5kb25lKVxuICB9IGVsc2UgaWYgKGhpc3QuZG9uZS5sZW5ndGggJiYgIWxzdChoaXN0LmRvbmUpLnJhbmdlcykge1xuICAgIHJldHVybiBsc3QoaGlzdC5kb25lKVxuICB9IGVsc2UgaWYgKGhpc3QuZG9uZS5sZW5ndGggPiAxICYmICFoaXN0LmRvbmVbaGlzdC5kb25lLmxlbmd0aCAtIDJdLnJhbmdlcykge1xuICAgIGhpc3QuZG9uZS5wb3AoKTtcbiAgICByZXR1cm4gbHN0KGhpc3QuZG9uZSlcbiAgfVxufVxuXG4vLyBSZWdpc3RlciBhIGNoYW5nZSBpbiB0aGUgaGlzdG9yeS4gTWVyZ2VzIGNoYW5nZXMgdGhhdCBhcmUgd2l0aGluXG4vLyBhIHNpbmdsZSBvcGVyYXRpb24sIG9yIGFyZSBjbG9zZSB0b2dldGhlciB3aXRoIGFuIG9yaWdpbiB0aGF0XG4vLyBhbGxvd3MgbWVyZ2luZyAoc3RhcnRpbmcgd2l0aCBcIitcIikgaW50byBhIHNpbmdsZSBldmVudC5cbmZ1bmN0aW9uIGFkZENoYW5nZVRvSGlzdG9yeShkb2MsIGNoYW5nZSwgc2VsQWZ0ZXIsIG9wSWQpIHtcbiAgdmFyIGhpc3QgPSBkb2MuaGlzdG9yeTtcbiAgaGlzdC51bmRvbmUubGVuZ3RoID0gMDtcbiAgdmFyIHRpbWUgPSArbmV3IERhdGUsIGN1cjtcbiAgdmFyIGxhc3Q7XG5cbiAgaWYgKChoaXN0Lmxhc3RPcCA9PSBvcElkIHx8XG4gICAgICAgaGlzdC5sYXN0T3JpZ2luID09IGNoYW5nZS5vcmlnaW4gJiYgY2hhbmdlLm9yaWdpbiAmJlxuICAgICAgICgoY2hhbmdlLm9yaWdpbi5jaGFyQXQoMCkgPT0gXCIrXCIgJiYgZG9jLmNtICYmIGhpc3QubGFzdE1vZFRpbWUgPiB0aW1lIC0gZG9jLmNtLm9wdGlvbnMuaGlzdG9yeUV2ZW50RGVsYXkpIHx8XG4gICAgICAgIGNoYW5nZS5vcmlnaW4uY2hhckF0KDApID09IFwiKlwiKSkgJiZcbiAgICAgIChjdXIgPSBsYXN0Q2hhbmdlRXZlbnQoaGlzdCwgaGlzdC5sYXN0T3AgPT0gb3BJZCkpKSB7XG4gICAgLy8gTWVyZ2UgdGhpcyBjaGFuZ2UgaW50byB0aGUgbGFzdCBldmVudFxuICAgIGxhc3QgPSBsc3QoY3VyLmNoYW5nZXMpO1xuICAgIGlmIChjbXAoY2hhbmdlLmZyb20sIGNoYW5nZS50bykgPT0gMCAmJiBjbXAoY2hhbmdlLmZyb20sIGxhc3QudG8pID09IDApIHtcbiAgICAgIC8vIE9wdGltaXplZCBjYXNlIGZvciBzaW1wbGUgaW5zZXJ0aW9uIC0tIGRvbid0IHdhbnQgdG8gYWRkXG4gICAgICAvLyBuZXcgY2hhbmdlc2V0cyBmb3IgZXZlcnkgY2hhcmFjdGVyIHR5cGVkXG4gICAgICBsYXN0LnRvID0gY2hhbmdlRW5kKGNoYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFkZCBuZXcgc3ViLWV2ZW50XG4gICAgICBjdXIuY2hhbmdlcy5wdXNoKGhpc3RvcnlDaGFuZ2VGcm9tQ2hhbmdlKGRvYywgY2hhbmdlKSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIENhbiBub3QgYmUgbWVyZ2VkLCBzdGFydCBhIG5ldyBldmVudC5cbiAgICB2YXIgYmVmb3JlID0gbHN0KGhpc3QuZG9uZSk7XG4gICAgaWYgKCFiZWZvcmUgfHwgIWJlZm9yZS5yYW5nZXMpXG4gICAgICB7IHB1c2hTZWxlY3Rpb25Ub0hpc3RvcnkoZG9jLnNlbCwgaGlzdC5kb25lKTsgfVxuICAgIGN1ciA9IHtjaGFuZ2VzOiBbaGlzdG9yeUNoYW5nZUZyb21DaGFuZ2UoZG9jLCBjaGFuZ2UpXSxcbiAgICAgICAgICAgZ2VuZXJhdGlvbjogaGlzdC5nZW5lcmF0aW9ufTtcbiAgICBoaXN0LmRvbmUucHVzaChjdXIpO1xuICAgIHdoaWxlIChoaXN0LmRvbmUubGVuZ3RoID4gaGlzdC51bmRvRGVwdGgpIHtcbiAgICAgIGhpc3QuZG9uZS5zaGlmdCgpO1xuICAgICAgaWYgKCFoaXN0LmRvbmVbMF0ucmFuZ2VzKSB7IGhpc3QuZG9uZS5zaGlmdCgpOyB9XG4gICAgfVxuICB9XG4gIGhpc3QuZG9uZS5wdXNoKHNlbEFmdGVyKTtcbiAgaGlzdC5nZW5lcmF0aW9uID0gKytoaXN0Lm1heEdlbmVyYXRpb247XG4gIGhpc3QubGFzdE1vZFRpbWUgPSBoaXN0Lmxhc3RTZWxUaW1lID0gdGltZTtcbiAgaGlzdC5sYXN0T3AgPSBoaXN0Lmxhc3RTZWxPcCA9IG9wSWQ7XG4gIGhpc3QubGFzdE9yaWdpbiA9IGhpc3QubGFzdFNlbE9yaWdpbiA9IGNoYW5nZS5vcmlnaW47XG5cbiAgaWYgKCFsYXN0KSB7IHNpZ25hbChkb2MsIFwiaGlzdG9yeUFkZGVkXCIpOyB9XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbkV2ZW50Q2FuQmVNZXJnZWQoZG9jLCBvcmlnaW4sIHByZXYsIHNlbCkge1xuICB2YXIgY2ggPSBvcmlnaW4uY2hhckF0KDApO1xuICByZXR1cm4gY2ggPT0gXCIqXCIgfHxcbiAgICBjaCA9PSBcIitcIiAmJlxuICAgIHByZXYucmFuZ2VzLmxlbmd0aCA9PSBzZWwucmFuZ2VzLmxlbmd0aCAmJlxuICAgIHByZXYuc29tZXRoaW5nU2VsZWN0ZWQoKSA9PSBzZWwuc29tZXRoaW5nU2VsZWN0ZWQoKSAmJlxuICAgIG5ldyBEYXRlIC0gZG9jLmhpc3RvcnkubGFzdFNlbFRpbWUgPD0gKGRvYy5jbSA/IGRvYy5jbS5vcHRpb25zLmhpc3RvcnlFdmVudERlbGF5IDogNTAwKVxufVxuXG4vLyBDYWxsZWQgd2hlbmV2ZXIgdGhlIHNlbGVjdGlvbiBjaGFuZ2VzLCBzZXRzIHRoZSBuZXcgc2VsZWN0aW9uIGFzXG4vLyB0aGUgcGVuZGluZyBzZWxlY3Rpb24gaW4gdGhlIGhpc3RvcnksIGFuZCBwdXNoZXMgdGhlIG9sZCBwZW5kaW5nXG4vLyBzZWxlY3Rpb24gaW50byB0aGUgJ2RvbmUnIGFycmF5IHdoZW4gaXQgd2FzIHNpZ25pZmljYW50bHlcbi8vIGRpZmZlcmVudCAoaW4gbnVtYmVyIG9mIHNlbGVjdGVkIHJhbmdlcywgZW1wdGluZXNzLCBvciB0aW1lKS5cbmZ1bmN0aW9uIGFkZFNlbGVjdGlvblRvSGlzdG9yeShkb2MsIHNlbCwgb3BJZCwgb3B0aW9ucykge1xuICB2YXIgaGlzdCA9IGRvYy5oaXN0b3J5LCBvcmlnaW4gPSBvcHRpb25zICYmIG9wdGlvbnMub3JpZ2luO1xuXG4gIC8vIEEgbmV3IGV2ZW50IGlzIHN0YXJ0ZWQgd2hlbiB0aGUgcHJldmlvdXMgb3JpZ2luIGRvZXMgbm90IG1hdGNoXG4gIC8vIHRoZSBjdXJyZW50LCBvciB0aGUgb3JpZ2lucyBkb24ndCBhbGxvdyBtYXRjaGluZy4gT3JpZ2luc1xuICAvLyBzdGFydGluZyB3aXRoICogYXJlIGFsd2F5cyBtZXJnZWQsIHRob3NlIHN0YXJ0aW5nIHdpdGggKyBhcmVcbiAgLy8gbWVyZ2VkIHdoZW4gc2ltaWxhciBhbmQgY2xvc2UgdG9nZXRoZXIgaW4gdGltZS5cbiAgaWYgKG9wSWQgPT0gaGlzdC5sYXN0U2VsT3AgfHxcbiAgICAgIChvcmlnaW4gJiYgaGlzdC5sYXN0U2VsT3JpZ2luID09IG9yaWdpbiAmJlxuICAgICAgIChoaXN0Lmxhc3RNb2RUaW1lID09IGhpc3QubGFzdFNlbFRpbWUgJiYgaGlzdC5sYXN0T3JpZ2luID09IG9yaWdpbiB8fFxuICAgICAgICBzZWxlY3Rpb25FdmVudENhbkJlTWVyZ2VkKGRvYywgb3JpZ2luLCBsc3QoaGlzdC5kb25lKSwgc2VsKSkpKVxuICAgIHsgaGlzdC5kb25lW2hpc3QuZG9uZS5sZW5ndGggLSAxXSA9IHNlbDsgfVxuICBlbHNlXG4gICAgeyBwdXNoU2VsZWN0aW9uVG9IaXN0b3J5KHNlbCwgaGlzdC5kb25lKTsgfVxuXG4gIGhpc3QubGFzdFNlbFRpbWUgPSArbmV3IERhdGU7XG4gIGhpc3QubGFzdFNlbE9yaWdpbiA9IG9yaWdpbjtcbiAgaGlzdC5sYXN0U2VsT3AgPSBvcElkO1xuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNsZWFyUmVkbyAhPT0gZmFsc2UpXG4gICAgeyBjbGVhclNlbGVjdGlvbkV2ZW50cyhoaXN0LnVuZG9uZSk7IH1cbn1cblxuZnVuY3Rpb24gcHVzaFNlbGVjdGlvblRvSGlzdG9yeShzZWwsIGRlc3QpIHtcbiAgdmFyIHRvcCA9IGxzdChkZXN0KTtcbiAgaWYgKCEodG9wICYmIHRvcC5yYW5nZXMgJiYgdG9wLmVxdWFscyhzZWwpKSlcbiAgICB7IGRlc3QucHVzaChzZWwpOyB9XG59XG5cbi8vIFVzZWQgdG8gc3RvcmUgbWFya2VkIHNwYW4gaW5mb3JtYXRpb24gaW4gdGhlIGhpc3RvcnkuXG5mdW5jdGlvbiBhdHRhY2hMb2NhbFNwYW5zKGRvYywgY2hhbmdlLCBmcm9tLCB0bykge1xuICB2YXIgZXhpc3RpbmcgPSBjaGFuZ2VbXCJzcGFuc19cIiArIGRvYy5pZF0sIG4gPSAwO1xuICBkb2MuaXRlcihNYXRoLm1heChkb2MuZmlyc3QsIGZyb20pLCBNYXRoLm1pbihkb2MuZmlyc3QgKyBkb2Muc2l6ZSwgdG8pLCBmdW5jdGlvbiAobGluZSkge1xuICAgIGlmIChsaW5lLm1hcmtlZFNwYW5zKVxuICAgICAgeyAoZXhpc3RpbmcgfHwgKGV4aXN0aW5nID0gY2hhbmdlW1wic3BhbnNfXCIgKyBkb2MuaWRdID0ge30pKVtuXSA9IGxpbmUubWFya2VkU3BhbnM7IH1cbiAgICArK247XG4gIH0pO1xufVxuXG4vLyBXaGVuIHVuL3JlLWRvaW5nIHJlc3RvcmVzIHRleHQgY29udGFpbmluZyBtYXJrZWQgc3BhbnMsIHRob3NlXG4vLyB0aGF0IGhhdmUgYmVlbiBleHBsaWNpdGx5IGNsZWFyZWQgc2hvdWxkIG5vdCBiZSByZXN0b3JlZC5cbmZ1bmN0aW9uIHJlbW92ZUNsZWFyZWRTcGFucyhzcGFucykge1xuICBpZiAoIXNwYW5zKSB7IHJldHVybiBudWxsIH1cbiAgdmFyIG91dDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChzcGFuc1tpXS5tYXJrZXIuZXhwbGljaXRseUNsZWFyZWQpIHsgaWYgKCFvdXQpIHsgb3V0ID0gc3BhbnMuc2xpY2UoMCwgaSk7IH0gfVxuICAgIGVsc2UgaWYgKG91dCkgeyBvdXQucHVzaChzcGFuc1tpXSk7IH1cbiAgfVxuICByZXR1cm4gIW91dCA/IHNwYW5zIDogb3V0Lmxlbmd0aCA/IG91dCA6IG51bGxcbn1cblxuLy8gUmV0cmlldmUgYW5kIGZpbHRlciB0aGUgb2xkIG1hcmtlZCBzcGFucyBzdG9yZWQgaW4gYSBjaGFuZ2UgZXZlbnQuXG5mdW5jdGlvbiBnZXRPbGRTcGFucyhkb2MsIGNoYW5nZSkge1xuICB2YXIgZm91bmQgPSBjaGFuZ2VbXCJzcGFuc19cIiArIGRvYy5pZF07XG4gIGlmICghZm91bmQpIHsgcmV0dXJuIG51bGwgfVxuICB2YXIgbncgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFuZ2UudGV4dC5sZW5ndGg7ICsraSlcbiAgICB7IG53LnB1c2gocmVtb3ZlQ2xlYXJlZFNwYW5zKGZvdW5kW2ldKSk7IH1cbiAgcmV0dXJuIG53XG59XG5cbi8vIFVzZWQgZm9yIHVuL3JlLWRvaW5nIGNoYW5nZXMgZnJvbSB0aGUgaGlzdG9yeS4gQ29tYmluZXMgdGhlXG4vLyByZXN1bHQgb2YgY29tcHV0aW5nIHRoZSBleGlzdGluZyBzcGFucyB3aXRoIHRoZSBzZXQgb2Ygc3BhbnMgdGhhdFxuLy8gZXhpc3RlZCBpbiB0aGUgaGlzdG9yeSAoc28gdGhhdCBkZWxldGluZyBhcm91bmQgYSBzcGFuIGFuZCB0aGVuXG4vLyB1bmRvaW5nIGJyaW5ncyBiYWNrIHRoZSBzcGFuKS5cbmZ1bmN0aW9uIG1lcmdlT2xkU3BhbnMoZG9jLCBjaGFuZ2UpIHtcbiAgdmFyIG9sZCA9IGdldE9sZFNwYW5zKGRvYywgY2hhbmdlKTtcbiAgdmFyIHN0cmV0Y2hlZCA9IHN0cmV0Y2hTcGFuc092ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpO1xuICBpZiAoIW9sZCkgeyByZXR1cm4gc3RyZXRjaGVkIH1cbiAgaWYgKCFzdHJldGNoZWQpIHsgcmV0dXJuIG9sZCB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgb2xkQ3VyID0gb2xkW2ldLCBzdHJldGNoQ3VyID0gc3RyZXRjaGVkW2ldO1xuICAgIGlmIChvbGRDdXIgJiYgc3RyZXRjaEN1cikge1xuICAgICAgc3BhbnM6IGZvciAodmFyIGogPSAwOyBqIDwgc3RyZXRjaEN1ci5sZW5ndGg7ICsraikge1xuICAgICAgICB2YXIgc3BhbiA9IHN0cmV0Y2hDdXJbal07XG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgb2xkQ3VyLmxlbmd0aDsgKytrKVxuICAgICAgICAgIHsgaWYgKG9sZEN1cltrXS5tYXJrZXIgPT0gc3Bhbi5tYXJrZXIpIHsgY29udGludWUgc3BhbnMgfSB9XG4gICAgICAgIG9sZEN1ci5wdXNoKHNwYW4pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3RyZXRjaEN1cikge1xuICAgICAgb2xkW2ldID0gc3RyZXRjaEN1cjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9sZFxufVxuXG4vLyBVc2VkIGJvdGggdG8gcHJvdmlkZSBhIEpTT04tc2FmZSBvYmplY3QgaW4gLmdldEhpc3RvcnksIGFuZCwgd2hlblxuLy8gZGV0YWNoaW5nIGEgZG9jdW1lbnQsIHRvIHNwbGl0IHRoZSBoaXN0b3J5IGluIHR3b1xuZnVuY3Rpb24gY29weUhpc3RvcnlBcnJheShldmVudHMsIG5ld0dyb3VwLCBpbnN0YW50aWF0ZVNlbCkge1xuICB2YXIgY29weSA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7ICsraSkge1xuICAgIHZhciBldmVudCA9IGV2ZW50c1tpXTtcbiAgICBpZiAoZXZlbnQucmFuZ2VzKSB7XG4gICAgICBjb3B5LnB1c2goaW5zdGFudGlhdGVTZWwgPyBTZWxlY3Rpb24ucHJvdG90eXBlLmRlZXBDb3B5LmNhbGwoZXZlbnQpIDogZXZlbnQpO1xuICAgICAgY29udGludWVcbiAgICB9XG4gICAgdmFyIGNoYW5nZXMgPSBldmVudC5jaGFuZ2VzLCBuZXdDaGFuZ2VzID0gW107XG4gICAgY29weS5wdXNoKHtjaGFuZ2VzOiBuZXdDaGFuZ2VzfSk7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBjaGFuZ2VzLmxlbmd0aDsgKytqKSB7XG4gICAgICB2YXIgY2hhbmdlID0gY2hhbmdlc1tqXSwgbSA9ICh2b2lkIDApO1xuICAgICAgbmV3Q2hhbmdlcy5wdXNoKHtmcm9tOiBjaGFuZ2UuZnJvbSwgdG86IGNoYW5nZS50bywgdGV4dDogY2hhbmdlLnRleHR9KTtcbiAgICAgIGlmIChuZXdHcm91cCkgeyBmb3IgKHZhciBwcm9wIGluIGNoYW5nZSkgeyBpZiAobSA9IHByb3AubWF0Y2goL15zcGFuc18oXFxkKykkLykpIHtcbiAgICAgICAgaWYgKGluZGV4T2YobmV3R3JvdXAsIE51bWJlcihtWzFdKSkgPiAtMSkge1xuICAgICAgICAgIGxzdChuZXdDaGFuZ2VzKVtwcm9wXSA9IGNoYW5nZVtwcm9wXTtcbiAgICAgICAgICBkZWxldGUgY2hhbmdlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9IH0gfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY29weVxufVxuXG4vLyBUaGUgJ3Njcm9sbCcgcGFyYW1ldGVyIGdpdmVuIHRvIG1hbnkgb2YgdGhlc2UgaW5kaWNhdGVkIHdoZXRoZXJcbi8vIHRoZSBuZXcgY3Vyc29yIHBvc2l0aW9uIHNob3VsZCBiZSBzY3JvbGxlZCBpbnRvIHZpZXcgYWZ0ZXJcbi8vIG1vZGlmeWluZyB0aGUgc2VsZWN0aW9uLlxuXG4vLyBJZiBzaGlmdCBpcyBoZWxkIG9yIHRoZSBleHRlbmQgZmxhZyBpcyBzZXQsIGV4dGVuZHMgYSByYW5nZSB0b1xuLy8gaW5jbHVkZSBhIGdpdmVuIHBvc2l0aW9uIChhbmQgb3B0aW9uYWxseSBhIHNlY29uZCBwb3NpdGlvbikuXG4vLyBPdGhlcndpc2UsIHNpbXBseSByZXR1cm5zIHRoZSByYW5nZSBiZXR3ZWVuIHRoZSBnaXZlbiBwb3NpdGlvbnMuXG4vLyBVc2VkIGZvciBjdXJzb3IgbW90aW9uIGFuZCBzdWNoLlxuZnVuY3Rpb24gZXh0ZW5kUmFuZ2UoZG9jLCByYW5nZSwgaGVhZCwgb3RoZXIpIHtcbiAgaWYgKGRvYy5jbSAmJiBkb2MuY20uZGlzcGxheS5zaGlmdCB8fCBkb2MuZXh0ZW5kKSB7XG4gICAgdmFyIGFuY2hvciA9IHJhbmdlLmFuY2hvcjtcbiAgICBpZiAob3RoZXIpIHtcbiAgICAgIHZhciBwb3NCZWZvcmUgPSBjbXAoaGVhZCwgYW5jaG9yKSA8IDA7XG4gICAgICBpZiAocG9zQmVmb3JlICE9IChjbXAob3RoZXIsIGFuY2hvcikgPCAwKSkge1xuICAgICAgICBhbmNob3IgPSBoZWFkO1xuICAgICAgICBoZWFkID0gb3RoZXI7XG4gICAgICB9IGVsc2UgaWYgKHBvc0JlZm9yZSAhPSAoY21wKGhlYWQsIG90aGVyKSA8IDApKSB7XG4gICAgICAgIGhlYWQgPSBvdGhlcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSYW5nZShhbmNob3IsIGhlYWQpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZShvdGhlciB8fCBoZWFkLCBoZWFkKVxuICB9XG59XG5cbi8vIEV4dGVuZCB0aGUgcHJpbWFyeSBzZWxlY3Rpb24gcmFuZ2UsIGRpc2NhcmQgdGhlIHJlc3QuXG5mdW5jdGlvbiBleHRlbmRTZWxlY3Rpb24oZG9jLCBoZWFkLCBvdGhlciwgb3B0aW9ucykge1xuICBzZXRTZWxlY3Rpb24oZG9jLCBuZXcgU2VsZWN0aW9uKFtleHRlbmRSYW5nZShkb2MsIGRvYy5zZWwucHJpbWFyeSgpLCBoZWFkLCBvdGhlcildLCAwKSwgb3B0aW9ucyk7XG59XG5cbi8vIEV4dGVuZCBhbGwgc2VsZWN0aW9ucyAocG9zIGlzIGFuIGFycmF5IG9mIHNlbGVjdGlvbnMgd2l0aCBsZW5ndGhcbi8vIGVxdWFsIHRoZSBudW1iZXIgb2Ygc2VsZWN0aW9ucylcbmZ1bmN0aW9uIGV4dGVuZFNlbGVjdGlvbnMoZG9jLCBoZWFkcywgb3B0aW9ucykge1xuICB2YXIgb3V0ID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgeyBvdXRbaV0gPSBleHRlbmRSYW5nZShkb2MsIGRvYy5zZWwucmFuZ2VzW2ldLCBoZWFkc1tpXSwgbnVsbCk7IH1cbiAgdmFyIG5ld1NlbCA9IG5vcm1hbGl6ZVNlbGVjdGlvbihvdXQsIGRvYy5zZWwucHJpbUluZGV4KTtcbiAgc2V0U2VsZWN0aW9uKGRvYywgbmV3U2VsLCBvcHRpb25zKTtcbn1cblxuLy8gVXBkYXRlcyBhIHNpbmdsZSByYW5nZSBpbiB0aGUgc2VsZWN0aW9uLlxuZnVuY3Rpb24gcmVwbGFjZU9uZVNlbGVjdGlvbihkb2MsIGksIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciByYW5nZXMgPSBkb2Muc2VsLnJhbmdlcy5zbGljZSgwKTtcbiAgcmFuZ2VzW2ldID0gcmFuZ2U7XG4gIHNldFNlbGVjdGlvbihkb2MsIG5vcm1hbGl6ZVNlbGVjdGlvbihyYW5nZXMsIGRvYy5zZWwucHJpbUluZGV4KSwgb3B0aW9ucyk7XG59XG5cbi8vIFJlc2V0IHRoZSBzZWxlY3Rpb24gdG8gYSBzaW5nbGUgcmFuZ2UuXG5mdW5jdGlvbiBzZXRTaW1wbGVTZWxlY3Rpb24oZG9jLCBhbmNob3IsIGhlYWQsIG9wdGlvbnMpIHtcbiAgc2V0U2VsZWN0aW9uKGRvYywgc2ltcGxlU2VsZWN0aW9uKGFuY2hvciwgaGVhZCksIG9wdGlvbnMpO1xufVxuXG4vLyBHaXZlIGJlZm9yZVNlbGVjdGlvbkNoYW5nZSBoYW5kbGVycyBhIGNoYW5nZSB0byBpbmZsdWVuY2UgYVxuLy8gc2VsZWN0aW9uIHVwZGF0ZS5cbmZ1bmN0aW9uIGZpbHRlclNlbGVjdGlvbkNoYW5nZShkb2MsIHNlbCwgb3B0aW9ucykge1xuICB2YXIgb2JqID0ge1xuICAgIHJhbmdlczogc2VsLnJhbmdlcyxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKHJhbmdlcykge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICAgIHRoaXMucmFuZ2VzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgeyB0aGlzJDEucmFuZ2VzW2ldID0gbmV3IFJhbmdlKGNsaXBQb3MoZG9jLCByYW5nZXNbaV0uYW5jaG9yKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpcFBvcyhkb2MsIHJhbmdlc1tpXS5oZWFkKSk7IH1cbiAgICB9LFxuICAgIG9yaWdpbjogb3B0aW9ucyAmJiBvcHRpb25zLm9yaWdpblxuICB9O1xuICBzaWduYWwoZG9jLCBcImJlZm9yZVNlbGVjdGlvbkNoYW5nZVwiLCBkb2MsIG9iaik7XG4gIGlmIChkb2MuY20pIHsgc2lnbmFsKGRvYy5jbSwgXCJiZWZvcmVTZWxlY3Rpb25DaGFuZ2VcIiwgZG9jLmNtLCBvYmopOyB9XG4gIGlmIChvYmoucmFuZ2VzICE9IHNlbC5yYW5nZXMpIHsgcmV0dXJuIG5vcm1hbGl6ZVNlbGVjdGlvbihvYmoucmFuZ2VzLCBvYmoucmFuZ2VzLmxlbmd0aCAtIDEpIH1cbiAgZWxzZSB7IHJldHVybiBzZWwgfVxufVxuXG5mdW5jdGlvbiBzZXRTZWxlY3Rpb25SZXBsYWNlSGlzdG9yeShkb2MsIHNlbCwgb3B0aW9ucykge1xuICB2YXIgZG9uZSA9IGRvYy5oaXN0b3J5LmRvbmUsIGxhc3QgPSBsc3QoZG9uZSk7XG4gIGlmIChsYXN0ICYmIGxhc3QucmFuZ2VzKSB7XG4gICAgZG9uZVtkb25lLmxlbmd0aCAtIDFdID0gc2VsO1xuICAgIHNldFNlbGVjdGlvbk5vVW5kbyhkb2MsIHNlbCwgb3B0aW9ucyk7XG4gIH0gZWxzZSB7XG4gICAgc2V0U2VsZWN0aW9uKGRvYywgc2VsLCBvcHRpb25zKTtcbiAgfVxufVxuXG4vLyBTZXQgYSBuZXcgc2VsZWN0aW9uLlxuZnVuY3Rpb24gc2V0U2VsZWN0aW9uKGRvYywgc2VsLCBvcHRpb25zKSB7XG4gIHNldFNlbGVjdGlvbk5vVW5kbyhkb2MsIHNlbCwgb3B0aW9ucyk7XG4gIGFkZFNlbGVjdGlvblRvSGlzdG9yeShkb2MsIGRvYy5zZWwsIGRvYy5jbSA/IGRvYy5jbS5jdXJPcC5pZCA6IE5hTiwgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGlvbk5vVW5kbyhkb2MsIHNlbCwgb3B0aW9ucykge1xuICBpZiAoaGFzSGFuZGxlcihkb2MsIFwiYmVmb3JlU2VsZWN0aW9uQ2hhbmdlXCIpIHx8IGRvYy5jbSAmJiBoYXNIYW5kbGVyKGRvYy5jbSwgXCJiZWZvcmVTZWxlY3Rpb25DaGFuZ2VcIikpXG4gICAgeyBzZWwgPSBmaWx0ZXJTZWxlY3Rpb25DaGFuZ2UoZG9jLCBzZWwsIG9wdGlvbnMpOyB9XG5cbiAgdmFyIGJpYXMgPSBvcHRpb25zICYmIG9wdGlvbnMuYmlhcyB8fFxuICAgIChjbXAoc2VsLnByaW1hcnkoKS5oZWFkLCBkb2Muc2VsLnByaW1hcnkoKS5oZWFkKSA8IDAgPyAtMSA6IDEpO1xuICBzZXRTZWxlY3Rpb25Jbm5lcihkb2MsIHNraXBBdG9taWNJblNlbGVjdGlvbihkb2MsIHNlbCwgYmlhcywgdHJ1ZSkpO1xuXG4gIGlmICghKG9wdGlvbnMgJiYgb3B0aW9ucy5zY3JvbGwgPT09IGZhbHNlKSAmJiBkb2MuY20pXG4gICAgeyBlbnN1cmVDdXJzb3JWaXNpYmxlKGRvYy5jbSk7IH1cbn1cblxuZnVuY3Rpb24gc2V0U2VsZWN0aW9uSW5uZXIoZG9jLCBzZWwpIHtcbiAgaWYgKHNlbC5lcXVhbHMoZG9jLnNlbCkpIHsgcmV0dXJuIH1cblxuICBkb2Muc2VsID0gc2VsO1xuXG4gIGlmIChkb2MuY20pIHtcbiAgICBkb2MuY20uY3VyT3AudXBkYXRlSW5wdXQgPSBkb2MuY20uY3VyT3Auc2VsZWN0aW9uQ2hhbmdlZCA9IHRydWU7XG4gICAgc2lnbmFsQ3Vyc29yQWN0aXZpdHkoZG9jLmNtKTtcbiAgfVxuICBzaWduYWxMYXRlcihkb2MsIFwiY3Vyc29yQWN0aXZpdHlcIiwgZG9jKTtcbn1cblxuLy8gVmVyaWZ5IHRoYXQgdGhlIHNlbGVjdGlvbiBkb2VzIG5vdCBwYXJ0aWFsbHkgc2VsZWN0IGFueSBhdG9taWNcbi8vIG1hcmtlZCByYW5nZXMuXG5mdW5jdGlvbiByZUNoZWNrU2VsZWN0aW9uKGRvYykge1xuICBzZXRTZWxlY3Rpb25Jbm5lcihkb2MsIHNraXBBdG9taWNJblNlbGVjdGlvbihkb2MsIGRvYy5zZWwsIG51bGwsIGZhbHNlKSk7XG59XG5cbi8vIFJldHVybiBhIHNlbGVjdGlvbiB0aGF0IGRvZXMgbm90IHBhcnRpYWxseSBzZWxlY3QgYW55IGF0b21pY1xuLy8gcmFuZ2VzLlxuZnVuY3Rpb24gc2tpcEF0b21pY0luU2VsZWN0aW9uKGRvYywgc2VsLCBiaWFzLCBtYXlDbGVhcikge1xuICB2YXIgb3V0O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbC5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcmFuZ2UgPSBzZWwucmFuZ2VzW2ldO1xuICAgIHZhciBvbGQgPSBzZWwucmFuZ2VzLmxlbmd0aCA9PSBkb2Muc2VsLnJhbmdlcy5sZW5ndGggJiYgZG9jLnNlbC5yYW5nZXNbaV07XG4gICAgdmFyIG5ld0FuY2hvciA9IHNraXBBdG9taWMoZG9jLCByYW5nZS5hbmNob3IsIG9sZCAmJiBvbGQuYW5jaG9yLCBiaWFzLCBtYXlDbGVhcik7XG4gICAgdmFyIG5ld0hlYWQgPSBza2lwQXRvbWljKGRvYywgcmFuZ2UuaGVhZCwgb2xkICYmIG9sZC5oZWFkLCBiaWFzLCBtYXlDbGVhcik7XG4gICAgaWYgKG91dCB8fCBuZXdBbmNob3IgIT0gcmFuZ2UuYW5jaG9yIHx8IG5ld0hlYWQgIT0gcmFuZ2UuaGVhZCkge1xuICAgICAgaWYgKCFvdXQpIHsgb3V0ID0gc2VsLnJhbmdlcy5zbGljZSgwLCBpKTsgfVxuICAgICAgb3V0W2ldID0gbmV3IFJhbmdlKG5ld0FuY2hvciwgbmV3SGVhZCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvdXQgPyBub3JtYWxpemVTZWxlY3Rpb24ob3V0LCBzZWwucHJpbUluZGV4KSA6IHNlbFxufVxuXG5mdW5jdGlvbiBza2lwQXRvbWljSW5uZXIoZG9jLCBwb3MsIG9sZFBvcywgZGlyLCBtYXlDbGVhcikge1xuICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBwb3MubGluZSk7XG4gIGlmIChsaW5lLm1hcmtlZFNwYW5zKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS5tYXJrZWRTcGFucy5sZW5ndGg7ICsraSkge1xuICAgIHZhciBzcCA9IGxpbmUubWFya2VkU3BhbnNbaV0sIG0gPSBzcC5tYXJrZXI7XG4gICAgaWYgKChzcC5mcm9tID09IG51bGwgfHwgKG0uaW5jbHVzaXZlTGVmdCA/IHNwLmZyb20gPD0gcG9zLmNoIDogc3AuZnJvbSA8IHBvcy5jaCkpICYmXG4gICAgICAgIChzcC50byA9PSBudWxsIHx8IChtLmluY2x1c2l2ZVJpZ2h0ID8gc3AudG8gPj0gcG9zLmNoIDogc3AudG8gPiBwb3MuY2gpKSkge1xuICAgICAgaWYgKG1heUNsZWFyKSB7XG4gICAgICAgIHNpZ25hbChtLCBcImJlZm9yZUN1cnNvckVudGVyXCIpO1xuICAgICAgICBpZiAobS5leHBsaWNpdGx5Q2xlYXJlZCkge1xuICAgICAgICAgIGlmICghbGluZS5tYXJrZWRTcGFucykgeyBicmVhayB9XG4gICAgICAgICAgZWxzZSB7LS1pOyBjb250aW51ZX1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFtLmF0b21pYykgeyBjb250aW51ZSB9XG5cbiAgICAgIGlmIChvbGRQb3MpIHtcbiAgICAgICAgdmFyIG5lYXIgPSBtLmZpbmQoZGlyIDwgMCA/IDEgOiAtMSksIGRpZmYgPSAodm9pZCAwKTtcbiAgICAgICAgaWYgKGRpciA8IDAgPyBtLmluY2x1c2l2ZVJpZ2h0IDogbS5pbmNsdXNpdmVMZWZ0KVxuICAgICAgICAgIHsgbmVhciA9IG1vdmVQb3MoZG9jLCBuZWFyLCAtZGlyLCBuZWFyICYmIG5lYXIubGluZSA9PSBwb3MubGluZSA/IGxpbmUgOiBudWxsKTsgfVxuICAgICAgICBpZiAobmVhciAmJiBuZWFyLmxpbmUgPT0gcG9zLmxpbmUgJiYgKGRpZmYgPSBjbXAobmVhciwgb2xkUG9zKSkgJiYgKGRpciA8IDAgPyBkaWZmIDwgMCA6IGRpZmYgPiAwKSlcbiAgICAgICAgICB7IHJldHVybiBza2lwQXRvbWljSW5uZXIoZG9jLCBuZWFyLCBwb3MsIGRpciwgbWF5Q2xlYXIpIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGZhciA9IG0uZmluZChkaXIgPCAwID8gLTEgOiAxKTtcbiAgICAgIGlmIChkaXIgPCAwID8gbS5pbmNsdXNpdmVMZWZ0IDogbS5pbmNsdXNpdmVSaWdodClcbiAgICAgICAgeyBmYXIgPSBtb3ZlUG9zKGRvYywgZmFyLCBkaXIsIGZhci5saW5lID09IHBvcy5saW5lID8gbGluZSA6IG51bGwpOyB9XG4gICAgICByZXR1cm4gZmFyID8gc2tpcEF0b21pY0lubmVyKGRvYywgZmFyLCBwb3MsIGRpciwgbWF5Q2xlYXIpIDogbnVsbFxuICAgIH1cbiAgfSB9XG4gIHJldHVybiBwb3Ncbn1cblxuLy8gRW5zdXJlIGEgZ2l2ZW4gcG9zaXRpb24gaXMgbm90IGluc2lkZSBhbiBhdG9taWMgcmFuZ2UuXG5mdW5jdGlvbiBza2lwQXRvbWljKGRvYywgcG9zLCBvbGRQb3MsIGJpYXMsIG1heUNsZWFyKSB7XG4gIHZhciBkaXIgPSBiaWFzIHx8IDE7XG4gIHZhciBmb3VuZCA9IHNraXBBdG9taWNJbm5lcihkb2MsIHBvcywgb2xkUG9zLCBkaXIsIG1heUNsZWFyKSB8fFxuICAgICAgKCFtYXlDbGVhciAmJiBza2lwQXRvbWljSW5uZXIoZG9jLCBwb3MsIG9sZFBvcywgZGlyLCB0cnVlKSkgfHxcbiAgICAgIHNraXBBdG9taWNJbm5lcihkb2MsIHBvcywgb2xkUG9zLCAtZGlyLCBtYXlDbGVhcikgfHxcbiAgICAgICghbWF5Q2xlYXIgJiYgc2tpcEF0b21pY0lubmVyKGRvYywgcG9zLCBvbGRQb3MsIC1kaXIsIHRydWUpKTtcbiAgaWYgKCFmb3VuZCkge1xuICAgIGRvYy5jYW50RWRpdCA9IHRydWU7XG4gICAgcmV0dXJuIFBvcyhkb2MuZmlyc3QsIDApXG4gIH1cbiAgcmV0dXJuIGZvdW5kXG59XG5cbmZ1bmN0aW9uIG1vdmVQb3MoZG9jLCBwb3MsIGRpciwgbGluZSkge1xuICBpZiAoZGlyIDwgMCAmJiBwb3MuY2ggPT0gMCkge1xuICAgIGlmIChwb3MubGluZSA+IGRvYy5maXJzdCkgeyByZXR1cm4gY2xpcFBvcyhkb2MsIFBvcyhwb3MubGluZSAtIDEpKSB9XG4gICAgZWxzZSB7IHJldHVybiBudWxsIH1cbiAgfSBlbHNlIGlmIChkaXIgPiAwICYmIHBvcy5jaCA9PSAobGluZSB8fCBnZXRMaW5lKGRvYywgcG9zLmxpbmUpKS50ZXh0Lmxlbmd0aCkge1xuICAgIGlmIChwb3MubGluZSA8IGRvYy5maXJzdCArIGRvYy5zaXplIC0gMSkgeyByZXR1cm4gUG9zKHBvcy5saW5lICsgMSwgMCkgfVxuICAgIGVsc2UgeyByZXR1cm4gbnVsbCB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBQb3MocG9zLmxpbmUsIHBvcy5jaCArIGRpcilcbiAgfVxufVxuXG5mdW5jdGlvbiBzZWxlY3RBbGwoY20pIHtcbiAgY20uc2V0U2VsZWN0aW9uKFBvcyhjbS5maXJzdExpbmUoKSwgMCksIFBvcyhjbS5sYXN0TGluZSgpKSwgc2VsX2RvbnRTY3JvbGwpO1xufVxuXG4vLyBVUERBVElOR1xuXG4vLyBBbGxvdyBcImJlZm9yZUNoYW5nZVwiIGV2ZW50IGhhbmRsZXJzIHRvIGluZmx1ZW5jZSBhIGNoYW5nZVxuZnVuY3Rpb24gZmlsdGVyQ2hhbmdlKGRvYywgY2hhbmdlLCB1cGRhdGUpIHtcbiAgdmFyIG9iaiA9IHtcbiAgICBjYW5jZWxlZDogZmFsc2UsXG4gICAgZnJvbTogY2hhbmdlLmZyb20sXG4gICAgdG86IGNoYW5nZS50byxcbiAgICB0ZXh0OiBjaGFuZ2UudGV4dCxcbiAgICBvcmlnaW46IGNoYW5nZS5vcmlnaW4sXG4gICAgY2FuY2VsOiBmdW5jdGlvbiAoKSB7IHJldHVybiBvYmouY2FuY2VsZWQgPSB0cnVlOyB9XG4gIH07XG4gIGlmICh1cGRhdGUpIHsgb2JqLnVwZGF0ZSA9IGZ1bmN0aW9uIChmcm9tLCB0bywgdGV4dCwgb3JpZ2luKSB7XG4gICAgaWYgKGZyb20pIHsgb2JqLmZyb20gPSBjbGlwUG9zKGRvYywgZnJvbSk7IH1cbiAgICBpZiAodG8pIHsgb2JqLnRvID0gY2xpcFBvcyhkb2MsIHRvKTsgfVxuICAgIGlmICh0ZXh0KSB7IG9iai50ZXh0ID0gdGV4dDsgfVxuICAgIGlmIChvcmlnaW4gIT09IHVuZGVmaW5lZCkgeyBvYmoub3JpZ2luID0gb3JpZ2luOyB9XG4gIH07IH1cbiAgc2lnbmFsKGRvYywgXCJiZWZvcmVDaGFuZ2VcIiwgZG9jLCBvYmopO1xuICBpZiAoZG9jLmNtKSB7IHNpZ25hbChkb2MuY20sIFwiYmVmb3JlQ2hhbmdlXCIsIGRvYy5jbSwgb2JqKTsgfVxuXG4gIGlmIChvYmouY2FuY2VsZWQpIHsgcmV0dXJuIG51bGwgfVxuICByZXR1cm4ge2Zyb206IG9iai5mcm9tLCB0bzogb2JqLnRvLCB0ZXh0OiBvYmoudGV4dCwgb3JpZ2luOiBvYmoub3JpZ2lufVxufVxuXG4vLyBBcHBseSBhIGNoYW5nZSB0byBhIGRvY3VtZW50LCBhbmQgYWRkIGl0IHRvIHRoZSBkb2N1bWVudCdzXG4vLyBoaXN0b3J5LCBhbmQgcHJvcGFnYXRpbmcgaXQgdG8gYWxsIGxpbmtlZCBkb2N1bWVudHMuXG5mdW5jdGlvbiBtYWtlQ2hhbmdlKGRvYywgY2hhbmdlLCBpZ25vcmVSZWFkT25seSkge1xuICBpZiAoZG9jLmNtKSB7XG4gICAgaWYgKCFkb2MuY20uY3VyT3ApIHsgcmV0dXJuIG9wZXJhdGlvbihkb2MuY20sIG1ha2VDaGFuZ2UpKGRvYywgY2hhbmdlLCBpZ25vcmVSZWFkT25seSkgfVxuICAgIGlmIChkb2MuY20uc3RhdGUuc3VwcHJlc3NFZGl0cykgeyByZXR1cm4gfVxuICB9XG5cbiAgaWYgKGhhc0hhbmRsZXIoZG9jLCBcImJlZm9yZUNoYW5nZVwiKSB8fCBkb2MuY20gJiYgaGFzSGFuZGxlcihkb2MuY20sIFwiYmVmb3JlQ2hhbmdlXCIpKSB7XG4gICAgY2hhbmdlID0gZmlsdGVyQ2hhbmdlKGRvYywgY2hhbmdlLCB0cnVlKTtcbiAgICBpZiAoIWNoYW5nZSkgeyByZXR1cm4gfVxuICB9XG5cbiAgLy8gUG9zc2libHkgc3BsaXQgb3Igc3VwcHJlc3MgdGhlIHVwZGF0ZSBiYXNlZCBvbiB0aGUgcHJlc2VuY2VcbiAgLy8gb2YgcmVhZC1vbmx5IHNwYW5zIGluIGl0cyByYW5nZS5cbiAgdmFyIHNwbGl0ID0gc2F3UmVhZE9ubHlTcGFucyAmJiAhaWdub3JlUmVhZE9ubHkgJiYgcmVtb3ZlUmVhZE9ubHlSYW5nZXMoZG9jLCBjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKTtcbiAgaWYgKHNwbGl0KSB7XG4gICAgZm9yICh2YXIgaSA9IHNwbGl0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKVxuICAgICAgeyBtYWtlQ2hhbmdlSW5uZXIoZG9jLCB7ZnJvbTogc3BsaXRbaV0uZnJvbSwgdG86IHNwbGl0W2ldLnRvLCB0ZXh0OiBpID8gW1wiXCJdIDogY2hhbmdlLnRleHR9KTsgfVxuICB9IGVsc2Uge1xuICAgIG1ha2VDaGFuZ2VJbm5lcihkb2MsIGNoYW5nZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZUNoYW5nZUlubmVyKGRvYywgY2hhbmdlKSB7XG4gIGlmIChjaGFuZ2UudGV4dC5sZW5ndGggPT0gMSAmJiBjaGFuZ2UudGV4dFswXSA9PSBcIlwiICYmIGNtcChjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKSA9PSAwKSB7IHJldHVybiB9XG4gIHZhciBzZWxBZnRlciA9IGNvbXB1dGVTZWxBZnRlckNoYW5nZShkb2MsIGNoYW5nZSk7XG4gIGFkZENoYW5nZVRvSGlzdG9yeShkb2MsIGNoYW5nZSwgc2VsQWZ0ZXIsIGRvYy5jbSA/IGRvYy5jbS5jdXJPcC5pZCA6IE5hTik7XG5cbiAgbWFrZUNoYW5nZVNpbmdsZURvYyhkb2MsIGNoYW5nZSwgc2VsQWZ0ZXIsIHN0cmV0Y2hTcGFuc092ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpKTtcbiAgdmFyIHJlYmFzZWQgPSBbXTtcblxuICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24gKGRvYywgc2hhcmVkSGlzdCkge1xuICAgIGlmICghc2hhcmVkSGlzdCAmJiBpbmRleE9mKHJlYmFzZWQsIGRvYy5oaXN0b3J5KSA9PSAtMSkge1xuICAgICAgcmViYXNlSGlzdChkb2MuaGlzdG9yeSwgY2hhbmdlKTtcbiAgICAgIHJlYmFzZWQucHVzaChkb2MuaGlzdG9yeSk7XG4gICAgfVxuICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIG51bGwsIHN0cmV0Y2hTcGFuc092ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpKTtcbiAgfSk7XG59XG5cbi8vIFJldmVydCBhIGNoYW5nZSBzdG9yZWQgaW4gYSBkb2N1bWVudCdzIGhpc3RvcnkuXG5mdW5jdGlvbiBtYWtlQ2hhbmdlRnJvbUhpc3RvcnkoZG9jLCB0eXBlLCBhbGxvd1NlbGVjdGlvbk9ubHkpIHtcbiAgaWYgKGRvYy5jbSAmJiBkb2MuY20uc3RhdGUuc3VwcHJlc3NFZGl0cyAmJiAhYWxsb3dTZWxlY3Rpb25Pbmx5KSB7IHJldHVybiB9XG5cbiAgdmFyIGhpc3QgPSBkb2MuaGlzdG9yeSwgZXZlbnQsIHNlbEFmdGVyID0gZG9jLnNlbDtcbiAgdmFyIHNvdXJjZSA9IHR5cGUgPT0gXCJ1bmRvXCIgPyBoaXN0LmRvbmUgOiBoaXN0LnVuZG9uZSwgZGVzdCA9IHR5cGUgPT0gXCJ1bmRvXCIgPyBoaXN0LnVuZG9uZSA6IGhpc3QuZG9uZTtcblxuICAvLyBWZXJpZnkgdGhhdCB0aGVyZSBpcyBhIHVzZWFibGUgZXZlbnQgKHNvIHRoYXQgY3RybC16IHdvbid0XG4gIC8vIG5lZWRsZXNzbHkgY2xlYXIgc2VsZWN0aW9uIGV2ZW50cylcbiAgdmFyIGkgPSAwO1xuICBmb3IgKDsgaSA8IHNvdXJjZS5sZW5ndGg7IGkrKykge1xuICAgIGV2ZW50ID0gc291cmNlW2ldO1xuICAgIGlmIChhbGxvd1NlbGVjdGlvbk9ubHkgPyBldmVudC5yYW5nZXMgJiYgIWV2ZW50LmVxdWFscyhkb2Muc2VsKSA6ICFldmVudC5yYW5nZXMpXG4gICAgICB7IGJyZWFrIH1cbiAgfVxuICBpZiAoaSA9PSBzb3VyY2UubGVuZ3RoKSB7IHJldHVybiB9XG4gIGhpc3QubGFzdE9yaWdpbiA9IGhpc3QubGFzdFNlbE9yaWdpbiA9IG51bGw7XG5cbiAgZm9yICg7Oykge1xuICAgIGV2ZW50ID0gc291cmNlLnBvcCgpO1xuICAgIGlmIChldmVudC5yYW5nZXMpIHtcbiAgICAgIHB1c2hTZWxlY3Rpb25Ub0hpc3RvcnkoZXZlbnQsIGRlc3QpO1xuICAgICAgaWYgKGFsbG93U2VsZWN0aW9uT25seSAmJiAhZXZlbnQuZXF1YWxzKGRvYy5zZWwpKSB7XG4gICAgICAgIHNldFNlbGVjdGlvbihkb2MsIGV2ZW50LCB7Y2xlYXJSZWRvOiBmYWxzZX0pO1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHNlbEFmdGVyID0gZXZlbnQ7XG4gICAgfVxuICAgIGVsc2UgeyBicmVhayB9XG4gIH1cblxuICAvLyBCdWlsZCB1cCBhIHJldmVyc2UgY2hhbmdlIG9iamVjdCB0byBhZGQgdG8gdGhlIG9wcG9zaXRlIGhpc3RvcnlcbiAgLy8gc3RhY2sgKHJlZG8gd2hlbiB1bmRvaW5nLCBhbmQgdmljZSB2ZXJzYSkuXG4gIHZhciBhbnRpQ2hhbmdlcyA9IFtdO1xuICBwdXNoU2VsZWN0aW9uVG9IaXN0b3J5KHNlbEFmdGVyLCBkZXN0KTtcbiAgZGVzdC5wdXNoKHtjaGFuZ2VzOiBhbnRpQ2hhbmdlcywgZ2VuZXJhdGlvbjogaGlzdC5nZW5lcmF0aW9ufSk7XG4gIGhpc3QuZ2VuZXJhdGlvbiA9IGV2ZW50LmdlbmVyYXRpb24gfHwgKytoaXN0Lm1heEdlbmVyYXRpb247XG5cbiAgdmFyIGZpbHRlciA9IGhhc0hhbmRsZXIoZG9jLCBcImJlZm9yZUNoYW5nZVwiKSB8fCBkb2MuY20gJiYgaGFzSGFuZGxlcihkb2MuY20sIFwiYmVmb3JlQ2hhbmdlXCIpO1xuXG4gIHZhciBsb29wID0gZnVuY3Rpb24gKCBpICkge1xuICAgIHZhciBjaGFuZ2UgPSBldmVudC5jaGFuZ2VzW2ldO1xuICAgIGNoYW5nZS5vcmlnaW4gPSB0eXBlO1xuICAgIGlmIChmaWx0ZXIgJiYgIWZpbHRlckNoYW5nZShkb2MsIGNoYW5nZSwgZmFsc2UpKSB7XG4gICAgICBzb3VyY2UubGVuZ3RoID0gMDtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cblxuICAgIGFudGlDaGFuZ2VzLnB1c2goaGlzdG9yeUNoYW5nZUZyb21DaGFuZ2UoZG9jLCBjaGFuZ2UpKTtcblxuICAgIHZhciBhZnRlciA9IGkgPyBjb21wdXRlU2VsQWZ0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpIDogbHN0KHNvdXJjZSk7XG4gICAgbWFrZUNoYW5nZVNpbmdsZURvYyhkb2MsIGNoYW5nZSwgYWZ0ZXIsIG1lcmdlT2xkU3BhbnMoZG9jLCBjaGFuZ2UpKTtcbiAgICBpZiAoIWkgJiYgZG9jLmNtKSB7IGRvYy5jbS5zY3JvbGxJbnRvVmlldyh7ZnJvbTogY2hhbmdlLmZyb20sIHRvOiBjaGFuZ2VFbmQoY2hhbmdlKX0pOyB9XG4gICAgdmFyIHJlYmFzZWQgPSBbXTtcblxuICAgIC8vIFByb3BhZ2F0ZSB0byB0aGUgbGlua2VkIGRvY3VtZW50c1xuICAgIGxpbmtlZERvY3MoZG9jLCBmdW5jdGlvbiAoZG9jLCBzaGFyZWRIaXN0KSB7XG4gICAgICBpZiAoIXNoYXJlZEhpc3QgJiYgaW5kZXhPZihyZWJhc2VkLCBkb2MuaGlzdG9yeSkgPT0gLTEpIHtcbiAgICAgICAgcmViYXNlSGlzdChkb2MuaGlzdG9yeSwgY2hhbmdlKTtcbiAgICAgICAgcmViYXNlZC5wdXNoKGRvYy5oaXN0b3J5KTtcbiAgICAgIH1cbiAgICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIG51bGwsIG1lcmdlT2xkU3BhbnMoZG9jLCBjaGFuZ2UpKTtcbiAgICB9KTtcbiAgfTtcblxuICBmb3IgKHZhciBpJDEgPSBldmVudC5jaGFuZ2VzLmxlbmd0aCAtIDE7IGkkMSA+PSAwOyAtLWkkMSkge1xuICAgIHZhciByZXR1cm5lZCA9IGxvb3AoIGkkMSApO1xuXG4gICAgaWYgKCByZXR1cm5lZCApIHJldHVybiByZXR1cm5lZC52O1xuICB9XG59XG5cbi8vIFN1Yi12aWV3cyBuZWVkIHRoZWlyIGxpbmUgbnVtYmVycyBzaGlmdGVkIHdoZW4gdGV4dCBpcyBhZGRlZFxuLy8gYWJvdmUgb3IgYmVsb3cgdGhlbSBpbiB0aGUgcGFyZW50IGRvY3VtZW50LlxuZnVuY3Rpb24gc2hpZnREb2MoZG9jLCBkaXN0YW5jZSkge1xuICBpZiAoZGlzdGFuY2UgPT0gMCkgeyByZXR1cm4gfVxuICBkb2MuZmlyc3QgKz0gZGlzdGFuY2U7XG4gIGRvYy5zZWwgPSBuZXcgU2VsZWN0aW9uKG1hcChkb2Muc2VsLnJhbmdlcywgZnVuY3Rpb24gKHJhbmdlKSB7IHJldHVybiBuZXcgUmFuZ2UoXG4gICAgUG9zKHJhbmdlLmFuY2hvci5saW5lICsgZGlzdGFuY2UsIHJhbmdlLmFuY2hvci5jaCksXG4gICAgUG9zKHJhbmdlLmhlYWQubGluZSArIGRpc3RhbmNlLCByYW5nZS5oZWFkLmNoKVxuICApOyB9KSwgZG9jLnNlbC5wcmltSW5kZXgpO1xuICBpZiAoZG9jLmNtKSB7XG4gICAgcmVnQ2hhbmdlKGRvYy5jbSwgZG9jLmZpcnN0LCBkb2MuZmlyc3QgLSBkaXN0YW5jZSwgZGlzdGFuY2UpO1xuICAgIGZvciAodmFyIGQgPSBkb2MuY20uZGlzcGxheSwgbCA9IGQudmlld0Zyb207IGwgPCBkLnZpZXdUbzsgbCsrKVxuICAgICAgeyByZWdMaW5lQ2hhbmdlKGRvYy5jbSwgbCwgXCJndXR0ZXJcIik7IH1cbiAgfVxufVxuXG4vLyBNb3JlIGxvd2VyLWxldmVsIGNoYW5nZSBmdW5jdGlvbiwgaGFuZGxpbmcgb25seSBhIHNpbmdsZSBkb2N1bWVudFxuLy8gKG5vdCBsaW5rZWQgb25lcykuXG5mdW5jdGlvbiBtYWtlQ2hhbmdlU2luZ2xlRG9jKGRvYywgY2hhbmdlLCBzZWxBZnRlciwgc3BhbnMpIHtcbiAgaWYgKGRvYy5jbSAmJiAhZG9jLmNtLmN1ck9wKVxuICAgIHsgcmV0dXJuIG9wZXJhdGlvbihkb2MuY20sIG1ha2VDaGFuZ2VTaW5nbGVEb2MpKGRvYywgY2hhbmdlLCBzZWxBZnRlciwgc3BhbnMpIH1cblxuICBpZiAoY2hhbmdlLnRvLmxpbmUgPCBkb2MuZmlyc3QpIHtcbiAgICBzaGlmdERvYyhkb2MsIGNoYW5nZS50ZXh0Lmxlbmd0aCAtIDEgLSAoY2hhbmdlLnRvLmxpbmUgLSBjaGFuZ2UuZnJvbS5saW5lKSk7XG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKGNoYW5nZS5mcm9tLmxpbmUgPiBkb2MubGFzdExpbmUoKSkgeyByZXR1cm4gfVxuXG4gIC8vIENsaXAgdGhlIGNoYW5nZSB0byB0aGUgc2l6ZSBvZiB0aGlzIGRvY1xuICBpZiAoY2hhbmdlLmZyb20ubGluZSA8IGRvYy5maXJzdCkge1xuICAgIHZhciBzaGlmdCA9IGNoYW5nZS50ZXh0Lmxlbmd0aCAtIDEgLSAoZG9jLmZpcnN0IC0gY2hhbmdlLmZyb20ubGluZSk7XG4gICAgc2hpZnREb2MoZG9jLCBzaGlmdCk7XG4gICAgY2hhbmdlID0ge2Zyb206IFBvcyhkb2MuZmlyc3QsIDApLCB0bzogUG9zKGNoYW5nZS50by5saW5lICsgc2hpZnQsIGNoYW5nZS50by5jaCksXG4gICAgICAgICAgICAgIHRleHQ6IFtsc3QoY2hhbmdlLnRleHQpXSwgb3JpZ2luOiBjaGFuZ2Uub3JpZ2lufTtcbiAgfVxuICB2YXIgbGFzdCA9IGRvYy5sYXN0TGluZSgpO1xuICBpZiAoY2hhbmdlLnRvLmxpbmUgPiBsYXN0KSB7XG4gICAgY2hhbmdlID0ge2Zyb206IGNoYW5nZS5mcm9tLCB0bzogUG9zKGxhc3QsIGdldExpbmUoZG9jLCBsYXN0KS50ZXh0Lmxlbmd0aCksXG4gICAgICAgICAgICAgIHRleHQ6IFtjaGFuZ2UudGV4dFswXV0sIG9yaWdpbjogY2hhbmdlLm9yaWdpbn07XG4gIH1cblxuICBjaGFuZ2UucmVtb3ZlZCA9IGdldEJldHdlZW4oZG9jLCBjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKTtcblxuICBpZiAoIXNlbEFmdGVyKSB7IHNlbEFmdGVyID0gY29tcHV0ZVNlbEFmdGVyQ2hhbmdlKGRvYywgY2hhbmdlKTsgfVxuICBpZiAoZG9jLmNtKSB7IG1ha2VDaGFuZ2VTaW5nbGVEb2NJbkVkaXRvcihkb2MuY20sIGNoYW5nZSwgc3BhbnMpOyB9XG4gIGVsc2UgeyB1cGRhdGVEb2MoZG9jLCBjaGFuZ2UsIHNwYW5zKTsgfVxuICBzZXRTZWxlY3Rpb25Ob1VuZG8oZG9jLCBzZWxBZnRlciwgc2VsX2RvbnRTY3JvbGwpO1xufVxuXG4vLyBIYW5kbGUgdGhlIGludGVyYWN0aW9uIG9mIGEgY2hhbmdlIHRvIGEgZG9jdW1lbnQgd2l0aCB0aGUgZWRpdG9yXG4vLyB0aGF0IHRoaXMgZG9jdW1lbnQgaXMgcGFydCBvZi5cbmZ1bmN0aW9uIG1ha2VDaGFuZ2VTaW5nbGVEb2NJbkVkaXRvcihjbSwgY2hhbmdlLCBzcGFucykge1xuICB2YXIgZG9jID0gY20uZG9jLCBkaXNwbGF5ID0gY20uZGlzcGxheSwgZnJvbSA9IGNoYW5nZS5mcm9tLCB0byA9IGNoYW5nZS50bztcblxuICB2YXIgcmVjb21wdXRlTWF4TGVuZ3RoID0gZmFsc2UsIGNoZWNrV2lkdGhTdGFydCA9IGZyb20ubGluZTtcbiAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgIGNoZWNrV2lkdGhTdGFydCA9IGxpbmVObyh2aXN1YWxMaW5lKGdldExpbmUoZG9jLCBmcm9tLmxpbmUpKSk7XG4gICAgZG9jLml0ZXIoY2hlY2tXaWR0aFN0YXJ0LCB0by5saW5lICsgMSwgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgIGlmIChsaW5lID09IGRpc3BsYXkubWF4TGluZSkge1xuICAgICAgICByZWNvbXB1dGVNYXhMZW5ndGggPSB0cnVlO1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaWYgKGRvYy5zZWwuY29udGFpbnMoY2hhbmdlLmZyb20sIGNoYW5nZS50bykgPiAtMSlcbiAgICB7IHNpZ25hbEN1cnNvckFjdGl2aXR5KGNtKTsgfVxuXG4gIHVwZGF0ZURvYyhkb2MsIGNoYW5nZSwgc3BhbnMsIGVzdGltYXRlSGVpZ2h0KGNtKSk7XG5cbiAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgIGRvYy5pdGVyKGNoZWNrV2lkdGhTdGFydCwgZnJvbS5saW5lICsgY2hhbmdlLnRleHQubGVuZ3RoLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgdmFyIGxlbiA9IGxpbmVMZW5ndGgobGluZSk7XG4gICAgICBpZiAobGVuID4gZGlzcGxheS5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICAgIGRpc3BsYXkubWF4TGluZSA9IGxpbmU7XG4gICAgICAgIGRpc3BsYXkubWF4TGluZUxlbmd0aCA9IGxlbjtcbiAgICAgICAgZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIHJlY29tcHV0ZU1heExlbmd0aCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChyZWNvbXB1dGVNYXhMZW5ndGgpIHsgY20uY3VyT3AudXBkYXRlTWF4TGluZSA9IHRydWU7IH1cbiAgfVxuXG4gIC8vIEFkanVzdCBmcm9udGllciwgc2NoZWR1bGUgd29ya2VyXG4gIGRvYy5mcm9udGllciA9IE1hdGgubWluKGRvYy5mcm9udGllciwgZnJvbS5saW5lKTtcbiAgc3RhcnRXb3JrZXIoY20sIDQwMCk7XG5cbiAgdmFyIGxlbmRpZmYgPSBjaGFuZ2UudGV4dC5sZW5ndGggLSAodG8ubGluZSAtIGZyb20ubGluZSkgLSAxO1xuICAvLyBSZW1lbWJlciB0aGF0IHRoZXNlIGxpbmVzIGNoYW5nZWQsIGZvciB1cGRhdGluZyB0aGUgZGlzcGxheVxuICBpZiAoY2hhbmdlLmZ1bGwpXG4gICAgeyByZWdDaGFuZ2UoY20pOyB9XG4gIGVsc2UgaWYgKGZyb20ubGluZSA9PSB0by5saW5lICYmIGNoYW5nZS50ZXh0Lmxlbmd0aCA9PSAxICYmICFpc1dob2xlTGluZVVwZGF0ZShjbS5kb2MsIGNoYW5nZSkpXG4gICAgeyByZWdMaW5lQ2hhbmdlKGNtLCBmcm9tLmxpbmUsIFwidGV4dFwiKTsgfVxuICBlbHNlXG4gICAgeyByZWdDaGFuZ2UoY20sIGZyb20ubGluZSwgdG8ubGluZSArIDEsIGxlbmRpZmYpOyB9XG5cbiAgdmFyIGNoYW5nZXNIYW5kbGVyID0gaGFzSGFuZGxlcihjbSwgXCJjaGFuZ2VzXCIpLCBjaGFuZ2VIYW5kbGVyID0gaGFzSGFuZGxlcihjbSwgXCJjaGFuZ2VcIik7XG4gIGlmIChjaGFuZ2VIYW5kbGVyIHx8IGNoYW5nZXNIYW5kbGVyKSB7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGZyb206IGZyb20sIHRvOiB0byxcbiAgICAgIHRleHQ6IGNoYW5nZS50ZXh0LFxuICAgICAgcmVtb3ZlZDogY2hhbmdlLnJlbW92ZWQsXG4gICAgICBvcmlnaW46IGNoYW5nZS5vcmlnaW5cbiAgICB9O1xuICAgIGlmIChjaGFuZ2VIYW5kbGVyKSB7IHNpZ25hbExhdGVyKGNtLCBcImNoYW5nZVwiLCBjbSwgb2JqKTsgfVxuICAgIGlmIChjaGFuZ2VzSGFuZGxlcikgeyAoY20uY3VyT3AuY2hhbmdlT2JqcyB8fCAoY20uY3VyT3AuY2hhbmdlT2JqcyA9IFtdKSkucHVzaChvYmopOyB9XG4gIH1cbiAgY20uZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VSYW5nZShkb2MsIGNvZGUsIGZyb20sIHRvLCBvcmlnaW4pIHtcbiAgaWYgKCF0bykgeyB0byA9IGZyb207IH1cbiAgaWYgKGNtcCh0bywgZnJvbSkgPCAwKSB7IHZhciB0bXAgPSB0bzsgdG8gPSBmcm9tOyBmcm9tID0gdG1wOyB9XG4gIGlmICh0eXBlb2YgY29kZSA9PSBcInN0cmluZ1wiKSB7IGNvZGUgPSBkb2Muc3BsaXRMaW5lcyhjb2RlKTsgfVxuICBtYWtlQ2hhbmdlKGRvYywge2Zyb206IGZyb20sIHRvOiB0bywgdGV4dDogY29kZSwgb3JpZ2luOiBvcmlnaW59KTtcbn1cblxuLy8gUmViYXNpbmcvcmVzZXR0aW5nIGhpc3RvcnkgdG8gZGVhbCB3aXRoIGV4dGVybmFsbHktc291cmNlZCBjaGFuZ2VzXG5cbmZ1bmN0aW9uIHJlYmFzZUhpc3RTZWxTaW5nbGUocG9zLCBmcm9tLCB0bywgZGlmZikge1xuICBpZiAodG8gPCBwb3MubGluZSkge1xuICAgIHBvcy5saW5lICs9IGRpZmY7XG4gIH0gZWxzZSBpZiAoZnJvbSA8IHBvcy5saW5lKSB7XG4gICAgcG9zLmxpbmUgPSBmcm9tO1xuICAgIHBvcy5jaCA9IDA7XG4gIH1cbn1cblxuLy8gVHJpZXMgdG8gcmViYXNlIGFuIGFycmF5IG9mIGhpc3RvcnkgZXZlbnRzIGdpdmVuIGEgY2hhbmdlIGluIHRoZVxuLy8gZG9jdW1lbnQuIElmIHRoZSBjaGFuZ2UgdG91Y2hlcyB0aGUgc2FtZSBsaW5lcyBhcyB0aGUgZXZlbnQsIHRoZVxuLy8gZXZlbnQsIGFuZCBldmVyeXRoaW5nICdiZWhpbmQnIGl0LCBpcyBkaXNjYXJkZWQuIElmIHRoZSBjaGFuZ2UgaXNcbi8vIGJlZm9yZSB0aGUgZXZlbnQsIHRoZSBldmVudCdzIHBvc2l0aW9ucyBhcmUgdXBkYXRlZC4gVXNlcyBhXG4vLyBjb3B5LW9uLXdyaXRlIHNjaGVtZSBmb3IgdGhlIHBvc2l0aW9ucywgdG8gYXZvaWQgaGF2aW5nIHRvXG4vLyByZWFsbG9jYXRlIHRoZW0gYWxsIG9uIGV2ZXJ5IHJlYmFzZSwgYnV0IGFsc28gYXZvaWQgcHJvYmxlbXMgd2l0aFxuLy8gc2hhcmVkIHBvc2l0aW9uIG9iamVjdHMgYmVpbmcgdW5zYWZlbHkgdXBkYXRlZC5cbmZ1bmN0aW9uIHJlYmFzZUhpc3RBcnJheShhcnJheSwgZnJvbSwgdG8sIGRpZmYpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7ICsraSkge1xuICAgIHZhciBzdWIgPSBhcnJheVtpXSwgb2sgPSB0cnVlO1xuICAgIGlmIChzdWIucmFuZ2VzKSB7XG4gICAgICBpZiAoIXN1Yi5jb3BpZWQpIHsgc3ViID0gYXJyYXlbaV0gPSBzdWIuZGVlcENvcHkoKTsgc3ViLmNvcGllZCA9IHRydWU7IH1cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViLnJhbmdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICByZWJhc2VIaXN0U2VsU2luZ2xlKHN1Yi5yYW5nZXNbal0uYW5jaG9yLCBmcm9tLCB0bywgZGlmZik7XG4gICAgICAgIHJlYmFzZUhpc3RTZWxTaW5nbGUoc3ViLnJhbmdlc1tqXS5oZWFkLCBmcm9tLCB0bywgZGlmZik7XG4gICAgICB9XG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBmb3IgKHZhciBqJDEgPSAwOyBqJDEgPCBzdWIuY2hhbmdlcy5sZW5ndGg7ICsraiQxKSB7XG4gICAgICB2YXIgY3VyID0gc3ViLmNoYW5nZXNbaiQxXTtcbiAgICAgIGlmICh0byA8IGN1ci5mcm9tLmxpbmUpIHtcbiAgICAgICAgY3VyLmZyb20gPSBQb3MoY3VyLmZyb20ubGluZSArIGRpZmYsIGN1ci5mcm9tLmNoKTtcbiAgICAgICAgY3VyLnRvID0gUG9zKGN1ci50by5saW5lICsgZGlmZiwgY3VyLnRvLmNoKTtcbiAgICAgIH0gZWxzZSBpZiAoZnJvbSA8PSBjdXIudG8ubGluZSkge1xuICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW9rKSB7XG4gICAgICBhcnJheS5zcGxpY2UoMCwgaSArIDEpO1xuICAgICAgaSA9IDA7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYmFzZUhpc3QoaGlzdCwgY2hhbmdlKSB7XG4gIHZhciBmcm9tID0gY2hhbmdlLmZyb20ubGluZSwgdG8gPSBjaGFuZ2UudG8ubGluZSwgZGlmZiA9IGNoYW5nZS50ZXh0Lmxlbmd0aCAtICh0byAtIGZyb20pIC0gMTtcbiAgcmViYXNlSGlzdEFycmF5KGhpc3QuZG9uZSwgZnJvbSwgdG8sIGRpZmYpO1xuICByZWJhc2VIaXN0QXJyYXkoaGlzdC51bmRvbmUsIGZyb20sIHRvLCBkaWZmKTtcbn1cblxuLy8gVXRpbGl0eSBmb3IgYXBwbHlpbmcgYSBjaGFuZ2UgdG8gYSBsaW5lIGJ5IGhhbmRsZSBvciBudW1iZXIsXG4vLyByZXR1cm5pbmcgdGhlIG51bWJlciBhbmQgb3B0aW9uYWxseSByZWdpc3RlcmluZyB0aGUgbGluZSBhc1xuLy8gY2hhbmdlZC5cbmZ1bmN0aW9uIGNoYW5nZUxpbmUoZG9jLCBoYW5kbGUsIGNoYW5nZVR5cGUsIG9wKSB7XG4gIHZhciBubyA9IGhhbmRsZSwgbGluZSA9IGhhbmRsZTtcbiAgaWYgKHR5cGVvZiBoYW5kbGUgPT0gXCJudW1iZXJcIikgeyBsaW5lID0gZ2V0TGluZShkb2MsIGNsaXBMaW5lKGRvYywgaGFuZGxlKSk7IH1cbiAgZWxzZSB7IG5vID0gbGluZU5vKGhhbmRsZSk7IH1cbiAgaWYgKG5vID09IG51bGwpIHsgcmV0dXJuIG51bGwgfVxuICBpZiAob3AobGluZSwgbm8pICYmIGRvYy5jbSkgeyByZWdMaW5lQ2hhbmdlKGRvYy5jbSwgbm8sIGNoYW5nZVR5cGUpOyB9XG4gIHJldHVybiBsaW5lXG59XG5cbi8vIFRoZSBkb2N1bWVudCBpcyByZXByZXNlbnRlZCBhcyBhIEJUcmVlIGNvbnNpc3Rpbmcgb2YgbGVhdmVzLCB3aXRoXG4vLyBjaHVuayBvZiBsaW5lcyBpbiB0aGVtLCBhbmQgYnJhbmNoZXMsIHdpdGggdXAgdG8gdGVuIGxlYXZlcyBvclxuLy8gb3RoZXIgYnJhbmNoIG5vZGVzIGJlbG93IHRoZW0uIFRoZSB0b3Agbm9kZSBpcyBhbHdheXMgYSBicmFuY2hcbi8vIG5vZGUsIGFuZCBpcyB0aGUgZG9jdW1lbnQgb2JqZWN0IGl0c2VsZiAobWVhbmluZyBpdCBoYXNcbi8vIGFkZGl0aW9uYWwgbWV0aG9kcyBhbmQgcHJvcGVydGllcykuXG4vL1xuLy8gQWxsIG5vZGVzIGhhdmUgcGFyZW50IGxpbmtzLiBUaGUgdHJlZSBpcyB1c2VkIGJvdGggdG8gZ28gZnJvbVxuLy8gbGluZSBudW1iZXJzIHRvIGxpbmUgb2JqZWN0cywgYW5kIHRvIGdvIGZyb20gb2JqZWN0cyB0byBudW1iZXJzLlxuLy8gSXQgYWxzbyBpbmRleGVzIGJ5IGhlaWdodCwgYW5kIGlzIHVzZWQgdG8gY29udmVydCBiZXR3ZWVuIGhlaWdodFxuLy8gYW5kIGxpbmUgb2JqZWN0LCBhbmQgdG8gZmluZCB0aGUgdG90YWwgaGVpZ2h0IG9mIHRoZSBkb2N1bWVudC5cbi8vXG4vLyBTZWUgYWxzbyBodHRwOi8vbWFyaWpuaGF2ZXJiZWtlLm5sL2Jsb2cvY29kZW1pcnJvci1saW5lLXRyZWUuaHRtbFxuXG52YXIgTGVhZkNodW5rID0gZnVuY3Rpb24obGluZXMpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdGhpcy5saW5lcyA9IGxpbmVzO1xuICB0aGlzLnBhcmVudCA9IG51bGw7XG4gIHZhciBoZWlnaHQgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgbGluZXNbaV0ucGFyZW50ID0gdGhpcyQxO1xuICAgIGhlaWdodCArPSBsaW5lc1tpXS5oZWlnaHQ7XG4gIH1cbiAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG59O1xuXG5MZWFmQ2h1bmsucHJvdG90eXBlLmNodW5rU2l6ZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubGluZXMubGVuZ3RoIH07XG5cbi8vIFJlbW92ZSB0aGUgbiBsaW5lcyBhdCBvZmZzZXQgJ2F0Jy5cbkxlYWZDaHVuay5wcm90b3R5cGUucmVtb3ZlSW5uZXIgPSBmdW5jdGlvbiAoYXQsIG4pIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBmb3IgKHZhciBpID0gYXQsIGUgPSBhdCArIG47IGkgPCBlOyArK2kpIHtcbiAgICB2YXIgbGluZSA9IHRoaXMkMS5saW5lc1tpXTtcbiAgICB0aGlzJDEuaGVpZ2h0IC09IGxpbmUuaGVpZ2h0O1xuICAgIGNsZWFuVXBMaW5lKGxpbmUpO1xuICAgIHNpZ25hbExhdGVyKGxpbmUsIFwiZGVsZXRlXCIpO1xuICB9XG4gIHRoaXMubGluZXMuc3BsaWNlKGF0LCBuKTtcbn07XG5cbi8vIEhlbHBlciB1c2VkIHRvIGNvbGxhcHNlIGEgc21hbGwgYnJhbmNoIGludG8gYSBzaW5nbGUgbGVhZi5cbkxlYWZDaHVuay5wcm90b3R5cGUuY29sbGFwc2UgPSBmdW5jdGlvbiAobGluZXMpIHtcbiAgbGluZXMucHVzaC5hcHBseShsaW5lcywgdGhpcy5saW5lcyk7XG59O1xuXG4vLyBJbnNlcnQgdGhlIGdpdmVuIGFycmF5IG9mIGxpbmVzIGF0IG9mZnNldCAnYXQnLCBjb3VudCB0aGVtIGFzXG4vLyBoYXZpbmcgdGhlIGdpdmVuIGhlaWdodC5cbkxlYWZDaHVuay5wcm90b3R5cGUuaW5zZXJ0SW5uZXIgPSBmdW5jdGlvbiAoYXQsIGxpbmVzLCBoZWlnaHQpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB0aGlzLmhlaWdodCArPSBoZWlnaHQ7XG4gIHRoaXMubGluZXMgPSB0aGlzLmxpbmVzLnNsaWNlKDAsIGF0KS5jb25jYXQobGluZXMpLmNvbmNhdCh0aGlzLmxpbmVzLnNsaWNlKGF0KSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyArK2kpIHsgbGluZXNbaV0ucGFyZW50ID0gdGhpcyQxOyB9XG59O1xuXG4vLyBVc2VkIHRvIGl0ZXJhdGUgb3ZlciBhIHBhcnQgb2YgdGhlIHRyZWUuXG5MZWFmQ2h1bmsucHJvdG90eXBlLml0ZXJOID0gZnVuY3Rpb24gKGF0LCBuLCBvcCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGZvciAodmFyIGUgPSBhdCArIG47IGF0IDwgZTsgKythdClcbiAgICB7IGlmIChvcCh0aGlzJDEubGluZXNbYXRdKSkgeyByZXR1cm4gdHJ1ZSB9IH1cbn07XG5cbnZhciBCcmFuY2hDaHVuayA9IGZ1bmN0aW9uKGNoaWxkcmVuKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgdmFyIHNpemUgPSAwLCBoZWlnaHQgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNoID0gY2hpbGRyZW5baV07XG4gICAgc2l6ZSArPSBjaC5jaHVua1NpemUoKTsgaGVpZ2h0ICs9IGNoLmhlaWdodDtcbiAgICBjaC5wYXJlbnQgPSB0aGlzJDE7XG4gIH1cbiAgdGhpcy5zaXplID0gc2l6ZTtcbiAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gIHRoaXMucGFyZW50ID0gbnVsbDtcbn07XG5cbkJyYW5jaENodW5rLnByb3RvdHlwZS5jaHVua1NpemUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnNpemUgfTtcblxuQnJhbmNoQ2h1bmsucHJvdG90eXBlLnJlbW92ZUlubmVyID0gZnVuY3Rpb24gKGF0LCBuKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdGhpcy5zaXplIC09IG47XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgIHZhciBjaGlsZCA9IHRoaXMkMS5jaGlsZHJlbltpXSwgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcbiAgICBpZiAoYXQgPCBzeikge1xuICAgICAgdmFyIHJtID0gTWF0aC5taW4obiwgc3ogLSBhdCksIG9sZEhlaWdodCA9IGNoaWxkLmhlaWdodDtcbiAgICAgIGNoaWxkLnJlbW92ZUlubmVyKGF0LCBybSk7XG4gICAgICB0aGlzJDEuaGVpZ2h0IC09IG9sZEhlaWdodCAtIGNoaWxkLmhlaWdodDtcbiAgICAgIGlmIChzeiA9PSBybSkgeyB0aGlzJDEuY2hpbGRyZW4uc3BsaWNlKGktLSwgMSk7IGNoaWxkLnBhcmVudCA9IG51bGw7IH1cbiAgICAgIGlmICgobiAtPSBybSkgPT0gMCkgeyBicmVhayB9XG4gICAgICBhdCA9IDA7XG4gICAgfSBlbHNlIHsgYXQgLT0gc3o7IH1cbiAgfVxuICAvLyBJZiB0aGUgcmVzdWx0IGlzIHNtYWxsZXIgdGhhbiAyNSBsaW5lcywgZW5zdXJlIHRoYXQgaXQgaXMgYVxuICAvLyBzaW5nbGUgbGVhZiBub2RlLlxuICBpZiAodGhpcy5zaXplIC0gbiA8IDI1ICYmXG4gICAgICAodGhpcy5jaGlsZHJlbi5sZW5ndGggPiAxIHx8ICEodGhpcy5jaGlsZHJlblswXSBpbnN0YW5jZW9mIExlYWZDaHVuaykpKSB7XG4gICAgdmFyIGxpbmVzID0gW107XG4gICAgdGhpcy5jb2xsYXBzZShsaW5lcyk7XG4gICAgdGhpcy5jaGlsZHJlbiA9IFtuZXcgTGVhZkNodW5rKGxpbmVzKV07XG4gICAgdGhpcy5jaGlsZHJlblswXS5wYXJlbnQgPSB0aGlzO1xuICB9XG59O1xuXG5CcmFuY2hDaHVuay5wcm90b3R5cGUuY29sbGFwc2UgPSBmdW5jdGlvbiAobGluZXMpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHsgdGhpcyQxLmNoaWxkcmVuW2ldLmNvbGxhcHNlKGxpbmVzKTsgfVxufTtcblxuQnJhbmNoQ2h1bmsucHJvdG90eXBlLmluc2VydElubmVyID0gZnVuY3Rpb24gKGF0LCBsaW5lcywgaGVpZ2h0KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdGhpcy5zaXplICs9IGxpbmVzLmxlbmd0aDtcbiAgdGhpcy5oZWlnaHQgKz0gaGVpZ2h0O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgY2hpbGQgPSB0aGlzJDEuY2hpbGRyZW5baV0sIHN6ID0gY2hpbGQuY2h1bmtTaXplKCk7XG4gICAgaWYgKGF0IDw9IHN6KSB7XG4gICAgICBjaGlsZC5pbnNlcnRJbm5lcihhdCwgbGluZXMsIGhlaWdodCk7XG4gICAgICBpZiAoY2hpbGQubGluZXMgJiYgY2hpbGQubGluZXMubGVuZ3RoID4gNTApIHtcbiAgICAgICAgLy8gVG8gYXZvaWQgbWVtb3J5IHRocmFzaGluZyB3aGVuIGNoaWxkLmxpbmVzIGlzIGh1Z2UgKGUuZy4gZmlyc3QgdmlldyBvZiBhIGxhcmdlIGZpbGUpLCBpdCdzIG5ldmVyIHNwbGljZWQuXG4gICAgICAgIC8vIEluc3RlYWQsIHNtYWxsIHNsaWNlcyBhcmUgdGFrZW4uIFRoZXkncmUgdGFrZW4gaW4gb3JkZXIgYmVjYXVzZSBzZXF1ZW50aWFsIG1lbW9yeSBhY2Nlc3NlcyBhcmUgZmFzdGVzdC5cbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IGNoaWxkLmxpbmVzLmxlbmd0aCAlIDI1ICsgMjU7XG4gICAgICAgIGZvciAodmFyIHBvcyA9IHJlbWFpbmluZzsgcG9zIDwgY2hpbGQubGluZXMubGVuZ3RoOykge1xuICAgICAgICAgIHZhciBsZWFmID0gbmV3IExlYWZDaHVuayhjaGlsZC5saW5lcy5zbGljZShwb3MsIHBvcyArPSAyNSkpO1xuICAgICAgICAgIGNoaWxkLmhlaWdodCAtPSBsZWFmLmhlaWdodDtcbiAgICAgICAgICB0aGlzJDEuY2hpbGRyZW4uc3BsaWNlKCsraSwgMCwgbGVhZik7XG4gICAgICAgICAgbGVhZi5wYXJlbnQgPSB0aGlzJDE7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGQubGluZXMgPSBjaGlsZC5saW5lcy5zbGljZSgwLCByZW1haW5pbmcpO1xuICAgICAgICB0aGlzJDEubWF5YmVTcGlsbCgpO1xuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgYXQgLT0gc3o7XG4gIH1cbn07XG5cbi8vIFdoZW4gYSBub2RlIGhhcyBncm93biwgY2hlY2sgd2hldGhlciBpdCBzaG91bGQgYmUgc3BsaXQuXG5CcmFuY2hDaHVuay5wcm90b3R5cGUubWF5YmVTcGlsbCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoIDw9IDEwKSB7IHJldHVybiB9XG4gIHZhciBtZSA9IHRoaXM7XG4gIGRvIHtcbiAgICB2YXIgc3BpbGxlZCA9IG1lLmNoaWxkcmVuLnNwbGljZShtZS5jaGlsZHJlbi5sZW5ndGggLSA1LCA1KTtcbiAgICB2YXIgc2libGluZyA9IG5ldyBCcmFuY2hDaHVuayhzcGlsbGVkKTtcbiAgICBpZiAoIW1lLnBhcmVudCkgeyAvLyBCZWNvbWUgdGhlIHBhcmVudCBub2RlXG4gICAgICB2YXIgY29weSA9IG5ldyBCcmFuY2hDaHVuayhtZS5jaGlsZHJlbik7XG4gICAgICBjb3B5LnBhcmVudCA9IG1lO1xuICAgICAgbWUuY2hpbGRyZW4gPSBbY29weSwgc2libGluZ107XG4gICAgICBtZSA9IGNvcHk7XG4gICB9IGVsc2Uge1xuICAgICAgbWUuc2l6ZSAtPSBzaWJsaW5nLnNpemU7XG4gICAgICBtZS5oZWlnaHQgLT0gc2libGluZy5oZWlnaHQ7XG4gICAgICB2YXIgbXlJbmRleCA9IGluZGV4T2YobWUucGFyZW50LmNoaWxkcmVuLCBtZSk7XG4gICAgICBtZS5wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKG15SW5kZXggKyAxLCAwLCBzaWJsaW5nKTtcbiAgICB9XG4gICAgc2libGluZy5wYXJlbnQgPSBtZS5wYXJlbnQ7XG4gIH0gd2hpbGUgKG1lLmNoaWxkcmVuLmxlbmd0aCA+IDEwKVxuICBtZS5wYXJlbnQubWF5YmVTcGlsbCgpO1xufTtcblxuQnJhbmNoQ2h1bmsucHJvdG90eXBlLml0ZXJOID0gZnVuY3Rpb24gKGF0LCBuLCBvcCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgIHZhciBjaGlsZCA9IHRoaXMkMS5jaGlsZHJlbltpXSwgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcbiAgICBpZiAoYXQgPCBzeikge1xuICAgICAgdmFyIHVzZWQgPSBNYXRoLm1pbihuLCBzeiAtIGF0KTtcbiAgICAgIGlmIChjaGlsZC5pdGVyTihhdCwgdXNlZCwgb3ApKSB7IHJldHVybiB0cnVlIH1cbiAgICAgIGlmICgobiAtPSB1c2VkKSA9PSAwKSB7IGJyZWFrIH1cbiAgICAgIGF0ID0gMDtcbiAgICB9IGVsc2UgeyBhdCAtPSBzejsgfVxuICB9XG59O1xuXG4vLyBMaW5lIHdpZGdldHMgYXJlIGJsb2NrIGVsZW1lbnRzIGRpc3BsYXllZCBhYm92ZSBvciBiZWxvdyBhIGxpbmUuXG5cbnZhciBMaW5lV2lkZ2V0ID0gZnVuY3Rpb24oZG9jLCBub2RlLCBvcHRpb25zKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGlmIChvcHRpb25zKSB7IGZvciAodmFyIG9wdCBpbiBvcHRpb25zKSB7IGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KG9wdCkpXG4gICAgeyB0aGlzJDFbb3B0XSA9IG9wdGlvbnNbb3B0XTsgfSB9IH1cbiAgdGhpcy5kb2MgPSBkb2M7XG4gIHRoaXMubm9kZSA9IG5vZGU7XG59O1xuXG5MaW5lV2lkZ2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB2YXIgY20gPSB0aGlzLmRvYy5jbSwgd3MgPSB0aGlzLmxpbmUud2lkZ2V0cywgbGluZSA9IHRoaXMubGluZSwgbm8gPSBsaW5lTm8obGluZSk7XG4gIGlmIChubyA9PSBudWxsIHx8ICF3cykgeyByZXR1cm4gfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHdzLmxlbmd0aDsgKytpKSB7IGlmICh3c1tpXSA9PSB0aGlzJDEpIHsgd3Muc3BsaWNlKGktLSwgMSk7IH0gfVxuICBpZiAoIXdzLmxlbmd0aCkgeyBsaW5lLndpZGdldHMgPSBudWxsOyB9XG4gIHZhciBoZWlnaHQgPSB3aWRnZXRIZWlnaHQodGhpcyk7XG4gIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgTWF0aC5tYXgoMCwgbGluZS5oZWlnaHQgLSBoZWlnaHQpKTtcbiAgaWYgKGNtKSB7XG4gICAgcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgICAgYWRqdXN0U2Nyb2xsV2hlbkFib3ZlVmlzaWJsZShjbSwgbGluZSwgLWhlaWdodCk7XG4gICAgICByZWdMaW5lQ2hhbmdlKGNtLCBubywgXCJ3aWRnZXRcIik7XG4gICAgfSk7XG4gICAgc2lnbmFsTGF0ZXIoY20sIFwibGluZVdpZGdldENsZWFyZWRcIiwgY20sIHRoaXMsIG5vKTtcbiAgfVxufTtcblxuTGluZVdpZGdldC5wcm90b3R5cGUuY2hhbmdlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB2YXIgb2xkSCA9IHRoaXMuaGVpZ2h0LCBjbSA9IHRoaXMuZG9jLmNtLCBsaW5lID0gdGhpcy5saW5lO1xuICB0aGlzLmhlaWdodCA9IG51bGw7XG4gIHZhciBkaWZmID0gd2lkZ2V0SGVpZ2h0KHRoaXMpIC0gb2xkSDtcbiAgaWYgKCFkaWZmKSB7IHJldHVybiB9XG4gIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgbGluZS5oZWlnaHQgKyBkaWZmKTtcbiAgaWYgKGNtKSB7XG4gICAgcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgICAgY20uY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgYWRqdXN0U2Nyb2xsV2hlbkFib3ZlVmlzaWJsZShjbSwgbGluZSwgZGlmZik7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJsaW5lV2lkZ2V0Q2hhbmdlZFwiLCBjbSwgdGhpcyQxLCBsaW5lTm8obGluZSkpO1xuICAgIH0pO1xuICB9XG59O1xuZXZlbnRNaXhpbihMaW5lV2lkZ2V0KTtcblxuZnVuY3Rpb24gYWRqdXN0U2Nyb2xsV2hlbkFib3ZlVmlzaWJsZShjbSwgbGluZSwgZGlmZikge1xuICBpZiAoaGVpZ2h0QXRMaW5lKGxpbmUpIDwgKChjbS5jdXJPcCAmJiBjbS5jdXJPcC5zY3JvbGxUb3ApIHx8IGNtLmRvYy5zY3JvbGxUb3ApKVxuICAgIHsgYWRkVG9TY3JvbGxUb3AoY20sIGRpZmYpOyB9XG59XG5cbmZ1bmN0aW9uIGFkZExpbmVXaWRnZXQoZG9jLCBoYW5kbGUsIG5vZGUsIG9wdGlvbnMpIHtcbiAgdmFyIHdpZGdldCA9IG5ldyBMaW5lV2lkZ2V0KGRvYywgbm9kZSwgb3B0aW9ucyk7XG4gIHZhciBjbSA9IGRvYy5jbTtcbiAgaWYgKGNtICYmIHdpZGdldC5ub0hTY3JvbGwpIHsgY20uZGlzcGxheS5hbGlnbldpZGdldHMgPSB0cnVlOyB9XG4gIGNoYW5nZUxpbmUoZG9jLCBoYW5kbGUsIFwid2lkZ2V0XCIsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgdmFyIHdpZGdldHMgPSBsaW5lLndpZGdldHMgfHwgKGxpbmUud2lkZ2V0cyA9IFtdKTtcbiAgICBpZiAod2lkZ2V0Lmluc2VydEF0ID09IG51bGwpIHsgd2lkZ2V0cy5wdXNoKHdpZGdldCk7IH1cbiAgICBlbHNlIHsgd2lkZ2V0cy5zcGxpY2UoTWF0aC5taW4od2lkZ2V0cy5sZW5ndGggLSAxLCBNYXRoLm1heCgwLCB3aWRnZXQuaW5zZXJ0QXQpKSwgMCwgd2lkZ2V0KTsgfVxuICAgIHdpZGdldC5saW5lID0gbGluZTtcbiAgICBpZiAoY20gJiYgIWxpbmVJc0hpZGRlbihkb2MsIGxpbmUpKSB7XG4gICAgICB2YXIgYWJvdmVWaXNpYmxlID0gaGVpZ2h0QXRMaW5lKGxpbmUpIDwgZG9jLnNjcm9sbFRvcDtcbiAgICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgbGluZS5oZWlnaHQgKyB3aWRnZXRIZWlnaHQod2lkZ2V0KSk7XG4gICAgICBpZiAoYWJvdmVWaXNpYmxlKSB7IGFkZFRvU2Nyb2xsVG9wKGNtLCB3aWRnZXQuaGVpZ2h0KTsgfVxuICAgICAgY20uY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9KTtcbiAgc2lnbmFsTGF0ZXIoY20sIFwibGluZVdpZGdldEFkZGVkXCIsIGNtLCB3aWRnZXQsIHR5cGVvZiBoYW5kbGUgPT0gXCJudW1iZXJcIiA/IGhhbmRsZSA6IGxpbmVObyhoYW5kbGUpKTtcbiAgcmV0dXJuIHdpZGdldFxufVxuXG4vLyBURVhUTUFSS0VSU1xuXG4vLyBDcmVhdGVkIHdpdGggbWFya1RleHQgYW5kIHNldEJvb2ttYXJrIG1ldGhvZHMuIEEgVGV4dE1hcmtlciBpcyBhXG4vLyBoYW5kbGUgdGhhdCBjYW4gYmUgdXNlZCB0byBjbGVhciBvciBmaW5kIGEgbWFya2VkIHBvc2l0aW9uIGluIHRoZVxuLy8gZG9jdW1lbnQuIExpbmUgb2JqZWN0cyBob2xkIGFycmF5cyAobWFya2VkU3BhbnMpIGNvbnRhaW5pbmdcbi8vIHtmcm9tLCB0bywgbWFya2VyfSBvYmplY3QgcG9pbnRpbmcgdG8gc3VjaCBtYXJrZXIgb2JqZWN0cywgYW5kXG4vLyBpbmRpY2F0aW5nIHRoYXQgc3VjaCBhIG1hcmtlciBpcyBwcmVzZW50IG9uIHRoYXQgbGluZS4gTXVsdGlwbGVcbi8vIGxpbmVzIG1heSBwb2ludCB0byB0aGUgc2FtZSBtYXJrZXIgd2hlbiBpdCBzcGFucyBhY3Jvc3MgbGluZXMuXG4vLyBUaGUgc3BhbnMgd2lsbCBoYXZlIG51bGwgZm9yIHRoZWlyIGZyb20vdG8gcHJvcGVydGllcyB3aGVuIHRoZVxuLy8gbWFya2VyIGNvbnRpbnVlcyBiZXlvbmQgdGhlIHN0YXJ0L2VuZCBvZiB0aGUgbGluZS4gTWFya2VycyBoYXZlXG4vLyBsaW5rcyBiYWNrIHRvIHRoZSBsaW5lcyB0aGV5IGN1cnJlbnRseSB0b3VjaC5cblxuLy8gQ29sbGFwc2VkIG1hcmtlcnMgaGF2ZSB1bmlxdWUgaWRzLCBpbiBvcmRlciB0byBiZSBhYmxlIHRvIG9yZGVyXG4vLyB0aGVtLCB3aGljaCBpcyBuZWVkZWQgZm9yIHVuaXF1ZWx5IGRldGVybWluaW5nIGFuIG91dGVyIG1hcmtlclxuLy8gd2hlbiB0aGV5IG92ZXJsYXAgKHRoZXkgbWF5IG5lc3QsIGJ1dCBub3QgcGFydGlhbGx5IG92ZXJsYXApLlxudmFyIG5leHRNYXJrZXJJZCA9IDA7XG5cbnZhciBUZXh0TWFya2VyID0gZnVuY3Rpb24oZG9jLCB0eXBlKSB7XG4gIHRoaXMubGluZXMgPSBbXTtcbiAgdGhpcy50eXBlID0gdHlwZTtcbiAgdGhpcy5kb2MgPSBkb2M7XG4gIHRoaXMuaWQgPSArK25leHRNYXJrZXJJZDtcbn07XG5cbi8vIENsZWFyIHRoZSBtYXJrZXIuXG5UZXh0TWFya2VyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAodGhpcy5leHBsaWNpdGx5Q2xlYXJlZCkgeyByZXR1cm4gfVxuICB2YXIgY20gPSB0aGlzLmRvYy5jbSwgd2l0aE9wID0gY20gJiYgIWNtLmN1ck9wO1xuICBpZiAod2l0aE9wKSB7IHN0YXJ0T3BlcmF0aW9uKGNtKTsgfVxuICBpZiAoaGFzSGFuZGxlcih0aGlzLCBcImNsZWFyXCIpKSB7XG4gICAgdmFyIGZvdW5kID0gdGhpcy5maW5kKCk7XG4gICAgaWYgKGZvdW5kKSB7IHNpZ25hbExhdGVyKHRoaXMsIFwiY2xlYXJcIiwgZm91bmQuZnJvbSwgZm91bmQudG8pOyB9XG4gIH1cbiAgdmFyIG1pbiA9IG51bGwsIG1heCA9IG51bGw7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saW5lcy5sZW5ndGg7ICsraSkge1xuICAgIHZhciBsaW5lID0gdGhpcyQxLmxpbmVzW2ldO1xuICAgIHZhciBzcGFuID0gZ2V0TWFya2VkU3BhbkZvcihsaW5lLm1hcmtlZFNwYW5zLCB0aGlzJDEpO1xuICAgIGlmIChjbSAmJiAhdGhpcyQxLmNvbGxhcHNlZCkgeyByZWdMaW5lQ2hhbmdlKGNtLCBsaW5lTm8obGluZSksIFwidGV4dFwiKTsgfVxuICAgIGVsc2UgaWYgKGNtKSB7XG4gICAgICBpZiAoc3Bhbi50byAhPSBudWxsKSB7IG1heCA9IGxpbmVObyhsaW5lKTsgfVxuICAgICAgaWYgKHNwYW4uZnJvbSAhPSBudWxsKSB7IG1pbiA9IGxpbmVObyhsaW5lKTsgfVxuICAgIH1cbiAgICBsaW5lLm1hcmtlZFNwYW5zID0gcmVtb3ZlTWFya2VkU3BhbihsaW5lLm1hcmtlZFNwYW5zLCBzcGFuKTtcbiAgICBpZiAoc3Bhbi5mcm9tID09IG51bGwgJiYgdGhpcyQxLmNvbGxhcHNlZCAmJiAhbGluZUlzSGlkZGVuKHRoaXMkMS5kb2MsIGxpbmUpICYmIGNtKVxuICAgICAgeyB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIHRleHRIZWlnaHQoY20uZGlzcGxheSkpOyB9XG4gIH1cbiAgaWYgKGNtICYmIHRoaXMuY29sbGFwc2VkICYmICFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykgeyBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCB0aGlzLmxpbmVzLmxlbmd0aDsgKytpJDEpIHtcbiAgICB2YXIgdmlzdWFsID0gdmlzdWFsTGluZSh0aGlzJDEubGluZXNbaSQxXSksIGxlbiA9IGxpbmVMZW5ndGgodmlzdWFsKTtcbiAgICBpZiAobGVuID4gY20uZGlzcGxheS5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICBjbS5kaXNwbGF5Lm1heExpbmUgPSB2aXN1YWw7XG4gICAgICBjbS5kaXNwbGF5Lm1heExpbmVMZW5ndGggPSBsZW47XG4gICAgICBjbS5kaXNwbGF5Lm1heExpbmVDaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gIH0gfVxuXG4gIGlmIChtaW4gIT0gbnVsbCAmJiBjbSAmJiB0aGlzLmNvbGxhcHNlZCkgeyByZWdDaGFuZ2UoY20sIG1pbiwgbWF4ICsgMSk7IH1cbiAgdGhpcy5saW5lcy5sZW5ndGggPSAwO1xuICB0aGlzLmV4cGxpY2l0bHlDbGVhcmVkID0gdHJ1ZTtcbiAgaWYgKHRoaXMuYXRvbWljICYmIHRoaXMuZG9jLmNhbnRFZGl0KSB7XG4gICAgdGhpcy5kb2MuY2FudEVkaXQgPSBmYWxzZTtcbiAgICBpZiAoY20pIHsgcmVDaGVja1NlbGVjdGlvbihjbS5kb2MpOyB9XG4gIH1cbiAgaWYgKGNtKSB7IHNpZ25hbExhdGVyKGNtLCBcIm1hcmtlckNsZWFyZWRcIiwgY20sIHRoaXMsIG1pbiwgbWF4KTsgfVxuICBpZiAod2l0aE9wKSB7IGVuZE9wZXJhdGlvbihjbSk7IH1cbiAgaWYgKHRoaXMucGFyZW50KSB7IHRoaXMucGFyZW50LmNsZWFyKCk7IH1cbn07XG5cbi8vIEZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgaW4gdGhlIGRvY3VtZW50LiBSZXR1cm5zIGEge2Zyb20sXG4vLyB0b30gb2JqZWN0IGJ5IGRlZmF1bHQuIFNpZGUgY2FuIGJlIHBhc3NlZCB0byBnZXQgYSBzcGVjaWZpYyBzaWRlXG4vLyAtLSAwIChib3RoKSwgLTEgKGxlZnQpLCBvciAxIChyaWdodCkuIFdoZW4gbGluZU9iaiBpcyB0cnVlLCB0aGVcbi8vIFBvcyBvYmplY3RzIHJldHVybmVkIGNvbnRhaW4gYSBsaW5lIG9iamVjdCwgcmF0aGVyIHRoYW4gYSBsaW5lXG4vLyBudW1iZXIgKHVzZWQgdG8gcHJldmVudCBsb29raW5nIHVwIHRoZSBzYW1lIGxpbmUgdHdpY2UpLlxuVGV4dE1hcmtlci5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uIChzaWRlLCBsaW5lT2JqKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgaWYgKHNpZGUgPT0gbnVsbCAmJiB0aGlzLnR5cGUgPT0gXCJib29rbWFya1wiKSB7IHNpZGUgPSAxOyB9XG4gIHZhciBmcm9tLCB0bztcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGxpbmUgPSB0aGlzJDEubGluZXNbaV07XG4gICAgdmFyIHNwYW4gPSBnZXRNYXJrZWRTcGFuRm9yKGxpbmUubWFya2VkU3BhbnMsIHRoaXMkMSk7XG4gICAgaWYgKHNwYW4uZnJvbSAhPSBudWxsKSB7XG4gICAgICBmcm9tID0gUG9zKGxpbmVPYmogPyBsaW5lIDogbGluZU5vKGxpbmUpLCBzcGFuLmZyb20pO1xuICAgICAgaWYgKHNpZGUgPT0gLTEpIHsgcmV0dXJuIGZyb20gfVxuICAgIH1cbiAgICBpZiAoc3Bhbi50byAhPSBudWxsKSB7XG4gICAgICB0byA9IFBvcyhsaW5lT2JqID8gbGluZSA6IGxpbmVObyhsaW5lKSwgc3Bhbi50byk7XG4gICAgICBpZiAoc2lkZSA9PSAxKSB7IHJldHVybiB0byB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmcm9tICYmIHtmcm9tOiBmcm9tLCB0bzogdG99XG59O1xuXG4vLyBTaWduYWxzIHRoYXQgdGhlIG1hcmtlcidzIHdpZGdldCBjaGFuZ2VkLCBhbmQgc3Vycm91bmRpbmcgbGF5b3V0XG4vLyBzaG91bGQgYmUgcmVjb21wdXRlZC5cblRleHRNYXJrZXIucHJvdG90eXBlLmNoYW5nZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIHBvcyA9IHRoaXMuZmluZCgtMSwgdHJ1ZSksIHdpZGdldCA9IHRoaXMsIGNtID0gdGhpcy5kb2MuY207XG4gIGlmICghcG9zIHx8ICFjbSkgeyByZXR1cm4gfVxuICBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxpbmUgPSBwb3MubGluZSwgbGluZU4gPSBsaW5lTm8ocG9zLmxpbmUpO1xuICAgIHZhciB2aWV3ID0gZmluZFZpZXdGb3JMaW5lKGNtLCBsaW5lTik7XG4gICAgaWYgKHZpZXcpIHtcbiAgICAgIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGVGb3Iodmlldyk7XG4gICAgICBjbS5jdXJPcC5zZWxlY3Rpb25DaGFuZ2VkID0gY20uY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgICBjbS5jdXJPcC51cGRhdGVNYXhMaW5lID0gdHJ1ZTtcbiAgICBpZiAoIWxpbmVJc0hpZGRlbih3aWRnZXQuZG9jLCBsaW5lKSAmJiB3aWRnZXQuaGVpZ2h0ICE9IG51bGwpIHtcbiAgICAgIHZhciBvbGRIZWlnaHQgPSB3aWRnZXQuaGVpZ2h0O1xuICAgICAgd2lkZ2V0LmhlaWdodCA9IG51bGw7XG4gICAgICB2YXIgZEhlaWdodCA9IHdpZGdldEhlaWdodCh3aWRnZXQpIC0gb2xkSGVpZ2h0O1xuICAgICAgaWYgKGRIZWlnaHQpXG4gICAgICAgIHsgdXBkYXRlTGluZUhlaWdodChsaW5lLCBsaW5lLmhlaWdodCArIGRIZWlnaHQpOyB9XG4gICAgfVxuICAgIHNpZ25hbExhdGVyKGNtLCBcIm1hcmtlckNoYW5nZWRcIiwgY20sIHRoaXMkMSk7XG4gIH0pO1xufTtcblxuVGV4dE1hcmtlci5wcm90b3R5cGUuYXR0YWNoTGluZSA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gIGlmICghdGhpcy5saW5lcy5sZW5ndGggJiYgdGhpcy5kb2MuY20pIHtcbiAgICB2YXIgb3AgPSB0aGlzLmRvYy5jbS5jdXJPcDtcbiAgICBpZiAoIW9wLm1heWJlSGlkZGVuTWFya2VycyB8fCBpbmRleE9mKG9wLm1heWJlSGlkZGVuTWFya2VycywgdGhpcykgPT0gLTEpXG4gICAgICB7IChvcC5tYXliZVVuaGlkZGVuTWFya2VycyB8fCAob3AubWF5YmVVbmhpZGRlbk1hcmtlcnMgPSBbXSkpLnB1c2godGhpcyk7IH1cbiAgfVxuICB0aGlzLmxpbmVzLnB1c2gobGluZSk7XG59O1xuXG5UZXh0TWFya2VyLnByb3RvdHlwZS5kZXRhY2hMaW5lID0gZnVuY3Rpb24gKGxpbmUpIHtcbiAgdGhpcy5saW5lcy5zcGxpY2UoaW5kZXhPZih0aGlzLmxpbmVzLCBsaW5lKSwgMSk7XG4gIGlmICghdGhpcy5saW5lcy5sZW5ndGggJiYgdGhpcy5kb2MuY20pIHtcbiAgICB2YXIgb3AgPSB0aGlzLmRvYy5jbS5jdXJPcDsob3AubWF5YmVIaWRkZW5NYXJrZXJzIHx8IChvcC5tYXliZUhpZGRlbk1hcmtlcnMgPSBbXSkpLnB1c2godGhpcyk7XG4gIH1cbn07XG5ldmVudE1peGluKFRleHRNYXJrZXIpO1xuXG4vLyBDcmVhdGUgYSBtYXJrZXIsIHdpcmUgaXQgdXAgdG8gdGhlIHJpZ2h0IGxpbmVzLCBhbmRcbmZ1bmN0aW9uIG1hcmtUZXh0KGRvYywgZnJvbSwgdG8sIG9wdGlvbnMsIHR5cGUpIHtcbiAgLy8gU2hhcmVkIG1hcmtlcnMgKGFjcm9zcyBsaW5rZWQgZG9jdW1lbnRzKSBhcmUgaGFuZGxlZCBzZXBhcmF0ZWx5XG4gIC8vIChtYXJrVGV4dFNoYXJlZCB3aWxsIGNhbGwgb3V0IHRvIHRoaXMgYWdhaW4sIG9uY2UgcGVyXG4gIC8vIGRvY3VtZW50KS5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zaGFyZWQpIHsgcmV0dXJuIG1hcmtUZXh0U2hhcmVkKGRvYywgZnJvbSwgdG8sIG9wdGlvbnMsIHR5cGUpIH1cbiAgLy8gRW5zdXJlIHdlIGFyZSBpbiBhbiBvcGVyYXRpb24uXG4gIGlmIChkb2MuY20gJiYgIWRvYy5jbS5jdXJPcCkgeyByZXR1cm4gb3BlcmF0aW9uKGRvYy5jbSwgbWFya1RleHQpKGRvYywgZnJvbSwgdG8sIG9wdGlvbnMsIHR5cGUpIH1cblxuICB2YXIgbWFya2VyID0gbmV3IFRleHRNYXJrZXIoZG9jLCB0eXBlKSwgZGlmZiA9IGNtcChmcm9tLCB0byk7XG4gIGlmIChvcHRpb25zKSB7IGNvcHlPYmoob3B0aW9ucywgbWFya2VyLCBmYWxzZSk7IH1cbiAgLy8gRG9uJ3QgY29ubmVjdCBlbXB0eSBtYXJrZXJzIHVubGVzcyBjbGVhcldoZW5FbXB0eSBpcyBmYWxzZVxuICBpZiAoZGlmZiA+IDAgfHwgZGlmZiA9PSAwICYmIG1hcmtlci5jbGVhcldoZW5FbXB0eSAhPT0gZmFsc2UpXG4gICAgeyByZXR1cm4gbWFya2VyIH1cbiAgaWYgKG1hcmtlci5yZXBsYWNlZFdpdGgpIHtcbiAgICAvLyBTaG93aW5nIHVwIGFzIGEgd2lkZ2V0IGltcGxpZXMgY29sbGFwc2VkICh3aWRnZXQgcmVwbGFjZXMgdGV4dClcbiAgICBtYXJrZXIuY29sbGFwc2VkID0gdHJ1ZTtcbiAgICBtYXJrZXIud2lkZ2V0Tm9kZSA9IGVsdFAoXCJzcGFuXCIsIFttYXJrZXIucmVwbGFjZWRXaXRoXSwgXCJDb2RlTWlycm9yLXdpZGdldFwiKTtcbiAgICBpZiAoIW9wdGlvbnMuaGFuZGxlTW91c2VFdmVudHMpIHsgbWFya2VyLndpZGdldE5vZGUuc2V0QXR0cmlidXRlKFwiY20taWdub3JlLWV2ZW50c1wiLCBcInRydWVcIik7IH1cbiAgICBpZiAob3B0aW9ucy5pbnNlcnRMZWZ0KSB7IG1hcmtlci53aWRnZXROb2RlLmluc2VydExlZnQgPSB0cnVlOyB9XG4gIH1cbiAgaWYgKG1hcmtlci5jb2xsYXBzZWQpIHtcbiAgICBpZiAoY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIGZyb20ubGluZSwgZnJvbSwgdG8sIG1hcmtlcikgfHxcbiAgICAgICAgZnJvbS5saW5lICE9IHRvLmxpbmUgJiYgY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIHRvLmxpbmUsIGZyb20sIHRvLCBtYXJrZXIpKVxuICAgICAgeyB0aHJvdyBuZXcgRXJyb3IoXCJJbnNlcnRpbmcgY29sbGFwc2VkIG1hcmtlciBwYXJ0aWFsbHkgb3ZlcmxhcHBpbmcgYW4gZXhpc3Rpbmcgb25lXCIpIH1cbiAgICBzZWVDb2xsYXBzZWRTcGFucygpO1xuICB9XG5cbiAgaWYgKG1hcmtlci5hZGRUb0hpc3RvcnkpXG4gICAgeyBhZGRDaGFuZ2VUb0hpc3RvcnkoZG9jLCB7ZnJvbTogZnJvbSwgdG86IHRvLCBvcmlnaW46IFwibWFya1RleHRcIn0sIGRvYy5zZWwsIE5hTik7IH1cblxuICB2YXIgY3VyTGluZSA9IGZyb20ubGluZSwgY20gPSBkb2MuY20sIHVwZGF0ZU1heExpbmU7XG4gIGRvYy5pdGVyKGN1ckxpbmUsIHRvLmxpbmUgKyAxLCBmdW5jdGlvbiAobGluZSkge1xuICAgIGlmIChjbSAmJiBtYXJrZXIuY29sbGFwc2VkICYmICFjbS5vcHRpb25zLmxpbmVXcmFwcGluZyAmJiB2aXN1YWxMaW5lKGxpbmUpID09IGNtLmRpc3BsYXkubWF4TGluZSlcbiAgICAgIHsgdXBkYXRlTWF4TGluZSA9IHRydWU7IH1cbiAgICBpZiAobWFya2VyLmNvbGxhcHNlZCAmJiBjdXJMaW5lICE9IGZyb20ubGluZSkgeyB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIDApOyB9XG4gICAgYWRkTWFya2VkU3BhbihsaW5lLCBuZXcgTWFya2VkU3BhbihtYXJrZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJMaW5lID09IGZyb20ubGluZSA/IGZyb20uY2ggOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyTGluZSA9PSB0by5saW5lID8gdG8uY2ggOiBudWxsKSk7XG4gICAgKytjdXJMaW5lO1xuICB9KTtcbiAgLy8gbGluZUlzSGlkZGVuIGRlcGVuZHMgb24gdGhlIHByZXNlbmNlIG9mIHRoZSBzcGFucywgc28gbmVlZHMgYSBzZWNvbmQgcGFzc1xuICBpZiAobWFya2VyLmNvbGxhcHNlZCkgeyBkb2MuaXRlcihmcm9tLmxpbmUsIHRvLmxpbmUgKyAxLCBmdW5jdGlvbiAobGluZSkge1xuICAgIGlmIChsaW5lSXNIaWRkZW4oZG9jLCBsaW5lKSkgeyB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIDApOyB9XG4gIH0pOyB9XG5cbiAgaWYgKG1hcmtlci5jbGVhck9uRW50ZXIpIHsgb24obWFya2VyLCBcImJlZm9yZUN1cnNvckVudGVyXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hcmtlci5jbGVhcigpOyB9KTsgfVxuXG4gIGlmIChtYXJrZXIucmVhZE9ubHkpIHtcbiAgICBzZWVSZWFkT25seVNwYW5zKCk7XG4gICAgaWYgKGRvYy5oaXN0b3J5LmRvbmUubGVuZ3RoIHx8IGRvYy5oaXN0b3J5LnVuZG9uZS5sZW5ndGgpXG4gICAgICB7IGRvYy5jbGVhckhpc3RvcnkoKTsgfVxuICB9XG4gIGlmIChtYXJrZXIuY29sbGFwc2VkKSB7XG4gICAgbWFya2VyLmlkID0gKytuZXh0TWFya2VySWQ7XG4gICAgbWFya2VyLmF0b21pYyA9IHRydWU7XG4gIH1cbiAgaWYgKGNtKSB7XG4gICAgLy8gU3luYyBlZGl0b3Igc3RhdGVcbiAgICBpZiAodXBkYXRlTWF4TGluZSkgeyBjbS5jdXJPcC51cGRhdGVNYXhMaW5lID0gdHJ1ZTsgfVxuICAgIGlmIChtYXJrZXIuY29sbGFwc2VkKVxuICAgICAgeyByZWdDaGFuZ2UoY20sIGZyb20ubGluZSwgdG8ubGluZSArIDEpOyB9XG4gICAgZWxzZSBpZiAobWFya2VyLmNsYXNzTmFtZSB8fCBtYXJrZXIudGl0bGUgfHwgbWFya2VyLnN0YXJ0U3R5bGUgfHwgbWFya2VyLmVuZFN0eWxlIHx8IG1hcmtlci5jc3MpXG4gICAgICB7IGZvciAodmFyIGkgPSBmcm9tLmxpbmU7IGkgPD0gdG8ubGluZTsgaSsrKSB7IHJlZ0xpbmVDaGFuZ2UoY20sIGksIFwidGV4dFwiKTsgfSB9XG4gICAgaWYgKG1hcmtlci5hdG9taWMpIHsgcmVDaGVja1NlbGVjdGlvbihjbS5kb2MpOyB9XG4gICAgc2lnbmFsTGF0ZXIoY20sIFwibWFya2VyQWRkZWRcIiwgY20sIG1hcmtlcik7XG4gIH1cbiAgcmV0dXJuIG1hcmtlclxufVxuXG4vLyBTSEFSRUQgVEVYVE1BUktFUlNcblxuLy8gQSBzaGFyZWQgbWFya2VyIHNwYW5zIG11bHRpcGxlIGxpbmtlZCBkb2N1bWVudHMuIEl0IGlzXG4vLyBpbXBsZW1lbnRlZCBhcyBhIG1ldGEtbWFya2VyLW9iamVjdCBjb250cm9sbGluZyBtdWx0aXBsZSBub3JtYWxcbi8vIG1hcmtlcnMuXG52YXIgU2hhcmVkVGV4dE1hcmtlciA9IGZ1bmN0aW9uKG1hcmtlcnMsIHByaW1hcnkpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdGhpcy5tYXJrZXJzID0gbWFya2VycztcbiAgdGhpcy5wcmltYXJ5ID0gcHJpbWFyeTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgKytpKVxuICAgIHsgbWFya2Vyc1tpXS5wYXJlbnQgPSB0aGlzJDE7IH1cbn07XG5cblNoYXJlZFRleHRNYXJrZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGlmICh0aGlzLmV4cGxpY2l0bHlDbGVhcmVkKSB7IHJldHVybiB9XG4gIHRoaXMuZXhwbGljaXRseUNsZWFyZWQgPSB0cnVlO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7ICsraSlcbiAgICB7IHRoaXMkMS5tYXJrZXJzW2ldLmNsZWFyKCk7IH1cbiAgc2lnbmFsTGF0ZXIodGhpcywgXCJjbGVhclwiKTtcbn07XG5cblNoYXJlZFRleHRNYXJrZXIucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiAoc2lkZSwgbGluZU9iaikge1xuICByZXR1cm4gdGhpcy5wcmltYXJ5LmZpbmQoc2lkZSwgbGluZU9iailcbn07XG5ldmVudE1peGluKFNoYXJlZFRleHRNYXJrZXIpO1xuXG5mdW5jdGlvbiBtYXJrVGV4dFNoYXJlZChkb2MsIGZyb20sIHRvLCBvcHRpb25zLCB0eXBlKSB7XG4gIG9wdGlvbnMgPSBjb3B5T2JqKG9wdGlvbnMpO1xuICBvcHRpb25zLnNoYXJlZCA9IGZhbHNlO1xuICB2YXIgbWFya2VycyA9IFttYXJrVGV4dChkb2MsIGZyb20sIHRvLCBvcHRpb25zLCB0eXBlKV0sIHByaW1hcnkgPSBtYXJrZXJzWzBdO1xuICB2YXIgd2lkZ2V0ID0gb3B0aW9ucy53aWRnZXROb2RlO1xuICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24gKGRvYykge1xuICAgIGlmICh3aWRnZXQpIHsgb3B0aW9ucy53aWRnZXROb2RlID0gd2lkZ2V0LmNsb25lTm9kZSh0cnVlKTsgfVxuICAgIG1hcmtlcnMucHVzaChtYXJrVGV4dChkb2MsIGNsaXBQb3MoZG9jLCBmcm9tKSwgY2xpcFBvcyhkb2MsIHRvKSwgb3B0aW9ucywgdHlwZSkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLmxpbmtlZC5sZW5ndGg7ICsraSlcbiAgICAgIHsgaWYgKGRvYy5saW5rZWRbaV0uaXNQYXJlbnQpIHsgcmV0dXJuIH0gfVxuICAgIHByaW1hcnkgPSBsc3QobWFya2Vycyk7XG4gIH0pO1xuICByZXR1cm4gbmV3IFNoYXJlZFRleHRNYXJrZXIobWFya2VycywgcHJpbWFyeSlcbn1cblxuZnVuY3Rpb24gZmluZFNoYXJlZE1hcmtlcnMoZG9jKSB7XG4gIHJldHVybiBkb2MuZmluZE1hcmtzKFBvcyhkb2MuZmlyc3QsIDApLCBkb2MuY2xpcFBvcyhQb3MoZG9jLmxhc3RMaW5lKCkpKSwgZnVuY3Rpb24gKG0pIHsgcmV0dXJuIG0ucGFyZW50OyB9KVxufVxuXG5mdW5jdGlvbiBjb3B5U2hhcmVkTWFya2Vycyhkb2MsIG1hcmtlcnMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG1hcmtlciA9IG1hcmtlcnNbaV0sIHBvcyA9IG1hcmtlci5maW5kKCk7XG4gICAgdmFyIG1Gcm9tID0gZG9jLmNsaXBQb3MocG9zLmZyb20pLCBtVG8gPSBkb2MuY2xpcFBvcyhwb3MudG8pO1xuICAgIGlmIChjbXAobUZyb20sIG1UbykpIHtcbiAgICAgIHZhciBzdWJNYXJrID0gbWFya1RleHQoZG9jLCBtRnJvbSwgbVRvLCBtYXJrZXIucHJpbWFyeSwgbWFya2VyLnByaW1hcnkudHlwZSk7XG4gICAgICBtYXJrZXIubWFya2Vycy5wdXNoKHN1Yk1hcmspO1xuICAgICAgc3ViTWFyay5wYXJlbnQgPSBtYXJrZXI7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRldGFjaFNoYXJlZE1hcmtlcnMobWFya2Vycykge1xuICB2YXIgbG9vcCA9IGZ1bmN0aW9uICggaSApIHtcbiAgICB2YXIgbWFya2VyID0gbWFya2Vyc1tpXSwgbGlua2VkID0gW21hcmtlci5wcmltYXJ5LmRvY107XG4gICAgbGlua2VkRG9jcyhtYXJrZXIucHJpbWFyeS5kb2MsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBsaW5rZWQucHVzaChkKTsgfSk7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYXJrZXIubWFya2Vycy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIHN1Yk1hcmtlciA9IG1hcmtlci5tYXJrZXJzW2pdO1xuICAgICAgaWYgKGluZGV4T2YobGlua2VkLCBzdWJNYXJrZXIuZG9jKSA9PSAtMSkge1xuICAgICAgICBzdWJNYXJrZXIucGFyZW50ID0gbnVsbDtcbiAgICAgICAgbWFya2VyLm1hcmtlcnMuc3BsaWNlKGotLSwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7IGkrKykgbG9vcCggaSApO1xufVxuXG52YXIgbmV4dERvY0lkID0gMDtcbnZhciBEb2MgPSBmdW5jdGlvbih0ZXh0LCBtb2RlLCBmaXJzdExpbmUsIGxpbmVTZXAsIGRpcmVjdGlvbikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRG9jKSkgeyByZXR1cm4gbmV3IERvYyh0ZXh0LCBtb2RlLCBmaXJzdExpbmUsIGxpbmVTZXAsIGRpcmVjdGlvbikgfVxuICBpZiAoZmlyc3RMaW5lID09IG51bGwpIHsgZmlyc3RMaW5lID0gMDsgfVxuXG4gIEJyYW5jaENodW5rLmNhbGwodGhpcywgW25ldyBMZWFmQ2h1bmsoW25ldyBMaW5lKFwiXCIsIG51bGwpXSldKTtcbiAgdGhpcy5maXJzdCA9IGZpcnN0TGluZTtcbiAgdGhpcy5zY3JvbGxUb3AgPSB0aGlzLnNjcm9sbExlZnQgPSAwO1xuICB0aGlzLmNhbnRFZGl0ID0gZmFsc2U7XG4gIHRoaXMuY2xlYW5HZW5lcmF0aW9uID0gMTtcbiAgdGhpcy5mcm9udGllciA9IGZpcnN0TGluZTtcbiAgdmFyIHN0YXJ0ID0gUG9zKGZpcnN0TGluZSwgMCk7XG4gIHRoaXMuc2VsID0gc2ltcGxlU2VsZWN0aW9uKHN0YXJ0KTtcbiAgdGhpcy5oaXN0b3J5ID0gbmV3IEhpc3RvcnkobnVsbCk7XG4gIHRoaXMuaWQgPSArK25leHREb2NJZDtcbiAgdGhpcy5tb2RlT3B0aW9uID0gbW9kZTtcbiAgdGhpcy5saW5lU2VwID0gbGluZVNlcDtcbiAgdGhpcy5kaXJlY3Rpb24gPSAoZGlyZWN0aW9uID09IFwicnRsXCIpID8gXCJydGxcIiA6IFwibHRyXCI7XG4gIHRoaXMuZXh0ZW5kID0gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiB0ZXh0ID09IFwic3RyaW5nXCIpIHsgdGV4dCA9IHRoaXMuc3BsaXRMaW5lcyh0ZXh0KTsgfVxuICB1cGRhdGVEb2ModGhpcywge2Zyb206IHN0YXJ0LCB0bzogc3RhcnQsIHRleHQ6IHRleHR9KTtcbiAgc2V0U2VsZWN0aW9uKHRoaXMsIHNpbXBsZVNlbGVjdGlvbihzdGFydCksIHNlbF9kb250U2Nyb2xsKTtcbn07XG5cbkRvYy5wcm90b3R5cGUgPSBjcmVhdGVPYmooQnJhbmNoQ2h1bmsucHJvdG90eXBlLCB7XG4gIGNvbnN0cnVjdG9yOiBEb2MsXG4gIC8vIEl0ZXJhdGUgb3ZlciB0aGUgZG9jdW1lbnQuIFN1cHBvcnRzIHR3byBmb3JtcyAtLSB3aXRoIG9ubHkgb25lXG4gIC8vIGFyZ3VtZW50LCBpdCBjYWxscyB0aGF0IGZvciBlYWNoIGxpbmUgaW4gdGhlIGRvY3VtZW50LiBXaXRoXG4gIC8vIHRocmVlLCBpdCBpdGVyYXRlcyBvdmVyIHRoZSByYW5nZSBnaXZlbiBieSB0aGUgZmlyc3QgdHdvICh3aXRoXG4gIC8vIHRoZSBzZWNvbmQgYmVpbmcgbm9uLWluY2x1c2l2ZSkuXG4gIGl0ZXI6IGZ1bmN0aW9uKGZyb20sIHRvLCBvcCkge1xuICAgIGlmIChvcCkgeyB0aGlzLml0ZXJOKGZyb20gLSB0aGlzLmZpcnN0LCB0byAtIGZyb20sIG9wKTsgfVxuICAgIGVsc2UgeyB0aGlzLml0ZXJOKHRoaXMuZmlyc3QsIHRoaXMuZmlyc3QgKyB0aGlzLnNpemUsIGZyb20pOyB9XG4gIH0sXG5cbiAgLy8gTm9uLXB1YmxpYyBpbnRlcmZhY2UgZm9yIGFkZGluZyBhbmQgcmVtb3ZpbmcgbGluZXMuXG4gIGluc2VydDogZnVuY3Rpb24oYXQsIGxpbmVzKSB7XG4gICAgdmFyIGhlaWdodCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkgeyBoZWlnaHQgKz0gbGluZXNbaV0uaGVpZ2h0OyB9XG4gICAgdGhpcy5pbnNlcnRJbm5lcihhdCAtIHRoaXMuZmlyc3QsIGxpbmVzLCBoZWlnaHQpO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKGF0LCBuKSB7IHRoaXMucmVtb3ZlSW5uZXIoYXQgLSB0aGlzLmZpcnN0LCBuKTsgfSxcblxuICAvLyBGcm9tIGhlcmUsIHRoZSBtZXRob2RzIGFyZSBwYXJ0IG9mIHRoZSBwdWJsaWMgaW50ZXJmYWNlLiBNb3N0XG4gIC8vIGFyZSBhbHNvIGF2YWlsYWJsZSBmcm9tIENvZGVNaXJyb3IgKGVkaXRvcikgaW5zdGFuY2VzLlxuXG4gIGdldFZhbHVlOiBmdW5jdGlvbihsaW5lU2VwKSB7XG4gICAgdmFyIGxpbmVzID0gZ2V0TGluZXModGhpcywgdGhpcy5maXJzdCwgdGhpcy5maXJzdCArIHRoaXMuc2l6ZSk7XG4gICAgaWYgKGxpbmVTZXAgPT09IGZhbHNlKSB7IHJldHVybiBsaW5lcyB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4obGluZVNlcCB8fCB0aGlzLmxpbmVTZXBhcmF0b3IoKSlcbiAgfSxcbiAgc2V0VmFsdWU6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGNvZGUpIHtcbiAgICB2YXIgdG9wID0gUG9zKHRoaXMuZmlyc3QsIDApLCBsYXN0ID0gdGhpcy5maXJzdCArIHRoaXMuc2l6ZSAtIDE7XG4gICAgbWFrZUNoYW5nZSh0aGlzLCB7ZnJvbTogdG9wLCB0bzogUG9zKGxhc3QsIGdldExpbmUodGhpcywgbGFzdCkudGV4dC5sZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMuc3BsaXRMaW5lcyhjb2RlKSwgb3JpZ2luOiBcInNldFZhbHVlXCIsIGZ1bGw6IHRydWV9LCB0cnVlKTtcbiAgICBpZiAodGhpcy5jbSkgeyBzY3JvbGxUb0Nvb3Jkcyh0aGlzLmNtLCAwLCAwKTsgfVxuICAgIHNldFNlbGVjdGlvbih0aGlzLCBzaW1wbGVTZWxlY3Rpb24odG9wKSwgc2VsX2RvbnRTY3JvbGwpO1xuICB9KSxcbiAgcmVwbGFjZVJhbmdlOiBmdW5jdGlvbihjb2RlLCBmcm9tLCB0bywgb3JpZ2luKSB7XG4gICAgZnJvbSA9IGNsaXBQb3ModGhpcywgZnJvbSk7XG4gICAgdG8gPSB0byA/IGNsaXBQb3ModGhpcywgdG8pIDogZnJvbTtcbiAgICByZXBsYWNlUmFuZ2UodGhpcywgY29kZSwgZnJvbSwgdG8sIG9yaWdpbik7XG4gIH0sXG4gIGdldFJhbmdlOiBmdW5jdGlvbihmcm9tLCB0bywgbGluZVNlcCkge1xuICAgIHZhciBsaW5lcyA9IGdldEJldHdlZW4odGhpcywgY2xpcFBvcyh0aGlzLCBmcm9tKSwgY2xpcFBvcyh0aGlzLCB0bykpO1xuICAgIGlmIChsaW5lU2VwID09PSBmYWxzZSkgeyByZXR1cm4gbGluZXMgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKGxpbmVTZXAgfHwgdGhpcy5saW5lU2VwYXJhdG9yKCkpXG4gIH0sXG5cbiAgZ2V0TGluZTogZnVuY3Rpb24obGluZSkge3ZhciBsID0gdGhpcy5nZXRMaW5lSGFuZGxlKGxpbmUpOyByZXR1cm4gbCAmJiBsLnRleHR9LFxuXG4gIGdldExpbmVIYW5kbGU6IGZ1bmN0aW9uKGxpbmUpIHtpZiAoaXNMaW5lKHRoaXMsIGxpbmUpKSB7IHJldHVybiBnZXRMaW5lKHRoaXMsIGxpbmUpIH19LFxuICBnZXRMaW5lTnVtYmVyOiBmdW5jdGlvbihsaW5lKSB7cmV0dXJuIGxpbmVObyhsaW5lKX0sXG5cbiAgZ2V0TGluZUhhbmRsZVZpc3VhbFN0YXJ0OiBmdW5jdGlvbihsaW5lKSB7XG4gICAgaWYgKHR5cGVvZiBsaW5lID09IFwibnVtYmVyXCIpIHsgbGluZSA9IGdldExpbmUodGhpcywgbGluZSk7IH1cbiAgICByZXR1cm4gdmlzdWFsTGluZShsaW5lKVxuICB9LFxuXG4gIGxpbmVDb3VudDogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuc2l6ZX0sXG4gIGZpcnN0TGluZTogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuZmlyc3R9LFxuICBsYXN0TGluZTogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuZmlyc3QgKyB0aGlzLnNpemUgLSAxfSxcblxuICBjbGlwUG9zOiBmdW5jdGlvbihwb3MpIHtyZXR1cm4gY2xpcFBvcyh0aGlzLCBwb3MpfSxcblxuICBnZXRDdXJzb3I6IGZ1bmN0aW9uKHN0YXJ0KSB7XG4gICAgdmFyIHJhbmdlJCQxID0gdGhpcy5zZWwucHJpbWFyeSgpLCBwb3M7XG4gICAgaWYgKHN0YXJ0ID09IG51bGwgfHwgc3RhcnQgPT0gXCJoZWFkXCIpIHsgcG9zID0gcmFuZ2UkJDEuaGVhZDsgfVxuICAgIGVsc2UgaWYgKHN0YXJ0ID09IFwiYW5jaG9yXCIpIHsgcG9zID0gcmFuZ2UkJDEuYW5jaG9yOyB9XG4gICAgZWxzZSBpZiAoc3RhcnQgPT0gXCJlbmRcIiB8fCBzdGFydCA9PSBcInRvXCIgfHwgc3RhcnQgPT09IGZhbHNlKSB7IHBvcyA9IHJhbmdlJCQxLnRvKCk7IH1cbiAgICBlbHNlIHsgcG9zID0gcmFuZ2UkJDEuZnJvbSgpOyB9XG4gICAgcmV0dXJuIHBvc1xuICB9LFxuICBsaXN0U2VsZWN0aW9uczogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLnNlbC5yYW5nZXMgfSxcbiAgc29tZXRoaW5nU2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLnNlbC5zb21ldGhpbmdTZWxlY3RlZCgpfSxcblxuICBzZXRDdXJzb3I6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGxpbmUsIGNoLCBvcHRpb25zKSB7XG4gICAgc2V0U2ltcGxlU2VsZWN0aW9uKHRoaXMsIGNsaXBQb3ModGhpcywgdHlwZW9mIGxpbmUgPT0gXCJudW1iZXJcIiA/IFBvcyhsaW5lLCBjaCB8fCAwKSA6IGxpbmUpLCBudWxsLCBvcHRpb25zKTtcbiAgfSksXG4gIHNldFNlbGVjdGlvbjogZG9jTWV0aG9kT3AoZnVuY3Rpb24oYW5jaG9yLCBoZWFkLCBvcHRpb25zKSB7XG4gICAgc2V0U2ltcGxlU2VsZWN0aW9uKHRoaXMsIGNsaXBQb3ModGhpcywgYW5jaG9yKSwgY2xpcFBvcyh0aGlzLCBoZWFkIHx8IGFuY2hvciksIG9wdGlvbnMpO1xuICB9KSxcbiAgZXh0ZW5kU2VsZWN0aW9uOiBkb2NNZXRob2RPcChmdW5jdGlvbihoZWFkLCBvdGhlciwgb3B0aW9ucykge1xuICAgIGV4dGVuZFNlbGVjdGlvbih0aGlzLCBjbGlwUG9zKHRoaXMsIGhlYWQpLCBvdGhlciAmJiBjbGlwUG9zKHRoaXMsIG90aGVyKSwgb3B0aW9ucyk7XG4gIH0pLFxuICBleHRlbmRTZWxlY3Rpb25zOiBkb2NNZXRob2RPcChmdW5jdGlvbihoZWFkcywgb3B0aW9ucykge1xuICAgIGV4dGVuZFNlbGVjdGlvbnModGhpcywgY2xpcFBvc0FycmF5KHRoaXMsIGhlYWRzKSwgb3B0aW9ucyk7XG4gIH0pLFxuICBleHRlbmRTZWxlY3Rpb25zQnk6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGYsIG9wdGlvbnMpIHtcbiAgICB2YXIgaGVhZHMgPSBtYXAodGhpcy5zZWwucmFuZ2VzLCBmKTtcbiAgICBleHRlbmRTZWxlY3Rpb25zKHRoaXMsIGNsaXBQb3NBcnJheSh0aGlzLCBoZWFkcyksIG9wdGlvbnMpO1xuICB9KSxcbiAgc2V0U2VsZWN0aW9uczogZG9jTWV0aG9kT3AoZnVuY3Rpb24ocmFuZ2VzLCBwcmltYXJ5LCBvcHRpb25zKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICBpZiAoIXJhbmdlcy5sZW5ndGgpIHsgcmV0dXJuIH1cbiAgICB2YXIgb3V0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICB7IG91dFtpXSA9IG5ldyBSYW5nZShjbGlwUG9zKHRoaXMkMSwgcmFuZ2VzW2ldLmFuY2hvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgY2xpcFBvcyh0aGlzJDEsIHJhbmdlc1tpXS5oZWFkKSk7IH1cbiAgICBpZiAocHJpbWFyeSA9PSBudWxsKSB7IHByaW1hcnkgPSBNYXRoLm1pbihyYW5nZXMubGVuZ3RoIC0gMSwgdGhpcy5zZWwucHJpbUluZGV4KTsgfVxuICAgIHNldFNlbGVjdGlvbih0aGlzLCBub3JtYWxpemVTZWxlY3Rpb24ob3V0LCBwcmltYXJ5KSwgb3B0aW9ucyk7XG4gIH0pLFxuICBhZGRTZWxlY3Rpb246IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGFuY2hvciwgaGVhZCwgb3B0aW9ucykge1xuICAgIHZhciByYW5nZXMgPSB0aGlzLnNlbC5yYW5nZXMuc2xpY2UoMCk7XG4gICAgcmFuZ2VzLnB1c2gobmV3IFJhbmdlKGNsaXBQb3ModGhpcywgYW5jaG9yKSwgY2xpcFBvcyh0aGlzLCBoZWFkIHx8IGFuY2hvcikpKTtcbiAgICBzZXRTZWxlY3Rpb24odGhpcywgbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcywgcmFuZ2VzLmxlbmd0aCAtIDEpLCBvcHRpb25zKTtcbiAgfSksXG5cbiAgZ2V0U2VsZWN0aW9uOiBmdW5jdGlvbihsaW5lU2VwKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB2YXIgcmFuZ2VzID0gdGhpcy5zZWwucmFuZ2VzLCBsaW5lcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlbCA9IGdldEJldHdlZW4odGhpcyQxLCByYW5nZXNbaV0uZnJvbSgpLCByYW5nZXNbaV0udG8oKSk7XG4gICAgICBsaW5lcyA9IGxpbmVzID8gbGluZXMuY29uY2F0KHNlbCkgOiBzZWw7XG4gICAgfVxuICAgIGlmIChsaW5lU2VwID09PSBmYWxzZSkgeyByZXR1cm4gbGluZXMgfVxuICAgIGVsc2UgeyByZXR1cm4gbGluZXMuam9pbihsaW5lU2VwIHx8IHRoaXMubGluZVNlcGFyYXRvcigpKSB9XG4gIH0sXG4gIGdldFNlbGVjdGlvbnM6IGZ1bmN0aW9uKGxpbmVTZXApIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIHZhciBwYXJ0cyA9IFtdLCByYW5nZXMgPSB0aGlzLnNlbC5yYW5nZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzZWwgPSBnZXRCZXR3ZWVuKHRoaXMkMSwgcmFuZ2VzW2ldLmZyb20oKSwgcmFuZ2VzW2ldLnRvKCkpO1xuICAgICAgaWYgKGxpbmVTZXAgIT09IGZhbHNlKSB7IHNlbCA9IHNlbC5qb2luKGxpbmVTZXAgfHwgdGhpcyQxLmxpbmVTZXBhcmF0b3IoKSk7IH1cbiAgICAgIHBhcnRzW2ldID0gc2VsO1xuICAgIH1cbiAgICByZXR1cm4gcGFydHNcbiAgfSxcbiAgcmVwbGFjZVNlbGVjdGlvbjogZnVuY3Rpb24oY29kZSwgY29sbGFwc2UsIG9yaWdpbikge1xuICAgIHZhciBkdXAgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2VsLnJhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgIHsgZHVwW2ldID0gY29kZTsgfVxuICAgIHRoaXMucmVwbGFjZVNlbGVjdGlvbnMoZHVwLCBjb2xsYXBzZSwgb3JpZ2luIHx8IFwiK2lucHV0XCIpO1xuICB9LFxuICByZXBsYWNlU2VsZWN0aW9uczogZG9jTWV0aG9kT3AoZnVuY3Rpb24oY29kZSwgY29sbGFwc2UsIG9yaWdpbikge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgdmFyIGNoYW5nZXMgPSBbXSwgc2VsID0gdGhpcy5zZWw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmFuZ2UkJDEgPSBzZWwucmFuZ2VzW2ldO1xuICAgICAgY2hhbmdlc1tpXSA9IHtmcm9tOiByYW5nZSQkMS5mcm9tKCksIHRvOiByYW5nZSQkMS50bygpLCB0ZXh0OiB0aGlzJDEuc3BsaXRMaW5lcyhjb2RlW2ldKSwgb3JpZ2luOiBvcmlnaW59O1xuICAgIH1cbiAgICB2YXIgbmV3U2VsID0gY29sbGFwc2UgJiYgY29sbGFwc2UgIT0gXCJlbmRcIiAmJiBjb21wdXRlUmVwbGFjZWRTZWwodGhpcywgY2hhbmdlcywgY29sbGFwc2UpO1xuICAgIGZvciAodmFyIGkkMSA9IGNoYW5nZXMubGVuZ3RoIC0gMTsgaSQxID49IDA7IGkkMS0tKVxuICAgICAgeyBtYWtlQ2hhbmdlKHRoaXMkMSwgY2hhbmdlc1tpJDFdKTsgfVxuICAgIGlmIChuZXdTZWwpIHsgc2V0U2VsZWN0aW9uUmVwbGFjZUhpc3RvcnkodGhpcywgbmV3U2VsKTsgfVxuICAgIGVsc2UgaWYgKHRoaXMuY20pIHsgZW5zdXJlQ3Vyc29yVmlzaWJsZSh0aGlzLmNtKTsgfVxuICB9KSxcbiAgdW5kbzogZG9jTWV0aG9kT3AoZnVuY3Rpb24oKSB7bWFrZUNoYW5nZUZyb21IaXN0b3J5KHRoaXMsIFwidW5kb1wiKTt9KSxcbiAgcmVkbzogZG9jTWV0aG9kT3AoZnVuY3Rpb24oKSB7bWFrZUNoYW5nZUZyb21IaXN0b3J5KHRoaXMsIFwicmVkb1wiKTt9KSxcbiAgdW5kb1NlbGVjdGlvbjogZG9jTWV0aG9kT3AoZnVuY3Rpb24oKSB7bWFrZUNoYW5nZUZyb21IaXN0b3J5KHRoaXMsIFwidW5kb1wiLCB0cnVlKTt9KSxcbiAgcmVkb1NlbGVjdGlvbjogZG9jTWV0aG9kT3AoZnVuY3Rpb24oKSB7bWFrZUNoYW5nZUZyb21IaXN0b3J5KHRoaXMsIFwicmVkb1wiLCB0cnVlKTt9KSxcblxuICBzZXRFeHRlbmRpbmc6IGZ1bmN0aW9uKHZhbCkge3RoaXMuZXh0ZW5kID0gdmFsO30sXG4gIGdldEV4dGVuZGluZzogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuZXh0ZW5kfSxcblxuICBoaXN0b3J5U2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhpc3QgPSB0aGlzLmhpc3RvcnksIGRvbmUgPSAwLCB1bmRvbmUgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGlzdC5kb25lLmxlbmd0aDsgaSsrKSB7IGlmICghaGlzdC5kb25lW2ldLnJhbmdlcykgeyArK2RvbmU7IH0gfVxuICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IGhpc3QudW5kb25lLmxlbmd0aDsgaSQxKyspIHsgaWYgKCFoaXN0LnVuZG9uZVtpJDFdLnJhbmdlcykgeyArK3VuZG9uZTsgfSB9XG4gICAgcmV0dXJuIHt1bmRvOiBkb25lLCByZWRvOiB1bmRvbmV9XG4gIH0sXG4gIGNsZWFySGlzdG9yeTogZnVuY3Rpb24oKSB7dGhpcy5oaXN0b3J5ID0gbmV3IEhpc3RvcnkodGhpcy5oaXN0b3J5Lm1heEdlbmVyYXRpb24pO30sXG5cbiAgbWFya0NsZWFuOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsZWFuR2VuZXJhdGlvbiA9IHRoaXMuY2hhbmdlR2VuZXJhdGlvbih0cnVlKTtcbiAgfSxcbiAgY2hhbmdlR2VuZXJhdGlvbjogZnVuY3Rpb24oZm9yY2VTcGxpdCkge1xuICAgIGlmIChmb3JjZVNwbGl0KVxuICAgICAgeyB0aGlzLmhpc3RvcnkubGFzdE9wID0gdGhpcy5oaXN0b3J5Lmxhc3RTZWxPcCA9IHRoaXMuaGlzdG9yeS5sYXN0T3JpZ2luID0gbnVsbDsgfVxuICAgIHJldHVybiB0aGlzLmhpc3RvcnkuZ2VuZXJhdGlvblxuICB9LFxuICBpc0NsZWFuOiBmdW5jdGlvbiAoZ2VuKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5nZW5lcmF0aW9uID09IChnZW4gfHwgdGhpcy5jbGVhbkdlbmVyYXRpb24pXG4gIH0sXG5cbiAgZ2V0SGlzdG9yeTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtkb25lOiBjb3B5SGlzdG9yeUFycmF5KHRoaXMuaGlzdG9yeS5kb25lKSxcbiAgICAgICAgICAgIHVuZG9uZTogY29weUhpc3RvcnlBcnJheSh0aGlzLmhpc3RvcnkudW5kb25lKX1cbiAgfSxcbiAgc2V0SGlzdG9yeTogZnVuY3Rpb24oaGlzdERhdGEpIHtcbiAgICB2YXIgaGlzdCA9IHRoaXMuaGlzdG9yeSA9IG5ldyBIaXN0b3J5KHRoaXMuaGlzdG9yeS5tYXhHZW5lcmF0aW9uKTtcbiAgICBoaXN0LmRvbmUgPSBjb3B5SGlzdG9yeUFycmF5KGhpc3REYXRhLmRvbmUuc2xpY2UoMCksIG51bGwsIHRydWUpO1xuICAgIGhpc3QudW5kb25lID0gY29weUhpc3RvcnlBcnJheShoaXN0RGF0YS51bmRvbmUuc2xpY2UoMCksIG51bGwsIHRydWUpO1xuICB9LFxuXG4gIHNldEd1dHRlck1hcmtlcjogZG9jTWV0aG9kT3AoZnVuY3Rpb24obGluZSwgZ3V0dGVySUQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGNoYW5nZUxpbmUodGhpcywgbGluZSwgXCJndXR0ZXJcIiwgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgIHZhciBtYXJrZXJzID0gbGluZS5ndXR0ZXJNYXJrZXJzIHx8IChsaW5lLmd1dHRlck1hcmtlcnMgPSB7fSk7XG4gICAgICBtYXJrZXJzW2d1dHRlcklEXSA9IHZhbHVlO1xuICAgICAgaWYgKCF2YWx1ZSAmJiBpc0VtcHR5KG1hcmtlcnMpKSB7IGxpbmUuZ3V0dGVyTWFya2VycyA9IG51bGw7IH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbiAgfSksXG5cbiAgY2xlYXJHdXR0ZXI6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGd1dHRlcklEKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB0aGlzLml0ZXIoZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgIGlmIChsaW5lLmd1dHRlck1hcmtlcnMgJiYgbGluZS5ndXR0ZXJNYXJrZXJzW2d1dHRlcklEXSkge1xuICAgICAgICBjaGFuZ2VMaW5lKHRoaXMkMSwgbGluZSwgXCJndXR0ZXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGxpbmUuZ3V0dGVyTWFya2Vyc1tndXR0ZXJJRF0gPSBudWxsO1xuICAgICAgICAgIGlmIChpc0VtcHR5KGxpbmUuZ3V0dGVyTWFya2VycykpIHsgbGluZS5ndXR0ZXJNYXJrZXJzID0gbnVsbDsgfVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KSxcblxuICBsaW5lSW5mbzogZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBuO1xuICAgIGlmICh0eXBlb2YgbGluZSA9PSBcIm51bWJlclwiKSB7XG4gICAgICBpZiAoIWlzTGluZSh0aGlzLCBsaW5lKSkgeyByZXR1cm4gbnVsbCB9XG4gICAgICBuID0gbGluZTtcbiAgICAgIGxpbmUgPSBnZXRMaW5lKHRoaXMsIGxpbmUpO1xuICAgICAgaWYgKCFsaW5lKSB7IHJldHVybiBudWxsIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbiA9IGxpbmVObyhsaW5lKTtcbiAgICAgIGlmIChuID09IG51bGwpIHsgcmV0dXJuIG51bGwgfVxuICAgIH1cbiAgICByZXR1cm4ge2xpbmU6IG4sIGhhbmRsZTogbGluZSwgdGV4dDogbGluZS50ZXh0LCBndXR0ZXJNYXJrZXJzOiBsaW5lLmd1dHRlck1hcmtlcnMsXG4gICAgICAgICAgICB0ZXh0Q2xhc3M6IGxpbmUudGV4dENsYXNzLCBiZ0NsYXNzOiBsaW5lLmJnQ2xhc3MsIHdyYXBDbGFzczogbGluZS53cmFwQ2xhc3MsXG4gICAgICAgICAgICB3aWRnZXRzOiBsaW5lLndpZGdldHN9XG4gIH0sXG5cbiAgYWRkTGluZUNsYXNzOiBkb2NNZXRob2RPcChmdW5jdGlvbihoYW5kbGUsIHdoZXJlLCBjbHMpIHtcbiAgICByZXR1cm4gY2hhbmdlTGluZSh0aGlzLCBoYW5kbGUsIHdoZXJlID09IFwiZ3V0dGVyXCIgPyBcImd1dHRlclwiIDogXCJjbGFzc1wiLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgdmFyIHByb3AgPSB3aGVyZSA9PSBcInRleHRcIiA/IFwidGV4dENsYXNzXCJcbiAgICAgICAgICAgICAgIDogd2hlcmUgPT0gXCJiYWNrZ3JvdW5kXCIgPyBcImJnQ2xhc3NcIlxuICAgICAgICAgICAgICAgOiB3aGVyZSA9PSBcImd1dHRlclwiID8gXCJndXR0ZXJDbGFzc1wiIDogXCJ3cmFwQ2xhc3NcIjtcbiAgICAgIGlmICghbGluZVtwcm9wXSkgeyBsaW5lW3Byb3BdID0gY2xzOyB9XG4gICAgICBlbHNlIGlmIChjbGFzc1Rlc3QoY2xzKS50ZXN0KGxpbmVbcHJvcF0pKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICBlbHNlIHsgbGluZVtwcm9wXSArPSBcIiBcIiArIGNsczsgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICB9KSxcbiAgcmVtb3ZlTGluZUNsYXNzOiBkb2NNZXRob2RPcChmdW5jdGlvbihoYW5kbGUsIHdoZXJlLCBjbHMpIHtcbiAgICByZXR1cm4gY2hhbmdlTGluZSh0aGlzLCBoYW5kbGUsIHdoZXJlID09IFwiZ3V0dGVyXCIgPyBcImd1dHRlclwiIDogXCJjbGFzc1wiLCBmdW5jdGlvbiAobGluZSkge1xuICAgICAgdmFyIHByb3AgPSB3aGVyZSA9PSBcInRleHRcIiA/IFwidGV4dENsYXNzXCJcbiAgICAgICAgICAgICAgIDogd2hlcmUgPT0gXCJiYWNrZ3JvdW5kXCIgPyBcImJnQ2xhc3NcIlxuICAgICAgICAgICAgICAgOiB3aGVyZSA9PSBcImd1dHRlclwiID8gXCJndXR0ZXJDbGFzc1wiIDogXCJ3cmFwQ2xhc3NcIjtcbiAgICAgIHZhciBjdXIgPSBsaW5lW3Byb3BdO1xuICAgICAgaWYgKCFjdXIpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgIGVsc2UgaWYgKGNscyA9PSBudWxsKSB7IGxpbmVbcHJvcF0gPSBudWxsOyB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGZvdW5kID0gY3VyLm1hdGNoKGNsYXNzVGVzdChjbHMpKTtcbiAgICAgICAgaWYgKCFmb3VuZCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICB2YXIgZW5kID0gZm91bmQuaW5kZXggKyBmb3VuZFswXS5sZW5ndGg7XG4gICAgICAgIGxpbmVbcHJvcF0gPSBjdXIuc2xpY2UoMCwgZm91bmQuaW5kZXgpICsgKCFmb3VuZC5pbmRleCB8fCBlbmQgPT0gY3VyLmxlbmd0aCA/IFwiXCIgOiBcIiBcIikgKyBjdXIuc2xpY2UoZW5kKSB8fCBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICB9KSxcblxuICBhZGRMaW5lV2lkZ2V0OiBkb2NNZXRob2RPcChmdW5jdGlvbihoYW5kbGUsIG5vZGUsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gYWRkTGluZVdpZGdldCh0aGlzLCBoYW5kbGUsIG5vZGUsIG9wdGlvbnMpXG4gIH0pLFxuICByZW1vdmVMaW5lV2lkZ2V0OiBmdW5jdGlvbih3aWRnZXQpIHsgd2lkZ2V0LmNsZWFyKCk7IH0sXG5cbiAgbWFya1RleHQ6IGZ1bmN0aW9uKGZyb20sIHRvLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG1hcmtUZXh0KHRoaXMsIGNsaXBQb3ModGhpcywgZnJvbSksIGNsaXBQb3ModGhpcywgdG8pLCBvcHRpb25zLCBvcHRpb25zICYmIG9wdGlvbnMudHlwZSB8fCBcInJhbmdlXCIpXG4gIH0sXG4gIHNldEJvb2ttYXJrOiBmdW5jdGlvbihwb3MsIG9wdGlvbnMpIHtcbiAgICB2YXIgcmVhbE9wdHMgPSB7cmVwbGFjZWRXaXRoOiBvcHRpb25zICYmIChvcHRpb25zLm5vZGVUeXBlID09IG51bGwgPyBvcHRpb25zLndpZGdldCA6IG9wdGlvbnMpLFxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRMZWZ0OiBvcHRpb25zICYmIG9wdGlvbnMuaW5zZXJ0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJXaGVuRW1wdHk6IGZhbHNlLCBzaGFyZWQ6IG9wdGlvbnMgJiYgb3B0aW9ucy5zaGFyZWQsXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZU1vdXNlRXZlbnRzOiBvcHRpb25zICYmIG9wdGlvbnMuaGFuZGxlTW91c2VFdmVudHN9O1xuICAgIHBvcyA9IGNsaXBQb3ModGhpcywgcG9zKTtcbiAgICByZXR1cm4gbWFya1RleHQodGhpcywgcG9zLCBwb3MsIHJlYWxPcHRzLCBcImJvb2ttYXJrXCIpXG4gIH0sXG4gIGZpbmRNYXJrc0F0OiBmdW5jdGlvbihwb3MpIHtcbiAgICBwb3MgPSBjbGlwUG9zKHRoaXMsIHBvcyk7XG4gICAgdmFyIG1hcmtlcnMgPSBbXSwgc3BhbnMgPSBnZXRMaW5lKHRoaXMsIHBvcy5saW5lKS5tYXJrZWRTcGFucztcbiAgICBpZiAoc3BhbnMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICAgIGlmICgoc3Bhbi5mcm9tID09IG51bGwgfHwgc3Bhbi5mcm9tIDw9IHBvcy5jaCkgJiZcbiAgICAgICAgICAoc3Bhbi50byA9PSBudWxsIHx8IHNwYW4udG8gPj0gcG9zLmNoKSlcbiAgICAgICAgeyBtYXJrZXJzLnB1c2goc3Bhbi5tYXJrZXIucGFyZW50IHx8IHNwYW4ubWFya2VyKTsgfVxuICAgIH0gfVxuICAgIHJldHVybiBtYXJrZXJzXG4gIH0sXG4gIGZpbmRNYXJrczogZnVuY3Rpb24oZnJvbSwgdG8sIGZpbHRlcikge1xuICAgIGZyb20gPSBjbGlwUG9zKHRoaXMsIGZyb20pOyB0byA9IGNsaXBQb3ModGhpcywgdG8pO1xuICAgIHZhciBmb3VuZCA9IFtdLCBsaW5lTm8kJDEgPSBmcm9tLmxpbmU7XG4gICAgdGhpcy5pdGVyKGZyb20ubGluZSwgdG8ubGluZSArIDEsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICB2YXIgc3BhbnMgPSBsaW5lLm1hcmtlZFNwYW5zO1xuICAgICAgaWYgKHNwYW5zKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgc3BhbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICAgICAgaWYgKCEoc3Bhbi50byAhPSBudWxsICYmIGxpbmVObyQkMSA9PSBmcm9tLmxpbmUgJiYgZnJvbS5jaCA+PSBzcGFuLnRvIHx8XG4gICAgICAgICAgICAgIHNwYW4uZnJvbSA9PSBudWxsICYmIGxpbmVObyQkMSAhPSBmcm9tLmxpbmUgfHxcbiAgICAgICAgICAgICAgc3Bhbi5mcm9tICE9IG51bGwgJiYgbGluZU5vJCQxID09IHRvLmxpbmUgJiYgc3Bhbi5mcm9tID49IHRvLmNoKSAmJlxuICAgICAgICAgICAgKCFmaWx0ZXIgfHwgZmlsdGVyKHNwYW4ubWFya2VyKSkpXG4gICAgICAgICAgeyBmb3VuZC5wdXNoKHNwYW4ubWFya2VyLnBhcmVudCB8fCBzcGFuLm1hcmtlcik7IH1cbiAgICAgIH0gfVxuICAgICAgKytsaW5lTm8kJDE7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZvdW5kXG4gIH0sXG4gIGdldEFsbE1hcmtzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFya2VycyA9IFtdO1xuICAgIHRoaXMuaXRlcihmdW5jdGlvbiAobGluZSkge1xuICAgICAgdmFyIHNwcyA9IGxpbmUubWFya2VkU3BhbnM7XG4gICAgICBpZiAoc3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgc3BzLmxlbmd0aDsgKytpKVxuICAgICAgICB7IGlmIChzcHNbaV0uZnJvbSAhPSBudWxsKSB7IG1hcmtlcnMucHVzaChzcHNbaV0ubWFya2VyKTsgfSB9IH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWFya2Vyc1xuICB9LFxuXG4gIHBvc0Zyb21JbmRleDogZnVuY3Rpb24ob2ZmKSB7XG4gICAgdmFyIGNoLCBsaW5lTm8kJDEgPSB0aGlzLmZpcnN0LCBzZXBTaXplID0gdGhpcy5saW5lU2VwYXJhdG9yKCkubGVuZ3RoO1xuICAgIHRoaXMuaXRlcihmdW5jdGlvbiAobGluZSkge1xuICAgICAgdmFyIHN6ID0gbGluZS50ZXh0Lmxlbmd0aCArIHNlcFNpemU7XG4gICAgICBpZiAoc3ogPiBvZmYpIHsgY2ggPSBvZmY7IHJldHVybiB0cnVlIH1cbiAgICAgIG9mZiAtPSBzejtcbiAgICAgICsrbGluZU5vJCQxO1xuICAgIH0pO1xuICAgIHJldHVybiBjbGlwUG9zKHRoaXMsIFBvcyhsaW5lTm8kJDEsIGNoKSlcbiAgfSxcbiAgaW5kZXhGcm9tUG9zOiBmdW5jdGlvbiAoY29vcmRzKSB7XG4gICAgY29vcmRzID0gY2xpcFBvcyh0aGlzLCBjb29yZHMpO1xuICAgIHZhciBpbmRleCA9IGNvb3Jkcy5jaDtcbiAgICBpZiAoY29vcmRzLmxpbmUgPCB0aGlzLmZpcnN0IHx8IGNvb3Jkcy5jaCA8IDApIHsgcmV0dXJuIDAgfVxuICAgIHZhciBzZXBTaXplID0gdGhpcy5saW5lU2VwYXJhdG9yKCkubGVuZ3RoO1xuICAgIHRoaXMuaXRlcih0aGlzLmZpcnN0LCBjb29yZHMubGluZSwgZnVuY3Rpb24gKGxpbmUpIHsgLy8gaXRlciBhYm9ydHMgd2hlbiBjYWxsYmFjayByZXR1cm5zIGEgdHJ1dGh5IHZhbHVlXG4gICAgICBpbmRleCArPSBsaW5lLnRleHQubGVuZ3RoICsgc2VwU2l6ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gaW5kZXhcbiAgfSxcblxuICBjb3B5OiBmdW5jdGlvbihjb3B5SGlzdG9yeSkge1xuICAgIHZhciBkb2MgPSBuZXcgRG9jKGdldExpbmVzKHRoaXMsIHRoaXMuZmlyc3QsIHRoaXMuZmlyc3QgKyB0aGlzLnNpemUpLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZU9wdGlvbiwgdGhpcy5maXJzdCwgdGhpcy5saW5lU2VwLCB0aGlzLmRpcmVjdGlvbik7XG4gICAgZG9jLnNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsVG9wOyBkb2Muc2Nyb2xsTGVmdCA9IHRoaXMuc2Nyb2xsTGVmdDtcbiAgICBkb2Muc2VsID0gdGhpcy5zZWw7XG4gICAgZG9jLmV4dGVuZCA9IGZhbHNlO1xuICAgIGlmIChjb3B5SGlzdG9yeSkge1xuICAgICAgZG9jLmhpc3RvcnkudW5kb0RlcHRoID0gdGhpcy5oaXN0b3J5LnVuZG9EZXB0aDtcbiAgICAgIGRvYy5zZXRIaXN0b3J5KHRoaXMuZ2V0SGlzdG9yeSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvY1xuICB9LFxuXG4gIGxpbmtlZERvYzogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykgeyBvcHRpb25zID0ge307IH1cbiAgICB2YXIgZnJvbSA9IHRoaXMuZmlyc3QsIHRvID0gdGhpcy5maXJzdCArIHRoaXMuc2l6ZTtcbiAgICBpZiAob3B0aW9ucy5mcm9tICE9IG51bGwgJiYgb3B0aW9ucy5mcm9tID4gZnJvbSkgeyBmcm9tID0gb3B0aW9ucy5mcm9tOyB9XG4gICAgaWYgKG9wdGlvbnMudG8gIT0gbnVsbCAmJiBvcHRpb25zLnRvIDwgdG8pIHsgdG8gPSBvcHRpb25zLnRvOyB9XG4gICAgdmFyIGNvcHkgPSBuZXcgRG9jKGdldExpbmVzKHRoaXMsIGZyb20sIHRvKSwgb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZU9wdGlvbiwgZnJvbSwgdGhpcy5saW5lU2VwLCB0aGlzLmRpcmVjdGlvbik7XG4gICAgaWYgKG9wdGlvbnMuc2hhcmVkSGlzdCkgeyBjb3B5Lmhpc3RvcnkgPSB0aGlzLmhpc3RvcnlcbiAgICA7IH0odGhpcy5saW5rZWQgfHwgKHRoaXMubGlua2VkID0gW10pKS5wdXNoKHtkb2M6IGNvcHksIHNoYXJlZEhpc3Q6IG9wdGlvbnMuc2hhcmVkSGlzdH0pO1xuICAgIGNvcHkubGlua2VkID0gW3tkb2M6IHRoaXMsIGlzUGFyZW50OiB0cnVlLCBzaGFyZWRIaXN0OiBvcHRpb25zLnNoYXJlZEhpc3R9XTtcbiAgICBjb3B5U2hhcmVkTWFya2Vycyhjb3B5LCBmaW5kU2hhcmVkTWFya2Vycyh0aGlzKSk7XG4gICAgcmV0dXJuIGNvcHlcbiAgfSxcbiAgdW5saW5rRG9jOiBmdW5jdGlvbihvdGhlcikge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgaWYgKG90aGVyIGluc3RhbmNlb2YgQ29kZU1pcnJvciQxKSB7IG90aGVyID0gb3RoZXIuZG9jOyB9XG4gICAgaWYgKHRoaXMubGlua2VkKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saW5rZWQubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBsaW5rID0gdGhpcyQxLmxpbmtlZFtpXTtcbiAgICAgIGlmIChsaW5rLmRvYyAhPSBvdGhlcikgeyBjb250aW51ZSB9XG4gICAgICB0aGlzJDEubGlua2VkLnNwbGljZShpLCAxKTtcbiAgICAgIG90aGVyLnVubGlua0RvYyh0aGlzJDEpO1xuICAgICAgZGV0YWNoU2hhcmVkTWFya2VycyhmaW5kU2hhcmVkTWFya2Vycyh0aGlzJDEpKTtcbiAgICAgIGJyZWFrXG4gICAgfSB9XG4gICAgLy8gSWYgdGhlIGhpc3RvcmllcyB3ZXJlIHNoYXJlZCwgc3BsaXQgdGhlbSBhZ2FpblxuICAgIGlmIChvdGhlci5oaXN0b3J5ID09IHRoaXMuaGlzdG9yeSkge1xuICAgICAgdmFyIHNwbGl0SWRzID0gW290aGVyLmlkXTtcbiAgICAgIGxpbmtlZERvY3Mob3RoZXIsIGZ1bmN0aW9uIChkb2MpIHsgcmV0dXJuIHNwbGl0SWRzLnB1c2goZG9jLmlkKTsgfSwgdHJ1ZSk7XG4gICAgICBvdGhlci5oaXN0b3J5ID0gbmV3IEhpc3RvcnkobnVsbCk7XG4gICAgICBvdGhlci5oaXN0b3J5LmRvbmUgPSBjb3B5SGlzdG9yeUFycmF5KHRoaXMuaGlzdG9yeS5kb25lLCBzcGxpdElkcyk7XG4gICAgICBvdGhlci5oaXN0b3J5LnVuZG9uZSA9IGNvcHlIaXN0b3J5QXJyYXkodGhpcy5oaXN0b3J5LnVuZG9uZSwgc3BsaXRJZHMpO1xuICAgIH1cbiAgfSxcbiAgaXRlckxpbmtlZERvY3M6IGZ1bmN0aW9uKGYpIHtsaW5rZWREb2NzKHRoaXMsIGYpO30sXG5cbiAgZ2V0TW9kZTogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMubW9kZX0sXG4gIGdldEVkaXRvcjogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuY219LFxuXG4gIHNwbGl0TGluZXM6IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmICh0aGlzLmxpbmVTZXApIHsgcmV0dXJuIHN0ci5zcGxpdCh0aGlzLmxpbmVTZXApIH1cbiAgICByZXR1cm4gc3BsaXRMaW5lc0F1dG8oc3RyKVxuICB9LFxuICBsaW5lU2VwYXJhdG9yOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMubGluZVNlcCB8fCBcIlxcblwiIH0sXG5cbiAgc2V0RGlyZWN0aW9uOiBkb2NNZXRob2RPcChmdW5jdGlvbiAoZGlyKSB7XG4gICAgaWYgKGRpciAhPSBcInJ0bFwiKSB7IGRpciA9IFwibHRyXCI7IH1cbiAgICBpZiAoZGlyID09IHRoaXMuZGlyZWN0aW9uKSB7IHJldHVybiB9XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkaXI7XG4gICAgdGhpcy5pdGVyKGZ1bmN0aW9uIChsaW5lKSB7IHJldHVybiBsaW5lLm9yZGVyID0gbnVsbDsgfSk7XG4gICAgaWYgKHRoaXMuY20pIHsgZGlyZWN0aW9uQ2hhbmdlZCh0aGlzLmNtKTsgfVxuICB9KVxufSk7XG5cbi8vIFB1YmxpYyBhbGlhcy5cbkRvYy5wcm90b3R5cGUuZWFjaExpbmUgPSBEb2MucHJvdG90eXBlLml0ZXI7XG5cbi8vIEtsdWRnZSB0byB3b3JrIGFyb3VuZCBzdHJhbmdlIElFIGJlaGF2aW9yIHdoZXJlIGl0J2xsIHNvbWV0aW1lc1xuLy8gcmUtZmlyZSBhIHNlcmllcyBvZiBkcmFnLXJlbGF0ZWQgZXZlbnRzIHJpZ2h0IGFmdGVyIHRoZSBkcm9wICgjMTU1MSlcbnZhciBsYXN0RHJvcCA9IDA7XG5cbmZ1bmN0aW9uIG9uRHJvcChlKSB7XG4gIHZhciBjbSA9IHRoaXM7XG4gIGNsZWFyRHJhZ0N1cnNvcihjbSk7XG4gIGlmIChzaWduYWxET01FdmVudChjbSwgZSkgfHwgZXZlbnRJbldpZGdldChjbS5kaXNwbGF5LCBlKSlcbiAgICB7IHJldHVybiB9XG4gIGVfcHJldmVudERlZmF1bHQoZSk7XG4gIGlmIChpZSkgeyBsYXN0RHJvcCA9ICtuZXcgRGF0ZTsgfVxuICB2YXIgcG9zID0gcG9zRnJvbU1vdXNlKGNtLCBlLCB0cnVlKSwgZmlsZXMgPSBlLmRhdGFUcmFuc2Zlci5maWxlcztcbiAgaWYgKCFwb3MgfHwgY20uaXNSZWFkT25seSgpKSB7IHJldHVybiB9XG4gIC8vIE1pZ2h0IGJlIGEgZmlsZSBkcm9wLCBpbiB3aGljaCBjYXNlIHdlIHNpbXBseSBleHRyYWN0IHRoZSB0ZXh0XG4gIC8vIGFuZCBpbnNlcnQgaXQuXG4gIGlmIChmaWxlcyAmJiBmaWxlcy5sZW5ndGggJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGUpIHtcbiAgICB2YXIgbiA9IGZpbGVzLmxlbmd0aCwgdGV4dCA9IEFycmF5KG4pLCByZWFkID0gMDtcbiAgICB2YXIgbG9hZEZpbGUgPSBmdW5jdGlvbiAoZmlsZSwgaSkge1xuICAgICAgaWYgKGNtLm9wdGlvbnMuYWxsb3dEcm9wRmlsZVR5cGVzICYmXG4gICAgICAgICAgaW5kZXhPZihjbS5vcHRpb25zLmFsbG93RHJvcEZpbGVUeXBlcywgZmlsZS50eXBlKSA9PSAtMSlcbiAgICAgICAgeyByZXR1cm4gfVxuXG4gICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXI7XG4gICAgICByZWFkZXIub25sb2FkID0gb3BlcmF0aW9uKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb250ZW50ID0gcmVhZGVyLnJlc3VsdDtcbiAgICAgICAgaWYgKC9bXFx4MDAtXFx4MDhcXHgwZS1cXHgxZl17Mn0vLnRlc3QoY29udGVudCkpIHsgY29udGVudCA9IFwiXCI7IH1cbiAgICAgICAgdGV4dFtpXSA9IGNvbnRlbnQ7XG4gICAgICAgIGlmICgrK3JlYWQgPT0gbikge1xuICAgICAgICAgIHBvcyA9IGNsaXBQb3MoY20uZG9jLCBwb3MpO1xuICAgICAgICAgIHZhciBjaGFuZ2UgPSB7ZnJvbTogcG9zLCB0bzogcG9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogY20uZG9jLnNwbGl0TGluZXModGV4dC5qb2luKGNtLmRvYy5saW5lU2VwYXJhdG9yKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbjogXCJwYXN0ZVwifTtcbiAgICAgICAgICBtYWtlQ2hhbmdlKGNtLmRvYywgY2hhbmdlKTtcbiAgICAgICAgICBzZXRTZWxlY3Rpb25SZXBsYWNlSGlzdG9yeShjbS5kb2MsIHNpbXBsZVNlbGVjdGlvbihwb3MsIGNoYW5nZUVuZChjaGFuZ2UpKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XG4gICAgfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkgeyBsb2FkRmlsZShmaWxlc1tpXSwgaSk7IH1cbiAgfSBlbHNlIHsgLy8gTm9ybWFsIGRyb3BcbiAgICAvLyBEb24ndCBkbyBhIHJlcGxhY2UgaWYgdGhlIGRyb3AgaGFwcGVuZWQgaW5zaWRlIG9mIHRoZSBzZWxlY3RlZCB0ZXh0LlxuICAgIGlmIChjbS5zdGF0ZS5kcmFnZ2luZ1RleHQgJiYgY20uZG9jLnNlbC5jb250YWlucyhwb3MpID4gLTEpIHtcbiAgICAgIGNtLnN0YXRlLmRyYWdnaW5nVGV4dChlKTtcbiAgICAgIC8vIEVuc3VyZSB0aGUgZWRpdG9yIGlzIHJlLWZvY3VzZWRcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZXR1cm4gY20uZGlzcGxheS5pbnB1dC5mb2N1cygpOyB9LCAyMCk7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0ZXh0JDEgPSBlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwiVGV4dFwiKTtcbiAgICAgIGlmICh0ZXh0JDEpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkO1xuICAgICAgICBpZiAoY20uc3RhdGUuZHJhZ2dpbmdUZXh0ICYmICFjbS5zdGF0ZS5kcmFnZ2luZ1RleHQuY29weSlcbiAgICAgICAgICB7IHNlbGVjdGVkID0gY20ubGlzdFNlbGVjdGlvbnMoKTsgfVxuICAgICAgICBzZXRTZWxlY3Rpb25Ob1VuZG8oY20uZG9jLCBzaW1wbGVTZWxlY3Rpb24ocG9zLCBwb3MpKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkKSB7IGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHNlbGVjdGVkLmxlbmd0aDsgKytpJDEpXG4gICAgICAgICAgeyByZXBsYWNlUmFuZ2UoY20uZG9jLCBcIlwiLCBzZWxlY3RlZFtpJDFdLmFuY2hvciwgc2VsZWN0ZWRbaSQxXS5oZWFkLCBcImRyYWdcIik7IH0gfVxuICAgICAgICBjbS5yZXBsYWNlU2VsZWN0aW9uKHRleHQkMSwgXCJhcm91bmRcIiwgXCJwYXN0ZVwiKTtcbiAgICAgICAgY20uZGlzcGxheS5pbnB1dC5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaChlKXt9XG4gIH1cbn1cblxuZnVuY3Rpb24gb25EcmFnU3RhcnQoY20sIGUpIHtcbiAgaWYgKGllICYmICghY20uc3RhdGUuZHJhZ2dpbmdUZXh0IHx8ICtuZXcgRGF0ZSAtIGxhc3REcm9wIDwgMTAwKSkgeyBlX3N0b3AoZSk7IHJldHVybiB9XG4gIGlmIChzaWduYWxET01FdmVudChjbSwgZSkgfHwgZXZlbnRJbldpZGdldChjbS5kaXNwbGF5LCBlKSkgeyByZXR1cm4gfVxuXG4gIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJUZXh0XCIsIGNtLmdldFNlbGVjdGlvbigpKTtcbiAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwiY29weU1vdmVcIjtcblxuICAvLyBVc2UgZHVtbXkgaW1hZ2UgaW5zdGVhZCBvZiBkZWZhdWx0IGJyb3dzZXJzIGltYWdlLlxuICAvLyBSZWNlbnQgU2FmYXJpICh+Ni4wLjIpIGhhdmUgYSB0ZW5kZW5jeSB0byBzZWdmYXVsdCB3aGVuIHRoaXMgaGFwcGVucywgc28gd2UgZG9uJ3QgZG8gaXQgdGhlcmUuXG4gIGlmIChlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UgJiYgIXNhZmFyaSkge1xuICAgIHZhciBpbWcgPSBlbHQoXCJpbWdcIiwgbnVsbCwgbnVsbCwgXCJwb3NpdGlvbjogZml4ZWQ7IGxlZnQ6IDA7IHRvcDogMDtcIik7XG4gICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFBQUFBQ0g1QkFFS0FBRUFMQUFBQUFBQkFBRUFBQUlDVEFFQU93PT1cIjtcbiAgICBpZiAocHJlc3RvKSB7XG4gICAgICBpbWcud2lkdGggPSBpbWcuaGVpZ2h0ID0gMTtcbiAgICAgIGNtLmRpc3BsYXkud3JhcHBlci5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgLy8gRm9yY2UgYSByZWxheW91dCwgb3IgT3BlcmEgd29uJ3QgdXNlIG91ciBpbWFnZSBmb3Igc29tZSBvYnNjdXJlIHJlYXNvblxuICAgICAgaW1nLl90b3AgPSBpbWcub2Zmc2V0VG9wO1xuICAgIH1cbiAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoaW1nLCAwLCAwKTtcbiAgICBpZiAocHJlc3RvKSB7IGltZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGltZyk7IH1cbiAgfVxufVxuXG5mdW5jdGlvbiBvbkRyYWdPdmVyKGNtLCBlKSB7XG4gIHZhciBwb3MgPSBwb3NGcm9tTW91c2UoY20sIGUpO1xuICBpZiAoIXBvcykgeyByZXR1cm4gfVxuICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgZHJhd1NlbGVjdGlvbkN1cnNvcihjbSwgcG9zLCBmcmFnKTtcbiAgaWYgKCFjbS5kaXNwbGF5LmRyYWdDdXJzb3IpIHtcbiAgICBjbS5kaXNwbGF5LmRyYWdDdXJzb3IgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLWN1cnNvcnMgQ29kZU1pcnJvci1kcmFnY3Vyc29yc1wiKTtcbiAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5pbnNlcnRCZWZvcmUoY20uZGlzcGxheS5kcmFnQ3Vyc29yLCBjbS5kaXNwbGF5LmN1cnNvckRpdik7XG4gIH1cbiAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoY20uZGlzcGxheS5kcmFnQ3Vyc29yLCBmcmFnKTtcbn1cblxuZnVuY3Rpb24gY2xlYXJEcmFnQ3Vyc29yKGNtKSB7XG4gIGlmIChjbS5kaXNwbGF5LmRyYWdDdXJzb3IpIHtcbiAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5yZW1vdmVDaGlsZChjbS5kaXNwbGF5LmRyYWdDdXJzb3IpO1xuICAgIGNtLmRpc3BsYXkuZHJhZ0N1cnNvciA9IG51bGw7XG4gIH1cbn1cblxuLy8gVGhlc2UgbXVzdCBiZSBoYW5kbGVkIGNhcmVmdWxseSwgYmVjYXVzZSBuYWl2ZWx5IHJlZ2lzdGVyaW5nIGFcbi8vIGhhbmRsZXIgZm9yIGVhY2ggZWRpdG9yIHdpbGwgY2F1c2UgdGhlIGVkaXRvcnMgdG8gbmV2ZXIgYmVcbi8vIGdhcmJhZ2UgY29sbGVjdGVkLlxuXG5mdW5jdGlvbiBmb3JFYWNoQ29kZU1pcnJvcihmKSB7XG4gIGlmICghZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKSB7IHJldHVybiB9XG4gIHZhciBieUNsYXNzID0gZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiQ29kZU1pcnJvclwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieUNsYXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNtID0gYnlDbGFzc1tpXS5Db2RlTWlycm9yO1xuICAgIGlmIChjbSkgeyBmKGNtKTsgfVxuICB9XG59XG5cbnZhciBnbG9iYWxzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuZnVuY3Rpb24gZW5zdXJlR2xvYmFsSGFuZGxlcnMoKSB7XG4gIGlmIChnbG9iYWxzUmVnaXN0ZXJlZCkgeyByZXR1cm4gfVxuICByZWdpc3Rlckdsb2JhbEhhbmRsZXJzKCk7XG4gIGdsb2JhbHNSZWdpc3RlcmVkID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIHJlZ2lzdGVyR2xvYmFsSGFuZGxlcnMoKSB7XG4gIC8vIFdoZW4gdGhlIHdpbmRvdyByZXNpemVzLCB3ZSBuZWVkIHRvIHJlZnJlc2ggYWN0aXZlIGVkaXRvcnMuXG4gIHZhciByZXNpemVUaW1lcjtcbiAgb24od2luZG93LCBcInJlc2l6ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHJlc2l6ZVRpbWVyID09IG51bGwpIHsgcmVzaXplVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlc2l6ZVRpbWVyID0gbnVsbDtcbiAgICAgIGZvckVhY2hDb2RlTWlycm9yKG9uUmVzaXplKTtcbiAgICB9LCAxMDApOyB9XG4gIH0pO1xuICAvLyBXaGVuIHRoZSB3aW5kb3cgbG9zZXMgZm9jdXMsIHdlIHdhbnQgdG8gc2hvdyB0aGUgZWRpdG9yIGFzIGJsdXJyZWRcbiAgb24od2luZG93LCBcImJsdXJcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gZm9yRWFjaENvZGVNaXJyb3Iob25CbHVyKTsgfSk7XG59XG4vLyBDYWxsZWQgd2hlbiB0aGUgd2luZG93IHJlc2l6ZXNcbmZ1bmN0aW9uIG9uUmVzaXplKGNtKSB7XG4gIHZhciBkID0gY20uZGlzcGxheTtcbiAgaWYgKGQubGFzdFdyYXBIZWlnaHQgPT0gZC53cmFwcGVyLmNsaWVudEhlaWdodCAmJiBkLmxhc3RXcmFwV2lkdGggPT0gZC53cmFwcGVyLmNsaWVudFdpZHRoKVxuICAgIHsgcmV0dXJuIH1cbiAgLy8gTWlnaHQgYmUgYSB0ZXh0IHNjYWxpbmcgb3BlcmF0aW9uLCBjbGVhciBzaXplIGNhY2hlcy5cbiAgZC5jYWNoZWRDaGFyV2lkdGggPSBkLmNhY2hlZFRleHRIZWlnaHQgPSBkLmNhY2hlZFBhZGRpbmdIID0gbnVsbDtcbiAgZC5zY3JvbGxiYXJzQ2xpcHBlZCA9IGZhbHNlO1xuICBjbS5zZXRTaXplKCk7XG59XG5cbnZhciBrZXlOYW1lcyA9IHtcbiAgMzogXCJFbnRlclwiLCA4OiBcIkJhY2tzcGFjZVwiLCA5OiBcIlRhYlwiLCAxMzogXCJFbnRlclwiLCAxNjogXCJTaGlmdFwiLCAxNzogXCJDdHJsXCIsIDE4OiBcIkFsdFwiLFxuICAxOTogXCJQYXVzZVwiLCAyMDogXCJDYXBzTG9ja1wiLCAyNzogXCJFc2NcIiwgMzI6IFwiU3BhY2VcIiwgMzM6IFwiUGFnZVVwXCIsIDM0OiBcIlBhZ2VEb3duXCIsIDM1OiBcIkVuZFwiLFxuICAzNjogXCJIb21lXCIsIDM3OiBcIkxlZnRcIiwgMzg6IFwiVXBcIiwgMzk6IFwiUmlnaHRcIiwgNDA6IFwiRG93blwiLCA0NDogXCJQcmludFNjcm5cIiwgNDU6IFwiSW5zZXJ0XCIsXG4gIDQ2OiBcIkRlbGV0ZVwiLCA1OTogXCI7XCIsIDYxOiBcIj1cIiwgOTE6IFwiTW9kXCIsIDkyOiBcIk1vZFwiLCA5MzogXCJNb2RcIixcbiAgMTA2OiBcIipcIiwgMTA3OiBcIj1cIiwgMTA5OiBcIi1cIiwgMTEwOiBcIi5cIiwgMTExOiBcIi9cIiwgMTI3OiBcIkRlbGV0ZVwiLFxuICAxNzM6IFwiLVwiLCAxODY6IFwiO1wiLCAxODc6IFwiPVwiLCAxODg6IFwiLFwiLCAxODk6IFwiLVwiLCAxOTA6IFwiLlwiLCAxOTE6IFwiL1wiLCAxOTI6IFwiYFwiLCAyMTk6IFwiW1wiLCAyMjA6IFwiXFxcXFwiLFxuICAyMjE6IFwiXVwiLCAyMjI6IFwiJ1wiLCA2MzIzMjogXCJVcFwiLCA2MzIzMzogXCJEb3duXCIsIDYzMjM0OiBcIkxlZnRcIiwgNjMyMzU6IFwiUmlnaHRcIiwgNjMyNzI6IFwiRGVsZXRlXCIsXG4gIDYzMjczOiBcIkhvbWVcIiwgNjMyNzU6IFwiRW5kXCIsIDYzMjc2OiBcIlBhZ2VVcFwiLCA2MzI3NzogXCJQYWdlRG93blwiLCA2MzMwMjogXCJJbnNlcnRcIlxufTtcblxuLy8gTnVtYmVyIGtleXNcbmZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykgeyBrZXlOYW1lc1tpICsgNDhdID0ga2V5TmFtZXNbaSArIDk2XSA9IFN0cmluZyhpKTsgfVxuLy8gQWxwaGFiZXRpYyBrZXlzXG5mb3IgKHZhciBpJDEgPSA2NTsgaSQxIDw9IDkwOyBpJDErKykgeyBrZXlOYW1lc1tpJDFdID0gU3RyaW5nLmZyb21DaGFyQ29kZShpJDEpOyB9XG4vLyBGdW5jdGlvbiBrZXlzXG5mb3IgKHZhciBpJDIgPSAxOyBpJDIgPD0gMTI7IGkkMisrKSB7IGtleU5hbWVzW2kkMiArIDExMV0gPSBrZXlOYW1lc1tpJDIgKyA2MzIzNV0gPSBcIkZcIiArIGkkMjsgfVxuXG52YXIga2V5TWFwID0ge307XG5cbmtleU1hcC5iYXNpYyA9IHtcbiAgXCJMZWZ0XCI6IFwiZ29DaGFyTGVmdFwiLCBcIlJpZ2h0XCI6IFwiZ29DaGFyUmlnaHRcIiwgXCJVcFwiOiBcImdvTGluZVVwXCIsIFwiRG93blwiOiBcImdvTGluZURvd25cIixcbiAgXCJFbmRcIjogXCJnb0xpbmVFbmRcIiwgXCJIb21lXCI6IFwiZ29MaW5lU3RhcnRTbWFydFwiLCBcIlBhZ2VVcFwiOiBcImdvUGFnZVVwXCIsIFwiUGFnZURvd25cIjogXCJnb1BhZ2VEb3duXCIsXG4gIFwiRGVsZXRlXCI6IFwiZGVsQ2hhckFmdGVyXCIsIFwiQmFja3NwYWNlXCI6IFwiZGVsQ2hhckJlZm9yZVwiLCBcIlNoaWZ0LUJhY2tzcGFjZVwiOiBcImRlbENoYXJCZWZvcmVcIixcbiAgXCJUYWJcIjogXCJkZWZhdWx0VGFiXCIsIFwiU2hpZnQtVGFiXCI6IFwiaW5kZW50QXV0b1wiLFxuICBcIkVudGVyXCI6IFwibmV3bGluZUFuZEluZGVudFwiLCBcIkluc2VydFwiOiBcInRvZ2dsZU92ZXJ3cml0ZVwiLFxuICBcIkVzY1wiOiBcInNpbmdsZVNlbGVjdGlvblwiXG59O1xuLy8gTm90ZSB0aGF0IHRoZSBzYXZlIGFuZCBmaW5kLXJlbGF0ZWQgY29tbWFuZHMgYXJlbid0IGRlZmluZWQgYnlcbi8vIGRlZmF1bHQuIFVzZXIgY29kZSBvciBhZGRvbnMgY2FuIGRlZmluZSB0aGVtLiBVbmtub3duIGNvbW1hbmRzXG4vLyBhcmUgc2ltcGx5IGlnbm9yZWQuXG5rZXlNYXAucGNEZWZhdWx0ID0ge1xuICBcIkN0cmwtQVwiOiBcInNlbGVjdEFsbFwiLCBcIkN0cmwtRFwiOiBcImRlbGV0ZUxpbmVcIiwgXCJDdHJsLVpcIjogXCJ1bmRvXCIsIFwiU2hpZnQtQ3RybC1aXCI6IFwicmVkb1wiLCBcIkN0cmwtWVwiOiBcInJlZG9cIixcbiAgXCJDdHJsLUhvbWVcIjogXCJnb0RvY1N0YXJ0XCIsIFwiQ3RybC1FbmRcIjogXCJnb0RvY0VuZFwiLCBcIkN0cmwtVXBcIjogXCJnb0xpbmVVcFwiLCBcIkN0cmwtRG93blwiOiBcImdvTGluZURvd25cIixcbiAgXCJDdHJsLUxlZnRcIjogXCJnb0dyb3VwTGVmdFwiLCBcIkN0cmwtUmlnaHRcIjogXCJnb0dyb3VwUmlnaHRcIiwgXCJBbHQtTGVmdFwiOiBcImdvTGluZVN0YXJ0XCIsIFwiQWx0LVJpZ2h0XCI6IFwiZ29MaW5lRW5kXCIsXG4gIFwiQ3RybC1CYWNrc3BhY2VcIjogXCJkZWxHcm91cEJlZm9yZVwiLCBcIkN0cmwtRGVsZXRlXCI6IFwiZGVsR3JvdXBBZnRlclwiLCBcIkN0cmwtU1wiOiBcInNhdmVcIiwgXCJDdHJsLUZcIjogXCJmaW5kXCIsXG4gIFwiQ3RybC1HXCI6IFwiZmluZE5leHRcIiwgXCJTaGlmdC1DdHJsLUdcIjogXCJmaW5kUHJldlwiLCBcIlNoaWZ0LUN0cmwtRlwiOiBcInJlcGxhY2VcIiwgXCJTaGlmdC1DdHJsLVJcIjogXCJyZXBsYWNlQWxsXCIsXG4gIFwiQ3RybC1bXCI6IFwiaW5kZW50TGVzc1wiLCBcIkN0cmwtXVwiOiBcImluZGVudE1vcmVcIixcbiAgXCJDdHJsLVVcIjogXCJ1bmRvU2VsZWN0aW9uXCIsIFwiU2hpZnQtQ3RybC1VXCI6IFwicmVkb1NlbGVjdGlvblwiLCBcIkFsdC1VXCI6IFwicmVkb1NlbGVjdGlvblwiLFxuICBmYWxsdGhyb3VnaDogXCJiYXNpY1wiXG59O1xuLy8gVmVyeSBiYXNpYyByZWFkbGluZS9lbWFjcy1zdHlsZSBiaW5kaW5ncywgd2hpY2ggYXJlIHN0YW5kYXJkIG9uIE1hYy5cbmtleU1hcC5lbWFjc3kgPSB7XG4gIFwiQ3RybC1GXCI6IFwiZ29DaGFyUmlnaHRcIiwgXCJDdHJsLUJcIjogXCJnb0NoYXJMZWZ0XCIsIFwiQ3RybC1QXCI6IFwiZ29MaW5lVXBcIiwgXCJDdHJsLU5cIjogXCJnb0xpbmVEb3duXCIsXG4gIFwiQWx0LUZcIjogXCJnb1dvcmRSaWdodFwiLCBcIkFsdC1CXCI6IFwiZ29Xb3JkTGVmdFwiLCBcIkN0cmwtQVwiOiBcImdvTGluZVN0YXJ0XCIsIFwiQ3RybC1FXCI6IFwiZ29MaW5lRW5kXCIsXG4gIFwiQ3RybC1WXCI6IFwiZ29QYWdlRG93blwiLCBcIlNoaWZ0LUN0cmwtVlwiOiBcImdvUGFnZVVwXCIsIFwiQ3RybC1EXCI6IFwiZGVsQ2hhckFmdGVyXCIsIFwiQ3RybC1IXCI6IFwiZGVsQ2hhckJlZm9yZVwiLFxuICBcIkFsdC1EXCI6IFwiZGVsV29yZEFmdGVyXCIsIFwiQWx0LUJhY2tzcGFjZVwiOiBcImRlbFdvcmRCZWZvcmVcIiwgXCJDdHJsLUtcIjogXCJraWxsTGluZVwiLCBcIkN0cmwtVFwiOiBcInRyYW5zcG9zZUNoYXJzXCIsXG4gIFwiQ3RybC1PXCI6IFwib3BlbkxpbmVcIlxufTtcbmtleU1hcC5tYWNEZWZhdWx0ID0ge1xuICBcIkNtZC1BXCI6IFwic2VsZWN0QWxsXCIsIFwiQ21kLURcIjogXCJkZWxldGVMaW5lXCIsIFwiQ21kLVpcIjogXCJ1bmRvXCIsIFwiU2hpZnQtQ21kLVpcIjogXCJyZWRvXCIsIFwiQ21kLVlcIjogXCJyZWRvXCIsXG4gIFwiQ21kLUhvbWVcIjogXCJnb0RvY1N0YXJ0XCIsIFwiQ21kLVVwXCI6IFwiZ29Eb2NTdGFydFwiLCBcIkNtZC1FbmRcIjogXCJnb0RvY0VuZFwiLCBcIkNtZC1Eb3duXCI6IFwiZ29Eb2NFbmRcIiwgXCJBbHQtTGVmdFwiOiBcImdvR3JvdXBMZWZ0XCIsXG4gIFwiQWx0LVJpZ2h0XCI6IFwiZ29Hcm91cFJpZ2h0XCIsIFwiQ21kLUxlZnRcIjogXCJnb0xpbmVMZWZ0XCIsIFwiQ21kLVJpZ2h0XCI6IFwiZ29MaW5lUmlnaHRcIiwgXCJBbHQtQmFja3NwYWNlXCI6IFwiZGVsR3JvdXBCZWZvcmVcIixcbiAgXCJDdHJsLUFsdC1CYWNrc3BhY2VcIjogXCJkZWxHcm91cEFmdGVyXCIsIFwiQWx0LURlbGV0ZVwiOiBcImRlbEdyb3VwQWZ0ZXJcIiwgXCJDbWQtU1wiOiBcInNhdmVcIiwgXCJDbWQtRlwiOiBcImZpbmRcIixcbiAgXCJDbWQtR1wiOiBcImZpbmROZXh0XCIsIFwiU2hpZnQtQ21kLUdcIjogXCJmaW5kUHJldlwiLCBcIkNtZC1BbHQtRlwiOiBcInJlcGxhY2VcIiwgXCJTaGlmdC1DbWQtQWx0LUZcIjogXCJyZXBsYWNlQWxsXCIsXG4gIFwiQ21kLVtcIjogXCJpbmRlbnRMZXNzXCIsIFwiQ21kLV1cIjogXCJpbmRlbnRNb3JlXCIsIFwiQ21kLUJhY2tzcGFjZVwiOiBcImRlbFdyYXBwZWRMaW5lTGVmdFwiLCBcIkNtZC1EZWxldGVcIjogXCJkZWxXcmFwcGVkTGluZVJpZ2h0XCIsXG4gIFwiQ21kLVVcIjogXCJ1bmRvU2VsZWN0aW9uXCIsIFwiU2hpZnQtQ21kLVVcIjogXCJyZWRvU2VsZWN0aW9uXCIsIFwiQ3RybC1VcFwiOiBcImdvRG9jU3RhcnRcIiwgXCJDdHJsLURvd25cIjogXCJnb0RvY0VuZFwiLFxuICBmYWxsdGhyb3VnaDogW1wiYmFzaWNcIiwgXCJlbWFjc3lcIl1cbn07XG5rZXlNYXBbXCJkZWZhdWx0XCJdID0gbWFjID8ga2V5TWFwLm1hY0RlZmF1bHQgOiBrZXlNYXAucGNEZWZhdWx0O1xuXG4vLyBLRVlNQVAgRElTUEFUQ0hcblxuZnVuY3Rpb24gbm9ybWFsaXplS2V5TmFtZShuYW1lKSB7XG4gIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoLy0oPyEkKS8pO1xuICBuYW1lID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gIHZhciBhbHQsIGN0cmwsIHNoaWZ0LCBjbWQ7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgdmFyIG1vZCA9IHBhcnRzW2ldO1xuICAgIGlmICgvXihjbWR8bWV0YXxtKSQvaS50ZXN0KG1vZCkpIHsgY21kID0gdHJ1ZTsgfVxuICAgIGVsc2UgaWYgKC9eYShsdCk/JC9pLnRlc3QobW9kKSkgeyBhbHQgPSB0cnVlOyB9XG4gICAgZWxzZSBpZiAoL14oY3xjdHJsfGNvbnRyb2wpJC9pLnRlc3QobW9kKSkgeyBjdHJsID0gdHJ1ZTsgfVxuICAgIGVsc2UgaWYgKC9ecyhoaWZ0KT8kL2kudGVzdChtb2QpKSB7IHNoaWZ0ID0gdHJ1ZTsgfVxuICAgIGVsc2UgeyB0aHJvdyBuZXcgRXJyb3IoXCJVbnJlY29nbml6ZWQgbW9kaWZpZXIgbmFtZTogXCIgKyBtb2QpIH1cbiAgfVxuICBpZiAoYWx0KSB7IG5hbWUgPSBcIkFsdC1cIiArIG5hbWU7IH1cbiAgaWYgKGN0cmwpIHsgbmFtZSA9IFwiQ3RybC1cIiArIG5hbWU7IH1cbiAgaWYgKGNtZCkgeyBuYW1lID0gXCJDbWQtXCIgKyBuYW1lOyB9XG4gIGlmIChzaGlmdCkgeyBuYW1lID0gXCJTaGlmdC1cIiArIG5hbWU7IH1cbiAgcmV0dXJuIG5hbWVcbn1cblxuLy8gVGhpcyBpcyBhIGtsdWRnZSB0byBrZWVwIGtleW1hcHMgbW9zdGx5IHdvcmtpbmcgYXMgcmF3IG9iamVjdHNcbi8vIChiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSkgd2hpbGUgYXQgdGhlIHNhbWUgdGltZSBzdXBwb3J0IGZlYXR1cmVzXG4vLyBsaWtlIG5vcm1hbGl6YXRpb24gYW5kIG11bHRpLXN0cm9rZSBrZXkgYmluZGluZ3MuIEl0IGNvbXBpbGVzIGFcbi8vIG5ldyBub3JtYWxpemVkIGtleW1hcCwgYW5kIHRoZW4gdXBkYXRlcyB0aGUgb2xkIG9iamVjdCB0byByZWZsZWN0XG4vLyB0aGlzLlxuZnVuY3Rpb24gbm9ybWFsaXplS2V5TWFwKGtleW1hcCkge1xuICB2YXIgY29weSA9IHt9O1xuICBmb3IgKHZhciBrZXluYW1lIGluIGtleW1hcCkgeyBpZiAoa2V5bWFwLmhhc093blByb3BlcnR5KGtleW5hbWUpKSB7XG4gICAgdmFyIHZhbHVlID0ga2V5bWFwW2tleW5hbWVdO1xuICAgIGlmICgvXihuYW1lfGZhbGx0aHJvdWdofChkZXxhdCl0YWNoKSQvLnRlc3Qoa2V5bmFtZSkpIHsgY29udGludWUgfVxuICAgIGlmICh2YWx1ZSA9PSBcIi4uLlwiKSB7IGRlbGV0ZSBrZXltYXBba2V5bmFtZV07IGNvbnRpbnVlIH1cblxuICAgIHZhciBrZXlzID0gbWFwKGtleW5hbWUuc3BsaXQoXCIgXCIpLCBub3JtYWxpemVLZXlOYW1lKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWwgPSAodm9pZCAwKSwgbmFtZSA9ICh2b2lkIDApO1xuICAgICAgaWYgKGkgPT0ga2V5cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIG5hbWUgPSBrZXlzLmpvaW4oXCIgXCIpO1xuICAgICAgICB2YWwgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5hbWUgPSBrZXlzLnNsaWNlKDAsIGkgKyAxKS5qb2luKFwiIFwiKTtcbiAgICAgICAgdmFsID0gXCIuLi5cIjtcbiAgICAgIH1cbiAgICAgIHZhciBwcmV2ID0gY29weVtuYW1lXTtcbiAgICAgIGlmICghcHJldikgeyBjb3B5W25hbWVdID0gdmFsOyB9XG4gICAgICBlbHNlIGlmIChwcmV2ICE9IHZhbCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJJbmNvbnNpc3RlbnQgYmluZGluZ3MgZm9yIFwiICsgbmFtZSkgfVxuICAgIH1cbiAgICBkZWxldGUga2V5bWFwW2tleW5hbWVdO1xuICB9IH1cbiAgZm9yICh2YXIgcHJvcCBpbiBjb3B5KSB7IGtleW1hcFtwcm9wXSA9IGNvcHlbcHJvcF07IH1cbiAgcmV0dXJuIGtleW1hcFxufVxuXG5mdW5jdGlvbiBsb29rdXBLZXkoa2V5LCBtYXAkJDEsIGhhbmRsZSwgY29udGV4dCkge1xuICBtYXAkJDEgPSBnZXRLZXlNYXAobWFwJCQxKTtcbiAgdmFyIGZvdW5kID0gbWFwJCQxLmNhbGwgPyBtYXAkJDEuY2FsbChrZXksIGNvbnRleHQpIDogbWFwJCQxW2tleV07XG4gIGlmIChmb3VuZCA9PT0gZmFsc2UpIHsgcmV0dXJuIFwibm90aGluZ1wiIH1cbiAgaWYgKGZvdW5kID09PSBcIi4uLlwiKSB7IHJldHVybiBcIm11bHRpXCIgfVxuICBpZiAoZm91bmQgIT0gbnVsbCAmJiBoYW5kbGUoZm91bmQpKSB7IHJldHVybiBcImhhbmRsZWRcIiB9XG5cbiAgaWYgKG1hcCQkMS5mYWxsdGhyb3VnaCkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobWFwJCQxLmZhbGx0aHJvdWdoKSAhPSBcIltvYmplY3QgQXJyYXldXCIpXG4gICAgICB7IHJldHVybiBsb29rdXBLZXkoa2V5LCBtYXAkJDEuZmFsbHRocm91Z2gsIGhhbmRsZSwgY29udGV4dCkgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFwJCQxLmZhbGx0aHJvdWdoLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gbG9va3VwS2V5KGtleSwgbWFwJCQxLmZhbGx0aHJvdWdoW2ldLCBoYW5kbGUsIGNvbnRleHQpO1xuICAgICAgaWYgKHJlc3VsdCkgeyByZXR1cm4gcmVzdWx0IH1cbiAgICB9XG4gIH1cbn1cblxuLy8gTW9kaWZpZXIga2V5IHByZXNzZXMgZG9uJ3QgY291bnQgYXMgJ3JlYWwnIGtleSBwcmVzc2VzIGZvciB0aGVcbi8vIHB1cnBvc2Ugb2Yga2V5bWFwIGZhbGx0aHJvdWdoLlxuZnVuY3Rpb24gaXNNb2RpZmllcktleSh2YWx1ZSkge1xuICB2YXIgbmFtZSA9IHR5cGVvZiB2YWx1ZSA9PSBcInN0cmluZ1wiID8gdmFsdWUgOiBrZXlOYW1lc1t2YWx1ZS5rZXlDb2RlXTtcbiAgcmV0dXJuIG5hbWUgPT0gXCJDdHJsXCIgfHwgbmFtZSA9PSBcIkFsdFwiIHx8IG5hbWUgPT0gXCJTaGlmdFwiIHx8IG5hbWUgPT0gXCJNb2RcIlxufVxuXG4vLyBMb29rIHVwIHRoZSBuYW1lIG9mIGEga2V5IGFzIGluZGljYXRlZCBieSBhbiBldmVudCBvYmplY3QuXG5mdW5jdGlvbiBrZXlOYW1lKGV2ZW50LCBub1NoaWZ0KSB7XG4gIGlmIChwcmVzdG8gJiYgZXZlbnQua2V5Q29kZSA9PSAzNCAmJiBldmVudFtcImNoYXJcIl0pIHsgcmV0dXJuIGZhbHNlIH1cbiAgdmFyIGJhc2UgPSBrZXlOYW1lc1tldmVudC5rZXlDb2RlXSwgbmFtZSA9IGJhc2U7XG4gIGlmIChuYW1lID09IG51bGwgfHwgZXZlbnQuYWx0R3JhcGhLZXkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgaWYgKGV2ZW50LmFsdEtleSAmJiBiYXNlICE9IFwiQWx0XCIpIHsgbmFtZSA9IFwiQWx0LVwiICsgbmFtZTsgfVxuICBpZiAoKGZsaXBDdHJsQ21kID8gZXZlbnQubWV0YUtleSA6IGV2ZW50LmN0cmxLZXkpICYmIGJhc2UgIT0gXCJDdHJsXCIpIHsgbmFtZSA9IFwiQ3RybC1cIiArIG5hbWU7IH1cbiAgaWYgKChmbGlwQ3RybENtZCA/IGV2ZW50LmN0cmxLZXkgOiBldmVudC5tZXRhS2V5KSAmJiBiYXNlICE9IFwiQ21kXCIpIHsgbmFtZSA9IFwiQ21kLVwiICsgbmFtZTsgfVxuICBpZiAoIW5vU2hpZnQgJiYgZXZlbnQuc2hpZnRLZXkgJiYgYmFzZSAhPSBcIlNoaWZ0XCIpIHsgbmFtZSA9IFwiU2hpZnQtXCIgKyBuYW1lOyB9XG4gIHJldHVybiBuYW1lXG59XG5cbmZ1bmN0aW9uIGdldEtleU1hcCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT0gXCJzdHJpbmdcIiA/IGtleU1hcFt2YWxdIDogdmFsXG59XG5cbi8vIEhlbHBlciBmb3IgZGVsZXRpbmcgdGV4dCBuZWFyIHRoZSBzZWxlY3Rpb24ocyksIHVzZWQgdG8gaW1wbGVtZW50XG4vLyBiYWNrc3BhY2UsIGRlbGV0ZSwgYW5kIHNpbWlsYXIgZnVuY3Rpb25hbGl0eS5cbmZ1bmN0aW9uIGRlbGV0ZU5lYXJTZWxlY3Rpb24oY20sIGNvbXB1dGUpIHtcbiAgdmFyIHJhbmdlcyA9IGNtLmRvYy5zZWwucmFuZ2VzLCBraWxsID0gW107XG4gIC8vIEJ1aWxkIHVwIGEgc2V0IG9mIHJhbmdlcyB0byBraWxsIGZpcnN0LCBtZXJnaW5nIG92ZXJsYXBwaW5nXG4gIC8vIHJhbmdlcy5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdG9LaWxsID0gY29tcHV0ZShyYW5nZXNbaV0pO1xuICAgIHdoaWxlIChraWxsLmxlbmd0aCAmJiBjbXAodG9LaWxsLmZyb20sIGxzdChraWxsKS50bykgPD0gMCkge1xuICAgICAgdmFyIHJlcGxhY2VkID0ga2lsbC5wb3AoKTtcbiAgICAgIGlmIChjbXAocmVwbGFjZWQuZnJvbSwgdG9LaWxsLmZyb20pIDwgMCkge1xuICAgICAgICB0b0tpbGwuZnJvbSA9IHJlcGxhY2VkLmZyb207XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGtpbGwucHVzaCh0b0tpbGwpO1xuICB9XG4gIC8vIE5leHQsIHJlbW92ZSB0aG9zZSBhY3R1YWwgcmFuZ2VzLlxuICBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IGtpbGwubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICB7IHJlcGxhY2VSYW5nZShjbS5kb2MsIFwiXCIsIGtpbGxbaV0uZnJvbSwga2lsbFtpXS50bywgXCIrZGVsZXRlXCIpOyB9XG4gICAgZW5zdXJlQ3Vyc29yVmlzaWJsZShjbSk7XG4gIH0pO1xufVxuXG4vLyBDb21tYW5kcyBhcmUgcGFyYW1ldGVyLWxlc3MgYWN0aW9ucyB0aGF0IGNhbiBiZSBwZXJmb3JtZWQgb24gYW5cbi8vIGVkaXRvciwgbW9zdGx5IHVzZWQgZm9yIGtleWJpbmRpbmdzLlxudmFyIGNvbW1hbmRzID0ge1xuICBzZWxlY3RBbGw6IHNlbGVjdEFsbCxcbiAgc2luZ2xlU2VsZWN0aW9uOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLnNldFNlbGVjdGlvbihjbS5nZXRDdXJzb3IoXCJhbmNob3JcIiksIGNtLmdldEN1cnNvcihcImhlYWRcIiksIHNlbF9kb250U2Nyb2xsKTsgfSxcbiAga2lsbExpbmU6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgZnVuY3Rpb24gKHJhbmdlKSB7XG4gICAgaWYgKHJhbmdlLmVtcHR5KCkpIHtcbiAgICAgIHZhciBsZW4gPSBnZXRMaW5lKGNtLmRvYywgcmFuZ2UuaGVhZC5saW5lKS50ZXh0Lmxlbmd0aDtcbiAgICAgIGlmIChyYW5nZS5oZWFkLmNoID09IGxlbiAmJiByYW5nZS5oZWFkLmxpbmUgPCBjbS5sYXN0TGluZSgpKVxuICAgICAgICB7IHJldHVybiB7ZnJvbTogcmFuZ2UuaGVhZCwgdG86IFBvcyhyYW5nZS5oZWFkLmxpbmUgKyAxLCAwKX0gfVxuICAgICAgZWxzZVxuICAgICAgICB7IHJldHVybiB7ZnJvbTogcmFuZ2UuaGVhZCwgdG86IFBvcyhyYW5nZS5oZWFkLmxpbmUsIGxlbil9IH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtmcm9tOiByYW5nZS5mcm9tKCksIHRvOiByYW5nZS50bygpfVxuICAgIH1cbiAgfSk7IH0sXG4gIGRlbGV0ZUxpbmU6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgZnVuY3Rpb24gKHJhbmdlKSB7IHJldHVybiAoe1xuICAgIGZyb206IFBvcyhyYW5nZS5mcm9tKCkubGluZSwgMCksXG4gICAgdG86IGNsaXBQb3MoY20uZG9jLCBQb3MocmFuZ2UudG8oKS5saW5lICsgMSwgMCkpXG4gIH0pOyB9KTsgfSxcbiAgZGVsTGluZUxlZnQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgZnVuY3Rpb24gKHJhbmdlKSB7IHJldHVybiAoe1xuICAgIGZyb206IFBvcyhyYW5nZS5mcm9tKCkubGluZSwgMCksIHRvOiByYW5nZS5mcm9tKClcbiAgfSk7IH0pOyB9LFxuICBkZWxXcmFwcGVkTGluZUxlZnQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgZnVuY3Rpb24gKHJhbmdlKSB7XG4gICAgdmFyIHRvcCA9IGNtLmNoYXJDb29yZHMocmFuZ2UuaGVhZCwgXCJkaXZcIikudG9wICsgNTtcbiAgICB2YXIgbGVmdFBvcyA9IGNtLmNvb3Jkc0NoYXIoe2xlZnQ6IDAsIHRvcDogdG9wfSwgXCJkaXZcIik7XG4gICAgcmV0dXJuIHtmcm9tOiBsZWZ0UG9zLCB0bzogcmFuZ2UuZnJvbSgpfVxuICB9KTsgfSxcbiAgZGVsV3JhcHBlZExpbmVSaWdodDogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBkZWxldGVOZWFyU2VsZWN0aW9uKGNtLCBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgICB2YXIgdG9wID0gY20uY2hhckNvb3JkcyhyYW5nZS5oZWFkLCBcImRpdlwiKS50b3AgKyA1O1xuICAgIHZhciByaWdodFBvcyA9IGNtLmNvb3Jkc0NoYXIoe2xlZnQ6IGNtLmRpc3BsYXkubGluZURpdi5vZmZzZXRXaWR0aCArIDEwMCwgdG9wOiB0b3B9LCBcImRpdlwiKTtcbiAgICByZXR1cm4ge2Zyb206IHJhbmdlLmZyb20oKSwgdG86IHJpZ2h0UG9zIH1cbiAgfSk7IH0sXG4gIHVuZG86IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20udW5kbygpOyB9LFxuICByZWRvOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLnJlZG8oKTsgfSxcbiAgdW5kb1NlbGVjdGlvbjogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBjbS51bmRvU2VsZWN0aW9uKCk7IH0sXG4gIHJlZG9TZWxlY3Rpb246IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20ucmVkb1NlbGVjdGlvbigpOyB9LFxuICBnb0RvY1N0YXJ0OiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLmV4dGVuZFNlbGVjdGlvbihQb3MoY20uZmlyc3RMaW5lKCksIDApKTsgfSxcbiAgZ29Eb2NFbmQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZXh0ZW5kU2VsZWN0aW9uKFBvcyhjbS5sYXN0TGluZSgpKSk7IH0sXG4gIGdvTGluZVN0YXJ0OiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbiAocmFuZ2UpIHsgcmV0dXJuIGxpbmVTdGFydChjbSwgcmFuZ2UuaGVhZC5saW5lKTsgfSxcbiAgICB7b3JpZ2luOiBcIittb3ZlXCIsIGJpYXM6IDF9XG4gICk7IH0sXG4gIGdvTGluZVN0YXJ0U21hcnQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uIChyYW5nZSkgeyByZXR1cm4gbGluZVN0YXJ0U21hcnQoY20sIHJhbmdlLmhlYWQpOyB9LFxuICAgIHtvcmlnaW46IFwiK21vdmVcIiwgYmlhczogMX1cbiAgKTsgfSxcbiAgZ29MaW5lRW5kOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbiAocmFuZ2UpIHsgcmV0dXJuIGxpbmVFbmQoY20sIHJhbmdlLmhlYWQubGluZSk7IH0sXG4gICAge29yaWdpbjogXCIrbW92ZVwiLCBiaWFzOiAtMX1cbiAgKTsgfSxcbiAgZ29MaW5lUmlnaHQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uIChyYW5nZSkge1xuICAgIHZhciB0b3AgPSBjbS5jaGFyQ29vcmRzKHJhbmdlLmhlYWQsIFwiZGl2XCIpLnRvcCArIDU7XG4gICAgcmV0dXJuIGNtLmNvb3Jkc0NoYXIoe2xlZnQ6IGNtLmRpc3BsYXkubGluZURpdi5vZmZzZXRXaWR0aCArIDEwMCwgdG9wOiB0b3B9LCBcImRpdlwiKVxuICB9LCBzZWxfbW92ZSk7IH0sXG4gIGdvTGluZUxlZnQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uIChyYW5nZSkge1xuICAgIHZhciB0b3AgPSBjbS5jaGFyQ29vcmRzKHJhbmdlLmhlYWQsIFwiZGl2XCIpLnRvcCArIDU7XG4gICAgcmV0dXJuIGNtLmNvb3Jkc0NoYXIoe2xlZnQ6IDAsIHRvcDogdG9wfSwgXCJkaXZcIilcbiAgfSwgc2VsX21vdmUpOyB9LFxuICBnb0xpbmVMZWZ0U21hcnQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uIChyYW5nZSkge1xuICAgIHZhciB0b3AgPSBjbS5jaGFyQ29vcmRzKHJhbmdlLmhlYWQsIFwiZGl2XCIpLnRvcCArIDU7XG4gICAgdmFyIHBvcyA9IGNtLmNvb3Jkc0NoYXIoe2xlZnQ6IDAsIHRvcDogdG9wfSwgXCJkaXZcIik7XG4gICAgaWYgKHBvcy5jaCA8IGNtLmdldExpbmUocG9zLmxpbmUpLnNlYXJjaCgvXFxTLykpIHsgcmV0dXJuIGxpbmVTdGFydFNtYXJ0KGNtLCByYW5nZS5oZWFkKSB9XG4gICAgcmV0dXJuIHBvc1xuICB9LCBzZWxfbW92ZSk7IH0sXG4gIGdvTGluZVVwOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLm1vdmVWKC0xLCBcImxpbmVcIik7IH0sXG4gIGdvTGluZURvd246IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20ubW92ZVYoMSwgXCJsaW5lXCIpOyB9LFxuICBnb1BhZ2VVcDogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBjbS5tb3ZlVigtMSwgXCJwYWdlXCIpOyB9LFxuICBnb1BhZ2VEb3duOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLm1vdmVWKDEsIFwicGFnZVwiKTsgfSxcbiAgZ29DaGFyTGVmdDogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBjbS5tb3ZlSCgtMSwgXCJjaGFyXCIpOyB9LFxuICBnb0NoYXJSaWdodDogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBjbS5tb3ZlSCgxLCBcImNoYXJcIik7IH0sXG4gIGdvQ29sdW1uTGVmdDogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBjbS5tb3ZlSCgtMSwgXCJjb2x1bW5cIik7IH0sXG4gIGdvQ29sdW1uUmlnaHQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20ubW92ZUgoMSwgXCJjb2x1bW5cIik7IH0sXG4gIGdvV29yZExlZnQ6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20ubW92ZUgoLTEsIFwid29yZFwiKTsgfSxcbiAgZ29Hcm91cFJpZ2h0OiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLm1vdmVIKDEsIFwiZ3JvdXBcIik7IH0sXG4gIGdvR3JvdXBMZWZ0OiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLm1vdmVIKC0xLCBcImdyb3VwXCIpOyB9LFxuICBnb1dvcmRSaWdodDogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBjbS5tb3ZlSCgxLCBcIndvcmRcIik7IH0sXG4gIGRlbENoYXJCZWZvcmU6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZGVsZXRlSCgtMSwgXCJjaGFyXCIpOyB9LFxuICBkZWxDaGFyQWZ0ZXI6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZGVsZXRlSCgxLCBcImNoYXJcIik7IH0sXG4gIGRlbFdvcmRCZWZvcmU6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZGVsZXRlSCgtMSwgXCJ3b3JkXCIpOyB9LFxuICBkZWxXb3JkQWZ0ZXI6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZGVsZXRlSCgxLCBcIndvcmRcIik7IH0sXG4gIGRlbEdyb3VwQmVmb3JlOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLmRlbGV0ZUgoLTEsIFwiZ3JvdXBcIik7IH0sXG4gIGRlbEdyb3VwQWZ0ZXI6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20uZGVsZXRlSCgxLCBcImdyb3VwXCIpOyB9LFxuICBpbmRlbnRBdXRvOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLmluZGVudFNlbGVjdGlvbihcInNtYXJ0XCIpOyB9LFxuICBpbmRlbnRNb3JlOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLmluZGVudFNlbGVjdGlvbihcImFkZFwiKTsgfSxcbiAgaW5kZW50TGVzczogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBjbS5pbmRlbnRTZWxlY3Rpb24oXCJzdWJ0cmFjdFwiKTsgfSxcbiAgaW5zZXJ0VGFiOiBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLnJlcGxhY2VTZWxlY3Rpb24oXCJcXHRcIik7IH0sXG4gIGluc2VydFNvZnRUYWI6IGZ1bmN0aW9uIChjbSkge1xuICAgIHZhciBzcGFjZXMgPSBbXSwgcmFuZ2VzID0gY20ubGlzdFNlbGVjdGlvbnMoKSwgdGFiU2l6ZSA9IGNtLm9wdGlvbnMudGFiU2l6ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBvcyA9IHJhbmdlc1tpXS5mcm9tKCk7XG4gICAgICB2YXIgY29sID0gY291bnRDb2x1bW4oY20uZ2V0TGluZShwb3MubGluZSksIHBvcy5jaCwgdGFiU2l6ZSk7XG4gICAgICBzcGFjZXMucHVzaChzcGFjZVN0cih0YWJTaXplIC0gY29sICUgdGFiU2l6ZSkpO1xuICAgIH1cbiAgICBjbS5yZXBsYWNlU2VsZWN0aW9ucyhzcGFjZXMpO1xuICB9LFxuICBkZWZhdWx0VGFiOiBmdW5jdGlvbiAoY20pIHtcbiAgICBpZiAoY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkgeyBjbS5pbmRlbnRTZWxlY3Rpb24oXCJhZGRcIik7IH1cbiAgICBlbHNlIHsgY20uZXhlY0NvbW1hbmQoXCJpbnNlcnRUYWJcIik7IH1cbiAgfSxcbiAgLy8gU3dhcCB0aGUgdHdvIGNoYXJzIGxlZnQgYW5kIHJpZ2h0IG9mIGVhY2ggc2VsZWN0aW9uJ3MgaGVhZC5cbiAgLy8gTW92ZSBjdXJzb3IgYmVoaW5kIHRoZSB0d28gc3dhcHBlZCBjaGFyYWN0ZXJzIGFmdGVyd2FyZHMuXG4gIC8vXG4gIC8vIERvZXNuJ3QgY29uc2lkZXIgbGluZSBmZWVkcyBhIGNoYXJhY3Rlci5cbiAgLy8gRG9lc24ndCBzY2FuIG1vcmUgdGhhbiBvbmUgbGluZSBhYm92ZSB0byBmaW5kIGEgY2hhcmFjdGVyLlxuICAvLyBEb2Vzbid0IGRvIGFueXRoaW5nIG9uIGFuIGVtcHR5IGxpbmUuXG4gIC8vIERvZXNuJ3QgZG8gYW55dGhpbmcgd2l0aCBub24tZW1wdHkgc2VsZWN0aW9ucy5cbiAgdHJhbnNwb3NlQ2hhcnM6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgIHZhciByYW5nZXMgPSBjbS5saXN0U2VsZWN0aW9ucygpLCBuZXdTZWwgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCFyYW5nZXNbaV0uZW1wdHkoKSkgeyBjb250aW51ZSB9XG4gICAgICB2YXIgY3VyID0gcmFuZ2VzW2ldLmhlYWQsIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgY3VyLmxpbmUpLnRleHQ7XG4gICAgICBpZiAobGluZSkge1xuICAgICAgICBpZiAoY3VyLmNoID09IGxpbmUubGVuZ3RoKSB7IGN1ciA9IG5ldyBQb3MoY3VyLmxpbmUsIGN1ci5jaCAtIDEpOyB9XG4gICAgICAgIGlmIChjdXIuY2ggPiAwKSB7XG4gICAgICAgICAgY3VyID0gbmV3IFBvcyhjdXIubGluZSwgY3VyLmNoICsgMSk7XG4gICAgICAgICAgY20ucmVwbGFjZVJhbmdlKGxpbmUuY2hhckF0KGN1ci5jaCAtIDEpICsgbGluZS5jaGFyQXQoY3VyLmNoIC0gMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFBvcyhjdXIubGluZSwgY3VyLmNoIC0gMiksIGN1ciwgXCIrdHJhbnNwb3NlXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ci5saW5lID4gY20uZG9jLmZpcnN0KSB7XG4gICAgICAgICAgdmFyIHByZXYgPSBnZXRMaW5lKGNtLmRvYywgY3VyLmxpbmUgLSAxKS50ZXh0O1xuICAgICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICBjdXIgPSBuZXcgUG9zKGN1ci5saW5lLCAxKTtcbiAgICAgICAgICAgIGNtLnJlcGxhY2VSYW5nZShsaW5lLmNoYXJBdCgwKSArIGNtLmRvYy5saW5lU2VwYXJhdG9yKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXYuY2hhckF0KHByZXYubGVuZ3RoIC0gMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUG9zKGN1ci5saW5lIC0gMSwgcHJldi5sZW5ndGggLSAxKSwgY3VyLCBcIit0cmFuc3Bvc2VcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdTZWwucHVzaChuZXcgUmFuZ2UoY3VyLCBjdXIpKTtcbiAgICB9XG4gICAgY20uc2V0U2VsZWN0aW9ucyhuZXdTZWwpO1xuICB9KTsgfSxcbiAgbmV3bGluZUFuZEluZGVudDogZnVuY3Rpb24gKGNtKSB7IHJldHVybiBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbHMgPSBjbS5saXN0U2VsZWN0aW9ucygpO1xuICAgIGZvciAodmFyIGkgPSBzZWxzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxuICAgICAgeyBjbS5yZXBsYWNlUmFuZ2UoY20uZG9jLmxpbmVTZXBhcmF0b3IoKSwgc2Vsc1tpXS5hbmNob3IsIHNlbHNbaV0uaGVhZCwgXCIraW5wdXRcIik7IH1cbiAgICBzZWxzID0gY20ubGlzdFNlbGVjdGlvbnMoKTtcbiAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBzZWxzLmxlbmd0aDsgaSQxKyspXG4gICAgICB7IGNtLmluZGVudExpbmUoc2Vsc1tpJDFdLmZyb20oKS5saW5lLCBudWxsLCB0cnVlKTsgfVxuICAgIGVuc3VyZUN1cnNvclZpc2libGUoY20pO1xuICB9KTsgfSxcbiAgb3BlbkxpbmU6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20ucmVwbGFjZVNlbGVjdGlvbihcIlxcblwiLCBcInN0YXJ0XCIpOyB9LFxuICB0b2dnbGVPdmVyd3JpdGU6IGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gY20udG9nZ2xlT3ZlcndyaXRlKCk7IH1cbn07XG5cblxuZnVuY3Rpb24gbGluZVN0YXJ0KGNtLCBsaW5lTikge1xuICB2YXIgbGluZSA9IGdldExpbmUoY20uZG9jLCBsaW5lTik7XG4gIHZhciB2aXN1YWwgPSB2aXN1YWxMaW5lKGxpbmUpO1xuICBpZiAodmlzdWFsICE9IGxpbmUpIHsgbGluZU4gPSBsaW5lTm8odmlzdWFsKTsgfVxuICByZXR1cm4gZW5kT2ZMaW5lKHRydWUsIGNtLCB2aXN1YWwsIGxpbmVOLCAxKVxufVxuZnVuY3Rpb24gbGluZUVuZChjbSwgbGluZU4pIHtcbiAgdmFyIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgbGluZU4pO1xuICB2YXIgdmlzdWFsID0gdmlzdWFsTGluZUVuZChsaW5lKTtcbiAgaWYgKHZpc3VhbCAhPSBsaW5lKSB7IGxpbmVOID0gbGluZU5vKHZpc3VhbCk7IH1cbiAgcmV0dXJuIGVuZE9mTGluZSh0cnVlLCBjbSwgbGluZSwgbGluZU4sIC0xKVxufVxuZnVuY3Rpb24gbGluZVN0YXJ0U21hcnQoY20sIHBvcykge1xuICB2YXIgc3RhcnQgPSBsaW5lU3RhcnQoY20sIHBvcy5saW5lKTtcbiAgdmFyIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgc3RhcnQubGluZSk7XG4gIHZhciBvcmRlciA9IGdldE9yZGVyKGxpbmUsIGNtLmRvYy5kaXJlY3Rpb24pO1xuICBpZiAoIW9yZGVyIHx8IG9yZGVyWzBdLmxldmVsID09IDApIHtcbiAgICB2YXIgZmlyc3ROb25XUyA9IE1hdGgubWF4KDAsIGxpbmUudGV4dC5zZWFyY2goL1xcUy8pKTtcbiAgICB2YXIgaW5XUyA9IHBvcy5saW5lID09IHN0YXJ0LmxpbmUgJiYgcG9zLmNoIDw9IGZpcnN0Tm9uV1MgJiYgcG9zLmNoO1xuICAgIHJldHVybiBQb3Moc3RhcnQubGluZSwgaW5XUyA/IDAgOiBmaXJzdE5vbldTLCBzdGFydC5zdGlja3kpXG4gIH1cbiAgcmV0dXJuIHN0YXJ0XG59XG5cbi8vIFJ1biBhIGhhbmRsZXIgdGhhdCB3YXMgYm91bmQgdG8gYSBrZXkuXG5mdW5jdGlvbiBkb0hhbmRsZUJpbmRpbmcoY20sIGJvdW5kLCBkcm9wU2hpZnQpIHtcbiAgaWYgKHR5cGVvZiBib3VuZCA9PSBcInN0cmluZ1wiKSB7XG4gICAgYm91bmQgPSBjb21tYW5kc1tib3VuZF07XG4gICAgaWYgKCFib3VuZCkgeyByZXR1cm4gZmFsc2UgfVxuICB9XG4gIC8vIEVuc3VyZSBwcmV2aW91cyBpbnB1dCBoYXMgYmVlbiByZWFkLCBzbyB0aGF0IHRoZSBoYW5kbGVyIHNlZXMgYVxuICAvLyBjb25zaXN0ZW50IHZpZXcgb2YgdGhlIGRvY3VtZW50XG4gIGNtLmRpc3BsYXkuaW5wdXQuZW5zdXJlUG9sbGVkKCk7XG4gIHZhciBwcmV2U2hpZnQgPSBjbS5kaXNwbGF5LnNoaWZ0LCBkb25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgaWYgKGNtLmlzUmVhZE9ubHkoKSkgeyBjbS5zdGF0ZS5zdXBwcmVzc0VkaXRzID0gdHJ1ZTsgfVxuICAgIGlmIChkcm9wU2hpZnQpIHsgY20uZGlzcGxheS5zaGlmdCA9IGZhbHNlOyB9XG4gICAgZG9uZSA9IGJvdW5kKGNtKSAhPSBQYXNzO1xuICB9IGZpbmFsbHkge1xuICAgIGNtLmRpc3BsYXkuc2hpZnQgPSBwcmV2U2hpZnQ7XG4gICAgY20uc3RhdGUuc3VwcHJlc3NFZGl0cyA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBkb25lXG59XG5cbmZ1bmN0aW9uIGxvb2t1cEtleUZvckVkaXRvcihjbSwgbmFtZSwgaGFuZGxlKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY20uc3RhdGUua2V5TWFwcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciByZXN1bHQgPSBsb29rdXBLZXkobmFtZSwgY20uc3RhdGUua2V5TWFwc1tpXSwgaGFuZGxlLCBjbSk7XG4gICAgaWYgKHJlc3VsdCkgeyByZXR1cm4gcmVzdWx0IH1cbiAgfVxuICByZXR1cm4gKGNtLm9wdGlvbnMuZXh0cmFLZXlzICYmIGxvb2t1cEtleShuYW1lLCBjbS5vcHRpb25zLmV4dHJhS2V5cywgaGFuZGxlLCBjbSkpXG4gICAgfHwgbG9va3VwS2V5KG5hbWUsIGNtLm9wdGlvbnMua2V5TWFwLCBoYW5kbGUsIGNtKVxufVxuXG52YXIgc3RvcFNlcSA9IG5ldyBEZWxheWVkO1xuZnVuY3Rpb24gZGlzcGF0Y2hLZXkoY20sIG5hbWUsIGUsIGhhbmRsZSkge1xuICB2YXIgc2VxID0gY20uc3RhdGUua2V5U2VxO1xuICBpZiAoc2VxKSB7XG4gICAgaWYgKGlzTW9kaWZpZXJLZXkobmFtZSkpIHsgcmV0dXJuIFwiaGFuZGxlZFwiIH1cbiAgICBzdG9wU2VxLnNldCg1MCwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGNtLnN0YXRlLmtleVNlcSA9PSBzZXEpIHtcbiAgICAgICAgY20uc3RhdGUua2V5U2VxID0gbnVsbDtcbiAgICAgICAgY20uZGlzcGxheS5pbnB1dC5yZXNldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG5hbWUgPSBzZXEgKyBcIiBcIiArIG5hbWU7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IGxvb2t1cEtleUZvckVkaXRvcihjbSwgbmFtZSwgaGFuZGxlKTtcblxuICBpZiAocmVzdWx0ID09IFwibXVsdGlcIilcbiAgICB7IGNtLnN0YXRlLmtleVNlcSA9IG5hbWU7IH1cbiAgaWYgKHJlc3VsdCA9PSBcImhhbmRsZWRcIilcbiAgICB7IHNpZ25hbExhdGVyKGNtLCBcImtleUhhbmRsZWRcIiwgY20sIG5hbWUsIGUpOyB9XG5cbiAgaWYgKHJlc3VsdCA9PSBcImhhbmRsZWRcIiB8fCByZXN1bHQgPT0gXCJtdWx0aVwiKSB7XG4gICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICByZXN0YXJ0QmxpbmsoY20pO1xuICB9XG5cbiAgaWYgKHNlcSAmJiAhcmVzdWx0ICYmIC9cXCckLy50ZXN0KG5hbWUpKSB7XG4gICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIHJldHVybiAhIXJlc3VsdFxufVxuXG4vLyBIYW5kbGUgYSBrZXkgZnJvbSB0aGUga2V5ZG93biBldmVudC5cbmZ1bmN0aW9uIGhhbmRsZUtleUJpbmRpbmcoY20sIGUpIHtcbiAgdmFyIG5hbWUgPSBrZXlOYW1lKGUsIHRydWUpO1xuICBpZiAoIW5hbWUpIHsgcmV0dXJuIGZhbHNlIH1cblxuICBpZiAoZS5zaGlmdEtleSAmJiAhY20uc3RhdGUua2V5U2VxKSB7XG4gICAgLy8gRmlyc3QgdHJ5IHRvIHJlc29sdmUgZnVsbCBuYW1lIChpbmNsdWRpbmcgJ1NoaWZ0LScpLiBGYWlsaW5nXG4gICAgLy8gdGhhdCwgc2VlIGlmIHRoZXJlIGlzIGEgY3Vyc29yLW1vdGlvbiBjb21tYW5kIChzdGFydGluZyB3aXRoXG4gICAgLy8gJ2dvJykgYm91bmQgdG8gdGhlIGtleW5hbWUgd2l0aG91dCAnU2hpZnQtJy5cbiAgICByZXR1cm4gZGlzcGF0Y2hLZXkoY20sIFwiU2hpZnQtXCIgKyBuYW1lLCBlLCBmdW5jdGlvbiAoYikgeyByZXR1cm4gZG9IYW5kbGVCaW5kaW5nKGNtLCBiLCB0cnVlKTsgfSlcbiAgICAgICAgfHwgZGlzcGF0Y2hLZXkoY20sIG5hbWUsIGUsIGZ1bmN0aW9uIChiKSB7XG4gICAgICAgICAgICAgaWYgKHR5cGVvZiBiID09IFwic3RyaW5nXCIgPyAvXmdvW0EtWl0vLnRlc3QoYikgOiBiLm1vdGlvbilcbiAgICAgICAgICAgICAgIHsgcmV0dXJuIGRvSGFuZGxlQmluZGluZyhjbSwgYikgfVxuICAgICAgICAgICB9KVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBkaXNwYXRjaEtleShjbSwgbmFtZSwgZSwgZnVuY3Rpb24gKGIpIHsgcmV0dXJuIGRvSGFuZGxlQmluZGluZyhjbSwgYik7IH0pXG4gIH1cbn1cblxuLy8gSGFuZGxlIGEga2V5IGZyb20gdGhlIGtleXByZXNzIGV2ZW50XG5mdW5jdGlvbiBoYW5kbGVDaGFyQmluZGluZyhjbSwgZSwgY2gpIHtcbiAgcmV0dXJuIGRpc3BhdGNoS2V5KGNtLCBcIidcIiArIGNoICsgXCInXCIsIGUsIGZ1bmN0aW9uIChiKSB7IHJldHVybiBkb0hhbmRsZUJpbmRpbmcoY20sIGIsIHRydWUpOyB9KVxufVxuXG52YXIgbGFzdFN0b3BwZWRLZXkgPSBudWxsO1xuZnVuY3Rpb24gb25LZXlEb3duKGUpIHtcbiAgdmFyIGNtID0gdGhpcztcbiAgY20uY3VyT3AuZm9jdXMgPSBhY3RpdmVFbHQoKTtcbiAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlKSkgeyByZXR1cm4gfVxuICAvLyBJRSBkb2VzIHN0cmFuZ2UgdGhpbmdzIHdpdGggZXNjYXBlLlxuICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDExICYmIGUua2V5Q29kZSA9PSAyNykgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH1cbiAgdmFyIGNvZGUgPSBlLmtleUNvZGU7XG4gIGNtLmRpc3BsYXkuc2hpZnQgPSBjb2RlID09IDE2IHx8IGUuc2hpZnRLZXk7XG4gIHZhciBoYW5kbGVkID0gaGFuZGxlS2V5QmluZGluZyhjbSwgZSk7XG4gIGlmIChwcmVzdG8pIHtcbiAgICBsYXN0U3RvcHBlZEtleSA9IGhhbmRsZWQgPyBjb2RlIDogbnVsbDtcbiAgICAvLyBPcGVyYSBoYXMgbm8gY3V0IGV2ZW50Li4uIHdlIHRyeSB0byBhdCBsZWFzdCBjYXRjaCB0aGUga2V5IGNvbWJvXG4gICAgaWYgKCFoYW5kbGVkICYmIGNvZGUgPT0gODggJiYgIWhhc0NvcHlFdmVudCAmJiAobWFjID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSlcbiAgICAgIHsgY20ucmVwbGFjZVNlbGVjdGlvbihcIlwiLCBudWxsLCBcImN1dFwiKTsgfVxuICB9XG5cbiAgLy8gVHVybiBtb3VzZSBpbnRvIGNyb3NzaGFpciB3aGVuIEFsdCBpcyBoZWxkIG9uIE1hYy5cbiAgaWYgKGNvZGUgPT0gMTggJiYgIS9cXGJDb2RlTWlycm9yLWNyb3NzaGFpclxcYi8udGVzdChjbS5kaXNwbGF5LmxpbmVEaXYuY2xhc3NOYW1lKSlcbiAgICB7IHNob3dDcm9zc0hhaXIoY20pOyB9XG59XG5cbmZ1bmN0aW9uIHNob3dDcm9zc0hhaXIoY20pIHtcbiAgdmFyIGxpbmVEaXYgPSBjbS5kaXNwbGF5LmxpbmVEaXY7XG4gIGFkZENsYXNzKGxpbmVEaXYsIFwiQ29kZU1pcnJvci1jcm9zc2hhaXJcIik7XG5cbiAgZnVuY3Rpb24gdXAoZSkge1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTggfHwgIWUuYWx0S2V5KSB7XG4gICAgICBybUNsYXNzKGxpbmVEaXYsIFwiQ29kZU1pcnJvci1jcm9zc2hhaXJcIik7XG4gICAgICBvZmYoZG9jdW1lbnQsIFwia2V5dXBcIiwgdXApO1xuICAgICAgb2ZmKGRvY3VtZW50LCBcIm1vdXNlb3ZlclwiLCB1cCk7XG4gICAgfVxuICB9XG4gIG9uKGRvY3VtZW50LCBcImtleXVwXCIsIHVwKTtcbiAgb24oZG9jdW1lbnQsIFwibW91c2VvdmVyXCIsIHVwKTtcbn1cblxuZnVuY3Rpb24gb25LZXlVcChlKSB7XG4gIGlmIChlLmtleUNvZGUgPT0gMTYpIHsgdGhpcy5kb2Muc2VsLnNoaWZ0ID0gZmFsc2U7IH1cbiAgc2lnbmFsRE9NRXZlbnQodGhpcywgZSk7XG59XG5cbmZ1bmN0aW9uIG9uS2V5UHJlc3MoZSkge1xuICB2YXIgY20gPSB0aGlzO1xuICBpZiAoZXZlbnRJbldpZGdldChjbS5kaXNwbGF5LCBlKSB8fCBzaWduYWxET01FdmVudChjbSwgZSkgfHwgZS5jdHJsS2V5ICYmICFlLmFsdEtleSB8fCBtYWMgJiYgZS5tZXRhS2V5KSB7IHJldHVybiB9XG4gIHZhciBrZXlDb2RlID0gZS5rZXlDb2RlLCBjaGFyQ29kZSA9IGUuY2hhckNvZGU7XG4gIGlmIChwcmVzdG8gJiYga2V5Q29kZSA9PSBsYXN0U3RvcHBlZEtleSkge2xhc3RTdG9wcGVkS2V5ID0gbnVsbDsgZV9wcmV2ZW50RGVmYXVsdChlKTsgcmV0dXJufVxuICBpZiAoKHByZXN0byAmJiAoIWUud2hpY2ggfHwgZS53aGljaCA8IDEwKSkgJiYgaGFuZGxlS2V5QmluZGluZyhjbSwgZSkpIHsgcmV0dXJuIH1cbiAgdmFyIGNoID0gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSA9PSBudWxsID8ga2V5Q29kZSA6IGNoYXJDb2RlKTtcbiAgLy8gU29tZSBicm93c2VycyBmaXJlIGtleXByZXNzIGV2ZW50cyBmb3IgYmFja3NwYWNlXG4gIGlmIChjaCA9PSBcIlxceDA4XCIpIHsgcmV0dXJuIH1cbiAgaWYgKGhhbmRsZUNoYXJCaW5kaW5nKGNtLCBlLCBjaCkpIHsgcmV0dXJuIH1cbiAgY20uZGlzcGxheS5pbnB1dC5vbktleVByZXNzKGUpO1xufVxuXG4vLyBBIG1vdXNlIGRvd24gY2FuIGJlIGEgc2luZ2xlIGNsaWNrLCBkb3VibGUgY2xpY2ssIHRyaXBsZSBjbGljayxcbi8vIHN0YXJ0IG9mIHNlbGVjdGlvbiBkcmFnLCBzdGFydCBvZiB0ZXh0IGRyYWcsIG5ldyBjdXJzb3Jcbi8vIChjdHJsLWNsaWNrKSwgcmVjdGFuZ2xlIGRyYWcgKGFsdC1kcmFnKSwgb3IgeHdpblxuLy8gbWlkZGxlLWNsaWNrLXBhc3RlLiBPciBpdCBtaWdodCBiZSBhIGNsaWNrIG9uIHNvbWV0aGluZyB3ZSBzaG91bGRcbi8vIG5vdCBpbnRlcmZlcmUgd2l0aCwgc3VjaCBhcyBhIHNjcm9sbGJhciBvciB3aWRnZXQuXG5mdW5jdGlvbiBvbk1vdXNlRG93bihlKSB7XG4gIHZhciBjbSA9IHRoaXMsIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpIHx8IGRpc3BsYXkuYWN0aXZlVG91Y2ggJiYgZGlzcGxheS5pbnB1dC5zdXBwb3J0c1RvdWNoKCkpIHsgcmV0dXJuIH1cbiAgZGlzcGxheS5pbnB1dC5lbnN1cmVQb2xsZWQoKTtcbiAgZGlzcGxheS5zaGlmdCA9IGUuc2hpZnRLZXk7XG5cbiAgaWYgKGV2ZW50SW5XaWRnZXQoZGlzcGxheSwgZSkpIHtcbiAgICBpZiAoIXdlYmtpdCkge1xuICAgICAgLy8gQnJpZWZseSB0dXJuIG9mZiBkcmFnZ2FiaWxpdHksIHRvIGFsbG93IHdpZGdldHMgdG8gZG9cbiAgICAgIC8vIG5vcm1hbCBkcmFnZ2luZyB0aGluZ3MuXG4gICAgICBkaXNwbGF5LnNjcm9sbGVyLmRyYWdnYWJsZSA9IGZhbHNlO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiBkaXNwbGF5LnNjcm9sbGVyLmRyYWdnYWJsZSA9IHRydWU7IH0sIDEwMCk7XG4gICAgfVxuICAgIHJldHVyblxuICB9XG4gIGlmIChjbGlja0luR3V0dGVyKGNtLCBlKSkgeyByZXR1cm4gfVxuICB2YXIgc3RhcnQgPSBwb3NGcm9tTW91c2UoY20sIGUpO1xuICB3aW5kb3cuZm9jdXMoKTtcblxuICBzd2l0Y2ggKGVfYnV0dG9uKGUpKSB7XG4gIGNhc2UgMTpcbiAgICAvLyAjMzI2MTogbWFrZSBzdXJlLCB0aGF0IHdlJ3JlIG5vdCBzdGFydGluZyBhIHNlY29uZCBzZWxlY3Rpb25cbiAgICBpZiAoY20uc3RhdGUuc2VsZWN0aW5nVGV4dClcbiAgICAgIHsgY20uc3RhdGUuc2VsZWN0aW5nVGV4dChlKTsgfVxuICAgIGVsc2UgaWYgKHN0YXJ0KVxuICAgICAgeyBsZWZ0QnV0dG9uRG93bihjbSwgZSwgc3RhcnQpOyB9XG4gICAgZWxzZSBpZiAoZV90YXJnZXQoZSkgPT0gZGlzcGxheS5zY3JvbGxlcilcbiAgICAgIHsgZV9wcmV2ZW50RGVmYXVsdChlKTsgfVxuICAgIGJyZWFrXG4gIGNhc2UgMjpcbiAgICBpZiAod2Via2l0KSB7IGNtLnN0YXRlLmxhc3RNaWRkbGVEb3duID0gK25ldyBEYXRlOyB9XG4gICAgaWYgKHN0YXJ0KSB7IGV4dGVuZFNlbGVjdGlvbihjbS5kb2MsIHN0YXJ0KTsgfVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZXR1cm4gZGlzcGxheS5pbnB1dC5mb2N1cygpOyB9LCAyMCk7XG4gICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICBicmVha1xuICBjYXNlIDM6XG4gICAgaWYgKGNhcHR1cmVSaWdodENsaWNrKSB7IG9uQ29udGV4dE1lbnUoY20sIGUpOyB9XG4gICAgZWxzZSB7IGRlbGF5Qmx1ckV2ZW50KGNtKTsgfVxuICAgIGJyZWFrXG4gIH1cbn1cblxudmFyIGxhc3RDbGljaztcbnZhciBsYXN0RG91YmxlQ2xpY2s7XG5mdW5jdGlvbiBsZWZ0QnV0dG9uRG93bihjbSwgZSwgc3RhcnQpIHtcbiAgaWYgKGllKSB7IHNldFRpbWVvdXQoYmluZChlbnN1cmVGb2N1cywgY20pLCAwKTsgfVxuICBlbHNlIHsgY20uY3VyT3AuZm9jdXMgPSBhY3RpdmVFbHQoKTsgfVxuXG4gIHZhciBub3cgPSArbmV3IERhdGUsIHR5cGU7XG4gIGlmIChsYXN0RG91YmxlQ2xpY2sgJiYgbGFzdERvdWJsZUNsaWNrLnRpbWUgPiBub3cgLSA0MDAgJiYgY21wKGxhc3REb3VibGVDbGljay5wb3MsIHN0YXJ0KSA9PSAwKSB7XG4gICAgdHlwZSA9IFwidHJpcGxlXCI7XG4gIH0gZWxzZSBpZiAobGFzdENsaWNrICYmIGxhc3RDbGljay50aW1lID4gbm93IC0gNDAwICYmIGNtcChsYXN0Q2xpY2sucG9zLCBzdGFydCkgPT0gMCkge1xuICAgIHR5cGUgPSBcImRvdWJsZVwiO1xuICAgIGxhc3REb3VibGVDbGljayA9IHt0aW1lOiBub3csIHBvczogc3RhcnR9O1xuICB9IGVsc2Uge1xuICAgIHR5cGUgPSBcInNpbmdsZVwiO1xuICAgIGxhc3RDbGljayA9IHt0aW1lOiBub3csIHBvczogc3RhcnR9O1xuICB9XG5cbiAgdmFyIHNlbCA9IGNtLmRvYy5zZWwsIG1vZGlmaWVyID0gbWFjID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5LCBjb250YWluZWQ7XG4gIGlmIChjbS5vcHRpb25zLmRyYWdEcm9wICYmIGRyYWdBbmREcm9wICYmICFjbS5pc1JlYWRPbmx5KCkgJiZcbiAgICAgIHR5cGUgPT0gXCJzaW5nbGVcIiAmJiAoY29udGFpbmVkID0gc2VsLmNvbnRhaW5zKHN0YXJ0KSkgPiAtMSAmJlxuICAgICAgKGNtcCgoY29udGFpbmVkID0gc2VsLnJhbmdlc1tjb250YWluZWRdKS5mcm9tKCksIHN0YXJ0KSA8IDAgfHwgc3RhcnQueFJlbCA+IDApICYmXG4gICAgICAoY21wKGNvbnRhaW5lZC50bygpLCBzdGFydCkgPiAwIHx8IHN0YXJ0LnhSZWwgPCAwKSlcbiAgICB7IGxlZnRCdXR0b25TdGFydERyYWcoY20sIGUsIHN0YXJ0LCBtb2RpZmllcik7IH1cbiAgZWxzZVxuICAgIHsgbGVmdEJ1dHRvblNlbGVjdChjbSwgZSwgc3RhcnQsIHR5cGUsIG1vZGlmaWVyKTsgfVxufVxuXG4vLyBTdGFydCBhIHRleHQgZHJhZy4gV2hlbiBpdCBlbmRzLCBzZWUgaWYgYW55IGRyYWdnaW5nIGFjdHVhbGx5XG4vLyBoYXBwZW4sIGFuZCB0cmVhdCBhcyBhIGNsaWNrIGlmIGl0IGRpZG4ndC5cbmZ1bmN0aW9uIGxlZnRCdXR0b25TdGFydERyYWcoY20sIGUsIHN0YXJ0LCBtb2RpZmllcikge1xuICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIG1vdmVkID0gZmFsc2U7XG4gIHZhciBkcmFnRW5kID0gb3BlcmF0aW9uKGNtLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh3ZWJraXQpIHsgZGlzcGxheS5zY3JvbGxlci5kcmFnZ2FibGUgPSBmYWxzZTsgfVxuICAgIGNtLnN0YXRlLmRyYWdnaW5nVGV4dCA9IGZhbHNlO1xuICAgIG9mZihkb2N1bWVudCwgXCJtb3VzZXVwXCIsIGRyYWdFbmQpO1xuICAgIG9mZihkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgbW91c2VNb3ZlKTtcbiAgICBvZmYoZGlzcGxheS5zY3JvbGxlciwgXCJkcmFnc3RhcnRcIiwgZHJhZ1N0YXJ0KTtcbiAgICBvZmYoZGlzcGxheS5zY3JvbGxlciwgXCJkcm9wXCIsIGRyYWdFbmQpO1xuICAgIGlmICghbW92ZWQpIHtcbiAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICBpZiAoIW1vZGlmaWVyKVxuICAgICAgICB7IGV4dGVuZFNlbGVjdGlvbihjbS5kb2MsIHN0YXJ0KTsgfVxuICAgICAgLy8gV29yayBhcm91bmQgdW5leHBsYWluYWJsZSBmb2N1cyBwcm9ibGVtIGluIElFOSAoIzIxMjcpIGFuZCBDaHJvbWUgKCMzMDgxKVxuICAgICAgaWYgKHdlYmtpdCB8fCBpZSAmJiBpZV92ZXJzaW9uID09IDkpXG4gICAgICAgIHsgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7ZG9jdW1lbnQuYm9keS5mb2N1cygpOyBkaXNwbGF5LmlucHV0LmZvY3VzKCk7fSwgMjApOyB9XG4gICAgICBlbHNlXG4gICAgICAgIHsgZGlzcGxheS5pbnB1dC5mb2N1cygpOyB9XG4gICAgfVxuICB9KTtcbiAgdmFyIG1vdXNlTW92ZSA9IGZ1bmN0aW9uKGUyKSB7XG4gICAgbW92ZWQgPSBtb3ZlZCB8fCBNYXRoLmFicyhlLmNsaWVudFggLSBlMi5jbGllbnRYKSArIE1hdGguYWJzKGUuY2xpZW50WSAtIGUyLmNsaWVudFkpID49IDEwO1xuICB9O1xuICB2YXIgZHJhZ1N0YXJ0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbW92ZWQgPSB0cnVlOyB9O1xuICAvLyBMZXQgdGhlIGRyYWcgaGFuZGxlciBoYW5kbGUgdGhpcy5cbiAgaWYgKHdlYmtpdCkgeyBkaXNwbGF5LnNjcm9sbGVyLmRyYWdnYWJsZSA9IHRydWU7IH1cbiAgY20uc3RhdGUuZHJhZ2dpbmdUZXh0ID0gZHJhZ0VuZDtcbiAgZHJhZ0VuZC5jb3B5ID0gbWFjID8gZS5hbHRLZXkgOiBlLmN0cmxLZXk7XG4gIC8vIElFJ3MgYXBwcm9hY2ggdG8gZHJhZ2dhYmxlXG4gIGlmIChkaXNwbGF5LnNjcm9sbGVyLmRyYWdEcm9wKSB7IGRpc3BsYXkuc2Nyb2xsZXIuZHJhZ0Ryb3AoKTsgfVxuICBvbihkb2N1bWVudCwgXCJtb3VzZXVwXCIsIGRyYWdFbmQpO1xuICBvbihkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgbW91c2VNb3ZlKTtcbiAgb24oZGlzcGxheS5zY3JvbGxlciwgXCJkcmFnc3RhcnRcIiwgZHJhZ1N0YXJ0KTtcbiAgb24oZGlzcGxheS5zY3JvbGxlciwgXCJkcm9wXCIsIGRyYWdFbmQpO1xuXG4gIGRlbGF5Qmx1ckV2ZW50KGNtKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiBkaXNwbGF5LmlucHV0LmZvY3VzKCk7IH0sIDIwKTtcbn1cblxuLy8gTm9ybWFsIHNlbGVjdGlvbiwgYXMgb3Bwb3NlZCB0byB0ZXh0IGRyYWdnaW5nLlxuZnVuY3Rpb24gbGVmdEJ1dHRvblNlbGVjdChjbSwgZSwgc3RhcnQsIHR5cGUsIGFkZE5ldykge1xuICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGRvYyA9IGNtLmRvYztcbiAgZV9wcmV2ZW50RGVmYXVsdChlKTtcblxuICB2YXIgb3VyUmFuZ2UsIG91ckluZGV4LCBzdGFydFNlbCA9IGRvYy5zZWwsIHJhbmdlcyA9IHN0YXJ0U2VsLnJhbmdlcztcbiAgaWYgKGFkZE5ldyAmJiAhZS5zaGlmdEtleSkge1xuICAgIG91ckluZGV4ID0gZG9jLnNlbC5jb250YWlucyhzdGFydCk7XG4gICAgaWYgKG91ckluZGV4ID4gLTEpXG4gICAgICB7IG91clJhbmdlID0gcmFuZ2VzW291ckluZGV4XTsgfVxuICAgIGVsc2VcbiAgICAgIHsgb3VyUmFuZ2UgPSBuZXcgUmFuZ2Uoc3RhcnQsIHN0YXJ0KTsgfVxuICB9IGVsc2Uge1xuICAgIG91clJhbmdlID0gZG9jLnNlbC5wcmltYXJ5KCk7XG4gICAgb3VySW5kZXggPSBkb2Muc2VsLnByaW1JbmRleDtcbiAgfVxuXG4gIGlmIChjaHJvbWVPUyA/IGUuc2hpZnRLZXkgJiYgZS5tZXRhS2V5IDogZS5hbHRLZXkpIHtcbiAgICB0eXBlID0gXCJyZWN0XCI7XG4gICAgaWYgKCFhZGROZXcpIHsgb3VyUmFuZ2UgPSBuZXcgUmFuZ2Uoc3RhcnQsIHN0YXJ0KTsgfVxuICAgIHN0YXJ0ID0gcG9zRnJvbU1vdXNlKGNtLCBlLCB0cnVlLCB0cnVlKTtcbiAgICBvdXJJbmRleCA9IC0xO1xuICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJkb3VibGVcIikge1xuICAgIHZhciB3b3JkID0gY20uZmluZFdvcmRBdChzdGFydCk7XG4gICAgaWYgKGNtLmRpc3BsYXkuc2hpZnQgfHwgZG9jLmV4dGVuZClcbiAgICAgIHsgb3VyUmFuZ2UgPSBleHRlbmRSYW5nZShkb2MsIG91clJhbmdlLCB3b3JkLmFuY2hvciwgd29yZC5oZWFkKTsgfVxuICAgIGVsc2VcbiAgICAgIHsgb3VyUmFuZ2UgPSB3b3JkOyB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PSBcInRyaXBsZVwiKSB7XG4gICAgdmFyIGxpbmUgPSBuZXcgUmFuZ2UoUG9zKHN0YXJ0LmxpbmUsIDApLCBjbGlwUG9zKGRvYywgUG9zKHN0YXJ0LmxpbmUgKyAxLCAwKSkpO1xuICAgIGlmIChjbS5kaXNwbGF5LnNoaWZ0IHx8IGRvYy5leHRlbmQpXG4gICAgICB7IG91clJhbmdlID0gZXh0ZW5kUmFuZ2UoZG9jLCBvdXJSYW5nZSwgbGluZS5hbmNob3IsIGxpbmUuaGVhZCk7IH1cbiAgICBlbHNlXG4gICAgICB7IG91clJhbmdlID0gbGluZTsgfVxuICB9IGVsc2Uge1xuICAgIG91clJhbmdlID0gZXh0ZW5kUmFuZ2UoZG9jLCBvdXJSYW5nZSwgc3RhcnQpO1xuICB9XG5cbiAgaWYgKCFhZGROZXcpIHtcbiAgICBvdXJJbmRleCA9IDA7XG4gICAgc2V0U2VsZWN0aW9uKGRvYywgbmV3IFNlbGVjdGlvbihbb3VyUmFuZ2VdLCAwKSwgc2VsX21vdXNlKTtcbiAgICBzdGFydFNlbCA9IGRvYy5zZWw7XG4gIH0gZWxzZSBpZiAob3VySW5kZXggPT0gLTEpIHtcbiAgICBvdXJJbmRleCA9IHJhbmdlcy5sZW5ndGg7XG4gICAgc2V0U2VsZWN0aW9uKGRvYywgbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcy5jb25jYXQoW291clJhbmdlXSksIG91ckluZGV4KSxcbiAgICAgICAgICAgICAgICAge3Njcm9sbDogZmFsc2UsIG9yaWdpbjogXCIqbW91c2VcIn0pO1xuICB9IGVsc2UgaWYgKHJhbmdlcy5sZW5ndGggPiAxICYmIHJhbmdlc1tvdXJJbmRleF0uZW1wdHkoKSAmJiB0eXBlID09IFwic2luZ2xlXCIgJiYgIWUuc2hpZnRLZXkpIHtcbiAgICBzZXRTZWxlY3Rpb24oZG9jLCBub3JtYWxpemVTZWxlY3Rpb24ocmFuZ2VzLnNsaWNlKDAsIG91ckluZGV4KS5jb25jYXQocmFuZ2VzLnNsaWNlKG91ckluZGV4ICsgMSkpLCAwKSxcbiAgICAgICAgICAgICAgICAge3Njcm9sbDogZmFsc2UsIG9yaWdpbjogXCIqbW91c2VcIn0pO1xuICAgIHN0YXJ0U2VsID0gZG9jLnNlbDtcbiAgfSBlbHNlIHtcbiAgICByZXBsYWNlT25lU2VsZWN0aW9uKGRvYywgb3VySW5kZXgsIG91clJhbmdlLCBzZWxfbW91c2UpO1xuICB9XG5cbiAgdmFyIGxhc3RQb3MgPSBzdGFydDtcbiAgZnVuY3Rpb24gZXh0ZW5kVG8ocG9zKSB7XG4gICAgaWYgKGNtcChsYXN0UG9zLCBwb3MpID09IDApIHsgcmV0dXJuIH1cbiAgICBsYXN0UG9zID0gcG9zO1xuXG4gICAgaWYgKHR5cGUgPT0gXCJyZWN0XCIpIHtcbiAgICAgIHZhciByYW5nZXMgPSBbXSwgdGFiU2l6ZSA9IGNtLm9wdGlvbnMudGFiU2l6ZTtcbiAgICAgIHZhciBzdGFydENvbCA9IGNvdW50Q29sdW1uKGdldExpbmUoZG9jLCBzdGFydC5saW5lKS50ZXh0LCBzdGFydC5jaCwgdGFiU2l6ZSk7XG4gICAgICB2YXIgcG9zQ29sID0gY291bnRDb2x1bW4oZ2V0TGluZShkb2MsIHBvcy5saW5lKS50ZXh0LCBwb3MuY2gsIHRhYlNpemUpO1xuICAgICAgdmFyIGxlZnQgPSBNYXRoLm1pbihzdGFydENvbCwgcG9zQ29sKSwgcmlnaHQgPSBNYXRoLm1heChzdGFydENvbCwgcG9zQ29sKTtcbiAgICAgIGZvciAodmFyIGxpbmUgPSBNYXRoLm1pbihzdGFydC5saW5lLCBwb3MubGluZSksIGVuZCA9IE1hdGgubWluKGNtLmxhc3RMaW5lKCksIE1hdGgubWF4KHN0YXJ0LmxpbmUsIHBvcy5saW5lKSk7XG4gICAgICAgICAgIGxpbmUgPD0gZW5kOyBsaW5lKyspIHtcbiAgICAgICAgdmFyIHRleHQgPSBnZXRMaW5lKGRvYywgbGluZSkudGV4dCwgbGVmdFBvcyA9IGZpbmRDb2x1bW4odGV4dCwgbGVmdCwgdGFiU2l6ZSk7XG4gICAgICAgIGlmIChsZWZ0ID09IHJpZ2h0KVxuICAgICAgICAgIHsgcmFuZ2VzLnB1c2gobmV3IFJhbmdlKFBvcyhsaW5lLCBsZWZ0UG9zKSwgUG9zKGxpbmUsIGxlZnRQb3MpKSk7IH1cbiAgICAgICAgZWxzZSBpZiAodGV4dC5sZW5ndGggPiBsZWZ0UG9zKVxuICAgICAgICAgIHsgcmFuZ2VzLnB1c2gobmV3IFJhbmdlKFBvcyhsaW5lLCBsZWZ0UG9zKSwgUG9zKGxpbmUsIGZpbmRDb2x1bW4odGV4dCwgcmlnaHQsIHRhYlNpemUpKSkpOyB9XG4gICAgICB9XG4gICAgICBpZiAoIXJhbmdlcy5sZW5ndGgpIHsgcmFuZ2VzLnB1c2gobmV3IFJhbmdlKHN0YXJ0LCBzdGFydCkpOyB9XG4gICAgICBzZXRTZWxlY3Rpb24oZG9jLCBub3JtYWxpemVTZWxlY3Rpb24oc3RhcnRTZWwucmFuZ2VzLnNsaWNlKDAsIG91ckluZGV4KS5jb25jYXQocmFuZ2VzKSwgb3VySW5kZXgpLFxuICAgICAgICAgICAgICAgICAgIHtvcmlnaW46IFwiKm1vdXNlXCIsIHNjcm9sbDogZmFsc2V9KTtcbiAgICAgIGNtLnNjcm9sbEludG9WaWV3KHBvcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBvbGRSYW5nZSA9IG91clJhbmdlO1xuICAgICAgdmFyIGFuY2hvciA9IG9sZFJhbmdlLmFuY2hvciwgaGVhZCA9IHBvcztcbiAgICAgIGlmICh0eXBlICE9IFwic2luZ2xlXCIpIHtcbiAgICAgICAgdmFyIHJhbmdlJCQxO1xuICAgICAgICBpZiAodHlwZSA9PSBcImRvdWJsZVwiKVxuICAgICAgICAgIHsgcmFuZ2UkJDEgPSBjbS5maW5kV29yZEF0KHBvcyk7IH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIHsgcmFuZ2UkJDEgPSBuZXcgUmFuZ2UoUG9zKHBvcy5saW5lLCAwKSwgY2xpcFBvcyhkb2MsIFBvcyhwb3MubGluZSArIDEsIDApKSk7IH1cbiAgICAgICAgaWYgKGNtcChyYW5nZSQkMS5hbmNob3IsIGFuY2hvcikgPiAwKSB7XG4gICAgICAgICAgaGVhZCA9IHJhbmdlJCQxLmhlYWQ7XG4gICAgICAgICAgYW5jaG9yID0gbWluUG9zKG9sZFJhbmdlLmZyb20oKSwgcmFuZ2UkJDEuYW5jaG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoZWFkID0gcmFuZ2UkJDEuYW5jaG9yO1xuICAgICAgICAgIGFuY2hvciA9IG1heFBvcyhvbGRSYW5nZS50bygpLCByYW5nZSQkMS5oZWFkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHJhbmdlcyQxID0gc3RhcnRTZWwucmFuZ2VzLnNsaWNlKDApO1xuICAgICAgcmFuZ2VzJDFbb3VySW5kZXhdID0gbmV3IFJhbmdlKGNsaXBQb3MoZG9jLCBhbmNob3IpLCBoZWFkKTtcbiAgICAgIHNldFNlbGVjdGlvbihkb2MsIG5vcm1hbGl6ZVNlbGVjdGlvbihyYW5nZXMkMSwgb3VySW5kZXgpLCBzZWxfbW91c2UpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBlZGl0b3JTaXplID0gZGlzcGxheS53cmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAvLyBVc2VkIHRvIGVuc3VyZSB0aW1lb3V0IHJlLXRyaWVzIGRvbid0IGZpcmUgd2hlbiBhbm90aGVyIGV4dGVuZFxuICAvLyBoYXBwZW5lZCBpbiB0aGUgbWVhbnRpbWUgKGNsZWFyVGltZW91dCBpc24ndCByZWxpYWJsZSAtLSBhdFxuICAvLyBsZWFzdCBvbiBDaHJvbWUsIHRoZSB0aW1lb3V0cyBzdGlsbCBoYXBwZW4gZXZlbiB3aGVuIGNsZWFyZWQsXG4gIC8vIGlmIHRoZSBjbGVhciBoYXBwZW5zIGFmdGVyIHRoZWlyIHNjaGVkdWxlZCBmaXJpbmcgdGltZSkuXG4gIHZhciBjb3VudGVyID0gMDtcblxuICBmdW5jdGlvbiBleHRlbmQoZSkge1xuICAgIHZhciBjdXJDb3VudCA9ICsrY291bnRlcjtcbiAgICB2YXIgY3VyID0gcG9zRnJvbU1vdXNlKGNtLCBlLCB0cnVlLCB0eXBlID09IFwicmVjdFwiKTtcbiAgICBpZiAoIWN1cikgeyByZXR1cm4gfVxuICAgIGlmIChjbXAoY3VyLCBsYXN0UG9zKSAhPSAwKSB7XG4gICAgICBjbS5jdXJPcC5mb2N1cyA9IGFjdGl2ZUVsdCgpO1xuICAgICAgZXh0ZW5kVG8oY3VyKTtcbiAgICAgIHZhciB2aXNpYmxlID0gdmlzaWJsZUxpbmVzKGRpc3BsYXksIGRvYyk7XG4gICAgICBpZiAoY3VyLmxpbmUgPj0gdmlzaWJsZS50byB8fCBjdXIubGluZSA8IHZpc2libGUuZnJvbSlcbiAgICAgICAgeyBzZXRUaW1lb3V0KG9wZXJhdGlvbihjbSwgZnVuY3Rpb24gKCkge2lmIChjb3VudGVyID09IGN1ckNvdW50KSB7IGV4dGVuZChlKTsgfX0pLCAxNTApOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBvdXRzaWRlID0gZS5jbGllbnRZIDwgZWRpdG9yU2l6ZS50b3AgPyAtMjAgOiBlLmNsaWVudFkgPiBlZGl0b3JTaXplLmJvdHRvbSA/IDIwIDogMDtcbiAgICAgIGlmIChvdXRzaWRlKSB7IHNldFRpbWVvdXQob3BlcmF0aW9uKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChjb3VudGVyICE9IGN1ckNvdW50KSB7IHJldHVybiB9XG4gICAgICAgIGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wICs9IG91dHNpZGU7XG4gICAgICAgIGV4dGVuZChlKTtcbiAgICAgIH0pLCA1MCk7IH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkb25lKGUpIHtcbiAgICBjbS5zdGF0ZS5zZWxlY3RpbmdUZXh0ID0gZmFsc2U7XG4gICAgY291bnRlciA9IEluZmluaXR5O1xuICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgZGlzcGxheS5pbnB1dC5mb2N1cygpO1xuICAgIG9mZihkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgbW92ZSk7XG4gICAgb2ZmKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgdXApO1xuICAgIGRvYy5oaXN0b3J5Lmxhc3RTZWxPcmlnaW4gPSBudWxsO1xuICB9XG5cbiAgdmFyIG1vdmUgPSBvcGVyYXRpb24oY20sIGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCFlX2J1dHRvbihlKSkgeyBkb25lKGUpOyB9XG4gICAgZWxzZSB7IGV4dGVuZChlKTsgfVxuICB9KTtcbiAgdmFyIHVwID0gb3BlcmF0aW9uKGNtLCBkb25lKTtcbiAgY20uc3RhdGUuc2VsZWN0aW5nVGV4dCA9IHVwO1xuICBvbihkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgbW92ZSk7XG4gIG9uKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgdXApO1xufVxuXG5cbi8vIERldGVybWluZXMgd2hldGhlciBhbiBldmVudCBoYXBwZW5lZCBpbiB0aGUgZ3V0dGVyLCBhbmQgZmlyZXMgdGhlXG4vLyBoYW5kbGVycyBmb3IgdGhlIGNvcnJlc3BvbmRpbmcgZXZlbnQuXG5mdW5jdGlvbiBndXR0ZXJFdmVudChjbSwgZSwgdHlwZSwgcHJldmVudCkge1xuICB2YXIgbVgsIG1ZO1xuICB0cnkgeyBtWCA9IGUuY2xpZW50WDsgbVkgPSBlLmNsaWVudFk7IH1cbiAgY2F0Y2goZSkgeyByZXR1cm4gZmFsc2UgfVxuICBpZiAobVggPj0gTWF0aC5mbG9vcihjbS5kaXNwbGF5Lmd1dHRlcnMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQpKSB7IHJldHVybiBmYWxzZSB9XG4gIGlmIChwcmV2ZW50KSB7IGVfcHJldmVudERlZmF1bHQoZSk7IH1cblxuICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gIHZhciBsaW5lQm94ID0gZGlzcGxheS5saW5lRGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gIGlmIChtWSA+IGxpbmVCb3guYm90dG9tIHx8ICFoYXNIYW5kbGVyKGNtLCB0eXBlKSkgeyByZXR1cm4gZV9kZWZhdWx0UHJldmVudGVkKGUpIH1cbiAgbVkgLT0gbGluZUJveC50b3AgLSBkaXNwbGF5LnZpZXdPZmZzZXQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbS5vcHRpb25zLmd1dHRlcnMubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgZyA9IGRpc3BsYXkuZ3V0dGVycy5jaGlsZE5vZGVzW2ldO1xuICAgIGlmIChnICYmIGcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgPj0gbVgpIHtcbiAgICAgIHZhciBsaW5lID0gbGluZUF0SGVpZ2h0KGNtLmRvYywgbVkpO1xuICAgICAgdmFyIGd1dHRlciA9IGNtLm9wdGlvbnMuZ3V0dGVyc1tpXTtcbiAgICAgIHNpZ25hbChjbSwgdHlwZSwgY20sIGxpbmUsIGd1dHRlciwgZSk7XG4gICAgICByZXR1cm4gZV9kZWZhdWx0UHJldmVudGVkKGUpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNsaWNrSW5HdXR0ZXIoY20sIGUpIHtcbiAgcmV0dXJuIGd1dHRlckV2ZW50KGNtLCBlLCBcImd1dHRlckNsaWNrXCIsIHRydWUpXG59XG5cbi8vIENPTlRFWFQgTUVOVSBIQU5ETElOR1xuXG4vLyBUbyBtYWtlIHRoZSBjb250ZXh0IG1lbnUgd29yaywgd2UgbmVlZCB0byBicmllZmx5IHVuaGlkZSB0aGVcbi8vIHRleHRhcmVhIChtYWtpbmcgaXQgYXMgdW5vYnRydXNpdmUgYXMgcG9zc2libGUpIHRvIGxldCB0aGVcbi8vIHJpZ2h0LWNsaWNrIHRha2UgZWZmZWN0IG9uIGl0LlxuZnVuY3Rpb24gb25Db250ZXh0TWVudShjbSwgZSkge1xuICBpZiAoZXZlbnRJbldpZGdldChjbS5kaXNwbGF5LCBlKSB8fCBjb250ZXh0TWVudUluR3V0dGVyKGNtLCBlKSkgeyByZXR1cm4gfVxuICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUsIFwiY29udGV4dG1lbnVcIikpIHsgcmV0dXJuIH1cbiAgY20uZGlzcGxheS5pbnB1dC5vbkNvbnRleHRNZW51KGUpO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0TWVudUluR3V0dGVyKGNtLCBlKSB7XG4gIGlmICghaGFzSGFuZGxlcihjbSwgXCJndXR0ZXJDb250ZXh0TWVudVwiKSkgeyByZXR1cm4gZmFsc2UgfVxuICByZXR1cm4gZ3V0dGVyRXZlbnQoY20sIGUsIFwiZ3V0dGVyQ29udGV4dE1lbnVcIiwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHRoZW1lQ2hhbmdlZChjbSkge1xuICBjbS5kaXNwbGF5LndyYXBwZXIuY2xhc3NOYW1lID0gY20uZGlzcGxheS53cmFwcGVyLmNsYXNzTmFtZS5yZXBsYWNlKC9cXHMqY20tcy1cXFMrL2csIFwiXCIpICtcbiAgICBjbS5vcHRpb25zLnRoZW1lLnJlcGxhY2UoLyhefFxccylcXHMqL2csIFwiIGNtLXMtXCIpO1xuICBjbGVhckNhY2hlcyhjbSk7XG59XG5cbnZhciBJbml0ID0ge3RvU3RyaW5nOiBmdW5jdGlvbigpe3JldHVybiBcIkNvZGVNaXJyb3IuSW5pdFwifX07XG5cbnZhciBkZWZhdWx0cyA9IHt9O1xudmFyIG9wdGlvbkhhbmRsZXJzID0ge307XG5cbmZ1bmN0aW9uIGRlZmluZU9wdGlvbnMoQ29kZU1pcnJvcikge1xuICB2YXIgb3B0aW9uSGFuZGxlcnMgPSBDb2RlTWlycm9yLm9wdGlvbkhhbmRsZXJzO1xuXG4gIGZ1bmN0aW9uIG9wdGlvbihuYW1lLCBkZWZsdCwgaGFuZGxlLCBub3RPbkluaXQpIHtcbiAgICBDb2RlTWlycm9yLmRlZmF1bHRzW25hbWVdID0gZGVmbHQ7XG4gICAgaWYgKGhhbmRsZSkgeyBvcHRpb25IYW5kbGVyc1tuYW1lXSA9XG4gICAgICBub3RPbkluaXQgPyBmdW5jdGlvbiAoY20sIHZhbCwgb2xkKSB7aWYgKG9sZCAhPSBJbml0KSB7IGhhbmRsZShjbSwgdmFsLCBvbGQpOyB9fSA6IGhhbmRsZTsgfVxuICB9XG5cbiAgQ29kZU1pcnJvci5kZWZpbmVPcHRpb24gPSBvcHRpb247XG5cbiAgLy8gUGFzc2VkIHRvIG9wdGlvbiBoYW5kbGVycyB3aGVuIHRoZXJlIGlzIG5vIG9sZCB2YWx1ZS5cbiAgQ29kZU1pcnJvci5Jbml0ID0gSW5pdDtcblxuICAvLyBUaGVzZSB0d28gYXJlLCBvbiBpbml0LCBjYWxsZWQgZnJvbSB0aGUgY29uc3RydWN0b3IgYmVjYXVzZSB0aGV5XG4gIC8vIGhhdmUgdG8gYmUgaW5pdGlhbGl6ZWQgYmVmb3JlIHRoZSBlZGl0b3IgY2FuIHN0YXJ0IGF0IGFsbC5cbiAgb3B0aW9uKFwidmFsdWVcIiwgXCJcIiwgZnVuY3Rpb24gKGNtLCB2YWwpIHsgcmV0dXJuIGNtLnNldFZhbHVlKHZhbCk7IH0sIHRydWUpO1xuICBvcHRpb24oXCJtb2RlXCIsIG51bGwsIGZ1bmN0aW9uIChjbSwgdmFsKSB7XG4gICAgY20uZG9jLm1vZGVPcHRpb24gPSB2YWw7XG4gICAgbG9hZE1vZGUoY20pO1xuICB9LCB0cnVlKTtcblxuICBvcHRpb24oXCJpbmRlbnRVbml0XCIsIDIsIGxvYWRNb2RlLCB0cnVlKTtcbiAgb3B0aW9uKFwiaW5kZW50V2l0aFRhYnNcIiwgZmFsc2UpO1xuICBvcHRpb24oXCJzbWFydEluZGVudFwiLCB0cnVlKTtcbiAgb3B0aW9uKFwidGFiU2l6ZVwiLCA0LCBmdW5jdGlvbiAoY20pIHtcbiAgICByZXNldE1vZGVTdGF0ZShjbSk7XG4gICAgY2xlYXJDYWNoZXMoY20pO1xuICAgIHJlZ0NoYW5nZShjbSk7XG4gIH0sIHRydWUpO1xuICBvcHRpb24oXCJsaW5lU2VwYXJhdG9yXCIsIG51bGwsIGZ1bmN0aW9uIChjbSwgdmFsKSB7XG4gICAgY20uZG9jLmxpbmVTZXAgPSB2YWw7XG4gICAgaWYgKCF2YWwpIHsgcmV0dXJuIH1cbiAgICB2YXIgbmV3QnJlYWtzID0gW10sIGxpbmVObyA9IGNtLmRvYy5maXJzdDtcbiAgICBjbS5kb2MuaXRlcihmdW5jdGlvbiAobGluZSkge1xuICAgICAgZm9yICh2YXIgcG9zID0gMDs7KSB7XG4gICAgICAgIHZhciBmb3VuZCA9IGxpbmUudGV4dC5pbmRleE9mKHZhbCwgcG9zKTtcbiAgICAgICAgaWYgKGZvdW5kID09IC0xKSB7IGJyZWFrIH1cbiAgICAgICAgcG9zID0gZm91bmQgKyB2YWwubGVuZ3RoO1xuICAgICAgICBuZXdCcmVha3MucHVzaChQb3MobGluZU5vLCBmb3VuZCkpO1xuICAgICAgfVxuICAgICAgbGluZU5vKys7XG4gICAgfSk7XG4gICAgZm9yICh2YXIgaSA9IG5ld0JyZWFrcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcbiAgICAgIHsgcmVwbGFjZVJhbmdlKGNtLmRvYywgdmFsLCBuZXdCcmVha3NbaV0sIFBvcyhuZXdCcmVha3NbaV0ubGluZSwgbmV3QnJlYWtzW2ldLmNoICsgdmFsLmxlbmd0aCkpOyB9XG4gIH0pO1xuICBvcHRpb24oXCJzcGVjaWFsQ2hhcnNcIiwgL1tcXHUwMDAwLVxcdTAwMWZcXHUwMDdmLVxcdTAwOWZcXHUwMGFkXFx1MDYxY1xcdTIwMGItXFx1MjAwZlxcdTIwMjhcXHUyMDI5XFx1ZmVmZl0vZywgZnVuY3Rpb24gKGNtLCB2YWwsIG9sZCkge1xuICAgIGNtLnN0YXRlLnNwZWNpYWxDaGFycyA9IG5ldyBSZWdFeHAodmFsLnNvdXJjZSArICh2YWwudGVzdChcIlxcdFwiKSA/IFwiXCIgOiBcInxcXHRcIiksIFwiZ1wiKTtcbiAgICBpZiAob2xkICE9IEluaXQpIHsgY20ucmVmcmVzaCgpOyB9XG4gIH0pO1xuICBvcHRpb24oXCJzcGVjaWFsQ2hhclBsYWNlaG9sZGVyXCIsIGRlZmF1bHRTcGVjaWFsQ2hhclBsYWNlaG9sZGVyLCBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLnJlZnJlc2goKTsgfSwgdHJ1ZSk7XG4gIG9wdGlvbihcImVsZWN0cmljQ2hhcnNcIiwgdHJ1ZSk7XG4gIG9wdGlvbihcImlucHV0U3R5bGVcIiwgbW9iaWxlID8gXCJjb250ZW50ZWRpdGFibGVcIiA6IFwidGV4dGFyZWFcIiwgZnVuY3Rpb24gKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImlucHV0U3R5bGUgY2FuIG5vdCAoeWV0KSBiZSBjaGFuZ2VkIGluIGEgcnVubmluZyBlZGl0b3JcIikgLy8gRklYTUVcbiAgfSwgdHJ1ZSk7XG4gIG9wdGlvbihcInNwZWxsY2hlY2tcIiwgZmFsc2UsIGZ1bmN0aW9uIChjbSwgdmFsKSB7IHJldHVybiBjbS5nZXRJbnB1dEZpZWxkKCkuc3BlbGxjaGVjayA9IHZhbDsgfSwgdHJ1ZSk7XG4gIG9wdGlvbihcInJ0bE1vdmVWaXN1YWxseVwiLCAhd2luZG93cyk7XG4gIG9wdGlvbihcIndob2xlTGluZVVwZGF0ZUJlZm9yZVwiLCB0cnVlKTtcblxuICBvcHRpb24oXCJ0aGVtZVwiLCBcImRlZmF1bHRcIiwgZnVuY3Rpb24gKGNtKSB7XG4gICAgdGhlbWVDaGFuZ2VkKGNtKTtcbiAgICBndXR0ZXJzQ2hhbmdlZChjbSk7XG4gIH0sIHRydWUpO1xuICBvcHRpb24oXCJrZXlNYXBcIiwgXCJkZWZhdWx0XCIsIGZ1bmN0aW9uIChjbSwgdmFsLCBvbGQpIHtcbiAgICB2YXIgbmV4dCA9IGdldEtleU1hcCh2YWwpO1xuICAgIHZhciBwcmV2ID0gb2xkICE9IEluaXQgJiYgZ2V0S2V5TWFwKG9sZCk7XG4gICAgaWYgKHByZXYgJiYgcHJldi5kZXRhY2gpIHsgcHJldi5kZXRhY2goY20sIG5leHQpOyB9XG4gICAgaWYgKG5leHQuYXR0YWNoKSB7IG5leHQuYXR0YWNoKGNtLCBwcmV2IHx8IG51bGwpOyB9XG4gIH0pO1xuICBvcHRpb24oXCJleHRyYUtleXNcIiwgbnVsbCk7XG5cbiAgb3B0aW9uKFwibGluZVdyYXBwaW5nXCIsIGZhbHNlLCB3cmFwcGluZ0NoYW5nZWQsIHRydWUpO1xuICBvcHRpb24oXCJndXR0ZXJzXCIsIFtdLCBmdW5jdGlvbiAoY20pIHtcbiAgICBzZXRHdXR0ZXJzRm9yTGluZU51bWJlcnMoY20ub3B0aW9ucyk7XG4gICAgZ3V0dGVyc0NoYW5nZWQoY20pO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwiZml4ZWRHdXR0ZXJcIiwgdHJ1ZSwgZnVuY3Rpb24gKGNtLCB2YWwpIHtcbiAgICBjbS5kaXNwbGF5Lmd1dHRlcnMuc3R5bGUubGVmdCA9IHZhbCA/IGNvbXBlbnNhdGVGb3JIU2Nyb2xsKGNtLmRpc3BsYXkpICsgXCJweFwiIDogXCIwXCI7XG4gICAgY20ucmVmcmVzaCgpO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwiY292ZXJHdXR0ZXJOZXh0VG9TY3JvbGxiYXJcIiwgZmFsc2UsIGZ1bmN0aW9uIChjbSkgeyByZXR1cm4gdXBkYXRlU2Nyb2xsYmFycyhjbSk7IH0sIHRydWUpO1xuICBvcHRpb24oXCJzY3JvbGxiYXJTdHlsZVwiLCBcIm5hdGl2ZVwiLCBmdW5jdGlvbiAoY20pIHtcbiAgICBpbml0U2Nyb2xsYmFycyhjbSk7XG4gICAgdXBkYXRlU2Nyb2xsYmFycyhjbSk7XG4gICAgY20uZGlzcGxheS5zY3JvbGxiYXJzLnNldFNjcm9sbFRvcChjbS5kb2Muc2Nyb2xsVG9wKTtcbiAgICBjbS5kaXNwbGF5LnNjcm9sbGJhcnMuc2V0U2Nyb2xsTGVmdChjbS5kb2Muc2Nyb2xsTGVmdCk7XG4gIH0sIHRydWUpO1xuICBvcHRpb24oXCJsaW5lTnVtYmVyc1wiLCBmYWxzZSwgZnVuY3Rpb24gKGNtKSB7XG4gICAgc2V0R3V0dGVyc0ZvckxpbmVOdW1iZXJzKGNtLm9wdGlvbnMpO1xuICAgIGd1dHRlcnNDaGFuZ2VkKGNtKTtcbiAgfSwgdHJ1ZSk7XG4gIG9wdGlvbihcImZpcnN0TGluZU51bWJlclwiLCAxLCBndXR0ZXJzQ2hhbmdlZCwgdHJ1ZSk7XG4gIG9wdGlvbihcImxpbmVOdW1iZXJGb3JtYXR0ZXJcIiwgZnVuY3Rpb24gKGludGVnZXIpIHsgcmV0dXJuIGludGVnZXI7IH0sIGd1dHRlcnNDaGFuZ2VkLCB0cnVlKTtcbiAgb3B0aW9uKFwic2hvd0N1cnNvcldoZW5TZWxlY3RpbmdcIiwgZmFsc2UsIHVwZGF0ZVNlbGVjdGlvbiwgdHJ1ZSk7XG5cbiAgb3B0aW9uKFwicmVzZXRTZWxlY3Rpb25PbkNvbnRleHRNZW51XCIsIHRydWUpO1xuICBvcHRpb24oXCJsaW5lV2lzZUNvcHlDdXRcIiwgdHJ1ZSk7XG5cbiAgb3B0aW9uKFwicmVhZE9ubHlcIiwgZmFsc2UsIGZ1bmN0aW9uIChjbSwgdmFsKSB7XG4gICAgaWYgKHZhbCA9PSBcIm5vY3Vyc29yXCIpIHtcbiAgICAgIG9uQmx1cihjbSk7XG4gICAgICBjbS5kaXNwbGF5LmlucHV0LmJsdXIoKTtcbiAgICAgIGNtLmRpc3BsYXkuZGlzYWJsZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbS5kaXNwbGF5LmRpc2FibGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGNtLmRpc3BsYXkuaW5wdXQucmVhZE9ubHlDaGFuZ2VkKHZhbCk7XG4gIH0pO1xuICBvcHRpb24oXCJkaXNhYmxlSW5wdXRcIiwgZmFsc2UsIGZ1bmN0aW9uIChjbSwgdmFsKSB7aWYgKCF2YWwpIHsgY20uZGlzcGxheS5pbnB1dC5yZXNldCgpOyB9fSwgdHJ1ZSk7XG4gIG9wdGlvbihcImRyYWdEcm9wXCIsIHRydWUsIGRyYWdEcm9wQ2hhbmdlZCk7XG4gIG9wdGlvbihcImFsbG93RHJvcEZpbGVUeXBlc1wiLCBudWxsKTtcblxuICBvcHRpb24oXCJjdXJzb3JCbGlua1JhdGVcIiwgNTMwKTtcbiAgb3B0aW9uKFwiY3Vyc29yU2Nyb2xsTWFyZ2luXCIsIDApO1xuICBvcHRpb24oXCJjdXJzb3JIZWlnaHRcIiwgMSwgdXBkYXRlU2VsZWN0aW9uLCB0cnVlKTtcbiAgb3B0aW9uKFwic2luZ2xlQ3Vyc29ySGVpZ2h0UGVyTGluZVwiLCB0cnVlLCB1cGRhdGVTZWxlY3Rpb24sIHRydWUpO1xuICBvcHRpb24oXCJ3b3JrVGltZVwiLCAxMDApO1xuICBvcHRpb24oXCJ3b3JrRGVsYXlcIiwgMTAwKTtcbiAgb3B0aW9uKFwiZmxhdHRlblNwYW5zXCIsIHRydWUsIHJlc2V0TW9kZVN0YXRlLCB0cnVlKTtcbiAgb3B0aW9uKFwiYWRkTW9kZUNsYXNzXCIsIGZhbHNlLCByZXNldE1vZGVTdGF0ZSwgdHJ1ZSk7XG4gIG9wdGlvbihcInBvbGxJbnRlcnZhbFwiLCAxMDApO1xuICBvcHRpb24oXCJ1bmRvRGVwdGhcIiwgMjAwLCBmdW5jdGlvbiAoY20sIHZhbCkgeyByZXR1cm4gY20uZG9jLmhpc3RvcnkudW5kb0RlcHRoID0gdmFsOyB9KTtcbiAgb3B0aW9uKFwiaGlzdG9yeUV2ZW50RGVsYXlcIiwgMTI1MCk7XG4gIG9wdGlvbihcInZpZXdwb3J0TWFyZ2luXCIsIDEwLCBmdW5jdGlvbiAoY20pIHsgcmV0dXJuIGNtLnJlZnJlc2goKTsgfSwgdHJ1ZSk7XG4gIG9wdGlvbihcIm1heEhpZ2hsaWdodExlbmd0aFwiLCAxMDAwMCwgcmVzZXRNb2RlU3RhdGUsIHRydWUpO1xuICBvcHRpb24oXCJtb3ZlSW5wdXRXaXRoQ3Vyc29yXCIsIHRydWUsIGZ1bmN0aW9uIChjbSwgdmFsKSB7XG4gICAgaWYgKCF2YWwpIHsgY20uZGlzcGxheS5pbnB1dC5yZXNldFBvc2l0aW9uKCk7IH1cbiAgfSk7XG5cbiAgb3B0aW9uKFwidGFiaW5kZXhcIiwgbnVsbCwgZnVuY3Rpb24gKGNtLCB2YWwpIHsgcmV0dXJuIGNtLmRpc3BsYXkuaW5wdXQuZ2V0RmllbGQoKS50YWJJbmRleCA9IHZhbCB8fCBcIlwiOyB9KTtcbiAgb3B0aW9uKFwiYXV0b2ZvY3VzXCIsIG51bGwpO1xuICBvcHRpb24oXCJkaXJlY3Rpb25cIiwgXCJsdHJcIiwgZnVuY3Rpb24gKGNtLCB2YWwpIHsgcmV0dXJuIGNtLmRvYy5zZXREaXJlY3Rpb24odmFsKTsgfSwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGd1dHRlcnNDaGFuZ2VkKGNtKSB7XG4gIHVwZGF0ZUd1dHRlcnMoY20pO1xuICByZWdDaGFuZ2UoY20pO1xuICBhbGlnbkhvcml6b250YWxseShjbSk7XG59XG5cbmZ1bmN0aW9uIGRyYWdEcm9wQ2hhbmdlZChjbSwgdmFsdWUsIG9sZCkge1xuICB2YXIgd2FzT24gPSBvbGQgJiYgb2xkICE9IEluaXQ7XG4gIGlmICghdmFsdWUgIT0gIXdhc09uKSB7XG4gICAgdmFyIGZ1bmNzID0gY20uZGlzcGxheS5kcmFnRnVuY3Rpb25zO1xuICAgIHZhciB0b2dnbGUgPSB2YWx1ZSA/IG9uIDogb2ZmO1xuICAgIHRvZ2dsZShjbS5kaXNwbGF5LnNjcm9sbGVyLCBcImRyYWdzdGFydFwiLCBmdW5jcy5zdGFydCk7XG4gICAgdG9nZ2xlKGNtLmRpc3BsYXkuc2Nyb2xsZXIsIFwiZHJhZ2VudGVyXCIsIGZ1bmNzLmVudGVyKTtcbiAgICB0b2dnbGUoY20uZGlzcGxheS5zY3JvbGxlciwgXCJkcmFnb3ZlclwiLCBmdW5jcy5vdmVyKTtcbiAgICB0b2dnbGUoY20uZGlzcGxheS5zY3JvbGxlciwgXCJkcmFnbGVhdmVcIiwgZnVuY3MubGVhdmUpO1xuICAgIHRvZ2dsZShjbS5kaXNwbGF5LnNjcm9sbGVyLCBcImRyb3BcIiwgZnVuY3MuZHJvcCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JhcHBpbmdDaGFuZ2VkKGNtKSB7XG4gIGlmIChjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgIGFkZENsYXNzKGNtLmRpc3BsYXkud3JhcHBlciwgXCJDb2RlTWlycm9yLXdyYXBcIik7XG4gICAgY20uZGlzcGxheS5zaXplci5zdHlsZS5taW5XaWR0aCA9IFwiXCI7XG4gICAgY20uZGlzcGxheS5zaXplcldpZHRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICBybUNsYXNzKGNtLmRpc3BsYXkud3JhcHBlciwgXCJDb2RlTWlycm9yLXdyYXBcIik7XG4gICAgZmluZE1heExpbmUoY20pO1xuICB9XG4gIGVzdGltYXRlTGluZUhlaWdodHMoY20pO1xuICByZWdDaGFuZ2UoY20pO1xuICBjbGVhckNhY2hlcyhjbSk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZXR1cm4gdXBkYXRlU2Nyb2xsYmFycyhjbSk7IH0sIDEwMCk7XG59XG5cbi8vIEEgQ29kZU1pcnJvciBpbnN0YW5jZSByZXByZXNlbnRzIGFuIGVkaXRvci4gVGhpcyBpcyB0aGUgb2JqZWN0XG4vLyB0aGF0IHVzZXIgY29kZSBpcyB1c3VhbGx5IGRlYWxpbmcgd2l0aC5cblxuZnVuY3Rpb24gQ29kZU1pcnJvciQxKHBsYWNlLCBvcHRpb25zKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb2RlTWlycm9yJDEpKSB7IHJldHVybiBuZXcgQ29kZU1pcnJvciQxKHBsYWNlLCBvcHRpb25zKSB9XG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyA9IG9wdGlvbnMgPyBjb3B5T2JqKG9wdGlvbnMpIDoge307XG4gIC8vIERldGVybWluZSBlZmZlY3RpdmUgb3B0aW9ucyBiYXNlZCBvbiBnaXZlbiB2YWx1ZXMgYW5kIGRlZmF1bHRzLlxuICBjb3B5T2JqKGRlZmF1bHRzLCBvcHRpb25zLCBmYWxzZSk7XG4gIHNldEd1dHRlcnNGb3JMaW5lTnVtYmVycyhvcHRpb25zKTtcblxuICB2YXIgZG9jID0gb3B0aW9ucy52YWx1ZTtcbiAgaWYgKHR5cGVvZiBkb2MgPT0gXCJzdHJpbmdcIikgeyBkb2MgPSBuZXcgRG9jKGRvYywgb3B0aW9ucy5tb2RlLCBudWxsLCBvcHRpb25zLmxpbmVTZXBhcmF0b3IsIG9wdGlvbnMuZGlyZWN0aW9uKTsgfVxuICB0aGlzLmRvYyA9IGRvYztcblxuICB2YXIgaW5wdXQgPSBuZXcgQ29kZU1pcnJvciQxLmlucHV0U3R5bGVzW29wdGlvbnMuaW5wdXRTdHlsZV0odGhpcyk7XG4gIHZhciBkaXNwbGF5ID0gdGhpcy5kaXNwbGF5ID0gbmV3IERpc3BsYXkocGxhY2UsIGRvYywgaW5wdXQpO1xuICBkaXNwbGF5LndyYXBwZXIuQ29kZU1pcnJvciA9IHRoaXM7XG4gIHVwZGF0ZUd1dHRlcnModGhpcyk7XG4gIHRoZW1lQ2hhbmdlZCh0aGlzKTtcbiAgaWYgKG9wdGlvbnMubGluZVdyYXBwaW5nKVxuICAgIHsgdGhpcy5kaXNwbGF5LndyYXBwZXIuY2xhc3NOYW1lICs9IFwiIENvZGVNaXJyb3Itd3JhcFwiOyB9XG4gIGluaXRTY3JvbGxiYXJzKHRoaXMpO1xuXG4gIHRoaXMuc3RhdGUgPSB7XG4gICAga2V5TWFwczogW10sICAvLyBzdG9yZXMgbWFwcyBhZGRlZCBieSBhZGRLZXlNYXBcbiAgICBvdmVybGF5czogW10sIC8vIGhpZ2hsaWdodGluZyBvdmVybGF5cywgYXMgYWRkZWQgYnkgYWRkT3ZlcmxheVxuICAgIG1vZGVHZW46IDAsICAgLy8gYnVtcGVkIHdoZW4gbW9kZS9vdmVybGF5IGNoYW5nZXMsIHVzZWQgdG8gaW52YWxpZGF0ZSBoaWdobGlnaHRpbmcgaW5mb1xuICAgIG92ZXJ3cml0ZTogZmFsc2UsXG4gICAgZGVsYXlpbmdCbHVyRXZlbnQ6IGZhbHNlLFxuICAgIGZvY3VzZWQ6IGZhbHNlLFxuICAgIHN1cHByZXNzRWRpdHM6IGZhbHNlLCAvLyB1c2VkIHRvIGRpc2FibGUgZWRpdGluZyBkdXJpbmcga2V5IGhhbmRsZXJzIHdoZW4gaW4gcmVhZE9ubHkgbW9kZVxuICAgIHBhc3RlSW5jb21pbmc6IGZhbHNlLCBjdXRJbmNvbWluZzogZmFsc2UsIC8vIGhlbHAgcmVjb2duaXplIHBhc3RlL2N1dCBlZGl0cyBpbiBpbnB1dC5wb2xsXG4gICAgc2VsZWN0aW5nVGV4dDogZmFsc2UsXG4gICAgZHJhZ2dpbmdUZXh0OiBmYWxzZSxcbiAgICBoaWdobGlnaHQ6IG5ldyBEZWxheWVkKCksIC8vIHN0b3JlcyBoaWdobGlnaHQgd29ya2VyIHRpbWVvdXRcbiAgICBrZXlTZXE6IG51bGwsICAvLyBVbmZpbmlzaGVkIGtleSBzZXF1ZW5jZVxuICAgIHNwZWNpYWxDaGFyczogbnVsbFxuICB9O1xuXG4gIGlmIChvcHRpb25zLmF1dG9mb2N1cyAmJiAhbW9iaWxlKSB7IGRpc3BsYXkuaW5wdXQuZm9jdXMoKTsgfVxuXG4gIC8vIE92ZXJyaWRlIG1hZ2ljIHRleHRhcmVhIGNvbnRlbnQgcmVzdG9yZSB0aGF0IElFIHNvbWV0aW1lcyBkb2VzXG4gIC8vIG9uIG91ciBoaWRkZW4gdGV4dGFyZWEgb24gcmVsb2FkXG4gIGlmIChpZSAmJiBpZV92ZXJzaW9uIDwgMTEpIHsgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzJDEuZGlzcGxheS5pbnB1dC5yZXNldCh0cnVlKTsgfSwgMjApOyB9XG5cbiAgcmVnaXN0ZXJFdmVudEhhbmRsZXJzKHRoaXMpO1xuICBlbnN1cmVHbG9iYWxIYW5kbGVycygpO1xuXG4gIHN0YXJ0T3BlcmF0aW9uKHRoaXMpO1xuICB0aGlzLmN1ck9wLmZvcmNlVXBkYXRlID0gdHJ1ZTtcbiAgYXR0YWNoRG9jKHRoaXMsIGRvYyk7XG5cbiAgaWYgKChvcHRpb25zLmF1dG9mb2N1cyAmJiAhbW9iaWxlKSB8fCB0aGlzLmhhc0ZvY3VzKCkpXG4gICAgeyBzZXRUaW1lb3V0KGJpbmQob25Gb2N1cywgdGhpcyksIDIwKTsgfVxuICBlbHNlXG4gICAgeyBvbkJsdXIodGhpcyk7IH1cblxuICBmb3IgKHZhciBvcHQgaW4gb3B0aW9uSGFuZGxlcnMpIHsgaWYgKG9wdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KG9wdCkpXG4gICAgeyBvcHRpb25IYW5kbGVyc1tvcHRdKHRoaXMkMSwgb3B0aW9uc1tvcHRdLCBJbml0KTsgfSB9XG4gIG1heWJlVXBkYXRlTGluZU51bWJlcldpZHRoKHRoaXMpO1xuICBpZiAob3B0aW9ucy5maW5pc2hJbml0KSB7IG9wdGlvbnMuZmluaXNoSW5pdCh0aGlzKTsgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRIb29rcy5sZW5ndGg7ICsraSkgeyBpbml0SG9va3NbaV0odGhpcyQxKTsgfVxuICBlbmRPcGVyYXRpb24odGhpcyk7XG4gIC8vIFN1cHByZXNzIG9wdGltaXplbGVnaWJpbGl0eSBpbiBXZWJraXQsIHNpbmNlIGl0IGJyZWFrcyB0ZXh0XG4gIC8vIG1lYXN1cmluZyBvbiBsaW5lIHdyYXBwaW5nIGJvdW5kYXJpZXMuXG4gIGlmICh3ZWJraXQgJiYgb3B0aW9ucy5saW5lV3JhcHBpbmcgJiZcbiAgICAgIGdldENvbXB1dGVkU3R5bGUoZGlzcGxheS5saW5lRGl2KS50ZXh0UmVuZGVyaW5nID09IFwib3B0aW1pemVsZWdpYmlsaXR5XCIpXG4gICAgeyBkaXNwbGF5LmxpbmVEaXYuc3R5bGUudGV4dFJlbmRlcmluZyA9IFwiYXV0b1wiOyB9XG59XG5cbi8vIFRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbkNvZGVNaXJyb3IkMS5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuLy8gRnVuY3Rpb25zIHRvIHJ1biB3aGVuIG9wdGlvbnMgYXJlIGNoYW5nZWQuXG5Db2RlTWlycm9yJDEub3B0aW9uSGFuZGxlcnMgPSBvcHRpb25IYW5kbGVycztcblxuLy8gQXR0YWNoIHRoZSBuZWNlc3NhcnkgZXZlbnQgaGFuZGxlcnMgd2hlbiBpbml0aWFsaXppbmcgdGhlIGVkaXRvclxuZnVuY3Rpb24gcmVnaXN0ZXJFdmVudEhhbmRsZXJzKGNtKSB7XG4gIHZhciBkID0gY20uZGlzcGxheTtcbiAgb24oZC5zY3JvbGxlciwgXCJtb3VzZWRvd25cIiwgb3BlcmF0aW9uKGNtLCBvbk1vdXNlRG93bikpO1xuICAvLyBPbGRlciBJRSdzIHdpbGwgbm90IGZpcmUgYSBzZWNvbmQgbW91c2Vkb3duIGZvciBhIGRvdWJsZSBjbGlja1xuICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA8IDExKVxuICAgIHsgb24oZC5zY3JvbGxlciwgXCJkYmxjbGlja1wiLCBvcGVyYXRpb24oY20sIGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpKSB7IHJldHVybiB9XG4gICAgICB2YXIgcG9zID0gcG9zRnJvbU1vdXNlKGNtLCBlKTtcbiAgICAgIGlmICghcG9zIHx8IGNsaWNrSW5HdXR0ZXIoY20sIGUpIHx8IGV2ZW50SW5XaWRnZXQoY20uZGlzcGxheSwgZSkpIHsgcmV0dXJuIH1cbiAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICB2YXIgd29yZCA9IGNtLmZpbmRXb3JkQXQocG9zKTtcbiAgICAgIGV4dGVuZFNlbGVjdGlvbihjbS5kb2MsIHdvcmQuYW5jaG9yLCB3b3JkLmhlYWQpO1xuICAgIH0pKTsgfVxuICBlbHNlXG4gICAgeyBvbihkLnNjcm9sbGVyLCBcImRibGNsaWNrXCIsIGZ1bmN0aW9uIChlKSB7IHJldHVybiBzaWduYWxET01FdmVudChjbSwgZSkgfHwgZV9wcmV2ZW50RGVmYXVsdChlKTsgfSk7IH1cbiAgLy8gU29tZSBicm93c2VycyBmaXJlIGNvbnRleHRtZW51ICphZnRlciogb3BlbmluZyB0aGUgbWVudSwgYXRcbiAgLy8gd2hpY2ggcG9pbnQgd2UgY2FuJ3QgbWVzcyB3aXRoIGl0IGFueW1vcmUuIENvbnRleHQgbWVudSBpc1xuICAvLyBoYW5kbGVkIGluIG9uTW91c2VEb3duIGZvciB0aGVzZSBicm93c2Vycy5cbiAgaWYgKCFjYXB0dXJlUmlnaHRDbGljaykgeyBvbihkLnNjcm9sbGVyLCBcImNvbnRleHRtZW51XCIsIGZ1bmN0aW9uIChlKSB7IHJldHVybiBvbkNvbnRleHRNZW51KGNtLCBlKTsgfSk7IH1cblxuICAvLyBVc2VkIHRvIHN1cHByZXNzIG1vdXNlIGV2ZW50IGhhbmRsaW5nIHdoZW4gYSB0b3VjaCBoYXBwZW5zXG4gIHZhciB0b3VjaEZpbmlzaGVkLCBwcmV2VG91Y2ggPSB7ZW5kOiAwfTtcbiAgZnVuY3Rpb24gZmluaXNoVG91Y2goKSB7XG4gICAgaWYgKGQuYWN0aXZlVG91Y2gpIHtcbiAgICAgIHRvdWNoRmluaXNoZWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGQuYWN0aXZlVG91Y2ggPSBudWxsOyB9LCAxMDAwKTtcbiAgICAgIHByZXZUb3VjaCA9IGQuYWN0aXZlVG91Y2g7XG4gICAgICBwcmV2VG91Y2guZW5kID0gK25ldyBEYXRlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBpc01vdXNlTGlrZVRvdWNoRXZlbnQoZSkge1xuICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoICE9IDEpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICB2YXIgdG91Y2ggPSBlLnRvdWNoZXNbMF07XG4gICAgcmV0dXJuIHRvdWNoLnJhZGl1c1ggPD0gMSAmJiB0b3VjaC5yYWRpdXNZIDw9IDFcbiAgfVxuICBmdW5jdGlvbiBmYXJBd2F5KHRvdWNoLCBvdGhlcikge1xuICAgIGlmIChvdGhlci5sZWZ0ID09IG51bGwpIHsgcmV0dXJuIHRydWUgfVxuICAgIHZhciBkeCA9IG90aGVyLmxlZnQgLSB0b3VjaC5sZWZ0LCBkeSA9IG90aGVyLnRvcCAtIHRvdWNoLnRvcDtcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHkgPiAyMCAqIDIwXG4gIH1cbiAgb24oZC5zY3JvbGxlciwgXCJ0b3VjaHN0YXJ0XCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCFzaWduYWxET01FdmVudChjbSwgZSkgJiYgIWlzTW91c2VMaWtlVG91Y2hFdmVudChlKSkge1xuICAgICAgZC5pbnB1dC5lbnN1cmVQb2xsZWQoKTtcbiAgICAgIGNsZWFyVGltZW91dCh0b3VjaEZpbmlzaGVkKTtcbiAgICAgIHZhciBub3cgPSArbmV3IERhdGU7XG4gICAgICBkLmFjdGl2ZVRvdWNoID0ge3N0YXJ0OiBub3csIG1vdmVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgcHJldjogbm93IC0gcHJldlRvdWNoLmVuZCA8PSAzMDAgPyBwcmV2VG91Y2ggOiBudWxsfTtcbiAgICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgZC5hY3RpdmVUb3VjaC5sZWZ0ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgICBkLmFjdGl2ZVRvdWNoLnRvcCA9IGUudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBvbihkLnNjcm9sbGVyLCBcInRvdWNobW92ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGQuYWN0aXZlVG91Y2gpIHsgZC5hY3RpdmVUb3VjaC5tb3ZlZCA9IHRydWU7IH1cbiAgfSk7XG4gIG9uKGQuc2Nyb2xsZXIsIFwidG91Y2hlbmRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgdG91Y2ggPSBkLmFjdGl2ZVRvdWNoO1xuICAgIGlmICh0b3VjaCAmJiAhZXZlbnRJbldpZGdldChkLCBlKSAmJiB0b3VjaC5sZWZ0ICE9IG51bGwgJiZcbiAgICAgICAgIXRvdWNoLm1vdmVkICYmIG5ldyBEYXRlIC0gdG91Y2guc3RhcnQgPCAzMDApIHtcbiAgICAgIHZhciBwb3MgPSBjbS5jb29yZHNDaGFyKGQuYWN0aXZlVG91Y2gsIFwicGFnZVwiKSwgcmFuZ2U7XG4gICAgICBpZiAoIXRvdWNoLnByZXYgfHwgZmFyQXdheSh0b3VjaCwgdG91Y2gucHJldikpIC8vIFNpbmdsZSB0YXBcbiAgICAgICAgeyByYW5nZSA9IG5ldyBSYW5nZShwb3MsIHBvcyk7IH1cbiAgICAgIGVsc2UgaWYgKCF0b3VjaC5wcmV2LnByZXYgfHwgZmFyQXdheSh0b3VjaCwgdG91Y2gucHJldi5wcmV2KSkgLy8gRG91YmxlIHRhcFxuICAgICAgICB7IHJhbmdlID0gY20uZmluZFdvcmRBdChwb3MpOyB9XG4gICAgICBlbHNlIC8vIFRyaXBsZSB0YXBcbiAgICAgICAgeyByYW5nZSA9IG5ldyBSYW5nZShQb3MocG9zLmxpbmUsIDApLCBjbGlwUG9zKGNtLmRvYywgUG9zKHBvcy5saW5lICsgMSwgMCkpKTsgfVxuICAgICAgY20uc2V0U2VsZWN0aW9uKHJhbmdlLmFuY2hvciwgcmFuZ2UuaGVhZCk7XG4gICAgICBjbS5mb2N1cygpO1xuICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICB9XG4gICAgZmluaXNoVG91Y2goKTtcbiAgfSk7XG4gIG9uKGQuc2Nyb2xsZXIsIFwidG91Y2hjYW5jZWxcIiwgZmluaXNoVG91Y2gpO1xuXG4gIC8vIFN5bmMgc2Nyb2xsaW5nIGJldHdlZW4gZmFrZSBzY3JvbGxiYXJzIGFuZCByZWFsIHNjcm9sbGFibGVcbiAgLy8gYXJlYSwgZW5zdXJlIHZpZXdwb3J0IGlzIHVwZGF0ZWQgd2hlbiBzY3JvbGxpbmcuXG4gIG9uKGQuc2Nyb2xsZXIsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZC5zY3JvbGxlci5jbGllbnRIZWlnaHQpIHtcbiAgICAgIHVwZGF0ZVNjcm9sbFRvcChjbSwgZC5zY3JvbGxlci5zY3JvbGxUb3ApO1xuICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgZC5zY3JvbGxlci5zY3JvbGxMZWZ0LCB0cnVlKTtcbiAgICAgIHNpZ25hbChjbSwgXCJzY3JvbGxcIiwgY20pO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gTGlzdGVuIHRvIHdoZWVsIGV2ZW50cyBpbiBvcmRlciB0byB0cnkgYW5kIHVwZGF0ZSB0aGUgdmlld3BvcnQgb24gdGltZS5cbiAgb24oZC5zY3JvbGxlciwgXCJtb3VzZXdoZWVsXCIsIGZ1bmN0aW9uIChlKSB7IHJldHVybiBvblNjcm9sbFdoZWVsKGNtLCBlKTsgfSk7XG4gIG9uKGQuc2Nyb2xsZXIsIFwiRE9NTW91c2VTY3JvbGxcIiwgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIG9uU2Nyb2xsV2hlZWwoY20sIGUpOyB9KTtcblxuICAvLyBQcmV2ZW50IHdyYXBwZXIgZnJvbSBldmVyIHNjcm9sbGluZ1xuICBvbihkLndyYXBwZXIsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIGQud3JhcHBlci5zY3JvbGxUb3AgPSBkLndyYXBwZXIuc2Nyb2xsTGVmdCA9IDA7IH0pO1xuXG4gIGQuZHJhZ0Z1bmN0aW9ucyA9IHtcbiAgICBlbnRlcjogZnVuY3Rpb24gKGUpIHtpZiAoIXNpZ25hbERPTUV2ZW50KGNtLCBlKSkgeyBlX3N0b3AoZSk7IH19LFxuICAgIG92ZXI6IGZ1bmN0aW9uIChlKSB7aWYgKCFzaWduYWxET01FdmVudChjbSwgZSkpIHsgb25EcmFnT3ZlcihjbSwgZSk7IGVfc3RvcChlKTsgfX0sXG4gICAgc3RhcnQ6IGZ1bmN0aW9uIChlKSB7IHJldHVybiBvbkRyYWdTdGFydChjbSwgZSk7IH0sXG4gICAgZHJvcDogb3BlcmF0aW9uKGNtLCBvbkRyb3ApLFxuICAgIGxlYXZlOiBmdW5jdGlvbiAoZSkge2lmICghc2lnbmFsRE9NRXZlbnQoY20sIGUpKSB7IGNsZWFyRHJhZ0N1cnNvcihjbSk7IH19XG4gIH07XG5cbiAgdmFyIGlucCA9IGQuaW5wdXQuZ2V0RmllbGQoKTtcbiAgb24oaW5wLCBcImtleXVwXCIsIGZ1bmN0aW9uIChlKSB7IHJldHVybiBvbktleVVwLmNhbGwoY20sIGUpOyB9KTtcbiAgb24oaW5wLCBcImtleWRvd25cIiwgb3BlcmF0aW9uKGNtLCBvbktleURvd24pKTtcbiAgb24oaW5wLCBcImtleXByZXNzXCIsIG9wZXJhdGlvbihjbSwgb25LZXlQcmVzcykpO1xuICBvbihpbnAsIFwiZm9jdXNcIiwgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIG9uRm9jdXMoY20sIGUpOyB9KTtcbiAgb24oaW5wLCBcImJsdXJcIiwgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIG9uQmx1cihjbSwgZSk7IH0pO1xufVxuXG52YXIgaW5pdEhvb2tzID0gW107XG5Db2RlTWlycm9yJDEuZGVmaW5lSW5pdEhvb2sgPSBmdW5jdGlvbiAoZikgeyByZXR1cm4gaW5pdEhvb2tzLnB1c2goZik7IH07XG5cbi8vIEluZGVudCB0aGUgZ2l2ZW4gbGluZS4gVGhlIGhvdyBwYXJhbWV0ZXIgY2FuIGJlIFwic21hcnRcIixcbi8vIFwiYWRkXCIvbnVsbCwgXCJzdWJ0cmFjdFwiLCBvciBcInByZXZcIi4gV2hlbiBhZ2dyZXNzaXZlIGlzIGZhbHNlXG4vLyAodHlwaWNhbGx5IHNldCB0byB0cnVlIGZvciBmb3JjZWQgc2luZ2xlLWxpbmUgaW5kZW50cyksIGVtcHR5XG4vLyBsaW5lcyBhcmUgbm90IGluZGVudGVkLCBhbmQgcGxhY2VzIHdoZXJlIHRoZSBtb2RlIHJldHVybnMgUGFzc1xuLy8gYXJlIGxlZnQgYWxvbmUuXG5mdW5jdGlvbiBpbmRlbnRMaW5lKGNtLCBuLCBob3csIGFnZ3Jlc3NpdmUpIHtcbiAgdmFyIGRvYyA9IGNtLmRvYywgc3RhdGU7XG4gIGlmIChob3cgPT0gbnVsbCkgeyBob3cgPSBcImFkZFwiOyB9XG4gIGlmIChob3cgPT0gXCJzbWFydFwiKSB7XG4gICAgLy8gRmFsbCBiYWNrIHRvIFwicHJldlwiIHdoZW4gdGhlIG1vZGUgZG9lc24ndCBoYXZlIGFuIGluZGVudGF0aW9uXG4gICAgLy8gbWV0aG9kLlxuICAgIGlmICghZG9jLm1vZGUuaW5kZW50KSB7IGhvdyA9IFwicHJldlwiOyB9XG4gICAgZWxzZSB7IHN0YXRlID0gZ2V0U3RhdGVCZWZvcmUoY20sIG4pOyB9XG4gIH1cblxuICB2YXIgdGFiU2l6ZSA9IGNtLm9wdGlvbnMudGFiU2l6ZTtcbiAgdmFyIGxpbmUgPSBnZXRMaW5lKGRvYywgbiksIGN1clNwYWNlID0gY291bnRDb2x1bW4obGluZS50ZXh0LCBudWxsLCB0YWJTaXplKTtcbiAgaWYgKGxpbmUuc3RhdGVBZnRlcikgeyBsaW5lLnN0YXRlQWZ0ZXIgPSBudWxsOyB9XG4gIHZhciBjdXJTcGFjZVN0cmluZyA9IGxpbmUudGV4dC5tYXRjaCgvXlxccyovKVswXSwgaW5kZW50YXRpb247XG4gIGlmICghYWdncmVzc2l2ZSAmJiAhL1xcUy8udGVzdChsaW5lLnRleHQpKSB7XG4gICAgaW5kZW50YXRpb24gPSAwO1xuICAgIGhvdyA9IFwibm90XCI7XG4gIH0gZWxzZSBpZiAoaG93ID09IFwic21hcnRcIikge1xuICAgIGluZGVudGF0aW9uID0gZG9jLm1vZGUuaW5kZW50KHN0YXRlLCBsaW5lLnRleHQuc2xpY2UoY3VyU3BhY2VTdHJpbmcubGVuZ3RoKSwgbGluZS50ZXh0KTtcbiAgICBpZiAoaW5kZW50YXRpb24gPT0gUGFzcyB8fCBpbmRlbnRhdGlvbiA+IDE1MCkge1xuICAgICAgaWYgKCFhZ2dyZXNzaXZlKSB7IHJldHVybiB9XG4gICAgICBob3cgPSBcInByZXZcIjtcbiAgICB9XG4gIH1cbiAgaWYgKGhvdyA9PSBcInByZXZcIikge1xuICAgIGlmIChuID4gZG9jLmZpcnN0KSB7IGluZGVudGF0aW9uID0gY291bnRDb2x1bW4oZ2V0TGluZShkb2MsIG4tMSkudGV4dCwgbnVsbCwgdGFiU2l6ZSk7IH1cbiAgICBlbHNlIHsgaW5kZW50YXRpb24gPSAwOyB9XG4gIH0gZWxzZSBpZiAoaG93ID09IFwiYWRkXCIpIHtcbiAgICBpbmRlbnRhdGlvbiA9IGN1clNwYWNlICsgY20ub3B0aW9ucy5pbmRlbnRVbml0O1xuICB9IGVsc2UgaWYgKGhvdyA9PSBcInN1YnRyYWN0XCIpIHtcbiAgICBpbmRlbnRhdGlvbiA9IGN1clNwYWNlIC0gY20ub3B0aW9ucy5pbmRlbnRVbml0O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBob3cgPT0gXCJudW1iZXJcIikge1xuICAgIGluZGVudGF0aW9uID0gY3VyU3BhY2UgKyBob3c7XG4gIH1cbiAgaW5kZW50YXRpb24gPSBNYXRoLm1heCgwLCBpbmRlbnRhdGlvbik7XG5cbiAgdmFyIGluZGVudFN0cmluZyA9IFwiXCIsIHBvcyA9IDA7XG4gIGlmIChjbS5vcHRpb25zLmluZGVudFdpdGhUYWJzKVxuICAgIHsgZm9yICh2YXIgaSA9IE1hdGguZmxvb3IoaW5kZW50YXRpb24gLyB0YWJTaXplKTsgaTsgLS1pKSB7cG9zICs9IHRhYlNpemU7IGluZGVudFN0cmluZyArPSBcIlxcdFwiO30gfVxuICBpZiAocG9zIDwgaW5kZW50YXRpb24pIHsgaW5kZW50U3RyaW5nICs9IHNwYWNlU3RyKGluZGVudGF0aW9uIC0gcG9zKTsgfVxuXG4gIGlmIChpbmRlbnRTdHJpbmcgIT0gY3VyU3BhY2VTdHJpbmcpIHtcbiAgICByZXBsYWNlUmFuZ2UoZG9jLCBpbmRlbnRTdHJpbmcsIFBvcyhuLCAwKSwgUG9zKG4sIGN1clNwYWNlU3RyaW5nLmxlbmd0aCksIFwiK2lucHV0XCIpO1xuICAgIGxpbmUuc3RhdGVBZnRlciA9IG51bGw7XG4gICAgcmV0dXJuIHRydWVcbiAgfSBlbHNlIHtcbiAgICAvLyBFbnN1cmUgdGhhdCwgaWYgdGhlIGN1cnNvciB3YXMgaW4gdGhlIHdoaXRlc3BhY2UgYXQgdGhlIHN0YXJ0XG4gICAgLy8gb2YgdGhlIGxpbmUsIGl0IGlzIG1vdmVkIHRvIHRoZSBlbmQgb2YgdGhhdCBzcGFjZS5cbiAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBkb2Muc2VsLnJhbmdlcy5sZW5ndGg7IGkkMSsrKSB7XG4gICAgICB2YXIgcmFuZ2UgPSBkb2Muc2VsLnJhbmdlc1tpJDFdO1xuICAgICAgaWYgKHJhbmdlLmhlYWQubGluZSA9PSBuICYmIHJhbmdlLmhlYWQuY2ggPCBjdXJTcGFjZVN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHBvcyQxID0gUG9zKG4sIGN1clNwYWNlU3RyaW5nLmxlbmd0aCk7XG4gICAgICAgIHJlcGxhY2VPbmVTZWxlY3Rpb24oZG9jLCBpJDEsIG5ldyBSYW5nZShwb3MkMSwgcG9zJDEpKTtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gVGhpcyB3aWxsIGJlIHNldCB0byBhIHtsaW5lV2lzZTogYm9vbCwgdGV4dDogW3N0cmluZ119IG9iamVjdCwgc29cbi8vIHRoYXQsIHdoZW4gcGFzdGluZywgd2Uga25vdyB3aGF0IGtpbmQgb2Ygc2VsZWN0aW9ucyB0aGUgY29waWVkXG4vLyB0ZXh0IHdhcyBtYWRlIG91dCBvZi5cbnZhciBsYXN0Q29waWVkID0gbnVsbDtcblxuZnVuY3Rpb24gc2V0TGFzdENvcGllZChuZXdMYXN0Q29waWVkKSB7XG4gIGxhc3RDb3BpZWQgPSBuZXdMYXN0Q29waWVkO1xufVxuXG5mdW5jdGlvbiBhcHBseVRleHRJbnB1dChjbSwgaW5zZXJ0ZWQsIGRlbGV0ZWQsIHNlbCwgb3JpZ2luKSB7XG4gIHZhciBkb2MgPSBjbS5kb2M7XG4gIGNtLmRpc3BsYXkuc2hpZnQgPSBmYWxzZTtcbiAgaWYgKCFzZWwpIHsgc2VsID0gZG9jLnNlbDsgfVxuXG4gIHZhciBwYXN0ZSA9IGNtLnN0YXRlLnBhc3RlSW5jb21pbmcgfHwgb3JpZ2luID09IFwicGFzdGVcIjtcbiAgdmFyIHRleHRMaW5lcyA9IHNwbGl0TGluZXNBdXRvKGluc2VydGVkKSwgbXVsdGlQYXN0ZSA9IG51bGw7XG4gIC8vIFdoZW4gcGFzaW5nIE4gbGluZXMgaW50byBOIHNlbGVjdGlvbnMsIGluc2VydCBvbmUgbGluZSBwZXIgc2VsZWN0aW9uXG4gIGlmIChwYXN0ZSAmJiBzZWwucmFuZ2VzLmxlbmd0aCA+IDEpIHtcbiAgICBpZiAobGFzdENvcGllZCAmJiBsYXN0Q29waWVkLnRleHQuam9pbihcIlxcblwiKSA9PSBpbnNlcnRlZCkge1xuICAgICAgaWYgKHNlbC5yYW5nZXMubGVuZ3RoICUgbGFzdENvcGllZC50ZXh0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIG11bHRpUGFzdGUgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0Q29waWVkLnRleHQubGVuZ3RoOyBpKyspXG4gICAgICAgICAgeyBtdWx0aVBhc3RlLnB1c2goZG9jLnNwbGl0TGluZXMobGFzdENvcGllZC50ZXh0W2ldKSk7IH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRleHRMaW5lcy5sZW5ndGggPT0gc2VsLnJhbmdlcy5sZW5ndGgpIHtcbiAgICAgIG11bHRpUGFzdGUgPSBtYXAodGV4dExpbmVzLCBmdW5jdGlvbiAobCkgeyByZXR1cm4gW2xdOyB9KTtcbiAgICB9XG4gIH1cblxuICB2YXIgdXBkYXRlSW5wdXQ7XG4gIC8vIE5vcm1hbCBiZWhhdmlvciBpcyB0byBpbnNlcnQgdGhlIG5ldyB0ZXh0IGludG8gZXZlcnkgc2VsZWN0aW9uXG4gIGZvciAodmFyIGkkMSA9IHNlbC5yYW5nZXMubGVuZ3RoIC0gMTsgaSQxID49IDA7IGkkMS0tKSB7XG4gICAgdmFyIHJhbmdlJCQxID0gc2VsLnJhbmdlc1tpJDFdO1xuICAgIHZhciBmcm9tID0gcmFuZ2UkJDEuZnJvbSgpLCB0byA9IHJhbmdlJCQxLnRvKCk7XG4gICAgaWYgKHJhbmdlJCQxLmVtcHR5KCkpIHtcbiAgICAgIGlmIChkZWxldGVkICYmIGRlbGV0ZWQgPiAwKSAvLyBIYW5kbGUgZGVsZXRpb25cbiAgICAgICAgeyBmcm9tID0gUG9zKGZyb20ubGluZSwgZnJvbS5jaCAtIGRlbGV0ZWQpOyB9XG4gICAgICBlbHNlIGlmIChjbS5zdGF0ZS5vdmVyd3JpdGUgJiYgIXBhc3RlKSAvLyBIYW5kbGUgb3ZlcndyaXRlXG4gICAgICAgIHsgdG8gPSBQb3ModG8ubGluZSwgTWF0aC5taW4oZ2V0TGluZShkb2MsIHRvLmxpbmUpLnRleHQubGVuZ3RoLCB0by5jaCArIGxzdCh0ZXh0TGluZXMpLmxlbmd0aCkpOyB9XG4gICAgICBlbHNlIGlmIChsYXN0Q29waWVkICYmIGxhc3RDb3BpZWQubGluZVdpc2UgJiYgbGFzdENvcGllZC50ZXh0LmpvaW4oXCJcXG5cIikgPT0gaW5zZXJ0ZWQpXG4gICAgICAgIHsgZnJvbSA9IHRvID0gUG9zKGZyb20ubGluZSwgMCk7IH1cbiAgICB9XG4gICAgdXBkYXRlSW5wdXQgPSBjbS5jdXJPcC51cGRhdGVJbnB1dDtcbiAgICB2YXIgY2hhbmdlRXZlbnQgPSB7ZnJvbTogZnJvbSwgdG86IHRvLCB0ZXh0OiBtdWx0aVBhc3RlID8gbXVsdGlQYXN0ZVtpJDEgJSBtdWx0aVBhc3RlLmxlbmd0aF0gOiB0ZXh0TGluZXMsXG4gICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbjogb3JpZ2luIHx8IChwYXN0ZSA/IFwicGFzdGVcIiA6IGNtLnN0YXRlLmN1dEluY29taW5nID8gXCJjdXRcIiA6IFwiK2lucHV0XCIpfTtcbiAgICBtYWtlQ2hhbmdlKGNtLmRvYywgY2hhbmdlRXZlbnQpO1xuICAgIHNpZ25hbExhdGVyKGNtLCBcImlucHV0UmVhZFwiLCBjbSwgY2hhbmdlRXZlbnQpO1xuICB9XG4gIGlmIChpbnNlcnRlZCAmJiAhcGFzdGUpXG4gICAgeyB0cmlnZ2VyRWxlY3RyaWMoY20sIGluc2VydGVkKTsgfVxuXG4gIGVuc3VyZUN1cnNvclZpc2libGUoY20pO1xuICBjbS5jdXJPcC51cGRhdGVJbnB1dCA9IHVwZGF0ZUlucHV0O1xuICBjbS5jdXJPcC50eXBpbmcgPSB0cnVlO1xuICBjbS5zdGF0ZS5wYXN0ZUluY29taW5nID0gY20uc3RhdGUuY3V0SW5jb21pbmcgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUGFzdGUoZSwgY20pIHtcbiAgdmFyIHBhc3RlZCA9IGUuY2xpcGJvYXJkRGF0YSAmJiBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YShcIlRleHRcIik7XG4gIGlmIChwYXN0ZWQpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKCFjbS5pc1JlYWRPbmx5KCkgJiYgIWNtLm9wdGlvbnMuZGlzYWJsZUlucHV0KVxuICAgICAgeyBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7IHJldHVybiBhcHBseVRleHRJbnB1dChjbSwgcGFzdGVkLCAwLCBudWxsLCBcInBhc3RlXCIpOyB9KTsgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuZnVuY3Rpb24gdHJpZ2dlckVsZWN0cmljKGNtLCBpbnNlcnRlZCkge1xuICAvLyBXaGVuIGFuICdlbGVjdHJpYycgY2hhcmFjdGVyIGlzIGluc2VydGVkLCBpbW1lZGlhdGVseSB0cmlnZ2VyIGEgcmVpbmRlbnRcbiAgaWYgKCFjbS5vcHRpb25zLmVsZWN0cmljQ2hhcnMgfHwgIWNtLm9wdGlvbnMuc21hcnRJbmRlbnQpIHsgcmV0dXJuIH1cbiAgdmFyIHNlbCA9IGNtLmRvYy5zZWw7XG5cbiAgZm9yICh2YXIgaSA9IHNlbC5yYW5nZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgcmFuZ2UkJDEgPSBzZWwucmFuZ2VzW2ldO1xuICAgIGlmIChyYW5nZSQkMS5oZWFkLmNoID4gMTAwIHx8IChpICYmIHNlbC5yYW5nZXNbaSAtIDFdLmhlYWQubGluZSA9PSByYW5nZSQkMS5oZWFkLmxpbmUpKSB7IGNvbnRpbnVlIH1cbiAgICB2YXIgbW9kZSA9IGNtLmdldE1vZGVBdChyYW5nZSQkMS5oZWFkKTtcbiAgICB2YXIgaW5kZW50ZWQgPSBmYWxzZTtcbiAgICBpZiAobW9kZS5lbGVjdHJpY0NoYXJzKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1vZGUuZWxlY3RyaWNDaGFycy5sZW5ndGg7IGorKylcbiAgICAgICAgeyBpZiAoaW5zZXJ0ZWQuaW5kZXhPZihtb2RlLmVsZWN0cmljQ2hhcnMuY2hhckF0KGopKSA+IC0xKSB7XG4gICAgICAgICAgaW5kZW50ZWQgPSBpbmRlbnRMaW5lKGNtLCByYW5nZSQkMS5oZWFkLmxpbmUsIFwic21hcnRcIik7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfSB9XG4gICAgfSBlbHNlIGlmIChtb2RlLmVsZWN0cmljSW5wdXQpIHtcbiAgICAgIGlmIChtb2RlLmVsZWN0cmljSW5wdXQudGVzdChnZXRMaW5lKGNtLmRvYywgcmFuZ2UkJDEuaGVhZC5saW5lKS50ZXh0LnNsaWNlKDAsIHJhbmdlJCQxLmhlYWQuY2gpKSlcbiAgICAgICAgeyBpbmRlbnRlZCA9IGluZGVudExpbmUoY20sIHJhbmdlJCQxLmhlYWQubGluZSwgXCJzbWFydFwiKTsgfVxuICAgIH1cbiAgICBpZiAoaW5kZW50ZWQpIHsgc2lnbmFsTGF0ZXIoY20sIFwiZWxlY3RyaWNJbnB1dFwiLCBjbSwgcmFuZ2UkJDEuaGVhZC5saW5lKTsgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHlhYmxlUmFuZ2VzKGNtKSB7XG4gIHZhciB0ZXh0ID0gW10sIHJhbmdlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNtLmRvYy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxpbmUgPSBjbS5kb2Muc2VsLnJhbmdlc1tpXS5oZWFkLmxpbmU7XG4gICAgdmFyIGxpbmVSYW5nZSA9IHthbmNob3I6IFBvcyhsaW5lLCAwKSwgaGVhZDogUG9zKGxpbmUgKyAxLCAwKX07XG4gICAgcmFuZ2VzLnB1c2gobGluZVJhbmdlKTtcbiAgICB0ZXh0LnB1c2goY20uZ2V0UmFuZ2UobGluZVJhbmdlLmFuY2hvciwgbGluZVJhbmdlLmhlYWQpKTtcbiAgfVxuICByZXR1cm4ge3RleHQ6IHRleHQsIHJhbmdlczogcmFuZ2VzfVxufVxuXG5mdW5jdGlvbiBkaXNhYmxlQnJvd3Nlck1hZ2ljKGZpZWxkLCBzcGVsbGNoZWNrKSB7XG4gIGZpZWxkLnNldEF0dHJpYnV0ZShcImF1dG9jb3JyZWN0XCIsIFwib2ZmXCIpO1xuICBmaWVsZC5zZXRBdHRyaWJ1dGUoXCJhdXRvY2FwaXRhbGl6ZVwiLCBcIm9mZlwiKTtcbiAgZmllbGQuc2V0QXR0cmlidXRlKFwic3BlbGxjaGVja1wiLCAhIXNwZWxsY2hlY2spO1xufVxuXG5mdW5jdGlvbiBoaWRkZW5UZXh0YXJlYSgpIHtcbiAgdmFyIHRlID0gZWx0KFwidGV4dGFyZWFcIiwgbnVsbCwgbnVsbCwgXCJwb3NpdGlvbjogYWJzb2x1dGU7IGJvdHRvbTogLTFlbTsgcGFkZGluZzogMDsgd2lkdGg6IDFweDsgaGVpZ2h0OiAxZW07IG91dGxpbmU6IG5vbmVcIik7XG4gIHZhciBkaXYgPSBlbHQoXCJkaXZcIiwgW3RlXSwgbnVsbCwgXCJvdmVyZmxvdzogaGlkZGVuOyBwb3NpdGlvbjogcmVsYXRpdmU7IHdpZHRoOiAzcHg7IGhlaWdodDogMHB4O1wiKTtcbiAgLy8gVGhlIHRleHRhcmVhIGlzIGtlcHQgcG9zaXRpb25lZCBuZWFyIHRoZSBjdXJzb3IgdG8gcHJldmVudCB0aGVcbiAgLy8gZmFjdCB0aGF0IGl0J2xsIGJlIHNjcm9sbGVkIGludG8gdmlldyBvbiBpbnB1dCBmcm9tIHNjcm9sbGluZ1xuICAvLyBvdXIgZmFrZSBjdXJzb3Igb3V0IG9mIHZpZXcuIE9uIHdlYmtpdCwgd2hlbiB3cmFwPW9mZiwgcGFzdGUgaXNcbiAgLy8gdmVyeSBzbG93LiBTbyBtYWtlIHRoZSBhcmVhIHdpZGUgaW5zdGVhZC5cbiAgaWYgKHdlYmtpdCkgeyB0ZS5zdHlsZS53aWR0aCA9IFwiMTAwMHB4XCI7IH1cbiAgZWxzZSB7IHRlLnNldEF0dHJpYnV0ZShcIndyYXBcIiwgXCJvZmZcIik7IH1cbiAgLy8gSWYgYm9yZGVyOiAwOyAtLSBpT1MgZmFpbHMgdG8gb3BlbiBrZXlib2FyZCAoaXNzdWUgIzEyODcpXG4gIGlmIChpb3MpIHsgdGUuc3R5bGUuYm9yZGVyID0gXCIxcHggc29saWQgYmxhY2tcIjsgfVxuICBkaXNhYmxlQnJvd3Nlck1hZ2ljKHRlKTtcbiAgcmV0dXJuIGRpdlxufVxuXG4vLyBUaGUgcHVibGljbHkgdmlzaWJsZSBBUEkuIE5vdGUgdGhhdCBtZXRob2RPcChmKSBtZWFuc1xuLy8gJ3dyYXAgZiBpbiBhbiBvcGVyYXRpb24sIHBlcmZvcm1lZCBvbiBpdHMgYHRoaXNgIHBhcmFtZXRlcicuXG5cbi8vIFRoaXMgaXMgbm90IHRoZSBjb21wbGV0ZSBzZXQgb2YgZWRpdG9yIG1ldGhvZHMuIE1vc3Qgb2YgdGhlXG4vLyBtZXRob2RzIGRlZmluZWQgb24gdGhlIERvYyB0eXBlIGFyZSBhbHNvIGluamVjdGVkIGludG9cbi8vIENvZGVNaXJyb3IucHJvdG90eXBlLCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgYW5kXG4vLyBjb252ZW5pZW5jZS5cblxudmFyIGFkZEVkaXRvck1ldGhvZHMgPSBmdW5jdGlvbihDb2RlTWlycm9yKSB7XG4gIHZhciBvcHRpb25IYW5kbGVycyA9IENvZGVNaXJyb3Iub3B0aW9uSGFuZGxlcnM7XG5cbiAgdmFyIGhlbHBlcnMgPSBDb2RlTWlycm9yLmhlbHBlcnMgPSB7fTtcblxuICBDb2RlTWlycm9yLnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29kZU1pcnJvcixcbiAgICBmb2N1czogZnVuY3Rpb24oKXt3aW5kb3cuZm9jdXMoKTsgdGhpcy5kaXNwbGF5LmlucHV0LmZvY3VzKCk7fSxcblxuICAgIHNldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uLCB2YWx1ZSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsIG9sZCA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgIGlmIChvcHRpb25zW29wdGlvbl0gPT0gdmFsdWUgJiYgb3B0aW9uICE9IFwibW9kZVwiKSB7IHJldHVybiB9XG4gICAgICBvcHRpb25zW29wdGlvbl0gPSB2YWx1ZTtcbiAgICAgIGlmIChvcHRpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShvcHRpb24pKVxuICAgICAgICB7IG9wZXJhdGlvbih0aGlzLCBvcHRpb25IYW5kbGVyc1tvcHRpb25dKSh0aGlzLCB2YWx1ZSwgb2xkKTsgfVxuICAgICAgc2lnbmFsKHRoaXMsIFwib3B0aW9uQ2hhbmdlXCIsIHRoaXMsIG9wdGlvbik7XG4gICAgfSxcblxuICAgIGdldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uKSB7cmV0dXJuIHRoaXMub3B0aW9uc1tvcHRpb25dfSxcbiAgICBnZXREb2M6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLmRvY30sXG5cbiAgICBhZGRLZXlNYXA6IGZ1bmN0aW9uKG1hcCQkMSwgYm90dG9tKSB7XG4gICAgICB0aGlzLnN0YXRlLmtleU1hcHNbYm90dG9tID8gXCJwdXNoXCIgOiBcInVuc2hpZnRcIl0oZ2V0S2V5TWFwKG1hcCQkMSkpO1xuICAgIH0sXG4gICAgcmVtb3ZlS2V5TWFwOiBmdW5jdGlvbihtYXAkJDEpIHtcbiAgICAgIHZhciBtYXBzID0gdGhpcy5zdGF0ZS5rZXlNYXBzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXBzLmxlbmd0aDsgKytpKVxuICAgICAgICB7IGlmIChtYXBzW2ldID09IG1hcCQkMSB8fCBtYXBzW2ldLm5hbWUgPT0gbWFwJCQxKSB7XG4gICAgICAgICAgbWFwcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfSB9XG4gICAgfSxcblxuICAgIGFkZE92ZXJsYXk6IG1ldGhvZE9wKGZ1bmN0aW9uKHNwZWMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBtb2RlID0gc3BlYy50b2tlbiA/IHNwZWMgOiBDb2RlTWlycm9yLmdldE1vZGUodGhpcy5vcHRpb25zLCBzcGVjKTtcbiAgICAgIGlmIChtb2RlLnN0YXJ0U3RhdGUpIHsgdGhyb3cgbmV3IEVycm9yKFwiT3ZlcmxheXMgbWF5IG5vdCBiZSBzdGF0ZWZ1bC5cIikgfVxuICAgICAgaW5zZXJ0U29ydGVkKHRoaXMuc3RhdGUub3ZlcmxheXMsXG4gICAgICAgICAgICAgICAgICAge21vZGU6IG1vZGUsIG1vZGVTcGVjOiBzcGVjLCBvcGFxdWU6IG9wdGlvbnMgJiYgb3B0aW9ucy5vcGFxdWUsXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiAob3B0aW9ucyAmJiBvcHRpb25zLnByaW9yaXR5KSB8fCAwfSxcbiAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAob3ZlcmxheSkgeyByZXR1cm4gb3ZlcmxheS5wcmlvcml0eTsgfSk7XG4gICAgICB0aGlzLnN0YXRlLm1vZGVHZW4rKztcbiAgICAgIHJlZ0NoYW5nZSh0aGlzKTtcbiAgICB9KSxcbiAgICByZW1vdmVPdmVybGF5OiBtZXRob2RPcChmdW5jdGlvbihzcGVjKSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgdmFyIG92ZXJsYXlzID0gdGhpcy5zdGF0ZS5vdmVybGF5cztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3ZlcmxheXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGN1ciA9IG92ZXJsYXlzW2ldLm1vZGVTcGVjO1xuICAgICAgICBpZiAoY3VyID09IHNwZWMgfHwgdHlwZW9mIHNwZWMgPT0gXCJzdHJpbmdcIiAmJiBjdXIubmFtZSA9PSBzcGVjKSB7XG4gICAgICAgICAgb3ZlcmxheXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIHRoaXMkMS5zdGF0ZS5tb2RlR2VuKys7XG4gICAgICAgICAgcmVnQ2hhbmdlKHRoaXMkMSk7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSxcblxuICAgIGluZGVudExpbmU6IG1ldGhvZE9wKGZ1bmN0aW9uKG4sIGRpciwgYWdncmVzc2l2ZSkge1xuICAgICAgaWYgKHR5cGVvZiBkaXIgIT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgZGlyICE9IFwibnVtYmVyXCIpIHtcbiAgICAgICAgaWYgKGRpciA9PSBudWxsKSB7IGRpciA9IHRoaXMub3B0aW9ucy5zbWFydEluZGVudCA/IFwic21hcnRcIiA6IFwicHJldlwiOyB9XG4gICAgICAgIGVsc2UgeyBkaXIgPSBkaXIgPyBcImFkZFwiIDogXCJzdWJ0cmFjdFwiOyB9XG4gICAgICB9XG4gICAgICBpZiAoaXNMaW5lKHRoaXMuZG9jLCBuKSkgeyBpbmRlbnRMaW5lKHRoaXMsIG4sIGRpciwgYWdncmVzc2l2ZSk7IH1cbiAgICB9KSxcbiAgICBpbmRlbnRTZWxlY3Rpb246IG1ldGhvZE9wKGZ1bmN0aW9uKGhvdykge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICAgIHZhciByYW5nZXMgPSB0aGlzLmRvYy5zZWwucmFuZ2VzLCBlbmQgPSAtMTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByYW5nZSQkMSA9IHJhbmdlc1tpXTtcbiAgICAgICAgaWYgKCFyYW5nZSQkMS5lbXB0eSgpKSB7XG4gICAgICAgICAgdmFyIGZyb20gPSByYW5nZSQkMS5mcm9tKCksIHRvID0gcmFuZ2UkJDEudG8oKTtcbiAgICAgICAgICB2YXIgc3RhcnQgPSBNYXRoLm1heChlbmQsIGZyb20ubGluZSk7XG4gICAgICAgICAgZW5kID0gTWF0aC5taW4odGhpcyQxLmxhc3RMaW5lKCksIHRvLmxpbmUgLSAodG8uY2ggPyAwIDogMSkpICsgMTtcbiAgICAgICAgICBmb3IgKHZhciBqID0gc3RhcnQ7IGogPCBlbmQ7ICsrailcbiAgICAgICAgICAgIHsgaW5kZW50TGluZSh0aGlzJDEsIGosIGhvdyk7IH1cbiAgICAgICAgICB2YXIgbmV3UmFuZ2VzID0gdGhpcyQxLmRvYy5zZWwucmFuZ2VzO1xuICAgICAgICAgIGlmIChmcm9tLmNoID09IDAgJiYgcmFuZ2VzLmxlbmd0aCA9PSBuZXdSYW5nZXMubGVuZ3RoICYmIG5ld1Jhbmdlc1tpXS5mcm9tKCkuY2ggPiAwKVxuICAgICAgICAgICAgeyByZXBsYWNlT25lU2VsZWN0aW9uKHRoaXMkMS5kb2MsIGksIG5ldyBSYW5nZShmcm9tLCBuZXdSYW5nZXNbaV0udG8oKSksIHNlbF9kb250U2Nyb2xsKTsgfVxuICAgICAgICB9IGVsc2UgaWYgKHJhbmdlJCQxLmhlYWQubGluZSA+IGVuZCkge1xuICAgICAgICAgIGluZGVudExpbmUodGhpcyQxLCByYW5nZSQkMS5oZWFkLmxpbmUsIGhvdywgdHJ1ZSk7XG4gICAgICAgICAgZW5kID0gcmFuZ2UkJDEuaGVhZC5saW5lO1xuICAgICAgICAgIGlmIChpID09IHRoaXMkMS5kb2Muc2VsLnByaW1JbmRleCkgeyBlbnN1cmVDdXJzb3JWaXNpYmxlKHRoaXMkMSk7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLFxuXG4gICAgLy8gRmV0Y2ggdGhlIHBhcnNlciB0b2tlbiBmb3IgYSBnaXZlbiBjaGFyYWN0ZXIuIFVzZWZ1bCBmb3IgaGFja3NcbiAgICAvLyB0aGF0IHdhbnQgdG8gaW5zcGVjdCB0aGUgbW9kZSBzdGF0ZSAoc2F5LCBmb3IgY29tcGxldGlvbikuXG4gICAgZ2V0VG9rZW5BdDogZnVuY3Rpb24ocG9zLCBwcmVjaXNlKSB7XG4gICAgICByZXR1cm4gdGFrZVRva2VuKHRoaXMsIHBvcywgcHJlY2lzZSlcbiAgICB9LFxuXG4gICAgZ2V0TGluZVRva2VuczogZnVuY3Rpb24obGluZSwgcHJlY2lzZSkge1xuICAgICAgcmV0dXJuIHRha2VUb2tlbih0aGlzLCBQb3MobGluZSksIHByZWNpc2UsIHRydWUpXG4gICAgfSxcblxuICAgIGdldFRva2VuVHlwZUF0OiBmdW5jdGlvbihwb3MpIHtcbiAgICAgIHBvcyA9IGNsaXBQb3ModGhpcy5kb2MsIHBvcyk7XG4gICAgICB2YXIgc3R5bGVzID0gZ2V0TGluZVN0eWxlcyh0aGlzLCBnZXRMaW5lKHRoaXMuZG9jLCBwb3MubGluZSkpO1xuICAgICAgdmFyIGJlZm9yZSA9IDAsIGFmdGVyID0gKHN0eWxlcy5sZW5ndGggLSAxKSAvIDIsIGNoID0gcG9zLmNoO1xuICAgICAgdmFyIHR5cGU7XG4gICAgICBpZiAoY2ggPT0gMCkgeyB0eXBlID0gc3R5bGVzWzJdOyB9XG4gICAgICBlbHNlIHsgZm9yICg7Oykge1xuICAgICAgICB2YXIgbWlkID0gKGJlZm9yZSArIGFmdGVyKSA+PiAxO1xuICAgICAgICBpZiAoKG1pZCA/IHN0eWxlc1ttaWQgKiAyIC0gMV0gOiAwKSA+PSBjaCkgeyBhZnRlciA9IG1pZDsgfVxuICAgICAgICBlbHNlIGlmIChzdHlsZXNbbWlkICogMiArIDFdIDwgY2gpIHsgYmVmb3JlID0gbWlkICsgMTsgfVxuICAgICAgICBlbHNlIHsgdHlwZSA9IHN0eWxlc1ttaWQgKiAyICsgMl07IGJyZWFrIH1cbiAgICAgIH0gfVxuICAgICAgdmFyIGN1dCA9IHR5cGUgPyB0eXBlLmluZGV4T2YoXCJvdmVybGF5IFwiKSA6IC0xO1xuICAgICAgcmV0dXJuIGN1dCA8IDAgPyB0eXBlIDogY3V0ID09IDAgPyBudWxsIDogdHlwZS5zbGljZSgwLCBjdXQgLSAxKVxuICAgIH0sXG5cbiAgICBnZXRNb2RlQXQ6IGZ1bmN0aW9uKHBvcykge1xuICAgICAgdmFyIG1vZGUgPSB0aGlzLmRvYy5tb2RlO1xuICAgICAgaWYgKCFtb2RlLmlubmVyTW9kZSkgeyByZXR1cm4gbW9kZSB9XG4gICAgICByZXR1cm4gQ29kZU1pcnJvci5pbm5lck1vZGUobW9kZSwgdGhpcy5nZXRUb2tlbkF0KHBvcykuc3RhdGUpLm1vZGVcbiAgICB9LFxuXG4gICAgZ2V0SGVscGVyOiBmdW5jdGlvbihwb3MsIHR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEhlbHBlcnMocG9zLCB0eXBlKVswXVxuICAgIH0sXG5cbiAgICBnZXRIZWxwZXJzOiBmdW5jdGlvbihwb3MsIHR5cGUpIHtcbiAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgICB2YXIgZm91bmQgPSBbXTtcbiAgICAgIGlmICghaGVscGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgeyByZXR1cm4gZm91bmQgfVxuICAgICAgdmFyIGhlbHAgPSBoZWxwZXJzW3R5cGVdLCBtb2RlID0gdGhpcy5nZXRNb2RlQXQocG9zKTtcbiAgICAgIGlmICh0eXBlb2YgbW9kZVt0eXBlXSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGlmIChoZWxwW21vZGVbdHlwZV1dKSB7IGZvdW5kLnB1c2goaGVscFttb2RlW3R5cGVdXSk7IH1cbiAgICAgIH0gZWxzZSBpZiAobW9kZVt0eXBlXSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVbdHlwZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgdmFsID0gaGVscFttb2RlW3R5cGVdW2ldXTtcbiAgICAgICAgICBpZiAodmFsKSB7IGZvdW5kLnB1c2godmFsKTsgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG1vZGUuaGVscGVyVHlwZSAmJiBoZWxwW21vZGUuaGVscGVyVHlwZV0pIHtcbiAgICAgICAgZm91bmQucHVzaChoZWxwW21vZGUuaGVscGVyVHlwZV0pO1xuICAgICAgfSBlbHNlIGlmIChoZWxwW21vZGUubmFtZV0pIHtcbiAgICAgICAgZm91bmQucHVzaChoZWxwW21vZGUubmFtZV0pO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSQxID0gMDsgaSQxIDwgaGVscC5fZ2xvYmFsLmxlbmd0aDsgaSQxKyspIHtcbiAgICAgICAgdmFyIGN1ciA9IGhlbHAuX2dsb2JhbFtpJDFdO1xuICAgICAgICBpZiAoY3VyLnByZWQobW9kZSwgdGhpcyQxKSAmJiBpbmRleE9mKGZvdW5kLCBjdXIudmFsKSA9PSAtMSlcbiAgICAgICAgICB7IGZvdW5kLnB1c2goY3VyLnZhbCk7IH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmb3VuZFxuICAgIH0sXG5cbiAgICBnZXRTdGF0ZUFmdGVyOiBmdW5jdGlvbihsaW5lLCBwcmVjaXNlKSB7XG4gICAgICB2YXIgZG9jID0gdGhpcy5kb2M7XG4gICAgICBsaW5lID0gY2xpcExpbmUoZG9jLCBsaW5lID09IG51bGwgPyBkb2MuZmlyc3QgKyBkb2Muc2l6ZSAtIDE6IGxpbmUpO1xuICAgICAgcmV0dXJuIGdldFN0YXRlQmVmb3JlKHRoaXMsIGxpbmUgKyAxLCBwcmVjaXNlKVxuICAgIH0sXG5cbiAgICBjdXJzb3JDb29yZHM6IGZ1bmN0aW9uKHN0YXJ0LCBtb2RlKSB7XG4gICAgICB2YXIgcG9zLCByYW5nZSQkMSA9IHRoaXMuZG9jLnNlbC5wcmltYXJ5KCk7XG4gICAgICBpZiAoc3RhcnQgPT0gbnVsbCkgeyBwb3MgPSByYW5nZSQkMS5oZWFkOyB9XG4gICAgICBlbHNlIGlmICh0eXBlb2Ygc3RhcnQgPT0gXCJvYmplY3RcIikgeyBwb3MgPSBjbGlwUG9zKHRoaXMuZG9jLCBzdGFydCk7IH1cbiAgICAgIGVsc2UgeyBwb3MgPSBzdGFydCA/IHJhbmdlJCQxLmZyb20oKSA6IHJhbmdlJCQxLnRvKCk7IH1cbiAgICAgIHJldHVybiBjdXJzb3JDb29yZHModGhpcywgcG9zLCBtb2RlIHx8IFwicGFnZVwiKVxuICAgIH0sXG5cbiAgICBjaGFyQ29vcmRzOiBmdW5jdGlvbihwb3MsIG1vZGUpIHtcbiAgICAgIHJldHVybiBjaGFyQ29vcmRzKHRoaXMsIGNsaXBQb3ModGhpcy5kb2MsIHBvcyksIG1vZGUgfHwgXCJwYWdlXCIpXG4gICAgfSxcblxuICAgIGNvb3Jkc0NoYXI6IGZ1bmN0aW9uKGNvb3JkcywgbW9kZSkge1xuICAgICAgY29vcmRzID0gZnJvbUNvb3JkU3lzdGVtKHRoaXMsIGNvb3JkcywgbW9kZSB8fCBcInBhZ2VcIik7XG4gICAgICByZXR1cm4gY29vcmRzQ2hhcih0aGlzLCBjb29yZHMubGVmdCwgY29vcmRzLnRvcClcbiAgICB9LFxuXG4gICAgbGluZUF0SGVpZ2h0OiBmdW5jdGlvbihoZWlnaHQsIG1vZGUpIHtcbiAgICAgIGhlaWdodCA9IGZyb21Db29yZFN5c3RlbSh0aGlzLCB7dG9wOiBoZWlnaHQsIGxlZnQ6IDB9LCBtb2RlIHx8IFwicGFnZVwiKS50b3A7XG4gICAgICByZXR1cm4gbGluZUF0SGVpZ2h0KHRoaXMuZG9jLCBoZWlnaHQgKyB0aGlzLmRpc3BsYXkudmlld09mZnNldClcbiAgICB9LFxuICAgIGhlaWdodEF0TGluZTogZnVuY3Rpb24obGluZSwgbW9kZSwgaW5jbHVkZVdpZGdldHMpIHtcbiAgICAgIHZhciBlbmQgPSBmYWxzZSwgbGluZU9iajtcbiAgICAgIGlmICh0eXBlb2YgbGluZSA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHZhciBsYXN0ID0gdGhpcy5kb2MuZmlyc3QgKyB0aGlzLmRvYy5zaXplIC0gMTtcbiAgICAgICAgaWYgKGxpbmUgPCB0aGlzLmRvYy5maXJzdCkgeyBsaW5lID0gdGhpcy5kb2MuZmlyc3Q7IH1cbiAgICAgICAgZWxzZSBpZiAobGluZSA+IGxhc3QpIHsgbGluZSA9IGxhc3Q7IGVuZCA9IHRydWU7IH1cbiAgICAgICAgbGluZU9iaiA9IGdldExpbmUodGhpcy5kb2MsIGxpbmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGluZU9iaiA9IGxpbmU7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW50b0Nvb3JkU3lzdGVtKHRoaXMsIGxpbmVPYmosIHt0b3A6IDAsIGxlZnQ6IDB9LCBtb2RlIHx8IFwicGFnZVwiLCBpbmNsdWRlV2lkZ2V0cyB8fCBlbmQpLnRvcCArXG4gICAgICAgIChlbmQgPyB0aGlzLmRvYy5oZWlnaHQgLSBoZWlnaHRBdExpbmUobGluZU9iaikgOiAwKVxuICAgIH0sXG5cbiAgICBkZWZhdWx0VGV4dEhlaWdodDogZnVuY3Rpb24oKSB7IHJldHVybiB0ZXh0SGVpZ2h0KHRoaXMuZGlzcGxheSkgfSxcbiAgICBkZWZhdWx0Q2hhcldpZHRoOiBmdW5jdGlvbigpIHsgcmV0dXJuIGNoYXJXaWR0aCh0aGlzLmRpc3BsYXkpIH0sXG5cbiAgICBnZXRWaWV3cG9ydDogZnVuY3Rpb24oKSB7IHJldHVybiB7ZnJvbTogdGhpcy5kaXNwbGF5LnZpZXdGcm9tLCB0bzogdGhpcy5kaXNwbGF5LnZpZXdUb319LFxuXG4gICAgYWRkV2lkZ2V0OiBmdW5jdGlvbihwb3MsIG5vZGUsIHNjcm9sbCwgdmVydCwgaG9yaXopIHtcbiAgICAgIHZhciBkaXNwbGF5ID0gdGhpcy5kaXNwbGF5O1xuICAgICAgcG9zID0gY3Vyc29yQ29vcmRzKHRoaXMsIGNsaXBQb3ModGhpcy5kb2MsIHBvcykpO1xuICAgICAgdmFyIHRvcCA9IHBvcy5ib3R0b20sIGxlZnQgPSBwb3MubGVmdDtcbiAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICBub2RlLnNldEF0dHJpYnV0ZShcImNtLWlnbm9yZS1ldmVudHNcIiwgXCJ0cnVlXCIpO1xuICAgICAgdGhpcy5kaXNwbGF5LmlucHV0LnNldFVuZWRpdGFibGUobm9kZSk7XG4gICAgICBkaXNwbGF5LnNpemVyLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgaWYgKHZlcnQgPT0gXCJvdmVyXCIpIHtcbiAgICAgICAgdG9wID0gcG9zLnRvcDtcbiAgICAgIH0gZWxzZSBpZiAodmVydCA9PSBcImFib3ZlXCIgfHwgdmVydCA9PSBcIm5lYXJcIikge1xuICAgICAgICB2YXIgdnNwYWNlID0gTWF0aC5tYXgoZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodCwgdGhpcy5kb2MuaGVpZ2h0KSxcbiAgICAgICAgaHNwYWNlID0gTWF0aC5tYXgoZGlzcGxheS5zaXplci5jbGllbnRXaWR0aCwgZGlzcGxheS5saW5lU3BhY2UuY2xpZW50V2lkdGgpO1xuICAgICAgICAvLyBEZWZhdWx0IHRvIHBvc2l0aW9uaW5nIGFib3ZlIChpZiBzcGVjaWZpZWQgYW5kIHBvc3NpYmxlKTsgb3RoZXJ3aXNlIGRlZmF1bHQgdG8gcG9zaXRpb25pbmcgYmVsb3dcbiAgICAgICAgaWYgKCh2ZXJ0ID09ICdhYm92ZScgfHwgcG9zLmJvdHRvbSArIG5vZGUub2Zmc2V0SGVpZ2h0ID4gdnNwYWNlKSAmJiBwb3MudG9wID4gbm9kZS5vZmZzZXRIZWlnaHQpXG4gICAgICAgICAgeyB0b3AgPSBwb3MudG9wIC0gbm9kZS5vZmZzZXRIZWlnaHQ7IH1cbiAgICAgICAgZWxzZSBpZiAocG9zLmJvdHRvbSArIG5vZGUub2Zmc2V0SGVpZ2h0IDw9IHZzcGFjZSlcbiAgICAgICAgICB7IHRvcCA9IHBvcy5ib3R0b207IH1cbiAgICAgICAgaWYgKGxlZnQgKyBub2RlLm9mZnNldFdpZHRoID4gaHNwYWNlKVxuICAgICAgICAgIHsgbGVmdCA9IGhzcGFjZSAtIG5vZGUub2Zmc2V0V2lkdGg7IH1cbiAgICAgIH1cbiAgICAgIG5vZGUuc3R5bGUudG9wID0gdG9wICsgXCJweFwiO1xuICAgICAgbm9kZS5zdHlsZS5sZWZ0ID0gbm9kZS5zdHlsZS5yaWdodCA9IFwiXCI7XG4gICAgICBpZiAoaG9yaXogPT0gXCJyaWdodFwiKSB7XG4gICAgICAgIGxlZnQgPSBkaXNwbGF5LnNpemVyLmNsaWVudFdpZHRoIC0gbm9kZS5vZmZzZXRXaWR0aDtcbiAgICAgICAgbm9kZS5zdHlsZS5yaWdodCA9IFwiMHB4XCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaG9yaXogPT0gXCJsZWZ0XCIpIHsgbGVmdCA9IDA7IH1cbiAgICAgICAgZWxzZSBpZiAoaG9yaXogPT0gXCJtaWRkbGVcIikgeyBsZWZ0ID0gKGRpc3BsYXkuc2l6ZXIuY2xpZW50V2lkdGggLSBub2RlLm9mZnNldFdpZHRoKSAvIDI7IH1cbiAgICAgICAgbm9kZS5zdHlsZS5sZWZ0ID0gbGVmdCArIFwicHhcIjtcbiAgICAgIH1cbiAgICAgIGlmIChzY3JvbGwpXG4gICAgICAgIHsgc2Nyb2xsSW50b1ZpZXcodGhpcywge2xlZnQ6IGxlZnQsIHRvcDogdG9wLCByaWdodDogbGVmdCArIG5vZGUub2Zmc2V0V2lkdGgsIGJvdHRvbTogdG9wICsgbm9kZS5vZmZzZXRIZWlnaHR9KTsgfVxuICAgIH0sXG5cbiAgICB0cmlnZ2VyT25LZXlEb3duOiBtZXRob2RPcChvbktleURvd24pLFxuICAgIHRyaWdnZXJPbktleVByZXNzOiBtZXRob2RPcChvbktleVByZXNzKSxcbiAgICB0cmlnZ2VyT25LZXlVcDogb25LZXlVcCxcblxuICAgIGV4ZWNDb21tYW5kOiBmdW5jdGlvbihjbWQpIHtcbiAgICAgIGlmIChjb21tYW5kcy5oYXNPd25Qcm9wZXJ0eShjbWQpKVxuICAgICAgICB7IHJldHVybiBjb21tYW5kc1tjbWRdLmNhbGwobnVsbCwgdGhpcykgfVxuICAgIH0sXG5cbiAgICB0cmlnZ2VyRWxlY3RyaWM6IG1ldGhvZE9wKGZ1bmN0aW9uKHRleHQpIHsgdHJpZ2dlckVsZWN0cmljKHRoaXMsIHRleHQpOyB9KSxcblxuICAgIGZpbmRQb3NIOiBmdW5jdGlvbihmcm9tLCBhbW91bnQsIHVuaXQsIHZpc3VhbGx5KSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgdmFyIGRpciA9IDE7XG4gICAgICBpZiAoYW1vdW50IDwgMCkgeyBkaXIgPSAtMTsgYW1vdW50ID0gLWFtb3VudDsgfVxuICAgICAgdmFyIGN1ciA9IGNsaXBQb3ModGhpcy5kb2MsIGZyb20pO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbW91bnQ7ICsraSkge1xuICAgICAgICBjdXIgPSBmaW5kUG9zSCh0aGlzJDEuZG9jLCBjdXIsIGRpciwgdW5pdCwgdmlzdWFsbHkpO1xuICAgICAgICBpZiAoY3VyLmhpdFNpZGUpIHsgYnJlYWsgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGN1clxuICAgIH0sXG5cbiAgICBtb3ZlSDogbWV0aG9kT3AoZnVuY3Rpb24oZGlyLCB1bml0KSB7XG4gICAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgICAgdGhpcy5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24gKHJhbmdlJCQxKSB7XG4gICAgICAgIGlmICh0aGlzJDEuZGlzcGxheS5zaGlmdCB8fCB0aGlzJDEuZG9jLmV4dGVuZCB8fCByYW5nZSQkMS5lbXB0eSgpKVxuICAgICAgICAgIHsgcmV0dXJuIGZpbmRQb3NIKHRoaXMkMS5kb2MsIHJhbmdlJCQxLmhlYWQsIGRpciwgdW5pdCwgdGhpcyQxLm9wdGlvbnMucnRsTW92ZVZpc3VhbGx5KSB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB7IHJldHVybiBkaXIgPCAwID8gcmFuZ2UkJDEuZnJvbSgpIDogcmFuZ2UkJDEudG8oKSB9XG4gICAgICB9LCBzZWxfbW92ZSk7XG4gICAgfSksXG5cbiAgICBkZWxldGVIOiBtZXRob2RPcChmdW5jdGlvbihkaXIsIHVuaXQpIHtcbiAgICAgIHZhciBzZWwgPSB0aGlzLmRvYy5zZWwsIGRvYyA9IHRoaXMuZG9jO1xuICAgICAgaWYgKHNlbC5zb21ldGhpbmdTZWxlY3RlZCgpKVxuICAgICAgICB7IGRvYy5yZXBsYWNlU2VsZWN0aW9uKFwiXCIsIG51bGwsIFwiK2RlbGV0ZVwiKTsgfVxuICAgICAgZWxzZVxuICAgICAgICB7IGRlbGV0ZU5lYXJTZWxlY3Rpb24odGhpcywgZnVuY3Rpb24gKHJhbmdlJCQxKSB7XG4gICAgICAgICAgdmFyIG90aGVyID0gZmluZFBvc0goZG9jLCByYW5nZSQkMS5oZWFkLCBkaXIsIHVuaXQsIGZhbHNlKTtcbiAgICAgICAgICByZXR1cm4gZGlyIDwgMCA/IHtmcm9tOiBvdGhlciwgdG86IHJhbmdlJCQxLmhlYWR9IDoge2Zyb206IHJhbmdlJCQxLmhlYWQsIHRvOiBvdGhlcn1cbiAgICAgICAgfSk7IH1cbiAgICB9KSxcblxuICAgIGZpbmRQb3NWOiBmdW5jdGlvbihmcm9tLCBhbW91bnQsIHVuaXQsIGdvYWxDb2x1bW4pIHtcbiAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgICB2YXIgZGlyID0gMSwgeCA9IGdvYWxDb2x1bW47XG4gICAgICBpZiAoYW1vdW50IDwgMCkgeyBkaXIgPSAtMTsgYW1vdW50ID0gLWFtb3VudDsgfVxuICAgICAgdmFyIGN1ciA9IGNsaXBQb3ModGhpcy5kb2MsIGZyb20pO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbW91bnQ7ICsraSkge1xuICAgICAgICB2YXIgY29vcmRzID0gY3Vyc29yQ29vcmRzKHRoaXMkMSwgY3VyLCBcImRpdlwiKTtcbiAgICAgICAgaWYgKHggPT0gbnVsbCkgeyB4ID0gY29vcmRzLmxlZnQ7IH1cbiAgICAgICAgZWxzZSB7IGNvb3Jkcy5sZWZ0ID0geDsgfVxuICAgICAgICBjdXIgPSBmaW5kUG9zVih0aGlzJDEsIGNvb3JkcywgZGlyLCB1bml0KTtcbiAgICAgICAgaWYgKGN1ci5oaXRTaWRlKSB7IGJyZWFrIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJcbiAgICB9LFxuXG4gICAgbW92ZVY6IG1ldGhvZE9wKGZ1bmN0aW9uKGRpciwgdW5pdCkge1xuICAgICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICAgIHZhciBkb2MgPSB0aGlzLmRvYywgZ29hbHMgPSBbXTtcbiAgICAgIHZhciBjb2xsYXBzZSA9ICF0aGlzLmRpc3BsYXkuc2hpZnQgJiYgIWRvYy5leHRlbmQgJiYgZG9jLnNlbC5zb21ldGhpbmdTZWxlY3RlZCgpO1xuICAgICAgZG9jLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbiAocmFuZ2UkJDEpIHtcbiAgICAgICAgaWYgKGNvbGxhcHNlKVxuICAgICAgICAgIHsgcmV0dXJuIGRpciA8IDAgPyByYW5nZSQkMS5mcm9tKCkgOiByYW5nZSQkMS50bygpIH1cbiAgICAgICAgdmFyIGhlYWRQb3MgPSBjdXJzb3JDb29yZHModGhpcyQxLCByYW5nZSQkMS5oZWFkLCBcImRpdlwiKTtcbiAgICAgICAgaWYgKHJhbmdlJCQxLmdvYWxDb2x1bW4gIT0gbnVsbCkgeyBoZWFkUG9zLmxlZnQgPSByYW5nZSQkMS5nb2FsQ29sdW1uOyB9XG4gICAgICAgIGdvYWxzLnB1c2goaGVhZFBvcy5sZWZ0KTtcbiAgICAgICAgdmFyIHBvcyA9IGZpbmRQb3NWKHRoaXMkMSwgaGVhZFBvcywgZGlyLCB1bml0KTtcbiAgICAgICAgaWYgKHVuaXQgPT0gXCJwYWdlXCIgJiYgcmFuZ2UkJDEgPT0gZG9jLnNlbC5wcmltYXJ5KCkpXG4gICAgICAgICAgeyBhZGRUb1Njcm9sbFRvcCh0aGlzJDEsIGNoYXJDb29yZHModGhpcyQxLCBwb3MsIFwiZGl2XCIpLnRvcCAtIGhlYWRQb3MudG9wKTsgfVxuICAgICAgICByZXR1cm4gcG9zXG4gICAgICB9LCBzZWxfbW92ZSk7XG4gICAgICBpZiAoZ29hbHMubGVuZ3RoKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIHsgZG9jLnNlbC5yYW5nZXNbaV0uZ29hbENvbHVtbiA9IGdvYWxzW2ldOyB9IH1cbiAgICB9KSxcblxuICAgIC8vIEZpbmQgdGhlIHdvcmQgYXQgdGhlIGdpdmVuIHBvc2l0aW9uIChhcyByZXR1cm5lZCBieSBjb29yZHNDaGFyKS5cbiAgICBmaW5kV29yZEF0OiBmdW5jdGlvbihwb3MpIHtcbiAgICAgIHZhciBkb2MgPSB0aGlzLmRvYywgbGluZSA9IGdldExpbmUoZG9jLCBwb3MubGluZSkudGV4dDtcbiAgICAgIHZhciBzdGFydCA9IHBvcy5jaCwgZW5kID0gcG9zLmNoO1xuICAgICAgaWYgKGxpbmUpIHtcbiAgICAgICAgdmFyIGhlbHBlciA9IHRoaXMuZ2V0SGVscGVyKHBvcywgXCJ3b3JkQ2hhcnNcIik7XG4gICAgICAgIGlmICgocG9zLnN0aWNreSA9PSBcImJlZm9yZVwiIHx8IGVuZCA9PSBsaW5lLmxlbmd0aCkgJiYgc3RhcnQpIHsgLS1zdGFydDsgfSBlbHNlIHsgKytlbmQ7IH1cbiAgICAgICAgdmFyIHN0YXJ0Q2hhciA9IGxpbmUuY2hhckF0KHN0YXJ0KTtcbiAgICAgICAgdmFyIGNoZWNrID0gaXNXb3JkQ2hhcihzdGFydENoYXIsIGhlbHBlcilcbiAgICAgICAgICA/IGZ1bmN0aW9uIChjaCkgeyByZXR1cm4gaXNXb3JkQ2hhcihjaCwgaGVscGVyKTsgfVxuICAgICAgICAgIDogL1xccy8udGVzdChzdGFydENoYXIpID8gZnVuY3Rpb24gKGNoKSB7IHJldHVybiAvXFxzLy50ZXN0KGNoKTsgfVxuICAgICAgICAgIDogZnVuY3Rpb24gKGNoKSB7IHJldHVybiAoIS9cXHMvLnRlc3QoY2gpICYmICFpc1dvcmRDaGFyKGNoKSk7IH07XG4gICAgICAgIHdoaWxlIChzdGFydCA+IDAgJiYgY2hlY2sobGluZS5jaGFyQXQoc3RhcnQgLSAxKSkpIHsgLS1zdGFydDsgfVxuICAgICAgICB3aGlsZSAoZW5kIDwgbGluZS5sZW5ndGggJiYgY2hlY2sobGluZS5jaGFyQXQoZW5kKSkpIHsgKytlbmQ7IH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUmFuZ2UoUG9zKHBvcy5saW5lLCBzdGFydCksIFBvcyhwb3MubGluZSwgZW5kKSlcbiAgICB9LFxuXG4gICAgdG9nZ2xlT3ZlcndyaXRlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgPT0gdGhpcy5zdGF0ZS5vdmVyd3JpdGUpIHsgcmV0dXJuIH1cbiAgICAgIGlmICh0aGlzLnN0YXRlLm92ZXJ3cml0ZSA9ICF0aGlzLnN0YXRlLm92ZXJ3cml0ZSlcbiAgICAgICAgeyBhZGRDbGFzcyh0aGlzLmRpc3BsYXkuY3Vyc29yRGl2LCBcIkNvZGVNaXJyb3Itb3ZlcndyaXRlXCIpOyB9XG4gICAgICBlbHNlXG4gICAgICAgIHsgcm1DbGFzcyh0aGlzLmRpc3BsYXkuY3Vyc29yRGl2LCBcIkNvZGVNaXJyb3Itb3ZlcndyaXRlXCIpOyB9XG5cbiAgICAgIHNpZ25hbCh0aGlzLCBcIm92ZXJ3cml0ZVRvZ2dsZVwiLCB0aGlzLCB0aGlzLnN0YXRlLm92ZXJ3cml0ZSk7XG4gICAgfSxcbiAgICBoYXNGb2N1czogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmRpc3BsYXkuaW5wdXQuZ2V0RmllbGQoKSA9PSBhY3RpdmVFbHQoKSB9LFxuICAgIGlzUmVhZE9ubHk6IGZ1bmN0aW9uKCkgeyByZXR1cm4gISEodGhpcy5vcHRpb25zLnJlYWRPbmx5IHx8IHRoaXMuZG9jLmNhbnRFZGl0KSB9LFxuXG4gICAgc2Nyb2xsVG86IG1ldGhvZE9wKGZ1bmN0aW9uICh4LCB5KSB7IHNjcm9sbFRvQ29vcmRzKHRoaXMsIHgsIHkpOyB9KSxcbiAgICBnZXRTY3JvbGxJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY3JvbGxlciA9IHRoaXMuZGlzcGxheS5zY3JvbGxlcjtcbiAgICAgIHJldHVybiB7bGVmdDogc2Nyb2xsZXIuc2Nyb2xsTGVmdCwgdG9wOiBzY3JvbGxlci5zY3JvbGxUb3AsXG4gICAgICAgICAgICAgIGhlaWdodDogc2Nyb2xsZXIuc2Nyb2xsSGVpZ2h0IC0gc2Nyb2xsR2FwKHRoaXMpIC0gdGhpcy5kaXNwbGF5LmJhckhlaWdodCxcbiAgICAgICAgICAgICAgd2lkdGg6IHNjcm9sbGVyLnNjcm9sbFdpZHRoIC0gc2Nyb2xsR2FwKHRoaXMpIC0gdGhpcy5kaXNwbGF5LmJhcldpZHRoLFxuICAgICAgICAgICAgICBjbGllbnRIZWlnaHQ6IGRpc3BsYXlIZWlnaHQodGhpcyksIGNsaWVudFdpZHRoOiBkaXNwbGF5V2lkdGgodGhpcyl9XG4gICAgfSxcblxuICAgIHNjcm9sbEludG9WaWV3OiBtZXRob2RPcChmdW5jdGlvbihyYW5nZSQkMSwgbWFyZ2luKSB7XG4gICAgICBpZiAocmFuZ2UkJDEgPT0gbnVsbCkge1xuICAgICAgICByYW5nZSQkMSA9IHtmcm9tOiB0aGlzLmRvYy5zZWwucHJpbWFyeSgpLmhlYWQsIHRvOiBudWxsfTtcbiAgICAgICAgaWYgKG1hcmdpbiA9PSBudWxsKSB7IG1hcmdpbiA9IHRoaXMub3B0aW9ucy5jdXJzb3JTY3JvbGxNYXJnaW47IH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJhbmdlJCQxID09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcmFuZ2UkJDEgPSB7ZnJvbTogUG9zKHJhbmdlJCQxLCAwKSwgdG86IG51bGx9O1xuICAgICAgfSBlbHNlIGlmIChyYW5nZSQkMS5mcm9tID09IG51bGwpIHtcbiAgICAgICAgcmFuZ2UkJDEgPSB7ZnJvbTogcmFuZ2UkJDEsIHRvOiBudWxsfTtcbiAgICAgIH1cbiAgICAgIGlmICghcmFuZ2UkJDEudG8pIHsgcmFuZ2UkJDEudG8gPSByYW5nZSQkMS5mcm9tOyB9XG4gICAgICByYW5nZSQkMS5tYXJnaW4gPSBtYXJnaW4gfHwgMDtcblxuICAgICAgaWYgKHJhbmdlJCQxLmZyb20ubGluZSAhPSBudWxsKSB7XG4gICAgICAgIHNjcm9sbFRvUmFuZ2UodGhpcywgcmFuZ2UkJDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Nyb2xsVG9Db29yZHNSYW5nZSh0aGlzLCByYW5nZSQkMS5mcm9tLCByYW5nZSQkMS50bywgcmFuZ2UkJDEubWFyZ2luKTtcbiAgICAgIH1cbiAgICB9KSxcblxuICAgIHNldFNpemU6IG1ldGhvZE9wKGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgICB2YXIgaW50ZXJwcmV0ID0gZnVuY3Rpb24gKHZhbCkgeyByZXR1cm4gdHlwZW9mIHZhbCA9PSBcIm51bWJlclwiIHx8IC9eXFxkKyQvLnRlc3QoU3RyaW5nKHZhbCkpID8gdmFsICsgXCJweFwiIDogdmFsOyB9O1xuICAgICAgaWYgKHdpZHRoICE9IG51bGwpIHsgdGhpcy5kaXNwbGF5LndyYXBwZXIuc3R5bGUud2lkdGggPSBpbnRlcnByZXQod2lkdGgpOyB9XG4gICAgICBpZiAoaGVpZ2h0ICE9IG51bGwpIHsgdGhpcy5kaXNwbGF5LndyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gaW50ZXJwcmV0KGhlaWdodCk7IH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubGluZVdyYXBwaW5nKSB7IGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGUodGhpcyk7IH1cbiAgICAgIHZhciBsaW5lTm8kJDEgPSB0aGlzLmRpc3BsYXkudmlld0Zyb207XG4gICAgICB0aGlzLmRvYy5pdGVyKGxpbmVObyQkMSwgdGhpcy5kaXNwbGF5LnZpZXdUbywgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgaWYgKGxpbmUud2lkZ2V0cykgeyBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUud2lkZ2V0cy5sZW5ndGg7IGkrKylcbiAgICAgICAgICB7IGlmIChsaW5lLndpZGdldHNbaV0ubm9IU2Nyb2xsKSB7IHJlZ0xpbmVDaGFuZ2UodGhpcyQxLCBsaW5lTm8kJDEsIFwid2lkZ2V0XCIpOyBicmVhayB9IH0gfVxuICAgICAgICArK2xpbmVObyQkMTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5jdXJPcC5mb3JjZVVwZGF0ZSA9IHRydWU7XG4gICAgICBzaWduYWwodGhpcywgXCJyZWZyZXNoXCIsIHRoaXMpO1xuICAgIH0pLFxuXG4gICAgb3BlcmF0aW9uOiBmdW5jdGlvbihmKXtyZXR1cm4gcnVuSW5PcCh0aGlzLCBmKX0sXG5cbiAgICByZWZyZXNoOiBtZXRob2RPcChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvbGRIZWlnaHQgPSB0aGlzLmRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodDtcbiAgICAgIHJlZ0NoYW5nZSh0aGlzKTtcbiAgICAgIHRoaXMuY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgY2xlYXJDYWNoZXModGhpcyk7XG4gICAgICBzY3JvbGxUb0Nvb3Jkcyh0aGlzLCB0aGlzLmRvYy5zY3JvbGxMZWZ0LCB0aGlzLmRvYy5zY3JvbGxUb3ApO1xuICAgICAgdXBkYXRlR3V0dGVyU3BhY2UodGhpcyk7XG4gICAgICBpZiAob2xkSGVpZ2h0ID09IG51bGwgfHwgTWF0aC5hYnMob2xkSGVpZ2h0IC0gdGV4dEhlaWdodCh0aGlzLmRpc3BsYXkpKSA+IC41KVxuICAgICAgICB7IGVzdGltYXRlTGluZUhlaWdodHModGhpcyk7IH1cbiAgICAgIHNpZ25hbCh0aGlzLCBcInJlZnJlc2hcIiwgdGhpcyk7XG4gICAgfSksXG5cbiAgICBzd2FwRG9jOiBtZXRob2RPcChmdW5jdGlvbihkb2MpIHtcbiAgICAgIHZhciBvbGQgPSB0aGlzLmRvYztcbiAgICAgIG9sZC5jbSA9IG51bGw7XG4gICAgICBhdHRhY2hEb2ModGhpcywgZG9jKTtcbiAgICAgIGNsZWFyQ2FjaGVzKHRoaXMpO1xuICAgICAgdGhpcy5kaXNwbGF5LmlucHV0LnJlc2V0KCk7XG4gICAgICBzY3JvbGxUb0Nvb3Jkcyh0aGlzLCBkb2Muc2Nyb2xsTGVmdCwgZG9jLnNjcm9sbFRvcCk7XG4gICAgICB0aGlzLmN1ck9wLmZvcmNlU2Nyb2xsID0gdHJ1ZTtcbiAgICAgIHNpZ25hbExhdGVyKHRoaXMsIFwic3dhcERvY1wiLCB0aGlzLCBvbGQpO1xuICAgICAgcmV0dXJuIG9sZFxuICAgIH0pLFxuXG4gICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaXNwbGF5LmlucHV0LmdldEZpZWxkKCl9LFxuICAgIGdldFdyYXBwZXJFbGVtZW50OiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmRpc3BsYXkud3JhcHBlcn0sXG4gICAgZ2V0U2Nyb2xsZXJFbGVtZW50OiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmRpc3BsYXkuc2Nyb2xsZXJ9LFxuICAgIGdldEd1dHRlckVsZW1lbnQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGlzcGxheS5ndXR0ZXJzfVxuICB9O1xuICBldmVudE1peGluKENvZGVNaXJyb3IpO1xuXG4gIENvZGVNaXJyb3IucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICghaGVscGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgeyBoZWxwZXJzW3R5cGVdID0gQ29kZU1pcnJvclt0eXBlXSA9IHtfZ2xvYmFsOiBbXX07IH1cbiAgICBoZWxwZXJzW3R5cGVdW25hbWVdID0gdmFsdWU7XG4gIH07XG4gIENvZGVNaXJyb3IucmVnaXN0ZXJHbG9iYWxIZWxwZXIgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBwcmVkaWNhdGUsIHZhbHVlKSB7XG4gICAgQ29kZU1pcnJvci5yZWdpc3RlckhlbHBlcih0eXBlLCBuYW1lLCB2YWx1ZSk7XG4gICAgaGVscGVyc1t0eXBlXS5fZ2xvYmFsLnB1c2goe3ByZWQ6IHByZWRpY2F0ZSwgdmFsOiB2YWx1ZX0pO1xuICB9O1xufTtcblxuLy8gVXNlZCBmb3IgaG9yaXpvbnRhbCByZWxhdGl2ZSBtb3Rpb24uIERpciBpcyAtMSBvciAxIChsZWZ0IG9yXG4vLyByaWdodCksIHVuaXQgY2FuIGJlIFwiY2hhclwiLCBcImNvbHVtblwiIChsaWtlIGNoYXIsIGJ1dCBkb2Vzbid0XG4vLyBjcm9zcyBsaW5lIGJvdW5kYXJpZXMpLCBcIndvcmRcIiAoYWNyb3NzIG5leHQgd29yZCksIG9yIFwiZ3JvdXBcIiAodG9cbi8vIHRoZSBzdGFydCBvZiBuZXh0IGdyb3VwIG9mIHdvcmQgb3Igbm9uLXdvcmQtbm9uLXdoaXRlc3BhY2Vcbi8vIGNoYXJzKS4gVGhlIHZpc3VhbGx5IHBhcmFtIGNvbnRyb2xzIHdoZXRoZXIsIGluIHJpZ2h0LXRvLWxlZnRcbi8vIHRleHQsIGRpcmVjdGlvbiAxIG1lYW5zIHRvIG1vdmUgdG93YXJkcyB0aGUgbmV4dCBpbmRleCBpbiB0aGVcbi8vIHN0cmluZywgb3IgdG93YXJkcyB0aGUgY2hhcmFjdGVyIHRvIHRoZSByaWdodCBvZiB0aGUgY3VycmVudFxuLy8gcG9zaXRpb24uIFRoZSByZXN1bHRpbmcgcG9zaXRpb24gd2lsbCBoYXZlIGEgaGl0U2lkZT10cnVlXG4vLyBwcm9wZXJ0eSBpZiBpdCByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50LlxuZnVuY3Rpb24gZmluZFBvc0goZG9jLCBwb3MsIGRpciwgdW5pdCwgdmlzdWFsbHkpIHtcbiAgdmFyIG9sZFBvcyA9IHBvcztcbiAgdmFyIG9yaWdEaXIgPSBkaXI7XG4gIHZhciBsaW5lT2JqID0gZ2V0TGluZShkb2MsIHBvcy5saW5lKTtcbiAgZnVuY3Rpb24gZmluZE5leHRMaW5lKCkge1xuICAgIHZhciBsID0gcG9zLmxpbmUgKyBkaXI7XG4gICAgaWYgKGwgPCBkb2MuZmlyc3QgfHwgbCA+PSBkb2MuZmlyc3QgKyBkb2Muc2l6ZSkgeyByZXR1cm4gZmFsc2UgfVxuICAgIHBvcyA9IG5ldyBQb3MobCwgcG9zLmNoLCBwb3Muc3RpY2t5KTtcbiAgICByZXR1cm4gbGluZU9iaiA9IGdldExpbmUoZG9jLCBsKVxuICB9XG4gIGZ1bmN0aW9uIG1vdmVPbmNlKGJvdW5kVG9MaW5lKSB7XG4gICAgdmFyIG5leHQ7XG4gICAgaWYgKHZpc3VhbGx5KSB7XG4gICAgICBuZXh0ID0gbW92ZVZpc3VhbGx5KGRvYy5jbSwgbGluZU9iaiwgcG9zLCBkaXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0ID0gbW92ZUxvZ2ljYWxseShsaW5lT2JqLCBwb3MsIGRpcik7XG4gICAgfVxuICAgIGlmIChuZXh0ID09IG51bGwpIHtcbiAgICAgIGlmICghYm91bmRUb0xpbmUgJiYgZmluZE5leHRMaW5lKCkpXG4gICAgICAgIHsgcG9zID0gZW5kT2ZMaW5lKHZpc3VhbGx5LCBkb2MuY20sIGxpbmVPYmosIHBvcy5saW5lLCBkaXIpOyB9XG4gICAgICBlbHNlXG4gICAgICAgIHsgcmV0dXJuIGZhbHNlIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zID0gbmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmICh1bml0ID09IFwiY2hhclwiKSB7XG4gICAgbW92ZU9uY2UoKTtcbiAgfSBlbHNlIGlmICh1bml0ID09IFwiY29sdW1uXCIpIHtcbiAgICBtb3ZlT25jZSh0cnVlKTtcbiAgfSBlbHNlIGlmICh1bml0ID09IFwid29yZFwiIHx8IHVuaXQgPT0gXCJncm91cFwiKSB7XG4gICAgdmFyIHNhd1R5cGUgPSBudWxsLCBncm91cCA9IHVuaXQgPT0gXCJncm91cFwiO1xuICAgIHZhciBoZWxwZXIgPSBkb2MuY20gJiYgZG9jLmNtLmdldEhlbHBlcihwb3MsIFwid29yZENoYXJzXCIpO1xuICAgIGZvciAodmFyIGZpcnN0ID0gdHJ1ZTs7IGZpcnN0ID0gZmFsc2UpIHtcbiAgICAgIGlmIChkaXIgPCAwICYmICFtb3ZlT25jZSghZmlyc3QpKSB7IGJyZWFrIH1cbiAgICAgIHZhciBjdXIgPSBsaW5lT2JqLnRleHQuY2hhckF0KHBvcy5jaCkgfHwgXCJcXG5cIjtcbiAgICAgIHZhciB0eXBlID0gaXNXb3JkQ2hhcihjdXIsIGhlbHBlcikgPyBcIndcIlxuICAgICAgICA6IGdyb3VwICYmIGN1ciA9PSBcIlxcblwiID8gXCJuXCJcbiAgICAgICAgOiAhZ3JvdXAgfHwgL1xccy8udGVzdChjdXIpID8gbnVsbFxuICAgICAgICA6IFwicFwiO1xuICAgICAgaWYgKGdyb3VwICYmICFmaXJzdCAmJiAhdHlwZSkgeyB0eXBlID0gXCJzXCI7IH1cbiAgICAgIGlmIChzYXdUeXBlICYmIHNhd1R5cGUgIT0gdHlwZSkge1xuICAgICAgICBpZiAoZGlyIDwgMCkge2RpciA9IDE7IG1vdmVPbmNlKCk7IHBvcy5zdGlja3kgPSBcImFmdGVyXCI7fVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSkgeyBzYXdUeXBlID0gdHlwZTsgfVxuICAgICAgaWYgKGRpciA+IDAgJiYgIW1vdmVPbmNlKCFmaXJzdCkpIHsgYnJlYWsgfVxuICAgIH1cbiAgfVxuICB2YXIgcmVzdWx0ID0gc2tpcEF0b21pYyhkb2MsIHBvcywgb2xkUG9zLCBvcmlnRGlyLCB0cnVlKTtcbiAgaWYgKGVxdWFsQ3Vyc29yUG9zKG9sZFBvcywgcmVzdWx0KSkgeyByZXN1bHQuaGl0U2lkZSA9IHRydWU7IH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBGb3IgcmVsYXRpdmUgdmVydGljYWwgbW92ZW1lbnQuIERpciBtYXkgYmUgLTEgb3IgMS4gVW5pdCBjYW4gYmVcbi8vIFwicGFnZVwiIG9yIFwibGluZVwiLiBUaGUgcmVzdWx0aW5nIHBvc2l0aW9uIHdpbGwgaGF2ZSBhIGhpdFNpZGU9dHJ1ZVxuLy8gcHJvcGVydHkgaWYgaXQgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudC5cbmZ1bmN0aW9uIGZpbmRQb3NWKGNtLCBwb3MsIGRpciwgdW5pdCkge1xuICB2YXIgZG9jID0gY20uZG9jLCB4ID0gcG9zLmxlZnQsIHk7XG4gIGlmICh1bml0ID09IFwicGFnZVwiKSB7XG4gICAgdmFyIHBhZ2VTaXplID0gTWF0aC5taW4oY20uZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpO1xuICAgIHZhciBtb3ZlQW1vdW50ID0gTWF0aC5tYXgocGFnZVNpemUgLSAuNSAqIHRleHRIZWlnaHQoY20uZGlzcGxheSksIDMpO1xuICAgIHkgPSAoZGlyID4gMCA/IHBvcy5ib3R0b20gOiBwb3MudG9wKSArIGRpciAqIG1vdmVBbW91bnQ7XG5cbiAgfSBlbHNlIGlmICh1bml0ID09IFwibGluZVwiKSB7XG4gICAgeSA9IGRpciA+IDAgPyBwb3MuYm90dG9tICsgMyA6IHBvcy50b3AgLSAzO1xuICB9XG4gIHZhciB0YXJnZXQ7XG4gIGZvciAoOzspIHtcbiAgICB0YXJnZXQgPSBjb29yZHNDaGFyKGNtLCB4LCB5KTtcbiAgICBpZiAoIXRhcmdldC5vdXRzaWRlKSB7IGJyZWFrIH1cbiAgICBpZiAoZGlyIDwgMCA/IHkgPD0gMCA6IHkgPj0gZG9jLmhlaWdodCkgeyB0YXJnZXQuaGl0U2lkZSA9IHRydWU7IGJyZWFrIH1cbiAgICB5ICs9IGRpciAqIDU7XG4gIH1cbiAgcmV0dXJuIHRhcmdldFxufVxuXG4vLyBDT05URU5URURJVEFCTEUgSU5QVVQgU1RZTEVcblxudmFyIENvbnRlbnRFZGl0YWJsZUlucHV0ID0gZnVuY3Rpb24oY20pIHtcbiAgdGhpcy5jbSA9IGNtO1xuICB0aGlzLmxhc3RBbmNob3JOb2RlID0gdGhpcy5sYXN0QW5jaG9yT2Zmc2V0ID0gdGhpcy5sYXN0Rm9jdXNOb2RlID0gdGhpcy5sYXN0Rm9jdXNPZmZzZXQgPSBudWxsO1xuICB0aGlzLnBvbGxpbmcgPSBuZXcgRGVsYXllZCgpO1xuICB0aGlzLmNvbXBvc2luZyA9IG51bGw7XG4gIHRoaXMuZ3JhY2VQZXJpb2QgPSBmYWxzZTtcbiAgdGhpcy5yZWFkRE9NVGltZW91dCA9IG51bGw7XG59O1xuXG5Db250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChkaXNwbGF5KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGlucHV0ID0gdGhpcywgY20gPSBpbnB1dC5jbTtcbiAgdmFyIGRpdiA9IGlucHV0LmRpdiA9IGRpc3BsYXkubGluZURpdjtcbiAgZGlzYWJsZUJyb3dzZXJNYWdpYyhkaXYsIGNtLm9wdGlvbnMuc3BlbGxjaGVjayk7XG5cbiAgb24oZGl2LCBcInBhc3RlXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlKSB8fCBoYW5kbGVQYXN0ZShlLCBjbSkpIHsgcmV0dXJuIH1cbiAgICAvLyBJRSBkb2Vzbid0IGZpcmUgaW5wdXQgZXZlbnRzLCBzbyB3ZSBzY2hlZHVsZSBhIHJlYWQgZm9yIHRoZSBwYXN0ZWQgY29udGVudCBpbiB0aGlzIHdheVxuICAgIGlmIChpZV92ZXJzaW9uIDw9IDExKSB7IHNldFRpbWVvdXQob3BlcmF0aW9uKGNtLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzJDEudXBkYXRlRnJvbURPTSgpOyB9KSwgMjApOyB9XG4gIH0pO1xuXG4gIG9uKGRpdiwgXCJjb21wb3NpdGlvbnN0YXJ0XCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgdGhpcyQxLmNvbXBvc2luZyA9IHtkYXRhOiBlLmRhdGEsIGRvbmU6IGZhbHNlfTtcbiAgfSk7XG4gIG9uKGRpdiwgXCJjb21wb3NpdGlvbnVwZGF0ZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICghdGhpcyQxLmNvbXBvc2luZykgeyB0aGlzJDEuY29tcG9zaW5nID0ge2RhdGE6IGUuZGF0YSwgZG9uZTogZmFsc2V9OyB9XG4gIH0pO1xuICBvbihkaXYsIFwiY29tcG9zaXRpb25lbmRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAodGhpcyQxLmNvbXBvc2luZykge1xuICAgICAgaWYgKGUuZGF0YSAhPSB0aGlzJDEuY29tcG9zaW5nLmRhdGEpIHsgdGhpcyQxLnJlYWRGcm9tRE9NU29vbigpOyB9XG4gICAgICB0aGlzJDEuY29tcG9zaW5nLmRvbmUgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgb24oZGl2LCBcInRvdWNoc3RhcnRcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gaW5wdXQuZm9yY2VDb21wb3NpdGlvbkVuZCgpOyB9KTtcblxuICBvbihkaXYsIFwiaW5wdXRcIiwgZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcyQxLmNvbXBvc2luZykgeyB0aGlzJDEucmVhZEZyb21ET01Tb29uKCk7IH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gb25Db3B5Q3V0KGUpIHtcbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpKSB7IHJldHVybiB9XG4gICAgaWYgKGNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgIHNldExhc3RDb3BpZWQoe2xpbmVXaXNlOiBmYWxzZSwgdGV4dDogY20uZ2V0U2VsZWN0aW9ucygpfSk7XG4gICAgICBpZiAoZS50eXBlID09IFwiY3V0XCIpIHsgY20ucmVwbGFjZVNlbGVjdGlvbihcIlwiLCBudWxsLCBcImN1dFwiKTsgfVxuICAgIH0gZWxzZSBpZiAoIWNtLm9wdGlvbnMubGluZVdpc2VDb3B5Q3V0KSB7XG4gICAgICByZXR1cm5cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJhbmdlcyA9IGNvcHlhYmxlUmFuZ2VzKGNtKTtcbiAgICAgIHNldExhc3RDb3BpZWQoe2xpbmVXaXNlOiB0cnVlLCB0ZXh0OiByYW5nZXMudGV4dH0pO1xuICAgICAgaWYgKGUudHlwZSA9PSBcImN1dFwiKSB7XG4gICAgICAgIGNtLm9wZXJhdGlvbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY20uc2V0U2VsZWN0aW9ucyhyYW5nZXMucmFuZ2VzLCAwLCBzZWxfZG9udFNjcm9sbCk7XG4gICAgICAgICAgY20ucmVwbGFjZVNlbGVjdGlvbihcIlwiLCBudWxsLCBcImN1dFwiKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlLmNsaXBib2FyZERhdGEpIHtcbiAgICAgIGUuY2xpcGJvYXJkRGF0YS5jbGVhckRhdGEoKTtcbiAgICAgIHZhciBjb250ZW50ID0gbGFzdENvcGllZC50ZXh0LmpvaW4oXCJcXG5cIik7XG4gICAgICAvLyBpT1MgZXhwb3NlcyB0aGUgY2xpcGJvYXJkIEFQSSwgYnV0IHNlZW1zIHRvIGRpc2NhcmQgY29udGVudCBpbnNlcnRlZCBpbnRvIGl0XG4gICAgICBlLmNsaXBib2FyZERhdGEuc2V0RGF0YShcIlRleHRcIiwgY29udGVudCk7XG4gICAgICBpZiAoZS5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJUZXh0XCIpID09IGNvbnRlbnQpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gT2xkLWZhc2hpb25lZCBicmllZmx5LWZvY3VzLWEtdGV4dGFyZWEgaGFja1xuICAgIHZhciBrbHVkZ2UgPSBoaWRkZW5UZXh0YXJlYSgpLCB0ZSA9IGtsdWRnZS5maXJzdENoaWxkO1xuICAgIGNtLmRpc3BsYXkubGluZVNwYWNlLmluc2VydEJlZm9yZShrbHVkZ2UsIGNtLmRpc3BsYXkubGluZVNwYWNlLmZpcnN0Q2hpbGQpO1xuICAgIHRlLnZhbHVlID0gbGFzdENvcGllZC50ZXh0LmpvaW4oXCJcXG5cIik7XG4gICAgdmFyIGhhZEZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICBzZWxlY3RJbnB1dCh0ZSk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5yZW1vdmVDaGlsZChrbHVkZ2UpO1xuICAgICAgaGFkRm9jdXMuZm9jdXMoKTtcbiAgICAgIGlmIChoYWRGb2N1cyA9PSBkaXYpIHsgaW5wdXQuc2hvd1ByaW1hcnlTZWxlY3Rpb24oKTsgfVxuICAgIH0sIDUwKTtcbiAgfVxuICBvbihkaXYsIFwiY29weVwiLCBvbkNvcHlDdXQpO1xuICBvbihkaXYsIFwiY3V0XCIsIG9uQ29weUN1dCk7XG59O1xuXG5Db250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUucHJlcGFyZVNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlc3VsdCA9IHByZXBhcmVTZWxlY3Rpb24odGhpcy5jbSwgZmFsc2UpO1xuICByZXN1bHQuZm9jdXMgPSB0aGlzLmNtLnN0YXRlLmZvY3VzZWQ7XG4gIHJldHVybiByZXN1bHRcbn07XG5cbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5zaG93U2VsZWN0aW9uID0gZnVuY3Rpb24gKGluZm8sIHRha2VGb2N1cykge1xuICBpZiAoIWluZm8gfHwgIXRoaXMuY20uZGlzcGxheS52aWV3Lmxlbmd0aCkgeyByZXR1cm4gfVxuICBpZiAoaW5mby5mb2N1cyB8fCB0YWtlRm9jdXMpIHsgdGhpcy5zaG93UHJpbWFyeVNlbGVjdGlvbigpOyB9XG4gIHRoaXMuc2hvd011bHRpcGxlU2VsZWN0aW9ucyhpbmZvKTtcbn07XG5cbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5zaG93UHJpbWFyeVNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSwgY20gPSB0aGlzLmNtLCBwcmltID0gY20uZG9jLnNlbC5wcmltYXJ5KCk7XG4gIHZhciBmcm9tID0gcHJpbS5mcm9tKCksIHRvID0gcHJpbS50bygpO1xuXG4gIGlmIChjbS5kaXNwbGF5LnZpZXdUbyA9PSBjbS5kaXNwbGF5LnZpZXdGcm9tIHx8IGZyb20ubGluZSA+PSBjbS5kaXNwbGF5LnZpZXdUbyB8fCB0by5saW5lIDwgY20uZGlzcGxheS52aWV3RnJvbSkge1xuICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBjdXJBbmNob3IgPSBkb21Ub1BvcyhjbSwgc2VsLmFuY2hvck5vZGUsIHNlbC5hbmNob3JPZmZzZXQpO1xuICB2YXIgY3VyRm9jdXMgPSBkb21Ub1BvcyhjbSwgc2VsLmZvY3VzTm9kZSwgc2VsLmZvY3VzT2Zmc2V0KTtcbiAgaWYgKGN1ckFuY2hvciAmJiAhY3VyQW5jaG9yLmJhZCAmJiBjdXJGb2N1cyAmJiAhY3VyRm9jdXMuYmFkICYmXG4gICAgICBjbXAobWluUG9zKGN1ckFuY2hvciwgY3VyRm9jdXMpLCBmcm9tKSA9PSAwICYmXG4gICAgICBjbXAobWF4UG9zKGN1ckFuY2hvciwgY3VyRm9jdXMpLCB0bykgPT0gMClcbiAgICB7IHJldHVybiB9XG5cbiAgdmFyIHZpZXcgPSBjbS5kaXNwbGF5LnZpZXc7XG4gIHZhciBzdGFydCA9IChmcm9tLmxpbmUgPj0gY20uZGlzcGxheS52aWV3RnJvbSAmJiBwb3NUb0RPTShjbSwgZnJvbSkpIHx8XG4gICAgICB7bm9kZTogdmlld1swXS5tZWFzdXJlLm1hcFsyXSwgb2Zmc2V0OiAwfTtcbiAgdmFyIGVuZCA9IHRvLmxpbmUgPCBjbS5kaXNwbGF5LnZpZXdUbyAmJiBwb3NUb0RPTShjbSwgdG8pO1xuICBpZiAoIWVuZCkge1xuICAgIHZhciBtZWFzdXJlID0gdmlld1t2aWV3Lmxlbmd0aCAtIDFdLm1lYXN1cmU7XG4gICAgdmFyIG1hcCQkMSA9IG1lYXN1cmUubWFwcyA/IG1lYXN1cmUubWFwc1ttZWFzdXJlLm1hcHMubGVuZ3RoIC0gMV0gOiBtZWFzdXJlLm1hcDtcbiAgICBlbmQgPSB7bm9kZTogbWFwJCQxW21hcCQkMS5sZW5ndGggLSAxXSwgb2Zmc2V0OiBtYXAkJDFbbWFwJCQxLmxlbmd0aCAtIDJdIC0gbWFwJCQxW21hcCQkMS5sZW5ndGggLSAzXX07XG4gIH1cblxuICBpZiAoIXN0YXJ0IHx8ICFlbmQpIHtcbiAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgb2xkID0gc2VsLnJhbmdlQ291bnQgJiYgc2VsLmdldFJhbmdlQXQoMCksIHJuZztcbiAgdHJ5IHsgcm5nID0gcmFuZ2Uoc3RhcnQubm9kZSwgc3RhcnQub2Zmc2V0LCBlbmQub2Zmc2V0LCBlbmQubm9kZSk7IH1cbiAgY2F0Y2goZSkge30gLy8gT3VyIG1vZGVsIG9mIHRoZSBET00gbWlnaHQgYmUgb3V0ZGF0ZWQsIGluIHdoaWNoIGNhc2UgdGhlIHJhbmdlIHdlIHRyeSB0byBzZXQgY2FuIGJlIGltcG9zc2libGVcbiAgaWYgKHJuZykge1xuICAgIGlmICghZ2Vja28gJiYgY20uc3RhdGUuZm9jdXNlZCkge1xuICAgICAgc2VsLmNvbGxhcHNlKHN0YXJ0Lm5vZGUsIHN0YXJ0Lm9mZnNldCk7XG4gICAgICBpZiAoIXJuZy5jb2xsYXBzZWQpIHtcbiAgICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWwuYWRkUmFuZ2Uocm5nKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgc2VsLmFkZFJhbmdlKHJuZyk7XG4gICAgfVxuICAgIGlmIChvbGQgJiYgc2VsLmFuY2hvck5vZGUgPT0gbnVsbCkgeyBzZWwuYWRkUmFuZ2Uob2xkKTsgfVxuICAgIGVsc2UgaWYgKGdlY2tvKSB7IHRoaXMuc3RhcnRHcmFjZVBlcmlvZCgpOyB9XG4gIH1cbiAgdGhpcy5yZW1lbWJlclNlbGVjdGlvbigpO1xufTtcblxuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnN0YXJ0R3JhY2VQZXJpb2QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgY2xlYXJUaW1lb3V0KHRoaXMuZ3JhY2VQZXJpb2QpO1xuICB0aGlzLmdyYWNlUGVyaW9kID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgdGhpcyQxLmdyYWNlUGVyaW9kID0gZmFsc2U7XG4gICAgaWYgKHRoaXMkMS5zZWxlY3Rpb25DaGFuZ2VkKCkpXG4gICAgICB7IHRoaXMkMS5jbS5vcGVyYXRpb24oZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcyQxLmNtLmN1ck9wLnNlbGVjdGlvbkNoYW5nZWQgPSB0cnVlOyB9KTsgfVxuICB9LCAyMCk7XG59O1xuXG5Db250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuc2hvd011bHRpcGxlU2VsZWN0aW9ucyA9IGZ1bmN0aW9uIChpbmZvKSB7XG4gIHJlbW92ZUNoaWxkcmVuQW5kQWRkKHRoaXMuY20uZGlzcGxheS5jdXJzb3JEaXYsIGluZm8uY3Vyc29ycyk7XG4gIHJlbW92ZUNoaWxkcmVuQW5kQWRkKHRoaXMuY20uZGlzcGxheS5zZWxlY3Rpb25EaXYsIGluZm8uc2VsZWN0aW9uKTtcbn07XG5cbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5yZW1lbWJlclNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgdGhpcy5sYXN0QW5jaG9yTm9kZSA9IHNlbC5hbmNob3JOb2RlOyB0aGlzLmxhc3RBbmNob3JPZmZzZXQgPSBzZWwuYW5jaG9yT2Zmc2V0O1xuICB0aGlzLmxhc3RGb2N1c05vZGUgPSBzZWwuZm9jdXNOb2RlOyB0aGlzLmxhc3RGb2N1c09mZnNldCA9IHNlbC5mb2N1c09mZnNldDtcbn07XG5cbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5zZWxlY3Rpb25JbkVkaXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgaWYgKCFzZWwucmFuZ2VDb3VudCkgeyByZXR1cm4gZmFsc2UgfVxuICB2YXIgbm9kZSA9IHNlbC5nZXRSYW5nZUF0KDApLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyO1xuICByZXR1cm4gY29udGFpbnModGhpcy5kaXYsIG5vZGUpXG59O1xuXG5Db250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUuZm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmNtLm9wdGlvbnMucmVhZE9ubHkgIT0gXCJub2N1cnNvclwiKSB7XG4gICAgaWYgKCF0aGlzLnNlbGVjdGlvbkluRWRpdG9yKCkpXG4gICAgICB7IHRoaXMuc2hvd1NlbGVjdGlvbih0aGlzLnByZXBhcmVTZWxlY3Rpb24oKSwgdHJ1ZSk7IH1cbiAgICB0aGlzLmRpdi5mb2N1cygpO1xuICB9XG59O1xuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLmJsdXIgPSBmdW5jdGlvbiAoKSB7IHRoaXMuZGl2LmJsdXIoKTsgfTtcbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5nZXRGaWVsZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZGl2IH07XG5cbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5zdXBwb3J0c1RvdWNoID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdHJ1ZSB9O1xuXG5Db250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUucmVjZWl2ZWRGb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGlucHV0ID0gdGhpcztcbiAgaWYgKHRoaXMuc2VsZWN0aW9uSW5FZGl0b3IoKSlcbiAgICB7IHRoaXMucG9sbFNlbGVjdGlvbigpOyB9XG4gIGVsc2VcbiAgICB7IHJ1bkluT3AodGhpcy5jbSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gaW5wdXQuY20uY3VyT3Auc2VsZWN0aW9uQ2hhbmdlZCA9IHRydWU7IH0pOyB9XG5cbiAgZnVuY3Rpb24gcG9sbCgpIHtcbiAgICBpZiAoaW5wdXQuY20uc3RhdGUuZm9jdXNlZCkge1xuICAgICAgaW5wdXQucG9sbFNlbGVjdGlvbigpO1xuICAgICAgaW5wdXQucG9sbGluZy5zZXQoaW5wdXQuY20ub3B0aW9ucy5wb2xsSW50ZXJ2YWwsIHBvbGwpO1xuICAgIH1cbiAgfVxuICB0aGlzLnBvbGxpbmcuc2V0KHRoaXMuY20ub3B0aW9ucy5wb2xsSW50ZXJ2YWwsIHBvbGwpO1xufTtcblxuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnNlbGVjdGlvbkNoYW5nZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gIHJldHVybiBzZWwuYW5jaG9yTm9kZSAhPSB0aGlzLmxhc3RBbmNob3JOb2RlIHx8IHNlbC5hbmNob3JPZmZzZXQgIT0gdGhpcy5sYXN0QW5jaG9yT2Zmc2V0IHx8XG4gICAgc2VsLmZvY3VzTm9kZSAhPSB0aGlzLmxhc3RGb2N1c05vZGUgfHwgc2VsLmZvY3VzT2Zmc2V0ICE9IHRoaXMubGFzdEZvY3VzT2Zmc2V0XG59O1xuXG5Db250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUucG9sbFNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMucmVhZERPTVRpbWVvdXQgIT0gbnVsbCB8fCB0aGlzLmdyYWNlUGVyaW9kIHx8ICF0aGlzLnNlbGVjdGlvbkNoYW5nZWQoKSkgeyByZXR1cm4gfVxuICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpLCBjbSA9IHRoaXMuY207XG4gIC8vIE9uIEFuZHJvaWQgQ2hyb21lICh2ZXJzaW9uIDU2LCBhdCBsZWFzdCksIGJhY2tzcGFjaW5nIGludG8gYW5cbiAgLy8gdW5lZGl0YWJsZSBibG9jayBlbGVtZW50IHdpbGwgcHV0IHRoZSBjdXJzb3IgaW4gdGhhdCBlbGVtZW50LFxuICAvLyBhbmQgdGhlbiwgYmVjYXVzZSBpdCdzIG5vdCBlZGl0YWJsZSwgaGlkZSB0aGUgdmlydHVhbCBrZXlib2FyZC5cbiAgLy8gQmVjYXVzZSBBbmRyb2lkIGRvZXNuJ3QgYWxsb3cgdXMgdG8gYWN0dWFsbHkgZGV0ZWN0IGJhY2tzcGFjZVxuICAvLyBwcmVzc2VzIGluIGEgc2FuZSB3YXksIHRoaXMgY29kZSBjaGVja3MgZm9yIHdoZW4gdGhhdCBoYXBwZW5zXG4gIC8vIGFuZCBzaW11bGF0ZXMgYSBiYWNrc3BhY2UgcHJlc3MgaW4gdGhpcyBjYXNlLlxuICBpZiAoYW5kcm9pZCAmJiBjaHJvbWUgJiYgdGhpcy5jbS5vcHRpb25zLmd1dHRlcnMubGVuZ3RoICYmIGlzSW5HdXR0ZXIoc2VsLmFuY2hvck5vZGUpKSB7XG4gICAgdGhpcy5jbS50cmlnZ2VyT25LZXlEb3duKHt0eXBlOiBcImtleWRvd25cIiwga2V5Q29kZTogOCwgcHJldmVudERlZmF1bHQ6IE1hdGguYWJzfSk7XG4gICAgdGhpcy5ibHVyKCk7XG4gICAgdGhpcy5mb2N1cygpO1xuICAgIHJldHVyblxuICB9XG4gIGlmICh0aGlzLmNvbXBvc2luZykgeyByZXR1cm4gfVxuICB0aGlzLnJlbWVtYmVyU2VsZWN0aW9uKCk7XG4gIHZhciBhbmNob3IgPSBkb21Ub1BvcyhjbSwgc2VsLmFuY2hvck5vZGUsIHNlbC5hbmNob3JPZmZzZXQpO1xuICB2YXIgaGVhZCA9IGRvbVRvUG9zKGNtLCBzZWwuZm9jdXNOb2RlLCBzZWwuZm9jdXNPZmZzZXQpO1xuICBpZiAoYW5jaG9yICYmIGhlYWQpIHsgcnVuSW5PcChjbSwgZnVuY3Rpb24gKCkge1xuICAgIHNldFNlbGVjdGlvbihjbS5kb2MsIHNpbXBsZVNlbGVjdGlvbihhbmNob3IsIGhlYWQpLCBzZWxfZG9udFNjcm9sbCk7XG4gICAgaWYgKGFuY2hvci5iYWQgfHwgaGVhZC5iYWQpIHsgY20uY3VyT3Auc2VsZWN0aW9uQ2hhbmdlZCA9IHRydWU7IH1cbiAgfSk7IH1cbn07XG5cbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5wb2xsQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMucmVhZERPTVRpbWVvdXQgIT0gbnVsbCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnJlYWRET01UaW1lb3V0KTtcbiAgICB0aGlzLnJlYWRET01UaW1lb3V0ID0gbnVsbDtcbiAgfVxuXG4gIHZhciBjbSA9IHRoaXMuY20sIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBzZWwgPSBjbS5kb2Muc2VsLnByaW1hcnkoKTtcbiAgdmFyIGZyb20gPSBzZWwuZnJvbSgpLCB0byA9IHNlbC50bygpO1xuICBpZiAoZnJvbS5jaCA9PSAwICYmIGZyb20ubGluZSA+IGNtLmZpcnN0TGluZSgpKVxuICAgIHsgZnJvbSA9IFBvcyhmcm9tLmxpbmUgLSAxLCBnZXRMaW5lKGNtLmRvYywgZnJvbS5saW5lIC0gMSkubGVuZ3RoKTsgfVxuICBpZiAodG8uY2ggPT0gZ2V0TGluZShjbS5kb2MsIHRvLmxpbmUpLnRleHQubGVuZ3RoICYmIHRvLmxpbmUgPCBjbS5sYXN0TGluZSgpKVxuICAgIHsgdG8gPSBQb3ModG8ubGluZSArIDEsIDApOyB9XG4gIGlmIChmcm9tLmxpbmUgPCBkaXNwbGF5LnZpZXdGcm9tIHx8IHRvLmxpbmUgPiBkaXNwbGF5LnZpZXdUbyAtIDEpIHsgcmV0dXJuIGZhbHNlIH1cblxuICB2YXIgZnJvbUluZGV4LCBmcm9tTGluZSwgZnJvbU5vZGU7XG4gIGlmIChmcm9tLmxpbmUgPT0gZGlzcGxheS52aWV3RnJvbSB8fCAoZnJvbUluZGV4ID0gZmluZFZpZXdJbmRleChjbSwgZnJvbS5saW5lKSkgPT0gMCkge1xuICAgIGZyb21MaW5lID0gbGluZU5vKGRpc3BsYXkudmlld1swXS5saW5lKTtcbiAgICBmcm9tTm9kZSA9IGRpc3BsYXkudmlld1swXS5ub2RlO1xuICB9IGVsc2Uge1xuICAgIGZyb21MaW5lID0gbGluZU5vKGRpc3BsYXkudmlld1tmcm9tSW5kZXhdLmxpbmUpO1xuICAgIGZyb21Ob2RlID0gZGlzcGxheS52aWV3W2Zyb21JbmRleCAtIDFdLm5vZGUubmV4dFNpYmxpbmc7XG4gIH1cbiAgdmFyIHRvSW5kZXggPSBmaW5kVmlld0luZGV4KGNtLCB0by5saW5lKTtcbiAgdmFyIHRvTGluZSwgdG9Ob2RlO1xuICBpZiAodG9JbmRleCA9PSBkaXNwbGF5LnZpZXcubGVuZ3RoIC0gMSkge1xuICAgIHRvTGluZSA9IGRpc3BsYXkudmlld1RvIC0gMTtcbiAgICB0b05vZGUgPSBkaXNwbGF5LmxpbmVEaXYubGFzdENoaWxkO1xuICB9IGVsc2Uge1xuICAgIHRvTGluZSA9IGxpbmVObyhkaXNwbGF5LnZpZXdbdG9JbmRleCArIDFdLmxpbmUpIC0gMTtcbiAgICB0b05vZGUgPSBkaXNwbGF5LnZpZXdbdG9JbmRleCArIDFdLm5vZGUucHJldmlvdXNTaWJsaW5nO1xuICB9XG5cbiAgaWYgKCFmcm9tTm9kZSkgeyByZXR1cm4gZmFsc2UgfVxuICB2YXIgbmV3VGV4dCA9IGNtLmRvYy5zcGxpdExpbmVzKGRvbVRleHRCZXR3ZWVuKGNtLCBmcm9tTm9kZSwgdG9Ob2RlLCBmcm9tTGluZSwgdG9MaW5lKSk7XG4gIHZhciBvbGRUZXh0ID0gZ2V0QmV0d2VlbihjbS5kb2MsIFBvcyhmcm9tTGluZSwgMCksIFBvcyh0b0xpbmUsIGdldExpbmUoY20uZG9jLCB0b0xpbmUpLnRleHQubGVuZ3RoKSk7XG4gIHdoaWxlIChuZXdUZXh0Lmxlbmd0aCA+IDEgJiYgb2xkVGV4dC5sZW5ndGggPiAxKSB7XG4gICAgaWYgKGxzdChuZXdUZXh0KSA9PSBsc3Qob2xkVGV4dCkpIHsgbmV3VGV4dC5wb3AoKTsgb2xkVGV4dC5wb3AoKTsgdG9MaW5lLS07IH1cbiAgICBlbHNlIGlmIChuZXdUZXh0WzBdID09IG9sZFRleHRbMF0pIHsgbmV3VGV4dC5zaGlmdCgpOyBvbGRUZXh0LnNoaWZ0KCk7IGZyb21MaW5lKys7IH1cbiAgICBlbHNlIHsgYnJlYWsgfVxuICB9XG5cbiAgdmFyIGN1dEZyb250ID0gMCwgY3V0RW5kID0gMDtcbiAgdmFyIG5ld1RvcCA9IG5ld1RleHRbMF0sIG9sZFRvcCA9IG9sZFRleHRbMF0sIG1heEN1dEZyb250ID0gTWF0aC5taW4obmV3VG9wLmxlbmd0aCwgb2xkVG9wLmxlbmd0aCk7XG4gIHdoaWxlIChjdXRGcm9udCA8IG1heEN1dEZyb250ICYmIG5ld1RvcC5jaGFyQ29kZUF0KGN1dEZyb250KSA9PSBvbGRUb3AuY2hhckNvZGVBdChjdXRGcm9udCkpXG4gICAgeyArK2N1dEZyb250OyB9XG4gIHZhciBuZXdCb3QgPSBsc3QobmV3VGV4dCksIG9sZEJvdCA9IGxzdChvbGRUZXh0KTtcbiAgdmFyIG1heEN1dEVuZCA9IE1hdGgubWluKG5ld0JvdC5sZW5ndGggLSAobmV3VGV4dC5sZW5ndGggPT0gMSA/IGN1dEZyb250IDogMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRCb3QubGVuZ3RoIC0gKG9sZFRleHQubGVuZ3RoID09IDEgPyBjdXRGcm9udCA6IDApKTtcbiAgd2hpbGUgKGN1dEVuZCA8IG1heEN1dEVuZCAmJlxuICAgICAgICAgbmV3Qm90LmNoYXJDb2RlQXQobmV3Qm90Lmxlbmd0aCAtIGN1dEVuZCAtIDEpID09IG9sZEJvdC5jaGFyQ29kZUF0KG9sZEJvdC5sZW5ndGggLSBjdXRFbmQgLSAxKSlcbiAgICB7ICsrY3V0RW5kOyB9XG4gIC8vIFRyeSB0byBtb3ZlIHN0YXJ0IG9mIGNoYW5nZSB0byBzdGFydCBvZiBzZWxlY3Rpb24gaWYgYW1iaWd1b3VzXG4gIGlmIChuZXdUZXh0Lmxlbmd0aCA9PSAxICYmIG9sZFRleHQubGVuZ3RoID09IDEgJiYgZnJvbUxpbmUgPT0gZnJvbS5saW5lKSB7XG4gICAgd2hpbGUgKGN1dEZyb250ICYmIGN1dEZyb250ID4gZnJvbS5jaCAmJlxuICAgICAgICAgICBuZXdCb3QuY2hhckNvZGVBdChuZXdCb3QubGVuZ3RoIC0gY3V0RW5kIC0gMSkgPT0gb2xkQm90LmNoYXJDb2RlQXQob2xkQm90Lmxlbmd0aCAtIGN1dEVuZCAtIDEpKSB7XG4gICAgICBjdXRGcm9udC0tO1xuICAgICAgY3V0RW5kKys7XG4gICAgfVxuICB9XG5cbiAgbmV3VGV4dFtuZXdUZXh0Lmxlbmd0aCAtIDFdID0gbmV3Qm90LnNsaWNlKDAsIG5ld0JvdC5sZW5ndGggLSBjdXRFbmQpLnJlcGxhY2UoL15cXHUyMDBiKy8sIFwiXCIpO1xuICBuZXdUZXh0WzBdID0gbmV3VGV4dFswXS5zbGljZShjdXRGcm9udCkucmVwbGFjZSgvXFx1MjAwYiskLywgXCJcIik7XG5cbiAgdmFyIGNoRnJvbSA9IFBvcyhmcm9tTGluZSwgY3V0RnJvbnQpO1xuICB2YXIgY2hUbyA9IFBvcyh0b0xpbmUsIG9sZFRleHQubGVuZ3RoID8gbHN0KG9sZFRleHQpLmxlbmd0aCAtIGN1dEVuZCA6IDApO1xuICBpZiAobmV3VGV4dC5sZW5ndGggPiAxIHx8IG5ld1RleHRbMF0gfHwgY21wKGNoRnJvbSwgY2hUbykpIHtcbiAgICByZXBsYWNlUmFuZ2UoY20uZG9jLCBuZXdUZXh0LCBjaEZyb20sIGNoVG8sIFwiK2lucHV0XCIpO1xuICAgIHJldHVybiB0cnVlXG4gIH1cbn07XG5cbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5lbnN1cmVQb2xsZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZm9yY2VDb21wb3NpdGlvbkVuZCgpO1xufTtcbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5mb3JjZUNvbXBvc2l0aW9uRW5kKCk7XG59O1xuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLmZvcmNlQ29tcG9zaXRpb25FbmQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5jb21wb3NpbmcpIHsgcmV0dXJuIH1cbiAgY2xlYXJUaW1lb3V0KHRoaXMucmVhZERPTVRpbWVvdXQpO1xuICB0aGlzLmNvbXBvc2luZyA9IG51bGw7XG4gIHRoaXMudXBkYXRlRnJvbURPTSgpO1xuICB0aGlzLmRpdi5ibHVyKCk7XG4gIHRoaXMuZGl2LmZvY3VzKCk7XG59O1xuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnJlYWRGcm9tRE9NU29vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAodGhpcy5yZWFkRE9NVGltZW91dCAhPSBudWxsKSB7IHJldHVybiB9XG4gIHRoaXMucmVhZERPTVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzJDEucmVhZERPTVRpbWVvdXQgPSBudWxsO1xuICAgIGlmICh0aGlzJDEuY29tcG9zaW5nKSB7XG4gICAgICBpZiAodGhpcyQxLmNvbXBvc2luZy5kb25lKSB7IHRoaXMkMS5jb21wb3NpbmcgPSBudWxsOyB9XG4gICAgICBlbHNlIHsgcmV0dXJuIH1cbiAgICB9XG4gICAgdGhpcyQxLnVwZGF0ZUZyb21ET00oKTtcbiAgfSwgODApO1xufTtcblxuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnVwZGF0ZUZyb21ET00gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgaWYgKHRoaXMuY20uaXNSZWFkT25seSgpIHx8ICF0aGlzLnBvbGxDb250ZW50KCkpXG4gICAgeyBydW5Jbk9wKHRoaXMuY20sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlZ0NoYW5nZSh0aGlzJDEuY20pOyB9KTsgfVxufTtcblxuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnNldFVuZWRpdGFibGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICBub2RlLmNvbnRlbnRFZGl0YWJsZSA9IFwiZmFsc2VcIjtcbn07XG5cbkNvbnRlbnRFZGl0YWJsZUlucHV0LnByb3RvdHlwZS5vbktleVByZXNzID0gZnVuY3Rpb24gKGUpIHtcbiAgaWYgKGUuY2hhckNvZGUgPT0gMCkgeyByZXR1cm4gfVxuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGlmICghdGhpcy5jbS5pc1JlYWRPbmx5KCkpXG4gICAgeyBvcGVyYXRpb24odGhpcy5jbSwgYXBwbHlUZXh0SW5wdXQpKHRoaXMuY20sIFN0cmluZy5mcm9tQ2hhckNvZGUoZS5jaGFyQ29kZSA9PSBudWxsID8gZS5rZXlDb2RlIDogZS5jaGFyQ29kZSksIDApOyB9XG59O1xuXG5Db250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUucmVhZE9ubHlDaGFuZ2VkID0gZnVuY3Rpb24gKHZhbCkge1xuICB0aGlzLmRpdi5jb250ZW50RWRpdGFibGUgPSBTdHJpbmcodmFsICE9IFwibm9jdXJzb3JcIik7XG59O1xuXG5Db250ZW50RWRpdGFibGVJbnB1dC5wcm90b3R5cGUub25Db250ZXh0TWVudSA9IGZ1bmN0aW9uICgpIHt9O1xuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLnJlc2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7fTtcblxuQ29udGVudEVkaXRhYmxlSW5wdXQucHJvdG90eXBlLm5lZWRzQ29udGVudEF0dHJpYnV0ZSA9IHRydWU7XG5cbmZ1bmN0aW9uIHBvc1RvRE9NKGNtLCBwb3MpIHtcbiAgdmFyIHZpZXcgPSBmaW5kVmlld0ZvckxpbmUoY20sIHBvcy5saW5lKTtcbiAgaWYgKCF2aWV3IHx8IHZpZXcuaGlkZGVuKSB7IHJldHVybiBudWxsIH1cbiAgdmFyIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgcG9zLmxpbmUpO1xuICB2YXIgaW5mbyA9IG1hcEZyb21MaW5lVmlldyh2aWV3LCBsaW5lLCBwb3MubGluZSk7XG5cbiAgdmFyIG9yZGVyID0gZ2V0T3JkZXIobGluZSwgY20uZG9jLmRpcmVjdGlvbiksIHNpZGUgPSBcImxlZnRcIjtcbiAgaWYgKG9yZGVyKSB7XG4gICAgdmFyIHBhcnRQb3MgPSBnZXRCaWRpUGFydEF0KG9yZGVyLCBwb3MuY2gpO1xuICAgIHNpZGUgPSBwYXJ0UG9zICUgMiA/IFwicmlnaHRcIiA6IFwibGVmdFwiO1xuICB9XG4gIHZhciByZXN1bHQgPSBub2RlQW5kT2Zmc2V0SW5MaW5lTWFwKGluZm8ubWFwLCBwb3MuY2gsIHNpZGUpO1xuICByZXN1bHQub2Zmc2V0ID0gcmVzdWx0LmNvbGxhcHNlID09IFwicmlnaHRcIiA/IHJlc3VsdC5lbmQgOiByZXN1bHQuc3RhcnQ7XG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gaXNJbkd1dHRlcihub2RlKSB7XG4gIGZvciAodmFyIHNjYW4gPSBub2RlOyBzY2FuOyBzY2FuID0gc2Nhbi5wYXJlbnROb2RlKVxuICAgIHsgaWYgKC9Db2RlTWlycm9yLWd1dHRlci13cmFwcGVyLy50ZXN0KHNjYW4uY2xhc3NOYW1lKSkgeyByZXR1cm4gdHJ1ZSB9IH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGJhZFBvcyhwb3MsIGJhZCkgeyBpZiAoYmFkKSB7IHBvcy5iYWQgPSB0cnVlOyB9IHJldHVybiBwb3MgfVxuXG5mdW5jdGlvbiBkb21UZXh0QmV0d2VlbihjbSwgZnJvbSwgdG8sIGZyb21MaW5lLCB0b0xpbmUpIHtcbiAgdmFyIHRleHQgPSBcIlwiLCBjbG9zaW5nID0gZmFsc2UsIGxpbmVTZXAgPSBjbS5kb2MubGluZVNlcGFyYXRvcigpO1xuICBmdW5jdGlvbiByZWNvZ25pemVNYXJrZXIoaWQpIHsgcmV0dXJuIGZ1bmN0aW9uIChtYXJrZXIpIHsgcmV0dXJuIG1hcmtlci5pZCA9PSBpZDsgfSB9XG4gIGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgIGlmIChjbG9zaW5nKSB7XG4gICAgICB0ZXh0ICs9IGxpbmVTZXA7XG4gICAgICBjbG9zaW5nID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGFkZFRleHQoc3RyKSB7XG4gICAgaWYgKHN0cikge1xuICAgICAgY2xvc2UoKTtcbiAgICAgIHRleHQgKz0gc3RyO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB3YWxrKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PSAxKSB7XG4gICAgICB2YXIgY21UZXh0ID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJjbS10ZXh0XCIpO1xuICAgICAgaWYgKGNtVGV4dCAhPSBudWxsKSB7XG4gICAgICAgIGFkZFRleHQoY21UZXh0IHx8IG5vZGUudGV4dENvbnRlbnQucmVwbGFjZSgvXFx1MjAwYi9nLCBcIlwiKSk7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdmFyIG1hcmtlcklEID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJjbS1tYXJrZXJcIiksIHJhbmdlJCQxO1xuICAgICAgaWYgKG1hcmtlcklEKSB7XG4gICAgICAgIHZhciBmb3VuZCA9IGNtLmZpbmRNYXJrcyhQb3MoZnJvbUxpbmUsIDApLCBQb3ModG9MaW5lICsgMSwgMCksIHJlY29nbml6ZU1hcmtlcigrbWFya2VySUQpKTtcbiAgICAgICAgaWYgKGZvdW5kLmxlbmd0aCAmJiAocmFuZ2UkJDEgPSBmb3VuZFswXS5maW5kKCkpKVxuICAgICAgICAgIHsgYWRkVGV4dChnZXRCZXR3ZWVuKGNtLmRvYywgcmFuZ2UkJDEuZnJvbSwgcmFuZ2UkJDEudG8pLmpvaW4obGluZVNlcCkpOyB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKG5vZGUuZ2V0QXR0cmlidXRlKFwiY29udGVudGVkaXRhYmxlXCIpID09IFwiZmFsc2VcIikgeyByZXR1cm4gfVxuICAgICAgdmFyIGlzQmxvY2sgPSAvXihwcmV8ZGl2fHApJC9pLnRlc3Qobm9kZS5ub2RlTmFtZSk7XG4gICAgICBpZiAoaXNCbG9jaykgeyBjbG9zZSgpOyB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgeyB3YWxrKG5vZGUuY2hpbGROb2Rlc1tpXSk7IH1cbiAgICAgIGlmIChpc0Jsb2NrKSB7IGNsb3NpbmcgPSB0cnVlOyB9XG4gICAgfSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09IDMpIHtcbiAgICAgIGFkZFRleHQobm9kZS5ub2RlVmFsdWUpO1xuICAgIH1cbiAgfVxuICBmb3IgKDs7KSB7XG4gICAgd2Fsayhmcm9tKTtcbiAgICBpZiAoZnJvbSA9PSB0bykgeyBicmVhayB9XG4gICAgZnJvbSA9IGZyb20ubmV4dFNpYmxpbmc7XG4gIH1cbiAgcmV0dXJuIHRleHRcbn1cblxuZnVuY3Rpb24gZG9tVG9Qb3MoY20sIG5vZGUsIG9mZnNldCkge1xuICB2YXIgbGluZU5vZGU7XG4gIGlmIChub2RlID09IGNtLmRpc3BsYXkubGluZURpdikge1xuICAgIGxpbmVOb2RlID0gY20uZGlzcGxheS5saW5lRGl2LmNoaWxkTm9kZXNbb2Zmc2V0XTtcbiAgICBpZiAoIWxpbmVOb2RlKSB7IHJldHVybiBiYWRQb3MoY20uY2xpcFBvcyhQb3MoY20uZGlzcGxheS52aWV3VG8gLSAxKSksIHRydWUpIH1cbiAgICBub2RlID0gbnVsbDsgb2Zmc2V0ID0gMDtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGxpbmVOb2RlID0gbm9kZTs7IGxpbmVOb2RlID0gbGluZU5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgaWYgKCFsaW5lTm9kZSB8fCBsaW5lTm9kZSA9PSBjbS5kaXNwbGF5LmxpbmVEaXYpIHsgcmV0dXJuIG51bGwgfVxuICAgICAgaWYgKGxpbmVOb2RlLnBhcmVudE5vZGUgJiYgbGluZU5vZGUucGFyZW50Tm9kZSA9PSBjbS5kaXNwbGF5LmxpbmVEaXYpIHsgYnJlYWsgfVxuICAgIH1cbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNtLmRpc3BsYXkudmlldy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBsaW5lVmlldyA9IGNtLmRpc3BsYXkudmlld1tpXTtcbiAgICBpZiAobGluZVZpZXcubm9kZSA9PSBsaW5lTm9kZSlcbiAgICAgIHsgcmV0dXJuIGxvY2F0ZU5vZGVJbkxpbmVWaWV3KGxpbmVWaWV3LCBub2RlLCBvZmZzZXQpIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBsb2NhdGVOb2RlSW5MaW5lVmlldyhsaW5lVmlldywgbm9kZSwgb2Zmc2V0KSB7XG4gIHZhciB3cmFwcGVyID0gbGluZVZpZXcudGV4dC5maXJzdENoaWxkLCBiYWQgPSBmYWxzZTtcbiAgaWYgKCFub2RlIHx8ICFjb250YWlucyh3cmFwcGVyLCBub2RlKSkgeyByZXR1cm4gYmFkUG9zKFBvcyhsaW5lTm8obGluZVZpZXcubGluZSksIDApLCB0cnVlKSB9XG4gIGlmIChub2RlID09IHdyYXBwZXIpIHtcbiAgICBiYWQgPSB0cnVlO1xuICAgIG5vZGUgPSB3cmFwcGVyLmNoaWxkTm9kZXNbb2Zmc2V0XTtcbiAgICBvZmZzZXQgPSAwO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgdmFyIGxpbmUgPSBsaW5lVmlldy5yZXN0ID8gbHN0KGxpbmVWaWV3LnJlc3QpIDogbGluZVZpZXcubGluZTtcbiAgICAgIHJldHVybiBiYWRQb3MoUG9zKGxpbmVObyhsaW5lKSwgbGluZS50ZXh0Lmxlbmd0aCksIGJhZClcbiAgICB9XG4gIH1cblxuICB2YXIgdGV4dE5vZGUgPSBub2RlLm5vZGVUeXBlID09IDMgPyBub2RlIDogbnVsbCwgdG9wTm9kZSA9IG5vZGU7XG4gIGlmICghdGV4dE5vZGUgJiYgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA9PSAxICYmIG5vZGUuZmlyc3RDaGlsZC5ub2RlVHlwZSA9PSAzKSB7XG4gICAgdGV4dE5vZGUgPSBub2RlLmZpcnN0Q2hpbGQ7XG4gICAgaWYgKG9mZnNldCkgeyBvZmZzZXQgPSB0ZXh0Tm9kZS5ub2RlVmFsdWUubGVuZ3RoOyB9XG4gIH1cbiAgd2hpbGUgKHRvcE5vZGUucGFyZW50Tm9kZSAhPSB3cmFwcGVyKSB7IHRvcE5vZGUgPSB0b3BOb2RlLnBhcmVudE5vZGU7IH1cbiAgdmFyIG1lYXN1cmUgPSBsaW5lVmlldy5tZWFzdXJlLCBtYXBzID0gbWVhc3VyZS5tYXBzO1xuXG4gIGZ1bmN0aW9uIGZpbmQodGV4dE5vZGUsIHRvcE5vZGUsIG9mZnNldCkge1xuICAgIGZvciAodmFyIGkgPSAtMTsgaSA8IChtYXBzID8gbWFwcy5sZW5ndGggOiAwKTsgaSsrKSB7XG4gICAgICB2YXIgbWFwJCQxID0gaSA8IDAgPyBtZWFzdXJlLm1hcCA6IG1hcHNbaV07XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hcCQkMS5sZW5ndGg7IGogKz0gMykge1xuICAgICAgICB2YXIgY3VyTm9kZSA9IG1hcCQkMVtqICsgMl07XG4gICAgICAgIGlmIChjdXJOb2RlID09IHRleHROb2RlIHx8IGN1ck5vZGUgPT0gdG9wTm9kZSkge1xuICAgICAgICAgIHZhciBsaW5lID0gbGluZU5vKGkgPCAwID8gbGluZVZpZXcubGluZSA6IGxpbmVWaWV3LnJlc3RbaV0pO1xuICAgICAgICAgIHZhciBjaCA9IG1hcCQkMVtqXSArIG9mZnNldDtcbiAgICAgICAgICBpZiAob2Zmc2V0IDwgMCB8fCBjdXJOb2RlICE9IHRleHROb2RlKSB7IGNoID0gbWFwJCQxW2ogKyAob2Zmc2V0ID8gMSA6IDApXTsgfVxuICAgICAgICAgIHJldHVybiBQb3MobGluZSwgY2gpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdmFyIGZvdW5kID0gZmluZCh0ZXh0Tm9kZSwgdG9wTm9kZSwgb2Zmc2V0KTtcbiAgaWYgKGZvdW5kKSB7IHJldHVybiBiYWRQb3MoZm91bmQsIGJhZCkgfVxuXG4gIC8vIEZJWE1FIHRoaXMgaXMgYWxsIHJlYWxseSBzaGFreS4gbWlnaHQgaGFuZGxlIHRoZSBmZXcgY2FzZXMgaXQgbmVlZHMgdG8gaGFuZGxlLCBidXQgbGlrZWx5IHRvIGNhdXNlIHByb2JsZW1zXG4gIGZvciAodmFyIGFmdGVyID0gdG9wTm9kZS5uZXh0U2libGluZywgZGlzdCA9IHRleHROb2RlID8gdGV4dE5vZGUubm9kZVZhbHVlLmxlbmd0aCAtIG9mZnNldCA6IDA7IGFmdGVyOyBhZnRlciA9IGFmdGVyLm5leHRTaWJsaW5nKSB7XG4gICAgZm91bmQgPSBmaW5kKGFmdGVyLCBhZnRlci5maXJzdENoaWxkLCAwKTtcbiAgICBpZiAoZm91bmQpXG4gICAgICB7IHJldHVybiBiYWRQb3MoUG9zKGZvdW5kLmxpbmUsIGZvdW5kLmNoIC0gZGlzdCksIGJhZCkgfVxuICAgIGVsc2VcbiAgICAgIHsgZGlzdCArPSBhZnRlci50ZXh0Q29udGVudC5sZW5ndGg7IH1cbiAgfVxuICBmb3IgKHZhciBiZWZvcmUgPSB0b3BOb2RlLnByZXZpb3VzU2libGluZywgZGlzdCQxID0gb2Zmc2V0OyBiZWZvcmU7IGJlZm9yZSA9IGJlZm9yZS5wcmV2aW91c1NpYmxpbmcpIHtcbiAgICBmb3VuZCA9IGZpbmQoYmVmb3JlLCBiZWZvcmUuZmlyc3RDaGlsZCwgLTEpO1xuICAgIGlmIChmb3VuZClcbiAgICAgIHsgcmV0dXJuIGJhZFBvcyhQb3MoZm91bmQubGluZSwgZm91bmQuY2ggKyBkaXN0JDEpLCBiYWQpIH1cbiAgICBlbHNlXG4gICAgICB7IGRpc3QkMSArPSBiZWZvcmUudGV4dENvbnRlbnQubGVuZ3RoOyB9XG4gIH1cbn1cblxuLy8gVEVYVEFSRUEgSU5QVVQgU1RZTEVcblxudmFyIFRleHRhcmVhSW5wdXQgPSBmdW5jdGlvbihjbSkge1xuICB0aGlzLmNtID0gY207XG4gIC8vIFNlZSBpbnB1dC5wb2xsIGFuZCBpbnB1dC5yZXNldFxuICB0aGlzLnByZXZJbnB1dCA9IFwiXCI7XG5cbiAgLy8gRmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHdlIGV4cGVjdCBpbnB1dCB0byBhcHBlYXIgcmVhbCBzb29uXG4gIC8vIG5vdyAoYWZ0ZXIgc29tZSBldmVudCBsaWtlICdrZXlwcmVzcycgb3IgJ2lucHV0JykgYW5kIGFyZVxuICAvLyBwb2xsaW5nIGludGVuc2l2ZWx5LlxuICB0aGlzLnBvbGxpbmdGYXN0ID0gZmFsc2U7XG4gIC8vIFNlbGYtcmVzZXR0aW5nIHRpbWVvdXQgZm9yIHRoZSBwb2xsZXJcbiAgdGhpcy5wb2xsaW5nID0gbmV3IERlbGF5ZWQoKTtcbiAgLy8gVHJhY2tzIHdoZW4gaW5wdXQucmVzZXQgaGFzIHB1bnRlZCB0byBqdXN0IHB1dHRpbmcgYSBzaG9ydFxuICAvLyBzdHJpbmcgaW50byB0aGUgdGV4dGFyZWEgaW5zdGVhZCBvZiB0aGUgZnVsbCBzZWxlY3Rpb24uXG4gIHRoaXMuaW5hY2N1cmF0ZVNlbGVjdGlvbiA9IGZhbHNlO1xuICAvLyBVc2VkIHRvIHdvcmsgYXJvdW5kIElFIGlzc3VlIHdpdGggc2VsZWN0aW9uIGJlaW5nIGZvcmdvdHRlbiB3aGVuIGZvY3VzIG1vdmVzIGF3YXkgZnJvbSB0ZXh0YXJlYVxuICB0aGlzLmhhc1NlbGVjdGlvbiA9IGZhbHNlO1xuICB0aGlzLmNvbXBvc2luZyA9IG51bGw7XG59O1xuXG5UZXh0YXJlYUlucHV0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGRpc3BsYXkpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB2YXIgaW5wdXQgPSB0aGlzLCBjbSA9IHRoaXMuY207XG5cbiAgLy8gV3JhcHMgYW5kIGhpZGVzIGlucHV0IHRleHRhcmVhXG4gIHZhciBkaXYgPSB0aGlzLndyYXBwZXIgPSBoaWRkZW5UZXh0YXJlYSgpO1xuICAvLyBUaGUgc2VtaWhpZGRlbiB0ZXh0YXJlYSB0aGF0IGlzIGZvY3VzZWQgd2hlbiB0aGUgZWRpdG9yIGlzXG4gIC8vIGZvY3VzZWQsIGFuZCByZWNlaXZlcyBpbnB1dC5cbiAgdmFyIHRlID0gdGhpcy50ZXh0YXJlYSA9IGRpdi5maXJzdENoaWxkO1xuICBkaXNwbGF5LndyYXBwZXIuaW5zZXJ0QmVmb3JlKGRpdiwgZGlzcGxheS53cmFwcGVyLmZpcnN0Q2hpbGQpO1xuXG4gIC8vIE5lZWRlZCB0byBoaWRlIGJpZyBibHVlIGJsaW5raW5nIGN1cnNvciBvbiBNb2JpbGUgU2FmYXJpIChkb2Vzbid0IHNlZW0gdG8gd29yayBpbiBpT1MgOCBhbnltb3JlKVxuICBpZiAoaW9zKSB7IHRlLnN0eWxlLndpZHRoID0gXCIwcHhcIjsgfVxuXG4gIG9uKHRlLCBcImlucHV0XCIsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA+PSA5ICYmIHRoaXMkMS5oYXNTZWxlY3Rpb24pIHsgdGhpcyQxLmhhc1NlbGVjdGlvbiA9IG51bGw7IH1cbiAgICBpbnB1dC5wb2xsKCk7XG4gIH0pO1xuXG4gIG9uKHRlLCBcInBhc3RlXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlKSB8fCBoYW5kbGVQYXN0ZShlLCBjbSkpIHsgcmV0dXJuIH1cblxuICAgIGNtLnN0YXRlLnBhc3RlSW5jb21pbmcgPSB0cnVlO1xuICAgIGlucHV0LmZhc3RQb2xsKCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHByZXBhcmVDb3B5Q3V0KGUpIHtcbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpKSB7IHJldHVybiB9XG4gICAgaWYgKGNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgIHNldExhc3RDb3BpZWQoe2xpbmVXaXNlOiBmYWxzZSwgdGV4dDogY20uZ2V0U2VsZWN0aW9ucygpfSk7XG4gICAgICBpZiAoaW5wdXQuaW5hY2N1cmF0ZVNlbGVjdGlvbikge1xuICAgICAgICBpbnB1dC5wcmV2SW5wdXQgPSBcIlwiO1xuICAgICAgICBpbnB1dC5pbmFjY3VyYXRlU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIHRlLnZhbHVlID0gbGFzdENvcGllZC50ZXh0LmpvaW4oXCJcXG5cIik7XG4gICAgICAgIHNlbGVjdElucHV0KHRlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFjbS5vcHRpb25zLmxpbmVXaXNlQ29weUN1dCkge1xuICAgICAgcmV0dXJuXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByYW5nZXMgPSBjb3B5YWJsZVJhbmdlcyhjbSk7XG4gICAgICBzZXRMYXN0Q29waWVkKHtsaW5lV2lzZTogdHJ1ZSwgdGV4dDogcmFuZ2VzLnRleHR9KTtcbiAgICAgIGlmIChlLnR5cGUgPT0gXCJjdXRcIikge1xuICAgICAgICBjbS5zZXRTZWxlY3Rpb25zKHJhbmdlcy5yYW5nZXMsIG51bGwsIHNlbF9kb250U2Nyb2xsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlucHV0LnByZXZJbnB1dCA9IFwiXCI7XG4gICAgICAgIHRlLnZhbHVlID0gcmFuZ2VzLnRleHQuam9pbihcIlxcblwiKTtcbiAgICAgICAgc2VsZWN0SW5wdXQodGUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZS50eXBlID09IFwiY3V0XCIpIHsgY20uc3RhdGUuY3V0SW5jb21pbmcgPSB0cnVlOyB9XG4gIH1cbiAgb24odGUsIFwiY3V0XCIsIHByZXBhcmVDb3B5Q3V0KTtcbiAgb24odGUsIFwiY29weVwiLCBwcmVwYXJlQ29weUN1dCk7XG5cbiAgb24oZGlzcGxheS5zY3JvbGxlciwgXCJwYXN0ZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChldmVudEluV2lkZ2V0KGRpc3BsYXksIGUpIHx8IHNpZ25hbERPTUV2ZW50KGNtLCBlKSkgeyByZXR1cm4gfVxuICAgIGNtLnN0YXRlLnBhc3RlSW5jb21pbmcgPSB0cnVlO1xuICAgIGlucHV0LmZvY3VzKCk7XG4gIH0pO1xuXG4gIC8vIFByZXZlbnQgbm9ybWFsIHNlbGVjdGlvbiBpbiB0aGUgZWRpdG9yICh3ZSBoYW5kbGUgb3VyIG93bilcbiAgb24oZGlzcGxheS5saW5lU3BhY2UsIFwic2VsZWN0c3RhcnRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoIWV2ZW50SW5XaWRnZXQoZGlzcGxheSwgZSkpIHsgZV9wcmV2ZW50RGVmYXVsdChlKTsgfVxuICB9KTtcblxuICBvbih0ZSwgXCJjb21wb3NpdGlvbnN0YXJ0XCIsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcnQgPSBjbS5nZXRDdXJzb3IoXCJmcm9tXCIpO1xuICAgIGlmIChpbnB1dC5jb21wb3NpbmcpIHsgaW5wdXQuY29tcG9zaW5nLnJhbmdlLmNsZWFyKCk7IH1cbiAgICBpbnB1dC5jb21wb3NpbmcgPSB7XG4gICAgICBzdGFydDogc3RhcnQsXG4gICAgICByYW5nZTogY20ubWFya1RleHQoc3RhcnQsIGNtLmdldEN1cnNvcihcInRvXCIpLCB7Y2xhc3NOYW1lOiBcIkNvZGVNaXJyb3ItY29tcG9zaW5nXCJ9KVxuICAgIH07XG4gIH0pO1xuICBvbih0ZSwgXCJjb21wb3NpdGlvbmVuZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGlucHV0LmNvbXBvc2luZykge1xuICAgICAgaW5wdXQucG9sbCgpO1xuICAgICAgaW5wdXQuY29tcG9zaW5nLnJhbmdlLmNsZWFyKCk7XG4gICAgICBpbnB1dC5jb21wb3NpbmcgPSBudWxsO1xuICAgIH1cbiAgfSk7XG59O1xuXG5UZXh0YXJlYUlucHV0LnByb3RvdHlwZS5wcmVwYXJlU2VsZWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAvLyBSZWRyYXcgdGhlIHNlbGVjdGlvbiBhbmQvb3IgY3Vyc29yXG4gIHZhciBjbSA9IHRoaXMuY20sIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBkb2MgPSBjbS5kb2M7XG4gIHZhciByZXN1bHQgPSBwcmVwYXJlU2VsZWN0aW9uKGNtKTtcblxuICAvLyBNb3ZlIHRoZSBoaWRkZW4gdGV4dGFyZWEgbmVhciB0aGUgY3Vyc29yIHRvIHByZXZlbnQgc2Nyb2xsaW5nIGFydGlmYWN0c1xuICBpZiAoY20ub3B0aW9ucy5tb3ZlSW5wdXRXaXRoQ3Vyc29yKSB7XG4gICAgdmFyIGhlYWRQb3MgPSBjdXJzb3JDb29yZHMoY20sIGRvYy5zZWwucHJpbWFyeSgpLmhlYWQsIFwiZGl2XCIpO1xuICAgIHZhciB3cmFwT2ZmID0gZGlzcGxheS53cmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBsaW5lT2ZmID0gZGlzcGxheS5saW5lRGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJlc3VsdC50ZVRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQgLSAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkUG9zLnRvcCArIGxpbmVPZmYudG9wIC0gd3JhcE9mZi50b3ApKTtcbiAgICByZXN1bHQudGVMZWZ0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oZGlzcGxheS53cmFwcGVyLmNsaWVudFdpZHRoIC0gMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRQb3MubGVmdCArIGxpbmVPZmYubGVmdCAtIHdyYXBPZmYubGVmdCkpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxuVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuc2hvd1NlbGVjdGlvbiA9IGZ1bmN0aW9uIChkcmF3bikge1xuICB2YXIgY20gPSB0aGlzLmNtLCBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoZGlzcGxheS5jdXJzb3JEaXYsIGRyYXduLmN1cnNvcnMpO1xuICByZW1vdmVDaGlsZHJlbkFuZEFkZChkaXNwbGF5LnNlbGVjdGlvbkRpdiwgZHJhd24uc2VsZWN0aW9uKTtcbiAgaWYgKGRyYXduLnRlVG9wICE9IG51bGwpIHtcbiAgICB0aGlzLndyYXBwZXIuc3R5bGUudG9wID0gZHJhd24udGVUb3AgKyBcInB4XCI7XG4gICAgdGhpcy53cmFwcGVyLnN0eWxlLmxlZnQgPSBkcmF3bi50ZUxlZnQgKyBcInB4XCI7XG4gIH1cbn07XG5cbi8vIFJlc2V0IHRoZSBpbnB1dCB0byBjb3JyZXNwb25kIHRvIHRoZSBzZWxlY3Rpb24gKG9yIHRvIGJlIGVtcHR5LFxuLy8gd2hlbiBub3QgdHlwaW5nIGFuZCBub3RoaW5nIGlzIHNlbGVjdGVkKVxuVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAodHlwaW5nKSB7XG4gIGlmICh0aGlzLmNvbnRleHRNZW51UGVuZGluZyB8fCB0aGlzLmNvbXBvc2luZykgeyByZXR1cm4gfVxuICB2YXIgbWluaW1hbCwgc2VsZWN0ZWQsIGNtID0gdGhpcy5jbSwgZG9jID0gY20uZG9jO1xuICBpZiAoY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgIHRoaXMucHJldklucHV0ID0gXCJcIjtcbiAgICB2YXIgcmFuZ2UkJDEgPSBkb2Muc2VsLnByaW1hcnkoKTtcbiAgICBtaW5pbWFsID0gaGFzQ29weUV2ZW50ICYmXG4gICAgICAocmFuZ2UkJDEudG8oKS5saW5lIC0gcmFuZ2UkJDEuZnJvbSgpLmxpbmUgPiAxMDAgfHwgKHNlbGVjdGVkID0gY20uZ2V0U2VsZWN0aW9uKCkpLmxlbmd0aCA+IDEwMDApO1xuICAgIHZhciBjb250ZW50ID0gbWluaW1hbCA/IFwiLVwiIDogc2VsZWN0ZWQgfHwgY20uZ2V0U2VsZWN0aW9uKCk7XG4gICAgdGhpcy50ZXh0YXJlYS52YWx1ZSA9IGNvbnRlbnQ7XG4gICAgaWYgKGNtLnN0YXRlLmZvY3VzZWQpIHsgc2VsZWN0SW5wdXQodGhpcy50ZXh0YXJlYSk7IH1cbiAgICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA+PSA5KSB7IHRoaXMuaGFzU2VsZWN0aW9uID0gY29udGVudDsgfVxuICB9IGVsc2UgaWYgKCF0eXBpbmcpIHtcbiAgICB0aGlzLnByZXZJbnB1dCA9IHRoaXMudGV4dGFyZWEudmFsdWUgPSBcIlwiO1xuICAgIGlmIChpZSAmJiBpZV92ZXJzaW9uID49IDkpIHsgdGhpcy5oYXNTZWxlY3Rpb24gPSBudWxsOyB9XG4gIH1cbiAgdGhpcy5pbmFjY3VyYXRlU2VsZWN0aW9uID0gbWluaW1hbDtcbn07XG5cblRleHRhcmVhSW5wdXQucHJvdG90eXBlLmdldEZpZWxkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy50ZXh0YXJlYSB9O1xuXG5UZXh0YXJlYUlucHV0LnByb3RvdHlwZS5zdXBwb3J0c1RvdWNoID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2UgfTtcblxuVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuZm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmNtLm9wdGlvbnMucmVhZE9ubHkgIT0gXCJub2N1cnNvclwiICYmICghbW9iaWxlIHx8IGFjdGl2ZUVsdCgpICE9IHRoaXMudGV4dGFyZWEpKSB7XG4gICAgdHJ5IHsgdGhpcy50ZXh0YXJlYS5mb2N1cygpOyB9XG4gICAgY2F0Y2ggKGUpIHt9IC8vIElFOCB3aWxsIHRocm93IGlmIHRoZSB0ZXh0YXJlYSBpcyBkaXNwbGF5OiBub25lIG9yIG5vdCBpbiBET01cbiAgfVxufTtcblxuVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuYmx1ciA9IGZ1bmN0aW9uICgpIHsgdGhpcy50ZXh0YXJlYS5ibHVyKCk7IH07XG5cblRleHRhcmVhSW5wdXQucHJvdG90eXBlLnJlc2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMud3JhcHBlci5zdHlsZS50b3AgPSB0aGlzLndyYXBwZXIuc3R5bGUubGVmdCA9IDA7XG59O1xuXG5UZXh0YXJlYUlucHV0LnByb3RvdHlwZS5yZWNlaXZlZEZvY3VzID0gZnVuY3Rpb24gKCkgeyB0aGlzLnNsb3dQb2xsKCk7IH07XG5cbi8vIFBvbGwgZm9yIGlucHV0IGNoYW5nZXMsIHVzaW5nIHRoZSBub3JtYWwgcmF0ZSBvZiBwb2xsaW5nLiBUaGlzXG4vLyBydW5zIGFzIGxvbmcgYXMgdGhlIGVkaXRvciBpcyBmb2N1c2VkLlxuVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuc2xvd1BvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgaWYgKHRoaXMucG9sbGluZ0Zhc3QpIHsgcmV0dXJuIH1cbiAgdGhpcy5wb2xsaW5nLnNldCh0aGlzLmNtLm9wdGlvbnMucG9sbEludGVydmFsLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcyQxLnBvbGwoKTtcbiAgICBpZiAodGhpcyQxLmNtLnN0YXRlLmZvY3VzZWQpIHsgdGhpcyQxLnNsb3dQb2xsKCk7IH1cbiAgfSk7XG59O1xuXG4vLyBXaGVuIGFuIGV2ZW50IGhhcyBqdXN0IGNvbWUgaW4gdGhhdCBpcyBsaWtlbHkgdG8gYWRkIG9yIGNoYW5nZVxuLy8gc29tZXRoaW5nIGluIHRoZSBpbnB1dCB0ZXh0YXJlYSwgd2UgcG9sbCBmYXN0ZXIsIHRvIGVuc3VyZSB0aGF0XG4vLyB0aGUgY2hhbmdlIGFwcGVhcnMgb24gdGhlIHNjcmVlbiBxdWlja2x5LlxuVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuZmFzdFBvbGwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtaXNzZWQgPSBmYWxzZSwgaW5wdXQgPSB0aGlzO1xuICBpbnB1dC5wb2xsaW5nRmFzdCA9IHRydWU7XG4gIGZ1bmN0aW9uIHAoKSB7XG4gICAgdmFyIGNoYW5nZWQgPSBpbnB1dC5wb2xsKCk7XG4gICAgaWYgKCFjaGFuZ2VkICYmICFtaXNzZWQpIHttaXNzZWQgPSB0cnVlOyBpbnB1dC5wb2xsaW5nLnNldCg2MCwgcCk7fVxuICAgIGVsc2Uge2lucHV0LnBvbGxpbmdGYXN0ID0gZmFsc2U7IGlucHV0LnNsb3dQb2xsKCk7fVxuICB9XG4gIGlucHV0LnBvbGxpbmcuc2V0KDIwLCBwKTtcbn07XG5cbi8vIFJlYWQgaW5wdXQgZnJvbSB0aGUgdGV4dGFyZWEsIGFuZCB1cGRhdGUgdGhlIGRvY3VtZW50IHRvIG1hdGNoLlxuLy8gV2hlbiBzb21ldGhpbmcgaXMgc2VsZWN0ZWQsIGl0IGlzIHByZXNlbnQgaW4gdGhlIHRleHRhcmVhLCBhbmRcbi8vIHNlbGVjdGVkICh1bmxlc3MgaXQgaXMgaHVnZSwgaW4gd2hpY2ggY2FzZSBhIHBsYWNlaG9sZGVyIGlzXG4vLyB1c2VkKS4gV2hlbiBub3RoaW5nIGlzIHNlbGVjdGVkLCB0aGUgY3Vyc29yIHNpdHMgYWZ0ZXIgcHJldmlvdXNseVxuLy8gc2VlbiB0ZXh0IChjYW4gYmUgZW1wdHkpLCB3aGljaCBpcyBzdG9yZWQgaW4gcHJldklucHV0ICh3ZSBtdXN0XG4vLyBub3QgcmVzZXQgdGhlIHRleHRhcmVhIHdoZW4gdHlwaW5nLCBiZWNhdXNlIHRoYXQgYnJlYWtzIElNRSkuXG5UZXh0YXJlYUlucHV0LnByb3RvdHlwZS5wb2xsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciBjbSA9IHRoaXMuY20sIGlucHV0ID0gdGhpcy50ZXh0YXJlYSwgcHJldklucHV0ID0gdGhpcy5wcmV2SW5wdXQ7XG4gIC8vIFNpbmNlIHRoaXMgaXMgY2FsbGVkIGEgKmxvdCosIHRyeSB0byBiYWlsIG91dCBhcyBjaGVhcGx5IGFzXG4gIC8vIHBvc3NpYmxlIHdoZW4gaXQgaXMgY2xlYXIgdGhhdCBub3RoaW5nIGhhcHBlbmVkLiBoYXNTZWxlY3Rpb25cbiAgLy8gd2lsbCBiZSB0aGUgY2FzZSB3aGVuIHRoZXJlIGlzIGEgbG90IG9mIHRleHQgaW4gdGhlIHRleHRhcmVhLFxuICAvLyBpbiB3aGljaCBjYXNlIHJlYWRpbmcgaXRzIHZhbHVlIHdvdWxkIGJlIGV4cGVuc2l2ZS5cbiAgaWYgKHRoaXMuY29udGV4dE1lbnVQZW5kaW5nIHx8ICFjbS5zdGF0ZS5mb2N1c2VkIHx8XG4gICAgICAoaGFzU2VsZWN0aW9uKGlucHV0KSAmJiAhcHJldklucHV0ICYmICF0aGlzLmNvbXBvc2luZykgfHxcbiAgICAgIGNtLmlzUmVhZE9ubHkoKSB8fCBjbS5vcHRpb25zLmRpc2FibGVJbnB1dCB8fCBjbS5zdGF0ZS5rZXlTZXEpXG4gICAgeyByZXR1cm4gZmFsc2UgfVxuXG4gIHZhciB0ZXh0ID0gaW5wdXQudmFsdWU7XG4gIC8vIElmIG5vdGhpbmcgY2hhbmdlZCwgYmFpbC5cbiAgaWYgKHRleHQgPT0gcHJldklucHV0ICYmICFjbS5zb21ldGhpbmdTZWxlY3RlZCgpKSB7IHJldHVybiBmYWxzZSB9XG4gIC8vIFdvcmsgYXJvdW5kIG5vbnNlbnNpY2FsIHNlbGVjdGlvbiByZXNldHRpbmcgaW4gSUU5LzEwLCBhbmRcbiAgLy8gaW5leHBsaWNhYmxlIGFwcGVhcmFuY2Ugb2YgcHJpdmF0ZSBhcmVhIHVuaWNvZGUgY2hhcmFjdGVycyBvblxuICAvLyBzb21lIGtleSBjb21ib3MgaW4gTWFjICgjMjY4OSkuXG4gIGlmIChpZSAmJiBpZV92ZXJzaW9uID49IDkgJiYgdGhpcy5oYXNTZWxlY3Rpb24gPT09IHRleHQgfHxcbiAgICAgIG1hYyAmJiAvW1xcdWY3MDAtXFx1ZjdmZl0vLnRlc3QodGV4dCkpIHtcbiAgICBjbS5kaXNwbGF5LmlucHV0LnJlc2V0KCk7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoY20uZG9jLnNlbCA9PSBjbS5kaXNwbGF5LnNlbEZvckNvbnRleHRNZW51KSB7XG4gICAgdmFyIGZpcnN0ID0gdGV4dC5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChmaXJzdCA9PSAweDIwMGIgJiYgIXByZXZJbnB1dCkgeyBwcmV2SW5wdXQgPSBcIlxcdTIwMGJcIjsgfVxuICAgIGlmIChmaXJzdCA9PSAweDIxZGEpIHsgdGhpcy5yZXNldCgpOyByZXR1cm4gdGhpcy5jbS5leGVjQ29tbWFuZChcInVuZG9cIikgfVxuICB9XG4gIC8vIEZpbmQgdGhlIHBhcnQgb2YgdGhlIGlucHV0IHRoYXQgaXMgYWN0dWFsbHkgbmV3XG4gIHZhciBzYW1lID0gMCwgbCA9IE1hdGgubWluKHByZXZJbnB1dC5sZW5ndGgsIHRleHQubGVuZ3RoKTtcbiAgd2hpbGUgKHNhbWUgPCBsICYmIHByZXZJbnB1dC5jaGFyQ29kZUF0KHNhbWUpID09IHRleHQuY2hhckNvZGVBdChzYW1lKSkgeyArK3NhbWU7IH1cblxuICBydW5Jbk9wKGNtLCBmdW5jdGlvbiAoKSB7XG4gICAgYXBwbHlUZXh0SW5wdXQoY20sIHRleHQuc2xpY2Uoc2FtZSksIHByZXZJbnB1dC5sZW5ndGggLSBzYW1lLFxuICAgICAgICAgICAgICAgICAgIG51bGwsIHRoaXMkMS5jb21wb3NpbmcgPyBcIipjb21wb3NlXCIgOiBudWxsKTtcblxuICAgIC8vIERvbid0IGxlYXZlIGxvbmcgdGV4dCBpbiB0aGUgdGV4dGFyZWEsIHNpbmNlIGl0IG1ha2VzIGZ1cnRoZXIgcG9sbGluZyBzbG93XG4gICAgaWYgKHRleHQubGVuZ3RoID4gMTAwMCB8fCB0ZXh0LmluZGV4T2YoXCJcXG5cIikgPiAtMSkgeyBpbnB1dC52YWx1ZSA9IHRoaXMkMS5wcmV2SW5wdXQgPSBcIlwiOyB9XG4gICAgZWxzZSB7IHRoaXMkMS5wcmV2SW5wdXQgPSB0ZXh0OyB9XG5cbiAgICBpZiAodGhpcyQxLmNvbXBvc2luZykge1xuICAgICAgdGhpcyQxLmNvbXBvc2luZy5yYW5nZS5jbGVhcigpO1xuICAgICAgdGhpcyQxLmNvbXBvc2luZy5yYW5nZSA9IGNtLm1hcmtUZXh0KHRoaXMkMS5jb21wb3Npbmcuc3RhcnQsIGNtLmdldEN1cnNvcihcInRvXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2xhc3NOYW1lOiBcIkNvZGVNaXJyb3ItY29tcG9zaW5nXCJ9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gdHJ1ZVxufTtcblxuVGV4dGFyZWFJbnB1dC5wcm90b3R5cGUuZW5zdXJlUG9sbGVkID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5wb2xsaW5nRmFzdCAmJiB0aGlzLnBvbGwoKSkgeyB0aGlzLnBvbGxpbmdGYXN0ID0gZmFsc2U7IH1cbn07XG5cblRleHRhcmVhSW5wdXQucHJvdG90eXBlLm9uS2V5UHJlc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChpZSAmJiBpZV92ZXJzaW9uID49IDkpIHsgdGhpcy5oYXNTZWxlY3Rpb24gPSBudWxsOyB9XG4gIHRoaXMuZmFzdFBvbGwoKTtcbn07XG5cblRleHRhcmVhSW5wdXQucHJvdG90eXBlLm9uQ29udGV4dE1lbnUgPSBmdW5jdGlvbiAoZSkge1xuICB2YXIgaW5wdXQgPSB0aGlzLCBjbSA9IGlucHV0LmNtLCBkaXNwbGF5ID0gY20uZGlzcGxheSwgdGUgPSBpbnB1dC50ZXh0YXJlYTtcbiAgdmFyIHBvcyA9IHBvc0Zyb21Nb3VzZShjbSwgZSksIHNjcm9sbFBvcyA9IGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wO1xuICBpZiAoIXBvcyB8fCBwcmVzdG8pIHsgcmV0dXJuIH0gLy8gT3BlcmEgaXMgZGlmZmljdWx0LlxuXG4gIC8vIFJlc2V0IHRoZSBjdXJyZW50IHRleHQgc2VsZWN0aW9uIG9ubHkgaWYgdGhlIGNsaWNrIGlzIGRvbmUgb3V0c2lkZSBvZiB0aGUgc2VsZWN0aW9uXG4gIC8vIGFuZCAncmVzZXRTZWxlY3Rpb25PbkNvbnRleHRNZW51JyBvcHRpb24gaXMgdHJ1ZS5cbiAgdmFyIHJlc2V0ID0gY20ub3B0aW9ucy5yZXNldFNlbGVjdGlvbk9uQ29udGV4dE1lbnU7XG4gIGlmIChyZXNldCAmJiBjbS5kb2Muc2VsLmNvbnRhaW5zKHBvcykgPT0gLTEpXG4gICAgeyBvcGVyYXRpb24oY20sIHNldFNlbGVjdGlvbikoY20uZG9jLCBzaW1wbGVTZWxlY3Rpb24ocG9zKSwgc2VsX2RvbnRTY3JvbGwpOyB9XG5cbiAgdmFyIG9sZENTUyA9IHRlLnN0eWxlLmNzc1RleHQsIG9sZFdyYXBwZXJDU1MgPSBpbnB1dC53cmFwcGVyLnN0eWxlLmNzc1RleHQ7XG4gIGlucHV0LndyYXBwZXIuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246IGFic29sdXRlXCI7XG4gIHZhciB3cmFwcGVyQm94ID0gaW5wdXQud3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdGUuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246IGFic29sdXRlOyB3aWR0aDogMzBweDsgaGVpZ2h0OiAzMHB4O1xcbiAgICAgIHRvcDogXCIgKyAoZS5jbGllbnRZIC0gd3JhcHBlckJveC50b3AgLSA1KSArIFwicHg7IGxlZnQ6IFwiICsgKGUuY2xpZW50WCAtIHdyYXBwZXJCb3gubGVmdCAtIDUpICsgXCJweDtcXG4gICAgICB6LWluZGV4OiAxMDAwOyBiYWNrZ3JvdW5kOiBcIiArIChpZSA/IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAuMDUpXCIgOiBcInRyYW5zcGFyZW50XCIpICsgXCI7XFxuICAgICAgb3V0bGluZTogbm9uZTsgYm9yZGVyLXdpZHRoOiAwOyBvdXRsaW5lOiBub25lOyBvdmVyZmxvdzogaGlkZGVuOyBvcGFjaXR5OiAuMDU7IGZpbHRlcjogYWxwaGEob3BhY2l0eT01KTtcIjtcbiAgdmFyIG9sZFNjcm9sbFk7XG4gIGlmICh3ZWJraXQpIHsgb2xkU2Nyb2xsWSA9IHdpbmRvdy5zY3JvbGxZOyB9IC8vIFdvcmsgYXJvdW5kIENocm9tZSBpc3N1ZSAoIzI3MTIpXG4gIGRpc3BsYXkuaW5wdXQuZm9jdXMoKTtcbiAgaWYgKHdlYmtpdCkgeyB3aW5kb3cuc2Nyb2xsVG8obnVsbCwgb2xkU2Nyb2xsWSk7IH1cbiAgZGlzcGxheS5pbnB1dC5yZXNldCgpO1xuICAvLyBBZGRzIFwiU2VsZWN0IGFsbFwiIHRvIGNvbnRleHQgbWVudSBpbiBGRlxuICBpZiAoIWNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHsgdGUudmFsdWUgPSBpbnB1dC5wcmV2SW5wdXQgPSBcIiBcIjsgfVxuICBpbnB1dC5jb250ZXh0TWVudVBlbmRpbmcgPSB0cnVlO1xuICBkaXNwbGF5LnNlbEZvckNvbnRleHRNZW51ID0gY20uZG9jLnNlbDtcbiAgY2xlYXJUaW1lb3V0KGRpc3BsYXkuZGV0ZWN0aW5nU2VsZWN0QWxsKTtcblxuICAvLyBTZWxlY3QtYWxsIHdpbGwgYmUgZ3JleWVkIG91dCBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gc2VsZWN0LCBzb1xuICAvLyB0aGlzIGFkZHMgYSB6ZXJvLXdpZHRoIHNwYWNlIHNvIHRoYXQgd2UgY2FuIGxhdGVyIGNoZWNrIHdoZXRoZXJcbiAgLy8gaXQgZ290IHNlbGVjdGVkLlxuICBmdW5jdGlvbiBwcmVwYXJlU2VsZWN0QWxsSGFjaygpIHtcbiAgICBpZiAodGUuc2VsZWN0aW9uU3RhcnQgIT0gbnVsbCkge1xuICAgICAgdmFyIHNlbGVjdGVkID0gY20uc29tZXRoaW5nU2VsZWN0ZWQoKTtcbiAgICAgIHZhciBleHR2YWwgPSBcIlxcdTIwMGJcIiArIChzZWxlY3RlZCA/IHRlLnZhbHVlIDogXCJcIik7XG4gICAgICB0ZS52YWx1ZSA9IFwiXFx1MjFkYVwiOyAvLyBVc2VkIHRvIGNhdGNoIGNvbnRleHQtbWVudSB1bmRvXG4gICAgICB0ZS52YWx1ZSA9IGV4dHZhbDtcbiAgICAgIGlucHV0LnByZXZJbnB1dCA9IHNlbGVjdGVkID8gXCJcIiA6IFwiXFx1MjAwYlwiO1xuICAgICAgdGUuc2VsZWN0aW9uU3RhcnQgPSAxOyB0ZS5zZWxlY3Rpb25FbmQgPSBleHR2YWwubGVuZ3RoO1xuICAgICAgLy8gUmUtc2V0IHRoaXMsIGluIGNhc2Ugc29tZSBvdGhlciBoYW5kbGVyIHRvdWNoZWQgdGhlXG4gICAgICAvLyBzZWxlY3Rpb24gaW4gdGhlIG1lYW50aW1lLlxuICAgICAgZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSA9IGNtLmRvYy5zZWw7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlaGlkZSgpIHtcbiAgICBpbnB1dC5jb250ZXh0TWVudVBlbmRpbmcgPSBmYWxzZTtcbiAgICBpbnB1dC53cmFwcGVyLnN0eWxlLmNzc1RleHQgPSBvbGRXcmFwcGVyQ1NTO1xuICAgIHRlLnN0eWxlLmNzc1RleHQgPSBvbGRDU1M7XG4gICAgaWYgKGllICYmIGllX3ZlcnNpb24gPCA5KSB7IGRpc3BsYXkuc2Nyb2xsYmFycy5zZXRTY3JvbGxUb3AoZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3AgPSBzY3JvbGxQb3MpOyB9XG5cbiAgICAvLyBUcnkgdG8gZGV0ZWN0IHRoZSB1c2VyIGNob29zaW5nIHNlbGVjdC1hbGxcbiAgICBpZiAodGUuc2VsZWN0aW9uU3RhcnQgIT0gbnVsbCkge1xuICAgICAgaWYgKCFpZSB8fCAoaWUgJiYgaWVfdmVyc2lvbiA8IDkpKSB7IHByZXBhcmVTZWxlY3RBbGxIYWNrKCk7IH1cbiAgICAgIHZhciBpID0gMCwgcG9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRpc3BsYXkuc2VsRm9yQ29udGV4dE1lbnUgPT0gY20uZG9jLnNlbCAmJiB0ZS5zZWxlY3Rpb25TdGFydCA9PSAwICYmXG4gICAgICAgICAgICB0ZS5zZWxlY3Rpb25FbmQgPiAwICYmIGlucHV0LnByZXZJbnB1dCA9PSBcIlxcdTIwMGJcIikge1xuICAgICAgICAgIG9wZXJhdGlvbihjbSwgc2VsZWN0QWxsKShjbSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaSsrIDwgMTApIHtcbiAgICAgICAgICBkaXNwbGF5LmRldGVjdGluZ1NlbGVjdEFsbCA9IHNldFRpbWVvdXQocG9sbCwgNTAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXNwbGF5LnNlbEZvckNvbnRleHRNZW51ID0gbnVsbDtcbiAgICAgICAgICBkaXNwbGF5LmlucHV0LnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBkaXNwbGF5LmRldGVjdGluZ1NlbGVjdEFsbCA9IHNldFRpbWVvdXQocG9sbCwgMjAwKTtcbiAgICB9XG4gIH1cblxuICBpZiAoaWUgJiYgaWVfdmVyc2lvbiA+PSA5KSB7IHByZXBhcmVTZWxlY3RBbGxIYWNrKCk7IH1cbiAgaWYgKGNhcHR1cmVSaWdodENsaWNrKSB7XG4gICAgZV9zdG9wKGUpO1xuICAgIHZhciBtb3VzZXVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgb2ZmKHdpbmRvdywgXCJtb3VzZXVwXCIsIG1vdXNldXApO1xuICAgICAgc2V0VGltZW91dChyZWhpZGUsIDIwKTtcbiAgICB9O1xuICAgIG9uKHdpbmRvdywgXCJtb3VzZXVwXCIsIG1vdXNldXApO1xuICB9IGVsc2Uge1xuICAgIHNldFRpbWVvdXQocmVoaWRlLCA1MCk7XG4gIH1cbn07XG5cblRleHRhcmVhSW5wdXQucHJvdG90eXBlLnJlYWRPbmx5Q2hhbmdlZCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKCF2YWwpIHsgdGhpcy5yZXNldCgpOyB9XG59O1xuXG5UZXh0YXJlYUlucHV0LnByb3RvdHlwZS5zZXRVbmVkaXRhYmxlID0gZnVuY3Rpb24gKCkge307XG5cblRleHRhcmVhSW5wdXQucHJvdG90eXBlLm5lZWRzQ29udGVudEF0dHJpYnV0ZSA9IGZhbHNlO1xuXG5mdW5jdGlvbiBmcm9tVGV4dEFyZWEodGV4dGFyZWEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgPyBjb3B5T2JqKG9wdGlvbnMpIDoge307XG4gIG9wdGlvbnMudmFsdWUgPSB0ZXh0YXJlYS52YWx1ZTtcbiAgaWYgKCFvcHRpb25zLnRhYmluZGV4ICYmIHRleHRhcmVhLnRhYkluZGV4KVxuICAgIHsgb3B0aW9ucy50YWJpbmRleCA9IHRleHRhcmVhLnRhYkluZGV4OyB9XG4gIGlmICghb3B0aW9ucy5wbGFjZWhvbGRlciAmJiB0ZXh0YXJlYS5wbGFjZWhvbGRlcilcbiAgICB7IG9wdGlvbnMucGxhY2Vob2xkZXIgPSB0ZXh0YXJlYS5wbGFjZWhvbGRlcjsgfVxuICAvLyBTZXQgYXV0b2ZvY3VzIHRvIHRydWUgaWYgdGhpcyB0ZXh0YXJlYSBpcyBmb2N1c2VkLCBvciBpZiBpdCBoYXNcbiAgLy8gYXV0b2ZvY3VzIGFuZCBubyBvdGhlciBlbGVtZW50IGlzIGZvY3VzZWQuXG4gIGlmIChvcHRpb25zLmF1dG9mb2N1cyA9PSBudWxsKSB7XG4gICAgdmFyIGhhc0ZvY3VzID0gYWN0aXZlRWx0KCk7XG4gICAgb3B0aW9ucy5hdXRvZm9jdXMgPSBoYXNGb2N1cyA9PSB0ZXh0YXJlYSB8fFxuICAgICAgdGV4dGFyZWEuZ2V0QXR0cmlidXRlKFwiYXV0b2ZvY3VzXCIpICE9IG51bGwgJiYgaGFzRm9jdXMgPT0gZG9jdW1lbnQuYm9keTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmUoKSB7dGV4dGFyZWEudmFsdWUgPSBjbS5nZXRWYWx1ZSgpO31cblxuICB2YXIgcmVhbFN1Ym1pdDtcbiAgaWYgKHRleHRhcmVhLmZvcm0pIHtcbiAgICBvbih0ZXh0YXJlYS5mb3JtLCBcInN1Ym1pdFwiLCBzYXZlKTtcbiAgICAvLyBEZXBsb3JhYmxlIGhhY2sgdG8gbWFrZSB0aGUgc3VibWl0IG1ldGhvZCBkbyB0aGUgcmlnaHQgdGhpbmcuXG4gICAgaWYgKCFvcHRpb25zLmxlYXZlU3VibWl0TWV0aG9kQWxvbmUpIHtcbiAgICAgIHZhciBmb3JtID0gdGV4dGFyZWEuZm9ybTtcbiAgICAgIHJlYWxTdWJtaXQgPSBmb3JtLnN1Ym1pdDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciB3cmFwcGVkU3VibWl0ID0gZm9ybS5zdWJtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2F2ZSgpO1xuICAgICAgICAgIGZvcm0uc3VibWl0ID0gcmVhbFN1Ym1pdDtcbiAgICAgICAgICBmb3JtLnN1Ym1pdCgpO1xuICAgICAgICAgIGZvcm0uc3VibWl0ID0gd3JhcHBlZFN1Ym1pdDtcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2goZSkge31cbiAgICB9XG4gIH1cblxuICBvcHRpb25zLmZpbmlzaEluaXQgPSBmdW5jdGlvbiAoY20pIHtcbiAgICBjbS5zYXZlID0gc2F2ZTtcbiAgICBjbS5nZXRUZXh0QXJlYSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRleHRhcmVhOyB9O1xuICAgIGNtLnRvVGV4dEFyZWEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjbS50b1RleHRBcmVhID0gaXNOYU47IC8vIFByZXZlbnQgdGhpcyBmcm9tIGJlaW5nIHJhbiB0d2ljZVxuICAgICAgc2F2ZSgpO1xuICAgICAgdGV4dGFyZWEucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjbS5nZXRXcmFwcGVyRWxlbWVudCgpKTtcbiAgICAgIHRleHRhcmVhLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgaWYgKHRleHRhcmVhLmZvcm0pIHtcbiAgICAgICAgb2ZmKHRleHRhcmVhLmZvcm0sIFwic3VibWl0XCIsIHNhdmUpO1xuICAgICAgICBpZiAodHlwZW9mIHRleHRhcmVhLmZvcm0uc3VibWl0ID09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICB7IHRleHRhcmVhLmZvcm0uc3VibWl0ID0gcmVhbFN1Ym1pdDsgfVxuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgdGV4dGFyZWEuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICB2YXIgY20gPSBDb2RlTWlycm9yJDEoZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIHRleHRhcmVhLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIHRleHRhcmVhLm5leHRTaWJsaW5nKTsgfSxcbiAgICBvcHRpb25zKTtcbiAgcmV0dXJuIGNtXG59XG5cbmZ1bmN0aW9uIGFkZExlZ2FjeVByb3BzKENvZGVNaXJyb3IpIHtcbiAgQ29kZU1pcnJvci5vZmYgPSBvZmY7XG4gIENvZGVNaXJyb3Iub24gPSBvbjtcbiAgQ29kZU1pcnJvci53aGVlbEV2ZW50UGl4ZWxzID0gd2hlZWxFdmVudFBpeGVscztcbiAgQ29kZU1pcnJvci5Eb2MgPSBEb2M7XG4gIENvZGVNaXJyb3Iuc3BsaXRMaW5lcyA9IHNwbGl0TGluZXNBdXRvO1xuICBDb2RlTWlycm9yLmNvdW50Q29sdW1uID0gY291bnRDb2x1bW47XG4gIENvZGVNaXJyb3IuZmluZENvbHVtbiA9IGZpbmRDb2x1bW47XG4gIENvZGVNaXJyb3IuaXNXb3JkQ2hhciA9IGlzV29yZENoYXJCYXNpYztcbiAgQ29kZU1pcnJvci5QYXNzID0gUGFzcztcbiAgQ29kZU1pcnJvci5zaWduYWwgPSBzaWduYWw7XG4gIENvZGVNaXJyb3IuTGluZSA9IExpbmU7XG4gIENvZGVNaXJyb3IuY2hhbmdlRW5kID0gY2hhbmdlRW5kO1xuICBDb2RlTWlycm9yLnNjcm9sbGJhck1vZGVsID0gc2Nyb2xsYmFyTW9kZWw7XG4gIENvZGVNaXJyb3IuUG9zID0gUG9zO1xuICBDb2RlTWlycm9yLmNtcFBvcyA9IGNtcDtcbiAgQ29kZU1pcnJvci5tb2RlcyA9IG1vZGVzO1xuICBDb2RlTWlycm9yLm1pbWVNb2RlcyA9IG1pbWVNb2RlcztcbiAgQ29kZU1pcnJvci5yZXNvbHZlTW9kZSA9IHJlc29sdmVNb2RlO1xuICBDb2RlTWlycm9yLmdldE1vZGUgPSBnZXRNb2RlO1xuICBDb2RlTWlycm9yLm1vZGVFeHRlbnNpb25zID0gbW9kZUV4dGVuc2lvbnM7XG4gIENvZGVNaXJyb3IuZXh0ZW5kTW9kZSA9IGV4dGVuZE1vZGU7XG4gIENvZGVNaXJyb3IuY29weVN0YXRlID0gY29weVN0YXRlO1xuICBDb2RlTWlycm9yLnN0YXJ0U3RhdGUgPSBzdGFydFN0YXRlO1xuICBDb2RlTWlycm9yLmlubmVyTW9kZSA9IGlubmVyTW9kZTtcbiAgQ29kZU1pcnJvci5jb21tYW5kcyA9IGNvbW1hbmRzO1xuICBDb2RlTWlycm9yLmtleU1hcCA9IGtleU1hcDtcbiAgQ29kZU1pcnJvci5rZXlOYW1lID0ga2V5TmFtZTtcbiAgQ29kZU1pcnJvci5pc01vZGlmaWVyS2V5ID0gaXNNb2RpZmllcktleTtcbiAgQ29kZU1pcnJvci5sb29rdXBLZXkgPSBsb29rdXBLZXk7XG4gIENvZGVNaXJyb3Iubm9ybWFsaXplS2V5TWFwID0gbm9ybWFsaXplS2V5TWFwO1xuICBDb2RlTWlycm9yLlN0cmluZ1N0cmVhbSA9IFN0cmluZ1N0cmVhbTtcbiAgQ29kZU1pcnJvci5TaGFyZWRUZXh0TWFya2VyID0gU2hhcmVkVGV4dE1hcmtlcjtcbiAgQ29kZU1pcnJvci5UZXh0TWFya2VyID0gVGV4dE1hcmtlcjtcbiAgQ29kZU1pcnJvci5MaW5lV2lkZ2V0ID0gTGluZVdpZGdldDtcbiAgQ29kZU1pcnJvci5lX3ByZXZlbnREZWZhdWx0ID0gZV9wcmV2ZW50RGVmYXVsdDtcbiAgQ29kZU1pcnJvci5lX3N0b3BQcm9wYWdhdGlvbiA9IGVfc3RvcFByb3BhZ2F0aW9uO1xuICBDb2RlTWlycm9yLmVfc3RvcCA9IGVfc3RvcDtcbiAgQ29kZU1pcnJvci5hZGRDbGFzcyA9IGFkZENsYXNzO1xuICBDb2RlTWlycm9yLmNvbnRhaW5zID0gY29udGFpbnM7XG4gIENvZGVNaXJyb3Iucm1DbGFzcyA9IHJtQ2xhc3M7XG4gIENvZGVNaXJyb3Iua2V5TmFtZXMgPSBrZXlOYW1lcztcbn1cblxuLy8gRURJVE9SIENPTlNUUlVDVE9SXG5cbmRlZmluZU9wdGlvbnMoQ29kZU1pcnJvciQxKTtcblxuYWRkRWRpdG9yTWV0aG9kcyhDb2RlTWlycm9yJDEpO1xuXG4vLyBTZXQgdXAgbWV0aG9kcyBvbiBDb2RlTWlycm9yJ3MgcHJvdG90eXBlIHRvIHJlZGlyZWN0IHRvIHRoZSBlZGl0b3IncyBkb2N1bWVudC5cbnZhciBkb250RGVsZWdhdGUgPSBcIml0ZXIgaW5zZXJ0IHJlbW92ZSBjb3B5IGdldEVkaXRvciBjb25zdHJ1Y3RvclwiLnNwbGl0KFwiIFwiKTtcbmZvciAodmFyIHByb3AgaW4gRG9jLnByb3RvdHlwZSkgeyBpZiAoRG9jLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiBpbmRleE9mKGRvbnREZWxlZ2F0ZSwgcHJvcCkgPCAwKVxuICB7IENvZGVNaXJyb3IkMS5wcm90b3R5cGVbcHJvcF0gPSAoZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge3JldHVybiBtZXRob2QuYXBwbHkodGhpcy5kb2MsIGFyZ3VtZW50cyl9XG4gIH0pKERvYy5wcm90b3R5cGVbcHJvcF0pOyB9IH1cblxuZXZlbnRNaXhpbihEb2MpO1xuXG4vLyBJTlBVVCBIQU5ETElOR1xuXG5Db2RlTWlycm9yJDEuaW5wdXRTdHlsZXMgPSB7XCJ0ZXh0YXJlYVwiOiBUZXh0YXJlYUlucHV0LCBcImNvbnRlbnRlZGl0YWJsZVwiOiBDb250ZW50RWRpdGFibGVJbnB1dH07XG5cbi8vIE1PREUgREVGSU5JVElPTiBBTkQgUVVFUllJTkdcblxuLy8gRXh0cmEgYXJndW1lbnRzIGFyZSBzdG9yZWQgYXMgdGhlIG1vZGUncyBkZXBlbmRlbmNpZXMsIHdoaWNoIGlzXG4vLyB1c2VkIGJ5IChsZWdhY3kpIG1lY2hhbmlzbXMgbGlrZSBsb2FkbW9kZS5qcyB0byBhdXRvbWF0aWNhbGx5XG4vLyBsb2FkIGEgbW9kZS4gKFByZWZlcnJlZCBtZWNoYW5pc20gaXMgdGhlIHJlcXVpcmUvZGVmaW5lIGNhbGxzLilcbkNvZGVNaXJyb3IkMS5kZWZpbmVNb2RlID0gZnVuY3Rpb24obmFtZS8qLCBtb2RlLCDigKYqLykge1xuICBpZiAoIUNvZGVNaXJyb3IkMS5kZWZhdWx0cy5tb2RlICYmIG5hbWUgIT0gXCJudWxsXCIpIHsgQ29kZU1pcnJvciQxLmRlZmF1bHRzLm1vZGUgPSBuYW1lOyB9XG4gIGRlZmluZU1vZGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbkNvZGVNaXJyb3IkMS5kZWZpbmVNSU1FID0gZGVmaW5lTUlNRTtcblxuLy8gTWluaW1hbCBkZWZhdWx0IG1vZGUuXG5Db2RlTWlycm9yJDEuZGVmaW5lTW9kZShcIm51bGxcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gKHt0b2tlbjogZnVuY3Rpb24gKHN0cmVhbSkgeyByZXR1cm4gc3RyZWFtLnNraXBUb0VuZCgpOyB9fSk7IH0pO1xuQ29kZU1pcnJvciQxLmRlZmluZU1JTUUoXCJ0ZXh0L3BsYWluXCIsIFwibnVsbFwiKTtcblxuLy8gRVhURU5TSU9OU1xuXG5Db2RlTWlycm9yJDEuZGVmaW5lRXh0ZW5zaW9uID0gZnVuY3Rpb24gKG5hbWUsIGZ1bmMpIHtcbiAgQ29kZU1pcnJvciQxLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmM7XG59O1xuQ29kZU1pcnJvciQxLmRlZmluZURvY0V4dGVuc2lvbiA9IGZ1bmN0aW9uIChuYW1lLCBmdW5jKSB7XG4gIERvYy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jO1xufTtcblxuQ29kZU1pcnJvciQxLmZyb21UZXh0QXJlYSA9IGZyb21UZXh0QXJlYTtcblxuYWRkTGVnYWN5UHJvcHMoQ29kZU1pcnJvciQxKTtcblxuQ29kZU1pcnJvciQxLnZlcnNpb24gPSBcIjUuMjYuMFwiO1xuXG5yZXR1cm4gQ29kZU1pcnJvciQxO1xuXG59KSkpO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIF9jbGFzc25hbWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsYXNzbmFtZXMpO1xuXG52YXIgX2xvZGFzaERlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyk7XG5cbnZhciBfbG9kYXNoRGVib3VuY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9kYXNoRGVib3VuY2UpO1xuXG5mdW5jdGlvbiBub3JtYWxpemVMaW5lRW5kaW5ncyhzdHIpIHtcblx0aWYgKCFzdHIpIHJldHVybiBzdHI7XG5cdHJldHVybiBzdHIucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJyk7XG59XG5cbnZhciBDb2RlTWlycm9yID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG5cdF9pbmhlcml0cyhDb2RlTWlycm9yLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuXHRmdW5jdGlvbiBDb2RlTWlycm9yKHByb3BzKSB7XG5cdFx0X2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvZGVNaXJyb3IpO1xuXG5cdFx0X2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29kZU1pcnJvci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRpc0ZvY3VzZWQ6IGZhbHNlXG5cdFx0fTtcblx0fVxuXG5cdF9jcmVhdGVDbGFzcyhDb2RlTWlycm9yLCBbe1xuXHRcdGtleTogJ2dldENvZGVNaXJyb3JJbnN0YW5jZScsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGdldENvZGVNaXJyb3JJbnN0YW5jZSgpIHtcblx0XHRcdHJldHVybiB0aGlzLnByb3BzLmNvZGVNaXJyb3JJbnN0YW5jZSB8fCByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnY29tcG9uZW50V2lsbE1vdW50Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdFx0dGhpcy5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gKDAsIF9sb2Rhc2hEZWJvdW5jZTJbJ2RlZmF1bHQnXSkodGhpcy5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzLCAwKTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdFx0dmFyIHRleHRhcmVhTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy50ZXh0YXJlYSk7XG5cblx0XHRcdHZhciBjb2RlTWlycm9ySW5zdGFuY2UgPSB0aGlzLmdldENvZGVNaXJyb3JJbnN0YW5jZSgpO1xuXG5cdFx0XHR2YXIgaW5mbyA9IGNvZGVNaXJyb3JJbnN0YW5jZS5maW5kTW9kZUJ5RXh0ZW5zaW9uKHRoaXMucHJvcHMubmFtZS5zcGxpdCgnLicpLnBvcCgpKSB8fCB7fTtcblx0XHRcdHZhciBfaW5mbyRtb2RlID0gaW5mby5tb2RlO1xuXHRcdFx0dmFyIG1vZGUgPSBfaW5mbyRtb2RlID09PSB1bmRlZmluZWQgPyBcIlwiIDogX2luZm8kbW9kZTtcblx0XHRcdHZhciBzcGVjID0gaW5mby5zcGVjO1xuXG5cdFx0XHR0aGlzLmNvZGVNaXJyb3IgPSBjb2RlTWlycm9ySW5zdGFuY2UuZnJvbVRleHRBcmVhKHRleHRhcmVhTm9kZSk7XG5cblx0XHRcdHRoaXMuY29kZU1pcnJvci5zZXRPcHRpb24oJ21vZGUnLCBtb2RlKTtcblx0XHRcdHRoaXMuY29kZU1pcnJvci5zZXRPcHRpb24oJ3JlYWRPbmx5JywgdGhpcy5wcm9wcy5vcHRpb25zLnJlYWRPbmx5KTtcblx0XHRcdHRoaXMuY29kZU1pcnJvci5zZXRPcHRpb24oJ2xpbmVOdW1iZXJzJywgdGhpcy5wcm9wcy5vcHRpb25zLmxpbmVOdW1iZXJzKTtcblx0XHRcdHRoaXMuY29kZU1pcnJvci5zZXRPcHRpb24oJ2xpbmVXcmFwcGluZycsIHRoaXMucHJvcHMub3B0aW9ucy5saW5lV3JhcHBpbmcpO1xuXG5cdFx0XHRjb2RlTWlycm9ySW5zdGFuY2UuYXV0b0xvYWRNb2RlKHRoaXMuY29kZU1pcnJvciwgbW9kZSk7XG5cblx0XHRcdHRoaXMuY29kZU1pcnJvci5vbignY2hhbmdlJywgdGhpcy5jb2RlbWlycm9yVmFsdWVDaGFuZ2VkLmJpbmQodGhpcykpO1xuXHRcdFx0dGhpcy5jb2RlTWlycm9yLm9uKCdmb2N1cycsIHRoaXMuZm9jdXNDaGFuZ2VkLmJpbmQodGhpcywgdHJ1ZSkpO1xuXHRcdFx0dGhpcy5jb2RlTWlycm9yLm9uKCdibHVyJywgdGhpcy5mb2N1c0NoYW5nZWQuYmluZCh0aGlzLCBmYWxzZSkpO1xuXHRcdFx0dGhpcy5jb2RlTWlycm9yLm9uKCdzY3JvbGwnLCB0aGlzLnNjcm9sbENoYW5nZWQuYmluZCh0aGlzKSk7XG5cdFx0XHR0aGlzLmNvZGVNaXJyb3Iub24oJ2N1cnNvckFjdGl2aXR5JywgdGhpcy5jdXJzb3JBY3Rpdml0eS5iaW5kKHRoaXMpKTtcblxuXHRcdFx0dGhpcy5jb2RlTWlycm9yLnNldFZhbHVlKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIHx8IHRoaXMucHJvcHMudmFsdWUgfHwgJycpO1xuXG5cdFx0XHR0aGlzLnByb3BzLm9uTG9hZCh0aGlzLmNvZGVNaXJyb3IpO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50Jyxcblx0XHR2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0XHQvLyBpcyB0aGVyZSBhIGxpZ2h0ZXItd2VpZ2h0IHdheSB0byByZW1vdmUgdGhlIGNtIGluc3RhbmNlP1xuXHRcdFx0aWYgKHRoaXMuY29kZU1pcnJvcikge1xuXHRcdFx0XHR0aGlzLmNvZGVNaXJyb3IudG9UZXh0QXJlYSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuXHRcdFx0aWYgKHRoaXMuY29kZU1pcnJvciAmJiBuZXh0UHJvcHMudmFsdWUgIT09IHVuZGVmaW5lZCAmJiBub3JtYWxpemVMaW5lRW5kaW5ncyh0aGlzLmNvZGVNaXJyb3IuZ2V0VmFsdWUoKSkgIT09IG5vcm1hbGl6ZUxpbmVFbmRpbmdzKG5leHRQcm9wcy52YWx1ZSkpIHtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMucHJlc2VydmVTY3JvbGxQb3NpdGlvbikge1xuXHRcdFx0XHRcdHZhciBwcmV2U2Nyb2xsUG9zaXRpb24gPSB0aGlzLmNvZGVNaXJyb3IuZ2V0U2Nyb2xsSW5mbygpO1xuXHRcdFx0XHRcdHRoaXMuY29kZU1pcnJvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUpO1xuXHRcdFx0XHRcdHRoaXMuY29kZU1pcnJvci5zY3JvbGxUbyhwcmV2U2Nyb2xsUG9zaXRpb24ubGVmdCwgcHJldlNjcm9sbFBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5jb2RlTWlycm9yLnNldFZhbHVlKG5leHRQcm9wcy52YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHR5cGVvZiBuZXh0UHJvcHMub3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0Zm9yICh2YXIgb3B0aW9uTmFtZSBpbiBuZXh0UHJvcHMub3B0aW9ucykge1xuXHRcdFx0XHRcdGlmIChuZXh0UHJvcHMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShvcHRpb25OYW1lKSkge1xuXHRcdFx0XHRcdFx0dmFyIG9wdGlvblZhbCA9IG5leHRQcm9wcy5vcHRpb25zW29wdGlvbk5hbWVdO1xuXHRcdFx0XHRcdFx0dGhpcy5jb2RlTWlycm9yLnNldE9wdGlvbihvcHRpb25OYW1lLCBvcHRpb25WYWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ2ZvY3VzQ2hhbmdlZCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIGZvY3VzQ2hhbmdlZChmb2N1c2VkKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNGb2N1c2VkOiBmb2N1c2VkXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucHJvcHMub25Gb2N1c0NoYW5nZSAmJiB0aGlzLnByb3BzLm9uRm9jdXNDaGFuZ2UoZm9jdXNlZCk7XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnc2Nyb2xsQ2hhbmdlZCcsXG5cdFx0dmFsdWU6IGZ1bmN0aW9uIHNjcm9sbENoYW5nZWQoY20pIHtcblx0XHRcdHRoaXMucHJvcHMub25TY3JvbGwgJiYgdGhpcy5wcm9wcy5vblNjcm9sbChjbS5nZXRTY3JvbGxJbmZvKCkpO1xuXHRcdH1cblx0fSwge1xuXHRcdGtleTogJ2NvZGVtaXJyb3JWYWx1ZUNoYW5nZWQnLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBjb2RlbWlycm9yVmFsdWVDaGFuZ2VkKGRvYywgY2hhbmdlKSB7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSAmJiBjaGFuZ2Uub3JpZ2luICE9PSAnc2V0VmFsdWUnKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMub25DaGFuZ2UoZG9jLmdldFZhbHVlKCksIGNoYW5nZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LCB7XG5cdFx0a2V5OiAnY3Vyc29yQWN0aXZpdHknLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiBjdXJzb3JBY3Rpdml0eShjbSkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkN1cnNvckNoYW5nZSAmJiB0aGlzLnByb3BzLm9uQ3Vyc29yQ2hhbmdlKHtcblx0XHRcdFx0ZnJvbTogY20uZ2V0Q3Vyc29yKFwiZnJvbVwiKSxcblx0XHRcdFx0dG86IGNtLmdldEN1cnNvcihcInRvXCIpXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sIHtcblx0XHRrZXk6ICdyZW5kZXInLFxuXHRcdHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0XHR2YXIgZWRpdG9yQ2xhc3NOYW1lID0gKDAsIF9jbGFzc25hbWVzMlsnZGVmYXVsdCddKSgnUmVhY3RDb2RlTWlycm9yJywgdGhpcy5zdGF0ZS5pc0ZvY3VzZWQgPyAnUmVhY3RDb2RlTWlycm9yLS1mb2N1c2VkJyA6IG51bGwsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcblxuXHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHR7IGNsYXNzTmFtZTogZWRpdG9yQ2xhc3NOYW1lLCBzdHlsZTogeyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCIsIHpJbmRleDogMCB9IH0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJywgeyByZWY6ICd0ZXh0YXJlYScsIGRlZmF1bHRWYWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgYXV0b0NvbXBsZXRlOiAnb2ZmJyB9KVxuXHRcdFx0KTtcblx0XHR9XG5cdH1dKTtcblxuXHRyZXR1cm4gQ29kZU1pcnJvcjtcbn0pKFJlYWN0LkNvbXBvbmVudCk7XG5cbkNvZGVNaXJyb3IucHJvcFR5cGVzID0ge1xuXHRtb2RlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRsaW5lV3JhcHBpbmc6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuXHRsaW5lTnVtYmVyczogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG5cdHJlYWRPbmx5OiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcblx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuYW55LFxuXHRjb2RlTWlycm9ySW5zdGFuY2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuXHRkZWZhdWx0VmFsdWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcblx0b25Gb2N1c0NoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdG9uU2Nyb2xsOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcblx0b3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcblx0cGF0aDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcblx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdHByZXNlcnZlU2Nyb2xsUG9zaXRpb246IFJlYWN0LlByb3BUeXBlcy5ib29sXG59O1xuXG5Db2RlTWlycm9yLmRlZmF1bHRQcm9wcyA9IHtcblx0bW9kZTogJycsXG5cdGxpbmVXcmFwcGluZzogZmFsc2UsXG5cdGxpbmVOdW1iZXJzOiBmYWxzZSxcblx0cmVhZE9ubHk6IHRydWUsXG5cdHByZXNlcnZlU2Nyb2xsUG9zaXRpb246IGZhbHNlXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDb2RlTWlycm9yO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3N5c3RlbWpzID0gcmVxdWlyZSgnc3lzdGVtanMnKTtcblxudmFyIF9zeXN0ZW1qczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zeXN0ZW1qcyk7XG5cbnZhciBfcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG52YXIgX0NvZGVNaXJyb3IgPSByZXF1aXJlKCcuL0NvZGVNaXJyb3InKTtcblxudmFyIF9Db2RlTWlycm9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvZGVNaXJyb3IpO1xuXG52YXIgZGVmaW5lID0gd2luZG93LmRlZmluZTtcbnZhciByZXF1aXJlID0gd2luZG93LnJlcXVpcmU7XG5cbl9zeXN0ZW1qczJbJ2RlZmF1bHQnXS5jb25maWcoe1xuICAgIGJhc2VVUkw6ICdwbHVnaW5zL2VkaXRvci5jb2RlbWlycm9yL3Jlcy9idWlsZCcsXG4gICAgcGFja2FnZXM6IHtcbiAgICAgICAgJ2NvZGVtaXJyb3InOiB7fSxcbiAgICAgICAgJy4nOiB7fVxuICAgIH1cbn0pO1xuXG52YXIgQ29kZU1pcnJvckxvYWRlciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhDb2RlTWlycm9yTG9hZGVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIENvZGVNaXJyb3JMb2FkZXIocHJvcHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29kZU1pcnJvckxvYWRlcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29kZU1pcnJvckxvYWRlci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcblxuICAgICAgICB2YXIgcHlkaW8gPSBwcm9wcy5weWRpbztcbiAgICAgICAgdmFyIG5vZGUgPSBwcm9wcy5ub2RlO1xuICAgICAgICB2YXIgdXJsID0gcHJvcHMudXJsO1xuICAgICAgICB2YXIgb25Mb2FkID0gcHJvcHMub25Mb2FkO1xuXG4gICAgICAgIHZhciBsb2FkZWQgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICAgICAgICAgIHdpbmRvdy5kZWZpbmUgPSBfc3lzdGVtanMyWydkZWZhdWx0J10uYW1kRGVmaW5lO1xuICAgICAgICAgICAgd2luZG93LnJlcXVpcmUgPSB3aW5kb3cucmVxdWlyZWpzID0gX3N5c3RlbWpzMlsnZGVmYXVsdCddLmFtZFJlcXVpcmU7XG5cbiAgICAgICAgICAgIF9zeXN0ZW1qczJbJ2RlZmF1bHQnXVsnaW1wb3J0J10oJ2NvZGVtaXJyb3IvbGliL2NvZGVtaXJyb3InKS50aGVuKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgdmFyIENvZGVNaXJyb3IgPSBtO1xuICAgICAgICAgICAgICAgIF9zeXN0ZW1qczJbJ2RlZmF1bHQnXVsnaW1wb3J0J10oJ2NvZGVtaXJyb3IvYWRkb24vc2VhcmNoL3NlYXJjaCcpO1xuICAgICAgICAgICAgICAgIF9zeXN0ZW1qczJbJ2RlZmF1bHQnXVsnaW1wb3J0J10oJ2NvZGVtaXJyb3IvYWRkb24vbW9kZS9sb2FkbW9kZScpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfc3lzdGVtanMyWydkZWZhdWx0J11bJ2ltcG9ydCddKCdjb2RlbWlycm9yL21vZGUvbWV0YScpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgQ29kZU1pcnJvci5tb2RlVVJMID0gJ2NvZGVtaXJyb3IvbW9kZS8lTi8lTi5qcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKENvZGVNaXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBsb2FkZWQ6IGxvYWRlZFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25Mb2FkID0gZnVuY3Rpb24gKGNvZGVtaXJyb3IpIHtcbiAgICAgICAgICAgIF90aGlzLnByb3BzLm9uTG9hZChjb2RlbWlycm9yKTtcblxuICAgICAgICAgICAgd2luZG93LmRlZmluZSA9IGRlZmluZTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1aXJlID0gd2luZG93LnJlcXVpcmVqcyA9IHJlcXVpcmU7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxpbmcgbG9hZGluZ1xuXG4gICAgX2NyZWF0ZUNsYXNzKENvZGVNaXJyb3JMb2FkZXIsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc3RhdGUubG9hZGVkLnRoZW4oZnVuY3Rpb24gKENvZGVNaXJyb3IpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBjb2RlbWlycm9ySW5zdGFuY2U6IENvZGVNaXJyb3IgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICAgICAgLy8gSWYgQ29kZSBNaXJyb3IgbGlicmFyeSBpcyBub3QgbG9hZGVkLCBkbyBub3QgZ28gZnVydGhlclxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNvZGVtaXJyb3JJbnN0YW5jZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KF9Db2RlTWlycm9yMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5zdGF0ZS51cmwsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMuY29udGVudCxcbiAgICAgICAgICAgICAgICBjb2RlTWlycm9ySW5zdGFuY2U6IHRoaXMuc3RhdGUuY29kZW1pcnJvckluc3RhbmNlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMucHJvcHMub3B0aW9ucyxcblxuICAgICAgICAgICAgICAgIG9uTG9hZDogdGhpcy5vbkxvYWQsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsXG4gICAgICAgICAgICAgICAgb25DdXJzb3JDaGFuZ2U6IHRoaXMucHJvcHMub25DdXJzb3JDaGFuZ2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvZGVNaXJyb3JMb2FkZXI7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5Db2RlTWlycm9yTG9hZGVyLnByb3BUeXBlcyA9IHtcbiAgICB1cmw6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblxuICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uQ3Vyc29yQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDb2RlTWlycm9yTG9hZGVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIEVkaXRvckFjdGlvbnMgPSBfUHlkaW8kcmVxdWlyZUxpYi5FZGl0b3JBY3Rpb25zO1xuXG4vLyBBY3Rpb25zIGRlZmluaXRpb25zXG52YXIgb25TYXZlID0gZnVuY3Rpb24gb25TYXZlKF9yZWYpIHtcbiAgICB2YXIgcHlkaW8gPSBfcmVmLnB5ZGlvO1xuICAgIHZhciB1cmwgPSBfcmVmLnVybDtcbiAgICB2YXIgY29udGVudCA9IF9yZWYuY29udGVudDtcbiAgICB2YXIgZGlzcGF0Y2ggPSBfcmVmLmRpc3BhdGNoO1xuICAgIHZhciBpZCA9IF9yZWYuaWQ7XG5cbiAgICByZXR1cm4gcHlkaW8uQXBpQ2xpZW50LnBvc3RQbGFpblRleHRDb250ZW50KHVybCwgY29udGVudCwgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7IGlkOiBpZCwgZXJyb3I6IFwiVGhlcmUgd2FzIGFuIGVycm9yIHdoaWxlIHNhdmluZ1wiIH0pKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZXhwb3J0cy5vblNhdmUgPSBvblNhdmU7XG52YXIgb25VbmRvID0gZnVuY3Rpb24gb25VbmRvKF9yZWYyKSB7XG4gICAgdmFyIGNvZGVtaXJyb3IgPSBfcmVmMi5jb2RlbWlycm9yO1xuICAgIHJldHVybiBjb2RlbWlycm9yLnVuZG8oKTtcbn07XG5leHBvcnRzLm9uVW5kbyA9IG9uVW5kbztcbnZhciBvblJlZG8gPSBmdW5jdGlvbiBvblJlZG8oX3JlZjMpIHtcbiAgICB2YXIgY29kZW1pcnJvciA9IF9yZWYzLmNvZGVtaXJyb3I7XG4gICAgcmV0dXJuIGNvZGVtaXJyb3IucmVkbygpO1xufTtcbmV4cG9ydHMub25SZWRvID0gb25SZWRvO1xudmFyIG9uVG9nZ2xlTGluZU51bWJlcnMgPSBmdW5jdGlvbiBvblRvZ2dsZUxpbmVOdW1iZXJzKF9yZWY0KSB7XG4gICAgdmFyIGRpc3BhdGNoID0gX3JlZjQuZGlzcGF0Y2g7XG4gICAgdmFyIGlkID0gX3JlZjQuaWQ7XG4gICAgdmFyIGxpbmVOdW1iZXJzID0gX3JlZjQubGluZU51bWJlcnM7XG4gICAgcmV0dXJuIGRpc3BhdGNoKEVkaXRvckFjdGlvbnMudGFiTW9kaWZ5KHsgaWQ6IGlkLCBsaW5lTnVtYmVyczogIWxpbmVOdW1iZXJzIH0pKTtcbn07XG5leHBvcnRzLm9uVG9nZ2xlTGluZU51bWJlcnMgPSBvblRvZ2dsZUxpbmVOdW1iZXJzO1xudmFyIG9uVG9nZ2xlTGluZVdyYXBwaW5nID0gZnVuY3Rpb24gb25Ub2dnbGVMaW5lV3JhcHBpbmcoX3JlZjUpIHtcbiAgICB2YXIgZGlzcGF0Y2ggPSBfcmVmNS5kaXNwYXRjaDtcbiAgICB2YXIgaWQgPSBfcmVmNS5pZDtcbiAgICB2YXIgbGluZVdyYXBwaW5nID0gX3JlZjUubGluZVdyYXBwaW5nO1xuICAgIHJldHVybiBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7IGlkOiBpZCwgbGluZVdyYXBwaW5nOiAhbGluZVdyYXBwaW5nIH0pKTtcbn07XG5cbmV4cG9ydHMub25Ub2dnbGVMaW5lV3JhcHBpbmcgPSBvblRvZ2dsZUxpbmVXcmFwcGluZztcbnZhciBvblNlYXJjaCA9IGZ1bmN0aW9uIG9uU2VhcmNoKF9yZWY2KSB7XG4gICAgdmFyIGNvZGVtaXJyb3IgPSBfcmVmNi5jb2RlbWlycm9yO1xuICAgIHZhciBjdXJzb3IgPSBfcmVmNi5jdXJzb3I7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgcXVlcnkgPSAoMCwgX3V0aWxzLnBhcnNlUXVlcnkpKHZhbHVlKTtcblxuICAgICAgICB2YXIgY3VyID0gY29kZW1pcnJvci5nZXRTZWFyY2hDdXJzb3IocXVlcnksIGN1cnNvci50byk7XG5cbiAgICAgICAgaWYgKCFjdXIuZmluZCgpKSB7XG4gICAgICAgICAgICBjdXIgPSBjb2RlbWlycm9yLmdldFNlYXJjaEN1cnNvcihxdWVyeSwgMCk7XG4gICAgICAgICAgICBpZiAoIWN1ci5maW5kKCkpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvZGVtaXJyb3Iuc2V0U2VsZWN0aW9uKGN1ci5mcm9tKCksIGN1ci50bygpKTtcbiAgICAgICAgY29kZW1pcnJvci5zY3JvbGxJbnRvVmlldyh7IGZyb206IGN1ci5mcm9tKCksIHRvOiBjdXIudG8oKSB9LCAyMCk7XG4gICAgfTtcbn07XG5cbmV4cG9ydHMub25TZWFyY2ggPSBvblNlYXJjaDtcbnZhciBvbkp1bXBUbyA9IGZ1bmN0aW9uIG9uSnVtcFRvKF9yZWY3KSB7XG4gICAgdmFyIGNvZGVtaXJyb3IgPSBfcmVmNy5jb2RlbWlycm9yO1xuICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgIHZhciBjdXIgPSBjb2RlbWlycm9yLmdldEN1cnNvcigpO1xuXG4gICAgICAgIGNvZGVtaXJyb3IuZm9jdXMoKTtcbiAgICAgICAgY29kZW1pcnJvci5zZXRDdXJzb3IobGluZSAtIDEsIGN1ci5jaCk7XG4gICAgICAgIGNvZGVtaXJyb3Iuc2Nyb2xsSW50b1ZpZXcoeyBsaW5lOiBsaW5lIC0gMSwgY2g6IGN1ci5jaCB9LCAyMCk7XG4gICAgfTtcbn07XG5leHBvcnRzLm9uSnVtcFRvID0gb25KdW1wVG87XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xudmFyIF9QeWRpb0hPQ3MgPSBQeWRpb0hPQ3M7XG52YXIgQ29udGVudENvbnRyb2xzID0gX1B5ZGlvSE9Dcy5Db250ZW50Q29udHJvbHM7XG52YXIgQ29udGVudFNlYXJjaENvbnRyb2xzID0gX1B5ZGlvSE9Dcy5Db250ZW50U2VhcmNoQ29udHJvbHM7XG5leHBvcnRzLkNvbnRlbnRDb250cm9scyA9IENvbnRlbnRDb250cm9scztcbmV4cG9ydHMuQ29udGVudFNlYXJjaENvbnRyb2xzID0gQ29udGVudFNlYXJjaENvbnRyb2xzO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RSZWR1eCA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbnZhciBfcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG52YXIgX0NvZGVNaXJyb3JMb2FkZXIgPSByZXF1aXJlKCcuL0NvZGVNaXJyb3JMb2FkZXInKTtcblxudmFyIF9Db2RlTWlycm9yTG9hZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvZGVNaXJyb3JMb2FkZXIpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBFZGl0b3JBY3Rpb25zID0gX1B5ZGlvJHJlcXVpcmVMaWIuRWRpdG9yQWN0aW9ucztcblxudmFyIEVkaXRvciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhFZGl0b3IsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRWRpdG9yKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEVkaXRvci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcblxuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgdmFyIHRhYiA9IF9wcm9wcy50YWI7XG4gICAgICAgIHZhciBkaXNwYXRjaCA9IF9wcm9wcy5kaXNwYXRjaDtcbiAgICAgICAgdmFyIGlkID0gdGFiLmlkO1xuXG4gICAgICAgIGlmICghaWQpIGRpc3BhdGNoKEVkaXRvckFjdGlvbnMudGFiQ3JlYXRlKHsgaWQ6IG5vZGUuZ2V0TGFiZWwoKSwgbm9kZTogbm9kZSB9KSk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVkaXRvciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgICAgICB2YXIgdGFiID0gX3Byb3BzMi50YWI7XG4gICAgICAgICAgICB2YXIgZGlzcGF0Y2ggPSBfcHJvcHMyLmRpc3BhdGNoO1xuICAgICAgICAgICAgdmFyIGlkID0gdGFiLmlkO1xuXG4gICAgICAgICAgICBweWRpby5BcGlDbGllbnQucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgZ2V0X2FjdGlvbjogJ2dldF9jb250ZW50JyxcbiAgICAgICAgICAgICAgICBmaWxlOiBub2RlLmdldFBhdGgoKVxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2VUZXh0ID0gX3JlZi5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpc3BhdGNoKEVkaXRvckFjdGlvbnMudGFiTW9kaWZ5KHsgaWQ6IGlkIHx8IG5vZGUuZ2V0TGFiZWwoKSwgbGluZU51bWJlcnM6IHRydWUsIGNvbnRlbnQ6IHJlc3BvbnNlVGV4dCB9KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzMy5ub2RlO1xuICAgICAgICAgICAgdmFyIHRhYiA9IF9wcm9wczMudGFiO1xuICAgICAgICAgICAgdmFyIGVycm9yID0gX3Byb3BzMy5lcnJvcjtcbiAgICAgICAgICAgIHZhciBkaXNwYXRjaCA9IF9wcm9wczMuZGlzcGF0Y2g7XG5cbiAgICAgICAgICAgIGlmICghdGFiKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgdmFyIGlkID0gdGFiLmlkO1xuICAgICAgICAgICAgdmFyIGNvZGVtaXJyb3IgPSB0YWIuY29kZW1pcnJvcjtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdGFiLmNvbnRlbnQ7XG4gICAgICAgICAgICB2YXIgbGluZVdyYXBwaW5nID0gdGFiLmxpbmVXcmFwcGluZztcbiAgICAgICAgICAgIHZhciBsaW5lTnVtYmVycyA9IHRhYi5saW5lTnVtYmVycztcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9Db2RlTWlycm9yTG9hZGVyMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgIHVybDogbm9kZS5nZXRQYXRoKCksXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7IGxpbmVOdW1iZXJzOiBsaW5lTnVtYmVycywgbGluZVdyYXBwaW5nOiBsaW5lV3JhcHBpbmcgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG5cbiAgICAgICAgICAgICAgICBvbkxvYWQ6IGZ1bmN0aW9uIChjb2RlbWlycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7IGlkOiBpZCwgY29kZW1pcnJvcjogY29kZW1pcnJvciB9KSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpc3BhdGNoKEVkaXRvckFjdGlvbnMudGFiTW9kaWZ5KHsgaWQ6IGlkLCBjb250ZW50OiBjb250ZW50IH0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQ3Vyc29yQ2hhbmdlOiBmdW5jdGlvbiAoY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7IGlkOiBpZCwgY3Vyc29yOiBjdXJzb3IgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFZGl0b3I7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIG1hcFN0YXRlVG9Qcm9wcyA9IGZ1bmN0aW9uIG1hcFN0YXRlVG9Qcm9wcyhzdGF0ZSwgcHJvcHMpIHtcbiAgICB2YXIgdGFicyA9IHN0YXRlLnRhYnM7XG5cbiAgICB2YXIgdGFiID0gdGFicy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgICAgIHZhciBlZGl0b3JEYXRhID0gX3JlZjIuZWRpdG9yRGF0YTtcbiAgICAgICAgdmFyIG5vZGUgPSBfcmVmMi5ub2RlO1xuICAgICAgICByZXR1cm4gKCFlZGl0b3JEYXRhIHx8IGVkaXRvckRhdGEuaWQgPT09IHByb3BzLmVkaXRvckRhdGEuaWQpICYmIG5vZGUuZ2V0UGF0aCgpID09PSBwcm9wcy5ub2RlLmdldFBhdGgoKTtcbiAgICB9KVswXSB8fCB7fTtcblxuICAgIHJldHVybiBfZXh0ZW5kcyh7XG4gICAgICAgIGlkOiB0YWIuaWQsXG4gICAgICAgIHRhYjogdGFiXG4gICAgfSwgcHJvcHMpO1xufTtcblxuZXhwb3J0cy5tYXBTdGF0ZVRvUHJvcHMgPSBtYXBTdGF0ZVRvUHJvcHM7XG5leHBvcnRzWydkZWZhdWx0J10gPSAoMCwgX3JlYWN0UmVkdXguY29ubmVjdCkobWFwU3RhdGVUb1Byb3BzKShFZGl0b3IpO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqWydkZWZhdWx0J10gPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfZWRpdG9yID0gcmVxdWlyZSgnLi9lZGl0b3InKTtcblxudmFyIF9lZGl0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZWRpdG9yKTtcblxudmFyIF9hY3Rpb25zID0gcmVxdWlyZSgnLi9hY3Rpb25zJyk7XG5cbnZhciBBY3Rpb25zID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2FjdGlvbnMpO1xuXG52YXIgX2NvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scycpO1xuXG52YXIgQ29udHJvbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfY29udHJvbHMpO1xuXG52YXIgX0NvZGVNaXJyb3JMb2FkZXIgPSByZXF1aXJlKCcuL0NvZGVNaXJyb3JMb2FkZXInKTtcblxudmFyIF9Db2RlTWlycm9yTG9hZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvZGVNaXJyb3JMb2FkZXIpO1xuXG5leHBvcnRzLkVkaXRvciA9IF9lZGl0b3IyWydkZWZhdWx0J107XG5leHBvcnRzLkFjdGlvbnMgPSBBY3Rpb25zO1xuZXhwb3J0cy5Db250cm9scyA9IENvbnRyb2xzO1xuZXhwb3J0cy5Mb2FkZXIgPSBfQ29kZU1pcnJvckxvYWRlcjJbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciBwYXJzZVN0cmluZyA9IGZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFxcXCguKS9nLCBmdW5jdGlvbiAoXywgY2gpIHtcbiAgICAgICAgcmV0dXJuIGNoID09PSBcIm5cIiA/IFwiXFxuXCIgOiBjaCA9PT0gXCJyXCIgPyBcIlxcclwiIDogY2g7XG4gICAgfSk7XG59O1xuXG5leHBvcnRzLnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG52YXIgcGFyc2VRdWVyeSA9IGZ1bmN0aW9uIHBhcnNlUXVlcnkocXVlcnkpIHtcblxuICAgIHZhciBpc1JFID0gcXVlcnkubWF0Y2goL15cXC8oLiopXFwvKFthLXpdKikkLyk7XG4gICAgaWYgKGlzUkUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gbmV3IFJlZ0V4cChpc1JFWzFdLCBpc1JFWzJdLmluZGV4T2YoXCJpXCIpID09IC0xID8gXCJcIiA6IFwiaVwiKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge30gLy8gTm90IGEgcmVndWxhciBleHByZXNzaW9uIGFmdGVyIGFsbCwgZG8gYSBzdHJpbmcgc2VhcmNoXG4gICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gcGFyc2VTdHJpbmcocXVlcnkpO1xuICAgICAgICB9XG4gICAgaWYgKHR5cGVvZiBxdWVyeSA9PSBcInN0cmluZ1wiID8gcXVlcnkgPT0gXCJcIiA6IHF1ZXJ5LnRlc3QoXCJcIikpIHF1ZXJ5ID0gL3heLztcblxuICAgIHJldHVybiBxdWVyeTtcbn07XG5leHBvcnRzLnBhcnNlUXVlcnkgPSBwYXJzZVF1ZXJ5O1xuIl19
