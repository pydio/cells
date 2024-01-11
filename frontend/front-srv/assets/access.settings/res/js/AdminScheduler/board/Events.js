/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {Divider, FontIcon, IconButton, FlatButton, List, ListItem, MenuItem, Paper, Subheader} from 'material-ui'
import {JobsSchedule} from 'cells-sdk'
const {Stepper} = Pydio.requireLib("components");
const {Dialog, PanelBigButtons} = Stepper;

const LightGrey = '#e0e0e0';

const eventMessages = {
    NODE_CHANGE:{
        title:'trigger.type.nodes',
        '0':{
            title:'trigger.create.node',
            description:'trigger.create.node.description',
            icon:'file-plus'
        },
        '1':{
            title:'trigger.read.node',
            description:'trigger.read.node.description',
            icon:'eye'
        },
        '2':{
            title:'trigger.update.path',
            description:'trigger.update.path.description',
            icon:'folder-move'
        },
        '3':{
            title:'trigger.update.content',
            description:'trigger.update.content.description',
            icon:'content-save'
        },
        '5':{
            title:'trigger.delete.node',
            description:'trigger.delete.node.description',
            icon:'delete'
        },
        '4':{
            title:'trigger.update.metadata',
            description:'trigger.update.metadata.description',
            icon:'tag'
        },
        '6':{
            title:'trigger.update.user-metadata',
            description:'trigger.update.user-metadata.description',
            icon:'tag-multiple'
        }
    },
    IDM_CHANGE: {
        USER : {
            title:'trigger.type.users',
            '0': {
                title:'trigger.create.user',
                icon:'account-plus',
                tint:'#009688',
                description:'trigger.create.user.description'
            },
            '1': {
                title:'trigger.read.user',
                description:'trigger.read.user.description',
                icon:'account',
                tint:'#009688'
            },
            '2': {
                title:'trigger.update.user',
                description:'trigger.update.user.description',
                icon:'account-box',
                tint:'#009688'
            },
            '3': {
                title:'trigger.delete.user',
                description:'trigger.delete.user.description',
                icon:'account-minus',
                tint:'#009688'
            },
            '4': {
                title:'trigger.bind.user',
                description:'trigger.bind.user.description',
                icon:'login',
                tint:'#009688'
            },
            '5': {
                title:'trigger.logout.user',
                description:'trigger.logout.user.description',
                icon:'logout',
                tint:'#009688'
            }
        },
        ROLE : {
            title:'trigger.type.users',
            '0': {
                title:'trigger.role.create',
                description:'trigger.role.create.description',
                icon:'account-card-details',
                tint:'#607d8b'
            },
            '2': {
                title:'trigger.role.update',
                description:'trigger.role.update.description',
                icon:'pencil',
                tint:'#607d8b'
            },
            '3': {
                title:'trigger.role.delete',
                description:'trigger.role.delete.description',
                icon:'delete-forever',
                tint:'#607d8b'
            },
        },
        WORKSPACE : {
            title:'trigger.type.workspaces',
            '0': {
                title:'trigger.workspace.create',
                description:'trigger.workspace.create.description',
                icon:'folder-plus',
                tint:'#ff9800'
            },
            '2': {
                title:'trigger.workspace.update',
                description:'trigger.workspace.update.description',
                icon:'pencil',
                tint:'#ff9800'
            },
            '3': {
                title:'trigger.workspace.delete',
                description:'trigger.workspace.delete.description',
                icon:'delete-forever',
                tint:'#ff9800'
            },
        },
        ACL : {
            title:'trigger.type.acls',
            '2': {
                title:'trigger.acl.create',
                description:'trigger.acl.create.description',
                icon:'view-list',
                tint:'#795548'
            },
            '3': {
                title:'trigger.acl.delete',
                description:'trigger.acl.delete.description',
                icon:'delete-forever',
                tint:'#795548'
            },
        },
    },
    CHAT_EVENT:{
        title:'trigger.type.chats',
        MESSAGE: {
            title: 'trigger.type.chat-messages',
            'PUT':{
                title: 'trigger.chat-message.put',
                description: 'trigger.chat-message.put.description',
                icon: 'chat-plus-outline',
                tint: '#f6d076'
            },
            'DELETE':{
                title: 'trigger.chat-message.delete',
                description: 'trigger.chat-message.delete.description',
                icon: 'chat-remove-outline',
                tint: '#f6d076'
            }
        },
        ROOM: {
            title: 'trigger.type.chat-rooms',
            'PUT':{
                title: 'trigger.chat-room.put',
                description: 'trigger.chat-room.put.description',
                icon: 'forum-plus-outline',
                tint: '#f6d076'
            },
            'DELETE':{
                title: 'trigger.chat-room.delete',
                description: 'trigger.chat-room.delete.description',
                icon: 'forum-minus-outline',
                tint: '#f6d076'
            }
        }
    }
};

