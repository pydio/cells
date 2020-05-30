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

var _restApi = require('pydio/http/rest-api');

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
                var request = new _restApi.RestGetBulkMetaRequest();
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
            var api = new _restApi.TreeServiceApi(_api2.default.getRestClient());
            var request = new _restApi.RestGetBulkMetaRequest();
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
                var api = new _restApi.TreeServiceApi(_api2.default.getRestClient());
                var request = new _restApi.RestGetBulkMetaRequest();
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
