'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioLangObservable = require("pydio/lang/observable");

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Workspace = (function (_Observable) {
    _inherits(Workspace, _Observable);

    _createClass(Workspace, [{
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    var val = value;
                    if (p === 'Slug') {
                        val = _pydioUtilLang2['default'].computeStringSlug(val);
                    } else if (p === 'Label' && _this.create) {
                        target['Slug'] = _pydioUtilLang2['default'].computeStringSlug(val);
                    }
                    target[p] = val;
                    _this.dirty = true;
                    _this.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (p === 'Attributes') {
                        out = _this.internalAttributes;
                    }
                    if (out instanceof Array) {
                        return out;
                    } else if (out instanceof Object) {
                        return _this.buildProxy(out);
                    } else {
                        return out;
                    }
                }
            });
        }

        /**
         * @param model {IdmWorkspace}
         */
    }]);

    function Workspace(model) {
        _classCallCheck(this, Workspace);

        _get(Object.getPrototypeOf(Workspace.prototype), 'constructor', this).call(this);
        this.internalAttributes = {};
        this.dirty = false;
        if (model) {
            this.initModel(model);
        } else {
            this.create = true;
            this.model = new _pydioHttpRestApi.IdmWorkspace();
            this.model.Scope = _pydioHttpRestApi.IdmWorkspaceScope.constructFromObject('ADMIN');
            this.model.RootNodes = {};
            this.internalAttributes = { "DEFAULT_RIGHTS": "" };
            this.model.PoliciesContextEditable = true;
            this.model.Attributes = JSON.stringify(this.internalAttributes);
        }
        this.observableModel = this.buildProxy(this.model);
    }

    _createClass(Workspace, [{
        key: 'initModel',
        value: function initModel(model) {
            this.create = false;
            this.dirty = false;
            this.model = model;
            this.snapshot = JSON.parse(JSON.stringify(model));
            if (model.Attributes) {
                var atts = JSON.parse(model.Attributes);
                if (typeof atts === "object" && Object.keys(atts).length) {
                    this.internalAttributes = atts;
                }
            } else {
                this.internalAttributes = {};
            }
            if (!model.RootNodes) {
                model.RootNodes = {};
            }
        }

        /**
         * @return {IdmWorkspace}
         */
    }, {
        key: 'getModel',
        value: function getModel() {
            return this.observableModel;
        }

        /**
         * @return {boolean}
         */
    }, {
        key: 'hasTemplatePath',
        value: function hasTemplatePath() {
            var _this2 = this;

            return Object.keys(this.model.RootNodes).filter(function (k) {
                return Workspace.rootIsTemplatePath(_this2.model.RootNodes[k]);
            }).length > 0;
        }

        /**
         * @return {boolean}
         */
    }, {
        key: 'hasFolderRoots',
        value: function hasFolderRoots() {
            var _this3 = this;

            return Object.keys(this.model.RootNodes).filter(function (k) {
                return !Workspace.rootIsTemplatePath(_this3.model.RootNodes[k]);
            }).length > 0;
        }

        /**
         *
         * @return {Promise<any>}
         */
    }, {
        key: 'save',
        value: function save() {
            var _this4 = this;

            // If Policies are not set, REST service will add default policies
            this.model.Attributes = JSON.stringify(this.internalAttributes);
            var api = new _pydioHttpRestApi.WorkspaceServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.putWorkspace(this.model.Slug, this.model).then(function (ws) {
                _this4.initModel(ws);
                _this4.observableModel = _this4.buildProxy(_this4.model);
            });
        }

        /**
         *
         * @return {Promise}
         */
    }, {
        key: 'remove',
        value: function remove() {
            var api = new _pydioHttpRestApi.WorkspaceServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.deleteWorkspace(this.model.Slug);
        }

        /**
         * Revert state
         */
    }, {
        key: 'revert',
        value: function revert() {
            var revert = _pydioHttpRestApi.IdmWorkspace.constructFromObject(this.snapshot || {});
            this.initModel(revert);
            this.observableModel = this.buildProxy(this.model);
        }

        /**
         * @return {boolean}
         */
    }, {
        key: 'isValid',
        value: function isValid() {
            return this.model.Slug && this.model.Label && Object.keys(this.model.RootNodes).length > 0;
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.dirty;
        }

        /**
         *
         * @param node {TreeNode}
         * @return bool
         */
    }], [{
        key: 'rootIsTemplatePath',
        value: function rootIsTemplatePath(node) {
            return !!(node.MetaStore && node.MetaStore['resolution']);
        }
    }, {
        key: 'listWorkspaces',
        value: function listWorkspaces() {
            var api = new _pydioHttpRestApi.WorkspaceServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestSearchWorkspaceRequest();
            var single = new _pydioHttpRestApi.IdmWorkspaceSingleQuery();
            single.scope = _pydioHttpRestApi.IdmWorkspaceScope.constructFromObject('ADMIN');
            request.Queries = [single];
            return api.searchWorkspaces(request);
        }
    }]);

    return Workspace;
})(_pydioLangObservable2['default']);

exports['default'] = Workspace;
module.exports = exports['default'];
