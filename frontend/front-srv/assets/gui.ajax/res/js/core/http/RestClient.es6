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

import Pydio from 'pydio'
const {ApiClient} = require('./gen/index');
import moment from 'moment'
import qs from 'query-string'
import JobsServiceApi from "./gen/api/JobsServiceApi";
import RestUserJobRequest from "./gen/model/RestUserJobRequest";
import RestFrontSessionRequest from "./gen/model/RestFrontSessionRequest";
import RestFrontSessionResponse from "./gen/model/RestFrontSessionResponse";
import IdmApi from './IdmApi'

// Override parseDate method to support ISO8601 cross-browser
ApiClient.parseDate = function (str) {
    return moment(str).toDate();
};

// Override callApi Method
class RestClient extends ApiClient{

    /**
     *
     * @param pydioObject {Pydio}
     */
    constructor(pydioObject){
        super();
        this.basePath = pydioObject.Parameters.get('ENDPOINT_REST_API');
        this.enableCookies = true; // enables withCredentials()
        this.pydio = pydioObject;
    }

    /**
     *
     * @param request {RestFrontSessionRequest}
     * @return {Promise}
     */
    jwtEndpoint(request) {
        let headers = null;
        if(this.pydio.Parameters.has('MINISITE')) {
            headers = {"X-Pydio-Minisite":this.pydio.Parameters.get('MINISITE')};
        }
        return super.callApi(
            '/frontend/session', 'POST',
            null, null, headers, null,
            request, [], ['application/json'], ['application/json'],
            RestFrontSessionResponse
        );
    }

    /**
     * Get current JWT Token
     */
    static get() {
        return JSON.parse(window.sessionStorage.getItem("token"))
    }

    static store(token){
        window.sessionStorage.setItem("token", JSON.stringify(token))
    }

    static remove() {
        window.sessionStorage.removeItem("token")
    }

    getCurrentChallenge() {
        return qs.parse(window.location.search).login_challenge
    }

    sessionLoginWithCredentials(login, password){
        return this.jwtWithAuthInfo({login, password, challenge: this.getCurrentChallenge(), type:"credentials"})
    }

    sessionLoginWithAuthCode(code) {
        return this.jwtWithAuthInfo({code, type:"authorization_code"}, false);
    }

    sessionRefresh(){
        return this.jwtWithAuthInfo({type: "refresh"});
    }

    sessionLogout(){
        console.log("In sessionLogout")
        return this.jwtWithAuthInfo({type: "logout"});
    }

    jwtWithAuthInfo(authInfo, reloadRegistry = true) {
        const request = new RestFrontSessionRequest();
        request.AuthInfo = authInfo;
        return this.jwtEndpoint(request)
            .then(response => {
                if (response.data && response.data.RedirectTo) {
                    window.location.href = response.data.RedirectTo
                } else if (response.data && response.data.Trigger) {
                    this.pydio.getController().fireAction(response.data.Trigger, response.data.TriggerInfo);
                } else if (response.data && response.data.Token) {
                    RestClient.store(response.data.Token);
                } else if (request.AuthInfo.type === "logout") {
                    RestClient.remove()
                } else {
                    throw "no user found"
                }
            }).catch(e => {
                if (request.AuthInfo.type !== "logout") {
                    this.pydio.getController().fireAction('logout');
                }
                RestClient.remove()
                
                throw e
            });
    }

    getAuthToken() {
        const token = RestClient.get();
        const now = Math.floor(Date.now() / 1000);

        if (!token) {
            return Promise.reject("no token")
        }

        if (token.ExpiresAt >= now + 5) {
            return Promise.resolve(token.AccessToken)
        }

        if (!RestClient._updating) {
            RestClient._updating = this.sessionRefresh()
        }

        return RestClient._updating.then(() => {
            RestClient._updating = null;
            return this.getAuthToken()
        }).catch(() => RestClient._updating = null)
    }

    /**
     * @return {Promise}
     */
    getOrUpdateJwt(){
        return this.getAuthToken().then(token => token)
    }

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
    callApi(path, httpMethod, pathParams,
            queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts,
            returnType) {

        if (this.pydio.user && this.pydio.user.getPreference("lang")) {
            headerParams["X-Pydio-Language"] = this.pydio.user.getPreference("lang");
        }

        return this.getOrUpdateJwt()
            .then(token => token)
            .catch(() => "") // If no user we still want to call the request but with no authentication
            .then((accessToken) => {
                const authNames = [];
                if (accessToken !== "") {
                    authNames.push('oauth2');
                    this.authentications = {'oauth2': {type:'oauth2', accessToken: accessToken}};
                }
                return super.callApi(path, httpMethod, pathParams, queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts, returnType);
            })
            .then((response) => response)
            .catch((reason) =>{
                const msg = this.handleError(reason);
                if(msg){
                    return Promise.reject(msg);
                }
                return Promise.reject(reason);
            });
    }

    handleError(reason) {
        let msg = reason.message;
        if (reason.response && reason.response.body){
            msg = reason.response.body
        } else if (reason.response && reason.response.text){
            msg = reason.response.text;
        }
        if (reason.response && reason.response.status === 401) {
            this.pydio.getController().fireAction('logout');
        }
        if (reason.response && reason.response.status === 404) {
            // 404 may happen
            console.info('404 not found', msg);
            return msg;
        }
        if (reason.response && reason.response.status === 503) {
            // 404 may happen
            console.warn('Service currently unavailable', msg);
            return msg;
        }
        if (reason.response && reason.response.status === 423) {
            // 423 may happen
            console.warn('Resource currently locked', msg);
            return msg;
        }
        if(this.pydio && this.pydio.UI) {
            this.pydio.UI.displayMessage('ERROR', msg);
        }
        if (console) {
            console.error(reason);
        }
    }

    /**
     *
     * @param name
     * @param parameters
     * @return {Promise}
     */
    userJob(name, parameters) {
        const api = new JobsServiceApi(this);
        let request = new RestUserJobRequest();
        request.JobName = name;
        request.JsonParameters = JSON.stringify(parameters);
        return api.userCreateJob(name, request);
    }

    /**
     * @return {IdmApi}
     */
    getIdmApi(){
        return new IdmApi(this);
    }

}

export {RestClient as default}
