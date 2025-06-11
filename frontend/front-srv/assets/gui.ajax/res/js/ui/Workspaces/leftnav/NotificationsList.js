/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React, {useState} from 'react';
import {List, FlatButton} from 'material-ui';
import Pydio from 'pydio'

const {moment, JobEntry} = Pydio.requireLib('boot');
const {EmptyStateView} = Pydio.requireLib('components');

const PlaceHolder = () => {
    return <div></div>
}

export default function({pydio, ASLib, activities = [], jobs = [], loading=false, error, loadMore, onRequestClose, style={}, muiTheme}) {

    const [hover, setHover] = useState(false)

    const Activity = ASLib ? ASLib.Activity : PlaceHolder
    const m = (id)=>pydio.MessageHash['notification_center.'+id] || id;

    let emptyStateIcon = "mdi mdi-pulse";
    let emptyStateString = m(loading?'17':'18');
    if(error){
        emptyStateString = error.Detail || error.msg || error;
        emptyStateIcon = "mdi mdi-alert-circle-outline";
     }

    // Merge activities and jobs
    const all = jobs.map(j => {
        // Running will be grouped in a first category
        const running = j.Tasks && j.Tasks.filter(t => t.Status === 'Running').length
        return {time: moment(j.Time*1000), job: j, activity:undefined, running}
    })
    all.push(...activities.map(a => {return {time: moment(a.updated), activity: a, job: undefined}}))
    all.sort((a, b) => b.time - a.time)

    // Empty Case
    if(!all) {
        return (
            <EmptyStateView
                pydio={pydio}
                iconClassName={emptyStateIcon}
                primaryTextId={emptyStateString}
                style={{backgroundColor: 'transparent', minHeight: 250}}
            />);
    }

    const dateSepStyle = {
        fontSize: 13,
        color: 'var(--md-sys-color-outline)',
        fontWeight: 500
    }
    const labelStyle = {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    }

    const styles = {
        mFontContainer:{
            height: 40,
            width: 40,
            borderRadius: 20,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            position:'relative'
        },
        mFont:{
            fontSize: 20
        },
        actionIcon: {
            position:'absolute',
            bottom: -2,
            right: -2,
            fontSize: 13,
            height: 20,
            width: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'var(--md-sys-color-tertiary-container)',
            color: 'var(--md-sys-color-on-tertiary-container)',
            border: '1px solid var(--md-sys-color-surface)'
        }
    }


    let content = [];
    let previousFrom;

    all.forEach(function(obj, i){

        const {job, running, activity, time} = obj
        let fromNow = running? m('tasks.subheader') :  time.fromNow();
        if (fromNow !== previousFrom && (activity || job && job.Tasks)) {
            const padding = content.length ? '20px 16px 8px' : '0 16px 8px';
            content.push(<div style={{padding, ...dateSepStyle}}>{fromNow}</div>);
        }
        if(activity) {
            content.push(
                <Activity
                    key={'ac-' + activity.id}
                    activity={activity}
                    oneLiner={true}
                    onRequestClose={onRequestClose}
                    styles={styles}
                />
            );
        } else if(job && job.Tasks){
            let actionIcon, bg, label = labelStyle;
            const taskId = (job.Tasks && job.Tasks.length && job.Tasks[0].ID) || job.ID;
            if(running) {
                actionIcon = 'sync'
            } else {
                if(job.Tasks.filter(t => t.Status === 'Finished').length > 0) {
                    actionIcon = 'check'
                } else if(job.Tasks.filter(t => t.Status === 'Error').length > 0) {
                    actionIcon = 'error'
                }
            }
            if(hover && hover === taskId) {
                bg = {backgroundColor: muiTheme.hoverBackgroundColor}
                label = {}
            }
            content.push(
                <div key={'task-' + taskId} style={{display:'flex', padding: '12px 20px 0', ...bg}} onMouseOver={()=>setHover(taskId)} onMouseOut={()=>setHover(false)}>
                    <div style={{paddingLeft: 2, paddingRight:2}}>
                        <div className={"mimefont-container"} style={styles.mFontContainer}>
                            <div className={"mimefont mdi mdi-tools"} style={styles.mFont}/>
                            <span className={"mdi mdi-" + actionIcon} style={styles.actionIcon}/>
                        </div>
                    </div>
                    <div style={{flex: 1, overflow:'hidden'}}>
                        <JobEntry
                            job={job}
                            muiTheme={muiTheme}
                            panelStyle={{marginBottom: 0, paddingBottom: 0}}
                            titleStyle={{color:'var(--md-sys-color-on-surface)', ...label}}
                            statusStyle={{color: 'var(--md-sys-color-on-surface-variant)', ...label}}/>
                    </div>
                </div>

            )
        }
        previousFrom = fromNow;

    });
    if(loadMore){
        content.push(
            <div style={{paddingLeft:16}}>
                <FlatButton
                    primary={true}
                    label={pydio.MessageHash['notification_center.'+(loading?'20':'19')]}
                    disabled={loading}
                    onClick={loadMore}
                />
            </div>)
    }
    if(!content.length) {
        return (
            <EmptyStateView
                pydio={pydio}
                iconClassName={emptyStateIcon}
                primaryTextId={emptyStateString}
                style={{backgroundColor: 'transparent', minHeight: 250}}
            />
        )
    }
    return <List style={style}>{content}</List>;

}