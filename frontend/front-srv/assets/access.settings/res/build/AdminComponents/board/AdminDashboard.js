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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _utilMixins = require('../util/Mixins');

var _AdminLeftNav = require('./AdminLeftNav');

var _AdminLeftNav2 = _interopRequireDefault(_AdminLeftNav);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _Pydio$requireLib = _pydio2['default'].requireLib('workspaces');

var UserWidget = _Pydio$requireLib.UserWidget;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var AsyncComponent = _Pydio$requireLib2.AsyncComponent;

var styles = {
    appBar: {
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        //backgroundColor:muiTheme.palette.primary1Color,
        color: 'white',
        display: 'flex',
        alignItems: 'center'
    },
    appBarTitle: {
        flex: 1,
        fontSize: 18,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    appBarButton: {
        padding: 14
    },
    appBarButtonIcon: {
        color: 'white',
        fontSize: 20
    },
    appBarLeftIcon: {
        color: 'white'
    },
    mainPanel: {
        position: 'absolute',
        top: 56,
        left: 256, // can be changed by leftDocked state
        right: 0,
        bottom: 0,
        backgroundColor: '#eceff1'
    },
    userWidget: {
        height: 56,
        lineHeight: '16px',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
        marginRight: 16
    }
};

var AdminDashboard = _react2['default'].createClass({
    displayName: 'AdminDashboard',

    mixins: [_utilMixins.MessagesProviderMixin, _utilMixins.PydioProviderMixin],

    propTypes: {
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired
    },

    getInitialState: function getInitialState() {
        var dm = this.props.pydio.getContextHolder();
        var showAdvanced = undefined;
        if (localStorage.getItem("cells.dashboard.advanced") !== null) {
            showAdvanced = localStorage.getItem("cells.dashboard.advanced");
        }
        if (!showAdvanced && dm.getContextNode().getMetadata().get("advanced")) {
            showAdvanced = true;
        }
        return {
            contextNode: dm.getContextNode(),
            selectedNodes: dm.getSelectedNodes(),
            contextStatus: dm.getContextNode().isLoaded(),
            openLeftNav: false,
            leftDocked: true,
            showAdvanced: showAdvanced
        };
    },

    dmChangesToState: function dmChangesToState() {
        var dm = this.props.pydio.getContextHolder();
        this.setState({
            contextNode: dm.getContextNode(),
            selectedNodes: dm.getSelectedNodes(),
            contextStatus: dm.getContextNode().isLoaded()
        });
        var showAdvanced = this.state.showAdvanced;

        if (!showAdvanced && dm.getContextNode().getMetadata().get("advanced")) {
            this.setState({ showAdvanced: true });
        }
        dm.getContextNode().observe("loaded", this.dmChangesToState);
        if (dm.getUniqueNode()) {
            dm.getUniqueNode().observe("loaded", this.dmChangesToState);
        }
    },

    openEditor: function openEditor(node) {
        this.openRightPane({
            COMPONENT: PydioComponents.ReactEditorOpener,
            PROPS: {
                node: node,
                registry: this.props.pydio.Registry,
                onRequestTabClose: this.closeRightPane,
                registerCloseCallback: this.registerRightPaneCloseCallback
            },
            CHILDREN: null
        });
    },

    openRightPane: function openRightPane(serializedComponent) {
        var _this = this;

        serializedComponent['PROPS']['registerCloseCallback'] = this.registerRightPaneCloseCallback;
        serializedComponent['PROPS']['closeEditorContainer'] = this.closeRightPane;
        // Do not open on another already opened
        if (this.state && this.state.rightPanel && this.state.rightPanelCloseCallback) {
            if (this.state.rightPanelCloseCallback() === false) {
                return;
            }
        }
        if (typeof serializedComponent.COMPONENT === 'string' || serializedComponent.COMPONENT instanceof String) {
            (function () {
                var _serializedComponent$COMPONENT$split = serializedComponent.COMPONENT.split('.');

                var _serializedComponent$COMPONENT$split2 = _slicedToArray(_serializedComponent$COMPONENT$split, 2);

                var namespace = _serializedComponent$COMPONENT$split2[0];
                var componentName = _serializedComponent$COMPONENT$split2[1];

                _pydioHttpResourcesManager2['default'].loadClassesAndApply([namespace], (function () {
                    if (window[namespace] && window[namespace][componentName]) {
                        var comp = window[namespace][componentName];
                        serializedComponent.COMPONENT = comp;
                        this.openRightPane(serializedComponent);
                    }
                }).bind(_this));
            })();
        } else {
            this.setState({ rightPanel: serializedComponent });
        }
    },

    registerRightPaneCloseCallback: function registerRightPaneCloseCallback(callback) {
        this.setState({ rightPanelCloseCallback: callback });
    },

    closeRightPane: function closeRightPane() {
        if (this.state.rightPanelCloseCallback && this.state.rightPanelCloseCallback() === false) {
            return false;
        }
        this.setState({ rightPanel: null, rightPanelCloseCallback: null });
        return true;
    },

    componentDidMount: function componentDidMount() {
        var _this2 = this;

        var dm = this.props.pydio.getContextHolder();
        dm.observe("context_changed", this.dmChangesToState);
        dm.observe("selection_changed", this.dmChangesToState);
        // Monkey Patch Open Current Selection In Editor
        var monkeyObject = this.props.pydio.UI;
        if (this.props.pydio.UI.__proto__) {
            monkeyObject = this.props.pydio.UI.__proto__;
        }
        monkeyObject.__originalOpenCurrentSelectionInEditor = monkeyObject.openCurrentSelectionInEditor;
        monkeyObject.openCurrentSelectionInEditor = (function (dataModelOrNode) {
            if (dataModelOrNode instanceof _pydioModelDataModel2['default']) {
                this.openEditor(dataModelOrNode.getUniqueNode());
            } else {
                this.openEditor(dataModelOrNode);
            }
        }).bind(this);
        this._bmObserver = (function () {
            this.props.pydio.Controller.actions['delete']("bookmark");
        }).bind(this);
        this.props.pydio.observe("actions_loaded", this._bmObserver);
        this._resizeObserver = this.computeLeftIsDocked.bind(this);
        _pydioUtilDom2['default'].observeWindowResize(this._resizeObserver);
        this.computeLeftIsDocked();
        _pydioHttpResourcesManager2['default'].loadClass("SettingsBoards").then(function (c) {
            _this2.setState({ searchComponent: { namespace: 'SettingsBoards', componentName: 'GlobalSearch' } });
        })['catch'](function (e) {});
    },

    componentWillUnmount: function componentWillUnmount() {
        var dm = this.props.pydio.getContextHolder();
        dm.stopObserving("context_changed", this.dmChangesToState);
        dm.stopObserving("selection_changed", this.dmChangesToState);
        // Restore Monkey Patch
        var monkeyObject = this.props.pydio.UI;
        if (this.props.pydio.UI.__proto__) {
            monkeyObject = this.props.pydio.UI.__proto__;
        }
        monkeyObject.openCurrentSelectionInEditor = monkeyObject.__originalOpenCurrentSelectionInEditor;
        if (this._bmObserver) {
            this.props.pydio.stopObserving("actions_loaded", this._bmObserver);
        }
        _pydioUtilDom2['default'].stopObservingWindowResize(this._resizeObserver);
    },

    computeLeftIsDocked: function computeLeftIsDocked() {
        var w = _pydioUtilDom2['default'].getViewportWidth();
        this.setState({ leftDocked: w > 780 });
    },

    routeMasterPanel: function routeMasterPanel(node, selectedNode) {
        var path = node.getPath();
        if (!selectedNode) selectedNode = node;

        var dynamicComponent = undefined;
        if (node.getMetadata().get('component')) {
            dynamicComponent = node.getMetadata().get('component');
        } else {
            return _react2['default'].createElement(
                'div',
                null,
                'No Component Found'
            );
        }
        var parts = dynamicComponent.split('.');
        var additionalProps = node.getMetadata().has('props') ? JSON.parse(node.getMetadata().get('props')) : {};
        return _react2['default'].createElement(AsyncComponent, _extends({
            pydio: this.props.pydio,
            namespace: parts[0],
            componentName: parts[1],
            dataModel: this.props.pydio.getContextHolder(),
            rootNode: node,
            currentNode: selectedNode,
            openEditor: this.openEditor,
            openRightPane: this.openRightPane,
            closeRightPane: this.closeRightPane
        }, additionalProps));
    },

    backToHome: function backToHome() {
        //this.props.pydio.triggerRepositoryChange("homepage");
        window.open('https://pydio.com');
    },

    render: function render() {
        var _this3 = this;

        var _state = this.state;
        var showAdvanced = _state.showAdvanced;
        var rightPanel = _state.rightPanel;
        var leftDocked = _state.leftDocked;
        var openLeftNav = _state.openLeftNav;
        var searchComponent = _state.searchComponent;
        var _props = this.props;
        var pydio = _props.pydio;
        var muiTheme = _props.muiTheme;

        var dm = pydio.getContextHolder();

        var rPanelContent = undefined;
        if (rightPanel) {
            rPanelContent = _react2['default'].createElement(rightPanel.COMPONENT, rightPanel.PROPS, rightPanel.CHILDREN);
        }
        var homeIconButton = undefined,
            searchIconButton = undefined,
            leftIconButton = undefined,
            toggleAdvancedButton = undefined,
            aboutButton = undefined;

        // LEFT BUTTON
        var leftIcon = undefined,
            leftIconClick = undefined;
        if (leftDocked) {
            leftIcon = "mdi mdi-tune-vertical";
            leftIconClick = function () {
                dm.requireContextChange(dm.getRootNode());
            };
        } else {
            leftIcon = "mdi mdi-view-headline";
            leftIconClick = function () {
                _this3.setState({ openLeftNav: !openLeftNav });
            };
        }
        leftIconButton = _react2['default'].createElement(
            'div',
            { style: { margin: '0 12px' } },
            _react2['default'].createElement(_materialUi.IconButton, { iconClassName: leftIcon, onTouchTap: leftIconClick, iconStyle: styles.appBarLeftIcon })
        );

        // HOME BUTTON
        if (pydio.user && pydio.user.getRepositoriesList().has('homepage')) {
            homeIconButton = _react2['default'].createElement(_materialUi.IconButton, {
                tooltip: pydio.MessageHash['ajxp_admin.home.68'],
                iconClassName: "mdi mdi-folder-open",
                onTouchTap: function () {
                    pydio.triggerRepositoryChange('homepage');
                },
                style: styles.appBarButton,
                iconStyle: styles.appBarButtonIcon
            });
        }

        // SEARCH BUTTON
        if (searchComponent) {
            searchIconButton = _react2['default'].createElement(AsyncComponent, _extends({}, searchComponent, { appBarStyles: styles, pydio: pydio }));
        }

        toggleAdvancedButton = _react2['default'].createElement(_materialUi.IconButton, {
            iconClassName: "mdi mdi-toggle-switch" + (showAdvanced ? "" : "-off"),
            style: styles.appBarButton,
            iconStyle: styles.appBarButtonIcon,
            tooltip: pydio.MessageHash['settings.topbar.button.advanced'],
            onTouchTap: function () {
                _this3.setState({ showAdvanced: !showAdvanced });
                localStorage.setItem("cells.dashboard.advanced", !showAdvanced);
            }
        });

        aboutButton = _react2['default'].createElement(_materialUi.IconButton, {
            iconClassName: "icomoon-cells",
            onTouchTap: function () {
                window.open('https://pydio.com');
            },
            tooltip: pydio.MessageHash['settings.topbar.button.about'],
            style: styles.appBarButton,
            iconStyle: styles.appBarButtonIcon
        });

        var appBarStyle = _extends({}, styles.appBar, { backgroundColor: muiTheme.palette.primary1Color });

        return _react2['default'].createElement(
            'div',
            { className: 'app-canvas' },
            _react2['default'].createElement(_AdminLeftNav2['default'], {
                pydio: this.props.pydio,
                dataModel: dm,
                rootNode: dm.getRootNode(),
                contextNode: dm.getContextNode(),
                open: leftDocked || openLeftNav,
                showAdvanced: showAdvanced
            }),
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, rounded: false, style: appBarStyle },
                leftIconButton,
                _react2['default'].createElement(
                    'span',
                    { style: styles.appBarTitle },
                    pydio.MessageHash['settings.topbar.title']
                ),
                searchIconButton,
                toggleAdvancedButton,
                homeIconButton,
                aboutButton,
                _react2['default'].createElement(UserWidget, {
                    pydio: pydio,
                    style: styles.userWidget,
                    hideActionBar: true,
                    displayLabel: false,
                    mergeButtonInAvatar: true
                })
            ),
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, className: 'main-panel', style: _extends({}, styles.mainPanel, { left: leftDocked ? 256 : 0 }) },
                this.routeMasterPanel(dm.getContextNode(), dm.getUniqueNode())
            ),
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 2, className: "paper-editor layout-fill vertical-layout" + (rightPanel ? ' visible' : '') },
                rPanelContent
            )
        );
    }
});

exports['default'] = AdminDashboard = (0, _materialUiStyles.muiThemeable)()(AdminDashboard);
exports['default'] = AdminDashboard;
module.exports = exports['default'];
