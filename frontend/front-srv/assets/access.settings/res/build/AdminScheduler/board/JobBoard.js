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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _TasksList = require('./TasksList');

var _TasksList2 = _interopRequireDefault(_TasksList);

var _JobSchedule = require('./JobSchedule');

var _JobSchedule2 = _interopRequireDefault(_JobSchedule);

var _Loader = require("./Loader");

var _Loader2 = _interopRequireDefault(_Loader);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;

var JobBoard = (function (_React$Component) {
    _inherits(JobBoard, _React$Component);

    function JobBoard(props) {
        var _this = this;

        _classCallCheck(this, JobBoard);

        _get(Object.getPrototypeOf(JobBoard.prototype), 'constructor', this).call(this, props);
        this.state = {
            mode: 'log', // 'log' or 'selection'
            selectedRows: [],
            loading: false,
            taskLogs: null,
            job: props.job,
            create: props.create,
            descriptions: {}
        };
        this.loader = new _Loader2['default'](props.job.ID);
        this.loader.observe('loaded', function (memo) {
            if (memo.job) {
                _this.setState({ job: memo.job, error: null });
            } else if (memo.error) {
                _this.setState({ error: memo.error });
            }
        });
    }

    _createClass(JobBoard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.loader.start();
            // Load descriptions
            var api = new _cellsSdk.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.schedulerActionsDiscovery().then(function (data) {
                _this2.setState({ descriptions: data.Actions });
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.loader.stop();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var jobsEditable = _props.jobsEditable;
            var onRequestClose = _props.onRequestClose;
            var adminStyles = _props.adminStyles;
            var _state = this.state;
            var loading = _state.loading;
            var create = _state.create;
            var job = _state.job;
            var descriptions = _state.descriptions;

            if (!job) {
                return null;
            }
            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };

            var actions = [];
            var flatProps = _extends({}, adminStyles.props.header.flatButton);
            var iconColor = adminStyles.props.header.flatButton.labelStyle.color;
            if (!create) {
                if (!job.EventNames) {
                    if (jobsEditable) {
                        actions.push(_react2['default'].createElement(_JobSchedule2['default'], { job: job, edit: true, onUpdate: function () {} }));
                    }
                    var bProps = _extends({}, flatProps);
                    if (job.Inactive) {
                        bProps.backgroundColor = '#e0e0e0';
                    }
                    actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-play", color: iconColor }), label: m('task.action.run'), disabled: job.Inactive, primary: true, onTouchTap: function () {
                            JobsStore.getInstance().controlJob(job, 'RunOnce');
                        } }, bProps)));
                }
                if (job.Inactive) {
                    actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-checkbox-marked-circle-outline", color: iconColor }), label: m('task.action.enable'), primary: true, onTouchTap: function () {
                            JobsStore.getInstance().controlJob(job, 'Active');
                        } }, flatProps)));
                } else {
                    actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-checkbox-blank-circle-outline", color: iconColor }), label: m('task.action.disable'), primary: true, onTouchTap: function () {
                            JobsStore.getInstance().controlJob(job, 'Inactive');
                        } }, flatProps)));
                }
            }

            return _react2['default'].createElement(
                'div',
                { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
                _react2['default'].createElement(AdminComponents.Header, {
                    title: _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement(
                            'a',
                            { style: { cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,.87)' }, onTouchTap: function () {
                                    return onRequestClose(true);
                                } },
                            pydio.MessageHash['ajxp_admin.scheduler.title']
                        ),
                        ' / ',
                        job.Label,
                        ' ',
                        job.Inactive ? ' [disabled]' : ''
                    ),
                    backButtonAction: function () {
                        return onRequestClose(true);
                    },
                    actions: actions,
                    loading: loading
                }),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, overflowY: 'auto' } },
                    _react2['default'].createElement(_TasksList2['default'], {
                        pydio: pydio,
                        job: job,
                        onLoading: function (l) {
                            _this3.setState({ loading: l });
                        },
                        descriptions: descriptions,
                        adminStyles: adminStyles
                    })
                )
            );
        }
    }]);

    return JobBoard;
})(_react2['default'].Component);

exports['default'] = JobBoard;
module.exports = exports['default'];
