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

import React from 'react';
import {RoleMessagesConsumerMixin} from '../util/MessagesMixin';
import {IdmACL} from 'pydio/http/rest-api';
import XMLUtils from 'pydio/util/xml';
import {Role} from '../model/Role';
import {IconButton, Toggle} from 'material-ui';
import Pydio from 'pydio';
const PydioForm = Pydio.requireLib("form");

export default React.createClass({

    mixins:[RoleMessagesConsumerMixin],

    propTypes:{
        acl: React.PropTypes.instanceOf(IdmACL),
        role: React.PropTypes.instanceOf(Role),

        actions: React.PropTypes.object,
        parameters: React.PropTypes.object,

        inherited:React.PropTypes.bool,
    },

    getInitialState(){
        return {editMode:false};
    },

    onChangeParameter(newValue, oldValue, additionalFormData=null){
        if(newValue === oldValue) return;
        const {role, acl} = this.props;
        const aclKey = acl.Action.Name;
        role.setParameter(aclKey, newValue, acl.WorkspaceID);
    },

    deleteParameter(){
        const {role, acl} = this.props;
        role.deleteParameter(acl);
    },

    overrideParameter(){
        const {role, acl} = this.props;
        const aclKey = acl.Action.Name;
        const [type, pluginId, name] = aclKey.split(":");
        let value = "";
        if(type === "action"){
            value = false;
        }
        role.setParameter(aclKey, value, acl.WorkspaceID);

    },

    onInputEditMode(editMode){
        this.setState({editMode:editMode});
    },

    toggleEditMode(){
        if(this.refs.formElement) {
            this.refs.formElement.toggleEditMode();
        }
    },

    toggleActionStatus(event, status){
        const {role, acl} = this.props;
        role.setParameter(acl.Action.Name, status, acl.WorkspaceID);
    },

    render(){
        const {acl, actions, parameters, pydio} = this.props;
        const [type, pluginId, name] = acl.Action.Name.split(":");
        let value;
        if(name === 'DEFAULT_START_REPOSITORY'){
            value = acl.Action.Value;
        } else {
            value = JSON.parse(acl.Action.Value);
        }
        const inherited = acl.INHERITED;
        let label = name;
        let paramData;
        if(type === 'parameter' && parameters[pluginId]){
            let filters = parameters[pluginId].filter(p => p.parameter === name);
            if(filters.length){
                paramData = filters[0];
            }
        } else if(type === 'action' && actions[pluginId]){
            let filters = actions[pluginId].filter(p => p.action === name);
            if(filters.length){
                paramData = filters[0];
            }
        }
        let element;
        if(type === 'parameter'){
            let attributes = {type: 'string', label:label, name: name};
            if(paramData){
                attributes = PydioForm.Manager.parameterNodeToHash(paramData.xmlNode);
            }
            if(attributes['scope'] === 'user') {
                return null;
            }
            label = attributes.label;
            element = PydioForm.createFormElement({
                ref:"formElement",
                attributes:attributes,
                name:name,
                value:value,
                onChange:this.onChangeParameter,
                disabled:inherited,
                onChangeEditMode:this.onInputEditMode,
                displayContext:'grid'
            });
        }else{
            if(paramData){
                label = XMLUtils.XPathGetSingleNodeText(paramData.xmlNode, "gui/@text") || label;
                if(pydio.MessageHash[label]) {
                    label = pydio.MessageHash[label];
                }
            }
            element = (
                <div className="role-action-toggle">
                    <Toggle
                        name={this.props.name}
                        onToggle={this.toggleActionStatus.bind(this)}
                        toggled={!!value}
                        label={this.context.getMessage(value?'2':'3')}
                        labelPosition={"right"}
                    />
                </div>
            );
        }

        let actionButtons;
        const buttonStyle = {style:{opacity: 0.2}, hoveredStyle:{opacity:1}};
        if(type === 'parameter'){
            if (this.state.editMode) {
                actionButtons = <IconButton
                    iconClassName="mdi mdi-content-save"
                    tooltip={this.context.getMessage('6')}
                    onClick={this.toggleEditMode}
                    {...buttonStyle}
                />;
            } else {
                actionButtons = <IconButton
                    iconClassName="mdi mdi-close"
                    tooltip={this.context.getMessage('4')}
                    onClick={this.deleteParameter}
                    {...buttonStyle}
                />;
                if (inherited) {
                    actionButtons = <IconButton
                        iconClassName="mdi mdi-content-copy"
                        tooltip={this.context.getMessage('5')}
                        onClick={this.overrideParameter}
                        {...buttonStyle}
                    />;
                }
            }
        }else if(!inherited){
            actionButtons = <IconButton
                iconClassName="mdi mdi-close"
                tooltip={this.context.getMessage('4')}
                onClick={this.deleteParameter}
                {...buttonStyle}
            />;
        } else {
            actionButtons = <div style={{width: 48, height: 48}}></div>
        }
        return (
            <tr className={(inherited?'inherited':'') + (this.state.editMode?' edit-mode':'')} style={{...this.props.style}}>
                <td style={{width: '40%', fontWeight: 500}}>
                    {inherited?'['+this.context.getPydioRoleMessage('38')+']':''} {label}
                </td>
                <td style={{wordBreak:'break-all'}}>{element}</td>
                <td style={{width: 50}}>{actionButtons}</td>
            </tr>
        );
    }
});
