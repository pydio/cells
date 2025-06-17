import Pydio from 'pydio'
import {useCallback, useMemo} from 'react'
import {MdOpenInBrowser, MdOutlineFolderOpen} from "react-icons/md";

export const useSingleNodeActions = ({node, isCurrentFolder}) => {

    const items = useMemo(() =>  {
        const it = []
        if(!node) {
            return it
        }
        if(node.isLeaf()) {
            it.push({value:'open', title: 'Open...', icon: MdOpenInBrowser})
            it.push({value:'goto', title: 'Open Parent', icon: MdOutlineFolderOpen})
        } else {
            it.push({value:'goto', title: 'Open Folder', icon: MdOutlineFolderOpen})
        }
        return it;
    }, [node])

    const menuHandler = useCallback((value) => {
        if(!node) {
            return
        }
        switch (value) {
            case 'open':
                Pydio.getInstance().UI.openCurrentSelectionInEditor(null, node);
                break
            case 'goto':
                Pydio.getInstance().goTo(node)
                break
        }
    }, [node])

    return {
        title:'Actions',
        values:items,
        onValueSelected:menuHandler
    }
}