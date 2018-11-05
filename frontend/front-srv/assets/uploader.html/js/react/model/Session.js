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
import Observable from 'pydio/lang/observable'
import Configs from './Configs'
import {TreeServiceApi, RestGetBulkMetaRequest, TreeNode, TreeNodeType} from 'pydio/http/rest-api'

class Session extends Observable {

    constructor() {
        super();
        this.folders = {};
        this.files = {};
        this.pending = true;
    }

    sessionStatus(){
        return Object.keys(this.folders).length + ' folders - ' + Object.keys(this.files).length + ' files';
    }

    /**
     * @param uploadItem {UploadItem}
     */
    pushFile(uploadItem){
        this.files[uploadItem.getFullPath()] = uploadItem;
        this.notify('update');
    }

    /**
     * @param folderItem {FolderItem}
     */
    pushFolder(folderItem){
        this.folders[folderItem.getFullPath()] = folderItem;
        this.notify('update');
    }

    computeStatuses(){

        // Checking file already exists or not
        let overwriteStatus = Configs.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");

        // No need to check stats - we'll just override existing files
        if (overwriteStatus !== 'rename' && overwriteStatus !== 'alert') {
            this.pending = false;
            this.notify('update');
            return Promise.resolve()
        }

        const api = new TreeServiceApi(PydioApi.getRestClient());
        const request = new RestGetBulkMetaRequest();
        request.NodePaths = [];
        //Do not handle folders
        //request.NodePaths = request.NodePaths.concat(Object.keys(this.folders));
        request.NodePaths = request.NodePaths.concat(Object.keys(this.files));
        return new Promise((resolve, reject) => {
            const proms = [];
            api.bulkStatNodes(request).then(response => {
                if(response.Nodes && response.Nodes.length){
                    if(overwriteStatus === 'alert'){
                        // Ask for overwrite - if ok, just resolve without renaming
                        if (global.confirm(Pydio.getInstance().MessageHash[124])) {
                            this.pending = false;
                            this.notify("update");
                            resolve();
                            return;
                        }
                    }
                    response.Nodes.map(node => {
                        /*
                        // Do not handle folders
                        if(this.folders[node.Path]){
                            this.folders[node.Path].setExists();
                        }
                        */
                        if(this.files[node.Path]){
                            proms.push(new Promise(async resolve1 => {
                                let newPath = await this.newPath(node.Path);
                                // Remove workspace slug
                                const parts = newPath.split('/');
                                parts.shift();
                                const newRelativePath = parts.join('/');
                                console.log('Update relative path with index', newRelativePath);
                                this.files[node.Path].setRelativePath(newRelativePath);
                                resolve1();
                            }));
                        }
                    });
                }
                Promise.all(proms).then(() => {
                    resolve(proms);
                    this.pending = false;
                    this.notify('update');
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