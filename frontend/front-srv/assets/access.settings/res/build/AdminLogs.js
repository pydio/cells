(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _LogTable = require('./LogTable');

var _LogTable2 = _interopRequireDefault(_LogTable);

var _LogTools = require('./LogTools');

var _LogTools2 = _interopRequireDefault(_LogTools);

var _modelLog = require('../model/Log');

var _modelLog2 = _interopRequireDefault(_modelLog);

var LogBoard = (function (_React$Component) {
    _inherits(LogBoard, _React$Component);

    function LogBoard(props) {
        _classCallCheck(this, LogBoard);

        _get(Object.getPrototypeOf(LogBoard.prototype), 'constructor', this).call(this, props);
        this.state = {
            page: 0,
            size: 100,
            query: "",
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
            if (newProps.query !== undefined && newProps.query !== this.state.query) {
                this.setState({ query: newProps.query, page: 0 });
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
        key: 'handleTimestampContext',
        value: function handleTimestampContext(ts) {
            if (ts) {
                var q = _modelLog2['default'].buildTsQuery(ts, 5);
                this.setState({ tmpQuery: q, focus: ts });
            } else {
                this.setState({ tmpQuery: null, focus: null });
            }
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
            var page = _state.page;
            var size = _state.size;
            var query = _state.query;
            var tmpQuery = _state.tmpQuery;
            var focus = _state.focus;
            var contentType = _state.contentType;
            var z = _state.z;
            var results = _state.results;

            var title = pydio.MessageHash["ajxp_admin.logs.1"];
            var buttons = _react2['default'].createElement(_LogTools2['default'], {
                pydio: pydio,
                service: service,
                focus: focus,
                onStateChange: this.handleLogToolsChange.bind(this),
                disableExport: disableExport
            });

            var _AdminComponents$AdminStyles = AdminComponents.AdminStyles();

            var body = _AdminComponents$AdminStyles.body;

            var blockProps = body.block.props;
            var blockStyle = body.block.container;

            var prevDisabled = page === 0;
            var nextDisabled = results < size;
            var pageSizes = [50, 100, 500, 1000];
            var paginationProps = undefined;
            if (!(prevDisabled && results < pageSizes[0]) && !focus) {
                paginationProps = {
                    pageSizes: pageSizes, prevDisabled: prevDisabled, nextDisabled: nextDisabled,
                    onPageNext: this.handleIncrPage.bind(this),
                    onPagePrev: this.handleDecrPage.bind(this),
                    onPageSizeChange: function onPageSizeChange(v) {
                        _this.setState({ size: v, page: 0 });
                    }
                };
            }

            var mainContent = _react2['default'].createElement(
                _materialUi.Paper,
                _extends({}, blockProps, { style: blockStyle }),
                _react2['default'].createElement(_LogTable2['default'], _extends({
                    pydio: pydio,
                    service: service || 'syslog',
                    page: page,
                    size: size,
                    query: tmpQuery ? tmpQuery : query,
                    focus: focus,
                    contentType: contentType,
                    z: z,
                    onLoadingStatusChange: this.handleLoadingStatusChange.bind(this),
                    onTimestampContext: this.handleTimestampContext.bind(this)
                }, paginationProps))
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
    dataModel: _propTypes2['default'].instanceOf(_pydioModelDataModel2['default']).isRequired
};

exports['default'] = LogBoard;
module.exports = exports['default'];

},{"../model/Log":6,"./LogTable":3,"./LogTools":4,"material-ui":"material-ui","prop-types":"prop-types","pydio/model/data-model":"pydio/model/data-model","react":"react"}],2:[function(require,module,exports){
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

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _cellsSdk = require('cells-sdk');

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
                this._clip = new _clipboard2['default'](_reactDom2['default'].findDOMNode(this.refs['copy-button']), {
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
        key: 'focusPeriod',
        value: function focusPeriod() {
            var _props3 = this.props;
            var onSelectPeriod = _props3.onSelectPeriod;
            var log = _props3.log;

            var ts = log.Ts;
            onSelectPeriod(ts);
        }
    }, {
        key: 'unfocusPeriod',
        value: function unfocusPeriod() {
            var _props4 = this.props;
            var onSelectPeriod = _props4.onSelectPeriod;
            var focus = _props4.focus;

            if (focus) {
                onSelectPeriod(null);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props5 = this.props;
            var log = _props5.log;
            var pydio = _props5.pydio;
            var onRequestClose = _props5.onRequestClose;
            var onSelectPeriod = _props5.onSelectPeriod;
            var style = _props5.style;
            var focus = _props5.focus;
            var _props5$userDisplay = _props5.userDisplay;
            var userDisplay = _props5$userDisplay === undefined ? 'avatar' : _props5$userDisplay;
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
                    top: 6,
                    right: 6,
                    display: 'flex'
                },
                button: {
                    height: 36,
                    width: 36,
                    padding: 8
                },
                buttonIcon: {
                    fontSize: 20
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
                { style: _extends({ fontSize: 13, color: 'rgba(0,0,0,.87)', paddingBottom: 10 }, style) },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { backgroundColor: '#f5f5f5', marginBottom: 10, position: 'relative' } },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.buttons },
                        _react2['default'].createElement(_materialUi.IconButton, { style: styles.button, iconStyle: styles.buttonIcon, iconClassName: copySuccess ? 'mdi mdi-check' : 'mdi mdi-content-copy', tooltip: 'Copy log to clipboard', tooltipPosition: "bottom-left", ref: "copy-button" }),
                        onSelectPeriod && _react2['default'].createElement(_materialUi.IconButton, { style: styles.button, iconStyle: _extends({}, styles.buttonIcon, { color: focus ? '#ff5722' : null }), iconClassName: "mdi mdi-clock", onTouchTap: focus ? this.unfocusPeriod.bind(this) : this.focusPeriod.bind(this), tooltip: "Show +/- 5 minutes", tooltipPosition: "bottom-left" }),
                        _react2['default'].createElement(_materialUi.IconButton, { style: styles.button, iconStyle: styles.buttonIcon, iconClassName: "mdi mdi-close", onTouchTap: function () {
                                _this2.unfocusPeriod();onRequestClose();
                            }, tooltip: "Close log detail", tooltipPosition: "bottom-left" })
                    ),
                    userDisplay === 'avatar' && log.UserName && _react2['default'].createElement(UserAvatar, {
                        pydio: pydio,
                        userId: log.UserName,
                        richCard: true,
                        displayLabel: true,
                        displayAvatar: true,
                        noActionsPanel: true
                    }),
                    userDisplay === "avatar" && userLegend && _react2['default'].createElement(
                        'div',
                        { style: styles.userLegend },
                        userLegend
                    )
                ),
                log.UserName && userDisplay === 'inline' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-account", legend: "User", data: log.UserName }),
                    userLegend && _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-account-multiple", legend: "User Attributes", data: userLegend }),
                    _react2['default'].createElement(_materialUi.Divider, { style: styles.divider })
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
    pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
    log: _propTypes2['default'].instanceOf(_cellsSdk.LogLogMessage)
};

exports['default'] = LogDetail;
module.exports = exports['default'];

},{"cells-sdk":"cells-sdk","clipboard":"clipboard","material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","react":"react","react-dom":"react-dom"}],3:[function(require,module,exports){
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

},{"../model/Log":6,"./LogDetail":2,"material-ui":"material-ui","pydio":"pydio","react":"react"}],4:[function(require,module,exports){
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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
var ModernSelectField = _Pydio$requireLib.ModernSelectField;
var ModernStyles = _Pydio$requireLib.ModernStyles;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib2.moment;

var LogTools = (function (_React$Component) {
    _inherits(LogTools, _React$Component);

    function LogTools(props) {
        _classCallCheck(this, LogTools);

        _get(Object.getPrototypeOf(LogTools.prototype), 'constructor', this).call(this, props);
        this.state = {
            filter: "",
            filterMode: "fulltext",
            levelShow: false,
            serviceFilterShow: false
        };
        this.publishStateChange = (0, _lodashDebounce2['default'])(this.publishStateChange.bind(this), 250);
    }

    _createClass(LogTools, [{
        key: 'publishStateChange',
        value: function publishStateChange() {
            var _state = this.state;
            var filter = _state.filter;
            var serviceFilter = _state.serviceFilter;
            var level = _state.level;
            var remoteAddress = _state.remoteAddress;
            var userName = _state.userName;
            var date = _state.date;
            var endDate = _state.endDate;

            var query = _modelLog2['default'].buildQuery(filter, serviceFilter, level, remoteAddress, userName, date, endDate);
            this.props.onStateChange({ query: query });
        }
    }, {
        key: 'handleToggleShow',
        value: function handleToggleShow(field) {
            var fieldName = field + 'Show';
            var crt = this.state[fieldName];
            var s = _defineProperty({}, fieldName, !crt);
            if (crt) {
                if (field === 'date' || field === 'endDate') {
                    s['date'] = null;
                    s['endDate'] = null;
                    s['dateShow'] = false;
                    s['endDateShow'] = false;
                } else {
                    s[field] = null;
                }
                s['page'] = 0;
            } else if (field === 'date' && this.state.endDateShow) {
                s['endDate'] = null;
                s['endDateShow'] = false;
            }
            this.setState(s, this.publishStateChange.bind(this));
        }
    }, {
        key: 'handleFilterChange',
        value: function handleFilterChange(val, keyName) {
            var _setState;

            this.setState((_setState = {}, _defineProperty(_setState, keyName, val), _defineProperty(_setState, 'page', 0), _setState), this.publishStateChange.bind(this));
        }
    }, {
        key: 'handleDateChange',
        value: function handleDateChange(date) {
            var time = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            if (time) {
                date.setHours(time.getHours(), time.getMinutes());
            }
            var _state2 = this.state;
            var endDate = _state2.endDate;
            var endDateShow = _state2.endDateShow;

            if (endDateShow && !endDate && date !== undefined) {
                var end = new Date();
                end.setHours(23, 59, 59);
                this.setState({ endDate: end });
            }
            this.setState({ date: date, page: 0 }, this.publishStateChange.bind(this));
        }
    }, {
        key: 'handleEndDateChange',
        value: function handleEndDateChange(date) {
            var time = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            if (time) {
                date.setHours(time.getHours(), time.getMinutes());
            }
            this.setState({ endDate: date, page: 0 }, this.publishStateChange.bind(this));
        }
    }, {
        key: 'handleExport',
        value: function handleExport(format) {
            var _this = this;

            var _state3 = this.state;
            var filter = _state3.filter;
            var serviceFilter = _state3.serviceFilter;
            var level = _state3.level;
            var remoteAddress = _state3.remoteAddress;
            var userName = _state3.userName;
            var date = _state3.date;
            var endDate = _state3.endDate;
            var service = this.props.service;

            var dateString = date ? date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() : '';
            var query = _modelLog2['default'].buildQuery(filter, serviceFilter, level, remoteAddress, userName, date, endDate);
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
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var disableExport = _props.disableExport;
            var muiTheme = _props.muiTheme;
            var focus = _props.focus;

            var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);
            var focusBadge = {
                backgroundColor: '#FBE9E7',
                height: 35,
                lineHeight: '35px',
                fontSize: 15,
                padding: '0 10px',
                marginRight: 5,
                color: '#FF5722',
                borderRadius: 3
            };

            var _state4 = this.state;
            var filter = _state4.filter;
            var date = _state4.date;
            var dateShow = _state4.dateShow;
            var endDate = _state4.endDate;
            var endDateShow = _state4.endDateShow;
            var serviceFilter = _state4.serviceFilter;
            var serviceFilterShow = _state4.serviceFilterShow;
            var level = _state4.level;
            var levelShow = _state4.levelShow;
            var userName = _state4.userName;
            var userNameShow = _state4.userNameShow;
            var remoteAddress = _state4.remoteAddress;
            var remoteAddressShow = _state4.remoteAddressShow;
            var exportUrl = _state4.exportUrl;
            var exportFilename = _state4.exportFilename;
            var exportOnClick = _state4.exportOnClick;
            var MessageHash = pydio.MessageHash;

            var hasFilter = filter || serviceFilter || date || endDate || level || userName || remoteAddress;
            var checkIcon = _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-check" });
            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', width: '100%', marginTop: 3 } },
                focus && _react2['default'].createElement(
                    'div',
                    { style: focusBadge },
                    'Focus on +/- 5 minutes at ',
                    moment(new Date(focus * 1000)).format('hh:mm:ss')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { marginRight: 5, width: 170 } },
                    _react2['default'].createElement(ModernTextField, { hintText: MessageHash["ajxp_admin.logs.3"], onChange: function (e, v) {
                            return _this2.handleFilterChange(v, 'filter');
                        }, fullWidth: true })
                ),
                levelShow && _react2['default'].createElement(
                    'div',
                    { style: { marginRight: 5, marginTop: -2, width: 100 } },
                    _react2['default'].createElement(
                        ModernSelectField,
                        { hintText: "Level", fullWidth: true, value: level,
                            onChange: function (e, i, v) {
                                return _this2.handleFilterChange(v, 'level');
                            } },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "ERROR", value: "ERROR" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "INFO", value: "INFO" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "DEBUG", value: "DEBUG" })
                    )
                ),
                serviceFilterShow && _react2['default'].createElement(
                    'div',
                    { style: { marginRight: 5, width: 80 } },
                    _react2['default'].createElement(ModernTextField, { hintText: "Service", fullWidth: true, value: serviceFilter, onChange: function (e, v) {
                            return _this2.handleFilterChange(v, 'serviceFilter');
                        } })
                ),
                remoteAddressShow && _react2['default'].createElement(
                    'div',
                    { style: { marginRight: 5, width: 80 } },
                    _react2['default'].createElement(ModernTextField, { hintText: "IP", fullWidth: true, onChange: function (e, v) {
                            return _this2.handleFilterChange(v, 'remoteAddress');
                        } })
                ),
                userNameShow && _react2['default'].createElement(
                    'div',
                    { style: { marginRight: 5, width: 80 } },
                    _react2['default'].createElement(ModernTextField, { hintText: "Login", fullWidth: true, onChange: function (e, v) {
                            return _this2.handleFilterChange(v, 'userName');
                        } })
                ),
                dateShow && !endDateShow && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.DatePicker, _extends({ hintText: MessageHash["ajxp_admin.logs.2"], onChange: function (e, date) {
                            return _this2.handleDateChange(date);
                        },
                        autoOk: true, maxDate: new Date(), value: date,
                        showYearSelector: true, style: { width: 120 }, textFieldStyle: { width: 120 } }, ModernStyles.textField)),
                    _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-close", tooltip: "Clear", onTouchTap: function () {
                            _this2.handleDateChange(undefined);
                        } }, adminStyles.props.header.iconButton))
                ),
                endDateShow && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.DatePicker, _extends({ hintText: 'From', onChange: function (e, date) {
                            return _this2.handleDateChange(date);
                        },
                        autoOk: true, maxDate: new Date(), value: date,
                        showYearSelector: true, style: { width: 100 }, textFieldStyle: { width: 96 } }, ModernStyles.textField)),
                    _react2['default'].createElement(_materialUi.TimePicker, _extends({ hintText: 'at...', disabled: !date, onChange: function (e, time) {
                            return _this2.handleDateChange(date, time);
                        },
                        autoOk: true, value: date,
                        style: { width: 100 }, textFieldStyle: { width: 96 } }, ModernStyles.textField)),
                    _react2['default'].createElement(_materialUi.DatePicker, _extends({ hintText: 'To', onChange: function (e, date) {
                            return _this2.handleEndDateChange(date);
                        },
                        autoOk: true, minDate: this.state.date, maxDate: new Date(), value: endDate,
                        showYearSelector: true, style: { width: 100 }, textFieldStyle: { width: 96 } }, ModernStyles.textField)),
                    _react2['default'].createElement(_materialUi.TimePicker, _extends({ hintText: 'at...', disabled: !endDate, onChange: function (e, time) {
                            return _this2.handleEndDateChange(endDate, time);
                        },
                        autoOk: true, value: endDate,
                        style: { width: 100 }, textFieldStyle: { width: 96 } }, ModernStyles.textField)),
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
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: MessageHash['ajxp_admin.logs.2'], rightIcon: dateShow && !endDateShow ? checkIcon : null, onTouchTap: function () {
                            _this2.handleToggleShow('date');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: MessageHash['ajxp_admin.logs.filter.period'], rightIcon: endDateShow ? checkIcon : null, onTouchTap: function () {
                            _this2.handleToggleShow('endDate');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Level", rightIcon: levelShow ? checkIcon : null, onTouchTap: function () {
                            _this2.handleToggleShow('level');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Service", rightIcon: serviceFilterShow ? checkIcon : null, onTouchTap: function () {
                            _this2.handleToggleShow('serviceFilter');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "User Login", rightIcon: userNameShow ? checkIcon : null, onTouchTap: function () {
                            _this2.handleToggleShow('userName');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "IP", rightIcon: remoteAddressShow ? checkIcon : null, onTouchTap: function () {
                            _this2.handleToggleShow('remoteAddress');
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

var _cellsSdk = require('cells-sdk');

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
         * @param serviceFilter {string}
         * @param level {string}
         * @param remoteAddress {string}
         * @param userName {string}
         * @param date {Date}
         * @param endDate {Date}
         * @return {string}
         */
        value: function buildQuery(filter, serviceFilter, level, remoteAddress, userName, date) {
            var endDate = arguments.length <= 6 || arguments[6] === undefined ? undefined : arguments[6];

            var arr = [];

            if (filter) {
                arr.push('+Msg:"*' + filter + '*"');
            }
            if (serviceFilter) {
                arr.push('+Logger:*' + serviceFilter + '*');
            }
            if (level) {
                arr.push('+Level:' + level);
            }
            if (remoteAddress) {
                arr.push('+RemoteAddress:*' + remoteAddress + '*');
            }
            if (userName) {
                arr.push('+UserName:*' + userName + '*');
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
    }, {
        key: "buildTsQuery",
        value: function buildTsQuery(timestamp, minutesWindow) {
            var arr = [];
            arr.push('+Ts:>' + (timestamp - minutesWindow * 60));
            arr.push('+Ts:<' + (timestamp + minutesWindow * 60));
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
            var request = new _cellsSdk.LogListLogRequest();
            request.Query = query;
            request.Page = page;
            request.Size = size;
            request.Format = _cellsSdk.ListLogRequestLogFormat.constructFromObject(contentType);
            if (serviceName === 'syslog') {
                var api = new _cellsSdk.LogServiceApi(_pydioHttpApi2["default"].getRestClient());
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
            var request = new _cellsSdk.LogListLogRequest();
            request.Query = query;
            request.Page = 0;
            request.Size = 100000;
            request.Format = _cellsSdk.ListLogRequestLogFormat.constructFromObject(format);
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

},{"cells-sdk":"cells-sdk","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/lang/observable":"pydio/lang/observable"}]},{},[5]);
