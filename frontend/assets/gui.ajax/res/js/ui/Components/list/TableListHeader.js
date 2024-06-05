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
import {FontIcon} from 'material-ui'
import SortColumns from './SortColumns'
import ListPaginator from './ListPaginator'

/**
 * Specific header for Table layout, reading metadata from node and using keys
 */
export default class TableListHeader extends React.Component{

    // propTypes:{
    //     tableKeys:React.PropTypes.object.isRequired,
    //     loading:React.PropTypes.bool,
    //     reload:React.PropTypes.func,
    //     dm:React.PropTypes.instanceOf(PydioDataModel),
    //     node:React.PropTypes.instanceOf(AjxpNode),
    //     onHeaderClick:React.PropTypes.func,
    //     sortingInfo:React.PropTypes.object
    // },

    render(){
        let paginator;
        if(this.props.node.getMetadata().get("paginationData") && this.props.node.getMetadata().get("paginationData").get('total') > 1){
            paginator = <ListPaginator dataModel={this.props.dm} node={this.props.node}/>;
        }
        return (
            <div className="mui-toolbar toolbarTableHeader">
                <SortColumns displayMode="tableHeader" {...this.props} columnClicked={this.props.onHeaderClick}/>
                <div className={"mui-toolbar-group mui-right"}>
                    {paginator}
                    <FontIcon
                        key={1}
                        title={Pydio.getMessages['149']}
                        className={"mdi mdi-refresh" + (this.props.loading?" rotating":"")}
                        onClick={this.props.reload}
                        style={{padding: 16, display: 'block', cursor:'pointer', fontSize: 24, color: '#9E9E9E'}}
                    />
                    {this.props.additionalActions}
                </div>
            </div>
        );

    }
};

