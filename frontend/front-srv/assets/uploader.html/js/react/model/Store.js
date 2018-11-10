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
import UploadItem from './UploadItem'
import FolderItem from './FolderItem'
import Session from './Session'
import {debounce} from 'lodash'

class Store extends Observable{

    constructor(){
        super();
        this._processing = [];
        this._processed = [];
        this._errors = [];
        this._sessions = [];
        this._blacklist = [".ds_store", ".pydio"];

        this._running = false;
        this._pauseRequired = false;
    }

    // Required for backward compat
    getAutoStart(){
        return Configs.getInstance().getAutoStart();
    }

    pushSession(session) {
        this._sessions.push(session);
        session.Task = Task.create(session);
        session.observe('update', ()=> {
            this.notify('update');
        });
        session.observe('children', ()=> {
            this.notify('update');
        });
        this.notify('update');
        session.observe('status', (s) => {
            if(s === 'ready'){
                const autoStart = Configs.getInstance().getAutoStart();
                if(autoStart && !this._processing.length && !this._pauseRequired) {
                    this.processNext();
                } else if(!autoStart){
                    Pydio.getInstance().getController().fireAction("upload");
                }
            } else if(s === 'confirm') {
                Pydio.getInstance().getController().fireAction("upload", {confirmDialog: true});
            }
        });
    }

    removeSession(session){
        session.Task.setIdle();
        const i = this._sessions.indexOf(session);
        this._sessions = LangUtils.arrayWithout(this._sessions, i);
        this.notify('update');
    }

    log(){}

    hasQueue(){
        return this.getNexts(1).length;
    }

    clearAll(){
        this._sessions.forEach(session => {
            session.Task.setIdle();
        });
        this._sessions = [];
        this._pauseRequired = false;

        this._processing = [];
        this._processed = [];
        this._errors = [];
        this.notify('update');

    }

    processNext(){
        let processables = this.getNexts();
        if(processables.length && !this._pauseRequired){
            this._running = true;
            processables.map(processable => {
                this._processing.push(processable);
                processable.process(()=>{
                    this._processing = LangUtils.arrayWithout(this._processing, this._processing.indexOf(processable));
                    if(processable.getStatus() === 'error') {
                        this._errors.push(processable)
                    } else {
                        this._processed.push(processable);
                    }
                    this.processNext();
                    this.notify("update");
                });
            });
        }else{
            this._running = false;
            //this._pauseRequired = false;
            if(this.hasErrors()){
                if(!pydio.getController().react_selector){
                    Pydio.getInstance().getController().fireAction("upload");
                }
            }else if(Configs.getInstance().getAutoClose()){
                this.notify("auto_close");
            }
        }
    }

    getNexts(max = 3){
        let folders = [];
        this._sessions.forEach(session => {
            session.walk((item)=>{
                folders.push(item);
            }, (item)=>{
                return item.getStatus() === 'new'
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
                return item.getStatus() === 'new'
            }, 'file', ()=>{
                return items.length >= max - processing;
            });
            if(sessItems === 0){
                session.Task.setIdle();
            }
        });
        return items;

    }

    stopOrRemoveItem(item){
        item.abort();
        ['_uploads', '_folders', '_processing', '_processed', '_errors'].forEach(function(key){
            let arr = this[key];
            if(arr.indexOf(item) !== -1) {
                this[key] = LangUtils.arrayWithout(arr, arr.indexOf(item));
            }
        }.bind(this));
        this.notify("update");
    }

    getItems(){
        return {
            sessions: this._sessions,

            processing: this._processing,
            processed: this._processed,
            errors: this._errors,
        };
    }

    hasErrors(){
        return this._errors.length ? this._errors : false;
    }

    isRunning(){
        return this._running && !this._pauseRequired;
    }

    pause(){
        this._pauseRequired = true;
        this._sessions.forEach(s => s.setStatus('paused'));
        this.notify('update');
    }

    resume(){
        this._pauseRequired = false;
        this._sessions.forEach(s => s.setStatus('ready'));
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

    handleDropEventResults(items, files, targetNode, accumulator = null, filterFunction = null ){

        const overwriteStatus = Configs.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");
        const session = new Session(Pydio.getInstance().user.activeRepository, targetNode);
        this.pushSession(session);
        const filter = (refPath) => {
            if(filterFunction && !filterFunction(refPath)){
                return false;
            }
            return this._blacklist.indexOf(PathUtils.getBasename(refPath).toLowerCase()) === -1;
        };

        const enqueue = (item, isFolder=false) => {
            if(filterFunction && !filterFunction(item)){
                return;
            }
            if(accumulator){
                accumulator.push(item)
            } else if (isFolder) {
                //this.pushFolder(item);
                session.pushFolder(item);
            } else {
                //this.pushFile(item);
                session.pushFile(item);
            }
        };

        if (items && items.length && (items[0].getAsEntry || items[0].webkitGetAsEntry)) {
            let error = (global.console ? global.console.log : function(err){global.alert(err); }) ;
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
                    //enqueue(f, true);
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
                return session.prepare(overwriteStatus);
            }).catch((e) => {

            }) ;

        }else{
            for(let j=0;j<files.length;j++){
                if(files[j].size === 0){
                    alert(Pydio.getInstance().MessageHash['html_uploader.8']);
                    return;
                }
                if(!filter(files[j].name)){
                    return;
                }
                new UploadItem(files[j], targetNode, null, session);
            }
            session.prepare(overwriteStatus).catch((e) => {

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