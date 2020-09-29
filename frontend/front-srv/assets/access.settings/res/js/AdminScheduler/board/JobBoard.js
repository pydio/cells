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

import React from 'react'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import {ConfigServiceApi} from 'pydio/http/rest-api'
import ResourcesManager from 'pydio/http/resources-manager'
import {IconButton, FontIcon, FlatButton, RaisedButton, Paper} from 'material-ui'
import TasksList from './TasksList'
import JobSchedule from './JobSchedule'

const {JobsStore} = Pydio.requireLib("boot");

class JobBoard extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            mode:'log', // 'log' or 'selection'
            selectedRows: [],
            loading: false,
            taskLogs: null,
            job: props.job,
            create: props.create,
            descriptions: {},
        }
    }

    componentDidMount(){
        // Load descriptions
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.schedulerActionsDiscovery().then(data => {
            this.setState({descriptions: data.Actions});
        });

    }

    componentWillReceiveProps(nextProps){
        if(nextProps.job && (nextProps.job.Tasks !== this.props.job.Tasks || nextProps.job.Inactive !== this.props.job.Inactive)) {
            this.setState({job: nextProps.job});
        }
    }

    onJobSave(job){
        this.setState({job: job, create: false});
    }

    onJsonSave(job){
        // Artificial redraw : go null and back to job
        this.setState({job: null, create:false}, ()=>{
            this.setState({job: job});
        });
    }

    render(){

        const {pydio, jobsEditable, onRequestClose, adminStyles} = this.props;
        const {loading, create, job, descriptions} = this.state;

        if(!job){
            return null;
        }
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;

        let actions = [];
        const flatProps = {...adminStyles.props.header.flatButton};
        const iconColor = adminStyles.props.header.flatButton.labelStyle.color;
        if(!create){
            if(!job.EventNames){
                if(jobsEditable){
                    actions.push(<JobSchedule job={job} edit={true} onUpdate={()=>{}}/>);
                }
                const bProps = {...flatProps};
                if(job.Inactive){
                    bProps.backgroundColor = '#e0e0e0';
                }
                actions.push(<FlatButton icon={<FontIcon className={"mdi mdi-play"} color={iconColor}/>} label={m('task.action.run')} disabled={job.Inactive} primary={true} onTouchTap={()=>{JobsStore.getInstance().controlJob(job, 'RunOnce')}} {...bProps}/>);
            }
            if(job.Inactive) {
                actions.push(<FlatButton icon={<FontIcon className={"mdi mdi-checkbox-marked-circle-outline"} color={iconColor}/>} label={m('task.action.enable')} primary={true} onTouchTap={()=>{JobsStore.getInstance().controlJob(job, 'Active')}} {...flatProps}/>);
            } else {
                actions.push(<FlatButton icon={<FontIcon className={"mdi mdi-checkbox-blank-circle-outline"} color={iconColor}/>} label={m('task.action.disable')} primary={true} onTouchTap={()=>{JobsStore.getInstance().controlJob(job, 'Inactive')}} {...flatProps}/>);
            }
        }

        return (
            <div style={{height: '100%', display:'flex', flexDirection:'column', position:'relative'}}>
                <AdminComponents.Header
                    title={<span><a style={{cursor:'pointer', borderBottom:'1px solid rgba(0,0,0,.87)'}} onTouchTap={() => onRequestClose(true)}>{pydio.MessageHash['ajxp_admin.scheduler.title']}</a> / {job.Label} {job.Inactive ? ' [disabled]' : ''}</span>}
                    backButtonAction={() => onRequestClose(true)}
                    actions={actions}
                    loading={loading}
                />
                <div style={{flex:1, overflowY: 'auto'}}>
                    <TasksList
                        pydio={pydio}
                        job={job}
                        onLoading={(l)=>{this.setState({loading:l})}}
                        descriptions={descriptions}
                        adminStyles={adminStyles}
                    />
                </div>
            </div>
        );

    }

}

export {JobBoard as default}