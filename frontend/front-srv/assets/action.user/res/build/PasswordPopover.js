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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _PasswordForm = require('./PasswordForm');

var _PasswordForm2 = _interopRequireDefault(_PasswordForm);

var React = require('react');

var _require = require('material-ui');

var FlatButton = _require.FlatButton;
var RaisedButton = _require.RaisedButton;
var Popover = _require.Popover;
var Divider = _require.Divider;

var Pydio = require('pydio');

var PasswordPopover = (function (_React$Component) {
    _inherits(PasswordPopover, _React$Component);

    function PasswordPopover(props, context) {
        _classCallCheck(this, PasswordPopover);

        _get(Object.getPrototypeOf(PasswordPopover.prototype), 'constructor', this).call(this, props, context);
        this.state = { passOpen: false, passValid: false, passAnchor: null };
    }

    _createClass(PasswordPopover, [{
        key: 'passOpenPopover',
        value: function passOpenPopover(event) {
            this.setState({ passOpen: true, passAnchor: event.currentTarget });
        }
    }, {
        key: 'passClosePopover',
        value: function passClosePopover() {
            this.setState({ passOpen: false });
        }
    }, {
        key: 'passValidStatusChange',
        value: function passValidStatusChange(status) {
            this.setState({ passValid: status });
        }
    }, {
        key: 'passSubmit',
        value: function passSubmit() {
            this.refs.passwordForm.post((function (value) {
                if (value) this.passClosePopover();
            }).bind(this));
        }
    }, {
        key: 'render',
        value: function render() {
            var pydio = this.props.pydio;
            var _state = this.state;
            var passOpen = _state.passOpen;
            var passAnchor = _state.passAnchor;
            var passValid = _state.passValid;

            return React.createElement(
                'div',
                { style: { marginLeft: 8 } },
                React.createElement(RaisedButton, {
                    onTouchTap: this.passOpenPopover.bind(this),
                    label: pydio.MessageHash[194],
                    primary: true
                }),
                React.createElement(
                    Popover,
                    {
                        open: passOpen,
                        anchorEl: passAnchor,
                        anchorOrigin: { horizontal: 'left', vertical: 'top' },
                        targetOrigin: { horizontal: 'left', vertical: 'bottom' },
                        onRequestClose: this.passClosePopover.bind(this),
                        zDepth: 2
                    },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(_PasswordForm2['default'], {
                            style: { padding: 10, backgroundColor: '#fafafa', paddingBottom: 30 },
                            pydio: pydio,
                            ref: 'passwordForm',
                            onValidStatusChange: this.passValidStatusChange.bind(this)
                        }),
                        React.createElement(Divider, null),
                        React.createElement(
                            'div',
                            { style: { textAlign: 'right', padding: '8px 0' } },
                            React.createElement(FlatButton, { label: this.props.pydio.MessageHash[49], onTouchTap: this.passClosePopover.bind(this) }),
                            React.createElement(FlatButton, { disabled: !passValid, label: 'Ok', onTouchTap: this.passSubmit.bind(this) })
                        )
                    )
                )
            );
        }
    }]);

    return PasswordPopover;
})(React.Component);

exports['default'] = PasswordPopover;
module.exports = exports['default'];
