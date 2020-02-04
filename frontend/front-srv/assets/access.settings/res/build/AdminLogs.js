(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _LogTable = require('./LogTable');

var _LogTable2 = _interopRequireDefault(_LogTable);

var _LogTools = require('./LogTools');

var _LogTools2 = _interopRequireDefault(_LogTools);

var _LogDetail = require('./LogDetail');

var _LogDetail2 = _interopRequireDefault(_LogDetail);

var LogBoard = (function (_React$Component) {
    _inherits(LogBoard, _React$Component);

    function LogBoard(props) {
        _classCallCheck(this, LogBoard);

        _get(Object.getPrototypeOf(LogBoard.prototype), 'constructor', this).call(this, props);
        this.state = {
            page: 0,
            size: 100,
            filter: "",
            contentType: 'JSON',
            loading: false,
            results: 0
        };
    }

    _createClass(LogBoard, [{
        key: 'handleLogToolsChange',
        value: function handleLogToolsChange(newState) {
            this.setState(_extends({}, newState));
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (newProps.filter !== this.state.filter) {
                this.setState({ filter: newProps.filter, page: 0 });
            }
            if (newProps.date !== this.state.date) {
                this.setState({ date: newProps.date, page: 0 });
            }
            if (newProps.endDate !== this.state.endDate) {
                this.setState({ endDate: newProps.endDate, page: 0 });
            }
        }
    }, {
        key: 'handleReload',
        value: function handleReload() {
            this.setState({ z: Math.random() });
        }
    }, {
        key: 'handleDecrPage',
        value: function handleDecrPage() {
            this.setState({ page: Math.max(this.state.page - 1, 0) });
        }
    }, {
        key: 'handleIncrPage',
        value: function handleIncrPage() {
            this.setState({ page: this.state.page + 1 });
        }
    }, {
        key: 'handleLoadingStatusChange',
        value: function handleLoadingStatusChange(status, resultsCount) {
            if (this.props.onLoadingStatusChange) {
                this.props.onLoadingStatusChange(status);
            } else {
                this.setState({ loading: status });
            }
            this.setState({ results: resultsCount });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var noHeader = _props.noHeader;
            var service = _props.service;
            var disableExport = _props.disableExport;
            var currentNode = _props.currentNode;
            var _state = this.state;
            var selectedLog = _state.selectedLog;
            var page = _state.page;
            var size = _state.size;
            var date = _state.date;
            var endDate = _state.endDate;
            var filter = _state.filter;
            var contentType = _state.contentType;
            var z = _state.z;
            var results = _state.results;

            var title = pydio.MessageHash["ajxp_admin.logs.1"];

            var buttons = _react2['default'].createElement(_LogTools2['default'], { pydio: pydio, service: service, onStateChange: this.handleLogToolsChange.bind(this), disableExport: disableExport });

            var navItems = [];
            if (page > 0) {
                navItems.push(_react2['default'].createElement(_materialUi.BottomNavigationItem, {
                    key: "prev",
                    label: 'Previous',
                    icon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-chevron-left' }),
                    onTouchTap: function () {
                        return _this.handleDecrPage();
                    }
                }));
            }
            if (results === size) {
                navItems.push(_react2['default'].createElement(_materialUi.BottomNavigationItem, {
                    key: "next",
                    label: 'Next',
                    icon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-chevron-right' }),
                    onTouchTap: function () {
                        return _this.handleIncrPage();
                    }
                }));
            }

            var _AdminComponents$AdminStyles = AdminComponents.AdminStyles();

            var body = _AdminComponents$AdminStyles.body;

            var blockProps = body.block.props;
            var blockStyle = body.block.container;

            var mainContent = _react2['default'].createElement(
                _materialUi.Paper,
                _extends({}, blockProps, { style: blockStyle }),
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        modal: false,
                        open: !!selectedLog,
                        onRequestClose: function () {
                            _this.setState({ selectedLog: null });
                        },
                        style: { padding: 0 },
                        contentStyle: { maxWidth: 420 },
                        bodyStyle: { padding: 0 },
                        autoScrollBodyContent: true
                    },
                    selectedLog && _react2['default'].createElement(_LogDetail2['default'], { log: selectedLog, pydio: pydio, onRequestClose: function () {
                            _this.setState({ selectedLog: null });
                        } })
                ),
                _react2['default'].createElement(_LogTable2['default'], {
                    pydio: pydio,
                    service: service || 'syslog',
                    page: page,
                    size: size,
                    date: date,
                    endDate: endDate,
                    filter: filter,
                    contentType: contentType,
                    z: z,
                    onLoadingStatusChange: this.handleLoadingStatusChange.bind(this),
                    onSelectLog: function (log) {
                        _this.setState({ selectedLog: log });
                    }
                }),
                navItems.length ? _react2['default'].createElement(
                    _materialUi.BottomNavigation,
                    { selectedIndex: this.state.selectedIndex },
                    navItems
                ) : null
            );

            if (noHeader) {
                return mainContent;
            } else {
                return _react2['default'].createElement(
                    'div',
                    { className: 'main-layout-nav-to-stack workspaces-board' },
                    _react2['default'].createElement(
                        'div',
                        { className: 'vertical-layout', style: { width: '100%' } },
                        _react2['default'].createElement(AdminComponents.Header, {
                            title: title,
                            icon: currentNode.getMetadata().get('icon_class'),
                            actions: buttons,
                            reloadAction: this.handleReload.bind(this),
                            loading: this.state.loading
                        }),
                        _react2['default'].createElement(
                            'div',
                            { className: 'layout-fill' },
                            mainContent,
                            (!service || service === 'syslog') && _react2['default'].createElement(
                                'div',
                                { style: { padding: '0 26px', color: '#9e9e9e', fontWeight: 500 } },
                                _react2['default'].createElement(
                                    'u',
                                    null,
                                    pydio.MessageHash['ajxp_admin.logs.sys.note']
                                ),
                                ' ',
                                pydio.MessageHash['ajxp_admin.logs.sys.note.content']
                            )
                        )
                    )
                );
            }
        }
    }]);

    return LogBoard;
})(_react2['default'].Component);

