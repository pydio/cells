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

import React, {useState, useEffect, useCallback, createContext, useContext} from 'react'
import { createReactBlockSpec } from "@blocknote/react";
const {FilePreview, useRichMetaLine, useRichMetaActions} = Pydio.requireLib('workspaces');
const {useColumnsFromRegistry} = Pydio.requireLib('hoc');
const {useSorting} = Pydio.requireLib('components');
import {MdOutlineViewCompact, MdOutlineViewList, MdGridView, MdOutlineViewQuilt, MdOutlineViewColumn, MdSort} from "react-icons/md";
import {Paper} from '@mantine/core'

const { ModernSimpleList } = Pydio.requireLib('components')
import Pydio from 'pydio'
import './ChildrenListStyles.less'
import {BlockMenu} from "./BlockMenu";
import {insertOrUpdateBlock} from "@blocknote/core";
import {RiFolderOpenFill} from "react-icons/ri";
import AjxpNode from 'pydio/model/node'
import DataModel from 'pydio/model/data-model'
import {useHover} from "../hooks";

export const ListContext = createContext({
    dataModel:Pydio.getInstance().getContextHolder(),
    entryProps:{handleClicks: () => {} }
})

const ModernList = ({editor, block}) => {

    const pydio = Pydio.getInstance()
    const {path, repositoryId} = block.props
    const {dataModel:ctxDataModel} = useContext(ListContext);
    let dataModel = ctxDataModel
    let initialNode = dataModel && dataModel.getContextNode()
    let error = false
    if (path) {
        const providerProps = {}
        if(repositoryId) {
            if (pydio.user.getRepositoriesList().get(repositoryId)){
                providerProps.tmp_repository_id = repositoryId
            } else {
                error = true
            }
        }
        dataModel = DataModel.RemoteDataModelFactory(providerProps);
        initialNode = dataModel.getRootNode()
    }
    const [contextNode, setContextNode] = useState(initialNode)

    useEffect(() => {
        const observer = () => setContextNode(dataModel.getContextNode())
        dataModel.observe('context_changed', observer)
        if(path) {
            dataModel.requireContextChange(new AjxpNode(path))
        }
        return () => {
            dataModel.stopObserving('context_changed', observer)
        }
    }, []);

    const {hover, hoverProps, hoverMoreStyle} = useHover()

    const {columns} = useColumnsFromRegistry({pydio})
    if(columns && columns['ajxp_label']) {
        columns['ajxp_label'].width = '30%';
    }

    const classes = ['modern-list', 'bn-children-list']
    const additionalAttrs = {}
    const {display} = block.props
    switch (display) {
        case 'compact':
            classes.push('compact-mode')
            break
        case 'list':
            classes.push('list-expanded-mode')
            break
        case 'grid':
            classes.push('material-list-grid')
            break
        case 'detail':
            classes.push('table-mode')
            additionalAttrs['data-content-type'] = 'table'
            break
        case 'masonry-160':
            classes.push('masonry-grid', 'masonry-size-160')
            break
        default:
            break
    }

    const {currentSortingInfo, handleSortChange} = useSorting({
        dataModel,
        node:contextNode,
        defaultSortingInfo:{sortType:'file-natural',attribute:'',direction:'asc'}
    })


    const displayMenuItems = [
        {value:'compact', title:'Compact', icon:MdOutlineViewCompact},
        {value:'list', title:'Details', icon:MdOutlineViewList},
        {value:'detail', title:'Table', icon:MdOutlineViewColumn},
        {value:'grid', title:'Grid', icon:MdGridView},
        {value:'masonry-160', title:'Waterfall', icon:MdOutlineViewQuilt}
    ]
    const displayMenuHandler = useCallback( (value) => {
        if(value !== block.props.display) {
            editor.updateBlock(block, {
                type: "childrenList",
                props: { display: value },
            })
        }
    }, [block, editor])

    const sortMenuItems = Object.keys(columns).filter(k => columns[k].sortType).map(k => {
        const col = columns[k]
        return {value:{...col, attribute:k}, title:col.label, icon:MdSort}
    })
    const sortMenuHandler = (value) => {
        handleSortChange(value)
    }

    const entryRenderIcon = useCallback((node) => {
        const lightBackground = display === 'grid' || display === 'masonry'
        const hasThumbnail = !!node.getMetadata().get("thumbnails") || !!node.getMetadata().get('ImagePreview');
        const processing = !!node.getMetadata().get('Processing');
        const uploading = node.getMetadata().get('local:UploadStatus') === 'loading'
        const uploadprogress = node.getMetadata().get('local:UploadProgress');
        return (
            <FilePreview
                loadThumbnail={hasThumbnail && !processing}
                node={node}
                processing={processing}
                lightBackground={lightBackground}
                displayLarge={lightBackground}
                mimeFontOverlay={display === 'list'}
                uploading={uploading}
                uploadprogress={uploadprogress}
            />
        );

    }, [display]);

    const entryRenderActions = useRichMetaActions({pydio,dataModel,displayMode:display})
    const entryRenderSecondLine = useRichMetaLine({pydio, columns})

    if(error) {
        return <div>Repository not found</div>
    }

    return (
        <Paper radius={'md'} withBorder={true} p={'md'} style={{lineHeight:'1.3em', width:'100%'}} {...hoverProps}>
            <div style={{display:'flex'}}>
                <h3 style={{flex: 1, fontSize:'1.1em', fontWeight:600, marginBottom: 10}}>
                    <span style={{marginRight:6}} className={'mdi mdi-folder-open-outline'}/>️
                    <span style={{marginRight:6, flex:1}}>{path || 'Current Folder Contents'}</span>
                </h3>
                <span style={{fontSize:'1rem'}}>
                    <BlockMenu
                        groups={[
                            {title:'Display', crtValue:display, values:displayMenuItems, onValueSelected:displayMenuHandler},
                            {title:'Sort By...', crtValue:currentSortingInfo, values:sortMenuItems, onValueSelected:sortMenuHandler}
                        ]}
                        target={<span style={{cursor:'pointer', ...hoverMoreStyle}} className={"mdi mdi-dots-vertical-circle-outline"}/>}
                        position={'bottom-end'}
                    />
                </span>
            </div>
            <ModernSimpleList
                pydio={pydio}
                node={contextNode}
                dataModel={dataModel}
                observeNodeReload={true}
                className={classes.join(' ')}
                //style={style}
                displayMode={display}
                usePlaceHolder={false}
                skipParentNavigation={true}

                tableKeys={columns}
                sortingInfo={currentSortingInfo}
                handleSortChange={handleSortChange}

                additionalAttrs={additionalAttrs}

                entryRenderIcon={entryRenderIcon}
                entryRenderParentIcon={entryRenderIcon}
                entryRenderFirstLine={(node)=> node.getLabel()}
                entryRenderSecondLine={display=== 'list' ? entryRenderSecondLine : null}
                entryRenderActions={display !== 'detail' && !path ? entryRenderActions : null}
                tableEntryRenderCell={(node) => (
                    <span>
                        {entryRenderIcon(node)}
                        {node.getLabel()}
                    </span>
                )}

            />
        </Paper>

    )

}

// Inline listing block.
export const ChildrenList = createReactBlockSpec(
    {
        type: "childrenList",
        propSchema: {
            display: {
                default:'compact',
                values:['compact', 'list', 'grid', 'detail', 'masonry-160']
            },
            path: {
                default: ''
            },
            repositoryId: {
                default: ''
            }
        },
        content: "none",
    },
    {
        render: (props) => {
            return <ModernList editor={props.editor} block={props.block}/>
        },
    }
);

// Custom Slash Menu item to insert a block after the current one.
export const insertChildrenList = (editor) => ({
    title: "Contents",
    onItemClick: () =>
        // If the block containing the text caret is empty, `insertOrUpdateBlock`
        // changes its type to the provided block. Otherwise, it inserts the new
        // block below and moves the text caret to it.
        insertOrUpdateBlock(editor, {
            type: "childrenList",
            props: {display:'compact'},
        }),
    aliases: ["contents", "co"],
    group: "Others",
    icon: <RiFolderOpenFill size={18} />,
    subtext: "Display current folder contents",
});
