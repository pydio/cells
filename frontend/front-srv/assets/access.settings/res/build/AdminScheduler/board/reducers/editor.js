"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _actionsEditor = require("../actions/editor");

function editor(state, action) {
    if (state === undefined) state = false;

    switch (action.type) {
        case _actionsEditor.TOGGLE_EDITOR_MODE:
            return !state;
        default:
            return state;
    }
}

exports["default"] = editor;
module.exports = exports["default"];
