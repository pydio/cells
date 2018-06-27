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


import MessagesConsumerMixin from '../util/MessagesConsumerMixin'
import SortColumns from './SortColumns'
import ListPaginator from './ListPaginator'

/**
 * Specific header for Table layout, reading metadata from node and using keys
 */
export default React.createClass({

    mixins:[MessagesConsumerMixin],

    propTypes:{
        tableKeys:React.PropTypes.object.isRequired,
        loading:React.PropTypes.bool,
        reload:React.PropTypes.func,
        dm:React.PropTypes.instanceOf(PydioDataModel),
        node:React.PropTypes.instanceOf(AjxpNode),
        onHeaderClick:React.PropTypes.func,
        sortingInfo:React.PropTypes.object
    },

    render: function(){
        let headers, paginator;
        if(this.props.node.getMetadata().get("paginationData") && this.props.node.getMetadata().get("paginationData").get('total') > 1){
            paginator = <ListPaginator dataModel={this.props.dm} node={this.props.node}/>;
        }
        return (
            <ReactMUI.Toolbar className="toolbarTableHeader">
                <SortColumns displayMode="tableHeader" {...this.props} columnClicked={this.props.onHeaderClick}/>
                <ReactMUI.ToolbarGroup float="right">
                    {paginator}
                    <ReactMUI.FontIcon
                        key={1}
                        tooltip={this.context.getMessage('149', '')}
                        className={"icon-refresh" + (this.props.loading?" rotating":"")}
                        onClick={this.props.reload}
                    />
                    {this.props.additionalActions}
                </ReactMUI.ToolbarGroup>
            </ReactMUI.Toolbar>
        );

    }
});

