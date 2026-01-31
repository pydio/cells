import React, {useCallback, useMemo} from 'react'
import {MdSort} from "react-icons/md";
import {Paper, MantineProvider} from '@mantine/core'
import Pydio from 'pydio'
import {BlockMenu} from "./BlockMenu";
import {useHover} from "../hooks/useHover";
import {useSingleNodeActions} from "../hooks/useSingleNodeActions";
import {useSingleNodeDisplay} from "../hooks/useSingleNodeDisplay";
import { muiThemeable } from 'material-ui/styles'

import './styles/ChildrenListStyles.less'

const {FilePreview, useRichMetaLine, useRichMetaActions} = Pydio.requireLib('workspaces');
const {useColumnsFromRegistry} = Pydio.requireLib('hoc');
const {useSorting} = Pydio.requireLib('components');

const { ModernSimpleList } = Pydio.requireLib('components')


export const FilesList = muiThemeable()(({pydio, dataModel, contextNode, nodePath, resolvedNode, resolveError, isResultsList=false, presetNodeActions, muiTheme, block}) => {

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
        skipInline:!resolvedNode || isResultsList,
        crtValue:block.props.display,
        isResultsList:isResultsList,
        blockOrInlineProps:{...block.props, block},
    })

    const actions = useSingleNodeActions({node: resolvedNode, presetNodeActions})
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

    if(resolveError) {
        return <div>Repository not found</div>
    }

    return (
        <MantineProvider theme={{ colorScheme: muiTheme.darkMode? "dark":'light'}} inherit>
            <Paper className={"small-outline"} radius={'md'} withBorder={true} p={'md'} style={{lineHeight:'1.3em', width:'100%'}} {...hoverProps}>
                <div style={{display:'flex'}}>
                    <h3 style={{flex: 1, fontSize:'1.1em', fontWeight:600, marginBottom: 10}}>
                        <span style={{marginRight:6}} className={'mdi mdi-folder-open-outline'}/>️
                        <span style={{marginRight:6, flex:1}}>
                            {resolvedNode && resolvedNode.getLabel() || nodePath || 'Table of Contents'}
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
                {resolveError && <div>{nodePath && 'Cannot load ' + nodePath + ': '}{resolveError.message}</div>}
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
                        entryRenderActions={display !== 'detail' && !nodePath ? entryRenderActions : null}
                        tableEntryRenderCell={(node) => (
                            <span>
                            {entryRenderIcon(node)}
                                {node.getLabel()}
                        </span>
                        )}
                    />
                }
            </Paper>
        </MantineProvider>
    )


})