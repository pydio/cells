'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilHasher = require('pydio/util/hasher');

var _pydioUtilHasher2 = _interopRequireDefault(_pydioUtilHasher);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var styles = {
    selected: {
        backgroundColor: "#eeeeee"
    },
    valid: {
        backgroundColor: "rgba(0, 171, 102, 0.1)"
    },
    invalid: {
        backgroundColor: "#ffebee"
    }
};

var Pydio8Workspaces = (function (_React$Component) {
    _inherits(Pydio8Workspaces, _React$Component);

    function Pydio8Workspaces() {
        _classCallCheck(this, Pydio8Workspaces);

        _get(Object.getPrototypeOf(Pydio8Workspaces.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Pydio8Workspaces, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var workspaces = _props.workspaces;
            var isInvalid = _props.isInvalid;
            var isValid = _props.isValid;
            var selected = _props.selected;
            var onSelect = _props.onSelect;
            var onHover = _props.onHover;

            return _react2['default'].createElement(
                _materialUi.List,
                { style: { flex: 1, display: "flex", flexDirection: "column" } },
                workspaces.map(function (workspace, idx) {
                    return _react2['default'].createElement(Workspace, {
                        style: { flex: 1 },
                        workspace: workspace,
                        valid: isValid(workspace),
                        invalid: isInvalid(workspace),
                        selected: selected === workspace,
                        onSelect: function (ws) {
                            return onSelect(ws);
                        }, onHover: function (ws) {
                            return onHover(ws);
                        }
                    });
                })
            );
        }
    }], [{
        key: 'toString',
        value: function toString(_ref) {
            var type = _ref.accessType;
            var _ref$parameters = _ref.parameters;
            var parameters = _ref$parameters === undefined ? {} : _ref$parameters;

            switch (type) {
                case "s3":
                    return parameters['STORAGE_URL'] ? "S3-compatible storage URL" : "Amazon S3";

                    break;
                default:
                    return parameters['PATH'];
            }
        }
    }, {
        key: 'extractPath',
        value: function extractPath(_ref2) {
            var type = _ref2.accessType;
            var _ref2$parameters = _ref2.parameters;
            var parameters = _ref2$parameters === undefined ? {} : _ref2$parameters;

            if (type === "fs") {
                return parameters['PATH'];
            } else {
                var parts = [];

                parts.push(parameters['STORAGE_URL'] ? 'custom:' + _pydioUtilHasher2['default'].base64_encode(parameters['STORAGE_URL']) : 's3');
                parts.push(parameters['API_KEY'], parameters['SECRET_KEY']);
                parts.push(parameters['CONTAINER']);

                if (parameters['PATH']) {
                    var paths = _pydioUtilLang2['default'].trim(parameters['PATH'], '/').split('/');
                    parts.push.apply(parts, _toConsumableArray(paths));
                }

                return parts.join('/');
            }
        }
    }]);

    return Pydio8Workspaces;
})(_react2['default'].Component);

var Workspace = (function (_React$Component2) {
    _inherits(Workspace, _React$Component2);

    function Workspace() {
        _classCallCheck(this, Workspace);

        _get(Object.getPrototypeOf(Workspace.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Workspace, [{
        key: 'handleSelect',
        value: function handleSelect(ws) {
            var _props2 = this.props;
            var workspace = _props2.workspace;
            var selected = _props2.selected;
            var onSelect = _props2.onSelect;

            if (!selected) {
                onSelect(workspace);
            } else {
                onSelect(null);
            }
        }
    }, {
        key: 'handleHover',
        value: function handleHover() {
            var _props3 = this.props;
            var workspace = _props3.workspace;
            var selected = _props3.selected;
            var onHover = _props3.onHover;

            if (selected) {
                return;
            }

            onHover(workspace);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props4 = this.props;
            var workspace = _props4.workspace;
            var valid = _props4.valid;
            var invalid = _props4.invalid;
            var selected = _props4.selected;

            var style = this.props.style;

            if (selected) {
                style = _extends({}, style, styles.selected);
            }

            if (valid) {
                style = _extends({}, style, styles.valid);
            } else if (invalid) {
                style = _extends({}, style, styles.invalid);
            }

            return _react2['default'].createElement(_materialUi.ListItem, {
                leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-database" }),
                primaryText: workspace.display,
                secondaryText: Pydio8Workspaces.toString(workspace),
                style: style,
                onMouseOver: function () {
                    return _this.handleHover();
                },
                onTouchTap: function () {
                    return _this.handleSelect();
                }
            });
        }
    }]);

    return Workspace;
})(_react2['default'].Component);

exports['default'] = Pydio8Workspaces;
module.exports = exports['default'];