LogBoard.propTypes = {
    dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired
};

exports['default'] = LogBoard;
module.exports = exports['default'];

},{"./LogDetail":2,"./LogTable":3,"./LogTools":4,"material-ui":"material-ui","pydio/model/data-model":"pydio/model/data-model","react":"react"}],2:[function(require,module,exports){
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

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var UserAvatar = _Pydio$requireLib.UserAvatar;

var GenericLine = (function (_React$Component) {
    _inherits(GenericLine, _React$Component);

    function GenericLine() {
        _classCallCheck(this, GenericLine);

        _get(Object.getPrototypeOf(GenericLine.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(GenericLine, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var iconClassName = _props.iconClassName;
            var legend = _props.legend;
            var data = _props.data;
            var selectable = _props.selectable;

            var style = {
                icon: {
                    margin: '16px 20px 0'
                },
                legend: {
                    fontSize: 12,
                    color: '#aaaaaa',
                    fontWeight: 500,
                    textTransform: 'lowercase'
                },
                data: {
                    fontSize: 15,
                    paddingRight: 6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    userSelect: 'text'
                }
            };
            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', marginBottom: 8, overflow: 'hidden' } },
                _react2['default'].createElement(
                    'div',
                    { style: { width: 64 } },
                    _react2['default'].createElement(_materialUi.FontIcon, { color: '#aaaaaa', className: iconClassName, style: style.icon })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    _react2['default'].createElement(
                        'div',
                        { style: style.legend },
                        legend
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: style.data },
                        data
                    )
                )
            );
        }
    }]);

    return GenericLine;
})(_react2['default'].Component);

