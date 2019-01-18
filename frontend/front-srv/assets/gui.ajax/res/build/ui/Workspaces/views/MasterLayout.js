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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _leftnavLeftPanel = require('../leftnav/LeftPanel');

var _leftnavLeftPanel2 = _interopRequireDefault(_leftnavLeftPanel);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var withContextMenu = _Pydio$requireLib.withContextMenu;
var dropProvider = _Pydio$requireLib.dropProvider;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var ContextMenu = _Pydio$requireLib2.ContextMenu;

var MasterLayout = (function (_React$Component) {
    _inherits(MasterLayout, _React$Component);

    function MasterLayout() {
        _classCallCheck(this, MasterLayout);

        _React$Component.apply(this, arguments);
    }

    MasterLayout.prototype.closeDrawer = function closeDrawer(e) {
        if (!this.props.drawerOpen) {
            return;
        }
        var widgets = document.getElementsByClassName('user-widget');
        if (widgets && widgets.length > 0 && widgets[0].contains(_reactDom2['default'].findDOMNode(e.target))) {
            return;
        }
        this.props.onCloseDrawerRequested();
    };

    MasterLayout.prototype.render = function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var tutorialComponent = _props.tutorialComponent;
        var onContextMenu = _props.onContextMenu;
        var classes = _props.classes;
        var style = _props.style;
        var leftPanelProps = _props.leftPanelProps;
        var children = _props.children;
        var drawerOpen = _props.drawerOpen;

        var connectDropTarget = this.props.connectDropTarget || function (c) {
            return c;
        };

        var allClasses = [].concat(classes);
        if (drawerOpen) {
            allClasses.push('drawer-open');
        }

        return connectDropTarget(_react2['default'].createElement(
            'div',
            { style: _extends({}, style, { overflow: 'hidden' }), className: allClasses.join(' '), onTouchTap: this.closeDrawer.bind(this), onContextMenu: onContextMenu },
            tutorialComponent,
            _react2['default'].createElement(_leftnavLeftPanel2['default'], _extends({ className: 'left-panel', pydio: pydio }, leftPanelProps)),
            _react2['default'].createElement(
                'div',
                { className: 'desktop-container vertical_layout vertical_fit' },
                children
            ),
            _react2['default'].createElement(
                'span',
                { className: 'context-menu' },
                _react2['default'].createElement(ContextMenu, { pydio: this.props.pydio })
            )
        ));
    };

    return MasterLayout;
})(_react2['default'].Component);

exports['default'] = MasterLayout = dropProvider(MasterLayout);
exports['default'] = MasterLayout = withContextMenu(MasterLayout);

exports['default'] = MasterLayout;
module.exports = exports['default'];
