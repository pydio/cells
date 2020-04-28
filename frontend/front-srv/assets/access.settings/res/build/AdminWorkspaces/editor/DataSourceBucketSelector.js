/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _modelDataSource = require('../model/DataSource');

var _modelDataSource2 = _interopRequireDefault(_modelDataSource);

var _materialUi = require('material-ui');

var _lodash = require('lodash');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var DataSourceBucketSelector = (function (_React$Component) {
    _inherits(DataSourceBucketSelector, _React$Component);

    function DataSourceBucketSelector(props) {
        var _this = this;

        _classCallCheck(this, DataSourceBucketSelector);

        _get(Object.getPrototypeOf(DataSourceBucketSelector.prototype), 'constructor', this).call(this, props);
        this.state = {
            buckets: [],
            selection: [],
            mode: this.modeFromValue(),
            monitorApi: props.dataSource.ApiKey + '-' + props.dataSource.ApiSecret
        };
        if (props.dataSource.ObjectsBucket) {
            this.state.selection = [props.dataSource.ObjectsBucket];
        }
        this.load();
        this.loadSelection();
        this.reloadSelection = (0, _lodash.debounce)(function () {
            _this.loadSelection();
        }, 500);
        this.loadDebounced = (0, _lodash.debounce)(function () {
            _this.load();
        }, 500);
    }

    _createClass(DataSourceBucketSelector, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            var monitor = newProps.dataSource.ApiKey + '-' + newProps.dataSource.ApiSecret;
            var monitorApi = this.state.monitorApi;

            if (monitor !== monitorApi) {
                this.loadDebounced();
                this.setState({ monitorApi: monitor });
            }
        }
    }, {
        key: 'load',
        value: function load() {
            var _this2 = this;

            var dataSource = this.props.dataSource;

            if (!dataSource.ApiKey || !dataSource.ApiSecret) {
                this.setState({ buckets: [] });
                return;
            }
            this.setState({ loading: true });
            _modelDataSource2['default'].loadBuckets(dataSource).then(function (collection) {
                var nodes = collection.Children || [];
                _this2.setState({ buckets: nodes.map(function (n) {
                        return n.Path;
                    }), loading: false });
            })['catch'](function (e) {
                _this2.setState({ buckets: [], loading: false });
            });
        }
    }, {
        key: 'loadSelection',
        value: function loadSelection() {
            var _this3 = this;

            var dataSource = this.props.dataSource;

            if (!dataSource.ApiKey || !dataSource.ApiSecret) {
                this.setState({ selection: [] });
                return;
            }
            if (dataSource.ObjectsBucket) {
                this.setState({ selection: [dataSource.ObjectsBucket] });
                return;
            }
            this.setState({ selection: [] });
            if (!dataSource.StorageConfiguration.bucketsRegexp) {
                return;
            }
            _modelDataSource2['default'].loadBuckets(dataSource, dataSource.StorageConfiguration.bucketsRegexp).then(function (collection) {
                var nodes = collection.Children || [];
                _this3.setState({ selection: nodes.map(function (n) {
                        return n.Path;
                    }) });
            });
        }
    }, {
        key: 'modeFromValue',
        value: function modeFromValue() {
            var dataSource = this.props.dataSource;

            var mode = 'picker';
            if (dataSource.StorageConfiguration.bucketsRegexp) {
                mode = 'regexp';
            }
            return mode;
        }
    }, {
        key: 'toggleMode',
        value: function toggleMode() {
            var mode = this.state.mode;
            var dataSource = this.props.dataSource;

            if (mode === 'picker') {
                if (dataSource.ObjectsBucket) {
                    dataSource.StorageConfiguration.bucketsRegexp = dataSource.ObjectsBucket;
                    dataSource.ObjectsBucket = '';
                    this.reloadSelection();
                }
                this.setState({ mode: 'regexp' });
            } else {
                dataSource.StorageConfiguration.bucketsRegexp = '';
                this.reloadSelection();
                this.setState({ mode: 'picker' });
            }
        }
    }, {
        key: 'togglePicker',
        value: function togglePicker(value) {
            var dataSource = this.props.dataSource;
            var selection = this.state.selection;

            var newSel = [];
            var idx = selection.indexOf(value);
            if (idx === -1) {
                newSel = [].concat(_toConsumableArray(selection), [value]);
            } else {
                newSel = _pydioUtilLang2['default'].arrayWithout(selection, idx);
            }
            if (newSel.length === 1) {
                dataSource.ObjectsBucket = newSel[0];
                dataSource.StorageConfiguration.bucketsRegexp = '';
            } else {
                dataSource.ObjectsBucket = '';
                dataSource.StorageConfiguration.bucketsRegexp = newSel.map(function (v) {
                    return '^' + v + '$';
                }).join('|');
            }
            this.setState({ selection: newSel });
        }
    }, {
        key: 'updateRegexp',
        value: function updateRegexp(v) {
            var dataSource = this.props.dataSource;

            dataSource.StorageConfiguration.bucketsRegexp = v;
            this.reloadSelection();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var dataSource = this.props.dataSource;
            var _state = this.state;
            var buckets = _state.buckets;
            var selection = _state.selection;
            var mode = _state.mode;
            var loading = _state.loading;

            var m = function m(id) {
                return _pydio2['default'].getInstance().MessageHash['ajxp_admin.ds.editor.storage.' + id] || id;
            };

            var iconStyles = {
                style: { width: 30, height: 30, padding: 5 },
                iconStyle: { width: 20, height: 20, color: 'rgba(0,0,0,.5)', fontSize: 18 }
            };
            var disabled = !dataSource.ApiKey || !dataSource.ApiSecret;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'flex-end', marginTop: 20 } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        m('buckets.legend')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'flex-end' } },
                        mode === 'regexp' && _react2['default'].createElement(
                            'div',
                            { style: { width: 200, height: 36 } },
                            _react2['default'].createElement(ModernTextField, {
                                hintText: m('buckets.regexp.hint'),
                                fullWidth: true,
                                value: dataSource.StorageConfiguration.bucketsRegexp || '',
                                onChange: function (e, v) {
                                    _this4.updateRegexp(v);
                                }
                            })
                        ),
                        _react2['default'].createElement(_materialUi.IconButton, _extends({
                            iconClassName: "mdi mdi-filter",
                            tooltip: mode === 'picker' ? m('buckets.regexp') : '',
                            tooltipPosition: "top-left",
                            onTouchTap: function () {
                                _this4.toggleMode();
                            },
                            disabled: disabled
                        }, iconStyles))
                    ),
                    _react2['default'].createElement(_materialUi.IconButton, _extends({
                        iconClassName: "mdi mdi-reload",
                        tooltip: m('buckets.reload'),
                        tooltipPosition: "top-left",
                        onTouchTap: function () {
                            _this4.load();
                        },
                        disabled: disabled
                    }, iconStyles))
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', flexWrap: 'wrap', marginTop: 8, backgroundColor: '#f5f5f5', borderRadius: 5, padding: 2, maxHeight: 275, overflowY: 'auto' } },
                    buckets.map(function (b) {
                        var selected = selection.indexOf(b) !== -1;
                        var chipToucher = {};
                        if (mode === 'picker') {
                            chipToucher.onTouchTap = function () {
                                _this4.togglePicker(b);
                            };
                        } else if (!dataSource.StorageConfiguration.bucketsRegexp) {
                            chipToucher.onTouchTap = function () {
                                _this4.toggleMode();_this4.togglePicker(b);
                            };
                        }
                        return _react2['default'].createElement(
                            'div',
                            { style: { margin: 5 } },
                            _react2['default'].createElement(
                                _materialUi.Chip,
                                _extends({}, chipToucher, { backgroundColor: selected ? '#03a9f4' : null }),
                                b
                            )
                        );
                    }),
                    buckets.length === 0 && _react2['default'].createElement(
                        'div',
                        { style: { padding: 5, textAlign: 'center', fontSize: 16, color: 'rgba(0,0,0,.37)' } },
                        disabled ? m('buckets.cont.nokeys') : loading ? m('buckets.cont.loading') : m('buckets.cont.empty')
                    )
                )
            );
        }
    }]);

    return DataSourceBucketSelector;
})(_react2['default'].Component);

exports['default'] = DataSourceBucketSelector;
module.exports = exports['default'];
