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

import DOMUtils from 'pydio/util/dom'

export const chipsStyles = (muiTheme, containerStyle = {}, tagStyle = {}, showRemove = false) => {
    return {
        container:{
            display:'flex',
            flexWrap: 'wrap',
            ...containerStyle
        },
        tag: {
            borderRadius: 20,
            background:'var(--md-sys-color-surface-variant)',
            color: 'var(--md-sys-color-on-surface-variant)',
            display: 'flex',
            alignItems: 'center',
            padding: showRemove?'2px 5px 2px 11px':'2px 10px',
            marginRight: 5, marginBottom: 5,
            ...tagStyle
        },
        tagField: {
            borderRadius: 8,
            border: '1px dashed var(--md-sys-color-outline-variant)',
            color: 'var(--md-sys-color-on-surface-variant)',
            display: 'flex',
            alignItems: 'center',
            padding: showRemove?'1px 5px 1px 10px':'1px 10px',
            marginRight: 5, marginBottom: 5,
            ...tagStyle
        },
        tagRemove: {
            backgroundColor: muiTheme.darkMode?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.1)',
            cursor: 'pointer',
            height: 16, width: 16, lineHeight: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            color: 'white',
            marginLeft: 7,
            transition: DOMUtils.getBeziersTransition()
        },
        tagHide: {
            cursor: 'pointer',
            height: 16, width: 16, lineHeight: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            marginLeft: 7,
            transition: DOMUtils.getBeziersTransition()
        },
        tagFieldOpen: {
            background: 'var(--md-sys-color-surface-variant)',
            border:'1px solid var(--md-sys-color-surface-variant)',
            boxShadow: DOMUtils.getBoxShadowDepth(1),
        },
        tagFieldActive: {
            background: 'var(--md-sys-color-surface-variant)',
            //border:'1px solid var(--md-sys-color-outline-variant)',
        },
        popoverTitle: {
            padding: '10px 24px',
            background: 'var(--md-sys-color-surface-variant)',
            //borderBottom: '1px solid var(--md-sys-color-surface-variant)',
            fontSize: 14,
            fontWeight: 500,
        },
        popoverStyle:{
            width:260,
            borderRadius:12,
            zIndex:2000,
            marginTop: 5,
            background:'var(--md-sys-color-surface-1)',
            overflow:'visible'
        },
        popoverMenuRootStyle: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
        },
        popoverMenuStyle: {
            width: 260,
            background:'transparent',
            paddingTop: 4,
            paddingBottom: 8
        },
        popoverMenuStyleNoBottom: {
            background:'transparent',
            paddingTop: 4,
            paddingBottom: 0
        },
        popoverBlockStyle: {
            margin: '0 12px 8px',
        },
        popoverFieldStyle: {
            margin: '8px 12px',
        },
        verticalDivider: {
            borderRight: '1px solid var(--md-sys-color-surface-variant)',
            margin: '0px 8px 0px 3px',
            height: '26px',
        }
    }
}