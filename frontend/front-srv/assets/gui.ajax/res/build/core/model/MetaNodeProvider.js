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

var _httpMetaCacheService = require('../http/MetaCacheService');

var _httpMetaCacheService2 = _interopRequireDefault(_httpMetaCacheService);

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _utilPathUtils = require('../util/PathUtils');

var _utilPathUtils2 = _interopRequireDefault(_utilPathUtils);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _AjxpNode = require('./AjxpNode');

var _AjxpNode2 = _interopRequireDefault(_AjxpNode);

var _httpGenApiMetaServiceApi = require("../http/gen/api/MetaServiceApi");

var _httpGenApiMetaServiceApi2 = _interopRequireDefault(_httpGenApiMetaServiceApi);

var _httpGenModelRestGetBulkMetaRequest = require("../http/gen/model/RestGetBulkMetaRequest");

var _httpGenModelRestGetBulkMetaRequest2 = _interopRequireDefault(_httpGenModelRestGetBulkMetaRequest);

/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */

var MetaNodeProvider = (function () {

    /**
     * Constructor
     */

    function MetaNodeProvider() {
        var properties = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, MetaNodeProvider);

        this.discrete = false;
        this.properties = new Map();
        if (properties) {
            this.initProvider(properties);
        }
    }

    /**
     * Initialize properties
     * @param properties Object
     */

    MetaNodeProvider.prototype.initProvider = function initProvider(properties) {
        this.properties = new Map();
        for (var p in properties) {
            if (properties.hasOwnProperty(p)) {
                this.properties.set(p, properties[p]);
            }
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

    MetaNodeProvider.prototype.loadNode = function loadNode(node) {
        var nodeCallback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var childCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var recursive = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var _this = this;

        var depth = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
        var optionalParameters = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

        var pydio = _pydio2['default'].getInstance();
        var api = new _httpGenApiMetaServiceApi2['default'](_httpPydioApi2['default'].getRestClient());
        var request = new _httpGenModelRestGetBulkMetaRequest2['default']();
        var slug = '';
        if (pydio.user) {
            if (this.properties.has('tmp_repository_id')) {
                var repos = pydio.user.getRepositoriesList();
                slug = repos.get(this.properties.get('tmp_repository_id')).getSlug();
            } else if (node.getMetadata().has('repository_slug')) {
                slug = node.getMetadata().get('repository_slug');
            } else {
                slug = pydio.user.getActiveRepositoryObject().getSlug();
            }
        }
        var inputPagination = node.getMetadata().get("paginationData");
        if (inputPagination) {
            request.Offset = (inputPagination.get("current") - 1) * inputPagination.get("size");
            request.Limit = inputPagination.get("size");
        } else {
            request.Limit = pydio.getPluginConfigs("access.gateway").get("LIST_NODES_PER_PAGE") || 200;
        }
        request.NodePaths = [slug + node.getPath(), slug + node.getPath() + '/*'];
        if (this.properties.has("versions")) {
            request.Versions = true;
            request.NodePaths = [slug + this.properties.get('file')];
        }
        _pydio2['default'].startLoading();
        api.getBulkMeta(request).then(function (res) {
            _pydio2['default'].endLoading();
            var origNode = undefined;
            var childrenNodes = [];
            res.Nodes.map(function (n) {
                var newNode = undefined;
                try {
                    newNode = MetaNodeProvider.parseTreeNode(n, slug);
                } catch (e) {
                    console.error(e);
                    return;
                }
                if (newNode.getLabel() === '.pydio') {
                    return;
                } else if (newNode.getPath() === node.getPath()) {
                    origNode = newNode;
                } else {
                    if (childCallback) {
                        childCallback(newNode);
                    }
                    childrenNodes.push(newNode);
                }
            });
            if (origNode !== undefined) {
                if (res.Pagination) {
                    var paginationData = new Map();
                    paginationData.set("current", res.Pagination.CurrentPage);
                    paginationData.set("total", res.Pagination.TotalPages);
                    paginationData.set("size", res.Pagination.Limit);
                    origNode.getMetadata().set("paginationData", paginationData);
                }
                node.replaceBy(origNode);
            }
            if (_this.properties.has("versions")) {
                childrenNodes = childrenNodes.map(function (child) {
                    child._path = child.getMetadata().get('versionId');
                    return child;
                });
            }
            node.setChildren(childrenNodes);
            if (nodeCallback !== null) {
                nodeCallback(node);
            }
        })['catch'](function (e) {
            _pydio2['default'].endLoading();
            console.log(e);
        });
    };

    /**
     * Load a node
     * @param node {AjxpNode}
     * @param nodeCallback Function On node loaded
     * @param aSync bool
     * @param additionalParameters object
     * @param errorCallback Function
     */

    MetaNodeProvider.prototype.loadLeafNodeSync = function loadLeafNodeSync(node, nodeCallback) {
        var aSync = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        var additionalParameters = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
        var errorCallback = arguments.length <= 4 || arguments[4] === undefined ? function () {} : arguments[4];

        var api = new _httpGenApiMetaServiceApi2['default'](_httpPydioApi2['default'].getRestClient());
        var request = new _httpGenModelRestGetBulkMetaRequest2['default']();
        var slug = '';
        var path = node.getPath();
        var pydio = _pydio2['default'].getInstance();
        if (pydio.user) {
            if (node.getMetadata().has('repository_id')) {
                var repoId = node.getMetadata().get('repository_id');
                var repo = pydio.user.getRepositoriesList().get(repoId);
                if (repo) {
                    slug = repo.getSlug();
                }
            } else if (node.getMetadata().has('repository_slug')) {
                slug = node.getMetadata().get('repository_slug');
            } else {
                slug = pydio.user.getActiveRepositoryObject().getSlug();
            }
        }
        if (path && path[0] !== '/') {
            path = '/' + path;
        }
        request.NodePaths = [slug + path];
        api.getBulkMeta(request).then(function (res) {
            if (res.Nodes && res.Nodes.length) {
                nodeCallback(MetaNodeProvider.parseTreeNode(res.Nodes[0], slug));
            } else if (errorCallback) {
                errorCallback();
            }
        })['catch'](function (e) {
            if (errorCallback) {
                errorCallback(e);
            } else {
                throw e;
            }
        });
    };

    MetaNodeProvider.loadRoots = function loadRoots(slugs) {
        var api = new _httpGenApiMetaServiceApi2['default'](_httpPydioApi2['default'].getRestClient());
        var request = new _httpGenModelRestGetBulkMetaRequest2['default']();
        request.NodePaths = slugs;
        return api.getBulkMeta(request).then(function (res) {
            if (res.Nodes && res.Nodes.length) {
                var _ret = (function () {
                    var output = {};
                    res.Nodes.forEach(function (n) {
                        var slug = _utilPathUtils2['default'].getDirname(n.Path);
                        var node = MetaNodeProvider.parseTreeNode(n, slug);
                        node.getMetadata().set('repository_slug', slug);
                        node.updateProvider(new MetaNodeProvider());
                        output[slug] = node;
                    });
                    return {
                        v: output
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            } else {
                return {};
            }
        });
    };

    /**
     *
     * @param node {AjxpNode}
     * @param onComplete Function
     * @param onError Function
     */

    MetaNodeProvider.prototype.refreshNodeAndReplace = function refreshNodeAndReplace(node, onComplete) {
        var onError = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

        var nodeCallback = function nodeCallback(newNode) {
            node.replaceBy(newNode, "override");
            if (onComplete) {
                onComplete(node);
            }
        };
        this.loadLeafNodeSync(node, nodeCallback, false, {}, onError);
    };

    /**
     * @return AjxpNode | null
     * @param obj
     * @param workspaceSlug string
     * @param defaultSlug string
     */

    MetaNodeProvider.parseTreeNode = function parseTreeNode(obj, workspaceSlug) {
        var defaultSlug = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

        if (!obj) {
            return null;
        }
        if (!obj.MetaStore) {
            obj.MetaStore = {};
        }
        var pydio = _pydio2['default'].getInstance();

        var nodeName = undefined;
        if (obj.MetaStore.name) {
            nodeName = JSON.parse(obj.MetaStore.name);
        } else {
            nodeName = _utilPathUtils2['default'].getBasename(obj.Path);
        }
        var slug = workspaceSlug;
        if (!workspaceSlug) {
            if (obj.MetaStore['repository_id']) {
                var wsId = JSON.parse(obj.MetaStore['repository_id']);
                if (pydio.user.getRepositoriesList().has(wsId)) {
                    slug = pydio.user.getRepositoriesList().get(wsId).getSlug();
                }
            }
        }
        if (!slug) {
            slug = defaultSlug;
        }
        if (slug) {
            // Strip workspace slug
            obj.Path = obj.Path.substr(slug.length + 1);
        }

        var node = new _AjxpNode2['default']('/' + obj.Path, obj.Type === "LEAF", nodeName, '', null);

        var meta = obj.MetaStore;
        for (var k in meta) {
            if (meta.hasOwnProperty(k)) {
                var metaValue = JSON.parse(meta[k]);
                node.getMetadata().set(k, metaValue);
                if (typeof metaValue === 'object') {
                    for (var kSub in metaValue) {
                        if (metaValue.hasOwnProperty(kSub)) {
                            node.getMetadata().set(kSub, metaValue[kSub]);
                        }
                    }
                }
            }
        }
        node.getMetadata().set('filename', node.getPath());
        if (node.getPath() === '/recycle_bin') {
            node.getMetadata().set('fonticon', 'delete');
            node.getMetadata().set('mimestring_id', '122');
            node.getMetadata().set('ajxp_mime', 'ajxp_recycle');
            if (pydio) node.setLabel(pydio.MessageHash[122]);
            node.getMetadata().set('mimestring', pydio.MessageHash[122]);
        }
        if (node.isLeaf() && pydio && pydio.Registry) {
            var ext = _utilPathUtils2['default'].getFileExtension(node.getPath());
            var registered = pydio.Registry.getFilesExtensions();
            if (registered.has(ext)) {
                var _registered$get = registered.get(ext);

                var messageId = _registered$get.messageId;
                var fontIcon = _registered$get.fontIcon;

                node.getMetadata().set('fonticon', fontIcon);
                node.getMetadata().set('mimestring_id', messageId);
                if (pydio.MessageHash[messageId]) {
                    node.getMetadata().set('mimestring', pydio.MessageHash[messageId]);
                }
            }
        } else if (!node.isLeaf()) {
            node.getMetadata().set('mimestring', pydio.MessageHash[8]);
        }
        if (obj.Size !== undefined) {
            node.getMetadata().set('bytesize', obj.Size);
        }
        if (obj.MTime !== undefined) {
            node.getMetadata().set('ajxp_modiftime', obj.MTime);
        }
        if (obj.Etag !== undefined) {
            node.getMetadata().set('etag', obj.Etag);
        }
        if (obj.Uuid !== undefined) {
            node.getMetadata().set('uuid', obj.Uuid);
        }
        MetaNodeProvider.overlays(node);
        return node;
    };

    /**
     * Update metadata for specific overlays
     * @param node AjxpNode
     */

    MetaNodeProvider.overlays = function overlays(node) {
        var meta = node.getMetadata();
        var overlays = [];

        // SHARES
        if (meta.has('workspaces_shares')) {
            var wsRoot = meta.get('ws_root');
            meta.set('pydio_is_shared', "true");
            meta.set('pydio_shares', JSON.stringify(meta.get('workspaces_shares')));
            if (!wsRoot) {
                overlays.push('mdi mdi-share-variant');
            } else if (!node.isLeaf()) {
                meta.set('fonticon', 'folder-star');
            }
        }

        // WATCHES
        if (meta.has('user_subscriptions')) {
            var subs = meta.get('user_subscriptions');
            var read = subs.indexOf('read') > -1;
            var changes = subs.indexOf('change') > -1;
            var value = '';
            if (read && changes) {
                value = 'META_WATCH_BOTH';
            } else if (read) {
                value = 'META_WATCH_READ';
            } else if (changes) {
                value = 'META_WATCH_CHANGE';
            }
            if (value) {
                meta.set('meta_watched', value);
                overlays.push('mdi mdi-bell');
            }
        }

        // BOOKMARKS
        if (meta.has('bookmark')) {
            meta.set('ajxp_bookmarked', 'true');
            overlays.push('mdi mdi-star');
        }

        // LOCKS
        if (meta.has('content_lock')) {
            var lockUser = meta.get('content_lock');
            overlays.push('mdi mdi-lock-outline');
            meta.set('sl_locked', 'true');
            if (pydio && pydio.user && lockUser === pydio.user.id) {
                meta.set('sl_mylock', 'true');
            }
        }

        if (overlays.length) {
            meta.set('overlay_class', overlays.join(','));
        }
        node.setMetadata(meta);
    };

    return MetaNodeProvider;
})();

exports['default'] = MetaNodeProvider;
module.exports = exports['default'];
