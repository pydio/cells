import {shapes} from 'jointjs'
import {
    LightLabel,
    PortsConfig,
    BlueRect,
    LightIcon,
    BoxSize,
    IconToUnicode,
    TextIconFilterMarkup, Orange, positionFilters, Blue
} from "./Configs";
import {JOB_ACTION_EMPTY} from "../actions/editor";
import {JobsAction} from 'pydio/http/rest-api';

class Action extends shapes.devs.Model{

    _edit;
    _leftFilter;
    _leftSelector;

    static createEmptyAction(descriptions){
        return new Action(descriptions, JobsAction.constructFromObject({ID:JOB_ACTION_EMPTY}), true);
    }

    /**
     *
     * @param descriptions
     * @param action {JobsAction}
     * @param edit boolean open in edit mode
     */
    constructor(descriptions, action, edit = false){

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
            markup: TextIconFilterMarkup,
            attrs: {
                rect: { ...BoxSize, ...BlueRect},
                icon: {text: iconCode, ...LightIcon},
                text: { text: aName , magnet: false, ...LightLabel},
                'separator': {display:'none', x1:44, y1:0, x2: 44, y2:BoxSize.height, stroke: 'white', 'stroke-width': 1.5, 'stroke-dasharray': '3 3'},
                'filter-rect': {display:'none', fill: 'white', refX: 10, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry:12, event:'element:filter:pointerdown'},
                'filter-icon': {display:'none', text: IconToUnicode('filter'), ...LightIcon, fill: Orange, refX: 22, refY:'50%', refY2: -3, event:'element:filter:pointerdown'},
                'selector-rect': {display:'none', fill: 'white', refX: 10, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry:12, event:'element:selector:pointerdown'},
                'selector-icon': {display:'none', text: IconToUnicode('magnify'), ...LightIcon, fill: Orange, refX: 22, refY:'50%', refY2: -3, event:'element:selector:pointerdown'}
            },
            ports:PortsConfig
        };

        if (action.ChainedActions || edit) {
            config.outPorts = ['output'];
        }

        super(config);
        this._edit = edit;
        this.notifyJobModel(action);
    }

    clearSelection(){
        this.attr('rect/stroke', Blue);
        this.attr('filter-rect/stroke', 'transparent');
        this.attr('selector-rect/stroke', 'transparent');
    }

    select(){
        this.attr('rect/stroke', Orange);
    }

    selectFilter(){
        this.attr('filter-rect/stroke', Orange);
    }

    selectSelector(){
        this.attr('selector-rect/stroke', Orange);
    }

    notifyJobModel(action){
        this._jobModel = action;
        this.setFilter(false);
        this.setSelector(false);
        if(action.NodesFilter || action.IdmFilter || action.UsersFilter){
            this.setFilter(true)
        }
        if(action.NodesSelector || action.IdmSelector || action.UsersSelector) {
            this.setSelector(true);
        }
        action.model = this;
    }

    setFilter(b){
        this._leftFilter = b;
        positionFilters(this, BoxSize, this._leftFilter, this._leftSelector);
    }

    setSelector(b){
        this._leftSelector = b;
        positionFilters(this, BoxSize, this._leftFilter, this._leftSelector);
    }

    toggleEdit(){
        this._edit = !this._edit;
        // Show out port in edit mode even if no actions
        if(!this._jobModel.ChainedActions || !this._jobModel.ChainedActions.length) {
            if(this._edit){
                this.addOutPort('output')
            } else {
                this.removeOutPort('output')
            }
        }
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