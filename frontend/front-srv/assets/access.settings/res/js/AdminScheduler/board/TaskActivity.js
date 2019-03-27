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
import {Paper} from 'material-ui'
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
            console.log(jobId, this.props);
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
        request.Size = 100;
        request.Format = ListLogRequestLogFormat.constructFromObject('JSON');
        this.setState({loading: true});
        api.listTasksLogs(request).then(response => {
            this.setState({activity:response.Logs || [], loading: false})
        }).catch(()=>{
            this.setState({activity:[], loading: false})
        });

    }

    render(){
        const {pydio, task} = this.props;
        const {activity, loading} = this.state;
        const columns = [
            {name:'Ts', label:pydio.MessageHash['settings.17'], style:{width: '25%'}, headerStyle:{width: '25%'}, renderCell:(row=>{
                    return moment(row.Ts * 1000).fromNow();
                })},
            {name:'Msg', label:pydio.MessageHash['ajxp_admin.logs.message']}
        ];
        return (
            <div style={{height:400}}>
                <MaterialTable
                    columns={columns}
                    data={activity}
                    showCheckboxes={false}
                    emptyStateString={'No activity found'}
                />
            </div>
        )
    }

}

export {TaskActivity as default}