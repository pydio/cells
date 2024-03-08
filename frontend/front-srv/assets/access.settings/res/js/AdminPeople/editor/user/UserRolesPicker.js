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
import React, {Fragment, Component} from 'react';
import {MenuItem} from 'material-ui'
import {withRoleMessages} from '../util/MessagesMixin'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api';
const {SortableList} = Pydio.requireLib('components')
const {ModernAutoComplete} = Pydio.requireLib('hoc');

class RolesComplete extends Component {

    constructor(props) {
        super(props);
        this.state = {value: '', roles: []}
        this.load()
    }

    load() {
        const {value} = this.state;
        const {userRoles} = this.props
        const filter = value ? '*' + value + '*' : ''
        PydioApi.getRestClient().getIdmApi().listRolesV2(0, 50, [PydioApi.RoleTypeAdmin, PydioApi.RoleTypeTeam], filter).then(roles => {
            this.setState({roles: roles.filter(r => userRoles.filter(r1 => r.Uuid === r1.Uuid).length === 0)});
        })
    }

    handleNewRequest(item) {
        const {onAddRole} = this.props;
        if(item && item.payload) {
            onAddRole(item.payload)
            this.setState({value: ''}, () => this.load())
        }
    }

    render() {
        const {getMessage} = this.props;
        const {value, roles, focus} = this.state;
        const datasource = roles.map(r => {
            return {value: <MenuItem primaryText={r.Label} onKeyDown={(e) =>{if(e.key==='Enter'){this.handleNewRequest({payload: r})} }}/>, key:r.Uuid, text: r.Label, payload: r}
        })
        let inputStyle;
        if(!focus){
            inputStyle = {backgroundColor: 'transparent', cursor: 'pointer'}
        }
        return  (
            <ModernAutoComplete
                fullWidth={true}
                hintText={focus ?getMessage('roles.picker.hint'):getMessage('roles.picker.add')}
                variant={"compact"}
                onFocus={()=>this.setState({focus:true})}
                onBlur={()=>this.setState({focus:false})}
                inputStyle={{paddingLeft: 2, borderRadius:2, ...inputStyle}}
                hintStyle={{paddingLeft: 2, textTransform:'capitalize', color:focus?'#bbb':'rgb(5, 169, 244)', cursor: 'pointer'}}
                filter={(searchText, key) => (!searchText.indexOf || key.toLowerCase().indexOf(searchText.toLowerCase()) >= 0)}
                openOnFocus={true}
                dataSource={datasource}
                searchText={value}
                onNewRequest={(s,i) => {this.handleNewRequest(s)}}
                onUpdateInput={(v) => {this.setState({value:v}, ()=>this.load())}}
                desktop={true}
                menuProps={{maxHeight:300,overflowY: 'auto', desktop: true}}
            />
        )
    }
}

class UsersRolesPicker extends Component{

    constructor(props){
        super(props)
        this.state = {open: false}
    }

    onChange(e, selectedIndex, value){
        if(value === -1) {
            return;
        }
        const {user} = this.props
        user.addRole(value);
    }

    remove(value){
        const {user} = this.props;
        const roles = user.getIdmUser().Roles;
        const role = roles.filter(r => r.Uuid === value)[0];
        user.removeRole(role);
    }

    orderUpdated(oldId, newId, currentValues){
        const {user} = this.props
        user.switchRoles(oldId, newId);
    }

    displayUniqueRole(roleId) {
        const {user} = this.props;
        const uniqueRoleDisplay = user.getRole().getUniqueRoleDisplay()
        user.getRole().setUniqueRoleDisplay(uniqueRoleDisplay === roleId ? null : roleId)
    }

