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

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _langObservable = require('./lang/Observable');

var _langObservable2 = _interopRequireDefault(_langObservable);

var _langLogger = require('./lang/Logger');

var _langLogger2 = _interopRequireDefault(_langLogger);

var _httpPydioApi = require('./http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _modelRegistry = require('./model/Registry');

var _modelRegistry2 = _interopRequireDefault(_modelRegistry);

var _modelAjxpNode = require('./model/AjxpNode');

var _modelAjxpNode2 = _interopRequireDefault(_modelAjxpNode);

var _modelPydioDataModel = require('./model/PydioDataModel');

var _modelPydioDataModel2 = _interopRequireDefault(_modelPydioDataModel);

var _modelRepository = require('./model/Repository');

var _modelRepository2 = _interopRequireDefault(_modelRepository);

var _modelController = require('./model/Controller');

var _modelController2 = _interopRequireDefault(_modelController);

var _utilXMLUtils = require('./util/XMLUtils');

var _utilXMLUtils2 = _interopRequireDefault(_utilXMLUtils);

var _utilPathUtils = require('./util/PathUtils');

var _utilPathUtils2 = _interopRequireDefault(_utilPathUtils);

var _utilLangUtils = require('./util/LangUtils');

var _utilLangUtils2 = _interopRequireDefault(_utilLangUtils);

var _utilActivityMonitor = require('./util/ActivityMonitor');

var _utilActivityMonitor2 = _interopRequireDefault(_utilActivityMonitor);

var _httpPydioWebSocket = require('./http/PydioWebSocket');

var _httpPydioWebSocket2 = _interopRequireDefault(_httpPydioWebSocket);

var _modelEmptyNodeProvider = require("./model/EmptyNodeProvider");

var _modelEmptyNodeProvider2 = _interopRequireDefault(_modelEmptyNodeProvider);

/**
 * This is the main class for launching the whole framework,
 * with or without a UI.
 * It can be launched by PydioBootstrap or directly by giving the right parameters.
 */

var Pydio = (function (_Observable) {
    _inherits(Pydio, _Observable);

    /**
     * Pydio Constructor takes a Map of start parameters.
     *
     * @param parameters {Map}
     */

    function Pydio(parameters) {
        _classCallCheck(this, Pydio);

        _Observable.call(this);
        this.Parameters = parameters;
        this._initLoadRep = parameters.get('initLoadRep') || null;
        this.usersEnabled = parameters.get('usersEnabled') || null;
        this.currentLanguage = parameters.get('currentLanguage') || null;
        this.appTitle = "Pydio";
        if (this.Parameters.has("customWording")) {
            this.appTitle = this.Parameters.get("customWording").title || "Pydio";
        }
        this.user = null;
        this.MessageHash = {};
        if (window.MessageHash) this.MessageHash = window.MessageHash;
        this.ApiClient = _httpPydioApi2['default'].getClient();
        this.ApiClient.setPydioObject(this);
        this.ActivityMonitor = new _utilActivityMonitor2['default'](this);
        this.Registry = new _modelRegistry2['default'](this);
        this._rootNode = new _modelAjxpNode2['default']("/", "Root");
        this._dataModel = this._contextHolder = new _modelPydioDataModel2['default'](false);
        this._dataModel.setAjxpNodeProvider(new _modelEmptyNodeProvider2['default']());
        this._dataModel.setRootNode(this._rootNode);
        // Must happen AFTER datamodel initization.
        this.Controller = new _modelController2['default'](this);
        this.WebSocketClient = new _httpPydioWebSocket2['default'](this);
        if (this.repositoryId) {
            this.WebSocketClient.currentRepo = this.repositoryId;
            this.WebSocketClient.open();
        }
    }

    Pydio.prototype.fire = function fire(eventName, data) {
        this.notify(eventName, data);
    };

    /**
     *
     * @param {User|null} userObject
     */

    Pydio.prototype.updateUser = function updateUser(userObject) {
        var skipEvent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        this.user = userObject;
        if (!skipEvent) {
            this.notify('user_logged', userObject);
        }
    };

    /**
     *
     * @returns {null|User}
     */

    Pydio.prototype.getUser = function getUser() {
        return this.user;
    };

    /**
     * Refresh user/preferences registry part
     */

    Pydio.prototype.refreshUserData = function refreshUserData() {
        var _this = this;

        this.observeOnce("registry_part_loaded", function (event) {
            if (event !== "user/preferences") return;
            _this.updateUser(_this.Registry.parseUser(), false);
        });
        this.Registry.load("user/preferences");
    };

    /**
     * Real initialisation sequence. Will Trigger the whole GUI building.
     */

    Pydio.prototype.init = function init() {
        var _this2 = this;

        this.observe("registry_loaded", function () {

            _this2.Registry.refreshExtensionsRegistry();
            _this2.updateUser(_this2.Registry.parseUser(), false);
            if (_this2.user) {
                var repId = _this2.user.getActiveRepository();
                var repList = _this2.user.getRepositoriesList();
                var repositoryObject = repList.get(repId);
                if (repositoryObject) repositoryObject.loadResources();
            }
            if (_this2.UI.guiLoaded) {
                _this2.UI.refreshTemplateParts();
                _this2.Registry.refreshExtensionsRegistry();
                _this2.Controller.loadActionsFromRegistry(_this2.getXmlRegistry());
            } else {
                _this2.observe("gui_loaded", function () {
                    _this2.UI.refreshTemplateParts();
                    _this2.Registry.refreshExtensionsRegistry();
                    _this2.Controller.loadActionsFromRegistry(_this2.getXmlRegistry());
                });
            }
            _this2.loadActiveRepository();
            if (_this2.Parameters.has("USER_GUI_ACTION")) {
                (function () {
                    var a = _this2.Parameters.get("USER_GUI_ACTION");
                    _this2.Parameters['delete']("USER_GUI_ACTION");
                    setTimeout(function () {
                        _this2.Controller.fireAction(a);
                    }, 1000);
                })();
            }
        });

        var starterFunc = (function () {
            var _this3 = this;

            ResourcesManager.loadClassesAndApply(["React", "PydioReactUI"], function () {
                _this3.UI = new window.PydioReactUI.Builder(_this3);
                _this3.UI.initTemplates();
                if (!_this3.user) {
                    _httpPydioApi2['default'].getClient().tryToLogUserFromRememberData();
                }
                _this3.fire("registry_loaded", _this3.Registry.getXML());
                setTimeout(function () {
                    _this3.fire('loaded');
                }, 200);
            });
        }).bind(this);

        if (this.Parameters.get("PRELOADED_REGISTRY")) {

            this.Registry.loadFromString(this.Parameters.get("PRELOADED_REGISTRY"));
            this.Parameters['delete']("PRELOADED_REGISTRY");
            starterFunc();
        } else {

            if (this.Parameters.has("PRELOG_USER") && !this.user) {
                var login = this.Parameters.get("PRELOG_USER");
                var pwd = login + "#$!Az1";
                _httpPydioApi2['default'].getRestClient().jwtFromCredentials(login, pwd, false).then(function () {
                    _this2.loadXmlRegistry(null, starterFunc, _this2.Parameters.get("START_REPOSITORY"));
                })['catch'](function (e) {
                    _this2.loadXmlRegistry(null, starterFunc);
                });
            } else {
                this.loadXmlRegistry(null, starterFunc, this.Parameters.get("START_REPOSITORY"));
            }
        }

        this.observe("server_message", function (xml) {
            var reload = _utilXMLUtils2['default'].XPathSelectSingleNode(xml, "tree/require_registry_reload");
            if (reload) {
                if (reload.getAttribute("repositoryId") !== _this2.repositoryId) {
                    _this2.loadXmlRegistry(null, null, reload.getAttribute("repositoryId"));
                    _this2.repositoryId = null;
                }
            }
        });
    };

    /**
     * Loads the XML Registry, an image of the application in its current state
     * sent by the server.
     * @param sync Boolean Whether to send synchronously or not.
     * @param xPath String An XPath to load only a subpart of the registry
     * @param completeFunc
     * @param targetRepositoryId
     */

    Pydio.prototype.loadXmlRegistry = function loadXmlRegistry() {
        var xPath = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
        var completeFunc = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var targetRepositoryId = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        this.Registry.load(xPath, completeFunc, targetRepositoryId);
    };

    /**
     * Get the XML Registry
     * @returns Document
     */

    Pydio.prototype.getXmlRegistry = function getXmlRegistry() {
        return this.Registry.getXML();
    };

    /**
     * Find the current repository (from the current user) and load it.
     */

    Pydio.prototype.loadActiveRepository = function loadActiveRepository() {
        var _this4 = this;

        var repositoryObject = new _modelRepository2['default'](null);
        if (this.user === null) {
            this.loadRepository(repositoryObject);
            this.fire("repository_list_refreshed", { list: false, active: false });
            this.Controller.fireAction("login");
            return;
        }

        var repId = this.user.getActiveRepository();
        var repList = this.user.getRepositoriesList();
        repositoryObject = repList.get(repId);

        if (!repositoryObject) {
            if (this.user.lock) {
                (function () {
                    _this4.Controller.loadActionsFromRegistry(_this4.getXmlRegistry());
                    var lock = _this4.user.lock.split(",").shift();
                    window.setTimeout(function () {
                        _this4.Controller.fireAction(lock);
                    }, 150);
                })();
            } else {
                alert("No active repository found for user!");
                this.Controller.fireAction("logout");
            }
            return;
        }

        if (this.user.getPreference("pending_folder") && this.user.getPreference("pending_folder") != "-1") {

            this._initLoadRep = this.user.getPreference("pending_folder");
            this.user.setPreference("pending_folder", "-1");
            this.user.savePreference("pending_folder");
        }

        this.loadRepository(repositoryObject);
        this.fire("repository_list_refreshed", { list: repList, active: repId });
    };

    /**
     * Refresh the repositories list for the current user
     */

    Pydio.prototype.reloadRepositoriesList = function reloadRepositoriesList() {
        var _this5 = this;

        if (!this.user) return;
        this.observeOnce("registry_part_loaded", function (data) {
            if (data != "user/repositories") return;
            _this5.updateUser(_this5.Registry.parseUser());
            if (_this5.user.getRepositoriesList().size === 0) {
                _this5.loadXmlRegistry(); // User maybe locket out Reload full registry now!
            }
            _this5.fire("repository_list_refreshed", {
                list: _this5.user.getRepositoriesList(),
                active: _this5.user.getActiveRepository()
            });
        });
        this.loadXmlRegistry("user/repositories");
    };

    /**
     * Load a Repository instance
     * @param repository Repository
     */

    Pydio.prototype.loadRepository = function loadRepository(repository) {
        var _this6 = this;

        if (this.repositoryId != null && this.repositoryId == repository.getId()) {
            _langLogger2['default'].debug('Repository already loaded, do nothing');
        }
        this._contextHolder.setSelectedNodes([]);
        if (repository == null) return;

        repository.loadResources();
        var repositoryId = repository.getId();
        var newIcon = repository.getIcon();

        var providerDef = repository.getNodeProviderDef();
        var rootNode = undefined;
        if (providerDef != null) {
            var provider = eval('new ' + providerDef.name + '()');
            if (providerDef.options) {
                provider.initProvider(providerDef.options);
            }
            this._contextHolder.setAjxpNodeProvider(provider);
            rootNode = new _modelAjxpNode2['default']("/", false, repository.getLabel(), newIcon, provider);
        } else {
            rootNode = new _modelAjxpNode2['default']("/", false, repository.getLabel(), newIcon);
            // Default
            this._contextHolder.setAjxpNodeProvider(new _modelEmptyNodeProvider2['default']());
        }

        var initLoadRep = this._initLoadRep && this._initLoadRep !== '/' ? this._initLoadRep.valueOf() : null;
        var firstLoadObs = function firstLoadObs() {};
        if (initLoadRep) {
            firstLoadObs = function () {
                _this6.goTo(initLoadRep);
                _this6._initLoadRep = null;
            };
        }

        this._contextHolder.setRootNode(rootNode);
        rootNode.observeOnce('first_load', (function () {
            this._contextHolder.notify('context_changed', rootNode);
            this.Controller.fireContextChange();
            firstLoadObs();
        }).bind(this));
        this.repositoryId = repositoryId;
        rootNode.load();
    };

    /**
     * Require a context change to the given path
     * @param nodeOrPath AjxpNode|String A node or a path
     */

    Pydio.prototype.goTo = function goTo(nodeOrPath) {
        var gotoNode = undefined;
        var path = undefined;
        if (typeof nodeOrPath == "string") {
            path = nodeOrPath;
            gotoNode = new _modelAjxpNode2['default'](nodeOrPath);
        } else {
            gotoNode = nodeOrPath;
            path = gotoNode.getPath();
            if (nodeOrPath.getMetadata().has("repository_id") && nodeOrPath.getMetadata().get("repository_id") != this.repositoryId && nodeOrPath.getAjxpMime() != "repository" && nodeOrPath.getAjxpMime() != "repository_editable") {
                if (this.user) {
                    this.user.setPreference("pending_folder", nodeOrPath.getPath());
                    this._initLoadRep = nodeOrPath.getPath();
                }
                this.triggerRepositoryChange(nodeOrPath.getMetadata().get("repository_id"));
                return;
            }
        }
        if (this._repositoryCurrentlySwitching && this.user) {
            this.user.setPreference("pending_folder", gotoNode.getPath());
            this._initLoadRep = gotoNode.getPath();
            return;
        }
        var current = this._contextHolder.getContextNode();
        if (current && current.getPath() == path) {
            return;
        }
        if (path === "" || path === "/") {
            this._contextHolder.requireContextChange(this._contextHolder.getRootNode());
            return;
        } else {
            gotoNode = gotoNode.findInArbo(this._contextHolder.getRootNode());
            if (gotoNode) {
                // Node is already here
                if (!gotoNode.isBrowsable()) {
                    this._contextHolder.setPendingSelection(_utilPathUtils2['default'].getBasename(path));
                    this._contextHolder.requireContextChange(gotoNode.getParent());
                } else {
                    this._contextHolder.requireContextChange(gotoNode);
                }
            } else {
                // Check on server if it does exist, then load
                this._contextHolder.loadPathInfoAsync(path, (function (foundNode) {
                    if (!foundNode.isBrowsable()) {
                        this._contextHolder.setPendingSelection(_utilPathUtils2['default'].getBasename(path));
                        gotoNode = new _modelAjxpNode2['default'](_utilPathUtils2['default'].getDirname(path));
                    } else {
                        gotoNode = foundNode;
                    }
                    this._contextHolder.requireContextChange(gotoNode);
                }).bind(this));
            }
        }
    };

    /**
     * Change the repository of the current user and reload list and current.
     * @param repositoryId String Id of the new repository
     * @param callback Function
     */

    Pydio.prototype.triggerRepositoryChange = function triggerRepositoryChange(repositoryId, callback) {
        this.fire("trigger_repository_switch");
        this.Registry.load(null, null, repositoryId);

        /*
        //this._repositoryCurrentlySwitching = true;
        const onComplete = (transport) => {
            let loaded = false;
            if(transport.responseXML){
                this.ApiClient.parseXmlMessage(transport.responseXML);
                if(transport.responseXML.documentElement.nodeName === 'pydio_registry'){
                    loaded = true;
                    this.Registry.loadXML(transport.responseXML.documentElement);
                    this.repositoryId = repositoryId;
                }
            }
            if(!loaded){
                this.loadXmlRegistry(false,  null, null, repositoryId);
                this.repositoryId = null;
            }
             if (typeof callback === "function") callback();
            this._repositoryCurrentlySwitching = false;
        };
         const root = this._contextHolder.getRootNode();
        if(root){
            root.clear();
        }
        this.ApiClient.switchRepository(repositoryId, onComplete);
        */
    };

    Pydio.prototype.getPluginConfigs = function getPluginConfigs(pluginQuery) {
        return this.Registry.getPluginConfigs(pluginQuery);
    };

    Pydio.prototype.listLanguagesWithCallback = function listLanguagesWithCallback(callback) {
        var langs = this.Parameters.get("availableLanguages") || { "en": "Default" };
        var current = this.currentLanguage;
        Object.keys(langs).sort().map(function (key) {
            callback(key, langs[key], current === key);
        });
    };

    /**
     * Reload all messages from server and trigger updateI18nTags
     * @param newLanguage String
     * @param callback Function
     */

    Pydio.prototype.loadI18NMessages = function loadI18NMessages(newLanguage) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        this.ApiClient.switchLanguage(newLanguage, (function (data) {
            if (data) {
                this.MessageHash = data;
                if (window && window.MessageHash) {
                    window.MessageHash = this.MessageHash;
                }
                for (var key in this.MessageHash) {
                    if (this.MessageHash.hasOwnProperty(key)) {
                        this.MessageHash[key] = this.MessageHash[key].replace("\\n", "\n");
                    }
                }
                this.notify("language", newLanguage);
                this.Controller.refreshGuiActionsI18n();
                this.loadXmlRegistry();
                this.fireContextRefresh();
                this.currentLanguage = newLanguage;
                if (callback) callback();
            }
        }).bind(this));
    };

    /**
     * Get the main controller
     * @returns ActionManager
     */

    Pydio.prototype.getController = function getController() {
        return this.Controller;
    };

    /**
     * Display an information or error message to the user
     * @param messageType String ERROR or SUCCESS
     * @param message String the message
     */

    Pydio.prototype.displayMessage = function displayMessage(messageType, message) {
        var urls = _utilLangUtils2['default'].parseUrl(message);
        if (urls.length && this.user && this.user.repositories) {
            urls.forEach((function (match) {
                var repo = this.user.repositories.get(match.host);
                if (!repo) return;
                message = message.replace(match.url, repo.label + ":" + match.path + match.file);
            }).bind(this));
        }
        if (messageType == 'ERROR') _langLogger2['default'].error(message);else _langLogger2['default'].log(message);
        if (this.UI) {
            this.UI.displayMessage(messageType, message);
        }
    };

    /*************************************************
     *
     *          PROXY METHODS FOR DATAMODEL
     *
     ************************************************/

    /**
     * Accessor for updating the datamodel context
     * @param ajxpContextNode AjxpNode
     * @param ajxpSelectedNodes AjxpNode[]
     * @param selectionSource String
     */

    Pydio.prototype.updateContextData = function updateContextData(ajxpContextNode, ajxpSelectedNodes, selectionSource) {
        if (ajxpContextNode) {
            this._contextHolder.requireContextChange(ajxpContextNode);
        }
        if (ajxpSelectedNodes) {
            this._contextHolder.setSelectedNodes(ajxpSelectedNodes, selectionSource);
        }
    };

    /**
     * @returns PydioDataModel
     */

    Pydio.prototype.getContextHolder = function getContextHolder() {
        return this._contextHolder;
    };

    /**
     * @returns AjxpNode
     */

    Pydio.prototype.getContextNode = function getContextNode() {
        return this._contextHolder.getContextNode() || new _modelAjxpNode2['default']("");
    };

    /**
     * @returns PydioDataModel
     */

    Pydio.prototype.getUserSelection = function getUserSelection() {
        return this._contextHolder;
    };

    /**
     * Accessor for datamodel.requireContextChange()
     */

    Pydio.prototype.fireContextRefresh = function fireContextRefresh() {
        this.getContextHolder().requireContextChange(this.getContextNode(), true);
    };

    /**
     * Accessor for datamodel.requireContextChange()
     */

    Pydio.prototype.fireNodeRefresh = function fireNodeRefresh(nodePathOrNode, completeCallback) {
        this.getContextHolder().requireNodeReload(nodePathOrNode, completeCallback);
    };

    /**
     * Accessor for datamodel.requireContextChange()
     */

    Pydio.prototype.fireContextUp = function fireContextUp() {
        if (this.getContextNode().isRoot()) return;
        this.updateContextData(this.getContextNode().getParent());
    };

    /**
     * Proxy to ResourcesManager.requireLib for ease of writing
     * @param module
     * @param promise
     * @returns {*}
     */

    Pydio.requireLib = function requireLib(module) {
        var promise = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return require('pydio/http/resources-manager').requireLib(module, promise);
    };

    return Pydio;
})(_langObservable2['default']);

exports['default'] = Pydio;
module.exports = exports['default'];
