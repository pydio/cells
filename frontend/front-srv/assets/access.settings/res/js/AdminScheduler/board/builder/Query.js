import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    DarkGrey, Orange, LightGrey, IconToUnicode, Blue, Destructive
} from "../graph/Configs";


class Query extends shapes.devs.Model{

    constructor(proto, fieldName, parentQuery = null, isNot = false){

        const size = {width: 180, height: 40};

        let typeLabel = fieldName;
        if(proto){
            const fieldValue = proto.value[fieldName];
            if (fieldValue) {
                let value = fieldValue;
                if (typeof fieldValue === "object"){
                    value = JSON.stringify(fieldValue);
                }
                typeLabel = fieldName + (isNot?' != ':' = ') + value;
            } else if(fieldName === 'value') {
                typeLabel = JSON.stringify(proto.value);
            }
        }
        let truncated = undefined;
        if(typeLabel.length > 22) {
            truncated = typeLabel;
            typeLabel = typeLabel.substr(0, 19) + '...';
        }

        super({
            size: { ...size},
            inPorts: ['input'],
            outPorts: ['output'],
            markup:[
                {tagName:'rect', selector:'body'},
                {tagName:'text', selector:'label'},
                {tagName:'text', selector:'remove-icon'}
            ],
            attrs: {
                'body': { ...size, ...WhiteRect, event:'query:select', title:truncated},
                'label': {
                    text: typeLabel,  magnet: false, refX: 12, refY:'50%', refY2:-8,
                    fill:DarkGrey, 'text-anchor':'left', 'font-size': 15, 'font-family':'Roboto', 'font-weight':500,
                    event:'query:select',
                    title:truncated
                },
                'remove-icon':{
                    text : IconToUnicode('delete'), magnet: false, refX:'100%', refX2: -28, refY: '50%', refY2: -6,
                    cursor: 'pointer',fill: Destructive, 'font-size': 15, 'font-family':'Roboto', 'font-weight':500,
                    event:'query:delete',
                    title: 'Remove condition'
                }
            },
            ports: PortsConfig
        });

        if(!proto){
            this.attr('remove-icon/text', IconToUnicode('plus-circle-outline'));
            this.attr('remove-icon/fill', Blue);
            this.attr('remove-icon/event', 'root:add');
        } else {
            this.attr('remove-icon/opacity', 0);
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

    hover(value){
        if(!this.proto){
            return;
        }
        if(value){
            this.attr('remove-icon/opacity', 1)
        } else {
            this.attr('remove-icon/opacity', 0)
        }
    }

}

export default Query