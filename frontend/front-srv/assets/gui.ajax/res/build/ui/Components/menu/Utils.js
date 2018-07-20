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

var _require = require('material-ui');

var Divider = _require.Divider;
var Menu = _require.Menu;
var MenuItem = _require.MenuItem;
var FontIcon = _require.FontIcon;

function pydioActionsToItems() {
    var actions = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var items = [];
    var lastIsSeparator = false;
    actions.map((function (action, index) {
        if (action.separator) {
            if (lastIsSeparator) return;
            items.push(action);
            lastIsSeparator = true;
            return;
        }
        lastIsSeparator = false;
        var label = action.raw_name ? action.raw_name : action.name;
        var iconClass = action.icon_class;
        var payload = undefined;
        if (action.subMenu) {
            var subItems = action.subMenuBeforeShow ? pydioActionsToItems(action.subMenuBeforeShow()) : action.subMenu;
            items.push({
                text: label,
                iconClassName: iconClass,
                subItems: subItems
            });
        } else {
            items.push({
                text: label,
                iconClassName: iconClass,
                payload: action.callback
            });
        }
    }).bind(this));
    if (lastIsSeparator) {
        items = items.slice(0, items.length - 1);
    }
    if (items.length && items[0] && items[0].separator) {
        items.shift();
    }
    return items;
}

function itemsToMenu(items, closeMenuCallback) {
    var subItemsOnly = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var menuProps = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    menuProps = _extends({
        display: 'normal',
        width: 216,
        desktop: true,
        autoWidth: false
    }, menuProps);

    var menuItems = items.map(function (item, index) {

        if (item.separator) return React.createElement(Divider, { key: "divider" + index });

        var subItems = undefined,
            payload = undefined;
        if (item.subItems) {
            subItems = itemsToMenu(item.subItems, closeMenuCallback, true);
        } else if (item.payload) {
            payload = function () {
                item.payload();
                closeMenuCallback();
            };
        }

        var leftIcon = undefined,
            rightIcon = undefined;
        var iconClassName = item.iconClassName;var inset = false;
        if (iconClassName === '__INSET__') {
            iconClassName = '';
            inset = true;
        }

        if (menuProps.display === 'normal') {
            leftIcon = iconClassName ? React.createElement(FontIcon, { className: item.iconClassName + ' menu-icons', style: { fontSize: 16, padding: 5 } }) : null;
        } else if (menuProps.display === 'right') {
            rightIcon = iconClassName ? React.createElement(FontIcon, { className: item.iconClassName + ' menu-icons', style: { fontSize: 16, padding: 5 } }) : null;
        }
        rightIcon = subItems && subItems.length ? React.createElement(FontIcon, { className: 'mdi mdi-menu-right menu-icons' }) : rightIcon;

        return React.createElement(MenuItem, {
            key: item.text,
            primaryText: item.text,
            insetChildren: inset,
            leftIcon: leftIcon,
            rightIcon: rightIcon,
            onTouchTap: payload,
            menuItems: subItems
        });
    });

    if (subItemsOnly) {
        return menuItems;
    } else {
        return React.createElement(
            Menu,
            menuProps,
            menuItems
        );
    }
}

exports['default'] = { pydioActionsToItems: pydioActionsToItems, itemsToMenu: itemsToMenu };
module.exports = exports['default'];
