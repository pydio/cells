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
        this._folders = [];
        this._uploads = [];
        this._processing = [];
        this._processed = [];
        this._errors = [];
        this._sessions = [];
        this._blacklist = [".ds_store", ".pydio"]
        this._pause = true;
    }
    recomputeGlobalProgress(){
        let totalCount      = 0;
        let totalProgress   = 0;
        this._uploads.concat(this._processing).concat(this._processed).forEach(function(item){
            if(!item.getProgress) {
                return;
            }
            totalCount += item.getSize();
            totalProgress += item.getProgress() * item.getSize() / 100;
        });
        let progress;
        if (totalCount) {
            progress = totalProgress / totalCount;
        } else {
            progress = 0;
        }
        return progress;
    }

    // Required for backward compat
    getAutoStart(){
        return Configs.getInstance().getAutoStart();
    }

    pushFolder(folderItem){
        if(!this.getQueueSize()){
            this._processed = [];
            this._pause = true;
        }
        this._folders.push(folderItem);
        Task.getInstance().setPending(this.getQueueSize());
        if(Configs.getInstance().getAutoStart() && !this._processing.length) {
            this.processNext();
        }
        this.notify('update');
        this.notify('item_added', folderItem);
    }

    pushFile(uploadItem){
        if(!this.getQueueSize()){
            this._processed = [];
            this._pause = true;
        }

        const name = uploadItem.getFile().name.toLowerCase();
        const isBlacklisted = name.length >= 1 && name[0] === ".";
        if (isBlacklisted) {
            return
        }

        this._uploads.push(uploadItem);
        Task.getInstance().setPending(this.getQueueSize());
        uploadItem.observe("progress", ()=>{
            let pg = this.recomputeGlobalProgress();
            Task.getInstance().setProgress(pg);
        });
        if(Configs.getInstance().getAutoStart() && !this._processing.length) {
            this.processNext();
        }
        this.notify('update');
        this.notify('item_added', uploadItem);
    }

    pushSession(session) {
        Task.getInstance().setSessionPending(session);
        this._sessions.push(session);
        this.notify('update');
        session.observe('update', ()=> {
            if(!session.pending){
                this._sessions = this._sessions.filter(s => s !== session);
            }
            this.notify('update');
        });
    }

    log(){
    }

    getQueueSize(){
        return this._folders.length + this._uploads.length + this._processing.length;
    }

    clearAll(){
        this._folders = [];
        this._uploads = [];
        this._processing = [];
        this._processed = [];
        this._errors = [];
        this._sessions = [];
        this._pause = false;
        this.notify('update');
        Task.getInstance().setIdle();
    }

    processNext(){
        let processables = this.getNexts();
        if(processables.length){
            processables.map(processable => {
                this._processing.push(processable);
                Task.getInstance().setRunning(this.getQueueSize());
                processable.process(()=>{
                    this._processing = LangUtils.arrayWithout(this._processing, this._processing.indexOf(processable));
                    if(processable.getStatus() === 'error') {
                        this._errors.push(processable)
                    } else {
                        this._processed.push(processable);
                    }
                    if(!this._pause){
                        this.processNext();
                    }
                    this.notify("update");
                });
            });
        }else{
            this._pause = false;
            Task.getInstance().setIdle();

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
        if(this._pause){
            return [];
        }
        if(this._folders.length){
            return [this._folders.shift()];
        }
        let items = [];
        const processing = this._processing.length;
        for (let i = 0; i < (max - processing); i++){
            if(this._uploads.length){
                items.push(this._uploads.shift());
            }
        }
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
            processing: this._processing,
            pending: this._folders.concat(this._uploads),
            processed: this._processed,
            errors: this._errors,
            sessions: this._sessions,
        };
    }

    hasErrors(){
        return this._errors.length ? this._errors : false;
    }

    isPaused(){
        return this._pause && this.getQueueSize() > 0;
    }

    pause(){
        this._pause = true;
        this.notify('update');
    }

    resume(){
        this._pause = false;
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

        const session = new Session();
        this.pushSession(session);

        let folders = {};
        for (var i=0; i<files.length; i++) {
            let relPath = null;
            if (files[i]['webkitRelativePath']) {
                relPath = '/' + files[i]['webkitRelativePath'];
                const folderPath = PathUtils.getDirname(relPath);
                if (!folders[folderPath]) {
                    session.pushFolder(new FolderItem(folderPath, targetNode));
                    folders[folderPath] = true;
                }
            }
            session.pushFile(new UploadItem(files[i], targetNode, relPath));
        }
        session.computeStatuses().then(() => {
            Object.keys(session.folders).forEach(k => {
                this.pushFolder(session.folders[k]);
            });
            Object.keys(session.files).forEach(k => {
                this.pushFile(session.files[k]);
            })
        }).catch((e) => {

        }) ;

    }

    handleDropEventResults(items, files, targetNode, accumulator = null, filterFunction = null ){

        const session = new Session();
        this.pushSession(session);

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
                            if(File.size > 0) {
                                enqueue(new UploadItem(File, targetNode));
                            }
                            resolve();
                        }, () => { reject(); error();} );
                    }));

                } else if (entry.isDirectory) {

                    enqueue(new FolderItem(entry.fullPath, targetNode), true);

                    promises.push(this.recurseDirectory(entry, (fileEntry) => {
                        const relativePath = fileEntry.fullPath;
                        return new Promise((resolve, reject) => {
                            fileEntry.file((File) => {
                                if(File.size > 0) {
                                    enqueue(new UploadItem(File, targetNode, relativePath));
                                }
                                resolve();
                            }, e => {reject(e); error();});
                        });
                    }, function(folderEntry){
                        return Promise.resolve(enqueue(new FolderItem(folderEntry.fullPath, targetNode), true));
                    }, error));

                }
            }

            Promise.all(promises).then(() => {
                return session.computeStatuses();
            }).then(() => {
                Object.keys(session.folders).forEach(k => {
                    this.pushFolder(session.folders[k]);
                });
                Object.keys(session.files).forEach(k => {
                    this.pushFile(session.files[k]);
                })
            }).catch((e) => {

            }) ;

        }else{
            for(let j=0;j<files.length;j++){
                if(files[j].size === 0){
                    alert(Pydio.getInstance().MessageHash['html_uploader.8']);
                    return;
                }
                enqueue(new UploadItem(files[j], targetNode));
            }
            session.computeStatuses().then(() => {
                Object.keys(session.folders).forEach(k => {
                    this.pushFolder(session.folders[k]);
                });
                Object.keys(session.files).forEach(k => {
                    this.pushFile(session.files[k]);
                })
            }).catch((e) => {

            }) ;
        }

    }

    recurseDirectory(item, promiseFile, promiseFolder, errorHandler) {

        return new Promise(resolve => {
            this.dirEntries(item).then((entries) => {
                const promises = [];
                entries.forEach(entry => {
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