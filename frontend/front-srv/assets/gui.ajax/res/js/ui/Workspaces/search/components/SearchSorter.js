/*
 * Copyright 2007-2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {MenuItem} from 'material-ui'
const {ModernSelectField} = Pydio.requireLib('hoc')

const m = (id) => Pydio.getMessages()['user_home.search.sorter.'+id] || id

export default ({searchTools, style={}, selectStyle={}}) => {

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

    return (
        <div style={style}>
            <ModernSelectField
                fullWidth={true}
                value={value}
                style={{borderRadius: 20, paddingLeft: 14, fontSize: 13, backgroundColor: 'var(--md-sys-color-surface-variant)', ...selectStyle}}
                onChange={(e,i,v) => {
                    setSortField(v.replace('-', ''), v.indexOf('-') === 0)
                }}
            >
                {items.map(i => <MenuItem value={i.key} primaryText={m(i.label)}/>)}
            </ModernSelectField>
        </div>
    )

}