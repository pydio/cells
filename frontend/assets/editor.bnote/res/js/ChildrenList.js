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

import React, {useState} from 'react'
import { createReactBlockSpec } from "@blocknote/react";
const {FilePreview} = Pydio.requireLib('workspaces');
const { useDataModelContextNodeAsItems, useDataModelSelection, sortNodesNatural } = Pydio.requireLib('components')
import ContextMenuModel from 'pydio/model/context-menu'
import Pydio from 'pydio'


const Item = ({dataModel, node, entryProps}) => {

    const [hover, setHover] = useState(false);
    const selected = useDataModelSelection(dataModel, node)
    const {handleClicks} = entryProps;

    return (
        <div
            style={{display:'flex', paddingLeft: 4}}
            onClick={(event) => handleClicks(node, node.isLeaf() ? "simple" : "double", event)}
            onDoubleClick={(event) => handleClicks(node, "double", event)}
            onMouseEnter={()=>setHover(true)}
            onMouseLeave={() => setHover(false)}
            onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                ContextMenuModel.getInstance().openNodeAtPosition(node, event.clientX, event.clientY)
            }}
        >
            <span className={"mdi mdi-subdirectory-arrow-right"}/>
            <div style={{
                flex: 1, display:'flex', alignItems:'center',
                margin:3,
                cursor:'pointer',
                border: ((hover || selected) && node.isLeaf())?'1px solid var(--md-sys-color-primary)':'1px solid transparent',
                backgroundColor:selected?'var(--md-sys-color-primary)':'inherit',
                color:selected?'var(--md-sys-color-on-primary)':'inherit',
                borderRadius:6, paddingRight:8
            }}>
                <div style={{marginRight: 2}}>
                    <FilePreview
                        node={node}
                        loadThumbnail={false}
                        style={{
                            height: 22, width:22, fontSize: 16,
                            borderRadius: 2, textAlign:'center',
                        }}
                        mimeFontStyle={{margin:'0 auto'}}
                    />
                </div>
                <div style={{flex: 1, fontSize: 14, fontWeight:600, textDecoration:(hover && !node.isLeaf())?'underline':'none'}}>{node.getLabel()}</div>
            </div>
        </div>
    )
};

const EmptyItem = () => {
    return <div style={{fontSize: 14, padding: '3px 20px'}}>No pages or files - Create one</div>
}


const List = ({dataModel, entryProps}) => {

    const {node, items} = useDataModelContextNodeAsItems(dataModel, (n) => {
        const nn = []
        n.getChildren().forEach(child => nn.push(child))
        nn.sort(sortNodesNatural)
        return nn.map(child => <Item dataModel={dataModel} node={child} entryProps={entryProps}/>);
    })
    if(!node) {
        return null;
    }
    if(!items.length) {
        items.push(<EmptyItem/>)
    }

    return (
        <div style={{lineHeight:'1.3em'}}>
            <h2 style={{fontWeight: 600}}><span className={"mdi mdi-folder-open-outline"} style={{marginRight: 3}}/>{node.getLabel()}</h2>
            <div className={"bn-children-list"}>{items}</div>
        </div>
    );
}

// Inline listing block.
export const ChildrenList = createReactBlockSpec(
    {
        type: "childrenList",
        propSchema: {
            dataModel:{default:null},
            entryProps:{default:null}
        },
        content: "none",
    },
    {
        render: (props) => {
            return <List dataModel={props.block.props.dataModel} entryProps={props.block.props.entryProps}/>
        },
    }
);
