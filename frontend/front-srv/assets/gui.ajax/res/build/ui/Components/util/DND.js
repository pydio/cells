/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FuncUtils = require("pydio/util/func");
var ResourcesManager = require("pydio/http/resources-manager");

/******************************/
/* REACT DND GENERIC COMPONENTS
 /******************************/
var Types = {
    NODE_PROVIDER: 'node',
    SORTABLE_LIST_ITEM: 'sortable-list-item'
};

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true })
    };
}

var DNDActionParameter = (function () {
    function DNDActionParameter(source, target, step) {
        _classCallCheck(this, DNDActionParameter);

        this._source = source;
        this._target = target;
        this._step = step;
    }

    DNDActionParameter.prototype.getSource = function getSource() {
        return this._source;
    };

    DNDActionParameter.prototype.getTarget = function getTarget() {
        return this._target;
    };

    DNDActionParameter.prototype.getStep = function getStep() {
        return this._step;
    };

    return DNDActionParameter;
})();

DNDActionParameter.STEP_BEGIN_DRAG = 'beginDrag';
DNDActionParameter.STEP_END_DRAG = 'endDrag';
DNDActionParameter.STEP_CAN_DROP = 'canDrop';
DNDActionParameter.STEP_HOVER_DROP = 'hover';

var applyDNDAction = function applyDNDAction(source, target, step) {
    var Controller = window.pydio.Controller;

    var dnd = Controller.defaultActions.get("dragndrop");
    if (dnd) {
        var dndAction = Controller.getActionByName(dnd);
        dndAction.enable();
        var params = new DNDActionParameter(source, target, step);
        var checkModule = dndAction.options.dragndropCheckModule;
        if (step === DNDActionParameter.STEP_CAN_DROP && checkModule) {
            if (!FuncUtils.getFunctionByName(checkModule, window)) {
                ResourcesManager.detectModuleToLoadAndApply(checkModule, function () {});
                throw new Error('Cannot find test module, trying to load it');
            }
            FuncUtils.executeFunctionByName(dndAction.options.dragndropCheckModule, window, Controller, params);
        } else {
            dndAction.apply(params);
        }
    } else {
        throw new Error('No DND Actions available');
    }
};

/****************************/
/* REACT DND DRAG/DROP NODES
 /***************************/

var nodeDragSource = {
    beginDrag: function beginDrag(props) {
        // Return the data describing the dragged item
        return { node: props.node };
    },

    endDrag: function endDrag(props, monitor, component) {
        if (!monitor.didDrop()) {
            return;
        }
        var item = monitor.getItem();
        var dropResult = monitor.getDropResult();
        try {
            applyDNDAction(item.node, dropResult.node, DNDActionParameter.STEP_END_DRAG);
        } catch (e) {}
    }
};

var nodeDropTarget = {

    hover: function hover(props, monitor) {},

    canDrop: function canDrop(props, monitor) {

        var source = monitor.getItem().node;
        var target = props.node;

        try {
            applyDNDAction(source, target, DNDActionParameter.STEP_CAN_DROP);
        } catch (e) {
            return false;
        }
        return true;
    },

    drop: function drop(props, monitor) {
        var hasDroppedOnChild = monitor.didDrop();
        if (hasDroppedOnChild) {
            return;
        }
        return { node: props.node };
    }

};

exports.Types = Types;
exports.collect = collect;
exports.collectDrop = collectDrop;
exports.nodeDragSource = nodeDragSource;
exports.nodeDropTarget = nodeDropTarget;
exports.DNDActionParameter = DNDActionParameter;
