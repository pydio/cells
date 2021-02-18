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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _Pydio$requireLib = _pydio2["default"].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */

var ValidLogin = (function (_React$Component) {
    _inherits(ValidLogin, _React$Component);

    function ValidLogin() {
        _classCallCheck(this, ValidLogin);

        _React$Component.apply(this, arguments);
    }

    ValidLogin.prototype.textValueChanged = function textValueChanged(event, value) {
        var err = _pydioUtilPass2["default"].isValidLogin(value);
        var prevStateValid = this.state.valid;
        var valid = !err;
        if (prevStateValid !== valid && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(valid);
        }
        this.setState({ valid: valid, err: err });

        this.props.onChange(event, value);
    };

    ValidLogin.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var isDisplayGrid = _props.isDisplayGrid;
        var isDisplayForm = _props.isDisplayForm;
        var editMode = _props.editMode;
        var disabled = _props.disabled;
        var errorText = _props.errorText;
        var enterToToggle = _props.enterToToggle;
        var toggleEditMode = _props.toggleEditMode;
        var attributes = _props.attributes;

        if (isDisplayGrid() && !editMode) {
            var _value = this.props.value;

            if (attributes['type'] === 'password' && _value) {
                _value = '***********';
            }
            return _react2["default"].createElement(
                "div",
                { onClick: disabled ? function () {} : toggleEditMode, className: _value ? '' : 'paramValue-empty' },
                _value ? _value : 'Empty'
            );
        } else {
            var err = this.state.err;

            var field = _react2["default"].createElement(ModernTextField, {
                floatingLabelText: isDisplayForm() ? attributes.label : null,
                value: value || "",
                onChange: function (e, v) {
                    return _this.textValueChanged(e, v);
                },
                onKeyDown: enterToToggle,
                type: attributes['type'] === 'password' ? 'password' : null,
                multiLine: attributes['type'] === 'textarea',
                disabled: disabled,
                errorText: errorText || err,
                autoComplete: "off",
                fullWidth: true
            });
            if (attributes['type'] === 'password') {
                return _react2["default"].createElement(
                    "form",
                    { autoComplete: "off", onSubmit: function (e) {
                            e.stopPropagation();e.preventDefault();
                        }, style: { display: 'inline' } },
                    field
                );
            } else {
                return _react2["default"].createElement(
                    "span",
                    null,
                    field
                );
            }
        }
    };

    return ValidLogin;
})(_react2["default"].Component);

exports["default"] = _hocAsFormField2["default"](ValidLogin);
module.exports = exports["default"];
