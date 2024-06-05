/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {useState} from 'react'
import {Tooltip} from "@mui/material";
import DOMUtils from 'pydio/util/dom'

const RefreshAction = ({pydio, muiTheme}) => {

    const [refreshHover, setRefreshHover] = useState(false)
    const a = pydio.Controller.getActionByName('refresh')
    if (!a) {
        return null;
    }
    const refreshCallback = a.apply.bind(a)
    const refreshLabel = a.options.text;
    return (
        <Tooltip title={<div style={{padding:'2px 10px'}}>{refreshLabel}</div>} placement={"bottom"}><span
            className={"mdi mdi-refresh"}
            style={{
                cursor: 'pointer',
                color:muiTheme.palette.mui3?muiTheme.palette.mui3.primary: null,
                fontSize:'0.8em',
                opacity:refreshHover?1:0.5,
                padding: 5,
                marginLeft: 2,
                borderRadius: '50%',
                backgroundColor:refreshHover?'var(--md-sys-color-outline-variant-50)':'',
                transition: DOMUtils.getBeziersTransition()
            }}
            onMouseOver={()=>setRefreshHover(true)}
            onMouseOut={()=>setRefreshHover(false)}
            onClick={() => refreshCallback()}
        /></Tooltip>
    )

}

export {RefreshAction}