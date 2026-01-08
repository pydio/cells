/*
 * Copyright 2026 Abstrium SAS <team (at) pyd.io>
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

import React, {useCallback, useEffect, useState, useMemo} from 'react'
import UnifiedSearchForm from "./components/UnifiedSearchForm";
import Pydio from 'pydio'
const {withSearch} = Pydio.requireLib('hoc')
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {SearchStatusButton} from "./components/SearchStatusButton";
import {AdvancedAsChips} from "./components/AdvancedAsChips";
import {previewEntryRenderIcon, previewTableEntryRenderCell} from "../views/FilePreview";
import {useRichMetaActions} from "../views/useRichMetaActions";
import {useRichMetaLine} from "../views/useRichMetaLine";
import {useActionExtensionsPin} from "../views/useActionExtensionsPin";
import {useColumnsFromRegistry} from "../../HOCs/hooks";
import {useEmptyErrorStatesProps} from "../views/useEmptyErrorStatesProps";
import {useActionDisplayMode} from "../views/useActionDisplayMode";
const {ModernSimpleList} = Pydio.requireLib('components');


export const ModalSearch = withSearch( ({pydio, searchTools}) => {

    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [menuOpen, setMenuOpen] = React.useState(false);

    const {displayMode, buildDisplayModeItems} = useActionDisplayMode({})

    useEffect(()=>{
        const listener = e => {
            if(open && e.key === 'Escape') {
                setOpen(false)
                return
            }
            if (open || /^(?:input|textarea|select|button)$/i.test(e.target.tagName)) {
                return;
            }
            if(e.key !== 'k' || !(e.metaKey || e.ctrlKey)) {
                return
            }
            e.preventDefault();
            setOpen(true);
        }
        document.addEventListener("keydown", listener);
        return () => {
            document.removeEventListener("keydown", listener)
        }

    },[open]);

    useEffect(() => {
        const listener = () => setOpen(true)
        document.addEventListener("pydioOpenSearch", listener);
        return () => {
            document.removeEventListener("pydioOpenSearch", listener);
        }
    }, [open]);

    const displayMenuItems = buildDisplayModeItems()

    const styles = {
        sxs: {
            backdropColor: 'rgba(0,0,0,.25)',
            modalPosition: {display:'flex', alignItems:'center', justifyContent:'center', overflowX:'hidden'},
            mainPaper: {
                background:'var(--md-sys-color-surface-2)',
                width: '80%',
                height:'80%',
                minWidth:420,
                maxWidth:'100%',
                display: 'flex',
                flexDirection:'column',
                padding: '8px 0 2px !important',
                overflow:'hidden',
                borderRadius:'12px',
            },
        },
        searchMoreStyles : {
            fixed: {borderRadius:20, display:'flex', alignItems: 'center', justifyContent:'center'},
            label:{fontSize:'inherit', paddingLeft: 10, paddingRight: 10},
            button:{width: 'auto', height:24, lineHeight:'20px', margin: 0, marginBottom:5, backgroundColor: 'var(--md-sys-color-surface-variant)'},
        },
        chipsStyles: {
            padding: '8px',
            paddingBottom: '4px',
            borderBottom: '1px solid var(--md-sys-color-outline-variant-50)',
        },
        searchForm: {
            mainStyle:{
                width: "auto",
                height: "36px",
                alignItems: "center",
                border: "1px solid var(--md-sys-color-inverse-primary)",
                paddingLeft: "8px",
                backgroundColor: "var(--md-sys-color-surface)",
                transition: "550ms cubic-bezier(0.23, 1, 0.32, 1)",
                margin: "0 8px",
                borderRadius: "8px",
            },
            completeMenuStyle:{width: '100%'},
            inputStyle:{fontSize: 18},
            hintStyle:{fontSize: 18},
            magnifierStyle:{
                fontSize: 20,
                marginRight: 10
            }
        },
        statusBar: {
            padding:'4px 12px', background:'var(--md-sys-color-surface-2)',
            borderTop:'1px solid var(--md-sys-color-outline-variant-50)',
            color: 'var(--md-sys-color-on-surface-variant)',
            display:'flex',
            alignItems:'center',
        }
    }
    const dataModel = pydio.getContextHolder()

    const {columns} = useColumnsFromRegistry({pydio})
    const {computeLabel} = useActionExtensionsPin({})
    const entryRenderActions = useRichMetaActions({pydio,dataModel,displayMode,customRenderProps:{},searchResults: true})
    const entryRenderSecondLine = useRichMetaLine({pydio, columns:columns, searchResults:true, searchScope:'all', requestCloseOnGoto: () => setOpen(false)});
    const tableEntryRenderCell = useCallback((node) => {
        return previewTableEntryRenderCell(node, computeLabel);
    }, [computeLabel])

    const entryRenderIcon = useCallback((node, entryProps = {}) => {
        return previewEntryRenderIcon(node, entryProps, displayMode);
    }, [displayMode])

    const {empty, searchLoading, submitSearch} = searchTools
    const {errorStateProps} = useEmptyErrorStatesProps({pydio, dataModel, contextNode: dataModel.getSearchNode()})
    const emptyStateProps = {
        primaryTextId:empty?'searchengine.start':(searchLoading?'searchengine.searching':478),
        style:{
            backgroundColor:'transparent'
        }
    }

    let dMode = displayMode;
    let className = 'modern-list vertical-layout layout-fill files-list main-files-list';
    // Override display Mode
    let near;
    if(dMode.indexOf('grid-') === 0){
        near = parseInt(dMode.split('-')[1]);
        dMode = 'grid';
        className += ' material-list-grid grid-size-' + near;
    } else if (dMode === 'detail') {
        className += ' table-mode'
    } else if(dMode.indexOf('masonry')=== 0) {
        let cWidth = 220
        if(dMode.indexOf('masonry-')=== 0){
            cWidth = parseInt(dMode.replace('masonry-', ''))
        }
        className = "modern-list vertical-layout layout-fill masonry-grid "+"masonry-size-"+cWidth
    }


    return (
        <Modal
            open={open}
            onClose={()=>{setOpen(false)}}
            slotProps={{backdrop:{sx:{backgroundColor:styles.sxs.backdropColor}}}} sx={styles.sxs.modalPosition}
            disableEnforceFocus
        >
            <Paper elevation={10} sx={styles.sxs.mainPaper} tabIndex={10000}>
                <UnifiedSearchForm
                    active={false}
                    preventOpen={false}
                    autoFocus={true}
                    pydio={pydio}
                    formStyles={styles.searchForm}
                    searchTools={searchTools}
                    onRequestOpen={()=>{}}
                    onRequestClose={()=>setOpen(false)}
                    advancedPopover={false}
                />
                <AdvancedAsChips
                    pydio={pydio}
                    searchTools={searchTools}
                    containerStyle={styles.chipsStyles}
                    appendUnstyled={<SearchStatusButton
                        pydio={pydio}
                        searchTools={searchTools}
                        moreOnly={true}
                        style={{...styles.searchMoreStyles.button, ...styles.searchMoreStyles.label, ...styles.searchMoreStyles.fixed}}
                        buttonStyle={styles.searchMoreStyles.button}
                        buttonLabelStyle={styles.searchMoreStyles.label}
                    />}
                />
                <ModernSimpleList
                    pydio={pydio}
                    node={dataModel.getSearchNode()}
                    dataModel={dataModel}
                    observeNodeReload={true}
                    className={className}
                    displayMode={dMode}
                    additionalAttrs={{
                        style:{
                            backgroundColor: 'var(--md-sys-color-surface)',
                            color: 'var(--md-sys-color-on-surface)',
                            borderRadius: '0',
                        }}}
                    usePlaceHolder={true}

                    tableKeys={columns}
                    sortingInfo={null}
                    handleSortChange={()=>{}}

                    entryRenderIcon={entryRenderIcon}
                    entryRenderParentIcon={entryRenderIcon}
                    entryRenderFirstLine={(node)=> computeLabel(node)}
                    entryRenderSecondLine={displayMode === 'list' ? entryRenderSecondLine : null}
                    entryRenderActions={entryRenderActions}
                    emptyStateProps={emptyStateProps}
                    tableEntryRenderCell={tableEntryRenderCell}
                    errorStateProps={errorStateProps}

                    /*
                    entriesProps={dMode === 'grid' ? {selectedAsBorder: true, noHover: true}:{}}
                    customToolbar={<CellsMessageToolbar pydio={pydio}/>}
                    {...groupProps}
                     */
                />
                <div style={styles.statusBar}>
                    <div style={{flex: 1}}>Tip: Use <kbd>Ctrl+k</kbd> or <kbd>Cmd+k</kbd> to open this search dialog, <kbd>Esc</kbd> to close.</div>
                    <div style={{fontSize: 16}}>
                        <IconButton onClick={()=>submitSearch()} className={'mdi mdi-refresh'} size={'small'} aria-label={"Reload search"}/>
                        <IconButton onClick={(e)=>{setMenuOpen(true); setAnchorEl(e.currentTarget)}} className={'mdi mdi-settings'} size={'small'}/>
                        <Menu open={menuOpen}
                              slotProps={{paper:{style:{borderRadius:4}}}}
                              anchorEl={anchorEl}
                              anchorOrigin={{vertical:'top', horizontal:'right'}}
                              transformOrigin={{vertical:'bottom', horizontal:'right'}}
                              onClose={()=>{setMenuOpen(false)}}
                        >
                            {displayMenuItems.map(i =>
                                <MenuItem
                                    style={{padding:'4px 8px', fontSize:14, fontWeight:400}}
                                    onClick={()=>{setMenuOpen(false);i.callback();}}>{i.name}
                                </MenuItem>
                            )}
                        </Menu>
                    </div>
                    <div>
                    </div>
                </div>
            </Paper>
        </Modal>
    )

}, 'main', 'ws', false)