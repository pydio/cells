const PropTypes = require('prop-types');
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
import {Checkbox} from 'material-ui'
import UserBadge from './UserBadge'
import ShareContextConsumer from '../ShareContextConsumer'

class SharedUserEntry extends React.Component {
    static propTypes = {
        cellAcl:PropTypes.object.isRequired,
        sendInvitations:PropTypes.func,
        onUserObjectRemove:PropTypes.func.isRequired,
        onUserObjectUpdateRight:PropTypes.func.isRequired,
    };

    onRemove = () => {
        this.props.onUserObjectRemove(this.props.cellAcl.RoleId);
    };

    onInvite = () => {
        let targets = {};
        const userObject = PydioUsers.User.fromIdmUser(this.props.cellAcl.User);
        targets[userObject.getId()] = userObject;
        this.props.sendInvitations(targets);
    };

    onUpdateRight = (name, checked) => {
        this.props.onUserObjectUpdateRight(this.props.cellAcl.RoleId, name, checked);
    };

    render() {
        const {cellAcl, pydio} = this.props;
        let menuItems = [];
        const type = cellAcl.User ? 'user' : (cellAcl.Group ? 'group' : 'team');

        // Do not render current user
        if(cellAcl.User && cellAcl.User.Login === pydio.user.id){
            return null;
        }

        if(type !== 'group'){
            if(this.props.sendInvitations){
                // Send invitation
                menuItems.push({
                    text:this.props.getMessage('45'),
                    callback:this.onInvite
                });
            }
        }
        if(!this.props.isReadonly() && !this.props.readonly){
            // Remove Entry
            menuItems.push({
                text:this.props.getMessage('257', ''),
                callback:this.onRemove
            });
        }

        let label, avatarIdmUser;
        switch (type){
            case "user":
                label = cellAcl.User.Attributes["displayName"] || cellAcl.User.Login;
                avatarIdmUser = cellAcl.User
                break;
            case "group":
                if (cellAcl.Group.Attributes) {
                    label = cellAcl.Group.Attributes["displayName"] || cellAcl.Group.GroupLabel;
                } else {
                    label = cellAcl.Group.Uuid;
                }
                break;
            case "team":
                if (cellAcl.Role) {
                    label = cellAcl.Role.Label;
                } else {
                    label = "No role found";
                }
                break;
            default:
                label = cellAcl.RoleId;
                break;
        }
        let read = false, write = false;
        cellAcl.Actions.map((action) =>{
            if(action.Name === 'read') {
                read = true;
            }
            if(action.Name === 'write') {
                write = true;
            }
        });
        const disabled = this.props.isReadonly() || this.props.readonly;
        let style = {
            display: 'flex',
            width: 70,
        };
        if(!menuItems.length){
            style = {...style, marginRight: 48}
        }

        const boxes= (
            <span style={style}>
                    <Checkbox disabled={disabled} checked={read} onCheck={(e, v) => {this.onUpdateRight('read', v)}}/>
                    <Checkbox disabled={disabled} checked={write} onCheck={(e, v) => {this.onUpdateRight('write', v)}}/>
            </span>
        )

        return (
            <UserBadge
                label={label}
                avatarUser={avatarIdmUser}
                type={type}
                menus={menuItems}
                boxes={boxes}
            />
        );
    }
}

SharedUserEntry = ShareContextConsumer(SharedUserEntry);
export {SharedUserEntry as default}