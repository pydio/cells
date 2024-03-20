/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React, {useState, useEffect} from 'react'

// We use LayoutPreference instead of WorkspacePreference and assume that they are shared amongst workspaces
export default (name, def, pydio) => {
    if(!pydio) {
        pydio = Pydio.getInstance()
    }
    const {user} = pydio
    const [internal, setInternal] = useState(user.getLayoutPreference(name, def))
    const setWrapped = (value) => {
        user.setLayoutPreference(name, value)
        setInternal(value)
    }
    // Could be used to refresh if we switch to getWorkspacePreference
    useEffect(()=>{
        const observer = () => {
            const {user} = pydio
            const savedVal = user.getLayoutPreference(name)
            if(savedVal !== undefined) {
                setInternal(savedVal)
            }
        }
        pydio.observe('reload_layout_preferences', observer)
        return () => {
            pydio.stopObserving('reload_layout_preferences', observer)
        }
    }, [])

    return [internal, setWrapped]

}