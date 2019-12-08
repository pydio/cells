import {EMPTY_MODEL_ACTION, JOB_ACTION_EMPTY, TOGGLE_EDITOR_MODE} from "../actions/editor";
import Action from "../graph/Action";
import {dia, shapes} from 'jointjs'
import {JobsAction} from "pydio/http/rest-api";

function graphReducer(graph, action) {
    if(graph === undefined){
        graph = new dia.Graph();
        graph.on('remove', (cell) => {
            console.log(cell);
        });
    }
    switch (action.type) {
        case TOGGLE_EDITOR_MODE:
            graph.getCells().filter(a => a.isElement()).forEach(a => {
                if(!action.edit) {
                    // Not connected boxes on close
                    console.log(a.graph.getConnectedLinks(a));
                    if(a.graph.getConnectedLinks(a).length === 0) {
                        a.remove();
                        return;
                    }
                }
                if(a instanceof Action){
                    a.toggleEdit();
                }
            });
            return graph;
        case EMPTY_MODEL_ACTION:
            const {model} = action;
            model.addTo(graph);
            return graph;
        default:
            return graph;
    }
}

export default graphReducer