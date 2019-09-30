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
import Pydio from 'pydio'
import VirtualNode from '../model/VirtualNode'
import DataSource from '../model/DataSource'
import NodeCard from '../virtual/NodeCard'
import {Paper, Divider, IconButton, FlatButton, RaisedButton, Popover} from 'material-ui'
const {ModernTextField} = Pydio.requireLib('hoc');

class VirtualNodes extends React.Component{

    constructor(props){
        super(props);
        this.state = {nodesLoaded:false, nodes: [], dataSourcesLoaded:false, dataSources:[]};
        VirtualNode.loadNodes((result) => {
            this.setState({nodes: result, nodesLoaded: true});
        });
        DataSource.loadDatasources().then((result) => {
            this.setState({dataSources: result.DataSources, dataSourcesLoaded: true});
        })
    }

    reload(){
        this.setState({nodesLoaded: false});
        VirtualNode.loadNodes((result) => {
            this.setState({nodes: result, nodesLoaded: true});
        });
    }

    createNode(){
        this.handleRequestClose();
        const newNode = new VirtualNode();
        newNode.setName(this.state.newName);
        const {nodes} = this.state;
        this.setState({nodes:[...nodes, newNode]});
    }

    handleTouchTap(event){
        // This prevents ghost click.
        event.preventDefault();
        this.setState({
            newName:'',
            open: true,
            anchorEl: event.currentTarget,
        }, ()=>{
            setTimeout(()=>{
                if(this.refs['newNode']) this.refs['newNode'].focus();
            }, 300)
        });
    };

    handleRequestClose(){
        this.setState({
            open: false,
        });
    };

    render(){
        const {readonly, pydio} = this.props;
        const {nodes, dataSources, nodesLoaded, dataSourcesLoaded} = this.state;
        const m  = (id) => pydio.MessageHash['ajxp_admin.virtual.' + id] || id;
        let vNodes = [];
        nodes.map((node) => {
            vNodes.push(<NodeCard dataSources={dataSources} node={node} reloadList={this.reload.bind(this)} readonly={readonly}/>);
        });

        let headerActions = [];
        if(!readonly){
            headerActions.push(<FlatButton primary={true} label={m('create')} onTouchTap={this.handleTouchTap.bind(this)}/>);
        }

        return (
            <div className="vertical-layout workspaces-list layout-fill" style={{height:'100%'}}>
                <AdminComponents.Header
                    title={m('title')}
                    icon={"mdi mdi-help-network"}
                    actions={headerActions}
                    reloadAction={this.reload.bind(this)}
                    loading={!(nodesLoaded && dataSourcesLoaded)}
                />
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose.bind(this)}
                >
                    <div style={{margin:'0 10px'}}>
                        <ModernTextField ref="newNode" floatingLabelText={m('label')} value={this.state.newName} onChange={(e,v)=>{this.setState({newName:v})}} hintText={"Provide a label for this node"}/>
                    </div>
                    <Divider/>
                    <div style={{textAlign:'right', padding:'4px 10px'}}>
                        <FlatButton label={pydio.MessageHash['54']}  onClick={this.handleRequestClose.bind(this)}/>
                        <RaisedButton primary={true}  label={m('create.button')} onClick={this.createNode.bind(this)}/>
                    </div>
                </Popover>
                <div className={"layout-fill"} style={{overflowY: 'auto'}}>
                    <div style={{padding: 20, paddingBottom: 0}}>
                        {m('legend.1')}
                        <br/>
                        {!readonly &&
                            <span>{m('legend.2')}</span>
                        }

                    </div>
                    {nodesLoaded && dataSourcesLoaded &&
                        vNodes
                    }
                    {(!nodesLoaded || !dataSourcesLoaded) &&
                        <div style={{margin:16, textAlign:'center', padding: 20}}>{pydio.MessageHash['ajxp_admin.home.6']}</div>
                    }
                </div>
            </div>
        );
    }

}


export {VirtualNodes as default}