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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUiStyles = require('material-ui/styles');

var _JobBoard = require('./JobBoard');

var _JobBoard2 = _interopRequireDefault(_JobBoard);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _JobsList = require("./JobsList");

var _JobsList2 = _interopRequireDefault(_JobsList);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;

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

    render: function render() {
        var _this5 = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var jobsEditable = _props.jobsEditable;
        var muiTheme = _props.muiTheme;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        };
        var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        var _state2 = this.state;
        var result = _state2.result;
        var loading = _state2.loading;
        var selectJob = _state2.selectJob;

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
                    adminStyles: adminStyles,
                    onRequestClose: function (refresh) {
                        _this5.setState({ selectJob: null });
                        if (refresh) {
                            _this5.load();
                        }
                    }
                });
            }
        }

        return _react2['default'].createElement(
            'div',
            { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
            _react2['default'].createElement(AdminComponents.Header, {
                title: m('title'),
                icon: 'mdi mdi-timetable',
                reloadAction: this.load.bind(this),
                loading: loading
            }),
            _react2['default'].createElement(_JobsList2['default'], {
                pydio: pydio,
                selectRows: function (rows) {
                    _this5.selectRows(rows);
                },
                jobs: result ? result.Jobs : [],
                loading: loading
            })
        );
    }

});

exports['default'] = Dashboard = (0, _materialUiStyles.muiThemeable)()(Dashboard);
exports['default'] = Dashboard;
module.exports = exports['default'];
