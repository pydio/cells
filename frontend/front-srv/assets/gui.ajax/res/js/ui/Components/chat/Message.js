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
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import UserAvatar from '../users/avatar/UserAvatar'
import {Paper, FlatButton} from 'material-ui'
const {PydioContextConsumer, moment} = Pydio.requireLib('boot');
import DOMUtils from 'pydio/util/dom'
import Markdown from 'react-markdown'

class Message extends React.Component {

    constructor(props){
        super(props);
        this.state = {hover: false};
    }

    render(){
        const {message, pydio, hideDate, sameAuthor, onDeleteMessage, moreLoader} = this.props;
        const mDate = moment(parseFloat(message.Timestamp)*1000);

        const styles = {
            date: {
                opacity: .53,
                textAlign: 'center',
                display: 'flex',
                margin: '5px 0',
            },
            dateLine: {
                flex: 1,
                margin: '10px 20px',
                borderBottom: '1px solid',
                opacity: .3
            },
            loader: {
                paddingTop: 8,
                opacity: .8,
                textAlign: 'center',
            },
            comment: {
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'flex-start'
            },
            commentContent: {
                flex: '1',
                backgroundColor:'transparent',
                position: 'relative',
                padding: '5px 10px',
                userSelect:'text',
                webkitUserSelect:'text'
            },
            commentTitle: {
                fontSize: 15,
                fontWeight: 500,
                padding: '2px 0px 6px',
            },
            commentDeleteBox: {
                position: 'absolute',
                top: 5,
                right: 0,
                cursor: 'pointer',
                fontSize: 16,
                opacity:0,
                transition: DOMUtils.getBeziersTransition(),
            }
        };
        let authorIsLogged = false;
        if(pydio.user.id === message.Author){
            authorIsLogged = true;
        }
        const avatar = (
            <div style={sameAuthor ? {visibility:'hidden'} : {paddingTop:2}}>
                <UserAvatar
                    avatarSize={30}
                    pydio={pydio}
                    userId={message.Author}
                    displayLabel={false}
                    richOnHover={false}
                    avatarLetters={true}
                />
            </div>
        );
        let textStyle = {...styles.commentContent};
        let deleteBox;
        if(authorIsLogged){
            const {hover} = this.state;
            let deleteStyle = styles.commentDeleteBox;
            if(hover){
                deleteStyle.opacity = 1;
            }
            deleteBox = <span
                onClick={onDeleteMessage}
                className="mdi mdi-close"
                style={styles.commentDeleteBox}
                title={pydio.MessageHash['7']}
            />
        }
        let text = (
            <div style={textStyle}>
                {deleteBox} <Markdown className={"chat-message-md"} source={message.Message}/>
            </div>
        );
        if(!sameAuthor){
            text = (
                <div style={textStyle}>
                    <div>
                        <UserAvatar labelStyle={styles.commentTitle} pydio={pydio} displayLabel={true} displayAvatar={false} userId={message.Author}/>
                    </div>
                    <div>{deleteBox}<Markdown className={"chat-message-md"} source={message.Message}/></div>
                </div>
            )
        }
        let containerStyle = {}, commentStyle = {...styles.comment}
        if(sameAuthor){
            containerStyle = {...containerStyle, marginTop: -16}
        }
        if(this.state.hover){
            commentStyle = {...commentStyle, backgroundColor:'rgba(0,0,0,.01)'}
        }

        return (
            <div style={containerStyle}
                 onMouseOver={()=>{this.setState({hover:true})}}
                 onMouseOut={()=>{this.setState({hover:false})}}
                 onContextMenu={(e) => {e.stopPropagation()}}
            >
                {moreLoader &&
                <div style={styles.loader}>
                    <FlatButton primary={true} label={Pydio.getMessages()['chat.load-older']} onClick={moreLoader}/>
                </div>
                }
                {!hideDate &&
                    <div style={styles.date}>
                        <span style={styles.dateLine}/>
                        <span className={"date-from"}>{mDate.fromNow()}</span>
                        <span style={styles.dateLine}/>
                    </div>
                }
                <div style={commentStyle}>{avatar} {text}</div>
            </div>
        );
    }
}

Message.PropTypes = {
    message : PropTypes.object,
    hideDate: PropTypes.bool,
    sameAuthor: PropTypes.bool,
};

Message = PydioContextConsumer(Message);
export {Message as default};