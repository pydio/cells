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
import {ListItem, FontIcon, IconButton} from 'material-ui'
import FuncUtils from 'pydio/util/func'
import ResourcesManager from 'pydio/http/resources-manager'
import {loadEditorClass} from "../editor/util/ClassLoader";

class Rule extends React.Component{

    componentDidMount(){
        if(this.props.create) {
            this.openEditor(true);
        }
    }

    openEditor(create = false){

        const {pydio, policy, rule, openRightPane, rulesEditorClass} = this.props;

        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        if(!rulesEditorClass){
            return false;
        }
        loadEditorClass(rulesEditorClass, null).then(component => {
            openRightPane({
                COMPONENT: component,
                PROPS: {
                    ref:"editor",
                    policy:policy,
                    rule:rule,
                    pydio: pydio,
                    create,
                    saveRule:this.props.onRuleChange,
                    onRequestTabClose:this.closeEditor.bind(this)
                }
            });
        }).catch(e => {
            console.error(e)
        });
        return true;

    }

    closeEditor(editor){
        const {pydio, closeRightPane} = this.props;

        if(editor && editor.isDirty()){
            if(editor.isCreate()){
                this.props.onRemoveRule(this.props.rule, true);
                closeRightPane();
                return true;
            }
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        closeRightPane();
        return true;
    }


    removeRule(){
        const {pydio, onRemoveRule, rule} = this.props;
        pydio.UI.openConfirmDialog({
            message: pydio.MessageHash['ajxp_admin.policies.rule.delete.confirm'],
            destructive:[rule.description],
            validCallback: () => {
                onRemoveRule(rule);
            }
        });
    }

    render(){
        const {rule, readonly, isLast, create} = this.props;

        if (create) {
            //return null;
        }

        const iconColor = rule.effect === 'allow' ? '#33691e' : '#d32f2f';
        let buttons = [];
        if(!readonly){
            buttons = [
                <span className="mdi mdi-pencil" style={{fontSize: 16, color:'rgba(0,0,0,.33)', cursor:'pointer', marginLeft: 12}} onClick={(e) => this.openEditor()}/>,
                <span className="mdi mdi-delete" style={{fontSize: 16, color:'rgba(0,0,0,.33)', cursor:'pointer', marginLeft: 12}} onClick={(e) => this.removeRule()}/>
            ]
        }

        return (
            <div style={{display:'flex', padding:'6px 0 5px', borderBottom:isLast?null:'1px solid white'}}>
                <FontIcon className="mdi mdi-traffic-light" color={iconColor} style={{fontSize: 16, marginRight: 10}}/>
                <div style={{flex: 1}}>
                    {create && <span>[NEW] </span>}{rule.description}
                    {buttons}
                </div>
            </div>
        );
    }

}

export {Rule as default}