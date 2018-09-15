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

var _BookmarksList = require('./BookmarksList');

var _BookmarksList2 = _interopRequireDefault(_BookmarksList);

var React = require('react');

var _require$requireLib = require('pydio/http/resources-manager').requireLib('boot');

var AsyncComponent = _require$requireLib.AsyncComponent;

var _require$requireLib2 = require('pydio/http/resources-manager').requireLib('components');

var UserAvatar = _require$requireLib2.UserAvatar;
var IconButtonMenu = _require$requireLib2.IconButtonMenu;
var Toolbar = _require$requireLib2.Toolbar;

var _require = require('material-ui');

var IconButton = _require.IconButton;
var Paper = _require.Paper;
exports['default'] = React.createClass({
    displayName: 'UserWidget',

    propTypes: {
        pydio: React.PropTypes.instanceOf(Pydio),
        style: React.PropTypes.object,
        avatarStyle: React.PropTypes.object,
        actionBarStyle: React.PropTypes.object
    },

    applyAction: function applyAction(actionName) {
        switch (actionName) {
            case 'home':
                this.props.pydio.triggerRepositoryChange('homepage');
                break;
            case 'settings':
                this.props.pydio.triggerRepositoryChange('settings');
                break;
            case 'about_pydio':
                this.props.pydio.getController().fireAction('splash');
                break;
            default:
                break;
        }
    },

    render: function render() {

        var messages = this.props.pydio.MessageHash;

        var avatar = undefined;
        var homeButton = undefined,
            notificationsButton = undefined,
            currentIsSettings = undefined,
            bookmarksButton = undefined;
        var avatarStyle = this.props.avatarStyle || {};
        if (this.props.pydio.user) {
            var user = this.props.pydio.user;
            currentIsSettings = user.activeRepository === 'settings';
            avatar = React.createElement(
                UserAvatar,
                {
                    pydio: this.props.pydio,
                    userId: user.id,
                    style: avatarStyle,
                    className: 'user-display',
                    labelClassName: 'userLabel',
                    labelStyle: { flex: 1, marginLeft: 5 }
                },
                React.createElement(IconButtonMenu, _extends({}, this.props, {
                    buttonClassName: 'mdi mdi-dots-vertical',
                    buttonStyle: { color: 'white' },
                    buttonTitle: messages['165'],
                    toolbars: ["user", "zlogin"],
                    controller: this.props.pydio.Controller,
                    popoverDirection: "left",
                    popoverTargetPosition: "top",
                    menuProps: { display: 'right', width: 160, desktop: true }
                }))
            );

            if (user.getRepositoriesList().has('homepage')) {
                homeButton = React.createElement(IconButton, {
                    onTouchTap: this.applyAction.bind(this, 'home'),
                    iconClassName: 'userActionIcon mdi mdi-home-variant',
                    className: 'userActionButton backToHomeButton',
                    tooltip: user.activeRepository === 'homepage' ? null : messages['305'],
                    tooltipPosition: 'bottom-right',
                    disabled: user.activeRepository === 'homepage',
                    style: user.activeRepository === 'homepage' ? { borderBottom: '2px solid white' } : {}
                });
            }
            if (!this.props.hideNotifications && !(this.props.pydio.user && this.props.pydio.user.activeRepository === 'inbox')) {
                notificationsButton = React.createElement(AsyncComponent, _extends({
                    namespace: 'PydioActivityStreams',
                    componentName: 'UserPanel',
                    noLoader: true,
                    iconClassName: 'userActionIcon mdi mdi-bell-outline'
                }, this.props));
            }
            bookmarksButton = React.createElement(_BookmarksList2['default'], { pydio: this.props.pydio });
        }

        var aboutButton = React.createElement(IconButton, {
            onTouchTap: this.applyAction.bind(this, 'about_pydio'),
            iconClassName: 'userActionIcon icomoon-cells',
            className: 'userActionButton backToHomeButton',
            tooltip: messages['166'],
            tooltipPosition: 'bottom-left'
        });

        // Do not display Home Button here for the moment
        var actionBarStyle = this.props.actionBarStyle || {};
        var actionBar = undefined;
        if (currentIsSettings) {
            actionBar = React.createElement(
                'div',
                { className: 'action_bar', style: _extends({ display: 'flex' }, actionBarStyle) },
                homeButton
            );
        } else {
            actionBar = React.createElement(
                'div',
                { className: 'action_bar', style: _extends({ display: 'flex' }, actionBarStyle) },
                homeButton,
                React.createElement(Toolbar, _extends({}, this.props, {
                    toolbars: ['user-widget'],
                    renderingType: 'icon',
                    toolbarStyle: { display: 'inline' },
                    buttonStyle: { color: 'rgba(255,255,255,255.93)', fontSize: 18 },
                    tooltipPosition: 'bottom-right',
                    className: 'user-widget-toolbar'
                })),
                notificationsButton,
                bookmarksButton,
                React.createElement('span', { style: { flex: 1 } }),
                aboutButton
            );
        }

        if (this.props.children) {
            return React.createElement(
                Paper,
                { zDepth: 1, rounded: false, style: _extends({}, this.props.style, { display: 'flex' }), className: 'user-widget primaryColorDarkerPaper' },
                React.createElement(
                    'div',
                    { style: { flex: 1 } },
                    avatar,
                    actionBar
                ),
                this.props.children
            );
        } else {
            return React.createElement(
                Paper,
                { zDepth: 1, rounded: false, style: this.props.style, className: 'user-widget primaryColorDarkerPaper' },
                avatar,
                actionBar
            );
        }
    }
});
module.exports = exports['default'];
