/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {JobsJob} from 'cells-sdk'
import {Dialog, FlatButton, FontIcon} from 'material-ui'
import ScheduleForm from './ScheduleForm'

class JobSchedule extends React.Component {

    constructor(props) {
        super(props);
        const {job} = this.props;
        this.state = {
            open: false,
            job,
            rand: Math.random()
        };
    }

    updateJob(){
        const {onUpdate} = this.props;
        const {job, formState} = this.state;
        if(!formState) {
            this.setState({open: false});
            return
        }
        const {frequency} = formState;
        if(frequency === 'manual'){
            if(job.Schedule !== undefined){
                delete job.Schedule;
            }
            job.AutoStart = true;
        } else {
            job.Schedule = {Iso8601Schedule: ScheduleForm.makeIso8601FromState(formState)};
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
                this.setState({open: false, job: req.Job, rand:Math.random()});
            }).catch(e => {})
        }).catch(e => {
            console.error('Cannot load specific library', e)
        })
    }


    render() {
        const {job, rand} = this.state;
        return (
            <div>
                <FlatButton primary={true} icon={<FontIcon className={"mdi mdi-timer"}/>} key={rand} label={<ScheduleForm schedule={job.Schedule} rand={rand}/>} onClick={()=>{this.setState({open:true})}}/>
                <Dialog
                    title={Pydio.getMessages()['ajxp_admin.scheduler.schedule.title']}
                    actions={[
                        <FlatButton label={Pydio.getMessages()[54]} onClick={()=>{this.setState({open:false})}}/>,
                        <FlatButton label={Pydio.getMessages()[53]} onClick={()=>{this.updateJob()}}/>,
                    ]}
                    modal={false}
                    open={this.state.open}
                    contentStyle={{width: 320}}
                >
                    <ScheduleForm
                        schedule={job.Schedule}
                        onChangeState={(s) => {this.setState({formState: s})}}
                        edit={true}
                        includeManual={true}
                    />
                </Dialog>
            </div>
        );

    }

}

export {JobSchedule as default}