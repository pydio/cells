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

var _pydioModelContextMenu = require('pydio/model/context-menu');

var _pydioModelContextMenu2 = _interopRequireDefault(_pydioModelContextMenu);

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _PopupMenu = require('./PopupMenu');

var _PopupMenu2 = _interopRequireDefault(_PopupMenu);

var _require = require('react');

var Component = _require.Component;

var dims = {
    MENU_ITEM_HEIGHT: 32, //48 if not display:compact
    MENU_SEP_HEIGHT: 16,
    MENU_VERTICAL_PADDING: 8,
    MENU_WIDTH: 250,
    OFFSET_VERTICAL: 8,
    OFFSET_HORIZONTAL: 8
};

var ContextMenu = (function (_Component) {
    _inherits(ContextMenu, _Component);

    function ContextMenu() {
        _classCallCheck(this, ContextMenu);

        _Component.apply(this, arguments);
    }

    ContextMenu.prototype.modelOpen = function modelOpen(node) {
        var position = _pydioModelContextMenu2['default'].getInstance().getPosition();
        var items = undefined;
        if (node) {
            var dm = pydio.getContextHolder();
            if (dm.getSelectedNodes().indexOf(node) !== -1) {
                this.openMenu('selectionContext', position);
            } else {
                pydio.observeOnce("actions_refreshed", (function (dataModel) {
                    this.openMenu('selectionContext', position);
                }).bind(this));
                dm.setSelectedNodes([node]);
            }
        } else {
            this.openMenu('genericContext', position);
        }
    };

    ContextMenu.prototype.openMenu = function openMenu(context, position) {
        var items = this.computeMenuItems(context);
        this._items = items;
        var mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;
        if (!mobile) {
            position = this.computeVisiblePosition(position, items);
            this.refs['menu'].showMenu({
                top: position.y,
                left: position.x
            }, items);
        } else {
            this.refs['menu'].showMenu({
                bottom: 0,
                left: 0,
                right: 0,
                height: 200,
                zIndex: 10000,
                overflowY: 'auto'
            }, items);
        }
    };

    ContextMenu.prototype.computeMenuItems = function computeMenuItems(context) {
        var actions = this.props.pydio.Controller.getContextActions(context, ['inline', 'info_panel', 'info_panel_share']);
        return _Utils2['default'].pydioActionsToItems(actions);
    };

    ContextMenu.prototype.computeVisiblePosition = function computeVisiblePosition(position, items) {
        var menuHeight = dims.MENU_VERTICAL_PADDING * 2;
        items.map(function (it) {
            if (it.separator) menuHeight += dims.MENU_SEP_HEIGHT;else menuHeight += dims.MENU_ITEM_HEIGHT;
        });
        var menuWidth = dims.MENU_WIDTH;
        var windowW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var windowH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        if (position.x + menuWidth > windowW) {
            position.x = Math.max(position.x - menuWidth, 10) - dims.OFFSET_HORIZONTAL;
        } else {
            position.x += dims.OFFSET_HORIZONTAL;
        }
        if (position.y + menuHeight > windowH) {
            position.y = Math.max(position.y - menuHeight, 10) - dims.OFFSET_VERTICAL;
        } else {
            position.y += dims.OFFSET_VERTICAL;
        }
        return position;
    };

    ContextMenu.prototype.componentDidMount = function componentDidMount() {
        this._modelOpen = this.modelOpen.bind(this);
        _pydioModelContextMenu2['default'].getInstance().observe("open", this._modelOpen);
    };

    ContextMenu.prototype.componentWillUnmount = function componentWillUnmount() {
        _pydioModelContextMenu2['default'].getInstance().stopObserving("open", this._modelOpen);
    };

    ContextMenu.prototype.render = function render() {
        var mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;
        return React.createElement(_PopupMenu2['default'], {
            ref: 'menu',
            menuItems: this._items || [],
            onMenuClosed: this.props.onMenuClosed,
            menuProps: mobile ? { width: 600, autoWidth: false, desktop: false } : {},
            zDepth: mobile ? 2 : 1
        });
    };

    return ContextMenu;
})(Component);

exports['default'] = ContextMenu;
module.exports = exports['default'];
