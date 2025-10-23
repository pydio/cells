export class BaseStandardFontDataFactory {
    constructor({ baseUrl }: {
        baseUrl?: null | undefined;
    });
    baseUrl: any;
    fetch({ filename }: {
        filename: any;
    }): Promise<Uint8Array>;
    /**
     * @ignore
     * @returns {Promise<Uint8Array>}
     */
    _fetch(url: any): Promise<Uint8Array>;
}
export class DOMStandardFontDataFactory extends BaseStandardFontDataFactory {
}
