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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _require = require('react');

var Component = _require.Component;

var _require2 = require('material-ui');

var Toggle = _require2.Toggle;
var Subheader = _require2.Subheader;
var MenuItem = _require2.MenuItem;
var SelectField = _require2.SelectField;
var TextField = _require2.TextField;
var TimePicker = _require2.TimePicker;

var EmailPanel = (function (_Component) {
    _inherits(EmailPanel, _Component);

    function EmailPanel() {
        _classCallCheck(this, EmailPanel);

        _get(Object.getPrototypeOf(EmailPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(EmailPanel, [{
        key: 'onChange',
        value: function onChange(partialValues) {
            var _props = this.props;
            var values = _props.values;
            var onChange = _props.onChange;

            onChange(_extends({}, values, partialValues), true);
        }
    }, {
        key: 'onFrequencyChange',
        value: function onFrequencyChange(value) {
            var partial = { NOTIFICATIONS_EMAIL_FREQUENCY: value };
            var newUserValue = undefined;
            switch (value) {
                case 'M':
                    newUserValue = '5';
                    break;
                case 'H':
                    newUserValue = '2';
                    break;
                case 'D1':
                    newUserValue = '03';
                    break;
                case 'D2':
                    newUserValue = '09,14';
                    break;
                case 'W1':
                    newUserValue = 'Monday';
                    break;
            }
            partial.NOTIFICATIONS_EMAIL_FREQUENCY_USER = newUserValue;
            this.onChange(partial);
        }
    }, {
        key: 'onPickDate',
        value: function onPickDate(position, event, date) {
            var NOTIFICATIONS_EMAIL_FREQUENCY_USER = this.props.values.NOTIFICATIONS_EMAIL_FREQUENCY_USER;

            var hours = NOTIFICATIONS_EMAIL_FREQUENCY_USER.split(',');
            var newHours = [];
            if (position === 'first') newHours = [date.getHours(), hours[1] ? hours[1] : '00'];
            if (position === 'last') newHours = [hours[0] ? hours[0] : '00', date.getHours()];
            this.onChange({ NOTIFICATIONS_EMAIL_FREQUENCY_USER: newHours.join(',') });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props2 = this.props;
            var definitions = _props2.definitions;
            var values = _props2.values;
            var pydio = _props2.pydio;

            var message = function message(id) {
                return pydio.MessageHash['user_dash.' + id];
            };
            var NOTIFICATIONS_EMAIL_GET = values.NOTIFICATIONS_EMAIL_GET;
            var NOTIFICATIONS_EMAIL_FREQUENCY = values.NOTIFICATIONS_EMAIL_FREQUENCY;
            var NOTIFICATIONS_EMAIL_FREQUENCY_USER = values.NOTIFICATIONS_EMAIL_FREQUENCY_USER;
            var NOTIFICATIONS_EMAIL = values.NOTIFICATIONS_EMAIL;
            var NOTIFICATIONS_EMAIL_SEND_HTML = values.NOTIFICATIONS_EMAIL_SEND_HTML;

            var mailActive = NOTIFICATIONS_EMAIL_GET === 'true';
            var frequencyTypes = new Map();
            var frequencyMenus = [];
            definitions[1]['choices'].split(',').map(function (e) {
                var d = e.split('|');
                frequencyTypes.set(d[0], d[1]);
                frequencyMenus.push(React.createElement(MenuItem, { primaryText: d[1], value: d[0] }));
            });
            var userFrequencyComponent = undefined;
            if (mailActive) {
                switch (NOTIFICATIONS_EMAIL_FREQUENCY) {
                    case 'M':
                    case 'H':
                        userFrequencyComponent = React.createElement(TextField, {
                            fullWidth: true,
                            floatingLabelText: NOTIFICATIONS_EMAIL_FREQUENCY === 'M' ? message(62) : message(63),
                            value: NOTIFICATIONS_EMAIL_FREQUENCY_USER,
                            onChange: function (e, v) {
                                _this.onChange({ NOTIFICATIONS_EMAIL_FREQUENCY_USER: v });
                            }
                        });
                        break;
                    case 'D1':
                        var d = new Date();
                        d.setHours(NOTIFICATIONS_EMAIL_FREQUENCY_USER);d.setMinutes(0);
                        userFrequencyComponent = React.createElement(TimePicker, {
                            format: 'ampm',
                            hintText: message(64),
                            value: d,
                            onChange: function (e, date) {
                                _this.onChange({ NOTIFICATIONS_EMAIL_FREQUENCY_USER: date.getHours() });
                            },
                            autoOk: true,
                            textFieldStyle: { width: '100%' }
                        });
                        break;
                    case 'D2':
                        var hours = NOTIFICATIONS_EMAIL_FREQUENCY_USER + '';
                        if (!hours) hours = '09,14';
                        hours = hours.split(',');
                        var d1 = new Date();
                        var d2 = new Date();d2.setMinutes(0);
                        d1.setHours(hours[0]);d1.setMinutes(0);
                        if (hours[1]) {
                            d2.setHours(hours[1]);
                        }
                        userFrequencyComponent = React.createElement(
                            'div',
                            { style: { display: 'flex' } },
                            React.createElement(TimePicker, {
                                format: 'ampm',
                                hintText: message(65),
                                value: d1,
                                onChange: this.onPickDate.bind(this, 'first'),
                                textFieldStyle: { width: 100, marginRight: 5 }
                            }),
                            React.createElement(TimePicker, {
                                format: 'ampm',
                                hintText: message(66),
                                value: d2,
                                onChange: this.onPickDate.bind(this, 'last'),
                                textFieldStyle: { width: 100, marginLeft: 5 }
                            })
                        );
                        break;
                    case 'W1':
                        userFrequencyComponent = React.createElement(
                            SelectField,
                            {
                                floatingLabelText: message(67),
                                fullWidth: true,
                                value: NOTIFICATIONS_EMAIL_FREQUENCY_USER,
                                onChange: function (e, i, v) {
                                    _this.onChange({ NOTIFICATIONS_EMAIL_FREQUENCY_USER: v });
                                }
                            },
                            React.createElement(MenuItem, { primaryText: message(68), value: 'Monday' }),
                            React.createElement(MenuItem, { primaryText: message(69), value: 'Tuesday' }),
                            React.createElement(MenuItem, { primaryText: message(70), value: 'Wednesday' }),
                            React.createElement(MenuItem, { primaryText: message(71), value: 'Thursday' }),
                            React.createElement(MenuItem, { primaryText: message(72), value: 'Friday' }),
                            React.createElement(MenuItem, { primaryText: message(73), value: 'Saturday' }),
                            React.createElement(MenuItem, { primaryText: message(74), value: 'Sunday' })
                        );
                        break;
                }
            }

            return React.createElement(
                'div',
                null,
                React.createElement(
                    Subheader,
                    { style: { paddingLeft: 20 } },
                    message(61)
                ),
                React.createElement(
                    'div',
                    { style: { padding: '0 20px 20px' } },
                    React.createElement(Toggle, {
                        label: definitions[0]['label'],
                        toggled: NOTIFICATIONS_EMAIL_GET === 'true',
                        onToggle: function (e, v) {
                            _this.onChange({ NOTIFICATIONS_EMAIL_GET: v ? 'true' : 'false' });
                        }
                    }),
                    mailActive && React.createElement(
                        'div',
                        { style: { paddingBottom: 16 } },
                        React.createElement(
                            'div',
                            { style: { padding: '16px 0' } },
                            React.createElement(Toggle, {
                                label: definitions[4]['label'],
                                toggled: NOTIFICATIONS_EMAIL_SEND_HTML === 'true',
                                onToggle: function (e, v) {
                                    _this.onChange({ NOTIFICATIONS_EMAIL_SEND_HTML: v ? 'true' : 'false' });
                                }
                            })
                        ),
                        React.createElement(
                            SelectField,
                            {
                                fullWidth: true,
                                floatingLabelText: definitions[1]['label'],
                                value: NOTIFICATIONS_EMAIL_FREQUENCY,
                                onChange: function (e, k, p) {
                                    _this.onFrequencyChange(p);
                                }
                            },
                            frequencyMenus
                        ),
                        userFrequencyComponent
                    )
                )
            );
        }
    }]);

    return EmailPanel;
})(Component);

EmailPanel.propTypes = {

    definitions: _propTypes2['default'].object,
    values: _propTypes2['default'].object,
    onChange: _propTypes2['default'].func

};

exports['default'] = EmailPanel;
module.exports = exports['default'];
