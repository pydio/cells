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
import {IconButton} from 'material-ui'

class TaskAction extends React.Component {

    constructor(props){
        super(props);
        this.state = {showProgress: true};
    }

    showAction(){
        this.setState({showProgress: false});
    }

    showProgress(){
        this.setState({showProgress: true});
    }

    render(){
        const {task, onTaskAction} = this.props;

        const style = {
            iconButtonStyles:{
                style:{width:30, height: 30, padding: 6},
                iconStyle:{width:15, height: 15, fontSize: 15, color: 'rgab(0,0,0,.87)'}
            }
        };

        let actions = [];
        if(task.Status === 'Running' && task.CanPause && onTaskAction){
            actions.push(<IconButton {...style.iconButtonStyles} key="pause" iconClassName="mdi mdi-pause" onClick={() => onTaskAction(task, 'Pause')}/>);
        }
        if(task.Status === 'Paused' && task.CanPause && onTaskAction){
            actions.push(<IconButton {...style.iconButtonStyles} key="play" iconClassName="mdi mdi-play" onClick={() => onTaskAction(task, 'Resume')}/>);
        }
        if((task.Status === 'Running' || task.Status === 'Paused') && task.CanStop && onTaskAction){
            actions.push(<IconButton {...style.iconButtonStyles} key="stop" iconClassName="mdi mdi-stop" onClick={() => onTaskAction(task, 'Stop')}/>);
        }
        return <div>{actions}</div>;
    }
}

export {TaskAction as default}