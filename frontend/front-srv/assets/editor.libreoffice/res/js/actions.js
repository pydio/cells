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

const {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} = require('pydio/http/rest-api');

export const dynamicBuilder = (controller) => {

    const pydio = window.pydio;
    const MessageHash = pydio.MessageHash;
    const exts = {
        doc:'file-word',
        docx:'file-word',
        odt:'file-word',
        odg:'file-chart',
        odp:'file-powerpoint',
        ods:'file-excel',
        pot:'file-powerpoint',
        pptx:'file-powerpoint',
        rtf:'file-word',
        xls:'file-excel',
        xlsx:'file-excel'
    };

    const dir = pydio.getContextHolder().getContextNode().getPath();

    let builderMenuItems = [];

    Object.keys(exts).forEach((k) => {

        if(!MessageHash['libreoffice.ext.' + k]) return;

        builderMenuItems.push({
            name:MessageHash['libreoffice.ext.' + k],
            alt:MessageHash['libreoffice.ext.' + k],
            icon_class:'mdi mdi-' + exts[k],
            callback: async function(e) {
                const repoList = pydio.user.getRepositoriesList()
                const api = new TreeServiceApi(PydioApi.getRestClient());
                const request = new RestCreateNodesRequest();
                const node = new TreeNode();

                const slug = repoList.get(pydio.user.activeRepository).getSlug();

                let path = slug + dir + (dir ? "/" : "") + "Untitled Document." + k;
                path = await file_newpath(path)

                node.Path = path
                node.Type = TreeNodeType.constructFromObject('LEAF');
                request.Nodes = [node];

                api.createNodes(request).then(leaf => {
                    // Success - We should probably select the nodes
                    // pydio.getContextHolder().setSelectedNodes([node])
                });
            }.bind(this)
        });

    });

    return builderMenuItems;
}

function file_newpath(fullpath) {
    return new Promise(async function (resolve) {
        const lastSlash = fullpath.lastIndexOf('/')
        const pos = fullpath.lastIndexOf('.')
        let path = fullpath;
        let ext = '';

        // NOTE: the position lastSlash + 1 corresponds to hidden files (ex: .DS_STORE)
        if (pos  > -1 && lastSlash < pos && pos > lastSlash + 1) {
            path = fullpath.substring(0, pos);
            ext = fullpath.substring(pos);
        }

        let newPath = fullpath;
        let counter = 1;

        let exists = await file_exists(newPath);

        while (exists) {
            newPath = path + '-' + counter + ext;
            counter++;
            exists = await file_exists(newPath)
        }

        resolve(newPath);
    }.bind(this))
}

function file_exists(fullpath) {
    return new Promise(resolve => {
        const api = new TreeServiceApi(PydioApi.getRestClient());

        api.headNode(fullpath).then(node => {
            if (node.Node) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch(() => resolve(false))
    })
}
