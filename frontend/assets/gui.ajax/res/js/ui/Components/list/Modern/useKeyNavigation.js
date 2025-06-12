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

import {useCallback} from "react";

const useKeyNavigation = ({selection = new Map(), updateSelection, items = [], elementsPerLine = 1, fireDeleteCallback, fireEnterCallback}) => {

    const handler = useCallback((e) => {
        if(!selection.size || !items.length ) {
            return;
        }
        const shiftKey = e.shiftKey;
        const key = e.key;

        const first = items.find((it) => selection.get(it.node))
        if (key === 'Enter' && fireEnterCallback && first) {
            fireEnterCallback(first, e)
            e.stopPropagation()
            e.preventDefault()
            return
        } else if (key === 'Delete' && fireDeleteCallback && first) {
            fireDeleteCallback(first, e);
            e.stopPropagation()
            e.preventDefault()
        }

        let currentSelectionItems = items.filter(it => selection.get(it.node))
        const currentIndexStart = items.findIndex(it => it === currentSelectionItems[0])
        const currentIndexEnd = items.findIndex(it => it === currentSelectionItems[currentSelectionItems.length - 1])
        let maxIndex = items.length - 1;

        let selectionIndex;
        const increment = (key === 'PageDown' || key === 'PageUp' ? 10 : 1);
        switch (key){
            case 'ArrowDown':
            case 'PageDown':
                selectionIndex = Math.min(currentIndexEnd + elementsPerLine * increment, maxIndex);
                break
            case 'ArrowUp':
            case 'PageUp':
                selectionIndex = Math.max(currentIndexStart - elementsPerLine * increment, 0);
                break
            case 'Home':
                selectionIndex = 0;
                break;
            case 'End':
                selectionIndex = maxIndex
                break;
        }
        if(elementsPerLine > 1){
            if(key === 'ArrowRight'){
                selectionIndex = currentIndexEnd + 1;
            }else if(key === 'ArrowLeft'){
                selectionIndex = currentIndexStart - 1;
            }
        }
        if(shiftKey && selectionIndex !== undefined){
            const newSelection = new Map(selection)
            const min = Math.min(currentIndexStart, currentIndexEnd, selectionIndex);
            const max = Math.max(currentIndexStart, currentIndexEnd, selectionIndex);
            if(min !== max){
                for(let i=min; i<max+1; i++){
                    if(items[i]) {
                        newSelection.set(items[i].node, true)
                    }
                }
                updateSelection(newSelection)
                e.stopPropagation()
                e.preventDefault()
            }
        } else if(items[selectionIndex] && items[selectionIndex].node){
            const newSelection = new Map()
            newSelection.set(items[selectionIndex].node, true)
            updateSelection(newSelection)
            e.stopPropagation()
            e.preventDefault()
        }

    }, [items, elementsPerLine, selection, updateSelection, fireEnterCallback, fireDeleteCallback])

    return {handleKeyDown: handler}
}

export {useKeyNavigation}