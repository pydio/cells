"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jointjs = require('jointjs');

var _Filter = require("./Filter");

var _Filter2 = _interopRequireDefault(_Filter);

var _Configs = require("./Configs");

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Selector = require("./Selector");

var _Selector2 = _interopRequireDefault(_Selector);

var Templates = (function (_shapes$standard$Path) {
    _inherits(Templates, _shapes$standard$Path);

    function Templates() {
        _classCallCheck(this, Templates);

        var bbox = { width: 128, height: '100%' };

        _get(Object.getPrototypeOf(Templates.prototype), "constructor", this).call(this, {
            markup: [{ tagName: 'rect', selector: 'rect' }, { tagName: 'line', selector: 'line' }, { tagName: 'line', selector: 'separator' }, { tagName: 'rect', selector: 'action-button' }, { tagName: 'text', selector: 'action-text' }, { tagName: 'rect', selector: 'reflow-button' }, { tagName: 'text', selector: 'reflow-text' }, { tagName: 'text', selector: 'filters-legend' }],
            size: _extends({}, bbox),
            attrs: {
                rect: _extends({ refX: 0, refY: 0 }, bbox, { fill: '#fafafa', display: 'none', cursor: 'default', event: 'element:nomove' }),
                line: { x1: bbox.width, y1: 0, x2: bbox.width, y2: bbox.height, stroke: _Configs.LightGrey, 'stroke-width': 1, display: 'none', event: 'element:nomove' },
                separator: { x1: 0, y1: 112, x2: bbox.width, y2: 112, stroke: _Configs.LightGrey, 'stroke-width': 1, display: 'none', event: 'element:nomove' },
                'action-button': { x: 16, y: 16, height: 32, width: bbox.width - 32, fill: '#fafafa', stroke: _Configs.Blue, 'stroke-width': 2, rx: 2, ry: 2, cursor: 'pointer', display: 'none', event: 'button:create-action' },
                'action-text': { refX: '50%', y: 36, text: 'Create Action', 'cursor': 'pointer', fill: _Configs.Blue, 'text-anchor': 'middle', 'font-weight': 500, display: 'none', event: 'button:create-action' },
                'reflow-button': { x: 16, y: 64, height: 32, width: bbox.width - 32, fill: '#fafafa', stroke: _Configs.Grey, 'stroke-width': 2, rx: 2, ry: 2, cursor: 'pointer', display: 'none', event: 'button:reflow' },
                'reflow-text': { refX: '50%', y: 85, title: 'Reflow graph layout automatically', text: 'Redraw', 'cursor': 'pointer', fill: _Configs.Grey, 'text-anchor': 'middle', 'font-weight': 500, display: 'none', event: 'button:reflow' },
                'filters-legend': { text: 'Filters/Selectors', x: 8, y: 132, width: bbox.width - 16, fill: _Configs.LightGrey, 'font-weight': 500, 'text-anchor': 'left', display: 'none', cursor: 'default', event: 'element:nomove' }
            }
        });

        this.isTemplatesContainer = true;
        this.isTemplate = true;
        this.toggleableComponents = ['line', 'rect', 'separator', 'action-button', 'action-text', 'reflow-button', 'reflow-text', 'filters-legend'];
    }

    _createClass(Templates, [{
        key: "show",
        value: function show(graph) {
            var _this = this;

            if (this._show) {
                return;
            }

            this.toggleableComponents.forEach(function (comp) {
                _this.attr(comp + '/display', 'initial');
            });

            var start = 140;
            var y = start;
            this.newNodesFilter(graph, y);
            y += 64;
            this.newUsersFilter(graph, y);
            y += 64;
            this.newWorkspacesFilter(graph, y);
            y += 64;
            this.newRolesFilter(graph, y);
            y += 64;
            this.newAclFilter(graph, y);
            y += 64;
            this.newActionOutputFilter(graph, y);
            y += 64;
            this.newContextMetaFilter(graph, y);

            // Reset Y
            y = start;
            this.newNodesSelector(graph, y);
            y += 64;
            this.newUsersSelector(graph, y);
            y += 64;
            this.newWorkspacesSelector(graph, y);
            y += 64;
            this.newRolesSelector(graph, y);
            y += 64;
            this.newAclSelector(graph, y);

            this._show = true;
        }
    }, {
        key: "hide",
        value: function hide(graph) {
            var _this2 = this;

            if (!this._show) {
                return;
            }

            this.toggleableComponents.forEach(function (comp) {
                _this2.attr(comp + '/display', 'none');
            });

            this.modelFilter.remove();
            this.usersFilter.remove();
            this.wsFilter.remove();
            this.rolesFilter.remove();
            this.aclFilter.remove();
            this.contextMetaFilter.remove();
            this.actionOutputFilter.remove();

            this.modelSelector.remove();
            this.usersSelector.remove();
            this.wsSelector.remove();
            this.rolesSelector.remove();
            this.aclSelector.remove();

            this._show = false;
        }
    }, {
        key: "replicate",
        value: function replicate(el, graph) {
            if (el === this.modelFilter) {
                this.newNodesFilter(graph, el.position().y);
            } else if (el === this.usersFilter) {
                this.newUsersFilter(graph, el.position().y);
            } else if (el === this.wsFilter) {
                this.newWorkspacesFilter(graph, el.position().y);
            } else if (el === this.rolesFilter) {
                this.newRolesFilter(graph, el.position().y);
            } else if (el === this.contextMetaFilter) {
                this.newContextMetaFilter(graph, el.position().y);
            } else if (el === this.actionOutputFilter) {
                this.newActionOutputFilter(graph, el.position().y);
            } else if (el === this.aclFilter) {
                this.newAclFilter(graph, el.position().y);
            } else if (el === this.modelSelector) {
                this.newNodesSelector(graph, el.position().y);
            } else if (el === this.usersSelector) {
                this.newUsersSelector(graph, el.position().y);
            } else if (el === this.wsSelector) {
                this.newWorkspacesSelector(graph, el.position().y);
            } else if (el === this.rolesSelector) {
                this.newRolesSelector(graph, el.position().y);
            } else if (el === this.aclSelector) {
                this.newAclSelector(graph, el.position().y);
            }
        }
    }, {
        key: "newNodesFilter",
        value: function newNodesFilter(graph, y) {
            this.modelFilter = new _Filter2["default"](_pydioHttpRestApi.JobsNodesSelector.constructFromObject({}));
            this.modelFilter.position(0, y);
            this.modelFilter.isTemplate = true;
            this.modelFilter.addTo(graph);
        }
    }, {
        key: "newUsersFilter",
        value: function newUsersFilter(graph, y) {
            this.usersFilter = new _Filter2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'User' }), 'idm');
            this.usersFilter.position(0, y);
            this.usersFilter.isTemplate = true;
            this.usersFilter.addTo(graph);
        }
    }, {
        key: "newWorkspacesFilter",
        value: function newWorkspacesFilter(graph, y) {
            this.wsFilter = new _Filter2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Workspace' }), 'idm');
            this.wsFilter.position(0, y);
            this.wsFilter.isTemplate = true;
            this.wsFilter.addTo(graph);
        }
    }, {
        key: "newRolesFilter",
        value: function newRolesFilter(graph, y) {
            this.rolesFilter = new _Filter2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Role' }), 'idm');
            this.rolesFilter.position(0, y);
            this.rolesFilter.isTemplate = true;
            this.rolesFilter.addTo(graph);
        }
    }, {
        key: "newAclFilter",
        value: function newAclFilter(graph, y) {
            this.aclFilter = new _Filter2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Acl' }), 'idm');
            this.aclFilter.position(0, y);
            this.aclFilter.isTemplate = true;
            this.aclFilter.addTo(graph);
        }
    }, {
        key: "newNodesSelector",
        value: function newNodesSelector(graph, y) {
            this.modelSelector = new _Selector2["default"](_pydioHttpRestApi.JobsNodesSelector.constructFromObject({ All: true }));
            this.modelSelector.position(64, y);
            this.modelSelector.isTemplate = true;
            this.modelSelector.addTo(graph);
        }
    }, {
        key: "newUsersSelector",
        value: function newUsersSelector(graph, y) {
            this.usersSelector = new _Selector2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'User', All: true }), 'idm');
            this.usersSelector.position(64, y);
            this.usersSelector.isTemplate = true;
            this.usersSelector.addTo(graph);
        }
    }, {
        key: "newWorkspacesSelector",
        value: function newWorkspacesSelector(graph, y) {
            this.wsSelector = new _Selector2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Workspace', All: true }), 'idm');
            this.wsSelector.position(64, y);
            this.wsSelector.isTemplate = true;
            this.wsSelector.addTo(graph);
        }
    }, {
        key: "newRolesSelector",
        value: function newRolesSelector(graph, y) {
            this.rolesSelector = new _Selector2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Role', All: true }), 'idm');
            this.rolesSelector.position(64, y);
            this.rolesSelector.isTemplate = true;
            this.rolesSelector.addTo(graph);
        }
    }, {
        key: "newAclSelector",
        value: function newAclSelector(graph, y) {
            this.aclSelector = new _Selector2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Acl', All: true }), 'idm');
            this.aclSelector.position(64, y);
            this.aclSelector.isTemplate = true;
            this.aclSelector.addTo(graph);
        }
    }, {
        key: "newContextMetaFilter",
        value: function newContextMetaFilter(graph, y) {
            this.contextMetaFilter = new _Filter2["default"](_pydioHttpRestApi.JobsContextMetaFilter.constructFromObject({}), 'context');
            this.contextMetaFilter.position(0, y);
            this.contextMetaFilter.isTemplate = true;
            this.contextMetaFilter.addTo(graph);
        }
    }, {
        key: "newActionOutputFilter",
        value: function newActionOutputFilter(graph, y) {
            this.actionOutputFilter = new _Filter2["default"](_pydioHttpRestApi.JobsActionOutputFilter.constructFromObject({}), 'output');
            this.actionOutputFilter.position(0, y);
            this.actionOutputFilter.isTemplate = true;
            this.actionOutputFilter.addTo(graph);
        }
    }]);

    return Templates;
})(_jointjs.shapes.standard.Path);

exports["default"] = Templates;
module.exports = exports["default"];
