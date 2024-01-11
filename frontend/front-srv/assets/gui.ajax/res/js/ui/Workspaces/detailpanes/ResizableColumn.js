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


import React, {createContext, useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import {Resizable} from "re-resizable";
import useWorkspacePref from '../views/useWorkspacePref'
import reactdnd from 'react-dnd'
import {collectDrop, DragTypes, itemTarget} from "./dnd";

let ResizableColumn = ({storageKey, closed, isGhost, isLast, afterResize = ()=>{}, defaultWidth= 250, minWidth, maxWidth, connectDropTarget, isOver, isOverCurrent, children}) => {

    const [width, setWidth] = useWorkspacePref(storageKey, defaultWidth)
    const [handleHover, setHandlerHover] = useState(false)

    let style = {
        transition: 'all 550ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        borderRadius: 10,
        flexGrow: 0
    }
    let height = '100%';
    if((width && width <= 100) || isGhost) {
        style.background = 'var(--md-sys-color-surface-1)'
        style.borderRadius = '12px 12px 0 0';
        style.paddingTop = 8;
    }
    if(isOver) {
        style.background = 'var(--md-sys-color-surface-3)';
    }
    if(isGhost){
        minWidth = 10
        if(isOver) {
            minWidth = 73;
        }
    }
    if(closed){
        style.marginRight = -8
    }

    useEffect(()=>{
        afterResize()
    }, [width])

    const arrowHandleStyle = {
        width: 6,
        height: 40,
        background:'var(--md-sys-color-surface-2)',
        cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        borderRadius: 6
    }

    const handleComp = (
        <div style={{position:'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center'}} onMouseEnter={()=>setHandlerHover(true)} onMouseLeave={()=>setHandlerHover(false)}>
            {width > 73 && handleHover &&
                <div onMouseDown={(e)=>{setWidth(73); e.stopPropagation()}} style={arrowHandleStyle}>
                    <span className={"mdi mdi-menu-right-outline"}/>
                </div>
            }
        </div>
    )

    return (
        <ResizableContext.Provider value={{width, setWidth}}>
            <Resizable
                enable={{top:false, right:false, bottom:false, left:!closed&&!isGhost, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false }}
                style={style}
                handleStyles={{left:{width: 8, left: -8}}}
                handleComponent={{left:handleComp}}
                size={{width:closed?0:width, height}}
                minWidth={closed?0:minWidth}
                maxWidth={isGhost?minWidth:undefined}
                identifier={storageKey}
                boundsByDirection={true}
                className={"no-flex-shrink"}
                onResizeStop={(e, direction, ref, d)=>{
                    let newWidth = width+d.width
                    if(newWidth < 100) {
                        newWidth = 73
                    }
                    setWidth(newWidth)
                }}
                ref={(instance)=>connectDropTarget(ReactDOM.findDOMNode(instance))}
            >{children}
            </Resizable>
        </ResizableContext.Provider>
    )

}

const ResizableContext = createContext({});

ResizableColumn = reactdnd.flow(
    reactdnd.DropTarget(DragTypes.CARD, itemTarget, collectDrop)
)(ResizableColumn)

export {ResizableColumn, ResizableContext};