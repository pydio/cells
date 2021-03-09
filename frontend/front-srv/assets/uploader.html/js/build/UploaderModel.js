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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9ncnVudC1icm93c2VyaWZ5QDQuMC4xL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9tb2RlbC9Db25maWdzLmpzIiwianMvYnVpbGQvbW9kZWwvRm9sZGVySXRlbS5qcyIsImpzL2J1aWxkL21vZGVsL1BhcnRJdGVtLmpzIiwianMvYnVpbGQvbW9kZWwvU2Vzc2lvbi5qcyIsImpzL2J1aWxkL21vZGVsL1N0YXR1c0l0ZW0uanMiLCJqcy9idWlsZC9tb2RlbC9TdG9yZS5qcyIsImpzL2J1aWxkL21vZGVsL1Rhc2suanMiLCJqcy9idWlsZC9tb2RlbC9VcGxvYWRJdGVtLmpzIiwianMvYnVpbGQvbW9kZWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdm1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9wYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXRoKTtcblxudmFyIF9vYnNlcnZhYmxlID0gcmVxdWlyZSgncHlkaW8vbGFuZy9vYnNlcnZhYmxlJyk7XG5cbnZhciBfb2JzZXJ2YWJsZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9vYnNlcnZhYmxlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgQ29uZmlncyA9IGZ1bmN0aW9uIChfT2JzZXJ2YWJsZSkge1xuICAgIF9pbmhlcml0cyhDb25maWdzLCBfT2JzZXJ2YWJsZSk7XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ29uZmlncywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnZ2V0SW5zdGFuY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SW5zdGFuY2UoKSB7XG4gICAgICAgICAgICBpZiAoIUNvbmZpZ3MuX19JTlNUQU5DRSkge1xuICAgICAgICAgICAgICAgIENvbmZpZ3MuX19JTlNUQU5DRSA9IG5ldyBDb25maWdzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQ29uZmlncy5fX0lOU1RBTkNFO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgZnVuY3Rpb24gQ29uZmlncygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbmZpZ3MpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChDb25maWdzLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29uZmlncykpLmNhbGwodGhpcykpO1xuXG4gICAgICAgIF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLm9ic2VydmUoXCJyZWdpc3RyeV9sb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fZ2xvYmFsID0gbnVsbDtcbiAgICAgICAgfS5iaW5kKF90aGlzKSk7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ29uZmlncywgW3tcbiAgICAgICAga2V5OiAnX2xvYWRPcHRpb25zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9sb2FkT3B0aW9ucygpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fZ2xvYmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ2xvYmFsID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0UGx1Z2luQ29uZmlncyhcInVwbG9hZGVyXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRPcHRpb25Bc0Jvb2wnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0T3B0aW9uQXNCb29sKG5hbWUpIHtcbiAgICAgICAgICAgIHZhciB1c2VyUHJlZiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJyc7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHZhciBvID0gdGhpcy5nZXRPcHRpb24obmFtZSwgdXNlclByZWYsIGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gbyA9PT0gdHJ1ZSB8fCBvID09PSAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE9wdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRPcHRpb24obmFtZSkge1xuICAgICAgICAgICAgdmFyIHVzZXJQcmVmID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcbiAgICAgICAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdGhpcy5fbG9hZE9wdGlvbnMoKTtcbiAgICAgICAgICAgIGlmICh1c2VyUHJlZikge1xuICAgICAgICAgICAgICAgIHZhciB0ZXN0ID0gQ29uZmlncy5nZXRVc2VyUHJlZmVyZW5jZSgnb3JpZ2luYWxVcGxvYWRGb3JtX1hIUlVwbG9hZGVyJywgdXNlclByZWYpO1xuICAgICAgICAgICAgICAgIGlmICh0ZXN0ICE9PSB1bmRlZmluZWQgJiYgdGVzdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fZ2xvYmFsLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9nbG9iYWwuZ2V0KG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRBdXRvU3RhcnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0QXV0b1N0YXJ0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uQXNCb29sKFwiREVGQVVMVF9BVVRPX1NUQVJUXCIsIFwidXBsb2FkX2F1dG9fc2VuZFwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0QXV0b0Nsb3NlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEF1dG9DbG9zZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbkFzQm9vbChcIkRFRkFVTFRfQVVUT19DTE9TRVwiLCBcInVwbG9hZF9hdXRvX2Nsb3NlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVPcHRpb24nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlT3B0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgaXNCb29sID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKGlzQm9vbCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPyBcInRydWVcIiA6IFwiZmFsc2VcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIENvbmZpZ3Muc2V0VXNlclByZWZlcmVuY2UoJ29yaWdpbmFsVXBsb2FkRm9ybV9YSFJVcGxvYWRlcicsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KFwiY2hhbmdlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdleHRlbnNpb25BbGxvd2VkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGV4dGVuc2lvbkFsbG93ZWQodXBsb2FkSXRlbSkge1xuICAgICAgICAgICAgdmFyIGV4dFN0cmluZyA9IHRoaXMuZ2V0T3B0aW9uKFwiQUxMT1dFRF9FWFRFTlNJT05TXCIsICcnLCAnJyk7XG4gICAgICAgICAgICBpZiAoIWV4dFN0cmluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBleHREZXNjcmlwdGlvbiA9IHRoaXMuZ2V0T3B0aW9uKFwiQUxMT1dFRF9FWFRFTlNJT05TX1JFQURBQkxFXCIsICcnLCAnJyk7XG4gICAgICAgICAgICBpZiAoZXh0RGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICBleHREZXNjcmlwdGlvbiA9ICcgKCcgKyBleHREZXNjcmlwdGlvbiArICcpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpdGVtRXh0ID0gX3BhdGgyLmRlZmF1bHQuZ2V0RmlsZUV4dGVuc2lvbih1cGxvYWRJdGVtLmdldExhYmVsKCkpO1xuICAgICAgICAgICAgaWYgKGV4dFN0cmluZy5zcGxpdCgnLCcpLmluZGV4T2YoaXRlbUV4dCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLk1lc3NhZ2VIYXNoWzM2N10gKyBleHRTdHJpbmcgKyBleHREZXNjcmlwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSwgW3tcbiAgICAgICAga2V5OiAnZ2V0VXNlclByZWZlcmVuY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VXNlclByZWZlcmVuY2UoZ3VpRWxlbWVudElkLCBwcmVmTmFtZSkge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICBpZiAoIXB5ZGlvLnVzZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBndWlfcHJlZiA9IHB5ZGlvLnVzZXIuZ2V0UHJlZmVyZW5jZShcImd1aV9wcmVmZXJlbmNlc1wiLCB0cnVlKTtcbiAgICAgICAgICAgIGlmICghZ3VpX3ByZWYgfHwgIWd1aV9wcmVmW2d1aUVsZW1lbnRJZF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnkgJiYgZ3VpX3ByZWZbZ3VpRWxlbWVudElkXVsncmVwby0nICsgcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBndWlfcHJlZltndWlFbGVtZW50SWRdWydyZXBvLScgKyBweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnldW3ByZWZOYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBndWlfcHJlZltndWlFbGVtZW50SWRdW3ByZWZOYW1lXTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0VXNlclByZWZlcmVuY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VXNlclByZWZlcmVuY2UoZ3VpRWxlbWVudElkLCBwcmVmTmFtZSwgcHJlZlZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIGlmICghcHlkaW8gfHwgIXB5ZGlvLnVzZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZ3VpUHJlZiA9IHB5ZGlvLnVzZXIuZ2V0UHJlZmVyZW5jZShcImd1aV9wcmVmZXJlbmNlc1wiLCB0cnVlKTtcbiAgICAgICAgICAgIGlmICghZ3VpUHJlZikge1xuICAgICAgICAgICAgICAgIGd1aVByZWYgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZ3VpUHJlZltndWlFbGVtZW50SWRdKSB7XG4gICAgICAgICAgICAgICAgZ3VpUHJlZltndWlFbGVtZW50SWRdID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcG9rZXkgPSAncmVwby0nICsgcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5O1xuICAgICAgICAgICAgICAgIGlmICghZ3VpUHJlZltndWlFbGVtZW50SWRdW3JlcG9rZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGd1aVByZWZbZ3VpRWxlbWVudElkXVtyZXBva2V5XSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZ3VpUHJlZltndWlFbGVtZW50SWRdW3JlcG9rZXldW3ByZWZOYW1lXSAmJiBndWlQcmVmW2d1aUVsZW1lbnRJZF1bcmVwb2tleV1bcHJlZk5hbWVdID09PSBwcmVmVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBndWlQcmVmW2d1aUVsZW1lbnRJZF1bcmVwb2tleV1bcHJlZk5hbWVdID0gcHJlZlZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3VpUHJlZltndWlFbGVtZW50SWRdW3ByZWZOYW1lXSAmJiBndWlQcmVmW2d1aUVsZW1lbnRJZF1bcHJlZk5hbWVdID09PSBwcmVmVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBndWlQcmVmW2d1aUVsZW1lbnRJZF1bcHJlZk5hbWVdID0gcHJlZlZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHlkaW8udXNlci5zZXRQcmVmZXJlbmNlKFwiZ3VpX3ByZWZlcmVuY2VzXCIsIGd1aVByZWYsIHRydWUpO1xuICAgICAgICAgICAgcHlkaW8udXNlci5zYXZlUHJlZmVyZW5jZShcImd1aV9wcmVmZXJlbmNlc1wiKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDb25maWdzO1xufShfb2JzZXJ2YWJsZTIuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENvbmZpZ3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1N0YXR1c0l0ZW0yID0gcmVxdWlyZSgnLi9TdGF0dXNJdGVtJyk7XG5cbnZhciBfU3RhdHVzSXRlbTMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TdGF0dXNJdGVtMik7XG5cbnZhciBfcGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3BhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcGF0aCk7XG5cbnZhciBfYXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9hcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBpKTtcblxudmFyIF9jZWxsc1NkayA9IHJlcXVpcmUoJ2NlbGxzLXNkaycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBGb2xkZXJJdGVtID0gZnVuY3Rpb24gKF9TdGF0dXNJdGVtKSB7XG4gICAgX2luaGVyaXRzKEZvbGRlckl0ZW0sIF9TdGF0dXNJdGVtKTtcblxuICAgIGZ1bmN0aW9uIEZvbGRlckl0ZW0ocGF0aCwgdGFyZ2V0Tm9kZSkge1xuICAgICAgICB2YXIgcGFyZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBudWxsO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGb2xkZXJJdGVtKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoRm9sZGVySXRlbS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEZvbGRlckl0ZW0pKS5jYWxsKHRoaXMsICdmb2xkZXInLCB0YXJnZXROb2RlLCBwYXJlbnQpKTtcblxuICAgICAgICBfdGhpcy5fbmV3ID0gdHJ1ZTtcbiAgICAgICAgX3RoaXMuX2xhYmVsID0gX3BhdGgyLmRlZmF1bHQuZ2V0QmFzZW5hbWUocGF0aCk7XG4gICAgICAgIF90aGlzLmNoaWxkcmVuLnBnW190aGlzLmdldElkKCldID0gMDtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgcGFyZW50LmFkZENoaWxkKF90aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEZvbGRlckl0ZW0sIFt7XG4gICAgICAgIGtleTogJ2lzTmV3JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzTmV3KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25ldztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnX2RvUHJvY2VzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZG9Qcm9jZXNzKGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgZnVsbFBhdGggPSB2b2lkIDA7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZ1bGxQYXRoID0gdGhpcy5nZXRGdWxsUGF0aCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0Vycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLlRyZWVTZXJ2aWNlQXBpKF9hcGkyLmRlZmF1bHQuZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9jZWxsc1Nkay5SZXN0Q3JlYXRlTm9kZXNSZXF1ZXN0KCk7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IG5ldyBfY2VsbHNTZGsuVHJlZU5vZGUoKTtcblxuICAgICAgICAgICAgbm9kZS5QYXRoID0gZnVsbFBhdGg7XG4gICAgICAgICAgICBub2RlLlR5cGUgPSBfY2VsbHNTZGsuVHJlZU5vZGVUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QoJ0NPTExFQ1RJT04nKTtcbiAgICAgICAgICAgIHJlcXVlc3QuTm9kZXMgPSBbbm9kZV07XG5cbiAgICAgICAgICAgIGFwaS5jcmVhdGVOb2RlcyhyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXR1cyhfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNMb2FkZWQpO1xuICAgICAgICAgICAgICAgIF90aGlzMi5jaGlsZHJlbi5wZ1tfdGhpczIuZ2V0SWQoKV0gPSAxMDA7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnJlY29tcHV0ZVByb2dyZXNzKCk7XG4gICAgICAgICAgICAgICAgY29tcGxldGVDYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRm9sZGVySXRlbTtcbn0oX1N0YXR1c0l0ZW0zLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBGb2xkZXJJdGVtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfU3RhdHVzSXRlbTIgPSByZXF1aXJlKCcuL1N0YXR1c0l0ZW0nKTtcblxudmFyIF9TdGF0dXNJdGVtMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1N0YXR1c0l0ZW0yKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBQYXJ0SXRlbSA9IGZ1bmN0aW9uIChfU3RhdHVzSXRlbSkge1xuICAgIF9pbmhlcml0cyhQYXJ0SXRlbSwgX1N0YXR1c0l0ZW0pO1xuXG4gICAgZnVuY3Rpb24gUGFydEl0ZW0ocGFyZW50LCBpbmRleCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGFydEl0ZW0pO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChQYXJ0SXRlbS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFBhcnRJdGVtKSkuY2FsbCh0aGlzLCAncGFydCcsIG51bGwsIHBhcmVudCkpO1xuXG4gICAgICAgIF90aGlzLl9sYWJlbCA9ICdQYXJ0ICcgKyBpbmRleDtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQYXJ0SXRlbSwgW3tcbiAgICAgICAga2V5OiAnc2V0UHJvZ3Jlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UHJvZ3Jlc3MobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBieXRlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCdwcm9ncmVzcycsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIGlmIChieXRlcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCdieXRlcycsIGJ5dGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQYXJ0SXRlbTtcbn0oX1N0YXR1c0l0ZW0zLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBQYXJ0SXRlbTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfYXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9hcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBpKTtcblxudmFyIF9wYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXRoKTtcblxudmFyIF9Gb2xkZXJJdGVtMiA9IHJlcXVpcmUoJy4vRm9sZGVySXRlbScpO1xuXG52YXIgX0ZvbGRlckl0ZW0zID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRm9sZGVySXRlbTIpO1xuXG52YXIgX1N0YXR1c0l0ZW0gPSByZXF1aXJlKCcuL1N0YXR1c0l0ZW0nKTtcblxudmFyIF9TdGF0dXNJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1N0YXR1c0l0ZW0pO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7IHJldHVybiBmdW5jdGlvbiAoKSB7IHZhciBnZW4gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBmdW5jdGlvbiBzdGVwKGtleSwgYXJnKSB7IHRyeSB7IHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTsgdmFyIHZhbHVlID0gaW5mby52YWx1ZTsgfSBjYXRjaCAoZXJyb3IpIHsgcmVqZWN0KGVycm9yKTsgcmV0dXJuOyB9IGlmIChpbmZvLmRvbmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0gZWxzZSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7IHN0ZXAoXCJuZXh0XCIsIHZhbHVlKTsgfSwgZnVuY3Rpb24gKGVycikgeyBzdGVwKFwidGhyb3dcIiwgZXJyKTsgfSk7IH0gfSByZXR1cm4gc3RlcChcIm5leHRcIik7IH0pOyB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIFNlc3Npb24gPSBmdW5jdGlvbiAoX0ZvbGRlckl0ZW0pIHtcbiAgICBfaW5oZXJpdHMoU2Vzc2lvbiwgX0ZvbGRlckl0ZW0pO1xuXG4gICAgZnVuY3Rpb24gU2Vzc2lvbihyZXBvc2l0b3J5SWQsIHRhcmdldE5vZGUpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNlc3Npb24pO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChTZXNzaW9uLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoU2Vzc2lvbikpLmNhbGwodGhpcywgJy8nLCB0YXJnZXROb2RlKSk7XG5cbiAgICAgICAgX3RoaXMuX3JlcG9zaXRvcnlJZCA9IHJlcG9zaXRvcnlJZDtcbiAgICAgICAgX3RoaXMuX3N0YXR1cyA9IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0FuYWx5emU7XG4gICAgICAgIGRlbGV0ZSBfdGhpcy5jaGlsZHJlbi5wZ1tfdGhpcy5nZXRJZCgpXTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTZXNzaW9uLCBbe1xuICAgICAgICBrZXk6ICdnZXRGdWxsUGF0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRGdWxsUGF0aCgpIHtcbiAgICAgICAgICAgIHZhciByZXBvTGlzdCA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLnVzZXIuZ2V0UmVwb3NpdG9yaWVzTGlzdCgpO1xuICAgICAgICAgICAgaWYgKCFyZXBvTGlzdC5oYXModGhpcy5fcmVwb3NpdG9yeUlkKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlcG9zaXRvcnkgZGlzY29ubmVjdGVkP1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzbHVnID0gcmVwb0xpc3QuZ2V0KHRoaXMuX3JlcG9zaXRvcnlJZCkuZ2V0U2x1ZygpO1xuICAgICAgICAgICAgdmFyIGZ1bGxQYXRoID0gdGhpcy5fdGFyZ2V0Tm9kZS5nZXRQYXRoKCk7XG4gICAgICAgICAgICBmdWxsUGF0aCA9IExhbmdVdGlscy50cmltUmlnaHQoZnVsbFBhdGgsICcvJyk7XG4gICAgICAgICAgICBpZiAoZnVsbFBhdGgubm9ybWFsaXplKSB7XG4gICAgICAgICAgICAgICAgZnVsbFBhdGggPSBmdWxsUGF0aC5ub3JtYWxpemUoJ05GQycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVsbFBhdGggPSBzbHVnICsgZnVsbFBhdGg7XG4gICAgICAgICAgICByZXR1cm4gZnVsbFBhdGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3RyZWVWaWV3RnJvbU1hdGVyaWFsUGF0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB0cmVlVmlld0Zyb21NYXRlcmlhbFBhdGgobWVyZ2VkKSB7XG4gICAgICAgICAgICB2YXIgdHJlZSA9IFtdO1xuICAgICAgICAgICAgT2JqZWN0LmtleXMobWVyZ2VkKS5mb3JFYWNoKGZ1bmN0aW9uIChwYXRoKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcGF0aFBhcnRzID0gcGF0aC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgIHBhdGhQYXJ0cy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50TGV2ZWwgPSB0cmVlO1xuICAgICAgICAgICAgICAgIHBhdGhQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBleGlzdGluZ1BhdGggPSBjdXJyZW50TGV2ZWwuZmluZChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEubmFtZSA9PT0gcGFydDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1BhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRMZXZlbCA9IGV4aXN0aW5nUGF0aC5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdQYXJ0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogbWVyZ2VkW3BhdGhdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudExldmVsLnB1c2gobmV3UGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TGV2ZWwgPSBuZXdQYXJ0LmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cmVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdidWxrU3RhdFNsaWNlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBidWxrU3RhdFNsaWNlZChhcGksIG5vZGVQYXRocywgc2xpY2VTaXplKSB7XG4gICAgICAgICAgICB2YXIgcCA9IFByb21pc2UucmVzb2x2ZSh7IE5vZGVzOiBbXSB9KTtcbiAgICAgICAgICAgIHZhciBzbGljZSA9IG5vZGVQYXRocy5zbGljZSgwLCBzbGljZVNpemUpO1xuXG4gICAgICAgICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcCgpIHtcbiAgICAgICAgICAgICAgICBub2RlUGF0aHMgPSBub2RlUGF0aHMuc2xpY2Uoc2xpY2VTaXplKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBfY2VsbHNTZGsuUmVzdEdldEJ1bGtNZXRhUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuTm9kZVBhdGhzID0gc2xpY2U7XG4gICAgICAgICAgICAgICAgcCA9IHAudGhlbihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXBpLmJ1bGtTdGF0Tm9kZXMocmVxdWVzdCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHIuTm9kZXMgPSByLk5vZGVzLmNvbmNhdChyZXNwb25zZS5Ob2RlcyB8fCBbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2xpY2UgPSBub2RlUGF0aHMuc2xpY2UoMCwgc2xpY2VTaXplKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdoaWxlIChzbGljZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBfbG9vcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3ByZXBhcmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcHJlcGFyZShvdmVyd3JpdGVTdGF0dXMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAob3ZlcndyaXRlU3RhdHVzID09PSAnb3ZlcndyaXRlJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKCdyZWFkeScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjb25mID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0UGx1Z2luQ29uZmlncyhcInVwbG9hZGVyLmh0bWxcIikuZ2V0KFwiREVGQVVMVF9TVEFUX1NMSUNFU1wiKTtcbiAgICAgICAgICAgIHZhciBzbGljZVNpemUgPSA0MDA7XG4gICAgICAgICAgICBpZiAoY29uZiAmJiAhaXNOYU4ocGFyc2VJbnQoY29uZikpKSB7XG4gICAgICAgICAgICAgICAgc2xpY2VTaXplID0gcGFyc2VJbnQoY29uZik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0FuYWx5emUpO1xuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuVHJlZVNlcnZpY2VBcGkoX2FwaTIuZGVmYXVsdC5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX2NlbGxzU2RrLlJlc3RHZXRCdWxrTWV0YVJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3QuTm9kZVBhdGhzID0gW107XG4gICAgICAgICAgICB2YXIgd2Fsa1R5cGUgPSAnYm90aCc7XG4gICAgICAgICAgICBpZiAob3ZlcndyaXRlU3RhdHVzID09PSAncmVuYW1lJykge1xuICAgICAgICAgICAgICAgIHdhbGtUeXBlID0gJ2ZpbGUnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLndhbGsoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lk5vZGVQYXRocy5wdXNoKGl0ZW0uZ2V0RnVsbFBhdGgoKSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LCB3YWxrVHlwZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb21zID0gW107XG4gICAgICAgICAgICAgICAgX3RoaXMyLmJ1bGtTdGF0U2xpY2VkKGFwaSwgcmVxdWVzdC5Ob2RlUGF0aHMsIHNsaWNlU2l6ZSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5Ob2RlcyB8fCAhcmVzcG9uc2UuTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdHVzKCdyZWFkeScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShwcm9tcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAob3ZlcndyaXRlU3RhdHVzID09PSAnYWxlcnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdHVzKCdjb25maXJtJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1TdGF0ZWQgPSBmdW5jdGlvbiBpdGVtU3RhdGVkKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5Ob2Rlcy5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbi5QYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5kZXhPZihpdGVtLmdldEZ1bGxQYXRoKCkpICE9PSAtMTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVuYW1lRmlsZXMgPSBmdW5jdGlvbiByZW5hbWVGaWxlcygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi53YWxrKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1TdGF0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChuZXcgUHJvbWlzZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgX3JlZiA9IF9hc3luY1RvR2VuZXJhdG9yKHJlZ2VuZXJhdG9yUnVudGltZS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUocmVzb2x2ZTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UGF0aCwgbmV3TGFiZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2VuZXJhdG9yUnVudGltZS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUkKF9jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9jb250ZXh0LnByZXYgPSBfY29udGV4dC5uZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dC5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5uZXdQYXRoKGl0ZW0uZ2V0RnVsbFBhdGgoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBfY29udGV4dC5zZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdMYWJlbCA9IF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKG5ld1BhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udXBkYXRlTGFiZWwobmV3TGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlMSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY29udGV4dC5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBfY2FsbGVlLCBfdGhpczIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKF94KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0oKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICdmaWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbXMpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdmVyd3JpdGVTdGF0dXMgPT09ICdyZW5hbWUtZm9sZGVycycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb2xkZXJQcm9tcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvbGRlclByb20gPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi53YWxrKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyUHJvbSA9IGZvbGRlclByb20udGhlbihfYXN5bmNUb0dlbmVyYXRvcihyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBfY2FsbGVlMigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1BhdGgsIG5ld0xhYmVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gX2NhbGxlZTIkKF9jb250ZXh0Mikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9jb250ZXh0Mi5wcmV2ID0gX2NvbnRleHQyLm5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtU3RhdGVkKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSA2O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMyLm5ld1BhdGgoaXRlbS5nZXRGdWxsUGF0aCgpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gX2NvbnRleHQyLnNlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdMYWJlbCA9IF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKG5ld1BhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnVwZGF0ZUxhYmVsKG5ld0xhYmVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLnN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIF9jYWxsZWUyLCBfdGhpczIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAnZm9sZGVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJQcm9tLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZW5hbWVGaWxlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocHJvbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdHVzKCdyZWFkeScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocHJvbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5hbWVGaWxlcygpLnRoZW4oZnVuY3Rpb24gKHByb21zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXR1cygncmVhZHknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHByb21zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbmV3UGF0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBuZXdQYXRoKGZ1bGxwYXRoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JlZjMgPSBfYXN5bmNUb0dlbmVyYXRvcihyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBfY2FsbGVlMyhyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0U2xhc2gsIHBvcywgcGF0aCwgZXh0LCBuZXdQYXRoLCBjb3VudGVyLCBleGlzdHM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBfY2FsbGVlMyQoX2NvbnRleHQzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQzLnByZXYgPSBfY29udGV4dDMubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2xhc2ggPSBmdWxscGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0gZnVsbHBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBmdWxscGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dCA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9zID4gLTEgJiYgbGFzdFNsYXNoIDwgcG9zICYmIHBvcyA+IGxhc3RTbGFzaCArIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gZnVsbHBhdGguc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ID0gZnVsbHBhdGguc3Vic3RyaW5nKHBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBmdWxscGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RzID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMTY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSBwYXRoICsgJy0nICsgY291bnRlciArIGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMTM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLm5vZGVFeGlzdHMobmV3UGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0cyA9IF9jb250ZXh0My5zZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSA4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxNjpcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXdQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCBfY2FsbGVlMywgX3RoaXMzKTtcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKF94Mikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlZjMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbm9kZUV4aXN0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBub2RlRXhpc3RzKGZ1bGxwYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5UcmVlU2VydmljZUFwaShfYXBpMi5kZWZhdWx0LmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX2NlbGxzU2RrLlJlc3RHZXRCdWxrTWV0YVJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lk5vZGVQYXRocyA9IFtmdWxscGF0aF07XG4gICAgICAgICAgICAgICAgYXBpLmJ1bGtTdGF0Tm9kZXMocmVxdWVzdCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLk5vZGVzICYmIHJlc3BvbnNlLk5vZGVzWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFNlc3Npb247XG59KF9Gb2xkZXJJdGVtMy5kZWZhdWx0KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gU2Vzc2lvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX29ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9vYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29ic2VydmFibGUpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBTdGF0dXNJdGVtID0gZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKFN0YXR1c0l0ZW0sIF9PYnNlcnZhYmxlKTtcblxuICAgIGZ1bmN0aW9uIFN0YXR1c0l0ZW0odHlwZSwgdGFyZ2V0Tm9kZSkge1xuICAgICAgICB2YXIgcGFyZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBudWxsO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTdGF0dXNJdGVtKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoU3RhdHVzSXRlbS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFN0YXR1c0l0ZW0pKS5jYWxsKHRoaXMpKTtcblxuICAgICAgICBfdGhpcy5fc3RhdHVzID0gU3RhdHVzSXRlbS5TdGF0dXNOZXc7XG4gICAgICAgIF90aGlzLl90eXBlID0gdHlwZTtcbiAgICAgICAgX3RoaXMuX2lkID0gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgX3RoaXMuX2Vycm9yTWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuICAgICAgICBfdGhpcy5fcmVwb3NpdG9yeUlkID0gcGFyZW50ID8gcGFyZW50LmdldFJlcG9zaXRvcnlJZCgpIDogcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5O1xuICAgICAgICBfdGhpcy5fZXhpc3RzID0gZmFsc2U7XG4gICAgICAgIF90aGlzLl9wcm9ncmVzcyA9IDA7XG4gICAgICAgIF90aGlzLmNoaWxkcmVuID0geyBmb2xkZXJzOiBbXSwgZmlsZXM6IFtdLCBwZzoge30gfTtcbiAgICAgICAgX3RoaXMuX3RhcmdldE5vZGUgPSB0YXJnZXROb2RlO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICBfdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFN0YXR1c0l0ZW0uVHlwZUZvbGRlcikge1xuICAgICAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbi5mb2xkZXJzLnB1c2goX3RoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4uZmlsZXMucHVzaChfdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTdGF0dXNJdGVtLCBbe1xuICAgICAgICBrZXk6ICdnZXRJZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pZDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0UGFyZW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBhcmVudCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExhYmVsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExhYmVsKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xhYmVsLm5vcm1hbGl6ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9sYWJlbC5ub3JtYWxpemUoJ05GQycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbGFiZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZUxhYmVsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUxhYmVsKGxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLl9sYWJlbCA9IGxhYmVsO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRGdWxsUGF0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRGdWxsUGF0aCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQuZ2V0RnVsbFBhdGgoKSArICcvJyArIHRoaXMuZ2V0TGFiZWwoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0UHJvZ3Jlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UHJvZ3Jlc3MoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJvZ3Jlc3M7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldEV4aXN0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRFeGlzdHMoKSB7XG4gICAgICAgICAgICB0aGlzLl9leGlzdHMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRFeGlzdHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RXhpc3RzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4aXN0cztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0VHlwZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRUeXBlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFN0YXR1cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRTdGF0dXMoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3RhdHVzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRTdGF0dXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0U3RhdHVzKHN0YXR1cykge1xuICAgICAgICAgICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3N0YXR1cycsIHN0YXR1cyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZVJlcG9zaXRvcnlJZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVSZXBvc2l0b3J5SWQocmVwb3NpdG9yeUlkKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBvc2l0b3J5SWQgPSByZXBvc2l0b3J5SWQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFJlcG9zaXRvcnlJZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRSZXBvc2l0b3J5SWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeUlkO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRFcnJvck1lc3NhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RXJyb3JNZXNzYWdlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Vycm9yTWVzc2FnZSB8fCAnJztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25FcnJvcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkVycm9yKGVycm9yTWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5fZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoU3RhdHVzSXRlbS5TdGF0dXNFcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Byb2Nlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2Vzcyhjb21wbGV0ZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLl9kb1Byb2Nlc3MoY29tcGxldGVDYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Fib3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFib3J0KGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kb0Fib3J0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZG9BYm9ydChjb21wbGV0ZUNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncGF1c2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZG9QYXVzZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0dXMgPSB0aGlzLl9kb1BhdXNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoc3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVzdW1lJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc3VtZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kb1Jlc3VtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RvUmVzdW1lKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoU3RhdHVzSXRlbS5TdGF0dXNMb2FkaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWRkQ2hpbGQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkQ2hpbGQoY2hpbGQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnBnW2NoaWxkLmdldElkKCldID0gMDtcbiAgICAgICAgICAgIGNoaWxkLm9ic2VydmUoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLmNoaWxkcmVuLnBnW2NoaWxkLmdldElkKCldID0gcHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnJlY29tcHV0ZVByb2dyZXNzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVjb21wdXRlUHJvZ3Jlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVjb21wdXRlUHJvZ3Jlc3MoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFjY3UgPSBPYmplY3Qua2V5cyh0aGlzLmNoaWxkcmVuLnBnKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLmNoaWxkcmVuLnBnW2tdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYWNjdS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VtID0gYWNjdS5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzID0gc3VtIC8gYWNjdS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3Byb2dyZXNzJywgdGhpcy5fcHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmVDaGlsZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVDaGlsZChjaGlsZCkge1xuXG4gICAgICAgICAgICBjaGlsZC5hYm9ydCgpO1xuICAgICAgICAgICAgY2hpbGQud2FsayhmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgICAgIGMuYWJvcnQoKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sIFN0YXR1c0l0ZW0uVHlwZUZpbGUpO1xuXG4gICAgICAgICAgICB2YXIgaWQgPSBjaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgdmFyIGZvbGRlckluZGV4ID0gdGhpcy5jaGlsZHJlbi5mb2xkZXJzLmluZGV4T2YoY2hpbGQpO1xuICAgICAgICAgICAgdmFyIGZpbGVJbmRleCA9IHRoaXMuY2hpbGRyZW4uZmlsZXMuaW5kZXhPZihjaGlsZCk7XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZm9sZGVySW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9sZGVycyA9IExhbmdVdGlscy5hcnJheVdpdGhvdXQodGhpcy5jaGlsZHJlbi5mb2xkZXJzLCBmb2xkZXJJbmRleCk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGVJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5maWxlcyA9IExhbmdVdGlscy5hcnJheVdpdGhvdXQodGhpcy5jaGlsZHJlbi5maWxlcywgZmlsZUluZGV4KTtcbiAgICAgICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuc3RvcE9ic2VydmluZygncHJvZ3Jlc3MnKTtcblxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNoaWxkcmVuLnBnW2lkXTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY29tcHV0ZVByb2dyZXNzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2NoaWxkcmVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldENoaWxkcmVuJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENoaWxkcmVuKCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5jaGlsZHJlbi5mb2xkZXJzKSwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuY2hpbGRyZW4uZmlsZXMpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnd2FsaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB3YWxrKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IFN0YXR1c0l0ZW0uVHlwZUJvdGg7XG4gICAgICAgICAgICB2YXIgc3RvcCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFN0YXR1c0l0ZW0uVHlwZUJvdGggfHwgdHlwZSA9PT0gU3RhdHVzSXRlbS5UeXBlRmlsZSkge1xuICAgICAgICAgICAgICAgIHZhciBmaWxlcyA9IHRoaXMuY2hpbGRyZW4uZmlsZXM7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcChmaWxlc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcihmaWxlc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZpbGVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb2xkZXJzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh0eXBlID09PSBTdGF0dXNJdGVtLlR5cGVGb2xkZXIgfHwgdHlwZSA9PT0gU3RhdHVzSXRlbS5UeXBlQm90aCkgJiYgZmlsdGVyKGNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghc3RvcChjaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQud2FsayhjYWxsYmFjaywgZmlsdGVyLCB0eXBlLCBzdG9wKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29sbGVjdFdpdGhMaW1pdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb2xsZWN0V2l0aExpbWl0KGxpbWl0KSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6ICdib3RoJztcblxuICAgICAgICAgICAgdmFyIGFjY3UgPSBbXTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIGNhbGxiYWNrKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBhY2N1LnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHN0b3AgPSBmdW5jdGlvbiBzdG9wKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjdS5sZW5ndGggPj0gbGltaXQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy53YWxrKGNhbGxiYWNrLCBmaWx0ZXIsIHR5cGUsIHN0b3ApO1xuICAgICAgICAgICAgcmV0dXJuIGFjY3U7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3RhdHVzSXRlbTtcbn0oX29ic2VydmFibGUyLmRlZmF1bHQpO1xuXG5TdGF0dXNJdGVtLlN0YXR1c05ldyA9ICduZXcnO1xuU3RhdHVzSXRlbS5TdGF0dXNBbmFseXplID0gJ2FuYWx5c2UnO1xuU3RhdHVzSXRlbS5TdGF0dXNMb2FkaW5nID0gJ2xvYWRpbmcnO1xuU3RhdHVzSXRlbS5TdGF0dXNMb2FkZWQgPSAnbG9hZGVkJztcblN0YXR1c0l0ZW0uU3RhdHVzRXJyb3IgPSAnZXJyb3InO1xuU3RhdHVzSXRlbS5TdGF0dXNQYXVzZSA9ICdwYXVzZSc7XG5TdGF0dXNJdGVtLlN0YXR1c0Nhbm5vdFBhdXNlID0gJ2Nhbm5vdC1wYXVzZSc7XG5TdGF0dXNJdGVtLlN0YXR1c011bHRpUGF1c2UgPSAnbXVsdGktcGF1c2UnO1xuXG5TdGF0dXNJdGVtLlR5cGVGb2xkZXIgPSAnZm9sZGVyJztcblN0YXR1c0l0ZW0uVHlwZUZpbGUgPSAnZmlsZSc7XG5TdGF0dXNJdGVtLlR5cGVCb3RoID0gJ2JvdGgnO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBTdGF0dXNJdGVtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9sYW5nID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbnZhciBfbGFuZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sYW5nKTtcblxudmFyIF9wYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXRoKTtcblxudmFyIF9vYnNlcnZhYmxlID0gcmVxdWlyZSgncHlkaW8vbGFuZy9vYnNlcnZhYmxlJyk7XG5cbnZhciBfb2JzZXJ2YWJsZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9vYnNlcnZhYmxlKTtcblxudmFyIF9UYXNrID0gcmVxdWlyZSgnLi9UYXNrJyk7XG5cbnZhciBfVGFzazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9UYXNrKTtcblxudmFyIF9Db25maWdzID0gcmVxdWlyZSgnLi9Db25maWdzJyk7XG5cbnZhciBfQ29uZmlnczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Db25maWdzKTtcblxudmFyIF9TdGF0dXNJdGVtID0gcmVxdWlyZSgnLi9TdGF0dXNJdGVtJyk7XG5cbnZhciBfU3RhdHVzSXRlbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TdGF0dXNJdGVtKTtcblxudmFyIF9VcGxvYWRJdGVtID0gcmVxdWlyZSgnLi9VcGxvYWRJdGVtJyk7XG5cbnZhciBfVXBsb2FkSXRlbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9VcGxvYWRJdGVtKTtcblxudmFyIF9Gb2xkZXJJdGVtID0gcmVxdWlyZSgnLi9Gb2xkZXJJdGVtJyk7XG5cbnZhciBfRm9sZGVySXRlbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Gb2xkZXJJdGVtKTtcblxudmFyIF9TZXNzaW9uID0gcmVxdWlyZSgnLi9TZXNzaW9uJyk7XG5cbnZhciBfU2Vzc2lvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TZXNzaW9uKTtcblxudmFyIF9sb2Rhc2ggPSByZXF1aXJlKCdsb2Rhc2guZGVib3VuY2UnKTtcblxudmFyIF9sb2Rhc2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9kYXNoKTtcblxudmFyIF9hcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX2FwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGkpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIFN0b3JlID0gZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKFN0b3JlLCBfT2JzZXJ2YWJsZSk7XG5cbiAgICBmdW5jdGlvbiBTdG9yZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFN0b3JlKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoU3RvcmUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTdG9yZSkpLmNhbGwodGhpcykpO1xuXG4gICAgICAgIF90aGlzLl9wcm9jZXNzaW5nID0gW107XG4gICAgICAgIF90aGlzLl9zZXNzaW9ucyA9IFtdO1xuICAgICAgICBfdGhpcy5fYmxhY2tsaXN0ID0gW1wiLmRzX3N0b3JlXCIsIFwiLnB5ZGlvXCJdO1xuXG4gICAgICAgIF90aGlzLl9wYXVzZVJlcXVpcmVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU3RvcmUsIFt7XG4gICAgICAgIGtleTogJ2dldEF1dG9TdGFydCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRBdXRvU3RhcnQoKSB7XG4gICAgICAgICAgICByZXR1cm4gX0NvbmZpZ3MyLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRBdXRvU3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHVzaFNlc3Npb24nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcHVzaFNlc3Npb24oc2Vzc2lvbikge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zLnB1c2goc2Vzc2lvbik7XG4gICAgICAgICAgICBzZXNzaW9uLlRhc2sgPSBfVGFzazIuZGVmYXVsdC5jcmVhdGUoc2Vzc2lvbik7XG4gICAgICAgICAgICBzZXNzaW9uLm9ic2VydmUoJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2Vzc2lvbi5vYnNlcnZlKCdjaGlsZHJlbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRDaGlsZHJlbigpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIucmVtb3ZlU2Vzc2lvbihzZXNzaW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3RoaXMyLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgIHNlc3Npb24ub2JzZXJ2ZSgnc3RhdHVzJywgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocyA9PT0gJ3JlYWR5Jykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXV0b1N0YXJ0ID0gX3RoaXMyLmdldEF1dG9TdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0b1N0YXJ0ICYmICFfdGhpczIuX3Byb2Nlc3NpbmcubGVuZ3RoICYmICFfdGhpczIuX3BhdXNlUmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9jZXNzTmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFhdXRvU3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFN0b3JlLm9wZW5VcGxvYWREaWFsb2coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocyA9PT0gJ2NvbmZpcm0nKSB7XG4gICAgICAgICAgICAgICAgICAgIFN0b3JlLm9wZW5VcGxvYWREaWFsb2codHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgnc2Vzc2lvbl9hZGRlZCcsIHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmVTZXNzaW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVNlc3Npb24oc2Vzc2lvbikge1xuICAgICAgICAgICAgc2Vzc2lvbi5UYXNrLnNldElkbGUoKTtcbiAgICAgICAgICAgIHZhciBpID0gdGhpcy5fc2Vzc2lvbnMuaW5kZXhPZihzZXNzaW9uKTtcbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zID0gX2xhbmcyLmRlZmF1bHQuYXJyYXlXaXRob3V0KHRoaXMuX3Nlc3Npb25zLCBpKTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9nJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvZygpIHt9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYXNRdWV1ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNRdWV1ZSgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IDA7XG4gICAgICAgICAgICB0aGlzLl9zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi53YWxrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMrKztcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5nZXRTdGF0dXMoKSA9PT0gX1N0YXR1c0l0ZW0yLmRlZmF1bHQuU3RhdHVzTmV3IHx8IGl0ZW0uZ2V0U3RhdHVzKCkgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c1BhdXNlIHx8IGl0ZW0uZ2V0U3RhdHVzKCkgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c011bHRpUGF1c2U7XG4gICAgICAgICAgICAgICAgfSwgJ2JvdGgnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcyA+PSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gaXRlbXMgPiAwO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYXNFcnJvcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaGFzRXJyb3JzKCkge1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gMDtcbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uLndhbGsoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtcysrO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmdldFN0YXR1cygpID09PSAnZXJyb3InO1xuICAgICAgICAgICAgICAgIH0sICdib3RoJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbXMgPj0gMTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zID4gMDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2xlYXJBbGwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJBbGwoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5jbGVhclN0YXR1cygnbmV3Jyk7XG4gICAgICAgICAgICB0aGlzLl9zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi53YWxrKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2V0UGFyZW50KCkucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi5UYXNrLnNldElkbGUoKTtcbiAgICAgICAgICAgICAgICBfdGhpczMucmVtb3ZlU2Vzc2lvbihzZXNzaW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fcGF1c2VSZXF1aXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhclN0YXR1cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhclN0YXR1cyhzdGF0dXMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uLndhbGsoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nZXRQYXJlbnQoKS5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5nZXRTdGF0dXMoKSA9PT0gc3RhdHVzO1xuICAgICAgICAgICAgICAgIH0sICdmaWxlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbW9uaXRvclByb2Nlc3NpbmcnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbW9uaXRvclByb2Nlc3NpbmcoaXRlbSkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5fcHJvY2Vzc2luZ01vbml0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9jZXNzaW5nTW9uaXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM0Lm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0ub2JzZXJ2ZSgnc3RhdHVzJywgdGhpcy5fcHJvY2Vzc2luZ01vbml0b3IpO1xuICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2luZy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1bm1vbml0b3JQcm9jZXNzaW5nJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVubW9uaXRvclByb2Nlc3NpbmcoaXRlbSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fcHJvY2Vzc2luZy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcHJvY2Vzc2luZ01vbml0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdG9wT2JzZXJ2aW5nKCdzdGF0dXMnLCB0aGlzLl9wcm9jZXNzaW5nTW9uaXRvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NpbmcgPSBfbGFuZzIuZGVmYXVsdC5hcnJheVdpdGhvdXQodGhpcy5fcHJvY2Vzc2luZywgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwcm9jZXNzTmV4dCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzTmV4dCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgZm9sZGVycyA9IHRoaXMuZ2V0Rm9sZGVycygpO1xuICAgICAgICAgICAgaWYgKGZvbGRlcnMubGVuZ3RoICYmICF0aGlzLl9wYXVzZVJlcXVpcmVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuVHJlZVNlcnZpY2VBcGkoX2FwaTIuZGVmYXVsdC5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9jZWxsc1Nkay5SZXN0Q3JlYXRlTm9kZXNSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5Ob2RlcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvbGRlcnMuZm9yRWFjaChmdW5jdGlvbiAoZm9sZGVySXRlbSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IG5ldyBfY2VsbHNTZGsuVHJlZU5vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5QYXRoID0gZm9sZGVySXRlbS5nZXRGdWxsUGF0aCgpO1xuICAgICAgICAgICAgICAgICAgICBub2RlLlR5cGUgPSBfY2VsbHNTZGsuVHJlZU5vZGVUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QoJ0NPTExFQ1RJT04nKTtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5Ob2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBmb2xkZXJJdGVtLnNldFN0YXR1cyhfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNMb2FkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM1Lm1vbml0b3JQcm9jZXNzaW5nKGZvbGRlckl0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBhcGkuY3JlYXRlTm9kZXMocmVxdWVzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRlcnMuZm9yRWFjaChmdW5jdGlvbiAoZm9sZGVySXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVySXRlbS5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0yLmRlZmF1bHQuU3RhdHVzTG9hZGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlckl0ZW0uY2hpbGRyZW4ucGdbZm9sZGVySXRlbS5nZXRJZCgpXSA9IDEwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlckl0ZW0ucmVjb21wdXRlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNS51bm1vbml0b3JQcm9jZXNzaW5nKGZvbGRlckl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM1LnByb2Nlc3NOZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzNS5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM1LnByb2Nlc3NOZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzNS5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHByb2Nlc3NhYmxlcyA9IHRoaXMuZ2V0TmV4dHMoKTtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzYWJsZXMubGVuZ3RoICYmICF0aGlzLl9wYXVzZVJlcXVpcmVkKSB7XG4gICAgICAgICAgICAgICAgcHJvY2Vzc2FibGVzLmZvckVhY2goZnVuY3Rpb24gKHByb2Nlc3NhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzNS5tb25pdG9yUHJvY2Vzc2luZyhwcm9jZXNzYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NhYmxlLnByb2Nlc3MoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1LnVubW9uaXRvclByb2Nlc3NpbmcocHJvY2Vzc2FibGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1LnByb2Nlc3NOZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhhc0Vycm9ycygpKSB7XG4gICAgICAgICAgICAgICAgICAgIFN0b3JlLm9wZW5VcGxvYWREaWFsb2coKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKF9Db25maWdzMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0QXV0b0Nsb3NlKCkgJiYgIXRoaXMuX3BhdXNlUmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoXCJhdXRvX2Nsb3NlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEZvbGRlcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Rm9sZGVycygpIHtcbiAgICAgICAgICAgIHZhciBtYXggPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDYwO1xuXG4gICAgICAgICAgICB2YXIgZm9sZGVycyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fc2Vzc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIHNlc3Npb24ud2FsayhmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBmb2xkZXJzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZ2V0U3RhdHVzKCkgPT09ICduZXcnO1xuICAgICAgICAgICAgICAgIH0sICdmb2xkZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb2xkZXJzLmxlbmd0aCA+PSBtYXg7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBmb2xkZXJzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXROZXh0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXROZXh0cygpIHtcbiAgICAgICAgICAgIHZhciBtYXggPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDM7XG5cbiAgICAgICAgICAgIHZhciBmb2xkZXJzID0gW107XG4gICAgICAgICAgICB0aGlzLl9zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi53YWxrKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRlcnMucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5nZXRTdGF0dXMoKSA9PT0gJ25ldyc7XG4gICAgICAgICAgICAgICAgfSwgJ2ZvbGRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvbGRlcnMubGVuZ3RoID49IDE7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChmb2xkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbZm9sZGVycy5zaGlmdCgpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHByb2Nlc3NpbmcgPSB0aGlzLl9wcm9jZXNzaW5nLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgc2Vzc0l0ZW1zID0gMDtcbiAgICAgICAgICAgICAgICBzZXNzaW9uLndhbGsoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc0l0ZW1zKys7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZ2V0U3RhdHVzKCkgPT09ICduZXcnIHx8IGl0ZW0uZ2V0U3RhdHVzKCkgPT09ICdwYXVzZSc7XG4gICAgICAgICAgICAgICAgfSwgJ2ZpbGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcy5sZW5ndGggPj0gbWF4IC0gcHJvY2Vzc2luZztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoc2Vzc0l0ZW1zID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb24uVGFzay5zZXRJZGxlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N0b3BPclJlbW92ZUl0ZW0nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcE9yUmVtb3ZlSXRlbShpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLmFib3J0KCk7XG4gICAgICAgICAgICB0aGlzLnVubW9uaXRvclByb2Nlc3NpbmcoaXRlbSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0U2Vzc2lvbnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0U2Vzc2lvbnMoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbnM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2lzUnVubmluZycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc1J1bm5pbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc2luZy5maWx0ZXIoZnVuY3Rpb24gKHUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdS5nZXRTdGF0dXMoKSA9PT0gX1N0YXR1c0l0ZW0yLmRlZmF1bHQuU3RhdHVzTG9hZGluZztcbiAgICAgICAgICAgIH0pLmxlbmd0aCA+IDA7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BhdXNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgICAgICAgdGhpcy5fcGF1c2VSZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzaW5nLmZvckVhY2goZnVuY3Rpb24gKHUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdS5wYXVzZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Jlc3VtZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXN1bWUoKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXVzZVJlcXVpcmVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHMuc2V0U3RhdHVzKCdyZWFkeScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzaW5nLmZvckVhY2goZnVuY3Rpb24gKHUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdS5yZXN1bWUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzTmV4dCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYW5kbGVGb2xkZXJQaWNrZXJSZXN1bHQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlRm9sZGVyUGlja2VyUmVzdWx0KGZpbGVzLCB0YXJnZXROb2RlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIG92ZXJ3cml0ZVN0YXR1cyA9IF9Db25maWdzMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0T3B0aW9uKFwiREVGQVVMVF9FWElTVElOR1wiLCBcInVwbG9hZF9leGlzdGluZ1wiKTtcbiAgICAgICAgICAgIHZhciBzZXNzaW9uID0gbmV3IF9TZXNzaW9uMi5kZWZhdWx0KF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSwgdGFyZ2V0Tm9kZSk7XG4gICAgICAgICAgICB0aGlzLnB1c2hTZXNzaW9uKHNlc3Npb24pO1xuXG4gICAgICAgICAgICB2YXIgbVBhdGhzID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGUgPSBmaWxlc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgbVBhdGggPSAnLycgKyBfcGF0aDIuZGVmYXVsdC5nZXRCYXNlbmFtZShmaWxlLm5hbWUpO1xuICAgICAgICAgICAgICAgIGlmIChmaWxlc1tpXVsnd2Via2l0UmVsYXRpdmVQYXRoJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgbVBhdGggPSAnLycgKyBmaWxlc1tpXVsnd2Via2l0UmVsYXRpdmVQYXRoJ107XG4gICAgICAgICAgICAgICAgICAgIHZhciBmb2xkZXJQYXRoID0gX3BhdGgyLmRlZmF1bHQuZ2V0RGlybmFtZShtUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvbGRlclBhdGggIT09ICcvJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbVBhdGhzW19wYXRoMi5kZWZhdWx0LmdldERpcm5hbWUoZm9sZGVyUGF0aCldID0gJ0ZPTERFUic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbVBhdGhzW2ZvbGRlclBhdGhdID0gJ0ZPTERFUic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1QYXRoc1ttUGF0aF0gPSBmaWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRyZWUgPSBzZXNzaW9uLnRyZWVWaWV3RnJvbU1hdGVyaWFsUGF0aChtUGF0aHMpO1xuICAgICAgICAgICAgdmFyIHJlY3Vyc2UgPSBmdW5jdGlvbiByZWN1cnNlKGNoaWxkcmVuLCBwYXJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLml0ZW0gPT09ICdGT0xERVInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZiA9IG5ldyBfRm9sZGVySXRlbTIuZGVmYXVsdChjaGlsZC5wYXRoLCB0YXJnZXROb2RlLCBwYXJlbnRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3Vyc2UoY2hpbGQuY2hpbGRyZW4sIGYpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzNi5fYmxhY2tsaXN0LmluZGV4T2YoX3BhdGgyLmRlZmF1bHQuZ2V0QmFzZW5hbWUoY2hpbGQucGF0aCkudG9Mb3dlckNhc2UoKSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHUgPSBuZXcgX1VwbG9hZEl0ZW0yLmRlZmF1bHQoY2hpbGQuaXRlbSwgdGFyZ2V0Tm9kZSwgY2hpbGQucGF0aCwgcGFyZW50SXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZWN1cnNlKHRyZWUsIHNlc3Npb24pO1xuICAgICAgICAgICAgc2Vzc2lvbi5wcmVwYXJlKG92ZXJ3cml0ZVN0YXR1cykuY2F0Y2goZnVuY3Rpb24gKGUpIHt9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaGFuZGxlRHJvcEV2ZW50UmVzdWx0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVEcm9wRXZlbnRSZXN1bHRzKGl0ZW1zLCBmaWxlcywgdGFyZ2V0Tm9kZSkge1xuICAgICAgICAgICAgdmFyIGFjY3VtdWxhdG9yID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBudWxsO1xuXG4gICAgICAgICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGZpbHRlckZ1bmN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBudWxsO1xuICAgICAgICAgICAgdmFyIHRhcmdldFJlcG9zaXRvcnlJZCA9IGFyZ3VtZW50cy5sZW5ndGggPiA1ICYmIGFyZ3VtZW50c1s1XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzVdIDogbnVsbDtcblxuXG4gICAgICAgICAgICB2YXIgb3ZlcndyaXRlU3RhdHVzID0gX0NvbmZpZ3MyLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRPcHRpb24oXCJERUZBVUxUX0VYSVNUSU5HXCIsIFwidXBsb2FkX2V4aXN0aW5nXCIpO1xuICAgICAgICAgICAgdmFyIHNlc3Npb24gPSBuZXcgX1Nlc3Npb24yLmRlZmF1bHQodGFyZ2V0UmVwb3NpdG9yeUlkIHx8IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSwgdGFyZ2V0Tm9kZSk7XG4gICAgICAgICAgICB0aGlzLnB1c2hTZXNzaW9uKHNlc3Npb24pO1xuICAgICAgICAgICAgdmFyIGZpbHRlciA9IGZ1bmN0aW9uIGZpbHRlcihyZWZQYXRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlckZ1bmN0aW9uICYmICFmaWx0ZXJGdW5jdGlvbihyZWZQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczcuX2JsYWNrbGlzdC5pbmRleE9mKF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKHJlZlBhdGgpLnRvTG93ZXJDYXNlKCkpID09PSAtMTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBlbnF1ZXVlID0gZnVuY3Rpb24gZW5xdWV1ZShpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzRm9sZGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGdW5jdGlvbiAmJiAhZmlsdGVyRnVuY3Rpb24oaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYWNjdW11bGF0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzRm9sZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb24ucHVzaEZvbGRlcihpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uLnB1c2hGaWxlKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggJiYgKGl0ZW1zWzBdLmdldEFzRW50cnkgfHwgaXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSkpIHtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSBnbG9iYWwuY29uc29sZSA/IGdsb2JhbC5jb25zb2xlLmxvZyA6IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbC5hbGVydChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gaXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW50cnkgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbXNbaV0ua2luZCAmJiBpdGVtc1tpXS5raW5kICE9PSAnZmlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2NvbnRpbnVlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtc1swXS5nZXRBc0VudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkgPSBpdGVtc1tpXS5nZXRBc0VudHJ5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5ID0gaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkuaXNGaWxlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkuZmlsZShmdW5jdGlvbiAoRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHUgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoRmlsZS5zaXplID4gMCAmJiBmaWx0ZXIoRmlsZS5uYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHUgPSBuZXcgX1VwbG9hZEl0ZW0yLmRlZmF1bHQoRmlsZSwgdGFyZ2V0Tm9kZSwgbnVsbCwgc2Vzc2lvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtlcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5mb2xkZXJJdGVtID0gbmV3IF9Gb2xkZXJJdGVtMi5kZWZhdWx0KGVudHJ5LmZ1bGxQYXRoLCB0YXJnZXROb2RlLCBzZXNzaW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2goX3RoaXM3LnJlY3Vyc2VEaXJlY3RvcnkoZW50cnksIGZ1bmN0aW9uIChmaWxlRW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlbGF0aXZlUGF0aCA9IGZpbGVFbnRyeS5mdWxsUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVFbnRyeS5maWxlKGZ1bmN0aW9uIChGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVJdGVtID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChGaWxlLnNpemUgPiAwICYmIGZpbHRlcihGaWxlLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVJdGVtID0gbmV3IF9VcGxvYWRJdGVtMi5kZWZhdWx0KEZpbGUsIHRhcmdldE5vZGUsIHJlbGF0aXZlUGF0aCwgZmlsZUVudHJ5LnBhcmVudEl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHVJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO2Vycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGZvbGRlckVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIoZm9sZGVyRW50cnkuZnVsbFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJFbnRyeS5mb2xkZXJJdGVtID0gbmV3IF9Gb2xkZXJJdGVtMi5kZWZhdWx0KGZvbGRlckVudHJ5LmZ1bGxQYXRoLCB0YXJnZXROb2RlLCBmb2xkZXJFbnRyeS5wYXJlbnRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZvbGRlckVudHJ5LmZvbGRlckl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9yZXQyID0gX2xvb3AoaSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfcmV0MiA9PT0gJ2NvbnRpbnVlJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2Vzc2lvbi5wcmVwYXJlKG92ZXJ3cml0ZVN0YXR1cykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM3Lm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGZpbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlc1tqXS5zaXplID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5uby1mb2xkZXJzLXN1cHBvcnQnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXIoZmlsZXNbal0ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXcgX1VwbG9hZEl0ZW0yLmRlZmF1bHQoZmlsZXNbal0sIHRhcmdldE5vZGUsIG51bGwsIHNlc3Npb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXNzaW9uLnByZXBhcmUob3ZlcndyaXRlU3RhdHVzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM3Lm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM3Lm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlY3Vyc2VEaXJlY3RvcnknLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVjdXJzZURpcmVjdG9yeShpdGVtLCBwcm9taXNlRmlsZSwgcHJvbWlzZUZvbGRlciwgZXJyb3JIYW5kbGVyKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM4ID0gdGhpcztcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXM4LmRpckVudHJpZXMoaXRlbSkudGhlbihmdW5jdGlvbiAoZW50cmllcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5LnBhcmVudCAmJiBlbnRyeS5wYXJlbnQuZm9sZGVySXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnBhcmVudEl0ZW0gPSBlbnRyeS5wYXJlbnQuZm9sZGVySXRlbTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZUZvbGRlcihlbnRyeSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHByb21pc2VGaWxlKGVudHJ5KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RpckVudHJpZXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlyRW50cmllcyhpdGVtKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM5ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHJlYWRlciA9IGl0ZW0uY3JlYXRlUmVhZGVyKCk7XG4gICAgICAgICAgICB2YXIgZW50cmllcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHRvQXJyYXkgPSBmdW5jdGlvbiB0b0FycmF5KGxpc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobGlzdCB8fCBbXSwgMCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkRW50cmllcyhmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cmllcyA9IGVudHJpZXMuY29uY2F0KHRvQXJyYXkocmVzdWx0cykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5wYXJlbnQgPSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2goX3RoaXM5LmRpckVudHJpZXMoZW50cnkpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cmllcyA9IGVudHJpZXMuY29uY2F0KGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9taXNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSwgW3tcbiAgICAgICAga2V5OiAnb3BlblVwbG9hZERpYWxvZycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuVXBsb2FkRGlhbG9nKCkge1xuICAgICAgICAgICAgdmFyIGNvbmZpcm0gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoY29uZmlybSkge1xuICAgICAgICAgICAgICAgIF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKFwidXBsb2FkXCIsIHsgY29uZmlybURpYWxvZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oXCJ1cGxvYWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEluc3RhbmNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RhbmNlKCkge1xuICAgICAgICAgICAgaWYgKCFTdG9yZS5fX0lOU1RBTkNFKSB7XG4gICAgICAgICAgICAgICAgU3RvcmUuX19JTlNUQU5DRSA9IG5ldyBTdG9yZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFN0b3JlLl9fSU5TVEFOQ0U7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3RvcmU7XG59KF9vYnNlcnZhYmxlMi5kZWZhdWx0KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gU3RvcmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbnZhciBfU3RhdHVzSXRlbSA9IHJlcXVpcmUoJy4vU3RhdHVzSXRlbScpO1xuXG52YXIgX1N0YXR1c0l0ZW0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU3RhdHVzSXRlbSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzIuZGVmYXVsdC5yZXF1aXJlTGliKFwiYm9vdFwiKSxcbiAgICBKb2JzU3RvcmUgPSBfUHlkaW8kcmVxdWlyZUxpYi5Kb2JzU3RvcmU7XG5cbnZhciBUYXNrID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFRhc2soc2Vzc2lvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUYXNrKTtcblxuICAgICAgICBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuICAgICAgICB0aGlzLmpvYiA9IG5ldyBfY2VsbHNTZGsuSm9ic0pvYigpO1xuICAgICAgICB0aGlzLmpvYi5JRCA9ICdsb2NhbC11cGxvYWQtdGFzay0nICsgc2Vzc2lvbi5nZXRJZCgpO1xuICAgICAgICB0aGlzLmpvYi5Pd25lciA9IHB5ZGlvLnVzZXIuaWQ7XG4gICAgICAgIHRoaXMuam9iLkxhYmVsID0gcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIudGFzay5sYWJlbCddO1xuICAgICAgICB0aGlzLmpvYi5TdG9wcGFibGUgPSB0cnVlO1xuICAgICAgICB2YXIgdGFzayA9IG5ldyBfY2VsbHNTZGsuSm9ic1Rhc2soKTtcbiAgICAgICAgdGhpcy50YXNrID0gdGFzaztcbiAgICAgICAgdGhpcy5qb2IuVGFza3MgPSBbdGhpcy50YXNrXTtcbiAgICAgICAgdGhpcy50YXNrLkhhc1Byb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50YXNrLklEID0gXCJ1cGxvYWRcIjtcbiAgICAgICAgdGhpcy50YXNrLlN0YXR1cyA9IF9jZWxsc1Nkay5Kb2JzVGFza1N0YXR1cy5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdJZGxlJyk7XG4gICAgICAgIHRoaXMuam9iLm9wZW5EZXRhaWxQYW5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHlkaW8uQ29udHJvbGxlci5maXJlQWN0aW9uKFwidXBsb2FkXCIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRhc2suX3N0YXR1c09ic2VydmVyID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIGlmIChzID09PSBfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNBbmFseXplKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuam9iLkxhYmVsID0gJ1ByZXBhcmluZyBmaWxlcyBmb3IgdXBsb2FkJztcbiAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRDaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrLlN0YXR1c01lc3NhZ2UgPSAnQW5hbHl6aW5nICgnICsgc2Vzc2lvbi5nZXRDaGlsZHJlbigpLmxlbmd0aCArICcpIGl0ZW1zJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXNrLlN0YXR1c01lc3NhZ2UgPSAnUGxlYXNlIHdhaXQuLi4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0YXNrLlN0YXR1cyA9IF9jZWxsc1Nkay5Kb2JzVGFza1N0YXR1cy5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdSdW5uaW5nJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHMgPT09ICdyZWFkeScpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5qb2IuTGFiZWwgPSBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci43J107XG4gICAgICAgICAgICAgICAgdGFzay5TdGF0dXNNZXNzYWdlID0gJ1JlYWR5IHRvIHVwbG9hZCc7XG4gICAgICAgICAgICAgICAgdGFzay5TdGF0dXMgPSBfY2VsbHNTZGsuSm9ic1Rhc2tTdGF0dXMuY29uc3RydWN0RnJvbU9iamVjdCgnSWRsZScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzID09PSAncGF1c2VkJykge1xuICAgICAgICAgICAgICAgIF90aGlzLmpvYi5MYWJlbCA9ICdUYXNrIHBhdXNlZCc7XG4gICAgICAgICAgICAgICAgdGFzay5TdGF0dXMgPSBfY2VsbHNTZGsuSm9ic1Rhc2tTdGF0dXMuY29uc3RydWN0RnJvbU9iamVjdCgnUGF1c2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5ub3RpZnlNYWluU3RvcmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGFzay5fcHJvZ3Jlc3NPYnNlcnZlciA9IGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICB0YXNrLlByb2dyZXNzID0gcCAvIDEwMDtcbiAgICAgICAgICAgIHRhc2suU3RhdHVzID0gX2NlbGxzU2RrLkpvYnNUYXNrU3RhdHVzLmNvbnN0cnVjdEZyb21PYmplY3QoJ1J1bm5pbmcnKTtcbiAgICAgICAgICAgIGlmIChwID4gMCkge1xuICAgICAgICAgICAgICAgIHRhc2suU3RhdHVzTWVzc2FnZSA9ICdVcGxvYWRpbmcgJyArIE1hdGguY2VpbChwKSArICclJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLm5vdGlmeU1haW5TdG9yZSgpO1xuICAgICAgICB9O1xuICAgICAgICBzZXNzaW9uLm9ic2VydmUoJ3N0YXR1cycsIHRhc2suX3N0YXR1c09ic2VydmVyKTtcbiAgICAgICAgc2Vzc2lvbi5vYnNlcnZlKCdwcm9ncmVzcycsIHRhc2suX3Byb2dyZXNzT2JzZXJ2ZXIpO1xuXG4gICAgICAgIHRhc2suX3N0YXR1c09ic2VydmVyKHNlc3Npb24uZ2V0U3RhdHVzKCkpO1xuICAgICAgICB0YXNrLl9wcm9ncmVzc09ic2VydmVyKHNlc3Npb24uZ2V0UHJvZ3Jlc3MoKSk7XG5cbiAgICAgICAgSm9ic1N0b3JlLmdldEluc3RhbmNlKCkuZW5xdWV1ZUxvY2FsSm9iKHRoaXMuam9iKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVGFzaywgW3tcbiAgICAgICAga2V5OiAnc2V0SWRsZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRJZGxlKCkge1xuICAgICAgICAgICAgdGhpcy50YXNrLlN0YXR1cyA9IF9jZWxsc1Nkay5Kb2JzVGFza1N0YXR1cy5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdJZGxlJyk7XG4gICAgICAgICAgICB0aGlzLnRhc2suU3RhdHVzTWVzc2FnZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlNYWluU3RvcmUoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbm90aWZ5TWFpblN0b3JlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG5vdGlmeU1haW5TdG9yZSgpIHtcbiAgICAgICAgICAgIHRoaXMudGFzay5TdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgICAgICAgICB0aGlzLmpvYi5UYXNrcyA9IFt0aGlzLnRhc2tdO1xuICAgICAgICAgICAgSm9ic1N0b3JlLmdldEluc3RhbmNlKCkuZW5xdWV1ZUxvY2FsSm9iKHRoaXMuam9iKTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdjcmVhdGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlKHNlc3Npb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGFzayhzZXNzaW9uKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUYXNrO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBUYXNrO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfU3RhdHVzSXRlbTIgPSByZXF1aXJlKCcuL1N0YXR1c0l0ZW0nKTtcblxudmFyIF9TdGF0dXNJdGVtMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1N0YXR1c0l0ZW0yKTtcblxudmFyIF9QYXJ0SXRlbSA9IHJlcXVpcmUoJy4vUGFydEl0ZW0nKTtcblxudmFyIF9QYXJ0SXRlbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9QYXJ0SXRlbSk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9wYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXRoKTtcblxudmFyIF9hcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX2FwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcGkpO1xuXG52YXIgX0NvbmZpZ3MgPSByZXF1aXJlKCcuL0NvbmZpZ3MnKTtcblxudmFyIF9Db25maWdzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbmZpZ3MpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIFVwbG9hZEl0ZW0gPSBmdW5jdGlvbiAoX1N0YXR1c0l0ZW0pIHtcbiAgICBfaW5oZXJpdHMoVXBsb2FkSXRlbSwgX1N0YXR1c0l0ZW0pO1xuXG4gICAgZnVuY3Rpb24gVXBsb2FkSXRlbShmaWxlLCB0YXJnZXROb2RlKSB7XG4gICAgICAgIHZhciByZWxhdGl2ZVBhdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG4gICAgICAgIHZhciBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IG51bGw7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVwbG9hZEl0ZW0pO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChVcGxvYWRJdGVtLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXBsb2FkSXRlbSkpLmNhbGwodGhpcywgJ2ZpbGUnLCB0YXJnZXROb2RlLCBwYXJlbnQpKTtcblxuICAgICAgICBfdGhpcy5fZmlsZSA9IGZpbGU7XG4gICAgICAgIF90aGlzLl9zdGF0dXMgPSAnbmV3JztcbiAgICAgICAgaWYgKHJlbGF0aXZlUGF0aCkge1xuICAgICAgICAgICAgX3RoaXMuX2xhYmVsID0gX3BhdGgyLmRlZmF1bHQuZ2V0QmFzZW5hbWUocmVsYXRpdmVQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLl9sYWJlbCA9IGZpbGUubmFtZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsZS5zaXplID4gX2FwaTIuZGVmYXVsdC5nZXRNdWx0aXBhcnRUaHJlc2hvbGQoKSkge1xuICAgICAgICAgICAgX3RoaXMuY3JlYXRlUGFydHMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICBwYXJlbnQuYWRkQ2hpbGQoX3RoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXBsb2FkSXRlbSwgW3tcbiAgICAgICAga2V5OiAnY3JlYXRlUGFydHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlUGFydHMoKSB7XG4gICAgICAgICAgICB2YXIgcGFydFNpemUgPSBfYXBpMi5kZWZhdWx0LmdldE11bHRpcGFydFBhcnRTaXplKCk7XG4gICAgICAgICAgICB0aGlzLl9wYXJ0cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLmNlaWwodGhpcy5fZmlsZS5zaXplIC8gcGFydFNpemUpOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0cy5wdXNoKG5ldyBfUGFydEl0ZW0yLmRlZmF1bHQodGhpcywgaSArIDEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0RmlsZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRGaWxlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFNpemUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0U2l6ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maWxlLnNpemU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEh1bWFuU2l6ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRIdW1hblNpemUoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3BhdGgyLmRlZmF1bHQucm91bmRGaWxlU2l6ZSh0aGlzLl9maWxlLnNpemUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRQcm9ncmVzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQcm9ncmVzcyhuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGJ5dGVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLl9wcm9ncmVzcyA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3Byb2dyZXNzJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgaWYgKGJ5dGVzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2J5dGVzJywgYnl0ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfcGFyc2VYSFJSZXNwb25zZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfcGFyc2VYSFJSZXNwb25zZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnhociAmJiB0aGlzLnhoci5yZXNwb25zZVRleHQgJiYgdGhpcy54aHIucmVzcG9uc2VUZXh0ICE9PSAnT0snKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCdVbmV4cGVjdGVkIHJlc3BvbnNlOiAnICsgdGhpcy54aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnX2RvUHJvY2VzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfZG9Qcm9jZXNzKGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLl91c2VyQWJvcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0xvYWRlZCk7XG4gICAgICAgICAgICAgICAgX3RoaXMyLl9wYXJzZVhIUlJlc3BvbnNlKCk7XG4gICAgICAgICAgICAgICAgY29tcGxldGVDYWxsYmFjaygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHByb2dyZXNzID0gZnVuY3Rpb24gcHJvZ3Jlc3MoY29tcHV0YWJsZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzMi5fc3RhdHVzID09PSBfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghY29tcHV0YWJsZUV2ZW50LnRvdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKGNvbXB1dGFibGVFdmVudC5sb2FkZWQgKiAxMDAgLyBjb21wdXRhYmxlRXZlbnQudG90YWwpO1xuICAgICAgICAgICAgICAgIHZhciBieXRlc0xvYWRlZCA9IGNvbXB1dGFibGVFdmVudC5sb2FkZWQ7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFByb2dyZXNzKHBlcmNlbnRhZ2UsIGJ5dGVzTG9hZGVkKTtcblxuICAgICAgICAgICAgICAgIGlmIChfdGhpczIuX3BhcnRzICYmIGNvbXB1dGFibGVFdmVudC5wYXJ0ICYmIF90aGlzMi5fcGFydHNbY29tcHV0YWJsZUV2ZW50LnBhcnQgLSAxXSAmJiBjb21wdXRhYmxlRXZlbnQucGFydExvYWRlZCAmJiBjb21wdXRhYmxlRXZlbnQucGFydFRvdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0ID0gX3RoaXMyLl9wYXJ0c1tjb21wdXRhYmxlRXZlbnQucGFydCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3Byb2dyZXNzID0gTWF0aC5yb3VuZChjb21wdXRhYmxlRXZlbnQucGFydExvYWRlZCAqIDEwMCAvIGNvbXB1dGFibGVFdmVudC5wYXJ0VG90YWwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3Byb2dyZXNzIDwgMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydC5nZXRTdGF0dXMoKSAhPT0gX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzQ2Fubm90UGF1c2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnNldFN0YXR1cyhfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNMb2FkaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGVja1BhdXNlID0gcGFydC5nZXRTdGF0dXMoKSA9PT0gX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzQ2Fubm90UGF1c2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnNldFN0YXR1cyhfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNMb2FkZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrUGF1c2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMyLl9wYXJ0cy5maWx0ZXIoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnQuZ2V0U3RhdHVzKCkgPT09IF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0Nhbm5vdFBhdXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c1BhdXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFydC5zZXRQcm9ncmVzcyhfcHJvZ3Jlc3MsIGNvbXB1dGFibGVFdmVudC5wYXJ0TG9hZGVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKTtcbiAgICAgICAgICAgIHZhciBlcnJvciA9IGZ1bmN0aW9uIGVycm9yKGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIub25FcnJvcihtZXNzYWdlc1syMTBdICsgXCI6IFwiICsgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZUNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgTUFYX1JFVFJJRVMgPSAyO1xuICAgICAgICAgICAgdmFyIEJBQ0tfT0ZGID0gMTUwO1xuICAgICAgICAgICAgdmFyIHJldHJ5ID0gZnVuY3Rpb24gcmV0cnkoY291bnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUgJiYgZS5pbmRleE9mKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5pbmRleE9mKCc0MjInKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IobmV3IEVycm9yKG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLnN0YXR1cy5lcnJvci40MjInXSArICcgKDQyMiknKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlLmluZGV4T2YoJzQwMycpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihuZXcgRXJyb3IobWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuc3RhdHVzLmVycm9yLjQwMyddICsgJyAoNDAzKScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzMi5fdXNlckFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKG5ldyBFcnJvcihtZXNzYWdlc1snaHRtbF91cGxvYWRlci5zdGF0dXMuZXJyb3IuYWJvcnRlZCddKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID49IE1BWF9SRVRSSUVTKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIudXBsb2FkUHJlc2lnbmVkKGNvbXBsZXRlLCBwcm9ncmVzcywgcmV0cnkoKytjb3VudCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgQkFDS19PRkYgKiBjb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzTG9hZGluZyk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgX0NvbmZpZ3MyLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5leHRlbnNpb25BbGxvd2VkKHRoaXMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlQ2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHJ5KDApKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19kb0Fib3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9kb0Fib3J0KGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnhocikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VzZXJBYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54aHIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzRXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5zZXRQcm9ncmVzcygwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnX2RvUGF1c2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2RvUGF1c2UoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy54aHIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy54aHIucGF1c2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54aHIucGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3BhcnRzICYmIHRoaXMuX3BhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGFydHMuZmlsdGVyKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHAuZ2V0U3RhdHVzKCkgPT09IF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0xvYWRpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHAuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0Nhbm5vdFBhdXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNNdWx0aVBhdXNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfU3RhdHVzSXRlbTMuZGVmYXVsdC5TdGF0dXNDYW5ub3RQYXVzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX1N0YXR1c0l0ZW0zLmRlZmF1bHQuU3RhdHVzTmV3O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfZG9SZXN1bWUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2RvUmVzdW1lKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMueGhyICYmIHRoaXMueGhyLnJlc3VtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMueGhyLnJlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGxvYWRQcmVzaWduZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBsb2FkUHJlc2lnbmVkKGNvbXBsZXRlQ2FsbGJhY2ssIHByb2dyZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgZnVsbFBhdGggPSB2b2lkIDA7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZ1bGxQYXRoID0gdGhpcy5nZXRGdWxsUGF0aCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKF9TdGF0dXNJdGVtMy5kZWZhdWx0LlN0YXR1c0Vycm9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFByb2dyZXNzKDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0U2l6ZSgpIDwgX2FwaTIuZGVmYXVsdC5nZXRNdWx0aXBhcnRUaHJlc2hvbGQoKSkge1xuICAgICAgICAgICAgICAgIF9hcGkyLmRlZmF1bHQuZ2V0Q2xpZW50KCkudXBsb2FkUHJlc2lnbmVkKHRoaXMuX2ZpbGUsIGZ1bGxQYXRoLCBjb21wbGV0ZUNhbGxiYWNrLCBlcnJvckNhbGxiYWNrLCBwcm9ncmVzc0NhbGxiYWNrKS50aGVuKGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnhociA9IHhocjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2FwaTIuZGVmYXVsdC5nZXRDbGllbnQoKS51cGxvYWRNdWx0aXBhcnQodGhpcy5fZmlsZSwgZnVsbFBhdGgsIGNvbXBsZXRlQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2ssIHByb2dyZXNzQ2FsbGJhY2spLnRoZW4oZnVuY3Rpb24gKG1hbmFnZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnhociA9IG1hbmFnZWQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXBsb2FkSXRlbTtcbn0oX1N0YXR1c0l0ZW0zLmRlZmF1bHQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBVcGxvYWRJdGVtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5QYXJ0SXRlbSA9IGV4cG9ydHMuU2Vzc2lvbiA9IGV4cG9ydHMuRm9sZGVySXRlbSA9IGV4cG9ydHMuVXBsb2FkSXRlbSA9IGV4cG9ydHMuQ29uZmlncyA9IGV4cG9ydHMuU3RvcmUgPSB1bmRlZmluZWQ7XG5cbnZhciBfU3RvcmUgPSByZXF1aXJlKCcuL1N0b3JlJyk7XG5cbnZhciBfU3RvcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU3RvcmUpO1xuXG52YXIgX0NvbmZpZ3MgPSByZXF1aXJlKCcuL0NvbmZpZ3MnKTtcblxudmFyIF9Db25maWdzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbmZpZ3MpO1xuXG52YXIgX1VwbG9hZEl0ZW0gPSByZXF1aXJlKCcuL1VwbG9hZEl0ZW0nKTtcblxudmFyIF9VcGxvYWRJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VwbG9hZEl0ZW0pO1xuXG52YXIgX0ZvbGRlckl0ZW0gPSByZXF1aXJlKCcuL0ZvbGRlckl0ZW0nKTtcblxudmFyIF9Gb2xkZXJJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ZvbGRlckl0ZW0pO1xuXG52YXIgX1BhcnRJdGVtID0gcmVxdWlyZSgnLi9QYXJ0SXRlbScpO1xuXG52YXIgX1BhcnRJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BhcnRJdGVtKTtcblxudmFyIF9TZXNzaW9uID0gcmVxdWlyZSgnLi9TZXNzaW9uJyk7XG5cbnZhciBfU2Vzc2lvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TZXNzaW9uKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5TdG9yZSA9IF9TdG9yZTIuZGVmYXVsdDtcbmV4cG9ydHMuQ29uZmlncyA9IF9Db25maWdzMi5kZWZhdWx0O1xuZXhwb3J0cy5VcGxvYWRJdGVtID0gX1VwbG9hZEl0ZW0yLmRlZmF1bHQ7XG5leHBvcnRzLkZvbGRlckl0ZW0gPSBfRm9sZGVySXRlbTIuZGVmYXVsdDtcbmV4cG9ydHMuU2Vzc2lvbiA9IF9TZXNzaW9uMi5kZWZhdWx0O1xuZXhwb3J0cy5QYXJ0SXRlbSA9IF9QYXJ0SXRlbTIuZGVmYXVsdDtcbiJdfQ==
