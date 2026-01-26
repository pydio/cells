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

import React from 'react'
import Pydio from 'pydio'
import {Menu, MenuItem} from 'material-ui'
import {chipsStyles} from "./AdvancedChipsStyles";

const m = (id) => Pydio.getMessages()['user_home.search.sorter.'+id] || id

export const sortFieldLabel = ((sortField, sortDesc) => {
    if(!sortField) {
        return m('relevant.desc')
    }
    let key = '';
    switch(sortField) {
        case 'mtime':
            key = 'modified';
            break;
        case 'size':
            key = 'size';
            break;
        default:
            key = 'relevant';
    }
    return m(key + '.' + (sortDesc ? 'desc' : 'asc'));
})

export const AdvancedChipsSorter = ({searchTools, requestClose}) => {

    const {sortField = '', sortDesc = false, setSortField = () =>{}} = searchTools;

    const items = [
        {key: "", label: "relevant.desc"},
        {key: "-mtime", desc: true, label: "modified.desc"},
        {key: "mtime", desc: false, label: "modified.asc"},
        {key: "-size", desc: true, label: "size.desc"},
        {key: "size", desc: false, label: "size.asc"},
    ];

    let value = sortField;
    if(sortField && sortDesc){
        value = '-' + value;
    }
    const poStyles = chipsStyles({})

    return (
        <Menu
            style={poStyles.popoverMenuRootStyle}
            listStyle={poStyles.popoverMenuStyle}
            autoWidth={false}
            desktop={true}
            value={value}
            onChange={(e,v) => {
                setSortField(v.replace('-', ''), v.indexOf('-') === 0)
                requestClose()
            }}>
            {items.map((i) => <MenuItem value={i.key} primaryText={m(i.label)}/>)}
        </Menu>
    )

}