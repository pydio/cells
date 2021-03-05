(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.UploaderView = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"pydio":"pydio","pydio/lang/observable":"pydio/lang/observable"}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClearOptionsPane = function (_React$Component) {
    _inherits(ClearOptionsPane, _React$Component);

    function ClearOptionsPane() {
        _classCallCheck(this, ClearOptionsPane);

        return _possibleConstructorReturn(this, (ClearOptionsPane.__proto__ || Object.getPrototypeOf(ClearOptionsPane)).apply(this, arguments));
    }

    _createClass(ClearOptionsPane, [{
        key: 'clear',
        value: function clear(value) {
            var store = UploaderModel.Store.getInstance();
            switch (value) {
                case "all":
                    store.clearAll();
                    break;
                case "loaded":
                    store.clearStatus('loaded');
                    break;
                case "error":
                    store.clearStatus('error');
                    break;
                default:
                    break;
            }
            this.props.onDismiss();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var msg = _pydio2.default.getMessages();
            return _react2.default.createElement(
                _materialUi.Popover,
                {
                    open: this.props.open,
                    anchorEl: this.props.anchorEl,
                    anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                    targetOrigin: { horizontal: 'left', vertical: 'top' },
                    onRequestClose: function onRequestClose(e) {
                        _this2.props.onDismiss(e);
                    }
                },
                _react2.default.createElement(
                    _materialUi.Menu,
                    { style: { width: 146 }, desktop: true },
                    _react2.default.createElement(
                        _materialUi.Subheader,
                        { style: { lineHeight: '26px' } },
                        msg['html_uploader.clear-header']
                    ),
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: msg['html_uploader.clear-finished'], onClick: function onClick() {
                            _this2.clear('loaded');
                        } }),
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: msg['html_uploader.clear-failed'], onClick: function onClick() {
                            _this2.clear('error');
                        } }),
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: msg['html_uploader.clear-all'], onClick: function onClick() {
                            _this2.clear('all');
                        } })
                )
            );
        }
    }]);

    return ClearOptionsPane;
}(_react2.default.Component);

exports.default = ClearOptionsPane;

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConfirmExists = function (_React$Component) {
    _inherits(ConfirmExists, _React$Component);

    function ConfirmExists(props) {
        _classCallCheck(this, ConfirmExists);

        var _this = _possibleConstructorReturn(this, (ConfirmExists.__proto__ || Object.getPrototypeOf(ConfirmExists)).call(this, props));

        _this.state = {
            value: 'rename-folders',
            saveValue: false
        };
        return _this;
    }

    _createClass(ConfirmExists, [{
        key: 'cancel',
        value: function cancel() {
            this.props.onCancel();
        }
    }, {
        key: 'submit',
        value: function submit() {
            var _state = this.state,
                value = _state.value,
                saveValue = _state.saveValue;

            this.props.onConfirm(value, saveValue);
        }
    }, {
        key: 'checkChange',
        value: function checkChange(e, newValue) {
            this.setState({ saveValue: newValue });
        }
    }, {
        key: 'radioChange',
        value: function radioChange(e, newValue) {
            this.setState({ value: newValue });
        }
    }, {
        key: 'render',
        value: function render() {

            var pydio = _pydio2.default.getInstance();
            var _state2 = this.state,
                value = _state2.value,
                saveValue = _state2.saveValue;


            return _react2.default.createElement(
                'div',
                { style: { position: 'absolute', padding: 16, fontSize: 14, top: 49, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' } },
                _react2.default.createElement(
                    _materialUi.Paper,
                    { style: { width: 500, padding: 16, fontSize: 14, margin: '0 auto' }, zDepth: 2 },
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'h5',
                            null,
                            pydio.MessageHash[124]
                        ),
                        _react2.default.createElement(
                            _materialUi.RadioButtonGroup,
                            { ref: 'group', name: 'shipSpeed', defaultSelected: value, onChange: this.radioChange.bind(this) },
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'rename-folders', label: pydio.MessageHash['html_uploader.confirm.rename.all'], style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'rename', label: pydio.MessageHash['html_uploader.confirm.rename.merge'], style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'overwrite', label: pydio.MessageHash['html_uploader.confirm.overwrite'] })
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: { display: 'flex', marginTop: 30, alignItems: 'center' } },
                        _react2.default.createElement(_materialUi.Checkbox, { label: pydio.MessageHash['html_uploader.confirm.save.choice'], checked: saveValue, onCheck: this.checkChange.bind(this) }),
                        _react2.default.createElement('span', { style: { flex: 1 } }),
                        _react2.default.createElement(_materialUi.FlatButton, { label: pydio.MessageHash[54], onClick: this.cancel.bind(this) }),
                        _react2.default.createElement(_materialUi.RaisedButton, { primary: true, label: pydio.MessageHash[48], onClick: this.submit.bind(this) })
                    )
                )
            );
        }
    }]);

    return ConfirmExists;
}(_react2.default.Component);

exports.default = ConfirmExists;

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}],4:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _UploadOptionsPane = require('./UploadOptionsPane');

var _UploadOptionsPane2 = _interopRequireDefault(_UploadOptionsPane);

var _ClearOptionsPane = require('./ClearOptionsPane');

var _ClearOptionsPane2 = _interopRequireDefault(_ClearOptionsPane);

var _TransfersList = require('./TransfersList');

var _TransfersList2 = _interopRequireDefault(_TransfersList);

var _ConfirmExists = require('./ConfirmExists');

var _ConfirmExists2 = _interopRequireDefault(_ConfirmExists);

var _materialUi = require('material-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Pydio$requireLib = _pydio2.default.requireLib('hoc'),
    dropProvider = _Pydio$requireLib.dropProvider;

var _Pydio$requireLib2 = _pydio2.default.requireLib('form'),
    FileDropZone = _Pydio$requireLib2.FileDropZone;

var DropUploader = function (_React$Component) {
    _inherits(DropUploader, _React$Component);

    function DropUploader(props) {
        _classCallCheck(this, DropUploader);

        var _this = _possibleConstructorReturn(this, (DropUploader.__proto__ || Object.getPrototypeOf(DropUploader)).call(this, props));

        var store = UploaderModel.Store.getInstance();
        _this._storeObserver = function () {
            _this.setState({
                sessions: store.getSessions(),
                storeRunning: store.isRunning()
            });
        };
        store.observe("update", _this._storeObserver);
        store.observe("auto_close", function () {
            if (_this.props.onDismiss) {
                _this.props.onDismiss();
            }
        });

        _this.state = {
            showOptions: false,
            configs: UploaderModel.Configs.getInstance(),
            sessions: store.getSessions(),
            storeRunning: store.isRunning(),
            confirmDialog: props.confirmDialog
        };
        return _this;
    }

    _createClass(DropUploader, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.confirmDialog !== this.state.confirmDialog) {
                this.setState({ confirmDialog: nextProps.confirmDialog });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this._storeObserver) {
                UploaderModel.Store.getInstance().stopObserving("update", this._storeObserver);
                UploaderModel.Store.getInstance().stopObserving("auto_close");
            }
        }
    }, {
        key: 'onDrop',
        value: function onDrop(files) {
            var contextNode = _pydio2.default.getInstance().getContextHolder().getContextNode();
            UploaderModel.Store.getInstance().handleDropEventResults(null, files, contextNode);
        }
    }, {
        key: 'onFolderPicked',
        value: function onFolderPicked(files) {
            var contextNode = _pydio2.default.getInstance().getContextHolder().getContextNode();
            UploaderModel.Store.getInstance().handleFolderPickerResult(files, contextNode);
        }
    }, {
        key: 'start',
        value: function start(e) {
            e.preventDefault();
            UploaderModel.Store.getInstance().resume();
        }
    }, {
        key: 'pause',
        value: function pause(e) {
            UploaderModel.Store.getInstance().pause();
        }
    }, {
        key: 'openClear',
        value: function openClear(e) {
            e.preventDefault();
            this.setState({
                showClear: true,
                clearAnchorEl: e.currentTarget
            });
        }
    }, {
        key: 'toggleOptions',
        value: function toggleOptions(e) {
            if (e.preventDefault) e.preventDefault();

            var _state = this.state,
                _state$showOptions = _state.showOptions,
                showOptions = _state$showOptions === undefined ? false : _state$showOptions,
                currentTarget = _state.currentTarget;


            this.setState({
                showOptions: !showOptions,
                optionsAnchorEl: e.currentTarget
            });
        }
    }, {
        key: 'openFilePicker',
        value: function openFilePicker(e) {
            e.preventDefault();
            this.refs.dropzone.open();
        }
    }, {
        key: 'openFolderPicker',
        value: function openFolderPicker(e) {
            e.preventDefault();
            this.refs.dropzone.openFolderPicker();
        }
    }, {
        key: 'dialogSubmit',
        value: function dialogSubmit(newValue, saveValue) {
            var configs = this.state.configs;

            UploaderModel.Store.getInstance().getSessions().forEach(function (session) {
                if (session.getStatus() === 'confirm') {
                    session.prepare(newValue);
                }
            });
            if (saveValue) {
                configs.updateOption('upload_existing', newValue);
            }
            this.setState({ confirmDialog: false });
            _pydio2.default.getInstance().getController().fireAction('upload');
        }
    }, {
        key: 'dialogCancel',
        value: function dialogCancel() {
            var store = UploaderModel.Store.getInstance();
            store.getSessions().forEach(function (session) {
                if (session.getStatus() === 'confirm') {
                    store.removeSession(session);
                }
            });
            this.setState({ confirmDialog: false });
            _pydio2.default.getInstance().getController().fireAction('upload');
        }
    }, {
        key: 'supportsFolder',
        value: function supportsFolder() {
            var supports = false;
            var e = global.document.createElement('input');
            e.setAttribute('type', 'file');
            if ('webkitdirectory' in e) {
                supports = true;
            }
            e = null;
            return supports;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var messages = _pydio2.default.getInstance().MessageHash;
            var _props = this.props,
                showDismiss = _props.showDismiss,
                onDismiss = _props.onDismiss;

            var connectDropTarget = this.props.connectDropTarget || function (c) {
                return c;
            };
            var _state2 = this.state,
                configs = _state2.configs,
                showOptions = _state2.showOptions,
                optionsAnchorEl = _state2.optionsAnchorEl,
                showClear = _state2.showClear,
                clearAnchorEl = _state2.clearAnchorEl,
                sessions = _state2.sessions,
                storeRunning = _state2.storeRunning,
                confirmDialog = _state2.confirmDialog;

            var store = UploaderModel.Store.getInstance();

            var listEmpty = true;
            sessions.forEach(function (s) {
                if (s.getChildren().length) {
                    listEmpty = false;
                }
            });

            return connectDropTarget(_react2.default.createElement(
                'div',
                { style: { position: 'relative', backgroundColor: '#FAFAFA' } },
                _react2.default.createElement(
                    'div',
                    { style: { position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 16, width: '100%' } },
                    _react2.default.createElement(
                        'h3',
                        { style: { marginBottom: 16 } },
                        messages['html_uploader.dialog.title']
                    ),
                    _react2.default.createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical", primary: true, iconStyle: { fontSize: 18 }, style: { padding: 14 }, tooltip: messages['html_uploader.options'], onClick: this.toggleOptions.bind(this) }),
                    _react2.default.createElement('span', { style: { flex: 1 } }),
                    _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-play' }), label: messages['html_uploader.start'], onClick: this.start.bind(this), primary: true, disabled: store.isRunning() || !store.hasQueue() }),
                    _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-pause' }), label: messages['html_uploader.pause'], onClick: this.pause.bind(this), primary: true, disabled: !store.isRunning() }),
                    _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-delete' }), label: _react2.default.createElement(
                            'span',
                            null,
                            messages['html_uploader.clear'],
                            _react2.default.createElement('span', { className: "mdi mdi-menu-down" })
                        ), onClick: this.openClear.bind(this), primary: true, disabled: listEmpty }),
                    showDismiss && _react2.default.createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", style: { padding: 14 }, onClick: function onClick() {
                            return onDismiss();
                        } })
                ),
                _react2.default.createElement(
                    FileDropZone,
                    {
                        className: 'transparent-dropzone',
                        ref: 'dropzone',
                        multiple: true,
                        enableFolders: true,
                        supportClick: false,
                        ignoreNativeDrop: true,
                        onDrop: this.onDrop.bind(this),
                        onFolderPicked: this.onFolderPicked.bind(this),
                        style: { width: '100%', height: 420 }
                    },
                    _react2.default.createElement(_TransfersList2.default, {
                        sessions: sessions,
                        autoStart: configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send'),
                        onDismiss: this.props.onDismiss,
                        store: store,
                        onPickFile: function onPickFile(ev) {
                            _this2.openFilePicker(ev);
                        },
                        onPickFolder: this.supportsFolder() ? function (ev) {
                            _this2.openFolderPicker(ev);
                        } : null
                    })
                ),
                _react2.default.createElement(_UploadOptionsPane2.default, { configs: configs, open: showOptions, anchorEl: optionsAnchorEl, onDismiss: function onDismiss(e) {
                        _this2.toggleOptions(e);
                    } }),
                _react2.default.createElement(_ClearOptionsPane2.default, { configs: configs, open: showClear, anchorEl: clearAnchorEl, onDismiss: function onDismiss() {
                        _this2.setState({ showClear: false, clearAnchorEl: null });
                    } }),
                confirmDialog && _react2.default.createElement(_ConfirmExists2.default, { onConfirm: this.dialogSubmit.bind(this), onCancel: this.dialogCancel.bind(this) })
            ));
        }
    }]);

    return DropUploader;
}(_react2.default.Component);

