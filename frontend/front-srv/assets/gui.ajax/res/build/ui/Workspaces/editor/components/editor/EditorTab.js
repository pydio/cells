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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _makeMaximise = require('./make-maximise');

var _makeMaximise2 = _interopRequireDefault(_makeMaximise);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;
var ResolutionActions = _Pydio$requireLib.ResolutionActions;
var ContentActions = _Pydio$requireLib.ContentActions;
var SizeActions = _Pydio$requireLib.SizeActions;
var SelectionActions = _Pydio$requireLib.SelectionActions;
var LocalisationActions = _Pydio$requireLib.LocalisationActions;
var withMenu = _Pydio$requireLib.withMenu;

var Tab = (function (_React$Component) {
    _inherits(Tab, _React$Component);

    function Tab() {
        _classCallCheck(this, Tab);

        _React$Component.apply(this, arguments);
    }

    Tab.prototype.renderControls = function renderControls(Controls, Actions) {
        var _props = this.props;
        var node = _props.node;
        var editorData = _props.editorData;
        var SelectionControls = Controls.SelectionControls;
        var ResolutionControls = Controls.ResolutionControls;
        var SizeControls = Controls.SizeControls;
        var ContentControls = Controls.ContentControls;
        var ContentSearchControls = Controls.ContentSearchControls;
        var LocalisationControls = Controls.LocalisationControls;

        var actions = _extends({}, SizeActions, SelectionActions, ResolutionActions, ContentActions, LocalisationActions);

        if (editorData.editorActions) {
            actions = _extends({}, actions, Actions);
        }

        var boundActionCreators = _redux.bindActionCreators(actions);

        var controls = function controls(Controls) {
            return Object.keys(Controls).filter(function (key) {
                return typeof Controls[key] === 'function';
            }).map(function (key) {
                var Control = Controls[key];
                return React.createElement(Control, _extends({ editorData: editorData, node: node }, boundActionCreators));
            });
        };

        return React.createElement(
            _materialUi.Toolbar,
            { style: Tab.styles.toolbar },
            SelectionControls && React.createElement(
                _materialUi.ToolbarGroup,
                null,
                controls(SelectionControls)
            ),
            ResolutionControls && React.createElement(
                _materialUi.ToolbarGroup,
                null,
                controls(ResolutionControls)
            ),
            SizeControls && React.createElement(
                _materialUi.ToolbarGroup,
                null,
                controls(SizeControls)
            ),
            ContentControls && React.createElement(
                _materialUi.ToolbarGroup,
                null,
                controls(ContentControls)
            ),
            ContentSearchControls && React.createElement(
                _materialUi.ToolbarGroup,
                null,
                controls(ContentSearchControls)
            ),
            LocalisationControls && React.createElement(
                _materialUi.ToolbarGroup,
                null,
                controls(LocalisationControls)
            )
        );
    };

    Tab.prototype.render = function render() {
        var _props2 = this.props;
        var node = _props2.node;
        var editorData = _props2.editorData;
        var Editor = _props2.Editor;
        var Controls = _props2.Controls;
        var Actions = _props2.Actions;
        var id = _props2.id;
        var isActive = _props2.isActive;
        var editorSetActiveTab = _props2.editorSetActiveTab;
        var style = _props2.style;

        var select = function select() {
            return editorSetActiveTab(id);
        };

        return !isActive ? React.createElement(
            AnimatedCard,
            { style: style, containerStyle: Tab.styles.container, maximised: isActive, expanded: isActive, onExpandChange: !isActive ? select : null },
            React.createElement(_materialUi.CardHeader, { title: id, actAsExpander: true, showExpandableButton: true }),
            React.createElement(
                _materialUi.CardMedia,
                { style: Tab.styles.child, mediaStyle: Tab.styles.child },
                React.createElement(Editor, { pydio: pydio, node: node, editorData: editorData })
            )
        ) : React.createElement(
            AnimatedCard,
            { style: style, containerStyle: Tab.styles.container, maximised: true, expanded: isActive, onExpandChange: !isActive ? select : null },
            Controls && this.renderControls(Controls, Actions),
            React.createElement(Editor, { pydio: pydio, node: node, editorData: editorData })
        );
    };

    _createClass(Tab, null, [{
        key: 'styles',
        get: function get() {
            return {
                container: {
                    display: "flex",
                    flex: 1,
                    flexFlow: "column nowrap",
                    overflow: "auto"
                },
                child: {
                    display: "flex",
                    flex: 1
                },
                toolbar: {
                    backgroundColor: "#eeeeee",
                    flexShrink: 0
                }
            };
        }
    }]);

    return Tab;
})(React.Component);

function mapStateToProps(state, ownProps) {
    var editor = state.editor;
    var tabs = state.tabs;

    var current = tabs.filter(function (tab) {
        return tab.id === ownProps.id;
    })[0];

    return _extends({}, ownProps, current, {
        isActive: editor.activeTabId === current.id
    });
}

var AnimatedCard = _makeMaximise2['default'](_materialUi.Card);

var EditorTab = _reactRedux.connect(mapStateToProps, EditorActions)(Tab);

exports['default'] = EditorTab;
module.exports = exports['default'];
