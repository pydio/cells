/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUiStyles = require('material-ui/styles');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _materialUi = require('material-ui');

var OverlayIcon = (function (_React$Component) {
    _inherits(OverlayIcon, _React$Component);

    function OverlayIcon() {
        _classCallCheck(this, OverlayIcon);

        _React$Component.apply(this, arguments);
    }

    OverlayIcon.prototype.findAction = function findAction() {
        var _props = this.props;
        var overlay = _props.overlay;
        var pydio = _props.pydio;
        var node = _props.node;

        var tooltip = undefined,
            action = undefined;
        var m = function m(id) {
            return pydio.MessageHash[id] || id;
        };
        var isLeaf = node.isLeaf();
        switch (overlay) {
            case "mdi mdi-star":
                tooltip = isLeaf ? m('overlay.bookmark.file') : m('overlay.bookmark.folder');
                break;
            case "mdi mdi-share-variant":
                action = pydio.Controller.getActionByName("share-edit-shared");
                tooltip = isLeaf ? m('overlay.shared.file') : m('overlay.shared.folder');
                break;
            case "mdi mdi-lock-outline":
                tooltip = isLeaf ? m('overlay.lock.file') : m('overlay.lock.folder');
                break;
            case "mdi mdi-bell":
                tooltip = isLeaf ? m('overlay.watch.file') : m('overlay.watch.folder');
                break;
            default:
                break;
        }
        return { tooltip: tooltip, action: action };
    };

    OverlayIcon.prototype.render = function render() {
        var _props2 = this.props;
        var muiTheme = _props2.muiTheme;
        var overlay = _props2.overlay;
        var selected = _props2.selected;

        var light = new _color2['default'](muiTheme.palette.primary1Color).saturationl(15).lightness(73).toString();
        var onClick = undefined;

        var _findAction = this.findAction();

        var tooltip = _findAction.tooltip;
        var action = _findAction.action;

        if (action) {
            onClick = function () {
                action.apply();
            };
        }
        return _react2['default'].createElement(_materialUi.IconButton, {
            tooltip: tooltip,
            tooltipPosition: "bottom-left",
            iconClassName: overlay + ' overlay-icon-span',
            style: { width: 30, height: 30, padding: 6, margin: '6px 2px', zIndex: 0, cursor: onClick ? 'pointer' : 'default' },
            iconStyle: { color: selected ? 'white' : light, fontSize: 15, transition: 'none' },
            onClick: onClick
        });
    };

    return OverlayIcon;
})(_react2['default'].Component);

exports['default'] = OverlayIcon = _materialUiStyles.muiThemeable()(OverlayIcon);

exports['default'] = OverlayIcon;
module.exports = exports['default'];
