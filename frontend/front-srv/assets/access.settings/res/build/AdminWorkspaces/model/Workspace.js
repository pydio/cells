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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Repository = require('pydio/model/repository');

var Workspace = (function (_Observable) {
    _inherits(Workspace, _Observable);

    function Workspace(wsId) {
        var paramsEditable = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        _classCallCheck(this, Workspace);

        _get(Object.getPrototypeOf(Workspace.prototype), 'constructor', this).call(this);
        this.wsId = wsId;
        this.loaded = false;
        this.options = new Map();
        this.xmlData = null;
        this.tplParams = null;
        this.editable = paramsEditable;
    }

    _createClass(Workspace, [{
        key: 'isEditable',
        value: function isEditable() {
            return this.editable;
        }
    }, {
        key: 'getOption',
        value: function getOption(keyName) {
            var copyObject = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            if (copyObject) {
                return LangUtils.deepCopy(this.options.get(keyName));
            } else {
                return this.options.get(keyName);
            }
        }
    }, {
        key: 'getDriverLabel',
        value: function getDriverLabel() {
            return XMLUtils.XPathGetSingleNodeText(this.xmlData, "admin_data/ajxpdriver/@label");
        }
    }, {
        key: 'getDriverDescription',
        value: function getDriverDescription() {
            return XMLUtils.XPathGetSingleNodeText(this.xmlData, "admin_data/ajxpdriver/@description");
        }
    }, {
        key: 'getDriverIconClass',
        value: function getDriverIconClass() {
            var iClass = XMLUtils.XPathGetSingleNodeText(this.xmlData, "admin_data/ajxpdriver/@iconClass");
            return iClass ? iClass : 'icon-hdd';
        }
    }, {
        key: 'supportsFoldersBrowsing',
        value: function supportsFoldersBrowsing() {
            return !XMLUtils.XPathGetSingleNodeText(this.xmlData, "admin_data/repository/@securityScope");
        }
    }, {
        key: 'getDescriptionFromDriverTemplate',
        value: function getDescriptionFromDriverTemplate() {
            var tpl = XMLUtils.XPathGetSingleNodeText(this.xmlData, "admin_data/ajxpdriver/@description_template");
            if (!tpl) return "";
            var options = tpl.match(/{[a-zA-Z\-_]*}/g);
            var doptions = this.options;
            if (options) {
                options.map(function (o) {
                    var oName = o.replace('{', '').replace('}', '');
                    tpl = tpl.replace(o, doptions.get(oName) ? doptions.get(oName) : '');
                });
            }
            var vars = { PYDIO_DATA_PATH: 'PYDIO_DATA', PYDIO_USER: '[USERNAME]', PYDIO_GROUP_PATH: '[GROUP PATH]', PYDIO_GROUP_PATH_FLAT: '[GROUPNAME]' };
            for (var t in vars) {
                if (vars.hasOwnProperty(t)) tpl = tpl.replace(t, vars[t]);
            }
            return tpl;
        }
    }, {
        key: 'getPermissionMask',
        value: function getPermissionMask() {
            var node = XMLUtils.XPathSelectSingleNode(this.xmlData, "admin_data/additional_info/mask");
            if (node && node.firstChild && node.firstChild.nodeValue) {
                return JSON.parse(node.firstChild.nodeValue);
            } else {
                return {};
            }
        }
    }, {
        key: 'getSingleNodeTextFromXML',
        value: function getSingleNodeTextFromXML(xPath) {
            return XMLUtils.XPathGetSingleNodeText(this.xmlData, xPath);
        }
    }, {
        key: 'getMetaSourceLabel',
        value: function getMetaSourceLabel(metaKey) {
            var node = XMLUtils.XPathSelectSingleNode(this.xmlData, 'admin_data/metasources/meta[@id="' + metaKey + '"]/@label');
            if (node) {
                return node.nodeValue;
            } else {
                return metaKey;
            }
        }
    }, {
        key: 'getMetaSourceDescription',
        value: function getMetaSourceDescription(metaKey) {
            var node = XMLUtils.XPathSelectSingleNode(this.xmlData, 'admin_data/metasources/meta[@id="' + metaKey + '"]/@description');
            if (node) {
                return node.nodeValue;
            } else {
                return metaKey;
            }
        }
    }, {
        key: 'getAllMetaSources',
        value: function getAllMetaSources() {
            var choices = XMLUtils.XPathSelectNodes(this.xmlData, 'admin_data/metasources/meta');
            return Array.from(choices).map(function (cNode) {
                return { id: cNode.getAttribute('id'), label: cNode.getAttribute('label') };
            });
        }
    }, {
        key: 'addMetaSource',
        value: function addMetaSource(metaKey) {
            var sources = this.options.get('META_SOURCES');
            // Compute default values
            var values = {};
            var metaDefNodes = XMLUtils.XPathSelectNodes(this.xmlData, 'admin_data/metasources/meta[@id="' + metaKey + '"]/param');
            for (var i = 0; i < metaDefNodes.length; i++) {
                var param = PydioForm.Manager.parameterNodeToHash(metaDefNodes[i]);
                if (param['default']) {
                    values[param['name']] = param['default'];
                }
            }
            sources[metaKey] = values;
        }
    }, {
        key: 'removeMetaSource',
        value: function removeMetaSource(metaKey) {
            var sources = this.options.get('META_SOURCES');
            delete sources[metaKey];
        }
    }, {
        key: 'isTemplateChild',
        value: function isTemplateChild() {
            return this.tplParams !== null;
        }
    }, {
        key: 'isTemplate',
        value: function isTemplate() {
            return this.options.get("isTemplate") == "true";
        }
    }, {
        key: 'resetFromXml',
        value: function resetFromXml() {
            this.parseXml(null);
        }
    }, {
        key: 'parseXml',
        value: function parseXml(xmlData) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            if (xmlData) {
                this.xmlData = xmlData;
            } else {
                xmlData = this.xmlData;
            }
            var repoNode = XMLUtils.XPathSelectSingleNode(xmlData, 'admin_data/repository');
            var options = new Map(),
                att;
            for (var i = 0; i < repoNode.attributes.length; i++) {
                att = repoNode.attributes.item(i);
                options.set(att.nodeName, att.nodeValue);
            }
            Array.from(repoNode.childNodes).map(function (child) {
                if (child.nodeName != 'param') return;
                if (child.firstChild) {
                    if (child.getAttribute("name") == "META_SOURCES") {
                        options.set(child.getAttribute("name"), JSON.parse(child.firstChild.nodeValue));
                    } else {
                        options.set(child.getAttribute("name"), child.firstChild.nodeValue);
                    }
                } else {
                    options.set(child.getAttribute('name'), child.getAttribute('value'));
                }
            });
            var tplParams = XMLUtils.XPathSelectNodes(this.xmlData, "admin_data/template/option");
            if (tplParams.length) {
                var tplParamNames = {};
                for (var k = 0; k < tplParams.length; k++) {
                    if (tplParams[k].getAttribute("name")) {
                        tplParamNames[tplParams[k].getAttribute("name")] = true;
                    }
                }
                this.tplParams = tplParamNames;
            }
            if (!options.get('META_SOURCES')) options.set('META_SOURCES', {});
            this.options = options;
            this.loaded = true;
            this.notify('loaded');
            if (callback) callback(this);
        }
    }, {
        key: 'load',
        value: function load(callback) {
            PydioApi.getClient().request({
                get_action: 'edit',
                sub_action: 'edit_repository',
                repository_id: this.wsId
            }, (function (transport) {
                this.parseXml(transport.responseXML, callback);
            }).bind(this));
        }
    }, {
        key: 'buildEditor',
        value: function buildEditor(type, formDefs, formValues, saveData, templateAllFormDefs) {
            //var formDefs = [], formValues = {};
            if (type == 'driver' || type == 'general') {
                var currentRepoIsTemplate = this.isTemplate();
                if (type == 'general') {
                    if (currentRepoIsTemplate) {
                        formDefs.push({ name: 'TEMPLATE_ID', type: 'string', label: 'Unique Identifier', description: 'Internal Identifier', readonly: true });
                        formDefs.push({ name: 'TEMPLATE_LABEL', type: 'string', label: 'Label', description: 'Human-readable label for this template', mandatory: true });
                        formValues['TEMPLATE_ID'] = this.wsId;
                        formValues['TEMPLATE_LABEL'] = this.getOption('display');
                    } else {
                        formDefs.push({ name: 'WORKSPACE_ID', type: 'string', label: 'Unique Identifier', description: 'Internal Identifier, can be used to build API calls, but the Alias should be preferred.', readonly: true });
                        formDefs.push({ name: 'WORKSPACE_LABEL', type: 'string', label: 'Label', description: 'Human-readable label for this template', mandatory: true });
                        formValues['WORKSPACE_ID'] = this.wsId;
                        formValues['WORKSPACE_LABEL'] = this.getOption('display');
                    }
                }
                var driverParams = XMLUtils.XPathSelectNodes(this.xmlData, "admin_data/ajxpdriver/param");
                for (var i = 0; i < driverParams.length; i++) {
                    var hashedParams = PydioForm.Manager.parameterNodeToHash(driverParams[i]);
                    var generalScope = hashedParams['no_templates'] || hashedParams['templates_only'];
                    if (type == 'general' && !generalScope) continue;
                    if (type == 'driver' && generalScope) continue;
                    if (this.tplParams && this.tplParams[hashedParams['name']]) continue;
                    if (currentRepoIsTemplate && hashedParams['no_templates'] == 'true') {
                        continue;
                    } else if (!currentRepoIsTemplate && hashedParams['templates_only'] == 'true') {
                        continue;
                    }

                    if (templateAllFormDefs) templateAllFormDefs.push(hashedParams);
                    if (currentRepoIsTemplate && type == 'driver' && !this.options.has(hashedParams['name'])) {
                        continue;
                    }

                    var paramName = hashedParams['name'];
                    if (hashedParams['replicationGroup']) {
                        var pBase = paramName;
                        var repliIndex = 0;
                        while (this.options.has(pBase)) {
                            formValues[pBase] = this.options.get(pBase);
                            repliIndex++;
                            pBase = paramName + '_' + repliIndex;
                        }
                    } else if (this.options.get(paramName)) {
                        formValues[paramName] = this.options.get(paramName);
                    }
                    if (!generalScope && !hashedParams['group']) {
                        hashedParams['group'] = pydio.MessageHash['settings.41'];
                    } else if (generalScope) {
                        hashedParams['group'] = '';
                    }
                    formDefs.push(hashedParams);
                }
            } else {
                var metaLabel = this.getMetaSourceLabel(type);
                var metaDefNodes = XMLUtils.XPathSelectNodes(this.xmlData, 'admin_data/metasources/meta[@id="' + type + '"]/param');
                for (i = 0; i < metaDefNodes.length; i++) {
                    var param = PydioForm.Manager.parameterNodeToHash(metaDefNodes[i]);
                    param['group'] = metaLabel;
                    formDefs.push(param);
                }
                var values = this.options.get('META_SOURCES')[type];
                for (var key in values) {
                    if (values.hasOwnProperty(key)) {
                        formValues[key] = values[key];
                    }
                }
            }
            if (saveData && saveData[type]) {
                var saveValues = saveData[type];
                for (var skey in saveValues) {
                    if (saveValues.hasOwnProperty(skey)) {
                        formValues[skey] = saveValues[skey];
                    }
                }
            }
        }
    }, {
        key: 'loadWorkspaceInfo',
        value: function loadWorkspaceInfo(callback) {
            if (this.wsInfo) {
                callback(this.wsInfo);
                return;
            }
            PydioApi.getClient().request({
                get_action: 'load_repository_info',
                tmp_repository_id: this.wsId,
                collect: 'true'
            }, (function (transport) {
                this.wsInfo = transport.responseJSON;
                callback(transport.responseJSON);
            }).bind(this), { discrete: true });
        }
    }], [{
        key: 'loadAvailableDrivers',
        value: function loadAvailableDrivers(callback) {

            Workspace.DRIVERS = new Map();
            Workspace.TEMPLATES = new Map();

            PydioApi.getClient().request({ get_action: 'edit', sub_action: 'get_drivers_definition' }, (function (transport) {
                var xmlData = transport.responseXML;
                var root = XMLUtils.XPathSelectSingleNode(xmlData, "drivers");
                if (root.getAttribute("allowed") == "false") {
                    this.DRIVERS.NOT_ALLOWED = true;
                }
                var driverNodes = XMLUtils.XPathSelectNodes(xmlData, "drivers/ajxpdriver");
                for (var i = 0; i < driverNodes.length; i++) {
                    var driver = driverNodes[i];
                    var driverDef = {};
                    var driverLabel = XMLUtils.XPathGetSingleNodeText(driver, "@label");
                    var driverName = XMLUtils.XPathGetSingleNodeText(driver, "@name");
                    var driverParams = XMLUtils.XPathSelectNodes(driver, "param");

                    // Ignore "Pages" drivers
                    if (!driverName || Repository.isInternal(driverName)) continue;

                    driverDef['label'] = driverLabel;
                    driverDef['description'] = XMLUtils.XPathGetSingleNodeText(driver, "@description");
                    driverDef['name'] = driverName;
                    var driverParamsArray = [];
                    for (var j = 0; j < driverParams.length; j++) {
                        var paramNode = driverParams[j];
                        /*
                         if(this.currentCreateRepoType == "template" && paramNode.getAttribute('no_templates') == 'true'){
                         continue;
                         }else if(this.currentCreateRepoType == "repository" && paramNode.getAttribute('templates_only') == 'true'){
                         continue;
                         }
                         */
                        driverParamsArray.push(PydioForm.Manager.parameterNodeToHash(paramNode));
                    }
                    driverDef['params'] = driverParamsArray;
                    this.DRIVERS.set(driverName, driverDef);
                }
                PydioApi.getClient().request({ get_action: 'edit', sub_action: 'get_templates_definition' }, (function (transport) {
                    xmlData = transport.responseXML;
                    var driverNodes = XMLUtils.XPathSelectNodes(xmlData, "repository_templates/template");
                    for (var i = 0; i < driverNodes.length; i++) {
                        var driver = driverNodes[i];
                        var driverDef = {};
                        var driverName = XMLUtils.XPathGetSingleNodeText(driver, "@repository_id");
                        driverDef['label'] = XMLUtils.XPathGetSingleNodeText(driver, "@repository_label");
                        driverDef['type'] = XMLUtils.XPathGetSingleNodeText(driver, "@repository_type");
                        driverDef['name'] = driverName;
                        var driverParams = XMLUtils.XPathSelectNodes(driver, "option");
                        var optionsList = [];
                        for (var k = 0; k < driverParams.length; k++) {
                            optionsList.push(driverParams[k].getAttribute("name"));
                        }
                        driverDef['options'] = optionsList;
                        this.TEMPLATES.set(driverName, driverDef);
                    }
                    callback();
                }).bind(this));
            }).bind(Workspace));
        }
    }, {
        key: 'buildEditorStatic',
        value: function buildEditorStatic(driverParams, formDefs, formValues) {
            var type = arguments.length <= 3 || arguments[3] === undefined ? 'general' : arguments[3];
            var isTemplate = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

            if (type == 'general' || type == 'mixed') {
                var labelField;
                if (isTemplate) {
                    labelField = { name: 'DISPLAY', type: 'string', label: 'Label', description: 'The template label', mandatory: true };
                } else {
                    labelField = { name: 'DISPLAY', type: 'string', label: 'Label', description: 'The workspace label', mandatory: true };
                }
                formDefs.push(labelField);
            }

            for (var i = 0; i < driverParams.length; i++) {
                var hashedParams = LangUtils.deepCopy(driverParams[i]);
                var generalScope = hashedParams['no_templates'] || hashedParams['templates_only'];
                if (type == 'general' && !generalScope) continue;
                if (type == 'driver' && generalScope) continue;
                if (isTemplate && hashedParams['no_templates'] == 'true') {
                    continue;
                } else if (!isTemplate && hashedParams['templates_only'] == 'true') {
                    continue;
                }
                var paramName = hashedParams['name'];
                if (formValues[paramName] === undefined && hashedParams['default']) {
                    formValues[paramName] = hashedParams['default'];
                }
                if (!generalScope && !hashedParams['group']) {
                    hashedParams['group'] = pydio.MessageHash['settings.41'];
                } else if (generalScope) {
                    hashedParams['group'] = '';
                }
                formDefs.push(hashedParams);
            }
        }
    }]);

    return Workspace;
})(Observable);

exports['default'] = Workspace;
module.exports = exports['default'];
