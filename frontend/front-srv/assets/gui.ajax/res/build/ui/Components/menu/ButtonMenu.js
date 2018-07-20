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

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _MenuItemsConsumer = require('./MenuItemsConsumer');

var _MenuItemsConsumer2 = _interopRequireDefault(_MenuItemsConsumer);

var React = require('react');
var ReactDOM = require('react-dom');

var _require = require('material-ui');

var Menu = _require.Menu;

var Controller = require('pydio/model/controller');

var ButtonMenu = React.createClass({
    displayName: 'ButtonMenu',

    propTypes: {
        buttonTitle: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]).isRequired,
        menuItems: React.PropTypes.array.isRequired,
        className: React.PropTypes.string,
        raised: React.PropTypes.bool,
        direction: React.PropTypes.oneOf(['left', 'right'])
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        if (this.props.openOnEvent) {
            this.props.pydio.observe(this.props.openOnEvent, function () {
                _this.showMenu();
            });
        }
    },

    getInitialState: function getInitialState() {
        return { showMenu: false };
    },

    showMenu: function showMenu(event) {
        var anchor = undefined;
        if (event) {
            anchor = event.currentTarget;
        } else {
            anchor = this._buttonDOM;
        }
        this.setState({
            showMenu: true,
            anchor: anchor
        });
    },

    menuClicked: function menuClicked(event, index, object) {
        //object.payload();
        this.setState({ showMenu: false });
    },

    render: function render() {
        var _this2 = this;

        var label = React.createElement(
            'span',
            null,
            this.props.buttonTitle,
            ' ',
            React.createElement('span', { className: 'icon-caret-down' })
        );
        var button = undefined;
        var props = {
            primary: this.props.primary,
            secondary: this.props.secondary,
            disabled: this.props.disabeld,
            label: label,
            onTouchTap: this.showMenu,
            onClick: function onClick(e) {
                return e.stopPropagation();
            }
        };
        var menuItems = this.props.menuItems;
        var _state = this.state;
        var showMenu = _state.showMenu;
        var anchor = _state.anchor;

        if (menuItems.length) {
            if (this.props.raised) {
                button = React.createElement(MaterialUI.RaisedButton, _extends({}, props, { style: this.props.buttonStyle, labelStyle: this.props.buttonLabelStyle, ref: function (b) {
                        _this2._buttonDOM = ReactDOM.findDOMNode(b);
                    } }));
            } else {
                button = React.createElement(MaterialUI.FlatButton, _extends({}, props, { style: this.props.buttonStyle, labelStyle: this.props.buttonLabelStyle, ref: function (b) {
                        _this2._buttonDOM = ReactDOM.findDOMNode(b);
                    } }));
            }
        }
        return React.createElement(
            'span',
            { id: this.props.id, className: this.props.className },
            button,
            React.createElement(
                MaterialUI.Popover,
                {
                    className: 'menuPopover',
                    open: showMenu,
                    anchorEl: anchor,
                    anchorOrigin: { horizontal: this.props.direction || 'left', vertical: 'bottom' },
                    targetOrigin: { horizontal: this.props.direction || 'left', vertical: 'top' },
                    onRequestClose: function () {
                        _this2.setState({ showMenu: false });
                    },
                    style: { marginTop: 1 },
                    useLayerForClickAway: false
                },
                _Utils2['default'].itemsToMenu(menuItems, this.menuClicked)
            )
        );
    }

});

exports['default'] = _MenuItemsConsumer2['default'](ButtonMenu);
module.exports = exports['default'];
