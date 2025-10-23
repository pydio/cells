/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright 2024 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = globalThis.pdfjsImageDecoders = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Jbig2Error: () => (/* reexport */ Jbig2Error),
  Jbig2Image: () => (/* reexport */ Jbig2Image),
  JpegError: () => (/* reexport */ JpegError),
  JpegImage: () => (/* reexport */ JpegImage),
  JpxError: () => (/* reexport */ JpxError),
  JpxImage: () => (/* reexport */ JpxImage),
  VerbosityLevel: () => (/* reexport */ VerbosityLevel),
  getVerbosityLevel: () => (/* reexport */ getVerbosityLevel),
  setVerbosityLevel: () => (/* reexport */ setVerbosityLevel)
});

;// ./src/shared/util.js
const isNodeJS = typeof process === "object" && process + "" === "[object process]" && !process.versions.nw && !(process.versions.electron && process.type && process.type !== "browser");
const IDENTITY_MATRIX = (/* unused pure expression or super */ null && ([1, 0, 0, 1, 0, 0]));
const FONT_IDENTITY_MATRIX = (/* unused pure expression or super */ null && ([0.001, 0, 0, 0.001, 0, 0]));
const MAX_IMAGE_SIZE_TO_CACHE = 10e6;
const LINE_FACTOR = 1.35;
const LINE_DESCENT_FACTOR = 0.35;
const BASELINE_FACTOR = LINE_DESCENT_FACTOR / LINE_FACTOR;
const RenderingIntentFlag = {
  ANY: 0x01,
  DISPLAY: 0x02,
  PRINT: 0x04,
  SAVE: 0x08,
  ANNOTATIONS_FORMS: 0x10,
  ANNOTATIONS_STORAGE: 0x20,
  ANNOTATIONS_DISABLE: 0x40,
  IS_EDITING: 0x80,
  OPLIST: 0x100
};
const AnnotationMode = {
  DISABLE: 0,
  ENABLE: 1,
  ENABLE_FORMS: 2,
  ENABLE_STORAGE: 3
};
const util_AnnotationEditorPrefix = "pdfjs_internal_editor_";
const AnnotationEditorType = {
  DISABLE: -1,
  NONE: 0,
  FREETEXT: 3,
  HIGHLIGHT: 9,
  STAMP: 13,
  INK: 15
};
const AnnotationEditorParamsType = {
  RESIZE: 1,
  CREATE: 2,
  FREETEXT_SIZE: 11,
  FREETEXT_COLOR: 12,
  FREETEXT_OPACITY: 13,
  INK_COLOR: 21,
  INK_THICKNESS: 22,
  INK_OPACITY: 23,
  HIGHLIGHT_COLOR: 31,
  HIGHLIGHT_DEFAULT_COLOR: 32,
  HIGHLIGHT_THICKNESS: 33,
  HIGHLIGHT_FREE: 34,
  HIGHLIGHT_SHOW_ALL: 35
};
const PermissionFlag = {
  PRINT: 0x04,
  MODIFY_CONTENTS: 0x08,
  COPY: 0x10,
  MODIFY_ANNOTATIONS: 0x20,
  FILL_INTERACTIVE_FORMS: 0x100,
  COPY_FOR_ACCESSIBILITY: 0x200,
  ASSEMBLE: 0x400,
  PRINT_HIGH_QUALITY: 0x800
};
const TextRenderingMode = {
  FILL: 0,
  STROKE: 1,
  FILL_STROKE: 2,
  INVISIBLE: 3,
  FILL_ADD_TO_PATH: 4,
  STROKE_ADD_TO_PATH: 5,
  FILL_STROKE_ADD_TO_PATH: 6,
  ADD_TO_PATH: 7,
  FILL_STROKE_MASK: 3,
  ADD_TO_PATH_FLAG: 4
};
const util_ImageKind = {
  GRAYSCALE_1BPP: 1,
  RGB_24BPP: 2,
  RGBA_32BPP: 3
};
const AnnotationType = {
  TEXT: 1,
  LINK: 2,
  FREETEXT: 3,
  LINE: 4,
  SQUARE: 5,
  CIRCLE: 6,
  POLYGON: 7,
  POLYLINE: 8,
  HIGHLIGHT: 9,
  UNDERLINE: 10,
  SQUIGGLY: 11,
  STRIKEOUT: 12,
  STAMP: 13,
  CARET: 14,
  INK: 15,
  POPUP: 16,
  FILEATTACHMENT: 17,
  SOUND: 18,
  MOVIE: 19,
  WIDGET: 20,
  SCREEN: 21,
  PRINTERMARK: 22,
  TRAPNET: 23,
  WATERMARK: 24,
  THREED: 25,
  REDACT: 26
};
const AnnotationReplyType = {
  GROUP: "Group",
  REPLY: "R"
};
const AnnotationFlag = {
  INVISIBLE: 0x01,
  HIDDEN: 0x02,
  PRINT: 0x04,
  NOZOOM: 0x08,
  NOROTATE: 0x10,
  NOVIEW: 0x20,
  READONLY: 0x40,
  LOCKED: 0x80,
  TOGGLENOVIEW: 0x100,
  LOCKEDCONTENTS: 0x200
};
const AnnotationFieldFlag = {
  READONLY: 0x0000001,
  REQUIRED: 0x0000002,
  NOEXPORT: 0x0000004,
  MULTILINE: 0x0001000,
  PASSWORD: 0x0002000,
  NOTOGGLETOOFF: 0x0004000,
  RADIO: 0x0008000,
  PUSHBUTTON: 0x0010000,
  COMBO: 0x0020000,
  EDIT: 0x0040000,
  SORT: 0x0080000,
  FILESELECT: 0x0100000,
  MULTISELECT: 0x0200000,
  DONOTSPELLCHECK: 0x0400000,
  DONOTSCROLL: 0x0800000,
  COMB: 0x1000000,
  RICHTEXT: 0x2000000,
  RADIOSINUNISON: 0x2000000,
  COMMITONSELCHANGE: 0x4000000
};
const AnnotationBorderStyleType = {
  SOLID: 1,
  DASHED: 2,
  BEVELED: 3,
  INSET: 4,
  UNDERLINE: 5
};
const AnnotationActionEventType = {
  E: "Mouse Enter",
  X: "Mouse Exit",
  D: "Mouse Down",
  U: "Mouse Up",
  Fo: "Focus",
  Bl: "Blur",
  PO: "PageOpen",
  PC: "PageClose",
  PV: "PageVisible",
  PI: "PageInvisible",
  K: "Keystroke",
  F: "Format",
  V: "Validate",
  C: "Calculate"
};
const DocumentActionEventType = {
  WC: "WillClose",
  WS: "WillSave",
  DS: "DidSave",
  WP: "WillPrint",
  DP: "DidPrint"
};
const PageActionEventType = {
  O: "PageOpen",
  C: "PageClose"
};
const VerbosityLevel = {
  ERRORS: 0,
  WARNINGS: 1,
  INFOS: 5
};
const OPS = {
  dependency: 1,
  setLineWidth: 2,
  setLineCap: 3,
  setLineJoin: 4,
  setMiterLimit: 5,
  setDash: 6,
  setRenderingIntent: 7,
  setFlatness: 8,
  setGState: 9,
  save: 10,
  restore: 11,
  transform: 12,
  moveTo: 13,
  lineTo: 14,
  curveTo: 15,
  curveTo2: 16,
  curveTo3: 17,
  closePath: 18,
  rectangle: 19,
  stroke: 20,
  closeStroke: 21,
  fill: 22,
  eoFill: 23,
  fillStroke: 24,
  eoFillStroke: 25,
  closeFillStroke: 26,
  closeEOFillStroke: 27,
  endPath: 28,
  clip: 29,
  eoClip: 30,
  beginText: 31,
  endText: 32,
  setCharSpacing: 33,
  setWordSpacing: 34,
  setHScale: 35,
  setLeading: 36,
  setFont: 37,
  setTextRenderingMode: 38,
  setTextRise: 39,
  moveText: 40,
  setLeadingMoveText: 41,
  setTextMatrix: 42,
  nextLine: 43,
  showText: 44,
  showSpacedText: 45,
  nextLineShowText: 46,
  nextLineSetSpacingShowText: 47,
  setCharWidth: 48,
  setCharWidthAndBounds: 49,
  setStrokeColorSpace: 50,
  setFillColorSpace: 51,
  setStrokeColor: 52,
  setStrokeColorN: 53,
  setFillColor: 54,
  setFillColorN: 55,
  setStrokeGray: 56,
  setFillGray: 57,
  setStrokeRGBColor: 58,
  setFillRGBColor: 59,
  setStrokeCMYKColor: 60,
  setFillCMYKColor: 61,
  shadingFill: 62,
  beginInlineImage: 63,
  beginImageData: 64,
  endInlineImage: 65,
  paintXObject: 66,
  markPoint: 67,
  markPointProps: 68,
  beginMarkedContent: 69,
  beginMarkedContentProps: 70,
  endMarkedContent: 71,
  beginCompat: 72,
  endCompat: 73,
  paintFormXObjectBegin: 74,
  paintFormXObjectEnd: 75,
  beginGroup: 76,
  endGroup: 77,
  beginAnnotation: 80,
  endAnnotation: 81,
  paintImageMaskXObject: 83,
  paintImageMaskXObjectGroup: 84,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87,
  paintImageXObjectRepeat: 88,
  paintImageMaskXObjectRepeat: 89,
  paintSolidColorImageMask: 90,
  constructPath: 91,
  setStrokeTransparent: 92,
  setFillTransparent: 93
};
const PasswordResponses = {
  NEED_PASSWORD: 1,
  INCORRECT_PASSWORD: 2
};
let verbosity = VerbosityLevel.WARNINGS;
function setVerbosityLevel(level) {
  if (Number.isInteger(level)) {
    verbosity = level;
  }
}
function getVerbosityLevel() {
  return verbosity;
}
function info(msg) {
  if (verbosity >= VerbosityLevel.INFOS) {
    console.log(`Info: ${msg}`);
  }
}
function util_warn(msg) {
  if (verbosity >= VerbosityLevel.WARNINGS) {
    console.log(`Warning: ${msg}`);
  }
}
function util_unreachable(msg) {
  throw new Error(msg);
}
function util_assert(cond, msg) {
  if (!cond) {
    util_unreachable(msg);
  }
}
function _isValidProtocol(url) {
  switch (url?.protocol) {
    case "http:":
    case "https:":
    case "ftp:":
    case "mailto:":
    case "tel:":
      return true;
    default:
      return false;
  }
}
function createValidAbsoluteUrl(url, baseUrl = null, options = null) {
  if (!url) {
    return null;
  }
  try {
    if (options && typeof url === "string") {
      if (options.addDefaultProtocol && url.startsWith("www.")) {
        const dots = url.match(/\./g);
        if (dots?.length >= 2) {
          url = `http://${url}`;
        }
      }
      if (options.tryConvertEncoding) {
        try {
          url = stringToUTF8String(url);
        } catch {}
      }
    }
    const absoluteUrl = baseUrl ? new URL(url, baseUrl) : new URL(url);
    if (_isValidProtocol(absoluteUrl)) {
      return absoluteUrl;
    }
  } catch {}
  return null;
}
function util_shadow(obj, prop, value, nonSerializable = false) {
  Object.defineProperty(obj, prop, {
    value,
    enumerable: !nonSerializable,
    configurable: true,
    writable: false
  });
  return value;
}
const BaseException = function BaseExceptionClosure() {
  function BaseException(message, name) {
    this.message = message;
    this.name = name;
  }
  BaseException.prototype = new Error();
  BaseException.constructor = BaseException;
  return BaseException;
}();
class PasswordException extends BaseException {
  constructor(msg, code) {
    super(msg, "PasswordException");
    this.code = code;
  }
}
class UnknownErrorException extends BaseException {
  constructor(msg, details) {
    super(msg, "UnknownErrorException");
    this.details = details;
  }
}
class InvalidPDFException extends BaseException {
  constructor(msg) {
    super(msg, "InvalidPDFException");
  }
}
class MissingPDFException extends BaseException {
  constructor(msg) {
    super(msg, "MissingPDFException");
  }
}
class UnexpectedResponseException extends BaseException {
  constructor(msg, status) {
    super(msg, "UnexpectedResponseException");
    this.status = status;
  }
}
class FormatError extends BaseException {
  constructor(msg) {
    super(msg, "FormatError");
  }
}
class AbortException extends BaseException {
  constructor(msg) {
    super(msg, "AbortException");
  }
}
function bytesToString(bytes) {
  if (typeof bytes !== "object" || bytes?.length === undefined) {
    util_unreachable("Invalid argument for bytesToString");
  }
  const length = bytes.length;
  const MAX_ARGUMENT_COUNT = 8192;
  if (length < MAX_ARGUMENT_COUNT) {
    return String.fromCharCode.apply(null, bytes);
  }
  const strBuf = [];
  for (let i = 0; i < length; i += MAX_ARGUMENT_COUNT) {
    const chunkEnd = Math.min(i + MAX_ARGUMENT_COUNT, length);
    const chunk = bytes.subarray(i, chunkEnd);
    strBuf.push(String.fromCharCode.apply(null, chunk));
  }
  return strBuf.join("");
}
function stringToBytes(str) {
  if (typeof str !== "string") {
    util_unreachable("Invalid argument for stringToBytes");
  }
  const length = str.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; ++i) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}
function string32(value) {
  return String.fromCharCode(value >> 24 & 0xff, value >> 16 & 0xff, value >> 8 & 0xff, value & 0xff);
}
function util_objectSize(obj) {
  return Object.keys(obj).length;
}
function objectFromMap(map) {
  const obj = Object.create(null);
  for (const [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}
function isLittleEndian() {
  const buffer8 = new Uint8Array(4);
  buffer8[0] = 1;
  const view32 = new Uint32Array(buffer8.buffer, 0, 1);
  return view32[0] === 1;
}
function isEvalSupported() {
  try {
    new Function("");
    return true;
  } catch {
    return false;
  }
}
class util_FeatureTest {
  static get isLittleEndian() {
    return util_shadow(this, "isLittleEndian", isLittleEndian());
  }
  static get isEvalSupported() {
    return util_shadow(this, "isEvalSupported", isEvalSupported());
  }
  static get isOffscreenCanvasSupported() {
    return util_shadow(this, "isOffscreenCanvasSupported", typeof OffscreenCanvas !== "undefined");
  }
  static get platform() {
    if (typeof navigator !== "undefined" && typeof navigator?.platform === "string") {
      return util_shadow(this, "platform", {
        isMac: navigator.platform.includes("Mac"),
        isWindows: navigator.platform.includes("Win"),
        isFirefox: typeof navigator?.userAgent === "string" && navigator.userAgent.includes("Firefox")
      });
    }
    return util_shadow(this, "platform", {
      isMac: false,
      isWindows: false,
      isFirefox: false
    });
  }
  static get isCSSRoundSupported() {
    return util_shadow(this, "isCSSRoundSupported", globalThis.CSS?.supports?.("width: round(1.5px, 1px)"));
  }
}
const util_hexNumbers = Array.from(Array(256).keys(), n => n.toString(16).padStart(2, "0"));
class util_Util {
  static makeHexColor(r, g, b) {
    return `#${util_hexNumbers[r]}${util_hexNumbers[g]}${util_hexNumbers[b]}`;
  }
  static scaleMinMax(transform, minMax) {
    let temp;
    if (transform[0]) {
      if (transform[0] < 0) {
        temp = minMax[0];
        minMax[0] = minMax[2];
        minMax[2] = temp;
      }
      minMax[0] *= transform[0];
      minMax[2] *= transform[0];
      if (transform[3] < 0) {
        temp = minMax[1];
        minMax[1] = minMax[3];
        minMax[3] = temp;
      }
      minMax[1] *= transform[3];
      minMax[3] *= transform[3];
    } else {
      temp = minMax[0];
      minMax[0] = minMax[1];
      minMax[1] = temp;
      temp = minMax[2];
      minMax[2] = minMax[3];
      minMax[3] = temp;
      if (transform[1] < 0) {
        temp = minMax[1];
        minMax[1] = minMax[3];
        minMax[3] = temp;
      }
      minMax[1] *= transform[1];
      minMax[3] *= transform[1];
      if (transform[2] < 0) {
        temp = minMax[0];
        minMax[0] = minMax[2];
        minMax[2] = temp;
      }
      minMax[0] *= transform[2];
      minMax[2] *= transform[2];
    }
    minMax[0] += transform[4];
    minMax[1] += transform[5];
    minMax[2] += transform[4];
    minMax[3] += transform[5];
  }
  static transform(m1, m2) {
    return [m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1], m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3], m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5]];
  }
  static applyTransform(p, m) {
    const xt = p[0] * m[0] + p[1] * m[2] + m[4];
    const yt = p[0] * m[1] + p[1] * m[3] + m[5];
    return [xt, yt];
  }
  static applyInverseTransform(p, m) {
    const d = m[0] * m[3] - m[1] * m[2];
    const xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
    const yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
    return [xt, yt];
  }
  static getAxialAlignedBoundingBox(r, m) {
    const p1 = this.applyTransform(r, m);
    const p2 = this.applyTransform(r.slice(2, 4), m);
    const p3 = this.applyTransform([r[0], r[3]], m);
    const p4 = this.applyTransform([r[2], r[1]], m);
    return [Math.min(p1[0], p2[0], p3[0], p4[0]), Math.min(p1[1], p2[1], p3[1], p4[1]), Math.max(p1[0], p2[0], p3[0], p4[0]), Math.max(p1[1], p2[1], p3[1], p4[1])];
  }
  static inverseTransform(m) {
    const d = m[0] * m[3] - m[1] * m[2];
    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d, (m[2] * m[5] - m[4] * m[3]) / d, (m[4] * m[1] - m[5] * m[0]) / d];
  }
  static singularValueDecompose2dScale(m) {
    const transpose = [m[0], m[2], m[1], m[3]];
    const a = m[0] * transpose[0] + m[1] * transpose[2];
    const b = m[0] * transpose[1] + m[1] * transpose[3];
    const c = m[2] * transpose[0] + m[3] * transpose[2];
    const d = m[2] * transpose[1] + m[3] * transpose[3];
    const first = (a + d) / 2;
    const second = Math.sqrt((a + d) ** 2 - 4 * (a * d - c * b)) / 2;
    const sx = first + second || 1;
    const sy = first - second || 1;
    return [Math.sqrt(sx), Math.sqrt(sy)];
  }
  static normalizeRect(rect) {
    const r = rect.slice(0);
    if (rect[0] > rect[2]) {
      r[0] = rect[2];
      r[2] = rect[0];
    }
    if (rect[1] > rect[3]) {
      r[1] = rect[3];
      r[3] = rect[1];
    }
    return r;
  }
  static intersect(rect1, rect2) {
    const xLow = Math.max(Math.min(rect1[0], rect1[2]), Math.min(rect2[0], rect2[2]));
    const xHigh = Math.min(Math.max(rect1[0], rect1[2]), Math.max(rect2[0], rect2[2]));
    if (xLow > xHigh) {
      return null;
    }
    const yLow = Math.max(Math.min(rect1[1], rect1[3]), Math.min(rect2[1], rect2[3]));
    const yHigh = Math.min(Math.max(rect1[1], rect1[3]), Math.max(rect2[1], rect2[3]));
    if (yLow > yHigh) {
      return null;
    }
    return [xLow, yLow, xHigh, yHigh];
  }
  static #getExtremumOnCurve(x0, x1, x2, x3, y0, y1, y2, y3, t, minMax) {
    if (t <= 0 || t >= 1) {
      return;
    }
    const mt = 1 - t;
    const tt = t * t;
    const ttt = tt * t;
    const x = mt * (mt * (mt * x0 + 3 * t * x1) + 3 * tt * x2) + ttt * x3;
    const y = mt * (mt * (mt * y0 + 3 * t * y1) + 3 * tt * y2) + ttt * y3;
    minMax[0] = Math.min(minMax[0], x);
    minMax[1] = Math.min(minMax[1], y);
    minMax[2] = Math.max(minMax[2], x);
    minMax[3] = Math.max(minMax[3], y);
  }
  static #getExtremum(x0, x1, x2, x3, y0, y1, y2, y3, a, b, c, minMax) {
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) >= 1e-12) {
        this.#getExtremumOnCurve(x0, x1, x2, x3, y0, y1, y2, y3, -c / b, minMax);
      }
      return;
    }
    const delta = b ** 2 - 4 * c * a;
    if (delta < 0) {
      return;
    }
    const sqrtDelta = Math.sqrt(delta);
    const a2 = 2 * a;
    this.#getExtremumOnCurve(x0, x1, x2, x3, y0, y1, y2, y3, (-b + sqrtDelta) / a2, minMax);
    this.#getExtremumOnCurve(x0, x1, x2, x3, y0, y1, y2, y3, (-b - sqrtDelta) / a2, minMax);
  }
  static bezierBoundingBox(x0, y0, x1, y1, x2, y2, x3, y3, minMax) {
    if (minMax) {
      minMax[0] = Math.min(minMax[0], x0, x3);
      minMax[1] = Math.min(minMax[1], y0, y3);
      minMax[2] = Math.max(minMax[2], x0, x3);
      minMax[3] = Math.max(minMax[3], y0, y3);
    } else {
      minMax = [Math.min(x0, x3), Math.min(y0, y3), Math.max(x0, x3), Math.max(y0, y3)];
    }
    this.#getExtremum(x0, x1, x2, x3, y0, y1, y2, y3, 3 * (-x0 + 3 * (x1 - x2) + x3), 6 * (x0 - 2 * x1 + x2), 3 * (x1 - x0), minMax);
    this.#getExtremum(x0, x1, x2, x3, y0, y1, y2, y3, 3 * (-y0 + 3 * (y1 - y2) + y3), 6 * (y0 - 2 * y1 + y2), 3 * (y1 - y0), minMax);
    return minMax;
  }
}
const PDFStringTranslateTable = (/* unused pure expression or super */ null && ([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2d8, 0x2c7, 0x2c6, 0x2d9, 0x2dd, 0x2db, 0x2da, 0x2dc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014, 0x2013, 0x192, 0x2044, 0x2039, 0x203a, 0x2212, 0x2030, 0x201e, 0x201c, 0x201d, 0x2018, 0x2019, 0x201a, 0x2122, 0xfb01, 0xfb02, 0x141, 0x152, 0x160, 0x178, 0x17d, 0x131, 0x142, 0x153, 0x161, 0x17e, 0, 0x20ac]));
function util_stringToPDFString(str) {
  if (str[0] >= "\xEF") {
    let encoding;
    if (str[0] === "\xFE" && str[1] === "\xFF") {
      encoding = "utf-16be";
      if (str.length % 2 === 1) {
        str = str.slice(0, -1);
      }
    } else if (str[0] === "\xFF" && str[1] === "\xFE") {
      encoding = "utf-16le";
      if (str.length % 2 === 1) {
        str = str.slice(0, -1);
      }
    } else if (str[0] === "\xEF" && str[1] === "\xBB" && str[2] === "\xBF") {
      encoding = "utf-8";
    }
    if (encoding) {
      try {
        const decoder = new TextDecoder(encoding, {
          fatal: true
        });
        const buffer = stringToBytes(str);
        const decoded = decoder.decode(buffer);
        if (!decoded.includes("\x1b")) {
          return decoded;
        }
        return decoded.replaceAll(/\x1b[^\x1b]*(?:\x1b|$)/g, "");
      } catch (ex) {
        util_warn(`stringToPDFString: "${ex}".`);
      }
    }
  }
  const strBuf = [];
  for (let i = 0, ii = str.length; i < ii; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode === 0x1b) {
      while (++i < ii && str.charCodeAt(i) !== 0x1b) {}
      continue;
    }
    const code = PDFStringTranslateTable[charCode];
    strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
  }
  return strBuf.join("");
}
function stringToUTF8String(str) {
  return decodeURIComponent(escape(str));
}
function utf8StringToString(str) {
  return unescape(encodeURIComponent(str));
}
function isArrayEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0, ii = arr1.length; i < ii; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
function getModificationDate(date = new Date()) {
  const buffer = [date.getUTCFullYear().toString(), (date.getUTCMonth() + 1).toString().padStart(2, "0"), date.getUTCDate().toString().padStart(2, "0"), date.getUTCHours().toString().padStart(2, "0"), date.getUTCMinutes().toString().padStart(2, "0"), date.getUTCSeconds().toString().padStart(2, "0")];
  return buffer.join("");
}
let NormalizeRegex = null;
let NormalizationMap = null;
function normalizeUnicode(str) {
  if (!NormalizeRegex) {
    NormalizeRegex = /([\u00a0\u00b5\u037e\u0eb3\u2000-\u200a\u202f\u2126\ufb00-\ufb04\ufb06\ufb20-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufba1\ufba4-\ufba9\ufbae-\ufbb1\ufbd3-\ufbdc\ufbde-\ufbe7\ufbea-\ufbf8\ufbfc-\ufbfd\ufc00-\ufc5d\ufc64-\ufcf1\ufcf5-\ufd3d\ufd88\ufdf4\ufdfa-\ufdfb\ufe71\ufe77\ufe79\ufe7b\ufe7d]+)|(\ufb05+)/gu;
    NormalizationMap = new Map([["ﬅ", "ſt"]]);
  }
  return str.replaceAll(NormalizeRegex, (_, p1, p2) => p1 ? p1.normalize("NFKC") : NormalizationMap.get(p2));
}
function getUuid() {
  if (typeof crypto !== "undefined" && typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const buf = new Uint8Array(32);
  if (typeof crypto !== "undefined" && typeof crypto?.getRandomValues === "function") {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < 32; i++) {
      buf[i] = Math.floor(Math.random() * 255);
    }
  }
  return bytesToString(buf);
}
const AnnotationPrefix = "pdfjs_internal_id_";
const FontRenderOps = {
  BEZIER_CURVE_TO: 0,
  MOVE_TO: 1,
  LINE_TO: 2,
  QUADRATIC_CURVE_TO: 3,
  RESTORE: 4,
  SAVE: 5,
  SCALE: 6,
  TRANSFORM: 7,
  TRANSLATE: 8
};
function toHexUtil(arr) {
  if (Uint8Array.prototype.toHex) {
    return arr.toHex();
  }
  return Array.from(arr, num => util_hexNumbers[num]).join("");
}
function toBase64Util(arr) {
  if (Uint8Array.prototype.toBase64) {
    return arr.toBase64();
  }
  return btoa(bytesToString(arr));
}
function fromBase64Util(str) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(str);
  }
  return stringToBytes(atob(str));
}

;// ./src/core/primitives.js

const CIRCULAR_REF = Symbol("CIRCULAR_REF");
const EOF = Symbol("EOF");
let CmdCache = Object.create(null);
let NameCache = Object.create(null);
let RefCache = Object.create(null);
function clearPrimitiveCaches() {
  CmdCache = Object.create(null);
  NameCache = Object.create(null);
  RefCache = Object.create(null);
}
class Name {
  constructor(name) {
    this.name = name;
  }
  static get(name) {
    return NameCache[name] ||= new Name(name);
  }
}
class Cmd {
  constructor(cmd) {
    this.cmd = cmd;
  }
  static get(cmd) {
    return CmdCache[cmd] ||= new Cmd(cmd);
  }
}
const nonSerializable = function nonSerializableClosure() {
  return nonSerializable;
};
class primitives_Dict {
  constructor(xref = null) {
    this._map = Object.create(null);
    this.xref = xref;
    this.objId = null;
    this.suppressEncryption = false;
    this.__nonSerializable__ = nonSerializable;
  }
  assignXref(newXref) {
    this.xref = newXref;
  }
  get size() {
    return Object.keys(this._map).length;
  }
  get(key1, key2, key3) {
    let value = this._map[key1];
    if (value === undefined && key2 !== undefined) {
      value = this._map[key2];
      if (value === undefined && key3 !== undefined) {
        value = this._map[key3];
      }
    }
    if (value instanceof primitives_Ref && this.xref) {
      return this.xref.fetch(value, this.suppressEncryption);
    }
    return value;
  }
  async getAsync(key1, key2, key3) {
    let value = this._map[key1];
    if (value === undefined && key2 !== undefined) {
      value = this._map[key2];
      if (value === undefined && key3 !== undefined) {
        value = this._map[key3];
      }
    }
    if (value instanceof primitives_Ref && this.xref) {
      return this.xref.fetchAsync(value, this.suppressEncryption);
    }
    return value;
  }
  getArray(key1, key2, key3) {
    let value = this._map[key1];
    if (value === undefined && key2 !== undefined) {
      value = this._map[key2];
      if (value === undefined && key3 !== undefined) {
        value = this._map[key3];
      }
    }
    if (value instanceof primitives_Ref && this.xref) {
      value = this.xref.fetch(value, this.suppressEncryption);
    }
    if (Array.isArray(value)) {
      value = value.slice();
      for (let i = 0, ii = value.length; i < ii; i++) {
        if (value[i] instanceof primitives_Ref && this.xref) {
          value[i] = this.xref.fetch(value[i], this.suppressEncryption);
        }
      }
    }
    return value;
  }
  getRaw(key) {
    return this._map[key];
  }
  getKeys() {
    return Object.keys(this._map);
  }
  getRawValues() {
    return Object.values(this._map);
  }
  set(key, value) {
    this._map[key] = value;
  }
  has(key) {
    return this._map[key] !== undefined;
  }
  forEach(callback) {
    for (const key in this._map) {
      callback(key, this.get(key));
    }
  }
  static get empty() {
    const emptyDict = new primitives_Dict(null);
    emptyDict.set = (key, value) => {
      unreachable("Should not call `set` on the empty dictionary.");
    };
    return shadow(this, "empty", emptyDict);
  }
  static merge({
    xref,
    dictArray,
    mergeSubDicts = false
  }) {
    const mergedDict = new primitives_Dict(xref),
      properties = new Map();
    for (const dict of dictArray) {
      if (!(dict instanceof primitives_Dict)) {
        continue;
      }
      for (const [key, value] of Object.entries(dict._map)) {
        let property = properties.get(key);
        if (property === undefined) {
          property = [];
          properties.set(key, property);
        } else if (!mergeSubDicts || !(value instanceof primitives_Dict)) {
          continue;
        }
        property.push(value);
      }
    }
    for (const [name, values] of properties) {
      if (values.length === 1 || !(values[0] instanceof primitives_Dict)) {
        mergedDict._map[name] = values[0];
        continue;
      }
      const subDict = new primitives_Dict(xref);
      for (const dict of values) {
        for (const [key, value] of Object.entries(dict._map)) {
          if (subDict._map[key] === undefined) {
            subDict._map[key] = value;
          }
        }
      }
      if (subDict.size > 0) {
        mergedDict._map[name] = subDict;
      }
    }
    properties.clear();
    return mergedDict.size > 0 ? mergedDict : primitives_Dict.empty;
  }
  clone() {
    const dict = new primitives_Dict(this.xref);
    for (const key of this.getKeys()) {
      dict.set(key, this.getRaw(key));
    }
    return dict;
  }
  delete(key) {
    delete this._map[key];
  }
}
class primitives_Ref {
  constructor(num, gen) {
    this.num = num;
    this.gen = gen;
  }
  toString() {
    if (this.gen === 0) {
      return `${this.num}R`;
    }
    return `${this.num}R${this.gen}`;
  }
  static fromString(str) {
    const ref = RefCache[str];
    if (ref) {
      return ref;
    }
    const m = /^(\d+)R(\d*)$/.exec(str);
    if (!m || m[1] === "0") {
      return null;
    }
    return RefCache[str] = new primitives_Ref(parseInt(m[1]), !m[2] ? 0 : parseInt(m[2]));
  }
  static get(num, gen) {
    const key = gen === 0 ? `${num}R` : `${num}R${gen}`;
    return RefCache[key] ||= new primitives_Ref(num, gen);
  }
}
class primitives_RefSet {
  constructor(parent = null) {
    this._set = new Set(parent?._set);
  }
  has(ref) {
    return this._set.has(ref.toString());
  }
  put(ref) {
    this._set.add(ref.toString());
  }
  remove(ref) {
    this._set.delete(ref.toString());
  }
  [Symbol.iterator]() {
    return this._set.values();
  }
  clear() {
    this._set.clear();
  }
}
class RefSetCache {
  constructor() {
    this._map = new Map();
  }
  get size() {
    return this._map.size;
  }
  get(ref) {
    return this._map.get(ref.toString());
  }
  has(ref) {
    return this._map.has(ref.toString());
  }
  put(ref, obj) {
    this._map.set(ref.toString(), obj);
  }
  putAlias(ref, aliasRef) {
    this._map.set(ref.toString(), this.get(aliasRef));
  }
  [Symbol.iterator]() {
    return this._map.values();
  }
  clear() {
    this._map.clear();
  }
  *items() {
    for (const [ref, value] of this._map) {
      yield [primitives_Ref.fromString(ref), value];
    }
  }
}
function primitives_isName(v, name) {
  return v instanceof Name && (name === undefined || v.name === name);
}
function isCmd(v, cmd) {
  return v instanceof Cmd && (cmd === undefined || v.cmd === cmd);
}
function isDict(v, type) {
  return v instanceof primitives_Dict && (type === undefined || primitives_isName(v.get("Type"), type));
}
function isRefsEqual(v1, v2) {
  return v1.num === v2.num && v1.gen === v2.gen;
}

;// ./src/core/base_stream.js

class base_stream_BaseStream {
  get length() {
    util_unreachable("Abstract getter `length` accessed");
  }
  get isEmpty() {
    util_unreachable("Abstract getter `isEmpty` accessed");
  }
  get isDataLoaded() {
    return util_shadow(this, "isDataLoaded", true);
  }
  getByte() {
    util_unreachable("Abstract method `getByte` called");
  }
  getBytes(length) {
    util_unreachable("Abstract method `getBytes` called");
  }
  async getImageData(length, decoderOptions) {
    return this.getBytes(length, decoderOptions);
  }
  async asyncGetBytes() {
    util_unreachable("Abstract method `asyncGetBytes` called");
  }
  get isAsync() {
    return false;
  }
  get canAsyncDecodeImageFromBuffer() {
    return false;
  }
  async getTransferableImage() {
    return null;
  }
  peekByte() {
    const peekedByte = this.getByte();
    if (peekedByte !== -1) {
      this.pos--;
    }
    return peekedByte;
  }
  peekBytes(length) {
    const bytes = this.getBytes(length);
    this.pos -= bytes.length;
    return bytes;
  }
  getUint16() {
    const b0 = this.getByte();
    const b1 = this.getByte();
    if (b0 === -1 || b1 === -1) {
      return -1;
    }
    return (b0 << 8) + b1;
  }
  getInt32() {
    const b0 = this.getByte();
    const b1 = this.getByte();
    const b2 = this.getByte();
    const b3 = this.getByte();
    return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
  }
  getByteRange(begin, end) {
    util_unreachable("Abstract method `getByteRange` called");
  }
  getString(length) {
    return bytesToString(this.getBytes(length));
  }
  skip(n) {
    this.pos += n || 1;
  }
  reset() {
    util_unreachable("Abstract method `reset` called");
  }
  moveStart() {
    util_unreachable("Abstract method `moveStart` called");
  }
  makeSubStream(start, length, dict = null) {
    util_unreachable("Abstract method `makeSubStream` called");
  }
  getBaseStreams() {
    return null;
  }
}

;// ./src/core/core_utils.js



