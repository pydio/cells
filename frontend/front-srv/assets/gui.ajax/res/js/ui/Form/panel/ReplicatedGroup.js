/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

const {Component} = require('react')
const {IconButton, FlatButton, Paper} = require('material-ui')

const UP_ARROW = 'mdi mdi-menu-up';
const DOWN_ARROW = 'mdi mdi-menu-down';
const REMOVE = 'mdi mdi-delete-circle';

import FormPanel from './FormPanel'

class ReplicatedGroup extends Component{

    constructor(props, context){
        super(props, context);
        const {subValues, parameters} = props;
        const firstParam = parameters[0];
        const instanceValue = subValues[firstParam['name']] || '';
        this.state = {toggled: instanceValue ? false : true};
    }

    render(){

        const {depth, onSwapUp, onSwapDown, onRemove, parameters, subValues, disabled} = this.props;
        const {toggled} = this.state;
        const firstParam = parameters[0];
        const instanceValue = subValues[firstParam['name']] || <span style={{color: 'rgba(0,0,0,0.33)'}}>Empty Value</span>;

        return (
            <Paper style={{marginLeft: 2, marginRight: 2, marginBottom: 10}}>
                <div style={{display:'flex', alignItems: 'center'}}>
                    <div>{<IconButton iconClassName={'mdi mdi-chevron-' + (this.state.toggled ? 'up' : 'down')} onTouchTap={()=>{this.setState({toggled:!this.state.toggled})}}/>}</div>
                    <div style={{flex: 1, fontSize:16}}>{instanceValue}</div>
                    <div>
                        <IconButton iconClassName={UP_ARROW} onTouchTap={onSwapUp} disabled={!!!onSwapUp || disabled}/>
                        <IconButton iconClassName={DOWN_ARROW} onTouchTap={onSwapDown} disabled={!!!onSwapDown || disabled}/>
                    </div>
                </div>
                {toggled &&
                    <FormPanel
                        {...this.props}
                        tabs={null}
                        values={subValues}
                        onChange={null}
                        className="replicable-group"
                        depth={depth}
                    />
                }
                {toggled &&
                    <div style={{padding: 4, textAlign: 'right'}}>
                        <FlatButton label="Remove" primary={true} onTouchTap={onRemove} disabled={!!!onRemove || disabled}/>
                    </div>
                }
            </Paper>
        );


    }

}

export {ReplicatedGroup as default}