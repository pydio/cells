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
import PluginEditor from './PluginEditor'

const CoreAndPluginsDashboard = React.createClass({

    render:function(){
        var coreId = PathUtils.getBasename(this.props.rootNode.getPath());
        if(coreId.indexOf("core.") !== 0) coreId = "core." + coreId ;
        var fakeNode = new AjxpNode('/' + coreId);
        var pluginsList = <PluginsList {...this.props} title={this.props.rootNode.getLabel()}/>;
        return (
            <PluginEditor
                rootNode={fakeNode}
                additionalPanes={{top:[], bottom:[pluginsList]}}
            />
        );
    }

});

export {CoreAndPluginsDashboard as default}