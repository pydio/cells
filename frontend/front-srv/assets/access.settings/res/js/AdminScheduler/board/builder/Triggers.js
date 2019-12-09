import React from 'react'
import Pydio from 'pydio'
import {RightPanel} from './styles'
import {Paper, SelectField, MenuItem} from 'material-ui'
import JobSchedule from '../JobSchedule'
import {JobsSchedule} from 'pydio/http/rest-api'

const eventMessages = {
    NODE_CHANGE:{
        '0':'trigger.create.node',
        '1':'trigger.read.node',
        '2':'trigger.update.path',
        '3':'trigger.update.content',
        '4':'trigger.update.metadata',
        '5':'trigger.delete.node'
    },
    IDM_CHANGE: {
        USER : {
            '0': 'trigger.create.user',
            '1': 'trigger.read.user',
            '2': 'trigger.update.user',
            '3': 'trigger.delete.user',
            '4': 'trigger.bind.user',
            '5': 'trigger.logout.user'
        },
        // TODO I18N
        ROLE : {
            '0': 'Create Role',
            '3': 'Delete Role',
        },
        WORKSPACE : {
            '0': 'Create Workspace',
            '3': 'Delete Workspace',
        },
        ACL : {
            '0': 'Create Acl',
            '3': 'Delete Acl',
        },
    }
};

class Schedule extends React.Component{

    static T(id){
        return Pydio.getMessages()['ajxp_admin.scheduler.' + id] || id;
    }

    render() {
        const {schedule, onDismiss} = this.props;

        const state = JobSchedule.parseIso8601(schedule.Iso8601Schedule);
        const scheduleString = JobSchedule.readableString(state, Schedule.T);

        return (
            <div>{scheduleString}</div>
        )

    }

}

class Events extends React.Component{


    static eventLabel(e, T) {

        const parts = e.split(':');
        if(parts.length === 2 && eventMessages[parts[0]]) {
            return T(eventMessages[parts[0]][parts[1]]);
        } else if(parts.length === 3 && eventMessages[parts[0]] && eventMessages[parts[0]][parts[1]] && eventMessages[parts[0]][parts[1]][parts[2]]){
            return T(eventMessages[parts[0]][parts[1]][parts[2]]);
        } else {
            return e;
        }

    }

    static T(id){
        return Pydio.getMessages()['ajxp_admin.scheduler.' + id] || id;
    }

    render() {
        const {events, onDismiss} = this.props;

        return (
            <div style={{padding: 10}}>
                {events.map(e => <div>{Events.eventLabel(e, Events.T)}</div>)}
            </div>
        )

    }

}

class Triggers extends React.Component {

    onSwitch(type){
        const {onChange} = this.props;
        let data = null;
        if(type === 'manual'){
            data = [];
        } else if(type === 'schedule') {
            data = JobsSchedule.constructFromObject({Iso8601Schedule : ''});
        }
        onChange(type, data);
    }

    render() {
        const {job, onDismiss} = this.props;
        let type = 'manual';
        if(job.Schedule){
            type = 'schedule';
        } else if (job.EventNames !== undefined) {
            type = 'event'
        }
        return (
            <RightPanel title={"Job Trigger"} onDismiss={onDismiss}>
                <SelectField value={type} onChange={(e,i,v) => this.onSwitch(v)}>
                    <MenuItem value={"manual"} primaryText={"Manual Trigger"}/>
                    <MenuItem value={"schedule"} primaryText={"Scheduled"}/>
                    <MenuItem value={"event"} primaryText={"Events"}/>
                </SelectField>
                <div>
                    {type === 'schedule' && <Schedule schedule={job.Schedule}/>}
                    {type === 'event' && <Events events={job.EventNames || []}/>}
                    {type === 'manual' && <div>No parameters</div>}
                </div>
            </RightPanel>
        )
    }

}

export {Triggers, Schedule, Events}