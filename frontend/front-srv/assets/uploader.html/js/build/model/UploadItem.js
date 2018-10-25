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

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
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
                var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve) {
                    var lastSlash, pos, path, ext, newPath, counter, exists;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    lastSlash = fullpath.lastIndexOf('/');
                                    pos = fullpath.lastIndexOf('.');
                                    path = fullpath;
                                    ext = '';

                                    // NOTE: the position lastSlash + 1 corresponds to hidden files (ex: .DS_STORE)

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
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(completeCallback, progressCallback, errorCallback) {
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

                                // Checking file already exists or not
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
