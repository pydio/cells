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

            var mainContent = _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { margin: 16 } },
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
                                    'Note'
                                ),
                                ': empty logs entries may mean that the server is not running in production mode. Make sure to set this log level by passing the environment variable PYDIO_LOGS_LEVEL=production at startup.'
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
