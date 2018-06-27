/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Effect = (function (_React$Component) {
    _inherits(Effect, _React$Component);

    function Effect() {
        _classCallCheck(this, Effect);

        _get(Object.getPrototypeOf(Effect.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Effect, [{
        key: 'onChange',
        value: function onChange(event, newValue) {
            var rule = this.props.rule;

            this.props.onChange(_extends({}, rule, { effect: newValue }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var rule = _props.rule;
            var containerStyle = _props.containerStyle;

            var styles = {
                allowColor: "#33691e",
                denyColor: "#d32f2f",
                radios: {
                    width: 130
                }
            };
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, containerStyle, { display: 'flex', alignItems: 'center', fontSize: 16 }) },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, fontWeight: 500 } },
                        'Effect'
                    ),
                    _react2['default'].createElement(
                        _materialUi.RadioButtonGroup,
                        { style: { display: 'flex', alignItems: 'center' }, name: "effect", valueSelected: rule.effect, defaultSelected: 'allow', onChange: this.onChange.bind(this) },
                        _react2['default'].createElement(_materialUi.RadioButton, { value: 'allow', label: 'Allow', style: styles.radios,
                            checkedIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-traffic-light', color: styles.allowColor }) }),
                        _react2['default'].createElement(_materialUi.RadioButton, { value: 'deny', label: 'Deny', style: styles.radios,
                            checkedIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-traffic-light', color: styles.denyColor }) })
                    )
                ),
                _react2['default'].createElement(_materialUi.Divider, null)
            );
        }
    }]);

    return Effect;
})(_react2['default'].Component);

exports['default'] = Effect;
module.exports = exports['default'];