var LogDetail = (function (_React$Component2) {
    _inherits(LogDetail, _React$Component2);

    function LogDetail(props) {
        _classCallCheck(this, LogDetail);

        _get(Object.getPrototypeOf(LogDetail.prototype), 'constructor', this).call(this, props);
        this.state = { copySuccess: false };
    }

    _createClass(LogDetail, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.attachClipboard();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.detachClipboard();
        }
    }, {
        key: 'attachClipboard',
        value: function attachClipboard() {
            var _props2 = this.props;
            var log = _props2.log;
            var pydio = _props2.pydio;

            this.detachClipboard();
            if (this.refs['copy-button']) {
                this._clip = new _clipboard2['default'](this.refs['copy-button'], {
                    text: (function (trigger) {
                        var data = [];
                        Object.keys(log).map(function (k) {
                            var val = log[k];
                            if (!val) return;
                            if (k === 'RoleUuids') val = val.join(',');
                            data.push(k + ' : ' + val);
                        });
                        return data.join('\n');
                    }).bind(this)
                });
                this._clip.on('success', (function () {
                    var _this = this;

                    this.setState({ copySuccess: true }, function () {
                        setTimeout(function () {
                            _this.setState({ copySuccess: false });
                        }, 3000);
                    });
                }).bind(this));
                this._clip.on('error', (function () {}).bind(this));
            }
        }
    }, {
        key: 'detachClipboard',
        value: function detachClipboard() {
            if (this._clip) {
                this._clip.destroy();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props;
            var log = _props3.log;
            var pydio = _props3.pydio;
            var onRequestClose = _props3.onRequestClose;
            var copySuccess = this.state.copySuccess;

            var styles = {
                divider: { marginTop: 5, marginBottom: 5 },
                userLegend: {
                    marginTop: -16,
                    paddingBottom: 10,
                    textAlign: 'center',
                    color: '#9E9E9E',
                    fontWeight: 500
                },
                buttons: {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    display: 'flex'
                },
                copyButton: {
                    cursor: 'pointer',
                    display: 'inline-block',
                    fontSize: 18,
                    padding: 14
                }
            };

            var userLegend = undefined;
            if (log.Profile || log.RoleUuids || log.GroupPath) {
                var leg = [];
                if (log.Profile) leg.push('Profile: ' + log.Profile);
                if (log.GroupPath) leg.push('Group: ' + log.GroupPath);
                if (log.RoleUuids) leg.push('Roles: ' + log.RoleUuids.join(','));
                userLegend = leg.join(' - ');
            }

            var msg = log.Msg;
            if (log.Level === 'error') {
                msg = _react2['default'].createElement(
                    'span',
                    { style: { color: '#e53935' } },
                    log.Msg
                );
            }

            return _react2['default'].createElement(
                'div',
                { style: { fontSize: 13, color: 'rgba(0,0,0,.87)', paddingBottom: 10 } },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { backgroundColor: '#f5f5f5', marginBottom: 10, position: 'relative' } },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.buttons },
                        _react2['default'].createElement('span', { ref: "copy-button", style: styles.copyButton, className: copySuccess ? 'mdi mdi-check' : 'mdi mdi-content-copy', title: 'Copy log to clipboard' }),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", onTouchTap: onRequestClose })
                    ),
                    log.UserName && _react2['default'].createElement(UserAvatar, {
                        pydio: pydio,
                        userId: log.UserName,
                        richCard: true,
                        displayLabel: true,
                        displayAvatar: true,
                        noActionsPanel: true
                    }),
                    userLegend && _react2['default'].createElement(
                        'div',
                        { style: styles.userLegend },
                        userLegend
                    )
                ),
                _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-calendar", legend: "Event Date", data: new Date(log.Ts * 1000).toLocaleString() }),
                _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-comment-text", legend: "Event Message", data: msg }),
                _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-server-network", legend: "Service", data: log.Logger }),
                (log.RemoteAddress || log.UserAgent || log.HttpProtocol) && _react2['default'].createElement(_materialUi.Divider, { style: styles.divider }),
                log.RemoteAddress && _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-cast-connected", legend: "Connection IP", data: log.RemoteAddress }),
                log.UserAgent && _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-cellphone-link", legend: "User Agent", data: log.UserAgent }),
                log.HttpProtocol && _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-open-in-app", legend: "Protocol", data: log.HttpProtocol }),
                log.NodePath && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.Divider, { style: styles.divider }),
                    _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-file-tree", legend: "File/Folder", data: log.NodePath }),
                    _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-folder-open", legend: "In Workspace", data: log.WsUuid })
                )
            );
        }
    }]);

    return LogDetail;
})(_react2['default'].Component);

