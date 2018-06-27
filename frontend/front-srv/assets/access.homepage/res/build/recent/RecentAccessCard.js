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

var _boardPalette = require('../board/Palette');

var _boardPalette2 = _interopRequireDefault(_boardPalette);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var React = require('react');

var Color = require('color');

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;
var NodeListCustomProvider = _require$requireLib.NodeListCustomProvider;

var _require$requireLib2 = require('pydio').requireLib('workspaces');

var FilePreview = _require$requireLib2.FilePreview;

var _require = require('material-ui');

var Paper = _require.Paper;
var IconButton = _require.IconButton;

var _require2 = require('material-ui/styles');

var muiThemeable = _require2.muiThemeable;

var PALETTE_INDEX = 3;

/**
 * Show a list of recently accessed files or folders.
 * This list is stored by the server in the user preferences, and served by the feed plugin
 */
var RecentAccessCard = React.createClass({
    displayName: 'RecentAccessCard',

    getDefaultProps: function getDefaultProps() {
        return { colored: true };
    },

    getCorrectNode: function getCorrectNode(node) {
        var originalPath = node.getMetadata().get('original_path');
        var label = !originalPath || originalPath === '/' ? '' : node.getLabel();
        var targetNode = new _pydioModelNode2['default'](originalPath, node.isLeaf(), label);
        targetNode.setMetadata(node.getMetadata());
        return targetNode;
    },

    /**
     *
     * @param node AjxpNode
     */
    goTo: function goTo(node) {
        this.props.pydio.goTo(this.getCorrectNode(node));
    },

    renderIcon: function renderIcon(node) {
        node = this.getCorrectNode(node);
        if (node.getPath() === '/' || !node.getPath()) {
            var label = node.getMetadata().get('repository_label').split(" ").map(function (word) {
                return word.substr(0, 1);
            }).slice(0, 3).join("");
            var color = new Color(this.props.muiTheme.palette.primary1Color).saturationl(18).lightness(44).toString();
            var light = new Color(this.props.muiTheme.palette.primary1Color).saturationl(15).lightness(94).toString();
            return React.createElement(
                'div',
                { className: 'mimefont-container', style: { backgroundColor: light } },
                React.createElement(
                    'div',
                    { className: 'mimefont', style: { fontSize: 14, color: color } },
                    label
                )
            );
        } else {
            return React.createElement(FilePreview, { node: node, loadThumbnail: true });
        }
    },

    renderLabel: function renderLabel(node, data) {
        node = this.getCorrectNode(node);
        var path = node.getPath();
        var meta = node.getMetadata();
        if (!path || path === '/') {
            return React.createElement(
                'span',
                { style: { fontSize: 14 } },
                meta.get('repository_label'),
                ' ',
                React.createElement(
                    'span',
                    { style: { opacity: 0.33 } },
                    ' (Workspace)'
                )
            );
        } else {
            var dir = PathUtils.getDirname(node.getPath());
            var dirSegment = undefined;
            if (dir) {
                dirSegment = React.createElement(
                    'span',
                    { style: { opacity: 0.33 } },
                    ' (',
                    node.getPath(),
                    ')'
                );
            }
            if (node.isLeaf()) {
                return React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'span',
                        { style: { fontSize: 14 } },
                        node.getLabel()
                    ),
                    dirSegment
                );
            } else {
                return React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'span',
                        { style: { fontSize: 14 } },
                        '/' + node.getLabel()
                    ),
                    dirSegment
                );
            }
        }
    },

    renderAction: function renderAction(node, data) {
        var _this = this;

        node = this.getCorrectNode(node);
        return React.createElement(
            'span',
            { style: { position: 'relative' } },
            React.createElement(IconButton, {
                iconClassName: 'mdi mdi-chevron-right',
                tooltip: 'Open ... ',
                onTouchTap: function () {
                    _this.goTo(node);
                },
                style: { position: 'absolute', right: 0 }
            })
        );
    },

    renderFirstLine: function renderFirstLine(node) {
        node = this.getCorrectNode(node);
        if (!node.getPath() || node.getPath() === '/') {
            return node.getMetadata().get('repository_label');
        } else {
            return node.getLabel();
        }
    },

    renderSecondLine: function renderSecondLine(node) {
        node = this.getCorrectNode(node);
        var longLegend = this.props.longLegend;

        var meta = node.getMetadata();
        var accessDate = meta.get('recent_access_readable');
        if (longLegend) {
            if (!node.getPath() || node.getPath() === '/') {
                return 'Workspace opened on ' + accessDate;
            } else {
                return React.createElement(
                    'span',
                    null,
                    meta.get('repository_label'),
                    ' - ',
                    node.isLeaf() ? PathUtils.getDirname(node.getPath()) : node.getPath(),
                    ' - ',
                    accessDate
                );
            }
        } else {
            return accessDate;
        }
    },

    render: function render() {
        var _this2 = this;

        var colored = this.props.colored;

        var c = new Color(_boardPalette2['default'][PALETTE_INDEX]);
        var title = undefined;
        if (!this.props.noTitle) {
            if (colored) {
                title = React.createElement(
                    'div',
                    { style: { backgroundColor: c.darken(0.1).toString(), color: 'white', padding: '16px 0 16px 12px', fontSize: 20 } },
                    this.props.pydio.MessageHash['user_home.87']
                );
            } else {
                title = React.createElement(
                    'div',
                    { style: { padding: '16px 0 16px 12px', fontSize: 20 } },
                    this.props.pydio.MessageHash['user_home.87']
                );
            }
        }

        var displayMode = this.props.displayMode || 'list';

        if (displayMode === 'table') {
            return React.createElement(
                Paper,
                _extends({ zDepth: this.props.zDepth !== undefined ? this.props.zDepth : 1 }, this.props, { className: 'vertical-layout', transitionEnabled: false }),
                this.getCloseButton(),
                React.createElement(NodeListCustomProvider, {
                    className: 'recently-accessed-list table-mode',
                    nodeProviderProperties: { get_action: "load_user_recent_items" },
                    elementHeight: PydioComponents.SimpleList.HEIGHT_ONE_LINE,
                    nodeClicked: function (node) {
                        _this2.goTo(node);
                    },
                    hideToolbar: true,
                    tableKeys: {
                        label: { renderCell: this.renderLabel, label: 'Recently Accessed Files', width: '60%' },
                        recent_access_readable: { label: 'Accessed', width: '20%' },
                        repository_label: { label: 'Workspace', width: '20%' }
                    },
                    entryRenderActions: this.renderAction
                })
            );
        } else {
            return React.createElement(
                Paper,
                _extends({ zDepth: this.props.zDepth !== undefined ? this.props.zDepth : 1 }, this.props, { className: "vertical-layout " + (this.props.className || ''), transitionEnabled: false }),
                this.props.closeButton,
                title,
                React.createElement(NodeListCustomProvider, {
                    className: this.props.listClassName ? this.props.listClassName : "recently-accessed-list files-list",
                    style: { backgroundColor: colored ? _boardPalette2['default'][PALETTE_INDEX] : 'transparent' },
                    nodeProviderProperties: { get_action: "load_user_recent_items" },
                    elementHeight: 63,
                    nodeClicked: function (node) {
                        _this2.goTo(node);
                    },
                    hideToolbar: true,
                    delayInitialLoad: 700,
                    entryRenderFirstLine: this.renderFirstLine,
                    entryRenderSecondLine: this.renderSecondLine,
                    entryRenderIcon: this.renderIcon,
                    emptyStateProps: _extends({
                        style: { paddingTop: 20, paddingBottom: 20 },
                        iconClassName: 'mdi mdi-timer-off',
                        primaryTextId: 'History Empty',
                        secondaryTextId: 'This list will display recently accessed or consulted files and folders. Enter a workspace on the left.'
                    }, this.props.emptyStateProps)
                })
            );
        }
    }

});

exports['default'] = RecentAccessCard = muiThemeable()(RecentAccessCard);
exports['default'] = RecentAccessCard;
module.exports = exports['default'];
