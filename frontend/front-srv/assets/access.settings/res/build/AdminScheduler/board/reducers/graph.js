"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _actionsEditor = require("../actions/editor");

var _graphAction = require("../graph/Action");

var _graphAction2 = _interopRequireDefault(_graphAction);

var _jointjs = require('jointjs');

var _graphTemplates = require("../graph/Templates");

var _graphTemplates2 = _interopRequireDefault(_graphTemplates);

var _graphJobInput = require("../graph/JobInput");

var _graphJobInput2 = _interopRequireDefault(_graphJobInput);

var _graphLink = require("../graph/Link");

var _graphLink2 = _interopRequireDefault(_graphLink);

var _JobGraph = require("../JobGraph");

var _JobGraph2 = _interopRequireDefault(_JobGraph);

var _pydioHttpRestApi = require("pydio/http/rest-api");

var _dagre = require("dagre");

var _dagre2 = _interopRequireDefault(_dagre);

var _graphlib = require("graphlib");

var _graphlib2 = _interopRequireDefault(_graphlib);

function chainActions(descriptions, graph, actions, inputId) {
    var outputPort = arguments.length <= 4 || arguments[4] === undefined ? 'output' : arguments[4];
    var hasData = arguments.length <= 5 || arguments[5] === undefined ? true : arguments[5];

    actions.forEach(function (action) {
        var crtInput = inputId;
        var hasChain = action.ChainedActions && action.ChainedActions.length;
        var hasNegate = action.FailedFilterActions && action.FailedFilterActions.length;
        var shape = new _graphAction2["default"](descriptions, action, hasChain);
        shape.addTo(graph);
        var filter = shape.getActionFilter();
        var link = undefined;
        if (filter) {
            filter.addTo(graph);
            link = new _graphLink2["default"](crtInput, outputPort, filter.id, 'input', hasData);
            link.addTo(graph);
            var filterToAction = new _graphLink2["default"](filter.id, 'output', shape.id, 'input', hasData);
            filterToAction.addTo(graph);
        } else {
            link = new _graphLink2["default"](crtInput, outputPort, shape.id, 'input', hasData);
            link.addTo(graph);
        }
        if (outputPort === 'negate') {
            link.orthogonal();
        }
        if (hasChain) {
            chainActions(descriptions, graph, action.ChainedActions, shape.id, 'output');
        }
        if (filter && hasNegate) {
            chainActions(descriptions, graph, action.FailedFilterActions, filter.id, 'negate');
        }
    });
}

var editWindowHeight = 600;

function layoutReducer(state, action) {
    if (state === undefined) state = {};

    switch (action.type) {

        case _actionsEditor.REQUIRE_LAYOUT:
            var paper = action.paper,
                createLinkTool = action.createLinkTool,
                graph = action.graph,
                boundingRef = action.boundingRef,
                editMode = action.editMode;

            // Relayout graph and return bounding box
            var inputs = graph.getCells().filter(function (c) {
                return !c.isTemplate;
            });
            var bbox = _jointjs.layout.DirectedGraph.layout(inputs, {
                nodeSep: 48,
                edgeSep: 48,
                rankSep: 128,
                rankDir: "LR",
                marginX: editMode ? 160 : 32,
                marginY: 32,
                dagre: _dagre2["default"],
                graphlib: _graphlib2["default"]
            });
            bbox.width += 80;
            bbox.height += 80;
            if (editMode) {
                bbox.height = Math.max(editWindowHeight, bbox.height);
                bbox.width += 200;
                if (boundingRef) {
                    var maxWidth = boundingRef.clientWidth;
                    bbox.width = Math.max(bbox.width, maxWidth);
                }
            }

            if (paper) {
                graph.getLinks().forEach(function (l) {
                    var linkView = l.findView(paper);
                    if (!linkView.hasTools()) {
                        linkView.addTools(new _jointjs.dia.ToolsView({ tools: [createLinkTool()] }));
                        if (!editMode) {
                            linkView.hideTools();
                        }
                    }
                });
            }

            return bbox;
        default:
            return state;
    }
}

function graphReducer(graph, action) {
    if (graph === undefined) {
        graph = new _jointjs.dia.Graph();
    }
    switch (action.type) {

        case _actionsEditor.JOB_CHANGED:
            var job = action.job,
                descriptions = action.descriptions;

            graph.getCells().filter(function (c) {
                return !c.isTemplate;
            }).forEach(function (c) {
                return c.remove();
            });

            var shapeIn = new _graphJobInput2["default"](job);
            shapeIn.addTo(graph);

            if (!job || !job.Actions || !job.Actions.length) {
                return;
            }

            var actionsInput = shapeIn.id;
            var firstLinkHasData = _JobGraph2["default"].jobInputCreatesData(job);

            chainActions(descriptions, graph, job.Actions, actionsInput, 'output', firstLinkHasData);

            return graph;

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
                if (!action.edit && !a.isTemplate && !a instanceof _graphJobInput2["default"]) {
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

exports.graphReducer = graphReducer;
exports.layoutReducer = layoutReducer;
