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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _ScheduleForm = require("./ScheduleForm");

var _ScheduleForm2 = _interopRequireDefault(_ScheduleForm);

var _Events = require("./Events");

var _Events2 = _interopRequireDefault(_Events);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib2.MaterialTable;

var JobsList = (function (_React$Component) {
    _inherits(JobsList, _React$Component);

    function JobsList() {
        _classCallCheck(this, JobsList);

        _get(Object.getPrototypeOf(JobsList.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(JobsList, [{
        key: 'extractRowsInfo',
        value: function extractRowsInfo(jobs, m) {

            var tagStyle = {
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
                padding: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            };
            var system = [];
            var other = [];
            if (jobs === undefined) {
                return { system: system, other: other };
            }
            jobs.map(function (job) {

                var data = _extends({}, job, { SortEndTime: 0, SortStatus: 'UNKOWN' });
                if (job.Tasks !== undefined) {
                    // Sort task by StartTime
                    job.Tasks.sort(function (a, b) {
                        if (!a.StartTime || !b.StartTime || a.StartTime === b.StartTime) {
                            return a.ID > b.ID ? 1 : -1;
                        }
                        return a.StartTime > b.StartTime ? -1 : 1;
                    });
                    var t = job.Tasks[0];
                    data.TaskStartTime = moment(new Date(parseInt(t.StartTime) * 1000)).fromNow();
                    if (t.EndTime) {
                        data.TaskEndTime = moment(new Date(parseInt(t.EndTime) * 1000)).fromNow();
                    } else {
                        data.TaskEndTime = '-';
                    }
                    data.SortEndTime = t.EndTime || 0;
                    data.SortStatus = t.Status;
                    if (t.Status === 'Finished') {
                        data.TaskStatus = t.Status;
                    } else if (t.Status === 'Running') {
                        // There might be many tasks running
                        var count = job.Tasks.filter(function (ft) {
                            return ft.Status === 'Running';
                        }).length;
                        data.TaskStatus = _react2['default'].createElement(
                            'span',
                            { style: { fontWeight: 500, color: '#388e3c' } },
                            count,
                            ' tasks running'
                        );
                    } else if (t.Status === 'Error') {
                        data.TaskStatus = _react2['default'].createElement(
                            'span',
                            { style: { fontWeight: 500, color: '#E53935' } },
                            t.StatusMessage
                        );
                    } else if (t.Status === 'Queued') {
                        data.TaskStatus = _react2['default'].createElement(
                            'span',
                            { style: { fontWeight: 500, color: '#fb8c00' } },
                            t.StatusMessage
                        );
                    } else {
                        data.TaskStatus = _react2['default'].createElement(
                            'span',
                            null,
                            t.Status,
                            ' (',
                            t.StatusMessage,
                            ')'
                        );
                    }
                } else {
                    data.TaskStatus = "-";
                    data.TaskEndTime = "-";
                    data.TaskStartTime = "-";
                }
                var tagOpacity = undefined;
                if (job.Inactive) {
                    tagOpacity = { opacity: .43 };
                }
                if (job.Schedule) {
                    data.Trigger = _react2['default'].createElement(
                        'div',
                        { style: _extends({}, tagStyle, tagOpacity, { backgroundColor: '#03A9F4' }) },
                        _react2['default'].createElement('span', { className: "mdi mdi-timer" }),
                        _react2['default'].createElement(_ScheduleForm2['default'], { schedule: job.Schedule })
                    );
                    data.SortValue = '0-' + job.Label;
                } else if (job.EventNames) {
                    data.SortValue = '1-' + job.Label;
                    data.Trigger = _react2['default'].createElement(
                        'div',
                        { style: _extends({}, tagStyle, tagOpacity, { backgroundColor: '#43a047' }) },
                        _react2['default'].createElement('span', { className: "mdi mdi-pulse", title: m('trigger.events') }),
                        ' ',
                        job.EventNames.map(function (e) {
                            return _Events2['default'].eventData(e).title;
                        }).join(', ')
                    );
                } else {
                    data.Trigger = _react2['default'].createElement(
                        'div',
                        { style: _extends({}, tagStyle, tagOpacity, { backgroundColor: '#607d8b' }) },
                        _react2['default'].createElement('span', { className: "mdi mdi-gesture-tap" }),
                        ' ',
                        m('trigger.manual')
                    );
                    data.SortValue = '2-' + job.Label;
                }
                if (job.Inactive) {
                    data.Label = _react2['default'].createElement(
                        'span',
                        { style: { color: 'rgba(0,0,0,0.43)' } },
                        '[',
                        m('job.disabled'),
                        '] ',
                        data.Label
                    );
                    data.TaskStartTime = _react2['default'].createElement(
                        'span',
                        { style: { opacity: 0.43 } },
                        data.TaskStartTime
                    );
                    data.TaskEndTime = _react2['default'].createElement(
                        'span',
                        { style: { opacity: 0.43 } },
                        data.TaskEndTime
                    );
                    data.TaskStatus = _react2['default'].createElement(
                        'span',
                        { style: { opacity: 0.43 } },
                        data.TaskStatus
                    );
                    data.SortValue = '3-' + job.Label;
                }

                if (job.Owner === 'pydio.system.user') {
                    system.push(data);
                } else {
                    other.push(data);
                }
            });

            return { system: system, other: other };
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var selectRows = _props.selectRows;
            var muiTheme = _props.muiTheme;
            var _props$jobs = _props.jobs;
            var jobs = _props$jobs === undefined ? [] : _props$jobs;
            var loading = _props.loading;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };
            var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

            var keys = [{
                name: 'Trigger',
                label: m('job.trigger'),
                style: { width: 180, textAlign: 'left', paddingRight: 0 },
                headerStyle: { width: 180, paddingRight: 0 },
                hideSmall: true,
                sorter: {
                    type: 'number',
                    'default': true,
                    value: function value(row) {
                        return row.SortValue;
                    }
                }
            }, {
                name: 'Label',
                label: m('job.label'),
                style: { width: '40%', fontSize: 15 },
                headerStyle: { width: '40%' },
                sorter: { type: 'string' }
            }, {
                name: 'TaskEndTime',
                label: m('job.endTime'),
                style: { width: '15%' },
                headerStyle: { width: '15%' },
                sorter: { type: 'number', value: function value(row) {
                        return row.SortEndTime;
                    } },
                hideSmall: true
            }, {
                name: 'TaskStatus',
                label: m('job.status'),
                sorter: { type: 'string', value: function value(row) {
                        return row.SortStatus;
                    } }
            }];

            var userKeys = [].concat(keys);
            // Replace Trigger by Owner
            userKeys[1] = {
                name: 'Owner',
                label: m('job.owner'),
                style: { width: '15%' },
                headerStyle: { width: '15%' },
                hideSmall: true
            };

            var _extractRowsInfo = this.extractRowsInfo(jobs, m);

            var system = _extractRowsInfo.system;
            var other = _extractRowsInfo.other;

            var actions = [{
                iconClassName: 'mdi mdi-chevron-right',
                onTouchTap: function onTouchTap(row) {
                    return selectRows([row]);
                }
            }];

            return _react2['default'].createElement(
                'div',
                { style: { flex: 1, overflowY: 'auto' } },
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: m('system.title'),
                    legend: m('system.legend')
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    _react2['default'].createElement(MaterialTable, {
                        data: system,
                        columns: keys,
                        actions: actions,
                        onSelectRows: function (rows) {
                            selectRows(rows);
                        },
                        showCheckboxes: false,
                        emptyStateString: loading ? _pydio2['default'].getInstance().MessageHash[466] : m('system.empty'),
                        masterStyles: adminStyles.body.tableMaster
                    })
                ),
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: m('users.title'),
                    legend: m('users.legend')
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    _react2['default'].createElement(MaterialTable, {
                        data: other,
                        columns: userKeys,
                        onSelectRows: function (rows) {
                            selectRows(rows);
                        },
                        showCheckboxes: false,
                        emptyStateString: m('users.empty'),
                        masterStyles: adminStyles.body.tableMaster
                    })
                )
            );
        }
    }]);

    return JobsList;
})(_react2['default'].Component);

JobsList = (0, _materialUiStyles.muiThemeable)()(JobsList);
exports['default'] = JobsList;
module.exports = exports['default'];
