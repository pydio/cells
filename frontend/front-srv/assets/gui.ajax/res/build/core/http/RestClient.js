/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _PydioApi = require('./PydioApi');

var _PydioApi2 = _interopRequireDefault(_PydioApi);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _genApiJobsServiceApi = require("./gen/api/JobsServiceApi");

var _genApiJobsServiceApi2 = _interopRequireDefault(_genApiJobsServiceApi);

var _genModelRestUserJobRequest = require("./gen/model/RestUserJobRequest");

var _genModelRestUserJobRequest2 = _interopRequireDefault(_genModelRestUserJobRequest);

var _genApiFrontendServiceApi = require("./gen/api/FrontendServiceApi");

var _genApiFrontendServiceApi2 = _interopRequireDefault(_genApiFrontendServiceApi);

var _genModelRestFrontAuthRequest = require('./gen/model/RestFrontAuthRequest');

var _genModelRestFrontAuthRequest2 = _interopRequireDefault(_genModelRestFrontAuthRequest);

var _genModelRestFrontSessionRequest = require("./gen/model/RestFrontSessionRequest");

var _genModelRestFrontSessionRequest2 = _interopRequireDefault(_genModelRestFrontSessionRequest);

var _genModelRestFrontSessionResponse = require("./gen/model/RestFrontSessionResponse");

var _genModelRestFrontSessionResponse2 = _interopRequireDefault(_genModelRestFrontSessionResponse);

var _IdmApi = require('./IdmApi');

var _IdmApi2 = _interopRequireDefault(_IdmApi);

// Override parseDate method to support ISO8601 cross-browser

var _require = require('./gen/index');

var ApiClient = _require.ApiClient;
ApiClient.parseDate = function (str) {
    return _moment2['default'](str).toDate();
};

// Override callApi Method