exports.default = DropUploader = dropProvider(DropUploader);

exports.default = DropUploader;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./ClearOptionsPane":2,"./ConfirmExists":3,"./TransfersList":6,"./UploadOptionsPane":7,"material-ui":"material-ui","pydio":"pydio","react":"react"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _materialUi = require('material-ui');

var _StatusItem = require('../model/StatusItem');

var _StatusItem2 = _interopRequireDefault(_StatusItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var uploadStatusMessages = {
    "new": 433,
    "loading": 434,
    "loaded": 435,
    "error": 436
};

var Transfer = function (_React$Component) {
    _inherits(Transfer, _React$Component);

    function Transfer(props) {
        _classCallCheck(this, Transfer);

        var _this = _possibleConstructorReturn(this, (Transfer.__proto__ || Object.getPrototypeOf(Transfer)).call(this, props));

        _this.state = {
            open: false,
            showAll: false,
            status: props.item.getStatus(),
            previewUrl: null,
            progress: props.item.getProgress() || 0
        };
        return _this;
    }

    _createClass(Transfer, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var item = this.props.item;

            this._pgObserver = function (value) {
                _this2.setState({ progress: value });
            };
            this._statusObserver = function (value) {
                _this2.setState({ status: value });
            };
            item.observe('progress', this._pgObserver);
            item.observe('status', this._statusObserver);
            item.observe('children', function () {
                _this2.forceUpdate();
            });
            if (item instanceof UploaderModel.UploadItem && /\.(jpe?g|png|gif)$/i.test(item.getFile().name)) {
                if (item.previewUrl) {
                    this.setState({ previewUrl: item.previewUrl });
                    return;
                }
                var reader = new FileReader();
                reader.addEventListener("load", function () {
                    item.previewUrl = reader.result;
                    _this2.setState({ previewUrl: reader.result });
                }, false);
                reader.readAsDataURL(item.getFile());
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var item = this.props.item;

            item.stopObserving('progress', this._pgObserver);
            item.stopObserving('status', this._statusObserver);
        }
    }, {
        key: 'remove',
        value: function remove() {
            var item = this.props.item;

            if (item.getParent()) {
                item.getParent().removeChild(item);
            }
        }
    }, {
        key: 'abort',
        value: function abort() {
            var item = this.props.item;

            item.abort();
        }
    }, {
        key: 'retry',
        value: function retry() {
            var _props = this.props,
                item = _props.item,
                store = _props.store;

            item.setStatus(_StatusItem2.default.StatusNew);
            store.processNext();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props,
                item = _props2.item,
                className = _props2.className,
                style = _props2.style,
                limit = _props2.limit,
                level = _props2.level,
                extensions = _props2.extensions,
                store = _props2.store;
            var _state = this.state,
                open = _state.open,
                showAll = _state.showAll,
                progress = _state.progress,
                status = _state.status,
                previewUrl = _state.previewUrl;

            var children = item.getChildren();
            var isDir = item instanceof UploaderModel.FolderItem;
            var isPart = item instanceof UploaderModel.PartItem;
            var isSession = item instanceof UploaderModel.Session;
            var messages = _pydio2.default.getMessages();

            var styles = {
                main: _extends({}, style, {
                    fontSize: 14,
                    color: '#424242'
                }),
                line: {
                    paddingLeft: (level - 1) * 24,
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: level > 1 ? 10 : 16,
                    paddingBottom: 6,
                    cursor: children.length ? 'pointer' : 'default',
                    borderLeft: level === 1 ? '3px solid transparent' : ''
                },
                secondaryLine: {
                    display: 'flex',
                    alignItems: 'center',
                    opacity: .3,
                    fontSize: 11
                },
                leftIcon: {
                    display: 'inline-block',
                    width: 50,
                    textAlign: 'center',
                    color: isPart ? '#9e9e9e' : '#616161',
                    fontSize: 18
                },
                previewImage: {
                    display: 'inline-block',
                    backgroundColor: '#eee',
                    backgroundSize: 'cover',
                    height: 32,
                    width: 32,
                    borderRadius: '50%'
                },
                label: {
                    fontSize: 15,
                    fontWeight: isDir ? 500 : 400,
                    color: isPart ? '#9e9e9e' : null,
                    fontStyle: isPart ? 'italic' : null,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
                },
                errMessage: {
                    color: '#e53935',
                    fontSize: 11,
                    flex: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                pgBar: {
                    position: 'relative'
                },
                rightButton: {
                    display: 'inline-block',
                    width: 48,
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: '#9e9e9e',
                    fontSize: 16
                },
                toggleIcon: {
                    color: '#bdbdbd',
                    marginLeft: 4
                }
            };

            var childComps = [],
                iconClass = void 0,
                rightButton = void 0,
                leftIcon = void 0,
                toggleOpen = void 0,
                toggleCallback = void 0,
                pgColor = void 0;

            if (children.length) {
                if (open || isSession && status !== _StatusItem2.default.StatusAnalyze) {
                    var sliced = showAll ? children : children.slice(0, limit);
                    childComps = sliced.map(function (child) {
                        return _react2.default.createElement(Transfer, {
                            key: child.getId(),
                            item: child,
                            limit: limit,
                            level: level + 1,
                            extensions: extensions,
                            store: store
                        });
                    });
                    if (children.length > sliced.length) {
                        childComps.push(_react2.default.createElement(
                            'div',
                            { style: _extends({}, styles.line, { cursor: 'pointer', borderLeft: '', paddingLeft: level * 20 }), onClick: function onClick() {
                                    _this3.setState({ showAll: true });
                                } },
                            _react2.default.createElement('span', { style: styles.leftIcon, className: "mdi mdi-plus-box-outline" }),
                            _react2.default.createElement(
                                'span',
                                { style: { flex: 1, fontStyle: 'italic' } },
                                messages['html_uploader.list.show-more'].replace('%d', children.length - sliced.length)
                            )
                        ));
                    }
                }
                toggleCallback = function toggleCallback() {
                    _this3.setState({ open: !open });
                };
                toggleOpen = _react2.default.createElement('span', { onClick: toggleCallback, style: styles.toggleIcon, className: "mdi mdi-chevron-" + (open ? "down" : "right") });
            }

            if (isDir) {
                iconClass = "mdi mdi-folder";
                rightButton = _react2.default.createElement('span', { className: 'mdi mdi-close-circle-outline', onClick: function onClick() {
                        _this3.remove();
                    } });
                if (progress === 100) {
                    pgColor = '#4caf50';
                }
            } else if (isPart) {
                iconClass = "mdi mdi-package-up";
                if (progress === 100) {
                    pgColor = '#4caf50';
                }
            } else {
                iconClass = "mdi mdi-file";
                var ext = _path2.default.getFileExtension(item.getFullPath());
                if (extensions.has(ext)) {
                    var _extensions$get = extensions.get(ext),
                        fontIcon = _extensions$get.fontIcon;

                    iconClass = 'mimefont mdi mdi-' + fontIcon;
                }

                if (status === _StatusItem2.default.StatusLoading || status === _StatusItem2.default.StatusCannotPause || status === _StatusItem2.default.StatusMultiPause) {
                    rightButton = _react2.default.createElement('span', { className: 'mdi mdi-stop', onClick: function onClick() {
                            return _this3.abort();
                        } });
                } else if (status === _StatusItem2.default.StatusError) {
                    pgColor = '#e53935';
                    rightButton = _react2.default.createElement('span', { className: "mdi mdi-restart", style: { color: '#e53935' }, onClick: function onClick() {
                            _this3.retry();
                        } });
                } else {
                    pgColor = '#4caf50';
                    rightButton = _react2.default.createElement('span', { className: 'mdi mdi-close-circle-outline', onClick: function onClick() {
                            _this3.remove();
                        } });
                }
            }

            var label = _path2.default.getBasename(item.getFullPath());
            var progressBar = _react2.default.createElement(_materialUi.LinearProgress, { style: { backgroundColor: '#eeeeee', height: 3 }, color: pgColor, min: 0, max: 100, value: progress, mode: "determinate" });

            if (isSession) {
                if (status === _StatusItem2.default.StatusAnalyze) {
                    label = _pydio2.default.getMessages()["html_uploader.analyze.step"];
                    progressBar = null;
                    toggleCallback = null;
                    toggleOpen = null;
                    rightButton = _react2.default.createElement(_materialUi.CircularProgress, { size: 16, thickness: 2, style: { marginTop: 1 } });
                } else {
                    return _react2.default.createElement(
                        'div',
                        null,
                        childComps
                    );
                }
            }

            if (previewUrl) {
                leftIcon = _react2.default.createElement(
                    'span',
                    { style: _extends({}, styles.leftIcon, { marginTop: -4, marginBottom: -5 }) },
                    _react2.default.createElement('div', { style: _extends({ background: 'url(' + previewUrl + ')' }, styles.previewImage) })
                );
            } else {
                leftIcon = _react2.default.createElement(
                    'span',
                    { style: styles.leftIcon },
                    _react2.default.createElement('span', { className: iconClass, style: {
                            display: 'block',
                            width: styles.previewImage.width,
                            height: styles.previewImage.height,
                            lineHeight: styles.previewImage.width + 'px',
                            backgroundColor: '#ECEFF1',
                            borderRadius: '50%',
                            marginLeft: 6
                        } })
                );
            }

            var statusLabel = void 0;
            var secondaryLine = _extends({}, styles.secondaryLine);
            var itemType = isDir ? "dir" : isPart ? "part" : "file";
            if (status === 'error') {
                secondaryLine.opacity = 1;
                statusLabel = _react2.default.createElement(
                    'span',
                    { style: styles.errMessage, title: item.getErrorMessage() },
                    item.getErrorMessage()
                );
            } else {
                statusLabel = messages['html_uploader.status.' + itemType + '.' + status] || messages['html_uploader.status.' + status] || status;
                if (item.getSize) {
                    statusLabel = item.getHumanSize() + ' - ' + statusLabel;
                }
            }

            return _react2.default.createElement(
                'div',
                { style: styles.main, className: "upload-" + status + " " + (className ? className : "") },
                _react2.default.createElement(
                    'div',
                    { style: styles.line },
                    leftIcon,
                    _react2.default.createElement(
                        'div',
                        { style: { flex: 1, overflow: 'hidden', paddingLeft: 4 } },
                        _react2.default.createElement(
                            'div',
                            { onClick: toggleCallback, style: styles.label },
                            label,
                            ' ',
                            toggleOpen
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: secondaryLine },
                            statusLabel
                        ),
                        _react2.default.createElement(
                            'div',
                            { style: styles.pgBar },
                            progressBar
                        )
                    ),
                    _react2.default.createElement(
                        'span',
                        { style: styles.rightButton },
                        rightButton
                    )
                ),
                childComps
            );
        }
    }]);

    return Transfer;
}(_react2.default.Component);

