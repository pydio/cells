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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Conditions = (function (_React$Component) {
    _inherits(Conditions, _React$Component);

    function Conditions(props) {
        _classCallCheck(this, Conditions);

        _get(Object.getPrototypeOf(Conditions.prototype), 'constructor', this).call(this, props);
        this.state = {};
    }

    _createClass(Conditions, [{
        key: 'onConditionAdd',
        value: function onConditionAdd(event, fieldName) {
            var rule = this.props.rule;

            if (!rule.conditions || !rule.conditions[fieldName]) {
                var conds = rule.conditions || {};
                var newConds = _extends({}, conds);
                newConds[fieldName] = { type: "", options: {}, jsonOptions: "{}" };
                this.setState(_defineProperty({}, fieldName + 'JsonInvalid', 'please provide a condition type'));
                this.props.onChange(_extends({}, rule, { conditions: newConds }));
            }
        }
    }, {
        key: 'onConditionRemove',
        value: function onConditionRemove(fieldName) {
            var rule = this.props.rule;

            var newConds = _extends({}, rule.conditions);
            delete newConds[fieldName];
            this.props.onChange(_extends({}, rule, { conditions: newConds }));
        }
    }, {
        key: 'onChange',
        value: function onChange(fieldName, event, newValue) {
            var rule = this.props.rule;

            var parsedValue = undefined;
            try {
                parsedValue = JSON.parse(newValue);
                if (!parsedValue.type) {
                    this.setState(_defineProperty({}, fieldName + 'JsonInvalid', 'please provide a condition type'));
                    return;
                }
            } catch (e) {
                this.setState(_defineProperty({}, fieldName + 'JsonInvalid', 'invalid json'));
                return;
            }
            this.setState(_defineProperty({}, fieldName + 'JsonInvalid', null));
            if (parsedValue.options) {
                parsedValue.jsonOptions = JSON.stringify(parsedValue.options);
            }
            var newConds = _extends({}, rule.conditions);
            newConds[fieldName] = parsedValue;
            this.props.onChange(_extends({}, rule, { conditions: newConds }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var rule = _props.rule;
            var containerStyle = _props.containerStyle;

            var conditions = [];
            if (rule.conditions) {
                (function () {
                    var i = 0;
                    conditions = Object.keys(rule.conditions).map(function (k) {
                        i++;
                        var displayCond = _extends({}, rule.conditions[k]);
                        if (displayCond.jsonOptions) {
                            displayCond.options = JSON.parse(displayCond.jsonOptions);
                            delete displayCond['jsonOptions'];
                        }
                        return _react2['default'].createElement(
                            'div',
                            { style: { marginLeft: 100 } },
                            _react2['default'].createElement(
                                'div',
                                { style: { display: 'flex', alignItems: 'baseline', marginTop: i == 1 ? -10 : 0 } },
                                k,
                                _react2['default'].createElement(
                                    'div',
                                    { style: { flex: 1 } },
                                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", tooltip: "Remove Condition", onTouchTap: _this.onConditionRemove.bind(_this, k) })
                                ),
                                _react2['default'].createElement(
                                    'div',
                                    { style: { color: '#C62828', fontSize: 13, fontWeight: 500 } },
                                    _this.state[k + 'JsonInvalid']
                                )
                            ),
                            _react2['default'].createElement(
                                _materialUi.Paper,
                                { zDepth: 1 },
                                _react2['default'].createElement(AdminComponents.CodeMirrorField, {
                                    key: rule.id + '-' + k,
                                    mode: 'json',
                                    value: JSON.stringify(displayCond, null, 2),
                                    onChange: _this.onChange.bind(_this, k)
                                })
                            )
                        );
                    });
                })();
            }

            var fields = ["HEADER:Query Context", "RemoteAddress", "RequestMethod", "RequestURI", "HttpProtocol", "UserAgent", "ContentType", "CookiesString", "RemoteAddress", "DIVIDER", "HEADER:Node Filters", "NodeMetaName", "NodeMetaPath", "NodeMetaExtension", "NodeMetaMimeType", "NodeMetaSize", "NodeMetaMTime", "NodeMeta"];

            return _react2['default'].createElement(
                'div',
                { style: _extends({}, containerStyle, { margin: '6px 16px' }) },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, fontWeight: 500 } },
                        'Conditions'
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, flex: 1 } },
                        rule.conditions ? '' : 'No conditions set'
                    ),
                    _react2['default'].createElement(
                        _materialUi.IconMenu,
                        {
                            iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", tooltip: "Add value..." }),
                            onChange: this.onConditionAdd.bind(this),
                            maxHeight: 250
                        },
                        fields.map(function (k) {
                            if (k === 'DIVIDER') {
                                return _react2['default'].createElement(_materialUi.Divider, null);
                            } else if (k.startsWith("HEADER:")) {
                                return _react2['default'].createElement(
                                    _materialUi.Subheader,
                                    null,
                                    k.replace("HEADER:", "")
                                );
                            } else {
                                return _react2['default'].createElement(_materialUi.MenuItem, { primaryText: k, value: k });
                            }
                        })
                    )
                ),
                conditions
            );
        }
    }]);

    return Conditions;
})(_react2['default'].Component);

exports['default'] = Conditions;
module.exports = exports['default'];
