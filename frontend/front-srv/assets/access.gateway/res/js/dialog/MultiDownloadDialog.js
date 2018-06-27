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

let MultiDownloadDialog = React.createClass({

    propTypes:{
        actionName:React.PropTypes.string,
        selection: React.PropTypes.instanceOf(PydioDataModel),
        buildChunks: React.PropTypes.bool
    },

    mixins:[
        PydioReactUI.ActionDialogMixin,
        PydioReactUI.CancelButtonProviderMixin,
    ],

    getDefaultProps: function(){
        return {
            dialogTitleId: 88,
            dialogIsModal: true
        };
    },
    getInitialState: function(){
        if(!this.props.buildChunks){
            let nodes = new Map();
            this.props.selection.getSelectedNodes().map(function(node){
                nodes.set(node.getPath(), node.getLabel());
            });
            return {nodes: nodes};
        }else{
            return {uniqueChunkNode: this.props.selection.getUniqueNode()};
        }
    },
    removeNode: function(nodePath, event){
        let nodes = this.state.nodes;
        nodes.delete(nodePath);
        if(!nodes.size){
            this.dismiss();
        }else{
            this.setState({nodes: nodes});
        }
    },
    performChunking: function(){
        PydioApi.getClient().request({
            get_action:this.props.chunkAction,
            chunk_count:this.refs.chunkCount.getValue(),
            file:this.state.uniqueChunkNode.getPath()
        }, function(transport){
            this.setState({chunkData: transport.responseJSON});
        }.bind(this));
    },
    render: function(){
        let rows = [];
        let chunkAction;
        if(!this.props.buildChunks){
            const baseUrl = this.props.pydio.Parameters.get('ajxpServerAccess')+'&get_action='+this.props.actionName+'&file=';
            this.state.nodes.forEach(function(nodeLabel, nodePath){
                rows.push(
                    <div>
                        <a key={nodePath} href={baseUrl + nodePath} onClick={this.removeNode.bind(this, nodePath)}>{nodeLabel}</a>
                    </div>
                );
            }.bind(this));
        } else if(!this.state.chunkData){
            chunkAction = (
                <div>
                    <MaterialUI.TextField type="number" min="2" step="1" defaultValue="2" floatingLabelText="Chunk Count" ref="chunkCount"/>
                    <MaterialUI.RaisedButton label="Chunk" onClick={this.performChunking}/>
                </div>
            );
        } else{
            const chunkData = this.state.chunkData;
            const baseUrl = this.props.pydio.Parameters.get('ajxpServerAccess')+'&get_action='+this.props.actionName+'&file_id=' + chunkData.file_id;
            for(var i=0; i<chunkData.chunk_count;i++){
                rows.push(<div><a href={baseUrl + "&chunk_index=" + i}>{chunkData.localname + " (part " + (i + 1) + ")"}</a></div>);
            }
        }
        return (
            <div>
                {chunkAction}
                <div>{rows}</div>
            </div>
        );
    }

});

export {MultiDownloadDialog as default}