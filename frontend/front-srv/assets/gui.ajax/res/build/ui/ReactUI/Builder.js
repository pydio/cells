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

var _PydioContextProvider = require('./PydioContextProvider');

var _PydioContextProvider2 = _interopRequireDefault(_PydioContextProvider);

var _Moment = require('./Moment');

var _Moment2 = _interopRequireDefault(_Moment);

var React = require('react');
var ReactDOM = require('react-dom');
var XMLUtils = require('pydio/util/xml');
var PathUtils = require('pydio/util/path');
var FuncUtils = require('pydio/util/func');
var ResourcesManager = require('pydio/http/resources-manager');

var Builder = (function () {
    function Builder(pydio) {
        _classCallCheck(this, Builder);

        this._pydio = pydio;
        this.guiLoaded = false;
        this._componentsRegistry = new Map();
        this._pydio.observe('repository_list_refreshed', this.pageTitleObserver.bind(this));
        this._pydio.getContextHolder().observe('context_loaded', this.pageTitleObserver.bind(this));
        if (this._pydio.currentLanguage) {
            _Moment2['default'].locale(this._pydio.currentLanguage);
        }
        this._pydio.observe('language', function (lang) {
            _Moment2['default'].locale(lang);
        });
    }

    Builder.prototype.pageTitleObserver = function pageTitleObserver() {
        var ctxNode = this._pydio.getContextNode();
        var title = this._pydio.Parameters.get('customWording').title;
        if (ctxNode.getLabel()) {
            title += ' - ' + ctxNode.getLabel();
        }
        document.title = title;
    };

    Builder.prototype.initTemplates = function initTemplates() {
        var _this = this;

        if (!this._pydio.getXmlRegistry()) return;

        var tNodes = XMLUtils.XPathSelectNodes(this._pydio.getXmlRegistry(), "client_configs/template[@component]");

        var _loop = function (i) {

            var target = tNodes[i].getAttribute("element");
            var themeSpecific = tNodes[i].getAttribute("theme");
            var props = {};
            if (tNodes[i].getAttribute("props")) {
                props = JSON.parse(tNodes[i].getAttribute("props"));
            }
            props.pydio = _this._pydio;

            var containerId = props.containerId;
            var namespace = tNodes[i].getAttribute("namespace");
            var component = tNodes[i].getAttribute("component");

            if (themeSpecific && _this._pydio.Parameters.get("theme") && _this._pydio.Parameters.get("theme") !== themeSpecific) {
                return 'continue';
            }
            var targetObj = document.getElementById(target);
            if (!targetObj) {
                var tags = document.getElementsByTagName(target);
                if (tags.length) targetObj = tags[0];
            }
            if (targetObj) {
                var position = tNodes[i].getAttribute("position");
                var _name = tNodes[i].getAttribute('name');
                if (position === 'bottom' && _name || target === 'body') {
                    var newDiv = document.createElement('div');
                    if (tNodes[i].getAttribute("style")) {
                        newDiv.setAttribute('style', tNodes[i].getAttribute("style"));
                    }
                    if (target === 'body') {
                        targetObj.appendChild(newDiv);
                    } else {
                        targetObj.parentNode.appendChild(newDiv);
                    }
                    newDiv.id = _name;
                    target = _name;
                    targetObj = newDiv;
                }
                ResourcesManager.loadClassesAndApply([namespace], (function () {
                    if (!global[namespace] || !global[namespace][component]) {
                        if (console) console.error('Cannot find component [' + namespace + '][' + component + ']. Did you forget to export it? ');
                        return;
                    }
                    var element = React.createElement(_PydioContextProvider2['default'](global[namespace][component], this._pydio), props);
                    var el = ReactDOM.render(element, targetObj);
                    this._componentsRegistry.set(target, el);
                }).bind(_this));
            }
        };

        for (var i = 0; i < tNodes.length; i++) {
            var _ret = _loop(i);

            if (_ret === 'continue') continue;
        }
        this.guiLoaded = true;
        this._pydio.notify("gui_loaded");
    };

    Builder.prototype.refreshTemplateParts = function refreshTemplateParts() {

        this._componentsRegistry.forEach(function (reactElement) {
            reactElement.forceUpdate();
        });
    };

    Builder.prototype.updateHrefBase = function updateHrefBase(cdataContent) {
        return cdataContent;
    };

    /**
     *
     * @param component
     */

    Builder.prototype.registerEditorOpener = function registerEditorOpener(component) {
        this._editorOpener = component;
    };

    Builder.prototype.unregisterEditorOpener = function unregisterEditorOpener(component) {
        if (this._editorOpener === component) {
            this._editorOpener = null;
        }
    };

    Builder.prototype.getEditorOpener = function getEditorOpener() {
        return this._editorOpener;
    };

    Builder.prototype.openCurrentSelectionInEditor = function openCurrentSelectionInEditor(editorData, forceNode) {
        var selectedNode = forceNode ? forceNode : this._pydio.getContextHolder().getUniqueNode();
        if (!selectedNode) return;
        if (!editorData) {
            var selectedMime = PathUtils.getAjxpMimeType(selectedNode);
            var editors = this._pydio.Registry.findEditorsForMime(selectedMime, false);
            if (editors.length && editors[0].openable && editors[0].mimes && (editors[0].mimes[0] !== '*' || editors[0].mimes.indexOf(selectedMime) !== -1) && !(editors[0].write && selectedNode.getMetadata().get("node_readonly") === "true")) {
                editorData = editors[0];
            }
        }
        if (editorData) {
            this._pydio.Registry.loadEditorResources(editorData.resourcesManager, (function () {
                var editorOpener = this.getEditorOpener();
                if (!editorOpener || editorData.modalOnly) {
                    modal.openEditorDialog(editorData);
                } else {
                    editorOpener.openEditorForNode(selectedNode, editorData);
                }
            }).bind(this));
        } else {
            if (this._pydio.Controller.getActionByName("download")) {
                this._pydio.Controller.getActionByName("download").apply();
            }
        }
    };

    Builder.prototype.registerModalOpener = function registerModalOpener(component) {
        this._modalOpener = component;
    };

    Builder.prototype.unregisterModalOpener = function unregisterModalOpener() {
        this._modalOpener = null;
    };

    Builder.prototype.openComponentInModal = function openComponentInModal(namespace, componentName, props) {
        if (!this._modalOpener) {
            Logger.error('Cannot find any modal opener for opening component ' + namespace + '.' + componentName);
            return;
        }
        // Collect modifiers
        var modifiers = [];
        var namespaces = [];
        props = props || {};
        props['pydio'] = this._pydio;
        XMLUtils.XPathSelectNodes(this._pydio.getXmlRegistry(), '//client_configs/component_config[@component="' + namespace + '.' + componentName + '"]/modifier').map(function (node) {
            var module = node.getAttribute('module');
            modifiers.push(module);
            namespaces.push(module.split('.').shift());
        });
        if (modifiers.length) {
            ResourcesManager.loadClassesAndApply(namespaces, (function () {
                var modObjects = [];
                modifiers.map(function (mString) {
                    try {
                        var classObject = FuncUtils.getFunctionByName(mString, window);
                        modObjects.push(new classObject());
                    } catch (e) {
                        console.log(e);
                    }
                });
                props['modifiers'] = modObjects;
                this._modalOpener.open(namespace, componentName, props);
            }).bind(this));
        } else {
            this._modalOpener.open(namespace, componentName, props);
        }
    };

    /**
     *
     * @param component
     */

    Builder.prototype.registerMessageBar = function registerMessageBar(component) {
        this._messageBar = component;
    };

    Builder.prototype.unregisterMessageBar = function unregisterMessageBar() {
        this._messageBar = null;
    };

    Builder.prototype.displayMessage = function displayMessage(type, message) {
        var actionLabel = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var actionCallback = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        if (!this._messageBar) {
            Logger.error('Cannot find any messageBar for displaying message ' + message);
            return;
        }
        if (type === 'ERROR') {
            if (message instanceof Object && message.Title) {
                message = message.Title;
            }
            this._messageBar.error(message, actionLabel, actionCallback);
        } else {
            this._messageBar.info(message, actionLabel, actionCallback);
        }
    };

    Builder.prototype.hasHiddenDownloadForm = function hasHiddenDownloadForm() {
        return this._hiddenDownloadForm;
    };

    Builder.prototype.registerHiddenDownloadForm = function registerHiddenDownloadForm(component) {
        this._hiddenDownloadForm = component;
    };

    Builder.prototype.unRegisterHiddenDownloadForm = function unRegisterHiddenDownloadForm(component) {
        this._hiddenDownloadForm = null;
    };

    Builder.prototype.sendDownloadToHiddenForm = function sendDownloadToHiddenForm(selection, parameters) {
        if (this._hiddenDownloadForm) {
            this._hiddenDownloadForm.triggerDownload(selection, parameters);
        }
    };

    Builder.prototype.openPromptDialog = function openPromptDialog(json) {

        if (!this._modalOpener) {
            if (console) {
                console.error('Cannot find modalOpener! Received serverPromptDialog with data', json);
            }
            return;
        }
        this._modalOpener.open('PydioReactUI', 'ServerPromptDialog', json);
    };

    Builder.prototype.openConfirmDialog = function openConfirmDialog(props) {
        var validCallback = props.validCallback;
        var skipNext = props.skipNext;

        if (validCallback && skipNext && localStorage.getItem('confirm.skip.' + skipNext)) {
            validCallback();
            return;
        }
        this.openComponentInModal('PydioReactUI', 'ConfirmDialog', props);
    };

    return Builder;
})();

exports['default'] = Builder;
module.exports = exports['default'];
