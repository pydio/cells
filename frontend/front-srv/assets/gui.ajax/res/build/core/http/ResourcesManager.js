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

var SystemJS = require('systemjs');

/**
 * A manager that can handle the loading of JS, CSS and checks dependencies
 */

var ResourcesManager = (function () {

    /**
     * Constructor
     */

    function ResourcesManager() {
        _classCallCheck(this, ResourcesManager);

        this.mainFormContainerId = 'all_forms';
        this.resources = {};
        this.loaded = false;
    }

    /**
     * Adds a Javascript resource
     * @param fileName String
     * @param className String
     */

    ResourcesManager.prototype.addJSResource = function addJSResource(fileName, className) {
        if (!this.resources.js) {
            this.resources.js = [];
        }
        this.resources.js.push({
            fileName: fileName,
            className: className,
            autoload: false
        });
    };

    /**
     * Adds a CSS resource
     * @param fileName String
     */

    ResourcesManager.prototype.addCSSResource = function addCSSResource(fileName) {
        if (!this.resources.css) {
            this.resources.css = [];
        }
        this.resources.css.push(fileName);
    };

    /**
     * Adds a FORM from html snipper
     * @param formId String
     * @param htmlSnippet String
     */

    ResourcesManager.prototype.addGuiForm = function addGuiForm(formId, htmlSnippet) {
        if (!this.resources.forms) {
            this.resources.forms = new Map();
        }
        this.resources.forms.set(formId, htmlSnippet);
    };

    /**
     * Add a dependency to another plugin
     * @param data Object
     */

    ResourcesManager.prototype.addDependency = function addDependency(data) {
        if (!this.resources.dependencies) {
            this.resources.dependencies = [];
        }
        this.resources.dependencies.push(data);
    };

    /**
     * Check if some dependencies must be loaded before
     * @returns Boolean
     */

    ResourcesManager.prototype.hasDependencies = function hasDependencies() {
        return this.resources.dependencies || false;
    };

    /**
     * Load resources
     * @param resourcesRegistry Pydio resources registry
     */

    ResourcesManager.prototype.load = function load(resourcesRegistry) {
        var _this = this;

        var jsAutoloadOnly = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        var callback = arguments.length <= 2 || arguments[2] === undefined ? FuncUtils.Empty : arguments[2];

        if (this.loaded) {
            callback();
            return;
        }
        if (this.hasDependencies() && !this.dependenciesLoaded) {
            this.resources.dependencies.forEach((function (el) {
                if (resourcesRegistry[el]) {
                    // Load dependencies and try again
                    resourcesRegistry[el].load(resourcesRegistry, false, (function () {
                        this.dependenciesLoaded = true;
                        this.load(resourcesRegistry, false, callback);
                    }).bind(this));
                }
            }).bind(this));
        }
        if (this.resources.forms) {
            this.resources.forms.forEach((function (value, key) {
                // REMOVED
                //this.loadGuiForm(key, value);
            }).bind(this));
        }
        if (this.resources.js) {
            (function () {
                var it = _this.resources.js.values();
                var cb = (function () {
                    var object = it.next();
                    if (object.value) {
                        if (jsAutoloadOnly && !object.value.autoload) {
                            cb();
                            return;
                        }
                        this.loadJSResource(object.value.fileName, object.value.className, cb, true);
                    } else {
                        this.loaded = true;
                        callback();
                    }
                }).bind(_this);
                cb();
            })();
        } else {
            this.loaded = true;
            callback();
        }
        if (this.resources.css) {
            this.resources.css.forEach((function (value) {
                this.loadCSSResource(value);
            }).bind(this));
        }
    };

    /**
     * Load a javascript file
     * @param fileName String
     * @param className String
        * @param callback Function
        * @param aSync Boolean
     */

    ResourcesManager.prototype.loadJSResource = function loadJSResource(fileName, className, callback) {
        var aSync = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

        if (!ResourcesManager.__configsParsed) {
            ResourcesManager.loadAutoLoadResources();
        }
        SystemJS['import'](className).then(callback);
    };

    /**
     * Load a CSS file
     * @param fileName String
     */

    ResourcesManager.prototype.loadCSSResource = function loadCSSResource(fileName) {

        if (pydio.Parameters.get('SERVER_PREFIX_URI')) {
            fileName = pydio.Parameters.get('SERVER_PREFIX_URI') + fileName;
        }
        fileName = fileName + "?v=" + pydio.Parameters.get("ajxpVersion");

        var found = false;
        var links = document.getElementsByTagName('link');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.rel === 'stylesheet' && link.href.endsWith(fileName)) {
                found = true;break;
            }
        }
        if (!found) {
            var head = document.getElementsByTagName('head')[0];
            var cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.href = fileName;
            cssNode.media = 'screen';
            head.appendChild(cssNode);
        }
    };

    /**
     * Load the resources from XML
     * @param node XMLNode
     */

    ResourcesManager.prototype.loadFromXmlNode = function loadFromXmlNode(node) {
        var clForm = {},
            k = undefined;
        if (node.nodeName === "resources") {
            for (k = 0; k < node.childNodes.length; k++) {
                if (node.childNodes[k].nodeName === 'js') {
                    this.addJSResource(ResourcesManager.getFileOrFallback(node.childNodes[k]), node.childNodes[k].getAttribute('className'));
                } else if (node.childNodes[k].nodeName === 'css') {
                    this.addCSSResource(ResourcesManager.getFileOrFallback(node.childNodes[k]));
                } else if (node.childNodes[k].nodeName === 'img_library') {
                    ResourcesManager.addImageLibrary(node.childNodes[k].getAttribute('alias'), node.childNodes[k].getAttribute('path'));
                }
            }
        } else if (node.nodeName === "dependencies") {
            for (k = 0; k < node.childNodes.length; k++) {
                if (node.childNodes[k].nodeName === "pluginResources") {
                    this.addDependency(node.childNodes[k].getAttribute("pluginName"));
                }
            }
        } else if (node.nodeName === "clientForm" && node.firstChild) {
            if (!node.getAttribute("theme") || node.getAttribute("theme") === pydio.Parameters.get("theme")) {
                clForm = { formId: node.getAttribute("id"), formCode: node.firstChild.nodeValue };
            }
        }
        if (clForm.formId) {
            this.addGuiForm(clForm.formId, clForm.formCode);
        }
    };

    /**
     *
     * @param aliasName
     * @param aliasPath
     * @todo MOVE OUTSIDE?
     */

    ResourcesManager.addImageLibrary = function addImageLibrary(aliasName, aliasPath) {
        if (!window.AjxpImageLibraries) window.AjxpImageLibraries = {};
        window.AjxpImageLibraries[aliasName] = aliasPath;
    };

    /**
     * Find the default images path
     * @param src Icon source
     * @param defaultPath Default path, can contain ICON_SIZE
     * @param size Integer size optional
     * @returns string
     */

    ResourcesManager.resolveImageSource = function resolveImageSource(src, defaultPath, size) {
        if (!src) return "";
        var imagesFolder = ajxpResourcesFolder + '/images';
        if (pydioBootstrap.parameters.get('ajxpImagesCommon')) {
            imagesFolder = imagesFolder.replace('/' + pydioBootstrap.parameters.get('theme') + '/', '/common/');
        }

        if (defaultPath && defaultPath[0] !== '/') {
            defaultPath = '/' + defaultPath;
        }

        if (!window.AjxpImageLibraries || src.indexOf("/") == -1) {
            return imagesFolder + (defaultPath ? size ? defaultPath.replace("ICON_SIZE", size) : defaultPath : '') + '/' + src;
        }
        var radic = src.substring(0, src.indexOf("/"));
        if (window.AjxpImageLibraries[radic]) {
            src = src.replace(radic, window.AjxpImageLibraries[radic]);
            if (pydioBootstrap.parameters.get("SERVER_PREFIX_URI")) {
                src = pydioBootstrap.parameters.get("SERVER_PREFIX_URI") + src;
            }
            return size ? src.replace("ICON_SIZE", size) : src;
        } else {
            return imagesFolder + (defaultPath ? size ? defaultPath.replace("ICON_SIZE", size) : defaultPath : '') + '/' + src;
        }
    };

    /**
    * Check if resources are tagged autoload and load them
    * @param registry DOMDocument XML Registry
    */

    ResourcesManager.loadAutoLoadResources = function loadAutoLoadResources() {
        var registry = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (!registry) {
            registry = window.pydio.Registry.getXML();
        }
        var manager = new ResourcesManager();
        var jsNodes = _utilXMLUtils2['default'].XPathSelectNodes(registry, 'plugins/*/client_settings/resources/js');
        var node = undefined;

        var sysjsMap = {};
        var sysjsMeta = {
            '*': { authorization: true }
        };

        for (var _iterator = jsNodes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            if (_isArray) {
                if (_i >= _iterator.length) break;
                node = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                node = _i.value;
            }

            var namespace = node.getAttribute('className');
            var filepath = ResourcesManager.getFileOrFallback(node);
            var deps = [];
            if (node.getAttribute('depends')) {
                deps = node.getAttribute('depends').split(',');
            }
            if (node.getAttribute('expose')) {
                ResourcesManager.__requires[node.getAttribute('expose')] = namespace;
            }
            sysjsMap[namespace] = filepath;
            sysjsMeta[namespace] = { format: 'global', deps: deps };
        }
        SystemJS.config({ map: sysjsMap, meta: sysjsMeta });
        ResourcesManager.__configsParsed = true;

        var imgNodes = _utilXMLUtils2['default'].XPathSelectNodes(registry, 'plugins/*/client_settings/resources/img_library');
        for (var _iterator2 = imgNodes, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            if (_isArray2) {
                if (_i2 >= _iterator2.length) break;
                node = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) break;
                node = _i2.value;
            }

            ResourcesManager.addImageLibrary(node.getAttribute('alias'), node.getAttribute('path'));
        }
        var cssNodes = _utilXMLUtils2['default'].XPathSelectNodes(registry, 'plugins/*/client_settings/resources/css[@autoload="true"]');
        for (var _iterator3 = cssNodes, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
            if (_isArray3) {
                if (_i3 >= _iterator3.length) break;
                node = _iterator3[_i3++];
            } else {
                _i3 = _iterator3.next();
                if (_i3.done) break;
                node = _i3.value;
            }

            manager.loadCSSResource(ResourcesManager.getFileOrFallback(node));
        }
    };

    ResourcesManager.getFileOrFallback = function getFileOrFallback(node) {
        if (node.getAttribute('fallbackCondition') && eval(node.getAttribute('fallbackCondition'))) {
            return node.getAttribute('fallbackFile');
        } else {
            return node.getAttribute('file');
        }
    };

    ResourcesManager.requireLib = function requireLib(module) {
        var promise = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (window[module]) return window[module];
        if (ResourcesManager.__requires && ResourcesManager.__requires[module]) {
            var globalNS = ResourcesManager.__requires[module];
            if (promise) {
                return SystemJS['import'](globalNS);
            }
            if (window[globalNS]) {
                return window[globalNS];
            } else {
                throw new Error('Requiring a remote lib that was not previously loaded (' + globalNS + '). You may be missing a dependency declaration in manifest, or you can use requireLib(moduleName, true) to receive a Promise.');
            }
        } else {
            throw new Error('Cannot find any reference to lib ' + module);
        }
    };

    /**
     * Check if a module is registered (not necessarily loaded yet)
     * @param className
     * @returns {Map|boolean}
     */

    ResourcesManager.moduleIsAvailable = function moduleIsAvailable(className) {
        var config = SystemJS.getConfig();
        return config.map && config.map[className];
    };

    ResourcesManager.loadClassesAndApply = function loadClassesAndApply(classNames, callbackFunc) {
        if (!ResourcesManager.__configsParsed) {
            ResourcesManager.loadAutoLoadResources();
        }
        Promise.all(classNames.map(function (c) {
            return SystemJS['import'](c);
        })).then(function () {
            callbackFunc();
        })['catch'](function (reason) {
            console.error('Failed Loading ' + classNames.join(', ') + ' : ', reason);
        });
    };

    /**
     * Load class and return as a promise - do not catch error
     * @param className
     * @return {*|Promise|PromiseLike<T>|Promise<T>}
     */

    ResourcesManager.loadClass = function loadClass(className) {
        if (!ResourcesManager.__configsParsed) {
            ResourcesManager.loadAutoLoadResources();
        }
        return SystemJS['import'](className);
    };

    ResourcesManager.detectModuleToLoadAndApply = function detectModuleToLoadAndApply(callbackString, callbackFunc) {
        var async = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        if (!ResourcesManager.__configsParsed) {
            ResourcesManager.loadAutoLoadResources();
        }
        var className = callbackString.split('.', 1).shift();
        if (async) {
            SystemJS['import'](className).then(callbackFunc);
        } else {
            ResourcesManager.loadScriptSync(className, callbackFunc);
        }
    };

    ResourcesManager.loadScriptSync = function loadScriptSync(name, callback) {
        return regeneratorRuntime.async(function loadScriptSync$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return regeneratorRuntime.awrap(SystemJS['import'](name));

                case 2:
                    callback();

                case 3:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    return ResourcesManager;
})();

ResourcesManager.__configsParsed = false;
ResourcesManager.__requires = {};

exports['default'] = ResourcesManager;
module.exports = exports['default'];
