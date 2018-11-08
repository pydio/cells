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

import Pydio from 'pydio'
import PathUtils from 'pydio/util/path'
const {TreeServiceApi, TemplatesServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} = require('pydio/http/rest-api');

let QuickCache, QuickCacheTimer;

class Builder {

    static dynamicBuilder(){

        if(QuickCache !== null) {
            this.__loadedTemplates = QuickCache;
        }

        if(this.__loadedTemplates){

            const pydio = Pydio.getInstance();
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

            return this.__loadedTemplates.map(tpl => {

                const ext = PathUtils.getFileExtension(tpl.UUID);
                let icon = 'file';
                if(exts[ext]) {
                    icon = exts[ext];
                }
                return {
                    name:tpl.Label,
                    alt:tpl.Label,
                    icon_class:'mdi mdi-' + icon,
                    callback: async function(e) {
                        const repoList = pydio.user.getRepositoriesList();
                        const contextNode = pydio.getContextHolder().getContextNode();
                        const api = new TreeServiceApi(PydioApi.getRestClient());
                        const request = new RestCreateNodesRequest();
                        const node = new TreeNode();
                        const slug = repoList.get(pydio.user.activeRepository).getSlug();

                        let path = slug + contextNode.getPath() + "/" + "Untitled Document." + ext;
                        path = path.replace('//', '/');
                        path = await file_newpath(path);

                        node.Path = path;
                        node.Type = TreeNodeType.constructFromObject('LEAF');
                        request.Nodes = [node];
                        request.TemplateUUID = tpl.UUID;

                        api.createNodes(request).then(leaf => {
                            // Success - We should probably select the nodes
                            // pydio.getContextHolder().setSelectedNodes([node])
                        });
                    }.bind(this)
                }
            });

        }

        if(QuickCacheTimer){
            clearTimeout(QuickCacheTimer);
        }
        const api = new TemplatesServiceApi(PydioApi.getRestClient());
        api.listTemplates().then(response => {
            this.__loadedTemplates = response.Templates;
            QuickCache = response.Templates;
            QuickCacheTimer = setTimeout(() => {
                QuickCache = null;
            }, 2000);
            Pydio.getInstance().getController().fireContextChange();
            console.log(response.Templates);
        });

        return [];

    };
}

function loadTemplates(){
    const api = new TemplatesServiceApi(PydioApi.getRestClient());
    return api.listTemplates().then(response => {
        return response.Templates;
    });
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

const dynamicBuilder = Builder.dynamicBuilder;
export {dynamicBuilder}