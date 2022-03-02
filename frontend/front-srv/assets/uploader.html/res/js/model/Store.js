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
import LangUtils from 'pydio/util/lang'
import PathUtils from 'pydio/util/path'
import Observable from 'pydio/lang/observable'
import Task from './Task'
import Configs from './Configs'
import StatusItem from './StatusItem'
import UploadItem from './UploadItem'
import FolderItem from './FolderItem'
import Session from './Session'

import PydioApi from 'pydio/http/api'
import {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} from 'cells-sdk'

import MetaNodeProvider from 'pydio/model/meta-node-provider'

class Store extends Observable{

    constructor(){
        super();
        this._processing = [];
        this._sessions = [];
        this._blacklist = [".ds_store", ".pydio"];

        this._pauseRequired = false;

        MetaNodeProvider.RegisterLoaderHook('uploads',  (node, options = null) => {
            this._sessions.forEach(session => {
                this.sessionToNodes(session, node)
            })
        })

    }

    // Required for backward compat
    getAutoStart(){
        return Configs.getInstance().getAutoStart();
    }

    static openUploadDialog(confirm = false){
        if(confirm){
            Pydio.getInstance().getController().fireAction("upload", {confirmDialog: true});
        }else{
            Pydio.getInstance().getController().fireAction("upload");
        }
    }

    makeStatusString(item){
        const key = 'html_uploader.status.' + (item.getType()==='file'?'file':'dir')+'.' + item.getStatus()
        // Display missing key
        return Pydio.getMessages()[key] || key
    }

    createNode(item, path){
        const n = new TreeNode()
        n.Path = LangUtils.trim(path, '/')
        n.Type = item.getType() === 'file' ? 'LEAF' : 'COLLECTION'
        if(item.getSize){
            n.Size = item.getSize()
        }
        n.MTime = Math.round(new Date() / 1000);
        n.MetaStore = {
            'local:entryDescription':'"'+ this.makeStatusString(item) + '"',
            'local:UploadStatus': '"' + item.getStatus()+'"',
            'local:UploadProgress': item.getProgress() || 0
        }
        return MetaNodeProvider.parseTreeNode(n)
    }

    sessionToNodes(session, refNode = null) {
        if(refNode === null){
            refNode = session.getTargetNode();
        }
        const refRepoObject = Pydio.getInstance().user.getActiveRepositoryObject()
        const refPath = refNode.getPath()
        session.walk((item)=>{
            const getRefPath = (item) => (refPath + '/' + item.getLabel()).replace('//', '/')

            let childNodePath = getRefPath(item)

            if (!refNode.findChildByPath(childNodePath) && item.getStatus() !== StatusItem.StatusLoaded && item.getStatus() !== StatusItem.StatusError){
                //console.log('Adding childNode', childNodePath)
                refNode.addChild(this.createNode(item, childNodePath))
            }
            item.observe('update_label', (label) => {
                //console.log('label updated', label, item.getFullPath())
                const updatedNode = this.createNode(item, getRefPath(item))
                refNode.addChild(updatedNode);
            })
            item.observe('progress', (pg) => {
                let realChild = refNode.findChildByPath(getRefPath(item))
                if(!realChild){
                    realChild = this.createNode(item, getRefPath(item));
                    refNode.addChild(realChild)
                }
                if(item.getType() === 'file' && realChild.getMetadata().get("local:UploadProgress") !== pg){
                    //console.log('Update progress', pg)
                    realChild.getMetadata().set('local:entryDescription', this.makeStatusString(item))
                    realChild.getMetadata().set("local:UploadStatus", item.getStatus());
                    realChild.getMetadata().set("local:UploadProgress", pg);
                    realChild.setMetadata(realChild.getMetadata(), true)
                }
            })
            item.observe('status', (st) => {
                const realChild = refNode.findChildByPath(getRefPath(item))
                if(realChild){
                    if(st === StatusItem.StatusLoaded){
                        realChild.getMetadata().delete('local:entryDescription')
                        realChild.getMetadata().delete('local:UploadStatus')
                        realChild.getMetadata().delete('local:UploadProgress')
                    } else {
                        realChild.getMetadata().set('local:UploadStatus', st)
                        realChild.getMetadata().set('local:entryDescription', this.makeStatusString(item))
                    }
                    realChild.setMetadata(realChild.getMetadata(), true)
                }
                if(item.getStatus() === StatusItem.StatusError){
                    setTimeout(() => {
                        const realChild = refNode.findChildByPath(getRefPath(item))
                        //console.log('Loaded', childNode, realChild)
                        if(realChild && realChild.getParent() && !realChild.getMetadata().has("uuid")){
                            //console.log('Removing Temp childNode')
                            realChild.getParent().removeChild(realChild);
                        }
                    }, 1500)
                }
            })
        }, (item)=>{
            const comparePath = LangUtils.trim(refRepoObject.getSlug() + refNode.getPath(), '/')
            let itemDir = PathUtils.getDirname(item.getFullPath());
            return (
                refRepoObject.getId() === item.getRepositoryId()
                && itemDir === comparePath
                //&& item.getStatus() !== StatusItem.StatusLoaded
                //&& item.getStatus() !== StatusItem.StatusError
            )
        })
    }

