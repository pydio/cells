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

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

import {IconButton, IconMenu, MenuItem, Divider, Paper, FlatButton, FontIcon} from 'material-ui'
import Editor from '../editor/Editor'
import PydioDataModel from 'pydio/model/data-model'
import {muiThemeable} from 'material-ui/styles'
import UsersSearchBox from './UsersSearchBox'
import AjxpNode from 'pydio/model/node'
import Callbacks from './Callbacks'
import Pydio from 'pydio'
const {JobsStore} = Pydio.requireLib('boot');
const {DNDTreeView, SimpleList} = Pydio.requireLib('components')
import {loadEditorClass} from "../editor/util/ClassLoader";

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
        return {
            searchResultData: false,
            currentNode:currentNode,
            dataModel:dataModel,
            showAnon: false,
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
        if(this.refs["mainlist"]){
            this.refs["mainlist"].reload();
        }
    },

    renderListUserAvatar(node){
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
        const iconClass = node.isLeaf()?"mdi mdi-account":"mdi mdi-folder";
        return <FontIcon className={iconClass} style={style}/>;
    },

    renderListEntryFirstLine(node){
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
            icons.push(<span className={"mdi mdi-lock"} style={{...iconStyle, color:'#E53934'}}/>);
        }

        return <span>{node.getLabel()} {icons}</span>;
    },

    renderListEntrySecondLine(node){
        const idmUser = node.getMetadata().get('IdmUser');
        if(node.isLeaf()){
            if(node.getPath() === '/idm/users'){
                // This is the Root Group
                return this.context.getMessage('user.8');
            }
            let strings = [];
            strings.push(idmUser.Login);
            const attributes = idmUser.Attributes || {};
            if(attributes['profile']) {
                strings.push("Profile " + attributes['profile']);
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
        if(node.getPath() === '/idm/users') {
            return false;
        }
        return node.isLeaf();
    },

    displaySearchResults(searchTerm, searchDataModel){
        this.setState({
            searchResultTerm:searchTerm,
            searchResultData: {
                term:searchTerm,
                toggleState:this.hideSearchResults
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
        });
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
        Callbacks.deleteAction(null, [dm]);
    },

    renderNodeActions(node){
        const mime = node.getAjxpMime();
        if(node.getMetadata().has('IdmUser') && !node.getMetadata().get("IdmUser").PoliciesContextEditable) {
            return <div></div>;
        }
        const iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        const disabledStyle = {
            color: 'rgba(0,0,0,0.15)',
            fontSize: 20
        };
        let actions = [];
        if(mime === 'user_editable' || mime === 'group'){
            actions.push(<IconButton key="edit" iconClassName="mdi mdi-pencil" onClick={(e) => {e.stopPropagation();this.openRoleEditor(node)}} iconStyle={iconStyle} />);
            actions.push(<IconButton key="delete" iconClassName="mdi mdi-delete" onClick={(e) => {e.stopPropagation();this.deleteAction(node)}} iconStyle={iconStyle} />);
        }else if(mime === 'user'){
            actions.push(<IconButton key="edit" iconClassName="mdi mdi-pencil" onClick={(e) => {e.stopPropagation();this.openRoleEditor(node)}} iconStyle={iconStyle} />);
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

    applyFilter(profile){
        if(profile === 'toggle-anon') {
            this.setState({showAnon:!this.state.showAnon});
            return;
        }
        const {currentNode} = this.props;
        currentNode.getMetadata().set('userProfileFilter', profile);
        currentNode.getMetadata().delete('paginationData');
        this.setState({currentNode}, () => {this.reloadList();});
    },

    render(){

        const {accessByName, muiTheme, rootNode, pydio} = this.props;
        const styles = AdminComponents.AdminStyles(muiTheme.palette);


        const {searchResultData, currentNode, dataModel, showAnon} = this.state;

        /*
        const fontIconStyle = {
            style : {
                backgroundColor: muiTheme.palette.accent2Color,
                borderRadius: '50%',
                width: 36,
                height: 36,
                padding: 8,
                marginRight: 10
            },
            iconStyle : {
                color: 'white',
                fontSize: 20
            }
        };
        let importButton = <IconButton {...fontIconStyle} iconClassName="mdi mdi-file-excel" primary={false} tooltipPosition={"bottom-left"} tooltip={this.context.getMessage('171', 'settings')} onClick={this.openUsersImporter}/>;
        if(!ResourcesManager.moduleIsAvailable('EnterprisePeople')){
            let disabled = {style:{...fontIconStyle.style}, iconStyle:{...fontIconStyle.iconStyle}};
            disabled.style.backgroundColor = 'rgba(0,0,0,0.23)';
            importButton = <IconButton {...disabled} iconClassName="mdi mdi-file-excel" primary={false} tooltipPosition={"bottom-left"} tooltip={this.context.getMessage('171', 'settings')} disabled={true}/>;
        }
        */

        const searchBox = (
            <UsersSearchBox
                displayResults={this.displaySearchResults}
                displayResultsState={searchResultData}
                hideResults={this.hideSearchResults}
                limit={50}
                textLabel={this.context.getMessage('user.7')}
                className={"media-small-hide"}
            />
        );

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

        let profileFilter = '';
        if(currentNode.getMetadata().has('userProfileFilter')){
            profileFilter = currentNode.getMetadata().get('userProfileFilter');
        }

        const iconColor = (profileFilter === '' ? 'rgba(0,0,0,0.4)' : muiTheme.palette.accent1Color);
        const filterIcon = (
            <IconMenu
                iconButtonElement={<IconButton style={{marginRight:-16, marginLeft: 8}} iconStyle={{color:iconColor}} iconClassName={"mdi mdi-filter-variant"} tooltip={this.context.getMessage('user.filter.tooltip')} tooltipPosition={"bottom-left"}/>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                value={profileFilter}
                onChange={(e,val)=>{this.applyFilter(val)}}
                desktop={true}
            >
                <MenuItem value={""} primaryText={this.context.getMessage('user.filter.all')} />
                <MenuItem value={"!shared"} primaryText={this.context.getMessage('user.filter.internal')} />
                <MenuItem value={"shared"} primaryText={this.context.getMessage('user.filter.shared')} />
                <MenuItem value={"admin"} primaryText={this.context.getMessage('user.filter.admins')} />
                <Divider/>
                <MenuItem value={"toggle-anon"} primaryText={this.context.getMessage('user.filter.anon')} secondaryText={showAnon?<FontIcon className={"mdi mdi-check"}/>:null} />
            </IconMenu>
        );
        const {body} = AdminComponents.AdminStyles();
        const blockProps = body.block.props;
        const blockStyle = body.block.container;
        const groupHeaderStyle = {
            height: 48,
            lineHeight:'48px',
            fontSize: 12,
            fontWeight: 500,
            ...body.block.header,
            borderBottom: '1px solid ' + body.tableMaster.row.borderBottomColor,
            padding: '0 20px'
        };
        let groupPanelStyle = {
            width: 226,
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
                    centerContent={searchBox}
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
                            additionalActions={filterIcon}
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