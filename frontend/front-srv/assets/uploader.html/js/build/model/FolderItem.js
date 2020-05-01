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

var _restApi = require('pydio/http/rest-api');

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

            var api = new _restApi.TreeServiceApi(_api2.default.getRestClient());
            var request = new _restApi.RestCreateNodesRequest();
            var node = new _restApi.TreeNode();

            node.Path = fullPath;
            node.Type = _restApi.TreeNodeType.constructFromObject('COLLECTION');
            request.Nodes = [node];

            api.createNodes(request).then(function (collection) {
                _this2.setStatus(_StatusItem3.default.StatusLoaded);
                _this2.children.pg[_this2.getId()] = 100;
                _this2.recomputeProgress();
                completeCallback();
            });
        }
    }, {
        key: '_doAbort',
        value: function _doAbort(completeCallback) {
            if (console) {
                console.log(_pydio2.default.getMessages()['html_uploader.6']);
            }
        }
    }]);

    return FolderItem;
}(_StatusItem3.default);

exports.default = FolderItem;
