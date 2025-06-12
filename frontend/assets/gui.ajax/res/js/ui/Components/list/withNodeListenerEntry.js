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
import React, {Fragment} from 'react'
import InlineEditor from "./InlineEditor";

const withNodeListenerEntry = (ListEntryComponent, nodeGetter=undefined) => {

    class NodeListenerComponent extends React.Component{

        constructor(props) {
            super(props);
            this.setInlineEditionAnchor = this.setInlineEditionAnchor.bind(this)
        }

        setInlineEditionAnchor(anchor, editorStyle) {
            // guard against no-op if you like:
            if (
                this.state.anchor !== anchor ||
                this.state.editorStyle !== editorStyle
            ) {
                this.setState({ anchor, editorStyle });
            }
        }


        state={
            edit: false
        }

        attach(node){
            this._nodeListener = () => {
                this.forceUpdate();
            };
            this._actionListener = (eventMemo) => {
                if(eventMemo && eventMemo.type === 'prompt-rename' && eventMemo.callback){
                    this.setState({
                        edit:true,
                        callback:eventMemo.callback
                    });
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

        getNode() {
            if(nodeGetter) {
                return nodeGetter(this.props)
            } else {
                const {node} = this.props;
                return node;
            }
        }

        componentDidMount(){
            this.attach(this.getNode());
        }

        componentWillUnmount(){
            this.detach(this.getNode());
        }

        render() {
            const node = this.getNode();
            const {edit, editorStyle, callback, anchor} = this.state;
            return (
                <Fragment>
                    <ListEntryComponent
                        {...this.props}
                        setInlineEditionAnchor={this.setInlineEditionAnchor}
                    />
                    {edit && anchor &&
                        <InlineEditor
                            node={node}
                            anchor={anchor}
                            onClose={()=>this.setState({edit: false})}
                            callback={callback}
                            editorStyle={editorStyle}
                        />
                    }
                </Fragment>
            )
        }

    }

    return NodeListenerComponent;

};

export {withNodeListenerEntry}