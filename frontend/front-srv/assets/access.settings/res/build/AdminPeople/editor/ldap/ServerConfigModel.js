'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require("pydio/lang/observable");

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var ServerConfigModel = (function (_Observable) {
    _inherits(ServerConfigModel, _Observable);

    _createClass(ServerConfigModel, [{
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    target[p] = value;
                    _this.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (out instanceof Array) {
                        if (p === 'MappingRules') {
                            return out.map(function (rule) {
                                return _this.buildProxy(rule);
                            });
                        }
                        return out;
                    } else if (out instanceof Object) {
                        return _this.buildProxy(out);
                    } else if (p === 'User') {
                        var filter = new _pydioHttpRestApi.AuthLdapSearchFilter();
                        target[p] = _this.buildProxy(filter);
                        return target[p];
                    } else {
                        return out;
                    }
                }
            });
        }
    }]);

    function ServerConfigModel(configId, config) {
        _classCallCheck(this, ServerConfigModel);

        _get(Object.getPrototypeOf(ServerConfigModel.prototype), 'constructor', this).call(this);
        //this.config = new AuthLdapServerConfig();
        //this.config.DomainName = 'New Directory';
        this.configId = configId;
        this.config = config;
        this.observableConfig = this.buildProxy(this.config);
    }

    /**
     *
     * @return {AuthLdapServerConfig}
     */

    _createClass(ServerConfigModel, [{
        key: 'getConfig',
        value: function getConfig() {
            return this.observableConfig;
        }
    }, {
        key: 'isValid',
        value: function isValid() {
            return true;
        }
    }, {
        key: 'snapshot',
        value: function snapshot() {
            return _pydioHttpRestApi.AuthLdapServerConfig.constructFromObject(JSON.parse(JSON.stringify(this.config)));
        }
    }, {
        key: 'revertTo',
        value: function revertTo(snapshot) {
            this.config = _pydioHttpRestApi.AuthLdapServerConfig.constructFromObject(JSON.parse(JSON.stringify(snapshot)));
            this.observableConfig = this.buildProxy(this.config);
            return this.observableConfig;
        }

        /**
         * @return {Promise}
         */
    }, {
        key: 'save',
        value: function save() {
            var api = new _pydioHttpRestApi.EnterpriseConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestExternalDirectoryConfig();
            request.ConfigId = this.configId;
            request.Config = this.config;
            return api.putExternalDirectory(this.configId, request);
        }

        /**
         * @return {Promise}
         */
    }], [{
        key: 'loadDirectories',
        value: function loadDirectories() {
            var api = new _pydioHttpRestApi.EnterpriseConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.listExternalDirectories();
        }

        /**
         * @param configId
         * @return {Promise}
         */
    }, {
        key: 'deleteDirectory',
        value: function deleteDirectory(configId) {
            var api = new _pydioHttpRestApi.EnterpriseConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.deleteExternalDirectory(configId);
        }
    }]);

    return ServerConfigModel;
})(_pydioLangObservable2['default']);

exports['default'] = ServerConfigModel;
module.exports = exports['default'];
