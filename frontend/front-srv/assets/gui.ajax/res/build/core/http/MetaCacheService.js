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
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _langObservable = require('../lang/Observable');

var _langObservable2 = _interopRequireDefault(_langObservable);

/**
 * API Client
 */

var MetaCacheService = (function (_Observable) {
    _inherits(MetaCacheService, _Observable);

    MetaCacheService.getInstance = function getInstance() {
        if (!MetaCacheService.INSTANCE) {
            MetaCacheService.INSTANCE = new MetaCacheService();
        }
        return MetaCacheService.INSTANCE;
    };

    function MetaCacheService() {
        _classCallCheck(this, MetaCacheService);

        _Observable.call(this);
        this._streams = new Map();
    }

    MetaCacheService.prototype.hasKey = function hasKey(streamName, keyName) {
        if (!this._streams.get(streamName)) {
            return false;
        }
        return this._streams.get(streamName).get('data').has(keyName);
    };

    MetaCacheService.prototype.getByKey = function getByKey(streamName, keyName) {
        if (!this._streams.get(streamName)) {
            return null;
        }
        return this._streams.get(streamName).get('data').get(keyName);
    };

    MetaCacheService.prototype.deleteKey = function deleteKey(streamName, keyName) {
        if (!this._streams.get(streamName)) {
            return;
        }
        this._streams.get(streamName).get('data')['delete'](keyName);
    };

    MetaCacheService.prototype.setKey = function setKey(streamName, keyName, value) {
        if (!this._streams.get(streamName)) {
            throw Error('Stream ' + streamName + ' not registered, please register first');
        }
        this._streams.get(streamName).get('data').set(keyName, value);
    };

    MetaCacheService.prototype.clearMetaStreamKeys = function clearMetaStreamKeys(streamName) {
        if (this._streams.has(streamName)) {
            this._streams.get(streamName).set('data', new Map());
        }
    };

    MetaCacheService.prototype.registerMetaStream = function registerMetaStream(streamName, expirationPolicy) {
        if (this._streams.get(streamName)) {
            return;
        }
        var data = new Map();
        data.set('expirationPolicy', expirationPolicy);
        data.set('data', new Map());
        this._streams.set(streamName, data);
        pydio.observeOnce("repository_list_refreshed", (function () {
            // Always keep the cache at workspace scope
            this._streams['delete'](streamName);
            this.registerMetaStream(streamName, expirationPolicy); // Re-register directly
        }).bind(this));
    };

    MetaCacheService.prototype.metaForNode = function metaForNode(streamName, ajxpNode, loaderCallback, remoteParser, cacheLoader) {
        var _this = this;

        if (!this._streams.has(streamName)) {
            throw new Error('Cannot find meta stream ' + streamName + ', please register it before using it');
        }
        var def = this._streams.get(streamName);
        var key = ajxpNode.getPath();
        var expirationPolicy = def.get('expirationPolicy');
        if (def.get('data').has(key)) {
            cacheLoader(def.get('data').get(key));
        } else {
            (function () {
                var clearValueObserver = (function () {
                    def.get('data')['delete'](key);
                }).bind(_this);

                // Cache response if success
                var cacheCallback = function cacheCallback(transport) {
                    var newData = remoteParser(transport);
                    if (newData !== null) {
                        var cachedData = newData;
                        if (newData instanceof AjxpNode) {
                            cachedData = new AjxpNode();
                            cachedData.replaceBy(newData);
                        }
                        def.get('data').set(key, cachedData);
                        if (expirationPolicy == MetaCacheService.EXPIRATION_LOCAL_NODE) {
                            ajxpNode.observeOnce("node_removed", clearValueObserver);
                            ajxpNode.observeOnce("node_replaced", clearValueObserver);
                        }
                    }
                };
                loaderCallback(ajxpNode, cacheCallback);
            })();
        }
    };

    MetaCacheService.prototype.invalidateMetaForKeys = function invalidateMetaForKeys(streamName, keyPattern) {
        if (!this._streams.has(streamName)) {
            throw new Error('Cannot find meta stream ' + streamName + ', please register it before using it');
        }
        var data = this._streams.get(streamName).get('data');
        data.forEach(function (value, key) {
            if (key.match(keyPattern)) {
                data['delete'](key);
            }
        });
    };

    return MetaCacheService;
})(_langObservable2['default']);

MetaCacheService.EXPIRATION_LOCAL_NODE = 'LOCAL_NODE';
MetaCacheService.EXPIRATION_MANUAL_TRIGGER = 'MANUAL_TRIGGER';

exports['default'] = MetaCacheService;
module.exports = exports['default'];
