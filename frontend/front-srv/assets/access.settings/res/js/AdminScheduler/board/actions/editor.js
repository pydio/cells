export const TOGGLE_EDITOR_MODE = "editor:toggle-edit";
export const BIND_PAPER_TO_DOM = "editor:bind-paper";
export const JOB_LOADED = "job:loaded";
export const RESIZE_PAPER = "editor:resize-paper";

export const EMPTY_MODEL_ACTION = "model:create-empty";
export const ATTACH_MODEL_ACTION = "model:attach";
export const DETACH_MODEL_ACTION = "model:detach";
export const REMOVE_MODEL_ACTION = "model:remove";

export const JOB_ACTION_EMPTY = "EMPTY";

export function toggleEditAction(on = false) {
    return {
        type: TOGGLE_EDITOR_MODE,
        edit: on
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