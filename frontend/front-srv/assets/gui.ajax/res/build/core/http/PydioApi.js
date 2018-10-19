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

var _utilXMLUtils = require('../util/XMLUtils');

var _utilXMLUtils2 = _interopRequireDefault(_utilXMLUtils);

var _utilPathUtils = require('../util/PathUtils');

var _utilPathUtils2 = _interopRequireDefault(_utilPathUtils);

var _RestClient = require('./RestClient');

var _RestClient2 = _interopRequireDefault(_RestClient);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _genModelRestCreateSelectionRequest = require('./gen/model/RestCreateSelectionRequest');

var _genModelRestCreateSelectionRequest2 = _interopRequireDefault(_genModelRestCreateSelectionRequest);

var _genModelTreeNode = require("./gen/model/TreeNode");

var _genModelTreeNode2 = _interopRequireDefault(_genModelTreeNode);

var _genApiTreeServiceApi = require("./gen/api/TreeServiceApi");

var _genApiTreeServiceApi2 = _interopRequireDefault(_genApiTreeServiceApi);

var _modelAjxpNode = require("../model/AjxpNode");

var _modelAjxpNode2 = _interopRequireDefault(_modelAjxpNode);

/**
 * API Client
 */

var PydioApi = (function () {
    function PydioApi() {
        _classCallCheck(this, PydioApi);
    }

    /**
     * @return {JwtApiClient}
     */

    PydioApi.getRestClient = function getRestClient() {
        return new _RestClient2['default'](this.getClient()._pydioObject);
    };

    PydioApi.prototype.setPydioObject = function setPydioObject(pydioObject) {
        this._pydioObject = pydioObject;
        this._baseUrl = pydioObject.Parameters.get('serverAccessPath');
    };

    PydioApi.prototype.getPydioObject = function getPydioObject() {
        return this._pydioObject;
    };

    PydioApi.prototype.request = function request(parameters) {
        var onComplete = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var onError = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var settings = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        // Connexion already handles secure_token
        var c = new Connexion();
        if (settings.discrete) {
            c.discrete = true;
        }
        c.setParameters(parameters);
        if (settings.method) {
            c.setMethod(settings.method);
        }
        if (!onComplete) {
            onComplete = (function (transport) {
                if (transport.responseXML) return this.parseXmlMessage(transport.responseXML);
            }).bind(this);
        }
        c.onComplete = onComplete;
        if (settings.async === false) {
            c.sendSync();
        } else {
            c.sendAsync();
        }
    };

    PydioApi.prototype.loadFile = function loadFile(filePath) {
        var onComplete = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var onError = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        var c = new Connexion(filePath);
        c.setMethod('GET');
        c.onComplete = onComplete;
        c.sendAsync();
    };

    /**
     * 
     * @param file
     * @param fileParameterName
     * @param queryStringParams
     * @param onComplete
     * @param onError
     * @param onProgress
     * @returns XHR Handle to abort transfer
     */

    PydioApi.prototype.uploadFile = function uploadFile(file, fileParameterName) {
        var queryStringParams = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var onComplete = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];
        var onError = arguments.length <= 4 || arguments[4] === undefined ? function () {} : arguments[4];
        var onProgress = arguments.length <= 5 || arguments[5] === undefined ? function () {} : arguments[5];
        var uploadUrl = arguments.length <= 6 || arguments[6] === undefined ? '' : arguments[6];
        var xhrSettings = arguments.length <= 7 || arguments[7] === undefined ? {} : arguments[7];

        if (!uploadUrl) {
            uploadUrl = pydio.Parameters.get('ajxpServerAccess');
        }
        if (queryStringParams) {
            uploadUrl += (uploadUrl.indexOf('?') === -1 ? '?' : '&') + queryStringParams;
        }

        if (window.Connexion) {
            var _ret = (function () {
                // Warning, avoid double error
                var errorSent = false;
                var localError = function localError(xhr) {
                    if (!errorSent) {
                        onError('Request failed with status :' + xhr.status);
                    }
                    errorSent = true;
                };
                var c = new Connexion();
                return {
                    v: c.uploadFile(file, fileParameterName, uploadUrl, onComplete, localError, onProgress, xhrSettings)
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        }
    };

    /**
     *
     * @param userSelection UserSelection A Pydio DataModel with selected files
     */

    PydioApi.prototype.downloadSelection = function downloadSelection(userSelection) {
        var _this = this;

        var pydio = this.getPydioObject();
        var agent = navigator.userAgent || '';
        var agentIsMobile = agent.indexOf('iPhone') !== -1 || agent.indexOf('iPod') !== -1 || agent.indexOf('iPad') !== -1 || agent.indexOf('iOs') !== -1;

        var hiddenForm = pydio.UI && pydio.UI.hasHiddenDownloadForm();
        var archiveExt = pydio.getPluginConfigs("access.gateway").get("DOWNLOAD_ARCHIVE_FORMAT") || "zip";

        if (userSelection.isUnique()) {
            var downloadNode = undefined,
                attachmentName = undefined;
            var uniqueNode = userSelection.getUniqueNode();
            if (uniqueNode.isLeaf()) {
                downloadNode = uniqueNode;
                attachmentName = uniqueNode.getLabel();
            } else {
                downloadNode = new _modelAjxpNode2['default'](uniqueNode.getPath() + '.' + archiveExt, false);
                attachmentName = uniqueNode.getLabel() + '.' + archiveExt;
            }

            this.buildPresignedGetUrl(downloadNode, null, '', null, attachmentName).then(function (url) {
                if (agentIsMobile || !hiddenForm) {
                    document.location.href = url;
                } else {
                    _this.getPydioObject().UI.sendDownloadToHiddenForm(userSelection, { presignedUrl: url });
                }
            });
        } else {
            (function () {
                var selection = new _genModelRestCreateSelectionRequest2['default']();
                selection.Nodes = [];
                var slug = _this.getPydioObject().user.getActiveRepositoryObject().getSlug();
                selection.Nodes = userSelection.getSelectedNodes().map(function (node) {
                    var tNode = new _genModelTreeNode2['default']();
                    tNode.Path = slug + node.getPath();
                    return tNode;
                });
                var api = new _genApiTreeServiceApi2['default'](PydioApi.getRestClient());
                api.createSelection(selection).then(function (response) {
                    var SelectionUUID = response.SelectionUUID;

                    var fakeNodePath = _this.getPydioObject().getContextHolder().getContextNode().getPath() + "/" + SelectionUUID + '-selection.' + archiveExt;
                    var fakeNode = new _modelAjxpNode2['default'](fakeNodePath, true);
                    _this.buildPresignedGetUrl(fakeNode, null, '', null, 'selection.' + archiveExt).then(function (url) {
                        if (agentIsMobile || !hiddenForm) {
                            document.location.href = url;
                        } else {
                            _this.getPydioObject().UI.sendDownloadToHiddenForm(userSelection, { presignedUrl: url });
                        }
                    });
                });
            })();
        }
    };

    /**
     * Generate presigned and use it for uploads
     * @param file
     * @param path
     * @param onComplete
     * @param onError
     * @param onProgress
     * @return {Promise<any>}
     */

    PydioApi.prototype.uploadPresigned = function uploadPresigned(file, path) {
        var onComplete = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

        var _this2 = this;

        var onError = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];
        var onProgress = arguments.length <= 4 || arguments[4] === undefined ? function () {} : arguments[4];

        var targetPath = path;
        if (path.normalize) {
            targetPath = path.normalize('NFC');
        }
        if (targetPath[0] === "/") {
            targetPath = targetPath.substring(1);
        }
        var url = this.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
        var params = {
            Bucket: 'io',
            Key: targetPath,
            ContentType: 'application/octet-stream'
        };

        return new Promise(function (resolve) {
            PydioApi.getRestClient().getOrUpdateJwt().then(function (jwt) {
                _awsSdk2['default'].config.update({
                    accessKeyId: 'gateway',
                    secretAccessKey: 'gatewaysecret',
                    s3ForcePathStyle: true
                });
                var s3 = new _awsSdk2['default'].S3({ endpoint: url.replace('/io', '') });
                var signed = s3.getSignedUrl('putObject', params);
                var xhr = _this2.uploadFile(file, '', '', onComplete, onError, onProgress, signed, { method: 'PUT', customHeaders: { 'X-Pydio-Bearer': jwt, 'Content-Type': 'application/octet-stream' } });
                resolve(xhr);
            });
        });
    };

    /**
     * Send a request to the server to get a usable presigned url.
     *
     * @param node AjxpNode
     * @param callback Function
     * @param presetType String
     * @param bucketParams
     * @return {Promise}|null Return a Promise if callback is null, or call the callback
     */

    PydioApi.prototype.buildPresignedGetUrl = function buildPresignedGetUrl(node) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var presetType = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var bucketParams = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
        var attachmentName = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];

        var url = this.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
        var slug = this.getPydioObject().user.getActiveRepositoryObject().getSlug();
        var cType = '',
            cDisposition = undefined;
        var longExpire = false;

        switch (presetType) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/bmp':
            case 'text/plain':
                cType = presetType;
                cDisposition = 'inline';
                break;
            case 'image/jpg':
                cType = 'image/jpeg';
                cDisposition = 'inline';
                break;
            case 'audio/mp3':
                cType = presetType;
                longExpire = true;
                break;
            case 'video/mp4':
                cType = presetType;
                longExpire = true;
                break;
            case 'detect':
                cType = _utilPathUtils2['default'].getAjxpMimeType(node);
                cDisposition = 'inline';
                break;
            default:
                break;
        }

        var params = {
            Bucket: 'io',
            Key: slug + node.getPath(),
            Expires: longExpire ? 6000 : 600
        };
        if (bucketParams !== null) {
            params = bucketParams;
        }
        if (cType) {
            params['ResponseContentType'] = cType;
        }
        if (cDisposition) {
            params['ResponseContentDisposition'] = cDisposition;
        } else if (attachmentName) {
            params['ResponseContentDisposition'] = 'attachment; filename=' + encodeURIComponent(attachmentName);
        }

        var resolver = function resolver(jwt, cb) {
            var meta = node.getMetadata().get('presignedUrls');
            var cacheKey = jwt + params.Key;
            var cached = meta ? meta.get(cacheKey) : null;
            if (cached) {
                cb(cached);
                return;
            }
            if (!meta) {
                meta = new Map();
            }

            _awsSdk2['default'].config.update({
                accessKeyId: 'gateway',
                secretAccessKey: 'gatewaysecret',
                s3ForcePathStyle: true
            });
            var s3 = new _awsSdk2['default'].S3({ endpoint: url.replace('/io', '') });
            var signed = s3.getSignedUrl('getObject', params);
            var output = signed + '&pydio_jwt=' + jwt;
            cb(output);
            meta.set(cacheKey, output);
            node.getMetadata().set('presignedUrls', meta);
        };

        if (callback === null) {
            return new Promise(function (resolve) {
                PydioApi.getRestClient().getOrUpdateJwt().then(function (jwt) {
                    resolver(jwt, resolve);
                });
            });
        } else {
            PydioApi.getRestClient().getOrUpdateJwt().then(function (jwt) {
                resolver(jwt, callback);
            });
            return null;
        }
    };

    PydioApi.prototype.getPlainContent = function getPlainContent(node, contentCallback) {
        var _this3 = this;

        PydioApi.getRestClient().getOrUpdateJwt().then(function (jwt) {
            var url = _this3.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
            var slug = _this3.getPydioObject().user.getActiveRepositoryObject().getSlug();

            _awsSdk2['default'].config.update({
                accessKeyId: jwt,
                secretAccessKey: 'gatewaysecret',
                s3ForcePathStyle: true
            });
            var params = {
                Bucket: "io",
                Key: slug + node.getPath(),
                ResponseContentType: 'text/plain',
                ResponseCacheControl: "no-cache"
            };
            var s3 = new _awsSdk2['default'].S3({ endpoint: url.replace('/io', '') });
            s3.getObject(params, function (err, data) {
                if (!err) {
                    contentCallback(data.Body.toString('utf-8'));
                } else {
                    _this3.getPydioObject().UI.displayMessage('ERROR', err.message);
                }
            });
        });
    };

    PydioApi.prototype.postPlainTextContent = function postPlainTextContent(nodePath, content, finishedCallback) {
        var _this4 = this;

        PydioApi.getRestClient().getOrUpdateJwt().then(function (jwt) {
            var url = _this4.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
            var slug = _this4.getPydioObject().user.getActiveRepositoryObject().getSlug();

            _awsSdk2['default'].config.update({
                accessKeyId: jwt,
                secretAccessKey: 'gatewaysecret',
                s3ForcePathStyle: true
            });
            var params = {
                Bucket: "io",
                Key: slug + nodePath,
                Body: content
            };
            var s3 = new _awsSdk2['default'].S3({ endpoint: url.replace('/io', '') });
            s3.putObject(params, function (err) {
                if (!err) {
                    finishedCallback('Ok');
                } else {
                    _this4.getPydioObject().UI.displayMessage('ERROR', err.message);
                    finishedCallback(false);
                }
            });
        });
    };

    PydioApi.prototype.openVersion = function openVersion(node, versionId) {

        var pydio = this.getPydioObject();
        var agent = navigator.userAgent || '';
        var agentIsMobile = agent.indexOf('iPhone') != -1 || agent.indexOf('iPod') != -1 || agent.indexOf('iPad') != -1 || agent.indexOf('iOs') != -1;
        var hiddenForm = pydio && pydio.UI && pydio.UI.hasHiddenDownloadForm();
        var slug = pydio.user.getActiveRepositoryObject().getSlug();

        this.buildPresignedGetUrl(node, function (url) {
            if (agentIsMobile || !hiddenForm) {
                document.location.href = url;
            } else {
                pydio.UI.sendDownloadToHiddenForm(null, { presignedUrl: url });
            }
        }, '', {
            Bucket: 'io',
            Key: slug + node.getPath(),
            VersionId: versionId
        });
    };

    PydioApi.prototype.revertToVersion = function revertToVersion(node, versionId, callback) {
        var _this5 = this;

        PydioApi.getRestClient().getOrUpdateJwt().then(function (jwt) {
            var url = _this5.getPydioObject().Parameters.get('ENDPOINT_S3_GATEWAY');
            var slug = _this5.getPydioObject().user.getActiveRepositoryObject().getSlug();

            _awsSdk2['default'].config.update({
                accessKeyId: jwt,
                secretAccessKey: 'gatewaysecret',
                s3ForcePathStyle: true
            });
            var params = {
                Bucket: "io",
                Key: slug + node.getPath(),
                CopySource: encodeURIComponent('io/' + slug + node.getPath() + '?versionId=' + versionId)
            };
            var s3 = new _awsSdk2['default'].S3({ endpoint: url.replace('/io', '') });
            s3.copyObject(params, function (err) {
                if (err) {
                    _this5.getPydioObject().UI.displayMessage('ERROR', err.message);
                } else if (callback) {
                    callback('Copy version to original node');
                }
            });
        });
    };

    /**
     * Detect a minisite_session parameter in the URL
     * @param serverAccess
     * @returns string|bool
     */

    PydioApi.detectMinisiteSession = function detectMinisiteSession(serverAccess) {
        var regex = new RegExp('.*?[&\\?]' + 'minisite_session' + '=(.*?)&?.*?');
        var val = serverAccess.replace(regex, "$1");
        return val === serverAccess ? false : val;
    };

    /**
     * Detects if current browser supports HTML5 Upload.
     * @returns boolean
     */

    PydioApi.supportsUpload = function supportsUpload() {
        if (window.Connexion) {
            return window.FormData || window.FileReader;
        } else if (window.jQuery) {
            return window.FormData;
        }
        return false;
    };

    /**
     * Instanciate a PydioApi client if it's not already instanciated and return it.
     * @returns PydioApi
     */

    PydioApi.getClient = function getClient() {
        if (PydioApi._PydioClient) {
            return PydioApi._PydioClient;
        }
        var client = new PydioApi();
        PydioApi._PydioClient = client;
        return client;
    };

    /**
     * Load a javascript library
     * @param fileName String
     * @param onLoadedCode Function Callback
     * @param aSync Boolean load library asynchroneously
     */

    PydioApi.loadLibrary = function loadLibrary(fileName, onLoadedCode, aSync) {
        if (window.pydio && pydio.Parameters.get("ajxpVersion") && fileName.indexOf("?") === -1) {
            fileName += "?v=" + pydio.Parameters.get("ajxpVersion");
        }
        PydioApi._libUrl = false;
        if (window.pydio && pydio.Parameters.get('SERVER_PREFIX_URI')) {
            PydioApi._libUrl = pydio.Parameters.get('SERVER_PREFIX_URI');
        }

        var conn = new Connexion();
        conn._libUrl = false;
        if (pydio.Parameters.get('SERVER_PREFIX_URI')) {
            conn._libUrl = pydio.Parameters.get('SERVER_PREFIX_URI');
        }
        conn.loadLibrary(fileName, onLoadedCode, aSync);
    };

    PydioApi.prototype.switchLanguage = function switchLanguage(lang, completeCallback) {

        var url = pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/messages/' + lang;
        window.fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        }).then(function (response) {
            response.json().then(function (data) {
                completeCallback(data);
            });
        });
    };

    /**
     *
     * @param node
     * @param hookName
     * @param hookArg
     * @param completeCallback
     * @param additionalParams
     */

    PydioApi.prototype.applyCheckHook = function applyCheckHook(node, hookName, hookArg, completeCallback, additionalParams) {
        completeCallback();
    };

    /**
     * Standard parser for server XML answers
     * @param xmlResponse DOMDocument
     */

    PydioApi.prototype.parseXmlMessage = function parseXmlMessage(xmlResponse) {
        if (xmlResponse == null || xmlResponse.documentElement == null) {
            return null;
        }
        var childs = xmlResponse.documentElement.childNodes;
        var reloadNodes = [],
            error = false;
        this.LAST_ERROR_ID = null;
        this.LAST_ERROR = null;

        for (var i = 0; i < childs.length; i++) {
            var child = childs[i];
            if (child.tagName === "message") {
                var messageTxt = "No message";
                if (child.firstChild) messageTxt = child.firstChild.nodeValue;
                if (child.getAttribute('type') == 'ERROR') {
                    Logger.error(messageTxt);
                    this.LAST_ERROR = messageTxt;
                    error = true;
                } else {
                    Logger.log(messageTxt);
                }
            } else if (child.tagName === "prompt") {

                if (pydio && pydio.UI && pydio.UI.openPromptDialog) {
                    var jsonData = _utilXMLUtils2['default'].XPathSelectSingleNode(childs[i], "data").firstChild.nodeValue;
                    pydio.UI.openPromptDialog(JSON.parse(jsonData));
                }
                return false;
            } else if (child.tagName === "reload_instruction") {

                var obName = child.getAttribute('object');
                if (obName === 'data') {
                    var node = child.getAttribute('node');
                    if (node) {
                        reloadNodes.push(node);
                    } else {
                        var file = child.getAttribute('file');
                        if (file) {
                            this._pydioObject.getContextHolder().setPendingSelection(file);
                        }
                        reloadNodes.push(this._pydioObject.getContextNode());
                    }
                } else if (obName === 'repository_list') {
                    this._pydioObject.reloadRepositoriesList();
                }
            } else if (child.nodeName === 'nodes_diff') {

                var dm = this._pydioObject.getContextHolder();
                if (dm.getAjxpNodeProvider().parseAjxpNodesDiffs) {
                    dm.getAjxpNodeProvider().parseAjxpNodesDiffs(childs[i], dm, this._pydioObject.user.activeRepository, !window.currentLightBox);
                }
            } else if (child.tagName === "logging_result") {

                if (child.getAttribute("secure_token")) {

                    this._pydioObject.Parameters.set('SECURE_TOKEN', child.getAttribute("secure_token"));
                    Connexion.updateServerAccess(this._pydioObject.Parameters);
                }
                var result = child.getAttribute('value');
                var errorId = false;
                switch (result) {
                    case '1':
                        this._pydioObject.loadXmlRegistry();
                        break;
                    case '0':
                    case '-1':
                        errorId = 285;
                        break;
                    case '2':
                        this._pydioObject.loadXmlRegistry();
                        break;
                    case '-2':
                        errorId = 285;
                        break;
                    case '-3':
                        errorId = 366;
                        break;
                    case '-4':
                        errorId = 386;
                        break;
                }
                if (errorId) {
                    error = true;
                    this.LAST_ERROR_ID = errorId;
                    Logger.error(this._pydioObject.MessageHash[errorId]);
                }
            } else if (child.tagName === "trigger_bg_action") {

                var _name = child.getAttribute("name");
                var messageId = child.getAttribute("messageId");
                var parameters = {};
                var callback = undefined;
                for (var j = 0; j < child.childNodes.length; j++) {
                    var paramChild = child.childNodes[j];
                    if (paramChild.tagName === 'param') {

                        parameters[paramChild.getAttribute("name")] = paramChild.getAttribute("value");
                    } else if (paramChild.tagName === 'clientCallback' && paramChild.firstChild && paramChild.firstChild.nodeValue) {

                        var callbackCode = paramChild.firstChild.nodeValue;
                        callback = new Function(callbackCode);
                    }
                }
                if (_name === "javascript_instruction" && callback) {
                    callback();
                }
            }
        }
        this._pydioObject.notify("response.xml", xmlResponse);
        if (reloadNodes.length) {
            this._pydioObject.getContextHolder().multipleNodesReload(reloadNodes);
        }
        return !error;
    };

    return PydioApi;
})();

exports['default'] = PydioApi;
module.exports = exports['default'];
