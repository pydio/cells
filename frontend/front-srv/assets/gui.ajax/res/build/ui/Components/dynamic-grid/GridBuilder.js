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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;
var AsyncComponent = _Pydio$requireLib.AsyncComponent;

var GridBuilder = React.createClass({
    displayName: 'GridBuilder',

    propTypes: {
        namespaces: React.PropTypes.array,
        onCreateCard: React.PropTypes.func,
        onEditStatusChange: React.PropTypes.func
    },

    getInitialState: function getInitialState() {
        return {
            selectedIndex: 0,
            availableWidgets: this.listAvailableWidgets()
        };
    },

    listAvailableWidgets: function listAvailableWidgets() {
        var secondPass = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        var widgets = [];
        var additionalNamespaces = [];
        this.props.namespaces.map(function (ns) {
            if (!global[ns]) {
                additionalNamespaces.push(ns);
                return;
            }
            for (var k in global[ns]) {
                if (global[ns].hasOwnProperty(k)) {
                    var widgetClass = global[ns][k];
                    if (widgetClass.hasBuilderFields && widgetClass.hasBuilderFields()) {
                        widgets.push({ reactClass: widgetClass, fullName: ns + '.' + widgetClass.displayName });
                    }
                }
            }
        });
        if (additionalNamespaces.length && !secondPass) {
            ResourcesManager.loadClassesAndApply(additionalNamespaces, (function () {
                this.setState({
                    availableWidgets: this.listAvailableWidgets(true)
                });
            }).bind(this));
        }
        return widgets;
    },

    onDropDownChange: function onDropDownChange(event, index, item) {
        var defaultValues = {};
        if (index != 0) {
            item.payload['reactClass'].getBuilderFields().map(function (f) {
                if (f['default']) defaultValues[f.name] = f['default'];
            });
        }
        if (this.props.onEditStatusChange) {
            this.props.onEditStatusChange(index != 0);
        }
        this.setState({
            selectedIndex: index,
            selectedWidget: item.payload,
            currentFormValues: defaultValues
        });
    },

    cancel: function cancel() {
        if (this.props.onEditStatusChange) {
            this.props.onEditStatusChange(false);
        }
        this.setState({ selectedIndex: 0 });
    },

    onFormValueChange: function onFormValueChange(newValues) {
        this.setState({ currentFormValues: newValues });
    },

    onFormSubmit: function onFormSubmit() {
        var values = this.state.currentFormValues;
        var selectedWidget = this.state.selectedWidget;
        var title = values.title ? values.title : values.legend;
        if (!title) title = this.state.selectedWidget['reactClass'].builderDisplayName;
        this.props.onCreateCard({
            componentClass: selectedWidget.fullName,
            title: title,
            props: values
        });
        this.cancel();
    },

    resetLayout: function resetLayout() {
        if (window.confirm(this.props.getMessage('home.51'))) {
            this.props.onResetLayout();
        }
    },

    render: function render() {
        var getMessage = this.props.getMessage;

        var selectorItems = [{ payload: 0, text: getMessage('home.50') }].concat(this.state.availableWidgets.map(function (w, index) {
            return { payload: w, text: w['reactClass'].builderDisplayName };
        }));

        var selector = React.createElement(ReactMUI.DropDownMenu, {
            menuItems: selectorItems,
            onChange: this.onDropDownChange,
            selectedIndex: this.state.selectedIndex,
            autoWidth: false,
            className: 'widget-type-selector'
        });

        var form, add;
        if (this.state.selectedIndex != 0) {
            var fields = this.state.selectedWidget['reactClass'].getBuilderFields();
            var defaultValues = {};
            fields.map(function (f) {
                if (f['default']) defaultValues[f.name] = f['default'];
            });
            if (this.state.currentFormValues) {
                defaultValues = LangUtils.mergeObjectsRecursive(defaultValues, this.state.currentFormValues);
            }
            form = React.createElement(AsyncComponent, {
                namespace: 'PydioForm',
                componentName: 'FormPanel',
                parameters: fields,
                depth: -1,
                values: defaultValues,
                onChange: this.onFormValueChange
            });
            add = React.createElement(
                'div',
                { style: { textAlign: 'center', paddingBottom: 100 } },
                React.createElement(ReactMUI.RaisedButton, { label: getMessage('home.52'), onClick: this.onFormSubmit }),
                ' ',
                React.createElement(ReactMUI.RaisedButton, { label: getMessage('54', ''), onClick: this.cancel })
            );
        }

        return React.createElement(
            ReactMUI.Paper,
            _extends({}, this.props, {
                zDepth: 3 }),
            React.createElement(
                'h3',
                null,
                getMessage('home.53')
            ),
            React.createElement(
                'div',
                { className: 'legend' },
                getMessage('home.54'),
                React.createElement('br', null),
                getMessage('home.55')
            ),
            selector,
            form,
            add,
            React.createElement(
                'div',
                { style: { position: 'absolute', bottom: 30, left: 10 } },
                React.createElement(ReactMUI.FlatButton, { disabled: this.state.selectedIndex != 0, label: getMessage('home.56'), secondary: true, onClick: this.resetLayout })
            )
        );
    }

});

exports['default'] = GridBuilder = PydioContextConsumer(GridBuilder);
exports['default'] = GridBuilder;
module.exports = exports['default'];
