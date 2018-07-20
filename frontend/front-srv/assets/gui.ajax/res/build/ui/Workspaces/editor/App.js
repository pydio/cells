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

var _componentsEditor = require('./components/editor');

var _componentsMenu = require('./components/menu');

var _makeEditorOpen = require('./make-editor-open');

var _makeEditorOpen2 = _interopRequireDefault(_makeEditorOpen);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

var App = (function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        var _this = this;

        _classCallCheck(this, App);

        _React$Component.call(this, props);

        var editorModify = props.editorModify;
        var editorSetActiveTab = props.editorSetActiveTab;

        editorModify({ open: false });
        editorSetActiveTab(null);

        this.onEditorMinimise = function () {
            return _this.setState({ editorMinimised: !_this.props.displayPanel });
        };

        this.state = {
            editorMinimised: false,
            fullBrowserScreen: pydio.UI.MOBILE_EXTENSIONS || false
        };

        this.onFullBrowserScreen = function () {
            return _this.setState({ fullBrowserScreen: !_this.state.fullBrowserScreen });
        };
    }

    App.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        var editorModify = nextProps.editorModify;
        var tabs = nextProps.tabs;
        var displayPanel = nextProps.displayPanel;
        var positionOrigin = nextProps.positionOrigin;
        var positionTarget = nextProps.positionTarget;

        editorModify({ open: tabs.filter(function (_ref) {
                var editorData = _ref.editorData;
                return editorData;
            }).length > 0 });

        if (displayPanel) {

            this.setState({
                editorMinimised: false
            });

            var transformOrigin = "";
            if (positionOrigin && positionTarget) {
                var x = parseInt(positionTarget.left - positionOrigin.left + (positionTarget.right - positionTarget.left) / 2);
                var y = parseInt(positionTarget.top - positionOrigin.top + (positionTarget.bottom - positionTarget.top) / 2);

                this.setState({
                    transformOrigin: x + 'px ' + y + 'px'
                });
            }
        }
    };

    App.prototype.render = function render() {
        var _props = this.props;
        var display = _props.display;
        var displayPanel = _props.displayPanel;
        var _state = this.state;
        var editorMinimised = _state.editorMinimised;
        var fullBrowserScreen = _state.fullBrowserScreen;

        var editorStyle = {
            display: "none"
        };

        var overlayStyle = {
            display: "none"
        };

        if (!editorMinimised) {
            editorStyle = {
                position: "fixed",
                top: fullBrowserScreen ? 0 : "1%",
                left: fullBrowserScreen ? 0 : "1%",
                right: fullBrowserScreen ? 0 : "15%",
                bottom: fullBrowserScreen ? 0 : "1%",
                transformOrigin: this.state.transformOrigin
            };

            overlayStyle = { position: "fixed", top: 0, bottom: 0, right: 0, left: 0, background: "#000000", opacity: "0.5", transition: "opacity .5s ease-in" };
        }

        if (!displayPanel) {
            overlayStyle = { opacity: 0, transition: "opacity .5s ease-in" };
        }

        var menuStyle = {
            position: "fixed",
            bottom: "50px",
            right: "50px",
            cursor: "pointer",
            transform: "translate(50%, 50%)",
            zIndex: 5
        };

        return React.createElement(
            'div',
            null,
            display ? React.createElement('div', { style: overlayStyle }) : null,
            React.createElement(
                AnimationGroup,
                null,
                display ? React.createElement(_componentsEditor.Editor, { style: editorStyle, onFullBrowserScreen: this.onFullBrowserScreen.bind(this), onMinimise: this.onEditorMinimise.bind(this) }) : null,
                display ? React.createElement(_componentsMenu.Menu, { style: menuStyle }) : null
            )
        );
    };

    return App;
})(React.Component);

var Animation = function Animation(props) {
    return React.createElement('div', props);
};

var AnimationGroup = _makeEditorOpen2['default'](Animation);

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    var editor = state.editor;
    var tabs = state.tabs;

    return _extends({}, ownProps, {
        tabs: tabs,
        display: editor.open,
        displayPanel: editor.isPanelActive,
        displayMenu: editor.isMenuActive,
        positionOrigin: editor.panel && editor.panel.rect,
        positionTarget: editor.menu && editor.menu.rect
    });
}
var ConnectedApp = _reactRedux.connect(mapStateToProps, EditorActions)(App);

exports['default'] = ConnectedApp;
module.exports = exports['default'];
