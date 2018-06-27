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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var CreateUserForm = _react2['default'].createClass({
    displayName: 'CreateUserForm',

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']),
        openRoleEditor: _react2['default'].PropTypes.func
    },

    mixins: [AdminComponents.MessagesConsumerMixin, PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogSize: 'sm',
            dialogTitleId: 'ajxp_admin.user.19'
        };
    },

    getInitialState: function getInitialState() {
        var passState = _pydioUtilPass2['default'].getState();
        return _extends({
            step: 1
        }, passState);
    },

    checkPassword: function checkPassword() {
        var value1 = this.refs.pass.getValue();
        var value2 = this.refs.passconf.getValue();
        this.setState(_pydioUtilPass2['default'].getState(value1, value2, this.state));
    },

    submit: function submit(dialog) {
        if (!this.state.valid) {
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText);
            return;
        }
        var parameters = {};
        var ctx = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        parameters['get_action'] = 'create_user';
        parameters['new_user_login'] = this.refs.user_id.getValue();
        parameters['new_user_pwd'] = this.refs.pass.getValue();
        var currentPath = ctx.getPath();
        if (currentPath.startsWith("/idm/users")) {
            parameters['group_path'] = currentPath.substr("/idm/users".length);
        }
        _pydioHttpApi2['default'].getClient().request(parameters, (function (transport) {
            var xml = transport.responseXML;
            var message = XMLUtils.XPathSelectSingleNode(xml, "//reload_instruction");
            if (message) {
                var node = new AjxpNode(currentPath + "/" + parameters['new_user_login'], true);
                node.getMetadata().set("ajxp_mime", "user");
                this.props.openRoleEditor(node);
                var currentNode = global.pydio.getContextNode();
                if (global.pydio.getContextHolder().getSelectedNodes().length) {
                    currentNode = global.pydio.getContextHolder().getSelectedNodes()[0];
                }
                currentNode.reload();
            }
        }).bind(this));
        this.dismiss();
    },

    render: function render() {
        var ctx = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        var currentPath = ctx.getPath();
        var path;
        if (currentPath.startsWith("/idm/users")) {
            path = currentPath.substr("/idm/users".length);
            if (path) {
                path = _react2['default'].createElement(
                    'div',
                    null,
                    this.context.getMessage('ajxp_admin.user.20').replace('%s', path)
                );
            }
        }
        return _react2['default'].createElement(
            'div',
            { style: { width: '100%' } },
            path,
            _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(_materialUi.TextField, {
                    ref: 'user_id',
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.21')
                })
            ),
            _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.TextField, {
                    ref: 'pass',
                    type: 'password',
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.22'),
                    onChange: this.checkPassword,
                    fullWidth: true,
                    errorText: this.state.passErrorText || this.state.passHintText
                })
            ),
            _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.TextField, {
                    ref: 'passconf',
                    type: 'password',
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.23'),
                    onChange: this.checkPassword,
                    fullWidth: true,
                    errorText: this.state.confirmErrorText
                })
            )
        );
    }
});

exports['default'] = CreateUserForm;
module.exports = exports['default'];
