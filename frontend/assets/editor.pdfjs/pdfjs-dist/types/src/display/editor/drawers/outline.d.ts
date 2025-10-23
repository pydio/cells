export class Outline {
    /**
     * @returns {string} The SVG path of the outline.
     */
    toSVGPath(): string;
    /**
     * @type {Object|null} The bounding box of the outline.
     */
    get box(): Object | null;
    serialize(_bbox: any, _rotation: any): void;
    get classNamesForDrawing(): void;
    get classNamesForOutlining(): void;
    get mustRemoveSelfIntersections(): boolean;
}
