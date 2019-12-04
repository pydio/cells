import {shapes} from 'jointjs'
import {LightLabel, PortsConfig, BlueRect, LightIcon, TextIconMarkup, BoxSize} from "./Configs";

class Action extends shapes.devs.Model{

    constructor(action, hasOutput){

        const parts = action.ID.split(".");
        const aName = parts.pop();

        const config = {
            size: { ...BoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            inPorts: ['input'],
            markup: TextIconMarkup,
            attrs: {
                rect: { ...BoxSize, ...BlueRect},
                icon: {text: '\uF61A', ...LightIcon},
                text: { text: aName , magnet: false, ...LightLabel}
            },
            ports:PortsConfig
        };

        if (hasOutput) {
            config.outPorts = ['output'];
        }

        super(config);
        this._jobModel = action;
    }

    /**
     *
     * @return {JobsAction}
     */
    getJobsAction(){
        return this._jobModel;
    }
}

export default Action;