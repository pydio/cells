/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Observable = require('pydio/lang/observable');
var PydioApi = require('pydio/http/api');

var DataSource = (function (_Observable) {
    _inherits(DataSource, _Observable);

    _createClass(DataSource, [{
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    var val = value;
                    if (p === 'StorageType') {
                        target['StorageConfiguration'] = {};
                        if (val === 'LOCAL') {
                            target['StorageConfiguration'] = { "folder": "", "normalize": "false" };
                        } else if (val === 'S3') {
                            target['StorageConfiguration'] = { "customEndpoint": "" };
                        } else if (val === 'GCS') {
                            target['StorageConfiguration'] = { "jsonCredentials": "" };
                        }
                        _this.internalInvalid = false;
                        target['ApiKey'] = target['ApiSecret'] = ''; // reset values
                    } else if (p === 'Name') {
                            // Limit Name to 33 chars
                            val = _pydioUtilLang2['default'].computeStringSlug(val).replace("-", "").substr(0, 33);
                            if (_this.existingNames && _this.existingNames.indexOf(val) > -1) {
                                _this.nameInvalid = true;
                            } else {
                                _this.nameInvalid = false;
                            }
                        } else if (p === 'folder') {
                            if (val[0] !== '/') {
                                val = '/' + val;
                            }
                        } else if (p === 'invalid') {
                            _this.internalInvalid = value;
                            _this.notify('update');
                            return true;
                        } else if (p === 'PeerAddress') {
                            if (value === 'ANY') {
                                val = '';
                            }
                        }
                    target[p] = val;
                    _this.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (out instanceof Array) {
                        return out;
                    } else if (out instanceof Object) {
                        return _this.buildProxy(out);
                    } else if (p === 'StorageType') {
                        return out || 'LOCAL';
                    } else if (p === 'PeerAddress') {
                        return out || 'ANY';
                    } else {
                        return out;
                    }
                }
            });
        }
    }]);

    function DataSource(model) {
        var existingNames = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        _classCallCheck(this, DataSource);

        _get(Object.getPrototypeOf(DataSource.prototype), 'constructor', this).call(this);
        this.internalInvalid = false;
        this.nameInvalid = false;
        this.existingNames = existingNames;
        if (model) {
            this.model = model;
            if (!model.StorageConfiguration) {
                model.StorageConfiguration = {};
            }
            this.snapshot = JSON.parse(JSON.stringify(model));
        } else {
            this.model = new _pydioHttpRestApi.ObjectDataSource();
            this.model.EncryptionMode = _pydioHttpRestApi.ObjectEncryptionMode.constructFromObject('CLEAR');
            this.model.StorageType = _pydioHttpRestApi.ObjectStorageType.constructFromObject('LOCAL');
            this.model.StorageConfiguration = { "folder": "", "normalize": "false" };
        }
        this.observableModel = this.buildProxy(this.model);
    }

    /**
     * @return {ObjectDataSource}
     */

    _createClass(DataSource, [{
        key: 'getModel',
        value: function getModel() {
            return this.observableModel;
        }
    }, {
        key: 'isValid',
        value: function isValid() {
            if (this.internalInvalid || this.nameInvalid) {
                return false;
            }
            if (this.model.StorageType === 'S3' || this.model.StorageType === 'AZURE') {
                return this.model.ApiKey && this.model.ApiSecret && this.model.Name && (this.model.ObjectsBucket || this.model.StorageConfiguration.bucketsRegexp);
            } else if (this.model.StorageType === 'GCS') {
                return this.model.Name && this.model.ObjectsBucket && this.model.StorageConfiguration && this.model.StorageConfiguration['jsonCredentials'];
            } else {
                return this.model.Name && this.model.StorageConfiguration && this.model.StorageConfiguration['folder'];
            }
        }

        /**
         *
         * @param translateFunc {Function} Translate function
         * @return {*}
         */
    }, {
        key: 'getNameError',
        value: function getNameError(translateFunc) {
            if (this.nameInvalid) {
                return translateFunc('name.inuse');
            } else {
                return null;
            }
        }
    }, {
        key: 'deleteSource',
        value: function deleteSource() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(PydioApi.getRestClient());
            return api.deleteDataSource(this.model.Name);
        }
    }, {
        key: 'resyncSource',
        value: function resyncSource() {
            var api = new _pydioHttpRestApi.JobsServiceApi(PydioApi.getRestClient());
            var req = new _pydioHttpRestApi.RestUserJobRequest();
            req.JobName = "datasource-resync";
            req.JsonParameters = JSON.stringify({ dsName: this.model.Name });
            return api.userCreateJob("datasource-resync", req);
        }
    }, {
        key: 'revert',
        value: function revert() {
            this.model = this.snapshot;
            this.observableModel = this.buildProxy(this.model);
            this.snapshot = JSON.parse(JSON.stringify(this.model));
            return this.observableModel;
        }
    }, {
        key: 'saveSource',
        value: function saveSource() {
            var _this2 = this;

            var api = new _pydioHttpRestApi.ConfigServiceApi(PydioApi.getRestClient());
            return api.putDataSource(this.model.Name, this.model).then(function (res) {
                _this2.snapshot = JSON.parse(JSON.stringify(_this2.model));
                _this2.notify('update');
            });
        }
    }, {
        key: 'stripPrefix',
        value: function stripPrefix(data) {
            var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            if (!prefix) {
                return data;
            }
            var obj = {};
            Object.keys(data).map(function (k) {
                obj[k.replace(prefix, '')] = data[k];
            });
            return obj;
        }
    }, {
        key: 'getDataWithPrefix',
        value: function getDataWithPrefix() {
            var _this3 = this;

            var prefix = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            if (prefix === '') {
                return this.model;
            }
            var data = {};
            Object.keys(this.model).forEach(function (k) {
                data[prefix + k] = _this3.model[k];
                if (k === 'EncryptionMode' && !_this3.model[k]) {
                    data[prefix + k] = 'CLEAR';
                }
            });
            return data;
        }
    }], [{
        key: 'loadDatasources',
        value: function loadDatasources() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(PydioApi.getRestClient());
            return api.listDataSources();
        }
    }, {
        key: 'loadVersioningPolicies',
        value: function loadVersioningPolicies() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(PydioApi.getRestClient());
            return api.listVersioningPolicies();
        }
    }, {
        key: 'loadStatuses',
        value: function loadStatuses() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(PydioApi.getRestClient());
            return api.listServices('STARTED');
        }
    }, {
        key: 'loadEncryptionKeys',
        value: function loadEncryptionKeys() {
            var api = new _pydioHttpRestApi.ConfigServiceApi(PydioApi.getRestClient());
            return api.listEncryptionKeys(new _pydioHttpRestApi.EncryptionAdminListKeysRequest());
        }
    }, {
        key: 'loadBuckets',
        value: function loadBuckets(model) {
            var regexp = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            var api = new _pydioHttpRestApi.ConfigServiceApi(PydioApi.getRestClient());
            var request = new _pydioHttpRestApi.RestListStorageBucketsRequest();
            request.DataSource = model;
            if (regexp) {
                request.BucketsRegexp = regexp;
            }
            return api.listStorageBuckets(request);
        }
    }]);

    return DataSource;
})(Observable);

exports['default'] = DataSource;
module.exports = exports['default'];
