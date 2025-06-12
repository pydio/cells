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

import {useCallback, useEffect, useState} from 'react'

const extractFromDM = (dataModel) => {
    const newSelection = new Map()
    if(!dataModel) {
        return newSelection
    }
    dataModel.getSelectedNodes().forEach((node) => {
        newSelection.set(node, true)
    })
    return newSelection;

}

const useSelection = ({dataModel, filterSelectable = () => true}) => {
    const [selection, _setSelection] = useState(extractFromDM(dataModel)); // Holds the selection state. Key: item unique ID, Value: boolean or item itself
    const [lastSelectedNode, setLastSelectedNode] = useState(null); // For shift-click range selection

    useEffect(() => {
        if(!dataModel) {
            return;
        }
        // Observe DM
        const observer = () => {
            _setSelection(extractFromDM(dataModel))
        }
        dataModel.observe('selection_changed', observer)
        return () => {
            dataModel.stopObserving('selection_changed', observer)
        }
    }, [dataModel]);

    const updateSelection = useCallback((newSelectionMap, lastSelected = null) => {
        _setSelection(newSelectionMap);
        if (lastSelected) { // lastSelected is the item object itself
            setLastSelectedNode(lastSelected);
        }
        const selectedNodes = [];
        newSelectionMap.forEach((isSelected, node) => { // Assuming Map<itemObject, boolean>
            if (isSelected) {
                selectedNodes.push(node);
            }
        });
        dataModel.setSelectedNodes(selectedNodes)
    }, [dataModel]);

    const updateSelectionFromItemEvent = useCallback((items, item, event)=> {
        const newSelection = new Map(selection)
        const {node} = item
        if (event && event.shiftKey && lastSelectedNode) { // Ensure lastSelectedItem has a node
            const lastSelectedNodeId = lastSelectedNode.getPath();
            const currentClickedNodeId = node.getPath();

            // Find actual PydioNode items in the current `items` list for range selection
            const selectableItems = items.filter(filterSelectable);
            const lastSelectedIndex = selectableItems.findIndex(it => it.node.getPath() === lastSelectedNodeId);
            const currentIndex = selectableItems.findIndex(it => it.node.getPath() === currentClickedNodeId);

            if (lastSelectedIndex !== -1 && currentIndex !== -1) {
                const start = Math.min(lastSelectedIndex, currentIndex);
                const end = Math.max(lastSelectedIndex, currentIndex);
                selectableItems.slice(start, end + 1).forEach(it => {
                    newSelection.set(it.node, true); // Store the item wrapper from `items` list
                });
            } else {
                newSelection.set(node, !newSelection.get(node));
            }
            updateSelection(newSelection, node);

        } else if (event && (event.ctrlKey || event.metaKey)) {
            if (newSelection.has(node)) {
                newSelection.set(node, !newSelection.get(node));
            } else {
                newSelection.set(node, true);
            }
            updateSelection(newSelection, node);
        } else {
            newSelection.clear();
            newSelection.set(node, true);
            updateSelection(newSelection, node);
        }

    }, [dataModel, filterSelectable])

    return {selection, updateSelection, updateSelectionFromItemEvent}
}

export {useSelection}