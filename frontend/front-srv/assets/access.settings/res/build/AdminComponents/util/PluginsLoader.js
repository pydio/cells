'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var Manager = _Pydio$requireLib.Manager;

var PluginsLoader = (function () {
    _createClass(PluginsLoader, null, [{
        key: 'getInstance',
        value: function getInstance(pydio) {
            if (!PluginsLoader.INSTANCE) {
                PluginsLoader.INSTANCE = new PluginsLoader(pydio);
            }
            return PluginsLoader.INSTANCE;
        }
    }]);

    function PluginsLoader(pydio) {
        _classCallCheck(this, PluginsLoader);

        this.pydio = pydio;
        this.pLoad = null;
        this.plugins = null;
    }

    _createClass(PluginsLoader, [{
        key: 'loadPlugins',
        value: function loadPlugins() {
            var _this = this;

            var forceReload = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (this.plugins && !forceReload) {
                return Promise.resolve(this.plugins);
            }

            if (this.pLoad !== null) {
                return this.pLoad;
            }

            this.pLoad = new Promise(function (resolve, reject) {

                _pydioHttpApi2['default'].getRestClient().getOrUpdateJwt().then(function (jwt) {
                    var headers = { Authorization: 'Bearer ' + jwt };
                    var lang = 'en';
                    if (_this.pydio.user && _this.pydio.user.getPreference('lang')) {
                        lang = _this.pydio.user.getPreference('lang');
                    }
                    var url = _this.pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/plugins/' + lang;
                    _pydio2['default'].startLoading();
                    window.fetch(url, {
                        method: 'GET',
                        credentials: 'same-origin',
                        headers: headers
                    }).then(function (response) {
                        _pydio2['default'].endLoading();
                        _this.loading = false;
                        response.text().then(function (text) {
                            _this.plugins = _pydioUtilXml2['default'].parseXml(text).documentElement;
                            _this.pLoad = null;
                            resolve(_this.plugins);
                        });
                    })['catch'](function (e) {
                        _pydio2['default'].endLoading();
                        _this.pLoad = null;
                        reject(e);
                    });
                });
            });

            return this.pLoad;
        }

        /**
         *
         * @param pluginNode DOMNode
         * @param enabled boolean
         * @param callback Function
         */
    }, {
        key: 'toggleEnabled',
        value: function toggleEnabled(pluginNode, enabled, callback) {

            var api = new _cellsSdk.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var fullPath = "frontend/plugin/" + pluginNode.getAttribute('id');
            // Load initial config

            api.getConfig(fullPath).then(function (response) {
                return response.Data;
            }).then(function () {
                var data = arguments.length <= 0 || arguments[0] === undefined ? "{}" : arguments[0];

                var currentData = JSON.parse(data) || {};
                currentData["PYDIO_PLUGIN_ENABLED"] = enabled;
                var config = _cellsSdk.RestConfiguration.constructFromObject({
                    FullPath: fullPath,
                    Data: JSON.stringify(currentData)
                });
                api.putConfig(config.FullPath, config).then(function () {
                    callback();
                });
            });
        }
    }, {
        key: 'loadServiceConfigs',
        value: function loadServiceConfigs(serviceName) {
            var api = new _cellsSdk.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.getConfig("services/" + serviceName).then(function (data) {
                return data || {};
            }).then(function (restConfig) {
                if (restConfig.Data) {
                    return JSON.parse(restConfig.Data) || {};
                } else {
                    return {};
                }
            });
        }
    }, {
        key: 'saveServiceConfigs',
        value: function saveServiceConfigs(serviceName, data) {
            var api = new _cellsSdk.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var body = new _cellsSdk.RestConfiguration();
            body.FullPath = "services/" + serviceName;
            body.Data = JSON.stringify(data);
            return api.putConfig(body.FullPath, body);
        }
    }, {
        key: 'loadPluginConfigs',
        value: function loadPluginConfigs(pluginId) {
            var api = new _cellsSdk.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var fullPath = "frontend/plugin/" + pluginId;
            return new Promise(function (resolve, reject) {
                api.getConfig(fullPath).then(function (response) {
                    return response.Data;
                }).then(function () {
                    var data = arguments.length <= 0 || arguments[0] === undefined ? "{}" : arguments[0];

                    var currentData = JSON.parse(data) || {};
                    resolve(currentData);
                })['catch'](function (e) {
                    reject(e);
                });
            });
        }
    }, {
        key: 'savePluginConfigs',
        value: function savePluginConfigs(pluginId, values, callback) {

            var api = new _cellsSdk.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var fullPath = "frontend/plugin/" + pluginId;

            api.getConfig(fullPath).then(function (response) {
                return response.Data;
            }).then(function () {
                var data = arguments.length <= 0 || arguments[0] === undefined ? "{}" : arguments[0];

                var currentData = JSON.parse(data) || {};
                var newData = _pydioUtilLang2['default'].mergeObjectsRecursive(currentData, values);
                var config = _cellsSdk.RestConfiguration.constructFromObject({
                    FullPath: fullPath,
                    Data: JSON.stringify(newData)
                });
                api.putConfig(config.FullPath, config).then(function () {
                    callback(newData);
                });
            });
        }

        /**
         *
         * @return {*|Promise|PromiseLike<T>|Promise<T>}
         */
    }, {
        key: 'allPluginsActionsAndParameters',
        value: function allPluginsActionsAndParameters() {
            return this.loadPlugins().then(function (plugins) {
                var xmlActions = _pydioUtilXml2['default'].XPathSelectNodes(plugins, "//action");
                var xmlParameters = _pydioUtilXml2['default'].XPathSelectNodes(plugins, "//global_param|//param");
                var ACTIONS = {};
                var PARAMETERS = {};
                xmlActions.map(function (action) {
                    var pluginId = action.parentNode.parentNode.parentNode.getAttribute("id");
                    if (!ACTIONS[pluginId]) {
                        ACTIONS[pluginId] = [];
                    }
                    ACTIONS[pluginId].push({
                        action: action.getAttribute('name'),
                        label: action.getAttribute('name'),
                        xmlNode: action
                    });
                });
                xmlParameters.map(function (parameter) {
                    if (parameter.parentNode.nodeName !== 'server_settings') {
                        return;
                    }
                    var pluginId = parameter.parentNode.parentNode.getAttribute("id");
                    if (!PARAMETERS[pluginId]) {
                        PARAMETERS[pluginId] = [];
                    }
                    PARAMETERS[pluginId].push({
                        parameter: parameter.getAttribute('name'),
                        label: parameter.getAttribute('name'),
                        xmlNode: parameter
                    });
                });
                return { ACTIONS: ACTIONS, PARAMETERS: PARAMETERS };
            });
        }

        /**
         * @param xPath string
         * @return {Promise}
         */
    }, {
        key: 'formParameters',
        value: function formParameters(xPath) {
            var _this2 = this;

            return this.loadPlugins().then(function (registry) {
                return _pydioUtilXml2['default'].XPathSelectNodes(registry, xPath).filter(function (node) {
                    return node.parentNode.nodeName === 'server_settings';
                }).map((function (node) {
                    var params = Manager.parameterNodeToHash(node);
                    var pluginId = node.parentNode.parentNode.getAttribute("id");
                    params['pluginId'] = pluginId;
                    params['aclKey'] = 'parameter:' + pluginId + ':' + node.getAttribute("name");
                    return params;
                }).bind(_this2));
            });
        }
    }, {
        key: 'loadSites',
        value: function loadSites() {
            var filter = arguments.length <= 0 || arguments[0] === undefined ? '*' : arguments[0];

            var api = new _cellsSdk.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.listSites(filter);
        }
    }]);

    return PluginsLoader;
})();

exports['default'] = PluginsLoader;
module.exports = exports['default'];
