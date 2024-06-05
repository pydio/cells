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

const ConfigLogo =({pydio, pluginName, pluginParameter, style, darkMode, className})=> {
    let logo = pydio.Registry.getPluginConfigs(pluginName).get(pluginParameter);
    let url;
    if(!logo){
        logo = pydio.Registry.getDefaultImageFromParameters(pluginName, pluginParameter);
    }
    if(logo){
        if(logo.indexOf('plug/') === 0){
            if(logo.indexOf('[mode]') !== -1){
                logo = logo.replace('[mode]', darkMode?'dark':'light')
            }
            url = logo;
        }else{
            url = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + logo;
        }
    }
    return <img alt={"application logo"} src={url} style={style} className={className}/>
}


export {ConfigLogo as default}