LogDetail.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
    log: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.LogLogMessage)
};

exports['default'] = LogDetail;
module.exports = exports['default'];

},{"clipboard":"clipboard","material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],3:[function(require,module,exports){
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

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib2.moment;

var LogTable = (function (_React$Component) {
    _inherits(LogTable, _React$Component);

    function LogTable(props) {
        _classCallCheck(this, LogTable);

        _get(Object.getPrototypeOf(LogTable.prototype), 'constructor', this).call(this, props);
        this.state = { logs: [], loading: false, rootSpans: {} };
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
            var filter = nextProps.filter;
            var date = nextProps.date;
            var endDate = nextProps.endDate;
            var page = nextProps.page;
            var size = nextProps.size;
            var onLoadingStatusChange = nextProps.onLoadingStatusChange;
            var z = nextProps.z;

            if (filter === this.props.filter && date === this.props.date && endDate === this.props.endDate && size === this.props.size && page === this.props.page && z === this.props.z) {
                return;
            }
            var query = _modelLog2['default'].buildQuery(filter, date, endDate);
            this.load(service, query, page, size, 'JSON', onLoadingStatusChange);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state2 = this.state;
            var loading = _state2.loading;
            var rootSpans = _state2.rootSpans;
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var onSelectLog = _props2.onSelectLog;
            var filter = _props2.filter;
            var date = _props2.date;

            var logs = this.openSpans();
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
                            onTouchTap: toggle,
                            onClick: function (e) {
                                return e.stopPropagation();
                            }
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
                }, style: { width: 100, padding: 12 }, headerStyle: { width: 100, padding: 12 } }, { name: 'Logger', label: MessageHash['ajxp_admin.logs.service'], hideSmall: true, renderCell: function renderCell(row) {
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

            return _react2['default'].createElement(MaterialTable, {
                data: logs,
                columns: columns,
                onSelectRows: function (rows) {
                    if (rows.length && onSelectLog) {
                        onSelectLog(rows[0]);
                    }
                },
                deselectOnClickAway: true,
                showCheckboxes: false,
                emptyStateString: loading ? MessageHash['settings.33'] : filter || date ? MessageHash['ajxp_admin.logs.noresults'] : MessageHash['ajxp_admin.logs.noentries'],
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
                masterStyles: tableMaster
            });
        }
    }]);

    return LogTable;
})(_react2['default'].Component);

LogTable.propTypes = {
    date: _react2['default'].PropTypes.instanceOf(Date).isRequired,
    endDate: _react2['default'].PropTypes.instanceOf(Date),
    filter: _react2['default'].PropTypes.string.isRequired
};

exports['default'] = LogTable;
module.exports = exports['default'];

},{"../model/Log":6,"material-ui":"material-ui","pydio":"pydio","react":"react"}],4:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _modelLog = require('../model/Log');

var _modelLog2 = _interopRequireDefault(_modelLog);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernStyles = _Pydio$requireLib.ModernStyles;

