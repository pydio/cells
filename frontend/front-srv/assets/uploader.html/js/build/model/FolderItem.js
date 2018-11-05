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
        key: 'getFullPath',
        value: function getFullPath() {
            var pydio = _pydio2.default.getInstance();

            var repoList = pydio.user.getRepositoriesList();
            if (!repoList.has(this._repositoryId)) {
                throw new Error("Repository disconnected?");
            }
            var slug = repoList.get(this._repositoryId).getSlug();
            var fullPath = this._targetNode.getPath();
            fullPath = _lang2.default.trimRight(fullPath, '/') + '/' + _lang2.default.trimLeft(this._path, '/');
            if (fullPath.normalize) {
                fullPath = fullPath.normalize('NFC');
            }
            fullPath = slug + fullPath;
            return fullPath;
        }
    }, {
        key: '_doProcess',
        value: function _doProcess(completeCallback) {
            var _this2 = this;

            var fullPath = void 0;
            try {
                fullPath = this.getFullPath();
            } catch (e) {
                this.setStatus('error');
                return;
            }

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
