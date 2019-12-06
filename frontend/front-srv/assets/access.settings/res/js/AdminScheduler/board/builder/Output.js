import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    IconToUnicode,
    DarkIcon,
    Orange, SimpleIconMarkup, Blue
} from "../graph/Configs";


class Output extends shapes.devs.Model{

    constructor(icon){

        const size = {width: 40, height: 40};

        super({
            size: { ...size},
            inPorts: ['input'],
            markup: SimpleIconMarkup,
            attrs: {
                rect: { ...size, ...WhiteRect},
                icon: { text: IconToUnicode(icon), ...DarkIcon, fill:Blue, magnet: false},
            },
            ports: PortsConfig
        });


    }

}

export default Output