const PDF_VERSION_REGEXP = /^[1-9]\.\d$/;
function getLookupTableFactory(initializer) {
  let lookup;
  return function () {
    if (initializer) {
      lookup = Object.create(null);
      initializer(lookup);
      initializer = null;
    }
    return lookup;
  };
}
class MissingDataException extends BaseException {
  constructor(begin, end) {
    super(`Missing data [${begin}, ${end})`, "MissingDataException");
    this.begin = begin;
    this.end = end;
  }
}
class ParserEOFException extends BaseException {
  constructor(msg) {
    super(msg, "ParserEOFException");
  }
}
class XRefEntryException extends BaseException {
  constructor(msg) {
    super(msg, "XRefEntryException");
  }
}
class XRefParseException extends BaseException {
  constructor(msg) {
    super(msg, "XRefParseException");
  }
}
function arrayBuffersToBytes(arr) {
  const length = arr.length;
  if (length === 0) {
    return new Uint8Array(0);
  }
  if (length === 1) {
    return new Uint8Array(arr[0]);
  }
  let dataLength = 0;
  for (let i = 0; i < length; i++) {
    dataLength += arr[i].byteLength;
  }
  const data = new Uint8Array(dataLength);
  let pos = 0;
  for (let i = 0; i < length; i++) {
    const item = new Uint8Array(arr[i]);
    data.set(item, pos);
    pos += item.byteLength;
  }
  return data;
}
function getInheritableProperty({
  dict,
  key,
  getArray = false,
  stopWhenFound = true
}) {
  let values;
  const visited = new RefSet();
  while (dict instanceof Dict && !(dict.objId && visited.has(dict.objId))) {
    if (dict.objId) {
      visited.put(dict.objId);
    }
    const value = getArray ? dict.getArray(key) : dict.get(key);
    if (value !== undefined) {
      if (stopWhenFound) {
        return value;
      }
      (values ||= []).push(value);
    }
    dict = dict.get("Parent");
  }
  return values;
}
const ROMAN_NUMBER_MAP = (/* unused pure expression or super */ null && (["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]));
function toRomanNumerals(number, lowerCase = false) {
  assert(Number.isInteger(number) && number > 0, "The number should be a positive integer.");
  const romanBuf = [];
  let pos;
  while (number >= 1000) {
    number -= 1000;
    romanBuf.push("M");
  }
  pos = number / 100 | 0;
  number %= 100;
  romanBuf.push(ROMAN_NUMBER_MAP[pos]);
  pos = number / 10 | 0;
  number %= 10;
  romanBuf.push(ROMAN_NUMBER_MAP[10 + pos]);
  romanBuf.push(ROMAN_NUMBER_MAP[20 + number]);
  const romanStr = romanBuf.join("");
  return lowerCase ? romanStr.toLowerCase() : romanStr;
}
function log2(x) {
  if (x <= 0) {
    return 0;
  }
  return Math.ceil(Math.log2(x));
}
function readInt8(data, offset) {
  return data[offset] << 24 >> 24;
}
function readUint16(data, offset) {
  return data[offset] << 8 | data[offset + 1];
}
function readUint32(data, offset) {
  return (data[offset] << 24 | data[offset + 1] << 16 | data[offset + 2] << 8 | data[offset + 3]) >>> 0;
}
function isWhiteSpace(ch) {
  return ch === 0x20 || ch === 0x09 || ch === 0x0d || ch === 0x0a;
}
function isBooleanArray(arr, len) {
  return Array.isArray(arr) && (len === null || arr.length === len) && arr.every(x => typeof x === "boolean");
}
function isNumberArray(arr, len) {
  if (Array.isArray(arr)) {
    return (len === null || arr.length === len) && arr.every(x => typeof x === "number");
  }
  return ArrayBuffer.isView(arr) && (arr.length === 0 || typeof arr[0] === "number") && (len === null || arr.length === len);
}
function lookupMatrix(arr, fallback) {
  return isNumberArray(arr, 6) ? arr : fallback;
}
function lookupRect(arr, fallback) {
  return isNumberArray(arr, 4) ? arr : fallback;
}
function lookupNormalRect(arr, fallback) {
  return isNumberArray(arr, 4) ? Util.normalizeRect(arr) : fallback;
}
function parseXFAPath(path) {
  const positionPattern = /(.+)\[(\d+)\]$/;
  return path.split(".").map(component => {
    const m = component.match(positionPattern);
    if (m) {
      return {
        name: m[1],
        pos: parseInt(m[2], 10)
      };
    }
    return {
      name: component,
      pos: 0
    };
  });
}
function escapePDFName(str) {
  const buffer = [];
  let start = 0;
  for (let i = 0, ii = str.length; i < ii; i++) {
    const char = str.charCodeAt(i);
    if (char < 0x21 || char > 0x7e || char === 0x23 || char === 0x28 || char === 0x29 || char === 0x3c || char === 0x3e || char === 0x5b || char === 0x5d || char === 0x7b || char === 0x7d || char === 0x2f || char === 0x25) {
      if (start < i) {
        buffer.push(str.substring(start, i));
      }
      buffer.push(`#${char.toString(16)}`);
      start = i + 1;
    }
  }
  if (buffer.length === 0) {
    return str;
  }
  if (start < str.length) {
    buffer.push(str.substring(start, str.length));
  }
  return buffer.join("");
}
function escapeString(str) {
  return str.replaceAll(/([()\\\n\r])/g, match => {
    if (match === "\n") {
      return "\\n";
    } else if (match === "\r") {
      return "\\r";
    }
    return `\\${match}`;
  });
}
function _collectJS(entry, xref, list, parents) {
  if (!entry) {
    return;
  }
  let parent = null;
  if (entry instanceof Ref) {
    if (parents.has(entry)) {
      return;
    }
    parent = entry;
    parents.put(parent);
    entry = xref.fetch(entry);
  }
  if (Array.isArray(entry)) {
    for (const element of entry) {
      _collectJS(element, xref, list, parents);
    }
  } else if (entry instanceof Dict) {
    if (isName(entry.get("S"), "JavaScript")) {
      const js = entry.get("JS");
      let code;
      if (js instanceof BaseStream) {
        code = js.getString();
      } else if (typeof js === "string") {
        code = js;
      }
      code &&= stringToPDFString(code).replaceAll("\x00", "");
      if (code) {
        list.push(code);
      }
    }
    _collectJS(entry.getRaw("Next"), xref, list, parents);
  }
  if (parent) {
    parents.remove(parent);
  }
}
function collectActions(xref, dict, eventType) {
  const actions = Object.create(null);
  const additionalActionsDicts = getInheritableProperty({
    dict,
    key: "AA",
    stopWhenFound: false
  });
  if (additionalActionsDicts) {
    for (let i = additionalActionsDicts.length - 1; i >= 0; i--) {
      const additionalActions = additionalActionsDicts[i];
      if (!(additionalActions instanceof Dict)) {
        continue;
      }
      for (const key of additionalActions.getKeys()) {
        const action = eventType[key];
        if (!action) {
          continue;
        }
        const actionDict = additionalActions.getRaw(key);
        const parents = new RefSet();
        const list = [];
        _collectJS(actionDict, xref, list, parents);
        if (list.length > 0) {
          actions[action] = list;
        }
      }
    }
  }
  if (dict.has("A")) {
    const actionDict = dict.get("A");
    const parents = new RefSet();
    const list = [];
    _collectJS(actionDict, xref, list, parents);
    if (list.length > 0) {
      actions.Action = list;
    }
  }
  return objectSize(actions) > 0 ? actions : null;
}
const XMLEntities = {
  0x3c: "&lt;",
  0x3e: "&gt;",
  0x26: "&amp;",
  0x22: "&quot;",
  0x27: "&apos;"
};
function* codePointIter(str) {
  for (let i = 0, ii = str.length; i < ii; i++) {
    const char = str.codePointAt(i);
    if (char > 0xd7ff && (char < 0xe000 || char > 0xfffd)) {
      i++;
    }
    yield char;
  }
}
function encodeToXmlString(str) {
  const buffer = [];
  let start = 0;
  for (let i = 0, ii = str.length; i < ii; i++) {
    const char = str.codePointAt(i);
    if (0x20 <= char && char <= 0x7e) {
      const entity = XMLEntities[char];
      if (entity) {
        if (start < i) {
          buffer.push(str.substring(start, i));
        }
        buffer.push(entity);
        start = i + 1;
      }
    } else {
      if (start < i) {
        buffer.push(str.substring(start, i));
      }
      buffer.push(`&#x${char.toString(16).toUpperCase()};`);
      if (char > 0xd7ff && (char < 0xe000 || char > 0xfffd)) {
        i++;
      }
      start = i + 1;
    }
  }
  if (buffer.length === 0) {
    return str;
  }
  if (start < str.length) {
    buffer.push(str.substring(start, str.length));
  }
  return buffer.join("");
}
function validateFontName(fontFamily, mustWarn = false) {
  const m = /^("|').*("|')$/.exec(fontFamily);
  if (m && m[1] === m[2]) {
    const re = new RegExp(`[^\\\\]${m[1]}`);
    if (re.test(fontFamily.slice(1, -1))) {
      if (mustWarn) {
        warn(`FontFamily contains unescaped ${m[1]}: ${fontFamily}.`);
      }
      return false;
    }
  } else {
    for (const ident of fontFamily.split(/[ \t]+/)) {
      if (/^(\d|(-(\d|-)))/.test(ident) || !/^[\w-\\]+$/.test(ident)) {
        if (mustWarn) {
          warn(`FontFamily contains invalid <custom-ident>: ${fontFamily}.`);
        }
        return false;
      }
    }
  }
  return true;
}
function validateCSSFont(cssFontInfo) {
  const DEFAULT_CSS_FONT_OBLIQUE = "14";
  const DEFAULT_CSS_FONT_WEIGHT = "400";
  const CSS_FONT_WEIGHT_VALUES = new Set(["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000", "normal", "bold", "bolder", "lighter"]);
  const {
    fontFamily,
    fontWeight,
    italicAngle
  } = cssFontInfo;
  if (!validateFontName(fontFamily, true)) {
    return false;
  }
  const weight = fontWeight ? fontWeight.toString() : "";
  cssFontInfo.fontWeight = CSS_FONT_WEIGHT_VALUES.has(weight) ? weight : DEFAULT_CSS_FONT_WEIGHT;
  const angle = parseFloat(italicAngle);
  cssFontInfo.italicAngle = isNaN(angle) || angle < -90 || angle > 90 ? DEFAULT_CSS_FONT_OBLIQUE : italicAngle.toString();
  return true;
}
function recoverJsURL(str) {
  const URL_OPEN_METHODS = ["app.launchURL", "window.open", "xfa.host.gotoURL"];
  const regex = new RegExp("^\\s*(" + URL_OPEN_METHODS.join("|").replaceAll(".", "\\.") + ")\\((?:'|\")([^'\"]*)(?:'|\")(?:,\\s*(\\w+)\\)|\\))", "i");
  const jsUrl = regex.exec(str);
  if (jsUrl?.[2]) {
    const url = jsUrl[2];
    let newWindow = false;
    if (jsUrl[3] === "true" && jsUrl[1] === "app.launchURL") {
      newWindow = true;
    }
    return {
      url,
      newWindow
    };
  }
  return null;
}
function numberToString(value) {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  const roundedValue = Math.round(value * 100);
  if (roundedValue % 100 === 0) {
    return (roundedValue / 100).toString();
  }
  if (roundedValue % 10 === 0) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
}
function getNewAnnotationsMap(annotationStorage) {
  if (!annotationStorage) {
    return null;
  }
  const newAnnotationsByPage = new Map();
  for (const [key, value] of annotationStorage) {
    if (!key.startsWith(AnnotationEditorPrefix)) {
      continue;
    }
    let annotations = newAnnotationsByPage.get(value.pageIndex);
    if (!annotations) {
      annotations = [];
      newAnnotationsByPage.set(value.pageIndex, annotations);
    }
    annotations.push(value);
  }
  return newAnnotationsByPage.size > 0 ? newAnnotationsByPage : null;
}
function stringToAsciiOrUTF16BE(str) {
  return isAscii(str) ? str : stringToUTF16String(str, true);
}
function isAscii(str) {
  return /^[\x00-\x7F]*$/.test(str);
}
function stringToUTF16HexString(str) {
  const buf = [];
  for (let i = 0, ii = str.length; i < ii; i++) {
    const char = str.charCodeAt(i);
    buf.push(hexNumbers[char >> 8 & 0xff], hexNumbers[char & 0xff]);
  }
  return buf.join("");
}
function stringToUTF16String(str, bigEndian = false) {
  const buf = [];
  if (bigEndian) {
    buf.push("\xFE\xFF");
  }
  for (let i = 0, ii = str.length; i < ii; i++) {
    const char = str.charCodeAt(i);
    buf.push(String.fromCharCode(char >> 8 & 0xff), String.fromCharCode(char & 0xff));
  }
  return buf.join("");
}
function getRotationMatrix(rotation, width, height) {
  switch (rotation) {
    case 90:
      return [0, 1, -1, 0, width, 0];
    case 180:
      return [-1, 0, 0, -1, width, height];
    case 270:
      return [0, -1, 1, 0, 0, height];
    default:
      throw new Error("Invalid rotation");
  }
}
function getSizeInBytes(x) {
  return Math.ceil(Math.ceil(Math.log2(1 + x)) / 8);
}

;// ./src/core/arithmetic_decoder.js
const QeTable = [{
  qe: 0x5601,
  nmps: 1,
  nlps: 1,
  switchFlag: 1
}, {
  qe: 0x3401,
  nmps: 2,
  nlps: 6,
  switchFlag: 0
}, {
  qe: 0x1801,
  nmps: 3,
  nlps: 9,
  switchFlag: 0
}, {
  qe: 0x0ac1,
  nmps: 4,
  nlps: 12,
  switchFlag: 0
}, {
  qe: 0x0521,
  nmps: 5,
  nlps: 29,
  switchFlag: 0
}, {
  qe: 0x0221,
  nmps: 38,
  nlps: 33,
  switchFlag: 0
}, {
  qe: 0x5601,
  nmps: 7,
  nlps: 6,
  switchFlag: 1
}, {
  qe: 0x5401,
  nmps: 8,
  nlps: 14,
  switchFlag: 0
}, {
  qe: 0x4801,
  nmps: 9,
  nlps: 14,
  switchFlag: 0
}, {
  qe: 0x3801,
  nmps: 10,
  nlps: 14,
  switchFlag: 0
}, {
  qe: 0x3001,
  nmps: 11,
  nlps: 17,
  switchFlag: 0
}, {
  qe: 0x2401,
  nmps: 12,
  nlps: 18,
  switchFlag: 0
}, {
  qe: 0x1c01,
  nmps: 13,
  nlps: 20,
  switchFlag: 0
}, {
  qe: 0x1601,
  nmps: 29,
  nlps: 21,
  switchFlag: 0
}, {
  qe: 0x5601,
  nmps: 15,
  nlps: 14,
  switchFlag: 1
}, {
  qe: 0x5401,
  nmps: 16,
  nlps: 14,
  switchFlag: 0
}, {
  qe: 0x5101,
  nmps: 17,
  nlps: 15,
  switchFlag: 0
}, {
  qe: 0x4801,
  nmps: 18,
  nlps: 16,
  switchFlag: 0
}, {
  qe: 0x3801,
  nmps: 19,
  nlps: 17,
  switchFlag: 0
}, {
  qe: 0x3401,
  nmps: 20,
  nlps: 18,
  switchFlag: 0
}, {
  qe: 0x3001,
  nmps: 21,
  nlps: 19,
  switchFlag: 0
}, {
  qe: 0x2801,
  nmps: 22,
  nlps: 19,
  switchFlag: 0
}, {
  qe: 0x2401,
  nmps: 23,
  nlps: 20,
  switchFlag: 0
}, {
  qe: 0x2201,
  nmps: 24,
  nlps: 21,
  switchFlag: 0
}, {
  qe: 0x1c01,
  nmps: 25,
  nlps: 22,
  switchFlag: 0
}, {
  qe: 0x1801,
  nmps: 26,
  nlps: 23,
  switchFlag: 0
}, {
  qe: 0x1601,
  nmps: 27,
  nlps: 24,
  switchFlag: 0
}, {
  qe: 0x1401,
  nmps: 28,
  nlps: 25,
  switchFlag: 0
}, {
  qe: 0x1201,
  nmps: 29,
  nlps: 26,
  switchFlag: 0
}, {
  qe: 0x1101,
  nmps: 30,
  nlps: 27,
  switchFlag: 0
}, {
  qe: 0x0ac1,
  nmps: 31,
  nlps: 28,
  switchFlag: 0
}, {
  qe: 0x09c1,
  nmps: 32,
  nlps: 29,
  switchFlag: 0
}, {
  qe: 0x08a1,
  nmps: 33,
  nlps: 30,
  switchFlag: 0
}, {
  qe: 0x0521,
  nmps: 34,
  nlps: 31,
  switchFlag: 0
}, {
  qe: 0x0441,
  nmps: 35,
  nlps: 32,
  switchFlag: 0
}, {
  qe: 0x02a1,
  nmps: 36,
  nlps: 33,
  switchFlag: 0
}, {
  qe: 0x0221,
  nmps: 37,
  nlps: 34,
  switchFlag: 0
}, {
  qe: 0x0141,
  nmps: 38,
  nlps: 35,
  switchFlag: 0
}, {
  qe: 0x0111,
  nmps: 39,
  nlps: 36,
  switchFlag: 0
}, {
  qe: 0x0085,
  nmps: 40,
  nlps: 37,
  switchFlag: 0
}, {
  qe: 0x0049,
  nmps: 41,
  nlps: 38,
  switchFlag: 0
}, {
  qe: 0x0025,
  nmps: 42,
  nlps: 39,
  switchFlag: 0
}, {
  qe: 0x0015,
  nmps: 43,
  nlps: 40,
  switchFlag: 0
}, {
  qe: 0x0009,
  nmps: 44,
  nlps: 41,
  switchFlag: 0
}, {
  qe: 0x0005,
  nmps: 45,
  nlps: 42,
  switchFlag: 0
}, {
  qe: 0x0001,
  nmps: 45,
  nlps: 43,
  switchFlag: 0
}, {
  qe: 0x5601,
  nmps: 46,
  nlps: 46,
  switchFlag: 0
}];
class ArithmeticDecoder {
  constructor(data, start, end) {
    this.data = data;
    this.bp = start;
    this.dataEnd = end;
    this.chigh = data[start];
    this.clow = 0;
    this.byteIn();
    this.chigh = this.chigh << 7 & 0xffff | this.clow >> 9 & 0x7f;
    this.clow = this.clow << 7 & 0xffff;
    this.ct -= 7;
    this.a = 0x8000;
  }
  byteIn() {
    const data = this.data;
    let bp = this.bp;
    if (data[bp] === 0xff) {
      if (data[bp + 1] > 0x8f) {
        this.clow += 0xff00;
        this.ct = 8;
      } else {
        bp++;
        this.clow += data[bp] << 9;
        this.ct = 7;
        this.bp = bp;
      }
    } else {
      bp++;
      this.clow += bp < this.dataEnd ? data[bp] << 8 : 0xff00;
      this.ct = 8;
      this.bp = bp;
    }
    if (this.clow > 0xffff) {
      this.chigh += this.clow >> 16;
      this.clow &= 0xffff;
    }
  }
  readBit(contexts, pos) {
    let cx_index = contexts[pos] >> 1,
      cx_mps = contexts[pos] & 1;
    const qeTableIcx = QeTable[cx_index];
    const qeIcx = qeTableIcx.qe;
    let d;
    let a = this.a - qeIcx;
    if (this.chigh < qeIcx) {
      if (a < qeIcx) {
        a = qeIcx;
        d = cx_mps;
        cx_index = qeTableIcx.nmps;
      } else {
        a = qeIcx;
        d = 1 ^ cx_mps;
        if (qeTableIcx.switchFlag === 1) {
          cx_mps = d;
        }
        cx_index = qeTableIcx.nlps;
      }
    } else {
      this.chigh -= qeIcx;
      if ((a & 0x8000) !== 0) {
        this.a = a;
        return cx_mps;
      }
      if (a < qeIcx) {
        d = 1 ^ cx_mps;
        if (qeTableIcx.switchFlag === 1) {
          cx_mps = d;
        }
        cx_index = qeTableIcx.nlps;
      } else {
        d = cx_mps;
        cx_index = qeTableIcx.nmps;
      }
    }
    do {
      if (this.ct === 0) {
        this.byteIn();
      }
      a <<= 1;
      this.chigh = this.chigh << 1 & 0xffff | this.clow >> 15 & 1;
      this.clow = this.clow << 1 & 0xffff;
      this.ct--;
    } while ((a & 0x8000) === 0);
    this.a = a;
    contexts[pos] = cx_index << 1 | cx_mps;
    return d;
  }
}

;// ./src/core/ccitt.js

const ccittEOL = -2;
const ccittEOF = -1;
const twoDimPass = 0;
const twoDimHoriz = 1;
const twoDimVert0 = 2;
const twoDimVertR1 = 3;
const twoDimVertL1 = 4;
const twoDimVertR2 = 5;
const twoDimVertL2 = 6;
const twoDimVertR3 = 7;
const twoDimVertL3 = 8;
const twoDimTable = [[-1, -1], [-1, -1], [7, twoDimVertL3], [7, twoDimVertR3], [6, twoDimVertL2], [6, twoDimVertL2], [6, twoDimVertR2], [6, twoDimVertR2], [4, twoDimPass], [4, twoDimPass], [4, twoDimPass], [4, twoDimPass], [4, twoDimPass], [4, twoDimPass], [4, twoDimPass], [4, twoDimPass], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimHoriz], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertL1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [3, twoDimVertR1], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0], [1, twoDimVert0]];
const whiteTable1 = [[-1, -1], [12, ccittEOL], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [11, 1792], [11, 1792], [12, 1984], [12, 2048], [12, 2112], [12, 2176], [12, 2240], [12, 2304], [11, 1856], [11, 1856], [11, 1920], [11, 1920], [12, 2368], [12, 2432], [12, 2496], [12, 2560]];
const whiteTable2 = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [8, 29], [8, 29], [8, 30], [8, 30], [8, 45], [8, 45], [8, 46], [8, 46], [7, 22], [7, 22], [7, 22], [7, 22], [7, 23], [7, 23], [7, 23], [7, 23], [8, 47], [8, 47], [8, 48], [8, 48], [6, 13], [6, 13], [6, 13], [6, 13], [6, 13], [6, 13], [6, 13], [6, 13], [7, 20], [7, 20], [7, 20], [7, 20], [8, 33], [8, 33], [8, 34], [8, 34], [8, 35], [8, 35], [8, 36], [8, 36], [8, 37], [8, 37], [8, 38], [8, 38], [7, 19], [7, 19], [7, 19], [7, 19], [8, 31], [8, 31], [8, 32], [8, 32], [6, 1], [6, 1], [6, 1], [6, 1], [6, 1], [6, 1], [6, 1], [6, 1], [6, 12], [6, 12], [6, 12], [6, 12], [6, 12], [6, 12], [6, 12], [6, 12], [8, 53], [8, 53], [8, 54], [8, 54], [7, 26], [7, 26], [7, 26], [7, 26], [8, 39], [8, 39], [8, 40], [8, 40], [8, 41], [8, 41], [8, 42], [8, 42], [8, 43], [8, 43], [8, 44], [8, 44], [7, 21], [7, 21], [7, 21], [7, 21], [7, 28], [7, 28], [7, 28], [7, 28], [8, 61], [8, 61], [8, 62], [8, 62], [8, 63], [8, 63], [8, 0], [8, 0], [8, 320], [8, 320], [8, 384], [8, 384], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 10], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [5, 11], [7, 27], [7, 27], [7, 27], [7, 27], [8, 59], [8, 59], [8, 60], [8, 60], [9, 1472], [9, 1536], [9, 1600], [9, 1728], [7, 18], [7, 18], [7, 18], [7, 18], [7, 24], [7, 24], [7, 24], [7, 24], [8, 49], [8, 49], [8, 50], [8, 50], [8, 51], [8, 51], [8, 52], [8, 52], [7, 25], [7, 25], [7, 25], [7, 25], [8, 55], [8, 55], [8, 56], [8, 56], [8, 57], [8, 57], [8, 58], [8, 58], [6, 192], [6, 192], [6, 192], [6, 192], [6, 192], [6, 192], [6, 192], [6, 192], [6, 1664], [6, 1664], [6, 1664], [6, 1664], [6, 1664], [6, 1664], [6, 1664], [6, 1664], [8, 448], [8, 448], [8, 512], [8, 512], [9, 704], [9, 768], [8, 640], [8, 640], [8, 576], [8, 576], [9, 832], [9, 896], [9, 960], [9, 1024], [9, 1088], [9, 1152], [9, 1216], [9, 1280], [9, 1344], [9, 1408], [7, 256], [7, 256], [7, 256], [7, 256], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 128], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [5, 9], [6, 16], [6, 16], [6, 16], [6, 16], [6, 16], [6, 16], [6, 16], [6, 16], [6, 17], [6, 17], [6, 17], [6, 17], [6, 17], [6, 17], [6, 17], [6, 17], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [6, 14], [6, 14], [6, 14], [6, 14], [6, 14], [6, 14], [6, 14], [6, 14], [6, 15], [6, 15], [6, 15], [6, 15], [6, 15], [6, 15], [6, 15], [6, 15], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [5, 64], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 6], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7]];
const blackTable1 = [[-1, -1], [-1, -1], [12, ccittEOL], [12, ccittEOL], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [11, 1792], [11, 1792], [11, 1792], [11, 1792], [12, 1984], [12, 1984], [12, 2048], [12, 2048], [12, 2112], [12, 2112], [12, 2176], [12, 2176], [12, 2240], [12, 2240], [12, 2304], [12, 2304], [11, 1856], [11, 1856], [11, 1856], [11, 1856], [11, 1920], [11, 1920], [11, 1920], [11, 1920], [12, 2368], [12, 2368], [12, 2432], [12, 2432], [12, 2496], [12, 2496], [12, 2560], [12, 2560], [10, 18], [10, 18], [10, 18], [10, 18], [10, 18], [10, 18], [10, 18], [10, 18], [12, 52], [12, 52], [13, 640], [13, 704], [13, 768], [13, 832], [12, 55], [12, 55], [12, 56], [12, 56], [13, 1280], [13, 1344], [13, 1408], [13, 1472], [12, 59], [12, 59], [12, 60], [12, 60], [13, 1536], [13, 1600], [11, 24], [11, 24], [11, 24], [11, 24], [11, 25], [11, 25], [11, 25], [11, 25], [13, 1664], [13, 1728], [12, 320], [12, 320], [12, 384], [12, 384], [12, 448], [12, 448], [13, 512], [13, 576], [12, 53], [12, 53], [12, 54], [12, 54], [13, 896], [13, 960], [13, 1024], [13, 1088], [13, 1152], [13, 1216], [10, 64], [10, 64], [10, 64], [10, 64], [10, 64], [10, 64], [10, 64], [10, 64]];
const blackTable2 = [[8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [8, 13], [11, 23], [11, 23], [12, 50], [12, 51], [12, 44], [12, 45], [12, 46], [12, 47], [12, 57], [12, 58], [12, 61], [12, 256], [10, 16], [10, 16], [10, 16], [10, 16], [10, 17], [10, 17], [10, 17], [10, 17], [12, 48], [12, 49], [12, 62], [12, 63], [12, 30], [12, 31], [12, 32], [12, 33], [12, 40], [12, 41], [11, 22], [11, 22], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 10], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [7, 11], [9, 15], [9, 15], [9, 15], [9, 15], [9, 15], [9, 15], [9, 15], [9, 15], [12, 128], [12, 192], [12, 26], [12, 27], [12, 28], [12, 29], [11, 19], [11, 19], [11, 20], [11, 20], [12, 34], [12, 35], [12, 36], [12, 37], [12, 38], [12, 39], [11, 21], [11, 21], [12, 42], [12, 43], [10, 0], [10, 0], [10, 0], [10, 0], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12], [7, 12]];
const blackTable3 = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [6, 9], [6, 8], [5, 7], [5, 7], [4, 6], [4, 6], [4, 6], [4, 6], [4, 5], [4, 5], [4, 5], [4, 5], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 4], [3, 4], [3, 4], [3, 4], [3, 4], [3, 4], [3, 4], [3, 4], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 3], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2], [2, 2]];
class CCITTFaxDecoder {
  constructor(source, options = {}) {
    if (!source || typeof source.next !== "function") {
      throw new Error('CCITTFaxDecoder - invalid "source" parameter.');
    }
    this.source = source;
    this.eof = false;
    this.encoding = options.K || 0;
    this.eoline = options.EndOfLine || false;
    this.byteAlign = options.EncodedByteAlign || false;
    this.columns = options.Columns || 1728;
    this.rows = options.Rows || 0;
    this.eoblock = options.EndOfBlock ?? true;
    this.black = options.BlackIs1 || false;
    this.codingLine = new Uint32Array(this.columns + 1);
    this.refLine = new Uint32Array(this.columns + 2);
    this.codingLine[0] = this.columns;
    this.codingPos = 0;
    this.row = 0;
    this.nextLine2D = this.encoding < 0;
    this.inputBits = 0;
    this.inputBuf = 0;
    this.outputBits = 0;
    this.rowsDone = false;
    let code1;
    while ((code1 = this._lookBits(12)) === 0) {
      this._eatBits(1);
    }
    if (code1 === 1) {
      this._eatBits(12);
    }
    if (this.encoding > 0) {
      this.nextLine2D = !this._lookBits(1);
      this._eatBits(1);
    }
  }
  readNextChar() {
    if (this.eof) {
      return -1;
    }
    const refLine = this.refLine;
    const codingLine = this.codingLine;
    const columns = this.columns;
    let refPos, blackPixels, bits, i;
    if (this.outputBits === 0) {
      if (this.rowsDone) {
        this.eof = true;
      }
      if (this.eof) {
        return -1;
      }
      this.err = false;
      let code1, code2, code3;
      if (this.nextLine2D) {
        for (i = 0; codingLine[i] < columns; ++i) {
          refLine[i] = codingLine[i];
        }
        refLine[i++] = columns;
        refLine[i] = columns;
        codingLine[0] = 0;
        this.codingPos = 0;
        refPos = 0;
        blackPixels = 0;
        while (codingLine[this.codingPos] < columns) {
          code1 = this._getTwoDimCode();
          switch (code1) {
            case twoDimPass:
              this._addPixels(refLine[refPos + 1], blackPixels);
              if (refLine[refPos + 1] < columns) {
                refPos += 2;
              }
              break;
            case twoDimHoriz:
              code1 = code2 = 0;
              if (blackPixels) {
                do {
                  code1 += code3 = this._getBlackCode();
                } while (code3 >= 64);
                do {
                  code2 += code3 = this._getWhiteCode();
                } while (code3 >= 64);
              } else {
                do {
                  code1 += code3 = this._getWhiteCode();
                } while (code3 >= 64);
                do {
                  code2 += code3 = this._getBlackCode();
                } while (code3 >= 64);
              }
              this._addPixels(codingLine[this.codingPos] + code1, blackPixels);
              if (codingLine[this.codingPos] < columns) {
                this._addPixels(codingLine[this.codingPos] + code2, blackPixels ^ 1);
              }
              while (refLine[refPos] <= codingLine[this.codingPos] && refLine[refPos] < columns) {
                refPos += 2;
              }
              break;
            case twoDimVertR3:
              this._addPixels(refLine[refPos] + 3, blackPixels);
              blackPixels ^= 1;
              if (codingLine[this.codingPos] < columns) {
                ++refPos;
                while (refLine[refPos] <= codingLine[this.codingPos] && refLine[refPos] < columns) {
                  refPos += 2;
                }
              }
              break;
            case twoDimVertR2:
              this._addPixels(refLine[refPos] + 2, blackPixels);
              blackPixels ^= 1;
              if (codingLine[this.codingPos] < columns) {
                ++refPos;
                while (refLine[refPos] <= codingLine[this.codingPos] && refLine[refPos] < columns) {
                  refPos += 2;
                }
              }
              break;
            case twoDimVertR1:
              this._addPixels(refLine[refPos] + 1, blackPixels);
              blackPixels ^= 1;
              if (codingLine[this.codingPos] < columns) {
                ++refPos;
                while (refLine[refPos] <= codingLine[this.codingPos] && refLine[refPos] < columns) {
                  refPos += 2;
                }
              }
              break;
            case twoDimVert0:
              this._addPixels(refLine[refPos], blackPixels);
              blackPixels ^= 1;
              if (codingLine[this.codingPos] < columns) {
                ++refPos;
                while (refLine[refPos] <= codingLine[this.codingPos] && refLine[refPos] < columns) {
                  refPos += 2;
                }
              }
              break;
            case twoDimVertL3:
              this._addPixelsNeg(refLine[refPos] - 3, blackPixels);
              blackPixels ^= 1;
              if (codingLine[this.codingPos] < columns) {
                if (refPos > 0) {
                  --refPos;
                } else {
                  ++refPos;
                }
                while (refLine[refPos] <= codingLine[this.codingPos] && refLine[refPos] < columns) {
                  refPos += 2;
                }
              }
              break;
            case twoDimVertL2:
              this._addPixelsNeg(refLine[refPos] - 2, blackPixels);
              blackPixels ^= 1;
              if (codingLine[this.codingPos] < columns) {
                if (refPos > 0) {
                  --refPos;
                } else {
                  ++refPos;
                }
                while (refLine[refPos] <= codingLine[this.codingPos] && refLine[refPos] < columns) {
                  refPos += 2;
                }
              }
              break;
            case twoDimVertL1:
              this._addPixelsNeg(refLine[refPos] - 1, blackPixels);
              blackPixels ^= 1;
              if (codingLine[this.codingPos] < columns) {
                if (refPos > 0) {
                  --refPos;
                } else {
                  ++refPos;
                }
                while (refLine[refPos] <= codingLine[this.codingPos] && refLine[refPos] < columns) {
                  refPos += 2;
                }
              }
              break;
            case ccittEOF:
              this._addPixels(columns, 0);
              this.eof = true;
              break;
            default:
              info("bad 2d code");
              this._addPixels(columns, 0);
              this.err = true;
          }
        }
      } else {
        codingLine[0] = 0;
        this.codingPos = 0;
        blackPixels = 0;
        while (codingLine[this.codingPos] < columns) {
          code1 = 0;
          if (blackPixels) {
            do {
              code1 += code3 = this._getBlackCode();
            } while (code3 >= 64);
          } else {
            do {
              code1 += code3 = this._getWhiteCode();
            } while (code3 >= 64);
          }
          this._addPixels(codingLine[this.codingPos] + code1, blackPixels);
          blackPixels ^= 1;
        }
      }
      let gotEOL = false;
      if (this.byteAlign) {
        this.inputBits &= ~7;
      }
      if (!this.eoblock && this.row === this.rows - 1) {
        this.rowsDone = true;
      } else {
        code1 = this._lookBits(12);
        if (this.eoline) {
          while (code1 !== ccittEOF && code1 !== 1) {
            this._eatBits(1);
            code1 = this._lookBits(12);
          }
        } else {
          while (code1 === 0) {
            this._eatBits(1);
            code1 = this._lookBits(12);
          }
        }
        if (code1 === 1) {
          this._eatBits(12);
          gotEOL = true;
        } else if (code1 === ccittEOF) {
          this.eof = true;
        }
      }
      if (!this.eof && this.encoding > 0 && !this.rowsDone) {
        this.nextLine2D = !this._lookBits(1);
        this._eatBits(1);
      }
      if (this.eoblock && gotEOL && this.byteAlign) {
        code1 = this._lookBits(12);
        if (code1 === 1) {
          this._eatBits(12);
          if (this.encoding > 0) {
            this._lookBits(1);
            this._eatBits(1);
          }
          if (this.encoding >= 0) {
            for (i = 0; i < 4; ++i) {
              code1 = this._lookBits(12);
              if (code1 !== 1) {
                info("bad rtc code: " + code1);
              }
              this._eatBits(12);
              if (this.encoding > 0) {
                this._lookBits(1);
                this._eatBits(1);
              }
            }
          }
          this.eof = true;
        }
      } else if (this.err && this.eoline) {
        while (true) {
          code1 = this._lookBits(13);
          if (code1 === ccittEOF) {
            this.eof = true;
            return -1;
          }
          if (code1 >> 1 === 1) {
            break;
          }
          this._eatBits(1);
        }
        this._eatBits(12);
        if (this.encoding > 0) {
          this._eatBits(1);
          this.nextLine2D = !(code1 & 1);
        }
      }
      this.outputBits = codingLine[0] > 0 ? codingLine[this.codingPos = 0] : codingLine[this.codingPos = 1];
      this.row++;
    }
    let c;
    if (this.outputBits >= 8) {
      c = this.codingPos & 1 ? 0 : 0xff;
      this.outputBits -= 8;
      if (this.outputBits === 0 && codingLine[this.codingPos] < columns) {
        this.codingPos++;
        this.outputBits = codingLine[this.codingPos] - codingLine[this.codingPos - 1];
      }
    } else {
      bits = 8;
      c = 0;
      do {
        if (typeof this.outputBits !== "number") {
          throw new FormatError('Invalid /CCITTFaxDecode data, "outputBits" must be a number.');
        }
        if (this.outputBits > bits) {
          c <<= bits;
          if (!(this.codingPos & 1)) {
            c |= 0xff >> 8 - bits;
          }
          this.outputBits -= bits;
          bits = 0;
        } else {
          c <<= this.outputBits;
          if (!(this.codingPos & 1)) {
            c |= 0xff >> 8 - this.outputBits;
          }
          bits -= this.outputBits;
          this.outputBits = 0;
          if (codingLine[this.codingPos] < columns) {
            this.codingPos++;
            this.outputBits = codingLine[this.codingPos] - codingLine[this.codingPos - 1];
          } else if (bits > 0) {
            c <<= bits;
            bits = 0;
          }
        }
      } while (bits);
    }
    if (this.black) {
      c ^= 0xff;
    }
    return c;
  }
  _addPixels(a1, blackPixels) {
    const codingLine = this.codingLine;
    let codingPos = this.codingPos;
    if (a1 > codingLine[codingPos]) {
      if (a1 > this.columns) {
        info("row is wrong length");
        this.err = true;
        a1 = this.columns;
      }
      if (codingPos & 1 ^ blackPixels) {
        ++codingPos;
      }
      codingLine[codingPos] = a1;
    }
    this.codingPos = codingPos;
  }
  _addPixelsNeg(a1, blackPixels) {
    const codingLine = this.codingLine;
    let codingPos = this.codingPos;
    if (a1 > codingLine[codingPos]) {
      if (a1 > this.columns) {
        info("row is wrong length");
        this.err = true;
        a1 = this.columns;
      }
      if (codingPos & 1 ^ blackPixels) {
        ++codingPos;
      }
      codingLine[codingPos] = a1;
    } else if (a1 < codingLine[codingPos]) {
      if (a1 < 0) {
        info("invalid code");
        this.err = true;
        a1 = 0;
      }
      while (codingPos > 0 && a1 < codingLine[codingPos - 1]) {
        --codingPos;
      }
      codingLine[codingPos] = a1;
    }
    this.codingPos = codingPos;
  }
  _findTableCode(start, end, table, limit) {
    const limitValue = limit || 0;
    for (let i = start; i <= end; ++i) {
      let code = this._lookBits(i);
      if (code === ccittEOF) {
        return [true, 1, false];
      }
      if (i < end) {
        code <<= end - i;
      }
      if (!limitValue || code >= limitValue) {
        const p = table[code - limitValue];
        if (p[0] === i) {
          this._eatBits(i);
          return [true, p[1], true];
        }
      }
    }
    return [false, 0, false];
  }
  _getTwoDimCode() {
    let code = 0;
    let p;
    if (this.eoblock) {
      code = this._lookBits(7);
      p = twoDimTable[code];
      if (p?.[0] > 0) {
        this._eatBits(p[0]);
        return p[1];
      }
    } else {
      const result = this._findTableCode(1, 7, twoDimTable);
      if (result[0] && result[2]) {
        return result[1];
      }
    }
    info("Bad two dim code");
    return ccittEOF;
  }
  _getWhiteCode() {
    let code = 0;
    let p;
    if (this.eoblock) {
      code = this._lookBits(12);
      if (code === ccittEOF) {
        return 1;
      }
      p = code >> 5 === 0 ? whiteTable1[code] : whiteTable2[code >> 3];
      if (p[0] > 0) {
        this._eatBits(p[0]);
        return p[1];
      }
    } else {
      let result = this._findTableCode(1, 9, whiteTable2);
      if (result[0]) {
        return result[1];
      }
      result = this._findTableCode(11, 12, whiteTable1);
      if (result[0]) {
        return result[1];
      }
    }
    info("bad white code");
    this._eatBits(1);
    return 1;
  }
  _getBlackCode() {
    let code, p;
    if (this.eoblock) {
      code = this._lookBits(13);
      if (code === ccittEOF) {
        return 1;
      }
      if (code >> 7 === 0) {
        p = blackTable1[code];
      } else if (code >> 9 === 0 && code >> 7 !== 0) {
        p = blackTable2[(code >> 1) - 64];
      } else {
        p = blackTable3[code >> 7];
      }
      if (p[0] > 0) {
        this._eatBits(p[0]);
        return p[1];
      }
    } else {
      let result = this._findTableCode(2, 6, blackTable3);
      if (result[0]) {
        return result[1];
      }
      result = this._findTableCode(7, 12, blackTable2, 64);
      if (result[0]) {
        return result[1];
      }
      result = this._findTableCode(10, 13, blackTable1);
      if (result[0]) {
        return result[1];
      }
    }
    info("bad black code");
    this._eatBits(1);
    return 1;
  }
  _lookBits(n) {
    let c;
    while (this.inputBits < n) {
      if ((c = this.source.next()) === -1) {
        if (this.inputBits === 0) {
          return ccittEOF;
        }
        return this.inputBuf << n - this.inputBits & 0xffff >> 16 - n;
      }
      this.inputBuf = this.inputBuf << 8 | c;
      this.inputBits += 8;
    }
    return this.inputBuf >> this.inputBits - n & 0xffff >> 16 - n;
  }
  _eatBits(n) {
    if ((this.inputBits -= n) < 0) {
      this.inputBits = 0;
    }
  }
}

