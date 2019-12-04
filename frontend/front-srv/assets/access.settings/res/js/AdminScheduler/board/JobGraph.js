
import React from 'react'
import ReactDOM from 'react-dom'
import {dia, layout} from 'jointjs'
import JobInput from './graph/JobInput'
import Filter from "./graph/Filter";
import Link from "./graph/Link";
import Action from "./graph/Action";
import {Orange} from "./graph/Configs";
import dagre from 'dagre'
import graphlib from 'graphlib'
import Selector from "./graph/Selector";

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
        this.graph = new dia.Graph();
        this.state = this.graphFromJob();
    }

    chainActions(graph, actions, inputId, hasData = true) {
        actions.forEach(action => {
            let crtInput = inputId;
            const hasChain = (action.ChainedActions && action.ChainedActions.length);
            const filter = action.NodesFilter || action.IdmFilter || action.UsersFilter;
            const selector = action.NodesSelector || action.IdmSelector || action.UsersSelector;
            if (filter || selector) {
                let filterShape;
                if(filter){
                    filterShape = new Filter(filter, action.NodesFilter?'node':(action.UsersFilter?'user':'idm'));
                } else {
                    filterShape = new Selector(selector, action.NodesSelector?'node':(action.UsersSelector?'user':'idm'));
                }
                filterShape.addTo(graph);
                const link = new Link(crtInput, 'output', filterShape.id, 'input', hasData);
                link.addTo(graph);
                crtInput = filterShape.id;
                hasData = true;
            }
            const shape = new Action(action, hasChain);
            shape.addTo(graph);
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
            dagre,
            graphlib
        });
    }

    componentDidMount() {
        const {width, height} = this.state;
        this.paper = new dia.Paper({
            el: ReactDOM.findDOMNode(this.refs.placeholder),
            width: width + 80,
            height: height + 80,
            model: this.graph,
            highlighting: {
                'default': {
                    name: 'stroke',
                    options: {
                        padding: 3
                    }
                },
                connecting: {
                    name: 'addClass',
                    options: {
                        className: 'highlight-connecting'
                    }
                }
            }
        });
        this.paper.on('element:pointerdown', (el) => {
            if(this._selection){
                this._selection.attr('rect/stroke', this._selectionStrokeOrigin);
            }
            this._selection = el.model;
            this._selectionStrokeOrigin = this._selection.attr('rect/stroke');
            this._selection.attr('rect/stroke', Orange);
        })
    }

    render() {

        return (
            <div style={{width: '100%', overflowX: 'auto'}}>
                <div id="playground" ref="placeholder"></div>
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:style}}></style>
            </div>
        );
    }

}

export default JobGraph