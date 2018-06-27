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

var _PluginEditor = require('./PluginEditor');

var _PluginEditor2 = _interopRequireDefault(_PluginEditor);

var _materialUi = require('material-ui');

var PluginsList = React.createClass({
    displayName: 'PluginsList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    togglePluginEnable: function togglePluginEnable(node, toggled) {
        var nodeId = PathUtils.getBasename(node.getPath());
        var params = {
            get_action: "edit",
            sub_action: "edit_plugin_options",
            plugin_id: nodeId,
            DRIVER_OPTION_PYDIO_PLUGIN_ENABLED: toggled ? "true" : "false",
            DRIVER_OPTION_PYDIO_PLUGIN_ENABLED_ajxptype: "boolean"
        };
        PydioApi.getClient().request(params, (function (transport) {
            node.getMetadata().set("enabled", this.context.getMessage(toggled ? '440' : '441', ''));
            this.forceUpdate();
            pydio.fire("admin_clear_plugins_cache");
        }).bind(this));
        return true;
    },

    renderListIcon: function renderListIcon(node) {
        if (!node.isLeaf()) {
            return React.createElement(
                'div',
                null,
                React.createElement('div', { className: 'icon-folder-open', style: { fontSize: 24, color: 'rgba(0,0,0,0.63)', padding: '20px 25px', display: 'block' } })
            );
        }
        var onToggle = (function (e, toggled) {
            e.stopPropagation();
            var res = this.togglePluginEnable(node, toggled);
            if (!res) {}
        }).bind(this);

        return React.createElement(
            'div',
            { style: { margin: '24px 8px' }, onClick: function (e) {
                    e.stopPropagation();
                } },
            React.createElement(_materialUi.Toggle, {
                ref: 'toggle',
                className: 'plugin-enable-toggle',
                name: 'plugin_toggle',
                value: 'plugin_enabled',
                defaultToggled: node.getMetadata().get("enabled") == this.context.getMessage('440', ''),
                toggled: node.getMetadata().get("enabled") == this.context.getMessage('440', ''),
                onToggle: onToggle
            })
        );
    },

    renderSecondLine: function renderSecondLine(node) {
        return node.getMetadata().get('plugin_description');
    },

    renderActions: function renderActions(node) {
        if (!node.isLeaf()) {
            return null;
        }
        var edit = (function () {
            if (this.props.openRightPane) {
                this.props.openRightPane({
                    COMPONENT: _PluginEditor2['default'],
                    PROPS: {
                        rootNode: node,
                        docAsAdditionalPane: true,
                        className: "vertical edit-plugin-inpane",
                        closeEditor: this.props.closeRightPane
                    },
                    CHILDREN: null
                });
            }
        }).bind(this);
        return React.createElement(
            'div',
            { className: 'plugins-list-actions' },
            React.createElement(_materialUi.IconButton, { iconStyle: { color: 'rgba(0,0,0,0.33)', fontSize: 21 }, style: { padding: 6 }, iconClassName: 'mdi mdi-pencil', onClick: edit })
        );
    },

    reload: function reload() {
        this.refs.list.reload();
    },

    render: function render() {

        return React.createElement(PydioComponents.SimpleList, {
            ref: 'list',
            node: this.props.currentNode || this.props.rootNode,
            dataModel: this.props.dataModel,
            className: 'plugins-list',
            actionBarGroups: [],
            entryRenderIcon: this.renderListIcon,
            entryRenderActions: this.renderActions,
            entryRenderSecondLine: this.renderSecondLine,
            openEditor: this.props.openSelection,
            infineSliceCount: 1000,
            filterNodes: null,
            listTitle: this.props.title,
            hideToolbar: this.props.hideToolbar,
            elementHeight: PydioComponents.SimpleList.HEIGHT_TWO_LINES
        });
    }

});

exports['default'] = PluginsList;
module.exports = exports['default'];
