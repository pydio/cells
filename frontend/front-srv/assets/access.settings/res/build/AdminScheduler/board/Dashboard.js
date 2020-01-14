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

var _builderTriggers = require('./builder/Triggers');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib2.MaterialTable;

var _Pydio$requireLib3 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib3.ModernTextField;

var Dashboard = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

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

    extractRowsInfo: function extractRowsInfo(jobs, m) {

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
                data.SortValue = '0-' + job.Label;
            } else if (job.EventNames) {
                data.SortValue = '1-' + job.Label;
                data.Trigger = _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement('span', { className: "mdi mdi-pulse", title: m('trigger.events'), style: { color: '#4caf50' } }),
                    ' ',
                    job.EventNames.map(function (e) {
                        return _builderTriggers.Events.eventLabel(e, m);
                    }).join(', ')
                );
            } else {
                data.Trigger = _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement('span', { className: "mdi mdi-gesture-tap", style: { color: '#607d8b' } }),
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
                data.Trigger = _react2['default'].createElement(
                    'span',
                    { style: { opacity: 0.43 } },
                    data.Trigger
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
    },

    jobPrompted: function jobPrompted() {
        var newJobLabel = this.state.newJobLabel;

        var newJob = _pydioHttpRestApi.JobsJob.constructFromObject({
            ID: (0, _uuid42['default'])(),
            Label: newJobLabel,
            Owner: 'pydio.system.user',
            Actions: []
        });
        this.setState({ createJob: newJob, promptJob: false, newJobLabel: '' });
    },

    render: function render() {
        var _this5 = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var jobsEditable = _props.jobsEditable;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        };

        var keys = [{
            name: 'Label',
            label: m('job.label'),
            style: { width: '40%', fontSize: 15 },
            headerStyle: { width: '40%' }
        }, {
            name: 'Trigger',
            label: m('job.trigger'),
            style: { width: '20%' },
            headerStyle: { width: '20%' },
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
                        _this5.setState({ selectJob: row.ID });
                    } });
            }
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

        var _state2 = this.state;
        var result = _state2.result;
        var loading = _state2.loading;
        var selectJob = _state2.selectJob;
        var createJob = _state2.createJob;
        var promptJob = _state2.promptJob;
        var newJobLabel = _state2.newJobLabel;

        if (selectJob && result && result.Jobs) {
            var found = result.Jobs.filter(function (j) {
                return j.ID === selectJob;
            });
            if (found.length) {
                return _react2['default'].createElement(_JobBoard2['default'], {
                    pydio: pydio,
                    job: found[0],
                    jobsEditable: jobsEditable,
                    onSave: function () {
                        _this5.load(true);
                    },
                    onRequestClose: function (refresh) {
                        _this5.setState({ selectJob: null });
                        if (refresh) {
                            _this5.load();
                        }
                    }
                });
            }
        } else if (createJob) {
            return _react2['default'].createElement(_JobBoard2['default'], {
                pydio: pydio,
                job: createJob,
                create: true,
                jobsEditable: jobsEditable,
                onSave: function () {
                    _this5.load(true);
                },
                onRequestClose: function () {
                    return _this5.setState({ createJob: null });
                }
            });
        }

        var _extractRowsInfo = this.extractRowsInfo(result ? result.Jobs : [], m);

        var system = _extractRowsInfo.system;
        var other = _extractRowsInfo.other;

        system.sort(function (a, b) {
            return a.SortValue === b.SortValue ? 0 : a.SortValue > b.SortValue ? 1 : -1;
        });
        var actions = [];
        if (jobsEditable) {
            actions.push(_react2['default'].createElement(_materialUi.FlatButton, { label: "+ Job", onTouchTap: function () {
                    _this5.setState({ promptJob: true });
                } }));
        }

        return _react2['default'].createElement(
            'div',
            { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
            _react2['default'].createElement(
                _materialUi.Dialog,
                {
                    title: "Create a new Job",
                    onRequestClose: function () {
                        _this5.setState({ promptJob: false });
                    },
                    open: promptJob,
                    contentStyle: { width: 300 },
                    actions: [_react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            _this5.setState({ promptJob: false });
                        }, label: "Cancel" }), _react2['default'].createElement(_materialUi.FlatButton, { primary: true, onTouchTap: function () {
                            _this5.jobPrompted();
                        }, disabled: !newJobLabel, label: "Create" })]
                },
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(ModernTextField, {
                        fullWidth: true,
                        hintText: "New Job Label",
                        value: newJobLabel,
                        onChange: function (e, v) {
                            _this5.setState({ newJobLabel: v });
                        },
                        onKeyPress: function (e) {
                            if (e.Key === 'Enter') _this5.jobPrompted();
                        }
                    })
                )
            ),
            _react2['default'].createElement(AdminComponents.Header, {
                title: m('title'),
                icon: 'mdi mdi-timetable',
                actions: actions,
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
                            _this5.selectRows(rows);
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
                        columns: userKeys,
                        onSelectRows: function (rows) {
                            _this5.selectRows(rows);
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
