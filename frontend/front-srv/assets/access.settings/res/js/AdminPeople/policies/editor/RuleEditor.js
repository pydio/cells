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
import Pydio from 'pydio'
import {RaisedButton, Divider} from 'material-ui'
const {PaperEditorLayout} = Pydio.requireLib('components');

import Label from './Label'
import Actions from './Actions'
import Effect from './Effect'
import Resources from './Resources'
import Subjects from './Subjects'
import Conditions from './Conditions'

class RuleEditor extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            rule: props.rule,
            dirty: this.props.create,
            valid: !this.props.create,
            create: this.props.create
        };
    }

    isDirty(){
        return this.state.dirty;
    }

    isValid(){
        return this.state.valid;
    }

    isCreate(){
        return this.state.create;
    }


    componentWillReceiveProps(newProps) {
        this.setState({rule: newProps.rule});
    }

    onChange(rule){
        const valid = rule.description && rule.actions.length && rule.resources.length && rule.subjects.length;
        this.setState({rule: rule, dirty: true, valid: valid});
    }

    revert(){
        this.setState({rule: this.props.rule, dirty: false});
    }

    save(){
        const {rule} = this.state;
        this.props.saveRule(rule);
        this.setState({dirty: false, create: false});
    }

    render(){

        const messages = Pydio.getMessages();
        const {rule, dirty, valid} = this.state;
        let actions = [];
        if(!this.isCreate()){
            actions.push(PaperEditorLayout.actionButton(messages['ajxp_admin.plugins.6'], 'mdi mdi-undo', ()=>{this.revert()}, !dirty));
        }
        actions.push(PaperEditorLayout.actionButton(messages['53'], 'mdi mdi-content-save', ()=>{this.save()}, !dirty || !valid));
        const containerStyle = {margin: 16, fontSize: 16};

        return <PaperEditorLayout
            title={rule.description || 'Please provide a label'}
            titleActionBar={actions}
            closeAction={()=>{this.props.onRequestTabClose()}}
            contentFill={false}
        >
            <div>
                <Label {...this.props} rule={rule} onChange={this.onChange.bind(this)} containerStyle={containerStyle}/>
                <Effect {...this.props} rule={rule} onChange={this.onChange.bind(this)} containerStyle={containerStyle}/>
                <Actions {...this.props} rule={rule} onChange={this.onChange.bind(this)} containerStyle={containerStyle}/>
                <Resources {...this.props} rule={rule} onChange={this.onChange.bind(this)} containerStyle={containerStyle}/>
                <Subjects {...this.props} rule={rule} onChange={this.onChange.bind(this)} containerStyle={containerStyle}/>
                <Conditions {...this.props} rule={rule} onChange={this.onChange.bind(this)} containerStyle={containerStyle}/>
            </div>
        </PaperEditorLayout>

    }

}

export {RuleEditor as default}