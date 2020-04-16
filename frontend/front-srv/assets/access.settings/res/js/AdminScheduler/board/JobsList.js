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
import ScheduleForm from "./ScheduleForm";
import Events from "./Events";

import {IconButton, Paper, Dialog} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
const {moment} = Pydio.requireLib("boot");
const {MaterialTable} = Pydio.requireLib('components');


class JobsList extends React.Component {

    extractRowsInfo(jobs, m){

        const tagStyle = {
            color: 'white',
            borderRadius: 4,
            textAlign: 'center',
            padding: 4,
            overflow:'hidden',
            textOverflow: 'ellipsis'
        };
        let system = [];
        let other = [];
        if (jobs === undefined) {
            return {system, other};
        }
        jobs.map(job => {

            let data = {...job, SortEndTime:0, SortStatus:'UNKOWN'};
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
                data.SortEndTime = t.EndTime || 0;
                data.SortStatus = t.Status;
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
            let tagOpacity;
            if(job.Inactive){
                tagOpacity = {opacity: .43}
            }
            if(job.Schedule) {
                data.Trigger = <div style={{...tagStyle, ...tagOpacity, backgroundColor:'#03A9F4'}}><span className={"mdi mdi-timer"}/><ScheduleForm schedule={job.Schedule}/></div>;
                data.SortValue = '0-' + job.Label;
            } else if(job.EventNames) {
                data.SortValue = '1-' + job.Label;
                data.Trigger = <div style={{...tagStyle, ...tagOpacity, backgroundColor:'#43a047'}}><span className={"mdi mdi-pulse"} title={m('trigger.events')}/> {job.EventNames.map(e => Events.eventData(e).title).join(', ')}</div>;
            } else {
                data.Trigger = <div style={{...tagStyle, ...tagOpacity, backgroundColor:'#607d8b'}}><span className={"mdi mdi-gesture-tap"}/> {m('trigger.manual')}</div>;
                data.SortValue = '2-' + job.Label;
            }
            if (job.Inactive) {
                data.Label = <span style={{color: 'rgba(0,0,0,0.43)'}}>[{m('job.disabled')}] {data.Label}</span>;
                data.TaskStartTime = <span style={{opacity: 0.43}}>{data.TaskStartTime}</span>;
                data.TaskEndTime = <span style={{opacity: 0.43}}>{data.TaskEndTime}</span>;
                data.TaskStatus = <span style={{opacity: 0.43}}>{data.TaskStatus}</span>;
                data.SortValue = '3-' + job.Label;
            }

            if (job.Owner === 'pydio.system.user') {
                system.push(data);
            } else {
                other.push(data);
            }

        });

        return {system, other};
    }

    render(){

        const {pydio, selectRows, muiTheme, jobs = [], loading} = this.props;

        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        const keys = [
            {
                name:'Trigger',
                label:m('job.trigger'),
                style:{width:180, textAlign:'left', paddingRight: 0},
                headerStyle:{width:180, paddingRight: 0},
                hideSmall: true,
                sorter:{
                    type:'number',
                    default:true,
                    value:row=>row.SortValue
                }
            },
            {
                name:'Label',
                label:m('job.label'),
                style:{width:'40%', fontSize: 15},
                headerStyle:{width:'40%'},
                sorter:{type:'string'}
            },
            {
                name:'TaskEndTime',
                label:m('job.endTime'),
                style:{width:'15%'},
                headerStyle:{width:'15%'},
                sorter:{type:'number', value:row=>row.SortEndTime},
                hideSmall: true
            },
            {
                name:'TaskStatus',
                label:m('job.status'),
                sorter:{type:'string', value:row=>row.SortStatus}
            }
        ];

        const userKeys = [...keys];
        // Replace Trigger by Owner
        userKeys[1] = {
            name:'Owner',
            label:m('job.owner'),
            style:{width:'15%'},
            headerStyle:{width:'15%'},
            hideSmall: true
        };


        let {system, other} = this.extractRowsInfo(jobs, m);
        const actions = [{
            iconClassName:'mdi mdi-chevron-right',
            onTouchTap:(row)=>selectRows([row])
        }];

        return (
            <div style={{flex:1, overflowY: 'auto'}}>
                <AdminComponents.SubHeader
                    title={m('system.title')}
                    legend={m('system.legend')}
                />
                <Paper {...adminStyles.body.block.props}>
                    <MaterialTable
                        data={system}
                        columns={keys}
                        actions={actions}
                        onSelectRows={(rows)=>{selectRows(rows)}}
                        showCheckboxes={false}
                        emptyStateString={loading ? Pydio.getInstance().MessageHash[466] : m('system.empty')}
                        masterStyles={adminStyles.body.tableMaster}
                    />
                </Paper>
                <AdminComponents.SubHeader
                    title={m('users.title')}
                    legend={m('users.legend')}
                />
                <Paper {...adminStyles.body.block.props}>
                    <MaterialTable
                        data={other}
                        columns={userKeys}
                        onSelectRows={(rows)=>{selectRows(rows)}}
                        showCheckboxes={false}
                        emptyStateString={m('users.empty')}
                        masterStyles={adminStyles.body.tableMaster}
                    />
                </Paper>
            </div>
        );

    }

}

JobsList = muiThemeable()(JobsList);
export default JobsList;