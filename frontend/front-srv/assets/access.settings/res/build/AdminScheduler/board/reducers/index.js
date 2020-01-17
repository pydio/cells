"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _editor = require('./editor');

var _editor2 = _interopRequireDefault(_editor);

var _graph = require("./graph");

var _paper = require("./paper");

var _paper2 = _interopRequireDefault(_paper);

var _job = require('./job');

var _job2 = _interopRequireDefault(_job);

var _redux = require('redux');

var allReducers = (0, _redux.combineReducers)({
    editMode: _editor2["default"],
    graph: _graph.graphReducer,
    paper: _paper2["default"],
    job: _job2["default"],
    dirty: _editor.dirty,
    boundingRef: _editor.boundingRef,
    bbox: _graph.layoutReducer,
    descriptions: _editor.descriptions,
    original: _editor.original,
    createLinkTool: function createLinkTool(s, a) {
        return s || null;
    } // identity
});

exports["default"] = allReducers;
module.exports = exports["default"];
