import {shapes, dia} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    SimpleIconMarkup, IconToUnicode, DarkIcon, Orange, Blue, ClusterConfig, LightGrey
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
                    tagName: 'text',
                    selector: 'type-label'
                },
                {
                    tagName: 'text',
                    selector: 'add-button'
                },
                {
                    tagName: 'text',
                    selector: 'remove-button'
                },
                {
                    tagName: 'text',
                    selector: 'split-button'
                }],
            attrs: {
                rect: {refWidth: '100%', refHeight: '100%', refY: 10, refHeight2: -20, rx: 5, ry: 5, fill: 'transparent', stroke: LightGrey, 'stroke-width': 2, strokeDasharray: '5,2', cursor:'default'},
                'type-label':{text: typeLabel, fill: LightGrey, refX: '-50%', refX2: 5, refY: '-50%', 'text-anchor':'left', cursor:'pointer', event:'cluster:type'},
                'add-button':{text: '+', fill:LightGrey, refX: '50%', refX2: -25, refY: '-50%', 'text-anchor':'right', cursor:'pointer', event:'cluster:add'},
                'remove-button':{text: '-', fill:LightGrey, refX: '50%', refX2: -15, refY: '-50%', 'text-anchor':'right', cursor:'pointer', event:'cluster:delete'},
                'split-button':{text: '||', fill:LightGrey, refX: '50%', refX2: -5, refY: '-50%', 'text-anchor':'right', cursor:'pointer', event:'cluster:split'},
            }
        });

        this.query = query;

        if(this.query.SubQueries.length === 1) {
            this.attr('type-label/display', 'none');
        }

    }

}

export default QueryCluster