var LogTools = (function (_React$Component) {
    _inherits(LogTools, _React$Component);

    function LogTools(props) {
        _classCallCheck(this, LogTools);

        _get(Object.getPrototypeOf(LogTools.prototype), 'constructor', this).call(this, props);
        this.state = {
            filter: "",
            filterMode: "fulltext"
        };

        this.handleFilterChange = (0, _lodashDebounce2['default'])(this.handleFilterChange.bind(this), 250);
        this.handleDateChange = (0, _lodashDebounce2['default'])(this.handleDateChange.bind(this), 250);
    }

    _createClass(LogTools, [{
        key: 'publishStateChange',
        value: function publishStateChange() {
            this.props.onStateChange(this.state);
        }
    }, {
        key: 'handleFilterChange',
        value: function handleFilterChange(val) {
            this.setState({ filter: val ? val.toLowerCase() : val, page: 0 }, this.publishStateChange.bind(this));
        }
    }, {
        key: 'handleDateChange',
        value: function handleDateChange(date) {
            var _state = this.state;
            var filterMode = _state.filterMode;
            var endDate = _state.endDate;

            if (filterMode === 'period' && !endDate && date !== undefined) {
                var end = new Date();
                //end.setDate(end.getDate() + 1);
                this.setState({ endDate: end });
            }
            this.setState({ date: date, page: 0 }, this.publishStateChange.bind(this));
        }
    }, {
        key: 'handleEndDateChange',
        value: function handleEndDateChange(date) {
            this.setState({ endDate: date, page: 0 }, this.publishStateChange.bind(this));
        }
    }, {
        key: 'handleExport',
        value: function handleExport(format) {
            var _this = this;

            var _state2 = this.state;
            var filter = _state2.filter;
            var date = _state2.date;
            var endDate = _state2.endDate;
            var service = this.props.service;

            var dateString = date ? date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() : '';
            var query = _modelLog2['default'].buildQuery(filter, date, endDate);
            _modelLog2['default'].downloadLogs(service || 'sys', query, format).then(function (blob) {
                var url = window.URL.createObjectURL(blob);
                var filename = 'cells-logs-';
                if (dateString) {
                    filename += dateString;
                } else {
                    filename += 'filtered';
                }
                filename += '.' + format.toLowerCase();
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                    _this.setState({
                        exportUrl: url,
                        exportFilename: filename,
                        exportOnClick: function exportOnClick() {
                            setTimeout(function () {
                                window.URL.revokeObjectURL(url);
                            }, 100);
                            _this.setState({ exportUrl: null, exportFilename: null });
                        }
                    });
                    return;
                }
                var link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                setTimeout(function () {
                    window.URL.revokeObjectURL(url);
                }, 100);
            });
        }
    }, {
        key: 'handleFilterMode',
        value: function handleFilterMode(filterMode) {
            this.setState({ filterMode: filterMode, date: undefined, filter: '' }, this.publishStateChange.bind(this));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var disableExport = _props.disableExport;
            var muiTheme = _props.muiTheme;

            var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

            var _state3 = this.state;
            var filter = _state3.filter;
            var date = _state3.date;
            var filterMode = _state3.filterMode;
            var exportUrl = _state3.exportUrl;
            var exportFilename = _state3.exportFilename;
            var exportOnClick = _state3.exportOnClick;
            var MessageHash = pydio.MessageHash;

            var hasFilter = filter || date;
            var checkIcon = _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-check" });
            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', width: '100%' } },
                filterMode === 'fulltext' && _react2['default'].createElement(ModernTextField, { hintText: MessageHash["ajxp_admin.logs.3"], onChange: function (e) {
                        return _this2.handleFilterChange(e.target.value);
                    }, style: { margin: '0 5px', width: 180 } }),
                filterMode === 'oneday' && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.DatePicker, _extends({ hintText: MessageHash["ajxp_admin.logs.2"], onChange: function (e, date) {
                            return _this2.handleDateChange(date);
                        },
                        autoOk: true, maxDate: new Date(), value: this.state.date,
                        showYearSelector: true, style: { width: 120 }, textFieldStyle: { width: 120 } }, ModernStyles.textField)),
                    _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-close", tooltip: "Clear", onTouchTap: function () {
                            _this2.handleDateChange(undefined);
                        } }, adminStyles.props.header.iconButton))
                ),
                filterMode === 'period' && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.DatePicker, _extends({ hintText: 'From', onChange: function (e, date) {
                            return _this2.handleDateChange(date);
                        },
                        autoOk: true, maxDate: new Date(), value: this.state.date,
                        showYearSelector: true, style: { width: 100 }, textFieldStyle: { width: 96 } }, ModernStyles.textField)),
                    _react2['default'].createElement(_materialUi.DatePicker, _extends({ hintText: 'To', onChange: function (e, date) {
                            return _this2.handleEndDateChange(date);
                        },
                        autoOk: true, minDate: this.state.date, maxDate: new Date(), value: this.state.endDate,
                        showYearSelector: true, style: { width: 100 }, textFieldStyle: { width: 96 } }, ModernStyles.textField)),
                    _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-close", tooltip: "Clear", onTouchTap: function () {
                            _this2.handleDateChange(undefined);_this2.handleEndDateChange(undefined);
                        } }, adminStyles.props.header.iconButton))
                ),
                _react2['default'].createElement(
                    _materialUi.IconMenu,
                    {
                        iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-filter-variant", tooltip: MessageHash['ajxp_admin.logs.3'] }, adminStyles.props.header.iconButton)),
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        targetOrigin: { vertical: 'top', horizontal: 'right' },
                        desktop: true
                    },
                    _react2['default'].createElement(
                        _materialUi.Subheader,
                        null,
                        MessageHash['ajxp_admin.logs.filter.legend']
                    ),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: MessageHash['ajxp_admin.logs.filter.fulltext'], rightIcon: filterMode === 'fulltext' ? checkIcon : null, onTouchTap: function () {
                            _this2.handleFilterMode('fulltext');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: MessageHash['ajxp_admin.logs.2'], rightIcon: filterMode === 'oneday' ? checkIcon : null, onTouchTap: function () {
                            _this2.handleFilterMode('oneday');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: MessageHash['ajxp_admin.logs.filter.period'], rightIcon: filterMode === 'period' ? checkIcon : null, onTouchTap: function () {
                            _this2.handleFilterMode('period');
                        } })
                ),
                !disableExport && _react2['default'].createElement(
                    _materialUi.IconMenu,
                    {
                        iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-download", tooltip: MessageHash["ajxp_admin.logs.11"] }, adminStyles.props.header.iconButton)),
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        targetOrigin: { vertical: 'top', horizontal: 'right' },
                        desktop: true
                    },
                    !hasFilter && _react2['default'].createElement(
                        _materialUi.Subheader,
                        null,
                        MessageHash['ajxp_admin.logs.export.disabled']
                    ),
                    hasFilter && _react2['default'].createElement(
                        _materialUi.Subheader,
                        null,
                        MessageHash['ajxp_admin.logs.11']
                    ),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'CSV', rightIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-file-delimited" }), onTouchTap: function () {
                            _this2.handleExport('CSV');
                        }, disabled: !hasFilter }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'XLSX', rightIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-file-excel" }), onTouchTap: function () {
                            _this2.handleExport('XLSX');
                        }, disabled: !hasFilter }),
                    exportUrl && _react2['default'].createElement(
                        _materialUi.Subheader,
                        null,
                        _react2['default'].createElement(
                            'a',
                            { href: exportUrl, download: exportFilename },
                            exportFilename
                        )
                    )
                ),
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        open: !!exportUrl,
                        modal: true,
                        title: MessageHash['ajxp_admin.logs.11'],
                        actions: [_react2['default'].createElement(_materialUi.FlatButton, { label: "Cancel", onTouchTap: exportOnClick })]
                    },
                    _react2['default'].createElement(
                        'span',
                        { style: { fontSize: 13 } },
                        MessageHash['ajxp_admin.logs.export.clicklink'],
                        ': ',
                        _react2['default'].createElement(
                            'a',
                            { style: { textDecoration: 'underline' }, href: exportUrl, download: exportFilename, onClick: exportOnClick },
                            exportFilename
                        )
                    )
                )
            );
        }
    }]);

    return LogTools;
})(_react2['default'].Component);

