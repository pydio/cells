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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _reactRedux = require('react-redux');

var _reactDraggable = require('react-draggable');

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

var _reactPanAndZoomHoc = require('react-pan-and-zoom-hoc');

var _reactPanAndZoomHoc2 = _interopRequireDefault(_reactPanAndZoomHoc);

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
var withContentControls = _Pydio$requireLib.withContentControls;
var withSizeControls = _Pydio$requireLib.withSizeControls;
var withAutoPlayControls = _Pydio$requireLib.withAutoPlayControls;
var withResolutionControls = _Pydio$requireLib.withResolutionControls;

var styles = {
    textField: {
        width: 150,
        marginRight: 40
    },
    textInput: {
        color: "rgba(255, 255,255, 0.87)"
    },
    textHint: {
        color: "rgba(255, 255,255, 0.67)"
    },
    iconButton: {
        backgroundColor: "rgba(0, 0, 0, 0.87)",
        color: "rgba(255, 255, 255, 0.87)",
        fill: "rgba(255, 255, 255, 0.87)"
    },
    divider: {
        backgroundColor: "rgba(255, 255,255, 0.87)",
        marginLeft: "12px",
        marginRight: "12px",
        alignSelf: "center"
    }
};

var Tab = (function (_React$Component) {
    _inherits(Tab, _React$Component);

    function Tab() {
        _classCallCheck(this, _Tab);

        _React$Component.apply(this, arguments);
    }

    Tab.prototype.renderControls = function renderControls(Controls, Actions) {
        var _props = this.props;
        var id = _props.id;
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
            SnackBar,
            { id: id, style: Tab.styles.toolbar },
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
        var cardStyle = _extends({ backgroundColor: 'transparent', borderRadius: 0 }, style);

        return !isActive ? React.createElement(
            AnimatedCard,
            { style: cardStyle, containerStyle: Tab.styles.container, maximised: isActive, expanded: isActive, onExpandChange: !isActive ? select : null },
            React.createElement(_materialUi.CardHeader, { title: id, actAsExpander: true, showExpandableButton: true }),
            React.createElement(
                _materialUi.CardMedia,
                { style: Tab.styles.child, mediaStyle: Tab.styles.child },
                React.createElement(Editor, { pydio: pydio, node: node, editorData: editorData, isActive: isActive })
            )
        ) : React.createElement(
            AnimatedCard,
            { style: cardStyle, containerStyle: Tab.styles.container, maximised: true, expanded: isActive, onExpandChange: !isActive ? select : null },
            React.createElement(Editor, { pydio: pydio, node: node, editorData: editorData, isActive: isActive }),
            React.createElement(SnackBar, { id: id, style: Tab.styles.toolbar })
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
                    overflow: "auto",
                    alignItems: "center"
                    /*backgroundColor: "rgb(66, 66, 66)"*/
                },
                child: {
                    display: "flex",
                    flex: 1
                },
                toolbar: {
                    backgroundColor: "rgb(0, 0, 0)",
                    color: "rgba(255, 255, 255, 0.87)",
                    width: "min-content",
                    margin: "0 auto",
                    padding: 0,
                    position: "absolute",
                    bottom: 24,
                    height: 48,
                    borderRadius: 3,
                    alignSelf: "center"
                }
            };
        }
    }]);

    var _Tab = Tab;
    Tab = _reactRedux.connect(mapStateToProps, EditorActions)(Tab) || Tab;
    return Tab;
})(React.Component);

exports['default'] = Tab;

