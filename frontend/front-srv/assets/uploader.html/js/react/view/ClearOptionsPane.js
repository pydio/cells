/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import {Popover, Divider, Menu, MenuItem, Subheader} from 'material-ui'

class ClearOptionsPane extends React.Component {

    clear(value){
        const store = UploaderModel.Store.getInstance();
        switch (value) {
            case "all":
                store.clearAll();
                break;
            case "loaded":
                store.clearStatus('loaded');
                break;
            case "error":
                store.clearStatus('error');
                break;
            default:
                break;
        }
        this.props.onDismiss();
    }

    render() {
        const msg = Pydio.getMessages();
        return (
            <Popover
                open={this.props.open}
                anchorEl={this.props.anchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={(e) => {
                    this.props.onDismiss(e)
                }}
            >
                <Menu style={{width: 146}} desktop={true}>
                    <Subheader style={{lineHeight:'26px'}}>{msg['html_uploader.clear-header']}</Subheader>
                    <MenuItem primaryText={msg['html_uploader.clear-finished']} onClick={()=>{this.clear('loaded')}}/>
                    <MenuItem primaryText={msg['html_uploader.clear-failed']} onClick={()=>{this.clear('error')}}/>
                    <MenuItem primaryText={msg['html_uploader.clear-all']} onClick={()=>{this.clear('all')}}/>
                </Menu>
            </Popover>
        );
    }

}

export {ClearOptionsPane as default}