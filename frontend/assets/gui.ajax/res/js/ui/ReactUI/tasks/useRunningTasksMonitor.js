/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {useState, useEffect} from 'react'
import JobsStore from './JobsStore'
import debounce from 'lodash.debounce'

export default ({pydio, forceUnfold, statusString='Running'}) => {
    const [wsDisconnected, setWsDisconnected] = useState(false)
    const [wsStartDisconnected, _] = useState(pydio.WebSocketClient.getStatus())
    const [jobs, _setJobs] = useState([])
    const [error, setError] = useState(null)
    const setJobs = debounce(_setJobs, 250, {maxWait: 450, leading: true, trailing: true})

    const reload = () => {
        JobsStore.getInstance().getJobs(false, statusString).then(jobs => {
            const jArr = []
            jobs.forEach(j => jArr.push(j))
            setJobs(jArr)
        }).catch(reason => {
            setError(reason.message)
        });
    };

    useEffect(()=> {
        setTimeout(()=>{
            // Recheck status after starting
            if(wsStartDisconnected){
                const status = pydio.WebSocketClient.getStatus();
                if(!status){
                    setWsDisconnected(true)
                }
            }
        }, 10000);
    }, [])

    useEffect(()=>{
        reload()
        const obs1 = (event) => {
            setWsDisconnected(!event.status)
            if(forceUnfold){
                forceUnfold();
            }
        }
        pydio.observe("ws_status", obs1)
        const obs2 = () => {
            reload()
        }
        JobsStore.getInstance().observe("tasks_updated", obs2);
        return () => {
            pydio.stopObserving('ws_status', obs1)
            JobsStore.getInstance().stopObserving('tasks_updated', obs2)
        }
    }, [])

    const progressTasks = []
    const running = jobs
        .filter(j => j.Tasks)
        .filter(j => {
            let hasRunning = false;
            j.Tasks.map(t => {
                j.Time = t.EndTime; // Update job.Time
                if (t.Status === 'Running' || t.Status === 'Paused'){
                    j.Time = t.StartTime;
                    hasRunning = true;
                    if(t.HasProgress && t.Progress < 1){
                        progressTasks.push(t)
                    }
                }
            });
            return hasRunning
    })
    jobs.sort((a,b) => b.Time - a.Time);
    running.sort((a,b) => b.Time - a.Time);
    let progress = 0;
    if (progressTasks.length > 0 ) {
        progress = progressTasks.reduce((p, c)=>{return p+c.Progress}, 0)/progressTasks.length
    }

    return {wsDisconnected, jobs, running, error, progress}

}