;// ./src/core/jbig2.js




class Jbig2Error extends BaseException {
  constructor(msg) {
    super(msg, "Jbig2Error");
  }
}
class ContextCache {
  getContexts(id) {
    if (id in this) {
      return this[id];
    }
    return this[id] = new Int8Array(1 << 16);
  }
}
class DecodingContext {
  constructor(data, start, end) {
    this.data = data;
    this.start = start;
    this.end = end;
  }
  get decoder() {
    const decoder = new ArithmeticDecoder(this.data, this.start, this.end);
    return util_shadow(this, "decoder", decoder);
  }
  get contextCache() {
    const cache = new ContextCache();
    return util_shadow(this, "contextCache", cache);
  }
}
const MAX_INT_32 = 2 ** 31 - 1;
const MIN_INT_32 = -(2 ** 31);
function decodeInteger(contextCache, procedure, decoder) {
  const contexts = contextCache.getContexts(procedure);
  let prev = 1;
  function readBits(length) {
    let v = 0;
    for (let i = 0; i < length; i++) {
      const bit = decoder.readBit(contexts, prev);
      prev = prev < 256 ? prev << 1 | bit : (prev << 1 | bit) & 511 | 256;
      v = v << 1 | bit;
    }
    return v >>> 0;
  }
  const sign = readBits(1);
  const value = readBits(1) ? readBits(1) ? readBits(1) ? readBits(1) ? readBits(1) ? readBits(32) + 4436 : readBits(12) + 340 : readBits(8) + 84 : readBits(6) + 20 : readBits(4) + 4 : readBits(2);
  let signedValue;
  if (sign === 0) {
    signedValue = value;
  } else if (value > 0) {
    signedValue = -value;
  }
  if (signedValue >= MIN_INT_32 && signedValue <= MAX_INT_32) {
    return signedValue;
  }
  return null;
}
function decodeIAID(contextCache, decoder, codeLength) {
  const contexts = contextCache.getContexts("IAID");
  let prev = 1;
  for (let i = 0; i < codeLength; i++) {
    const bit = decoder.readBit(contexts, prev);
    prev = prev << 1 | bit;
  }
  if (codeLength < 31) {
    return prev & (1 << codeLength) - 1;
  }
  return prev & 0x7fffffff;
}
const SegmentTypes = ["SymbolDictionary", null, null, null, "IntermediateTextRegion", null, "ImmediateTextRegion", "ImmediateLosslessTextRegion", null, null, null, null, null, null, null, null, "PatternDictionary", null, null, null, "IntermediateHalftoneRegion", null, "ImmediateHalftoneRegion", "ImmediateLosslessHalftoneRegion", null, null, null, null, null, null, null, null, null, null, null, null, "IntermediateGenericRegion", null, "ImmediateGenericRegion", "ImmediateLosslessGenericRegion", "IntermediateGenericRefinementRegion", null, "ImmediateGenericRefinementRegion", "ImmediateLosslessGenericRefinementRegion", null, null, null, null, "PageInformation", "EndOfPage", "EndOfStripe", "EndOfFile", "Profiles", "Tables", null, null, null, null, null, null, null, null, "Extension"];
const CodingTemplates = [[{
  x: -1,
  y: -2
}, {
  x: 0,
  y: -2
}, {
  x: 1,
  y: -2
}, {
  x: -2,
  y: -1
}, {
  x: -1,
  y: -1
}, {
  x: 0,
  y: -1
}, {
  x: 1,
  y: -1
}, {
  x: 2,
  y: -1
}, {
  x: -4,
  y: 0
}, {
  x: -3,
  y: 0
}, {
  x: -2,
  y: 0
}, {
  x: -1,
  y: 0
}], [{
  x: -1,
  y: -2
}, {
  x: 0,
  y: -2
}, {
  x: 1,
  y: -2
}, {
  x: 2,
  y: -2
}, {
  x: -2,
  y: -1
}, {
  x: -1,
  y: -1
}, {
  x: 0,
  y: -1
}, {
  x: 1,
  y: -1
}, {
  x: 2,
  y: -1
}, {
  x: -3,
  y: 0
}, {
  x: -2,
  y: 0
}, {
  x: -1,
  y: 0
}], [{
  x: -1,
  y: -2
}, {
  x: 0,
  y: -2
}, {
  x: 1,
  y: -2
}, {
  x: -2,
  y: -1
}, {
  x: -1,
  y: -1
}, {
  x: 0,
  y: -1
}, {
  x: 1,
  y: -1
}, {
  x: -2,
  y: 0
}, {
  x: -1,
  y: 0
}], [{
  x: -3,
  y: -1
}, {
  x: -2,
  y: -1
}, {
  x: -1,
  y: -1
}, {
  x: 0,
  y: -1
}, {
  x: 1,
  y: -1
}, {
  x: -4,
  y: 0
}, {
  x: -3,
  y: 0
}, {
  x: -2,
  y: 0
}, {
  x: -1,
  y: 0
}]];
const RefinementTemplates = [{
  coding: [{
    x: 0,
    y: -1
  }, {
    x: 1,
    y: -1
  }, {
    x: -1,
    y: 0
  }],
  reference: [{
    x: 0,
    y: -1
  }, {
    x: 1,
    y: -1
  }, {
    x: -1,
    y: 0
  }, {
    x: 0,
    y: 0
  }, {
    x: 1,
    y: 0
  }, {
    x: -1,
    y: 1
  }, {
    x: 0,
    y: 1
  }, {
    x: 1,
    y: 1
  }]
}, {
  coding: [{
    x: -1,
    y: -1
  }, {
    x: 0,
    y: -1
  }, {
    x: 1,
    y: -1
  }, {
    x: -1,
    y: 0
  }],
  reference: [{
    x: 0,
    y: -1
  }, {
    x: -1,
    y: 0
  }, {
    x: 0,
    y: 0
  }, {
    x: 1,
    y: 0
  }, {
    x: 0,
    y: 1
  }, {
    x: 1,
    y: 1
  }]
}];
const ReusedContexts = [0x9b25, 0x0795, 0x00e5, 0x0195];
const RefinementReusedContexts = [0x0020, 0x0008];
function decodeBitmapTemplate0(width, height, decodingContext) {
  const decoder = decodingContext.decoder;
  const contexts = decodingContext.contextCache.getContexts("GB");
  const bitmap = [];
  let contextLabel, i, j, pixel, row, row1, row2;
  const OLD_PIXEL_MASK = 0x7bf7;
  for (i = 0; i < height; i++) {
    row = bitmap[i] = new Uint8Array(width);
    row1 = i < 1 ? row : bitmap[i - 1];
    row2 = i < 2 ? row : bitmap[i - 2];
    contextLabel = row2[0] << 13 | row2[1] << 12 | row2[2] << 11 | row1[0] << 7 | row1[1] << 6 | row1[2] << 5 | row1[3] << 4;
    for (j = 0; j < width; j++) {
      row[j] = pixel = decoder.readBit(contexts, contextLabel);
      contextLabel = (contextLabel & OLD_PIXEL_MASK) << 1 | (j + 3 < width ? row2[j + 3] << 11 : 0) | (j + 4 < width ? row1[j + 4] << 4 : 0) | pixel;
    }
  }
  return bitmap;
}
function decodeBitmap(mmr, width, height, templateIndex, prediction, skip, at, decodingContext) {
  if (mmr) {
    const input = new Reader(decodingContext.data, decodingContext.start, decodingContext.end);
    return decodeMMRBitmap(input, width, height, false);
  }
  if (templateIndex === 0 && !skip && !prediction && at.length === 4 && at[0].x === 3 && at[0].y === -1 && at[1].x === -3 && at[1].y === -1 && at[2].x === 2 && at[2].y === -2 && at[3].x === -2 && at[3].y === -2) {
    return decodeBitmapTemplate0(width, height, decodingContext);
  }
  const useskip = !!skip;
  const template = CodingTemplates[templateIndex].concat(at);
  template.sort(function (a, b) {
    return a.y - b.y || a.x - b.x;
  });
  const templateLength = template.length;
  const templateX = new Int8Array(templateLength);
  const templateY = new Int8Array(templateLength);
  const changingTemplateEntries = [];
  let reuseMask = 0,
    minX = 0,
    maxX = 0,
    minY = 0;
  let c, k;
  for (k = 0; k < templateLength; k++) {
    templateX[k] = template[k].x;
    templateY[k] = template[k].y;
    minX = Math.min(minX, template[k].x);
    maxX = Math.max(maxX, template[k].x);
    minY = Math.min(minY, template[k].y);
    if (k < templateLength - 1 && template[k].y === template[k + 1].y && template[k].x === template[k + 1].x - 1) {
      reuseMask |= 1 << templateLength - 1 - k;
    } else {
      changingTemplateEntries.push(k);
    }
  }
  const changingEntriesLength = changingTemplateEntries.length;
  const changingTemplateX = new Int8Array(changingEntriesLength);
  const changingTemplateY = new Int8Array(changingEntriesLength);
  const changingTemplateBit = new Uint16Array(changingEntriesLength);
  for (c = 0; c < changingEntriesLength; c++) {
    k = changingTemplateEntries[c];
    changingTemplateX[c] = template[k].x;
    changingTemplateY[c] = template[k].y;
    changingTemplateBit[c] = 1 << templateLength - 1 - k;
  }
  const sbb_left = -minX;
  const sbb_top = -minY;
  const sbb_right = width - maxX;
  const pseudoPixelContext = ReusedContexts[templateIndex];
  let row = new Uint8Array(width);
  const bitmap = [];
  const decoder = decodingContext.decoder;
  const contexts = decodingContext.contextCache.getContexts("GB");
  let ltp = 0,
    j,
    i0,
    j0,
    contextLabel = 0,
    bit,
    shift;
  for (let i = 0; i < height; i++) {
    if (prediction) {
      const sltp = decoder.readBit(contexts, pseudoPixelContext);
      ltp ^= sltp;
      if (ltp) {
        bitmap.push(row);
        continue;
      }
    }
    row = new Uint8Array(row);
    bitmap.push(row);
    for (j = 0; j < width; j++) {
      if (useskip && skip[i][j]) {
        row[j] = 0;
        continue;
      }
      if (j >= sbb_left && j < sbb_right && i >= sbb_top) {
        contextLabel = contextLabel << 1 & reuseMask;
        for (k = 0; k < changingEntriesLength; k++) {
          i0 = i + changingTemplateY[k];
          j0 = j + changingTemplateX[k];
          bit = bitmap[i0][j0];
          if (bit) {
            bit = changingTemplateBit[k];
            contextLabel |= bit;
          }
        }
      } else {
        contextLabel = 0;
        shift = templateLength - 1;
        for (k = 0; k < templateLength; k++, shift--) {
          j0 = j + templateX[k];
          if (j0 >= 0 && j0 < width) {
            i0 = i + templateY[k];
            if (i0 >= 0) {
              bit = bitmap[i0][j0];
              if (bit) {
                contextLabel |= bit << shift;
              }
            }
          }
        }
      }
      const pixel = decoder.readBit(contexts, contextLabel);
      row[j] = pixel;
    }
  }
  return bitmap;
}
function decodeRefinement(width, height, templateIndex, referenceBitmap, offsetX, offsetY, prediction, at, decodingContext) {
  let codingTemplate = RefinementTemplates[templateIndex].coding;
  if (templateIndex === 0) {
    codingTemplate = codingTemplate.concat([at[0]]);
  }
  const codingTemplateLength = codingTemplate.length;
  const codingTemplateX = new Int32Array(codingTemplateLength);
  const codingTemplateY = new Int32Array(codingTemplateLength);
  let k;
  for (k = 0; k < codingTemplateLength; k++) {
    codingTemplateX[k] = codingTemplate[k].x;
    codingTemplateY[k] = codingTemplate[k].y;
  }
  let referenceTemplate = RefinementTemplates[templateIndex].reference;
  if (templateIndex === 0) {
    referenceTemplate = referenceTemplate.concat([at[1]]);
  }
  const referenceTemplateLength = referenceTemplate.length;
  const referenceTemplateX = new Int32Array(referenceTemplateLength);
  const referenceTemplateY = new Int32Array(referenceTemplateLength);
  for (k = 0; k < referenceTemplateLength; k++) {
    referenceTemplateX[k] = referenceTemplate[k].x;
    referenceTemplateY[k] = referenceTemplate[k].y;
  }
  const referenceWidth = referenceBitmap[0].length;
  const referenceHeight = referenceBitmap.length;
  const pseudoPixelContext = RefinementReusedContexts[templateIndex];
  const bitmap = [];
  const decoder = decodingContext.decoder;
  const contexts = decodingContext.contextCache.getContexts("GR");
  let ltp = 0;
  for (let i = 0; i < height; i++) {
    if (prediction) {
      const sltp = decoder.readBit(contexts, pseudoPixelContext);
      ltp ^= sltp;
      if (ltp) {
        throw new Jbig2Error("prediction is not supported");
      }
    }
    const row = new Uint8Array(width);
    bitmap.push(row);
    for (let j = 0; j < width; j++) {
      let i0, j0;
      let contextLabel = 0;
      for (k = 0; k < codingTemplateLength; k++) {
        i0 = i + codingTemplateY[k];
        j0 = j + codingTemplateX[k];
        if (i0 < 0 || j0 < 0 || j0 >= width) {
          contextLabel <<= 1;
        } else {
          contextLabel = contextLabel << 1 | bitmap[i0][j0];
        }
      }
      for (k = 0; k < referenceTemplateLength; k++) {
        i0 = i + referenceTemplateY[k] - offsetY;
        j0 = j + referenceTemplateX[k] - offsetX;
        if (i0 < 0 || i0 >= referenceHeight || j0 < 0 || j0 >= referenceWidth) {
          contextLabel <<= 1;
        } else {
          contextLabel = contextLabel << 1 | referenceBitmap[i0][j0];
        }
      }
      const pixel = decoder.readBit(contexts, contextLabel);
      row[j] = pixel;
    }
  }
  return bitmap;
}
function decodeSymbolDictionary(huffman, refinement, symbols, numberOfNewSymbols, numberOfExportedSymbols, huffmanTables, templateIndex, at, refinementTemplateIndex, refinementAt, decodingContext, huffmanInput) {
  if (huffman && refinement) {
    throw new Jbig2Error("symbol refinement with Huffman is not supported");
  }
  const newSymbols = [];
  let currentHeight = 0;
  let symbolCodeLength = log2(symbols.length + numberOfNewSymbols);
  const decoder = decodingContext.decoder;
  const contextCache = decodingContext.contextCache;
  let tableB1, symbolWidths;
  if (huffman) {
    tableB1 = getStandardTable(1);
    symbolWidths = [];
    symbolCodeLength = Math.max(symbolCodeLength, 1);
  }
  while (newSymbols.length < numberOfNewSymbols) {
    const deltaHeight = huffman ? huffmanTables.tableDeltaHeight.decode(huffmanInput) : decodeInteger(contextCache, "IADH", decoder);
    currentHeight += deltaHeight;
    let currentWidth = 0,
      totalWidth = 0;
    const firstSymbol = huffman ? symbolWidths.length : 0;
    while (true) {
      const deltaWidth = huffman ? huffmanTables.tableDeltaWidth.decode(huffmanInput) : decodeInteger(contextCache, "IADW", decoder);
      if (deltaWidth === null) {
        break;
      }
      currentWidth += deltaWidth;
      totalWidth += currentWidth;
      let bitmap;
      if (refinement) {
        const numberOfInstances = decodeInteger(contextCache, "IAAI", decoder);
        if (numberOfInstances > 1) {
          bitmap = decodeTextRegion(huffman, refinement, currentWidth, currentHeight, 0, numberOfInstances, 1, symbols.concat(newSymbols), symbolCodeLength, 0, 0, 1, 0, huffmanTables, refinementTemplateIndex, refinementAt, decodingContext, 0, huffmanInput);
        } else {
          const symbolId = decodeIAID(contextCache, decoder, symbolCodeLength);
          const rdx = decodeInteger(contextCache, "IARDX", decoder);
          const rdy = decodeInteger(contextCache, "IARDY", decoder);
          const symbol = symbolId < symbols.length ? symbols[symbolId] : newSymbols[symbolId - symbols.length];
          bitmap = decodeRefinement(currentWidth, currentHeight, refinementTemplateIndex, symbol, rdx, rdy, false, refinementAt, decodingContext);
        }
        newSymbols.push(bitmap);
      } else if (huffman) {
        symbolWidths.push(currentWidth);
      } else {
        bitmap = decodeBitmap(false, currentWidth, currentHeight, templateIndex, false, null, at, decodingContext);
        newSymbols.push(bitmap);
      }
    }
    if (huffman && !refinement) {
      const bitmapSize = huffmanTables.tableBitmapSize.decode(huffmanInput);
      huffmanInput.byteAlign();
      let collectiveBitmap;
      if (bitmapSize === 0) {
        collectiveBitmap = readUncompressedBitmap(huffmanInput, totalWidth, currentHeight);
      } else {
        const originalEnd = huffmanInput.end;
        const bitmapEnd = huffmanInput.position + bitmapSize;
        huffmanInput.end = bitmapEnd;
        collectiveBitmap = decodeMMRBitmap(huffmanInput, totalWidth, currentHeight, false);
        huffmanInput.end = originalEnd;
        huffmanInput.position = bitmapEnd;
      }
      const numberOfSymbolsDecoded = symbolWidths.length;
      if (firstSymbol === numberOfSymbolsDecoded - 1) {
        newSymbols.push(collectiveBitmap);
      } else {
        let i,
          y,
          xMin = 0,
          xMax,
          bitmapWidth,
          symbolBitmap;
        for (i = firstSymbol; i < numberOfSymbolsDecoded; i++) {
          bitmapWidth = symbolWidths[i];
          xMax = xMin + bitmapWidth;
          symbolBitmap = [];
          for (y = 0; y < currentHeight; y++) {
            symbolBitmap.push(collectiveBitmap[y].subarray(xMin, xMax));
          }
          newSymbols.push(symbolBitmap);
          xMin = xMax;
        }
      }
    }
  }
  const exportedSymbols = [],
    flags = [];
  let currentFlag = false,
    i,
    ii;
  const totalSymbolsLength = symbols.length + numberOfNewSymbols;
  while (flags.length < totalSymbolsLength) {
    let runLength = huffman ? tableB1.decode(huffmanInput) : decodeInteger(contextCache, "IAEX", decoder);
    while (runLength--) {
      flags.push(currentFlag);
    }
    currentFlag = !currentFlag;
  }
  for (i = 0, ii = symbols.length; i < ii; i++) {
    if (flags[i]) {
      exportedSymbols.push(symbols[i]);
    }
  }
  for (let j = 0; j < numberOfNewSymbols; i++, j++) {
    if (flags[i]) {
      exportedSymbols.push(newSymbols[j]);
    }
  }
  return exportedSymbols;
}
function decodeTextRegion(huffman, refinement, width, height, defaultPixelValue, numberOfSymbolInstances, stripSize, inputSymbols, symbolCodeLength, transposed, dsOffset, referenceCorner, combinationOperator, huffmanTables, refinementTemplateIndex, refinementAt, decodingContext, logStripSize, huffmanInput) {
  if (huffman && refinement) {
    throw new Jbig2Error("refinement with Huffman is not supported");
  }
  const bitmap = [];
  let i, row;
  for (i = 0; i < height; i++) {
    row = new Uint8Array(width);
    if (defaultPixelValue) {
      for (let j = 0; j < width; j++) {
        row[j] = defaultPixelValue;
      }
    }
    bitmap.push(row);
  }
  const decoder = decodingContext.decoder;
  const contextCache = decodingContext.contextCache;
  let stripT = huffman ? -huffmanTables.tableDeltaT.decode(huffmanInput) : -decodeInteger(contextCache, "IADT", decoder);
  let firstS = 0;
  i = 0;
  while (i < numberOfSymbolInstances) {
    const deltaT = huffman ? huffmanTables.tableDeltaT.decode(huffmanInput) : decodeInteger(contextCache, "IADT", decoder);
    stripT += deltaT;
    const deltaFirstS = huffman ? huffmanTables.tableFirstS.decode(huffmanInput) : decodeInteger(contextCache, "IAFS", decoder);
    firstS += deltaFirstS;
    let currentS = firstS;
    do {
      let currentT = 0;
      if (stripSize > 1) {
        currentT = huffman ? huffmanInput.readBits(logStripSize) : decodeInteger(contextCache, "IAIT", decoder);
      }
      const t = stripSize * stripT + currentT;
      const symbolId = huffman ? huffmanTables.symbolIDTable.decode(huffmanInput) : decodeIAID(contextCache, decoder, symbolCodeLength);
      const applyRefinement = refinement && (huffman ? huffmanInput.readBit() : decodeInteger(contextCache, "IARI", decoder));
      let symbolBitmap = inputSymbols[symbolId];
      let symbolWidth = symbolBitmap[0].length;
      let symbolHeight = symbolBitmap.length;
      if (applyRefinement) {
        const rdw = decodeInteger(contextCache, "IARDW", decoder);
        const rdh = decodeInteger(contextCache, "IARDH", decoder);
        const rdx = decodeInteger(contextCache, "IARDX", decoder);
        const rdy = decodeInteger(contextCache, "IARDY", decoder);
        symbolWidth += rdw;
        symbolHeight += rdh;
        symbolBitmap = decodeRefinement(symbolWidth, symbolHeight, refinementTemplateIndex, symbolBitmap, (rdw >> 1) + rdx, (rdh >> 1) + rdy, false, refinementAt, decodingContext);
      }
      let increment = 0;
      if (!transposed) {
        if (referenceCorner > 1) {
          currentS += symbolWidth - 1;
        } else {
          increment = symbolWidth - 1;
        }
      } else if (!(referenceCorner & 1)) {
        currentS += symbolHeight - 1;
      } else {
        increment = symbolHeight - 1;
      }
      const offsetT = t - (referenceCorner & 1 ? 0 : symbolHeight - 1);
      const offsetS = currentS - (referenceCorner & 2 ? symbolWidth - 1 : 0);
      let s2, t2, symbolRow;
      if (transposed) {
        for (s2 = 0; s2 < symbolHeight; s2++) {
          row = bitmap[offsetS + s2];
          if (!row) {
            continue;
          }
          symbolRow = symbolBitmap[s2];
          const maxWidth = Math.min(width - offsetT, symbolWidth);
          switch (combinationOperator) {
            case 0:
              for (t2 = 0; t2 < maxWidth; t2++) {
                row[offsetT + t2] |= symbolRow[t2];
              }
              break;
            case 2:
              for (t2 = 0; t2 < maxWidth; t2++) {
                row[offsetT + t2] ^= symbolRow[t2];
              }
              break;
            default:
              throw new Jbig2Error(`operator ${combinationOperator} is not supported`);
          }
        }
      } else {
        for (t2 = 0; t2 < symbolHeight; t2++) {
          row = bitmap[offsetT + t2];
          if (!row) {
            continue;
          }
          symbolRow = symbolBitmap[t2];
          switch (combinationOperator) {
            case 0:
              for (s2 = 0; s2 < symbolWidth; s2++) {
                row[offsetS + s2] |= symbolRow[s2];
              }
              break;
            case 2:
              for (s2 = 0; s2 < symbolWidth; s2++) {
                row[offsetS + s2] ^= symbolRow[s2];
              }
              break;
            default:
              throw new Jbig2Error(`operator ${combinationOperator} is not supported`);
          }
        }
      }
      i++;
      const deltaS = huffman ? huffmanTables.tableDeltaS.decode(huffmanInput) : decodeInteger(contextCache, "IADS", decoder);
      if (deltaS === null) {
        break;
      }
      currentS += increment + deltaS + dsOffset;
    } while (true);
  }
  return bitmap;
}
function decodePatternDictionary(mmr, patternWidth, patternHeight, maxPatternIndex, template, decodingContext) {
  const at = [];
  if (!mmr) {
    at.push({
      x: -patternWidth,
      y: 0
    });
    if (template === 0) {
      at.push({
        x: -3,
        y: -1
      }, {
        x: 2,
        y: -2
      }, {
        x: -2,
        y: -2
      });
    }
  }
  const collectiveWidth = (maxPatternIndex + 1) * patternWidth;
  const collectiveBitmap = decodeBitmap(mmr, collectiveWidth, patternHeight, template, false, null, at, decodingContext);
  const patterns = [];
  for (let i = 0; i <= maxPatternIndex; i++) {
    const patternBitmap = [];
    const xMin = patternWidth * i;
    const xMax = xMin + patternWidth;
    for (let y = 0; y < patternHeight; y++) {
      patternBitmap.push(collectiveBitmap[y].subarray(xMin, xMax));
    }
    patterns.push(patternBitmap);
  }
  return patterns;
}
function decodeHalftoneRegion(mmr, patterns, template, regionWidth, regionHeight, defaultPixelValue, enableSkip, combinationOperator, gridWidth, gridHeight, gridOffsetX, gridOffsetY, gridVectorX, gridVectorY, decodingContext) {
  const skip = null;
  if (enableSkip) {
    throw new Jbig2Error("skip is not supported");
  }
  if (combinationOperator !== 0) {
    throw new Jbig2Error(`operator "${combinationOperator}" is not supported in halftone region`);
  }
  const regionBitmap = [];
  let i, j, row;
  for (i = 0; i < regionHeight; i++) {
    row = new Uint8Array(regionWidth);
    if (defaultPixelValue) {
      for (j = 0; j < regionWidth; j++) {
        row[j] = defaultPixelValue;
      }
    }
    regionBitmap.push(row);
  }
  const numberOfPatterns = patterns.length;
  const pattern0 = patterns[0];
  const patternWidth = pattern0[0].length,
    patternHeight = pattern0.length;
  const bitsPerValue = log2(numberOfPatterns);
  const at = [];
  if (!mmr) {
    at.push({
      x: template <= 1 ? 3 : 2,
      y: -1
    });
    if (template === 0) {
      at.push({
        x: -3,
        y: -1
      }, {
        x: 2,
        y: -2
      }, {
        x: -2,
        y: -2
      });
    }
  }
  const grayScaleBitPlanes = [];
  let mmrInput, bitmap;
  if (mmr) {
    mmrInput = new Reader(decodingContext.data, decodingContext.start, decodingContext.end);
  }
  for (i = bitsPerValue - 1; i >= 0; i--) {
    if (mmr) {
      bitmap = decodeMMRBitmap(mmrInput, gridWidth, gridHeight, true);
    } else {
      bitmap = decodeBitmap(false, gridWidth, gridHeight, template, false, skip, at, decodingContext);
    }
    grayScaleBitPlanes[i] = bitmap;
  }
  let mg, ng, bit, patternIndex, patternBitmap, x, y, patternRow, regionRow;
  for (mg = 0; mg < gridHeight; mg++) {
    for (ng = 0; ng < gridWidth; ng++) {
      bit = 0;
      patternIndex = 0;
      for (j = bitsPerValue - 1; j >= 0; j--) {
        bit ^= grayScaleBitPlanes[j][mg][ng];
        patternIndex |= bit << j;
      }
      patternBitmap = patterns[patternIndex];
      x = gridOffsetX + mg * gridVectorY + ng * gridVectorX >> 8;
      y = gridOffsetY + mg * gridVectorX - ng * gridVectorY >> 8;
      if (x >= 0 && x + patternWidth <= regionWidth && y >= 0 && y + patternHeight <= regionHeight) {
        for (i = 0; i < patternHeight; i++) {
          regionRow = regionBitmap[y + i];
          patternRow = patternBitmap[i];
          for (j = 0; j < patternWidth; j++) {
            regionRow[x + j] |= patternRow[j];
          }
        }
      } else {
        let regionX, regionY;
        for (i = 0; i < patternHeight; i++) {
          regionY = y + i;
          if (regionY < 0 || regionY >= regionHeight) {
            continue;
          }
          regionRow = regionBitmap[regionY];
          patternRow = patternBitmap[i];
          for (j = 0; j < patternWidth; j++) {
            regionX = x + j;
            if (regionX >= 0 && regionX < regionWidth) {
              regionRow[regionX] |= patternRow[j];
            }
          }
        }
      }
    }
  }
  return regionBitmap;
}
function readSegmentHeader(data, start) {
  const segmentHeader = {};
  segmentHeader.number = readUint32(data, start);
  const flags = data[start + 4];
  const segmentType = flags & 0x3f;
  if (!SegmentTypes[segmentType]) {
    throw new Jbig2Error("invalid segment type: " + segmentType);
  }
  segmentHeader.type = segmentType;
  segmentHeader.typeName = SegmentTypes[segmentType];
  segmentHeader.deferredNonRetain = !!(flags & 0x80);
  const pageAssociationFieldSize = !!(flags & 0x40);
  const referredFlags = data[start + 5];
  let referredToCount = referredFlags >> 5 & 7;
  const retainBits = [referredFlags & 31];
  let position = start + 6;
  if (referredFlags === 7) {
    referredToCount = readUint32(data, position - 1) & 0x1fffffff;
    position += 3;
    let bytes = referredToCount + 7 >> 3;
    retainBits[0] = data[position++];
    while (--bytes > 0) {
      retainBits.push(data[position++]);
    }
  } else if (referredFlags === 5 || referredFlags === 6) {
    throw new Jbig2Error("invalid referred-to flags");
  }
  segmentHeader.retainBits = retainBits;
  let referredToSegmentNumberSize = 4;
  if (segmentHeader.number <= 256) {
    referredToSegmentNumberSize = 1;
  } else if (segmentHeader.number <= 65536) {
    referredToSegmentNumberSize = 2;
  }
  const referredTo = [];
  let i, ii;
  for (i = 0; i < referredToCount; i++) {
    let number;
    if (referredToSegmentNumberSize === 1) {
      number = data[position];
    } else if (referredToSegmentNumberSize === 2) {
      number = readUint16(data, position);
    } else {
      number = readUint32(data, position);
    }
    referredTo.push(number);
    position += referredToSegmentNumberSize;
  }
  segmentHeader.referredTo = referredTo;
  if (!pageAssociationFieldSize) {
    segmentHeader.pageAssociation = data[position++];
  } else {
    segmentHeader.pageAssociation = readUint32(data, position);
    position += 4;
  }
  segmentHeader.length = readUint32(data, position);
  position += 4;
  if (segmentHeader.length === 0xffffffff) {
    if (segmentType === 38) {
      const genericRegionInfo = readRegionSegmentInformation(data, position);
      const genericRegionSegmentFlags = data[position + RegionSegmentInformationFieldLength];
      const genericRegionMmr = !!(genericRegionSegmentFlags & 1);
      const searchPatternLength = 6;
      const searchPattern = new Uint8Array(searchPatternLength);
      if (!genericRegionMmr) {
        searchPattern[0] = 0xff;
        searchPattern[1] = 0xac;
      }
      searchPattern[2] = genericRegionInfo.height >>> 24 & 0xff;
      searchPattern[3] = genericRegionInfo.height >> 16 & 0xff;
      searchPattern[4] = genericRegionInfo.height >> 8 & 0xff;
      searchPattern[5] = genericRegionInfo.height & 0xff;
      for (i = position, ii = data.length; i < ii; i++) {
        let j = 0;
        while (j < searchPatternLength && searchPattern[j] === data[i + j]) {
          j++;
        }
        if (j === searchPatternLength) {
          segmentHeader.length = i + searchPatternLength;
          break;
        }
      }
      if (segmentHeader.length === 0xffffffff) {
        throw new Jbig2Error("segment end was not found");
      }
    } else {
      throw new Jbig2Error("invalid unknown segment length");
    }
  }
  segmentHeader.headerEnd = position;
  return segmentHeader;
}
function readSegments(header, data, start, end) {
  const segments = [];
  let position = start;
  while (position < end) {
    const segmentHeader = readSegmentHeader(data, position);
    position = segmentHeader.headerEnd;
    const segment = {
      header: segmentHeader,
      data
    };
    if (!header.randomAccess) {
      segment.start = position;
      position += segmentHeader.length;
      segment.end = position;
    }
    segments.push(segment);
    if (segmentHeader.type === 51) {
      break;
    }
  }
  if (header.randomAccess) {
    for (let i = 0, ii = segments.length; i < ii; i++) {
      segments[i].start = position;
      position += segments[i].header.length;
      segments[i].end = position;
    }
  }
  return segments;
}
function readRegionSegmentInformation(data, start) {
  return {
    width: readUint32(data, start),
    height: readUint32(data, start + 4),
    x: readUint32(data, start + 8),
    y: readUint32(data, start + 12),
    combinationOperator: data[start + 16] & 7
  };
}
const RegionSegmentInformationFieldLength = 17;
function processSegment(segment, visitor) {
  const header = segment.header;
  const data = segment.data,
    end = segment.end;
  let position = segment.start;
  let args, at, i, atLength;
  switch (header.type) {
    case 0:
      const dictionary = {};
      const dictionaryFlags = readUint16(data, position);
      dictionary.huffman = !!(dictionaryFlags & 1);
      dictionary.refinement = !!(dictionaryFlags & 2);
      dictionary.huffmanDHSelector = dictionaryFlags >> 2 & 3;
      dictionary.huffmanDWSelector = dictionaryFlags >> 4 & 3;
      dictionary.bitmapSizeSelector = dictionaryFlags >> 6 & 1;
      dictionary.aggregationInstancesSelector = dictionaryFlags >> 7 & 1;
      dictionary.bitmapCodingContextUsed = !!(dictionaryFlags & 256);
      dictionary.bitmapCodingContextRetained = !!(dictionaryFlags & 512);
      dictionary.template = dictionaryFlags >> 10 & 3;
      dictionary.refinementTemplate = dictionaryFlags >> 12 & 1;
      position += 2;
      if (!dictionary.huffman) {
        atLength = dictionary.template === 0 ? 4 : 1;
        at = [];
        for (i = 0; i < atLength; i++) {
          at.push({
            x: readInt8(data, position),
            y: readInt8(data, position + 1)
          });
          position += 2;
        }
        dictionary.at = at;
      }
      if (dictionary.refinement && !dictionary.refinementTemplate) {
        at = [];
        for (i = 0; i < 2; i++) {
          at.push({
            x: readInt8(data, position),
            y: readInt8(data, position + 1)
          });
          position += 2;
        }
        dictionary.refinementAt = at;
      }
      dictionary.numberOfExportedSymbols = readUint32(data, position);
      position += 4;
      dictionary.numberOfNewSymbols = readUint32(data, position);
      position += 4;
      args = [dictionary, header.number, header.referredTo, data, position, end];
      break;
    case 6:
    case 7:
      const textRegion = {};
      textRegion.info = readRegionSegmentInformation(data, position);
      position += RegionSegmentInformationFieldLength;
      const textRegionSegmentFlags = readUint16(data, position);
      position += 2;
      textRegion.huffman = !!(textRegionSegmentFlags & 1);
      textRegion.refinement = !!(textRegionSegmentFlags & 2);
      textRegion.logStripSize = textRegionSegmentFlags >> 2 & 3;
      textRegion.stripSize = 1 << textRegion.logStripSize;
      textRegion.referenceCorner = textRegionSegmentFlags >> 4 & 3;
      textRegion.transposed = !!(textRegionSegmentFlags & 64);
      textRegion.combinationOperator = textRegionSegmentFlags >> 7 & 3;
      textRegion.defaultPixelValue = textRegionSegmentFlags >> 9 & 1;
      textRegion.dsOffset = textRegionSegmentFlags << 17 >> 27;
      textRegion.refinementTemplate = textRegionSegmentFlags >> 15 & 1;
      if (textRegion.huffman) {
        const textRegionHuffmanFlags = readUint16(data, position);
        position += 2;
        textRegion.huffmanFS = textRegionHuffmanFlags & 3;
        textRegion.huffmanDS = textRegionHuffmanFlags >> 2 & 3;
        textRegion.huffmanDT = textRegionHuffmanFlags >> 4 & 3;
        textRegion.huffmanRefinementDW = textRegionHuffmanFlags >> 6 & 3;
        textRegion.huffmanRefinementDH = textRegionHuffmanFlags >> 8 & 3;
        textRegion.huffmanRefinementDX = textRegionHuffmanFlags >> 10 & 3;
        textRegion.huffmanRefinementDY = textRegionHuffmanFlags >> 12 & 3;
        textRegion.huffmanRefinementSizeSelector = !!(textRegionHuffmanFlags & 0x4000);
      }
      if (textRegion.refinement && !textRegion.refinementTemplate) {
        at = [];
        for (i = 0; i < 2; i++) {
          at.push({
            x: readInt8(data, position),
            y: readInt8(data, position + 1)
          });
          position += 2;
        }
        textRegion.refinementAt = at;
      }
      textRegion.numberOfSymbolInstances = readUint32(data, position);
      position += 4;
      args = [textRegion, header.referredTo, data, position, end];
      break;
    case 16:
      const patternDictionary = {};
      const patternDictionaryFlags = data[position++];
      patternDictionary.mmr = !!(patternDictionaryFlags & 1);
      patternDictionary.template = patternDictionaryFlags >> 1 & 3;
      patternDictionary.patternWidth = data[position++];
      patternDictionary.patternHeight = data[position++];
      patternDictionary.maxPatternIndex = readUint32(data, position);
      position += 4;
      args = [patternDictionary, header.number, data, position, end];
      break;
    case 22:
    case 23:
      const halftoneRegion = {};
      halftoneRegion.info = readRegionSegmentInformation(data, position);
      position += RegionSegmentInformationFieldLength;
      const halftoneRegionFlags = data[position++];
      halftoneRegion.mmr = !!(halftoneRegionFlags & 1);
      halftoneRegion.template = halftoneRegionFlags >> 1 & 3;
      halftoneRegion.enableSkip = !!(halftoneRegionFlags & 8);
      halftoneRegion.combinationOperator = halftoneRegionFlags >> 4 & 7;
      halftoneRegion.defaultPixelValue = halftoneRegionFlags >> 7 & 1;
      halftoneRegion.gridWidth = readUint32(data, position);
      position += 4;
      halftoneRegion.gridHeight = readUint32(data, position);
      position += 4;
      halftoneRegion.gridOffsetX = readUint32(data, position) & 0xffffffff;
      position += 4;
      halftoneRegion.gridOffsetY = readUint32(data, position) & 0xffffffff;
      position += 4;
      halftoneRegion.gridVectorX = readUint16(data, position);
      position += 2;
      halftoneRegion.gridVectorY = readUint16(data, position);
      position += 2;
      args = [halftoneRegion, header.referredTo, data, position, end];
      break;
    case 38:
    case 39:
      const genericRegion = {};
      genericRegion.info = readRegionSegmentInformation(data, position);
      position += RegionSegmentInformationFieldLength;
      const genericRegionSegmentFlags = data[position++];
      genericRegion.mmr = !!(genericRegionSegmentFlags & 1);
      genericRegion.template = genericRegionSegmentFlags >> 1 & 3;
      genericRegion.prediction = !!(genericRegionSegmentFlags & 8);
      if (!genericRegion.mmr) {
        atLength = genericRegion.template === 0 ? 4 : 1;
        at = [];
        for (i = 0; i < atLength; i++) {
          at.push({
            x: readInt8(data, position),
            y: readInt8(data, position + 1)
          });
          position += 2;
        }
        genericRegion.at = at;
      }
      args = [genericRegion, data, position, end];
      break;
    case 48:
      const pageInfo = {
        width: readUint32(data, position),
        height: readUint32(data, position + 4),
        resolutionX: readUint32(data, position + 8),
        resolutionY: readUint32(data, position + 12)
      };
      if (pageInfo.height === 0xffffffff) {
        delete pageInfo.height;
      }
      const pageSegmentFlags = data[position + 16];
      readUint16(data, position + 17);
      pageInfo.lossless = !!(pageSegmentFlags & 1);
      pageInfo.refinement = !!(pageSegmentFlags & 2);
      pageInfo.defaultPixelValue = pageSegmentFlags >> 2 & 1;
      pageInfo.combinationOperator = pageSegmentFlags >> 3 & 3;
      pageInfo.requiresBuffer = !!(pageSegmentFlags & 32);
      pageInfo.combinationOperatorOverride = !!(pageSegmentFlags & 64);
      args = [pageInfo];
      break;
    case 49:
      break;
    case 50:
      break;
    case 51:
      break;
    case 53:
      args = [header.number, data, position, end];
      break;
    case 62:
      break;
    default:
      throw new Jbig2Error(`segment type ${header.typeName}(${header.type}) is not implemented`);
  }
  const callbackName = "on" + header.typeName;
  if (callbackName in visitor) {
    visitor[callbackName].apply(visitor, args);
  }
}
function processSegments(segments, visitor) {
  for (let i = 0, ii = segments.length; i < ii; i++) {
    processSegment(segments[i], visitor);
  }
}
function parseJbig2Chunks(chunks) {
  const visitor = new SimpleSegmentVisitor();
  for (let i = 0, ii = chunks.length; i < ii; i++) {
    const chunk = chunks[i];
    const segments = readSegments({}, chunk.data, chunk.start, chunk.end);
    processSegments(segments, visitor);
  }
  return visitor.buffer;
}
function parseJbig2(data) {
  const end = data.length;
  let position = 0;
  if (data[position] !== 0x97 || data[position + 1] !== 0x4a || data[position + 2] !== 0x42 || data[position + 3] !== 0x32 || data[position + 4] !== 0x0d || data[position + 5] !== 0x0a || data[position + 6] !== 0x1a || data[position + 7] !== 0x0a) {
    throw new Jbig2Error("parseJbig2 - invalid header.");
  }
  const header = Object.create(null);
  position += 8;
  const flags = data[position++];
  header.randomAccess = !(flags & 1);
  if (!(flags & 2)) {
    header.numberOfPages = readUint32(data, position);
    position += 4;
  }
  const segments = readSegments(header, data, position, end);
  const visitor = new SimpleSegmentVisitor();
  processSegments(segments, visitor);
  const {
    width,
    height
  } = visitor.currentPageInfo;
  const bitPacked = visitor.buffer;
  const imgData = new Uint8ClampedArray(width * height);
  let q = 0,
    k = 0;
  for (let i = 0; i < height; i++) {
    let mask = 0,
      buffer;
    for (let j = 0; j < width; j++) {
      if (!mask) {
        mask = 128;
        buffer = bitPacked[k++];
      }
      imgData[q++] = buffer & mask ? 0 : 255;
      mask >>= 1;
    }
  }
  return {
    imgData,
    width,
    height
  };
}
class SimpleSegmentVisitor {
  onPageInformation(info) {
    this.currentPageInfo = info;
    const rowSize = info.width + 7 >> 3;
    const buffer = new Uint8ClampedArray(rowSize * info.height);
    if (info.defaultPixelValue) {
      buffer.fill(0xff);
    }
    this.buffer = buffer;
  }
  drawBitmap(regionInfo, bitmap) {
    const pageInfo = this.currentPageInfo;
    const width = regionInfo.width,
      height = regionInfo.height;
    const rowSize = pageInfo.width + 7 >> 3;
    const combinationOperator = pageInfo.combinationOperatorOverride ? regionInfo.combinationOperator : pageInfo.combinationOperator;
    const buffer = this.buffer;
    const mask0 = 128 >> (regionInfo.x & 7);
    let offset0 = regionInfo.y * rowSize + (regionInfo.x >> 3);
    let i, j, mask, offset;
    switch (combinationOperator) {
      case 0:
        for (i = 0; i < height; i++) {
          mask = mask0;
          offset = offset0;
          for (j = 0; j < width; j++) {
            if (bitmap[i][j]) {
              buffer[offset] |= mask;
            }
            mask >>= 1;
            if (!mask) {
              mask = 128;
              offset++;
            }
          }
          offset0 += rowSize;
        }
        break;
      case 2:
        for (i = 0; i < height; i++) {
          mask = mask0;
          offset = offset0;
          for (j = 0; j < width; j++) {
            if (bitmap[i][j]) {
              buffer[offset] ^= mask;
            }
            mask >>= 1;
            if (!mask) {
              mask = 128;
              offset++;
            }
          }
          offset0 += rowSize;
        }
        break;
      default:
        throw new Jbig2Error(`operator ${combinationOperator} is not supported`);
    }
  }
  onImmediateGenericRegion(region, data, start, end) {
    const regionInfo = region.info;
    const decodingContext = new DecodingContext(data, start, end);
    const bitmap = decodeBitmap(region.mmr, regionInfo.width, regionInfo.height, region.template, region.prediction, null, region.at, decodingContext);
    this.drawBitmap(regionInfo, bitmap);
  }
  onImmediateLosslessGenericRegion() {
    this.onImmediateGenericRegion(...arguments);
  }
  onSymbolDictionary(dictionary, currentSegment, referredSegments, data, start, end) {
    let huffmanTables, huffmanInput;
    if (dictionary.huffman) {
      huffmanTables = getSymbolDictionaryHuffmanTables(dictionary, referredSegments, this.customTables);
      huffmanInput = new Reader(data, start, end);
    }
    let symbols = this.symbols;
    if (!symbols) {
      this.symbols = symbols = {};
    }
    const inputSymbols = [];
    for (const referredSegment of referredSegments) {
      const referredSymbols = symbols[referredSegment];
      if (referredSymbols) {
        inputSymbols.push(...referredSymbols);
      }
    }
    const decodingContext = new DecodingContext(data, start, end);
    symbols[currentSegment] = decodeSymbolDictionary(dictionary.huffman, dictionary.refinement, inputSymbols, dictionary.numberOfNewSymbols, dictionary.numberOfExportedSymbols, huffmanTables, dictionary.template, dictionary.at, dictionary.refinementTemplate, dictionary.refinementAt, decodingContext, huffmanInput);
  }
  onImmediateTextRegion(region, referredSegments, data, start, end) {
    const regionInfo = region.info;
    let huffmanTables, huffmanInput;
    const symbols = this.symbols;
    const inputSymbols = [];
    for (const referredSegment of referredSegments) {
      const referredSymbols = symbols[referredSegment];
      if (referredSymbols) {
        inputSymbols.push(...referredSymbols);
      }
    }
    const symbolCodeLength = log2(inputSymbols.length);
    if (region.huffman) {
      huffmanInput = new Reader(data, start, end);
      huffmanTables = getTextRegionHuffmanTables(region, referredSegments, this.customTables, inputSymbols.length, huffmanInput);
    }
    const decodingContext = new DecodingContext(data, start, end);
    const bitmap = decodeTextRegion(region.huffman, region.refinement, regionInfo.width, regionInfo.height, region.defaultPixelValue, region.numberOfSymbolInstances, region.stripSize, inputSymbols, symbolCodeLength, region.transposed, region.dsOffset, region.referenceCorner, region.combinationOperator, huffmanTables, region.refinementTemplate, region.refinementAt, decodingContext, region.logStripSize, huffmanInput);
    this.drawBitmap(regionInfo, bitmap);
  }
  onImmediateLosslessTextRegion() {
    this.onImmediateTextRegion(...arguments);
  }
  onPatternDictionary(dictionary, currentSegment, data, start, end) {
    let patterns = this.patterns;
    if (!patterns) {
      this.patterns = patterns = {};
    }
    const decodingContext = new DecodingContext(data, start, end);
    patterns[currentSegment] = decodePatternDictionary(dictionary.mmr, dictionary.patternWidth, dictionary.patternHeight, dictionary.maxPatternIndex, dictionary.template, decodingContext);
  }
  onImmediateHalftoneRegion(region, referredSegments, data, start, end) {
    const patterns = this.patterns[referredSegments[0]];
    const regionInfo = region.info;
    const decodingContext = new DecodingContext(data, start, end);
    const bitmap = decodeHalftoneRegion(region.mmr, patterns, region.template, regionInfo.width, regionInfo.height, region.defaultPixelValue, region.enableSkip, region.combinationOperator, region.gridWidth, region.gridHeight, region.gridOffsetX, region.gridOffsetY, region.gridVectorX, region.gridVectorY, decodingContext);
    this.drawBitmap(regionInfo, bitmap);
  }
  onImmediateLosslessHalftoneRegion() {
    this.onImmediateHalftoneRegion(...arguments);
  }
  onTables(currentSegment, data, start, end) {
    let customTables = this.customTables;
    if (!customTables) {
      this.customTables = customTables = {};
    }
    customTables[currentSegment] = decodeTablesSegment(data, start, end);
  }
}
class HuffmanLine {
  constructor(lineData) {
    if (lineData.length === 2) {
      this.isOOB = true;
      this.rangeLow = 0;
      this.prefixLength = lineData[0];
      this.rangeLength = 0;
      this.prefixCode = lineData[1];
      this.isLowerRange = false;
    } else {
      this.isOOB = false;
      this.rangeLow = lineData[0];
      this.prefixLength = lineData[1];
      this.rangeLength = lineData[2];
      this.prefixCode = lineData[3];
      this.isLowerRange = lineData[4] === "lower";
    }
  }
}
class HuffmanTreeNode {
  constructor(line) {
    this.children = [];
    if (line) {
      this.isLeaf = true;
      this.rangeLength = line.rangeLength;
      this.rangeLow = line.rangeLow;
      this.isLowerRange = line.isLowerRange;
      this.isOOB = line.isOOB;
    } else {
      this.isLeaf = false;
    }
  }
  buildTree(line, shift) {
    const bit = line.prefixCode >> shift & 1;
    if (shift <= 0) {
      this.children[bit] = new HuffmanTreeNode(line);
    } else {
      let node = this.children[bit];
      if (!node) {
        this.children[bit] = node = new HuffmanTreeNode(null);
      }
      node.buildTree(line, shift - 1);
    }
  }
  decodeNode(reader) {
    if (this.isLeaf) {
      if (this.isOOB) {
        return null;
      }
      const htOffset = reader.readBits(this.rangeLength);
      return this.rangeLow + (this.isLowerRange ? -htOffset : htOffset);
    }
    const node = this.children[reader.readBit()];
    if (!node) {
      throw new Jbig2Error("invalid Huffman data");
    }
    return node.decodeNode(reader);
  }
}
class HuffmanTable {
  constructor(lines, prefixCodesDone) {
    if (!prefixCodesDone) {
      this.assignPrefixCodes(lines);
    }
    this.rootNode = new HuffmanTreeNode(null);
    for (let i = 0, ii = lines.length; i < ii; i++) {
      const line = lines[i];
      if (line.prefixLength > 0) {
        this.rootNode.buildTree(line, line.prefixLength - 1);
      }
    }
  }
  decode(reader) {
    return this.rootNode.decodeNode(reader);
  }
  assignPrefixCodes(lines) {
    const linesLength = lines.length;
    let prefixLengthMax = 0;
    for (let i = 0; i < linesLength; i++) {
      prefixLengthMax = Math.max(prefixLengthMax, lines[i].prefixLength);
    }
    const histogram = new Uint32Array(prefixLengthMax + 1);
    for (let i = 0; i < linesLength; i++) {
      histogram[lines[i].prefixLength]++;
    }
    let currentLength = 1,
      firstCode = 0,
      currentCode,
      currentTemp,
      line;
    histogram[0] = 0;
    while (currentLength <= prefixLengthMax) {
      firstCode = firstCode + histogram[currentLength - 1] << 1;
      currentCode = firstCode;
      currentTemp = 0;
      while (currentTemp < linesLength) {
        line = lines[currentTemp];
        if (line.prefixLength === currentLength) {
          line.prefixCode = currentCode;
          currentCode++;
        }
        currentTemp++;
      }
      currentLength++;
    }
  }
}
function decodeTablesSegment(data, start, end) {
  const flags = data[start];
  const lowestValue = readUint32(data, start + 1) & 0xffffffff;
  const highestValue = readUint32(data, start + 5) & 0xffffffff;
  const reader = new Reader(data, start + 9, end);
  const prefixSizeBits = (flags >> 1 & 7) + 1;
  const rangeSizeBits = (flags >> 4 & 7) + 1;
  const lines = [];
  let prefixLength,
    rangeLength,
    currentRangeLow = lowestValue;
  do {
    prefixLength = reader.readBits(prefixSizeBits);
    rangeLength = reader.readBits(rangeSizeBits);
    lines.push(new HuffmanLine([currentRangeLow, prefixLength, rangeLength, 0]));
    currentRangeLow += 1 << rangeLength;
  } while (currentRangeLow < highestValue);
  prefixLength = reader.readBits(prefixSizeBits);
  lines.push(new HuffmanLine([lowestValue - 1, prefixLength, 32, 0, "lower"]));
  prefixLength = reader.readBits(prefixSizeBits);
  lines.push(new HuffmanLine([highestValue, prefixLength, 32, 0]));
  if (flags & 1) {
    prefixLength = reader.readBits(prefixSizeBits);
    lines.push(new HuffmanLine([prefixLength, 0]));
  }
  return new HuffmanTable(lines, false);
}
const standardTablesCache = {};
function getStandardTable(number) {
  let table = standardTablesCache[number];
  if (table) {
    return table;
  }
  let lines;
  switch (number) {
    case 1:
      lines = [[0, 1, 4, 0x0], [16, 2, 8, 0x2], [272, 3, 16, 0x6], [65808, 3, 32, 0x7]];
      break;
    case 2:
      lines = [[0, 1, 0, 0x0], [1, 2, 0, 0x2], [2, 3, 0, 0x6], [3, 4, 3, 0xe], [11, 5, 6, 0x1e], [75, 6, 32, 0x3e], [6, 0x3f]];
      break;
    case 3:
      lines = [[-256, 8, 8, 0xfe], [0, 1, 0, 0x0], [1, 2, 0, 0x2], [2, 3, 0, 0x6], [3, 4, 3, 0xe], [11, 5, 6, 0x1e], [-257, 8, 32, 0xff, "lower"], [75, 7, 32, 0x7e], [6, 0x3e]];
      break;
    case 4:
      lines = [[1, 1, 0, 0x0], [2, 2, 0, 0x2], [3, 3, 0, 0x6], [4, 4, 3, 0xe], [12, 5, 6, 0x1e], [76, 5, 32, 0x1f]];
      break;
    case 5:
      lines = [[-255, 7, 8, 0x7e], [1, 1, 0, 0x0], [2, 2, 0, 0x2], [3, 3, 0, 0x6], [4, 4, 3, 0xe], [12, 5, 6, 0x1e], [-256, 7, 32, 0x7f, "lower"], [76, 6, 32, 0x3e]];
      break;
    case 6:
      lines = [[-2048, 5, 10, 0x1c], [-1024, 4, 9, 0x8], [-512, 4, 8, 0x9], [-256, 4, 7, 0xa], [-128, 5, 6, 0x1d], [-64, 5, 5, 0x1e], [-32, 4, 5, 0xb], [0, 2, 7, 0x0], [128, 3, 7, 0x2], [256, 3, 8, 0x3], [512, 4, 9, 0xc], [1024, 4, 10, 0xd], [-2049, 6, 32, 0x3e, "lower"], [2048, 6, 32, 0x3f]];
      break;
    case 7:
      lines = [[-1024, 4, 9, 0x8], [-512, 3, 8, 0x0], [-256, 4, 7, 0x9], [-128, 5, 6, 0x1a], [-64, 5, 5, 0x1b], [-32, 4, 5, 0xa], [0, 4, 5, 0xb], [32, 5, 5, 0x1c], [64, 5, 6, 0x1d], [128, 4, 7, 0xc], [256, 3, 8, 0x1], [512, 3, 9, 0x2], [1024, 3, 10, 0x3], [-1025, 5, 32, 0x1e, "lower"], [2048, 5, 32, 0x1f]];
      break;
    case 8:
      lines = [[-15, 8, 3, 0xfc], [-7, 9, 1, 0x1fc], [-5, 8, 1, 0xfd], [-3, 9, 0, 0x1fd], [-2, 7, 0, 0x7c], [-1, 4, 0, 0xa], [0, 2, 1, 0x0], [2, 5, 0, 0x1a], [3, 6, 0, 0x3a], [4, 3, 4, 0x4], [20, 6, 1, 0x3b], [22, 4, 4, 0xb], [38, 4, 5, 0xc], [70, 5, 6, 0x1b], [134, 5, 7, 0x1c], [262, 6, 7, 0x3c], [390, 7, 8, 0x7d], [646, 6, 10, 0x3d], [-16, 9, 32, 0x1fe, "lower"], [1670, 9, 32, 0x1ff], [2, 0x1]];
      break;
    case 9:
      lines = [[-31, 8, 4, 0xfc], [-15, 9, 2, 0x1fc], [-11, 8, 2, 0xfd], [-7, 9, 1, 0x1fd], [-5, 7, 1, 0x7c], [-3, 4, 1, 0xa], [-1, 3, 1, 0x2], [1, 3, 1, 0x3], [3, 5, 1, 0x1a], [5, 6, 1, 0x3a], [7, 3, 5, 0x4], [39, 6, 2, 0x3b], [43, 4, 5, 0xb], [75, 4, 6, 0xc], [139, 5, 7, 0x1b], [267, 5, 8, 0x1c], [523, 6, 8, 0x3c], [779, 7, 9, 0x7d], [1291, 6, 11, 0x3d], [-32, 9, 32, 0x1fe, "lower"], [3339, 9, 32, 0x1ff], [2, 0x0]];
      break;
    case 10:
      lines = [[-21, 7, 4, 0x7a], [-5, 8, 0, 0xfc], [-4, 7, 0, 0x7b], [-3, 5, 0, 0x18], [-2, 2, 2, 0x0], [2, 5, 0, 0x19], [3, 6, 0, 0x36], [4, 7, 0, 0x7c], [5, 8, 0, 0xfd], [6, 2, 6, 0x1], [70, 5, 5, 0x1a], [102, 6, 5, 0x37], [134, 6, 6, 0x38], [198, 6, 7, 0x39], [326, 6, 8, 0x3a], [582, 6, 9, 0x3b], [1094, 6, 10, 0x3c], [2118, 7, 11, 0x7d], [-22, 8, 32, 0xfe, "lower"], [4166, 8, 32, 0xff], [2, 0x2]];
      break;
    case 11:
      lines = [[1, 1, 0, 0x0], [2, 2, 1, 0x2], [4, 4, 0, 0xc], [5, 4, 1, 0xd], [7, 5, 1, 0x1c], [9, 5, 2, 0x1d], [13, 6, 2, 0x3c], [17, 7, 2, 0x7a], [21, 7, 3, 0x7b], [29, 7, 4, 0x7c], [45, 7, 5, 0x7d], [77, 7, 6, 0x7e], [141, 7, 32, 0x7f]];
      break;
    case 12:
      lines = [[1, 1, 0, 0x0], [2, 2, 0, 0x2], [3, 3, 1, 0x6], [5, 5, 0, 0x1c], [6, 5, 1, 0x1d], [8, 6, 1, 0x3c], [10, 7, 0, 0x7a], [11, 7, 1, 0x7b], [13, 7, 2, 0x7c], [17, 7, 3, 0x7d], [25, 7, 4, 0x7e], [41, 8, 5, 0xfe], [73, 8, 32, 0xff]];
      break;
    case 13:
      lines = [[1, 1, 0, 0x0], [2, 3, 0, 0x4], [3, 4, 0, 0xc], [4, 5, 0, 0x1c], [5, 4, 1, 0xd], [7, 3, 3, 0x5], [15, 6, 1, 0x3a], [17, 6, 2, 0x3b], [21, 6, 3, 0x3c], [29, 6, 4, 0x3d], [45, 6, 5, 0x3e], [77, 7, 6, 0x7e], [141, 7, 32, 0x7f]];
      break;
    case 14:
      lines = [[-2, 3, 0, 0x4], [-1, 3, 0, 0x5], [0, 1, 0, 0x0], [1, 3, 0, 0x6], [2, 3, 0, 0x7]];
      break;
    case 15:
      lines = [[-24, 7, 4, 0x7c], [-8, 6, 2, 0x3c], [-4, 5, 1, 0x1c], [-2, 4, 0, 0xc], [-1, 3, 0, 0x4], [0, 1, 0, 0x0], [1, 3, 0, 0x5], [2, 4, 0, 0xd], [3, 5, 1, 0x1d], [5, 6, 2, 0x3d], [9, 7, 4, 0x7d], [-25, 7, 32, 0x7e, "lower"], [25, 7, 32, 0x7f]];
      break;
    default:
      throw new Jbig2Error(`standard table B.${number} does not exist`);
  }
  for (let i = 0, ii = lines.length; i < ii; i++) {
    lines[i] = new HuffmanLine(lines[i]);
  }
  table = new HuffmanTable(lines, true);
  standardTablesCache[number] = table;
  return table;
}
class Reader {
  constructor(data, start, end) {
    this.data = data;
    this.start = start;
    this.end = end;
    this.position = start;
    this.shift = -1;
    this.currentByte = 0;
  }
  readBit() {
    if (this.shift < 0) {
      if (this.position >= this.end) {
        throw new Jbig2Error("end of data while reading bit");
      }
      this.currentByte = this.data[this.position++];
      this.shift = 7;
    }
    const bit = this.currentByte >> this.shift & 1;
    this.shift--;
    return bit;
  }
  readBits(numBits) {
    let result = 0,
      i;
    for (i = numBits - 1; i >= 0; i--) {
      result |= this.readBit() << i;
    }
    return result;
  }
  byteAlign() {
    this.shift = -1;
  }
  next() {
    if (this.position >= this.end) {
      return -1;
    }
    return this.data[this.position++];
  }
}
function getCustomHuffmanTable(index, referredTo, customTables) {
  let currentIndex = 0;
  for (let i = 0, ii = referredTo.length; i < ii; i++) {
    const table = customTables[referredTo[i]];
    if (table) {
      if (index === currentIndex) {
        return table;
      }
      currentIndex++;
    }
  }
  throw new Jbig2Error("can't find custom Huffman table");
}
function getTextRegionHuffmanTables(textRegion, referredTo, customTables, numberOfSymbols, reader) {
  const codes = [];
  for (let i = 0; i <= 34; i++) {
    const codeLength = reader.readBits(4);
    codes.push(new HuffmanLine([i, codeLength, 0, 0]));
  }
  const runCodesTable = new HuffmanTable(codes, false);
  codes.length = 0;
  for (let i = 0; i < numberOfSymbols;) {
    const codeLength = runCodesTable.decode(reader);
    if (codeLength >= 32) {
      let repeatedLength, numberOfRepeats, j;
      switch (codeLength) {
        case 32:
          if (i === 0) {
            throw new Jbig2Error("no previous value in symbol ID table");
          }
          numberOfRepeats = reader.readBits(2) + 3;
          repeatedLength = codes[i - 1].prefixLength;
          break;
        case 33:
          numberOfRepeats = reader.readBits(3) + 3;
          repeatedLength = 0;
          break;
        case 34:
          numberOfRepeats = reader.readBits(7) + 11;
          repeatedLength = 0;
          break;
        default:
          throw new Jbig2Error("invalid code length in symbol ID table");
      }
      for (j = 0; j < numberOfRepeats; j++) {
        codes.push(new HuffmanLine([i, repeatedLength, 0, 0]));
        i++;
      }
    } else {
      codes.push(new HuffmanLine([i, codeLength, 0, 0]));
      i++;
    }
  }
  reader.byteAlign();
  const symbolIDTable = new HuffmanTable(codes, false);
  let customIndex = 0,
    tableFirstS,
    tableDeltaS,
    tableDeltaT;
  switch (textRegion.huffmanFS) {
    case 0:
    case 1:
      tableFirstS = getStandardTable(textRegion.huffmanFS + 6);
      break;
    case 3:
      tableFirstS = getCustomHuffmanTable(customIndex, referredTo, customTables);
      customIndex++;
      break;
    default:
      throw new Jbig2Error("invalid Huffman FS selector");
  }
  switch (textRegion.huffmanDS) {
    case 0:
    case 1:
    case 2:
      tableDeltaS = getStandardTable(textRegion.huffmanDS + 8);
      break;
    case 3:
      tableDeltaS = getCustomHuffmanTable(customIndex, referredTo, customTables);
      customIndex++;
      break;
    default:
      throw new Jbig2Error("invalid Huffman DS selector");
  }
  switch (textRegion.huffmanDT) {
    case 0:
    case 1:
    case 2:
      tableDeltaT = getStandardTable(textRegion.huffmanDT + 11);
      break;
    case 3:
      tableDeltaT = getCustomHuffmanTable(customIndex, referredTo, customTables);
      customIndex++;
      break;
    default:
      throw new Jbig2Error("invalid Huffman DT selector");
  }
  if (textRegion.refinement) {
    throw new Jbig2Error("refinement with Huffman is not supported");
  }
  return {
    symbolIDTable,
    tableFirstS,
    tableDeltaS,
    tableDeltaT
  };
}
function getSymbolDictionaryHuffmanTables(dictionary, referredTo, customTables) {
  let customIndex = 0,
    tableDeltaHeight,
    tableDeltaWidth;
  switch (dictionary.huffmanDHSelector) {
    case 0:
    case 1:
      tableDeltaHeight = getStandardTable(dictionary.huffmanDHSelector + 4);
      break;
    case 3:
      tableDeltaHeight = getCustomHuffmanTable(customIndex, referredTo, customTables);
      customIndex++;
      break;
    default:
      throw new Jbig2Error("invalid Huffman DH selector");
  }
  switch (dictionary.huffmanDWSelector) {
    case 0:
    case 1:
      tableDeltaWidth = getStandardTable(dictionary.huffmanDWSelector + 2);
      break;
    case 3:
      tableDeltaWidth = getCustomHuffmanTable(customIndex, referredTo, customTables);
      customIndex++;
      break;
    default:
      throw new Jbig2Error("invalid Huffman DW selector");
  }
  let tableBitmapSize, tableAggregateInstances;
  if (dictionary.bitmapSizeSelector) {
    tableBitmapSize = getCustomHuffmanTable(customIndex, referredTo, customTables);
    customIndex++;
  } else {
    tableBitmapSize = getStandardTable(1);
  }
  if (dictionary.aggregationInstancesSelector) {
    tableAggregateInstances = getCustomHuffmanTable(customIndex, referredTo, customTables);
  } else {
    tableAggregateInstances = getStandardTable(1);
  }
  return {
    tableDeltaHeight,
    tableDeltaWidth,
    tableBitmapSize,
    tableAggregateInstances
  };
}
function readUncompressedBitmap(reader, width, height) {
  const bitmap = [];
  for (let y = 0; y < height; y++) {
    const row = new Uint8Array(width);
    bitmap.push(row);
    for (let x = 0; x < width; x++) {
      row[x] = reader.readBit();
    }
    reader.byteAlign();
  }
  return bitmap;
}
function decodeMMRBitmap(input, width, height, endOfBlock) {
  const params = {
    K: -1,
    Columns: width,
    Rows: height,
    BlackIs1: true,
    EndOfBlock: endOfBlock
  };
  const decoder = new CCITTFaxDecoder(input, params);
  const bitmap = [];
  let currentByte,
    eof = false;
  for (let y = 0; y < height; y++) {
    const row = new Uint8Array(width);
    bitmap.push(row);
    let shift = -1;
    for (let x = 0; x < width; x++) {
      if (shift < 0) {
        currentByte = decoder.readNextChar();
        if (currentByte === -1) {
          currentByte = 0;
          eof = true;
        }
        shift = 7;
      }
      row[x] = currentByte >> shift & 1;
      shift--;
    }
  }
  if (endOfBlock && !eof) {
    const lookForEOFLimit = 5;
    for (let i = 0; i < lookForEOFLimit; i++) {
      if (decoder.readNextChar() === -1) {
        break;
      }
    }
  }
  return bitmap;
}
class Jbig2Image {
  parseChunks(chunks) {
    return parseJbig2Chunks(chunks);
  }
  parse(data) {
    const {
      imgData,
      width,
      height
    } = parseJbig2(data);
    this.width = width;
    this.height = height;
    return imgData;
  }
}

