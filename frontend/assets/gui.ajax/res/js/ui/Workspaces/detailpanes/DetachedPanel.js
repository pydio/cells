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

import React,{useState} from 'react'
import Pydio from 'pydio'
import {Paper, IconButton} from 'material-ui'
import {Resizable} from 're-resizable'
import Draggable from 'react-draggable'

const DetachedPanel = ({style, zDepth, onRequestClose, onRequestToInfoPanel, dragHandleSelector, children}) => {

    const [minimized, setMinimized] = useState(false)
    const windowIconStyle = {color:'var(--md-sys-color-outline-variant)'}
    const m  = (id) => Pydio.getMessages()['ajax_gui.' + id] || id

    return (
        <Draggable handle={dragHandleSelector} axis={"x"}>
            <Resizable
                style={{...style}}
                enable={{
                    top:!minimized,
                    right:!minimized,
                    left:!minimized,
                    topLeft:!minimized,
                    topRight:!minimized,
                    bottom:false, bottomRight:false, bottomLeft:false
                }}
                defaultSize={{width:420, height:'80%'}}
                minHeight={50}
                maxHeight={minimized?50:'98%'}
                minWidth={minimized?200:320}
                maxWidth={minimized?200:undefined}
            >
                <Paper zDepth={zDepth} rounded={false} style={{position:'absolute', inset: 0, display:'flex', flexDirection:'column', borderRadius: style.borderRadius}}>
                    <div style={{position:'absolute', right: 9, top: 6, zoom: 0.8}}>
                        <IconButton iconClassName={'mdi mdi-window-' + (minimized? 'maximize':'minimize')} onClick={() => setMinimized(!minimized)} iconStyle={windowIconStyle} tooltip={m(minimized?'infopanel.detached.maximize':'infopanel.detached.minimize')} tooltipPosition={"top-center"}/>
                        {onRequestToInfoPanel && <IconButton tooltip={m('infopanel.detached.dock')} iconClassName={'mdi mdi-dock-right'} onClick={onRequestToInfoPanel} iconStyle={windowIconStyle} tooltipPosition={"top-center"}/>}
                        {onRequestClose && <IconButton tooltip={Pydio.getMessages()[635]} iconClassName={'mdi mdi-close'} onClick={onRequestClose} iconStyle={windowIconStyle} tooltipPosition={"top-center"}/>}
                    </div>
                    {children}
                </Paper>
            </Resizable>
        </Draggable>
    )
}

export {DetachedPanel as default}