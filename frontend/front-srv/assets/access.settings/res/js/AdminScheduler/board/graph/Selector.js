import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    DarkLabel,
    TextIconMarkup,
    DarkIcon,
    BoxSize,
    Orange,
    IconToUnicode,
    LightGrey, FilterBoxSize, RoundIconMarkup, WhiteCircle
} from "./Configs";


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
            size: { ...FilterBoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            markup: RoundIconMarkup,
            attrs: {
                icon: { text: IconToUnicode('magnify'), ...DarkIcon, fill: Orange, refY: 20},
                text: { text: typeLabel, ...DarkLabel, magnet: 'passive', 'font-size': 11}
            },
            ports: PortsConfig
        });
        this._jobModel = filterDefinition;
        this._filterType = filterType;

    }

    clearSelection(){
        this.attr('rect/stroke', LightGrey);
    }

    select(){
        this.attr('rect/stroke', Orange);
    }

    getSelectorType(){
        return this._filterType;
    }

    getSelector() {
        return this._jobModel;
    }


}

export default Selector