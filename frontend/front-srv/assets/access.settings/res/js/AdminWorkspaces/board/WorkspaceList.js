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
import Pydio from 'pydio'
import LangUtils from 'pydio/util/lang'
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

    reload:function(){
        this.props.currentNode.reload();
    },

    componentDidMount: function(){
        this.props.currentNode.observe('loaded', () => {this.forceUpdate()});
        this.reload();
    },

    componentWillUnmount: function(){
        this.props.currentNode.stopObserving('loaded', () => {this.forceUpdate()});
    },

    openTableRows(rows) {
        if(rows.length){
            this.props.openSelection(rows[0].node);
        }
    },


    computeTableData: function(currentNode){
        let data = [];
        currentNode.getChildren().forEach((child) => {
            if (child.getMetadata().get('accessType') !== 'gateway'){
                return;
            }
            let summary = "";
            const paths = JSON.parse(child.getMetadata().get('rootNodes'));
            if(paths){
                summary = paths.join(", ");
            }
            data.push({
                node: child,
                label: child.getLabel(),
                description : child.getMetadata().get("description"),
                slug : child.getMetadata().get("slug"),
                summary: summary
            });
        });
        data.sort((a,b) => {
            return a.label > b.label ? 1 : ( a.label < b.label ? -1 : 0);
        });
        return data;
    },

    render:function(){

        const columns = [
            {name:'label', label: 'Label', style:{width:'20%', fontSize:15}, headerStyle:{width:'20%'}},
            {name:'description', label: 'Description', style:{width:'30%'}, headerStyle:{width:'30%'}},
            {name:'summary', label: 'Root Nodes', style:{width:'30%'}, headerStyle:{width:'30%'}},
            {name:'slug', label: 'Slug', style:{width:'20%'}, headerStyle:{width:'20%'}},
        ];

        const data = this.computeTableData(this.props.currentNode);

        return (
            <MaterialTable
                data={data}
                columns={columns}
                onSelectRows={this.openTableRows.bind(this)}
                deselectOnClickAway={true}
                showCheckboxes={false}
            />
        );

    }

});
