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
import {Table, TableHeader, TableRow, TableBody, TableRowColumn, TableHeaderColumn} from 'material-ui'
import Pydio from 'pydio'
const {moment} = Pydio.requireLib("boot");

/**
 * Simple material table
 * columns are objects of shape {name, label, style, headerStyle}
 */
class MaterialTable extends React.Component{

    onRowSelection(indexes){
        const {data, onSelectRows} = this.props;
        if(!onSelectRows){
            return
        }
        if(indexes === 'none'){
            onSelectRows([]);
        } else if(indexes === 'all'){
            onSelectRows(data);
        } else {
            let selection = [];
            indexes.map((i) => {
                selection.push(data[i]);
            });
            onSelectRows(selection);
        }
    }

    render(){

        const {columns, data, deselectOnClickAway, emptyStateString, emptyStateStyle, onSelectRows, computeRowStyle} = this.props;
        let {showCheckboxes} = this.props;

        let rows = data.map((model) => {
            let rowStyle;
            if(computeRowStyle){
                rowStyle = computeRowStyle(model);
            }
            if(model.Subheader){
                const headerStyle = {
                    fontSize:12, color: '#616161', backgroundColor:'#FAFAFA',fontWeight: 500,
                    ...model.style
                };
                return (
                    <TableRow className={"media-small-hide"}>
                        <TableRowColumn colSpan={columns.length} style={headerStyle}>
                            {model.Subheader}
                        </TableRowColumn>
                    </TableRow>
                );
            }
            if(model.colSpan){
                return (
                    <TableRow style={model.rowStyle}>
                        <TableRowColumn colSpan={columns.length} style={{height: 'auto', paddingLeft: 0, paddingRight: 0, backgroundColor:'transparent', ...model.cellStyle}}>{model.element}</TableRowColumn>
                    </TableRow>
                )
            }
            return (
                <TableRow selectable={onSelectRows !== undefined} style={rowStyle}>
                    {columns.map((column) => {
                        let value = model[column.name];
                        if (column.useMoment && value){
                            value = moment(new Date(parseInt(value) * 1000)).fromNow();
                        } else if (column.renderCell) {
                            value = column.renderCell(model);
                        }
                        return <TableRowColumn style={column.style||{}} title={value} className={column.hideSmall?'media-small-hide':null}>{value}</TableRowColumn>
                    })}
                </TableRow>
            );
        });
        const headers = columns.map((column) => {
            return <TableHeaderColumn style={{...column.headerStyle, height: 48, backgroundColor:'#F5F5F5', fontWeight: 500}} className={column.hideSmall?'media-small-hide':null}>{column.label}</TableHeaderColumn>
        });
        if(emptyStateString && !rows.length){
            showCheckboxes = false;
            rows = [
                <TableRow><TableRowColumn colSpan={columns.length} style={emptyStateStyle}>{emptyStateString}</TableRowColumn></TableRow>
            ];
        }
        if((data.length && data[0].Subheader) || (emptyStateString && !rows.length)){
            // Add fake first line to fix width
            rows.unshift(
                <TableRow style={{borderBottom:'none', height:0}}>{
                    columns.map(col => {
                        const s = col.style || {};
                        return <TableRowColumn style={{...s, height: 0}} className={col.hideSmall?'media-small-hide':null}/>
                    })
                }</TableRow>
            );
        }

        const {hideHeaders} = this.props;

        return (
            <Table onRowSelection={this.onRowSelection.bind(this)} multiSelectable={showCheckboxes}>
                {!hideHeaders &&
                    <TableHeader displaySelectAll={showCheckboxes} adjustForCheckbox={showCheckboxes} enableSelectAll={showCheckboxes}>
                        <TableRow>
                            {headers}
                        </TableRow>
                    </TableHeader>
                }
                <TableBody deselectOnClickaway={deselectOnClickAway} displayRowCheckbox={showCheckboxes}>
                    {rows}
                </TableBody>
            </Table>
        );
    }

}

MaterialTable.PropTypes = {
    data: React.PropTypes.array,
    columns: React.PropTypes.array,
    onSelectRows: React.PropTypes.func,
    emptyStateString: React.PropTypes.string,
};

export {MaterialTable as default}
