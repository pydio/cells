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
import {FlatButton, IconButton, Paper} from 'material-ui'

import Workspace from '../model/Workspace'
import WorkspaceEditor from '../editor/WorkspaceEditor'
import WorkspaceCreator from '../editor/WorkspaceCreator'
import WorkspaceList from './WorkspaceList'
import DataSourceEditor from '../editor/DataSourceEditor'
const PydioDataModel = require('pydio/model/data-model');
const AjxpNode = require('pydio/model/node');

export default React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:React.PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode:React.PropTypes.instanceOf(AjxpNode).isRequired,
        openEditor:React.PropTypes.func.isRequired,
        openRightPane:React.PropTypes.func.isRequired,
        closeRightPane:React.PropTypes.func.isRequired,
        filter:React.PropTypes.string,
    },

    getInitialState:function(){
        return {selectedNode:null, filter:this.props.filter || 'workspaces'}
    },

    componentDidMount: function(){
        this._setLoading = () => {
            this.setState({loading: true});
        };
        this._stopLoading = () => {
            this.setState({loading: false});
        };
        this.props.currentNode.observe('loaded', this._stopLoading);
        this.props.currentNode.observe('loading', this._setLoading);
    },

    componentWillUnmount: function(){
        this.props.currentNode.stopObserving('loaded', this._stopLoading);
        this.props.currentNode.stopObserving('loading', this._setLoading);
    },

    openWorkspace: function(node){
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(global.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }

        let editor = WorkspaceEditor;
        const editorNode = XMLUtils.XPathSelectSingleNode(this.props.pydio.getXmlRegistry(), '//client_configs/component_config[@component="AdminWorkspaces.Dashboard"]/editor');
        if(editorNode){
            editor = editorNode.getAttribute('namespace') + '.' + editorNode.getAttribute('component');
        }
        if (node.getMetadata().get('is_datasource') === 'true'){
            editor = DataSourceEditor;
        }
        const editorData = {
            COMPONENT:editor,
            PROPS:{
                ref:"editor",
                node:node,
                closeEditor:this.closeWorkspace,
                reloadList:()=>{this.refs['workspacesList'].reload();},
                deleteWorkspace:this.deleteWorkspace,
                saveWorkspace:this.updateWorkspace
            }
        };
        this.props.openRightPane(editorData);
        return true;
    },

    closeWorkspace:function(){
        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(global.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
    },

    toggleWorkspacesFilter:function(){
        this.setState({filter:this.state.filter=='workspaces'?'templates':'workspaces'});
    },

    showWorkspaceCreator: function(type){
        if(typeof(type) != "string") {
            type = "workspace";
        }
        const editorData = {
            COMPONENT:WorkspaceCreator,
            PROPS:{
                ref:"editor",
                type:type,
                save:this.createWorkspace,
                closeEditor:this.closeWorkspace
            }
        };
        this.props.openRightPane(editorData);

    },

    showTplCreator: function(){
        this.showWorkspaceCreator('template');
    },

    createWorkspace: function(type, creatorState){
        let driver;
        if(!creatorState.selectedDriver && creatorState.selectedTemplate){
            driver = "ajxp_template_" + creatorState.selectedTemplate;
            // Move drivers options inside the values['driver'] instead of values['general']
            var tplDef = Workspace.TEMPLATES.get(creatorState.selectedTemplate);
            var driverDefs = Workspace.DRIVERS.get(tplDef.type).params;
            var newDriversValues = {};
            Object.keys(creatorState.values['general']).map(function(k){
                driverDefs.map(function(param){
                    if(param['name'] === k){
                        newDriversValues[k] = creatorState.values['general'][k];
                        delete creatorState.values['general'][k];
                    }
                });
            });
            creatorState.values['driver'] = newDriversValues;

        }else{
            driver = creatorState.selectedDriver;
        }
        if(creatorState.values['general']['DISPLAY']){
            var displayValues = {DISPLAY:creatorState.values['general']['DISPLAY']};
            delete creatorState.values['general']['DISPLAY'];
        }
        var generalValues = creatorState.values['general'];

        var saveData = LangUtils.objectMerge({
            DRIVER:driver,
            DRIVER_OPTIONS:LangUtils.objectMerge(creatorState.values['general'], creatorState.values['driver'])
        }, displayValues);

        var parameters = {
            get_action:'create_repository',
            json_data:JSON.stringify(saveData)
        };
        if(type == 'template'){
            parameters['sf_checkboxes_active'] = 'true';
        }
        PydioApi.getClient().request(parameters, function(transport){
            // Reload list & Open Editor
            this.refs.workspacesList.reload();
            var newId = XMLUtils.XPathGetSingleNodeText(transport.responseXML, "tree/reload_instruction/@file");
            var fakeNode = new AjxpNode('/fake/path/' + newId);
            if(type == 'template'){
                fakeNode.getMetadata().set("is_datasource", "true");
                fakeNode.getMetadata().set("datasource_id", newId);
            } else {
                fakeNode.getMetadata().set("ajxp_mime", "repository_editable");
            }
            this.openWorkspace(fakeNode, 'driver');
        }.bind(this));
    },

    deleteWorkspace:function(workspaceId){
        if(window.confirm(this.context.getMessage('35', 'settings'))){
            this.closeWorkspace();
            PydioApi.getClient().request({
                get_action:'delete',
                data_type:'repository',
                data_id:workspaceId
            }, function(transport){
                this.refs.workspacesList.reload();
            }.bind(this));
        }
    },

    /**
     *
     * @param workspaceModel Workspace
     * @param postData Object
     * @param editorData Object
     */
    updateWorkspace:function(workspaceModel, postData, editorData){
        let workspaceId = workspaceModel.wsId;
        if(workspaceModel.isTemplate()){
            let formDefs=[], formValues={}, templateAllFormDefs = [];
            if(!editorData["general"]){
                workspaceModel.buildEditor("general", formDefs, formValues, {}, templateAllFormDefs);
                const generalPostValues = PydioForm.Manager.getValuesForPOST(formDefs, formValues);
                postData = LangUtils.objectMerge(postData, generalPostValues);
            }
            if(!editorData["driver"]){
                workspaceModel.buildEditor("driver", formDefs, formValues, {}, templateAllFormDefs);
                const driverPostValues = PydioForm.Manager.getValuesForPOST(formDefs, formValues);
                postData = LangUtils.objectMerge(postData, driverPostValues);
            }
        }

        if(editorData['permission-mask']){
            postData['permission_mask'] = JSON.stringify(editorData['permission-mask']);
        }
        const mainSave = function(){
            PydioApi.getClient().request(LangUtils.objectMerge({
                get_action:'edit',
                sub_action:'edit_repository_data',
                repository_id:workspaceId
            }, postData), function(transport){
                this.refs['workspacesList'].reload();
            }.bind(this));
        }.bind(this);

        const metaSources = editorData['META_SOURCES'];
        if(Object.keys(metaSources["delete"]).length || Object.keys(metaSources["add"]).length || Object.keys(metaSources["edit"]).length){
            PydioApi.getClient().request(LangUtils.objectMerge({
                get_action:'edit',
                sub_action:'meta_source_edit',
                repository_id:workspaceId,
                bulk_data:JSON.stringify(metaSources)
            }), function(transport){
                if(this.refs['editor']){
                    this.refs['editor'].clearMetaSourceDiff();
                }
                mainSave();
            }.bind(this));
        }else{
            mainSave();
        }
    },

    reloadWorkspaceList:function(){
        this.refs.workspacesList.reload();
    },

    render:function(){
        let buttons = [];
        let icon;
        const title = this.props.currentNode.getLabel();
        if (this.state.filter === 'workspaces') {
            buttons.push(<FlatButton primary={true} label={this.context.getMessage('ws.3')} onTouchTap={this.showWorkspaceCreator}/>);
            icon = 'mdi mdi-folder-open';
        } else {
            buttons.push(<FlatButton primary={true} label={this.context.getMessage('ws.4')} onTouchTap={this.showTplCreator}/>);
            icon = 'mdi mdi-database';
        }

        return (

            <div className="main-layout-nav-to-stack workspaces-board">
                <div className="vertical-layout" style={{width:'100%'}}>
                    <AdminComponents.Header
                        title={title}
                        icon={icon}
                        actions={buttons}
                        reloadAction={this.reloadWorkspaceList}
                        loading={this.state.loading}
                    />
                    <AdminComponents.SubHeader legend="Workspaces define the main access point to your data for the users. Make sure to define at least one datasource to be able to create a workspace that will point to a path of this datasource."/>
                    <div className="layout-fill">
                        <Paper zDepth={1} style={{margin: 16}}>
                            <WorkspaceList
                                ref="workspacesList"
                                dataModel={this.props.dataModel}
                                rootNode={this.props.rootNode}
                                currentNode={this.props.currentNode}
                                openSelection={this.openWorkspace}
                                filter={this.state.filter}
                            />
                        </Paper>
                    </div>

                </div>
            </div>
        );
    }

});
