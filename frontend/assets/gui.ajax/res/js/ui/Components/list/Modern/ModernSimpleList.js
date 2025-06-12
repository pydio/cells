/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
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

import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

// Pydio Specific Imports - Assuming Pydio global is available
import Pydio from 'pydio'
const PydioDataModel = require('pydio/model/data-model')
const pydio = Pydio.getInstance(); // For accessing Pydio.user, Pydio.getMessages etc.

// Local Component Imports
import {useKeyNavigation} from "./useKeyNavigation";
import {useEmptyStateProps} from "./useEmptyStateProps";
import EmptyStateView from '../../views/EmptyStateView'
import {useItemClicked, UseItemClickedPropTypes} from "./useItemClicked";
import {useItems} from "./useItems";
import PlaceHolders from "../PlaceHolders";
import {ModernLayoutTable} from "./ModernLayoutTable";
import {ModernLayoutMasonry} from "./ModernLayoutMasonry";
import {ModernLayoutDefault} from "./ModernLayoutDefault";

// Placeholder for AutoSizer (can be replaced with a proper import later)
const AutoSizer = ({ children, defaultHeight = 300, defaultWidth = '100%' }) => {
    // In a real scenario, this would measure parent dimensions
    // For this shell, we just pass through children with default dimensions
    return children({ height: defaultHeight, width: defaultWidth });
};

// Placeholder for other internal components


const ModernSimpleList = (props) => {
    const {
        node,
        dataModel,
        emptyStateProps,
        errorStateProps,
        className,
        tableKeys,
        displayMode,
        onScroll,
        entryRenderActions,
        entryRenderIcon,
        entryRenderFirstLine,
        entryRenderSecondLine,
        tableEntryRenderCell,
        customToolbar,
        additionalAttrs={}
    } = props;

    const [elementsPerLine, setElementsPerLine] = useState(1)

    useEffect(() => {
        if(displayMode.indexOf('grid') === -1) {
            setElementsPerLine(1)
        }
    }, [displayMode]);

    const {items, isLoading, error, selection, updateSelection, updateSelectionFromItemEvent, currentSortingInfo, handleSortChange} =  useItems(props)

    const {handleItemClick, handleItemDoubleClick} = useItemClicked({items, pydio, dataModel, updateSelectionFromItemEvent})

    const {handleKeyDown} = useKeyNavigation({
        selection,
        updateSelection,
        elementsPerLine,
        items,
        fireDeleteCallback: () => {
            pydio.Controller.fireActionByKey('key_delete')
        },
        fireEnterCallback: handleItemDoubleClick,
    })

    const emptyState = useEmptyStateProps({
        emptyStateProps, errorStateProps, node, items, error,
        openFolder:handleItemDoubleClick
    })


    // Render logic
    const showLoading = isLoading && (!node || (typeof node.isLoaded === 'function' ? !node.isLoaded() : true));
    if (showLoading && !error) {
        return (
            <div className={className}>
                <PlaceHolders
                    displayMode={displayMode}
                    tableKeys={displayMode==='detail' && tableKeys}
                    elementHeight={displayMode === 'list' ? 71 : 160}
                />
            </div>
        )
    }

    let LayoutComponent;
    if (displayMode === 'detail') {
        LayoutComponent = ModernLayoutTable
    } else if (displayMode.indexOf('masonry') === 0) {
        LayoutComponent = ModernLayoutMasonry
    } else {
        LayoutComponent = ModernLayoutDefault
    }

    return (
        <div className={className} {...additionalAttrs}>
            {emptyState && <EmptyStateView {...emptyState}/>}
            {customToolbar}
            {!emptyState && (
                <LayoutComponent
                    pydio={pydio}
                    items={items}
                    tableKeys={tableKeys}
                    selection={selection}
                    currentSortingInfo={currentSortingInfo}
                    handleItemClick={handleItemClick}
                    handleItemDoubleClick={handleItemDoubleClick}
                    handleKeyDown={handleKeyDown}
                    handleSortChange={handleSortChange}
                    displayMode={displayMode}
                    onScroll={onScroll}
                    setItemsPerRow={displayMode.indexOf('grid')=== 0 ? (i) => setElementsPerLine(i) : null}
                    tableEntryRenderCell={tableEntryRenderCell}
                    entryRenderActions={entryRenderActions}
                    entryRenderIcon={entryRenderIcon}
                    entryRenderFirstLine={entryRenderFirstLine}
                    entryRenderSecondLine={entryRenderSecondLine}
                />
            )}
        </div>
    )
};

