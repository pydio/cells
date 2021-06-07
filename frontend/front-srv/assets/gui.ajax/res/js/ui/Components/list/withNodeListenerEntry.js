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

export default (ListEntryComponent) => {

    class NodeListenerComponent extends React.Component{

        attach(node){
            this._nodeListener = () => {
                this.forceUpdate();
            };
            this._actionListener = (eventMemo) => {
                if(eventMemo && eventMemo.type === 'prompt-rename' && eventMemo.callback){
                    this.setState({inlineEdition:true, inlineEditionCallback:eventMemo.callback});
                }
                return true;
            };
            node.observe("node_replaced", this._nodeListener);
            node.observe("node_action", this._actionListener);
        }

        detach(node){
            if(this._nodeListener){
                node.stopObserving("node_replaced", this._nodeListener);
                node.stopObserving("node_action", this._actionListener);
            }
        }

        componentDidMount(){
            this.attach(this.props.node);
        }

        componentWillUnmount(){
            this.detach(this.props.node);
        }

        render() {
            return <ListEntryComponent {...this.props} {...this.state} inlineEditionDismiss={()=>this.setState({inlineEdition: false})}/>
        }

    }

    return NodeListenerComponent;

};