    pushSession(session) {
        this._sessions.push(session);
        session.Task = Task.create(session);
        session.observe('update', ()=> {
            this.notify('update');
        });
        session.observe('children', ()=> {
            if(session.getChildren().length === 0) {
                this.removeSession(session);
            }
            this.sessionToNodes(session);
            this.notify('update');
        });
        session.observe('child_added', ()=>{
            this.sessionToNodes(session);
        })
        this.notify('update');
        session.observe('status', (s) => {
            if(s === 'ready'){
                const autoStart = this.getAutoStart();
                if(autoStart && !this._processing.length && !this._pauseRequired) {
                    this.processNext();
                } else if(!autoStart){
                    Store.openUploadDialog();
                }
            } else if(s === 'confirm') {
                Store.openUploadDialog(true);
            }
        });
        this.notify('session_added', session);
    }

    removeSession(session){
        session.Task.setIdle();
        const i = this._sessions.indexOf(session);
        this._sessions = LangUtils.arrayWithout(this._sessions, i);
        this.notify('update');
    }

    log(){}

    hasQueue(){
        let items = 0;
        this._sessions.forEach(session => {
            session.walk(()=>{
                items ++;
            }, (item)=>{
                return item.getStatus() === StatusItem.StatusNew || item.getStatus() === StatusItem.StatusPause || item.getStatus() === StatusItem.StatusMultiPause
            }, 'both', ()=>{
                return items >= 1
            });
        });
        return items > 0;
    }

    hasErrors(){
        let items = 0;
        this._sessions.forEach(session => {
            session.walk(()=>{
                items ++;
            }, (item)=>{
                return item.getStatus() === 'error'
            }, 'both', ()=>{
                return items >= 1
            });
        });
        return items > 0;
    }

    clearAll(){
        this.clearStatus('new');
        this._sessions.forEach(session => {
            session.walk((item)=> {
                item.getParent().removeChild(item);
            });
            session.Task.setIdle();
            this.removeSession(session);
        });
        this._pauseRequired = false;
        this.notify('update');

    }

    clearStatus(status){
        this._sessions.forEach(session => {
            session.walk((item)=> {
                item.getParent().removeChild(item);
            }, (item) => {
                return item.getStatus() === status;
            }, 'file')
        })
    }

    monitorProcessing(item){
        if(!this._processingMonitor){
            this._processingMonitor = () => {this.notify('update')}
        }
        item.observe('status', this._processingMonitor);
        this._processing.push(item);
        //this.notify('update');
    }

    unmonitorProcessing(item){
        const index = this._processing.indexOf(item);
        if(index > -1){
            if(this._processingMonitor){
                item.stopObserving('status', this._processingMonitor);
            }
            this._processing = LangUtils.arrayWithout(this._processing, index);
            //this.notify('update');
        }
    }

    processNext(){
        // Start with folders: this will block until all folders are properly created AND indexed.
        const folders = this.getFolders();
        if (folders.length && !this._pauseRequired) {
            const api = new TreeServiceApi(PydioApi.getRestClient());
            const request = new RestCreateNodesRequest();
            request.Nodes = [];
            folders.forEach(folderItem => {
                const node = new TreeNode();
                node.Path = folderItem.getFullPath();
                node.Type = TreeNodeType.constructFromObject('COLLECTION');
                request.Nodes.push(node);
                folderItem.setStatus(StatusItem.StatusLoading);
                this.monitorProcessing(folderItem);
            });
            this.notify('update');
            api.createNodes(request).then(() => {
                folders.forEach(folderItem => {
                    folderItem.setStatus(StatusItem.StatusLoaded);
                    folderItem.children.pg[folderItem.getId()] = 100;
                    folderItem.recomputeProgress();
                    this.unmonitorProcessing(folderItem);
                });
                this.processNext();
                this.notify("update");
            }).catch(e => {
                this.processNext();
                this.notify("update");
            });
            return
        }
        let processables = this.getNexts();
        if(processables.length && !this._pauseRequired){
            processables.forEach(processable => {
                this.monitorProcessing(processable);
                processable.process(()=>{
                    this.unmonitorProcessing(processable);
                    this.processNext();
                    this.notify("update");
                });
            });
            this.notify('update')
        }else{
            if(this.hasErrors()){
                Store.openUploadDialog();
            }else if(Configs.getInstance().getAutoClose() && !this._pauseRequired){
                this.notify("auto_close");
            }
            this.notify('update')
        }
    }