class Events extends React.Component{

    constructor(props){
        super(props);
        this.state = {objEvents: this.toObject(props.events || [])};
    }

    static eventData(e) {

        const parts = e.split(':');
        let data;
        if(parts.length === 2 && eventMessages[parts[0]]) {
            data = eventMessages[parts[0]][parts[1]];
        } else if(parts.length === 3 && eventMessages[parts[0]] && eventMessages[parts[0]][parts[1]] && eventMessages[parts[0]][parts[1]][parts[2]]){
            data = eventMessages[parts[0]][parts[1]][parts[2]];
        } else {
            data = {title:e, icon:'pulse', description:''};
        }
        return {
            title : Events.T(data.title),
            description : Events.T(data.description),
            icon: 'mdi mdi-' + data.icon,
            tint: data.tint
        }

    }

    static T(id){
        return Pydio.getMessages()['ajxp_admin.scheduler.' + id] || id;
    }

    onChange(){
        this.props.onChange(Object.keys(this.state.objEvents));
    }

    toObject(ev = []){
        const o = {};
        ev.forEach(e => {o[e] = e});
        return o;
    }

    remove(e){
        const {objEvents} = this.state;
        delete(objEvents[e]);
        this.setState({objEvents}, this.onChange.bind(this));
    }

    add(e){
        const {objEvents} = this.state;
        objEvents[e] = e;
        this.setState({objEvents}, this.onChange.bind(this));
    }

    static flatStruct(s, pref = []) {
        const data = [];
        Object.keys(s).forEach((k) => {
            if(k === 'title'){
                return;
            }
            if(isNaN(k) && k !== 'PUT' && k !== 'DELETE' && k !== 'IDM_CHANGE' && k !== 'CHAT_EVENT'){
                data.push({header: s[k].title});
            }
            const v = s[k];
            if (isNaN(k)  && k !== 'PUT' && k !== 'DELETE') {
                data.push(...Events.flatStruct(v, [...pref, k]))
            } else {
                data.push([...pref, k].join(':'))
            }
        });
        return data;
    }

    static eventsAsBBModel(filter){
        const flat = Events.flatStruct(eventMessages);
        const model = {Sections:[]};
        let section;
        flat.forEach(k => {
            if(k.header){
                if(section && section.Actions.length){
                    model.Sections.push(section);
                }
                // Reset section
                section = {title: Events.T(k.header), Actions:[]}
            } else {
                const eData = Events.eventData(k);
                if(filter && eData.title.toLowerCase().indexOf(filter) === -1 && eData.description.toLowerCase().indexOf(filter) === -1){
                    return
                }
                section.Actions.push({...eData,value: k})
            }
        });
        // Append last
        if(section){
            model.Sections.push(section);
        }
        return model;
    }

    dismiss(){
        this.setState({open: false, filter:''})
    }

    render() {
        const {objEvents, open, filter} = this.state;

        const list = [];
        Object.keys(objEvents).forEach(e => {
            list.push(<ListItem
                key={e}
                disabled={true}
                primaryText={Events.eventData(e).title}
                rightIconButton={<IconButton iconClassName={"mdi mdi-delete"} iconStyle={{color:LightGrey}} onClick={()=>{this.remove(e)}}/>}
            />);
            list.push(<Divider/>)
        });
        list.pop();

        const model = Events.eventsAsBBModel(filter);

        return (
            <div>
                <Dialog
                    title={Events.T('trigger.picker.title')}
                    open={open}
                    dialogProps={{}}
                    onDismiss={()=>{this.dismiss()}}
                    onFilter={(v) => {this.setState({filter:v.toLowerCase()})}}
                >
                    <PanelBigButtons
                        model={model}
                        onPick={(eventId) => {this.add(eventId); this.dismiss()}}
                    />
                </Dialog>
                <FlatButton style={{width:'100%'}} label={Events.T('trigger.picker.title')} primary={true} onClick={() => this.setState({open: true})} icon={<FontIcon className={"mdi mdi-pulse"}/>}/>
                <List>{list}</List>
            </div>
        )

    }

}


export default Events;