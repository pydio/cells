import React, {useState, useEffect, useCallback, useRef, useMemo, Fragment} from 'react';
import PropTypes from 'prop-types';
import { FontIcon } from 'material-ui';
import Infinite from 'react-infinite'; // Assuming react-infinite is installed and available

// Pydio Specific Imports - Assuming Pydio global is available
import Pydio from 'pydio'
const PydioDataModel = require('pydio/model/data-model')
const pydio = Pydio.getInstance(); // For accessing Pydio.user, Pydio.getMessages etc.

// Local Component Imports
import { ModernListEntry } from './ModernListEntry';
import { ModernTableListEntry } from './ModernTableListEntry';
import {useSelection} from "./useSelection";
import {useSorting} from "./useSorting";
import SortColumns from "../SortColumns";
import {useKeyNavigation} from "./useKeyNavigation";
import {useEmptyStateProps} from "./useEmptyStateProps";
import EmptyStateView from '../../views/EmptyStateView'
import {useGrouping} from "./useGrouping";

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
        tableKeys,
        defaultSortingInfo,
        sortingPreferenceKey,
        onSortingInfoChange,
        emptyStateProps,
        errorStateProps,
        filterNodes,
        observeNodeReload,
        skipParentNavigation,
        defaultGroupBy,
        groupSkipUnique,
        groupByLabel,
        renderGroupLabels,
        groupByValueFunc,
        className
        // ... other props will be destructured or used via props.
    } = props;

    const [items, setItems] = useState([]); // Will store PydioNode, parent items, group headers
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Refs
    const containerRef = useRef(null); // For the main container div

    const {currentSortingInfo, sorter:localSorter, handleSortChange} = useSorting({dataModel, node, defaultSortingInfo})

    const grouper = useGrouping({defaultGroupBy, groupSkipUnique, groupByLabel, renderGroupLabels, groupByValueFunc})

    // buildDisplayElements Function (replaces and expands processAndSetItems)
    const buildDisplayElements = useCallback(() => {
        if (!dataModel || !node || !node.isLoaded()) {
            if (node && typeof node.getChildren !== 'function') {
                console.warn("Node object does not have getChildren method", node);
                setIsLoading(false);
                return;
            }
            if (!node || !node.isLoaded()) {
                setItems([]);
                setIsLoading(!!node); // Still loading if node exists but isn't loaded
                return;
            }
        }

        let rawChildren = [];

        if (node && typeof node.getChildren === 'function') {
            rawChildren = Array.from(node.getChildren().values());
        }

        // 1. Apply filter function
        const filteredChildren = filterNodes ? rawChildren.filter(child => filterNodes(child, dataModel)) : rawChildren;

        // 2. Wrap children as items { node: PydioNode } for consistent sorting/grouping input
        let processedItems = filteredChildren.map(childNode => ({ node: childNode, id: childNode.getPath() }));

        // 3. Sorting
        console.log('BUILD?', localSorter)
        if (localSorter) {
            processedItems.sort(localSorter);
        }

        // 5. Grouping
        processedItems = grouper(processedItems)

        // 6. Parent Navigation always first
        if (!skipParentNavigation && node.getParent && node.getParent()) {
            const parentNode = node.getParent();
            processedItems.unshift({ isParent: true, node: parentNode, id: '..parent', label: '..' });
        }

        setItems(processedItems);
        setIsLoading(false);
    }, [
        dataModel, node, filterNodes, localSorter, skipParentNavigation, defaultGroupBy, groupSkipUnique, groupByLabel, renderGroupLabels, groupByValueFunc
    ]);


    // Node Event Observation (useEffect)
    useEffect(() => {
        if (!dataModel || !node || !observeNodeReload || typeof node.observe !== 'function' || typeof node.stopObserving !== 'function') {
            return;
        }

        const loadingListener = () => setIsLoading(true);
        const loadedListener = () => {
            buildDisplayElements(); // This already sets isLoading to false
        };

        node.observe("loading", loadingListener);
        node.observe("loaded", loadedListener);
        node.observe("child_added", buildDisplayElements);
        node.observe("child_removed", buildDisplayElements);
        node.observe("child_replaced", buildDisplayElements);

        return () => {
            node.stopObserving("loading", loadingListener);
            node.stopObserving("loaded", loadedListener);
            node.stopObserving("child_added", buildDisplayElements);
            node.stopObserving("child_removed", buildDisplayElements);
            node.stopObserving("child_replaced", buildDisplayElements);
        };
    }, [dataModel, node, buildDisplayElements, observeNodeReload]);


    // Initial Data Load (useEffect)
    useEffect(() => {
        if (!dataModel || !node ) {
            setIsLoading(false);
            return;
        }

        if (typeof node.isLoaded !== 'function' || typeof node.load !== 'function') {
            console.warn("Node object does not have isLoaded/load methods", node);
            setIsLoading(false);
            return;
        }

        if (node.isLoaded()) {
            buildDisplayElements();
        } else {
            setIsLoading(true);
            setError(null);
            node.load()/*.catch(err => {
                console.error("Error loading node:", err);
                setError(err);
                setIsLoading(false); // Error occurred, stop loading
            });*/
        }
    }, [dataModel, node, buildDisplayElements]);




    // This effect ensures buildDisplayElements is called when local sorting changes
    useEffect(() => {
        if(currentSortingInfo && !currentSortingInfo.remote && node && node.isLoaded()){
            buildDisplayElements();
        }
    }, [currentSortingInfo, buildDisplayElements, node]);


    const {selection, updateSelection, itemSelected} = useSelection({
        dataModel:dataModel,
        multiSelect:props.multiSelect,
        filterSelectable: (it)=>{return (it.node && !it.isParent && !it.isGroupHeader)}
    });

    const {handler:keyNavigationHandler} = useKeyNavigation({selection, updateSelection, elementsPerLine:1, items})

    const handleItemClick = useCallback((itemData, event) => { // itemData can be {node: PydioNode} or {isParent: true, ...} etc.
        const targetNode = itemData.node; // All clickable items should have a 'node' property
        if (!targetNode) return;

        if (props.entryHandleClicks) {
            if(itemData.isParent) {
                props.entryHandleClicks(targetNode, 'double', event)
            } else {
                props.entryHandleClicks(targetNode, 'simple', event)
            }
        } else if (props.onClickItem) {
            props.onClickItem(targetNode, event); // Pass the actual PydioNode
        }

        if (!props.selectOnClick || itemData.isParent || itemData.isGroupHeader) return; // Don't select parent/group headers on click by default
        itemSelected(items, itemData, event)

    }, [props.onClickItem, props.entryHandleClicks, props.selectOnClick, props.multiSelect, selection, itemSelected, items]);

    const handleItemDoubleClick = useCallback((itemData, event) => { // itemData can be {node: PydioNode} or {isParent: true, ...} etc.
        const targetNode = itemData.node;
        if (!targetNode) return;
        if (props.entryHandleClicks) {
            props.entryHandleClicks(targetNode, 'double', event);
        } else if (props.onDoubleClickItem) {
            props.onDoubleClickItem(targetNode, event); // Pass the actual PydioNode
        }
    }, [props.onDoubleClickItem, props.entryHandleClicks]);

    const handleKeyDown = useCallback((event) => {
        if(event.key === 'Delete'){
            pydio.Controller.fireActionByKey('key_delete')
            return;
        } else if(event.key === 'Enter' && selection) {
            const first = items.find((it) => selection.get(it.node))
            if(first){
                handleItemDoubleClick(first, event)
                return;
            }
        }
        keyNavigationHandler(event)
    }, [keyNavigationHandler])

    const emptyState = useEmptyStateProps({
        emptyStateProps, errorStateProps, node, items,
        openFolder:handleItemDoubleClick
    })

    // Render logic
    const showLoading = isLoading && (!node || (typeof node.isLoaded === 'function' ? !node.isLoaded() : true));

    if (showLoading) {
        return <div ref={containerRef} className="modern-simple-list loading">Loading... (Loading: {isLoading.toString()}, Node: {node ? (node.isLoaded ? node.isLoaded().toString() : 'no isLoaded') : 'no'})</div>;
    }

    if (error && !items.length) { // Show error prominently if no items are displayed
        return <div ref={containerRef} className="modern-simple-list error">{error.message || String(error)}</div>;
    }

    let containerClasses = "modern-list vertical-layout layout-fill";
    if(className){
        containerClasses += " " + className;
    }
    if(tableKeys){
        containerClasses += " table-mode";
    }


    const displayItems = items.map((itemData, index) => { // itemData can be node wrapper, parent, or group header
        const itemUniqueId = itemData.id || `item-${index}`; // Ensure unique key
        const isSelected = itemData.node ? selection.get(itemData.node) || false : false; // Only node items can be selected

        // Handle rendering for different item types
        if (itemData.isGroupHeader) {
            // Simplified rendering for group header
            return tableKeys? (
                <tr key={itemUniqueId}  style={{columnSpan:'all'}}>
                    <td className={"modern-group-header"}>{itemData.title}</td>
                </tr>
            ) : (
                <div key={itemUniqueId} className={"modern-group-header"}>{itemData.title}</div>
            );
        }

        // Standard node item rendering
        const targetNode = itemData.node;
        const {entryRenderIcon, entryRenderFirstLine, entryRenderSecondLine, entryRenderActions} = props;

        const entryProps = {
            key: itemUniqueId,
            tabIndex:index+1,
            node: targetNode,
            onClick: (e) => handleItemClick(itemData, e),
            onDoubleClick: (e) => handleItemDoubleClick(itemData, e),
            selected: isSelected,
            entryRenderActions,
            entryRenderIcon,
            entryRenderFirstLine,
            entryRenderSecondLine
        };

        if (tableKeys) {
            return <ModernTableListEntry {...entryProps} tableKeys={tableKeys}  />;
        } else {
            if(entryRenderIcon) {
                entryProps.iconCell = entryRenderIcon(targetNode, {...itemData, parent: itemData.isParent});
            } else {
                entryProps.mainIcon = targetNode.isLeaf ? (targetNode.isLeaf() ? 'file-outline' : 'folder-outline') : 'cube-outline';
            }
            if(entryRenderFirstLine) {
                entryProps.firstLine = entryRenderFirstLine(targetNode)
            } else {
                entryProps.firstLine = targetNode.getLabel ? targetNode.getLabel() : 'Unknown Label';
            }
            if(entryRenderSecondLine) {
                entryProps.secondLine = entryRenderSecondLine(targetNode)
            } else if(targetNode.getMetadata && targetNode.getMetadata().get('ajxp_description')){
                entryProps.secondLine = targetNode.getMetadata().get('ajxp_description');
            }
            if(entryRenderActions) {
                entryProps.actions = entryRenderActions(targetNode)
            }
            return <ModernListEntry className={'modern-list-entry'} {...entryProps} />;
        }
    });

    console.log(displayItems)

    let coreContent;
    if (tableKeys) {
        coreContent = (
            <table>
                <SortColumns
                    pydio={pydio}
                    tableKeys={tableKeys}
                    sortingInfo={currentSortingInfo}
                    columnClicked={(data, callback) => {handleSortChange({...data, attribute:data.name}); callback()}}
                    onSortChange={handleSortChange}
                    displayMode={'th'}
                    actionColumn={true}
                />
                <tbody className="list-area" style={{ width: '100%'}} tabIndex={0} onKeyDown={handleKeyDown}>
                {displayItems}
                </tbody>
            </table>
        )
    } else {

        coreContent = (
            <div className="list-area" style={{ width: '100%'}} tabIndex={0} onKeyDown={handleKeyDown}>
                {displayItems}
            </div>
        );


    }

    return (
        <div ref={containerRef} className={containerClasses}>
            {emptyState && <EmptyStateView {...emptyState}/>}
            {!emptyState && coreContent}
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
    multiSelect: PropTypes.bool,
    selectOnClick: PropTypes.bool, // Whether clicking selects item (vs. only checkbox)

    // Action Callbacks
    entryHandleClicks: PropTypes.func, // (node, clickType, event)
    onClickItem: PropTypes.func, // (node, event) => void
    onDoubleClickItem: PropTypes.func, // (node, event) => void
    onContextMenuItem: PropTypes.func, // (node, event) => void (placeholder for context menu handling)

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
    sortingPreferenceKey: PropTypes.string, // Key to store/retrieve sorting preferences
    onSortingInfoChange: PropTypes.func, // (newSortingInfo) => void
    onColumnSort: PropTypes.func, // Replaced by handleSortChange
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
    multiSelect: true,
    defaultSortingInfo: {attribute:'label', sortType:'file-natural', direction:'asc'},
    emptyMessage: "No items found.", // Consider using Pydio.getMessages() for default
    // Pydio.getMessages().get("ui.empty", "pydio.sdk.react")
};

export { ModernSimpleList };
