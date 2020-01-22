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

var _JobGraph = require("./JobGraph");

var _JobGraph2 = _interopRequireDefault(_JobGraph);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;
var SingleJobProgress = _Pydio$requireLib.SingleJobProgress;
var moment = _Pydio$requireLib.moment;

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
            taskLogs: null,
            job: props.job,
            create: props.create,
            descriptions: {}
        };
    }

    _createClass(JobBoard, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.job && (nextProps.job.Tasks !== this.props.job.Tasks || nextProps.job.Inactive !== this.props.job.Inactive)) {
                this.setState({ job: nextProps.job });
            }
        }
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
            } else if (rows.length === 1 && !rows[0].colSpan) {
                this.setState({ taskLogs: rows[0] });
            }
        }
    }, {
        key: 'deleteSelection',
        value: function deleteSelection() {
            var _this = this;

            var selectedRows = this.state.selectedRows;
            var job = this.state.job;

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

            if (window.confirm('Are you sure?')) {
                this.setState({ working: true });
                var job = this.state.job;

                var store = JobsStore.getInstance();
                store.deleteAllTasksForJob(job.ID).then(function () {
                    _this2.setState({ working: false });
                });
            }
        }
    }, {
        key: 'deleteJob',
        value: function deleteJob() {
            var _props = this.props;
            var pydio = _props.pydio;
            var onRequestClose = _props.onRequestClose;
            var _state = this.state;
            var job = _state.job;
            var create = _state.create;

            if (create) {
                return;
            }
            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };
            if (!window.confirm(m('job.delete.confirm'))) {
                return;
            }
            _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                var SchedulerServiceApi = sdk.SchedulerServiceApi;

                var api = new SchedulerServiceApi(PydioApi.getRestClient());
                return api.deleteJob(job.ID);
            }).then(function () {
                onRequestClose(true);
            })['catch'](function (e) {});
        }
    }, {
        key: 'onJobSave',
        value: function onJobSave(job) {
            this.setState({ job: job, create: false });
        }
    }, {
        key: 'onJsonSave',
        value: function onJsonSave(job) {
            var _this3 = this;

            // Artificial redraw : go null and back to job
            this.setState({ job: null, create: false }, function () {
                _this3.setState({ job: job });
            });
        }
    }, {
        key: 'insertTaskLogRow',
        value: function insertTaskLogRow(rows) {
            var _this4 = this;

            var pydio = this.props.pydio;
            var _state2 = this.state;
            var job = _state2.job;
            var descriptions = _state2.descriptions;
            var taskLogs = _state2.taskLogs;

            if (!taskLogs) {
                return rows;
            }
            var insert = [];
            rows.forEach(function (t) {
                insert.push(t);
                if (t.ID === taskLogs.ID) {
                    insert.push({
                        colSpan: true,
                        rowStyle: { borderLeft: '2px solid #1e96f3' },
                        element: _react2['default'].createElement(_TaskActivity2['default'], {
                            pydio: pydio,
                            task: taskLogs,
                            job: job,
                            descriptions: descriptions,
                            onRequestClose: function () {
                                return _this4.setState({ taskLogs: null });
                            }
                        })
                    });
                }
            });
            return insert;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props2 = this.props;
            var pydio = _props2.pydio;
            var jobsEditable = _props2.jobsEditable;
            var onRequestClose = _props2.onRequestClose;
            var _state3 = this.state;
            var selectedRows = _state3.selectedRows;
            var working = _state3.working;
            var mode = _state3.mode;
            var taskLogs = _state3.taskLogs;
            var create = _state3.create;
            var job = _state3.job;
            var showAll = _state3.showAll;

            if (!job) {
                return null;
            }
            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };

            var actionsHeader = _react2['default'].createElement(
                'div',
                { style: { lineHeight: 'initial', marginLeft: 5 } },
                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete-sweep", iconStyle: { color: 'rgba(0,0,0,.3)' }, tooltip: m('tasks.bulk.clear'), primary: true, onTouchTap: this.deleteAll.bind(this), disabled: working })
            );
            var idHeader = _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', marginLeft: -20 } },
                _react2['default'].createElement(
                    'div',
                    { style: { lineHeight: 'initial', marginLeft: 5 } },
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-checkbox-multiple-" + (mode === 'selection' ? 'marked' : 'blank') + "-outline", iconStyle: { color: 'rgba(0,0,0,.3)' }, tooltip: mode === 'selection' ? m('tasks.bulk.disable') : m('tasks.bulk.enable'), primary: true, onTouchTap: function () {
                            _this5.setState({ mode: mode === 'selection' ? 'log' : 'selection', taskLogs: null });
                        }, disabled: working })
                ),
                _react2['default'].createElement(
                    'span',
                    null,
                    m('task.id')
                )
            );

            var keys = [{ name: 'ID', label: idHeader, hideSmall: true, style: { width: 110, fontSize: 15, paddingLeft: 20 }, headerStyle: { width: 110, paddingLeft: 20 }, renderCell: function renderCell(row) {
                    return row.ID.substr(0, 8);
                } }, { name: 'StartTime', style: { width: 100, paddingRight: 10 }, headerStyle: { width: 100, paddingRight: 10 }, label: m('task.start'), renderCell: function renderCell(row) {
                    var m = moment(row.StartTime * 1000);
                    var dateString = undefined;
                    if (m.isSame(Date.now(), 'day')) {
                        dateString = m.format('HH:mm:ss');
                    } else {
                        dateString = m.fromNow();
                    }
                    return dateString;
                } }, { name: 'StatusMessage', label: m('task.message'), hideSmall: true, renderCell: function renderCell(row) {
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
                } }, { name: 'EndTime', style: { width: 100 }, headerStyle: { width: 100 }, label: m('task.duration'), hideSmall: true, renderCell: function renderCell(row) {
                    var e = moment(Date.now());
                    if (row.EndTime) {
                        e = moment(row.EndTime * 1000);
                    }
                    var d = e.diff(moment(row.StartTime * 1000));
                    var f = moment.utc(d);
                    var h = f.format('H');
                    var mn = f.format('m');
                    var ss = f.format('s');
                    if (h === '0' && mn === '0' && ss === '0') {
                        return '< 1s';
                    }
                    return (h === '0' ? '' : h + 'h:') + (h === '0' && mn === '0' ? '' : mn + 'mn:') + ss + 's';
                } }, { name: 'Actions', label: actionsHeader, style: { textAlign: 'right', width: 120, paddingLeft: 0 }, headerStyle: { width: 120, paddingLeft: 0, paddingRight: 20, textAlign: 'right' }, renderCell: this.renderActions.bind(this) }];
            var computeRowStyle = function computeRowStyle(row) {
                if (taskLogs && taskLogs.ID === row.ID) {
                    return {
                        backgroundColor: '#e0e0e0',
                        fontWeight: 500,
                        borderLeft: '2px solid #1e96f3'
                    };
                }
                return null;
            };
            var tasks = job.Tasks || [];
            var runningStatus = ['Running', 'Paused'];

            tasks.sort(function (a, b) {
                if (!a.StartTime || !b.StartTime || a.StartTime === b.StartTime) {
                    return a.ID > b.ID ? 1 : -1;
                }
                return a.StartTime > b.StartTime ? -1 : 1;
            });

            var actions = [];
            if (!create) {
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
                if (jobsEditable) {
                    actions.push(_react2['default'].createElement(_materialUi.FlatButton, { icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-delete" }), label: m('job.delete'), primary: true, onTouchTap: function () {
                            _this5.deleteJob();
                        } }));
                }
            }
            var running = tasks.filter(function (t) {
                return runningStatus.indexOf(t.Status) !== -1;
            });
            running = this.insertTaskLogRow(running);
            var other = tasks.filter(function (t) {
                return runningStatus.indexOf(t.Status) === -1;
            });
            var more = undefined;
            if (!showAll && other.length > 10) {
                more = other.length - 10;
                other = other.slice(0, 10);
            }
            other = this.insertTaskLogRow(other);

            return _react2['default'].createElement(
                'div',
                { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
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
                    _react2['default'].createElement(_JobGraph2['default'], {
                        job: job,
                        random: Math.random(),
                        jobsEditable: jobsEditable,
                        create: create,
                        onJobSave: this.onJobSave.bind(this),
                        onJsonSave: this.onJsonSave.bind(this),
                        onUpdateDescriptions: function (desc) {
                            _this5.setState({ descriptions: desc });
                        }
                    }),
                    !create && _react2['default'].createElement(
                        'div',
                        null,
                        running.length > 0 && _react2['default'].createElement(AdminComponents.SubHeader, { title: m('tasks.running') }),
                        running.length > 0 && _react2['default'].createElement(
                            _materialUi.Paper,
                            { style: { margin: 20 } },
                            _react2['default'].createElement(MaterialTable, {
                                data: running,
                                columns: keys,
                                hideHeaders: true,
                                showCheckboxes: false,
                                emptyStateString: m('tasks.running.empty'),
                                onSelectRows: function (rows) {
                                    if (rows.length === 1 && running.length) {
                                        _this5.setState({ taskLogs: rows[0] });
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
                                deselectOnClickAway: true,
                                computeRowStyle: computeRowStyle
                            }),
                            more && _react2['default'].createElement(
                                'div',
                                { onClick: function () {
                                        _this5.setState({ showAll: true });
                                    }, style: { cursor: 'pointer', textDecoration: 'underline', padding: 20, borderTop: '1px solid #eee' } },
                                m('tasks.history.more').replace('%s', more)
                            )
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
