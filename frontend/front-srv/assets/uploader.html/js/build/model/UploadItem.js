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

            var error = function error(e) {
                _this2.onError(_pydio2.default.getInstance().MessageHash[210] + ": " + e.message);
                completeCallback();
            };

            var MAX_RETRIES = 2;
            var BACK_OFF = 150;
            var retry = function retry(count) {
                return function (e) {
                    if (e && e.indexOf && e.indexOf('422') >= 0) {
                        error(new Error('Quota reached! Cannot upload more to this workspace'));
                        return;
                    }
                    if (_this2._userAborted) {
                        if (e) {
                            error(e);
                        } else {
                            error(new Error('Interrupted by user'));
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
                    console.log('Should abort', this.getFullPath());
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
