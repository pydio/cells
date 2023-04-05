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

import React from 'react';
import Pydio from 'pydio'
import PropTypes from 'prop-types';

import ShareContextConsumer from '../ShareContextConsumer'
import SharedUserEntry from './SharedUserEntry'
import ActionButton from '../main/ActionButton'
const {UsersCompleter} = Pydio.requireLib('components');
import {muiThemeable} from 'material-ui/styles'

class SharedUsers extends React.Component {
    static propTypes = {
        pydio:PropTypes.instanceOf(Pydio),

        cellAcls:PropTypes.object,

        saveSelectionAsTeam:PropTypes.func,
        sendInvitations:PropTypes.func,
        showTitle:PropTypes.bool,

        onUserObjectAdd:PropTypes.func.isRequired,
        onUserObjectRemove:PropTypes.func.isRequired,
        onUserObjectUpdateRight:PropTypes.func.isRequired,

    };

    sendInvitationToAllUsers = () => {
        const {cellAcls, pydio} = this.props;
        let userObjects = [];
        Object.keys(cellAcls).map(k => {
            const acl = cellAcls[k];
            if (acl.User && acl.User.Login === pydio.user.id) {
                return;
            }
            if(acl.User) {
                const userObject = PydioUsers.User.fromIdmUser(acl.User);
                userObjects[userObject.getId()] = userObject;
            }
        });
        this.props.sendInvitations(userObjects);
    };

    clearAllUsers = () => {
        Object.keys(this.props.cellAcls).map(k=>{
            this.props.onUserObjectRemove(k);
        })
    };

    valueSelected = (userObject) => {
        if(userObject.IdmUser){
            this.props.onUserObjectAdd(userObject.IdmUser);
        } else {
            this.props.onUserObjectAdd(userObject.IdmRole);
        }
    };

    render() {
        const {cellAcls, pydio, completerStyle, muiTheme} = this.props;
        const authConfigs = pydio.getPluginConfigs('core.auth');
        let index = 0;
        let userEntries = [];
        Object.keys(cellAcls).map(k => {
            const acl = cellAcls[k];
            if (acl.User && acl.User.Login === pydio.user.id){
                return;
            }
            index ++;
            userEntries.push(<SharedUserEntry
                cellAcl={acl}
                key={index}
                pydio={this.props.pydio}
                readonly={this.props.readonly}
                sendInvitations={this.props.sendInvitations}
                onUserObjectRemove={this.props.onUserObjectRemove}
                onUserObjectUpdateRight={this.props.onUserObjectUpdateRight}
            />);
        });

        let actionLinks = [];
        const aclsLength = Object.keys(this.props.cellAcls).length;
        if(aclsLength && !this.props.isReadonly() && !this.props.readonly){
            actionLinks.push(<ActionButton key="clear" callback={this.clearAllUsers} tooltipPosition={"top-center"} mdiIcon="account-minus" messageId="180"/>)
        }
        if(aclsLength && this.props.sendInvitations){
            actionLinks.push(<ActionButton key="invite" callback={this.sendInvitationToAllUsers} tooltipPosition={"top-center"} mdiIcon="email-outline" messageId="45"/>)
        }
        if(this.props.saveSelectionAsTeam && aclsLength > 1 && !this.props.isReadonly() && !this.props.readonly){
            actionLinks.push(<ActionButton key="team" callback={this.props.saveSelectionAsTeam} mdiIcon="account-multiple-plus" tooltipPosition={"top-center"}  messageId="509" messageCoreNamespace={true}/>)
        }
        if(this.props.withActionLinks) {
            actionLinks = this.props.withActionLinks(actionLinks);
        }
        let rwHeader, usersInput;
        if(userEntries.length){
            let color = 'rgba(0,0,0,.33)'
            if(muiTheme.userTheme === 'mui3'){
                color = muiTheme.palette.mui3.outline
            }
            rwHeader = (
                <div style={{display:'flex', marginBottom: -8, marginTop: -8, color, fontSize:12}}>
                    <div style={{flex: 1}}/>
                    <div style={{width: 43, textAlign:'center'}}>{this.props.getMessage('361', '')}</div>
                    <div style={{width: 43, textAlign:'center'}}>{this.props.getMessage('181')}</div>
                    <div style={{width: 6}}/>
                </div>
            );
        }
        if(!this.props.isReadonly() && !this.props.readonly){
            const excludes = Object.values(cellAcls).map(a => {
                if(a.User) {
                    return a.User.Login;
                } else if(a.Group) {
                    return a.Group.Uuid;
                } else if(a.Role) {
                    return a.Role.Uuid
                } else {
                    return null
                }
            }).filter(k => !!k);
            const canCreate = authConfigs.get('USER_CREATE_USERS')
            usersInput = (
                <UsersCompleter
                    className="share-form-users"
                    fieldLabel={this.props.getMessage(canCreate?'34':'34b')}
                    onValueSelected={this.valueSelected}
                    pydio={this.props.pydio}
                    showAddressBook={true}
                    usersFrom="local"
                    excludes={excludes}
                    existingOnly={!canCreate}
                />
            );
        }

        return (
            <div>
                <div style={completerStyle || {margin: '0 8px 16px'}}>{usersInput}</div>
                {rwHeader}
                <div>{userEntries}</div>
                {!userEntries.length &&
                    <div style={{color: muiTheme.palette.mui3['on-surface-variant'], fontWeight: 500, margin: '0 10px'}}>{this.props.getMessage('182')}</div>
                }
                {userEntries.length > 0 &&
                    <div style={{textAlign:'center', marginTop: 10, marginBottom: 10}}>{actionLinks}</div>
                }
            </div>
        );

    }
}

SharedUsers = ShareContextConsumer(muiThemeable()(SharedUsers));
export {SharedUsers as default}