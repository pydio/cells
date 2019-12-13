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

var _graphTemplates = require("../graph/Templates");

var _graphTemplates2 = _interopRequireDefault(_graphTemplates);

function graphReducer(graph, action) {
    if (graph === undefined) {
        graph = new _jointjs.dia.Graph();
    }
    switch (action.type) {
        case _actionsEditor.TOGGLE_EDITOR_MODE:
            graph.getCells().filter(function (a) {
                return a.isElement();
            }).forEach(function (a) {
                if (a instanceof _graphTemplates2["default"]) {
                    if (action.edit) {
                        a.show(graph);
                    } else {
                        a.hide(graph);
                    }
                    return;
                }
                if (a instanceof _graphAction2["default"]) {
                    a.toggleEdit();
                }
                if (!action.edit && !a.isTemplate) {
                    if (a.graph.getConnectedLinks(a).length === 0) {
                        a.remove();
                    }
                }
            });
            if (action.layout) {
                action.layout(action.edit);
            }
            return graph;
        case _actionsEditor.EMPTY_MODEL_ACTION:
            var model = action.model;

            model.position(160, 200);
            model.addTo(graph);
            return graph;
        default:
            return graph;
    }
}

exports["default"] = graphReducer;
module.exports = exports["default"];
