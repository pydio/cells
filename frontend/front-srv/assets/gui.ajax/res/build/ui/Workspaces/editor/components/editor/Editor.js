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

// IMPORT
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

//import FullScreen from 'react-fullscreen';

var _reactDraggable = require('react-draggable');

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

var _reactRedux = require('react-redux');

var _materialUi = require('material-ui');

var _EditorTab = require('./EditorTab');

var _EditorTab2 = _interopRequireDefault(_EditorTab);

var _EditorToolbar = require('./EditorToolbar');

var _EditorToolbar2 = _interopRequireDefault(_EditorToolbar);

var _EditorButton = require('./EditorButton');

var _EditorButton2 = _interopRequireDefault(_EditorButton);

var _makeMinimise = require('./make-minimise');

var _makeMinimise2 = _interopRequireDefault(_makeMinimise);

var MAX_ITEMS = 4;

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var makeMotion = _Pydio$requireLib.makeMotion;
var makeTransitionHOC = _Pydio$requireLib.makeTransitionHOC;
var withMouseTracker = _Pydio$requireLib.withMouseTracker;
var withSelectionControls = _Pydio$requireLib.withSelectionControls;
var withContainerSize = _Pydio$requireLib.withContainerSize;
var EditorActions = _Pydio$requireLib.EditorActions;

var styles = {
    selectionButtonLeft: {
        position: "absolute",
        top: "calc(50% - 18px)",
        left: "40px"
    },
    selectionButtonRight: {
        position: "absolute",
        top: "calc(50% - 18px)",
        right: "40px"
    },
    iconSelectionButton: {
        borderRadius: "50%",
        width: "36px",
        height: "36px",
        lineHeight: "36px",
        backgroundColor: "rgb(0, 0, 0, 0.87)",
        color: "rgb(255, 255,255, 0.87)"
    },
    toolbar: {
        'default': {
            top: 0,
            left: 0,
            right: 0,
            flexShrink: 0
        }
    }
};

