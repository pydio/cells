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
import React, {Component} from 'react'
import Pydio from 'pydio'
const {MenuItem, IconMenu, IconButton} = require('material-ui')
const {muiThemeable} = require('material-ui/styles')
const {UserAvatar} = Pydio.requireLib('components')

class UserBadge extends Component{

    renderMenu(){
        if (!this.props.menus || !this.props.menus.length) {
            return null;
        }
        const menuItems = this.props.menus.map(function(m){
            let rightIcon;
            if(m.checked){
                rightIcon = <span className="mdi mdi-check"/>;
            }
            return (
                <MenuItem
                    primaryText={m.text}
                    onClick={m.callback}
                    rightIcon={rightIcon}/>
            );
        });
        const iconStyle = {fontSize: 18};
        return(
            <IconMenu
                iconButtonElement={<IconButton style={{width:30,height:30, padding: 5}} iconStyle={iconStyle} iconClassName="mdi mdi-dots-vertical"/>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                desktop={true}
            >
                {menuItems}
            </IconMenu>
        );
    }

    render() {
        const {type, muiTheme, avatarUser} = this.props;
        let avatar;
        let avatarColor = muiTheme.palette.avatarsColor;
        if(type === 'group') {
            avatar = <span className="avatar mdi mdi-account-multiple" style={{backgroundColor: avatarColor}}/>;
        }else if(type === 'team') {
            avatar = <span className="avatar mdi mdi-account-multiple-outline" style={{backgroundColor:avatarColor}}/>;
        }else if(type === 'temporary') {
            avatar = <span className="avatar mdi mdi-account-plus" style={{backgroundColor:avatarColor}}/>;
        }else if(type === 'remote_user'){
            avatar = <span className="avatar mdi mdi-account-network" style={{backgroundColor:avatarColor}}/>;
        }else{
            //avatar = <span className="avatar mdi mdi-account" style={{backgroundColor:avatarColor}}/>;
            avatar = (
                <UserAvatar
                    avatarSize={24}
                    pydio={Pydio.getInstance()}
                    userId={avatarUser.Login}
                    avatarOnly={true}
                    idmUser={avatarUser}
                    userType={'user'}
                    useDefaultAvatar={true}
                    avatarClassName={"avatar"}
                    style={{padding: 0, lineHeight: '16px'}}
                />
            )
        }
        const menu = this.renderMenu();
        const {boxes} = this.props;
        return (
            <div className={"share-dialog user-badge user-type-" + this.props.type}>
                {avatar}
                <span className="user-badge-label">{this.props.label}</span>
                {menu}
                {boxes}
            </div>
        );
    }
}

UserBadge.propTypes = {
    label   : PropTypes.string,
    avatar  : PropTypes.string,
    type    : PropTypes.string,
    menus   : PropTypes.object,
    muiTheme: PropTypes.object,
};

UserBadge = muiThemeable()(UserBadge);

export {UserBadge as default}