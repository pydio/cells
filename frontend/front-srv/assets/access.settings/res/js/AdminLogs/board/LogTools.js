import React from 'react'
import debounce from 'lodash.debounce'
import PydioApi from 'pydio/http/api'
import PydioDataModel from 'pydio/model/data-model'
import Log from '../model/Log'
import {RaisedButton, TextField, DatePicker, IconButton, FontIcon, IconMenu, MenuItem, Subheader} from 'material-ui'

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
        PydioApi.getClient().downloadSelection(new PydioDataModel(), 'export_logs', {
            query: Log.buildQuery(filter, date, endDate),
            format:format,
            date: (date? date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() : ''),
            service: service || 'syslog'
        });
    }

    handleFilterMode(filterMode){
        this.setState({filterMode: filterMode, date: undefined, filter: ''}, this.publishStateChange.bind(this));
    }

    render(){
        const {pydio, disableExport} = this.props;
        const {filter, date, filterMode} = this.state;
        const hasFilter = filter || date;
        const checkIcon = <FontIcon style={{top: 0}} className={"mdi mdi-check"}/>;
        return (
            <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                {filterMode === 'fulltext' &&
                    <TextField hintText={pydio.MessageHash["ajxp_admin.logs.3"]} onChange={(e) => this.handleFilterChange(e.target.value)} style={{margin: '0 5px', width: 180}} />
                }
                {filterMode === 'oneday' &&
                    <div style={{display:'flex', alignItems:'center'}}>
                        <DatePicker hintText={pydio.MessageHash["ajxp_admin.logs.2"]} onChange={(e, date) => this.handleDateChange(date)}
                                    autoOk={true} maxDate={new Date()} value={this.state.date}
                                    showYearSelector={true} style={{margin: '0 5px', width: 100}} textFieldStyle={{width: 80}} />
                        <IconButton iconClassName={"mdi mdi-close"} tooltip={"Clear"} onTouchTap={() => {this.handleDateChange(undefined)}}/>
                    </div>
                }
                {filterMode === 'period' &&
                    <div style={{display:'flex', alignItems:'center'}}>
                        <DatePicker hintText={'From'} onChange={(e, date) => this.handleDateChange(date)}
                                    autoOk={true} maxDate={new Date()} value={this.state.date}
                                    showYearSelector={true} style={{margin: '0 5px', width: 100}} textFieldStyle={{width: 80}} />
                        <DatePicker hintText={'To'} onChange={(e, date) => this.handleEndDateChange(date)}
                                    autoOk={true} minDate={this.state.date} maxDate={new Date()} value={this.state.endDate}
                                    showYearSelector={true} style={{margin: '0 5px', width: 100}} textFieldStyle={{width: 80}} />
                        <IconButton iconClassName={"mdi mdi-close"} tooltip={"Clear"} onTouchTap={() => {this.handleDateChange(undefined); this.handleEndDateChange(undefined)}}/>
                    </div>
                }
                <IconMenu
                    iconButtonElement={<IconButton iconClassName={"mdi mdi-filter-variant"} tooltip={"Filter Logs"}/>}
                    anchorOrigin={{vertical:'top', horizontal:'right'}}
                    targetOrigin={{vertical:'top', horizontal:'right'}}
                    desktop={true}
                >
                    {<Subheader>Filter by...</Subheader>}
                    <MenuItem primaryText="Full-text search" rightIcon={filterMode === 'fulltext' ? checkIcon : null} onTouchTap={()=>{this.handleFilterMode('fulltext')}}/>
                    <MenuItem primaryText="Pick one day"  rightIcon={filterMode === 'oneday' ? checkIcon : null} onTouchTap={()=>{this.handleFilterMode('oneday')}}/>
                    <MenuItem primaryText="Time Period"  rightIcon={filterMode === 'period' ? checkIcon : null} onTouchTap={()=>{this.handleFilterMode('period')}}/>
                </IconMenu>

                {!disableExport &&
                    <IconMenu
                        iconButtonElement={<IconButton iconClassName={"mdi mdi-download"} tooltip={pydio.MessageHash["ajxp_admin.logs.11"]}/>}
                        anchorOrigin={{vertical:'top', horizontal:'right'}}
                        targetOrigin={{vertical:'top', horizontal:'right'}}
                        desktop={true}
                    >
                        {!hasFilter && <Subheader>Pick a date or filter results</Subheader>}
                        {hasFilter && <Subheader>Export as...</Subheader>}
                        <MenuItem primaryText="CSV" rightIcon={<FontIcon style={{top: 0}} className={"mdi mdi-file-delimited"}/>} onTouchTap={()=>{this.handleExport('CSV')}} disabled={!hasFilter} />
                        <MenuItem primaryText="XLSX" rightIcon={<FontIcon style={{top: 0}} className={"mdi mdi-file-excel"}/>} onTouchTap={()=>{this.handleExport('XLSX')}} disabled={!hasFilter} />
                    </IconMenu>
                }

            </div>
        )
    }


}

export {LogTools as default}