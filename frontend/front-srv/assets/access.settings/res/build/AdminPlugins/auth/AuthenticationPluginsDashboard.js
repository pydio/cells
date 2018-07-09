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

var _corePluginsList = require('../core/PluginsList');

var _corePluginsList2 = _interopRequireDefault(_corePluginsList);

var _corePluginEditor = require('../core/PluginEditor');

var _corePluginEditor2 = _interopRequireDefault(_corePluginEditor);

var AuthenticationPluginsDashboard = React.createClass({
    displayName: 'AuthenticationPluginsDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],
    render: function render() {
        var pluginsList = React.createElement(_corePluginsList2['default'], {
            title: this.context.getMessage('plugtype.title.authfront', ''),
            dataModel: this.props.dataModel,
            filterType: "authfront",
            openRightPane: this.props.openRightPane,
            closeRightPane: this.props.closeRightPane
        });
        return React.createElement(_corePluginEditor2['default'], _extends({}, this.props, {
            pluginId: "core.auth",
            style: _extends({}, this.props.style),
            additionalPanes: { top: [pluginsList], bottom: [] }
        }));
    }

});

exports['default'] = AuthenticationPluginsDashboard;
module.exports = exports['default'];
