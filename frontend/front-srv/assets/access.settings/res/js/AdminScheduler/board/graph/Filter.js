import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    IconToUnicode,
    TextIconMarkup,
    BoxSize,
    DarkIcon,
    Orange, DarkLabel
} from "./Configs";


class Filter extends shapes.devs.Model{

    constructor(filterDefinition, filterType){

        let typeLabel = filterType;
        if(filterType === 'idm') {
            typeLabel = filterDefinition.Type;
        } else if(filterType === 'user') {
            typeLabel = 'User'
        } else {
            typeLabel = 'Node'
        }

        super({
            size: { ...BoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            inPorts: ['input'],
            outPorts: ['output'],
            markup: TextIconMarkup,
            attrs: {
                rect: { ...BoxSize, ...WhiteRect},
                icon: { text: IconToUnicode('filter-outline'), ...DarkIcon, fill:Orange, magnet: false},
                text: { text: 'Filter ' + typeLabel, magnet: false, ...DarkLabel}
            },
            ports: PortsConfig
        });

        this._jobModel = filterDefinition;
        this._filterType = filterType;

    }

    getFilterType(){
        return this._filterType;
    }

    getFilter() {
        return this._jobModel;
    }
}

export default Filter