exports.default = Transfer;

},{"../model/StatusItem":1,"material-ui":"material-ui","pydio":"pydio","pydio/util/path":"pydio/util/path","react":"react"}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Transfer = require('./Transfer');

var _Transfer2 = _interopRequireDefault(_Transfer);

var _styles = require('material-ui/styles');

var _dom = require('pydio/util/dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TransfersList = function (_React$Component) {
    _inherits(TransfersList, _React$Component);

    function TransfersList(props) {
        _classCallCheck(this, TransfersList);

        return _possibleConstructorReturn(this, (TransfersList.__proto__ || Object.getPrototypeOf(TransfersList)).call(this, props));
    }

    _createClass(TransfersList, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                sessions = _props.sessions,
                store = _props.store,
                muiTheme = _props.muiTheme,
                onPickFile = _props.onPickFile,
                onPickFolder = _props.onPickFolder;

            var transition = _dom2.default.getBeziersTransition().replace('all ', 'color ');
            var messages = _pydio2.default.getMessages();
            var css = '\n            .drop-transfer-list{\n                color:rgba(3, 169, 244, 0.5);\n            }\n            .transparent-dropzone.active .drop-transfer-list{\n                color:rgba(3, 169, 244, 0.8);\n            }\n            .drop-transfer-list a,.drop-transfer-list a:hover {\n                color:rgba(3, 169, 244, 1);\n                cursor: pointer;\n            }\n        ';

            var sessionsList = void 0;
            if (sessions) {
                var isEmpty = true;
                var ext = _pydio2.default.getInstance().Registry.getFilesExtensions();
                var components = sessions.map(function (session) {
                    if (session.getChildren().length) {
                        isEmpty = false;
                    }
                    return _react2.default.createElement(_Transfer2.default, { item: session, store: store, style: {}, limit: 10, level: 0, extensions: ext });
                });
                if (!isEmpty) {
                    sessionsList = _react2.default.createElement(
                        'div',
                        { style: { height: '100%', overflowY: 'auto', padding: 10, paddingBottom: 20 } },
                        components
                    );
                }
            }

            var dropper = _react2.default.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', height: '100%', width: '100%', backgroundColor: '#F5F5F5', transition: transition }, className: "drop-transfer-list" },
                _react2.default.createElement(
                    'div',
                    { style: { textAlign: 'center', width: '100%', fontWeight: 500, fontSize: 18, padding: 24, lineHeight: '28px' } },
                    _react2.default.createElement('div', { className: 'mdi mdi-cloud-upload', style: { fontSize: 110 } }),
                    _react2.default.createElement(
                        'div',
                        null,
                        messages["html_uploader.drophere"],
                        ' ',
                        messages["html_uploader.drop-or"],
                        ' ',
                        _react2.default.createElement(
                            'a',
                            { onClick: onPickFile },
                            messages["html_uploader.drop-pick-file"]
                        ),
                        onPickFolder && _react2.default.createElement(
                            'span',
                            null,
                            ' ',
                            messages["html_uploader.drop-or"],
                            ' ',
                            _react2.default.createElement(
                                'a',
                                { onClick: onPickFolder },
                                messages["html_uploader.drop-pick-folder"]
                            )
                        )
                    )
                ),
                _react2.default.createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: css } })
            );

            return _react2.default.createElement(
                'div',
                { style: { display: 'flex', height: '100%', overflow: 'hidden' } },
                _react2.default.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' } },
                    dropper
                ),
                sessionsList && _react2.default.createElement(
                    'div',
                    { style: { width: 420, minWidth: 420, maxWidth: 420 } },
                    sessionsList
                )
            );
        }
    }]);

    return TransfersList;
}(_react2.default.Component);

exports.default = TransfersList = (0, _styles.muiThemeable)()(TransfersList);
exports.default = TransfersList;

},{"./Transfer":5,"material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/util/dom":"pydio/util/dom","react":"react"}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UploadOptionsPane = function (_React$Component) {
    _inherits(UploadOptionsPane, _React$Component);

    function UploadOptionsPane() {
        _classCallCheck(this, UploadOptionsPane);

        return _possibleConstructorReturn(this, (UploadOptionsPane.__proto__ || Object.getPrototypeOf(UploadOptionsPane)).apply(this, arguments));
    }

    _createClass(UploadOptionsPane, [{
        key: 'updateField',
        value: function updateField(fName, event) {
            var configs = this.props.configs;


            if (fName === 'autostart') {
                var toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true);
                toggleStart = !toggleStart;
                configs.updateOption('upload_auto_send', toggleStart, true);
            } else if (fName === 'autoclose') {
                var _toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close', true);
                _toggleStart = !_toggleStart;
                configs.updateOption('upload_auto_close', _toggleStart, true);
            } else if (fName === 'existing') {
                configs.updateOption('upload_existing', event.target.getSelectedValue());
            } else if (fName === 'show_processed') {
                var toggleShowProcessed = configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
                toggleShowProcessed = !toggleShowProcessed;
                configs.updateOption('upload_show_processed', toggleShowProcessed, true);
            }
            this.setState({ random: Math.random() });
        }
    }, {
        key: 'radioChange',
        value: function radioChange(e, newValue) {
            var configs = this.props.configs;


            configs.updateOption('upload_existing', newValue);
            this.setState({ random: Math.random() });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var configs = this.props.configs;

            var pydio = _pydio2.default.getInstance();

            var toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send');
            var toggleClose = configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close');
            var overwriteType = configs.getOption('DEFAULT_EXISTING', 'upload_existing');

            return _react2.default.createElement(
                _materialUi.Popover,
                {
                    open: this.props.open,
                    anchorEl: this.props.anchorEl,
                    anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                    targetOrigin: { horizontal: 'left', vertical: 'top' },
                    onRequestClose: function onRequestClose(e) {
                        _this2.props.onDismiss(e);
                    }
                },
                _react2.default.createElement(
                    'div',
                    { style: { width: 320, paddingBottom: 6 } },
                    _react2.default.createElement(
                        _materialUi.Subheader,
                        null,
                        'Options'
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: { padding: '0 16px', marginTop: -6 } },
                        _react2.default.createElement(_materialUi.Checkbox, { style: { margin: '8px 0' }, checked: toggleStart, labelPosition: "right", onCheck: this.updateField.bind(this, 'autostart'), label: pydio.MessageHash[337], labelStyle: { fontSize: 14 } }),
                        _react2.default.createElement(_materialUi.Checkbox, { style: { margin: '8px 0' }, checked: toggleClose, labelPosition: "right", onCheck: this.updateField.bind(this, 'autoclose'), label: pydio.MessageHash[338], labelStyle: { fontSize: 14 } })
                    ),
                    _react2.default.createElement(
                        _materialUi.Subheader,
                        null,
                        pydio.MessageHash['html_uploader.options.existing']
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: { padding: 16, fontSize: 14, paddingTop: 0 } },
                        _react2.default.createElement(
                            _materialUi.RadioButtonGroup,
                            { ref: 'group', name: 'shipSpeed', defaultSelected: overwriteType, onChange: this.radioChange.bind(this) },
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'alert', label: pydio.MessageHash['html_uploader.options.existing.alert'], style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'rename-folders', label: pydio.MessageHash['html_uploader.options.existing.folders'], style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'rename', label: pydio.MessageHash['html_uploader.options.existing.merge'], style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'overwrite', label: pydio.MessageHash['html_uploader.options.existing.overwrite'] })
                        )
                    )
                )
            );
        }
    }]);

    return UploadOptionsPane;
}(_react2.default.Component);

exports.default = UploadOptionsPane;

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransfersList = exports.DropUploader = undefined;

var _DropUploader = require('./DropUploader');

var _DropUploader2 = _interopRequireDefault(_DropUploader);

var _TransfersList = require('./TransfersList');

