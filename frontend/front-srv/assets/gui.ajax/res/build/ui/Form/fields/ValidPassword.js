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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var PassUtils = require('pydio/util/pass');
var React = require('react');

var _require = require('material-ui');

var TextField = _require.TextField;
exports['default'] = React.createClass({
    displayName: 'ValidPassword',

    mixins: [_mixinsFormMixin2['default']],

    isValid: function isValid() {
        return this.state.valid;
    },

    checkMinLength: function checkMinLength(value) {
        var minLength = parseInt(global.pydio.getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"));
        return !(value && value.length < minLength);
    },

    getMessage: function getMessage(messageId) {
        if (this.context && this.context.getMessage) {
            return this.context.getMessage(messageId, '');
        } else if (global.pydio && global.pydio.MessageHash) {
            return global.pydio.MessageHash[messageId];
        }
    },

    updatePassState: function updatePassState() {
        var prevStateValid = this.state.valid;
        var newState = PassUtils.getState(this.refs.pass.getValue(), this.refs.confirm ? this.refs.confirm.getValue() : '');
        this.setState(newState);
        if (prevStateValid !== newState.valid && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(newState.valid);
        }
    },

    onPasswordChange: function onPasswordChange(event) {
        this.updatePassState();
        this.onChange(event, event.target.value);
    },

    onConfirmChange: function onConfirmChange(event) {
        this.setState({ confirmValue: event.target.value });
        this.updatePassState();
        this.onChange(event, this.state.value);
    },

    render: function render() {
        if (this.isDisplayGrid() && !this.state.editMode) {
            var value = this.state.value;
            return React.createElement(
                'div',
                { onClick: this.props.disabled ? function () {} : this.toggleEditMode, className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value
            );
        } else {
            var overflow = { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' };
            var className = this.state.valid ? '' : 'mui-error-as-hint';
            if (this.props.className) {
                className = this.props.className + ' ' + className;
            }
            var _confirm = undefined;
            if (this.state.value && !this.props.disabled) {
                _confirm = [React.createElement('div', { key: 'sep', style: { width: 20 } }), React.createElement(TextField, {
                    key: 'confirm',
                    ref: 'confirm',
                    floatingLabelText: this.getMessage(199),
                    floatingLabelShrinkStyle: _extends({}, overflow, { width: '130%' }),
                    floatingLabelStyle: overflow,
                    className: className,
                    value: this.state.confirmValue,
                    onChange: this.onConfirmChange,
                    type: 'password',
                    multiLine: false,
                    disabled: this.props.disabled,
                    fullWidth: true,
                    style: { flex: 1 },
                    errorText: this.state.confirmErrorText
                })];
            }
            return React.createElement(
                'form',
                { autoComplete: 'off' },
                React.createElement(
                    'div',
                    { style: { display: 'flex', marginTop: -16 } },
                    React.createElement(TextField, {
                        ref: 'pass',
                        floatingLabelText: this.isDisplayForm() ? this.props.attributes.label : null,
                        floatingLabelShrinkStyle: _extends({}, overflow, { width: '130%' }),
                        floatingLabelStyle: overflow,
                        className: className,
                        value: this.state.value,
                        onChange: this.onPasswordChange,
                        onKeyDown: this.enterToToggle,
                        type: 'password',
                        multiLine: false,
                        disabled: this.props.disabled,
                        errorText: this.state.passErrorText,
                        fullWidth: true,
                        style: { flex: 1 }
                    }),
                    _confirm
                )
            );
        }
    }

});
module.exports = exports['default'];