// MAIN COMPONENT

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor() {
        _classCallCheck(this, _Editor);

        _React$Component.apply(this, arguments);
    }

    Editor.prototype.handleBlurOnSelection = function handleBlurOnSelection(e) {
        var editorModify = this.props.editorModify;

        editorModify({ focusOnSelection: false });
    };

    Editor.prototype.handleFocusOnSelection = function handleFocusOnSelection(e) {
        var editorModify = this.props.editorModify;

        editorModify({ focusOnSelection: true });

        e.preventDefault();
        e.stopPropagation();

        return false;
    };

    Editor.prototype.renderChild = function renderChild() {
        var _props = this.props;
        var activeTab = _props.activeTab;
        var tabs = _props.tabs;

        var filteredTabs = tabs.filter(function (_ref) {
            var editorData = _ref.editorData;
            return editorData;
        });

        return filteredTabs.map(function (tab, index) {
            var style = {
                display: "flex",
                width: 100 / MAX_ITEMS + "%",
                height: "40%",
                margin: "10px",
                overflow: "hidden",
                whiteSpace: "nowrap"
            };

            if (filteredTabs.length > MAX_ITEMS) {
                if (index < MAX_ITEMS) {
                    style.flex = 1;
                } else {
                    style.flex = 0;
                    style.margin = 0;
                }
            }

            if (activeTab) {
                if (tab.id === activeTab.id) {
                    style.margin = 0;
                    style.flex = 1;
                } else {
                    style.flex = 0;
                    style.margin = 0;
                }
            }

            return React.createElement(_EditorTab2['default'], { key: 'editortab' + tab.id, id: tab.id, style: _extends({}, style) });
        });
    };

    Editor.prototype.render = function render() {
        var _this = this;

        var _props2 = this.props;
        var style = _props2.style;
        var activeTab = _props2.activeTab;
        var fixedToolbar = _props2.fixedToolbar;
        var hideToolbar = _props2.hideToolbar;
        var tabDeleteAll = _props2.tabDeleteAll;
        var hideSelectionControls = _props2.hideSelectionControls;
        var prevSelectionDisabled = _props2.prevSelectionDisabled;
        var nextSelectionDisabled = _props2.nextSelectionDisabled;
        var onSelectPrev = _props2.onSelectPrev;
        var onSelectNext = _props2.onSelectNext;

        var parentStyle = {
            display: "flex",
            flex: 1,
            overflow: "hidden",
            width: "100%",
            height: "100%",
            position: "relative"
        };

        if (!activeTab) {
            parentStyle = _extends({}, parentStyle, {
                alignItems: "center", // To fix a bug in Safari, we only set it when height not = 100% (aka when there is no active tab)
                justifyContent: "center"
            });
        }

        var paperStyle = _extends({
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            backgroundColor: 'transparent',
            borderRadius: 0
        }, style);

        var toolbarStyle = styles.toolbar['default'];
        var keyPress = undefined;
        if (onSelectNext || onSelectPrev) {
            keyPress = function (e) {
                if (e.key === 'ArrowLeft' && onSelectPrev && !prevSelectionDisabled) {
                    try {
                        onSelectPrev();
                    } catch (e) {}
                } else if (e.key === 'ArrowRight' && onSelectNext && !nextSelectionDisabled) {
                    try {
                        onSelectNext();
                    } catch (e) {}
                } else if (e.key === 'Escape' && tabDeleteAll) {
                    tabDeleteAll();
                }
            };
        }

        return React.createElement(
            _materialUi.Paper,
            { zDepth: 5, style: paperStyle, onClick: function (e) {
                    return _this.handleBlurOnSelection(e);
                }, tabIndex: "-1", onKeyDown: keyPress },
            !hideToolbar && React.createElement(_EditorToolbar2['default'], { style: toolbarStyle, display: fixedToolbar ? "fixed" : "removable" }),
            React.createElement(
                'div',
                { className: 'body', style: parentStyle, onClick: function (e) {
                        return _this.handleFocusOnSelection(e);
                    } },
                this.props.transitionEnded && this.renderChild()
            ),
            !hideSelectionControls && onSelectPrev && React.createElement(_EditorButton2['default'], {
                iconClassName: 'mdi mdi-chevron-left',
                style: styles.selectionButtonLeft,
                iconStyle: styles.iconSelectionButton,
                disabled: prevSelectionDisabled,
                onClick: function () {
                    return onSelectPrev();
                }
            }),
            !hideSelectionControls && onSelectNext && React.createElement(_EditorButton2['default'], {
                iconClassName: 'mdi mdi-chevron-right',
                style: styles.selectionButtonRight,
                iconStyle: styles.iconSelectionButton,
                disabled: nextSelectionDisabled,
                onClick: function () {
                    return onSelectNext();
                }
            })
        );
    };

    var _Editor = Editor;
    Editor = makeMotion({ scale: 1 }, { scale: 0 }, {
        check: function check(props) {
            return props.isMinimised;
        },
        style: function style(props) {
            return props.minimiseStyle;
        }
    })(Editor) || Editor;
    Editor = _reactRedux.connect(mapStateToProps, EditorActions)(Editor) || Editor;
    Editor = withSelectionControls(Editor) || Editor;
    Editor = withMouseTracker()(Editor) || Editor;
    Editor = makeTransitionHOC({ translateY: 800 }, { translateY: 0 })(Editor) || Editor;
    return Editor;
})(React.Component);

exports['default'] = Editor;
;

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    var _state$editor = state.editor;
    var editor = _state$editor === undefined ? {} : _state$editor;
    var _state$tabs = state.tabs;
    var tabs = _state$tabs === undefined ? [] : _state$tabs;
    var _editor$activeTabId = editor.activeTabId;
    var activeTabId = _editor$activeTabId === undefined ? -1 : _editor$activeTabId;
    var _editor$isMinimised = editor.isMinimised;
    var isMinimised = _editor$isMinimised === undefined ? false : _editor$isMinimised;
    var _editor$fixedToolbar = editor.fixedToolbar;
    var fixedToolbar = _editor$fixedToolbar === undefined ? false : _editor$fixedToolbar;
    var _editor$focusOnSelection = editor.focusOnSelection;
    var focusOnSelection = _editor$focusOnSelection === undefined ? false : _editor$focusOnSelection;

    var activeTab = tabs.filter(function (tab) {
        return tab.id === activeTabId;
    })[0];

    return _extends({}, ownProps, {
        fixedToolbar: fixedToolbar,
        hideToolbar: !ownProps.displayToolbar || !fixedToolbar && focusOnSelection && !ownProps.isNearTop,
        hideSelectionControls: !ownProps.browseable || focusOnSelection && !ownProps.isNearTop && !ownProps.isNearLeft && !ownProps.isNearRight,
        activeTab: activeTab,
        tabs: tabs,
        isMinimised: isMinimised
    });
}
module.exports = exports['default'];
