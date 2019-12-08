"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toggleEditAction = toggleEditAction;
exports.bindPaperAction = bindPaperAction;
exports.resizePaperAction = resizePaperAction;
exports.emptyModelAction = emptyModelAction;
exports.attachModelAction = attachModelAction;
exports.detachModelAction = detachModelAction;
exports.jobLoadedAction = jobLoadedAction;
exports.removeModelAction = removeModelAction;
var TOGGLE_EDITOR_MODE = "editor:toggle-edit";
exports.TOGGLE_EDITOR_MODE = TOGGLE_EDITOR_MODE;
var BIND_PAPER_TO_DOM = "editor:bind-paper";
exports.BIND_PAPER_TO_DOM = BIND_PAPER_TO_DOM;
var JOB_LOADED = "job:loaded";
exports.JOB_LOADED = JOB_LOADED;
var RESIZE_PAPER = "editor:resize-paper";

exports.RESIZE_PAPER = RESIZE_PAPER;
var EMPTY_MODEL_ACTION = "model:create-empty";
exports.EMPTY_MODEL_ACTION = EMPTY_MODEL_ACTION;
var ATTACH_MODEL_ACTION = "model:attach";
exports.ATTACH_MODEL_ACTION = ATTACH_MODEL_ACTION;
var DETACH_MODEL_ACTION = "model:detach";
exports.DETACH_MODEL_ACTION = DETACH_MODEL_ACTION;
var REMOVE_MODEL_ACTION = "model:remove";

exports.REMOVE_MODEL_ACTION = REMOVE_MODEL_ACTION;
var JOB_ACTION_EMPTY = "EMPTY";

exports.JOB_ACTION_EMPTY = JOB_ACTION_EMPTY;

function toggleEditAction() {
    var on = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    return {
        type: TOGGLE_EDITOR_MODE,
        edit: on
    };
}

function bindPaperAction(element, graph, events) {
    return {
        type: BIND_PAPER_TO_DOM,
        element: element,
        graph: graph,
        events: events
    };
}

function resizePaperAction(width, height) {
    return {
        type: RESIZE_PAPER,
        width: width,
        height: height
    };
}

function emptyModelAction(model) {
    return {
        type: EMPTY_MODEL_ACTION,
        model: model
    };
}

function attachModelAction(linkView) {
    return {
        type: ATTACH_MODEL_ACTION,
        linkView: linkView
    };
}

function detachModelAction(linkView) {
    var toolView = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var originalTarget = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    return {
        type: DETACH_MODEL_ACTION,
        linkView: linkView,
        toolView: toolView,
        originalTarget: originalTarget
    };
}

function jobLoadedAction(job) {
    return {
        type: JOB_LOADED,
        job: job
    };
}

function removeModelAction(model, parentModel) {
    return {
        type: REMOVE_MODEL_ACTION,
        model: model,
        parentModel: parentModel
    };
}
