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
    LightGrey, FilterBoxSize, RoundIconMarkup, WhiteCircle, DarkGrey, Blue
} from "./Configs";


class Selector extends shapes.devs.Model{

    constructor(filterDefinition, filterType){

        let typeLabel = filterType;
        let typeIcon = 'file';
        if(filterType === 'idm') {
            typeLabel = filterDefinition.Type + 's';
            switch (filterDefinition.Type) {
                case "User":
                    typeIcon = 'account';break;
                case "Role":
                    typeIcon = 'account-card-details';break;
                case "Workspace":
                    typeIcon = 'folder-open'; break;
                case "Acl":
                    typeIcon = 'format-list-checks';break;
                default:
                    break;
            }
        } else if(filterType === 'user') {
            typeLabel = 'Users';
            typeIcon = 'account';
        } else {
            typeLabel = 'Nodes'
        }

        super({
            size: { ...FilterBoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            markup: RoundIconMarkup,
            attrs: {
                icon : { text: IconToUnicode(typeIcon), ...DarkIcon, fill: Orange, refY: 20},
                'type-icon-outline': { text: IconToUnicode('magnify'), ...DarkIcon, fill: Blue, refX: 40, refY: 22, stroke:"#fafafa", 'stroke-width': 4},
                'type-icon': { text: IconToUnicode('magnify'), ...DarkIcon, fill: Blue, refX: 40, refY: 22},
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