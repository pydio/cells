export class BaseCMapReaderFactory {
    constructor({ baseUrl, isCompressed }: {
        baseUrl?: null | undefined;
        isCompressed?: boolean | undefined;
    });
    baseUrl: any;
    isCompressed: boolean;
    fetch({ name }: {
        name: any;
    }): Promise<{
        cMapData: Uint8Array;
        isCompressed: boolean;
    }>;
    /**
     * @ignore
     * @returns {Promise<Uint8Array>}
     */
    _fetch(url: any): Promise<Uint8Array>;
}
export class DOMCMapReaderFactory extends BaseCMapReaderFactory {
}
