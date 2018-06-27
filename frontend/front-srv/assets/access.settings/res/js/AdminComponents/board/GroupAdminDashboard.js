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
import {RaisedButton, FlatButton, Paper} from 'material-ui'
import {MessagesConsumerMixin} from '../util/Mixins'

const GroupAdminDashboard = React.createClass({

    mixins:[MessagesConsumerMixin],

    renderLink: function(node){

        const label = <span><span className={node.iconClass + ' button-icon'}></span> {node.label}</span>
        return(
            <span style={{display:'inline-block', margin:'0 5px'}}>
                <RaisedButton
                    key={node.path}
                    secondary={true}
                    onTouchTap={function(){pydio.goTo(node.path);}}
                    label={label}
                />
                </span>
        );

    },

    render: function(){

        const baseNodes = [
            {
                path:'/idm/users',
                label:this.context.getMessage('249', ''),
                iconClass:'icon-user'
            },{
                path:'/data/workspaces',
                label:this.context.getMessage('250', ''),
                iconClass:'icon-hdd'
            }];
        return (
            <div style={{width:'100%', height:'100%'}}>
                <Paper zDepth={1} style={{margin:10}}>
                    <div style={{padding:10}}>{this.context.getMessage('home.67')}</div>
                    <div style={{padding:10, textAlign:'center'}}>
                        {baseNodes.map(function(n){return this.renderLink(n); }.bind(this))}
                        <br/>
                        <FlatButton
                            label={this.context.getMessage('home.68')}
                            secondary={true}
                            onTouchTap={function(){pydio.triggerRepositoryChange("homepage");}}
                        />
                    </div>
                </Paper>
            </div>
        );
    }

});

export {GroupAdminDashboard as default}