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

import React, { useCallback, useEffect, useState } from 'react';
import UnifiedSearchForm from './components/UnifiedSearchForm';
import Pydio from 'pydio';

import {
    Modal,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    ListSubheader,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import { SearchStatusButton } from './components/SearchStatusButton';
import { AdvancedAsChips } from './components/AdvancedAsChips';
import {
    previewEntryRenderIcon,
    previewTableEntryRenderCell,
} from '../views/FilePreview';
import { useRichMetaLine } from '../views/useRichMetaLine';
import { useActionExtensionsPin } from '../views/useActionExtensionsPin';
import { useColumnsFromRegistry } from '../../HOCs/hooks';
import { useEmptyErrorStatesProps } from '../views/useEmptyErrorStatesProps';
import { useActionDisplayMode } from '../views/useActionDisplayMode';
import {
    useModalHandleClick,
    useModalSearchActions,
} from './components/useModalSearchActions';
const { ModernSimpleList } = Pydio.requireLib('components');
const { PydioMantineProvider, ModernTextField, withSearch } =
    Pydio.requireLib('hoc');

export const ModalSearch = withSearch(
    ({
        pydio,
        searchTools,
        dataModel,
        accessKey = 'k',
        eventName = 'pydioOpenSearch',
    }) => {
        const [open, setOpen] = useState(false);
        const [displayMenuAnchor, setDisplayMenuAnchor] = React.useState(null);
        const [displayMenuOpen, setDisplayMenuOpen] = React.useState(false);
        const [onSelectNode, setSelectNode] = React.useState(null);
        const [onSelectSearch, setSelectSearch] = React.useState(null);
        const [onSelectCancel, setSelectCancel] = React.useState(null);

        const [savedMenuAnchor, setSavedMenuAnchor] = React.useState(null);
        const [savedMenuOpen, setSavedMenuOpen] = React.useState(false);
        const [showSaveSearchField, setShowSaveSearchField] =
            React.useState(false);
        const [saveSearchLabel, setSaveSearchLabel] = React.useState('');

        const { displayMode, buildDisplayModeItems } = useActionDisplayMode({
            preferencePrefix: 'ModalSearch.FilesList',
        });

        useEffect(() => {
            if (!accessKey) {
                return;
            }
            const listener = (e) => {
                if (open && e.key === 'Escape') {
                    setOpen(false);
                    return;
                }
                if (
                    open ||
                    /^(?:input|textarea|select|button)$/i.test(e.target.tagName)
                ) {
                    return;
                }
                if (e.key !== accessKey || !(e.metaKey || e.ctrlKey)) {
                    return;
                }
                e.preventDefault();
                setOpen(true);
            };
            document.addEventListener('keydown', listener);
            return () => {
                document.removeEventListener('keydown', listener);
            };
        }, [open, accessKey]);

        const {
            saveSearch,
            clearSavedSearch,
            values,
            setValues,
            savedSearches = [],
            sortField,
            sortDesc,
            setSortField,
        } = searchTools;

        useEffect(() => {
            const listener = (e) => {
                if (e.detail) {
                    const {
                        onSelectNode,
                        onSelectSearch,
                        onSelectCancel,
                        openValues,
                        openSort,
                    } = e.detail;
                    setSelectNode(() => onSelectNode);
                    setSelectCancel(() => onSelectCancel);
                    setSelectSearch(() => onSelectSearch);
                    if (openValues) {
                        setValues(openValues);
                    }
                    if (openSort) {
                        setSortField(openSort.field, openSort.desc);
                    }
                }
                setOpen(true);
            };
            document.addEventListener(eventName, listener);
            return () => {
                document.removeEventListener(eventName, listener);
            };
        }, [open]);

        const displayMenuItems = buildDisplayModeItems();

        const styles = {
            sxs: {
                backdropColor: 'rgba(0,0,0,.25)',
                modalPosition: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflowX: 'hidden',
                },
                mainPaper: {
                    background: 'var(--md-sys-color-surface-2)',
                    width: '80%',
                    height: '80%',
                    minWidth: 420,
                    maxWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px 0 2px !important',
                    overflow: 'hidden',
                    borderRadius: '12px',
                },
            },
            searchMoreStyles: {
                fixed: {
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                label: {
                    fontSize: 'inherit',
                    paddingLeft: 10,
                    paddingRight: 10,
                },
                button: {
                    width: 'auto',
                    height: 24,
                    lineHeight: '20px',
                    margin: 0,
                    marginBottom: 5,
                    backgroundColor: 'var(--md-sys-color-surface-variant)',
                },
            },
            chipsStyles: {
                padding: '8px',
                paddingBottom: '4px',
                borderBottom:
                    '1px solid var(--md-sys-color-outline-variant-50)',
            },
            searchForm: {
                mainStyle: {
                    width: 'auto',
                    height: '36px',
                    alignItems: 'center',
                    border: '1px solid var(--md-sys-color-inverse-primary)',
                    paddingLeft: '8px',
                    backgroundColor: 'var(--md-sys-color-surface)',
                    transition: '550ms cubic-bezier(0.23, 1, 0.32, 1)',
                    margin: '0 8px',
                    borderRadius: '8px',
                },
                completeMenuStyle: { width: '100%' },
                inputStyle: { fontSize: 18 },
                hintStyle: { fontSize: 18 },
                magnifierStyle: {
                    fontSize: 20,
                    marginRight: 10,
                },
            },
            statusBar: {
                padding: '4px 12px',
                background: 'var(--md-sys-color-surface-2)',
                borderTop: '1px solid var(--md-sys-color-outline-variant-50)',
                color: 'var(--md-sys-color-on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
            },
        };

        const onRequestClose = useCallback(() => {
            setOpen(false);
            if (onSelectCancel) {
                onSelectCancel();
                setSelectCancel(null);
                setSelectNode(null);
                setSelectSearch(null);
            }
        }, [
            setOpen,
            onSelectCancel,
            setSelectCancel,
            setSelectNode,
            setSelectSearch,
        ]);

        const { columns } = useColumnsFromRegistry({ pydio });
        const { computeLabel } = useActionExtensionsPin({});
        const entryRenderActions = useModalSearchActions({
            pydio,
            dataModel,
            displayMode,
            requestClose: onRequestClose,
            onSelectNode,
        });
        const entryHandleClicks = useModalHandleClick({
            pydio,
            dataModel,
            displayMode,
            requestClose: onRequestClose,
            onSelectNode,
        });
        const entryRenderSecondLine = useRichMetaLine({
            pydio,
            columns: columns,
            searchResults: true,
            searchScope: 'all',
            disableGotoLink: onSelectNode || onSelectSearch,
            requestCloseOnGoto: onRequestClose,
        });
        const tableEntryRenderCell = useCallback(
            (node) => {
                return previewTableEntryRenderCell(node, computeLabel);
            },
            [computeLabel],
        );

        const entryRenderIcon = useCallback(
            (node, entryProps = {}) => {
                return previewEntryRenderIcon(node, entryProps, displayMode);
            },
            [displayMode],
        );

        const { empty, searchLoading, submitSearch } = searchTools;
        const { errorStateProps } = useEmptyErrorStatesProps({
            pydio,
            dataModel,
            contextNode: dataModel.getSearchNode(),
        });
        const emptyStateProps = {
            primaryTextId: empty
                ? 'searchengine.start'
                : searchLoading
                  ? 'searchengine.searching'
                  : 478,
            style: {
                backgroundColor: 'transparent',
            },
        };

        let dMode = displayMode;
        let className =
            'modern-list vertical-layout layout-fill files-list main-files-list';
        // Override display Mode
        let near;
        if (dMode.indexOf('grid-') === 0) {
            near = parseInt(dMode.split('-')[1]);
            dMode = 'grid';
            className += ' material-list-grid grid-size-' + near;
        } else if (dMode === 'detail') {
            className += ' table-mode';
        } else if (dMode.indexOf('masonry') === 0) {
            let cWidth = 220;
            if (dMode.indexOf('masonry-') === 0) {
                cWidth = parseInt(dMode.replace('masonry-', ''));
            }
            className =
                'modern-list vertical-layout layout-fill masonry-grid ' +
                'masonry-size-' +
                cWidth;
        }
        const m = useCallback((id) => pydio.MessageHash[id] || id, []);

        let statusBarString = m(
            'ajax_gui.modalsearch.opentip.' +
                (navigator.platform.startsWith('Mac') ? 'cmd' : 'ctrl'),
        );
        statusBarString = (
            <span dangerouslySetInnerHTML={{ __html: statusBarString }} />
        );

        return (
            <Modal
                open={open}
                onClose={() => {
                    setOpen(false);
                }}
                slotProps={{
                    backdrop: {
                        sx: { backgroundColor: styles.sxs.backdropColor },
                    },
                }}
                sx={styles.sxs.modalPosition}
                disableEnforceFocus
            >
                <Paper
                    elevation={10}
                    sx={styles.sxs.mainPaper}
                    tabIndex={10000}
                >
                    <PydioMantineProvider>
                        <UnifiedSearchForm
                            active={false}
                            preventOpen={false}
                            autoFocus={true}
                            pydio={pydio}
                            formStyles={styles.searchForm}
                            searchTools={searchTools}
                            onRequestOpen={() => {}}
                            onRequestClose={onRequestClose}
                            advancedPopover={false}
                        />
                        <AdvancedAsChips
                            pydio={pydio}
                            searchTools={searchTools}
                            containerStyle={styles.chipsStyles}
                            appendUnstyled={
                                <SearchStatusButton
                                    pydio={pydio}
                                    searchTools={searchTools}
                                    moreOnly={true}
                                    style={{
                                        ...styles.searchMoreStyles.button,
                                        ...styles.searchMoreStyles.label,
                                        ...styles.searchMoreStyles.fixed,
                                    }}
                                    buttonStyle={styles.searchMoreStyles.button}
                                    buttonLabelStyle={
                                        styles.searchMoreStyles.label
                                    }
                                />
                            }
                        />
                        <ModernSimpleList
                            pydio={pydio}
                            node={dataModel.getSearchNode()}
                            dataModel={dataModel}
                            observeNodeReload={true}
                            className={className}
                            displayMode={dMode}
                            additionalAttrs={{
                                style: {
                                    backgroundColor:
                                        'var(--md-sys-color-surface)',
                                    color: 'var(--md-sys-color-on-surface)',
                                    borderRadius: '0',
                                },
                            }}
                            usePlaceHolder={true}
                            tableKeys={columns}
                            sortingInfo={null}
                            handleSortChange={() => {}}
                            entryRenderIcon={entryRenderIcon}
                            entryRenderParentIcon={entryRenderIcon}
                            entryRenderFirstLine={(node) => computeLabel(node)}
                            entryRenderSecondLine={
                                displayMode === 'list'
                                    ? entryRenderSecondLine
                                    : null
                            }
                            entryRenderActions={entryRenderActions}
                            entryHandleClicks={entryHandleClicks}
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
                            {!onSelectSearch && (
                                <div style={{ flex: 1 }}>
                                    <span
                                        className={'mdi mdi-lightbulb-outline'}
                                    />{' '}
                                    {statusBarString}
                                </div>
                            )}
                            <div
                                data-testid="search-status-bar-actions"
                                style={{ fontSize: 16 }}
                            >
                                <IconButton
                                    onClick={() => submitSearch()}
                                    className={'mdi mdi-refresh'}
                                    size={'small'}
                                    aria-label={'Reload search'}
                                />
                                <IconButton
                                    onClick={(e) => {
                                        setSavedMenuOpen(true);
                                        setSavedMenuAnchor(e.currentTarget);
                                    }}
                                    className={'mdi mdi-content-save'}
                                    size={'small'}
                                    aria-label={m(
                                        'searchengine.complete.group.saved',
                                    )}
                                />
                                <Menu
                                    open={savedMenuOpen}
                                    slotProps={{
                                        paper: {
                                            style: {
                                                borderRadius: 6,
                                                background:
                                                    'var(--md-sys-color-surface-1)',
                                                paddingBottom: 4,
                                            },
                                        },
                                    }}
                                    anchorEl={savedMenuAnchor}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    onClose={() => {
                                        setSavedMenuOpen(false);
                                    }}
                                >
                                    <ListSubheader
                                        style={{
                                            padding: '10px 12px 4px 6px',
                                            lineHeight: 'inherit',
                                            background: 'transparent',
                                        }}
                                    >
                                        {m('searchengine.complete.group.saved')}
                                    </ListSubheader>
                                    {savedSearches.map((i) => {
                                        const {
                                            searchID,
                                            searchLABEL,
                                            searchSORTING,
                                            ...savedValues
                                        } = i;
                                        return (
                                            <MenuItem
                                                aria-label={searchLABEL}
                                                key={searchID}
                                                style={{
                                                    padding: '4px 6px 4px 6px',
                                                    fontSize: 13,
                                                    fontWeight: 400,
                                                    display: 'flex',
                                                }}
                                                onClick={() => {
                                                    setSavedMenuOpen(false);
                                                    setValues(savedValues);
                                                    if (
                                                        searchSORTING &&
                                                        searchSORTING.sortField
                                                    ) {
                                                        setSortField(
                                                            searchSORTING.sortField,
                                                            searchSORTING.sortDesc,
                                                        );
                                                    }
                                                }}
                                            >
                                                <span
                                                    className={
                                                        'mdi mdi-magnify'
                                                    }
                                                    style={{
                                                        opacity: 0.43,
                                                        marginRight: 8,
                                                    }}
                                                />
                                                <span style={{ flex: 1 }}>
                                                    {searchLABEL}
                                                </span>
                                                <span
                                                    className={'mdi mdi-close'}
                                                    style={{
                                                        opacity: 0.23,
                                                        marginLeft: 8,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={(e) => {
                                                        clearSavedSearch(
                                                            searchID,
                                                        );
                                                        e.stopPropagation();
                                                    }}
                                                />
                                            </MenuItem>
                                        );
                                    })}
                                    <Divider />
                                    <MenuItem
                                        style={{
                                            padding: '4px 12px 4px 6px',
                                            fontSize: 13,
                                            fontWeight: 400,
                                        }}
                                        onClick={() => {
                                            setShowSaveSearchField(true);
                                        }}
                                    >
                                        <div>
                                            <span
                                                className={
                                                    'mdi mdi-content-save'
                                                }
                                                style={{
                                                    opacity: 0.43,
                                                    marginRight: 8,
                                                }}
                                            />{' '}
                                            {m(
                                                'searchengine.query.action.save-new',
                                            )}
                                        </div>
                                    </MenuItem>
                                </Menu>
                                <IconButton
                                    onClick={(e) => {
                                        setDisplayMenuOpen(true);
                                        setDisplayMenuAnchor(e.currentTarget);
                                    }}
                                    className={'mdi mdi-cog-outline'}
                                    size={'small'}
                                    aria-label={m('151')}
                                />
                                <Menu
                                    open={displayMenuOpen}
                                    slotProps={{
                                        paper: {
                                            style: {
                                                borderRadius: 6,
                                                background:
                                                    'var(--md-sys-color-surface-1)',
                                                paddingBottom: 4,
                                            },
                                        },
                                    }}
                                    anchorEl={displayMenuAnchor}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    onClose={() => {
                                        setDisplayMenuOpen(false);
                                    }}
                                >
                                    <ListSubheader
                                        style={{
                                            padding: '10px 12px 4px 6px',
                                            lineHeight: 'inherit',
                                            background: 'transparent',
                                        }}
                                    >
                                        {m('151')}
                                    </ListSubheader>
                                    {displayMenuItems.map((i) => (
                                        <MenuItem
                                            style={{
                                                padding: '4px 12px 4px 6px',
                                                fontSize: 13,
                                                fontWeight: 400,
                                            }}
                                            onClick={() => {
                                                setDisplayMenuOpen(false);
                                                i.callback();
                                            }}
                                        >
                                            <span
                                                className={i.icon_class}
                                                style={{
                                                    opacity: 0.43,
                                                    marginRight: 8,
                                                }}
                                            />{' '}
                                            {i.name}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </div>
                            {onSelectSearch && (
                                <>
                                    <div style={{ flex: 1 }}></div>
                                    <div>
                                        <Button
                                            style={{ fontWeight: 500 }}
                                            onClick={() => {
                                                onSelectCancel();
                                                setOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            style={{ fontWeight: 500 }}
                                            onClick={() => {
                                                onSelectSearch(
                                                    values,
                                                    sortField,
                                                    sortDesc,
                                                );
                                                setOpen(false);
                                            }}
                                        >
                                            Use Current Search
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                        <Dialog
                            open={showSaveSearchField}
                            PaperProps={{
                                style: {
                                    background: 'var(--md-sys-color-surface-5)',
                                },
                            }}
                            onClose={() => setShowSaveSearchField(false)}
                        >
                            <DialogTitle
                                style={{
                                    padding: 20,
                                    paddingBottom: 10,
                                    fontSize: 22,
                                }}
                            >
                                {m('searchengine.query.action.save-new')}
                            </DialogTitle>
                            <DialogContent
                                style={{
                                    padding: '0 20px 20px',
                                    minWidth: 320,
                                }}
                            >
                                <div style={{ opacity: 0.73 }}>
                                    {m('searchengine.query.action.save-legend')}
                                </div>
                                <ModernTextField
                                    focusOnMount={true}
                                    fullWidth={true}
                                    variant={'v2'}
                                    floatingLabelText={m(
                                        'searchengine.query.save-label',
                                    )}
                                    value={saveSearchLabel}
                                    onChange={(e, v) => setSaveSearchLabel(v)}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' &&
                                            saveSearchLabel
                                        ) {
                                            saveSearch(saveSearchLabel, {
                                                sortField,
                                                sortDesc,
                                            });
                                            setShowSaveSearchField(false);
                                            setSavedMenuOpen(false);
                                        }
                                    }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    style={{ fontWeight: 500 }}
                                    onClick={() =>
                                        setShowSaveSearchField(false)
                                    }
                                >
                                    {m('54')}
                                </Button>
                                <Button
                                    style={{
                                        fontWeight: 500,
                                        color: 'var(--md-sys-color-primary)',
                                    }}
                                    type="submit"
                                    onClick={() => {
                                        saveSearch(saveSearchLabel, {
                                            sortField,
                                            sortDesc,
                                        });
                                        setShowSaveSearchField(false);
                                        setSavedMenuOpen(false);
                                    }}
                                >
                                    {m('searchengine.query.action.save')}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </PydioMantineProvider>
                </Paper>
            </Modal>
        );
    },
    'main',
    'ws',
    false,
);
