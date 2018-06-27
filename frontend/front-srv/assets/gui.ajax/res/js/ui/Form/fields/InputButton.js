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

import ActionRunnerMixin from '../mixins/ActionRunnerMixin'
const React = require('react')
const {RaisedButton} = require('material-ui')

/**
 * Simple RaisedButton executing the applyButtonAction
 */
export default React.createClass({

    mixins:[ActionRunnerMixin],

    applyButton:function(){

        let callback = this.props.actionCallback;
        if(!callback){
            callback = function(transport){
                const text = transport.responseText;
                if(text.startsWith('SUCCESS:')){
                    global.pydio.displayMessage('SUCCESS', transport.responseText.replace('SUCCESS:', ''));
                }else{
                    global.pydio.displayMessage('ERROR', transport.responseText.replace('ERROR:', ''));
                }
            };
        }
        this.applyAction(callback);

    },

    render:function(){
        return (
            <RaisedButton
                label={this.props.attributes['label']}
                onTouchTap={this.applyButton}
                disabled={this.props.disabled}
            />
        );
    }
});
