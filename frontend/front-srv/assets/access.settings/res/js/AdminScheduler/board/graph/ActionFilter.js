import {shapes} from 'jointjs'
import {
    IconToUnicode,
    DarkIcon,
    Orange,
    DarkLabel,
    LightGrey,
    FilterBoxSize,
    TextIconMarkup,
    FilterPortsConfig,
    DropShadow
} from "./Configs";


class ActionFilter extends shapes.devs.Model{


    constructor(action){

        super({
            size: { ...FilterBoxSize},
            markup: TextIconMarkup,
            attrs: {
                rect: {
                    ...FilterBoxSize,
                    rx: 5, ry: 5, fill: 'white', 'stroke-width': 1.5, 'stroke': LightGrey,
                    'style':'transform: rotate(45deg) translate(19px, -26px) scale(0.8)', filter:DropShadow,
                    event: 'element:filter:pointerdown'
                },
                icon: { text: IconToUnicode('filter'), ...DarkIcon, fill:Orange, refY: 20, event: 'element:filter:pointerdown'},
                text: { text: 'Conditions', ...DarkLabel, 'font-size': 11, event: 'element:filter:pointerdown'},
            },
            inPorts: ['input'],
            outPorts: ['output'],
            ports: FilterPortsConfig
        });
        this.addPort({group:'negate', id:'negate'});
        this.action = action;

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