;// ./src/shared/image_utils.js

function convertToRGBA(params) {
  switch (params.kind) {
    case ImageKind.GRAYSCALE_1BPP:
      return convertBlackAndWhiteToRGBA(params);
    case ImageKind.RGB_24BPP:
      return convertRGBToRGBA(params);
  }
  return null;
}
function convertBlackAndWhiteToRGBA({
  src,
  srcPos = 0,
  dest,
  width,
  height,
  nonBlackColor = 0xffffffff,
  inverseDecode = false
}) {
  const black = FeatureTest.isLittleEndian ? 0xff000000 : 0x000000ff;
  const [zeroMapping, oneMapping] = inverseDecode ? [nonBlackColor, black] : [black, nonBlackColor];
  const widthInSource = width >> 3;
  const widthRemainder = width & 7;
  const srcLength = src.length;
  dest = new Uint32Array(dest.buffer);
  let destPos = 0;
  for (let i = 0; i < height; i++) {
    for (const max = srcPos + widthInSource; srcPos < max; srcPos++) {
      const elem = srcPos < srcLength ? src[srcPos] : 255;
      dest[destPos++] = elem & 0b10000000 ? oneMapping : zeroMapping;
      dest[destPos++] = elem & 0b1000000 ? oneMapping : zeroMapping;
      dest[destPos++] = elem & 0b100000 ? oneMapping : zeroMapping;
      dest[destPos++] = elem & 0b10000 ? oneMapping : zeroMapping;
      dest[destPos++] = elem & 0b1000 ? oneMapping : zeroMapping;
      dest[destPos++] = elem & 0b100 ? oneMapping : zeroMapping;
      dest[destPos++] = elem & 0b10 ? oneMapping : zeroMapping;
      dest[destPos++] = elem & 0b1 ? oneMapping : zeroMapping;
    }
    if (widthRemainder === 0) {
      continue;
    }
    const elem = srcPos < srcLength ? src[srcPos++] : 255;
    for (let j = 0; j < widthRemainder; j++) {
      dest[destPos++] = elem & 1 << 7 - j ? oneMapping : zeroMapping;
    }
  }
  return {
    srcPos,
    destPos
  };
}
function convertRGBToRGBA({
  src,
  srcPos = 0,
  dest,
  destPos = 0,
  width,
  height
}) {
  let i = 0;
  const len32 = src.length >> 2;
  const src32 = new Uint32Array(src.buffer, srcPos, len32);
  if (FeatureTest.isLittleEndian) {
    for (; i < len32 - 2; i += 3, destPos += 4) {
      const s1 = src32[i];
      const s2 = src32[i + 1];
      const s3 = src32[i + 2];
      dest[destPos] = s1 | 0xff000000;
      dest[destPos + 1] = s1 >>> 24 | s2 << 8 | 0xff000000;
      dest[destPos + 2] = s2 >>> 16 | s3 << 16 | 0xff000000;
      dest[destPos + 3] = s3 >>> 8 | 0xff000000;
    }
    for (let j = i * 4, jj = src.length; j < jj; j += 3) {
      dest[destPos++] = src[j] | src[j + 1] << 8 | src[j + 2] << 16 | 0xff000000;
    }
  } else {
    for (; i < len32 - 2; i += 3, destPos += 4) {
      const s1 = src32[i];
      const s2 = src32[i + 1];
      const s3 = src32[i + 2];
      dest[destPos] = s1 | 0xff;
      dest[destPos + 1] = s1 << 24 | s2 >>> 8 | 0xff;
      dest[destPos + 2] = s2 << 16 | s3 >>> 16 | 0xff;
      dest[destPos + 3] = s3 << 8 | 0xff;
    }
    for (let j = i * 4, jj = src.length; j < jj; j += 3) {
      dest[destPos++] = src[j] << 24 | src[j + 1] << 16 | src[j + 2] << 8 | 0xff;
    }
  }
  return {
    srcPos,
    destPos
  };
}
function grayToRGBA(src, dest) {
  if (util_FeatureTest.isLittleEndian) {
    for (let i = 0, ii = src.length; i < ii; i++) {
      dest[i] = src[i] * 0x10101 | 0xff000000;
    }
  } else {
    for (let i = 0, ii = src.length; i < ii; i++) {
      dest[i] = src[i] * 0x1010100 | 0x000000ff;
    }
  }
}

