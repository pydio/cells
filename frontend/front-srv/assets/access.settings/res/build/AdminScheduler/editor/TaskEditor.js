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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardDashboard = require('../board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

var React = require('react');

var _require = require('material-ui');

var FlatButton = _require.FlatButton;

var XMLUtils = require('pydio/util/xml');
var LangUtils = require('pydio/util/lang');
var AjxpNode = require('pydio/model/node');
var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;

var _Pydio$requireLib2 = Pydio.requireLib('form');

var Manager = _Pydio$requireLib2.Manager;
var MessagesConsumerMixin = window.AdminComponents.MessagesConsumerMixin;

var TaskEditor = React.createClass({
    displayName: 'TaskEditor',

    mixins: [MessagesConsumerMixin, ActionDialogMixin],

    propTypes: {
        pydio: React.PropTypes.instanceOf(Pydio).isRequired,
        node: React.PropTypes.instanceOf(AjxpNode)
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogSize: 'md',
            dialogPadding: 0,
            dialogScrollBody: true
        };
    },

    getButtons: function getButtons() {
        var updater = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (updater) this._buttonsUpdater = updater;
        return [React.createElement(FlatButton, { 'default': true, onTouchTap: this.dismiss, label: 'Close' }), this.previousButton(), this.nextSaveButton()];
    },

    updateActionDescription: function updateActionDescription(actionList, actionValue) {
        if (actionList.has(actionValue)) {
            this.setState({
                currentActionData: actionList.get(actionValue)
            });
        }
    },

    onParameterChange: function onParameterChange(paramName, newValue, oldValue, additionalFormData) {
        if (paramName === "schedule") {

            this.setState({ cron: newValue });
        } else if (paramName === "action_name") {
            if (this._actionsList) {
                this.updateActionDescription(this._actionsList, newValue);
            } else {
                PydioApi.getClient().request({ get_action: "list_all_plugins_actions" }, (function (t) {
                    if (!t.responseJSON || !t.responseJSON.LIST) return;
                    var _actionsList = new Map();
                    for (var plugin in t.responseJSON.LIST) {
                        if (!t.responseJSON.LIST.hasOwnProperty(plugin)) continue;
                        t.responseJSON.LIST[plugin].map(function (a) {
                            _actionsList.set(a.action, a);
                        });
                    }
                    this.updateActionDescription(_actionsList, newValue);
                    this._actionsList = _actionsList;
                }).bind(this));
            }
        }
    },

    onFormChange: function onFormChange(newValues, dirty, removeValues) {
        this.setState({ values: newValues });
    },

    save: function save() {
        var post = this.refs.formPanel.getValuesForPOST(this.state.values, '');
        post['get_action'] = 'scheduler_addTask';
        if (this.state.node) {
            post['task_id'] = this.state.node.getMetadata().get('task_id');
        }
        PydioApi.getClient().request(post, (function () {
            this.close();
            if (_boardDashboard2['default'].getInstance()) {
                _boardDashboard2['default'].getInstance().refreshTasks();
            }
        }).bind(this));
    },

    previousButton: function previousButton() {

        if (this.state.node || this.state.tab === 0) {
            return null;
        }

        var prevTab = (function () {
            var _this = this;

            this.setState({ tab: this.state.tab - 1 }, function () {
                _this.refs.formPanel.externallySelectTab(_this.state.tab);
                if (_this._buttonsUpdater) _this._buttonsUpdater(_this.getButtons());
            });
        }).bind(this);
        return React.createElement(FlatButton, { secondary: true, onTouchTap: prevTab, label: 'Previous' });
    },

    nextSaveButton: function nextSaveButton() {
        if (this.state.node || this.state.tab === 2) {
            return React.createElement(FlatButton, { secondary: true, onTouchTap: this.save, label: 'Save' });
        }
        var nextTab = (function () {
            var _this2 = this;

            this.setState({ tab: this.state.tab + 1 }, function () {
                _this2.refs.formPanel.externallySelectTab(_this2.state.tab);
                if (_this2._buttonsUpdater) _this2._buttonsUpdater(_this2.getButtons());
            });
        }).bind(this);
        return React.createElement(FlatButton, { secondary: true, onTouchTap: nextTab, label: 'Next' });
    },

    tabChange: function tabChange(tabIndex, tab) {
        var _this3 = this;

        this.setState({ tab: tabIndex }, function () {
            if (_this3._buttonsUpdater) _this3._buttonsUpdater(_this3.getButtons());
        });
    },

    getInitialState: function getInitialState() {
        var _this4 = this;

        if (!this.props.node) {
            return {
                tab: 0,
                values: {
                    schedule: '0 3 * * *',
                    repository_id: 'settings',
                    user_id: this.props.pydio.user.id
                },
                cron: '0 3 * * *'
            };
        } else {
            var _ret = (function () {
                var values = _this4.props.node.getMetadata();
                var objValues = {};
                var parameters = undefined;
                values.forEach(function (v, k) {
                    if (k === 'parameters') {
                        parameters = JSON.parse(v);
                    } else {
                        objValues[k] = v;
                    }
                });
                if (parameters) {
                    var i = 0;
                    for (var k in parameters) {
                        if (!parameters.hasOwnProperty(k)) continue;
                        objValues['param_name' + (i > 0 ? '_' + i : '')] = k;
                        objValues['param_value' + (i > 0 ? '_' + i : '')] = parameters[k];
                        i++;
                    };
                }
                return {
                    v: { tab: 0, values: objValues, cron: values.get('schedule'), node: _this4.props.node }
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        }
    },

    getMessage: function getMessage(messId) {
        return this.props.pydio.MessageHash[messId];
    },

    close: function close() {
        this.props.onDismiss();
    },

    render: function render() {

        if (!this._params) {
            var definitionNode = XMLUtils.XPathSelectSingleNode(this.props.pydio.getXmlRegistry(), 'actions/action[@name="scheduler_addTask"]/processing/standardFormDefinition');
            this._params = Manager.parseParameters(definitionNode, "param");
        }
        var params = [];
        // Clone this._params
        this._params.map((function (o) {
            var _this5 = this;

            var copy = LangUtils.deepCopy(o);
            if (copy.name == 'action_name' && this.state.currentActionData) {
                if (this.state.currentActionData.parameters) {
                    (function () {
                        var actionParams = _this5.state.currentActionData.parameters;
                        var descParams = [];
                        actionParams.map(function (p) {
                            descParams.push((p.name === 'nodes' ? 'file' : p.name) + ' (' + p.description + ')');
                        });
                        copy.description = "Declared Parameters : " + descParams.join(', ');
                    })();
                } else {
                    copy.description = "No Declared Parameters";
                }
            }
            params.push(copy);
        }).bind(this));
        if (this.state.cron) {
            params.push({
                name: 'cron_legend',
                type: 'legend',
                group: this.getMessage('action.scheduler.2'),
                description: 'Current CRON: ' + Cronstrue.toString(this.state.cron)
            });
        }
        var tabs = [{ label: 'Schedule', groups: [1] }, { label: 'Action', groups: [2, 0] }, { label: 'Context', groups: [3] }];
        return React.createElement(
            'div',
            null,
            React.createElement(PydioForm.FormPanel, {
                ref: 'formPanel',
                parameters: params,
                values: this.state.values,
                depth: -1,
                tabs: tabs,
                onTabChange: this.tabChange,
                onChange: this.onFormChange,
                onParameterChange: this.onParameterChange
            })
        );
    }

});
exports['default'] = TaskEditor;
module.exports = exports['default'];
