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

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _User = require('./User');

var _User2 = _interopRequireDefault(_User);

var _langLogger = require('../lang/Logger');

var _langLogger2 = _interopRequireDefault(_langLogger);

var _httpResourcesManager = require('../http/ResourcesManager');

var _httpResourcesManager2 = _interopRequireDefault(_httpResourcesManager);

var Registry = (function () {
    function Registry(pydioObject) {
        _classCallCheck(this, Registry);

        this._registry = null;
        this._extensionsRegistry = { "editor": [], "uploader": [] };
        this._resourcesRegistry = {};
        this._pydioObject = pydioObject;
        this._xPathLoading = false;
        this._globalLoading = false;
    }

    /**
     * Parse XML String directly
     * @param s
     */

    Registry.prototype.loadFromString = function loadFromString(s) {
        if (this._fileExtensions) this._fileExtensions = null;
        this._registry = _utilXMLUtils2['default'].parseXml(s).documentElement;
    };

    /**
     *
     */

    Registry.prototype.loadXML = function loadXML(documentElement) {
        if (this._fileExtensions) this._fileExtensions = null;
        this._registry = documentElement;
        this._pydioObject.fire("registry_loaded", this._registry);
    };

    /**
     * Load registry from server
     * @param xPath
     * @param completeFunc
     * @param repositoryId
     */

    Registry.prototype.load = function load() {
        var xPath = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        var _this = this;

        var completeFunc = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var repositoryId = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        if (this._globalLoading) {
            return;
        }
        this._globalLoading = true;
        _httpPydioApi2['default'].getRestClient().getOrUpdateJwt().then(function (jwt) {
            var _pydioObject = _this._pydioObject;
            var user = _pydioObject.user;
            var Parameters = _pydioObject.Parameters;

            var url = Parameters.get('ENDPOINT_REST_API') + '/frontend/state/';
            var headers = {};
            if (jwt) {
                headers = { Authorization: 'Bearer ' + jwt };
                if (user || repositoryId) {
                    url += '?ws=' + (repositoryId ? repositoryId : user.getActiveRepository());
                }
            }
            if (Parameters.has('MINISITE')) {
                headers["X-Pydio-Minisite"] = Parameters.get('MINISITE');
            }
            if (user && user.getPreference('lang')) {
                var lang = user.getPreference('lang');
                if (url.indexOf('?') > 0) {
                    url += '&lang=' + lang;
                } else {
                    url += '?lang=' + lang;
                }
            }
            window.fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                headers: headers
            }).then(function (response) {
                _this._globalLoading = false;
                response.text().then(function (text) {
                    _this._registry = _utilXMLUtils2['default'].parseXml(text).documentElement;
                    if (completeFunc) {
                        completeFunc(_this._registry);
                    } else {
                        _this._pydioObject.fire("registry_loaded", _this._registry);
                    }
                });
            })['catch'](function (e) {
                _this._globalLoading = false;
            });
        });
    };

    /**
     * Inserts a document fragment retrieved from server inside the full tree.
     * The node must contains the xPath attribute to locate it inside the registry.
     * @param documentElement DOMNode
     */

    Registry.prototype.refreshXmlRegistryPart = function refreshXmlRegistryPart(documentElement) {
        var xPath = documentElement.getAttribute("xPath");
        var existingNode = _utilXMLUtils2['default'].XPathSelectSingleNode(this._registry, xPath);
        var parentNode = undefined;
        if (existingNode && existingNode.parentNode) {
            parentNode = existingNode.parentNode;
            parentNode.removeChild(existingNode);
            if (documentElement.firstChild) {
                parentNode.appendChild(documentElement.firstChild.cloneNode(true));
            }
        } else if (xPath.indexOf("/") > -1) {
            // try selecting parentNode
            var parentPath = xPath.substring(0, xPath.lastIndexOf("/"));
            parentNode = _utilXMLUtils2['default'].XPathSelectSingleNode(this._registry, parentPath);
            if (parentNode && documentElement.firstChild) {
                parentNode.appendChild(documentElement.firstChild.cloneNode(true));
            }
        } else {
            if (documentElement.firstChild) this._registry.appendChild(documentElement.firstChild.cloneNode(true));
        }
        this._pydioObject.fire("registry_part_loaded", xPath);
    };

    /**
     * Translate the XML answer to a new User object
     */

    Registry.prototype.parseUser = function parseUser() {
        var user = null,
            userNode = undefined;
        if (this._registry) {
            userNode = _utilXMLUtils2['default'].XPathSelectSingleNode(this._registry, "user");
        }

        console.log("User node is ", userNode);
        if (userNode) {
            var userId = userNode.getAttribute('id');
            var children = userNode.childNodes;
            if (userId) {
                user = new _User2['default'](userId, children, this._pydioObject);
            }
        }
        return user;
    };

    /**
     *
     * @returns {Element|*|null}
     */

    Registry.prototype.getXML = function getXML() {
        return this._registry;
    };

    /**
     * Find Extension initialisation nodes (activeCondition, onInit, etc), parses
     * the XML and execute JS.
     * @param xmlNode {Element} The extension node
     * @param extensionDefinition Object Information already collected about this extension
     * @returns Boolean
     */

    Registry.prototype.initExtension = function initExtension(xmlNode, extensionDefinition) {
        var activeCondition = _utilXMLUtils2['default'].XPathSelectSingleNode(xmlNode, 'processing/activeCondition');
        if (activeCondition && activeCondition.firstChild) {
            try {
                var func = new Function(activeCondition.firstChild.nodeValue.trim());
                if (func() === false) return false;
            } catch (e) {}
        }
        if (xmlNode.nodeName === 'editor') {

            Object.assign(extensionDefinition, {
                openable: xmlNode.getAttribute("openable") === "true",
                modalOnly: xmlNode.getAttribute("modalOnly") === "true",
                previewProvider: xmlNode.getAttribute("previewProvider") === "true",
                order: xmlNode.getAttribute("order") ? parseInt(xmlNode.getAttribute("order")) : 0,
                formId: xmlNode.getAttribute("formId") || null,
                text: this._pydioObject.MessageHash[xmlNode.getAttribute("text")],
                title: this._pydioObject.MessageHash[xmlNode.getAttribute("title")],
                icon: xmlNode.getAttribute("icon"),
                icon_class: xmlNode.getAttribute("iconClass"),
                editorActions: xmlNode.getAttribute("actions"),
                editorClass: xmlNode.getAttribute("className"),
                mimes: xmlNode.getAttribute("mimes").split(","),
                write: xmlNode.getAttribute("write") && xmlNode.getAttribute("write") === "true" ? true : false,
                canWrite: xmlNode.getAttribute("canWrite") && xmlNode.getAttribute("canWrite") === "true" ? true : false
            });
        } else if (xmlNode.nodeName === 'uploader') {

            var th = this._pydioObject.Parameters.get('theme');
            var clientForm = _utilXMLUtils2['default'].XPathSelectSingleNode(xmlNode, 'processing/clientForm[@theme="' + th + '"]');
            if (!clientForm) {
                clientForm = _utilXMLUtils2['default'].XPathSelectSingleNode(xmlNode, 'processing/clientForm');
            }
            if (clientForm && clientForm.getAttribute('module')) {
                extensionDefinition.moduleName = clientForm.getAttribute('module');
            }
            if (xmlNode.getAttribute("order")) {
                extensionDefinition.order = parseInt(xmlNode.getAttribute("order"));
            } else {
                extensionDefinition.order = 0;
            }
            var extensionOnInit = _utilXMLUtils2['default'].XPathSelectSingleNode(xmlNode, 'processing/extensionOnInit');
            if (extensionOnInit && extensionOnInit.firstChild) {
                try {
                    // @TODO: THIS WILL LIKELY TRIGGER PROTOTYPE CODE
                    eval(extensionOnInit.firstChild.nodeValue);
                } catch (e) {
                    _langLogger2['default'].error("Ignoring Error in extensionOnInit code:");
                    _langLogger2['default'].error(extensionOnInit.firstChild.nodeValue);
                    _langLogger2['default'].error(e.message);
                }
            }
            var dialogOnOpen = _utilXMLUtils2['default'].XPathSelectSingleNode(xmlNode, 'processing/dialogOnOpen');
            if (dialogOnOpen && dialogOnOpen.firstChild) {
                extensionDefinition.dialogOnOpen = dialogOnOpen.firstChild.nodeValue;
            }
            var dialogOnComplete = _utilXMLUtils2['default'].XPathSelectSingleNode(xmlNode, 'processing/dialogOnComplete');
            if (dialogOnComplete && dialogOnComplete.firstChild) {
                extensionDefinition.dialogOnComplete = dialogOnComplete.firstChild.nodeValue;
            }
        }
        return true;
    };

    /**
     * Refresh the currently active extensions
     * Extensions are editors and uploaders for the moment.
     */

    Registry.prototype.refreshExtensionsRegistry = function refreshExtensionsRegistry() {

        this._extensionsRegistry = { "editor": [], "uploader": [] };
        var extensions = _utilXMLUtils2['default'].XPathSelectNodes(this._registry, "plugins/editor|plugins/uploader");
        for (var i = 0; i < extensions.length; i++) {

            var extensionDefinition = {
                id: extensions[i].getAttribute("id"),
                xmlNode: extensions[i],
                resourcesManager: new _httpResourcesManager2['default']()
            };
            this._resourcesRegistry[extensionDefinition.id] = extensionDefinition.resourcesManager;
            var resourceNodes = _utilXMLUtils2['default'].XPathSelectNodes(extensions[i], "client_settings/resources|dependencies|clientForm");
            for (var j = 0; j < resourceNodes.length; j++) {
                extensionDefinition.resourcesManager.loadFromXmlNode(resourceNodes[j]);
            }
            if (this.initExtension(extensions[i], extensionDefinition)) {
                this._extensionsRegistry[extensions[i].nodeName].push(extensionDefinition);
            }
        }
        _httpResourcesManager2['default'].loadAutoLoadResources(this._registry);
    };

    /**
     * Find the currently active extensions by type
     * @param extensionType String "editor" or "uploader"
     * @returns {array}
     */

    Registry.prototype.getActiveExtensionByType = function getActiveExtensionByType(extensionType) {
        return this._extensionsRegistry[extensionType];
    };

    /**
     * Find a given editor by its id
     * @param editorId String
     * @returns AbstractEditor
     */

    Registry.prototype.findEditorById = function findEditorById(editorId) {
        return this._extensionsRegistry.editor.find(function (el) {
            return el.id == editorId;
        });
    };

    /**
     * Find Editors that can handle a given mime type
     * @param mime String
     * @returns AbstractEditor[]
     * @param restrictToPreviewProviders
     */

    Registry.prototype.findEditorsForMime = function findEditorsForMime(mime, restrictToPreviewProviders) {

        var user = this._pydioObject.user;
        var editors = [],
            checkWrite = false;

        if (user != null && !user.canWrite()) {
            checkWrite = true;
        }
        this._extensionsRegistry.editor.forEach(function (el) {
            if (el.mimes.indexOf(mime) !== -1 || el.mimes.indexOf('*') !== -1) {
                if (restrictToPreviewProviders && !el.previewProvider) return;
                if (!checkWrite || !el.write) editors.push(el);
            }
        });
        if (editors.length && editors.length > 1) {
            editors = editors.sort(function (a, b) {
                return (a.order || 0) - (b.order || 0);
            });
        }
        return editors;
    };

    /**
     * Trigger the load method of the resourcesManager.
     * @param resourcesManager ResourcesManager
     * @param callback triggered after JS loaded
     */

    Registry.prototype.loadEditorResources = function loadEditorResources(resourcesManager, callback) {
        resourcesManager.load(this._resourcesRegistry, false, callback);
    };

    /**
     *
     * @param pluginQuery
     * @returns {Map}
     */

    Registry.prototype.getPluginConfigs = function getPluginConfigs(pluginQuery) {

        var xpath = 'plugins/*[@id="core.' + pluginQuery + '"]/plugin_configs/property | plugins/*[@id="' + pluginQuery + '"]/plugin_configs/property';
        if (pluginQuery.indexOf('.') === -1) {
            xpath = 'plugins/' + pluginQuery + '/plugin_configs/property |' + xpath;
        }
        var properties = _utilXMLUtils2['default'].XPathSelectNodes(this._registry, xpath);
        var configs = new Map();
        properties.forEach(function (propNode) {
            configs.set(propNode.getAttribute("name"), JSON.parse(propNode.firstChild.nodeValue));
        });
        return configs;
    };

    /**
     *
     * @param pluginId
     * @param paramName
     * @returns {string}
     */

    Registry.prototype.getDefaultImageFromParameters = function getDefaultImageFromParameters(pluginId, paramName) {
        var node = _utilXMLUtils2['default'].XPathSelectSingleNode(this._registry, "plugins/*[@id='" + pluginId + "']/server_settings/global_param[@name='" + paramName + "']");
        if (!node) return '';
        return node.getAttribute("defaultImage") || '';
    };

    /**
     *
     * @param type
     * @param name
     * @returns {bool}
     */

    Registry.prototype.hasPluginOfType = function hasPluginOfType(type, name) {
        var node = undefined;
        if (name == null) {
            node = _utilXMLUtils2['default'].XPathSelectSingleNode(this._registry, 'plugins/plugin[contains(@id, "' + type + '.")] | plugins/' + type + '[@id]');
        } else {
            node = _utilXMLUtils2['default'].XPathSelectSingleNode(this._registry, 'plugins/plugin[@id="' + type + '.' + name + '"] | plugins/' + type + '[@id="' + type + '.' + name + '"]');
        }
        return node !== undefined;
    };

    /**
     * @return {Map|Map<string, object>}
     */

    Registry.prototype.getFilesExtensions = function getFilesExtensions() {
        var _this2 = this;

        if (this._fileExtensions) {
            return this._fileExtensions;
        }
        this._fileExtensions = new Map();
        var nodes = _utilXMLUtils2['default'].XPathSelectNodes(this._registry, 'extensions/*');
        nodes.forEach(function (node) {
            _this2._fileExtensions.set(node.getAttribute('mime'), { messageId: node.getAttribute('messageId'), fontIcon: node.getAttribute('font') });
        });
        return this._fileExtensions;
    };

    return Registry;
})();

exports['default'] = Registry;
module.exports = exports['default'];
