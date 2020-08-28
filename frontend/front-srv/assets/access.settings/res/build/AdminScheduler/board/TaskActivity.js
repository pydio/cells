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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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
        this.state = {
            activity: [],
            loading: false,
            page: 0
        };
    }

    _createClass(TaskActivity, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this = this;

            this.loadActivity(this.props);
            this._loadDebounced = (0, _lodashDebounce2["default"])(function (jobId) {
                if (jobId && _this.props.task && _this.props.task.JobID === jobId) {
                    _this.loadActivity(_this.props);
                }
            }, 500);
            JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
            var poll = this.props.poll;

            if (poll) {
                this._interval = window.setInterval(function () {
                    _this.loadActivity(_this.props);
                }, poll);
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (this._loadDebounced) {
                JobsStore.getInstance().stopObserving("tasks_updated", this._loadDebounced);
            }
            if (this._interval) {
                window.clearInterval(this._interval);
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

            var page = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
            var task = props.task;

            if (!task) {
                return;
            }
            var operationId = task.JobID + '-' + task.ID.substr(0, 8);
            var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2["default"].getRestClient());

            var request = new _pydioHttpRestApi.LogListLogRequest();
            request.Query = "+OperationUuid:\"" + operationId + "\"";
            request.Page = page;
            request.Size = 200;
            request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject('JSON');
            this.setState({ loading: true });
            api.listTasksLogs(request).then(function (response) {
                var ll = response.Logs || [];
                _this2.setState({ activity: ll, loading: false, page: page });
            })["catch"](function () {
                _this2.setState({ activity: [], loading: false, page: page });
            });
        }
    }, {
        key: "computeTag",
        value: function computeTag(row) {
            var _props = this.props;
            var job = _props.job;
            var descriptions = _props.descriptions;

            var pathTag = {
                backgroundColor: '#1e96f3',
                fontSize: 11,
                fontWeight: 500,
                color: 'white',
                padding: '0 8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderRadius: 4,
                textAlign: 'center'
            };
            var path = row.SchedulerTaskActionPath;
            if (!path) {
                return null;
            }
            if (path === 'ROOT') {
                // Special case for trigger
                return _react2["default"].createElement(
                    "div",
                    { style: _extends({}, pathTag, { backgroundColor: 'white', color: 'rgba(0,0,0,.87)', border: '1px solid #e0e0e0' }) },
                    "Trigger"
                );
            }
            var action = undefined;
            try {
                action = this.findAction(path, job.Actions);
            } catch (e) {
                //console.error(e);
            }
            if (action) {
                if (action.Label) {
                    path = action.Label;
                } else if (descriptions && descriptions[action.ID]) {
                    path = descriptions[action.ID].Label;
                }
            } else {
                var last = path.split('/').pop();
                var actionId = last.split('$').shift();
                if (descriptions && descriptions[actionId]) {
                    path = descriptions[actionId].Label;
                }
            }
            return _react2["default"].createElement(
                "div",
                { style: pathTag },
                path
            );
        }
    }, {
        key: "findAction",
        value: function findAction(path, actions) {
            var parts = path.split('/');
            var first = parts.shift();
            var actionId = [].concat(_toConsumableArray(parts)).shift();
            var chainIndex = parseInt(actionId.split('$')[1]);
            var action = actions[chainIndex];
            var nextActions = undefined;
            if (actionId.indexOf('$FAIL') === -1) {
                nextActions = action.ChainedActions;
            } else {
                nextActions = action.FailedFilterActions;
            }
            if (parts.length > 1) {
                // Move on step forward
                return this.findAction(parts.join('/'), nextActions);
            } else {
                return action;
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var _props2 = this.props;
            var pydio = _props2.pydio;
            var onRequestClose = _props2.onRequestClose;
            var _state = this.state;
            var activity = _state.activity;
            var loading = _state.loading;
            var page = _state.page;

            var cellBg = "#f5f5f5";
            var lineHeight = 32;
            var columns = [{ name: 'SchedulerTaskActionPath', label: '', hideSmall: true, style: { width: 110, height: lineHeight, backgroundColor: cellBg, paddingLeft: 12, paddingRight: 0, userSelect: 'text' }, headerStyle: { width: 110, paddingLeft: 12, paddingRight: 0 }, renderCell: function renderCell(row) {
                    return _this3.computeTag(row);
                } }, { name: 'Ts', label: pydio.MessageHash['settings.17'], style: { width: 100, height: lineHeight, backgroundColor: cellBg, paddingRight: 10, userSelect: 'text' }, headerStyle: { width: 100, paddingRight: 10 }, renderCell: function renderCell(row) {
                    var m = moment(row.Ts * 1000);
                    return m.format('HH:mm:ss');
                } }, { name: 'Msg', label: pydio.MessageHash['ajxp_admin.logs.message'], style: { height: lineHeight, backgroundColor: cellBg, userSelect: 'text' } }];
            return _react2["default"].createElement(
                "div",
                { style: { paddingTop: 12, paddingBottom: 10, backgroundColor: cellBg } },
                _react2["default"].createElement(
                    "div",
                    { style: { padding: '0 24px 10px', fontWeight: 500, backgroundColor: cellBg, display: 'flex', alignItems: 'center' } },
                    _react2["default"].createElement(
                        "div",
                        null,
                        pydio.MessageHash['ajxp_admin.scheduler.tasks.activity.title']
                    ),
                    _react2["default"].createElement(
                        "div",
                        { style: { flex: 1, textAlign: 'center', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                        page > 0 && _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-chevron-left", color: "rgba(0,0,0,.7)", style: { cursor: 'pointer' }, onClick: function () {
                                _this3.loadActivity(_this3.props, page - 1);
                            } }),
                        (page > 0 || activity.length >= 200) && _react2["default"].createElement(
                            "span",
                            { style: { fontSize: 12 } },
                            pydio.MessageHash[331],
                            " ",
                            loading ? _react2["default"].createElement(_materialUi.CircularProgress, { size: 16, thickness: 1.5 }) : _react2["default"].createElement(
                                "span",
                                null,
                                page + 1
                            )
                        ),
                        activity.length >= 200 && _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-chevron-right", color: "rgba(0,0,0,.7)", style: { cursor: 'pointer' }, onClick: function () {
                                _this3.loadActivity(_this3.props, page + 1);
                            } })
                    ),
                    _react2["default"].createElement(
                        "div",
                        { style: { paddingRight: 15, cursor: "pointer" }, onClick: onRequestClose },
                        _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-close", color: "rgba(0,0,0,.3)", style: { fontSize: 16 } })
                    )
                ),
                _react2["default"].createElement(MaterialTable, {
                    hideHeaders: true,
                    columns: columns,
                    data: activity,
                    showCheckboxes: false,
                    emptyStateString: loading ? _react2["default"].createElement(
                        "div",
                        { style: { display: 'flex', alignItems: 'center' } },
                        " ",
                        _react2["default"].createElement(_materialUi.CircularProgress, { size: 16, thickness: 1.5 }),
                        " ",
                        _react2["default"].createElement(
                            "span",
                            { style: { flex: 1, marginLeft: 5 } },
                            pydio.MessageHash['ajxp_admin.scheduler.tasks.activity.loading']
                        )
                    ) : pydio.MessageHash['ajxp_admin.scheduler.tasks.activity.empty'],
                    emptyStateStyle: { backgroundColor: cellBg },
                    computeRowStyle: function (row) {
                        return { borderBottomColor: '#fff', height: lineHeight };
                    }
                })
            );
        }
    }]);

    return TaskActivity;
})(_react2["default"].Component);

exports["default"] = TaskActivity;
module.exports = exports["default"];
