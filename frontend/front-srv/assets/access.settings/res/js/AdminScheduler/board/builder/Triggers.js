import React from 'react'
import Pydio from 'pydio'
import {styles, position, RightPanel} from './styles'
import {Paper} from 'material-ui'
import JobSchedule from '../JobSchedule'

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
            <RightPanel title={"Scheduler"} onDismiss={onDismiss}>
                {scheduleString}
            </RightPanel>
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
            <RightPanel title={"Events"} onDismiss={onDismiss}>
                <div style={{padding: 10}}>
                    {events.map(e => <div>{Events.eventLabel(e, Events.T)}</div>)}
                </div>
            </RightPanel>
        )

    }

}

export {Schedule, Events}