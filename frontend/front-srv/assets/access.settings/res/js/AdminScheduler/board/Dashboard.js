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

import React from 'react'
import {IconMenu, Divider, IconButton, MenuItem, FlatButton, Paper} from 'material-ui'
import Pydio from 'pydio'
const {JobsStore, moment} = Pydio.requireLib("boot");
const {MaterialTable} = Pydio.requireLib('components');
import JobBoard from './JobBoard'
import JobSchedule from './JobSchedule'
import debounce from 'lodash.debounce'

const Dashboard = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    eventsNames: {
        '0':'trigger.create.node',
        '1':'trigger.read.node',
        '2':'trigger.update.path',
        '3':'trigger.update.content',
        '4':'trigger.update.metadata',
        '5':'trigger.delete.node'
    },

    getInitialState(){
        return {
            Owner: null,
            Filter: null,
        }
    },

    load(hideLoading = false){
        const {Owner, Filter} = this.state;
        if (!hideLoading) {
            this.setState({loading: true});
        }
        JobsStore.getInstance().getAdminJobs(Owner, Filter, "", 1).then(jobs => {
            this.setState({result: jobs, loading: false});
        }).catch(reason => {
            this.setState({error: reason.message, loading: false});
        })
    },

    loadOne(jobID, hideLoading = false) {
        // Merge job inside global results
        const {result} = this.state;
        if(!hideLoading){
            this.setState({loading: true});
        }
        return JobsStore.getInstance().getAdminJobs(null, null, jobID).then(jobs => {
            result.Jobs.forEach((v, k) => {
                if (v.ID === jobID){
                    result.Jobs[k] = jobs.Jobs[0];
                }
            });
            this.setState({result, loading: false});
            return result
        }).catch(reason => {
            this.setState({error: reason.message, loading: false});
        });
    },

    componentDidMount(){
        this.load();
        this._loadDebounced = debounce((jobId)=>{
            if (jobId && this.state && this.state.selectJob === jobId){
                this.loadOne(jobId, true);
            } else {
                this.load(true)
            }
        }, 500);
        JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
        this._poll = setInterval(()=>{
            if (this.state && this.state.selectJob){
                this.loadOne(this.state.selectJob, true);
            } else {
                this.load(true)
            }
        }, 10000);
    },

    componentWillUnmount(){
        if(this._poll){
            clearInterval(this._poll);
        }
        JobsStore.getInstance().stopObserving("tasks_updated");
    },

    selectRows(rows){
        if(rows.length){
            const jobID = rows[0].ID;
            this.loadOne(jobID).then(() => {
                this.setState({selectJob:jobID});
            });
        }
    },

    showTaskCreator(){

    },

    extractRowsInfo(jobs, m){


        let system = [];
        let other = [];
        if (jobs === undefined) {
            return {system, other};
        }
        jobs.map(job => {

            let data = {...job};
            if (job.Tasks !== undefined) {
                // Sort task by StartTime
                job.Tasks.sort((a,b) => {
                    if(!a.StartTime || !b.StartTime || a.StartTime === b.StartTime) {
                        return a.ID > b.ID ? 1 : -1;
                    }
                    return a.StartTime > b.StartTime ? -1 : 1;
                });
                const t = job.Tasks[0];
                data.TaskStartTime = moment(new Date(parseInt(t.StartTime) * 1000)).fromNow();
                if(t.EndTime){
                    data.TaskEndTime = moment(new Date(parseInt(t.EndTime) * 1000)).fromNow();
                } else {
                    data.TaskEndTime = '-';
                }
                if(t.Status === 'Finished') {
                    data.TaskStatus = t.Status;
                } else if (t.Status === 'Running') {
                    // There might be many tasks running
                    const count = job.Tasks.filter(ft => ft.Status === 'Running').length;
                    data.TaskStatus = <span style={{fontWeight: 500, color: '#388e3c'}}>{count} tasks running</span>;
                } else if(t.Status === 'Error') {
                    data.TaskStatus = <span style={{fontWeight: 500, color: '#E53935'}}>{t.StatusMessage}</span>;
                } else if(t.Status === 'Queued') {
                    data.TaskStatus = <span style={{fontWeight: 500, color: '#fb8c00'}}>{t.StatusMessage}</span>;
                } else {
                    data.TaskStatus = <span>{t.Status} ({t.StatusMessage})</span>;
                }
            } else {
                data.TaskStatus = "-";
                data.TaskEndTime = "-";
                data.TaskStartTime = "-";
            }

            if(job.Schedule) {
                data.Trigger = <JobSchedule job={job}/>;// m('trigger.periodic');
                data.TriggerValue = 1;
            } else if(job.EventNames) {
                data.TriggerValue = 2;
                data.Trigger = m('trigger.events') + ': ' + job.EventNames.map(e => {
                    if(e.indexOf('NODE_CHANGE:') === 0){
                        return m(this.eventsNames[e.replace('NODE_CHANGE:', '')]);
                    }else {
                        return e;
                    }
                }).join(', ');
            } else if(job.AutoStart) {
                data.Trigger = m('trigger.manual');
                data.TriggerValue = 0;
            } else {
                data.Trigger = '-';
                data.TriggerValue = 3;
            }
            if (job.Inactive) {
                data.Label = <span style={{color: 'rgba(0,0,0,0.43)'}}>[{m('job.disabled')}] {data.Label}</span>;
            }

            if (job.Owner === 'pydio.system.user') {
                system.push(data);
            } else {
                other.push(data);
            }

        });

        return {system, other};
    },

    render(){

        const {pydio, jobsEditable} = this.props;
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;

        const keys = [
            {
                name:'Label',
                label:m('job.label'),
                style:{width:'35%', fontSize: 15},
                headerStyle:{width:'35%'},
            },
            {
                name:'Owner',
                label:m('job.owner'),
                style:{width:'15%'},
                headerStyle:{width:'15%'},
                hideSmall: true
            },
            {
                name:'Trigger',
                label:m('job.trigger'),
                style:{width:'15%'},
                headerStyle:{width:'15%'},
                hideSmall: true
            },
            {
                name:'TaskEndTime',
                label:m('job.endTime'),
                style:{width:'15%'},
                headerStyle:{width:'15%'},
                hideSmall: true
            },
            {
                name:'TaskStatus',
                label:m('job.status'),
            },
            {
                name:'More',
                label:'',
                style:{width: 100}, headerStyle:{width: 100},
                renderCell:(row) => {return <IconButton iconClassName="mdi mdi-chevron-right" iconStyle={{color:'rgba(0,0,0,.3)'}} onTouchTap={()=>{this.setState({selectJob:row.ID})}}/>},
            },
        ];

        const {result, loading, selectJob} = this.state;
        if(selectJob && result && result.Jobs){
            const found = result.Jobs.filter((j) => j.ID === selectJob);
            if(found.length){
                return <JobBoard pydio={pydio} job={found[0]} jobsEditable={jobsEditable} onRequestClose={()=>this.setState({selectJob: null})}/>;
            }
        }
        let {system, other} = this.extractRowsInfo(result ? result.Jobs : [], m);
        system.sort((a,b) => {
            return a.TriggerValue === b.TriggerValue ? 0 : (a.TriggerValue > b.TriggerValue ? 1 : -1 );
        });

        return (
            <div style={{height: '100%', display:'flex', flexDirection:'column', position:'relative'}}>
                <AdminComponents.Header
                    title={m('title')}
                    icon="mdi mdi-timetable"
                    actions={[]}
                    reloadAction={this.load.bind(this)}
                    loading={loading}
                />
                <div style={{flex:1, overflowY: 'auto'}}>
                    <AdminComponents.SubHeader
                        title={m('system.title')}
                        legend={m('system.legend')}
                    />
                    <Paper style={{margin: 20}}>
                        <MaterialTable
                            data={system}
                            columns={keys}
                            onSelectRows={(rows)=>{this.selectRows(rows)}}
                            showCheckboxes={false}
                            emptyStateString={loading ? this.context.getMessage('466', '') : m('system.empty')}
                        />
                    </Paper>
                    <AdminComponents.SubHeader
                        title={m('users.title')}
                        legend={m('users.legend')}
                    />
                    <Paper style={{margin: 20}}>
                        <MaterialTable
                            data={other}
                            columns={keys}
                            onSelectRows={(rows)=>{this.selectRows(rows)}}
                            showCheckboxes={false}
                            emptyStateString={m('users.empty')}
                        />
                    </Paper>
                </div>
            </div>
        );

    }

});

export {Dashboard as default};