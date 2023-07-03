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
import {Checkbox, IconButton, FlatButton} from 'material-ui'

class NodeCard extends React.Component{

    constructor(props){
        super(props);
        let value = props.node.getValue();
        let dirty = false;
        if (!value){
            value = "// Compute the Path variable that this node must resolve to. \n// Use Ctrl+Space to see the objects available for completion.\nPath = \"\";";
            dirty = true
        }
        this.state = {
            value: value,
            cleanOnDelete: props.node.getOnDelete() === 'rename-uuid',
            dirty: dirty
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
        const {value, cleanOnDelete} = this.state;

        node.setValue(value);
        if(cleanOnDelete){
            node.setOnDelete('rename-uuid')
        } else {
            node.setOnDelete('')
        }

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
        const {value, dirty, cleanOnDelete} = this.state;
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
            User:{
                Name:'',
                Uuid: '',
                GroupPath: '',
                GroupFlat: '',
                Profile: '',
                DisplayName: '',
                Email: '',
                AuthSource:'',
                Roles: []
            }
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

        let checkLabel = m('card.cleanOnDelete')
        let hasUserName = value&&value.indexOf('User.Name')>=0
        if(!hasUserName) {
            checkLabel = <span>{checkLabel} <span className={"mdi mdi-alert"}/> {m('card.cleanOnDelete-legend-off')}</span>
        } else if(!cleanOnDelete) {
            checkLabel = <span>{checkLabel} <span className={"mdi mdi-alert"}/> {m('card.cleanOnDelete-legend-on')}</span>
        }

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
                <div style={{backgroundColor:'#f5f5f5', paddingBottom: 12}}>
                    <div style={{padding: readonly?'16px 24px 8px':'10px 24px 0', fontWeight:500, display:'flex', alignItems:'center'}}>
                        <div style={{flex: 1}}>{m('card.title')}</div>
                        {!readonly && <FlatButton onClick={this.save.bind(this)} primary={true} disabled={!dirty} label={m('save')}/>}
                    </div>
                    <div style={{margin:'6px 24px 0 24px', border:'1px solid #e0e0e0'}}>{codeMirrorField}</div>
                    <div style={{margin:'12px 24px', opacity:hasUserName?1:0.4}}>
                        <Checkbox
                            disabled={readonly}
                            checked={cleanOnDelete}
                            onCheck={(e,v) => {this.setState({cleanOnDelete: v, dirty: true})}}
                            label={checkLabel}
                        />
                    </div>
                </div>
            );
        }

    }

}

export {NodeCard as default}
