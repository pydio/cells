"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _actionsEditor = require("../actions/editor");

var _graphAction = require("../graph/Action");

var _graphAction2 = _interopRequireDefault(_graphAction);

var _jointjs = require('jointjs');

var _pydioHttpRestApi = require("pydio/http/rest-api");

function graphReducer(graph, action) {
    if (graph === undefined) {
        graph = new _jointjs.dia.Graph();
        graph.on('remove', function (cell) {
            console.log(cell);
        });
    }
    switch (action.type) {
        case _actionsEditor.TOGGLE_EDITOR_MODE:
            graph.getCells().filter(function (a) {
                return a.isElement();
            }).forEach(function (a) {
                if (!action.edit) {
                    // Not connected boxes on close
                    console.log(a.graph.getConnectedLinks(a));
                    if (a.graph.getConnectedLinks(a).length === 0) {
                        a.remove();
                        return;
                    }
                }
                if (a instanceof _graphAction2["default"]) {
                    a.toggleEdit();
                }
            });
            return graph;
        case _actionsEditor.EMPTY_MODEL_ACTION:
            var model = action.model;

            model.addTo(graph);
            return graph;
        default:
            return graph;
    }
}

exports["default"] = graphReducer;
module.exports = exports["default"];
