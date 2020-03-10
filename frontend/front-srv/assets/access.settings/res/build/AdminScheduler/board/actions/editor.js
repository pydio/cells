"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toggleEditAction = toggleEditAction;
exports.attachBoundingRefAction = attachBoundingRefAction;
exports.attachDescriptions = attachDescriptions;
exports.requireLayoutAction = requireLayoutAction;
exports.bindPaperAction = bindPaperAction;
exports.resizePaperAction = resizePaperAction;
exports.emptyModelAction = emptyModelAction;
exports.attachModelAction = attachModelAction;
exports.detachModelAction = detachModelAction;
exports.dropFilterAction = dropFilterAction;
exports.removeFilterAction = removeFilterAction;
exports.toggleFilterAsConditionAction = toggleFilterAsConditionAction;
exports.jobChangedAction = jobChangedAction;
exports.removeModelAction = removeModelAction;
exports.changeTriggerAction = changeTriggerAction;
exports.updateLabelAction = updateLabelAction;
exports.updateJobPropertyAction = updateJobPropertyAction;
exports.setSelectionAction = setSelectionAction;
exports.clearSelectionAction = clearSelectionAction;
exports.setDirtyAction = setDirtyAction;
exports.saveSuccessAction = saveSuccessAction;
exports.saveErrorAction = saveErrorAction;
exports.revertAction = revertAction;
var TOGGLE_EDITOR_MODE = "editor:toggle-edit";
exports.TOGGLE_EDITOR_MODE = TOGGLE_EDITOR_MODE;
var EDITOR_SET_DIRTY = "editor:set-dirty";
exports.EDITOR_SET_DIRTY = EDITOR_SET_DIRTY;
var EDITOR_SAVE_SUCCESS = "editor:save";
exports.EDITOR_SAVE_SUCCESS = EDITOR_SAVE_SUCCESS;
var EDITOR_SAVE_ERROR = "editor:save";
exports.EDITOR_SAVE_ERROR = EDITOR_SAVE_ERROR;
var EDITOR_REVERT = "editor:revert";
exports.EDITOR_REVERT = EDITOR_REVERT;
var EDITOR_SET_BOUNDING_REF = "editor:boundingRef";
exports.EDITOR_SET_BOUNDING_REF = EDITOR_SET_BOUNDING_REF;
var EDITOR_ACTIONS_DESCRIPTIONS = "editor:descriptions";

exports.EDITOR_ACTIONS_DESCRIPTIONS = EDITOR_ACTIONS_DESCRIPTIONS;
var BIND_PAPER_TO_DOM = "editor:bind-paper";
exports.BIND_PAPER_TO_DOM = BIND_PAPER_TO_DOM;
var SELECTION_CHANGE_ACTION = "selection:change";
exports.SELECTION_CHANGE_ACTION = SELECTION_CHANGE_ACTION;
var SELECTION_CLEAR_ACTION = "selection:clear";
exports.SELECTION_CLEAR_ACTION = SELECTION_CLEAR_ACTION;
var RESIZE_PAPER = "editor:resize-paper";
exports.RESIZE_PAPER = RESIZE_PAPER;
var REQUIRE_LAYOUT = "editor:require-layout";

exports.REQUIRE_LAYOUT = REQUIRE_LAYOUT;
var JOB_CHANGED = "job:changed";
exports.JOB_CHANGED = JOB_CHANGED;
var JOB_SWITCH_TRIGGER = "trigger:switch";
exports.JOB_SWITCH_TRIGGER = JOB_SWITCH_TRIGGER;
var JOB_UPDATE_LABEL = "job:label";
exports.JOB_UPDATE_LABEL = JOB_UPDATE_LABEL;
var JOB_UPDATE_PROPERTY = "job:property";

exports.JOB_UPDATE_PROPERTY = JOB_UPDATE_PROPERTY;
var EMPTY_MODEL_ACTION = "model:create-empty";
exports.EMPTY_MODEL_ACTION = EMPTY_MODEL_ACTION;
var ATTACH_MODEL_ACTION = "model:attach";
exports.ATTACH_MODEL_ACTION = ATTACH_MODEL_ACTION;
var DETACH_MODEL_ACTION = "model:detach";
exports.DETACH_MODEL_ACTION = DETACH_MODEL_ACTION;
var REMOVE_MODEL_ACTION = "model:remove";

