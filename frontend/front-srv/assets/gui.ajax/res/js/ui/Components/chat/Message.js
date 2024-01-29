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
import React, {Fragment, useState, useRef, useEffect, useCallback} from 'react';
import Pydio from 'pydio'
import UserAvatar from '../users/avatar/UserAvatar'
import {FlatButton, Dialog} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
const {moment} = Pydio.requireLib('boot');
import DOMUtils from 'pydio/util/dom'
import Markdown from 'react-markdown'
import LinkRenderer from './LinkRenderer'
import {metaEnterToCursor} from "./chatHooks";
const {ModernTextField} = Pydio.requireLib('hoc')

/*
function useHookWithRefCallback(observer) {
    const ref = useRef(null)
    const setRef = useCallback(node => {
        if (ref.current) {
            // Make sure to cleanup any events/references added to the last instance
            console.log('cleanup')
            observer.unobserve(ref.current)
        }

        if (node) {
            // Check if a node is actually passed. Otherwise node would be null.
            // You can now do what you need to, addEventListeners, measure, etc.
            console.log('observe?')
            observer.observe(node)
        }

        // Save a reference to the node
        ref.current = node
    }, [])

    return [setRef]
}
 */

let Message = ({message, pydio, hideDate, sameAuthor, onDeleteMessage, edit, setEdit, onEditMessage, moreLoader, muiTheme}) => {

    const [hover, setHover] = useState(false);
    const mDate = moment(parseFloat(message.Timestamp)*1000);
    const [editValue, setEditValue] = useState(message.Message)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [cursor, setCursor] = useState(-1)
    const textfieldRef = useRef(null)

    useEffect(() => {
        if(cursor > -1 && textfieldRef.current) {
            textfieldRef.current.input.refs.input.setSelectionRange(cursor, cursor)
            setCursor(-1);
        }
    }, [editValue])

    const styles = {
        date: {
            opacity: 0.53,
            textAlign: 'center',
            display: 'flex',
            margin: '5px 0',
        },
        dateLine: {
            flex: 1,
            margin: '10px 20px',
            borderBottom: '1px solid',
            opacity: 0.3
        },
        loader: {
            paddingTop: 8,
            opacity: 0.8,
            textAlign: 'center',
        },
        comment: {
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            backgroundColor:hover?'rgba(0,0,0,.01)':'transparent'
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
            fontSize: 16,
            fontWeight: 500,
            marginTop: -2,
            padding: '0px 0px 2px'
        },
        commentDeleteBox: {
            position: 'absolute',
            top: 5,
            right: 0,
            cursor: 'pointer',
            fontSize: 16,
            opacity:0,
            transition: DOMUtils.getBeziersTransition(),
        },
        actionBar: {
            position: 'absolute',
            top: 5,
            right: 0,
            zIndex: 2,
            cursor: 'pointer',
            fontSize: 16,
            opacity:hover||edit?1:0,
            display:'flex',
            alignItems:'center',
            color: muiTheme.palette.primary1Color,
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
    let actions = [];
    let textStyle = {...styles.commentContent};
    let deleteAction = {title:pydio.MessageHash['7'], icon:'delete-outline', click: () => setConfirmDelete(true)}

    if(authorIsLogged && !edit){
        if(onEditMessage) {
            actions.push({title:'Edit', icon:'pencil-outline', click: () => setEdit(true)})
        }
        actions.push(deleteAction)
    }
    let body = (<Markdown
        className={"chat-message-md"}
        source={message.Message}
        renderers={{link: LinkRenderer}}
        skipHtml={true}
    />)

    if (edit) {
        const save = () => {
            if(editValue && onEditMessage(message, editValue)) {
                setEdit(false)
            }
        }
        const cancel = () => {
            setEditValue(message.Message)
            setEdit(false)
        }
        if(editValue) {
            actions.push({title:'Save', icon:'content-save-outline', click: save})
        } else {
            actions.push(deleteAction)
        }
        actions.push({title:'Cancel', icon:'undo-variant', click: cancel})
        body = (<ModernTextField
            value={editValue}
            onChange={(e,v)=>setEditValue(v)}
            inputStyle={{fontSize: 14}}
            multiLine={true}
            underlineShow={false}
            focusOnMount={true}
            fullWidth={true}
            onKeyDown={(e)=>{
                if(e.key === 'Escape') {
                    cancel()
                } else if (e.key === 'Enter') {
                    if (e.metaKey || e.ctrlKey) {
                        const {cursor, newValue} = metaEnterToCursor(e, editValue)
                        setCursor(cursor)
                        setEditValue(newValue);
                        return
                    }
                    if(editValue) {
                        save()
                    } else {
                        setConfirmDelete(true)
                    }
                }
            }}
        />);
    }

    let actionBar;
    if(actions.length) {
        actionBar = <div style={styles.actionBar}>{actions.map(a => <span className={'mdi mdi-' + a.icon} onClick={a.click} title={a.title}/> )}</div>
    }

    let text;
    let containerStyle = {};

    if (sameAuthor) {
        text = <div style={textStyle}>{actionBar}{body}</div>
        containerStyle = {...containerStyle, marginTop: -16}
    } else {
        text = (
            <div style={textStyle}>
                <div>
                    <UserAvatar
                        labelStyle={styles.commentTitle}
                        pydio={pydio}
                        displayLabel={true}
                        displayAvatar={false}
                        userId={message.Author}
                    />
                </div>
                <div>{actionBar}{body}</div>
            </div>
        )
    }


    return (
        <div style={containerStyle}
             onMouseOver={()=>{setHover(true)}}
             onMouseOut={()=>{setHover(false)}}
             onContextMenu={(e) => {e.stopPropagation()}}
        >
            {authorIsLogged &&
                <Dialog
                    open={confirmDelete}
                    modal={false}
                    title={"Confirm this action"}
                    contentStyle={{
                        background:muiTheme.dialog['containerBackground'],
                        borderRadius:muiTheme.borderRadius,
                        width:420,
                        minWidth:380,
                        maxWidth:'100%'
                    }}
                    actions={
                    [
                        <FlatButton label={"Yes"} onClick={onDeleteMessage} keyboardFocused={true}/>,
                        <FlatButton label={"No"} onClick={() => setConfirmDelete(false)}/>
                    ]
                }>
                    Delete this message?
                </Dialog>
            }
            {moreLoader &&
            <div style={{...styles.loader}}>
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
            <div style={styles.comment}>{avatar} {text}</div>
        </div>
    );
}
Message = muiThemeable()(Message);
export {Message as default};