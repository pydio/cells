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
import Pydio from 'pydio'
import React from 'react'
import PropTypes from 'prop-types'
import createReactClass from 'create-react-class'
import HistoryApi from './HistoryApi'
import PathUtils from 'pydio/util/path'
import ReactMarkdown from 'react-markdown';
import {Toolbar, Paper, ToolbarGroup, FlatButton, IconButton, FontIcon} from 'material-ui'
const Node = require('pydio/model/node');
const PydioReactUi = Pydio.requireLib('boot');
const {UserAvatar, NodeListCustomProvider, SimpleList} = Pydio.requireLib('components');


const UserLinkWrapper = ({href, children}) => {
    if (href.startsWith('user://')) {
        const userId = href.replace('user://', '');
        return (
            <UserAvatar
                userId={userId}
                displayAvatar={false}
                richOnClick={false}
                style={{display:'inline-block', fontWeight: 500}}
                pydio={Pydio.getInstance()}
            />)
    }
    return <span>{children}</span>
};

const Paragraph = ({children}) => <span>{children}</span>;


class HistoryBrowser extends React.Component{

    constructor(props) {
        super(props);
        this.state = this.propsToState(props.node);
    }

    propsToState(node){
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
    }


    componentWillReceiveProps(nextProps){
        if(nextProps.node !== this.props.node){
            this.setState(this.propsToState(nextProps.node));
        }
    }

    nodeClicked(node){
        this.state.api.getDataModel().setSelectedNodes([node]);
    }

    applyAction(action){
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
    }

    render(){

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
            versionDescription: {label: mess['meta.versions.11'], sortType: 'string', width: '55%', renderCell: data => {
                return (
                    <ReactMarkdown source={data.getMetadata().get('versionDescription')} renderers={{'link': UserLinkWrapper, 'paragraph':Paragraph}}/>
                );
            }},
        };

        const css = `
        .version-history .material-list-line-1 {
            line-height: 13px !important;
        }
        `;
        let disabled = !this.state.selectedNode;
        return (
            <div style={{display:'flex', flexDirection:'column', color:'rgba(0,0,0,.67)'}} className={"version-history"}>
                <Paper zDepth={1} rounded={false} style={{width:'100%', height:56, position:'absolute', zIndex: 1, backgroundColor:'rgb(19, 78, 108)', color:'white'}}>
                    <div style={{padding:18, fontSize: 18}}>{mess['meta.versions.16'].replace('%s', this.props.node.getLabel())}</div>
                </Paper>
                <NodeListCustomProvider
                    style={{flex:1, marginTop: 56}}
                    presetDataModel={this.state.api.getDataModel()}
                    actionBarGroups={[]}
                    elementHeight={SimpleList.HEIGHT_ONE_LINE}
                    tableKeys={tableKeys}
                    entryHandleClicks={this.nodeClicked.bind(this)}
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
                <div style={{position:'absolute', bottom: 8, left: 8}}>
                    <FlatButton icon={<FontIcon className={"mdi mdi-download"}/>} secondary={true} disabled={disabled} label={mess['meta.versions.3']} tooltip={mess['meta.versions.4']} onClick={() => this.applyAction('dl')}/>
                    <FlatButton icon={<FontIcon className={"mdi mdi-backup-restore"}/>} secondary={true} disabled={disabled} label={mess['meta.versions.7']} tooltip={mess['meta.versions.8']} onClick={() => this.applyAction('revert')}/>
                </div>
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:css}}/>
            </div>
        );

    }

}

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

const HistoryDialog = createReactClass({

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