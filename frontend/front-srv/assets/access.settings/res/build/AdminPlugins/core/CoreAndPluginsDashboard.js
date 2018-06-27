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

var _PluginsList = require('./PluginsList');

var _PluginsList2 = _interopRequireDefault(_PluginsList);

var _PluginEditor = require('./PluginEditor');

var _PluginEditor2 = _interopRequireDefault(_PluginEditor);

var CoreAndPluginsDashboard = React.createClass({
    displayName: 'CoreAndPluginsDashboard',

    render: function render() {
        var coreId = PathUtils.getBasename(this.props.rootNode.getPath());
        if (coreId.indexOf("core.") !== 0) coreId = "core." + coreId;
        var fakeNode = new AjxpNode('/' + coreId);
        var pluginsList = React.createElement(_PluginsList2['default'], _extends({}, this.props, { title: this.props.rootNode.getLabel() }));
        return React.createElement(_PluginEditor2['default'], {
            rootNode: fakeNode,
            additionalPanes: { top: [], bottom: [pluginsList] }
        });
    }

});

exports['default'] = CoreAndPluginsDashboard;
module.exports = exports['default'];
