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
import Pydio from 'pydio'
import {IconButton, FontIcon, FlatButton, RaisedButton, Paper} from 'material-ui'
const {JobsStore, SingleJobProgress, moment} = Pydio.requireLib("boot");
const {MaterialTable} = Pydio.requireLib('components');
import TaskActivity from './TaskActivity'
import JobGraph from "./JobGraph";
import ResourcesManager from 'pydio/http/resources-manager'

class JobBoard extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            mode:'log', // 'log' or 'selection'
            selectedRows: [],
            working: false,
            taskLogs: null,
            job: props.job,
            create: props.create,
            descriptions: {},
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.job && (nextProps.job.Tasks !== this.props.job.Tasks || nextProps.job.Inactive !== this.props.job.Inactive)) {
            this.setState({job: nextProps.job});
        }
    }

    renderActions(row){

        const {pydio} = this.props;
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.task.action.' + id] || id;

        const store = JobsStore.getInstance();
        let actions = [];
        const icProps = {
            iconStyle:{color:'rgba(0,0,0,.3)'},
            onClick:e => e.stopPropagation()
        };
        if (row.Status === 'Running' && row.CanPause){
            actions.push(<IconButton iconClassName={"mdi mdi-pause"} tooltip={m('pause')} onTouchTap={()=>{store.controlTask(row, 'Pause')}} {...icProps}/>)
        }
        if(row.Status === 'Paused') {
            actions.push(<IconButton iconClassName={"mdi mdi-play"} tooltip={m('resume')} onTouchTap={()=>{store.controlTask(row, 'Resume')}} {...icProps}/>)
        }
        if(row.Status === 'Running' || row.Status === 'Paused'){
            if(row.CanStop){
                actions.push(<IconButton iconClassName={"mdi mdi-stop"} tooltip={m('stop')} onTouchTap={()=>{store.controlTask(row, 'Stop')}} {...icProps}/>)
            } else if(row.StatusMessage === 'Pending'){
                actions.push(<IconButton iconClassName={"mdi mdi-delete"} tooltip={m('delete')} onTouchTap={()=>{store.controlTask(row, 'Delete')}} {...icProps}/>)
            }
        } else {
            actions.push(<IconButton iconClassName={"mdi mdi-delete"} tooltip={m('delete')} onTouchTap={()=>{store.controlTask(row, 'Delete')}} {...icProps}/>)
        }
        return actions
    }

    onSelectTaskRows(rows) {
        const {mode} = this.state;
        if(mode === 'selection'){
            this.setState({selectedRows: rows});
        } else if(rows.length === 1 && !rows[0].colSpan){
            this.setState({taskLogs: rows[0]});
        }
    }

    deleteSelection(){
        const {selectedRows} = this.state;
        const {job} = this.state;
        const store = JobsStore.getInstance();
        this.setState({working: true});
        store.deleteTasks(job.ID, selectedRows).then(()=>{
            this.setState({working: false, selectedRows:[], mode:'log'})
        })
    }

    deleteAll(){
        if(window.confirm('Are you sure?')){
            this.setState({working: true});
            const {job} = this.state;
            const store = JobsStore.getInstance();
            store.deleteAllTasksForJob(job.ID).then(() => {
                this.setState({working: false});
            })
        }
    }

    deleteJob(){
        const {pydio, onRequestClose} = this.props;
        const {job, create} = this.state;
        if(create) {
            return
        }
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        if(!window.confirm(m('job.delete.confirm'))){
            return
        }
        ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
            const {SchedulerServiceApi} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            return api.deleteJob(job.ID);
        }).then(()=> {
            onRequestClose(true);
        }).catch((e) => {

        })
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

    insertTaskLogRow(rows){
        const {pydio} = this.props;
        const {job, descriptions, taskLogs} = this.state;
        if(!taskLogs){
            return rows;
        }
        const insert = [];
        rows.forEach((t) => {
            insert.push(t);
            if(t.ID === taskLogs.ID){
                insert.push({
                    colSpan: true,
                    rowStyle: {borderLeft: '2px solid #1e96f3'},
                    element: <TaskActivity
                        pydio={pydio}
                        task={taskLogs}
                        job={job}
                        descriptions={descriptions}
                        onRequestClose={()=>this.setState({taskLogs: null})}
                    />
                })
            }
        });
        return insert;
    }

    render(){

        const {pydio, jobsEditable, onRequestClose, adminStyles} = this.props;
        const {selectedRows, working, mode, taskLogs, create, job, showAll} = this.state;

        if(!job){
            return null;
        }
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;

        const actionsHeader = (
            <div style={{lineHeight:'initial', marginLeft: 5}}><IconButton iconClassName={"mdi mdi-delete-sweep"} iconStyle={{color:'rgba(0,0,0,.3)'}} tooltip={m('tasks.bulk.clear')} primary={true} onTouchTap={this.deleteAll.bind(this)} disabled={working}/></div>
        );
        const idHeader = (
            <div style={{display:'flex', alignItems:'center', marginLeft: -20}}>
                <div style={{lineHeight:'initial', marginLeft: 5}}><IconButton iconClassName={"mdi mdi-checkbox-multiple-"+(mode === 'selection'?'marked':'blank')+"-outline"}  iconStyle={{color:'rgba(0,0,0,.3)'}} tooltip={mode === 'selection'?m('tasks.bulk.disable'):m('tasks.bulk.enable')} primary={true} onTouchTap={()=>{this.setState({mode:mode==='selection'?'log':'selection', taskLogs: null})}} disabled={working}/></div>
                <span>{m('task.id')}</span>
            </div>
        );

        const keys = [
            {name:'ID', label:idHeader, hideSmall: true, style:{width: 110, fontSize: 15, paddingLeft: 20}, headerStyle:{width: 110, paddingLeft: 20}, renderCell:(row)=>row.ID.substr(0,8)},
            {name:'StartTime', style:{width: 100, paddingRight: 10}, headerStyle:{width: 100, paddingRight: 10}, label:m('task.start'), renderCell:(row)=>{
                const m = moment(row.StartTime * 1000);
                let dateString;
                if (m.isSame(Date.now(), 'day')){
                    dateString = m.format('HH:mm:ss');
                } else {
                    dateString = m.fromNow();
                }
                return dateString;
            }},
            {name:'StatusMessage', label:m('task.message'), hideSmall: true, renderCell:(row)=>{
                if(row.Status === 'Error') {
                    return <span style={{fontWeight: 500, color: '#E53935'}}>{row.StatusMessage}</span>;
                } else if (row.Status === 'Running') {
                    return <SingleJobProgress pydio={pydio} jobID={row.JobID} taskID={row.ID}/>
                } else {
                    return row.StatusMessage;
                }
            }},
            {name:'EndTime', style:{width: 100}, headerStyle:{width: 100}, label:m('task.duration'), hideSmall: true, renderCell: (row) => {
                    let e = moment(Date.now());
                    if(row.EndTime){
                        e = moment(row.EndTime * 1000);
                    }
                    const d = e.diff(moment(row.StartTime * 1000));
                    const f = moment.utc(d);
                    const h = f.format('H') ;
                    const mn = f.format('m');
                    const ss = f.format('s');
                    if(h === '0' && mn === '0' && ss === '0'){
                        return '< 1s';
                    }
                    return (h === '0' ? '' : h + 'h:') + (h === '0' && mn === '0' ? '' : mn + 'mn:') + ss + 's'
                }},
            {name:'Actions', label:actionsHeader, style:{textAlign:'right', width: 120, paddingLeft:0}, headerStyle:{width: 120, paddingLeft: 0, paddingRight: 20, textAlign: 'right'}, renderCell:this.renderActions.bind(this)}
        ];
        const computeRowStyle = (row) => {
            if(taskLogs && taskLogs.ID === row.ID){
                return {
                    backgroundColor:'#e0e0e0',
                    fontWeight: 500,
                    borderLeft: '2px solid #1e96f3'
                };
            }
            return null;
        };
        const tasks = job.Tasks || [];
        const runningStatus = ['Running', 'Paused'];

        tasks.sort((a,b)=>{
            if(!a.StartTime || !b.StartTime || a.StartTime === b.StartTime) {
                return a.ID > b.ID ? 1 : -1;
            }
            return a.StartTime > b.StartTime ? -1 : 1;
        });

        let actions = [];
        const flatProps = {...adminStyles.props.header.flatButton};
        const iconColor = adminStyles.props.header.flatButton.labelStyle.color;
        if(!create){
            if(!job.EventNames){
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
            if(jobsEditable) {
                actions.push(<FlatButton icon={<FontIcon className={"mdi mdi-delete"} color={iconColor}/>}  label={m('job.delete')} primary={true} onTouchTap={()=>{this.deleteJob()}} {...flatProps}/>)
            }
        }
        let running = tasks.filter((t) => {return runningStatus.indexOf(t.Status) !== -1});
        running = this.insertTaskLogRow(running);
        let other = tasks.filter((t) => {return runningStatus.indexOf(t.Status) === -1});
        let more;
        if(!showAll && other.length > 10) {
            more = other.length - 10;
            other = other.slice(0, 10);
        }
        other = this.insertTaskLogRow(other);

        return (
            <div style={{height: '100%', display:'flex', flexDirection:'column', position:'relative'}}>
                <AdminComponents.Header
                    title={<span><a style={{cursor:'pointer', borderBottom:'1px solid rgba(0,0,0,.87)'}} onTouchTap={onRequestClose}>{pydio.MessageHash['ajxp_admin.scheduler.title']}</a> / {job.Label} {job.Inactive ? ' [disabled]' : ''}</span>}
                    backButtonAction={onRequestClose}
                    actions={actions}
                    loading={working}
                />
                <div style={{flex:1, overflowY: 'auto'}}>
                    <JobGraph
                        job={job}
                        random={Math.random()}
                        jobsEditable={jobsEditable}
                        create={create}
                        adminStyles={adminStyles}
                        onJobSave={this.onJobSave.bind(this)}
                        onJsonSave={this.onJsonSave.bind(this)}
                        onUpdateDescriptions={(desc) => {this.setState({descriptions: desc})}}
                    />
                    {!create &&
                    <div>
                        {running.length > 0 &&  <AdminComponents.SubHeader title={m('tasks.running')} />}
                        {running.length > 0 &&
                        <Paper {...adminStyles.body.block.props}>
                            <MaterialTable
                                data={running}
                                columns={keys}
                                hideHeaders={true}
                                showCheckboxes={false}
                                emptyStateString={m('tasks.running.empty')}
                                onSelectRows={(rows) => {
                                    if (rows.length === 1 && running.length) {
                                        this.setState({taskLogs: rows[0]});
                                    }
                                }}
                                masterStyles={adminStyles.body.tableMaster}
                            />
                        </Paper>
                        }
                        <AdminComponents.SubHeader
                            title={
                                <div style={{display:'flex', width:'100%', alignItems:'baseline'}}>
                                    <div style={{flex: 1}}>{m('tasks.history')}</div>
                                    {mode=== 'selection' && selectedRows.length > 1 && <div style={{lineHeight:'initial'}}><RaisedButton label={m('tasks.bulk.delete')} secondary={true} onTouchTap={this.deleteSelection.bind(this)} disabled={working}/></div>}
                                </div>
                            }
                        />
                        <Paper {...adminStyles.body.block.props}>
                            <MaterialTable
                                data={other}
                                columns={keys}
                                showCheckboxes={mode === 'selection'}
                                onSelectRows={this.onSelectTaskRows.bind(this)}
                                emptyStateString={m('tasks.history.empty')}
                                selectedRows={selectedRows}
                                deselectOnClickAway={true}
                                computeRowStyle={computeRowStyle}
                                masterStyles={adminStyles.body.tableMaster}
                            />
                            {more  && <div onClick={()=>{this.setState({showAll:true})}} style={{cursor: 'pointer', textDecoration:'underline', padding: 20, borderTop:'1px solid #eee'}}>{m('tasks.history.more').replace('%s', more)}</div>}
                        </Paper>
                    </div>
                    }
                </div>
            </div>
        );

    }

}

export {JobBoard as default}