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
import HistoryApi from './HistoryApi'
import PathUtils from 'pydio/util/path'
import {Toolbar, ToolbarGroup, Divider, FontIcon, IconButton, Paper} from 'material-ui'
const PydioComponents = require('pydio').requireLib('components');
const Node = require('pydio/model/node');
const PydioReactUi = require('pydio').requireLib('boot');


let HistoryBrowser = React.createClass({

    propTypes: {
        node: React.PropTypes.instanceOf(Node).isRequired,
        onRequestClose: React.PropTypes.func
    },

    propsToState: function(node){
        if(this.state && this.state.api) {
            this.state.api.stopObserving('selection_changed');
        }
        const api = new HistoryApi(node);
        this._selectionObserver = function(){
            if(api.getDataModel().isEmpty()) {
                this.setState({selectedNode:null})
            } else {
                this.setState({selectedNode:api.getDataModel().getUniqueNode()});
            }
        }.bind(this);
        api.getDataModel().observe('selection_changed', this._selectionObserver);
        return {api: api};
    },

    getInitialState: function(){
        return this.propsToState(this.props.node);
    },

    componentWillReceiveProps: function(nextProps){
        if(nextProps.node !== this.props.node){
            this.setState(this.propsToState(nextProps.node));
        }
    },

    nodeClicked: function(node){
        this.state.api.getDataModel().setSelectedNodes([node]);
    },

    applyAction: function(action){
        const {api, selectedNode} = this.state;
        switch(action){
            case 'dl':
                api.openVersion(selectedNode);
                break;
            case 'revert':
                api.revertToVersion(selectedNode, function(){
                    if(this.props.onRequestClose) {
                        this.props.onRequestClose();
                    }
                }.bind(this));
                break;
            default:
                break;
        }
    },

    render: function(){

        const mess = window.pydio.MessageHash;
        const tableKeys = {
            index: {label: mess['meta.versions.9'], sortType: 'string', width: '10%', renderCell:data=>{
                    return "#" + data.getMetadata().get('versionId').substr(0, 6);
            }},
            Size:{label: mess['2'], sortType: 'number', width: '10%', renderCell:data=>{
                    const s = parseInt(data.getMetadata().get('bytesize'));
                    return PathUtils.roundFileSize(s);
            }},
            ajxp_modiftime: {label: mess['meta.versions.10'], sortType: 'string', width: '25%'},
            versionDescription: {label: mess['meta.versions.11'], sortType: 'string', width: '55%'},
        };

        let disabled = !this.state.selectedNode;
        return (
            <div style={{display:'flex', flexDirection:'column'}}>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <div style={{paddingLeft:20, color: 'white', fontSize: 18}}>{mess['meta.versions.16'].replace('%s', this.props.node.getLabel())}</div>
                    </ToolbarGroup>
                    <ToolbarGroup lastChild={true} style={{paddingRight: 7}}>
                        <IconButton iconClassName={"mdi mdi-download"} tooltipPosition={"bottom-left"} iconStyle={disabled?{}:{color:'white'}} disabled={disabled} label={mess['meta.versions.3']} tooltip={mess['meta.versions.4']} onTouchTap={this.applyAction.bind(this, 'dl')}/>
                        <IconButton iconClassName={"mdi mdi-backup-restore"} tooltipPosition={"bottom-left"} iconStyle={disabled?{}:{color:'white'}} disabled={disabled} label={mess['meta.versions.7']} tooltip={mess['meta.versions.8']} onTouchTap={this.applyAction.bind(this, 'revert')}/>
                    </ToolbarGroup>
                </Toolbar>
                <PydioComponents.NodeListCustomProvider
                    style={{flex:1}}
                    presetDataModel={this.state.api.getDataModel()}
                    actionBarGroups={[]}
                    elementHeight={PydioComponents.SimpleList.HEIGHT_ONE_LINE}
                    tableKeys={tableKeys}
                    entryHandleClicks={this.nodeClicked}
                    emptyStateProps={{
                        iconClassName: "mdi mdi-backup-restore",
                        primaryTextId: "meta.versions.14",
                        style: {
                            backgroundColor: 'transparent',
                            padding: 40
                        },
                        secondaryTextId: "meta.versions.15",
                    }}

                />
                <Divider/>
            </div>
        );

    }

});

if(window.ReactDND){
    const FakeDndBackend = function(){
        return{
            setup:function(){},
            teardown:function(){},
            connectDragSource:function(){},
            connectDragPreview:function(){},
            connectDropTarget:function(){}
        };
    };
    HistoryBrowser = window.ReactDND.DragDropContext(FakeDndBackend)(HistoryBrowser);
}

const HistoryDialog = React.createClass({

    mixins:[
        PydioReactUi.ActionDialogMixin,
        PydioReactUi.SubmitButtonProviderMixin
    ],

    getDefaultProps: function(){
        return {
            dialogTitle: '',
            dialogIsModal: false,
            dialogSize:'lg',
            dialogPadding: false
        };
    },
    submit(){
        this.dismiss();
    },
    render: function(){
        return (
            <div style={{width: '100%'}} className="layout-fill vertical-layout">
                <HistoryBrowser node={this.props.node} onRequestClose={this.dismiss}/>
            </div>
        );
    }

});


export {HistoryDialog as default}