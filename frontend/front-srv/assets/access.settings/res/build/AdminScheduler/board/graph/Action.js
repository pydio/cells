"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jointjs = require('jointjs');

var _Configs = require("./Configs");

var _actionsEditor = require("../actions/editor");

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Action = (function (_shapes$devs$Model) {
    _inherits(Action, _shapes$devs$Model);

    _createClass(Action, null, [{
        key: "createEmptyAction",
        value: function createEmptyAction(descriptions) {
            return new Action(descriptions, _pydioHttpRestApi.JobsAction.constructFromObject({ ID: _actionsEditor.JOB_ACTION_EMPTY }), true);
        }

        /**
         *
         * @param descriptions
         * @param action {JobsAction}
         * @param edit boolean open in edit mode
         */
    }]);

    function Action(descriptions, action) {
        var edit = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        _classCallCheck(this, Action);

        var aName = undefined;
        if (descriptions && descriptions[action.ID] && descriptions[action.ID].Label) {
            aName = descriptions[action.ID].Label;
        } else {
            var parts = action.ID.split(".");
            aName = parts.pop();
        }

        var iconCode = (0, _Configs.IconToUnicode)("chip");
        if (descriptions && descriptions[action.ID] && descriptions[action.ID].Icon) {
            iconCode = (0, _Configs.IconToUnicode)(descriptions[action.ID].Icon);
        }

        var config = {
            size: _extends({}, _Configs.BoxSize, { fill: 'transparent', rx: 5, ry: 5, 'stroke-width': 1.5, 'stroke': '#31d0c6' }),
            inPorts: ['input'],
            markup: _Configs.TextIconFilterMarkup,
            attrs: {
                rect: _extends({}, _Configs.BoxSize, _Configs.BlueRect),
                icon: _extends({ text: iconCode }, _Configs.LightIcon),
                text: _extends({ text: aName, magnet: false }, _Configs.LightLabel),
                'separator': { display: 'none', x1: 44, y1: 0, x2: 44, y2: _Configs.BoxSize.height, stroke: 'white', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' },
                'filter-rect': { display: 'none', fill: 'white', refX: 10, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry: 12, event: 'element:filter:pointerdown' },
                'filter-icon': _extends({ display: 'none', text: (0, _Configs.IconToUnicode)('filter') }, _Configs.LightIcon, { fill: _Configs.Orange, refX: 22, refY: '50%', refY2: -3, event: 'element:filter:pointerdown' }),
                'selector-rect': { display: 'none', fill: 'white', refX: 10, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry: 12, event: 'element:selector:pointerdown' },
                'selector-icon': _extends({ display: 'none', text: (0, _Configs.IconToUnicode)('magnify') }, _Configs.LightIcon, { fill: _Configs.Orange, refX: 22, refY: '50%', refY2: -3, event: 'element:selector:pointerdown' })
            },
            ports: _Configs.PortsConfig
        };

        if (action.ChainedActions || edit) {
            config.outPorts = ['output'];
        }

        _get(Object.getPrototypeOf(Action.prototype), "constructor", this).call(this, config);
        if (action.NodesFilter || action.IdmFilter || action.UsersFilter) {
            this.setFilter(true);
        }
        if (action.NodesSelector || action.IdmSelector || action.UsersSelector) {
            this.setSelector(true);
        }
        this._edit = edit;
        this._jobModel = action;
    }

    _createClass(Action, [{
        key: "clearSelection",
        value: function clearSelection() {
            this.attr('rect/stroke', _Configs.Blue);
            this.attr('filter-rect/stroke', 'transparent');
            this.attr('selector-rect/stroke', 'transparent');
        }
    }, {
        key: "select",
        value: function select() {
            this.attr('rect/stroke', _Configs.Orange);
        }
    }, {
        key: "selectFilter",
        value: function selectFilter() {
            this.attr('filter-rect/stroke', _Configs.Orange);
        }
    }, {
        key: "selectSelector",
        value: function selectSelector() {
            this.attr('selector-rect/stroke', _Configs.Orange);
        }
    }, {
        key: "setFilter",
        value: function setFilter(b) {
            this._leftFilter = b;
            (0, _Configs.positionFilters)(this, _Configs.BoxSize, this._leftFilter, this._leftSelector);
        }
    }, {
        key: "setSelector",
        value: function setSelector(b) {
            this._leftSelector = b;
            (0, _Configs.positionFilters)(this, _Configs.BoxSize, this._leftFilter, this._leftSelector);
        }
    }, {
        key: "toggleEdit",
        value: function toggleEdit() {
            this._edit = !this._edit;
            // Show out port in edit mode even if no actions
            if (!this._jobModel.ChainedActions || !this._jobModel.ChainedActions.length) {
                if (this._edit) {
                    this.addOutPort('output');
                } else {
                    this.removeOutPort('output');
                }
            }
        }

        /**
         *
         * @return {JobsAction}
         */
    }, {
        key: "getJobsAction",
        value: function getJobsAction() {
            return this._jobModel;
        }
    }]);

    return Action;
})(_jointjs.shapes.devs.Model);

exports["default"] = Action;
module.exports = exports["default"];
