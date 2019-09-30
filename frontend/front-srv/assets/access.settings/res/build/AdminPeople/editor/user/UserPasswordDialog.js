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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _pydioUtilPass = require("pydio/util/pass");

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _Pydio$requireLib = _pydio2["default"].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;

var _Pydio$requireLib2 = _pydio2["default"].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;
exports["default"] = _react2["default"].createClass({
    displayName: "UserPasswordDialog",

    mixins: [AdminComponents.MessagesConsumerMixin, ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin],

    propTypes: {
        pydio: _react2["default"].PropTypes.instanceOf(_pydio2["default"]),
        user: _react2["default"].PropTypes.instanceOf(_modelUser2["default"])
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: pydio.MessageHash['role_editor.25'],
            dialogSize: 'sm'
        };
    },

    getInitialState: function getInitialState() {
        var pwdState = _pydioUtilPass2["default"].getState();
        return _extends({}, pwdState);
    },

    onChange: function onChange(event, value) {
        var passValue = this.refs.pass.getValue();
        var confirmValue = this.refs.confirm.getValue();
        var newState = _pydioUtilPass2["default"].getState(passValue, confirmValue, this.state);
        this.setState(newState);
    },

    submit: function submit() {
        var _this = this;

        if (!this.state.valid) {
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText);
            return;
        }

        var value = this.refs.pass.getValue();
        var user = this.props.user;

        user.getIdmUser().Password = value;
        user.save().then(function () {
            _this.dismiss();
        });
    },

    render: function render() {

        // This is passed via state, context is not working,
        // so we have to get the messages from the global.
        var getMessage = function getMessage(id) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
            return global.pydio.MessageHash[namespace + (namespace ? '.' : '') + id] || id;
        };
        return _react2["default"].createElement(
            "div",
            { style: { width: '100%' } },
            _react2["default"].createElement(ModernTextField, {
                ref: "pass",
                type: "password",
                fullWidth: true,
                onChange: this.onChange,
                floatingLabelText: getMessage('523'),
                errorText: this.state.passErrorText,
                hintText: this.state.passHintText
            }),
            _react2["default"].createElement(ModernTextField, {
                ref: "confirm",
                type: "password",
                fullWidth: true,
                onChange: this.onChange,
                floatingLabelText: getMessage('199'),
                errorText: this.state.confirmErrorText
            })
        );
    }

});
module.exports = exports["default"];
