import {shapes, dia} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    SimpleIconMarkup, IconToUnicode, DarkIcon, Orange, Blue, ClusterConfig, LightGrey, DarkGrey, Destructive, Grey
} from "../graph/Configs";


class QueryCluster extends shapes.basic.Rect{

    constructor(query){

        const typeLabel = query.Operation === 'AND' ? 'AND' : 'OR';

        super({
            markup: [{
                    tagName: 'rect',
                    selector: 'rect'
                },
                {
                    tagName: 'rect',
                    selector: 'hover-rect',
                },
                {
                    tagName: 'text',
                    selector: 'type-label'
                },
                {
                    tagName: 'text',
                    selector: 'swap-icon'
                },
                {
                    tagName: 'text',
                    selector: 'add-icon'
                },
                {
                    tagName: 'text',
                    selector: 'remove-icon'
                },
                {
                    tagName: 'text',
                    selector: 'split-icon'
                }],
            attrs: {
                rect: {refWidth: '100%', refHeight: '100%', refY: 10, refHeight2: -20, rx: 5, ry: 5, fill: 'transparent', stroke: LightGrey, 'stroke-width': 2, strokeDasharray: '5,2', cursor:'default'},
                'hover-rect':{refWidth:'100%', height: 20, refX: 0, refY: -10, fill: 'transparent'},
                'type-label':{text: typeLabel, fill: LightGrey, refX: '-50%', refX2: 5, refY: '-50%', 'text-anchor':'left', cursor:'pointer', event:'cluster:type'},
                'swap-icon':{text: IconToUnicode('swap-horizontal'), fill:Blue, refX: '-50%', refX2: typeLabel === 'AND' ? 35 : 25, refY: '-50%', 'text-anchor':'right', cursor:'pointer', event:'cluster:type'},
                'remove-icon':{text: IconToUnicode('delete'), fill:Destructive, refX: '50%', refX2: -60, refY: '-50%', 'text-anchor':'right', cursor:'pointer', event:'cluster:delete'},
                'split-icon':{text: IconToUnicode('call-split'), fill:Blue, refX: '50%', refX2: -40, refY: '-50%', 'text-anchor':'right', cursor:'pointer', event:'cluster:split'},
                'add-icon':{text: IconToUnicode('plus-circle-outline'), fill:Blue, refX: '50%', refX2: -20, refY: '-50%', 'text-anchor':'right', cursor:'pointer', event:'cluster:add', title:'Add condition'},
            }
        });

        this.query = query;

        if(this.query.SubQueries.length === 1) {
            this.attr('type-label/display', 'none');
            this.attr('swap-icon/display', 'none');
        }
        this.hover(false);

    }

    hover(value){
        if(value){
            this.attr('remove-icon/opacity', 1);
            this.attr('add-icon/opacity', 1);
            this.attr('swap-icon/opacity', 1);
            this.attr('split-icon/opacity', 1);
            this.attr('rect/stroke', Grey);
            this.attr('type-label/fill', Grey);
        } else {
            this.attr('remove-icon/opacity', 0);
            this.attr('swap-icon/opacity', 0);
            this.attr('add-icon/opacity', 0);
            this.attr('split-icon/opacity', 0);
            this.attr('rect/stroke', LightGrey);
            this.attr('type-label/fill', LightGrey);
        }
    }


}

export default QueryCluster