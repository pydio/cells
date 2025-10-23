export function fetchData(url: any): Promise<Uint8Array>;
export class NodeCanvasFactory extends BaseCanvasFactory {
    /**
     * @ignore
     */
    _createCanvas(width: any, height: any): any;
}
export class NodeCMapReaderFactory extends BaseCMapReaderFactory {
}
export class NodeFilterFactory extends BaseFilterFactory {
}
export class NodePackages {
    static get promise(): any;
    static get(name: any): any;
}
export class NodeStandardFontDataFactory extends BaseStandardFontDataFactory {
}
import { BaseCanvasFactory } from "./canvas_factory.js";
import { BaseCMapReaderFactory } from "./cmap_reader_factory.js";
import { BaseFilterFactory } from "./filter_factory.js";
import { BaseStandardFontDataFactory } from "./standard_fontdata_factory.js";
