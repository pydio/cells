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
        _this._relativePath = relativePath;
        if (parent) {
            parent.addChild(_this);
        }
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
        key: 'setRelativePath',
        value: function setRelativePath(newPath) {
            this._relativePath = newPath;
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
                _this2.setStatus('loaded');
                _this2._parseXHRResponse();
                completeCallback();
            };

            var progress = function progress(computableEvent) {
                if (_this2._status === 'error') {
                    return;
                }
                if (!computableEvent.total) {
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
                    if (_this2._userAborted) {
                        if (e) error(e);else error(new Error('Interrupted by user'));
                        return;
                    }
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
                    console.log('Should abort', this.getFullPath());
                    this._userAborted = true;
                    this.xhr.abort();
                } catch (e) {}
            }
            this.setStatus('error');
        }
    }, {
        key: 'getFullPath',
        value: function getFullPath() {
            var repoList = _pydio2.default.getInstance().user.getRepositoriesList();
            if (!repoList.has(this._repositoryId)) {
                throw new Error('repository.unknown');
            }
            var slug = repoList.get(this._repositoryId).getSlug();

            var fullPath = this._targetNode.getPath();
            var baseName = _path2.default.getBasename(this._file.name);
            if (this._relativePath) {
                fullPath = _lang2.default.trimRight(fullPath, '/') + '/' + _lang2.default.trimLeft(_path2.default.getDirname(this._relativePath), '/');
                baseName = _path2.default.getBasename(this._relativePath);
            }
            fullPath = slug + '/' + _lang2.default.trim(fullPath, '/');
            fullPath = _lang2.default.trimRight(fullPath, '/') + '/' + baseName;
            if (fullPath.normalize) {
                fullPath = fullPath.normalize('NFC');
            }
            return fullPath;
        }
    }, {
        key: 'uploadPresigned',
        value: function uploadPresigned(completeCallback, progressCallback, errorCallback) {
            var _this3 = this;

            var fullPath = void 0;
            try {
                fullPath = this.getFullPath();
            } catch (e) {
                this.setStatus('error');
                return;
            }

            _api2.default.getClient().uploadMultipart(this._file, fullPath, completeCallback, errorCallback, progressCallback).then(function (managed) {
                _this3.xhr = managed;
            });
        }
    }]);

    return UploadItem;
}(_StatusItem3.default);

exports.default = UploadItem;
