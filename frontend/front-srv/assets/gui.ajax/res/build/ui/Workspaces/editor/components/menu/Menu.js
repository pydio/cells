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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _reactRedux = require('react-redux');

var _MainButton = require('./MainButton');

var _MainButton2 = _interopRequireDefault(_MainButton);

var _MenuGroup = require('./MenuGroup');

var _MenuGroup2 = _interopRequireDefault(_MenuGroup);

var _MenuItem = require('./MenuItem');

var _MenuItem2 = _interopRequireDefault(_MenuItem);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

// Components

var Menu = (function (_React$Component) {
    _inherits(Menu, _React$Component);

    function Menu(props) {
        var _this = this;

        _classCallCheck(this, Menu);

        _React$Component.call(this, props);

        this.state = {
            ready: false
        };

        var editorModify = props.editorModify;

        this.toggle = function () {
            return editorModify({ isMenuActive: !_this.props.isActive });
        };
    }

    Menu.prototype.renderChild = function renderChild() {
        var _props = this.props;
        var isActive = _props.isActive;
        var tabs = _props.tabs;

        if (!isActive) return null;

        return tabs.map(function (tab) {
            var style = {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transition: "transform 0.3s ease-in"
            };

            return React.createElement(_MenuItem2['default'], { key: tab.id, id: tab.id, style: _extends({}, style) });
        });
    };

    Menu.prototype.render = function render() {
        var _props2 = this.props;
        var style = _props2.style;
        var isActive = _props2.isActive;

        return React.createElement(
            'div',
            null,
            React.createElement(
                _MenuGroup2['default'],
                { style: style },
                this.renderChild()
            ),
            React.createElement(_MainButton2['default'], { ref: 'button', open: isActive, style: style, onClick: this.toggle })
        );
    };

    return Menu;
})(React.Component);

;

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    var editor = state.editor;
    var tabs = state.tabs;

    var activeTab = tabs.filter(function (tab) {
        return tab.id === editor.activeTabId;
    })[0];

    return _extends({}, editor, {
        activeTab: activeTab,
        tabs: tabs,
        isActive: editor.isMenuActive
    });
}
var ConnectedMenu = _reactRedux.connect(mapStateToProps, EditorActions)(Menu);

// EXPORT
exports['default'] = ConnectedMenu;
module.exports = exports['default'];
