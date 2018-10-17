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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioModelAction = require('pydio/model/action');

var _pydioModelAction2 = _interopRequireDefault(_pydioModelAction);

var _MessagesProviderMixin = require('../MessagesProviderMixin');

var _MessagesProviderMixin2 = _interopRequireDefault(_MessagesProviderMixin);

var _Breadcrumb = require('./Breadcrumb');

var _Breadcrumb2 = _interopRequireDefault(_Breadcrumb);

var _search = require('../search');

var _MainFilesList = require('./MainFilesList');

var _MainFilesList2 = _interopRequireDefault(_MainFilesList);

var _EditionPanel = require('./EditionPanel');

var _EditionPanel2 = _interopRequireDefault(_EditionPanel);

var _detailpanesInfoPanel = require('../detailpanes/InfoPanel');

var _detailpanesInfoPanel2 = _interopRequireDefault(_detailpanesInfoPanel);

var _leftnavLeftPanel = require('../leftnav/LeftPanel');

var _leftnavLeftPanel2 = _interopRequireDefault(_leftnavLeftPanel);

var _WelcomeTour = require('./WelcomeTour');

var _WelcomeTour2 = _interopRequireDefault(_WelcomeTour);

var _CellChat = require('./CellChat');

var _CellChat2 = _interopRequireDefault(_CellChat);

var _materialUi = require('material-ui');

var _AddressBookPanel = require('./AddressBookPanel');

var _AddressBookPanel2 = _interopRequireDefault(_AddressBookPanel);

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var withContextMenu = _Pydio$requireLib.withContextMenu;
var dropProvider = _Pydio$requireLib.dropProvider;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var ButtonMenu = _Pydio$requireLib2.ButtonMenu;
var Toolbar = _Pydio$requireLib2.Toolbar;
var ListPaginator = _Pydio$requireLib2.ListPaginator;
var ContextMenu = _Pydio$requireLib2.ContextMenu;

