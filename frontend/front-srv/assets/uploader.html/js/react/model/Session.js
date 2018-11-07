/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import PydioApi from 'pydio/http/api'
import FolderItem from './FolderItem'
import Configs from './Configs'
import {TreeServiceApi, RestGetBulkMetaRequest, TreeNode, TreeNodeType} from 'pydio/http/rest-api'

class Session extends FolderItem {

    constructor() {
        super('folder');
        this._status = 'analyse';
        delete this.children.pg[this.getId()];
    }

    getFullPath(){
        return '/';
    }

    treeViewFromMaterialPath(merged){
        const tree = [];
        Object.keys(merged).forEach((path)  => {

            const pathParts = path.split('/');
            pathParts.shift(); // Remove first blank element from the parts array.
            let currentLevel = tree; // initialize currentLevel to root
            pathParts.forEach((part) => {
                // check to see if the path already exists.
                const existingPath = currentLevel.find((data)=>{return data.name === part});
                if (existingPath) {
                    // The path to this item was already in the tree, so don't add it again.
                    // Set the current level to this path's children
                    currentLevel = existingPath.children;
                } else {
                    const newPart = {
                        name: part,
                        item: merged[path],
                        path: path,
                        children: [],
                    };
                    currentLevel.push(newPart);
                    currentLevel = newPart.children;
                }
            });
        });
        return tree
    }

    prepare(){

        // Checking file already exists or not
        let overwriteStatus = Configs.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");

        // No need to check stats - we'll just override existing files
        if (overwriteStatus !== 'rename' && overwriteStatus !== 'alert') {
            this.setStatus('ready');
            return Promise.resolve()
        }

        const api = new TreeServiceApi(PydioApi.getRestClient());
        const request = new RestGetBulkMetaRequest();
        request.NodePaths = [];
        //Do not handle folders
        //request.NodePaths = request.NodePaths.concat(Object.keys(this.folders));
        // Root files
        // request.NodePaths = request.NodePaths.concat(Object.keys(this.files));
        // Recurse children files
        this.walk((item)=>{
            request.NodePaths.push(item.getFullPath());
        }, ()=>true, 'file');

        return new Promise((resolve, reject) => {
            const proms = [];
            api.bulkStatNodes(request).then(response => {
                if(response.Nodes && response.Nodes.length){
                    if(overwriteStatus === 'alert'){
                        // Ask for overwrite - if ok, just resolve without renaming
                        if (global.confirm(Pydio.getInstance().MessageHash[124])) {
                            this.setStatus('ready');
                            resolve();
                            return;
                        }
                    }
                    this.walk((item)=>{
                        if (response.Nodes.map(n=>n.Path).indexOf(item.getFullPath()) !== -1){
                            proms.push(new Promise(async resolve1 => {
                                let newPath = await this.newPath(item.getFullPath());
                                // Remove workspace slug
                                const parts = newPath.split('/');
                                parts.shift();
                                const newRelativePath = parts.join('/');
                                console.log('Update relative path with index', newRelativePath);
                                item.setRelativePath(newRelativePath);
                                resolve1();
                            }));
                        }
                    }, ()=>true, 'file');

                }
                Promise.all(proms).then(() => {
                    this.setStatus('ready');
                    resolve(proms);
                });
            });

        });

    }


    newPath(fullpath) {
        return new Promise(async (resolve) => {
            const lastSlash = fullpath.lastIndexOf('/');
            const pos = fullpath.lastIndexOf('.');
            let path = fullpath;
            let ext = '';

            // NOTE: the position lastSlash + 1 corresponds to hidden files (ex: .DS_STORE)
            if (pos  > -1 && lastSlash < pos && pos > lastSlash + 1) {
                path = fullpath.substring(0, pos);
                ext = fullpath.substring(pos);
            }

            let newPath = fullpath;
            let counter = 1;

            let exists = true; //await this.nodeExists(newPath); // If we are here, we already know it exists
            while (exists) {
                newPath = path + '-' + counter + ext;
                counter++;
                exists = await this.nodeExists(newPath)
            }

            resolve(newPath);
        });
    }

    nodeExists(fullpath) {
        return new Promise(resolve => {
            const api = new TreeServiceApi(PydioApi.getRestClient());
            const request = new RestGetBulkMetaRequest();
            request.NodePaths = [fullpath];
            api.bulkStatNodes(request).then(response => {
                if (response.Nodes && response.Nodes[0]) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(() => resolve(false))
        })
    }


}

export {Session as default}