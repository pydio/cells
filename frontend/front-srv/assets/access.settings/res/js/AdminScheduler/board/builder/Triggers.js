import React from 'react'
import Pydio from 'pydio'
import {RightPanel} from './styles'
import {Paper, SelectField, MenuItem} from 'material-ui'
import ScheduleForm from './ScheduleForm'
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

class Events extends React.Component{

    constructor(props){
        super(props);
        this.state = {objEvents: this.toObject(props.events || [])};
    }

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

    onChange(){
        this.props.onChange(Object.keys(this.state.objEvents));
    }

    toObject(ev = []){
        const o = {};
        ev.forEach(e => {o[e] = e});
        return o;
    }

    remove(e){
        const {objEvents} = this.state;
        delete(objEvents[e]);
        this.setState({objEvents}, this.onChange.bind(this));
    }

    add(e){
        const {objEvents} = this.state;
        objEvents[e] = e;
        this.setState({objEvents}, this.onChange.bind(this));
    }

    flatStruct(s, pref = []) {
        const data = [];
        Object.keys(s).forEach((k) => {
            const v = s[k];
            if (typeof v === 'string') {
                data.push([...pref, k].join(':'))
            } else {
                data.push(...this.flatStruct(v, [...pref, k]))
            }
        });
        return data;
    }

    render() {
        const {objEvents} = this.state;
        const flat = this.flatStruct(eventMessages);
        return (
            <div style={{padding: 10}}>
                <SelectField value={-1} onChange={(e,i,v) => {this.add(v)}}>
                    <MenuItem value={-1} primaryText={"Add an event type..."}/>
                    {flat.map(f => <MenuItem value={f} primaryText={Events.eventLabel(f, Events.T)}/>)}
                </SelectField>
                {Object.keys(objEvents).map(e =>
                    <div>{Events.eventLabel(e, Events.T)} - <span className={"mdi mdi-delete"} onClick={() => {this.remove(e)}}/></div>
                )}
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
        const {job, onDismiss, onChange} = this.props;
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
                    {type === 'schedule' && <ScheduleForm schedule={job.Schedule} onChange={(newSched) => {onChange('schedule', newSched)}} edit={true}/>}
                    {type === 'event' && <Events events={job.EventNames || []}  onChange={(newEv) => {onChange('event', newEv)}} />}
                    {type === 'manual' && <div>No parameters</div>}
                </div>
            </RightPanel>
        )
    }

}

export {Triggers, Events}