var _TransfersList2 = _interopRequireDefault(_TransfersList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.DropUploader = _DropUploader2.default;
exports.TransfersList = _TransfersList2.default;

},{"./DropUploader":4,"./TransfersList":6}]},{},[8])(8)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANS4wLjEvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2J1aWxkL21vZGVsL1N0YXR1c0l0ZW0uanMiLCJqcy9idWlsZC92aWV3L0NsZWFyT3B0aW9uc1BhbmUuanMiLCJqcy9idWlsZC92aWV3L0NvbmZpcm1FeGlzdHMuanMiLCJqcy9idWlsZC92aWV3L0Ryb3BVcGxvYWRlci5qcyIsImpzL2J1aWxkL3ZpZXcvVHJhbnNmZXIuanMiLCJqcy9idWlsZC92aWV3L1RyYW5zZmVyc0xpc3QuanMiLCJqcy9idWlsZC92aWV3L1VwbG9hZE9wdGlvbnNQYW5lLmpzIiwianMvYnVpbGQvdmlldy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX29ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9vYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29ic2VydmFibGUpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBTdGF0dXNJdGVtID0gZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKFN0YXR1c0l0ZW0sIF9PYnNlcnZhYmxlKTtcblxuICAgIGZ1bmN0aW9uIFN0YXR1c0l0ZW0odHlwZSwgdGFyZ2V0Tm9kZSkge1xuICAgICAgICB2YXIgcGFyZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBudWxsO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTdGF0dXNJdGVtKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoU3RhdHVzSXRlbS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFN0YXR1c0l0ZW0pKS5jYWxsKHRoaXMpKTtcblxuICAgICAgICBfdGhpcy5fc3RhdHVzID0gU3RhdHVzSXRlbS5TdGF0dXNOZXc7XG4gICAgICAgIF90aGlzLl90eXBlID0gdHlwZTtcbiAgICAgICAgX3RoaXMuX2lkID0gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgX3RoaXMuX2Vycm9yTWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuICAgICAgICBfdGhpcy5fcmVwb3NpdG9yeUlkID0gcGFyZW50ID8gcGFyZW50LmdldFJlcG9zaXRvcnlJZCgpIDogcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5O1xuICAgICAgICBfdGhpcy5fZXhpc3RzID0gZmFsc2U7XG4gICAgICAgIF90aGlzLl9wcm9ncmVzcyA9IDA7XG4gICAgICAgIF90aGlzLmNoaWxkcmVuID0geyBmb2xkZXJzOiBbXSwgZmlsZXM6IFtdLCBwZzoge30gfTtcbiAgICAgICAgX3RoaXMuX3RhcmdldE5vZGUgPSB0YXJnZXROb2RlO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICBfdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFN0YXR1c0l0ZW0uVHlwZUZvbGRlcikge1xuICAgICAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbi5mb2xkZXJzLnB1c2goX3RoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4uZmlsZXMucHVzaChfdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTdGF0dXNJdGVtLCBbe1xuICAgICAgICBrZXk6ICdnZXRJZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pZDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0UGFyZW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBhcmVudCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExhYmVsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExhYmVsKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xhYmVsLm5vcm1hbGl6ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9sYWJlbC5ub3JtYWxpemUoJ05GQycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbGFiZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZUxhYmVsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUxhYmVsKGxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLl9sYWJlbCA9IGxhYmVsO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRGdWxsUGF0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRGdWxsUGF0aCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQuZ2V0RnVsbFBhdGgoKSArICcvJyArIHRoaXMuZ2V0TGFiZWwoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0UHJvZ3Jlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UHJvZ3Jlc3MoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJvZ3Jlc3M7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldEV4aXN0cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRFeGlzdHMoKSB7XG4gICAgICAgICAgICB0aGlzLl9leGlzdHMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRFeGlzdHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RXhpc3RzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4aXN0cztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0VHlwZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRUeXBlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFN0YXR1cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRTdGF0dXMoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3RhdHVzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRTdGF0dXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0U3RhdHVzKHN0YXR1cykge1xuICAgICAgICAgICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3N0YXR1cycsIHN0YXR1cyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZVJlcG9zaXRvcnlJZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVSZXBvc2l0b3J5SWQocmVwb3NpdG9yeUlkKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBvc2l0b3J5SWQgPSByZXBvc2l0b3J5SWQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFJlcG9zaXRvcnlJZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRSZXBvc2l0b3J5SWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeUlkO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRFcnJvck1lc3NhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RXJyb3JNZXNzYWdlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Vycm9yTWVzc2FnZSB8fCAnJztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25FcnJvcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkVycm9yKGVycm9yTWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5fZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoU3RhdHVzSXRlbS5TdGF0dXNFcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Byb2Nlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2Vzcyhjb21wbGV0ZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLl9kb1Byb2Nlc3MoY29tcGxldGVDYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Fib3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFib3J0KGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kb0Fib3J0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZG9BYm9ydChjb21wbGV0ZUNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncGF1c2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZG9QYXVzZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0dXMgPSB0aGlzLl9kb1BhdXNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoc3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVzdW1lJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc3VtZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kb1Jlc3VtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RvUmVzdW1lKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0dXMoU3RhdHVzSXRlbS5TdGF0dXNMb2FkaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWRkQ2hpbGQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkQ2hpbGQoY2hpbGQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnBnW2NoaWxkLmdldElkKCldID0gMDtcbiAgICAgICAgICAgIGNoaWxkLm9ic2VydmUoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLmNoaWxkcmVuLnBnW2NoaWxkLmdldElkKCldID0gcHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnJlY29tcHV0ZVByb2dyZXNzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVjb21wdXRlUHJvZ3Jlc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVjb21wdXRlUHJvZ3Jlc3MoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFjY3UgPSBPYmplY3Qua2V5cyh0aGlzLmNoaWxkcmVuLnBnKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLmNoaWxkcmVuLnBnW2tdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYWNjdS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VtID0gYWNjdS5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Byb2dyZXNzID0gc3VtIC8gYWNjdS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3Byb2dyZXNzJywgdGhpcy5fcHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmVDaGlsZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVDaGlsZChjaGlsZCkge1xuXG4gICAgICAgICAgICBjaGlsZC5hYm9ydCgpO1xuICAgICAgICAgICAgY2hpbGQud2FsayhmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgICAgIGMuYWJvcnQoKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sIFN0YXR1c0l0ZW0uVHlwZUZpbGUpO1xuXG4gICAgICAgICAgICB2YXIgaWQgPSBjaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgdmFyIGZvbGRlckluZGV4ID0gdGhpcy5jaGlsZHJlbi5mb2xkZXJzLmluZGV4T2YoY2hpbGQpO1xuICAgICAgICAgICAgdmFyIGZpbGVJbmRleCA9IHRoaXMuY2hpbGRyZW4uZmlsZXMuaW5kZXhPZihjaGlsZCk7XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZm9sZGVySW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9sZGVycyA9IExhbmdVdGlscy5hcnJheVdpdGhvdXQodGhpcy5jaGlsZHJlbi5mb2xkZXJzLCBmb2xkZXJJbmRleCk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGVJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5maWxlcyA9IExhbmdVdGlscy5hcnJheVdpdGhvdXQodGhpcy5jaGlsZHJlbi5maWxlcywgZmlsZUluZGV4KTtcbiAgICAgICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuc3RvcE9ic2VydmluZygncHJvZ3Jlc3MnKTtcblxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNoaWxkcmVuLnBnW2lkXTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY29tcHV0ZVByb2dyZXNzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2NoaWxkcmVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldENoaWxkcmVuJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENoaWxkcmVuKCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5jaGlsZHJlbi5mb2xkZXJzKSwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuY2hpbGRyZW4uZmlsZXMpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnd2FsaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB3YWxrKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IFN0YXR1c0l0ZW0uVHlwZUJvdGg7XG4gICAgICAgICAgICB2YXIgc3RvcCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFN0YXR1c0l0ZW0uVHlwZUJvdGggfHwgdHlwZSA9PT0gU3RhdHVzSXRlbS5UeXBlRmlsZSkge1xuICAgICAgICAgICAgICAgIHZhciBmaWxlcyA9IHRoaXMuY2hpbGRyZW4uZmlsZXM7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcChmaWxlc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcihmaWxlc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZpbGVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb2xkZXJzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh0eXBlID09PSBTdGF0dXNJdGVtLlR5cGVGb2xkZXIgfHwgdHlwZSA9PT0gU3RhdHVzSXRlbS5UeXBlQm90aCkgJiYgZmlsdGVyKGNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghc3RvcChjaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQud2FsayhjYWxsYmFjaywgZmlsdGVyLCB0eXBlLCBzdG9wKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29sbGVjdFdpdGhMaW1pdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb2xsZWN0V2l0aExpbWl0KGxpbWl0KSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6ICdib3RoJztcblxuICAgICAgICAgICAgdmFyIGFjY3UgPSBbXTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIGNhbGxiYWNrKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBhY2N1LnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHN0b3AgPSBmdW5jdGlvbiBzdG9wKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjdS5sZW5ndGggPj0gbGltaXQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy53YWxrKGNhbGxiYWNrLCBmaWx0ZXIsIHR5cGUsIHN0b3ApO1xuICAgICAgICAgICAgcmV0dXJuIGFjY3U7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3RhdHVzSXRlbTtcbn0oX29ic2VydmFibGUyLmRlZmF1bHQpO1xuXG5TdGF0dXNJdGVtLlN0YXR1c05ldyA9ICduZXcnO1xuU3RhdHVzSXRlbS5TdGF0dXNBbmFseXplID0gJ2FuYWx5c2UnO1xuU3RhdHVzSXRlbS5TdGF0dXNMb2FkaW5nID0gJ2xvYWRpbmcnO1xuU3RhdHVzSXRlbS5TdGF0dXNMb2FkZWQgPSAnbG9hZGVkJztcblN0YXR1c0l0ZW0uU3RhdHVzRXJyb3IgPSAnZXJyb3InO1xuU3RhdHVzSXRlbS5TdGF0dXNQYXVzZSA9ICdwYXVzZSc7XG5TdGF0dXNJdGVtLlN0YXR1c0Nhbm5vdFBhdXNlID0gJ2Nhbm5vdC1wYXVzZSc7XG5TdGF0dXNJdGVtLlN0YXR1c011bHRpUGF1c2UgPSAnbXVsdGktcGF1c2UnO1xuXG5TdGF0dXNJdGVtLlR5cGVGb2xkZXIgPSAnZm9sZGVyJztcblN0YXR1c0l0ZW0uVHlwZUZpbGUgPSAnZmlsZSc7XG5TdGF0dXNJdGVtLlR5cGVCb3RoID0gJ2JvdGgnO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBTdGF0dXNJdGVtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBDbGVhck9wdGlvbnNQYW5lID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQ2xlYXJPcHRpb25zUGFuZSwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDbGVhck9wdGlvbnNQYW5lKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2xlYXJPcHRpb25zUGFuZSk7XG5cbiAgICAgICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChDbGVhck9wdGlvbnNQYW5lLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ2xlYXJPcHRpb25zUGFuZSkpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDbGVhck9wdGlvbnNQYW5lLCBbe1xuICAgICAgICBrZXk6ICdjbGVhcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhcih2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJhbGxcIjpcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUuY2xlYXJBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImxvYWRlZFwiOlxuICAgICAgICAgICAgICAgICAgICBzdG9yZS5jbGVhclN0YXR1cygnbG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgICAgICBzdG9yZS5jbGVhclN0YXR1cygnZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBtc2cgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlbjogdGhpcy5wcm9wcy5vcGVuLFxuICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogdGhpcy5wcm9wcy5hbmNob3JFbCxcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gb25SZXF1ZXN0Q2xvc2UoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLm9uRGlzbWlzcyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLk1lbnUsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDE0NiB9LCBkZXNrdG9wOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU3ViaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBsaW5lSGVpZ2h0OiAnMjZweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbXNnWydodG1sX3VwbG9hZGVyLmNsZWFyLWhlYWRlciddXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtc2dbJ2h0bWxfdXBsb2FkZXIuY2xlYXItZmluaXNoZWQnXSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuY2xlYXIoJ2xvYWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG1zZ1snaHRtbF91cGxvYWRlci5jbGVhci1mYWlsZWQnXSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuY2xlYXIoJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbXNnWydodG1sX3VwbG9hZGVyLmNsZWFyLWFsbCddLCBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5jbGVhcignYWxsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDbGVhck9wdGlvbnNQYW5lO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gQ2xlYXJPcHRpb25zUGFuZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgQ29uZmlybUV4aXN0cyA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKENvbmZpcm1FeGlzdHMsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQ29uZmlybUV4aXN0cyhwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29uZmlybUV4aXN0cyk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKENvbmZpcm1FeGlzdHMuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihDb25maXJtRXhpc3RzKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmFsdWU6ICdyZW5hbWUtZm9sZGVycycsXG4gICAgICAgICAgICBzYXZlVmFsdWU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ29uZmlybUV4aXN0cywgW3tcbiAgICAgICAga2V5OiAnY2FuY2VsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3VibWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3N0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICAgIHNhdmVWYWx1ZSA9IF9zdGF0ZS5zYXZlVmFsdWU7XG5cbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Db25maXJtKHZhbHVlLCBzYXZlVmFsdWUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjaGVja0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja0NoYW5nZShlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNhdmVWYWx1ZTogbmV3VmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JhZGlvQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJhZGlvQ2hhbmdlKGUsIG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IG5ld1ZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIHZhciBfc3RhdGUyID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9zdGF0ZTIudmFsdWUsXG4gICAgICAgICAgICAgICAgc2F2ZVZhbHVlID0gX3N0YXRlMi5zYXZlVmFsdWU7XG5cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIHBhZGRpbmc6IDE2LCBmb250U2l6ZTogMTQsIHRvcDogNDksIGxlZnQ6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC43KScgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogNTAwLCBwYWRkaW5nOiAxNiwgZm9udFNpemU6IDE0LCBtYXJnaW46ICcwIGF1dG8nIH0sIHpEZXB0aDogMiB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoNScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpby5NZXNzYWdlSGFzaFsxMjRdXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUmFkaW9CdXR0b25Hcm91cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlZjogJ2dyb3VwJywgbmFtZTogJ3NoaXBTcGVlZCcsIGRlZmF1bHRTZWxlY3RlZDogdmFsdWUsIG9uQ2hhbmdlOiB0aGlzLnJhZGlvQ2hhbmdlLmJpbmQodGhpcykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZS1mb2xkZXJzJywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLmNvbmZpcm0ucmVuYW1lLmFsbCddLCBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiA4IH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFkaW9CdXR0b24sIHsgdmFsdWU6ICdyZW5hbWUnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuY29uZmlybS5yZW5hbWUubWVyZ2UnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAnb3ZlcndyaXRlJywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLmNvbmZpcm0ub3ZlcndyaXRlJ10gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW5Ub3A6IDMwLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwgeyBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuY29uZmlybS5zYXZlLmNob2ljZSddLCBjaGVja2VkOiBzYXZlVmFsdWUsIG9uQ2hlY2s6IHRoaXMuY2hlY2tDaGFuZ2UuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFs1NF0sIG9uQ2xpY2s6IHRoaXMuY2FuY2VsLmJpbmQodGhpcykgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHsgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzQ4XSwgb25DbGljazogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDb25maXJtRXhpc3RzO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gQ29uZmlybUV4aXN0cztcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9VcGxvYWRPcHRpb25zUGFuZSA9IHJlcXVpcmUoJy4vVXBsb2FkT3B0aW9uc1BhbmUnKTtcblxudmFyIF9VcGxvYWRPcHRpb25zUGFuZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9VcGxvYWRPcHRpb25zUGFuZSk7XG5cbnZhciBfQ2xlYXJPcHRpb25zUGFuZSA9IHJlcXVpcmUoJy4vQ2xlYXJPcHRpb25zUGFuZScpO1xuXG52YXIgX0NsZWFyT3B0aW9uc1BhbmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ2xlYXJPcHRpb25zUGFuZSk7XG5cbnZhciBfVHJhbnNmZXJzTGlzdCA9IHJlcXVpcmUoJy4vVHJhbnNmZXJzTGlzdCcpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVHJhbnNmZXJzTGlzdCk7XG5cbnZhciBfQ29uZmlybUV4aXN0cyA9IHJlcXVpcmUoJy4vQ29uZmlybUV4aXN0cycpO1xuXG52YXIgX0NvbmZpcm1FeGlzdHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29uZmlybUV4aXN0cyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMi5kZWZhdWx0LnJlcXVpcmVMaWIoJ2hvYycpLFxuICAgIGRyb3BQcm92aWRlciA9IF9QeWRpbyRyZXF1aXJlTGliLmRyb3BQcm92aWRlcjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IF9weWRpbzIuZGVmYXVsdC5yZXF1aXJlTGliKCdmb3JtJyksXG4gICAgRmlsZURyb3Bab25lID0gX1B5ZGlvJHJlcXVpcmVMaWIyLkZpbGVEcm9wWm9uZTtcblxudmFyIERyb3BVcGxvYWRlciA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKERyb3BVcGxvYWRlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBEcm9wVXBsb2FkZXIocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERyb3BVcGxvYWRlcik7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKERyb3BVcGxvYWRlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKERyb3BVcGxvYWRlcikpLmNhbGwodGhpcywgcHJvcHMpKTtcblxuICAgICAgICB2YXIgc3RvcmUgPSBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgICAgIF90aGlzLl9zdG9yZU9ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlc3Npb25zOiBzdG9yZS5nZXRTZXNzaW9ucygpLFxuICAgICAgICAgICAgICAgIHN0b3JlUnVubmluZzogc3RvcmUuaXNSdW5uaW5nKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBzdG9yZS5vYnNlcnZlKFwidXBkYXRlXCIsIF90aGlzLl9zdG9yZU9ic2VydmVyKTtcbiAgICAgICAgc3RvcmUub2JzZXJ2ZShcImF1dG9fY2xvc2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzLnByb3BzLm9uRGlzbWlzcykge1xuICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNob3dPcHRpb25zOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbmZpZ3M6IFVwbG9hZGVyTW9kZWwuQ29uZmlncy5nZXRJbnN0YW5jZSgpLFxuICAgICAgICAgICAgc2Vzc2lvbnM6IHN0b3JlLmdldFNlc3Npb25zKCksXG4gICAgICAgICAgICBzdG9yZVJ1bm5pbmc6IHN0b3JlLmlzUnVubmluZygpLFxuICAgICAgICAgICAgY29uZmlybURpYWxvZzogcHJvcHMuY29uZmlybURpYWxvZ1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKERyb3BVcGxvYWRlciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgaWYgKG5leHRQcm9wcy5jb25maXJtRGlhbG9nICE9PSB0aGlzLnN0YXRlLmNvbmZpcm1EaWFsb2cpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybURpYWxvZzogbmV4dFByb3BzLmNvbmZpcm1EaWFsb2cgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0b3JlT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuc3RvcE9ic2VydmluZyhcInVwZGF0ZVwiLCB0aGlzLl9zdG9yZU9ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuc3RvcE9ic2VydmluZyhcImF1dG9fY2xvc2VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uRHJvcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkRyb3AoZmlsZXMpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0Tm9kZSA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldENvbnRleHRIb2xkZXIoKS5nZXRDb250ZXh0Tm9kZSgpO1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLmhhbmRsZURyb3BFdmVudFJlc3VsdHMobnVsbCwgZmlsZXMsIGNvbnRleHROb2RlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25Gb2xkZXJQaWNrZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25Gb2xkZXJQaWNrZWQoZmlsZXMpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0Tm9kZSA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldENvbnRleHRIb2xkZXIoKS5nZXRDb250ZXh0Tm9kZSgpO1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLmhhbmRsZUZvbGRlclBpY2tlclJlc3VsdChmaWxlcywgY29udGV4dE5vZGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdGFydCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkucmVzdW1lKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BhdXNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBhdXNlKGUpIHtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvcGVuQ2xlYXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkNsZWFyKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNob3dDbGVhcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjbGVhckFuY2hvckVsOiBlLmN1cnJlbnRUYXJnZXRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd0b2dnbGVPcHRpb25zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZU9wdGlvbnMoZSkge1xuICAgICAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgX3N0YXRlJHNob3dPcHRpb25zID0gX3N0YXRlLnNob3dPcHRpb25zLFxuICAgICAgICAgICAgICAgIHNob3dPcHRpb25zID0gX3N0YXRlJHNob3dPcHRpb25zID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9zdGF0ZSRzaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0ID0gX3N0YXRlLmN1cnJlbnRUYXJnZXQ7XG5cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2hvd09wdGlvbnM6ICFzaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBvcHRpb25zQW5jaG9yRWw6IGUuY3VycmVudFRhcmdldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5GaWxlUGlja2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5GaWxlUGlja2VyKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucmVmcy5kcm9wem9uZS5vcGVuKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5Gb2xkZXJQaWNrZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkZvbGRlclBpY2tlcihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnJlZnMuZHJvcHpvbmUub3BlbkZvbGRlclBpY2tlcigpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaWFsb2dTdWJtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlhbG9nU3VibWl0KG5ld1ZhbHVlLCBzYXZlVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5zdGF0ZS5jb25maWdzO1xuXG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuZ2V0U2Vzc2lvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlc3Npb24uZ2V0U3RhdHVzKCkgPT09ICdjb25maXJtJykge1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uLnByZXBhcmUobmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHNhdmVWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfZXhpc3RpbmcnLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybURpYWxvZzogZmFsc2UgfSk7XG4gICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbigndXBsb2FkJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RpYWxvZ0NhbmNlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaWFsb2dDYW5jZWwoKSB7XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICBzdG9yZS5nZXRTZXNzaW9ucygpLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRTdGF0dXMoKSA9PT0gJ2NvbmZpcm0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnJlbW92ZVNlc3Npb24oc2Vzc2lvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybURpYWxvZzogZmFsc2UgfSk7XG4gICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbigndXBsb2FkJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N1cHBvcnRzRm9sZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1cHBvcnRzRm9sZGVyKCkge1xuICAgICAgICAgICAgdmFyIHN1cHBvcnRzID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnZmlsZScpO1xuICAgICAgICAgICAgaWYgKCd3ZWJraXRkaXJlY3RvcnknIGluIGUpIHtcbiAgICAgICAgICAgICAgICBzdXBwb3J0cyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaDtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzLFxuICAgICAgICAgICAgICAgIHNob3dEaXNtaXNzID0gX3Byb3BzLnNob3dEaXNtaXNzLFxuICAgICAgICAgICAgICAgIG9uRGlzbWlzcyA9IF9wcm9wcy5vbkRpc21pc3M7XG5cbiAgICAgICAgICAgIHZhciBjb25uZWN0RHJvcFRhcmdldCA9IHRoaXMucHJvcHMuY29ubmVjdERyb3BUYXJnZXQgfHwgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgY29uZmlncyA9IF9zdGF0ZTIuY29uZmlncyxcbiAgICAgICAgICAgICAgICBzaG93T3B0aW9ucyA9IF9zdGF0ZTIuc2hvd09wdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uc0FuY2hvckVsID0gX3N0YXRlMi5vcHRpb25zQW5jaG9yRWwsXG4gICAgICAgICAgICAgICAgc2hvd0NsZWFyID0gX3N0YXRlMi5zaG93Q2xlYXIsXG4gICAgICAgICAgICAgICAgY2xlYXJBbmNob3JFbCA9IF9zdGF0ZTIuY2xlYXJBbmNob3JFbCxcbiAgICAgICAgICAgICAgICBzZXNzaW9ucyA9IF9zdGF0ZTIuc2Vzc2lvbnMsXG4gICAgICAgICAgICAgICAgc3RvcmVSdW5uaW5nID0gX3N0YXRlMi5zdG9yZVJ1bm5pbmcsXG4gICAgICAgICAgICAgICAgY29uZmlybURpYWxvZyA9IF9zdGF0ZTIuY29uZmlybURpYWxvZztcblxuICAgICAgICAgICAgdmFyIHN0b3JlID0gVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICB2YXIgbGlzdEVtcHR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocy5nZXRDaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0RW1wdHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3REcm9wVGFyZ2V0KF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIGJhY2tncm91bmRDb2xvcjogJyNGQUZBRkEnIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIHBhZGRpbmdMZWZ0OiAxNiwgcGFkZGluZ1JpZ2h0OiAxNiwgd2lkdGg6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2gzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1snaHRtbF91cGxvYWRlci5kaWFsb2cudGl0bGUnXVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kb3RzLXZlcnRpY2FsXCIsIHByaW1hcnk6IHRydWUsIGljb25TdHlsZTogeyBmb250U2l6ZTogMTggfSwgc3R5bGU6IHsgcGFkZGluZzogMTQgfSwgdG9vbHRpcDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIub3B0aW9ucyddLCBvbkNsaWNrOiB0aGlzLnRvZ2dsZU9wdGlvbnMuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1wbGF5JyB9KSwgbGFiZWw6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLnN0YXJ0J10sIG9uQ2xpY2s6IHRoaXMuc3RhcnQuYmluZCh0aGlzKSwgcHJpbWFyeTogdHJ1ZSwgZGlzYWJsZWQ6IHN0b3JlLmlzUnVubmluZygpIHx8ICFzdG9yZS5oYXNRdWV1ZSgpIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGljb246IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxNiB9LCBjbGFzc05hbWU6ICdtZGkgbWRpLXBhdXNlJyB9KSwgbGFiZWw6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLnBhdXNlJ10sIG9uQ2xpY2s6IHRoaXMucGF1c2UuYmluZCh0aGlzKSwgcHJpbWFyeTogdHJ1ZSwgZGlzYWJsZWQ6ICFzdG9yZS5pc1J1bm5pbmcoKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1kZWxldGUnIH0pLCBsYWJlbDogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuY2xlYXInXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiBcIm1kaSBtZGktbWVudS1kb3duXCIgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICksIG9uQ2xpY2s6IHRoaXMub3BlbkNsZWFyLmJpbmQodGhpcyksIHByaW1hcnk6IHRydWUsIGRpc2FibGVkOiBsaXN0RW1wdHkgfSksXG4gICAgICAgICAgICAgICAgICAgIHNob3dEaXNtaXNzICYmIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWNsb3NlXCIsIHN0eWxlOiB7IHBhZGRpbmc6IDE0IH0sIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9uRGlzbWlzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIEZpbGVEcm9wWm9uZSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAndHJhbnNwYXJlbnQtZHJvcHpvbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnZHJvcHpvbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVGb2xkZXJzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VwcG9ydENsaWNrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlnbm9yZU5hdGl2ZURyb3A6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRyb3A6IHRoaXMub25Ecm9wLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZvbGRlclBpY2tlZDogdGhpcy5vbkZvbGRlclBpY2tlZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiA0MjAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVHJhbnNmZXJzTGlzdDIuZGVmYXVsdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbnM6IHNlc3Npb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1N0YXJ0OiBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX1NUQVJUJywgJ3VwbG9hZF9hdXRvX3NlbmQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRGlzbWlzczogdGhpcy5wcm9wcy5vbkRpc21pc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yZTogc3RvcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblBpY2tGaWxlOiBmdW5jdGlvbiBvblBpY2tGaWxlKGV2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLm9wZW5GaWxlUGlja2VyKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvblBpY2tGb2xkZXI6IHRoaXMuc3VwcG9ydHNGb2xkZXIoKSA/IGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5vcGVuRm9sZGVyUGlja2VyKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVXBsb2FkT3B0aW9uc1BhbmUyLmRlZmF1bHQsIHsgY29uZmlnczogY29uZmlncywgb3Blbjogc2hvd09wdGlvbnMsIGFuY2hvckVsOiBvcHRpb25zQW5jaG9yRWwsIG9uRGlzbWlzczogZnVuY3Rpb24gb25EaXNtaXNzKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi50b2dnbGVPcHRpb25zKGUpO1xuICAgICAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9DbGVhck9wdGlvbnNQYW5lMi5kZWZhdWx0LCB7IGNvbmZpZ3M6IGNvbmZpZ3MsIG9wZW46IHNob3dDbGVhciwgYW5jaG9yRWw6IGNsZWFyQW5jaG9yRWwsIG9uRGlzbWlzczogZnVuY3Rpb24gb25EaXNtaXNzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgc2hvd0NsZWFyOiBmYWxzZSwgY2xlYXJBbmNob3JFbDogbnVsbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICBjb25maXJtRGlhbG9nICYmIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9Db25maXJtRXhpc3RzMi5kZWZhdWx0LCB7IG9uQ29uZmlybTogdGhpcy5kaWFsb2dTdWJtaXQuYmluZCh0aGlzKSwgb25DYW5jZWw6IHRoaXMuZGlhbG9nQ2FuY2VsLmJpbmQodGhpcykgfSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERyb3BVcGxvYWRlcjtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IERyb3BVcGxvYWRlciA9IGRyb3BQcm92aWRlcihEcm9wVXBsb2FkZXIpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBEcm9wVXBsb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3BhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcGF0aCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfU3RhdHVzSXRlbSA9IHJlcXVpcmUoJy4uL21vZGVsL1N0YXR1c0l0ZW0nKTtcblxudmFyIF9TdGF0dXNJdGVtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1N0YXR1c0l0ZW0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciB1cGxvYWRTdGF0dXNNZXNzYWdlcyA9IHtcbiAgICBcIm5ld1wiOiA0MzMsXG4gICAgXCJsb2FkaW5nXCI6IDQzNCxcbiAgICBcImxvYWRlZFwiOiA0MzUsXG4gICAgXCJlcnJvclwiOiA0MzZcbn07XG5cbnZhciBUcmFuc2ZlciA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFRyYW5zZmVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFRyYW5zZmVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2Zlcik7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRyYW5zZmVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVHJhbnNmZXIpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dBbGw6IGZhbHNlLFxuICAgICAgICAgICAgc3RhdHVzOiBwcm9wcy5pdGVtLmdldFN0YXR1cygpLFxuICAgICAgICAgICAgcHJldmlld1VybDogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzOiBwcm9wcy5pdGVtLmdldFByb2dyZXNzKCkgfHwgMFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFRyYW5zZmVyLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblxuICAgICAgICAgICAgdGhpcy5fcGdPYnNlcnZlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHByb2dyZXNzOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9zdGF0dXNPYnNlcnZlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHN0YXR1czogdmFsdWUgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdwcm9ncmVzcycsIHRoaXMuX3BnT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdzdGF0dXMnLCB0aGlzLl9zdGF0dXNPYnNlcnZlcik7XG4gICAgICAgICAgICBpdGVtLm9ic2VydmUoJ2NoaWxkcmVuJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFVwbG9hZGVyTW9kZWwuVXBsb2FkSXRlbSAmJiAvXFwuKGpwZT9nfHBuZ3xnaWYpJC9pLnRlc3QoaXRlbS5nZXRGaWxlKCkubmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5wcmV2aWV3VXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcmV2aWV3VXJsOiBpdGVtLnByZXZpZXdVcmwgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5wcmV2aWV3VXJsID0gcmVhZGVyLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcHJldmlld1VybDogcmVhZGVyLnJlc3VsdCB9KTtcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoaXRlbS5nZXRGaWxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3Byb2dyZXNzJywgdGhpcy5fcGdPYnNlcnZlcik7XG4gICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3N0YXR1cycsIHRoaXMuX3N0YXR1c09ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpZiAoaXRlbS5nZXRQYXJlbnQoKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZ2V0UGFyZW50KCkucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Fib3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFib3J0KCkge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLml0ZW07XG5cbiAgICAgICAgICAgIGl0ZW0uYWJvcnQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmV0cnknLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmV0cnkoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcyxcbiAgICAgICAgICAgICAgICBpdGVtID0gX3Byb3BzLml0ZW0sXG4gICAgICAgICAgICAgICAgc3RvcmUgPSBfcHJvcHMuc3RvcmU7XG5cbiAgICAgICAgICAgIGl0ZW0uc2V0U3RhdHVzKF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c05ldyk7XG4gICAgICAgICAgICBzdG9yZS5wcm9jZXNzTmV4dCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcyxcbiAgICAgICAgICAgICAgICBpdGVtID0gX3Byb3BzMi5pdGVtLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IF9wcm9wczIuY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgIHN0eWxlID0gX3Byb3BzMi5zdHlsZSxcbiAgICAgICAgICAgICAgICBsaW1pdCA9IF9wcm9wczIubGltaXQsXG4gICAgICAgICAgICAgICAgbGV2ZWwgPSBfcHJvcHMyLmxldmVsLFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMgPSBfcHJvcHMyLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgc3RvcmUgPSBfcHJvcHMyLnN0b3JlO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgb3BlbiA9IF9zdGF0ZS5vcGVuLFxuICAgICAgICAgICAgICAgIHNob3dBbGwgPSBfc3RhdGUuc2hvd0FsbCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IF9zdGF0ZS5wcm9ncmVzcyxcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSBfc3RhdGUuc3RhdHVzLFxuICAgICAgICAgICAgICAgIHByZXZpZXdVcmwgPSBfc3RhdGUucHJldmlld1VybDtcblxuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gaXRlbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICAgICAgdmFyIGlzRGlyID0gaXRlbSBpbnN0YW5jZW9mIFVwbG9hZGVyTW9kZWwuRm9sZGVySXRlbTtcbiAgICAgICAgICAgIHZhciBpc1BhcnQgPSBpdGVtIGluc3RhbmNlb2YgVXBsb2FkZXJNb2RlbC5QYXJ0SXRlbTtcbiAgICAgICAgICAgIHZhciBpc1Nlc3Npb24gPSBpdGVtIGluc3RhbmNlb2YgVXBsb2FkZXJNb2RlbC5TZXNzaW9uO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX3B5ZGlvMi5kZWZhdWx0LmdldE1lc3NhZ2VzKCk7XG5cbiAgICAgICAgICAgIHZhciBzdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgbWFpbjogX2V4dGVuZHMoe30sIHN0eWxlLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNDI0MjQyJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6IChsZXZlbCAtIDEpICogMjQsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6IGxldmVsID4gMSA/IDEwIDogMTYsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206IDYsXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogY2hpbGRyZW4ubGVuZ3RoID8gJ3BvaW50ZXInIDogJ2RlZmF1bHQnLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJMZWZ0OiBsZXZlbCA9PT0gMSA/ICczcHggc29saWQgdHJhbnNwYXJlbnQnIDogJydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeUxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogLjMsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGVmdEljb246IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGlzUGFydCA/ICcjOWU5ZTllJyA6ICcjNjE2MTYxJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE4XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3SW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNlZWUnLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU2l6ZTogJ2NvdmVyJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAzMixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDMyLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IGlzRGlyID8gNTAwIDogNDAwLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogaXNQYXJ0ID8gJyM5ZTllOWUnIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZm9udFN0eWxlOiBpc1BhcnQgPyAnaXRhbGljJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcbiAgICAgICAgICAgICAgICAgICAgZmxleDogMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyTWVzc2FnZToge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyNlNTM5MzUnLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6IDIsXG4gICAgICAgICAgICAgICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGdCYXI6IHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNDgsXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM5ZTllOWUnLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTZcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvZ2dsZUljb246IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjYmRiZGJkJyxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogNFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBjaGlsZENvbXBzID0gW10sXG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2FsbGJhY2sgPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgcGdDb2xvciA9IHZvaWQgMDtcblxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVuIHx8IGlzU2Vzc2lvbiAmJiBzdGF0dXMgIT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0FuYWx5emUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNsaWNlZCA9IHNob3dBbGwgPyBjaGlsZHJlbiA6IGNoaWxkcmVuLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRDb21wcyA9IHNsaWNlZC5tYXAoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoVHJhbnNmZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGNoaWxkLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQ6IGxpbWl0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBsZXZlbCArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uczogZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZTogc3RvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IHNsaWNlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkQ29tcHMucHVzaChfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgc3R5bGVzLmxpbmUsIHsgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlckxlZnQ6ICcnLCBwYWRkaW5nTGVmdDogbGV2ZWwgKiAyMCB9KSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IHNob3dBbGw6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgc3R5bGU6IHN0eWxlcy5sZWZ0SWNvbiwgY2xhc3NOYW1lOiBcIm1kaSBtZGktcGx1cy1ib3gtb3V0bGluZVwiIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZm9udFN0eWxlOiAnaXRhbGljJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLmxpc3Quc2hvdy1tb3JlJ10ucmVwbGFjZSgnJWQnLCBjaGlsZHJlbi5sZW5ndGggLSBzbGljZWQubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gZnVuY3Rpb24gdG9nZ2xlQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IG9wZW46ICFvcGVuIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBvbkNsaWNrOiB0b2dnbGVDYWxsYmFjaywgc3R5bGU6IHN0eWxlcy50b2dnbGVJY29uLCBjbGFzc05hbWU6IFwibWRpIG1kaS1jaGV2cm9uLVwiICsgKG9wZW4gPyBcImRvd25cIiA6IFwicmlnaHRcIikgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0Rpcikge1xuICAgICAgICAgICAgICAgIGljb25DbGFzcyA9IFwibWRpIG1kaS1mb2xkZXJcIjtcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNsb3NlLWNpcmNsZS1vdXRsaW5lJywgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyM0Y2FmNTAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQYXJ0KSB7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gXCJtZGkgbWRpLXBhY2thZ2UtdXBcIjtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyM0Y2FmNTAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gXCJtZGkgbWRpLWZpbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ID0gX3BhdGgyLmRlZmF1bHQuZ2V0RmlsZUV4dGVuc2lvbihpdGVtLmdldEZ1bGxQYXRoKCkpO1xuICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLmhhcyhleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfZXh0ZW5zaW9ucyRnZXQgPSBleHRlbnNpb25zLmdldChleHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udEljb24gPSBfZXh0ZW5zaW9ucyRnZXQuZm9udEljb247XG5cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gJ21pbWVmb250IG1kaSBtZGktJyArIGZvbnRJY29uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0xvYWRpbmcgfHwgc3RhdHVzID09PSBfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNDYW5ub3RQYXVzZSB8fCBzdGF0dXMgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c011bHRpUGF1c2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1zdG9wJywgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyNlNTM5MzUnO1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1yZXN0YXJ0XCIsIHN0eWxlOiB7IGNvbG9yOiAnI2U1MzkzNScgfSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucmV0cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGdDb2xvciA9ICcjNGNhZjUwJztcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1jbG9zZS1jaXJjbGUtb3V0bGluZScsIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBsYWJlbCA9IF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKGl0ZW0uZ2V0RnVsbFBhdGgoKSk7XG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3NCYXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5MaW5lYXJQcm9ncmVzcywgeyBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6ICcjZWVlZWVlJywgaGVpZ2h0OiAzIH0sIGNvbG9yOiBwZ0NvbG9yLCBtaW46IDAsIG1heDogMTAwLCB2YWx1ZTogcHJvZ3Jlc3MsIG1vZGU6IFwiZGV0ZXJtaW5hdGVcIiB9KTtcblxuICAgICAgICAgICAgaWYgKGlzU2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0FuYWx5emUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKVtcImh0bWxfdXBsb2FkZXIuYW5hbHl6ZS5zdGVwXCJdO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2lyY3VsYXJQcm9ncmVzcywgeyBzaXplOiAxNiwgdGhpY2tuZXNzOiAyLCBzdHlsZTogeyBtYXJnaW5Ub3A6IDEgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJldmlld1VybCkge1xuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHN0eWxlcy5sZWZ0SWNvbiwgeyBtYXJnaW5Ub3A6IC00LCBtYXJnaW5Cb3R0b206IC01IH0pIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiBfZXh0ZW5kcyh7IGJhY2tncm91bmQ6ICd1cmwoJyArIHByZXZpZXdVcmwgKyAnKScgfSwgc3R5bGVzLnByZXZpZXdJbWFnZSkgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5sZWZ0SWNvbiB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiBpY29uQ2xhc3MsIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogc3R5bGVzLnByZXZpZXdJbWFnZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHN0eWxlcy5wcmV2aWV3SW1hZ2UuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IHN0eWxlcy5wcmV2aWV3SW1hZ2Uud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNFQ0VGRjEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogNlxuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzdGF0dXNMYWJlbCA9IHZvaWQgMDtcbiAgICAgICAgICAgIHZhciBzZWNvbmRhcnlMaW5lID0gX2V4dGVuZHMoe30sIHN0eWxlcy5zZWNvbmRhcnlMaW5lKTtcbiAgICAgICAgICAgIHZhciBpdGVtVHlwZSA9IGlzRGlyID8gXCJkaXJcIiA6IGlzUGFydCA/IFwicGFydFwiIDogXCJmaWxlXCI7XG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5TGluZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgICAgICAgICBzdGF0dXNMYWJlbCA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5lcnJNZXNzYWdlLCB0aXRsZTogaXRlbS5nZXRFcnJvck1lc3NhZ2UoKSB9LFxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdldEVycm9yTWVzc2FnZSgpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzTGFiZWwgPSBtZXNzYWdlc1snaHRtbF91cGxvYWRlci5zdGF0dXMuJyArIGl0ZW1UeXBlICsgJy4nICsgc3RhdHVzXSB8fCBtZXNzYWdlc1snaHRtbF91cGxvYWRlci5zdGF0dXMuJyArIHN0YXR1c10gfHwgc3RhdHVzO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmdldFNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzTGFiZWwgPSBpdGVtLmdldEh1bWFuU2l6ZSgpICsgJyAtICcgKyBzdGF0dXNMYWJlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMubWFpbiwgY2xhc3NOYW1lOiBcInVwbG9hZC1cIiArIHN0YXR1cyArIFwiIFwiICsgKGNsYXNzTmFtZSA/IGNsYXNzTmFtZSA6IFwiXCIpIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMubGluZSB9LFxuICAgICAgICAgICAgICAgICAgICBsZWZ0SWNvbixcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgb3ZlcmZsb3c6ICdoaWRkZW4nLCBwYWRkaW5nTGVmdDogNCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IHRvZ2dsZUNhbGxiYWNrLCBzdHlsZTogc3R5bGVzLmxhYmVsIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzZWNvbmRhcnlMaW5lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzTGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMucGdCYXIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5yaWdodEJ1dHRvbiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2hpbGRDb21wc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUcmFuc2Zlcjtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRyYW5zZmVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1RyYW5zZmVyID0gcmVxdWlyZSgnLi9UcmFuc2ZlcicpO1xuXG52YXIgX1RyYW5zZmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyKTtcblxudmFyIF9zdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9kb20gPSByZXF1aXJlKCdweWRpby91dGlsL2RvbScpO1xuXG52YXIgX2RvbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kb20pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBUcmFuc2ZlcnNMaXN0ID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVHJhbnNmZXJzTGlzdCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBUcmFuc2ZlcnNMaXN0KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2ZlcnNMaXN0KTtcblxuICAgICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRyYW5zZmVyc0xpc3QuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihUcmFuc2ZlcnNMaXN0KSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUcmFuc2ZlcnNMaXN0LCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgc2Vzc2lvbnMgPSBfcHJvcHMuc2Vzc2lvbnMsXG4gICAgICAgICAgICAgICAgc3RvcmUgPSBfcHJvcHMuc3RvcmUsXG4gICAgICAgICAgICAgICAgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWUsXG4gICAgICAgICAgICAgICAgb25QaWNrRmlsZSA9IF9wcm9wcy5vblBpY2tGaWxlLFxuICAgICAgICAgICAgICAgIG9uUGlja0ZvbGRlciA9IF9wcm9wcy5vblBpY2tGb2xkZXI7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gX2RvbTIuZGVmYXVsdC5nZXRCZXppZXJzVHJhbnNpdGlvbigpLnJlcGxhY2UoJ2FsbCAnLCAnY29sb3IgJyk7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKTtcbiAgICAgICAgICAgIHZhciBjc3MgPSAnXFxuICAgICAgICAgICAgLmRyb3AtdHJhbnNmZXItbGlzdHtcXG4gICAgICAgICAgICAgICAgY29sb3I6cmdiYSgzLCAxNjksIDI0NCwgMC41KTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAgICAgLnRyYW5zcGFyZW50LWRyb3B6b25lLmFjdGl2ZSAuZHJvcC10cmFuc2Zlci1saXN0e1xcbiAgICAgICAgICAgICAgICBjb2xvcjpyZ2JhKDMsIDE2OSwgMjQ0LCAwLjgpO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAuZHJvcC10cmFuc2Zlci1saXN0IGEsLmRyb3AtdHJhbnNmZXItbGlzdCBhOmhvdmVyIHtcXG4gICAgICAgICAgICAgICAgY29sb3I6cmdiYSgzLCAxNjksIDI0NCwgMSk7XFxuICAgICAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAnO1xuXG4gICAgICAgICAgICB2YXIgc2Vzc2lvbnNMaXN0ID0gdm9pZCAwO1xuICAgICAgICAgICAgaWYgKHNlc3Npb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzRW1wdHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBleHQgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5SZWdpc3RyeS5nZXRGaWxlc0V4dGVuc2lvbnMoKTtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50cyA9IHNlc3Npb25zLm1hcChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRDaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVHJhbnNmZXIyLmRlZmF1bHQsIHsgaXRlbTogc2Vzc2lvbiwgc3RvcmU6IHN0b3JlLCBzdHlsZToge30sIGxpbWl0OiAxMCwgbGV2ZWw6IDAsIGV4dGVuc2lvbnM6IGV4dCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbnNMaXN0ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgaGVpZ2h0OiAnMTAwJScsIG92ZXJmbG93WTogJ2F1dG8nLCBwYWRkaW5nOiAxMCwgcGFkZGluZ0JvdHRvbTogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRyb3BwZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGhlaWdodDogJzEwMCUnLCB3aWR0aDogJzEwMCUnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjRjVGNUY1JywgdHJhbnNpdGlvbjogdHJhbnNpdGlvbiB9LCBjbGFzc05hbWU6IFwiZHJvcC10cmFuc2Zlci1saXN0XCIgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJywgd2lkdGg6ICcxMDAlJywgZm9udFdlaWdodDogNTAwLCBmb250U2l6ZTogMTgsIHBhZGRpbmc6IDI0LCBsaW5lSGVpZ2h0OiAnMjhweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNsb3VkLXVwbG9hZCcsIHN0eWxlOiB7IGZvbnRTaXplOiAxMTAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1tcImh0bWxfdXBsb2FkZXIuZHJvcGhlcmVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1tcImh0bWxfdXBsb2FkZXIuZHJvcC1vclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IG9uUGlja0ZpbGUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1tcImh0bWxfdXBsb2FkZXIuZHJvcC1waWNrLWZpbGVcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBvblBpY2tGb2xkZXIgJiYgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzW1wiaHRtbF91cGxvYWRlci5kcm9wLW9yXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IG9uUGlja0ZvbGRlciB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1tcImh0bWxfdXBsb2FkZXIuZHJvcC1waWNrLWZvbGRlclwiXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJywgeyB0eXBlOiBcInRleHQvY3NzXCIsIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7IF9faHRtbDogY3NzIH0gfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgaGVpZ2h0OiAnMTAwJScsIG92ZXJmbG93OiAnaGlkZGVuJyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgd2lkdGg6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGRyb3BwZXJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHNlc3Npb25zTGlzdCAmJiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQyMCwgbWluV2lkdGg6IDQyMCwgbWF4V2lkdGg6IDQyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb25zTGlzdFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVHJhbnNmZXJzTGlzdDtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRyYW5zZmVyc0xpc3QgPSAoMCwgX3N0eWxlcy5tdWlUaGVtZWFibGUpKCkoVHJhbnNmZXJzTGlzdCk7XG5leHBvcnRzLmRlZmF1bHQgPSBUcmFuc2ZlcnNMaXN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBVcGxvYWRPcHRpb25zUGFuZSA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVwbG9hZE9wdGlvbnNQYW5lLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFVwbG9hZE9wdGlvbnNQYW5lKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBsb2FkT3B0aW9uc1BhbmUpO1xuXG4gICAgICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoVXBsb2FkT3B0aW9uc1BhbmUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihVcGxvYWRPcHRpb25zUGFuZSkpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVcGxvYWRPcHRpb25zUGFuZSwgW3tcbiAgICAgICAga2V5OiAndXBkYXRlRmllbGQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlRmllbGQoZk5hbWUsIGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMucHJvcHMuY29uZmlncztcblxuXG4gICAgICAgICAgICBpZiAoZk5hbWUgPT09ICdhdXRvc3RhcnQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZVN0YXJ0ID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19TVEFSVCcsICd1cGxvYWRfYXV0b19zZW5kJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdG9nZ2xlU3RhcnQgPSAhdG9nZ2xlU3RhcnQ7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9hdXRvX3NlbmQnLCB0b2dnbGVTdGFydCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZOYW1lID09PSAnYXV0b2Nsb3NlJykge1xuICAgICAgICAgICAgICAgIHZhciBfdG9nZ2xlU3RhcnQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX0NMT1NFJywgJ3VwbG9hZF9hdXRvX2Nsb3NlJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgX3RvZ2dsZVN0YXJ0ID0gIV90b2dnbGVTdGFydDtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2F1dG9fY2xvc2UnLCBfdG9nZ2xlU3RhcnQsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmTmFtZSA9PT0gJ2V4aXN0aW5nJykge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfZXhpc3RpbmcnLCBldmVudC50YXJnZXQuZ2V0U2VsZWN0ZWRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZk5hbWUgPT09ICdzaG93X3Byb2Nlc3NlZCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9nZ2xlU2hvd1Byb2Nlc3NlZCA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdVUExPQURfU0hPV19QUk9DRVNTRUQnLCAndXBsb2FkX3Nob3dfcHJvY2Vzc2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRvZ2dsZVNob3dQcm9jZXNzZWQgPSAhdG9nZ2xlU2hvd1Byb2Nlc3NlZDtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX3Nob3dfcHJvY2Vzc2VkJywgdG9nZ2xlU2hvd1Byb2Nlc3NlZCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmFuZG9tOiBNYXRoLnJhbmRvbSgpIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyYWRpb0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByYWRpb0NoYW5nZShlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnByb3BzLmNvbmZpZ3M7XG5cblxuICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9leGlzdGluZycsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByYW5kb206IE1hdGgucmFuZG9tKCkgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnByb3BzLmNvbmZpZ3M7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICB2YXIgdG9nZ2xlU3RhcnQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX1NUQVJUJywgJ3VwbG9hZF9hdXRvX3NlbmQnKTtcbiAgICAgICAgICAgIHZhciB0b2dnbGVDbG9zZSA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdERUZBVUxUX0FVVE9fQ0xPU0UnLCAndXBsb2FkX2F1dG9fY2xvc2UnKTtcbiAgICAgICAgICAgIHZhciBvdmVyd3JpdGVUeXBlID0gY29uZmlncy5nZXRPcHRpb24oJ0RFRkFVTFRfRVhJU1RJTkcnLCAndXBsb2FkX2V4aXN0aW5nJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlbjogdGhpcy5wcm9wcy5vcGVuLFxuICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogdGhpcy5wcm9wcy5hbmNob3JFbCxcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gb25SZXF1ZXN0Q2xvc2UoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLm9uRGlzbWlzcyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAzMjAsIHBhZGRpbmdCb3R0b206IDYgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlN1YmhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAnT3B0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgMTZweCcsIG1hcmdpblRvcDogLTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgc3R5bGU6IHsgbWFyZ2luOiAnOHB4IDAnIH0sIGNoZWNrZWQ6IHRvZ2dsZVN0YXJ0LCBsYWJlbFBvc2l0aW9uOiBcInJpZ2h0XCIsIG9uQ2hlY2s6IHRoaXMudXBkYXRlRmllbGQuYmluZCh0aGlzLCAnYXV0b3N0YXJ0JyksIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFszMzddLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgc3R5bGU6IHsgbWFyZ2luOiAnOHB4IDAnIH0sIGNoZWNrZWQ6IHRvZ2dsZUNsb3NlLCBsYWJlbFBvc2l0aW9uOiBcInJpZ2h0XCIsIG9uQ2hlY2s6IHRoaXMudXBkYXRlRmllbGQuYmluZCh0aGlzLCAnYXV0b2Nsb3NlJyksIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFszMzhdLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU3ViaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcnXVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAxNiwgZm9udFNpemU6IDE0LCBwYWRkaW5nVG9wOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdncm91cCcsIG5hbWU6ICdzaGlwU3BlZWQnLCBkZWZhdWx0U2VsZWN0ZWQ6IG92ZXJ3cml0ZVR5cGUsIG9uQ2hhbmdlOiB0aGlzLnJhZGlvQ2hhbmdlLmJpbmQodGhpcykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ2FsZXJ0JywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcuYWxlcnQnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIub3B0aW9ucy5leGlzdGluZy5mb2xkZXJzJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLm1lcmdlJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ292ZXJ3cml0ZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLm92ZXJ3cml0ZSddIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVwbG9hZE9wdGlvbnNQYW5lO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVXBsb2FkT3B0aW9uc1BhbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlRyYW5zZmVyc0xpc3QgPSBleHBvcnRzLkRyb3BVcGxvYWRlciA9IHVuZGVmaW5lZDtcblxudmFyIF9Ecm9wVXBsb2FkZXIgPSByZXF1aXJlKCcuL0Ryb3BVcGxvYWRlcicpO1xuXG52YXIgX0Ryb3BVcGxvYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Ecm9wVXBsb2FkZXIpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QgPSByZXF1aXJlKCcuL1RyYW5zZmVyc0xpc3QnKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyc0xpc3QpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLkRyb3BVcGxvYWRlciA9IF9Ecm9wVXBsb2FkZXIyLmRlZmF1bHQ7XG5leHBvcnRzLlRyYW5zZmVyc0xpc3QgPSBfVHJhbnNmZXJzTGlzdDIuZGVmYXVsdDtcbiJdfQ==
