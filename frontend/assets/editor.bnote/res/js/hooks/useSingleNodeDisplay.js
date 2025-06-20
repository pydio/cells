/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
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

import {useCallback, useMemo} from 'react'
import {useBlockNoteEditor} from "@blocknote/react";
import {
    MdFullscreen, MdGridView,
    MdList,
    MdOutlineViewColumn,
    MdOutlineViewCompact,
    MdOutlineViewList, MdOutlineViewQuilt,
    MdPreview,
    MdShortText
} from "react-icons/md";
import uuid4 from "uuid4";
import {ChildrenListSpecType, NodeBlockSpecType, NodeRefSpecType} from "../specs/NodeRef";
export const useSingleNodeDisplay = ({node, crtValue, skipInline = false, isBlockFolder = false, blockOrInlineProps}) => {

    const editor = useBlockNoteEditor();

    const menuHandler = useCallback((value) => {
        if(value === crtValue) {
            return
        }
        const {block, inlineContent, updateInlineContent, nodeUuid, path, repositoryId, blockSize, inlineId} = blockOrInlineProps;
         if(value === 'inline') {
             const {display, ...otherProps} = block.props
             if(!otherProps.inlineId) {
                 otherProps.inlineId = uuid4()
             }
            editor.removeBlocks([block])
            editor.insertInlineContent([{type: NodeRefSpecType, props: {...otherProps}}], {updateSelection: true});
        } else if(blockSize) { // We already have a block size, it's a size toggle
            const newBlockSize = value === 'full' ? 'lg' : 'md'
            editor.updateBlock(block, {
                type: NodeBlockSpecType,
                props: {...block.props, blockSize: newBlockSize}
            })
        } else if(isBlockFolder) { // it's a display toggle
            editor.updateBlock(block, {
                type: ChildrenListSpecType,
                props: {...block.props, display: value}
            })
        } else if(inlineId) {
            let zeBlock, zeBlockUnique;
            editor.forEachBlock((block) => {
                if(!block.content || !block.content.forEach) {
                    return
                }
                block.content.forEach((content) => {
                    if(content.type === NodeRefSpecType && content.props.inlineId === inlineId){
                        zeBlock = block
                        zeBlockUnique = block.content.length === 1
                    }
                });
            })
            if(zeBlock && node) {
                if(node.isLeaf()){
                    const newBlockSize = value === 'full' ? 'lg' : 'md'
                    editor.insertBlocks([{
                        type: NodeBlockSpecType,
                        props: {...inlineContent.props, blockSize: newBlockSize},
                    }], zeBlock, 'after')
                } else {
                    editor.insertBlocks([{
                        type: ChildrenListSpecType,
                        props: {nodeUuid, path, repositoryId}
                    }], zeBlock, 'after')
                }
                if(zeBlockUnique) {
                    editor.removeBlocks([zeBlock])
                } else {
                    updateInlineContent('')
                }
            }
        }

    }, [editor, blockOrInlineProps, node, crtValue])


    const displayMenuItems = useMemo(() =>  {

        const isInline = crtValue === 'inline'
        const isFolder = node && !node.isLeaf()

        const inlineItem = {value:'inline', title:'Inline', icon:MdShortText}
        const blockItem = {value:'block', title:!isFolder?'Preview':'Contents', icon:!isFolder?MdPreview:MdList}
        const fullSizeItem = {value: 'full', title: 'Full Page', icon: MdFullscreen}

        if (isFolder) {
            if(isInline) {
                return [inlineItem, blockItem]
            } else {
                const listDisplay = [
                    {value:'compact', title:'Compact', icon:MdOutlineViewCompact},
                    {value:'list', title:'Details', icon:MdOutlineViewList},
                    {value:'detail', title:'Table', icon:MdOutlineViewColumn},
                    {value:'grid', title:'Grid', icon:MdGridView},
                    {value:'masonry-160', title:'Waterfall', icon:MdOutlineViewQuilt}
                ]
                if (skipInline) {
                    return listDisplay
                } else {
                    return [inlineItem, ...listDisplay]
                }
            }
        } else {
            return [inlineItem, blockItem, fullSizeItem]
        }

    }, [node])

    return {
        title:'Display',
        values: displayMenuItems,
        onValueSelected: menuHandler,
        crtValue: crtValue
    }

}