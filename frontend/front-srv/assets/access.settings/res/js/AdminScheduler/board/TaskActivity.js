/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from "react"
import Pydio from 'pydio'
import PydioApi from "pydio/http/api";
import {FontIcon} from 'material-ui'
import {JobsServiceApi, LogListLogRequest, ListLogRequestLogFormat} from 'pydio/http/rest-api';

const {MaterialTable} = Pydio.requireLib('components');
const {JobsStore, moment} = Pydio.requireLib('boot');
import debounce from 'lodash.debounce'

class TaskActivity extends React.Component{

    constructor(props){
        super(props);
        this.state = {activity:[], loading: false};
    }

    componentDidMount(){
        this.loadActivity(this.props);
        this._loadDebounced = debounce((jobId) => {
            if (jobId && this.props.task && this.props.task.JobID === jobId) {
                this.loadActivity(this.props);
            }
        }, 500);
        JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
    }

    componentWillUnmount(){
        if(this._loadDebounced){
            JobsStore.getInstance().stopObserving("tasks_updated", this._loadDebounced);
        }
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.task){
            this.loadActivity(nextProps);
        }
        if(nextProps.task && this.props.task && nextProps.task.ID !== this.props.task.ID){
            this.loadActivity(nextProps);
        }
    }

    loadActivity(props){

        const {task} = props;
        if(!task){
            return;
        }
        const operationId = task.JobID + '-' + task.ID.substr(0, 8);
        const api = new JobsServiceApi(PydioApi.getRestClient());

        let request = new LogListLogRequest();
        request.Query = "+OperationUuid:\"" + operationId + "\"";
        request.Page = 0;
        request.Size = 200;
        request.Format = ListLogRequestLogFormat.constructFromObject('JSON');
        this.setState({loading: true});
        api.listTasksLogs(request).then(response => {
            const ll = response.Logs || [];
            // Logs are reverse sorted on time
            ll.reverse();
            this.setState({activity:ll, loading: false})
        }).catch(()=>{
            this.setState({activity:[], loading: false})
        });

    }

    computeTag(row) {
        const {job, descriptions} = this.props;
        const pathTag = {
            backgroundColor: '#1e96f3',
            fontSize: 11,
            fontWeight: 500,
            color: 'white',
            padding: '0 8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            borderRadius: 4,
            textAlign: 'center'
        };
        let path = row.SchedulerTaskActionPath;
        if(!path){
            return null;
        }
        if (path === 'ROOT') {
            // Special case for trigger
            return <div style={{...pathTag, backgroundColor:'white', color:'rgba(0,0,0,.87)', border: '1px solid #e0e0e0'}}>Trigger</div>
        }
        let action;
        try{
            action = this.findAction(path, job.Actions);
        } catch (e) {
            //console.error(e);
        }
        if (action){
            if(action.Label){
                path = action.Label
            } else if(descriptions && descriptions[action.ID]){
                path = descriptions[action.ID].Label;
            }
        } else {
            const last = path.split('/').pop();
            const actionId = last.split('$').shift();
            if(descriptions && descriptions[actionId]){
                path = descriptions[actionId].Label;
            }
        }
        return <div style={pathTag}>{path}</div>
    }

    findAction(path, actions) {
        const parts = path.split('/');
        const first = parts.shift();
        const actionId = [...parts].shift();
        const chainIndex = parseInt(actionId.split('$')[1]);
        const action = actions[chainIndex];
        let nextActions;
        if (actionId.indexOf('$FAIL') === -1) {
            nextActions = action.ChainedActions;
        } else {
            nextActions = action.FailedFilterActions;
        }
        if(parts.length > 1) {
            // Move on step forward
            return this.findAction(parts.join('/'), nextActions);
        } else {
            return action;
        }
    }

    render(){
        const {pydio, onRequestClose} = this.props;
        const {activity} = this.state;
        const cellBg = "#f5f5f5";
        const lineHeight = 32;
        const columns = [
            {name: 'SchedulerTaskActionPath', label:'', hideSmall:true, style:{width:110, height: lineHeight, backgroundColor:cellBg, paddingLeft: 12, paddingRight: 0, userSelect:'text'}, headerStyle:{width:110, paddingLeft: 12, paddingRight: 0}, renderCell:(row) => {
                return this.computeTag(row)
            }},
            {name:'Ts', label:pydio.MessageHash['settings.17'], style:{width: 100, height: lineHeight, backgroundColor:cellBg, paddingRight: 10, userSelect:'text'}, headerStyle:{width: 100, paddingRight: 10}, renderCell:(row=>{
                    const m = moment(row.Ts * 1000);
                    return m.format('HH:mm:ss');
                })},
            {name:'Msg', label:pydio.MessageHash['ajxp_admin.logs.message'], style:{height: lineHeight, backgroundColor:cellBg, userSelect:'text'}}
        ];
        return (
            <div style={{paddingTop: 12, paddingBottom: 10, backgroundColor:cellBg}}>
                <div style={{padding:'0 24px 10px', fontWeight:500, backgroundColor:cellBg, display:'flex', alignItems:'center'}}>
                    <div style={{flex: 1}}>Tasks Logs</div>
                    <div style={{paddingRight: 15, cursor: "pointer"}} onClick={onRequestClose}>
                        <FontIcon className={"mdi mdi-close"} color={"rgba(0,0,0,.3)"} style={{fontSize: 16}}/>
                    </div>
                </div>
                <MaterialTable
                    hideHeaders={true}
                    columns={columns}
                    data={activity}
                    showCheckboxes={false}
                    emptyStateString={'No activity found'}
                    emptyStateStyle={{backgroundColor: cellBg}}
                    computeRowStyle={(row) => {return {borderBottomColor: '#fff', height: lineHeight}}}
                />
            </div>
        )
    }

}

export {TaskActivity as default}