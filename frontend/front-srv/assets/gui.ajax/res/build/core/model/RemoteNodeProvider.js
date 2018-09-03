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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _httpMetaCacheService = require('../http/MetaCacheService');

var _httpMetaCacheService2 = _interopRequireDefault(_httpMetaCacheService);

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _utilPathUtils = require('../util/PathUtils');

var _utilPathUtils2 = _interopRequireDefault(_utilPathUtils);

var _utilXMLUtils = require('../util/XMLUtils');

var _utilXMLUtils2 = _interopRequireDefault(_utilXMLUtils);

var _langLogger = require('../lang/Logger');

var _langLogger2 = _interopRequireDefault(_langLogger);

var _AjxpNode = require('./AjxpNode');

var _AjxpNode2 = _interopRequireDefault(_AjxpNode);

/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */

var RemoteNodeProvider = (function () {

    /**
     * Constructor
     */

    function RemoteNodeProvider() {
        var properties = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, RemoteNodeProvider);

        this.discrete = false;
        if (properties) this.initProvider(properties);
    }

    /**
     * Initialize properties
     * @param properties Object
     */

    RemoteNodeProvider.prototype.initProvider = function initProvider(properties) {
        this.properties = new Map();
        for (var p in properties) {
            if (properties.hasOwnProperty(p)) this.properties.set(p, properties[p]);
        }
        if (this.properties && this.properties.has('connexion_discrete')) {
            this.discrete = true;
            this.properties['delete']('connexion_discrete');
        }
        if (this.properties && this.properties.has('cache_service')) {
            this.cacheService = this.properties.get('cache_service');
            this.properties['delete']('cache_service');
            _httpMetaCacheService2['default'].getInstance().registerMetaStream(this.cacheService['metaStreamName'], this.cacheService['expirationPolicy']);
        }
    };

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param childCallback Function On child added
     * @param recursive
     * @param depth
     * @param optionalParameters
     */

    RemoteNodeProvider.prototype.loadNode = function loadNode(node) {
        var nodeCallback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var childCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var recursive = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
        var depth = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
        var optionalParameters = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

        var params = {
            get_action: 'ls', // TODO : HANDLE PAGINATION IN NEW NODE PROVIDER
            options: 'al'
        };
        if (recursive) {
            params['recursive'] = true;
            params['depth'] = depth;
        }
        var path = node.getPath();
        // Double encode # character
        var paginationHash = undefined;
        if (node.getMetadata().has("paginationData")) {
            paginationHash = "%23" + node.getMetadata().get("paginationData").get("current");
            path += paginationHash;
            params['remote_order'] = 'true';
            var remoteOrderData = node.getMetadata().get("remote_order");
            if (remoteOrderData) {
                if (remoteOrderData._object) remoteOrderData = ProtoCompat.hash2map(remoteOrderData);
                remoteOrderData.forEach(function (value, key) {
                    params[key] = value;
                });
            }
        }
        params['dir'] = path;
        if (this.properties) {
            this.properties.forEach(function (value, key) {
                params[key] = value + (key == 'dir' && paginationHash ? paginationHash : '');
            });
        }
        if (optionalParameters) {
            params = _extends({}, params, optionalParameters);
        }
        var parser = (function (transport) {
            this.parseNodes(node, transport, nodeCallback, childCallback);
            return node;
        }).bind(this);
        if (this.cacheService) {
            var loader = (function (ajxpNode, cacheCallback) {
                _httpPydioApi2['default'].getClient().request(params, cacheCallback, null, { discrete: this.discrete });
            }).bind(this);
            var cacheLoader = (function (newNode) {
                node.replaceBy(newNode);
                nodeCallback(node);
            }).bind(this);
            _httpMetaCacheService2['default'].getInstance().metaForNode(this.cacheService['metaStreamName'], node, loader, parser, cacheLoader);
        } else {
            _httpPydioApi2['default'].getClient().request(params, parser, null, { discrete: this.discrete });
        }
    };

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param aSync bool
     * @param additionalParameters object
     */

    RemoteNodeProvider.prototype.loadLeafNodeSync = function loadLeafNodeSync(node, nodeCallback) {
        var aSync = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        var additionalParameters = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    };

    RemoteNodeProvider.prototype.refreshNodeAndReplace = function refreshNodeAndReplace(node, onComplete) {};

    /**
     * Parse the answer and create AjxpNodes
     * @param origNode AjxpNode
     * @param transport Ajax.Response
     * @param nodeCallback Function
     * @param childCallback Function
     * @param childrenOnly
     */

    RemoteNodeProvider.prototype.parseNodes = function parseNodes(origNode, transport, nodeCallback, childCallback, childrenOnly) {
        var _this = this;

        if (!transport.responseXML || !transport.responseXML.documentElement) {
            _langLogger2['default'].debug('Loading node ' + origNode.getPath() + ' has wrong response: ' + transport.responseText);
            if (nodeCallback) nodeCallback(origNode);
            origNode.setLoaded(false);
            if (!transport.responseText) {
                throw new Error('Empty response!');
            }
            throw new Error('Invalid XML Document (see console)');
        }
        var rootNode = transport.responseXML.documentElement;
        if (!childrenOnly) {
            var contextNode = this.parseAjxpNode(rootNode);
            origNode.replaceBy(contextNode, "merge");
        }

        // CHECK FOR MESSAGE OR ERRORS
        var errorNode = _utilXMLUtils2['default'].XPathSelectSingleNode(rootNode, "error|message");
        if (errorNode) {
            var type = undefined;
            if (errorNode.nodeName == "message") {
                type = errorNode.getAttribute('type');
            }
            if (type == "ERROR") {
                origNode.notify("error", errorNode.firstChild.nodeValue + '(Source:' + origNode.getPath() + ')');
            }
        }

        // CHECK FOR AUTH PROMPT REQUIRED
        var authNode = _utilXMLUtils2['default'].XPathSelectSingleNode(rootNode, "prompt");
        if (authNode && pydio && pydio.UI && pydio.UI.openPromptDialog) {
            var jsonData = _utilXMLUtils2['default'].XPathSelectSingleNode(authNode, "data").firstChild.nodeValue;
            pydio.UI.openPromptDialog(JSON.parse(jsonData));
            return false;
        }

        // CHECK FOR PAGINATION DATA
        var paginationNode = _utilXMLUtils2['default'].XPathSelectSingleNode(rootNode, "pagination");
        if (paginationNode) {
            (function () {
                var paginationData = new Map();
                Array.from(paginationNode.attributes).forEach((function (att) {
                    paginationData.set(att.nodeName, att.value);
                }).bind(_this));
                origNode.getMetadata().set('paginationData', paginationData);
            })();
        } else if (origNode.getMetadata().get('paginationData')) {
            origNode.getMetadata()['delete']('paginationData');
        }

        // CHECK FOR COMPONENT CONFIGS CONTEXTUAL DATA
        var configs = _utilXMLUtils2['default'].XPathSelectSingleNode(rootNode, "client_configs");
        if (configs) {
            origNode.getMetadata().set('client_configs', configs);
        }

        // NOW PARSE CHILDREN
        var children = _utilXMLUtils2['default'].XPathSelectNodes(rootNode, "tree");
        children.forEach((function (childNode) {
            var child = this.parseAjxpNode(childNode);
            if (!childrenOnly) {
                origNode.addChild(child);
            }
            var cLoaded = undefined;
            if (_utilXMLUtils2['default'].XPathSelectNodes(childNode, 'tree').length) {
                _utilXMLUtils2['default'].XPathSelectNodes(childNode, 'tree').forEach((function (c) {
                    var newChild = this.parseAjxpNode(c);
                    if (newChild) {
                        child.addChild(newChild);
                    }
                }).bind(this));
                cLoaded = true;
            }
            if (childCallback) {
                childCallback(child);
            }
            if (cLoaded) child.setLoaded(true);
        }).bind(this));

        if (nodeCallback) {
            nodeCallback(origNode);
        }
    };

    RemoteNodeProvider.prototype.parseAjxpNodesDiffs = function parseAjxpNodesDiffs(xmlElement, targetDataModel, targetRepositoryId) {
        var setContextChildrenSelected = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var removes = _utilXMLUtils2['default'].XPathSelectNodes(xmlElement, "remove/tree");
        var adds = _utilXMLUtils2['default'].XPathSelectNodes(xmlElement, "add/tree");
        var updates = _utilXMLUtils2['default'].XPathSelectNodes(xmlElement, "update/tree");
        var notifyServerChange = [];
        if (removes && removes.length) {
            removes.forEach(function (r) {
                var p = r.getAttribute("filename");
                if (r.getAttribute("node_repository_id") && r.getAttribute("node_repository_id") !== targetRepositoryId) {
                    return;
                }
                var imTime = parseInt(r.getAttribute("ajxp_im_time"));
                targetDataModel.removeNodeByPath(p, imTime);
                notifyServerChange.push(p);
            });
        }
        if (adds && adds.length && targetDataModel.getAjxpNodeProvider().parseAjxpNode) {
            adds.forEach(function (tree) {
                if (tree.getAttribute("node_repository_id") && tree.getAttribute("node_repository_id") !== targetRepositoryId) {
                    return;
                }
                var newNode = targetDataModel.getAjxpNodeProvider().parseAjxpNode(tree);
                targetDataModel.addNode(newNode, setContextChildrenSelected);
                notifyServerChange.push(newNode.getPath());
            });
        }
        if (updates && updates.length && targetDataModel.getAjxpNodeProvider().parseAjxpNode) {
            updates.forEach(function (tree) {
                if (tree.getAttribute("node_repository_id") && tree.getAttribute("node_repository_id") !== targetRepositoryId) {
                    return;
                }
                var newNode = targetDataModel.getAjxpNodeProvider().parseAjxpNode(tree);
                var original = newNode.getMetadata().get("original_path");
                targetDataModel.updateNode(newNode, setContextChildrenSelected);
                notifyServerChange.push(newNode.getPath());
                if (original) notifyServerChange.push(original);
            });
        }
        if (notifyServerChange.length) {
            targetDataModel.notify("server_update", notifyServerChange);
        }
    };

    /**
     * Parses XML Node and create AjxpNode
     * @param xmlNode XMLNode
     * @returns AjxpNode
     */

    RemoteNodeProvider.prototype.parseAjxpNode = function parseAjxpNode(xmlNode) {
        var node = new _AjxpNode2['default'](xmlNode.getAttribute('filename'), xmlNode.getAttribute('is_file') == "1" || xmlNode.getAttribute('is_file') == "true", xmlNode.getAttribute('text'), xmlNode.getAttribute('icon'));
        var metadata = new Map();
        for (var i = 0; i < xmlNode.attributes.length; i++) {
            metadata.set(xmlNode.attributes[i].nodeName, xmlNode.attributes[i].value);
        }
        node.setMetadata(metadata);
        return node;
    };

    return RemoteNodeProvider;
})();

exports['default'] = RemoteNodeProvider;
module.exports = exports['default'];
