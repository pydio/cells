import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    DarkGrey
} from "../graph/Configs";


class Query extends shapes.devs.Model{

    constructor(fieldName, fieldValue = ''){

        const size = {width: 140, height: 40};

        let typeLabel = fieldName;
        if (fieldValue) {
            typeLabel = fieldName + ': ' + fieldValue;
        }
        if(typeLabel.length > 20) {
            typeLabel = typeLabel.substr(0, 17) + '...'
        }

        super({
            size: { ...size},
            inPorts: ['input'],
            outPorts: ['output'],
            attrs: {
                '.body': { ...size, ...WhiteRect},
                '.label': { text: typeLabel,  magnet: false, refY:2, fill:DarkGrey, 'text-anchor':'middle', 'font-size': 15, 'font-family':'Roboto', 'font-weight':500}
            },
            ports: PortsConfig
        });

    }

}

export default Query