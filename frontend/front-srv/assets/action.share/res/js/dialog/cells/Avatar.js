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
import React from 'react'
import Pydio from 'pydio'
import IdmObjectHelper from 'pydio/model/idm-object-helper'
const {muiThemeable} = require('material-ui/styles')
const {UserAvatar} = Pydio.requireLib('components')
const {M3Tooltip} = Pydio.requireLib("boot");


let Avatar = muiThemeable()(({size=24, idmObject, type, muiTheme, tooltip=false, style={}}) => {

    let avatar;
    let avatarColor = muiTheme.palette.avatarsColor;
    const baseStyle = {
        borderRadius: '50%',
        color: 'white',
        display: 'flex',
        alignItems:'center',
        justifyContent:'center',
        fontSize: 17,
        height: size,
        width: size,
        ...style
    }

    if(type === 'group') {
        avatar = <span className="mdi mdi-account-multiple" style={{...baseStyle, backgroundColor: avatarColor}}/>;
    }else if(type === 'team') {
        avatar = <span className="mdi mdi-account-multiple-outline" style={{...baseStyle, backgroundColor:avatarColor}}/>;
    }else if(type === 'temporary') {
        avatar = <span className="mdi mdi-account-plus" style={{...baseStyle, backgroundColor:avatarColor}}/>;
    }else if(type === 'remote_user'){
        avatar = <span className="mdi mdi-account-network" style={{...baseStyle, backgroundColor:avatarColor}}/>;
    }else if(type === 'more'){
        avatar = <span style={{...baseStyle, backgroundColor:avatarColor}}>+ {idmObject}</span>;
    }else{
        avatar = (
            <div style={{zIndex: baseStyle.zIndex}}>
                <UserAvatar
                    avatarSize={size}
                    pydio={Pydio.getInstance()}
                    userId={idmObject.Login}
                    avatarOnly={true}
                    idmUser={idmObject}
                    userType={'user'}
                    useDefaultAvatar={true}
                    richOnClick={false}
                    richOnHover={false}
                    style={{padding: 0, lineHeight: '16px', ...style}}
                />
            </div>
        )
    }
    if(tooltip) {
        let label
        const mm = Pydio.getMessages();
        if(type === 'more') {
            if(idmObject > 1) {
                label = mm['share_center.cell.participant.other.multiple'].replace('%d', idmObject)
            } else {
                label = mm['share_center.cell.participant.other.single']
            }
        } else {
            label = IdmObjectHelper.extractLabelFromIdmObject(idmObject)
        }
        return (
            <M3Tooltip
                PopperProps={{style:{zIndex:2200}}}
                placement={"bottom"}
                title={<div style={{padding:'0 6px'}}>{label}</div>}>
                {avatar}
            </M3Tooltip>
        )
    }
    return avatar;
})

export default Avatar