    getFolders(max = 60){
        let folders = [];
        this._sessions.forEach(session => {
            let has = 0;
            session.walk((item)=>{
                folders.push(item);
                has ++;
            }, (item)=>{
                return item.getStatus() === 'new' && item.isNew()
            }, 'folder', () => {
                return folders.length >= max;
            });
            session.setCreateFolders(has);
            session.setStatus(has?StatusItem.StatusFolders:StatusItem.StatusLoading)
        });
        return folders;
    }

    getNexts(max = 3){
        let folders = [];
        this._sessions.forEach(session => {
            session.walk((item)=>{
                folders.push(item);
            }, (item)=>{
                return item.getStatus() === 'new' && item.isNew()
            }, 'folder', ()=>{
                return folders.length >= 1;
            });
        });
        if(folders.length){
            return [folders.shift()];
        }
        let items = [];
        const processing = this._processing.length;
        this._sessions.forEach(session => {
            let sessItems = 0;
            session.walk((item)=>{
                items.push(item);
                sessItems ++;
            }, (item)=>{
                return item.getStatus() === 'new' || item.getStatus() === 'pause'
            }, 'file', ()=>{
                return items.length >= max - processing;
            });
            if(sessItems === 0 && processing === 0){
                session.Task.setIdle();
            }
        });
        return items;

    }

    stopOrRemoveItem(item){
        item.abort();
        this.unmonitorProcessing(item);
        this.notify("update");
    }

    getSessions(){
        return this._sessions;
    }

    isRunning(){
        return this._processing.filter(u => u.getStatus() === StatusItem.StatusLoading).length > 0;
    }

    pause(){
        this._pauseRequired = true;
        this._processing.forEach(u => u.pause());
        this.notify('update');
    }

    resume(){
        this._pauseRequired = false;
        this._sessions.forEach(s => s.setStatus('ready'));
        this._processing.forEach(u => u.resume());
        this.notify('update');
        this.processNext();
    }

    static getInstance(){
        if(!Store.__INSTANCE){
            Store.__INSTANCE = new Store();
        }
        return Store.__INSTANCE;
    }

    handleFolderPickerResult(files, targetNode){

        const overwriteStatus = Configs.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");
        const session = new Session(Pydio.getInstance().user.activeRepository, targetNode);
        this.pushSession(session);

        let mPaths = {};
        for (let i=0; i<files.length; i++) {
            const file = files[i];
            let mPath = '/' + PathUtils.getBasename(file.name);
            if (files[i]['webkitRelativePath']) {
                mPath = '/' + files[i]['webkitRelativePath'];
                const folderPath = PathUtils.getDirname(mPath);
                // Make sure the first level is registered
                if(folderPath !== '/'){
                    mPaths[PathUtils.getDirname(folderPath)] = 'FOLDER';
                }
                mPaths[folderPath] = 'FOLDER';
            }
            mPaths[mPath] = file;
        }
        const tree = session.treeViewFromMaterialPath(mPaths);
        const recurse = (children, parentItem)=>{
            children.forEach(child => {
                if(child.item === 'FOLDER'){
                    const f = new FolderItem(child.path, targetNode, parentItem);
                    recurse(child.children, f);
                } else {
                    if(this._blacklist.indexOf(PathUtils.getBasename(child.path).toLowerCase()) === -1){
                        const u = new UploadItem(child.item, targetNode, child.path, parentItem);
                    }
                }
            });
        };
        recurse(tree, session);
        session.prepare(overwriteStatus).catch((e) => {
            // DO SOMETHING?
        }) ;

    }

