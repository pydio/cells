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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ConfigLogo = require('./ConfigLogo');

var _ConfigLogo2 = _interopRequireDefault(_ConfigLogo);

var _materialUi = require('material-ui');

var _WelcomeTour = require('./WelcomeTour');

var _WelcomeTour2 = _interopRequireDefault(_WelcomeTour);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _HomeSearchForm = require('./HomeSearchForm');

var _HomeSearchForm2 = _interopRequireDefault(_HomeSearchForm);

var _recentActivityStreams = require('../recent/ActivityStreams');

var _recentActivityStreams2 = _interopRequireDefault(_recentActivityStreams);

var _Pydio$requireLib = _pydio2['default'].requireLib('workspaces');

var LeftPanel = _Pydio$requireLib.LeftPanel;

var AltDashboard = _react2['default'].createClass({
    displayName: 'AltDashboard',

    getDefaultCards: function getDefaultCards() {

        var baseCards = [{
            id: 'quick_upload',
            componentClass: 'WelcomeComponents.QuickSendCard',
            defaultPosition: {
                x: 0, y: 10
            }
        }, {
            id: 'downloads',
            componentClass: 'WelcomeComponents.DlAppsCard',
            defaultPosition: {
                x: 0, y: 20
            }
        }, {
            id: 'qr_code',
            componentClass: 'WelcomeComponents.QRCodeCard',
            defaultPosition: {
                x: 0, y: 30
            }
        }, {
            id: 'videos',
            componentClass: 'WelcomeComponents.VideoCard',
            defaultPosition: {
                x: 0, y: 50
            }
        }];

        return baseCards;
    },

    getInitialState: function getInitialState() {
        return { unreadStatus: 0 };
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
        var pydio = this.props.pydio;

        var Color = MaterialUI.Color;

        var appBarColor = new Color(this.props.muiTheme.appBar.color);

        var guiPrefs = this.props.pydio.user ? this.props.pydio.user.getPreference('gui_preferences', true) : [];
        var wTourEnabled = this.props.pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');

        var styles = {
            appBarStyle: {
                zIndex: 1,
                backgroundColor: appBarColor.alpha(.6).toString(),
                height: 110
            },
            buttonsStyle: {
                color: this.props.muiTheme.appBar.textColor
            },
            iconButtonsStyle: {
                color: appBarColor.darken(0.4).toString()
            },
            wsListsContainerStyle: {
                position: 'absolute',
                zIndex: 10,
                top: 118,
                bottom: 0,
                right: 10,
                left: 260,
                display: 'flex',
                flexDirection: 'column'
            },
            rglStyle: {
                position: 'absolute',
                top: 110,
                bottom: 0,
                right: 0,
                width: 260,
                overflowY: 'auto',
                backgroundColor: '#ECEFF1'
            },
            centerTitleStyle: {
                padding: '20px 16px 10px',
                fontSize: 13,
                color: '#93a8b2',
                fontWeight: 500
            }
        };

        var mainClasses = ['vertical_layout', 'vertical_fit', 'react-fs-template', 'user-dashboard-template'];
        if (this.state.drawerOpen) {
            mainClasses.push('drawer-open');
        }

        return _react2['default'].createElement(
            'div',
            { className: mainClasses.join(' '), onTouchTap: this.closeDrawer },
            wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.Welcome'] && _react2['default'].createElement(_WelcomeTour2['default'], { ref: 'welcome', pydio: this.props.pydio }),
            _react2['default'].createElement(LeftPanel, {
                className: 'left-panel',
                pydio: pydio,
                style: { backgroundColor: 'transparent' },
                userWidgetProps: { hideNotifications: false, style: { backgroundColor: appBarColor.darken(.2).alpha(.7).toString() } }
            }),
            _react2['default'].createElement(
                'div',
                { className: 'desktop-container vertical_layout vertical_fit' },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: styles.appBarStyle, rounded: false },
                    _react2['default'].createElement(
                        'div',
                        { id: 'workspace_toolbar', style: { display: "flex", justifyContent: "space-between" } },
                        _react2['default'].createElement(
                            'span',
                            { className: 'drawer-button' },
                            _react2['default'].createElement(_materialUi.IconButton, { style: { color: 'white' }, iconClassName: 'mdi mdi-menu', onTouchTap: this.openDrawer })
                        ),
                        _react2['default'].createElement('span', { style: { flex: 1 } }),
                        _react2['default'].createElement(
                            'div',
                            { style: { textAlign: 'center', width: 250 } },
                            _react2['default'].createElement(_ConfigLogo2['default'], {
                                className: 'home-top-logo',
                                pydio: this.props.pydio,
                                pluginName: 'gui.ajax',
                                pluginParameter: 'CUSTOM_DASH_LOGO'
                            })
                        )
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { backgroundColor: 'white' }, className: 'vertical_fit user-dashboard-main' },
                    _react2['default'].createElement(
                        _HomeSearchForm2['default'],
                        _extends({ zDepth: 0 }, this.props, { style: styles.wsListsContainerStyle }),
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1, display: 'flex', flexDirection: 'column' }, id: 'history-block' },
                            _react2['default'].createElement(_recentActivityStreams2['default'], _extends({}, this.props, {
                                emptyStateProps: { style: { backgroundColor: 'white' } }
                            }))
                        )
                    )
                )
            )
        );
    }
});

exports['default'] = AltDashboard = MaterialUI.Style.muiThemeable()(AltDashboard);

exports['default'] = AltDashboard;
module.exports = exports['default'];
