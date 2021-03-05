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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _StatusItem2 = require('./StatusItem');

var _StatusItem3 = _interopRequireDefault(_StatusItem2);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _cellsSdk = require('cells-sdk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FolderItem = function (_StatusItem) {
    _inherits(FolderItem, _StatusItem);

    function FolderItem(path, targetNode) {
        var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, FolderItem);

        var _this = _possibleConstructorReturn(this, (FolderItem.__proto__ || Object.getPrototypeOf(FolderItem)).call(this, 'folder', targetNode, parent));

        _this._new = true;
        _this._label = _path2.default.getBasename(path);
        _this.children.pg[_this.getId()] = 0;
        if (parent) {
            parent.addChild(_this);
        }
        return _this;
    }

    _createClass(FolderItem, [{
        key: 'isNew',
        value: function isNew() {
            return this._new;
        }
    }, {
        key: '_doProcess',
        value: function _doProcess(completeCallback) {
            var _this2 = this;

            var fullPath = void 0;
            try {
                fullPath = this.getFullPath();
            } catch (e) {
                this.setStatus(_StatusItem3.default.StatusError);
                return;
            }

            var api = new _cellsSdk.TreeServiceApi(_api2.default.getRestClient());
            var request = new _cellsSdk.RestCreateNodesRequest();
            var node = new _cellsSdk.TreeNode();

            node.Path = fullPath;
            node.Type = _cellsSdk.TreeNodeType.constructFromObject('COLLECTION');
            request.Nodes = [node];

            api.createNodes(request).then(function (collection) {
                _this2.setStatus(_StatusItem3.default.StatusLoaded);
                _this2.children.pg[_this2.getId()] = 100;
                _this2.recomputeProgress();
                completeCallback();
            });
        }
    }]);

    return FolderItem;
}(_StatusItem3.default);

exports.default = FolderItem;

},{"./StatusItem":5,"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/path":"pydio/util/path"}],3:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PartItem = function (_StatusItem) {
    _inherits(PartItem, _StatusItem);

    function PartItem(parent, index) {
        _classCallCheck(this, PartItem);

        var _this = _possibleConstructorReturn(this, (PartItem.__proto__ || Object.getPrototypeOf(PartItem)).call(this, 'part', null, parent));

        _this._label = 'Part ' + index;
        return _this;
    }

    _createClass(PartItem, [{
        key: 'setProgress',
        value: function setProgress(newValue) {
            var bytes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            this._progress = newValue;
            this.notify('progress', newValue);
            if (bytes !== null) {
                this.notify('bytes', bytes);
            }
        }
    }]);

    return PartItem;
}(_StatusItem3.default);

exports.default = PartItem;

},{"./StatusItem":5,"pydio":"pydio"}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _FolderItem2 = require('./FolderItem');

var _FolderItem3 = _interopRequireDefault(_FolderItem2);

var _StatusItem = require('./StatusItem');

var _StatusItem2 = _interopRequireDefault(_StatusItem);

var _cellsSdk = require('cells-sdk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Session = function (_FolderItem) {
    _inherits(Session, _FolderItem);

    function Session(repositoryId, targetNode) {
        _classCallCheck(this, Session);

        var _this = _possibleConstructorReturn(this, (Session.__proto__ || Object.getPrototypeOf(Session)).call(this, '/', targetNode));

        _this._repositoryId = repositoryId;
        _this._status = _StatusItem2.default.StatusAnalyze;
        delete _this.children.pg[_this.getId()];
        return _this;
    }

    _createClass(Session, [{
        key: 'getFullPath',
        value: function getFullPath() {
            var repoList = _pydio2.default.getInstance().user.getRepositoriesList();
            if (!repoList.has(this._repositoryId)) {
                throw new Error("Repository disconnected?");
            }
            var slug = repoList.get(this._repositoryId).getSlug();
            var fullPath = this._targetNode.getPath();
            fullPath = LangUtils.trimRight(fullPath, '/');
            if (fullPath.normalize) {
                fullPath = fullPath.normalize('NFC');
            }
            fullPath = slug + fullPath;
            return fullPath;
        }
    }, {
        key: 'treeViewFromMaterialPath',
        value: function treeViewFromMaterialPath(merged) {
            var tree = [];
            Object.keys(merged).forEach(function (path) {

                var pathParts = path.split('/');
                pathParts.shift();
                var currentLevel = tree;
                pathParts.forEach(function (part) {
                    var existingPath = currentLevel.find(function (data) {
                        return data.name === part;
                    });
                    if (existingPath) {
                        currentLevel = existingPath.children;
                    } else {
                        var newPart = {
                            name: part,
                            item: merged[path],
                            path: path,
                            children: []
                        };
                        currentLevel.push(newPart);
                        currentLevel = newPart.children;
                    }
                });
            });
            return tree;
        }
    }, {
        key: 'bulkStatSliced',
        value: function bulkStatSliced(api, nodePaths, sliceSize) {
            var p = Promise.resolve({ Nodes: [] });
            var slice = nodePaths.slice(0, sliceSize);

            var _loop = function _loop() {
                nodePaths = nodePaths.slice(sliceSize);
                var request = new _cellsSdk.RestGetBulkMetaRequest();
                request.NodePaths = slice;
                p = p.then(function (r) {
                    return api.bulkStatNodes(request).then(function (response) {
                        r.Nodes = r.Nodes.concat(response.Nodes || []);
                        return r;
                    });
                });
                slice = nodePaths.slice(0, sliceSize);
            };

            while (slice.length) {
                _loop();
            }
            return p;
        }
    }, {
        key: 'prepare',
        value: function prepare(overwriteStatus) {
            var _this2 = this;

            if (overwriteStatus === 'overwrite') {
                this.setStatus('ready');
                return Promise.resolve();
            }
            var conf = _pydio2.default.getInstance().getPluginConfigs("uploader.html").get("DEFAULT_STAT_SLICES");
            var sliceSize = 400;
            if (conf && !isNaN(parseInt(conf))) {
                sliceSize = parseInt(conf);
            }

            this.setStatus(_StatusItem2.default.StatusAnalyze);
            var api = new _cellsSdk.TreeServiceApi(_api2.default.getRestClient());
            var request = new _cellsSdk.RestGetBulkMetaRequest();
            request.NodePaths = [];
            var walkType = 'both';
            if (overwriteStatus === 'rename') {
                walkType = 'file';
            }

            this.walk(function (item) {
                request.NodePaths.push(item.getFullPath());
            }, function () {
                return true;
            }, walkType);

            return new Promise(function (resolve, reject) {
                var proms = [];
                _this2.bulkStatSliced(api, request.NodePaths, sliceSize).then(function (response) {
                    if (!response.Nodes || !response.Nodes.length) {
                        _this2.setStatus('ready');
                        resolve(proms);
                        return;
                    }

                    if (overwriteStatus === 'alert') {
                        _this2.setStatus('confirm');
                        resolve();
                        return;
                    }
                    var itemStated = function itemStated(item) {
                        return response.Nodes.map(function (n) {
                            return n.Path;
                        }).indexOf(item.getFullPath()) !== -1;
                    };

                    var renameFiles = function renameFiles() {
                        _this2.walk(function (item) {
                            if (itemStated(item)) {
                                proms.push(new Promise(function () {
                                    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve1) {
                                        var newPath, newLabel;
                                        return regeneratorRuntime.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _context.next = 2;
                                                        return _this2.newPath(item.getFullPath());

                                                    case 2:
                                                        newPath = _context.sent;
                                                        newLabel = _path2.default.getBasename(newPath);

                                                        item.updateLabel(newLabel);
                                                        resolve1();

                                                    case 6:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this2);
                                    }));

                                    return function (_x) {
                                        return _ref.apply(this, arguments);
                                    };
                                }()));
                            }
                        }, function () {
                            return true;
                        }, 'file');
                        return Promise.all(proms);
                    };

                    if (overwriteStatus === 'rename-folders') {
                        var folderProms = [];
                        var folderProm = Promise.resolve();
                        _this2.walk(function (item) {
                            folderProm = folderProm.then(_asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                                var newPath, newLabel;
                                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                if (!itemStated(item)) {
                                                    _context2.next = 6;
                                                    break;
                                                }

                                                _context2.next = 3;
                                                return _this2.newPath(item.getFullPath());

                                            case 3:
                                                newPath = _context2.sent;
                                                newLabel = _path2.default.getBasename(newPath);

                                                item.updateLabel(newLabel);

                                            case 6:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, _this2);
                            })));
                        }, function () {
                            return true;
                        }, 'folder');
                        folderProm.then(function () {
                            return renameFiles();
                        }).then(function (proms) {
                            _this2.setStatus('ready');
                            resolve(proms);
                        });
                    } else {
                        renameFiles().then(function (proms) {
                            _this2.setStatus('ready');
                            resolve(proms);
                        });
                    }
                });
            });
        }
    }, {
        key: 'newPath',
        value: function newPath(fullpath) {
            var _this3 = this;

            return new Promise(function () {
                var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(resolve) {
                    var lastSlash, pos, path, ext, newPath, counter, exists;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
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
                                    exists = true;

                                case 8:
                                    if (!exists) {
                                        _context3.next = 16;
                                        break;
                                    }

                                    newPath = path + '-' + counter + ext;
                                    counter++;
                                    _context3.next = 13;
                                    return _this3.nodeExists(newPath);

                                case 13:
                                    exists = _context3.sent;
                                    _context3.next = 8;
                                    break;

                                case 16:

                                    resolve(newPath);

                                case 17:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee3, _this3);
                }));

                return function (_x2) {
                    return _ref3.apply(this, arguments);
                };
            }());
        }
    }, {
        key: 'nodeExists',
        value: function nodeExists(fullpath) {
            return new Promise(function (resolve) {
                var api = new _cellsSdk.TreeServiceApi(_api2.default.getRestClient());
                var request = new _cellsSdk.RestGetBulkMetaRequest();
                request.NodePaths = [fullpath];
                api.bulkStatNodes(request).then(function (response) {
                    if (response.Nodes && response.Nodes[0]) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(function () {
                    return resolve(false);
                });
            });
        }
    }]);

    return Session;
}(_FolderItem3.default);

exports.default = Session;

},{"./FolderItem":2,"./StatusItem":5,"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/path":"pydio/util/path"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observable = require('pydio/lang/observable');

var _observable2 = _interopRequireDefault(_observable);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StatusItem = function (_Observable) {
    _inherits(StatusItem, _Observable);

    function StatusItem(type, targetNode) {
        var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, StatusItem);

        var _this = _possibleConstructorReturn(this, (StatusItem.__proto__ || Object.getPrototypeOf(StatusItem)).call(this));

        _this._status = StatusItem.StatusNew;
        _this._type = type;
        _this._id = Math.random();
        _this._errorMessage = null;
        var pydio = _pydio2.default.getInstance();
        _this._repositoryId = parent ? parent.getRepositoryId() : pydio.user.activeRepository;
        _this._exists = false;
        _this._progress = 0;
        _this.children = { folders: [], files: [], pg: {} };
        _this._targetNode = targetNode;
        if (parent) {
            _this._parent = parent;
            if (type === StatusItem.TypeFolder) {
                parent.children.folders.push(_this);
            } else {
                parent.children.files.push(_this);
            }
        }
        return _this;
    }

    _createClass(StatusItem, [{
        key: 'getId',
        value: function getId() {
            return this._id;
        }
    }, {
        key: 'getParent',
        value: function getParent() {
            return this._parent;
        }
    }, {
        key: 'getLabel',
        value: function getLabel() {
            if (this._label.normalize) {
                return this._label.normalize('NFC');
            } else {
                return this._label;
            }
        }
    }, {
        key: 'updateLabel',
        value: function updateLabel(label) {
            this._label = label;
        }
    }, {
        key: 'getFullPath',
        value: function getFullPath() {
            return this._parent.getFullPath() + '/' + this.getLabel();
        }
    }, {
        key: 'getProgress',
        value: function getProgress() {
            return this._progress;
        }
    }, {
        key: 'setExists',
        value: function setExists() {
            this._exists = true;
        }
    }, {
        key: 'getExists',
        value: function getExists() {
            return this._exists;
        }
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
            this.notify('status', status);
        }
    }, {
        key: 'updateRepositoryId',
        value: function updateRepositoryId(repositoryId) {
            this._repositoryId = repositoryId;
        }
    }, {
        key: 'getRepositoryId',
        value: function getRepositoryId() {
            return this._repositoryId;
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
            this.setStatus(StatusItem.StatusError);
        }
    }, {
        key: 'process',
        value: function process(completeCallback) {
            this._doProcess(completeCallback);
        }
    }, {
        key: 'abort',
        value: function abort(completeCallback) {
            if (this._doAbort) {
                this._doAbort(completeCallback);
            }
        }
    }, {
        key: 'pause',
        value: function pause() {
            if (this._doPause) {
                var status = this._doPause();
                this.setStatus(status);
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            if (this._doResume) {
                this._doResume();
                this.setStatus(StatusItem.StatusLoading);
            }
        }
    }, {
        key: 'addChild',
        value: function addChild(child) {
            var _this2 = this;

            this.children.pg[child.getId()] = 0;
            child.observe('progress', function (progress) {
                _this2.children.pg[child.getId()] = progress;
                _this2.recomputeProgress();
            });
        }
    }, {
        key: 'recomputeProgress',
        value: function recomputeProgress() {
            var _this3 = this;

            var accu = Object.keys(this.children.pg).map(function (k) {
                return _this3.children.pg[k];
            });
            if (accu.length) {
                var sum = accu.reduce(function (a, b) {
                    return a + b;
                });
                this._progress = sum / accu.length;
                this.notify('progress', this._progress);
            }
        }
    }, {
        key: 'removeChild',
        value: function removeChild(child) {

            child.abort();
            child.walk(function (c) {
                c.abort();
            }, function () {
                return true;
            }, StatusItem.TypeFile);

            var id = child.getId();
            var folderIndex = this.children.folders.indexOf(child);
            var fileIndex = this.children.files.indexOf(child);

            var removed = false;
            if (folderIndex > -1) {
                this.children.folders = LangUtils.arrayWithout(this.children.folders, folderIndex);
                removed = true;
            } else if (fileIndex > -1) {
                this.children.files = LangUtils.arrayWithout(this.children.files, fileIndex);
                removed = true;
            }
            if (removed) {
                child.stopObserving('progress');

                delete this.children.pg[id];
                this.recomputeProgress();
                this.notify('children');
            }
        }
    }, {
        key: 'getChildren',
        value: function getChildren() {
            return [].concat(_toConsumableArray(this.children.folders), _toConsumableArray(this.children.files));
        }
    }, {
        key: 'walk',
        value: function walk(callback) {
            var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
                return true;
            };
            var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : StatusItem.TypeBoth;
            var stop = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (item) {
                return false;
            };

            var stopped = false;
            if (type === StatusItem.TypeBoth || type === StatusItem.TypeFile) {
                var files = this.children.files;
                for (var i = 0; i < files.length; i++) {
                    if (stop(files[i])) {
                        stopped = true;
                        break;
                    }
                    if (filter(files[i])) {
                        callback(files[i]);
                    }
                }
            }
            if (stopped) {
                return;
            }
            this.children.folders.forEach(function (child) {
                if ((type === StatusItem.TypeFolder || type === StatusItem.TypeBoth) && filter(child)) {
                    callback(child);
                }
                if (!stop(child)) {
                    child.walk(callback, filter, type, stop);
                }
            });
        }
    }, {
        key: 'collectWithLimit',
        value: function collectWithLimit(limit) {
            var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
                return true;
            };
            var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'both';

            var accu = [];
            var callback = function callback(item) {
                accu.push(item);
            };
            var stop = function stop(item) {
                return accu.length >= limit;
            };
            this.walk(callback, filter, type, stop);
            return accu;
        }
    }]);

    return StatusItem;
}(_observable2.default);

