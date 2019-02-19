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

var _WelcomeTour = require('./WelcomeTour');

var _WelcomeTour2 = _interopRequireDefault(_WelcomeTour);

var _CellChat = require('./CellChat');

var _CellChat2 = _interopRequireDefault(_CellChat);

var _materialUi = require('material-ui');

var _AddressBookPanel = require('./AddressBookPanel');

var _AddressBookPanel2 = _interopRequireDefault(_AddressBookPanel);

var _MasterLayout = require('./MasterLayout');

var _MasterLayout2 = _interopRequireDefault(_MasterLayout);

var _materialUiStyles = require('material-ui/styles');

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var ButtonMenu = _Pydio$requireLib.ButtonMenu;
var Toolbar = _Pydio$requireLib.Toolbar;
var ListPaginator = _Pydio$requireLib.ListPaginator;

var FSTemplate = _react2['default'].createClass({
    displayName: 'FSTemplate',

    mixins: [_MessagesProviderMixin2['default']],

    propTypes: {
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default'])
    },

    statics: {
        INFO_PANEL_WIDTH: 270
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        var pydio = this.props.pydio;

        this._themeObserver = function (user) {
            if (user) {
                var uTheme = undefined;
                if (!user.getPreference('theme') || user.getPreference('theme') === 'default') {
                    uTheme = pydio.getPluginConfigs('gui.ajax').get('GUI_THEME');
                } else {
                    uTheme = user.getPreference('theme');
                }
                _this.setState({ themeLight: uTheme === 'light' });
            }
        };
        pydio.observe('user_logged', this._themeObserver);
        this._resizer = function () {
            var w = _pydioUtilDom2['default'].getViewportWidth();
            _this.setState({
                smallScreen: w < 758,
                xtraSmallScreen: w <= 420
            });
        };
        _pydioUtilDom2['default'].observeWindowResize(this._resizer);
    },

    componentWillUnmount: function componentWillUnmount() {
        var pydio = this.props.pydio;

        pydio.stopObserving('user_logged', this._themeObserver);
        _pydioUtilDom2['default'].stopObservingWindowResize(this._resizer);
    },

    openRightPanel: function openRightPanel(name) {
        var _this2 = this;

        var rightColumnState = this.state.rightColumnState;

        if (name === rightColumnState) {
            this.closeRightPanel();
            return;
        }
        this.setState({ rightColumnState: name }, function () {
            var infoPanelOpen = _this2.state.infoPanelOpen;

            if (name !== 'info-panel') {
                infoPanelOpen = true;
            }
            if (name !== 'advanced-search') {
                localStorage.setItem('pydio.layout.rightColumnState', name);
                localStorage.setItem('pydio.layout.infoPanelToggle', 'open');
                localStorage.setItem('pydio.layout.infoPanelOpen', infoPanelOpen ? 'open' : 'closed');
            }
            _this2.setState({ infoPanelToggle: true, infoPanelOpen: infoPanelOpen }, function () {
                return _this2.resizeAfterTransition();
            });
        });
    },

    closeRightPanel: function closeRightPanel() {
        var _this3 = this;

        var rightColumnState = this.state.rightColumnState;

        if (rightColumnState === 'advanced-search') {
            // Reopen last saved state
            var rState = localStorage.getItem('pydio.layout.rightColumnState');
            if (rState !== undefined && rState && rState !== 'advanced-search') {
                this.openRightPanel(rState);
            } else {
                this.setState({ infoPanelToggle: false }, function () {
                    _this3.resizeAfterTransition();
                });
            }
        } else {
            this.setState({ infoPanelToggle: false }, function () {
                _this3.resizeAfterTransition();
            });
            localStorage.setItem('pydio.layout.rightColumnState', '');
            localStorage.setItem('pydio.layout.infoPanelToggle', 'closed');
        }
    },

    getInitialState: function getInitialState() {
        var rState = 'info-panel';
        if (localStorage.getItem('pydio.layout.rightColumnState') !== undefined && localStorage.getItem('pydio.layout.rightColumnState')) {
            rState = localStorage.getItem('pydio.layout.rightColumnState');
        }
        var closedToggle = localStorage.getItem('pydio.layout.infoPanelToggle') === 'closed';
        var closedInfo = localStorage.getItem('pydio.layout.infoPanelOpen') === 'closed';
        var pydio = this.props.pydio;

        var themeLight = false;
        if (pydio.user && pydio.user.getPreference('theme') && pydio.user.getPreference('theme') !== 'default') {
            themeLight = pydio.user.getPreference('theme') === 'light';
        } else if (pydio.getPluginConfigs('gui.ajax').get('GUI_THEME') === 'light') {
            themeLight = true;
        }
        var w = _pydioUtilDom2['default'].getViewportWidth();
        return {
            infoPanelOpen: !closedInfo,
            infoPanelToggle: !closedToggle,
            drawerOpen: false,
            rightColumnState: rState,
            searchFormState: {},
            themeLight: themeLight,
            smallScreen: w <= 758,
            xtraSmallScreen: w <= 420
        };
    },

    resizeAfterTransition: function resizeAfterTransition() {
        var _this4 = this;

        setTimeout(function () {
            if (_this4.refs.list) {
                _this4.refs.list.resize();
            }
            if (!_this4.state.infoPanelToggle) {
                _this4.setState({ rightColumnState: null });
            }
        }, 300);
    },

    infoPanelContentChange: function infoPanelContentChange(numberOfCards) {
        var _this5 = this;

        this.setState({ infoPanelOpen: numberOfCards > 0 }, function () {
            return _this5.resizeAfterTransition();
        });
    },

    openDrawer: function openDrawer(event) {
        event.stopPropagation();
        this.setState({ drawerOpen: true });
    },

    render: function render() {
        var _this6 = this;

        var muiTheme = this.props.muiTheme;

        var mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;
        var Color = MaterialUI.Color;

        var appBarTextColor = Color(muiTheme.appBar.textColor);
        var appBarBackColor = Color(muiTheme.appBar.color);

        var colorHue = Color(muiTheme.palette.primary1Color).hsl().array()[0];
        var superLightBack = new Color({ h: colorHue, s: 35, l: 98 });

        // Load from user prefs
        var _state = this.state;
        var themeLight = _state.themeLight;
        var smallScreen = _state.smallScreen;
        var xtraSmallScreen = _state.xtraSmallScreen;

        if (themeLight) {
            appBarBackColor = superLightBack; //Color('#fafafa');
            appBarTextColor = Color(muiTheme.appBar.color);
        }

        var headerHeight = 72;
        var buttonsHeight = 23;
        var buttonsFont = 11;
        var crtWidth = _pydioUtilDom2['default'].getViewportWidth();

        var styles = {
            appBarStyle: {
                zIndex: 1,
                backgroundColor: appBarBackColor.toString(),
                height: headerHeight,
                display: 'flex'
            },
            //borderBottom: themeLight?'1px solid #e0e0e0':null
            buttonsStyle: {
                width: 40,
                height: 40,
                padding: 10,
                borderRadius: '50%',
                color: appBarTextColor.fade(0.03).toString(),
                transition: _pydioUtilDom2['default'].getBeziersTransition()
            },
            buttonsIconStyle: {
                fontSize: 18,
                color: appBarTextColor.fade(0.03).toString()
            },
            activeButtonStyle: {
                backgroundColor: appBarTextColor.fade(0.9).toString()
            },
            activeButtonIconStyle: {
                color: appBarTextColor.fade(0.03).toString() //'rgba(255,255,255,0.97)'
            },
            raisedButtonStyle: {
                height: buttonsHeight,
                minWidth: 0
            },
            raisedButtonLabelStyle: {
                height: buttonsHeight,
                paddingLeft: 12,
                paddingRight: 8,
                lineHeight: buttonsHeight + 'px',
                fontSize: buttonsFont
            },
            flatButtonStyle: {
                height: buttonsHeight,
                lineHeight: buttonsHeight + 'px',
                minWidth: 0
            },
            flatButtonLabelStyle: {
                height: buttonsHeight,
                fontSize: buttonsFont,
                paddingLeft: 8,
                paddingRight: 8,
                color: appBarTextColor.fade(0.03).toString()
            },
            infoPanelStyle: {
                backgroundColor: 'transparent',
                top: headerHeight
            },
            otherPanelsStyle: {
                top: headerHeight,
                borderLeft: 0,
                margin: 10,
                width: 290
            },
            searchFormPanelStyle: {
                top: headerHeight,
                borderLeft: 0,
                margin: 10,
                width: smallScreen ? xtraSmallScreen ? crtWidth : 420 : 520,
                right: xtraSmallScreen ? -10 : null,
                overflowY: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white'
            },
            breadcrumbStyle: {},
            searchForm: {}
        };

        // Merge active styles
        styles.activeButtonStyle = _extends({}, styles.buttonsStyle, styles.activeButtonStyle);
        styles.activeButtonIconStyle = _extends({}, styles.buttonsIconStyle, styles.activeButtonIconStyle);

        var _state2 = this.state;
        var infoPanelOpen = _state2.infoPanelOpen;
        var drawerOpen = _state2.drawerOpen;
        var infoPanelToggle = _state2.infoPanelToggle;
        var rightColumnState = this.state.rightColumnState;

        var mainToolbars = ["change_main", "info_panel", "info_panel_share"];
        var mainToolbarsOthers = ["change", "other"];

        var pydio = this.props.pydio;

        var guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : [];
        var wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');

        var showChatTab = !pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS");
        var showAddressBook = !pydio.getPluginConfigs("action.user").get("DASH_DISABLE_ADDRESS_BOOK") && !smallScreen;
        var showInfoPanel = !xtraSmallScreen;
        if (showChatTab) {
            var repo = pydio.user.getRepositoriesList().get(pydio.user.activeRepository);
            if (repo && !repo.getOwner()) {
                showChatTab = false;
            }
        }
        if (!showChatTab && rightColumnState === 'chat') {
            rightColumnState = 'info-panel';
        }
        if (!showInfoPanel && rightColumnState === 'info-panel') {
            rightColumnState = '';
        }

        var classes = ['vertical_layout', 'vertical_fit', 'react-fs-template'];
        if (infoPanelOpen && infoPanelToggle) {
            classes.push('info-panel-open');
            if (rightColumnState !== 'info-panel') {
                classes.push('info-panel-open-lg');
            }
        }

        // Making sure we only pass the style to the parent element
        var _props = this.props;
        var style = _props.style;

        var props = _objectWithoutProperties(_props, ['style']);

        var tutorialComponent = undefined;
        if (wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate']) {
            tutorialComponent = _react2['default'].createElement(_WelcomeTour2['default'], { ref: 'welcome', pydio: this.props.pydio });
        }

        var uWidgetColor = 'rgba(255,255,255,.93)';
        var uWidgetBack = null;
        if (themeLight) {
            var _colorHue = Color(muiTheme.palette.primary1Color).hsl().array()[0];
            uWidgetColor = Color(muiTheme.palette.primary1Color).darken(0.1).alpha(0.87);
            uWidgetBack = new Color({ h: _colorHue, s: 35, l: 98 });
        }

        var newButtonProps = {
            buttonStyle: _extends({}, styles.flatButtonStyle, { marginRight: 4 }),
            buttonLabelStyle: _extends({}, styles.flatButtonLabelStyle),
            buttonBackgroundColor: 'rgba(255,255,255,0.17)',
            buttonHoverColor: 'rgba(255,255,255,0.33)'
        };

        var leftPanelProps = {
            headerHeight: headerHeight,
            userWidgetProps: {
                color: uWidgetColor,
                mergeButtonInAvatar: true,
                popoverDirection: 'left',
                actionBarStyle: {
                    marginTop: 0
                },
                style: {
                    height: headerHeight,
                    display: 'flex',
                    alignItems: 'center'
                }
            }
        };
        if (themeLight) {
            leftPanelProps.userWidgetProps.style = _extends({}, leftPanelProps.userWidgetProps.style, {
                boxShadow: 'none',
                backgroundColor: uWidgetBack,
                borderRight: '1px solid #e0e0e0'
            });
            styles.breadcrumbStyle = {
                color: appBarTextColor.toString() // '#616161',
            };
            styles.searchForm = {
                mainStyle: { border: '1px solid ' + appBarTextColor.fade(0.8).toString() },
                inputStyle: { color: appBarTextColor.toString() },
                hintStyle: { color: appBarTextColor.fade(0.5).toString() },
                magnifierStyle: { color: appBarTextColor.fade(0.1).toString() }
            };
            newButtonProps.buttonLabelStyle.color = muiTheme.palette.accent1Color;
            newButtonProps.buttonBackgroundColor = 'rgba(0,0,0,0.05)';
            newButtonProps.buttonHoverColor = 'rgba(0,0,0,0.10)';
        }

        var searchForm = _react2['default'].createElement(_search.SearchForm, _extends({}, props, this.state.searchFormState, {
            formStyles: styles.searchForm,
            style: rightColumnState === "advanced-search" ? styles.searchFormPanelStyle : {},
            id: rightColumnState === "advanced-search" ? "info_panel" : null,
            headerHeight: headerHeight,
            advancedPanel: rightColumnState === "advanced-search",
            onOpenAdvanced: function () {
                _this6.openRightPanel('advanced-search');
            },
            onCloseAdvanced: function () {
                _this6.closeRightPanel();
            },
            onUpdateState: function (s) {
                _this6.setState({ searchFormState: s });
            },
            smallScreen: smallScreen,
            xtraSmallScreen: xtraSmallScreen
        }));

        return _react2['default'].createElement(
            _MasterLayout2['default'],
            {
                pydio: pydio,
                style: _extends({}, style, { overflow: 'hidden' }),
                classes: classes,
                tutorialComponent: tutorialComponent,
                drawerOpen: drawerOpen,
                leftPanelProps: leftPanelProps,
                onCloseDrawerRequested: function () {
                    _this6.setState({ drawerOpen: false });
                }
            },
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: themeLight ? 0 : 1, style: styles.appBarStyle, rounded: false },
                _react2['default'].createElement(
                    'div',
                    { id: 'workspace_toolbar', style: { flex: 1, width: 'calc(100% - 430px)', display: 'flex' } },
                    _react2['default'].createElement(
                        'span',
                        { className: 'drawer-button', style: { marginLeft: 12, marginRight: -6 } },
                        _react2['default'].createElement(_materialUi.IconButton, { iconStyle: { color: appBarTextColor.fade(0.03).toString() }, iconClassName: 'mdi mdi-menu', onTouchTap: this.openDrawer })
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, overflow: 'hidden' } },
                        _react2['default'].createElement(_Breadcrumb2['default'], _extends({}, props, { startWithSeparator: false, rootStyle: styles.breadcrumbStyle })),
                        _react2['default'].createElement(
                            'div',
                            { style: { height: 32, paddingLeft: 20, alignItems: 'center', display: 'flex', overflow: 'hidden' } },
                            _react2['default'].createElement(ButtonMenu, _extends({}, props, newButtonProps, {
                                id: 'create-button-menu',
                                toolbars: ["upload", "create"],
                                buttonTitle: this.props.pydio.MessageHash['198'],
                                raised: false,
                                secondary: true,
                                controller: props.pydio.Controller,
                                openOnEvent: 'tutorial-open-create-menu'
                            })),
                            _react2['default'].createElement(ListPaginator, {
                                id: 'paginator-toolbar',
                                style: { height: 23, borderRadius: 2, background: newButtonProps.buttonBackgroundColor, marginRight: 5 },
                                dataModel: props.pydio.getContextHolder(),
                                smallDisplay: true,
                                toolbarDisplay: true,
                                toolbarColor: appBarTextColor
                            }),
                            !mobile && _react2['default'].createElement(Toolbar, _extends({}, props, {
                                id: 'main-toolbar',
                                toolbars: mainToolbars,
                                groupOtherList: mainToolbarsOthers,
                                renderingType: 'button',
                                toolbarStyle: { flex: 1, overflow: 'hidden' },
                                flatButtonStyle: styles.flatButtonStyle,
                                buttonStyle: styles.flatButtonLabelStyle
                            })),
                            mobile && _react2['default'].createElement('span', { style: { flex: 1 } })
                        )
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(Toolbar, _extends({}, props, {
                        id: 'display-toolbar',
                        toolbars: ["display_toolbar"],
                        renderingType: 'icon-font',
                        mergeItemsAsOneMenu: true,
                        mergedMenuIcom: "mdi mdi-settings",
                        mergedMenuTitle: "Display Settings",
                        buttonStyle: styles.buttonsIconStyle,
                        flatButtonStyle: styles.buttonsStyle
                    })),
                    _react2['default'].createElement(
                        'div',
                        { style: { position: 'relative', width: rightColumnState === "advanced-search" || smallScreen ? 40 : 150, transition: _pydioUtilDom2['default'].getBeziersTransition() } },
                        !smallScreen && rightColumnState !== "advanced-search" && searchForm,
                        (rightColumnState === "advanced-search" || smallScreen) && _react2['default'].createElement(_materialUi.IconButton, {
                            iconClassName: "mdi mdi-magnify",
                            style: rightColumnState === "advanced-search" ? styles.activeButtonStyle : styles.buttonsStyle,
                            iconStyle: rightColumnState === "advanced-search" ? styles.activeButtonIconStyle : styles.buttonsIconStyle,
                            onTouchTap: function () {
                                _this6.openRightPanel('advanced-search');
                            },
                            tooltip: pydio.MessageHash[rightColumnState === 'info-panel' ? '86' : '87']
                        })
                    ),
                    _react2['default'].createElement('div', { style: { borderLeft: '1px solid ' + appBarTextColor.fade(0.77).toString(), margin: '0 10px', height: headerHeight, display: 'none' } }),
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', paddingRight: 10 } },
                        showInfoPanel && _react2['default'].createElement(_materialUi.IconButton, {
                            iconClassName: "mdi mdi-information",
                            style: rightColumnState === 'info-panel' ? styles.activeButtonStyle : styles.buttonsStyle,
                            iconStyle: rightColumnState === 'info-panel' ? styles.activeButtonIconStyle : styles.buttonsIconStyle,
                            onTouchTap: function () {
                                _this6.openRightPanel('info-panel');
                            },
                            tooltip: pydio.MessageHash[rightColumnState === 'info-panel' ? '86' : '341']
                        }),
                        showAddressBook && _react2['default'].createElement(_materialUi.IconButton, {
                            iconClassName: "mdi mdi-account-card-details",
                            style: rightColumnState === 'address-book' ? styles.activeButtonStyle : styles.buttonsStyle,
                            iconStyle: rightColumnState === 'address-book' ? styles.activeButtonIconStyle : styles.buttonsIconStyle,
                            onTouchTap: function () {
                                _this6.openRightPanel('address-book');
                            },
                            tooltip: pydio.MessageHash[rightColumnState === 'address-book' ? '86' : '592'],
                            tooltipPosition: showChatTab ? "bottom-center" : "bottom-left"
                        }),
                        showChatTab && _react2['default'].createElement(_materialUi.IconButton, {
                            iconClassName: "mdi mdi-message-text",
                            style: rightColumnState === 'chat' ? styles.activeButtonStyle : styles.buttonsStyle,
                            iconStyle: rightColumnState === 'chat' ? styles.activeButtonIconStyle : styles.buttonsIconStyle,
                            onTouchTap: function () {
                                _this6.openRightPanel('chat');
                            },
                            tooltip: pydio.MessageHash[rightColumnState === 'chat' ? '86' : '635'],
                            tooltipPosition: "bottom-left"
                        })
                    )
                )
            ),
            _react2['default'].createElement(_MainFilesList2['default'], { ref: 'list', pydio: pydio }),
            rightColumnState === 'info-panel' && _react2['default'].createElement(_detailpanesInfoPanel2['default'], _extends({}, props, {
                dataModel: props.pydio.getContextHolder(),
                onRequestClose: function () {
                    _this6.closeRightPanel();
                },
                onContentChange: this.infoPanelContentChange,
                style: styles.infoPanelStyle
            })),
            rightColumnState === 'chat' && _react2['default'].createElement(_CellChat2['default'], { pydio: pydio, style: styles.otherPanelsStyle, zDepth: 1, onRequestClose: function () {
                    _this6.closeRightPanel();
                } }),
            rightColumnState === 'address-book' && _react2['default'].createElement(_AddressBookPanel2['default'], { pydio: pydio, style: styles.otherPanelsStyle, zDepth: 1, onRequestClose: function () {
                    _this6.closeRightPanel();
                } }),
            rightColumnState === "advanced-search" && searchForm,
            _react2['default'].createElement(_EditionPanel2['default'], props)
        );
    }
});

//FSTemplate = dropProvider(FSTemplate);
//FSTemplate = withContextMenu(FSTemplate);
exports['default'] = FSTemplate = _materialUiStyles.muiThemeable()(FSTemplate);

exports['default'] = FSTemplate;
module.exports = exports['default'];