;// ./src/core/jpg.js



class JpegError extends BaseException {
  constructor(msg) {
    super(msg, "JpegError");
  }
}
class DNLMarkerError extends BaseException {
  constructor(message, scanLines) {
    super(message, "DNLMarkerError");
    this.scanLines = scanLines;
  }
}
class EOIMarkerError extends BaseException {
  constructor(msg) {
    super(msg, "EOIMarkerError");
  }
}
const dctZigZag = new Uint8Array([0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63]);
const dctCos1 = 4017;
const dctSin1 = 799;
const dctCos3 = 3406;
const dctSin3 = 2276;
const dctCos6 = 1567;
const dctSin6 = 3784;
const dctSqrt2 = 5793;
const dctSqrt1d2 = 2896;
function buildHuffmanTable(codeLengths, values) {
  let k = 0,
    i,
    j,
    length = 16;
  while (length > 0 && !codeLengths[length - 1]) {
    length--;
  }
  const code = [{
    children: [],
    index: 0
  }];
  let p = code[0],
    q;
  for (i = 0; i < length; i++) {
    for (j = 0; j < codeLengths[i]; j++) {
      p = code.pop();
      p.children[p.index] = values[k];
      while (p.index > 0) {
        p = code.pop();
      }
      p.index++;
      code.push(p);
      while (code.length <= i) {
        code.push(q = {
          children: [],
          index: 0
        });
        p.children[p.index] = q.children;
        p = q;
      }
      k++;
    }
    if (i + 1 < length) {
      code.push(q = {
        children: [],
        index: 0
      });
      p.children[p.index] = q.children;
      p = q;
    }
  }
  return code[0].children;
}
function getBlockBufferOffset(component, row, col) {
  return 64 * ((component.blocksPerLine + 1) * row + col);
}
function decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, successivePrev, successive, parseDNLMarker = false) {
  const mcusPerLine = frame.mcusPerLine;
  const progressive = frame.progressive;
  const startOffset = offset;
  let bitsData = 0,
    bitsCount = 0;
  function readBit() {
    if (bitsCount > 0) {
      bitsCount--;
      return bitsData >> bitsCount & 1;
    }
    bitsData = data[offset++];
    if (bitsData === 0xff) {
      const nextByte = data[offset++];
      if (nextByte) {
        if (nextByte === 0xdc && parseDNLMarker) {
          offset += 2;
          const scanLines = readUint16(data, offset);
          offset += 2;
          if (scanLines > 0 && scanLines !== frame.scanLines) {
            throw new DNLMarkerError("Found DNL marker (0xFFDC) while parsing scan data", scanLines);
          }
        } else if (nextByte === 0xd9) {
          if (parseDNLMarker) {
            const maybeScanLines = blockRow * (frame.precision === 8 ? 8 : 0);
            if (maybeScanLines > 0 && Math.round(frame.scanLines / maybeScanLines) >= 5) {
              throw new DNLMarkerError("Found EOI marker (0xFFD9) while parsing scan data, " + "possibly caused by incorrect `scanLines` parameter", maybeScanLines);
            }
          }
          throw new EOIMarkerError("Found EOI marker (0xFFD9) while parsing scan data");
        }
        throw new JpegError(`unexpected marker ${(bitsData << 8 | nextByte).toString(16)}`);
      }
    }
    bitsCount = 7;
    return bitsData >>> 7;
  }
  function decodeHuffman(tree) {
    let node = tree;
    while (true) {
      node = node[readBit()];
      switch (typeof node) {
        case "number":
          return node;
        case "object":
          continue;
      }
      throw new JpegError("invalid huffman sequence");
    }
  }
  function receive(length) {
    let n = 0;
    while (length > 0) {
      n = n << 1 | readBit();
      length--;
    }
    return n;
  }
  function receiveAndExtend(length) {
    if (length === 1) {
      return readBit() === 1 ? 1 : -1;
    }
    const n = receive(length);
    if (n >= 1 << length - 1) {
      return n;
    }
    return n + (-1 << length) + 1;
  }
  function decodeBaseline(component, blockOffset) {
    const t = decodeHuffman(component.huffmanTableDC);
    const diff = t === 0 ? 0 : receiveAndExtend(t);
    component.blockData[blockOffset] = component.pred += diff;
    let k = 1;
    while (k < 64) {
      const rs = decodeHuffman(component.huffmanTableAC);
      const s = rs & 15,
        r = rs >> 4;
      if (s === 0) {
        if (r < 15) {
          break;
        }
        k += 16;
        continue;
      }
      k += r;
      const z = dctZigZag[k];
      component.blockData[blockOffset + z] = receiveAndExtend(s);
      k++;
    }
  }
  function decodeDCFirst(component, blockOffset) {
    const t = decodeHuffman(component.huffmanTableDC);
    const diff = t === 0 ? 0 : receiveAndExtend(t) << successive;
    component.blockData[blockOffset] = component.pred += diff;
  }
  function decodeDCSuccessive(component, blockOffset) {
    component.blockData[blockOffset] |= readBit() << successive;
  }
  let eobrun = 0;
  function decodeACFirst(component, blockOffset) {
    if (eobrun > 0) {
      eobrun--;
      return;
    }
    let k = spectralStart;
    const e = spectralEnd;
    while (k <= e) {
      const rs = decodeHuffman(component.huffmanTableAC);
      const s = rs & 15,
        r = rs >> 4;
      if (s === 0) {
        if (r < 15) {
          eobrun = receive(r) + (1 << r) - 1;
          break;
        }
        k += 16;
        continue;
      }
      k += r;
      const z = dctZigZag[k];
      component.blockData[blockOffset + z] = receiveAndExtend(s) * (1 << successive);
      k++;
    }
  }
  let successiveACState = 0,
    successiveACNextValue;
  function decodeACSuccessive(component, blockOffset) {
    let k = spectralStart;
    const e = spectralEnd;
    let r = 0;
    let s;
    let rs;
    while (k <= e) {
      const offsetZ = blockOffset + dctZigZag[k];
      const sign = component.blockData[offsetZ] < 0 ? -1 : 1;
      switch (successiveACState) {
        case 0:
          rs = decodeHuffman(component.huffmanTableAC);
          s = rs & 15;
          r = rs >> 4;
          if (s === 0) {
            if (r < 15) {
              eobrun = receive(r) + (1 << r);
              successiveACState = 4;
            } else {
              r = 16;
              successiveACState = 1;
            }
          } else {
            if (s !== 1) {
              throw new JpegError("invalid ACn encoding");
            }
            successiveACNextValue = receiveAndExtend(s);
            successiveACState = r ? 2 : 3;
          }
          continue;
        case 1:
        case 2:
          if (component.blockData[offsetZ]) {
            component.blockData[offsetZ] += sign * (readBit() << successive);
          } else {
            r--;
            if (r === 0) {
              successiveACState = successiveACState === 2 ? 3 : 0;
            }
          }
          break;
        case 3:
          if (component.blockData[offsetZ]) {
            component.blockData[offsetZ] += sign * (readBit() << successive);
          } else {
            component.blockData[offsetZ] = successiveACNextValue << successive;
            successiveACState = 0;
          }
          break;
        case 4:
          if (component.blockData[offsetZ]) {
            component.blockData[offsetZ] += sign * (readBit() << successive);
          }
          break;
      }
      k++;
    }
    if (successiveACState === 4) {
      eobrun--;
      if (eobrun === 0) {
        successiveACState = 0;
      }
    }
  }
  let blockRow = 0;
  function decodeMcu(component, decode, mcu, row, col) {
    const mcuRow = mcu / mcusPerLine | 0;
    const mcuCol = mcu % mcusPerLine;
    blockRow = mcuRow * component.v + row;
    const blockCol = mcuCol * component.h + col;
    const blockOffset = getBlockBufferOffset(component, blockRow, blockCol);
    decode(component, blockOffset);
  }
  function decodeBlock(component, decode, mcu) {
    blockRow = mcu / component.blocksPerLine | 0;
    const blockCol = mcu % component.blocksPerLine;
    const blockOffset = getBlockBufferOffset(component, blockRow, blockCol);
    decode(component, blockOffset);
  }
  const componentsLength = components.length;
  let component, i, j, k, n;
  let decodeFn;
  if (progressive) {
    if (spectralStart === 0) {
      decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
    } else {
      decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
    }
  } else {
    decodeFn = decodeBaseline;
  }
  let mcu = 0,
    fileMarker;
  const mcuExpected = componentsLength === 1 ? components[0].blocksPerLine * components[0].blocksPerColumn : mcusPerLine * frame.mcusPerColumn;
  let h, v;
  while (mcu <= mcuExpected) {
    const mcuToRead = resetInterval ? Math.min(mcuExpected - mcu, resetInterval) : mcuExpected;
    if (mcuToRead > 0) {
      for (i = 0; i < componentsLength; i++) {
        components[i].pred = 0;
      }
      eobrun = 0;
      if (componentsLength === 1) {
        component = components[0];
        for (n = 0; n < mcuToRead; n++) {
          decodeBlock(component, decodeFn, mcu);
          mcu++;
        }
      } else {
        for (n = 0; n < mcuToRead; n++) {
          for (i = 0; i < componentsLength; i++) {
            component = components[i];
            h = component.h;
            v = component.v;
            for (j = 0; j < v; j++) {
              for (k = 0; k < h; k++) {
                decodeMcu(component, decodeFn, mcu, j, k);
              }
            }
          }
          mcu++;
        }
      }
    }
    bitsCount = 0;
    fileMarker = findNextFileMarker(data, offset);
    if (!fileMarker) {
      break;
    }
    if (fileMarker.invalid) {
      const partialMsg = mcuToRead > 0 ? "unexpected" : "excessive";
      util_warn(`decodeScan - ${partialMsg} MCU data, current marker is: ${fileMarker.invalid}`);
      offset = fileMarker.offset;
    }
    if (fileMarker.marker >= 0xffd0 && fileMarker.marker <= 0xffd7) {
      offset += 2;
    } else {
      break;
    }
  }
  return offset - startOffset;
}
function quantizeAndInverse(component, blockBufferOffset, p) {
  const qt = component.quantizationTable,
    blockData = component.blockData;
  let v0, v1, v2, v3, v4, v5, v6, v7;
  let p0, p1, p2, p3, p4, p5, p6, p7;
  let t;
  if (!qt) {
    throw new JpegError("missing required Quantization Table.");
  }
  for (let row = 0; row < 64; row += 8) {
    p0 = blockData[blockBufferOffset + row];
    p1 = blockData[blockBufferOffset + row + 1];
    p2 = blockData[blockBufferOffset + row + 2];
    p3 = blockData[blockBufferOffset + row + 3];
    p4 = blockData[blockBufferOffset + row + 4];
    p5 = blockData[blockBufferOffset + row + 5];
    p6 = blockData[blockBufferOffset + row + 6];
    p7 = blockData[blockBufferOffset + row + 7];
    p0 *= qt[row];
    if ((p1 | p2 | p3 | p4 | p5 | p6 | p7) === 0) {
      t = dctSqrt2 * p0 + 512 >> 10;
      p[row] = t;
      p[row + 1] = t;
      p[row + 2] = t;
      p[row + 3] = t;
      p[row + 4] = t;
      p[row + 5] = t;
      p[row + 6] = t;
      p[row + 7] = t;
      continue;
    }
    p1 *= qt[row + 1];
    p2 *= qt[row + 2];
    p3 *= qt[row + 3];
    p4 *= qt[row + 4];
    p5 *= qt[row + 5];
    p6 *= qt[row + 6];
    p7 *= qt[row + 7];
    v0 = dctSqrt2 * p0 + 128 >> 8;
    v1 = dctSqrt2 * p4 + 128 >> 8;
    v2 = p2;
    v3 = p6;
    v4 = dctSqrt1d2 * (p1 - p7) + 128 >> 8;
    v7 = dctSqrt1d2 * (p1 + p7) + 128 >> 8;
    v5 = p3 << 4;
    v6 = p5 << 4;
    v0 = v0 + v1 + 1 >> 1;
    v1 = v0 - v1;
    t = v2 * dctSin6 + v3 * dctCos6 + 128 >> 8;
    v2 = v2 * dctCos6 - v3 * dctSin6 + 128 >> 8;
    v3 = t;
    v4 = v4 + v6 + 1 >> 1;
    v6 = v4 - v6;
    v7 = v7 + v5 + 1 >> 1;
    v5 = v7 - v5;
    v0 = v0 + v3 + 1 >> 1;
    v3 = v0 - v3;
    v1 = v1 + v2 + 1 >> 1;
    v2 = v1 - v2;
    t = v4 * dctSin3 + v7 * dctCos3 + 2048 >> 12;
    v4 = v4 * dctCos3 - v7 * dctSin3 + 2048 >> 12;
    v7 = t;
    t = v5 * dctSin1 + v6 * dctCos1 + 2048 >> 12;
    v5 = v5 * dctCos1 - v6 * dctSin1 + 2048 >> 12;
    v6 = t;
    p[row] = v0 + v7;
    p[row + 7] = v0 - v7;
    p[row + 1] = v1 + v6;
    p[row + 6] = v1 - v6;
    p[row + 2] = v2 + v5;
    p[row + 5] = v2 - v5;
    p[row + 3] = v3 + v4;
    p[row + 4] = v3 - v4;
  }
  for (let col = 0; col < 8; ++col) {
    p0 = p[col];
    p1 = p[col + 8];
    p2 = p[col + 16];
    p3 = p[col + 24];
    p4 = p[col + 32];
    p5 = p[col + 40];
    p6 = p[col + 48];
    p7 = p[col + 56];
    if ((p1 | p2 | p3 | p4 | p5 | p6 | p7) === 0) {
      t = dctSqrt2 * p0 + 8192 >> 14;
      if (t < -2040) {
        t = 0;
      } else if (t >= 2024) {
        t = 255;
      } else {
        t = t + 2056 >> 4;
      }
      blockData[blockBufferOffset + col] = t;
      blockData[blockBufferOffset + col + 8] = t;
      blockData[blockBufferOffset + col + 16] = t;
      blockData[blockBufferOffset + col + 24] = t;
      blockData[blockBufferOffset + col + 32] = t;
      blockData[blockBufferOffset + col + 40] = t;
      blockData[blockBufferOffset + col + 48] = t;
      blockData[blockBufferOffset + col + 56] = t;
      continue;
    }
    v0 = dctSqrt2 * p0 + 2048 >> 12;
    v1 = dctSqrt2 * p4 + 2048 >> 12;
    v2 = p2;
    v3 = p6;
    v4 = dctSqrt1d2 * (p1 - p7) + 2048 >> 12;
    v7 = dctSqrt1d2 * (p1 + p7) + 2048 >> 12;
    v5 = p3;
    v6 = p5;
    v0 = (v0 + v1 + 1 >> 1) + 4112;
    v1 = v0 - v1;
    t = v2 * dctSin6 + v3 * dctCos6 + 2048 >> 12;
    v2 = v2 * dctCos6 - v3 * dctSin6 + 2048 >> 12;
    v3 = t;
    v4 = v4 + v6 + 1 >> 1;
    v6 = v4 - v6;
    v7 = v7 + v5 + 1 >> 1;
    v5 = v7 - v5;
    v0 = v0 + v3 + 1 >> 1;
    v3 = v0 - v3;
    v1 = v1 + v2 + 1 >> 1;
    v2 = v1 - v2;
    t = v4 * dctSin3 + v7 * dctCos3 + 2048 >> 12;
    v4 = v4 * dctCos3 - v7 * dctSin3 + 2048 >> 12;
    v7 = t;
    t = v5 * dctSin1 + v6 * dctCos1 + 2048 >> 12;
    v5 = v5 * dctCos1 - v6 * dctSin1 + 2048 >> 12;
    v6 = t;
    p0 = v0 + v7;
    p7 = v0 - v7;
    p1 = v1 + v6;
    p6 = v1 - v6;
    p2 = v2 + v5;
    p5 = v2 - v5;
    p3 = v3 + v4;
    p4 = v3 - v4;
    if (p0 < 16) {
      p0 = 0;
    } else if (p0 >= 4080) {
      p0 = 255;
    } else {
      p0 >>= 4;
    }
    if (p1 < 16) {
      p1 = 0;
    } else if (p1 >= 4080) {
      p1 = 255;
    } else {
      p1 >>= 4;
    }
    if (p2 < 16) {
      p2 = 0;
    } else if (p2 >= 4080) {
      p2 = 255;
    } else {
      p2 >>= 4;
    }
    if (p3 < 16) {
      p3 = 0;
    } else if (p3 >= 4080) {
      p3 = 255;
    } else {
      p3 >>= 4;
    }
    if (p4 < 16) {
      p4 = 0;
    } else if (p4 >= 4080) {
      p4 = 255;
    } else {
      p4 >>= 4;
    }
    if (p5 < 16) {
      p5 = 0;
    } else if (p5 >= 4080) {
      p5 = 255;
    } else {
      p5 >>= 4;
    }
    if (p6 < 16) {
      p6 = 0;
    } else if (p6 >= 4080) {
      p6 = 255;
    } else {
      p6 >>= 4;
    }
    if (p7 < 16) {
      p7 = 0;
    } else if (p7 >= 4080) {
      p7 = 255;
    } else {
      p7 >>= 4;
    }
    blockData[blockBufferOffset + col] = p0;
    blockData[blockBufferOffset + col + 8] = p1;
    blockData[blockBufferOffset + col + 16] = p2;
    blockData[blockBufferOffset + col + 24] = p3;
    blockData[blockBufferOffset + col + 32] = p4;
    blockData[blockBufferOffset + col + 40] = p5;
    blockData[blockBufferOffset + col + 48] = p6;
    blockData[blockBufferOffset + col + 56] = p7;
  }
}
function buildComponentData(frame, component) {
  const blocksPerLine = component.blocksPerLine;
  const blocksPerColumn = component.blocksPerColumn;
  const computationBuffer = new Int16Array(64);
  for (let blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
    for (let blockCol = 0; blockCol < blocksPerLine; blockCol++) {
      const offset = getBlockBufferOffset(component, blockRow, blockCol);
      quantizeAndInverse(component, offset, computationBuffer);
    }
  }
  return component.blockData;
}
function findNextFileMarker(data, currentPos, startPos = currentPos) {
  const maxPos = data.length - 1;
  let newPos = startPos < currentPos ? startPos : currentPos;
  if (currentPos >= maxPos) {
    return null;
  }
  const currentMarker = readUint16(data, currentPos);
  if (currentMarker >= 0xffc0 && currentMarker <= 0xfffe) {
    return {
      invalid: null,
      marker: currentMarker,
      offset: currentPos
    };
  }
  let newMarker = readUint16(data, newPos);
  while (!(newMarker >= 0xffc0 && newMarker <= 0xfffe)) {
    if (++newPos >= maxPos) {
      return null;
    }
    newMarker = readUint16(data, newPos);
  }
  return {
    invalid: currentMarker.toString(16),
    marker: newMarker,
    offset: newPos
  };
}
function prepareComponents(frame) {
  const mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / frame.maxH);
  const mcusPerColumn = Math.ceil(frame.scanLines / 8 / frame.maxV);
  for (const component of frame.components) {
    const blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * component.h / frame.maxH);
    const blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines / 8) * component.v / frame.maxV);
    const blocksPerLineForMcu = mcusPerLine * component.h;
    const blocksPerColumnForMcu = mcusPerColumn * component.v;
    const blocksBufferSize = 64 * blocksPerColumnForMcu * (blocksPerLineForMcu + 1);
    component.blockData = new Int16Array(blocksBufferSize);
    component.blocksPerLine = blocksPerLine;
    component.blocksPerColumn = blocksPerColumn;
  }
  frame.mcusPerLine = mcusPerLine;
  frame.mcusPerColumn = mcusPerColumn;
}
function readDataBlock(data, offset) {
  const length = readUint16(data, offset);
  offset += 2;
  let endOffset = offset + length - 2;
  const fileMarker = findNextFileMarker(data, endOffset, offset);
  if (fileMarker?.invalid) {
    util_warn("readDataBlock - incorrect length, current marker is: " + fileMarker.invalid);
    endOffset = fileMarker.offset;
  }
  const array = data.subarray(offset, endOffset);
  offset += array.length;
  return {
    appData: array,
    newOffset: offset
  };
}
function skipData(data, offset) {
  const length = readUint16(data, offset);
  offset += 2;
  const endOffset = offset + length - 2;
  const fileMarker = findNextFileMarker(data, endOffset, offset);
  if (fileMarker?.invalid) {
    return fileMarker.offset;
  }
  return endOffset;
}
class JpegImage {
  constructor({
    decodeTransform = null,
    colorTransform = -1
  } = {}) {
    this._decodeTransform = decodeTransform;
    this._colorTransform = colorTransform;
  }
  static canUseImageDecoder(data, colorTransform = -1) {
    let offset = 0;
    let numComponents = null;
    let fileMarker = readUint16(data, offset);
    offset += 2;
    if (fileMarker !== 0xffd8) {
      throw new JpegError("SOI not found");
    }
    fileMarker = readUint16(data, offset);
    offset += 2;
    markerLoop: while (fileMarker !== 0xffd9) {
      switch (fileMarker) {
        case 0xffc0:
        case 0xffc1:
        case 0xffc2:
          numComponents = data[offset + (2 + 1 + 2 + 2)];
          break markerLoop;
        case 0xffff:
          if (data[offset] !== 0xff) {
            offset--;
          }
          break;
      }
      offset = skipData(data, offset);
      fileMarker = readUint16(data, offset);
      offset += 2;
    }
    if (numComponents === 4) {
      return false;
    }
    if (numComponents === 3 && colorTransform === 0) {
      return false;
    }
    return true;
  }
  parse(data, {
    dnlScanLines = null
  } = {}) {
    let offset = 0;
    let jfif = null;
    let adobe = null;
    let frame, resetInterval;
    let numSOSMarkers = 0;
    const quantizationTables = [];
    const huffmanTablesAC = [],
      huffmanTablesDC = [];
    let fileMarker = readUint16(data, offset);
    offset += 2;
    if (fileMarker !== 0xffd8) {
      throw new JpegError("SOI not found");
    }
    fileMarker = readUint16(data, offset);
    offset += 2;
    markerLoop: while (fileMarker !== 0xffd9) {
      let i, j, l;
      switch (fileMarker) {
        case 0xffe0:
        case 0xffe1:
        case 0xffe2:
        case 0xffe3:
        case 0xffe4:
        case 0xffe5:
        case 0xffe6:
        case 0xffe7:
        case 0xffe8:
        case 0xffe9:
        case 0xffea:
        case 0xffeb:
        case 0xffec:
        case 0xffed:
        case 0xffee:
        case 0xffef:
        case 0xfffe:
          const {
            appData,
            newOffset
          } = readDataBlock(data, offset);
          offset = newOffset;
          if (fileMarker === 0xffe0) {
            if (appData[0] === 0x4a && appData[1] === 0x46 && appData[2] === 0x49 && appData[3] === 0x46 && appData[4] === 0) {
              jfif = {
                version: {
                  major: appData[5],
                  minor: appData[6]
                },
                densityUnits: appData[7],
                xDensity: appData[8] << 8 | appData[9],
                yDensity: appData[10] << 8 | appData[11],
                thumbWidth: appData[12],
                thumbHeight: appData[13],
                thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
              };
            }
          }
          if (fileMarker === 0xffee) {
            if (appData[0] === 0x41 && appData[1] === 0x64 && appData[2] === 0x6f && appData[3] === 0x62 && appData[4] === 0x65) {
              adobe = {
                version: appData[5] << 8 | appData[6],
                flags0: appData[7] << 8 | appData[8],
                flags1: appData[9] << 8 | appData[10],
                transformCode: appData[11]
              };
            }
          }
          break;
        case 0xffdb:
          const quantizationTablesLength = readUint16(data, offset);
          offset += 2;
          const quantizationTablesEnd = quantizationTablesLength + offset - 2;
          let z;
          while (offset < quantizationTablesEnd) {
            const quantizationTableSpec = data[offset++];
            const tableData = new Uint16Array(64);
            if (quantizationTableSpec >> 4 === 0) {
              for (j = 0; j < 64; j++) {
                z = dctZigZag[j];
                tableData[z] = data[offset++];
              }
            } else if (quantizationTableSpec >> 4 === 1) {
              for (j = 0; j < 64; j++) {
                z = dctZigZag[j];
                tableData[z] = readUint16(data, offset);
                offset += 2;
              }
            } else {
              throw new JpegError("DQT - invalid table spec");
            }
            quantizationTables[quantizationTableSpec & 15] = tableData;
          }
          break;
        case 0xffc0:
        case 0xffc1:
        case 0xffc2:
          if (frame) {
            throw new JpegError("Only single frame JPEGs supported");
          }
          offset += 2;
          frame = {};
          frame.extended = fileMarker === 0xffc1;
          frame.progressive = fileMarker === 0xffc2;
          frame.precision = data[offset++];
          const sofScanLines = readUint16(data, offset);
          offset += 2;
          frame.scanLines = dnlScanLines || sofScanLines;
          frame.samplesPerLine = readUint16(data, offset);
          offset += 2;
          frame.components = [];
          frame.componentIds = {};
          const componentsCount = data[offset++];
          let maxH = 0,
            maxV = 0;
          for (i = 0; i < componentsCount; i++) {
            const componentId = data[offset];
            const h = data[offset + 1] >> 4;
            const v = data[offset + 1] & 15;
            if (maxH < h) {
              maxH = h;
            }
            if (maxV < v) {
              maxV = v;
            }
            const qId = data[offset + 2];
            l = frame.components.push({
              h,
              v,
              quantizationId: qId,
              quantizationTable: null
            });
            frame.componentIds[componentId] = l - 1;
            offset += 3;
          }
          frame.maxH = maxH;
          frame.maxV = maxV;
          prepareComponents(frame);
          break;
        case 0xffc4:
          const huffmanLength = readUint16(data, offset);
          offset += 2;
          for (i = 2; i < huffmanLength;) {
            const huffmanTableSpec = data[offset++];
            const codeLengths = new Uint8Array(16);
            let codeLengthSum = 0;
            for (j = 0; j < 16; j++, offset++) {
              codeLengthSum += codeLengths[j] = data[offset];
            }
            const huffmanValues = new Uint8Array(codeLengthSum);
            for (j = 0; j < codeLengthSum; j++, offset++) {
              huffmanValues[j] = data[offset];
            }
            i += 17 + codeLengthSum;
            (huffmanTableSpec >> 4 === 0 ? huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] = buildHuffmanTable(codeLengths, huffmanValues);
          }
          break;
        case 0xffdd:
          offset += 2;
          resetInterval = readUint16(data, offset);
          offset += 2;
          break;
        case 0xffda:
          const parseDNLMarker = ++numSOSMarkers === 1 && !dnlScanLines;
          offset += 2;
          const selectorsCount = data[offset++],
            components = [];
          for (i = 0; i < selectorsCount; i++) {
            const index = data[offset++];
            const componentIndex = frame.componentIds[index];
            const component = frame.components[componentIndex];
            component.index = index;
            const tableSpec = data[offset++];
            component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
            component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
            components.push(component);
          }
          const spectralStart = data[offset++],
            spectralEnd = data[offset++],
            successiveApproximation = data[offset++];
          try {
            const processed = decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, successiveApproximation >> 4, successiveApproximation & 15, parseDNLMarker);
            offset += processed;
          } catch (ex) {
            if (ex instanceof DNLMarkerError) {
              util_warn(`${ex.message} -- attempting to re-parse the JPEG image.`);
              return this.parse(data, {
                dnlScanLines: ex.scanLines
              });
            } else if (ex instanceof EOIMarkerError) {
              util_warn(`${ex.message} -- ignoring the rest of the image data.`);
              break markerLoop;
            }
            throw ex;
          }
          break;
        case 0xffdc:
          offset += 4;
          break;
        case 0xffff:
          if (data[offset] !== 0xff) {
            offset--;
          }
          break;
        default:
          const nextFileMarker = findNextFileMarker(data, offset - 2, offset - 3);
          if (nextFileMarker?.invalid) {
            util_warn("JpegImage.parse - unexpected data, current marker is: " + nextFileMarker.invalid);
            offset = nextFileMarker.offset;
            break;
          }
          if (!nextFileMarker || offset >= data.length - 1) {
            util_warn("JpegImage.parse - reached the end of the image data " + "without finding an EOI marker (0xFFD9).");
            break markerLoop;
          }
          throw new JpegError("JpegImage.parse - unknown marker: " + fileMarker.toString(16));
      }
      fileMarker = readUint16(data, offset);
      offset += 2;
    }
    if (!frame) {
      throw new JpegError("JpegImage.parse - no frame data found.");
    }
    this.width = frame.samplesPerLine;
    this.height = frame.scanLines;
    this.jfif = jfif;
    this.adobe = adobe;
    this.components = [];
    for (const component of frame.components) {
      const quantizationTable = quantizationTables[component.quantizationId];
      if (quantizationTable) {
        component.quantizationTable = quantizationTable;
      }
      this.components.push({
        index: component.index,
        output: buildComponentData(frame, component),
        scaleX: component.h / frame.maxH,
        scaleY: component.v / frame.maxV,
        blocksPerLine: component.blocksPerLine,
        blocksPerColumn: component.blocksPerColumn
      });
    }
    this.numComponents = this.components.length;
    return undefined;
  }
  _getLinearizedBlockData(width, height, isSourcePDF = false) {
    const scaleX = this.width / width,
      scaleY = this.height / height;
    let component, componentScaleX, componentScaleY, blocksPerScanline;
    let x, y, i, j, k;
    let index;
    let offset = 0;
    let output;
    const numComponents = this.components.length;
    const dataLength = width * height * numComponents;
    const data = new Uint8ClampedArray(dataLength);
    const xScaleBlockOffset = new Uint32Array(width);
    const mask3LSB = 0xfffffff8;
    let lastComponentScaleX;
    for (i = 0; i < numComponents; i++) {
      component = this.components[i];
      componentScaleX = component.scaleX * scaleX;
      componentScaleY = component.scaleY * scaleY;
      offset = i;
      output = component.output;
      blocksPerScanline = component.blocksPerLine + 1 << 3;
      if (componentScaleX !== lastComponentScaleX) {
        for (x = 0; x < width; x++) {
          j = 0 | x * componentScaleX;
          xScaleBlockOffset[x] = (j & mask3LSB) << 3 | j & 7;
        }
        lastComponentScaleX = componentScaleX;
      }
      for (y = 0; y < height; y++) {
        j = 0 | y * componentScaleY;
        index = blocksPerScanline * (j & mask3LSB) | (j & 7) << 3;
        for (x = 0; x < width; x++) {
          data[offset] = output[index + xScaleBlockOffset[x]];
          offset += numComponents;
        }
      }
    }
    let transform = this._decodeTransform;
    if (!isSourcePDF && numComponents === 4 && !transform) {
      transform = new Int32Array([-256, 255, -256, 255, -256, 255, -256, 255]);
    }
    if (transform) {
      for (i = 0; i < dataLength;) {
        for (j = 0, k = 0; j < numComponents; j++, i++, k += 2) {
          data[i] = (data[i] * transform[k] >> 8) + transform[k + 1];
        }
      }
    }
    return data;
  }
  get _isColorConversionNeeded() {
    if (this.adobe) {
      return !!this.adobe.transformCode;
    }
    if (this.numComponents === 3) {
      if (this._colorTransform === 0) {
        return false;
      } else if (this.components[0].index === 0x52 && this.components[1].index === 0x47 && this.components[2].index === 0x42) {
        return false;
      }
      return true;
    }
    if (this._colorTransform === 1) {
      return true;
    }
    return false;
  }
  _convertYccToRgb(data) {
    let Y, Cb, Cr;
    for (let i = 0, length = data.length; i < length; i += 3) {
      Y = data[i];
      Cb = data[i + 1];
      Cr = data[i + 2];
      data[i] = Y - 179.456 + 1.402 * Cr;
      data[i + 1] = Y + 135.459 - 0.344 * Cb - 0.714 * Cr;
      data[i + 2] = Y - 226.816 + 1.772 * Cb;
    }
    return data;
  }
  _convertYccToRgba(data, out) {
    for (let i = 0, j = 0, length = data.length; i < length; i += 3, j += 4) {
      const Y = data[i];
      const Cb = data[i + 1];
      const Cr = data[i + 2];
      out[j] = Y - 179.456 + 1.402 * Cr;
      out[j + 1] = Y + 135.459 - 0.344 * Cb - 0.714 * Cr;
      out[j + 2] = Y - 226.816 + 1.772 * Cb;
      out[j + 3] = 255;
    }
    return out;
  }
  _convertYcckToRgb(data) {
    let Y, Cb, Cr, k;
    let offset = 0;
    for (let i = 0, length = data.length; i < length; i += 4) {
      Y = data[i];
      Cb = data[i + 1];
      Cr = data[i + 2];
      k = data[i + 3];
      data[offset++] = -122.67195406894 + Cb * (-6.60635669420364e-5 * Cb + 0.000437130475926232 * Cr - 5.4080610064599e-5 * Y + 0.00048449797120281 * k - 0.154362151871126) + Cr * (-0.000957964378445773 * Cr + 0.000817076911346625 * Y - 0.00477271405408747 * k + 1.53380253221734) + Y * (0.000961250184130688 * Y - 0.00266257332283933 * k + 0.48357088451265) + k * (-0.000336197177618394 * k + 0.484791561490776);
      data[offset++] = 107.268039397724 + Cb * (2.19927104525741e-5 * Cb - 0.000640992018297945 * Cr + 0.000659397001245577 * Y + 0.000426105652938837 * k - 0.176491792462875) + Cr * (-0.000778269941513683 * Cr + 0.00130872261408275 * Y + 0.000770482631801132 * k - 0.151051492775562) + Y * (0.00126935368114843 * Y - 0.00265090189010898 * k + 0.25802910206845) + k * (-0.000318913117588328 * k - 0.213742400323665);
      data[offset++] = -20.810012546947 + Cb * (-0.000570115196973677 * Cb - 2.63409051004589e-5 * Cr + 0.0020741088115012 * Y - 0.00288260236853442 * k + 0.814272968359295) + Cr * (-1.53496057440975e-5 * Cr - 0.000132689043961446 * Y + 0.000560833691242812 * k - 0.195152027534049) + Y * (0.00174418132927582 * Y - 0.00255243321439347 * k + 0.116935020465145) + k * (-0.000343531996510555 * k + 0.24165260232407);
    }
    return data.subarray(0, offset);
  }
  _convertYcckToRgba(data) {
    for (let i = 0, length = data.length; i < length; i += 4) {
      const Y = data[i];
      const Cb = data[i + 1];
      const Cr = data[i + 2];
      const k = data[i + 3];
      data[i] = -122.67195406894 + Cb * (-6.60635669420364e-5 * Cb + 0.000437130475926232 * Cr - 5.4080610064599e-5 * Y + 0.00048449797120281 * k - 0.154362151871126) + Cr * (-0.000957964378445773 * Cr + 0.000817076911346625 * Y - 0.00477271405408747 * k + 1.53380253221734) + Y * (0.000961250184130688 * Y - 0.00266257332283933 * k + 0.48357088451265) + k * (-0.000336197177618394 * k + 0.484791561490776);
      data[i + 1] = 107.268039397724 + Cb * (2.19927104525741e-5 * Cb - 0.000640992018297945 * Cr + 0.000659397001245577 * Y + 0.000426105652938837 * k - 0.176491792462875) + Cr * (-0.000778269941513683 * Cr + 0.00130872261408275 * Y + 0.000770482631801132 * k - 0.151051492775562) + Y * (0.00126935368114843 * Y - 0.00265090189010898 * k + 0.25802910206845) + k * (-0.000318913117588328 * k - 0.213742400323665);
      data[i + 2] = -20.810012546947 + Cb * (-0.000570115196973677 * Cb - 2.63409051004589e-5 * Cr + 0.0020741088115012 * Y - 0.00288260236853442 * k + 0.814272968359295) + Cr * (-1.53496057440975e-5 * Cr - 0.000132689043961446 * Y + 0.000560833691242812 * k - 0.195152027534049) + Y * (0.00174418132927582 * Y - 0.00255243321439347 * k + 0.116935020465145) + k * (-0.000343531996510555 * k + 0.24165260232407);
      data[i + 3] = 255;
    }
    return data;
  }
  _convertYcckToCmyk(data) {
    let Y, Cb, Cr;
    for (let i = 0, length = data.length; i < length; i += 4) {
      Y = data[i];
      Cb = data[i + 1];
      Cr = data[i + 2];
      data[i] = 434.456 - Y - 1.402 * Cr;
      data[i + 1] = 119.541 - Y + 0.344 * Cb + 0.714 * Cr;
      data[i + 2] = 481.816 - Y - 1.772 * Cb;
    }
    return data;
  }
  _convertCmykToRgb(data) {
    let c, m, y, k;
    let offset = 0;
    for (let i = 0, length = data.length; i < length; i += 4) {
      c = data[i];
      m = data[i + 1];
      y = data[i + 2];
      k = data[i + 3];
      data[offset++] = 255 + c * (-0.00006747147073602441 * c + 0.0008379262121013727 * m + 0.0002894718188643294 * y + 0.003264231057537806 * k - 1.1185611867203937) + m * (0.000026374107616089405 * m - 0.00008626949158638572 * y - 0.0002748769067499491 * k - 0.02155688794978967) + y * (-0.00003878099212869363 * y - 0.0003267808279485286 * k + 0.0686742238595345) - k * (0.0003361971776183937 * k + 0.7430659151342254);
      data[offset++] = 255 + c * (0.00013596372813588848 * c + 0.000924537132573585 * m + 0.00010567359618683593 * y + 0.0004791864687436512 * k - 0.3109689587515875) + m * (-0.00023545346108370344 * m + 0.0002702845253534714 * y + 0.0020200308977307156 * k - 0.7488052167015494) + y * (0.00006834815998235662 * y + 0.00015168452363460973 * k - 0.09751927774728933) - k * (0.0003189131175883281 * k + 0.7364883807733168);
      data[offset++] = 255 + c * (0.000013598650411385307 * c + 0.00012423956175490851 * m + 0.0004751985097583589 * y - 0.0000036729317476630422 * k - 0.05562186980264034) + m * (0.00016141380598724676 * m + 0.0009692239130725186 * y + 0.0007782692450036253 * k - 0.44015232367526463) + y * (5.068882914068769e-7 * y + 0.0017778369011375071 * k - 0.7591454649749609) - k * (0.0003435319965105553 * k + 0.7063770186160144);
    }
    return data.subarray(0, offset);
  }
  _convertCmykToRgba(data) {
    for (let i = 0, length = data.length; i < length; i += 4) {
      const c = data[i];
      const m = data[i + 1];
      const y = data[i + 2];
      const k = data[i + 3];
      data[i] = 255 + c * (-0.00006747147073602441 * c + 0.0008379262121013727 * m + 0.0002894718188643294 * y + 0.003264231057537806 * k - 1.1185611867203937) + m * (0.000026374107616089405 * m - 0.00008626949158638572 * y - 0.0002748769067499491 * k - 0.02155688794978967) + y * (-0.00003878099212869363 * y - 0.0003267808279485286 * k + 0.0686742238595345) - k * (0.0003361971776183937 * k + 0.7430659151342254);
      data[i + 1] = 255 + c * (0.00013596372813588848 * c + 0.000924537132573585 * m + 0.00010567359618683593 * y + 0.0004791864687436512 * k - 0.3109689587515875) + m * (-0.00023545346108370344 * m + 0.0002702845253534714 * y + 0.0020200308977307156 * k - 0.7488052167015494) + y * (0.00006834815998235662 * y + 0.00015168452363460973 * k - 0.09751927774728933) - k * (0.0003189131175883281 * k + 0.7364883807733168);
      data[i + 2] = 255 + c * (0.000013598650411385307 * c + 0.00012423956175490851 * m + 0.0004751985097583589 * y - 0.0000036729317476630422 * k - 0.05562186980264034) + m * (0.00016141380598724676 * m + 0.0009692239130725186 * y + 0.0007782692450036253 * k - 0.44015232367526463) + y * (5.068882914068769e-7 * y + 0.0017778369011375071 * k - 0.7591454649749609) - k * (0.0003435319965105553 * k + 0.7063770186160144);
      data[i + 3] = 255;
    }
    return data;
  }
  getData({
    width,
    height,
    forceRGBA = false,
    forceRGB = false,
    isSourcePDF = false
  }) {
    if (this.numComponents > 4) {
      throw new JpegError("Unsupported color mode");
    }
    const data = this._getLinearizedBlockData(width, height, isSourcePDF);
    if (this.numComponents === 1 && (forceRGBA || forceRGB)) {
      const len = data.length * (forceRGBA ? 4 : 3);
      const rgbaData = new Uint8ClampedArray(len);
      let offset = 0;
      if (forceRGBA) {
        grayToRGBA(data, new Uint32Array(rgbaData.buffer));
      } else {
        for (const grayColor of data) {
          rgbaData[offset++] = grayColor;
          rgbaData[offset++] = grayColor;
          rgbaData[offset++] = grayColor;
        }
      }
      return rgbaData;
    } else if (this.numComponents === 3 && this._isColorConversionNeeded) {
      if (forceRGBA) {
        const rgbaData = new Uint8ClampedArray(data.length / 3 * 4);
        return this._convertYccToRgba(data, rgbaData);
      }
      return this._convertYccToRgb(data);
    } else if (this.numComponents === 4) {
      if (this._isColorConversionNeeded) {
        if (forceRGBA) {
          return this._convertYcckToRgba(data);
        }
        if (forceRGB) {
          return this._convertYcckToRgb(data);
        }
        return this._convertYcckToCmyk(data);
      } else if (forceRGBA) {
        return this._convertCmykToRgba(data);
      } else if (forceRGB) {
        return this._convertCmykToRgb(data);
      }
    }
    return data;
  }
}

