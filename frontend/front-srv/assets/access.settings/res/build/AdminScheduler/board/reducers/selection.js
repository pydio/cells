"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = selectionReducer;

var _actionsEditor = require("../actions/editor");

function selectionReducer(selection, action) {
    if (selection === undefined) selection = {};

    switch (action.type) {
        case _actionsEditor.SELECTION_CLEAR_ACTION:
            return {};
        case _actionsEditor.SELECTION_CHANGE_ACTION:
            return { type: action.selectionType, model: action.selectionModel };
    }
}

module.exports = exports["default"];
