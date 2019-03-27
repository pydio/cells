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

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _utilDND = require('../util/DND');

var _reactDnd = require('react-dnd');

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

/**
 * Material List Entry
 */

var ListEntry = (function (_React$Component) {
    _inherits(ListEntry, _React$Component);

    function ListEntry() {
        _classCallCheck(this, ListEntry);

        _React$Component.apply(this, arguments);
    }

    ListEntry.prototype.onClick = function onClick(event) {
        if (this.props.showSelector) {
            if (this.props.selectorDisabled) return;
            this.props.onSelect(this.props.node, event);
            event.stopPropagation();
            event.preventDefault();
        } else if (this.props.onClick) {
            this.props.onClick(this.props.node, event);
        }
    };

    ListEntry.prototype.onDoubleClick = function onDoubleClick(event) {
        if (this.props.onDoubleClick) {
            this.props.onDoubleClick(this.props.node, event);
        }
    };

    ListEntry.prototype.render = function render() {
        var _this = this;

        var selector = undefined,
            icon = undefined,
            additionalClassName = undefined;

        var _props = this.props;
        var node = _props.node;
        var showSelector = _props.showSelector;
        var selected = _props.selected;
        var selectorDisabled = _props.selectorDisabled;
        var firstLine = _props.firstLine;
        var secondLine = _props.secondLine;
        var thirdLine = _props.thirdLine;
        var style = _props.style;
        var actions = _props.actions;
        var iconCell = _props.iconCell;
        var mainIcon = _props.mainIcon;
        var className = _props.className;
        var canDrop = _props.canDrop;
        var isOver = _props.isOver;
        var connectDragSource = _props.connectDragSource;
        var connectDropTarget = _props.connectDropTarget;

        var mainClasses = ['material-list-entry', 'material-list-entry-' + (thirdLine ? 3 : secondLine ? 2 : 1) + '-lines'];
        if (className) mainClasses.push(className);

        if (showSelector) {
            selector = React.createElement(
                'div',
                { className: 'material-list-selector' },
                React.createElement(_materialUi.Checkbox, { checked: selected, ref: 'selector', disabled: selectorDisabled })
            );
        }

        if (iconCell) {
            icon = this.props.iconCell;
        } else if (this.props.mainIcon) {
            var _style = {
                fontSize: 18, color: '#FFF', display: 'inline-block', margin: 16, backgroundColor: 'rgb(189, 189, 189)', padding: '7px 3px', width: 33, height: 33, textAlign: 'center'
            };
            icon = React.createElement(_materialUi.FontIcon, { className: "mui-font-icon " + this.props.mainIcon, style: _style });
        }

        if (canDrop && isOver) {
            mainClasses.push('droppable-active');
        }

        if (node) {
            mainClasses.push('listentry' + node.getPath().replace(/\//g, '_'));
            mainClasses.push('ajxp_node_' + (node.isLeaf() ? 'leaf' : 'collection'));
            if (node.getAjxpMime()) {
                mainClasses.push('ajxp_mime_' + node.getAjxpMime());
            }
        }

        var additionalStyle = {
            /*transition:'background-color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'*/
        };
        if (this.state && this.state.hover && !this.props.noHover) {
            additionalStyle = _extends({}, additionalStyle, {
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderBottom: '1px solid transparent'
            });
        }
        if (selected) {
            var selectionColor = this.props.muiTheme.palette.accent2Color;
            var selectionColorDark = _color2['default'](selectionColor).dark();
            additionalStyle = _extends({}, additionalStyle, {
                backgroundColor: selectionColor,
                color: selectionColorDark ? 'white' : 'rgba(0,0,0,.87)'
            });
            mainClasses.push('selected');
            mainClasses.push('selected-' + (selectionColorDark ? 'dark' : 'light'));
        }

        return React.createElement(
            ContextMenuWrapper,
            _extends({}, this.props, {
                ref: function (instance) {
                    var node = _reactDom2['default'].findDOMNode(instance);
                    if (typeof connectDropTarget === 'function') connectDropTarget(node);
                    if (typeof connectDragSource === 'function') connectDragSource(node);
                },
                onClick: this.onClick.bind(this),
                onDoubleClick: showSelector ? null : this.onDoubleClick.bind(this),
                className: mainClasses.join(' '),
                onMouseOver: function () {
                    _this.setState({ hover: true });
                },
                onMouseOut: function () {
                    _this.setState({ hover: false });
                },
                style: _extends({}, style, additionalStyle) }),
            selector,
            React.createElement(
                'div',
                { className: "material-list-icon" + (mainIcon || iconCell ? "" : " material-list-icon-none") },
                icon
            ),
            React.createElement(
                'div',
                { className: 'material-list-text' },
                React.createElement(
                    'div',
                    { key: 'line-1', className: 'material-list-line-1' },
                    firstLine
                ),
                React.createElement(
                    'div',
                    { key: 'line-2', className: 'material-list-line-2' },
                    secondLine
                ),
                React.createElement(
                    'div',
                    { key: 'line-3', className: 'material-list-line-3' },
                    thirdLine
                )
            ),
            React.createElement(
                'div',
                { className: 'material-list-actions' },
                actions
            )
        );
    };

    return ListEntry;
})(React.Component);

var ContextMenuWrapper = function ContextMenuWrapper(props) {
    return React.createElement('div', props);
};
ContextMenuWrapper = PydioHOCs.withContextMenu(ContextMenuWrapper);

ListEntry.propTypes = {
    showSelector: React.PropTypes.bool,
    selected: React.PropTypes.bool,
    selectorDisabled: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onClick: React.PropTypes.func,
    iconCell: React.PropTypes.element,
    mainIcon: React.PropTypes.string,
    firstLine: React.PropTypes.node,
    secondLine: React.PropTypes.node,
    thirdLine: React.PropTypes.node,
    actions: React.PropTypes.element,
    activeDroppable: React.PropTypes.bool,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    noHover: React.PropTypes.bool
};

exports.ListEntry = ListEntry = _materialUiStyles.muiThemeable()(ListEntry);

var DragDropListEntry = _reactDnd.flow(_reactDnd.DragSource(_utilDND.Types.NODE_PROVIDER, _utilDND.nodeDragSource, _utilDND.collect), _reactDnd.DropTarget(_utilDND.Types.NODE_PROVIDER, _utilDND.nodeDropTarget, _utilDND.collectDrop))(ListEntry);

exports.DragDropListEntry = DragDropListEntry;
exports.ListEntry = ListEntry;
