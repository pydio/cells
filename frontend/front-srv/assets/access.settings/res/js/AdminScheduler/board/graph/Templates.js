import {shapes} from 'jointjs'
import Filter from "./Filter";
import {Blue, Grey, LightGrey} from "./Configs";
import {
    JobsActionOutputFilter,
    JobsContextMetaFilter,
    JobsIdmSelector,
    JobsNodesSelector,
    JobsUsersSelector
} from 'pydio/http/rest-api';
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
                {tagName:'line',selector: 'separator1'},
                {tagName:'rect',selector: 'action-button'},
                {tagName:'text',selector: 'action-text'},
                {tagName:'rect',selector: 'reflow-button'},
                {tagName:'text',selector: 'reflow-text'},
                {tagName:'text',selector: 'filters-legend'},
                {tagName:'text',selector: 'selectors-legend'},
            ],
            size:{...bbox},
            attrs:{
                rect:{refX:0, refY:0, ...bbox, fill: '#fafafa', display:'none', cursor:'default', event:'element:nomove'},
                line:{x1:bbox.width, y1:0, x2:bbox.width, y2: bbox.height, stroke:LightGrey, 'stroke-width':1, display:'none', event:'element:nomove'},
                separator:{x1:0, y1:112, x2:bbox.width, y2: 112, stroke:LightGrey, 'stroke-width':1, display:'none', event:'element:nomove'},
                separator1:{x1:0, y1:386, x2:bbox.width, y2: 386, stroke:LightGrey, 'stroke-width':1, display:'none', event:'element:nomove'},
                'action-button':{x: 16, y: 16, height: 32, width: bbox.width - 32, fill:'#fafafa', stroke: Blue, 'stroke-width':2, rx: 2, ry: 2, cursor:'pointer', display:'none', event:'button:create-action'},
                'action-text':{refX: '50%', y: 36, text: 'Create Action', 'cursor':'pointer', fill: Blue, 'text-anchor':'middle', 'font-weight':500, display:'none', event:'button:create-action'},
                'reflow-button':{x: 16, y: 64, height: 32, width: bbox.width - 32, fill:'#fafafa', stroke: Grey, 'stroke-width':2, rx: 2, ry: 2, cursor:'pointer', display:'none', event:'button:reflow'},
                'reflow-text':{refX: '50%', y: 85, title:'Reflow graph layout automatically', text: 'Redraw', 'cursor':'pointer', fill: Grey, 'text-anchor':'middle', 'font-weight':500, display:'none', event:'button:reflow'},
                'filters-legend':{text:'Filters/Conditions', x: 8, y: 132, width: bbox.width - 16, fill: Grey, 'font-weight':500, 'text-anchor':'left', display:'none', cursor: 'default', event:'element:nomove'},
                'selectors-legend':{text:'Data Selectors', x: 8, y: 406, width: bbox.width - 16, fill: Grey, 'font-weight':500, 'text-anchor':'left', display:'none', cursor: 'default', event:'element:nomove'},
            }
        });

        this.isTemplatesContainer = true;
        this.isTemplate = true;
        this.toggleableComponents = ['line', 'rect', 'separator', 'separator1', 'action-button', 'action-text', 'reflow-button', 'reflow-text', 'filters-legend', 'selectors-legend'];
    }

    show(graph){

        if(this._show) {
            return;
        }

        this.toggleableComponents.forEach(comp => {
            this.attr( comp + '/display','initial');
        });

        const start = 140;
        const col1 = 4;
        const col2 = 60;
        const edgeY = 60;
        let y = start;
        this.newNodesFilter(graph, col1, y);
        this.newUsersFilter(graph, col2, y);
        y += edgeY;
        this.newWorkspacesFilter(graph,col1, y);
        this.newRolesFilter(graph, col2, y);
        y += edgeY;
        this.newAclFilter(graph, col1, y);
        this.newContextMetaFilter(graph, col2, y);
        y += edgeY;
        this.newActionOutputFilter(graph, col1, y);

        y += edgeY + 34;
        this.newNodesSelector(graph, col1, y);
        this.newUsersSelector(graph,col2, y);
        y += edgeY;
        this.newWorkspacesSelector(graph, col1, y);
        this.newRolesSelector(graph, col2, y);
        y += edgeY;
        this.newAclSelector(graph, col1, y);

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
        const {x, y} = el.position();
        if(el === this.modelFilter){
            this.newNodesFilter(graph, x, y);
        } else if (el === this.usersFilter){
            this.newUsersFilter(graph, x, y);
        } else if (el === this.wsFilter){
            this.newWorkspacesFilter(graph, x, y);
        } else if (el === this.rolesFilter){
            this.newRolesFilter(graph, x, y);
        } else if (el === this.contextMetaFilter){
            this.newContextMetaFilter(graph, x, y);
        } else if (el === this.actionOutputFilter){
            this.newActionOutputFilter(graph, x, y);
        } else if (el === this.aclFilter){
            this.newAclFilter(graph, x, y);
        } else if(el === this.modelSelector){
            this.newNodesSelector(graph, x, y);
        } else if (el === this.usersSelector){
            this.newUsersSelector(graph, x, y);
        } else if (el === this.wsSelector){
            this.newWorkspacesSelector(graph, x, y);
        } else if (el === this.rolesSelector){
            this.newRolesSelector(graph, x, y);
        } else if (el === this.aclSelector){
            this.newAclSelector(graph, x, y);
        }
    }

    newNodesFilter(graph, x, y){
        this.modelFilter = new Filter(JobsNodesSelector.constructFromObject({}));
        this.modelFilter.position(x, y);
        this.modelFilter.isTemplate = true;
        this.modelFilter.addTo(graph);
    }

    newUsersFilter(graph, x, y){
        this.usersFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'User'}), 'idm');
        this.usersFilter.position(x, y);
        this.usersFilter.isTemplate = true;
        this.usersFilter.addTo(graph);
    }

    newWorkspacesFilter(graph, x, y){
        this.wsFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Workspace'}), 'idm');
        this.wsFilter.position(x, y);
        this.wsFilter.isTemplate = true;
        this.wsFilter.addTo(graph);
    }

    newRolesFilter(graph, x, y){
        this.rolesFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Role'}), 'idm');
        this.rolesFilter.position(x, y);
        this.rolesFilter.isTemplate = true;
        this.rolesFilter.addTo(graph);
    }

    newAclFilter(graph, x, y){
        this.aclFilter = new Filter(JobsIdmSelector.constructFromObject({Type:'Acl'}), 'idm');
        this.aclFilter.position(x, y);
        this.aclFilter.isTemplate = true;
        this.aclFilter.addTo(graph);
    }

    newNodesSelector(graph, x, y){
        this.modelSelector = new Selector(JobsNodesSelector.constructFromObject({All: true}));
        this.modelSelector.position(x, y);
        this.modelSelector.isTemplate = true;
        this.modelSelector.addTo(graph);
    }

    newUsersSelector(graph, x, y){
        this.usersSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'User', All: true}), 'idm');
        this.usersSelector.position(x, y);
        this.usersSelector.isTemplate = true;
        this.usersSelector.addTo(graph);
    }

    newWorkspacesSelector(graph, x, y){
        this.wsSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Workspace', All: true}), 'idm');
        this.wsSelector.position(x, y);
        this.wsSelector.isTemplate = true;
        this.wsSelector.addTo(graph);
    }

    newRolesSelector(graph, x, y){
        this.rolesSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Role', All: true}), 'idm');
        this.rolesSelector.position(x, y);
        this.rolesSelector.isTemplate = true;
        this.rolesSelector.addTo(graph);
    }

    newAclSelector(graph, x, y){
        this.aclSelector = new Selector(JobsIdmSelector.constructFromObject({Type:'Acl', All: true}), 'idm');
        this.aclSelector.position(x, y);
        this.aclSelector.isTemplate = true;
        this.aclSelector.addTo(graph);
    }

    newContextMetaFilter(graph, x, y) {
        this.contextMetaFilter = new Filter(JobsContextMetaFilter.constructFromObject({}),'context');
        this.contextMetaFilter.position(x, y);
        this.contextMetaFilter.isTemplate = true;
        this.contextMetaFilter.addTo(graph);
    }

    newActionOutputFilter(graph, x, y) {
        this.actionOutputFilter = new Filter(JobsActionOutputFilter.constructFromObject({}),'output');
        this.actionOutputFilter.position(x, y);
        this.actionOutputFilter.isTemplate = true;
        this.actionOutputFilter.addTo(graph);
    }

}

export default Templates