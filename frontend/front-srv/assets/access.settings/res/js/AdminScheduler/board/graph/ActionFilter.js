import {shapes} from 'jointjs'
import {
    AllowedKeys,
    DarkIcon,
    DarkLabel,
    DropShadow,
    FilterBoxSize,
    FilterPortsConfig,
    IconToUnicode,
    LightGrey,
    Orange,
    TextIconMarkup
} from "./Configs";


class ActionFilter extends shapes.devs.Model{

    /**
     * @param action {JobsAction}
     */
    constructor(action){

        const filterKeys = Object.keys(AllowedKeys.filter.action);
        const filtersCount = filterKeys.reduce((i, key) => {return i + (action[key]?1:0)}, 0);
        let single = 'Filter';
        let plural = 'Filters';
        let icon = 'filter-outline';
        let style = {};
        if(action.FailedFilterActions !== undefined){
            single = 'Condition';
            plural = 'Conditions';
            icon = 'call-split';
            style = {style : 'transform: rotate(45deg) translate(19px, -26px) scale(0.8)'};
        }
        let label = single;
        if(filtersCount > 1){
            label = plural + ' ('+filtersCount+')';
        } else {
            let cName = filterKeys.reduce((s, key) => {return action[key] ? key : s}, '');
            if(cName){
                if(cName === 'IdmFilter') {
                    cName = action[cName].Type || 'User';
                } else if (cName === 'ContextMetaFilter') {
                    cName = action[cName].Type === 'ContextUser' ? 'Context User' : 'Request'
                } else {
                    cName = cName.replace('Filter', '');
                }
                label = cName + ' ' + single.toLowerCase();
            }

        }

        super({
            size: { ...FilterBoxSize},
            markup: TextIconMarkup,
            attrs: {
                rect: {
                    ...FilterBoxSize, ...style,
                    rx: 5, ry: 5, fill: 'white', 'stroke-width': 1.5, 'stroke': LightGrey,filter:DropShadow,
                    event: 'element:filter:pointerdown'
                },
                icon: { text: IconToUnicode(icon), ...DarkIcon, fill:Orange, refY: 32, event: 'element:filter:pointerdown'},
                text: { text:  label, ...DarkLabel, refY:0, refY2: -22, 'font-size': 13, event: 'element:filter:pointerdown'},
            },
            inPorts: ['input'],
            //outPorts: ['output'],
            ports: FilterPortsConfig
        });
        this.action = action;
        if(this.action.FailedFilterActions !== undefined){
            this.addPort({group:'outx', id:'output'});
            this.addPort({group:'negate', id:'negate'});
        } else {
            this.addPort({group:'out', id:'output'});
        }
    }

    selectFilter(){
        this.select();
    }

    clearSelection(){
        this.attr('rect/stroke', LightGrey);
    }

    select(){
        this.attr('rect/stroke', Orange);
    }

    getJobsAction(){
        return this.action;
    }

}

export default ActionFilter