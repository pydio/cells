import {useCallback} from "react";


const useKeyNavigation = ({selection = new Map(), updateSelection, items = [], elementsPerLine = 1}) => {

    const handler = useCallback((e) => {
        if(!selection.size || !items.length ) {
            return;
        }
        const shiftKey = e.shiftKey;
        const key = e.key;

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
                let selection = [];
                for(let i=min; i<max+1; i++){
                    if(items[i]) {
                        newSelection.set(items[i].node, true)
                    }
                }
                updateSelection(newSelection)
            }
        } else if(items[selectionIndex] && items[selectionIndex].node){
            const newSelection = new Map()
            newSelection.set(items[selectionIndex].node, true)
            updateSelection(newSelection)
        }

    }, [items, elementsPerLine, selection, updateSelection])

    return {handler}
}

export {useKeyNavigation}