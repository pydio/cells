import ApiClient from './gen/ApiClient';

// Override callApi Method
class Client extends ApiClient{
    basePath = '/a';
    lastEventsTimestamp;
    hasReceivedEvents = false; // true once the install has started publishing real events

    pollEvents(observer, reloadObserver, emptyCount = 0) {
        const MAX_EMPTY = 5; // 5 × 4s = 20s of no new events → install done, move on
        let params = { timeout: 10, category: 'install' };
        if (this.lastEventsTimestamp) {
            params['since_time'] = this.lastEventsTimestamp;
        }
        super.callApi("/install/events", "GET", [], params, [], [], [], [], ["application/json"], ["application/json"], Object).then(response => {
            if (response && response.data) {
                if (response.data.events && response.data.events.length) {
                    let events = [...response.data.events];
                    const lastEvent = events.pop();
                    this.lastEventsTimestamp = lastEvent.timestamp;
                    this.hasReceivedEvents = true; // install is running
                    observer(response.data.events);
                    if (lastEvent.data.Progress < 99) {
                        this.pollEvents(observer, reloadObserver, 0); // reset empty counter on real events
                    } else {
                        this.pollDiscovery(reloadObserver);
                    }
                } else if (response.data.timestamp) {
                    this.lastEventsTimestamp = response.data.timestamp;
                    // Only count empty responses toward MAX_EMPTY once the install has started.
                    // Before install, empty responses are expected (user is still on the form).
                    if (this.hasReceivedEvents && emptyCount >= MAX_EMPTY) {
                        // Final event was missed (eventManager shut down before we polled) - move to discovery
                        this.pollDiscovery(reloadObserver);
                        return;
                    }
                    setTimeout(() => {
                        this.pollEvents(observer, reloadObserver, this.hasReceivedEvents ? emptyCount + 1 : 0);
                    }, 4000);
                }
            } else {
                this.pollDiscovery(reloadObserver);
            }
        }).catch(() => {
            this.pollDiscovery(reloadObserver);
        });
    }

    // Phase 1: wait for the REST API to come up (/config/discovery is only served
    // by the full Cells gateway, not the lightweight installer server).
    pollDiscovery(reloadObserver, retries = 0) {
        const MAX_RETRIES = 40; // ~120s
        super.callApi("/config/discovery", "GET", [], [], [], [], [], [], ["application/json"], ["application/json"], Object).then(() => {
            // REST API is up - now confirm the web frontend is actually serving pages.
            this.pollFrontend(reloadObserver);
        }).catch(() => {
            if (retries >= MAX_RETRIES) {
                reloadObserver();
                return;
            }
            setTimeout(() => this.pollDiscovery(reloadObserver, retries + 1), 3000);
        });
        }

    // Phase 2: fetch '/' directly to confirm the web UI is serving before navigating.
    // This eliminates any arbitrary delay - we navigate exactly when the server is ready.
    pollFrontend(reloadObserver, retries = 0) {
        const MAX_RETRIES = 10; // ~30s
        fetch('/', {method: 'GET', redirect: 'follow'}).then(resp => {
            if (resp.ok) {
                reloadObserver();
            } else {
                // Server responded but with an error - keep retrying
                if (retries >= MAX_RETRIES) { reloadObserver(); return; }
                setTimeout(() => this.pollFrontend(reloadObserver, retries + 1), 3000);
            }
        }).catch(() => {
            if (retries >= MAX_RETRIES) { reloadObserver(); return; }
            setTimeout(() => this.pollFrontend(reloadObserver, retries + 1), 3000);
        });
    }
}

export default Client;
