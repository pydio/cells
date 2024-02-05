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

import React, {useRef, useEffect, useState} from "react";

import Pydio from 'pydio';
import Message from './Message'
import EmptyStateView from '../views/EmptyStateView'
const {moment} = Pydio.requireLib('boot');
import {IconButton, TextField} from 'material-ui'
import LKContainer from "./LKContainer";
import {muiThemeable} from 'material-ui/styles'
import Color from 'color'
import SharedUsersStack from "../users/stack/SharedUsersStack";
import DropZoneWrapper from "./DropZoneWrapper";
const LoadSize = 40;
import {metaEnterToCursor, useChatMessages} from './chatHooks'
require('./chat.less');

const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const miniIcon = {
    style:{
        width:20,
        height:20,
        padding: 1,
        marginLeft: 4,
    },
    iconStyle:{
        fontSize: 16,
        color: 'var(--md-sys-color-primary)'
    },
    tooltipPosition:'top-left'
}

let Chat = ({roomType, roomObjectId, style, msgContainerStyle, chatUsersStyle, fieldContainerStyle, fieldHint, textFieldProps, emptyStateProps,
                  pydio, pushMessagesToBottom, computePresenceFromACLs, readonly, muiTheme, popoverPanel}) => {
/*

    more(){
        const {roomType, roomObjectId} = this.props;
        const {messages} = this.state;
        if(this.client){
            this.client.loadHistory(roomType, roomObjectId, messages.length - 1, LoadSize)
        }
    }


*/
    const [messages, setMessages] = useState([])
    const [videoData, setVideoData] = useState(null)
    const [joinVideo, setJoinVideo] = useState(null)
    const [hasMoreBefore, setHasMoreBefore] = useState({});
    const [value, setValue] = useState('')
    const [dropping, setDropping] = useState(null);
    const [droppingPreview, setDroppingPreview] = useState(true);
    const [currentEdit, setCurrentEdit] = useState(null)
    const [cursor, setCursor] = useState(-1)
    const intoView = useRef()
    const textfieldRef = useRef()

    const {room, postMessage, deleteMessage, editMessage, loadMore} = useChatMessages({pydio, roomType, roomObjectId, loadSize: LoadSize, setMessages, setVideoData, setHasMoreBefore})

    const m = (id) => pydio.MessageHash['chat.' + id] || id;

    // Handle scroll with usePrevious
    const ts = messages.length ? parseFloat(messages[messages.length-1].Timestamp) : 0
    const prevTS = usePrevious(ts)
    useEffect(()=>{
        if (intoView.current && ts >= prevTS) {
            intoView.current.scrollIntoView({behavior:'smooth', block:'end', inline:'end'})
        }
    }, [messages])

    useEffect(() => {
        if(cursor > -1 && textfieldRef.current) {
            textfieldRef.current.input.refs.input.setSelectionRange(cursor, cursor)
            setCursor(-1);
        }
    }, [value])

    const keyDown = (event) => {
        if(event.key === 'ArrowUp' && !value && !currentEdit) {
            const nexts = [...messages].reverse().filter(m => m.Author === pydio.user.id)
            if(nexts.length) {
                setCurrentEdit(nexts[0].Uuid)
            }
            return
        }
        if(event.key !== 'Enter') {
            return
        }
        if(event.metaKey || event.ctrlKey) {
            const {cursor, newValue} = metaEnterToCursor(event, value)
            setCursor(cursor);
            setValue(newValue);
        } else {
            event.preventDefault();
            let msgContent = value
            if(dropping) {
                const uuid = dropping.getMetadata().get('uuid')
                const label = dropping.getLabel();
                const withPreview = droppingPreview?'?preview':''
                msgContent = `${value}\n[${label}](doc://${uuid}${withPreview})`
            }
            if(postMessage(msgContent)) {
                setValue('')
                setDroppingPreview(true)
                setDropping(null)
            }
        }
    }


    let data = [];
    let previousMDate;
    let previousAuthor;
    messages.forEach((m, i) => {
        const mDate = moment(parseFloat(m.Timestamp)*1000).fromNow();
        const hideDate = (previousMDate && previousMDate === mDate);
        const sameAuthor = (previousAuthor && previousAuthor === m.Author && hideDate);
        let moreLoader, style;
        if(i === 0 && hasMoreBefore.Timestamp > 0 && hasMoreBefore.Timestamp <= m.Timestamp) {
            moreLoader = () => {
                //console.log('should load more', hasMoreBefore)
                loadMore(hasMoreBefore.Offset, hasMoreBefore.Limit);
            }
        }
        data.push(
            <Message
                key={m.Uuid}
                pydio={pydio}
                message={m}
                hideDate={hideDate}
                sameAuthor={sameAuthor}
                onDeleteMessage={() => {
                    deleteMessage(m);
                    setCurrentEdit(null)
                }}
                onEditMessage={(msg, newValue) => {
                    msg.Message=newValue;
                    return editMessage(msg)
                }}
                edit={currentEdit === m.Uuid}
                setEdit={(ed) => setCurrentEdit(ed?m.Uuid:null)}
                moreLoader={moreLoader}
                muiTheme={muiTheme}
                actionIconProps={miniIcon}
            />);
        previousMDate = mDate;
        previousAuthor = m.Author;
    });

    let pushStyle;
    let pusher;
    if(pushMessagesToBottom){
        pushStyle = {display:'flex', flexDirection:'column'};
        if(data && data.length){
            pusher = <span style={{flex: 1}}/>
        }
    }
    let emptyState;
    if(emptyStateProps && (!data || !data.length)){
        emptyState = <EmptyStateView pydio={pydio} {...emptyStateProps}/>
    }
    const notConnected = !room;
    let hintStyle = {
        color: Color(muiTheme.palette.mui3['on-surface-variant']).fade(0.5).toString(),
        whiteSpace:'nowrap'
    }
    if(textFieldProps && textFieldProps.hintStyle){
        hintStyle=  {...hintStyle, ...textFieldProps.hintStyle}
    }
    if(notConnected) {
        hintStyle = {...hintStyle, fontStyle : 'italic'}
    }
    const fieldContainer = {
        backgroundColor: muiTheme.palette.mui3[popoverPanel?'surface-variant':'surface']||'white',
        position:'relative',
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: '0 0 10px 10px',
        ...fieldContainerStyle
    }
    const onDropNode = (node) => {
        setDropping(node)
        if(textfieldRef.current) {
            textfieldRef.current.focus()
        }
    }
    const droppingCanPreview = dropping && dropping.isLeaf() && pydio.Registry.findEditorsForMime(dropping.getAjxpMime(), true).length > 0;
    const insertDroppingNodeInline = () => {
        const uuid = dropping.getMetadata().get('uuid')
        const label = dropping.getLabel();
        setValue(`${value}[${label}](doc://${uuid})`);
        setDropping(null)
    }
    return (
        <DropZoneWrapper onDropNode={onDropNode} style={{padding: 0, ...style}}>
            {computePresenceFromACLs !== undefined  &&
                <div style={chatUsersStyle}><SharedUsersStack acls={computePresenceFromACLs} max={12} onlines={room?room.Users:[]}/></div>
            }
            <div className="comments_feed" style={{maxHeight: 300, overflowY: 'auto',  ...pushStyle, ...msgContainerStyle}}>
                {pusher}
                {data}
                {emptyState}
                <span id={"intoView"} ref={intoView}/>
            </div>
            <div style={fieldContainer} className={"textfield-container"}>
                {dropping &&
                    <div className={"dropping-panel"}>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <span className={'mdi mdi-' + (dropping.isLeaf()?'file':'folder')} style={{marginRight: 5}}/>
                            <span style={{flex: 1}}>{dropping.getLabel()}</span>
                            <div className={"mdi mdi-close"} title={m('dropzone.remove')} onClick={() => setDropping(null)}></div>
                        </div>
                        <div style={{display:'flex', alignItems:'center', marginTop: 10}}>
                        {droppingCanPreview &&
                            <div style={{flex: 1}} className={"include-action"} onClick={()=>setDroppingPreview(!droppingPreview)}>
                                <span className={'mdi mdi-checkbox-'+(droppingPreview?'marked':'blank')+'-outline'} style={{marginRight: 5}}/>
                                {m('dropzone.preview')}
                            </div>
                        }
                        <div className={'include-action'} onClick={insertDroppingNodeInline}
                             style={{cursor:'pointer'}}><span className={'mdi mdi-arrow-down-left'}/> {m('dropzone.inline')}</div>
                        </div>
                    </div>
                }
                <TextField
                    ref={textfieldRef}
                    hintText={notConnected?pydio.MessageHash[466]:fieldHint}
                    value={value}
                    onChange={(e, v) => setValue(v)}
                    multiLine={true}
                    onKeyDown={keyDown}
                    fullWidth={true}
                    underlineShow={false}
                    disabled={readonly||notConnected}
                    {...textFieldProps}
                    hintStyle={hintStyle}
                />
                {videoData &&
                <div style={{position:'absolute', top: 0, right: 0}}>
                    <IconButton
                        iconStyle={{color:joinVideo?'#F44336':'#4CAF4F'}}
                        iconClassName={"mdi mdi-video"+(joinVideo?'-off':'')}
                        onClick={() => setJoinVideo(!joinVideo)}
                    />
                </div>
                }
            </div>
            {videoData && joinVideo && <LKContainer url={videoData.Url} token={videoData.Token}/>}
        </DropZoneWrapper>
    )
}


Chat = muiThemeable()(Chat);
export {Chat as default};