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
import Color from 'color'
import LangUtils from 'pydio/util/lang'
import ScheduleForm from "./ScheduleForm";
import Events from "./Events";

import {Dialog, Paper, FlatButton, Chip} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
const {moment} = Pydio.requireLib("boot");
const {MaterialTable} = Pydio.requireLib('components');
const {colorsFromString} = Pydio.requireLib('hoc');
import Loader from './Loader'

const tagStyle = {
    borderRadius: 4,
    textAlign: 'center',
    padding: 4,
    overflow:'hidden',
    textOverflow: 'ellipsis',
    fontWeight:500,
};


class JobsList extends React.Component {

    makeTagStyle(primary, opacity, secondary = null) {
        let style = {...tagStyle}
        if(opacity){
            style.opacity = opacity
        }
        style.color = primary
        style.backgroundColor = Color(primary).alpha(.1).toString()
        if(secondary){
            style.color = secondary;
            const secColor = Color(secondary).alpha(.1).toString();
            style.backgroundImage = '-webkit-linear-gradient(-80deg, '+style.backgroundColor+' 50%, '+secColor+' 50%)'
        }
        return style
    }

    extractRowsInfo(jobs, m){

        let system = [], other = [], inactives = [];
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
                tagOpacity = .43
            }
            if(job.Schedule && job.EventNames) {
                const jNames = job.EventNames.map(e => Events.eventData(e).title).join(', ')
                data.Trigger = (
                    <div style={this.makeTagStyle('#03a9f4', tagOpacity, '#43a047')}>
                        <span className={"mdi mdi-timer"}/> <ScheduleForm schedule={job.Schedule}/>,
                        <span title={jNames}><span className={"mdi mdi-pulse"} title={m('trigger.events')}/> {jNames}</span>
                    </div>);
                data.SortValue = '1-' + job.Label;
            } else if(job.EventNames && Loader.canManualRun(job)) {
                const jNames = [...job.EventNames.map(e => Events.eventData(e).title), m('trigger.manual')].join(', ')
                data.Trigger = (
                    <div style={this.makeTagStyle('#03a9f4', tagOpacity, '#607d8b')}>
                        <span title={jNames}><span className={"mdi mdi-pulse"} title={m('trigger.events')}/> {jNames}</span>
                    </div>);
                data.SortValue = '1-' + job.Label;
            }  else if(job.Schedule) {
                data.Trigger = <div style={this.makeTagStyle('#03A9F4', tagOpacity)}><span className={"mdi mdi-timer"}/> <ScheduleForm schedule={job.Schedule}/></div>;
                data.SortValue = '0-' + job.Label;
            } else if(job.EventNames) {
                const jNames = job.EventNames.map(e => Events.eventData(e).title).join(', ')
                data.SortValue = '2-' + job.Label;
                data.Trigger = <div style={this.makeTagStyle('#43a047', tagOpacity)} title={jNames}><span className={"mdi mdi-pulse"} title={m('trigger.events')}/> {jNames}</div>;
            } else {
                data.Trigger = <div style={this.makeTagStyle('#607d8b', tagOpacity)}><span className={"mdi mdi-gesture-tap"}/> {m('trigger.manual')}</div>;
                data.SortValue = '3-' + job.Label;
            }
            if (job.Inactive) {
                data.TaskStartTime = <span style={{opacity: 0.43}}>{data.TaskStartTime}</span>;
                data.TaskEndTime = <span style={{opacity: 0.43}}>{data.TaskEndTime}</span>;
                data.TaskStatus = <span style={{opacity: 0.43}}>{data.TaskStatus}</span>;
                inactives.push(data)
            } else if (job.Owner === 'pydio.system.user') {
                system.push(data);
            } else {
                other.push(data);
            }

        });

        return {system, other, inactives};
    }

    renderTag(tag) {
        const {color, backgroundColor} = colorsFromString(tag);
        const chipStyle = {margin:'0 5px', borderRadius:'4px 16px 16px 4px'};
        const labelStyle = {color, fontWeight: 500, paddingLeft: 10, paddingRight: 16, lineHeight: '24px'};
        return (<Chip key={tag} backgroundColor={backgroundColor} labelStyle={labelStyle} style={chipStyle}>{tag}</Chip> );
    }


    render(){

        const {pydio, selectRows, muiTheme, jobs = [], loading, jobsEditable, renderGroupHeader, hideOthersIfEmpty=false} = this.props;
        const {flowsOpen} = this.state ||{};

        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        const keys = [
            {
                name:'Trigger',
                label:m('job.trigger'),
                style:{width:150, textAlign:'left', paddingRight: 0},
                headerStyle:{width:150, paddingRight: 0},
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
                style:{width:'45%', fontSize: 15},
                headerStyle:{width:'45%'},
                sorter:{
                    type: 'string',
                    value:data=>data.Label
                },
                renderCell:(row) => {
                    if(row.Metadata && row.Metadata.Tags) {
                        const tags = row.Metadata.Tags.split(',').map(t => LangUtils.trim(t, ' ')).filter(t => t).map(t => this.renderTag(t))
                        return <span style={{display: 'flex', alignItems: 'center'}}>{row.Label} <span style={{marginLeft: 6, display:'flex', zoom:0.8}}>{tags}</span></span>
                    }
                    return row.Label;
                }
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
        userKeys[0] = {
            name:'Owner',
            label:m('job.owner'),
            style:{width:180},
            headerStyle:{width:180},
            hideSmall: true
        };
        userKeys[1] = {
            ...userKeys[1],
            style:{width:'40%', fontSize: 15},
            headerStyle:{width:'40%'},
        }

        const inactiveKeys = [
            {
                name:'Trigger',
                label:m('job.trigger'),
                style:{width:150, textAlign:'left', paddingRight: 0},
                headerStyle:{width:150, paddingRight: 0},
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
                style:{fontSize: 15},
                sorter:{
                    type: 'string',
                    value:data=>data.Label
                },
                renderCell:(row) => {
                    let tags = [m('job.disabled')]
                    if(row.Metadata && row.Metadata.Tags) {
                        const tt = row.Metadata.Tags.split(',').map(t => LangUtils.trim(t, ' ')).filter(t => t)
                        tags.push(...tt)
                    }
                    return <span style={{opacity: 0.53, display: 'flex', alignItems: 'center'}}>{row.Label} <span style={{marginLeft: 6, display:'flex', zoom:0.8}}>{tags.map(t => this.renderTag(t))}</span></span>
                }
            }
        ]


        let {system, other, inactives} = this.extractRowsInfo(jobs, m);

        const groupedJobs = {}
        const knownGroups = [... new Set(system.map(j => j.Metadata && j.Metadata.GroupPath).filter(g => g))];
        if(knownGroups.length) {
            system.map(j => {
                const g = j.Metadata && j.Metadata.GroupPath || ''
                if(!groupedJobs[g]) {
                    groupedJobs[g] = []
                }
                groupedJobs[g].push(j)
            })
        } else {
            groupedJobs[''] = system
        }

        const actions = [{
            iconClassName:'mdi mdi-chevron-right',
            onClick:(row)=>selectRows([row])
        }];

        const groupKeys = Object.keys(groupedJobs).filter(k => k).sort()
        if(groupedJobs['']) {
            groupKeys.unshift('')
        }
        const gLabelMess = (id) => Pydio.getMessages()['ajxp_admin.metadata.' + id]

        return (
            <div style={{flex:1, overflowY: 'auto'}}>
                <AdminComponents.SubHeader
                    title={m('system.title')}
                    legend={m('system.legend')}
                />
                {groupKeys.map(key => {
                    let groupHeader;
                    if(renderGroupHeader) {
                        groupHeader = renderGroupHeader(key, knownGroups)
                    } else if(key) {
                        groupHeader = <div style={{padding: 20, fontWeight: 500, paddingBottom: 0}}>{'['+gLabelMess('group')+'] ' + key}</div>
                    } else if(knownGroups.length) {
                        groupHeader = <div style={{padding: 20, fontWeight: 500, paddingBottom: 0}}>{gLabelMess('default-group')}</div>
                    }
                    return (
                        <React.Fragment>
                            {groupHeader}
                            <Paper {...adminStyles.body.block.props}>
                                <MaterialTable
                                    data={groupedJobs[key]}
                                    columns={keys}
                                    actions={actions}
                                    onSelectRows={(rows)=>{selectRows(rows)}}
                                    showCheckboxes={false}
                                    emptyStateString={loading ? Pydio.getInstance().MessageHash[466] : m('system.empty')}
                                    masterStyles={adminStyles.body.tableMaster}
                                    storageKey={'console.scheduler.jobs.list'}
                                />
                            </Paper>
                        </React.Fragment>
                    )
                })}
                {jobsEditable &&
                <div
                    style={{...adminStyles.body.block.container, backgroundColor: 'white', fontSize: 15, display:'flex', alignItems: 'center', cursor:'pointer'}}
                    onClick={()=>{this.setState({flowsOpen: true})}}
                >
                    <Dialog
                        open={flowsOpen}
                        bodyStyle={{padding: 0, minHeight: 450}}
                        contentStyle={{maxWidth: 622}}
                        onRequestClose={()=>this.setState({flowsOpen: false})}
                        actions={[
                            <FlatButton label={pydio.MessageHash[54]} onClick={()=>this.setState({flowsOpen: false})}/>,
                            <FlatButton secondary={true} label={m('cellsflows.dialog.button')} onClick={()=> {window.open('https://pydio.com/en/pydio-cells/cells-flows?utm_source=cellsflows-app'); this.setState({flowsOpen: false})}}/>
                        ]}
                    >
                        <img src={"/plug/access.settings/res/images/cellsflows.png"} alt={"Cells Flows"} style={{width: '100%'}}/>
                        <div style={{fontSize: 14, padding: '16px 20px',borderTop: '1px solid rgba(0, 0, 0, .1)', textAlign: 'justify', color: 'rgba(0,0,0,.73)'}}>{m('cellsflows.dialog.text')}</div>
                    </Dialog>
                    <div style={{width: 180, paddingLeft: 24}}>
                        <FlatButton
                            label={m('cellsflows.cta.button')}
                            disabled={true}
                            backgroundColor={"rgb(251, 251, 252)"}
                            style={{width:'100%', height: 30, lineHeight:'30px'}}
                            secondary={true}
                            onClick={() => {}}
                        />
                    </div>
                    <div style={{flex: 1, padding: '16px 24px'}}>{m('cellsflows.cta.text')}</div>
                    <div style={{fontSize: 20, paddingRight: 24, color:'rgba(0,0,0,.33)'}}>
                        <span className={"mdi mdi-chevron-right"}/>
                    </div>
                </div>
                }
                {((other && other.length > 0) || !hideOthersIfEmpty) &&
                    <React.Fragment>
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
                                paginate={[25, 50, 100]}
                            />
                        </Paper>
                    </React.Fragment>
                }
                {inactives && inactives.length > 0 &&
                <React.Fragment>
                    <AdminComponents.SubHeader
                        title={m('inactives.title')}
                        legend={m('inactives.legend')}
                    />
                    <Paper {...adminStyles.body.block.props}>
                        <MaterialTable
                            data={inactives}
                            columns={inactiveKeys}
                            actions={actions}
                            onSelectRows={(rows)=>{selectRows(rows)}}
                            showCheckboxes={false}
                            masterStyles={adminStyles.body.tableMaster}
                        />
                    </Paper>
                </React.Fragment>
                }
            </div>
        );

    }

}

JobsList = muiThemeable()(JobsList);
export default JobsList;