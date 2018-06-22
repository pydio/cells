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
import {Badge, IconButton, Popover, Divider, List} from 'material-ui'
import Client from './Client'
import ActivityList from './ActivityList'
import debounce from 'lodash.debounce'

class UserPanel extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            unreadStatus: 0,
            open: false,
            data: [],
        };
        this.reloadData = debounce(this.reloadData.bind(this), 500);
        this.reloadUnread = debounce(this.reloadUnread.bind(this), 500);
    }

    reloadData() {
        Client.loadActivityStreams((json) => {
            this.setState({data: json});
        }, 'USER_ID', this.props.pydio.user.id, 'inbox');
    }

    reloadUnread() {
        Client.UnreadInbox(this.props.pydio.user.id, (count) => {
            this.setState({unreadStatus: count});
        });
    }

    onStatusChange(){
        if(this.props.onUnreadStatusChange){
            this.props.onUnreadStatusChange(this.state.unreadStatus);
        }
    }

    handleTouchTap(event) {
        // This prevents ghost click.
        event.preventDefault();
        //if(this.state.unreadStatus){
            //this.updateAlertsLastRead();
        //}
        this.reloadData();
        this.setState({
            open: true,
            anchorEl: event.currentTarget,
            unreadStatus: 0
        }, this.onStatusChange.bind(this));
    }

    handleRequestClose() {
        this.setState({
            open: false,
        });
    }

    componentWillMount() {
        this.reloadUnread();
        this.props.pydio.observe('websocket_event:activity', (event) => {
            if (this.state.open) {
                this.reloadData();
            } else {
                this.reloadUnread();
            }
        })
    }

    render() {

        return (
            <span>
                <Badge
                    badgeContent={this.state.unreadStatus}
                    secondary={true}
                    style={this.state.unreadStatus  ? {padding: '0 24px 0 0'} : {padding: 0}}
                    badgeStyle={this.state.unreadStatus ? null : {display: 'none'}}
                >
                    <IconButton
                        onTouchTap={this.handleTouchTap.bind(this)}
                        iconClassName={this.props.iconClassName || "icon-bell"}
                        tooltip={this.props.pydio.MessageHash['notification_center.4']}
                        className="userActionButton alertsButton"
                    />
                </Badge>
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose.bind(this)}
                    style={{width:320}}
                    zDepth={2}

                >
                    {this.state.data &&
                        <ActivityList
                            items={this.state.data.items}
                            style={{overflowY:'scroll', maxHeight: 330, paddingTop: 20}}
                            groupByDate={true}
                            displayContext={"popover"}
                        />}
                </Popover>
            </span>
        );
    }

}

export {UserPanel as default};