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

var _JobsList = require("./JobsList");

var _JobsList2 = _interopRequireDefault(_JobsList);

var _Loader = require('./Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var Dashboard = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return {
            jobs: [],
            Owner: null,
            Filter: null
        };
    },

    reload: function reload() {
        this.loader.load();
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        this.loader = new _Loader2['default']();
        this.loader.observe('loading', function () {
            _this.setState({ loading: true });
        });
        this.loader.observe('loaded', function (memo) {
            _this.setState({ loading: false });
            if (memo.jobs) {
                _this.setState({ jobs: memo.jobs });
            } else if (memo.error) {
                _this.setState({ error: memo.error });
            }
        });
        this.loader.start();
    },

    componentWillUnmount: function componentWillUnmount() {
        this.loader.stop();
    },

    selectRows: function selectRows(rows) {
        if (rows.length) {
            var jobID = rows[0].ID;
            this.loader.stop();
            this.setState({ selectJob: jobID });
        }
    },

    render: function render() {
        var _this2 = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var jobsEditable = _props.jobsEditable;
        var muiTheme = _props.muiTheme;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        };
        var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        var _state = this.state;
        var jobs = _state.jobs;
        var loading = _state.loading;
        var selectJob = _state.selectJob;

        if (selectJob && jobs) {
            var found = jobs.filter(function (j) {
                return j.ID === selectJob;
            });
            console.log(selectJob, found);
            if (found.length) {
                return _react2['default'].createElement(_JobBoard2['default'], {
                    pydio: pydio,
                    job: found[0],
                    jobsEditable: jobsEditable,
                    onSave: function () {
                        _this2.reload();
                    },
                    adminStyles: adminStyles,
                    onRequestClose: function () {
                        _this2.loader.start();
                        _this2.setState({ selectJob: null });
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
                reloadAction: this.reload.bind(this),
                loading: loading
            }),
            _react2['default'].createElement(_JobsList2['default'], {
                pydio: pydio,
                selectRows: function (rows) {
                    _this2.selectRows(rows);
                },
                jobs: jobs,
                loading: loading
            })
        );
    }

});

exports['default'] = Dashboard = (0, _materialUiStyles.muiThemeable)()(Dashboard);
exports['default'] = Dashboard;
module.exports = exports['default'];
