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

import React, {useState, useEffect, useRef} from 'react'
import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot');
import Pad from './pad'
import { muiThemeable } from 'material-ui/styles'
import {useNodeContent} from "./hooks";
const { useDataModelContextNodeAsItems } = Pydio.requireLib('components')

let MainPanel = ({dataModel, muiTheme, style}) => {

    const {node} = useDataModelContextNodeAsItems(dataModel, (n) => {return []})
    const {content=[], loaded, save} = useNodeContent(node)

    let body;

    if(!loaded) {
        console.log('NOT LOADED', content)
        return <div style={style}></div>
    }

    if(node) {
        const initialContent = content || []
        if(!initialContent.length) {
            initialContent.push({
                "type": "heading",
                "props": {
                    "level": 2
                },
                "content": [
                    {
                        "type": "text",
                        "text": node.getLabel(),
                        "styles": {}
                    }
                ]
            })
        }
        const reloadIdentifier = node.getMetadata().get('uuid') + '#' + (loaded?'loaded':'loading')
        console.log(reloadIdentifier, initialContent)
        body = (
            <Pad
                readOnly={false}
                darkMode={muiTheme.darkMode}
                initialContent={initialContent}
                onChange={(blocks) => save(blocks)}
                node={node}
                key={reloadIdentifier}
            />
        )
    }

    return (
        <div style={style}>{body}</div>
    )
}

MainPanel = muiThemeable()(PydioContextConsumer(MainPanel));
export default MainPanel