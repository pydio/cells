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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactRedux = require('react-redux');

var _materialUi = require('material-ui');

var _PydioComponents = PydioComponents;
var ModalAppBar = _PydioComponents.ModalAppBar;

var _Pydio$requireLib = Pydio.requireLib('hoc');

var makeTransitionHOC = _Pydio$requireLib.makeTransitionHOC;
var EditorActions = _Pydio$requireLib.EditorActions;

// Display components
// TODO - should be two motions for appearing and disappearing, based on a condition in the props

var EditorToolbar = (function (_React$Component) {
    _inherits(EditorToolbar, _React$Component);

    function EditorToolbar() {
        _classCallCheck(this, _EditorToolbar);

        _React$Component.apply(this, arguments);
    }

    // REDUX - Then connect the redux store

    EditorToolbar.prototype.onClose = function onClose() {
        var tabDeleteAll = this.props.tabDeleteAll;

        tabDeleteAll();
    };

    EditorToolbar.prototype.onMinimise = function onMinimise() {
        var editorModify = this.props.editorModify;

        editorModify({ isMinimised: true });
    };

    EditorToolbar.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var title = _props.title;
        var className = _props.className;
        var style = _props.style;

        var innerStyle = { color: "#FFFFFF", fill: "#FFFFFF" };

        return React.createElement(ModalAppBar, {
            className: className,
            style: style,
            title: React.createElement(
                'span',
                null,
                title
            ),
            titleStyle: innerStyle,
            iconElementLeft: React.createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-close', iconStyle: innerStyle, touch: true, onTouchTap: function () {
                    return _this.onClose();
                } }),
            iconElementRight: React.createElement(
                _materialUi.ToolbarGroup,
                null,
                React.createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-window-minimize', iconStyle: innerStyle, touch: true, onTouchTap: function () {
                        return _this.onMinimise();
                    } })
            )
        });
    };

    var _EditorToolbar = EditorToolbar;
    EditorToolbar = _reactRedux.connect(mapStateToProps, EditorActions)(EditorToolbar) || EditorToolbar;
    EditorToolbar = makeTransitionHOC({ translateY: -60, opacity: 0 }, { translateY: 0, opacity: 1 })(EditorToolbar) || EditorToolbar;
    return EditorToolbar;
})(React.Component);

exports['default'] = EditorToolbar;
function mapStateToProps(state, ownProps) {
    var _state$editor = state.editor;
    var editor = _state$editor === undefined ? {} : _state$editor;
    var _state$tabs = state.tabs;
    var tabs = _state$tabs === undefined ? [] : _state$tabs;
    var _editor$activeTabId = editor.activeTabId;
    var activeTabId = _editor$activeTabId === undefined ? -1 : _editor$activeTabId;

    var activeTab = tabs.filter(function (tab) {
        return tab.id === activeTabId;
    })[0];

    return _extends({}, ownProps, {
        title: activeTab.title
    });
}
module.exports = exports['default'];
