/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import Pydio from 'pydio'
import React from 'react'
import debounce from 'lodash.debounce'
import Log from '../model/Log'
import {RaisedButton, TextField, DatePicker, IconButton, FlatButton, FontIcon, IconMenu, MenuItem, Subheader, Dialog} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
const {ModernTextField, ModernStyles} = Pydio.requireLib('hoc');

class LogTools extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            filter: "",
            filterMode: "fulltext"
        };

        this.handleFilterChange = debounce(this.handleFilterChange.bind(this), 250);
        this.handleDateChange = debounce(this.handleDateChange.bind(this), 250);

    }

    publishStateChange(){
        this.props.onStateChange(this.state);
    }

    handleFilterChange(val) {
        this.setState({filter: val?val.toLowerCase():val, page: 0}, this.publishStateChange.bind(this))
    }

    handleDateChange(date) {
        const {filterMode, endDate} = this.state;
        if(filterMode === 'period' && !endDate && date !== undefined){
            let end = new Date();
            //end.setDate(end.getDate() + 1);
            this.setState({endDate: end})
        }
        this.setState({date: date, page: 0}, this.publishStateChange.bind(this));
    }

    handleEndDateChange(date) {
        this.setState({endDate: date, page: 0}, this.publishStateChange.bind(this));
    }

    handleExport(format) {
        const {filter, date, endDate} = this.state;
        const {service} = this.props;
        const dateString = (date? date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() : '');
        const query = Log.buildQuery(filter, date, endDate);
        Log.downloadLogs(service || 'sys', query, format).then(blob => {
            const url = window.URL.createObjectURL(blob);
            let filename = 'cells-logs-';
            if (dateString){
                filename += dateString;
            } else {
                filename += 'filtered';
            }
            filename += '.' + format.toLowerCase();
            if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                this.setState({
                    exportUrl:url,
                    exportFilename:filename,
                    exportOnClick:()=>{
                        setTimeout(()=>{
                            window.URL.revokeObjectURL(url);
                        }, 100);
                        this.setState({exportUrl:null, exportFilename: null});
                    }
                });
                return;
            }
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100);
        });
    }

    handleFilterMode(filterMode){
        this.setState({filterMode: filterMode, date: undefined, filter: ''}, this.publishStateChange.bind(this));
    }

    render(){
        const {pydio, disableExport, muiTheme} = this.props;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        const {filter, date, filterMode, exportUrl, exportFilename, exportOnClick} = this.state;
        const {MessageHash} = pydio;
        const hasFilter = filter || date;
        const checkIcon = <FontIcon style={{top: 0}} className={"mdi mdi-check"}/>;
        return (
            <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                {filterMode === 'fulltext' &&
                    <ModernTextField hintText={MessageHash["ajxp_admin.logs.3"]} onChange={(e) => this.handleFilterChange(e.target.value)} style={{margin: '0 5px', width: 180}} />
                }
                {filterMode === 'oneday' &&
                    <div style={{display:'flex', alignItems:'center'}}>
                        <DatePicker hintText={MessageHash["ajxp_admin.logs.2"]} onChange={(e, date) => this.handleDateChange(date)}
                                    autoOk={true} maxDate={new Date()} value={this.state.date}
                                    showYearSelector={true} style={{width: 120}} textFieldStyle={{width: 120}} {...ModernStyles.textField}/>
                        <IconButton iconClassName={"mdi mdi-close"} tooltip={"Clear"} onTouchTap={() => {this.handleDateChange(undefined)}} {...adminStyles.props.header.iconButton}/>
                    </div>
                }
                {filterMode === 'period' &&
                    <div style={{display:'flex', alignItems:'center'}}>
                        <DatePicker hintText={'From'} onChange={(e, date) => this.handleDateChange(date)}
                                    autoOk={true} maxDate={new Date()} value={this.state.date}
                                    showYearSelector={true} style={{width: 100}} textFieldStyle={{width: 96}} {...ModernStyles.textField} />
                        <DatePicker hintText={'To'} onChange={(e, date) => this.handleEndDateChange(date)}
                                    autoOk={true} minDate={this.state.date} maxDate={new Date()} value={this.state.endDate}
                                    showYearSelector={true} style={{width: 100}} textFieldStyle={{width: 96}} {...ModernStyles.textField} />
                        <IconButton iconClassName={"mdi mdi-close"} tooltip={"Clear"} onTouchTap={() => {this.handleDateChange(undefined); this.handleEndDateChange(undefined)}} {...adminStyles.props.header.iconButton}/>
                    </div>
                }
                <IconMenu
                    iconButtonElement={<IconButton iconClassName={"mdi mdi-filter-variant"} tooltip={MessageHash['ajxp_admin.logs.3']} {...adminStyles.props.header.iconButton}/>}
                    anchorOrigin={{vertical:'top', horizontal:'right'}}
                    targetOrigin={{vertical:'top', horizontal:'right'}}
                    desktop={true}
                >
                    {<Subheader>{MessageHash['ajxp_admin.logs.filter.legend']}</Subheader>}
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.filter.fulltext']} rightIcon={filterMode === 'fulltext' ? checkIcon : null} onTouchTap={()=>{this.handleFilterMode('fulltext')}}/>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.2']}  rightIcon={filterMode === 'oneday' ? checkIcon : null} onTouchTap={()=>{this.handleFilterMode('oneday')}}/>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.filter.period']}  rightIcon={filterMode === 'period' ? checkIcon : null} onTouchTap={()=>{this.handleFilterMode('period')}}/>
                </IconMenu>

                {!disableExport &&
                    <IconMenu
                        iconButtonElement={<IconButton iconClassName={"mdi mdi-download"} tooltip={MessageHash["ajxp_admin.logs.11"]} {...adminStyles.props.header.iconButton}/>}
                        anchorOrigin={{vertical:'top', horizontal:'right'}}
                        targetOrigin={{vertical:'top', horizontal:'right'}}
                        desktop={true}
                    >
                        {!hasFilter && <Subheader>{MessageHash['ajxp_admin.logs.export.disabled']}</Subheader>}
                        {hasFilter && <Subheader>{MessageHash['ajxp_admin.logs.11']}</Subheader>}
                        <MenuItem primaryText="CSV" rightIcon={<FontIcon style={{top: 0}} className={"mdi mdi-file-delimited"}/>} onTouchTap={()=>{this.handleExport('CSV')}} disabled={!hasFilter} />
                        <MenuItem primaryText="XLSX" rightIcon={<FontIcon style={{top: 0}} className={"mdi mdi-file-excel"}/>} onTouchTap={()=>{this.handleExport('XLSX')}} disabled={!hasFilter} />
                        {exportUrl && <Subheader><a href={exportUrl} download={exportFilename}>{exportFilename}</a></Subheader>}
                    </IconMenu>
                }
                <Dialog
                    open={!!exportUrl}
                    modal={true}
                    title={MessageHash['ajxp_admin.logs.11']}
                    actions={[<FlatButton label={"Cancel"} onTouchTap={exportOnClick}/>]}
                >
                    <span style={{fontSize:13}}>
                        {MessageHash['ajxp_admin.logs.export.clicklink']}: <a style={{textDecoration:'underline'}} href={exportUrl} download={exportFilename} onClick={exportOnClick}>{exportFilename}</a>
                    </span>
                </Dialog>

            </div>
        )
    }


}
LogTools = muiThemeable()(LogTools);
export {LogTools as default}