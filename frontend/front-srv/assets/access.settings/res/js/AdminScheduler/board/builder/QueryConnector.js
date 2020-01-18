import {shapes} from 'jointjs'
import {PortsConfig} from "../graph/Configs";


class QueryConnector extends shapes.devs.Model{

    constructor(){

        const size = {width: 10, height: 10};

        super({
            size: { ...size},
            inPorts: ['input'],
            markup: [{
                tagName: 'circle',
                selector: 'circle'
            }],
            attrs: {
                circle: { ...size, display:'none'},
            },
            ports: PortsConfig
        });


    }

}

export default QueryConnector