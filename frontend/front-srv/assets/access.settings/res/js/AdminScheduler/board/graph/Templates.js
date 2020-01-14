import {shapes} from 'jointjs'
import Filter from "./Filter";
import {Blue, Grey, LightGrey} from "./Configs";
import {JobsNodesSelector, JobsIdmSelector, JobsUsersSelector, JobsContextMetaFilter, JobsActionOutputFilter} from 'pydio/http/rest-api';
import Selector from "./Selector";


class Templates extends shapes.standard.Path{

    _show;

    constructor(){

        const bbox = {width: 128, height: '100%'};

        super({
            markup:[
                {tagName:'rect',selector: 'rect'},
                {tagName:'line',selector: 'line'},
                {tagName:'line',selector: 'separator'},
                {tagName:'rect',selector: 'action-button'},
                {tagName:'text',selector: 'action-text'},
                {tagName:'rect',selector: 'reflow-button'},
                {tagName:'text',selector: 'reflow-text'},
                {tagName:'text',selector: 'filters-legend'},
            ],
            size:{...bbox},
            attrs:{
                rect:{refX:0, refY:0, ...bbox, fill: '#fafafa', display:'none', cursor:'default', event:'element:nomove'},
                line:{x1:bbox.width, y1:0, x2:bbox.width, y2: bbox.height, stroke:LightGrey, 'stroke-width':1, display:'none', event:'element:nomove'},
                separator:{x1:0, y1:112, x2:bbox.width, y2: 112, stroke:LightGrey, 'stroke-width':1, display:'none', event:'element:nomove'},
                'action-button':{x: 16, y: 16, height: 32, width: bbox.width - 32, fill:'#fafafa', stroke: Blue, 'stroke-width':2, rx: 2, ry: 2, cursor:'pointer', display:'none', event:'button:create-action'},
                'action-text':{refX: '50%', y: 36, text: 'Create Action', 'cursor':'pointer', fill: Blue, 'text-anchor':'middle', 'font-weight':500, display:'none', event:'button:create-action'},
                'reflow-button':{x: 16, y: 64, height: 32, width: bbox.width - 32, fill:'#fafafa', stroke: Grey, 'stroke-width':2, rx: 2, ry: 2, cursor:'pointer', display:'none', event:'button:reflow'},
                'reflow-text':{refX: '50%', y: 85, title:'Reflow graph layout automatically', text: 'Redraw', 'cursor':'pointer', fill: Grey, 'text-anchor':'middle', 'font-weight':500, display:'none', event:'button:reflow'},
                'filters-legend':{text:'Filters/Selectors', x: 8, y: 132, width: bbox.width - 16, fill: LightGrey, 'font-weight':500, 'text-anchor':'left', display:'none', cursor: 'default', event:'element:nomove'},
            }
        });

        this.isTemplatesContainer = true;
        this.isTemplate = true;
        this.toggleableComponents = ['line', 'rect', 'separator', 'action-button', 'action-text', 'reflow-button', 'reflow-text', 'filters-legend'];
    }

    show(graph){

        if(this._show) {
            return;
        }

        this.toggleableComponents.forEach(comp => {
            this.attr( comp + '/display','initial');
        });

        const start = 140;
        let y = start;
        this.newNodesFilter(graph, y);
        y += 64;
        this.newUsersFilter(graph, y);
        y += 64;
        this.newWorkspacesFilter(graph, y);
        y += 64;
        this.newRolesFilter(graph, y);
        y += 64;
        this.newAclFilter(graph, y);
        y += 64;
        this.newActionOutputFilter(graph, y);
        y += 64;
        this.newContextMetaFilter(graph, y);

        // Reset Y
        y = start;
        this.newNodesSelector(graph, y);
        y += 64;
        this.newUsersSelector(graph, y);
        y += 64;
        this.newWorkspacesSelector(graph, y);
        y += 64;
        this.newRolesSelector(graph, y);
        y += 64;
        this.newAclSelector(graph, y);

        this._show = true;
    }

    hide(graph){

        if(!this._show) {
            return;
        }

        this.toggleableComponents.forEach(comp => {
            this.attr( comp + '/display','none');
        });

        this.modelFilter.remove();
        this.usersFilter.remove();
        this.wsFilter.remove();
        this.rolesFilter.remove();
        this.aclFilter.remove();
        this.contextMetaFilter.remove();
        this.actionOutputFilter.remove();

        this.modelSelector.remove();
        this.usersSelector.remove();
        this.wsSelector.remove();
        this.rolesSelector.remove();
        this.aclSelector.remove();

        this._show = false;
    }

