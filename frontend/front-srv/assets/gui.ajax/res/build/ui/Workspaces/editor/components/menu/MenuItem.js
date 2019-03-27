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

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

var MenuItem = (function (_React$PureComponent) {
    _inherits(MenuItem, _React$PureComponent);

    function MenuItem(props) {
        var _this = this;

        _classCallCheck(this, MenuItem);

        _React$PureComponent.call(this, props);

        var editorSetActiveTab = props.editorSetActiveTab;
        var editorModify = props.editorModify;

        this.onClick = function () {
            editorModify({ isMinimised: false });
            editorSetActiveTab(_this.props.id);
        };
    }

    MenuItem.prototype.render = function render() {
        var _props = this.props;
        var style = _props.style;
        var tab = _props.tab;

        if (!tab) return null;

        var textStyle = {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 100,
            maxWidth: 100,
            textAlign: "center",
            left: -120,
            lineHeight: "30px",
            margin: "5px 0",
            padding: "0 5px",
            borderRadius: 4,
            background: "#000000",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            color: "#ffffff",
            opacity: "0.7"
        };

        return React.createElement(
            'div',
            { style: style, onClick: this.onClick },
            React.createElement(
                'span',
                { style: textStyle },
                tab.title
            ),
            React.createElement(
                _materialUi.FloatingActionButton,
                { mini: true, ref: 'container', backgroundColor: '#FFFFFF', zDepth: 2, iconStyle: { backgroundColor: "#FFFFFF" } },
                React.createElement(tab.icon, _extends({}, this.props.tab, { style: { fill: "#000000", flex: 1, alignItems: "center", justifyContent: "center", fontSize: 28, color: "#607d8b" }, loadThumbnail: true }))
            )
        );
    };

    return MenuItem;
})(React.PureComponent);

function mapStateToProps(state, ownProps) {
    var tabs = state.tabs;

    var current = tabs.filter(function (tab) {
        return tab.id === ownProps.id;
    })[0];

    return _extends({}, ownProps, {
        tab: current
    });
}

var ConnectedMenuItem = _reactRedux.connect(mapStateToProps, EditorActions)(MenuItem);

exports['default'] = ConnectedMenuItem;
module.exports = exports['default'];
