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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var React = require('react');
var debounce = require('lodash.debounce');

var _require = require('material-ui');

var AutoComplete = _require.AutoComplete;
var MenuItem = _require.MenuItem;
var RefreshIndicator = _require.RefreshIndicator;
var FontIcon = _require.FontIcon;

var AutocompleteTree = React.createClass({
    displayName: 'AutocompleteTree',

    mixins: [_mixinsFormMixin2['default']],

    handleUpdateInput: function handleUpdateInput(searchText) {
        this.debounced();
        this.setState({ searchText: searchText });
    },

    handleNewRequest: function handleNewRequest(chosenValue) {
        var key = undefined;
        if (chosenValue.key !== undefined) {
            key = chosenValue.key;
        } else {
            key = chosenValue;
        }
        this.onChange(null, key);
        this.loadValues(key);
    },

    componentWillMount: function componentWillMount() {
        this.debounced = debounce(this.loadValues.bind(this), 300);
        this.lastSearch = null;
        var value = "";
        if (this.props.value) {
            value = this.props.value;
        }
        this.loadValues(value);
    },

    loadValues: function loadValues() {
        var value = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

        var basePath = value;
        if (!value && this.state.searchText) {
            var last = this.state.searchText.lastIndexOf('/');
            basePath = this.state.searchText.substr(0, last);
        }
        if (this.lastSearch !== null && this.lastSearch === basePath) {
            return;
        }
        this.lastSearch = basePath;
        // TODO : load values from service
    },

    render: function render() {

        var dataSource = [];
        if (this.state && this.state.nodes) {
            this.state.nodes.forEach(function (node) {
                var icon = "mdi mdi-folder";
                if (node.uuid.startsWith("DATASOURCE:")) {
                    icon = "mdi mdi-database";
                }
                dataSource.push({
                    key: node.path,
                    text: node.path,
                    value: React.createElement(
                        MenuItem,
                        null,
                        React.createElement(FontIcon, { className: icon, color: '#616161', style: { float: 'left', marginRight: 8 } }),
                        ' ',
                        node.path
                    )
                });
            });
        }

        var displayText = this.state.value;

        return React.createElement(
            'div',
            { className: 'pydioform_autocomplete', style: { position: 'relative' } },
            !dataSource.length && React.createElement(RefreshIndicator, {
                size: 30,
                right: 10,
                top: 0,
                status: 'loading'
            }),
            React.createElement(AutoComplete, {
                fullWidth: true,
                searchText: displayText,
                onUpdateInput: this.handleUpdateInput,
                onNewRequest: this.handleNewRequest,
                dataSource: dataSource,
                floatingLabelText: this.props.attributes['label'],
                filter: function (searchText, key) {
                    return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                },
                openOnFocus: true,
                menuProps: { maxHeight: 200 }
            })
        );
    }

});

exports['default'] = AutocompleteTree;
module.exports = exports['default'];