exports['default'] = LogTools = (0, _materialUiStyles.muiThemeable)()(LogTools);
exports['default'] = LogTools;
module.exports = exports['default'];

},{"../model/Log":6,"lodash.debounce":"lodash.debounce","material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","react":"react"}],5:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardLogBoard = require('./board/LogBoard');

var _boardLogBoard2 = _interopRequireDefault(_boardLogBoard);

var _boardLogTools = require('./board/LogTools');

var _boardLogTools2 = _interopRequireDefault(_boardLogTools);

window.AdminLogs = {
  Dashboard: _boardLogBoard2['default'],
  LogTools: _boardLogTools2['default']
};

},{"./board/LogBoard":1,"./board/LogTools":4}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require("pydio/lang/observable");

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Log = (function (_Observable) {
    _inherits(Log, _Observable);

    function Log() {
        _classCallCheck(this, Log);

        _get(Object.getPrototypeOf(Log.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(Log, null, [{
        key: "buildQuery",

        /**
         * Build Bleve Query based on filter and date
         * @param filter {string}
         * @param date {Date}
         * @param endDate {Date}
         * @return {string}
         */
        value: function buildQuery(filter, date) {
            var endDate = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

            var arr = [];

            if (filter) {
                arr.push('Msg:*' + filter + '*');
                arr.push('RemoteAddress:*' + filter + '*');
                arr.push('Level:*' + filter + '*');
                arr.push('UserName:*' + filter + '*');
                arr.push('Logger:*' + filter + '*');
            }

            if (date) {
                var from = date;
                var to = new Date(from);
                if (endDate) {
                    to = endDate;
                } else {
                    to.setDate(from.getDate() + 1);
                }
                arr.push('+Ts:>' + Math.floor(from / 1000));
                arr.push('+Ts:<' + Math.floor(to / 1000));
            }

            return arr.join(' ');
        }

        /**
         *
         * @param serviceName string syslog or audit
         * @param query string
         * @param page int
         * @param size int
         * @param contentType string JSON, CSV
         * @return {Promise}
         */
    }, {
        key: "loadLogs",
        value: function loadLogs(serviceName, query, page, size, contentType) {
            var request = new _pydioHttpRestApi.LogListLogRequest();
            request.Query = query;
            request.Page = page;
            request.Size = size;
            request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject(contentType);
            if (serviceName === 'syslog') {
                var api = new _pydioHttpRestApi.LogServiceApi(_pydioHttpApi2["default"].getRestClient());
                return api.syslog(request);
            } else if (serviceName === 'audit') {
                return _pydioHttpResourcesManager2["default"].loadClass('EnterpriseSDK').then(function (sdk) {
                    var api = new sdk.EnterpriseLogServiceApi(_pydioHttpApi2["default"].getRestClient());
                    return api.audit(request);
                });
            } else {
                return Promise.reject("Unknown service name, must be 'syslog' or 'audit'");
            }
        }

        /**
         *
         * @param serviceName
         * @param query
         * @param format
         * @return {Promise<Blob>}
         */
    }, {
        key: "downloadLogs",
        value: function downloadLogs(serviceName, query, format) {
            var request = new _pydioHttpRestApi.LogListLogRequest();
            request.Query = query;
            request.Page = 0;
            request.Size = 100000;
            request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject(format);
            return Log.auditExportWithHttpInfo(request, serviceName).then(function (response_and_data) {
                return response_and_data.response.body;
            });
        }

        /**
         * Auditable Logs, in Json or CSV format
         * @param {module:model/LogListLogRequest} body
         * @param serviceName {String} audit or syslog
         * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/RestLogMessageCollection} and HTTP response
         */
    }, {
        key: "auditExportWithHttpInfo",
        value: function auditExportWithHttpInfo(body, serviceName) {
            var postBody = body;

            // verify the required parameter 'body' is set
            if (body === undefined || body === null) {
                throw new Error("Missing the required parameter 'body' when calling auditExport");
            }

            var pathParams = {};
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var authNames = [];
            var contentTypes = ['application/json'];
            var accepts = ['application/json'];
            var returnType = 'Blob';

            return _pydioHttpApi2["default"].getRestClient().callApi('/log/' + serviceName + '/export', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
        }
    }]);

    return Log;
})(_pydioLangObservable2["default"]);

exports["default"] = Log;
module.exports = exports["default"];

},{"pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable"}]},{},[5]);
