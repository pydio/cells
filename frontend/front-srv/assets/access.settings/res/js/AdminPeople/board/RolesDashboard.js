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
import {Paper, IconButton, TextField, FlatButton, IconMenu, FontIcon, MenuItem} from 'material-ui'
import Editor from '../editor/Editor'
import PydioApi from 'pydio/http/api'
import Pydio from 'pydio'
const PydioComponents = Pydio.requireLib('components');
const {MaterialTable} = PydioComponents;

let RolesDashboard = React.createClass({

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState(){
        return {
            roles: [],
            loading: false,
            showTechnical: false,
        };
    },

    load(){
        const {showTechnical} = this.state;
        this.setState({loading: true});
        PydioApi.getRestClient().getIdmApi().listRoles(showTechnical, 0, 1000).then(roles => {
            this.setState({roles: roles, loading: false});
        }).catch(e => {
            this.setState({loading: false});
        });
    },

    componentDidMount(){
        this.load();
    },

    openTableRows(rows) {
        if (rows.length) {
            this.openRoleEditor(rows[0].role);
        }
    },

    openRoleEditor(idmRole, initialSection = 'activity'){
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
                idmRole:idmRole,
                pydio: pydio,
                initialEditSection:initialSection,
                onRequestTabClose:this.closeRoleEditor,
                advancedAcl:advancedAcl,
            }
        };
        this.props.openRightPane(editorData);
        return true;

    },

    closeRoleEditor(){
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
        return true;
    },


    deleteAction(roleId){
        const {pydio} = this.props;
        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message:pydio.MessageHash['settings.126'],
            validCallback:() => {
                PydioApi.getRestClient().getIdmApi().deleteRole(roleId).then(()=> {
                    this.load();
                })
            }
        });
    },

    createRoleAction(){
        pydio.UI.openComponentInModal('AdminPeople','CreateRoleOrGroupForm', {
            type:'role',
            roleNode:this.state.currentNode,
            openRoleEditor:this.openRoleEditor.bind(this),
            reload: () => {this.load()}
        });
    },

    computeTableData(searchRoleString){
        const {roles} = this.state;
        let data = [];
        roles.map((role) => {
            const label = role.Label;
            if (searchRoleString && label.toLowerCase().indexOf(searchRoleString.toLowerCase()) === -1) {
                return;
            }
            data.push({
                role: role,
                roleId: role.Uuid,
                roleLabel: label,
                isDefault: role.AutoApplies.join(', ') || '-',
                roleSummary: new Date(parseInt(role.LastUpdated)*1000).toISOString()
            });
        });
        return data;
    },

    render(){

        const {searchRoleString, showTechnical} = this.state;

        const buttons = [
            <FlatButton primary={true} label={this.context.getMessage("user.6")} onClick={this.createRoleAction.bind(this)}/>,
            <IconMenu
                iconButtonElement={<IconButton iconClassName={"mdi mdi-filter-variant"}/>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                desktop={true}
                onChange={()=> {this.setState({showTechnical:!showTechnical}, ()=>{this.load();})}}
            >
                <MenuItem primaryText={"Hide technical roles"} value={"hide"} rightIcon={showTechnical ? null : <FontIcon className={"mdi mdi-check"}/>}/>
                <MenuItem primaryText={"Show technical roles"} value={"show"} rightIcon={showTechnical ? <FontIcon className={"mdi mdi-check"}/> : null}/>
            </IconMenu>
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
            {name:'roleSummary', label: 'Last Updated'},
            {name:'isDefault', label: 'Applies to', style:{width:'20%'}, headerStyle:{width:'20%'}},
            {name:'actions', label:'', style:{width:80}, headerStyle:{width:80}, renderCell:(row) => {
                return <IconButton key="delete" iconClassName="mdi mdi-delete" onTouchTap={() => {this.deleteAction(row.roleId)}} onClick={(e)=>{e.stopPropagation()}} iconStyle={iconStyle} />
            }}
        ];
        const data = this.computeTableData(searchRoleString);

        return(

            <div className={"main-layout-nav-to-stack vertical-layout people-dashboard"}>
                <AdminComponents.Header
                    title={this.context.getMessage('69', 'settings')}
                    icon="mdi mdi-account-multiple"
                    actions={buttons}
                    centerContent={centerContent}
                    reloadAction={()=>{this.load()}}
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