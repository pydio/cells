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
import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {DropDownMenu, MenuItem} from 'material-ui'
import {RoleMessagesConsumerMixin} from '../util/MessagesMixin'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api';
const {SortableList} = Pydio.requireLib('components')

export default createReactClass({
    displayName: 'UserRolesPicker',
    mixins:[RoleMessagesConsumerMixin],

    propTypes: {
        profile:PropTypes.string,
        roles:PropTypes.array,
        addRole:PropTypes.func,
        removeRole:PropTypes.func,
        switchRoles:PropTypes.func,
    },

    getInitialState(){
        return {
            availableRoles: [],
            open: false
        }
    },

    componentDidMount(){
        PydioApi.getRestClient().getIdmApi().listRolesV2(0, 50, [PydioApi.RoleTypeAdmin, PydioApi.RoleTypeTeam]).then(roles => {
            this.setState({availableRoles: roles});
        })
    },

    onChange(e, selectedIndex, value){
        if(value === -1) {
            return;
        }
        this.props.addRole(value);
    },

    remove(value){
        const {roles} = this.props;
        const role = roles.filter(r => r.Uuid === value)[0];
        this.props.removeRole(role);
    },

    orderUpdated(oldId, newId, currentValues){
        this.props.switchRoles(oldId, newId);
    },

    displayUniqueRole(roleId) {
        const {uniqueRoleDisplay, setUniqueRoleDisplay} = this.props;
        setUniqueRoleDisplay(uniqueRoleDisplay === roleId ? null : roleId)
    },

    render(){

        let groups=[], manual=[], users=[];
        const ctx = this.context;
        const {roles, loadingMessage, profile, uniqueRoleDisplay} = this.props;
        const {availableRoles, open} = this.state;

        const renderItem = ({payload, icon, text, removable = false, noClick, className = ''}) => {
            const selected = payload === uniqueRoleDisplay
            const click = noClick?null:()=> this.displayUniqueRole(payload)
            return (
                <div className={'role-item' + (removable?' role-item-sortable':'') + (selected?' role-item-selected':'') + className} style={{display:'flex', alignItems:'center'}} key={payload}>
                    {icon && <span onClick={click} className={"left-icon mdi mdi-" + icon}/>}
                    <div style={{flex: 1}} onClick={click}>
                        {text}
                        {!noClick && <span className={"toggle-select mdi mdi-pin-"+(selected?'off-':'')+'outline'} onClick={click}/>}
                    </div>
                    {removable && <span className={"right-icon mdi mdi-close"} onClick={() => this.remove(payload)}/>}
                </div>
            )
        }

        roles.forEach((r) =>{
            if(r.GroupRole){
                if(r.Uuid === 'ROOT_GROUP') {
                    groups.push({payload: r.Uuid, text: '/ ' + ctx.getMessage('user.25', 'ajxp_admin'), icon:'folder-account-outline'});
                }else {
                    groups.push({payload: r.Uuid, text:ctx.getMessage('user.26', 'ajxp_admin').replace('%s', r.Label || r.Uuid), icon:'folder-account-outline'});
                }
            }else if(r.UserRole){
                users.push({text: ctx.getMessage('user.27', 'ajxp_admin'), payload: null, icon:'account-edit-outline', noClick: true});
            }else{
                if(r.AutoApplies && r.AutoApplies.indexOf(profile) !== -1){
                    groups.push({payload: r.Uuid, text:r.Label + ' [auto]', icon:'account-multiple-outline'});
                } else {
                    manual.push({payload:r.Uuid, text:r.Label, removable: true, icon:'account-multiple-outline'});
                }
            }
        });

        const addableRoles = [
            <MenuItem value={-1} primaryText={ctx.getMessage('20')}/>,
            ...availableRoles.filter(r => roles.indexOf(r) === -1).map(r => <MenuItem value={r} primaryText={r.Label || r.Uuid} />)
        ];

        const toggleOpen = ()=>this.setState({open:!open})
        return (
            <div className="user-roles-picker paper-right-block" style={{padding:'8px 0'}}>
                <div style={{paddingLeft: 16, display: 'flex', alignItems: 'center', height: 40}}>
                    <div style={{fontSize: 20, cursor:'pointer'}} onClick={toggleOpen} className={"mdi mdi-chevron-"+(open?'down':'right')}/>
                    <div style={{flex: 1, fontSize: 16, cursor:'pointer'}} onClick={toggleOpen}>{ctx.getMessage('roles.picker.title')} {loadingMessage ? ' ('+ctx.getMessage('21')+')':''}</div>
                    <div style={{marginTop: 6}}>
                        <DropDownMenu underlineStyle={{display:'none'}} onChange={this.onChange} value={-1}>{addableRoles}</DropDownMenu>
                    </div>
                </div>
                {open &&
                    <Fragment>
                        <div className={"roles-list" + (uniqueRoleDisplay?' has-selection':'')} style={{margin: '0 12px', paddingBottom:1}}>
                            {groups.map((g) => renderItem(g))}
                            <SortableList
                                key="sortable"
                                values={manual}
                                removable={true}
                                onRemove={this.remove}
                                onOrderUpdated={this.orderUpdated}
                                renderItem={renderItem}
                            />
                            {users.map((u) => renderItem(u))}
                        </div>
                        <div className={"roles-list" + (uniqueRoleDisplay?' has-selection':'')} style={{margin: '-2px 10px -8px', padding: '0px 2px 0', borderTop: '2px solid #b3b3b3'}}>
                            {renderItem({icon:'account-circle-outline', text:'Effective Role', removable: false, noClick: true, className:' effective'})}
                        </div>
                    </Fragment>
                }
            </div>
        );

    },
});
