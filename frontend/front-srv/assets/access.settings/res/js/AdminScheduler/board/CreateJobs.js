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
import ResourcesManager from 'pydio/http/resources-manager'
import {JobsAction} from 'pydio/http/rest-api'
import {FontIcon, FlatButton, RaisedButton} from 'material-ui'
const {Stepper} = Pydio.requireLib("components");
const {Dialog, PanelBigButtons} = Stepper;
import {
    JobsJob,
} from 'pydio/http/rest-api';
import TplManager from "./graph/TplManager";
import uuid from "uuid4";
import JobParameters from "./JobParameters";
import ScheduleForm from "./builder/ScheduleForm";
import {Events} from './builder/Triggers'
import {saveErrorAction, saveSuccessAction} from "./actions/editor";
const {ModernTextField} = Pydio.requireLib('hoc');

const tints = {
    nodes:'',
    idm : '#438db3',
    context: '#795649',
    output: '#009688',
    preset: '#F57C00'
};

const presetTagStyle = {
    display: 'inline-block',
    backgroundColor: tints.preset,
    padding: '0 5px',
    marginRight: 5,
    borderRadius: 5,
    color: 'white',
    fontSize: 12,
    lineHeight:'17px'
};


class CreateJobs extends React.Component {

    constructor(props){
        super(props);
        this.state = {filter: '', templates:[]}
    }

    componentWillReceiveProps(next){
        if( (next.open && !this.props.open)){
            this.loadTemplates();
        }
    }

    loadTemplates(){
        TplManager.getInstance().listJobs().then((result) => {
            this.setState({templates: result});
        })
    }

    dismiss(){
        this.setState({job: null, pickEvents: false, random: null});
        const {onDismiss} = this.props;
        onDismiss();
    }

    save(){
        const {onCreate} = this.props;
        const {job, isTemplate} = this.state;
        if(isTemplate){
            // Save new instance directly and open editor
            ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                const {SchedulerServiceApi, JobsPutJobRequest} = sdk;
                const api = new SchedulerServiceApi(PydioApi.getRestClient());
                const req = new JobsPutJobRequest();
                req.Job = job;
                return api.putJob(req);
            }).then(() => {
                onCreate(job);
            }).catch(e => {
                Pydio.getInstance().UI.displayMessage('ERROR', 'Cannot save job : ' + e.message);
            });
        } else {
            // Open editor to let user add actions
            onCreate(job);
        }
    }

    render() {
        const {open} = this.props;
        const {job, isTemplate, pickEvents, random, templates, filter} = this.state;

        let title, content, dialogFilter, dialogProps = {};

        if(pickEvents) {

            const eventsModel = Events.eventsAsBBModel(filter);
            title = "Select event triggering the job";
            content = (
                <PanelBigButtons
                    model={eventsModel}
                    onPick={(eventId) => {
                        if(!job.EventNames) {
                            job.EventNames = [];
                        }
                        job.EventNames.push(eventId);
                        this.setState({pickEvents: false});
                    }}
                />
            );
            dialogFilter = (v)=>{this.setState({filter: v.toLowerCase()})}


        } else if(job) {

            title = job.Label || "Create Job";
            const children = [];

            const sectionStyle = {fontSize: 13, fontWeight: 500, color: '#455a64', padding: '10px 0'};
            // Label
            children.push(<div style={sectionStyle}>Job Label</div>);
            children.push(<ModernTextField hintText={"Job Label"} fullWidth={true} value={job.Label||''} onChange={(e,v)=>{job.Label=v; this.setState({job})}}/>);

            if(isTemplate && job.Parameters && job.Parameters.length){
                children.push(<div style={sectionStyle}>Preset Parameters</div>);
                children.push(<JobParameters parameters={job.Parameters} onChange={(v)=>{job.Parameters=v; this.setState({job})}} inDialog={true}/>)
            }

            if(!isTemplate && job.Schedule) {

                children.push(<div style={sectionStyle}>Job Schedule</div>);
                children.push(<ScheduleForm schedule={job.Schedule} onChange={(newSched) => {
                    job.Schedule = newSched;
                    this.setState({job})
                }} edit={true}/>)
            }

            children.push(
                <div style={{textAlign:'right', paddingTop: 20}}>
                    <FlatButton label={"Cancel"} onTouchTap={()=>{this.dismiss()}}/>
                    <RaisedButton disabled={!job.Label} label={"Create job"} onTouchTap={()=>{this.save()}} primary={true}/>
                </div>
            );

            content = (<div>{children}</div>);
            dialogProps = {
                bodyStyle: {
                    backgroundColor: 'white',
                    padding: 12,
                    overflow: 'visible'
                },
                contentStyle: {
                    maxWidth: 800
                }
            }

        } else {

            const bbModel = {Sections:[
                {
                    title:'Blank Jobs',
                    Actions:[
                        {
                            title:'Event-based Job',
                            description:'Blank job manually triggered',
                            icon:'mdi mdi-pulse',
                            tint:'#43a047',
                            value:()=>{
                                return {job:JobsJob.constructFromObject({
                                    ID: uuid(),
                                    Owner: 'pydio.system.user',
                                    Actions:[],
                                    EventNames: [],
                                }), pickEvents: true};
                            }
                        },
                        {
                            title:'Scheduled Job',
                            description:'Blank job manually triggered',
                            icon:'mdi mdi-timer',
                            tint:'#03a9f4',
                            value:()=>{
                                return {job:JobsJob.constructFromObject({
                                    ID: uuid(),
                                    Owner: 'pydio.system.user',
                                    Actions:[],
                                    Schedule: {"Iso8601Schedule":"R/2020-03-04T07:00:00.471Z/PT24H"}
                                })};
                            }
                        },
                        {
                            title:'Manual Job',
                            description:'Blank job manually triggered',
                            icon:'mdi mdi-gesture-tap',
                            tint:'#607d8a',
                            value:()=>{
                                return {job:JobsJob.constructFromObject({
                                    ID: uuid(),
                                    Owner: 'pydio.system.user',
                                    Actions:[],
                                })};
                            }
                        },
                    ]
                }
            ]};
            if(templates && templates.length){
                const actions = templates.map(tpl => {
                    const parts = tpl.Label.split('||');
                    let title, description, icon;
                    if(parts.length === 3){
                        title = parts[0];
                        description = parts[1];
                        icon = parts[2];
                    } else{
                        title = tpl.Label;
                        description = '';
                        icon = 'mdi mdi-chip';
                    }
                    return {
                        title:<span><span style={presetTagStyle}>preset</span>{title}</span>,
                        description,
                        icon,
                        onDelete:() => {
                            if(confirm('Do you want to remove this template?')){
                                TplManager.getInstance().deleteJob(tpl.ID).then(() => {this.loadTemplates()});
                            }
                        },
                        value: ()=>{
                            const newJob = JobsJob.constructFromObject(JSON.parse(JSON.stringify(tpl)));
                            newJob.ID = uuid();
                            newJob.Label = title;
                            newJob.Owner = 'pydio.system.user';
                            return {job:newJob, isTemplate:true};
                        }
                    }
                });
                bbModel.Sections.push({title: 'Job Templates', Actions:actions});
            }

            title = "Create a new job";
            content = (
                <PanelBigButtons
                    model={bbModel}
                    onPick={(constructor) => this.setState(constructor())}
                />
            );

        }

        return (
            <Dialog
                title={title}
                open={open}
                dialogProps={dialogProps}
                onDismiss={()=>{this.dismiss()}}
                onFilter={dialogFilter}
                random={random}
            >
                {content}
            </Dialog>
        );
    }

}

export default CreateJobs;