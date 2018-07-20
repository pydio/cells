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

var _NodeListCustomProvider = require('./NodeListCustomProvider');

var _NodeListCustomProvider2 = _interopRequireDefault(_NodeListCustomProvider);

var _elementsDataModelBadge = require('../elements/DataModelBadge');

var _elementsDataModelBadge2 = _interopRequireDefault(_elementsDataModelBadge);

exports['default'] = React.createClass({
    displayName: 'CollapsableListProvider',

    propTypes: {
        paneData: React.PropTypes.object,
        pydio: React.PropTypes.instanceOf(Pydio),
        nodeClicked: React.PropTypes.func,
        startOpen: React.PropTypes.bool,
        onBadgeIncrease: React.PropTypes.func,
        onBadgeChange: React.PropTypes.func
    },

    getInitialState: function getInitialState() {

        var dataModel = new PydioDataModel(true);
        var rNodeProvider = new RemoteNodeProvider();
        dataModel.setAjxpNodeProvider(rNodeProvider);
        rNodeProvider.initProvider(this.props.paneData.options['nodeProviderProperties']);
        var rootNode = new AjxpNode("/", false, "loading", "folder.png", rNodeProvider);
        dataModel.setRootNode(rootNode);

        return {
            open: false,
            componentLaunched: !!this.props.paneData.options['startOpen'],
            dataModel: dataModel
        };
    },

    toggleOpen: function toggleOpen() {
        this.setState({ open: !this.state.open, componentLaunched: true });
    },

    onBadgeIncrease: function onBadgeIncrease(newValue, prevValue, memoData) {
        if (this.props.onBadgeIncrease) {
            this.props.onBadgeIncrease(this.props.paneData, newValue, prevValue, memoData);
            if (!this.state.open) this.toggleOpen();
        }
    },

    onBadgeChange: function onBadgeChange(newValue, prevValue, memoData) {
        if (this.props.onBadgeChange) {
            this.props.onBadgeChange(this.props.paneData, newValue, prevValue, memoData);
            if (!this.state.open) this.toggleOpen();
        }
    },

    render: function render() {

        var messages = this.props.pydio.MessageHash;
        var paneData = this.props.paneData;

        var title = messages[paneData.options.title] || paneData.options.title;
        var className = 'simple-provider ' + (paneData.options['className'] ? paneData.options['className'] : '');
        var titleClassName = 'section-title ' + (paneData.options['titleClassName'] ? paneData.options['titleClassName'] : '');

        var badge;
        if (paneData.options.dataModelBadge) {
            badge = React.createElement(_elementsDataModelBadge2['default'], {
                dataModel: this.state.dataModel,
                options: paneData.options.dataModelBadge,
                onBadgeIncrease: this.onBadgeIncrease,
                onBadgeChange: this.onBadgeChange
            });
        }
        var emptyMessage;
        if (paneData.options.emptyChildrenMessage) {
            emptyMessage = React.createElement(_elementsDataModelBadge2['default'], {
                dataModel: this.state.dataModel,
                options: {
                    property: 'root_children_empty',
                    className: 'emptyMessage',
                    emptyMessage: messages[paneData.options.emptyChildrenMessage]
                }
            });
        }

        var component;
        if (this.state.componentLaunched) {
            var entryRenderFirstLine;
            if (paneData.options['tipAttribute']) {
                entryRenderFirstLine = function (node) {
                    var meta = node.getMetadata().get(paneData.options['tipAttribute']);
                    if (meta) {
                        return React.createElement(
                            'div',
                            { title: meta.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?(\/)?>|<\/\w+>/gi, '') },
                            node.getLabel()
                        );
                    } else {
                        return node.getLabel();
                    }
                };
            }
            component = React.createElement(_NodeListCustomProvider2['default'], {
                pydio: this.props.pydio,
                ref: paneData.id,
                title: title,
                elementHeight: 36,
                heightAutoWithMax: 4000,
                entryRenderFirstLine: entryRenderFirstLine,
                nodeClicked: this.props.nodeClicked,
                presetDataModel: this.state.dataModel,
                reloadOnServerMessage: paneData.options['reloadOnServerMessage'],
                actionBarGroups: paneData.options['actionBarGroups'] ? paneData.options['actionBarGroups'] : []
            });
        }

        return React.createElement(
            'div',
            { className: className + (this.state.open ? " open" : " closed") },
            React.createElement(
                'div',
                { className: titleClassName },
                React.createElement(
                    'span',
                    { className: 'toggle-button', onClick: this.toggleOpen },
                    this.state.open ? messages[514] : messages[513]
                ),
                title,
                ' ',
                badge
            ),
            component,
            emptyMessage
        );
    }

});
module.exports = exports['default'];
