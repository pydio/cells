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

import {useCallback, useEffect, useState} from "react";
import {useSorting, useSortingControlled} from "./useSorting";
import {useGrouping} from "./useGrouping";
import {useNodeReloadCallback} from "./useNodeReloadCallback";
import {useSelection} from "./useSelection";

const useItems = ({
      node,
      dataModel,
//      defaultSortingInfo,
//      onSortingInfoChanged,
      sortingInfo,
      handleSortChange,
      filterNodes,
      autoLoadNode,
      observeNodeReload,
      skipParentNavigation,
      defaultGroupBy,
      groupSkipUnique,
      groupByLabel,
      renderGroupLabels,
      groupByValueFunc,
}) => {

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

//    const {currentSortingInfo, sorter:localSorter, handleSortChange} = useSorting({dataModel, node, defaultSortingInfo, onSortingInfoChanged})
    const currentSortingInfo = sortingInfo
    const {sorter:localSorter} = useSortingControlled({dataModel, node, sortingInfo, onSortingInfoChanged:handleSortChange})

    const grouper = useGrouping({defaultGroupBy, groupSkipUnique, groupByLabel, renderGroupLabels, groupByValueFunc})

    // buildItems Function (replaces and expands processAndSetItems)
    const buildItems = useCallback(() => {
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
    useNodeReloadCallback({
        dataModel,
        node,
        observeNodeReload,
        setIsLoading,
        setError,
        autoLoadNode,
        callback:buildItems,
    })


    // This effect ensures buildItems is called when local sorting changes
    useEffect(() => {
        if(currentSortingInfo && !currentSortingInfo.remote && node && node.isLoaded()){
            buildItems();
        }
    }, [currentSortingInfo, buildItems, node]);


    const {selection, updateSelection, updateSelectionFromItemEvent} = useSelection({
        dataModel:dataModel,
        filterSelectable: (it)=>{return (it.node && !it.isParent && !it.isGroupHeader)}
    });

    return {items, isLoading, error, selection, updateSelection, updateSelectionFromItemEvent, currentSortingInfo, handleSortChange }
}

export {useItems}