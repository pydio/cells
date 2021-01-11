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

import React from 'react';
import Pydio from 'pydio';
import ChatClient from './ChatClient'
import Message from './Message'
import EmptyStateView from '../views/EmptyStateView'
const {PydioContextConsumer, moment} = Pydio.requireLib('boot');
import {TextField} from 'material-ui'
import ChatUsers from './ChatUsers'

const LoadSize = 40;

class Chat extends React.Component{

    constructor(props){
        super(props);
        this.client = null;
        this.state = {messages: [], room: null, value:""};
        this._newMessageListener = this.onNewMessage.bind(this);
    }

    componentDidMount(){
        this.join(this.props.roomType, this.props.roomObjectId);
    }

    componentWillUnmount(){
        this.stop();
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.messages.length <= this.state.messages.length){
            const prevLastStamp = prevState.messages.length > 0 ? parseFloat(prevState.messages[prevState.messages.length-1].Timestamp) : 0
            const newLastStamp = this.state.messages.length > 0 ? parseFloat(this.state.messages[this.state.messages.length-1].Timestamp) : 0
            if(newLastStamp > prevLastStamp){
                this.refs.comments.scrollTop = 100000;
            }
        }
    }

    componentWillReceiveProps(nextProps){
        const {pydio, roomType, roomObjectId} = nextProps;
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
        if(msg){
            this.setState({room: msg['Room']});
        }
    }

    onNewMessage(msg, deleteMsg = false){
        if(!msg) {
            return;
        }
        if(deleteMsg){
            this.setState({messages: this.state.messages.filter((m) => {
                return m.Uuid !== msg.Uuid;
            })})
        } else {
            const messages = [...this.state.messages, msg].filter(m => !!m.Message);
            messages.sort((mA,mB) => {
                if (mA.Timestamp === mB.Timestamp) {
                    return 0
                }
                return parseFloat(mA.Timestamp) > parseFloat(mB.Timestamp) ? 1 : -1;
            });
            this.setState({messages});
        }

    }

    join(roomType, roomObjectId){
        if(!roomObjectId){
            return;
        }
        const {pydio} = this.props;
        this.client = ChatClient.getInstance(pydio);
        const room = this.client.joinRoom(roomType, roomObjectId, this._newMessageListener, this.onRoomMessage.bind(this));
        if(room !== null){
            this.setState({room: room});
        }
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
        if(event.key === 'Enter'){
            event.preventDefault();
            this.postMessage();
        }
    }

    render(){
        const {style, msgContainerStyle, fieldHint, emptyStateProps, pydio, pushMessagesToBottom, computePresenceFromACLs} = this.props;
        const {messages, room} = this.state;
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
        return (
            <div style={{padding: 0, ...style}}>
                {computePresenceFromACLs !== undefined  &&
                    <ChatUsers pydio={pydio} ACLs={computePresenceFromACLs} roomUsers={room?room.Users:[]}/>
                }
                <div ref="comments" className="comments_feed" style={{maxHeight: 300, overflowY: 'auto',  ...pushStyle, ...msgContainerStyle}}>
                    {pusher}
                    {data}
                    {emptyState}
                </div>
                <div style={{backgroundColor: 'white', paddingLeft: 16, paddingRight: 16, borderTop: '1px solid #e0e0e0'}}>
                    <TextField
                        hintText={fieldHint}
                        hintStyle={{whiteSpace:'nowrap'}}
                        value={this.state.value}
                        onChange={(event, newValue) => {this.setState({value: newValue})}}
                        multiLine={true}
                        ref="new_comment"
                        onKeyDown={this.keyDown.bind(this)}
                        fullWidth={true}
                        underlineShow={false}
                    />
                </div>
            </div>
        )
    }

}

Chat.PropTypes = {
    roomType : React.PropTypes.string,
    roomObjectId: React.PropTypes.string,
};

Chat = PydioContextConsumer(Chat);
export {Chat as default};