    handleDropEventResults(items, files, targetNode, accumulator = null, filterFunction = null, targetRepositoryId = null){

        const overwriteStatus = Configs.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");
        const session = new Session(targetRepositoryId || Pydio.getInstance().user.activeRepository, targetNode);
        this.pushSession(session);
        const filter = (refPath) => {
            if(filterFunction && !filterFunction(refPath)){
                return false;
            }
            return this._blacklist.indexOf(PathUtils.getBasename(refPath).toLowerCase()) === -1;
        };

        if(targetNode && targetNode.isLeaf() && targetNode.getMetadata().has('local:dropFunc')){
            const dropFunc = targetNode.getMetadata().get('local:dropFunc');
            dropFunc('native', session, items, files, targetNode).then(() => {
                session.prepare(overwriteStatus).then(()=>{
                    this.notify('update')
                }).catch((e) => {
                    this.notify('update')
                }) ;
            }).catch((e) => {
                this.removeSession(session);
                console.error(e);
            })
            return;
        }

        if (items && items.length && (items[0].getAsEntry || items[0].webkitGetAsEntry)) {
            let error = (console ? console.log : function(err){alert(err); }) ;
            let length = items.length;
            const promises = [];
            for (let i = 0; i < length; i++) {
                let entry;
                if(items[i].kind && items[i].kind !== 'file') {
                    continue;
                }
                if(items[0].getAsEntry){
                    entry = items[i].getAsEntry();
                }else{
                    entry = items[i].webkitGetAsEntry();
                }

                if (entry.isFile) {

                    promises.push(new Promise((resolve, reject) => {
                        entry.file(function(File) {
                            let u;
                            if(File.size > 0 && filter(File.name)) {
                                u = new UploadItem(File, targetNode, null, session);
                            }
                            resolve(u);
                        }, () => { reject(); error();} );
                    }));

                } else if (entry.isDirectory) {

                    entry.folderItem = new FolderItem(entry.fullPath, targetNode, session);
                    promises.push(this.recurseDirectory(entry, (fileEntry) => {
                        const relativePath = fileEntry.fullPath;
                        return new Promise((resolve, reject) => {
                            fileEntry.file((File) => {
                                let uItem;
                                if(File.size > 0 && filter(File.name)) {
                                    uItem = new UploadItem(File, targetNode, relativePath, fileEntry.parentItem);
                                }
                                resolve(uItem);
                            }, e => {reject(e); error();});
                        });
                    }, function(folderEntry){
                        if(filter(folderEntry.fullPath)){
                            folderEntry.folderItem = new FolderItem(folderEntry.fullPath, targetNode, folderEntry.parentItem);
                        }
                        return Promise.resolve(folderEntry.folderItem);
                    }, error));

                }
            }

            Promise.all(promises).then(() => {
                return session.prepare(overwriteStatus).then(()=>{
                    this.notify('update')
                });
            }).catch((e) => {
                this.notify('update')
            }) ;

        }else{
            for(let j=0;j<files.length;j++){
                if(files[j].size === 0){
                    alert(Pydio.getInstance().MessageHash['html_uploader.no-folders-support']);
                    return;
                }
                if(!filter(files[j].name)){
                    return;
                }
                new UploadItem(files[j], targetNode, null, session);
            }
            session.prepare(overwriteStatus).then(()=>{
                this.notify('update')
            }).catch((e) => {
                this.notify('update')
            }) ;
        }

    }

    recurseDirectory(item, promiseFile, promiseFolder, errorHandler) {

        return new Promise(resolve => {
            this.dirEntries(item).then((entries) => {
                const promises = [];
                entries.forEach(entry => {
                    if(entry.parent && entry.parent.folderItem){
                        entry.parentItem = entry.parent.folderItem;
                    }
                    if(entry.isDirectory){
                        promises.push(promiseFolder(entry));
                    } else {
                        promises.push(promiseFile(entry));
                    }
                });
                Promise.all(promises).then(() => {
                    resolve();
                });
            });
        });

    }

    dirEntries(item){
        const reader = item.createReader();
        let entries = [];
        const toArray = function(list){
            return Array.prototype.slice.call(list || [], 0);
        };
        return new Promise((resolve,reject) => {
            const next = () => {
                reader.readEntries(results => {
                    if(results.length){
                        entries = entries.concat(toArray(results));
                        next();
                    } else {
                        let promises = [];
                        entries.forEach(entry => {
                            entry.parent = item;
                            if(entry.isDirectory){
                                promises.push(this.dirEntries(entry).then(children => {
                                    entries = entries.concat(children);
                                }));
                            }
                        });
                        if(promises.length){
                            Promise.all(promises).then(()=> {
                                resolve(entries);
                            })
                        } else {
                            resolve(entries);
                        }
                    }
                }, (e) => {
                    reject(e);
                })
            };
            next();
        });
    }

}


export {Store as default}