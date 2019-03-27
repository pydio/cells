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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioModelContextMenu = require('pydio/model/context-menu');

var _pydioModelContextMenu2 = _interopRequireDefault(_pydioModelContextMenu);

var withContextMenu = function withContextMenu(Component) {
    return (function (_React$Component) {
        _inherits(ContextMenu, _React$Component);

        function ContextMenu() {
            _classCallCheck(this, ContextMenu);

            _React$Component.apply(this, arguments);
        }

        ContextMenu.prototype.onContextMenu = function onContextMenu(event) {
            var node = this.props.node;

            event.preventDefault();
            event.stopPropagation();

            if (node) {
                _pydioModelContextMenu2['default'].getInstance().openNodeAtPosition(node, event.clientX, event.clientY);
            } else {
                _pydioModelContextMenu2['default'].getInstance().openAtPosition(event.clientX, event.clientY);
            }
        };

        ContextMenu.prototype.render = function render() {
            return React.createElement(Component, _extends({}, this.props, { onContextMenu: this.onContextMenu.bind(this) }));
        };

        return ContextMenu;
    })(React.Component);
};

exports['default'] = withContextMenu;
module.exports = exports['default'];
