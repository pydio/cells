import {EMPTY_MODEL_ACTION, JOB_ACTION_EMPTY, JOB_CHANGED, REQUIRE_LAYOUT, TOGGLE_EDITOR_MODE} from "../actions/editor";
import Action from "../graph/Action";
import {dia, layout, shapes} from 'jointjs'
import Templates from "../graph/Templates";
import JobInput from "../graph/JobInput";
import Link from "../graph/Link";
import JobGraph from "../JobGraph";
import {JobsAction} from "pydio/http/rest-api";
import dagre from "dagre";
import graphlib from "graphlib";

function chainActions(descriptions, graph, actions, inputId, outputPort='output', hasData = true) {
    actions.forEach(action => {
        let crtInput = inputId;
        const hasChain = (action.ChainedActions && action.ChainedActions.length);
        const hasNegate = (action.FailedFilterActions && action.FailedFilterActions.length);
        const shape = new Action(descriptions, action, hasChain);
        shape.addTo(graph);
        const filter = shape.getActionFilter();
        let link;
        if(filter){
            filter.addTo(graph);
            link = new Link(crtInput, outputPort, filter.id, 'input', hasData);
            link.addTo(graph);
            const filterToAction = new Link(filter.id, 'output', shape.id, 'input', hasData);
            filterToAction.addTo(graph);
        } else {
            link = new Link(crtInput, outputPort, shape.id, 'input', hasData);
            link.addTo(graph);
        }
        if (hasChain) {
            chainActions(descriptions, graph, action.ChainedActions, shape.id, 'output');
        }
        if (filter && hasNegate) {
            chainActions(descriptions, graph, action.FailedFilterActions, filter.id, 'negate');
        }
    });
}

const editWindowHeight = 600;

function layoutReducer(state = {}, action){

    switch (action.type) {

        case REQUIRE_LAYOUT:
            const {paper, createLinkTool, graph, boundingRef, editMode} = action;
            // Relayout graph and return bounding box
            const inputs = graph.getCells().filter(c => !c.isTemplate);
            const bbox = layout.DirectedGraph.layout(inputs, {
                nodeSep: 48,
                edgeSep: 48,
                rankSep: 128,
                rankDir: "LR",
                marginX: editMode ? 160 : 32,
                marginY: 32,
                dagre,
                graphlib
            });
            bbox.width += 80;
            bbox.height+= 80;
            if (editMode) {
                bbox.height = Math.max(editWindowHeight, bbox.height);
                bbox.width += 200;
                if(boundingRef){
                    const maxWidth = boundingRef.clientWidth;
                    bbox.width = Math.max(bbox.width, maxWidth);
                }
            }

            if(paper){
                graph.getLinks().forEach(l => {
                    const linkView = l.findView(paper);
                    if(!linkView.hasTools()){
                        linkView.addTools(new dia.ToolsView({tools:[createLinkTool()]}));
                        if(!editMode){
                            linkView.hideTools();
                        }
                    }
                });
            }

            return bbox;
        default:
            return state;
    }

}


function graphReducer(graph, action) {
    if(graph === undefined){
        graph = new dia.Graph();
    }
    switch (action.type) {

        case JOB_CHANGED:
            const {job, descriptions} = action;

            graph.getCells().filter(c => !c.isTemplate).forEach(c => c.remove());

            const shapeIn = new JobInput(job);
            shapeIn.addTo(graph);

            if(!job || !job.Actions || !job.Actions.length){
                return graph;
            }

            let actionsInput = shapeIn.id;
            let firstLinkHasData = JobGraph.jobInputCreatesData(job);

            chainActions(descriptions, graph, job.Actions, actionsInput, 'output', firstLinkHasData);

            return graph;

        case TOGGLE_EDITOR_MODE:
            graph.getCells().filter(a => a.isElement()).forEach(a => {
                if(a instanceof Templates){
                    if(action.edit){
                        a.show(graph);
                    } else {
                        a.hide(graph);
                    }
                    return;
                }
                if(a instanceof Action){
                    a.toggleEdit();
                }
                if(!action.edit && !a.isTemplate && !a instanceof JobInput) {
                    if(a.graph.getConnectedLinks(a).length === 0) {
                        a.remove();
                    }
                }
            });
            if(action.layout){
                action.layout(action.edit);
            }
            return graph;
        case EMPTY_MODEL_ACTION:
            const {model} = action;
            model.position(160, 200);
            model.addTo(graph);
            return graph;
        default:
            return graph;
    }
}

export {graphReducer, layoutReducer}