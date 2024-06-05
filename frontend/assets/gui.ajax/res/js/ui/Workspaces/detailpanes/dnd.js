/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

const propsToComponentName = (props) => {
    if(props.namespace && props.componentName) {
        return props.namespace + '.' + props.componentName;
    }
    return null
}

const itemSource = {
    beginDrag: function (props) {
        // Return the data describing the dragged item
        if(props.startDragState){
            props.startDragState()
        }
        return {component: propsToComponentName(props)};
    },
    endDrag: function(props){
        if(props.endDragState){
            props.endDragState()
        }
    }
};

const itemTarget = {
    hover: function(props, monitor) {
        const draggedComponent = monitor.getItem().component;
        const targetComponent = propsToComponentName(props)
        if (draggedComponent && targetComponent && props.switchItems && draggedComponent !== targetComponent) {
            props.switchItems(draggedComponent, targetComponent, false);
        }
    },
    drop: function(props, monitor){
        const draggedComponent = monitor.getItem().component;
        const targetComponent = propsToComponentName(props)
        if(props.onColumnDrop) {
            props.onColumnDrop(draggedComponent, props.dropColumnIndex)
        } else if (draggedComponent && targetComponent && props.switchItems) {
            props.switchItems(draggedComponent, targetComponent, true);
        }
    }
};

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    };
}

function collectDrop(connect, monitor){
    return {
        connectDropTarget: connect.dropTarget(),
        canDrop: monitor.canDrop(),
        isOver:monitor.isOver(),
        isOverCurrent:monitor.isOver({shallow:true})
    };
}

const DragTypes = {
    CARD :"card"
}

export {itemSource, itemTarget, collect, collectDrop, DragTypes}