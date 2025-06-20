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

import {useContext, useState, useEffect, useCallback, useMemo} from 'react'
import Pydio from 'pydio'
import {PydioContext} from "../hooks/context";
import {HoverCard, Paper} from "@mantine/core";
const {FilePreview} = Pydio.requireLib('workspaces');
import PathUtils from 'pydio/util/path'
import LangUtils from 'pydio/util/lang'
import {BlockMenu} from "./BlockMenu";
import {useLoadSingleNode} from "../hooks/useLoadSingleNode";
import {useSingleNodeActions} from "../hooks/useSingleNodeActions";
import {useSingleNodeDisplay} from "../hooks/useSingleNodeDisplay";


const Preview = ({node, rich, border, filePreviewStyle, onUpdateRatio, menuGroups = []}) => {
    if(!node) {
        return null
    }
    return (
        <div style={{
            borderRadius:8,
            border: border ? "1px solid var(--md-sys-color-mimefont-background)" : '',
            overflow:'hidden',
            backgroundColor:'var(--md-sys-color-surface)',
            color:'var(--md-sys-color-on-surface)',
            boxShadow:!rich && 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px'
        }}>
            <FilePreview
                node={node}
                style={{width: 220, height: 170,display: 'flex', alignItems:'center', justifyContent:'center', fontSize: 40, ...filePreviewStyle}}
                loadThumbnail={true}
                richPreview={rich}
                processing={false}
                lightBackground={true}
                displayLarge={true}
                mimeFontOverlay={false}
                onUpdateRatio={onUpdateRatio}
            />
            {rich &&
                <div style={{display:'flex', justifyContent:'end', padding: 8, fontSize:13, borderTop:'1px solid var(--md-sys-color-mimefont-background)'}}>
                    <div style={{flex: 1, fontWeight:600}}>{node.getLabel()}</div>
                    {menuGroups &&
                        <BlockMenu groups={menuGroups}/>
                    }
                </div>
            }
        </div>
    )
}

const SingleNode = (props) => {
    const {inline, nodeUuid, path, inlineId, blockSize} = props
    const {dataModel} = useContext(PydioContext);
    const [node, setNode] = useState(null)
    const [error, setError] = useState(null)
    const [open, setOpen] = useState(null)
    const [selection, setSelection] = useState([])
    const [ratio, setRatio] = useState(-1)

    useLoadSingleNode({dataModel, nodeUuid, setNode, setError})

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

    const selectOnHover = useCallback(() => {
        setOpen(true);
    }, [node, dataModel])
    const selectNode = useCallback(() => {
        if(!node) {
            return
        }
        dataModel.setSelectedNodes([node]);
    }, [node, dataModel])

    const isCurrentFolder = useMemo(() => {
        if(!node) {
            return false
        }
        const contextRepo = Pydio.getInstance().user.activeRepository;
        const nodeRepo = node.getMetadata().get('repository_id')
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


    const previewStyle = {width: 24, height: 24,display: 'flex', alignItems:'center', justifyContent:'center', fontSize: 16}
    let backgroundColor, color
    if(node && selection.indexOf(node) > -1) {
        backgroundColor = 'var(--md-sys-color-secondary)'
        color = 'var(--md-sys-color-on-secondary)'
    } else if(open) {
        backgroundColor = 'var(--md-sys-color-mimefont-background)'
    }

    const actions = useSingleNodeActions({node, isCurrentFolder})
    const crtValue = inline ? 'inline': (blockSize === 'lg' ? 'full' : 'block')
    const displayMenu = useSingleNodeDisplay({node, crtValue, blockOrInlineProps:props})

    if (!inline) {

        const width = blockSize === 'lg'?'100%':320
        return (
            <Paper shadow={'xs'} radius={'md'} withBorder={true} onClick={selectNode} style={{position:'relative', width}} className={"disable-outline"}>
                <Preview
                    node={node}
                    rich={true}
                    filePreviewStyle={{width, height: 'auto', minHeight: 260}}
                    onUpdateRatio={(r) => setRatio(r)}
                    menuGroups={[actions, displayMenu]}
                />
            </Paper>
        )
    }

    const inlineLabel = (
        <span style={{display:'inline-flex'}}>
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
                <span style={{flex: 1, padding: '0 8px'}}>{node ? node.getLabel() : PathUtils.getBasename(path)}</span>
            }
        </span>
    )

    return (
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
            {node && !node.isLeaf() && inlineLabel /* folder: just display label */}
            {node && node.isLeaf() &&
                /* file: display hoverCard */
                <HoverCard openDelay={450} closeDelay={100} position={'bottom-start'} onOpen={selectOnHover} onClose={()=>setOpen(false)}>
                    <HoverCard.Target>{inlineLabel}</HoverCard.Target>
                    <HoverCard.Dropdown><Preview border={true} node={node} rich={false}/></HoverCard.Dropdown>
                </HoverCard>
            }
            <BlockMenu groups={[actions,displayMenu]} settingsStyle={{marginRight:8}}/>
        </span>
    )
}

export {SingleNode}