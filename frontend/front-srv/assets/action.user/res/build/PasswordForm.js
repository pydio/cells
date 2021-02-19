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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var PasswordForm = (function (_React$Component) {
    _inherits(PasswordForm, _React$Component);

    function PasswordForm() {
        var _this = this;

        _classCallCheck(this, PasswordForm);

        _get(Object.getPrototypeOf(PasswordForm.prototype), "constructor", this).apply(this, arguments);

        this.state = { error: null, old: '', newPass: '' };

        this.getMessage = function (id) {
            return _this.props.pydio.MessageHash[id];
        };

        this.update = function (value, field) {
            var newStatus = {};
            newStatus[field] = value;
            _this.setState(newStatus, function () {
                var status = _this.validate();
                if (_this.props.onValidStatusChange) {
                    _this.props.onValidStatusChange(status);
                }
            });
        };

        this.validate = function () {
            if (!_this.refs.newpass.isValid()) {
                return false;
            }
            var _state = _this.state;
            var oldPass = _state.oldPass;
            var newPass = _state.newPass;

            if (!oldPass || !newPass) {
                _this.setState({ error: _this.getMessage(239) });
                return false;
            }
            if (newPass.length < parseInt(_this.props.pydio.getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"))) {
                _this.setState({ error: _this.getMessage(378) });
                return false;
            }
            _this.setState({ error: null });
            return true;
        };

        this.post = function (callback) {
            var _state2 = _this.state;
            var oldPass = _state2.oldPass;
            var newPass = _state2.newPass;
            var pydio = _this.props.pydio;

            var logoutString = '';
            if (pydio.user.lock) {
                logoutString = ' ' + _this.getMessage(445);
            }
            pydio.user.getIdmUser().then(function (idmUser) {
                var updateUser = _cellsSdk.IdmUser.constructFromObject(JSON.parse(JSON.stringify(idmUser)));
                updateUser.OldPassword = oldPass;
                updateUser.Password = newPass;
                var api = new _cellsSdk.UserServiceApi(_pydioHttpApi2["default"].getRestClient());
                api.putUser(updateUser.Login, updateUser).then(function () {
                    pydio.displayMessage('SUCCESS', _this.getMessage(197) + logoutString);
                    callback(true);
                    if (logoutString) {
                        pydio.getController().fireAction('logout');
                    }
                });
            });
        };
    }

    _createClass(PasswordForm, [{
        key: "render",
        value: function render() {
            var _this2 = this;

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
                _this2.update(newV, 'oldPass');
            };
            var newChange = function newChange(newV, oldV) {
                _this2.update(newV, 'newPass');
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
    }]);

    return PasswordForm;
})(_react2["default"].Component);

exports["default"] = PasswordForm;
module.exports = exports["default"];
