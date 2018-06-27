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

const React = require('react');
const {PydioContextConsumer} = require('pydio').requireLib('boot')
import {RoleMessagesConsumerMixin} from '../util/MessagesMixin'
import ParameterCreate from './ParameterCreate'
import ParametersList from './ParametersList'
import ParametersSummary from './ParametersSummary'
import {FlatButton} from 'material-ui'

let WorkspaceCard = React.createClass({

    mixins:[RoleMessagesConsumerMixin],

    propTypes:{
        id:React.PropTypes.string,
        label:React.PropTypes.string,
        role:React.PropTypes.object,
        roleParent:React.PropTypes.object,
        roleType:React.PropTypes.oneOf(['user', 'group', 'role']),
        pluginsFilter:React.PropTypes.func,
        paramsFilter:React.PropTypes.func,
        toggleEdit:React.PropTypes.func,
        editMode:React.PropTypes.bool,
        titleOnly:React.PropTypes.bool,
        editOnly:React.PropTypes.bool,
        noParamsListEdit:React.PropTypes.bool,
        uniqueScope:React.PropTypes.bool,
        showModal:React.PropTypes.func,
        hideModal:React.PropTypes.func,
        Controller:React.PropTypes.object
    },

    toggleEdit: function(){
        this.props.toggleEdit(this.props.id);
    },

    toggleInherited: function(){
        if(this.refs.parameters_list){
            this.refs.parameters_list.toggleInherited();
        }
    },

    onCreateParameter:function(type, pluginName, paramName, attributes){
        var controller = this.props.Controller;
        var value;
        if(type == 'parameter'){
            if(attributes['default']) value = attributes['default'];
            else if(attributes['type'] == 'boolean') value = false;
        }else if(type == 'action'){
            value = false;
        }
        controller.updateParameter(type, 'add', this.props.id, pluginName, paramName, value);
    },

    addParameter:function(){
        this.props.pydio.UI.openComponentInModal('AdminPeople', 'ParameterCreate', {
            pluginsFilter: this.props.pluginsFilter,
            workspaceScope: this.props.id,
            createParameter: this.onCreateParameter,
            roleType: this.props.roleType
        });
    },

    render: function(){
        var wsId = this.props.id;
        if(this.props.editMode){

            var rights,editButtons, scopeTitle, closeButton;
            if(!this.props.noParamsListEdit){
                editButtons=(
                    <div style={{float:'right'}}>
                        <ReactMUI.IconButton tooltip={this.context.getMessage('16')} iconClassName="icon-filter" onClick={this.toggleInherited}/>
                        <ReactMUI.IconButton tooltip={this.context.getMessage('17')} primary={true} iconClassName="icon-plus" onClick={this.addParameter}/>
                    </div>
                );
            }
            if(!this.props.uniqueScope){
                scopeTitle = (
                    <div>
                        <h4>{this.props.label}</h4>
                        <hr/>
                    </div>
                );
            }
            if(!this.props.editOnly){
                closeButton = (
                    <div>
                        <hr/>
                        <div style={{textAlign:'right', padding:'10px 16px'}}>
                            <FlatButton onTouchTap={this.toggleEdit} primary={true} label={this.context.getRootMessage('86')}/>
                        </div>
                    </div>
                );
            }
            var content = (
                <ReactMUI.Paper zDepth={this.props.uniqueScope?0:1} className="">
                    {scopeTitle}
                    <div className="card-content">
                        {rights}
                        <div>
                            {editButtons}
                            <h5 style={{float:'left'}}>{this.context.getMessage('18')}</h5>
                        </div>
                        <div style={{clear:'both'}}>
                            <ParametersList
                                Controller={this.props.Controller}
                                ref="parameters_list"
                                id={wsId}
                                role={this.props.role}
                                roleParent={this.props.roleParent}
                                pluginsFilter={this.props.pluginsFilter}
                                paramsFilter={this.props.paramsFilter}
                            />
                        </div>
                    </div>
                    {closeButton}
                    <hr/>
                </ReactMUI.Paper>
            );
            return (
                <PydioComponents.ListEntry
                    className={"workspace-card-edit" + (this.props.uniqueScope?' unique-scope':'') + (this.props.editOnly?' edit-only':'')}
                    firstLine={content}
                    onClick={function(){}}
                />);

        }else{

            var secondLine, action;
            if(!this.props.titleOnly){
                secondLine =(
                    <ParametersSummary id={wsId} role={this.props.role} roleParent={this.props.roleParent} pluginsFilter={this.props.pluginsFilter}/>
                );
            }
            return (
                <PydioComponents.ListEntry
                    className="ws-card"
                    firstLine={this.props.label}
                    secondLine={secondLine}
                    actions={action}
                    onClick={this.toggleEdit}
                />
            );
        }
    }

});

WorkspaceCard = PydioContextConsumer(WorkspaceCard);
export {WorkspaceCard as default}