    render(){

        let groups=[], manual=[];
        const {user, loadingMessage, getMessage, buildGroupPath} = this.props;
        const {open} = this.state;

        const idmUser = user.getIdmUser()
        const userLabel = idmUser.Attributes && idmUser.Attributes["displayName"] || idmUser.Login
        const profile = idmUser.Attributes && idmUser.Attributes['profile'] || ''
        const roles = idmUser.Roles;
        const uniqueRoleDisplay = user.getRole().getUniqueRoleDisplay()

        const renderItem = ({payload, icon, text, removable = false, noClick, className = ''}) => {
            const selected = payload === uniqueRoleDisplay
            const click = noClick?null:()=> this.displayUniqueRole(payload)
            let classes = ['role-item']
            if(className){
                classes.push(className)
            }
            if(removable){
                classes.push('role-item-sortable')
            }
            if(selected){
                classes.push('role-item-selected')
            }
            if(noClick){
                classes.push('role-item-noclick')
            }
            return (
                <div className={classes.join(' ')} style={{display:'flex', alignItems:'center'}} key={payload}>
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
            if(r.UserRole){
                return;
            }
            if(r.GroupRole){
                if(r.Uuid === 'ROOT_GROUP') {
                    groups.push({payload: r.Uuid, text: '/', icon:'folder-account-outline'});
                }else {
                    const path = buildGroupPath(r.Uuid)
                    groups.push({payload: r.Uuid, text:path || getMessage('user.26', 'ajxp_admin').replace('%s', r.Label || r.Uuid), icon:'folder-account-outline'});
                }
            } else {
                if(r.AutoApplies && r.AutoApplies.indexOf(profile) !== -1){
                    groups.push({payload: r.Uuid, text:r.Label + ' [auto]', icon:'account-multiple-outline'});
                } else {
                    manual.push({payload:r.Uuid, text:r.Label, removable: true, icon:'account-multiple-outline'});
                }
            }
        });

        const toggleOpen = ()=>this.setState({open:!open})
        return (
            <div className="user-roles-picker paper-right-block" style={{padding:'8px 0'}}>
                <div style={{paddingLeft: 16, display: 'flex', alignItems: 'center', height: 40}}>
                    <div style={{fontSize: 20, cursor:'pointer'}} onClick={toggleOpen} className={"mdi mdi-chevron-"+(open?'down':'right')}/>
                    <div style={{flex: 1, fontSize: 16, cursor:'pointer'}} onClick={toggleOpen}>{getMessage('roles.picker.title')} {loadingMessage ? ' ('+getMessage('21')+')':''}</div>
                </div>
                {open &&
                    <Fragment>
                        <div className={"roles-list" + (uniqueRoleDisplay?' has-selection':'') + (manual.length > 1?' has-sortable':'')} style={{margin: '0 12px', paddingBottom:1}}>
                            {groups.map((g) => renderItem(g))}
                            <SortableList
                                key="sortable"
                                values={manual}
                                removable={true}
                                onRemove={this.remove.bind(this)}
                                onOrderUpdated={this.orderUpdated.bind(this)}
                                renderItem={renderItem}
                            />
                            <div className={"role-item role-item-add no-click"} style={{height: 44, padding: '0 8px', display:'flex', alignItems:'center'}}>
                                <span className={"left-icon mdi mdi-account-multiple-plus-outline"} style={{ color:'rgb(5, 169, 244)', cursor: 'pointer'}}/>
                                <RolesComplete userRoles={roles} getMessage={getMessage} onAddRole={(roleID) => user.addRole(roleID)}/>
                            </div>
                        </div>
                        <div className={"roles-list" + (uniqueRoleDisplay?' has-selection':'')} style={{margin: '-2px 10px -8px', padding: '0px 2px 0', borderTop: '2px solid #b3b3b3'}}>
                            {renderItem({icon:'account-edit-outline', text:getMessage('roles.picker.effective').replace('%s', userLabel), removable: false, noClick: true, className:' effective'})}
                        </div>
                    </Fragment>
                }
            </div>
        );

    }
}

UsersRolesPicker = withRoleMessages(UsersRolesPicker)
export default UsersRolesPicker