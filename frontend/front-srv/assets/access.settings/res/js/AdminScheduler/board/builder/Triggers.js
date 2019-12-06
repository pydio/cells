import React from 'react'
import Pydio from 'pydio'
import {styles, position} from './styles'
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
        const {schedule, onDismiss, sourcePosition, sourceSize, scrollLeft} = this.props;
        const pos = position(200, sourceSize, sourcePosition, scrollLeft);

        const state = JobSchedule.parseIso8601(schedule.Iso8601Schedule);
        const scheduleString = JobSchedule.readableString(state, Schedule.T);

        return (
            <Paper style={{...styles.paper, ...pos}} zDepth={2}>
                <div style={styles.header}>
                    <div style={{flex: 1}}>Programmed Schedule</div>
                    <span className={'mdi mdi-close'} onClick={()=>{onDismiss()}} style={styles.close}/>
                </div>
                <div style={styles.body}>
                    {scheduleString}
                </div>
            </Paper>
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
        const {events, onDismiss, sourcePosition, sourceSize, scrollLeft} = this.props;
        const pos = position(200, sourceSize, sourcePosition, scrollLeft);

        return (
            <Paper style={{...styles.paper, ...pos}} zDepth={2}>
                <div style={styles.header}>
                    <div style={{flex: 1}}>Events</div>
                    <span className={'mdi mdi-close'} onClick={()=>{onDismiss()}} style={styles.close}/>
                </div>
                <div style={styles.body}>
                    {events.map(e => <div>{Events.eventLabel(e, Events.T)}</div>)}
                </div>
            </Paper>
        )

    }

}

export {Schedule, Events}