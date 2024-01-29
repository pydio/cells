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

import {DropTarget} from "react-dnd";
import {collectDrop, Types} from "../util/DND";
import ReactDOM from "react-dom";
import React from "react";

const nodeDropTarget = {

    hover: function(props, monitor){
    },

    canDrop: function(props, monitor){
        return true;
    },

    drop: function(props, monitor){
        const source = monitor.getItem().node;
        const {onDropNode} = props;
        if(onDropNode && source) {
            onDropNode(source);
        }
        return {};
    }

};


const DropZoneWrapper = DropTarget(Types.NODE_PROVIDER, nodeDropTarget, collectDrop)((props) => {
    const {canDrop, isOver, connectDropTarget} = props;
    let className;
    if(canDrop && isOver){
        className = 'chat-droppable-active';
    }
    return (
        <div
            {...props}
            className={className}
            ref={instance => {
                const node = ReactDOM.findDOMNode(instance)
                if (typeof connectDropTarget === 'function') {
                    connectDropTarget(node)
                }
            }}
        />
    )
});

export default DropZoneWrapper