var SnackBar = (function (_React$Component2) {
    _inherits(SnackBar, _React$Component2);

    function SnackBar(props) {
        _classCallCheck(this, _SnackBar);

        _React$Component2.call(this, props);

        var size = props.size;
        var scale = props.scale;

        this.state = {
            minusDisabled: scale - 0.5 <= 0,
            magnifyDisabled: size == "contain",
            plusDisabled: scale + 0.5 >= 20
        };
    }

    SnackBar.prototype.componentWillReceiveProps = function componentWillReceiveProps(props) {
        var size = props.size;
        var scale = props.scale;

        this.setState({
            minusDisabled: scale - 0.5 <= 0,
            magnifyDisabled: size == "contain",
            plusDisabled: scale + 0.5 >= 20
        });
    };

    SnackBar.prototype.render = function render() {
        var _state = this.state;
        var _state$minusDisabled = _state.minusDisabled;
        var minusDisabled = _state$minusDisabled === undefined ? false : _state$minusDisabled;
        var _state$magnifyDisabled = _state.magnifyDisabled;
        var magnifyDisabled = _state$magnifyDisabled === undefined ? false : _state$magnifyDisabled;
        var _state$plusDisabled = _state.plusDisabled;
        var plusDisabled = _state$plusDisabled === undefined ? false : _state$plusDisabled;
        var _props3 = this.props;
        var size = _props3.size;
        var scale = _props3.scale;
        var _props3$playing = _props3.playing;
        var playing = _props3$playing === undefined ? false : _props3$playing;
        var _props3$resolution = _props3.resolution;
        var resolution = _props3$resolution === undefined ? "hi" : _props3$resolution;
        var onAutoPlayToggle = _props3.onAutoPlayToggle;
        var onSizeChange = _props3.onSizeChange;
        var onResolutionToggle = _props3.onResolutionToggle;

        var remaining = _objectWithoutProperties(_props3, ['size', 'scale', 'playing', 'resolution', 'onAutoPlayToggle', 'onSizeChange', 'onResolutionToggle']);

        // Content functions
        var _props4 = this.props;
        var saveable = _props4.saveable;
        var undoable = _props4.undoable;
        var redoable = _props4.redoable;
        var onSave = _props4.onSave;
        var onUndo = _props4.onUndo;
        var onRedo = _props4.onRedo;
        var _props5 = this.props;
        var onToggleLineNumbers = _props5.onToggleLineNumbers;
        var onToggleLineWrapping = _props5.onToggleLineWrapping;
        var _props6 = this.props;
        var onSearch = _props6.onSearch;
        var onJumpTo = _props6.onJumpTo;

        var editable = saveable || undoable || redoable;
        var _props7 = this.props;
        var editortools = _props7.editortools;
        var searchable = _props7.searchable;

        // Resolution functions
        var hdable = this.props.hdable;

        // Selection functions
        var playable = this.props.playable;

        // Size functions
        var resizable = this.props.resizable;

        if (!editable && !hdable && !playable && !resizable) {
            return null;
        }

        return React.createElement(
            _reactDraggable2['default'],
            null,
            React.createElement(
                _materialUi.Toolbar,
                remaining,
                playable && React.createElement(
                    _materialUi.ToolbarGroup,
                    null,
                    React.createElement(_materialUi.IconButton, {
                        iconClassName: "mdi " + (!playing ? "mdi-play" : "mdi-pause"),
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onAutoPlayToggle();
                        }
                    })
                ),
                playable && resizable && React.createElement(_materialUi.ToolbarSeparator, { style: styles.divider }),
                resizable && React.createElement(
                    _materialUi.ToolbarGroup,
                    null,
                    React.createElement(_materialUi.IconButton, {
                        iconClassName: 'mdi mdi-minus',
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onSizeChange({
                                size: "auto",
                                scale: scale - 0.5
                            });
                        },
                        disabled: minusDisabled
                    }),
                    React.createElement(_materialUi.IconButton, {
                        iconClassName: 'mdi mdi-magnify-minus',
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onSizeChange({
                                size: "contain"
                            });
                        },
                        disabled: magnifyDisabled
                    }),
                    React.createElement(_materialUi.IconButton, {
                        iconClassName: 'mdi mdi-plus',
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onSizeChange({
                                size: "auto",
                                scale: scale + 0.5
                            });
                        },
                        disabled: plusDisabled
                    })
                ),
                (playable || resizable) && hdable && React.createElement(_materialUi.ToolbarSeparator, { style: styles.divider }),
                hdable && React.createElement(
                    _materialUi.ToolbarGroup,
                    null,
                    React.createElement(_materialUi.IconButton, {
                        iconClassName: "mdi " + (resolution == "hi" ? "mdi-quality-high" : "mdi-image"),
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onResolutionToggle();
                        }
                    })
                ),
                (playable || resizable || hdable) && editable && React.createElement(_materialUi.ToolbarSeparator, { style: styles.divider }),
                editable && React.createElement(
                    _materialUi.ToolbarGroup,
                    null,
                    saveable && React.createElement(_materialUi.IconButton, {
                        iconClassName: 'mdi mdi-content-save',
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onSave();
                        }
                    }),
                    undoable && React.createElement(_materialUi.IconButton, {
                        iconClassName: 'mdi mdi-undo',
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onUndo();
                        }
                    }),
                    redoable && React.createElement(_materialUi.IconButton, {
                        iconClassName: 'mdi mdi-redo',
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onRedo();
                        }
                    })
                ),
                (playable || resizable || hdable || editable) && editortools && React.createElement(_materialUi.ToolbarSeparator, { style: styles.divider }),
                editortools && React.createElement(
                    _materialUi.ToolbarGroup,
                    null,
                    onToggleLineNumbers && React.createElement(_materialUi.IconButton, {
                        iconClassName: 'mdi mdi-format-list-numbers',
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onToggleLineNumbers();
                        }
                    }),
                    onToggleLineWrapping && React.createElement(_materialUi.IconButton, {
                        iconClassName: 'mdi mdi-wrap',
                        iconStyle: styles.iconButton,
                        onClick: function () {
                            return onToggleLineWrapping();
                        }
                    })
                ),
                (playable || resizable || hdable || editable || editortools) && searchable && React.createElement(_materialUi.ToolbarSeparator, { style: styles.divider }),
                searchable && React.createElement(
                    _materialUi.ToolbarGroup,
                    null,
                    React.createElement(_materialUi.TextField, { onKeyUp: function (_ref) {
                            var key = _ref.key;
                            var target = _ref.target;
                            return key === 'Enter' && onJumpTo(target.value);
                        }, hintText: 'Jump to Line', style: styles.textField, hintStyle: styles.textHint, inputStyle: styles.textInput }),
                    React.createElement(_materialUi.TextField, { onKeyUp: function (_ref2) {
                            var key = _ref2.key;
                            var target = _ref2.target;
                            return key === 'Enter' && onSearch(target.value);
                        }, hintText: 'Search...', style: styles.textField, hintStyle: styles.textHint, inputStyle: styles.textInput })
                )
            )
        );
    };

    var _SnackBar = SnackBar;
    SnackBar = _reactRedux.connect(mapStateToProps)(SnackBar) || SnackBar;
    SnackBar = withResolutionControls(SnackBar) || SnackBar;
    SnackBar = withSizeControls(SnackBar) || SnackBar;
    SnackBar = withAutoPlayControls(SnackBar) || SnackBar;
    SnackBar = withContentControls(SnackBar) || SnackBar;
    return SnackBar;
})(React.Component);

function mapStateToProps(state, ownProps) {
    var editor = state.editor;
    var tabs = state.tabs;

    var current = tabs.filter(function (tab) {
        return tab.id === ownProps.id;
    })[0] || {};

    return _extends({}, ownProps, current, {
        isActive: editor.activeTabId === current.id
    });
}

var AnimatedCard = _makeMaximise2['default'](_materialUi.Card);
module.exports = exports['default'];
