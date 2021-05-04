/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React from 'react'
import {LinearProgress, CircularProgress} from 'material-ui'
import JobsStore from './JobsStore'

class SingleJobProgress extends React.Component {

    constructor(props) {
        super(props);
        this.store = JobsStore.getInstance();
        this.state = {task: null};
        this.observer = () => { this.reloadTask() }
    }

    reloadTask() {
        const {jobID, taskID} = this.props;
        this.store.getJobs(false).then(tasksList => {
            if(tasksList && tasksList.has(jobID)) {
                const job = tasksList.get(jobID);
                this.setState({jobLabel: job.Label});
                if(job.Tasks && job.Tasks.length) {
                    let task;
                    if (taskID) {
                        const filtered = job.Tasks.filter(t => t.ID === taskID);
                        if (filtered.length) {
                            task = filtered[0]
                        }
                    } else {
                        task = job.Tasks[0];
                    }
                    if (task){
                        if(task.Progress === 1 && this.props.onEnd){
                            this.props.onEnd();
                        }
                        this.setState({task});
                    }
                }
            }
        });
    }

    componentDidMount(){
        this.reloadTask();
        this.store.observe("tasks_updated", this.observer);
    }

    componentWillUnmount(){
        this.store.stopObserving("tasks_updated", this.observer);
    }

    render(){
        const {task, jobLabel} = this.state;
        const {style, labelStyle, lineStyle, progressStyle, noProgress, noLabel, circular, thickness, size} = this.props;
        if(!task) {
            return <div>{jobLabel ? jobLabel : "..."}</div>
        }
        let progress;
        if(!noProgress && task.HasProgress && task.Status !== 'Error' && task.Progress < 1){
            if (circular) {
                progress = (<CircularProgress mode="determinate" min={0} max={100} value={task.Progress * 100} size={size} thickness={thickness}/>);
            } else {
                progress = (<LinearProgress mode="determinate" min={0} max={100} value={task.Progress * 100} style={{width:'100%'}}/>);
            }
        }
        let lStyle = {...labelStyle};
        if(task.Status === 'Error'){
            lStyle = {...lStyle, color: '#e53935'}
        }
        let status;
        if (task.StatusMessage) {
            status = task.StatusMessage.split("\n").map(s => <div style={lineStyle}>{s}</div>)
        } else {
            status = <div style={lineStyle}>{task.Status}</div>;
        }
        return (
            <div style={style}>
                {!noLabel && <div style={lStyle}>{status}</div>}
                {progress && <div style={progressStyle}>{progress}</div>}
            </div>
        );
    }

}

export {SingleJobProgress as default}