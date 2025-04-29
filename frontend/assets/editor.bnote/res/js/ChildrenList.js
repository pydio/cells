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

import React, {useState, createContext, useContext} from 'react'
import { createReactBlockSpec } from "@blocknote/react";
const {FilePreview} = Pydio.requireLib('workspaces');
const { useDataModelContextNodeAsItems, useDataModelSelection, sortNodesNatural } = Pydio.requireLib('components')
import ContextMenuModel from 'pydio/model/context-menu'
import Pydio from 'pydio'

export const ListContext = createContext({
    dataModel:Pydio.getInstance().getContextHolder(),
    entryProps:{handleClicks: () => {} }
})

const Item = ({dataModel, node}) => {

    const [hover, setHover] = useState(false);
    const selected = useDataModelSelection(dataModel, node)
    const {entryProps} = useContext(ListContext)
    const {handleClicks} = entryProps;

    let backgroundColor = hover?'var(--md-sys-color-outline-variant-50)':'inherit';
    if(selected){
        backgroundColor = 'var(--md-sys-color-primary)'
    }

    return (
        <p
            style={{display:'flex', paddingLeft: 0}}
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
            <div style={{
                flex: 1, display:'flex', alignItems:'flex-start',
                cursor:'pointer',
                backgroundColor,
                color:selected?'var(--md-sys-color-on-primary)':'inherit',
                borderRadius:6,
                margin: '1px 0',
                padding:'3px 8px 2px 1px',
                transition:'background-color 0.1s'
            }}>
                <div style={{marginRight: 5}} className={selected?"bn-selected":null}>
                    <FilePreview
                        node={node}
                        loadThumbnail={false}
                        style={{
                            height: 22, width:22, fontSize: 18,
                            borderRadius: 2, textAlign:'center',
                        }}
                        mimeFontStyle={{margin:'0 auto'}}
                    />
                </div>
                <div style={{flex: 1, fontSize: 'inherit'}}>{node.getLabel()}</div>
            </div>
        </p>
    )
};

const EmptyItem = () => {
    return <div style={{fontSize: 'inherit', padding: '3px 1px'}}>No pages or files</div>
}


const List = ({entryProps}) => {

    const {dataModel} = useContext(ListContext);

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
            <div className={"bn-children-list"}>{items}</div>
        </div>
    );
}

// Inline listing block.
export const ChildrenList = createReactBlockSpec(
    {
        type: "childrenList",
        propSchema: {},
        content: "none",
    },
    {
        render: (props) => {
            return <List/>
        },
    }
);
