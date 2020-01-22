/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import ResourcesManager from 'pydio/http/resources-manager'
import PydioApi from 'pydio/http/api'
import {JobsJob} from 'pydio/http/rest-api'
const {moment} = Pydio.requireLib('boot');
import {Dialog, FlatButton, SelectField, MenuItem, TimePicker, TextField, FontIcon} from 'material-ui'

class JobSchedule extends React.Component {

    constructor(props) {
        super(props);
        const {job} = props;
        if(job.Schedule && job.Schedule.Iso8601Schedule){
            this.state = JobSchedule.parseIso8601(job.Schedule.Iso8601Schedule);
        } else {
            this.state = {frequency: 'manual'};
        }
        this.state['open'] = false;
    }

    updateJob(){
        const {job, onUpdate} = this.props;
        const {frequency} = this.state;
        if(frequency === 'manual'){
            if(job.Schedule !== undefined){
                delete job.Schedule;
            }
            job.AutoStart = true;
        } else {
            job.Schedule = {Iso8601Schedule: JobSchedule.makeIso8601FromState(this.state)};
            if(job.AutoStart !== undefined){
                delete job.AutoStart;
            }
        }
        ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
            const {SchedulerServiceApi, JobsPutJobRequest} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            const req = new JobsPutJobRequest();
            // Clone and remove tasks
            req.Job = JobsJob.constructFromObject(JSON.parse(JSON.stringify(job)));
            if(req.Job.Tasks !== undefined){
                delete req.Job.Tasks;
            }
            api.putJob(req).then(()=>{
                onUpdate();
                this.setState({open: false});
            })
        })
    }

    static parseIso8601(value){
        if (value === '' || value.indexOf('/') === -1){
            return {frequency: 'manual'};
        }
        const [R, d, i] = value.split('/');
        const startDate = new Date(d);
        if(i === 'P1M'){
            return {frequency:'monthly', monthday: startDate.getDate(), daytime: startDate};
        } else if(i === 'P7D') {
            const m = moment(startDate);
            return {frequency: 'weekly', weekday: m.day(), daytime: startDate};
        } else if(i === 'PT24H' || i === 'P1D') {
            return {frequency: 'daily', daytime: startDate}
        } else {
            const d = moment.duration(i);
            if(d.isValid()){
                const minutes = d.minutes() + d.hours() * 60;
                return {frequency: 'timely', everyminutes: minutes};
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
            daytime.hours(9);
            daytime.minutes(0);
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
            dTRead = moment(daytime).format('h:mm');
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
            default:
                return "Error"
        }
    }

    render() {
        const {edit} = this.props;
        if(!edit){
            return <span>{JobSchedule.readableString(this.state, this.T, true)}</span>
        }
        const {frequency, monthday, weekday, daytime, everyminutes} = this.state;
        let monthdays = [];
        let weekdays = moment.weekdays();
        for (let i = 1;i<30; i++){
            monthdays.push(i);
        }
        return (
            <div>
                <FlatButton primary={true} icon={<FontIcon className={"mdi mdi-timer"}/>} label={JobSchedule.readableString(this.state, this.T, true)} onTouchTap={()=>{this.setState({open:true})}}/>
                <Dialog
                    title="Job Schedule"
                    actions={[
                        <FlatButton label={"Close"} onTouchTap={()=>{this.setState({open:false})}}/>,
                        <FlatButton label={"Save"} onTouchTap={()=>{this.updateJob()}}/>,
                    ]}
                    modal={false}
                    open={this.state.open}
                    contentStyle={{width: 320}}
                >
                    <div>
                        <div>
                            <div style={{color: '#212121'}}>{JobSchedule.readableString(this.state, this.T, false)}</div>
                            {frequency !== 'manual' && <div style={{fontSize:11, paddingTop: 5}}>ISO8601: {JobSchedule.makeIso8601FromState(this.state)}</div>}
                        </div>
                        <SelectField
                            floatingLabelText={this.T('schedule.type')}
                            value={frequency}
                            onChange={(e,i,val) => {this.changeFrequency(val)}}
                            fullWidth={true}
                        >
                            <MenuItem value={'manual'} primaryText={this.T('schedule.type.manual')} />
                            <MenuItem value={'monthly'} primaryText={this.T('schedule.type.monthly')} />
                            <MenuItem value={'weekly'} primaryText={this.T('schedule.type.weekly')} />
                            <MenuItem value={'daily'} primaryText={this.T('schedule.type.daily')} />
                            <MenuItem value={'timely'} primaryText={this.T('schedule.type.timely')} />
                        </SelectField>
                        {frequency === 'monthly' &&
                        <div>
                            <SelectField
                                floatingLabelText={this.T('schedule.detail.monthday')}
                                value={monthday}
                                onChange={(e,i,val)=>{this.setState({monthday:val})}}
                                fullWidth={true}
                            >
                                {monthdays.map(d => <MenuItem value={d} primaryText={d}/>)}
                            </SelectField>
                        </div>
                        }
                        {frequency === 'weekly' &&
                        <div>
                            <SelectField
                                floatingLabelText={this.T('schedule.detail.weekday')}
                                value={weekday}
                                onChange={(e,i,val)=>{this.setState({weekday:val})}}
                                fullWidth={true}
                            >
                                {weekdays.map((d,i) => <MenuItem value={i} primaryText={d}/>)}
                            </SelectField>
                        </div>
                        }
                        {(frequency === 'daily' || frequency === 'monthly' || frequency === 'weekly') &&
                            <div>
                                <TimePicker
                                    format="ampm"
                                    minutesStep={5}
                                    floatingLabelText={this.T('schedule.detail.daytime')}
                                    value={daytime}
                                    onChange={(e,v) => {this.setState({daytime: v})}}
                                    fullWidth={true}
                                />
                            </div>
                        }
                        {frequency === 'timely' &&
                        <div>
                            <TextField
                                floatingLabelText={this.T('schedule.detail.minutes')}
                                value={everyminutes}
                                type={"number"}
                                onChange={(e,val)=>{this.setState({everyminutes:parseInt(val)})}}
                                fullWidth={true}
                            />
                        </div>
                        }
                    </div>
                </Dialog>
            </div>
        );

    }

}

export {JobSchedule as default}