ModernSimpleList.propTypes = {
    // Data related props
    node: PropTypes.object.isRequired, // Current Pydio node whose children are to be listed (can be null for root or specific data sources)
    dataModel: PropTypes.instanceOf(PydioDataModel).isRequired,
    filterNodes: PropTypes.func, // (nodes, filterString) => filteredNodes // Implemented in processAndSetItems

    // Behavior props
    defaultGroupBy: PropTypes.string, // Implemented in buildDisplayElements
    groupSkipUnique: PropTypes.bool, // Implemented
    groupByLabel: PropTypes.string, // Implemented
    renderGroupLabels: PropTypes.func, // Implemented
    groupByValueFunc: PropTypes.func, // Implemented
    selectFirstRowOnLoad: PropTypes.bool,
    loadDataOnMount: PropTypes.bool, // Implemented by initial load effect
    forceReloadId: PropTypes.string, // Change to trigger reload

    tableKeys: PropTypes.object, // If provided, renders as a table

    emptyMessage: PropTypes.string,
    emptyStateProps: PropTypes.object, // Props for EmptyStateView
    errorStateProps: PropTypes.object,  // Props for an ErrorStateView (if one exists)

    // Selection props
    selection: PropTypes.instanceOf(Map), // Controlled selection state
    onSelectionChange: PropTypes.func, // (newSelectionMap) => void

    // Action Callbacks
    ...UseItemClickedPropTypes,

    // Sorting props
    sortingInfo: PropTypes.shape({ // Controlled sorting state
        attribute: PropTypes.string,
        sortType: PropTypes.string,
        direction: PropTypes.oneOf(['asc', 'desc']),
    }),
    defaultSortingInfo: PropTypes.shape({ // Used for initial sort and pref fallback
        attribute: PropTypes.string,
        sortType: PropTypes.string,
        direction: PropTypes.oneOf(['asc', 'desc']),
    }),
    onSortingInfoChange: PropTypes.func, // (newSortingInfo) => void

    autoLoadNode: PropTypes.bool,
    observeNodeReload: PropTypes.bool, // Implemented in Node Event Observation
    skipParentNavigation: PropTypes.bool, // Implemented

    // Style & ClassName
    className: PropTypes.string,
    style: PropTypes.object,

    // DND Props (placeholders, might be more complex)
    enableDrag: PropTypes.bool,
    enableDrop: PropTypes.bool,
    getDragData: PropTypes.func, // (node) => data
    onDropNode: PropTypes.func, // (draggedNode, targetNode, dropPosition) => void

    // Reloading
    reloadAtCursor: PropTypes.bool, // Placeholder for future implementation

    // Inline Edition
    inlineEditionDetails: PropTypes.object, // { active: bool, data: object, target: DOMElement, anchor: DOMElement }
    onStartInlineEdition: PropTypes.func,
    onStopInlineEdition: PropTypes.func,

    // Paging
    pageInfo: PropTypes.object, // { currentPage, totalPages, itemsPerPage }
    onPageChange: PropTypes.func, // (newPageNumber) => void
};

ModernSimpleList.defaultProps = {
    selectFirstRowOnLoad: false,
    autoLoadNode: true,
    defaultSortingInfo: {attribute:'label', sortType:'file-natural', direction:'asc'},
    emptyMessage: "No items found."
};

export { ModernSimpleList };
