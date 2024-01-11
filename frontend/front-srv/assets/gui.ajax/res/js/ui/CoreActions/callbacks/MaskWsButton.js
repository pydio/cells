/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React from 'react'
import {IconButton} from 'material-ui'

export default class MaskWsButton extends React.Component {

    render() {
        const {pydio, workspaceId, iconStyle, style} = this.props
        if (!pydio.user) {
            return null;
        }
        const baseStyles = {
            style: {width:40,height:40,padding:8},
            iconStyle: {color:'var(--md-sys-color-primary)'}
        }
        const wss = pydio.user.getLayoutPreference('MaskedWorkspaces', [])
        const isMasked = wss.indexOf && wss.indexOf(workspaceId) > -1
        return (
            <IconButton
                iconClassName={'mdi mdi-eye-'+(isMasked?'':'off-')+'outline'}
                style={{...baseStyles.style, ...style}}
                iconStyle={{...baseStyles.iconStyle, ...iconStyle}}
                tooltip={pydio.MessageHash['ajax_gui.wslist.action.' + (isMasked?'unmask':'mask')]}
                onClick={() => {
                    let mw = [...wss]
                    if (isMasked) {
                        mw = wss.filter(id => id !== workspaceId)
                    } else {
                        mw.push(workspaceId)
                    }
                    pydio.user.setLayoutPreference('MaskedWorkspaces', mw)
                }}
            />
        )


    }

}
