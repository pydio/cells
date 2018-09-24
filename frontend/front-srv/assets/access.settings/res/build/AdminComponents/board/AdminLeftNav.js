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

var _utilNavigationHelper = require('../util/NavigationHelper');

var _utilNavigationHelper2 = _interopRequireDefault(_utilNavigationHelper);

var _utilMenuItemListener = require('../util/MenuItemListener');

var _utilMenuItemListener2 = _interopRequireDefault(_utilMenuItemListener);

var React = require('react');

var _require = require('material-ui');

var Paper = _require.Paper;
var Menu = _require.Menu;

var _require2 = require('material-ui/styles');

var muiThemeable = _require2.muiThemeable;

var AjxpNode = require('pydio/model/node');
var PydioDataModel = require('pydio/model/data-model');

var AdminLeftNav = React.createClass({
    displayName: 'AdminLeftNav',

    propTypes: {
        rootNode: React.PropTypes.instanceOf(AjxpNode),
        contextNode: React.PropTypes.instanceOf(AjxpNode),
        dataModel: React.PropTypes.instanceOf(PydioDataModel)
    },

    componentDidMount: function componentDidMount() {
        _utilMenuItemListener2['default'].getInstance().observe("item_changed", (function () {
            this.forceUpdate();
        }).bind(this));
    },

    componentWillUnmount: function componentWillUnmount() {
        _utilMenuItemListener2['default'].getInstance().stopObserving("item_changed");
    },

    checkForUpdates: function checkForUpdates() {
        var _props = this.props;
        var pydio = _props.pydio;
        var rootNode = _props.rootNode;
    },

    onMenuChange: function onMenuChange(event, node) {
        this.props.dataModel.setSelectedNodes([]);
        this.props.dataModel.setContextNode(node);
    },

    render: function render() {
        var _props2 = this.props;
        var pydio = _props2.pydio;
        var rootNode = _props2.rootNode;
        var muiTheme = _props2.muiTheme;
        var open = _props2.open;
        var showAdvanced = _props2.showAdvanced;

        // Fix for ref problems on context node
        var contextNode = this.props.contextNode;

        this.props.rootNode.getChildren().forEach(function (child) {
            if (child.getPath() === contextNode.getPath()) {
                contextNode = child;
            } else {
                child.getChildren().forEach(function (grandChild) {
                    if (grandChild.getPath() === contextNode.getPath()) {
                        contextNode = grandChild;
                    }
                });
            }
        });

        var menuItems = _utilNavigationHelper2['default'].buildNavigationItems(pydio, rootNode, muiTheme.palette, showAdvanced, false);

        var pStyle = {
            height: '100%',
            position: 'fixed',
            width: 256,
            paddingTop: 56,
            zIndex: 9
        };
        if (!open) {
            pStyle.transform = 'translateX(-256px)';
        }

        return React.createElement(
            Paper,
            { zDepth: 2,
                style: pStyle,
                className: 'admin-main-nav',
                ref: 'leftNav'
            },
            React.createElement(
                'div',
                { style: { height: '100%', overflowY: 'auto' } },
                React.createElement(
                    Menu,
                    {
                        onChange: this.onMenuChange,
                        autoWidth: false,
                        width: 256,
                        listStyle: { display: 'block', maxWidth: 256 },
                        value: contextNode
                    },
                    menuItems
                )
            )
        );
    }

});

exports['default'] = AdminLeftNav = muiThemeable()(AdminLeftNav);
exports['default'] = AdminLeftNav;
module.exports = exports['default'];
