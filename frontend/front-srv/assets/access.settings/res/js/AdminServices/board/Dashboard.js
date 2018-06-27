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
import ServicesList from './ServicesList'
import {Toggle, DropDownMenu, MenuItem, IconButton, Paper} from 'material-ui'

export default React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:React.PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode:React.PropTypes.instanceOf(AjxpNode).isRequired,
        openEditor:React.PropTypes.func.isRequired,
        openRightPane:React.PropTypes.func.isRequired,
        closeRightPane:React.PropTypes.func.isRequired
    },

    getInitialState:function(){
        return {details: true, filter:''}
    },

    onDetailsChange: function(event, value){
        this.setState({details: value});
    },

    onFilterChange: function(event, index, value){
        this.setState({filter: value});
    },

    reloadList:function(){
        this.refs.servicesList.reload();
    },

    render:function(){
        const buttonContainer = (
            <div style={{display: 'flex', alignItems: 'baseline', padding: '0 20px', width: '100%'}}>
                <Toggle label={"Show Details"} toggled={this.state.details} onToggle={this.onDetailsChange} labelPosition={"right"} style={{width: 150}}/>
                <DropDownMenu underlineStyle={{display:'none'}} value={this.state.filter} onChange={this.onFilterChange}>
                    <MenuItem value={''} primaryText="No filter" />
                    <MenuItem value={'STARTED'} primaryText="Running Only" />
                    <MenuItem value={'STOPPED'} primaryText="Stopped Only" />
                </DropDownMenu>
            </div>
        );
        return (
            <div className="main-layout-nav-to-stack workspaces-board">
                <div className="vertical-layout" style={{width:'100%'}}>
                    <AdminComponents.Header
                        title={this.context.getMessage('172', 'settings')}
                        icon="mdi mdi-access-point-network"
                        legend={this.context.getMessage('173', 'settings')}
                        actions={buttonContainer}
                        reloadAction={this.reloadList.bind(this)}
                    />
                    <ServicesList
                        ref="servicesList"
                        className="layout-fill"
                        style={{paddingBottom: 16}}
                        dataModel={this.props.dataModel}
                        rootNode={this.props.rootNode}
                        currentNode={this.props.rootNode}
                        filter={this.state.filter}
                        details={this.state.details}
                    />
                </div>
            </div>
        );
    }

});