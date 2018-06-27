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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _ValuesOrRegexp = require('./ValuesOrRegexp');

var _ValuesOrRegexp2 = _interopRequireDefault(_ValuesOrRegexp);

var ChipValues = (function (_React$Component) {
    _inherits(ChipValues, _React$Component);

    function ChipValues() {
        _classCallCheck(this, ChipValues);

        _get(Object.getPrototypeOf(ChipValues.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ChipValues, [{
        key: 'addChip',
        value: function addChip(newValue) {
            if (this.props.values.find(function (v) {
                return v === newValue;
            })) {
                // value already there, ignore
                return;
            }
            var newValues = [].concat(_toConsumableArray(this.props.values), [newValue]);
            this.props.onChange(newValues);
        }
    }, {
        key: 'deleteChip',
        value: function deleteChip(chipValue) {
            var newValues = this.props.values.filter(function (v) {
                return v !== chipValue;
            });
            this.props.onChange(newValues);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var title = _props.title;
            var values = _props.values;
            var presetValues = _props.presetValues;
            var allowAll = _props.allowAll;
            var allowFreeString = _props.allowFreeString;
            var containerStyle = _props.containerStyle;
            var freeStringDefaultPrefix = _props.freeStringDefaultPrefix;
            var presetFreeStrings = _props.presetFreeStrings;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, containerStyle, { margin: '6px 16px', display: 'flex', alignItems: 'center' }) },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, fontWeight: 500 } },
                        title,
                        ' '
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' } },
                        values.map(function (a) {
                            return _react2['default'].createElement(
                                _materialUi.Chip,
                                { style: { marginRight: 10, marginBottom: 5 }, onRequestDelete: _this.deleteChip.bind(_this, a) },
                                a
                            );
                        }),
                        !values.length && _react2['default'].createElement(
                            'span',
                            { style: { fontStyle: 'italic', color: '#e9e9e9' } },
                            'Please provide at least one value'
                        )
                    ),
                    _react2['default'].createElement(_ValuesOrRegexp2['default'], {
                        presetValues: presetValues,
                        allowAll: allowAll,
                        allowFreeString: allowFreeString,
                        presetFreeStrings: presetFreeStrings,
                        onValueSelected: this.addChip.bind(this),
                        freeStringDefaultPrefix: freeStringDefaultPrefix
                    })
                ),
                _react2['default'].createElement(_materialUi.Divider, null)
            );
        }
    }]);

    return ChipValues;
})(_react2['default'].Component);

exports['default'] = ChipValues;
module.exports = exports['default'];
