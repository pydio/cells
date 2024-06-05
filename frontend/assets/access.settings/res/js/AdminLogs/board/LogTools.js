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
import {DatePicker, TimePicker, IconButton, FlatButton, FontIcon, IconMenu, MenuItem, Subheader, Dialog, Divider} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
const {ModernTextField, ModernSelectField, ThemedModernStyles} = Pydio.requireLib('hoc');
const {moment} = Pydio.requireLib('boot');

class LogTools extends React.Component{

    constructor(props){
        super(props);
        const serverOffset = Pydio.getInstance().Parameters.get('backend')['ServerOffset'];
        const localOffset = new Date().getTimezoneOffset() * 60
        let localState;
        try{
            localState = JSON.parse(localStorage.getItem('pydio.logs.ux-state'))
        }catch(e){}
        this.state = {
            filter: "",
            filterMode: "fulltext",
            levelShow:false,
            serviceFilterShow: false,
            darkTheme: false,
            serverOffset:serverOffset+localOffset,
            timeOffset: 0,
            ...localState
        };
        this.publishStateChange = debounce(this.publishStateChange.bind(this), 250);
    }

    componentDidMount() {
        try{
            const localState = JSON.parse(localStorage.getItem('pydio.logs.ux-state'))
            this.setState(localState, this.publishStateChange.bind(this))
        }catch(e){}
    }

    publishStateChange(){
        const {filter, serviceFilter, level, remoteAddress, userName, date, endDate, darkTheme, timeOffset, dateShow, endDateShow, serviceFilterShow, levelShow, userNameShow, remoteAddressShow} = this.state;
        const query = Log.buildQuery(filter, serviceFilter, level, remoteAddress, userName, date, endDate);
        const localState = {darkTheme, timeOffset, dateShow, endDateShow, serviceFilterShow, levelShow, userNameShow, remoteAddressShow}
        localStorage.setItem('pydio.logs.ux-state', JSON.stringify(localState))
        this.props.onStateChange({query, darkTheme, timeOffset});
    }

    handleToggleShow(field){
        const fieldName = field + 'Show';
        const crt = this.state[fieldName];
        const s = {[fieldName]:!crt};
        if(crt){
           if(field === 'date' || field === 'endDate'){
               s['date'] = null;
               s['endDate'] = null;
               s['dateShow'] = false;
               s['endDateShow'] = false;
           } else {
               s[field] = null;
           }
           s['page'] = 0;
        } else if(field === 'date' && this.state.endDateShow){
            s['endDate'] = null;
            s['endDateShow'] = false;
        }
        this.setState(s, this.publishStateChange.bind(this));
    }

    toggleDarkTheme() {
        const {darkTheme} = this.state;
        this.setState({darkTheme:!darkTheme}, this.publishStateChange.bind(this));
    }

    toggleUseServerOffset() {
        const {serverOffset, timeOffset} = this.state;
        this.setState({timeOffset: timeOffset?0:serverOffset}, this.publishStateChange.bind(this))
    }

    handleFilterChange(val, keyName) {
        this.setState({[keyName]: val, page: 0}, this.publishStateChange.bind(this))
    }

    handleLevelChange(val){
        let {level} = this.state;
        const hasComp = level.indexOf('<') === 0;
        const full = (hasComp?'<':'') + val
        this.handleFilterChange(full, 'level')
    }

    handleLevelCompChange(val){
        let {level = ''} = this.state;
        level = val + level.replace('<', '')
        this.handleFilterChange(level, 'level')
    }

    handleDateChange(date, time = null) {
        if(time){
            date.setHours(time.getHours(), time.getMinutes());
        }
        const {endDate, endDateShow} = this.state;
        if(endDateShow && !endDate && date !== undefined){
            let end = new Date();
            end.setHours(23, 59, 59);
            this.setState({endDate: end})
        }
        this.setState({date: date, page: 0}, this.publishStateChange.bind(this));
    }

    handleEndDateChange(date, time = null) {
        if(time){
            date.setHours(time.getHours(), time.getMinutes());
        }
        this.setState({endDate: date, page: 0}, this.publishStateChange.bind(this));
    }

