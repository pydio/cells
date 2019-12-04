import {shapes} from 'jointjs'
import {Blue, Stale} from "./Configs";

class Link extends shapes.devs.Link{

    constructor(sourceId, sourcePort, targetId, targetPort, hasData = true) {
        let attrs;
        if (hasData) {
            attrs = {
                stroke: Blue,
                targetMarker: {
                    'type': 'path',
                    'd': 'M 8 -4 0 0 8 4 z'
                }
            };
        } else {
            attrs = {
                stroke: Stale
            }
        }

        super({
            source: {
                id: sourceId,
                port: sourcePort
            },
            target: {
                id: targetId,
                port: targetPort
            },
            attrs: {
                '.connection': attrs,
            }
            /*
            connector:{
                name:'smooth'
            }
            */
        });
    }


}

export default Link