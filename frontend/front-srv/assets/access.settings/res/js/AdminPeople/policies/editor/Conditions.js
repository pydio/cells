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
import {Paper, IconButton, IconMenu, MenuItem, Divider, Subheader} from 'material-ui'

class Conditions extends React.Component{

    constructor(props){
        super(props);
        this.state = {};
    }

    onConditionAdd(event, fieldName){
        const {rule} = this.props;
        if(!rule.conditions || !rule.conditions[fieldName]) {
            const conds = rule.conditions || {};
            const newConds = {...conds};
            newConds[fieldName] = {type:"", options:{}, jsonOptions:"{}"};
            this.setState({[fieldName + 'JsonInvalid']:'please provide a condition type'});
            this.props.onChange({...rule, conditions: newConds});
        }
    }

    onConditionRemove(fieldName) {
        const {rule} = this.props;
        let newConds = {...rule.conditions};
        delete newConds[fieldName];
        this.props.onChange({...rule, conditions: newConds});
    }

    onChange(fieldName, event, newValue){
        const {rule} = this.props;
        let parsedValue;
        try{
            parsedValue = JSON.parse(newValue);
            if(!parsedValue.type) {
                this.setState({[fieldName + 'JsonInvalid']:'please provide a condition type'});
                return;
            }
        } catch(e){
            this.setState({[fieldName + 'JsonInvalid']:'invalid json'});
            return;
        }
        this.setState({[fieldName + 'JsonInvalid']:null});
        if(parsedValue.options){
            parsedValue.jsonOptions = JSON.stringify(parsedValue.options);
        }
        let newConds = {...rule.conditions};
        newConds[fieldName] = parsedValue;
        this.props.onChange({...rule, conditions: newConds});
    }

    render(){

        const {rule, containerStyle} = this.props;
        let conditions = [];
        if (rule.conditions) {
            let i = 0;
            conditions = Object.keys(rule.conditions).map((k) => {
                i ++;
                let displayCond = {...rule.conditions[k]};
                if(displayCond.jsonOptions) {
                    displayCond.options = JSON.parse(displayCond.jsonOptions);
                    delete displayCond['jsonOptions'];
                }
                return (
                    <div style={{marginLeft: 100}}>
                        <div style={{display:'flex',alignItems:'baseline', marginTop: i == 1 ? -10 : 0}}>
                            {k}
                            <div style={{flex:1}}>
                                <IconButton iconClassName={"mdi mdi-delete"} tooltip={"Remove Condition"} onTouchTap={this.onConditionRemove.bind(this, k)}/>
                            </div>
                            <div style={{color: '#C62828', fontSize: 13, fontWeight: 500}}>{this.state[k+'JsonInvalid']}</div>
                        </div>
                        <Paper zDepth={1}>
                            <AdminComponents.CodeMirrorField
                                key={rule.id + '-' + k}
                                mode="json"
                                value={JSON.stringify(displayCond, null, 2)}
                                onChange={this.onChange.bind(this, k)}
                            />
                        </Paper>
                    </div>
                );
            });
        }

        const fields = [
            "HEADER:Query Context",
            "RemoteAddress", "RequestMethod", "RequestURI", "HttpProtocol", "UserAgent", "ContentType", "CookiesString", "RemoteAddress",
            "DIVIDER",
            "HEADER:Node Filters",
            "NodeMetaName", "NodeMetaPath", "NodeMetaExtension", "NodeMetaMimeType", "NodeMetaSize", "NodeMetaMTime", "NodeMeta"
        ];

        return (
            <div style={{...containerStyle, margin:'6px 16px'}}>
                <div style={{display:'flex', alignItems:'center'}}>
                    <div style={{width: 100, fontWeight:500}}>Conditions</div>
                    <div style={{width:100, flex: 1}}>{rule.conditions ? '' : 'No conditions set'}</div>

                    <IconMenu
                        iconButtonElement={<IconButton iconClassName={"mdi mdi-plus"} tooltip={"Add value..."}/>}
                        onChange={this.onConditionAdd.bind(this)}
                        maxHeight={250}
                    >
                        {fields.map((k) => {
                            if(k === 'DIVIDER') {
                                return <Divider/>
                            } else if(k.startsWith("HEADER:")){
                                return <Subheader>{k.replace("HEADER:", "")}</Subheader>
                            } else {
                                return <MenuItem primaryText={k} value={k}/>
                            }
                        })}
                    </IconMenu>
                </div>
                {conditions}
            </div>
        );
    }

}

export {Conditions as default}