    handleExport(format) {
        const {filter, serviceFilter, level, remoteAddress, userName, date, endDate} = this.state;
        const {service} = this.props;
        const dateString = (date? date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() : '');
        const query = Log.buildQuery(filter, serviceFilter, level, remoteAddress, userName, date, endDate);
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

    render(){
        const {pydio, disableExport, muiTheme, focus} = this.props;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);
        const ModernStyles = ThemedModernStyles(muiTheme)

        const focusBadge = {
            backgroundColor: '#FBE9E7',
            height: 32,
            lineHeight: '32px',
            fontSize: 13,
            padding: '0 10px',
            marginRight: 5,
            color: '#FF5722',
            borderRadius: 20
        };

        const {filter, date, dateShow, endDate, endDateShow, serviceFilter, serviceFilterShow, level='', levelShow, userName, userNameShow, remoteAddress, remoteAddressShow, exportUrl, exportFilename, exportOnClick, serverOffset, timeOffset} = this.state;
        const {MessageHash} = pydio;
        const hasFilter = filter || serviceFilter || date || endDate || level || userName || remoteAddress;
        const checkIcon = <FontIcon style={{top: 0, fontSize: 20}} className={"mdi mdi-check"}/>;
        const levelExact = MessageHash['ajxp_admin.logs.level.exact']
        const levelGT = MessageHash['ajxp_admin.logs.level.greaterthan']
        const icSubHeaderStyle={style: {lineHeight: '32px'}};
        const icMenuItem=(active) => {
            let activeStyle = {}
            if(active) {
                activeStyle = {
                    backgroundColor: muiTheme.palette.primary1Color,
                    color: 'white'
                }
            }
            return {
                style:{
                    minHeight: 29,
                    lineHeight: '29px',
                    paddingTop: 2,
                    paddingBottom: 2
                },
                innerDivStyle:{
                    padding: '0px 10px',
                    borderRadius: 20,
                    margin: '0 10px',
                    fontSize: 13,
                    ...activeStyle
                }
            }
        };

        return (
            <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>

                {focus &&
                    <div style={focusBadge}>Focus on +/- 5 minutes at {moment(new Date((focus+timeOffset)*1000)).format('HH:mm:ss')}</div>
                }

                <div style={{marginRight: 5, width: 140}} >
                    <ModernTextField
                        hintText={MessageHash["ajxp_admin.logs.3"]}
                        onChange={(e, v) => this.handleFilterChange(v, 'filter')}
                        fullWidth={true}
                        variant={"compact"}
                    />
                </div>

                {levelShow &&
                    <div style={{marginRight: 5, marginTop: -2, width: 170}}>
                        <ModernSelectField hintText={MessageHash['ajxp_admin.logs.level']} fullWidth={true} value={level}
                                           onChange={(e, i, v) => this.handleFilterChange(v, 'level')} variant={"compact"}>
                            <MenuItem primaryText={""}/>
                            <MenuItem primaryText={"ERROR"} value={"ERROR"} innerDivStyle={{color:'#E53935', fontWeight: 500, fontSize: 14}}/>
                            <MenuItem primaryText={"WARN " + levelExact} value={"WARN"} innerDivStyle={{color:'#FB8C00', fontWeight: 500, fontSize: 14}}/>
                            <MenuItem primaryText={"WARN " + levelGT} value={"<WARN"} innerDivStyle={{color:'#FB8C00', fontWeight: 500, fontSize: 14}}/>
                            <MenuItem primaryText={"INFO " + levelExact} value={"INFO"} innerDivStyle={{color:'#1976D0', fontWeight: 500, fontSize: 14}}/>
                            <MenuItem primaryText={"INFO " + levelGT} value={"<INFO"} innerDivStyle={{color:'#1976D0', fontWeight: 500, fontSize: 14}}/>
                            <MenuItem primaryText={"DEBUG " + levelExact} value={"DEBUG"} innerDivStyle={{color:'#673AB7', fontWeight: 500, fontSize: 14}}/>
                            <MenuItem primaryText={"DEBUG " + levelGT} value={"<DEBUG"} innerDivStyle={{color:'#673AB7', fontWeight: 500, fontSize: 14}}/>
                        </ModernSelectField>
                    </div>
                }

                {serviceFilterShow &&
                    <div style={{marginRight: 5, width: 80}} >
                        <ModernTextField hintText={MessageHash['ajxp_admin.logs.service']} fullWidth={true}
                                         value={serviceFilter} onChange={(e, v) => this.handleFilterChange(v, 'serviceFilter')}
                                         variant={"compact"}/>
                    </div>
                }

                {remoteAddressShow &&
                    <div style={{marginRight: 5, width: 80}} >
                        <ModernTextField hintText={MessageHash['ajxp_admin.logs.filter.ip']}
                                         fullWidth={true} onChange={(e, v) => this.handleFilterChange(v, 'remoteAddress')}
                                         variant={"compact"}/>
                    </div>
                }

                {userNameShow &&
                    <div style={{marginRight: 5, width: 80}} >
                        <ModernTextField hintText={MessageHash['ajxp_admin.logs.filter.login']}
                                         fullWidth={true} onChange={(e, v) => this.handleFilterChange(v, 'userName')}
                                         variant={"compact"}/>
                    </div>
                }

                {dateShow && !endDateShow &&
                <div style={{display:'flex', alignItems:'center'}}>
                    <DatePicker hintText={MessageHash["ajxp_admin.logs.2"]} onChange={(e, date) => this.handleDateChange(date)}
                                autoOk={true} maxDate={new Date()} value={date}
                                showYearSelector={true} style={{width: 120}} textFieldStyle={{width: 120}} {...ModernStyles.textFieldCompact}/>
                    <IconButton iconClassName={"mdi mdi-close"} tooltip={"Clear"} onClick={() => {this.handleDateChange(undefined)}} {...adminStyles.props.header.iconButton}/>
                </div>
                }
                {endDateShow &&
                <div style={{display:'flex', alignItems:'center'}}>
                    <DatePicker hintText={MessageHash['ajxp_admin.logs.filter.period.from']} onChange={(e, date) => this.handleDateChange(date)}
                                autoOk={true} maxDate={new Date()} value={date}
                                showYearSelector={true} style={{width: 100}} textFieldStyle={{width: 96}} {...ModernStyles.textFieldCompact} />
                    <TimePicker hintText={MessageHash['ajxp_admin.logs.filter.period.time']} disabled={!date} onChange={(e, time) => this.handleDateChange(date, time)}
                                autoOk={true} value={date}
                                style={{width: 100}} textFieldStyle={{width: 96}} {...ModernStyles.textFieldCompact} />
                    <DatePicker hintText={MessageHash['ajxp_admin.logs.filter.period.to']} onChange={(e, date) => this.handleEndDateChange(date)}
                                autoOk={true} minDate={this.state.date} maxDate={new Date()} value={endDate}
                                showYearSelector={true} style={{width: 100}} textFieldStyle={{width: 96}} {...ModernStyles.textFieldCompact} />
                    <TimePicker hintText={MessageHash['ajxp_admin.logs.filter.period.time']} disabled={!endDate} onChange={(e, time) => this.handleEndDateChange(endDate, time)}
                                autoOk={true} value={endDate}
                                style={{width: 100}} textFieldStyle={{width: 96}} {...ModernStyles.textFieldCompact} />
                    <IconButton iconClassName={"mdi mdi-close"} tooltip={"Clear"} onClick={() => {this.handleDateChange(undefined); this.handleEndDateChange(undefined)}} {...adminStyles.props.header.iconButton}/>
                </div>
                }
                <IconMenu
                    iconButtonElement={<IconButton iconClassName={"mdi mdi-filter-variant-plus"} tooltip={MessageHash['ajxp_admin.logs.3']} {...adminStyles.props.header.iconButton}/>}
                    anchorOrigin={{vertical:'top', horizontal:'right'}}
                    targetOrigin={{vertical:'top', horizontal:'right'}}
                    desktop={true}
                    clickCloseDelay={0}
                >
                    <Subheader {...icSubHeaderStyle}>{MessageHash['ajxp_admin.logs.filter.legend']}</Subheader>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.level']}  onClick={()=>{this.handleToggleShow('level')}} {...icMenuItem(levelShow)}/>
                    <Divider/>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.2']}  onClick={()=>{this.handleToggleShow('date')}} {...icMenuItem(dateShow && !endDateShow)}/>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.filter.period']} onClick={()=>{this.handleToggleShow('endDate')}} {...icMenuItem(endDateShow)}/>
                    <Divider/>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.service']}  onClick={()=>{this.handleToggleShow('serviceFilter')}} {...icMenuItem(serviceFilterShow)}/>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.filter.login']} onClick={()=>{this.handleToggleShow('userName')}} {...icMenuItem(userNameShow)}/>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.filter.ip']} onClick={()=>{this.handleToggleShow('remoteAddress')}} {...icMenuItem(remoteAddressShow)}/>
                </IconMenu>

                {serverOffset !== 0 &&
                <IconMenu
                    iconButtonElement={<IconButton iconClassName={"mdi mdi-alarm"+(timeOffset?'-snooze':'')} tooltip={MessageHash['ajxp_admin.logs.tz.tooltip']} {...adminStyles.props.header.iconButton}/>}
                    anchorOrigin={{vertical:'top', horizontal:'right'}}
                    targetOrigin={{vertical:'top', horizontal:'right'}}
                    desktop={true}
                >
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.tz.local']} rightIcon={timeOffset ? null : checkIcon} onClick={()=>{this.toggleUseServerOffset()}}/>
                    <MenuItem primaryText={MessageHash['ajxp_admin.logs.tz.server']}  rightIcon={timeOffset ? checkIcon : null} onClick={()=>{this.toggleUseServerOffset()}}/>
                </IconMenu>
                }

                {!disableExport &&
                    <IconMenu
                        iconButtonElement={<IconButton iconClassName={"mdi mdi-download"} tooltip={MessageHash["ajxp_admin.logs.11"]} {...adminStyles.props.header.iconButton}/>}
                        anchorOrigin={{vertical:'top', horizontal:'right'}}
                        targetOrigin={{vertical:'top', horizontal:'right'}}
                        desktop={true}
                    >
                        {!hasFilter && <Subheader {...icSubHeaderStyle}>{MessageHash['ajxp_admin.logs.export.disabled']}</Subheader>}
                        {hasFilter && <Subheader {...icSubHeaderStyle}>{MessageHash['ajxp_admin.logs.11']}</Subheader>}
                        <MenuItem primaryText="CSV" rightIcon={<FontIcon style={{top: 0}} className={"mdi mdi-file-delimited"}/>} onClick={()=>{this.handleExport('CSV')}} disabled={!hasFilter} />
                        <MenuItem primaryText="XLSX" rightIcon={<FontIcon style={{top: 0}} className={"mdi mdi-file-excel"}/>} onClick={()=>{this.handleExport('XLSX')}} disabled={!hasFilter} />
                        {exportUrl && <Subheader><a href={exportUrl} download={exportFilename}>{exportFilename}</a></Subheader>}
                    </IconMenu>
                }
                <Dialog
                    open={!!exportUrl}
                    modal={true}
                    title={MessageHash['ajxp_admin.logs.11']}
                    actions={[<FlatButton label={MessageHash['54']} onClick={exportOnClick}/>]}
                >
                    <span style={{fontSize:13}}>
                        {MessageHash['ajxp_admin.logs.export.clicklink']}: <a style={{textDecoration:'underline'}} href={exportUrl} download={exportFilename} onClick={exportOnClick}>{exportFilename}</a>
                    </span>
                </Dialog>
                <IconButton iconClassName={"mdi mdi-brightness-6"} tooltip={MessageHash['ajxp_admin.logs.toggleTheme']} onClick={() => this.toggleDarkTheme()} style={adminStyles.props.header.iconButton.style} iconStyle={{...adminStyles.props.header.iconButton.iconStyle, transform:this.state.darkTheme?'rotate(180deg)':''}} />
            </div>
        )
    }


}
LogTools = muiThemeable()(LogTools);
export {LogTools as default}