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

import React, {Fragment} from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

import {IconButton, IconMenu, MenuItem, Divider, Paper, FlatButton, FontIcon, Subheader} from 'material-ui'
import Editor from '../editor/Editor'
import PydioDataModel from 'pydio/model/data-model'
import {muiThemeable} from 'material-ui/styles'
import UsersSearchBox from './UsersSearchBox'
import AjxpNode from 'pydio/model/node'
import Callbacks from './Callbacks'
import Pydio from 'pydio'
import PathUtils from 'pydio/util/path'
const {JobsStore} = Pydio.requireLib('boot');
const {DNDTreeView, SimpleList} = Pydio.requireLib('components')
import {loadEditorClass} from "../editor/util/ClassLoader";

const profileToLabel = (profile, messageFunc) => {
    switch (profile) {
        case 'admin':
            return messageFunc(157, 'settings')
        case 'shared':
            return messageFunc(158, 'settings')
        case 'standard':
            return messageFunc(156, 'settings')
        default:
            return profile
    }
}
export {profileToLabel}

const LockRed = '#E53934'

let Dashboard = createReactClass({
    displayName: 'Dashboard',
    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode:PropTypes.instanceOf(AjxpNode).isRequired,
        accessByName:PropTypes.func.isRequired,
        openEditor:PropTypes.func.isRequired
    },

    getInitialState(){
        const {currentNode, dataModel} = this.props;
        const root = this.findUsersRoot(currentNode)
        const filterState = {}
        if(root && root.getMetadata().has('dashboardFilter')) {
            filterState.filter = root.getMetadata().get('dashboardFilter')
            filterState.filterActive = root.getMetadata().get('dashboardFilterActive')
            filterState.filterQueries = root.getMetadata().get('userProfileFilter')
        }
        return {
            searchResultData: false,
            currentNode:currentNode,
            dataModel:dataModel,
            showAnon: false,
            ...filterState
        };
    },

    componentDidMount(){
        const jStore = JobsStore.getInstance();
        this._jStoreObserver = (jobId) => {
            if(jobId && jobId.indexOf('delete-group-') === 0) {
                jStore.getJobs().then(jobs => {
                    try{
                        if(jobs.get(jobId).Tasks[0].Status === 'Finished') {
                            this.reloadList();
                        }
                    } catch (e) {

                    }
                });
            }
        };
        jStore.observe("tasks_updated", this._jStoreObserver);
    },

    componentWillUnmounnt(){
        JobsStore.getInstance().stopObserving("tasks_updated", this._jStoreObserver);
    },

    componentWillReceiveProps(newProps){
        if(!this.state.searchResultData && newProps.currentNode && newProps.currentNode.getPath().indexOf('/idm/users') === 0){
            this.setState({
                currentNode:newProps.currentNode,
                dataModel:newProps.dataModel
            });
        }
    },

    reloadList(){
        const {searchResultData} = this.state
        if(searchResultData) {
            searchResultData.reload()
        } else {
            if(this.refs["mainlist"]){
                this.refs["mainlist"].reload();
            }
        }
    },

    renderListUserAvatar(node){
        const style={
            backgroundColor: '#9e9e9e',
            color:           'white',
            borderRadius:    '50%',
            margin:          16,
            width:           33,
            height:          33,
            fontSize:        18,
            padding:         6,
            textAlign:       'center'
        };

        if(node.getAjxpMime() === 'role') {
            style.backgroundColor = '#607d8b'
            return <FontIcon className={'mdi mdi-account-card-details'} style={style}/>;
        }
        const idmUser = node.getMetadata().get('IdmUser');
        const {pydio} = this.props;
        if(idmUser.Attributes && idmUser.Attributes['avatar']){
            const imgSrc = pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/binaries/USER/' + idmUser.Login + '?' + idmUser.Attributes['avatar'] + '&dim=33';
            return <div style={{
                width:          33,
                height:         33,
                backgroundImage:"url("+imgSrc+")",
                backgroundSize: 'cover',
                borderRadius:   '50%',
                backgroundPosition:'center',
                margin:          16,
            }}/>;
        }
        const iconClass = node.isLeaf()?"mdi mdi-account":"mdi mdi-folder-account";
        style.backgroundColor = node.isLeaf()?'#9e9e9e':'#795548';
        return <FontIcon className={iconClass} style={style}/>;
    },

    renderListEntryFirstLine(node){
        if(node.getAjxpMime() === 'role') {
            return <span>{node.getMetadata().get('IdmRole').Label}</span>;
        }
        const idmUser = node.getMetadata().get('IdmUser');
        const profile = idmUser.Attributes ? idmUser.Attributes['profile'] : '';
        let icons = [];
        const iconStyle = {display:'inline-block',marginLeft:5, fontSize: 14};

        if(profile === 'shared') {
            icons.push(<span className={"mdi mdi-share-variant"} style={{...iconStyle, color:'#009688'}} title={this.context.getMessage('user.13')}/>);
        }else if(profile === "admin"){
            icons.push(<span className={"mdi mdi-security"} style={{...iconStyle, color:'#03a9f4'}}/>);
        }
        if(idmUser.Attributes && idmUser.Attributes['locks'] && idmUser.Attributes['locks'].indexOf('logout') > -1){
            icons.push(<span className={"mdi mdi-lock"} style={{...iconStyle, color:LockRed}}/>);
        }
        let hidden;
        if(idmUser.Attributes && idmUser.Attributes['hidden'] === 'true') {
            hidden = this.context.getMessage('user.type.hidden') + ' '
        }

        return <span>{hidden}{node.getLabel()} {icons}</span>;
    },

    renderListEntrySecondLine(node){
        const {searchResultData} = this.state;
        if(node.getAjxpMime() === 'role') {
            return <span>{this.context.getMessage('user.rootgroup.legend')}</span>;
        }
        const idmUser = node.getMetadata().get('IdmUser');
        if(node.isLeaf()){
            if(node.getPath() === '/idm/users'){
                // This is the Root Group
                return this.context.getMessage('user.8');
            }
            let strings = [];
            strings.push(idmUser.Login);
            if(searchResultData && idmUser.GroupPath !== '/') {
                strings.push(this.context.getMessage('user.12') + ': ' + PathUtils.getDirname(idmUser.GroupPath));
            }
            const attributes = idmUser.Attributes || {};
            if(attributes['profile']) {
                strings.push(profileToLabel(attributes['profile'], this.context.getMessage));
            }
            if(attributes['last_connection_readable']){
                strings.push( this.context.getMessage('user.9') + ' ' + attributes['last_connection_readable']);
            }
            const roles = idmUser.Roles;
            if(roles && roles.length){
                strings.push(this.context.getMessage('user.11').replace("%i", roles.length));
            }
            return strings.join(" - ");
        }else{
            return this.context.getMessage('user.12') + ': ' + node.getPath().replace('/idm/users', '');
        }

    },

    renderListEntrySelector(node){
        if(node.getPath() === '/idm/users' || node.getAjxpMime() === 'role') {
            return false;
        }
        return node.isLeaf();
    },

    displaySearchResults(searchTerm, searchDataModel, reloader, clearer){
        this.setState({
            searchResultTerm:searchTerm,
            searchResultData: {
                term:searchTerm,
                toggleState:() => {clearer(); this.hideSearchResults()},
                reload: reloader
            },
            currentNode:searchDataModel.getContextNode(),
            dataModel:searchDataModel
        })
    },

    hideSearchResults(){
        this.setState({
            searchResultData: false,
            currentNode:this.props.currentNode,
            dataModel:this.props.dataModel
        }, () => this.reloadList());
    },

    createUserAction(){
        pydio.UI.openComponentInModal('AdminPeople','Forms.CreateUserForm', {dataModel: this.props.dataModel, openRoleEditor:this.openRoleEditor.bind(this)});
    },

    createGroupAction(){
        pydio.UI.openComponentInModal('AdminPeople','Forms.CreateRoleOrGroupForm', {type:'group', openRoleEditor:this.openRoleEditor.bind(this)});
    },

    openUsersImporter(){
        pydio.UI.openComponentInModal('EnterprisePeople','UsersImportDialog', {dataModel: this.props.dataModel});
    },

    openRoleEditor(node, initialSection = 'activity'){
        const {pydio, rolesEditorClass, rolesEditorProps} = this.props;
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        const editorProps =  {
            ref:"editor",
            node:node,
            pydio: pydio,
            initialEditSection:initialSection,
            onRequestTabClose:this.closeRoleEditor,
            afterSave:()=>{this.reloadList()},
            ...rolesEditorProps
        };
        if(node.getAjxpMime() === 'role'){
            delete(editorProps.node)
            editorProps.idmRole = node.getMetadata().get('IdmRole')
        }

        loadEditorClass(rolesEditorClass, Editor).then(component => {
            this.props.openRightPane({
                COMPONENT: component,
                PROPS: editorProps
            });
        }).catch((e) => {
            console.log(e);
        });

    },

    closeRoleEditor(){
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
    },

    deleteAction(node){
        const dm = new PydioDataModel();
        dm.setSelectedNodes([node]);
        Callbacks.deleteAction(null, [dm], () => {this.reloadList()});
    },

    renderNodeActions(node){
        const mime = node.getAjxpMime();
        if(node.getMetadata().has('IdmUser') && !node.getMetadata().get("IdmUser").PoliciesContextEditable) {
            return <div></div>;
        }
        const iconStyle = {
            color: 'inherit',
            opacity: 0.5,
            fontSize: 20
        };
        const disabledStyle = {
            color: 'inherit',
            opacity: 0.15,
            fontSize: 20
        };
        let actions = [];
        actions.push(<IconButton key="edit" iconClassName="mdi mdi-pencil" onClick={(e) => {e.stopPropagation();this.openRoleEditor(node)}} iconStyle={iconStyle} />);
        if(mime === 'user_editable' || mime === 'group'){
            actions.push(<IconButton key="delete" iconClassName="mdi mdi-delete" onClick={(e) => {e.stopPropagation();this.deleteAction(node)}} iconStyle={iconStyle} />);
        }else if(mime === 'user' || mime === 'role'){
            actions.push(<IconButton key="delete" iconClassName="mdi mdi-delete" disabled={true} iconStyle={disabledStyle} onClick={(e)=>{e.stopPropagation()}} />);
        }
        return (
            <div>{actions}</div>
        )
    },

    /**
     * Filter nodes
     * @param node
     * @return {boolean}
     */
    filterNodes(node) {
        if(!node.getMetadata().has("IdmUser")){
            return true;
        }
        const {showAnon, displaySearchResult} = this.state;
        if(displaySearchResult || showAnon){
            return true;
        }
        const attributes = node.getMetadata().get("IdmUser").Attributes || {};
        return (attributes['profile'] !== 'anon');

    },

    findUsersRoot(node) {
        let parent = node;
        while(parent.getPath() !== '/idm/users') {
            parent = parent.getParent()
            if(!parent) {
                return null
            }
        }
        return parent;
    },

    applyFilter(filterValue) {
        const [type, value] = filterValue.split(':')
        const {filter = {}, showAnon} = this.state;
        switch (type){
            case 'toggle-anon':
                this.setState({showAnon:!showAnon})
                return
            case 'profile':
                filter.profile = value;
                break
            case 'attr':
                if(!filter.attrs){
                    filter.attrs = {}
                }
                filter.attrs[value] = !filter.attrs[value]
                break
            default :
                break
        }
        // do not set hidden flag for non-shared users
        if((filter.profile === 'standard' || filter.profile === 'admin') && filter.attrs && filter.attrs.hidden) {
            delete(filter.attrs.hidden)
        }
        const allAttrs = filter.attrs || {}
        const filterActive = filter.profile || Object.keys(allAttrs).filter(a => allAttrs[a]).length > 0
        const queries = this.filterToQueries(filter);
        this.setState({filter, filterActive, filterQueries:queries}, () => this.computeFilter(queries, filter, filterActive))
    },

    filterToQueries(filter) {
        let {profile, attrs} = filter;
        const queries = [];
        if(profile) {
            let not = false
            if(profile[0] === '!'){
                not = true
                profile = profile.substring(1)
            }
            queries.push({name: 'profile', value: profile, not})
        }
        if(attrs && Object.keys(attrs).length) {
            Object.keys(attrs).filter(attr => attrs[attr]).map(attr => {
                switch (attr){
                    case 'locks':
                        queries.push({name: 'locks', value:'*logout*'})
                        break
                    case 'hidden':
                        queries.push({name:'hidden', value: 'true'})
                        break
                }
            })
        }
        if(queries.length > 0 && !queries.filter(q => q.name === 'hidden').length){
            // Hidden is not specifically set, append a hidden condition
            queries.push({name:'hidden', value: 'true', not: true})
        }
        return queries;
    },

    computeFilter(queries, filter, filterActive){
        const {currentNode} = this.props;
        const usersRoot = this.findUsersRoot(currentNode)
        if(!usersRoot) {
            return;
        }
        usersRoot.getMetadata().delete('userProfileFilter');
        usersRoot.getMetadata().delete('dashboardFilter');
        usersRoot.getMetadata().delete('dashboardFilterActive');
        if(queries.length) {
            usersRoot.getMetadata().set('userProfileFilter', queries);
            usersRoot.getMetadata().set('dashboardFilter', filter);
            usersRoot.getMetadata().set('dashboardFilterActive', filterActive);
        }
        currentNode.getMetadata().delete('paginationData');
        this.setState({currentNode}, () => {this.reloadList();});
    },

    render(){

        const {accessByName, muiTheme, rootNode, pydio} = this.props;
        const {searchResultData, currentNode, dataModel, showAnon, filter = {}, filterActive = false, filterQueries} = this.state;
        const styles = AdminComponents.AdminStyles(muiTheme.palette);


        let headerButtons = [];
        let renderActionsFunc = () => {return []};
        let openEditor = null;
        let multipleActions = [];
        if(accessByName('Create')){
            renderActionsFunc = this.renderNodeActions.bind(this);
            multipleActions = [pydio.Controller.getActionByName('move'), pydio.Controller.getActionByName('delete')];
            openEditor = this.openRoleEditor.bind(this);
            headerButtons = [
                <FlatButton primary={true} label={this.context.getMessage("user.1")} onClick={this.createUserAction} {...styles.props.header.flatButton} />,
                <FlatButton primary={true} label={this.context.getMessage("user.2")} onClick={this.createGroupAction}{...styles.props.header.flatButton} />,
            ];
        }

        const profileFilter = 'profile:' + (filter.profile || '');
        const locks = filter.attrs && filter.attrs.locks;
        const hidden = filter.attrs && filter.attrs.hidden;

        const rightIcon = {zoom: 0.8, top: 0}
        let lockIcon = {...rightIcon}
        let incognitoIcon = {...rightIcon}
        if(locks){
            lockIcon = {...rightIcon, color: LockRed}
        }
        if(showAnon){
            incognitoIcon = {...rightIcon, color: '#03a9f4'}
        }
        let filterIconStyle = {}
        if(filterActive) {
            filterIconStyle = {backgroundColor: muiTheme.palette.accent1Color}
        }
        const filterIcon = (
            <IconMenu
                iconButtonElement={<IconButton
                    iconClassName={filterActive ? 'mdi mdi-filter-variant-plus' : 'mdi mdi-filter-variant'}
                    tooltip={this.context.getMessage('user.filter.tooltip')}
                    tooltipPosition={"bottom-left"}
                    style={{...styles.props.header.iconButton.style, ...filterIconStyle}}
                    iconStyle={styles.props.header.iconButton.iconStyle}
                />}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                value={profileFilter}
                onChange={(e,val)=>{this.applyFilter(val)}}
                desktop={true}
                clickCloseDelay={0}
            >
                <Subheader style={{lineHeight:'28px'}}>Profile</Subheader>
                <MenuItem value={"profile:"}
                          primaryText={this.context.getMessage('user.filter.all')}
                          rightIcon={<FontIcon style={rightIcon} className={'mdi mdi-'+(!hidden && profileFilter==='profile:'?'checkbox-marked-outline':'checkbox-blank-outline')}/>}
                />
                <MenuItem value={"profile:admin"}
                          primaryText={this.context.getMessage('user.filter.admins')}
                          rightIcon={<FontIcon style={rightIcon} className={'mdi mdi-'+(profileFilter==='profile:admin'?'checkbox-marked-outline':'checkbox-blank-outline')}/>}
                />
                <MenuItem value={"profile:standard"}
                          primaryText={this.context.getMessage('user.filter.internal')}
                          rightIcon={<FontIcon style={rightIcon} className={'mdi mdi-'+(profileFilter==='profile:standard'?'checkbox-marked-outline':'checkbox-blank-outline')}/>}
                />
                <MenuItem value={"profile:shared"}
                          primaryText={this.context.getMessage('user.filter.shared')}
                          rightIcon={<FontIcon style={rightIcon} className={'mdi mdi-'+(!hidden && profileFilter==='profile:shared'?'checkbox-marked-outline':'checkbox-blank-outline')}/>}
                />
                <MenuItem value={"attr:hidden"}
                          primaryText={this.context.getMessage('user.filter.hidden')}
                          disabled={profileFilter==='profile:standard' || profileFilter === 'profile:admin'}
                          rightIcon={<FontIcon style={rightIcon} className={'mdi mdi-'+(hidden?'checkbox-marked-outline':'checkbox-blank-outline')}/>}
                />
                <Divider/>
                <Subheader  style={{lineHeight:'28px'}}>Status</Subheader>
                <MenuItem value={"attr:locks"}
                          primaryText={this.context.getMessage('user.filter.locks')}
                          rightIcon={<FontIcon style={{...lockIcon}} className={"mdi mdi-" + (locks?'lock-check-outline':'lock-outline')}/>}
                />
                <MenuItem value={"toggle-anon"}
                          primaryText={this.context.getMessage('user.filter.anon')}
                          rightIcon={<FontIcon style={incognitoIcon} className={"mdi mdi-" + (showAnon?'incognito':'incognito-off')}/>} />
            </IconMenu>
        );


        const {body} = styles
        const blockProps = body.block.props;
        const blockStyle = body.block.container;
        const groupHeaderStyle = {
            height: 48,
            lineHeight:'48px',
            fontSize: 14,
            fontWeight: 500,
            ...body.block.header,
            borderBottom: '1px solid ' + body.tableMaster.row.borderBottomColor,
            padding: '0 20px'
        };
        let groupPanelStyle = {
            width: 250,
            borderRight: '1px solid' + body.tableMaster.row.borderBottomColor,
            overflowY: 'auto',
            flex:'none'
        };
        if (searchResultData !== false){
            groupPanelStyle = {...groupPanelStyle, opacity: 0.6};
        }

        return (
            <div className={"main-layout-nav-to-stack vertical-layout people-dashboard"}>

                <AdminComponents.Header
                    title={this.context.getMessage('2', 'settings')}
                    icon="mdi mdi-account-multiple"
                    actions={headerButtons}
                    centerContent={<UsersSearchBox
                        displayResults={this.displaySearchResults}
                        displayResultsState={searchResultData}
                        hideResults={this.hideSearchResults}
                        limit={50}
                        textLabel={this.context.getMessage('user.7')}
                        className={"media-small-hide"}
                        filterButton={filterIcon}
                        filterQueries={filterQueries}
                    />}
                />

                <Paper {...blockProps} style={blockStyle} className={"horizontal-layout layout-fill"}>
                    <div className="hide-on-vertical-layout vertical-layout tab-vertical-layout" style={groupPanelStyle}>
                        <div style={{flex: 1}}>
                            <div style={groupHeaderStyle}>{this.context.getMessage("user.3")}</div>
                            <DNDTreeView
                                showRoot={true}
                                rootLabel={this.context.getMessage("user.5")}
                                node={rootNode}
                                dataModel={this.props.dataModel}
                                className="users-groups-tree"
                                paddingOffset={10}
                                noPaginator={true}
                            />
                        </div>
                    </div>
                    <div zDepth={0} className="layout-fill vertical-layout people-list">
                        <SimpleList
                            ref="mainlist"
                            pydio={pydio}
                            node={currentNode}
                            dataModel={dataModel}
                            clearSelectionOnReload={false}
                            openEditor={openEditor}
                            entryRenderIcon={this.renderListUserAvatar.bind(this)}
                            entryRenderFirstLine={this.renderListEntryFirstLine.bind(this)}
                            entryRenderSecondLine={this.renderListEntrySecondLine.bind(this)}
                            entryEnableSelector={this.renderListEntrySelector.bind(this)}
                            entryRenderActions={renderActionsFunc}
                            searchResultData={searchResultData}
                            elementHeight={SimpleList.HEIGHT_TWO_LINES}
                            hideToolbar={false}
                            toolbarStyle={{
                                backgroundColor: body.block.header.backgroundColor,
                                height:48,
                                borderBottom: groupHeaderStyle.borderBottom
                            }}
                            multipleActions={multipleActions}
                            filterNodes={this.filterNodes.bind(this)}
                        />
                    </div>

                </Paper>

            </div>
        );
    },
});

Dashboard = muiThemeable()(Dashboard);
export {Dashboard as default}