'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var MetaClient = (function () {
    function MetaClient() {
        _classCallCheck(this, MetaClient);

        this.client = _pydioHttpApi2['default'].getRestClient();
    }

    /**
     * Save metas to server
     * @param nodes [{Node}]
     * @param values {Object}
     */

    _createClass(MetaClient, [{
        key: 'saveMeta',
        value: function saveMeta(nodes, values) {
            var _this = this;

            var api = new _pydioHttpRestApi.UserMetaServiceApi(this.client);
            return new Promise(function (resolve, reject) {
                _this.loadConfigs().then(function (configs) {
                    var proms = [];
                    nodes.map(function (node) {
                        var request = new _pydioHttpRestApi.IdmUpdateUserMetaRequest();
                        request.MetaDatas = [];
                        request.Operation = 'PUT';
                        configs.forEach(function (cData, cName) {
                            if (!values.has(cName)) {
                                return;
                            }
                            var meta = new _pydioHttpRestApi.IdmUserMeta();
                            meta.NodeUuid = node.getMetadata().get("uuid");
                            meta.Namespace = cName;
                            meta.JsonValue = JSON.stringify(values.get(cName));
                            meta.Policies = [_pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({
                                Action: 'READ',
                                Subject: '*',
                                Effect: 'allow'
                            }), _pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({
                                Action: 'WRITE',
                                Subject: '*',
                                Effect: 'allow'
                            })];
                            request.MetaDatas.push(meta);
                            node.getMetadata().set(cName, values.get(cName));
                        });
                        proms.push(api.updateUserMeta(request).then(function (resp) {
                            node.notify('node_replaced');
                        }));
                    });
                    Promise.all(proms).then(function () {
                        resolve();
                    })['catch'](function (e) {
                        reject(e);
                    });
                });
            });
        }
    }, {
        key: 'clearConfigs',
        value: function clearConfigs() {
            this.configs = null;
        }

        /**
         * @return {Promise<Map>}
         */
    }, {
        key: 'loadConfigs',
        value: function loadConfigs() {
            var _this2 = this;

            if (this.configs) {
                return Promise.resolve(this.configs);
            }

            if (this.promise) {
                return this.promise;
            }

            this.promise = new Promise(function (resolve) {
                var defs = {};
                var configMap = new Map();
                var api = new _pydioHttpRestApi.UserMetaServiceApi(_this2.client);
                api.listUserMetaNamespace().then(function (result) {
                    result.Namespaces.map(function (ns) {
                        var name = ns.Namespace;
                        var base = {
                            label: ns.Label,
                            indexable: ns.Indexable,
                            order: ns.Order,
                            visible: true
                        };
                        if (ns.JsonDefinition) {
                            (function () {
                                var jDef = JSON.parse(ns.JsonDefinition);
                                Object.keys(jDef).map(function (k) {
                                    base[k] = jDef[k];
                                });
                            })();
                        }
                        if (ns.Policies) {
                            ns.Policies.map(function (p) {
                                if (p.Action === 'READ') {
                                    base['readSubject'] = p.Subject;
                                } else if (p.Action === 'WRITE') {
                                    base['writeSubject'] = p.Subject;
                                }
                            });
                        }
                        defs[name] = base;
                    });
                    var arrConfigs = Object.entries(defs).map(function (entry) {
                        entry[1].ns = entry[0];
                        return entry[1];
                    });
                    arrConfigs.sort(function (a, b) {
                        var orderA = a.order || 0;
                        var orderB = b.order || 0;
                        return orderA > orderB ? 1 : orderA === orderB ? 0 : -1;
                    });
                    arrConfigs.map(function (value) {
                        var type = value.type;
                        if (type === 'choice' && value.data) {
                            (function () {
                                var values = new Map();
                                value.data.split(",").map(function (keyLabel) {
                                    var parts = keyLabel.split("|");
                                    values.set(parts[0], parts[1]);
                                });
                                value.data = values;
                            })();
                        }
                        configMap.set(value.ns, value);
                    });
                    _this2.configs = configMap;
                    resolve(configMap);
                    _this2.promise = null;
                })['catch'](function () {
                    resolve(new Map());
                    _this2.promise = null;
                });
            });

            return this.promise;
        }

        /**
         * @param namespace String
         * @return {Promise<Array>}
         */
    }, {
        key: 'listTags',
        value: function listTags(namespace) {
            var _this3 = this;

            return new Promise(function (resolve) {

                var api = new _pydioHttpRestApi.UserMetaServiceApi(_this3.client);
                api.listUserMetaTags(namespace).then(function (response) {
                    if (response.Tags) {
                        resolve(response.Tags);
                    } else {
                        resolve([]);
                    }
                })['catch'](function (e) {
                    resolve([]);
                });
            });
        }

        /**
         *
         * @param namespace string
         * @param newTag string
         * @return {Promise}
         */
    }, {
        key: 'createTag',
        value: function createTag(namespace, newTag) {

            var api = new _pydioHttpRestApi.UserMetaServiceApi(this.client);
            return api.putUserMetaTag(namespace, _pydioHttpRestApi.RestPutUserMetaTagRequest.constructFromObject({
                Namespace: namespace,
                Tag: newTag
            }));
        }
    }]);

    return MetaClient;
})();

exports['default'] = MetaClient;
module.exports = exports['default'];
