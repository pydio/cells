import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import {useLocalSorting} from "./useSorting";
import SortColumns from "../SortColumns";
import {useKeyNavigation} from "./useKeyNavigation";

// Placeholder for AutoSizer (can be replaced with a proper import later)
const AutoSizer = ({ children, defaultHeight = 300, defaultWidth = '100%' }) => {
    // In a real scenario, this would measure parent dimensions
    // For this shell, we just pass through children with default dimensions
    return children({ height: defaultHeight, width: defaultWidth });
};

// Placeholder for other internal components
const EmptyStateView = (props) => <div className="empty-state-view-placeholder">{props.title || 'EmptyStateView Placeholder'}</div>;


const ModernSimpleList = (props) => {
    const {
        node,
        dataModel: propsDataModel,
        skipInternalDataModel,
        elementHeight,
        tableKeys,
        sortingInfo: controlledSortingInfo,
        defaultSortingInfo,
        sortingPreferenceKey,
        onSelectionChange,
        onSortingInfoChange,
        clearSelectionOnReload,
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

    const [internalDm, setInternalDm] = useState(null); // internalDm is effectively props.dataModel or a new PydioDataModel

    // Initialize sortingInfo state: use controlled prop if available, else internal state.
    const [currentSortingInfo, _setCurrentSortingInfo] = useState(controlledSortingInfo || defaultSortingInfo || null);


    // Refs
    const listRef = useRef(null); // For Infinite list or other direct manipulations
    const containerRef = useRef(null); // For the main container div

    // 1. internalDataModel (internalDm) State Management
    useEffect(() => {
        if (skipInternalDataModel) {
            setInternalDm(propsDataModel);
        } else {
            // Create new internalDm if none exists or if the external propsDataModel instance changes
            if (!internalDm || (propsDataModel && internalDm.getId() !== propsDataModel.getId())) {
                const newInstance = new PydioDataModel();
                if (propsDataModel && propsDataModel.getContextNode()) {
                    newInstance.setRootNode(propsDataModel.getContextNode());
                    newInstance.setContextNode(propsDataModel.getContextNode());
                }
                setInternalDm(newInstance);
            }
        }
    }, [propsDataModel, skipInternalDataModel, internalDm]); // internalDm added to prevent re-creation if not necessary

    // 2. currentSortingInfo State Management
    const setCurrentSortingInfoAndUpdatePrefs = useCallback((newSortingInfo) => {
        _setCurrentSortingInfo(newSortingInfo); // Update internal state
        if (onSortingInfoChange) {
            onSortingInfoChange(newSortingInfo);
        }
        if (sortingPreferenceKey && pydio.user) { // Ensure pydio.user is available
            pydio.user.setLayoutPreference(sortingPreferenceKey, newSortingInfo);
        }
    }, [onSortingInfoChange, sortingPreferenceKey]);

    useEffect(() => {
        // Reflect controlled sorting info changes
        if (controlledSortingInfo !== undefined) {
            if (JSON.stringify(currentSortingInfo) !== JSON.stringify(controlledSortingInfo)) {
                _setCurrentSortingInfo(controlledSortingInfo);
            }
        }
    }, [controlledSortingInfo, currentSortingInfo]);

    useEffect(() => {
        // Load sorting preferences on mount or if sortingPreferenceKey changes
        if (sortingPreferenceKey && pydio.user && controlledSortingInfo === undefined) { // Only if not controlled
            const savedSortingInfo = pydio.user.getLayoutPreference(sortingPreferenceKey, defaultSortingInfo);
            if (savedSortingInfo && JSON.stringify(savedSortingInfo) !== JSON.stringify(currentSortingInfo)) {
                _setCurrentSortingInfo(savedSortingInfo); // Update only if different
            }
        }
    }, [sortingPreferenceKey, defaultSortingInfo, controlledSortingInfo, currentSortingInfo]);



    const {sorter} = useLocalSorting({sortingInfo:currentSortingInfo})

    // buildDisplayElements Function (replaces and expands processAndSetItems)
    const buildDisplayElements = useCallback(() => {
        if (!internalDm || !node || !node.isLoaded()) {
            if (node && typeof node.getChildren !== 'function') {
                console.warn("Node object does not have getChildren method", node);
                setError(new Error("Invalid node structure: missing getChildren."));
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

        const filteredChildren = filterNodes ? rawChildren.filter(child => filterNodes(child, internalDm)) : rawChildren;

        // Wrap children as items { node: PydioNode } for consistent sorting/grouping input
        let processedItems = filteredChildren.map(childNode => ({ node: childNode, id: childNode.getPath() }));

        // 1. Sorting
        if (currentSortingInfo && !currentSortingInfo.remote) { // Apply local sort
            if (sorter) {
                processedItems.sort(sorter);
            }
        }

        let finalDisplayItems = [];

        // 2. Parent Navigation
        if (!skipParentNavigation && node.getParent && node.getParent()) {
            const parentNode = node.getParent();
            finalDisplayItems.push({ isParent: true, node: parentNode, id: '..parent', label: '..' });
        }

        // 3. Grouping
        if (defaultGroupBy && processedItems.length > 0) {
            const groups = new Map();
            processedItems.forEach(item => {
                let groupValue;
                if(groupByValueFunc) {
                    groupValue = groupByValueFunc(item.node.getMetadata().get(defaultGroupBy)) || 'N/A'
                } else {
                    groupValue = item.node.getMetadata().get(defaultGroupBy) || 'N/A';
                }
                //const groupValue = item.node.getMetadata ? item.node.getMetadata().get(defaultGroupBy) : 'Undefined';
                if (!groups.has(groupValue)) {
                    groups.set(groupValue, []);
                }
                groups.get(groupValue).push(item);
            });

            if (groupSkipUnique && groups.size === 1) {
                finalDisplayItems.push(...processedItems); // Add items directly without group header
            } else {
                new Map([...groups.entries()].sort()).forEach((groupItems, groupValue) => {
                    let groupTitle = groupValue;
                    if (groupByLabel && pydio.MessageHash && pydio.MessageHash[groupByLabel + '.' + groupValue]) {
                        groupTitle = pydio.MessageHash[groupByLabel + '.' + groupValue];
                    } else if (renderGroupLabels && typeof renderGroupLabels === 'function') {
                        groupTitle = renderGroupLabels(defaultGroupBy, groupValue, groupItems);
                    }
                    finalDisplayItems.push({ isGroupHeader: true, id: `group_header_${groupValue}`, title: groupTitle, value: groupValue });
                    finalDisplayItems.push(...groupItems);
                });
            }
        } else {
            finalDisplayItems.push(...processedItems);
        }

        //console.log(finalDisplayItems)
        setItems(finalDisplayItems);
        setIsLoading(false);
    }, [
        internalDm, node, filterNodes, currentSortingInfo, skipParentNavigation, defaultGroupBy, groupSkipUnique, groupByLabel, renderGroupLabels, groupByValueFunc
    ]);


    // Node Event Observation (useEffect)
    useEffect(() => {
        if (!internalDm || !node || !observeNodeReload || typeof node.observe !== 'function' || typeof node.stopObserving !== 'function') {
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
    }, [internalDm, node, buildDisplayElements, observeNodeReload]);


    // Initial Data Load (useEffect)
    useEffect(() => {
        if (!internalDm || !node ) {
            setIsLoading(false);
            return;
        }

        if (typeof node.isLoaded !== 'function' || typeof node.load !== 'function') {
            console.warn("Node object does not have isLoaded/load methods", node);
            setError(new Error("Invalid node structure: missing isLoaded/load."));
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
    }, [internalDm, node, buildDisplayElements]);

    // Remote Sorting Detection
    const getRemoteSortingInfo = useCallback((currentNode) => {
        if (!currentNode || !currentNode.getMetadata) return null;
        const meta = currentNode.getMetadata();
        if (meta.get("remoteOrder")) {
            const remoteOrder = meta.get("remoteOrder");
            return {
                attribute: remoteOrder.order_column,
                direction: remoteOrder.order_direction.toLowerCase(),
                remote: true
            };
        }
        // Check paginationData for sorting info (simplified from SimpleList)
        const paginationData = meta.get("paginationData");
        if (paginationData && paginationData.sort_field) {
            return {
                attribute: paginationData.sort_field,
                direction: (paginationData.sort_dir || "asc").toLowerCase(),
                remote: true
            };
        }
        return null;
    }, []);

    useEffect(() => {
        if (node) {
            const remoteSort = getRemoteSortingInfo(node);
            if (remoteSort) {
                // Check if it's different from current to avoid loops if setCurrentSortingInfoAndUpdatePrefs is not careful
                if(JSON.stringify(remoteSort) !== JSON.stringify({attribute: currentSortingInfo.attribute, direction: currentSortingInfo.direction, remote: currentSortingInfo.remote})) {
                    setCurrentSortingInfoAndUpdatePrefs(remoteSort);
                }
            } else if (currentSortingInfo && currentSortingInfo.remote) {
                // Remote sort was active, but no longer detected on the node. Clear it.
                // This might default to user prefs or defaultSort.
                const defaultSort = pydio.user ? pydio.user.getLayoutPreference(sortingPreferenceKey, defaultSortingInfo) : defaultSortingInfo;
                setCurrentSortingInfoAndUpdatePrefs(defaultSort || { attribute: null, direction: null, remote: false });
            }
        }
    }, [node, getRemoteSortingInfo, setCurrentSortingInfoAndUpdatePrefs, currentSortingInfo, sortingPreferenceKey, defaultSortingInfo]);



    // Memoized element height calculation
    const computedElementHeight = useMemo(() => {
        if (typeof elementHeight === 'number') {
            return elementHeight;
        }
        if (tableKeys && elementHeight && elementHeight.table) {
            return elementHeight.table;
        }
        if (!tableKeys && elementHeight && elementHeight.list) {
            return elementHeight.list;
        }
        return 50; // Default fallback
    }, [elementHeight, tableKeys]);


    // handleSortChange (replaces onColumnSort from SimpleList)
    const handleSortChange = useCallback((columnDef) => {
        if (!node || !internalDm) return;

        const isRemoteSortable = columnDef.remoteSortAttribute && node.getMetadata && node.getMetadata().get("paginationData");
        let newSortingInfo;

        if (isRemoteSortable) {
            const currentRemoteSort = getRemoteSortingInfo(node);
            let newDir = 'asc';
            let clear = false
            if (currentRemoteSort && currentRemoteSort.attribute === columnDef.remoteSortAttribute) {
                if(currentRemoteSort.direction === 'asc') {
                    newDir = 'desc';
                } else if (currentRemoteSort.direction === 'desc') {
                    clear = true
                }
            }

            // Update node metadata for remote sort
            const meta = node.getMetadata();
            if(clear) {
                newSortingInfo = null;
                meta.delete("remoteOrder");
            } else {
                newSortingInfo = { attribute: columnDef.remoteSortAttribute, direction: newDir, remote: true };
                meta.set("remoteOrder", {
                    order_column: columnDef.remoteSortAttribute,
                    order_direction: newDir.toLowerCase() // Assuming server expects lowercase
                });

            }
            // Inform PydioDataModel context has changed, triggering a reload if DM supports it
            // This part is tricky, as direct context change might not be the right API.
            // For now, we call handleReload. If PydioDataModel has a more specific API, it should be used.
            // Example: internalDm.requireContextChange(node, true);
            internalDm.requireContextChange(node, true);
            // Update state immediately to reflect remote sort intention, actual data comes on reload
            setCurrentSortingInfoAndUpdatePrefs(newSortingInfo);

        } else { // Local Sort
            if (node.getMetadata && node.getMetadata().get("remoteOrder")) {
                node.getMetadata().clear("remoteOrder"); // Clear remote sort if switching to local
            }

            let newKey = columnDef.sortAttribute || columnDef.attribute;
            let newDir = 'asc';
            let clear = false;
            const sortType = columnDef.sortType || 'string';

            if (currentSortingInfo && currentSortingInfo.attribute === newKey && !currentSortingInfo.remote) {
                if(currentSortingInfo.direction === 'asc') {
                    newDir = 'desc'
                } else {
                    clear = true
                }
            }
            if (clear) {
                setCurrentSortingInfoAndUpdatePrefs(defaultSortingInfo);
            } else {
                const si = { attribute: newKey, direction: newDir, sortType: sortType, remote: false }
                console.log('sortingInfo', si)
                setCurrentSortingInfoAndUpdatePrefs(si);
            }
        }

    }, [node, internalDm, currentSortingInfo, getRemoteSortingInfo, setCurrentSortingInfoAndUpdatePrefs]);


    // This effect ensures buildDisplayElements is called when local sorting changes
    useEffect(() => {
        if(currentSortingInfo && !currentSortingInfo.remote && node && node.isLoaded()){
            buildDisplayElements();
        }
    }, [currentSortingInfo, buildDisplayElements, node]);


    const {selection, updateSelection, itemSelected} = useSelection({
        dataModel:internalDm,
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

    // Render logic
    const showLoading = isLoading && (!node || (typeof node.isLoaded === 'function' ? !node.isLoaded() : true));

    if (showLoading) {
        return <div ref={containerRef} className="modern-simple-list loading">Loading... (Loading: {isLoading.toString()}, Node: {node ? (node.isLoaded ? node.isLoaded().toString() : 'no isLoaded') : 'no'})</div>;
    }

    if (error && !items.length) { // Show error prominently if no items are displayed
        return <div ref={containerRef} className="modern-simple-list error">{error.message || String(error)}</div>;
    }

    let containerClasses = "material-list vertical-layout layout-fill";
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
            if (itemData.isParent) {
                // Simplified rendering for parent, could be a specific component
                return (
                    <div key={itemUniqueId} onClick={(e) => handleItemClick(itemData, e)} style={{padding: '8px', cursor: 'pointer'}}>
                        <FontIcon className="mdi mdi-arrow-up-bold-circle-outline" style={{marginRight: '8px'}}/>
                        {itemData.label || '..'}
                    </div>
                );
            }
            if (itemData.isGroupHeader) {
                // Simplified rendering for group header
                return (
                    <div key={itemUniqueId} style={{padding: '8px', /*backgroundColor: theme.palette.grey[200], */fontWeight: 'bold'}}>
                        {itemData.title}
                    </div>
                );
            }

            // Standard node item rendering
            const targetNode = itemData.node;
            if (!targetNode) return null; // Should not happen if data structure is correct

            const entryProps = {
                key: itemUniqueId,
                tabIndex:index+1,
                node: targetNode,
                elementHeight: computedElementHeight,
                onClick: (e) => handleItemClick(itemData, e),
                onDoubleClick: (e) => handleItemDoubleClick(itemData, e),
                selected: isSelected,
            };

            if (tableKeys) {
                return <ModernTableListEntry {...entryProps} tableKeys={tableKeys} />;
            } else {
                const {entryRenderIcon, entryRenderFirstLine, entryRenderSecondLine, entryRenderActions} = props;
                if(entryRenderIcon) {
                    entryProps.iconCell = entryRenderIcon(targetNode);
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
                return <ModernListEntry className={'material-list-entry'} {...entryProps} />;
            }
        });

    if (tableKeys) {
        return (
            <div ref={containerRef} className={containerClasses.replace('table-mode', '')} style={{backgroundColor:'white'}}>
                <table>
                    <SortColumns
                        pydio={pydio}
                        tableKeys={tableKeys}
                        sortingInfo={currentSortingInfo}
                        columnClicked={(data, callback) => {handleSortChange({...data, attribute:data.name}); callback()}}
                        onSortChange={handleSortChange}
                        displayMode={'th'}
                    />

                    {items.length === 0 && !isLoading && (
                        <EmptyStateView title={props.emptyMessage || (pydio.MessageHash && pydio.MessageHash["ui.empty"] ? pydio.MessageHash["ui.empty"] : "No items to display")} />
                    )}

                    {items.length > 0 && (
                        <tbody className="list-area" style={{ width: '100%'}} tabIndex={0} onKeyDown={handleKeyDown}>
                        {displayItems}
                        </tbody>
                    )}
                </table>
            </div>
        )
    } else {

        return (
            <div ref={containerRef} className={containerClasses} style={{backgroundColor:'white'}}>
                {items.length === 0 && !isLoading && (
                    <EmptyStateView title={props.emptyMessage || (pydio.MessageHash && pydio.MessageHash["ui.empty"] ? pydio.MessageHash["ui.empty"] : "No items to display")} />
                )}
                {items.length > 0 && !tableKeys && (
                    <div className="list-area" style={{ width: '100%', height: '100%' }} tabIndex={0} onKeyDown={handleKeyDown}>
                        {displayItems}
                    </div>
                )}
            </div>
        );


    }
};

ModernSimpleList.propTypes = {
    // Data related props
    node: PropTypes.object, // Current Pydio node whose children are to be listed (can be null for root or specific data sources)
    dataModel: PropTypes.instanceOf(PydioDataModel),
    items: PropTypes.array, // Alternative to dataModel, for directly passing items
    filterNodes: PropTypes.func, // (nodes, filterString) => filteredNodes // Implemented in processAndSetItems

    // Behavior props
    skipInternalDataModel: PropTypes.bool,
    defaultGroupBy: PropTypes.string, // Implemented in buildDisplayElements
    groupSkipUnique: PropTypes.bool, // Implemented
    groupByLabel: PropTypes.string, // Implemented
    renderGroupLabels: PropTypes.func, // Implemented
    groupByValueFunc: PropTypes.func, // Implemented
    clearSelectionOnReload: PropTypes.bool, // Implemented
    selectFirstRowOnLoad: PropTypes.bool,
    loadDataOnMount: PropTypes.bool, // Implemented by initial load effect
    forceReloadId: PropTypes.string, // Change to trigger reload

    // Display & Interaction props
    elementHeight: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({ list: PropTypes.number, table: PropTypes.number }),
    ]).isRequired,
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
    skipInternalDataModel: false,
    clearSelectionOnReload: true,
    selectFirstRowOnLoad: false,
    loadDataOnMount: true,
    elementHeight: 50, // Simplified default, computedElementHeight handles object form.
    multiSelect: true,
    selectOnClick: true,
    defaultSortingInfo: {attribute:'label', sortType:'file-natural', direction:'asc'},
    emptyMessage: "No items found.", // Consider using Pydio.getMessages() for default
    // Pydio.getMessages().get("ui.empty", "pydio.sdk.react")
};

export { ModernSimpleList };
