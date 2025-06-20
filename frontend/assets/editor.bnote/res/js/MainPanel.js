/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {createContext} from 'react'
import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot');
import Pad from './pad'
import { muiThemeable } from 'material-ui/styles'
import {PydioContext} from "./hooks/context";
import {useNodeContent} from "./hooks/useNodeContent";
const { useDataModelContextNodeAsItems } = Pydio.requireLib('components')

export const SaveContext = createContext({
    dirty: false,
    saving: false
})

let MainPanel = ({dataModel, entryProps, muiTheme, style, contentMeta, abstractMeta}) => {

    const {node} = useDataModelContextNodeAsItems(dataModel, (n) => {return []})
    const {content=[], loaded, save, dirty, setDirty} = useNodeContent(node, contentMeta, true)
    let body;

    if(node && node.isLoaded() && loaded) {
        const nodeUUID = node.getMetadata().get('uuid')
        const reloadIdentifier = nodeUUID + '#' + (loaded?'loaded':'loading')
        const nodeReadonly = node.getMetadata().get('node_readonly')==='true'
        body = (
            <Pad
                readOnly={nodeReadonly}
                darkMode={muiTheme.darkMode}
                initialContent={content}
                onChange={(blocks) => {
                    if(nodeReadonly) {
                        return
                    }
                    setDirty(true)
                    save(blocks)
                }}
                key={reloadIdentifier}
            />
        )

    }

    return (
        <SaveContext.Provider value={{dirty, saving: false}}>
        <PydioContext.Provider value={{dataModel, entryProps}}>
            <div
                /*
                onDragOver={(e) => {
                e.stopPropagation();  // Prevent React-DND from seeing it
                e.preventDefault();   // Enable drop
            }}
                onDragEnter={(e) => {
                e.stopPropagation();  // Prevent React-DND from seeing it
                e.preventDefault();   // Enable drop
            }}
                onDragLeave={(e) => {
                e.stopPropagation();  // Prevent React-DND from seeing it
                e.preventDefault();   // Enable drop
            }}
            onDrop={(e) => {
                if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                    // do not intercept file dropping!
                    return
                }
               e.stopPropagation();  // Critical
               e.preventDefault();
           }}*/
            style={{...style, position:'relative'}}
            >{body}</div>
        </PydioContext.Provider>
        </SaveContext.Provider>
    )
}

MainPanel = muiThemeable()(PydioContextConsumer(MainPanel));
export default MainPanel