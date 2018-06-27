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
import UserAvatar from '../users/avatar/UserAvatar'
import {Paper} from 'material-ui'
const {PydioContextConsumer, moment} = Pydio.requireLib('boot');
import DOMUtils from 'pydio/util/dom'

class Message extends React.Component {

    constructor(props){
        super(props);
        this.state = {hover: false};
    }

    render(){
        const {message, pydio, hideDate, sameAuthor, onDeleteMessage} = this.props;
        const mDate = moment(parseFloat(message.Timestamp)*1000);

        const styles = {
            date: {
                color: 'rgba(0,0,0,.23)',
                textAlign: 'center',
                display: 'flex',
                margin: '5px 0',
            },
            dateLine: {
                flex: 1,
                margin: '10px 20px',
                borderBottom: '1px solid #eee'
            },
            comment: {
                padding: 8,
                display: 'flex',
                alignItems: 'flex-start'
            },
            commentContent: {
                flex: '1',
                marginLeft: 8,
                position: 'relative',
                padding: '8px 10px',
                backgroundColor: '#eee'
            },
            commentDeleteBox: {
                position: 'absolute',
                top: 5,
                right: 5,
                cursor: 'pointer',
                fontSize: 20,
                color: '#424242',
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
                    richOnHover={true}
                    avatarLetters={true}
                />
            </div>
        );
        let textStyle = {...styles.commentContent};
        if(authorIsLogged){
            textStyle = {...textStyle, marginLeft: 0, marginRight: 8}
        }
        if(sameAuthor){
            textStyle = {...textStyle, borderRadius: 0}
        }
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
        const text = (
            <Paper zDepth={0} style={textStyle}>
                {deleteBox}{message.Message}
            </Paper>
        );

        return (
            <div style={sameAuthor ? {marginTop: -16} : {}} onMouseOver={()=>{this.setState({hover:true})}} onMouseOut={()=>{this.setState({hover:false})}}>
                {!hideDate &&
                    <div style={styles.date}>
                        <span style={styles.dateLine}/>
                        <span>{mDate.fromNow()}</span>
                        <span style={styles.dateLine}/>
                    </div>
                }
                {authorIsLogged &&
                    <div style={styles.comment}>{text} {avatar}</div>
                }
                {!authorIsLogged &&
                    <div style={styles.comment}>{avatar} {text}</div>
                }
            </div>
        );
    }
}

Message.PropTypes = {
    message : React.PropTypes.object,
    hideDate: React.PropTypes.bool,
    sameAuthor: React.PropTypes.bool,
};

Message = PydioContextConsumer(Message);
export {Message as default};