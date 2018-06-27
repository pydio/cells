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
import PydioDataModel from 'pydio/model/data-model'
import PydioApi from 'pydio/http/api'
import {TextField} from 'material-ui'
import PassUtils from 'pydio/util/pass'

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

    getDefaultProps: function(){
        return {
            dialogSize:'sm',
            dialogTitleId: 'ajxp_admin.user.19'
        }
    },

    getInitialState: function(){
        const passState = PassUtils.getState();
        return {
            step:1,
            ...passState
        }
    },

    checkPassword:function(){
        const value1 = this.refs.pass.getValue();
        const value2 = this.refs.passconf.getValue();
        this.setState(PassUtils.getState(value1, value2, this.state));
    },

    submit: function(dialog){
        if(!this.state.valid){
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText);
            return;
        }
        var parameters = {};
        var ctx = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        parameters['get_action'] = 'create_user';
        parameters['new_user_login'] = this.refs.user_id.getValue();
        parameters['new_user_pwd'] = this.refs.pass.getValue();
        var currentPath = ctx.getPath();
        if(currentPath.startsWith("/idm/users")){
            parameters['group_path'] = currentPath.substr("/idm/users".length);
        }
        PydioApi.getClient().request(parameters, function(transport){
            var xml = transport.responseXML;
            var message = XMLUtils.XPathSelectSingleNode(xml, "//reload_instruction");
            if(message){
                var node = new AjxpNode(currentPath + "/"+ parameters['new_user_login'], true);
                node.getMetadata().set("ajxp_mime", "user");
                this.props.openRoleEditor(node);
                let currentNode = global.pydio.getContextNode();
                if(global.pydio.getContextHolder().getSelectedNodes().length){
                    currentNode = global.pydio.getContextHolder().getSelectedNodes()[0];
                }
                currentNode.reload();
            }
        }.bind(this));
        this.dismiss();
    },

    render: function(){
        var ctx = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        var currentPath = ctx.getPath();
        var path;
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
                        fullWidth={true}
                        floatingLabelText={this.context.getMessage('ajxp_admin.user.21')}
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