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
import PydioDataModel from 'pydio/model/data-model'
import Node from 'pydio/model/node'
import LangUtils from 'pydio/util/lang'
import Pydio from 'pydio'
import Workspace from '../model/Ws'
const PydioComponents = Pydio.requireLib('components');
const {MaterialTable} = PydioComponents;

export default React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:      React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:       React.PropTypes.instanceOf(Node).isRequired,
        currentNode:    React.PropTypes.instanceOf(Node).isRequired,
        openSelection:  React.PropTypes.func,
        filter:         React.PropTypes.string
    },

    getInitialState(){
        return {workspaces: [], loading: false};
    },

    reload(){
        this.setState({loading: true});
        Workspace.listWorkpsaces().then(response => {
            this.setState({loading: false, workspaces: response.Workspaces || []});
        }).catch(e => {
            this.setState({loading: false});
        });
    },

    componentDidMount(){
        this.reload();
    },

    openTableRows(rows) {
        if(rows.length){
            this.props.openSelection(rows[0].payload);
        }
    },

    computeTableData(){
        let data = [];
        const {workspaces} = this.state;
        workspaces.map((workspace) => {
            let summary = ""; // compute root nodes list ?
            if(workspace.RootNodes){
                summary = Object.keys(workspace.RootNodes).map(k => {
                    return LangUtils.trimRight(workspace.RootNodes[k].Path, '/');
                }).join(', ');
            }
            data.push({
                payload: workspace,
                label: workspace.Label,
                description : workspace.Description,
                slug : workspace.Slug,
                summary: summary
            });
        });
        data.sort((a,b) => {
            return a.label > b.label ? 1 : ( a.label < b.label ? -1 : 0);
        });
        return data;
    },

    render(){

        const {pydio} = this.props;
        const m = (id) => pydio.MessageHash['ajxp_admin.' + id];
        const s = (id) => pydio.MessageHash['settings.' + id];

        const columns = [
            {name:'label', label: s('8'), style:{width:'20%', fontSize:15}, headerStyle:{width:'20%'}},
            {name:'description', label: s('103'), style:{width:'30%'}, headerStyle:{width:'30%'}},
            {name:'summary', label: m('ws.board.summary'), style:{width:'30%'}, headerStyle:{width:'30%'}},
            {name:'slug', label: m('ws.5'), style:{width:'20%'}, headerStyle:{width:'20%'}},
        ];
        const {loading} = this.state;
        const data = this.computeTableData();

        return (
            <MaterialTable
                data={data}
                columns={columns}
                onSelectRows={this.openTableRows.bind(this)}
                deselectOnClickAway={true}
                showCheckboxes={false}
                emptyStateString={loading ? m('home.6') : m('ws.board.empty')}
            />
        );

    }

});
