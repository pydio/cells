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

const React = require('react');
const LangUtils = require('pydio/util/lang');
const PathUtils = require('pydio/util/path');
const Repository = require('pydio/model/repository');
const {FormPanel} = require('pydio').requireLib('form');
const {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader} = require('pydio').requireLib('components');
const {FlatButton, RaisedButton, Snackbar, IconMenu, IconButton, MenuItem} = require('material-ui');

import EditorCache from './util/EditorCache'
import UserPasswordDialog from './user/UserPasswordDialog'
import UserRolesPicker from './user/UserRolesPicker'
import WorkspacesList from './panel/WorkspacesList'
import SharesList from './panel/SharesList'

class Editor extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = this._nodeToState(props.node);
    }

    getChildContext() {
        const messages = this.context.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function (messageId, namespace = 'pydio_role') {
                return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
            },
            getPydioRoleMessage: function (messageId) {
                return messages['role_editor.' + messageId] || messageId;
            },
            getRootMessage: function (messageId) {
                return messages[messageId] || messageId;
            }
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

    _loadRoleData(showLoader){
        if(showLoader) {
            this.setState({loadingMessage:this.getMessage('home.6', 'ajxp_admin')});
        }
        PydioApi.getClient().request({
            get_action:"edit",
            sub_action:"edit_role",
            role_id: this.state.roleId,
            format:'json'
        }, function(transport){
            //if(!this.isMounted()) return;
            this._loadPluginsDataToCache(function(){
                this.setState({loadingMessage:null});
                this._parseRoleResponse(transport.responseJSON);
            }.bind(this));
        }.bind(this));
    }

    _parsePluginsDataForCache(response){
        let map = new Map();
        for(let pluginName in response.LIST){
            if(!response.LIST.hasOwnProperty(pluginName)) continue;
            var pData = response.LIST[pluginName];
            var submap = new Map();
            for(var key in pData){
                if(!pData.hasOwnProperty(key)) continue;
                var entry = pData[key];
                if(entry['action']) submap.set(entry['action'], {label:entry['label']});
                else if(entry['parameter']) submap.set(entry['parameter'], entry['attributes']);
            }
            map.set(pluginName, submap);
        }
        return map;
    }

    _loadPluginsDataToCache(callback){
        if(EditorCache.CACHE){
            callback();
        }else{
            const client = PydioApi.getClient();
            EditorCache.CACHE = {};
            this.setState({loadingMessage:this.getMessage('22')});
            client.request({get_action:'list_all_plugins_actions'}, function(transport1){
                EditorCache.CACHE['ACTIONS'] = this._parsePluginsDataForCache(transport1.responseJSON);
                this.setState({loadingMessage:this.getMessage('23')});
                client.request({get_action:'list_all_plugins_parameters'}, function(transport2){
                    EditorCache.CACHE['PARAMETERS'] = this._parsePluginsDataForCache(transport2.responseJSON);
                    callback();
                }.bind(this));
            }.bind(this));
            global.pydio.observe("admin_clear_plugins_cache", function(){
                EditorCache.CACHE = null;
            });
        }
    }

    _scopeParamsToScope(roleData, roleRead){
        var SCOPE = {};
        for (var key in roleData.SCOPE_PARAMS){
            if(!roleData.SCOPE_PARAMS.hasOwnProperty(key)) continue;
            var param = roleData.SCOPE_PARAMS[key];
            var nameParts = param.name.split('/');
            var repoScope = nameParts[0];
            var pluginName = nameParts[1];
            var paramName = nameParts[2];
            if(!SCOPE[repoScope]) SCOPE[repoScope] = {};
            if(!SCOPE[repoScope][pluginName]) SCOPE[repoScope][pluginName] = {};
            var value;
            if(roleRead['PARAMETERS'][repoScope] && roleRead['PARAMETERS'][repoScope][pluginName]
                && roleRead['PARAMETERS'][repoScope][pluginName][paramName] !== undefined
            ){
                value = roleRead['PARAMETERS'][repoScope][pluginName][paramName];
            }else{
                value = param.default!==undefined?param.default:'';
                if(param.type == 'boolean') value = (value == "true" || value === true);
                else if(param.type == 'integer') value = parseInt(value);
            }
            SCOPE[repoScope][pluginName][paramName] = value;
        }
        return {ACL:{},ACTIONS:{},PARAMETERS:SCOPE};
    }

    _parseRoleResponse(roleData){

        LangUtils.forceJSONArrayToObject(roleData.ROLE, "ACL");
        LangUtils.forceJSONArrayToObject(roleData.ROLE, "ACTIONS");
        LangUtils.forceJSONArrayToObject(roleData.ROLE, "PARAMETERS");

        var roleWrite = LangUtils.deepCopy(roleData.ROLE);
        var roleParent = {};
        if(roleData.PARENT_ROLE){
            roleParent = roleData.PARENT_ROLE;
            LangUtils.forceJSONArrayToObject(roleParent, "ACL");
            LangUtils.forceJSONArrayToObject(roleParent, "ACTIONS");
            LangUtils.forceJSONArrayToObject(roleParent, "PARAMETERS");
        }
        var roleRead = this._recomputeRoleRead(roleParent, roleWrite);
        roleData.SCOPE = this._scopeParamsToScope(roleData, roleRead);
        this.setState({
            roleData:roleData,
            roleScope:roleData.SCOPE,
            roleParent:roleParent,
            roleWrite:roleWrite,
            roleRead:roleRead,
            dirty:false
        });
    }

    _recomputeRoleRead(roleParent, roleMain, skipSetState=true){
        var roleRead = roleMain;
        if(roleParent) {
            roleRead = LangUtils.mergeObjectsRecursive(roleParent, roleMain);
        }
        if(!skipSetState){
            this.setState({roleRead:roleRead});
        }
        return roleRead;
    }

    _nodeToState(node){
        const mime = node.getAjxpMime();
        let scope = mime;
        let roleId;
        if(mime == "role"){
            roleId = node.getMetadata().get("role_id");
        }else if(mime == "group"){
            roleId = "PYDIO_GRP_" + node.getPath().replace("/idm/users", "");
        }else if(mime == "user" || mime == "user_editable"){
            roleId = "PYDIO_USR_/" + PathUtils.getBasename(node.getPath());
            scope = "user";
        }
        return {
            roleId:roleId,
            roleLabel:PathUtils.getBasename(node.getPath()),
            roleType:scope,
            dirty:false,
            roleData:{},
            roleParent:{},
            roleWrite:{},
            roleRead:{},
            roleScope:{},
            localModalContent:{},
            currentPane:'info',
            loadingMessage:this.getMessage('home.6', 'ajxp_admin'),
            Controller:this.getController()
        };
    }

    _toggleUserLock(userId, currentLock, buttonAction){
        var reqParams = {
            get_action:"edit",
            sub_action:"user_set_lock",
            user_id : userId
        };
        if(buttonAction == "user_set_lock-lock"){
            reqParams["lock"] = (currentLock.indexOf("logout") > -1 ? "false" : "true");
            reqParams["lock_type"] = "logout";
        }else{
            reqParams["lock"] = (currentLock.indexOf("pass_change") > -1 ? "false" : "true");
            reqParams["lock_type"] = "pass_change";
        }
        PydioApi.getClient().request(reqParams, function(transport){
            this._loadRoleData();
        }.bind(this));

    }

    setSelectedPane(key){
        this.setState({currentPane:key});
    }

    componentWillReceiveProps(newProps){
        var oldN = this.props.node ? this.props.node.getPath() : 'EMPTY';
        var newN = newProps.node ? newProps.node.getPath(): 'EMPTY';
        if(newN != oldN){
            this.setState(this._nodeToState(newProps.node), function(){
                this._loadRoleData(true);
            }.bind(this));
        }
    }

    componentDidMount(){
        this._loadRoleData(true);
        if(this.props.registerCloseCallback){
            this.props.registerCloseCallback(function(){
                if(this.state && this.state.dirty && !global.confirm(this.getPydioRoleMessage('19'))){
                    return false;
                }
            }.bind(this));
        }
    }

    showModal(modal){
        this.setState({modal:modal});
    }

    hideModal(){
        this.setState({modal:null});
    }

    updateRoleWrite(roleWrite, dirty=true){
        const roleRead = this._recomputeRoleRead(this.state.roleParent, roleWrite);
        this.setState({
            dirty:dirty,
            roleWrite:roleWrite,
            roleRead:roleRead,
            roleScope:this._scopeParamsToScope(this.state.roleData, roleRead)
        });
    }

    resetRoleChanges(){
        this.updateRoleWrite(LangUtils.deepCopy(this.state.roleData.ROLE), false);
    }

    saveRoleChanges(reload=false){

        let jsonData = {
            ROLE:this.state.roleWrite,
            METADATA:this.state.parametersMetaData || {}
        };
        if(this.state.roleWrite.USER){
            jsonData["USER"] = this.state.roleWrite.USER;
        }else if(this.state.roleWrite.GROUP && this.state.roleWrite.GROUP.LABEL){
            jsonData["GROUP_LABEL"] = this.state.roleWrite.GROUP.LABEL;
        }else if(this.state.roleWrite.LABEL){
            jsonData["ROLE_LABEL"] = this.state.roleWrite.LABEL;
        }

        PydioApi.getClient().request({
            get_action:'edit',
            sub_action:'post_json_role',
            role_id:this.state.roleId,
            json_data:JSON.stringify(jsonData)
        }, function(transport){
            this.logAction(this.getPydioRoleMessage('20'));
            if(reload){
                this._loadRoleData();
            }else{
                this.setState({dirty:false});
            }
            if(this.props.node.getParent()){
                this.props.node.getParent().reload();
            }
        }.bind(this));
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
            this._loadRoleData();
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
            this._loadRoleData();
        }.bind(this));

    }

    controllerGetBinaryContext(){
        if(this.state.roleType == "user"){
            return "user_id="+this.state.roleId.replace("PYDIO_USR_/", "");
        }else if(this.state.roleType == "group"){
            return "group_id="+this.state.roleId.replace("PYDIO_GRP_/", "");
        }else{
            return "role_id="+this.state.roleId;
        }
    }

    getController(){
        let controller = {};
        controller.updateParameter = this.controllerUpdateParameter.bind(this);
        controller.updateAcl = this.controllerUpdateAcl.bind(this);
        controller.updateMask = this.controllerUpdateMask.bind(this);
        controller.updateUserProfile = this.controllerUpdateUserProfile.bind(this);
        controller.updateUserRoles = this.controllerUpdateUserRoles.bind(this);
        controller.orderUserRoles = this.controllerOrderUserRoles.bind(this);
        controller.getBinaryContext = this.controllerGetBinaryContext.bind(this);
        return controller;
    }

    render(){
        const {advancedAcl} = this.props;

        const filterPages = function(wsId, role){
            return Repository.isInternal(wsId);
        };
        const filterNoPages = function(wsId, role){
            return !Repository.isInternal(wsId) && wsId !== "pydiogateway";
        };

        var title = PathUtils.getBasename(this.props.node.getPath());
        var infoTitle = "";
        var infoMenuTitle = this.getMessage('24'); // user information
        var testTitle;
        var defs, values, otherForm, changeListener;
        if(this.state.roleType === 'user' && this.state.roleData && this.state.roleData.ALL) {

            try {
                testTitle = this.state.roleRead['PARAMETERS']['PYDIO_REPO_SCOPE_ALL']['core.conf']['displayName'];
                if(testTitle) {
                    title = testTitle;
                }
            } catch (e) {}
            const userId = PathUtils.getBasename(this.props.node.getPath());
            const locked = this.state.roleData.USER.LOCK || "";
            const buttonCallback = (action) => {
                if(action === "update_user_pwd"){
                    this.props.pydio.UI.openComponentInModal('AdminPeople', 'UserPasswordDialog', {userId: userId});
                }else{
                    this._toggleUserLock(userId, locked, action);
                }
            };

            otherForm = (
                <div>
                    <h3 className={"paper-right-title"} style={{display:'flex', alignItems: 'center'}}>
                        <div style={{flex:1}}>
                            {this.getMessage('24')}
                            <div className={"section-legend"}>{this.getMessage('54')}</div>
                        </div>
                        <IconMenu
                            iconButtonElement={<IconButton iconClassName={"mdi mdi-dots-vertical"}/>}
                            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                            targetOrigin={{horizontal: 'right', vertical: 'top'}}
                            tooltip={"Actions"}
                        >
                            <MenuItem primaryText={this.getPydioRoleMessage('25')} onTouchTap={() => buttonCallback('update_user_pwd')}/>
                            <MenuItem primaryText={this.getPydioRoleMessage((locked.indexOf('logout') > -1?'27':'26'))} onTouchTap={() => buttonCallback('user_set_lock-lock')}/>
                            <MenuItem primaryText={this.getPydioRoleMessage((locked.indexOf('pass_change') > -1?'28b':'28'))} onTouchTap={() => buttonCallback('user_set_lock-pass_change')}/>
                        </IconMenu>
                    </h3>
                </div>
            );

        }else if(this.state.roleType === 'group'){

            // GROUP MAIN INFO
            infoTitle = this.getMessage('26'); // group information
            infoMenuTitle = this.getMessage('27');
            try {
                testTitle = (this.state.roleWrite.GROUP &&this.state.roleWrite.GROUP.LABEL ) ? this.state.roleWrite.GROUP.LABEL : this.state.roleData.GROUP.LABEL;
                if(testTitle) title = testTitle;
            } catch (e) {}

            if(this.state.roleData.GROUP){
                defs = [
                    {"name":"groupPath",label:this.getPydioRoleMessage('34'),"type":"string", readonly:true},
                    {"name":"groupLabel",label:this.getPydioRoleMessage('35'),"type":"string", }
                ];
                let label = (this.state.roleWrite.GROUP &&this.state.roleWrite.GROUP.LABEL ) ? this.state.roleWrite.GROUP.LABEL : this.state.roleData.GROUP.LABEL;
                values = {
                    groupPath :this.state.roleData.GROUP.PATH || "/",
                    groupLabel:label
                };
                changeListener = function(paramName, newValue, oldValue){
                    if(!this.state.roleWrite.GROUP) this.state.roleWrite.GROUP = {};
                    this.state.roleWrite.GROUP.LABEL = newValue;
                    this.updateRoleWrite(this.state.roleWrite);
                }.bind(this);
                otherForm = (
                    <FormPanel
                        key="form"
                        parameters={defs}
                        onParameterChange={changeListener}
                        values={values}
                        depth={-2}
                    />
                );
            }

        }else if(this.state.roleType === 'role'){

            // ROLE MAIN INFO
            infoTitle = this.getMessage('28'); // role information
            infoMenuTitle = this.getMessage('29');
            try {
                testTitle = this.state.roleRead.LABEL;
                if(testTitle) title = testTitle;
            } catch (e) {}

            if(this.state.roleData.ALL){
                defs = [
                    {"name":"roleId", label:this.getPydioRoleMessage('31'),"type":"string", readonly:true},
                    {"name":"roleLabel", label:this.getPydioRoleMessage('32'),"type":"string"},
                    {"name":"applies", label:this.getPydioRoleMessage('33'),"type":"select", multiple:true, choices:this.state.roleData.ALL.PROFILES.join(",")}
                ];
                values = {
                    roleId:this.state.roleId,
                    applies:LangUtils.objectValues(this.state.roleRead.APPLIES),
                    roleLabel:this.state.roleRead.LABEL,
                };
                changeListener = function(paramName, newValue, oldValue){
                    if(paramName === "applies") {
                        this.state.roleWrite.APPLIES = newValue.split(',');
                    } else if(paramName === "roleLabel"){
                        this.state.roleWrite.LABEL = newValue;
                    }
                    this.updateRoleWrite(this.state.roleWrite);
                }.bind(this);
                otherForm = (
                    <FormPanel
                        key="form"
                        parameters={defs}
                        onParameterChange={changeListener}
                        values={values}
                        depth={-2}
                    />
                );
            }
        }

        var crtPane = this.state.currentPane;
        var rolesPane, rolesPaneMenu;
        var shares, sharesMenu;
        if(this.state.roleType === 'user'){
            var filterUserId = PathUtils.getBasename(this.props.node.getPath());


            // PROFILES & ROLES PANE - SHARE PANE
            rolesPaneMenu = <PydioComponents.PaperEditorNavEntry key="roles" keyName="roles" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('30')} selectedKey={this.state.currentPane}/>;
            sharesMenu = <PydioComponents.PaperEditorNavEntry key="shares" keyName="shares" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('49')} selectedKey={this.state.currentPane}/>;
            if(this.state.roleData && this.state.roleData.ALL){

                defs = [
                    {name:"login", label:this.getPydioRoleMessage('21'),description:this.getMessage('31'),"type":"string", readonly:true},
                    {name:"profile", label:this.getPydioRoleMessage('22'), description:this.getMessage('32'),"type":"select", choices:this.state.roleData.ALL.PROFILES.join(",")}
                ];
                values = {
                    login:filterUserId,
                    profile:this.state.roleData.USER.PROFILE
                };
                changeListener = function(paramName, newValue, oldValue){
                    const controller = this.state.Controller;
                    if(paramName === "profile") {
                        controller.updateUserProfile(newValue);
                    }
                }.bind(this);

                rolesPane = (
                    <div>
                        <h3 className="paper-right-title">{this.getMessage('30')}<div className={"section-legend"}>{this.getMessage('55')}</div></h3>
                        <FormPanel
                            key="form"
                            parameters={defs}
                            onParameterChange={changeListener}
                            values={values}
                            depth={-2}
                        />
                        <UserRolesPicker
                            availableRoles={this.state.roleData.ALL.ROLES}
                            rolesDetails={this.state.roleData.ALL.ROLES_DETAILS}
                            currentRoles={this.state.roleData.USER.ROLES}
                            currentRolesDetails={this.state.roleData.USER.ROLES_DETAILS}
                            controller={this.state.Controller}
                            loadingMessage={this.state.loadingMessage}
                        />
                    </div>
                );

                if(this.state.currentPane === 'shares'){
                    const {node, pydio} = this.props;
                    shares = (
                        <SharesList
                            pydio={pydio}
                            userId={filterUserId}
                            userData={this.state.roleData.USER}
                        />
                    );
                }else{
                    shares = <div></div>;
                }

            }

        }

        var changes = !this.state.dirty;
        var save = function(){
            this.saveRoleChanges();
        }.bind(this);
        const close = () => { this.props.onRequestTabClose(); };
        var rightButtons = (
            <div>
                <FlatButton key="undo" disabled={changes} secondary={true} label={this.getMessage('plugins.6', 'ajxp_admin')} onTouchTap={this.resetRoleChanges.bind(this)}/>
                <FlatButton key="save" disabled={changes} secondary={true} label={this.getRootMessage('53')} onTouchTap={save}/>
                <RaisedButton key="close" label={this.getMessage('33')} onTouchTap={close}/>
            </div>
        );

        var leftNav = [
            <PaperEditorNavHeader key="1" label={this.getMessage('ws.28', 'ajxp_admin')}/>,
            <PaperEditorNavEntry key="info" keyName="info" onClick={this.setSelectedPane.bind(this)} label={infoMenuTitle} selectedKey={this.state.currentPane}/>,
            rolesPaneMenu, sharesMenu,
            <PaperEditorNavHeader key="2" label={this.getMessage('34')}/>,
            <PaperEditorNavEntry key="workspaces" keyName="workspaces" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('35')} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavEntry key="pages" keyName="pages" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('36')} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavHeader key="3" label={this.getMessage('37')}/>,
            <PaperEditorNavEntry key="add-info" keyName="add-info" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('38')} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavEntry key="glob-params" keyName="global-params" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('39')} selectedKey={this.state.currentPane}/>,
            <PaperEditorNavEntry key="ws-params" keyName="ws-params" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('40')} selectedKey={this.state.currentPane}/>
        ];

        var panes = [];
        var classFor = function(key){return crtPane === key ? 'layout-fill' : ''};
        var styleFor = function(key){return crtPane === key ? {overflow:'auto'}:{height:0,overflow:'hidden'}};
        if(rolesPane){
            panes.push(
                <div key="roles" className={classFor('roles')} style={styleFor('roles')}>{rolesPane}</div>
            )
        }
        if(shares){
            panes.push(
                <div key="shares" className={classFor('shares')} style={styleFor('shares')}>{shares}</div>
            );
        }
        panes.push(
            <div key="info" className={'avatar-provider ' + classFor('info')} style={styleFor('info')}>
                {infoTitle && !this.state.loadingMessage ? <h3 className="paper-right-title">{infoTitle}</h3> : null}
                {otherForm}
                <WorkspacesList
                    key="global-scope"
                    roleRead={this.state.roleScope}
                    roleParent={this.state.roleParent}
                    roleType={this.state.roleType}
                    Controller={this.state.Controller}
                    showModal={this.showModal.bind(this)}
                    hideModal={this.hideModal.bind(this)}
                    globalData={this.state.roleData.ALL}
                    showGlobalScopes={{PYDIO_REPO_SCOPE_ALL:this.getPydioRoleMessage('12d')}}
                    globalScopesFilterType="global"
                    initialEditCard="PYDIO_REPO_SCOPE_ALL"
                    noParamsListEdit={true}
                    editOnly={true}
                    displayFormPanel={true}
                />
            </div>
        );
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



        var modal = this.state.modal || null;
        var loadingMessage = null;
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