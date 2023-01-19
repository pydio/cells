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


import PropTypes from 'prop-types';


import Pydio from 'pydio';
const {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader, PluginsLoader, AdminStyles} = AdminComponents;

import Role from './model/Role'
import User from './model/User'

import WorkspacesAcls from './acl/WorkspacesAcls'
import PagesAcls from './acl/PagesAcls'
import React from "react";
import PathUtils from "pydio/util/path";
import {Snackbar} from "material-ui";
import {muiThemeable} from 'material-ui/styles';

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
        const loader = PluginsLoader.getInstance(this.props.pydio);
        loader.loadPlugins().then(plugins => {
            this.setState({pluginsRegistry: plugins});
        })
    }

    componentWillReceiveProps(newProps){
        const {node, idmRole} = this.props;
        if(newProps.node !== node || newProps.idmRole !== idmRole){
            if(newProps.node){
                this.setState(this.nodeToState(newProps.node));
            } else if(newProps.idmRole) {
                this.setState({
                    idmRole : newProps.idmRole,
                    roleType: "role",
                    currentPane:'info'
                }, () => {
                    this.loadRoleData(true);
                });
            }
        }
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

    componentWillUnmount() {
        if(this._websocketObserver) {
            this.props.pydio.stopObserving('websocket_event:idm', this._websocketObserver)
        }
    }

    nodeToState(node){
        const {pydio} = this.props;
        const mime = node.getAjxpMime();
        const scope = mime === "group" ? "group" : "user";
        let observableUser;

        const idmUser = node.getMetadata().get("IdmUser");
        observableUser = new User(idmUser);
        observableUser.observe('update', ()=>{this.forceUpdate();});
        observableUser.load();

        if(this._websocketObserver) {
            pydio.stopObserving('websocket_event:idm', this._websocketObserver);
        }
        this._websocketObserver = (event) => {
            if(event.User && event.Type === 'UPDATE' && event.User.Uuid === idmUser.Uuid) {
                if(event.Attributes && event.Attributes['ctx_username'] === pydio.user.id) {
                    console.log('ignore change coming from same user')
                    return
                }
                const {observableUser} = this.state;
                if (observableUser.isDirty() && !confirm('User was modified externally, you should revert your changes (click OK to reload)')) {
                    observableUser.save()
                    return
                }
                const newUser = new User(event.User);
                newUser.observe('update', () => {
                    this.forceUpdate();
                });
                newUser.load();
                this.setState({observableUser: newUser})
            }
        }
        pydio.observe('websocket_event:idm', this._websocketObserver)

        return {
            observableUser,
            roleLabel:PathUtils.getBasename(node.getPath()),
            roleType:scope,
            dirty:false,
            currentPane:'info',
            localModalContent:{},
        };
    }

    loadRoleData(showLoader){
        if(showLoader) {
            this.setState({loadingMessage:this.getMessage('loading', 'ajxp_admin')});
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
        const {advancedAcl, pydio, muiTheme} = this.props;

        const {observableRole, observableUser, pluginsRegistry, currentPane, modal} = this.state;

        let title = '', infoTitle = '';
        let infoMenuTitle = this.getMessage('24'); // user information
        let otherForm;
        let pagesShowSettings = false;

        if(this.state.roleType === 'user') {

            const idmUser = observableUser.getIdmUser();
            title = (idmUser.Attributes && idmUser.Attributes['displayName']) ? idmUser.Attributes['displayName'] : idmUser.Login;
            pagesShowSettings = idmUser.Attributes['profile'] === 'admin';
            otherForm = <UserInfo user={observableUser} pydio={pydio} pluginsRegistry={pluginsRegistry}/>

        }else if(this.state.roleType === 'group'){

            infoTitle = this.getMessage('26'); // group information
            infoMenuTitle = this.getMessage('27');
            title = observableUser.getIdmUser().GroupLabel;
            if(observableUser.getIdmUser().Attributes && observableUser.getIdmUser().Attributes['displayName']){
                title = observableUser.getIdmUser().Attributes['displayName'];
            }
            otherForm = <GroupInfo group={observableUser} pydio={pydio} pluginsRegistry={pluginsRegistry}/>

        }else if(this.state.roleType === 'role'){

            title = observableRole ? observableRole.getIdmRole().Label : '...';
            infoTitle = this.getMessage('28'); // role information
            infoMenuTitle = this.getMessage('29');
            pagesShowSettings = true;
            otherForm = <RoleInfo role={observableRole} pydio={pydio} pluginsRegistry={pluginsRegistry}/>

        }

        let saveDisabled = true;
        let save = ()=>{}, revert= ()=>{};
        if(observableUser) {
            saveDisabled = !observableUser.isDirty();
            save = () => {observableUser.save().then(this.props.afterSave);};
            revert = () => {observableUser.revert()};
        } else if(observableRole){
            saveDisabled = !observableRole.isDirty();
            save = () => {observableRole.save(this.props.afterSave)};
            revert = () => {observableRole.revert()};
        }

        const rightButtons = [
            PaperEditorLayout.actionButton(this.getMessage('plugins.6', 'ajxp_admin'), "mdi mdi-undo", revert, saveDisabled),
            PaperEditorLayout.actionButton(this.getRootMessage('53'), "mdi mdi-content-save", save, saveDisabled)
        ];

        const leftNavItems=[
            {value: "info", label:infoMenuTitle},
            {value: "workspaces", label:this.getMessage('35')},
            {value: "pages", label:this.getMessage('36')},
            {value: "params", label:this.getMessage('38')},
        ]

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
                            <span className="header-read">{this.getMessage('react.5a','ajxp_admin')}</span>
                            <span className="header-write">{this.getMessage('react.5b','ajxp_admin')}</span>
                            <span className="header-deny">{this.getMessage('react.5','ajxp_admin')}</span>
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
                            <span className="header-read">{this.getMessage('react.5a','ajxp_admin')}</span>
                            <span className="header-write">{this.getMessage('react.5b','ajxp_admin')}</span>
                            <span className="header-deny">{this.getMessage('react.5','ajxp_admin')}</span>
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
                        pydio={pydio}
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
                titleLeftIcon={"mdi mdi-account"}
                titleActionBar={rightButtons}
                closeAction={() => {this.props.onRequestTabClose();}}
                contentFill={true}
                leftNavItems={leftNavItems}
                leftNavSelected={currentPane}
                leftNavChange={(key)=> {this.setSelectedPane(key)}}
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
                {AdminStyles(muiTheme.palette).formSimpleCss()}
            </PaperEditorLayout>
        );

    }

}

Editor.contextTypes = {
    pydio:PropTypes.instanceOf(Pydio)
};

Editor.childContextTypes = {
    messages:PropTypes.object,
    getMessage:PropTypes.func,
    getPydioRoleMessage:PropTypes.func,
    getRootMessage:PropTypes.func
};


Editor.propTypes ={
    node: PropTypes.instanceOf(AjxpNode),
    closeEditor:PropTypes.func,
    registerCloseCallback:PropTypes.func
};

Editor = muiThemeable()(Editor);

export {Editor as default}