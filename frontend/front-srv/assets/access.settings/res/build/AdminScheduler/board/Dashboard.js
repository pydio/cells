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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _JobBoard = require('./JobBoard');

var _JobBoard2 = _interopRequireDefault(_JobBoard);

var _JobSchedule = require('./JobSchedule');

var _JobSchedule2 = _interopRequireDefault(_JobSchedule);

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

    nodeEventsNames: {
        '0': 'trigger.create.node',
        '1': 'trigger.read.node',
        '2': 'trigger.update.path',
        '3': 'trigger.update.content',
        '4': 'trigger.update.metadata',
        '5': 'trigger.delete.node'
    },

    userEventsNames: {
        '0': 'trigger.create.user',
        '1': 'trigger.read.user',
        '2': 'trigger.update.user',
        '3': 'trigger.delete.user',
        '4': 'trigger.bind.user',
        '5': 'trigger.logout.user'
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
        JobsStore.getInstance().getAdminJobs(Owner, Filter, "", 1).then(function (jobs) {
            _this.setState({ result: jobs, loading: false });
        })['catch'](function (reason) {
            _this.setState({ error: reason.message, loading: false });
        });
    },

    loadOne: function loadOne(jobID) {
        var _this2 = this;

        var hideLoading = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        // Merge job inside global results
        var result = this.state.result;

        if (!hideLoading) {
            this.setState({ loading: true });
        }
        return JobsStore.getInstance().getAdminJobs(null, null, jobID).then(function (jobs) {
            result.Jobs.forEach(function (v, k) {
                if (v.ID === jobID) {
                    result.Jobs[k] = jobs.Jobs[0];
                }
            });
            _this2.setState({ result: result, loading: false });
            return result;
        })['catch'](function (reason) {
            _this2.setState({ error: reason.message, loading: false });
        });
    },

    componentDidMount: function componentDidMount() {
        var _this3 = this;

        this.load();
        this._loadDebounced = (0, _lodashDebounce2['default'])(function (jobId) {
            if (jobId && _this3.state && _this3.state.selectJob === jobId) {
                _this3.loadOne(jobId, true);
            } else {
                _this3.load(true);
            }
        }, 500);
        JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
        this._poll = setInterval(function () {
            if (_this3.state && _this3.state.selectJob) {
                _this3.loadOne(_this3.state.selectJob, true);
            } else {
                _this3.load(true);
            }
        }, 10000);
    },

    componentWillUnmount: function componentWillUnmount() {
        if (this._poll) {
            clearInterval(this._poll);
        }
        JobsStore.getInstance().stopObserving("tasks_updated");
    },

    selectRows: function selectRows(rows) {
        var _this4 = this;

        if (rows.length) {
            (function () {
                var jobID = rows[0].ID;
                _this4.loadOne(jobID).then(function () {
                    _this4.setState({ selectJob: jobID });
                });
            })();
        }
    },

    showTaskCreator: function showTaskCreator() {},

    extractRowsInfo: function extractRowsInfo(jobs, m) {
        var _this5 = this;

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
                data.Trigger = _react2['default'].createElement(_JobSchedule2['default'], { job: job }); // m('trigger.periodic');
                data.TriggerValue = 1;
            } else if (job.EventNames) {
                data.TriggerValue = 2;
                data.Trigger = m('trigger.events') + ': ' + job.EventNames.map(function (e) {
                    if (e.indexOf('NODE_CHANGE:') === 0) {
                        return m(_this5.nodeEventsNames[e.replace('NODE_CHANGE:', '')]);
                    } else if (e.indexOf('IDM_CHANGE:USER:') === 0) {
                        return m(_this5.userEventsNames[e.replace('IDM_CHANGE:USER:', '')]);
                    } else {
                        return e;
                    }
                }).join(', ');
            } else if (job.AutoStart) {
                data.Trigger = m('trigger.manual');
                data.TriggerValue = 0;
            } else {
                data.Trigger = '-';
                data.TriggerValue = 3;
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
            }

            if (job.Owner === 'pydio.system.user') {
                system.push(data);
            } else {
                other.push(data);
            }
        });

        return { system: system, other: other };
    },

    render: function render() {
        var _this6 = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var jobsEditable = _props.jobsEditable;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        };

        var keys = [{
            name: 'Label',
            label: m('job.label'),
            style: { width: '35%', fontSize: 15 },
            headerStyle: { width: '35%' }
        }, {
            name: 'Owner',
            label: m('job.owner'),
            style: { width: '15%' },
            headerStyle: { width: '15%' },
            hideSmall: true
        }, {
            name: 'Trigger',
            label: m('job.trigger'),
            style: { width: '15%' },
            headerStyle: { width: '15%' },
            hideSmall: true
        }, {
            name: 'TaskEndTime',
            label: m('job.endTime'),
            style: { width: '15%' },
            headerStyle: { width: '15%' },
            hideSmall: true
        }, {
            name: 'TaskStatus',
            label: m('job.status')
        }, {
            name: 'More',
            label: '',
            style: { width: 100 }, headerStyle: { width: 100 },
            renderCell: function renderCell(row) {
                return _react2['default'].createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-chevron-right', iconStyle: { color: 'rgba(0,0,0,.3)' }, onTouchTap: function () {
                        _this6.setState({ selectJob: row.ID });
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
                return _react2['default'].createElement(_JobBoard2['default'], { pydio: pydio, job: found[0], jobsEditable: jobsEditable, onRequestClose: function () {
                        return _this6.setState({ selectJob: null });
                    } });
            }
        }

        var _extractRowsInfo = this.extractRowsInfo(result ? result.Jobs : [], m);

        var system = _extractRowsInfo.system;
        var other = _extractRowsInfo.other;

        system.sort(function (a, b) {
            return a.TriggerValue === b.TriggerValue ? 0 : a.TriggerValue > b.TriggerValue ? 1 : -1;
        });

        return _react2['default'].createElement(
            'div',
            { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
            _react2['default'].createElement(AdminComponents.Header, {
                title: m('title'),
                icon: 'mdi mdi-timetable',
                actions: [],
                reloadAction: this.load.bind(this),
                loading: loading
            }),
            _react2['default'].createElement(
                'div',
                { style: { flex: 1, overflowY: 'auto' } },
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: m('system.title'),
                    legend: m('system.legend')
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: { margin: 20 } },
                    _react2['default'].createElement(MaterialTable, {
                        data: system,
                        columns: keys,
                        onSelectRows: function (rows) {
                            _this6.selectRows(rows);
                        },
                        showCheckboxes: false,
                        emptyStateString: loading ? this.context.getMessage('466', '') : m('system.empty')
                    })
                ),
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: m('users.title'),
                    legend: m('users.legend')
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: { margin: 20 } },
                    _react2['default'].createElement(MaterialTable, {
                        data: other,
                        columns: keys,
                        onSelectRows: function (rows) {
                            _this6.selectRows(rows);
                        },
                        showCheckboxes: false,
                        emptyStateString: m('users.empty')
                    })
                )
            )
        );
    }

});

exports['default'] = Dashboard;
module.exports = exports['default'];
