import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    IconToUnicode,
    TextIconMarkup,
    BoxSize,
    DarkIcon,
    Orange, DarkLabel, LightGrey, RoundIconMarkup, FilterBoxSize, WhiteCircle
} from "./Configs";
import {JobsNodesSelector, JobsIdmSelector, JobsUsersSelector} from 'pydio/http/rest-api';


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
            size: { ...FilterBoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            markup: RoundIconMarkup,
            attrs: {
                icon: { text: IconToUnicode('filter-outline'), ...DarkIcon, fill:Orange, refY: 20},
                text: { text: typeLabel, ...DarkLabel, 'font-size': 11}
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

    getFilterType(){
        return this._filterType;
    }

    getFilter() {
        return this._jobModel;
    }
}

export default Filter