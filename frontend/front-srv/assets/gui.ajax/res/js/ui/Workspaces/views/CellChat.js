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

import React,{useState, useEffect, useContext} from 'react'
import Pydio from 'pydio'
const {Chat} = Pydio.requireLib('components');
import {muiThemeable} from 'material-ui/styles'
import DetachedPanel from '../detailpanes/DetachedPanel'
import InfoPanelCard from '../detailpanes/InfoPanelCard'
import {MultiColumnContext} from "../detailpanes/MultiColumnPanel";

let CellChat = ({pydio, chatStyle, chatUsersStyle, fieldContainerStyle, msgContainerStyle, onRequestClose, muiTheme}) => {

    const [cellId, setCellId] = useState('')
    const [cellModel, setCellModel] = useState(null)
    const user = pydio.user;
    const activeRepo = pydio.user.activeRepository

    useEffect(() => {
        user.getActiveRepositoryAsCell().then(c => {
            setCellModel(c)
            setCellId(c ? user.activeRepository : '')
        })
    }, [activeRepo])

    const chatBoxStyle = {
        flex: 1,
        display:'flex',
        flexDirection:'column',
        overflow: 'hidden',
        background:muiTheme.palette.mui3['surface-2'],
        borderRadius: muiTheme.palette.mui3['card-border-radius'],
        margin: muiTheme.palette.mui3['fstemplate-master-margin'],
        border: '1px solid ' + muiTheme.palette.mui3['outline-variant-50'],
        ...chatStyle
    };
    let chatRoomType = 'WORKSPACE';
    return (
        <Chat
            pydio={pydio}
            roomType={chatRoomType}
            roomObjectId={cellId}
            style={chatBoxStyle}
            fieldContainerStyle={fieldContainerStyle}
            chatUsersStyle={{padding: '8px 10px', borderBottom:'1px solid ' + muiTheme.palette.mui3['outline-variant-50'], display:'flex', flexWrap:'wrap', ...chatUsersStyle}}
            msgContainerStyle={{maxHeight:null, flex:1, paddingTop: '10px !important', backgroundColor:muiTheme.palette.mui3['surface'], borderBottom: chatBoxStyle.border, ...msgContainerStyle}}
            fieldHint={pydio.MessageHash['636']}
            pushMessagesToBottom={true}
            emptyStateProps={{
                iconClassName:'mdi mdi-comment-account-outline',
                primaryTextId:pydio.MessageHash['637'],
                style:{padding:'0 10px', backgroundColor: 'transparent'},
                iconStyle:{fontSize: 60},
                legendStyle:{fontSize: 14, padding: 20}
            }}
            computePresenceFromACLs={cellModel?cellModel.getAcls():{}}
            onRequestClose={onRequestClose}
        />
    );
}

CellChat = muiThemeable()(CellChat)

const CellChatDetached = ({pydio, onRequestClose, onRequestToInfoPanel}) => {
    return (
        <DetachedPanel
            zDepth={2}
            style={{position:'absolute', bottom: 0, right: 20, borderRadius:'12px 12px 0 0', zIndex: 910}}
            onRequestClose={onRequestClose}
            onRequestToInfoPanel={onRequestToInfoPanel}
            dragHandleSelector={".chat-handle"}
        >
            <CellChat
                pydio={pydio}
                chatStyle={{margin: 0, borderRadius:'12px 12px 0 0'}}
                fieldContainerStyle={{borderRadius: 0}}
                onRequestClose={onRequestClose}
            />
        </DetachedPanel>
    );
}

const CellChatInfoCard = ({pydio, ...infoProps}) => {
    const {currentPin} = useContext(MultiColumnContext) || {};
    let style, msgContainerStyle;
    if(currentPin) {
        style = {height:'100%', display:'flex', flexDirection:'column'}
        msgContainerStyle = {flex: 1, maxHeight: 'inherit'}
    } else {
        msgContainerStyle = {minHeight: 260, maxHeight: 420}
    }
    return (
        <InfoPanelCard icon={"mdi mdi-forum-outline"} title={<span>&nbsp;</span>} closedTitle={"Cell Chat"} shrinkTitle={"Cell Chat"} {...infoProps}>
            <CellChat
                pydio={pydio}
                chatStyle={{margin: 0, borderWidth: 0, borderRadius:0, position:'relative', overflow:'visible', ...style}}
                fieldContainerStyle={{borderRadius: 0}}
                msgContainerStyle={msgContainerStyle}
                chatUsersStyle={{position:'absolute', top: -44, borderBottom: 0, padding: '6px 10px'}}
            />
        </InfoPanelCard>
    )
}

export {CellChat as default}
export {CellChatDetached, CellChatInfoCard}