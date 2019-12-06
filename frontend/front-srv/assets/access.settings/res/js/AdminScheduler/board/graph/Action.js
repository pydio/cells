import {shapes} from 'jointjs'
import {LightLabel, PortsConfig, BlueRect, LightIcon, TextIconMarkup, BoxSize, IconToUnicode} from "./Configs";

class Action extends shapes.devs.Model{

    constructor(descriptions, action, hasOutput){

        let aName;
        if(descriptions && descriptions[action.ID] && descriptions[action.ID].Label){
            aName = descriptions[action.ID].Label
        } else {
            const parts = action.ID.split(".");
            aName = parts.pop();
        }

        let iconCode = IconToUnicode("chip");
        if(descriptions && descriptions[action.ID] && descriptions[action.ID].Icon){
            iconCode = IconToUnicode(descriptions[action.ID].Icon);
        }

        const config = {
            size: { ...BoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            inPorts: ['input'],
            markup: TextIconMarkup,
            attrs: {
                rect: { ...BoxSize, ...BlueRect},
                icon: {text: iconCode, ...LightIcon},
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