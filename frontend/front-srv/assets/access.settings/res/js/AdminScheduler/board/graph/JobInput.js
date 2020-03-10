import Pydio from 'pydio'
import {shapes} from 'jointjs'
import {
    BoxSize,
    DarkGrey,
    DarkIcon,
    DarkLabel,
    Grey,
    IconToUnicode,
    LightGrey,
    LightIcon,
    Orange,
    PortsConfig,
    positionFilters,
    TextIconFilterMarkup,
    WhiteRect
} from "./Configs";
import ScheduleForm from '../builder/ScheduleForm'

class JobInput extends shapes.devs.Model {

    _rightFilter;
    _rightSelector;

    constructor(job){

        let label = 'Manual Trigger';
        let icon = IconToUnicode('gesture-tap');
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
                'filter-count':{display:'none', stroke: 'rgba(0,0,0,.5)', 'font-weight':300, refX: largeBoxWidth - 12},
                'selector-rect': {display:'none', fill: Orange, refX: largeBoxWidth - 34, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry:12, event:'element:selector:pointerdown'},
                'selector-icon': {display:'none', text: IconToUnicode('magnify'), ...LightIcon, fill: 'white', refX: largeBoxWidth - 22, refY:'50%', refY2: -3, event:'element:selector:pointerdown'},
                'selector-count':{display:'none',stroke: 'rgba(0,0,0,.5)', 'font-weight':300, refX: largeBoxWidth - 12},
                'legend':{display: 'none', fill: Grey, refX: '50%', refY: '120%', 'font-weight':500, 'text-anchor': 'middle', textWrap: {width: -10, height: '50%'}}
            },
            ports:PortsConfig
        });
        this.notifyJobModel(job);

    }

    notifyJobModel(job){

        this.setFilter((job.NodeEventFilter?1:0) + (job.IdmFilter?1:0) + (job.UserEventFilter?1:0) + (job.ContextMetaFilter?1:0));
        this.setSelector((job.NodesSelector?1:0) + (job.IdmSelector?1:0) + (job.UsersSelector?1:0));

        let label = 'Manual Trigger';
        let icon = IconToUnicode('gesture-tap');
        if(job.EventNames){
            label = 'Event';
            if(job.EventNames.length){
                const parts = job.EventNames[0].split(":");
                let eventType = parts.shift();
                if(eventType === 'IDM_CHANGE') {
                    eventType = parts.shift().toLowerCase();
                    eventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
                } else {
                    eventType = 'Node';
                }
                label = eventType + ' Events';
            }
            // mdi-pulse
            icon = IconToUnicode('pulse');
        } else if(job.Schedule){
            const state = ScheduleForm.parseIso8601(job.Schedule.Iso8601Schedule);
            label = ScheduleForm.readableString(state, (id)=>{return Pydio.getMessages()['ajxp_admin.scheduler.' + id] || id;}, true);
            icon = IconToUnicode('clock');
        }

        this.attr('icon/text', icon);
        this.attr('text/text', label);
        job.model = this;
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
        this.attr('filter-rect/stroke', DarkGrey);
        this.attr('filter-rect/stroke-width', 2);
        this.attr('filter-rect/stroke-dasharray', '3px 2px');
    }

    selectSelector(){
        this.attr('selector-rect/stroke', DarkGrey);
        this.attr('selector-rect/stroke-width', 2);
        this.attr('selector-rect/stroke-dasharray', '3px 2px');
    }

    setFilter(b){
        this._rightFilter = b;
        positionFilters(this, BoxSize, this._rightFilter, this._rightSelector, 'right');
    }

    setSelector(b){
        this._rightSelector = b;
        positionFilters(this, BoxSize, this._rightFilter, this._rightSelector, 'right');
    }


    showLegend(legendText){
        this.attr('legend/display', 'block');
        this.attr('legend/textWrap/text',legendText);
    }

    hideLegend(){
        this.attr('legend/display', 'none');
    }

}

export default JobInput