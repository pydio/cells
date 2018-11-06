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

        _this._status = 'new';
        _this._type = type;
        _this._id = Math.random();
        _this._errorMessage = null;
        var pydio = _pydio2.default.getInstance();
        _this._repositoryId = pydio.user.activeRepository;
        _this._exists = false;
        _this._progress = 0;
        _this.children = { folders: [], files: [], pg: {} };
        _this._targetNode = targetNode;
        if (parent) {
            _this._parent = parent;
            if (type === 'folder') {
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
        value: function getLabel() {}
    }, {
        key: 'getFullPath',
        value: function getFullPath() {}
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
            var id = child.getId();
            var folderIndex = this.children.folders.indexOf(child);
            var removed = false;
            if (folderIndex > -1) {
                this.children.folders = LangUtils.arrayWithout(this.children.folders, folderIndex);
                removed = true;
            } else {
                var fileIndex = this.children.files.indexOf(child);
                if (fileIndex > -1) {
                    this.children.files = LangUtils.arrayWithout(this.children.files, fileIndex);
                    removed = true;
                }
            }
            if (removed) {
                child.stopObserving('progress');

                child.abort();
                child.walk(function (c) {
                    c.abort();
                }, function () {
                    return true;
                }, 'file');
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
            var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'both';
            var stop = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (item) {
                return false;
            };

            var stopped = false;
            if (type === 'both' || type === 'file') {
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
                if ((type === 'both' || type === 'folder') && filter(child)) {
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

exports.default = StatusItem;
