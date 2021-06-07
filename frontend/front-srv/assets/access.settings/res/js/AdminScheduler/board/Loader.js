/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
import Pydio from 'pydio'
import Observable from 'pydio/lang/observable'
const {JobsStore} = Pydio.requireLib("boot");
import debounce from 'lodash.debounce'

class Loader extends Observable {

    constructor(jobId = null) {
        super();
        this.jobId = jobId
    }

    static canManualRun(job){
        if (job.Schedule || !job.EventNames) {
            return true
        }
        let hasManualFilter = false;
        try{
            job.Actions.forEach(a => {
                if (!a.TriggerFilter) {
                    return
                }
                a.TriggerFilter.Query.SubQueries.forEach(sub => {
                    if (sub.value.IsManual){
                        hasManualFilter = true;
                    }
                });
            });
        } catch(e){}
        return hasManualFilter;
    }

    start(){
        this.load(true);
        this._loadDebounced = debounce(()=>{
            this.load(true)
        }, 500);
        JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
        this._poll = setInterval(()=>{
            if(!Pydio.getInstance().WebSocketClient.getStatus()){
                return
            }
            this.load(true)
        }, 5000);
    }

    stop(){
        if(this._poll){
            JobsStore.getInstance().stopObserving("tasks_updated", this._loadDebounced);
            clearInterval(this._poll);
        }
    }

    setFilter(owner, filter){
        this.owner = owner;
        this.filter = filter;
        this.load();
    }

    load(hideLoading = false) {
        if(!hideLoading){
            this.notify('loading');
        }
        if(this.jobId) {
            JobsStore.getInstance().getAdminJobs(this.owner, null, this.jobId).then(result => {
                if(!result.Jobs || result.Jobs.length === 0) {
                    return
                }
                const job = result.Jobs[0];
                this.notify('loaded', {job});
            }).catch(reason => {
                this.notify('loaded', {error: reason.message});
            });
        } else {
            JobsStore.getInstance().getAdminJobs(this.owner, null, "", 1).then(result => {
                const jobs = result.Jobs || [];
                this.notify('loaded', {jobs});
            }).catch(reason => {
                this.notify('loaded', {error: reason.message});
            });
        }
    }
}

export default Loader