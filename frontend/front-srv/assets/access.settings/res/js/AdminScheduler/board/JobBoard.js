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
import {ConfigServiceApi} from 'cells-sdk'
import {JobsServiceApi, JobsCtrlCommand, JobsCommand} from 'cells-sdk'
import {FontIcon, FlatButton} from 'material-ui'
import TasksList from './TasksList'
import JobSchedule from './JobSchedule'
import Loader from "./Loader";
import JobParameters from "./JobParameters";

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
        this.loader = new Loader(props.job.ID);
        this.loader.observe('loaded', (memo) => {
            if(memo.job) {
                this.setState({job: memo.job, error: null});
            } else if(memo.error){
                this.setState({error: memo.error});
            }
        });
    }

    componentDidMount(){
        this.loader.start();
        // Load descriptions
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.schedulerActionsDiscovery().then(data => {
            this.setState({descriptions: data.Actions});
        });

    }

    componentWillUnmount(){
        this.loader.stop();
    }

    canManualRun(job){
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

    static hasMissingMandatories(params){
        return params && params.filter(param => param.Mandatory && (param.Value === undefined || param.Value === '')).length > 0
    }

    runJobOrOpenParams() {
        const {job} = this.state;
        if(JobBoard.hasMissingMandatories(job.Parameters)) {
            this.setState({promptParams: [...job.Parameters]})
        } else {
            JobsStore.getInstance().controlJob(job, 'RunOnce')
        }
    }

    runOnceWithParameters(parameters){
        const {job} = this.state;
        const api = new JobsServiceApi(PydioApi.getRestClient());
        let cmd = new JobsCtrlCommand();
        cmd.Cmd = JobsCommand.constructFromObject('RunOnce');
        cmd.JobId = job.ID;
        cmd.RunParameters = {};
        parameters.forEach(p => {
            cmd.RunParameters[p.Name] = p.Value + '';
        });
        return api.userControlJob(cmd).then(()=>{
            this.setState({promptParams: null});
        });
    }


    render(){

        const {pydio, jobsEditable, onRequestClose, adminStyles} = this.props;
        const {loading, create, job, descriptions, promptParams} = this.state;

        if(!job){
            return null;
        }
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;

        let actions = [];
        const flatProps = {...adminStyles.props.header.flatButton};
        const iconColor = adminStyles.props.header.flatButton.labelStyle.color;
        if(!create){
            if(jobsEditable && job.Parameters && job.Parameters.length) {
                actions.push(<JobParameters job={job}/>)
            }
            if(Loader.canManualRun(job)){
                if(jobsEditable){
                    actions.push(<JobSchedule job={job} edit={true} onUpdate={()=>{}}/>);
                }
                const bProps = {...flatProps};
                if(job.Inactive){
                    bProps.backgroundColor = '#e0e0e0';
                }
                actions.push(<FlatButton icon={<FontIcon className={"mdi mdi-play"} color={iconColor}/>} label={m('task.action.run')} disabled={job.Inactive} primary={true} onClick={()=> this.runJobOrOpenParams()} {...bProps}/>);
            }
            if(job.Inactive) {
                actions.push(<FlatButton icon={<FontIcon className={"mdi mdi-checkbox-marked-circle-outline"} color={iconColor}/>} label={m('task.action.enable')} primary={true} onClick={()=>{JobsStore.getInstance().controlJob(job, 'Active')}} {...flatProps}/>);
            } else {
                actions.push(<FlatButton icon={<FontIcon className={"mdi mdi-checkbox-blank-circle-outline"} color={iconColor}/>} label={m('task.action.disable')} primary={true} onClick={()=>{JobsStore.getInstance().controlJob(job, 'Inactive')}} {...flatProps}/>);
            }
        }

        return (
            <div style={{height: '100%', display:'flex', flexDirection:'column', position:'relative'}}>
                <AdminComponents.Header
                    title={<span><a style={{cursor:'pointer', borderBottom:'1px solid rgba(0,0,0,.87)'}} onClick={() => onRequestClose(true)}>{pydio.MessageHash['ajxp_admin.scheduler.title']}</a> / {job.Label} {job.Inactive ? ' [disabled]' : ''}</span>}
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
                {promptParams &&
                    <JobParameters
                        prompts={promptParams}
                        onClose={()=>this.setState({promptParams:null})}
                        onSubmit={(pp) => {this.runOnceWithParameters(pp);}}
                        checkMandatory={JobBoard.hasMissingMandatories}
                    />
                }
            </div>
        );

    }

}

export {JobBoard as default}