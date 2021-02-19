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

"use strict";

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require("material-ui/styles");

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _materialUi = require('material-ui');

var _reactDnd = require('react-dnd');

var _pydioModelNode = require("pydio/model/node");

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _pydioModelMetaNodeProvider = require('pydio/model/meta-node-provider');

var _pydioModelMetaNodeProvider2 = _interopRequireDefault(_pydioModelMetaNodeProvider);

var _WorkspaceCard = require("./WorkspaceCard");

var _WorkspaceCard2 = _interopRequireDefault(_WorkspaceCard);

var _Pydio$requireLib = _pydio2["default"].requireLib('components');

var FoldersTree = _Pydio$requireLib.FoldersTree;
var DND = _Pydio$requireLib.DND;
var ChatIcon = _Pydio$requireLib.ChatIcon;
var Types = DND.Types;
var collectDrop = DND.collectDrop;
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

    return _react2["default"].createElement(
        "span",
        { style: style },
        children
    );
};

Badge = _materialUiStyles.muiThemeable()(Badge);

var Confirm = (function (_React$Component) {
    _inherits(Confirm, _React$Component);

    function Confirm() {
        _classCallCheck(this, Confirm);

        _React$Component.apply(this, arguments);
    }

    Confirm.prototype.render = function render() {
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

        // TODO Retest this component as Dialog replace legacy materialui dialog
        return _react2["default"].createElement(
            "div",
            { className: "react-mui-context", style: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'transparent' } },
            _react2["default"].createElement(
                _materialUi.Dialog,
                {
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
    };

    _createClass(Confirm, null, [{
        key: "propTypes",
        value: {
            pydio: _react2["default"].PropTypes.instanceOf(_pydio2["default"]),
            onDecline: _react2["default"].PropTypes.func,
            onAccept: _react2["default"].PropTypes.func,
            mode: _react2["default"].PropTypes.oneOf(['new_share', 'reject_accepted'])
        },
        enumerable: true
    }]);

    return Confirm;
})(_react2["default"].Component);

var WorkspaceEntry = (function (_React$Component2) {
    _inherits(WorkspaceEntry, _React$Component2);

    function WorkspaceEntry() {
        var _this = this;

        _classCallCheck(this, WorkspaceEntry);

        _React$Component2.apply(this, arguments);

        this.state = {
            openAlert: false,
            openFoldersTree: false,
            currentContextNode: this.props.pydio.getContextHolder().getContextNode()
        };

        this.getLetterBadge = function () {
            return { __html: _this.props.workspace.getHtmlBadge(true) };
        };

        this.handleAccept = function () {
            _this.props.workspace.setAccessStatus('accepted');
            _this.handleCloseAlert();
            _this.onClick();
        };

        this.handleDecline = function () {
            // Switching status to decline
            _this.props.workspace.setAccessStatus('declined');
            _this.props.pydio.fire("repository_list_refreshed", {
                list: _this.props.pydio.user.getRepositoriesList(),
                active: _this.props.pydio.user.getActiveRepository()
            });
            _this.handleCloseAlert();
        };

        this.handleOpenAlert = function (mode, event) {
            if (mode === undefined) mode = 'new_share';

            event.stopPropagation();
            _this.wrapper = document.body.appendChild(document.createElement('div'));
            _this.wrapper.style.zIndex = 11;
            var replacements = {
                '%%OWNER%%': _this.props.workspace.getOwner()
            };
            ReactDOM.render(_react2["default"].createElement(Confirm, _extends({}, _this.props, {
                mode: mode,
                replacements: replacements,
                onAccept: mode === 'new_share' ? _this.handleAccept.bind(_this) : _this.handleDecline.bind(_this),
                onDecline: mode === 'new_share' ? _this.handleDecline.bind(_this) : _this.handleCloseAlert.bind(_this),
                onDismiss: _this.handleCloseAlert
            })), _this.wrapper);
        };

        this.handleCloseAlert = function () {
            ReactDOM.unmountComponentAtNode(_this.wrapper);
            _this.wrapper.remove();
        };

        this.onClick = function () {
            if (_this.props.workspace.getId() === _this.props.pydio.user.activeRepository && _this.props.showFoldersTree) {
                _this.props.pydio.goTo('/');
            } else {
                _this.props.pydio.observeOnce('repository_list_refreshed', function () {
                    _this.setState({ loading: false });
                });
                _this.setState({ loading: true });
                _this.props.pydio.triggerRepositoryChange(_this.props.workspace.getId());
            }
        };

        this.toggleFoldersPanelOpen = function (ev) {
            ev.stopPropagation();
            _this.setState({ openFoldersTree: !_this.state.openFoldersTree });
        };

        this.getRootItemStyle = function (node) {
            var isContext = _this.props.pydio.getContextHolder().getContextNode() === node;
            var accent2 = _this.props.muiTheme.palette.accent2Color;
            if (isContext) {
                return {
                    borderLeft: '4px solid ' + accent2,
                    paddingLeft: 12
                };
            } else {
                return {};
            }
        };

        this.getItemStyle = function (node) {
            var isContext = _this.props.pydio.getContextHolder().getContextNode() === node;
            var accent2 = _this.props.muiTheme.palette.accent2Color;
            if (isContext) {
                return {
                    color: 'rgba(0,0,0,.77)',
                    fontWeight: 500,
                    backgroundColor: _color2["default"](accent2).fade(.9).toString()
                };
            }
            var isSelected = _this.props.pydio.getContextHolder().getSelectedNodes().indexOf(node) !== -1;
            if (isSelected) {
                return {
                    /*backgroundColor: Color(accent2).fade(.9).toString()*/
                    color: accent2,
                    fontWeight: 500
                };
            }
            return {};
        };

        this.workspacePopoverNode = function (workspace) {
            var menuNode = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

            if (menuNode) {
                return Promise.resolve(menuNode);
            }
            return _pydioModelMetaNodeProvider2["default"].loadRoots([workspace.getSlug()]).then(function (results) {
                if (results && results[workspace.getSlug()]) {
                    return results[workspace.getSlug()];
                } else {
                    var fakeNode = new _pydioModelNode2["default"]('/', false, workspace.getLabel());
                    fakeNode.setRoot(true);
                    fakeNode.getMetadata().set('repository_id', workspace.getId());
                    fakeNode.getMetadata().set('workspaceEntry', workspace);
                    return fakeNode;
                }
            });
        };

        this.workspacePopover = function (event) {
            var menuNode = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];
            var _props = _this.props;
            var pydio = _props.pydio;
            var workspace = _props.workspace;

            event.stopPropagation();
            var target = event.target;

            var offsetTop = target.getBoundingClientRect().top;
            var viewportH = _pydioUtilDom2["default"].getViewportHeight();
            var viewportW = _pydioUtilDom2["default"].getViewportWidth();
            var popoverTop = viewportH - offsetTop < 250;
            _this.workspacePopoverNode(workspace, menuNode).then(function (n) {
                if (workspace.getOwner()) {
                    _pydioHttpResourcesManager2["default"].loadClassesAndApply(["ShareDialog"], function () {
                        var popoverContent = _react2["default"].createElement(ShareDialog.CellCard, {
                            pydio: pydio,
                            cellId: workspace.getId(),
                            onDismiss: function () {
                                _this.setState({ popoverOpen: false });
                            },
                            onHeightChange: function () {
                                _this.setState({ popoverHeight: 500 });
                            },
                            editorOneColumn: viewportW < 700,
                            rootNode: n
                        });
                        _this.setState({ popoverAnchor: target, popoverOpen: true, popoverContent: popoverContent, popoverTop: popoverTop, popoverHeight: null });
                    });
                } else {
                    var popoverContent = _react2["default"].createElement(_WorkspaceCard2["default"], {
                        pydio: pydio,
                        workspace: workspace,
                        rootNode: n,
                        onDismiss: function () {
                            _this.setState({ popoverOpen: false });
                        }
                    });
                    _this.setState({ popoverAnchor: target, popoverOpen: true, popoverContent: popoverContent, popoverTop: popoverTop, popoverHeight: null });
                }
            });
        };
    }

    WorkspaceEntry.prototype.componentDidMount = function componentDidMount() {
        if (this.props.showFoldersTree) {
            this._monitorFolder = (function () {
                this.setState({ currentContextNode: this.props.pydio.getContextHolder().getContextNode() });
            }).bind(this);
            this.props.pydio.getContextHolder().observe("context_changed", this._monitorFolder);
        }
    };

    WorkspaceEntry.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this._monitorFolder) {
            this.props.pydio.getContextHolder().stopObserving("context_changed", this._monitorFolder);
        }
    };

    WorkspaceEntry.prototype.render = function render() {
        var _this2 = this;

        var _props2 = this.props;
        var workspace = _props2.workspace;
        var pydio = _props2.pydio;
        var onHoverLink = _props2.onHoverLink;
        var onOutLink = _props2.onOutLink;
        var showFoldersTree = _props2.showFoldersTree;

        var current = pydio.user.getActiveRepository() === workspace.getId(),
            currentClass = "workspace-entry",
            onHover = undefined,
            onOut = undefined,
            onClick = undefined,
            additionalAction = undefined,
            treeToggle = undefined;

        var style = {};

        if (current) {
            currentClass += " workspace-current";
            style = this.getRootItemStyle(pydio.getContextHolder().getContextNode());
        }
        style = _extends({ paddingLeft: 16 }, style);

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

        var accent2 = this.props.muiTheme.palette.accent2Color;
        var icon = "mdi mdi-folder";
        var iconStyle = {
            fontSize: 20,
            marginRight: 10,
            opacity: 0.3
        };
        if (workspace.getRepositoryType() === "workspace-personal") {
            icon = "mdi mdi-folder-account";
        } else if (workspace.getRepositoryType() === "cell") {
            icon = "icomoon-cells";
            iconStyle = _extends({}, iconStyle, { fontSize: 22 });
        }

        var menuNode = undefined;
        var popoverNode = undefined;
        if (current) {
            menuNode = pydio.getContextHolder().getRootNode();
            if (showFoldersTree) {
                if (menuNode.isLoading()) {
                    menuNode.observeOnce("loaded", function () {
                        _this2.forceUpdate();
                    });
                }
                var children = menuNode.getChildren();
                var hasFolders = false;
                children.forEach(function (c) {
                    if (!c.isLeaf()) {
                        hasFolders = true;
                    }
                });
                if (hasFolders) {
                    var toggleIcon = this.state.openFoldersTree ? "mdi mdi-chevron-down" : "mdi mdi-chevron-right";
                    treeToggle = _react2["default"].createElement("span", { style: { opacity: .3 }, className: 'workspace-additional-action ' + toggleIcon,
                        onClick: this.toggleFoldersPanelOpen });
                }
            }
            iconStyle.opacity = 1;
            iconStyle.color = accent2;
            popoverNode = menuNode;
        } else {
            menuNode = new _pydioModelNode2["default"]('/', false, workspace.getLabel());
            menuNode.setRoot(true);
            menuNode.getMetadata().set('repository_id', workspace.getId());
            menuNode.getMetadata().set('workspaceEntry', workspace);
        }

        var _state = this.state;
        var popoverOpen = _state.popoverOpen;
        var popoverAnchor = _state.popoverAnchor;
        var popoverTop = _state.popoverTop;
        var popoverHeight = _state.popoverHeight;
        var loading = _state.loading;

        if (loading) {
            additionalAction = _react2["default"].createElement(_materialUi.CircularProgress, { size: 20, thickness: 2, style: { marginTop: 2, marginRight: 6, opacity: .5 } });
        } else {
            var addStyle = popoverOpen ? { opacity: 1 } : {};
            if (popoverOpen) {
                style = _extends({}, style, { backgroundColor: 'rgba(133, 133, 133, 0.1)' });
            }
            additionalAction = _react2["default"].createElement("span", {
                className: "workspace-additional-action with-hover mdi mdi-dots-vertical",
                onClick: function (e) {
                    return _this2.workspacePopover(e, popoverNode);
                },
                style: addStyle
            });
        }

        if (workspace.getOwner()) {
            if (!pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS")) {
                chatIcon = _react2["default"].createElement(ChatIcon, { pydio: pydio, roomType: 'WORKSPACE', objectId: workspace.getId() });
            }
        }

        var title = workspace.getLabel();
        if (workspace.getDescription()) {
            title += ' - ' + workspace.getDescription();
        }
        var entryIcon = _react2["default"].createElement("span", { className: icon, style: iconStyle });
        var wsBlock = _react2["default"].createElement(
            ContextMenuWrapper,
            {
                node: menuNode,
                className: currentClass,
                onClick: onClick,
                onMouseOver: onHover,
                onMouseOut: onOut,
                style: style
            },
            entryIcon,
            _react2["default"].createElement(
                "span",
                { className: "workspace-label", title: title },
                workspace.getLabel()
            ),
            chatIcon,
            treeToggle,
            _react2["default"].createElement("span", { style: { flex: 1 } }),
            additionalAction,
            _react2["default"].createElement(
                _materialUi.Popover,
                {
                    open: popoverOpen,
                    anchorEl: popoverAnchor,
                    useLayerForClickAway: true,
                    autoCloseWhenOffScreen: false,
                    canAutoPosition: true,
                    onRequestClose: function () {
                        _this2.setState({ popoverOpen: false });
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
            return _react2["default"].createElement(
                "div",
                null,
                wsBlock,
                _react2["default"].createElement(FoldersTree, {
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
    };

    _createClass(WorkspaceEntry, null, [{
        key: "propTypes",
        value: {
            pydio: _react2["default"].PropTypes.instanceOf(_pydio2["default"]).isRequired,
            workspace: _react2["default"].PropTypes.instanceOf(Repository).isRequired,
            showFoldersTree: _react2["default"].PropTypes.bool,
            onHoverLink: _react2["default"].PropTypes.func,
            onOutLink: _react2["default"].PropTypes.func
        },
        enumerable: true
    }]);

    return WorkspaceEntry;
})(_react2["default"].Component);

var ContextMenuWrapper = function ContextMenuWrapper(props) {
    var canDrop = props.canDrop;
    var isOver = props.isOver;
    var connectDropTarget = props.connectDropTarget;

    var className = props.className || '';
    if (canDrop && isOver) {
        className += ' droppable-active';
    }
    return _react2["default"].createElement("div", _extends({}, props, {
        className: className,
        ref: function (instance) {
            var node = ReactDOM.findDOMNode(instance);
            if (typeof connectDropTarget === 'function') connectDropTarget(node);
        }
    }));
};
//ContextMenuWrapper = withContextMenu(ContextMenuWrapper)
ContextMenuWrapper = _reactDnd.DropTarget(Types.NODE_PROVIDER, nodeDropTarget, collectDrop)(ContextMenuWrapper);
exports["default"] = WorkspaceEntry = _materialUiStyles.muiThemeable()(WorkspaceEntry);

exports["default"] = WorkspaceEntry;
module.exports = exports["default"];
