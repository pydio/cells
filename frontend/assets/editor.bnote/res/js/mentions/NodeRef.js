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

import {useEffect, useContext, useState, useCallback} from 'react'
import {createReactInlineContentSpec, SuggestionMenuController} from "@blocknote/react";
import { HoverCard } from '@mantine/core';
import SearchApi from 'pydio/http/search-api';
import AjxpNode from 'pydio/model/node';
import Pydio from 'pydio'
import {ListContext} from "../blocks/ChildrenList";
import PathUtils from 'pydio/util/path'
import LangUtils from 'pydio/util/lang'

const {FilePreview} = Pydio.requireLib('workspaces');

const api = new SearchApi(Pydio.getInstance())

export const NodeRef = createReactInlineContentSpec(
    {
        type: "nodeRef",
        propSchema: {
            path: { default: "" },
            label: { default: "" },
            repositoryId: { default: "" },
        },
        content: "none",
    },
    {
        render: (props) => {
            const {path, repositoryId} = props.inlineContent.props;
            const {dataModel} = useContext(ListContext);
            const [node, setNode] = useState(null)
            const [error, setError] = useState(null)
            const [open, setOpen] = useState(null)
            const [selection, setSelection] = useState([])

            useEffect(()=>{
                const node = new AjxpNode(path)
                node.getMetadata().set('repository_id', repositoryId)
                dataModel.getAjxpNodeProvider().loadLeafNodeSync(node, (n)=>{
                    n.getMetadata().set('repository_id', repositoryId)
                    n.setParent(new AjxpNode()) // Add a fake parent to avoid errors when opening editors
                    setNode(n)
                }, true, {}, (e)=>{setError(e || {message:'not found'})})
            }, [])

            useEffect(() => {
                if(!dataModel) {
                    return;
                }
                // Observe DM
                const observer = () => {
                    setSelection(dataModel.getSelectedNodes() || [])
                }
                dataModel.observe('selection_changed', observer)
                return () => {
                    dataModel.stopObserving('selection_changed', observer)
                }
            }, [dataModel]);


            const openFolder = useCallback(() => {
                if(!node){
                    return
                }
                Pydio.getInstance().goTo(node)
            }, [node])
            const openFile = useCallback(() => {
                if(!node){
                    return
                }
                Pydio.getInstance().UI.openCurrentSelectionInEditor(null, node);
            }, [node, dataModel])
            const selectOnHover = useCallback(() => {
                setOpen(true);
            }, [node, dataModel])
            const selectNode = useCallback(() => {
                if(!node) {
                    return
                }
                dataModel.setSelectedNodes([node]);
            }, [node, dataModel])
            const isCurrentFolder = useCallback(() => {
                const contextRepo = Pydio.getInstance().user.activeRepository;
                const nodeRepo = node.getMetadata().get('repository')
                if(nodeRepo && nodeRepo !== contextRepo) {
                    return false
                }
                const contextNodePath = dataModel.getContextNode().getPath()
                let targetPath = node.getPath()
                if(node.isLeaf()) {
                    targetPath = PathUtils.getDirname(targetPath)
                }
                return LangUtils.trim(contextNodePath, '/') === LangUtils.trim(targetPath, '/')
            }, [node, dataModel])

            const buttonStyle = {
                borderRadius:20,
                color:'var(--md-sys-color-primary)',
                border:'1px solid var(--md-sys-color-primary)',
                padding: '0 8px',
                marginLeft: 4,
                fontWeight:500,
                cursor: 'pointer',
            }
            const previewStyle = {width: 24, height: 24,display: 'flex', alignItems:'center', justifyContent:'center', fontSize: 16}
            let backgroundColor, color
            if(node && selection.indexOf(node) > -1) {
                backgroundColor = 'var(--md-sys-color-secondary)'
                color = 'var(--md-sys-color-on-secondary)'
            } else if(open) {
                backgroundColor = 'var(--md-sys-color-mimefont-background)'
            }

            return (
                <HoverCard  openDelay={200} closeDelay={400} position={'bottom-start'} onOpen={selectOnHover} onClose={()=>setOpen(false)}>
                    <HoverCard.Target>
                        <span
                            onClick={selectNode}
                            onContextMenu={(e) => {e.stopPropagation();e.preventDefault()}}
                            style={{
                                display:'inline-flex',
                                alignItems:'center',
                                color,
                                backgroundColor,
                                border: "1px solid var(--md-sys-color-mimefont-background)",
                                fontSize:15,
                                borderRadius: 5,
                                cursor: 'pointer'
                        }}
                        >
                            {node&& <FilePreview
                                node={node}
                                style={previewStyle}
                                loadThumbnail={false}
                                richPreview={false}
                            />}
                            {error &&
                                <>
                                    <span style={{...previewStyle, backgroundColor:'var(--alert-error-bg)'}} className={'mdi mdi-alert-outline'}/>
                                    <span style={{flex: 1, padding: '0 8px'}}>{open?'Original path: ' + path:'File not found'}</span>
                                </>
                            }
                            {!error &&
                                <span style={{flex: 1, padding: '0 8px'}}>{PathUtils.getBasename(path)}</span>
                            }
                        </span>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                        {node &&
                            <div style={{
                                borderRadius:8,
                                border: "1px solid var(--md-sys-color-mimefont-background)",
                                overflow:'hidden',
                                backgroundColor:'var(--md-sys-color-surface)',
                                color:'var(--md-sys-color-on-surface)',
                                boxShadow:'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px'
                            }}>
                                <FilePreview
                                    node={node}
                                    style={{width: 220, height: 170,display: 'flex', alignItems:'center', justifyContent:'center', fontSize: 40}}
                                    loadThumbnail={true}
                                    richPreview={false}
                                    processing={false}
                                    lightBackground={true}
                                    displayLarge={true}
                                    mimeFontOverlay={false}
                                />
                                <div style={{display:'flex', justifyContent:'end', padding: 8}}>
                                    {node.isLeaf() && <div style={buttonStyle} onClick={openFile}>Preview</div>}
                                    {node.isLeaf() && !isCurrentFolder() && <div style={buttonStyle} onClick={openFolder}>Open in parent</div>}
                                    {!node.isLeaf() && !isCurrentFolder() &&
                                        <div style={buttonStyle} onClick={openFolder}>Open Folder</div>
                                    }
                                </div>
                            </div>
                        }
                    </HoverCard.Dropdown>
                </HoverCard>
            )
        },
    }
);

export const getNodesMenuItems = (editor, query) => {
    return api.search({basename:query}, 'all', 10, true, 'mtime', true).then(res => {
        const {Results} = res;
        return Results.map(node => {
            const label = node.getLabel()
            return     {
                title: <span>{node.getMetadata().get('repository_display')} - {node.getPath()}</span>,
                onItemClick: () => {
                    editor.insertInlineContent([
                        { type: "nodeRef", props: { label, path: node.getPath(), repositoryId:node.getMetadata().get('repository_id') } },
                        " ", // add a space after the mention
                    ]);
                }
            }

        })
    })
}

export const NodesSuggestionMenu = ({editor}) => <SuggestionMenuController
    triggerCharacter={"%"}
    getItems={(query) => getNodesMenuItems(editor, query)}
    minQueryLength={0}
/>
