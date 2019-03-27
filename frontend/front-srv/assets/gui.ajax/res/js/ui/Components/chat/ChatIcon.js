import React from 'react'
import ChatClient from './ChatClient'

class ChatIcon extends React.Component{

    constructor(props){
        super(props);
        this.state = {newMessages: 0};
        this._messageListener = this.onMessage.bind(this)
    }

    onMessage(msg, deleteMsg = false){
        if(deleteMsg){
            this.setState({newMessages: Math.max(0, this.state.newMessages - 1)});
        }else {
            this.setState({newMessages: this.state.newMessages + 1});
        }
    }

    listenToRoom(roomType, objectId){
        const client = ChatClient.getInstance(this.props.pydio);
        client.joinRoom(roomType, objectId, this._messageListener, null)
    }

    leaveRoom(roomType, objectId){
        const client = ChatClient.getInstance(this.props.pydio);
        client.leaveRoom(roomType, objectId, this._messageListener);
    }

    componentDidMount(){
        const {roomType, objectId} = this.props;
        this.listenToRoom(roomType, objectId);
    }

    componentWillUnmount(){
        const {roomType, objectId} = this.props;
        this.leaveRoom(roomType, objectId);
    }

    componentWillReceiveProps(nextProps){
        const {roomType, objectId} = this.props;
        if(nextProps.roomType !== roomType || nextProps.objectId !== objectId){
            this.leaveRoom(roomType, objectId);
            this.setState({newMessages: 0}, () => {
                this.listenToRoom(nextProps.roomType, nextProps.objectId);
            });
        }
    }

    onClick(){
        const {pydio} = this.props;
        pydio.Controller.fireAction('toggle_chat_panel');
        this.setState({newMessages: 0});
    }

    render(){
        const {newMessages} = this.state;
        if(newMessages === 0){
            return null;
        }
        const red = '';
        const green = '#8BC34A';
        const style = {display: 'inline-block', padding: '0 5px', fontSize: 15, textAlign: 'center',
            color: green, fontWeight: 500, position: 'relative'};
        const innerStyle = {fontSize: 13, display: 'inline-block', position: 'absolute', top: -1, marginLeft: 2};
        return <span onClick={this.onClick.bind(this)} className="mdi mdi-comment" style={style}><span style={innerStyle}>{newMessages}</span></span>
    }

}

export {ChatIcon as default}