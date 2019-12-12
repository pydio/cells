import {shapes} from 'jointjs'
import {linkAttr} from "./Configs";

class Link extends shapes.devs.Link{

    constructor(sourceId, sourcePort, targetId, targetPort, hasData = true) {

        super({
            source: {
                id: sourceId,
                port: sourcePort
            },
            target: {
                id: targetId,
                port: targetPort
            },
            attrs: linkAttr(hasData),
            /*
            connector:{
                name:'smooth'
            }
            */
        });
        this.attr('.link-tool/display', 'none');
    }


}

export default Link