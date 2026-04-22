export default class Node {
    constructor() {
        this.metadata = new Map();
    }

    getMetadata() {
        return {
            set: (key, value) => this.metadata.set(key, value),
        };
    }
}
