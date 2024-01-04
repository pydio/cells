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
        title:'Files and folders (nodes) events : detect files modifications to move them or update their metadata automatically.',
        '0':{
            title:'trigger.create.node',
            icon:'file-plus',
            description:'A new file was uploaded or a new folder was created'
        },
        '1':{
            title:'trigger.read.node',
            icon:'eye',
            description:'A file was downloaded or a folder content was listed'
        },
        '2':{
            title:'trigger.update.path',
            icon:'folder-move',
            description:'A file or folder was moved or renamed'
        },
        '3':{
            title:'trigger.update.content',
            icon:'content-save',
            description:'A file content was updated by edition or upload overwriting'
        },
        '5':{
            title:'trigger.delete.node',
            icon:'delete',
            description:'A file or a folder was definitively deleted'
        },
        '4':{
            title:'trigger.update.metadata',
            icon:'tag',
            description:'Internal metadata were modified on file or folder'
        },
        '6':{
            title:'trigger.update.user-metadata',
            icon:'tag-multiple',
            description:'User-defined metadata were modified (event contains updated metadata)'
        }
    },
    IDM_CHANGE: {
        USER : {
            title:'User events : triggered when adding/removing user and when users log in and log out. Can be used for triggering validation flows or assigning accesses.',
            '0': {
                title:'trigger.create.user',
                icon:'account-plus',
                tint:'#009688',
                description:'A user or a group was created'
            },
            '1': {
                title:'trigger.read.user',
                icon:'account',
                tint:'#009688',
                description:'A user or a group was accessed'
            },
            '2': {
                title:'trigger.update.user',
                icon:'account-box',
                tint:'#009688',
                description:'A user or a group data was updated'
            },
            '3': {
                title:'trigger.delete.user',
                icon:'account-minus',
                tint:'#009688',
                description:'A user or a group was deleted'
            },
            '4': {
                title:'trigger.bind.user',
                icon:'login',
                tint:'#009688',
                description:'A user has logged in'
            },
            '5': {
                title:'trigger.logout.user',
                icon:'logout',
                tint:'#009688',
                description:'A user has logged out'
            }
        },
        ROLE : {
            title:'Role events : can be used to automate accesses based on role names. Use IsTeam, IsGroup, IsUser flags to filter roles.',
            '0': {
                title:'Create Role',
                icon:'account-card-details',
                tint:'#607d8b',
                description:'New role created.'
            },
            '2': {
                title:'Update Role',
                icon:'pencil',
                tint:'#607d8b',
                description:'A role has been updated'
            },
            '3': {
                title:'Delete Role',
                icon:'delete-forever',
                tint:'#607d8b',
                description:'A role has been deleted'
            },
        },
        WORKSPACE : {
            title:'Workspace events : triggered on workspace creation / deletion. Use the Scope flag to filter Workspaces from Cells',
            '0': {
                title:'Create Workspace',
                icon:'folder-plus',
                tint:'#ff9800',
                description:'A workspace has been created'
            },
            '2': {
                title:'Update Workspace',
                icon:'pencil',
                tint:'#ff9800',
                description:'A workspace has been updated'
            },
            '3': {
                title:'Delete Workspace',
                icon:'delete-forever',
                tint:'#ff9800',
                description:'New file uploaded or folder created'
            },
        },
        ACL : {
            title:'ACL events : access control lists link workspaces, nodes and roles together to provide accesses to data.',
            '2': {
                title:'Create/Update Acl',
                icon:'view-list',
                tint:'#795548',
                description:'An access control has been opened'
            },
            '3': {
                title:'Delete Acl',
                icon:'delete-forever',
                tint:'#795548',
                description:'An access control has been closed'
            },
        },
    },
    CHAT_EVENT:{
        title:'Chat Events: react to new chat message or chat room modification',
        MESSAGE: {
            title: 'Chat Messages Events',
            'PUT':{
                title: 'New Chat Message',
                icon: 'chat-plus-outline',
                tint: '#f6d076',
                description: 'A new message has been posted in a ChatRoom.'
            },
            'DELETE':{
                title: 'Chat Message Deleted',
                icon: 'chat-remove-outline',
                tint: '#f6d076',
                description: 'A message has been deleted'
            }
        },
        ROOM: {
            title: 'Chat Rooms Events',
            'PUT':{
                title: 'New Chat Room',
                icon: 'forum-plus-outline',
                tint: '#f6d076',
                description: 'A new room has been created'
            },
            'DELETE':{
                title: 'Chat Room Deleted',
                icon: 'forum-minus-outline',
                tint: '#f6d076',
                description: 'A room has been deleted'
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
                section = {title: k.header, Actions:[]}
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
                    title={"Trigger job on..."}
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
                <FlatButton style={{width:'100%'}} label={"Trigger job on..."} primary={true} onClick={() => this.setState({open: true})} icon={<FontIcon className={"mdi mdi-pulse"}/>}/>
                <List>{list}</List>
            </div>
        )

    }

}


export default Events;