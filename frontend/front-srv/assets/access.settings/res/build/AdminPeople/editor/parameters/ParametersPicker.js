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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var React = require('react');
var LangUtils = require('pydio/util/lang');

var ParametersPicker = React.createClass({
    displayName: 'ParametersPicker',

    propTypes: {
        allParameters: React.PropTypes.object.isRequired,
        allActions: React.PropTypes.object.isRequired,
        onSelection: React.PropTypes.func.isRequired,
        getMessage: React.PropTypes.func,
        actionsPrefix: React.PropTypes.string,
        parametersPrefix: React.PropTypes.string,
        initialSelection: React.PropTypes.object
    },

    getDefaultProps: function getDefaultProps() {
        return { actionsPrefix: '[a] ', parametersPrefix: '' };
    },

    getInitialState: function getInitialState() {
        var s = { filter: null };
        if (this.props.initialSelection) {
            s = LangUtils.mergeObjectsRecursive({ filter: this.props.initialSelection.paramName }, this.props.initialSelection);
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

        var term = this.state.filter;

        var selection = this.state.paramName;
        var selectedPlugin = this.state.pluginName;
        var selectionType = this.state.type;

        var filter = function filter(name) {
            if (!term) return true;
            return name.toLowerCase().indexOf(term) !== -1;
        };

        var highlight = function highlight(name) {
            if (!term) return name;
            var pos = name.toLowerCase().indexOf(term);
            var start = name.substr(0, pos);
            var middle = name.substr(pos, term.length);
            var end = name.substr(pos + term.length);
            return React.createElement(
                'span',
                null,
                start,
                React.createElement(
                    'span',
                    { className: 'highlight' },
                    middle
                ),
                end
            );
        };

        var entries = [];
        var allData = LangUtils.objectValues(LangUtils.mergeObjectsRecursive(this.props.allParameters, this.props.allActions));
        allData.map((function (plugin) {
            var params = [];
            var pluginMatch = false;
            var pluginLabel = plugin.label || plugin.name;
            if (filter(pluginLabel) || filter(plugin.name)) {
                pluginMatch = true;
                if (filter(pluginLabel)) {
                    pluginLabel = highlight(pluginLabel);
                } else if (filter(plugin.name)) {
                    pluginLabel = React.createElement(
                        'span',
                        null,
                        pluginLabel,
                        ' (',
                        highlight(plugin.name),
                        ')'
                    );
                }
            }

            LangUtils.objectValues(plugin.params).concat(LangUtils.objectValues(plugin.actions)).map((function (param) {
                var label = param.label || param.name;
                var prefix = '';
                if (param._type == 'action') {
                    if (global.pydio.MessageHash[label]) label = global.pydio.MessageHash[label];
                    prefix = this.props.actionsPrefix;
                } else if (this.props.parametersPrefix) {
                    prefix = this.props.parametersPrefix;
                }
                var filterLabel = filter(label);
                var filterName = filter(param.name);
                if (filterLabel || filterName || pluginMatch) {
                    var click = (function () {
                        this.select(plugin.name, param._type, param.name, param);
                    }).bind(this);
                    var selected = (selectedPlugin === '*' || selectedPlugin === plugin.name) && param._type == selectionType && selection == param.name;
                    var highlighted = label;
                    if (filterLabel) {
                        highlighted = highlight(label);
                    } else if (filterName) {
                        highlighted = React.createElement(
                            'span',
                            null,
                            label,
                            ' (',
                            highlight(param.name),
                            ') '
                        );
                    }
                    params.push(React.createElement(
                        'li',
                        {
                            onClick: click,
                            className: (selected ? "selected " : "") + "parameters-param",
                            key: plugin.name + '-' + param._type + '-' + param.name },
                        prefix,
                        ' ',
                        highlighted
                    ));
                }
            }).bind(this));

            if (params.length) {
                entries.push(React.createElement(
                    'li',
                    { className: 'parameters-plugin', key: plugin.name },
                    pluginLabel,
                    React.createElement(
                        'ul',
                        null,
                        params
                    )
                ));
            }
        }).bind(this));

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: 'picker-search-container' },
                React.createElement(ReactMUI.TextField, { floatingLabelText: this.props.getMessage('13'), onChange: this.filter })
            ),
            React.createElement(
                'div',
                { className: 'parameters-tree-scroller' },
                React.createElement(
                    'ul',
                    { className: 'parameters-tree' },
                    entries
                )
            )
        );
    }

});

exports['default'] = ParametersPicker;
module.exports = exports['default'];
