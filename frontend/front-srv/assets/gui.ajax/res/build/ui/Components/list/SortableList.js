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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var sortableItem = (function (_React$Component) {
    _inherits(sortableItem, _React$Component);

    function sortableItem() {
        _classCallCheck(this, sortableItem);

        _React$Component.apply(this, arguments);
    }

    // static propTypes = {
    //     connectDragSource: React.PropTypes.func.isRequired,
    //     connectDropTarget: React.PropTypes.func.isRequired,
    //     isDragging: React.PropTypes.bool.isRequired,
    //     id: React.PropTypes.any.isRequired,
    //     label: React.PropTypes.string.isRequired,
    //     switchItems: React.PropTypes.func.isRequired,
    //     removable: React.PropTypes.bool,
    //     onRemove:React.PropTypes.func
    // };

    sortableItem.prototype.removeClicked = function removeClicked() {
        this.props.onRemove(this.props.id);
    };

    sortableItem.prototype.render = function render() {
        var _this = this;

        // Your component receives its own props as usual
        var id = this.props.id;

        // These two props are injected by React DnD,
        // as defined by your `collect` function above:
        var isDragging = this.props.isDragging;
        var connectDragSource = this.props.connectDragSource;
        var connectDropTarget = this.props.connectDropTarget;

        var remove;
        if (this.props.removable) {
            remove = _react2['default'].createElement('span', { className: 'button mdi mdi-close', onClick: function (e) {
                    return _this.removeClicked(e);
                } });
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
    };

    return sortableItem;
})(_react2['default'].Component);

var NonDraggableListItem = (function (_React$Component2) {
    _inherits(NonDraggableListItem, _React$Component2);

    function NonDraggableListItem() {
        _classCallCheck(this, NonDraggableListItem);

        _React$Component2.apply(this, arguments);
    }

    NonDraggableListItem.prototype.removeClicked = function removeClicked() {
        this.props.onRemove(this.props.id);
    };

    NonDraggableListItem.prototype.render = function render() {
        var _this2 = this;

        var remove;
        if (this.props.removable) {
            remove = _react2['default'].createElement('span', { className: 'button mdi mdi-close', onClick: function (e) {
                    return _this2.removeClicked(e);
                } });
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
    };

    return NonDraggableListItem;
})(_react2['default'].Component);

var DraggableListItem;
if (window.ReactDND) {
    DraggableListItem = ReactDND.flow(ReactDND.DragSource(_utilDND.Types.SORTABLE_LIST_ITEM, sortableItemSource, _utilDND.collect), ReactDND.DropTarget(_utilDND.Types.SORTABLE_LIST_ITEM, sortableItemTarget, _utilDND.collectDrop))(sortableItem);
} else {
    DraggableListItem = NonDraggableListItem;
}

var SortableList = (function (_React$Component3) {
    _inherits(SortableList, _React$Component3);

    // static propTypes = {
    //     values: React.PropTypes.array.isRequired,
    //     onOrderUpdated: React.PropTypes.func,
    //     removable: React.PropTypes.bool,
    //     onRemove:React.PropTypes.func,
    //     className:React.PropTypes.string,
    //     itemClassName:React.PropTypes.string
    // };

    function SortableList(props) {
        _classCallCheck(this, SortableList);

        _React$Component3.call(this, props);
        this.state = { values: this.props.values };
    }

    SortableList.prototype.componentWillReceiveProps = function componentWillReceiveProps(props) {
        this.setState({ values: props.values, switchData: null });
    };

    SortableList.prototype.findItemIndex = function findItemIndex(itemId, data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i]['payload'] === itemId) {
                return i;
            }
        }
    };

    SortableList.prototype.switchItems = function switchItems(oldId, newId) {
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
        if (oldPrevious === newIndex && newPrevious === oldIndex) {
            this.setState({ values: currentValues, switchData: null });
        } else {
            this.setState({ values: currentValues, switchData: { oldId: oldId, newId: newId } });
        }
    };

    SortableList.prototype.endSwitching = function endSwitching() {
        if (this.state.switchData) {
            // Check that it did not come back to original state
            if (this.props.onOrderUpdated) {
                this.props.onOrderUpdated(this.state.switchData.oldId, this.state.switchData.newId, this.state.values);
            }
        }
        this.setState({ switchData: null });
    };

    SortableList.prototype.render = function render() {
        return _react2['default'].createElement(
            'div',
            { className: this.props.className },
            this.state.values.map((function (item) {
                return _react2['default'].createElement(DraggableListItem, {
                    id: item.payload,
                    key: item.payload,
                    label: item.text,
                    switchItems: this.switchItems.bind(this),
                    endSwitching: this.endSwitching.bind(this),
                    removable: this.props.removable,
                    onRemove: this.props.onRemove,
                    className: this.props.itemClassName
                });
            }).bind(this))
        );
    };

    return SortableList;
})(_react2['default'].Component);

exports['default'] = SortableList;
module.exports = exports['default'];
