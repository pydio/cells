const React = require('react');

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

import PropTypes from 'prop-types';

import Pydio from 'pydio'
const {AsyncComponent} = Pydio.requireLib('boot');
const {UserAvatar, MenuItemsConsumer, MenuUtils, Toolbar} = Pydio.requireLib('components');
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc');
const {Paper} = require('material-ui');
import BookmarksList from './BookmarksList'

class UserWidget extends React.Component {

    constructor(props){
        super(props);
        this.state = {showMenu: false};
    }

    static getPropTypes() {
        return {
            pydio: PropTypes.instanceOf(Pydio),
            style: PropTypes.object,
            avatarStyle: PropTypes.object,
            actionBarStyle: PropTypes.object,
            avatarOnly: PropTypes.bool,
        };
    }

    showMenu(event){
        this.setState({
            showMenu: true,
            anchor: event.currentTarget
        })
    }

    closeMenu(event, index, menuItem){
        this.setState({showMenu: false});
    }

    applyAction(actionName){
        switch (actionName){
            case 'home':
                this.props.pydio.triggerRepositoryChange('homepage');
                break;
            case 'settings':
                this.props.pydio.triggerRepositoryChange('settings');
                break;
            case 'about_pydio':
                this.props.pydio.getController().fireAction('splash');
                break;
            default:
                break;
        }
    }

    render() {

        let avatar;
        let notificationsButton, currentIsSettings, bookmarksButton;
        let {pydio, displayLabel, avatarStyle, popoverDirection, popoverTargetPosition, color, menuItems} = this.props;
        const {showMenu, anchor} = this.state;
        if(pydio.user){
            const user = this.props.pydio.user;
            currentIsSettings = user.activeRepository === 'settings';
            avatarStyle = {...avatarStyle, position:'relative'};
            const menuProps = {
                display:'right',
                width:160,
                desktop:true,
            };
            avatar = (
                <div onClick={(e)=>{this.showMenu(e)}} style={{cursor:'pointer', maxWidth:155}}>
                    <UserAvatar
                        pydio={pydio}
                        userId={user.id}
                        style={avatarStyle}
                        className="user-display"
                        labelClassName="userLabel"
                        displayLabel={displayLabel}
                        displayLabelChevron={true}
                        labelChevronStyle={{color: color}}
                        labelMaxChars={8}
                        labelStyle={{flex: 1, marginLeft: 8, color: color}}
                        avatarSize={38}
                    />
                    <Popover
                        zDepth={2}
                        open={showMenu}
                        anchorEl={anchor}
                        anchorOrigin={{horizontal: popoverDirection || 'right', vertical: popoverTargetPosition || 'bottom'}}
                        targetOrigin={{horizontal: popoverDirection || 'right', vertical: 'top'}}
                        onRequestClose={() => {this.closeMenu()}}
                        useLayerForClickAway={false}
                        style={{marginTop:-10, marginLeft:10}}
                    >
                        {MenuUtils.itemsToMenu(menuItems, this.closeMenu.bind(this), false, menuProps)}
                    </Popover>
                </div>
            );

            // Temporary disable activities loading
            if(!this.props.hideNotifications){
                notificationsButton = (
                    <AsyncComponent
                        namespace="PydioActivityStreams"
                        componentName="UserPanel"
                        noLoader={true}
                        iconClassName="userActionIcon mdi mdi-bell"
                        iconStyle={{color}}
                        {...this.props}
                    />
                );
            }
            bookmarksButton = (<BookmarksList pydio={this.props.pydio} iconStyle={{color}}/>);
        }


        // Do not display Home Button here for the moment
        const actionBarStyle = this.props.actionBarStyle || {};
        let actionBar;
        if(!currentIsSettings){
            actionBar = (
                <div className="action_bar" style={{display:'flex', ...actionBarStyle}}>
                    <Toolbar
                        {...this.props}
                        toolbars={['user-widget']}
                        renderingType="icon"
                        toolbarStyle={{display:'inline'}}
                        buttonStyle={{color: color, fontSize: 18}}
                        tooltipPosition="bottom-right"
                        className="user-widget-toolbar"
                    />
                    {notificationsButton}
                    {bookmarksButton}
                </div>
            );

        }

        if(this.props.children){
            return (
                <Paper zDepth={1} rounded={false} style={{...this.props.style, display:'flex'}} className="user-widget">
                    <div style={{flex: 1}}>
                        {avatar}
                        {actionBar}
                    </div>
                    {this.props.children}
                </Paper>
            );
        }else{
            return (
                <Paper zDepth={1} rounded={false} style={this.props.style} className="user-widget">
                    {avatar}
                    {this.props.style && this.props.style.display === 'flex' && <span style={{flex:1}}/>}
                    {actionBar}
                </Paper>
            );
        }
    }
}

UserWidget = MenuItemsConsumer(UserWidget);

export {UserWidget as default}
