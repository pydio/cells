(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.UploaderModel = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _observable = require('pydio/lang/observable');

var _observable2 = _interopRequireDefault(_observable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Configs = function (_Observable) {
    _inherits(Configs, _Observable);

    _createClass(Configs, null, [{
        key: 'getInstance',
        value: function getInstance() {
            if (!Configs.__INSTANCE) {
                Configs.__INSTANCE = new Configs();
            }
            return Configs.__INSTANCE;
        }
    }]);

    function Configs() {
        _classCallCheck(this, Configs);

        var _this = _possibleConstructorReturn(this, (Configs.__proto__ || Object.getPrototypeOf(Configs)).call(this));

        _pydio2.default.getInstance().observe("registry_loaded", function () {
            this._global = null;
        }.bind(_this));
        return _this;
    }

    _createClass(Configs, [{
        key: '_loadOptions',
        value: function _loadOptions() {
            if (!this._global) {
                this._global = _pydio2.default.getInstance().getPluginConfigs("uploader");
            }
        }
    }, {
        key: 'getOptionAsBool',
        value: function getOptionAsBool(name) {
            var userPref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
            var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

            var o = this.getOption(name, userPref, defaultValue);
            return o === true || o === 'true';
        }
    }, {
        key: 'getOption',
        value: function getOption(name) {
            var userPref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
            var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

            this._loadOptions();
            if (userPref) {
                var test = Configs.getUserPreference('originalUploadForm_XHRUploader', userPref);
                if (test !== undefined && test !== null) {
                    return test;
                }
            }
            if (this._global.has(name)) {
                return this._global.get(name);
            }
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            return null;
        }
    }, {
        key: 'getAutoStart',
        value: function getAutoStart() {
            return this.getOptionAsBool("DEFAULT_AUTO_START", "upload_auto_send");
        }
    }, {
        key: 'getAutoClose',
        value: function getAutoClose() {
            return this.getOptionAsBool("DEFAULT_AUTO_CLOSE", "upload_auto_close");
        }
    }, {
        key: 'updateOption',
        value: function updateOption(name, value) {
            var isBool = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (isBool) {
                value = value ? "true" : "false";
            }
            Configs.setUserPreference('originalUploadForm_XHRUploader', name, value);
            this.notify("change");
        }
    }, {
        key: 'extensionAllowed',
        value: function extensionAllowed(uploadItem) {
            var extString = this.getOption("ALLOWED_EXTENSIONS", '', '');
            if (!extString) {
                return;
            }
            var extDescription = this.getOption("ALLOWED_EXTENSIONS_READABLE", '', '');
            if (extDescription) {
                extDescription = ' (' + extDescription + ')';
            }
            var itemExt = _path2.default.getFileExtension(uploadItem.getLabel());
            if (extString.split(',').indexOf(itemExt) === -1) {
                throw new Error(_pydio2.default.getInstance().MessageHash[367] + extString + extDescription);
            }
        }
    }], [{
        key: 'getUserPreference',
        value: function getUserPreference(guiElementId, prefName) {
            var pydio = _pydio2.default.getInstance();
            if (!pydio.user) {
                return null;
            }
            var gui_pref = pydio.user.getPreference("gui_preferences", true);
            if (!gui_pref || !gui_pref[guiElementId]) {
                return null;
            }
            if (pydio.user.activeRepository && gui_pref[guiElementId]['repo-' + pydio.user.activeRepository]) {
                return gui_pref[guiElementId]['repo-' + pydio.user.activeRepository][prefName];
            }
            return gui_pref[guiElementId][prefName];
        }
    }, {
        key: 'setUserPreference',
        value: function setUserPreference(guiElementId, prefName, prefValue) {
            var pydio = _pydio2.default.getInstance();
            if (!pydio || !pydio.user) {
                return;
            }
            var guiPref = pydio.user.getPreference("gui_preferences", true);
            if (!guiPref) {
                guiPref = {};
            }
            if (!guiPref[guiElementId]) {
                guiPref[guiElementId] = {};
            }
            if (pydio.user.activeRepository) {
                var repokey = 'repo-' + pydio.user.activeRepository;
                if (!guiPref[guiElementId][repokey]) {
                    guiPref[guiElementId][repokey] = {};
                }
                if (guiPref[guiElementId][repokey][prefName] && guiPref[guiElementId][repokey][prefName] === prefValue) {
                    return;
                }
                guiPref[guiElementId][repokey][prefName] = prefValue;
            } else {
                if (guiPref[guiElementId][prefName] && guiPref[guiElementId][prefName] === prefValue) {
                    return;
                }
                guiPref[guiElementId][prefName] = prefValue;
            }
            pydio.user.setPreference("gui_preferences", guiPref, true);
            pydio.user.savePreference("gui_preferences");
        }
    }]);

    return Configs;
}(_observable2.default);

exports.default = Configs;

},{"pydio":"pydio","pydio/lang/observable":"pydio/lang/observable","pydio/util/path":"pydio/util/path"}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StatusItem2 = require('./StatusItem');

var _StatusItem3 = _interopRequireDefault(_StatusItem2);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _lang = require('pydio/util/lang');

var _lang2 = _interopRequireDefault(_lang);

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _restApi = require('pydio/http/rest-api');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FolderItem = function (_StatusItem) {
    _inherits(FolderItem, _StatusItem);

    function FolderItem(path, targetNode) {
        _classCallCheck(this, FolderItem);

        var _this = _possibleConstructorReturn(this, (FolderItem.__proto__ || Object.getPrototypeOf(FolderItem)).call(this, 'folder'));

        _this._new = true;
        _this._path = path;
        _this._targetNode = targetNode;
        var pydio = _pydio2.default.getInstance();
        _this._repositoryId = pydio.user.activeRepository;
        return _this;
    }

    _createClass(FolderItem, [{
        key: 'isNew',
        value: function isNew() {
            return this._new;
        }
    }, {
        key: 'getPath',
        value: function getPath() {
            return this._path;
        }
    }, {
        key: 'getLabel',
        value: function getLabel() {
            return _path2.default.getBasename(this._path);
        }
    }, {
        key: '_doProcess',
        value: function _doProcess(completeCallback) {
            var _this2 = this;

            var pydio = _pydio2.default.getInstance();

            var repoList = pydio.user.getRepositoriesList();
            if (!repoList.has(this._repositoryId)) {
                this.setStatus('error');
                return;
            }
            var slug = repoList.get(this._repositoryId).getSlug();
            var fullPath = this._targetNode.getPath();
            fullPath = _lang2.default.trimRight(fullPath, '/') + '/' + _lang2.default.trimLeft(this._path, '/');
            if (fullPath.normalize) {
                fullPath = fullPath.normalize('NFC');
            }
            fullPath = "/" + slug + fullPath;

            var api = new _restApi.TreeServiceApi(_api2.default.getRestClient());
            var request = new _restApi.RestCreateNodesRequest();
            var node = new _restApi.TreeNode();

            node.Path = fullPath;
            node.Type = _restApi.TreeNodeType.constructFromObject('COLLECTION');
            request.Nodes = [node];

            api.createNodes(request).then(function (collection) {
                _this2.setStatus('loaded');
                completeCallback();
            });
        }
    }, {
        key: '_doAbort',
        value: function _doAbort(completeCallback) {
            if (console) {
                console.log(pydio.MessageHash['html_uploader.6']);
            }
        }
    }]);

    return FolderItem;
}(_StatusItem3.default);

exports.default = FolderItem;

},{"./StatusItem":3,"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","pydio/util/path":"pydio/util/path"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observable = require('pydio/lang/observable');

var _observable2 = _interopRequireDefault(_observable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StatusItem = function (_Observable) {
    _inherits(StatusItem, _Observable);

    function StatusItem(type) {
        _classCallCheck(this, StatusItem);

        var _this = _possibleConstructorReturn(this, (StatusItem.__proto__ || Object.getPrototypeOf(StatusItem)).call(this));

        _this._status = 'new';
        _this._type = type;
        _this._id = Math.random();
        _this._errorMessage = null;
        return _this;
    }

    _createClass(StatusItem, [{
        key: 'getId',
        value: function getId() {
            return this._id;
        }
    }, {
        key: 'getLabel',
        value: function getLabel() {}
    }, {
        key: 'getType',
        value: function getType() {
            return this._type;
        }
    }, {
        key: 'getStatus',
        value: function getStatus() {
            return this._status;
        }
    }, {
        key: 'setStatus',
        value: function setStatus(status) {
            this._status = status;
            this.notify('status');
        }
    }, {
        key: 'updateRepositoryId',
        value: function updateRepositoryId(repositoryId) {
            this._repositoryId = repositoryId;
        }
    }, {
        key: 'getErrorMessage',
        value: function getErrorMessage() {
            return this._errorMessage || '';
        }
    }, {
        key: 'onError',
        value: function onError(errorMessage) {
            this._errorMessage = errorMessage;
            this.setStatus('error');
        }
    }, {
        key: 'process',
        value: function process(completeCallback) {
            this._doProcess(completeCallback);
        }
    }, {
        key: 'abort',
        value: function abort(completeCallback) {
            if (this._status !== 'loading') {
                return;
            }
            this._doAbort(completeCallback);
        }
    }]);

    return StatusItem;
}(_observable2.default);

exports.default = StatusItem;

},{"pydio/lang/observable":"pydio/lang/observable"}],4:[function(require,module,exports){
(function (global){
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Configs":1,"./FolderItem":2,"./Task":5,"./UploadItem":6,"pydio":"pydio","pydio/lang/observable":"pydio/lang/observable","pydio/util/lang":"pydio/util/lang"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('pydio/http/rest-api'),
    JobsJob = _require.JobsJob,
    JobsTask = _require.JobsTask,
    JobsTaskStatus = _require.JobsTaskStatus;

var _Pydio$requireLib = _pydio2.default.requireLib("boot"),
    JobsStore = _Pydio$requireLib.JobsStore;

var Task = function () {
    function Task() {
        _classCallCheck(this, Task);

        pydio = _pydio2.default.getInstance();
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
        this.job.openDetailPane = function () {
            pydio.Controller.fireAction("upload");
        };
        JobsStore.getInstance().enqueueLocalJob(this.job);
    }

    _createClass(Task, [{
        key: 'setProgress',
        value: function setProgress(progress) {
            this.task.Progress = progress;
            this.task.Status = JobsTaskStatus.constructFromObject('Running');
            this.notifyMainStore();
        }
    }, {
        key: 'setPending',
        value: function setPending(queueSize) {
            this.task.StatusMessage = _pydio2.default.getInstance().MessageHash['html_uploader.1'].replace('%s', queueSize);
            this.task.Status = JobsTaskStatus.constructFromObject('Idle');
            this.notifyMainStore();
        }
    }, {
        key: 'setRunning',
        value: function setRunning(queueSize) {
            this.task.Status = JobsTaskStatus.constructFromObject('Running');
            this.task.StatusMessage = _pydio2.default.getInstance().MessageHash['html_uploader.2'].replace('%s', queueSize);
            this.notifyMainStore();
        }
    }, {
        key: 'setIdle',
        value: function setIdle() {
            this.task.Status = JobsTaskStatus.constructFromObject('Idle');
            this.task.StatusMessage = '';
            this.notifyMainStore();
        }
    }, {
        key: 'notifyMainStore',
        value: function notifyMainStore() {
            this.task.startTime = new Date().getTime() / 1000;
            this.job.Tasks = [this.task];
            JobsStore.getInstance().enqueueLocalJob(this.job);
        }
    }], [{
        key: 'getInstance',
        value: function getInstance() {
            if (!Task.__INSTANCE) {
                Task.__INSTANCE = new Task();
            }
            return Task.__INSTANCE;
        }
    }]);

    return Task;
}();

exports.default = Task;

},{"pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api"}],6:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StatusItem2 = require('./StatusItem');

var _StatusItem3 = _interopRequireDefault(_StatusItem2);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _lang = require('pydio/util/lang');

var _lang2 = _interopRequireDefault(_lang);

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _Configs = require('./Configs');

var _Configs2 = _interopRequireDefault(_Configs);

var _restApi = require('pydio/http/rest-api');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UploadItem = function (_StatusItem) {
    _inherits(UploadItem, _StatusItem);

    function UploadItem(file, targetNode) {
        var relativePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, UploadItem);

        var _this = _possibleConstructorReturn(this, (UploadItem.__proto__ || Object.getPrototypeOf(UploadItem)).call(this, 'file'));

        _this._file = file;
        _this._status = 'new';
        _this._progress = 0;
        _this._targetNode = targetNode;
        _this._repositoryId = _pydio2.default.getInstance().user.activeRepository;
        _this._relativePath = relativePath;
        return _this;
    }

    _createClass(UploadItem, [{
        key: 'getFile',
        value: function getFile() {
            return this._file;
        }
    }, {
        key: 'getSize',
        value: function getSize() {
            return this._file.size;
        }
    }, {
        key: 'getLabel',
        value: function getLabel() {
            return this._relativePath ? this._relativePath : this._file.name;
        }
    }, {
        key: 'getProgress',
        value: function getProgress() {
            return this._progress;
        }
    }, {
        key: 'setProgress',
        value: function setProgress(newValue) {
            var bytes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            this._progress = newValue;
            this.notify('progress', newValue);
            if (bytes !== null) {
                this.notify('bytes', bytes);
            }
        }
    }, {
        key: 'getRelativePath',
        value: function getRelativePath() {
            return this._relativePath;
        }
    }, {
        key: '_parseXHRResponse',
        value: function _parseXHRResponse() {
            if (this.xhr && this.xhr.responseText && this.xhr.responseText !== 'OK') {
                this.onError('Unexpected response: ' + this.xhr.responseText);
            }
        }
    }, {
        key: '_doProcess',
        value: function _doProcess(completeCallback) {
            var _this2 = this;

            var complete = function complete() {
                _this2.setStatus('loaded');
                _this2._parseXHRResponse();
                completeCallback();
            };

            var progress = function progress(computableEvent) {
                if (_this2._status === 'error') {
                    return;
                }
                var percentage = Math.round(computableEvent.loaded * 100 / computableEvent.total);
                var bytesLoaded = computableEvent.loaded;
                _this2.setProgress(percentage, bytesLoaded);
            };

            var error = function error(e) {
                _this2.onError(_pydio2.default.getInstance().MessageHash[210] + ": " + e.message);
                completeCallback();
            };

            var MAX_RETRIES = 10;
            var retry = function retry(count) {
                return function (e) {
                    if (count >= MAX_RETRIES) {
                        error(e);
                    } else {
                        _this2.uploadPresigned(complete, progress, retry(++count));
                    }
                };
            };

            this.setStatus('loading');

            try {
                _Configs2.default.getInstance().extensionAllowed(this);
            } catch (e) {
                this.onError(e.message);
                completeCallback();
                return;
            }

            retry(0)();
        }
    }, {
        key: '_doAbort',
        value: function _doAbort(completeCallback) {
            if (this.xhr) {
                try {
                    this.xhr.abort();
                } catch (e) {}
            }
            this.setStatus('error');
        }
    }, {
        key: 'file_newpath',
        value: function file_newpath(fullpath) {
            var _this3 = this;

            return new Promise(function () {
                var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve) {
                    var lastSlash, pos, path, ext, newPath, counter, exists;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    lastSlash = fullpath.lastIndexOf('/');
                                    pos = fullpath.lastIndexOf('.');
                                    path = fullpath;
                                    ext = '';

                                    if (pos > -1 && lastSlash < pos && pos > lastSlash + 1) {
                                        path = fullpath.substring(0, pos);
                                        ext = fullpath.substring(pos);
                                    }

                                    newPath = fullpath;
                                    counter = 1;
                                    _context.next = 9;
                                    return _this3._fileExists(newPath);

                                case 9:
                                    exists = _context.sent;

                                case 10:
                                    if (!exists) {
                                        _context.next = 18;
                                        break;
                                    }

                                    newPath = path + '-' + counter + ext;
                                    counter++;
                                    _context.next = 15;
                                    return _this3._fileExists(newPath);

                                case 15:
                                    exists = _context.sent;
                                    _context.next = 10;
                                    break;

                                case 18:

                                    resolve(newPath);

                                case 19:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, _this3);
                }));

                return function (_x3) {
                    return _ref.apply(this, arguments);
                };
            }());
        }
    }, {
        key: '_fileExists',
        value: function _fileExists(fullpath) {
            return new Promise(function (resolve) {
                var api = new _restApi.TreeServiceApi(_api2.default.getRestClient());

                api.headNode(fullpath).then(function (node) {
                    if (node.Node) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(function () {
                    return resolve(false);
                });
            });
        }
    }, {
        key: 'uploadPresigned',
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(completeCallback, progressCallback, errorCallback) {
                var _this4 = this;

                var repoList, slug, fullPath, overwriteStatus;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                repoList = _pydio2.default.getInstance().user.getRepositoriesList();

                                if (repoList.has(this._repositoryId)) {
                                    _context2.next = 4;
                                    break;
                                }

                                errorCallback(new Error('Unauthorized workspace!'));
                                return _context2.abrupt('return');

                            case 4:
                                slug = repoList.get(this._repositoryId).getSlug();
                                fullPath = this._targetNode.getPath();

                                if (this._relativePath) {
                                    fullPath = _lang2.default.trimRight(fullPath, '/') + '/' + _lang2.default.trimLeft(_path2.default.getDirname(this._relativePath), '/');
                                }
                                fullPath = slug + '/' + _lang2.default.trim(fullPath, '/');
                                fullPath = _lang2.default.trimRight(fullPath, '/') + '/' + _path2.default.getBasename(this._file.name);
                                if (fullPath.normalize) {
                                    fullPath = fullPath.normalize('NFC');
                                }

                                overwriteStatus = _Configs2.default.getInstance().getOption("DEFAULT_EXISTING", "upload_existing");

                                if (!(overwriteStatus === 'rename')) {
                                    _context2.next = 17;
                                    break;
                                }

                                _context2.next = 14;
                                return this.file_newpath(fullPath);

                            case 14:
                                fullPath = _context2.sent;
                                _context2.next = 21;
                                break;

                            case 17:
                                if (!(overwriteStatus === 'alert')) {
                                    _context2.next = 21;
                                    break;
                                }

                                if (global.confirm(_pydio2.default.getInstance().MessageHash[124])) {
                                    _context2.next = 21;
                                    break;
                                }

                                errorCallback(new Error(_pydio2.default.getInstance().MessageHash[71]));
                                return _context2.abrupt('return');

                            case 21:

                                _api2.default.getClient().uploadPresigned(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(function (xhr) {
                                    _this4.xhr = xhr;
                                });

                            case 22:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function uploadPresigned(_x4, _x5, _x6) {
                return _ref2.apply(this, arguments);
            }

            return uploadPresigned;
        }()
    }]);

    return UploadItem;
}(_StatusItem3.default);

