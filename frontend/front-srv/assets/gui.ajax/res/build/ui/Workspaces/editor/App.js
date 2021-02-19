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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _reactRedux = require('react-redux');

var _componentsEditor = require('./components/editor');

var _componentsMenu = require('./components/menu');

var _makeEditorOpen = require('./make-editor-open');

var _makeEditorOpen2 = _interopRequireDefault(_makeEditorOpen);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var withContainerSize = _Pydio$requireLib.withContainerSize;
var EditorActions = _Pydio$requireLib.EditorActions;

var App = (function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        var _this = this;

        _classCallCheck(this, _App);

        _React$Component.call(this, props);

        var editorModify = props.editorModify;
        var editorSetActiveTab = props.editorSetActiveTab;

        editorModify({ isOpen: false });
        editorSetActiveTab(null);

        this.state = {
            fullBrowserScreen: pydio.UI.MOBILE_EXTENSIONS || true
        };

        this.onFullBrowserScreen = function () {
            return _this.setState({ fullBrowserScreen: !_this.state.fullBrowserScreen });
        };
    }

    // REDUX - Then connect the redux store

    App.prototype.render = function render() {
        var _props = this.props;
        var isOpen = _props.isOpen;
        var isMinimised = _props.isMinimised;
        var displayToolbar = _props.displayToolbar;
        var documentWidth = _props.documentWidth;
        var documentHeight = _props.documentHeight;
        var fullBrowserScreen = this.state.fullBrowserScreen;

        if (!isOpen) {
            return null;
        }

        var editorStyle = {
            position: "fixed",
            top: fullBrowserScreen ? 0 : "1%",
            left: fullBrowserScreen ? 0 : "1%",
            right: fullBrowserScreen ? 0 : "15%",
            bottom: fullBrowserScreen ? 0 : "1%"
        };

        var overlayStyle = {
            position: "fixed",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            background: "#000000",
            opacity: "0.8",
            transition: "opacity .5s ease-in"
        };

        var buttonCenterPositionTop = documentHeight - 50;
        var buttonCenterPositionLeft = documentWidth - 50;

        var menuStyle = {
            position: "fixed",
            top: buttonCenterPositionTop,
            left: buttonCenterPositionLeft,
            cursor: "pointer",
            transform: "translate(-50%, -50%)",
            zIndex: 5
        };

        return React.createElement(
            'div',
            { style: { position: "fixed", top: 0, left: 0, zIndex: 1400 } },
            !isMinimised && React.createElement('div', { style: overlayStyle }),
            React.createElement(_componentsEditor.Editor, { displayToolbar: displayToolbar, style: editorStyle, minimiseStyle: { transformOrigin: buttonCenterPositionLeft + "px " + buttonCenterPositionTop + "px" } }),
            isMinimised && React.createElement(_componentsMenu.Menu, { style: menuStyle })
        );
    };

    var _App = App;
    App = _reactRedux.connect(mapStateToProps, EditorActions)(App) || App;
    App = withContainerSize(App) || App;
    return App;
})(React.Component);

function mapStateToProps(state, ownProps) {
    var editor = state.editor;
    var tabs = state.tabs;
    var _editor$isMinimised = editor.isMinimised;
    var isMinimised = _editor$isMinimised === undefined ? false : _editor$isMinimised;
    var _ownProps$displayToolbar = ownProps.displayToolbar;
    var displayToolbar = _ownProps$displayToolbar === undefined ? true : _ownProps$displayToolbar;

    var remaining = _objectWithoutProperties(ownProps, ['displayToolbar']);

    return _extends({}, remaining, {
        tabs: tabs,
        isOpen: tabs.filter(function (_ref) {
            var editorData = _ref.editorData;
            return editorData;
        }).length > 0,
        isMinimised: isMinimised,
        displayToolbar: displayToolbar
    });
}

exports['default'] = App;
module.exports = exports['default'];
