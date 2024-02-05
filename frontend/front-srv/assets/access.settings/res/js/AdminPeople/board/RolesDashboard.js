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
import createReactClass from 'create-react-class';
import {Paper, IconButton, FlatButton, IconMenu, FontIcon, MenuItem} from 'material-ui'
const {muiThemeable} = require('material-ui/styles');
import Editor from '../editor/Editor'
import PydioApi from 'pydio/http/api'
import Pydio from 'pydio'
import {loadEditorClass} from "../editor/util/ClassLoader";
const {MaterialTable} = Pydio.requireLib('components');
const {ModernTextField} = Pydio.requireLib('hoc');

let RolesDashboard = createReactClass({
    displayName: 'RolesDashboard',
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
        Pydio.startLoading();
        PydioApi.getRestClient().getIdmApi().listRoles(showTechnical, 0, -1).then(roles => {
            Pydio.endLoading();
            this.setState({roles: roles, loading: false});
        }).catch(e => {
            Pydio.endLoading();
            this.setState({loading: false});
        });
    },

    componentDidMount(){
        this.load();
    },

    openTableRows(rows) {
        if (rows.length && rows[0].role.PoliciesContextEditable) {
            this.openRoleEditor(rows[0].role);
        }
    },

    openRoleEditor(idmRole, initialSection = 'activity'){
        const {pydio, rolesEditorClass, rolesEditorProps} = this.props;
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        loadEditorClass(rolesEditorClass, Editor).then(component => {
            this.props.openRightPane({
                COMPONENT:component,
                PROPS:{
                    ref:"editor",
                    idmRole:idmRole,
                    pydio: pydio,
                    initialEditSection:initialSection,
                    onRequestTabClose:this.closeRoleEditor,
                    ...rolesEditorProps
                }
            });
        }).catch(e => {
            console.log(e)
        });
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

    deleteAction(roleId, roleLabel = undefined){
        const {pydio} = this.props;
        pydio.UI.openConfirmDialog({
            message:pydio.MessageHash['settings.126'],
            destructive:[roleLabel || roleId],
            validCallback:() => {
                PydioApi.getRestClient().getIdmApi().deleteRole(roleId).then(()=> {
                    this.load();
                })
            }
        });
    },

    createRoleAction(){
        pydio.UI.openComponentInModal('AdminPeople','Forms.CreateRoleOrGroupForm', {
            type:'role',
            roleNode:this.state.currentNode,
            openRoleEditor:this.openRoleEditor.bind(this),
            roles: this.state.roles,
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
                lastUpdated: role.LastUpdated
            });
        });
        return data;
    },

    render(){

        const {muiTheme, accessByName} = this.props;
        const styles = AdminComponents.AdminStyles(muiTheme.palette);
        const {searchRoleString, showTechnical} = this.state;
        const hasEditRight = accessByName('Create');

        // Header Buttons & edit functions
        let selectRows = null;
        const buttons = [];
        if(hasEditRight){
            buttons.push(<FlatButton {...styles.props.header.flatButton} primary={true} label={this.context.getMessage("user.6")} onClick={this.createRoleAction.bind(this)}/>);
            selectRows = this.openTableRows.bind(this);
        }
        buttons.push(
            <IconMenu
                iconButtonElement={<IconButton iconClassName={"mdi mdi-filter-variant"} {...styles.props.header.iconButton}/>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                onChange={()=> {this.setState({showTechnical:!showTechnical}, ()=>{this.load();})}}
            >
                <MenuItem primaryText={this.context.getMessage('dashboard.technical.show', 'role_editor')} value={"show"} rightIcon={showTechnical ? <FontIcon className={"mdi mdi-check"}/> : null}/>
                <MenuItem primaryText={this.context.getMessage('dashboard.technical.hide', 'role_editor')} value={"hide"} rightIcon={!showTechnical ? <FontIcon className={"mdi mdi-check"}/>: null}/>
            </IconMenu>
        );

        const searchBox = (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                <div style={{flex: 1, maxWidth:420}}>
                    <ModernTextField
                        fullWidth={true}
                        hintText={this.context.getMessage('47', 'role_editor') + '...'}
                        value={searchRoleString || ''}
                        onChange={(e,v) => this.setState({searchRoleString:v}) }
                        variant={"compact"}
                    />
                </div>
            </div>
        );
        const iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        const columns = [
            {name:'roleLabel', label: this.context.getMessage('32', 'role_editor'), style:{width:'35%', fontSize:15}, headerStyle:{width:'35%'}, sorter:{type:'string', default: true}},
            {name:'lastUpdated', useMoment: true, label: this.context.getMessage('last_update', 'role_editor'), hideSmall:true, sorter:{type:'number'}},
            {name:'isDefault', label: this.context.getMessage('114', 'settings'), style:{width:'20%'}, headerStyle:{width:'20%'}, hideSmall:true, sorter:{type:'string'}},
        ];

        const tableActions = [];
        if(hasEditRight){
            tableActions.push({
                iconClassName:"mdi mdi-pencil" ,
                tooltip:'Edit',
                onClick:(row)=>{this.openRoleEditor(row.role)},
                disable:(row)=>{return !row.role.PoliciesContextEditable}
            });
            tableActions.push({
                iconClassName:"mdi mdi-delete" ,
                tooltip:'Delete',
                onClick:(row)=>{this.deleteAction(row.role.Uuid, row.role.Label)},
                disable:(row)=>{return !row.role.PoliciesContextEditable}
            });
        }
        const data = this.computeTableData(searchRoleString);
        const {body} = AdminComponents.AdminStyles();
        const {tableMaster} = body;
        const blockProps = body.block.props;
        const blockStyle = body.block.container;

        return(

            <div className={"main-layout-nav-to-stack vertical-layout"}>
                <AdminComponents.Header
                    title={this.context.getMessage('69', 'settings')}
                    icon="mdi mdi-account-multiple"
                    actions={buttons}
                    centerContent={searchBox}
                    reloadAction={()=>{this.load()}}
                    loading={this.state.loading}
                />
                <div className={"layout-fill"}>
                    <AdminComponents.SubHeader legend={this.context.getMessage("dashboard.description", "role_editor")}/>
                    <Paper {...blockProps} style={blockStyle}>
                        <MaterialTable
                            data={data}
                            columns={columns}
                            actions={tableActions}
                            onSelectRows={selectRows}
                            deselectOnClickAway={true}
                            showCheckboxes={false}
                            masterStyles={tableMaster}
                            paginate={[10,25, 50, 100]}
                            storageKey={'console.roles.list'}
                        />
                    </Paper>
                </div>
            </div>


        );


    },
});

RolesDashboard = muiThemeable()(RolesDashboard)
export {RolesDashboard as default}