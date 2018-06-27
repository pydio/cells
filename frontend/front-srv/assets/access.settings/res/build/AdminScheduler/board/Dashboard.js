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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _JobBoard = require('./JobBoard');

var _JobBoard2 = _interopRequireDefault(_JobBoard);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib2.MaterialTable;

var Dashboard = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    eventsNames: {
        '0': 'Create Node',
        '1': 'Read Node',
        '2': 'Update Path',
        '3': 'Update Content',
        '4': 'Update Metadata',
        '5': 'Delete Node'
    },

    getInitialState: function getInitialState() {
        return {
            Owner: null,
            Filter: null
        };
    },

    load: function load() {
        var _this = this;

        var hideLoading = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        var _state = this.state;
        var Owner = _state.Owner;
        var Filter = _state.Filter;

        if (!hideLoading) {
            this.setState({ loading: true });
        }
        JobsStore.getInstance().getAdminJobs(Owner, Filter).then(function (jobs) {
            _this.setState({ result: jobs, loading: false });
        })['catch'](function (reason) {
            _this.setState({ error: reason.message, loading: false });
        });
    },

    componentDidMount: function componentDidMount() {
        var _this2 = this;

        this.load();
        this._loadDebounced = (0, _lodashDebounce2['default'])(function () {
            _this2.load(true);
        }, 500);
        JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
    },

    componentWillUnmount: function componentWillUnmount() {
        JobsStore.getInstance().stopObserving("tasks_updated");
    },

    selectRows: function selectRows(rows) {
        if (rows.length) {
            this.setState({ selectJob: rows[0].ID });
        }
    },

    showTaskCreator: function showTaskCreator() {},

    extractRowsInfo: function extractRowsInfo(jobs) {
        var _this3 = this;

        var system = [];
        var other = [];
        if (jobs === undefined) {
            return { system: system, other: other };
        }
        jobs.map(function (job) {

            var data = _extends({}, job);
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

            if (job.Schedule) {
                data.Trigger = 'Periodic Schedule'; //job.Schedule.Iso8601Schedule;
                data.TriggerValue = 1;
            } else if (job.EventNames) {
                data.TriggerValue = 2;
                data.Trigger = 'Events: ' + job.EventNames.map(function (e) {
                    if (e.indexOf('NODE_CHANGE:') === 0) {
                        return _this3.eventsNames[e.replace('NODE_CHANGE:', '')];
                    } else {
                        return e;
                    }
                }).join(', ');
            } else if (job.AutoStart) {
                data.Trigger = 'Manual Trigger';
                data.TriggerValue = 0;
            } else {
                data.Trigger = '-';
                data.TriggerValue = 3;
            }
            if (job.Inactive) {
                data.Label = _react2['default'].createElement(
                    'span',
                    { style: { color: 'rgba(0,0,0,0.43)' } },
                    '[disabled] ',
                    data.Label
                );
            }

            if (job.Owner === 'pydio.system.user') {
                system.push(data);
            } else {
                other.push(data);
            }
        });

        return { system: system, other: other };
    },

    dotsButton: function dotsButton(job) {
        return _react2['default'].createElement(
            _materialUi.IconMenu,
            {
                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-dots-vertical' }),
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                targetOrigin: { horizontal: 'right', vertical: 'top' }
            },
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Runs History" }),
            (job.Schedule || job.AutoStart) && _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Run Now" }),
            _react2['default'].createElement(_materialUi.Divider, null),
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Edit Job" })
        );
    },

    render: function render() {
        var _this4 = this;

        var keys = [{
            name: 'Label',
            label: this.context.getMessage('12', 'action.scheduler'),
            style: { width: '35%', fontSize: 15 },
            headerStyle: { width: '35%' }
        }, {
            name: 'Owner',
            label: "Owner",
            style: { width: '15%' },
            headerStyle: { width: '15%' }
        }, {
            name: 'Trigger',
            label: "Trigger",
            style: { width: '15%' },
            headerStyle: { width: '15%' }
        }, {
            name: 'TaskEndTime',
            label: this.context.getMessage('14', 'action.scheduler'),
            style: { width: '15%' },
            headerStyle: { width: '15%' }
        }, {
            name: 'TaskStatus',
            label: this.context.getMessage('13', 'action.scheduler')
        }, {
            name: 'More',
            label: '',
            style: { width: 100 }, headerStyle: { width: 100 },
            renderCell: function renderCell(row) {
                return _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-chevron-right', onTouchTap: function () {
                        _this4.setState({ selectJob: row.ID });
                    } });
            }
        }];

        var _state2 = this.state;
        var result = _state2.result;
        var loading = _state2.loading;
        var selectJob = _state2.selectJob;

        if (selectJob && result && result.Jobs) {
            var found = result.Jobs.filter(function (j) {
                return j.ID === selectJob;
            });
            if (found.length) {
                return _react2['default'].createElement(_JobBoard2['default'], { job: found[0], onRequestClose: function () {
                        return _this4.setState({ selectJob: null });
                    } });
            }
        }

        var _extractRowsInfo = this.extractRowsInfo(result ? result.Jobs : []);

        var system = _extractRowsInfo.system;
        var other = _extractRowsInfo.other;

        system.sort(function (a, b) {
            return a.TriggerValue == b.TriggerValue ? 0 : a.TriggerValue > b.TriggerValue ? 1 : -1;
        });

        var headerButtons = [];

        return _react2['default'].createElement(
            'div',
            { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('18', 'action.scheduler'),
                icon: 'mdi mdi-timetable',
                actions: headerButtons,
                reloadAction: this.load.bind(this),
                loading: loading
            }),
            _react2['default'].createElement(
                'div',
                { style: { flex: 1, overflowY: 'auto' } },
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: "System Jobs",
                    legend: "These jobs are registered by default inside the application. They are generally in charge of extracting information from node in background, or doing some cleaning operations."
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: { margin: 20 } },
                    _react2['default'].createElement(MaterialTable, {
                        data: system,
                        columns: keys,
                        onSelectRows: function (rows) {
                            _this4.selectRows(rows);
                        },
                        showCheckboxes: false,
                        emptyStateString: loading ? 'Loading jobs...' : 'No jobs found'
                    })
                ),
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: "Users Jobs",
                    legend: "These jobs are dynamically created and trigged by user actions"
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: { margin: 20 } },
                    _react2['default'].createElement(MaterialTable, {
                        data: other,
                        columns: keys,
                        onSelectRows: function (rows) {
                            _this4.selectRows(rows);
                        },
                        showCheckboxes: false,
                        emptyStateString: 'No Users Jobs'
                    })
                )
            )
        );
    }

});

exports['default'] = Dashboard;
module.exports = exports['default'];
