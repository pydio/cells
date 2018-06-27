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

export default React.createClass({

    mixins:[ActionRunnerMixin],

    getInitialState:function(){
        let loadingMessage = 'Loading';
        if(this.context && this.context.getMessage){
            loadingMessage = this.context.getMessage(466, '');
        }else if(global.pydio && global.pydio.MessageHash){
            loadingMessage = global.pydio.MessageHash[466];
        }
        return {status:loadingMessage};
    },

    componentDidMount:function(){
        const callback = function(transport){
            this.setState({status:transport.responseText});
        }.bind(this);
        this._poller = function(){
            this.applyAction(callback);
        }.bind(this);
        this._poller();
        this._pe = global.setInterval(this._poller, 10000);
    },

    componentWillUnmount:function(){
        if(this._pe){
            global.clearInterval(this._pe);
        }
    },

    render: function(){
        return (<div>{this.state.status}</div>);
    }

});