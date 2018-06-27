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
const PathUtils = require('pydio/util/path')

export default {

    propTypes:{
        attributes:React.PropTypes.object.isRequired,
        applyButtonAction:React.PropTypes.func,
        actionCallback:React.PropTypes.func
    },

    applyAction:function(callback){
        const choicesValue = this.props.attributes['choices'].split(":");
        const firstPart = choicesValue.shift();
        if(firstPart === "run_client_action" && global.pydio){
            global.pydio.getController().fireAction(choicesValue.shift());
            return;
        }
        if(this.props.applyButtonAction){
            let parameters = {get_action:firstPart};
            if(choicesValue.length > 1){
                parameters['action_plugin_id'] = choicesValue.shift();
                parameters['action_plugin_method'] = choicesValue.shift();
            }
            if(this.props.attributes['name'].indexOf("/") !== -1){
                parameters['button_key'] = PathUtils.getDirname(this.props.attributes['name']);
            }
            this.props.applyButtonAction(parameters, callback);
        }
    }

};