/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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


export function sortNodesNatural(nodeA, nodeB) {
    // local:pinSort should be pinned to top
    if(nodeA.getMetadata().has('local:pinSort') && !nodeB.getMetadata().has('local:pinSort')){
        return -1;
    }
    if(nodeB.getMetadata().has('local:pinSort') && !nodeA.getMetadata().has('local:pinSort')){
        return 1;
    }
    // Recycle always last
    if(nodeA.isRecycle()) {
        return 1;
    }
    if(nodeB.isRecycle()) {
        return -1;
    }
    // Folders first
    const aLeaf = nodeA.isLeaf();
    const bLeaf = nodeB.isLeaf();
    let res = (aLeaf && !bLeaf ? 1 : ( !aLeaf && bLeaf ? -1 : 0));
    if (res === 0) {
        return nodeA.getLabel().localeCompare(nodeB.getLabel(), undefined, {numeric: true});
    } else {
        return res;
    }
}

export function nodesSorterByAttribute(attribute, sortType, direction) {

    return function (nodeA, nodeB) {
        // local:pinSort should be pinned to top
        if(nodeA.getMetadata().has('local:pinSort') && !nodeB.getMetadata().has('local:pinSort')){
            return -1;
        }
        if(nodeB.getMetadata().has('local:pinSort') && !nodeA.getMetadata().has('local:pinSort')){
            return 1;
        }
        let res;
        if(sortType === 'number'){
            let aMeta = nodeA.getMetadata().get(attribute) || 0;
            let bMeta = nodeB.getMetadata().get(attribute) || 0;
            aMeta = parseFloat(aMeta);
            bMeta = parseFloat(bMeta);
            res  = (direction === 'asc' ? aMeta - bMeta : bMeta - aMeta);
        }else if(sortType === 'string'){
            let aMeta = nodeA.getMetadata().get(attribute) || "";
            let bMeta = nodeB.getMetadata().get(attribute) || "";
            res = (direction === 'asc'? aMeta.localeCompare(bMeta) : bMeta.localeCompare(aMeta));
        }
        if(res === 0){
            // Resort by label to make it stable
            let labComp = nodeA.getLabel().localeCompare(nodeB.getLabel(), undefined, {numeric: true});
            res = (direction === 'asc' ? labComp : -labComp);
        }
        return res;

    }

}