'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.dynamicBuilder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('pydio/http/rest-api'),
    TreeServiceApi = _require.TreeServiceApi,
    TemplatesServiceApi = _require.TemplatesServiceApi,
    RestCreateNodesRequest = _require.RestCreateNodesRequest,
    TreeNode = _require.TreeNode,
    TreeNodeType = _require.TreeNodeType;

var QuickCache = void 0,
    QuickCacheTimer = void 0;

var Builder = function () {
    function Builder() {
        _classCallCheck(this, Builder);
    }

    _createClass(Builder, null, [{
        key: 'dynamicBuilder',
        value: function dynamicBuilder() {
            var _this = this;

            if (QuickCache !== null) {
                this.__loadedTemplates = QuickCache;
            }

            if (this.__loadedTemplates) {

                var pydio = _pydio2.default.getInstance();
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

                return this.__loadedTemplates.map(function (tpl) {

                    var ext = _path2.default.getFileExtension(tpl.UUID);
                    var icon = 'file';
                    if (exts[ext]) {
                        icon = exts[ext];
                    }
                    return {
                        name: tpl.Label,
                        alt: tpl.Label,
                        icon_class: 'mdi mdi-' + icon,
                        callback: async function (e) {
                            var repoList = pydio.user.getRepositoriesList();
                            var contextNode = pydio.getContextHolder().getContextNode();
                            var api = new TreeServiceApi(PydioApi.getRestClient());
                            var request = new RestCreateNodesRequest();
                            var node = new TreeNode();
                            var slug = repoList.get(pydio.user.activeRepository).getSlug();

                            var path = slug + contextNode.getPath() + "/" + "Untitled Document." + ext;
                            path = path.replace('//', '/');
                            path = await file_newpath(path);

                            node.Path = path;
                            node.Type = TreeNodeType.constructFromObject('LEAF');
                            request.Nodes = [node];
                            request.TemplateUUID = tpl.UUID;

                            api.createNodes(request).then(function (leaf) {
                                // Success - We should probably select the nodes
                                // pydio.getContextHolder().setSelectedNodes([node])
                            });
                        }.bind(_this)
                    };
                });
            }

            if (QuickCacheTimer) {
                clearTimeout(QuickCacheTimer);
            }
            var api = new TemplatesServiceApi(PydioApi.getRestClient());
            api.listTemplates().then(function (response) {
                _this.__loadedTemplates = response.Templates;
                QuickCache = response.Templates;
                QuickCacheTimer = setTimeout(function () {
                    QuickCache = null;
                }, 2000);
                _pydio2.default.getInstance().getController().fireContextChange();
                console.log(response.Templates);
            });

            return [];
        }
    }]);

    return Builder;
}();

function loadTemplates() {
    var api = new TemplatesServiceApi(PydioApi.getRestClient());
    return api.listTemplates().then(function (response) {
        return response.Templates;
    });
}

function file_newpath(fullpath) {
    return new Promise(async function (resolve) {
        var lastSlash = fullpath.lastIndexOf('/');
        var pos = fullpath.lastIndexOf('.');
        var path = fullpath;
        var ext = '';

        // NOTE: the position lastSlash + 1 corresponds to hidden files (ex: .DS_STORE)
        if (pos > -1 && lastSlash < pos && pos > lastSlash + 1) {
            path = fullpath.substring(0, pos);
            ext = fullpath.substring(pos);
        }

        var newPath = fullpath;
        var counter = 1;

        var exists = await file_exists(newPath);

        while (exists) {
            newPath = path + '-' + counter + ext;
            counter++;
            exists = await file_exists(newPath);
        }

        resolve(newPath);
    }.bind(this));
}

function file_exists(fullpath) {
    return new Promise(function (resolve) {
        var api = new TreeServiceApi(PydioApi.getRestClient());

        api.headNode(fullpath).then(function (node) {
            if (node.Node) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch(function () {
            return resolve(false);
        });
    });
}

var dynamicBuilder = Builder.dynamicBuilder;
exports.dynamicBuilder = dynamicBuilder;
