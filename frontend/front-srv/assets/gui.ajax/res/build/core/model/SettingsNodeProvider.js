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

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _utilLangUtils = require('../util/LangUtils');

var _utilLangUtils2 = _interopRequireDefault(_utilLangUtils);

var _AjxpNode = require('./AjxpNode');

var _AjxpNode2 = _interopRequireDefault(_AjxpNode);

var USERS_ROOT = '/idm/users';

/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */

var SettingsNodeProvider = (function () {

    /**
     * Constructor
     */

    function SettingsNodeProvider() {
        var properties = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, SettingsNodeProvider);

        this.discrete = false;
        if (properties) this.initProvider(properties);
    }

    /**
     * Initialize properties
     * @param properties Object
     */

    SettingsNodeProvider.prototype.initProvider = function initProvider(properties) {
        this.properties = new Map();
        for (var p in properties) {
            if (properties.hasOwnProperty(p)) this.properties.set(p, properties[p]);
        }
        if (this.properties && this.properties.has('connexion_discrete')) {
            this.discrete = true;
            this.properties['delete']('connexion_discrete');
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

    SettingsNodeProvider.prototype.loadNode = function loadNode(node) {
        var nodeCallback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var childCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var recursive = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
        var depth = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
        var optionalParameters = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

        if (node.getPath().indexOf(USERS_ROOT) === 0) {
            var _ret = (function () {
                var basePath = node.getPath().substring(USERS_ROOT.length);
                var offset = 0,
                    limit = 50;
                var pData = node.getMetadata().get('paginationData');
                var newPage = 1;
                if (pData && pData.has('new_page')) {
                    // recompute offset limit;
                    newPage = pData.get('new_page');
                    offset = (newPage - 1) * limit;
                }
                _httpPydioApi2['default'].getRestClient().getIdmApi().listUsersGroups(basePath, recursive, offset, limit).then(function (collection) {
                    var childrenNodes = [];
                    var count = 0;
                    if (collection.Groups) {
                        collection.Groups.map(function (group) {
                            var label = group.Attributes && group.Attributes['displayName'] ? group.Attributes['displayName'] : group.GroupLabel;
                            var gNode = new _AjxpNode2['default'](USERS_ROOT + _utilLangUtils2['default'].trimRight(group.GroupPath, '/') + '/' + group.GroupLabel, false, label);
                            gNode.getMetadata().set('IdmUser', group);
                            gNode.getMetadata().set('ajxp_mime', 'group');
                            childrenNodes.push(gNode);
                        });
                    }
                    if (collection.Users) {
                        count = collection.Users.length;
                        collection.Users.map(function (user) {
                            var label = user.Attributes && user.Attributes['displayName'] ? user.Attributes['displayName'] : user.Login;
                            var uNode = new _AjxpNode2['default'](USERS_ROOT + user.Login, true, label);
                            uNode.getMetadata().set('IdmUser', user);
                            uNode.getMetadata().set('ajxp_mime', 'user_editable');
                            childrenNodes.push(uNode);
                        });
                    }
                    if (collection.Total > count) {
                        var paginationData = new Map();
                        paginationData.set('total', Math.ceil(collection.Total / limit));
                        paginationData.set('current', newPage || 1);
                        node.getMetadata().set('paginationData', paginationData);
                    }
                    node.setChildren(childrenNodes);
                    if (nodeCallback !== null) {
                        node.replaceBy(node);
                        nodeCallback(node);
                    }
                });
                return {
                    v: undefined
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        }

        SettingsNodeProvider.loadMenu().then(function (data) {
            // Check if a specific section path was required by navigation
            var parts = _utilLangUtils2['default'].trim(node.getPath(), '/').split('/').filter(function (k) {
                return k !== "";
            });
            var sectionPath = undefined;
            var pagePath = undefined;
            if (parts.length >= 1) {
                sectionPath = '/' + parts[0];
            }
            if (parts.length >= 2) {
                pagePath = node.getPath();
            }

            var childrenNodes = [];
            if (data.__metadata__ && !sectionPath && !pagePath) {
                for (var k in data.__metadata__) {
                    if (data.__metadata__.hasOwnProperty(k)) {
                        node.getMetadata().set(k, data.__metadata__[k]);
                    }
                }
                node.replaceBy(node);
            }
            if (data.Sections) {
                data.Sections.map(function (section) {
                    var childNode = SettingsNodeProvider.parseSection('/', section, childCallback);
                    if (sectionPath && childNode.getPath() === sectionPath) {
                        if (pagePath) {
                            // We are looking for a specific child
                            var children = childNode.getChildren();
                            if (children.has(pagePath)) {
                                node.replaceBy(children.get(pagePath));
                                if (nodeCallback) {
                                    nodeCallback(node);
                                }
                                return;
                            }
                        }
                        // We are looking for this section, return this as the parent node
                        node.setChildren(childNode.getChildren());
                        node.replaceBy(childNode);
                        if (nodeCallback) {
                            nodeCallback(node);
                        }
                        return;
                    }
                    if (!sectionPath) {
                        if (childCallback) {
                            childCallback(childNode);
                        }
                        childrenNodes.push(childNode);
                    }
                });
            }
            node.setChildren(childrenNodes);
            if (nodeCallback !== null) {
                nodeCallback(node);
            }
        });
    };

    /**
     * Load a node
     * @param node AjxpNode
     * @param nodeCallback Function On node loaded
     * @param aSync bool
     * @param additionalParameters object
     */

    SettingsNodeProvider.prototype.loadLeafNodeSync = function loadLeafNodeSync(node, nodeCallback) {
        var aSync = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        var additionalParameters = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        if (nodeCallback) {
            nodeCallback(node);
        }
    };

    SettingsNodeProvider.prototype.refreshNodeAndReplace = function refreshNodeAndReplace(node, onComplete) {

        if (onComplete) {
            onComplete(node);
        }
    };

    SettingsNodeProvider.parseSection = function parseSection(parentPath, section) {
        var childCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        var label = section.LABEL;
        if (pydio && pydio.MessageHash && pydio.MessageHash[label]) {
            label = pydio.MessageHash[label];
        }
        var sectionNode = new _AjxpNode2['default'](parentPath + section.Key, false, label, '', new SettingsNodeProvider());
        if (section.METADATA) {
            for (var k in section.METADATA) {
                if (section.METADATA.hasOwnProperty(k)) {
                    sectionNode.getMetadata().set(k, section.METADATA[k]);
                }
            }
        }
        if (section.CHILDREN) {
            section.CHILDREN.map(function (c) {
                sectionNode.addChild(SettingsNodeProvider.parseSection(parentPath + section.Key + '/', c, childCallback));
            });
        }
        if (sectionNode.getPath().indexOf(USERS_ROOT) === 0) {
            sectionNode.setLoaded(false);
            sectionNode.getMetadata().set('ajxp_mime', 'group');
        } else {
            sectionNode.setLoaded(true);
        }
        return sectionNode;
    };

    /**
     * @return {Promise}
     */

    SettingsNodeProvider.loadMenu = function loadMenu() {
        if (_httpPydioApi2['default'].LOADED_SETTINGS_MENU) {
            return Promise.resolve(_httpPydioApi2['default'].LOADED_SETTINGS_MENU);
        }
        return new Promise(function (resolve, reject) {
            var client = _httpPydioApi2['default'].getRestClient();
            client.callApi('/frontend/settings-menu', 'GET', '', [], [], [], null, null, ['application/json'], ['application/json'], null).then(function (r) {
                _httpPydioApi2['default'].LOADED_SETTINGS_MENU = r.response.body;
                resolve(r.response.body);
            })['catch'](function (e) {
                reject(e);
            });
        });
    };

    return SettingsNodeProvider;
})();

exports['default'] = SettingsNodeProvider;
module.exports = exports['default'];
