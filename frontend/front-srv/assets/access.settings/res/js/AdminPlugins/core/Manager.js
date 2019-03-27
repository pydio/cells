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
import {RaisedButton, Paper} from 'material-ui'
import PydioApi from 'pydio/http/api'

const PluginsManager = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    reload(){
        this.refs.list.reload();
    },

    render(){

        return (
            <div style={{height:'100%'}} className="vertical-layout">
                <AdminComponents.Header
                    title={this.props.currentNode.getLabel()}
                    icon={this.props.currentNode.getMetadata().get('icon_class')}
                    reloadAction={this.reload}
                />
                <Paper zDepth={1} style={{margin: 16}} className="vertical-layout layout-fill">
                    <PluginsList {...this.props} hideToolbar={true} ref="list"/>
                </Paper>
            </div>
        );
    }

});

export {PluginsManager as default}