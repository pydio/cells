import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    DarkGrey, Orange, LightGrey
} from "../graph/Configs";


class Query extends shapes.devs.Model{

    constructor(proto, fieldName, parentQuery = null, isNot = false){

        const size = {width: 140, height: 40};

        let typeLabel = fieldName;
        if(proto){
            const fieldValue = proto.value[fieldName];
            if (fieldValue) {
                typeLabel = fieldName + ': ' + fieldValue;
            }
        }
        if(typeLabel.length > 17) {
            typeLabel = typeLabel.substr(0, 14) + '...'
        }
        if(isNot){
            typeLabel = "[!] " + typeLabel;
        }

        super({
            size: { ...size},
            inPorts: ['input'],
            outPorts: ['output'],
            markup:[
                {tagName:'rect', selector:'body'},
                {tagName:'text', selector:'label'},
                {tagName:'text', selector:'remove'}
            ],
            attrs: {
                'body': { ...size, ...WhiteRect, event:'query:select'},
                'label': { text: typeLabel,  magnet: false, refX: -10, refX2:'50%', refY:'50%', refY2:-8, fill:DarkGrey, 'text-anchor':'middle', 'font-size': 15, 'font-family':'Roboto', 'font-weight':500, event:'query:select'},
                'remove':{ text : '-', magnet: false, refX:'100%', refX2: -20, refY: '50%', refY2: -8, cursor: 'pointer', event:'query:delete', fill: DarkGrey, 'font-size': 15, 'font-family':'Roboto', 'font-weight':500}
            },
            ports: PortsConfig
        });

        if(!proto){
            this.attr('remove/text', '+');
            this.attr('remove/event', 'root:add');
        }

        this.proto = proto;
        this.fieldName = fieldName;
        this.parentQuery = parentQuery;

    }

    select(){
        this.attr('body/stroke', Orange);
    }

    deselect(){
        this.attr('body/stroke', LightGrey);
    }

}

export default Query