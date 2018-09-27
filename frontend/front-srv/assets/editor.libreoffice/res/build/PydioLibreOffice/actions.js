'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _require = require('pydio/http/rest-api'),
    TreeServiceApi = _require.TreeServiceApi,
    RestCreateNodesRequest = _require.RestCreateNodesRequest,
    TreeNode = _require.TreeNode,
    TreeNodeType = _require.TreeNodeType;

var dynamicBuilder = exports.dynamicBuilder = function dynamicBuilder(controller) {

    var pydio = window.pydio;
    var MessageHash = pydio.MessageHash;
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

    var dir = pydio.getContextHolder().getContextNode().getPath();

    var builderMenuItems = [];

    Object.keys(exts).forEach(function (k) {

        if (!MessageHash['libreoffice.ext.' + k]) return;

        builderMenuItems.push({
            name: MessageHash['libreoffice.ext.' + k],
            alt: MessageHash['libreoffice.ext.' + k],
            icon_class: 'mdi mdi-' + exts[k],
            callback: async function (e) {
                var repoList = pydio.user.getRepositoriesList();
                var api = new TreeServiceApi(PydioApi.getRestClient());
                var request = new RestCreateNodesRequest();
                var node = new TreeNode();

                var slug = repoList.get(pydio.user.activeRepository).getSlug();

                var path = slug + dir + (dir ? "/" : "") + "Untitled Document." + k;
                path = await file_newpath(path);

                console.log("New path is ", path);
                node.Path = path;
                node.Type = TreeNodeType.constructFromObject('LEAF');
                request.Nodes = [node];

                api.createNodes(request).then(function (leaf) {
                    // Success - We should probably select the nodes
                    // pydio.getContextHolder().setSelectedNodes([node])
                });
            }.bind(undefined)
        });
    });

    return builderMenuItems;
};

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

        console.log("Exists ? ", exists);

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
            console.log(node);
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
