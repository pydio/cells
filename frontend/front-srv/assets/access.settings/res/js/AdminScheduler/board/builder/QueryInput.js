import {shapes} from 'jointjs'
import {Blue, DarkIcon, IconToUnicode, Stale, PortsConfig, SimpleIconMarkup, WhiteRect} from "../graph/Configs";


class QueryInput extends shapes.devs.Model{

    constructor(icon){

        const size = {width: 40, height: 40};

        super({
            size: { ...size},
            outPorts: ['output'],
            markup: SimpleIconMarkup,
            attrs: {
                rect: { ...size, ...WhiteRect},
                icon: {
                    text: IconToUnicode(icon),
                    ...DarkIcon,
                    fill:icon === 'database' ? Stale : Blue,
                    magnet: false
                },
            },
            ports: PortsConfig
        });


    }

}

export default QueryInput