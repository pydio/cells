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
                    _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-close", tooltip: "Clear", onClick: function () {
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
                    _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-close", tooltip: "Clear", onClick: function () {
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
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: MessageHash['ajxp_admin.logs.2'], rightIcon: dateShow && !endDateShow ? checkIcon : null, onClick: function () {
                            _this2.handleToggleShow('date');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: MessageHash['ajxp_admin.logs.filter.period'], rightIcon: endDateShow ? checkIcon : null, onClick: function () {
                            _this2.handleToggleShow('endDate');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Level", rightIcon: levelShow ? checkIcon : null, onClick: function () {
                            _this2.handleToggleShow('level');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Service", rightIcon: serviceFilterShow ? checkIcon : null, onClick: function () {
                            _this2.handleToggleShow('serviceFilter');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "User Login", rightIcon: userNameShow ? checkIcon : null, onClick: function () {
                            _this2.handleToggleShow('userName');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "IP", rightIcon: remoteAddressShow ? checkIcon : null, onClick: function () {
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
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'CSV', rightIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-file-delimited" }), onClick: function () {
                            _this2.handleExport('CSV');
                        }, disabled: !hasFilter }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'XLSX', rightIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-file-excel" }), onClick: function () {
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
                        actions: [_react2['default'].createElement(_materialUi.FlatButton, { label: "Cancel", onClick: exportOnClick })]
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
