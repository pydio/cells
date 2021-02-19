'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _BookmarksList = require('./BookmarksList');

var _BookmarksList2 = _interopRequireDefault(_BookmarksList);

var React = require('react');
var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var AsyncComponent = _Pydio$requireLib.AsyncComponent;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var UserAvatar = _Pydio$requireLib2.UserAvatar;
var MenuItemsConsumer = _Pydio$requireLib2.MenuItemsConsumer;
var MenuUtils = _Pydio$requireLib2.MenuUtils;
var Toolbar = _Pydio$requireLib2.Toolbar;

var _require = require('material-ui');

var Paper = _require.Paper;
var Popover = _require.Popover;

var UserWidget = (function (_React$Component) {
    _inherits(UserWidget, _React$Component);

    function UserWidget(props) {
        _classCallCheck(this, UserWidget);

        _React$Component.call(this, props);
        this.state = { showMenu: false };
    }

    UserWidget.getPropTypes = function getPropTypes() {
        return {
            pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
            style: _propTypes2['default'].object,
            avatarStyle: _propTypes2['default'].object,
            actionBarStyle: _propTypes2['default'].object,
            avatarOnly: _propTypes2['default'].bool
        };
    };

    UserWidget.prototype.showMenu = function showMenu(event) {
        this.setState({
            showMenu: true,
            anchor: event.currentTarget
        });
    };

    UserWidget.prototype.closeMenu = function closeMenu(event, index, menuItem) {
        this.setState({ showMenu: false });
    };

    UserWidget.prototype.applyAction = function applyAction(actionName) {
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
    };

    UserWidget.prototype.render = function render() {
        var _this = this;

        var avatar = undefined;
        var notificationsButton = undefined,
            currentIsSettings = undefined,
            bookmarksButton = undefined;
        var _props = this.props;
        var pydio = _props.pydio;
        var displayLabel = _props.displayLabel;
        var avatarStyle = _props.avatarStyle;
        var popoverDirection = _props.popoverDirection;
        var popoverTargetPosition = _props.popoverTargetPosition;
        var color = _props.color;
        var menuItems = _props.menuItems;
        var _state = this.state;
        var showMenu = _state.showMenu;
        var anchor = _state.anchor;

        if (pydio.user) {
            var user = this.props.pydio.user;
            currentIsSettings = user.activeRepository === 'settings';
            avatarStyle = _extends({}, avatarStyle, { position: 'relative' });
            var menuProps = {
                display: 'right',
                width: 160,
                desktop: true
            };
            avatar = React.createElement(
                'div',
                { onClick: function (e) {
                        _this.showMenu(e);
                    }, style: { cursor: 'pointer', maxWidth: 155 } },
                React.createElement(UserAvatar, {
                    pydio: pydio,
                    userId: user.id,
                    style: avatarStyle,
                    className: 'user-display',
                    labelClassName: 'userLabel',
                    displayLabel: displayLabel,
                    displayLabelChevron: true,
                    labelChevronStyle: { color: color },
                    labelMaxChars: 8,
                    labelStyle: { flex: 1, marginLeft: 8, color: color },
                    avatarSize: 38
                }),
                React.createElement(
                    Popover,
                    {
                        zDepth: 2,
                        open: showMenu,
                        anchorEl: anchor,
                        anchorOrigin: { horizontal: popoverDirection || 'right', vertical: popoverTargetPosition || 'bottom' },
                        targetOrigin: { horizontal: popoverDirection || 'right', vertical: 'top' },
                        onRequestClose: function () {
                            _this.closeMenu();
                        },
                        useLayerForClickAway: false,
                        style: { marginTop: -10, marginLeft: 10 }
                    },
                    MenuUtils.itemsToMenu(menuItems, this.closeMenu.bind(this), false, menuProps)
                )
            );

            // Temporary disable activities loading
            if (!this.props.hideNotifications) {
                notificationsButton = React.createElement(AsyncComponent, _extends({
                    namespace: 'PydioActivityStreams',
                    componentName: 'UserPanel',
                    noLoader: true,
                    iconClassName: 'userActionIcon mdi mdi-bell',
                    iconStyle: { color: color }
                }, this.props));
            }
            bookmarksButton = React.createElement(_BookmarksList2['default'], { pydio: this.props.pydio, iconStyle: { color: color } });
        }

        // Do not display Home Button here for the moment
        var actionBarStyle = this.props.actionBarStyle || {};
        var actionBar = undefined;
        if (!currentIsSettings) {
            actionBar = React.createElement(
                'div',
                { className: 'action_bar', style: _extends({ display: 'flex' }, actionBarStyle) },
                React.createElement(Toolbar, _extends({}, this.props, {
                    toolbars: ['user-widget'],
                    renderingType: 'icon',
                    toolbarStyle: { display: 'inline' },
                    buttonStyle: { color: color, fontSize: 18 },
                    tooltipPosition: 'bottom-right',
                    className: 'user-widget-toolbar'
                })),
                notificationsButton,
                bookmarksButton
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
                this.props.style && this.props.style.display === 'flex' && React.createElement('span', { style: { flex: 1 } }),
                actionBar
            );
        }
    };

    return UserWidget;
})(React.Component);

exports['default'] = UserWidget = MenuItemsConsumer(UserWidget);

exports['default'] = UserWidget;
module.exports = exports['default'];
