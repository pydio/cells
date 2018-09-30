(function(global){

    const {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} = require('pydio/http/rest-api');

    class StatusItem extends Observable{
        constructor(type){
            super();
            this._status = 'new';
            this._type = type;
            this._id = Math.random();
            this._errorMessage = null;
        }
        getId(){
            return this._id;
        }
        getLabel(){

        }
        getType(){
            return this._type;
        }
        getStatus(){
            return this._status;
        }
        setStatus(status){
            this._status = status;
            this.notify('status');
        }
        updateRepositoryId(repositoryId){
            this._repositoryId = repositoryId;
        }
        getErrorMessage(){
            return this._errorMessage || '';
        }
        onError(errorMessage){
            this._errorMessage = errorMessage;
            this.setStatus('error');
        }
        process(completeCallback){
            this._doProcess(completeCallback);
        }
        abort(completeCallback){
            if(this._status !== 'loading') return;
            this._doAbort(completeCallback);
        }
    }

    class UploadItem extends StatusItem {

        constructor(file, targetNode, relativePath = null){
            super('file');
            this._file = file;
            this._status = 'new';
            this._progress = 0;
            this._targetNode = targetNode;
            this._repositoryId = global.pydio.user.activeRepository;
            this._relativePath = relativePath;
        }
        getFile(){
            return this._file;
        }
        getSize(){
            return this._file.size;
        }
        getLabel(){
            return this._relativePath ? this._relativePath : this._file.name;
        }
        getProgress(){
            return this._progress;
        }
        setProgress(newValue, bytes = null){
            this._progress = newValue;
            this.notify('progress', newValue);
            if(bytes !== null) {
                this.notify('bytes', bytes);
            }
        }
        getRelativePath(){
            return this._relativePath;
        }
        _parseXHRResponse(){
            if(!this.xhr) return;
            if (this.xhr.responseXML){
                var result = PydioApi.getClient().parseXmlMessage(this.xhr.responseXML);
                if(!result) this.onError('Empty response');
            }else if (this.xhr.responseText && this.xhr.responseText != 'OK') {
                this.onError('Unexpected response: ' + this.xhr.responseText);
            }
        }
        _doProcess(completeCallback){
            let complete = function(){
                this.setStatus('loaded');
                this._parseXHRResponse();
                completeCallback();
            }.bind(this);

            let progress = function(computableEvent){
                if (this._status === 'error') {
                    return;
                }
                let percentage = Math.round((computableEvent.loaded * 100) / computableEvent.total);
                let bytesLoaded = computableEvent.loaded;
                this.setProgress(percentage, bytesLoaded);
            }.bind(this);

            this.setStatus('loading');

            let maxUpload = parseFloat(UploaderConfigs.getInstance().getOption('UPLOAD_MAX_SIZE'));

            try{
                UploaderConfigs.getInstance().extensionAllowed(this);
            }catch(e){
                this.onError(e.message);
                completeCallback();
                return;
            }

            this.uploadPresigned(complete, progress, function(e){
                this.onError(global.pydio.MessageHash[210]+": " +e.message);
                completeCallback();
            }.bind(this));
        }

        _doAbort(completeCallback){
            if(this.xhr){
                try{
                    this.xhr.abort();
                }catch(e){}
            }
            this.setStatus('error');
        }

        file_newpath(fullpath) {
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

                let exists = await this._fileExists(newPath);
                while (exists) {
                    newPath = path + '-' + counter + ext;
                    counter++;
                    exists = await this._fileExists(newPath)
                }

                resolve(newPath);
            }.bind(this))
        }

        _fileExists(fullpath) {
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

        async uploadPresigned(completeCallback, progressCallback, errorCallback){

            const repoList = global.pydio.user.getRepositoriesList();
            if(!repoList.has(this._repositoryId)){
                errorCallback(new Error('Unauthorized workspace!'));
                return;
            }
            const slug = repoList.get(this._repositoryId).getSlug();

            let fullPath = this._targetNode.getPath();
            if(this._relativePath) {
                fullPath = LangUtils.trimRight(fullPath, '/') + '/' + LangUtils.trimLeft(PathUtils.getDirname(this._relativePath), '/');
            }
            fullPath = slug + '/' + LangUtils.trim(fullPath, '/');
            fullPath = LangUtils.trimRight(fullPath, '/') + '/' + PathUtils.getBasename(this._file.name);
            if (fullPath.normalize) {
                fullPath = fullPath.normalize('NFC');
            }

            // Checking file already exists or not
            let overwriteStatus = UploaderConfigs.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");

            if (overwriteStatus === 'rename') {
                fullPath = await this.file_newpath(fullPath)
            } else if (overwriteStatus === 'alert') {
                if (!global.confirm(global.pydio.MessageHash[124])) {
                    errorCallback(new Error(global.pydio.MessageHash[71]));
                    return;
                }
            }

            PydioApi.getClient().uploadPresigned(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(xhr => {
                this.xhr = xhr;
            });
        }
    }

    class FolderItem extends StatusItem{
        constructor(path, targetNode){
            super('folder');
            this._path = path;
            this._targetNode =  targetNode;
            this._repositoryId = global.pydio.user.activeRepository;
        }
        getPath(){
            return this._path;
        }
        getLabel(){
            return PathUtils.getBasename(this._path);
        }
        _doProcess(completeCallback) {
            const repoList = global.pydio.user.getRepositoriesList();
            if(!repoList.has(this._repositoryId)){
                this.setStatus('error');
                return;
            }
            const slug = repoList.get(this._repositoryId).getSlug();
            let fullPath = this._targetNode.getPath();
            fullPath = LangUtils.trimRight(fullPath, '/') + '/' + LangUtils.trimLeft(this._path, '/');
            if (fullPath.normalize) {
                fullPath = fullPath.normalize('NFC');
            }
            fullPath = "/" + slug + fullPath;

            const api = new TreeServiceApi(PydioApi.getRestClient());
            const request = new RestCreateNodesRequest();
            const node = new TreeNode();

            // We're not creating the folder as it will be handled by children files
            // NOTE : empty folders will not be created so we will need to figure out a way of creating only empty folders
            // Creating folder was causing a race concurrence issue on the server side
            // completeCallback();

            node.Path = fullPath;
            node.Type = TreeNodeType.constructFromObject('COLLECTION');
            request.Nodes = [node];
            api.createNodes(request).then(collection => {

                this.setStatus('loaded');

                completeCallback();
            });

        }
        _doAbort(completeCallback){
            if(global.console) global.console.log(global.pydio.MessageHash['html_uploader.6']);
        }
    }

    const {JobsJob, JobsTask, JobsTaskStatus} = require('pydio/http/rest-api');
    const {JobsStore} = Pydio.requireLib("boot");

    class UploadTask {

        constructor(){
            const {pydio} = global;
            this.job = new JobsJob();
            this.job.ID = 'local-upload-task';
            this.job.Owner = pydio.user.id;
            this.job.Label = pydio.MessageHash['html_uploader.7'];
            this.job.Stoppable = true;
            this.task = new JobsTask();
            this.job.Tasks = [this.task];
            this.task.HasProgress = true;
            this.task.ID = "upload";
            this.task.Status = JobsTaskStatus.constructFromObject('Idle');
            this.job.openDetailPane = () => {
                pydio.Controller.fireAction("upload");
            };
            JobsStore.getInstance().enqueueLocalJob(this.job);
        }

        setProgress(progress){
            this.task.Progress = progress;
            this.task.Status = JobsTaskStatus.constructFromObject('Running');
            this.notifyMainStore();
        }
        setPending(queueSize){
            this.task.StatusMessage = global.pydio.MessageHash['html_uploader.1'].replace('%s', queueSize);
            this.task.Status = JobsTaskStatus.constructFromObject('Idle');
            this.notifyMainStore();
        }
        setRunning(queueSize){
            this.task.Status = JobsTaskStatus.constructFromObject('Running');
            this.task.StatusMessage = global.pydio.MessageHash['html_uploader.2'].replace('%s', queueSize);
            this.notifyMainStore();
        }
        setIdle(){
            this.task.Status = JobsTaskStatus.constructFromObject('Idle');
            this.task.StatusMessage = '';
            this.notifyMainStore();
        }

        notifyMainStore(){
            this.task.startTime = (new Date).getTime() / 1000;
            this.job.Tasks = [this.task];
            JobsStore.getInstance().enqueueLocalJob(this.job);
        }

        static getInstance(){
            if(!UploadTask.__INSTANCE) {
                UploadTask.__INSTANCE = new UploadTask();
            }
            return UploadTask.__INSTANCE;
        }

    }

    class UploaderStore extends Observable{

        constructor(){
            super();
            this._folders = [];
            this._uploads = [];
            this._processing = [];
            this._processed = [];
            this._errors = [];
            // Todo
            this._queueCounter = 0;
            this._maxQueueSize = 2;

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
        getAutoStart(){
            return UploaderConfigs.getInstance().getOptionAsBool("DEFAULT_AUTO_START", "upload_auto_send");
        }
        getAutoClose(){
            return UploaderConfigs.getInstance().getOptionAsBool("DEFAULT_AUTO_CLOSE", "upload_auto_close");
        }
        pushFolder(folderItem){
            if(!this.getQueueSize()){
                this._processed = [];
            }
            this._folders.push(folderItem);
            UploadTask.getInstance().setPending(this.getQueueSize());
            if(this.getAutoStart() && !this._processing.length) {
                this.processNext();
            } // Autostart with queue was empty before
            this.notify('update');
            this.notify('item_added', folderItem);
        }
        pushFile(uploadItem){
            if(!this.getQueueSize()){
                this._processed = [];
            }

            const name = uploadItem.getFile().name.toLowerCase()

            const isBlacklisted = this._blacklist.reduce((current, val) => current || name == val, false)

            if (isBlacklisted) {
                this.processNext();
                return
            }

            this._uploads.push(uploadItem);
            UploadTask.getInstance().setPending(this.getQueueSize());
            uploadItem.observe("progress", function(){
                let pg = this.recomputeGlobalProgress();
                UploadTask.getInstance().setProgress(pg);
            }.bind(this));
            if(this.getAutoStart() && !this._processing.length) {
                this.processNext();
            } // Autostart with queue was empty before
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
            UploadTask.getInstance().setIdle();
        }
        processNext(){
            let processables = this.getNexts();
            if(processables.length){
                processables.map(processable => {
                    this._processing.push(processable);
                    UploadTask.getInstance().setRunning(this.getQueueSize());
                    processable.process(function(){
                        this._processing = LangUtils.arrayWithout(this._processing, this._processing.indexOf(processable));
                        if(processable.getStatus() === 'error') {
                            this._errors.push(processable)
                        } else {
                            this._processed.push(processable);
                        }
                        this.processNext();
                        this.notify("update");
                    }.bind(this));
                });
            }else{
                UploadTask.getInstance().setIdle();

                if(this.hasErrors()){
                    if(!pydio.getController().react_selector){
                        global.pydio.getController().fireAction("upload");
                    }
                }else if(this.getAutoClose()){
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
            console.log('Returning ' + items.length + ' items');
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
            if(!UploaderStore.__INSTANCE){
                UploaderStore.__INSTANCE = new UploaderStore();
            }
            return UploaderStore.__INSTANCE;
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
                    if(items[i].kind && items[i].kind != 'file') continue;
                    if(items[0].getAsEntry){
                        entry = items[i].getAsEntry();
                    }else{
                        entry = items[i].webkitGetAsEntry();
                    }
                    if (entry.isFile) {
                        entry.file(function(File) {
                            if(File.size == 0) return;
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
                                if(File.size == 0) return;
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
                        alert(global.pydio.MessageHash['html_uploader.8']);
                        return;
                    }
                    let uploadItem = new UploadItem(files[j], targetNode);
                    if(filterFunction && !filterFunction(uploadItem)) continue;
                    if(!accumulator) oThis.pushFile(uploadItem);
                    else accumulator.push(uploadItem);
                }
            }
            UploaderStore.getInstance().log();
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

    class UploaderConfigs extends Observable{

        static getInstance(){
            if(!UploaderConfigs.__INSTANCE) UploaderConfigs.__INSTANCE = new UploaderConfigs();
            return UploaderConfigs.__INSTANCE;
        }

        constructor(){
            super();
            pydio.observe("registry_loaded", function(){
                this._global = null;
                this._mq = null;
            }.bind(this));
        }

        _loadOptions(){
            if(!this._global){
                this._global = global.pydio.getPluginConfigs("uploader");
                this._mq = global.pydio.getPluginConfigs("mq");
            }
        }

        extensionAllowed(uploadItem){
            let extString = this.getOption("ALLOWED_EXTENSIONS", '', '');
            if(!extString) return true;
            let extDescription = this.getOption("ALLOWED_EXTENSIONS_READABLE", '', '');
            if(extDescription) extDescription = ' (' + extDescription + ')';
            let itemExt = PathUtils.getFileExtension(uploadItem.getLabel());
            if(extString.split(',').indexOf(itemExt) === -1){
                throw new Error(global.pydio.MessageHash[367] + extString + extDescription);
            }
        }

        getOptionAsBool(name, userPref = '', defaultValue = undefined){
            let o = this.getOption(name, userPref, defaultValue);
            return (o === true  || o === 'true');
        }

        getOption(name, userPref = '', defaultValue = undefined){
            this._loadOptions();
            if(userPref){
                let test = this.getUserPreference('originalUploadForm_XHRUploader', userPref);
                if(test !== undefined && test !== null) return test;
            }
            if(this._global.has(name)){
                return this._global.get(name);
            }
            if(this._mq.has(name)){
                return this._mq.get(name);
            }
            if(defaultValue !== undefined){
                return defaultValue;
            }
            return null;
        }

        updateOption(name, value, isBool = false){
            if(isBool){
                value = value? "true" : "false";
            }
            this.setUserPreference('originalUploadForm_XHRUploader', name, value);
            this.notify("change");
        }


        // TODO: SHOULD BE IN A "CORE" COMPONENT
        getUserPreference(guiElementId, prefName){
            let pydio = global.pydio;
            if(!pydio.user) return null;
            var gui_pref = pydio.user.getPreference("gui_preferences", true);
            if(!gui_pref || !gui_pref[guiElementId]) return null;
            if(pydio.user.activeRepository && gui_pref[guiElementId]['repo-'+pydio.user.activeRepository]){
                return gui_pref[guiElementId]['repo-'+pydio.user.activeRepository][prefName];
            }
            return gui_pref[guiElementId][prefName];
        }

        setUserPreference(guiElementId, prefName, prefValue){
            let pydio = global.pydio;
            if(!pydio || !pydio.user) return;
            var guiPref = pydio.user.getPreference("gui_preferences", true);
            if(!guiPref) guiPref = {};
            if(!guiPref[guiElementId]) guiPref[guiElementId] = {};
            if(pydio.user.activeRepository ){
                var repokey = 'repo-'+pydio.user.activeRepository;
                if(!guiPref[guiElementId][repokey]) guiPref[guiElementId][repokey] = {};
                if(guiPref[guiElementId][repokey][prefName] && guiPref[guiElementId][repokey][prefName] == prefValue){
                    return;
                }
                guiPref[guiElementId][repokey][prefName] = prefValue;
            }else{
                if(guiPref[guiElementId][prefName] && guiPref[guiElementId][prefName] == prefValue){
                    return;
                }
                guiPref[guiElementId][prefName] = prefValue;
            }
            pydio.user.setPreference("gui_preferences", guiPref, true);
            pydio.user.savePreference("gui_preferences");
        }
    }

    var ns = global.UploaderModel || {};
    ns.Store = UploaderStore;
    ns.Configs = UploaderConfigs;
    ns.UploadItem = UploadItem;
    ns.FolderItem = FolderItem;
    global.UploaderModel = ns;

})(window);
