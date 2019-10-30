'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioSdkJs = require('pydio-sdk-js');

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Loader = (function (_Observable) {
    _inherits(Loader, _Observable);

    function Loader() {
        _classCallCheck(this, Loader);

        _get(Object.getPrototypeOf(Loader.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Loader, [{
        key: 'loadWorkspaces',

        /**
         * Load workspaces from Pydio 8 instance.
         * This instance must have CORS enabled ! See github.com/pydio/pydio-core branch #test-cors
         * @return {Promise<any>}
         */
        value: function loadWorkspaces(url, user, pwd) {
            var _this = this;

            var api = new _pydioSdkJs.ProvisioningApi();
            api.apiClient.basePath = _pydioUtilLang2['default'].trimRight(url, '/') + "/api/v2";
            api.apiClient.authentications = {
                "basicAuth": { type: 'basic', username: user, password: pwd }
            };
            this.notify('progress', { max: 10, value: 0 });
            return api.adminListWorkspaces().then(function (res) {
                if (!res || !res.data || !res.data.children) {
                    _this.notify('progress', { max: 10, value: 10 });
                    return [];
                }
                var nodes = res.data.children;
                var wsProms = [];
                var pg = 1;
                var keys = Object.keys(nodes).map(function (k) {
                    return k === '/' ? "0" : k;
                });
                var max = keys.length + 1;
                _this.notify('progress', { max: max, value: pg });
                keys.forEach(function (k) {
                    wsProms.push(api.adminGetWorkspace(k + '', { format: 'json' }).then(function (res) {
                        pg++;
                        _this.notify('progress', { max: max, value: pg });
                        return res && res.id ? res : null;
                    })['catch'](function (e) {
                        pg++;
                        _this.notify('progress', { max: max, value: pg });
                    }));
                });
                return Promise.all(wsProms).then(function (multiRes) {
                    return multiRes.filter(function (v) {
                        return v !== null;
                    });
                });
            });
        }

        /**
         *
         * @return {Request|PromiseLike<T>|Promise<T>}
         */
    }, {
        key: 'loadTemplatePaths',
        value: function loadTemplatePaths() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.listVirtualNodes().then(function (collection) {
                return collection.Children || [];
            });
        }

        /**
         *
         * @return {Promise<ObjectDataSource>}
         */
    }, {
        key: 'loadDataSources',
        value: function loadDataSources() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.listDataSources().then(function (res) {
                return res.DataSources || [];
            });
        }

        /**
         *
         * @return {Promise<ObjectDataSource>}
         */
    }, {
        key: 'loadCellsWorkspaces',
        value: function loadCellsWorkspaces() {
            var api = new _pydioHttpRestApi.WorkspaceServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestSearchWorkspaceRequest();
            var single = new _pydioHttpRestApi.IdmWorkspaceSingleQuery();
            single.scope = _pydioHttpRestApi.IdmWorkspaceScope.constructFromObject('ADMIN');
            request.Queries = [single];
            return api.searchWorkspaces(request).then(function (res) {
                return res.Workspaces || [];
            });
        }

        /**
         * Gather meta.user info from workspaces
         * @param workspaces [AdminWorkspace]
         */
    }], [{
        key: 'parseUserMetaDefinitions',
        value: function parseUserMetaDefinitions(workspaces) {
            var metas = [];
            var factorized = [];
            var links = [];
            workspaces.forEach(function (ws) {
                if (!ws.features || !ws.features["meta.user"]) {
                    return;
                }
                var meta = ws.features["meta.user"];
                var i = 0;
                var suffix = "";
                var base = "meta_fields";
                while (meta[base + suffix]) {
                    var type = meta["meta_types" + suffix] || "string";
                    if (meta["meta_labels" + suffix] && type !== 'creator' && type !== 'updater') {
                        (function () {
                            var name = meta[base + suffix];
                            var label = meta["meta_labels" + suffix];
                            var additional = meta["meta_additional" + suffix];
                            var newMeta = { name: name, label: label, type: type, additional: additional, ws: ws };
                            metas.push(newMeta);
                            var left = metas.length - 1;
                            var right = undefined;
                            var otherWs = factorized.filter(function (m) {
                                return m.type === newMeta.type && m.ws !== newMeta.ws && (newMeta.type !== 'choice' || newMeta.additional === m.additional);
                            });
                            if (!otherWs.length) {
                                var facMeta = _extends({}, newMeta, { namespace: 'usermeta-' + _pydioUtilLang2['default'].computeStringSlug(newMeta.name) });
                                factorized.push(facMeta);
                                right = factorized.length - 1;
                            } else {
                                right = factorized.indexOf(otherWs[0]);
                            }
                            links.push({ left: left, right: right });
                        })();
                    }
                    i++;
                    suffix = "_" + i;
                }
            });
            return { metas: metas, factorized: factorized, links: links };
        }
    }]);

    return Loader;
})(_pydioLangObservable2['default']);

exports['default'] = Loader;
module.exports = exports['default'];
