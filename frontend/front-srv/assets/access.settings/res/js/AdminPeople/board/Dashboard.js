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
import {IconButton, IconMenu, MenuItem, Paper, FlatButton, FontIcon} from 'material-ui'
import Editor from '../editor/Editor'
import PydioDataModel from 'pydio/model/data-model'
import {muiThemeable} from 'material-ui/styles'
import ResourcesManager from 'pydio/http/resources-manager'

let Dashboard = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:React.PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode:React.PropTypes.instanceOf(AjxpNode).isRequired,
        openEditor:React.PropTypes.func.isRequired
    },

    getInitialState: function(){
        return {
            searchResultData: false,
            currentNode:this.props.currentNode,
            dataModel:this.props.dataModel,
            filterValue:1,
        };
    },

    componentWillReceiveProps: function(newProps){
        if(!this.state.searchResultData){
            this.setState({
                currentNode:newProps.currentNode,
                dataModel:newProps.dataModel
            });
        }
    },

    renderListUserAvatar:function(node){
        if(node.getMetadata().get("avatar")){
            const avatar = node.getMetadata().get("avatar");
            const imgSrc = pydio.Parameters.get("ajxpServerAccess") + "&get_action=get_binary_param&user_id="+ PathUtils.getBasename(node.getPath()) +"&binary_id=" + avatar;
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
            backgroundColor: '#BDBDBD',
            color:           'white',
            borderRadius:    '50%',
            margin:          16,
            width:           33,
            height:          33,
            fontSize:        16,
            padding:         8,
            textAlign:       'center'
        };
        const iconClass = node.getMetadata().get("icon_class")? node.getMetadata().get("icon_class") : (node.isLeaf()?"icon-file-alt":"icon-folder-close");
        return <FontIcon className={iconClass} style={style}/>;
    },

    renderListEntryFirstLine:function(node){
        if(node.getMetadata().get("shared_user")) {
            return node.getLabel() + " ["+this.context.getMessage('user.13')+"]";
        }else if(node.getMetadata().get("profile") === "admin"){
            return (
                <span>{node.getLabel()} <span className="icon-lock" style={{display:'inline-block',marginRight:5}}></span></span>
            );
        }else{
            return node.getLabel();
        }
    },

    renderListEntrySecondLine:function(node){
        if(node.isLeaf()){
            if(node.getPath() === '/idm/users'){
                // This is the Root Group
                return this.context.getMessage('user.8');
            }
            let strings = [];
            strings.push(node.getMetadata().get('object_id'));
            const profile = node.getMetadata().get("profile");
            if(profile && profile !== "standard") {
                strings.push("Profile " + profile);
            }
            if(node.getMetadata().get("last_connection_readable")){
                strings.push( this.context.getMessage('user.9') + ' ' + node.getMetadata().get("last_connection_readable"));
            }
            const roles = node.getMetadata().get('ajxp_roles');
            if(roles && roles.split(',').length){
                strings.push(this.context.getMessage('user.11').replace("%i", roles.split(',').length));
            }
            return strings.join(" - ");
        }else{
            return this.context.getMessage('user.12') + ': ' + node.getPath().replace('/idm/users', '');
        }
    },

    renderListEntrySelector:function(node){
        if(node.getPath() == '/idm/users') {
            return false;
        }
        return node.isLeaf();
    },

    displaySearchResults:function(searchTerm, searchDataModel){
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

    hideSearchResults:function(){
        this.setState({
            searchResultData: false,
            currentNode:this.props.currentNode,
            dataModel:this.props.dataModel
        });
    },

    createUserAction: function(){
        pydio.UI.openComponentInModal('AdminPeople','CreateUserForm', {dataModel: this.props.dataModel, openRoleEditor:this.openRoleEditor.bind(this)});
    },

    createGroupAction: function(){
        pydio.UI.openComponentInModal('AdminPeople','CreateRoleOrGroupForm', {type:'group', openRoleEditor:this.openRoleEditor.bind(this)});
    },

    openUsersImporter: function(){
        pydio.UI.openComponentInModal('EnterprisePeople','UsersImportDialog', {dataModel: this.props.dataModel});
    },

    openRoleEditor:function(node, initialSection = 'activity'){
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

    },

    closeRoleEditor:function(){
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
    },

    deleteAction: function(node){
        const dm = new PydioDataModel();
        dm.setSelectedNodes([node]);
        ResourcesManager.loadClassesAndApply(['AdminActions'], () => {
            AdminActions.Callbacks.deleteAction(null, [dm]);
        })
    },

    renderNodeActions: function(node){
        const mime = node.getAjxpMime();
        const iconStyle = {
            color: 'rgba(0,0,0,0.43)',
            fontSize: 20
        };
        const disabledStyle = {
            color: 'rgba(0,0,0,0.15)',
            fontSize: 20
        };
        let actions = [];
        if(mime === 'user_editable' || mime === 'group'){
            actions.push(<IconButton key="edit" iconClassName="mdi mdi-pencil" onTouchTap={() => {this.openRoleEditor(node)}} onClick={(e)=>{e.stopPropagation()}} iconStyle={iconStyle} />);
            actions.push(<IconButton key="delete" iconClassName="mdi mdi-delete" onTouchTap={() => {this.deleteAction(node)}} onClick={(e)=>{e.stopPropagation()}} iconStyle={iconStyle} />);
        }else if(mime === 'user'){
            actions.push(<IconButton key="edit" iconClassName="mdi mdi-pencil" onTouchTap={() => {this.openRoleEditor(node)}} onClick={(e)=>{e.stopPropagation()}} iconStyle={iconStyle} />);
            actions.push(<IconButton key="delete" iconClassName="mdi mdi-delete" disabled={true} iconStyle={disabledStyle} onClick={(e)=>{e.stopPropagation()}} />);
        }
        return (
            <div>{actions}</div>
        )
    },

    filterNodes: function(node) {
        const profile = node.getMetadata().get("profile");
        const isAdmin = node.getMetadata().get("isAdmin") === "true";
        const {filterValue} = this.state;
        switch(filterValue) {
            case 1:
                return profile !== "shared";
            case 2:
                return profile === "shared";
            case 3:
                return isAdmin;
            default:
                return true;
        }
    },

    render: function(){

        const fontIconStyle = {
            style : {
                backgroundColor: this.props.muiTheme.palette.accent2Color,
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

        let importButton = <IconButton {...fontIconStyle} iconClassName="mdi mdi-file-excel" primary={false} tooltipPosition={"bottom-left"} tooltip={this.context.getMessage('171', 'settings')} onTouchTap={this.openUsersImporter}/>;
        if(!ResourcesManager.moduleIsAvailable('EnterprisePeople')){
            let disabled = {style:{...fontIconStyle.style}, iconStyle:{...fontIconStyle.iconStyle}};
            disabled.style.backgroundColor = 'rgba(0,0,0,0.23)';
            importButton = <IconButton {...disabled} iconClassName="mdi mdi-file-excel" primary={false} tooltipPosition={"bottom-left"} tooltip={this.context.getMessage('171', 'settings')} disabled={true}/>;
        }

        const searchBox = (
            <PydioComponents.SearchBox
                displayResults={this.displaySearchResults}
                displayResultsState={this.state.searchResultData}
                hideResults={this.hideSearchResults}
                style={{margin: '-18px 20px 0'}}
                parameters={{get_action:'admin_search_users',dir:this.props.dataModel.getContextNode().getPath()}}
                queryParameterName="query"
                limit={50}
                textLabel={this.context.getMessage('user.7')}
            />
        );

        const headerButtons = [
            <FlatButton primary={true} label={this.context.getMessage("user.1")} onTouchTap={this.createUserAction}/>,
            <FlatButton primary={true} label={this.context.getMessage("user.2")} onTouchTap={this.createGroupAction}/>,
        ];

        const groupHeaderStyle = {
            height: 56,
            borderBottom: '1px solid rgb(228, 228, 228)',
            padding: '20px 10px',
            fontSize: 16
        };
        let groupPanelStyle = {
            flex:'none'
        };
        if (this.state.searchResultData !== false){
            groupPanelStyle = {
                flex:'none',
                width: 0
            };
        }

        const filterIcon = (
            <IconMenu
                iconButtonElement={<IconButton style={{marginRight:-16, marginLeft: 8}} iconStyle={{color:'rgba(0, 0, 0, 0.4)'}} iconClassName={"mdi mdi-filter-variant"}/>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                value={this.state.filterValue}
                onChange={(e,val)=>{this.setState({filterValue:val})}}
            >
                <MenuItem value={1} primaryText="Internal Users" />
                <MenuItem value={2} primaryText="Shared Users" />
                <MenuItem value={3} primaryText="Admins Only" />
                <MenuItem value={4} primaryText="All Users" />
            </IconMenu>
        );

        return (
            <div className={"main-layout-nav-to-stack vertical-layout people-dashboard"}>

                <AdminComponents.Header
                    title={this.context.getMessage('2', 'settings')}
                    icon="mdi mdi-account-multiple"
                    actions={headerButtons}
                    centerContent={searchBox}
                />

                <Paper zDepth={1} style={{margin: 16}} className={"horizontal-layout layout-fill"}>
                    <div className="hide-on-vertical-layout vertical-layout tab-vertical-layout people-tree" style={groupPanelStyle}>
                        <div style={{flex: 1}}>
                            <div style={groupHeaderStyle}>Groups</div>
                            <PydioComponents.DNDTreeView
                                showRoot={true}
                                rootLabel={this.context.getMessage("user.5")}
                                node={this.props.rootNode}
                                dataModel={this.props.dataModel}
                                className="users-groups-tree"
                                paddingOffset={10}
                            />
                        </div>
                    </div>
                    <div zDepth={0} className="layout-fill vertical-layout people-list">
                        <PydioComponents.SimpleList
                            ref="mainlist"
                            pydio={this.props.pydio}
                            node={this.state.currentNode}
                            dataModel={this.state.dataModel}
                            openEditor={this.openRoleEditor}
                            clearSelectionOnReload={false}
                            entryRenderIcon={this.renderListUserAvatar}
                            entryRenderFirstLine={this.renderListEntryFirstLine}
                            entryRenderSecondLine={this.renderListEntrySecondLine}
                            entryEnableSelector={this.renderListEntrySelector}
                            entryRenderActions={this.renderNodeActions}
                            searchResultData={this.state.searchResultData}
                            elementHeight={PydioComponents.SimpleList.HEIGHT_TWO_LINES}
                            hideToolbar={false}
                            toolbarStyle={{backgroundColor: 'white', borderBottom: '1px solid #e4e4e4'}}
                            multipleActions={[this.props.pydio.Controller.getActionByName('delete')]}
                            additionalActions={filterIcon}
                            filterNodes={this.filterNodes}
                        />
                    </div>

                </Paper>

            </div>
        );
    }

});

Dashboard = muiThemeable()(Dashboard);
export {Dashboard as default}