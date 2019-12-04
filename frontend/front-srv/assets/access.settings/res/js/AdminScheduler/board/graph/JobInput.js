import {shapes} from 'jointjs'
import {PortsConfig, WhiteRect, DarkLabel, TextIconMarkup, DarkIcon, BoxSize} from "./Configs";

class JobInput extends shapes.devs.Model {

    constructor(job){

        let label = 'Manual Trigger';
        // mdi-gesture-tap
        let icon = '\uF740';
        let type = 'manual';
        if(job.EventNames){
            const parts = job.EventNames[0].split(":");
            let eventType = parts.shift();
            if(eventType === 'IDM_CHANGE') {
                eventType = parts.shift().toLowerCase();
                eventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
            } else {
                eventType = 'Node';
            }
            label = eventType + ' Events';
            // mdi-pulse
            icon = '\uF430';
            type = 'event';
        } else if(job.Schedule){
            //label = 'Schedule\n\n' + job.Schedule.Iso8601Schedule;
            label = 'Schedule';
            // mdi-clock
            icon = '\uF150';
            type = 'schedule';
        }

        super({
            size: { ...BoxSize },
            inPorts: [],
            outPorts: ['output'],
            markup: TextIconMarkup,
            attrs: {
                rect: { ...BoxSize, ...WhiteRect},
                icon: {text: icon, ...DarkIcon},
                text: { text: label, magnet: false, ...DarkLabel}
            },
            ports:PortsConfig
        });

        this._type = type;
        if(job.EventNames){
            this._eventNames = job.EventNames;
        }else if(job.Schedule){
            this._schedule = job.Schedule;
        }
    }

    getInputType() {
        return this._type;
    }

    getEventNames(){
        return this._eventNames;
    }

    /**
     * @return {JobsSchedule}
     */
    getSchedule(){
        return this._schedule;
    }
}

export default JobInput