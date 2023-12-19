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

import React from 'react'
import Pydio from 'pydio'
import {MenuItem,DatePicker,TimePicker} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

const {moment} = Pydio.requireLib('boot');
const {ModernSelectField, ModernTextField, ThemedModernStyles} = Pydio.requireLib('hoc');

const Blue = '#2196f3';
const LightGrey = '#e0e0e0';

const ThemedDatePicker = muiThemeable()(({muiTheme, ...props})=> {
    const ModernStyles = ThemedModernStyles(muiTheme)
    return (
        <DatePicker
            {...props}
            {...ModernStyles.textFieldV2}
            textFieldStyle={{...ModernStyles.textFieldV2.style, marginTop: 0}}
        />

    )
})

const ThemedTimePicker = muiThemeable()(({muiTheme, ...props})=> {
    const ModernStyles = ThemedModernStyles(muiTheme)
    return (
        <TimePicker
            {...props}
            {...ModernStyles.textFieldV2}
            textFieldStyle={{...ModernStyles.textFieldV2.style, marginTop: 0}}
        />

    )
})


class ScheduleForm extends React.Component {

    constructor(props) {
        super(props);
        const {schedule} = props;
        if(!schedule){
            this.state = ScheduleForm.parseIso8601('');
        } else if(schedule.Iso8601Schedule){
            this.state = ScheduleForm.parseIso8601(schedule.Iso8601Schedule);
        } else{
            this.state = {frequency:'daily', daytime:new Date()}
        }
    }

    onUpdate(){
        const {schedule, onChange, onChangeState} = this.props;
        if(onChangeState){
            onChangeState(this.state)
        } else {
            schedule.Iso8601Schedule = ScheduleForm.makeIso8601FromState(this.state);
            onChange(schedule);
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState !== this.state) {
            this.onUpdate();
        }
    }

    static parseIso8601(value){
        if (value === '' || value.indexOf('/') === -1){
            return {frequency: 'manual'};
        }
        const [R, d, i] = value.split('/');
        const startDate = new Date(d);
        let repeatMax;
        if(R !== 'R' && R.indexOf && R.indexOf('R') === 0 && R.length > 1) {
            const rMax = parseInt(R.substr(1))
            if(!isNaN(rMax) && rMax > 0) {
                repeatMax = rMax
            }
        }
        if(i === 'P1M'){
            return {frequency:'monthly', monthday: startDate.getDate(), daytime: startDate, repeatMax};
        } else if(i === 'P7D') {
            const m = moment(startDate);
            return {frequency: 'weekly', weekday: m.day(), daytime: startDate, repeatMax};
        } else if(i === 'PT24H' || i === 'P1D') {
            return {frequency: 'daily', daytime: startDate, repeatMax}
        } else if(i === '' || i === 'P0D') {
            return {frequency: 'once', daytime: startDate}
        } else {
            const d = moment.duration(i);
            if(d.format){
                const minutes = d.minutes() + d.hours() * 60;
                return {frequency: 'timely', everyminutes: minutes, repeatMax};
            } else {
                return {error: 'Cannot parse value ' + value};
            }
        }
    }

    static makeIso8601FromState(state){
        const {frequency, monthday, weekday, daytime, everyminutes} = state;
        let startDate = new Date('2012-01-01T00:00:00.828696-07:00');
        let duration = moment.duration(0);
        switch (frequency) {
            case "manual":
                return "";
            case "monthly":
                if(daytime){
                    startDate.setTime(daytime.getTime());
                }
                startDate.setDate(monthday || 1);
                duration = moment.duration(1, 'months');
                break;
            case "weekly":
                if(daytime){
                    startDate.setTime(daytime.getTime());
                }
                const m = moment(startDate);
                m.day(weekday === undefined ? 1 : weekday);
                startDate = m.toDate();
                duration = moment.duration(7, 'days');
                break;
            case "daily":
                if(daytime){
                    startDate.setTime(daytime.getTime());
                }
                duration = moment.duration(24, 'hours');
                break;
            case "timely":
                duration = moment.duration(everyminutes, 'minutes');
                break;
            case "once":
                // Do not add a duration piece, use daytime as startDate
                return 'R/' + moment(daytime).toISOString() + '/'
            default:
                break
        }
        return 'R/' + moment(startDate).toISOString() + '/' + duration.toISOString();
    }

    T(id){
        return Pydio.getMessages()['ajxp_admin.scheduler.' + id] || id;
    }

    changeFrequency(f){
        let {monthday, weekday, daytime, everyminutes} = this.state;
        if(monthday === undefined){
            monthday = 1;
        }
        if(weekday === undefined){
            weekday = 1;
        }
        if(daytime === undefined){
            daytime = moment();
            daytime.year(2012);
            daytime.hour(9);
            daytime.minute(0);
            daytime = daytime.toDate();
        }
        if(everyminutes === undefined){
            everyminutes = 15
        }
        this.setState({frequency: f, monthday, weekday, daytime, everyminutes});
    }

