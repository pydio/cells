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
            editor.insertInlineContent([{type: "nodeRef", props: {...otherProps}}], {updateSelection: true});
        } else if(blockSize) { // We already have a block size, it's a size toggle
            const newBlockSize = value === 'full' ? 'lg' : 'md'
            editor.updateBlock(block, {
                type: 'nodeBlock',
                props: {...block.props, blockSize: newBlockSize}
            })
        } else if(isBlockFolder) { // it's a display toggle
            editor.updateBlock(block, {
                type: 'childrenList',
                props: {...block.props, display: value}
            })
        } else if(inlineId) {
            let zeBlock, zeBlockUnique;
            editor.forEachBlock((block) => {
                if(!block.content || !block.content.forEach) {
                    return
                }
                block.content.forEach((content) => {
                    if(content.type === "nodeRef" && content.props.inlineId === inlineId){
                        zeBlock = block
                        zeBlockUnique = block.content.length === 1
                    }
                });
            })
            if(zeBlock && node) {
                if(node.isLeaf()){
                    const newBlockSize = value === 'full' ? 'lg' : 'md'
                    editor.insertBlocks([{
                        type: "nodeBlock",
                        props: {...inlineContent.props, blockSize: newBlockSize},
                    }], zeBlock, 'after')
                } else {
                    editor.insertBlocks([{
                        type: 'childrenList',
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