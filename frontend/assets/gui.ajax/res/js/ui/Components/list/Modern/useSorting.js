import React, {useCallback} from 'react'

const sortNodesNatural = (nodeA, nodeB, direction) => {
    // Always push recycle to bottom
    if(nodeA.isRecycle()) {
        return 1
    } else if (nodeB.isRecycle()) {
        return -1;
    }
    // If same type
    if(nodeA.isLeaf() === nodeB.isLeaf()) {
        const labelA = nodeA.getLabel ? nodeA.getLabel().toLowerCase() : '';
        const labelB = nodeB.getLabel ? nodeB.getLabel().toLowerCase() : '';
        if (labelA < labelB) return direction === 'asc' ? -1 : 1;
        if (labelA > labelB) return direction === 'asc' ? 1 : -1;
        return 0;
    } else  {
        // Folders first
        return nodeA.isLeaf() ? 1 : -1;
    }
};

const nodesSorterByAttribute = (nodeA, nodeB, attribute, direction, sortType) => {
    const metaA = nodeA.getMetadata();
    const metaB = nodeB.getMetadata();
    let valA = metaA ? metaA.get(attribute) : undefined;
    let valB = metaB ? metaB.get(attribute) : undefined;

    // Basic type handling
    if(sortType === 'number') {
        valA = parseFloat(valA)
        valB = parseFloat(valB)
        if (isNaN(valA)) {
            valA = 0
        }
        if (isNaN(valB)) {
            valB = 0
        }
    } else {
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (typeof valA === 'number' && typeof valB === 'undefined') valB = 0;
        if (typeof valB === 'number' && typeof valA === 'undefined') valA = 0;
    }

    console.log(valA, valB, typeof valA, typeof valB)
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
};


const useLocalSorting = ({sortingInfo}) => {

    const prepareSortFunction = useCallback((sortingInfo) => {
        if (!sortingInfo || sortingInfo.remote) {
            return null;
        }
        const { attribute, direction = 'asc', sortType } = sortingInfo;

        if (sortType === 'file-natural' || attribute === 'label') { // Assuming 'label' implies natural sort
            return (a, b) => sortNodesNatural(a.node, b.node, direction);
        } else if (attribute) {
            return (a, b) => nodesSorterByAttribute(a.node, b.node, attribute, direction, sortType);
        }
        return null;
    }, [sortingInfo]);

    const sorter = prepareSortFunction(sortingInfo)
    return {sorter}

}

export {useLocalSorting}