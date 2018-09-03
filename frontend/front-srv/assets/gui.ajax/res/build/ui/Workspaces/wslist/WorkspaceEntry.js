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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _materialUi = require('material-ui');

var _reactDnd = require('react-dnd');

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var React = require('react');

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var Pydio = require('pydio');
var PydioApi = require('pydio/http/api');
var Node = require('pydio/model/node');

var _Pydio$requireLib = Pydio.requireLib('components');

var FoldersTree = _Pydio$requireLib.FoldersTree;
var DND = _Pydio$requireLib.DND;
var ChatIcon = _Pydio$requireLib.ChatIcon;

var _Pydio$requireLib2 = Pydio.requireLib('hoc');

var withContextMenu = _Pydio$requireLib2.withContextMenu;
var Types = DND.Types;
var collect = DND.collect;
var collectDrop = DND.collectDrop;
var nodeDragSource = DND.nodeDragSource;
var nodeDropTarget = DND.nodeDropTarget;

var Badge = function Badge(_ref) {
    var children = _ref.children;
    var muiTheme = _ref.muiTheme;

    var style = {
        display: "inline-block",
        backgroundColor: muiTheme.palette.accent1Color,
        color: 'white',

        fontSize: 10,
        borderRadius: 6,
        padding: '0 5px',
        marginLeft: 5,
        height: 16,
        lineHeight: '17px',
        fontWeight: 500
    };

    return React.createElement(
        'span',
        { style: style },
        children
    );
};

Badge = muiThemeable()(Badge);

var Confirm = React.createClass({
    displayName: 'Confirm',

    propTypes: {
        pydio: React.PropTypes.instanceOf(Pydio),
        onDecline: React.PropTypes.func,
        onAccept: React.PropTypes.func,
        mode: React.PropTypes.oneOf(['new_share', 'reject_accepted'])
    },

    componentDidMount: function componentDidMount() {
        this.refs.dialog.show();
    },

    render: function render() {
        var messages = this.props.pydio.MessageHash,
            messageTitle = messages[545],
            messageBody = messages[546],
            actions = [{ text: messages[548], ref: 'decline', onClick: this.props.onDecline }, { text: messages[547], ref: 'accept', onClick: this.props.onAccept }];
        if (this.props.mode === 'reject_accepted') {
            messageBody = messages[549];
            actions = [{ text: messages[54], ref: 'decline', onClick: this.props.onDecline }, { text: messages[551], ref: 'accept', onClick: this.props.onAccept }];
        }

        for (var key in this.props.replacements) {
            messageTitle = messageTitle.replace(new RegExp(key), this.props.replacements[key]);
            messageBody = messageBody.replace(new RegExp(key), this.props.replacements[key]);
        }

        return React.createElement(
            'div',
            { className: 'react-mui-context', style: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'transparent' } },
            React.createElement(
                ReactMUI.Dialog,
                {
                    ref: 'dialog',
                    title: messageTitle,
                    actions: actions,
                    modal: false,
                    dismissOnClickAway: true,
                    onDismiss: this.props.onDismiss.bind(this),
                    open: true
                },
                messageBody
            )
        );
    }
});

