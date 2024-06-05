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
import PathUtils from 'pydio/util/path'
import PluginsList from './PluginsList'
import PluginEditor from './PluginEditor'

class CoreAndPluginsDashboard extends React.Component{

    render(){
        let basename = PathUtils.getBasename(this.props.rootNode.getPath());
        let type, pluginId;
        if(basename.indexOf('.') > -1){
            type = basename.split('.')[1];
            pluginId = basename;
        } else{
            type = basename;
            pluginId = "core." + basename;
        }
        const pluginsList = <PluginsList
            {...this.props}
            displaySmall={true}
            filterType={type}
            accessByName={this.props.accessByName}
            title={this.props.rootNode.getLabel()}
        />;
        return (
            <PluginEditor
                currentNode={this.props.currentNode}
                pydio={this.props.pydio}
                pluginId={pluginId}
                additionalPanes={{top:[], bottom:[pluginsList]}}
                accessByName={this.props.accessByName}
            />
        );
    }

}

export {CoreAndPluginsDashboard as default}