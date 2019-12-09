export const TOGGLE_EDITOR_MODE = "editor:toggle-edit";
export const BIND_PAPER_TO_DOM = "editor:bind-paper";
export const JOB_LOADED = "job:loaded";
export const SELECTION_CHANGE_ACTION = "selection:change";
export const SELECTION_CLEAR_ACTION = "selection:clear";

export const RESIZE_PAPER = "editor:resize-paper";

export const JOB_SWITCH_TRIGGER = "trigger:switch";

export const EMPTY_MODEL_ACTION = "model:create-empty";
export const ATTACH_MODEL_ACTION = "model:attach";
export const DETACH_MODEL_ACTION = "model:detach";
export const REMOVE_MODEL_ACTION = "model:remove";

export const DROP_FILTER_ACTION = "filter:drop";
export const REMOVE_FILTER_ACTION = "filter:remove";

export const JOB_ACTION_EMPTY = "EMPTY";

export function toggleEditAction(on = false, layout = () => {}) {
    return {
        type: TOGGLE_EDITOR_MODE,
        edit: on,
        layout
    }
}

export function bindPaperAction(element, graph, events) {
    return  {
        type: BIND_PAPER_TO_DOM,
        element: element,
        graph:graph,
        events: events
    }
}

export function resizePaperAction (width, height) {
    return  {
        type: RESIZE_PAPER,
        width,
        height
    }
}

export function emptyModelAction(model) {
    return {
        type: EMPTY_MODEL_ACTION,
        model,
    }
}

export function attachModelAction(linkView) {
    return {
        type: ATTACH_MODEL_ACTION,
        linkView,
    }
}

export function detachModelAction(linkView, toolView = null, originalTarget = null) {
    return {
        type: DETACH_MODEL_ACTION,
        linkView,
        toolView,
        originalTarget
    }
}

export function dropFilterAction(target, dropped, filterOrSelector, objectType) {
    return {
        type: DROP_FILTER_ACTION,
        target,
        dropped,
        filterOrSelector,
        objectType
    }
}

export function removeFilterAction(target, filter, filterOrSelector, objectType) {
    return {
        type: REMOVE_FILTER_ACTION,
        target,
        filter,
        filterOrSelector,
        objectType
    }
}

export function jobLoadedAction(job) {
    return {
        type: JOB_LOADED,
        job,
    }
}

export function removeModelAction(model, parentModel) {
    return{
        type: REMOVE_MODEL_ACTION,
        model,
        parentModel
    }
}

export function changeTriggerAction(triggerType, triggerData){
    return {
        type: JOB_SWITCH_TRIGGER,
        triggerType,
        triggerData
    }
}

export function setSelectionAction(selectionType, selectionModel) {
    return {
        type: SELECTION_CHANGE_ACTION,
        selectionType,
        selectionModel
    }
}

export function clearSelectionAction(){
    return {
        type: SELECTION_CLEAR_ACTION
    }
}