export default class SearchApi {
    search() {
        return Promise.resolve({ Results: [], Facets: [], Total: 0 });
    }
}
