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
import SimpleList from './SimpleList'

/**
 * Simple to use list component encapsulated with its own query mechanism
 * using a set of properties for the remote node provider.
 */
export default class NodeListCustomProvider extends React.Component{

    // propTypes:{
    //     nodeProviderProperties:React.PropTypes.object,
    //     presetDataModel:React.PropTypes.instanceOf(PydioDataModel),
    //     presetRootNode:React.PropTypes.instanceOf(AjxpNode)
    //     autoRefresh:React.PropTypes.number,
    //     actionBarGroups:React.PropTypes.array,
    //     heightAutoWithMax:React.PropTypes.number,
    //     elementHeight:React.PropTypes.number.isRequired,
    //     nodeClicked:React.PropTypes.func,
    //     reloadOnServerMessage:React.PropTypes.string,
    //     entryRenderAsCard:React.PropTypes.func
    // },

    reload(){
        if(this.refs.list && this.isMounted()){
            this.refs.list.reload();
        }
    }

    componentWillUnmount(){
        if(this._smObs){
            this.props.pydio.stopObserving("server_message", this._smObs);
            this.props.pydio.stopObserving("server_message:" + this.props.reloadOnServerMessage, this.reload);
        }
        if(this._selObserver){
            const {dataModel} = this.state;
            dataModel.stopObserving("selection_changed", this._selObserver);
        }
    }

    componentWillReceiveProps(nextProps){
        if(this.props.nodeProviderProperties && this.props.nodeProviderProperties !== nextProps.nodeProviderProperties){
            let {dataModel, node} = this.state;
            const provider = new RemoteNodeProvider(nextProps.nodeProviderProperties);
            dataModel.setAjxpNodeProvider(provider);
            node.updateProvider(provider);
            this.setState({dataModel: dataModel, node: node});
        }else if(this.props.presetDataModel !== nextProps.presetDataModel){
            this.setState({
                dataModel: nextProps.presetDataModel,
                node: nextProps.presetRootNode || nextProps.presetDataModel.getRootNode()
            });
        }
    }

    constructor(props){
        super(props);
        let dataModel;
        if(this.props.presetDataModel){
            dataModel = this.props.presetDataModel;
        }else{
            dataModel = PydioDataModel.RemoteDataModelFactory(this.props.nodeProviderProperties);
        }
        const rootNode = this.props.presetRootNode || dataModel.getRootNode();
        if(this.props.nodeClicked){
            // leaf
            this.openEditor = function(node){
                this.props.nodeClicked(node);
                return false;
            }.bind(this);
            // dir
            this._selObserver = (event)=>{
                const selectedNodes = event.memo.getSelectedNodes();
                if(selectedNodes.length) {
                    this.props.nodeClicked(selectedNodes[0]);
                    event.memo.setSelectedNodes([]);
                }
            }
            dataModel.observe("selection_changed", this._selObserver);
        }
        if(this.props.reloadOnServerMessage && this.props.pydio){
            this._smObs = function(event){ if(XMLUtils.XPathSelectSingleNode(event, this.props.reloadOnServerMessage)) this.reload(); }.bind(this);
            this.props.pydio.observe("server_message", this._smObs);
            this.props.pydio.observe("server_message:" + this.props.reloadOnServerMessage, this.reload);
        }
        this.state = {node:rootNode, dataModel:dataModel};
    }

    render(){
        return (
            <div className={this.props.heightAutoWithMax?"":"layout-fill vertical-layout"} style={this.props.containerStyle}>
                <SimpleList
                    {...this.props}
                    openEditor={this.openEditor}
                    ref="list"
                    style={Object.assign({height:'100%'}, this.props.style || {})}
                    node={this.state.node}
                    dataModel={this.state.dataModel}
                    actionBarGroups={this.props.actionBarGroups}
                    skipParentNavigation={true}
                    observeNodeReload={true}
                    hideToolbar={true}
                />
            </div>
        );
    }

}