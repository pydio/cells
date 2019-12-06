import {shapes} from 'jointjs'
import {
    PortsConfig,
    WhiteRect,
    IconToUnicode,
    DarkIcon,
    Orange, SimpleIconMarkup, Blue
} from "../graph/Configs";


class Input extends shapes.devs.Model{

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
                    fill:icon === 'database' ? Orange : Blue,
                    magnet: false
                },
            },
            ports: PortsConfig
        });


    }

}

export default Input