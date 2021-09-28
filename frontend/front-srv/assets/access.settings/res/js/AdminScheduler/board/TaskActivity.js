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

import React from "react"
import Pydio from 'pydio'
import PydioApi from "pydio/http/api";
import {FontIcon, CircularProgress} from 'material-ui'
import {JobsServiceApi, LogListLogRequest, ListLogRequestLogFormat} from 'cells-sdk';

const {MaterialTable} = Pydio.requireLib('components');
const {JobsStore, moment} = Pydio.requireLib('boot');
import debounce from 'lodash.debounce'

class TaskActivity extends React.Component{

    constructor(props){
        super(props);
        const serverOffset = Pydio.getInstance().Parameters.get('backend')['ServerOffset'];
        const localOffset = new Date().getTimezoneOffset() * 60
        this.state = {
            activity:[],
            loading: false,
            page:0,
            serverOffset:serverOffset+localOffset,
            timeOffset: 0
        };
    }

    toggleTimeOffset() {
        const {timeOffset, serverOffset} = this.state;
        this.setState({timeOffset:timeOffset?0:serverOffset})
    }

    componentDidMount(){
        this.loadActivity(this.props);
        this._loadDebounced = debounce((jobId) => {
            if (jobId && this.props.task && this.props.task.JobID === jobId) {
                this.loadActivity(this.props, 0, 4);
            }
        }, 500);
        JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
        const {poll} = this.props;
        if(poll){
            this._interval = window.setInterval(() => {
                if(!Pydio.getInstance().WebSocketClient.getStatus()){
                    return
                }
                this.loadActivity(this.props, (this.state && this.state.page?this.state.page:0), 4);
            }, poll);
        }
    }

    componentWillUnmount(){
        if(this._loadDebounced){
            JobsStore.getInstance().stopObserving("tasks_updated", this._loadDebounced);
        }
        if(this._interval) {
            window.clearInterval(this._interval);
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

    loadActivity(props, page = 0, retry = 0){

        const {task, poll} = props;
        if(!task){
            return;
        }
        const operationId = task.JobID + '-' + task.ID.substr(0, 8);
        const api = new JobsServiceApi(PydioApi.getRestClient());

        let request = new LogListLogRequest();
        request.Query = "+OperationUuid:\"" + operationId + "\"";
        request.Page = page;
        request.Size = 200;
        request.Format = ListLogRequestLogFormat.constructFromObject('JSON');
        this.setState({loading: true});
        api.listTasksLogs(request).then(response => {
            const ll = response.Logs || [];
            this.setState({activity:ll, loading: false, page: page})
            if(!ll.length && retry < 3 && !poll) {
                setTimeout(() => this.loadActivity(props, page, retry + 1), 2000);
            }
        }).catch(()=>{
            this.setState({activity:[], loading: false, page: page})
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
        const {activity, loading, page, serverOffset, timeOffset = 0} = this.state;
        const cellBg = "#f5f5f5";
        const lineHeight = 32;
        const columns = [
            {name: 'SchedulerTaskActionPath', label:'', hideSmall:true, style:{width:110, height: lineHeight, backgroundColor:cellBg, paddingLeft: 12, paddingRight: 0, userSelect:'text'}, headerStyle:{width:110, paddingLeft: 12, paddingRight: 0}, renderCell:(row) => {
                return this.computeTag(row)
            }},
            {name:'Ts', label:pydio.MessageHash['settings.17'], style:{width: 100, height: lineHeight, backgroundColor:cellBg, paddingRight: 10, userSelect:'text'}, headerStyle:{width: 100, paddingRight: 10}, renderCell:(row=>{
                    const m = moment((row.Ts+timeOffset) * 1000);
                    return m.format('HH:mm:ss');
                })},
            {name:'Msg', label:pydio.MessageHash['ajxp_admin.logs.message'], style:{height: lineHeight, backgroundColor:cellBg, userSelect:'text'}}
        ];
        return (
            <div style={{paddingTop: 12, paddingBottom: 10, backgroundColor:cellBg}}>
                <div style={{padding:'0 24px 10px', fontWeight:500, backgroundColor:cellBg, display:'flex', alignItems:'center'}}>
                    <div>{pydio.MessageHash['ajxp_admin.scheduler.tasks.activity.title']}</div>
                    <div style={{flex:1, textAlign:'center', fontSize: 20, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {page > 0 && <FontIcon className={"mdi mdi-chevron-left"} color={"rgba(0,0,0,.7)"} style={{cursor: 'pointer'}} onClick={()=>{this.loadActivity(this.props, page - 1)}}/>}
                        {(page > 0 || activity.length >= 200) && <span style={{fontSize: 12}}>{pydio.MessageHash[331]} {(loading?<CircularProgress size={16} thickness={1.5}/>:<span>{page + 1}</span>)}</span>}
                        {activity.length >= 200 && <FontIcon className={"mdi mdi-chevron-right"} color={"rgba(0,0,0,.7)"} style={{cursor: 'pointer'}} onClick={()=>{this.loadActivity(this.props, page + 1)}}/>}
                    </div>
                    {serverOffset &&
                    <div style={{paddingRight: 15, cursor: "pointer"}} onClick={()=>this.toggleTimeOffset()}>
                        <FontIcon className={"mdi mdi-alarm"+(timeOffset?"-snooze":"")} color={"rgba(0,0,0,.3)"} style={{fontSize: 16}}/>
                    </div>
                    }
                    <div style={{paddingRight: 15, cursor: "pointer"}} onClick={onRequestClose}>
                        <FontIcon className={"mdi mdi-close"} color={"rgba(0,0,0,.3)"} style={{fontSize: 16}}/>
                    </div>
                </div>
                <MaterialTable
                    hideHeaders={true}
                    columns={columns}
                    data={activity}
                    showCheckboxes={false}
                    emptyStateString={loading ? <div style={{display:'flex', alignItems:'center'}}> <CircularProgress size={16} thickness={1.5}/> <span style={{flex:1, marginLeft: 5}}>{pydio.MessageHash['ajxp_admin.scheduler.tasks.activity.loading']}</span></div> : pydio.MessageHash['ajxp_admin.scheduler.tasks.activity.empty']}
                    emptyStateStyle={{backgroundColor: cellBg}}
                    computeRowStyle={(row) => {return {borderBottomColor: '#fff', height: lineHeight}}}
                />
            </div>
        )
    }

}

export {TaskActivity as default}