import React from 'react';

import createReactClass from 'create-react-class';

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
import PropTypes from 'prop-types';

import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import Node from 'pydio/model/node'
import LangUtils from 'pydio/util/lang'
const {ModernTextField} = Pydio.requireLib('hoc');

const CreateRoleOrGroupForm = createReactClass({
    displayName: 'CreateRoleOrGroupForm',

    mixins:[
        AdminComponents.MessagesConsumerMixin,
        PydioReactUI.CancelButtonProviderMixin,
        PydioReactUI.SubmitButtonProviderMixin
    ],

    propTypes:{
        type: PropTypes.oneOf(['group', 'user', 'role']),
        roleNode: PropTypes.instanceOf(Node),
        openRoleEditor: PropTypes.func
    },

    getTitle(){
        if(this.props.type === 'group'){
            return this.context.getMessage('ajxp_admin.user.15');
        }else{
            return this.context.getMessage('ajxp_admin.user.14');
        }
    },

    getPadding(){
        return true;
    },

    getSize() {
        return 'sm'
    },

    dismiss() {
        return this.props.onDismiss();
    },

    getInitialState(){
        return {
            groupId:'',
            groupIdError:'',
            groupLabel:'',
            groupLabelError:'',
            roleId:'',
            roleLabel:'',
            roleLabelError: ''
        }
    },

    submit() {
        const {type, pydio, reload} = this.props;
        let currentNode;
        const {groupId, groupIdError, groupLabel, groupLabelError, roleId, roleIdError, roleLabel, roleLabelError} = this.state;
        if( type === "group"){
            if(groupIdError || groupLabelError){
                return;
            }
            if(pydio.getContextHolder().getSelectedNodes().length){
                currentNode = pydio.getContextHolder().getSelectedNodes()[0];
            }else{
                currentNode = pydio.getContextNode();
            }
            const currentPath = currentNode.getPath().replace('/idm/users', '');
            const api = PydioApi.getRestClient().getIdmApi();
            api.userOrGroupByIdentifier(currentPath, groupId).then(exists => {
                if (exists) {
                    this.setState({groupIdError:'Found group or user with same identifier!'});
                } else {
                    api.createGroup(currentPath || '/', groupId, groupLabel).then(() => {
                        this.dismiss();
                        currentNode.reload();
                    });
                }
            })
        }else if (type === "role"){
            if(roleLabelError || roleIdError){
                return;
            }
            PydioApi.getRestClient().getIdmApi().createRole(roleLabel, roleId).then(() => {
                this.dismiss();
                if(reload) {
                    reload();
                }
            });
        }

    },

    update(state){
        if(state.groupId !== undefined){
            const re = new RegExp(/^[0-9A-Z\-_.:\+]+$/i);
            if(!re.test(state.groupId)){
                state.groupIdError = this.context.getMessage('ajxp_admin.user.16.format')
            } else if (state.groupId === ''){
                state.groupIdError = this.context.getMessage('ajxp_admin.user.16.empty')
            } else {
                state.groupIdError = '';
            }
        } else if(state.groupLabel !== undefined){
            if(state.groupLabel === ''){
                state.groupLabelError = this.context.getMessage('ajxp_admin.user.17.empty')
            } else {
                state.groupLabelError = '';
                const {groupId, groupLabel} = this.state;
                if(groupId === '' || LangUtils.computeStringSlug(groupLabel) === groupId ){
                    state.groupId = LangUtils.computeStringSlug(state.groupLabel)
                    state.groupIdError = '';
                }
            }
        } else if(state.roleLabel !== undefined) {
            if(state.roleLabel === ''){
                state.roleLabelError = this.context.getMessage('ajxp_admin.user.18.empty')
            } else {
                state.roleLabelError = '';
            }
        } else if(state.roleId) {
            const {roles = []} = this.props;
            if (roles.filter(r => r.Uuid === state.roleId).length > 0){
                state.roleIdError = this.context.getMessage('role_editor.31.exists');
            } else {
                state.roleIdError= '';
            }
            state.roleId = LangUtils.computeStringSlug(state.roleId)
        }
        this.setState(state);
    },

    render(){
        const {groupId, groupIdError, groupLabel, groupLabelError, roleId, roleIdError, roleLabel, roleLabelError} = this.state;
        if(this.props.type === 'group'){
            return (
                <div style={{width:'100%'}}>
                    <ModernTextField
                        value={groupLabel}
                        errorText={groupLabelError}
                        onChange={(e,v)=>{this.update({groupLabel:v})}}
                        fullWidth={true}
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.17')}
                        onKeyPress={(e) => {if (e.key === 'Enter') {this.submit()}}}
                        variant={"v2"}
                    />
                    <ModernTextField
                        value={groupId}
                        errorText={groupIdError}
                        onChange={(e,v)=>{this.update({groupId:v})}}
                        fullWidth={true}
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.16')}
                        onKeyDown={(e) => {if (e.key === 'Enter') {this.submit()}}}
                        variant={"v2"}
                    />
                </div>
            );
        }else{
            return (
                <div style={{width:'100%'}}>
                    <ModernTextField
                        fullWidth={true}
                        value={roleLabel}
                        errorText={roleLabelError}
                        onChange={(e,v)=>{this.update({roleLabel:v})}}
                        floatingLabelText={this.context.getMessage('role_editor.32')}
                        onKeyDown={(e) => {if (e.key === 'Enter') {this.submit()}}}
                        variant={"v2"}
                    />
                    <ModernTextField
                        fullWidth={true}
                        value={roleId}
                        errorText={roleIdError}
                        floatingLabelText={this.context.getMessage("role_editor.31.hint")}
                        onChange={(e,v)=>{this.update({roleId:v})}}
                        onKeyDown={(e) => {if (e.key === 'Enter') {this.submit()}}}
                        variant={"v2"}
                    />
                </div>
            );
        }
    },
});

export {CreateRoleOrGroupForm as default}