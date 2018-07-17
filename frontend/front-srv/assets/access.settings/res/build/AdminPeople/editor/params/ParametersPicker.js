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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require("pydio/util/lang");

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _materialUi = require('material-ui');

var ParametersPicker = _react2["default"].createClass({
    displayName: "ParametersPicker",

    propTypes: {
        allParameters: _react2["default"].PropTypes.object.isRequired,
        allActions: _react2["default"].PropTypes.object.isRequired,
        onSelection: _react2["default"].PropTypes.func.isRequired,
        getMessage: _react2["default"].PropTypes.func,
        actionsPrefix: _react2["default"].PropTypes.string,
        parametersPrefix: _react2["default"].PropTypes.string,
        initialSelection: _react2["default"].PropTypes.object
    },

    getDefaultProps: function getDefaultProps() {
        return { actionsPrefix: '[a] ', parametersPrefix: '' };
    },

    getInitialState: function getInitialState() {
        var s = { filter: null };
        if (this.props.initialSelection) {
            s = _pydioUtilLang2["default"].mergeObjectsRecursive({ filter: this.props.initialSelection.paramName }, this.props.initialSelection);
        }
        return s;
    },

    filter: function filter(event) {
        this.setState({ filter: event.target.value.toLowerCase() });
    },

    select: function select(plugin, type, param, attributes) {
        this.props.onSelection(plugin, type, param, attributes);
        this.setState({ pluginName: plugin, type: type, paramName: param });
    },

    render: function render() {
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

        allData.map((function (plugin) {
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

            plugin.params.concat(plugin.actions).map((function (param) {
                var name = param.action || param.parameter;
                var label = param.label || name;
                var prefix = '';
                if (param.action) {
                    label = _pydioUtilXml2["default"].XPathGetSingleNodeText(param.xmlNode, "gui/@text") || label;
                    prefix = this.props.actionsPrefix;
                } else {
                    label = param.xmlNode.getAttribute("label") || label;
                    if (this.props.parametersPrefix) {
                        prefix = this.props.parametersPrefix;
                    }
                }
                if (pydio.MessageHash[label]) {
                    label = pydio.MessageHash[label];
                }
                var filterLabel = filter(label);
                var filterName = filter(name);
                if (filterLabel || filterName || pluginMatch) {
                    var click = (function () {
                        this.select(plugin.name, param.action ? 'action' : 'parameter', name, param);
                    }).bind(this);
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
            }).bind(this));

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
        }).bind(this));

        return _react2["default"].createElement(
            "div",
            null,
            _react2["default"].createElement(
                "div",
                { className: "picker-search-container" },
                _react2["default"].createElement(_materialUi.TextField, { floatingLabelText: this.props.getMessage('13'), onChange: this.filter })
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

});

exports["default"] = ParametersPicker;
module.exports = exports["default"];
