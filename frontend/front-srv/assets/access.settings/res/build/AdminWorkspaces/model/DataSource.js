'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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
                    if (p === 'ObjectsPort') {
                        val = _this.fixPort(value);
                    } else if (p === 'StorageType') {
                        if (val === 'LOCAL') {
                            target['StorageConfiguration'] = { "folder": "", "normalize": "false" };
                        } else if (val === 'S3') {
                            target['StorageConfiguration'] = { "customEndpoint": "" };
                        }
                        _this.internalInvalid = false;
                        target['ApiKey'] = target['ApiSecret'] = ''; // reset values
                    } else if (p === 'Name') {
                            val = _pydioUtilLang2['default'].computeStringSlug(val).replace("-", "").substr(0, 50);
                        } else if (p === 'folder') {
                            if (val[0] !== '/') {
                                val = '/' + val;
                            }
                        } else if (p === 'invalid') {
                            _this.internalInvalid = value;
                            _this.notify('update');
                            return true;
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
                    } else {
                        return out;
                    }
                }
            });
        }
    }]);

    function DataSource(model) {
        var _this2 = this;

        _classCallCheck(this, DataSource);

        _get(Object.getPrototypeOf(DataSource.prototype), 'constructor', this).call(this);
        this.internalInvalid = false;
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
            this.model.ObjectsPort = 9001;
        }
        this.observableModel = this.buildProxy(this.model);

        DataSource.loadDatasources().then(function (result) {
            if (!result.DataSources) return;
            _this2.excludedPorts = result.DataSources.filter(function (dS) {
                return !(model && model.Name && model.Name === dS.Name);
            }).map(function (ds) {
                return ds.ObjectsPort;
            });
            if (!model) {
                _this2.observableModel.ObjectsPort = _this2.fixPort(_this2.observableModel.ObjectsPort); // will trigger proxy filtering
            }
        });
    }

    _createClass(DataSource, [{
        key: 'fixPort',
        value: function fixPort(newValue) {
            var port = parseInt(newValue);
            if (!this.excludedPorts) return port;
            while (this.excludedPorts.indexOf(port) !== -1) {
                port++;
            }
            return port;
        }

        /**
         * @return {ObjectDataSource}
         */
    }, {
        key: 'getModel',
        value: function getModel() {
            return this.observableModel;
        }
    }, {
        key: 'isValid',
        value: function isValid() {
            if (this.internalInvalid) {
                return false;
            }
            if (this.model.StorageType === 'S3') {
                return this.model.ApiKey && this.model.ApiSecret && this.model.Name && this.model.ObjectsBucket;
            } else {
                return this.model.Name && this.model.StorageConfiguration && this.model.StorageConfiguration['folder'];
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
            var _this3 = this;

            var api = new _pydioHttpRestApi.ConfigServiceApi(PydioApi.getRestClient());
            return api.putDataSource(this.model.Name, this.model).then(function (res) {
                _this3.snapshot = JSON.parse(JSON.stringify(_this3.model));
                _this3.notify('update');
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
            var _this4 = this;

            var prefix = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            if (prefix === '') {
                return this.model;
            }
            var data = {};
            Object.keys(this.model).forEach(function (k) {
                data[prefix + k] = _this4.model[k];
                if (k === 'EncryptionMode' && !_this4.model[k]) {
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
    }]);

    return DataSource;
})(Observable);

exports['default'] = DataSource;
module.exports = exports['default'];
