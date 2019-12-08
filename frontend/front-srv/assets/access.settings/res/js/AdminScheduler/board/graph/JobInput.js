import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    DarkLabel,
    TextIconMarkup,
    DarkIcon,
    BoxSize,
    IconToUnicode,
    positionFilters, TextIconFilterMarkup, LightIcon, Orange, LightGrey
} from "./Configs";

class JobInput extends shapes.devs.Model {

    _rightFilter;
    _rightSelector;

    constructor(job){

        let label = 'Manual Trigger';
        // mdi-gesture-tap
        let icon = IconToUnicode('gesture-tap');
        let type = 'manual';
        if(job.EventNames){
            const parts = job.EventNames[0].split(":");
            let eventType = parts.shift();
            if(eventType === 'IDM_CHANGE') {
                eventType = parts.shift().toLowerCase();
                eventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
            } else {
                eventType = 'Node';
            }
            label = eventType + ' Events';
            // mdi-pulse
            icon = IconToUnicode('pulse');
            type = 'event';
        } else if(job.Schedule){
            //label = 'Schedule\n\n' + job.Schedule.Iso8601Schedule;
            label = 'Schedule';
            // mdi-clock
            icon = IconToUnicode('clock');
            type = 'schedule';
        }

        const largeBoxWidth = 180;

        super({
            size: { ...BoxSize },
            inPorts: [],
            outPorts: ['output'],
            markup: TextIconFilterMarkup,
            attrs: {
                rect: { ...BoxSize, ...WhiteRect},
                icon: {text: icon, ...DarkIcon},
                text: { text: label, magnet: 'passive', ...DarkLabel},
                'separator': {display:'none', x1:largeBoxWidth - 44, y1:0, x2: largeBoxWidth - 44, y2:BoxSize.height, stroke: LightGrey, 'stroke-width': 1.5, 'stroke-dasharray': '3 3'},
                'filter-rect': {display:'none', fill: Orange, refX: largeBoxWidth - 34, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry:12, event:'element:filter:pointerdown'},
                'filter-icon': {display:'none', text: IconToUnicode('filter'), ...LightIcon, fill: 'white', refX: largeBoxWidth - 22, refY:'50%', refY2: -3, event:'element:filter:pointerdown'},
                'selector-rect': {display:'none', fill: Orange, refX: largeBoxWidth - 34, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry:12, event:'element:selector:pointerdown'},
                'selector-icon': {display:'none', text: IconToUnicode('magnify'), ...LightIcon, fill: 'white', refX: largeBoxWidth - 22, refY:'50%', refY2: -3, event:'element:selector:pointerdown'}
            },
            ports:PortsConfig
        });

        this._type = type;
        if(job.EventNames){
            this._eventNames = job.EventNames;
        }else if(job.Schedule){
            this._schedule = job.Schedule;
        }
        if(job.NodeEventFilter || job.IdmFilter || job.UserEventFilter){
            this.setFilter(true);
        }
        if(job.NodesSelector || job.IdmSelector || job.UsersSelector){
            this.Selector(true);
        }
    }

    clearSelection(){
        this.attr('rect/stroke', LightGrey);
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

    setFilter(b){
        this._rightFilter = b;
        positionFilters(this, BoxSize, this._rightFilter, this._rightSelector, 'right');
    }

    setSelector(b){
        this._rightSelector = b;
        positionFilters(this, BoxSize, this._rightFilter, this._rightSelector, 'right');
    }

    getInputType() {
        return this._type;
    }

    getEventNames(){
        return this._eventNames;
    }

    /**
     * @return {JobsSchedule}
     */
    getSchedule(){
        return this._schedule;
    }
}

export default JobInput