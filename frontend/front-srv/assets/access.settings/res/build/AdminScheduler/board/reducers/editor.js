"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.dirty = dirty;
exports.original = original;
exports.boundingRef = boundingRef;
exports.descriptions = descriptions;

var _actionsEditor = require("../actions/editor");

var _pydioHttpRestApi = require("pydio/http/rest-api");

function editor(state, action) {
    if (state === undefined) state = false;

    switch (action.type) {
        case _actionsEditor.TOGGLE_EDITOR_MODE:
            return !state;
        default:
            return state;
    }
}

function dirty(state, action) {
    if (state === undefined) state = false;

    switch (action.type) {
        case _actionsEditor.EDITOR_SET_DIRTY:
            return action.dirty;
        case _actionsEditor.EDITOR_SAVE_SUCCESS:
            return false;
        case _actionsEditor.EDITOR_SAVE_ERROR:
            return true;
        default:
            return state;
    }
}

function original(state, action) {
    if (state === undefined) state = null;

    switch (action.type) {
        case _actionsEditor.EDITOR_SAVE_SUCCESS:
            return _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(action.job)));
        default:
            return state;
    }
}

function boundingRef(state, action) {
    if (state === undefined) state = null;

    switch (action.type) {
        case _actionsEditor.EDITOR_SET_BOUNDING_REF:
            return action.boundingRef;
        default:
            return state;
    }
}

function descriptions(state, action) {
    if (state === undefined) state = {};

    switch (action.type) {
        case _actionsEditor.EDITOR_ACTIONS_DESCRIPTIONS:
            return action.descriptions;
        default:
            return state;
    }
}

exports["default"] = editor;
