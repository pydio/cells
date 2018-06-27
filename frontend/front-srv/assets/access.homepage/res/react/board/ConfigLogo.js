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

const React = require('react')

class ConfigLogo extends React.Component{

    render(){
        let logo = this.props.pydio.Registry.getPluginConfigs(this.props.pluginName).get(this.props.pluginParameter);
        let url;
        if(!logo){
            logo = this.props.pydio.Registry.getDefaultImageFromParameters(this.props.pluginName, this.props.pluginParameter);
        }
        if(logo){
            if(logo.indexOf('plugins/') === 0){
                url = logo;
            }else{
                url = this.props.pydio.Parameters.get('ajxpServerAccess') + "&get_action=get_global_binary_param&binary_id=" + logo;
            }
        }
        return <img src={url} style={this.props.style} className={this.props.className}/>
    }
}

export {ConfigLogo as default}