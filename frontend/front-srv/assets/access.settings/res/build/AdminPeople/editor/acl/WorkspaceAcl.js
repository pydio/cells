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

var _materialUi = require('material-ui');

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

        role.updateAcl(workspace, null, newValue);
    },

    onNodesChange: function onNodesChange(nodeUuid, checkboxName, value) {
        var _props2 = this.props;
        var role = _props2.role;
        var workspace = _props2.workspace;

        role.updateAcl(null, nodeUuid, checkboxName, workspace);
    },

    getInitialState: function getInitialState() {
        return { displayMask: false };
    },

    toggleDisplayMask: function toggleDisplayMask() {
        this.setState({ displayMask: !this.state.displayMask });
    },

    render: function render() {
        var _props3 = this.props;
        var workspace = _props3.workspace;
        var role = _props3.role;
        var advancedAcl = _props3.advancedAcl;

        console.log(workspace);
        if (!workspace.RootNodes || !Object.keys(workspace.RootNodes).length) {
            // This is not normal, a workspace should always have a root node!
            return React.createElement(PydioComponents.ListEntry, {
                className: "workspace-acl-entry",
                firstLine: React.createElement(
                    'span',
                    { style: { textDecoration: 'line-through', color: '#ef9a9a' } },
                    workspace.Label + ' (' + this.context.getPydioRoleMessage('workspace.roots.invalid') + ')'
                )
            });
        }

        var _role$getAclString = role.getAclString(workspace);

        var aclString = _role$getAclString.aclString;
        var inherited = _role$getAclString.inherited;

        var action = React.createElement(_RightsSelector2['default'], {
            acl: aclString,
            onChange: this.onAclChange,
            hideLabels: true,
            advancedAcl: advancedAcl
        });

        var label = workspace.Label + (inherited ? ' (' + this.context.getPydioRoleMessage('38') + ')' : '');
        var secondLine = undefined;

        if (advancedAcl && (aclString.indexOf('read') !== -1 || aclString.indexOf('write') !== -1)) {

            label = React.createElement(
                'div',
                null,
                label,
                React.createElement(_materialUi.FontIcon, {
                    className: "mdi mdi-" + (this.state.displayMask ? "minus" : "plus"),
                    onClick: this.toggleDisplayMask,
                    style: { cursor: 'pointer', padding: '0 8px', fontSize: 16 }
                })
            );
            if (this.state.displayMask) {
                var aclObject = undefined;
                if (aclString) {
                    aclObject = {
                        read: aclString.indexOf('read') !== -1,
                        write: aclString.indexOf('write') !== -1
                    };
                }

                secondLine = React.createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { margin: '30px 3px 3px' } },
                    React.createElement(_PermissionMaskEditor2['default'], {
                        workspace: workspace,
                        role: role,
                        nodes: {},
                        parentNodes: {},
                        onNodesChange: this.onNodesChange,
                        showModal: this.props.showModal,
                        hideModal: this.props.hideModal,
                        globalWorkspacePermissions: aclObject
                    })
                );
            }
        }

        return React.createElement(PydioComponents.ListEntry, {
            className: (inherited ? "workspace-acl-entry-inherited " : "") + "workspace-acl-entry",
            firstLine: label,
            secondLine: secondLine,
            actions: action
        });
    }

});
module.exports = exports['default'];
