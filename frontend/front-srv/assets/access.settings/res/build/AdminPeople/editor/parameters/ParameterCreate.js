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

var _utilEditorCache = require('../util/EditorCache');

var _utilEditorCache2 = _interopRequireDefault(_utilEditorCache);

var _ParametersPicker = require('./ParametersPicker');

var _ParametersPicker2 = _interopRequireDefault(_ParametersPicker);

var React = require('react');

var _require = require('material-ui');

var TextField = _require.TextField;
var FlatButton = _require.FlatButton;

var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;
exports['default'] = React.createClass({
    displayName: 'ParameterCreate',

    mixins: [ActionDialogMixin, CancelButtonProviderMixin],

    propTypes: {
        workspaceScope: React.PropTypes.string,
        showModal: React.PropTypes.func,
        hideModal: React.PropTypes.func,
        pluginsFilter: React.PropTypes.func,
        roleType: React.PropTypes.oneOf(['user', 'group', 'role']),
        createParameter: React.PropTypes.func
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogPadding: 0,
            dialogTitle: '',
            dialogSize: 'md'
        };
    },

    getInitialState: function getInitialState() {
        return {
            step: 1,
            workspaceScope: this.props.workspaceScope,
            pluginName: null,
            paramName: null
        };
    },

    setSelection: function setSelection(plugin, type, param, attributes) {
        this.setState({ pluginName: plugin, type: type, paramName: param, attributes: attributes }, this.createParameter);
    },

    createParameter: function createParameter() {
        this.props.createParameter(this.state.type, this.state.pluginName, this.state.paramName, this.state.attributes);
        this.props.onDismiss();
    },

    render: function render() {

        // This is passed via state, context is not working,
        // so we have to get the messages from the global.
        var getMessage = function getMessage(id) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];

            return global.pydio.MessageHash[namespace + (namespace ? '.' : '') + id] || id;
        };

        var title, content, actions;
        var params = _utilEditorCache2['default'].CACHE['PARAMETERS'];
        if (!params) {
            return React.createElement(
                'div',
                null,
                'Oops: parameters cache is not loaded!'
            );
        }
        var scopeId = this.props.workspaceScope;
        var pluginsFilter = this.props.pluginsFilter || function () {
            return true;
        };

        var allParams = {};
        var currentRoleType = this.props.roleType;
        params.forEach(function (data, pluginName) {
            if (data.size && pluginsFilter(scopeId, pluginName)) {
                var pluginParams = [];
                data.forEach(function (aParam) {
                    aParam._type = 'parameter';
                    if (aParam.scope && aParam.scope.indexOf(currentRoleType) !== -1) {
                        //console.log('ignoring ' + aParam.label + '? Scope is ' + aParam.scope);
                        return;
                    }
                    pluginParams.push(aParam);
                });
                if (pluginParams.length) {
                    allParams[pluginName] = { name: pluginName, params: pluginParams };
                }
            }
        });

        var theActions = _utilEditorCache2['default'].CACHE['ACTIONS'];
        var allActions = {};
        theActions.forEach(function (value, pluginName) {
            if (value.size && pluginsFilter(scopeId, pluginName)) {
                var pluginActions = [];
                value.forEach(function (actionObject, actionName) {
                    pluginActions.push({ _type: 'action', name: actionName, label: actionObject.label ? actionObject.label : actionName });
                });
                allActions[pluginName] = { name: pluginName, actions: pluginActions };
            }
        });

        return React.createElement(
            'div',
            { className: 'picker-list' },
            React.createElement(
                'div',
                { className: 'color-dialog-title' },
                React.createElement(
                    'h3',
                    null,
                    getMessage('14')
                ),
                React.createElement(
                    'div',
                    { className: 'legend' },
                    getMessage('15')
                )
            ),
            React.createElement(_ParametersPicker2['default'], {
                allActions: allActions,
                allParameters: allParams,
                onSelection: this.setSelection,
                getMessage: getMessage
            })
        );
    }

});
module.exports = exports['default'];