    replicate(el, graph){
        if(el === this.modelFilter){
            this.newNodesFilter(graph, el.position().y);
        } else if (el === this.usersFilter){
            this.newUsersFilter(graph, el.position().y);
        } else if (el === this.wsFilter){
            this.newWorkspacesFilter(graph, el.position().y);
        } else if (el === this.rolesFilter){
            this.newRolesFilter(graph, el.position().y);
        } else if (el === this.contextMetaFilter){
            this.newContextMetaFilter(graph, el.position().y);
        } else if (el === this.actionOutputFilter){
            this.newActionOutputFilter(graph, el.position().y);
        } else if (el === this.aclFilter){
            this.newAclFilter(graph, el.position().y);
        } else if(el === this.modelSelector){
            this.newNodesSelector(graph, el.position().y);
        } else if (el === this.usersSelector){
            this.newUsersSelector(graph, el.position().y);
        } else if (el === this.wsSelector){
            this.newWorkspacesSelector(graph, el.position().y);
        } else if (el === this.rolesSelector){
            this.newRolesSelector(graph, el.position().y);
        } else if (el === this.aclSelector){
            this.newAclSelector(graph, el.position().y);
        }
    }

    newNodesFilter(graph, y){
        this.modelFilter = new Filter(JobsNodesSelector.constructFromObject({}));
        this.modelFilter.position(0, y);
        this.modelFilter.isTemplate = true;
        this.modelFilter.addTo(graph);
    }

    newUsersFilter(graph, y){
        this.usersFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'User'}), 'idm');
        this.usersFilter.position(0, y);
        this.usersFilter.isTemplate = true;
        this.usersFilter.addTo(graph);
    }

    newWorkspacesFilter(graph, y){
        this.wsFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Workspace'}), 'idm');
        this.wsFilter.position(0, y);
        this.wsFilter.isTemplate = true;
        this.wsFilter.addTo(graph);
    }

    newRolesFilter(graph, y){
        this.rolesFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Role'}), 'idm');
        this.rolesFilter.position(0, y);
        this.rolesFilter.isTemplate = true;
        this.rolesFilter.addTo(graph);
    }

    newAclFilter(graph, y){
        this.aclFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Acl'}), 'idm');
        this.aclFilter.position(0, y);
        this.aclFilter.isTemplate = true;
        this.aclFilter.addTo(graph);
    }

    newNodesSelector(graph, y){
        this.modelSelector = new Selector(JobsNodesSelector.constructFromObject({All: true}));
        this.modelSelector.position(64, y);
        this.modelSelector.isTemplate = true;
        this.modelSelector.addTo(graph);
    }

    newUsersSelector(graph, y){
        this.usersSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'User', All: true}), 'idm');
        this.usersSelector.position(64, y);
        this.usersSelector.isTemplate = true;
        this.usersSelector.addTo(graph);
    }

    newWorkspacesSelector(graph, y){
        this.wsSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Workspace', All: true}), 'idm');
        this.wsSelector.position(64, y);
        this.wsSelector.isTemplate = true;
        this.wsSelector.addTo(graph);
    }

    newRolesSelector(graph, y){
        this.rolesSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Role', All: true}), 'idm');
        this.rolesSelector.position(64, y);
        this.rolesSelector.isTemplate = true;
        this.rolesSelector.addTo(graph);
    }

    newAclSelector(graph, y){
        this.aclSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Acl', All: true}), 'idm');
        this.aclSelector.position(64, y);
        this.aclSelector.isTemplate = true;
        this.aclSelector.addTo(graph);
    }

    newContextMetaFilter(graph, y) {
        this.contextMetaFilter = new Filter(JobsContextMetaFilter.constructFromObject({}),'context');
        this.contextMetaFilter.position(0, y);
        this.contextMetaFilter.isTemplate = true;
        this.contextMetaFilter.addTo(graph);
    }

    newActionOutputFilter(graph, y) {
        this.actionOutputFilter = new Filter(JobsActionOutputFilter.constructFromObject({}),'output');
        this.actionOutputFilter.position(0, y);
        this.actionOutputFilter.isTemplate = true;
        this.actionOutputFilter.addTo(graph);
    }

}

export default Templates