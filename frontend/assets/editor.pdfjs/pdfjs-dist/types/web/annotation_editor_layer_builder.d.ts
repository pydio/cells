export type PDFPageProxy = import("../src/display/api").PDFPageProxy;
export type PageViewport = import("../src/display/display_utils").PageViewport;
export type AnnotationEditorUIManager = import("../src/display/editor/tools.js").AnnotationEditorUIManager;
export type TextAccessibilityManager = import("./text_accessibility.js").TextAccessibilityManager;
export type IL10n = import("./interfaces").IL10n;
export type AnnotationLayer = import("../src/display/annotation_layer.js").AnnotationLayer;
export type StructTreeLayerBuilder = any;
export type AnnotationEditorLayerBuilderOptions = {
    uiManager?: import("../src/pdf").AnnotationEditorUIManager | undefined;
    pdfPage: PDFPageProxy;
    l10n?: import("./interfaces").IL10n | undefined;
    structTreeLayer?: StructTreeLayerBuilder;
    accessibilityManager?: import("./text_accessibility.js").TextAccessibilityManager | undefined;
    annotationLayer?: import("../src/pdf").AnnotationLayer | undefined;
    textLayer?: any;
    drawLayer?: any;
    onAppend?: Function | undefined;
};
/**
 * @typedef {Object} AnnotationEditorLayerBuilderOptions
 * @property {AnnotationEditorUIManager} [uiManager]
 * @property {PDFPageProxy} pdfPage
 * @property {IL10n} [l10n]
 * @property {StructTreeLayerBuilder} [structTreeLayer]
 * @property {TextAccessibilityManager} [accessibilityManager]
 * @property {AnnotationLayer} [annotationLayer]
 * @property {TextLayer} [textLayer]
 * @property {DrawLayer} [drawLayer]
 * @property {function} [onAppend]
 */
export class AnnotationEditorLayerBuilder {
    /**
     * @param {AnnotationEditorLayerBuilderOptions} options
     */
    constructor(options: AnnotationEditorLayerBuilderOptions);
    pdfPage: import("../src/display/api").PDFPageProxy;
    accessibilityManager: import("./text_accessibility.js").TextAccessibilityManager | undefined;
    l10n: import("./interfaces").IL10n | GenericL10n | undefined;
    annotationEditorLayer: AnnotationEditorLayer | null;
    div: HTMLDivElement | null;
    _cancelled: boolean;
    /**
     * @param {PageViewport} viewport
     * @param {string} intent (default value is 'display')
     */
    render(viewport: PageViewport, intent?: string): Promise<void>;
    cancel(): void;
    hide(): void;
    show(): void;
    #private;
}
import { GenericL10n } from "./genericl10n";
import { AnnotationEditorLayer } from "../src/pdf";
