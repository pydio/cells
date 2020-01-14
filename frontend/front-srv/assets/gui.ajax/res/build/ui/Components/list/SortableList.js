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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilDND = require('../util/DND');

var _materialUi = require('material-ui');

/***************************/
/* REACT DND SORTABLE LIST
 /**************************/
/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
var sortableItemSource = {
    beginDrag: function beginDrag(props) {
        // Return the data describing the dragged item
        return { id: props.id };
    },
    endDrag: function endDrag(props) {
        props.endSwitching();
    }
};

var sortableItemTarget = {

    hover: function hover(props, monitor) {
        var draggedId = monitor.getItem().id;
        if (draggedId !== props.id) {
            props.switchItems(draggedId, props.id);
        }
    }

};

var sortableItem = _react2['default'].createClass({
    displayName: 'sortableItem',

    propTypes: {
        connectDragSource: _react2['default'].PropTypes.func.isRequired,
        connectDropTarget: _react2['default'].PropTypes.func.isRequired,
        isDragging: _react2['default'].PropTypes.bool.isRequired,
        id: _react2['default'].PropTypes.any.isRequired,
        label: _react2['default'].PropTypes.string.isRequired,
        switchItems: _react2['default'].PropTypes.func.isRequired,
        removable: _react2['default'].PropTypes.bool,
        onRemove: _react2['default'].PropTypes.func
    },

    removeClicked: function removeClicked() {
        this.props.onRemove(this.props.id);
    },

    render: function render() {
        // Your component receives its own props as usual
        var id = this.props.id;

        // These two props are injected by React DnD,
        // as defined by your `collect` function above:
        var isDragging = this.props.isDragging;
        var connectDragSource = this.props.connectDragSource;
        var connectDropTarget = this.props.connectDropTarget;

        var remove;
        if (this.props.removable) {
            remove = _react2['default'].createElement('span', { className: 'button mdi mdi-close', onClick: this.removeClicked });
        }
        return _react2['default'].createElement(
            _materialUi.Paper,
            {
                ref: function (instance) {
                    connectDropTarget(ReactDOM.findDOMNode(instance));
                    connectDragSource(ReactDOM.findDOMNode(instance));
                },
                zDepth: 1,
                style: { opacity: isDragging ? 0 : 1, margin: '8px 0' }
            },
            _react2['default'].createElement(
                'div',
                { className: this.props.className },
                this.props.label,
                remove
            )
        );
    }
});

var NonDraggableListItem = _react2['default'].createClass({
    displayName: 'NonDraggableListItem',

    render: function render() {
        var remove;
        if (this.props.removable) {
            remove = _react2['default'].createElement('span', { className: 'button mdi mdi-close', onClick: this.removeClicked });
        }
        return _react2['default'].createElement(
            _materialUi.Paper,
            { zDepth: 1, style: { margin: '8px 0' } },
            _react2['default'].createElement(
                'div',
                { className: this.props.className },
                this.props.label,
                remove
            )
        );
    }
});

var DraggableListItem;
if (window.ReactDND) {
    DraggableListItem = ReactDND.flow(ReactDND.DragSource(_utilDND.Types.SORTABLE_LIST_ITEM, sortableItemSource, _utilDND.collect), ReactDND.DropTarget(_utilDND.Types.SORTABLE_LIST_ITEM, sortableItemTarget, _utilDND.collectDrop))(sortableItem);
} else {
    DraggableListItem = NonDraggableListItem;
}

var SortableList = _react2['default'].createClass({
    displayName: 'SortableList',

    propTypes: {
        values: _react2['default'].PropTypes.array.isRequired,
        onOrderUpdated: _react2['default'].PropTypes.func,
        removable: _react2['default'].PropTypes.bool,
        onRemove: _react2['default'].PropTypes.func,
        className: _react2['default'].PropTypes.string,
        itemClassName: _react2['default'].PropTypes.string
    },

    getInitialState: function getInitialState() {
        return { values: this.props.values };
    },
    componentWillReceiveProps: function componentWillReceiveProps(props) {
        this.setState({ values: props.values, switchData: null });
    },

    findItemIndex: function findItemIndex(itemId, data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i]['payload'] == itemId) {
                return i;
            }
        }
    },

    switchItems: function switchItems(oldId, newId) {
        var oldIndex = this.findItemIndex(oldId, this.state.values);
        var oldItem = this.state.values[oldIndex];
        var newIndex = this.findItemIndex(newId, this.state.values);
        var newItem = this.state.values[newIndex];

        var currentValues = this.state.values.slice();
        currentValues[oldIndex] = newItem;
        currentValues[newIndex] = oldItem;

        // Check that it did not come back to original state
        var oldPrevious = this.findItemIndex(oldId, this.props.values);
        var newPrevious = this.findItemIndex(newId, this.props.values);
        if (oldPrevious == newIndex && newPrevious == oldIndex) {
            this.setState({ values: currentValues, switchData: null });
            //console.log("no more moves");
        } else {
                this.setState({ values: currentValues, switchData: { oldId: oldId, newId: newId } });
                //console.log({oldId:oldIndex, newId:newIndex});
            }
    },

    endSwitching: function endSwitching() {
        if (this.state.switchData) {
            // Check that it did not come back to original state
            if (this.props.onOrderUpdated) {
                this.props.onOrderUpdated(this.state.switchData.oldId, this.state.switchData.newId, this.state.values);
            }
        }
        this.setState({ switchData: null });
    },

    render: function render() {
        var switchItems = this.switchItems;
        return _react2['default'].createElement(
            'div',
            { className: this.props.className },
            this.state.values.map((function (item) {
                return _react2['default'].createElement(DraggableListItem, {
                    id: item.payload,
                    key: item.payload,
                    label: item.text,
                    switchItems: switchItems,
                    endSwitching: this.endSwitching,
                    removable: this.props.removable,
                    onRemove: this.props.onRemove,
                    className: this.props.itemClassName
                });
            }).bind(this))
        );
    }
});

exports['default'] = SortableList;
module.exports = exports['default'];
