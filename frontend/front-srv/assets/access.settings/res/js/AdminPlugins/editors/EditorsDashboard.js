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

import PluginsList from '../core/PluginsList'
import {Paper} from 'material-ui'
import createReactClass from 'create-react-class'

const EditorsDashboard = createReactClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    render:function(){
        return(
            <div className="main-layout-nav-to-stack vertical-layout" style={this.props.style}>
                <Paper className="vertical-layout" zDepth={0}>
                    <h1 className="admin-panel-title">{this.context.getMessage('plugtype.title.editor', '')}</h1>
                    <div style={{padding:'0 20px'}} className="layout-fill-scroll-y">
                        {this.context.getMessage('plugins.4')}
                    </div>
                </Paper>
                <PluginsList {...this.props}/>
            </div>
        );
    }

});

export {EditorsDashboard as default}