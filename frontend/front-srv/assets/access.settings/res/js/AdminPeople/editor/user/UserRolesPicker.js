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
import LangUtils from 'pydio/util/lang'
import {DropDownMenu, MenuItem} from 'material-ui'

import {RoleMessagesConsumerMixin} from '../util/MessagesMixin'

export default React.createClass({

    mixins:[RoleMessagesConsumerMixin],

    propTypes: {
        availableRoles: React.PropTypes.array,
        rolesDetails: React.PropTypes.object,
        currentRoles:React.PropTypes.array,
        currentRolesDetails:React.PropTypes.array,
        controller: React.PropTypes.object
    },

    onChange: function(e, selectedIndex, value){
        if(value === -1) {
            return;
        }
        let newRoles = this.props.currentRoles.slice();
        newRoles.push(value);
        this.props.controller.updateUserRoles(newRoles);
    },

    remove: function(roleId){
        const newRoles = LangUtils.arrayWithout(this.props.currentRoles, this.props.currentRoles.indexOf(roleId));
        this.props.controller.updateUserRoles(newRoles);
    },

    orderUpdated:function(oldId, newId, currentValues){
        const ordered = currentValues.map(function(o){return o.payload;});
        this.props.controller.orderUserRoles(ordered);
    },

    render: function(){

        let groups=[], manual=[], users=[];
        const ctx = this.context;
        const {currentRoles, rolesDetails, currentRolesDetails, availableRoles, loadingMessage} = this.props;
        currentRoles.map(function(r){
            const crtDetail = currentRolesDetails[r] || {label:r};
            if(crtDetail.groupRole){
                if(r === 'ROOT_GROUP') {
                    groups.push('/ ' + ctx.getMessage('user.25', 'ajxp_admin'));
                }else {
                    groups.push(ctx.getMessage('user.26', 'ajxp_admin').replace('%s', crtDetail.label || r));
                }
            }else if(crtDetail.userRole){
                users.push(ctx.getMessage('user.27', 'ajxp_admin'));
            }else{
                if(!rolesDetails[r]){
                    return;
                }
                let label = rolesDetails[r].label;
                if(rolesDetails[r].sticky) {
                    label += ' [' + ctx.getMessage('19') + ']';
                } // always overrides
                manual.push({payload:r, text:label});
            }
        }.bind(this));

        let addableRoles = [<MenuItem value={-1} primaryText={ctx.getMessage('20')}/>];
        availableRoles.map(function(r){
            if(currentRoles.indexOf(r) === -1) {
                addableRoles.push(<MenuItem value={r} primaryText={rolesDetails[r].label || r} />);
            }
        });

        const fixedRoleStyle = {
            padding: 10,
            fontSize: 14,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            margin: '8px 0'
        };

        return (
            <div className="user-roles-picker" style={{padding:0}}>
                <div style={{paddingLeft: 22, marginTop: -40, display: 'flex', alignItems: 'center'}}>
                    <div style={{flex: 1, color: '#bdbdbd', fontWeight: 500}}>Manage roles {loadingMessage ? ' ('+ctx.getMessage('21')+')':''}</div>
                    <div className="roles-picker-menu" style={{marginTop: -12}}>
                        <DropDownMenu onChange={this.onChange} value={-1}>{addableRoles}</DropDownMenu>
                    </div>
                </div>
                <div className="roles-list" style={{margin: '0 16px'}}>
                    {groups.map(function(g){
                        return <div key={"group-"+g} style={fixedRoleStyle}>{g}</div>;
                    })}
                    <PydioComponents.SortableList
                        key="sortable"
                        values={manual}
                        removable={true}
                        onRemove={this.remove}
                        onOrderUpdated={this.orderUpdated}
                        itemClassName="role-item role-item-sortable"
                    />
                    {users.map(function(u){
                        return <div key={"user-"+u} style={fixedRoleStyle}>{u}</div>;
                    })}
                </div>
            </div>
        );

    }

});
