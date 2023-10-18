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
import {IconButton, FontIcon, FlatButton, RaisedButton, Paper} from 'material-ui'
const {JobsStore, SingleJobProgress, moment} = Pydio.requireLib("boot");
const {MaterialTable} = Pydio.requireLib('components');
import TaskActivity from './TaskActivity'
import TaskArtifacts from "./TaskArtifacts";

class TasksList extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            mode:'log', // 'log' or 'selection'
            selectedRows: [],
            working: false,
            taskLogs: null
        }
    }

    renderActions(row){

        const {pydio} = this.props;
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.task.action.' + id] || id;

        const store = JobsStore.getInstance();
        let actions = [];
        const icProps = {
            iconStyle:{color:'rgba(0,0,0,.3)'}
        };
        if (row.Status === 'Running' && row.CanPause){
            actions.push(<IconButton iconClassName={"mdi mdi-pause"} tooltip={m('pause')} onClick={()=>{store.controlTask(row, 'Pause')}} {...icProps}/>)
        }
        if(row.Status === 'Paused') {
            actions.push(<IconButton iconClassName={"mdi mdi-play"} tooltip={m('resume')} onClick={()=>{store.controlTask(row, 'Resume')}} {...icProps}/>)
        }
        if(row.Status === 'Running' || row.Status === 'Paused'){
            if(row.CanStop){
                actions.push(<IconButton iconClassName={"mdi mdi-stop"} tooltip={m('stop')} onClick={()=>{store.controlTask(row, 'Stop')}} {...icProps}/>)
            } else if(row.StatusMessage === 'Pending'){
                actions.push(<IconButton iconClassName={"mdi mdi-delete"} tooltip={m('delete')} onClick={()=>{store.controlTask(row, 'Delete')}} {...icProps}/>)
            }
        } else {
            actions.push(<IconButton iconClassName={"mdi mdi-delete"} tooltip={m('delete')} onClick={()=>{store.controlTask(row, 'Delete')}} {...icProps}/>)
        }
        return actions
    }

    onSelectTaskRows(rows) {
        const {mode} = this.state;
        if(mode === 'selection'){
            this.setState({selectedRows: rows});
        } else if(rows.length === 1){
            this.setState({taskLogs: rows[0]});
        }
    }

    setLoading(bool){
        const {onLoading} = this.props;
        this.setState({working: bool});
        if(onLoading){
            onLoading(bool);
        }
    }

    deleteSelection(){
        const {pydio, job} = this.props;
        const {selectedRows} = this.state;
        pydio.UI.openConfirmDialog({
            message: pydio.MessageHash['ajxp_admin.scheduler.tasks.delete.confirm'] + ' (' + selectedRows.length + ')',
            validCallback: () => {
                const store = JobsStore.getInstance();
                this.setLoading(true);
                store.deleteTasks(job.ID, selectedRows).then(()=>{
                    this.setState({selectedRows:[], mode:'log'});
                    this.setLoading(false);
                }).catch(() => {
                    this.setLoading(false);
                })
            }
        })
    }

    deleteAll(){
        const {pydio, job} = this.props;
        pydio.UI.openConfirmDialog({
            message:pydio.MessageHash['ajxp_admin.scheduler.tasks.delete.confirm'],
            validCallback:()=>{
                this.setLoading(true);
                const store = JobsStore.getInstance();
                store.deleteAllTasksForJob(job.ID).then(() => {
                    this.setLoading(false);
                }).catch(()=> {
                    this.setLoading(false);
                })
            }
        });
    }


    insertTaskLogRow(rows){
        const {pydio, job, descriptions = [], logTransmitter = undefined} = this.props;
        const {taskLogs, mode} = this.state;
        if(mode === 'selection'){
            return rows;
        }
        return rows.map((t) => {
            if(taskLogs && t.ID === taskLogs.ID){
                const expandedRow = (
                    <TaskActivity
                        pydio={pydio}
                        task={taskLogs}
                        job={job}
                        descriptions={descriptions}
                        onRequestClose={()=>{
                            if(logTransmitter) {
                                logTransmitter.clear()
                            }
                            this.setState({taskLogs: null})
                        }}
                        poll={t.Status === 'Running' ? 1050 : undefined}
                        logTransmitter={logTransmitter}
                    />
                );
                return {...t, expandedRow}
            } else {
                return t
            }
        });
    }

    render(){

        const {pydio, adminStyles, job, artifacts} = this.props;
        const {selectedRows, working, mode} = this.state;

        if(!job){
            return null;
        }
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;

        const actionsHeader = (
            <div style={{lineHeight:'initial', marginLeft: 5}}><IconButton iconClassName={"mdi mdi-delete-sweep"} iconStyle={{color:'rgba(0,0,0,.3)'}} tooltip={m('tasks.bulk.clear')} primary={true} onClick={this.deleteAll.bind(this)} disabled={working}/></div>
        );
        const idHeader = (
            <div style={{display:'flex', alignItems:'center', marginLeft: -20}}>
                <div style={{lineHeight:'initial', marginLeft: 5}}><IconButton iconClassName={"mdi mdi-checkbox-multiple-"+(mode === 'selection'?'marked':'blank')+"-outline"}  iconStyle={{color:'rgba(0,0,0,.3)'}} tooltip={mode === 'selection'?m('tasks.bulk.disable'):m('tasks.bulk.enable')} primary={true} onClick={()=>{this.setState({mode:mode==='selection'?'log':'selection', taskLogs: null})}} disabled={working}/></div>
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
                    let statusMessage = row.StatusMessage
                    if(artifacts && artifacts[row.ID] && Object.keys(artifacts[row.ID]).length > 0){
                        statusMessage = <TaskArtifacts statusMessage={statusMessage} artifacts={artifacts[row.ID]}/>
                    }
                    if(row.Status === 'Error') {
                        return <span style={{fontWeight: 500, color: '#E53935'}}>{statusMessage}</span>;
                    } else if (row.Status === 'Running') {
                        return <SingleJobProgress pydio={pydio} jobID={row.JobID} taskID={row.ID}/>
                    } else {
                        return statusMessage;
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
        const tasks = job.Tasks || [];
        const runningStatus = ['Running', 'Paused'];

        tasks.sort((a,b)=>{
            if(!a.StartTime || !b.StartTime || a.StartTime === b.StartTime) {
                return a.ID > b.ID ? 1 : -1;
            }
            return a.StartTime > b.StartTime ? -1 : 1;
        });

        let running = tasks.filter((t) => {return runningStatus.indexOf(t.Status) !== -1});
        running = this.insertTaskLogRow(running);
        let other = tasks.filter((t) => {return runningStatus.indexOf(t.Status) === -1});
        other = this.insertTaskLogRow(other);

        return (
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
                            {mode=== 'selection' && selectedRows.length > 1 && <div style={{lineHeight:'initial'}}><RaisedButton label={m('tasks.bulk.delete')} secondary={true} onClick={this.deleteSelection.bind(this)} disabled={working}/></div>}
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
                        rowSelected={(model) => selectedRows.filter(r=>r.ID === model.ID).length}
                        deselectOnClickAway={mode !== 'selection'}
                        masterStyles={adminStyles.body.tableMaster}
                        paginate={[10, 25, 50, 100]}
                        defaultPageSize={10}
                    />
                </Paper>
            </div>
        );

    }

}

export {TasksList as default}