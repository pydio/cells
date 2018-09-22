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
import PydioApi from 'pydio/http/api'
import Node from 'pydio/model/node'
import {TextField} from 'material-ui'

const CreateRoleOrGroupForm = React.createClass({

    mixins:[
        AdminComponents.MessagesConsumerMixin,
        PydioReactUI.CancelButtonProviderMixin,
        PydioReactUI.SubmitButtonProviderMixin
    ],

    propTypes:{
        type: React.PropTypes.oneOf(['group', 'user', 'role']),
        roleNode: React.PropTypes.instanceOf(Node),
        openRoleEditor: React.PropTypes.func
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
            groupIdError:this.context.getMessage('ajxp_admin.user.16.empty'),
            groupLabel:'',
            groupLabelError:this.context.getMessage('ajxp_admin.user.17.empty'),
            roleId:'',
            roleIdError: this.context.getMessage('ajxp_admin.user.18.empty')
        }
    },

    submit() {
        const {type, pydio, reload} = this.props;
        let currentNode;
        const {groupId, groupIdError, groupLabel, groupLabelError, roleId, roleIdError} = this.state;
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
            PydioApi.getRestClient().getIdmApi().createGroup(currentPath || '/', groupId, groupLabel).then(() => {
                this.dismiss();
                currentNode.reload();
            });

        }else if (type === "role"){
            if(roleIdError){
                return;
            }
            currentNode = this.props.roleNode;
            PydioApi.getRestClient().getIdmApi().createRole(roleId).then(() => {
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
            }
        } else if(state.roleId !== undefined) {
            if(state.roleId === ''){
                state.roleIdError = this.context.getMessage('ajxp_admin.user.18.empty')
            } else {
                state.roleIdError = '';
            }
        }
        this.setState(state);
    },

    render(){
        const {groupId, groupIdError, groupLabel, groupLabelError, roleId, roleIdError} = this.state;
        if(this.props.type === 'group'){
            return (
                <div style={{width:'100%'}}>
                    <TextField
                        value={groupId}
                        errorText={groupIdError}
                        onChange={(e,v)=>{this.update({groupId:v})}}
                        fullWidth={true}
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.16')}
                    />
                    <TextField
                        value={groupLabel}
                        errorText={groupLabelError}
                        onChange={(e,v)=>{this.update({groupLabel:v})}}
                        fullWidth={true}
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.17')}
                    />
                </div>
            );
        }else{
            return (
                <div style={{width:'100%'}}>
                    <TextField
                        value={roleId}
                        errorText={roleIdError}
                        onChange={(e,v)=>{this.update({roleId:v})}}
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.18')}
                    />
                </div>
            );
        }
    }

});

export {CreateRoleOrGroupForm as default}