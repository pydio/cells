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
import {Paper, IconButton, TextField, FlatButton} from 'material-ui'
import Editor from '../editor/Editor'
import XMLUtils from 'pydio/util/xml'
import PydioDataModel from 'pydio/model/data-model'
import ResourcesManager from 'pydio/http/resources-manager'
import Pydio from 'pydio'
const PydioComponents = Pydio.requireLib('components');
const {MaterialTable} = PydioComponents;

let RolesDashboard = React.createClass({

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function(){
        return {
            currentNode:this.props.currentNode,
            dataModel:this.props.dataModel,
            loading: false
        };
    },

    componentDidMount: function(){
        this._setLoading = () => {
            this.setState({loading: true}, () => {this.forceUpdate()});
        };
        this._stopLoading = () => {
            this.setState({loading: false}, () => {this.forceUpdate()});
        };
        this.props.currentNode.observe('loaded', this._stopLoading);
        this.props.currentNode.observe('loading', this._setLoading);
        setTimeout(()=>{
            this.props.currentNode.reload();
        }, 100)
    },

    componentWillUnmount: function(){
        this.props.currentNode.stopObserving('loaded', this._stopLoading);
        this.props.currentNode.stopObserving('loading', this._setLoading);
    },

    openTableRows: function(rows) {
        if (rows.length) {
            this.openRoleEditor(rows[0].node);
        }
    },

    openRoleEditor: function(node, initialSection = 'activity'){
        const {advancedAcl, pydio} = this.props;
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        const editorData = {
            COMPONENT:Editor,
            PROPS:{
                ref:"editor",
                node:node,
                pydio: pydio,
                initialEditSection:initialSection,
                onRequestTabClose:this.closeRoleEditor,
                advancedAcl:advancedAcl,
            }
        };
        this.props.openRightPane(editorData);
        return true;

    },

    closeRoleEditor: function(){
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
        return true;
    },


    deleteAction: function(node){
        const dm = new PydioDataModel();
        dm.setSelectedNodes([node]);
        ResourcesManager.loadClassesAndApply(['AdminActions'], () => {
            AdminActions.Callbacks.deleteAction(null, [dm]);
        })
    },

    createRoleAction: function(){
        pydio.UI.openComponentInModal('AdminPeople','CreateRoleOrGroupForm', {type:'role', roleNode:this.state.currentNode, openRoleEditor:this.openRoleEditor.bind(this)});
    },

    computeTableData: function(currentNode, searchRoleString){
        let data = [];
        currentNode.getChildren().forEach((child) => {
            const label = child.getLabel();
            if (searchRoleString && label.toLowerCase().indexOf(searchRoleString.toLowerCase()) === -1) {
                return;
            }
            let roleSummary = '';
            const role = JSON.parse(child.getMetadata().get('role'));
            if(role && role.ACL && Object.keys(role.ACL).length > 1){
                roleSummary = this.context.getMessage('user.10').replace("%i", Object.keys(role.ACL).length - 1);
            }
            data.push({
                node: child,
                roleId: child.getMetadata().get('role_id'),
                roleLabel: label,
                isDefault:child.getMetadata().get('is_default'),
                roleSummary: roleSummary
            });
        });
        return data;
    },

    render: function(){

        const {currentNode, dataModel, searchRoleString} = this.state;

        const buttons = [
            <FlatButton primary={true} label={this.context.getMessage("user.6")} onClick={this.createRoleAction.bind(this)}/>,
        ];

        const centerContent = (
            <div style={{height:40, padding: '0px 20px', width: 240, display: 'inline-block'}}>
                <TextField fullWidth={true} hintText={this.context.getMessage('47', 'role_editor') + '...'} value={searchRoleString || ''} onChange={(e,v) => this.setState({searchRoleString:v}) } />
            </div>
        );
        const iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        const columns = [
            {name:'roleLabel', label: 'Label', style:{width:'35%', fontSize:15}, headerStyle:{width:'35%'}},
            {name:'roleSummary', label: 'Summary'},
            {name:'isDefault', label: 'Applies to', style:{width:'20%'}, headerStyle:{width:'20%'}},
            {name:'actions', label:'', style:{width:80}, headerStyle:{width:80}, renderCell:(row) => {
                return <IconButton key="delete" iconClassName="mdi mdi-delete" onTouchTap={() => {this.deleteAction(row.node)}} onClick={(e)=>{e.stopPropagation()}} iconStyle={iconStyle} />
            }}
        ];
        const data = this.computeTableData(currentNode, searchRoleString);

        return(

            <div className={"main-layout-nav-to-stack vertical-layout people-dashboard"}>
                <AdminComponents.Header
                    title={this.context.getMessage('69', 'settings')}
                    icon="mdi mdi-account-multiple"
                    actions={buttons}
                    centerContent={centerContent}
                    reloadAction={()=>{currentNode.reload();}}
                    loading={this.state.loading}
                />
                <AdminComponents.SubHeader legend="Roles are containers for Access Lists to grant access to any workspaces or customize parameters and actions. They can be manually assigned to any users."/>
                <Paper zDepth={1} style={{margin: 16}} className={"horizontal-layout layout-fill"}>
                    <MaterialTable
                        data={data}
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

export {RolesDashboard as default}