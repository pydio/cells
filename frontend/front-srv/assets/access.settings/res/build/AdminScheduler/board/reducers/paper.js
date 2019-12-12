"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = paperReducer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _actionsEditor = require("../actions/editor");

var _jointjs = require('jointjs');

var _graphLink = require("../graph/Link");

var _graphLink2 = _interopRequireDefault(_graphLink);

/**
 * @param paper {dia.Paper}
 * @param action
 * @return {*}
 */

function paperReducer(paper, action) {
    if (paper === undefined) paper = null;

    switch (action.type) {
        case _actionsEditor.BIND_PAPER_TO_DOM:
            paper = new _jointjs.dia.Paper({
                el: action.element,
                model: action.graph,
                width: 10,
                height: 10,
                linkPinning: false,
                interactive: {
                    addLinkFromMagnet: false,
                    elementMove: false
                },
                validateConnection: function validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                    console.log(cellViewS, magnetS.attr, cellViewT, magnetT, end);
                    if (cellViewS === cellViewT) {
                        return false;
                    }
                    return true;
                },
                validateMagnet: function validateMagnet(cellView, magnet) {
                    if (magnet === false || magnet === 'passive') {
                        return false;
                    }
                    return true;
                }
            });
            Object.keys(action.events).filter(function (e) {
                return e !== 'link:remove';
            }).forEach(function (eventName) {
                paper.on(eventName, action.events[eventName]);
            });
            if (action.events['link:remove']) {
                // this is a link tool - bind to existing ones
                action.graph.getCells().filter(function (c) {
                    return c instanceof _graphLink2["default"];
                }).forEach(function (link) {
                    var linkView = link.findView(paper);
                    linkView.addTools(new _jointjs.dia.ToolsView({ tools: [action.events['link:remove']()] }));
                    linkView.hideTools();
                });
            }
            break;
        case _actionsEditor.RESIZE_PAPER:
            if (paper === null) {
                return paper;
            }
            paper.setDimensions(action.width, action.height);
            break;
        case _actionsEditor.EMPTY_MODEL_ACTION:
            var model = action.model;

            var bbox = paper.viewport.getBBox();
            model.position({ x: bbox.width, y: bbox.height / 2 });
            paper.setDimensions(bbox.width + 300, bbox.height + 40);
            break;
        case _actionsEditor.TOGGLE_EDITOR_MODE:
            var edit = action.edit;

            paper.setInteractivity({
                addLinkFromMagnet: edit,
                elementMove: edit
            });
            if (edit) {
                paper.setGridSize(16);
                paper.drawGrid();
                paper.showTools();
            } else {
                paper.clearGrid();
                paper.hideTools();
            }
            break;
        default:
            break;
    }
    return paper;
}

module.exports = exports["default"];
