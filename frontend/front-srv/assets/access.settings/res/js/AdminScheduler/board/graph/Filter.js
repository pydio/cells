import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    IconToUnicode,
    TextIconMarkup,
    BoxSize,
    DarkIcon,
    Orange, Blue, DarkLabel, LightGrey, RoundIconMarkup, FilterBoxSize, WhiteCircle
} from "./Configs";
import {JobsNodesSelector, JobsIdmSelector, JobsUsersSelector} from 'pydio/http/rest-api';


class Filter extends shapes.devs.Model{


    constructor(filterDefinition, filterType){

        let typeLabel = filterType;
        let typeIcon = "file";
        if(filterType === 'idm') {
            typeLabel = filterDefinition.Type;
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
            typeLabel = 'User';
            typeIcon = "account";
        } else {
            typeLabel = 'Node'
        }

        super({
            size: { ...FilterBoxSize, fill: 'transparent' ,rx: 5,ry: 5, 'stroke-width':1.5,  'stroke': '#31d0c6' },
            markup: RoundIconMarkup,
            attrs: {
                icon: { text: IconToUnicode(typeIcon), ...DarkIcon, fill:Orange, refY: 20},
                text: { text: typeLabel, ...DarkLabel, 'font-size': 11},
                'type-icon-outline': { text: IconToUnicode('filter'), ...DarkIcon, fill: Blue, refX: 40, refY: 22, stroke:"#fafafa", 'stroke-width': 4},
                'type-icon': { text: IconToUnicode('filter'), ...DarkIcon, fill: Blue, refX: 40, refY: 22},
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