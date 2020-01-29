/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _boardAdminStyles = require("../board/AdminStyles");

var _boardAdminStyles2 = _interopRequireDefault(_boardAdminStyles);

var _require = require('material-ui');

var MenuItem = _require.MenuItem;
var Divider = _require.Divider;
var Subheader = _require.Subheader;
var FontIcon = _require.FontIcon;

function renderItem(palette, node) {
    var text = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
    var noIcon = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
    var advanced = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

    var _AdminStyles = (0, _boardAdminStyles2['default'])(palette);

    var menu = _AdminStyles.menu;

    var label = text || node.getLabel();
    if (node.getMetadata().get('flag')) {
        label = React.createElement(
            'div',
            { style: menu.menuLabel },
            node.getLabel(),
            ' ',
            React.createElement(
                'span',
                { style: menu.flag },
                node.getMetadata().get('flag')
            ),
            ' '
        );
    } else {
        label = React.createElement(
            'div',
            { style: menu.menuLabel },
            label
        );
    }

    return React.createElement(MenuItem, {
        style: menu.menuItem,
        innerDivStyle: menu.menuItemInner,
        value: node,
        primaryText: label,
        leftIcon: !noIcon && React.createElement(FontIcon, { className: node.getMetadata().get('icon_class'), style: menu.iconStyle })
    });
}

var NavigationHelper = (function () {
    function NavigationHelper() {
        _classCallCheck(this, NavigationHelper);
    }

    _createClass(NavigationHelper, null, [{
        key: 'buildNavigationItems',
        value: function buildNavigationItems(pydio, rootNode, palette) {
            var showAdvanced = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
            var noIcon = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

            var items = [];

            var headerStyle = {
                fontSize: 12,
                color: 'rgba(0,0,0,0.25)',
                textTransform: 'uppercase'
            };

            var _AdminStyles2 = (0, _boardAdminStyles2['default'])(palette);

            var menu = _AdminStyles2.menu;

            if (rootNode.getMetadata().get('component')) {
                items.push(renderItem(palette, rootNode, pydio.MessageHash['ajxp_admin.menu.0'], noIcon));
            }
            rootNode.getChildren().forEach(function (header) {
                if (!header.getChildren().size && header.getMetadata().get('component')) {
                    items.push(renderItem(palette, header, null, noIcon));
                } else {
                    var _ret = (function () {
                        var children = [];
                        header.getChildren().forEach(function (child) {
                            if (!child.getLabel() || !showAdvanced && child.getMetadata().get('advanced')) {
                                return;
                            }
                            children.push(renderItem(palette, child, null, noIcon, child.getMetadata().get('advanced')));
                        });
                        if (!children.length) {
                            return {
                                v: undefined
                            };
                        }
                        if (header.getLabel()) {
                            //items.push(<Divider/>);
                            items.push(React.createElement(
                                Subheader,
                                { style: menu.subHeader },
                                header.getLabel()
                            ));
                        }
                        items.push.apply(items, children);
                    })();

                    if (typeof _ret === 'object') return _ret.v;
                }
            });

            return items;
        }
    }]);

    return NavigationHelper;
})();

exports['default'] = NavigationHelper;
module.exports = exports['default'];
