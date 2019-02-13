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

var _Pydio$requireLib = _pydio2["default"].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var _Pydio$requireLib2 = _pydio2["default"].requireLib('boot');

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
            this.loadActivity(this.props);
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
            var _this = this;

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
                _this.setState({ activity: response.Logs || [], loading: false });
            })["catch"](function () {
                _this.setState({ activity: [], loading: false });
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
                { style: { height: 600 } },
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
