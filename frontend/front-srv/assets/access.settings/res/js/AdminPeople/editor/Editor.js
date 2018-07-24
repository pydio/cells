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
const {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader} = Pydio.requireLib('components');

import Role from './model/Role'
import User from './model/User'


import SharesList from './panel/SharesList'
import WorkspacesAcls from './acl/WorkspacesAcls'
import PagesAcls from './acl/PagesAcls'
import React from "react";
import PathUtils from "pydio/util/path";
import {requireLib} from "pydio";
import {FlatButton, IconButton, IconMenu, MenuItem, RaisedButton, Snackbar} from "material-ui";

import RoleInfo from './info/RoleInfo'
import UserInfo from './info/UserInfo'
import GroupInfo from './info/GroupInfo'

import ParametersPanel from './params/ParametersPanel'

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


    render(){
        const {advancedAcl, pydio} = this.props;

        const {observableRole, observableUser, pluginsRegistry, currentPane, modal} = this.state;

        let title = 'TITLE';
        let infoTitle = "";
        let infoMenuTitle = this.getMessage('24'); // user information
        let otherForm;
        let pagesShowSettings = false;

        if(this.state.roleType === 'user') {

            title = observableUser.getIdmUser().Login;
            pagesShowSettings = observableUser.getIdmUser().Attributes['profile'] === 'admin';
            otherForm = <UserInfo user={observableUser} pydio={pydio} pluginsRegistry={pluginsRegistry}/>

        }else if(this.state.roleType === 'group'){

            infoTitle = this.getMessage('26'); // group information
            infoMenuTitle = this.getMessage('27');
            title = observableUser.getIdmUser().GroupLabel;
            otherForm = <GroupInfo group={observableUser} pydio={pydio} pluginsRegistry={pluginsRegistry}/>

        }else if(this.state.roleType === 'role'){

            infoTitle = this.getMessage('28'); // role information
            infoMenuTitle = this.getMessage('29');
            pagesShowSettings = true;
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
            <PaperEditorNavEntry key="info" keyName="info" onClick={this.setSelectedPane.bind(this)} label={infoMenuTitle} selectedKey={currentPane}/>,
            <PaperEditorNavHeader key="2" label={this.getMessage('34')}/>,
            <PaperEditorNavEntry key="workspaces" keyName="workspaces" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('35')} selectedKey={currentPane}/>,
            <PaperEditorNavEntry key="pages" keyName="pages" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('36')} selectedKey={currentPane}/>,
            <PaperEditorNavHeader key="3" label={this.getMessage('37')}/>,
            <PaperEditorNavEntry key="params" keyName="params" onClick={this.setSelectedPane.bind(this)} label={this.getMessage('38')} selectedKey={currentPane}/>,
        ];

        let panes = [];
        const classFor = key => currentPane === key ? 'layout-fill' : '';
        const styleFor = key => currentPane === key ? {overflow: 'auto'} : {height: 0, overflow: 'hidden'};
        panes.push(
            <div key="info" className={'avatar-provider ' + classFor('info')} style={styleFor('info')}>
                {infoTitle && !this.state.loadingMessage ? <h3 className="paper-right-title">{infoTitle}</h3> : null}
                {otherForm}
            </div>
        );

        if(currentPane === 'workspaces') {
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
                    <WorkspacesAcls
                        key="workspaces-list"
                        role={observableUser ? observableUser.getRole() : observableRole}
                        roleType={this.state.roleType}
                        advancedAcl={advancedAcl}
                        showModal={this.showModal.bind(this)}
                        hideModal={this.hideModal.bind(this)}
                    />
                </div>
            );
        } else if (currentPane === 'pages') {
            panes.push(
                <div key="pages" className={classFor('pages')} style={styleFor('pages')}>
                    <h3 className="paper-right-title">
                        {this.getMessage('44')}
                        <div className="section-legend">{this.getMessage('45')}</div>
                        <div className="read-write-header">
                            <span>read</span>
                            <span>write</span>
                            <span>deny</span>
                        </div>
                        <br/>
                    </h3>
                    <PagesAcls
                        key="pages-list"
                        role={observableUser ? observableUser.getRole() : observableRole}
                        roleType={this.state.roleType}
                        advancedAcl={advancedAcl}
                        showModal={this.showModal.bind(this)}
                        hideModal={this.hideModal.bind(this)}
                        showSettings={pagesShowSettings}
                    />
                </div>
            );

        } else if(currentPane === 'params') {
            panes.push(
                <div key="params" className={classFor('params')} style={styleFor('params')}>
                    <ParametersPanel
                        pydio={pydio}
                        role={observableUser ? observableUser.getRole() : observableRole}
                        roleType={this.state.roleType}
                    />
                </div>
            );
        }



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