/*
 * Copyright 2026 Abstrium SAS <team (at) pyd.io>
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

import React, {useCallback} from 'react'
import {Menu, MenuItem} from 'material-ui';
import {chipsStyles} from "./AdvancedChipsStyles";

export const AdvancedPlusMenu = ({pydio, requestClose, displayed, setDisplayed, indexedMetadata}) => {

    const hidden = indexedMetadata.filter(i => displayed.indexOf(i.name) === -1)
    const poStyles = chipsStyles({})

    const toggle = useCallback((name)=>{
        setDisplayed([...displayed.filter(n=>n !== name), name])
        requestClose()
    }, [indexedMetadata, displayed])

    return (
        <Menu style={poStyles.popoverMenuRootStyle} listStyle={poStyles.popoverMenuStyle} desktop={true} autoWidth={false}>
            {hidden.map(field => {
                return <MenuItem key={field.name} primaryText={field.label} onClick={() => {toggle(field.name)}}/>
            })}
        </Menu>
    )

}