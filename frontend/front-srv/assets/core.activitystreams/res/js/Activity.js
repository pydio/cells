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
import ReactMarkdown from 'react-markdown';
import {ListItem, FontIcon} from 'material-ui';
const {UserAvatar} = require('pydio').requireLib('components');
const {PydioContextConsumer} = require('pydio').requireLib('boot');
const {moment} = Pydio.requireLib('boot');
import DocLink from './DocLink'

class Paragraph extends React.Component{
    render(){
        return <span>{this.props.children}</span>
    }
}

function workspacesLocations(pydio, object){
    let workspaces = [];
    if (!object.partOf || !object.partOf.items || !object.partOf.items.length){
        return "No workspace found";
    }
    for(let i = 0; i < object.partOf.items.length; i++ ){
        let ws = object.partOf.items[i];
        // Remove slug part
        //let paths = ws.rel.split('/');
        //paths.shift();
        //let relPath = paths.join('/');
        workspaces.push(<a key={ws.id} onClick={() => pydio.triggerRepositoryChange(ws.id)} style={{cursor:'pointer'}}>{ws.name}</a>);
        workspaces.push(<span key={ws.id+'-sep'}>, </span>);
    }
    workspaces.pop();
    return <span>{pydio.MessageHash['notification_center.16']} <span>{workspaces}</span></span>
}


function LinkWrapper(pydio, activity) {

    return React.createClass({

        render: function(){

            const {href, children} = this.props;
            let title = "";
            let onClick = null;
            if(href.startsWith('doc://')){
                if ( activity.type === 'Delete') {
                    return <a style={{textDecoration:'line-through'}}>{children}</a>
                }  else {
                    return <DocLink pydio={pydio} activity={activity}>{children}</DocLink>;
                }
            } else if (href.startsWith('user://')) {
                const userId = href.replace('user://', '');
                return (<UserAvatar userId={userId} displayAvatar={false} richOnClick={true} style={{cursor:'pointer', display:'inline-block', color: 'rgb(66, 140, 179)'}} pydio={pydio}/>)
            } else if (href.startsWith('workspaces://')) {
                const wsId = href.replace('workspaces://', '');
                if(pydio.user && pydio.user.getRepositoriesList().get(wsId)){
                    onClick = () => {pydio.triggerRepositoryChange(wsId)}
                }
            }
            return <a title={title} style={{cursor: 'pointer', color: 'rgb(66, 140, 179)'}} onClick={onClick}>{children}</a>

        }
    })

}

class Activity extends React.Component{

    render() {

        let {pydio, activity, listContext, displayContext, oneLiner} = this.props;
        let secondary = activity.type + " - " + activity.actor.name;
        if (activity.summary) {
            secondary = <ReactMarkdown source={activity.summary} renderers={{'paragraph':Paragraph, 'link': LinkWrapper(pydio, activity)}}/>;
        }

        const avatar = (
            <UserAvatar
                useDefaultAvatar={true}
                userId={activity.actor.id}
                userLabel={activity.actor.name}
                displayLocalLabel={true}
                userType={'user'}
                pydio={pydio}
                style={{display:'flex', alignItems:'center', maxWidth: '60%'}}
                labelStyle={{fontSize: 14, paddingLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace:'nowrap'}}
                avatarStyle={{flexShrink: 0}}
                avatarSize={28}
                richOnHover={true}
            />
        );

        let summary;
        let actionIcon;
        let blockStyle = {
            margin:'0px 10px 6px'
        };
        let summaryStyle = {
            padding: '6px 22px 12px',
            marginTop: 6,
            borderRadius: 2,
            borderLeft: '2px solid #e0e0e0',
            marginLeft: 13,
            color: 'rgba(0,0,0,0.33)',
            fontWeight: 500,
            fontStyle: 'italic',
            overflow: 'hidden'
        };
        if(displayContext === 'popover'){
            summaryStyle = {
                fontSize: 13,
                color: 'rgba(0,0,0,0.33)',
                fontWeight: 500,
                margin: '6px 0',
                padding: 6,
            }
        }

        let className = '';
        let title;
        switch (activity.type) {
            case "Create":
                if (activity.object.type === 'Document'){
                    className = "file-plus";
                } else {
                    className = "folder-plus";
                }
                title = "Created";
                break;
            case "Delete":
                className = "delete";
                title = "Deleted";
                break;
            case "Edit":
            case "Update":
                className = "pencil";
                title = "Modified";
                break;
            case "Read":
                className = "eye";
                title = "Accessed";
                break;
            case "Move":
                className = "file-send";
                title = "Moved";
                break;
            case "Share":
                className = "share-variant";
                if (activity.object.type === "Cell"){
                    className = "icomoon-cells"
                } else if(activity.object.type === "Workspace"){
                    className = "folder"
                }
                title = "Shared";
                break;
            default:
                break;
        }
        if(className.indexOf('icomoon-') === -1){
            className = 'mdi mdi-' + className;
        }
        if (listContext === 'NODE-LEAF') {
            blockStyle = {margin:'16px 10px'};
            actionIcon = <FontIcon className={className} title={title} style={{fontSize:17, color: 'rgba(0,0,0,0.17)'}}/>
        } else {
            if(displayContext === 'mainList'){
                return (
                    <ListItem
                        leftIcon={<FontIcon className={className} color={'rgba(0,0,0,.33)'}/>}
                        primaryText={secondary}
                        secondaryText={<div style={{color: 'rgba(0,0,0,.33)'}}>{workspacesLocations(pydio, activity.object)}</div>}
                        disabled={true}
                    />);
            } else if(displayContext === 'popover'){
                const leftIcon = <FontIcon className={className} title={title} style={{padding:'0 8px', fontSize:20, color: 'rgba(0,0,0,0.17)'}}/>;
                summary = (<div style={{display:'flex', alignItems:'center'}}>{leftIcon}<div style={{...summaryStyle, flex:1}}>{secondary}</div></div>);
            } else {
                summary = (<div style={summaryStyle}>{secondary}</div>);
            }

        }



        return (
            <div style={blockStyle}>
                {!oneLiner &&
                    <div style={{display:'flex', alignItems:'center'}}>
                        {avatar}
                        <span style={{fontSize:13, display:'inline-block', flex:1, height:18, color: 'rgba(0,0,0,0.23)', fontWeight:500, paddingLeft:8, whiteSpace:'nowrap'}}>{moment(activity.updated).fromNow()}</span>
                        {actionIcon}
                    </div>
                }
                {summary}
            </div>
        );

    }

}

Activity.PropTypes = {
    activity: React.PropTypes.object,
    listContext: React.PropTypes.string,
    displayContext: React.PropTypes.oneOf(['mainList', 'infoPanel', 'popover'])
};

Activity = PydioContextConsumer(Activity);
export {Activity as default};