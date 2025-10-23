declare const AbortException_base: any;
/**
 * Error used to indicate task cancellation.
 */
export class AbortException extends AbortException_base {
    [x: string]: any;
    constructor(msg: any);
}
export namespace AnnotationActionEventType {
    let E: string;
    let X: string;
    let D: string;
    let U: string;
    let Fo: string;
    let Bl: string;
    let PO: string;
    let PC: string;
    let PV: string;
    let PI: string;
    let K: string;
    let F: string;
    let V: string;
    let C: string;
}
export namespace AnnotationBorderStyleType {
    let SOLID: number;
    let DASHED: number;
    let BEVELED: number;
    let INSET: number;
    let UNDERLINE: number;
}
export namespace AnnotationEditorParamsType {
    let RESIZE: number;
    let CREATE: number;
    let FREETEXT_SIZE: number;
    let FREETEXT_COLOR: number;
    let FREETEXT_OPACITY: number;
    let INK_COLOR: number;
    let INK_THICKNESS: number;
    let INK_OPACITY: number;
    let HIGHLIGHT_COLOR: number;
    let HIGHLIGHT_DEFAULT_COLOR: number;
    let HIGHLIGHT_THICKNESS: number;
    let HIGHLIGHT_FREE: number;
    let HIGHLIGHT_SHOW_ALL: number;
}
export const AnnotationEditorPrefix: "pdfjs_internal_editor_";
export namespace AnnotationEditorType {
    let DISABLE: number;
    let NONE: number;
    let FREETEXT: number;
    let HIGHLIGHT: number;
    let STAMP: number;
    let INK: number;
}
export namespace AnnotationFieldFlag {
    let READONLY: number;
    let REQUIRED: number;
    let NOEXPORT: number;
    let MULTILINE: number;
    let PASSWORD: number;
    let NOTOGGLETOOFF: number;
    let RADIO: number;
    let PUSHBUTTON: number;
    let COMBO: number;
    let EDIT: number;
    let SORT: number;
    let FILESELECT: number;
    let MULTISELECT: number;
    let DONOTSPELLCHECK: number;
    let DONOTSCROLL: number;
    let COMB: number;
    let RICHTEXT: number;
    let RADIOSINUNISON: number;
    let COMMITONSELCHANGE: number;
}
export namespace AnnotationFlag {
    export let INVISIBLE: number;
    export let HIDDEN: number;
    export let PRINT: number;
    export let NOZOOM: number;
    export let NOROTATE: number;
    export let NOVIEW: number;
    let READONLY_1: number;
    export { READONLY_1 as READONLY };
    export let LOCKED: number;
    export let TOGGLENOVIEW: number;
    export let LOCKEDCONTENTS: number;
}
export namespace AnnotationMode {
    let DISABLE_1: number;
    export { DISABLE_1 as DISABLE };
    export let ENABLE: number;
    export let ENABLE_FORMS: number;
    export let ENABLE_STORAGE: number;
}
export const AnnotationPrefix: "pdfjs_internal_id_";
export namespace AnnotationReplyType {
    let GROUP: string;
    let REPLY: string;
}
export namespace AnnotationType {
    export let TEXT: number;
    export let LINK: number;
    let FREETEXT_1: number;
    export { FREETEXT_1 as FREETEXT };
    export let LINE: number;
    export let SQUARE: number;
    export let CIRCLE: number;
    export let POLYGON: number;
    export let POLYLINE: number;
    let HIGHLIGHT_1: number;
    export { HIGHLIGHT_1 as HIGHLIGHT };
    let UNDERLINE_1: number;
    export { UNDERLINE_1 as UNDERLINE };
    export let SQUIGGLY: number;
    export let STRIKEOUT: number;
    let STAMP_1: number;
    export { STAMP_1 as STAMP };
    export let CARET: number;
    let INK_1: number;
    export { INK_1 as INK };
    export let POPUP: number;
    export let FILEATTACHMENT: number;
    export let SOUND: number;
    export let MOVIE: number;
    export let WIDGET: number;
    export let SCREEN: number;
    export let PRINTERMARK: number;
    export let TRAPNET: number;
    export let WATERMARK: number;
    export let THREED: number;
    export let REDACT: number;
}
export function assert(cond: any, msg: any): void;
/**
 * @type {any}
 */
export const BaseException: any;
export const BASELINE_FACTOR: number;
export function bytesToString(bytes: any): string;
/**
 * Attempts to create a valid absolute URL.
 *
 * @param {URL|string} url - An absolute, or relative, URL.
 * @param {URL|string} [baseUrl] - An absolute URL.
 * @param {Object} [options]
 * @returns Either a valid {URL}, or `null` otherwise.
 */
