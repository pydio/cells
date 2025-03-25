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

import React from 'react'
import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot');
import Pad from './pad'
import { muiThemeable } from 'material-ui/styles'
import {useNodeContent} from "./hooks";
const { moment } = Pydio.requireLib('boot');
const { useDataModelContextNodeAsItems } = Pydio.requireLib('components')

let MainPanel = ({dataModel, entryProps, muiTheme, style, contentMeta}) => {

    const {node} = useDataModelContextNodeAsItems(dataModel, (n) => {return []})
    const {content=[], loaded, save, dirty, setDirty} = useNodeContent(node, contentMeta)
    let body, saveBlock;

    if(node && node.isLoaded() && loaded) {
        const nodeUUID = node.getMetadata().get('uuid')
        const initialContent = content || []
        if(!initialContent.length) {
            let title = node.getLabel()
            if(node.getMetadata().has('ws_root')) {
                title = Pydio.getInstance().user.getActiveRepositoryObject().getLabel() || title
            }
            const date = moment(new Date(parseInt(node.getMetadata().get('ajxp_modiftime'))*1000)).fromNow()
            initialContent.push({
                    "type": "heading",
                    "props": {
                        "level": 2
                    },
                    "content": [
                        {
                            "type": "text",
                            "text": title,
                            "styles": {}
                        }
                    ]
                },
                {
                    "type": "paragraph",
                    "props": {
                        "textColor": "gray",
                    },
                    "content": [
                        {
                            "type": "text",
                            "text": "Created "+date,
                            "styles": {
                                "textColor": "gray"
                            }
                        }
                    ],
                },
                {"type":"paragraph", "content" : []}
            );
        }
        let found = false;
        initialContent.map(block => {
            if(block.type === 'childrenList') {
                block.props.dataModel = dataModel
                block.props.entryProps = entryProps
                found = true;
            }
        })
        if(!found) {
            initialContent.push({
                type: "childrenList",
                props:{dataModel, entryProps}
            })
        }

        const reloadIdentifier = nodeUUID + '#' + (loaded?'loaded':'loading')
        body = (
            <Pad
                readOnly={false}
                darkMode={muiTheme.darkMode}
                initialContent={initialContent}
                onChange={(blocks) => {
                    setDirty(true)
                    save(blocks)
                }}
                key={reloadIdentifier}
            />
        )

        if(dirty) {
            saveBlock = <div style={{
                position:'absolute', top: 35, right:50, opacity:0.5,
                fontStyle:'italic', fontSize: 14}}>Changes not saved...</div>
        }
    }

    return (
        <div style={{...style, position:'relative'}}>{body}{saveBlock}</div>
    )
}

MainPanel = muiThemeable()(PydioContextConsumer(MainPanel));
export default MainPanel