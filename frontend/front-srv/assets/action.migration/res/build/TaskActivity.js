"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

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
        key: "T",
        value: function T(id) {
            return this.props.pydio.MessageHash['migration.' + id] || id;
        }
    }, {
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
            return _pydioHttpResourcesManager2["default"].loadClass('EnterpriseSDK').then(function (sdk) {

                var request = new _pydioHttpRestApi.LogListLogRequest();
                request.Query = "+OperationUuid:\"" + operationId + "\"";
                request.Page = 0;
                request.Size = 100;
                request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject('JSON');
                var api = new sdk.EnterpriseLogServiceApi(_pydioHttpApi2["default"].getRestClient());
                _this.setState({ loading: true });
                api.audit(request).then(function (response) {
                    _this.setState({ activity: response.Logs || [], loading: false });
                })["catch"](function () {
                    _this.setState({ activity: [], loading: false });
                });
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var task = _props.task;
            var styles = _props.styles;
            var activity = this.state.activity;

            var columns = [{ name: 'Ts', label: pydio.MessageHash['settings.17'], style: { width: '25%' }, headerStyle: { width: '25%' }, renderCell: function renderCell(row) {
                    return moment(row.Ts * 1000).fromNow();
                } }, { name: 'Msg', label: pydio.MessageHash['ajxp_admin.logs.message'] }];
            return _react2["default"].createElement(
                "div",
                { className: "vertical-layout", style: { height: '100%' } },
                _react2["default"].createElement(
                    "div",
                    { style: _extends({}, styles.body.block.headerFull) },
                    this.T('logs.legend').replace("%s", task.ID)
                ),
                _react2["default"].createElement(
                    "div",
                    { className: "layout-fill vertical-layout" },
                    _react2["default"].createElement(MaterialTable, {
                        columns: columns,
                        data: activity,
                        showCheckboxes: false,
                        emptyStateString: this.T('logs.empty')
                    })
                )
            );
        }
    }]);

    return TaskActivity;
})(_react2["default"].Component);

exports["default"] = TaskActivity;
module.exports = exports["default"];
