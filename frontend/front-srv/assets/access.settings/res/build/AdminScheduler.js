(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    eventsNames: {
        '0': 'trigger.create.node',
        '1': 'trigger.read.node',
        '2': 'trigger.update.path',
        '3': 'trigger.update.content',
        '4': 'trigger.update.metadata',
        '5': 'trigger.delete.node'
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
                        return m(_this5.eventsNames[e.replace('NODE_CHANGE:', '')]);
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

},{"./JobBoard":2,"./JobSchedule":3,"lodash.debounce":"lodash.debounce","material-ui":"material-ui","pydio":"pydio","react":"react"}],2:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _TaskActivity = require('./TaskActivity');

var _TaskActivity2 = _interopRequireDefault(_TaskActivity);

var _JobSchedule = require('./JobSchedule');

var _JobSchedule2 = _interopRequireDefault(_JobSchedule);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;
var SingleJobProgress = _Pydio$requireLib.SingleJobProgress;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib2.MaterialTable;

var JobBoard = (function (_React$Component) {
    _inherits(JobBoard, _React$Component);

    function JobBoard(props) {
        _classCallCheck(this, JobBoard);

        _get(Object.getPrototypeOf(JobBoard.prototype), 'constructor', this).call(this, props);
        this.state = {
            mode: 'log', // 'log' or 'selection'
            selectedRows: [],
            working: false,
            taskLogs: null
        };
    }

    _createClass(JobBoard, [{
        key: 'runOnce',
        value: function runOnce() {}
    }, {
        key: 'renderActions',
        value: function renderActions(row) {
            var pydio = this.props.pydio;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.task.action.' + id] || id;
            };

            var store = JobsStore.getInstance();
            var actions = [];
            var icProps = {
                iconStyle: { color: 'rgba(0,0,0,.3)' },
                onClick: function onClick(e) {
                    return e.stopPropagation();
                }
            };
            if (row.Status === 'Running' && row.CanPause) {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-pause", tooltip: m('pause'), onTouchTap: function () {
                        store.controlTask(row, 'Pause');
                    } }, icProps)));
            }
            if (row.Status === 'Paused') {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-play", tooltip: m('resume'), onTouchTap: function () {
                        store.controlTask(row, 'Resume');
                    } }, icProps)));
            }
            if (row.Status === 'Running' || row.Status === 'Paused') {
                if (row.CanStop) {
                    actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-stop", tooltip: m('stop'), onTouchTap: function () {
                            store.controlTask(row, 'Stop');
                        } }, icProps)));
                } else if (row.StatusMessage === 'Pending') {
                    actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-delete", tooltip: m('delete'), onTouchTap: function () {
                            store.controlTask(row, 'Delete');
                        } }, icProps)));
                }
            } else {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-delete", tooltip: m('delete'), onTouchTap: function () {
                        store.controlTask(row, 'Delete');
                    } }, icProps)));
            }
            return actions;
        }
    }, {
        key: 'onSelectTaskRows',
        value: function onSelectTaskRows(rows) {
            var mode = this.state.mode;

            if (mode === 'selection') {
                this.setState({ selectedRows: rows });
            } else if (rows.length === 1) {
                this.setState({ taskLogs: rows[0] });
            }
        }
    }, {
        key: 'deleteSelection',
        value: function deleteSelection() {
            var _this = this;

            var selectedRows = this.state.selectedRows;
            var job = this.props.job;

            var store = JobsStore.getInstance();
            this.setState({ working: true });
            store.deleteTasks(job.ID, selectedRows).then(function () {
                _this.setState({ working: false, selectedRows: [], mode: 'log' });
            });
        }
    }, {
        key: 'deleteAll',
        value: function deleteAll() {
            var _this2 = this;

            this.setState({ working: true });
            var job = this.props.job;

            var store = JobsStore.getInstance();
            store.deleteAllTasksForJob(job.ID).then(function () {
                _this2.setState({ working: false });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var jobsEditable = _props.jobsEditable;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };

            var keys = [{ name: 'ID', label: m('task.id'), hideSmall: true }, { name: 'StartTime', label: m('task.start'), useMoment: true }, { name: 'EndTime', label: m('task.end'), useMoment: true, hideSmall: true }, { name: 'Status', label: m('task.status') }, { name: 'StatusMessage', label: m('task.message'), hideSmall: true, style: { width: '25%' }, headerStyle: { width: '25%' }, renderCell: function renderCell(row) {
                    if (row.Status === 'Error') {
                        return _react2['default'].createElement(
                            'span',
                            { style: { fontWeight: 500, color: '#E53935' } },
                            row.StatusMessage
                        );
                    } else if (row.Status === 'Running') {
                        return _react2['default'].createElement(SingleJobProgress, { pydio: pydio, jobID: row.JobID, taskID: row.ID });
                    } else {
                        return row.StatusMessage;
                    }
                } }, { name: 'Actions', label: '', style: { textAlign: 'right' }, renderCell: this.renderActions.bind(this) }];

            var _props2 = this.props;
            var job = _props2.job;
            var onRequestClose = _props2.onRequestClose;
            var _state = this.state;
            var selectedRows = _state.selectedRows;
            var working = _state.working;
            var mode = _state.mode;
            var taskLogs = _state.taskLogs;

            var tasks = job.Tasks || [];
            var runningStatus = ['Running', 'Paused'];

            tasks.sort(function (a, b) {
                if (!a.StartTime || !b.StartTime || a.StartTime === b.StartTime) {
                    return a.ID > b.ID ? 1 : -1;
                }
                return a.StartTime > b.StartTime ? -1 : 1;
            });

            var actions = [];
            if (!job.EventNames) {
                if (jobsEditable) {
                    actions.push(_react2['default'].createElement(_JobSchedule2['default'], { job: job, edit: true, onUpdate: function () {} }));
                }
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, { icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-play" }), label: m('task.action.run'), disabled: job.Inactive, primary: true, onTouchTap: function () {
                        JobsStore.getInstance().controlJob(job, 'RunOnce');
                    } }));
            }
            if (job.Inactive) {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, { icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-checkbox-marked-circle-outline" }), label: m('task.action.enable'), primary: true, onTouchTap: function () {
                        JobsStore.getInstance().controlJob(job, 'Active');
                    } }));
            } else {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, { icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-checkbox-blank-circle-outline" }), label: m('task.action.disable'), primary: true, onTouchTap: function () {
                        JobsStore.getInstance().controlJob(job, 'Inactive');
                    } }));
            }
            var running = tasks.filter(function (t) {
                return runningStatus.indexOf(t.Status) !== -1;
            });
            var other = tasks.filter(function (t) {
                return runningStatus.indexOf(t.Status) === -1;
            });
            var more = undefined;
            if (other.length > 20) {
                more = other.length - 20;
                other = other.slice(0, 20);
            }

            return _react2['default'].createElement(
                'div',
                { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        title: job.Label + (taskLogs ? ' - ' + taskLogs.ID.substr(0, 8) : ''),
                        onRequestClose: function () {
                            _this3.setState({ taskLogs: null });
                        },
                        open: taskLogs !== null,
                        autoScrollBodyContent: true,
                        autoDetectWindowHeight: true,
                        bodyStyle: { padding: 0 }
                    },
                    taskLogs && _react2['default'].createElement(_TaskActivity2['default'], { pydio: this.props.pydio, task: taskLogs })
                ),
                _react2['default'].createElement(AdminComponents.Header, {
                    title: _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement(
                            'a',
                            { style: { cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,.87)' }, onTouchTap: onRequestClose },
                            pydio.MessageHash['ajxp_admin.scheduler.title']
                        ),
                        ' / ',
                        job.Label,
                        ' ',
                        job.Inactive ? ' [disabled]' : ''
                    ),
                    backButtonAction: onRequestClose,
                    actions: actions,
                    loading: working
                }),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, overflowY: 'auto' } },
                    _react2['default'].createElement(AdminComponents.SubHeader, {
                        title: m('tasks.running')
                    }),
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { style: { margin: 20 } },
                        _react2['default'].createElement(MaterialTable, {
                            data: running,
                            columns: keys,
                            showCheckboxes: false,
                            emptyStateString: m('tasks.running.empty'),
                            onSelectRows: function (rows) {
                                if (rows.length === 1 && running.length) {
                                    _this3.setState({ taskLogs: rows[0] });
                                }
                            }
                        })
                    ),
                    _react2['default'].createElement(AdminComponents.SubHeader, {
                        title: _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', width: '100%', alignItems: 'baseline' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { flex: 1 } },
                                m('tasks.history')
                            ),
                            mode === 'selection' && selectedRows.length > 1 && _react2['default'].createElement(
                                'div',
                                { style: { lineHeight: 'initial' } },
                                _react2['default'].createElement(_materialUi.RaisedButton, { label: m('tasks.bulk.delete'), secondary: true, onTouchTap: this.deleteSelection.bind(this), disabled: working })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { lineHeight: 'initial', marginLeft: 5 } },
                                _react2['default'].createElement(_materialUi.FlatButton, { label: mode === 'selection' ? m('tasks.bulk.disable') : m('tasks.bulk.enable'), primary: true, onTouchTap: function () {
                                        _this3.setState({ mode: mode === 'selection' ? 'log' : 'selection' });
                                    }, disabled: working })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { lineHeight: 'initial', marginLeft: 5 } },
                                _react2['default'].createElement(_materialUi.FlatButton, { label: m('tasks.bulk.clear'), primary: true, onTouchTap: this.deleteAll.bind(this), disabled: working })
                            )
                        )
                    }),
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { style: { margin: 20 } },
                        _react2['default'].createElement(MaterialTable, {
                            data: other,
                            columns: keys,
                            showCheckboxes: mode === 'selection',
                            onSelectRows: this.onSelectTaskRows.bind(this),
                            emptyStateString: m('tasks.history.empty'),
                            selectedRows: selectedRows,
                            deselectOnClickAway: true
                        }),
                        more && _react2['default'].createElement(
                            'div',
                            { style: { padding: 20, borderTop: '1px solid #eee' } },
                            m('tasks.history.more').replace('%s', more)
                        )
                    )
                )
            );
        }
    }]);

    return JobBoard;
})(_react2['default'].Component);

