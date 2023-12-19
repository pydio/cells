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

import React, {createRef} from "react";
import PropTypes from 'prop-types';

import Pydio from 'pydio';
import ChatClient from './ChatClient'
import Message from './Message'
import EmptyStateView from '../views/EmptyStateView'
const {PydioContextConsumer, moment} = Pydio.requireLib('boot');
import {IconButton, TextField} from 'material-ui'
import LKContainer from "./LKContainer";
import {muiThemeable} from 'material-ui/styles'
import Color from 'color'
import SharedUsersStack from "../users/stack/SharedUsersStack";

const LoadSize = 40;

const mdCSS = `
.chat-message-md *, .comments_feed .user-label, .comments_feed .date-from{
    user-select: text;
}
.chat-message-md p{
    padding-top: 0; 
    margin-bottom: 0;
}
.chat-message-md strong {
    font-weight: 500;
}
.chat-message-md a {
    text-decoration: underline;
    color:#2196f3;
}
.chat-message-md ul {
    padding-left: 20px;
}
`

class Chat extends React.Component{

    constructor(props){
        super(props);
        this.client = null;
        this.state = {messages: [], room: null, value:""};
        this._newMessageListener = this.onNewMessage.bind(this);
        this.commentPane = createRef()
    }

    componentDidMount(){
        this.join(this.props.roomType, this.props.roomObjectId);
    }

    componentWillUnmount(){
        this.stop();
        if(this.videoRoomConnected){
            this.videoRoomConnected.disconnect();
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.messages.length <= this.state.messages.length){
            const prevLastStamp = prevState.messages.length > 0 ? parseFloat(prevState.messages[prevState.messages.length-1].Timestamp) : 0
            const newLastStamp = this.state.messages.length > 0 ? parseFloat(this.state.messages[this.state.messages.length-1].Timestamp) : 0
            if(newLastStamp > prevLastStamp && this.commentPane.current){
                this.commentPane.current.scrollTop = 100000;
            }
        }
    }

    componentWillReceiveProps(nextProps){
        const {roomType, roomObjectId} = nextProps;
        if (roomType !== this.props.roomType || roomObjectId !== this.props.roomObjectId){
            if(this.client){
                this.client.leaveRoom(this.props.roomType, this.props.roomObjectId, this._newMessageListener);
            }
            this.setState({messages: [], room: null, value : ""});
            if(roomType && roomObjectId) {
                this.join(roomType, roomObjectId);
            }
        }
    }

    onRoomMessage(msg){
        const {firstUpdateReceived} = this.state;
        if(!firstUpdateReceived) {
            const {roomType, roomObjectId} = this.props;
            this.client.loadHistory(roomType, roomObjectId, 0, LoadSize)
            this.setState({firstUpdateReceived: true});
        }
        if(msg){
            this.setState({room: msg['Room']});
        }
    }

    onNewMessage(msg, deleteMsg = false){
        if(!msg) {
            return;
        }
        this.setState({firstUpdateReceived: true})
        if(msg['@type'] === 'VIDEO_CALL') {
            console.log('Video Enabled!', msg)
            this.setState({videoData: msg})
            return;
        }
        if(deleteMsg){
            this.setState({messages: this.state.messages.filter((m) => {
                return m.Uuid !== msg.Uuid;
            })})
        } else {
            if(msg.Message.indexOf('TOKENS:') === 0) {
                const [TokString, tokenId, position, ...rest] = msg.Message.split(':')
                const prev = this.state.messages.find((m) => m.TokenId === tokenId)
                let newMessages;
                if(position === 'FINAL') {
                    newMessages = [...this.state.messages]
                    if(prev) {
                        newMessages = newMessages.filter(m => m !== prev)
                    }
                    newMessages.push({...msg,  Message:rest.join(':')})
                    newMessages.sort((mA, mB) => mA.Timestamp - mB.Timestamp)
                    this.setState({messages: newMessages})
                    return;
                }
                const token = {position: parseInt(position), token: rest.join(':')}
                if(prev) {
                    prev.Tokens.push(token) ;
                    prev.Tokens.sort((ta,tb)=> ta.position-tb.position)
                    if(prev.Tokens[0].position ===0){
                        prev.Message = prev.Tokens.map(t => t.token).join('');
                    }
                    newMessages = this.state.messages.filter(m => m !== prev);
                    newMessages.push({...prev});
                } else {
                    // override initial message
                    msg = {
                        ...msg,
                        Message: '',
                        Tokens: [token],
                        TokenId: tokenId,
                    }
                    if(token.position === 0){
                        msg.Message = token.token
                    }
                    newMessages = [...this.state.messages, msg]
                }
                this.setState({messages: newMessages});
                return;
            }
            const messages = [...this.state.messages.filter(m => m.Uuid !== msg.Uuid), msg].filter(m => !!m.Message);
            messages.sort((mA,mB) => mA.Timestamp - mB.Timestamp)
            this.setState({messages});
        }

    }

