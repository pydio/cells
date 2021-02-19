'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _MenuItemsConsumer = require('./MenuItemsConsumer');

var _MenuItemsConsumer2 = _interopRequireDefault(_MenuItemsConsumer);

/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio Cells.
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

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _materialUi = require("material-ui");

var ButtonMenu = (function (_React$Component) {
    _inherits(ButtonMenu, _React$Component);

    function ButtonMenu() {
        var _this = this;

        _classCallCheck(this, ButtonMenu);

        _React$Component.apply(this, arguments);

        this.state = { showMenu: false };

        this.showMenu = function (event) {
            var anchor = undefined;
            if (event) {
                anchor = event.currentTarget;
            } else {
                anchor = _this._buttonDOM;
            }
            _this.setState({
                showMenu: true,
                anchor: anchor
            });
        };

        this.menuClicked = function (event, index, object) {
            _this.setState({ showMenu: false });
        };
    }

    ButtonMenu.prototype.componentDidMount = function componentDidMount() {
        var _this2 = this;

        if (this.props.openOnEvent) {
            this.props.pydio.observe(this.props.openOnEvent, function () {
                _this2.showMenu();
            });
        }
    };

    ButtonMenu.prototype.render = function render() {
        var _this3 = this;

        var _state = this.state;
        var showMenu = _state.showMenu;
        var anchor = _state.anchor;

        var label = _react2['default'].createElement(
            'span',
            { style: { whiteSpace: 'nowrap' } },
            this.props.buttonTitle,
            ' ',
            _react2['default'].createElement('span', { className: 'mdi mdi-menu-down' })
        );
        var button = undefined;
        var activeColor = this.props.buttonHoverColor || 'rgba(255,255,255,0.2)';
        var props = {
            primary: this.props.primary,
            secondary: this.props.secondary,
            disabled: this.props.disabled,
            label: label,
            onTouchTap: this.showMenu,
            labelStyle: _extends({}, this.props.buttonLabelStyle),
            style: this.props.buttonStyle,
            backgroundColor: showMenu ? activeColor : this.props.buttonBackgroundColor,
            hoverColor: this.props.buttonHoverColor,
            onClick: function onClick(e) {
                return e.stopPropagation();
            }
        };
        var menuItems = this.props.menuItems;

        if (menuItems.length) {
            if (this.props.raised) {
                button = _react2['default'].createElement(_materialUi.RaisedButton, _extends({}, props, { ref: function (b) {
                        _this3._buttonDOM = _reactDom2['default'].findDOMNode(b);
                    } }));
            } else {
                button = _react2['default'].createElement(_materialUi.FlatButton, _extends({}, props, { ref: function (b) {
                        _this3._buttonDOM = _reactDom2['default'].findDOMNode(b);
                    } }));
            }
        }
        return _react2['default'].createElement(
            'span',
            { id: this.props.id, className: this.props.className },
            button,
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    className: 'menuPopover',
                    open: showMenu,
                    anchorEl: anchor,
                    anchorOrigin: { horizontal: this.props.direction || 'left', vertical: 'bottom' },
                    targetOrigin: { horizontal: this.props.direction || 'left', vertical: 'top' },
                    onRequestClose: function () {
                        _this3.setState({ showMenu: false });
                    },
                    style: { marginTop: 1 },
                    useLayerForClickAway: false
                },
                _Utils2['default'].itemsToMenu(menuItems, this.menuClicked)
            )
        );
    };

    _createClass(ButtonMenu, null, [{
        key: 'propTypes',
        value: {
            buttonTitle: _propTypes2['default'].oneOfType([_propTypes2['default'].string, _propTypes2['default'].object]).isRequired,
            menuItems: _propTypes2['default'].array.isRequired,
            className: _propTypes2['default'].string,
            raised: _propTypes2['default'].bool,
            direction: _propTypes2['default'].oneOf(['left', 'right'])
        },
        enumerable: true
    }]);

    return ButtonMenu;
})(_react2['default'].Component);

exports['default'] = _MenuItemsConsumer2['default'](ButtonMenu);
module.exports = exports['default'];
