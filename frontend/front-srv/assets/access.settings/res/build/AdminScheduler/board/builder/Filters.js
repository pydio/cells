"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _styles = require("./styles");

var _QueryBuilder = require("./QueryBuilder");

var _QueryBuilder2 = _interopRequireDefault(_QueryBuilder);

var _pydioHttpRestApi = require("pydio/http/rest-api");

var keys = {
    filter: {
        job: { 'NodeEventFilter': _pydioHttpRestApi.JobsNodesSelector, 'UserEventFilter': _pydioHttpRestApi.JobsUsersSelector, 'IdmFilter': _pydioHttpRestApi.JobsIdmSelector },
        action: { 'NodesFilter': _pydioHttpRestApi.JobsNodesSelector, 'UsersFilter': _pydioHttpRestApi.JobsUsersSelector, 'IdmFilter': _pydioHttpRestApi.JobsIdmSelector }
    },
    selector: {
        job: { 'NodesSelector': _pydioHttpRestApi.JobsNodesSelector, 'UsersSelector': _pydioHttpRestApi.JobsUsersSelector, 'IdmSelector': _pydioHttpRestApi.JobsIdmSelector },
        action: { 'NodesSelector': _pydioHttpRestApi.JobsNodesSelector, 'UsersSelector': _pydioHttpRestApi.JobsUsersSelector, 'IdmSelector': _pydioHttpRestApi.JobsIdmSelector }
    }
};

var Filters = (function (_React$Component) {
    _inherits(Filters, _React$Component);

    function Filters() {
        _classCallCheck(this, Filters);

        _get(Object.getPrototypeOf(Filters.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(Filters, [{
        key: "removeFilter",
        value: function removeFilter(data, type, modelType) {
            var _props = this.props;
            var job = _props.job;
            var action = _props.action;
            var onRemoveFilter = _props.onRemoveFilter;
            var onDismiss = _props.onDismiss;

            if (job) {
                onRemoveFilter(job, data, type, modelType);
            } else {
                onRemoveFilter(action, data, type, modelType);
            }
            var stack = keys[type][job ? 'job' : 'action'].map(function (key) {
                return job ? job[key] : action[key];
            }).filter(function (c) {
                return c;
            });
            if (!stack.length) {
                onDismiss();
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this = this;

            var _props2 = this.props;
            var job = _props2.job;
            var action = _props2.action;
            var type = _props2.type;
            var onDismiss = _props2.onDismiss;

            var target = job || action;
            var types = keys[type][job ? 'job' : 'action'];
            var stack = Object.keys(types).map(function (key) {
                var data = job ? job[key] : action[key];
                if (data) {
                    return { key: key, data: data, constructor: types[key] };
                } else {
                    return null;
                }
            }).filter(function (c) {
                return c;
            }).map(function (_ref, index) {
                var key = _ref.key;
                var data = _ref.data;
                var constructor = _ref.constructor;

                return _react2["default"].createElement(_QueryBuilder2["default"], {
                    cloner: function (d) {
                        return constructor.constructFromObject(JSON.parse(JSON.stringify(d)));
                    },
                    query: data,
                    queryType: type,
                    style: { borderBottom: '1px solid #e0e0e0', width: '100%', backgroundColor: '#FAFAFA', borderTop: index === 0 ? '1px solid #e0e0e0' : '' },
                    onRemoveFilter: function (modelType) {
                        _this.removeFilter(data, type, modelType);
                    },
                    onSave: function (newData) {
                        target[key] = newData;
                    }
                });
            });

            var title = undefined;
            if (job) {
                title = 'Input > ';
            } else {
                title = 'Action > ';
            }
            if (type === 'filter') {
                title += ' Filters';
            } else {
                title += ' Selectors';
            }

            return _react2["default"].createElement(
                _styles.RightPanel,
                {
                    width: 600,
                    onDismiss: onDismiss,
                    title: title,
                    icon: type === 'filter' ? 'filter' : 'magnify'
                },
                stack
            );
        }
    }]);

    return Filters;
})(_react2["default"].Component);

exports["default"] = Filters;
module.exports = exports["default"];