exports.REMOVE_MODEL_ACTION = REMOVE_MODEL_ACTION;
var DROP_FILTER_ACTION = "filter:drop";
exports.DROP_FILTER_ACTION = DROP_FILTER_ACTION;
var REMOVE_FILTER_ACTION = "filter:remove";
exports.REMOVE_FILTER_ACTION = REMOVE_FILTER_ACTION;
var TOGGLE_FILTER_AS_CONDITION = "filter:condition";

exports.TOGGLE_FILTER_AS_CONDITION = TOGGLE_FILTER_AS_CONDITION;
var JOB_ACTION_EMPTY = "EMPTY";

exports.JOB_ACTION_EMPTY = JOB_ACTION_EMPTY;

function toggleEditAction() {
    var on = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
    var layout = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    return {
        type: TOGGLE_EDITOR_MODE,
        edit: on,
        layout: layout
    };
}

function attachBoundingRefAction(element) {
    return {
        type: EDITOR_SET_BOUNDING_REF,
        boundingRef: element
    };
}

function attachDescriptions(descriptions) {
    return {
        type: EDITOR_ACTIONS_DESCRIPTIONS,
        descriptions: descriptions
    };
}

function requireLayoutAction(graph, boundingRef, editMode, paper, createLinkTool) {
    return {
        type: REQUIRE_LAYOUT,
        graph: graph, boundingRef: boundingRef, editMode: editMode, paper: paper, createLinkTool: createLinkTool
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

function dropFilterAction(target, dropped, filterOrSelector, objectType) {
    return {
        type: DROP_FILTER_ACTION,
        target: target,
        dropped: dropped,
        filterOrSelector: filterOrSelector,
        objectType: objectType
    };
}

function removeFilterAction(target, filter, filterOrSelector, objectType) {
    return {
        type: REMOVE_FILTER_ACTION,
        target: target,
        filter: filter,
        filterOrSelector: filterOrSelector,
        objectType: objectType
    };
}

function toggleFilterAsConditionAction(toggle, action) {
    return {
        type: TOGGLE_FILTER_AS_CONDITION,
        toggle: toggle,
        action: action
    };
}

function jobChangedAction(job, descriptions, editMode) {
    return {
        type: JOB_CHANGED,
        job: job, descriptions: descriptions, editMode: editMode
    };
}

function removeModelAction(model, parentModel, removeFilter) {
    return {
        type: REMOVE_MODEL_ACTION,
        model: model,
        parentModel: parentModel,
        removeFilter: removeFilter
    };
}

function changeTriggerAction(triggerType, triggerData) {
    return {
        type: JOB_SWITCH_TRIGGER,
        triggerType: triggerType,
        triggerData: triggerData
    };
}

function updateLabelAction(newLabel) {
    return {
        type: JOB_UPDATE_LABEL,
        label: newLabel
    };
}

function updateJobPropertyAction(propertyName, propertyValue) {
    return {
        type: JOB_UPDATE_PROPERTY,
        propertyName: propertyName,
        propertyValue: propertyValue
    };
}

function setSelectionAction(selectionType, selectionModel) {
    return {
        type: SELECTION_CHANGE_ACTION,
        selectionType: selectionType,
        selectionModel: selectionModel
    };
}

function clearSelectionAction() {
    return {
        type: SELECTION_CLEAR_ACTION
    };
}

function setDirtyAction() {
    var dirty = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    return {
        type: EDITOR_SET_DIRTY,
        dirty: dirty
    };
}

function saveSuccessAction(job) {
    return {
        type: EDITOR_SAVE_SUCCESS,
        job: job
    };
}

function saveErrorAction(job) {
    return {
        type: EDITOR_SAVE_ERROR,
        job: job
    };
}

function revertAction(original) {
    return {
        type: EDITOR_REVERT, original: original
    };
}
