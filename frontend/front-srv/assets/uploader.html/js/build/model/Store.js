'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _lang = require('pydio/util/lang');

var _lang2 = _interopRequireDefault(_lang);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _observable = require('pydio/lang/observable');

var _observable2 = _interopRequireDefault(_observable);

var _Task = require('./Task');

var _Task2 = _interopRequireDefault(_Task);

var _Configs = require('./Configs');

var _Configs2 = _interopRequireDefault(_Configs);

var _StatusItem = require('./StatusItem');

var _StatusItem2 = _interopRequireDefault(_StatusItem);

var _UploadItem = require('./UploadItem');

var _UploadItem2 = _interopRequireDefault(_UploadItem);

var _FolderItem = require('./FolderItem');

var _FolderItem2 = _interopRequireDefault(_FolderItem);

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

var _lodash = require('lodash');

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _cellsSdk = require('cells-sdk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Store = function (_Observable) {
    _inherits(Store, _Observable);

    function Store() {
        _classCallCheck(this, Store);

        var _this = _possibleConstructorReturn(this, (Store.__proto__ || Object.getPrototypeOf(Store)).call(this));

        _this._processing = [];
        _this._sessions = [];
        _this._blacklist = [".ds_store", ".pydio"];

        _this._pauseRequired = false;
        return _this;
    }

    _createClass(Store, [{
        key: 'getAutoStart',
        value: function getAutoStart() {
            return _Configs2.default.getInstance().getAutoStart();
        }
    }, {
        key: 'pushSession',
        value: function pushSession(session) {
            var _this2 = this;

            this._sessions.push(session);
            session.Task = _Task2.default.create(session);
            session.observe('update', function () {
                _this2.notify('update');
            });
            session.observe('children', function () {
                if (session.getChildren().length === 0) {
                    _this2.removeSession(session);
                }
                _this2.notify('update');
            });
            this.notify('update');
            session.observe('status', function (s) {
                if (s === 'ready') {
                    var autoStart = _this2.getAutoStart();
                    if (autoStart && !_this2._processing.length && !_this2._pauseRequired) {
                        _this2.processNext();
                    } else if (!autoStart) {
                        Store.openUploadDialog();
                    }
                } else if (s === 'confirm') {
                    Store.openUploadDialog(true);
                }
            });
            this.notify('session_added', session);
        }
    }, {
        key: 'removeSession',
        value: function removeSession(session) {
            session.Task.setIdle();
            var i = this._sessions.indexOf(session);
            this._sessions = _lang2.default.arrayWithout(this._sessions, i);
            this.notify('update');
        }
    }, {
        key: 'log',
        value: function log() {}
    }, {
        key: 'hasQueue',
        value: function hasQueue() {
            var items = 0;
            this._sessions.forEach(function (session) {
                session.walk(function () {
                    items++;
                }, function (item) {
                    return item.getStatus() === _StatusItem2.default.StatusNew || item.getStatus() === _StatusItem2.default.StatusPause || item.getStatus() === _StatusItem2.default.StatusMultiPause;
                }, 'both', function () {
                    return items >= 1;
                });
            });
            return items > 0;
        }
    }, {
        key: 'hasErrors',
        value: function hasErrors() {
            var items = 0;
            this._sessions.forEach(function (session) {
                session.walk(function () {
                    items++;
                }, function (item) {
                    return item.getStatus() === 'error';
                }, 'both', function () {
                    return items >= 1;
                });
            });
            return items > 0;
        }
    }, {
        key: 'clearAll',
        value: function clearAll() {
            var _this3 = this;

            this.clearStatus('new');
            this._sessions.forEach(function (session) {
                session.walk(function (item) {
                    item.getParent().removeChild(item);
                });
                session.Task.setIdle();
                _this3.removeSession(session);
            });
            this._pauseRequired = false;
            this.notify('update');
        }
    }, {
        key: 'clearStatus',
        value: function clearStatus(status) {
            this._sessions.forEach(function (session) {
                session.walk(function (item) {
                    item.getParent().removeChild(item);
                }, function (item) {
                    return item.getStatus() === status;
                }, 'file');
            });
        }
    }, {
        key: 'monitorProcessing',
        value: function monitorProcessing(item) {
            var _this4 = this;

            if (!this._processingMonitor) {
                this._processingMonitor = function () {
                    _this4.notify('update');
                };
            }
            item.observe('status', this._processingMonitor);
            this._processing.push(item);
        }
    }, {
        key: 'unmonitorProcessing',
        value: function unmonitorProcessing(item) {
            var index = this._processing.indexOf(item);
            if (index > -1) {
                if (this._processingMonitor) {
                    item.stopObserving('status', this._processingMonitor);
                }
                this._processing = _lang2.default.arrayWithout(this._processing, index);
            }
        }
    }, {
        key: 'processNext',
        value: function processNext() {
            var _this5 = this;

            var folders = this.getFolders();
            if (folders.length && !this._pauseRequired) {
                var api = new _cellsSdk.TreeServiceApi(_api2.default.getRestClient());
                var request = new _cellsSdk.RestCreateNodesRequest();
                request.Nodes = [];
                folders.forEach(function (folderItem) {
                    var node = new _cellsSdk.TreeNode();
                    node.Path = folderItem.getFullPath();
                    node.Type = _cellsSdk.TreeNodeType.constructFromObject('COLLECTION');
                    request.Nodes.push(node);
                    folderItem.setStatus(_StatusItem2.default.StatusLoading);
                    _this5.monitorProcessing(folderItem);
                });
                this.notify('update');
                api.createNodes(request).then(function () {
                    folders.forEach(function (folderItem) {
                        folderItem.setStatus(_StatusItem2.default.StatusLoaded);
                        folderItem.children.pg[folderItem.getId()] = 100;
                        folderItem.recomputeProgress();
                        _this5.unmonitorProcessing(folderItem);
                    });
                    _this5.processNext();
                    _this5.notify("update");
                }).catch(function (e) {
                    _this5.processNext();
                    _this5.notify("update");
                });
                return;
            }
            var processables = this.getNexts();
            if (processables.length && !this._pauseRequired) {
                processables.forEach(function (processable) {
                    _this5.monitorProcessing(processable);
                    processable.process(function () {
                        _this5.unmonitorProcessing(processable);
                        _this5.processNext();
                        _this5.notify("update");
                    });
                });
                this.notify('update');
            } else {
                if (this.hasErrors()) {
                    Store.openUploadDialog();
                } else if (_Configs2.default.getInstance().getAutoClose() && !this._pauseRequired) {
                    this.notify("auto_close");
                }
                this.notify('update');
            }
        }
    }, {
        key: 'getFolders',
        value: function getFolders() {
            var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 60;

            var folders = [];
            this._sessions.forEach(function (session) {
                session.walk(function (item) {
                    folders.push(item);
                }, function (item) {
                    return item.getStatus() === 'new';
                }, 'folder', function () {
                    return folders.length >= max;
                });
            });
            return folders;
        }
    }, {
        key: 'getNexts',
        value: function getNexts() {
            var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;

            var folders = [];
            this._sessions.forEach(function (session) {
                session.walk(function (item) {
                    folders.push(item);
                }, function (item) {
                    return item.getStatus() === 'new';
                }, 'folder', function () {
                    return folders.length >= 1;
                });
            });
            if (folders.length) {
                return [folders.shift()];
            }
            var items = [];
            var processing = this._processing.length;
            this._sessions.forEach(function (session) {
                var sessItems = 0;
                session.walk(function (item) {
                    items.push(item);
                    sessItems++;
                }, function (item) {
                    return item.getStatus() === 'new' || item.getStatus() === 'pause';
                }, 'file', function () {
                    return items.length >= max - processing;
                });
                if (sessItems === 0) {
                    session.Task.setIdle();
                }
            });
            return items;
        }
    }, {
        key: 'stopOrRemoveItem',
        value: function stopOrRemoveItem(item) {
            item.abort();
            this.unmonitorProcessing(item);
            this.notify("update");
        }
    }, {
        key: 'getSessions',
        value: function getSessions() {
            return this._sessions;
        }
    }, {
        key: 'isRunning',
        value: function isRunning() {
            return this._processing.filter(function (u) {
                return u.getStatus() === _StatusItem2.default.StatusLoading;
            }).length > 0;
        }
    }, {
        key: 'pause',
        value: function pause() {
            this._pauseRequired = true;
            this._processing.forEach(function (u) {
                return u.pause();
            });
            this.notify('update');
        }
    }, {
        key: 'resume',
        value: function resume() {
            this._pauseRequired = false;
            this._sessions.forEach(function (s) {
                return s.setStatus('ready');
            });
            this._processing.forEach(function (u) {
                return u.resume();
            });
            this.notify('update');
            this.processNext();
        }
    }, {
        key: 'handleFolderPickerResult',
        value: function handleFolderPickerResult(files, targetNode) {
            var _this6 = this;

            var overwriteStatus = _Configs2.default.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");
            var session = new _Session2.default(_pydio2.default.getInstance().user.activeRepository, targetNode);
            this.pushSession(session);

            var mPaths = {};
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var mPath = '/' + _path2.default.getBasename(file.name);
                if (files[i]['webkitRelativePath']) {
                    mPath = '/' + files[i]['webkitRelativePath'];
                    var folderPath = _path2.default.getDirname(mPath);

                    if (folderPath !== '/') {
                        mPaths[_path2.default.getDirname(folderPath)] = 'FOLDER';
                    }
                    mPaths[folderPath] = 'FOLDER';
                }
                mPaths[mPath] = file;
            }
            var tree = session.treeViewFromMaterialPath(mPaths);
            var recurse = function recurse(children, parentItem) {
                children.forEach(function (child) {
                    if (child.item === 'FOLDER') {
                        var f = new _FolderItem2.default(child.path, targetNode, parentItem);
                        recurse(child.children, f);
                    } else {
                        if (_this6._blacklist.indexOf(_path2.default.getBasename(child.path).toLowerCase()) === -1) {
                            var u = new _UploadItem2.default(child.item, targetNode, child.path, parentItem);
                        }
                    }
                });
            };
            recurse(tree, session);
            session.prepare(overwriteStatus).catch(function (e) {});
        }
    }, {
        key: 'handleDropEventResults',
        value: function handleDropEventResults(items, files, targetNode) {
            var accumulator = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            var _this7 = this;

            var filterFunction = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
            var targetRepositoryId = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;


            var overwriteStatus = _Configs2.default.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");
            var session = new _Session2.default(targetRepositoryId || _pydio2.default.getInstance().user.activeRepository, targetNode);
            this.pushSession(session);
            var filter = function filter(refPath) {
                if (filterFunction && !filterFunction(refPath)) {
                    return false;
                }
                return _this7._blacklist.indexOf(_path2.default.getBasename(refPath).toLowerCase()) === -1;
            };

            var enqueue = function enqueue(item) {
                var isFolder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                if (filterFunction && !filterFunction(item)) {
                    return;
                }
                if (accumulator) {
                    accumulator.push(item);
                } else if (isFolder) {
                    session.pushFolder(item);
                } else {
                    session.pushFile(item);
                }
            };

            if (items && items.length && (items[0].getAsEntry || items[0].webkitGetAsEntry)) {
                (function () {
                    var error = global.console ? global.console.log : function (err) {
                        global.alert(err);
                    };
                    var length = items.length;
                    var promises = [];

                    var _loop = function _loop(i) {
                        var entry = void 0;
                        if (items[i].kind && items[i].kind !== 'file') {
                            return 'continue';
                        }
                        if (items[0].getAsEntry) {
                            entry = items[i].getAsEntry();
                        } else {
                            entry = items[i].webkitGetAsEntry();
                        }

                        if (entry.isFile) {

                            promises.push(new Promise(function (resolve, reject) {
                                entry.file(function (File) {
                                    var u = void 0;
                                    if (File.size > 0 && filter(File.name)) {
                                        u = new _UploadItem2.default(File, targetNode, null, session);
                                    }
                                    resolve(u);
                                }, function () {
                                    reject();error();
                                });
                            }));
                        } else if (entry.isDirectory) {

                            entry.folderItem = new _FolderItem2.default(entry.fullPath, targetNode, session);

                            promises.push(_this7.recurseDirectory(entry, function (fileEntry) {
                                var relativePath = fileEntry.fullPath;
                                return new Promise(function (resolve, reject) {
                                    fileEntry.file(function (File) {
                                        var uItem = void 0;
                                        if (File.size > 0 && filter(File.name)) {
                                            uItem = new _UploadItem2.default(File, targetNode, relativePath, fileEntry.parentItem);
                                        }
                                        resolve(uItem);
                                    }, function (e) {
                                        reject(e);error();
                                    });
                                });
                            }, function (folderEntry) {
                                if (filter(folderEntry.fullPath)) {
                                    folderEntry.folderItem = new _FolderItem2.default(folderEntry.fullPath, targetNode, folderEntry.parentItem);
                                }
                                return Promise.resolve(folderEntry.folderItem);
                            }, error));
                        }
                    };

                    for (var i = 0; i < length; i++) {
                        var _ret2 = _loop(i);

                        if (_ret2 === 'continue') continue;
                    }

                    Promise.all(promises).then(function () {
                        return session.prepare(overwriteStatus).then(function () {
                            _this7.notify('update');
                        });
                    }).catch(function (e) {
                        _this7.notify('update');
                    });
                })();
            } else {
                for (var j = 0; j < files.length; j++) {
                    if (files[j].size === 0) {
                        alert(_pydio2.default.getInstance().MessageHash['html_uploader.no-folders-support']);
                        return;
                    }
                    if (!filter(files[j].name)) {
                        return;
                    }
                    new _UploadItem2.default(files[j], targetNode, null, session);
                }
                session.prepare(overwriteStatus).then(function () {
                    _this7.notify('update');
                }).catch(function (e) {
                    _this7.notify('update');
                });
            }
        }
    }, {
        key: 'recurseDirectory',
        value: function recurseDirectory(item, promiseFile, promiseFolder, errorHandler) {
            var _this8 = this;

            return new Promise(function (resolve) {
                _this8.dirEntries(item).then(function (entries) {
                    var promises = [];
                    entries.forEach(function (entry) {
                        if (entry.parent && entry.parent.folderItem) {
                            entry.parentItem = entry.parent.folderItem;
                        }
                        if (entry.isDirectory) {
                            promises.push(promiseFolder(entry));
                        } else {
                            promises.push(promiseFile(entry));
                        }
                    });
                    Promise.all(promises).then(function () {
                        resolve();
                    });
                });
            });
        }
    }, {
        key: 'dirEntries',
        value: function dirEntries(item) {
            var _this9 = this;

            var reader = item.createReader();
            var entries = [];
            var toArray = function toArray(list) {
                return Array.prototype.slice.call(list || [], 0);
            };
            return new Promise(function (resolve, reject) {
                var next = function next() {
                    reader.readEntries(function (results) {
                        if (results.length) {
                            entries = entries.concat(toArray(results));
                            next();
                        } else {
                            var promises = [];
                            entries.forEach(function (entry) {
                                entry.parent = item;
                                if (entry.isDirectory) {
                                    promises.push(_this9.dirEntries(entry).then(function (children) {
                                        entries = entries.concat(children);
                                    }));
                                }
                            });
                            if (promises.length) {
                                Promise.all(promises).then(function () {
                                    resolve(entries);
                                });
                            } else {
                                resolve(entries);
                            }
                        }
                    }, function (e) {
                        reject(e);
                    });
                };
                next();
            });
        }
    }], [{
        key: 'openUploadDialog',
        value: function openUploadDialog() {
            var confirm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (confirm) {
                _pydio2.default.getInstance().getController().fireAction("upload", { confirmDialog: true });
            } else {
                _pydio2.default.getInstance().getController().fireAction("upload");
            }
        }
    }, {
        key: 'getInstance',
        value: function getInstance() {
            if (!Store.__INSTANCE) {
                Store.__INSTANCE = new Store();
            }
            return Store.__INSTANCE;
        }
    }]);

    return Store;
}(_observable2.default);

exports.default = Store;
