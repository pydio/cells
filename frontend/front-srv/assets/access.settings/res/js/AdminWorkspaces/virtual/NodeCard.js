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

import React from 'react'
import {TextField, IconButton, Paper} from 'material-ui'

class NodeCard extends React.Component{

    constructor(props){
        super(props);
        let value = props.node.getValue();
        let dirty = false;
        if (!value){
            value = "// Compute the Path variable that this node must resolve to. \n// Use Ctrl+Space to see the objects available for completion.\nPath = \"\";";
        } else {
            dirty = true
        }
        this.state = {
            value: value,
            dirty: true
        };
    }

    onChange(event, newValue){
        this.setState({
            value: newValue,
            dirty: true
        });
    }

    save(){
        const {node, onSave = () => {}} = this.props;
        const {value} = this.state;

        node.setValue(value);

        node.save(() => {
            this.setState({
                dirty: false
            }, onSave);
        });
    }

    remove(){
        this.props.node.remove(() => {
            this.props.reloadList();
        });
    }

    render(){

        const {pydio, dataSources, readonly, oneLiner, onClose = () => {}} = this.props;
        const {value, dirty} = this.state;
        const m  = (id) => pydio.MessageHash['ajxp_admin.virtual.' + id] || id;

        let ds = {};
        if(dataSources){
            dataSources.map((d) => {
                ds[d.Name] = d.Name;
            });
        }
        const globalScope = {
            Path:'',
            DataSources:ds,
            User:{Name:''}
        };

        const codeMirrorField = (
            <AdminComponents.CodeMirrorField
                mode="javascript"
                globalScope={globalScope}
                value={value}
                onChange={this.onChange.bind(this)}
                readOnly={readonly}
            />
        );

        if(oneLiner) {
            return (
                <div style={{display:'flex'}}>
                    <div style={{flex: 1, lineHeight: "40px"}}>{codeMirrorField}</div>
                    <div style={{display: "flex"}}>
                        <IconButton iconClassName={"mdi mdi-content-save"} onClick={this.save.bind(this)} disabled={!dirty} tooltip={"Save"}/>
                        <IconButton iconClassName={"mdi mdi-close"} onClick={() => onClose()} tooltip={"Close"}/>
                    </div>
                </div>
            );
        } else {
            return (
                <div style={{backgroundColor:'#f5f5f5', paddingBottom: 24}}>
                    <div style={{padding: readonly?'12px 24px':'0 24px', fontWeight:500, display:'flex', alignItems:'center'}}>
                        <div>Template Path Code</div>
                        {!readonly && <IconButton iconClassName={"mdi mdi-content-save"} onClick={this.save.bind(this)} disabled={!dirty} tooltip={m('save')} style={{width:36, height: 36, padding: 8}} iconStyle={{fontSize: 20, color:'rgba(0,0,0,.33)'}}/>}
                    </div>
                    <div style={{margin:'12px 24px 0 24px', border:'1px solid #e0e0e0'}}>{codeMirrorField}</div>
                </div>
            );
        }

    }

}

export {NodeCard as default}
