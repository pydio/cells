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

import PluginsList from './PluginsList'
import React from 'react'
import {RaisedButton, Paper, TextField, FontIcon} from 'material-ui'

const PluginsManager = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    getInitialState(){
        return {filter: ''}
    },

    reload(){
        this.refs.list.reload();
    },

    render(){
        const {filter} = this.state;

        return (
            <div style={{height:'100%'}} className="vertical-layout">
                <AdminComponents.Header
                    title={this.props.currentNode.getLabel()}
                    icon={this.props.currentNode.getMetadata().get('icon_class')}
                    reloadAction={this.reload}
                    actions={[
                        <FontIcon className={"mdi mdi-filter"} style={{fontSize:16, marginRight: 10, color: 'rgba(0,0,0,0.2)'}}/>,
                        <TextField style={{width:196}} placeholder={this.props.pydio.MessageHash['87']} value={filter} onChange={(e,v)=>{this.setState({filter: v})}}/>
                    ]}
                />
                <Paper zDepth={1} style={{margin: 16}} className="vertical-layout layout-fill">
                    <PluginsList {...this.props} hideToolbar={true} ref="list" filterString={filter}/>
                </Paper>
            </div>
        );
    }

});

export {PluginsManager as default}