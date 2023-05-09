class PydioStorage {
    static getSessionStorage() {
        return window.localStorage
    }

    constructor(props) {
        this.aKeys = []
        this.oStorage = {}
    }

    getItem(sKey) {
        const sValue = this.oStorage[sKey]
        return sValue || null
    }

    key(nKeyId) {
        if (nKeyId >= this.aKeys.length) {
            return null
        }

        return this.aKeys[nKeyId]
    }

    setItem(sKey, sValue) {
        if(!sKey) { return; }

        this.oStorage[sKey] = sValue

        // Need to add or reset the key
        for (let i = 0; i < this.aKeys.length; i++) {
            if (sKey == this.aKeys[i]) {
                return              
            } 
        }

        this.aKeys.push(sKey)
    }
    
    removeItem(sKey) {
        if(!sKey) { return; }
        
        delete this.oStorage[sKey]

        // Need to add or reset the key
        for (let i = 0; i < this.aKeys.length; i++) {
            if (sKey == this.aKeys[i]) {
                this.aKeys.splice(i, 1)
            }
        }
    }
    
    get length() {
        return this.aKeys.length
    }
}

const storage = new PydioStorage()

export default PydioStorage