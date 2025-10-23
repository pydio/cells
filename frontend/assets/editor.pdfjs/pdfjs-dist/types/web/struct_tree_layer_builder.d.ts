export class StructTreeLayerBuilder {
    constructor(pdfPage: any, rawDims: any);
    render(): Promise<any>;
    getAriaAttributes(annotationId: any): Promise<any>;
    hide(): void;
    show(): void;
    addElementsToTextLayer(): void;
    #private;
}