StatusItem.StatusNew = 'new';
StatusItem.StatusAnalyze = 'analyse';
StatusItem.StatusLoading = 'loading';
StatusItem.StatusLoaded = 'loaded';
StatusItem.StatusError = 'error';
StatusItem.StatusPause = 'pause';
StatusItem.StatusCannotPause = 'cannot-pause';
StatusItem.StatusMultiPause = 'multi-pause';

StatusItem.TypeFolder = 'folder';
StatusItem.TypeFile = 'file';
StatusItem.TypeBoth = 'both';

exports.default = StatusItem;

},{"pydio":"pydio","pydio/lang/observable":"pydio/lang/observable"}],6:[function(require,module,exports){
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

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Configs":1,"./FolderItem":2,"./Session":4,"./StatusItem":5,"./Task":7,"./UploadItem":8,"cells-sdk":"cells-sdk","lodash.debounce":"lodash.debounce","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/lang/observable":"pydio/lang/observable","pydio/util/lang":"pydio/util/lang","pydio/util/path":"pydio/util/path"}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _cellsSdk = require('cells-sdk');

var _StatusItem = require('./StatusItem');

var _StatusItem2 = _interopRequireDefault(_StatusItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Pydio$requireLib = _pydio2.default.requireLib("boot"),
    JobsStore = _Pydio$requireLib.JobsStore;

var Task = function () {
    function Task(session) {
        var _this = this;

        _classCallCheck(this, Task);

        pydio = _pydio2.default.getInstance();
        this.job = new _cellsSdk.JobsJob();
        this.job.ID = 'local-upload-task-' + session.getId();
        this.job.Owner = pydio.user.id;
        this.job.Label = pydio.MessageHash['html_uploader.task.label'];
        this.job.Stoppable = true;
        var task = new _cellsSdk.JobsTask();
        this.task = task;
        this.job.Tasks = [this.task];
        this.task.HasProgress = true;
        this.task.ID = "upload";
        this.task.Status = _cellsSdk.JobsTaskStatus.constructFromObject('Idle');
        this.job.openDetailPane = function () {
            pydio.Controller.fireAction("upload");
        };

        task._statusObserver = function (s) {
            if (s === _StatusItem2.default.StatusAnalyze) {
                _this.job.Label = 'Preparing files for upload';
                if (session.getChildren().length) {
                    task.StatusMessage = 'Analyzing (' + session.getChildren().length + ') items';
                } else {
                    task.StatusMessage = 'Please wait...';
                }
                task.Status = _cellsSdk.JobsTaskStatus.constructFromObject('Running');
            } else if (s === 'ready') {
                _this.job.Label = pydio.MessageHash['html_uploader.7'];
                task.StatusMessage = 'Ready to upload';
                task.Status = _cellsSdk.JobsTaskStatus.constructFromObject('Idle');
            } else if (s === 'paused') {
                _this.job.Label = 'Task paused';
                task.Status = _cellsSdk.JobsTaskStatus.constructFromObject('Paused');
            }
            _this.notifyMainStore();
        };
        task._progressObserver = function (p) {
            task.Progress = p / 100;
            task.Status = _cellsSdk.JobsTaskStatus.constructFromObject('Running');
            if (p > 0) {
                task.StatusMessage = 'Uploading ' + Math.ceil(p) + '%';
            }
            _this.notifyMainStore();
        };
        session.observe('status', task._statusObserver);
        session.observe('progress', task._progressObserver);

        task._statusObserver(session.getStatus());
        task._progressObserver(session.getProgress());

        JobsStore.getInstance().enqueueLocalJob(this.job);
    }

    _createClass(Task, [{
        key: 'setIdle',
        value: function setIdle() {
            this.task.Status = _cellsSdk.JobsTaskStatus.constructFromObject('Idle');
            this.task.StatusMessage = '';
            this.notifyMainStore();
        }
    }, {
        key: 'notifyMainStore',
        value: function notifyMainStore() {
            this.task.StartTime = new Date().getTime() / 1000;
            this.job.Tasks = [this.task];
            JobsStore.getInstance().enqueueLocalJob(this.job);
        }
    }], [{
        key: 'create',
        value: function create(session) {
            return new Task(session);
        }
    }]);

    return Task;
}();

exports.default = Task;

},{"./StatusItem":5,"cells-sdk":"cells-sdk","pydio":"pydio"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StatusItem2 = require('./StatusItem');

var _StatusItem3 = _interopRequireDefault(_StatusItem2);

var _PartItem = require('./PartItem');

var _PartItem2 = _interopRequireDefault(_PartItem);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _Configs = require('./Configs');

var _Configs2 = _interopRequireDefault(_Configs);

var _cellsSdk = require('cells-sdk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UploadItem = function (_StatusItem) {
    _inherits(UploadItem, _StatusItem);

    function UploadItem(file, targetNode) {
        var relativePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        _classCallCheck(this, UploadItem);

        var _this = _possibleConstructorReturn(this, (UploadItem.__proto__ || Object.getPrototypeOf(UploadItem)).call(this, 'file', targetNode, parent));

        _this._file = file;
        _this._status = 'new';
        if (relativePath) {
            _this._label = _path2.default.getBasename(relativePath);
        } else {
            _this._label = file.name;
        }
        if (file.size > _api2.default.getMultipartThreshold()) {
            _this.createParts();
        }
        if (parent) {
            parent.addChild(_this);
        }
        return _this;
    }

    _createClass(UploadItem, [{
        key: 'createParts',
        value: function createParts() {
            var partSize = _api2.default.getMultipartPartSize();
            this._parts = [];
            for (var i = 0; i < Math.ceil(this._file.size / partSize); i++) {
                this._parts.push(new _PartItem2.default(this, i + 1));
            }
        }
    }, {
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
        key: 'getHumanSize',
        value: function getHumanSize() {
            return _path2.default.roundFileSize(this._file.size);
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

            this._userAborted = false;

            var complete = function complete() {
                _this2.setStatus(_StatusItem3.default.StatusLoaded);
                _this2._parseXHRResponse();
                completeCallback();
            };

            var progress = function progress(computableEvent) {
                if (_this2._status === _StatusItem3.default.StatusError) {
                    return;
                }
                if (!computableEvent.total) {
                    return;
                }
                var percentage = Math.round(computableEvent.loaded * 100 / computableEvent.total);
                var bytesLoaded = computableEvent.loaded;
                _this2.setProgress(percentage, bytesLoaded);

                if (_this2._parts && computableEvent.part && _this2._parts[computableEvent.part - 1] && computableEvent.partLoaded && computableEvent.partTotal) {
                    var part = _this2._parts[computableEvent.part - 1];
                    var _progress = Math.round(computableEvent.partLoaded * 100 / computableEvent.partTotal);
                    if (_progress < 100) {
                        if (part.getStatus() !== _StatusItem3.default.StatusCannotPause) {
                            part.setStatus(_StatusItem3.default.StatusLoading);
                        }
                    } else {
                        var checkPause = part.getStatus() === _StatusItem3.default.StatusCannotPause;
                        part.setStatus(_StatusItem3.default.StatusLoaded);
                        if (checkPause) {
                            if (_this2._parts.filter(function (p) {
                                return part.getStatus() === _StatusItem3.default.StatusCannotPause;
                            }).length === 0) {
                                _this2.setStatus(_StatusItem3.default.StatusPause);
                            }
                        }
                    }
                    part.setProgress(_progress, computableEvent.partLoaded);
                }
            };

            var messages = _pydio2.default.getMessages();
            var error = function error(e) {
                _this2.onError(messages[210] + ": " + e.message);
                completeCallback();
            };

            var MAX_RETRIES = 2;
            var BACK_OFF = 150;
            var retry = function retry(count) {
                return function (e) {
                    if (e && e.indexOf) {
                        if (e.indexOf('422') >= 0) {
                            error(new Error(messages['html_uploader.status.error.422'] + ' (422)'));
                            return;
                        } else if (e.indexOf('403') >= 0) {
                            error(new Error(messages['html_uploader.status.error.403'] + ' (403)'));
                            return;
                        }
                    }
                    if (_this2._userAborted) {
                        if (e) {
                            error(e);
                        } else {
                            error(new Error(messages['html_uploader.status.error.aborted']));
                        }
                        return;
                    }
                    if (count >= MAX_RETRIES) {
                        error(e);
                    } else {
                        window.setTimeout(function () {
                            _this2.uploadPresigned(complete, progress, retry(++count));
                        }, BACK_OFF * count);
                    }
                };
            };

            this.setStatus(_StatusItem3.default.StatusLoading);

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
                    this._userAborted = true;
                    this.xhr.abort();
                } catch (e) {}
            }
            this.setStatus(_StatusItem3.default.StatusError);
            this.setProgress(0);
        }
    }, {
        key: '_doPause',
        value: function _doPause() {
            if (this.xhr) {
                if (this.xhr.pause) {
                    this.xhr.pause();
                    if (this._parts && this._parts.length) {
                        this._parts.filter(function (p) {
                            return p.getStatus() === _StatusItem3.default.StatusLoading;
                        }).forEach(function (p) {
                            return p.setStatus(_StatusItem3.default.StatusCannotPause);
                        });
                    }
                    return _StatusItem3.default.StatusMultiPause;
                } else {
                    return _StatusItem3.default.StatusCannotPause;
                }
            }
            return _StatusItem3.default.StatusNew;
        }
    }, {
        key: '_doResume',
        value: function _doResume() {
            if (this.xhr && this.xhr.resume) {
                this.xhr.resume();
            }
        }
    }, {
        key: 'uploadPresigned',
        value: function uploadPresigned(completeCallback, progressCallback, errorCallback) {
            var _this3 = this;

            var fullPath = void 0;
            try {
                fullPath = this.getFullPath();
            } catch (e) {
                this.setStatus(_StatusItem3.default.StatusError);
                this.setProgress(0);
                return;
            }

            if (this.getSize() < _api2.default.getMultipartThreshold()) {
                _api2.default.getClient().uploadPresigned(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(function (xhr) {
                    _this3.xhr = xhr;
                });
            } else {
                _api2.default.getClient().uploadMultipart(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(function (managed) {
                    _this3.xhr = managed;
                });
            }
        }
    }]);

    return UploadItem;
}(_StatusItem3.default);

exports.default = UploadItem;

},{"./Configs":1,"./PartItem":3,"./StatusItem":5,"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/path":"pydio/util/path"}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PartItem = exports.Session = exports.FolderItem = exports.UploadItem = exports.Configs = exports.Store = undefined;

var _Store = require('./Store');

var _Store2 = _interopRequireDefault(_Store);

var _Configs = require('./Configs');

var _Configs2 = _interopRequireDefault(_Configs);

var _UploadItem = require('./UploadItem');

var _UploadItem2 = _interopRequireDefault(_UploadItem);

var _FolderItem = require('./FolderItem');

var _FolderItem2 = _interopRequireDefault(_FolderItem);

var _PartItem = require('./PartItem');

var _PartItem2 = _interopRequireDefault(_PartItem);

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Store = _Store2.default;
exports.Configs = _Configs2.default;
exports.UploadItem = _UploadItem2.default;
exports.FolderItem = _FolderItem2.default;
exports.Session = _Session2.default;
exports.PartItem = _PartItem2.default;

},{"./Configs":1,"./FolderItem":2,"./PartItem":3,"./Session":4,"./Store":6,"./UploadItem":8}]},{},[9])(9)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANS4wLjEvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2J1aWxkL21vZGVsL0NvbmZpZ3MuanMiLCJqcy9idWlsZC9tb2RlbC9Gb2xkZXJJdGVtLmpzIiwianMvYnVpbGQvbW9kZWwvUGFydEl0ZW0uanMiLCJqcy9idWlsZC9tb2RlbC9TZXNzaW9uLmpzIiwianMvYnVpbGQvbW9kZWwvU3RhdHVzSXRlbS5qcyIsImpzL2J1aWxkL21vZGVsL1N0b3JlLmpzIiwianMvYnVpbGQvbW9kZWwvVGFzay5qcyIsImpzL2J1aWxkL21vZGVsL1VwbG9hZEl0ZW0uanMiLCJqcy9idWlsZC9tb2RlbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2bUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX29ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9vYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29ic2VydmFibGUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBDb25maWdzID0gZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKENvbmZpZ3MsIF9PYnNlcnZhYmxlKTtcblxuICAgIF9jcmVhdGVDbGFzcyhDb25maWdzLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdnZXRJbnN0YW5jZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0YW5jZSgpIHtcbiAgICAgICAgICAgIGlmICghQ29uZmlncy5fX0lOU1RBTkNFKSB7XG4gICAgICAgICAgICAgICAgQ29uZmlncy5fX0lOU1RBTkNFID0gbmV3IENvbmZpZ3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBDb25maWdzLl9fSU5TVEFOQ0U7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICBmdW5jdGlvbiBDb25maWdzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29uZmlncyk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKENvbmZpZ3MuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihDb25maWdzKSkuY2FsbCh0aGlzKSk7XG5cbiAgICAgICAgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkub2JzZXJ2ZShcInJlZ2lzdHJ5X2xvYWRlZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9nbG9iYWwgPSBudWxsO1xuICAgICAgICB9LmJpbmQoX3RoaXMpKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDb25maWdzLCBbe1xuICAgICAgICBrZXk6ICdfbG9hZE9wdGlvbnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2xvYWRPcHRpb25zKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9nbG9iYWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9nbG9iYWwgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRQbHVnaW5Db25maWdzKFwidXBsb2FkZXJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE9wdGlvbkFzQm9vbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRPcHRpb25Bc0Jvb2wobmFtZSkge1xuICAgICAgICAgICAgdmFyIHVzZXJQcmVmID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcbiAgICAgICAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdmFyIG8gPSB0aGlzLmdldE9wdGlvbihuYW1lLCB1c2VyUHJlZiwgZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBvID09PSB0cnVlIHx8IG8gPT09ICd0cnVlJztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0T3B0aW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE9wdGlvbihuYW1lKSB7XG4gICAgICAgICAgICB2YXIgdXNlclByZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICAgICAgICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0aGlzLl9sb2FkT3B0aW9ucygpO1xuICAgICAgICAgICAgaWYgKHVzZXJQcmVmKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRlc3QgPSBDb25maWdzLmdldFVzZXJQcmVmZXJlbmNlKCdvcmlnaW5hbFVwbG9hZEZvcm1fWEhSVXBsb2FkZXInLCB1c2VyUHJlZik7XG4gICAgICAgICAgICAgICAgaWYgKHRlc3QgIT09IHVuZGVmaW5lZCAmJiB0ZXN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9nbG9iYWwuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dsb2JhbC5nZXQobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEF1dG9TdGFydCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRBdXRvU3RhcnQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb25Bc0Jvb2woXCJERUZBVUxUX0FVVE9fU1RBUlRcIiwgXCJ1cGxvYWRfYXV0b19zZW5kXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRBdXRvQ2xvc2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0QXV0b0Nsb3NlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uQXNCb29sKFwiREVGQVVMVF9BVVRPX0NMT1NFXCIsIFwidXBsb2FkX2F1dG9fY2xvc2VcIik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZU9wdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVPcHRpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBpc0Jvb2wgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoaXNCb29sKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQ29uZmlncy5zZXRVc2VyUHJlZmVyZW5jZSgnb3JpZ2luYWxVcGxvYWRGb3JtX1hIUlVwbG9hZGVyJywgbmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoXCJjaGFuZ2VcIik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2V4dGVuc2lvbkFsbG93ZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZXh0ZW5zaW9uQWxsb3dlZCh1cGxvYWRJdGVtKSB7XG4gICAgICAgICAgICB2YXIgZXh0U3RyaW5nID0gdGhpcy5nZXRPcHRpb24oXCJBTExPV0VEX0VYVEVOU0lPTlNcIiwgJycsICcnKTtcbiAgICAgICAgICAgIGlmICghZXh0U3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGV4dERlc2NyaXB0aW9uID0gdGhpcy5nZXRPcHRpb24oXCJBTExPV0VEX0VYVEVOU0lPTlNfUkVBREFCTEVcIiwgJycsICcnKTtcbiAgICAgICAgICAgIGlmIChleHREZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgIGV4dERlc2NyaXB0aW9uID0gJyAoJyArIGV4dERlc2NyaXB0aW9uICsgJyknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGl0ZW1FeHQgPSBfcGF0aDIuZGVmYXVsdC5nZXRGaWxlRXh0ZW5zaW9uKHVwbG9hZEl0ZW0uZ2V0TGFiZWwoKSk7XG4gICAgICAgICAgICBpZiAoZXh0U3RyaW5nLnNwbGl0KCcsJykuaW5kZXhPZihpdGVtRXh0KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2hbMzY3XSArIGV4dFN0cmluZyArIGV4dERlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdnZXRVc2VyUHJlZmVyZW5jZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRVc2VyUHJlZmVyZW5jZShndWlFbGVtZW50SWQsIHByZWZOYW1lKSB7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIGlmICghcHlkaW8udXNlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGd1aV9wcmVmID0gcHlkaW8udXNlci5nZXRQcmVmZXJlbmNlKFwiZ3VpX3ByZWZlcmVuY2VzXCIsIHRydWUpO1xuICAgICAgICAgICAgaWYgKCFndWlfcHJlZiB8fCAhZ3VpX3ByZWZbZ3VpRWxlbWVudElkXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSAmJiBndWlfcHJlZltndWlFbGVtZW50SWRdWydyZXBvLScgKyBweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGd1aV9wcmVmW2d1aUVsZW1lbnRJZF1bJ3JlcG8tJyArIHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeV1bcHJlZk5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGd1aV9wcmVmW2d1aUVsZW1lbnRJZF1bcHJlZk5hbWVdO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRVc2VyUHJlZmVyZW5jZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRVc2VyUHJlZmVyZW5jZShndWlFbGVtZW50SWQsIHByZWZOYW1lLCBwcmVmVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgaWYgKCFweWRpbyB8fCAhcHlkaW8udXNlcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBndWlQcmVmID0gcHlkaW8udXNlci5nZXRQcmVmZXJlbmNlKFwiZ3VpX3ByZWZlcmVuY2VzXCIsIHRydWUpO1xuICAgICAgICAgICAgaWYgKCFndWlQcmVmKSB7XG4gICAgICAgICAgICAgICAgZ3VpUHJlZiA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFndWlQcmVmW2d1aUVsZW1lbnRJZF0pIHtcbiAgICAgICAgICAgICAgICBndWlQcmVmW2d1aUVsZW1lbnRJZF0gPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVwb2tleSA9ICdyZXBvLScgKyBweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnk7XG4gICAgICAgICAgICAgICAgaWYgKCFndWlQcmVmW2d1aUVsZW1lbnRJZF1bcmVwb2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgZ3VpUHJlZltndWlFbGVtZW50SWRdW3JlcG9rZXldID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChndWlQcmVmW2d1aUVsZW1lbnRJZF1bcmVwb2tleV1bcHJlZk5hbWVdICYmIGd1aVByZWZbZ3VpRWxlbWVudElkXVtyZXBva2V5XVtwcmVmTmFtZV0gPT09IHByZWZWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGd1aVByZWZbZ3VpRWxlbWVudElkXVtyZXBva2V5XVtwcmVmTmFtZV0gPSBwcmVmVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChndWlQcmVmW2d1aUVsZW1lbnRJZF1bcHJlZk5hbWVdICYmIGd1aVByZWZbZ3VpRWxlbWVudElkXVtwcmVmTmFtZV0gPT09IHByZWZWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGd1aVByZWZbZ3VpRWxlbWVudElkXVtwcmVmTmFtZV0gPSBwcmVmVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBweWRpby51c2VyLnNldFByZWZlcmVuY2UoXCJndWlfcHJlZmVyZW5jZXNcIiwgZ3VpUHJlZiwgdHJ1ZSk7XG4gICAgICAgICAgICBweWRpby51c2VyLnNhdmVQcmVmZXJlbmNlKFwiZ3VpX3ByZWZlcmVuY2VzXCIpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvbmZpZ3M7XG59KF9vYnNlcnZhYmxlMi5kZWZhdWx0KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gQ29uZmlncztcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfU3RhdHVzSXRlbTIgPSByZXF1aXJlKCcuL1N0YXR1c0l0ZW0nKTtcblxudmFyIF9TdGF0dXNJdGVtMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1N0YXR1c0l0ZW0yKTtcblxudmFyIF9wYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXRoKTtcblxudmFyIF9hcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX2FwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGkpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIEZvbGRlckl0ZW0gPSBmdW5jdGlvbiAoX1N0YXR1c0l0ZW0pIHtcbiAgICBfaW5oZXJpdHMoRm9sZGVySXRlbSwgX1N0YXR1c0l0ZW0pO1xuXG4gICAgZnVuY3Rpb24gRm9sZGVySXRlbShwYXRoLCB0YXJnZXROb2RlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEZvbGRlckl0ZW0pO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChGb2xkZXJJdGVtLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRm9sZGVySXRlbSkpLmNhbGwodGhpcywgJ2ZvbGRlcicsIHRhcmdldE5vZGUsIHBhcmVudCkpO1xuXG4gICAgICAgIF90aGlzLl9uZXcgPSB0cnVlO1xuICAgICAgICBfdGhpcy5fbGFiZWwgPSBfcGF0aDIuZGVmYXVsdC5nZXRCYXNlbmFtZShwYXRoKTtcbiAgICAgICAgX3RoaXMuY2hpbGRyZW4ucGdbX3RoaXMuZ2V0SWQoKV0gPSAwO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICBwYXJlbnQuYWRkQ2hpbGQoX3RoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRm9sZGVySXRlbSwgW3tcbiAgICAgICAga2V5OiAnaXNOZXcnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNOZXcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbmV3O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfZG9Qcm9jZXNzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9kb1Byb2Nlc3MoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBmdWxsUGF0aCA9IHZvaWQgMDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZnVsbFBhdGggPSB0aGlzLmdldEZ1bGxQYXRoKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzRXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuVHJlZVNlcnZpY2VBcGkoX2FwaTIuZGVmYXVsdC5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX2NlbGxzU2RrLlJlc3RDcmVhdGVOb2Rlc1JlcXVlc3QoKTtcbiAgICAgICAgICAgIHZhciBub2RlID0gbmV3IF9jZWxsc1Nkay5UcmVlTm9kZSgpO1xuXG4gICAgICAgICAgICBub2RlLlBhdGggPSBmdWxsUGF0aDtcbiAgICAgICAgICAgIG5vZGUuVHlwZSA9IF9jZWxsc1Nkay5UcmVlTm9kZVR5cGUuY29uc3RydWN0RnJvbU9iamVjdCgnQ09MTEVDVElPTicpO1xuICAgICAgICAgICAgcmVxdWVzdC5Ob2RlcyA9IFtub2RlXTtcblxuICAgICAgICAgICAgYXBpLmNyZWF0ZU5vZGVzKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0xvYWRlZCk7XG4gICAgICAgICAgICAgICAgX3RoaXMyLmNoaWxkcmVuLnBnW190aGlzMi5nZXRJZCgpXSA9IDEwMDtcbiAgICAgICAgICAgICAgICBfdGhpczIucmVjb21wdXRlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZUNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBGb2xkZXJJdGVtO1xufShfU3RhdHVzSXRlbTMuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEZvbGRlckl0ZW07XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9TdGF0dXNJdGVtMiA9IHJlcXVpcmUoJy4vU3RhdHVzSXRlbScpO1xuXG52YXIgX1N0YXR1c0l0ZW0zID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU3RhdHVzSXRlbTIpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIFBhcnRJdGVtID0gZnVuY3Rpb24gKF9TdGF0dXNJdGVtKSB7XG4gICAgX2luaGVyaXRzKFBhcnRJdGVtLCBfU3RhdHVzSXRlbSk7XG5cbiAgICBmdW5jdGlvbiBQYXJ0SXRlbShwYXJlbnQsIGluZGV4KSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXJ0SXRlbSk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFBhcnRJdGVtLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoUGFydEl0ZW0pKS5jYWxsKHRoaXMsICdwYXJ0JywgbnVsbCwgcGFyZW50KSk7XG5cbiAgICAgICAgX3RoaXMuX2xhYmVsID0gJ1BhcnQgJyArIGluZGV4O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBhcnRJdGVtLCBbe1xuICAgICAgICBrZXk6ICdzZXRQcm9ncmVzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQcm9ncmVzcyhuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGJ5dGVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzcyA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3Byb2dyZXNzJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgaWYgKGJ5dGVzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2J5dGVzJywgYnl0ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFBhcnRJdGVtO1xufShfU3RhdHVzSXRlbTMuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFBhcnRJdGVtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9hcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX2FwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGkpO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX0ZvbGRlckl0ZW0yID0gcmVxdWlyZSgnLi9Gb2xkZXJJdGVtJyk7XG5cbnZhciBfRm9sZGVySXRlbTMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Gb2xkZXJJdGVtMik7XG5cbnZhciBfU3RhdHVzSXRlbSA9IHJlcXVpcmUoJy4vU3RhdHVzSXRlbScpO1xuXG52YXIgX1N0YXR1c0l0ZW0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU3RhdHVzSXRlbSk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdmFyIGdlbiA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IGZ1bmN0aW9uIHN0ZXAoa2V5LCBhcmcpIHsgdHJ5IHsgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpOyB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlOyB9IGNhdGNoIChlcnJvcikgeyByZWplY3QoZXJyb3IpOyByZXR1cm47IH0gaWYgKGluZm8uZG9uZSkgeyByZXNvbHZlKHZhbHVlKTsgfSBlbHNlIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHsgc3RlcChcIm5leHRcIiwgdmFsdWUpOyB9LCBmdW5jdGlvbiAoZXJyKSB7IHN0ZXAoXCJ0aHJvd1wiLCBlcnIpOyB9KTsgfSB9IHJldHVybiBzdGVwKFwibmV4dFwiKTsgfSk7IH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgU2Vzc2lvbiA9IGZ1bmN0aW9uIChfRm9sZGVySXRlbSkge1xuICAgIF9pbmhlcml0cyhTZXNzaW9uLCBfRm9sZGVySXRlbSk7XG5cbiAgICBmdW5jdGlvbiBTZXNzaW9uKHJlcG9zaXRvcnlJZCwgdGFyZ2V0Tm9kZSkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2Vzc2lvbik7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFNlc3Npb24uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTZXNzaW9uKSkuY2FsbCh0aGlzLCAnLycsIHRhcmdldE5vZGUpKTtcblxuICAgICAgICBfdGhpcy5fcmVwb3NpdG9yeUlkID0gcmVwb3NpdG9yeUlkO1xuICAgICAgICBfdGhpcy5fc3RhdHVzID0gX1N0YXR1c0l0ZW0yLmRlZmF1bHQuU3RhdHVzQW5hbHl6ZTtcbiAgICAgICAgZGVsZXRlIF90aGlzLmNoaWxkcmVuLnBnW190aGlzLmdldElkKCldO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFNlc3Npb24sIFt7XG4gICAgICAgIGtleTogJ2dldEZ1bGxQYXRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEZ1bGxQYXRoKCkge1xuICAgICAgICAgICAgdmFyIHJlcG9MaXN0ID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkudXNlci5nZXRSZXBvc2l0b3JpZXNMaXN0KCk7XG4gICAgICAgICAgICBpZiAoIXJlcG9MaXN0Lmhhcyh0aGlzLl9yZXBvc2l0b3J5SWQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVwb3NpdG9yeSBkaXNjb25uZWN0ZWQ/XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNsdWcgPSByZXBvTGlzdC5nZXQodGhpcy5fcmVwb3NpdG9yeUlkKS5nZXRTbHVnKCk7XG4gICAgICAgICAgICB2YXIgZnVsbFBhdGggPSB0aGlzLl90YXJnZXROb2RlLmdldFBhdGgoKTtcbiAgICAgICAgICAgIGZ1bGxQYXRoID0gTGFuZ1V0aWxzLnRyaW1SaWdodChmdWxsUGF0aCwgJy8nKTtcbiAgICAgICAgICAgIGlmIChmdWxsUGF0aC5ub3JtYWxpemUpIHtcbiAgICAgICAgICAgICAgICBmdWxsUGF0aCA9IGZ1bGxQYXRoLm5vcm1hbGl6ZSgnTkZDJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdWxsUGF0aCA9IHNsdWcgKyBmdWxsUGF0aDtcbiAgICAgICAgICAgIHJldHVybiBmdWxsUGF0aDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndHJlZVZpZXdGcm9tTWF0ZXJpYWxQYXRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRyZWVWaWV3RnJvbU1hdGVyaWFsUGF0aChtZXJnZWQpIHtcbiAgICAgICAgICAgIHZhciB0cmVlID0gW107XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhtZXJnZWQpLmZvckVhY2goZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBwYXRoUGFydHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgcGF0aFBhcnRzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRMZXZlbCA9IHRyZWU7XG4gICAgICAgICAgICAgICAgcGF0aFBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4aXN0aW5nUGF0aCA9IGN1cnJlbnRMZXZlbC5maW5kKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5uYW1lID09PSBwYXJ0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudExldmVsID0gZXhpc3RpbmdQYXRoLmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1BhcnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBtZXJnZWRbcGF0aF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWwucHVzaChuZXdQYXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbCA9IG5ld1BhcnQuY2hpbGRyZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRyZWU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2J1bGtTdGF0U2xpY2VkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGJ1bGtTdGF0U2xpY2VkKGFwaSwgbm9kZVBhdGhzLCBzbGljZVNpemUpIHtcbiAgICAgICAgICAgIHZhciBwID0gUHJvbWlzZS5yZXNvbHZlKHsgTm9kZXM6IFtdIH0pO1xuICAgICAgICAgICAgdmFyIHNsaWNlID0gbm9kZVBhdGhzLnNsaWNlKDAsIHNsaWNlU2l6ZSk7XG5cbiAgICAgICAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgICAgICAgICAgICAgIG5vZGVQYXRocyA9IG5vZGVQYXRocy5zbGljZShzbGljZVNpemUpO1xuICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9jZWxsc1Nkay5SZXN0R2V0QnVsa01ldGFSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5Ob2RlUGF0aHMgPSBzbGljZTtcbiAgICAgICAgICAgICAgICBwID0gcC50aGVuKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcGkuYnVsa1N0YXROb2RlcyhyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgci5Ob2RlcyA9IHIuTm9kZXMuY29uY2F0KHJlc3BvbnNlLk5vZGVzIHx8IFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzbGljZSA9IG5vZGVQYXRocy5zbGljZSgwLCBzbGljZVNpemUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2hpbGUgKHNsaWNlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIF9sb29wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHJlcGFyZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwcmVwYXJlKG92ZXJ3cml0ZVN0YXR1cykge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChvdmVyd3JpdGVTdGF0dXMgPT09ICdvdmVyd3JpdGUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoJ3JlYWR5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNvbmYgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRQbHVnaW5Db25maWdzKFwidXBsb2FkZXIuaHRtbFwiKS5nZXQoXCJERUZBVUxUX1NUQVRfU0xJQ0VTXCIpO1xuICAgICAgICAgICAgdmFyIHNsaWNlU2l6ZSA9IDQwMDtcbiAgICAgICAgICAgIGlmIChjb25mICYmICFpc05hTihwYXJzZUludChjb25mKSkpIHtcbiAgICAgICAgICAgICAgICBzbGljZVNpemUgPSBwYXJzZUludChjb25mKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0yLmRlZmF1bHQuU3RhdHVzQW5hbHl6ZSk7XG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5UcmVlU2VydmljZUFwaShfYXBpMi5kZWZhdWx0LmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBfY2VsbHNTZGsuUmVzdEdldEJ1bGtNZXRhUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxdWVzdC5Ob2RlUGF0aHMgPSBbXTtcbiAgICAgICAgICAgIHZhciB3YWxrVHlwZSA9ICdib3RoJztcbiAgICAgICAgICAgIGlmIChvdmVyd3JpdGVTdGF0dXMgPT09ICdyZW5hbWUnKSB7XG4gICAgICAgICAgICAgICAgd2Fsa1R5cGUgPSAnZmlsZSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMud2FsayhmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuTm9kZVBhdGhzLnB1c2goaXRlbS5nZXRGdWxsUGF0aCgpKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sIHdhbGtUeXBlKTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvbXMgPSBbXTtcbiAgICAgICAgICAgICAgICBfdGhpczIuYnVsa1N0YXRTbGljZWQoYXBpLCByZXF1ZXN0Lk5vZGVQYXRocywgc2xpY2VTaXplKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLk5vZGVzIHx8ICFyZXNwb25zZS5Ob2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0dXMoJ3JlYWR5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHByb21zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdmVyd3JpdGVTdGF0dXMgPT09ICdhbGVydCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0dXMoJ2NvbmZpcm0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbVN0YXRlZCA9IGZ1bmN0aW9uIGl0ZW1TdGF0ZWQoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLk5vZGVzLm1hcChmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuLlBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKGl0ZW0uZ2V0RnVsbFBhdGgoKSkgIT09IC0xO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZW5hbWVGaWxlcyA9IGZ1bmN0aW9uIHJlbmFtZUZpbGVzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLndhbGsoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVN0YXRlZChpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKG5ldyBQcm9taXNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfcmVmID0gX2FzeW5jVG9HZW5lcmF0b3IocmVnZW5lcmF0b3JSdW50aW1lLm1hcmsoZnVuY3Rpb24gX2NhbGxlZShyZXNvbHZlMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdQYXRoLCBuZXdMYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gX2NhbGxlZSQoX2NvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQucHJldiA9IF9jb250ZXh0Lm5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0Lm5leHQgPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMyLm5ld1BhdGgoaXRlbS5nZXRGdWxsUGF0aCgpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IF9jb250ZXh0LnNlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xhYmVsID0gX3BhdGgyLmRlZmF1bHQuZ2V0QmFzZW5hbWUobmV3UGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS51cGRhdGVMYWJlbChuZXdMYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUxKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0LnN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIF9jYWxsZWUsIF90aGlzMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoX3gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSgpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ2ZpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9tcyk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG92ZXJ3cml0ZVN0YXR1cyA9PT0gJ3JlbmFtZS1mb2xkZXJzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvbGRlclByb21zID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9sZGVyUHJvbSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLndhbGsoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJQcm9tID0gZm9sZGVyUHJvbS50aGVuKF9hc3luY1RvR2VuZXJhdG9yKHJlZ2VuZXJhdG9yUnVudGltZS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUyKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UGF0aCwgbmV3TGFiZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBfY2FsbGVlMiQoX2NvbnRleHQyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQyLnByZXYgPSBfY29udGV4dDIubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0ZW1TdGF0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczIubmV3UGF0aChpdGVtLmdldEZ1bGxQYXRoKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBfY29udGV4dDIuc2VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xhYmVsID0gX3BhdGgyLmRlZmF1bHQuZ2V0QmFzZW5hbWUobmV3UGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udXBkYXRlTGFiZWwobmV3TGFiZWwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuc3RvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgX2NhbGxlZTIsIF90aGlzMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICdmb2xkZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlclByb20udGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbmFtZUZpbGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChwcm9tcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0dXMoJ3JlYWR5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShwcm9tcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmFtZUZpbGVzKCkudGhlbihmdW5jdGlvbiAocHJvbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdHVzKCdyZWFkeScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocHJvbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICduZXdQYXRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG5ld1BhdGgoZnVsbHBhdGgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfcmVmMyA9IF9hc3luY1RvR2VuZXJhdG9yKHJlZ2VuZXJhdG9yUnVudGltZS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUzKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RTbGFzaCwgcG9zLCBwYXRoLCBleHQsIG5ld1BhdGgsIGNvdW50ZXIsIGV4aXN0cztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2VuZXJhdG9yUnVudGltZS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUzJChfY29udGV4dDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChfY29udGV4dDMucHJldiA9IF9jb250ZXh0My5uZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTbGFzaCA9IGZ1bGxwYXRoLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSBmdWxscGF0aC5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IGZ1bGxwYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3MgPiAtMSAmJiBsYXN0U2xhc2ggPCBwb3MgJiYgcG9zID4gbGFzdFNsYXNoICsgMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBmdWxscGF0aC5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHQgPSBmdWxscGF0aC5zdWJzdHJpbmcocG9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IGZ1bGxwYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdHMgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAxNjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IHBhdGggKyAnLScgKyBjb3VudGVyICsgZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlcisrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAxMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMubm9kZUV4aXN0cyhuZXdQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RzID0gX2NvbnRleHQzLnNlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE2OlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ld1BhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQzLnN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIF9jYWxsZWUzLCBfdGhpczMpO1xuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoX3gyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVmMy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KCkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdub2RlRXhpc3RzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG5vZGVFeGlzdHMoZnVsbHBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLlRyZWVTZXJ2aWNlQXBpKF9hcGkyLmRlZmF1bHQuZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBfY2VsbHNTZGsuUmVzdEdldEJ1bGtNZXRhUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuTm9kZVBhdGhzID0gW2Z1bGxwYXRoXTtcbiAgICAgICAgICAgICAgICBhcGkuYnVsa1N0YXROb2RlcyhyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuTm9kZXMgJiYgcmVzcG9uc2UuTm9kZXNbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU2Vzc2lvbjtcbn0oX0ZvbGRlckl0ZW0zLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBTZXNzaW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfb2JzZXJ2YWJsZSA9IHJlcXVpcmUoJ3B5ZGlvL2xhbmcvb2JzZXJ2YWJsZScpO1xuXG52YXIgX29ic2VydmFibGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfb2JzZXJ2YWJsZSk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIFN0YXR1c0l0ZW0gPSBmdW5jdGlvbiAoX09ic2VydmFibGUpIHtcbiAgICBfaW5oZXJpdHMoU3RhdHVzSXRlbSwgX09ic2VydmFibGUpO1xuXG4gICAgZnVuY3Rpb24gU3RhdHVzSXRlbSh0eXBlLCB0YXJnZXROb2RlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFN0YXR1c0l0ZW0pO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChTdGF0dXNJdGVtLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoU3RhdHVzSXRlbSkpLmNhbGwodGhpcykpO1xuXG4gICAgICAgIF90aGlzLl9zdGF0dXMgPSBTdGF0dXNJdGVtLlN0YXR1c05ldztcbiAgICAgICAgX3RoaXMuX3R5cGUgPSB0eXBlO1xuICAgICAgICBfdGhpcy5faWQgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICBfdGhpcy5fZXJyb3JNZXNzYWdlID0gbnVsbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG4gICAgICAgIF90aGlzLl9yZXBvc2l0b3J5SWQgPSBwYXJlbnQgPyBwYXJlbnQuZ2V0UmVwb3NpdG9yeUlkKCkgOiBweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnk7XG4gICAgICAgIF90aGlzLl9leGlzdHMgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuX3Byb2dyZXNzID0gMDtcbiAgICAgICAgX3RoaXMuY2hpbGRyZW4gPSB7IGZvbGRlcnM6IFtdLCBmaWxlczogW10sIHBnOiB7fSB9O1xuICAgICAgICBfdGhpcy5fdGFyZ2V0Tm9kZSA9IHRhcmdldE5vZGU7XG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgIF90aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gU3RhdHVzSXRlbS5UeXBlRm9sZGVyKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuLmZvbGRlcnMucHVzaChfdGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbi5maWxlcy5wdXNoKF90aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFN0YXR1c0l0ZW0sIFt7XG4gICAgICAgIGtleTogJ2dldElkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldElkKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRQYXJlbnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UGFyZW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TGFiZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TGFiZWwoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbGFiZWwubm9ybWFsaXplKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xhYmVsLm5vcm1hbGl6ZSgnTkZDJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9sYWJlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlTGFiZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlTGFiZWwobGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsID0gbGFiZWw7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEZ1bGxQYXRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEZ1bGxQYXRoKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudC5nZXRGdWxsUGF0aCgpICsgJy8nICsgdGhpcy5nZXRMYWJlbCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRQcm9ncmVzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQcm9ncmVzcygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm9ncmVzcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0RXhpc3RzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldEV4aXN0cygpIHtcbiAgICAgICAgICAgIHRoaXMuX2V4aXN0cyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEV4aXN0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFeGlzdHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXhpc3RzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRUeXBlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFR5cGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0U3RhdHVzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFN0YXR1cygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldFN0YXR1cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRTdGF0dXMoc3RhdHVzKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgnc3RhdHVzJywgc3RhdHVzKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlUmVwb3NpdG9yeUlkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVJlcG9zaXRvcnlJZChyZXBvc2l0b3J5SWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcG9zaXRvcnlJZCA9IHJlcG9zaXRvcnlJZDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0UmVwb3NpdG9yeUlkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFJlcG9zaXRvcnlJZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXBvc2l0b3J5SWQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEVycm9yTWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFcnJvck1lc3NhZ2UoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3JNZXNzYWdlIHx8ICcnO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkVycm9yJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uRXJyb3IoZXJyb3JNZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLl9lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXR1cyhTdGF0dXNJdGVtLlN0YXR1c0Vycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHJvY2VzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzKGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRoaXMuX2RvUHJvY2Vzcyhjb21wbGV0ZUNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWJvcnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWJvcnQoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2RvQWJvcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kb0Fib3J0KGNvbXBsZXRlQ2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwYXVzZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYXVzZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kb1BhdXNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXR1cyA9IHRoaXMuX2RvUGF1c2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXR1cyhzdGF0dXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXN1bWUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVzdW1lKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2RvUmVzdW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZG9SZXN1bWUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXR1cyhTdGF0dXNJdGVtLlN0YXR1c0xvYWRpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhZGRDaGlsZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRDaGlsZChjaGlsZCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucGdbY2hpbGQuZ2V0SWQoKV0gPSAwO1xuICAgICAgICAgICAgY2hpbGQub2JzZXJ2ZSgncHJvZ3Jlc3MnLCBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuY2hpbGRyZW4ucGdbY2hpbGQuZ2V0SWQoKV0gPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICBfdGhpczIucmVjb21wdXRlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZWNvbXB1dGVQcm9ncmVzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZWNvbXB1dGVQcm9ncmVzcygpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYWNjdSA9IE9iamVjdC5rZXlzKHRoaXMuY2hpbGRyZW4ucGcpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMuY2hpbGRyZW4ucGdba107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChhY2N1Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBzdW0gPSBhY2N1LnJlZHVjZShmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MgPSBzdW0gLyBhY2N1Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgncHJvZ3Jlc3MnLCB0aGlzLl9wcm9ncmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbW92ZUNoaWxkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUNoaWxkKGNoaWxkKSB7XG5cbiAgICAgICAgICAgIGNoaWxkLmFib3J0KCk7XG4gICAgICAgICAgICBjaGlsZC53YWxrKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgYy5hYm9ydCgpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSwgU3RhdHVzSXRlbS5UeXBlRmlsZSk7XG5cbiAgICAgICAgICAgIHZhciBpZCA9IGNoaWxkLmdldElkKCk7XG4gICAgICAgICAgICB2YXIgZm9sZGVySW5kZXggPSB0aGlzLmNoaWxkcmVuLmZvbGRlcnMuaW5kZXhPZihjaGlsZCk7XG4gICAgICAgICAgICB2YXIgZmlsZUluZGV4ID0gdGhpcy5jaGlsZHJlbi5maWxlcy5pbmRleE9mKGNoaWxkKTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChmb2xkZXJJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb2xkZXJzID0gTGFuZ1V0aWxzLmFycmF5V2l0aG91dCh0aGlzLmNoaWxkcmVuLmZvbGRlcnMsIGZvbGRlckluZGV4KTtcbiAgICAgICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZUluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmZpbGVzID0gTGFuZ1V0aWxzLmFycmF5V2l0aG91dCh0aGlzLmNoaWxkcmVuLmZpbGVzLCBmaWxlSW5kZXgpO1xuICAgICAgICAgICAgICAgIHJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5zdG9wT2JzZXJ2aW5nKCdwcm9ncmVzcycpO1xuXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuY2hpbGRyZW4ucGdbaWRdO1xuICAgICAgICAgICAgICAgIHRoaXMucmVjb21wdXRlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgnY2hpbGRyZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0Q2hpbGRyZW4nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2hpbGRyZW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmNoaWxkcmVuLmZvbGRlcnMpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5jaGlsZHJlbi5maWxlcykpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd3YWxrJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHdhbGsoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogU3RhdHVzSXRlbS5UeXBlQm90aDtcbiAgICAgICAgICAgIHZhciBzdG9wID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzdG9wcGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gU3RhdHVzSXRlbS5UeXBlQm90aCB8fCB0eXBlID09PSBTdGF0dXNJdGVtLlR5cGVGaWxlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGVzID0gdGhpcy5jaGlsZHJlbi5maWxlcztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdG9wKGZpbGVzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyKGZpbGVzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmlsZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0b3BwZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmZvbGRlcnMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICBpZiAoKHR5cGUgPT09IFN0YXR1c0l0ZW0uVHlwZUZvbGRlciB8fCB0eXBlID09PSBTdGF0dXNJdGVtLlR5cGVCb3RoKSAmJiBmaWx0ZXIoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFzdG9wKGNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZC53YWxrKGNhbGxiYWNrLCBmaWx0ZXIsIHR5cGUsIHN0b3ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb2xsZWN0V2l0aExpbWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbGxlY3RXaXRoTGltaXQobGltaXQpIHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogJ2JvdGgnO1xuXG4gICAgICAgICAgICB2YXIgYWNjdSA9IFtdO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gY2FsbGJhY2soaXRlbSkge1xuICAgICAgICAgICAgICAgIGFjY3UucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgc3RvcCA9IGZ1bmN0aW9uIHN0b3AoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhY2N1Lmxlbmd0aCA+PSBsaW1pdDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLndhbGsoY2FsbGJhY2ssIGZpbHRlciwgdHlwZSwgc3RvcCk7XG4gICAgICAgICAgICByZXR1cm4gYWNjdTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTdGF0dXNJdGVtO1xufShfb2JzZXJ2YWJsZTIuZGVmYXVsdCk7XG5cblN0YXR1c0l0ZW0uU3RhdHVzTmV3ID0gJ25ldyc7XG5TdGF0dXNJdGVtLlN0YXR1c0FuYWx5emUgPSAnYW5hbHlzZSc7XG5TdGF0dXNJdGVtLlN0YXR1c0xvYWRpbmcgPSAnbG9hZGluZyc7XG5TdGF0dXNJdGVtLlN0YXR1c0xvYWRlZCA9ICdsb2FkZWQnO1xuU3RhdHVzSXRlbS5TdGF0dXNFcnJvciA9ICdlcnJvcic7XG5TdGF0dXNJdGVtLlN0YXR1c1BhdXNlID0gJ3BhdXNlJztcblN0YXR1c0l0ZW0uU3RhdHVzQ2Fubm90UGF1c2UgPSAnY2Fubm90LXBhdXNlJztcblN0YXR1c0l0ZW0uU3RhdHVzTXVsdGlQYXVzZSA9ICdtdWx0aS1wYXVzZSc7XG5cblN0YXR1c0l0ZW0uVHlwZUZvbGRlciA9ICdmb2xkZXInO1xuU3RhdHVzSXRlbS5UeXBlRmlsZSA9ICdmaWxlJztcblN0YXR1c0l0ZW0uVHlwZUJvdGggPSAnYm90aCc7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFN0YXR1c0l0ZW07XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2xhbmcgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxudmFyIF9sYW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xhbmcpO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX29ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9vYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29ic2VydmFibGUpO1xuXG52YXIgX1Rhc2sgPSByZXF1aXJlKCcuL1Rhc2snKTtcblxudmFyIF9UYXNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Rhc2spO1xuXG52YXIgX0NvbmZpZ3MgPSByZXF1aXJlKCcuL0NvbmZpZ3MnKTtcblxudmFyIF9Db25maWdzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbmZpZ3MpO1xuXG52YXIgX1N0YXR1c0l0ZW0gPSByZXF1aXJlKCcuL1N0YXR1c0l0ZW0nKTtcblxudmFyIF9TdGF0dXNJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1N0YXR1c0l0ZW0pO1xuXG52YXIgX1VwbG9hZEl0ZW0gPSByZXF1aXJlKCcuL1VwbG9hZEl0ZW0nKTtcblxudmFyIF9VcGxvYWRJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VwbG9hZEl0ZW0pO1xuXG52YXIgX0ZvbGRlckl0ZW0gPSByZXF1aXJlKCcuL0ZvbGRlckl0ZW0nKTtcblxudmFyIF9Gb2xkZXJJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ZvbGRlckl0ZW0pO1xuXG52YXIgX1Nlc3Npb24gPSByZXF1aXJlKCcuL1Nlc3Npb24nKTtcblxudmFyIF9TZXNzaW9uMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Nlc3Npb24pO1xuXG52YXIgX2xvZGFzaCA9IHJlcXVpcmUoJ2xvZGFzaC5kZWJvdW5jZScpO1xuXG52YXIgX2xvZGFzaDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2Rhc2gpO1xuXG52YXIgX2FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfYXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwaSk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgU3RvcmUgPSBmdW5jdGlvbiAoX09ic2VydmFibGUpIHtcbiAgICBfaW5oZXJpdHMoU3RvcmUsIF9PYnNlcnZhYmxlKTtcblxuICAgIGZ1bmN0aW9uIFN0b3JlKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3RvcmUpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChTdG9yZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFN0b3JlKSkuY2FsbCh0aGlzKSk7XG5cbiAgICAgICAgX3RoaXMuX3Byb2Nlc3NpbmcgPSBbXTtcbiAgICAgICAgX3RoaXMuX3Nlc3Npb25zID0gW107XG4gICAgICAgIF90aGlzLl9ibGFja2xpc3QgPSBbXCIuZHNfc3RvcmVcIiwgXCIucHlkaW9cIl07XG5cbiAgICAgICAgX3RoaXMuX3BhdXNlUmVxdWlyZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTdG9yZSwgW3tcbiAgICAgICAga2V5OiAnZ2V0QXV0b1N0YXJ0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEF1dG9TdGFydCgpIHtcbiAgICAgICAgICAgIHJldHVybiBfQ29uZmlnczIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldEF1dG9TdGFydCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwdXNoU2Vzc2lvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwdXNoU2Vzc2lvbihzZXNzaW9uKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5fc2Vzc2lvbnMucHVzaChzZXNzaW9uKTtcbiAgICAgICAgICAgIHNlc3Npb24uVGFzayA9IF9UYXNrMi5kZWZhdWx0LmNyZWF0ZShzZXNzaW9uKTtcbiAgICAgICAgICAgIHNlc3Npb24ub2JzZXJ2ZSgndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXNzaW9uLm9ic2VydmUoJ2NoaWxkcmVuJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChzZXNzaW9uLmdldENoaWxkcmVuKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5yZW1vdmVTZXNzaW9uKHNlc3Npb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpczIubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgc2Vzc2lvbi5vYnNlcnZlKCdzdGF0dXMnLCBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgICAgIGlmIChzID09PSAncmVhZHknKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhdXRvU3RhcnQgPSBfdGhpczIuZ2V0QXV0b1N0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRvU3RhcnQgJiYgIV90aGlzMi5fcHJvY2Vzc2luZy5sZW5ndGggJiYgIV90aGlzMi5fcGF1c2VSZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb2Nlc3NOZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWF1dG9TdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgU3RvcmUub3BlblVwbG9hZERpYWxvZygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzID09PSAnY29uZmlybScpIHtcbiAgICAgICAgICAgICAgICAgICAgU3RvcmUub3BlblVwbG9hZERpYWxvZyh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCdzZXNzaW9uX2FkZGVkJywgc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbW92ZVNlc3Npb24nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlU2Vzc2lvbihzZXNzaW9uKSB7XG4gICAgICAgICAgICBzZXNzaW9uLlRhc2suc2V0SWRsZSgpO1xuICAgICAgICAgICAgdmFyIGkgPSB0aGlzLl9zZXNzaW9ucy5pbmRleE9mKHNlc3Npb24pO1xuICAgICAgICAgICAgdGhpcy5fc2Vzc2lvbnMgPSBfbGFuZzIuZGVmYXVsdC5hcnJheVdpdGhvdXQodGhpcy5fc2Vzc2lvbnMsIGkpO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2cnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9nKCkge31cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhc1F1ZXVlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhc1F1ZXVlKCkge1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gMDtcbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uLndhbGsoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtcysrO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmdldFN0YXR1cygpID09PSBfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNOZXcgfHwgaXRlbS5nZXRTdGF0dXMoKSA9PT0gX1N0YXR1c0l0ZW0yLmRlZmF1bHQuU3RhdHVzUGF1c2UgfHwgaXRlbS5nZXRTdGF0dXMoKSA9PT0gX1N0YXR1c0l0ZW0yLmRlZmF1bHQuU3RhdHVzTXVsdGlQYXVzZTtcbiAgICAgICAgICAgICAgICB9LCAnYm90aCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1zID49IDE7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtcyA+IDA7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhc0Vycm9ycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNFcnJvcnMoKSB7XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSAwO1xuICAgICAgICAgICAgdGhpcy5fc2Vzc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIHNlc3Npb24ud2FsayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zKys7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZ2V0U3RhdHVzKCkgPT09ICdlcnJvcic7XG4gICAgICAgICAgICAgICAgfSwgJ2JvdGgnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcyA+PSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gaXRlbXMgPiAwO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhckFsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckFsbCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmNsZWFyU3RhdHVzKCduZXcnKTtcbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uLndhbGsoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nZXRQYXJlbnQoKS5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzZXNzaW9uLlRhc2suc2V0SWRsZSgpO1xuICAgICAgICAgICAgICAgIF90aGlzMy5yZW1vdmVTZXNzaW9uKHNlc3Npb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9wYXVzZVJlcXVpcmVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NsZWFyU3RhdHVzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyU3RhdHVzKHN0YXR1cykge1xuICAgICAgICAgICAgdGhpcy5fc2Vzc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIHNlc3Npb24ud2FsayhmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmdldFBhcmVudCgpLnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmdldFN0YXR1cygpID09PSBzdGF0dXM7XG4gICAgICAgICAgICAgICAgfSwgJ2ZpbGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdtb25pdG9yUHJvY2Vzc2luZycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBtb25pdG9yUHJvY2Vzc2luZyhpdGVtKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCF0aGlzLl9wcm9jZXNzaW5nTW9uaXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NpbmdNb25pdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczQubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdzdGF0dXMnLCB0aGlzLl9wcm9jZXNzaW5nTW9uaXRvcik7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzaW5nLnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VubW9uaXRvclByb2Nlc3NpbmcnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdW5tb25pdG9yUHJvY2Vzc2luZyhpdGVtKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9wcm9jZXNzaW5nLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wcm9jZXNzaW5nTW9uaXRvcikge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3N0YXR1cycsIHRoaXMuX3Byb2Nlc3NpbmdNb25pdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2luZyA9IF9sYW5nMi5kZWZhdWx0LmFycmF5V2l0aG91dCh0aGlzLl9wcm9jZXNzaW5nLCBpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Byb2Nlc3NOZXh0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHByb2Nlc3NOZXh0KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBmb2xkZXJzID0gdGhpcy5nZXRGb2xkZXJzKCk7XG4gICAgICAgICAgICBpZiAoZm9sZGVycy5sZW5ndGggJiYgIXRoaXMuX3BhdXNlUmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5UcmVlU2VydmljZUFwaShfYXBpMi5kZWZhdWx0LmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX2NlbGxzU2RrLlJlc3RDcmVhdGVOb2Rlc1JlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lk5vZGVzID0gW107XG4gICAgICAgICAgICAgICAgZm9sZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChmb2xkZXJJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gbmV3IF9jZWxsc1Nkay5UcmVlTm9kZSgpO1xuICAgICAgICAgICAgICAgICAgICBub2RlLlBhdGggPSBmb2xkZXJJdGVtLmdldEZ1bGxQYXRoKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuVHlwZSA9IF9jZWxsc1Nkay5UcmVlTm9kZVR5cGUuY29uc3RydWN0RnJvbU9iamVjdCgnQ09MTEVDVElPTicpO1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lk5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRlckl0ZW0uc2V0U3RhdHVzKF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0xvYWRpbmcpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczUubW9uaXRvclByb2Nlc3NpbmcoZm9sZGVySXRlbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgIGFwaS5jcmVhdGVOb2RlcyhyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChmb2xkZXJJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJJdGVtLnNldFN0YXR1cyhfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNMb2FkZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVySXRlbS5jaGlsZHJlbi5wZ1tmb2xkZXJJdGVtLmdldElkKCldID0gMTAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVySXRlbS5yZWNvbXB1dGVQcm9ncmVzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1LnVubW9uaXRvclByb2Nlc3NpbmcoZm9sZGVySXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczUucHJvY2Vzc05leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM1Lm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczUucHJvY2Vzc05leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM1Lm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcHJvY2Vzc2FibGVzID0gdGhpcy5nZXROZXh0cygpO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3NhYmxlcy5sZW5ndGggJiYgIXRoaXMuX3BhdXNlUmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICBwcm9jZXNzYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAocHJvY2Vzc2FibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM1Lm1vbml0b3JQcm9jZXNzaW5nKHByb2Nlc3NhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2FibGUucHJvY2VzcyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUudW5tb25pdG9yUHJvY2Vzc2luZyhwcm9jZXNzYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUucHJvY2Vzc05leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNS5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzRXJyb3JzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgU3RvcmUub3BlblVwbG9hZERpYWxvZygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoX0NvbmZpZ3MyLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRBdXRvQ2xvc2UoKSAmJiAhdGhpcy5fcGF1c2VSZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeShcImF1dG9fY2xvc2VcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0Rm9sZGVycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRGb2xkZXJzKCkge1xuICAgICAgICAgICAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogNjA7XG5cbiAgICAgICAgICAgIHZhciBmb2xkZXJzID0gW107XG4gICAgICAgICAgICB0aGlzLl9zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi53YWxrKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRlcnMucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5nZXRTdGF0dXMoKSA9PT0gJ25ldyc7XG4gICAgICAgICAgICAgICAgfSwgJ2ZvbGRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvbGRlcnMubGVuZ3RoID49IG1heDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZvbGRlcnM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE5leHRzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE5leHRzKCkge1xuICAgICAgICAgICAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMztcblxuICAgICAgICAgICAgdmFyIGZvbGRlcnMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uLndhbGsoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVycy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmdldFN0YXR1cygpID09PSAnbmV3JztcbiAgICAgICAgICAgICAgICB9LCAnZm9sZGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm9sZGVycy5sZW5ndGggPj0gMTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGZvbGRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmb2xkZXJzLnNoaWZ0KCldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgICAgICB2YXIgcHJvY2Vzc2luZyA9IHRoaXMuX3Byb2Nlc3NpbmcubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5fc2Vzc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIHZhciBzZXNzSXRlbXMgPSAwO1xuICAgICAgICAgICAgICAgIHNlc3Npb24ud2FsayhmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICBzZXNzSXRlbXMrKztcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5nZXRTdGF0dXMoKSA9PT0gJ25ldycgfHwgaXRlbS5nZXRTdGF0dXMoKSA9PT0gJ3BhdXNlJztcbiAgICAgICAgICAgICAgICB9LCAnZmlsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1zLmxlbmd0aCA+PSBtYXggLSBwcm9jZXNzaW5nO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChzZXNzSXRlbXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbi5UYXNrLnNldElkbGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3RvcE9yUmVtb3ZlSXRlbScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdG9wT3JSZW1vdmVJdGVtKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW0uYWJvcnQoKTtcbiAgICAgICAgICAgIHRoaXMudW5tb25pdG9yUHJvY2Vzc2luZyhpdGVtKTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRTZXNzaW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRTZXNzaW9ucygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZXNzaW9ucztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNSdW5uaW5nJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzUnVubmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzaW5nLmZpbHRlcihmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1LmdldFN0YXR1cygpID09PSBfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNMb2FkaW5nO1xuICAgICAgICAgICAgfSkubGVuZ3RoID4gMDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncGF1c2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXVzZVJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NpbmcuZm9yRWFjaChmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1LnBhdXNlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVzdW1lJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc3VtZSgpIHtcbiAgICAgICAgICAgIHRoaXMuX3BhdXNlUmVxdWlyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcy5zZXRTdGF0dXMoJ3JlYWR5Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NpbmcuZm9yRWFjaChmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1LnJlc3VtZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NOZXh0KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZUZvbGRlclBpY2tlclJlc3VsdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVGb2xkZXJQaWNrZXJSZXN1bHQoZmlsZXMsIHRhcmdldE5vZGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgb3ZlcndyaXRlU3RhdHVzID0gX0NvbmZpZ3MyLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRPcHRpb24oXCJERUZBVUxUX0VYSVNUSU5HXCIsIFwidXBsb2FkX2V4aXN0aW5nXCIpO1xuICAgICAgICAgICAgdmFyIHNlc3Npb24gPSBuZXcgX1Nlc3Npb24yLmRlZmF1bHQoX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkudXNlci5hY3RpdmVSZXBvc2l0b3J5LCB0YXJnZXROb2RlKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFNlc3Npb24oc2Vzc2lvbik7XG5cbiAgICAgICAgICAgIHZhciBtUGF0aHMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IGZpbGVzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBtUGF0aCA9ICcvJyArIF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKGZpbGUubmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVzW2ldWyd3ZWJraXRSZWxhdGl2ZVBhdGgnXSkge1xuICAgICAgICAgICAgICAgICAgICBtUGF0aCA9ICcvJyArIGZpbGVzW2ldWyd3ZWJraXRSZWxhdGl2ZVBhdGgnXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZvbGRlclBhdGggPSBfcGF0aDIuZGVmYXVsdC5nZXREaXJuYW1lKG1QYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZm9sZGVyUGF0aCAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtUGF0aHNbX3BhdGgyLmRlZmF1bHQuZ2V0RGlybmFtZShmb2xkZXJQYXRoKV0gPSAnRk9MREVSJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtUGF0aHNbZm9sZGVyUGF0aF0gPSAnRk9MREVSJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbVBhdGhzW21QYXRoXSA9IGZpbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdHJlZSA9IHNlc3Npb24udHJlZVZpZXdGcm9tTWF0ZXJpYWxQYXRoKG1QYXRocyk7XG4gICAgICAgICAgICB2YXIgcmVjdXJzZSA9IGZ1bmN0aW9uIHJlY3Vyc2UoY2hpbGRyZW4sIHBhcmVudEl0ZW0pIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQuaXRlbSA9PT0gJ0ZPTERFUicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmID0gbmV3IF9Gb2xkZXJJdGVtMi5kZWZhdWx0KGNoaWxkLnBhdGgsIHRhcmdldE5vZGUsIHBhcmVudEl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXJzZShjaGlsZC5jaGlsZHJlbiwgZik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXM2Ll9ibGFja2xpc3QuaW5kZXhPZihfcGF0aDIuZGVmYXVsdC5nZXRCYXNlbmFtZShjaGlsZC5wYXRoKS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdSA9IG5ldyBfVXBsb2FkSXRlbTIuZGVmYXVsdChjaGlsZC5pdGVtLCB0YXJnZXROb2RlLCBjaGlsZC5wYXRoLCBwYXJlbnRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlY3Vyc2UodHJlZSwgc2Vzc2lvbik7XG4gICAgICAgICAgICBzZXNzaW9uLnByZXBhcmUob3ZlcndyaXRlU3RhdHVzKS5jYXRjaChmdW5jdGlvbiAoZSkge30pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYW5kbGVEcm9wRXZlbnRSZXN1bHRzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZURyb3BFdmVudFJlc3VsdHMoaXRlbXMsIGZpbGVzLCB0YXJnZXROb2RlKSB7XG4gICAgICAgICAgICB2YXIgYWNjdW11bGF0b3IgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IG51bGw7XG5cbiAgICAgICAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgZmlsdGVyRnVuY3Rpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IG51bGw7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0UmVwb3NpdG9yeUlkID0gYXJndW1lbnRzLmxlbmd0aCA+IDUgJiYgYXJndW1lbnRzWzVdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNV0gOiBudWxsO1xuXG5cbiAgICAgICAgICAgIHZhciBvdmVyd3JpdGVTdGF0dXMgPSBfQ29uZmlnczIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldE9wdGlvbihcIkRFRkFVTFRfRVhJU1RJTkdcIiwgXCJ1cGxvYWRfZXhpc3RpbmdcIik7XG4gICAgICAgICAgICB2YXIgc2Vzc2lvbiA9IG5ldyBfU2Vzc2lvbjIuZGVmYXVsdCh0YXJnZXRSZXBvc2l0b3J5SWQgfHwgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkudXNlci5hY3RpdmVSZXBvc2l0b3J5LCB0YXJnZXROb2RlKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFNlc3Npb24oc2Vzc2lvbik7XG4gICAgICAgICAgICB2YXIgZmlsdGVyID0gZnVuY3Rpb24gZmlsdGVyKHJlZlBhdGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyRnVuY3Rpb24gJiYgIWZpbHRlckZ1bmN0aW9uKHJlZlBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzNy5fYmxhY2tsaXN0LmluZGV4T2YoX3BhdGgyLmRlZmF1bHQuZ2V0QmFzZW5hbWUocmVmUGF0aCkudG9Mb3dlckNhc2UoKSkgPT09IC0xO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGVucXVldWUgPSBmdW5jdGlvbiBlbnF1ZXVlKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaXNGb2xkZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlckZ1bmN0aW9uICYmICFmaWx0ZXJGdW5jdGlvbihpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhY2N1bXVsYXRvcikge1xuICAgICAgICAgICAgICAgICAgICBhY2N1bXVsYXRvci5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNGb2xkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbi5wdXNoRm9sZGVyKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb24ucHVzaEZpbGUoaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCAmJiAoaXRlbXNbMF0uZ2V0QXNFbnRyeSB8fCBpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5KSkge1xuICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IGdsb2JhbC5jb25zb2xlID8gZ2xvYmFsLmNvbnNvbGUubG9nIDogZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLmFsZXJ0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciBsZW5ndGggPSBpdGVtcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbnRyeSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtc1tpXS5raW5kICYmIGl0ZW1zW2ldLmtpbmQgIT09ICdmaWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnY29udGludWUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1zWzBdLmdldEFzRW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeSA9IGl0ZW1zW2ldLmdldEFzRW50cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkgPSBpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5pc0ZpbGUpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5maWxlKGZ1bmN0aW9uIChGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChGaWxlLnNpemUgPiAwICYmIGZpbHRlcihGaWxlLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdSA9IG5ldyBfVXBsb2FkSXRlbTIuZGVmYXVsdChGaWxlLCB0YXJnZXROb2RlLCBudWxsLCBzZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO2Vycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LmZvbGRlckl0ZW0gPSBuZXcgX0ZvbGRlckl0ZW0yLmRlZmF1bHQoZW50cnkuZnVsbFBhdGgsIHRhcmdldE5vZGUsIHNlc3Npb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChfdGhpczcucmVjdXJzZURpcmVjdG9yeShlbnRyeSwgZnVuY3Rpb24gKGZpbGVFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVsYXRpdmVQYXRoID0gZmlsZUVudHJ5LmZ1bGxQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUVudHJ5LmZpbGUoZnVuY3Rpb24gKEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdUl0ZW0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEZpbGUuc2l6ZSA+IDAgJiYgZmlsdGVyKEZpbGUubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdUl0ZW0gPSBuZXcgX1VwbG9hZEl0ZW0yLmRlZmF1bHQoRmlsZSwgdGFyZ2V0Tm9kZSwgcmVsYXRpdmVQYXRoLCBmaWxlRW50cnkucGFyZW50SXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodUl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7ZXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZm9sZGVyRW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcihmb2xkZXJFbnRyeS5mdWxsUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlckVudHJ5LmZvbGRlckl0ZW0gPSBuZXcgX0ZvbGRlckl0ZW0yLmRlZmF1bHQoZm9sZGVyRW50cnkuZnVsbFBhdGgsIHRhcmdldE5vZGUsIGZvbGRlckVudHJ5LnBhcmVudEl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZm9sZGVyRW50cnkuZm9sZGVySXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX3JldDIgPSBfbG9vcChpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9yZXQyID09PSAnY29udGludWUnKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uLnByZXBhcmUob3ZlcndyaXRlU3RhdHVzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczcubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM3Lm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZmlsZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVzW2pdLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm5vLWZvbGRlcnMtc3VwcG9ydCddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbHRlcihmaWxlc1tqXS5uYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ldyBfVXBsb2FkSXRlbTIuZGVmYXVsdChmaWxlc1tqXSwgdGFyZ2V0Tm9kZSwgbnVsbCwgc2Vzc2lvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlc3Npb24ucHJlcGFyZShvdmVyd3JpdGVTdGF0dXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczcubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczcubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVjdXJzZURpcmVjdG9yeScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZWN1cnNlRGlyZWN0b3J5KGl0ZW0sIHByb21pc2VGaWxlLCBwcm9taXNlRm9sZGVyLCBlcnJvckhhbmRsZXIpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczggPSB0aGlzO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczguZGlyRW50cmllcyhpdGVtKS50aGVuKGZ1bmN0aW9uIChlbnRyaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBlbnRyaWVzLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkucGFyZW50ICYmIGVudHJ5LnBhcmVudC5mb2xkZXJJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkucGFyZW50SXRlbSA9IGVudHJ5LnBhcmVudC5mb2xkZXJJdGVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlRm9sZGVyKGVudHJ5KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZUZpbGUoZW50cnkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGlyRW50cmllcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaXJFbnRyaWVzKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBfdGhpczkgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgcmVhZGVyID0gaXRlbS5jcmVhdGVSZWFkZXIoKTtcbiAgICAgICAgICAgIHZhciBlbnRyaWVzID0gW107XG4gICAgICAgICAgICB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uIHRvQXJyYXkobGlzdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChsaXN0IHx8IFtdLCAwKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyaWVzID0gZW50cmllcy5jb25jYXQodG9BcnJheShyZXN1bHRzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyaWVzLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnBhcmVudCA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChfdGhpczkuZGlyRW50cmllcyhlbnRyeSkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyaWVzID0gZW50cmllcy5jb25jYXQoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb21pc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdvcGVuVXBsb2FkRGlhbG9nJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5VcGxvYWREaWFsb2coKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlybSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChjb25maXJtKSB7XG4gICAgICAgICAgICAgICAgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oXCJ1cGxvYWRcIiwgeyBjb25maXJtRGlhbG9nOiB0cnVlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbihcInVwbG9hZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0SW5zdGFuY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SW5zdGFuY2UoKSB7XG4gICAgICAgICAgICBpZiAoIVN0b3JlLl9fSU5TVEFOQ0UpIHtcbiAgICAgICAgICAgICAgICBTdG9yZS5fX0lOU1RBTkNFID0gbmV3IFN0b3JlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gU3RvcmUuX19JTlNUQU5DRTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTdG9yZTtcbn0oX29ic2VydmFibGUyLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBTdG9yZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxudmFyIF9TdGF0dXNJdGVtID0gcmVxdWlyZSgnLi9TdGF0dXNJdGVtJyk7XG5cbnZhciBfU3RhdHVzSXRlbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TdGF0dXNJdGVtKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMi5kZWZhdWx0LnJlcXVpcmVMaWIoXCJib290XCIpLFxuICAgIEpvYnNTdG9yZSA9IF9QeWRpbyRyZXF1aXJlTGliLkpvYnNTdG9yZTtcblxudmFyIFRhc2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVGFzayhzZXNzaW9uKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFRhc2spO1xuXG4gICAgICAgIHB5ZGlvID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG4gICAgICAgIHRoaXMuam9iID0gbmV3IF9jZWxsc1Nkay5Kb2JzSm9iKCk7XG4gICAgICAgIHRoaXMuam9iLklEID0gJ2xvY2FsLXVwbG9hZC10YXNrLScgKyBzZXNzaW9uLmdldElkKCk7XG4gICAgICAgIHRoaXMuam9iLk93bmVyID0gcHlkaW8udXNlci5pZDtcbiAgICAgICAgdGhpcy5qb2IuTGFiZWwgPSBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci50YXNrLmxhYmVsJ107XG4gICAgICAgIHRoaXMuam9iLlN0b3BwYWJsZSA9IHRydWU7XG4gICAgICAgIHZhciB0YXNrID0gbmV3IF9jZWxsc1Nkay5Kb2JzVGFzaygpO1xuICAgICAgICB0aGlzLnRhc2sgPSB0YXNrO1xuICAgICAgICB0aGlzLmpvYi5UYXNrcyA9IFt0aGlzLnRhc2tdO1xuICAgICAgICB0aGlzLnRhc2suSGFzUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICB0aGlzLnRhc2suSUQgPSBcInVwbG9hZFwiO1xuICAgICAgICB0aGlzLnRhc2suU3RhdHVzID0gX2NlbGxzU2RrLkpvYnNUYXNrU3RhdHVzLmNvbnN0cnVjdEZyb21PYmplY3QoJ0lkbGUnKTtcbiAgICAgICAgdGhpcy5qb2Iub3BlbkRldGFpbFBhbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBweWRpby5Db250cm9sbGVyLmZpcmVBY3Rpb24oXCJ1cGxvYWRcIik7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGFzay5fc3RhdHVzT2JzZXJ2ZXIgPSBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgaWYgKHMgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0FuYWx5emUpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5qb2IuTGFiZWwgPSAnUHJlcGFyaW5nIGZpbGVzIGZvciB1cGxvYWQnO1xuICAgICAgICAgICAgICAgIGlmIChzZXNzaW9uLmdldENoaWxkcmVuKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2suU3RhdHVzTWVzc2FnZSA9ICdBbmFseXppbmcgKCcgKyBzZXNzaW9uLmdldENoaWxkcmVuKCkubGVuZ3RoICsgJykgaXRlbXMnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2suU3RhdHVzTWVzc2FnZSA9ICdQbGVhc2Ugd2FpdC4uLic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhc2suU3RhdHVzID0gX2NlbGxzU2RrLkpvYnNUYXNrU3RhdHVzLmNvbnN0cnVjdEZyb21PYmplY3QoJ1J1bm5pbmcnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocyA9PT0gJ3JlYWR5Jykge1xuICAgICAgICAgICAgICAgIF90aGlzLmpvYi5MYWJlbCA9IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLjcnXTtcbiAgICAgICAgICAgICAgICB0YXNrLlN0YXR1c01lc3NhZ2UgPSAnUmVhZHkgdG8gdXBsb2FkJztcbiAgICAgICAgICAgICAgICB0YXNrLlN0YXR1cyA9IF9jZWxsc1Nkay5Kb2JzVGFza1N0YXR1cy5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdJZGxlJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHMgPT09ICdwYXVzZWQnKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuam9iLkxhYmVsID0gJ1Rhc2sgcGF1c2VkJztcbiAgICAgICAgICAgICAgICB0YXNrLlN0YXR1cyA9IF9jZWxsc1Nkay5Kb2JzVGFza1N0YXR1cy5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdQYXVzZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLm5vdGlmeU1haW5TdG9yZSgpO1xuICAgICAgICB9O1xuICAgICAgICB0YXNrLl9wcm9ncmVzc09ic2VydmVyID0gZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHRhc2suUHJvZ3Jlc3MgPSBwIC8gMTAwO1xuICAgICAgICAgICAgdGFzay5TdGF0dXMgPSBfY2VsbHNTZGsuSm9ic1Rhc2tTdGF0dXMuY29uc3RydWN0RnJvbU9iamVjdCgnUnVubmluZycpO1xuICAgICAgICAgICAgaWYgKHAgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGFzay5TdGF0dXNNZXNzYWdlID0gJ1VwbG9hZGluZyAnICsgTWF0aC5jZWlsKHApICsgJyUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMubm90aWZ5TWFpblN0b3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIHNlc3Npb24ub2JzZXJ2ZSgnc3RhdHVzJywgdGFzay5fc3RhdHVzT2JzZXJ2ZXIpO1xuICAgICAgICBzZXNzaW9uLm9ic2VydmUoJ3Byb2dyZXNzJywgdGFzay5fcHJvZ3Jlc3NPYnNlcnZlcik7XG5cbiAgICAgICAgdGFzay5fc3RhdHVzT2JzZXJ2ZXIoc2Vzc2lvbi5nZXRTdGF0dXMoKSk7XG4gICAgICAgIHRhc2suX3Byb2dyZXNzT2JzZXJ2ZXIoc2Vzc2lvbi5nZXRQcm9ncmVzcygpKTtcblxuICAgICAgICBKb2JzU3RvcmUuZ2V0SW5zdGFuY2UoKS5lbnF1ZXVlTG9jYWxKb2IodGhpcy5qb2IpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUYXNrLCBbe1xuICAgICAgICBrZXk6ICdzZXRJZGxlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldElkbGUoKSB7XG4gICAgICAgICAgICB0aGlzLnRhc2suU3RhdHVzID0gX2NlbGxzU2RrLkpvYnNUYXNrU3RhdHVzLmNvbnN0cnVjdEZyb21PYmplY3QoJ0lkbGUnKTtcbiAgICAgICAgICAgIHRoaXMudGFzay5TdGF0dXNNZXNzYWdlID0gJyc7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeU1haW5TdG9yZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdub3RpZnlNYWluU3RvcmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbm90aWZ5TWFpblN0b3JlKCkge1xuICAgICAgICAgICAgdGhpcy50YXNrLlN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICAgICAgICAgIHRoaXMuam9iLlRhc2tzID0gW3RoaXMudGFza107XG4gICAgICAgICAgICBKb2JzU3RvcmUuZ2V0SW5zdGFuY2UoKS5lbnF1ZXVlTG9jYWxKb2IodGhpcy5qb2IpO1xuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ2NyZWF0ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGUoc2Vzc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBUYXNrKHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFRhc2s7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRhc2s7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9TdGF0dXNJdGVtMiA9IHJlcXVpcmUoJy4vU3RhdHVzSXRlbScpO1xuXG52YXIgX1N0YXR1c0l0ZW0zID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU3RhdHVzSXRlbTIpO1xuXG52YXIgX1BhcnRJdGVtID0gcmVxdWlyZSgnLi9QYXJ0SXRlbScpO1xuXG52YXIgX1BhcnRJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BhcnRJdGVtKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX2FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfYXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwaSk7XG5cbnZhciBfQ29uZmlncyA9IHJlcXVpcmUoJy4vQ29uZmlncycpO1xuXG52YXIgX0NvbmZpZ3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29uZmlncyk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgVXBsb2FkSXRlbSA9IGZ1bmN0aW9uIChfU3RhdHVzSXRlbSkge1xuICAgIF9pbmhlcml0cyhVcGxvYWRJdGVtLCBfU3RhdHVzSXRlbSk7XG5cbiAgICBmdW5jdGlvbiBVcGxvYWRJdGVtKGZpbGUsIHRhcmdldE5vZGUpIHtcbiAgICAgICAgdmFyIHJlbGF0aXZlUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogbnVsbDtcbiAgICAgICAgdmFyIHBhcmVudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogbnVsbDtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBsb2FkSXRlbSk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFVwbG9hZEl0ZW0uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihVcGxvYWRJdGVtKSkuY2FsbCh0aGlzLCAnZmlsZScsIHRhcmdldE5vZGUsIHBhcmVudCkpO1xuXG4gICAgICAgIF90aGlzLl9maWxlID0gZmlsZTtcbiAgICAgICAgX3RoaXMuX3N0YXR1cyA9ICduZXcnO1xuICAgICAgICBpZiAocmVsYXRpdmVQYXRoKSB7XG4gICAgICAgICAgICBfdGhpcy5fbGFiZWwgPSBfcGF0aDIuZGVmYXVsdC5nZXRCYXNlbmFtZShyZWxhdGl2ZVBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMuX2xhYmVsID0gZmlsZS5uYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWxlLnNpemUgPiBfYXBpMi5kZWZhdWx0LmdldE11bHRpcGFydFRocmVzaG9sZCgpKSB7XG4gICAgICAgICAgICBfdGhpcy5jcmVhdGVQYXJ0cygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgIHBhcmVudC5hZGRDaGlsZChfdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVcGxvYWRJdGVtLCBbe1xuICAgICAgICBrZXk6ICdjcmVhdGVQYXJ0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVQYXJ0cygpIHtcbiAgICAgICAgICAgIHZhciBwYXJ0U2l6ZSA9IF9hcGkyLmRlZmF1bHQuZ2V0TXVsdGlwYXJ0UGFydFNpemUoKTtcbiAgICAgICAgICAgIHRoaXMuX3BhcnRzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IE1hdGguY2VpbCh0aGlzLl9maWxlLnNpemUgLyBwYXJ0U2l6ZSk7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhcnRzLnB1c2gobmV3IF9QYXJ0SXRlbTIuZGVmYXVsdCh0aGlzLCBpICsgMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRGaWxlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEZpbGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlsZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0U2l6ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRTaXplKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGUuc2l6ZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0SHVtYW5TaXplJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEh1bWFuU2l6ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBfcGF0aDIuZGVmYXVsdC5yb3VuZEZpbGVTaXplKHRoaXMuX2ZpbGUuc2l6ZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldFByb2dyZXNzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFByb2dyZXNzKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgYnl0ZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzID0gbmV3VmFsdWU7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgncHJvZ3Jlc3MnLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICBpZiAoYnl0ZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgnYnl0ZXMnLCBieXRlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19wYXJzZVhIUlJlc3BvbnNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9wYXJzZVhIUlJlc3BvbnNlKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMueGhyICYmIHRoaXMueGhyLnJlc3BvbnNlVGV4dCAmJiB0aGlzLnhoci5yZXNwb25zZVRleHQgIT09ICdPSycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoJ1VuZXhwZWN0ZWQgcmVzcG9uc2U6ICcgKyB0aGlzLnhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfZG9Qcm9jZXNzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9kb1Byb2Nlc3MoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuX3VzZXJBYm9ydGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzTG9hZGVkKTtcbiAgICAgICAgICAgICAgICBfdGhpczIuX3BhcnNlWEhSUmVzcG9uc2UoKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZUNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3MgPSBmdW5jdGlvbiBwcm9ncmVzcyhjb21wdXRhYmxlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMyLl9zdGF0dXMgPT09IF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0Vycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wdXRhYmxlRXZlbnQudG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcGVyY2VudGFnZSA9IE1hdGgucm91bmQoY29tcHV0YWJsZUV2ZW50LmxvYWRlZCAqIDEwMCAvIGNvbXB1dGFibGVFdmVudC50b3RhbCk7XG4gICAgICAgICAgICAgICAgdmFyIGJ5dGVzTG9hZGVkID0gY29tcHV0YWJsZUV2ZW50LmxvYWRlZDtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0UHJvZ3Jlc3MocGVyY2VudGFnZSwgYnl0ZXNMb2FkZWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzMi5fcGFydHMgJiYgY29tcHV0YWJsZUV2ZW50LnBhcnQgJiYgX3RoaXMyLl9wYXJ0c1tjb21wdXRhYmxlRXZlbnQucGFydCAtIDFdICYmIGNvbXB1dGFibGVFdmVudC5wYXJ0TG9hZGVkICYmIGNvbXB1dGFibGVFdmVudC5wYXJ0VG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnQgPSBfdGhpczIuX3BhcnRzW2NvbXB1dGFibGVFdmVudC5wYXJ0IC0gMV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBfcHJvZ3Jlc3MgPSBNYXRoLnJvdW5kKGNvbXB1dGFibGVFdmVudC5wYXJ0TG9hZGVkICogMTAwIC8gY29tcHV0YWJsZUV2ZW50LnBhcnRUb3RhbCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcHJvZ3Jlc3MgPCAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0LmdldFN0YXR1cygpICE9PSBfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNDYW5ub3RQYXVzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0xvYWRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoZWNrUGF1c2UgPSBwYXJ0LmdldFN0YXR1cygpID09PSBfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNDYW5ub3RQYXVzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0xvYWRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tQYXVzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdGhpczIuX3BhcnRzLmZpbHRlcihmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFydC5nZXRTdGF0dXMoKSA9PT0gX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzQ2Fubm90UGF1c2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzUGF1c2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnNldFByb2dyZXNzKF9wcm9ncmVzcywgY29tcHV0YWJsZUV2ZW50LnBhcnRMb2FkZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlcyA9IF9weWRpbzIuZGVmYXVsdC5nZXRNZXNzYWdlcygpO1xuICAgICAgICAgICAgdmFyIGVycm9yID0gZnVuY3Rpb24gZXJyb3IoZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5vbkVycm9yKG1lc3NhZ2VzWzIxMF0gKyBcIjogXCIgKyBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlQ2FsbGJhY2soKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBNQVhfUkVUUklFUyA9IDI7XG4gICAgICAgICAgICB2YXIgQkFDS19PRkYgPSAxNTA7XG4gICAgICAgICAgICB2YXIgcmV0cnkgPSBmdW5jdGlvbiByZXRyeShjb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZSAmJiBlLmluZGV4T2YpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLmluZGV4T2YoJzQyMicpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihuZXcgRXJyb3IobWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuc3RhdHVzLmVycm9yLjQyMiddICsgJyAoNDIyKScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGUuaW5kZXhPZignNDAzJykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKG5ldyBFcnJvcihtZXNzYWdlc1snaHRtbF91cGxvYWRlci5zdGF0dXMuZXJyb3IuNDAzJ10gKyAnICg0MDMpJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMyLl91c2VyQWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IobmV3IEVycm9yKG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLnN0YXR1cy5lcnJvci5hYm9ydGVkJ10pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQgPj0gTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi51cGxvYWRQcmVzaWduZWQoY29tcGxldGUsIHByb2dyZXNzLCByZXRyeSgrK2NvdW50KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBCQUNLX09GRiAqIGNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXR1cyhfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNMb2FkaW5nKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBfQ29uZmlnczIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmV4dGVuc2lvbkFsbG93ZWQodGhpcyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGUubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGVDYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0cnkoMCkoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnX2RvQWJvcnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2RvQWJvcnQoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKHRoaXMueGhyKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXNlckFib3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnhoci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXR1cyhfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNFcnJvcik7XG4gICAgICAgICAgICB0aGlzLnNldFByb2dyZXNzKDApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfZG9QYXVzZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZG9QYXVzZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnhocikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnhoci5wYXVzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnhoci5wYXVzZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fcGFydHMgJiYgdGhpcy5fcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0cy5maWx0ZXIoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcC5nZXRTdGF0dXMoKSA9PT0gX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzTG9hZGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcC5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzQ2Fubm90UGF1c2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c011bHRpUGF1c2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0Nhbm5vdFBhdXNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNOZXc7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19kb1Jlc3VtZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZG9SZXN1bWUoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy54aHIgJiYgdGhpcy54aHIucmVzdW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy54aHIucmVzdW1lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwbG9hZFByZXNpZ25lZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGxvYWRQcmVzaWduZWQoY29tcGxldGVDYWxsYmFjaywgcHJvZ3Jlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBmdWxsUGF0aCA9IHZvaWQgMDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZnVsbFBhdGggPSB0aGlzLmdldEZ1bGxQYXRoKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzRXJyb3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UHJvZ3Jlc3MoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5nZXRTaXplKCkgPCBfYXBpMi5kZWZhdWx0LmdldE11bHRpcGFydFRocmVzaG9sZCgpKSB7XG4gICAgICAgICAgICAgICAgX2FwaTIuZGVmYXVsdC5nZXRDbGllbnQoKS51cGxvYWRQcmVzaWduZWQodGhpcy5fZmlsZSwgZnVsbFBhdGgsIGNvbXBsZXRlQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2ssIHByb2dyZXNzQ2FsbGJhY2spLnRoZW4oZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMueGhyID0geGhyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfYXBpMi5kZWZhdWx0LmdldENsaWVudCgpLnVwbG9hZE11bHRpcGFydCh0aGlzLl9maWxlLCBmdWxsUGF0aCwgY29tcGxldGVDYWxsYmFjaywgZXJyb3JDYWxsYmFjaywgcHJvZ3Jlc3NDYWxsYmFjaykudGhlbihmdW5jdGlvbiAobWFuYWdlZCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMueGhyID0gbWFuYWdlZDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBVcGxvYWRJdGVtO1xufShfU3RhdHVzSXRlbTMuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFVwbG9hZEl0ZW07XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlBhcnRJdGVtID0gZXhwb3J0cy5TZXNzaW9uID0gZXhwb3J0cy5Gb2xkZXJJdGVtID0gZXhwb3J0cy5VcGxvYWRJdGVtID0gZXhwb3J0cy5Db25maWdzID0gZXhwb3J0cy5TdG9yZSA9IHVuZGVmaW5lZDtcblxudmFyIF9TdG9yZSA9IHJlcXVpcmUoJy4vU3RvcmUnKTtcblxudmFyIF9TdG9yZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TdG9yZSk7XG5cbnZhciBfQ29uZmlncyA9IHJlcXVpcmUoJy4vQ29uZmlncycpO1xuXG52YXIgX0NvbmZpZ3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29uZmlncyk7XG5cbnZhciBfVXBsb2FkSXRlbSA9IHJlcXVpcmUoJy4vVXBsb2FkSXRlbScpO1xuXG52YXIgX1VwbG9hZEl0ZW0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVXBsb2FkSXRlbSk7XG5cbnZhciBfRm9sZGVySXRlbSA9IHJlcXVpcmUoJy4vRm9sZGVySXRlbScpO1xuXG52YXIgX0ZvbGRlckl0ZW0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRm9sZGVySXRlbSk7XG5cbnZhciBfUGFydEl0ZW0gPSByZXF1aXJlKCcuL1BhcnRJdGVtJyk7XG5cbnZhciBfUGFydEl0ZW0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUGFydEl0ZW0pO1xuXG52YXIgX1Nlc3Npb24gPSByZXF1aXJlKCcuL1Nlc3Npb24nKTtcblxudmFyIF9TZXNzaW9uMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Nlc3Npb24pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLlN0b3JlID0gX1N0b3JlMi5kZWZhdWx0O1xuZXhwb3J0cy5Db25maWdzID0gX0NvbmZpZ3MyLmRlZmF1bHQ7XG5leHBvcnRzLlVwbG9hZEl0ZW0gPSBfVXBsb2FkSXRlbTIuZGVmYXVsdDtcbmV4cG9ydHMuRm9sZGVySXRlbSA9IF9Gb2xkZXJJdGVtMi5kZWZhdWx0O1xuZXhwb3J0cy5TZXNzaW9uID0gX1Nlc3Npb24yLmRlZmF1bHQ7XG5leHBvcnRzLlBhcnRJdGVtID0gX1BhcnRJdGVtMi5kZWZhdWx0O1xuIl19
