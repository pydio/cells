'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _editor = require('./editor');

var _editor2 = _interopRequireDefault(_editor);

var _graph = require('./graph');

var _graph2 = _interopRequireDefault(_graph);

var _paper = require("./paper");

var _paper2 = _interopRequireDefault(_paper);

var _job = require('./job');

var _job2 = _interopRequireDefault(_job);

var _redux = require('redux');

var allReducers = (0, _redux.combineReducers)({
    editMode: _editor2['default'],
    graph: _graph2['default'],
    paper: _paper2['default'],
    job: _job2['default'],
    dirty: _editor.dirty,
    original: _editor.original
});

exports['default'] = allReducers;
module.exports = exports['default'];
