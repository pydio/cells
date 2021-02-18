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
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2["default"].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var _Pydio$requireLib2 = _pydio2["default"].requireLib("hoc");

var ModernTextField = _Pydio$requireLib2.ModernTextField;

var PasswordForm = _react2["default"].createClass({
    displayName: "PasswordForm",

    getInitialState: function getInitialState() {
        return { error: null, old: '', newPass: '' };
    },

    getMessage: function getMessage(id) {
        return this.props.pydio.MessageHash[id];
    },

    update: function update(value, field) {
        var _this = this;

        var newStatus = {};
        newStatus[field] = value;
        this.setState(newStatus, function () {
            var status = _this.validate();
            if (_this.props.onValidStatusChange) {
                _this.props.onValidStatusChange(status);
            }
        });
    },

    validate: function validate() {
        if (!this.refs.newpass.isValid()) {
            return false;
        }
        var _state = this.state;
        var oldPass = _state.oldPass;
        var newPass = _state.newPass;

        if (!oldPass || !newPass) {
            this.setState({ error: this.getMessage(239) });
            return false;
        }
        if (newPass.length < parseInt(this.props.pydio.getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"))) {
            this.setState({ error: this.getMessage(378) });
            return false;
        }
        this.setState({ error: null });
        return true;
    },

    post: function post(callback) {
        var _this2 = this;

        var _state2 = this.state;
        var oldPass = _state2.oldPass;
        var newPass = _state2.newPass;
        var pydio = this.props.pydio;

        var logoutString = '';
        if (pydio.user.lock) {
            logoutString = ' ' + this.getMessage(445);
        }
        pydio.user.getIdmUser().then(function (idmUser) {
            var updateUser = _cellsSdk.IdmUser.constructFromObject(JSON.parse(JSON.stringify(idmUser)));
            updateUser.OldPassword = oldPass;
            updateUser.Password = newPass;
            var api = new _cellsSdk.UserServiceApi(_pydioHttpApi2["default"].getRestClient());
            api.putUser(updateUser.Login, updateUser).then(function () {
                pydio.displayMessage('SUCCESS', _this2.getMessage(197) + logoutString);
                callback(true);
                if (logoutString) {
                    pydio.getController().fireAction('logout');
                }
            });
        });
    },

    render: function render() {
        var _this3 = this;

        if (!this.props.pydio.user) {
            return null;
        }
        var messages = this.props.pydio.MessageHash;
        var legend = undefined;
        if (this.state.error) {
            legend = _react2["default"].createElement(
                "div",
                { className: "error" },
                this.state.error
            );
        } else if (this.props.pydio.user.lock) {
            legend = _react2["default"].createElement(
                "div",
                null,
                messages[444]
            );
        }
        var oldChange = function oldChange(event, newV) {
            _this3.update(newV, 'oldPass');
        };
        var newChange = function newChange(newV, oldV) {
            _this3.update(newV, 'newPass');
        };
        return _react2["default"].createElement(
            "div",
            { style: this.props.style },
            legend,
            _react2["default"].createElement(
                "div",
                null,
                _react2["default"].createElement(
                    "form",
                    { autoComplete: "off" },
                    _react2["default"].createElement(ModernTextField, {
                        onChange: oldChange,
                        type: "password",
                        value: this.state.oldPass,
                        ref: "old",
                        floatingLabelText: messages[237],
                        autoComplete: "off"
                    })
                )
            ),
            _react2["default"].createElement(
                "div",
                { style: { width: 256 } },
                _react2["default"].createElement(ValidPassword, {
                    onChange: newChange,
                    attributes: { name: 'pass', label: messages[198] },
                    value: this.state.newPass,
                    name: "newpassword",
                    ref: "newpass"
                })
            )
        );
    }

});

exports["default"] = PasswordForm;
module.exports = exports["default"];
