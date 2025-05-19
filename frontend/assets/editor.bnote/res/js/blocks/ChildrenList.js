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
import { MdViewList, MdGridView } from "react-icons/md";

const { useDataModelContextNodeAsItems, useDataModelSelection, sortNodesNatural } = Pydio.requireLib('components')
import ContextMenuModel from 'pydio/model/context-menu'
import Pydio from 'pydio'
import './ChildrenListStyles.less'
import {BlockMenu} from "./BlockMenu";

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
            <div className={selected?'list-item bn-selected':'list-item'}>
                <FilePreview
                    node={node}
                    loadThumbnail={true}
                    mimeFontStyle={{margin:'0 auto'}}
                />
                <div className={'node-label'}>{node.getLabel()}</div>
            </div>
        </p>
    )
};

const EmptyItem = () => {
    return <div style={{fontSize: 'inherit', padding: '3px 1px'}}>No pages or files</div>
}


const List = ({entryProps, editor, block}) => {

    const {dataModel} = useContext(ListContext);

    const {node, items} = useDataModelContextNodeAsItems(dataModel, (n) => {
        const nn = []
        n.getChildren().forEach(child => nn.push(child))
        nn.sort(sortNodesNatural)
        return nn.map(child => <Item dataModel={dataModel} node={child} entryProps={entryProps}/>);
    })
    if(!node || !items.length) {
        return null;
    }
    if(!items.length) {
        items.push(<EmptyItem/>)
    }

    const menuItems = [
        {value:'list', title:'List', icon:MdViewList},
        {value:'grid', title:'Grid', icon:MdGridView}
    ]
    const displayMenuTarget = <span style={{cursor:'pointer'}} className={"mdi mdi-dots-vertical-circle-outline"}/>
    const menuHandler = (value) => {
        if(value !== block.props.display) {
            editor.updateBlock(block, {
                type: "childrenList",
                props: { display: value },
            })
        }
    }


    return (
        <div style={{lineHeight:'1.3em', width:'100%'}}>
            <div style={{display:'flex'}}>
                <h3 style={{flex: 1, fontSize:'1.3em', fontWeight:700, marginBottom: 10}}>
                    <span style={{marginRight:6}}>🗂️</span>
                    <span style={{marginRight:6, flex:1}}>Folder Contents</span>
                </h3>
                <span style={{fontSize:'1rem'}}>
                    <BlockMenu
                        title={"Display"}
                        target={displayMenuTarget}
                        values={menuItems}
                        onValueSelected={menuHandler}
                        position={'bottom-end'}
                    />
                </span>
            </div>
            <div className={"bn-children-list " + block.props.display}>
                {items}
            </div>
        </div>
    );
}

// Inline listing block.
export const ChildrenList = createReactBlockSpec(
    {
        type: "childrenList",
        propSchema: {
            display: {
                default:'list',
                values:['list', 'grid']
            }
        },
        content: "none",
    },
    {
        render: (props) => {
            return <List editor={props.editor} block={props.block}/>
        },
    }
);
