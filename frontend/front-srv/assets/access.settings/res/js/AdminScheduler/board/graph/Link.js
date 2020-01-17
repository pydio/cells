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
        });
        this.attr('.link-tool/display', 'none');
        this.router('manhattan');
        this.connector('rounded')
    }

    orthogonal(){
        this.router('manhattan');
        this.connector('rounded')
    }

}

export default Link