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
import PropTypes from 'prop-types';

import Pydio from 'pydio';
import PydioDataModel from 'pydio/model/data-model'
import AjxpNode from 'pydio/model/node'
import React from 'react'
import createReactClass from 'create-react-class';
import ServicesList from './ServicesList'
import {MenuItem} from 'material-ui'
const {ModernSelectField, ModernTextField} = Pydio.requireLib('hoc');

export default createReactClass({
    displayName: 'Dashboard',
    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode:PropTypes.instanceOf(AjxpNode).isRequired,
        openEditor:PropTypes.func.isRequired,
        openRightPane:PropTypes.func.isRequired,
        closeRightPane:PropTypes.func.isRequired,
        pydio:PropTypes.instanceOf(Pydio)
    },

    getInitialState(){
        return {
            filter:'',
            peers:[],
            peerFilter:''
        }
    },

    onDetailsChange(event, value){
        this.setState({details: value});
        localStorage.setItem('console.services.details', value?'true':'false')
    },

    onFilterChange(event, index, value){
        this.setState({filter: value});
    },

    onPeerFilterChange(event, index, value){
        this.setState({peerFilter: value});
    },

    reloadList(){
        this.refs.servicesList.reload();
    },

    onUpdatePeers(peers){
        this.setState({peers})
    },

    render(){
        const {pydio} = this.props;
        const {peers, peerFilter, filter, inputFilter = ''} = this.state;
        const m = id => pydio.MessageHash['ajxp_admin.services.' + id] || id;

        const buttonContainer = (
            <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                <div style={{width:150, marginRight: 8}} className={"media-small-hide"}>
                    <ModernTextField fullWidth={true} value={inputFilter} onChange={(e,v)=> this.setState({inputFilter: v})} hintText={m('text-filter.hint')}/>
                </div>
                {peers.length > 0 &&
                    <div style={{width: 150, height:14, marginRight: 8}}>
                        <ModernSelectField fullWidth={true} className={"media-small-hide"} style={{marginTop: -10}} underlineStyle={{display:'none'}} value={peerFilter} onChange={this.onPeerFilterChange}>
                            <MenuItem value={''} primaryText={m('peerfilter.title')} />
                            {peers.map(peer => <MenuItem value={peer} primaryText={peer} />)}
                        </ModernSelectField>
                    </div>
                }
                <div style={{width: 150, height:14}}>
                    <ModernSelectField fullWidth={true} className={"media-small-hide"} style={{marginTop: -10}} underlineStyle={{display:'none'}} value={filter} onChange={this.onFilterChange}>
                        <MenuItem value={''} primaryText={m('filter.nofilter')} />
                        <MenuItem value={'STARTED'} primaryText={m('filter.started')} />
                        <MenuItem value={'STOPPED'} primaryText={m('filter.stopped')} />
                    </ModernSelectField>
                </div>
            </div>
        );
        const {toolsAbsolute} = this.props;

        return (
            <div className="main-layout-nav-to-stack workspaces-board">
                <div className="vertical-layout" style={{width:'100%'}}>
                    <AdminComponents.Header
                        title={toolsAbsolute?'':this.context.getMessage('172', 'settings')}
                        icon={toolsAbsolute?'':"mdi mdi-access-point-network"}
                        legend={this.context.getMessage('173', 'settings')}
                        actions={[buttonContainer]}
                        reloadAction={this.reloadList.bind(this)}
                        style={toolsAbsolute?{position:'absolute', top:0, right: 0}:null}
                    />
                    <ServicesList
                        ref="servicesList"
                        pydio={pydio}
                        className="layout-fill"
                        style={{paddingBottom: 16}}
                        dataModel={this.props.dataModel}
                        rootNode={this.props.rootNode}
                        currentNode={this.props.rootNode}
                        filter={filter}
                        peerFilter={peerFilter}
                        inputFilter={inputFilter}
                        onUpdatePeers={this.onUpdatePeers.bind(this)}
                    />
                </div>
            </div>
        );
    },
});