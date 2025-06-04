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
import {MdOutlineViewCompact, MdOutlineViewList, MdGridView, MdOutlineViewQuilt, MdOutlineViewColumn, MdGridGoldenratio, MdSort} from "react-icons/md";

const { ModernSimpleList } = Pydio.requireLib('components')
import Pydio from 'pydio'
import './ChildrenListStyles.less'
import {BlockMenu} from "./BlockMenu";

export const ListContext = createContext({
    dataModel:Pydio.getInstance().getContextHolder(),
    entryProps:{handleClicks: () => {} }
})

const ModernList = ({entryProps, editor, block}) => {

    const pydio = Pydio.getInstance()

    const {dataModel} = useContext(ListContext);
    const [contextNode, setContextNode] = useState(dataModel && dataModel.getContextNode())
    useEffect(() => {
        const observer = () => setContextNode(dataModel.getContextNode())
        dataModel.observe('context_changed', observer)
        return () => {
            dataModel.stopObserving('context_changed', observer)
        }
    }, [dataModel]);

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
    const displayMenuHandler = (value) => {
        if(value !== block.props.display) {
            editor.updateBlock(block, {
                type: "childrenList",
                props: { display: value },
            })
        }
    }

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


    return (
        <div style={{lineHeight:'1.3em', width:'100%'}}>
            <div style={{display:'flex'}}>
                <h3 style={{flex: 1, fontSize:'1.3em', fontWeight:700, marginBottom: 10}}>
                    <span style={{marginRight:6}}>🗂️</span>
                    <span style={{marginRight:6, flex:1}}>Folder Contents</span>
                </h3>
                <span style={{fontSize:'1rem'}}>
                    <BlockMenu
                        groups={[
                            {title:'Display', crtValue:display, values:displayMenuItems, onValueSelected:displayMenuHandler},
                            {title:'Sort By...', crtValue:currentSortingInfo, values:sortMenuItems, onValueSelected:sortMenuHandler}
                        ]}
                        target={<span style={{cursor:'pointer'}} className={"mdi mdi-dots-vertical-circle-outline"}/>}
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
                entryRenderActions={display !== 'detail' ? entryRenderActions : null}
                tableEntryRenderCell={(node) => (
                    <span>
                        {entryRenderIcon(node)}
                        {node.getLabel()}
                    </span>
                )}

            />
        </div>

    )

}

// Inline listing block.
export const ChildrenList = createReactBlockSpec(
    {
        type: "childrenList",
        propSchema: {
            display: {
                default:'list',
                values:['list', 'grid', 'detail', 'masonry-160']
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
