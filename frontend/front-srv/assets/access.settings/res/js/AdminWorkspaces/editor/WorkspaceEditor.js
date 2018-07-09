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
import {FlatButton, RaisedButton} from 'material-ui'

import Workspace from '../model/Workspace'
import SharesList from '../panel/SharesList'
import TplFieldsChooser from './TplFieldsChooser'
import FeaturesList from './FeaturesList'

class WorkspaceEditor extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {
            dirty:false,
            model:new Workspace(this.getWsId(), this.props.node.getAjxpMime() == "repository_editable"),
            edit:this.props.initialEditSection || 'general',
            saveData:{},
            saveMetaSourceData:{"delete":{},"add":{},"edit":{}}
        };
    }

    getWsId(){
        return PathUtils.getBasename(this.props.node.getPath());
    }

    getMetaSourceLabel(metaKey){
        return this.state.model.getMetaSourceLabel(metaKey);
    }

    getMetaSourceDescription(metaKey){
        return this.state.model.getMetaSourceDescription(metaKey);
    }

    clearMetaSourceDiff(){
        this.setState({saveMetaSourceData:{"delete":{},"add":{},"edit":{}}});
    }


    componentDidMount(){
        if(!this.state.model.loaded) this.loadModel();
    }

    componentDidUpdate(){
        if(!this.state.model.loaded) this.loadModel();
    }

    componentWillReceiveProps(newProps){
        if(this.props.node.getPath() != newProps.node.getPath()){
            const initState = {
                dirty:false,
                model:new Workspace(PathUtils.getBasename(newProps.node.getPath()), newProps.node.getAjxpMime() == "repository_editable"),
                edit:this.props.initialEditSection || 'general',
                saveData:{},
                saveMetaSourceData:{"delete":{},"add":{},"edit":{}}
            };
            this.setState(initState);
        }
    }

    isDirty(){
        return this.state.dirty;
    }

    loadModel(){
        this.state.model.load(function(model){
            if(model.isTemplate() && this.state.edit == 'activity'){
                this.setState({edit:'tpl_children'});
            }
            this.setState({
                model:model
            });
            if(this.props.registerCloseCallback){
                this.props.registerCloseCallback(function(){
                    if(this.isDirty() && !confirm(pydio.MessageHash["role_editor.19"])){
                        return false;
                    }
                }.bind(this));
            }
        }.bind(this));
    }


    editMeta(metaKey){
        this.setState({edit:metaKey});
    }

    onFormChange(values){
        var saveData = this.state.saveData || {};
        var saveMS = this.state.saveMetaSourceData;
        var metaKey = this.state.edit;
        if(this.refs.form){
            if(metaKey == 'driver' || metaKey == 'general'){
                saveData[metaKey + '_POST'] = this.refs.form.getValuesForPOST(values);
            }else{
                saveMS['edit'][metaKey] = values;
                if(saveMS['delete'][metaKey]) delete saveMS['delete'][metaKey];
            }
        }
        saveData[metaKey] = values;
        this.setState({
            dirty:true,
            saveData:saveData
        });
    }

    updateValidStatus(newStatus){
        var validRecord = this.state.valid || {};
        validRecord[this.state.edit] = newStatus;
        this.setState({valid:validRecord});
    }

    onMaskChange(maskValues){
        var saveData = this.state.saveData || {};
        saveData['permission-mask'] = maskValues;
        this.setState({saveData:saveData, dirty:true});
    }

    saveWorkspace(){
        var dPost = this.state.saveData['driver_POST'] || {};
        var gPost = this.state.saveData['general_POST'] || {};
        this.props.saveWorkspace(
            this.state.model,
            LangUtils.mergeObjectsRecursive(gPost, dPost),
            LangUtils.mergeObjectsRecursive(this.state.saveData, {META_SOURCES:this.state.saveMetaSourceData})
        );
        this.setState({dirty:false, valid:{}});
    }

    deleteWorkspace(){
        this.props.deleteWorkspace(this.getWsId());
    }

    reset(){
        this.state.model.resetFromXml();
        this.setState({
            dirty:false,
            saveData:null,
            edit:'activity',
            valid:{}
        });
    }

    toggleTemplateField(name, value, oldSelectedFields){
        var values = this.state.saveData ? ( this.state.saveData[this.state.edit] ? this.state.saveData[this.state.edit] : null ) : null;
        if(!values){
            values = this.refs.form.getValues();
        }
        var selectedFields = {};
        oldSelectedFields.map(function(f){selectedFields[f] = ''});
        values = LangUtils.mergeObjectsRecursive(selectedFields, values);
        if(value){
            this.state.model.options.set(name, '');
            values[name] = '';
        }else if(this.state.model.options.has(name)){
            this.state.model.options.delete(name);
            if(values[name] !== undefined){
                delete values[name];
            }
        }
        this.onFormChange(values);
        this.setState({
            model:this.state.model
        });
    }

    render(){

        var editor, rightFill, tplFieldsComponent, h1, readonlyPanel;
        var workspaceLabel = this.context.getMessage('home.6'), driverLabel, driverDescription, featuresList = <div className="workspace-editor-left"></div>;
        if(this.state.model.loaded) {

            switch(this.state.edit){

                case 'shares':

                    rightFill = true;
                    editor = <SharesList model={this.state.model}/>;

                    break;

                default:

                    var formDefs=[], formValues={}, templateAllFormDefs = [];
                    editor = this.state.model.buildEditor(this.state.edit, formDefs, formValues, this.state.saveData, templateAllFormDefs);

                    if(!formDefs.length) {
                        editor = (
                            <div>{this.context.getMessage('ws.68')}</div>
                        );
                        break;
                    }

                    editor = (
                        <PydioForm.FormPanel
                            ref="form"
                            parameters={formDefs}
                            values={formValues}
                            className="full-width"
                            onChange={this.onFormChange.bind(this)}
                            onValidStatusChange={this.updateValidStatus.bind(this)}
                            depth={-2}
                            disabled={!this.state.model.isEditable()}
                        />
                    );

                    if(!this.state.model.isEditable()){
                        readonlyPanel = <div className="workspace-readonly-label">{this.context.getMessage('ws.48')}</div>;
                    }

                    if(this.state.edit == 'driver' && this.state.model.isTemplate()){
                        var selectedFields = formDefs.map(function(p){return p.name});
                        tplFieldsComponent = <TplFieldsChooser
                            driverName={this.state.model.getDriverLabel()}
                            driverFields={templateAllFormDefs}
                            selectedFields={selectedFields}
                            onToggleField={this.toggleTemplateField.bind(this)}
                            style={{padding:'0 16px'}}
                        />;
                    }else if(this.state.edit == 'general'){
                        if(this.state.model.isTemplate()) {
                            h1 = <h1 className="workspace-general-h1">{this.context.getMessage('ws.21')}</h1>;
                        } else {
                            h1 = <h1 className="workspace-general-h1">{this.context.getMessage('ws.22')}</h1>;
                        }
                    }

                    break;
            }

            driverLabel = this.state.model.getDriverLabel();
            driverDescription = this.state.model.getDriverDescription();
            workspaceLabel = this.state.model.getOption('display');

            featuresList =(
                <FeaturesList
                    onSelectionChange={this.editMeta.bind(this)}
                    currentSelection={this.state.edit}
                    model={this.state.model}
                    driverLabel={driverLabel}
                    driverDescription={driverDescription}
                    metaSourceProvider={this}
                    tplFieldsComponent={tplFieldsComponent}
                />
            );
        }

        var currentValid = true;
        if(this.state.valid){
            LangUtils.objectValues(this.state.valid).map(function(v){currentValid = currentValid && v;})
        }

        var titleActionBarButtons = [];
        if(this.state.model && this.state.model.isEditable()){
            titleActionBarButtons.push(<FlatButton key="delete" label={this.context.getMessage('ws.23')} secondary={true} onTouchTap={this.deleteWorkspace.bind(this)}/>);
            titleActionBarButtons.push(<div style={{display: 'inline', borderRight: '1px solid #757575', margin: '0 2px'}} key="separator"></div>);
        }
        titleActionBarButtons.push(<FlatButton key="reset" label={this.context.getMessage('plugins.6')} onTouchTap={this.reset.bind(this)} secondary={true} disabled={!this.state.dirty}/>);
        titleActionBarButtons.push(<FlatButton key="save" label={this.context.getMessage('53', '')} onTouchTap={this.saveWorkspace.bind(this)} secondary={true} disabled={!this.state.dirty || !currentValid}/>);
        titleActionBarButtons.push(<RaisedButton key="close" label={this.context.getMessage('86', '')} onTouchTap={this.props.closeEditor}/>);

        return (
            <PydioComponents.PaperEditorLayout
                title={workspaceLabel}
                titleActionBar={titleActionBarButtons}
                leftNav={featuresList}
                className="workspace-editor"
                contentFill={rightFill}
            >
                {readonlyPanel}
                {h1}
                {editor}
            </PydioComponents.PaperEditorLayout>
        );
    }

};

WorkspaceEditor.contextTypes = {
    messages:React.PropTypes.object,
    getMessage:React.PropTypes.func
}

WorkspaceEditor.propTypes ={
    node:React.PropTypes.instanceOf(AjxpNode).isRequired,
    closeEditor:React.PropTypes.func.isRequired,
    metaSourceProvider:React.PropTypes.object,
    initialEditSection:React.PropTypes.string,
    saveWorkspace:React.PropTypes.func,
    deleteWorkspace:React.PropTypes.func,
    registerCloseCallback:React.PropTypes.func
};

export {WorkspaceEditor as default}