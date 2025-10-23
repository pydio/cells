export class FreeHighlightOutliner extends FreeDrawOutliner {
    newFreeDrawOutline(outline: any, points: any, box: any, scaleFactor: any, innerMargin: any, isLTR: any): FreeHighlightOutline;
    get classNamesForDrawing(): string[];
}
export class HighlightOutliner {
    /**
     * Construct an outliner.
     * @param {Array<Object>} boxes - An array of axis-aligned rectangles.
     * @param {number} borderWidth - The width of the border of the boxes, it
     *   allows to make the boxes bigger (or smaller).
     * @param {number} innerMargin - The margin between the boxes and the
     *   outlines. It's important to not have a null innerMargin when we want to
     *   draw the outline else the stroked outline could be clipped because of its
     *   width.
     * @param {boolean} isLTR - true if we're in LTR mode. It's used to determine
     *   the last point of the boxes.
     */
    constructor(boxes: Array<Object>, borderWidth?: number, innerMargin?: number, isLTR?: boolean);
    getOutlines(): HighlightOutline;
    #private;
}
import { FreeDrawOutliner } from "./freedraw.js";
declare class FreeHighlightOutline extends FreeDrawOutline {
    get classNamesForDrawing(): string[];
    get classNamesForOutlining(): string[];
    newOutliner(point: any, box: any, scaleFactor: any, thickness: any, isLTR: any, innerMargin?: number): FreeHighlightOutliner;
}
declare class HighlightOutline extends Outline {
    constructor(outlines: any, box: any);
    /**
     * Serialize the outlines into the PDF page coordinate system.
     * @param {Array<number>} _bbox - the bounding box of the annotation.
     * @param {number} _rotation - the rotation of the annotation.
     * @returns {Array<Array<number>>}
     */
    serialize([blX, blY, trX, trY]: Array<number>, _rotation: number): Array<Array<number>>;
    get box(): any;
    get classNamesForDrawing(): string[];
    get classNamesForOutlining(): string[];
    #private;
}
import { FreeDrawOutline } from "./freedraw.js";
import { Outline } from "./outline.js";
export {};
