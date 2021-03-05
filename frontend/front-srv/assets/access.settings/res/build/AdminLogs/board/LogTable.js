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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _modelLog = require('../model/Log');

var _modelLog2 = _interopRequireDefault(_modelLog);

var _LogDetail = require('./LogDetail');

var _LogDetail2 = _interopRequireDefault(_LogDetail);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib2.moment;

var LogTable = (function (_React$Component) {
    _inherits(LogTable, _React$Component);

    function LogTable(props) {
        _classCallCheck(this, LogTable);

        _get(Object.getPrototypeOf(LogTable.prototype), 'constructor', this).call(this, props);
        this.state = { logs: [], loading: false, rootSpans: {}, selectedRows: [] };
    }

    _createClass(LogTable, [{
        key: 'initRootSpans',
        value: function initRootSpans(logs) {
            if (!logs || !logs.length) {
                return { logs: [], rootSpans: {} };
            }
            var rootSpans = {};
            // Detect logs without parent Uuid
            var oLogs = logs.map(function (l, i) {
                if (!l.SpanUuid) {
                    l.SpanUuid = 'span-' + i;
                }
                if (!l.SpanRootUuid) {
                    rootSpans[l.SpanUuid] = { open: true, children: [] };
                }
                return l;
            });
            // Filter out logs with parent Uuid and place them as children
            var result = [];
            for (var i = 0; i < oLogs.length; i++) {
                var l = oLogs[i];
                if (l.SpanRootUuid && rootSpans[l.SpanRootUuid]) {
                    rootSpans[l.SpanRootUuid].children.push(l);
                    l.HasRoot = true;
                    continue;
                } else if (l.SpanRootUuid && !rootSpans[l.SpanRootUuid]) {
                    // Create a fake root
                    var root = _extends({}, l);
                    root.SpanUuid = l.SpanRootUuid;
                    l.HasRoot = true;
                    rootSpans[l.SpanRootUuid] = { open: true, children: [l] };
                    result.push(root);
                    continue;
                }
                result.push(l);
            }
            return { logs: result, rootSpans: rootSpans };
        }

        /**
         * @return []{*}
         */
    }, {
        key: 'openSpans',
        value: function openSpans() {
            var _state = this.state;
            var logs = _state.logs;
            var rootSpans = _state.rootSpans;

            var result = [];
            for (var j = 0; j < logs.length; j++) {
                var l = logs[j];
                var root = rootSpans[l.SpanUuid];
                if (root.children.length) {
                    l.HasChildren = true;
                    l.IsOpen = root.open;
                    if (!l.RemoteAddress) {
                        var cRemote = root.children.filter(function (c) {
                            return c.RemoteAddress;
                        });
                        if (cRemote.length) l.RemoteAddress = cRemote[0].RemoteAddress;
                    }
                }
                result.push(l);
                if (root.open) {
                    result = [].concat(_toConsumableArray(result), _toConsumableArray(root.children));
                }
            }
            return result;
        }
    }, {
        key: 'load',
        value: function load(service, query, page, size, contentType, onLoadingStatusChange) {
            var _this = this;

            var logs = this.state.logs;

            if (onLoadingStatusChange) {
                this.setState({ loading: true });
                onLoadingStatusChange(true, logs.length);
            }
            _pydio2['default'].startLoading();
            _modelLog2['default'].loadLogs(service, query, page, size, contentType).then(function (data) {
                _pydio2['default'].endLoading();

                var _initRootSpans = _this.initRootSpans(data.Logs);

                var logs = _initRootSpans.logs;
                var rootSpans = _initRootSpans.rootSpans;

                _this.setState({ logs: logs, rootSpans: rootSpans, loading: false }, function () {
                    if (onLoadingStatusChange) {
                        onLoadingStatusChange(false, data.Logs ? data.Logs.length : 0);
                    }
                });
            })['catch'](function (reason) {
                _pydio2['default'].endLoading();
                if (onLoadingStatusChange) {
                    _this.setState({ loading: false });
                    onLoadingStatusChange(false, logs.length);
                }
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props;
            var service = _props.service;
            var page = _props.page;
            var size = _props.size;
            var onLoadingStatusChange = _props.onLoadingStatusChange;

            this.load(service, '', page, size, 'JSON', onLoadingStatusChange);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var service = nextProps.service;
            var query = nextProps.query;
            var page = nextProps.page;
            var size = nextProps.size;
            var onLoadingStatusChange = nextProps.onLoadingStatusChange;
            var z = nextProps.z;

            if (query === this.props.query && size === this.props.size && page === this.props.page && z === this.props.z) {
                return;
            }
            this.load(service, query, page, size, 'JSON', onLoadingStatusChange);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state2 = this.state;
            var loading = _state2.loading;
            var rootSpans = _state2.rootSpans;
            var selectedRows = _state2.selectedRows;
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var onTimestampContext = _props2.onTimestampContext;
            var query = _props2.query;
            var focus = _props2.focus;
            var _props3 = this.props;
            var _onPageNext = _props3.onPageNext;
            var _onPagePrev = _props3.onPagePrev;
            var nextDisabled = _props3.nextDisabled;
            var prevDisabled = _props3.prevDisabled;
            var onPageSizeChange = _props3.onPageSizeChange;
            var page = _props3.page;
            var size = _props3.size;
            var pageSizes = _props3.pageSizes;

            var logs = this.openSpans();
            if (selectedRows.length) {
                (function () {
                    var expStyle = { paddingBottom: 20, paddingLeft: 53, backgroundColor: '#fafafa', marginTop: -10, paddingTop: 10 };
                    var first = JSON.stringify(selectedRows[0]);
                    logs = logs.map(function (log) {
                        if (JSON.stringify(log) === first) {
                            return _extends({}, log, {
                                expandedRow: _react2['default'].createElement(_LogDetail2['default'], {
                                    style: expStyle,
                                    userDisplay: "inline",
                                    pydio: pydio,
                                    log: log,
                                    focus: focus,
                                    onSelectPeriod: onTimestampContext,
                                    onRequestClose: function () {
                                        return _this2.setState({ selectedRows: [] });
                                    }
                                }) });
                        } else {
                            return log;
                        }
                    });
                })();
            }
            var MessageHash = pydio.MessageHash;

            var columns = [{
                name: 'Root',
                label: '',
                style: { width: 20, paddingLeft: 0, paddingRight: 0, overflow: 'visible' },
                headerStyle: { width: 20, paddingLeft: 0, paddingRight: 0 },
                renderCell: function renderCell(row) {
                    if (row.HasChildren) {
                        var toggle = function toggle() {
                            rootSpans[row.SpanUuid].open = !rootSpans[row.SpanUuid].open;
                            _this2.setState({ rootSpans: rootSpans });
                        };
                        return _react2['default'].createElement(_materialUi.IconButton, {
                            iconClassName: row.IsOpen ? "mdi mdi-menu-down" : "mdi mdi-menu-right",
                            onClick: toggle
                        });
                    }
                    return null;
                }
            }, { name: 'Ts', label: pydio.MessageHash["settings.17"], renderCell: function renderCell(row) {
                    var m = moment(row.Ts * 1000);
                    var dateString = undefined;
                    if (m.isSame(Date.now(), 'day')) {
                        dateString = m.format('HH:mm:ss');
                    } else {
                        dateString = m.toLocaleString();
                    }
                    if (row.HasRoot) {
                        return _react2['default'].createElement(
                            'span',
                            { style: { display: 'flex', alignItems: 'center' } },
                            _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-play-circle-outline", style: { fontSize: 12, marginRight: 5 } }),
                            ' ',
                            dateString
                        );
                    }
                    return dateString;
                }, style: { width: 130, padding: 12 }, headerStyle: { width: 130, padding: 12 } }, { name: 'Logger', label: MessageHash['ajxp_admin.logs.service'], hideSmall: true, renderCell: function renderCell(row) {
                    return row['Logger'] ? row['Logger'].replace('pydio.', '') : '';
                }, style: { width: 130, padding: '12px 0' }, headerStyle: { width: 130, padding: '12px 0' } }, { name: 'Msg', label: MessageHash['ajxp_admin.logs.message'], renderCell: function renderCell(row) {
                    var msg = row.Msg;
                    if (row.NodePath) {
                        msg += ' [' + row.NodePath + ']';
                    } else if (row.NodeUuid) {
                        msg += ' [' + row.NodeUuid + ']';
                    }
                    return msg;
                } }];

            var _AdminComponents$AdminStyles = AdminComponents.AdminStyles();

            var body = _AdminComponents$AdminStyles.body;
            var tableMaster = body.tableMaster;

            var pagination = undefined;
            if (_onPageNext) {
                pagination = {
                    page: page + 1,
                    pageSize: size,
                    pageSizes: pageSizes,
                    onPageNext: function onPageNext(v) {
                        return _onPageNext(v - 1);
                    },
                    onPagePrev: function onPagePrev(v) {
                        return _onPagePrev(v - 1);
                    },
                    onPageSizeChange: onPageSizeChange,
                    nextDisabled: nextDisabled,
                    prevDisabled: prevDisabled
                };
            }

            return _react2['default'].createElement(MaterialTable, {
                data: logs,
                columns: columns,
                onSelectRows: function (rows) {
                    _this2.setState({ selectedRows: rows });
                    if (_this2.props.onTimestampContext) {
                        _this2.props.onTimestampContext(null);
                    }
                },
                deselectOnClickAway: true,
                showCheckboxes: false,
                emptyStateString: loading ? MessageHash['settings.33'] : query ? MessageHash['ajxp_admin.logs.noresults'] : MessageHash['ajxp_admin.logs.noentries'],
                computeRowStyle: function (row) {
                    var style = {};
                    if (row.HasRoot) {
                        style.backgroundColor = '#F5F5F5';
                    }
                    if (row.Level === 'error') {
                        style.color = '#E53935';
                    }
                    return style;
                },
                masterStyles: tableMaster,
                pagination: pagination
            });
        }
    }]);

    return LogTable;
})(_react2['default'].Component);

exports['default'] = LogTable;
module.exports = exports['default'];
