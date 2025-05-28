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

import React, {useCallback, useEffect, useMemo, useState} from 'react'

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

    console.log(attribute, direction, sortType, valA, valB)

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
        if (typeof valA === 'string' && typeof valB === 'undefined') valB = '';
        if (typeof valB === 'string' && typeof valA === 'undefined') valA = '';
    }

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

const useSortingControlled = ({sortingInfo, onSortingInfoChanged, dataModel, node, defaultSortingInfo}) => {

    const sorter = useMemo(() => {
        if (!node || !dataModel) return null;
        if (nodeRemoteSortingInfo(node)) return null;
        return prepareSortFunction(sortingInfo);
    }, [node, dataModel, sortingInfo]);

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
            dataModel.requireContextChange(node, true);
            // Update state immediately to reflect remote sort intention, actual data comes on reload
            onSortingInfoChanged(newSortingInfo);

        } else { // Local Sort
            if (node.getMetadata && node.getMetadata().get("remoteOrder")) {
                node.getMetadata().clear("remoteOrder"); // Clear remote sort if switching to local
            }

            let newKey = columnDef.sortAttribute || columnDef.attribute;
            let newDir = 'asc';
            let clear = false;
            const sortType = columnDef.sortType || 'string';

            if (sortingInfo && sortingInfo.attribute === newKey && !sortingInfo.remote) {
                if(sortingInfo.direction === 'asc') {
                    newDir = 'desc'
                } else {
                    clear = true
                }
            }
            if (clear) {
                onSortingInfoChanged(defaultSortingInfo);
            } else {
                const si = { attribute: newKey, direction: newDir, sortType: sortType, remote: false }
                onSortingInfoChanged(si);
            }
        }

    }, [node, dataModel, sortingInfo]);

    return {sorter, handleSortChange}

};

const useSorting = ({dataModel, node, defaultSortingInfo, onSortingInfoChanged}) => {
    const [currentSortingInfo, setCurrentSortingInfo] = useState(defaultSortingInfo || null);
    useEffect(() => {
        if(onSortingInfoChanged) {
            onSortingInfoChanged(currentSortingInfo)
        }
    }, [currentSortingInfo, onSortingInfoChanged]);

    const data = useSortingControlled({
        sortingInfo:currentSortingInfo,
        onSortingInfoChanged:setCurrentSortingInfo,
        dataModel,
        node,
        defaultSortingInfo
    })
    return {...data, currentSortingInfo}
}

const useSortingColumns = ({columns, sortingInfo, onSortingInfoChanged}) => {
    const listColumns = useCallback((as) => {

        const dataStatus = (key, data, inputClass) => {
            let icon;
            //let className = 'cell header_cell cell-' + key;
            let className = inputClass || '';
            let isActive;
            if(data['sortType']){
                className += ' sortable';
                if(sortingInfo && ( sortingInfo.attribute === key || (sortingInfo.remote && data.remoteSortAttribute && sortingInfo.attribute === data.remoteSortAttribute))){
                    if(data['sortType'] === 'number') {
                        icon = sortingInfo.direction === 'asc' ? 'mdi mdi-sort-numeric-ascending' : 'mdi mdi-sort-numeric-descending';
                    } else {
                        icon = sortingInfo.direction === 'asc' ? 'mdi mdi-sort-alphabetical-ascending' : 'mdi mdi-sort-alphabetical-descending';
                    }
                    className += ' active-sort-' + sortingInfo.direction;
                    isActive = true
                }
            }
            return {icon, className, isActive}
        }

        let userMetas = []
        let allKeys = {...columns}
        if(typeof as === 'string' && as === 'menu_data') {
            Object.keys(allKeys).filter(key => key.indexOf('usermeta-') === 0).forEach(k => {
                userMetas.push({...allKeys[k], name: k})
                delete (allKeys[k])
            })
        }

        const entries = Object.keys(allKeys).map(key => {
            let data = allKeys[key];
            const {icon, className, isActive} = dataStatus(key, data)
            let onClick = () => {}
            if(data.sortType) {
                onClick = () => onSortingInfoChanged({...data, attribute: key, name:key})
            }

            switch (typeof as) {
                case 'string':
                    if(as === 'menu') {
                        data['name'] = key;
                        return {
                            payload: data,
                            text: data['label'],
                            iconClassName: icon
                        }
                    }else if(as === 'menu_data') {
                        return {
                            name: (
                                <span style={{display: 'flex'}}>
                            <span style={{flex: 1, fontWeight: isActive ? 500 : 'inherit'}}>{data['label']}</span>
                                    {isActive && <span className={'mdi mdi-checkbox-marked-circle-outline'}/>}
                        </span>),
                            callback: onClick,
                            icon_class: icon || 'mdi mdi-sort'// (data['sortType'] === 'number' ? 'mdi mdi-sort-numeric':'mdi mdi-sort-alphabetical')// '__INSET__'
                        }
                    }
                    break
                case 'function':
                    return as(data, className, onClick)
            }
        })

        if(userMetas.length) {
            entries.push({
                name: pydio.MessageHash['ajax_gui.sorter.metas.more'],
                icon_class: 'mdi mdi-tag-multiple-outline',
                subMenu:userMetas.map(meta => {
                    const {icon, className, isActive} = dataStatus(meta.name, meta)
                    const label = (
                        <span style={{display:'flex'}}>
                            <span style={{flex:1, fontWeight:isActive?500:'inherit'}}>{meta['label']}</span>
                            {isActive && <span className={'mdi mdi-checkbox-marked-circle-outline'}/>}
                        </span>
                    )
                    return {
                        text: label,
                        iconClassName:icon || 'mdi mdi-tag-outline',
                        payload:() => {this.onHeaderClick(meta.name, callback)}
                    }
                })
            })
        }

        return entries;

    }, [columns, sortingInfo, onSortingInfoChanged])

    return {listColumns}
}

export {useSorting, useSortingColumns, useSortingControlled}