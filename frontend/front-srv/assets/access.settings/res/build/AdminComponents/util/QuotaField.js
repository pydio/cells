/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernSelectField = _Pydio$requireLib.ModernSelectField;

var QuotaField = (function (_React$Component) {
    _inherits(QuotaField, _React$Component);

    function QuotaField(props) {
        _classCallCheck(this, QuotaField);

        _get(Object.getPrototypeOf(QuotaField.prototype), 'constructor', this).call(this, props);
        if (props.value) {
            this.state = this.divide(parseInt(props.value));
        } else {
            this.state = {
                quota: 0,
                unit: 'G'
            };
        }
    }

    _createClass(QuotaField, [{
        key: 'divide',
        value: function divide(initialValue) {
            // Find lowest unit
            var uu = ["k", "M", "G", "T", "P"];
            var res = { quota: initialValue, unit: '' };
            for (var i = 0; i < uu.length; i++) {
                var check = this.multiple(1, uu[i]);
                console.log(initialValue % check);
                if (initialValue >= check && initialValue % check === 0) {
                    res = { quota: initialValue / check, unit: uu[i] };
                }
            }
            return res;
        }
    }, {
        key: 'multiple',
        value: function multiple(v, u) {
            var iV = parseFloat(v);
            switch (u) {
                case "k":
                    return iV * 1024;
                case "M":
                    return iV * 1024 * 1024;
                case "G":
                    return iV * 1024 * 1024 * 1024;
                case "T":
                    return iV * 1024 * 1024 * 1024 * 1024;
                case "P":
                    return iV * 1024 * 1024 * 1024 * 1024 * 1024;
                default:
                    return iV;
            }
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState) {
            if (nextState === this.state) {
                return;
            }

            var quota = nextState.quota;
            var unit = nextState.unit;

            this.props.onChange(null, this.multiple(quota, unit));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var sizeUnit = _pydio2['default'].getMessages()['byte_unit_symbol'] || 'B';
            var noQuota = _pydio2['default'].getMessages()['ajxp_admin.ws.editor.other.quota.noquota'];

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex' } },
                    _react2['default'].createElement(ModernTextField, {
                        value: this.state.quota > 0 ? this.state.quota : null,
                        hintText: "No Quota",
                        hintStyle: { paddingLeft: 52 },
                        style: { flex: 2, marginRight: 4 },
                        type: "number",
                        onChange: function (e, v) {
                            _this.setState({ quota: Math.max(0, v) || 0 });
                        }
                    }),
                    _react2['default'].createElement(
                        ModernSelectField,
                        {
                            value: this.state.unit,
                            onChange: function (e, i, v) {
                                var _state = _this.state;
                                var quota = _state.quota;
                                var unit = _state.unit;

                                if (v !== unit) {
                                    quota = quota * _this.multiple(1, unit) / _this.multiple(1, v);
                                }
                                _this.setState({ quota: quota, unit: v });
                            },
                            style: { marginLeft: 4, flex: 1 }
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { value: '', primaryText: sizeUnit }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: 'k', primaryText: 'K' + sizeUnit }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: 'M', primaryText: 'M' + sizeUnit }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: 'G', primaryText: 'G' + sizeUnit }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: 'T', primaryText: 'T' + sizeUnit }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: 'P', primaryText: 'P' + sizeUnit })
                    )
                )
            );
        }
    }]);

    return QuotaField;
})(_react2['default'].Component);

exports['default'] = QuotaField;
module.exports = exports['default'];
