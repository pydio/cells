import {shapes} from 'jointjs'
import Filter from "./Filter";
import {LightGrey} from "./Configs";
import {JobsNodesSelector, JobsIdmSelector, JobsUsersSelector} from 'pydio/http/rest-api';
import Selector from "./Selector";


class Templates extends shapes.standard.Path{

    _show;

    constructor(){

        const bbox = {width: 128, height: '100%'};

        super({
            markup:[
                {
                    tagName:'rect',
                    selector: 'rect'
                },
                {
                    tagName:'line',
                    selector: 'line'
                },
            ],
            size:{...bbox},
            attrs:{
                rect:{refX:0, refY:0, ...bbox, fill: '#fafafa', display:'none'},
                line:{x1:bbox.width, y1:0, x2:bbox.width, y2: bbox.height, stroke:LightGrey, 'stroke-width':1, display:'none'}
            }
        });

        this.isTemplate = true;

    }

    show(graph){

        if(this._show) return;

        this.attr('line/display','initial');
        this.attr('rect/display','initial');

        this.newNodesFilter(graph);
        this.newUsersFilter(graph);
        this.newWorkspacesFilter(graph);
        this.newRolesFilter(graph);
        this.newAclFilter(graph);

        this.newNodesSelector(graph);
        this.newUsersSelector(graph);
        this.newWorkspacesSelector(graph);
        this.newRolesSelector(graph);
        this.newAclSelector(graph);

        this._show = true;
    }

    hide(graph){
        if(!this._show) return;

        this.attr('line/display','none');
        this.attr('rect/display','none');

        this.modelFilter.remove();
        this.usersFilter.remove();
        this.wsFilter.remove();
        this.rolesFilter.remove();
        this.aclFilter.remove();

        this.modelSelector.remove();
        this.usersSelector.remove();
        this.wsSelector.remove();
        this.rolesSelector.remove();
        this.aclSelector.remove();

        this._show = false;
    }

    replicate(el, graph){
        if(el === this.modelFilter){
            this.newNodesFilter(graph);
        } else if (el === this.usersFilter){
            this.newUsersFilter(graph);
        } else if (el === this.wsFilter){
            this.newWorkspacesFilter(graph);
        } else if (el === this.rolesFilter){
            this.newRolesFilter(graph);
        } else if (el === this.aclFilter){
            this.newAclFilter(graph);
        } else if(el === this.modelSelector){
            this.newNodesSelector(graph);
        } else if (el === this.usersSelector){
            this.newUsersSelector(graph);
        } else if (el === this.wsSelector){
            this.newWorkspacesSelector(graph);
        } else if (el === this.rolesSelector){
            this.newRolesSelector(graph);
        } else if (el === this.aclSelector){
            this.newAclSelector(graph);
        }
    }

    newNodesFilter(graph){
        this.modelFilter = new Filter(JobsNodesSelector.constructFromObject({}));
        this.modelFilter.position(0, 0);
        this.modelFilter.isTemplate = true;
        this.modelFilter.addTo(graph);
    }

    newUsersFilter(graph){
        this.usersFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'User'}), 'idm');
        this.usersFilter.position(0, 64);
        this.usersFilter.isTemplate = true;
        this.usersFilter.addTo(graph);
    }

    newWorkspacesFilter(graph){
        this.wsFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Workspace'}), 'idm');
        this.wsFilter.position(0, 128);
        this.wsFilter.isTemplate = true;
        this.wsFilter.addTo(graph);
    }

    newRolesFilter(graph){
        this.rolesFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Role'}), 'idm');
        this.rolesFilter.position(0, 192);
        this.rolesFilter.isTemplate = true;
        this.rolesFilter.addTo(graph);
    }

    newAclFilter(graph){
        this.aclFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Acl'}), 'idm');
        this.aclFilter.position(0, 256);
        this.aclFilter.isTemplate = true;
        this.aclFilter.addTo(graph);
    }

    newNodesSelector(graph){
        this.modelSelector = new Selector(JobsNodesSelector.constructFromObject({All: true}));
        this.modelSelector.position(64, 0);
        this.modelSelector.isTemplate = true;
        this.modelSelector.addTo(graph);
    }

    newUsersSelector(graph){
        this.usersSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'User', All: true}), 'idm');
        this.usersSelector.position(64, 64);
        this.usersSelector.isTemplate = true;
        this.usersSelector.addTo(graph);
    }

    newWorkspacesSelector(graph){
        this.wsSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Workspace', All: true}), 'idm');
        this.wsSelector.position(64, 128);
        this.wsSelector.isTemplate = true;
        this.wsSelector.addTo(graph);
    }

    newRolesSelector(graph){
        this.rolesSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Role', All: true}), 'idm');
        this.rolesSelector.position(64, 192);
        this.rolesSelector.isTemplate = true;
        this.rolesSelector.addTo(graph);
    }

    newAclSelector(graph){
        this.aclSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Acl', All: true}), 'idm');
        this.aclSelector.position(64, 256);
        this.aclSelector.isTemplate = true;
        this.aclSelector.addTo(graph);
    }

}

export default Templates