exports.default = UploadItem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Configs":1,"./StatusItem":3,"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","pydio/util/path":"pydio/util/path"}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FolderItem = exports.UploadItem = exports.Configs = exports.Store = undefined;

var _Store = require('./Store');

var _Store2 = _interopRequireDefault(_Store);

var _Configs = require('./Configs');

var _Configs2 = _interopRequireDefault(_Configs);

var _UploadItem = require('./UploadItem');

var _UploadItem2 = _interopRequireDefault(_UploadItem);

var _FolderItem = require('./FolderItem');

var _FolderItem2 = _interopRequireDefault(_FolderItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Store = _Store2.default;
exports.Configs = _Configs2.default;
exports.UploadItem = _UploadItem2.default;
exports.FolderItem = _FolderItem2.default;

},{"./Configs":1,"./FolderItem":2,"./Store":4,"./UploadItem":6}]},{},[7])(7)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9tb2RlbC9Db25maWdzLmpzIiwianMvYnVpbGQvbW9kZWwvRm9sZGVySXRlbS5qcyIsImpzL2J1aWxkL21vZGVsL1N0YXR1c0l0ZW0uanMiLCJqcy9idWlsZC9tb2RlbC9TdG9yZS5qcyIsImpzL2J1aWxkL21vZGVsL1Rhc2suanMiLCJqcy9idWlsZC9tb2RlbC9VcGxvYWRJdGVtLmpzIiwianMvYnVpbGQvbW9kZWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3BhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcGF0aCk7XG5cbnZhciBfb2JzZXJ2YWJsZSA9IHJlcXVpcmUoJ3B5ZGlvL2xhbmcvb2JzZXJ2YWJsZScpO1xuXG52YXIgX29ic2VydmFibGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfb2JzZXJ2YWJsZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIENvbmZpZ3MgPSBmdW5jdGlvbiAoX09ic2VydmFibGUpIHtcbiAgICBfaW5oZXJpdHMoQ29uZmlncywgX09ic2VydmFibGUpO1xuXG4gICAgX2NyZWF0ZUNsYXNzKENvbmZpZ3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2dldEluc3RhbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKCkge1xuICAgICAgICAgICAgaWYgKCFDb25maWdzLl9fSU5TVEFOQ0UpIHtcbiAgICAgICAgICAgICAgICBDb25maWdzLl9fSU5TVEFOQ0UgPSBuZXcgQ29uZmlncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIENvbmZpZ3MuX19JTlNUQU5DRTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIGZ1bmN0aW9uIENvbmZpZ3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb25maWdzKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoQ29uZmlncy5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbmZpZ3MpKS5jYWxsKHRoaXMpKTtcblxuICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5vYnNlcnZlKFwicmVnaXN0cnlfbG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX2dsb2JhbCA9IG51bGw7XG4gICAgICAgIH0uYmluZChfdGhpcykpO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENvbmZpZ3MsIFt7XG4gICAgICAgIGtleTogJ19sb2FkT3B0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfbG9hZE9wdGlvbnMoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2dsb2JhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2dsb2JhbCA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldFBsdWdpbkNvbmZpZ3MoXCJ1cGxvYWRlclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0T3B0aW9uQXNCb29sJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE9wdGlvbkFzQm9vbChuYW1lKSB7XG4gICAgICAgICAgICB2YXIgdXNlclByZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICAgICAgICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB2YXIgbyA9IHRoaXMuZ2V0T3B0aW9uKG5hbWUsIHVzZXJQcmVmLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIG8gPT09IHRydWUgfHwgbyA9PT0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRPcHRpb24nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0T3B0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIHZhciB1c2VyUHJlZiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJyc7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHRoaXMuX2xvYWRPcHRpb25zKCk7XG4gICAgICAgICAgICBpZiAodXNlclByZWYpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGVzdCA9IENvbmZpZ3MuZ2V0VXNlclByZWZlcmVuY2UoJ29yaWdpbmFsVXBsb2FkRm9ybV9YSFJVcGxvYWRlcicsIHVzZXJQcmVmKTtcbiAgICAgICAgICAgICAgICBpZiAodGVzdCAhPT0gdW5kZWZpbmVkICYmIHRlc3QgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2dsb2JhbC5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2xvYmFsLmdldChuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0QXV0b1N0YXJ0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEF1dG9TdGFydCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbkFzQm9vbChcIkRFRkFVTFRfQVVUT19TVEFSVFwiLCBcInVwbG9hZF9hdXRvX3NlbmRcIik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEF1dG9DbG9zZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRBdXRvQ2xvc2UoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb25Bc0Jvb2woXCJERUZBVUxUX0FVVE9fQ0xPU0VcIiwgXCJ1cGxvYWRfYXV0b19jbG9zZVwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlT3B0aW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZU9wdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGlzQm9vbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChpc0Jvb2wpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID8gXCJ0cnVlXCIgOiBcImZhbHNlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBDb25maWdzLnNldFVzZXJQcmVmZXJlbmNlKCdvcmlnaW5hbFVwbG9hZEZvcm1fWEhSVXBsb2FkZXInLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeShcImNoYW5nZVwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZXh0ZW5zaW9uQWxsb3dlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBleHRlbnNpb25BbGxvd2VkKHVwbG9hZEl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBleHRTdHJpbmcgPSB0aGlzLmdldE9wdGlvbihcIkFMTE9XRURfRVhURU5TSU9OU1wiLCAnJywgJycpO1xuICAgICAgICAgICAgaWYgKCFleHRTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZXh0RGVzY3JpcHRpb24gPSB0aGlzLmdldE9wdGlvbihcIkFMTE9XRURfRVhURU5TSU9OU19SRUFEQUJMRVwiLCAnJywgJycpO1xuICAgICAgICAgICAgaWYgKGV4dERlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgZXh0RGVzY3JpcHRpb24gPSAnICgnICsgZXh0RGVzY3JpcHRpb24gKyAnKSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXRlbUV4dCA9IF9wYXRoMi5kZWZhdWx0LmdldEZpbGVFeHRlbnNpb24odXBsb2FkSXRlbS5nZXRMYWJlbCgpKTtcbiAgICAgICAgICAgIGlmIChleHRTdHJpbmcuc3BsaXQoJywnKS5pbmRleE9mKGl0ZW1FeHQpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaFszNjddICsgZXh0U3RyaW5nICsgZXh0RGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ2dldFVzZXJQcmVmZXJlbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFVzZXJQcmVmZXJlbmNlKGd1aUVsZW1lbnRJZCwgcHJlZk5hbWUpIHtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgaWYgKCFweWRpby51c2VyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZ3VpX3ByZWYgPSBweWRpby51c2VyLmdldFByZWZlcmVuY2UoXCJndWlfcHJlZmVyZW5jZXNcIiwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoIWd1aV9wcmVmIHx8ICFndWlfcHJlZltndWlFbGVtZW50SWRdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5ICYmIGd1aV9wcmVmW2d1aUVsZW1lbnRJZF1bJ3JlcG8tJyArIHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ3VpX3ByZWZbZ3VpRWxlbWVudElkXVsncmVwby0nICsgcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5XVtwcmVmTmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZ3VpX3ByZWZbZ3VpRWxlbWVudElkXVtwcmVmTmFtZV07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldFVzZXJQcmVmZXJlbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFVzZXJQcmVmZXJlbmNlKGd1aUVsZW1lbnRJZCwgcHJlZk5hbWUsIHByZWZWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICBpZiAoIXB5ZGlvIHx8ICFweWRpby51c2VyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGd1aVByZWYgPSBweWRpby51c2VyLmdldFByZWZlcmVuY2UoXCJndWlfcHJlZmVyZW5jZXNcIiwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoIWd1aVByZWYpIHtcbiAgICAgICAgICAgICAgICBndWlQcmVmID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWd1aVByZWZbZ3VpRWxlbWVudElkXSkge1xuICAgICAgICAgICAgICAgIGd1aVByZWZbZ3VpRWxlbWVudElkXSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgIHZhciByZXBva2V5ID0gJ3JlcG8tJyArIHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeTtcbiAgICAgICAgICAgICAgICBpZiAoIWd1aVByZWZbZ3VpRWxlbWVudElkXVtyZXBva2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBndWlQcmVmW2d1aUVsZW1lbnRJZF1bcmVwb2tleV0gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGd1aVByZWZbZ3VpRWxlbWVudElkXVtyZXBva2V5XVtwcmVmTmFtZV0gJiYgZ3VpUHJlZltndWlFbGVtZW50SWRdW3JlcG9rZXldW3ByZWZOYW1lXSA9PT0gcHJlZlZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3VpUHJlZltndWlFbGVtZW50SWRdW3JlcG9rZXldW3ByZWZOYW1lXSA9IHByZWZWYWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGd1aVByZWZbZ3VpRWxlbWVudElkXVtwcmVmTmFtZV0gJiYgZ3VpUHJlZltndWlFbGVtZW50SWRdW3ByZWZOYW1lXSA9PT0gcHJlZlZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3VpUHJlZltndWlFbGVtZW50SWRdW3ByZWZOYW1lXSA9IHByZWZWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB5ZGlvLnVzZXIuc2V0UHJlZmVyZW5jZShcImd1aV9wcmVmZXJlbmNlc1wiLCBndWlQcmVmLCB0cnVlKTtcbiAgICAgICAgICAgIHB5ZGlvLnVzZXIuc2F2ZVByZWZlcmVuY2UoXCJndWlfcHJlZmVyZW5jZXNcIik7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ29uZmlncztcbn0oX29ic2VydmFibGUyLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBDb25maWdzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfU3RhdHVzSXRlbTIgPSByZXF1aXJlKCcuL1N0YXR1c0l0ZW0nKTtcblxudmFyIF9TdGF0dXNJdGVtMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1N0YXR1c0l0ZW0yKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX2xhbmcgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxudmFyIF9sYW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xhbmcpO1xuXG52YXIgX2FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfYXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwaSk7XG5cbnZhciBfcmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgRm9sZGVySXRlbSA9IGZ1bmN0aW9uIChfU3RhdHVzSXRlbSkge1xuICAgIF9pbmhlcml0cyhGb2xkZXJJdGVtLCBfU3RhdHVzSXRlbSk7XG5cbiAgICBmdW5jdGlvbiBGb2xkZXJJdGVtKHBhdGgsIHRhcmdldE5vZGUpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEZvbGRlckl0ZW0pO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChGb2xkZXJJdGVtLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRm9sZGVySXRlbSkpLmNhbGwodGhpcywgJ2ZvbGRlcicpKTtcblxuICAgICAgICBfdGhpcy5fbmV3ID0gdHJ1ZTtcbiAgICAgICAgX3RoaXMuX3BhdGggPSBwYXRoO1xuICAgICAgICBfdGhpcy5fdGFyZ2V0Tm9kZSA9IHRhcmdldE5vZGU7XG4gICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuICAgICAgICBfdGhpcy5fcmVwb3NpdG9yeUlkID0gcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEZvbGRlckl0ZW0sIFt7XG4gICAgICAgIGtleTogJ2lzTmV3JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzTmV3KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25ldztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0UGF0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQYXRoKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhdGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExhYmVsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExhYmVsKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKHRoaXMuX3BhdGgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfZG9Qcm9jZXNzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9kb1Byb2Nlc3MoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICB2YXIgcmVwb0xpc3QgPSBweWRpby51c2VyLmdldFJlcG9zaXRvcmllc0xpc3QoKTtcbiAgICAgICAgICAgIGlmICghcmVwb0xpc3QuaGFzKHRoaXMuX3JlcG9zaXRvcnlJZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXR1cygnZXJyb3InKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2x1ZyA9IHJlcG9MaXN0LmdldCh0aGlzLl9yZXBvc2l0b3J5SWQpLmdldFNsdWcoKTtcbiAgICAgICAgICAgIHZhciBmdWxsUGF0aCA9IHRoaXMuX3RhcmdldE5vZGUuZ2V0UGF0aCgpO1xuICAgICAgICAgICAgZnVsbFBhdGggPSBfbGFuZzIuZGVmYXVsdC50cmltUmlnaHQoZnVsbFBhdGgsICcvJykgKyAnLycgKyBfbGFuZzIuZGVmYXVsdC50cmltTGVmdCh0aGlzLl9wYXRoLCAnLycpO1xuICAgICAgICAgICAgaWYgKGZ1bGxQYXRoLm5vcm1hbGl6ZSkge1xuICAgICAgICAgICAgICAgIGZ1bGxQYXRoID0gZnVsbFBhdGgubm9ybWFsaXplKCdORkMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bGxQYXRoID0gXCIvXCIgKyBzbHVnICsgZnVsbFBhdGg7XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3Jlc3RBcGkuVHJlZVNlcnZpY2VBcGkoX2FwaTIuZGVmYXVsdC5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX3Jlc3RBcGkuUmVzdENyZWF0ZU5vZGVzUmVxdWVzdCgpO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBuZXcgX3Jlc3RBcGkuVHJlZU5vZGUoKTtcblxuICAgICAgICAgICAgbm9kZS5QYXRoID0gZnVsbFBhdGg7XG4gICAgICAgICAgICBub2RlLlR5cGUgPSBfcmVzdEFwaS5UcmVlTm9kZVR5cGUuY29uc3RydWN0RnJvbU9iamVjdCgnQ09MTEVDVElPTicpO1xuICAgICAgICAgICAgcmVxdWVzdC5Ob2RlcyA9IFtub2RlXTtcblxuICAgICAgICAgICAgYXBpLmNyZWF0ZU5vZGVzKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdHVzKCdsb2FkZWQnKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZUNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnX2RvQWJvcnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2RvQWJvcnQoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNvbnNvbGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci42J10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEZvbGRlckl0ZW07XG59KF9TdGF0dXNJdGVtMy5kZWZhdWx0KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gRm9sZGVySXRlbTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX29ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9vYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29ic2VydmFibGUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBTdGF0dXNJdGVtID0gZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKFN0YXR1c0l0ZW0sIF9PYnNlcnZhYmxlKTtcblxuICAgIGZ1bmN0aW9uIFN0YXR1c0l0ZW0odHlwZSkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3RhdHVzSXRlbSk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFN0YXR1c0l0ZW0uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTdGF0dXNJdGVtKSkuY2FsbCh0aGlzKSk7XG5cbiAgICAgICAgX3RoaXMuX3N0YXR1cyA9ICduZXcnO1xuICAgICAgICBfdGhpcy5fdHlwZSA9IHR5cGU7XG4gICAgICAgIF90aGlzLl9pZCA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIF90aGlzLl9lcnJvck1lc3NhZ2UgPSBudWxsO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFN0YXR1c0l0ZW0sIFt7XG4gICAgICAgIGtleTogJ2dldElkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldElkKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRMYWJlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMYWJlbCgpIHt9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRUeXBlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFR5cGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0U3RhdHVzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFN0YXR1cygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldFN0YXR1cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRTdGF0dXMoc3RhdHVzKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgnc3RhdHVzJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZVJlcG9zaXRvcnlJZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVSZXBvc2l0b3J5SWQocmVwb3NpdG9yeUlkKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBvc2l0b3J5SWQgPSByZXBvc2l0b3J5SWQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEVycm9yTWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFcnJvck1lc3NhZ2UoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3JNZXNzYWdlIHx8ICcnO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkVycm9yJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uRXJyb3IoZXJyb3JNZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLl9lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXR1cygnZXJyb3InKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHJvY2VzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzKGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRoaXMuX2RvUHJvY2Vzcyhjb21wbGV0ZUNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWJvcnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWJvcnQoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0YXR1cyAhPT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZG9BYm9ydChjb21wbGV0ZUNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTdGF0dXNJdGVtO1xufShfb2JzZXJ2YWJsZTIuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFN0YXR1c0l0ZW07XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2xhbmcgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxudmFyIF9sYW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xhbmcpO1xuXG52YXIgX29ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9vYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29ic2VydmFibGUpO1xuXG52YXIgX1Rhc2sgPSByZXF1aXJlKCcuL1Rhc2snKTtcblxudmFyIF9UYXNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Rhc2spO1xuXG52YXIgX0NvbmZpZ3MgPSByZXF1aXJlKCcuL0NvbmZpZ3MnKTtcblxudmFyIF9Db25maWdzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbmZpZ3MpO1xuXG52YXIgX1VwbG9hZEl0ZW0gPSByZXF1aXJlKCcuL1VwbG9hZEl0ZW0nKTtcblxudmFyIF9VcGxvYWRJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VwbG9hZEl0ZW0pO1xuXG52YXIgX0ZvbGRlckl0ZW0gPSByZXF1aXJlKCcuL0ZvbGRlckl0ZW0nKTtcblxudmFyIF9Gb2xkZXJJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ZvbGRlckl0ZW0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBTdG9yZSA9IGZ1bmN0aW9uIChfT2JzZXJ2YWJsZSkge1xuICAgIF9pbmhlcml0cyhTdG9yZSwgX09ic2VydmFibGUpO1xuXG4gICAgZnVuY3Rpb24gU3RvcmUoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTdG9yZSk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFN0b3JlLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoU3RvcmUpKS5jYWxsKHRoaXMpKTtcblxuICAgICAgICBfdGhpcy5fZm9sZGVycyA9IFtdO1xuICAgICAgICBfdGhpcy5fdXBsb2FkcyA9IFtdO1xuICAgICAgICBfdGhpcy5fcHJvY2Vzc2luZyA9IFtdO1xuICAgICAgICBfdGhpcy5fcHJvY2Vzc2VkID0gW107XG4gICAgICAgIF90aGlzLl9lcnJvcnMgPSBbXTtcbiAgICAgICAgX3RoaXMuX2JsYWNrbGlzdCA9IFtcIi5kc19zdG9yZVwiLCBcIi5weWRpb1wiXTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTdG9yZSwgW3tcbiAgICAgICAga2V5OiAncmVjb21wdXRlR2xvYmFsUHJvZ3Jlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVjb21wdXRlR2xvYmFsUHJvZ3Jlc3MoKSB7XG4gICAgICAgICAgICB2YXIgdG90YWxDb3VudCA9IDA7XG4gICAgICAgICAgICB2YXIgdG90YWxQcm9ncmVzcyA9IDA7XG4gICAgICAgICAgICB0aGlzLl91cGxvYWRzLmNvbmNhdCh0aGlzLl9wcm9jZXNzaW5nKS5jb25jYXQodGhpcy5fcHJvY2Vzc2VkKS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpdGVtLmdldFByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdG90YWxDb3VudCArPSBpdGVtLmdldFNpemUoKTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2dyZXNzICs9IGl0ZW0uZ2V0UHJvZ3Jlc3MoKSAqIGl0ZW0uZ2V0U2l6ZSgpIC8gMTAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3MgPSB2b2lkIDA7XG4gICAgICAgICAgICBpZiAodG90YWxDb3VudCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gdG90YWxQcm9ncmVzcyAvIHRvdGFsQ291bnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9ncmVzcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0QXV0b1N0YXJ0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEF1dG9TdGFydCgpIHtcbiAgICAgICAgICAgIHJldHVybiBfQ29uZmlnczIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldEF1dG9TdGFydCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwdXNoRm9sZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHB1c2hGb2xkZXIoZm9sZGVySXRlbSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmdldFF1ZXVlU2l6ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2VkID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9mb2xkZXJzLnB1c2goZm9sZGVySXRlbSk7XG4gICAgICAgICAgICBfVGFzazIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLnNldFBlbmRpbmcodGhpcy5nZXRRdWV1ZVNpemUoKSk7XG4gICAgICAgICAgICBpZiAoX0NvbmZpZ3MyLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRBdXRvU3RhcnQoKSAmJiAhdGhpcy5fcHJvY2Vzc2luZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NOZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgnaXRlbV9hZGRlZCcsIGZvbGRlckl0ZW0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwdXNoRmlsZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwdXNoRmlsZSh1cGxvYWRJdGVtKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmdldFF1ZXVlU2l6ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2VkID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBuYW1lID0gdXBsb2FkSXRlbS5nZXRGaWxlKCkubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgdmFyIGlzQmxhY2tsaXN0ZWQgPSBuYW1lLmxlbmd0aCA+PSAxICYmIG5hbWVbMF0gPT09IFwiLlwiO1xuICAgICAgICAgICAgaWYgKGlzQmxhY2tsaXN0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3VwbG9hZHMucHVzaCh1cGxvYWRJdGVtKTtcbiAgICAgICAgICAgIF9UYXNrMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuc2V0UGVuZGluZyh0aGlzLmdldFF1ZXVlU2l6ZSgpKTtcbiAgICAgICAgICAgIHVwbG9hZEl0ZW0ub2JzZXJ2ZShcInByb2dyZXNzXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGcgPSBfdGhpczIucmVjb21wdXRlR2xvYmFsUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgICAgICBfVGFzazIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLnNldFByb2dyZXNzKHBnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKF9Db25maWdzMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0QXV0b1N0YXJ0KCkgJiYgIXRoaXMuX3Byb2Nlc3NpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzTmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2l0ZW1fYWRkZWQnLCB1cGxvYWRJdGVtKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9nJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvZygpIHt9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwcm9jZXNzUXVldWUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2Vzc1F1ZXVlKCkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSB0aGlzLmdldE5leHQoKTtcbiAgICAgICAgICAgIHdoaWxlIChuZXh0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV4dC5wcm9jZXNzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQuZ2V0U3RhdHVzKCkgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Vycm9ycy5wdXNoKG5leHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2VkLnB1c2gobmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5nZXROZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFF1ZXVlU2l6ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRRdWV1ZVNpemUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm9sZGVycy5sZW5ndGggKyB0aGlzLl91cGxvYWRzLmxlbmd0aCArIHRoaXMuX3Byb2Nlc3NpbmcubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhckFsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckFsbCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZvbGRlcnMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3VwbG9hZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NpbmcgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NlZCA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fZXJyb3JzID0gW107XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICBfVGFzazIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLnNldElkbGUoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHJvY2Vzc05leHQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2Vzc05leHQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHByb2Nlc3NhYmxlcyA9IHRoaXMuZ2V0TmV4dHMoKTtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzYWJsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcHJvY2Vzc2FibGVzLm1hcChmdW5jdGlvbiAocHJvY2Vzc2FibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLl9wcm9jZXNzaW5nLnB1c2gocHJvY2Vzc2FibGUpO1xuICAgICAgICAgICAgICAgICAgICBfVGFzazIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLnNldFJ1bm5pbmcoX3RoaXMzLmdldFF1ZXVlU2l6ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2FibGUucHJvY2VzcyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMuX3Byb2Nlc3NpbmcgPSBfbGFuZzIuZGVmYXVsdC5hcnJheVdpdGhvdXQoX3RoaXMzLl9wcm9jZXNzaW5nLCBfdGhpczMuX3Byb2Nlc3NpbmcuaW5kZXhPZihwcm9jZXNzYWJsZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2Nlc3NhYmxlLmdldFN0YXR1cygpID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLl9lcnJvcnMucHVzaChwcm9jZXNzYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5fcHJvY2Vzc2VkLnB1c2gocHJvY2Vzc2FibGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnByb2Nlc3NOZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX1Rhc2syLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5zZXRJZGxlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXNFcnJvcnMoKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXB5ZGlvLmdldENvbnRyb2xsZXIoKS5yZWFjdF9zZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oXCJ1cGxvYWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKF9Db25maWdzMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0QXV0b0Nsb3NlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoXCJhdXRvX2Nsb3NlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TmV4dHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TmV4dHMoKSB7XG4gICAgICAgICAgICB2YXIgbWF4ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAzO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fZm9sZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW3RoaXMuX2ZvbGRlcnMuc2hpZnQoKV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgIHZhciBwcm9jZXNzaW5nID0gdGhpcy5fcHJvY2Vzc2luZy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1heCAtIHByb2Nlc3Npbmc7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl91cGxvYWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHRoaXMuX3VwbG9hZHMuc2hpZnQoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdG9wT3JSZW1vdmVJdGVtJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3BPclJlbW92ZUl0ZW0oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5hYm9ydCgpO1xuICAgICAgICAgICAgWydfdXBsb2FkcycsICdfZm9sZGVycycsICdfcHJvY2Vzc2luZycsICdfcHJvY2Vzc2VkJywgJ19lcnJvcnMnXS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gdGhpc1trZXldO1xuICAgICAgICAgICAgICAgIGlmIChhcnIuaW5kZXhPZihpdGVtKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldID0gX2xhbmcyLmRlZmF1bHQuYXJyYXlXaXRob3V0KGFyciwgYXJyLmluZGV4T2YoaXRlbSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0SXRlbXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SXRlbXMoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHByb2Nlc3Npbmc6IHRoaXMuX3Byb2Nlc3NpbmcsXG4gICAgICAgICAgICAgICAgcGVuZGluZzogdGhpcy5fZm9sZGVycy5jb25jYXQodGhpcy5fdXBsb2FkcyksXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2VkOiB0aGlzLl9wcm9jZXNzZWQsXG4gICAgICAgICAgICAgICAgZXJyb3JzOiB0aGlzLl9lcnJvcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhc0Vycm9ycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNFcnJvcnMoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3JzLmxlbmd0aCA/IHRoaXMuX2Vycm9ycyA6IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYW5kbGVGb2xkZXJQaWNrZXJSZXN1bHQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlRm9sZGVyUGlja2VyUmVzdWx0KGZpbGVzLCB0YXJnZXROb2RlKSB7XG4gICAgICAgICAgICB2YXIgZm9sZGVycyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByZWxQYXRoID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoZmlsZXNbaV1bJ3dlYmtpdFJlbGF0aXZlUGF0aCddKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbFBhdGggPSAnLycgKyBmaWxlc1tpXVsnd2Via2l0UmVsYXRpdmVQYXRoJ107XG4gICAgICAgICAgICAgICAgICAgIHZhciBmb2xkZXJQYXRoID0gUGF0aFV0aWxzLmdldERpcm5hbWUocmVsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZm9sZGVyc1tmb2xkZXJQYXRoXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wdXNoRm9sZGVyKG5ldyBfRm9sZGVySXRlbTIuZGVmYXVsdChmb2xkZXJQYXRoLCB0YXJnZXROb2RlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJzW2ZvbGRlclBhdGhdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hGaWxlKG5ldyBfVXBsb2FkSXRlbTIuZGVmYXVsdChmaWxlc1tpXSwgdGFyZ2V0Tm9kZSwgcmVsUGF0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYW5kbGVEcm9wRXZlbnRSZXN1bHRzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZURyb3BFdmVudFJlc3VsdHMoaXRlbXMsIGZpbGVzLCB0YXJnZXROb2RlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFjY3VtdWxhdG9yID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBudWxsO1xuICAgICAgICAgICAgdmFyIGZpbHRlckZ1bmN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBudWxsO1xuXG5cbiAgICAgICAgICAgIHZhciBvVGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggJiYgKGl0ZW1zWzBdLmdldEFzRW50cnkgfHwgaXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgICAgICB2YXIgZW50cnk7XG5cbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSBnbG9iYWwuY29uc29sZSA/IGdsb2JhbC5jb25zb2xlLmxvZyA6IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbC5hbGVydChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gaXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtc1tpXS5raW5kICYmIGl0ZW1zW2ldLmtpbmQgIT09ICdmaWxlJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbXNbMF0uZ2V0QXNFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5ID0gaXRlbXNbaV0uZ2V0QXNFbnRyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeSA9IGl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5maWxlKGZ1bmN0aW9uIChGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChGaWxlLnNpemUgPT09IDApIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVwbG9hZEl0ZW0gPSBuZXcgX1VwbG9hZEl0ZW0yLmRlZmF1bHQoRmlsZSwgdGFyZ2V0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGdW5jdGlvbiAmJiAhZmlsdGVyRnVuY3Rpb24odXBsb2FkSXRlbSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhY2N1bXVsYXRvcikgb1RoaXMucHVzaEZpbGUodXBsb2FkSXRlbSk7ZWxzZSBhY2N1bXVsYXRvci5wdXNoKHVwbG9hZEl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9sZGVySXRlbSA9IG5ldyBfRm9sZGVySXRlbTIuZGVmYXVsdChlbnRyeS5mdWxsUGF0aCwgdGFyZ2V0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckZ1bmN0aW9uICYmICFmaWx0ZXJGdW5jdGlvbihmb2xkZXJJdGVtKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhY2N1bXVsYXRvcikgb1RoaXMucHVzaEZvbGRlcihmb2xkZXJJdGVtKTtlbHNlIGFjY3VtdWxhdG9yLnB1c2goZm9sZGVySXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQucmVjdXJzZURpcmVjdG9yeShlbnRyeSwgZnVuY3Rpb24gKGZpbGVFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVsYXRpdmVQYXRoID0gZmlsZUVudHJ5LmZ1bGxQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlRW50cnkuZmlsZShmdW5jdGlvbiAoRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEZpbGUuc2l6ZSA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVwbG9hZEl0ZW0gPSBuZXcgX1VwbG9hZEl0ZW0yLmRlZmF1bHQoRmlsZSwgdGFyZ2V0Tm9kZSwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGdW5jdGlvbiAmJiAhZmlsdGVyRnVuY3Rpb24odXBsb2FkSXRlbSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYWNjdW11bGF0b3IpIG9UaGlzLnB1c2hGaWxlKHVwbG9hZEl0ZW0pO2Vsc2UgYWNjdW11bGF0b3IucHVzaCh1cGxvYWRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChmb2xkZXJFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9sZGVySXRlbSA9IG5ldyBfRm9sZGVySXRlbTIuZGVmYXVsdChmb2xkZXJFbnRyeS5mdWxsUGF0aCwgdGFyZ2V0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGdW5jdGlvbiAmJiAhZmlsdGVyRnVuY3Rpb24odXBsb2FkSXRlbSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhY2N1bXVsYXRvcikgb1RoaXMucHVzaEZvbGRlcihmb2xkZXJJdGVtKTtlbHNlIGFjY3VtdWxhdG9yLnB1c2goZm9sZGVySXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBmaWxlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXNbal0uc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuOCddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgX3VwbG9hZEl0ZW0gPSBuZXcgX1VwbG9hZEl0ZW0yLmRlZmF1bHQoZmlsZXNbal0sIHRhcmdldE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyRnVuY3Rpb24gJiYgIWZpbHRlckZ1bmN0aW9uKF91cGxvYWRJdGVtKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYWNjdW11bGF0b3IpIG9UaGlzLnB1c2hGaWxlKF91cGxvYWRJdGVtKTtlbHNlIGFjY3VtdWxhdG9yLnB1c2goX3VwbG9hZEl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFN0b3JlLmdldEluc3RhbmNlKCkubG9nKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlY3Vyc2VEaXJlY3RvcnknLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVjdXJzZURpcmVjdG9yeShpdGVtLCBmaWxlSGFuZGxlciwgZm9sZGVySGFuZGxlciwgZXJyb3JIYW5kbGVyKSB7XG5cbiAgICAgICAgICAgIHZhciByZWN1cnNlRGlyID0gdGhpcy5yZWN1cnNlRGlyZWN0b3J5LmJpbmQodGhpcyk7XG4gICAgICAgICAgICB2YXIgZGlyUmVhZGVyID0gaXRlbS5jcmVhdGVSZWFkZXIoKTtcbiAgICAgICAgICAgIHZhciBlbnRyaWVzID0gW107XG5cbiAgICAgICAgICAgIHZhciB0b0FycmF5ID0gZnVuY3Rpb24gdG9BcnJheShsaXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGxpc3QgfHwgW10sIDApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlYWRFbnRyaWVzID0gZnVuY3Rpb24gcmVhZEVudHJpZXMoKSB7XG4gICAgICAgICAgICAgICAgZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0cy5sZW5ndGgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZW50cmllcy5tYXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJIYW5kbGVyKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1cnNlRGlyKGUsIGZpbGVIYW5kbGVyLCBmb2xkZXJIYW5kbGVyLCBlcnJvckhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVIYW5kbGVyKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50cmllcyA9IGVudHJpZXMuY29uY2F0KHRvQXJyYXkocmVzdWx0cykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZEVudHJpZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGVycm9ySGFuZGxlcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZWFkRW50cmllcygpO1xuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ2dldEluc3RhbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKCkge1xuICAgICAgICAgICAgaWYgKCFTdG9yZS5fX0lOU1RBTkNFKSB7XG4gICAgICAgICAgICAgICAgU3RvcmUuX19JTlNUQU5DRSA9IG5ldyBTdG9yZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFN0b3JlLl9fSU5TVEFOQ0U7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3RvcmU7XG59KF9vYnNlcnZhYmxlMi5kZWZhdWx0KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gU3RvcmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyksXG4gICAgSm9ic0pvYiA9IF9yZXF1aXJlLkpvYnNKb2IsXG4gICAgSm9ic1Rhc2sgPSBfcmVxdWlyZS5Kb2JzVGFzayxcbiAgICBKb2JzVGFza1N0YXR1cyA9IF9yZXF1aXJlLkpvYnNUYXNrU3RhdHVzO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yLmRlZmF1bHQucmVxdWlyZUxpYihcImJvb3RcIiksXG4gICAgSm9ic1N0b3JlID0gX1B5ZGlvJHJlcXVpcmVMaWIuSm9ic1N0b3JlO1xuXG52YXIgVGFzayA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBUYXNrKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVGFzayk7XG5cbiAgICAgICAgcHlkaW8gPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgdGhpcy5qb2IgPSBuZXcgSm9ic0pvYigpO1xuICAgICAgICB0aGlzLmpvYi5JRCA9ICdsb2NhbC11cGxvYWQtdGFzayc7XG4gICAgICAgIHRoaXMuam9iLk93bmVyID0gcHlkaW8udXNlci5pZDtcbiAgICAgICAgdGhpcy5qb2IuTGFiZWwgPSBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci43J107XG4gICAgICAgIHRoaXMuam9iLlN0b3BwYWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMudGFzayA9IG5ldyBKb2JzVGFzaygpO1xuICAgICAgICB0aGlzLmpvYi5UYXNrcyA9IFt0aGlzLnRhc2tdO1xuICAgICAgICB0aGlzLnRhc2suSGFzUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICB0aGlzLnRhc2suSUQgPSBcInVwbG9hZFwiO1xuICAgICAgICB0aGlzLnRhc2suU3RhdHVzID0gSm9ic1Rhc2tTdGF0dXMuY29uc3RydWN0RnJvbU9iamVjdCgnSWRsZScpO1xuICAgICAgICB0aGlzLmpvYi5vcGVuRGV0YWlsUGFuZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHB5ZGlvLkNvbnRyb2xsZXIuZmlyZUFjdGlvbihcInVwbG9hZFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgSm9ic1N0b3JlLmdldEluc3RhbmNlKCkuZW5xdWV1ZUxvY2FsSm9iKHRoaXMuam9iKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVGFzaywgW3tcbiAgICAgICAga2V5OiAnc2V0UHJvZ3Jlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHRoaXMudGFzay5Qcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICAgICAgdGhpcy50YXNrLlN0YXR1cyA9IEpvYnNUYXNrU3RhdHVzLmNvbnN0cnVjdEZyb21PYmplY3QoJ1J1bm5pbmcnKTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5TWFpblN0b3JlKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldFBlbmRpbmcnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UGVuZGluZyhxdWV1ZVNpemUpIHtcbiAgICAgICAgICAgIHRoaXMudGFzay5TdGF0dXNNZXNzYWdlID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuMSddLnJlcGxhY2UoJyVzJywgcXVldWVTaXplKTtcbiAgICAgICAgICAgIHRoaXMudGFzay5TdGF0dXMgPSBKb2JzVGFza1N0YXR1cy5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdJZGxlJyk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeU1haW5TdG9yZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRSdW5uaW5nJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFJ1bm5pbmcocXVldWVTaXplKSB7XG4gICAgICAgICAgICB0aGlzLnRhc2suU3RhdHVzID0gSm9ic1Rhc2tTdGF0dXMuY29uc3RydWN0RnJvbU9iamVjdCgnUnVubmluZycpO1xuICAgICAgICAgICAgdGhpcy50YXNrLlN0YXR1c01lc3NhZ2UgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci4yJ10ucmVwbGFjZSgnJXMnLCBxdWV1ZVNpemUpO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlNYWluU3RvcmUoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0SWRsZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRJZGxlKCkge1xuICAgICAgICAgICAgdGhpcy50YXNrLlN0YXR1cyA9IEpvYnNUYXNrU3RhdHVzLmNvbnN0cnVjdEZyb21PYmplY3QoJ0lkbGUnKTtcbiAgICAgICAgICAgIHRoaXMudGFzay5TdGF0dXNNZXNzYWdlID0gJyc7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeU1haW5TdG9yZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdub3RpZnlNYWluU3RvcmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbm90aWZ5TWFpblN0b3JlKCkge1xuICAgICAgICAgICAgdGhpcy50YXNrLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICAgICAgICAgIHRoaXMuam9iLlRhc2tzID0gW3RoaXMudGFza107XG4gICAgICAgICAgICBKb2JzU3RvcmUuZ2V0SW5zdGFuY2UoKS5lbnF1ZXVlTG9jYWxKb2IodGhpcy5qb2IpO1xuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ2dldEluc3RhbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKCkge1xuICAgICAgICAgICAgaWYgKCFUYXNrLl9fSU5TVEFOQ0UpIHtcbiAgICAgICAgICAgICAgICBUYXNrLl9fSU5TVEFOQ0UgPSBuZXcgVGFzaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFRhc2suX19JTlNUQU5DRTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUYXNrO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBUYXNrO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfU3RhdHVzSXRlbTIgPSByZXF1aXJlKCcuL1N0YXR1c0l0ZW0nKTtcblxudmFyIF9TdGF0dXNJdGVtMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1N0YXR1c0l0ZW0yKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX2xhbmcgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxudmFyIF9sYW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xhbmcpO1xuXG52YXIgX2FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfYXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwaSk7XG5cbnZhciBfQ29uZmlncyA9IHJlcXVpcmUoJy4vQ29uZmlncycpO1xuXG52YXIgX0NvbmZpZ3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29uZmlncyk7XG5cbnZhciBfcmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdmFyIGdlbiA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IGZ1bmN0aW9uIHN0ZXAoa2V5LCBhcmcpIHsgdHJ5IHsgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpOyB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlOyB9IGNhdGNoIChlcnJvcikgeyByZWplY3QoZXJyb3IpOyByZXR1cm47IH0gaWYgKGluZm8uZG9uZSkgeyByZXNvbHZlKHZhbHVlKTsgfSBlbHNlIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHsgc3RlcChcIm5leHRcIiwgdmFsdWUpOyB9LCBmdW5jdGlvbiAoZXJyKSB7IHN0ZXAoXCJ0aHJvd1wiLCBlcnIpOyB9KTsgfSB9IHJldHVybiBzdGVwKFwibmV4dFwiKTsgfSk7IH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgVXBsb2FkSXRlbSA9IGZ1bmN0aW9uIChfU3RhdHVzSXRlbSkge1xuICAgIF9pbmhlcml0cyhVcGxvYWRJdGVtLCBfU3RhdHVzSXRlbSk7XG5cbiAgICBmdW5jdGlvbiBVcGxvYWRJdGVtKGZpbGUsIHRhcmdldE5vZGUpIHtcbiAgICAgICAgdmFyIHJlbGF0aXZlUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogbnVsbDtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBsb2FkSXRlbSk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFVwbG9hZEl0ZW0uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihVcGxvYWRJdGVtKSkuY2FsbCh0aGlzLCAnZmlsZScpKTtcblxuICAgICAgICBfdGhpcy5fZmlsZSA9IGZpbGU7XG4gICAgICAgIF90aGlzLl9zdGF0dXMgPSAnbmV3JztcbiAgICAgICAgX3RoaXMuX3Byb2dyZXNzID0gMDtcbiAgICAgICAgX3RoaXMuX3RhcmdldE5vZGUgPSB0YXJnZXROb2RlO1xuICAgICAgICBfdGhpcy5fcmVwb3NpdG9yeUlkID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkudXNlci5hY3RpdmVSZXBvc2l0b3J5O1xuICAgICAgICBfdGhpcy5fcmVsYXRpdmVQYXRoID0gcmVsYXRpdmVQYXRoO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFVwbG9hZEl0ZW0sIFt7XG4gICAgICAgIGtleTogJ2dldEZpbGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RmlsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maWxlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRTaXplJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFNpemUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlsZS5zaXplO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRMYWJlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMYWJlbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZWxhdGl2ZVBhdGggPyB0aGlzLl9yZWxhdGl2ZVBhdGggOiB0aGlzLl9maWxlLm5hbWU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFByb2dyZXNzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFByb2dyZXNzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2dyZXNzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRQcm9ncmVzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQcm9ncmVzcyhuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGJ5dGVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzcyA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3Byb2dyZXNzJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgaWYgKGJ5dGVzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2J5dGVzJywgYnl0ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRSZWxhdGl2ZVBhdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlbGF0aXZlUGF0aDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnX3BhcnNlWEhSUmVzcG9uc2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX3BhcnNlWEhSUmVzcG9uc2UoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy54aHIgJiYgdGhpcy54aHIucmVzcG9uc2VUZXh0ICYmIHRoaXMueGhyLnJlc3BvbnNlVGV4dCAhPT0gJ09LJykge1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcignVW5leHBlY3RlZCByZXNwb25zZTogJyArIHRoaXMueGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19kb1Byb2Nlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2RvUHJvY2Vzcyhjb21wbGV0ZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXR1cygnbG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgX3RoaXMyLl9wYXJzZVhIUlJlc3BvbnNlKCk7XG4gICAgICAgICAgICAgICAgY29tcGxldGVDYWxsYmFjaygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHByb2dyZXNzID0gZnVuY3Rpb24gcHJvZ3Jlc3MoY29tcHV0YWJsZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzMi5fc3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKGNvbXB1dGFibGVFdmVudC5sb2FkZWQgKiAxMDAgLyBjb21wdXRhYmxlRXZlbnQudG90YWwpO1xuICAgICAgICAgICAgICAgIHZhciBieXRlc0xvYWRlZCA9IGNvbXB1dGFibGVFdmVudC5sb2FkZWQ7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFByb2dyZXNzKHBlcmNlbnRhZ2UsIGJ5dGVzTG9hZGVkKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBlcnJvciA9IGZ1bmN0aW9uIGVycm9yKGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIub25FcnJvcihfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaFsyMTBdICsgXCI6IFwiICsgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZUNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgTUFYX1JFVFJJRVMgPSAxMDtcbiAgICAgICAgICAgIHZhciByZXRyeSA9IGZ1bmN0aW9uIHJldHJ5KGNvdW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA+PSBNQVhfUkVUUklFUykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIudXBsb2FkUHJlc2lnbmVkKGNvbXBsZXRlLCBwcm9ncmVzcywgcmV0cnkoKytjb3VudCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKCdsb2FkaW5nJyk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgX0NvbmZpZ3MyLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5leHRlbnNpb25BbGxvd2VkKHRoaXMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlQ2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHJ5KDApKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19kb0Fib3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9kb0Fib3J0KGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnhocikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueGhyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKCdlcnJvcicpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmaWxlX25ld3BhdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZmlsZV9uZXdwYXRoKGZ1bGxwYXRoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JlZiA9IF9hc3luY1RvR2VuZXJhdG9yKHJlZ2VuZXJhdG9yUnVudGltZS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFNsYXNoLCBwb3MsIHBhdGgsIGV4dCwgbmV3UGF0aCwgY291bnRlciwgZXhpc3RzO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gX2NhbGxlZSQoX2NvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChfY29udGV4dC5wcmV2ID0gX2NvbnRleHQubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2xhc2ggPSBmdWxscGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0gZnVsbHBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBmdWxscGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dCA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9zID4gLTEgJiYgbGFzdFNsYXNoIDwgcG9zICYmIHBvcyA+IGxhc3RTbGFzaCArIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gZnVsbHBhdGguc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ID0gZnVsbHBhdGguc3Vic3RyaW5nKHBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBmdWxscGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQubmV4dCA9IDk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLl9maWxlRXhpc3RzKG5ld1BhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0cyA9IF9jb250ZXh0LnNlbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQubmV4dCA9IDE4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gcGF0aCArICctJyArIGNvdW50ZXIgKyBleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dC5uZXh0ID0gMTU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLl9maWxlRXhpc3RzKG5ld1BhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdHMgPSBfY29udGV4dC5zZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQubmV4dCA9IDEwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxODpcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXdQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0LnN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIF9jYWxsZWUsIF90aGlzMyk7XG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChfeDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnX2ZpbGVFeGlzdHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2ZpbGVFeGlzdHMoZnVsbHBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3Jlc3RBcGkuVHJlZVNlcnZpY2VBcGkoX2FwaTIuZGVmYXVsdC5nZXRSZXN0Q2xpZW50KCkpO1xuXG4gICAgICAgICAgICAgICAgYXBpLmhlYWROb2RlKGZ1bGxwYXRoKS50aGVuKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLk5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwbG9hZFByZXNpZ25lZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3JlZjIgPSBfYXN5bmNUb0dlbmVyYXRvcihyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBfY2FsbGVlMihjb21wbGV0ZUNhbGxiYWNrLCBwcm9ncmVzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVwb0xpc3QsIHNsdWcsIGZ1bGxQYXRoLCBvdmVyd3JpdGVTdGF0dXM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2VuZXJhdG9yUnVudGltZS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUyJChfY29udGV4dDIpIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQyLnByZXYgPSBfY29udGV4dDIubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwb0xpc3QgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS51c2VyLmdldFJlcG9zaXRvcmllc0xpc3QoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVwb0xpc3QuaGFzKHRoaXMuX3JlcG9zaXRvcnlJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjayhuZXcgRXJyb3IoJ1VuYXV0aG9yaXplZCB3b3Jrc3BhY2UhJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLmFicnVwdCgncmV0dXJuJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsdWcgPSByZXBvTGlzdC5nZXQodGhpcy5fcmVwb3NpdG9yeUlkKS5nZXRTbHVnKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxQYXRoID0gdGhpcy5fdGFyZ2V0Tm9kZS5nZXRQYXRoKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3JlbGF0aXZlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFBhdGggPSBfbGFuZzIuZGVmYXVsdC50cmltUmlnaHQoZnVsbFBhdGgsICcvJykgKyAnLycgKyBfbGFuZzIuZGVmYXVsdC50cmltTGVmdChfcGF0aDIuZGVmYXVsdC5nZXREaXJuYW1lKHRoaXMuX3JlbGF0aXZlUGF0aCksICcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFBhdGggPSBzbHVnICsgJy8nICsgX2xhbmcyLmRlZmF1bHQudHJpbShmdWxsUGF0aCwgJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFBhdGggPSBfbGFuZzIuZGVmYXVsdC50cmltUmlnaHQoZnVsbFBhdGgsICcvJykgKyAnLycgKyBfcGF0aDIuZGVmYXVsdC5nZXRCYXNlbmFtZSh0aGlzLl9maWxlLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZnVsbFBhdGgubm9ybWFsaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsUGF0aCA9IGZ1bGxQYXRoLm5vcm1hbGl6ZSgnTkZDJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVyd3JpdGVTdGF0dXMgPSBfQ29uZmlnczIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldE9wdGlvbihcIkRFRkFVTFRfRVhJU1RJTkdcIiwgXCJ1cGxvYWRfZXhpc3RpbmdcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEob3ZlcndyaXRlU3RhdHVzID09PSAncmVuYW1lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gMTc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gMTQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVfbmV3cGF0aChmdWxsUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsUGF0aCA9IF9jb250ZXh0Mi5zZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDIxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKG92ZXJ3cml0ZVN0YXR1cyA9PT0gJ2FsZXJ0JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gMjE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnbG9iYWwuY29uZmlybShfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaFsxMjRdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAyMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjayhuZXcgRXJyb3IoX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2hbNzFdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuYWJydXB0KCdyZXR1cm4nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjE6XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FwaTIuZGVmYXVsdC5nZXRDbGllbnQoKS51cGxvYWRQcmVzaWduZWQodGhpcy5fZmlsZSwgZnVsbFBhdGgsIGNvbXBsZXRlQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2ssIHByb2dyZXNzQ2FsbGJhY2spLnRoZW4oZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM0LnhociA9IHhocjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuc3RvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgX2NhbGxlZTIsIHRoaXMpO1xuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB1cGxvYWRQcmVzaWduZWQoX3g0LCBfeDUsIF94Nikge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVmMi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXBsb2FkUHJlc2lnbmVkO1xuICAgICAgICB9KClcbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXBsb2FkSXRlbTtcbn0oX1N0YXR1c0l0ZW0zLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBVcGxvYWRJdGVtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5Gb2xkZXJJdGVtID0gZXhwb3J0cy5VcGxvYWRJdGVtID0gZXhwb3J0cy5Db25maWdzID0gZXhwb3J0cy5TdG9yZSA9IHVuZGVmaW5lZDtcblxudmFyIF9TdG9yZSA9IHJlcXVpcmUoJy4vU3RvcmUnKTtcblxudmFyIF9TdG9yZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TdG9yZSk7XG5cbnZhciBfQ29uZmlncyA9IHJlcXVpcmUoJy4vQ29uZmlncycpO1xuXG52YXIgX0NvbmZpZ3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29uZmlncyk7XG5cbnZhciBfVXBsb2FkSXRlbSA9IHJlcXVpcmUoJy4vVXBsb2FkSXRlbScpO1xuXG52YXIgX1VwbG9hZEl0ZW0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVXBsb2FkSXRlbSk7XG5cbnZhciBfRm9sZGVySXRlbSA9IHJlcXVpcmUoJy4vRm9sZGVySXRlbScpO1xuXG52YXIgX0ZvbGRlckl0ZW0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRm9sZGVySXRlbSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuU3RvcmUgPSBfU3RvcmUyLmRlZmF1bHQ7XG5leHBvcnRzLkNvbmZpZ3MgPSBfQ29uZmlnczIuZGVmYXVsdDtcbmV4cG9ydHMuVXBsb2FkSXRlbSA9IF9VcGxvYWRJdGVtMi5kZWZhdWx0O1xuZXhwb3J0cy5Gb2xkZXJJdGVtID0gX0ZvbGRlckl0ZW0yLmRlZmF1bHQ7XG4iXX0=
