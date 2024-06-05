/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import React from 'react'
import TaskAction from './TaskAction'
import {LinearProgress, Paper} from 'material-ui'
import moment from '../Moment'

function computeDuration(start, end) {
    const f = moment.utc(end.diff(start));
    const h = f.format('H') ;
    const mn = f.format('m');
    const ss = f.format('s');
    if(h === '0' && mn === '0' && ss === '0'){
        return '< 1s';
    }
    return (h === '0' ? '' : h + 'h:') + (h === '0' && mn === '0' ? '' : mn + 'mn:') + ss + 's'
}

class JobEntry extends React.Component {

    render(){

        const {job, muiTheme, panelStyle, titleStyle, statusStyle} = this.props;
        let click, clickStyle;
        if(job.openDetailPane){
            click = job.openDetailPane;
            clickStyle = {cursor:'pointer'};
        }
        if(!job.Tasks) {
            return null;
        }
        let task;
        job.Tasks.forEach(t => {
            if (t.Status === 'Running' || t.Status === 'Paused') {
                task = t;
            }
        });
        if(!task) {
            task = job.Tasks[0]
        }

        let progress;
        if(task && task.HasProgress && task.Status !== 'Error' && task.Progress < 1){
            progress = (<LinearProgress mode="determinate" min={0} max={100} value={task.Progress * 100} style={{width:'100%', height: 3}}/>);
        }
        const {mui3 = {}} = muiTheme.palette

        const styles = {
            paper: {
                margin: '0 8px 8px',
                padding: '0 8px 8px',
                backgroundColor: 'transparent',
                color: 'inherit',
                ...panelStyle,
                ...clickStyle
            },
            title: {
                fontSize: 14,
                fontWeight: 500,
                flex: 1,
                ...titleStyle
            },
            status: {
                fontSize: 13,
                color: mui3['outline-variant'],
                padding: '4px 0 8px',
                ...statusStyle
            }
        };

        let statusMessage = task.StatusMessage;
        let known = Pydio.getMessages()['ajax_gui.task.status.'+task.StatusMessage];
        if(known){
            const start = moment(task.StartTime*1000)
            const end = moment(task.EndTime*1000)
            const tokens = {
                "startTime": start.fromNow(),
                "endTime": end.fromNow(),
                "duration": computeDuration(start, end)
            }
            Object.keys(tokens).forEach(k=>{
                known = known.replace(`{${k}}`, tokens[k])
            })
            statusMessage = known;
        }


        return (
            <Paper zDepth={0} style={styles.paper} onClick={click}>
                <div style={{display:'flex', alignItems: 'center'}}>
                    <div style={styles.title}>{job.Label}</div>
                    <TaskAction {...this.props} task={task}/>
                </div>
                <div style={styles.status}>{statusMessage}</div>
                {progress}
            </Paper>
            );

    }

}

export {JobEntry as default}