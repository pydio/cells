// CustomDragLayer.js
import React from 'react';
import { DragLayer } from 'react-dnd';

function collect(monitor) {
    return {
        isDragging:    monitor.isDragging(),
        item:          monitor.getItem(),
        clientOffset:  monitor.getClientOffset(),                  // mouse x/y
    };
}

function CustomDragLayer({ isDragging, item,   clientOffset}) {
    if (!isDragging || !clientOffset || !item || !item.node) {
        return null;
    }

    const style = {
        position:      'fixed',
        pointerEvents: 'none',
        top:           clientOffset.y,
        left:          clientOffset.x,
        transform:     'translate(-50%, -50%)',
        zIndex:        9999,
        width: 200,
        height: 100,
        backgroundColor: 'rgba(255,255,255,.9)',
        borderRadius: 8,
        display:'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow:'hidden',
        padding: 20
    };

    return (
        <div style={style}>
            {/* your preview component, e.g. a thumbnail of the node */}
            Move {item.node.getLabel()}
        </div>
    );
}

export default DragLayer(collect)(CustomDragLayer);