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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var React = require('react');
var ReactDOM = require('react-dom');

var _require = require('material-ui');

var Menu = _require.Menu;
var Paper = _require.Paper;

var _default = (function (_React$Component) {
    _inherits(_default, _React$Component);

    function _default() {
        var _this = this;

        _classCallCheck(this, _default);

        _React$Component.apply(this, arguments);

        this.state = { showMenu: false, menuItems: this.props.menuItems };

        this.showMenu = function () {
            var style = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
            var menuItems = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            _this.setState({
                showMenu: true,
                style: style,
                menuItems: menuItems ? menuItems : _this.state.menuItems
            });
        };

        this.hideMenu = function (event) {
            if (!event) {
                _this.setState({ showMenu: false });
                if (_this.props.onMenuClosed) _this.props.onMenuClosed();
                return;
            }
            // Firefox trigger a click event when you mouse up on contextmenu event
            if (typeof event !== 'undefined' && event.button === 2 && event.type !== 'contextmenu') {
                return;
            }
            var node = ReactDOM.findDOMNode(_this.refs.menuContainer);
            if (node.contains(event.target) || node === event.target) {
                return;
            }

            _this.setState({ showMenu: false });
            if (_this.props.onMenuClosed) _this.props.onMenuClosed();
        };

        this.menuClicked = function (event, index, menuItem) {
            _this.hideMenu();
        };
    }

    _default.prototype.componentDidMount = function componentDidMount() {
        this._observer = this.hideMenu;
    };

    _default.prototype.componentWillUnmount = function componentWillUnmount() {
        document.removeEventListener('click', this._observer, false);
    };

    _default.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (nextProps.menuItems) {
            this.setState({ menuItems: nextProps.menuItems });
        }
    };

    _default.prototype.componentDidUpdate = function componentDidUpdate(prevProps, nextProps) {
        if (this.state.showMenu) {
            document.addEventListener('click', this._observer, false);
        } else {
            document.removeEventListener('click', this._observer, false);
        }
    };

    _default.prototype.render = function render() {

        var style = this.state.style || {};
        style = _extends({}, style, { zIndex: 1000 });
        var menu = _Utils2['default'].itemsToMenu(this.state.menuItems, this.menuClicked, false, _extends({ desktop: true, display: 'right', width: 250 }, this.props.menuProps));
        if (this.state.showMenu) {
            return React.createElement(
                Paper,
                { zDepth: this.props.zDepth || 1, ref: 'menuContainer', className: 'menu-positioner', style: style },
                menu
            );
        } else {
            return null;
        }
    };

    _createClass(_default, null, [{
        key: 'propTypes',
        value: {
            menuItems: React.PropTypes.array.isRequired,
            onExternalClickCheckElements: React.PropTypes.func,
            className: React.PropTypes.string,
            style: React.PropTypes.object,
            onMenuClosed: React.PropTypes.func
        },
        enumerable: true
    }]);

    return _default;
})(React.Component);

exports['default'] = _default;
module.exports = exports['default'];