exports['default'] = JobBoard;
module.exports = exports['default'];

},{"./JobSchedule":3,"./TaskActivity":4,"material-ui":"material-ui","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;

var JobSchedule = (function (_React$Component) {
    _inherits(JobSchedule, _React$Component);

    function JobSchedule(props) {
        _classCallCheck(this, JobSchedule);

        _get(Object.getPrototypeOf(JobSchedule.prototype), 'constructor', this).call(this, props);
        var job = props.job;

        if (job.Schedule && job.Schedule.Iso8601Schedule) {
            this.state = JobSchedule.parseIso8601(job.Schedule.Iso8601Schedule);
        } else {
            this.state = { frequency: 'manual' };
        }
        this.state['open'] = false;
    }

    _createClass(JobSchedule, [{
        key: 'updateJob',
        value: function updateJob() {
            var _this = this;

            var _props = this.props;
            var job = _props.job;
            var onUpdate = _props.onUpdate;
            var frequency = this.state.frequency;

            if (frequency === 'manual') {
                if (job.Schedule !== undefined) {
                    delete job.Schedule;
                }
                job.AutoStart = true;
            } else {
                job.Schedule = { Iso8601Schedule: JobSchedule.makeIso8601FromState(this.state) };
                if (job.AutoStart !== undefined) {
                    delete job.AutoStart;
                }
            }
            _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                var SchedulerServiceApi = sdk.SchedulerServiceApi;
                var JobsPutJobRequest = sdk.JobsPutJobRequest;

                var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                var req = new JobsPutJobRequest();
                // Clone and remove tasks
                req.Job = _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(job)));
                if (req.Job.Tasks !== undefined) {
                    delete req.Job.Tasks;
                }
                api.putJob(req).then(function () {
                    onUpdate();
                    _this.setState({ open: false });
                });
            });
        }
    }, {
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getMessages()['ajxp_admin.scheduler.' + id] || id;
        }
    }, {
        key: 'changeFrequency',
        value: function changeFrequency(f) {
            var _state = this.state;
            var monthday = _state.monthday;
            var weekday = _state.weekday;
            var daytime = _state.daytime;
            var everyminutes = _state.everyminutes;

            if (monthday === undefined) {
                monthday = 1;
            }
            if (weekday === undefined) {
                weekday = 1;
            }
            if (daytime === undefined) {
                daytime = moment();
                daytime.year(2012);
                daytime.hours(9);
                daytime.minutes(0);
                daytime = daytime.toDate();
            }
            if (everyminutes === undefined) {
                everyminutes = 15;
            }
            this.setState({ frequency: f, monthday: monthday, weekday: weekday, daytime: daytime, everyminutes: everyminutes });
        }
    }, {
        key: 'readableString',
        value: function readableString() {
            var short = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var _state2 = this.state;
            var frequency = _state2.frequency;
            var monthday = _state2.monthday;
            var weekday = _state2.weekday;
            var daytime = _state2.daytime;
            var everyminutes = _state2.everyminutes;

            var dTRead = '0:00';
            if (daytime) {
                dTRead = moment(daytime).format('h:mm');
            }
            switch (frequency) {
                case "manual":
                    return this.T("trigger.manual");
                case "monthly":
                    if (short) {
                        return this.T("schedule.monthly.short").replace('%1', monthday);
                    } else {
                        return this.T("schedule.monthly").replace('%1', monthday).replace('%2', dTRead);
                    }
                case "weekly":
                    if (short) {
                        return this.T("schedule.weekly.short").replace('%1', moment.weekdays()[weekday]);
                    } else {
                        return this.T("schedule.weekly").replace('%1', moment.weekdays()[weekday]).replace('%2', dTRead);
                    }
                case "daily":
                    if (short) {
                        return this.T("schedule.daily.short").replace('%1', dTRead);
                    } else {
                        return this.T("schedule.daily").replace('%1', dTRead);
                    }
                case "timely":
                    var duration = moment.duration(everyminutes, 'minutes');
                    return this.T("schedule.timely").replace('%1', (duration.hours() ? duration.hours() + 'h' : '') + (duration.minutes() ? duration.minutes() + 'mn' : ''));
                default:
                    return "Error";
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var edit = this.props.edit;

            if (!edit) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    this.readableString(true)
                );
            }
            var _state3 = this.state;
            var frequency = _state3.frequency;
            var monthday = _state3.monthday;
            var weekday = _state3.weekday;
            var daytime = _state3.daytime;
            var everyminutes = _state3.everyminutes;

            var monthdays = [];
            var weekdays = moment.weekdays();
            for (var i = 1; i < 30; i++) {
                monthdays.push(i);
            }
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.FlatButton, { primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-timer" }), label: this.readableString(true), onTouchTap: function () {
                        _this2.setState({ open: true });
                    } }),
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        title: 'Job Schedule',
                        actions: [_react2['default'].createElement(_materialUi.FlatButton, { label: "Close", onTouchTap: function () {
                                _this2.setState({ open: false });
                            } }), _react2['default'].createElement(_materialUi.FlatButton, { label: "Save", onTouchTap: function () {
                                _this2.updateJob();
                            } })],
                        modal: false,
                        open: this.state.open,
                        contentStyle: { width: 320 }
                    },
                    _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'div',
                                { style: { color: '#212121' } },
                                this.readableString()
                            ),
                            frequency !== 'manual' && _react2['default'].createElement(
                                'div',
                                { style: { fontSize: 11, paddingTop: 5 } },
                                'ISO8601: ',
                                JobSchedule.makeIso8601FromState(this.state)
                            )
                        ),
                        _react2['default'].createElement(
                            _materialUi.SelectField,
                            {
                                floatingLabelText: this.T('schedule.type'),
                                value: frequency,
                                onChange: function (e, i, val) {
                                    _this2.changeFrequency(val);
                                },
                                fullWidth: true
                            },
                            _react2['default'].createElement(_materialUi.MenuItem, { value: 'manual', primaryText: this.T('schedule.type.manual') }),
                            _react2['default'].createElement(_materialUi.MenuItem, { value: 'monthly', primaryText: this.T('schedule.type.monthly') }),
                            _react2['default'].createElement(_materialUi.MenuItem, { value: 'weekly', primaryText: this.T('schedule.type.weekly') }),
                            _react2['default'].createElement(_materialUi.MenuItem, { value: 'daily', primaryText: this.T('schedule.type.daily') }),
                            _react2['default'].createElement(_materialUi.MenuItem, { value: 'timely', primaryText: this.T('schedule.type.timely') })
                        ),
                        frequency === 'monthly' && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                _materialUi.SelectField,
                                {
                                    floatingLabelText: this.T('schedule.detail.monthday'),
                                    value: monthday,
                                    onChange: function (e, i, val) {
                                        _this2.setState({ monthday: val });
                                    },
                                    fullWidth: true
                                },
                                monthdays.map(function (d) {
                                    return _react2['default'].createElement(_materialUi.MenuItem, { value: d, primaryText: d });
                                })
                            )
                        ),
                        frequency === 'weekly' && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                _materialUi.SelectField,
                                {
                                    floatingLabelText: this.T('schedule.detail.weekday'),
                                    value: weekday,
                                    onChange: function (e, i, val) {
                                        _this2.setState({ weekday: val });
                                    },
                                    fullWidth: true
                                },
                                weekdays.map(function (d, i) {
                                    return _react2['default'].createElement(_materialUi.MenuItem, { value: i, primaryText: d });
                                })
                            )
                        ),
                        (frequency === 'daily' || frequency === 'monthly' || frequency === 'weekly') && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(_materialUi.TimePicker, {
                                format: 'ampm',
                                minutesStep: 5,
                                floatingLabelText: this.T('schedule.detail.daytime'),
                                value: daytime,
                                onChange: function (e, v) {
                                    _this2.setState({ daytime: v });
                                },
                                fullWidth: true
                            })
                        ),
                        frequency === 'timely' && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(_materialUi.TextField, {
                                floatingLabelText: this.T('schedule.detail.minutes'),
                                value: everyminutes,
                                type: "number",
                                onChange: function (e, val) {
                                    _this2.setState({ everyminutes: parseInt(val) });
                                },
                                fullWidth: true
                            })
                        )
                    )
                )
            );
        }
    }], [{
        key: 'parseIso8601',
        value: function parseIso8601(value) {
            if (value === '' || value.indexOf('/') === -1) {
                return { frequency: 'manual' };
            }

            var _value$split = value.split('/');

            var _value$split2 = _slicedToArray(_value$split, 3);

            var R = _value$split2[0];
            var d = _value$split2[1];
            var i = _value$split2[2];

            var startDate = new Date(d);
            if (i === 'P1M') {
                return { frequency: 'monthly', monthday: startDate.getDate(), daytime: startDate };
            } else if (i === 'P7D') {
                var m = moment(startDate);
                return { frequency: 'weekly', weekday: m.day(), daytime: startDate };
            } else if (i === 'PT24H' || i === 'P1D') {
                return { frequency: 'daily', daytime: startDate };
            } else {
                var _d = moment.duration(i);
                if (_d.isValid()) {
                    var minutes = _d.minutes() + _d.hours() * 60;
                    return { frequency: 'timely', everyminutes: minutes };
                } else {
                    return { error: 'Cannot parse value ' + value };
                }
            }
        }
    }, {
        key: 'makeIso8601FromState',
        value: function makeIso8601FromState(state) {
            var frequency = state.frequency;
            var monthday = state.monthday;
            var weekday = state.weekday;
            var daytime = state.daytime;
            var everyminutes = state.everyminutes;

            var startDate = new Date('2012-01-01T00:00:00.828696-07:00');
            var duration = moment.duration(0);
            switch (frequency) {
                case "manual":
                    return "";
                case "monthly":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    startDate.setDate(monthday || 1);
                    duration = moment.duration(1, 'months');
                    break;
                case "weekly":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    var m = moment(startDate);
                    m.day(weekday === undefined ? 1 : weekday);
                    startDate = m.toDate();
                    duration = moment.duration(7, 'days');
                    break;
                case "daily":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    duration = moment.duration(24, 'hours');
                    break;
                case "timely":
                    duration = moment.duration(everyminutes, 'minutes');
                    break;
                default:
                    break;
            }
            return 'R/' + moment(startDate).toISOString() + '/' + duration.toISOString();
        }
    }]);

    return JobSchedule;
})(_react2['default'].Component);

