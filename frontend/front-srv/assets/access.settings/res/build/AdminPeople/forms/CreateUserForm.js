'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var CreateUserForm = (0, _createReactClass2['default'])({
    displayName: 'CreateUserForm',

    propTypes: {
        dataModel: _propTypes2['default'].instanceOf(PydioDataModel),
        openRoleEditor: _propTypes2['default'].func
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

    // Check valid login
    checkLogin: function checkLogin(e, v) {
        var err = _pydioUtilPass2['default'].isValidLogin(v);
        this.setState({ loginErrorText: err });
    },

    submit: function submit() {
        var _this = this;

        if (!this.state.valid || this.state.loginErrorText) {
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText || this.state.loginErrorText);
            return;
        }

        var ctxNode = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        var currentPath = ctxNode.getPath();
        if (currentPath.startsWith("/idm/users")) {
            currentPath = currentPath.substr("/idm/users".length);
        }
        var login = this.refs.user_id.getValue();
        var pwd = this.refs.pass.getValue();

        _pydioHttpApi2['default'].getRestClient().getIdmApi().createUser(currentPath, login, pwd).then(function (idmUser) {
            _this.dismiss();
            ctxNode.reload();
            var node = new _pydioModelNode2['default'](currentPath + "/" + login, true);
            node.getMetadata().set("ajxp_mime", "user");
            node.getMetadata().set("IdmUser", idmUser);
            _this.props.openRoleEditor(node);
        });
    },

    render: function render() {
        var ctx = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        var currentPath = ctx.getPath();
        var path = undefined;
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
                'form',
                { autoComplete: "off" },
                _react2['default'].createElement(
                    'div',
                    { style: { width: '100%' } },
                    _react2['default'].createElement(ModernTextField, {
                        ref: 'user_id',
                        onChange: this.checkLogin,
                        fullWidth: true,
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.21'),
                        errorText: this.state.loginErrorText,
                        autoComplete: "nope"
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(ModernTextField, {
                        ref: 'pass',
                        type: 'password',
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.22'),
                        onChange: this.checkPassword,
                        fullWidth: true,
                        errorText: this.state.passErrorText || this.state.passHintText,
                        autoComplete: "new-password"
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(ModernTextField, {
                        ref: 'passconf',
                        type: 'password',
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.23'),
                        onChange: this.checkPassword,
                        fullWidth: true,
                        errorText: this.state.confirmErrorText,
                        autoComplete: "confirm-password"
                    })
                )
            )
        );
    }
});

exports['default'] = CreateUserForm;
module.exports = exports['default'];
