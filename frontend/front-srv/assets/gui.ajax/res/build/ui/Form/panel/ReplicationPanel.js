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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ReplicatedGroup = require('./ReplicatedGroup');

var _ReplicatedGroup2 = _interopRequireDefault(_ReplicatedGroup);

var React = require('react');

var _require = require('material-ui');

var IconButton = _require.IconButton;

var PropTypes = require('prop-types');
var LangUtils = require('pydio/util/lang');

/**
 * Sub form replicating itself (+/-)
 */

var _default = (function (_React$Component) {
    _inherits(_default, _React$Component);

    function _default() {
        var _this = this;

        _classCallCheck(this, _default);

        _React$Component.apply(this, arguments);

        this.buildSubValue = function (values) {
            var index = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

            var subVal = undefined;
            var suffix = index == 0 ? '' : '_' + index;
            _this.props.parameters.map(function (p) {
                var pName = p['name'];
                if (values[pName + suffix] !== undefined) {
                    if (!subVal) subVal = {};
                    subVal[pName] = values[pName + suffix];
                }
            });
            return subVal || false;
        };

        this.indexedValues = function (rowsArray) {
            var index = 0,
                values = {};
            rowsArray.map(function (row) {
                var suffix = index == 0 ? '' : '_' + index;
                for (var p in row) {
                    if (!row.hasOwnProperty(p)) continue;
                    values[p + suffix] = row[p];
                }
                index++;
            });
            return values;
        };

        this.indexValues = function (rowsArray, removeLastRow) {
            var indexed = _this.indexedValues(rowsArray);
            if (_this.props.onChange) {
                if (removeLastRow) {
                    (function () {
                        var lastRow = {},
                            nextIndex = rowsArray.length - 1;
                        _this.props.parameters.map(function (p) {
                            lastRow[p['name'] + (nextIndex > 0 ? '_' + nextIndex : '')] = '';
                        });
                        _this.props.onChange(indexed, true, lastRow);
                    })();
                } else {
                    _this.props.onChange(indexed, true);
                }
            }
        };

        this.instances = function () {
            // Analyze current value to grab number of rows.
            var rows = [],
                subVal = undefined,
                index = 0;
            while (subVal = _this.buildSubValue(_this.props.values, index)) {
                index++;
                rows.push(subVal);
            }
            var firstParam = _this.props.parameters[0];
            if (!rows.length && firstParam['replicationMandatory'] === 'true') {
                (function () {
                    var emptyValue = {};
                    _this.props.parameters.map(function (p) {
                        emptyValue[p['name']] = p['default'] || '';
                    });
                    rows.push(emptyValue);
                })();
            }
            return rows;
        };

        this.addRow = function () {
            var newValue = {},
                currentValues = _this.instances();
            _this.props.parameters.map(function (p) {
                newValue[p['name']] = p['default'] || '';
            });
            currentValues.push(newValue);
            _this.indexValues(currentValues);
        };

        this.removeRow = function (index) {
            var instances = _this.instances();
            var removeInst = instances[index];
            instances = LangUtils.arrayWithout(_this.instances(), index);
            instances.push(removeInst);
            _this.indexValues(instances, true);
        };

        this.swapRows = function (i, j) {
            var instances = _this.instances();
            var tmp = instances[j];
            instances[j] = instances[i];
            instances[i] = tmp;
            _this.indexValues(instances);
        };

        this.onChange = function (index, newValues, dirty) {
            var instances = _this.instances();
            instances[index] = newValues;
            _this.indexValues(instances);
        };

        this.onParameterChange = function (index, paramName, newValue, oldValue) {
            var instances = _this.instances();
            instances[index][paramName] = newValue;
            _this.indexValues(instances);
        };
    }

    _default.prototype.render = function render() {
        var _this2 = this;

        var _props = this.props;
        var parameters = _props.parameters;
        var disabled = _props.disabled;

        var firstParam = parameters[0];
        var replicationTitle = firstParam['replicationTitle'] || firstParam['label'];
        var replicationDescription = firstParam['replicationDescription'] || firstParam['description'];
        var replicationMandatory = firstParam['replicationMandatory'] === 'true';

        var instances = this.instances();
        var multipleRows = instances.length > 1;
        var multipleParams = parameters.length > 1;
        var rows = instances.map(function (subValues, index) {
            var onSwapUp = undefined,
                onSwapDown = undefined,
                onRemove = undefined;
            var onParameterChange = function onParameterChange(paramName, newValue, oldValue) {
                _this2.onParameterChange(index, paramName, newValue, oldValue);
            };
            if (multipleRows && index > 0) {
                onSwapUp = function () {
                    _this2.swapRows(index, index - 1);
                };
            }
            if (multipleRows && index < instances.length - 1) {
                onSwapDown = function () {
                    _this2.swapRows(index, index + 1);
                };
            }
            if (multipleRows || !replicationMandatory) {
                onRemove = function () {
                    _this2.removeRow(index);
                };
            }
            var props = { onSwapUp: onSwapUp, onSwapDown: onSwapDown, onRemove: onRemove, onParameterChange: onParameterChange };
            if (replicationMandatory && index === 0) {
                props.onAddValue = function () {
                    return _this2.addRow();
                };
            }
            return React.createElement(_ReplicatedGroup2['default'], _extends({ key: index }, _this2.props, props, { subValues: subValues }));
        });

        if (replicationMandatory) {
            return React.createElement(
                'div',
                { className: 'replicable-field', style: { marginBottom: 14 } },
                rows
            );
        }

        var tStyle = rows.length ? {} : { backgroundColor: 'whitesmoke', borderRadius: 4 };
        return React.createElement(
            'div',
            { className: 'replicable-field', style: { marginBottom: 14 } },
            React.createElement(
                'div',
                { style: _extends({ display: 'flex', alignItems: 'center' }, tStyle) },
                React.createElement(IconButton, { key: 'add', iconClassName: 'mdi mdi-plus-box-outline', tooltipPosition: "top-right", style: { height: 36, width: 36, padding: 6 }, iconStyle: { fontSize: 24 }, tooltip: 'Add value', onClick: function () {
                        return _this2.addRow();
                    }, disabled: disabled }),
                React.createElement(
                    'div',
                    { className: 'title', style: { fontSize: 16, flex: 1 } },
                    replicationTitle
                )
            ),
            rows
        );
    };

    _createClass(_default, null, [{
        key: 'propTypes',
        value: {
            parameters: PropTypes.array.isRequired,
            values: PropTypes.object,
            onChange: PropTypes.func,
            disabled: PropTypes.bool,
            binary_context: PropTypes.string,
            depth: PropTypes.number
        },
        enumerable: true
    }]);

    return _default;
})(React.Component);

exports['default'] = _default;
module.exports = exports['default'];
