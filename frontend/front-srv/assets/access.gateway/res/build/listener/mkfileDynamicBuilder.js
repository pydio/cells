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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _require = require('pydio/http/rest-api');

var TreeServiceApi = _require.TreeServiceApi;
var TemplatesServiceApi = _require.TemplatesServiceApi;
var RestTemplate = _require.RestTemplate;
var RestCreateNodesRequest = _require.RestCreateNodesRequest;
var TreeNode = _require.TreeNode;
var TreeNodeType = _require.TreeNodeType;

var QuickCache = undefined,
    QuickCacheTimer = undefined;

var Builder = (function () {
    function Builder() {
        _classCallCheck(this, Builder);
    }

    _createClass(Builder, null, [{
        key: 'dynamicBuilder',
        value: function dynamicBuilder() {
            var _this = this;

            var pydio = _pydio2['default'].getInstance();
            if (QuickCache !== null) {
                this.__loadedTemplates = QuickCache;
            }

            if (this.__loadedTemplates) {
                var _ret = (function () {

                    var exts = {
                        doc: 'file-word',
                        docx: 'file-word',
                        odt: 'file-word',
                        odg: 'file-chart',
                        odp: 'file-powerpoint',
                        ods: 'file-excel',
                        pot: 'file-powerpoint',
                        pptx: 'file-powerpoint',
                        rtf: 'file-word',
                        xls: 'file-excel',
                        xlsx: 'file-excel'
                    };

                    return {
                        v: _this.__loadedTemplates.map(function (tpl) {

                            var ext = undefined;
                            if (tpl.UUID) {
                                ext = _pydioUtilPath2['default'].getFileExtension(tpl.UUID);
                            } else {
                                ext = "txt";
                            }
                            var icon = 'file';
                            if (exts[ext]) {
                                icon = exts[ext];
                            }
                            return {
                                name: tpl.Label,
                                alt: tpl.Label,
                                icon_class: 'mdi mdi-' + icon,
                                callback: (function callee$4$0(e) {
                                    var repoList, contextNode, slug, base, path, pathDir, pathLabel, submit;
                                    return regeneratorRuntime.async(function callee$4$0$(context$5$0) {
                                        while (1) switch (context$5$0.prev = context$5$0.next) {
                                            case 0:
                                                repoList = pydio.user.getRepositoriesList();
                                                contextNode = pydio.getContextHolder().getContextNode();
                                                slug = repoList.get(pydio.user.activeRepository).getSlug();
                                                base = pydio.MessageHash["mkfile.untitled.document"] || "Untitled";
                                                path = slug + contextNode.getPath() + "/" + base + "." + ext;

                                                path = path.replace('//', '/');

                                                pathDir = _pydioUtilPath2['default'].getDirname(path);
                                                pathLabel = newLabel(contextNode, _pydioUtilPath2['default'].getBasename(path));

                                                submit = function submit(value) {
                                                    if (value.indexOf('/') !== -1) {
                                                        var message = pydio.MessageHash['filename.forbidden.slash'];
                                                        pydio.UI.displayMessage('ERROR', message);
                                                        throw new Error(message);
                                                    }
                                                    var api = new TreeServiceApi(PydioApi.getRestClient());
                                                    var request = new RestCreateNodesRequest();
                                                    var node = new TreeNode();
                                                    node.Path = pathDir + '/' + value;
                                                    node.Type = TreeNodeType.constructFromObject('LEAF');
                                                    request.Nodes = [node];
                                                    request.TemplateUUID = tpl.UUID;
                                                    api.createNodes(request).then(function (collection) {
                                                        //console.log('Create files', collection.Children);
                                                    });
                                                };

                                                pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
                                                    dialogTitleId: 156,
                                                    legendId: tpl.Label,
                                                    fieldLabelId: 174,
                                                    dialogSize: 'sm',
                                                    defaultValue: pathLabel,
                                                    defaultInputSelection: true,
                                                    submitValue: submit
                                                });

                                            case 10:
                                            case 'end':
                                                return context$5$0.stop();
                                        }
                                    }, null, this);
                                }).bind(_this)
                            };
                        })
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            }

            if (QuickCacheTimer) {
                clearTimeout(QuickCacheTimer);
            }
            var api = new TemplatesServiceApi(PydioApi.getRestClient());
            api.listTemplates().then(function (response) {
                _this.__loadedTemplates = response.Templates;
                // Add Empty File Template
                var emptyTemplate = new RestTemplate();
                emptyTemplate.Label = pydio.MessageHash["mkfile.empty.template.label"] || "Empty File";
                emptyTemplate.UUID = "";
                _this.__loadedTemplates.unshift(emptyTemplate);
                QuickCache = response.Templates;
                QuickCacheTimer = setTimeout(function () {
                    QuickCache = null;
                }, 2000);
                _pydio2['default'].getInstance().getController().fireContextChange();
            });

            return [];
        }
    }]);

    return Builder;
})();

function newLabel(contextNode, label) {

    var children = contextNode.getChildren();
    var isExists = function isExists(name) {
        var yes = false;
        children.forEach(function (child) {
            if (child.getLabel() === name) {
                yes = true;
            }
        });
        return yes;
    };

    var pos = label.lastIndexOf('.');
    var base = label.substring(0, pos);
    var ext = label.substring(pos);

    var newPath = label;
    var counter = 1;

    var exists = isExists(newPath);

    while (exists) {
        newPath = base + '-' + counter + ext;
        counter++;
        exists = isExists(newPath);
    }

    return newPath;
}

exports['default'] = function (pydio) {
    return Builder.dynamicBuilder;
};

module.exports = exports['default'];