var FSTemplate = _react2['default'].createClass({
    displayName: 'FSTemplate',

    mixins: [_MessagesProviderMixin2['default']],

    propTypes: {
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default'])
    },

    statics: {
        INFO_PANEL_WIDTH: 270
    },

    openRightPanel: function openRightPanel(name) {
        var _this = this;

        this.setState({ rightColumnState: name }, function () {
            var infoPanelOpen = _this.state.infoPanelOpen;

            if (name !== 'info-panel') {
                infoPanelOpen = true;
            }
            localStorage.setItem('pydio.layout.rightColumnState', name);
            localStorage.setItem('pydio.layout.infoPanelToggle', 'open');
            localStorage.setItem('pydio.layout.infoPanelOpen', infoPanelOpen ? 'open' : 'closed');
            _this.setState({ infoPanelToggle: true, infoPanelOpen: infoPanelOpen }, function () {
                return _this.resizeAfterTransition();
            });
        });
    },

    closeRightPanel: function closeRightPanel() {
        var _this2 = this;

        this.setState({ infoPanelToggle: false }, function () {
            _this2.resizeAfterTransition();
        });
        localStorage.setItem('pydio.layout.rightColumnState', '');
        localStorage.setItem('pydio.layout.infoPanelToggle', 'closed');
    },

    getInitialState: function getInitialState() {
        var rState = 'info-panel';
        if (localStorage.getItem('pydio.layout.rightColumnState') !== undefined && localStorage.getItem('pydio.layout.rightColumnState')) {
            rState = localStorage.getItem('pydio.layout.rightColumnState');
        }
        var closedToggle = localStorage.getItem('pydio.layout.infoPanelToggle') === 'closed';
        var closedInfo = localStorage.getItem('pydio.layout.infoPanelOpen') === 'closed';
        return {
            infoPanelOpen: !closedInfo,
            infoPanelToggle: !closedToggle,
            drawerOpen: false,
            rightColumnState: rState
        };
    },

    resizeAfterTransition: function resizeAfterTransition() {
        var _this3 = this;

        setTimeout(function () {
            if (_this3.refs.list) {
                _this3.refs.list.resize();
            }
            if (!_this3.state.infoPanelToggle) {
                _this3.setState({ rightColumnState: null });
            }
        }, 500);
    },

    infoPanelContentChange: function infoPanelContentChange(numberOfCards) {
        var _this4 = this;

        this.setState({ infoPanelOpen: numberOfCards > 0 }, function () {
            return _this4.resizeAfterTransition();
        });
    },

    openDrawer: function openDrawer(event) {
        event.stopPropagation();
        this.setState({ drawerOpen: true });
    },

    closeDrawer: function closeDrawer() {
        if (!this.state.drawerOpen) {
            return;
        }
        this.setState({ drawerOpen: false });
    },

    render: function render() {
        var _this5 = this;

        var connectDropTarget = this.props.connectDropTarget || function (c) {
            return c;
        };
        var mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;

        /*
        var isOver = this.props.isOver;
        var canDrop = this.props.canDrop;
        */

        var Color = MaterialUI.Color;
        var appBarColor = Color(this.props.muiTheme.appBar.color);
        var appBarTextColor = Color(this.props.muiTheme.appBar.textColor);

        var styles = {
            appBarStyle: {
                zIndex: 1,
                backgroundColor: this.props.muiTheme.appBar.color,
                height: 100
            },
            buttonsStyle: {
                width: 42,
                height: 42,
                borderBottom: 0,
                color: appBarTextColor.fade(0.03).toString()
            },
            buttonsIconStyle: {
                fontSize: 18,
                color: appBarTextColor.fade(0.03).toString()
            },
            activeButtonStyle: {
                borderBottom: '2px solid rgba(255,255,255,0.97)'
            },
            activeButtonIconStyle: {
                color: 'rgba(255,255,255,0.97)'
            },
            raisedButtonStyle: {
                height: 30,
                minWidth: 0
            },
            raisedButtonLabelStyle: {
                height: 30,
                lineHeight: '30px'
            },
            infoPanelStyle: {
                //backgroundColor: appBarColor.lightness(95).rgb().toString()
                backgroundColor: '#fafafa',
                borderLeft: '1px solid #e0e0e0'
            }
        };

        // Merge active styles
        styles.activeButtonStyle = _extends({}, styles.buttonsStyle, styles.activeButtonStyle);
        styles.activeButtonIconStyle = _extends({}, styles.buttonsIconStyle, styles.activeButtonIconStyle);

        var _state = this.state;
        var infoPanelOpen = _state.infoPanelOpen;
        var drawerOpen = _state.drawerOpen;
        var infoPanelToggle = _state.infoPanelToggle;
        var rightColumnState = this.state.rightColumnState;

        var classes = ['vertical_layout', 'vertical_fit', 'react-fs-template'];
        if (infoPanelOpen && infoPanelToggle) {
            classes.push('info-panel-open');
        }
        if (drawerOpen) {
            classes.push('drawer-open');
        }

        var mainToolbars = ["info_panel", "info_panel_share"];
        var mainToolbarsOthers = ["change", "other"];
        if (infoPanelOpen && infoPanelToggle && rightColumnState === 'info-panel') {
            mainToolbars = ["change_main"];
            mainToolbarsOthers = ["get", "change", "other"];
        }

        var pydio = this.props.pydio;

        var guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : [];
        var wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');

        var showChatTab = true;
        var showAddressBook = true;
        var repo = pydio.user.getRepositoriesList().get(pydio.user.activeRepository);
        if (repo && !repo.getOwner()) {
            showChatTab = false;
            if (rightColumnState === 'chat') {
                rightColumnState = 'info-panel';
            }
        }
        if (pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS")) {
            showChatTab = false;
        }
        if (pydio.getPluginConfigs("action.user").get("DASH_DISABLE_ADDRESS_BOOK")) {
            showAddressBook = false;
        }

        // Making sure we only pass the style to the parent element
        var _props = this.props;
        var style = _props.style;

        var props = _objectWithoutProperties(_props, ['style']);

        return connectDropTarget(_react2['default'].createElement(
            'div',
            { style: _extends({}, style, { overflow: 'hidden' }), className: classes.join(' '), onTouchTap: this.closeDrawer, onContextMenu: this.props.onContextMenu },
            wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate'] && _react2['default'].createElement(_WelcomeTour2['default'], { ref: 'welcome', pydio: this.props.pydio }),
            _react2['default'].createElement(_leftnavLeftPanel2['default'], { className: 'left-panel', pydio: props.pydio }),
            _react2['default'].createElement(
                'div',
                { className: 'desktop-container vertical_layout vertical_fit' },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: styles.appBarStyle, rounded: false },
                    _react2['default'].createElement(
                        'div',
                        { id: 'workspace_toolbar', style: { display: 'flex', height: 58 } },
                        _react2['default'].createElement(
                            'span',
                            { className: 'drawer-button' },
                            _react2['default'].createElement(_materialUi.IconButton, { style: { color: 'white' }, iconClassName: 'mdi mdi-menu', onTouchTap: this.openDrawer })
                        ),
                        _react2['default'].createElement(_Breadcrumb2['default'], _extends({}, props, { startWithSeparator: false })),
                        _react2['default'].createElement('span', { style: { flex: 1 } }),
                        _react2['default'].createElement(_search.SearchForm, props)
                    ),
                    _react2['default'].createElement(
                        'div',
                        { id: 'main_toolbar' },
                        _react2['default'].createElement(ButtonMenu, _extends({}, props, {
                            buttonStyle: styles.raisedButtonStyle,
                            buttonLabelStyle: styles.raisedButtonLabelStyle,
                            id: 'create-button-menu',
                            toolbars: ["upload", "create"],
                            buttonTitle: this.props.pydio.MessageHash['198'],
                            raised: true,
                            secondary: true,
                            controller: props.pydio.Controller,
                            openOnEvent: 'tutorial-open-create-menu'
                        })),
                        !mobile && _react2['default'].createElement(Toolbar, _extends({}, props, {
                            id: 'main-toolbar',
                            toolbars: mainToolbars,
                            groupOtherList: mainToolbarsOthers,
                            renderingType: 'button',
                            buttonStyle: styles.buttonsStyle
                        })),
                        mobile && _react2['default'].createElement('span', { style: { flex: 1 } }),
                        _react2['default'].createElement(ListPaginator, {
                            id: 'paginator-toolbar',
                            dataModel: props.pydio.getContextHolder(),
                            toolbarDisplay: true
                        }),
                        _react2['default'].createElement(Toolbar, _extends({}, props, {
                            id: 'display-toolbar',
                            toolbars: ["display_toolbar"],
                            renderingType: 'icon-font',
                            buttonStyle: styles.buttonsIconStyle
                        })),
                        _react2['default'].createElement('div', { style: { borderLeft: '1px solid ' + appBarTextColor.fade(0.77).toString(), margin: 10, marginBottom: 4 } }),
                        _react2['default'].createElement(
                            'div',
                            { style: { marginTop: -3, display: 'flex' } },
                            _react2['default'].createElement(_materialUi.IconButton, {
                                iconClassName: "mdi mdi-information",
                                style: rightColumnState === 'info-panel' ? styles.activeButtonStyle : styles.buttonsStyle,
                                iconStyle: rightColumnState === 'info-panel' ? styles.activeButtonIconStyle : styles.buttonsIconStyle,
                                onTouchTap: function () {
                                    _this5.openRightPanel('info-panel');
                                },
                                tooltip: pydio.MessageHash['341']
                            }),
                            showChatTab && _react2['default'].createElement(_materialUi.IconButton, {
                                iconClassName: "mdi mdi-message-text",
                                style: rightColumnState === 'chat' ? styles.activeButtonStyle : styles.buttonsStyle,
                                iconStyle: rightColumnState === 'chat' ? styles.activeButtonIconStyle : styles.buttonsIconStyle,
                                onTouchTap: function () {
                                    _this5.openRightPanel('chat');
                                },
                                tooltip: pydio.MessageHash['635']
                            }),
                            showAddressBook && _react2['default'].createElement(_materialUi.IconButton, {
                                iconClassName: "mdi mdi-account-card-details",
                                style: rightColumnState === 'address-book' ? styles.activeButtonStyle : styles.buttonsStyle,
                                iconStyle: rightColumnState === 'address-book' ? styles.activeButtonIconStyle : styles.buttonsIconStyle,
                                onTouchTap: function () {
                                    _this5.openRightPanel('address-book');
                                },
                                tooltip: pydio.MessageHash['592']
                            }),
                            _react2['default'].createElement(_materialUi.IconButton, {
                                iconClassName: "mdi mdi-close",
                                style: styles.buttonsStyle,
                                iconStyle: styles.buttonsIconStyle,
                                onTouchTap: function () {
                                    _this5.closeRightPanel();
                                },
                                disabled: !rightColumnState,
                                tooltip: pydio.MessageHash['86']
                            })
                        )
                    )
                ),
                _react2['default'].createElement(_MainFilesList2['default'], { ref: 'list', pydio: this.props.pydio })
            ),
            rightColumnState === 'info-panel' && _react2['default'].createElement(_detailpanesInfoPanel2['default'], _extends({}, props, {
                dataModel: props.pydio.getContextHolder(),
                onContentChange: this.infoPanelContentChange,
                style: styles.infoPanelStyle
            })),
            rightColumnState === 'chat' && _react2['default'].createElement(_CellChat2['default'], { pydio: pydio }),
            rightColumnState === 'address-book' && _react2['default'].createElement(_AddressBookPanel2['default'], { pydio: pydio }),
            _react2['default'].createElement(_EditionPanel2['default'], props),
            _react2['default'].createElement(
                'span',
                { className: 'context-menu' },
                _react2['default'].createElement(ContextMenu, { pydio: this.props.pydio })
            )
        ));
    }
});

exports['default'] = FSTemplate = dropProvider(FSTemplate);
exports['default'] = FSTemplate = withContextMenu(FSTemplate);
exports['default'] = FSTemplate = _materialUiStyles.muiThemeable()(FSTemplate);

exports['default'] = FSTemplate;
module.exports = exports['default'];
