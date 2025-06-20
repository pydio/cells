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