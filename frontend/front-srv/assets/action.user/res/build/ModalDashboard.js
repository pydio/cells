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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ProfilePane = require('./ProfilePane');

var _ProfilePane2 = _interopRequireDefault(_ProfilePane);

var _ComponentConfigParser = require('./ComponentConfigParser');

var _ComponentConfigParser2 = _interopRequireDefault(_ComponentConfigParser);

var React = require('react');
var createReactClass = require('create-react-class');
var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;
var AsyncComponent = _Pydio$requireLib.AsyncComponent;

var _require = require('material-ui');

var Tabs = _require.Tabs;
var Tab = _require.Tab;
var FontIcon = _require.FontIcon;
var FlatButton = _require.FlatButton;

var ModalDashboard = createReactClass({
    displayName: 'ModalDashboard',

    mixins: [ActionDialogMixin, SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogSize: 'md',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: false
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    getDefaultButtons: function getDefaultButtons() {
        return [React.createElement(FlatButton, { label: this.props.pydio.MessageHash[86], onClick: this.props.onDismiss })];
    },

    getButtons: function getButtons(updater) {
        this._updater = updater;
        if (this.refs['profile']) {
            return this.refs['profile'].getButtons(this._updater);
        } else {
            return this.getDefaultButtons();
        }
    },

    onTabChange: function onTabChange(value) {
        if (!this._updater) return;
        if (value && this.refs[value] && this.refs[value].getButtons) {
            this._updater(this.refs[value].getButtons(this._updater));
        } else {
            this._updater(this.getDefaultButtons());
        }
    },

    render: function render() {

        var buttonStyle = {
            textTransform: 'none'
        };
        var tabs = [React.createElement(
            Tab,
            { key: 'account', label: this.props.pydio.MessageHash['user_dash.43'], icon: React.createElement(FontIcon, { className: 'mdi mdi-account' }), buttonStyle: buttonStyle, value: 'profile' },
            React.createElement(_ProfilePane2['default'], _extends({}, this.props, { ref: 'profile' }))
        )];

        _ComponentConfigParser2['default'].getAccountTabs(this.props.pydio).map((function (tab) {
            tabs.push(React.createElement(
                Tab,
                { key: tab.id, label: this.props.pydio.MessageHash[tab.tabInfo.label], icon: React.createElement(FontIcon, { className: tab.tabInfo.icon }), buttonStyle: buttonStyle, value: tab.id },
                React.createElement(AsyncComponent, _extends({
                    ref: tab.id
                }, this.props, tab.paneInfo))
            ));
        }).bind(this));

        return React.createElement(
            Tabs,
            {
                style: { display: 'flex', flexDirection: 'column', width: '100%' },
                tabItemContainerStyle: { minHeight: 72 },
                contentContainerStyle: { overflowY: 'auto', minHeight: 350 },
                onChange: this.onTabChange
            },
            tabs
        );
    }
});

exports['default'] = ModalDashboard;
module.exports = exports['default'];
