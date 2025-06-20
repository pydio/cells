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

import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {MdSort} from "react-icons/md";
import {Paper} from '@mantine/core'
import Pydio from 'pydio'
import {BlockMenu} from "./BlockMenu";
import DataModel from 'pydio/model/data-model'
import {useHover} from "../hooks";
import {useResolveSingleNode} from "../hooks/useLoadSingleNode";
import {useSingleNodeActions} from "../hooks/useSingleNodeActions";
import {useSingleNodeDisplay} from "../hooks/useSingleNodeDisplay";
import {PydioContext} from "../hooks/context";

import './styles/ChildrenListStyles.less'

const {FilePreview, useRichMetaLine, useRichMetaActions} = Pydio.requireLib('workspaces');
const {useColumnsFromRegistry} = Pydio.requireLib('hoc');
const {useSorting} = Pydio.requireLib('components');

const { ModernSimpleList } = Pydio.requireLib('components')

export const ModernList = ({editor, block}) => {

    const pydio = Pydio.getInstance()
    const {nodeUuid, path} = block.props
    const {dataModel:ctxDataModel} = useContext(PydioContext);
    const [dataModel, setDataModel] = useState(ctxDataModel)
    const [contextNode, setContextNode] = useState(!nodeUuid && ctxDataModel.getContextNode())
    const [resolvedNode, setResolvedNode] = useState(null)
    const [error, setError] = useState(null)

    // Resolve uuidNode if set, otherwise will fallback to current context node
    const setNode = useCallback((rootNode)=>{
        const providerProps = {}
        if(rootNode.getMetadata().has('repository_id')) {
            providerProps.tmp_repository_id = rootNode.getMetadata().get('repository_id')
        }
        const dm = DataModel.RemoteDataModelFactory(providerProps);
        setDataModel(dm);
        setContextNode(dm.getRootNode())
        setResolvedNode(rootNode);
    }, [nodeUuid])
    useResolveSingleNode({nodeUuid, setNode, setError})

    // Handle contextNode
    useEffect(() => {
        if(!dataModel){
            return
        }
        const observer = () => setContextNode(dataModel.getContextNode())
        dataModel.observe('context_changed', observer)
        if(resolvedNode) {
            dataModel.requireContextChange(resolvedNode)
        }
        return () => {
            dataModel.stopObserving('context_changed', observer)
        }
    }, [dataModel, resolvedNode]);

    // Bind local dataModel selection to global datamodel in both ways
    useEffect(() => {
        if(!dataModel || dataModel === ctxDataModel) {
            return
        }
        const observerUp = () => {
            const nodes = dataModel.getSelectedNodes()
            if(nodes && nodes.length) {
                ctxDataModel.setSelectedNodes(dataModel.getSelectedNodes(), dataModel)
            }
        }
        const observerDown = () => {
            if(ctxDataModel.getSelectionSource() !== dataModel){
                console.log('clearing local DM')
                dataModel.setSelectedNodes([])
            }
        }
        dataModel.observe('selection_changed', observerUp)
        ctxDataModel.observe('selection_changed', observerDown)
        return () => {
            dataModel.stopObserving('selection_changed', observerUp)
            ctxDataModel.stopObserving('selection_changed', observerDown)
        }
        // Map selection to global DM
    }, [dataModel]);

    const {hoverProps, hoverMoreStyle} = useHover()

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

    // BUILD MENUS
    const sortMenuGroup = useMemo(() => {

        const sortMenuItems = Object.keys(columns).filter(k => columns[k].sortType).map(k => {
            const col = columns[k]
            return {value:{...col, attribute:k}, title:col.label, icon:MdSort}
        })

        return {
            title: 'Sort By...',
            values: sortMenuItems,
            crtValue: currentSortingInfo,
            onValueSelected: handleSortChange
        }

    }, [columns, handleSortChange, currentSortingInfo])

    const displayMenuGroup = useSingleNodeDisplay({
        node:contextNode,
        isBlockFolder:true,
        skipInline:!resolvedNode,
        crtValue:block.props.display,
        blockOrInlineProps:{...block.props, block},
    })

    const actions = useSingleNodeActions({node: resolvedNode})
    const menuGroups = resolvedNode?[actions, displayMenuGroup, sortMenuGroup]:[displayMenuGroup, sortMenuGroup]


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
        <Paper className={"disable-outline"} radius={'md'} withBorder={true} p={'md'} style={{lineHeight:'1.3em', width:'100%'}} {...hoverProps}>
            <div style={{display:'flex'}}>
                <h3 style={{flex: 1, fontSize:'1.1em', fontWeight:600, marginBottom: 10}}>
                    <span style={{marginRight:6}} className={'mdi mdi-folder-open-outline'}/>️
                    <span style={{marginRight:6, flex:1}}>
                        {resolvedNode && resolvedNode.getLabel() || path || 'Table of Contents'}
                        <span
                            className={'mdi mdi-reload'}
                            style={{marginLeft:6, fontSize: 12, cursor:'pointer', ...hoverMoreStyle}}
                            onClick={()=>{dataModel.requireContextChange(contextNode, true)}}
                        />
                    </span>
                </h3>
                <span style={{fontSize:'1rem'}}>
                    <BlockMenu groups={menuGroups} settingsStyle={{...hoverMoreStyle}}/>
                </span>
            </div>
            {error && <div>{path && 'Cannot load ' + path + ': '}{error.message}</div>}
            {contextNode &&
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
            }
        </Paper>

    )

}