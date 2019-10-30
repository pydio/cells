'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Ws2RootNodes = (function (_React$Component) {
    _inherits(Ws2RootNodes, _React$Component);

    function Ws2RootNodes() {
        _classCallCheck(this, Ws2RootNodes);

        _get(Object.getPrototypeOf(Ws2RootNodes.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Ws2RootNodes, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.component = AdminWorkspaces.WsAutoComplete;
        }
    }, {
        key: 'T',
        value: function T(id) {
            return Pydio.getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var style = _props.style;
            var workspaces = _props.workspaces;
            var paths = _props.paths;
            var onSelect = _props.onSelect;
            var onError = _props.onError;

            if (!this.component) {
                return null;
            }

            var Tag = this.component;

            return _react2['default'].createElement(
                _materialUi.List,
                { style: _extends({}, style, { minWidth: 400 }) },
                paths.map(function (path, idx) {
                    return _react2['default'].createElement(
                        _materialUi.ListItem,
                        { innerDivStyle: { height: "72px", padding: "0 16px", display: "flex" }, disabled: true },
                        path && _react2['default'].createElement(Tag, {
                            pydio: pydio,
                            key: path,
                            style: { backgroundColor: "#ffffff", width: 400, margin: 0, padding: 0 },
                            value: path,
                            validateOnLoad: true,
                            onChange: function (key, node) {
                                return onSelect(workspaces[idx], _defineProperty({}, key, node));
                            },
                            onError: function () {
                                return onError(workspaces[idx]);
                            }
                        }) || _react2['default'].createElement(
                            'span',
                            { style: { display: "flex", fontStyle: "italic", height: "72px", alignItems: "center" } },
                            _this.T('step.mapper.invalid')
                        )
                    );
                })
            );
        }
    }]);

    return Ws2RootNodes;
})(_react2['default'].Component);

exports['default'] = Ws2RootNodes;
module.exports = exports['default'];