;// ./external/openjpeg/openjpeg.js
var OpenJPEG = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  return function (moduleArg = {}) {
    var moduleRtn;
    var Module = moduleArg;
    var readyPromiseResolve, readyPromiseReject;
    var readyPromise = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var ENVIRONMENT_IS_WEB = true;
    var ENVIRONMENT_IS_WORKER = false;
    Module.decode = function (bytes, {
      numComponents = 4,
      isIndexedColormap = false,
      smaskInData = false
    }) {
      const size = bytes.length;
      const ptr = Module._malloc(size);
      Module.HEAPU8.set(bytes, ptr);
      const ret = Module._jp2_decode(ptr, size, numComponents > 0 ? numComponents : 0, !!isIndexedColormap, !!smaskInData);
      Module._free(ptr);
      if (ret) {
        const {
          errorMessages: errorMessages
        } = Module;
        if (errorMessages) {
          delete Module.errorMessages;
          return errorMessages;
        }
        return "Unknown error";
      }
      const {
        imageData: imageData
      } = Module;
      Module.imageData = null;
      return imageData;
    };
    var moduleOverrides = Object.assign({}, Module);
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var scriptDirectory = "";
    var read_, readAsync, readBinary;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptName) {
        scriptDirectory = _scriptName;
      }
      if (scriptDirectory.startsWith("blob:")) {
        scriptDirectory = "";
      } else {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
      }
      read_ = url => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText;
      };
      if (ENVIRONMENT_IS_WORKER) {
        readBinary = url => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.responseType = "arraybuffer";
          xhr.send(null);
          return new Uint8Array(xhr.response);
        };
      }
      readAsync = (url, onload, onerror) => {
        fetch(url, {
          credentials: "same-origin"
        }).then(response => {
          if (response.ok) {
            return response.arrayBuffer();
          }
          return Promise.reject(new Error(response.status + " : " + response.url));
        }).then(onload, onerror);
      };
    } else {}
    var out = Module["print"] || console.log.bind(console);
    var err = Module["printErr"] || console.error.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    if (Module["arguments"]) arguments_ = Module["arguments"];
    if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
    if (Module["quit"]) quit_ = Module["quit"];
    var wasmBinary;
    if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
    function intArrayFromBase64(s) {
      var decoded = atob(s);
      var bytes = new Uint8Array(decoded.length);
      for (var i = 0; i < decoded.length; ++i) {
        bytes[i] = decoded.charCodeAt(i);
      }
      return bytes;
    }
    function tryParseAsDataURI(filename) {
      if (!isDataURI(filename)) {
        return;
      }
      return intArrayFromBase64(filename.slice(dataURIPrefix.length));
    }
    var wasmMemory;
    var ABORT = false;
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateMemoryViews() {
      var b = wasmMemory.buffer;
      Module["HEAP8"] = HEAP8 = new Int8Array(b);
      Module["HEAP16"] = HEAP16 = new Int16Array(b);
      Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
      Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
      Module["HEAP32"] = HEAP32 = new Int32Array(b);
      Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
      Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
      Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
    }
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    function preRun() {
      if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
          addOnPreRun(Module["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      callRuntimeCallbacks(__ATINIT__);
    }
    function postRun() {
      if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
          addOnPostRun(Module["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function addRunDependency(id) {
      runDependencies++;
      Module["monitorRunDependencies"]?.(runDependencies);
    }
    function removeRunDependency(id) {
      runDependencies--;
      Module["monitorRunDependencies"]?.(runDependencies);
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    var dataURIPrefix = "data:application/octet-stream;base64,";
    var isDataURI = filename => filename.startsWith(dataURIPrefix);
    function findWasmBinary() {
      var f = "data:application/octet-stream;base64,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A0kNAAsLAkAgA0F8cSIEQcAASQ0AIAIgBEFAaiIFSw0AA0AgAiABKAIANgIAIAIgASgCBDYCBCACIAEoAgg2AgggAiABKAIMNgIMIAIgASgCEDYCECACIAEoAhQ2AhQgAiABKAIYNgIYIAIgASgCHDYCHCACIAEoAiA2AiAgAiABKAIkNgIkIAIgASgCKDYCKCACIAEoAiw2AiwgAiABKAIwNgIwIAIgASgCNDYCNCACIAEoAjg2AjggAiABKAI8NgI8IAFBQGshASACQUBrIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQALDAELIANBBEkEQCAAIQIMAQsgACADQQRrIgRLBEAgACECDAELIAAhAgNAIAIgAS0AADoAACACIAEtAAE6AAEgAiABLQACOgACIAIgAS0AAzoAAyABQQRqIQEgAkEEaiICIARNDQALCyACIANJBEADQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADRw0ACwsgAAswAQF/AkAgAEUNACABRQ0AQQggACABbCIBECUiAARAIABBACABEBUaCyAAIQILIAILEQAgAEUEQEEADwtBCCAAECUL8gICAn8BfgJAIAJFDQAgACABOgAAIAAgAmoiA0EBayABOgAAIAJBA0kNACAAIAE6AAIgACABOgABIANBA2sgAToAACADQQJrIAE6AAAgAkEHSQ0AIAAgAToAAyADQQRrIAE6AAAgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBBGsgATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQQhrIAE2AgAgAkEMayABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkEQayABNgIAIAJBFGsgATYCACACQRhrIAE2AgAgAkEcayABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa1CgYCAgBB+IQUgAyAEaiEBA0AgASAFNwMYIAEgBTcDECABIAU3AwggASAFNwMAIAFBIGohASACQSBrIgJBH0sNAAsLIAALJwEBfyMAQRBrIgMkACADIAI2AgwgACABIAJBAEEAEGsgA0EQaiQAC+gFAQl/IAFFBEBBAA8LAn8gAEUE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ACAEIE5BCmpBAiAFEBpBAkcEQCAFQQFBAiAAKAK4ARtBlhJBABAPIAAoArgBRSFnDAELIE5BCmogTkEMakECEBEgTigCDCIBQZD/A0YNACABQdn/A0YEQCAAQYACNgIIIABBADYCzAEMAQsgBCkDCCKGAVAEfkIABSCGASAEKQM4fQtQBEAgAEHAADYCCCAFQQJBrD9BABAPDAELQQAhZyAFQQFB7D5BABAPCyBOQRBqJAAgZwsLACAABEAgABAQCwu0AQEBfyAAKAIMRQRAIAIgACgCJCABEQMADwsCQEEIEBQiA0UNACADIAI2AgQgAyABNgIAQQgQFCIBRQRAIAMQEA8LIAEgAzYCACAAIAAoAgRB5ABsIgI2AigDQCAAKAIYIAJKDQALIAEgACgCFDYCBCAAIAE2AhQgACAAKAIYQQFqNgIYIAAoAhwiAUUNACABKAIAQQA2AgggACABKAIENgIcIAAgACgCIEEBazYCICABEBALC/oCAQR/AkAgAEUNACAAKAKsKCIBBEAgACgCqCgiAgRAQQAhAQNAIAAoAqwoIAFBA3RqKAIAIgMEQCADEBAgACgCqCghAgsgAUEBaiIBIAJJDQALIAAoAqwoIQELIABBADYCqCggARAQIABBADYCrCgLIAAoArQoIgEEQCABEBAgAEEANgK0KAsgACgC0CsiAQRAIAEQECAAQQA2AtArCyAAKALsKyIBBEAgARAQIABBADYC7CsLIAAoAugrIgEEQCABEBAgAEEANgLoKwsgACgC/CsiAQRAIAEQECAAQQA2AoQsIABCADcC/CsLIAAoAvArIgEEQCAAKAL0KyIDBH9BACECA0AgASgCDCIEBEAgBBAQIAFBADYCDCAAKAL0KyEDCyABQRRqIQEgAkEBaiICIANJDQALIAAoAvArBSABCxAQIABBADYC8CsLIAAoAuQrIgEEQCABEBAgAEEANgLkKwsgACgC3CsiAUUNACABEBAgAEIANwLcKwsLyAcCEX8BfiAAKAIQIghBIE8EQCAAKQMIpw8LAkAgACgCFCIDQQROBEAgACgCACICQQNrKAIAIQEgACADQQRrIgM2AhQgACACQQRrNgIADAELIANBAEwEQAwBCyADQQFxIQ0gACgCACECAkAgA0EBRgRAQRghBAwBCyADQf7///8HcSEJQRghBANAIAAgAkEB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IABBADYCiAEgACgCZBAQIABBADYCZCAALQC8AUECcUUEQCAAKAKoARAQCyAAQdAAakEAQfAAEBUaIAAoAsABEDIgAEEANgLAASAAKALEARAyIABBADYCwAEgACgCyAEiAQRAIAEoAhwiAgRAIAIQECABQQA2AhwLIAEoAigiAgRAIAEoAiQEQANAIAIgBUEobCIDaigCJCIEBEAgBBAQIAEoAigiAiADakEANgIkCyACIANqKAIQIgQEQCAEEBAgASgCKCICIANqQQA2AhALIAIgA2ooAhgiBARAIAQQECABKAIoIgIgA2pBADYCGAsgBUEBaiIFIAEoAiRJDQALCyACEBAgAUEANgIoCyABEBALIABBADYCyAEgACgCSBAhIABBADYCSCAAKAJMECEgAEEANgJMIAAoAtQBIgMEQAJAIAMoAghFDQAgAygCDARAIANBADYCKANAIAMoAhhBAEoNAAsLIANBATYCECADKAIAEBAgAygCHCICRQ0AA0AgAigCBCEBIAIQECADIAE2AhwgASICDQALCyADKAIkIgIEQCACKAIEIgVBAEoEQEEAIQEDQCACKAIAIAFBDGxqIgQoAggiBgRAIAQoAgQgBhECACACKAIEIQULIAFBAWoiASAFSA0ACwsgAigCABAQIAIQEAsgAxAQCyAAQQA2AtQBIAAQEAsL5gMCCH8EfiAAKAIUKAIAKAIUIAFBzABsaiIJKAIMIgggACgCGCgCGCABQTRsaiIKNQIEIhBCAX0iEiAANQI8fCAQgKciCyAIIAtJGyEMIAkoAggiCCAKNQIAIhFCAX0iEyAANQI4fCARgKciCiAIIApJGyEKIAkoAgQiCCASIAA1AjR8IBCApyILIAggC0sbIQsgCSgCACIIIBMgADUCMHwgEYCnIg0gCCANSxshDUEAIQggACgCICgC0CsgAUG4CGxqKAIUIQ4CQCAJKAIUQQAgAmtBfyACG2oiAkUEQCAKIQAgDSEIIAshAQwBCyADQQFxIAJBAWsiD3QiCSANSQRAIA0gCWutQn8gAq0iEIZCf4V8IBCIpyEIC0EAIQBBACEBIANBAXYgD3QiAyALSQRAIAsgA2utQn8gAq0iEIZCf4V8IBCIpyEBCyAJIApJBEAgCiAJa61CfyACrSIQhkJ/hXwgEIinIQALIAMgDE8EQEEAIQwMAQsgDCAD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IABBADYCPCAAQucHNwI0IABBADYCLCAAQucHNwIkIABBADYCHCAAQucHNwIUIABBADYCDCAAQucHNwIEIABBQGshACACQQRqIgIgA0cNAAsLIAFBA3EiAUUNAEEAIQIDQCAAQQA2AgwgAELnBzcCBCAAQRBqIQAgAkEBaiICIAFHDQALCwv7BQEQfyMAQYACayIIJAACf0EBQRQQEyIGRQRAIAJBAUH0MEEAEA9BAAwBCyAGIAE2AgQgBiAANgIAIAggATYCACAIIAA2AoABA0AgCCAFIg1BAWoiBUECdCIHaiABQQFqQQJtIgM2AgAgCEGAAWogB2ogAEEBakECbSIHNgIAIAQgACABbCIJaiEEIAMhASAHIQAgCUEBSw0ACyAGIAQ2AgggBEUEQCAGEBBBAAwBCyAGIARBEBATIgM2AgwgA0UEQCACQQFB2hpBABAPIAYQEEEADAELIAYgBigCCCILQQR0NgIQIAMhACANBEAgAyAGKAIEIAYoAgBsQQR0aiIEIQEDQAJAIAggDkECdCICaigCACIJQQBMDQAgCUEBayEMQQAhBwJAIAhBgAFqIAJqKAIAIgJBAEwEQEEAIQUgCUEBRwRAIAlB/v///wdxIQoDQCAFIAxGIQ8gBUECaiEFIAEgBCAPGyIEIQEgB0ECaiIHIApHDQALCyAJQQFxDQEgBCEBDAILA0AgBCEFIAIhBANAAkAgACABNgIAIARBAUYEQCAAQRBqIQAgAUEQaiEBDAELIAAgATYCECABQRBqIQEgAEEgaiEAIARBAkohECAEQQJrIQQgEA0BCwsgASAFIAJBBHRqIAcgByAMRnJBAXEiChshBCABIAUgChshASAHQQFqIgcgCUcNAAsMAQsgASAEIAJBBHRqIAUgBSAMRnJBAXEiBRshESABIAQgBRshASARIQQLIA5BAWoiDiANRw0ACwsgAEEANgIAAkAgC0UNACALQQRPBEAgC0F8cSEAQQAhAQNAIANBADYCPCADQucHNwI0IANBADYCLCADQucHNwIkIANBADYCHCADQucHNwIUIANBADYCDCADQucHNwIEIANBQGshAyABQQRqIgEgAEcNAAsLIAtBA3EiAEUNAEEAIQEDQCADQQA2AgwgA0LnBzcCBCADQRBqIQMgAUEBaiIBIABHDQALCyAGCyESIAhBgAJqJAAgEgtTAQF/An8gAC0ADEH/AUYEQCAAQoD+g4DwADcCDEEAIAAoAggiASAAKAIETw0BGiAAIAFBAWo2AgggACABLQAAQYD+A3I2AgwLIABBADYCEEEBCwt+AgF/AX4gAL0iA0I0iKdB/w9xIgJB/w9HBHwgAkUEQCABIABEAAAAAAAAAABhBH9BAAUgAEQAAAAAAADwQ6IgARBlIQAgASgCAEFAags2AgAgAA8LIAEgAkH+B2s2AgAgA0L/////////h4B/g0KAgICAgICA8D+EvwUgAAsLSQEBfwJAQQFBLBATIgEEQCABQQA2AhACQCAAQQBMBEAgAUEBQQgQEyIANgIkIABFDQEMAwsgAUEANgIMCyABEBALQQAhAQsgAQuRAgAgAEUEQEEADwsCfwJAIAFB/wBNDQACQEGU0AEoAgAoAgBFBEAgAUGAf3FBgL8DRg0CDAELIAFB/w9NBEAgACABQT9xQYABcjoAASAAIAFBBnZBwAFyOgAAQQIMAwsgAUGAQHFBgMADRyABQYCwA09xRQRAIAAgAUE/cUGAAXI6AAIgACABQQx2QeABcjoAACAAIAFBBnZBP3FBgAFyOgABQQMMAwsgAUGAgARrQf//P00EQCAAIAFBP3FBgAFyOgADIAAgAUESdkHwAXI6AAAgACABQQZ2QT9xQYABcjoAAiAAIAFBDHZBP3FBgAFyOgABQQQMAwsLQZTHAUEZNgIAQX8MAQsgACABOgAAQQELC7wCAAJAAkACQAJAAkACQAJAAkACQAJAAkAgAUEJaw4SAAgJCggJAQIDBAoJCgoICQUGBwsgAiACKAIAIgFBBGo2AgAgACABKAIANgIADwsgAiACKAIAIgFBBGo2AgAgACABMgEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMwEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMAAANwMADwsgAiACKAIAIgFBBGo2AgAgACABMQAANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKwMAOQMADwsgACACIAMRAwALDwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMAC3MBBn8gACgCACIDLAAAQTBrIgFBCUsE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AyAAQRh2NgIUIAMgBDYCECADIABBCHZB/wFxNgIcIAMgAEEQdkH/AXE2AhggAkEBQc31ACADQRBqEA8MBwsgBSAITQRAIAYhBAwECyAFIQggBiAFEBciBA0DIAYQECACQQFB/w9BABAPQQAMBwsgBEECcUUEQCACQQFBwg9BABAPIAYQEEEADAcLIAAgBEH/////B3I2AmQgASAHIAVrrSINIAIgASgCKBEIACANUQ0DIAAtAGRBCHFFDQEgAkECQZIcQQAQDwsgBhAQQQEMBQsgAkEBQZIcQQAQDyAGEBBBAAwECyABIAQgBSACEBogBUcEQCACQQFBxBxBABAPIAQQEEEADAQLIAAgBCIGIAUgAiAKKAIEEQEADQALIAQQEEEADAILIAJBAUGiJUEAEA9BAAwBCyAGEBBBAAshDCADQfAAaiQAIAwL5gEBBn8gACgCCEE1IAIQJARAAkAgACgCCCIGKAIAIQMgBigCCCEFAkACQAJ/AkAgAwRAQQEhBCADQQFxIQcgA0EBRw0BQQAMAgsgBkEANgIADAILIANBfnEhAwNAAn9BACAERQ0AGkEAIAAgASACIAUoAgARAABFDQAaIAAgASACIAUoAgQRAABBAEcLIQQgBUEIaiEFIAhBAmoiCCADRw0ACyAERQshAyAHBEAgAw0CIAAgASACIAUoAgARAABBAEchBAsgBkEANgIAIARFDQILIAAoAgAaQQEPCyAGQQA2AgALC0EACwoAIAAoAgAaQQALFAAgACgCACIABEAgACABNgK4AQsLIQAgACgCACABEFMgAEEAOgB8IAAgASgCuEBBAXE2AoABCzIAIAJFBEBBAA8LIAAoAgAgASACIAMQSEUEQCADQQFBqS9BABAPQQAPCyAAIAIgAxBxC2kCAn8BfCMAQRBrIgMkACACBEADQCAAIANBCGoQRCABAn8gAysDCCIFmUQAAAAAAADgQWMEQCAFqgwBC0GAgICAeAs2AgAgAUEEaiEBIABBCGohACAEQQFqIgQgAkcNAAsLIANBEGokAAuEAQICfwF9IwBBEGsiAyQAIAIEQANAIAMgAC0AADoADyADIAAtAAE6AA4gAyAALQACOgANIAMgAC0AAzoADCABAn8gAyoCDCIFi0MAAABPXQRAIAWoDAELQYCAgIB4CzYCACABQQRqIQEgAEEEaiEAIARBAWoiBCACRw0ACwsgA0EQaiQAC0sBAn8jAEEQayIDJAAgAgRAA0AgACADQQxqQQQQESABIAMoAgw2AgAgAUEEaiEBIABBBGohACAEQQFqIgQgAkcNAAsLIANBEGokAAtLAQJ/IwBBEGsiAyQAIAIEQANAIAAgA0EMakECEBEgASADKAIMNgIAIAFBBGohASAAQQJqIQAgBEEBaiIEIAJHDQALCyADQRBqJAALSgECfyMAQRBrIgMkACACBEADQCAAIANBCGoQRCABIAMrAwi2OAIAIAFBBGohASAAQQhqIQAgBEEBaiIEIAJHDQALCyADQRBqJAALaAECfyMAQRBrIgMkACACBEADQCADIAAtAAA6AA8gAyAALQABOgAOIAMgAC0AAjoADSADIAAtAAM6AAwgASADKgIMOAIAIAFBBGohASAAQQRqIQAgBEEBaiIEIAJHDQALCyADQRBqJAALTAECfyMAQRBrIgMkACACBEADQCAAIANBDGpBBBARIAEgAygCDLM4AgAgAUEEaiEBIABBBGohACAEQQFqIgQgAkcNAAsLIANBEGokAAtMAQJ/IwBBEGsiAyQAIAIEQANAIAAgA0EMakECEBEgASADKAIMszgCACABQQRqIQEgAEECaiEAIARBAWoiBCACRw0ACwsgA0EQaiQAC6oIAg1/AXsjAEEQayIIJAACfyAAKAIIQRBGBEAgACgCnAEgACgCzAFBjCxsagwBCyAAKAIMCyEJAkAgAkUEQCADQQFB8B9BABAPDAELIAAoAkghBkEBIQQgASAIQQhqQQEQESAIKAIIIgVBAk8EQCADQQJBxsgAQQAQDwwBCyACIAVBAWpHBEBBACEEIANBAkHwH0EAEA8MAQsCQCAGKAIQIgNFDQAgCSgC0CshBCADQQhPBEAgA0F4cSEGQQAhAgNAIARBADYCvEMgBEEANgKEOyAEQQA2AswyIARBADYClCogBEEANgLcISAEQQA2AqQZIARBADYC7BAgBEEANgK0CCAEQcDDAGohBCACQQhqIgIgBkcNAAsLIANBB3EiA0UNAEEAIQIDQCAEQQA2ArQIIARBuAhqIQQgAkEBaiICIANHDQALCyAJKALoKyICBH8gAhAQIAlBADYC6CsgCCgCCAUgBQtFBEBBASEEDAELA0AgAUEBaiIBIAhBDGpBARARAkAgCSgCgCxF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KT0ALgAobnVsbCkAKCVkLCVkKSAAJXN9CgAJCSB9CgBbREVWXSBEdW1wIGFuIGltYWdlX2NvbXBfaGVhZGVyIHN0cnVjdCB7CgBbREVWXSBEdW1wIGFuIGltYWdlX2hlYWRlciBzdHJ1Y3QgewoASW1hZ2UgaW5mbyB7CgAJIGRlZmF1bHQgdGlsZSB7CgAlcwkgY29tcG9uZW50ICVkIHsKAAkJIGNvbXAgJWQgewoACSBUaWxlIGluZGV4OiB7CgAJIE1hcmtlciBsaXN0OiB7CgBDb2Rlc3RyZWFtIGluZGV4IGZyb20gbWFpbiBoZWFkZXI6IHsKAENvZGVzdHJlYW0gaW5mbyBmcm9tIG1haW4gaGVhZGVyOiB7CgBTdHJlYW0gZXJyb3Igd2hpbGUgcmVhZGluZyBKUDIgSGVhZGVyIGJveAoARm91bmQgYSBtaXNwbGFjZWQgJyVjJWMlYyVjJyBib3ggb3V0c2lkZSBqcDJoIGJveAoATWFsZm9ybWVkIEpQMiBmaWxlIGZvcm1hdDogZmlyc3QgYm94IG11c3QgYmUgSlBFRyAyMDAwIHNpZ25hdHVyZSBib3gKAE1hbGZvcm1lZCBKUDIgZmlsZSBmb3JtYXQ6IHNlY29uZCBib3ggbXVzdCBiZSBmaWxlIHR5cGUgYm94CgBOb3QgZW5vdWdoIG1lbW9yeSB0byBoYW5kbGUganBlZzIwMDAgYm94CgBOb3QgZW5vdWdoIG1lbW9yeSB3aXRoIEZUWVAgQm94CgBBIG1hcmtlciBJRCB3YXMgZXhwZWN0ZWQgKDB4ZmYtLSkgaW5zdGVhZCBvZiAlLjh4CgAJCSBtY3Q9JXgKAAkJCSBjYmxrc3R5PSUjeAoACQkJIGNzdHk9JSN4CgAJCSBwcmc9JSN4CgBJbnRlZ2VyIG92ZXJmbG93CgAJIHRkeD0ldSwgdGR5PSV1CgAJIHR3PSV1LCB0aD0ldQoACSB0eDA9JXUsIHR5MD0ldQoASW52YWxpZCBjb21wb25lbnQgaW5kZXg6ICV1CgBTdHJlYW0gdG9vIHNob3J0CgBNYXJrZXIgaGFuZGxlciBmdW5jdGlvbiBmYWlsZWQgdG8gcmVhZCB0aGUgbWFya2VyIHNlZ21lbnQKAE5vdCBlbm91Z2ggbWVtb3J5IGZvciBjdXJyZW50IHByZWNpbmN0IGNvZGVibG9jayBlbGVtZW50CgBFcnJvciByZWFkaW5nIFNQQ29kIFNQQ29jIGVsZW1lbnQKAEVycm9yIHJlYWRpbmcgU1FjZCBvciBTUWNjIGVsZW1lbnQKAEEgQlBDQyBoZWFkZXIgYm94IGlzIGF2YWlsYWJsZSBhbHRob3VnaCBCUEMgZ2l2ZW4gYnkgdGhlIElIRFIgYm94ICglZCkgaW5kaWNhdGUgY29tcG9uZW50cyBiaXQgZGVwdGggaXMgY29uc3RhbnQKAEVycm9yIHdpdGggU0laIG1hcmtlcjogaWxsZWdhbCB0aWxlIG9mZnNldAoASW52YWxpZCBwcmVjaW5jdAoATm90IGVub3VnaCBtZW1vcnkgdG8gaGFuZGxlIGJhbmQgcHJlY2ludHMKAEZhaWxlZCB0byBkZWNvZGUgYWxsIHVzZWQgY29tcG9uZW50cwoAU2l6ZSBvZiBjb2RlIGJsb2NrIGRhdGEgZXhjZWVkcyBzeXN0ZW0gbGltaXRzCgBTaXplIG9mIHRpbGUgZGF0YSBleGNlZWRzIHN5c3RlbSBsaW1pdHMKAENhbm5vdCB0YWtlIGluIGNoYXJnZSBtdWx0aXBsZSBNQ1QgbWFya2VycwoAQ29ycnVwdGVkIFBQTSBtYXJrZXJzCgBOb3QgZW5vdWdoIG1lbW9yeSBmb3IgdGlsZSByZXNvbHV0aW9ucwoAQ2Fubm90IHRha2UgaW4gY2hhcmdlIG11bHRpcGxlIGNvbGxlY3Rpb25zCgBJbnZhbGlkIFBDTFIgYm94LiBSZXBvcnRzIDAgcGFsZXR0ZSBjb2x1bW5zCgBXZSBkbyBub3Qgc3VwcG9ydCBST0kgaW4gZGVjb2RpbmcgSFQgY29kZWJsb2NrcwoAQ2Fubm90IGhhbmRsZSBib3ggb2YgdW5kZWZpbmVkIHNpemVzCgBDYW5ub3QgdGFrZSBpbiBjaGFyZ2UgY29sbGVjdGlvbnMgd2l0aG91dCBzYW1lIG51bWJlciBvZiBpbmRpeGVzCgBJbnZhbGlkIHRpbGVjLT53aW5feHh4IHZhbHVlcwoAQ2Fubm90IGhhbmRsZSBib3ggb2YgbGVzcyB0aGFuIDggYnl0ZXMKAENhbm5vdCBoYW5kbGUgWEwgYm94IG9mIGxlc3MgdGhhbiAxNiBieXRlcwoAQ29tcG9uZW50IGluZGV4ICV1IHVzZWQgc2V2ZXJhbCB0aW1lcwoASW52YWxpZCBQQ0xSIGJveC4gUmVwb3J0cyAlZCBlbnRyaWVzCgBOb3QgZW5vdWdoIG1lbW9yeSB0byBjcmVhdGUgVGFnLXRyZWUgbm9kZXMKAENhbm5vdCB0YWtlIGluIGNoYXJnZSBtY3QgZGF0YSB3aXRoaW4gbXVsdGlwbGUgTUNUIHJlY29yZHMKAENhbm5vdCBkZWNvZGUgdGlsZSwgbWVtb3J5IGVycm9yCgBvcGpfajJrX2FwcGx5X25iX3RpbGVfcGFydHNfY29ycmVjdGlvbiBlcnJvcgoAUHJvYmxlbSB3aXRoIHNraXBwaW5nIEpQRUcyMDAwIGJveCwgc3RyZWFtIGVycm9yCgBQcm9ibGVtIHdpdGggcmVhZGluZyBKUEVHMjAwMCBib3gsIHN0cmVhbSBlcnJvcgoAVW5rbm93biBtYXJrZXIKAE5vdCBlbm91Z2ggbWVtb3J5IHRvIGFkZCB0bCBtYXJrZXIKAE5vdCBlbm91Z2ggbWVtb3J5IHRvIGFkZCBtaCBtYXJrZXIKAE5vdCBlbm91Z2ggbWVtb3J5IHRvIHRha2UgaW4gY2hhcmdlIFNJWiBtYXJrZXIKAEVycm9yIHJlYWRpbmcgUFBUIG1hcmtlcgoATm90IGVub3VnaCBtZW1vcnkgdG8gcmVhZCBQUFQgbWFya2VyCgBFcnJvciByZWFkaW5nIFNPVCBtYXJrZXIKAEVycm9yIHJlYWRpbmcgUExUIG1hcmtlcgoARXJyb3IgcmVhZGluZyBNQ1QgbWFya2VyCgBOb3QgZW5vdWdoIG1lbW9yeSB0byByZWFkIE1DVCBtYXJrZXIKAE5vdCBlbm91Z2ggc3BhY2UgZm9yIGV4cGVjdGVkIFNPUCBtYXJrZXIKAEV4cGVjdGVkIFNPUCBtYXJrZXIKAEVycm9yIHJlYWRpbmcgTUNPIG1hcmtlcgoARXJyb3IgcmVhZGluZyBSR04gbWFya2VyCgBFcnJvciByZWFkaW5nIFBQTSBtYXJrZXIKAE5vdCBlbm91Z2ggbWVtb3J5IHRvIHJlYWQgUFBNIG1hcmtlcgoARXJyb3IgcmVhZGluZyBUTE0gbWFya2VyCgBFcnJvciByZWFkaW5nIFBMTSBtYXJrZXIKAE5vdCBlbm91Z2ggc3BhY2UgZm9yIGV4cGVjdGVkIEVQSCBtYXJrZXIKAEV4cGVjdGVkIEVQSCBtYXJrZXIKAEVycm9yIHJlYWRpbmcgQ1JHIG1hcmtlcgoAVW5rbm93biBwcm9ncmVzc2lvbiBvcmRlciBpbiBDT0QgbWFya2VyCgBVbmtub3duIFNjb2QgdmFsdWUgaW4gQ09EIG1hcmtlcgoARXJyb3IgcmVhZGluZyBDT0QgbWFya2VyCgBFcnJvciByZWFkaW5nIFFDRCBtYXJrZXIKAENycm9yIHJlYWRpbmcgQ0JEIG1hcmtlcgoARXJyb3IgcmVhZGluZyBQT0MgbWFya2VyCgBFcnJvciByZWFkaW5nIENPQyBtYXJrZXIKAEVycm9yIHJlYWRpbmcgUUNDIG1hcmtlcgoARXJyb3IgcmVhZGluZyBNQ0MgbWFya2VyCgBOb3QgZW5vdWdoIG1lbW9yeSB0byByZWFkIE1DQyBtYXJrZXIKAHJlcXVpcmVkIFNJWiBtYXJrZXIgbm90IGZvdW5kIGluIG1haW4gaGVhZGVyCgByZXF1aXJlZCBDT0QgbWFya2VyIG5vdCBmb3VuZCBpbiBtYWluIGhlYWRlcgoAcmVxdWlyZWQgUUNEIG1hcmtlciBub3QgZm91bmQgaW4gbWFpbiBoZWFkZXIKAE5vdCBlbm91Z2ggbWVtb3J5IHRvIGhhbmRsZSBqcGVnMjAwMCBmaWxlIGhlYWRlcgoATm90IGVub3VnaCBtZW1vcnkgdG8gcmVhZCBoZWFkZXIKAEVycm9yIHdpdGggSlAgU2lnbmF0dXJlIDogYmFkIG1hZ2ljIG51bWJlcgoASW4gU09UIG1hcmtlciwgVFBTb3QgKCVkKSBpcyBub3QgdmFsaWQgcmVnYXJkcyB0byB0aGUgY3VycmVudCBudW1iZXIgb2YgdGlsZS1wYXJ0ICglZCksIGdpdmluZyB1cAoASW4gU09UIG1hcmtlciwgVFBTb3QgKCVkKSBpcyBub3QgdmFsaWQgcmVnYXJkcyB0byB0aGUgcHJldmlvdXMgbnVtYmVyIG9mIHRpbGUtcGFydCAoJWQpLCBnaXZpbmcgdXAKAEluIFNPVCBtYXJrZXIsIFRQU290ICglZCkgaXMgbm90IHZhbGlkIHJlZ2FyZHMgdG8gdGhlIGN1cnJlbnQgbnVtYmVyIG9mIHRpbGUtcGFydCAoaGVhZGVyKSAoJWQpLCBnaXZpbmcgdXAKAHRpbGVzIHJlcXVpcmUgYXQgbGVhc3Qgb25lIHJlc29sdXRpb24KAE1hcmtlciBpcyBub3QgY29tcGxpYW50IHdpdGggaXRzIHBvc2l0aW9uCgBQcm9ibGVtIHdpdGggc2VlayBmdW5jdGlvbgoARXJyb3IgcmVhZGluZyBTUENvZCBTUENvYyBlbGVtZW50LCBJbnZhbGlkIGNibGt3L2NibGtoIGNvbWJpbmF0aW9uCgBJbnZhbGlkIG11bHRpcGxlIGNvbXBvbmVudCB0cmFuc2Zvcm1hdGlvbgoAQ2Fubm90IHRha2UgaW4gY2hhcmdlIGNvbGxlY3Rpb25zIG90aGVyIHRoYW4gYXJyYXkgZGVjb3JyZWxhdGlvbgoAVG9vIGxhcmdlIHZhbHVlIGZvciBOcHBtCgBOb3QgZW5vdWdoIGJ5dGVzIHRvIHJlYWQgTnBwbQoAYmFkIHBsYWNlZCBqcGVnIGNvZGVzdHJlYW0KAAkgTWFpbiBoZWFkZXIgc3RhcnQgcG9zaXRpb249JWxsaQoJIE1haW4gaGVhZGVyIGVuZCBwb3NpdGlvbj0lbGxpCgBNYXJrZXIgc2l6ZSBpbmNvbnNpc3RlbnQgd2l0aCBzdHJlYW0gbGVuZ3RoCgBUaWxlIHBhcnQgbGVuZ3RoIHNpemUgaW5jb25zaXN0ZW50IHdpdGggc3RyZWFtIGxlbmd0aAoAQ2Fubm90IHRha2UgaW4gY2hhcmdlIG11bHRpcGxlIGRhdGEgc3Bhbm5pbmcKAFdyb25nIGZsYWcKAEVycm9yIHdpdGggRlRZUCBzaWduYXR1cmUgQm94IHNpemUKAEVycm9yIHdpdGggSlAgc2lnbmF0dXJlIEJveCBzaXplCgBJbnZhbGlkIHByZWNpbmN0IHNpemUKAEluY29uc2lzdGVudCBtYXJrZXIgc2l6ZQoASW52YWxpZCBtYXJrZXIgc2l6ZQoARXJyb3Igd2l0aCBTSVogbWFya2VyIHNpemUKAE5vdCBlbm91Z2ggbWVtb3J5IHRvIGFkZCBhIG5ldyB2YWxpZGF0aW9uIHByb2NlZHVyZQoATm90IGVub3VnaCBtZW1vcnkgdG8gZGVjb2RlIHRpbGUKAEZhaWxlZCB0byBkZWNvZGUgdGhlIGNvZGVzdHJlYW0gaW4gdGhlIEpQMiBmaWxlCgBDYW5ub3QgdGFrZSBpbiBjaGFyZ2UgY29sbGVjdGlvbnMgd2l0aCBpbmRpeCBzaHVmZmxlCgBDYW5ub3QgYWxsb2NhdGUgVGllciAxIGhhbmRsZQoATm8gZGVjb2RlZCBhcmVhIHBhcmFtZXRlcnMsIHNldCB0aGUgZGVjb2RlZCBhcmVhIHRvIHRoZSB3aG9sZSBpbWFnZQoATm90IGVub3VnaCBtZW1vcnkgdG8gY3JlYXRlIFRhZy10cmVlCgBOb3QgZW5vdWdoIG1lbW9yeSB0byByZWluaXRpYWxpemUgdGhlIHRhZyB0cmVlCgBFcnJvciByZWFkaW5nIFNQQ29kIFNQQ29jIGVsZW1lbnQsIEludmFsaWQgdHJhbnNmb3JtYXRpb24gZm91bmQKAEVycm9yIHJlYWRpbmcgU1BDb2QgU1BDb2MgZWxlbWVudC4gVW5zdXBwb3J0ZWQgTWl4ZWQgSFQgY29kZS1ibG9jayBzdHlsZSBmb3VuZAoAVGlsZSBZIGNvb3JkaW5hdGVzIGFyZSBub3Qgc3VwcG9ydGVkCgBUaWxlIFggY29vcmRpbmF0ZXMgYXJlIG5vdCBzdXBwb3J0ZWQKAEltYWdlIGNvb3JkaW5hdGVzIGFib3ZlIElOVF9NQVggYXJlIG5vdCBzdXBwb3J0ZWQKAEpQRUcyMDAwIEhlYWRlciBib3ggbm90IHJlYWQgeWV0LCAnJWMlYyVjJWMnIGJveCB3aWxsIGJlIGlnbm9yZWQKAG9wal9qMmtfbWVyZ2VfcHB0KCkgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQKAE5vdCBlbm91Z2ggbWVtb3J5IHRvIHJlYWQgU09UIG1hcmtlci4gVGlsZSBpbmRleCBhbGxvY2F0aW9uIGZhaWxlZAoASWdub3JpbmcgaWhkciBib3guIEZpcnN0IGloZHIgYm94IGFscmVhZHkgcmVhZAoAWnBwdCAldSBhbHJlYWR5IHJlYWQKAFpwcG0gJXUgYWxyZWFkeSByZWFkCgBQVEVSTSBjaGVjayBmYWlsdXJlOiAlZCBzeW50aGV0aXplZCAweEZGIG1hcmtlcnMgcmVhZAoACQkJIGNibGt3PTJeJWQKAAkJCSBjYmxraD0yXiVkCgAJCQkgcW50c3R5PSVkCgAlcyBkeD0lZCwgZHk9JWQKAAkJCSByb2lzaGlmdD0lZAoACQkJIG51bWdiaXRzPSVkCgAJCSBudW1sYXllcnM9JWQKACVzIG51bWNvbXBzPSVkCgBvcGpfanAyX2FwcGx5X2NkZWY6IGFjbj0lZCwgbnVtY29tcHM9JWQKAG9wal9qcDJfYXBwbHlfY2RlZjogY249JWQsIG51bWNvbXBzPSVkCgAJCQkgbnVtcmVzb2x1dGlvbnM9JWQKAAkJIHR5cGU9JSN4LCBwb3M9JWxsaSwgbGVuPSVkCgAlcyBzZ25kPSVkCgAJCQkgcW1mYmlkPSVkCgAlcyBwcmVjPSVkCgAJCSBuYiBvZiB0aWxlLXBhcnQgaW4gdGlsZSBbJWRdPSVkCgAlcyB4MT0lZCwgeTE9JWQKACVzIHgwPSVkLCB5MD0lZAoARmFpbGVkIHRvIGRlY29kZSB0aWxlICVkLyVkCgBTZXR0aW5nIGRlY29kaW5nIGFyZWEgdG8gJWQsJWQsJWQsJWQKAEZhaWxlZCB0byBkZWNvZGUgY29tcG9uZW50ICVkCgBJbnZhbGlkIHZhbHVlIGZvciBudW1yZXNvbHV0aW9ucyA6ICVkLCBtYXggdmFsdWUgaXMgc2V0IGluIG9wZW5qcGVnLmggYXQgJWQKAEludmFsaWQgY29tcG9uZW50IG51bWJlcjogJWQsIHJlZ2FyZGluZyB0aGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgJWQKAFRvbyBtYW55IFBPQ3MgJWQKAEludmFsaWQgdGlsZSBudW1iZXIgJWQKAEludmFsaWQgdGlsZSBwYXJ0IGluZGV4IGZvciB0aWxlIG51bWJlciAlZC4gR290ICVkLCBleHBlY3RlZCAlZAoARXJyb3Igd2l0aCBTSVogbWFya2VyOiBudW1iZXIgb2YgY29tcG9uZW50IGlzIGlsbGVnYWwgLT4gJWQKAE5vdCBlbm91Z2ggbWVtb3J5IGZvciBjaWVsYWIKAENhbm5vdCBhbGxvY2F0ZSBjYmxrLT5kZWNvZGVkX2RhdGEKAEZhaWxlZCB0byBtZXJnZSBQUFQgZGF0YQoARmFpbGVkIHRvIG1lcmdlIFBQTSBkYXRhCgBJbnZhbGlkIG51bWJlciBvZiBsYXllcnMgaW4gQ09EIG1hcmtlciA6ICVkIG5vdCBpbiByYW5nZSBbMS02NTUzNV0KACVzOiVkOmNvbG9yX2NteWtfdG9fcmdiCglDQU4gTk9UIENPTlZFUlQKACVzOiVkOmNvbG9yX2VzeWNjX3RvX3JnYgoJQ0FOIE5PVCBDT05WRVJUCgAlczolZDpjb2xvcl9zeWNjX3RvX3JnYgoJQ0FOIE5PVCBDT05WRVJUCgBTdHJlYW0gdG9vIHNob3J0LCBleHBlY3RlZCBTT1QKAFVuYWJsZSB0byBzZXQgdDEgaGFuZGxlIGFzIFRMUwoAU3RyZWFtIGRvZXMgbm90IGVuZCB3aXRoIEVPQwoAQ2Fubm90IGhhbmRsZSBib3ggc2l6ZXMgaGlnaGVyIHRoYW4gMl4zMgoAb3BqX3BpX25leHRfbHJjcCgpOiBpbnZhbGlkIGNvbXBubzAvY29tcG5vMQoAb3BqX3BpX25leHRfcmxjcCgpOiBpbnZhbGlkIGNvbXBubzAvY29tcG5vMQoAb3BqX3BpX25leHRfY3BybCgpOiBpbnZhbGlkIGNvbXBubzAvY29tcG5vMQoAb3BqX3BpX25leHRfcGNybCgpOiBpbnZhbGlkIGNvbXBubzAvY29tcG5vMQoAb3BqX3BpX25leHRfcnBjbCgpOiBpbnZhbGlkIGNvbXBubzAvY29tcG5vMQoAb3BqX3QxX2RlY29kZV9jYmxrKCk6IHVuc3VwcG9ydGVkIGJwbm9fcGx1c19vbmUgPSAlZCA+PSAzMQoARmFpbGVkIHRvIGRlY29kZSB0aWxlIDEvMQoASW5zdWZmaWNpZW50IGRhdGEgZm9yIENNQVAgYm94LgoATmVlZCB0byByZWFkIGEgUENMUiBib3ggYmVmb3JlIHRoZSBDTUFQIGJveC4KAEluc3VmZmljaWVudCBkYXRhIGZvciBDREVGIGJveC4KAE51bWJlciBvZiBjaGFubmVsIGRlc2NyaXB0aW9uIGlzIGVxdWFsIHRvIHplcm8gaW4gQ0RFRiBib3guCgBTdHJlYW0gZXJyb3Igd2hpbGUgcmVhZGluZyBKUDIgSGVhZGVyIGJveDogbm8gJ2loZHInIGJveC4KAE5vbiBjb25mb3JtYW50IGNvZGVzdHJlYW0gVFBzb3Q9PVROc290LgoAU3RyZWFtIGVycm9yIHdoaWxlIHJlYWRpbmcgSlAyIEhlYWRlciBib3g6IGJveCBsZW5ndGggaXMgaW5jb25zaXN0ZW50LgoAQm94IGxlbmd0aCBpcyBpbmNvbnNpc3RlbnQuCgBSZXNvbHV0aW9uIGZhY3RvciBpcyBncmVhdGVyIHRoYW4gdGhlIG1heGltdW0gcmVzb2x1dGlvbiBpbiB0aGUgY29tcG9uZW50LgoAQ29tcG9uZW50IG1hcHBpbmcgc2VlbXMgd3JvbmcuIFRyeWluZyB0byBjb3JyZWN0LgoASW5jb21wbGV0ZSBjaGFubmVsIGRlZmluaXRpb25zLgoATWFsZm9ybWVkIEhUIGNvZGVibG9jay4gSW52YWxpZCBjb2RlYmxvY2sgbGVuZ3RoIHZhbHVlcy4KAFdlIGRvIG5vdCBzdXBwb3J0IG1vcmUgdGhhbiAzIGNvZGluZyBwYXNzZXMgaW4gYW4gSFQgY29kZWJsb2NrOyBUaGlzIGNvZGVibG9ja3MgaGFzICVkIHBhc3Nlcy4KAE1hbGZvcm1lZCBIVCBjb2RlYmxvY2suIERlY29kaW5nIHRoaXMgY29kZWJsb2NrIGlzIHN0b3BwZWQuIFRoZXJlIGFyZSAlZCB6ZXJvIGJpdHBsYW5lcyBpbiAlZCBiaXRwbGFuZXMuCgBDYW5ub3QgdGFrZSBpbiBjaGFyZ2UgbXVsdGlwbGUgdHJhbnNmb3JtYXRpb24gc3RhZ2VzLgoAVW5rbm93biBtYXJrZXIgaGFzIGJlZW4gZGV0ZWN0ZWQgYW5kIGdlbmVyYXRlZCBlcnJvci4KAENvZGVjIHByb3ZpZGVkIHRvIHRoZSBvcGpfc2V0dXBfZGVjb2RlciBmdW5jdGlvbiBpcyBub3QgYSBkZWNvbXByZXNzb3IgaGFuZGxlci4KAENvZGVjIHByb3ZpZGVkIHRvIHRoZSBvcGpfcmVhZF9oZWFkZXIgZnVuY3Rpb24gaXMgbm90IGEgZGVjb21wcmVzc29yIGhhbmRsZXIuCgBUaWxlcyBkb24ndCBhbGwgaGF2ZSB0aGUgc2FtZSBkaW1lbnNpb24uIFNraXAgdGhlIE1DVCBzdGVwLgoATnVtYmVyIG9mIGNvbXBvbmVudHMgKCVkKSBpcyBpbmNvbnNpc3RlbnQgd2l0aCBhIE1DVC4gU2tpcCB0aGUgTUNUIHN0ZXAuCgBKUDIgYm94IHdoaWNoIGFyZSBhZnRlciB0aGUgY29kZXN0cmVhbSB3aWxsIG5vdCBiZSByZWFkIGJ5IHRoaXMgZnVuY3Rpb24uCgBNYWxmb3JtZWQgSFQgY29kZWJsb2NrLiBXaGVuIHRoZSBudW1iZXIgb2YgemVybyBwbGFuZXMgYml0cGxhbmVzIGlzIGVxdWFsIHRvIHRoZSBudW1iZXIgb2YgYml0cGxhbmVzLCBvbmx5IHRoZSBjbGVhbnVwIHBhc3MgbWFrZXMgc2Vuc2UsIGJ1dCB3ZSBoYXZlICVkIHBhc3NlcyBpbiB0aGlzIGNvZGVibG9jay4gVGhlcmVmb3JlLCBvbmx5IHRoZSBjbGVhbnVwIHBhc3Mgd2lsbCBiZSBkZWNvZGVkLiBUaGlzIG1lc3NhZ2Ugd2lsbCBub3QgYmUgZGlzcGxheWVkIGFnYWluLgoASW1hZ2UgaGFzIGxlc3MgY29tcG9uZW50cyB0aGFuIGNvZGVzdHJlYW0uCgBOZWVkIHRvIGRlY29kZSB0aGUgbWFpbiBoZWFkZXIgYmVmb3JlIGJlZ2luIHRvIGRlY29kZSB0aGUgcmVtYWluaW5nIGNvZGVzdHJlYW0uCgBQc290IHZhbHVlIG9mIHRoZSBjdXJyZW50IHRpbGUtcGFydCBpcyBlcXVhbCB0byB6ZXJvLCB3ZSBhc3N1bWluZyBpdCBpcyB0aGUgbGFzdCB0aWxlLXBhcnQgb2YgdGhlIGNvZGVzdHJlYW0uCgBBIG1hbGZvcm1lZCBjb2RlYmxvY2sgdGhhdCBoYXMgbW9yZSB0aGFuIG9uZSBjb2RpbmcgcGFzcywgYnV0IHplcm8gbGVuZ3RoIGZvciAybmQgYW5kIHBvdGVudGlhbGx5IHRoZSAzcmQgcGFzcyBpbiBhbiBIVCBjb2RlYmxvY2suCgAJCQkgdGlsZS1wYXJ0WyVkXTogc3Rhcl9wb3M9JWxsaSwgZW5kX2hlYWRlcj0lbGxpLCBlbmRfcG9zPSVsbGkuCgBUaWxlICV1IGhhcyBUUHNvdCA9PSAwIGFuZCBUTnNvdCA9PSAwLCBidXQgbm8gb3RoZXIgdGlsZS1wYXJ0cyB3ZXJlIGZvdW5kLiBFT0MgaXMgYWxzbyBtaXNzaW5nLgoAQ29tcG9uZW50ICVkIGRvZXNuJ3QgaGF2ZSBhIG1hcHBpbmcuCgBBIGNvbmZvcm1pbmcgSlAyIHJlYWRlciBzaGFsbCBpZ25vcmUgYWxsIENvbG91ciBTcGVjaWZpY2F0aW9uIGJveGVzIGFmdGVyIHRoZSBmaXJzdCwgc28gd2UgaWdub3JlIHRoaXMgb25lLgoAVGhlIHNpZ25hdHVyZSBib3ggbXVzdCBiZSB0aGUgZmlyc3QgYm94IGluIHRoZSBmaWxlLgoAVGhlICBib3ggbXVzdCBiZSB0aGUgZmlyc3QgYm94IGluIHRoZSBmaWxlLgoAVGhlIGZ0eXAgYm94IG11c3QgYmUgdGhlIHNlY29uZCBib3ggaW4gdGhlIGZpbGUuCgBGYWlsZWQgdG8gZGVjb2RlLgoATWFsZm9ybWVkIEhUIGNvZGVibG9jay4gSW5jb3JyZWN0IE1FTCBzZWdtZW50IHNlcXVlbmNlLgoAQ29tcG9uZW50ICVkIGlzIG1hcHBlZCB0d2ljZS4KAE9ubHkgb25lIENNQVAgYm94IGlzIGFsbG93ZWQuCgBXZSBuZWVkIGFuIGltYWdlIHByZXZpb3VzbHkgY3JlYXRlZC4KAElIRFIgYm94X21pc3NpbmcuIFJlcXVpcmVkLgoASlAySCBib3ggbWlzc2luZy4gUmVxdWlyZWQuCgBOb3Qgc3VyZSBob3cgdGhhdCBoYXBwZW5lZC4KAE1haW4gaGVhZGVyIGhhcyBiZWVuIGNvcnJlY3RseSBkZWNvZGVkLgoAVGlsZSAlZC8lZCBoYXMgYmVlbiBkZWNvZGVkLgoASGVhZGVyIG9mIHRpbGUgJWQgLyAlZCBoYXMgYmVlbiByZWFkLgoARW1wdHkgU09UIG1hcmtlciBkZXRlY3RlZDogUHNvdD0lZC4KAERpcmVjdCB1c2UgYXQgIyVkIGhvd2V2ZXIgcGNvbD0lZC4KAEltcGxlbWVudGF0aW9uIGxpbWl0YXRpb246IGZvciBwYWxldHRlIG1hcHBpbmcsIHBjb2xbJWRdIHNob3VsZCBiZSBlcXVhbCB0byAlZCwgYnV0IGlzIGVxdWFsIHRvICVkLgoASW52YWxpZCBjb21wb25lbnQvcGFsZXR0ZSBpbmRleCBmb3IgZGlyZWN0IG1hcHBpbmcgJWQuCgBJbnZhbGlkIHZhbHVlIGZvciBjbWFwWyVkXS5tdHlwID0gJWQuCgBQc290IHZhbHVlIGlzIG5vdCBjb3JyZWN0IHJlZ2FyZHMgdG8gdGhlIEpQRUcyMDAwIG5vcm06ICVkLgoATWFsZm9ybWVkIEhUIGNvZGVibG9jay4gVkxDIGNvZGUgcHJvZHVjZXMgc2lnbmlmaWNhbnQgc2FtcGxlcyBvdXRzaWRlIHRoZSBjb2RlYmxvY2sgYXJlYS4KAFVuZXhwZWN0ZWQgT09NLgoAMzIgYml0cyBhcmUgbm90IGVub3VnaCB0byBkZWNvZGUgdGhpcyBjb2RlYmxvY2ssIHNpbmNlIHRoZSBudW1iZXIgb2YgYml0cGxhbmUsICVkLCBpcyBsYXJnZXIgdGhhbiAzMC4KAEJvdHRvbSBwb3NpdGlvbiBvZiB0aGUgZGVjb2RlZCBhcmVhIChyZWdpb25feTE9JWQpIHNob3VsZCBiZSA+IDAuCgBSaWdodCBwb3NpdGlvbiBvZiB0aGUgZGVjb2RlZCBhcmVhIChyZWdpb25feDE9JWQpIHNob3VsZCBiZSA+IDAuCgBVcCBwb3NpdGlvbiBvZiB0aGUgZGVjb2RlZCBhcmVhIChyZWdpb25feTA9JWQpIHNob3VsZCBiZSA+PSAwLgoATGVmdCBwb3NpdGlvbiBvZiB0aGUgZGVjb2RlZCBhcmVhIChyZWdpb25feDA9JWQpIHNob3VsZCBiZSA+PSAwLgoARXJyb3IgcmVhZGluZyBQUFQgbWFya2VyOiBwYWNrZXQgaGVhZGVyIGhhdmUgYmVlbiBwcmV2aW91c2x5IGZvdW5kIGluIHRoZSBtYWluIGhlYWRlciAoUFBNIG1hcmtlcikuCgBTdGFydCB0byByZWFkIGoyayBtYWluIGhlYWRlciAoJWxsZCkuCgBCb3R0b20gcG9zaXRpb24gb2YgdGhlIGRlY29kZWQgYXJlYSAocmVnaW9uX3kxPSVkKSBpcyBvdXRzaWRlIHRoZSBpbWFnZSBhcmVhIChZc2l6PSVkKS4KAFVwIHBvc2l0aW9uIG9mIHRoZSBkZWNvZGVkIGFyZWEgKHJlZ2lvbl95MD0lZCkgaXMgb3V0c2lkZSB0aGUgaW1hZ2UgYXJlYSAoWXNpej0lZCkuCgBSaWdodCBwb3NpdGlvbiBvZiB0aGUgZGVjb2RlZCBhcmVhIChyZWdpb25feDE9JWQpIGlzIG91dHNpZGUgdGhlIGltYWdlIGFyZWEgKFhzaXo9JWQpLgoATGVmdCBwb3NpdGlvbiBvZiB0aGUgZGVjb2RlZCBhcmVhIChyZWdpb25feDA9JWQpIGlzIG91dHNpZGUgdGhlIGltYWdlIGFyZWEgKFhzaXo9JWQpLgoAQm90dG9tIHBvc2l0aW9uIG9mIHRoZSBkZWNvZGVkIGFyZWEgKHJlZ2lvbl95MT0lZCkgaXMgb3V0c2lkZSB0aGUgaW1hZ2UgYXJlYSAoWU9zaXo9JWQpLgoAVXAgcG9zaXRpb24gb2YgdGhlIGRlY29kZWQgYXJlYSAocmVnaW9uX3kwPSVkKSBpcyBvdXRzaWRlIHRoZSBpbWFnZSBhcmVhIChZT3Npej0lZCkuCgBSaWdodCBwb3NpdGlvbiBvZiB0aGUgZGVjb2RlZCBhcmVhIChyZWdpb25feDE9JWQpIGlzIG91dHNpZGUgdGhlIGltYWdlIGFyZWEgKFhPc2l6PSVkKS4KAExlZnQgcG9zaXRpb24gb2YgdGhlIGRlY29kZWQgYXJlYSAocmVnaW9uX3gwPSVkKSBpcyBvdXRzaWRlIHRoZSBpbWFnZSBhcmVhIChYT3Npej0lZCkuCgBTaXplIHggb2YgdGhlIGRlY29kZWQgY29tcG9uZW50IGltYWdlIGlzIGluY29ycmVjdCAoY29tcFslZF0udz0lZCkuCgBTaXplIHkgb2YgdGhlIGRlY29kZWQgY29tcG9uZW50IGltYWdlIGlzIGluY29ycmVjdCAoY29tcFslZF0uaD0lZCkuCgBUaWxlIHJlYWQsIGRlY29kZWQgYW5kIHVwZGF0ZWQgaXMgbm90IHRoZSBkZXNpcmVkIG9uZSAoJWQgdnMgJWQpLgoASW52YWxpZCBjb21wb25lbnQgaW5kZXggJWQgKD49ICVkKS4KAG9wal9yZWFkX2hlYWRlcigpIHNob3VsZCBiZSBjYWxsZWQgYmVmb3JlIG9wal9zZXRfZGVjb2RlZF9jb21wb25lbnRzKCkuCgBNZW1vcnkgYWxsb2NhdGlvbiBmYWlsdXJlIGluIG9wal9qcDJfYXBwbHlfcGNscigpLgoAaW1hZ2UtPmNvbXBzWyVkXS5kYXRhID09IE5VTEwgaW4gb3BqX2pwMl9hcHBseV9wY2xyKCkuCgBpbnZhbGlkIGJveCBzaXplICVkICgleCkKAEZhaWwgdG8gcmVhZCB0aGUgY3VycmVudCBtYXJrZXIgc2VnbWVudCAoJSN4KQoARXJyb3Igd2l0aCBTSVogbWFya2VyOiBJSERSIHcoJXUpIGgoJXUpIHZzLiBTSVogdygldSkgaCgldSkKAEVycm9yIHJlYWRpbmcgQ09DIG1hcmtlciAoYmFkIG51bWJlciBvZiBjb21wb25lbnRzKQoASW52YWxpZCBudW1iZXIgb2YgdGlsZXMgOiAldSB4ICV1IChtYXhpbXVtIGZpeGVkIGJ5IGpwZWcyMDAwIG5vcm0gaXMgNjU1MzUgdGlsZXMpCgBJbnZhbGlkIG51bWJlciBvZiBjb21wb25lbnRzIChpaGRyKQoATm90IGVub3VnaCBtZW1vcnkgdG8gaGFuZGxlIGltYWdlIGhlYWRlciAoaWhkcikKAFdyb25nIHZhbHVlcyBmb3I6IHcoJWQpIGgoJWQpIG51bWNvbXBzKCVkKSAoaWhkcikKAEludmFsaWQgdmFsdWVzIGZvciBjb21wID0gJWQgOiBkeD0ldSBkeT0ldSAoc2hvdWxkIGJlIGJldHdlZW4gMSBhbmQgMjU1IGFjY29yZGluZyB0byB0aGUgSlBFRzIwMDAgbm9ybSkKAEJhZCBpbWFnZSBoZWFkZXIgYm94IChiYWQgc2l6ZSkKAEJhZCBDT0xSIGhlYWRlciBib3ggKGJhZCBzaXplKQoAQmFkIEJQQ0MgaGVhZGVyIGJveCAoYmFkIHNpemUpCgBFcnJvciB3aXRoIFNJWiBtYXJrZXI6IG5lZ2F0aXZlIG9yIHplcm8gaW1hZ2Ugc2l6ZSAoJWxsZCB4ICVsbGQpCgBza2lwOiBzZWdtZW50IHRvbyBsb25nICglZCkgd2l0aCBtYXggKCVkKSBmb3IgY29kZWJsb2NrICVkIChwPSVkLCBiPSVkLCByPSVkLCBjPSVkKQoAcmVhZDogc2VnbWVudCB0b28gbG9uZyAoJWQpIHdpdGggbWF4ICglZCkgZm9yIGNvZGVibG9jayAlZCAocD0lZCwgYj0lZCwgcj0lZCwgYz0lZCkKAERlc3BpdGUgSlAyIEJQQyE9MjU1LCBwcmVjaXNpb24gYW5kL29yIHNnbmQgdmFsdWVzIGZvciBjb21wWyVkXSBpcyBkaWZmZXJlbnQgdGhhbiBjb21wWzBdOgogICAgICAgIFswXSBwcmVjKCVkKSBzZ25kKCVkKSBbJWRdIHByZWMoJWQpIHNnbmQoJWQpCgBiYWQgY29tcG9uZW50IG51bWJlciBpbiBSR04gKCVkIHdoZW4gdGhlcmUgYXJlIG9ubHkgJWQpCgBFcnJvciB3aXRoIFNJWiBtYXJrZXI6IG51bWJlciBvZiBjb21wb25lbnQgaXMgbm90IGNvbXBhdGlibGUgd2l0aCB0aGUgcmVtYWluaW5nIG51bWJlciBvZiBwYXJhbWV0ZXJzICggJWQgdnMgJWQpCgBFcnJvciB3aXRoIFNJWiBtYXJrZXI6IGludmFsaWQgdGlsZSBzaXplICh0ZHg6ICVkLCB0ZHk6ICVkKQoAQmFkIENPTFIgaGVhZGVyIGJveCAoYmFkIHNpemU6ICVkKQoAQmFkIENPTFIgaGVhZGVyIGJveCAoQ0lFTGFiLCBiYWQgc2l6ZTogJWQpCgBQVEVSTSBjaGVjayBmYWlsdXJlOiAlZCByZW1haW5pbmcgYnl0ZXMgaW4gY29kZSBibG9jayAoJWQgdXNlZCAvICVkKQoATWFsZm9ybWVkIEhUIGNvZGVibG9jay4gT25lIG9mIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uIGlzIG5vdCBtZXQ6IDIgPD0gU2N1cCA8PSBtaW4oTGN1cCwgNDA3OSkKAEludmFsaWQgdmFsdWVzIGZvciBjb21wID0gJWQgOiBwcmVjPSV1IChzaG91bGQgYmUgYmV0d2VlbiAxIGFuZCAzOCBhY2NvcmRpbmcgdG8gdGhlIEpQRUcyMDAwIG5vcm0uIE9wZW5KcGVnIG9ubHkgc3VwcG9ydHMgdXAgdG8gMzEpCgBJbnZhbGlkIGJpdCBudW1iZXIgJWQgaW4gb3BqX3QyX3JlYWRfcGFja2V0X2hlYWRlcigpCgBTdHJlYW0gZXJyb3IhCgBFcnJvciBvbiB3cml0aW5nIHN0cmVhbSEKAFN0cmVhbSByZWFjaGVkIGl0cyBlbmQgIQoARXhwZWN0ZWQgYSBTT0MgbWFya2VyIAoASW52YWxpZCBib3ggc2l6ZSAlZCBmb3IgYm94ICclYyVjJWMlYycuIE5lZWQgJWQgYnl0ZXMsICVkIGJ5dGVzIHJlbWFpbmluZyAKAE1hbGZvcm1lZCBIVCBjb2RlYmxvY2suIERlY29kaW5nIHRoaXMgY29kZWJsb2NrIGlzIHN0b3BwZWQuIFVfcSBpcyBsYXJnZXIgdGhhbiB6ZXJvIGJpdHBsYW5lcyArIDEgCgBNYWxmb3JtZWQgSFQgY29kZWJsb2NrLiBEZWNvZGluZyB0aGlzIGNvZGVibG9jayBpcyBzdG9wcGVkLiBVX3EgaXNsYXJnZXIgdGhhbiBiaXRwbGFuZXMgKyAxIAoAQ09MUiBCT1ggbWV0aCB2YWx1ZSBpcyBub3QgYSByZWd1bGFyIHZhbHVlICglZCksIHNvIHdlIHdpbGwgaWdub3JlIHRoZSBlbnRpcmUgQ29sb3VyIFNwZWNpZmljYXRpb24gYm94LiAKAFdoaWxlIHJlYWRpbmcgQ0NQX1FOVFNUWSBlbGVtZW50IGluc2lkZSBRQ0Qgb3IgUUNDIG1hcmtlciBzZWdtZW50LCBudW1iZXIgb2Ygc3ViYmFuZHMgKCVkKSBpcyBncmVhdGVyIHRvIE9QSl9KMktfTUFYQkFORFMgKCVkKS4gU28gd2UgbGltaXQgdGhlIG51bWJlciBvZiBlbGVtZW50cyBzdG9yZWQgdG8gT1BKX0oyS19NQVhCQU5EUyAoJWQpIGFuZCBza2lwIHRoZSByZXN0LiAKAEpQMiBJSERSIGJveDogY29tcHJlc3Npb24gdHlwZSBpbmRpY2F0ZSB0aGF0IHRoZSBmaWxlIGlzIG5vdCBhIGNvbmZvcm1pbmcgSlAyIGZpbGUgKCVkKSAKAFRpbGUgaW5kZXggcHJvdmlkZWQgYnkgdGhlIHVzZXIgaXMgaW5jb3JyZWN0ICVkIChtYXggPSAlZCkgCgBFcnJvciBkZWNvZGluZyBjb21wb25lbnQgJWQuClRoZSBudW1iZXIgb2YgcmVzb2x1dGlvbnMgdG8gcmVtb3ZlICglZCkgaXMgZ3JlYXRlciBvciBlcXVhbCB0aGFuIHRoZSBudW1iZXIgb2YgcmVzb2x1dGlvbnMgb2YgdGhpcyBjb21wb25lbnQg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AAABVAAAAQAAAABQAADAUAAAAUgAAAAAAAAQUAAAsFAAAAFIAAABAAAAIFAAAMBQAAABOAAAAAAAADBQAACwUAAAATgAAAEAAABAUAAAwFAAAAEwAAAAAAAAUFAAABBRAAABMAAAAQAAAGBQAAAgUQAAASQAAAAAAABwUAAAMFEAAAEkAAABAAAAgFAAAEBRAAABHAAAAAAAAJBQAABwUQAAARwAAAEAAACgUAAAgFEAAAEWAAAAAAAAkFIAAJBRAAABFgAAAQAAAKBSAACgUQAAAVYAAAAAAADQUAAAwFAAAAFWAAABAAAA4FAAALBQAAABVAAAAAAAAPBQAACwUAAAAVQAAAEAAAAAUQAAwFAAAAFRAAAAAAAAEFEAANBQAAABUQAAAQAAACBRAADgUAAAAUgAAAAAAAAwUQAA8FAAAAFIAAABAAAAQFEAAABRAAABOAAAAAAAAFBRAAAQUQAAATgAAAEAAABgUQAAIFEAAAE0AAAAAAAAcFEAADBRAAABNAAAAQAAAIBRAABAUQAAATAAAAAAAACQUQAAUFEAAAEwAAABAAAAoFEAAGBRAAABKAAAAAAAALBRAABQUQAAASgAAAEAAADAUQAAYFEAAAEkAAAAAAAA0FEAAHBRAAABJAAAAQAAAOBRAACAUQAAASIAAAAAAADwUQAAkFEAAAEiAAABAAAAAFIAAKBRAAABHAAAAAAAABBSAACwUQAAARwAAAEAAAAgUgAAwFEAAAEYAAAAAAAAMFIAANBRAAABGAAAAQAAAEBSAADgUQAAARYAAAAAAABQUgAA8FEAAAEWAAABAAAAYFIAAABSAAABFAAAAAAAAHBSAAAQUgAAARQAAAEAAACAUgAAIFIAAAESAAAAAAAAkFIAADBSAAABEgAAAQAAAKBSAABAUgAAAREAAAAAAACwUgAAUFIAAAERAAABAAAAwFIAAGBSAADBCgAAAAAAANBSAABwUgAAwQoAAAEAAADgUgAAgFIAAMEJAAAAAAAA8FIAAJBSAADBCQAAAQAAAABTAACgUgAAoQgAAAAAAAAQUwAAsFIAAKEIAAABAAAAIFMAAMBSAAAhBQAAAAAAADBTAADQUgAAIQUAAAEAAABAUwAA4FIAAEEEAAAAAAAAUFMAAPBSAABBBAAAAQAAAGBTAAAAUwAAoQIAAAAAAABwUwAAEFMAAKECAAABAAAAgFMAACBTAAAhAgAAAAAAAJBTAAAwUwAAIQIAAAEAAACgUwAAQFMAAEEBAAAAAAAAsFMAAFBTAABBAQAAAQAAAMBTAABgUwAAEQEAAAAAAADQUwAAcFMAABEBAAABAAAA4FMAAIBTAACFAAAAAAAAAPBTAACQUwAAhQAAAAEAAAAAVAAAoFMAAEkAAAAAAAAAEFQAALBTAABJAAAAAQAAACBUAADAUwAAJQAAAAAAAAAwVAAA0FMAACUAAAABAAAAQFQAAOBTAAAVAAAAAAAAAFBUAADwUwAAFQAAAAEAAABgVAAAAFQAAAkAAAAAAAAAcFQAABBUAAAJAAAAAQAAAIBUAAAgVAAABQAAAAAAAACQVAAAMFQAAAUAAAABAAAAoFQAAEBUAAABAAAAAAAAAJBUAABQVAAAAQAAAAEAAACgVAAAYFQAAAFWAAAAAAAAsFQAALBUAAABVgAAAQAAAMBUAADAVAAAAAEDAwECAwMFBgcHBgYHBwABAwMBAgMDBQYHBwYGBwcFBgcHBgYHBwgICAgICAgIBQYHBwYGBwcICAgICAgICAECAwMCAgMDBgYHBwYGBwcBAgMDAgIDAwYGBwcGBgcHBgYHBwYGBwcICAgICAgICAYGBwcGBgcHCAgICAgICAgDAwQEAwMEBAcHBwcHBwcHAwMEBAMDBAQHBwcHBwcHBwcHBwcHBwcHCAgICAgICAgHBwcHBwcHBwgICAgICAgIAwMEBAMDBAQHBwcHBwcHBwMDBAQDAwQEBwcHBwcHBwcHBwcHBwcHBwgICAgICAgIBwcHBwcHBwcICAgICAgICAECAwMCAgMDBgYHBwYGBwcBAgMDAgIDAwYGBwcGBgcHBgYHBwYGBwcICAgICAgICAYGBwcGBgcHCAgICAgICAgCAgMDAgIDAwYGBwcGBgcHAgIDAwICAwMGBgcHBgYHBwYGBwcGBgcHCAgICAgICAgGBgcHBgYHBwgICAgICAgIAwMEBAMDBAQHBwcHBwcHBwMDBAQDAwQEBwcHBwcHBwcHBwcHBwcHBwgICAgICAgIBwcHBwcHBwcICAgICAgICAMDBAQDAwQEBwcHBwcHBwcDAwQEAwMEBAcHBwcHBwcHBwcHBwcHBwcICAgICAgICAcHBwcHBwcHCAgICAgICAgAAQUGAQIGBgMDBwcDAwcHAAEFBgECBgYDAwcHAwMHBwMDBwcDAwcHBAQHBwQEBwcDAwcHAwMHBwQEBwcEBAcHAQIGBgICBgYDAwcHAwMHBwECBgYCAgYGAwMHBwMDBwcDAwcHAwMHBwQEBwcEBAcHAwMHBwMDBwcEBAcHBAQHBwUGCAgGBggIBwcICAcHCAgFBggIBgYICAcHCAgHBwgIBwcICAcHCAgHBwgIBwcICAcHCAgHBwgIBwcICAcHCAgGBggIBgYICAcHCAgHBwgIBgYICAYGCAgHBwgIBwcICAcHCAgHBwgIBwcICAcHCAgHBwgIBwcICAcHCAgHBwgIAQIGBgICBgYDAwcHAwMHBwECBgYCAgYGAwMHBwMDBwcDAwcHAwMHBwQEBwcEBAcHAwMHBwMDBwcEBAcHBAQHBwICBgYCAgYGAwMHBwMDBwcCAgYGAgIGBgMDBwcDAwcHAwMHBwMDBwcEBAcHBAQHBwMDBwcDAwcHBAQHBwQEBwcGBggIBgYICAcHCAgHBwgIBgYICAYGCAgHBwgIBwcICAcHCAgHBwgIBwcICAcHCAgHBwgIBwcICAcHCAgHBwgIBgYICAYGCAgHBwgIBwcICAYGCAgGBggIBwcICAcHCAgHBwgIBwcICAcHCAgHBwgIBwcICAcHCAgHBwgIBwcICAABAwMBAgMDBQYHBwYGBwcAAQMDAQIDAwUGBwcGBgcHBQYHBwYGBwcICAgICAgICAUGBwcGBgcHCAgICAgICAgBAgMDAgIDAwYGBwcGBgcHAQIDAwICAwMGBgcHBgYHBwYGBwcGBgcHCAgICAgICAgGBgcHBgYHBwgICAgICAgIAwMEBAMDBAQHBwcHBwcHBwMDBAQDAwQEBwcHBwcHBwcHBwcHBwcHBwgICAgICAgIBwcHBwcHBwcICAgICAgICAMDBAQDAwQEBwcHBwcHBwcDAwQEAwMEBAcHBwcHBwcHBwcHBwcHBwcICAgICAgICAcHBwcHBwcHCAgICAgICAgBAgMDAgIDAwYGBwcGBgcHAQIDAwICAwMGBgcHBgYHBwYGBwcGBgcHCAgICAgICAgGBgcHBgYHBwgICAgICAgIAgIDAwICAwMGBgcHBgYHBwICAwMCAgMDBgYHBwYGBwcGBgcHBgYHBwgICAgICAgIBgYHBwYGBwcICAgICAgICAMDBAQDAwQEBwcHBwcHBwcDAwQEAwMEBAcHBwcHBwcHBwcHBwcHBwcICAgICAgICAcHBwcHBwcHCAgICAgICAgDAwQEAwMEBAcHBwcHBwcHAwMEBAMDBAQHBwcHBwcHBwcHBwcHBwcHCAgICAgICAgHBwcHBwcHBwgICAgICAgIAAMBBAMGBAcBBAIFBAcFBwADAQQDBgQHAQQCBQQHBQcBBAIFBAcFBwIFAgUFBwUHAQQCBQQHBQcCBQIFBQcFBwMGBAcGCAcIBAcFBwcIBwgDBgQHBggHCAQHBQcHCAcIBAcFBwcIBwgFBwUHBwgHCAQHBQcHCAcIBQcFBwcIBwgBBAIFBAcFBwIFAgUFBwUHAQQCBQQHBQcCBQIFBQcFBwIFAgUFBwUHAgUCBQUHBQcCBQIFBQcFBwIFAgUFBwUHBAcFBwcIBwgFBwUHBwgHCAQHBQcHCAcIBQcFBwcIBwgFBwUHBwgHCAUHBQcHCAcIBQcFBwcIBwgFBwUHBwgHCAMGBAcGCAcIBAcFBwcIBwgDBgQHBggHCAQHBQcHCAcIBAcFBwcIBwgFBwUHBwgHCAQHBQcHCAcIBQcFBwcIBwgGCAcICAgICAcIBwgICAgIBggHCAgICAgHCAcICAgICAcIBwgICAgIBwgHCAgICAgHCAcICAgICAcIBwgICAgIBAcFBwcIBwgFBwUHBwgHCAQHBQcHCAcIBQcFBwcIBwgFBwUHBwgHCAUHBQcHCAcIBQcFBwcIBwgFBwUHBwgHCAcIBwgICAgIBwgHCAgICAgHCAcICAgICAcIBwgICAgIBwgHCAgICAgHCAcICAgICAcIBwgICAgIBwgHCAgICAgJCQoKCQkKCgwMDQsMDA0LCQkKCgkJCgoMDAsNDAwLDQwMDQ0MDAsLDAkNCgkMCgsMDAsLDAwNDQwJCwoJDAoNCQkKCgkJCgoMDA0LDAwNCwkJCgoJCQoKDAwLDQwMCw0MDA0NDAwLCwwJDQoJDAoLDAwLCwwMDQ0MCQsKCQwKDQoKCgoKCgoKDQsNCw0LDQsKCgkJCgoJCQ0LDAwNCwwMDQ0NDQsLCwsNCg0KCgsKCw0NDAwLCwwMDQoMCQoLCQwKCgkJCgoJCQsNDAwLDQwMCgoKCgoKCgoLDQsNCw0LDQsLDAwNDQwMCwoMCQoNCQwLCwsLDQ0NDQsKCwoKDQoNAEHZuwELNwEAAQABAAEAAAEBAAABAQABAAEAAQABAAAAAAEBAQEAAAAAAAEAAQAAAAABAQEBAAAAAQABAQEAQZm8AQs3AQABAAEAAQAAAQEAAAEBAAEAAQABAAEAAAAAAQEBAQAAAAAAAQABAAAAAAEBAQEAAAABAAEBAQBB2bwBCwcBAAEAAQABAEHpvAELlQIBAAEAAQABAAAAAAEBAQEAAAAAAAEAAQAAAAABAQEBAAAAAAABAAEBAQAAAQEAAAABAAEAAQABAQEBAQEBAQEAAQABAAEAAQAAAAABAQEBAAEAAAEBAAEAAAAAAQEBAQABAAEBAQEBAgAAAAQAAAAEAAAACAAAAJD/AAAMAAAAGAAAAFL/AAAUAAAAGQAAAFP/AAAUAAAAGgAAAF7/AAAUAAAAGwAAAFz/AAAUAAAAHAAAAF3/AAAUAAAAHQAAAF//AAAUAAAAHgAAAFH/AAACAAAAHwAAAFX/AAAEAAAAIAAAAFf/AAAEAAAAIQAAAFj/AAAQAAAAIgAAAGD/AAAEAAAAIwAAAGH/AAAQAAAAJAAAAJH/AEGIvwELZWP/AAAEAAAAJQAAAGT/AAAUAAAAJgAAAHT/AAAUAAAAJwAAAHj/AAAEAAAAKAAAAFD/AAAEAAAAKQAAAFn/AAAEAAAAKgAAAHX/AAAUAAAAKwAAAHf/AAAUAAAALAAAAAAAAAAUAEGAwAELNS0AAAAuAAAALwAAADAAAAAxAAAAMgAAADMAAAA0AAAAICBQajYAAABweXRmNwAAAGgycGo4AEHAwAELMnJkaGk5AAAAcmxvYzoAAABjY3BiOwAAAHJsY3A8AAAAcGFtYz0AAABmZWRjPgAAAPhiAEGAwQELQRkACwAZGRkAAAAABQAAAAAAAAkAAAAACwAAAAAAAAAAGQAKChkZGQMKBwABAAkLGAAACQYLAAALAAYZAAAAGRkZAEHRwQELIQ4AAAAAAAAAABkACw0ZGRkADQAAAgAJDgAAAAkADgAADgBBi8IBCwEMAEGXwgELFRMAAAAAEwAAAAAJDAAAAAAADAAADABBxcIBCwEQAEHRwgELFQ8AAAAEDwAAAAAJEAAAAAAAEAAAEABB/8IBCwESAEGLwwELHhEAAAAAEQAAAAAJEgAAAAAAEgAAEgAAGgAAABoaGgBBwsMBCw4aAAAAGhoaAAAAAAAACQBB88MBCwEUAEH/wwELFRcAAAAAFwAAAAAJFAAAAAAAFAAAFABBrcQBCwEWAEG5xAELJxUAAAAAFQAAAAAJFgAAAAAAFgAAFgAAMDEyMzQ1Njc4OUFCQ0RFRgBB4MQBCwmQbAEAAAAAAAUAQfTEAQsBaQBBjMUBCwpqAAAAawAAAHhoAEGkxQELAQIAQbTFAQsI//////////8AQfjFAQsBBQBBhMYBCwFsAEGcxgELDmoAAABtAAAAiGgAAAAEAEG0xgELAQEAQcTGAQsF/////wo=";
      return f;
    }
    var wasmBinaryFile;
    function getBinarySync(file) {
      if (file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary);
      }
      var binary = tryParseAsDataURI(file);
      if (binary) {
        return binary;
      }
      if (readBinary) {
        return readBinary(file);
      }
      throw 'sync fetching of the wasm failed: you can preload it to Module["wasmBinary"] manually, or emcc.py will do that for you when generating HTML (but not JS)';
    }
    function instantiateSync(file, info) {
      var module;
      var binary = getBinarySync(file);
      module = new WebAssembly.Module(binary);
      var instance = new WebAssembly.Instance(module, info);
      return [instance, module];
    }
    function getWasmImports() {
      return {
        a: wasmImports
      };
    }
    function createWasm() {
      var info = getWasmImports();
      function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmMemory = wasmExports["p"];
        updateMemoryViews();
        addOnInit(wasmExports["q"]);
        removeRunDependency("wasm-instantiate");
        return wasmExports;
      }
      addRunDependency("wasm-instantiate");
      if (Module["instantiateWasm"]) {
        try {
          return Module["instantiateWasm"](info, receiveInstance);
        } catch (e) {
          err(`Module.instantiateWasm callback failed with error: ${e}`);
          readyPromiseReject(e);
        }
      }
      if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
      var result = instantiateSync(wasmBinaryFile, info);
      return receiveInstance(result[0]);
    }
    var callRuntimeCallbacks = callbacks => {
      while (callbacks.length > 0) {
        callbacks.shift()(Module);
      }
    };
    var noExitRuntime = Module["noExitRuntime"] || true;
    var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
    function _copy_pixels_1(compG_ptr, nb_pixels) {
      compG_ptr >>= 2;
      const imageData = Module.imageData = new Uint8ClampedArray(nb_pixels);
      const compG = Module.HEAP32.subarray(compG_ptr, compG_ptr + nb_pixels);
      imageData.set(compG);
    }
    function _copy_pixels_3(compR_ptr, compG_ptr, compB_ptr, nb_pixels) {
      compR_ptr >>= 2;
      compG_ptr >>= 2;
      compB_ptr >>= 2;
      const imageData = Module.imageData = new Uint8ClampedArray(nb_pixels * 3);
      const compR = Module.HEAP32.subarray(compR_ptr, compR_ptr + nb_pixels);
      const compG = Module.HEAP32.subarray(compG_ptr, compG_ptr + nb_pixels);
      const compB = Module.HEAP32.subarray(compB_ptr, compB_ptr + nb_pixels);
      for (let i = 0; i < nb_pixels; i++) {
        imageData[3 * i] = compR[i];
        imageData[3 * i + 1] = compG[i];
        imageData[3 * i + 2] = compB[i];
      }
    }
    function _copy_pixels_4(compR_ptr, compG_ptr, compB_ptr, compA_ptr, nb_pixels) {
      compR_ptr >>= 2;
      compG_ptr >>= 2;
      compB_ptr >>= 2;
      compA_ptr >>= 2;
      const imageData = Module.imageData = new Uint8ClampedArray(nb_pixels * 4);
      const compR = Module.HEAP32.subarray(compR_ptr, compR_ptr + nb_pixels);
      const compG = Module.HEAP32.subarray(compG_ptr, compG_ptr + nb_pixels);
      const compB = Module.HEAP32.subarray(compB_ptr, compB_ptr + nb_pixels);
      const compA = Module.HEAP32.subarray(compA_ptr, compA_ptr + nb_pixels);
      for (let i = 0; i < nb_pixels; i++) {
        imageData[4 * i] = compR[i];
        imageData[4 * i + 1] = compG[i];
        imageData[4 * i + 2] = compB[i];
        imageData[4 * i + 3] = compA[i];
      }
    }
    var getHeapMax = () => 2147483648;
    var growMemory = size => {
      var b = wasmMemory.buffer;
      var pages = (size - b.byteLength + 65535) / 65536;
      try {
        wasmMemory.grow(pages);
        updateMemoryViews();
        return 1;
      } catch (e) {}
    };
    var _emscripten_resize_heap = requestedSize => {
      var oldSize = HEAPU8.length;
      requestedSize >>>= 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = growMemory(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    };
    var ENV = {};
    var getExecutableName = () => thisProgram || "./this.program";
    var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        var env = {
          USER: "web_user",
          LOGNAME: "web_user",
          PATH: "/",
          PWD: "/",
          HOME: "/home/web_user",
          LANG: lang,
          _: getExecutableName()
        };
        for (var x in ENV) {
          if (ENV[x] === undefined) delete env[x];else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
    var stringToAscii = (str, buffer) => {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++] = str.charCodeAt(i);
      }
      HEAP8[buffer] = 0;
    };
    var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[__environ + i * 4 >> 2] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    };
    var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach(string => bufSize += string.length + 1);
      HEAPU32[penviron_buf_size >> 2] = bufSize;
      return 0;
    };
    var _fd_close = fd => 52;
    var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      return 70;
    }
    var printCharBuffers = [null, [], []];
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
    var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = "";
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode((u0 & 31) << 6 | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = (u0 & 15) << 12 | u1 << 6 | u2;
        } else {
          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        }
      }
      return str;
    };
    var printChar = (stream, curr) => {
      var buffer = printCharBuffers[stream];
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    };
    var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    var _fd_write = (fd, iov, iovcnt, pnum) => {
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr + j]);
        }
        num += len;
      }
      HEAPU32[pnum >> 2] = num;
      return 0;
    };
    function _gray_to_rgba(compG_ptr, nb_pixels) {
      compG_ptr >>= 2;
      const imageData = Module.imageData = new Uint8ClampedArray(nb_pixels * 4);
      const compG = Module.HEAP32.subarray(compG_ptr, compG_ptr + nb_pixels);
      for (let i = 0; i < nb_pixels; i++) {
        imageData[4 * i] = imageData[4 * i + 1] = imageData[4 * i + 2] = compG[i];
        imageData[4 * i + 3] = 255;
      }
    }
    function _graya_to_rgba(compG_ptr, compA_ptr, nb_pixels) {
      compG_ptr >>= 2;
      compA_ptr >>= 2;
      const imageData = Module.imageData = new Uint8ClampedArray(nb_pixels * 4);
      const compG = Module.HEAP32.subarray(compG_ptr, compG_ptr + nb_pixels);
      const compA = Module.HEAP32.subarray(compA_ptr, compA_ptr + nb_pixels);
      for (let i = 0; i < nb_pixels; i++) {
        imageData[4 * i] = imageData[4 * i + 1] = imageData[4 * i + 2] = compG[i];
        imageData[4 * i + 3] = compA[i];
      }
    }
    function _jsPrintWarning(message_ptr) {
      const message = UTF8ToString(message_ptr);
      (Module.warn || console.warn)(`OpenJPEG: ${message}`);
    }
    function _rgb_to_rgba(compR_ptr, compG_ptr, compB_ptr, nb_pixels) {
      compR_ptr >>= 2;
      compG_ptr >>= 2;
      compB_ptr >>= 2;
      const imageData = Module.imageData = new Uint8ClampedArray(nb_pixels * 4);
      const compR = Module.HEAP32.subarray(compR_ptr, compR_ptr + nb_pixels);
      const compG = Module.HEAP32.subarray(compG_ptr, compG_ptr + nb_pixels);
      const compB = Module.HEAP32.subarray(compB_ptr, compB_ptr + nb_pixels);
      for (let i = 0; i < nb_pixels; i++) {
        imageData[4 * i] = compR[i];
        imageData[4 * i + 1] = compG[i];
        imageData[4 * i + 2] = compB[i];
        imageData[4 * i + 3] = 255;
      }
    }
    function _storeErrorMessage(message_ptr) {
      const message = UTF8ToString(message_ptr);
      if (!Module.errorMessages) {
        Module.errorMessages = message;
      } else {
        Module.errorMessages += "\n" + message;
      }
    }
    var wasmImports = {
      c: __emscripten_memcpy_js,
      g: _copy_pixels_1,
      f: _copy_pixels_3,
      e: _copy_pixels_4,
      k: _emscripten_resize_heap,
      l: _environ_get,
      m: _environ_sizes_get,
      n: _fd_close,
      j: _fd_seek,
      b: _fd_write,
      o: _gray_to_rgba,
      i: _graya_to_rgba,
      d: _jsPrintWarning,
      h: _rgb_to_rgba,
      a: _storeErrorMessage
    };
    var wasmExports = createWasm();
    var ___wasm_call_ctors = wasmExports["q"];
    var _malloc = Module["_malloc"] = wasmExports["r"];
    var _free = Module["_free"] = wasmExports["s"];
    var _jp2_decode = Module["_jp2_decode"] = wasmExports["u"];
    var calledRun;
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function run() {
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        readyPromiseResolve(Module);
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        postRun();
      }
      if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function () {
          setTimeout(function () {
            Module["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    if (Module["preInit"]) {
      if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
      while (Module["preInit"].length > 0) {
        Module["preInit"].pop()();
      }
    }
    run();
    moduleRtn = Module;
    return moduleRtn;
  };
})();
/* harmony default export */ const openjpeg = (OpenJPEG);
;// ./src/core/stream.js


