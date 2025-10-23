/**
 * Manage the SVGs drawn on top of the page canvas.
 * It's important to have them directly on top of the canvas because we want to
 * be able to use mix-blend-mode for some of them.
 */
export class DrawLayer {
    static get _svgFactory(): any;
    static "__#27@#setBox"(element: any, { x, y, width, height }?: {
        x?: number | undefined;
        y?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }): void;
    constructor({ pageIndex }: {
        pageIndex: any;
    });
    pageIndex: any;
    setParent(parent: any): void;
    draw(outlines: any, color: any, opacity: any, isPathUpdatable?: boolean): {
        id: number;
        clipPathId: string;
    };
    drawOutline(outlines: any): number;
    finalizeLine(id: any, line: any): void;
    updateLine(id: any, line: any): void;
    updatePath(id: any, line: any): void;
    updateBox(id: any, box: any): void;
    show(id: any, visible: any): void;
    rotate(id: any, angle: any): void;
    changeColor(id: any, color: any): void;
    changeOpacity(id: any, opacity: any): void;
    addClass(id: any, className: any): void;
    removeClass(id: any, className: any): void;
    getSVGRoot(id: any): any;
    remove(id: any): void;
    destroy(): void;
    #private;
}
