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

var _ParameterCreate = require('./ParameterCreate');

var _ParameterCreate2 = _interopRequireDefault(_ParameterCreate);

var _ParametersList = require('./ParametersList');

var _ParametersList2 = _interopRequireDefault(_ParametersList);

var _ParametersSummary = require('./ParametersSummary');

var _ParametersSummary2 = _interopRequireDefault(_ParametersSummary);

var _materialUi = require('material-ui');

var React = require('react');

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var WorkspaceCard = React.createClass({
    displayName: 'WorkspaceCard',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        id: React.PropTypes.string,
        label: React.PropTypes.string,
        role: React.PropTypes.object,
        roleParent: React.PropTypes.object,
        roleType: React.PropTypes.oneOf(['user', 'group', 'role']),
        pluginsFilter: React.PropTypes.func,
        paramsFilter: React.PropTypes.func,
        toggleEdit: React.PropTypes.func,
        editMode: React.PropTypes.bool,
        titleOnly: React.PropTypes.bool,
        editOnly: React.PropTypes.bool,
        noParamsListEdit: React.PropTypes.bool,
        uniqueScope: React.PropTypes.bool,
        showModal: React.PropTypes.func,
        hideModal: React.PropTypes.func,
        Controller: React.PropTypes.object
    },

    toggleEdit: function toggleEdit() {
        this.props.toggleEdit(this.props.id);
    },

    toggleInherited: function toggleInherited() {
        if (this.refs.parameters_list) {
            this.refs.parameters_list.toggleInherited();
        }
    },

    onCreateParameter: function onCreateParameter(type, pluginName, paramName, attributes) {
        var controller = this.props.Controller;
        var value;
        if (type == 'parameter') {
            if (attributes['default']) value = attributes['default'];else if (attributes['type'] == 'boolean') value = false;
        } else if (type == 'action') {
            value = false;
        }
        controller.updateParameter(type, 'add', this.props.id, pluginName, paramName, value);
    },

    addParameter: function addParameter() {
        this.props.pydio.UI.openComponentInModal('AdminPeople', 'ParameterCreate', {
            pluginsFilter: this.props.pluginsFilter,
            workspaceScope: this.props.id,
            createParameter: this.onCreateParameter,
            roleType: this.props.roleType
        });
    },

    render: function render() {
        var wsId = this.props.id;
        if (this.props.editMode) {

            var rights, editButtons, scopeTitle, closeButton;
            if (!this.props.noParamsListEdit) {
                editButtons = React.createElement(
                    'div',
                    { style: { float: 'right' } },
                    React.createElement(ReactMUI.IconButton, { tooltip: this.context.getMessage('16'), iconClassName: 'icon-filter', onClick: this.toggleInherited }),
                    React.createElement(ReactMUI.IconButton, { tooltip: this.context.getMessage('17'), primary: true, iconClassName: 'icon-plus', onClick: this.addParameter })
                );
            }
            if (!this.props.uniqueScope) {
                scopeTitle = React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h4',
                        null,
                        this.props.label
                    ),
                    React.createElement('hr', null)
                );
            }
            if (!this.props.editOnly) {
                closeButton = React.createElement(
                    'div',
                    null,
                    React.createElement('hr', null),
                    React.createElement(
                        'div',
                        { style: { textAlign: 'right', padding: '10px 16px' } },
                        React.createElement(_materialUi.FlatButton, { onTouchTap: this.toggleEdit, primary: true, label: this.context.getRootMessage('86') })
                    )
                );
            }
            var content = React.createElement(
                ReactMUI.Paper,
                { zDepth: this.props.uniqueScope ? 0 : 1, className: '' },
                scopeTitle,
                React.createElement(
                    'div',
                    { className: 'card-content' },
                    rights,
                    React.createElement(
                        'div',
                        null,
                        editButtons,
                        React.createElement(
                            'h5',
                            { style: { float: 'left' } },
                            this.context.getMessage('18')
                        )
                    ),
                    React.createElement(
                        'div',
                        { style: { clear: 'both' } },
                        React.createElement(_ParametersList2['default'], {
                            Controller: this.props.Controller,
                            ref: 'parameters_list',
                            id: wsId,
                            role: this.props.role,
                            roleParent: this.props.roleParent,
                            pluginsFilter: this.props.pluginsFilter,
                            paramsFilter: this.props.paramsFilter
                        })
                    )
                ),
                closeButton,
                React.createElement('hr', null)
            );
            return React.createElement(PydioComponents.ListEntry, {
                className: "workspace-card-edit" + (this.props.uniqueScope ? ' unique-scope' : '') + (this.props.editOnly ? ' edit-only' : ''),
                firstLine: content,
                onClick: function () {}
            });
        } else {

            var secondLine, action;
            if (!this.props.titleOnly) {
                secondLine = React.createElement(_ParametersSummary2['default'], { id: wsId, role: this.props.role, roleParent: this.props.roleParent, pluginsFilter: this.props.pluginsFilter });
            }
            return React.createElement(PydioComponents.ListEntry, {
                className: 'ws-card',
                firstLine: this.props.label,
                secondLine: secondLine,
                actions: action,
                onClick: this.toggleEdit
            });
        }
    }

});

exports['default'] = WorkspaceCard = PydioContextConsumer(WorkspaceCard);
exports['default'] = WorkspaceCard;
module.exports = exports['default'];
