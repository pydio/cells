import {EMPTY_MODEL_ACTION, JOB_ACTION_EMPTY, TOGGLE_EDITOR_MODE} from "../actions/editor";
import Action from "../graph/Action";
import {dia, shapes} from 'jointjs'
import {JobsAction} from "pydio/http/rest-api";
import Templates from "../graph/Templates";
import JobInput from "../graph/JobInput";

function graphReducer(graph, action) {
    if(graph === undefined){
        graph = new dia.Graph();
    }
    switch (action.type) {
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

export default graphReducer