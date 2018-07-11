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
const {FormPanel} = Pydio.requireLib('form');
const {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader} = Pydio.requireLib('components');

import Role from './model/Role'
import User from './model/User'


import UserRolesPicker from './user/UserRolesPicker'
import WorkspacesList from './panel/WorkspacesList'
import SharesList from './panel/SharesList'
import React from "react";
import LangUtils from "pydio/util/lang";
import PathUtils from "pydio/util/path";
import Repository from "pydio/model/repository";
import {requireLib} from "pydio";
import {FlatButton, IconButton, IconMenu, MenuItem, RaisedButton, Snackbar} from "material-ui";

import RoleInfo from './info/RoleInfo'
import UserInfo from './info/UserInfo'
import GroupInfo from './info/GroupInfo'

class Editor extends React.Component{

    constructor(props, context){
        super(props, context);
        if(props.node){
            this.state = this.nodeToState(props.node);
        } else if(props.idmRole) {
            this.state = {
                idmRole : props.idmRole,
                roleType: "role",
                currentPane:'info'
            };
            this.loadRoleData(true);
        }
        const loader = AdminComponents.PluginsLoader.getInstance(this.props.pydio);
        loader.loadPlugins().then(plugins => {
            this.setState({pluginsRegistry: plugins});
        })
    }

    nodeToState(node){
        const mime = node.getAjxpMime();
        const scope = mime === "group" ? "group" : "user";
        let observableUser;

        const idmUser = node.getMetadata().get("IdmUser");
        observableUser = new User(idmUser);
        observableUser.observe('update', ()=>{this.forceUpdate();});
        observableUser.load();

        return {
            observableUser,
            roleLabel:PathUtils.getBasename(node.getPath()),
            roleType:scope,
            dirty:false,
            currentPane:'info',

            localModalContent:{},
            loadingMessage:this.getMessage('home.6', 'ajxp_admin'),
        };
    }

    loadRoleData(showLoader){
        if(showLoader) {
            this.setState({loadingMessage:this.getMessage('home.6', 'ajxp_admin')});
        }
        const {idmRole} = this.state;
        const role = new Role(idmRole);
        role.load().then(() => {
            this.setState({loadingMessage:null, observableRole: role});
            role.observe('update', () => {this.forceUpdate()});
        });

    }


