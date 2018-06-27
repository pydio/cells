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

import {RoleMessagesConsumerMixin} from '../util/MessagesMixin'

export default React.createClass({

    mixins:[RoleMessagesConsumerMixin],

    propTypes:{
        type:React.PropTypes.string,
        id:React.PropTypes.string,
        name:React.PropTypes.string,
        value:React.PropTypes.any,
        label:React.PropTypes.string,
        attributes:React.PropTypes.object,
        pluginName:React.PropTypes.string,
        inherited:React.PropTypes.bool,
        Controller:React.PropTypes.object
    },

    getInitialState:function(){
        return {editMode:false};
    },

    onChangeParameter:function(newValue, oldValue, additionalFormData=null){
        if(newValue == oldValue) return;
        this.props.Controller.updateParameter(this.props.type, 'update', this.props.id, this.props.pluginName, this.props.name, newValue, additionalFormData);
    },

    deleteParameter:function(){
        this.props.Controller.updateParameter(this.props.type, 'delete', this.props.id, this.props.pluginName, this.props.name);
    },

    overrideParameter:function(){
        this.props.Controller.updateParameter(this.props.type, 'add', this.props.id, this.props.pluginName, this.props.name);
    },

    onInputEditMode:function(editMode){
        this.setState({editMode:editMode});
    },

    toggleEditMode:function(){
        if(this.refs.formElement) this.refs.formElement.toggleEditMode();
    },

    toggleActionStatus: function(event, status){
        //if(status){
        this.props.Controller.updateParameter(this.props.type, 'add', this.props.id, this.props.pluginName, this.props.name, status);
        //}else{
        //    this.props.Controller.updateParameter(this.props.type, 'delete', this.props.id, this.props.pluginName, this.props.name);
        //}
    },

    render: function(){
        var props = {
            ref:"formElement",
            attributes:this.props.attributes,
            name:this.props.name,
            value:this.props.value,
            onChange:this.onChangeParameter,
            disabled:this.props.inherited,
            binary_context:this.props.Controller.getBinaryContext(),
            onChangeEditMode:this.onInputEditMode,
            displayContext:'grid'
        };
        var value;
        var type = this.props.type;
        if(type == 'parameter'){
            value = PydioForm.createFormElement(props);
        }else{
            value = (
                <div className="role-action-toggle">
                    <ReactMUI.Toggle
                        name={this.props.name}
                        onToggle={this.toggleActionStatus}
                        defaultToggled={!!this.props.value}
                    />
                    <span className="role-action-toggle-label"> {this.context.getMessage(this.props.value?'2':'3')}</span>
                </div>
            );
        }

        var actions;
        if(type == 'parameter'){
            if(!this.state.editMode){
                actions = <ReactMUI.IconButton iconClassName="icon-remove" tooltip={this.context.getMessage('4')} onClick={this.deleteParameter}/>;
                if(this.props.inherited){
                    actions = <ReactMUI.IconButton iconClassName="icon-copy" tooltip={this.context.getMessage('5')} onClick={this.overrideParameter}/>;
                }
            }else{
                actions = <ReactMUI.IconButton iconClassName="icon-save" tooltip={this.context.getMessage('6')} onClick={this.toggleEditMode}/>;
            }
        }else if(!this.props.inherited){
            actions = <ReactMUI.IconButton iconClassName="icon-remove" tooltip={this.context.getMessage('4')} onClick={this.deleteParameter}/>;
        }
        return (
            <tr className={(this.props.inherited?'inherited':'') + (this.state.editMode?' edit-mode':'')}>
                <td className="paramName">
                    <span className="label">{this.props.inherited?'['+this.context.getPydioRoleMessage('38')+']':''} {this.props.label}</span>
                </td>
                <td className="paramValue">{value}</td>
                <td className="paramActions">{actions}</td>
            </tr>
        );
    }
});
