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

import React from 'react'
import {Types, collect, collectDrop} from '../util/DND'
import {Paper} from 'material-ui'

/***************************/
/* REACT DND SORTABLE LIST
 /**************************/
/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
var sortableItemSource = {
    beginDrag: function (props) {
        // Return the data describing the dragged item
        return { id: props.id };
    },
    endDrag: function(props){
        props.endSwitching();
    }
};

var sortableItemTarget = {

    hover: function(props, monitor){
        const draggedId = monitor.getItem().id;
        if (draggedId !== props.id) {
            props.switchItems(draggedId, props.id);
        }
    }

};

class sortableItem extends React.Component {

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

    removeClicked(){
        this.props.onRemove(this.props.id);
    }

    render() {
        const {isDragging, connectDragSource, connectDropTarget, renderItem, style, item, removable, className, label} =  this.props;

        let remove;
        if(removable){
            remove = <span className="button mdi mdi-close" onClick={(e) => this.removeClicked(e)}></span>
        }

        if(renderItem) {

            return (
                <div
                    ref={instance => {
                        connectDropTarget(ReactDOM.findDOMNode(instance));
                        connectDragSource(ReactDOM.findDOMNode(instance));
                    }}
                    style={{...style, opacity:isDragging?0:1}}
                >{renderItem(item)}</div>
            )
        } else {

            return (
                <Paper
                    ref={instance => {
                        connectDropTarget(ReactDOM.findDOMNode(instance));
                        connectDragSource(ReactDOM.findDOMNode(instance));
                    }}
                    zDepth={1}
                    style={{opacity:isDragging?0:1, margin: '8px 0'}}
                >
                    <div className={className}>
                        {label}
                        {remove}
                    </div>
                </Paper>
            );

        }
    }
}

class NonDraggableListItem extends React.Component {
    removeClicked(){
        this.props.onRemove(this.props.id);
    }

    render() {
        var remove;
        if(this.props.removable){
            remove = <span className="button mdi mdi-close" onClick={(e) => this.removeClicked(e)}></span>
        }
        return (
            <Paper zDepth={1} style={{margin: '8px 0'}}>
                <div className={this.props.className}>
                    {this.props.label}
                    {remove}
                </div>
            </Paper>
        );
    }
}

var DraggableListItem;
if(window.ReactDND){
    DraggableListItem = ReactDND.flow(
        ReactDND.DragSource(Types.SORTABLE_LIST_ITEM, sortableItemSource, collect),
        ReactDND.DropTarget(Types.SORTABLE_LIST_ITEM, sortableItemTarget, collectDrop)
    )(sortableItem);
}else{
    DraggableListItem = NonDraggableListItem;
}


class SortableList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {values: this.props.values};
    }

    componentWillReceiveProps(props) {
        this.setState({values: props.values, switchData:null});
    }

    findItemIndex(itemId, data){
        for(var i=0; i<data.length; i++){
            if(data[i]['payload'] === itemId){
                return i;
            }
        }
    }

    switchItems(oldId, newId){
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
        if(oldPrevious === newIndex && newPrevious === oldIndex){
            this.setState({values:currentValues, switchData:null})
        }else{
            this.setState({values:currentValues, switchData:{oldId:oldId, newId:newId}});
        }

    }

    endSwitching(){
        if(this.state.switchData){
            // Check that it did not come back to original state
            if(this.props.onOrderUpdated){
                this.props.onOrderUpdated(this.state.switchData.oldId, this.state.switchData.newId, this.state.values);
            }
        }
        this.setState({switchData:null});
    }

    render() {
        return (
            <div className={this.props.className}>
                {this.state.values.map(function(item){
                    return <DraggableListItem
                        id={item.payload}
                        key={item.payload}
                        label={item.text}
                        switchItems={this.switchItems.bind(this)}
                        endSwitching={this.endSwitching.bind(this)}
                        removable={this.props.removable}
                        onRemove={this.props.onRemove}
                        className={this.props.itemClassName}
                        item={item}
                        style={this.props.itemStyle}
                        renderItem={this.props.renderItem}
                    />
                }.bind(this))}
            </div>
        )
    }
}

export {SortableList as default}