    static readableString(state, T, short = false){
        const {frequency, monthday, weekday, daytime, everyminutes} = state;
        let dTRead = '0:00';
        if(daytime){
            dTRead = moment(daytime).format('h:mm a');
        }
        switch (frequency) {
            case "manual":
                return T("trigger.manual");
            case "monthly":
                if(short){
                    return T("schedule.monthly.short").replace('%1', monthday);
                } else {
                    return T("schedule.monthly").replace('%1', monthday).replace('%2', dTRead);
                }
            case "weekly":
                if(short){
                    return T("schedule.weekly.short").replace('%1', moment.weekdays()[weekday]);
                } else {
                    return T("schedule.weekly").replace('%1', moment.weekdays()[weekday]).replace('%2', dTRead);
                }
            case "daily":
                if(short){
                    return T("schedule.daily.short").replace('%1', dTRead);
                } else {
                    return T("schedule.daily").replace('%1', dTRead);
                }
            case "timely":
                const duration = moment.duration(everyminutes, 'minutes');
                return T("schedule.timely").replace('%1', (duration.hours()?duration.hours()+'h':'') + (duration.minutes()?duration.minutes()+'mn':''));
            case "once":
                return moment(daytime).calendar()
            default:
                return "Error"
        }
    }

    render() {
        const {edit, includeManual} = this.props;
        if(!edit){
            return <span>{ScheduleForm.readableString(this.state, this.T, true)}</span>
        }
        const {frequency, monthday, weekday, daytime, everyminutes} = this.state;
        let monthdays = [];
        let weekdays = moment.weekdays();
        for (let i = 1;i<30; i++){
            monthdays.push(i);
        }

        return (
            <div>
                <div style={{padding: '10px 0', textAlign:'center'}}>
                    <div style={{color: Blue, fontSize: 15, fontWeight:500}}>{ScheduleForm.readableString(this.state, this.T, false)}</div>
                    {frequency !== 'manual' && <div style={{fontSize:11, paddingTop: 5, color:LightGrey}}>ISO8601: {ScheduleForm.makeIso8601FromState(this.state)}</div>}
                </div>
                <ModernSelectField
                    floatingLabelText={this.T('schedule.type')}
                    value={frequency}
                    onChange={(e,i,val) => {this.changeFrequency(val)}}
                    fullWidth={true}
                    variant={"v2"}
                >
                    {includeManual &&
                        <MenuItem value={'manual'} primaryText={this.T('schedule.type.manual')} />
                    }
                    <MenuItem value={'monthly'} primaryText={this.T('schedule.type.monthly')} />
                    <MenuItem value={'weekly'} primaryText={this.T('schedule.type.weekly')} />
                    <MenuItem value={'daily'} primaryText={this.T('schedule.type.daily')} />
                    <MenuItem value={'timely'} primaryText={this.T('schedule.type.timely')} />
                    <MenuItem value={'once'} primaryText={this.T('schedule.type.once')} />
                </ModernSelectField>
                {frequency === 'monthly' &&
                <div>
                    <ModernSelectField
                        floatingLabelText={this.T('schedule.detail.monthday')}
                        value={monthday}
                        onChange={(e,i,val)=>{this.setState({monthday:val})}}
                        fullWidth={true}
                        variant={"v2"}
                    >
                        {monthdays.map(d => <MenuItem value={d} primaryText={d}/>)}
                    </ModernSelectField>
                </div>
                }
                {frequency === 'weekly' &&
                <div>
                    <ModernSelectField
                        floatingLabelText={this.T('schedule.detail.weekday')}
                        value={weekday}
                        onChange={(e,i,val)=>{this.setState({weekday:val})}}
                        fullWidth={true}
                        variant={"v2"}
                    >
                        {weekdays.map((d,i) => <MenuItem value={i} primaryText={d}/>)}
                    </ModernSelectField>
                </div>
                }
                {(frequency === 'daily' || frequency === 'monthly' || frequency === 'weekly') &&
                <div>
                    <ThemedTimePicker
                        format="ampm"
                        minutesStep={5}
                        floatingLabelText={this.T('schedule.detail.daytime')}
                        value={daytime}
                        onChange={(e,v) => {this.setState({daytime: v})}}
                        fullWidth={true}
                        variant={"v2"}
                    />
                </div>
                }
                {frequency === 'timely' &&
                <div>
                    <ModernTextField
                        floatingLabelText={this.T('schedule.detail.minutes')}
                        value={everyminutes}
                        type={"number"}
                        onChange={(e,val)=>{this.setState({everyminutes:parseInt(val)})}}
                        fullWidth={true}
                        variant={"v2"}
                    />
                </div>
                }
                {frequency === 'once' &&
                    <div style={{display:'flex'}}>
                        <div style={{flex: 1}}>
                            <ThemedDatePicker
                                floatingLabelText={this.T('schedule.detail.daydate')}
                                floatingLabelFixed={true}
                                value={daytime}
                                onChange={(e,v) => {
                                    v.setHours(daytime.getHours())
                                    v.setMinutes(daytime.getMinutes())
                                    v.setSeconds(daytime.getSeconds())
                                    this.setState({daytime: v})
                                }}
                                fullWidth={true}
                            />
                        </div>
                        <div style={{width: 8}}/>
                        <div style={{flex: 1}}>
                            <ThemedTimePicker
                                format="ampm"
                                minutesStep={5}
                                floatingLabelText={this.T('schedule.detail.daytime')}
                                floatingLabelFixed={true}
                                value={daytime}
                                onChange={(e,v) => {
                                    v.setFullYear(daytime.getFullYear())
                                    v.setMonth(daytime.getMonth())
                                    v.setDate(daytime.getDate())
                                    this.setState({daytime: v})
                                }}
                                fullWidth={true}
                            />
                        </div>
                    </div>
                }
            </div>
        );

    }

}
export {ScheduleForm as default};