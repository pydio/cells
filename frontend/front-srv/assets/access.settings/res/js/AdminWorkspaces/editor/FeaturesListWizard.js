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
import {RaisedButton} from 'material-ui'
import Workspace from '../model/Workspace'

export default React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        onSelectionChange:React.PropTypes.func.isRequired,
        driverLabel:React.PropTypes.string,
        driverDescription:React.PropTypes.string,
        currentSelection:React.PropTypes.string,
        wizardType:React.PropTypes.string,
        driversLoaded:React.PropTypes.bool,
        additionalComponents:React.PropTypes.object,
        disableCreateButton:React.PropTypes.bool
    },

    getInitialState:function(){
        return {
            edit:this.props.wizardType == 'workspace'?'template':'general',
            step:1,
            subStep1:'template'
        };
    },

    componentWillReceiveProps:function(newProps){
        if(newProps.currentSelection){
            this.setState({edit:newProps.currentSelection});
        }
    },

    setEditState:function(key){
        this.props.onSelectionChange(key);
        this.setState({edit:key});
    },

    closeCurrent:function(event){
        event.stopPropagation();
    },

    dropDownChange: function(item){
        if(item.payload.name){
            this.setState({step:3});
        }
        this.setState({edit:'driver', selectedDriver:item.payload.name});
        this.props.onSelectionChange('driver', item.payload.name);
    },

    dropChangeDriverOrTemplate:function(event, item){
        if(item == 'template'){
            this.setState({step:1,subStep1:item});
        }else{
            this.setState({step:2, subStep1:'driver'});
            this.setEditState('general');
        }
    },

    dropDownChangeTpl: function(item){
        if(item.payload != -1){
            var tpl = item.payload == "0" ? "0" : item.payload.name;
            this.setState({
                edit:'general',
                selectedTemplate:tpl == "0"? null: tpl,
                step:2
            });
            this.props.onSelectionChange('general', null, tpl);
        }
    },

    render: function(){

        var step1, step2, step3;

        if(this.props.wizardType == 'workspace'){

            // TEMPLATES SELECTOR
            var driverOrTemplate = (
                <div>
                    <ReactMUI.RadioButtonGroup name="driv_or_tpl" onChange={this.dropChangeDriverOrTemplate} defaultSelected={this.state.subStep1}>
                        <ReactMUI.RadioButton value="template" label={this.context.getMessage('ws.8')} />
                        <ReactMUI.RadioButton value="driver" label={this.context.getMessage('ws.9')}/>
                    </ReactMUI.RadioButtonGroup>
                </div>
            );

            var templateSelector = null;
            if(this.state.step == 1 && this.state.subStep1 == "template"){
                templateSelector = (
                    <PydioComponents.PaperEditorNavEntry
                        label={this.context.getMessage('ws.10')}
                        selectedKey={this.state.edit}
                        keyName="template"
                        onClick={this.setEditState}
                        dropDown={true}
                        dropDownData={this.props.driversLoaded?Workspace.TEMPLATES:null}
                        dropDownChange={this.dropDownChangeTpl}
                        dropDownDefaultItems={[]}
                    />
                );
            }

            step1 = (
                <div>
                    <PydioComponents.PaperEditorNavHeader key="tpl-k" label={"1 - " + this.context.getMessage('ws.11')}/>
                    {driverOrTemplate}
                    {templateSelector}
                </div>
            );

        }

        // DRIVER SELECTOR STEP
        if(this.state.step > 1 || this.props.wizardType == 'template'){

            if(this.props.wizardType == 'workspace' && this.state.selectedTemplate){

                // Display remaining template options instead of generic + driver
                var tplLabel = Workspace.TEMPLATES.get(this.state.selectedTemplate).label;
                step2 = (
                    <div>
                        <PydioComponents.PaperEditorNavHeader key="parameters-k" label={"2 - " + this.context.getMessage('ws.12').replace('%s', tplLabel)}/>
                        <PydioComponents.PaperEditorNavEntry keyName='general' key='general' selectedKey={this.state.edit} label={this.context.getMessage('ws.13')} onClick={this.setEditState} />
                    </div>
                );

            }else{

                step2 = <div>
                    <PydioComponents.PaperEditorNavHeader key="parameters-k" label={"2 - " + this.context.getMessage('ws.14')}/>
                    <PydioComponents.PaperEditorNavEntry keyName='general' key='general' selectedKey={this.state.edit} label={this.context.getMessage('ws.15')} onClick={this.setEditState} />
                    <PydioComponents.PaperEditorNavHeader key="driver-k" label={"3 - " + this.context.getMessage('ws.16')}/>
                    <PydioComponents.PaperEditorNavEntry
                        label={this.context.getMessage(this.props.driversLoaded?'ws.17':'ws.18')}
                        selectedKey={this.state.edit}
                        keyName="driver"
                        onClick={this.setEditState}
                        dropDown={true}
                        dropDownData={this.props.driversLoaded?Workspace.DRIVERS:null}
                        dropDownChange={this.dropDownChange}
                    />
                </div>;

            }


        }


        // SAVE / CANCEL BUTTONS
        if(this.state.step > 2 || (this.state.step > 1 && this.props.wizardType == 'workspace' && this.state.selectedTemplate) ){
            var stepNumber = 4;
            if(this.state.selectedTemplate) stepNumber = 3;
            step3 = <div>
                <PydioComponents.PaperEditorNavHeader key="save-k" label={stepNumber + " - " + this.context.getMessage('ws.19')}/>
                <div style={{textAlign:'center'}}>
                    <RaisedButton primary={false} label={this.context.getMessage('54', '')} onTouchTap={this.props.close} />
                    &nbsp;&nbsp;&nbsp;
                    <RaisedButton primary={true} label={this.context.getMessage('ws.20')} onTouchTap={this.props.save} disabled={this.props.disableCreateButton}/>
                </div>
            </div>;

        }else{

            step3 = <div style={{textAlign:'center', marginTop: 50}}>
                <RaisedButton primary={false} label={this.context.getMessage('54', '')} onTouchTap={this.props.close} />
            </div>;

        }

        return (
            <div>
                {step1}
                {step2}
                {this.props.additionalComponents}
                {step3}
            </div>
        );
    }

});