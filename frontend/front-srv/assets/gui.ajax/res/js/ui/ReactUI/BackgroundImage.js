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

class BackgroundImage{

    static getImageBackgroundFromConfig(configName, forceConfigs){

        let bgrounds,paramPrefix,bStyles,index, i;
        if(forceConfigs){
            bgrounds = forceConfigs;
            paramPrefix = configName;
            bStyles = [];
            index = 1;
            while(bgrounds[paramPrefix+index]){
                bStyles.push({
                    backgroundImage:"url('"+bgrounds[paramPrefix+index]+"')",
                    backgroundSize:"cover",
                    backgroundPosition:"center center"
                });
                index++;
            }
            if (bStyles.length) {
                i = Math.floor( Math.random() * bStyles.length);
                return bStyles[i];
            }
            return {};
        }
        return BackgroundImage.computeBackgroundFromConfigs(configName);

    }

    static computeBackgroundFromConfigs(configName, important){

        let bgrounds,paramPrefix,bStyles,index, i;

        let exp = configName.split("/");
        let plugin = exp[0];
        paramPrefix = exp[1];
        const registry = pydio.getXmlRegistry();
        const configs = XMLUtils.XPathSelectNodes(registry, "plugins/*[@id='"+plugin+"']/plugin_configs/property[contains(@name, '"+paramPrefix+"')]");
        const defaults = XMLUtils.XPathSelectNodes(registry, "plugins/*[@id='"+plugin+"']/server_settings/global_param[contains(@name, '"+paramPrefix+"')]");


        bgrounds = {};
        configs.map(function(c){
            bgrounds[c.getAttribute("name")] = c.firstChild.nodeValue.replace(/"/g, '');
        });
        defaults.map(function(d){
            if(!d.getAttribute('defaultImage')) return;
            let n = d.getAttribute("name");
            if(!bgrounds[n]){
                bgrounds[n] = d.getAttribute("defaultImage");
            }else{
                if(PathUtils.getBasename(bgrounds[n]) == bgrounds[n]){
                    bgrounds[n] = pydio.Parameters.get('ajxpServerAccess')+"&get_action=get_global_binary_param&binary_id="+bgrounds[n];
                }
            }
        });
        bStyles = [];
        index = 1;
        while(bgrounds[paramPrefix+index]){
            bStyles.push({
                backgroundImage:"url('"+bgrounds[paramPrefix+index]+"')" + (important?' !important':''),
                backgroundSize:"cover",
                backgroundPosition:"center center"
            });
            index++;
        }
        let windowWith = DOMUtils.getViewportWidth();
        if(windowWith < 600 && bgrounds[paramPrefix+'LOWRES']){
            // This is probably a mobile, let's force switching to low res.
            bStyles = [{
                backgroundImage:"url('"+bgrounds[paramPrefix+'LOWRES']+"')" + (important?' !important':''),
                backgroundSize:"cover",
                backgroundPosition:"center center"
            }];
        }
        if (bStyles.length) {
            i = Math.floor( Math.random() * bStyles.length);
            return bStyles[i];
        }
        return {};

    }


}

export {BackgroundImage as default}