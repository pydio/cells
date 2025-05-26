import {useCallback, useMemo, useState} from 'react'

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

const prepareSortFunction = (sortingInfo) => {
    if (!sortingInfo || sortingInfo.remote) {
        return null;
    }
    const { attribute, direction = 'asc', sortType } = sortingInfo;

    if (sortType === 'file-natural' || attribute === 'label') { // Assuming 'label' implies natural sort
        return (a, b) => {
            if(!a || !a.node || !b || !b.node) {
                return 0
            }
            return sortNodesNatural(a.node, b.node, direction);
        }
    } else if (attribute) {
        return (a, b) => {
            if(!a || !a.node || !b || !b.node) {
                return 0
            }
            return nodesSorterByAttribute(a.node, b.node, attribute, direction, sortType);
        }
    }
    return null;
};


const nodeRemoteSortingInfo = (node) => {
    if (!node || !node.getMetadata) return null;
    const meta = node.getMetadata()
    if (meta.get('search_root') === true) {
        return -1;
    }
    const pagination = meta.get('paginationData') || new Map()
    const ordering = meta.get('remoteOrder') || new Map()
    if(pagination.get('total') > 1){
        if (ordering.has('order_column') && ordering.has('order_direction')) {
            return {
                remote: true,
                attribute:ordering.get('order_column'),
                direction:ordering.get('order_direction')
            };
        }
    }
    return null

}

const useSorting = ({dataModel, node, defaultSortingInfo}) => {
    const [currentSortingInfo, setCurrentSortingInfo] = useState(defaultSortingInfo || null);

    const sorter = useMemo(() => {
        if (!node || !dataModel) return null;
        if (nodeRemoteSortingInfo(node)) return null;
        return prepareSortFunction(currentSortingInfo);
    }, [node, dataModel, currentSortingInfo]);

    const handleSortChange = useCallback((columnDef) => {
        if (!node || !dataModel) return;

        const isRemoteSortable = columnDef.remoteSortAttribute && node.getMetadata && node.getMetadata().get("paginationData");
        let newSortingInfo;

        if (isRemoteSortable) {
            const currentRemoteSort = nodeRemoteSortingInfo(node);
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
                const map = new Map()
                map.set('order_column', columnDef.remoteSortAttribute);
                map.set('order_direction', newDir.toLowerCase());
                meta.set("remoteOrder", map);

            }
            // Inform PydioDataModel context has changed, triggering a reload if DM supports it
            // This part is tricky, as direct context change might not be the right API.
            // For now, we call handleReload. If PydioDataModel has a more specific API, it should be used.
            // Example: dataModel.requireContextChange(node, true);
            console.log('RELOAD CONTEXT')
            dataModel.requireContextChange(node, true);
            // Update state immediately to reflect remote sort intention, actual data comes on reload
            setCurrentSortingInfo(newSortingInfo);

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
                setCurrentSortingInfo(defaultSortingInfo);
            } else {
                const si = { attribute: newKey, direction: newDir, sortType: sortType, remote: false }
                setCurrentSortingInfo(si);
            }
        }

    }, [node, dataModel, currentSortingInfo]);

    return {currentSortingInfo, sorter, handleSortChange}

};

export {useSorting}