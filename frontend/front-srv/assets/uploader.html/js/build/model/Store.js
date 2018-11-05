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

var _UploadItem = require('./UploadItem');

var _UploadItem2 = _interopRequireDefault(_UploadItem);

var _FolderItem = require('./FolderItem');

var _FolderItem2 = _interopRequireDefault(_FolderItem);

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Store = function (_Observable) {
    _inherits(Store, _Observable);

    function Store() {
        _classCallCheck(this, Store);

        var _this = _possibleConstructorReturn(this, (Store.__proto__ || Object.getPrototypeOf(Store)).call(this));

        _this._folders = [];
        _this._uploads = [];
        _this._processing = [];
        _this._processed = [];
        _this._errors = [];
        _this._sessions = [];
        _this._blacklist = [".ds_store", ".pydio"];
        _this._pause = true;
        return _this;
    }

    _createClass(Store, [{
        key: 'recomputeGlobalProgress',
        value: function recomputeGlobalProgress() {
            var totalCount = 0;
            var totalProgress = 0;
            this._uploads.concat(this._processing).concat(this._processed).forEach(function (item) {
                if (!item.getProgress) {
                    return;
                }
                totalCount += item.getSize();
                totalProgress += item.getProgress() * item.getSize() / 100;
            });
            var progress = void 0;
            if (totalCount) {
                progress = totalProgress / totalCount;
            } else {
                progress = 0;
            }
            return progress;
        }
    }, {
        key: 'getAutoStart',
        value: function getAutoStart() {
            return _Configs2.default.getInstance().getAutoStart();
        }
    }, {
        key: 'pushFolder',
        value: function pushFolder(folderItem) {
            if (!this.getQueueSize()) {
                this._processed = [];
                this._pause = true;
            }
            this._folders.push(folderItem);
            _Task2.default.getInstance().setPending(this.getQueueSize());
            if (_Configs2.default.getInstance().getAutoStart() && !this._processing.length) {
                this.processNext();
            }
            this.notify('update');
            this.notify('item_added', folderItem);
        }
    }, {
        key: 'pushFile',
        value: function pushFile(uploadItem) {
            var _this2 = this;

            if (!this.getQueueSize()) {
                this._processed = [];
                this._pause = true;
            }

            var name = uploadItem.getFile().name.toLowerCase();
            var isBlacklisted = name.length >= 1 && name[0] === ".";
            if (isBlacklisted) {
                return;
            }

            this._uploads.push(uploadItem);
            _Task2.default.getInstance().setPending(this.getQueueSize());
            uploadItem.observe("progress", function () {
                var pg = _this2.recomputeGlobalProgress();
                _Task2.default.getInstance().setProgress(pg);
            });
            if (_Configs2.default.getInstance().getAutoStart() && !this._processing.length) {
                this.processNext();
            }
            this.notify('update');
            this.notify('item_added', uploadItem);
        }
    }, {
        key: 'pushSession',
        value: function pushSession(session) {
            var _this3 = this;

            _Task2.default.getInstance().setSessionPending(session);
            this._sessions.push(session);
            this.notify('update');
            session.observe('update', function () {
                if (!session.pending) {
                    _this3._sessions = _this3._sessions.filter(function (s) {
                        return s !== session;
                    });
                }
                _this3.notify('update');
            });
        }
    }, {
        key: 'log',
        value: function log() {}
    }, {
        key: 'getQueueSize',
        value: function getQueueSize() {
            return this._folders.length + this._uploads.length + this._processing.length;
        }
    }, {
        key: 'clearAll',
        value: function clearAll() {
            this._folders = [];
            this._uploads = [];
            this._processing = [];
            this._processed = [];
            this._errors = [];
            this._sessions = [];
            this._pause = false;
            this.notify('update');
            _Task2.default.getInstance().setIdle();
        }
    }, {
        key: 'processNext',
        value: function processNext() {
            var _this4 = this;

            var processables = this.getNexts();
            if (processables.length) {
                processables.map(function (processable) {
                    _this4._processing.push(processable);
                    _Task2.default.getInstance().setRunning(_this4.getQueueSize());
                    processable.process(function () {
                        _this4._processing = _lang2.default.arrayWithout(_this4._processing, _this4._processing.indexOf(processable));
                        if (processable.getStatus() === 'error') {
                            _this4._errors.push(processable);
                        } else {
                            _this4._processed.push(processable);
                        }
                        if (!_this4._pause) {
                            _this4.processNext();
                        }
                        _this4.notify("update");
                    });
                });
            } else {
                this._pause = false;
                _Task2.default.getInstance().setIdle();

                if (this.hasErrors()) {
                    if (!pydio.getController().react_selector) {
                        _pydio2.default.getInstance().getController().fireAction("upload");
                    }
                } else if (_Configs2.default.getInstance().getAutoClose()) {
                    this.notify("auto_close");
                }
            }
        }
    }, {
        key: 'getNexts',
        value: function getNexts() {
            var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;

            if (this._pause) {
                return [];
            }
            if (this._folders.length) {
                return [this._folders.shift()];
            }
            var items = [];
            var processing = this._processing.length;
            for (var i = 0; i < max - processing; i++) {
                if (this._uploads.length) {
                    items.push(this._uploads.shift());
                }
            }
            return items;
        }
    }, {
        key: 'stopOrRemoveItem',
        value: function stopOrRemoveItem(item) {
            item.abort();
            ['_uploads', '_folders', '_processing', '_processed', '_errors'].forEach(function (key) {
                var arr = this[key];
                if (arr.indexOf(item) !== -1) {
                    this[key] = _lang2.default.arrayWithout(arr, arr.indexOf(item));
                }
            }.bind(this));
            this.notify("update");
        }
    }, {
        key: 'getItems',
        value: function getItems() {
            return {
                processing: this._processing,
                pending: this._folders.concat(this._uploads),
                processed: this._processed,
                errors: this._errors,
                sessions: this._sessions
            };
        }
    }, {
        key: 'hasErrors',
        value: function hasErrors() {
            return this._errors.length ? this._errors : false;
        }
    }, {
        key: 'isPaused',
        value: function isPaused() {
            return this._pause && this.getQueueSize() > 0;
        }
    }, {
        key: 'pause',
        value: function pause() {
            this._pause = true;
            this.notify('update');
        }
    }, {
        key: 'resume',
        value: function resume() {
            this._pause = false;
            this.notify('update');
            this.processNext();
        }
    }, {
        key: 'handleFolderPickerResult',
        value: function handleFolderPickerResult(files, targetNode) {
            var _this5 = this;

            var session = new _Session2.default();
            this.pushSession(session);

            var folders = {};
            for (var i = 0; i < files.length; i++) {
                var relPath = null;
                if (files[i]['webkitRelativePath']) {
                    relPath = '/' + files[i]['webkitRelativePath'];
                    var folderPath = _path2.default.getDirname(relPath);
                    if (!folders[folderPath]) {
                        session.pushFolder(new _FolderItem2.default(folderPath, targetNode));
                        folders[folderPath] = true;
                    }
                }
                session.pushFile(new _UploadItem2.default(files[i], targetNode, relPath));
            }
            session.computeStatuses().then(function () {
                Object.keys(session.folders).forEach(function (k) {
                    _this5.pushFolder(session.folders[k]);
                });
                Object.keys(session.files).forEach(function (k) {
                    _this5.pushFile(session.files[k]);
                });
            }).catch(function (e) {});
        }
    }, {
        key: 'handleDropEventResults',
        value: function handleDropEventResults(items, files, targetNode) {
            var _this6 = this;

            var accumulator = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var filterFunction = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;


            var session = new _Session2.default();
            this.pushSession(session);

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
                                    if (File.size > 0) {
                                        enqueue(new _UploadItem2.default(File, targetNode));
                                    }
                                    resolve();
                                }, function () {
                                    reject();error();
                                });
                            }));
                        } else if (entry.isDirectory) {

                            enqueue(new _FolderItem2.default(entry.fullPath, targetNode), true);

                            promises.push(_this6.recurseDirectory(entry, function (fileEntry) {
                                var relativePath = fileEntry.fullPath;
                                return new Promise(function (resolve, reject) {
                                    fileEntry.file(function (File) {
                                        if (File.size > 0) {
                                            enqueue(new _UploadItem2.default(File, targetNode, relativePath));
                                        }
                                        resolve();
                                    }, function (e) {
                                        reject(e);error();
                                    });
                                });
                            }, function (folderEntry) {
                                return Promise.resolve(enqueue(new _FolderItem2.default(folderEntry.fullPath, targetNode), true));
                            }, error));
                        }
                    };

                    for (var i = 0; i < length; i++) {
                        var _ret2 = _loop(i);

                        if (_ret2 === 'continue') continue;
                    }

                    Promise.all(promises).then(function () {
                        return session.computeStatuses();
                    }).then(function () {
                        Object.keys(session.folders).forEach(function (k) {
                            _this6.pushFolder(session.folders[k]);
                        });
                        Object.keys(session.files).forEach(function (k) {
                            _this6.pushFile(session.files[k]);
                        });
                    }).catch(function (e) {});
                })();
            } else {
                for (var j = 0; j < files.length; j++) {
                    if (files[j].size === 0) {
                        alert(_pydio2.default.getInstance().MessageHash['html_uploader.8']);
                        return;
                    }
                    enqueue(new _UploadItem2.default(files[j], targetNode));
                }
                session.computeStatuses().then(function () {
                    Object.keys(session.folders).forEach(function (k) {
                        _this6.pushFolder(session.folders[k]);
                    });
                    Object.keys(session.files).forEach(function (k) {
                        _this6.pushFile(session.files[k]);
                    });
                }).catch(function (e) {});
            }
        }
    }, {
        key: 'recurseDirectory',
        value: function recurseDirectory(item, promiseFile, promiseFolder, errorHandler) {
            var _this7 = this;

            return new Promise(function (resolve) {
                _this7.dirEntries(item).then(function (entries) {
                    var promises = [];
                    entries.forEach(function (entry) {
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
            var _this8 = this;

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
                                if (entry.isDirectory) {
                                    promises.push(_this8.dirEntries(entry).then(function (children) {
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
