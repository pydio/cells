(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    extractRowsInfo: function extractRowsInfo(jobs, m) {
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
                data.Trigger = m('trigger.periodic');
                data.TriggerValue = 1;
            } else if (job.EventNames) {
                data.TriggerValue = 2;
                data.Trigger = m('trigger.events') + ': ' + job.EventNames.map(function (e) {
                    if (e.indexOf('NODE_CHANGE:') === 0) {
                        return m(_this3.eventsNames[e.replace('NODE_CHANGE:', '')]);
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
        var _this4 = this;

        var pydio = this.props.pydio;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        };

        var keys = [{
            name: 'Label',
            label: this.context.getMessage('12', 'action.scheduler'),
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
            label: this.context.getMessage('14', 'action.scheduler'),
            style: { width: '15%' },
            headerStyle: { width: '15%' },
            hideSmall: true
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
                return _react2['default'].createElement(_JobBoard2['default'], { pydio: pydio, job: found[0], onRequestClose: function () {
                        return _this4.setState({ selectJob: null });
                    } });
            }
        }

        var _extractRowsInfo = this.extractRowsInfo(result ? result.Jobs : [], m);

        var system = _extractRowsInfo.system;
        var other = _extractRowsInfo.other;

        system.sort(function (a, b) {
            return a.TriggerValue === b.TriggerValue ? 0 : a.TriggerValue > b.TriggerValue ? 1 : -1;
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
                            _this4.selectRows(rows);
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
                            _this4.selectRows(rows);
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

},{"./JobBoard":2,"lodash.debounce":"lodash.debounce","material-ui":"material-ui","pydio":"pydio","react":"react"}],2:[function(require,module,exports){
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

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib2.MaterialTable;

var ActionsLog = (function (_React$Component) {
    _inherits(ActionsLog, _React$Component);

    function ActionsLog() {
        _classCallCheck(this, ActionsLog);

        _get(Object.getPrototypeOf(ActionsLog.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ActionsLog, [{
        key: 'render',
        value: function render() {
            var task = this.props.task;
            var ActionsLogs = task.ActionsLogs;

            var lines = [],
                error = undefined;
            if (ActionsLogs) {
                ActionsLogs.map(function (log) {
                    lines.push(_react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(
                            'div',
                            { style: { border: '1px solid #9e9e9e' } },
                            _react2['default'].createElement(AdminComponents.CodeMirrorField, {
                                mode: 'json',
                                globalScope: {},
                                value: JSON.stringify(log.OutputMessage, null, 4),
                                readOnly: true
                            })
                        )
                    ));
                    lines.push(_react2['default'].createElement(_materialUi.Divider, null));
                });
                lines.pop();
            }

            if (task.Status === "Error" && task.StatusMessage) {
                error = _react2['default'].createElement(
                    'div',
                    { style: { padding: '12px 0', fontWeight: 500, fontSize: 14, color: '#e53935' } },
                    task.StatusMessage
                );
            }
            if (!error && !lines.length) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'No actions taken'
                );
            }

            return _react2['default'].createElement(
                'div',
                { style: { fontSize: 13 } },
                error,
                _react2['default'].createElement(
                    'div',
                    null,
                    lines
                )
            );
        }
    }]);

    return ActionsLog;
})(_react2['default'].Component);

var JobBoard = (function (_React$Component2) {
    _inherits(JobBoard, _React$Component2);

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
            if (row.Status === 'Running' && row.CanPause) {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-pause", tooltip: m('pause'), onTouchTap: function () {
                        store.controlTask(row, 'Pause');
                    }, onClick: function (e) {
                        return e.stopPropagation();
                    } }));
            }
            if (row.Status === 'Paused') {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-play", tooltip: m('resume'), onTouchTap: function () {
                        store.controlTask(row, 'Resume');
                    }, onClick: function (e) {
                        return e.stopPropagation();
                    } }));
            }
            if (row.Status === 'Running' || row.Status === 'Paused') {
                if (row.CanStop) {
                    actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-stop", tooltip: m('stop'), onTouchTap: function () {
                            store.controlTask(row, 'Stop');
                        }, onClick: function (e) {
                            return e.stopPropagation();
                        } }));
                } else if (row.StatusMessage === 'Pending') {
                    actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", tooltip: m('delete'), onTouchTap: function () {
                            store.controlTask(row, 'Delete');
                        }, onClick: function (e) {
                            return e.stopPropagation();
                        } }));
                }
            } else {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", tooltip: m('delete'), onTouchTap: function () {
                        store.controlTask(row, 'Delete');
                    }, onClick: function (e) {
                        return e.stopPropagation();
                    } }));
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

            var pydio = this.props.pydio;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };

            var keys = [{ name: 'ID', label: m('task.id'), hideSmall: true }, { name: 'StartTime', label: m('task.start'), useMoment: true }, { name: 'EndTime', label: m('task.end'), useMoment: true, hideSmall: true }, { name: 'Status', label: m('task.status') }, { name: 'StatusMessage', label: m('task.message'), hideSmall: true, style: { width: '25%' }, headerStyle: { width: '25%' }, renderCell: function renderCell(row) {
                    if (row.Status === 'Error') return _react2['default'].createElement(
                        'span',
                        { style: { fontWeight: 500, color: '#E53935' } },
                        row.StatusMessage
                    );else return row.StatusMessage;
                } }, { name: 'Actions', label: '', style: { textAlign: 'right' }, renderCell: this.renderActions.bind(this) }];

            var _props = this.props;
            var job = _props.job;
            var onRequestClose = _props.onRequestClose;
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
                        title: job.Label,
                        onRequestClose: function () {
                            _this3.setState({ taskLogs: null });
                        },
                        open: taskLogs !== null,
                        autoScrollBodyContent: true,
                        autoDetectWindowHeight: true
                    },
                    taskLogs && _react2['default'].createElement(ActionsLog, { pydio: this.props.pydio, task: taskLogs })
                ),
                _react2['default'].createElement(AdminComponents.Header, {
                    title: _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement(
                            'a',
                            { style: { cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,.87)' }, onTouchTap: onRequestClose },
                            pydio.MessageHash['action.scheduler.18']
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
                            emptyStateString: m('tasks.running.empty')
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

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
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

},{"./board/Dashboard":1}]},{},[3]);
