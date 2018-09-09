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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _MenuItemsConsumer = require('./MenuItemsConsumer');

var _MenuItemsConsumer2 = _interopRequireDefault(_MenuItemsConsumer);

var React = require('react');

var _require = require('material-ui');

var IconButton = _require.IconButton;
var Popover = _require.Popover;

var IconButtonMenu = (function (_React$Component) {
    _inherits(IconButtonMenu, _React$Component);

    function IconButtonMenu(props, context) {
        _classCallCheck(this, IconButtonMenu);

        _React$Component.call(this, props, context);
        this.state = { showMenu: false };
    }

    IconButtonMenu.prototype.showMenu = function showMenu(event) {
        this.setState({
            showMenu: true,
            anchor: event.currentTarget
        });
    };

    IconButtonMenu.prototype.closeMenu = function closeMenu(event, index, menuItem) {
        this.setState({ showMenu: false });
    };

    IconButtonMenu.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var menuItems = _props.menuItems;
        var className = _props.className;
        var buttonTitle = _props.buttonTitle;
        var buttonClassName = _props.buttonClassName;
        var buttonStyle = _props.buttonStyle;
        var popoverDirection = _props.popoverDirection;
        var popoverTargetPosition = _props.popoverTargetPosition;
        var menuProps = _props.menuProps;

        if (!menuItems.length) {
            return null;
        }
        return React.createElement(
            'span',
            { className: "toolbars-button-menu " + (className ? className : '') },
            React.createElement(IconButton, {
                ref: 'menuButton',
                tooltip: buttonTitle,
                iconClassName: buttonClassName,
                onTouchTap: this.showMenu.bind(this),
                iconStyle: buttonStyle
            }),
            React.createElement(
                Popover,
                {
                    open: this.state.showMenu,
                    anchorEl: this.state.anchor,
                    anchorOrigin: { horizontal: popoverDirection || 'right', vertical: popoverTargetPosition || 'bottom' },
                    targetOrigin: { horizontal: popoverDirection || 'right', vertical: 'top' },
                    onRequestClose: function () {
                        _this.setState({ showMenu: false });
                    },
                    useLayerForClickAway: false
                },
                _Utils2['default'].itemsToMenu(menuItems, this.closeMenu.bind(this), false, menuProps || undefined)
            )
        );
    };

    return IconButtonMenu;
})(React.Component);

IconButtonMenu.propTypes = {
    buttonTitle: React.PropTypes.string.isRequired,
    buttonClassName: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    popoverDirection: React.PropTypes.oneOf(['right', 'left']),
    popoverPosition: React.PropTypes.oneOf(['top', 'bottom']),
    menuProps: React.PropTypes.object,
    menuItems: React.PropTypes.array.isRequired
};

exports['default'] = _MenuItemsConsumer2['default'](IconButtonMenu);
module.exports = exports['default'];
