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

import React from 'react'
import TaskAction from './TaskAction'
import {LinearProgress, Paper} from 'material-ui'

class JobEntry extends React.Component {

    render(){

        const {job, muiTheme} = this.props;
        let click, clickStyle;
        if(job.openDetailPane){
            click = job.openDetailPane;
            clickStyle = {cursor:'pointer'};
        }
        let task;
        job.Tasks.forEach(t => {
            if (t.Status === 'Running' || t.Status === 'Paused') {
                task = t;
            }
        });

        let progress;
        if(task && task.HasProgress && task.Status !== 'Error' && task.Progress < 1){
            progress = (<LinearProgress mode="determinate" min={0} max={100} value={task.Progress * 100} style={{width:'100%', height: 2}}/>);
        }
        const {mui3 = {}} = muiTheme.palette

        const styles = {
            paper: {
                margin: '0 8px 8px',
                padding: '0 8px 8px',
                backgroundColor: 'transparent',
                color: 'inherit',
                ...clickStyle
            },
            title: {
                fontSize: 14,
                fontWeight: 500,
                flex: 1
            },
            status: {
                fontSize: 13,
                color: mui3['outline-variant'],
                padding: '4px 0 8px'
            }
        };

        return (
            <Paper zDepth={0} style={styles.paper} onClick={click}>
                <div style={{display:'flex', alignItems: 'center'}}>
                    <div style={styles.title}>{job.Label}</div>
                    <TaskAction {...this.props} task={task}/>
                </div>
                <div style={styles.status}>{task.StatusMessage}</div>
                {progress}
            </Paper>
            );

    }

}

export {JobEntry as default}