exports['default'] = JobSchedule;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],4:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _Pydio$requireLib = _pydio2["default"].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var _Pydio$requireLib2 = _pydio2["default"].requireLib('boot');

var JobsStore = _Pydio$requireLib2.JobsStore;
var moment = _Pydio$requireLib2.moment;

var TaskActivity = (function (_React$Component) {
    _inherits(TaskActivity, _React$Component);

    function TaskActivity(props) {
        _classCallCheck(this, TaskActivity);

        _get(Object.getPrototypeOf(TaskActivity.prototype), "constructor", this).call(this, props);
        this.state = { activity: [], loading: false };
    }

    _createClass(TaskActivity, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this = this;

            this.loadActivity(this.props);
            this._loadDebounced = (0, _lodashDebounce2["default"])(function (jobId) {
                console.log(jobId, _this.props);
                if (jobId && _this.props.task && _this.props.task.JobID === jobId) {
                    _this.loadActivity(_this.props);
                }
            }, 500);
            JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (this._loadDebounced) {
                JobsStore.getInstance().stopObserving("tasks_updated", this._loadDebounced);
            }
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (!this.props.task) {
                this.loadActivity(nextProps);
            }
            if (nextProps.task && this.props.task && nextProps.task.ID !== this.props.task.ID) {
                this.loadActivity(nextProps);
            }
        }
    }, {
        key: "loadActivity",
        value: function loadActivity(props) {
            var _this2 = this;

            var task = props.task;

            if (!task) {
                return;
            }
            var operationId = task.JobID + '-' + task.ID.substr(0, 8);
            var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2["default"].getRestClient());

            var request = new _pydioHttpRestApi.LogListLogRequest();
            request.Query = "+OperationUuid:\"" + operationId + "\"";
            request.Page = 0;
            request.Size = 100;
            request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject('JSON');
            this.setState({ loading: true });
            api.listTasksLogs(request).then(function (response) {
                _this2.setState({ activity: response.Logs || [], loading: false });
            })["catch"](function () {
                _this2.setState({ activity: [], loading: false });
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var task = _props.task;
            var _state = this.state;
            var activity = _state.activity;
            var loading = _state.loading;

            var columns = [{ name: 'Ts', label: pydio.MessageHash['settings.17'], style: { width: '25%' }, headerStyle: { width: '25%' }, renderCell: function renderCell(row) {
                    return moment(row.Ts * 1000).fromNow();
                } }, { name: 'Msg', label: pydio.MessageHash['ajxp_admin.logs.message'] }];
            return _react2["default"].createElement(
                "div",
                { style: { height: 400 } },
                _react2["default"].createElement(MaterialTable, {
                    columns: columns,
                    data: activity,
                    showCheckboxes: false,
                    emptyStateString: 'No activity found'
                })
            );
        }
    }]);

    return TaskActivity;
})(_react2["default"].Component);

exports["default"] = TaskActivity;
module.exports = exports["default"];

},{"lodash.debounce":"lodash.debounce","material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],5:[function(require,module,exports){
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

var _boardDashboard = require('./board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

window.AdminScheduler = {
  Dashboard: _boardDashboard2['default']
};

},{"./board/Dashboard":1}]},{},[5]);
