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
import Workspace from '../model/Ws'
import Pydio from 'pydio'
const PydioComponents = Pydio.requireLib('components');
const {MaterialTable} = PydioComponents;

export default React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:      React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:       React.PropTypes.instanceOf(Node).isRequired,
        currentNode:    React.PropTypes.instanceOf(Node).isRequired,
        openSelection:  React.PropTypes.func,
        advanced:         React.PropTypes.boolean
    },

    getInitialState(){
        return {workspaces: [], loading: false};
    },

    startLoad(){
        if(this.props.onLoadState){
            this.props.onLoadState(true)
        }
        this.setState({loading: true});
    },

    endLoad(){
        if(this.props.onLoadState){
            this.props.onLoadState(false)
        }
        this.setState({loading: false});
    },

    reload(){
        this.startLoad();
        Workspace.listWorkspaces().then(response => {
            this.endLoad();
            this.setState({workspaces: response.Workspaces || []});
        }).catch(e => {
            this.endLoad();
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
        const {filterString} = this.props;
        const {workspaces} = this.state;
        workspaces.map((workspace) => {
            let summary = ""; // compute root nodes list
            if(workspace.RootNodes){
                summary = Object.keys(workspace.RootNodes).map(k => {
                    return LangUtils.trimRight(workspace.RootNodes[k].Path, '/');
                }).join(', ');
            }
            let syncable = false;
            if(workspace.Attributes){
                try {
                    const atts = JSON.parse(workspace.Attributes);
                    if (atts['ALLOW_SYNC'] === true || atts['ALLOW_SYNC'] === "true") {
                        syncable = true;
                    }
                }catch(e){}
            }
            if(filterString){
                const search = filterString.toLowerCase();
                const l = workspace.Label && workspace.Label.toLowerCase().indexOf(search) >= 0;
                const d = workspace.Description && workspace.Description.toLowerCase().indexOf(search) >= 0;
                const ss = summary && summary.toLowerCase().indexOf(search) >= 0;
                if(!(l || d || ss)){
                    return;
                }
            }
            data.push({
                payload: workspace,
                label: workspace.Label,
                description : workspace.Description,
                slug : workspace.Slug,
                summary: summary,
                syncable: syncable,
            });
        });
        data.sort(LangUtils.arraySorter('label', false, true));
        return data;
    },

    render(){

        const {pydio, advanced, editable, tableStyles} = this.props;
        const m = (id) => pydio.MessageHash['ajxp_admin.' + id];
        const s = (id) => pydio.MessageHash['settings.' + id];

        const columns = [
            {name:'label', label: s('8'), style:{width:'20%', fontSize:15}, headerStyle:{width:'20%'}},
            {name:'description', label: s('103'), hideSmall:true, style:{width:'25%'}, headerStyle:{width:'25%'}},
            {name:'summary', label: m('ws.board.summary'), hideSmall:true, style:{width:'25%'}, headerStyle:{width:'25%'}},
            ];
        if (advanced){
            columns.push({
                name:'syncable', label: m('ws.board.syncable'), style:{width:'10%', textAlign:'center'}, headerStyle:{width:'10%', textAlign:'center'}, renderCell:(row)=>{
                    return <span className={"mdi mdi-check"} style={{fontSize:18, opacity:row.syncable?1:0}}/>
                }});
        }

        columns.push({name:'slug', label: m('ws.5'), style:{width:'20%'}, headerStyle:{width:'20%'}});

        const {loading} = this.state;
        const data = this.computeTableData();

        return (
            <MaterialTable
                data={data}
                columns={columns}
                onSelectRows={editable?this.openTableRows.bind(this):null}
                deselectOnClickAway={true}
                showCheckboxes={false}
                emptyStateString={loading ? m('home.6') : m('ws.board.empty')}
                masterStyles={tableStyles}
                paginate={[10, 25, 50, 100]}
                defaultPageSize={25}
            />
        );

    }

});
