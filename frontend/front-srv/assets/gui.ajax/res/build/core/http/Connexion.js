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

var _utilXMLUtils = require('../util/XMLUtils');

var _utilXMLUtils2 = _interopRequireDefault(_utilXMLUtils);

/**
 * Pydio encapsulation of XHR / Fetch
 */
require('whatwg-fetch');

var Connexion = (function () {

    /**
     * Constructor
     * @param baseUrl String The base url for services
     */

    function Connexion(baseUrl) {
        _classCallCheck(this, Connexion);

        this._pydio = window.pydio;
        this._baseUrl = baseUrl || window.ajxpServerAccessPath;
        this._libUrl = window.ajxpResourcesFolder + '/build';
        this._parameters = new Map();
        this._method = 'post';
        this.discrete = false;
    }

    Connexion.updateServerAccess = function updateServerAccess(parameters) {

        if (parameters.get('SECURE_TOKEN')) {
            Connexion.SECURE_TOKEN = parameters.get('SECURE_TOKEN');
        }
        var serverAccessPath = parameters.get('ajxpServerAccess').split('?').shift();
        if (parameters.get('SERVER_PREFIX_URI')) {
            parameters.set('ajxpResourcesFolder', parameters.get('SERVER_PREFIX_URI') + parameters.get('ajxpResourcesFolder'));
            serverAccessPath = parameters.get('SERVER_PREFIX_URI') + serverAccessPath + '?' + (Connexion.SECURE_TOKEN ? 'secure_token=' + Connexion.SECURE_TOKEN : '');
        } else {
            serverAccessPath = serverAccessPath + '?' + (Connexion.SECURE_TOKEN ? 'secure_token=' + Connexion.SECURE_TOKEN : '');
        }
        if (parameters.get('SERVER_PERMANENT_PARAMS')) {
            var permParams = parameters.get('SERVER_PERMANENT_PARAMS');
            var permStrings = [];
            for (var permanent in permParams) {
                if (permParams.hasOwnProperty(permanent)) {
                    permStrings.push(permanent + '=' + permParams[permanent]);
                }
            }
            permStrings = permStrings.join('&');
            if (permStrings) {
                serverAccessPath += '&' + permStrings;
            }
        }

        parameters.set('ajxpServerAccess', serverAccessPath);
        // BACKWARD COMPAT
        window.ajxpServerAccessPath = serverAccessPath;
        if (window.pydioBootstrap && window.pydioBootstrap.parameters) {
            pydioBootstrap.parameters.set("ajxpServerAccess", serverAccessPath);
            pydioBootstrap.parameters.set("SECURE_TOKEN", Connexion.SECURE_TOKEN);
        }
    };

    Connexion.log = function log(action, syncStatus) {
        if (!Connexion.PydioLogs) {
            Connexion.PydioLogs = [];
        }
        Connexion.PydioLogs.push({ action: action, sync: syncStatus });
    };

    /**
     * Set the query method (get post)
     * @param method String
     */

    Connexion.prototype.setMethod = function setMethod(method) {
        this._method = method;
    };

    /**
     * Show a small loader
     */

    Connexion.prototype.showLoader = function showLoader() {
        if (this.discrete || !this._pydio) return;
        this._pydio.notify("connection-start");
    };

    /**
     * Hide a small loader
     */

    Connexion.prototype.hideLoader = function hideLoader() {
        if (this.discrete || !this._pydio) return;
        this._pydio.notify("connection-end");
    };

    Connexion.prototype.send = function send() {
        var _this = this;

        this.showLoader();
        var oThis = this;
        var options = {
            method: this._method,
            credentials: 'same-origin'
        };
        var url = this._baseUrl;
        var bodyParts = [];
        this._parameters.forEach(function (value, key) {
            if (value instanceof Array) {
                value.map(function (oneV) {
                    bodyParts.push(key + '=' + encodeURIComponent(oneV));
                });
            } else {
                bodyParts.push(key + '=' + encodeURIComponent(value));
            }
        });
        var queryString = bodyParts.join('&');
        if (this._method === 'post') {
            options.headers = { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" };
            options.body = queryString;
        } else {
            url += (url.indexOf('?') > -1 ? '&' : '?') + queryString;
        }
        window.fetch(url, options).then(function (response) {

            var h = response.headers.get('Content-type');
            if (h.indexOf('/json') !== -1) {
                response.json().then(function (json) {
                    oThis.applyComplete({ responseJSON: json }, response);
                });
            } else if (h.indexOf('/xml') !== -1) {
                response.text().then(function (text) {
                    oThis.applyComplete({ responseXML: _utilXMLUtils2['default'].parseXml(text) }, response);
                });
            } else {
                response.text().then(function (text) {
                    oThis.applyComplete({ responseText: text }, response);
                });
            }
            return response;
        })['catch'](function (error) {
            if (_this._pydio) {
                _this._pydio.displayMessage('ERROR', 'Network error ' + error.message);
            }
        });
    };

    /**
     * Apply the complete callback, try to grab maximum of errors
     * @param parsedBody Transpot
     */

    Connexion.prototype.applyComplete = function applyComplete(parsedBody, response) {
        this.hideLoader();
        var pydio = this._pydio;
        var message = undefined,
            tokenMessage = undefined;
        var tok1 = "Ooops, it seems that your security token has expired! Please %s by hitting refresh or F5 in your browser!";
        var tok2 = "reload the page";
        if (window.MessageHash && window.MessageHash[437]) {
            tok1 = window.MessageHash[437];
            tok2 = window.MessageHash[438];
        }
        tokenMessage = tok1.replace("%s", "<a href='javascript:document.location.reload()' style='text-decoration: underline;'>" + tok2 + "</a>");

        var ctype = response.headers.get('Content-type');
        if (parsedBody.responseXML && parsedBody.responseXML.documentElement && parsedBody.responseXML.documentElement.nodeName == "parsererror") {

            message = "Parsing error : \n" + parsedBody.responseXML.documentElement.firstChild.textContent;
        } else if (parsedBody.responseXML && parsedBody.responseXML.parseError && parsedBody.responseXML.parseError.errorCode != 0) {

            message = "Parsing Error : \n" + parsedBody.responseXML.parseError.reason;
        } else if (ctype.indexOf("text/xml") > -1 && parsedBody.responseXML == null) {

            message = "Expected XML but got empty response!";
        } else if (ctype.indexOf("text/xml") == -1 && ctype.indexOf("application/json") == -1 && parsedBody.responseText.indexOf("<b>Fatal error</b>") > -1) {

            message = parsedBody.responseText.replace("<br />", "");
        } else if (response.status == 500) {

            message = "Internal Server Error: you should check your web server logs to find what's going wrong!";
        }
        if (message) {

            if (message.startsWith("You are not allowed to access this resource.")) {
                message = tokenMessage;
            }
            if (pydio) {
                pydio.displayMessage("ERROR", message);
            } else {
                alert(message);
            }
        }
        if (parsedBody.responseXML && parsedBody.responseXML.documentElement) {

            var authNode = _utilXMLUtils2['default'].XPathSelectSingleNode(parsedBody.responseXML.documentElement, "require_auth");
            if (authNode && pydio) {
                var root = pydio.getContextHolder().getRootNode();
                if (root) {
                    pydio.getContextHolder().setContextNode(root);
                    root.clear();
                }

                pydio.fire('login_required');
            }

            var messageNode = _utilXMLUtils2['default'].XPathSelectSingleNode(parsedBody.responseXML.documentElement, "message");
            if (messageNode) {
                var messageType = messageNode.getAttribute("type").toUpperCase();
                var messageContent = _utilXMLUtils2['default'].getDomNodeText(messageNode);
                if (messageContent.startsWith("You are not allowed to access this resource.")) {
                    messageContent = tokenMessage;
                }
                if (pydio) {
                    pydio.displayMessage(messageType, messageContent);
                } else {
                    if (messageType == "ERROR") {
                        alert(messageType + ":" + messageContent);
                    }
                }
                if (messageType == "SUCCESS") messageNode.parentNode.removeChild(messageNode);
            }
        }
        if (this.onComplete) {

            parsedBody.status = response.status;
            parsedBody.responseObject = response;
            this.onComplete(parsedBody);
        }
        if (pydio) {
            pydio.fire("server_answer", this);
        }
    };

    Connexion.prototype.uploadFile = function uploadFile(file, fileParameterName, uploadUrl) {
        var onComplete = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];
        var onError = arguments.length <= 4 || arguments[4] === undefined ? function () {} : arguments[4];

        var _this2 = this;

        var onProgress = arguments.length <= 5 || arguments[5] === undefined ? function () {} : arguments[5];
        var xhrSettings = arguments.length <= 6 || arguments[6] === undefined ? {} : arguments[6];

        var xhr = this.initializeXHRForUpload(uploadUrl, onComplete, onError, onProgress, xhrSettings);
        if (xhrSettings && xhrSettings.method === 'PUT') {
            xhr.send(file);
            return xhr;
        }
        if (window.FormData) {
            this.sendFileUsingFormData(xhr, file, fileParameterName);
        } else if (window.FileReader) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                _this2.xhrSendAsBinary(xhr, file.name, e.target.result, fileParameterName);
            };
            fileReader.readAsBinaryString(file);
        } else if (file.getAsBinary) {
            this.xhrSendAsBinary(xhr, file.name, file.getAsBinary(), fileParameterName);
        }
        return xhr;
    };

    Connexion.prototype.initializeXHRForUpload = function initializeXHRForUpload(url, onComplete, onError, onProgress) {
        var xhrSettings = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

        var xhr = new XMLHttpRequest();
        var upload = xhr.upload;
        if (xhrSettings.withCredentials) {
            xhr.withCredentials = true;
        }
        upload.addEventListener("progress", function (e) {
            if (!e.lengthComputable) {
                return;
            }
            onProgress(e);
        }, false);
        xhr.onreadystatechange = (function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    onComplete(xhr);
                } else {
                    onError(xhr);
                }
            }
        }).bind(this);
        upload.onerror = function () {
            onError(xhr);
        };
        var method = 'POST';
        if (xhrSettings.method) {
            method = xhrSettings.method;
        }
        xhr.open(method, url, true);
        if (xhrSettings.customHeaders) {
            Object.keys(xhrSettings.customHeaders).forEach(function (k) {
                xhr.setRequestHeader(k, xhrSettings.customHeaders[k]);
            });
        }

        return xhr;
    };

    Connexion.prototype.sendFileUsingFormData = function sendFileUsingFormData(xhr, file, fileParameterName) {
        var formData = new FormData();
        formData.append(fileParameterName, file);
        xhr.send(formData);
    };

    Connexion.prototype.xhrSendAsBinary = function xhrSendAsBinary(xhr, fileName, fileData, fileParameterName) {
        var boundary = '----MultiPartFormBoundary' + new Date().getTime();
        xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary=" + boundary);

        var body = "--" + boundary + "\r\n";
        body += "Content-Disposition: form-data; name='" + fileParameterName + "'; filename='" + unescape(encodeURIComponent(fileName)) + "'\r\n";
        body += "Content-Type: application/octet-stream\r\n\r\n";
        body += fileData + "\r\n";
        body += "--" + boundary + "--\r\n";

        xhr.sendAsBinary(body);
    };

    /**
     * Load a javascript library
     * @param fileName String
     * @param onLoadedCode Function Callback
        * @param aSync Boolean load library asynchroneously
     */

    Connexion.prototype.loadLibrary = function loadLibrary(fileName, onLoadedCode, aSync) {
        var _this3 = this;

        if (window.pydioBootstrap && window.pydioBootstrap.parameters.get("ajxpVersion") && fileName.indexOf("?") === -1) {
            fileName += "?v=" + window.pydioBootstrap.parameters.get("ajxpVersion");
        }
        var url = this._libUrl ? this._libUrl + '/' + fileName : fileName;
        var pydio = this._pydio;

        var scriptLoaded = function scriptLoaded(script) {
            try {
                if (window.execScript) {
                    window.execScript(script);
                } else {
                    window.my_code = script;
                    var head = document.getElementsByTagName('head')[0];
                    var script_tag = document.createElement('script');
                    script_tag.type = 'text/javascript';
                    script_tag.innerHTML = 'eval(window.my_code)';
                    head.appendChild(script_tag);
                    delete window.my_code;
                    head.removeChild(script_tag);
                }
                if (onLoadedCode != null) onLoadedCode();
            } catch (e) {
                alert('error loading ' + fileName + ':' + e.message);
                if (console) console.error(e);
            }
            if (pydio) pydio.fire("server_answer");
        };

        if (aSync) {
            window.fetch(url, {
                method: 'GET',
                credentials: 'same-origin'
            }).then(function (response) {
                return response.text();
            }).then(function (script) {
                scriptLoaded(script);
            });
        } else {
            (function () {
                // SHOULD BE REMOVED!!
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = (function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status === 200) {
                            scriptLoaded(xhr.responseText);
                        } else {
                            alert('error loading ' + fileName + ': Status code was ' + xhr.status);
                        }
                    }
                }).bind(_this3);
                xhr.open("GET", url, false);
                xhr.send();
            })();
        }
    };

    return Connexion;
})();

exports['default'] = Connexion;
module.exports = exports['default'];
