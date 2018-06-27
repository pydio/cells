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

export default {

    attach: function(node){
        this._nodeListener = function(){
            if(!this.isMounted()) {
                this.detach(node);
                return;
            }
            this.forceUpdate();
        }.bind(this);
        this._actionListener = function(eventMemo){
            if(!this.isMounted()) {
                this.detach(node);
                return;
            }
            if(eventMemo && eventMemo.type === 'prompt-rename' && eventMemo.callback){
                this.setState({inlineEdition:true, inlineEditionCallback:eventMemo.callback});
            }
            return true;
        }.bind(this);
        node.observe("node_replaced", this._nodeListener);
        node.observe("node_action", this._actionListener);
    },

    detach: function(node){
        if(this._nodeListener){
            node.stopObserving("node_replaced", this._nodeListener);
            node.stopObserving("node_action", this._actionListener);
        }
    },

    componentDidMount: function(){
        this.attach(this.props.node);
    },

    componentWillUnmount: function(){
        this.detach(this.props.node);
    },

};

