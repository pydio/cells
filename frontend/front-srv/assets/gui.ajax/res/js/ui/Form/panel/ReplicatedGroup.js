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

import {Component} from 'react'
import {IconButton, Paper} from 'material-ui'

const UP_ARROW = 'mdi mdi-chevron-up';
const DOWN_ARROW = 'mdi mdi-chevron-down';
const REMOVE = 'mdi mdi-close';
const ADD_VALUE = 'mdi mdi-plus';

import FormPanel from './FormPanel'

class ReplicatedGroup extends Component{

    constructor(props, context){
        super(props, context);
        const {subValues, parameters} = props;
        const firstParam = parameters[0];
        const instanceValue = subValues[firstParam['name']] || '';
        this.state = {toggled: !instanceValue};
    }

    render(){

        const {depth, onSwapUp, onSwapDown, onRemove, parameters, subValues, disabled, onAddValue} = this.props;
        const {toggled} = this.state;
        const unique = parameters.length === 1;
        const firstParam = parameters[0];
        const instanceValue = subValues[firstParam['name']] || <span style={{color: 'rgba(0,0,0,0.33)'}}>Empty Value</span>;
        const ibStyles = {width:36, height:36, padding:6}

        if (unique) {
            const disStyle = {opacity: .3};
            const remStyle =  (!!!onRemove || disabled)?disStyle:{};
            const upStyle =  (!!!onSwapUp || disabled)?disStyle:{};
            const downStyle =  (!!!onSwapDown || disabled)?disStyle:{};
            return (
                <div style={{display:'flex', width: '100%'}}>
                    <div style={{flex: 1}}>
                        <FormPanel
                            {...this.props}
                            tabs={null}
                            values={subValues}
                            onChange={null}
                            className="replicable-unique"
                            depth={-1}
                            style={{paddingBottom:0}}
                        />
                    </div>
                    <div style={{display:'flex', fontSize:24, paddingLeft: 4, paddingTop: 2}}>
                        {onAddValue &&
                        <div>
                            <div className={ADD_VALUE} style={{padding:'8px 4px', cursor:'pointer'}} onClick={onAddValue}/>
                        </div>
                        }
                        <div>
                            <div className={REMOVE} style={{padding:'8px 4px', cursor:'pointer', ...remStyle}} onClick={onRemove}/>
                        </div>
                        <div style={{display:'flex', flexDirection: 'column', padding:'0 4px'}}>
                            <div className={UP_ARROW} style={{height:16,cursor:'pointer', ...upStyle}} onClick={onSwapUp}/>
                            <div className={DOWN_ARROW} style={{height:16,cursor:'pointer', ...downStyle}} onClick={onSwapDown}/>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Paper zDepth={0} style={{border:'2px solid whitesmoke', marginBottom: 8}}>
                <div style={{display:'flex', alignItems: 'center'}}>
                    <div>{<IconButton iconClassName={'mdi mdi-menu-' + (this.state.toggled ? 'down' : 'right')} iconStyle={{color:'rgba(0,0,0,.15)'}} onTouchTap={()=>{this.setState({toggled:!this.state.toggled})}}/>}</div>
                    <div style={{flex: 1, fontSize:16}}>{instanceValue}</div>
                    <div>
                        {onAddValue && <IconButton style={ibStyles} iconClassName={ADD_VALUE} onTouchTap={onAddValue}/>}
                        <IconButton style={ibStyles} iconClassName={REMOVE} onTouchTap={onRemove} disabled={!!!onRemove || disabled}/>
                        <IconButton style={ibStyles} iconClassName={UP_ARROW} onTouchTap={onSwapUp} disabled={!!!onSwapUp || disabled}/>
                        <IconButton style={ibStyles} iconClassName={DOWN_ARROW} onTouchTap={onSwapDown} disabled={!!!onSwapDown || disabled}/>
                    </div>
                </div>
                {toggled &&
                    <FormPanel
                        {...this.props}
                        tabs={null}
                        values={subValues}
                        onChange={null}
                        className="replicable-group"
                        depth={-1}
                    />
                }
            </Paper>
        );


    }

}

export {ReplicatedGroup as default}