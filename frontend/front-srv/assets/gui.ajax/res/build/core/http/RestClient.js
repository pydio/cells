/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _IdmApi = require('./IdmApi');

var _IdmApi2 = _interopRequireDefault(_IdmApi);

var _PydioStorage = require('./PydioStorage');

var _PydioStorage2 = _interopRequireDefault(_PydioStorage);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _cellsSdk = require('cells-sdk');

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

// Override parseDate method to support ISO8601 cross-browser
_cellsSdk.ApiClient.parseDate = function (str) {
    return _moment2['default'](str).toDate();
};

// Override callApi Method

var RestClient = (function (_ApiClient) {
    _inherits(RestClient, _ApiClient);

    /**
     *
     * @param pydioObject {Pydio}
     */

    function RestClient(pydioObject) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, RestClient);

        _ApiClient.call(this);
        this.uuid = _uuid42['default']();
        this.basePath = pydioObject.Parameters.get('ENDPOINT_REST_API');
        this.enableCookies = true; // enables withCredentials()
        this.pydio = pydioObject;
        this.options = options;
    }

    /**
     *
     * @param request {RestFrontSessionRequest}
     * @return {Promise}
     */

    RestClient.prototype.jwtEndpoint = function jwtEndpoint(request) {
        var headers = null;
        if (this.pydio.Parameters.has('MINISITE')) {
            headers = { "X-Pydio-Minisite": this.pydio.Parameters.get('MINISITE') };
        }

        return _ApiClient.prototype.callApi.call(this, '/frontend/session', 'POST', null, null, headers, null, request, [], ['application/json'], ['application/json'], _cellsSdk.RestFrontSessionResponse);
    };

    /**
     * Get current JWT Token
     */

    RestClient.prototype.get = function get() {
        return JSON.parse(_PydioStorage2['default'].getSessionStorage().getItem(this.tokenKey()));
    };

    RestClient.prototype.store = function store(token) {
        _PydioStorage2['default'].getSessionStorage().setItem(this.tokenKey(), JSON.stringify(token));
    };

    RestClient.prototype.remove = function remove() {
        _PydioStorage2['default'].getSessionStorage().removeItem(this.tokenKey());
    };

    RestClient.prototype.tokenKey = function tokenKey() {
        if (this.pydio.Parameters.has('MINISITE')) {
            return "token-" + this.pydio.Parameters.get('MINISITE');
        }

        return "token";
    };

    RestClient.prototype.getCurrentChallenge = function getCurrentChallenge() {
        return _queryString2['default'].parse(window.location.search).login_challenge;
    };

    RestClient.prototype.sessionLoginWithCredentials = function sessionLoginWithCredentials(login, password) {
        return this.jwtWithAuthInfo({ login: login, password: password, challenge: this.getCurrentChallenge(), type: "credentials" });
    };

    RestClient.prototype.sessionLoginWithAuthCode = function sessionLoginWithAuthCode(code) {
        return this.jwtWithAuthInfo({ code: code, type: "authorization_code" }, false);
    };

    RestClient.prototype.sessionRefresh = function sessionRefresh() {
        return this.jwtWithAuthInfo({ type: "refresh" });
    };

    RestClient.prototype.sessionLogout = function sessionLogout() {
        var _this = this;

        return this.jwtWithAuthInfo({ type: "logout" }).then(function () {
            return _this.removeSessionId();
        });
    };

    RestClient.prototype.jwtWithAuthInfo = function jwtWithAuthInfo(authInfo) {
        var _this2 = this;

        var request = new _cellsSdk.RestFrontSessionRequest();
        request.AuthInfo = authInfo;

        return this.jwtEndpoint(request).then(function (response) {
            if (response.data && response.data.RedirectTo) {
                window.location.href = response.data.RedirectTo;
            } else if (response.data && response.data.Trigger) {
                _this2.pydio.getController().fireAction(response.data.Trigger, response.data.TriggerInfo);
            } else if (response.data && response.data.Token) {
                _this2.store(response.data.Token);
            } else if (request.AuthInfo.type === "logout") {
                _this2.remove();
            } else {
                throw "no user found";
            }
        })['catch'](function (e) {
            if (request.AuthInfo.type !== "logout") {
                _this2.pydio.getController().fireAction('logout');
            }
            _this2.remove();

            throw e;
        });
    };

    RestClient.prototype.getAuthToken = function getAuthToken() {
        var _this3 = this;

        var token = this.get();
        var now = Math.floor(Date.now() / 1000);

        if (!token) {
            return Promise.reject("invalid token");
        }

        if (token.ExpiresAt >= now + 5) {
            return Promise.resolve(token.AccessToken);
        }

        if (!RestClient._updating) {
            RestClient._updating = this.sessionRefresh();
        }

        return RestClient._updating.then(function () {
            RestClient._updating = null;
            return _this3.getAuthToken();
        })['catch'](function () {
            RestClient._updating = null;
        });
    };

    /**
     * @return {Promise}
     */

    RestClient.prototype.getOrUpdateJwt = function getOrUpdateJwt() {
        return this.getAuthToken().then(function (token) {
            return token;
        });
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

    RestClient.prototype.callApi = function callApi(path, httpMethod, pathParams, queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts, returnType) {
        var _this4 = this;

        if (this.pydio.user && this.pydio.user.getPreference("lang")) {
            headerParams["X-Pydio-Language"] = this.pydio.user.getPreference("lang");
        }

        return this.getOrUpdateJwt().then(function (token) {
            return token;
        })['catch'](function () {
            return "";
        }) // If no user we still want to call the request but with no authentication
        .then(function (accessToken) {
            var authNames = [];
            if (accessToken !== "") {
                authNames.push('oauth2');
                _this4.authentications = { 'oauth2': { type: 'oauth2', accessToken: accessToken } };
            }
            return _ApiClient.prototype.callApi.call(_this4, path, httpMethod, pathParams, queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts, returnType);
        }).then(function (response) {
            return response;
        })['catch'](function (reason) {
            var msg = _this4.handleError(reason);
            if (msg) {
                return Promise.reject(msg);
            }
            return Promise.reject(reason);
        });
    };

    RestClient.prototype.handleError = function handleError(reason) {
        var msg = reason.message;
        var replace = false;
        if (reason.response && reason.response.body) {
            msg = reason.response.body;
            if (msg.Title) {
                msg = msg.Title;
            }
            replace = true;
        } else if (reason.response && reason.response.text) {
            msg = reason.response.text;
            replace = true;
        }
        if (reason.response && reason.response.status === 401) {
            this.pydio.getController().fireAction('logout');
        }
        if (reason.response && reason.response.status === 404) {
            // 404 may happen
            console.info('404 not found', msg);
            return { message: msg };
        }
        if (reason.response && reason.response.status === 503) {
            // 404 may happen
            console.warn('Service currently unavailable', msg);
            return { message: msg };
        }
        if (reason.response && reason.response.status === 423) {
            // 423 may happen
            console.warn('Resource currently locked', msg);
            return { message: msg };
        }
        if (this.pydio && this.pydio.UI && !(this.options && this.options.silent)) {
            this.pydio.UI.displayMessage('ERROR', msg);
        }
        if (replace) {
            return { message: msg };
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

    RestClient.prototype.userJob = function userJob(name, parameters) {
        var api = new _cellsSdk.JobsServiceApi(this);
        var request = new _cellsSdk.RestUserJobRequest();
        request.JobName = name;
        request.JsonParameters = JSON.stringify(parameters);
        return api.userCreateJob(name, request);
    };

    /**
     * @return {IdmApi}
     */

    RestClient.prototype.getIdmApi = function getIdmApi() {
        return new _IdmApi2['default'](this);
    };

    return RestClient;
})(_cellsSdk.ApiClient);

exports['default'] = RestClient;
module.exports = exports['default'];