var JwtApiClient = (function (_ApiClient) {
    _inherits(JwtApiClient, _ApiClient);

    /**
     *
     * @param pydioObject {Pydio}
     * @param options {Object}
     */

    function JwtApiClient(pydioObject) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, JwtApiClient);

        _ApiClient.call(this);
        this.basePath = pydioObject.Parameters.get('ENDPOINT_REST_API');
        this.enableCookies = true; // enables withCredentials()
        this.pydio = pydioObject;
        this.options = options;
        pydioObject.observe('beforeApply-logout', function () {
            _PydioApi2['default'].JWT_DATA = null;
        });
    }

    /**
     *
     * @param request {RestFrontSessionRequest}
     * @return {Promise}
     */

    JwtApiClient.prototype.jwtEndpoint = function jwtEndpoint(request) {
        var headers = null;
        if (this.pydio.Parameters.has('MINISITE')) {
            headers = { "X-Pydio-Minisite": this.pydio.Parameters.get('MINISITE') };
        }
        return _ApiClient.prototype.callApi.call(this, '/frontend/session', 'POST', null, null, headers, null, request, [], ['application/json'], ['application/json'], _genModelRestFrontSessionResponse2['default']);
    };

    /**
     *
     * @param frontJwtResponse {RestFrontSessionResponse}
     */

    JwtApiClient.storeJwtLocally = function storeJwtLocally(frontJwtResponse) {
        var now = Math.floor(Date.now() / 1000);
        _PydioApi2['default'].JWT_DATA = {
            jwt: frontJwtResponse.JWT,
            expirationTime: now + frontJwtResponse.ExpireTime
        };
    };

    /**
     * Call session endpoint for destroying session
     */

    JwtApiClient.prototype.sessionLogout = function sessionLogout() {
        var _this = this;

        var api = new _genApiFrontendServiceApi2['default'](this);
        var request = new _genModelRestFrontSessionRequest2['default']();

        request.Logout = true;
        return this.jwtEndpoint(request).then(function (response) {
            _PydioApi2['default'].JWT_DATA = null;
            _this.pydio.loadXmlRegistry();
        });
    };

    /**
     * Call session endpoint for destroying session
     */

    JwtApiClient.prototype.sessionAuth = function sessionAuth(requestID) {
        var api = new _genApiFrontendServiceApi2['default'](this);
        var request = new _genModelRestFrontAuthRequest2['default']();
        request.RequestID = requestID;

        return api.frontAuth(request);
    };

    /**
     * Create AuthInfo request with type "authorization_code"
     * @param code string
     * @return {Promise<any>}
     */

    JwtApiClient.prototype.jwtFromAuthorizationCode = function jwtFromAuthorizationCode(code) {
        return this.jwtWithAuthInfo({ code: code, type: "authorization_code" }, false);
    };

    /**
     * Create AuthInfo request with type "credentials"
     * @param login string
     * @param password string
     * @param reloadRegistry bool
     * @return {Promise<any>}
     */

    JwtApiClient.prototype.jwtFromCredentials = function jwtFromCredentials(login, password) {
        var reloadRegistry = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        return this.jwtWithAuthInfo({ login: login, password: password, type: "credentials" }, reloadRegistry);
    };

    JwtApiClient.prototype.jwtWithAuthInfo = function jwtWithAuthInfo(authInfo) {
        var _this2 = this;

        var reloadRegistry = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        var request = new _genModelRestFrontSessionRequest2['default']();
        request.AuthInfo = authInfo;
        return this.jwtEndpoint(request).then(function (response) {
            if (response.data && response.data.JWT) {
                JwtApiClient.storeJwtLocally(response.data);

                if (reloadRegistry) {
                    var targetRepository = null;
                    if (_this2.pydio.Parameters.has('START_REPOSITORY')) {
                        targetRepository = _this2.pydio.Parameters.get("START_REPOSITORY");
                    }
                    _this2.pydio.loadXmlRegistry(null, null, targetRepository);
                }
            } else if (response.data && response.data.Trigger) {
                _this2.pydio.getController().fireAction(response.data.Trigger, response.data.TriggerInfo);
            } else {
                _PydioApi2['default'].JWT_DATA = null;
            }
            return response;
        });
    };

    /**
     * @return {Promise}
     */

    JwtApiClient.prototype.getOrUpdateJwt = function getOrUpdateJwt() {
        var _this3 = this;

        var now = Math.floor(Date.now() / 1000);
        if (_PydioApi2['default'].JWT_DATA && _PydioApi2['default'].JWT_DATA['jwt'] && _PydioApi2['default'].JWT_DATA['expirationTime'] >= now) {
            return Promise.resolve(_PydioApi2['default'].JWT_DATA['jwt']);
        }

        if (_PydioApi2['default'].ResolvingJwt) {
            return _PydioApi2['default'].ResolvingJwt;
        }

        _PydioApi2['default'].ResolvingJwt = new Promise(function (resolve) {

            // Try to load JWT from session
            _this3.jwtEndpoint(new _genModelRestFrontSessionRequest2['default']()).then(function (response) {
                if (response.data && response.data.JWT) {
                    JwtApiClient.storeJwtLocally(response.data);
                    resolve(response.data.JWT);
                } else if (response.data && response.data.Trigger) {
                    _this3.pydio.getController().fireAction(response.data.Trigger, response.data.TriggerInfo);
                    resolve('');
                } else {
                    _PydioApi2['default'].JWT_DATA = null;
                    resolve('');
                }
                _PydioApi2['default'].ResolvingJwt = null;
            })['catch'](function (e) {
                if (e.response && e.response.status === 401) {
                    _this3.pydio.getController().fireAction('logout');
                    _PydioApi2['default'].ResolvingJwt = null;
                    throw e;
                }
                _PydioApi2['default'].JWT_DATA = null;
                resolve('');
                _PydioApi2['default'].ResolvingJwt = null;
            });
        });

        return _PydioApi2['default'].ResolvingJwt;
    };

    /**
     * Invokes the REST service using the supplied settings and parameters.
     * @param {String} path The base URL to invoke.
     * @param {String} httpMethod The HTTP method to use.
     * @param {Object.<String, String>} pathParams A map of path parameters and their values.
     * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
     * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
     * @param {Object.<String, Object>} formParams A map of form parameters and their values.
     * @param {Object} bodyParam The value to pass as the request body.
     * @param {Array.<String>} authNames An array of authentication type names.
     * @param {Array.<String>} contentTypes An array of request MIME types.
     * @param {Array.<String>} accepts An array of acceptable response MIME types.
     * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
     * constructor for a complex type.
     * @returns {Promise} A {@link https://www.promisejs.org/|Promise} object.
     */

    JwtApiClient.prototype.callApi = function callApi(path, httpMethod, pathParams, queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts, returnType) {
        var _this4 = this;

        if (this.pydio.user && this.pydio.user.getPreference("lang")) {
            headerParams["X-Pydio-Language"] = this.pydio.user.getPreference("lang");
        }

        return new Promise(function (resolve, reject) {

            _this4.getOrUpdateJwt().then(function (jwt) {
                var authNames = [];
                if (jwt) {
                    authNames.push('oauth2');
                    _this4.authentications = { 'oauth2': { type: 'oauth2', accessToken: jwt } };
                }
                var p = _ApiClient.prototype.callApi.call(_this4, path, httpMethod, pathParams, queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts, returnType);
                p.then(function (response) {
                    resolve(response);
                })['catch'](function (reason) {
                    _this4.handleError(reason);
                    reject(reason);
                });
            })['catch'](function (reason) {
                _this4.handleError(reason);
                reject(reason);
            });
        });
    };

    JwtApiClient.prototype.handleError = function handleError(reason) {
        var msg = reason.message;
        if (reason.response && reason.response.body) {
            msg = reason.response.body;
        } else if (reason.response && reason.response.text) {
            msg = reason.response.text;
        }
        if (reason.response && reason.response.status === 401) {
            this.pydio.getController().fireAction('logout');
        }
        if (reason.response && reason.response.status === 404) {
            // 404 may happen
            console.info('404 not found', msg);
            return;
        }
        if (this.pydio && this.pydio.UI && !this.options.silent) {
            this.pydio.UI.displayMessage('ERROR', msg);
        }
        if (console) {
            console.error(reason);
        }
    };

    /**
     *
     * @param name
     * @param parameters
     * @return {Promise}
     */

    JwtApiClient.prototype.userJob = function userJob(name, parameters) {
        var api = new _genApiJobsServiceApi2['default'](this);
        var request = new _genModelRestUserJobRequest2['default']();
        request.JobName = name;
        request.JsonParameters = JSON.stringify(parameters);
        return api.userCreateJob(name, request);
    };

    /**
     * @return {IdmApi}
     */

    JwtApiClient.prototype.getIdmApi = function getIdmApi() {
        return new _IdmApi2['default'](this);
    };

    return JwtApiClient;
})(ApiClient);

exports['default'] = JwtApiClient;
module.exports = exports['default'];
