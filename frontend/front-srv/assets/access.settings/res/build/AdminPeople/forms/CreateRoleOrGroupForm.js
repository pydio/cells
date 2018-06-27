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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _materialUi = require('material-ui');

var CreateRoleOrGroupForm = _react2['default'].createClass({
    displayName: 'CreateRoleOrGroupForm',

    mixins: [AdminComponents.MessagesConsumerMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    propTypes: {
        type: _react2['default'].PropTypes.oneOf(['group', 'user', 'role']),
        roleNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']),
        openRoleEditor: _react2['default'].PropTypes.func
    },

    getTitle: function getTitle() {
        if (this.props.type == 'group') {
            return this.context.getMessage('ajxp_admin.user.15');
        } else {
            return this.context.getMessage('ajxp_admin.user.14');
        }
    },

    getPadding: function getPadding() {
        return true;
    },

    getSize: function getSize() {
        return 'sm';
    },

    dismiss: function dismiss() {
        return this.props.onDismiss();
    },

    submit: function submit() {
        var type = this.props.type;

        var parameters = undefined;
        var currentNode = undefined;
        if (type == "group") {
            var gId = this.refs.group_id.getValue();
            var gLabel = this.refs.group_label.getValue();
            if (!gId || !gLabel) {
                return;
            }
            if (pydio.getContextHolder().getSelectedNodes().length) {
                currentNode = pydio.getContextHolder().getSelectedNodes()[0];
            } else {
                currentNode = pydio.getContextNode();
            }
            parameters = { get_action: 'create_group', dir: currentNode.getPath(), group_name: gId, group_label: gLabel };
        } else if (type == "role") {
            currentNode = this.props.roleNode;
            parameters = { get_action: 'create_role', role_id: this.refs.role_id.getValue() };
        }

        _pydioHttpApi2['default'].getClient().request(parameters, (function () {
            this.dismiss();
            if (currentNode) {
                currentNode.reload();
            }
        }).bind(this));
    },

    render: function render() {
        if (this.props.type == 'group') {
            return _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(_materialUi.TextField, {
                    ref: 'group_id',
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.16')
                }),
                _react2['default'].createElement(_materialUi.TextField, {
                    ref: 'group_label',
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.17')
                })
            );
        } else {
            return _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(ReactMUI.TextField, {
                    ref: 'role_id',
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.18')
                })
            );
        }
    }

});

exports['default'] = CreateRoleOrGroupForm;
module.exports = exports['default'];