var WorkspaceEntry = React.createClass({
    displayName: 'WorkspaceEntry',

    propTypes: {
        pydio: React.PropTypes.instanceOf(Pydio).isRequired,
        workspace: React.PropTypes.instanceOf(Repository).isRequired,
        showFoldersTree: React.PropTypes.bool,
        onHoverLink: React.PropTypes.func,
        onOutLink: React.PropTypes.func
    },

    getInitialState: function getInitialState() {
        return {
            openAlert: false,
            openFoldersTree: false,
            currentContextNode: this.props.pydio.getContextHolder().getContextNode()
        };
    },

    getLetterBadge: function getLetterBadge() {
        return { __html: this.props.workspace.getHtmlBadge(true) };
    },

    componentDidMount: function componentDidMount() {
        if (this.props.showFoldersTree) {
            this._monitorFolder = (function () {
                this.setState({ currentContextNode: this.props.pydio.getContextHolder().getContextNode() });
            }).bind(this);
            this.props.pydio.getContextHolder().observe("context_changed", this._monitorFolder);
        }
    },

    componentWillUnmount: function componentWillUnmount() {
        if (this._monitorFolder) {
            this.props.pydio.getContextHolder().stopObserving("context_changed", this._monitorFolder);
        }
    },

    handleAccept: function handleAccept() {
        PydioApi.getClient().request({
            'get_action': 'accept_invitation',
            'remote_share_id': this.props.workspace.getShareId()
        }, (function () {
            // Switching status to decline
            this.props.workspace.setAccessStatus('accepted');

            this.handleCloseAlert();
            this.onClick();
        }).bind(this), (function () {
            this.handleCloseAlert();
        }).bind(this));
    },

    handleDecline: function handleDecline() {
        PydioApi.getClient().request({
            'get_action': 'reject_invitation',
            'remote_share_id': this.props.workspace.getShareId()
        }, (function () {
            // Switching status to decline
            this.props.workspace.setAccessStatus('declined');

            this.props.pydio.fire("repository_list_refreshed", {
                list: this.props.pydio.user.getRepositoriesList(),
                active: this.props.pydio.user.getActiveRepository()
            });

            this.handleCloseAlert();
        }).bind(this), (function () {
            this.handleCloseAlert();
        }).bind(this));
    },

    handleOpenAlert: function handleOpenAlert(mode, event) {
        if (mode === undefined) mode = 'new_share';

        event.stopPropagation();
        this.wrapper = document.body.appendChild(document.createElement('div'));
        this.wrapper.style.zIndex = 11;
        var replacements = {
            '%%OWNER%%': this.props.workspace.getOwner()
        };
        ReactDOM.render(React.createElement(Confirm, _extends({}, this.props, {
            mode: mode,
            replacements: replacements,
            onAccept: mode === 'new_share' ? this.handleAccept.bind(this) : this.handleDecline.bind(this),
            onDecline: mode === 'new_share' ? this.handleDecline.bind(this) : this.handleCloseAlert.bind(this),
            onDismiss: this.handleCloseAlert
        })), this.wrapper);
    },

    handleCloseAlert: function handleCloseAlert() {
        ReactDOM.unmountComponentAtNode(this.wrapper);
        this.wrapper.remove();
    },

    onClick: function onClick() {
        var _this = this;

        if (this.props.workspace.getId() === this.props.pydio.user.activeRepository && this.props.showFoldersTree) {
            this.props.pydio.goTo('/');
        } else {
            this.props.pydio.observeOnce('repository_list_refreshed', function () {
                _this.setState({ loading: false });
            });
            this.setState({ loading: true });
            this.props.pydio.triggerRepositoryChange(this.props.workspace.getId());
        }
    },

    toggleFoldersPanelOpen: function toggleFoldersPanelOpen(ev) {
        ev.stopPropagation();
        this.setState({ openFoldersTree: !this.state.openFoldersTree });
    },

    getItemStyle: function getItemStyle(node) {
        var isContext = this.props.pydio.getContextHolder().getContextNode() === node;
        var accent2 = this.props.muiTheme.palette.accent2Color;
        if (isContext) {
            return {
                backgroundColor: accent2,
                color: 'white'
            };
        }
        var isSelected = this.props.pydio.getContextHolder().getSelectedNodes().indexOf(node) !== -1;
        if (isSelected) {
            return {
                backgroundColor: _color2['default'](accent2).lightness(95).toString()
            };
        }
        return {};
    },

    roomPopover: function roomPopover(event) {
        var _this2 = this;

        event.stopPropagation();
        var target = event.target;

        var offsetTop = target.getBoundingClientRect().top;
        var viewport = _pydioUtilDom2['default'].getViewportHeight();
        var popoverTop = viewport - offsetTop < 250;
        _pydioHttpResourcesManager2['default'].loadClassesAndApply(["ShareDialog"], function () {
            var popoverContent = React.createElement(ShareDialog.CellCard, {
                pydio: _this2.props.pydio,
                cellId: _this2.props.workspace.getId(),
                onDismiss: function () {
                    _this2.setState({ popoverOpen: false });
                },
                onHeightChange: function () {
                    _this2.setState({ popoverHeight: 500 });
                }
            });
            _this2.setState({ popoverAnchor: target, popoverOpen: true, popoverContent: popoverContent, popoverTop: popoverTop, popoverHeight: null });
        });
    },

    render: function render() {
        var _this3 = this;

        var _props = this.props;
        var workspace = _props.workspace;
        var pydio = _props.pydio;
        var onHoverLink = _props.onHoverLink;
        var onOutLink = _props.onOutLink;
        var showFoldersTree = _props.showFoldersTree;

        var current = pydio.user.getActiveRepository() === workspace.getId(),
            currentClass = "workspace-entry",
            messages = pydio.MessageHash,
            onHover = undefined,
            onOut = undefined,
            onClick = undefined,
            additionalAction = undefined,
            treeToggle = undefined;

        var style = {};

        if (current) {
            currentClass += " workspace-current";
            if (this.state.openFoldersTree) {
                style = this.getItemStyle(pydio.getContextHolder().getRootNode());
            } else {
                style = this.getItemStyle(pydio.getContextHolder().getContextNode());
            }
        }

        currentClass += " workspace-access-" + workspace.getAccessType();

        if (onHoverLink) {
            onHover = (function (event) {
                onHoverLink(event, workspace);
            }).bind(this);
        }

        if (onOutLink) {
            onOut = (function (event) {
                onOutLink(event, workspace);
            }).bind(this);
        }

        onClick = this.onClick;
        var chatIcon = undefined;

        if (workspace.getOwner()) {
            additionalAction = React.createElement('span', { className: 'workspace-additional-action mdi mdi-dots-vertical', onClick: this.roomPopover.bind(this) });
            if (!pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS")) {
                chatIcon = React.createElement(ChatIcon, { pydio: pydio, roomType: 'WORKSPACE', objectId: workspace.getId() });
            }
        }

        if (workspace.getOwner() && !workspace.getAccessStatus() && !workspace.getLastConnection()) {
            //newWorkspace = <Badge>NEW</Badge>;
            // Dialog for remote shares
            if (workspace.getRepositoryType() === "remote") {
                onClick = this.handleOpenAlert.bind(this, 'new_share');
            }
        } else if (workspace.getRepositoryType() === "remote" && !current) {
            // Remote share but already accepted, add delete
            additionalAction = React.createElement('span', { className: 'workspace-additional-action mdi mdi-close', onClick: this.handleOpenAlert.bind(this, 'reject_accepted'), title: messages['550'] });
        }

        if (this.state && this.state.loading) {
            additionalAction = React.createElement(_materialUi.CircularProgress, { size: 20, thickness: 3, style: { marginTop: 2, marginRight: 6, opacity: .5 } });
        }

        if (showFoldersTree) {
            var fTCName = this.state.openFoldersTree ? "mdi mdi-chevron-down" : "mdi mdi-chevron-right";
            treeToggle = React.createElement('span', { style: { opacity: 1 }, className: 'workspace-additional-action ' + fTCName, onClick: this.toggleFoldersPanelOpen });
        }

        var menuNode = undefined;
        if (workspace.getId() === pydio.user.activeRepository) {
            menuNode = pydio.getContextHolder().getRootNode();
        } else {
            /*
            menuNode = new Node('/', false, workspace.getLabel());
            menuNode.setRoot(true);
            const metaMap = new Map();
            metaMap.set('repository_id', workspace.getId());
            menuNode.setMetadata(metaMap);
            */
        }

        var _state = this.state;
        var popoverOpen = _state.popoverOpen;
        var popoverAnchor = _state.popoverAnchor;
        var popoverTop = _state.popoverTop;
        var popoverHeight = _state.popoverHeight;

        var title = workspace.getLabel();
        if (workspace.getDescription()) {
            title += ' - ' + workspace.getDescription();
        }

        var wsBlock = React.createElement(
            ContextMenuWrapper,
            {
                node: menuNode,
                className: currentClass,
                onClick: onClick,
                onMouseOver: onHover,
                onMouseOut: onOut,
                style: style
            },
            React.createElement(
                'span',
                { className: 'workspace-label', title: title },
                workspace.getLabel()
            ),
            chatIcon,
            treeToggle,
            React.createElement('span', { style: { flex: 1 } }),
            additionalAction,
            React.createElement(
                _materialUi.Popover,
                {
                    open: popoverOpen,
                    anchorEl: popoverAnchor,
                    useLayerForClickAway: true,
                    autoCloseWhenOffScreen: false,
                    canAutoPosition: true,
                    onRequestClose: function () {
                        _this3.setState({ popoverOpen: false });
                    },
                    anchorOrigin: { horizontal: "right", vertical: popoverTop ? "bottom" : "center" },
                    targetOrigin: { horizontal: "left", vertical: popoverTop ? "bottom" : "center" },
                    zDepth: 3,
                    style: { overflow: 'hidden', borderRadius: 10, height: popoverHeight }
                },
                this.state.popoverContent
            )
        );

        if (showFoldersTree) {
            return React.createElement(
                'div',
                null,
                wsBlock,
                React.createElement(FoldersTree, {
                    pydio: pydio,
                    dataModel: pydio.getContextHolder(),
                    className: this.state.openFoldersTree ? "open" : "closed",
                    draggable: true,
                    getItemStyle: this.getItemStyle
                })
            );
        } else {
            return wsBlock;
        }
    }

});

var ContextMenuWrapper = function ContextMenuWrapper(props) {
    var canDrop = props.canDrop;
    var isOver = props.isOver;
    var connectDropTarget = props.connectDropTarget;

    var className = props.className || '';
    if (canDrop && isOver) {
        className += ' droppable-active';
    }
    return React.createElement('div', _extends({}, props, {
        className: className,
        ref: function (instance) {
            var node = ReactDOM.findDOMNode(instance);
            if (typeof connectDropTarget === 'function') connectDropTarget(node);
        }
    }));
};
ContextMenuWrapper = withContextMenu(ContextMenuWrapper);
ContextMenuWrapper = _reactDnd.DropTarget(Types.NODE_PROVIDER, nodeDropTarget, collectDrop)(ContextMenuWrapper);
exports['default'] = WorkspaceEntry = muiThemeable()(WorkspaceEntry);

exports['default'] = WorkspaceEntry;
module.exports = exports['default'];
