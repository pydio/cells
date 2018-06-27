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

            if (!ActionsLogs) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'No actions taken'
                );
            }
            var lines = [];
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

            return _react2['default'].createElement(
                'div',
                { style: { fontSize: 13 } },
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
            var store = JobsStore.getInstance();
            var actions = [];
            if (row.Status === 'Running' && row.CanPause) {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-pause", tooltip: "Pause Task", onTouchTap: function () {
                        store.controlTask(row, 'Pause');
                    }, onClick: function (e) {
                        return e.stopPropagation();
                    } }));
            }
            if (row.Status === 'Paused') {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-play", tooltip: "Resume Task", onTouchTap: function () {
                        store.controlTask(row, 'Resume');
                    }, onClick: function (e) {
                        return e.stopPropagation();
                    } }));
            }
            if (row.Status === 'Running' || row.Status === 'Paused') {
                if (row.CanStop) {
                    actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-stop", tooltip: "Stop Now", onTouchTap: function () {
                            store.controlTask(row, 'Stop');
                        }, onClick: function (e) {
                            return e.stopPropagation();
                        } }));
                } else if (row.StatusMessage === 'Pending') {
                    actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", tooltip: "Delete", onTouchTap: function () {
                            store.controlTask(row, 'Delete');
                        }, onClick: function (e) {
                            return e.stopPropagation();
                        } }));
                }
            } else {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", tooltip: "Delete", onTouchTap: function () {
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

            var keys = [{ name: 'ID', label: 'ID' }, { name: 'StartTime', label: 'Start', useMoment: true }, { name: 'EndTime', label: 'End', useMoment: true }, { name: 'Status', label: 'Status' }, { name: 'StatusMessage', label: 'Message', style: { width: '25%' }, headerStyle: { width: '25%' }, renderCell: function renderCell(row) {
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
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, { icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-play" }), label: 'Run Now', disabled: job.Inactive, primary: true, onTouchTap: function () {
                        JobsStore.getInstance().controlJob(job, 'RunOnce');
                    } }));
            }
            if (job.Inactive) {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, { icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-checkbox-marked-circle-outline" }), label: 'Enable Job', primary: true, onTouchTap: function () {
                        JobsStore.getInstance().controlJob(job, 'Active');
                    } }));
            } else {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, { icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-checkbox-blank-circle-outline" }), label: 'Disable Job', primary: true, onTouchTap: function () {
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
                        title: "Running Tasks"
                    }),
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { style: { margin: 20 } },
                        _react2['default'].createElement(MaterialTable, {
                            data: running,
                            columns: keys,
                            showCheckboxes: false,
                            emptyStateString: "No tasks running"
                        })
                    ),
                    _react2['default'].createElement(AdminComponents.SubHeader, {
                        title: _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', width: '100%', alignItems: 'baseline' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { flex: 1 } },
                                'Tasks History'
                            ),
                            mode === 'selection' && selectedRows.length > 1 && _react2['default'].createElement(
                                'div',
                                { style: { lineHeight: 'initial' } },
                                _react2['default'].createElement(_materialUi.RaisedButton, { label: "Delete Tasks", secondary: true, onTouchTap: this.deleteSelection.bind(this), disabled: working })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { lineHeight: 'initial', marginLeft: 5 } },
                                _react2['default'].createElement(_materialUi.FlatButton, { label: mode === 'selection' ? "Disable Multiple" : "Enable Multiple", primary: true, onTouchTap: function () {
                                        _this3.setState({ mode: mode === 'selection' ? 'log' : 'selection' });
                                    }, disabled: working })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { lineHeight: 'initial', marginLeft: 5 } },
                                _react2['default'].createElement(_materialUi.FlatButton, { label: "Clear All", primary: true, onTouchTap: this.deleteAll.bind(this), disabled: working })
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
                            emptyStateString: "No tasks have run yet",
                            selectedRows: selectedRows,
                            deselectOnClickAway: true
                        }),
                        more && _react2['default'].createElement(
                            'div',
                            { style: { padding: 20, borderTop: '1px solid #eee' } },
                            more,
                            ' other tasks not shown...'
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
