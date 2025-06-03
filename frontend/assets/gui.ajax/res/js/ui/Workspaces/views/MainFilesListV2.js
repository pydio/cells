/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {useState, useCallback, useEffect} from 'react';

import Pydio from 'pydio'
import ResourcesManager from 'pydio/http/resources-manager'

import FilePreview from './FilePreview'
import CellsMessageToolbar from './CellsMessageToolbar'
const {ModernSimpleList, useSorting} = Pydio.requireLib('components');
const {usePydioActions, useColumnsFromRegistry} =  Pydio.requireLib('hoc');
import {muiThemeable} from 'material-ui/styles'
import {useActionDisplayMode} from "./useActionDisplayMode";
import {useActionExtensionsPin} from "./useActionExtensionsPin";
import {useActionSortingColumns} from "./useActionSortingColumns";
import {useEmptyErrorStatesProps} from "./useEmptyErrorStatesProps";
import {useRichMetaActions} from "./useRichMetaActions";
import {useRichMetaLine} from "./useRichMetaLine";


let MainFilesListV2 = (props) => {
    const {
        pydio,
        fixedDisplayMode,
        onDisplayModeChange,
        fixedColumns,
        dataModel,
        horizontalRibbon,
        style,
        onScroll,
        searchResults,
        searchScope,
        searchLoading,
        searchEmpty,
        onSortingInfoChange,
        parentIsScrolling
    } = props;
    /*
    static propTypes = {
        pydio: PropTypes.instanceOf(Pydio),
        horizontalRibbon: PropTypes.bool,
        fixedDisplayMode: PropTypes.string,
        fixedColumns: PropTypes.object,
    };

     */
    const {displayMode, buildAction:buildDisplayModeAction} = useActionDisplayMode({fixedDisplayMode})
    const {showExtensions, pinBookmarks, buildAction:buildExtPinAction, computeLabel} = useActionExtensionsPin({})
    const {columns} = useColumnsFromRegistry({pydio, fixedColumns})
    const [contextNode, setContextNode] = useState(dataModel.getContextNode())

    const [BlockNote, setBlockNote] = useState()
    useEffect(() => {
        if(pydio.Registry.findEditorById('editor.bnote') && pydio.getPluginConfigs('editor.bnote').get('BNOTE_PAGES_META')){
            ResourcesManager.loadClass('BlockNote').then((lib) => setBlockNote(lib))
        }
    }, []);

    let sortingInfoChange
    if(onSortingInfoChange) {
        sortingInfoChange = (si) => {
            if(!si) {
                return
            }
            let label;
            if(si.attribute && !si.label) {
                if (columns[si.attribute]) {
                    label = columns[si.attribute].label
                } else if (si.remote) {
                    const ff = Object.keys(columns).map(c => columns[c]).filter(c => c.remoteSortAttribute === si.attribute)
                    if (ff.length) {
                        label = ff[0].label
                    }
                }
                si.toggle = (close)  => {
                    if(close) {
                        handleSortChange(si, {clearOnly: true})
                    } else {
                        handleSortChange(si, {toggleOnly: true})
                    }
                }
            }
            onSortingInfoChange({...si, label})
        }
    }

    const {currentSortingInfo, handleSortChange} = useSorting({
        dataModel,
        node:contextNode,
        defaultSortingInfo:{sortType:'file-natural',attribute:'',direction:'asc'},
        onSortingInfoChanged:sortingInfoChange
    })

    const {buildAction: buildSortingColumnsAction} = useActionSortingColumns({columns, sortingInfo:currentSortingInfo, handleSortChange})

    useEffect(() => {
        if(onDisplayModeChange) {
            onDisplayModeChange(displayMode)
        }
    }, [displayMode]);

    useEffect(() => {
        pydio.notify('actions_refreshed')
    }, [displayMode, showExtensions, pinBookmarks]);

    useEffect(() => {
        const observer = () => setContextNode(dataModel.getContextNode())
        dataModel.observe('context_changed', observer)
        return () => {
            dataModel.stopObserving('context_changed', observer)
        }
    }, [dataModel]);

    const getPydioActions = useCallback((keysOnly = false)=>{
        if(keysOnly){
            if(fixedDisplayMode) {
                return ['toggle_show_extensions'];
            }
            return ['switch_display_mode', 'toggle_show_extensions', 'sorting_columns'];
        }
        const actions = new Map();
        if(!fixedDisplayMode) {
            const multiAction = buildDisplayModeAction();
            actions.set('switch_display_mode', multiAction);
        }
        const extAction = buildExtPinAction();
        actions.set('toggle_show_extensions', extAction);
        const colAction = buildSortingColumnsAction()
        actions.set('sorting_columns', colAction)

        return actions;

    }, [fixedDisplayMode, displayMode, buildDisplayModeAction, buildExtPinAction, buildSortingColumnsAction]);
    usePydioActions({pydio, loader: getPydioActions})

    const tableEntryRenderCell = useCallback((node) => {
        return (
            <span>
                <FilePreview rounded={true} loadThumbnail={false} node={node} style={{backgroundColor:'transparent'}}/>
                <span style={{display:'block',overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}} title={node.getLabel()}>{computeLabel(node)}</span>
            </span>
        );
    }, [computeLabel])

    const entryRenderIcon = useCallback((node, entryProps = {}) => {
        const lightBackground = displayMode.indexOf('grid') === 0 || displayMode === 'masonry'
        if(entryProps && entryProps.parent){
            return (
                <FilePreview
                    loadThumbnail={false}
                    node={node}
                    mimeClassName="mimefont mdi mdi-chevron-left"
                    style={{cursor:'pointer'}}
                    lightBackground={lightBackground}
                />
            );
        }else{
            const hasThumbnail = !!node.getMetadata().get("thumbnails") || !!node.getMetadata().get('ImagePreview');
            const processing = !!node.getMetadata().get('Processing');
            const uploading = node.getMetadata().get('local:UploadStatus') === 'loading'
            const uploadprogress = node.getMetadata().get('local:UploadProgress');
            return (
                <FilePreview
                    loadThumbnail={!entryProps['parentIsScrolling'] && hasThumbnail && !processing}
                    node={node}
                    processing={processing}
                    lightBackground={lightBackground}
                    displayLarge={lightBackground}
                    mimeFontOverlay={displayMode === 'list'}
                    uploading={uploading}
                    uploadprogress={uploadprogress}
                />
            );
        }
    }, [displayMode])

    const entryRenderActions = useRichMetaActions({pydio,dataModel,displayMode,customRenderProps:{},searchResults})

    const entryRenderSecondLine = useRichMetaLine({pydio, columns, searchResults, searchScope});

    let {errorStateProps, emptyStateProps} = useEmptyErrorStatesProps({pydio, dataModel, contextNode})
    if(searchResults) {
        emptyStateProps = {
            primaryTextId:searchEmpty?'searchengine.start':(searchLoading?'searchengine.searching':478),
            style:{
                backgroundColor:'transparent'
            }
        }
    }

    let groupProps = {};
    if(searchResults) {
        groupProps = {
            skipParentNavigation: true,
        };
        if(searchScope === 'all') {
            groupProps = {
                ...groupProps,
                defaultGroupBy:"repository_id",
                groupByLabel:'repository_display',
            }
        }
    } else if(pinBookmarks) {
        groupProps = {
            groupSkipUnique: true,
            defaultGroupBy: "bookmark",
            groupByValueFunc:(value) => value === "true" ? -1 : 1,
            renderGroupLabels:(groupBy, value) => {
                if(value === -1) {
                    return <span><span className={"mdi mdi-pin"}/> {pydio.MessageHash[147]}</span>
                } else {
                    return <span><span className={"mdi mdi-folder-multiple-outline"}/> {pydio.MessageHash['ajax_gui.pinned-bookmarks.other']}</span>
                }
            }
        }
    }


    let className = 'modern-list vertical-layout layout-fill files-list main-files-list';

    let dMode = displayMode;
    // Override display Mode
    let near;
    if(dMode.indexOf('grid-') === 0){
        near = parseInt(dMode.split('-')[1]);
        dMode = 'grid';
        className += ' material-list-grid grid-size-' + near;
        if(horizontalRibbon){
            className += ' horizontal-ribbon';
        }
    } else if(dMode === 'pages' && searchResults) {
        dMode = 'list';
    } else if (dMode === 'detail') {
        className += ' table-mode'
    } else if(dMode.indexOf('masonry')=== 0) {
        let cWidth = 220
        if(dMode.indexOf('masonry-')=== 0){
            cWidth = parseInt(dMode.replace('masonry-', ''))
        }
        // Fully replace
        className = "modern-list vertical-layout layout-fill masonry-grid "+"masonry-size-"+cWidth

    } else if (dMode === 'pages') {
        if(!BlockNote) {
            return (
                <div>Loading...</div>
            )
        }
        return (
            <div style={{...style, position:'relative', overflowY: 'scroll'}}>
                <BlockNote.MainPanel
                    dataModel={dataModel}
                    style={null}
                    contentMeta={pydio.getPluginConfigs('editor.bnote').get('BNOTE_PAGES_META')}
                    entryProps={{
                        renderIcon:entryRenderIcon,
                        renderActions: entryRenderActions
                    }}
                />
                {props.children}
            </div>
        );
    }

    if(contextNode.getMetadata().has('local:custom-list-classes')) {
        className += ' ' + contextNode.getMetadata().get('local:custom-list-classes').join(' ');
    }

    return (
        <ModernSimpleList
            pydio={pydio}
            node={contextNode}
            dataModel={dataModel}
            observeNodeReload={true}
            className={className}
            style={style}
            displayMode={dMode}
            usePlaceHolder={true}

            tableKeys={columns}
            sortingInfo={currentSortingInfo}
            handleSortChange={handleSortChange}

            onScroll={onScroll}
            passScrollingStateToChildren={true}

            entryRenderIcon={entryRenderIcon}
            entryRenderParentIcon={entryRenderIcon}
            entryRenderFirstLine={(node)=> computeLabel(node)}
            entryRenderSecondLine={dMode === 'list' ? entryRenderSecondLine : null}
            entryRenderActions={entryRenderActions}
            tableEntryRenderCell={tableEntryRenderCell}
            entriesProps={dMode === 'grid' ? {selectedAsBorder: true, noHover: true}:{}}

            horizontalRibbon={horizontalRibbon}

            emptyStateProps={emptyStateProps}
            errorStateProps={errorStateProps}


            customToolbar={<CellsMessageToolbar pydio={pydio}/>}
            {...groupProps}
        />
    );
}

MainFilesListV2 = muiThemeable()(MainFilesListV2)
export {MainFilesListV2}
