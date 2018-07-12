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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilMessagesMixin = require('../util/MessagesMixin');

var _RightsSelector = require('./RightsSelector');

var _RightsSelector2 = _interopRequireDefault(_RightsSelector);

var _PermissionMaskEditor = require('./PermissionMaskEditor');

var _PermissionMaskEditor2 = _interopRequireDefault(_PermissionMaskEditor);

var _modelRole = require('../model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _pydioHttpRestApi = require('pydio/http/rest-api');

exports['default'] = React.createClass({
    displayName: 'WorkspaceAcl',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        role: React.PropTypes.instanceOf(_modelRole2['default']),
        workspace: React.PropTypes.instanceOf(_pydioHttpRestApi.IdmWorkspace),

        wsId: React.PropTypes.string,
        label: React.PropTypes.string,
        roleParent: React.PropTypes.object,

        showModal: React.PropTypes.func,
        hideModal: React.PropTypes.func,
        Controller: React.PropTypes.object,
        advancedAcl: React.PropTypes.bool,
        supportsFolderBrowsing: React.PropTypes.bool
    },

    onAclChange: function onAclChange(newValue, oldValue) {
        var _props = this.props;
        var role = _props.role;
        var workspace = _props.workspace;

        role.updateAcl(workspace, newValue);
    },

    onNodesChange: function onNodesChange(values) {
        this.props.Controller.updateMask(values);
    },

    getInitialState: function getInitialState() {
        return { displayMask: false };
    },

    toggleDisplayMask: function toggleDisplayMask() {
        this.setState({ displayMask: !this.state.displayMask });
    },

    render: function render() {
        var _props2 = this.props;
        var workspace = _props2.workspace;
        var role = _props2.role;
        var advancedAcl = _props2.advancedAcl;

        var _role$getAclString = role.getAclString(workspace);

        var aclString = _role$getAclString.aclString;
        var inherited = _role$getAclString.inherited;

        var action = React.createElement(_RightsSelector2['default'], {
            acl: aclString,
            onChange: this.onAclChange,
            hideLabels: true,
            advancedAcl: advancedAcl
        });

        /*
         if(advancedAcl && (aclString.indexOf('read') !== -1 || aclString.indexOf('write') !== -1 ) && supportsFolderBrowsing){
             const toggleButton = <ReactMUI.FontIcon
                className={"icon-" + (this.state.displayMask ? "minus" : "plus")}
                onClick={this.toggleDisplayMask}
                style={{cursor:'pointer', padding: '0 8px'}}
            />;
            label = (
                <div>
                    {label} {toggleButton}
                </div>
            );
            if(this.state.displayMask){
                const parentNodes = roleParent.NODES || {};
                const nodes = role.NODES || {};
                action = null;
                let aclObject;
                if(aclString){
                    aclObject = {
                        read:aclString.indexOf('read') !== -1,
                        write:aclString.indexOf('write') !== -1
                    };
                }
                 secondLine = (
                    <ReactMUI.Paper zDepth={1} style={{margin: '8px 20px', backgroundColor:'white', color:'rgba(0,0,0,0.87)'}}>
                        <PermissionMaskEditor
                            workspaceId={wsId}
                            parentNodes={parentNodes}
                            nodes={nodes}
                            onNodesChange={this.onNodesChange}
                            showModal={this.props.showModal}
                            hideModal={this.props.hideModal}
                            globalWorkspacePermissions={aclObject}
                        />
                    </ReactMUI.Paper>
                );
            }
         }
         */

        return React.createElement(PydioComponents.ListEntry, {
            className: (inherited ? "workspace-acl-entry-inherited " : "") + "workspace-acl-entry",
            firstLine: workspace.Label + (inherited ? ' (' + this.context.getPydioRoleMessage('38') + ')' : ''),
            secondLine: null,
            actions: action
        });
    }

});
module.exports = exports['default'];
