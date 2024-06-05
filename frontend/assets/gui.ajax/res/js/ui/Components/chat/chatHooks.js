import {useEffect, useState} from "react";
import ChatClient from "./ChatClient";

const TypeVideoCall = 'VIDEO_CALL'
const TypeMayHaveMore = 'MAY_HAVE_MORE';
const TypePost = 'POST'
const TypeDelete = 'DELETE_MSG'

const MsgInfoTokenSequence = 'TOKEN_SEQ'
const MsgInfoTokenPosition = 'TOKEN_POS'
const MsgInfoTokenPositionFinal = 'FINAL'
const MsgInfoLiveStatus = 'LIVE_STATUS'
const GlobalStatusAuthor = '--SYSTEM_STATUS--'

function filterIncomingMessage(messages, msg) {

    // For normal incoming message, check if there is a status
    // in the queue for this Author, and remove it
    if(!msg.Info || !msg.Info[MsgInfoLiveStatus]){
        const author = msg.Author || GlobalStatusAuthor;
        messages = messages.filter(m => {
            return !(m.Info && m.Info[MsgInfoLiveStatus] && m.Author === author)
        })
    }

    if(msg.Info && msg.Info[MsgInfoTokenSequence]) {

        const tokenId = msg.Info[MsgInfoTokenSequence]
        const position = msg.Info[MsgInfoTokenPosition]

        const prev = messages.find((m) => m.TokenId === tokenId)
        let newMessages;
        if(position === MsgInfoTokenPositionFinal) {
            newMessages = [...messages]
            if(prev) {
                newMessages = newMessages.filter(m => m !== prev)
            }
            newMessages.push({...msg})
            newMessages.sort((mA, mB) => mA.Timestamp - mB.Timestamp)
            return newMessages;
        }
        const token = {position: parseInt(position), token: msg.Message}
        if(prev) {
            prev.Tokens.push(token) ;
            prev.Tokens.sort((ta,tb)=> ta.position-tb.position)
            if(prev.Tokens[0].position ===0){
                prev.Message = prev.Tokens.map(t => t.token).join('');
            }
            newMessages = messages.filter(m => m !== prev);
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
            newMessages = [...messages, msg]
        }
        return newMessages;
    }
    const newMessages = [...messages.filter(m => m.Uuid !== msg.Uuid), msg].filter(m => !!m.Message);
    newMessages.sort((mA,mB) => mA.Timestamp - mB.Timestamp)
    return newMessages;
}

export const metaEnterToCursor = (event, value) =>  {
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
    return {cursor, newValue}
}

export const useChatMessages = ({pydio, roomType, roomObjectId, loadSize, setMessages, setVideoData, setHasMoreBefore}) => {
    const [room, setRoom] = useState(null)

    const client = ChatClient.getInstance(pydio)

    const onNewMessage = (msg, deleteMsg = false) => {
        if(!msg) {
            return;
        }
        if(msg['@type'] === TypeVideoCall) {
            setVideoData(msg)
        } else if(msg['@type'] === TypeMayHaveMore) {
            setHasMoreBefore(prev => {
                if(!prev.Timestamp || msg.Timestamp < prev.Timestamp) {
                    return msg;
                } else{
                    return prev;
                }
            })
        } else if(deleteMsg){
            setMessages(prevMessages => prevMessages.filter((m) => m.Uuid !== msg.Uuid))
        } else {
            setMessages(prevMessages => filterIncomingMessage(prevMessages, msg))
        }
    }

    const onRoomMessage = (msg) => {
        if(msg){
            setRoom(msg.Room)
        }
    }

    const deleteMessage = (msg) => {
        if (!room || !room.Uuid){
            console.error("Cannot find cell info");
            return;
        }
        let message = {
            "@type": TypeDelete,
            "Message":msg
        };
        client.send(JSON.stringify(message));
    }

    const editMessage = (msg) => {
        if (!room || !room.Uuid){
            console.error("Cannot find cell info");
            return false;
        }
        let message = {
            "@type":TypePost,
            "Message":msg,
        };
        client.send(JSON.stringify(message));
        return true
    }

    const postMessage = (value) => {
        if(!value) {
            return false;
        }
        if (!room || !room.Uuid){
            console.error("Cannot find cell info");
            return false;
        }
        let message = {
            "@type":TypePost,
            "Message":{
                "RoomUuid":room.Uuid,
                "Message":value
            }
        };
        client.send(JSON.stringify(message));
        return true
    }

    const loadMore = (offset, limit)  => {
        client.loadHistory(roomType, roomObjectId, offset, limit);
    }

    useEffect(()=>{
        if(!roomObjectId) {
            return () => {}
        }
        const room = client.joinRoom(roomType, roomObjectId, onNewMessage, onRoomMessage);
        if(room !== null){
            setRoom(room)
        }
        client.loadHistory(roomType, roomObjectId, 0, loadSize);
        const rtCopy = roomType;
        const rIdCopy = roomObjectId
        return () => {
            client.leaveRoom(rtCopy, rIdCopy, onNewMessage);
            setRoom(null);
            setHasMoreBefore({})
            setMessages([]);
        }
    }, [roomType, roomObjectId])

    return {room, postMessage, deleteMessage, editMessage, loadMore}
}

export const useChatNewMessages = ({pydio, roomType, roomObjectId, setNewMessages}) => {
    const client = ChatClient.getInstance(pydio)

    const onNewMessage = (msg, deleteMsg = false) => {
        if(msg['@type'] === TypeVideoCall || msg['@type'] === TypeMayHaveMore) {
            return;
        }
        if (deleteMsg) {
            setNewMessages(prev => Math.max(0, prev - 1))
            this.setState({newMessages: Math.max(0, this.state.newMessages - 1)});
        } else {
            setNewMessages(prev => prev + 1)
        }

    }

    useEffect(() => {
        if (!roomObjectId) {
            return () => {
            }
        }
        client.joinRoom(roomType, roomObjectId, onNewMessage, null);
        const rtCopy = roomType;
        const rIdCopy = roomObjectId
        return () => {
            client.leaveRoom(rtCopy, rIdCopy, onNewMessage);
        }
    }, [roomType, roomObjectId])

}