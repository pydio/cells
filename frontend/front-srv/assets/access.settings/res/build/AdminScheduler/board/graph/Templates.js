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
            markup: [{
                tagName: 'rect',
                selector: 'rect'
            }, {
                tagName: 'line',
                selector: 'line'
            }],
            size: _extends({}, bbox),
            attrs: {
                rect: _extends({ refX: 0, refY: 0 }, bbox, { fill: '#fafafa', display: 'none', cursor: 'default', event: 'element:nomove' }),
                line: { x1: bbox.width, y1: 0, x2: bbox.width, y2: bbox.height, stroke: _Configs.LightGrey, 'stroke-width': 1, display: 'none', event: 'element:nomove' }
            }
        });

        this.isTemplatesContainer = true;
        this.isTemplate = true;
    }

    _createClass(Templates, [{
        key: "show",
        value: function show(graph) {

            if (this._show) return;

            this.attr('line/display', 'initial');
            this.attr('rect/display', 'initial');

            this.newNodesFilter(graph);
            this.newUsersFilter(graph);
            this.newWorkspacesFilter(graph);
            this.newRolesFilter(graph);
            this.newAclFilter(graph);

            this.newNodesSelector(graph);
            this.newUsersSelector(graph);
            this.newWorkspacesSelector(graph);
            this.newRolesSelector(graph);
            this.newAclSelector(graph);

            this._show = true;
        }
    }, {
        key: "hide",
        value: function hide(graph) {
            if (!this._show) return;

            this.attr('line/display', 'none');
            this.attr('rect/display', 'none');

            this.modelFilter.remove();
            this.usersFilter.remove();
            this.wsFilter.remove();
            this.rolesFilter.remove();
            this.aclFilter.remove();

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
                this.newNodesFilter(graph);
            } else if (el === this.usersFilter) {
                this.newUsersFilter(graph);
            } else if (el === this.wsFilter) {
                this.newWorkspacesFilter(graph);
            } else if (el === this.rolesFilter) {
                this.newRolesFilter(graph);
            } else if (el === this.aclFilter) {
                this.newAclFilter(graph);
            } else if (el === this.modelSelector) {
                this.newNodesSelector(graph);
            } else if (el === this.usersSelector) {
                this.newUsersSelector(graph);
            } else if (el === this.wsSelector) {
                this.newWorkspacesSelector(graph);
            } else if (el === this.rolesSelector) {
                this.newRolesSelector(graph);
            } else if (el === this.aclSelector) {
                this.newAclSelector(graph);
            }
        }
    }, {
        key: "newNodesFilter",
        value: function newNodesFilter(graph) {
            this.modelFilter = new _Filter2["default"](_pydioHttpRestApi.JobsNodesSelector.constructFromObject({}));
            this.modelFilter.position(0, 0);
            this.modelFilter.isTemplate = true;
            this.modelFilter.addTo(graph);
        }
    }, {
        key: "newUsersFilter",
        value: function newUsersFilter(graph) {
            this.usersFilter = new _Filter2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'User' }), 'idm');
            this.usersFilter.position(0, 64);
            this.usersFilter.isTemplate = true;
            this.usersFilter.addTo(graph);
        }
    }, {
        key: "newWorkspacesFilter",
        value: function newWorkspacesFilter(graph) {
            this.wsFilter = new _Filter2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Workspace' }), 'idm');
            this.wsFilter.position(0, 128);
            this.wsFilter.isTemplate = true;
            this.wsFilter.addTo(graph);
        }
    }, {
        key: "newRolesFilter",
        value: function newRolesFilter(graph) {
            this.rolesFilter = new _Filter2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Role' }), 'idm');
            this.rolesFilter.position(0, 192);
            this.rolesFilter.isTemplate = true;
            this.rolesFilter.addTo(graph);
        }
    }, {
        key: "newAclFilter",
        value: function newAclFilter(graph) {
            this.aclFilter = new _Filter2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Acl' }), 'idm');
            this.aclFilter.position(0, 256);
            this.aclFilter.isTemplate = true;
            this.aclFilter.addTo(graph);
        }
    }, {
        key: "newNodesSelector",
        value: function newNodesSelector(graph) {
            this.modelSelector = new _Selector2["default"](_pydioHttpRestApi.JobsNodesSelector.constructFromObject({ All: true }));
            this.modelSelector.position(64, 0);
            this.modelSelector.isTemplate = true;
            this.modelSelector.addTo(graph);
        }
    }, {
        key: "newUsersSelector",
        value: function newUsersSelector(graph) {
            this.usersSelector = new _Selector2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'User', All: true }), 'idm');
            this.usersSelector.position(64, 64);
            this.usersSelector.isTemplate = true;
            this.usersSelector.addTo(graph);
        }
    }, {
        key: "newWorkspacesSelector",
        value: function newWorkspacesSelector(graph) {
            this.wsSelector = new _Selector2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Workspace', All: true }), 'idm');
            this.wsSelector.position(64, 128);
            this.wsSelector.isTemplate = true;
            this.wsSelector.addTo(graph);
        }
    }, {
        key: "newRolesSelector",
        value: function newRolesSelector(graph) {
            this.rolesSelector = new _Selector2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Role', All: true }), 'idm');
            this.rolesSelector.position(64, 192);
            this.rolesSelector.isTemplate = true;
            this.rolesSelector.addTo(graph);
        }
    }, {
        key: "newAclSelector",
        value: function newAclSelector(graph) {
            this.aclSelector = new _Selector2["default"](_pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Acl', All: true }), 'idm');
            this.aclSelector.position(64, 256);
            this.aclSelector.isTemplate = true;
            this.aclSelector.addTo(graph);
        }
    }]);

    return Templates;
})(_jointjs.shapes.standard.Path);

exports["default"] = Templates;
module.exports = exports["default"];