class Stream extends base_stream_BaseStream {
  constructor(arrayBuffer, start, length, dict) {
    super();
    this.bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
    this.start = start || 0;
    this.pos = this.start;
    this.end = start + length || this.bytes.length;
    this.dict = dict;
  }
  get length() {
    return this.end - this.start;
  }
  get isEmpty() {
    return this.length === 0;
  }
  getByte() {
    if (this.pos >= this.end) {
      return -1;
    }
    return this.bytes[this.pos++];
  }
  getBytes(length) {
    const bytes = this.bytes;
    const pos = this.pos;
    const strEnd = this.end;
    if (!length) {
      return bytes.subarray(pos, strEnd);
    }
    let end = pos + length;
    if (end > strEnd) {
      end = strEnd;
    }
    this.pos = end;
    return bytes.subarray(pos, end);
  }
  getByteRange(begin, end) {
    if (begin < 0) {
      begin = 0;
    }
    if (end > this.end) {
      end = this.end;
    }
    return this.bytes.subarray(begin, end);
  }
  reset() {
    this.pos = this.start;
  }
  moveStart() {
    this.start = this.pos;
  }
  makeSubStream(start, length, dict = null) {
    return new Stream(this.bytes.buffer, start, length, dict);
  }
}
class StringStream extends Stream {
  constructor(str) {
    super(stringToBytes(str));
  }
}
class NullStream extends Stream {
  constructor() {
    super(new Uint8Array(0));
  }
}