    join(roomType, roomObjectId){
        if(!roomObjectId){
            return;
        }
        const {pydio} = this.props;
        this.client = ChatClient.getInstance(pydio);
        this.setState({firstUpdateReceived: false}, () => {
            const room = this.client.joinRoom(roomType, roomObjectId, this._newMessageListener, this.onRoomMessage.bind(this));
            if(room !== null){
                this.setState({room: room});
            }
        })
        this.client.loadHistory(roomType, roomObjectId, 0, LoadSize);
    }

    more(){
        const {roomType, roomObjectId} = this.props;
        const {messages} = this.state;
        if(this.client){
            this.client.loadHistory(roomType, roomObjectId, messages.length - 1, LoadSize)
        }
    }

    stop(){
        const {roomType, roomObjectId} = this.props;
        if(this.client) {
            this.client.leaveRoom(roomType, roomObjectId, this._newMessageListener);
        }
    }

    postMessage(){
        if (!this.state.value) {
            return;
        }
        let {room} = this.state;
        if (!room || !room.Uuid){
            console.error("Cannot find cell info");
            return;
        }
        let message = {
            "@type":"POST",
            "Message":{"RoomUuid":room.Uuid, "Message":this.state.value}
        };
        this.client.send(JSON.stringify(message));
        this.setState({value: ''});
    }

    deleteMessage(msg){
        let {room} = this.state;
        if (!room || !room.Uuid){
            console.error("Cannot find cell info");
            return;
        }
        let message = {
            "@type":"DELETE_MSG",
            "Message":msg
        };
        this.client.send(JSON.stringify(message));
    }

    keyDown(event){
        const {value} = this.state;
        if(event.key === 'Enter'){
            if(event.metaKey || event.ctrlKey) {
                const target = event.currentTarget;
                let newValue;
                let cursor;
                if(target.selectionEnd < value.length) {
                    newValue = value.substr(0, target.selectionEnd) + '\n' + value.substr(target.selectionEnd);
                    cursor = target.selectionEnd+1;
                } else {
                    newValue = value + '\n';
                    cursor = newValue.length;
                }
                this.setState({value: newValue}, () => {
                    target.setSelectionRange(cursor, cursor);
                })
            } else {
                event.preventDefault();
                this.postMessage();
            }
        }
    }

    render(){
        const {style, msgContainerStyle, chatUsersStyle, fieldContainerStyle, fieldHint, textFieldProps, emptyStateProps,
            pydio, pushMessagesToBottom, computePresenceFromACLs, readonly, muiTheme, popoverPanel} = this.props;
        const {messages, room, videoData, joinVideo} = this.state;
        let data = [];
        let previousMDate;
        let previousAuthor;
        let showLoader = messages.length >= LoadSize;
        messages.forEach((m) => {
            const mDate = moment(parseFloat(m.Timestamp)*1000).fromNow();
            const hideDate = (previousMDate && previousMDate === mDate);
            const sameAuthor = (previousAuthor && previousAuthor === m.Author && hideDate);
            data.push(
                <Message
                    key={m.Uuid}
                    message={m}
                    hideDate={hideDate}
                    sameAuthor={sameAuthor}
                    onDeleteMessage={() => {this.deleteMessage(m)}}
                    moreLoader={showLoader?()=>{this.more()}:null}
                    muiTheme={muiTheme}
                />);
            showLoader = false;
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
            color: Color(muiTheme.palette.mui3['on-surface-variant']).fade(.5).toString(),
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
            ...fieldContainerStyle
        }
        return (
            <div style={{padding: 0, ...style}}>
                {computePresenceFromACLs !== undefined  &&
                    <div style={chatUsersStyle}><SharedUsersStack acls={computePresenceFromACLs} max={12} onlines={room?room.Users:[]}/></div>
                }
                <div ref={this.commentPane} className="comments_feed" style={{maxHeight: 300, overflowY: 'auto',  ...pushStyle, ...msgContainerStyle}}>
                    {pusher}
                    {data}
                    {emptyState}
                </div>
                <div style={fieldContainer}>
                    <TextField
                        hintText={notConnected?pydio.MessageHash[466]:fieldHint}
                        value={this.state.value}
                        onChange={(event, newValue) => {this.setState({value: newValue})}}
                        multiLine={true}
                        onKeyDown={this.keyDown.bind(this)}
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
                            onClick={() => this.setState({joinVideo:!joinVideo})}
                        />
                    </div>
                    }
                </div>
                {videoData && joinVideo && <LKContainer url={videoData.Url} token={videoData.Token}/>}
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:mdCSS}}/>
            </div>
        )
    }

}

Chat.PropTypes = {
    roomType : PropTypes.string,
    roomObjectId: PropTypes.string,
};

Chat = PydioContextConsumer(muiThemeable()(Chat));
export {Chat as default};