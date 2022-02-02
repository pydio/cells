import ApiClient from './gen/ApiClient';

// Override callApi Method
class Client extends ApiClient{
    basePath = '/a';
    lastEventsTimestamp;

    pollEvents(observer, reloadObserver){
        let params = {
            timeout: 10,
            category:'install'
        };
        if(this.lastEventsTimestamp){
            params['since_time'] = this.lastEventsTimestamp;
        }
        super.callApi("/install/events", "GET", [], params, [], [], [], [], ["application/json"], ["application/json"], Object).then(response => {
            if (response && response.data){
                if (response.data.events && response.data.events.length){
                    let events = [...response.data.events];
                    const lastEvent = events.pop();
                    this.lastEventsTimestamp = lastEvent.timestamp;
                    observer(response.data.events);
                    if(lastEvent.data.Progress < 99) {
                        this.pollEvents(observer, reloadObserver);
                    } else {
                        // This is finished now, do not poll events again but poll any url to detect that services are loaded
                        this.pollDiscovery(reloadObserver);
                    }
                } else if(response.data.timestamp){
                    this.lastEventsTimestamp = response.data.timestamp;
                    setTimeout(()=>{
                        this.pollEvents(observer, reloadObserver)
                    }, 4000);
                }
            } else {
                // Not sure what happened, let's switch to discovery endpoint
                this.pollDiscovery(reloadObserver);
            }
        }).catch(reason => {
            this.pollDiscovery(reloadObserver);
        });
    }

    pollDiscovery(reloadObserver) {
        super.callApi("/config/discovery", "GET", [], [], [], [], [], [], ["application/json"], ["application/json"], Object).then(response => {
            // A proper response means that server is ready - but gateway may be restarting!
            setTimeout(reloadObserver, 6000);
        }).catch(reason => {
            // API error means services are not available yet
            setTimeout(() => {
                this.pollDiscovery(reloadObserver)
            }, 4000);
        });

    }

}

export default Client;