;// ./src/core/jpx.js



class JpxError extends BaseException {
  constructor(msg) {
    super(msg, "JpxError");
  }
}
class JpxImage {
  static #module = null;
  static decode(data, decoderOptions) {
    decoderOptions ||= {};
    this.#module ||= openjpeg({
      warn: util_warn
    });
    const imageData = this.#module.decode(data, decoderOptions);
    if (typeof imageData === "string") {
      throw new JpxError(imageData);
    }
    return imageData;
  }
  static cleanup() {
    this.#module = null;
  }
  static parseImageProperties(stream) {
    if (stream instanceof ArrayBuffer || ArrayBuffer.isView(stream)) {
      stream = new Stream(stream);
    } else {
      throw new JpxError("Invalid data format, must be a TypedArray.");
    }
    let newByte = stream.getByte();
    while (newByte >= 0) {
      const oldByte = newByte;
      newByte = stream.getByte();
      const code = oldByte << 8 | newByte;
      if (code === 0xff51) {
        stream.skip(4);
        const Xsiz = stream.getInt32() >>> 0;
        const Ysiz = stream.getInt32() >>> 0;
        const XOsiz = stream.getInt32() >>> 0;
        const YOsiz = stream.getInt32() >>> 0;
        stream.skip(16);
        const Csiz = stream.getUint16();
        return {
          width: Xsiz - XOsiz,
          height: Ysiz - YOsiz,
          bitsPerComponent: 8,
          componentsCount: Csiz
        };
      }
    }
    throw new JpxError("No size marker found in JPX stream");
  }
}

;// ./src/pdf.image_decoders.js




const pdfjsVersion = "4.8.69";
const pdfjsBuild = "3634dab10";

var __webpack_exports__Jbig2Error = __webpack_exports__.Jbig2Error;
var __webpack_exports__Jbig2Image = __webpack_exports__.Jbig2Image;
var __webpack_exports__JpegError = __webpack_exports__.JpegError;
var __webpack_exports__JpegImage = __webpack_exports__.JpegImage;
var __webpack_exports__JpxError = __webpack_exports__.JpxError;
var __webpack_exports__JpxImage = __webpack_exports__.JpxImage;
var __webpack_exports__VerbosityLevel = __webpack_exports__.VerbosityLevel;
var __webpack_exports__getVerbosityLevel = __webpack_exports__.getVerbosityLevel;
var __webpack_exports__setVerbosityLevel = __webpack_exports__.setVerbosityLevel;
export { __webpack_exports__Jbig2Error as Jbig2Error, __webpack_exports__Jbig2Image as Jbig2Image, __webpack_exports__JpegError as JpegError, __webpack_exports__JpegImage as JpegImage, __webpack_exports__JpxError as JpxError, __webpack_exports__JpxImage as JpxImage, __webpack_exports__VerbosityLevel as VerbosityLevel, __webpack_exports__getVerbosityLevel as getVerbosityLevel, __webpack_exports__setVerbosityLevel as setVerbosityLevel };

//# sourceMappingURL=pdf.image_decoders.mjs.map