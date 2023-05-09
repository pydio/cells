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

import Pydio from 'pydio'
import React, {Fragment} from 'react';
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import {FontIcon} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PathUtils from 'pydio/util/path'

const {UserAvatar} = Pydio.requireLib('components');
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {FilePreview} = Pydio.requireLib('workspaces');

const {moment} = Pydio.requireLib('boot');
import DocLink, {nodesFromObject} from './DocLink'

class Paragraph extends React.Component{
    render(){
        return <span>{this.props.children}</span>
    }
}

function LinkWrapper(pydio, activity, style = undefined) {

    return class Wrapped extends React.Component{

        render(){

            const {href, children} = this.props;
            const linkStyle = {
                cursor: 'pointer',
                color:'rgb(66, 140, 179)',
                fontWeight: 500,
                ...style
            };
            let title = "";
            let onClick = null;
            if(href.startsWith('doc://')){
                if ( activity.type === 'Delete') {
                    return <a style={{textDecoration:'line-through'}}>{children}</a>
                }  else {
                    return <DocLink pydio={pydio} activity={activity} linkStyle={linkStyle}>{children}</DocLink>;
                }
            } else if (href.startsWith('user://')) {
                const userId = href.replace('user://', '');
                return (<UserAvatar userId={userId} displayAvatar={false} richOnClick={true} style={{...linkStyle, display:'inline-block'}} pydio={pydio}/>)
            } else if (href.startsWith('workspaces://')) {
                const wsId = href.replace('workspaces://', '');
                if(pydio.user && pydio.user.getRepositoriesList().get(wsId)){
                    onClick = () => {pydio.triggerRepositoryChange(wsId)}
                }
            }
            return <a title={title} style={linkStyle} onClick={onClick}>{children}</a>

        }
    }

}

export class ActivityMD extends React.Component {
    render() {
        const {activity, listContext, inlineActor} = this.props;
        if(!activity.summary) {
            return <span>{activity.type} {activity.actor ? ' - ' + activity.actor.name : ''}</span>
        }
        const renderers = {
            paragraph:Paragraph,
            link: LinkWrapper(pydio, activity, {color:'inherit'})
        }
        if(listContext === 'NODE-LEAF') {
            renderers.link = () => null
        }
        let av;
        if(inlineActor && activity.actor){
            av = <UserAvatar
                userId={activity.actor.id}
                userLabel={activity.actor.name}
                displayLocalLabel={true}
                userType={'user'}
                pydio={Pydio.getInstance()}
                style={{display:'inline-block'}}
                labelStyle={{display:'inline-block'}}
                displayAvatar={false}
                richOnHover={false}
            />

        }

        return (
            <Fragment>
                {av}{av ? ' - ': null}
                <ReactMarkdown source={activity.summary} renderers={renderers} style={{display:'inline'}} containerTagName={inlineActor?'span':'div'}/>
            </Fragment>
        );
    }
}

class Activity extends React.Component{

    state = {
        hover: false
    }

    computeIcon(activity){
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
            case "UpdateMeta":
                className = "tag-multiple";
                title = "Modified";
                break;
            case "UpdateComment":
                className = "message-outline";
                title = "Commented";
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
        return {title, className};
    }

    render() {

        let {pydio, activity, listContext, oneLiner, muiTheme, onRequestClose=()=>{}} = this.props;
        let {hover} = this.state;

        let summary;
        const {className} = this.computeIcon(activity);
        const accentColor = muiTheme.palette.mui3['outline']


        let blockStyle = {
            margin:0,
            padding:'10px 0'
        };
        if(hover){
            blockStyle = {
                ...blockStyle,
                backgroundColor:muiTheme.hoverBackgroundColor
            };
        }

        const nodes = nodesFromObject(activity.object, pydio);
        let icon, primaryText;
        if(nodes.length){
            const previewStyles = {
                style: {
                    height: 40,
                    width: 40,
                    borderRadius: 4
                },
                mimeFontStyle: {
                    fontSize: 20,
                    lineHeight: '36px',
                    textAlign:'center'
                }
            };
            icon = (
                <div style={{padding:'12px 20px 12px 20px', position:'relative'}}>
                    <FilePreview pydio={pydio} node={nodes[0]} loadThumbnail={true} {...previewStyles}/>
                    <span className={className} style={{position:'absolute', bottom: 8, right: 12, fontSize:18, color: accentColor}}/>
                </div>
            );
            primaryText = nodes[0].getLabel() || PathUtils.getBasename(nodes[0].getPath())
        } else {
            icon = (
                <div style={{margin:'8px 20px', backgroundColor: 'var(--md-sys-color-primary-container)', alignItems: 'initial', height: 36, width: 36, borderRadius: '50%', textAlign:'center'}}>
                    <FontIcon className={className} style={{lineHeight:'36px'}}/>
                </div>
            );
            if(activity.object) {
                primaryText = activity.object.name;
            } else {
                primaryText = activity.name;
            }
        }
        summary = (
            <div style={{display:'flex', alignItems:'flex-start', overflow:'hidden', paddingBottom: 8}}>
                {icon}
                <div style={{flex:1, overflow:'hidden', paddingRight: 16}}>
                    <div style={{marginBottom: 4, fontSize: 14, fontWeight: 500, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden', color:'var(--md-sys-color-on-surface)'}}>{primaryText}</div>
                    <div style={{opacity: 1}}>
                        <ActivityMD activity={activity} listContext={listContext}/>
                    </div>
                </div>
            </div>
        );
        let onClick;
        if(activity.type !== 'Delete' && activity.object && activity.object.type === 'Folder' || activity.object.type === 'Document') {
            const nn = nodesFromObject(activity.object, pydio)
            if(nn.length) {
                onClick = () => {
                    pydio.goTo(nn[0])
                    onRequestClose()
                }
                blockStyle.cursor = 'pointer'
            }
        }

        return (
            <div style={blockStyle} onMouseEnter={()=>this.setState({hover:true})} onMouseLeave={()=>this.setState({hover:false})} onClick={onClick}>
                {!oneLiner &&
                    <div style={{display:'flex', alignItems:'center'}}>
                        {activity.actor &&
                            <UserAvatar
                                useDefaultAvatar={true}
                                userId={activity.actor.id}
                                userLabel={activity.actor.name}
                                displayLocalLabel={true}
                                userType={'user'}
                                pydio={pydio}
                                style={{display:'flex', alignItems:'center', maxWidth: '60%'}}
                                labelStyle={{fontSize: 14, fontWeight: 500, paddingLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace:'nowrap'}}
                                avatarStyle={{flexShrink: 0}}
                                avatarSize={28}
                                richOnHover={true}
                            />
                        }
                        <span style={{fontSize:13, display:'inline-block', flex:1, height:18, color: 'rgba(0,0,0,0.23)', fontWeight:500, paddingLeft:8, whiteSpace:'nowrap'}}>{moment(activity.updated).fromNow()}</span>
                    </div>
                }
                {summary}
            </div>
        );

    }

}

Activity.PropTypes = {
    activity: PropTypes.object,
    listContext: PropTypes.string,
    displayContext: PropTypes.oneOf(['infoPanel', 'popover'])
};

Activity = muiThemeable()(Activity);
Activity = PydioContextConsumer(Activity);
export {Activity as default};