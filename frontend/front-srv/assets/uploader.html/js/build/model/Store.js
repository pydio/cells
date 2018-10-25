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
        _this._blacklist = [".ds_store", ".pydio"];
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
        key: 'log',
        value: function log() {}
    }, {
        key: 'processQueue',
        value: function processQueue() {
            var next = this.getNext();
            while (next !== null) {
                next.process(function () {
                    if (next.getStatus() === 'error') {
                        this._errors.push(next);
                    } else {
                        this._processed.push(next);
                    }
                    this.notify("update");
                }.bind(this));
                next = this.getNext();
            }
        }
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
            this.notify('update');
            _Task2.default.getInstance().setIdle();
        }
    }, {
        key: 'processNext',
        value: function processNext() {
            var _this3 = this;

            var processables = this.getNexts();
            if (processables.length) {
                processables.map(function (processable) {
                    _this3._processing.push(processable);
                    _Task2.default.getInstance().setRunning(_this3.getQueueSize());
                    processable.process(function () {
                        _this3._processing = _lang2.default.arrayWithout(_this3._processing, _this3._processing.indexOf(processable));
                        if (processable.getStatus() === 'error') {
                            _this3._errors.push(processable);
                        } else {
                            _this3._processed.push(processable);
                        }
                        _this3.processNext();
                        _this3.notify("update");
                    });
                });
            } else {
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
                errors: this._errors
            };
        }
    }, {
        key: 'hasErrors',
        value: function hasErrors() {
            return this._errors.length ? this._errors : false;
        }
    }, {
        key: 'handleFolderPickerResult',
        value: function handleFolderPickerResult(files, targetNode) {
            var folders = {};
            for (var i = 0; i < files.length; i++) {
                var relPath = null;
                if (files[i]['webkitRelativePath']) {
                    relPath = '/' + files[i]['webkitRelativePath'];
                    var folderPath = PathUtils.getDirname(relPath);
                    if (!folders[folderPath]) {
                        this.pushFolder(new _FolderItem2.default(folderPath, targetNode));
                        folders[folderPath] = true;
                    }
                }
                this.pushFile(new _UploadItem2.default(files[i], targetNode, relPath));
            }
        }
    }, {
        key: 'handleDropEventResults',
        value: function handleDropEventResults(items, files, targetNode) {
            var _this4 = this;

            var accumulator = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var filterFunction = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;


            var oThis = this;

            if (items && items.length && (items[0].getAsEntry || items[0].webkitGetAsEntry)) {
                var i;
                var entry;

                (function () {
                    var error = global.console ? global.console.log : function (err) {
                        global.alert(err);
                    };
                    var length = items.length;
                    for (i = 0; i < length; i++) {
                        if (items[i].kind && items[i].kind !== 'file') continue;
                        if (items[0].getAsEntry) {
                            entry = items[i].getAsEntry();
                        } else {
                            entry = items[i].webkitGetAsEntry();
                        }
                        if (entry.isFile) {
                            entry.file(function (File) {
                                if (File.size === 0) return;
                                var uploadItem = new _UploadItem2.default(File, targetNode);
                                if (filterFunction && !filterFunction(uploadItem)) return;
                                if (!accumulator) oThis.pushFile(uploadItem);else accumulator.push(uploadItem);
                            }, error);
                        } else if (entry.isDirectory) {
                            var folderItem = new _FolderItem2.default(entry.fullPath, targetNode);
                            if (filterFunction && !filterFunction(folderItem)) continue;
                            if (!accumulator) oThis.pushFolder(folderItem);else accumulator.push(folderItem);

                            _this4.recurseDirectory(entry, function (fileEntry) {
                                var relativePath = fileEntry.fullPath;
                                fileEntry.file(function (File) {
                                    if (File.size === 0) return;
                                    var uploadItem = new _UploadItem2.default(File, targetNode, relativePath);
                                    if (filterFunction && !filterFunction(uploadItem)) return;
                                    if (!accumulator) oThis.pushFile(uploadItem);else accumulator.push(uploadItem);
                                }, error);
                            }, function (folderEntry) {
                                var folderItem = new _FolderItem2.default(folderEntry.fullPath, targetNode);
                                if (filterFunction && !filterFunction(uploadItem)) return;
                                if (!accumulator) oThis.pushFolder(folderItem);else accumulator.push(folderItem);
                            }, error);
                        }
                    }
                })();
            } else {
                for (var j = 0; j < files.length; j++) {
                    if (files[j].size === 0) {
                        alert(_pydio2.default.getInstance().MessageHash['html_uploader.8']);
                        return;
                    }
                    var _uploadItem = new _UploadItem2.default(files[j], targetNode);
                    if (filterFunction && !filterFunction(_uploadItem)) continue;
                    if (!accumulator) oThis.pushFile(_uploadItem);else accumulator.push(_uploadItem);
                }
            }
            Store.getInstance().log();
        }
    }, {
        key: 'recurseDirectory',
        value: function recurseDirectory(item, fileHandler, folderHandler, errorHandler) {

            var recurseDir = this.recurseDirectory.bind(this);
            var dirReader = item.createReader();
            var entries = [];

            var toArray = function toArray(list) {
                return Array.prototype.slice.call(list || [], 0);
            };

            var readEntries = function readEntries() {
                dirReader.readEntries(function (results) {
                    if (!results.length) {

                        entries.map(function (e) {
                            if (e.isDirectory) {
                                folderHandler(e);
                                recurseDir(e, fileHandler, folderHandler, errorHandler);
                            } else {
                                fileHandler(e);
                            }
                        });
                    } else {
                        entries = entries.concat(toArray(results));
                        readEntries();
                    }
                }, errorHandler);
            };

            readEntries();
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
