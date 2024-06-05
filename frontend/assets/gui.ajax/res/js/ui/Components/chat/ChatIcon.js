import React, {useState} from 'react'
import {useChatNewMessages} from "./chatHooks";

const ChatIcon = ({pydio, roomType, objectId}) => {

    const [newMessages, setNewMessages] = useState(0)
    useChatNewMessages({pydio, roomType, roomObjectId: objectId, setNewMessages})

    const onClick = () => {
        pydio.Controller.fireAction('toggle_chat_panel');
        setNewMessages(0)
    }

    if(newMessages === 0){
        return null;
    }

    const green = '#8BC34A';
    const style = {display: 'inline-block', padding: '0 5px', fontSize: 15, textAlign: 'center',
        color: green, fontWeight: 500, position: 'relative'};
    const innerStyle = {fontSize: 13, display: 'inline-block', position: 'absolute', top: -1, marginLeft: 2};
    return (
        <span onClick={onClick} className="mdi mdi-comment" style={style}>
            <span style={innerStyle}>{newMessages}</span>
        </span>
    );

}

export {ChatIcon as default}