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
import {TextField} from 'material-ui'
import PassUtils from 'pydio/util/pass'
import Node from 'pydio/model/node'

const CreateUserForm = React.createClass({

    propTypes:{
        dataModel: React.PropTypes.instanceOf(PydioDataModel),
        openRoleEditor: React.PropTypes.func
    },

    mixins:[
        AdminComponents.MessagesConsumerMixin,
        PydioReactUI.ActionDialogMixin,
        PydioReactUI.CancelButtonProviderMixin,
        PydioReactUI.SubmitButtonProviderMixin
    ],

    getDefaultProps(){
        return {
            dialogSize:'sm',
            dialogTitleId: 'ajxp_admin.user.19'
        }
    },

    getInitialState(){
        const passState = PassUtils.getState();
        return {
            step:1,
            ...passState
        }
    },

    checkPassword(){
        const value1 = this.refs.pass.getValue();
        const value2 = this.refs.passconf.getValue();
        this.setState(PassUtils.getState(value1, value2, this.state));
    },

    // Check valid login
    checkLogin(e, v){
        const err = PassUtils.isValidLogin(v);
        this.setState({loginErrorText: err});
    },

    submit(){
        if(!this.state.valid || this.state.loginErrorText){
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText || this.state.loginErrorText);
            return;
        }

        const ctxNode = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        let currentPath = ctxNode.getPath();
        if(currentPath.startsWith("/idm/users")){
            currentPath = currentPath.substr("/idm/users".length);
        }
        const login = this.refs.user_id.getValue();
        const pwd = this.refs.pass.getValue();

        PydioApi.getRestClient().getIdmApi().createUser(currentPath, login, pwd).then((idmUser) => {
            this.dismiss();
            ctxNode.reload();
            const node = new Node(currentPath + "/"+ login, true);
            node.getMetadata().set("ajxp_mime", "user");
            node.getMetadata().set("IdmUser", idmUser);
            this.props.openRoleEditor(node);
        });
    },

    render(){
        const ctx = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        let currentPath = ctx.getPath();
        let path;
        if(currentPath.startsWith("/idm/users")){
            path = currentPath.substr("/idm/users".length);
            if(path){
                path = <div>{this.context.getMessage('ajxp_admin.user.20').replace('%s', path)}</div>;
            }
        }
        return (
            <div style={{width:'100%'}}>
                {path}
                <div style={{width:'100%'}}>
                    <TextField
                        ref="user_id"
                        onChange={this.checkLogin}
                        fullWidth={true}
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.21')}
                        errorText={this.state.loginErrorText}
                    />
                </div>
                <div>
                    <TextField
                        ref="pass"
                        type="password"
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.22')}
                        onChange={this.checkPassword}
                        fullWidth={true}
                        errorText={this.state.passErrorText || this.state.passHintText}
                    />
                </div>
                <div>
                    <TextField
                        ref="passconf"
                        type="password"
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.23')}
                        onChange={this.checkPassword}
                        fullWidth={true}
                        errorText={this.state.confirmErrorText}
                    />
                </div>
            </div>
        );
    }
});

export {CreateUserForm as default}