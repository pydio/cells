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

var _pydioHttpRestApi = require("pydio/http/rest-api");

var Loader = (function () {
    _createClass(Loader, null, [{
        key: 'getInstance',
        value: function getInstance(pydio) {
            if (!Loader.INSTANCE) {
                Loader.INSTANCE = new Loader(pydio);
            }
            return Loader.INSTANCE;
        }
    }]);

    function Loader(pydio) {
        _classCallCheck(this, Loader);

        this.pydio = pydio;
        this.pLoad = null;
        this.plugins = null;
    }

    _createClass(Loader, [{
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
                        lang = _this.pydio.user.getPreference('lang', true);
                    }
                    var url = _this.pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/plugins/' + lang;
                    window.fetch(url, {
                        method: 'GET',
                        credentials: 'same-origin',
                        headers: headers
                    }).then(function (response) {
                        _this.loading = false;
                        response.text().then(function (text) {
                            _this.plugins = _pydioUtilXml2['default'].parseXml(text).documentElement;
                            _this.pLoad = null;
                            resolve(_this.plugins);
                        });
                    })['catch'](function (e) {
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

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var fullPath = "frontend/plugin/" + pluginNode.getAttribute('id');
            // Load initial config

            api.getConfig(fullPath).then(function (response) {
                var currentData = JSON.parse(response.Data) || {};
                currentData["PYDIO_PLUGIN_ENABLED"] = enabled;
                var config = _pydioHttpRestApi.RestConfiguration.constructFromObject({
                    FullPath: fullPath,
                    Data: JSON.stringify(currentData)
                });
                api.putConfig(config.FullPath, config).then(function () {
                    callback();
                });
            });
        }
    }, {
        key: 'loadPluginConfigs',
        value: function loadPluginConfigs(pluginId) {
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var fullPath = "frontend/plugin/" + pluginId;
            return new Promise(function (resolve, reject) {
                api.getConfig(fullPath).then(function (response) {
                    var currentData = JSON.parse(response.Data) || {};
                    resolve(currentData);
                })['catch'](function (e) {
                    reject(e);
                });
            });
        }
    }, {
        key: 'savePluginConfigs',
        value: function savePluginConfigs(pluginId, values, callback) {

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var fullPath = "frontend/plugin/" + pluginId;

            api.getConfig(fullPath).then(function (response) {
                var currentData = JSON.parse(response.Data) || {};
                var newData = _pydioUtilLang2['default'].mergeObjectsRecursive(currentData, values);
                var config = _pydioHttpRestApi.RestConfiguration.constructFromObject({
                    FullPath: fullPath,
                    Data: JSON.stringify(newData)
                });
                api.putConfig(config.FullPath, config).then(function () {
                    callback(newData);
                });
            });
        }
    }]);

    return Loader;
})();

exports['default'] = Loader;
module.exports = exports['default'];
