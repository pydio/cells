
import React from 'react'
import ReactDOM from 'react-dom'
import PydioApi from 'pydio/http/api'
import {ConfigServiceApi, RestConfiguration} from 'pydio/http/rest-api'
import {dia, layout, shapes} from 'jointjs'
import JobInput from './graph/JobInput'
import Filter from "./graph/Filter";
import Link from "./graph/Link";
import Action from "./graph/Action";
import {ClusterConfig, Orange} from "./graph/Configs";
import dagre from 'dagre'
import graphlib from 'graphlib'
import Selector from "./graph/Selector";
import {Paper} from 'material-ui'
import FormPanel from "./builder/FormPanel";
import QueryBuilder from "./builder/QueryBuilder";
import {Events, Schedule} from "./builder/Triggers";

const style = `
text[joint-selector="icon"] tspan {
    font: normal normal normal 24px/1 "Material Design Icons";
    font-size: 24px;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
}
`;

class JobGraph extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
        this.graph = new dia.Graph();
    }

    componentDidMount(){
        this.loadDescriptions();
    }

    loadDescriptions() {
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.schedulerActionsDiscovery().then(data => {
            // Draw now!
            this.setState({descriptions: data.Actions}, () => {
                const bbox = this.graphFromJob();
                this.setState(bbox, ()=> {
                    this.drawGraph();
                });
            });
        }).catch(() => {
            const bbox = this.graphFromJob();
            this.setState(bbox, ()=> {
                this.drawGraph();
            });
        })
    }

    chainActions(graph, actions, inputId, hasData = true) {
        const {descriptions} = this.state;
        actions.forEach(action => {
            let crtInput = inputId;
            const hasChain = (action.ChainedActions && action.ChainedActions.length);
            const filter = action.NodesFilter || action.IdmFilter || action.UsersFilter;
            const selector = action.NodesSelector || action.IdmSelector || action.UsersSelector;
            let cluster;
            if (filter || selector) {
                cluster = new shapes.basic.Rect(ClusterConfig);
                cluster.addTo(graph);
                let filterShape;
                if(filter){
                    filterShape = new Filter(filter, action.NodesFilter?'node':(action.UsersFilter?'user':'idm'));
                } else {
                    filterShape = new Selector(selector, action.NodesSelector?'node':(action.UsersSelector?'user':'idm'));
                }
                filterShape.addTo(graph);
                cluster.embed(filterShape);
                const link = new Link(crtInput, 'output', filterShape.id, 'input', hasData);
                link.addTo(graph);
                crtInput = filterShape.id;
                hasData = true;
            }
            const shape = new Action(descriptions, action, hasChain);
            shape.addTo(graph);
            if(cluster){
                cluster.embed(shape);
            }
            const link = new Link(crtInput, 'output', shape.id, 'input', hasData);
            link.addTo(graph);
            if (hasChain) {
                this.chainActions(graph, action.ChainedActions, shape.id);
            }
        });

    }

    graphFromJob(){
        const {job} = this.props;
        if(!job || !job.Actions || !job.Actions.length){
            return {width: 0, height: 0};
        }
        // cluster trigger with filter: add cluster before the others
        let cluster;
        if (job.NodeEventFilter || job.UserEventFilter || job.IdmFilter){
            cluster = new shapes.basic.Rect(ClusterConfig);
            cluster.addTo(this.graph);
        }

        const shapeIn = new JobInput(job);
        shapeIn.addTo(this.graph);

        let actionsInput = shapeIn.id;
        let firstLinkHasData = !!job.EventNames;

        if (job.NodeEventFilter || job.UserEventFilter || job.IdmFilter) {

            let filterType;
            if(job.NodeEventFilter){
                filterType = 'node';
            } else if (job.UserEventFilter) {
                filterType = 'user';
            } else {
                filterType = 'idm';
            }
            const filter = new Filter(job.NodeEventFilter || job.UserEventFilter || job.IdmFilter, filterType);
            filter.addTo(this.graph);

            cluster.embed(shapeIn);
            cluster.embed(filter);

            const fLink = new Link(actionsInput, 'output', filter.id, 'input', firstLinkHasData);
            fLink.addTo(this.graph);

            firstLinkHasData = true;
            actionsInput = filter.id;
        }

        this.chainActions(this.graph, job.Actions, actionsInput, firstLinkHasData);
        // Relayout graph and return bounding box
        return layout.DirectedGraph.layout(this.graph, {
            nodeSep: 30,
            edgeSep: 30,
            rankSep: 80,
            rankDir: "LR",
            marginX: 40,
            marginY: 40,
            clusterPadding: 20,
            dagre,
            graphlib
        });
    }

    clearSelection(){
        if(this._selection){
            this._selection.attr('rect/stroke', this._selectionStrokeOrigin);
        }
        this.setState({
            selection: null,
            selectionType: null
        });
    }

    select(model){
        this._selection = model;
        this._selectionStrokeOrigin = this._selection.attr('rect/stroke');
        this._selection.attr('rect/stroke', Orange);
        const s = {
            position:model.position(),
            size: model.size(),
            scrollLeft: ReactDOM.findDOMNode(this.refs.scroller).scrollLeft || 0
        };
        if (model instanceof Action) {
            s.selection = model.getJobsAction();
            s.selectionType = 'action';
        } else if (model instanceof Selector) {
            s.selection = model.getSelector();
            s.selectionType = 'selector'
        } else if (model instanceof Filter) {
            s.selection = model.getFilter();
            s.selectionType = 'filter'
        } else if( model instanceof JobInput && model.getInputType() === 'event') {
            s.selection = model.getEventNames();
            s.selectionType = 'events';
        } else if( model instanceof JobInput && model.getInputType() === 'schedule') {
            s.selection = model.getSchedule();
            s.selectionType = 'schedule';
        }
        this.setState(s);
    }

    drawGraph() {
        const {width, height} = this.state;
        this.paper = new dia.Paper({
            el: ReactDOM.findDOMNode(this.refs.placeholder),
            width: width + 80,
            height: height + 80,
            model: this.graph,
            interactive: {
                addLinkFromMagnet: false,
                useLinkTools: false,
                elementMove: true
            }
        });
        this.paper.on('element:pointerdown', (el, event) => {
            console.log(el, event);
            if(el.model instanceof Action || el.model instanceof Selector || el.model instanceof Filter || el.model instanceof JobInput) {
                this.clearSelection();
                this.select(el.model);
            }
        })
    }

    render() {

        let selBlock;
        const {selection, selectionType, descriptions, position, size, scrollLeft} = this.state;
        const blockProps = {
            sourcePosition:position,
            sourceSize:
            size,
            scrollLeft,
            onDismiss: ()=>{this.clearSelection()}
        };
        if(selectionType === 'action' && descriptions[selection.ID]){
            const desc = descriptions[selection.ID];
            selBlock = <FormPanel actionInfo={desc} action={selection} {...blockProps} />
        } else if(selectionType === 'selector' || selectionType === 'filter') {
            selBlock =  <QueryBuilder query={selection} queryType={selectionType} {...blockProps} />
        } else if(selectionType === 'events') {
            selBlock = <Events events={selection} {...blockProps}/>
        } else if(selectionType === 'schedule') {
            selBlock = <Schedule schedule={selection} {...blockProps}/>
        }

        const headerStyle = {
            backgroundColor: 'whitesmoke',
            borderBottom: '1px solid #e0e0e0',
            height: 48,
            color: '#9e9e9e',
            fontSize: 12,
            fontWeight: 500,
            padding: '14px 24px'
        };

        return (
            <Paper zDepth={1} style={{margin: 20}}>
                <div style={headerStyle}>Job Workflow - click on boxes to show details</div>
                <div style={{position:'relative'}}>
                    <div style={{flex: 1, overflowX: 'auto'}} ref="scroller">
                        <div id="playground" ref="placeholder"></div>
                    </div>
                    {selBlock}
                </div>
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:style}}></style>
            </Paper>
        );
    }

}

export default JobGraph