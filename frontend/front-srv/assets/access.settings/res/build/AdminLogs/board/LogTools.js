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

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _modelLog = require('../model/Log');

var _modelLog2 = _interopRequireDefault(_modelLog);

var _materialUi = require('material-ui');

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
            var _state2 = this.state;
            var filter = _state2.filter;
            var date = _state2.date;
            var endDate = _state2.endDate;
            var service = this.props.service;

            var dateString = date ? date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() : '';
            var query = _modelLog2['default'].buildQuery(filter, date, endDate);
            _modelLog2['default'].downloadLogs(service || 'syslog', query, format).then(function (blob) {
                var url = window.URL.createObjectURL(blob);
                var link = document.createElement('a');
                var filename = 'cells-logs-';
                if (dateString) {
                    filename += dateString;
                } else {
                    filename += 'filtered';
                }
                filename += '.' + format.toLowerCase();

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
            var _this = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var disableExport = _props.disableExport;
            var _state3 = this.state;
            var filter = _state3.filter;
            var date = _state3.date;
            var filterMode = _state3.filterMode;

            var hasFilter = filter || date;
            var checkIcon = _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-check" });
            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', width: '100%' } },
                filterMode === 'fulltext' && _react2['default'].createElement(_materialUi.TextField, { hintText: pydio.MessageHash["ajxp_admin.logs.3"], onChange: function (e) {
                        return _this.handleFilterChange(e.target.value);
                    }, style: { margin: '0 5px', width: 180 } }),
                filterMode === 'oneday' && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.DatePicker, { hintText: pydio.MessageHash["ajxp_admin.logs.2"], onChange: function (e, date) {
                            return _this.handleDateChange(date);
                        },
                        autoOk: true, maxDate: new Date(), value: this.state.date,
                        showYearSelector: true, style: { margin: '0 5px', width: 100 }, textFieldStyle: { width: 80 } }),
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", tooltip: "Clear", onTouchTap: function () {
                            _this.handleDateChange(undefined);
                        } })
                ),
                filterMode === 'period' && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.DatePicker, { hintText: 'From', onChange: function (e, date) {
                            return _this.handleDateChange(date);
                        },
                        autoOk: true, maxDate: new Date(), value: this.state.date,
                        showYearSelector: true, style: { margin: '0 5px', width: 100 }, textFieldStyle: { width: 80 } }),
                    _react2['default'].createElement(_materialUi.DatePicker, { hintText: 'To', onChange: function (e, date) {
                            return _this.handleEndDateChange(date);
                        },
                        autoOk: true, minDate: this.state.date, maxDate: new Date(), value: this.state.endDate,
                        showYearSelector: true, style: { margin: '0 5px', width: 100 }, textFieldStyle: { width: 80 } }),
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", tooltip: "Clear", onTouchTap: function () {
                            _this.handleDateChange(undefined);_this.handleEndDateChange(undefined);
                        } })
                ),
                _react2['default'].createElement(
                    _materialUi.IconMenu,
                    {
                        iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-filter-variant", tooltip: "Filter Logs" }),
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        targetOrigin: { vertical: 'top', horizontal: 'right' },
                        desktop: true
                    },
                    _react2['default'].createElement(
                        _materialUi.Subheader,
                        null,
                        'Filter by...'
                    ),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'Full-text search', rightIcon: filterMode === 'fulltext' ? checkIcon : null, onTouchTap: function () {
                            _this.handleFilterMode('fulltext');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'Pick one day', rightIcon: filterMode === 'oneday' ? checkIcon : null, onTouchTap: function () {
                            _this.handleFilterMode('oneday');
                        } }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'Time Period', rightIcon: filterMode === 'period' ? checkIcon : null, onTouchTap: function () {
                            _this.handleFilterMode('period');
                        } })
                ),
                !disableExport && _react2['default'].createElement(
                    _materialUi.IconMenu,
                    {
                        iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-download", tooltip: pydio.MessageHash["ajxp_admin.logs.11"] }),
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        targetOrigin: { vertical: 'top', horizontal: 'right' },
                        desktop: true
                    },
                    !hasFilter && _react2['default'].createElement(
                        _materialUi.Subheader,
                        null,
                        'Pick a date or filter results'
                    ),
                    hasFilter && _react2['default'].createElement(
                        _materialUi.Subheader,
                        null,
                        'Export as...'
                    ),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'CSV', rightIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-file-delimited" }), onTouchTap: function () {
                            _this.handleExport('CSV');
                        }, disabled: !hasFilter }),
                    _react2['default'].createElement(_materialUi.MenuItem, { primaryText: 'XLSX', rightIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { top: 0 }, className: "mdi mdi-file-excel" }), onTouchTap: function () {
                            _this.handleExport('XLSX');
                        }, disabled: !hasFilter })
                )
            );
        }
    }]);

    return LogTools;
})(_react2['default'].Component);

exports['default'] = LogTools;
module.exports = exports['default'];
