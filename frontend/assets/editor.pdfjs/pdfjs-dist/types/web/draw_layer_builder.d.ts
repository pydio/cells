export type DrawLayerBuilderOptions = {
    pageIndex: number;
};
/**
 * @typedef {Object} DrawLayerBuilderOptions
 * @property {number} pageIndex
 */
export class DrawLayerBuilder {
    /**
     * @param {DrawLayerBuilderOptions} options
     */
    constructor(options: DrawLayerBuilderOptions);
    pageIndex: number;
    /**
     * @param {string} intent (default value is 'display')
     */
    render(intent?: string): Promise<void>;
    cancel(): void;
    _cancelled: boolean | undefined;
    setParent(parent: any): void;
    getDrawLayer(): null;
    #private;
}
