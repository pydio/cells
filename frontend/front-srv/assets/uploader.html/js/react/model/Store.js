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
import Observable from 'pydio/lang/observable'
import Task from './Task'
import Configs from './Configs'
import UploadItem from './UploadItem'
import FolderItem from './FolderItem'

class Store extends Observable{

    constructor(){
        super();
        this._folders = [];
        this._uploads = [];
        this._processing = [];
        this._processed = [];
        this._errors = [];
        this._blacklist = [".ds_store", ".pydio"]
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
        }

        const name = uploadItem.getFile().name.toLowerCase();
        const isBlacklisted = name.length >= 1 && name[0] === "."; //this._blacklist.reduce((current, val) => current || name === val, false);
        if (isBlacklisted) {
            //this.processNext();
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

    log(){
    }

    processQueue(){
        let next = this.getNext();
        while(next !== null){
            next.process(function(){
                if(next.getStatus() === 'error') {
                    this._errors.push(next);
                } else {
                    this._processed.push(next);
                }
                this.notify("update");
            }.bind(this));
            next = this.getNext();
        }
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
                    this.processNext();
                    this.notify("update");
                });
            });
        }else{
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
            errors: this._errors
        };
    }

    hasErrors(){
        return this._errors.length ? this._errors : false;
    }

    static getInstance(){
        if(!Store.__INSTANCE){
            Store.__INSTANCE = new Store();
        }
        return Store.__INSTANCE;
    }

    handleFolderPickerResult(files, targetNode){
        var folders = {};
        for (var i=0; i<files.length; i++) {
            var relPath = null;
            if (files[i]['webkitRelativePath']) {
                relPath = '/' + files[i]['webkitRelativePath'];
                var folderPath = PathUtils.getDirname(relPath);
                if (!folders[folderPath]) {
                    this.pushFolder(new FolderItem(folderPath, targetNode));
                    folders[folderPath] = true;
                }
            }
            this.pushFile(new UploadItem(files[i], targetNode, relPath));
        }
    }

    handleDropEventResults(items, files, targetNode, accumulator = null, filterFunction = null ){

        let oThis = this;

        if (items && items.length && (items[0].getAsEntry || items[0].webkitGetAsEntry)) {
            let error = (global.console ? global.console.log : function(err){global.alert(err); }) ;
            let length = items.length;
            for (var i = 0; i < length; i++) {
                var entry;
                if(items[i].kind && items[i].kind !== 'file') continue;
                if(items[0].getAsEntry){
                    entry = items[i].getAsEntry();
                }else{
                    entry = items[i].webkitGetAsEntry();
                }
                if (entry.isFile) {
                    entry.file(function(File) {
                        if(File.size === 0) return;
                        let uploadItem = new UploadItem(File, targetNode);
                        if(filterFunction && !filterFunction(uploadItem)) return;
                        if(!accumulator) oThis.pushFile(uploadItem);
                        else accumulator.push(uploadItem);
                    }, error );
                } else if (entry.isDirectory) {
                    let folderItem = new FolderItem(entry.fullPath, targetNode);
                    if(filterFunction && !filterFunction(folderItem)) continue;
                    if(!accumulator) oThis.pushFolder(folderItem);
                    else accumulator.push(folderItem);

                    this.recurseDirectory(entry, function(fileEntry) {
                        var relativePath = fileEntry.fullPath;
                        fileEntry.file(function(File) {
                            if(File.size === 0) return;
                            let uploadItem = new UploadItem(File, targetNode, relativePath);
                            if(filterFunction && !filterFunction(uploadItem)) return;
                            if(!accumulator) oThis.pushFile(uploadItem);
                            else accumulator.push(uploadItem);

                        }, error );
                    }, function(folderEntry){
                        let folderItem = new FolderItem(folderEntry.fullPath, targetNode);
                        if(filterFunction && !filterFunction(uploadItem)) return;
                        if(!accumulator) oThis.pushFolder(folderItem);
                        else accumulator.push(folderItem);
                    }, error );
                }
            }
        }else{
            for(var j=0;j<files.length;j++){
                if(files[j].size === 0){
                    alert(Pydio.getInstance().MessageHash['html_uploader.8']);
                    return;
                }
                let uploadItem = new UploadItem(files[j], targetNode);
                if(filterFunction && !filterFunction(uploadItem)) continue;
                if(!accumulator) oThis.pushFile(uploadItem);
                else accumulator.push(uploadItem);
            }
        }
        Store.getInstance().log();
    }

    recurseDirectory(item, fileHandler, folderHandler, errorHandler) {

        let recurseDir = this.recurseDirectory.bind(this);
        let dirReader = item.createReader();
        let entries = [];

        let toArray = function(list){
            return Array.prototype.slice.call(list || [], 0);
        };

        // Call the reader.readEntries() until no more results are returned.
        var readEntries = function() {
            dirReader.readEntries (function(results) {
                if (!results.length) {

                    entries.map(function(e){
                        if(e.isDirectory){
                            folderHandler(e);
                            recurseDir(e, fileHandler, folderHandler, errorHandler);
                        }else{
                            fileHandler(e);
                        }
                    });
                } else {
                    entries = entries.concat(toArray(results));
                    readEntries();
                }
            }, errorHandler);
        };

        readEntries(); // Start reading dirs.
    }
}


export {Store as default}