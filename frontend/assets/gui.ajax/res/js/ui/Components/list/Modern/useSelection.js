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

const useSelection = ({dataModel, multiSelect = true, filterSelectable = () => true}) => {
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

    const itemSelected = useCallback((items, item, event)=> {
        const newSelection = new Map(selection)
        const {node} = item
        if (multiSelect && event && event.shiftKey && lastSelectedNode) { // Ensure lastSelectedItem has a node
            const lastSelectedNodeId = lastSelectedNode.getPath();
            const currentClickedNodeId = item.node.getPath();

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

        } else if (multiSelect && event && (event.ctrlKey || event.metaKey)) {
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

    }, [dataModel, multiSelect, filterSelectable])

    return {selection, itemSelected, updateSelection}
}

export {useSelection}