    getChildContext() {
        const messages = this.context.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: (messageId, namespace = 'pydio_role') => messages[namespace + (namespace ? "." : "") + messageId] || messageId,
            getPydioRoleMessage: messageId => messages['role_editor.' + messageId] || messageId,
            getRootMessage: messageId => messages[messageId] || messageId
        };
    }


    getMessage(messageId, namespace='pydio_role'){
        return this.getChildContext().getMessage(messageId, namespace);
    }

    getPydioRoleMessage(messageId){
        return this.getChildContext().getMessage(messageId, 'role_editor');
    }

    getRootMessage(messageId){
        return this.getChildContext().getMessage(messageId, '');
    }

    setSelectedPane(key){
        this.setState({currentPane:key});
    }

    componentWillReceiveProps(newProps){
        /*
        var oldN = this.props.node ? this.props.node.getPath() : 'EMPTY';
        var newN = newProps.node ? newProps.node.getPath(): 'EMPTY';
        if(newN != oldN){
            this.setState(this.nodeToState(newProps.node), function(){
                this.loadRoleData(true);
            }.bind(this));
        }
        */
    }

    componentDidMount(){
        this.loadRoleData(true);
        if(this.props.registerCloseCallback){
            this.props.registerCloseCallback(()=>{
                if(this.state && this.state.dirty && !global.confirm(this.getPydioRoleMessage('19'))){
                    return false;
                }
            });
        }
    }

    showModal(modal){
        this.setState({modal:modal});
    }

    hideModal(){
        this.setState({modal:null});
    }



    logAction(message){
        this.setState({snackbar:message, snackOpen:true});
    }

    hideSnackBar(){
        this.setState({snackOpen:false});
    }

    controllerUpdateParameter(type, crudAction, scope, pluginName, paramName, paramValue, additionalFormData=null){
        let role = this.state.roleWrite;
        let metaData = this.state.parametersMetaData || {PARAMETERS:{},ACTIONS:{}};
        const key = (type == 'parameter' ? 'PARAMETERS' : 'ACTIONS');
        if(crudAction == 'add' || crudAction == 'update'){
            if(!role[key]) role[key] = {};
            if(!role[key][scope]) role[key][scope] = {};
            if(!role[key][scope][pluginName]) role[key][scope][pluginName] = {};
            role[key][scope][pluginName][paramName] = (crudAction == 'add'?(paramValue !== undefined?paramValue:''):paramValue);
            if(additionalFormData){
                additionalFormData['ajxp_form_element'] = paramName;
                if(!metaData[key][scope]) metaData[key][scope] = {};
                if(!metaData[key][scope][pluginName]) metaData[key][scope][pluginName] = {};
                metaData[key][scope][pluginName][paramName] = additionalFormData;
                //this.setState({parametersMetaData:metaData});
            }
            this.updateRoleWrite(role);
        }else  if(crudAction == 'delete'){
            try{
                let parent = role[key][scope][pluginName];
                if(parent){
                    delete parent[paramName];
                    this.updateRoleWrite(role);
                }
            }catch(e){}
        }
        if(additionalFormData && additionalFormData['type']){
            // Trigger save now for uploaded images
            this.setState({parametersMetaData:metaData}, function(){
                this.saveRoleChanges(true);
            }.bind(this));
        }
    }

    controllerUpdateAcl(scope, acl){
        var role = this.state.roleWrite;
        if(role.ACL){
            role.ACL[scope] = acl;
            this.updateRoleWrite(role);
        }
    }

    controllerUpdateMask(mask){
        let role = this.state.roleWrite;
        if(role['NODES']){
            role['NODES'] = mask;
            this.updateRoleWrite(role);
        }
    }

    controllerUpdateUserProfile(profile){
        var role = this.state.roleWrite;
        if(!role.USER) role.USER = this.state.roleData.USER;
        role.USER.PROFILE = profile;
        this.updateRoleWrite(role);
    }

    controllerOrderUserRoles(roles){

        const {roleId, roleData} = this.state;
        const currentUserId = roleId.replace("PYDIO_USR_/", "");
        let stateRoles = [];
        roleData.USER.ROLES.map(function(r){
            const crtDetail = roleData.USER.ROLES_DETAILS[r] || {label:r};
            if(crtDetail.groupRole || crtDetail.userRole) {
                stateRoles.push(r);
            }
        });
        stateRoles = stateRoles.concat(roles);
        roleData.USER.ROLES = stateRoles;
        PydioApi.getClient().request({
            get_action:"edit",
            sub_action:"user_reorder_roles",
            user_id:currentUserId,
            roles:JSON.stringify(roles)
        }, function(transport){
            this.loadRoleData();
        }.bind(this));
    }

    controllerUpdateUserRoles(roles){

        var currentUserId = this.state.roleId.replace("PYDIO_USR_/", "");
        var previousRoles = this.state.roleData.USER.ROLES || [];
        var remove = previousRoles.slice(0), add = roles.slice(0);
        for(var i=0; i< previousRoles.length; i++){
            add = LangUtils.arrayWithout(add, add.indexOf(previousRoles[i]));
        }
        for(i=0; i< roles.length; i++){
            remove = LangUtils.arrayWithout(remove, remove.indexOf(roles[i]));
        }
        if(!add.length && !remove.length) return;

        let stateRoles = [];
        const crtDetails = this.state.roleData.USER.ROLES_DETAILS;
        this.state.roleData.USER.ROLES.map(function(r){
            const crtDetail = crtDetails[r] || {label:r};
            if(crtDetail.groupRole || crtDetail.userRole) {
                stateRoles.push(r);
            }
        });
        stateRoles = stateRoles.concat(roles);
        this.state.roleData.USER.ROLES = stateRoles;

        var jsonData = {users:[currentUserId], roles:{add:add,remove:remove}};
        PydioApi.getClient().request({
            get_action:"edit",
            sub_action:"users_bulk_update_roles",
            json_data:JSON.stringify(jsonData)
        }, function(transport){
            this.loadRoleData();
        }.bind(this));

    }

    controllerGetBinaryContext(){
        /*
        if(this.state.roleType == "user"){
            return "user_id="+this.state.roleId.replace("PYDIO_USR_/", "");
        }else if(this.state.roleType == "group"){
            return "group_id="+this.state.roleId.replace("PYDIO_GRP_/", "");
        }else{
            return "role_id="+this.state.roleId;
        }
        */
        return "";
    }

    getController(){
        if(!this._controller){
            const controller = {};
            controller.updateParameter = this.controllerUpdateParameter.bind(this);
            controller.updateAcl = this.controllerUpdateAcl.bind(this);
            controller.updateMask = this.controllerUpdateMask.bind(this);
            controller.updateUserProfile = this.controllerUpdateUserProfile.bind(this);
            controller.updateUserRoles = this.controllerUpdateUserRoles.bind(this);
            controller.orderUserRoles = this.controllerOrderUserRoles.bind(this);
            controller.getBinaryContext = this.controllerGetBinaryContext.bind(this);
            this._controller = controller;
        }
        return this._controller;
    }

    render(){
        const {advancedAcl, pydio} = this.props;
        const {observableRole, observableUser, pluginsRegistry, currentPane, modal} = this.state;

        const filterPages = (wsId, role) => Repository.isInternal(wsId);
        const filterNoPages = (wsId, role) => !Repository.isInternal(wsId) && wsId !== "pydiogateway";

        let title = 'TITLE';
        let infoTitle = "";
        let infoMenuTitle = this.getMessage('24'); // user information
        let otherForm;

        if(this.state.roleType === 'user') {

            title = observableUser.getIdmUser().Login;
            otherForm = <UserInfo user={observableUser} pydio={pydio} pluginsRegistry={pluginsRegistry}/>

        }else if(this.state.roleType === 'group'){

            infoTitle = this.getMessage('26'); // group information
            infoMenuTitle = this.getMessage('27');
            title = observableUser.getIdmUser().GroupLabel;
            otherForm = <GroupInfo group={observableUser} pydio={pydio} pluginsRegistry={pluginsRegistry}/>

        }else if(this.state.roleType === 'role'){

            infoTitle = this.getMessage('28'); // role information
            infoMenuTitle = this.getMessage('29');
            otherForm = <RoleInfo role={observableRole} pydio={pydio} pluginsRegistry={pluginsRegistry}/>

        }

        let saveDisabled = true;
        let save = ()=>{}, revert= ()=>{};
        if(observableUser) {
            saveDisabled = !observableUser.isDirty();
            save = () => {observableUser.save()};
            revert = () => {observableUser.revert()};
        } else if(observableRole){
            saveDisabled = !observableRole.isDirty();
            save = () => {observableRole.save()};
            revert = () => {observableRole.revert()};
        }


        const rightButtons = (
            <div>
                <FlatButton key="undo" disabled={saveDisabled} secondary={true} label={this.getMessage('plugins.6', 'ajxp_admin')} onTouchTap={revert}/>
                <FlatButton key="save" disabled={saveDisabled} secondary={true} label={this.getRootMessage('53')} onTouchTap={save}/>
                <RaisedButton key="close" label={this.getMessage('33')} onTouchTap={() => { this.props.onRequestTabClose(); }}/>
            </div>
        );

        const leftNav = [
            <PaperEditorNavHeader key="1" label={this.getMessage('ws.28', 'ajxp_admin')}/>,
            <PaperEditorNavEntry key="info" keyName="info" onClick={this.setSelectedPane.bind(this)} label={infoMenuTitle} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavHeader key="2" label={this.getMessage('34')}/>,
            <PaperEditorNavEntry key="workspaces" keyName="workspaces" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('35')} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavEntry key="pages" keyName="pages" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('36')} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavHeader key="3" label={this.getMessage('37')}/>,
            <PaperEditorNavEntry key="add-info" keyName="add-info" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('38')} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavEntry key="glob-params" keyName="global-params" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('39')} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavEntry key="ws-params" keyName="ws-params" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('40')} selectedKey={this.state.currentPane}/>
        ];

        let panes = [];
        const classFor = key => currentPane === key ? 'layout-fill' : '';
        const styleFor = key => currentPane === key ? {overflow: 'auto'} : {height: 0, overflow: 'hidden'};
        panes.push(
            <div key="info" className={'avatar-provider ' + classFor('info')} style={styleFor('info')}>
                {infoTitle && !this.state.loadingMessage ? <h3 className="paper-right-title">{infoTitle}</h3> : null}
                {otherForm}
                <WorkspacesList
                    key="global-scope"
                    roleRead={this.state.roleScope}
                    roleParent={this.state.roleParent}
                    roleType={this.state.roleType}
                    Controller={this.getController()}
                    showModal={this.showModal.bind(this)}
                    hideModal={this.hideModal.bind(this)}
                    globalData={{}}
                    showGlobalScopes={{PYDIO_REPO_SCOPE_ALL:this.getPydioRoleMessage('12d')}}
                    globalScopesFilterType="global"
                    initialEditCard="PYDIO_REPO_SCOPE_ALL"
                    noParamsListEdit={true}
                    editOnly={true}
                    displayFormPanel={true}
                />
            </div>
        );
        /*


        panes.push(
            <div key="add-info" className={classFor('add-info')} style={styleFor('add-info')}>
                <h3 className="paper-right-title">{this.getMessage('41')}
                    <div className="section-legend">{this.getMessage('42')}</div>
                </h3>
                <WorkspacesList {...this.state}
                                key="global-all"
                                showModal={this.showModal.bind(this)}
                                hideModal={this.hideModal.bind(this)}
                                globalData={this.state.roleData.ALL}
                                showGlobalScopes={{PYDIO_REPO_SCOPE_ALL:this.getPydioRoleMessage('12d')}}
                                globalScopesFilterType="global-noscope"
                                initialEditCard="PYDIO_REPO_SCOPE_ALL"
                                editOnly={true}
                                roleType={this.state.roleType}
                />
            </div>
        );
        panes.push(
            <div key="workspaces" className={classFor('workspaces')} style={styleFor('workspaces')}>
                <h3 className="paper-right-title">
                    {this.getRootMessage('250')}
                    <div className="section-legend">{this.getMessage('43')}</div>
                    <div className="read-write-header">
                        <span>read</span>
                        <span>write</span>
                        <span>deny</span>
                    </div>
                    <br/>
                </h3>
                <WorkspacesList {...this.state}
                                key="workspaces-list"
                                listType="acl"
                                roleType={this.state.roleType}
                                advancedAcl={advancedAcl}
                                showModal={this.showModal.bind(this)}
                                hideModal={this.hideModal.bind(this)}
                                globalData={this.state.roleData.ALL}
                                filterCards={filterNoPages}/>
            </div>
        );

        panes.push(
            <div key="pages" className={classFor('pages')} style={styleFor('pages')}>
                <h3 className="paper-right-title">{this.getMessage('44')}
                    <div className="section-legend">{this.getMessage('45')}</div>
                    <div className="read-write-header">
                        <span>{this.getMessage('react.5a', 'ajxp_admin')}</span>
                        <span>{this.getMessage('react.5b', 'ajxp_admin')}</span>
                        <span>{this.getMessage('react.5', 'ajxp_admin')}</span>
                    </div>
                    <br/>
                </h3>
                <WorkspacesList {...this.state}
                                key="workspaces-pages"
                                listType="acl"
                                roleType={this.state.roleType}
                                showModal={this.showModal.bind(this)}
                                hideModal={this.hideModal.bind(this)}
                                globalData={this.state.roleData.ALL}
                                filterCards={filterPages}/>
            </div>
        );
        panes.push(
            <div key="global-params" className={classFor('global-params')} style={styleFor('global-params')}>
                <h3 className="paper-right-title">{this.getMessage('46')}
                    <div className="section-legend">{this.getMessage('47')}</div>
                </h3>
                <WorkspacesList {...this.state}
                                key="workspaces-global"
                                roleType={this.state.roleType}
                                showModal={this.showModal.bind(this)}
                                hideModal={this.hideModal.bind(this)}
                                globalData={this.state.roleData.ALL}
                                showGlobalScopes={this.state.roleData.ALL?{
                                    PYDIO_REPO_SCOPE_ALL:this.getPydioRoleMessage('12d'),
                                    PYDIO_REPO_SCOPE_SHARED:this.getPydioRoleMessage('12e')
                                }:{}}
                                globalScopesFilterType="workspace"
                />
            </div>
        );
        panes.push(
            <div key="ws-param" className={classFor('ws-param')} style={styleFor('ws-params')}>
                <h3 className="paper-right-title">
                    {this.getMessage('40')}
                    <div className="section-legend">{this.getMessage('48')}</div>
                </h3>
                <WorkspacesList {...this.state}
                                key="workspaces-list"
                                listType="parameters"
                                roleType={this.state.roleType}
                                showModal={this.showModal.bind(this)}
                                hideModal={this.hideModal.bind(this)}
                                globalData={this.state.roleData.ALL}
                                filterCards={filterNoPages}/>
            </div>
        );

        */

        let loadingMessage = null;
        if(this.state.loadingMessage){
            loadingMessage = (
                <div className="loader-container layout-fill vertical-layout">
                    <div className="loader-message" style={{margin: 'auto', color: 'rgba(0,0,0,0.33)', fontWeight: '500', fontSize: 16}}>{this.state.loadingMessage}</div>
                </div>
            );
        }
        return (
            <PaperEditorLayout
                title={title}
                titleActionBar={rightButtons}
                contentFill={true}
                leftNav={leftNav}
                className={"edit-object-" + this.state.roleType }
            >
                <Snackbar
                    message={this.state.snackbar || ""}
                    open={this.state.snackOpen}
                    autoHideDuration={4000}
                    ref="snack"
                    action="Dismiss"
                    onRequestClose={this.hideSnackBar.bind(this)}
                />
                {modal}
                {loadingMessage}
                {panes}
            </PaperEditorLayout>
        );

    }

}

Editor.contextTypes = {
    pydio:React.PropTypes.instanceOf(Pydio)
};

Editor.childContextTypes = {
    messages:React.PropTypes.object,
    getMessage:React.PropTypes.func,
    getPydioRoleMessage:React.PropTypes.func,
    getRootMessage:React.PropTypes.func
};


Editor.propTypes ={
    node: React.PropTypes.instanceOf(AjxpNode),
    closeEditor:React.PropTypes.func,
    registerCloseCallback:React.PropTypes.func
};

export {Editor as default}