export function createValidAbsoluteUrl(url: URL | string, baseUrl?: string | URL | undefined, options?: Object | undefined): URL | null;
export namespace DocumentActionEventType {
    let WC: string;
    let WS: string;
    let DS: string;
    let WP: string;
    let DP: string;
}
export class FeatureTest {
    static get isLittleEndian(): any;
    static get isEvalSupported(): any;
    static get isOffscreenCanvasSupported(): any;
    static get platform(): any;
    static get isCSSRoundSupported(): any;
}
export const FONT_IDENTITY_MATRIX: number[];
export namespace FontRenderOps {
    let BEZIER_CURVE_TO: number;
    let MOVE_TO: number;
    let LINE_TO: number;
    let QUADRATIC_CURVE_TO: number;
    let RESTORE: number;
    let SAVE: number;
    let SCALE: number;
    let TRANSFORM: number;
    let TRANSLATE: number;
}
declare const FormatError_base: any;
/**
 * Error caused during parsing PDF data.
 */
export class FormatError extends FormatError_base {
    [x: string]: any;
    constructor(msg: any);
}
export function fromBase64Util(str: any): any;
export function getModificationDate(date?: Date): string;
export function getUuid(): string;
export function getVerbosityLevel(): number;
export const hexNumbers: string[];
export const IDENTITY_MATRIX: number[];
export namespace ImageKind {
    let GRAYSCALE_1BPP: number;
    let RGB_24BPP: number;
    let RGBA_32BPP: number;
}
export function info(msg: any): void;
declare const InvalidPDFException_base: any;
export class InvalidPDFException extends InvalidPDFException_base {
    [x: string]: any;
    constructor(msg: any);
}
export function isArrayEqual(arr1: any, arr2: any): boolean;
export const isNodeJS: any;
export const LINE_DESCENT_FACTOR: 0.35;
export const LINE_FACTOR: 1.35;
export const MAX_IMAGE_SIZE_TO_CACHE: 10000000;
declare const MissingPDFException_base: any;
export class MissingPDFException extends MissingPDFException_base {
    [x: string]: any;
    constructor(msg: any);
}
export function normalizeUnicode(str: any): any;
export function objectFromMap(map: any): any;
export function objectSize(obj: any): number;
export namespace OPS {
    let dependency: number;
    let setLineWidth: number;
    let setLineCap: number;
    let setLineJoin: number;
    let setMiterLimit: number;
    let setDash: number;
    let setRenderingIntent: number;
    let setFlatness: number;
    let setGState: number;
    let save: number;
    let restore: number;
    let transform: number;
    let moveTo: number;
    let lineTo: number;
    let curveTo: number;
    let curveTo2: number;
    let curveTo3: number;
    let closePath: number;
    let rectangle: number;
    let stroke: number;
    let closeStroke: number;
    let fill: number;
    let eoFill: number;
    let fillStroke: number;
    let eoFillStroke: number;
    let closeFillStroke: number;
    let closeEOFillStroke: number;
    let endPath: number;
    let clip: number;
    let eoClip: number;
    let beginText: number;
    let endText: number;
    let setCharSpacing: number;
    let setWordSpacing: number;
    let setHScale: number;
    let setLeading: number;
    let setFont: number;
    let setTextRenderingMode: number;
    let setTextRise: number;
    let moveText: number;
    let setLeadingMoveText: number;
    let setTextMatrix: number;
    let nextLine: number;
    let showText: number;
    let showSpacedText: number;
    let nextLineShowText: number;
    let nextLineSetSpacingShowText: number;
    let setCharWidth: number;
    let setCharWidthAndBounds: number;
    let setStrokeColorSpace: number;
    let setFillColorSpace: number;
    let setStrokeColor: number;
    let setStrokeColorN: number;
    let setFillColor: number;
    let setFillColorN: number;
    let setStrokeGray: number;
    let setFillGray: number;
    let setStrokeRGBColor: number;
    let setFillRGBColor: number;
    let setStrokeCMYKColor: number;
    let setFillCMYKColor: number;
    let shadingFill: number;
    let beginInlineImage: number;
    let beginImageData: number;
    let endInlineImage: number;
    let paintXObject: number;
    let markPoint: number;
    let markPointProps: number;
    let beginMarkedContent: number;
    let beginMarkedContentProps: number;
    let endMarkedContent: number;
    let beginCompat: number;
    let endCompat: number;
    let paintFormXObjectBegin: number;
    let paintFormXObjectEnd: number;
    let beginGroup: number;
    let endGroup: number;
    let beginAnnotation: number;
    let endAnnotation: number;
    let paintImageMaskXObject: number;
    let paintImageMaskXObjectGroup: number;
    let paintImageXObject: number;
    let paintInlineImageXObject: number;
    let paintInlineImageXObjectGroup: number;
    let paintImageXObjectRepeat: number;
    let paintImageMaskXObjectRepeat: number;
    let paintSolidColorImageMask: number;
    let constructPath: number;
    let setStrokeTransparent: number;
    let setFillTransparent: number;
}
export namespace PageActionEventType {
    export let O: string;
    let C_1: string;
    export { C_1 as C };
}
declare const PasswordException_base: any;
export class PasswordException extends PasswordException_base {
    [x: string]: any;
    constructor(msg: any, code: any);
    code: any;
}
export namespace PasswordResponses {
    let NEED_PASSWORD: number;
    let INCORRECT_PASSWORD: number;
}
export namespace PermissionFlag {
    let PRINT_1: number;
    export { PRINT_1 as PRINT };
    export let MODIFY_CONTENTS: number;
    export let COPY: number;
    export let MODIFY_ANNOTATIONS: number;
    export let FILL_INTERACTIVE_FORMS: number;
    export let COPY_FOR_ACCESSIBILITY: number;
    export let ASSEMBLE: number;
    export let PRINT_HIGH_QUALITY: number;
}
export namespace RenderingIntentFlag {
    export let ANY: number;
    export let DISPLAY: number;
    let PRINT_2: number;
    export { PRINT_2 as PRINT };
    let SAVE_1: number;
    export { SAVE_1 as SAVE };
    export let ANNOTATIONS_FORMS: number;
    export let ANNOTATIONS_STORAGE: number;
    export let ANNOTATIONS_DISABLE: number;
    export let IS_EDITING: number;
    export let OPLIST: number;
}
export function setVerbosityLevel(level: any): void;
export function shadow(obj: any, prop: any, value: any, nonSerializable?: boolean): any;
export function string32(value: any): string;
export function stringToBytes(str: any): Uint8Array;
export function stringToPDFString(str: any): string;
export function stringToUTF8String(str: any): string;
export namespace TextRenderingMode {
    export let FILL: number;
    export let STROKE: number;
    export let FILL_STROKE: number;
    let INVISIBLE_1: number;
    export { INVISIBLE_1 as INVISIBLE };
    export let FILL_ADD_TO_PATH: number;
    export let STROKE_ADD_TO_PATH: number;
    export let FILL_STROKE_ADD_TO_PATH: number;
    export let ADD_TO_PATH: number;
    export let FILL_STROKE_MASK: number;
    export let ADD_TO_PATH_FLAG: number;
}
export function toBase64Util(arr: any): any;
export function toHexUtil(arr: any): any;
declare const UnexpectedResponseException_base: any;
export class UnexpectedResponseException extends UnexpectedResponseException_base {
    [x: string]: any;
    constructor(msg: any, status: any);
    status: any;
}
declare const UnknownErrorException_base: any;
export class UnknownErrorException extends UnknownErrorException_base {
    [x: string]: any;
    constructor(msg: any, details: any);
    details: any;
}
export function unreachable(msg: any): void;
export function utf8StringToString(str: any): string;
export class Util {
    static makeHexColor(r: any, g: any, b: any): string;
    static scaleMinMax(transform: any, minMax: any): void;
    static transform(m1: any, m2: any): any[];
    static applyTransform(p: any, m: any): any[];
    static applyInverseTransform(p: any, m: any): number[];
    static getAxialAlignedBoundingBox(r: any, m: any): number[];
    static inverseTransform(m: any): number[];
    static singularValueDecompose2dScale(m: any): number[];
    static normalizeRect(rect: any): any;
    static intersect(rect1: any, rect2: any): number[] | null;
    static "__#1@#getExtremumOnCurve"(x0: any, x1: any, x2: any, x3: any, y0: any, y1: any, y2: any, y3: any, t: any, minMax: any): void;
    static "__#1@#getExtremum"(x0: any, x1: any, x2: any, x3: any, y0: any, y1: any, y2: any, y3: any, a: any, b: any, c: any, minMax: any): void;
    static bezierBoundingBox(x0: any, y0: any, x1: any, y1: any, x2: any, y2: any, x3: any, y3: any, minMax: any): any;
}
export namespace VerbosityLevel {
    let ERRORS: number;
    let WARNINGS: number;
    let INFOS: number;
}
export function warn(msg: any): void;
export {};
