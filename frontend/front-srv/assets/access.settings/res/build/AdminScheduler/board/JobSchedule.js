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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _ScheduleForm = require('./ScheduleForm');

var _ScheduleForm2 = _interopRequireDefault(_ScheduleForm);

var JobSchedule = (function (_React$Component) {
    _inherits(JobSchedule, _React$Component);

    function JobSchedule(props) {
        _classCallCheck(this, JobSchedule);

        _get(Object.getPrototypeOf(JobSchedule.prototype), 'constructor', this).call(this, props);
        var job = this.props.job;

        this.state = {
            open: false,
            job: job,
            rand: Math.random()
        };
    }

    _createClass(JobSchedule, [{
        key: 'updateJob',
        value: function updateJob() {
            var _this = this;

            var onUpdate = this.props.onUpdate;
            var _state = this.state;
            var job = _state.job;
            var formState = _state.formState;

            if (!formState) {
                this.setState({ open: false });
                return;
            }
            var frequency = formState.frequency;

            if (frequency === 'manual') {
                if (job.Schedule !== undefined) {
                    delete job.Schedule;
                }
                job.AutoStart = true;
            } else {
                job.Schedule = { Iso8601Schedule: _ScheduleForm2['default'].makeIso8601FromState(formState) };
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
                    _this.setState({ open: false, job: req.Job, rand: Math.random() });
                })['catch'](function (e) {});
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state2 = this.state;
            var job = _state2.job;
            var rand = _state2.rand;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.FlatButton, { primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-timer" }), key: rand, label: _react2['default'].createElement(_ScheduleForm2['default'], { schedule: job.Schedule, rand: rand }), onTouchTap: function () {
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
                    _react2['default'].createElement(_ScheduleForm2['default'], {
                        schedule: job.Schedule,
                        onChangeState: function (s) {
                            _this2.setState({ formState: s });
                        },
                        edit: true,
                        includeManual: true
                    })
                )
            );
        }
    }]);

    return JobSchedule;
})(_react2['default'].Component);

exports['default'] = JobSchedule;
module.exports = exports['default'];
