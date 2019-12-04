import {shapes} from 'jointjs'
import {PortsConfig, WhiteRect, DarkLabel, TextIconMarkup, DarkIcon, BoxSize, Orange} from "./Configs";


class Selector extends shapes.devs.Model{

    constructor(filterDefinition, filterType){

        let typeLabel = filterType;
        if(filterType === 'idm') {
            typeLabel = filterDefinition.Type + 's';
        } else if(filterType === 'user') {
            typeLabel = 'Users'
        } else {
            typeLabel = 'Nodes'
        }

        super({
            size: { ...BoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            inPorts: ['input'],
            outPorts: ['output'],
            markup: TextIconMarkup,
            attrs: {
                rect: { ...BoxSize, ...WhiteRect },
                icon: { text: '\uF349', ...DarkIcon, fill: Orange},
                text: { text: 'Select ' + typeLabel, magnet: false, ...DarkLabel}
            },
            ports: PortsConfig
        });
        this._jobModel = filterDefinition;
        this._filterType = filterType;

    }

    getSelectorType(){
        return this._filterType;
    }

    getSelector() {
        return this._jobModel;
    }


}

export default Selector