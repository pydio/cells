/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require("pydio/util/lang");

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _materialUi = require('material-ui');

var ParametersPicker = (function (_React$Component) {
    _inherits(ParametersPicker, _React$Component);

    function ParametersPicker(props) {
        _classCallCheck(this, ParametersPicker);

        _get(Object.getPrototypeOf(ParametersPicker.prototype), "constructor", this).call(this, _extends({ actionsPrefix: '[a] ', parametersPrefix: '' }, props));
        this.state = { filter: null };
        if (this.props.initialSelection) {
            this.state = _extends({ filter: this.props.initialSelection.paramName }, this.props.initialSelection);
        }
    }

    _createClass(ParametersPicker, [{
        key: "filter",
        value: function filter(event) {
            this.setState({ filter: event.target.value.toLowerCase() });
        }
    }, {
        key: "select",
        value: function select(plugin, type, param, attributes) {
            this.props.onSelection(plugin, type, param, attributes);
            this.setState({ pluginName: plugin, type: type, paramName: param });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this = this;

            setTimeout(function () {
                _this.refs.input.focus();
            }, 150);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var allParameters = _props.allParameters;
            var allActions = _props.allActions;

            var term = this.state.filter;
            var selection = this.state.paramName;
            var selectedPlugin = this.state.pluginName;
            var selectionType = this.state.type;

            var filter = function filter(name) {
                if (!term) {
                    return true;
                }
                return name.toLowerCase().indexOf(term) !== -1;
            };

            var highlight = function highlight(name) {
                if (!term) {
                    return name;
                }
                var pos = name.toLowerCase().indexOf(term);
                var start = name.substr(0, pos);
                var middle = name.substr(pos, term.length);
                var end = name.substr(pos + term.length);
                return _react2["default"].createElement(
                    "span",
                    null,
                    start,
                    _react2["default"].createElement(
                        "span",
                        { className: "highlight" },
                        middle
                    ),
                    end
                );
            };

            var entries = [];
            var merge = {};
            Object.keys(allParameters).forEach(function (pName) {
                var _merge$pName$params;

                if (!merge[pName]) {
                    merge[pName] = { name: pName, label: pName, actions: [], params: [] };
                }
                (_merge$pName$params = merge[pName].params).push.apply(_merge$pName$params, _toConsumableArray(allParameters[pName]));
            });
            Object.keys(allActions).forEach(function (pName) {
                var _merge$pName$actions;

                if (!merge[pName]) {
                    merge[pName] = { name: pName, label: pName, actions: [], params: [] };
                }
                (_merge$pName$actions = merge[pName].actions).push.apply(_merge$pName$actions, _toConsumableArray(allActions[pName]));
            });

            var allData = _pydioUtilLang2["default"].objectValues(merge);

            allData.map(function (plugin) {
                var params = [];
                var pluginMatch = false;
                var pluginLabel = plugin.label || plugin.name;
                if (filter(pluginLabel) || filter(plugin.name)) {
                    pluginMatch = true;
                    if (filter(pluginLabel)) {
                        pluginLabel = highlight(pluginLabel);
                    } else if (filter(plugin.name)) {
                        pluginLabel = _react2["default"].createElement(
                            "span",
                            null,
                            pluginLabel,
                            " (",
                            highlight(plugin.name),
                            ")"
                        );
                    }
                }

                plugin.params.concat(plugin.actions).map(function (param) {
                    var name = param.action || param.parameter;
                    var label = param.label || name;
                    var prefix = '';
                    if (param.action) {
                        label = _pydioUtilXml2["default"].XPathGetSingleNodeText(param.xmlNode, "gui/@text") || label;
                        prefix = _this2.props.actionsPrefix;
                    } else {
                        label = param.xmlNode.getAttribute("label") || label;
                        if (_this2.props.parametersPrefix) {
                            prefix = _this2.props.parametersPrefix;
                        }
                    }
                    if (pydio.MessageHash[label]) {
                        label = pydio.MessageHash[label];
                    }
                    var filterLabel = filter(label);
                    var filterName = filter(name);
                    if (filterLabel || filterName || pluginMatch) {
                        var click = function click() {
                            return _this2.select(plugin.name, param.action ? 'action' : 'parameter', name, param);
                        };
                        var selected = (selectedPlugin === '*' || selectedPlugin === plugin.name) && param[selectionType] && selection === name;
                        var highlighted = label;
                        if (filterLabel) {
                            highlighted = highlight(label);
                        } else if (filterName) {
                            highlighted = _react2["default"].createElement(
                                "span",
                                null,
                                label,
                                " (",
                                highlight(name),
                                ") "
                            );
                        }
                        params.push(_react2["default"].createElement(
                            "li",
                            {
                                onClick: click,
                                className: (selected ? "selected " : "") + "parameters-param",
                                key: plugin.name + '-' + (param.action ? 'action' : 'parameter') + '-' + name },
                            prefix,
                            " ",
                            highlighted
                        ));
                    }
                });

                if (params.length) {
                    entries.push(_react2["default"].createElement(
                        "li",
                        { className: "parameters-plugin", key: plugin.name },
                        pluginLabel,
                        _react2["default"].createElement(
                            "ul",
                            null,
                            params
                        )
                    ));
                }
            });

            return _react2["default"].createElement(
                "div",
                null,
                _react2["default"].createElement(
                    "div",
                    { style: { padding: '0 24px', borderBottom: '1px solid #e0e0e0' } },
                    _react2["default"].createElement(_materialUi.TextField, { ref: "input", floatingLabelText: this.props.getMessage('13'), onChange: this.filter.bind(this), fullWidth: true, underlineShow: false })
                ),
                _react2["default"].createElement(
                    "div",
                    { className: "parameters-tree-scroller" },
                    _react2["default"].createElement(
                        "ul",
                        { className: "parameters-tree" },
                        entries
                    )
                )
            );
        }
    }]);

    return ParametersPicker;
})(_react2["default"].Component);

exports["default"] = ParametersPicker;
module.exports = exports["default"];
