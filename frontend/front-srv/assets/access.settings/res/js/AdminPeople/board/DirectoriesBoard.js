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
import PydioDataModel from 'pydio/model/data-model'
import Node from 'pydio/model/node'
import {Paper, List, ListItem, Subheader, Divider, IconButton, FlatButton, IconMenu, MenuItem, Popover, SelectField, TextField} from 'material-ui'
import {muiThemeable} from 'material-ui/styles';
import LdapEditor from '../editor/ldap/LdapEditor'
import Pydio from 'pydio'
import ResourcesManager from 'pydio/http/resources-manager'
import ServerConfigModel from '../editor/ldap/ServerConfigModel'
const PydioComponents = Pydio.requireLib('components');
const {MaterialTable} = PydioComponents;


let DirectoriesBoard = React.createClass({

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: React.PropTypes.instanceOf(Node).isRequired,
        currentNode: React.PropTypes.instanceOf(Node).isRequired,
        openEditor: React.PropTypes.func.isRequired,
        openRightPane: React.PropTypes.func.isRequired,
        closeRightPane: React.PropTypes.func.isRequired
    },

    getInitialState(){
        return {directories: []};
    },

    // Load from server
    loadDirectories(){
        this.setState({loading: true});
        ServerConfigModel.loadDirectories().then(response => {
            if(response.Directories){
                this.setState({directories: response.Directories});
            } else {
                this.setState({directories: []});
            }
            this.setState({loading: false});
        }).catch(() => {
            this.setState({loading: false});
        });
    },

    deleteDirectory(row){
        if (confirm('Are you sure you want to remove this external directory?')) {
            ServerConfigModel.deleteDirectory(row.ConfigId).then(res => {
                this.loadDirectories();
            });
        }
    },

    openEditor(config = null){
        const {pydio, openRightPane} = this.props;

        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        const editorData = {
            COMPONENT:LdapEditor,
            PROPS:{
                ref:"editor",
                pydio: pydio,
                config : config,
                reload: () => {this.loadDirectories()},
                onRequestTabClose:this.closeEditor.bind(this)
            }
        };
        openRightPane(editorData);
        return true;

    },

    closeEditor(editor){
        const {pydio, closeRightPane} = this.props;

        if(editor && editor.isDirty()){
            if(editor.isCreate()){
                closeRightPane();
                return true;
            }
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        closeRightPane();
        return true;
    },

    openTableRows(rows){
        if(!rows.length) {
            return;
        }
        const row = rows[0];
        this.openEditor(row);
    },

    componentDidMount(){
        ResourcesManager.loadClass('EnterpriseSDK').then(() => {
            this.loadDirectories();
        });
    },

    render(){

        const {directories} = this.state;

        const columns = [
            {name:'DomainName', label:'Directory'},
            {name:'Host', label:'Server Address'},
            {name:'Schedule', label:'Synchronization'},
            {name:'Actions', label:'', style:{width: 80}, headerStyle:{width: 80}, renderCell:(row) => {
                return <IconButton iconClassName={"mdi mdi-delete"} tooltip={"Remove"} onTouchTap={()=>{this.deleteDirectory(row)}} onClick={(e) => {e.stopPropagation()}}/>
            }}
        ];

        return (
            <div className={"main-layout-nav-to-stack vertical-layout people-dashboard"}>
                <AdminComponents.Header
                    title={this.props.currentNode.getLabel()}
                    icon={this.props.currentNode.getMetadata().get('icon_class')}
                    actions={[<FlatButton primary={true} label={"+ Directory"} onTouchTap={() => {this.openEditor()}}/>]}
                    reloadAction={this.loadDirectories.bind(this)}
                    loading={this.state.loading}
                />
                <AdminComponents.SubHeader legend="Connect Pydio to one or many external user directories (currently only LDAP/ActiveDirectory are supported). Users will be synchronized to the internal Pydio directory."/>
                <Paper zDepth={1} style={{margin: 16}} className={"horizontal-layout layout-fill"}>
                    <MaterialTable
                        data={directories}
                        columns={columns}
                        onSelectRows={this.openTableRows.bind(this)}
                        deselectOnClickAway={true}
                        showCheckboxes={false}
                    />
                </Paper>
            </div>
        );

    }

});


DirectoriesBoard = muiThemeable()(DirectoriesBoard);
export {DirectoriesBoard as default}