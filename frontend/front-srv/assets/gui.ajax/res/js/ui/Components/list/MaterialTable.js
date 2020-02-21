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
import {Table, TableHeader, TableFooter, TableRow, TableBody, TableRowColumn, TableHeaderColumn, SelectField, MenuItem, IconButton} from 'material-ui'
import Pydio from 'pydio'
const {moment} = Pydio.requireLib("boot");
const {ModernStyles} = Pydio.requireLib("hoc");

/**
 * Simple material table
 * columns are objects of shape {name, label, style, headerStyle}
 */
class MaterialTable extends React.Component{

    constructor(props){
        super(props);
        this.state = {};
    }

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
            const pagination = this.computePagination();
            let src = data;
            if(pagination.use){
                src = src.slice(pagination.sliceStart, pagination.sliceEnd);
            }
            let selection = [];
            indexes.map((i) => {
                // Find if previous data has expanded rows : do not count them in for selection
                const expanded = src.slice(0, i).filter(d => d.expandedRow).length;
                if (expanded){
                    i = i - expanded;
                }
                selection.push(src[i]);
            });
            onSelectRows(selection);
        }
    }

    computePagination(){
        const {data, paginate, defaultPageSize, pagination} = this.props;
        if(pagination){
            // externally managed
            return {...pagination, use: true};
        }
        if (!paginate || !data || !data.length) {
            return {use: false}
        }
        const pageSize = this.state.pageSize || defaultPageSize || paginate[0];
        if (data.length <= pageSize) {
            return {use: false}
        }
        const {page = 1} = this.state;
        const max = Math.ceil(data.length / pageSize);
        const sliceStart = (page - 1) * pageSize;
        const sliceEnd = Math.min((page) * pageSize, data.length);
        let pages = [];
        for (let i = 1; i <= max; i ++) {
            pages.push(i);
        }
        return {
            use: true,
            sliceStart,
            sliceEnd,
            pages,
            page,
            pageSize,
            pageSizes: paginate
        }
    }

    renderPagination(pagination){
        const {data} = this.props;
        const {page, pageSize, pages, pageSizes, sliceStart, sliceEnd, nextDisabled, prevDisabled, onPageNext, onPagePrev, onPageSizeChange} = pagination;
        return (
            <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', color:'#757575'}}>
                {pageSizes.length > 1 &&
                    <div style={{paddingRight: 10}}>Rows per page :</div>
                }
                {pageSizes.length > 1 &&
                    <div style={{width: 90}}>
                        <SelectField {...ModernStyles.selectField} fullWidth={true} value={pageSize} onChange={(e,i, v) => {
                            if(onPageSizeChange){
                                onPageSizeChange(v);
                            } else {
                                this.setState({page:1, pageSize: v})
                            }
                        }}>
                            {pageSizes.map(ps => <MenuItem value={ps} primaryText={ps}/>)}
                        </SelectField>
                    </div>
                }
                {onPagePrev &&
                    <IconButton iconClassName={"mdi mdi-chevron-left"} disabled={prevDisabled} onTouchTap={() => onPagePrev()}/>
                }
                {!onPagePrev &&
                    <IconButton iconClassName={"mdi mdi-chevron-left"} disabled={page === 1} onTouchTap={() => this.setState({page:page-1})}/>
                }
                {(sliceStart || sliceEnd) && <div>{sliceStart+1}-{sliceEnd} of {data.length}</div>}
                {onPageNext &&
                    <IconButton iconClassName={"mdi mdi-chevron-right"} disabled={nextDisabled} onTouchTap={() => onPageNext()}/>
                }
                {!onPageNext &&
                    <IconButton iconClassName={"mdi mdi-chevron-right"} disabled={page === pages.length} onTouchTap={() => this.setState({page:page+1})}/>
                }
            </div>
        );
    }


    render(){

        const {columns, deselectOnClickAway, emptyStateString, masterStyles={}, emptyStateStyle, onSelectRows, computeRowStyle} = this.props;
        let {data} = this.props;
        let {showCheckboxes} = this.props;

        const pagination = this.computePagination();
        let paginator;
        if(pagination.use){
            data = data.slice(pagination.sliceStart, pagination.sliceEnd);
            paginator = this.renderPagination(pagination);
        }

        let rows = [];
        data.map((model) => {
            let rowStyle;
            if(computeRowStyle){
                rowStyle = computeRowStyle(model);
            }
            if(model.Subheader){
                const headerStyle = {
                    fontSize:12, color: '#616161', backgroundColor:'#FAFAFA',fontWeight: 500,
                    ...model.style
                };
                rows.push(
                    <TableRow className={"media-small-hide"} style={{...masterStyles.row}}>
                        <TableRowColumn colSpan={columns.length} style={headerStyle}>
                            {model.Subheader}
                        </TableRowColumn>
                    </TableRow>
                );
                return;
            }
            if(model.colSpan){
                rows.push(
                    <TableRow style={{...model.rowStyle,...masterStyles.row}}>
                        <TableRowColumn colSpan={columns.length} style={{height: 'auto', paddingLeft: 0, paddingRight: 0, backgroundColor:'transparent', ...model.cellStyle}}>{model.element}</TableRowColumn>
                    </TableRow>
                );
                return;
            }
            let mainRowStyle = {...rowStyle, ...masterStyles.row};
            if(model.expandedRow){
                mainRowStyle = {...mainRowStyle, ...masterStyles.expanderRow};
            }
            rows.push(
                <TableRow selectable={onSelectRows !== undefined} style={mainRowStyle}>
                    {columns.map((column) => {
                        let value = model[column.name];
                        let tip = value;
                        if (column.useMoment && value){
                            value = moment(new Date(parseInt(value) * 1000)).fromNow();
                            tip = value;
                        } else if (column.renderCell) {
                            value = column.renderCell(model);
                            if (value && typeof value === 'object' && value.element && value.text){
                                tip = value.text;
                                value = value.element;
                            }
                        }
                        return <TableRowColumn
                            style={column.style||{}}
                            title={typeof tip === 'object' ? null : tip}
                            className={column.hideSmall?'media-small-hide':null}>{value}</TableRowColumn>
                    })}
                </TableRow>
            );
            if(model.expandedRow){
                rows.push(
                    <TableRow selectable={false} style={{...masterStyles.row,...masterStyles.expandedRow}}>
                        <TableRowColumn colSpan={columns.length} style={{height: 'auto', paddingLeft: 0, paddingRight: 0, backgroundColor:'transparent', ...model.cellStyle}}>{model.expandedRow}</TableRowColumn>
                    </TableRow>
                );
            }
        });
        const headers = columns.map((column) => {
            return <TableHeaderColumn
                style={{...column.headerStyle, height: 48, backgroundColor:'#F5F5F5', fontWeight: 500, ...masterStyles.head}}
                className={column.hideSmall?'media-small-hide':null}
            >{column.label}</TableHeaderColumn>
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
                <TableRow style={{borderBottom:'none', height:0, ...masterStyles.row}}>{
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
                        <TableRow style={masterStyles.row}>
                            {headers}
                        </TableRow>
                    </TableHeader>
                }
                <TableBody deselectOnClickaway={deselectOnClickAway} displayRowCheckbox={showCheckboxes}>
                    {rows}
                </TableBody>
                {paginator &&
                    <TableFooter>
                        <TableRow style={{backgroundColor:'#fafafa'}}>
                            <TableRowColumn colSpan={columns.length}>{paginator}</TableRowColumn>
                        </TableRow>
                    </TableFooter>
                }
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
