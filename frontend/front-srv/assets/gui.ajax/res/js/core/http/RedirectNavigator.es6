import qs from 'query-string'

export class RedirectNavigator{
    constructor(store) {
        this.store = store
    }

    prepare() {
        return Promise.resolve(this);
    }

    navigate(params) {
        return new Promise((resolve, reject) => {
            if (!params || !params.url) {
                Log.error("RedirectNavigator.navigate: No url provided");
                return reject(new Error("No url provided"));
            }

            fetch(params.url, {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => response.json()).then(response => {
                this.store.setItem("challenge", response.challenge)
                
                resolve()
            }).catch(e => resolve())
        })
    }

    get url() {
        return window.location.href;
    }
}