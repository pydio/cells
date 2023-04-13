import React from 'react';

import createReactClass from 'create-react-class';

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

import Pydio from 'pydio'
import {FlatButton, IconButton, Paper} from 'material-ui'
import XMLUtils from 'pydio/util/xml'
import WsEditor from '../editor/WsEditor'
import WorkspaceList from './WorkspaceList'
import PydioDataModel from 'pydio/model/data-model'
import AjxpNode from 'pydio/model/node'
import {muiThemeable} from 'material-ui/styles'
const {ModernTextField} = Pydio.requireLib('hoc');

let WsDashboard = createReactClass({
    displayName: 'WsDashboard',
    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode:PropTypes.instanceOf(AjxpNode).isRequired,
        openEditor:PropTypes.func.isRequired,
        openRightPane:PropTypes.func.isRequired,
        closeRightPane:PropTypes.func.isRequired,
        accessByName:PropTypes.func.isRequired,
        advanced:PropTypes.boolean,
    },

    getInitialState(){
        return {selectedNode:null, searchString:''}
    },

    dirtyEditor(){
        const {pydio} = this.props;
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!confirm(pydio.MessageHash["role_editor.19"])) {
                return true;
            }
        }
        return false;
    },

    openWorkspace(workspace){
        if(this.dirtyEditor()){
            return;
        }
        let editor = WsEditor;
        const editorNode = XMLUtils.XPathSelectSingleNode(this.props.pydio.getXmlRegistry(), '//client_configs/component_config[@component="AdminWorkspaces.Dashboard"]/editor');
        if(editorNode){
            editor = editorNode.getAttribute('namespace') + '.' + editorNode.getAttribute('component');
        }
        const {pydio, advanced, accessByName, policiesBuilder} = this.props;
        const editorData = {
            COMPONENT:editor,
            PROPS:{
                ref:"editor",
                pydio: pydio,
                workspace:workspace,
                closeEditor:this.closeWorkspace,
                advanced,
                policiesBuilder,
                reloadList:()=>{this.refs['workspacesList'].reload();}
            }
        };
        this.props.openRightPane(editorData);
        return true;
    },

    closeWorkspace(){
        if(!this.dirtyEditor()){
            this.props.closeRightPane()
        }
    },

    showWorkspaceCreator(type){
        const {pydio, advanced} = this.props;
        const editorData = {
            COMPONENT:WsEditor,
            PROPS:{
                ref:"editor",
                type:type,
                pydio: pydio,
                advanced,
                closeEditor:this.closeWorkspace,
                reloadList:()=>{this.refs['workspacesList'].reload();}
            }
        };
        this.props.openRightPane(editorData);

    },

    reloadWorkspaceList(){
        this.refs.workspacesList.reload();
    },

    render(){
        const {pydio, advanced, currentNode, accessByName, muiTheme} = this.props;
        const {searchString, loading} = this.state;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        let buttons = [];
        if(accessByName('Create')){
            buttons.push(
                <FlatButton
                    primary={true}
                    label={this.context.getMessage('ws.3')}
                    onClick={this.showWorkspaceCreator}
                    {...adminStyles.props.header.flatButton}
                />
            );
        }

        const searchBox = (
            <div style={{display:'flex'}}>
                <div style={{flex: 1}}/>
                <div style={{width:190}}>
                    <ModernTextField fullWidth={true} hintText={this.context.getMessage('ws.filter.workspaces')} value={searchString} onChange={(e,v) => this.setState({searchString:v}) } />
                </div>
            </div>
        );


        return (

            <div className="main-layout-nav-to-stack vertical-layout workspaces-board">
                <AdminComponents.Header
                    title={currentNode.getLabel()}
                    icon={'mdi mdi-folder-open'}
                    actions={buttons}
                    centerContent={searchBox}
                    reloadAction={this.reloadWorkspaceList}
                    loading={loading}
                />
                <div className="layout-fill">
                    <AdminComponents.SubHeader legend={this.context.getMessage('ws.dashboard', 'ajxp_admin')}/>
                    <Paper {...adminStyles.body.block.props} style={adminStyles.body.block.container}>
                        <WorkspaceList
                            ref="workspacesList"
                            pydio={pydio}
                            openSelection={this.openWorkspace}
                            advanced={advanced}
                            editable={accessByName('Create')}
                            onLoadState={(state) => {this.setState({loading: state})}}
                            tableStyles={adminStyles.body.tableMaster}
                            filterString={searchString}
                        />
                    </Paper>
                </div>
            </div>
        );
    },
});

export default muiThemeable()(WsDashboard);